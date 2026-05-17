import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";

const statusOptions = ["pending", "approved", "rejected", "cancelled"] as const;
const originOptions = ["all", "hedwig", "terminal", "runtime", "project_lab", "source", "model_tools", "raven", "other"] as const;
const groupOptions = ["origin", "project", "action_type", "status", "risk"] as const;
const preflightDecisions = ["allowed_local", "proposal_only", "approval_required", "blocked_by_hard_gate"] as const;
const perceptionClasses = ["explicit_context", "local_files", "terminal_logs", "workbench_media", "public_browser"] as const;
const actionClasses = ["local_note", "code_edit", "command_execution", "browser_or_media_capture", "external_write", "cleanup"] as const;
const projectIdSql = "COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id, CASE WHEN a.target_type = 'project' THEN a.target_id END)";

function rowToApproval(row: Record<string, unknown>) {
  const targetType = row.target_type == null ? null : String(row.target_type);
  const actionType = String(row.action_type);
  const requestedByAgent = row.requested_by_agent == null ? null : String(row.requested_by_agent);
  const reason = row.reason == null ? null : String(row.reason);
  const contextSummary = row.context_summary == null ? null : String(row.context_summary);
  const sensitive = Boolean(row.sensitive_data_flag);
  const costRisk = row.cost_risk == null ? null : String(row.cost_risk);

  return {
    id: Number(row.id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    actionType,
    targetType,
    targetId: row.target_id == null ? null : Number(row.target_id),
    requestedByAgent,
    status: String(row.status),
    reason,
    contextSummary,
    sensitive,
    costRisk,
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    permissionPreflight: row.permission_preflight_id == null ? null : {
      id: Number(row.permission_preflight_id),
      mode: row.preflight_mode == null ? null : String(row.preflight_mode),
      decision: row.preflight_decision == null ? null : String(row.preflight_decision),
      approvalRequired: row.preflight_approval_required == null ? false : Boolean(row.preflight_approval_required),
      requiredApprovals: row.preflight_required_approvals == null ? [] : String(row.preflight_required_approvals).split("\n").filter(Boolean),
      reasons: row.preflight_reasons == null ? [] : String(row.preflight_reasons).split("\n").filter(Boolean),
      modeEffect: row.preflight_mode_effect == null ? null : String(row.preflight_mode_effect),
      perceptionClass: row.preflight_perception_class == null ? null : String(row.preflight_perception_class),
      actionClass: row.preflight_action_class == null ? null : String(row.preflight_action_class),
      targetSummary: row.preflight_target_summary == null ? null : String(row.preflight_target_summary),
    },
    createdAt: Number(row.created_at),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    projectPath: row.project_path == null ? null : String(row.project_path),
    targetLabel: row.target_label == null ? null : String(row.target_label),
    origin: originForApproval({ actionType, targetType, requestedByAgent }),
    validationPreview: validationPreviewForApproval({
      actionType,
      targetType,
      requestedByAgent,
      reason,
      contextSummary,
      sensitive,
      costRisk,
    }),
  };
}

function rowToApprovalExecutionLink(row: Record<string, unknown>) {
  return {
    proposalId: Number(row.proposal_id),
    sourceType: String(row.source_type),
    sourceId: Number(row.source_id),
    actionType: String(row.action_type),
    riskClass: String(row.risk_class),
    executorAgent: String(row.executor_agent),
    command: row.command == null ? null : String(row.command),
    cwd: row.cwd == null ? null : String(row.cwd),
    workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
    proposalResultState: String(row.proposal_result_state),
    proposalStatus: String(row.proposal_status),
    recoveryNote: row.recovery_note == null ? null : String(row.recovery_note),
    resultId: row.result_id == null ? null : Number(row.result_id),
    resultStatus: row.result_status == null ? null : String(row.result_status),
    resultExitCode: row.result_exit_code == null ? null : Number(row.result_exit_code),
    resultCreatedAt: row.result_created_at == null ? null : Number(row.result_created_at),
  };
}

function rowToApprovalPreview(row: Record<string, unknown>) {
  const targetType = row.target_type == null ? null : String(row.target_type);
  const actionType = String(row.action_type);
  const requestedByAgent = row.requested_by_agent == null ? null : String(row.requested_by_agent);
  const sensitive = Boolean(row.sensitive_data_flag);
  const costRisk = row.cost_risk == null ? null : String(row.cost_risk);

  return {
    id: Number(row.id),
    actionType,
    targetType,
    targetId: row.target_id == null ? null : Number(row.target_id),
    requestedByAgent,
    status: String(row.status),
    reason: row.reason == null ? null : String(row.reason),
    contextSummary: row.context_summary == null ? null : String(row.context_summary),
    sensitive,
    costRisk,
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    permissionPreflight: row.permission_preflight_id == null ? null : {
      id: Number(row.permission_preflight_id),
      decision: row.preflight_decision == null ? null : String(row.preflight_decision),
      approvalRequired: row.preflight_approval_required == null ? false : Boolean(row.preflight_approval_required),
    },
    createdAt: Number(row.created_at),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    targetLabel: row.target_label == null ? null : String(row.target_label),
    origin: originForApproval({ actionType, targetType, requestedByAgent }),
  };
}

function rowToPreflightRecord(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    mode: String(row.mode),
    perceptionClass: row.perception_class == null ? null : String(row.perception_class),
    actionClass: row.action_class == null ? null : String(row.action_class),
    decision: String(row.decision),
    approvalRequired: Boolean(row.approval_required),
    requiredApprovals: row.required_approvals == null ? [] : String(row.required_approvals).split("\n").filter(Boolean),
    reasons: row.reasons == null ? [] : String(row.reasons).split("\n").filter(Boolean),
    modeEffect: row.mode_effect == null ? null : String(row.mode_effect),
    sensitiveData: Boolean(row.sensitive_data_flag),
    externalTarget: Boolean(row.external_target_flag),
    destructive: Boolean(row.destructive_flag),
    persistsMemory: Boolean(row.persists_memory_flag),
    requestedByAgent: String(row.requested_by_agent),
    targetSummary: row.target_summary == null ? null : String(row.target_summary),
    createdAt: Number(row.created_at),
  };
}

