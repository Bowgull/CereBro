import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";
import { routeExecutionReadiness } from "../runtimeExecutionReadiness";
import { readMemoryContract } from "./memory";

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function routeRow(row: Record<string, unknown>) {
  const approvalGates = parseJsonField<string[]>(row.approval_gates_json, []);
  const taskId = row.task_id == null ? null : Number(row.task_id);
  const approvalPreview = row.approval_id == null ? null : {
    id: Number(row.approval_id),
    taskId: row.approval_task_id == null ? null : Number(row.approval_task_id),
    status: String(row.approval_status ?? "pending"),
    actionType: String(row.approval_action_type ?? ""),
    requestedByAgent: row.approval_requested_by_agent == null ? null : String(row.approval_requested_by_agent),
    permissionPreflightId: row.approval_permission_preflight_id == null ? null : Number(row.approval_permission_preflight_id),
    decidedAt: row.approval_decided_at == null ? null : Number(row.approval_decided_at),
  };
  const workbenchEvidence = row.workbench_evidence_id == null ? null : {
    id: Number(row.workbench_evidence_id),
    kind: String(row.workbench_evidence_kind ?? ""),
    title: String(row.workbench_evidence_title ?? ""),
    targetUri: row.workbench_evidence_target_uri == null ? null : String(row.workbench_evidence_target_uri),
    taskId: row.workbench_evidence_task_id == null ? null : Number(row.workbench_evidence_task_id),
    permissionPreflightId: row.workbench_evidence_permission_preflight_id == null ? null : Number(row.workbench_evidence_permission_preflight_id),
  };
  return {
    id: Number(row.id),
    originalText: String(row.original_text ?? ""),
    mode: String(row.mode ?? "quick"),
    category: String(row.category ?? "quick_answer"),
    confidence: String(row.confidence ?? "medium"),
    aangRead: String(row.aang_read ?? ""),
    ownerAgent: String(row.owner_agent ?? "aang"),
    supportAgents: parseJsonField<string[]>(row.support_agents_json, []),
    projectSlug: row.project_slug == null ? null : String(row.project_slug),
    projectName: row.project_name == null ? null : String(row.project_name),
    projectPath: row.project_path == null ? null : String(row.project_path),
    permissionClass: String(row.permission_class ?? "local_note"),
    routeChain: parseJsonField<string[]>(row.route_chain_json, []),
    approvalGates,
    modelProposal: parseJsonField<Record<string, unknown>>(row.model_proposal_json, {}),
    toolProposal: parseJsonField<Record<string, unknown>>(row.tool_proposal_json, {}),
    workbenchReceiptDraft: parseJsonField<Record<string, unknown>>(row.workbench_draft_json, {}),
    ledgerFocusDraft: parseJsonField<Record<string, unknown>>(row.ledger_focus_json, {}),
    taskDraft: parseJsonField<Record<string, unknown>>(row.task_draft_json, {}),
    taskId,
    approvalPreview,
    workbenchEvidence,
    executionReadiness: routeExecutionReadiness({
      routeRecordId: Number(row.id),
      taskId,
      approvalGates,
      approvalId: approvalPreview?.id ?? null,
      approvalStatus: approvalPreview?.status ?? null,
      workbenchEvidenceId: workbenchEvidence?.id ?? null,
    }),
    nextAction: String(row.next_action ?? ""),
    createdAt: Number(row.created_at ?? 0),
  };
}

function evidenceRow(row: Record<string, unknown>) {
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
    commandObservationId: row.command_observation_id == null ? null : Number(row.command_observation_id),
    ownerAgent: String(row.owner_agent),
    routeAgent: row.route_agent == null ? null : String(row.route_agent),
    validationStatus: String(row.validation_status),
    permissionClass: String(row.permission_class),
    sensitive: Boolean(row.sensitive_data_flag),
    createdAt: Number(row.created_at),
  };
}

function executionResultRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    proposalId: row.proposal_id == null ? null : Number(row.proposal_id),
    approvalId: row.approval_id == null ? null : Number(row.approval_id),
    executorAgent: String(row.executor_agent),
    command: String(row.command),
    cwd: String(row.cwd),
    exitCode: row.exit_code == null ? null : Number(row.exit_code),
    stdoutSummary: row.stdout_summary == null ? "" : String(row.stdout_summary),
    stderrSummary: row.stderr_summary == null ? "" : String(row.stderr_summary),
    durationMs: Number(row.duration_ms),
    timedOut: Boolean(row.timed_out),
    status: String(row.status),
    receiptBody: String(row.receipt_body),
    recoveryNote: row.recovery_note == null ? null : String(row.recovery_note),
    createdAt: Number(row.created_at),
  };
}

