import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getCerebroDb } from "./cerebroDb";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

async function countRows(table: string) {
  const db = await getCerebroDb();
  const result = await db.execute(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(result.rows[0]?.count ?? 0);
}

async function countRowsWhere(sql: string, args: (string | number)[] = []) {
  const db = await getCerebroDb();
  const result = await db.execute({ sql, args });
  return Number(result.rows[0]?.count ?? 0);
}

const previewMutationTables = [
  "tasks",
  "sessions",
  "memory_entries",
  "memory_proposals",
  "outputs",
  "validations",
  "approvals",
  "tool_calls",
  "command_observations",
  "capture_observations",
  "reminder_proposals",
  "message_draft_proposals",
  "sources",
  "source_events",
  "workbench_evidence_records",
  "permission_preflight_records",
  "runtime_route_records",
] as const;

async function countPreviewMutationRows() {
  const counts = new Map<string, number>();
  for (const table of previewMutationTables) {
    counts.set(table, await countRows(table));
  }
  return counts;
}

describe("runtime route receipt preview", () => {
  it("returns a local-only Aang to Cortana receipt draft without mutating history", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const preview = await caller.runtime.previewRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    expect(preview.mode).toBe("proposal_only");
    expect(preview.writesExternal).toBe(false);
    expect(preview.runsCommand).toBe(false);
    expect(preview.opensBrowser).toBe(false);
    expect(preview.callsModel).toBe(false);
    expect(preview.aangRead).toContain("project build");
    expect(preview.cortanaRoute[0]).toBe("Aang reads mode");
    expect(preview.cortanaRoute[1]).toBe("Cortana routes");
    expect(preview.ownerAgent).toBe("tony");
    expect(preview.supportAgents).toContain("spock");
    expect(preview.project?.slug).toBe("cerebro");
    expect(preview.receipt.kind).toBe("route_preview");
    expect(preview.receipt.bodyTarget).toBe("workbench");
    expect(preview.receipt.auditTarget).toBe("ledger");
    expect(preview.executionReadiness).toMatchObject({
      canExecute: false,
      status: "preview_only",
      routeRecordId: null,
      taskId: null,
      approvalId: null,
      workbenchEvidenceId: null,
    });
    expect(preview.executionReadiness.requiredBeforeExecution).toContain("Workbench receipt body");
    expect(preview.executionReadiness.noActionTaken).toContain("No command ran.");
    expect(preview.workbenchReceiptDraft.kind).toBe("route_preview");
    expect(preview.workbenchReceiptDraft.stage).toBe("staged");
    expect(preview.workbenchReceiptDraft.saveTarget).toBe("workbench");
    expect(preview.workbenchReceiptDraft.autosave).toBe(false);
    expect(preview.workbenchReceiptDraft.summary).toBe(preview.receipt.summary);
    expect(preview.workbenchReceiptDraft.routeChain).toEqual(preview.cortanaRoute);
    expect(preview.workbenchReceiptDraft.gates).toContain("No external action from route preview.");
    expect(preview.workbenchReceiptDraft.projectFocus).toEqual({
      projectSlug: "cerebro",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
      projectId: null,
      resolution: "name_or_path_preview",
      autosave: false,
    });
    expect(preview.ledgerFocusDraft.kind).toBe("route_preview_audit_focus");
    expect(preview.ledgerFocusDraft.focusTarget).toBe("ledger");
    expect(preview.ledgerFocusDraft.autosave).toBe(false);
    expect(preview.ledgerFocusDraft.projectSlug).toBe("cerebro");
    expect(preview.ledgerFocusDraft.projectName).toBe("CereBro");
    expect(preview.ledgerFocusDraft.auditFilters).toEqual({
      ownerAgent: "tony",
      category: "project_build",
      projectSlug: "cerebro",
      projectName: "CereBro",
      modelLaneId: "frontier_or_codex_escalation",
      bodyTarget: "workbench",
    });
    expect(preview.ledgerFocusDraft.focusSummary).toContain("tony");
    expect(preview.projectFocusDraft).toEqual({
      kind: "route_preview_project_focus",
      focusTarget: "project_lab",
      autosave: false,
      projectSlug: "cerebro",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
      projectId: null,
      focusSummary: "Open Project Lab for CereBro route preview context. No project write is saved.",
    });
    expect(preview.taskDraft.agent).toBe("tony");
    expect(preview.taskDraft.projectName).toBe("CereBro");
    expect(preview.taskDraft.title).toContain("project build");
    expect(preview.gates.join(" ")).toContain("No model call");

    for (const table of previewMutationTables) {
      expect(await countRows(table)).toBe(rowCountsBefore.get(table));
    }
  });

  it("keeps public research behind approval gates", async () => {
    const caller = createCaller();

    const preview = await caller.runtime.previewRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });

    expect(preview.category).toBe("research");
    expect(preview.ownerAgent).toBe("surfer");
    expect(preview.toolProposal.actionClass).toBe("browser_or_media_capture");
    expect(preview.toolProposal.externalTarget).toBe(true);
    expect(preview.toolProposal.approvalRequired).toBe(true);
    expect(preview.approvalGates).toContain("external target approval");
    expect(preview.approvalGates).toContain("public-browser approval");
    expect(preview.nextAction).toContain("Ask approval before browser/source capture");
  });

  it("shows local-first model lane guidance before any model call", async () => {
    const caller = createCaller();

    const quickPreview = await caller.runtime.previewRoute({
      text: "summarize this private CereBro source note",
      mode: "quick",
    });

    expect(quickPreview.modelProposal.modelClass).toBe("local_summary");
    expect(quickPreview.modelProposal.laneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.modelProposal.provider).toBe("Ollama");
    expect(quickPreview.modelProposal.approvalRequired).toBe(false);
    expect(quickPreview.modelProposal.dataLeavingMachine).toBe(false);
    expect(quickPreview.modelProposal.installRequired).toBe(true);
    expect(quickPreview.modelProposal.status).toBe("not_verified_no_install");
    expect(quickPreview.modelProposal.reason).toContain("fast local-first");
    expect(quickPreview.modelProposal.registryRead.mode).toBe("local_registry_read");
    expect(quickPreview.modelProposal.registryRead.laneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.modelProposal.registryRead.routeDefaultsChanged).toBe(false);
    expect(quickPreview.modelProposal.registryRead.noActionTaken.join(" ")).toContain("No provider");
    expect(quickPreview.modelProposal.registryRead.rule).toContain("does not approve");
    expect(quickPreview.workbenchReceiptDraft.modelLane?.laneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.workbenchReceiptDraft.modelLane?.registryRead.mode).toBe("local_registry_read");
    expect(quickPreview.ledgerFocusDraft.auditFilters.modelLaneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.gates.join(" ")).toContain("No Ollama install");

    const buildPreview = await caller.runtime.previewRoute({
      text: "implement the next CereBro frontend build slice",
      mode: "build",
    });

    expect(buildPreview.modelProposal.laneId).toBe("frontier_or_codex_escalation");
    expect(buildPreview.modelProposal.approvalRequired).toBe(true);
    expect(buildPreview.modelProposal.dataLeavingMachine).toBe(true);
    expect(buildPreview.modelProposal.reason).toContain("local lane may not be strong enough");
    expect(buildPreview.modelProposal.registryRead.mode).toBe("local_registry_read");
    expect(buildPreview.modelProposal.registryRead.laneId).toBe("frontier_or_codex_escalation");
    expect(buildPreview.modelProposal.registryRead.routeDefaultsChanged).toBe(false);
    expect(buildPreview.approvalGates).toContain("external model escalation approval");
  });

  it("commits a local route record without running the routed work", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    expect(committed.mode).toBe("local_route_record");
    expect(committed.writesExternal).toBe(false);
    expect(committed.runsCommand).toBe(false);
    expect(committed.opensBrowser).toBe(false);
    expect(committed.callsModel).toBe(false);
    expect(committed.record.id).toBeGreaterThan(0);
    expect(committed.record.executionReadiness).toMatchObject({
      canExecute: false,
      status: "missing_task_record",
      routeRecordId: committed.record.id,
      taskId: null,
      workbenchEvidenceId: null,
    });
    expect(committed.record.executionReadiness.requiredBeforeExecution).toContain("future explicit execution call");
    expect(committed.record.category).toBe("project_build");
    expect(committed.record.ownerAgent).toBe("tony");
    expect(committed.record.projectSlug).toBe("cerebro");
    expect(committed.record.workbenchReceiptDraft.autosave).toBe(false);
    expect(committed.record.ledgerFocusDraft.autosave).toBe(false);
    expect(committed.nextAction).toContain("Workbench receipt");

    expect(await countRows("runtime_route_records")).toBe((rowCountsBefore.get("runtime_route_records") ?? 0) + 1);
    for (const table of previewMutationTables.filter((table) => table !== "runtime_route_records")) {
      expect(await countRows(table)).toBe(rowCountsBefore.get(table));
    }
  });

  it("lists committed route records as parsed Ledger audit reads", async () => {
    const caller = createCaller();

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    const records = await caller.runtime.routeRecords({
      limit: 5,
      projectSlug: "cerebro",
      ownerAgent: "tony",
    });

    expect(records.items[0]?.id).toBe(committed.record.id);
    expect(records.items[0]?.originalText).toBe("keep building CereBro front end");
    expect(records.items[0]?.mode).toBe("build");
    expect(records.items[0]?.category).toBe("project_build");
    expect(records.items[0]?.ownerAgent).toBe("tony");
    expect(records.items[0]?.supportAgents).toContain("spock");
    expect(records.items[0]?.projectSlug).toBe("cerebro");
    expect(records.items[0]?.routeChain[0]).toBe("Aang reads mode");
    expect(records.items[0]?.approvalGates).toContain("No external action from route preview.");
    expect(records.items[0]?.workbenchReceiptDraft.autosave).toBe(false);
    expect(records.items[0]?.ledgerFocusDraft.autosave).toBe(false);
    expect(records.items[0]?.projectFocusDraft).toEqual({
      kind: "route_record_project_focus",
      focusTarget: "project_lab",
      autosave: false,
      projectSlug: "cerebro",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
      projectId: null,
      routeRecordId: committed.record.id,
      focusSummary: `Open Project Lab for route #${committed.record.id}. No project write is saved.`,
    });
    expect(records.items[0]?.taskDraft.agent).toBe("tony");
    expect(records.items[0]?.executionReadiness).toMatchObject({
      canExecute: false,
      status: "missing_task_record",
      routeRecordId: committed.record.id,
      taskId: null,
      workbenchEvidenceId: null,
    });
    expect(records.items[0]?.createdAt).toBeGreaterThan(0);
  });

  it("exposes a read-only Ledger route receipt contract without mutating rows", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const committed = await caller.runtime.commitRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });
    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const evidence = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const approval = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: committed.record.id,
      reason: "Queue gate before any browser work.",
    });
    const db = await getCerebroDb();
    await db.execute({
      sql: `UPDATE approvals SET status = 'approved', decided_at = unixepoch() WHERE id = ?`,
      args: [approval.approval?.id ?? -1],
    });

    const rowCountsAfterSetup = await countPreviewMutationRows();
    const overview = await caller.ledger.overview({
      evidenceLimit: 5,
      routeLimit: 5,
    });

    expect(overview.routeReceiptContract).toMatchObject({
      mode: "read_only",
      ownerAgent: "cortana",
      bodySurface: "workbench",
      auditSurface: "ledger",
      executorStatus: "not_built",
      canExecute: false,
    });
    expect(overview.routeReceiptContract.totalRoutes).toBeGreaterThanOrEqual(1);
    expect(overview.routeReceiptContract.taskLinkedRoutes).toBeGreaterThanOrEqual(1);
    expect(overview.routeReceiptContract.workbenchBodyLinkedRoutes).toBeGreaterThanOrEqual(1);
    expect(overview.routeReceiptContract.approvedGateRoutes).toBeGreaterThanOrEqual(1);
    expect(overview.routeReceiptContract.futureReviewOnlyRoutes).toBeGreaterThanOrEqual(1);
    expect(overview.routeReceiptContract.gates.join(" ")).toContain("Execution remains blocked");
    expect(overview.routeReceiptContract.noActionTaken).toContain("No route was saved from this read.");
    expect(overview.routeReceiptContract.noActionTaken.join(" ")).toContain("No task");
    expect(overview.latestRoutes.find((item) => item.id === committed.record.id)?.taskId).toBe(task.task.id);
    expect(overview.latestRoutes.find((item) => item.id === committed.record.id)?.workbenchEvidence?.id).toBe(evidence.evidence?.id);

    for (const table of previewMutationTables) {
      expect(await countRows(table)).toBe(rowCountsAfterSetup.get(table));
    }
    expect(await countRows("runtime_route_records")).toBe((rowCountsBefore.get("runtime_route_records") ?? 0) + 1);
  });

  it("creates one local task from a committed route record and links it durably", async () => {
    const caller = createCaller();
    const taskCountBefore = await countRows("tasks");
    const evidenceCountBefore = await countRows("workbench_evidence_records");

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    const first = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    expect(first.mode).toBe("local_task_record");
    expect(first.created).toBe(true);
    expect(first.writesExternal).toBe(false);
    expect(first.runsCommand).toBe(false);
    expect(first.opensBrowser).toBe(false);
    expect(first.callsModel).toBe(false);
    expect(first.routeRecordId).toBe(committed.record.id);
    expect(first.task.id).toBeGreaterThan(0);
    expect(first.task.title).toContain("project build");
    expect(first.task.agent).toBe("tony");
    expect(first.task.projectName).toBe("CereBro");
    expect(await countRows("tasks")).toBe(taskCountBefore + 1);
    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore);

    const records = await caller.runtime.routeRecords({
      limit: 1,
      projectSlug: "cerebro",
      ownerAgent: "tony",
    });
    expect(records.items[0]?.id).toBe(committed.record.id);
    expect(records.items[0]?.taskId).toBe(first.task.id);

    const second = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    expect(second.created).toBe(false);
    expect(second.task.id).toBe(first.task.id);
    expect(await countRows("tasks")).toBe(taskCountBefore + 1);
    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore);
  });

  it("stages one local approval preview from a committed route record without running work", async () => {
    const caller = createCaller();
    const approvalCountBefore = await countRows("approvals");
    const preflightCountBefore = await countRows("permission_preflight_records");
    const taskCountBefore = await countRows("tasks");
    const evidenceCountBefore = await countRows("workbench_evidence_records");

    const committed = await caller.runtime.commitRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });

    const first = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: committed.record.id,
      reason: "Need approval before Surfer opens public sources.",
    });

    expect(first.mode).toBe("local_approval_preview");
    expect(first.created).toBe(true);
    expect(first.writesExternal).toBe(false);
    expect(first.runsCommand).toBe(false);
    expect(first.opensBrowser).toBe(false);
    expect(first.callsModel).toBe(false);
    expect(first.routeRecordId).toBe(committed.record.id);
    expect(first.approval?.status).toBe("pending");
    expect(first.approval?.actionType).toBe("runtime_browser_or_media_capture");
    expect(first.approval?.targetType).toBe("runtime_route_record");
    expect(first.approval?.targetId).toBe(committed.record.id);
    expect(first.approval?.requestedByAgent).toBe("surfer");
    expect(first.approval?.permissionPreflightId).toBeGreaterThan(0);
    expect(first.approval?.permissionPreflight?.decision).toBe("approval_required");
    expect(first.approval?.permissionPreflight?.requiredApprovals).toContain("public-browser approval");
    expect(first.gates.join(" ")).toContain("pending local approval record only");

    expect(await countRows("approvals")).toBe(approvalCountBefore + 1);
    expect(await countRows("permission_preflight_records")).toBe(preflightCountBefore + 1);
    expect(await countRows("tasks")).toBe(taskCountBefore);
    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore);

    const second = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: committed.record.id,
      reason: "Do not create a duplicate approval.",
    });

    expect(second.created).toBe(false);
    expect(second.approval?.id).toBe(first.approval?.id);
    expect(await countRows("approvals")).toBe(approvalCountBefore + 1);
    expect(await countRows("permission_preflight_records")).toBe(preflightCountBefore + 1);

    const records = await caller.runtime.routeRecords({
      limit: 1,
      ownerAgent: "surfer",
    });
    expect(records.items[0]?.id).toBe(committed.record.id);
    expect(records.items[0]?.approvalPreview?.id).toBe(first.approval?.id);
    expect(records.items[0]?.approvalPreview?.status).toBe("pending");
    expect(records.items[0]?.approvalPreview?.permissionPreflightId).toBe(first.approval?.permissionPreflightId);

    const runtimeQueue = await caller.approvals.queue({
      status: "pending",
      origin: "runtime",
      limit: 10,
    });
    const queuedRuntimeApproval = runtimeQueue.items.find((item) => item.id === first.approval?.id);
    expect(queuedRuntimeApproval?.origin).toBe("runtime");
    expect(queuedRuntimeApproval?.targetLabel).toBe(`runtime_route:${committed.record.id}`);
    expect(queuedRuntimeApproval?.projectName).toBeNull();

    const runtimeDetail = await caller.approvals.detail({ id: first.approval?.id ?? -1 });
    expect(runtimeDetail.approval?.origin).toBe("runtime");
    expect(runtimeDetail.approval?.targetLabel).toBe(`runtime_route:${committed.record.id}`);

    const db = await getCerebroDb();
    await db.execute({
      sql: `UPDATE approvals SET status = 'approved', decided_at = unixepoch() WHERE id = ?`,
      args: [first.approval?.id ?? -1],
    });
    const decidedRecords = await caller.runtime.routeRecords({
      limit: 1,
      ownerAgent: "surfer",
    });
    expect(decidedRecords.items[0]?.id).toBe(committed.record.id);
    expect(decidedRecords.items[0]?.approvalPreview?.id).toBe(first.approval?.id);
    expect(decidedRecords.items[0]?.approvalPreview?.status).toBe("approved");
    expect(decidedRecords.items[0]?.approvalPreview?.decidedAt).toBeGreaterThan(0);

    const decidedOverview = await caller.ledger.overview({
      evidenceLimit: 5,
      routeLimit: 1,
    });
    expect(decidedOverview.latestRoutes[0]?.id).toBe(committed.record.id);
    expect(decidedOverview.latestRoutes[0]?.approvalPreview?.id).toBe(first.approval?.id);
    expect(decidedOverview.latestRoutes[0]?.approvalPreview?.status).toBe("approved");
  });

  it("computes execution readiness without creating an executor", async () => {
    const caller = createCaller();
    const committed = await caller.runtime.commitRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });

    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const evidence = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const approval = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: committed.record.id,
      reason: "Queue gate before any browser work.",
    });

    const pendingRecords = await caller.runtime.routeRecords({
      limit: 1,
      ownerAgent: "surfer",
    });
    expect(pendingRecords.items[0]?.executionReadiness).toMatchObject({
      canExecute: false,
      status: "approval_pending",
      routeRecordId: committed.record.id,
      taskId: task.task.id,
      approvalId: approval.approval?.id,
      approvalStatus: "pending",
      workbenchEvidenceId: evidence.evidence?.id,
      readyForFutureExecutorReview: false,
    });
    expect(pendingRecords.items[0]?.executionReadiness.noActionTaken).toContain("No browser opened.");

    const db = await getCerebroDb();
    await db.execute({
      sql: `UPDATE approvals SET status = 'approved', decided_at = unixepoch() WHERE id = ?`,
      args: [approval.approval?.id ?? -1],
    });

    const approvedRecords = await caller.runtime.routeRecords({
      limit: 1,
      ownerAgent: "surfer",
    });
    const approvedOverview = await caller.ledger.overview({
      evidenceLimit: 5,
      routeLimit: 1,
    });
    expect(approvedRecords.items[0]?.executionReadiness).toMatchObject({
      canExecute: false,
      status: "ready_for_explicit_execution_call",
      routeRecordId: committed.record.id,
      taskId: task.task.id,
      approvalId: approval.approval?.id,
      approvalStatus: "approved",
      workbenchEvidenceId: evidence.evidence?.id,
      readyForFutureExecutorReview: true,
    });
    expect(approvedRecords.items[0]?.executionReadiness.requiredBeforeExecution).toContain(
      "future explicit execution call",
    );
    expect(approvedOverview.latestRoutes[0]?.id).toBe(committed.record.id);
    expect(approvedOverview.latestRoutes[0]?.executionReadiness).toMatchObject({
      canExecute: false,
      status: "ready_for_explicit_execution_call",
      routeRecordId: committed.record.id,
      taskId: task.task.id,
      approvalId: approval.approval?.id,
      approvalStatus: "approved",
      workbenchEvidenceId: evidence.evidence?.id,
    });
  });

  it("reads one route receipt audit without mutating local records", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const committed = await caller.runtime.commitRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });
    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const evidence = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const approval = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: committed.record.id,
      reason: "Queue gate before any browser work.",
    });
    const db = await getCerebroDb();
    await db.execute({
      sql: `UPDATE approvals SET status = 'approved', decided_at = unixepoch() WHERE id = ?`,
      args: [approval.approval?.id ?? -1],
    });

    const rowCountsAfterSetup = await countPreviewMutationRows();
    const audit = await caller.runtime.routeReceiptAudit({
      routeRecordId: committed.record.id,
    });

    expect(audit).toMatchObject({
      mode: "read_only",
      routeRecordId: committed.record.id,
      ownerAgent: "surfer",
      bodySurface: "workbench",
      auditSurface: "ledger",
      executorStatus: "not_built",
      canExecute: false,
    });
    expect(audit.route.id).toBe(committed.record.id);
    expect(audit.route.taskId).toBe(task.task.id);
    expect(audit.route.workbenchEvidence?.id).toBe(evidence.evidence?.id);
    expect(audit.route.approvalPreview?.id).toBe(approval.approval?.id);
    expect(audit.proof).toMatchObject({
      hasTask: true,
      hasWorkbenchBody: true,
      hasApprovalPreview: true,
      approvalStatus: "approved",
      readyForFutureExecutorReview: true,
      executionStatus: "ready_for_explicit_execution_call",
    });
    expect(audit.gates.join(" ")).toContain("Execution remains blocked");
    expect(audit.noActionTaken).toContain("No command ran.");
    expect(audit.noActionTaken.join(" ")).toContain("No task");

    for (const table of previewMutationTables) {
      expect(await countRows(table)).toBe(rowCountsAfterSetup.get(table));
    }
    expect(await countRows("runtime_route_records")).toBe((rowCountsBefore.get("runtime_route_records") ?? 0) + 1);
  });

  it("includes linked Vision proof in route receipt audit without mutating records", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const committed = await caller.runtime.commitRoute({
      text: "build route audit Vision proof for CereBro",
      mode: "build",
    });
    const vision = await caller.visions.createFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    const rowCountsAfterSetup = await countPreviewMutationRows();
    const audit = await caller.runtime.routeReceiptAudit({
      routeRecordId: committed.record.id,
    });

    expect(audit.linkedVision).toMatchObject({
      id: vision.vision.id,
      status: "active",
      ownerAgent: "tony",
      taskId: task.task.id,
    });
    expect(audit.proof.hasLinkedVision).toBe(true);
    expect(audit.proof.visionStatus).toBe("active");
    expect(audit.proof.visionTaskId).toBe(task.task.id);

    for (const table of previewMutationTables) {
      expect(await countRows(table)).toBe(rowCountsAfterSetup.get(table));
    }
    expect(await countRows("runtime_route_records")).toBe((rowCountsBefore.get("runtime_route_records") ?? 0) + 1);
  });

  it("shows linked Vision context on Ledger route rows without mutating records", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const committed = await caller.runtime.commitRoute({
      text: "build Ledger route Vision readback for CereBro",
      mode: "build",
    });
    const vision = await caller.visions.createFromRouteRecord({
      routeRecordId: committed.record.id,
    });
    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    const rowCountsAfterSetup = await countPreviewMutationRows();
    const overview = await caller.ledger.overview({
      evidenceLimit: 5,
      routeLimit: 5,
    });
    const route = overview.latestRoutes.find((item) => item.id === committed.record.id);

    expect(route?.linkedVision).toMatchObject({
      id: vision.vision.id,
      status: "active",
      ownerAgent: "tony",
      taskId: task.task.id,
    });
    expect(route?.linkedVision?.title).toContain(`route #${committed.record.id}`);
    expect(route?.linkedVision?.stopRule).toContain("Stop when the route");

    for (const table of previewMutationTables) {
      expect(await countRows(table)).toBe(rowCountsAfterSetup.get(table));
    }
    expect(await countRows("runtime_route_records")).toBe((rowCountsBefore.get("runtime_route_records") ?? 0) + 1);
  });

  it("saves one local Workbench receipt from a committed route record and exposes the link", async () => {
    const caller = createCaller();
    const evidenceCountBefore = await countRows("workbench_evidence_records");
    const preflightCountBefore = await countRows("permission_preflight_records");
    const taskCountBefore = await countRows("tasks");
    const approvalCountBefore = await countRows("approvals");

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    const first = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    expect(first.mode).toBe("local_workbench_receipt");
    expect(first.created).toBe(true);
    expect(first.writesExternal).toBe(false);
    expect(first.runsCommand).toBe(false);
    expect(first.opensBrowser).toBe(false);
    expect(first.callsModel).toBe(false);
    expect(first.routeRecordId).toBe(committed.record.id);
    expect(first.evidence?.id).toBeGreaterThan(0);
    expect(first.evidence?.kind).toBe("manual_note");
    expect(first.evidence?.targetUri).toBe(`runtime_route:${committed.record.id}`);
    expect(first.evidence?.ownerAgent).toBe("tony");
    expect(first.evidence?.routeAgent).toBe("cortana");
    expect(first.evidence?.projectName).toBe("CereBro");
    expect(first.evidence?.permissionPreflightId).toBeGreaterThan(0);
    expect(first.gates.join(" ")).toContain("local Workbench receipt");

    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore + 1);
    expect(await countRows("permission_preflight_records")).toBe(preflightCountBefore + 1);
    expect(await countRows("tasks")).toBe(taskCountBefore);
    expect(await countRows("approvals")).toBe(approvalCountBefore);

    const second = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    expect(second.created).toBe(false);
    expect(second.evidence?.id).toBe(first.evidence?.id);
    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore + 1);
    expect(await countRows("permission_preflight_records")).toBe(preflightCountBefore + 1);

    const records = await caller.runtime.routeRecords({
      limit: 1,
      projectSlug: "cerebro",
      ownerAgent: "tony",
    });
    expect(records.items[0]?.id).toBe(committed.record.id);
    expect(records.items[0]?.workbenchEvidence?.id).toBe(first.evidence?.id);
    expect(records.items[0]?.workbenchEvidence?.targetUri).toBe(`runtime_route:${committed.record.id}`);
  });

  it("keeps duplicate route child creation to one approval and one Workbench receipt", async () => {
    const caller = createCaller();

    const committed = await caller.runtime.commitRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });

    const [firstApproval, secondApproval] = await Promise.all([
      caller.runtime.createApprovalPreviewFromRouteRecord({
        routeRecordId: committed.record.id,
        reason: "Queue the route gate once.",
      }),
      caller.runtime.createApprovalPreviewFromRouteRecord({
        routeRecordId: committed.record.id,
        reason: "Do not duplicate the route gate.",
      }),
    ]);

    expect(firstApproval.approval?.id).toBeGreaterThan(0);
    expect(secondApproval.approval?.id).toBe(firstApproval.approval?.id);
    expect(
      await countRowsWhere(
        "SELECT COUNT(*) AS count FROM approvals WHERE target_type = 'runtime_route_record' AND target_id = ? AND status = 'pending'",
        [committed.record.id],
      ),
    ).toBe(1);

    const [firstEvidence, secondEvidence] = await Promise.all([
      caller.runtime.createWorkbenchReceiptFromRouteRecord({
        routeRecordId: committed.record.id,
      }),
      caller.runtime.createWorkbenchReceiptFromRouteRecord({
        routeRecordId: committed.record.id,
      }),
    ]);

    expect(firstEvidence.evidence?.id).toBeGreaterThan(0);
    expect(secondEvidence.evidence?.id).toBe(firstEvidence.evidence?.id);
    expect(
      await countRowsWhere(
        "SELECT COUNT(*) AS count FROM workbench_evidence_records WHERE target_uri = ?",
        [`runtime_route:${committed.record.id}`],
      ),
    ).toBe(1);
  });

  it("backfills route task links into existing approval previews and Workbench receipts", async () => {
    const caller = createCaller();
    const taskCountBefore = await countRows("tasks");
    const evidenceCountBefore = await countRows("workbench_evidence_records");
    const approvalCountBefore = await countRows("approvals");

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    const approval = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: committed.record.id,
      reason: "Queue gate before task exists.",
    });
    const evidence = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    expect(approval.approval?.taskId).toBeNull();
    expect(evidence.evidence?.taskId).toBeNull();

    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    expect(task.created).toBe(true);
    expect(await countRows("tasks")).toBe(taskCountBefore + 1);
    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore + 1);
    expect(await countRows("approvals")).toBe(approvalCountBefore + 1);

    const records = await caller.runtime.routeRecords({
      limit: 1,
      projectSlug: "cerebro",
      ownerAgent: "tony",
    });
    expect(records.items[0]?.id).toBe(committed.record.id);
    expect(records.items[0]?.taskId).toBe(task.task.id);
    expect(records.items[0]?.approvalPreview?.id).toBe(approval.approval?.id);
    expect(records.items[0]?.approvalPreview?.taskId).toBe(task.task.id);
    expect(records.items[0]?.workbenchEvidence?.id).toBe(evidence.evidence?.id);
    expect(records.items[0]?.workbenchEvidence?.taskId).toBe(task.task.id);

    const overview = await caller.ledger.overview({
      evidenceLimit: 5,
      routeLimit: 1,
    });
    expect(overview.latestRoutes[0]?.id).toBe(committed.record.id);
    expect(overview.latestRoutes[0]?.workbenchEvidence?.taskId).toBe(task.task.id);

    const secondCommitted = await caller.runtime.commitRoute({
      text: "continue CereBro route contract build work",
      mode: "build",
    });
    const secondEvidence = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: secondCommitted.record.id,
    });
    const secondApproval = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: secondCommitted.record.id,
      reason: "Queue gate after receipt but before task exists.",
    });
    const secondTask = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: secondCommitted.record.id,
    });
    const secondRecords = await caller.runtime.routeRecords({
      limit: 1,
      projectSlug: "cerebro",
      ownerAgent: "tony",
    });

    expect(secondEvidence.evidence?.taskId).toBeNull();
    expect(secondApproval.approval?.taskId).toBeNull();
    expect(secondRecords.items[0]?.id).toBe(secondCommitted.record.id);
    expect(secondRecords.items[0]?.taskId).toBe(secondTask.task.id);
    expect(secondRecords.items[0]?.approvalPreview?.taskId).toBe(secondTask.task.id);
    expect(secondRecords.items[0]?.workbenchEvidence?.taskId).toBe(secondTask.task.id);
  });

  it("links manual Workbench saves back to the runtime route target", async () => {
    const caller = createCaller();
    const committed = await caller.runtime.commitRoute({
      text: "save manual Workbench receipt for this route",
      mode: "build",
    });
    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: committed.record.id,
    });

    const manual = await caller.workbench.createEvidence({
      kind: "manual_note",
      title: "Manual route body",
      summary: "Human-edited receipt body saved from the Workbench draft.",
      targetUri: `runtime_route:${committed.record.id}`,
      ownerAgent: "tony",
      routeAgent: "cortana",
      permissionClass: "manual_note",
    });

    expect(manual.ok).toBe(true);
    expect(manual.evidence.targetUri).toBe(`runtime_route:${committed.record.id}`);
    expect(manual.evidence.projectName).toBe("CereBro");
    expect(manual.evidence.taskId).toBe(task.task.id);
    expect(manual.evidence.permissionPreflightId).toBeGreaterThan(0);

    const records = await caller.runtime.routeRecords({
      limit: 10,
      projectSlug: "cerebro",
      ownerAgent: committed.record.ownerAgent,
    });
    const routeRecord = records.items.find((item) => item.id === committed.record.id);
    expect(routeRecord?.workbenchEvidence?.id).toBe(manual.evidence.id);
    expect(routeRecord?.workbenchEvidence?.taskId).toBe(task.task.id);

    const overview = await caller.ledger.overview({
      evidenceLimit: 5,
      routeLimit: 10,
    });
    const overviewRoute = overview.latestRoutes.find((item) => item.id === committed.record.id);
    expect(overviewRoute?.workbenchEvidence?.id).toBe(manual.evidence.id);
    expect(overviewRoute?.workbenchEvidence?.taskId).toBe(task.task.id);
  });
});
