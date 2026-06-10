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
    proposalSourceType: row.proposal_source_type == null ? null : String(row.proposal_source_type),
    proposalSourceId: row.proposal_source_id == null ? null : Number(row.proposal_source_id),
    approvalId: row.approval_id == null ? null : Number(row.approval_id),
    actionType: row.action_type == null ? null : String(row.action_type),
    riskClass: row.risk_class == null ? null : String(row.risk_class),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    taskId: row.task_id == null ? null : Number(row.task_id),
    workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
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

function browserProposalRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    actionLabel: String(row.action_label),
    target: String(row.target),
    draftKind: String(row.draft_kind),
    riskClass: String(row.risk_class),
    executorAgent: String(row.executor_agent),
    statusLabel: String(row.status ?? "proposal_blocked").split("_").join(" "),
    canExecute: Boolean(row.can_execute),
    resultState: String(row.result_state),
    recoveryNote: row.recovery_note == null ? null : String(row.recovery_note),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function browserTabRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    proposalId: row.proposal_id == null ? null : Number(row.proposal_id),
    tabId: String(row.tab_id),
    targetUrl: String(row.target_url),
    title: row.title == null ? null : String(row.title),
    state: String(row.state),
    projectId: row.project_id == null ? null : Number(row.project_id),
    sourceId: row.source_id == null ? null : Number(row.source_id),
    workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
    watchShelfId: row.watch_shelf_id == null ? null : Number(row.watch_shelf_id),
    lastError: row.last_error == null ? null : String(row.last_error),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function browserWatchShelfRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    browserTabSessionId: row.browser_tab_session_id == null ? null : Number(row.browser_tab_session_id),
    proposalId: row.proposal_id == null ? null : Number(row.proposal_id),
    targetUrl: String(row.target_url),
    title: row.title == null ? null : String(row.title),
    category: String(row.category),
    sourceLabel: row.source_label == null ? null : String(row.source_label),
    progressLabel: row.progress_label == null ? null : String(row.progress_label),
    state: String(row.state),
    projectId: row.project_id == null ? null : Number(row.project_id),
    sourceId: row.source_id == null ? null : Number(row.source_id),
    workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function browserRunnerAuditRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    proposalId: row.proposal_id == null ? null : Number(row.proposal_id),
    runnerState: String(row.runner_state),
    canOpenPage: Boolean(row.can_open_page),
    canExecute: Boolean(row.can_execute),
    receiptBody: String(row.receipt_body),
    noActionTaken: String(row.no_action_taken ?? "").split("\n").filter(Boolean),
    createdAt: Number(row.created_at),
  };
}

function browserRunnerAuditDetailRow(row: Record<string, unknown>) {
  return {
    ...browserRunnerAuditRow(row),
    proposal: row.browser_proposal_id == null ? null : {
      id: Number(row.browser_proposal_id),
      actionLabel: String(row.browser_action_label),
      target: String(row.browser_target),
      draftKind: String(row.browser_draft_kind),
      riskClass: String(row.browser_risk_class),
      executorAgent: String(row.browser_executor_agent),
      statusLabel: String(row.browser_status ?? "proposal_blocked").split("_").join(" "),
      resultState: String(row.browser_result_state),
      canExecute: Boolean(row.browser_can_execute),
      recoveryNote: row.browser_recovery_note == null ? null : String(row.browser_recovery_note),
    },
  };
}

function browserLiveRunnerApprovalRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    proposalId: row.target_id == null ? null : Number(row.target_id),
    status: String(row.status),
    actionType: String(row.action_type),
    requestedByAgent: row.requested_by_agent == null ? null : String(row.requested_by_agent),
    reason: row.reason == null ? null : String(row.reason),
    contextSummary: row.context_summary == null ? null : String(row.context_summary),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
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

