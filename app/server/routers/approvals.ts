import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";

const statusOptions = ["pending", "approved", "rejected", "cancelled"] as const;
const originOptions = ["all", "hedwig", "terminal", "project_lab", "source", "other"] as const;
const groupOptions = ["origin", "project", "action_type", "status", "risk"] as const;
const preflightDecisions = ["allowed_local", "proposal_only", "approval_required", "blocked_by_hard_gate"] as const;
const perceptionClasses = ["explicit_context", "local_files", "terminal_logs", "workbench_media", "public_browser"] as const;
const actionClasses = ["local_note", "code_edit", "command_execution", "browser_or_media_capture", "external_write", "cleanup"] as const;

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
  if (input.targetType === "command_observation" || input.actionType.startsWith("terminal_")) return "terminal";
  if (input.targetType === "source_event" || input.actionType.includes("source")) return "source";
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
  if (spockNotes.length === 0) {
    spockNotes.push("Shape check passed for a local approval preview. This is not approval.");
  }

  return { oakNotes, spockNotes };
}

export const approvalsRouter = router({
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
        where.push("COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id) = ?");
        args.push(input.projectId);
      }

      if (origin === "hedwig") {
        where.push("a.requested_by_agent = 'hedwig'");
      } else if (origin === "terminal") {
        where.push("(a.target_type = 'command_observation' OR a.action_type LIKE 'terminal_%')");
      } else if (origin === "source") {
        where.push("(a.target_type = 'source_event' OR a.action_type LIKE '%source%')");
      } else if (origin === "project_lab") {
        where.push("(a.target_type IN ('task', 'project') OR COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id) IS NOT NULL)");
      } else if (origin === "other") {
        where.push(`
          a.requested_by_agent != 'hedwig'
          AND COALESCE(a.target_type, '') != 'command_observation'
          AND a.action_type NOT LIKE 'terminal_%'
          AND COALESCE(a.target_type, '') != 'source_event'
          AND a.action_type NOT LIKE '%source%'
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
          )
        `);
        const like = `%${query}%`;
        args.push(like, like, like, like, like, like, like, like, like);
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
            COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id) AS project_id,
            p.name AS project_name,
            p.path AS project_path,
            COALESCE(co.command, cap.title, rp.title, mp.title, se.title) AS target_label
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
          LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
          LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
          LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
          LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
          LEFT JOIN permission_preflight_records ppr ON ppr.id = a.permission_preflight_id
          LEFT JOIN projects p ON p.id = COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id)
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
        where.push("COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id) = ?");
        args.push(input.projectId);
      }

      if (origin === "hedwig") {
        where.push("a.requested_by_agent = 'hedwig'");
      } else if (origin === "terminal") {
        where.push("(a.target_type = 'command_observation' OR a.action_type LIKE 'terminal_%')");
      } else if (origin === "source") {
        where.push("(a.target_type = 'source_event' OR a.action_type LIKE '%source%')");
      } else if (origin === "project_lab") {
        where.push("(a.target_type IN ('task', 'project') OR COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id) IS NOT NULL)");
      } else if (origin === "other") {
        where.push(`
          a.requested_by_agent != 'hedwig'
          AND COALESCE(a.target_type, '') != 'command_observation'
          AND a.action_type NOT LIKE 'terminal_%'
          AND COALESCE(a.target_type, '') != 'source_event'
          AND a.action_type NOT LIKE '%source%'
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
          )
        `);
        const like = `%${query}%`;
        args.push(like, like, like, like, like, like, like, like, like);
      }

      const result = await db.execute({
        sql: `
          SELECT
            a.id, a.task_id, a.action_type, a.target_type, a.target_id,
            a.requested_by_agent, a.status, a.reason, a.context_summary,
            a.sensitive_data_flag, a.cost_risk, a.decided_at, a.created_at,
            a.permission_preflight_id,
            COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id) AS project_id,
            p.name AS project_name,
            p.path AS project_path,
            COALESCE(co.command, cap.title, rp.title, mp.title, se.title) AS target_label
          FROM approvals a
          LEFT JOIN tasks t ON t.id = a.task_id
          LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
          LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
          LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
          LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
          LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
          LEFT JOIN projects p ON p.id = COALESCE(t.project_id, co.project_id, cap.project_id, rp.project_id, mp.project_id, se.project_id)
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
