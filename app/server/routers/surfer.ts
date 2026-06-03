import { z } from "zod";
import { getCerebroDb, recordArtifact, recordSourceEvent, type SourceKind, type SourceRow } from "../cerebroDb";
import { sourceDisplayName } from "../displayLabels";
import { recordPermissionPreflight } from "../permissionPolicy";
import {
  GITHUB_PROJECT_MAP_PATH,
  GITHUB_REPOSITORY_SOURCE_PATH,
  GITHUB_SOURCES_INDEX_PATH,
  OBSIDIAN_KNOWLEDGE_ROUTES,
  OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
} from "../knowledge/contracts";
import { publicProcedure, router } from "../_core/trpc";

const TRUST_LEVELS = ["official", "primary", "high", "medium", "low", "unknown"] as const;
const SOURCE_VALIDATION_DECISIONS = ["trusted", "needs_review", "rejected"] as const;
const SOURCE_VALIDATION_REVIEWERS = ["oak", "spock"] as const;
const SURFER_BROWSER_ADAPTERS = ["public_fetch", "standard_browser", "cloak_browser"] as const;
const CLOAK_ALLOWED_ACTIONS = [
  "Approved public-source research.",
  "Owned or explicitly approved login sessions.",
  "Fingerprint and rendering reliability comparison.",
  "Human CAPTCHA handoff where the user decides.",
  "Isolated profile testing with receipts.",
] as const;
const CLOAK_BLOCKED_ACTIONS = [
  "Account abuse.",
  "Credential stuffing.",
  "Auth bypass.",
  "Paywall bypass.",
  "Impersonation.",
  "Unapproved bulk scraping.",
  "Private-module browsing or shared profile use.",
] as const;
const SURFER_BROWSER_ADAPTER_NO_ACTION = [
  "No CloakBrowser install ran.",
  "No browser opened.",
  "No page fetched.",
  "No profile created.",
  "No cookies, credentials, memory, or external systems were touched.",
] as const;

function validationDecisionToTrustLevel(decision: (typeof SOURCE_VALIDATION_DECISIONS)[number]) {
  if (decision === "trusted") return "high";
  if (decision === "rejected") return "low";
  return "unknown";
}

function validationDecisionToFreshness(decision: (typeof SOURCE_VALIDATION_DECISIONS)[number], currentFreshness: string) {
  if (decision === "rejected") return "stale";
  return currentFreshness || "unknown";
}

function rowToSource(r: Record<string, unknown>): SourceRow {
  const uri = String(r.uri);
  return {
    id: Number(r.id),
    kind: String(r.kind) as SourceKind,
    uri,
    sourceDisplayName: sourceDisplayName(uri),
    title: r.title == null ? null : String(r.title),
    summary: r.summary == null ? null : String(r.summary),
    sourceType: r.source_type == null ? "public_url" : String(r.source_type),
    trustLevel: r.trust_level == null ? "unknown" : String(r.trust_level),
    freshnessStatus: r.freshness_status == null ? "unknown" : String(r.freshness_status),
    contentType: r.content_type == null ? null : String(r.content_type),
    wordCount: r.word_count == null ? null : Number(r.word_count),
    sensitiveDataFlag: Boolean(r.sensitive_data_flag),
    scrubNotes: r.scrub_notes == null ? null : String(r.scrub_notes),
    trustNotes: r.trust_notes == null ? null : String(r.trust_notes),
    lastScrubbedAt: r.last_scrubbed_at == null ? null : Number(r.last_scrubbed_at),
    projectId: r.project_id == null ? null : Number(r.project_id),
    fetchedAt: r.fetched_at == null ? null : Number(r.fetched_at),
    createdAt: Number(r.created_at),
  };
}

function rowToSourceEvent(r: Record<string, unknown>) {
  const uri = String(r.uri);
  return {
    id: Number(r.id),
    sourceId: r.source_id == null ? null : Number(r.source_id),
    uri,
    sourceDisplayName: sourceDisplayName(uri),
    eventType: String(r.event_type),
    title: r.title == null ? null : String(r.title),
    summary: r.summary == null ? null : String(r.summary),
    sourceType: r.source_type == null ? null : String(r.source_type),
    trustLevel: r.trust_level == null ? null : String(r.trust_level),
    freshnessStatus: r.freshness_status == null ? null : String(r.freshness_status),
    contentType: r.content_type == null ? null : String(r.content_type),
    wordCount: r.word_count == null ? null : Number(r.word_count),
    sensitiveDataFlag: Boolean(r.sensitive_data_flag),
    scrubNotes: r.scrub_notes == null ? null : String(r.scrub_notes),
    trustNotes: r.trust_notes == null ? null : String(r.trust_notes),
    projectId: r.project_id == null ? null : Number(r.project_id),
    ownerAgent: r.owner_agent == null ? null : String(r.owner_agent),
    sourceLabel: r.source_label == null ? null : String(r.source_label),
    createdAt: Number(r.created_at),
  };
}