async function readExecutionReceiptLoopAudit() {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT
        COUNT(DISTINCT eap.id) AS proposals,
        COUNT(DISTINCT CASE WHEN eap.approval_id IS NOT NULL THEN eap.id END) AS approval_linked,
        COUNT(DISTINCT CASE WHEN a.status = 'approved' THEN eap.id END) AS approved,
        COUNT(DISTINCT CASE WHEN eap.workbench_evidence_id IS NOT NULL THEN eap.id END) AS body_linked,
        COUNT(DISTINCT CASE WHEN eap.task_id IS NOT NULL THEN eap.id END) AS task_linked,
        COUNT(DISTINCT CASE WHEN eap.risk_class = 'read_only' THEN eap.id END) AS read_only,
        COUNT(DISTINCT CASE WHEN eap.risk_class != 'read_only' THEN eap.id END) AS blocked_risk,
        COUNT(DISTINCT CASE WHEN ear.id IS NOT NULL THEN eap.id END) AS result_linked,
        COUNT(DISTINCT CASE WHEN ear.status = 'completed' THEN eap.id END) AS completed,
        COUNT(DISTINCT CASE WHEN eap.source_type = 'command_observation' THEN eap.id END) AS terminal_source,
        COUNT(DISTINCT v.id) AS validation_notes
      FROM execution_action_proposals eap
      LEFT JOIN approvals a ON a.id = eap.approval_id
      LEFT JOIN execution_action_results ear ON ear.id = (
        SELECT latest.id
        FROM execution_action_results latest
        WHERE latest.proposal_id = eap.id
        ORDER BY latest.created_at DESC, latest.id DESC
        LIMIT 1
      )
      LEFT JOIN workbench_evidence_records v ON v.target_uri = 'evidence:' || eap.workbench_evidence_id
        AND v.kind = 'validation_note'
    `,
  });
  const row = result.rows[0] ?? {};
  const proposals = Number(row.proposals ?? 0);
  const approvalLinked = Number(row.approval_linked ?? 0);
  const approved = Number(row.approved ?? 0);
  const bodyLinked = Number(row.body_linked ?? 0);
  const taskLinked = Number(row.task_linked ?? 0);
  const readOnly = Number(row.read_only ?? 0);
  const blockedRisk = Number(row.blocked_risk ?? 0);
  const resultLinked = Number(row.result_linked ?? 0);
  const completed = Number(row.completed ?? 0);
  const terminalSource = Number(row.terminal_source ?? 0);
  const validationNotes = Number(row.validation_notes ?? 0);
  const readyToReview = Math.min(approvalLinked, approved, bodyLinked, taskLinked, readOnly);
  return {
    mode: "read_only" as const,
    ownerAgent: "spock" as const,
    proposals,
    terminalSource,
    approvalLinked,
    approved,
    bodyLinked,
    taskLinked,
    readOnly,
    blockedRisk,
    readyToReview,
    resultLinked,
    completed,
    validationNotes,
    canExecuteFromAudit: false,
    gates: [
      "Execution receipt loop audit reads local records only.",
      "Approval, Workbench, Terminal, and Ledger links are evidence. They are not permission to run new work.",
      "The audit does not approve, reject, execute commands, browse, fetch, call models, stage git, push, or write externally.",
    ],
    nextAction: validationNotes < resultLinked
      ? "Append or inspect validation receipts for completed execution bodies."
      : "Receipt loop is inspectable. Keep runner scope unchanged.",
  };
}

async function readBrowserReceiptAudit() {
  const db = await getCerebroDb();
  const [summary, draftTabs, watchShelfItems, runnerAudits, liveRunnerApprovalSummary, latestProposals, latestTabs, latestWatchShelfItems, latestRunnerAudits, latestLiveRunnerApprovals] = await Promise.all([
    db.execute(`
      SELECT
        COUNT(*) AS proposals,
        SUM(CASE WHEN result_state = 'blocked_before_runner' THEN 1 ELSE 0 END) AS result_scaffolds,
        SUM(CASE WHEN recovery_note IS NOT NULL AND TRIM(recovery_note) != '' THEN 1 ELSE 0 END) AS recovery_scaffolds,
        SUM(CASE WHEN can_execute = 1 THEN 1 ELSE 0 END) AS executable
      FROM browser_action_proposals
    `),
    countOne("SELECT COUNT(*) AS value FROM browser_tab_sessions WHERE state = ?", ["draft"]),
    countOne("SELECT COUNT(*) AS value FROM browser_watch_shelf_items"),
    countOne("SELECT COUNT(*) AS value FROM browser_runner_audit_records"),
    db.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved
      FROM approvals
      WHERE target_type = 'browser_action_proposal'
        AND action_type = 'browser_live_runner'
    `),
    db.execute(`
      SELECT id, action_label, target, draft_kind, risk_class, executor_agent,
             status, can_execute, result_state, recovery_note, created_at, updated_at
      FROM browser_action_proposals
      ORDER BY updated_at DESC, id DESC
      LIMIT 5
    `),
    db.execute(`
      SELECT id, proposal_id, tab_id, target_url, title, state, project_id,
             source_id, workbench_evidence_id, watch_shelf_id, last_error,
             created_at, updated_at
      FROM browser_tab_sessions
      ORDER BY updated_at DESC, id DESC
      LIMIT 5
    `),
    db.execute(`
      SELECT id, browser_tab_session_id, proposal_id, target_url, title,
             category, source_label, progress_label, state, project_id,
             source_id, workbench_evidence_id, created_at, updated_at
      FROM browser_watch_shelf_items
      ORDER BY updated_at DESC, id DESC
      LIMIT 5
    `),
    db.execute(`
      SELECT id, proposal_id, runner_state, can_open_page, can_execute,
             receipt_body, no_action_taken, created_at
      FROM browser_runner_audit_records
      ORDER BY created_at DESC, id DESC
      LIMIT 5
    `),
    db.execute(`
      SELECT id, action_type, target_type, target_id, requested_by_agent,
             status, reason, context_summary, permission_preflight_id,
             decided_at, created_at
      FROM approvals
      WHERE target_type = 'browser_action_proposal'
        AND action_type = 'browser_live_runner'
      ORDER BY created_at DESC, id DESC
      LIMIT 5
    `),
  ]);
  const row = summary.rows[0] ?? {};
  const liveRunnerRow = liveRunnerApprovalSummary.rows[0] ?? {};
  const latestRunnerAuditRow = latestRunnerAudits.rows[0] as Record<string, unknown> | undefined;

  return {
    mode: "read_only" as const,
    ownerAgent: "spock" as const,
    proposals: Number(row.proposals ?? 0),
    draftTabs,
    watchShelfItems,
    runnerAudits,
    liveRunnerApprovals: Number(liveRunnerRow.total ?? 0),
    pendingLiveRunnerApprovals: Number(liveRunnerRow.pending ?? 0),
    approvedLiveRunnerApprovals: Number(liveRunnerRow.approved ?? 0),
    resultScaffolds: Number(row.result_scaffolds ?? 0),
    recoveryScaffolds: Number(row.recovery_scaffolds ?? 0),
    executable: Number(row.executable ?? 0),
    canOpenPage: false,
    canExecute: false,
    canSaveWatchShelf: false,
    canPersistWatchProgress: false,
    launchGate: {
      mode: "read_only" as const,
      ownerAgent: "spock" as const,
      implementationPresent: false,
      canOpenPage: false,
      canExecute: false,
      hardGate: "live runner implementation missing",
      latestRunnerAuditId: latestRunnerAuditRow?.id == null ? null : Number(latestRunnerAuditRow.id),
      receiptBody: "Ledger reads Browser launch gate state. It cannot open pages or execute the live runner.",
    },
    latestProposals: latestProposals.rows.map((proposalRow) => browserProposalRow(proposalRow as Record<string, unknown>)),
    latestTabs: latestTabs.rows.map((tabRow) => browserTabRow(tabRow as Record<string, unknown>)),
    latestWatchShelfItems: latestWatchShelfItems.rows.map((shelfRow) => browserWatchShelfRow(shelfRow as Record<string, unknown>)),
    latestRunnerAudits: latestRunnerAudits.rows.map((auditRow) => browserRunnerAuditRow(auditRow as Record<string, unknown>)),
    latestLiveRunnerApprovals: latestLiveRunnerApprovals.rows.map((approvalRow) => browserLiveRunnerApprovalRow(approvalRow as Record<string, unknown>)),
    gates: [
      "Browser receipt audit reads local Browser proposals and draft tabs only.",
      "Ledger reads runner audit rows but does not run the Browser runner.",
      "Ledger reads live-runner approval rows as receipts, not permission to open pages.",
      "Ledger reads launch gate state but cannot open pages.",
      "This read does not open pages, fetch URLs, persist history, save sources, or run browser automation.",
      "This read does not save Watch Shelf items or persist watch progress.",
      "Workbench remains the Browser body surface. Ledger remains the audit surface.",
    ],
    noActionTaken: [
      "No browser opened.",
      "No page fetched.",
      "No history persisted.",
      "No source saved.",
      "No Watch Shelf item saved.",
      "No progress persisted.",
      "No external write ran.",
    ],
    nextAction: "Keep Browser runner blocked until a separate live runner contract is approved.",
  };
}

