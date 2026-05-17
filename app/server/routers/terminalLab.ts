import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, getOrCreateProjectByPath } from "../cerebroDb";
import { recordPermissionPreflight } from "../permissionPolicy";

const knownProjects = [
  { name: "Declyne", path: "/Users/lindsaybell/Developer/Declyne" },
  { name: "Waymark", path: "/Users/lindsaybell/Developer/Waymark" },
  { name: "Sygnalist", path: "/Users/lindsaybell/Developer/sygnalist-brain" },
  { name: "Bridgefour", path: "/Users/lindsaybell/Developer/bridgefour" },
  { name: "CereBro", path: "/Users/lindsaybell/Desktop/CereBro" },
];

const readOnlyCommands = new Set([
  "cat",
  "date",
  "df",
  "du",
  "find",
  "git",
  "ls",
  "pwd",
  "rg",
  "sed",
  "stat",
  "tail",
  "tree",
  "wc",
  "which",
]);

const writeFirstTokens = new Set([
  "apply_patch",
  "chmod",
  "chown",
  "cp",
  "gh",
  "mkdir",
  "mv",
  "rm",
  "rmdir",
  "touch",
  "tee",
]);

const writeLikePhrases = [
  "git add",
  "git checkout",
  "git commit",
  "git push",
  "npm install",
  "pnpm add",
  "pnpm install",
  ">",
  ">>",
];

const destructiveTokens = [
  "rm -rf",
  "git reset",
  "git checkout --",
  "git clean",
  "drop table",
  "truncate table",
];

const observationStatuses = ["previewed", "observed", "reviewing", "blocked", "tasked", "learned", "archived"] as const;

function firstToken(command: string) {
  return command.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}

function includesToken(command: string, tokens: readonly string[]) {
  const normalized = command.toLowerCase();
  return tokens.some((token) => normalized.includes(token));
}

function isGitWriteCommand(command: string) {
  const normalized = command.trim().toLowerCase();
  return /^git\s+(add|commit|push|checkout|reset|clean|merge|rebase|tag|branch\s+-d|branch\s+-D)\b/.test(normalized);
}

type CommandObservation = {
  id: number;
  projectId: number | null;
  taskId: number | null;
  sessionId: number | null;
  command: string;
  cwd: string | null;
  risk: string;
  suggestedAgent: string | null;
  explanation: string | null;
  gates: string[];
  source: string;
  status: string;
  exitCode: number | null;
  outputSummary: string | null;
  createdAt: number;
};

function rowToObservation(row: Record<string, unknown>) {
  const source = String(row.source);
  const diagnosticMatch = source.match(/^terminal_lab_diagnostic:(\d+)(?::root:(\d+):depth:(\d+))?$/);
  const diagnosticParentId = diagnosticMatch ? Number(diagnosticMatch[1]) : null;
  const diagnosticRootId = diagnosticMatch?.[2] ? Number(diagnosticMatch[2]) : diagnosticParentId;
  const diagnosticDepth = diagnosticMatch?.[3] ? Number(diagnosticMatch[3]) : diagnosticParentId == null ? null : 1;
  const diagnosticStatus = Number.isFinite(diagnosticParentId)
    ? "diagnostic_preview"
    : null;
  const observation = {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    command: String(row.command),
    cwd: row.cwd == null ? null : String(row.cwd),
    risk: String(row.risk),
    suggestedAgent: row.suggested_agent == null ? null : String(row.suggested_agent),
    explanation: row.explanation == null ? null : String(row.explanation),
    gates: row.gates == null ? [] : String(row.gates).split("\n").filter(Boolean),
    source,
    diagnosticParentId: Number.isFinite(diagnosticParentId) ? diagnosticParentId : null,
    diagnosticRootId: Number.isFinite(diagnosticRootId) ? diagnosticRootId : null,
    diagnosticDepth: Number.isFinite(diagnosticDepth) ? diagnosticDepth : null,
    diagnosticStatus,
    status: String(row.status),
    exitCode: row.exit_code == null ? null : Number(row.exit_code),
    outputSummary: row.output_summary == null ? null : String(row.output_summary),
    createdAt: Number(row.created_at),
  };
  const gitWrite = isGitWriteCommand(observation.command);
  return {
    ...observation,
    gitWrite,
    projectLabRouteRecommended: gitWrite,
    projectLabRouteReason: gitWrite
      ? "Git write commands belong in Project Lab push context before any execution proposal."
      : null,
    followUps: buildFollowUps(observation),
    diagnosticDrafts: buildDiagnosticDrafts(observation),
  };
}