function rowToSurferBrowserAdapterReceipt(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    adapter: String(r.adapter) as typeof SURFER_BROWSER_ADAPTERS[number],
    targetUrl: String(r.target_url),
    purpose: String(r.purpose),
    profileId: String(r.profile_id),
    approvalId: r.approval_id == null ? null : Number(r.approval_id),
    status: String(r.status),
    ownerAgent: String(r.owner_agent),
    canRun: Boolean(r.can_run),
    installConfigured: Boolean(r.install_configured),
    opensBrowser: Boolean(r.opens_browser),
    writesMemory: Boolean(r.writes_memory),
    writesExternalSystems: Boolean(r.writes_external_systems),
    allowedActions: JSON.parse(String(r.allowed_actions_json)) as string[],
    blockedActions: JSON.parse(String(r.blocked_actions_json)) as string[],
    noActionTaken: String(r.no_action_taken).split("\n").filter(Boolean),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function trustForQuery(query: string): (typeof TRUST_LEVELS)[number] {
  if (query.includes("docs") || query.includes("official") || query.includes("api")) return "official";
  if (query.includes("github")) return "primary";
  if (query.includes("reddit") || query.includes("best") || query.includes("build")) return "medium";
  return "unknown";
}

function taskTypeForQuery(query: string) {
  if (query.includes("github")) return "github_review";
  if (query.includes("video") || query.includes("youtube")) return "video_reference";
  if (query.includes("reddit")) return "community_signal";
  if (query.includes("best") || query.includes("latest") || query.includes("right now")) return "current_web_research";
  return "source_research";
}

function htmlEntityDecode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function textFromHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metadataFromHtml(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i)?.[1]?.trim() ??
    null;
  const text = textFromHtml(html);
  const summary = description ?? text.slice(0, 700);

  return {
    title: title ? htmlEntityDecode(title) : null,
    summary: htmlEntityDecode(summary),
  };
}

function classifySourceType(url: URL, contentType: string): string {
  const host = url.hostname.toLowerCase();
  if (host === "github.com" || host.endsWith(".github.io")) return "github_reference";
  if (host.endsWith(".gov")) return "government_reference";
  if (host.endsWith(".edu")) return "academic_reference";
  if (host.includes("docs.") || host.includes("developer.") || url.pathname.includes("/docs")) return "official_docs";
  if (contentType.includes("pdf")) return "document";
  if (contentType.includes("text/plain")) return "plain_text";
  return "public_url";
}

function inferTrust(url: URL, sourceType: string): { trustLevel: string; trustNotes: string } {
  const host = url.hostname.toLowerCase();
  if (sourceType === "official_docs" || sourceType === "government_reference") {
    return { trustLevel: "official", trustNotes: "Host/path looks like official documentation or a government source." };
  }
  if (sourceType === "github_reference") {
    return { trustLevel: "primary", trustNotes: "GitHub links can be primary project sources, but repo ownership and freshness still matter." };
  }
  if (sourceType === "academic_reference") {
    return { trustLevel: "high", trustNotes: "Academic domain detected; still validate authorship, date, and applicability." };
  }
  if (host.includes("reddit.") || host.includes("news.ycombinator.") || host.includes("x.com") || host.includes("twitter.")) {
    return { trustLevel: "low", trustNotes: "Community/social source. Useful as signal, not as factual authority by itself." };
  }
  return { trustLevel: "unknown", trustNotes: "No trusted-source pattern detected. Oak should validate important claims before reuse." };
}

function freshnessStatus(fetchedAt: number): string {
  const ageDays = (Math.floor(Date.now() / 1000) - fetchedAt) / 86400;
  if (ageDays <= 7) return "fresh";
  if (ageDays <= 30) return "recent";
  if (ageDays <= 180) return "aging";
  return "stale";
}