function originForApproval(input: {
  actionType: string;
  targetType: string | null;
  requestedByAgent: string | null;
}) {
  if (input.requestedByAgent === "hedwig") return "hedwig";
  if (input.requestedByAgent === "raven" || input.targetType === "raven_bridge_export_proposal") return "raven";
  if (input.targetType === "runtime_route_record" || input.actionType.startsWith("runtime_")) return "runtime";
  if (input.targetType === "command_observation" || input.actionType.startsWith("terminal_")) return "terminal";
  if (input.targetType === "source_event" || input.actionType.includes("source")) return "source";
  if (input.targetType === "model_tool_capability" || input.targetType === "model_tool_ollama_status_check" || input.actionType.includes("model") || input.actionType.includes("ollama")) return "model_tools";
  if (input.targetType === "task" || input.targetType === "project") return "project_lab";
  return "other";
}

function validationPreviewForApproval(input: {
  actionType: string;
  targetType: string | null;
  requestedByAgent: string | null;
  reason: string | null;
  contextSummary: string | null;
  sensitive: boolean;
  costRisk: string | null;
}) {
  const oakNotes: string[] = [];
  const spockNotes: string[] = [];

  if (input.sensitive) {
    oakNotes.push("Sensitive flag is set. Review private, financial, legal, medical, or credential-like context before external use.");
  }
  if (input.actionType.includes("notion") || input.actionType.includes("slack") || input.actionType.includes("send") || input.actionType.includes("schedule")) {
    oakNotes.push("External write or notification path. Confirm target, scope, and user-visible result before approval.");
  }
  if (input.actionType.includes("source") || input.actionType.includes("browser") || input.actionType.includes("search")) {
    oakNotes.push("Source action. Validate trust, freshness, and scrub status before using the result as evidence.");
  }
  if (input.targetType === "model_tool_capability" || input.targetType === "model_tool_ollama_status_check" || input.actionType.includes("model") || input.actionType.includes("ollama")) {
    oakNotes.push("Model/tool action. Validate source, freshness, privacy class, cost/free-tier claims, and data leaving the machine before use.");
    spockNotes.push("Model/tool approval preview only. This does not run the capability, call a provider, install, pull, browse, fetch, write memory, or change route defaults.");
  }
  if (input.actionType.includes("destructive")) {
    oakNotes.push("Destructive command class. Require exact command, cwd, expected change, and recovery path.");
  }
  if (input.costRisk && input.costRisk !== "local_read_only_command_review") {
    oakNotes.push(`Cost/risk marker: ${input.costRisk.replace(/_/g, " ")}.`);
  }
  if (oakNotes.length === 0) {
    oakNotes.push("No high-risk marker detected. Still pending explicit user approval.");
  }

  if (!input.reason?.trim()) {
    spockNotes.push("Missing reason. Add why this action is needed before approval.");
  }
  if (!input.contextSummary?.trim()) {
    spockNotes.push("Missing context summary. Approval should name the evidence and target.");
  }
  if (input.targetType == null) {
    spockNotes.push("No target type. Link this preview to the local record it came from.");
  }
  if (input.actionType.includes("terminal") && input.targetType !== "command_observation") {
    spockNotes.push("Terminal action should point at a command observation.");
  }
  if (input.requestedByAgent === "hedwig" && !["capture_observation", "reminder_proposal", "message_draft_proposal"].includes(input.targetType ?? "")) {
    spockNotes.push("Hedwig approval should point at a capture, reminder, or message proposal.");
  }
  if (input.requestedByAgent === "raven") {
    oakNotes.push("Raven approval is sealed private scope. Confirm scrub receipt and exact export target before any bridge action.");
    spockNotes.push("Raven approval remains preview-only. It must not write core memory or external systems from the queue.");
  }
  if (spockNotes.length === 0) {
    spockNotes.push("Shape check passed for a local approval preview. This is not approval.");
  }

  return { oakNotes, spockNotes };
}

