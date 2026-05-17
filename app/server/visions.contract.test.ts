import { describe, expect, it } from "vitest";
import { getCerebroDb } from "./cerebroDb";
import { appRouter } from "./routers";

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

describe("visions contract", () => {
  it("creates a Vision contract and optional first task without executing work", async () => {
    const caller = createCaller();
    const stamp = Date.now();
    const before = {
      tasks: await countRows("tasks"),
      approvals: await countRows("approvals"),
      evidence: await countRows("workbench_evidence_records"),
      executionResults: await countRows("execution_action_results"),
      routeRecords: await countRows("runtime_route_records"),
    };

    const vision = await caller.visions.create({
      title: `Vision contract ${stamp}`,
      intent: "Keep the current build pass pointed at the same outcome.",
      successCriteria: "Schema, router, Keep readback, Ledger readback, and checks are present.",
      stopRule: "Stop when the contract exists and no executor loop has been added.",
      ownerAgent: "aang",
      createTask: true,
      taskTitle: `First Vision task ${stamp}`,
      riskNote: "Contract layer only.",
    });

    expect(vision.wouldExecute).toBe(false);
    expect(vision.opensBrowser).toBe(false);
    expect(vision.callsProvider).toBe(false);
    expect(vision.writesExternal).toBe(false);
    expect(vision.vision.status).toBe("active");
    expect(vision.vision.title).toContain("Vision contract");
    expect(vision.vision.taskId).toBeTypeOf("number");

    expect(await countRows("tasks")).toBe(before.tasks + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.evidence);
    expect(await countRows("execution_action_results")).toBe(before.executionResults);
    expect(await countRows("runtime_route_records")).toBe(before.routeRecords);
  });

  it("updates Vision state and rejects unknown states", async () => {
    const caller = createCaller();
    const vision = await caller.visions.create({
      title: `Vision status ${Date.now()}`,
      intent: "Exercise state transitions.",
      successCriteria: "Paused and achieved read back.",
      stopRule: "Stop after transition proof.",
    });

    const paused = await caller.visions.setStatus({
      id: vision.vision.id,
      status: "paused",
      statusNote: "Waiting on user review.",
    });
    expect(paused.vision.status).toBe("paused");
    expect(paused.vision.statusNote).toBe("Waiting on user review.");
    expect(paused.vision.completedAt).toBeNull();

    const achieved = await caller.visions.setStatus({
      id: vision.vision.id,
      status: "achieved",
      statusNote: "Contract proved.",
    });
    expect(achieved.vision.status).toBe("achieved");
    expect(achieved.vision.completedAt).toBeTypeOf("number");

    await expect(
      caller.visions.setStatus({
        id: vision.vision.id,
        status: "done" as never,
      }),
    ).rejects.toThrow();
  });

  it("reads Vision details with route, Workbench, approval, and execution receipt summaries", async () => {
    const caller = createCaller();
    const stamp = Date.now();
    const task = await caller.tasks.create({
      title: `Vision detail task ${stamp}`,
      agent: "tony",
    });
    const route = await caller.runtime.commitRoute({
      text: `Build Vision detail receipt ${stamp}`,
      mode: "build",
    });
    const evidence = await caller.workbench.createEvidence({
      kind: "manual_note",
      title: `Vision Workbench body ${stamp}`,
      summary: "Workbench body linked to the Vision route.",
      targetUri: `runtime_route:${route.record.id}`,
      taskId: task.id,
      ownerAgent: "cortana",
      routeAgent: "cortana",
      permissionClass: "manual_note",
    });
    const approval = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: route.record.id,
      reason: "Vision detail gate readback.",
    });

    const vision = await caller.visions.create({
      title: `Vision detail ${stamp}`,
      intent: "Read linked receipt context.",
      successCriteria: "Detail includes existing linked rows.",
      stopRule: "Stop after readback.",
      taskId: task.id,
      routeRecordId: route.record.id,
      ownerAgent: "cortana",
    });

    const detail = await caller.visions.detail({ id: vision.vision.id });
    expect(detail.vision.id).toBe(vision.vision.id);
    expect(detail.task?.id).toBe(task.id);
    expect(detail.route?.id).toBe(route.record.id);
    expect(detail.workbenchEvidence?.id).toBe(evidence.evidence.id);
    expect(detail.approval?.id).toBe(approval.approval?.id);
    expect(detail.executionResults).toEqual([]);
    expect(detail.receiptTrail.join(" ")).toContain("Task");
    expect(detail.receiptTrail.join(" ")).toContain("Cortana route");
    expect(detail.receiptTrail.join(" ")).toContain("Workbench body");
    expect(detail.receiptTrail.join(" ")).toContain("Approval");
  });

  it("creates one Vision from a saved Aang route receipt and returns the existing link on repeat", async () => {
    const caller = createCaller();
    const stamp = Date.now();
    const route = await caller.runtime.commitRoute({
      text: `Build route-linked Vision ${stamp} for CereBro`,
      mode: "build",
    });

    const first = await caller.visions.createFromRouteRecord({
      routeRecordId: route.record.id,
    });

    expect(first.created).toBe(true);
    expect(first.wouldExecute).toBe(false);
    expect(first.opensBrowser).toBe(false);
    expect(first.callsProvider).toBe(false);
    expect(first.writesExternal).toBe(false);
    expect(first.vision.routeRecordId).toBe(route.record.id);
    expect(first.vision.projectId).toBeTypeOf("number");
    expect(first.vision.intent).toContain("build request");

    const second = await caller.visions.createFromRouteRecord({
      routeRecordId: route.record.id,
    });

    expect(second.created).toBe(false);
    expect(second.vision.id).toBe(first.vision.id);

    const detail = await caller.visions.detail({ id: first.vision.id });
    expect(detail.route?.id).toBe(route.record.id);
    expect(detail.receiptTrail.join(" ")).toContain("Cortana route");
  });

  it("links a route-created Vision when route task, body, and gate records are added later", async () => {
    const caller = createCaller();
    const stamp = Date.now();
    const route = await caller.runtime.commitRoute({
      text: `Build linked Vision trail ${stamp} for CereBro`,
      mode: "build",
    });
    const vision = await caller.visions.createFromRouteRecord({
      routeRecordId: route.record.id,
    });
    expect(vision.vision.taskId).toBeNull();

    const task = await caller.runtime.createTaskFromRouteRecord({
      routeRecordId: route.record.id,
    });
    const body = await caller.runtime.createWorkbenchReceiptFromRouteRecord({
      routeRecordId: route.record.id,
    });
    const gate = await caller.runtime.createApprovalPreviewFromRouteRecord({
      routeRecordId: route.record.id,
      reason: "Vision linked trail gate.",
    });

    expect(task.task?.id).toBeTypeOf("number");
    expect(body.evidence?.id).toBeTypeOf("number");
    expect(gate.approval?.id).toBeTypeOf("number");

    const detail = await caller.visions.detail({ id: vision.vision.id });
    expect(detail.vision.taskId).toBe(task.task?.id);
    expect(detail.task?.id).toBe(task.task?.id);
    expect(detail.route?.id).toBe(route.record.id);
    expect(detail.workbenchEvidence?.id).toBe(body.evidence?.id);
    expect(detail.approval?.id).toBe(gate.approval?.id);
    expect(detail.receiptTrail.join(" ")).toContain("Task");
    expect(detail.receiptTrail.join(" ")).toContain("Workbench body");
    expect(detail.receiptTrail.join(" ")).toContain("Approval");
  });

  it("keeps Vision out of standalone Ledger collection readback", async () => {
    const caller = createCaller();
    const stamp = Date.now();
    const before = {
      approvals: await countRows("approvals"),
      evidence: await countRows("workbench_evidence_records"),
      executionResults: await countRows("execution_action_results"),
    };
    const vision = await caller.visions.create({
      title: `Ledger Vision ${stamp}`,
      intent: "Make Visions visible in Ledger.",
      successCriteria: "Ledger shows Vision count and latest row.",
      stopRule: "Stop after readback.",
      ownerAgent: "aang",
    });

    const ledger = await caller.ledger.overview({ evidenceLimit: 5, routeLimit: 3 });

    expect("visions" in ledger.cards).toBe(false);
    expect("latestVisions" in ledger).toBe(false);

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.evidence);
    expect(await countRows("execution_action_results")).toBe(before.executionResults);
  });
});