function scrubSummary(value: string) {
  const notes = new Set<string>();
  let scrubbed = value;

  scrubbed = scrubbed.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => {
    notes.add("Email-like text redacted from summary.");
    return "[redacted email]";
  });
  scrubbed = scrubbed.replace(/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, () => {
    notes.add("Phone-like text redacted from summary.");
    return "[redacted phone]";
  });
  scrubbed = scrubbed.replace(/\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?[\w.-]{8,}/gi, () => {
    notes.add("Credential-like text redacted from summary.");
    return "[redacted credential]";
  });

  const wordCount = scrubbed.split(/\s+/).filter(Boolean).length;
  return {
    summary: scrubbed.slice(0, 700),
    wordCount,
    sensitiveDataFlag: notes.size > 0,
    scrubNotes: notes.size ? [...notes].join(" ") : "No email, phone, or credential-like text detected in the stored summary.",
  };
}

function sourceLibraryRouteContract() {
  const archiveRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "archive");
  const knowledgeRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "knowledge");
  return {
    mode: "read_only" as const,
    sourceNoteLane: knowledgeRoute?.relativePath ?? "20_Knowledge",
    githubRepositorySourcePath: GITHUB_REPOSITORY_SOURCE_PATH,
    githubProjectMapPath: GITHUB_PROJECT_MAP_PATH,
    githubSourcesIndexPath: GITHUB_SOURCES_INDEX_PATH,
    archiveRetrieval: archiveRoute?.retrievalDefault ?? "archive_only",
    retrievalMetadataFields: OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
    writesExternalSystems: false,
    approvalGate: "Source Library saves can create local records. Obsidian, Notion, Drive, browser, and long-term memory writes still need explicit approval.",
  };
}

function surferBrowserAdapterContract() {
  return {
    mode: "read_only_contract" as const,
    ownerAgent: "surfer" as const,
    defaultAdapter: "public_fetch" as const,
    adapters: [
      {
        id: "public_fetch" as const,
        label: "Public Fetch",
        status: "available" as const,
        role: "Default public URL metadata and static page read path.",
        profileIsolation: "No browser profile. HTTP fetch only.",
        approvalRequired: "Approved public URL ingest.",
      },
      {
        id: "standard_browser" as const,
        label: "Standard Browser",
        status: "planned" as const,
        role: "Normal human browser session for pages that need real rendering.",
        profileIsolation: "Dedicated Surfer public profile. Separate from the daily CereBro browser.",
        approvalRequired: "Per-session browser approval.",
      },
      {
        id: "cloak_browser" as const,
        label: "CloakBrowser",
        status: "candidate" as const,
        role: "Restricted Surfer adapter for approved public-source browsing when normal automation is blocked or brittle.",
        profileIsolation: "Dedicated Cloak profile per target or project. Never shared with daily browsing, memory, or private modules.",
        approvalRequired: "Explicit target, purpose, profile, and receipt approval before any run.",
      },
    ],
    cloakPolicy: {
      allowed: [
        ...CLOAK_ALLOWED_ACTIONS,
      ],
      blocked: [
        ...CLOAK_BLOCKED_ACTIONS,
      ],
      receiptFields: [
        "adapter",
        "targetUrl",
        "purpose",
        "profileId",
        "approvalId",
        "openedAt",
        "closedAt",
        "pageTitle",
        "sourceIds",
        "extractedFields",
        "blockedActions",
        "noActionTaken",
      ],
    },
    canRunNow: false,
    installConfigured: false,
    opensBrowserFromContract: false,
    writesMemoryFromContract: false,
    writesExternalSystems: false,
    nextAction: "Create the adapter receipt table and approval preview before installing or launching any browser adapter.",
    noActionTaken: [
      ...SURFER_BROWSER_ADAPTER_NO_ACTION,
    ],
  };
}

function countValue(row: Record<string, unknown> | undefined, key: string) {
  return Number(row?.[key] ?? 0);
}

