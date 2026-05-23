import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";
import { recordPermissionPreflight } from "../permissionPolicy";

const riskLevels = ["low", "medium", "high", "blocked"] as const;
const targetKinds = ["public_url", "github_repo", "package", "file", "browser_site", "unknown"] as const;

type RiskLevel = (typeof riskLevels)[number];
type TargetKind = (typeof targetKinds)[number];

const trustedHosts = new Set([
  "github.com",
  "docs.github.com",
  "npmjs.com",
  "www.npmjs.com",
  "pypi.org",
  "crates.io",
  "go.dev",
]);

const securityStack = [
  {
    tool: "OpenSSF Scorecard",
    target: "GitHub repository trust posture.",
    status: "planned_adapter",
    source: "https://github.com/ossf/scorecard",
  },
  {
    tool: "OSV-Scanner",
    target: "Known vulnerable dependencies and lockfiles.",
    status: "planned_adapter",
    source: "https://github.com/google/osv-scanner",
  },
  {
    tool: "Datadog GuardDog",
    target: "Malicious npm, PyPI, Go module, GitHub Action, and VSCode extension signals.",
    status: "planned_adapter",
    source: "https://github.com/DataDog/guarddog",
  },
  {
    tool: "Gitleaks",
    target: "Leaked secrets in repo content.",
    status: "planned_adapter",
    source: "https://github.com/gitleaks/gitleaks",
  },
  {
    tool: "zizmor",
    target: "GitHub Actions workflow risk.",
    status: "planned_adapter",
    source: "https://github.com/zizmorcore/zizmor",
  },
  {
    tool: "Semgrep",
    target: "Suspicious JS, Python, shell, and config patterns.",
    status: "planned_adapter",
    source: "https://github.com/semgrep/semgrep",
  },
  {
    tool: "Phishing.Database and host blocklists",
    target: "Known phishing, malware, ad, tracker, and fake-download hosts.",
    status: "planned_feed",
    source: "https://github.com/Phishing-Database/Phishing.Database",
  },
];

function parseMaybeUrl(target: string): URL | null {
  try {
    return new URL(target);
  } catch {
    try {
      return new URL(`https://${target}`);
    } catch {
      return null;
    }
  }
}

function inferTargetKind(target: string, url: URL | null): TargetKind {
  const lower = target.toLowerCase();
  if (url?.hostname.toLowerCase() === "github.com" && url.pathname.split("/").filter(Boolean).length >= 2) {
    return "github_repo";
  }
  if (lower.startsWith("npm:") || lower.startsWith("pypi:") || lower.includes("npmjs.com/package/") || lower.includes("pypi.org/project/")) {
    return "package";
  }
  if (lower.match(/\.(exe|dmg|pkg|msi|zip|rar|7z|jar|appimage|deb|rpm)(\?|$)/)) return "file";
  if (lower.includes("anime") || lower.includes("stream") || lower.includes("watch")) return "browser_site";
  if (url) return "public_url";
  return "unknown";
}