export const ledgerRouter = router({
  browserRunnerAuditDetail: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT
            bra.id, bra.proposal_id, bra.runner_state, bra.can_open_page,
            bra.can_execute, bra.receipt_body, bra.no_action_taken,
            bra.created_at,
            bap.id AS browser_proposal_id,
            bap.action_label AS browser_action_label,
            bap.target AS browser_target,
            bap.draft_kind AS browser_draft_kind,
            bap.risk_class AS browser_risk_class,
            bap.executor_agent AS browser_executor_agent,
            bap.status AS browser_status,
            bap.result_state AS browser_result_state,
            bap.can_execute AS browser_can_execute,
            bap.recovery_note AS browser_recovery_note
          FROM browser_runner_audit_records bra
          LEFT JOIN browser_action_proposals bap ON bap.id = bra.proposal_id
          WHERE bra.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const row = result.rows[0] as Record<string, unknown> | undefined;
      return {
        mode: "read_only" as const,
        ownerAgent: "spock" as const,
        found: Boolean(row),
        audit: row ? browserRunnerAuditDetailRow(row) : null,
        canOpenPage: false,
        canExecute: false,
        gates: [
          "Browser runner audit detail is read-only.",
          "A runner audit receipt is evidence, not permission to open pages.",
          "This read does not open pages, fetch URLs, persist history, save sources, run browser automation, or write externally.",
        ],
        noActionTaken: [
          "No browser opened.",
          "No page fetched.",
          "No history persisted.",
          "No source saved.",
          "No Watch Shelf item saved.",
          "No progress persisted.",
          "No external write ran.",
        ],
      };
    }),

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
        latestEvidence,
        latestExecutionResults,
        latestGitWriteObservations,
        latestProjectPushContracts,
        latestRoutes,
        memoryContract,
        routeReceiptContract,
        executionReceiptLoopAudit,
        browserReceiptAudit,
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
            SELECT
              ear.*,
              eap.action_type,
              eap.risk_class,
              eap.source_type AS proposal_source_type,
              eap.source_id AS proposal_source_id,
              eap.project_id,
              eap.task_id,
              eap.workbench_evidence_id,
              p.name AS project_name
            FROM execution_action_results ear
            LEFT JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
            LEFT JOIN projects p ON p.id = eap.project_id
            ORDER BY ear.created_at DESC, ear.id DESC
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
        readMemoryContract(),
        readRouteReceiptContract(),
        readExecutionReceiptLoopAudit(),
        readBrowserReceiptAudit(),
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
          gitWrites: {
            terminalPreviews: gitWriteObservationCount,
            projectPushContracts: projectPushContractCount,
          },
        },
        latestEvidence: latestEvidence.rows.map((row) => evidenceRow(row as Record<string, unknown>)),
        latestExecutionResults: latestExecutionResults.rows.map((row) => executionResultRow(row as Record<string, unknown>)),
        latestGitWriteObservations: latestGitWriteObservations.rows.map((row) => gitWriteObservationRow(row as Record<string, unknown>)),
        latestProjectPushContracts: latestProjectPushContracts.rows.map((row) => projectPushContractRow(row as Record<string, unknown>)),
        latestRoutes: latestRoutes.rows.map((row) => routeRow(row as Record<string, unknown>)),
        memoryContract,
        routeReceiptContract,
        executionReceiptLoopAudit,
        browserReceiptAudit,
        gates: [
          "Ledger overview is read-only.",
          "This read model does not open browsers, run commands, call models, approve gates, or write externally.",
          "Workbench remains the body surface. Ledger remains the audit surface.",
        ],
      };
    }),
});
