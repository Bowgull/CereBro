import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, getOrCreateProjectByPath, recordArtifact, recordSourceEvent } from "../cerebroDb";
import { recordPermissionPreflight } from "../permissionPolicy";

const captureTypes = [
  "idea",
  "link",
  "article",
  "video",
  "reddit",
  "conversation_note",
  "learning_seed",
  "reminder",
  "message",
  "later",
] as const;

const statuses = ["inbox", "triaged", "tasked", "sourced", "learn", "archived"] as const;
const priorities = ["low", "normal", "high", "urgent"] as const;
const proposalStatuses = ["proposed", "reviewing", "ready_for_approval", "deferred", "archived"] as const;
const sourceProposalStatuses = ["inbox", "triaged", "sourced", "archived"] as const;
const approvalPreviewActions = ["notion_capture_write", "slack_capture_read", "source_enrichment", "schedule_reminder", "send_message"] as const;

const projectProfiles = [
  { name: "Declyne", path: "/Users/lindsaybell/Developer/Declyne" },
  { name: "Waymark", path: "/Users/lindsaybell/Developer/Waymark" },
  { name: "Sygnalist", path: "/Users/lindsaybell/Developer/sygnalist-brain" },
  { name: "Bridgefour", path: "/Users/lindsaybell/Developer/bridgefour" },
  { name: "CereBro", path: "/Users/lindsaybell/Desktop/CereBro" },
];

function inferCaptureType(text: string): (typeof captureTypes)[number] {
  const normalized = text.toLowerCase();
  if (normalized.includes("reddit.com") || normalized.includes("r/")) return "reddit";
  if (normalized.includes("tiktok.com") || normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "video";
  if (normalized.includes("http://") || normalized.includes("https://")) return "link";
  if (normalized.includes("remind") || normalized.includes("tomorrow") || normalized.includes("next week")) return "reminder";
  if (normalized.includes("message") || normalized.includes("reply") || normalized.includes("email")) return "message";
  if (normalized.includes("learn") || normalized.includes("course") || normalized.includes("tutorial")) return "learning_seed";
  if (normalized.includes("save this") || normalized.includes("later")) return "later";
  return "idea";
}

function extractFirstUrl(text: string): string | null {
  return text.match(/https?:\/\/[^\s)]+/i)?.[0] ?? null;
}

function projectGuess(text: string): string | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("declyne") || normalized.includes("plaid") || normalized.includes("budget")) return "Declyne";
  if (normalized.includes("waymark") || normalized.includes("strava") || normalized.includes("training")) return "Waymark";
  if (normalized.includes("sygnalist") || normalized.includes("job search")) return "Sygnalist";
  if (normalized.includes("bridgefour") || normalized.includes("portfolio") || normalized.includes("resume")) return "Bridgefour";
  if (normalized.includes("cerebro") || normalized.includes("hedwig") || normalized.includes("slack") || normalized.includes("notion")) return "CereBro";
  return null;
}

async function projectIdForGuess(guess: string | null) {
  if (!guess || guess === "Unknown") return null;
  const project = projectProfiles.find((profile) => profile.name === guess);
  if (!project) return null;
  return getOrCreateProjectByPath(project.name, project.path);
}

function rowToCaptureObservation(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    title: String(row.title),
    rawText: String(row.raw_text),
    captureType: String(row.capture_type),
    status: String(row.status),
    priority: String(row.priority),
    sourceUri: row.source_uri == null ? null : String(row.source_uri),
    sourceLabel: row.source_label == null ? null : String(row.source_label),
    projectGuess: row.project_guess == null ? null : String(row.project_guess),
    ownerAgent: String(row.owner_agent),
    needsReview: Boolean(row.needs_review),
    sensitive: Boolean(row.sensitive_data_flag),
    proposedNotionRow: row.proposed_notion_row == null ? null : JSON.parse(String(row.proposed_notion_row)),
    reviewNotes: row.review_notes == null ? null : String(row.review_notes),
    approvalScope: row.approval_scope == null ? null : String(row.approval_scope),
    proposedExternalTarget: row.proposed_external_target == null ? null : String(row.proposed_external_target),
    lastReviewedAt: row.last_reviewed_at == null ? null : Number(row.last_reviewed_at),
    source: String(row.source),
    createdAt: Number(row.created_at),
  };
}