export const approvalsRouter = router({
  decide: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        decision: z.enum(["approved", "rejected", "cancelled"]),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const current = await db.execute({
        sql: `
          SELECT a.*, p.name AS project_name, p.path AS project_path
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN projects p ON p.id = t.project_id
          WHERE a.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const existing = current.rows[0];
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: `No approval ${input.id}` });
      if (String(existing.status) !== "pending") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only pending approvals can be decided." });
      }

      const reason = input.reason?.trim();
      const existingReason = existing.reason == null ? null : String(existing.reason);
      const decisionReason = reason
        ? [existingReason, `Decision note: ${reason}`].filter(Boolean).join("\n")
        : existingReason;
      const result = await db.execute({
        sql: `
          UPDATE approvals
          SET status = ?,
              reason = ?,
              decided_at = unixepoch()
          WHERE id = ?
          RETURNING id, task_id, action_type, target_type, target_id,
                    requested_by_agent, status, reason, context_summary,
                    sensitive_data_flag, cost_risk, permission_preflight_id,
                    decided_at, created_at
        `,
        args: [input.decision, decisionReason, input.id],
      });
      const row = result.rows[0]!;
      return {
        ok: true as const,
        approval: rowToApprovalPreview(row),
        writesExternal: false,
        wouldExecute: false,
        opensBrowser: false,
        callsModel: false,
        receipt: {
          approvalId: Number(row.id),
          status: String(row.status),
          actionType: String(row.action_type),
          targetType: row.target_type == null ? null : String(row.target_type),
          targetId: row.target_id == null ? null : Number(row.target_id),
          decidedAt: row.decided_at == null ? null : Number(row.decided_at),
          note: input.decision === "approved"
            ? "Approval receipt recorded. Execution still requires a separate approved action contract."
            : "Gate closed. Linked actions remain blocked.",
        },
        gates: [
          "Approval decision recorded as local metadata.",
          "This did not run a command, open a browser, call a model, fetch a source, schedule, send, or write externally.",
          "Execution still requires a separate action proposal and run request.",
        ],
      };
    }),

  permissionPreflights: publicProcedure
    .input(
      z
        .object({
          decision: z.enum(preflightDecisions).optional(),
          perceptionClass: z.enum(perceptionClasses).optional(),
          actionClass: z.enum(actionClasses).optional(),
          query: z.string().max(200).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.decision) {
        where.push("decision = ?");
        args.push(input.decision);
      }
      if (input?.perceptionClass) {
        where.push("perception_class = ?");
        args.push(input.perceptionClass);
      }
      if (input?.actionClass) {
        where.push("action_class = ?");
        args.push(input.actionClass);
      }
      const query = input?.query?.trim();
      if (query) {
        where.push(`
          (
            COALESCE(target_summary, '') LIKE ?
            OR COALESCE(required_approvals, '') LIKE ?
            OR COALESCE(reasons, '') LIKE ?
            OR COALESCE(requested_by_agent, '') LIKE ?
            OR COALESCE(perception_class, '') LIKE ?
            OR COALESCE(action_class, '') LIKE ?
            OR COALESCE(decision, '') LIKE ?
          )
        `);
        const like = `%${query}%`;
        args.push(like, like, like, like, like, like, like);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM permission_preflight_records
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToPreflightRecord);
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        wouldApprove: false,
        executesCommands: false,
        opensBrowser: false,
        capturesMedia: false,
        callsExternalModels: false,
        items,
        summary: {
          total: items.length,
          approvalRequired: items.filter((item) => item.approvalRequired).length,
          blocked: items.filter((item) => item.decision === "blocked_by_hard_gate").length,
          sensitive: items.filter((item) => item.sensitiveData).length,
        },
        gates: [
          "Permission preflight records are local append-only audit history.",
          "This view does not approve, reject, execute, fetch, browse, capture media, call providers, or write externally.",
          "A preflight decision is policy evidence. It is not user approval.",
        ],
      };
    }),

  queue: publicProcedure
    .input(
      z
        .object({
          status: z.enum(statusOptions).optional(),
          origin: z.enum(originOptions).optional(),
          projectId: z.number().int().optional(),
          query: z.string().max(200).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      const status = input?.status ?? "pending";
      const origin = input?.origin ?? "all";

      where.push("a.status = ?");
      args.push(status);

      if (input?.projectId !== undefined) {
        where.push(`${projectIdSql} = ?`);
        args.push(input.projectId);
      }

      if (origin === "hedwig") {
        where.push("a.requested_by_agent = 'hedwig'");
      } else if (origin === "raven") {
        where.push("(a.requested_by_agent = 'raven' OR a.target_type = 'raven_bridge_export_proposal')");
      } else if (origin === "runtime") {
        where.push("(a.target_type = 'runtime_route_record' OR a.action_type LIKE 'runtime_%')");
      } else if (origin === "terminal") {
        where.push("(a.target_type = 'command_observation' OR a.action_type LIKE 'terminal_%')");
      } else if (origin === "source") {
        where.push("(a.target_type = 'source_event' OR a.action_type LIKE '%source%')");
      } else if (origin === "model_tools") {
        where.push("(a.target_type IN ('model_tool_capability', 'model_tool_ollama_status_check') OR a.action_type LIKE '%model%' OR a.action_type LIKE '%ollama%')");
      } else if (origin === "project_lab") {
        where.push(`(a.target_type IN ('task', 'project') OR ${projectIdSql} IS NOT NULL)`);
      } else if (origin === "other") {
        where.push(`
          a.requested_by_agent != 'hedwig'
          AND a.requested_by_agent != 'raven'
          AND COALESCE(a.target_type, '') != 'raven_bridge_export_proposal'
          AND COALESCE(a.target_type, '') != 'runtime_route_record'
          AND a.action_type NOT LIKE 'runtime_%'
          AND COALESCE(a.target_type, '') != 'command_observation'
          AND a.action_type NOT LIKE 'terminal_%'
          AND COALESCE(a.target_type, '') != 'source_event'
          AND a.action_type NOT LIKE '%source%'
          AND COALESCE(a.target_type, '') NOT IN ('model_tool_capability', 'model_tool_ollama_status_check')
          AND a.action_type NOT LIKE '%model%'
          AND a.action_type NOT LIKE '%ollama%'
        `);
      }

      const query = input?.query?.trim();
      if (query) {
        where.push(`
          (
            a.action_type LIKE ?
            OR COALESCE(a.reason, '') LIKE ?
            OR COALESCE(a.context_summary, '') LIKE ?
            OR COALESCE(p.name, '') LIKE ?
            OR COALESCE(co.command, '') LIKE ?
            OR COALESCE(cap.title, '') LIKE ?
            OR COALESCE(rp.title, '') LIKE ?
            OR COALESCE(mp.title, '') LIKE ?
            OR COALESCE(se.title, '') LIKE ?
            OR COALESCE(rbp.title, '') LIKE ?
            OR COALESCE(rbp.summary, '') LIKE ?
            OR COALESCE(rr.original_text, '') LIKE ?
            OR COALESCE(rr.next_action, '') LIKE ?
            OR COALESCE(mtc.provider, '') LIKE ?
            OR COALESCE(mtc.tool_name, '') LIKE ?
          )
        `);
        const like = `%${query}%`;
        args.push(like, like, like, like, like, like, like, like, like, like, like, like, like, like, like);
      }

      args.push(input?.limit ?? 40);
      const result = await db.execute({
        sql: `
          SELECT
            a.id, a.action_type, a.target_type, a.target_id,
            a.requested_by_agent, a.status, a.reason, a.context_summary,
            a.sensitive_data_flag, a.cost_risk, a.decided_at, a.created_at,
            a.permission_preflight_id,
            ppr.decision AS preflight_decision,
            ppr.approval_required AS preflight_approval_required,
            ${projectIdSql} AS project_id,
            COALESCE(p.name, rr.project_name) AS project_name,
            COALESCE(co.command, cap.title, rp.title, mp.title, se.title, rbp.title, mtc.provider || ' / ' || mtc.tool_name, p.name, 'runtime_route:' || rr.id) AS target_label
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
          LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
          LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
          LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
          LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
          LEFT JOIN raven_bridge_export_proposals rbp ON a.target_type = 'raven_bridge_export_proposal' AND rbp.id = a.target_id
          LEFT JOIN runtime_route_records rr ON a.target_type = 'runtime_route_record' AND rr.id = a.target_id
          LEFT JOIN model_tool_capabilities mtc ON a.target_type = 'model_tool_capability' AND mtc.id = a.target_id
          LEFT JOIN permission_preflight_records ppr ON ppr.id = a.permission_preflight_id
          LEFT JOIN projects p ON p.id = ${projectIdSql}
          WHERE ${where.join(" AND ")}
          ORDER BY a.created_at DESC, a.id DESC
          LIMIT ?
        `,
        args,
      });

      const items = result.rows.map(rowToApprovalPreview);
      return {
        mode: "compact_read_only" as const,
        writesExternal: false,
        wouldApprove: false,
        status,
        origin,
        items,
        summary: {
          total: items.length,
          sensitive: items.filter((item) => item.sensitive).length,
          terminal: items.filter((item) => item.origin === "terminal").length,
          hedwig: items.filter((item) => item.origin === "hedwig").length,
          source: items.filter((item) => item.origin === "source").length,
          raven: items.filter((item) => item.origin === "raven").length,
          runtime: items.filter((item) => item.origin === "runtime").length,
          projectLab: items.filter((item) => item.origin === "project_lab").length,
          gitRemoteWrite: items.filter((item) => item.costRisk === "git_remote_write" || item.actionType === "project_manual_push").length,
          preflightLinked: items.filter((item) => item.permissionPreflightId != null).length,
        },
        gates: [
          "This compact queue reads local approval preview labels only.",
          "Detail evidence is loaded only for the selected decision.",
          "It does not approve, reject, execute commands, browse, fetch, schedule, send, or write to Notion/Slack.",
        ],
      };
    }),

  detail: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT
            a.id, a.task_id, a.action_type, a.target_type, a.target_id,
            a.requested_by_agent, a.status, a.reason, a.context_summary,
            a.sensitive_data_flag, a.cost_risk, a.decided_at, a.created_at,
            a.permission_preflight_id,
            ppr.mode AS preflight_mode,
            ppr.decision AS preflight_decision,
            ppr.approval_required AS preflight_approval_required,
            ppr.required_approvals AS preflight_required_approvals,
            ppr.reasons AS preflight_reasons,
            ppr.mode_effect AS preflight_mode_effect,
            ppr.perception_class AS preflight_perception_class,
            ppr.action_class AS preflight_action_class,
            ppr.target_summary AS preflight_target_summary,
            ${projectIdSql} AS project_id,
            COALESCE(p.name, rr.project_name) AS project_name,
            p.path AS project_path,
            COALESCE(co.command, cap.title, rp.title, mp.title, se.title, rbp.title, mtc.provider || ' / ' || mtc.tool_name, p.name, 'runtime_route:' || rr.id) AS target_label
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
          LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
          LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
          LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
          LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
          LEFT JOIN raven_bridge_export_proposals rbp ON a.target_type = 'raven_bridge_export_proposal' AND rbp.id = a.target_id
          LEFT JOIN runtime_route_records rr ON a.target_type = 'runtime_route_record' AND rr.id = a.target_id
          LEFT JOIN model_tool_capabilities mtc ON a.target_type = 'model_tool_capability' AND mtc.id = a.target_id
          LEFT JOIN permission_preflight_records ppr ON ppr.id = a.permission_preflight_id
          LEFT JOIN projects p ON p.id = ${projectIdSql}
          WHERE a.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      const executionLinks = row
        ? await db.execute({
            sql: `
              SELECT
                eap.id AS proposal_id,
                eap.source_type,
                eap.source_id,
                eap.action_type,
                eap.risk_class,
                eap.executor_agent,
                eap.command,
                eap.cwd,
                eap.workbench_evidence_id,
                eap.result_state AS proposal_result_state,
                eap.status AS proposal_status,
                eap.recovery_note,
                ear.id AS result_id,
                ear.status AS result_status,
                ear.exit_code AS result_exit_code,
                ear.created_at AS result_created_at
              FROM execution_action_proposals eap
              LEFT JOIN execution_action_results ear ON ear.id = (
                SELECT latest.id
                FROM execution_action_results latest
                WHERE latest.proposal_id = eap.id
                ORDER BY latest.created_at DESC, latest.id DESC
                LIMIT 1
              )
              WHERE eap.approval_id = ?
              ORDER BY eap.created_at DESC, eap.id DESC
              LIMIT 12
            `,
            args: [input.id],
          })
        : { rows: [] };
      return {
        mode: "read_only" as const,
        writesExternal: false,
        wouldApprove: false,
        found: Boolean(row),
        approval: row ? { ...rowToApproval(row), executionLinks: executionLinks.rows.map(rowToApprovalExecutionLink) } : null,
        gates: [
          "Approval detail reads one local approval preview.",
          "Linked execution proposals and results are read-only receipt references.",
          "It does not approve, reject, execute commands, browse, fetch, schedule, send, or write externally.",
        ],
      };
    }),

  list: publicProcedure
    .input(
      z
        .object({
          status: z.enum(statusOptions).optional(),
          origin: z.enum(originOptions).optional(),
          projectId: z.number().int().optional(),
          query: z.string().max(200).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      const status = input?.status ?? "pending";
      const origin = input?.origin ?? "all";

      where.push("a.status = ?");
      args.push(status);

      if (input?.projectId !== undefined) {
        where.push(`${projectIdSql} = ?`);
        args.push(input.projectId);
      }

      if (origin === "hedwig") {
        where.push("a.requested_by_agent = 'hedwig'");
      } else if (origin === "raven") {
        where.push("(a.requested_by_agent = 'raven' OR a.target_type = 'raven_bridge_export_proposal')");
      } else if (origin === "runtime") {
        where.push("(a.target_type = 'runtime_route_record' OR a.action_type LIKE 'runtime_%')");
      } else if (origin === "terminal") {
        where.push("(a.target_type = 'command_observation' OR a.action_type LIKE 'terminal_%')");
      } else if (origin === "source") {
        where.push("(a.target_type = 'source_event' OR a.action_type LIKE '%source%')");
      } else if (origin === "model_tools") {
        where.push("(a.target_type IN ('model_tool_capability', 'model_tool_ollama_status_check') OR a.action_type LIKE '%model%' OR a.action_type LIKE '%ollama%')");
      } else if (origin === "project_lab") {
        where.push(`(a.target_type IN ('task', 'project') OR ${projectIdSql} IS NOT NULL)`);
      } else if (origin === "other") {
        where.push(`
          a.requested_by_agent != 'hedwig'
          AND a.requested_by_agent != 'raven'
          AND COALESCE(a.target_type, '') != 'raven_bridge_export_proposal'
          AND COALESCE(a.target_type, '') != 'runtime_route_record'
          AND a.action_type NOT LIKE 'runtime_%'
          AND COALESCE(a.target_type, '') != 'command_observation'
          AND a.action_type NOT LIKE 'terminal_%'
          AND COALESCE(a.target_type, '') != 'source_event'
          AND a.action_type NOT LIKE '%source%'
          AND COALESCE(a.target_type, '') NOT IN ('model_tool_capability', 'model_tool_ollama_status_check')
          AND a.action_type NOT LIKE '%model%'
          AND a.action_type NOT LIKE '%ollama%'
        `);
      }

      const query = input?.query?.trim();
      if (query) {
        where.push(`
          (
            a.action_type LIKE ?
            OR COALESCE(a.reason, '') LIKE ?
            OR COALESCE(a.context_summary, '') LIKE ?
            OR COALESCE(p.name, '') LIKE ?
            OR COALESCE(co.command, '') LIKE ?
            OR COALESCE(cap.title, '') LIKE ?
            OR COALESCE(rp.title, '') LIKE ?
            OR COALESCE(mp.title, '') LIKE ?
            OR COALESCE(se.title, '') LIKE ?
            OR COALESCE(rbp.title, '') LIKE ?
            OR COALESCE(rbp.summary, '') LIKE ?
            OR COALESCE(rr.original_text, '') LIKE ?
            OR COALESCE(rr.next_action, '') LIKE ?
            OR COALESCE(mtc.provider, '') LIKE ?
            OR COALESCE(mtc.tool_name, '') LIKE ?
          )
        `);
        const like = `%${query}%`;
        args.push(like, like, like, like, like, like, like, like, like, like, like, like, like, like, like);
      }

      args.push(input?.limit ?? 40);
      const result = await db.execute({
        sql: `
          SELECT
            a.id, a.task_id, a.action_type, a.target_type, a.target_id,
            a.requested_by_agent, a.status, a.reason, a.context_summary,
            a.sensitive_data_flag, a.cost_risk, a.decided_at, a.created_at,
            a.permission_preflight_id,
            ppr.mode AS preflight_mode,
            ppr.decision AS preflight_decision,
            ppr.approval_required AS preflight_approval_required,
            ppr.required_approvals AS preflight_required_approvals,
            ppr.reasons AS preflight_reasons,
            ppr.mode_effect AS preflight_mode_effect,
            ppr.perception_class AS preflight_perception_class,
            ppr.action_class AS preflight_action_class,
            ppr.target_summary AS preflight_target_summary,
            ${projectIdSql} AS project_id,
            COALESCE(p.name, rr.project_name) AS project_name,
            p.path AS project_path,
            COALESCE(co.command, cap.title, rp.title, mp.title, se.title, rbp.title, mtc.provider || ' / ' || mtc.tool_name, p.name, 'runtime_route:' || rr.id) AS target_label
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
          LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
          LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
          LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
          LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
          LEFT JOIN raven_bridge_export_proposals rbp ON a.target_type = 'raven_bridge_export_proposal' AND rbp.id = a.target_id
          LEFT JOIN runtime_route_records rr ON a.target_type = 'runtime_route_record' AND rr.id = a.target_id
          LEFT JOIN model_tool_capabilities mtc ON a.target_type = 'model_tool_capability' AND mtc.id = a.target_id
          LEFT JOIN permission_preflight_records ppr ON ppr.id = a.permission_preflight_id
          LEFT JOIN projects p ON p.id = ${projectIdSql}
          WHERE ${where.join(" AND ")}
          ORDER BY a.created_at DESC, a.id DESC
          LIMIT ?
        `,
        args,
      });

      const items = result.rows.map(rowToApproval);
      return {
        mode: "read_only" as const,
        writesExternal: false,
        wouldApprove: false,
        status,
        origin,
        items,
        summary: {
          total: items.length,
          sensitive: items.filter((item) => item.sensitive).length,
          terminal: items.filter((item) => item.origin === "terminal").length,
          hedwig: items.filter((item) => item.origin === "hedwig").length,
          source: items.filter((item) => item.origin === "source").length,
          raven: items.filter((item) => item.origin === "raven").length,
          runtime: items.filter((item) => item.origin === "runtime").length,
          projectLab: items.filter((item) => item.origin === "project_lab").length,
          gitRemoteWrite: items.filter((item) => item.costRisk === "git_remote_write" || item.actionType === "project_manual_push").length,
        },
        gates: [
          "This dashboard reads local approval previews only.",
          "It does not approve, reject, execute commands, browse, fetch, schedule, send, or write to Notion/Slack.",
          "Oak and Spock notes are deterministic preflight notes, not validation results.",
        ],
      };
    }),

  groups: publicProcedure
    .input(
      z
        .object({
          groupBy: z.enum(groupOptions).default("origin"),
          status: z.enum(statusOptions).optional(),
          origin: z.enum(originOptions).optional(),
          projectId: z.number().int().optional(),
          query: z.string().max(200).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      const status = input?.status ?? "pending";
      const origin = input?.origin ?? "all";

      where.push("a.status = ?");
      args.push(status);

      if (input?.projectId !== undefined) {
        where.push(`${projectIdSql} = ?`);
        args.push(input.projectId);
      }

      if (origin === "hedwig") {
        where.push("a.requested_by_agent = 'hedwig'");
      } else if (origin === "raven") {
        where.push("(a.requested_by_agent = 'raven' OR a.target_type = 'raven_bridge_export_proposal')");
      } else if (origin === "runtime") {
        where.push("(a.target_type = 'runtime_route_record' OR a.action_type LIKE 'runtime_%')");
      } else if (origin === "terminal") {
        where.push("(a.target_type = 'command_observation' OR a.action_type LIKE 'terminal_%')");
      } else if (origin === "source") {
        where.push("(a.target_type = 'source_event' OR a.action_type LIKE '%source%')");
      } else if (origin === "model_tools") {
        where.push("(a.target_type IN ('model_tool_capability', 'model_tool_ollama_status_check') OR a.action_type LIKE '%model%' OR a.action_type LIKE '%ollama%')");
      } else if (origin === "project_lab") {
        where.push(`(a.target_type IN ('task', 'project') OR ${projectIdSql} IS NOT NULL)`);
      } else if (origin === "other") {
        where.push(`
          a.requested_by_agent != 'hedwig'
          AND a.requested_by_agent != 'raven'
          AND COALESCE(a.target_type, '') != 'raven_bridge_export_proposal'
          AND COALESCE(a.target_type, '') != 'runtime_route_record'
          AND a.action_type NOT LIKE 'runtime_%'
          AND COALESCE(a.target_type, '') != 'command_observation'
          AND a.action_type NOT LIKE 'terminal_%'
          AND COALESCE(a.target_type, '') != 'source_event'
          AND a.action_type NOT LIKE '%source%'
          AND COALESCE(a.target_type, '') NOT IN ('model_tool_capability', 'model_tool_ollama_status_check')
          AND a.action_type NOT LIKE '%model%'
          AND a.action_type NOT LIKE '%ollama%'
        `);
      }

      const query = input?.query?.trim();
      if (query) {
        where.push(`
          (
            a.action_type LIKE ?
            OR COALESCE(a.reason, '') LIKE ?
            OR COALESCE(a.context_summary, '') LIKE ?
            OR COALESCE(p.name, '') LIKE ?
            OR COALESCE(co.command, '') LIKE ?
            OR COALESCE(cap.title, '') LIKE ?
            OR COALESCE(rp.title, '') LIKE ?
            OR COALESCE(mp.title, '') LIKE ?
            OR COALESCE(se.title, '') LIKE ?
            OR COALESCE(rbp.title, '') LIKE ?
            OR COALESCE(rbp.summary, '') LIKE ?
            OR COALESCE(rr.original_text, '') LIKE ?
            OR COALESCE(rr.next_action, '') LIKE ?
            OR COALESCE(mtc.provider, '') LIKE ?
            OR COALESCE(mtc.tool_name, '') LIKE ?
          )
        `);
        const like = `%${query}%`;
        args.push(like, like, like, like, like, like, like, like, like, like, like, like, like, like, like);
      }

      const result = await db.execute({
        sql: `
          SELECT
            a.id, a.task_id, a.action_type, a.target_type, a.target_id,
            a.requested_by_agent, a.status, a.reason, a.context_summary,
            a.sensitive_data_flag, a.cost_risk, a.decided_at, a.created_at,
            a.permission_preflight_id,
            ${projectIdSql} AS project_id,
            COALESCE(p.name, rr.project_name) AS project_name,
            p.path AS project_path,
            COALESCE(co.command, cap.title, rp.title, mp.title, se.title, rbp.title, mtc.provider || ' / ' || mtc.tool_name, p.name, 'runtime_route:' || rr.id) AS target_label
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
          LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
          LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
          LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
          LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
          LEFT JOIN raven_bridge_export_proposals rbp ON a.target_type = 'raven_bridge_export_proposal' AND rbp.id = a.target_id
          LEFT JOIN runtime_route_records rr ON a.target_type = 'runtime_route_record' AND rr.id = a.target_id
          LEFT JOIN model_tool_capabilities mtc ON a.target_type = 'model_tool_capability' AND mtc.id = a.target_id
          LEFT JOIN projects p ON p.id = ${projectIdSql}
          WHERE ${where.join(" AND ")}
          ORDER BY a.created_at DESC, a.id DESC
          LIMIT 100
        `,
        args,
      });
      const items = result.rows.map(rowToApproval);
      const groupBy = input?.groupBy ?? "origin";
      const groups = new Map<string, {
        key: string;
        label: string;
        count: number;
        sensitive: number;
        latestAt: number;
        sampleIds: number[];
      }>();
      for (const item of items) {
        const key =
          groupBy === "origin" ? item.origin
          : groupBy === "project" ? String(item.projectId ?? "unlinked")
          : groupBy === "action_type" ? item.actionType
          : groupBy === "status" ? item.status
          : item.costRisk ?? "unknown";
        const label =
          groupBy === "project" ? item.projectName ?? "Unlinked project"
          : labelizeApprovalGroup(key);
        const existing = groups.get(key) ?? {
          key,
          label,
          count: 0,
          sensitive: 0,
          latestAt: 0,
          sampleIds: [],
        };
        existing.count += 1;
        existing.sensitive += item.sensitive ? 1 : 0;
        existing.latestAt = Math.max(existing.latestAt, item.createdAt);
        if (existing.sampleIds.length < 4) existing.sampleIds.push(item.id);
        groups.set(key, existing);
      }
      return {
        mode: "read_only" as const,
        writesExternal: false,
        wouldApprove: false,
        groupBy,
        groups: Array.from(groups.values()).sort((a, b) => b.count - a.count || b.latestAt - a.latestAt),
        gates: [
          "Approval grouping reads local previews only.",
          "Grouping does not approve, reject, execute, fetch, schedule, send, or write externally.",
        ],
      };
    }),
});

function labelizeApprovalGroup(value: string) {
  return value.replace(/_/g, " ");
}