function riskForTarget(target: string, kind: TargetKind, url: URL | null): {
  riskLevel: RiskLevel;
  findings: string[];
  allowedActions: string[];
  blockedActions: string[];
} {
  const lower = target.toLowerCase();
  const host = url?.hostname.toLowerCase() ?? "";
  const findings: string[] = [];
  const allowedActions = [
    "Record a security receipt.",
    "Read user-provided text and URL metadata.",
    "Show scanner plan before any browser, clone, install, or download action.",
  ];
  const blockedActions = [
    "No login.",
    "No credential entry.",
    "No downloads.",
    "No package install.",
    "No cloned-code execution.",
  ];
  let riskLevel: RiskLevel = "medium";

  if (!url && kind === "unknown") {
    findings.push("Target is not a valid URL, repo, package, or file reference.");
    return {
      riskLevel: "blocked",
      findings,
      allowedActions: ["Ask for a concrete URL, GitHub repo, package name, or file path."],
      blockedActions: ["No browsing, fetching, cloning, installing, or execution."],
    };
  }

  if (url && !["http:", "https:"].includes(url.protocol)) {
    findings.push("Only HTTP and HTTPS targets are allowed for browser/source review.");
    return {
      riskLevel: "blocked",
      findings,
      allowedActions: ["Record receipt only."],
      blockedActions: ["No non-HTTP browser target.", "No file protocol.", "No custom protocol."],
    };
  }

  if (kind === "github_repo") {
    findings.push("GitHub repo detected. Treat stars as weak signal. Inspect ownership, workflows, package scripts, lockfiles, binaries, and recent commits.");
    allowedActions.push("Run metadata-only GitHub review.", "Clone only into quarantine after approval.", "Run scanner adapters before Tony executes anything.");
    blockedActions.push("No npm install, pip install, shell scripts, build scripts, or GitHub Actions execution until Spock receipt is green.");
    riskLevel = "medium";
  }

  if (kind === "browser_site") {
    findings.push("Browser site likely needs ad, popup, tracker, and fake-download protection.");
    allowedActions.push("Open only in an isolated browser profile after approval.", "Block notifications, popups, downloads, camera, mic, geolocation, and third-party cookies.");
    blockedActions.push("No saved browser session.", "No extension install.", "No account login unless separately approved.");
    riskLevel = "high";
  }

  if (kind === "file") {
    findings.push("Downloadable or executable-looking file target detected.");
    allowedActions.push("Hash and scan an already-provided file after approval.");
    blockedActions.push("No open, mount, unzip, install, or execute.");
    riskLevel = "high";
  }

  if (kind === "package") {
    findings.push("Package target detected. Check age, maintainer, install scripts, dependency tree, and malware heuristics.");
    allowedActions.push("Run GuardDog and OSV-Scanner before install.");
    blockedActions.push("No install scripts.", "No lifecycle scripts.", "No global install.");
    riskLevel = "high";
  }

  if (url && trustedHosts.has(host) && kind !== "package") {
    findings.push("Host is a known platform, but platform trust does not make the linked project safe.");
    riskLevel = kind === "github_repo" ? "medium" : "low";
  }

  if (lower.includes("login") || lower.includes("verify") || lower.includes("wallet") || lower.includes("free-download")) {
    findings.push("Target text contains phishing or bait terms.");
    riskLevel = "high";
  }

  if (lower.includes("curl") && lower.includes("|") && lower.includes("sh")) {
    findings.push("Shell-pipe install pattern detected.");
    riskLevel = "blocked";
    blockedActions.push("No curl pipe to shell.");
  }

  if (host.startsWith("xn--") || host.includes("github.") && host !== "github.com") {
    findings.push("Possible homograph or lookalike domain.");
    riskLevel = "high";
  }

  if (findings.length === 0) findings.push("No deterministic red flag from the target string alone. Scanner pass still required before trust.");

  return { riskLevel, findings, allowedActions, blockedActions };
}

function checksFor(kind: TargetKind) {
  const checks = [
    "Normalize target and classify risk.",
    "Check for protocol, login, download, and lookalike-domain red flags.",
    "Require explicit approval before browser, clone, download, install, or execution.",
  ];
  if (kind === "github_repo") {
    checks.push("Run repo metadata review.", "Run Scorecard.", "Run Gitleaks.", "Run zizmor.", "Run OSV-Scanner.", "Run GuardDog when package manifests or actions exist.");
  }
  if (kind === "browser_site" || kind === "public_url") {
    checks.push("Check phishing and malware host feeds.", "Open with popup, notification, download, camera, mic, geolocation, and credential entry blocked.");
  }
  if (kind === "package") checks.push("Run GuardDog.", "Run OSV-Scanner.", "Block install scripts until approved.");
  if (kind === "file") checks.push("Hash file.", "Scan with YARA/ClamAV-style adapter when wired.", "Do not execute.");
  return checks;
}

function browserPolicyFor(kind: TargetKind, riskLevel: RiskLevel) {
  return {
    profile: "isolated_ephemeral",
    popupBlocking: true,
    adBlocking: "planned uBlock/adblock-rust style filter lane",
    blockNotifications: true,
    blockDownloads: riskLevel !== "low",
    blockCredentialEntry: true,
    blockCameraMicLocation: true,
    blockThirdPartyCookies: true,
    allowedWhen: kind === "browser_site" || kind === "public_url" ? "after explicit public-browser approval" : "not a browser target",
  };
}

export function receiptFor(target: string) {
  const url = parseMaybeUrl(target);
  const kind = inferTargetKind(target, url);
  const risk = riskForTarget(target, kind, url);
  return {
    targetUri: url?.toString() ?? target,
    targetKind: kind,
    riskLevel: risk.riskLevel,
    routeChain: ["Aang reads risk", "Cortana routes", "Spock gates", "Surfer waits", "Tony waits", "Oak validates if needed"],
    checks: checksFor(kind),
    findings: risk.findings,
    allowedActions: risk.allowedActions,
    blockedActions: risk.blockedActions,
    scannerPlan: securityStack,
    browserPolicy: browserPolicyFor(kind, risk.riskLevel),
  };
}

export function rowToSecurityReview(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    targetUri: String(row.target_uri),
    targetKind: String(row.target_kind),
    riskLevel: String(row.risk_level),
    status: String(row.status),
    ownerAgent: String(row.owner_agent),
    routeChain: JSON.parse(String(row.route_chain)) as string[],
    checks: JSON.parse(String(row.checks_json)) as string[],
    findings: JSON.parse(String(row.findings_json)) as string[],
    allowedActions: JSON.parse(String(row.allowed_actions_json)) as string[],
    blockedActions: JSON.parse(String(row.blocked_actions_json)) as string[],
    scannerPlan: JSON.parse(String(row.scanner_plan_json)) as typeof securityStack,
    browserPolicy: JSON.parse(String(row.browser_policy_json)) as ReturnType<typeof browserPolicyFor>,
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    sourceId: row.source_id == null ? null : Number(row.source_id),
    sourceTitle: row.source_title == null ? null : String(row.source_title),
    sourceUri: row.source_uri == null ? null : String(row.source_uri),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    createdAt: Number(row.created_at),
  };
}