function rowToApprovalPreview(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    actionType: String(row.action_type),
    targetType: row.target_type == null ? null : String(row.target_type),
    targetId: row.target_id == null ? null : Number(row.target_id),
    requestedByAgent: row.requested_by_agent == null ? null : String(row.requested_by_agent),
    status: String(row.status),
    reason: row.reason == null ? null : String(row.reason),
    contextSummary: row.context_summary == null ? null : String(row.context_summary),
    sensitiveDataFlag: Boolean(row.sensitive_data_flag),
    costRisk: row.cost_risk == null ? null : String(row.cost_risk),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
    createdAt: Number(row.created_at),
  };
}

function buildFollowUps(observation: CommandObservation) {
  const followUps: Array<{
    agent: "aang" | "tony";
    title: string;
    reason: string;
    approvalGate: string;
  }> = [];

  if (!observation.outputSummary) {
    followUps.push({
      agent: "aang",
      title: "Explain before running",
      reason: "Aang can translate the command and expected output before it is run through the normal Codex path.",
      approvalGate: "No execution from Terminal Lab.",
    });
    return followUps;
  }

  if (observation.exitCode != null && observation.exitCode !== 0) {
    followUps.push({
      agent: "aang",
      title: "Explain the failure",
      reason: "The observed exit code is non-zero, so the next useful step is understanding the error shape in plain language.",
      approvalGate: "Uses the saved local summary only.",
    });
    followUps.push({
      agent: "tony",
      title: "Propose a diagnostic command",
      reason: "Tony can suggest a narrow read-only follow-up command before any fix or write is attempted.",
      approvalGate: "Any actual command still runs through Codex approval.",
    });
    return followUps;
  }

  if (/\b(no such file|not found|failed|error|exception|denied)\b/i.test(observation.outputSummary)) {
    followUps.push({
      agent: "aang",
      title: "Translate the error text",
      reason: "The output summary contains error-like language even though Terminal Lab did not execute the command.",
      approvalGate: "Uses the pasted local summary only.",
    });
    followUps.push({
      agent: "tony",
      title: "Suggest the smallest inspection",
      reason: "Tony can propose a read-only check to confirm path, dependency, or permission state.",
      approvalGate: "Any actual command still runs through Codex approval.",
    });
    return followUps;
  }

  followUps.push({
    agent: "aang",
    title: "Summarize what changed in understanding",
    reason: "The command has a saved output summary, so Aang can turn it into a short learning note or explanation.",
    approvalGate: "Saving durable memory still requires the normal approval path.",
  });
  followUps.push({
    agent: "tony",
    title: "Propose the next project step",
    reason: "Tony can use the observed result, task link, and session link to suggest the next safe implementation or verification move.",
    approvalGate: "No repo edits or command execution from Terminal Lab.",
  });
  return followUps;
}

function shellQuote(value: string) {
  return `"${value.replace(/["\\]/g, "\\$&")}"`;
}

