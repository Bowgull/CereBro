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
  const linkedVision = row.vision_id == null ? null : {
    id: Number(row.vision_id),
    title: String(row.vision_title ?? ""),
    status: String(row.vision_status ?? "active"),
    ownerAgent: String(row.vision_owner_agent ?? "aang"),
    taskId: row.vision_task_id == null ? null : Number(row.vision_task_id),
    stopRule: String(row.vision_stop_rule ?? ""),
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
    linkedVision,
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

function gitWriteObservationRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    taskId: row.task_id == null ? null : Number(row.task_id),
    command: String(row.command),
    cwd: row.cwd == null ? null : String(row.cwd),
    risk: String(row.risk),
    suggestedAgent: row.suggested_agent == null ? null : String(row.suggested_agent),
    explanation: row.explanation == null ? "" : String(row.explanation),
    gates: String(row.gates ?? "").split("\n").filter(Boolean),
    status: String(row.status),
    outputSummary: row.output_summary == null ? null : String(row.output_summary),
    createdAt: Number(row.created_at),
  };
}

function projectPushContractRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    sourceType: String(row.source_type),
    sourceId: Number(row.source_id),
    actionType: String(row.action_type),
    riskClass: String(row.risk_class),
    requiredApprovals: String(row.required_approvals ?? "").split("\n").filter(Boolean),
    executorAgent: String(row.executor_agent),
    command: row.command == null ? null : String(row.command),
    cwd: row.cwd == null ? null : String(row.cwd),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    taskId: row.task_id == null ? null : Number(row.task_id),
    approvalId: row.approval_id == null ? null : Number(row.approval_id),
    approvalStatus: row.approval_status == null ? null : String(row.approval_status),
    workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
    resultState: String(row.result_state),
    status: String(row.status),
    receiptBody: String(row.receipt_body),
    recoveryNote: row.recovery_note == null ? null : String(row.recovery_note),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function visionRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    title: String(row.title),
    intent: String(row.intent),
    status: String(row.status),
    statusNote: row.status_note == null ? null : String(row.status_note),
    ownerAgent: String(row.owner_agent),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    routeRecordId: row.route_record_id == null ? null : Number(row.route_record_id),
    stopRule: String(row.stop_rule),
    successCriteria: String(row.success_criteria),
    riskNote: row.risk_note == null ? null : String(row.risk_note),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    completedAt: row.completed_at == null ? null : Number(row.completed_at),
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
        wer.permission_preflight_id AS workbench_evidence_permission_preflight_id,
        v.id AS vision_id,
        v.title AS vision_title,
        v.status AS vision_status,
        v.owner_agent AS vision_owner_agent,
        v.task_id AS vision_task_id,
        v.stop_rule AS vision_stop_rule
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
      LEFT JOIN visions v ON v.id = (
        SELECT latest_vision.id
        FROM visions latest_vision
        WHERE latest_vision.route_record_id = r.id
        ORDER BY latest_vision.updated_at DESC, latest_vision.id DESC
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
        gitWriteObservationCount,
        projectPushContractCount,
        visionCounts,
        latestEvidence,
        latestExecutionResults,
        latestGitWriteObservations,
        latestProjectPushContracts,
        latestRoutes,
        latestVisions,
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
        countOne(`
          SELECT COUNT(*) AS value
          FROM command_observations
          WHERE LOWER(TRIM(command)) LIKE 'git add%'
             OR LOWER(TRIM(command)) LIKE 'git commit%'
             OR LOWER(TRIM(command)) LIKE 'git push%'
             OR LOWER(TRIM(command)) LIKE 'git checkout%'
             OR LOWER(TRIM(command)) LIKE 'git reset%'
             OR LOWER(TRIM(command)) LIKE 'git clean%'
             OR LOWER(TRIM(command)) LIKE 'git merge%'
             OR LOWER(TRIM(command)) LIKE 'git rebase%'
             OR LOWER(TRIM(command)) LIKE 'git tag%'
             OR LOWER(TRIM(command)) LIKE 'git branch -d%'
             OR LOWER(TRIM(command)) LIKE 'git branch --delete%'
        `),
        countOne(`
          SELECT COUNT(*) AS value
          FROM execution_action_proposals
          WHERE source_type = 'project_push'
             OR action_type = 'project_manual_push'
             OR risk_class = 'git_remote_write'
        `),
        db.execute({
          sql: `
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
              SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_count,
              SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) AS paused_count
            FROM visions
          `,
        }),
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
              co.*,
              p.name AS project_name
            FROM command_observations co
            LEFT JOIN projects p ON p.id = co.project_id
            WHERE LOWER(TRIM(co.command)) LIKE 'git add%'
               OR LOWER(TRIM(co.command)) LIKE 'git commit%'
               OR LOWER(TRIM(co.command)) LIKE 'git push%'
               OR LOWER(TRIM(co.command)) LIKE 'git checkout%'
               OR LOWER(TRIM(co.command)) LIKE 'git reset%'
               OR LOWER(TRIM(co.command)) LIKE 'git clean%'
               OR LOWER(TRIM(co.command)) LIKE 'git merge%'
               OR LOWER(TRIM(co.command)) LIKE 'git rebase%'
               OR LOWER(TRIM(co.command)) LIKE 'git tag%'
               OR LOWER(TRIM(co.command)) LIKE 'git branch -d%'
               OR LOWER(TRIM(co.command)) LIKE 'git branch --delete%'
            ORDER BY co.created_at DESC, co.id DESC
            LIMIT ?
          `,
          args: [Math.min(evidenceLimit, 10)],
        }),
        db.execute({
          sql: `
            SELECT
              eap.*,
              a.status AS approval_status,
              p.name AS project_name
            FROM execution_action_proposals eap
            LEFT JOIN approvals a ON a.id = eap.approval_id
            LEFT JOIN projects p ON p.id = eap.project_id
            WHERE eap.source_type = 'project_push'
               OR eap.action_type = 'project_manual_push'
               OR eap.risk_class = 'git_remote_write'
            ORDER BY eap.updated_at DESC, eap.id DESC
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
              wer.permission_preflight_id AS workbench_evidence_permission_preflight_id,
              v.id AS vision_id,
              v.title AS vision_title,
              v.status AS vision_status,
              v.owner_agent AS vision_owner_agent,
              v.task_id AS vision_task_id,
              v.stop_rule AS vision_stop_rule
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
            LEFT JOIN visions v ON v.id = (
              SELECT latest_vision.id
              FROM visions latest_vision
              WHERE latest_vision.route_record_id = r.id
              ORDER BY latest_vision.updated_at DESC, latest_vision.id DESC
              LIMIT 1
            )
            ORDER BY r.created_at DESC, r.id DESC
            LIMIT ?
          `,
          args: [routeLimit],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM visions
            ORDER BY
              CASE status
                WHEN 'active' THEN 0
                WHEN 'blocked' THEN 1
                WHEN 'paused' THEN 2
                WHEN 'budget_limited' THEN 3
                WHEN 'unmet' THEN 4
                WHEN 'achieved' THEN 5
              END,
              updated_at DESC,
              id DESC
            LIMIT 5
          `,
        }),
        readMemoryContract(),
        readRouteReceiptContract(),
      ]);

      const taskRow = taskCounts.rows[0] ?? {};
      const sessionRow = sessionCounts.rows[0] ?? {};
      const evidenceRowCounts = evidenceCounts.rows[0] ?? {};
      const visionRowCounts = visionCounts.rows[0] ?? {};

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
          gitWrites: {
            terminalPreviews: gitWriteObservationCount,
            projectPushContracts: projectPushContractCount,
          },
          visions: {
            total: Number(visionRowCounts.total ?? 0),
            active: Number(visionRowCounts.active_count ?? 0),
            blocked: Number(visionRowCounts.blocked_count ?? 0),
            paused: Number(visionRowCounts.paused_count ?? 0),
          },
        },
        latestEvidence: latestEvidence.rows.map((row) => evidenceRow(row as Record<string, unknown>)),
        latestExecutionResults: latestExecutionResults.rows.map((row) => executionResultRow(row as Record<string, unknown>)),
        latestGitWriteObservations: latestGitWriteObservations.rows.map((row) => gitWriteObservationRow(row as Record<string, unknown>)),
        latestProjectPushContracts: latestProjectPushContracts.rows.map((row) => projectPushContractRow(row as Record<string, unknown>)),
        latestRoutes: latestRoutes.rows.map((row) => routeRow(row as Record<string, unknown>)),
        latestVisions: latestVisions.rows.map((row) => visionRow(row as Record<string, unknown>)),
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
