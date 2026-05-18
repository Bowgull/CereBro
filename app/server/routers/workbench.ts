import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { browserActionProposalModel } from "../browserActionProposalModel";
import { getCerebroDb, getOrCreateProjectByPath } from "../cerebroDb";
import {
  GITHUB_PROJECT_MAP_PATH,
  GITHUB_SOURCES_INDEX_PATH,
  githubProjectBridgePath,
  githubRepositorySourcePath,
} from "../knowledge/contracts";
import { type PerceptionClass, recordPermissionPreflight } from "../permissionPolicy";
import { sessionDisplayName } from "./sessions";

const evidenceKinds = [
  "manual_note",
  "localhost_preview",
  "public_browser",
  "screenshot",
  "image_review",
  "video_frame",
  "annotation",
  "terminal_output",
  "validation_note",
  "before_after",
] as const;

const permissionClasses = ["manual_note", "local_preview", "public_browser", "media_review", "annotation", "validation"] as const;
const validationAgents = ["oak", "spock"] as const;
const evidenceGroupBys = ["project", "task", "session", "kind", "source", "command", "artifact", "validation_status"] as const;
const mediaKinds = ["image", "video", "video_frame", "unknown"] as const;
const browserDraftKinds = ["empty", "url", "search"] as const;
const browserProposalNoActionTaken = [
  "No browser opened.",
  "No page fetched.",
  "No source saved.",
  "No Workbench capture created.",
  "No Watch Shelf item saved.",
  "No credential action ran.",
  "No external write ran.",
];

function splitStoredList(value: unknown) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function browserProposalStatusLabel(status: unknown) {
  return String(status ?? "proposal_blocked").split("_").join(" ");
}

function rowToBrowserActionProposal(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    surface: "workbench_browser" as const,
    actionLabel: String(row.action_label),
    target: String(row.target),
    draftKind: String(row.draft_kind),
    riskClass: String(row.risk_class),
    executorAgent: String(row.executor_agent),
    statusLabel: browserProposalStatusLabel(row.status),
    canExecute: Boolean(row.can_execute),
    resultState: String(row.result_state),
    blockers: splitStoredList(row.blockers),
    requiredGates: splitStoredList(row.required_gates),
    receiptBody: String(row.receipt_body),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToBrowserApprovalPreview(row: Record<string, unknown>) {
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

async function pendingBrowserApprovalByProposalId(proposalId: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, task_id, action_type, target_type, target_id,
             requested_by_agent, status, reason, context_summary,
             sensitive_data_flag, cost_risk, permission_preflight_id,
             decided_at, created_at
      FROM approvals
      WHERE target_type = 'browser_action_proposal'
        AND target_id = ?
        AND status = 'pending'
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    args: [proposalId],
  });
  return result.rows[0] ? rowToBrowserApprovalPreview(result.rows[0] as Record<string, unknown>) : null;
}

function rowToEvidence(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    kind: String(row.kind),
    title: String(row.title),
    summary: String(row.summary),
    targetUri: row.target_uri == null ? null : String(row.target_uri),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    taskId: row.task_id == null ? null : Number(row.task_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    sourceId: row.source_id == null ? null : Number(row.source_id),
    commandObservationId: row.command_observation_id == null ? null : Number(row.command_observation_id),
    artifactId: row.artifact_id == null ? null : Number(row.artifact_id),
    ownerAgent: String(row.owner_agent),
    routeAgent: row.route_agent == null ? null : String(row.route_agent),
    viewport: row.viewport == null ? null : String(row.viewport),
    coordinates: row.coordinates == null ? null : String(row.coordinates),
    annotationText: row.annotation_text == null ? null : String(row.annotation_text),
    mediaName: row.media_name == null ? null : String(row.media_name),
    mediaMimeType: row.media_mime_type == null ? null : String(row.media_mime_type),
    mediaByteSize: row.media_byte_size == null ? null : Number(row.media_byte_size),
    mediaKind: row.media_kind == null ? null : String(row.media_kind),
    mediaFrameTimeSec: row.media_frame_time_sec == null ? null : Number(row.media_frame_time_sec),
    mediaDurationSec: row.media_duration_sec == null ? null : Number(row.media_duration_sec),
    mediaTemporary: Boolean(row.media_temporary_flag),
    beforeEvidenceId: row.before_evidence_id == null ? null : Number(row.before_evidence_id),
    afterEvidenceId: row.after_evidence_id == null ? null : Number(row.after_evidence_id),
    comparisonResult: row.comparison_result == null ? null : String(row.comparison_result),
    validationStatus: String(row.validation_status),
    permissionClass: String(row.permission_class),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    sensitive: Boolean(row.sensitive_data_flag),
    createdAt: Number(row.created_at),
    taskTitle: row.task_title == null ? null : String(row.task_title),
    sessionClaudeId: row.claude_session_id == null ? null : String(row.claude_session_id),
    sessionDisplayName:
      row.session_id == null
        ? null
        : sessionDisplayName({
            id: Number(row.session_id),
            title: row.session_title == null ? null : String(row.session_title),
            projectName: row.session_project_name == null ? (row.project_name == null ? null : String(row.project_name)) : String(row.session_project_name),
            heroClass: row.session_hero_class == null ? null : String(row.session_hero_class),
            endedAt: row.session_ended_at == null ? null : Number(row.session_ended_at),
          }),
    sourceTitle: row.source_title == null ? null : String(row.source_title),
    sourceUri: row.source_uri == null ? null : String(row.source_uri),
    command: row.command == null ? null : String(row.command),
    artifactTitle: row.artifact_title == null ? null : String(row.artifact_title),
    artifactPath: row.storage_path == null ? null : String(row.storage_path),
    executionResultId: row.execution_result_id == null ? null : Number(row.execution_result_id),
    executionResultStatus: row.execution_result_status == null ? null : String(row.execution_result_status),
    executionResultExitCode: row.execution_result_exit_code == null ? null : Number(row.execution_result_exit_code),
  };
}

function projectKnowledgeRoute(projectName: string | null) {
  if (!projectName) return null;
  return {
    mode: "read_only" as const,
    projectBridgePath: githubProjectBridgePath(projectName),
    repositorySourcePath: githubRepositorySourcePath(projectName),
    projectMapPath: GITHUB_PROJECT_MAP_PATH,
    sourcesIndexPath: GITHUB_SOURCES_INDEX_PATH,
    archiveLane: "90_Archive" as const,
    archiveRetrieval: "archive_only" as const,
    writesExternalSystems: false,
    approvalGate: "Creating or updating bridge/source notes requires an explicit write approval.",
  };
}