function likelyPathFromObservation(observation: CommandObservation) {
  const outputPath = observation.outputSummary?.match(/\b([./A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/)?.[1];
  if (outputPath) return outputPath;
  return observation.command.match(/\s([./A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)(?:\s|$)/)?.[1] ?? null;
}

function buildDiagnosticDrafts(observation: CommandObservation) {
  const drafts: Array<{
    title: string;
    command: string;
    reason: string;
    evidence: string;
    expectedSignal: string;
    approvalGate: string;
  }> = [];
  const summary = observation.outputSummary ?? "";
  const command = observation.command.toLowerCase();
  const pathHint = likelyPathFromObservation(observation);
  const packageFailure = /\b(pnpm|npm|yarn|vite|vitest|tsx|tsc|typescript|eslint)\b/i.test(summary)
    || /\b(pnpm|npm|yarn|vite|vitest|tsx|tsc|eslint)\b/.test(command);
  const moduleMatch = summary.match(/(?:Cannot find module|Module not found|ERR_MODULE_NOT_FOUND|Cannot find package)\s+['"]?(@?[\w./-]+)['"]?/i);
  const missingSymbolMatch = summary.match(/(?:Cannot find name|has no exported member|Property ['"]?([\w$]+)['"]? does not exist|Cannot find name ['"]?([\w$]+)['"]?)/i);
  const portMatch = summary.match(/\b(?:EADDRINUSE|address already in use|port\s+(\d{2,5})\s+is already in use|localhost:(\d{2,5}))\b/i);

  if (portMatch) {
    const port = portMatch[1] ?? portMatch[2] ?? "3000";
    drafts.push({
      title: "Inspect the occupied port",
      command: `lsof -nP -iTCP:${port} -sTCP:LISTEN`,
      reason: "Port conflicts should start by identifying the listener before stopping anything or changing app config.",
      evidence: `Observed output mentions a port conflict around ${port}.`,
      expectedSignal: "Shows the local process, PID, and command currently listening on that port.",
      approvalGate: "Suggested only. Read-only inspection still runs through Codex if approved.",
    });
    return drafts;
  }

  if (moduleMatch) {
    const moduleName = moduleMatch[1];
    drafts.push({
      title: "Find the import reference",
      command: `rg -n ${shellQuote(moduleName)} .`,
      reason: "A missing module/package error should first be tied to the file that imports it before installing or editing anything.",
      evidence: `Observed output names missing module or package ${moduleName}.`,
      expectedSignal: "Shows the local import/reference sites that need dependency, path, or export review.",
      approvalGate: "Suggested only. No package install or code edit is implied.",
    });
    drafts.push({
      title: "Inspect package manifests",
      command: "find . -maxdepth 3 -name package.json -o -name pnpm-lock.yaml -o -name package-lock.json",
      reason: "Package failures need a read-only map of manifests and lockfiles before Tony proposes dependency changes.",
      evidence: "The failure looks dependency or module-resolution related.",
      expectedSignal: "Shows which package manager files are present near the current workspace.",
      approvalGate: "Suggested only. Installing packages remains a separate approval-gated action.",
    });
    return drafts;
  }

  if (missingSymbolMatch) {
    const symbol = missingSymbolMatch[1] ?? missingSymbolMatch[2];
    drafts.push({
      title: "Locate the missing symbol",
      command: `rg -n ${shellQuote(symbol)} .`,
      reason: "TypeScript/symbol errors should start with a read-only reference search before edits.",
      evidence: `Observed output names missing or mismatched symbol ${symbol}.`,
      expectedSignal: "Shows definition and usage candidates so Tony can identify rename, import, or type drift.",
      approvalGate: "Suggested only. No code edit is performed.",
    });
    return drafts;
  }

  if (packageFailure && /\b(failed|error|exception|ELIFECYCLE|Command failed)\b/i.test(summary)) {
    drafts.push({
      title: "Inspect package scripts",
      command: "node -e \"const p=require('./package.json'); console.log(JSON.stringify(p.scripts||{}, null, 2))\"",
      reason: "Script failures should be grounded in the exact package script before Tony proposes a next command.",
      evidence: "Observed output looks like a Node/package-tool failure.",
      expectedSignal: "Shows the local package scripts without installing packages or modifying files.",
      approvalGate: "Suggested only. Node executes a local read of package.json and still needs normal approval.",
    });
    drafts.push({
      title: "Check runtime versions",
      command: "node -v && pnpm -v",
      reason: "Version mismatches can explain package-tool failures, and this is the smallest environment check.",
      evidence: "The command/output mentions package tooling or a JS/TS test/build step.",
      expectedSignal: "Shows local Node and pnpm versions for comparison with repo requirements.",
      approvalGate: "Suggested only. Read-only version checks still run through Codex if approved.",
    });
    return drafts;
  }

  if (/\b(no such file|not found)\b/i.test(summary) && pathHint) {
    drafts.push({
      title: "Confirm current directory",
      command: "pwd",
      reason: "A missing path is often a cwd mismatch; confirm the command would run from the expected directory first.",
      evidence: `Observed output mentions missing path ${pathHint}.`,
      expectedSignal: "Confirms whether the command was run from the expected project folder.",
      approvalGate: "Suggested only. Run through Codex if approved.",
    });
    drafts.push({
      title: "Look for the missing file",
      command: `find . -maxdepth 4 -name ${shellQuote(pathHint.split("/").pop() ?? pathHint)}`,
      reason: "This read-only search checks whether the named file exists elsewhere nearby before any fix is proposed.",
      evidence: `Observed output mentions missing path ${pathHint}.`,
      expectedSignal: "Shows whether a same-named file exists elsewhere in the local tree.",
      approvalGate: "Suggested only. Run through Codex if approved.",
    });
    return drafts;
  }

  if (/\b(permission denied|denied|eacces)\b/i.test(summary)) {
    drafts.push({
      title: "Inspect file metadata",
      command: pathHint ? `stat ${shellQuote(pathHint)}` : "ls -la",
      reason: "Permission-looking failures should start with read-only metadata before chmod/chown or other mutation is considered.",
      evidence: "Observed output includes permission-denied language.",
      expectedSignal: "Shows ownership, mode, and file metadata without changing permissions.",
      approvalGate: "Suggested only. Run through Codex if approved.",
    });
    return drafts;
  }

  if (command.startsWith("git ") || /\bgit\b/i.test(summary)) {
    drafts.push({
      title: "Inspect git state",
      command: "git status --short --branch",
      reason: "Git-related observations should be grounded in the current branch and dirty state before Tony proposes changes.",
      evidence: "The command or output mentions git.",
      expectedSignal: "Shows branch/upstream and dirty state without committing, resetting, or touching files.",
      approvalGate: "Suggested only. Run through Codex if approved.",
    });
    return drafts;
  }

  if (observation.exitCode != null && observation.exitCode !== 0) {
    drafts.push({
      title: "List nearby files",
      command: "ls",
      reason: "A narrow directory listing is the smallest read-only next check when the failure shape is unclear.",
      evidence: `Observed non-zero exit code ${observation.exitCode}.`,
      expectedSignal: "Shows immediate local context so Tony can choose a narrower next diagnostic.",
      approvalGate: "Suggested only. Run through Codex if approved.",
    });
  }

  return drafts;
}

function summarizeOutput(output: string) {
  return output
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\b(token|secret|password|api[_-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000);
}

async function inferProjectIdFromCwd(cwd: string | null | undefined) {
  if (!cwd) return null;
  const project = knownProjects.find((candidate) => cwd === candidate.path || cwd.startsWith(`${candidate.path}/`));
  if (!project) return null;
  return getOrCreateProjectByPath(project.name, project.path);
}

async function recordCommandObservation(input: {
  command: string;
  cwd?: string | null;
  projectId?: number | null;
  taskId?: number | null;
  sessionId?: number | null;
  risk: string;
  suggestedAgent: string;
  explanation: string;
  gates: string[];
  source?: string;
}) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      INSERT INTO command_observations (
        project_id, task_id, session_id, command, cwd, risk, suggested_agent,
        explanation, gates, source, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'previewed')
      RETURNING id
    `,
    args: [
      input.projectId ?? null,
      input.taskId ?? null,
      input.sessionId ?? null,
      input.command,
      input.cwd ?? null,
      input.risk,
      input.suggestedAgent,
      input.explanation,
      input.gates.join("\n"),
      input.source ?? "terminal_lab_preview",
    ],
  });
  return Number(result.rows[0]!.id);
}

async function commandObservationById(id: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, project_id, task_id, session_id, command, cwd, risk,
             suggested_agent, explanation, gates, source, status,
             exit_code, output_summary, created_at
      FROM command_observations
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToObservation(row) : null;
}

function classifyCommand(command: string) {
  const normalized = command.trim().toLowerCase();
  const token = firstToken(normalized);
  const isDestructive = includesToken(normalized, destructiveTokens);
  const gitWrite = isGitWriteCommand(normalized);
  const writes = writeFirstTokens.has(token) || includesToken(normalized, writeLikePhrases);
  const reads = readOnlyCommands.has(token) && !writes && !isDestructive;
  const needsNetworkApproval =
    normalized.includes("curl ") ||
    normalized.includes("wget ") ||
    normalized.includes("pnpm install") ||
    normalized.includes("npm install") ||
    normalized.includes("pnpm add") ||
    normalized.includes("gh ");

  const gates = ["Terminal Lab preview does not execute commands."];
  if (isDestructive) gates.push("Destructive commands require explicit approval and a narrow explanation.");
  if (gitWrite) gates.push("Git write commands route to Project Lab push context before any execution proposal.");
  if (writes && !isDestructive) gates.push("Commands that write files, install packages, or mutate git state require approval.");
  if (needsNetworkApproval) gates.push("Network, package install, and GitHub operations require approval when run.");
  if (reads) gates.push("Read-only inspection can be suggested, but execution still happens through the approved Codex command path.");

  const suggestedAgent = isDestructive
    ? "piccolo"
    : writes || needsNetworkApproval
      ? "tony"
      : reads
        ? "aang"
        : "cortana";

  const explanation = isDestructive
    ? "This looks destructive or history-altering. Piccolo should review cleanup/revert intent before anything runs."
    : writes
      ? "This appears to mutate files, dependencies, git state, or local system state. Tony can propose it, but execution remains approval-gated."
      : needsNetworkApproval
        ? "This likely reaches outside the local workspace. Surfer/Tony can explain it, then approval is needed before running."
        : reads
          ? "This looks like a read-only inspection command. Aang can explain what it reveals before Tony acts on it."
          : "This command is not in the first-pass allowlist. Treat it as proposal-only until an agent explains the risk.";

  return {
    command: command.trim(),
    firstToken: token || "unknown",
    risk: isDestructive ? "destructive" : writes || needsNetworkApproval ? "mutating_or_external" : reads ? "read_only" : "unknown",
    gitWrite,
    projectLabRouteRecommended: gitWrite,
    projectLabRouteReason: gitWrite
      ? "Git write commands belong in Project Lab push context. Review branch, dirty state, Workbench body, and approval receipt before any push path."
      : null,
    suggestedAgent,
    wouldExecute: false,
    approvalRequiredToRun: true,
    gates,
    explanation,
  };
}

export const terminalLabRouter = router({
  plan: publicProcedure.query(() => ({
    mode: "proposal_only",
    ownerAgent: "tony",
    supportAgents: ["aang", "piccolo", "spock"],
    surfaces: [
      {
        id: "history",
        label: "Command history",
        status: "local_persistence",
        notes: "Previewed commands are stored locally with command, cwd, risk, gates, timestamp, and project link when known.",
      },
      {
        id: "output",
        label: "Observed output",
        status: "local_persistence",
        notes: "Pasted command output can be summarized onto an existing local observation. Terminal Lab still does not run commands.",
      },
      {
        id: "explain",
        label: "Aang explanation",
        status: "live_preview",
        notes: "Explain what a command is expected to do before it runs.",
      },
      {
        id: "suggest",
        label: "Tony suggestion",
        status: "live_preview",
        notes: "Classify read-only vs mutating/external/destructive commands and suggest the owner agent.",
      },
      {
        id: "approval",
        label: "Approval gates",
        status: "live_preview",
        notes: "No command execution from this panel. It only shows gates required before Codex runs anything.",
      },
    ],
    policies: [
      "No shell execution from Terminal Lab in this slice.",
      "Preview observations are persisted locally; pasted output summaries can be attached manually.",
      "No background or agent-triggered commands without a visible approval step.",
      "Destructive commands remain blocked unless the user explicitly asks and approves the exact operation.",
      "Network, package install, GitHub, Slack, Notion, and external repo actions keep their normal approval gates.",
    ],
  })),

  previewCommand: publicProcedure
    .input(
      z.object({
        command: z.string().min(1).max(1000),
        cwd: z.string().min(1).max(1000).optional(),
        projectId: z.number().int().optional(),
        taskId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const preview = classifyCommand(input.command);
      const projectId = input.projectId ?? (await inferProjectIdFromCwd(input.cwd));
      const observationId = await recordCommandObservation({
        ...preview,
        cwd: input.cwd ?? null,
        projectId,
        taskId: input.taskId ?? null,
        sessionId: input.sessionId ?? null,
      });
      return {
        ...preview,
        observationId,
        persisted: true,
        projectId,
      };
    }),

  observations: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().int().optional(),
          taskId: z.number().int().optional(),
          sessionId: z.number().int().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      if (input?.projectId !== undefined) {
        where.push("project_id = ?");
        args.push(input.projectId);
      }
      if (input?.taskId !== undefined) {
        where.push("task_id = ?");
        args.push(input.taskId);
      }
      if (input?.sessionId !== undefined) {
        where.push("session_id = ?");
        args.push(input.sessionId);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT id, project_id, task_id, session_id, command, cwd, risk,
                 suggested_agent, explanation, gates, source, status,
                 exit_code, output_summary, created_at
          FROM command_observations
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToObservation);
    }),

  observationDetail: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const observation = await commandObservationById(input.id);
      if (!observation) {
        return {
          found: false as const,
          id: input.id,
          writesExternal: false,
          wouldExecute: false,
          gates: ["No saved command observation exists for this id."],
        };
      }
      return {
        found: true as const,
        writesExternal: false,
        wouldExecute: false,
        statusOptions: observationStatuses,
        observation,
        gates: [
          "This is local Terminal Lab metadata only.",
          "Changing status does not execute, approve, or schedule a command.",
          "Pending approval previews remain local records until the user explicitly approves a real Codex run.",
        ],
      };
    }),

  updateObservationStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(observationStatuses),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          UPDATE command_observations
          SET status = ?
          WHERE id = ?
          RETURNING id, project_id, task_id, session_id, command, cwd, risk,
                    suggested_agent, explanation, gates, source, status,
                    exit_code, output_summary, created_at
        `,
        args: [input.status, input.id],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        writesExternal: false,
        wouldExecute: false,
        observation: row ? rowToObservation(row) : null,
      };
    }),

  createApprovalPreviewFromObservation: publicProcedure
    .input(
      z.object({
        observationId: z.number().int(),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const observation = await commandObservationById(input.observationId);
      if (!observation) {
        return {
          ok: false,
          writesExternal: false,
          wouldExecute: false,
          reason: "No saved command observation exists for this id.",
        };
      }
      const db = await getCerebroDb();
      const actionType =
        observation.risk === "read_only"
          ? "terminal_read_only_command"
          : observation.risk === "destructive"
            ? "terminal_destructive_command"
            : "terminal_mutating_or_external_command";
      const contextSummary = [
        `Command: ${observation.command}`,
        observation.cwd ? `Working directory: ${observation.cwd}` : null,
        `Risk: ${observation.risk}`,
        observation.explanation ? `Explanation: ${observation.explanation}` : null,
        observation.outputSummary ? `Observed output summary: ${observation.outputSummary}` : null,
        observation.exitCode != null ? `Exit code: ${observation.exitCode}` : null,
      ].filter(Boolean).join("\n");
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: "terminal_logs",
        actionClass: "command_execution",
        destructive: observation.risk === "destructive",
        externalTarget: observation.risk === "mutating_or_external",
        requestedByAgent: observation.suggestedAgent ?? "tony",
        targetSummary: `Terminal Lab command preview: ${observation.command}`,
        additionalReasons: [
          "Terminal Lab approval previews are local metadata only.",
          "The command must still run through the normal Codex approval-gated path.",
        ],
      });
      const result = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            status, reason, context_summary, sensitive_data_flag, cost_risk,
            permission_preflight_id
          )
          VALUES (?, ?, 'command_observation', ?, ?, 'pending', ?, ?, 0, ?, ?)
          RETURNING id, task_id, action_type, target_type, target_id,
                    requested_by_agent, status, reason, context_summary,
                    sensitive_data_flag, cost_risk, permission_preflight_id,
                    decided_at, created_at
        `,
        args: [
          observation.taskId,
          actionType,
          observation.id,
          observation.suggestedAgent ?? "tony",
          input.reason ?? "Local Terminal Lab approval preview only. This does not run or approve the command.",
          contextSummary,
          observation.risk === "read_only" ? "local_read_only_command_review" : "command_execution_requires_explicit_review",
          Number(preflight.row.id),
        ],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        writesExternal: false,
        wouldExecute: false,
        approval: row ? rowToApprovalPreview(row) : null,
        gates: [
          "This is a pending local approval record only.",
          "Recorded one local permission preflight audit row for this approval preview.",
          "It does not execute the command or approve a future run.",
          "The command must still be run through the normal Codex approval-gated path.",
        ],
      };
    }),

  approvalPreviews: publicProcedure
    .input(
      z
        .object({
          observationId: z.number().int().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = ["target_type = 'command_observation'"];
      const args: (number | string)[] = [];
      if (input?.observationId !== undefined) {
        where.push("target_id = ?");
        args.push(input.observationId);
      }
      args.push(input?.limit ?? 10);
      const result = await db.execute({
        sql: `
          SELECT id, task_id, action_type, target_type, target_id,
                 requested_by_agent, status, reason, context_summary,
                 sensitive_data_flag, cost_risk, permission_preflight_id,
                 decided_at, created_at
          FROM approvals
          WHERE ${where.join(" AND ")}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToApprovalPreview);
    }),

  linkObservation: publicProcedure
    .input(
      z.object({
        observationId: z.number().int(),
        taskId: z.number().int().nullable().optional(),
        sessionId: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      let projectId: number | null = null;
      if (input.taskId != null) {
        const task = await db.execute({
          sql: `SELECT project_id FROM tasks WHERE id = ? LIMIT 1`,
          args: [input.taskId],
        });
        const row = task.rows[0];
        if (row?.project_id != null) projectId = Number(row.project_id);
      }
      if (projectId == null && input.sessionId != null) {
        const session = await db.execute({
          sql: `SELECT project_id FROM sessions WHERE id = ? LIMIT 1`,
          args: [input.sessionId],
        });
        const row = session.rows[0];
        if (row?.project_id != null) projectId = Number(row.project_id);
      }

      const result = await db.execute({
        sql: `
          UPDATE command_observations
          SET task_id = ?,
              session_id = ?,
              project_id = COALESCE(?, project_id)
          WHERE id = ?
          RETURNING id, project_id, task_id, session_id, command, cwd, risk,
                    suggested_agent, explanation, gates, source, status,
                    exit_code, output_summary, created_at
        `,
        args: [input.taskId ?? null, input.sessionId ?? null, projectId, input.observationId],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        observation: row ? rowToObservation(row) : null,
        writesExternal: false,
        wouldExecute: false,
      };
    }),

  observeOutput: publicProcedure
    .input(
      z.object({
        observationId: z.number().int(),
        output: z.string().min(1).max(12000),
        exitCode: z.number().int().min(0).max(255).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const summary = summarizeOutput(input.output);
      const result = await db.execute({
        sql: `
          UPDATE command_observations
          SET output_summary = ?,
              exit_code = ?,
              status = 'observed'
          WHERE id = ?
          RETURNING id, project_id, task_id, session_id, command, cwd, risk,
                    suggested_agent, explanation, gates, source, status,
                    exit_code, output_summary, created_at
        `,
        args: [summary, input.exitCode ?? null, input.observationId],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        observation: row ? rowToObservation(row) : null,
        writesExternal: false,
        wouldExecute: false,
      };
    }),

  previewDiagnosticDraft: publicProcedure
    .input(
      z.object({
        observationId: z.number().int(),
        command: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input }) => {
      const parent = await commandObservationById(input.observationId);
      if (!parent) {
        return {
          ok: false,
          reason: "No saved command observation exists for this id.",
          writesExternal: false,
          wouldExecute: false,
        };
      }

      const diagnostic = parent.diagnosticDrafts.find((draft) => draft.command === input.command.trim());
      if (!diagnostic) {
        return {
          ok: false,
          reason: "That command is not one of Tony's current diagnostic drafts for this observation.",
          writesExternal: false,
          wouldExecute: false,
        };
      }

      const preview = classifyCommand(diagnostic.command);
      const diagnosticDepth = (parent.diagnosticDepth ?? 0) + 1;
      const diagnosticRootId = parent.diagnosticRootId ?? parent.id;
      const gates = [
        ...preview.gates,
        "This preview was created from Tony's diagnostic draft; it still does not execute.",
        diagnostic.approvalGate,
        `Diagnostic chain: root #${diagnosticRootId}, parent #${parent.id}, depth ${diagnosticDepth}.`,
      ];
      const observationId = await recordCommandObservation({
        ...preview,
        cwd: parent.cwd,
        projectId: parent.projectId,
        taskId: parent.taskId,
        sessionId: parent.sessionId,
        gates,
        source: `terminal_lab_diagnostic:${parent.id}:root:${diagnosticRootId}:depth:${diagnosticDepth}`,
      });

      return {
        ok: true,
        writesExternal: false,
        ...preview,
        gates,
        observationId,
        persisted: true,
        projectId: parent.projectId,
        taskId: parent.taskId,
        sessionId: parent.sessionId,
        parentObservationId: parent.id,
        diagnosticRootId,
        diagnosticDepth,
        handoffNote:
          "Tony's diagnostic draft was converted into a normal Terminal Lab preview. Run it only through the regular Codex approval path.",
      };
    }),

  createTaskFromObservation: publicProcedure
    .input(z.object({ observationId: z.number().int() }))
    .mutation(async ({ input }) => {
      const observation = await commandObservationById(input.observationId);
      if (!observation) {
        return {
          ok: false,
          reason: "No saved command observation exists for this id.",
          writesExternal: false,
          wouldExecute: false,
        };
      }

      const titleBase = observation.outputSummary
        ? observation.outputSummary.slice(0, 96)
        : observation.command.slice(0, 96);
      const agent =
        observation.exitCode != null && observation.exitCode !== 0
          ? "tony"
          : /\b(no such file|not found|failed|error|exception|denied)\b/i.test(observation.outputSummary ?? "")
            ? "tony"
            : observation.risk === "read_only"
              ? "aang"
              : "tony";
      const db = await getCerebroDb();
      const task = await db.execute({
        sql: `
          INSERT INTO tasks (project_id, session_id, title, agent)
          VALUES (?, ?, ?, ?)
          RETURNING id, project_id, session_id, title, status, agent, created_at, updated_at
        `,
        args: [observation.projectId, observation.sessionId, `Follow up terminal observation: ${titleBase}`, agent],
      });
      const taskId = Number(task.rows[0]!.id);
      await db.execute({
        sql: `
          UPDATE command_observations
          SET task_id = ?,
              status = 'tasked'
          WHERE id = ?
        `,
        args: [taskId, input.observationId],
      });

      return {
        ok: true,
        writesExternal: false,
        wouldExecute: false,
        task: {
          id: taskId,
          projectId: observation.projectId,
          sessionId: observation.sessionId,
          title: String(task.rows[0]!.title),
          status: String(task.rows[0]!.status),
          agent: task.rows[0]!.agent == null ? null : String(task.rows[0]!.agent),
        },
        observation: await commandObservationById(input.observationId),
      };
    }),

  createLearningProposalFromObservation: publicProcedure
    .input(z.object({ observationId: z.number().int() }))
    .mutation(async ({ input }) => {
      const observation = await commandObservationById(input.observationId);
      if (!observation) {
        return {
          ok: false,
          reason: "No saved command observation exists for this id.",
          writesExternal: false,
          wouldExecute: false,
        };
      }

      const body = [
        "Terminal Lab learning note proposal",
        "",
        `Command: ${observation.command}`,
        observation.cwd ? `Working directory: ${observation.cwd}` : null,
        `Risk class: ${observation.risk}`,
        observation.explanation ? `Aang explanation: ${observation.explanation}` : null,
        observation.outputSummary ? `Observed output summary: ${observation.outputSummary}` : null,
        observation.exitCode != null ? `Observed exit code: ${observation.exitCode}` : null,
        "",
        "Approval note: This is staged as a memory proposal only. Oak/user approval is required before durable memory write.",
      ].filter(Boolean).join("\n");

      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO memory_proposals (
            kind, body, tags, source, project_id, session_id, proposed_by_agent
          )
          VALUES ('note', ?, ?, ?, ?, ?, 'aang')
          RETURNING id, kind, body, tags, source, project_id, session_id,
                    proposed_by_agent, status, oak_status, oak_notes,
                    approval_id, memory_entry_id, created_at, updated_at
        `,
        args: [
          body,
          "terminal_lab,aang,learning_note",
          `terminal_observation:${observation.id}`,
          observation.projectId,
          observation.sessionId,
        ],
      });
      const row = result.rows[0];
      await db.execute({
        sql: `
          UPDATE command_observations
          SET status = 'learned'
          WHERE id = ?
        `,
        args: [observation.id],
      });
      return {
        ok: Boolean(row),
        writesExternal: false,
        wouldExecute: false,
        proposal: row
          ? {
              id: Number(row.id),
              kind: String(row.kind),
              status: String(row.status),
              oakStatus: String(row.oak_status),
              source: row.source == null ? null : String(row.source),
              proposedByAgent: String(row.proposed_by_agent),
            }
          : null,
      };
    }),
});
