import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

describe("execution action contract", () => {
  it("keeps command execution blocked until the local contract is complete, then stops at the unwired runner", async () => {
    const caller = createCaller();
    const task = await caller.tasks.create({
      title: "Execution contract test task",
      agent: "tony",
    });
    const preview = await caller.terminalLab.previewCommand({
      command: "pwd",
      cwd: "/Users/lindsaybell/Desktop/CereBro",
      taskId: task.id,
    });

    const incomplete = await caller.execution.proposeFromCommandObservation({
      observationId: preview.observationId,
    });
    expect(incomplete.wouldExecute).toBe(false);
    expect(incomplete.proposal?.readiness.canExecute).toBe(false);
    expect(incomplete.proposal?.readiness.missing).toContain("Workbench receipt body");
    expect(incomplete.proposal?.readiness.missing).toContain("approval receipt");

    const blockedRun = await caller.execution.runApprovedAction({
      proposalId: incomplete.proposal?.id ?? -1,
      approved: true,
    });
    expect(blockedRun.ok).toBe(false);
    expect(blockedRun.wouldExecute).toBe(false);
    expect(blockedRun.resultState).toBe("blocked_before_runner");

    const approvalPreview = await caller.terminalLab.createApprovalPreviewFromObservation({
      observationId: preview.observationId,
      reason: "Test approval preview only.",
    });
    const approvalId = approvalPreview.approval?.id ?? -1;
    const approvalReceipt = await caller.approvals.decide({
      id: approvalId,
      decision: "approved",
      reason: "Test approval receipt.",
    });
    expect(approvalReceipt.wouldExecute).toBe(false);
    expect(approvalReceipt.receipt.status).toBe("approved");
    expect(approvalReceipt.receipt.note).toContain("separate approved action contract");

    const evidence = await caller.workbench.createEvidence({
      kind: "terminal_output",
      title: "Execution contract terminal receipt",
      summary: "Local terminal receipt body for the approved action contract.",
      targetUri: `terminal_lab:observation:${preview.observationId}`,
      taskId: task.id,
      commandObservationId: preview.observationId,
      ownerAgent: "tony",
      routeAgent: "tony",
      permissionClass: "manual_note",
    });
    expect(evidence.opensBrowser).toBe(false);
    expect(evidence.capturesMedia).toBe(false);

    const ready = await caller.execution.proposeFromCommandObservation({
      observationId: preview.observationId,
      approvalId,
      workbenchEvidenceId: evidence.evidence.id,
    });
    expect(ready.proposal?.approvalStatus).toBe("approved");
    expect(ready.proposal?.readiness.canExecute).toBe(true);

    const runnerGuard = await caller.execution.runApprovedAction({
      proposalId: ready.proposal?.id ?? -1,
      approved: true,
    });
    expect(runnerGuard.ok).toBe(false);
    expect(runnerGuard.wouldExecute).toBe(false);
    expect(runnerGuard.writesExternal).toBe(false);
    expect(runnerGuard.resultState).toBe("contract_ready_no_runner");
    expect(runnerGuard.reason).toContain("shell runner adapter is not installed");
  });

  it("does not allow approval receipts to be decided twice", async () => {
    const caller = createCaller();
    const preview = await caller.terminalLab.previewCommand({
      command: "rg -n CereBro AGENTS.md",
      cwd: "/Users/lindsaybell/Desktop/CereBro",
    });
    const approvalPreview = await caller.terminalLab.createApprovalPreviewFromObservation({
      observationId: preview.observationId,
    });
    const approvalId = approvalPreview.approval?.id ?? -1;
    await caller.approvals.decide({ id: approvalId, decision: "rejected" });
    await expect(caller.approvals.decide({ id: approvalId, decision: "approved" })).rejects.toThrow("Only pending approvals can be decided.");
  });
});