function preflightInputForEvidence(input: {
  permissionClass: (typeof permissionClasses)[number];
}) {
  const perceptionClass: PerceptionClass =
    input.permissionClass === "public_browser" ? "public_browser"
    : input.permissionClass === "local_preview" ? "local_files"
    : input.permissionClass === "manual_note" ? "explicit_context"
    : "workbench_media";

  const additionalReasons = ["Workbench evidence records are local append-only history."];
  if (input.permissionClass === "media_review" || input.permissionClass === "annotation") {
    additionalReasons.push("Local Workbench evidence and annotations may be recorded without opening browser/media capture tools.");
  }
  if (input.permissionClass === "local_preview") {
    additionalReasons.push("Local preview metadata can be recorded as evidence, but opening or capturing a preview stays separately gated.");
  }
  if (input.permissionClass === "validation") {
    additionalReasons.push("Validation notes are local evidence records. They do not approve external claims or actions.");
  }

  return {
    perceptionClass,
    actionClass: "local_note" as const,
    additionalReasons,
  };
}

async function recordEvidencePreflight(input: {
  permissionClass: (typeof permissionClasses)[number];
  sensitive: boolean;
  requestedByAgent: string;
  targetSummary: string;
}) {
  const db = await getCerebroDb();
  const preflight = preflightInputForEvidence({
    permissionClass: input.permissionClass,
  });
  const { row } = await recordPermissionPreflight(db, {
    perceptionClass: preflight.perceptionClass,
    actionClass: preflight.actionClass,
    sensitiveData: input.sensitive,
    requestedByAgent: input.requestedByAgent,
    targetSummary: input.targetSummary,
    additionalReasons: preflight.additionalReasons,
  });
  return Number(row.id);
}

