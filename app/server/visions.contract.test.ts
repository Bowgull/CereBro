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

  it("adds Vision counts and latest Vision rows to Ledger without side effects", async () => {
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

    expect(ledger.cards.visions.total).toBeGreaterThan(0);
    expect(ledger.cards.visions.active).toBeGreaterThan(0);
    expect(ledger.latestVisions.map((item) => item.id)).toContain(vision.vision.id);
    expect(ledger.latestVisions.find((item) => item.id === vision.vision.id)?.title).toContain("Ledger Vision");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.evidence);
    expect(await countRows("execution_action_results")).toBe(before.executionResults);
  });
});