async function readSourceLibraryReceipt() {
  const db = await getCerebroDb();
  const [sourceTotals, eventTotals] = await Promise.all([
    db.execute({
      sql: `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN trust_level IN ('official', 'primary', 'high') THEN 1 ELSE 0 END) AS trusted,
          SUM(CASE WHEN trust_level IN ('low', 'unknown') THEN 1 ELSE 0 END) AS needs_review,
          SUM(CASE WHEN sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS needs_scrub,
          SUM(CASE WHEN freshness_status = 'stale' THEN 1 ELSE 0 END) AS stale
        FROM sources
      `,
      args: [],
    }),
    db.execute({
      sql: "SELECT COUNT(*) AS total FROM source_events",
      args: [],
    }),
  ]);
  const sourceRow = sourceTotals.rows[0] as Record<string, unknown> | undefined;
  const eventRow = eventTotals.rows[0] as Record<string, unknown> | undefined;

  return {
    mode: "local_read" as const,
    totalSources: countValue(sourceRow, "total"),
    trustedSources: countValue(sourceRow, "trusted"),
    needsReview: countValue(sourceRow, "needs_review"),
    needsScrub: countValue(sourceRow, "needs_scrub"),
    staleSources: countValue(sourceRow, "stale"),
    sourceEvents: countValue(eventRow, "total"),
    routeDefaultsChanged: false,
    retrievalAutomationEnabled: false,
    nextAction: "Review low-trust, unknown, sensitive, or stale source records before retrieval use.",
    noActionTaken: [
      "No browser, search, fetch, parser, model, vector index, Obsidian write, Notion write, Drive write, memory write, or external tool ran.",
      "Source Library receipt reads local SQLite rows only.",
    ],
  };
}

async function readSourceResearchLoopAudit() {
  const db = await getCerebroDb();
  const [sourceTotals, eventTotals] = await Promise.all([
    db.execute({
      sql: `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN trust_level IN ('official', 'primary', 'high') THEN 1 ELSE 0 END) AS trusted,
          SUM(CASE WHEN trust_level IN ('low', 'unknown') THEN 1 ELSE 0 END) AS review,
          SUM(CASE WHEN freshness_status = 'stale' THEN 1 ELSE 0 END) AS stale,
          SUM(CASE WHEN sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive,
          SUM(CASE WHEN fetched_at IS NOT NULL THEN 1 ELSE 0 END) AS fetched,
          SUM(CASE WHEN source_type LIKE '%github%' OR uri LIKE '%github.com/%' THEN 1 ELSE 0 END) AS github,
          SUM(CASE WHEN source_type = 'community_signal' OR uri LIKE '%reddit.%' OR uri LIKE '%news.ycombinator.%' THEN 1 ELSE 0 END) AS community
        FROM sources
      `,
      args: [],
    }),
    db.execute({
      sql: `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN owner_agent = 'surfer' THEN 1 ELSE 0 END) AS surfer,
          SUM(CASE WHEN owner_agent = 'hedwig' THEN 1 ELSE 0 END) AS hedwig,
          SUM(CASE WHEN event_type = 'surfer_public_url_ingest' OR source_label = 'approved_public_url' THEN 1 ELSE 0 END) AS approved_public_ingests,
          SUM(CASE WHEN event_type = 'source_validation' THEN 1 ELSE 0 END) AS validation_events,
          SUM(CASE WHEN sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive
        FROM source_events
      `,
      args: [],
    }),
  ]);
  const sourceRow = sourceTotals.rows[0] as Record<string, unknown> | undefined;
  const eventRow = eventTotals.rows[0] as Record<string, unknown> | undefined;
  const reviewSources = countValue(sourceRow, "review");
  const staleSources = countValue(sourceRow, "stale");
  const sensitiveSources = countValue(sourceRow, "sensitive");
  const needsReviewBeforeRetrieval = reviewSources + staleSources + sensitiveSources;

  return {
    mode: "read_only" as const,
    ownerAgent: "surfer" as const,
    totalSources: countValue(sourceRow, "total"),
    trustedSources: countValue(sourceRow, "trusted"),
    reviewSources,
    staleSources,
    sensitiveSources,
    fetchedSources: countValue(sourceRow, "fetched"),
    githubSources: countValue(sourceRow, "github"),
    communitySources: countValue(sourceRow, "community"),
    sourceEvents: countValue(eventRow, "total"),
    surferEvents: countValue(eventRow, "surfer"),
    hedwigEvents: countValue(eventRow, "hedwig"),
    approvedPublicIngests: countValue(eventRow, "approved_public_ingests"),
    validationEvents: countValue(eventRow, "validation_events"),
    sensitiveEvents: countValue(eventRow, "sensitive"),
    needsReviewBeforeRetrieval,
    canBrowseFromAudit: false,
    canWriteMemoryFromAudit: false,
    retrievalAutomationEnabled: false,
    nextAction:
      needsReviewBeforeRetrieval > 0
        ? "Review low-trust, unknown, stale, or sensitive sources before research reuse."
        : "Sources are locally readable. Approval is still required before browsing, memory, Obsidian, Notion, Drive, or retrieval automation.",
    gates: [
      "Source loop audit reads local source and source-event records only.",
      "Source records and events are evidence. They are not truth.",
      "The audit does not browse, fetch, search, call models, write memory, write Obsidian, write Notion, write Drive, or enable retrieval.",
    ],
  };
}