function runtimeRouteIdFromTarget(targetUri: string | null | undefined) {
  const match = targetUri?.match(/^runtime_route:(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function resolveRuntimeRouteEvidenceLink(input: {
  targetUri: string | null | undefined;
  projectId: number | null | undefined;
  taskId: number | null | undefined;
}) {
  const routeRecordId = runtimeRouteIdFromTarget(input.targetUri);
  if (routeRecordId == null) {
    return {
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
    };
  }

  const db = await getCerebroDb();
  const route = await db.execute({
    sql: `
      SELECT project_name, project_path, task_id
      FROM runtime_route_records
      WHERE id = ?
      LIMIT 1
    `,
    args: [routeRecordId],
  });
  const row = route.rows[0];
  if (!row) {
    return {
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
    };
  }

  let projectId = input.projectId ?? null;
  if (projectId == null && row.project_name != null && row.project_path != null) {
    projectId = await getOrCreateProjectByPath(String(row.project_name), String(row.project_path));
  }

  return {
    projectId,
    taskId: input.taskId ?? (row.task_id == null ? null : Number(row.task_id)),
  };
}

function evidenceWhere(input?: {
  projectId?: number;
  kind?: (typeof evidenceKinds)[number];
  query?: string;
  executionLinked?: boolean;
}) {
  const where: string[] = [];
  const args: (number | string)[] = [];
  if (input?.projectId !== undefined) {
    where.push("wer.project_id = ?");
    args.push(input.projectId);
  }
  if (input?.kind !== undefined) {
    where.push("wer.kind = ?");
    args.push(input.kind);
  }
  if (input?.executionLinked) {
    where.push(`
      EXISTS (
        SELECT 1
        FROM execution_action_results ear
        INNER JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
        WHERE eap.workbench_evidence_id = wer.id
      )
    `);
  }
  const query = input?.query?.trim();
  if (query) {
    where.push(`
      (
        wer.title LIKE ?
        OR wer.summary LIKE ?
        OR COALESCE(wer.target_uri, '') LIKE ?
        OR COALESCE(wer.media_name, '') LIKE ?
        OR COALESCE(wer.media_mime_type, '') LIKE ?
        OR COALESCE(wer.validation_status, '') LIKE ?
        OR COALESCE(p.name, '') LIKE ?
        OR COALESCE(t.title, '') LIKE ?
        OR COALESCE(s.claude_session_id, '') LIKE ?
        OR COALESCE(src.title, '') LIKE ?
        OR COALESCE(src.uri, '') LIKE ?
        OR COALESCE(co.command, '') LIKE ?
        OR COALESCE(a.title, '') LIKE ?
        OR COALESCE(a.storage_path, '') LIKE ?
      )
    `);
    const like = `%${query}%`;
    args.push(like, like, like, like, like, like, like, like, like, like, like, like, like, like);
  }
  return { where, args };
}

export const workbenchRouter = router({
  plan: publicProcedure.query(() => ({
    mode: "proposal_only" as const,
    writesExternal: false,
    opensBrowser: false,
    capturesMedia: false,
    ownerAgent: "cortana",
    supportAgents: ["gojo", "surfer", "tony", "oak", "spock", "aang"],
    summary:
      "The modular workbench is the visible evidence surface for previews, browser views, screenshots, images, video frames, annotations, terminal output, validation notes, and before/after review.",
    surfaces: [
      {
        id: "localhost_preview",
        label: "Localhost preview",
        ownerAgent: "tony",
        status: "planned",
        permission: "Requires explicit local preview approval and a target URL.",
        records: ["url", "project_id", "task_id", "session_id", "opened_at", "last_refresh_at"],
      },
      {
        id: "public_browser",
        label: "Public browser view",
        ownerAgent: "surfer",
        status: "planned",
        permission: "Public HTTP/HTTPS only. No login, private workspace, crawling, or form submission without separate approval.",
        records: ["url", "source_id", "trust_level", "freshness_status", "opened_at"],
      },
      {
        id: "screenshots",
        label: "Screenshots",
        ownerAgent: "gojo",
        status: "planned",
        permission: "Capture only from approved workbench targets.",
        records: ["image_path", "target_url", "viewport", "created_at", "owner_agent"],
      },
      {
        id: "image_video_review",
        label: "Image and video review",
        ownerAgent: "gojo",
        status: "partially_live",
        permission: "Local/uploaded/generated assets only. Temporary image/video previews stay browser-local. Durable saves use vault artifact rules.",
        records: ["file_name", "mime_type", "byte_size", "artifact_id", "frame_time", "media_kind", "notes"],
      },
      {
        id: "annotation_canvas",
        label: "Annotation canvas",
        ownerAgent: "gojo",
        status: "planned",
        permission: "Annotations are local evidence records. Routing to agents is explicit.",
        records: ["x", "y", "width", "height", "viewport", "note", "target_agent", "project_id", "task_id", "session_id"],
      },
      {
        id: "terminal_output",
        label: "Terminal and log output",
        ownerAgent: "tony",
        status: "partially_live",
        permission: "Read from Terminal Lab observations only. No command execution from Workbench.",
        records: ["command_observation_id", "output_summary", "risk", "status"],
      },
      {
        id: "validation_notes",
        label: "Validation notes",
        ownerAgent: "oak",
        status: "partially_live",
        permission: "Deterministic preflight notes are allowed. Human approval still gates action.",
        records: ["validator_agent", "target_type", "target_id", "findings"],
      },
      {
        id: "before_after",
        label: "Before and after comparison",
        ownerAgent: "spock",
        status: "partially_live",
        permission: "Compare local evidence records. No hidden capture.",
        records: ["before_evidence_id", "after_evidence_id", "comparison_notes", "result"],
      },
    ],
    permissionModel: [
      {
        class: "local_preview",
        allowed: ["Open approved localhost URL", "Refresh view", "Record visible target metadata"],
        blocked: ["Start dev server automatically", "Edit repo", "Run terminal commands"],
      },
      {
        class: "public_browser",
        allowed: ["Open approved public URL", "Record source metadata", "Route visible evidence to Surfer/Oak"],
        blocked: ["Login", "Private pages", "Crawling", "Form submission", "Download without approval"],
      },
      {
        class: "media_review",
        allowed: ["Show local artifact", "Capture annotation coordinates", "Create local review notes"],
        blocked: ["Generate new media", "Save durable artifact", "Upload externally"],
      },
      {
        class: "annotation",
        allowed: ["Attach coordinates to a task/session/project", "Route note to selected agent"],
        blocked: ["Mutate target file", "Approve implementation", "Write external notes"],
      },
      {
        class: "validation",
        allowed: ["Show Oak/Spock preflight notes", "Link evidence records"],
        blocked: ["Mark high-stakes claims validated without review", "Approve external action"],
      },
    ],
    groupingModel: [
      "Project grouping shows which local project owns the evidence.",
      "Source grouping shows saved-source links without fetching the source.",
      "Command grouping shows Terminal Lab observation links without executing the command.",
      "Validation grouping shows current local status based on appended records.",
    ],
    evidenceRecordShape: {
      required: ["kind", "target_uri_or_artifact", "project_id", "task_id", "session_id", "owner_agent", "created_at"],
      optional: ["source_id", "command_observation_id", "viewport", "coordinates", "annotation_text", "validation_status"],
      appendOnly: true,
      note: "Evidence records are history. They append or version. Current-state summaries can update separately.",
    },
    gates: [
      "This plan does not open a browser, iframe, camera, file picker, screenshot tool, video tool, or terminal.",
      "Workbench evidence must be user-visible and agent-readable.",
      "Browser, media capture, durable saves, external tools, and command execution each need explicit approval when implemented.",
    ],
  })),

  browserActionProposalPreview: publicProcedure
    .input(
      z.object({
        actionLabel: z.string().min(1).max(80),
        target: z.string().max(1000),
        draftKind: z.enum(browserDraftKinds),
      }),
    )
    .query(({ input }) => browserActionProposalModel(input)),

  createBrowserActionProposal: publicProcedure
    .input(
      z.object({
        actionLabel: z.string().min(1).max(80),
        target: z.string().max(1000),
        draftKind: z.enum(browserDraftKinds),
      }),
    )
    .mutation(async ({ input }) => {
      const proposal = browserActionProposalModel(input);
      const db = await getCerebroDb();
      const receiptBody = [
        `${proposal.actionLabel} Browser action proposal.`,
        `Target: ${proposal.target}`,
        `Risk: ${proposal.riskClass}`,
        `Executor: ${proposal.executorAgent}`,
        "Status: proposal blocked.",
        proposal.noActionTaken.join(" "),
      ].join("\n");
      const saved = await db.execute({
        sql: `
          INSERT INTO browser_action_proposals (
            action_label, target, draft_kind, risk_class, executor_agent,
            required_gates, blockers, receipt_body, status, result_state,
            can_execute
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'proposal_blocked', 'not_run', 0)
          RETURNING *
        `,
        args: [
          proposal.actionLabel,
          proposal.target,
          proposal.draftKind,
          proposal.riskClass,
          proposal.executorAgent,
          proposal.requiredGates.join("\n"),
          proposal.blockers.join("\n"),
          receiptBody,
        ],
      });

      return {
        ok: true as const,
        proposal: {
          ...proposal,
          id: Number(saved.rows[0]!.id),
          createdAt: Number(saved.rows[0]!.created_at),
          updatedAt: Number(saved.rows[0]!.updated_at),
        },
        noActionTaken: proposal.noActionTaken,
      };
    }),

  browserActionProposals: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT *
          FROM browser_action_proposals
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input?.limit ?? 5],
      });

      return {
        items: result.rows.map(rowToBrowserActionProposal),
        noActionTaken: browserProposalNoActionTaken,
      };
    }),

  createBrowserActionApprovalPreview: publicProcedure
    .input(
      z.object({
        proposalId: z.number().int().positive(),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const proposalResult = await db.execute({
        sql: `
          SELECT *
          FROM browser_action_proposals
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.proposalId],
      });
      const row = proposalResult.rows[0] as Record<string, unknown> | undefined;
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Browser action proposal not found.",
        });
      }

      const existingApproval = await pendingBrowserApprovalByProposalId(input.proposalId);
      if (existingApproval) {
        return {
          ok: true as const,
          mode: "local_browser_action_approval_preview" as const,
          created: false,
          writesExternal: false,
          opensBrowser: false,
          wouldExecute: false,
          approval: existingApproval,
          gates: [
            "Existing pending local Browser approval preview returned.",
            "No browser opened, page fetched, source saved, Workbench capture created, or external write ran.",
          ],
        };
      }

      const proposal = rowToBrowserActionProposal(row);
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: "public_browser",
        actionClass: proposal.riskClass === "browser_write" ? "external_write" : "browser_or_media_capture",
        externalTarget: proposal.draftKind !== "empty",
        sensitiveData: false,
        requestedByAgent: proposal.executorAgent,
        targetSummary: `Browser action approval preview: ${proposal.actionLabel} ${proposal.target}`,
        additionalReasons: [
          "Browser approval previews are local metadata only.",
          "The browser proposal still needs runner, Spock gate, Workbench body, result receipt, and recovery note before execution can be considered.",
          "This preview does not open, fetch, search, save, capture, or write externally.",
        ],
      });
      const contextSummary = [
        `Browser proposal #${proposal.id}: ${proposal.actionLabel}`,
        `Target: ${proposal.target}`,
        `Draft kind: ${proposal.draftKind}`,
        `Risk: ${proposal.riskClass}`,
        `Executor: ${proposal.executorAgent}`,
        `Result state: ${proposal.resultState}`,
        `Required gates: ${proposal.requiredGates.join(", ")}`,
        `Blockers: ${proposal.blockers.join(", ")}`,
      ].join("\n");
      const result = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            status, reason, context_summary, sensitive_data_flag, cost_risk,
            permission_preflight_id
          )
          VALUES (NULL, 'browser_action_review', 'browser_action_proposal', ?, ?,
                  'pending', ?, ?, 0, ?, ?)
          RETURNING id, task_id, action_type, target_type, target_id,
                    requested_by_agent, status, reason, context_summary,
                    sensitive_data_flag, cost_risk, permission_preflight_id,
                    decided_at, created_at
        `,
        args: [
          proposal.id,
          proposal.executorAgent,
          input.reason ?? "Local Browser action approval preview only. This does not run or approve browser work.",
          contextSummary,
          proposal.riskClass,
          Number(preflight.row.id),
        ],
      });
      const approval = result.rows[0]
        ? rowToBrowserApprovalPreview(result.rows[0] as Record<string, unknown>)
        : await pendingBrowserApprovalByProposalId(proposal.id);

      return {
        ok: Boolean(approval),
        mode: "local_browser_action_approval_preview" as const,
        created: Boolean(result.rows[0]),
        writesExternal: false,
        opensBrowser: false,
        wouldExecute: false,
        approval,
        gates: [
          "Created one pending local Browser approval preview.",
          "Recorded one local permission preflight audit row.",
          "No browser opened, page fetched, source saved, Workbench capture created, or external write ran.",
          "Approval preview is not execution permission.",
        ],
      };
    }),

  createBrowserActionWorkbenchBody: publicProcedure
    .input(
      z.object({
        proposalId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const proposalResult = await db.execute({
        sql: `
          SELECT *
          FROM browser_action_proposals
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.proposalId],
      });
      const row = proposalResult.rows[0] as Record<string, unknown> | undefined;
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Browser action proposal not found.",
        });
      }

      const proposal = rowToBrowserActionProposal(row);
      const permissionPreflightId = await recordEvidencePreflight({
        permissionClass: "public_browser",
        sensitive: false,
        requestedByAgent: proposal.executorAgent,
        targetSummary: `browser_action_proposal:${proposal.id}`,
      });
      const summary = [
        `Browser proposal #${proposal.id}: ${proposal.actionLabel}`,
        `Target: ${proposal.target}`,
        `Draft kind: ${proposal.draftKind}`,
        `Risk: ${proposal.riskClass}`,
        `Executor: ${proposal.executorAgent}`,
        `Status: ${proposal.statusLabel}`,
        `Result state: ${proposal.resultState}`,
        `Required gates: ${proposal.requiredGates.join(", ")}`,
        `No action: ${browserProposalNoActionTaken.join(" ")}`,
      ].join("\n");
      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, owner_agent, route_agent,
            validation_status, permission_class, permission_preflight_id,
            sensitive_data_flag
          )
          VALUES ('public_browser', ?, ?, ?, 'cortana', ?, 'unvalidated', 'public_browser', ?, 0)
          RETURNING *
        `,
        args: [
          `Browser proposal #${proposal.id} body`,
          summary,
          `browser_action_proposal:${proposal.id}`,
          proposal.executorAgent,
          permissionPreflightId,
        ],
      });
      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created one local Workbench body receipt for a Browser proposal.",
          "Recorded one local permission preflight audit row for this evidence record.",
          "This did not open a browser, fetch a page, save a source, capture media, approve work, or write externally.",
        ],
      };
    }),

  evidence: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().int().optional(),
          kind: z.enum(evidenceKinds).optional(),
          query: z.string().max(200).optional(),
          executionLinked: z.boolean().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const { where, args } = evidenceWhere(input);
      args.push(input?.limit ?? 30);
      const result = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            (
              SELECT ear.id
              FROM execution_action_results ear
              INNER JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
              WHERE eap.workbench_evidence_id = wer.id
              ORDER BY ear.created_at DESC, ear.id DESC
              LIMIT 1
            ) AS execution_result_id,
            (
              SELECT ear.status
              FROM execution_action_results ear
              INNER JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
              WHERE eap.workbench_evidence_id = wer.id
              ORDER BY ear.created_at DESC, ear.id DESC
              LIMIT 1
            ) AS execution_result_status,
            (
              SELECT ear.exit_code
              FROM execution_action_results ear
              INNER JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
              WHERE eap.workbench_evidence_id = wer.id
              ORDER BY ear.created_at DESC, ear.id DESC
              LIMIT 1
            ) AS execution_result_exit_code
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY wer.created_at DESC, wer.id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToEvidence);
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        items,
        summary: {
          total: items.length,
          sensitive: items.filter((item) => item.sensitive).length,
          annotations: items.filter((item) => item.kind === "annotation").length,
          validationNotes: items.filter((item) => item.kind === "validation_note").length,
        },
        gates: [
          "Workbench evidence is local append-only history.",
          "Listing evidence does not open browser/media tools, execute commands, or write externally.",
        ],
      };
    }),

  evidencePicker: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().int().optional(),
          kind: z.enum(evidenceKinds).optional(),
          query: z.string().max(200).optional(),
          excludeId: z.number().int().optional(),
          limit: z.number().int().min(1).max(200).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const { where, args } = evidenceWhere(input);
      if (input?.excludeId !== undefined) {
        where.push("wer.id != ?");
        args.push(input.excludeId);
      }
      args.push(input?.limit ?? 80);
      const result = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            t.title AS task_title,
            s.claude_session_id,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            src.title AS source_title,
            src.uri AS source_uri,
            co.command,
            a.title AS artifact_title,
            a.storage_path
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY wer.created_at DESC, wer.id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToEvidence);
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        executesCommand: false,
        items,
        summary: {
          total: items.length,
          sensitive: items.filter((item) => item.sensitive).length,
          media: items.filter((item) => item.mediaName != null || item.kind === "image_review" || item.kind === "video_frame").length,
          comparisons: items.filter((item) => item.kind === "before_after").length,
        },
        gates: [
          "Evidence picker reads local Workbench records only.",
          "Picking evidence does not open linked targets, fetch sources, execute commands, capture media, or write externally.",
        ],
      };
    }),

  evidenceGroups: publicProcedure
    .input(
      z
        .object({
          groupBy: z.enum(evidenceGroupBys).default("project"),
          projectId: z.number().int().optional(),
          kind: z.enum(evidenceKinds).optional(),
          query: z.string().max(200).optional(),
          executionLinked: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const groupBy = input?.groupBy ?? "project";
      const { where, args } = evidenceWhere(input);
      const result = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            t.title AS task_title,
            s.claude_session_id,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            src.title AS source_title,
            src.uri AS source_uri,
            co.command,
            a.title AS artifact_title,
            a.storage_path
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY wer.created_at DESC, wer.id DESC
          LIMIT 300
        `,
        args,
      });
      const groups = new Map<string, {
        key: string;
        label: string;
        count: number;
        sensitive: number;
        validationNotes: number;
        latestAt: number;
        sampleIds: number[];
      }>();
      for (const row of result.rows) {
        const item = rowToEvidence(row);
        const key =
          groupBy === "project" ? String(item.projectId ?? "unlinked")
          : groupBy === "task" ? String(item.taskId ?? "unlinked")
          : groupBy === "session" ? String(item.sessionId ?? "unlinked")
          : groupBy === "kind" ? item.kind
          : groupBy === "source" ? String(item.sourceId ?? "unlinked")
          : groupBy === "command" ? String(item.commandObservationId ?? "unlinked")
          : groupBy === "artifact" ? String(item.artifactId ?? "unlinked")
          : item.validationStatus;
        const label =
          groupBy === "project" ? (item.projectName ?? "Unlinked project")
          : groupBy === "task" ? (item.taskTitle ?? "Unlinked task")
          : groupBy === "session" ? (item.sessionClaudeId ?? "Unlinked session")
          : groupBy === "kind" ? item.kind.replace(/_/g, " ")
          : groupBy === "source" ? (item.sourceTitle ?? item.sourceUri ?? "Unlinked source")
          : groupBy === "command" ? (item.command ?? "Unlinked command")
          : groupBy === "artifact" ? (item.artifactTitle ?? item.artifactPath ?? "Unlinked artifact")
          : item.validationStatus.replace(/_/g, " ");
        const existing = groups.get(key) ?? {
          key,
          label,
          count: 0,
          sensitive: 0,
          validationNotes: 0,
          latestAt: 0,
          sampleIds: [],
        };
        existing.count += 1;
        existing.sensitive += item.sensitive ? 1 : 0;
        existing.validationNotes += item.kind === "validation_note" ? 1 : 0;
        existing.latestAt = Math.max(existing.latestAt, item.createdAt);
        if (existing.sampleIds.length < 4) existing.sampleIds.push(item.id);
        groups.set(key, existing);
      }

      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        executesCommand: false,
        groupBy,
        groups: Array.from(groups.values()).sort((a, b) => b.count - a.count || b.latestAt - a.latestAt),
        gates: [
          "Evidence grouping reads local records only.",
          "Source and command groups are links to existing metadata. They do not fetch sources or execute commands.",
        ],
      };
    }),

  evidenceSummary: publicProcedure
    .input(
      z
        .object({
          groupBy: z.enum(evidenceGroupBys).default("project"),
          projectId: z.number().int().optional(),
          kind: z.enum(evidenceKinds).optional(),
          query: z.string().max(200).optional(),
          latestLimit: z.number().int().min(1).max(100).default(40),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const groupBy = input?.groupBy ?? "project";
      const { where, args } = evidenceWhere(input);
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const baseFrom = `
        FROM workbench_evidence_records wer
        LEFT JOIN projects p ON p.id = wer.project_id
        LEFT JOIN tasks t ON t.id = wer.task_id
        LEFT JOIN sessions s ON s.id = wer.session_id
        LEFT JOIN sources src ON src.id = wer.source_id
        LEFT JOIN command_observations co ON co.id = wer.command_observation_id
        LEFT JOIN artifacts a ON a.id = wer.artifact_id
        ${whereSql}
      `;

      const summaryResult = await db.execute({
        sql: `
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN wer.sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive,
            SUM(CASE WHEN wer.kind = 'terminal_output' THEN 1 ELSE 0 END) AS terminal,
            SUM(CASE WHEN wer.kind = 'validation_note' THEN 1 ELSE 0 END) AS validation_notes,
            SUM(CASE WHEN wer.validation_status = 'needs_review' THEN 1 ELSE 0 END) AS needs_review,
            SUM(CASE WHEN wer.validation_status IN ('validated_for_local_use', 'looks_consistent') THEN 1 ELSE 0 END) AS validated
          ${baseFrom}
        `,
        args,
      });

      const latestResult = await db.execute({
        sql: `
          SELECT
            wer.id,
            wer.kind,
            wer.title,
            wer.project_id,
            p.name AS project_name,
            wer.task_id,
            wer.session_id,
            wer.command_observation_id,
            wer.artifact_id,
            wer.validation_status,
            wer.sensitive_data_flag,
            wer.created_at
          ${baseFrom}
          ORDER BY wer.created_at DESC, wer.id DESC
          LIMIT ?
        `,
        args: [...args, input?.latestLimit ?? 40],
      });

      const groupKeySql =
        groupBy === "project" ? "COALESCE(CAST(wer.project_id AS TEXT), 'unlinked')"
        : groupBy === "task" ? "COALESCE(CAST(wer.task_id AS TEXT), 'unlinked')"
        : groupBy === "session" ? "COALESCE(CAST(wer.session_id AS TEXT), 'unlinked')"
        : groupBy === "kind" ? "wer.kind"
        : groupBy === "source" ? "COALESCE(CAST(wer.source_id AS TEXT), 'unlinked')"
        : groupBy === "command" ? "COALESCE(CAST(wer.command_observation_id AS TEXT), 'unlinked')"
        : groupBy === "artifact" ? "COALESCE(CAST(wer.artifact_id AS TEXT), 'unlinked')"
        : "wer.validation_status";
      const groupLabelSql =
        groupBy === "project" ? "COALESCE(p.name, 'Unlinked project')"
        : groupBy === "task" ? "COALESCE(t.title, 'Unlinked task')"
        : groupBy === "session" ? "COALESCE(s.claude_session_id, 'Unlinked session')"
        : groupBy === "kind" ? "REPLACE(wer.kind, '_', ' ')"
        : groupBy === "source" ? "COALESCE(src.title, src.uri, 'Unlinked source')"
        : groupBy === "command" ? "COALESCE(co.command, 'Unlinked command')"
        : groupBy === "artifact" ? "COALESCE(a.title, a.storage_path, 'Unlinked artifact')"
        : "REPLACE(wer.validation_status, '_', ' ')";

      const groupsResult = await db.execute({
        sql: `
          SELECT
            ${groupKeySql} AS group_key,
            ${groupLabelSql} AS group_label,
            COUNT(*) AS total,
            SUM(CASE WHEN wer.sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive,
            SUM(CASE WHEN wer.kind = 'terminal_output' THEN 1 ELSE 0 END) AS terminal,
            SUM(CASE WHEN wer.kind = 'validation_note' THEN 1 ELSE 0 END) AS validation_notes,
            SUM(CASE WHEN wer.validation_status = 'needs_review' THEN 1 ELSE 0 END) AS needs_review,
            SUM(CASE WHEN wer.validation_status IN ('validated_for_local_use', 'looks_consistent') THEN 1 ELSE 0 END) AS validated,
            MAX(wer.created_at) AS latest_at
          ${baseFrom}
          GROUP BY group_key, group_label
          ORDER BY total DESC, latest_at DESC
          LIMIT 100
        `,
        args,
      });

      const summary = summaryResult.rows[0] ?? {};
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        executesCommand: false,
        groupBy,
        summary: {
          total: Number(summary.total ?? 0),
          sensitive: Number(summary.sensitive ?? 0),
          terminal: Number(summary.terminal ?? 0),
          validationNotes: Number(summary.validation_notes ?? 0),
          needsReview: Number(summary.needs_review ?? 0),
          validated: Number(summary.validated ?? 0),
        },
        groups: groupsResult.rows.map((row) => ({
          key: String(row.group_key),
          label: String(row.group_label),
          count: Number(row.total ?? 0),
          sensitive: Number(row.sensitive ?? 0),
          terminal: Number(row.terminal ?? 0),
          validationNotes: Number(row.validation_notes ?? 0),
          needsReview: Number(row.needs_review ?? 0),
          validated: Number(row.validated ?? 0),
          latestAt: Number(row.latest_at ?? 0),
        })),
        latest: latestResult.rows.map((row) => ({
          id: Number(row.id),
          kind: String(row.kind),
          title: String(row.title),
          projectId: row.project_id == null ? null : Number(row.project_id),
          projectName: row.project_name == null ? null : String(row.project_name),
          taskId: row.task_id == null ? null : Number(row.task_id),
          sessionId: row.session_id == null ? null : Number(row.session_id),
          commandObservationId: row.command_observation_id == null ? null : Number(row.command_observation_id),
          artifactId: row.artifact_id == null ? null : Number(row.artifact_id),
          validationStatus: String(row.validation_status),
          sensitive: Boolean(row.sensitive_data_flag),
          createdAt: Number(row.created_at),
        })),
        gates: [
          "Workbench evidence summary is read-only.",
          "This summary reads local receipts only. It does not fetch sources, execute commands, open browsers, capture media, or write externally.",
        ],
      };
    }),

  evidenceDetail: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            t.title AS task_title,
            s.claude_session_id,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            src.title AS source_title,
            src.uri AS source_uri,
            co.command,
            a.title AS artifact_title,
            a.storage_path,
            ppr.decision AS preflight_decision,
            ppr.required_approvals AS preflight_required_approvals,
            ppr.reasons AS preflight_reasons,
            ppr.mode AS preflight_mode
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          LEFT JOIN permission_preflight_records ppr ON ppr.id = wer.permission_preflight_id
          WHERE wer.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      if (!row) {
        return {
          found: false as const,
          id: input.id,
          writesExternal: false,
          opensBrowser: false,
          capturesMedia: false,
          gates: ["No Workbench evidence record exists for this id."],
        };
      }
      const [validationHistory, comparisonHistory, executionResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT
              wer.*,
              p.name AS project_name,
              s.claude_session_id,
              s.title AS session_title,
              s.hero_class AS session_hero_class,
              s.ended_at AS session_ended_at
            FROM workbench_evidence_records wer
            LEFT JOIN projects p ON p.id = wer.project_id
            LEFT JOIN sessions s ON s.id = wer.session_id
            WHERE wer.kind = 'validation_note' AND wer.target_uri = ?
            ORDER BY wer.created_at ASC, wer.id ASC
          `,
          args: [`evidence:${input.id}`],
        }),
        db.execute({
          sql: `
            SELECT
              wer.*,
              p.name AS project_name,
              s.claude_session_id,
              s.title AS session_title,
              s.hero_class AS session_hero_class,
              s.ended_at AS session_ended_at
            FROM workbench_evidence_records wer
            LEFT JOIN projects p ON p.id = wer.project_id
            LEFT JOIN sessions s ON s.id = wer.session_id
            WHERE wer.kind = 'before_after'
              AND (wer.before_evidence_id = ? OR wer.after_evidence_id = ?)
            ORDER BY wer.created_at ASC, wer.id ASC
          `,
          args: [input.id, input.id],
        }),
        db.execute({
          sql: `
            SELECT
              ear.id,
              ear.proposal_id,
              ear.approval_id,
              ear.executor_agent,
              ear.command,
              ear.cwd,
              ear.exit_code,
              ear.stdout_summary,
              ear.stderr_summary,
              ear.duration_ms,
              ear.timed_out,
              ear.status,
              ear.receipt_body,
              ear.recovery_note,
              ear.created_at,
              eap.action_type,
              eap.risk_class
            FROM execution_action_results ear
            LEFT JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
            WHERE eap.workbench_evidence_id = ?
            ORDER BY ear.created_at DESC, ear.id DESC
            LIMIT 1
          `,
          args: [input.id],
        }),
      ]);
      const executionRow = executionResult.rows[0];

      return {
        found: true as const,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(row),
        knowledgeRoute: projectKnowledgeRoute(row.project_name == null ? null : String(row.project_name)),
        permissionPreflight: row.permission_preflight_id == null ? null : {
          id: Number(row.permission_preflight_id),
          mode: row.preflight_mode == null ? null : String(row.preflight_mode),
          decision: row.preflight_decision == null ? null : String(row.preflight_decision),
          requiredApprovals: row.preflight_required_approvals == null ? [] : String(row.preflight_required_approvals).split("\n").filter(Boolean),
          reasons: row.preflight_reasons == null ? [] : String(row.preflight_reasons).split("\n").filter(Boolean),
        },
        validationHistory: validationHistory.rows.map(rowToEvidence),
        comparisonHistory: comparisonHistory.rows.map(rowToEvidence),
        executionResult: executionRow
          ? {
              id: Number(executionRow.id),
              proposalId: executionRow.proposal_id == null ? null : Number(executionRow.proposal_id),
              approvalId: executionRow.approval_id == null ? null : Number(executionRow.approval_id),
              executorAgent: String(executionRow.executor_agent),
              command: String(executionRow.command),
              cwd: String(executionRow.cwd),
              exitCode: executionRow.exit_code == null ? null : Number(executionRow.exit_code),
              stdoutSummary: executionRow.stdout_summary == null ? "" : String(executionRow.stdout_summary),
              stderrSummary: executionRow.stderr_summary == null ? "" : String(executionRow.stderr_summary),
              durationMs: Number(executionRow.duration_ms),
              timedOut: Boolean(executionRow.timed_out),
              status: String(executionRow.status),
              receiptBody: String(executionRow.receipt_body),
              recoveryNote: executionRow.recovery_note == null ? null : String(executionRow.recovery_note),
              actionType: executionRow.action_type == null ? null : String(executionRow.action_type),
              riskClass: executionRow.risk_class == null ? null : String(executionRow.risk_class),
              createdAt: Number(executionRow.created_at),
            }
          : null,
        gates: [
          "This detail view reads local append-only evidence only.",
          "It does not open linked targets, execute commands, fetch sources, capture media, or write externally.",
        ],
      };
    }),

  linkOptions: publicProcedure.query(async () => {
    const db = await getCerebroDb();
    const [sources, commands, tasks, sessions, artifacts] = await Promise.all([
      db.execute({
        sql: `
          SELECT src.id, src.uri, src.title, src.source_type, src.trust_level, src.freshness_status, src.project_id, p.name AS project_name, src.created_at
          FROM sources src
          LEFT JOIN projects p ON p.id = src.project_id
          ORDER BY src.created_at DESC, src.id DESC
          LIMIT 30
        `,
      }),
      db.execute({
        sql: `
          SELECT co.id, co.command, co.risk, co.status, co.project_id, p.name AS project_name, co.created_at
          FROM command_observations co
          LEFT JOIN projects p ON p.id = co.project_id
          ORDER BY co.created_at DESC, co.id DESC
          LIMIT 30
        `,
      }),
      db.execute({
        sql: `
          SELECT t.id, t.title, t.status, t.agent, t.project_id, p.name AS project_name, t.updated_at
          FROM tasks t
          LEFT JOIN projects p ON p.id = t.project_id
          ORDER BY
            CASE t.status
              WHEN 'in_progress' THEN 0
              WHEN 'open' THEN 1
              WHEN 'done' THEN 2
              WHEN 'cancelled' THEN 3
            END,
            t.updated_at DESC,
            t.id DESC
          LIMIT 40
        `,
      }),
      db.execute({
        sql: `
          SELECT s.id, s.claude_session_id, s.title, s.hero_class, s.project_id, p.name AS project_name, s.started_at, s.ended_at
          FROM sessions s
          LEFT JOIN projects p ON p.id = s.project_id
          ORDER BY COALESCE(s.ended_at, s.last_seen_at, s.started_at) DESC, s.id DESC
          LIMIT 30
        `,
      }),
      db.execute({
        sql: `
          SELECT a.id, a.kind, a.lifecycle_state, a.title, a.project_id, p.name AS project_name, a.storage_provider, a.storage_path, a.created_at
          FROM artifacts a
          LEFT JOIN projects p ON p.id = a.project_id
          ORDER BY a.created_at DESC, a.id DESC
          LIMIT 40
        `,
      }),
    ]);

    return {
      mode: "read_only" as const,
      writesExternal: false,
      opensBrowser: false,
      executesCommand: false,
      sources: sources.rows.map((row) => ({
        id: Number(row.id),
        uri: String(row.uri),
        title: row.title == null ? null : String(row.title),
        sourceType: String(row.source_type),
        trustLevel: String(row.trust_level),
        freshnessStatus: String(row.freshness_status),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        createdAt: Number(row.created_at),
      })),
      commandObservations: commands.rows.map((row) => ({
        id: Number(row.id),
        command: String(row.command),
        risk: String(row.risk),
        status: String(row.status),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        createdAt: Number(row.created_at),
      })),
      tasks: tasks.rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title),
        status: String(row.status),
        agent: row.agent == null ? null : String(row.agent),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        updatedAt: Number(row.updated_at),
      })),
      sessions: sessions.rows.map((row) => ({
        id: Number(row.id),
        displayName: sessionDisplayName({
          id: Number(row.id),
          title: row.title == null ? null : String(row.title),
          projectName: row.project_name == null ? null : String(row.project_name),
          heroClass: row.hero_class == null ? null : String(row.hero_class),
          endedAt: row.ended_at == null ? null : Number(row.ended_at),
        }),
        claudeSessionId: String(row.claude_session_id),
        heroClass: row.hero_class == null ? null : String(row.hero_class),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        startedAt: Number(row.started_at),
        endedAt: row.ended_at == null ? null : Number(row.ended_at),
      })),
      artifacts: artifacts.rows.map((row) => ({
        id: Number(row.id),
        kind: String(row.kind),
        lifecycleState: String(row.lifecycle_state),
        title: row.title == null ? null : String(row.title),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        storageProvider: String(row.storage_provider),
        storagePath: String(row.storage_path),
        createdAt: Number(row.created_at),
      })),
      gates: [
        "Link options read existing local records only.",
        "Selecting a source does not fetch it. Selecting a command observation does not execute it. Selecting a task/session/artifact does not mutate it.",
      ],
    };
  }),

  createValidationNote: publicProcedure
    .input(
      z.object({
        evidenceId: z.number().int(),
        validatorAgent: z.enum(validationAgents),
        status: z.enum(["needs_review", "looks_consistent", "blocked", "validated_for_local_use"]),
        note: z.string().min(1).max(1600),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const existing = await db.execute({
        sql: `
          SELECT id, title, project_id, task_id, session_id, source_id,
                 command_observation_id, artifact_id, permission_preflight_id,
                 sensitive_data_flag
          FROM workbench_evidence_records
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.evidenceId],
      });
      const row = existing.rows[0];
      if (!row) {
        return {
          ok: false as const,
          writesExternal: false,
          opensBrowser: false,
          capturesMedia: false,
          reason: "No Workbench evidence record exists for this id.",
        };
      }

      const title = `${input.validatorAgent.toUpperCase()} note for evidence #${input.evidenceId}`;
      const summary = [
        `Status: ${input.status.replace(/_/g, " ")}`,
        input.note,
      ].join("\n");
      const preflight = preflightInputForEvidence({ permissionClass: "validation" });
      const { row: preflightRow } = await recordPermissionPreflight(db, {
        perceptionClass: preflight.perceptionClass,
        actionClass: preflight.actionClass,
        sensitiveData: Boolean(row.sensitive_data_flag),
        requestedByAgent: input.validatorAgent,
        targetSummary: `validation_note: evidence #${input.evidenceId}`,
        additionalReasons: preflight.additionalReasons,
      });
      const permissionPreflightId = Number(preflightRow.id);

      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, project_id, task_id, session_id,
            source_id, command_observation_id, artifact_id, owner_agent,
            route_agent, annotation_text, validation_status,
            permission_class, permission_preflight_id, sensitive_data_flag
          )
          VALUES (
            'validation_note', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, 'validation', ?, ?
          )
          RETURNING *
        `,
        args: [
          title,
          summary,
          `evidence:${input.evidenceId}`,
          row.project_id ?? null,
          row.task_id ?? null,
          row.session_id ?? null,
          row.source_id ?? null,
          row.command_observation_id ?? null,
          row.artifact_id ?? null,
          input.validatorAgent,
          input.note,
          input.status,
          permissionPreflightId,
          row.sensitive_data_flag ?? 0,
        ],
      });

      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created a new validation note record. The original evidence record was not overwritten.",
          "Recorded one local permission preflight audit row for this validation note.",
          "This did not validate any external claim, open a target, run a command, fetch a source, or write externally.",
        ],
      };
    }),

  createEvidence: publicProcedure
    .input(
      z.object({
        kind: z.enum(evidenceKinds),
        title: z.string().min(1).max(160),
        summary: z.string().min(1).max(2000),
        targetUri: z.string().max(1000).nullable().optional(),
        projectId: z.number().int().nullable().optional(),
        taskId: z.number().int().nullable().optional(),
        sessionId: z.number().int().nullable().optional(),
        sourceId: z.number().int().nullable().optional(),
        commandObservationId: z.number().int().nullable().optional(),
        artifactId: z.number().int().nullable().optional(),
        ownerAgent: z.string().min(1).max(80).default("cortana"),
        routeAgent: z.string().max(80).nullable().optional(),
        viewport: z.string().max(200).nullable().optional(),
        coordinates: z.string().max(500).nullable().optional(),
        annotationText: z.string().max(1200).nullable().optional(),
        mediaName: z.string().max(255).nullable().optional(),
        mediaMimeType: z.string().max(120).nullable().optional(),
        mediaByteSize: z.number().int().min(0).nullable().optional(),
        mediaKind: z.enum(mediaKinds).nullable().optional(),
        mediaFrameTimeSec: z.number().min(0).nullable().optional(),
        mediaDurationSec: z.number().min(0).nullable().optional(),
        beforeEvidenceId: z.number().int().nullable().optional(),
        afterEvidenceId: z.number().int().nullable().optional(),
        comparisonResult: z.string().max(800).nullable().optional(),
        mediaTemporary: z.boolean().default(false),
        permissionClass: z.enum(permissionClasses).default("manual_note"),
        sensitive: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const routeLink = await resolveRuntimeRouteEvidenceLink({
        targetUri: input.targetUri ?? null,
        projectId: input.projectId ?? null,
        taskId: input.taskId ?? null,
      });
      const permissionPreflightId = await recordEvidencePreflight({
        permissionClass: input.permissionClass,
        sensitive: input.sensitive,
        requestedByAgent: input.routeAgent ?? input.ownerAgent,
        targetSummary: `${input.kind}: ${input.title}`,
      });
      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, project_id, task_id, session_id,
            source_id, command_observation_id, artifact_id, owner_agent,
            route_agent, viewport, coordinates, annotation_text,
            media_name, media_mime_type, media_byte_size, media_kind,
            media_frame_time_sec, media_duration_sec, media_temporary_flag,
            before_evidence_id, after_evidence_id, comparison_result,
            validation_status, permission_class, permission_preflight_id,
            sensitive_data_flag
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unvalidated', ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.kind,
          input.title,
          input.summary,
          input.targetUri ?? null,
          routeLink.projectId,
          routeLink.taskId,
          input.sessionId ?? null,
          input.sourceId ?? null,
          input.commandObservationId ?? null,
          input.artifactId ?? null,
          input.ownerAgent,
          input.routeAgent ?? null,
          input.viewport ?? null,
          input.coordinates ?? null,
          input.annotationText ?? null,
          input.mediaName ?? null,
          input.mediaMimeType ?? null,
          input.mediaByteSize ?? null,
          input.mediaKind ?? null,
          input.mediaFrameTimeSec ?? null,
          input.mediaDurationSec ?? null,
          input.mediaTemporary ? 1 : 0,
          input.beforeEvidenceId ?? null,
          input.afterEvidenceId ?? null,
          input.comparisonResult ?? null,
          input.permissionClass,
          permissionPreflightId,
          input.sensitive ? 1 : 0,
        ],
      });
      const saved = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            t.title AS task_title,
            s.claude_session_id,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            src.title AS source_title,
            src.uri AS source_uri,
            co.command,
            a.title AS artifact_title,
            a.storage_path
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          WHERE wer.id = ?
          LIMIT 1
        `,
        args: [Number(result.rows[0]!.id)],
      });
      return {
        ok: true,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(saved.rows[0] ?? result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created one local Workbench evidence record.",
          "Recorded one local permission preflight audit row for this evidence record.",
          "This did not capture a screenshot, open a browser, run a command, save a file, or write externally.",
        ],
      };
    }),

  createBeforeAfterComparison: publicProcedure
    .input(
      z.object({
        beforeEvidenceId: z.number().int(),
        afterEvidenceId: z.number().int(),
        title: z.string().min(1).max(160),
        summary: z.string().min(1).max(2000),
        result: z.string().min(1).max(800),
        routeAgent: z.string().max(80).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.beforeEvidenceId === input.afterEvidenceId) {
        return {
          ok: false as const,
          writesExternal: false,
          opensBrowser: false,
          capturesMedia: false,
          reason: "Before and after evidence must be different records.",
        };
      }

      const db = await getCerebroDb();
      const existing = await db.execute({
        sql: `
          SELECT id, project_id, task_id, session_id, source_id,
                 command_observation_id, artifact_id, sensitive_data_flag
          FROM workbench_evidence_records
          WHERE id IN (?, ?)
          ORDER BY id ASC
        `,
        args: [input.beforeEvidenceId, input.afterEvidenceId],
      });
      if (existing.rows.length !== 2) {
        return {
          ok: false as const,
          writesExternal: false,
          opensBrowser: false,
          capturesMedia: false,
          reason: "Both local evidence records must exist before a comparison can be appended.",
        };
      }

      const beforeRow = existing.rows.find((row) => Number(row.id) === input.beforeEvidenceId)!;
      const afterRow = existing.rows.find((row) => Number(row.id) === input.afterEvidenceId)!;
      const sensitive = Boolean(beforeRow.sensitive_data_flag) || Boolean(afterRow.sensitive_data_flag);
      const permissionPreflightId = await recordEvidencePreflight({
        permissionClass: "validation",
        sensitive,
        requestedByAgent: input.routeAgent ?? "spock",
        targetSummary: `before_after: evidence #${input.beforeEvidenceId} -> #${input.afterEvidenceId}`,
      });

      const projectId = afterRow.project_id ?? beforeRow.project_id ?? null;
      const taskId = afterRow.task_id ?? beforeRow.task_id ?? null;
      const sessionId = afterRow.session_id ?? beforeRow.session_id ?? null;
      const sourceId = afterRow.source_id ?? beforeRow.source_id ?? null;
      const commandObservationId = afterRow.command_observation_id ?? beforeRow.command_observation_id ?? null;
      const artifactId = afterRow.artifact_id ?? beforeRow.artifact_id ?? null;
      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, project_id, task_id, session_id,
            source_id, command_observation_id, artifact_id, owner_agent,
            route_agent, annotation_text, before_evidence_id, after_evidence_id,
            comparison_result, validation_status, permission_class,
            permission_preflight_id, sensitive_data_flag
          )
          VALUES (
            'before_after', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'spock', ?, ?, ?, ?, ?, 'needs_review', 'validation', ?, ?
          )
          RETURNING *
        `,
        args: [
          input.title,
          input.summary,
          `before:${input.beforeEvidenceId};after:${input.afterEvidenceId}`,
          projectId,
          taskId,
          sessionId,
          sourceId,
          commandObservationId,
          artifactId,
          input.routeAgent ?? "spock",
          input.result,
          input.beforeEvidenceId,
          input.afterEvidenceId,
          input.result,
          permissionPreflightId,
          sensitive ? 1 : 0,
        ],
      });

      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created one local before/after comparison record.",
          "The compared evidence records were not overwritten.",
          "This did not open targets, capture media, run commands, fetch sources, save files, or write externally.",
        ],
      };
    }),
});