export const securityGateRouter = router({
  plan: publicProcedure.query(() => ({
    mode: "proposal_only",
    ownerAgent: "spock",
    defaultPosture: "Untrusted until checked. Browser, clone, download, install, and execution stay gated.",
    routeChain: ["Aang reads risk", "Cortana routes", "Spock gates", "Surfer browses only after receipt", "Tony runs only after second approval"],
    protectedSurfaces: [
      "Pasted URLs.",
      "GitHub repos.",
      "Package installs.",
      "Anime and streaming sites with ads or fake buttons.",
      "Downloads and archives.",
      "Browser permissions.",
      "Credential prompts.",
    ],
    scannerPlan: securityStack,
    browserBaseline: browserPolicyFor("browser_site", "high"),
    gates: [
      "No browser target opens from this plan.",
      "No repo is cloned from this plan.",
      "No package is installed from this plan.",
      "Security tools are also attack surfaces. Pin versions and keep scanner execution isolated.",
    ],
  })),

  inspectTarget: publicProcedure
    .input(z.object({ target: z.string().min(1).max(2000) }))
    .mutation(({ input }) => ({
      mode: "proposal_only",
      writesExternal: false,
      opensBrowser: false,
      clonesRepo: false,
      downloadsFile: false,
      executesCommand: false,
      receipt: receiptFor(input.target),
    })),

  createReview: publicProcedure
    .input(
      z.object({
        target: z.string().min(1).max(2000),
        projectId: z.number().int().optional(),
        sourceId: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const receipt = receiptFor(input.target);
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: "explicit_context",
        actionClass: "local_note",
        sensitiveData: false,
        externalTarget: false,
        requestedByAgent: "spock",
        targetSummary: receipt.targetUri,
        additionalReasons: [
          "Security receipt records local review state only.",
          "Browser, clone, download, install, and execution need separate approval.",
        ],
      });
      const result = await db.execute({
        sql: `
          INSERT INTO security_review_records (
            target_uri, target_kind, risk_level, status, owner_agent, route_chain,
            checks_json, findings_json, allowed_actions_json, blocked_actions_json,
            scanner_plan_json, browser_policy_json, permission_preflight_id,
            source_id, project_id
          )
          VALUES (?, ?, ?, 'receipt', 'spock', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          receipt.targetUri,
          receipt.targetKind,
          receipt.riskLevel,
          JSON.stringify(receipt.routeChain),
          JSON.stringify(receipt.checks),
          JSON.stringify(receipt.findings),
          JSON.stringify(receipt.allowedActions),
          JSON.stringify(receipt.blockedActions),
          JSON.stringify(receipt.scannerPlan),
          JSON.stringify(receipt.browserPolicy),
          Number(preflight.row.id),
          input.sourceId ?? null,
          input.projectId ?? null,
        ],
      });
      const row = result.rows[0];
      const joined = row
        ? await db.execute({
            sql: `
              SELECT srr.*, src.title AS source_title, src.uri AS source_uri, p.name AS project_name
              FROM security_review_records srr
              LEFT JOIN sources src ON src.id = srr.source_id
              LEFT JOIN projects p ON p.id = srr.project_id
              WHERE srr.id = ?
              LIMIT 1
            `,
            args: [Number(row.id)],
          })
        : null;
      return {
        ok: Boolean(row),
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        clonesRepo: false,
        downloadsFile: false,
        executesCommand: false,
        review: joined?.rows[0] ? rowToSecurityReview(joined.rows[0]) : row ? rowToSecurityReview(row) : null,
        permissionPreflightId: Number(preflight.row.id),
        gates: [
          "Recorded one local Spock security receipt.",
          "This did not open a browser, clone a repo, download a file, install a package, or execute commands.",
          "Surfer and Tony still need explicit approval for browser or execution paths.",
        ],
      };
    }),

  recent: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional())
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const rows = await db.execute({
        sql: `
          SELECT srr.*, src.title AS source_title, src.uri AS source_uri, p.name AS project_name
          FROM security_review_records srr
          LEFT JOIN sources src ON src.id = srr.source_id
          LEFT JOIN projects p ON p.id = srr.project_id
          ORDER BY srr.created_at DESC, srr.id DESC
          LIMIT ?
        `,
        args: [input?.limit ?? 20],
      });
      return {
        mode: "read_only",
        appendOnly: true,
        items: rows.rows.map(rowToSecurityReview),
      };
    }),
});