async function readSurferBrowserAdapterReceipts() {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT *
      FROM surfer_browser_adapter_receipts
      ORDER BY created_at DESC, id DESC
      LIMIT 8
    `,
    args: [],
  });
  return result.rows.map((row) => rowToSurferBrowserAdapterReceipt(row as Record<string, unknown>));
}

export const surferRouter = router({
  panel: publicProcedure
    .input(
      z
        .object({
          eventOwner: z.enum(["surfer", "hedwig"]).optional(),
          sensitiveOnly: z.boolean().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT
            id, kind, uri, title, summary, source_type, trust_level,
            freshness_status, content_type, word_count, sensitive_data_flag,
            scrub_notes, trust_notes, last_scrubbed_at, project_id, fetched_at,
            created_at
          FROM sources
          ORDER BY COALESCE(fetched_at, created_at) DESC
          LIMIT 50
        `,
      });
      const eventWhere: string[] = [];
      const eventArgs: (string | number)[] = [];
      if (input?.eventOwner) {
        eventWhere.push("owner_agent = ?");
        eventArgs.push(input.eventOwner);
      }
      if (input?.sensitiveOnly) {
        eventWhere.push("sensitive_data_flag = 1");
      }
      eventArgs.push(input?.limit ?? 25);
      const eventResult = await db.execute({
        sql: `
          SELECT id, source_id, uri, event_type, title, summary, source_type,
                 trust_level, freshness_status, content_type, word_count,
                 sensitive_data_flag, scrub_notes, trust_notes, project_id,
                 owner_agent, source_label, created_at
          FROM source_events
          ${eventWhere.length ? `WHERE ${eventWhere.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: eventArgs,
      });

      return {
        mode: "proposal_only",
        browserEnabled: false,
        ownerAgent: "surfer",
        policy: {
          defaultPosture: "Use saved sources, user-provided text, or static public sources first.",
          privateBrowsing: "Private or logged-in browsing requires explicit per-session approval.",
          writes: "Saving sources, screenshots, notes, or memories requires approval.",
        },
        ladder: [
          "Saved source library / user-provided content",
          "Public URL metadata",
          "Static fetch / parser",
          "Readability-style extraction",
          "Browser text extraction",
          "Screenshot review",
          "Optional Crawl4AI / advanced extraction",
          "Manual user-assisted summary",
        ],
        savedSources: result.rows.map(rowToSource),
        recentSourceEvents: eventResult.rows.map(rowToSourceEvent),
        sourceEventFilters: {
          eventOwner: input?.eventOwner ?? "all",
          sensitiveOnly: Boolean(input?.sensitiveOnly),
          limit: input?.limit ?? 25,
        },
        sourceLibraryRoute: sourceLibraryRouteContract(),
        browserAdapterContract: surferBrowserAdapterContract(),
        browserAdapterReceipts: await readSurferBrowserAdapterReceipts(),
        sourceLibraryReceipt: await readSourceLibraryReceipt(),
        sourceResearchLoopAudit: await readSourceResearchLoopAudit(),
      };
    }),

  previewResearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(1000),
        projectSlug: z.string().max(80).optional(),
      }),
    )
    .mutation(({ input }) => {
      const normalized = input.query.toLowerCase();
      const trustLevel = trustForQuery(normalized);
      const taskType = taskTypeForQuery(normalized);

      return {
        mode: "proposal_only",
        browserAction: "not_run",
        query: input.query,
        projectSlug: input.projectSlug ?? null,
        taskType,
        cards: [
          {
            id: "surfer-search-plan",
            title: "Search plan",
            sourceType: "search_plan",
            trustLevel: "unknown" as const,
            preview:
              "Surfer should gather several current sources, separate official facts from community opinion, and keep citations attached.",
            whyItMatters:
              "This keeps everyday web answers and project research from becoming unsourced advice.",
            requiredApproval: "Approve public web research before Surfer browses or fetches live pages.",
          },
          {
            id: "surfer-source-quality",
            title: "Source quality pass",
            sourceType: taskType,
            trustLevel,
            preview:
              "Oak should validate important claims. Reddit/community signals can reveal patterns, but should not be treated as facts alone.",
            whyItMatters:
              "CereBro should help daily decisions without smuggling weak internet claims into memory.",
            requiredApproval: "Approve any save to Source Library, Obsidian, Notion, or long-term memory.",
          },
        ],
        nextStep:
          "Open an approval-gated public research session, then display source cards with links, summaries, trust levels, and save/discard controls.",
        gates: [
          "No browsing was run from this preview.",
          "Public browsing/fetching requires approval.",
          "Private/logged-in browsing requires explicit per-session approval.",
          "Saved source records and screenshots require approval.",
        ],
      };
    }),

  createBrowserAdapterApprovalPreview: publicProcedure
    .input(
      z.object({
        adapter: z.enum(SURFER_BROWSER_ADAPTERS).default("cloak_browser"),
        targetUrl: z.string().url().max(1200),
        purpose: z.string().min(8).max(700),
        profileId: z.string().min(3).max(120).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const url = new URL(input.targetUrl);
      const adapterLabel = input.adapter === "cloak_browser" ? "CloakBrowser" : input.adapter === "standard_browser" ? "Standard Browser" : "Public Fetch";
      const profileId = input.profileId ?? `surfer-${input.adapter}-${url.hostname.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}`;
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: "public_browser",
        actionClass: "browser_or_media_capture",
        externalTarget: true,
        sensitiveData: false,
        requestedByAgent: "surfer",
        targetSummary: `${adapterLabel} adapter approval preview: ${url.toString()}`,
        additionalReasons: [
          "Surfer browser adapter approval preview only.",
          "This approval does not install, launch, fetch, save, or write memory.",
          "Adapter use still needs a separate implementation and run receipt.",
        ],
      });
      const approvalResult = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            status, reason, context_summary, sensitive_data_flag, cost_risk,
            permission_preflight_id
          )
          VALUES (NULL, 'surfer_browser_adapter_preview', 'surfer_browser_adapter_receipt', NULL, 'surfer',
                  'pending', ?, ?, 0, ?, ?)
          RETURNING id
        `,
        args: [
          `Approve ${adapterLabel} adapter planning for ${url.hostname}. This does not run the adapter.`,
          [
            `Adapter: ${adapterLabel}`,
            `Target: ${url.toString()}`,
            `Purpose: ${input.purpose}`,
            `Profile: ${profileId}`,
            "No install, launch, fetch, memory write, or external write runs from this preview.",
          ].join("\n"),
          input.adapter === "cloak_browser" ? "restricted_browser_adapter" : "public_browser_adapter",
          Number(preflight.row.id),
        ],
      });
      const approvalId = Number(approvalResult.rows[0]?.id);
      const receiptResult = await db.execute({
        sql: `
          INSERT INTO surfer_browser_adapter_receipts (
            adapter, target_url, purpose, profile_id, approval_id, status,
            owner_agent, can_run, install_configured, opens_browser,
            writes_memory, writes_external_systems, allowed_actions_json,
            blocked_actions_json, no_action_taken
          )
          VALUES (?, ?, ?, ?, ?, 'approval_preview',
                  'surfer', 0, 0, 0, 0, 0, ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.adapter,
          url.toString(),
          input.purpose,
          profileId,
          approvalId,
          JSON.stringify(input.adapter === "cloak_browser" ? CLOAK_ALLOWED_ACTIONS : ["Approved public browsing with receipts."]),
          JSON.stringify(input.adapter === "cloak_browser" ? CLOAK_BLOCKED_ACTIONS : ["No unapproved browsing.", "No memory write by default."]),
          SURFER_BROWSER_ADAPTER_NO_ACTION.join("\n"),
        ],
      });
      const receipt = rowToSurferBrowserAdapterReceipt(receiptResult.rows[0] as Record<string, unknown>);
      await db.execute({
        sql: "UPDATE approvals SET target_id = ? WHERE id = ?",
        args: [receipt.id, approvalId],
      });

      return {
        ok: true as const,
        mode: "surfer_browser_adapter_approval_preview" as const,
        created: true,
        approvalId,
        receipt: { ...receipt, approvalId },
        canRun: false,
        opensBrowser: false,
        writesMemory: false,
        writesExternalSystems: false,
        gates: [
          "Created one pending local Surfer browser adapter approval preview.",
          "Recorded one local permission preflight audit row.",
          "Recorded one local adapter receipt row.",
          "This does not install, launch, fetch, save, browse, write memory, or write externally.",
        ],
        noActionTaken: [...SURFER_BROWSER_ADAPTER_NO_ACTION],
      };
    }),

  validateSource: publicProcedure
    .input(
      z.object({
        sourceId: z.number().int().positive(),
        decision: z.enum(SOURCE_VALIDATION_DECISIONS),
        reviewer: z.enum(SOURCE_VALIDATION_REVIEWERS),
        note: z.string().min(1).max(700),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const existing = await db.execute({
        sql: `
          SELECT
            id, kind, uri, title, summary, source_type, trust_level,
            freshness_status, content_type, word_count, sensitive_data_flag,
            scrub_notes, trust_notes, last_scrubbed_at, project_id, fetched_at,
            created_at
          FROM sources
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.sourceId],
      });
      const current = existing.rows[0] as Record<string, unknown> | undefined;
      if (!current) {
        return { ok: false as const, reason: "Source record was not found." };
      }

      const nextTrustLevel = validationDecisionToTrustLevel(input.decision);
      const nextFreshness = validationDecisionToFreshness(input.decision, String(current.freshness_status ?? "unknown"));
      const validationNote = `${input.reviewer.toUpperCase()} ${input.decision.replace(/_/g, " ")}: ${input.note}`;
      const updated = await db.execute({
        sql: `
          UPDATE sources
          SET trust_level = ?,
              freshness_status = ?,
              trust_notes = ?
          WHERE id = ?
          RETURNING
            id, kind, uri, title, summary, source_type, trust_level,
            freshness_status, content_type, word_count, sensitive_data_flag,
            scrub_notes, trust_notes, last_scrubbed_at, project_id, fetched_at,
            created_at
        `,
        args: [nextTrustLevel, nextFreshness, validationNote, input.sourceId],
      });
      const row = updated.rows[0];
      if (!row) {
        return { ok: false as const, reason: "Source validation write returned no row." };
      }
      const source = rowToSource(row);
      const sourceEventId = await recordSourceEvent({
        sourceId: source.id,
        uri: source.uri,
        eventType: "source_validation",
        title: source.title,
        summary: source.summary,
        sourceType: source.sourceType,
        trustLevel: source.trustLevel,
        freshnessStatus: source.freshnessStatus,
        contentType: source.contentType,
        wordCount: source.wordCount,
        sensitiveDataFlag: source.sensitiveDataFlag,
        scrubNotes: source.scrubNotes,
        trustNotes: validationNote,
        projectId: source.projectId,
        ownerAgent: input.reviewer,
        sourceLabel: `${input.reviewer}_${input.decision}`,
      });

      return {
        ok: true as const,
        source,
        sourceEventId,
        sourceValidationReceipt: {
          mode: "local_source_validation" as const,
          sourceId: source.id,
          sourceEventId,
          decision: input.decision,
          reviewer: input.reviewer,
          trustLevel: source.trustLevel,
          freshnessStatus: source.freshnessStatus,
          browserOpened: false,
          searchRan: false,
          fetchRan: false,
          writesLocalRecords: true,
          writesExternalSystems: false,
          writesMemory: false,
          routeDefaultsChanged: false,
          retrievalAutomationEnabled: false,
          nextAction: "Use this validation as local evidence only. Memory, Obsidian, Notion, Drive, browsing, and retrieval still require their own approval.",
          noActionTaken: [
            "No browser, search, fetch, parser, model, vector index, Obsidian write, Notion write, Drive write, memory write, or external tool ran.",
            "Only the local source trust note and source validation event were written.",
          ],
        },
      };
    }),

  ingestPublicUrl: publicProcedure
    .input(
      z.object({
        url: z.string().url().max(2000),
        projectId: z.number().int().optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const parsed = new URL(input.url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { ok: false, reason: "Only http/https public URLs are supported." };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(parsed.toString(), {
          signal: controller.signal,
          headers: {
            "user-agent": "CereBro-Surfer/0.1 public-source-ingestion",
            accept: "text/html,text/plain,application/xhtml+xml;q=0.9,*/*;q=0.5",
          },
        });
        const contentType = response.headers.get("content-type") ?? "";
        const body = await response.text();
        const metadata = contentType.includes("html")
          ? metadataFromHtml(body)
          : { title: parsed.hostname, summary: body.replace(/\s+/g, " ").trim().slice(0, 700) };
        const fetchedAt = Math.floor(Date.now() / 1000);
        const sourceType = classifySourceType(parsed, contentType);
        const trust = inferTrust(parsed, sourceType);
        const scrubbed = scrubSummary(metadata.summary);

        const db = await getCerebroDb();
        const result = await db.execute({
          sql: `
            INSERT INTO sources (
              kind, uri, title, summary, source_type, trust_level,
              freshness_status, content_type, word_count, sensitive_data_flag,
              scrub_notes, trust_notes, last_scrubbed_at, project_id, fetched_at
            )
            VALUES ('url', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(uri) DO UPDATE SET
              title = excluded.title,
              summary = excluded.summary,
              source_type = excluded.source_type,
              trust_level = excluded.trust_level,
              freshness_status = excluded.freshness_status,
              content_type = excluded.content_type,
              word_count = excluded.word_count,
              sensitive_data_flag = excluded.sensitive_data_flag,
              scrub_notes = excluded.scrub_notes,
              trust_notes = excluded.trust_notes,
              last_scrubbed_at = excluded.last_scrubbed_at,
              project_id = excluded.project_id,
              fetched_at = excluded.fetched_at
            RETURNING
              id, kind, uri, title, summary, source_type, trust_level,
              freshness_status, content_type, word_count, sensitive_data_flag,
              scrub_notes, trust_notes, last_scrubbed_at, project_id, fetched_at,
              created_at
          `,
          args: [
            parsed.toString(),
            metadata.title,
            scrubbed.summary,
            sourceType,
            trust.trustLevel,
            freshnessStatus(fetchedAt),
            contentType || null,
            scrubbed.wordCount,
            scrubbed.sensitiveDataFlag ? 1 : 0,
            scrubbed.scrubNotes,
            trust.trustNotes,
            fetchedAt,
            input.projectId ?? null,
            fetchedAt,
          ],
        });
        const row = result.rows[0];
        if (!row) return { ok: false, reason: "Source write returned no row." };
        const source = rowToSource(row);
        const sourceEventId = await recordSourceEvent({
          sourceId: source.id,
          uri: source.uri,
          eventType: "surfer_public_url_ingest",
          title: source.title,
          summary: source.summary,
          sourceType: source.sourceType,
          trustLevel: source.trustLevel,
          freshnessStatus: source.freshnessStatus,
          contentType: source.contentType,
          wordCount: source.wordCount,
          sensitiveDataFlag: source.sensitiveDataFlag,
          scrubNotes: source.scrubNotes,
          trustNotes: source.trustNotes,
          projectId: source.projectId,
          ownerAgent: "surfer",
          sourceLabel: "approved_public_url",
        });

        const artifactId = await recordArtifact({
          kind: "source_url",
          lifecycleState: "review",
          title: metadata.title ?? parsed.toString(),
          projectId: input.projectId ?? null,
          ownerAgent: "surfer",
          storageProvider: "external",
          storagePath: parsed.toString(),
          sourceUri: parsed.toString(),
          mimeType: contentType || null,
          promptOrInstruction: `${sourceType}; trust=${trust.trustLevel}; ${scrubbed.scrubNotes}`,
          retentionRule: "keep_until_project_archive",
          sensitiveDataFlag: scrubbed.sensitiveDataFlag,
        });

        return {
          ok: true,
          source,
          artifactId,
          sourceEventId,
          status: response.status,
          contentType,
          sourceSaveReceipt: {
            mode: "approved_public_url_ingest" as const,
            sourceId: source.id,
            artifactId,
            sourceEventId,
            status: response.status,
            contentType,
            fetchRan: true,
            browserOpened: false,
            searchRan: false,
            writesLocalRecords: true,
            writesExternalSystems: false,
            writesMemory: false,
            routeDefaultsChanged: false,
            retrievalAutomationEnabled: false,
            nextAction: "Review the saved source before retrieval, memory, Obsidian, or project knowledge reuse.",
            noActionTaken: [
              "No browser, search, model, vector index, Obsidian write, Notion write, Drive write, memory write, route default change, or external write ran.",
              "Only the approved public URL fetch and local source/artifact/event records were created.",
            ],
          },
        };
      } catch (error) {
        return {
          ok: false,
          reason: error instanceof Error ? error.message : "Public URL ingestion failed.",
        };
      } finally {
        clearTimeout(timeout);
      }
    }),
});
