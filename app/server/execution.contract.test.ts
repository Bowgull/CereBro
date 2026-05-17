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
  it("keeps command execution blocked until the local contract is complete, then runs one approved read-only command", async () => {
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
    expect(runnerGuard.ok).toBe(true);
    expect(runnerGuard.wouldExecute).toBe(true);
    expect(runnerGuard.writesExternal).toBe(false);
    expect(runnerGuard.resultState).toBe("completed");
    expect(runnerGuard.exitCode).toBe(0);
    expect(runnerGuard.stdoutSummary).toContain("/Users/lindsaybell/Desktop/CereBro");
    expect(runnerGuard.gates.join(" ")).toContain("Shell was disabled");

    const results = await caller.execution.results({
      proposalId: ready.proposal?.id ?? -1,
      limit: 5,
    });
    expect(results.writesExternal).toBe(false);
    expect(results.items[0]?.status).toBe("completed");
    expect(results.items[0]?.receiptBody).toContain(`action proposal #${ready.proposal?.id}`);
    expect(results.items[0]?.recoveryNote).toBe("No recovery needed for a read-only command.");
    expect(results.items[0]?.workbenchEvidenceId).toBe(evidence.evidence.id);
    expect(results.items[0]?.proposalSourceType).toBe("command_observation");
    expect(results.items[0]?.proposalSourceId).toBe(preview.observationId);

    const workbenchDetail = await caller.workbench.evidenceDetail({
      id: evidence.evidence.id,
    });
    expect(workbenchDetail.found).toBe(true);
    if (workbenchDetail.found) {
      expect(workbenchDetail.executionResult?.id).toBe(runnerGuard.resultId);
      expect(workbenchDetail.executionResult?.status).toBe("completed");
      expect(workbenchDetail.executionResult?.exitCode).toBe(0);
      expect(workbenchDetail.executionResult?.riskClass).toBe("read_only");
      expect(workbenchDetail.executionResult?.recoveryNote).toBe("No recovery needed for a read-only command.");
    }

    const workbenchList = await caller.workbench.evidence({
      kind: "terminal_output",
      limit: 20,
    });
    const listedBody = workbenchList.items.find((item) => item.id === evidence.evidence.id);
    expect(listedBody?.executionResultId).toBe(runnerGuard.resultId);
    expect(listedBody?.executionResultStatus).toBe("completed");
    expect(listedBody?.executionResultExitCode).toBe(0);
    const executionLinkedWorkbenchList = await caller.workbench.evidence({
      kind: "terminal_output",
      executionLinked: true,
      limit: 20,
    });
    expect(executionLinkedWorkbenchList.items.map((item) => item.id)).toContain(evidence.evidence.id);
    expect(executionLinkedWorkbenchList.items.every((item) => item.executionResultId != null)).toBe(true);

    const ledger = await caller.ledger.overview({ evidenceLimit: 10 });
    expect(ledger.cards.execution.total).toBeGreaterThan(0);
    expect(ledger.latestExecutionResults.map((item) => item.id)).toContain(runnerGuard.resultId);
    const ledgerResult = ledger.latestExecutionResults.find((item) => item.id === runnerGuard.resultId);
    expect(ledgerResult?.command).toBe("pwd");
    expect(ledgerResult?.approvalId).toBe(approvalId);
    expect(ledgerResult?.riskClass).toBe("read_only");
    expect(ledgerResult?.actionType).toBe("local_read_only_command");
    expect(ledgerResult?.taskId).toBe(task.id);
    expect(ledgerResult?.workbenchEvidenceId).toBe(evidence.evidence.id);
    expect(ledgerResult?.recoveryNote).toBe("No recovery needed for a read-only command.");
  });

  it("blocks approved contracts that are not read-only allowlisted commands", async () => {
    const caller = createCaller();
    const task = await caller.tasks.create({
      title: "Execution mutating contract test task",
      agent: "tony",
    });
    const preview = await caller.terminalLab.previewCommand({
      command: "rm -rf app/client/public/sprites",
      cwd: "/Users/lindsaybell/Desktop/CereBro",
      taskId: task.id,
    });
    const approvalPreview = await caller.terminalLab.createApprovalPreviewFromObservation({
      observationId: preview.observationId,
    });
    const approvalId = approvalPreview.approval?.id ?? -1;
    await caller.approvals.decide({ id: approvalId, decision: "approved" });
    const evidence = await caller.workbench.createEvidence({
      kind: "terminal_output",
      title: "Blocked destructive command receipt",
      summary: "Receipt body exists so the runner policy is the deciding gate.",
      targetUri: `terminal_lab:observation:${preview.observationId}`,
      taskId: task.id,
      commandObservationId: preview.observationId,
      ownerAgent: "tony",
      routeAgent: "tony",
      permissionClass: "manual_note",
    });
    const proposal = await caller.execution.proposeFromCommandObservation({
      observationId: preview.observationId,
      approvalId,
      workbenchEvidenceId: evidence.evidence.id,
    });
    expect(proposal.proposal?.readiness.canExecute).toBe(true);

    const blocked = await caller.execution.runApprovedAction({
      proposalId: proposal.proposal?.id ?? -1,
      approved: true,
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.wouldExecute).toBe(false);
    expect(blocked.resultState).toBe("blocked_by_runner_policy");
    expect(blocked.reason).toContain("Only approved read-only command contracts");
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

  it("routes git-write terminal previews toward Project Lab push context", async () => {
    const caller = createCaller();
    const preview = await caller.terminalLab.previewCommand({
      command: "git push",
      cwd: "/Users/lindsaybell/Desktop/CereBro",
    });
    expect(preview.wouldExecute).toBe(false);
    expect(preview.risk).toBe("mutating_or_external");
    expect(preview.gitWrite).toBe(true);
    expect(preview.projectLabRouteRecommended).toBe(true);
    expect(preview.projectLabRouteReason).toContain("Project Lab push context");
    expect(preview.gates.join(" ")).toContain("Git write commands route to Project Lab push context");
    expect(preview.projectId).toBeGreaterThan(0);

    const ledger = await caller.ledger.overview({ evidenceLimit: 10 });
    const gitWritePreview = ledger.latestGitWriteObservations.find((item) => item.id === preview.observationId);
    expect(gitWritePreview?.command).toBe("git push");
    expect(gitWritePreview?.risk).toBe("mutating_or_external");
    expect(gitWritePreview?.projectName).toBe("CereBro");
    expect(gitWritePreview?.gates.join(" ")).toContain("Project Lab push context");
    expect(ledger.cards.gitWrites.terminalPreviews).toBeGreaterThan(0);
  });

  it("creates a Project Lab push contract but keeps git remote writes blocked", async () => {
    const caller = createCaller();
    const first = await caller.projectIntelligence.createPushActionContract({
      slug: "cerebro",
    });
    expect(first.ok).toBe(true);
    expect(first.wouldExecute).toBe(false);
    expect(first.gates.join(" ")).toContain("did not stage, commit, push");

    const firstRun = await caller.execution.runApprovedAction({
      proposalId: first.proposalId,
      approved: true,
    });
    expect(firstRun.ok).toBe(false);
    expect(firstRun.wouldExecute).toBe(false);
    expect(["blocked_before_runner", "blocked_by_runner_policy"]).toContain(firstRun.resultState);
    expect(firstRun.reason).toMatch(/Workbench receipt body|Only approved read-only command contracts/);

    const evidence = await caller.workbench.createEvidence({
      kind: "validation_note",
      title: "Project push contract body",
      summary: "Project Lab push readiness was reviewed before any git write action.",
      targetUri: "project_lab:push:cerebro",
      projectId: first.projectId,
      taskId: first.taskId,
      ownerAgent: "spock",
      routeAgent: "tony",
      permissionClass: "manual_note",
    });
    const ready = await caller.projectIntelligence.createPushActionContract({
      slug: "cerebro",
      workbenchEvidenceId: evidence.evidence.id,
    });
    expect(ready.proposalId).toBe(first.proposalId);
    expect(ready.reusedExisting).toBe(true);
    if (ready.contract?.approvalStatus === "pending" && ready.approvalId != null) {
      await caller.approvals.decide({
        id: ready.approvalId,
        decision: "approved",
        reason: "Test approval for push contract shape only.",
      });
    }

    const proposals = await caller.execution.proposals({
      sourceType: "project_push",
      sourceId: ready.projectId,
      limit: 5,
    });
    const proposal = proposals.items.find((item) => item.id === ready.proposalId);
    expect(proposal?.actionType).toBe("project_manual_push");
    expect(proposal?.riskClass).toBe("git_remote_write");
    expect(proposal?.readiness.canExecute).toBe(true);

    const approvalStatus = ready.contract?.approvalStatus === "approved" ? "approved" : "pending";
    const projectApprovals = await caller.approvals.queue({
      origin: "project_lab",
      status: approvalStatus,
      query: "project_manual_push",
      limit: 20,
    });
    expect(projectApprovals.mode).toBe("compact_read_only");
    expect(projectApprovals.writesExternal).toBe(false);
    expect(projectApprovals.wouldApprove).toBe(false);
    expect(projectApprovals.summary.projectLab).toBeGreaterThan(0);
    expect(projectApprovals.summary.gitRemoteWrite).toBeGreaterThan(0);
    const queuedPushApproval = projectApprovals.items.find((item) => item.id === ready.approvalId);
    expect(queuedPushApproval?.origin).toBe("project_lab");
    expect(queuedPushApproval?.projectName).toBe("CereBro");
    expect(queuedPushApproval?.targetLabel).toBe("CereBro");
    expect(queuedPushApproval?.costRisk).toBe("git_remote_write");

    const projectApprovalGroups = await caller.approvals.groups({
      groupBy: "risk",
      origin: "project_lab",
      status: approvalStatus,
      query: "project_manual_push",
    });
    expect(projectApprovalGroups.groups.map((group) => group.key)).toContain("git_remote_write");
    expect(projectApprovalGroups.gates.join(" ")).toContain("does not approve");

    const ledger = await caller.ledger.overview({ evidenceLimit: 10 });
    const pushContract = ledger.latestProjectPushContracts.find((item) => item.id === ready.proposalId);
    expect(pushContract?.actionType).toBe("project_manual_push");
    expect(pushContract?.riskClass).toBe("git_remote_write");
    expect(pushContract?.projectName).toBe("CereBro");
    expect(pushContract?.approvalStatus).toBe(approvalStatus === "pending" ? "approved" : approvalStatus);
    expect(pushContract?.workbenchEvidenceId).toBeGreaterThan(0);
    expect(ledger.cards.gitWrites.projectPushContracts).toBeGreaterThan(0);

    const blocked = await caller.execution.runApprovedAction({
      proposalId: ready.proposalId,
      approved: true,
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.wouldExecute).toBe(false);
    expect(blocked.resultState).toBe("blocked_by_runner_policy");
    expect(blocked.reason).toContain("Only approved read-only command contracts");
    expect(blocked.gates.join(" ")).toContain("git write");
  });
});