async function countOne(sql: string, args: (string | number)[] = []) {
  const db = await getCerebroDb();
  const result = await db.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

async function readRouteReceiptContract() {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT
        r.*,
        a.id AS approval_id,
        a.task_id AS approval_task_id,
        a.status AS approval_status,
        a.action_type AS approval_action_type,
        a.requested_by_agent AS approval_requested_by_agent,
        a.permission_preflight_id AS approval_permission_preflight_id,
        a.decided_at AS approval_decided_at,
        wer.id AS workbench_evidence_id,
        wer.kind AS workbench_evidence_kind,
        wer.title AS workbench_evidence_title,
        wer.target_uri AS workbench_evidence_target_uri,
        wer.task_id AS workbench_evidence_task_id,
        wer.permission_preflight_id AS workbench_evidence_permission_preflight_id
      FROM runtime_route_records r
      LEFT JOIN approvals a ON a.id = (
        SELECT latest.id
        FROM approvals latest
        WHERE latest.target_type = 'runtime_route_record'
          AND latest.target_id = r.id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      )
      LEFT JOIN workbench_evidence_records wer ON wer.id = (
        SELECT latest_evidence.id
        FROM workbench_evidence_records latest_evidence
        WHERE latest_evidence.target_uri = 'runtime_route:' || r.id
        ORDER BY latest_evidence.created_at DESC, latest_evidence.id DESC
        LIMIT 1
      )
      ORDER BY r.created_at DESC, r.id DESC
    `,
    args: [],
  });
  const routes = result.rows.map((row) => routeRow(row as Record<string, unknown>));

  return {
    mode: "read_only" as const,
    ownerAgent: "cortana" as const,
    bodySurface: "workbench" as const,
    auditSurface: "ledger" as const,
    executorStatus: "not_built" as const,
    canExecute: false,
    totalRoutes: routes.length,
    taskLinkedRoutes: routes.filter((route) => route.taskId != null).length,
    workbenchBodyLinkedRoutes: routes.filter((route) => route.workbenchEvidence != null).length,
    approvalPreviewRoutes: routes.filter((route) => route.approvalPreview != null).length,
    approvedGateRoutes: routes.filter((route) => route.approvalPreview?.status === "approved").length,
    futureReviewOnlyRoutes: routes.filter((route) => route.executionReadiness.readyForFutureExecutorReview).length,
    gates: [
      "Route receipts are local records before execution.",
      "Workbench holds the body. Ledger holds the audit trail.",
      "Execution remains blocked. A future executor must be designed separately.",
    ],
    noActionTaken: [
      "No command ran.",
      "No browser opened.",
      "No model call ran.",
      "No git action ran.",
      "No route was saved from this read.",
      "No task, approval, Workbench receipt, memory row, file, or external write was created.",
    ],
    nextAction: "Keep hardening route receipts before adding any executor.",
  };
}

export const ledgerRouter = router({
  overview: publicProcedure
    .input(
      z
        .object({
          evidenceLimit: z.number().int().min(1).max(50).default(50),
          routeLimit: z.number().int().min(1).max(20).default(6),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const evidenceLimit = input?.evidenceLimit ?? 50;
      const routeLimit = input?.routeLimit ?? 6;

      const [
        taskCounts,
        sessionCounts,
        pendingApprovals,
        artifactCount,
        memoryCount,
        proposalCount,
        evidenceCounts,
        routeCount,
        executionResultCount,
        latestEvidence,
        latestExecutionResults,
        latestRoutes,
        memoryContract,
        routeReceiptContract,
      ] = await Promise.all([
        db.execute({
          sql: `
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count,
              SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count
            FROM tasks
          `,
        }),
        db.execute({
          sql: `
            SELECT
              COUNT(*) AS recent_count,
              SUM(CASE WHEN ended_at IS NULL THEN 1 ELSE 0 END) AS active_count
            FROM (
              SELECT ended_at
              FROM sessions
              ORDER BY last_seen_at DESC, id DESC
              LIMIT 50
            )
          `,
        }),
        countOne("SELECT COUNT(*) AS value FROM approvals WHERE status = ?", ["pending"]),
        countOne("SELECT COUNT(*) AS value FROM artifacts"),
        countOne("SELECT COUNT(*) AS value FROM memory_entries"),
        countOne("SELECT COUNT(*) AS value FROM memory_proposals"),
        db.execute({
          sql: `
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN kind = 'terminal_output' THEN 1 ELSE 0 END) AS terminal_count
            FROM workbench_evidence_records
          `,
        }),
        countOne("SELECT COUNT(*) AS value FROM runtime_route_records"),
        countOne("SELECT COUNT(*) AS value FROM execution_action_results"),
        db.execute({
          sql: `
            SELECT
              wer.id,
              wer.kind,
              wer.title,
              wer.summary,
              wer.target_uri,
              wer.project_id,
              wer.task_id,
              wer.session_id,
              wer.command_observation_id,
              wer.owner_agent,
              wer.route_agent,
              wer.validation_status,
              wer.permission_class,
              wer.sensitive_data_flag,
              wer.created_at,
              p.name AS project_name
            FROM workbench_evidence_records wer
            LEFT JOIN projects p ON p.id = wer.project_id
            ORDER BY wer.created_at DESC, wer.id DESC
            LIMIT ?
          `,
          args: [evidenceLimit],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM execution_action_results
            ORDER BY created_at DESC, id DESC
            LIMIT ?
          `,
          args: [Math.min(evidenceLimit, 10)],
        }),
        db.execute({
          sql: `
            SELECT
              r.*,
              a.id AS approval_id,
              a.task_id AS approval_task_id,
              a.status AS approval_status,
              a.action_type AS approval_action_type,
              a.requested_by_agent AS approval_requested_by_agent,
              a.permission_preflight_id AS approval_permission_preflight_id,
              a.decided_at AS approval_decided_at,
              wer.id AS workbench_evidence_id,
              wer.kind AS workbench_evidence_kind,
              wer.title AS workbench_evidence_title,
              wer.target_uri AS workbench_evidence_target_uri,
              wer.task_id AS workbench_evidence_task_id,
              wer.permission_preflight_id AS workbench_evidence_permission_preflight_id
            FROM runtime_route_records r
            LEFT JOIN approvals a ON a.id = (
              SELECT latest.id
              FROM approvals latest
              WHERE latest.target_type = 'runtime_route_record'
                AND latest.target_id = r.id
              ORDER BY latest.created_at DESC, latest.id DESC
              LIMIT 1
            )
            LEFT JOIN workbench_evidence_records wer ON wer.id = (
              SELECT latest_evidence.id
              FROM workbench_evidence_records latest_evidence
              WHERE latest_evidence.target_uri = 'runtime_route:' || r.id
              ORDER BY latest_evidence.created_at DESC, latest_evidence.id DESC
              LIMIT 1
            )
            ORDER BY r.created_at DESC, r.id DESC
            LIMIT ?
          `,
          args: [routeLimit],
        }),
        readMemoryContract(),
        readRouteReceiptContract(),
      ]);

      const taskRow = taskCounts.rows[0] ?? {};
      const sessionRow = sessionCounts.rows[0] ?? {};
      const evidenceRowCounts = evidenceCounts.rows[0] ?? {};

      return {
        mode: "read_only" as const,
        cards: {
          tasks: {
            total: Number(taskRow.total ?? 0),
            open: Number(taskRow.open_count ?? 0) + Number(taskRow.in_progress_count ?? 0),
          },
          sessions: {
            recent: Number(sessionRow.recent_count ?? 0),
            active: Number(sessionRow.active_count ?? 0),
          },
          approvals: {
            pending: pendingApprovals,
          },
          outputs: {
            total: artifactCount,
          },
          memory: {
            total: memoryCount,
            proposed: proposalCount,
          },
          receipts: {
            total: Number(evidenceRowCounts.total ?? 0),
            terminal: Number(evidenceRowCounts.terminal_count ?? 0),
          },
          routes: {
            total: routeCount,
          },
          execution: {
            total: executionResultCount,
          },
        },
        latestEvidence: latestEvidence.rows.map((row) => evidenceRow(row as Record<string, unknown>)),
        latestExecutionResults: latestExecutionResults.rows.map((row) => executionResultRow(row as Record<string, unknown>)),
        latestRoutes: latestRoutes.rows.map((row) => routeRow(row as Record<string, unknown>)),
        memoryContract,
        routeReceiptContract,
        gates: [
          "Ledger overview is read-only.",
          "This read model does not open browsers, run commands, call models, approve gates, or write externally.",
          "Workbench remains the body surface. Ledger remains the audit surface.",
        ],
      };
    }),
});