function rowToReminderProposal(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    captureObservationId: row.capture_observation_id == null ? null : Number(row.capture_observation_id),
    title: String(row.title),
    timingHint: row.timing_hint == null ? null : String(row.timing_hint),
    rawText: String(row.raw_text),
    status: String(row.status),
    ownerAgent: String(row.owner_agent),
    approvalRequired: String(row.approval_required),
    reviewPriority: row.review_priority == null ? "normal" : String(row.review_priority),
    reviewNotes: row.review_notes == null ? null : String(row.review_notes),
    approvalScope: row.approval_scope == null ? null : String(row.approval_scope),
    proposedExternalTarget: row.proposed_external_target == null ? null : String(row.proposed_external_target),
    lastReviewedAt: row.last_reviewed_at == null ? null : Number(row.last_reviewed_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToMessageDraftProposal(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    captureObservationId: row.capture_observation_id == null ? null : Number(row.capture_observation_id),
    title: String(row.title),
    recipientHint: row.recipient_hint == null ? null : String(row.recipient_hint),
    rawText: String(row.raw_text),
    draftIntent: String(row.draft_intent),
    status: String(row.status),
    ownerAgent: String(row.owner_agent),
    approvalRequired: String(row.approval_required),
    reviewPriority: row.review_priority == null ? "normal" : String(row.review_priority),
    reviewNotes: row.review_notes == null ? null : String(row.review_notes),
    approvalScope: row.approval_scope == null ? null : String(row.approval_scope),
    proposedExternalTarget: row.proposed_external_target == null ? null : String(row.proposed_external_target),
    lastReviewedAt: row.last_reviewed_at == null ? null : Number(row.last_reviewed_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
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

function preflightForApprovalAction(actionType: (typeof approvalPreviewActions)[number]) {
  if (actionType === "source_enrichment") {
    return {
      perceptionClass: "public_browser" as const,
      actionClass: "browser_or_media_capture" as const,
      externalTarget: true,
      reasons: [
        "Hedwig source enrichment previews are local metadata only.",
        "Any source fetch, browser action, or external research still requires explicit approval later.",
      ],
    };
  }
  if (actionType === "slack_capture_read") {
    return {
      perceptionClass: "explicit_context" as const,
      actionClass: "local_note" as const,
      externalTarget: true,
      reasons: [
        "Hedwig Slack capture-read previews are local metadata only.",
        "Reading Slack requires approved scopes and explicit user approval later.",
      ],
    };
  }
  return {
    perceptionClass: "explicit_context" as const,
    actionClass: "external_write" as const,
    externalTarget: true,
    reasons: [
      "Hedwig external action previews are local metadata only.",
      "Notion writes, scheduling, notifications, and message sends require explicit approval later.",
    ],
  };
}

function recipientHintFromText(text: string) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  if (email) return "[redacted-email]";
  const toMatch = text.match(/\b(?:to|reply to|message|email|dm)\s+([A-Z][A-Za-z0-9_.-]{1,40})/i);
  return toMatch?.[1] ?? null;
}

function defaultApprovalActionForKind(kind: "source" | "reminder" | "message") {
  if (kind === "source") return "source_enrichment" as const;
  if (kind === "reminder") return "schedule_reminder" as const;
  return "send_message" as const;
}

function targetTypeForKind(kind: "source" | "reminder" | "message") {
  if (kind === "source") return "capture_observation";
  if (kind === "reminder") return "reminder_proposal";
  return "message_draft_proposal";
}

type CaptureObservation = ReturnType<typeof rowToCaptureObservation>;

function routeForCapture(item: CaptureObservation) {
  if (item.captureType === "reminder") return "reminder" as const;
  if (item.captureType === "message" || /\b(reply|email|dm|message)\b/i.test(item.rawText)) return "message" as const;
  if (item.captureType === "learning_seed" || /\b(learn|course|tutorial|practice|explain)\b/i.test(item.rawText)) return "learning" as const;
  if (item.sourceUri || ["link", "article", "video", "reddit"].includes(item.captureType)) return "source" as const;
  return "task" as const;
}

function agentsForRoute(route: ReturnType<typeof routeForCapture>) {
  if (route === "source") return ["hedwig", "surfer", "oak"];
  if (route === "learning") return ["hedwig", "aang", "surfer"];
  if (route === "reminder" || route === "message") return ["hedwig", "cortana"];
  return ["hedwig", "cortana", "tony"];
}

function statusForRoute(route: ReturnType<typeof routeForCapture>) {
  if (route === "source") return "sourced";
  if (route === "learning") return "learn";
  if (route === "task") return "tasked";
  return "triaged";
}

function buildTriagePlan(item: CaptureObservation) {
  const route = routeForCapture(item);
  const title = item.title.length > 96 ? `${item.title.slice(0, 93)}...` : item.title;
  const projectProfile = projectProfiles.find((profile) => profile.name === item.projectGuess);
  const projectName = projectProfile ? projectProfile.name : null;
  const projectPath = projectProfile ? projectProfile.path : null;
  const gates = [
    "This triage preview does not write to Notion, Slack, Tasks, Sources, or the vault.",
    "Saving raw capture rows to Notion requires approved NOTION_CAPTURE_DATABASE_ID and user approval.",
  ];
  if (route === "source") gates.push("Surfer enrichment, browsing, or source ingestion requires separate approval.");
  if (route === "reminder") gates.push("Scheduling or notifying through Slack/calendar requires separate approval.");
  if (route === "message") gates.push("Sending or posting any message requires separate approval.");
  if (route === "task") gates.push("Creating a CereBro task requires an explicit Create Task action.");
  if (item.sensitive) gates.push("Sensitive-looking capture should be reviewed before external sync or model escalation.");

  return {
    mode: "proposal_only" as const,
    writesExternal: false,
    mutatesObservation: false,
    observationId: item.id,
    recommendedRoute: route,
    proposedStatus: statusForRoute(route),
    ownerAgent: "hedwig",
    supportAgents: agentsForRoute(route),
    projectName,
    projectPath,
    sensitive: item.sensitive,
    rationale:
      route === "source"
        ? "This capture includes a URL or source-like type, so Hedwig should hand it to Surfer only after approval."
        : route === "learning"
          ? "This reads like a learning seed, so Aang should shape it into a learning path after triage."
          : route === "reminder"
            ? "This reads like a follow-up/reminder, so Hedwig should keep it in the operations lane."
            : route === "message"
              ? "This reads like a communication item, so Hedwig should draft before any approved send."
              : "This capture is actionable but not source/message/reminder specific, so Cortana can turn it into a normal task proposal.",
    taskDraft: {
      title: `Triage capture: ${title}`,
      agent: route === "source" ? "surfer" : route === "learning" ? "aang" : route === "message" || route === "reminder" ? "hedwig" : "cortana",
      projectName,
      projectPath,
    },
    sourceDraft: item.sourceUri
      ? {
          uri: item.sourceUri,
          title,
          kind: item.captureType,
          ownerAgent: "surfer",
        }
      : null,
    reminderDraft: route === "reminder"
      ? {
          title,
          timingHint: /\btomorrow\b/i.test(item.rawText)
            ? "tomorrow"
            : /\bnext week\b/i.test(item.rawText)
              ? "next week"
              : "needs date",
          ownerAgent: "hedwig",
        }
      : null,
    messageDraft: route === "message"
      ? {
          title,
          ownerAgent: "hedwig",
          needsRecipient: true,
        }
      : null,
    gates,
  };
}

async function captureObservationById(id: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, project_id, task_id, session_id, title, raw_text,
             capture_type, status, priority, source_uri, source_label,
             project_guess, owner_agent, needs_review, sensitive_data_flag,
             proposed_notion_row, review_notes, approval_scope,
             proposed_external_target, last_reviewed_at, source, created_at
      FROM capture_observations
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToCaptureObservation(row) : null;
}

async function reminderProposalById(id: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, project_id, task_id, session_id, capture_observation_id,
             title, timing_hint, raw_text, status, owner_agent,
             approval_required, review_priority, review_notes, approval_scope,
             proposed_external_target, last_reviewed_at, created_at, updated_at
      FROM reminder_proposals
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToReminderProposal(row) : null;
}

async function messageDraftProposalById(id: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, project_id, task_id, session_id, capture_observation_id,
             title, recipient_hint, raw_text, draft_intent, status,
             owner_agent, approval_required, review_priority, review_notes,
             approval_scope, proposed_external_target, last_reviewed_at,
             created_at, updated_at
      FROM message_draft_proposals
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToMessageDraftProposal(row) : null;
}

async function recordCaptureObservation(input: {
  projectId: number | null;
  taskId?: number | null;
  sessionId?: number | null;
  title: string;
  rawText: string;
  captureType: string;
  status: string;
  priority: string;
  sourceUri: string | null;
  sourceLabel: string | null;
  projectGuess: string;
  ownerAgent: string;
  needsReview: boolean;
  sensitive: boolean;
  proposedNotionRow: Record<string, unknown>;
  reviewNotes?: string | null;
  approvalScope?: string | null;
  proposedExternalTarget?: string | null;
}) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      INSERT INTO capture_observations (
        project_id, task_id, session_id, title, raw_text, capture_type,
        status, priority, source_uri, source_label, project_guess, owner_agent,
        needs_review, sensitive_data_flag, proposed_notion_row, review_notes,
        approval_scope, proposed_external_target, source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'hedwig_preview')
      RETURNING id
    `,
    args: [
      input.projectId,
      input.taskId ?? null,
      input.sessionId ?? null,
      input.title,
      input.rawText,
      input.captureType,
      input.status,
      input.priority,
      input.sourceUri,
      input.sourceLabel,
      input.projectGuess,
      input.ownerAgent,
      input.needsReview ? 1 : 0,
      input.sensitive ? 1 : 0,
      JSON.stringify(input.proposedNotionRow),
      input.reviewNotes ?? null,
      input.approvalScope ?? null,
      input.proposedExternalTarget ?? null,
    ],
  });
  return Number(result.rows[0]!.id);
}

export const hedwigRouter = router({
  capturePlan: publicProcedure.query(() => ({
    mode: "proposal_only",
    ownerAgent: "hedwig",
    summary:
      "Hedwig captures quick thoughts from Slack, stores the raw structured row in Notion after approval, and only later proposes tasks, sources, reminders, or durable notes.",
    notionDatabase: {
      proposedName: "CereBro Capture Inbox",
      purpose: "Structured raw capture database for ideas, links, TikToks, Reddit posts, articles, reminders, learning seeds, messages, and save-for-later items.",
      envVar: "NOTION_CAPTURE_DATABASE_ID",
      properties: [
        { name: "Title", type: "title", required: true, notes: "Short user-facing capture title." },
        { name: "Status", type: "select", required: true, options: statuses, notes: "Starts as inbox; changes only after triage or approved routing." },
        { name: "Capture Type", type: "select", required: true, options: captureTypes, notes: "Hedwig's first-pass category." },
        { name: "Priority", type: "select", required: true, options: priorities, notes: "Default normal unless the user marks urgency." },
        { name: "Source URI", type: "url", required: false, notes: "Original URL, Slack permalink, article, video, or tool link." },
        { name: "Raw Text", type: "rich_text", required: true, notes: "Unpolished user message or capture text." },
        { name: "Project Guess", type: "select", required: false, options: ["Declyne", "Waymark", "Sygnalist", "Bridgefour", "CereBro", "Personal", "Unknown"], notes: "Cortana can refine this later." },
        { name: "Owner Agent", type: "select", required: true, options: ["hedwig", "cortana", "surfer", "aang", "tony", "gojo", "c3po", "piccolo"], notes: "Starts with hedwig for raw capture." },
        { name: "Follow Up Date", type: "date", required: false, notes: "Only set when the user asks for a reminder or follow-up." },
        { name: "Needs Review", type: "checkbox", required: true, notes: "Default true until triaged." },
        { name: "Sensitive", type: "checkbox", required: true, notes: "True when the capture appears private, financial, medical, legal, or credential-like." },
        { name: "Slack Channel", type: "rich_text", required: false, notes: "Channel or DM label after Slack is connected." },
        { name: "Slack Message TS", type: "rich_text", required: false, notes: "Slack timestamp for dedupe/permalink lookup." },
        { name: "Created By", type: "created_by", required: false, notes: "Native Notion audit field." },
        { name: "Created Time", type: "created_time", required: false, notes: "Native Notion audit field." },
      ],
    },
    slackProposal: {
      recommendedShape: "both_dm_and_capture_channel",
      options: [
        {
          id: "dm_bot",
          label: "DM Hedwig",
          bestFor: "Private quick capture, personal reminders, sensitive-ish thoughts.",
          tradeoff: "Less visible than a channel and easier to forget during busy work.",
        },
        {
          id: "capture_channel",
          label: "Capture Channel",
          bestFor: "Fast link drops, mobile sharing, reviewable inbox habit.",
          tradeoff: "Needs strict channel scope so CereBro does not read arbitrary workspace chatter.",
        },
        {
          id: "both",
          label: "Both",
          bestFor: "Best V1 path: DM for private capture and one approved channel for link drops.",
          tradeoff: "Slightly more setup, but cleaner daily workflow.",
        },
      ],
      minimumScopes: ["chat:write", "channels:history for one approved channel", "im:history for Hedwig DM only", "users:read for user labels"],
      approvalGates: [
        "User approves Slack app installation and exact scopes.",
        "User chooses DM, capture channel, or both.",
        "CereBro stores only approved channel/DM metadata and capture text.",
        "Posting replies or reminders to Slack remains separately approval-gated.",
      ],
    },
    routingRules: [
      "Raw captures go to Notion first, not Obsidian.",
      "SQLite artifacts can record message_capture metadata after the Notion row exists.",
      "Surfer enriches links only after approval.",
      "Aang turns learning seeds into learning paths only after triage.",
      "Cortana links captures to projects/tasks/sources when obvious.",
      "Piccolo later reports stale captures; no deletion without approval.",
    ],
  })),

  previewCapture: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(4000),
        sourceLabel: z.string().max(120).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const type = inferCaptureType(input.text);
      const sourceUri = extractFirstUrl(input.text);
      const project = projectGuess(input.text);
      const title = input.text.replace(/\s+/g, " ").trim().slice(0, 80);
      const sensitive = /\b(password|token|secret|ssn|bank account|routing number|medical|diagnosis)\b/i.test(input.text);
      const priority = type === "reminder" ? "high" : "normal";
      const projectGuessValue = project ?? "Unknown";
      const proposedNotionRow = {
        Title: title || "Untitled capture",
        Status: "inbox",
        "Capture Type": type,
        Priority: priority,
        "Source URI": sourceUri,
        "Raw Text": input.text,
        "Project Guess": projectGuessValue,
        "Owner Agent": "hedwig",
        "Needs Review": true,
        Sensitive: sensitive,
        "Slack Channel": input.sourceLabel ?? null,
      };
      const projectId = await projectIdForGuess(projectGuessValue);
      const observationId = await recordCaptureObservation({
        projectId,
        title: title || "Untitled capture",
        rawText: input.text,
        captureType: type,
        status: "inbox",
        priority,
        sourceUri,
        sourceLabel: input.sourceLabel ?? null,
        projectGuess: projectGuessValue,
        ownerAgent: "hedwig",
        needsReview: true,
        sensitive,
        proposedNotionRow,
        reviewNotes: "Local capture preview only. Review project guess, sensitivity, and destination before any Notion or Slack sync.",
        approvalScope: "notion_capture_or_slack_read",
        proposedExternalTarget: "Notion Capture Inbox and/or approved Slack DM/capture channel",
      });

      return {
        mode: "proposal_only",
        writesExternal: false,
        persistedLocalObservation: true,
        observationId,
        projectId,
        title: title || "Untitled capture",
        captureType: type,
        status: "inbox" as const,
        priority,
        sourceUri,
        projectGuess: projectGuessValue,
        ownerAgent: "hedwig",
        needsReview: true,
        sensitive,
        proposedNotionRow,
        approvalNeeded:
          "Saving this to Notion or reading Slack requires explicit approval and configured NOTION_CAPTURE_DATABASE_ID / Slack scopes.",
      };
    }),

  observations: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().int().optional(),
          taskId: z.number().int().optional(),
          sessionId: z.number().int().optional(),
          status: z.enum(statuses).optional(),
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
      if (input?.status !== undefined) {
        where.push("status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT id, project_id, task_id, session_id, title, raw_text,
                 capture_type, status, priority, source_uri, source_label,
                 project_guess, owner_agent, needs_review, sensitive_data_flag,
                 proposed_notion_row, review_notes, approval_scope,
                 proposed_external_target, last_reviewed_at, source, created_at
          FROM capture_observations
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToCaptureObservation);
    }),

  triageObservation: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const capture = await captureObservationById(input.id);
      if (!capture) {
        return {
          mode: "proposal_only" as const,
          writesExternal: false,
          found: false as const,
          observationId: input.id,
          gates: ["No saved capture observation exists for this id."],
        };
      }

      return {
        found: true as const,
        capture,
        ...buildTriagePlan(capture),
      };
    }),

  proposalDetail: publicProcedure
    .input(
      z.object({
        kind: z.enum(["source", "reminder", "message"]),
        id: z.number().int(),
      }),
    )
    .query(async ({ input }) => {
      if (input.kind === "source") {
        const capture = await captureObservationById(input.id);
        if (!capture) {
          return {
            found: false as const,
            kind: input.kind,
            id: input.id,
            writesExternal: false,
            gates: ["No saved capture observation exists for this id."],
          };
        }
        return {
          found: true as const,
          kind: input.kind,
          id: input.id,
          writesExternal: false,
          statusOptions: sourceProposalStatuses,
          item: capture,
          triage: buildTriagePlan(capture),
          gates: [
            "This source proposal is local capture metadata only.",
            "Saving a source row does not fetch, crawl, browse, screenshot, or validate the URL.",
            "Surfer enrichment or open-web search requires separate approval.",
          ],
        };
      }

      if (input.kind === "reminder") {
        const reminder = await reminderProposalById(input.id);
        if (!reminder) {
          return {
            found: false as const,
            kind: input.kind,
            id: input.id,
            writesExternal: false,
            gates: ["No saved reminder proposal exists for this id."],
          };
        }
        return {
          found: true as const,
          kind: input.kind,
          id: input.id,
          writesExternal: false,
          statusOptions: proposalStatuses,
          item: reminder,
          gates: [
            "This reminder proposal is local metadata only.",
            "Scheduling, notifying, Slack posting, or calendar writes require separate approval.",
            reminder.approvalRequired,
          ],
        };
      }

      const draft = await messageDraftProposalById(input.id);
      if (!draft) {
        return {
          found: false as const,
          kind: input.kind,
          id: input.id,
          writesExternal: false,
          gates: ["No saved message draft proposal exists for this id."],
        };
      }
      return {
        found: true as const,
        kind: input.kind,
        id: input.id,
        writesExternal: false,
        statusOptions: proposalStatuses,
        item: draft,
        gates: [
          "This message draft proposal is local metadata only.",
          "Sending, posting, emailing, or Slack replies require separate approval.",
          draft.approvalRequired,
        ],
      };
    }),

  updateSourceProposalStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(sourceProposalStatuses),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE capture_observations
          SET status = ?,
              needs_review = CASE WHEN ? IN ('triaged', 'sourced', 'archived') THEN 0 ELSE needs_review END,
              last_reviewed_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.status, input.status, input.id],
      });
      return {
        ok: true,
        writesExternal: false,
        observation: await captureObservationById(input.id),
      };
    }),

  updateSourceProposalReview: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        priority: z.enum(priorities).optional(),
        reviewNotes: z.string().max(2000).nullable().optional(),
        approvalScope: z.string().max(500).nullable().optional(),
        proposedExternalTarget: z.string().max(500).nullable().optional(),
        needsReview: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE capture_observations
          SET priority = COALESCE(?, priority),
              review_notes = ?,
              approval_scope = ?,
              proposed_external_target = ?,
              needs_review = COALESCE(?, needs_review),
              last_reviewed_at = unixepoch()
          WHERE id = ?
        `,
        args: [
          input.priority ?? null,
          input.reviewNotes ?? null,
          input.approvalScope ?? null,
          input.proposedExternalTarget ?? null,
          input.needsReview == null ? null : input.needsReview ? 1 : 0,
          input.id,
        ],
      });
      return {
        ok: true,
        writesExternal: false,
        observation: await captureObservationById(input.id),
      };
    }),

  updateReminderProposalStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(proposalStatuses),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE reminder_proposals
          SET status = ?,
              last_reviewed_at = unixepoch(),
              updated_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.status, input.id],
      });
      return {
        ok: true,
        writesExternal: false,
        reminder: await reminderProposalById(input.id),
      };
    }),

  updateReminderProposalReview: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        reviewPriority: z.enum(priorities).optional(),
        reviewNotes: z.string().max(2000).nullable().optional(),
        approvalScope: z.string().max(500).nullable().optional(),
        proposedExternalTarget: z.string().max(500).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE reminder_proposals
          SET review_priority = COALESCE(?, review_priority),
              review_notes = ?,
              approval_scope = ?,
              proposed_external_target = ?,
              last_reviewed_at = unixepoch(),
              updated_at = unixepoch()
          WHERE id = ?
        `,
        args: [
          input.reviewPriority ?? null,
          input.reviewNotes ?? null,
          input.approvalScope ?? null,
          input.proposedExternalTarget ?? null,
          input.id,
        ],
      });
      return {
        ok: true,
        writesExternal: false,
        reminder: await reminderProposalById(input.id),
      };
    }),

  updateMessageDraftProposalStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(proposalStatuses),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE message_draft_proposals
          SET status = ?,
              last_reviewed_at = unixepoch(),
              updated_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.status, input.id],
      });
      return {
        ok: true,
        writesExternal: false,
        draft: await messageDraftProposalById(input.id),
      };
    }),

  updateMessageDraftProposalReview: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        reviewPriority: z.enum(priorities).optional(),
        reviewNotes: z.string().max(2000).nullable().optional(),
        approvalScope: z.string().max(500).nullable().optional(),
        proposedExternalTarget: z.string().max(500).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE message_draft_proposals
          SET review_priority = COALESCE(?, review_priority),
              review_notes = ?,
              approval_scope = ?,
              proposed_external_target = ?,
              last_reviewed_at = unixepoch(),
              updated_at = unixepoch()
          WHERE id = ?
        `,
        args: [
          input.reviewPriority ?? null,
          input.reviewNotes ?? null,
          input.approvalScope ?? null,
          input.proposedExternalTarget ?? null,
          input.id,
        ],
      });
      return {
        ok: true,
        writesExternal: false,
        draft: await messageDraftProposalById(input.id),
      };
    }),

  createApprovalPreviewFromProposal: publicProcedure
    .input(
      z.object({
        kind: z.enum(["source", "reminder", "message"]),
        id: z.number().int(),
        actionType: z.enum(approvalPreviewActions).optional(),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const item =
        input.kind === "source"
          ? await captureObservationById(input.id)
          : input.kind === "reminder"
            ? await reminderProposalById(input.id)
            : await messageDraftProposalById(input.id);
      if (!item) {
        return {
          ok: false as const,
          writesExternal: false,
          reason: "No local proposal exists for this id.",
        };
      }

      const actionType = input.actionType ?? defaultApprovalActionForKind(input.kind);
      const title = "title" in item ? item.title : `Proposal #${input.id}`;
      const contextParts = [
        `Hedwig proposal kind: ${input.kind}`,
        `Title: ${title}`,
        "rawText" in item ? `Raw text: ${item.rawText.slice(0, 700)}` : null,
        "sourceUri" in item && item.sourceUri ? `Source URI: ${item.sourceUri}` : null,
        "timingHint" in item && item.timingHint ? `Timing hint: ${item.timingHint}` : null,
        "recipientHint" in item && item.recipientHint ? `Recipient hint: ${item.recipientHint}` : null,
        "approvalScope" in item && item.approvalScope ? `Approval scope: ${item.approvalScope}` : null,
        "proposedExternalTarget" in item && item.proposedExternalTarget ? `Proposed external target: ${item.proposedExternalTarget}` : null,
      ].filter(Boolean).join("\n");

      const db = await getCerebroDb();
      const preflightInput = preflightForApprovalAction(actionType);
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: preflightInput.perceptionClass,
        actionClass: preflightInput.actionClass,
        externalTarget: preflightInput.externalTarget,
        sensitiveData: "sensitive" in item && item.sensitive ? true : false,
        requestedByAgent: "hedwig",
        targetSummary: `Hedwig ${input.kind} approval preview: ${title}`,
        additionalReasons: preflightInput.reasons,
      });
      const result = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            status, reason, context_summary, sensitive_data_flag, cost_risk,
            permission_preflight_id
          )
          VALUES (?, ?, ?, ?, 'hedwig', 'pending', ?, ?, ?, ?, ?)
          RETURNING id, task_id, action_type, target_type, target_id,
                    requested_by_agent, status, reason, context_summary,
                    sensitive_data_flag, cost_risk, permission_preflight_id,
                    decided_at, created_at
        `,
        args: [
          "taskId" in item ? item.taskId : null,
          actionType,
          targetTypeForKind(input.kind),
          input.id,
          input.reason ?? "Local approval preview staged from Hedwig proposal. This does not approve or execute the action.",
          contextParts,
          "sensitive" in item && item.sensitive ? 1 : 0,
          actionType === "source_enrichment" || actionType === "slack_capture_read" || actionType === "notion_capture_write"
            ? "external_tool_or_network_requires_review"
            : "external_write_requires_review",
          Number(preflight.row.id),
        ],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        writesExternal: false,
        approval: row ? rowToApprovalPreview(row) : null,
        gates: [
          "This is a pending local approval record only.",
          "Recorded one local permission preflight audit row for this approval preview.",
          "It does not approve the action, execute a command, browse/fetch, schedule, send, or write to Notion/Slack.",
          "The user still must explicitly approve any external write/tool action later.",
        ],
      };
    }),

  approvalPreviews: publicProcedure
    .input(
      z
        .object({
          targetType: z.string().max(80).optional(),
          targetId: z.number().int().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = ["requested_by_agent = 'hedwig'"];
      const args: (number | string)[] = [];
      if (input?.targetType) {
        where.push("target_type = ?");
        args.push(input.targetType);
      }
      if (input?.targetId !== undefined) {
        where.push("target_id = ?");
        args.push(input.targetId);
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

  createTaskFromObservation: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const capture = await captureObservationById(input.id);
      if (!capture) {
        return {
          ok: false,
          reason: "No saved capture observation exists for this id.",
          writesExternal: false,
        };
      }

      const triage = buildTriagePlan(capture);
      const projectId =
        capture.projectId ??
        (triage.taskDraft.projectName && triage.taskDraft.projectPath
          ? await getOrCreateProjectByPath(triage.taskDraft.projectName, triage.taskDraft.projectPath)
          : null);
      const db = await getCerebroDb();
      const task = await db.execute({
        sql: `
          INSERT INTO tasks (project_id, session_id, title, agent)
          VALUES (?, ?, ?, ?)
          RETURNING id, project_id, session_id, title, status, agent, created_at, updated_at
        `,
        args: [projectId, capture.sessionId, triage.taskDraft.title, triage.taskDraft.agent],
      });
      const taskId = Number(task.rows[0]!.id);
      await db.execute({
        sql: `
          UPDATE capture_observations
          SET task_id = ?,
              project_id = COALESCE(project_id, ?),
              status = 'tasked',
              needs_review = 0,
              last_reviewed_at = unixepoch()
          WHERE id = ?
        `,
        args: [taskId, projectId, input.id],
      });

      return {
        ok: true,
        writesExternal: false,
        task: {
          id: taskId,
          projectId,
          sessionId: capture.sessionId,
          title: String(task.rows[0]!.title),
          status: String(task.rows[0]!.status),
          agent: task.rows[0]!.agent == null ? null : String(task.rows[0]!.agent),
        },
        observation: await captureObservationById(input.id),
      };
    }),

  saveSourceFromObservation: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const capture = await captureObservationById(input.id);
      if (!capture) {
        return {
          ok: false,
          reason: "No saved capture observation exists for this id.",
          writesExternal: false,
        };
      }
      const triage = buildTriagePlan(capture);
      if (!triage.sourceDraft?.uri) {
        return {
          ok: false,
          reason: "This capture does not include a source URL to save.",
          writesExternal: false,
        };
      }

      const db = await getCerebroDb();
      const title = capture.title || triage.sourceDraft.title;
      const summary = capture.rawText.replace(/\s+/g, " ").trim().slice(0, 700);
      const result = await db.execute({
        sql: `
          INSERT INTO sources (
            kind, uri, title, summary, source_type, trust_level,
            freshness_status, content_type, word_count, sensitive_data_flag,
            scrub_notes, trust_notes, last_scrubbed_at, project_id, fetched_at
          )
          VALUES ('url', ?, ?, ?, 'hedwig_capture', 'unknown', 'unfetched', NULL, ?, ?, ?, ?, unixepoch(), ?, NULL)
          ON CONFLICT(uri) DO UPDATE SET
            title = excluded.title,
            summary = excluded.summary,
            source_type = excluded.source_type,
            freshness_status = excluded.freshness_status,
            word_count = excluded.word_count,
            sensitive_data_flag = excluded.sensitive_data_flag,
            scrub_notes = excluded.scrub_notes,
            trust_notes = excluded.trust_notes,
            last_scrubbed_at = excluded.last_scrubbed_at,
            project_id = COALESCE(excluded.project_id, sources.project_id)
          RETURNING id, uri, title, summary, source_type, trust_level,
                    freshness_status, content_type, word_count,
                    sensitive_data_flag, scrub_notes, trust_notes, project_id
        `,
        args: [
          triage.sourceDraft.uri,
          title,
          summary,
          summary.split(/\s+/).filter(Boolean).length,
          capture.sensitive ? 1 : 0,
          capture.sensitive
            ? "Saved from Hedwig capture; sensitive flag inherited from local preview."
            : "Saved from Hedwig capture without fetching page contents.",
          "Unfetched user-provided capture. Surfer/Oak should validate before relying on claims.",
          capture.projectId,
        ],
      });
      const source = result.rows[0];
      if (!source) {
        return {
          ok: false,
          reason: "Source save returned no row.",
          writesExternal: false,
        };
      }
      const sourceEventId = await recordSourceEvent({
        sourceId: Number(source.id),
        uri: String(source.uri),
        eventType: "hedwig_capture_source_save",
        title: source.title == null ? null : String(source.title),
        summary: source.summary == null ? null : String(source.summary),
        sourceType: source.source_type == null ? null : String(source.source_type),
        trustLevel: source.trust_level == null ? null : String(source.trust_level),
        freshnessStatus: source.freshness_status == null ? null : String(source.freshness_status),
        contentType: source.content_type == null ? null : String(source.content_type),
        wordCount: source.word_count == null ? null : Number(source.word_count),
        sensitiveDataFlag: Boolean(source.sensitive_data_flag),
        scrubNotes: source.scrub_notes == null ? null : String(source.scrub_notes),
        trustNotes: source.trust_notes == null ? null : String(source.trust_notes),
        projectId: source.project_id == null ? null : Number(source.project_id),
        ownerAgent: "hedwig",
        sourceLabel: capture.sourceLabel,
      });
      await db.execute({
        sql: `
          UPDATE capture_observations
          SET status = 'sourced',
              needs_review = 0,
              last_reviewed_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.id],
      });
      const artifactId = await recordArtifact({
        kind: "source_url",
        lifecycleState: "review",
        title,
        projectId: capture.projectId,
        taskId: capture.taskId,
        sessionId: capture.sessionId,
        ownerAgent: "hedwig",
        storageProvider: "external",
        storagePath: triage.sourceDraft.uri,
        sourceUri: triage.sourceDraft.uri,
        promptOrInstruction: "Saved locally from Hedwig capture preview without fetching page contents.",
        retentionRule: "keep_until_project_archive",
        sensitiveDataFlag: capture.sensitive,
      });

      return {
        ok: true,
        writesExternal: false,
        source: {
          id: Number(source.id),
          uri: String(source.uri),
          title: source.title == null ? null : String(source.title),
          summary: source.summary == null ? null : String(source.summary),
          projectId: source.project_id == null ? null : Number(source.project_id),
        },
        artifactId,
        sourceEventId,
        observation: await captureObservationById(input.id),
      };
    }),

  createReminderProposalFromObservation: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const capture = await captureObservationById(input.id);
      if (!capture) {
        return {
          ok: false,
          reason: "No saved capture observation exists for this id.",
          writesExternal: false,
        };
      }
      const triage = buildTriagePlan(capture);
      if (!triage.reminderDraft) {
        return {
          ok: false,
          reason: "This capture does not look like a reminder proposal.",
          writesExternal: false,
        };
      }

      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO reminder_proposals (
            project_id, task_id, session_id, capture_observation_id, title,
            timing_hint, raw_text, status, owner_agent, approval_required,
            review_priority, review_notes, approval_scope, proposed_external_target
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 'proposed', 'hedwig', ?, ?, ?, ?, ?)
          RETURNING id, project_id, task_id, session_id, capture_observation_id,
                    title, timing_hint, raw_text, status, owner_agent,
                    approval_required, review_priority, review_notes,
                    approval_scope, proposed_external_target, last_reviewed_at,
                    created_at, updated_at
        `,
        args: [
          capture.projectId,
          capture.taskId,
          capture.sessionId,
          capture.id,
          triage.reminderDraft.title,
          triage.reminderDraft.timingHint,
          capture.rawText,
          "Scheduling, notifying, Slack posting, or calendar writes require separate approval and a configured integration.",
          capture.priority,
          "Confirm exact date/time, notification channel, project link, and whether this should become a real scheduled reminder.",
          "schedule_or_notify",
          "Local reminder proposal only; Slack/calendar notification target is not connected.",
        ],
      });
      await db.execute({
        sql: `
          UPDATE capture_observations
          SET status = 'triaged',
              needs_review = 0,
              last_reviewed_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        writesExternal: false,
        reminder: row ? rowToReminderProposal(row) : null,
        observation: await captureObservationById(input.id),
      };
    }),

  reminderProposals: publicProcedure
    .input(
      z
        .object({
          status: z.string().max(40).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      if (input?.status) {
        where.push("status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT id, project_id, task_id, session_id, capture_observation_id,
                 title, timing_hint, raw_text, status, owner_agent,
                 approval_required, review_priority, review_notes,
                 approval_scope, proposed_external_target, last_reviewed_at,
                 created_at, updated_at
          FROM reminder_proposals
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToReminderProposal);
    }),

  createMessageDraftProposalFromObservation: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const capture = await captureObservationById(input.id);
      if (!capture) {
        return {
          ok: false,
          reason: "No saved capture observation exists for this id.",
          writesExternal: false,
        };
      }
      const triage = buildTriagePlan(capture);
      if (!triage.messageDraft) {
        return {
          ok: false,
          reason: "This capture does not look like a message draft proposal.",
          writesExternal: false,
        };
      }

      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO message_draft_proposals (
            project_id, task_id, session_id, capture_observation_id, title,
            recipient_hint, raw_text, draft_intent, status, owner_agent,
            approval_required, review_priority, review_notes, approval_scope,
            proposed_external_target
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'proposed', 'hedwig', ?, ?, ?, ?, ?)
          RETURNING id, project_id, task_id, session_id, capture_observation_id,
                    title, recipient_hint, raw_text, draft_intent, status,
                    owner_agent, approval_required, review_priority,
                    review_notes, approval_scope, proposed_external_target,
                    last_reviewed_at, created_at, updated_at
        `,
        args: [
          capture.projectId,
          capture.taskId,
          capture.sessionId,
          capture.id,
          triage.messageDraft.title,
          recipientHintFromText(capture.rawText),
          capture.rawText,
          "Draft a message for user review; do not send or post.",
          "Sending, posting, emailing, Slack replies, or external message writes require separate approval and a configured integration.",
          capture.priority,
          "Confirm recipient, channel, tone, sensitive content, and whether this should remain a draft or be sent through an approved integration.",
          "send_or_post_message",
          "Local message draft proposal only; Slack/email/iMessage target is not connected.",
        ],
      });
      await db.execute({
        sql: `
          UPDATE capture_observations
          SET status = 'triaged',
              needs_review = 0,
              last_reviewed_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        writesExternal: false,
        draft: row ? rowToMessageDraftProposal(row) : null,
        observation: await captureObservationById(input.id),
      };
    }),

  messageDraftProposals: publicProcedure
    .input(
      z
        .object({
          status: z.string().max(40).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      if (input?.status) {
        where.push("status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT id, project_id, task_id, session_id, capture_observation_id,
                 title, recipient_hint, raw_text, draft_intent, status,
                 owner_agent, approval_required, review_priority, review_notes,
                 approval_scope, proposed_external_target, last_reviewed_at,
                 created_at, updated_at
          FROM message_draft_proposals
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToMessageDraftProposal);
    }),
});
