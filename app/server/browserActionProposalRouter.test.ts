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

describe("Workbench Browser action proposal preview route", () => {
  it("returns a blocked Browser action contract without writing rows", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const proposal = await caller.workbench.browserActionProposalPreview({
      actionLabel: "Save to Sources",
      target: "https://example.com/source",
      draftKind: "url",
    });

    expect(proposal.surface).toBe("workbench_browser");
    expect(proposal.statusLabel).toBe("proposal blocked");
    expect(proposal.canExecute).toBe(false);
    expect(proposal.resultState).toBe("not_run");
    expect(proposal.requiredGates).toContain("Approval receipt");
    expect(proposal.noActionTaken).toContain("No browser opened.");
    expect(proposal.noActionTaken).toContain("No source saved.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("creates one durable local Browser action proposal without approvals or execution", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserProposals: await countRows("browser_action_proposals"),
    };

    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/source",
      draftKind: "url",
    });

    expect(created.ok).toBe(true);
    expect(created.proposal.id).toBeGreaterThan(0);
    expect(created.proposal.surface).toBe("workbench_browser");
    expect(created.proposal.statusLabel).toBe("proposal blocked");
    expect(created.proposal.canExecute).toBe(false);
    expect(created.proposal.resultState).toBe("not_run");
    expect(created.proposal.requiredGates).toContain("Approval receipt");
    expect(created.noActionTaken).toContain("No browser opened.");
    expect(created.noActionTaken).toContain("No source saved.");

    expect(await countRows("browser_action_proposals")).toBe(before.browserProposals + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads recent durable Browser action proposals without approvals or execution", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserProposals: await countRows("browser_action_proposals"),
    };

    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Add to Watch",
      target: "https://example.com/watch",
      draftKind: "url",
    });

    const proposals = await caller.workbench.browserActionProposals({ limit: 5 });

    expect(proposals.items[0]?.id).toBe(created.proposal.id);
    expect(proposals.items[0]?.surface).toBe("workbench_browser");
    expect(proposals.items[0]?.actionLabel).toBe("Add to Watch");
    expect(proposals.items[0]?.target).toBe("https://example.com/watch");
    expect(proposals.items[0]?.statusLabel).toBe("proposal blocked");
    expect(proposals.items[0]?.canExecute).toBe(false);
    expect(proposals.items[0]?.resultState).toBe("not_run");
    expect(proposals.items[0]?.requiredGates).toContain("Approval receipt");
    expect(proposals.noActionTaken).toContain("No browser opened.");
    expect(proposals.noActionTaken).toContain("No Watch Shelf item saved.");

    expect(await countRows("browser_action_proposals")).toBe(before.browserProposals + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("summarizes runner audit state on recent Browser action proposals", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/runner-audit-summary",
      draftKind: "url",
    });
    const runner = await caller.workbench.runBrowserActionBlocked({
      proposalId: created.proposal.id,
    });
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const proposals = await caller.workbench.browserActionProposals({ limit: 5 });
    const proposal = proposals.items.find((item) => item.id === created.proposal.id);

    expect(proposal?.runnerAuditCount).toBeGreaterThanOrEqual(1);
    expect(proposal?.latestRunnerAuditId).toBe(runner.audit.id);
    expect(proposal?.latestRunnerState).toBe("blocked_before_runner");
    expect(proposal?.latestRunnerCanOpenPage).toBe(false);
    expect(proposal?.latestRunnerCanExecute).toBe(false);
    expect(proposal?.latestRunnerAuditAt).toBeGreaterThan(0);

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reports hidden Browser proposal rows behind the compact recent list without deleting them", async () => {
    const caller = createCaller();
    const first = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/hidden-one",
      draftKind: "url",
    });
    const second = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/hidden-two",
      draftKind: "url",
    });
    const third = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/hidden-three",
      draftKind: "url",
    });
    const before = {
      browserProposals: await countRows("browser_action_proposals"),
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const proposals = await caller.workbench.browserActionProposals({ limit: 2 });

    expect(proposals.items.map((item) => item.id)).toEqual([third.proposal.id, second.proposal.id]);
    expect(proposals.totalProposalRows).toBeGreaterThanOrEqual(3);
    expect(proposals.visibleProposalRows).toBe(2);
    expect(proposals.hiddenProposalRows).toBe(proposals.totalProposalRows - 2);
    expect(proposals.hiddenProposalRows).toBeGreaterThanOrEqual(1);
    expect(proposals.items.some((item) => item.id === first.proposal.id)).toBe(false);
    expect(proposals.noActionTaken).toContain("No browser opened.");

    expect(await countRows("browser_action_proposals")).toBe(before.browserProposals);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("pins a focused Browser proposal outside the compact recent limit without running it", async () => {
    const caller = createCaller();
    const older = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/focused-browser-proposal",
      draftKind: "url",
    });
    const newer = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/newer-browser-proposal",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserProposals: await countRows("browser_action_proposals"),
    };

    const proposals = await caller.workbench.browserActionProposals({
      limit: 1,
      focusedProposalId: older.proposal.id,
    });

    expect(proposals.items.map((item) => item.id)).toEqual([older.proposal.id, newer.proposal.id]);
    expect(proposals.focusedProposalPinned).toBe(true);
    expect(proposals.noActionTaken).toContain("No browser opened.");
    expect(proposals.noActionTaken).toContain("No page fetched.");

    expect(await countRows("browser_action_proposals")).toBe(before.browserProposals);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("creates one pending approval preview for a Browser proposal without running it", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-approval",
      draftKind: "url",
    });

    const approvalPreview = await caller.workbench.createBrowserActionApprovalPreview({
      proposalId: created.proposal.id,
      reason: "Test Browser proposal approval preview only.",
    });

    expect(approvalPreview.ok).toBe(true);
    expect(approvalPreview.created).toBe(true);
    expect(approvalPreview.writesExternal).toBe(false);
    expect(approvalPreview.opensBrowser).toBe(false);
    expect(approvalPreview.wouldExecute).toBe(false);
    expect(approvalPreview.approval?.status).toBe("pending");
    expect(approvalPreview.approval?.targetType).toBe("browser_action_proposal");
    expect(approvalPreview.approval?.targetId).toBe(created.proposal.id);
    expect(approvalPreview.approval?.actionType).toBe("browser_action_review");
    expect(approvalPreview.approval?.requestedByAgent).toBe("surfer");
    expect(approvalPreview.approval?.contextSummary).toContain("https://example.com/browser-approval");
    expect(approvalPreview.gates).toContain("No browser opened, page fetched, source saved, Workbench capture created, or external write ran.");

    expect(await countRows("approvals")).toBe(before.approvals + 1);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights + 1);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("returns an existing pending Browser proposal approval preview without duplicating it", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Add to Watch",
      target: "https://example.com/watch-approval",
      draftKind: "url",
    });

    const first = await caller.workbench.createBrowserActionApprovalPreview({
      proposalId: created.proposal.id,
    });
    const beforeApprovals = await countRows("approvals");
    const second = await caller.workbench.createBrowserActionApprovalPreview({
      proposalId: created.proposal.id,
    });

    expect(first.approval?.id).toBe(second.approval?.id);
    expect(second.created).toBe(false);
    expect(second.gates).toContain("Existing pending local Browser approval preview returned.");
    expect(await countRows("approvals")).toBe(beforeApprovals);
  });

  it("surfaces Browser approval previews in the approval queue without treating them as other", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-queue",
      draftKind: "url",
    });
    const approvalPreview = await caller.workbench.createBrowserActionApprovalPreview({
      proposalId: created.proposal.id,
    });

    const browserQueue = await caller.approvals.queue({
      origin: "browser" as never,
      status: "pending",
      limit: 20,
    });
    const otherQueue = await caller.approvals.queue({
      origin: "other",
      status: "pending",
      limit: 100,
    });
    const groups = await caller.approvals.groups({
      groupBy: "origin",
      status: "pending",
    });

    expect(browserQueue.items.some((item) => item.id === approvalPreview.approval?.id)).toBe(true);
    expect(browserQueue.items.find((item) => item.id === approvalPreview.approval?.id)?.origin).toBe("browser");
    expect(browserQueue.summary.browser).toBeGreaterThan(0);
    expect(otherQueue.items.some((item) => item.id === approvalPreview.approval?.id)).toBe(false);
    expect(groups.groups.some((group) => group.key === "browser")).toBe(true);
  });

  it("reports hidden Browser approval rows without changing approval state", async () => {
    const caller = createCaller();
    const beforeApprovals = await countRows("approvals");

    for (const index of [1, 2, 3]) {
      const created = await caller.workbench.createBrowserActionProposal({
        actionLabel: "Open Page",
        target: `https://example.com/browser-queue-hidden-${index}`,
        draftKind: "url",
      });
      await caller.workbench.createBrowserActionApprovalPreview({
        proposalId: created.proposal.id,
      });
    }

    const browserQueue = await caller.approvals.queue({
      origin: "browser" as never,
      status: "pending",
      limit: 2,
    });

    expect(browserQueue.items).toHaveLength(2);
    expect(browserQueue.summary.visible).toBe(2);
    expect(browserQueue.summary.total).toBeGreaterThanOrEqual(3);
    expect(browserQueue.summary.hidden).toBe(browserQueue.summary.total - browserQueue.summary.visible);
    expect(browserQueue.items.every((item) => item.origin === "browser")).toBe(true);
    expect(await countRows("approvals")).toBe(beforeApprovals + 3);
  });

  it("reads Browser approval detail with the linked proposal contract without running it", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/browser-approval-detail",
      draftKind: "url",
    });
    const approvalPreview = await caller.workbench.createBrowserActionApprovalPreview({
      proposalId: created.proposal.id,
    });
    await caller.workbench.createBrowserTabSessionDraft({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserResultRecoveryScaffold({ proposalId: created.proposal.id });
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
    };

    const detail = await caller.approvals.detail({
      id: approvalPreview.approval?.id ?? 0,
    });

    expect(detail.approval?.origin).toBe("browser");
    expect(detail.approval?.browserProposalReceipt?.proposalId).toBe(created.proposal.id);
    expect(detail.approval?.browserProposalReceipt?.actionLabel).toBe("Open Page");
    expect(detail.approval?.browserProposalReceipt?.target).toBe("https://example.com/browser-approval-detail");
    expect(detail.approval?.browserProposalReceipt?.canOpenPage).toBe(false);
    expect(detail.approval?.browserProposalReceipt?.canExecute).toBe(false);
    expect(detail.approval?.browserProposalReceipt?.resultState).toBe("blocked_before_runner");
    expect(detail.approval?.browserProposalReceipt?.recoveryNote).toContain("Recovery scaffold recorded before runner");
    expect(detail.approval?.browserProposalReceipt?.noActionTaken).toContain("No browser opened.");
    expect(detail.approval?.browserProposalReceipt?.noActionTaken).toContain("No page fetched.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
  });

  it("reads Add to Watch approval detail with blocked Watch Shelf save state", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Add to Watch",
      target: "https://example.com/watch-approval-detail",
      draftKind: "url",
    });
    const approvalPreview = await caller.workbench.createBrowserActionApprovalPreview({
      proposalId: created.proposal.id,
    });
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      watchShelfItems: await countRows("browser_watch_shelf_items"),
    };

    const detail = await caller.approvals.detail({
      id: approvalPreview.approval?.id ?? 0,
    });

    expect(detail.approval?.origin).toBe("browser");
    expect(detail.approval?.browserProposalReceipt?.actionLabel).toBe("Add to Watch");
    expect(detail.approval?.browserProposalReceipt?.watchShelfAction).toBe(true);
    expect(detail.approval?.browserProposalReceipt?.canSaveWatchShelf).toBe(false);
    expect(detail.approval?.browserProposalReceipt?.canPersistWatchProgress).toBe(false);
    expect(detail.approval?.browserProposalReceipt?.watchShelfGate).toContain("real open page");
    expect(detail.approval?.browserProposalReceipt?.noActionTaken).toContain("No Watch Shelf item saved.");
    expect(detail.approval?.browserProposalReceipt?.noActionTaken).toContain("No progress persisted.");

    expect(await countRows("browser_watch_shelf_items")).toBe(before.watchShelfItems);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("creates one local Workbench body receipt for a Browser proposal without running it", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-body",
      draftKind: "url",
    });

    const body = await caller.workbench.createBrowserActionWorkbenchBody({
      proposalId: created.proposal.id,
    });

    expect(body.ok).toBe(true);
    expect(body.writesExternal).toBe(false);
    expect(body.opensBrowser).toBe(false);
    expect(body.capturesMedia).toBe(false);
    expect(body.evidence.kind).toBe("public_browser");
    expect(body.evidence.targetUri).toBe(`browser_action_proposal:${created.proposal.id}`);
    expect(body.evidence.title).toContain("Browser proposal");
    expect(body.evidence.summary).toContain("https://example.com/browser-body");
    expect(body.evidence.validationStatus).toBe("unvalidated");
    expect(body.gates).toContain("Created one local Workbench body receipt for a Browser proposal.");

    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence + 1);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("creates one local Spock security receipt for a Browser proposal without running it", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-spock",
      draftKind: "url",
    });

    const spockGate = await caller.workbench.createBrowserActionSpockGate({
      proposalId: created.proposal.id,
    });

    expect(spockGate.ok).toBe(true);
    expect(spockGate.writesExternal).toBe(false);
    expect(spockGate.opensBrowser).toBe(false);
    expect(spockGate.executesCommand).toBe(false);
    expect(spockGate.review?.ownerAgent).toBe("spock");
    expect(spockGate.review?.targetUri).toBe("https://example.com/browser-spock");
    expect(spockGate.review?.targetKind).toBe("public_url");
    expect(spockGate.review?.status).toBe("receipt");
    expect(spockGate.review?.blockedActions).toContain("No downloads.");
    expect(spockGate.gates).toContain("Recorded one local Spock security receipt for a Browser proposal.");
    expect(spockGate.gates).toContain("This did not open a browser, fetch a page, save a source, approve work, or write externally.");

    expect(await countRows("security_review_records")).toBe(before.securityReviews + 1);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads Browser proposal gate readiness without writing rows or enabling execution", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-readiness",
      draftKind: "url",
    });
    await caller.workbench.createBrowserActionApprovalPreview({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionWorkbenchBody({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionSpockGate({ proposalId: created.proposal.id });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const readiness = await caller.workbench.browserActionProposalReadiness({
      proposalId: created.proposal.id,
    });

    expect(readiness.proposal.id).toBe(created.proposal.id);
    expect(readiness.canExecute).toBe(false);
    expect(readiness.summary.readyCount).toBe(3);
    expect(readiness.summary.missingCount).toBe(3);
    expect(readiness.gates.find((gate) => gate.key === "approval_receipt")?.present).toBe(true);
    expect(readiness.gates.find((gate) => gate.key === "spock_gate")?.present).toBe(true);
    expect(readiness.gates.find((gate) => gate.key === "workbench_body")?.present).toBe(true);
    expect(readiness.gates.find((gate) => gate.key === "runner_contract")?.present).toBe(false);
    expect(readiness.gates.find((gate) => gate.key === "result_receipt")?.present).toBe(false);
    expect(readiness.gates.find((gate) => gate.key === "recovery_note")?.present).toBe(false);
    expect(readiness.noActionTaken).toContain("No browser opened.");
    expect(readiness.noActionTaken).toContain("No external write ran.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads a Browser result and recovery contract without writing rows or enabling execution", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-result-contract",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const contract = await caller.workbench.browserActionResultRecoveryContract({
      proposalId: created.proposal.id,
    });

    expect(contract.mode).toBe("read_only");
    expect(contract.proposal.id).toBe(created.proposal.id);
    expect(contract.canExecute).toBe(false);
    expect(contract.resultContract.resultState).toBe("not_run");
    expect(contract.resultContract.receiptTitle).toContain("Browser result receipt");
    expect(contract.resultContract.requiredFields).toContain("result_state");
    expect(contract.recoveryContract.status).toBe("not_ready");
    expect(contract.recoveryContract.note).toContain("No browser action has run.");
    expect(contract.gates).toContain("This result/recovery contract does not run the Browser proposal.");
    expect(contract.noActionTaken).toContain("No browser opened.");
    expect(contract.noActionTaken).toContain("No external write ran.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("scaffolds a manual Browser runner route that refuses to open pages or write rows", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Save to Sources",
      target: "https://example.com/browser-runner",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const runner = await caller.workbench.runBrowserActionBlocked({
      proposalId: created.proposal.id,
    });

    expect(runner.ok).toBe(true);
    expect(runner.wouldOpenBrowser).toBe(false);
    expect(runner.writesExternal).toBe(false);
    expect(runner.resultState).toBe("blocked_before_runner");
    expect(runner.proposal.id).toBe(created.proposal.id);
    expect(runner.contract.statusLabel).toBe("contract blocked");
    expect(runner.gates).toContain("Manual Browser runner route exists but is blocked before page open.");
    expect(runner.noActionTaken).toContain("No browser opened.");
    expect(runner.noActionTaken).toContain("No external write ran.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("records a local blocked Browser runner audit without opening a page", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/blocked-runner-audit",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const runner = await caller.workbench.runBrowserActionBlocked({
      proposalId: created.proposal.id,
    });

    expect(runner.audit.id).toBeGreaterThan(0);
    expect(runner.audit.proposalId).toBe(created.proposal.id);
    expect(runner.audit.runnerState).toBe("blocked_before_runner");
    expect(runner.audit.canOpenPage).toBe(false);
    expect(runner.audit.canExecute).toBe(false);
    expect(runner.audit.receiptBody).toContain("No browser opened.");
    expect(runner.audit.noActionTaken).toContain("No browser opened.");
    expect(runner.audit.noActionTaken).toContain("No page fetched.");

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads the Browser tab session storage table contract without persisting tabs", async () => {
    const caller = createCaller();
    const browserTabsBefore = await countRows("browser_tab_sessions");
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
    };

    const storage = await caller.workbench.browserTabSessionStorageContract();

    expect(storage.mode).toBe("read_only");
    expect(storage.tableName).toBe("browser_tab_sessions");
    expect(storage.canPersistTabs).toBe(false);
    expect(storage.canPersistHistory).toBe(false);
    expect(storage.canPersistCookies).toBe(false);
    expect(storage.storageShape.requiredFields).toContain("tab_id");
    expect(storage.storageShape.requiredFields).toContain("target_url");
    expect(storage.items.length).toBeLessThanOrEqual(10);
    expect(storage.gates).toContain("Browser tab/session storage table exists, but persistence remains blocked.");
    expect(storage.noActionTaken).toContain("No browser opened.");
    expect(storage.noActionTaken).toContain("No tab session persisted.");

    expect(await countRows("browser_tab_sessions")).toBe(browserTabsBefore);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads the Watch Shelf storage contract without saving fake media state", async () => {
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
      watchShelfItems: await countRows("browser_watch_shelf_items"),
    };

    const shelf = await caller.workbench.watchShelfStorageContract();

    expect(shelf.mode).toBe("read_only");
    expect(shelf.tableName).toBe("browser_watch_shelf_items");
    expect(shelf.canSaveItems).toBe(false);
    expect(shelf.canPersistProgress).toBe(false);
    expect(shelf.canOpenPage).toBe(false);
    expect(shelf.storageShape.requiredFields).toContain("target_url");
    expect(shelf.storageShape.requiredFields).toContain("category");
    expect(shelf.storageShape.optionalFields).toContain("browser_tab_session_id");
    expect(shelf.categories).toContain("Anime");
    expect(shelf.noActionTaken).toContain("No Watch Shelf item saved.");
    expect(shelf.noActionTaken).toContain("No browser opened.");
    expect(shelf.noActionTaken).toContain("No progress persisted.");

    expect(await countRows("browser_watch_shelf_items")).toBe(before.watchShelfItems);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads a manual Browser open-page contract without opening or persisting a tab", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/manual-open",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
    };

    const contract = await caller.workbench.browserManualOpenPageContract({
      proposalId: created.proposal.id,
    });

    expect(contract.mode).toBe("blocked_manual_open_page_contract");
    expect(contract.proposal.id).toBe(created.proposal.id);
    expect(contract.targetUrl).toBe("https://example.com/manual-open");
    expect(contract.canOpenPage).toBe(false);
    expect(contract.canPersistTab).toBe(false);
    expect(contract.canFetchPage).toBe(false);
    expect(contract.requiredBeforeOpen).toContain("approved Browser action approval receipt");
    expect(contract.requiredBeforeOpen).toContain("Spock target safety receipt");
    expect(contract.requiredBeforeOpen).toContain("Workbench body receipt");
    expect(contract.requiredBeforeOpen).toContain("browser_tab_sessions draft row policy");
    expect(contract.gates).toContain("Manual page open is still blocked.");
    expect(contract.noActionTaken).toContain("No browser opened.");
    expect(contract.noActionTaken).toContain("No tab session persisted.");

    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("creates one local Browser tab draft row without opening or fetching a page", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/draft-tab",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
    };

    const draft = await caller.workbench.createBrowserTabSessionDraft({
      proposalId: created.proposal.id,
    });

    expect(draft.ok).toBe(true);
    expect(draft.mode).toBe("local_browser_tab_draft");
    expect(draft.tab.proposalId).toBe(created.proposal.id);
    expect(draft.tab.tabId).toBe(`draft-proposal-${created.proposal.id}`);
    expect(draft.tab.targetUrl).toBe("https://example.com/draft-tab");
    expect(draft.tab.state).toBe("draft");
    expect(draft.canOpenPage).toBe(false);
    expect(draft.canFetchPage).toBe(false);
    expect(draft.noActionTaken).toContain("No browser opened.");
    expect(draft.noActionTaken).toContain("No page fetched.");
    expect(draft.noActionTaken).toContain("No history persisted.");

    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("separates pending approval preview from approved manual-open execution approval", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/open-policy",
      draftKind: "url",
    });
    const preview = await caller.workbench.createBrowserActionApprovalPreview({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionWorkbenchBody({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionSpockGate({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserTabSessionDraft({ proposalId: created.proposal.id });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
    };

    const pendingPolicy = await caller.workbench.browserManualOpenRunnerPolicy({
      proposalId: created.proposal.id,
    });

    expect(pendingPolicy.gates.approvalPreview.present).toBe(true);
    expect(pendingPolicy.gates.executionApproval.present).toBe(false);
    expect(pendingPolicy.summary.readyCount).toBe(4);
    expect(pendingPolicy.summary.missingCount).toBe(3);
    expect(pendingPolicy.summary.nextMissingGate).toBe("approved execution approval");

    await caller.approvals.decide({
      id: preview.approval?.id ?? 0,
      decision: "approved",
      reason: "Test approval decision. This still must not open a page.",
    });

    const policy = await caller.workbench.browserManualOpenRunnerPolicy({
      proposalId: created.proposal.id,
    });

    expect(policy.mode).toBe("blocked_manual_open_runner_policy");
    expect(policy.proposal.id).toBe(created.proposal.id);
    expect(policy.canOpenPage).toBe(false);
    expect(policy.canExecute).toBe(false);
    expect(policy.runnerState).toBe("blocked_before_runner");
    expect(policy.gates.approvalPreview.present).toBe(true);
    expect(policy.gates.executionApproval.present).toBe(true);
    expect(policy.gates.spock.present).toBe(true);
    expect(policy.gates.workbenchBody.present).toBe(true);
    expect(policy.gates.tabDraft.present).toBe(true);
    expect(policy.gates.resultReceipt.present).toBe(false);
    expect(policy.gates.recoveryNote.present).toBe(false);
    expect(policy.summary.readyCount).toBe(5);
    expect(policy.summary.missingCount).toBe(2);
    expect(policy.summary.nextMissingGate).toBe("result receipt");
    expect(policy.gatesText).toContain("Manual open runner remains blocked.");
    expect(policy.noActionTaken).toContain("No browser opened.");
    expect(policy.noActionTaken).toContain("No page fetched.");

    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("stages Browser result and recovery scaffolds without opening a page", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/result-scaffold",
      draftKind: "url",
    });
    const preview = await caller.workbench.createBrowserActionApprovalPreview({ proposalId: created.proposal.id });
    await caller.approvals.decide({
      id: preview.approval?.id ?? 0,
      decision: "approved",
      reason: "Test approval decision. This still must not open a page.",
    });
    await caller.workbench.createBrowserActionWorkbenchBody({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionSpockGate({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserTabSessionDraft({ proposalId: created.proposal.id });
    const before = {
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
    };

    const scaffold = await caller.workbench.createBrowserResultRecoveryScaffold({
      proposalId: created.proposal.id,
    });

    expect(scaffold.ok).toBe(true);
    expect(scaffold.mode).toBe("blocked_browser_result_recovery_scaffold");
    expect(scaffold.resultReceipt.present).toBe(true);
    expect(scaffold.recoveryNote.present).toBe(true);
    expect(scaffold.resultReceipt.resultState).toBe("blocked_before_runner");
    expect(scaffold.recoveryNote.status).toBe("draft");
    expect(scaffold.canOpenPage).toBe(false);
    expect(scaffold.canExecute).toBe(false);
    expect(scaffold.noActionTaken).toContain("No browser opened.");
    expect(scaffold.noActionTaken).toContain("No page fetched.");

    const policy = await caller.workbench.browserManualOpenRunnerPolicy({
      proposalId: created.proposal.id,
    });

    expect(policy.gates.resultReceipt.present).toBe(true);
    expect(policy.gates.recoveryNote.present).toBe(true);
    expect(policy.summary.readyCount).toBe(7);
    expect(policy.summary.missingCount).toBe(0);
    expect(policy.canExecute).toBe(false);
    expect(policy.canOpenPage).toBe(false);
    expect(policy.gatesText).toContain("All policy scaffolds are present, but manual open runner remains disabled.");

    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads Browser live-runner preflight without treating pending approval as live runner permission", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-pending",
      draftKind: "url",
    });
    await caller.workbench.createBrowserActionApprovalPreview({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionWorkbenchBody({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionSpockGate({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserTabSessionDraft({ proposalId: created.proposal.id });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      securityReviews: await countRows("security_review_records"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const preflight = await caller.workbench.browserLiveRunnerPreflight({
      proposalId: created.proposal.id,
    });

    expect(preflight.mode).toBe("preflight_only");
    expect(preflight.proposal.id).toBe(created.proposal.id);
    expect(preflight.liveRunnerApproved).toBe(false);
    expect(preflight.requiresExplicitLiveRunnerApproval).toBe(true);
    expect(preflight.canOpenPage).toBe(false);
    expect(preflight.canExecute).toBe(false);
    expect(preflight.gates.approvalPreview.present).toBe(true);
    expect(preflight.gates.executionApproval.present).toBe(false);
    expect(preflight.gates.liveRunnerApproval.present).toBe(false);
    expect(preflight.summary.nextMissingGate).toBe("approved execution approval");
    expect(preflight.noActionTaken).toContain("No browser opened.");
    expect(preflight.noActionTaken).toContain("No page fetched.");
    expect(preflight.noActionTaken).toContain("No runner audit written.");

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights);
    expect(await countRows("security_review_records")).toBe(before.securityReviews);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("keeps Browser live-runner preflight blocked even after all local scaffolds exist", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-all-scaffolds",
      draftKind: "url",
    });
    const preview = await caller.workbench.createBrowserActionApprovalPreview({ proposalId: created.proposal.id });
    await caller.approvals.decide({
      id: preview.approval?.id ?? 0,
      decision: "approved",
      reason: "Test approval decision. This still must not open a page.",
    });
    await caller.workbench.createBrowserActionWorkbenchBody({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserActionSpockGate({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserTabSessionDraft({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserResultRecoveryScaffold({ proposalId: created.proposal.id });
    const before = {
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const preflight = await caller.workbench.browserLiveRunnerPreflight({
      proposalId: created.proposal.id,
    });

    expect(preflight.mode).toBe("preflight_only");
    expect(preflight.liveRunnerApproved).toBe(false);
    expect(preflight.requiresExplicitLiveRunnerApproval).toBe(true);
    expect(preflight.canOpenPage).toBe(false);
    expect(preflight.canExecute).toBe(false);
    expect(preflight.gates.executionApproval.present).toBe(true);
    expect(preflight.gates.spock.present).toBe(true);
    expect(preflight.gates.workbenchBody.present).toBe(true);
    expect(preflight.gates.tabDraft.present).toBe(true);
    expect(preflight.gates.resultReceipt.present).toBe(true);
    expect(preflight.gates.recoveryNote.present).toBe(true);
    expect(preflight.gates.liveRunnerApproval.present).toBe(false);
    expect(preflight.summary.readyCount).toBe(7);
    expect(preflight.summary.missingCount).toBe(1);
    expect(preflight.summary.nextMissingGate).toBe("explicit live runner approval");
    expect(preflight.nextAction).toContain("explicit live-runner approval");
    expect(preflight.noActionTaken).toContain("No browser opened.");
    expect(preflight.noActionTaken).toContain("No runner audit written.");

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("creates one pending live-runner approval preview without opening a page", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-approval-preview",
      draftKind: "url",
    });
    const before = {
      approvals: await countRows("approvals"),
      permissionPreflights: await countRows("permission_preflight_records"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
      sources: await countRows("sources"),
    };

    const approvalPreview = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
      reason: "Test live runner approval preview only.",
    });

    expect(approvalPreview.ok).toBe(true);
    expect(approvalPreview.created).toBe(true);
    expect(approvalPreview.opensBrowser).toBe(false);
    expect(approvalPreview.wouldExecute).toBe(false);
    expect(approvalPreview.writesExternal).toBe(false);
    expect(approvalPreview.approval?.status).toBe("pending");
    expect(approvalPreview.approval?.actionType).toBe("browser_live_runner");
    expect(approvalPreview.approval?.targetType).toBe("browser_action_proposal");
    expect(approvalPreview.approval?.targetId).toBe(created.proposal.id);
    expect(approvalPreview.approval?.contextSummary).toContain("Live runner approval preview");
    expect(approvalPreview.gates).toContain("Created one pending local Browser live-runner approval preview.");
    expect(approvalPreview.noActionTaken).toContain("No browser opened.");
    expect(approvalPreview.noActionTaken).toContain("No page fetched.");

    expect(await countRows("approvals")).toBe(before.approvals + 1);
    expect(await countRows("permission_preflight_records")).toBe(before.permissionPreflights + 1);
    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("keeps live-runner approval preview idempotent and blocked before approval", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-approval-idempotent",
      draftKind: "url",
    });

    const first = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    const beforeApprovals = await countRows("approvals");
    const second = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    const preflight = await caller.workbench.browserLiveRunnerPreflight({
      proposalId: created.proposal.id,
    });

    expect(first.approval?.id).toBe(second.approval?.id);
    expect(second.created).toBe(false);
    expect(second.gates).toContain("Existing pending local Browser live-runner approval preview returned.");
    expect(preflight.gates.liveRunnerApproval.present).toBe(false);
    expect(preflight.liveRunnerApproved).toBe(false);
    expect(preflight.canOpenPage).toBe(false);
    expect(await countRows("approvals")).toBe(beforeApprovals);
  });

  it("recognizes approved live-runner approval but still blocks page open", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-approval-approved",
      draftKind: "url",
    });
    const liveApproval = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    await caller.approvals.decide({
      id: liveApproval.approval?.id ?? 0,
      decision: "approved",
      reason: "Test live runner approval only. This still must not open a page.",
    });
    const before = {
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
      sources: await countRows("sources"),
    };

    const preflight = await caller.workbench.browserLiveRunnerPreflight({
      proposalId: created.proposal.id,
    });

    expect(preflight.gates.liveRunnerApproval.present).toBe(true);
    expect(preflight.liveRunnerApproved).toBe(true);
    expect(preflight.canOpenPage).toBe(false);
    expect(preflight.canExecute).toBe(false);
    expect(preflight.gatesText).toContain("No browser tab opens until the live runner implementation exists.");
    expect(preflight.nextAction).toBe("Live runner remains blocked until the live runner implementation exists.");
    expect(preflight.noActionTaken).toContain("No browser opened.");
    expect(preflight.noActionTaken).toContain("No runner audit written.");

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("writes a blocked live-runner implementation audit without opening a page", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-implementation-blocked",
      draftKind: "url",
    });
    const liveApproval = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    await caller.approvals.decide({
      id: liveApproval.approval?.id ?? 0,
      decision: "approved",
      reason: "Test live runner gate only. Implementation remains blocked.",
    });
    const before = {
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const blocked = await caller.workbench.runBrowserLiveRunnerBlocked({
      proposalId: created.proposal.id,
    });

    expect(blocked.mode).toBe("blocked_live_browser_runner");
    expect(blocked.liveRunnerApproved).toBe(true);
    expect(blocked.implementationPresent).toBe(false);
    expect(blocked.requiresImplementation).toBe(true);
    expect(blocked.canOpenPage).toBe(false);
    expect(blocked.canExecute).toBe(false);
    expect(blocked.audit.runnerState).toBe("blocked_before_live_runner_implementation");
    expect(blocked.audit.canOpenPage).toBe(false);
    expect(blocked.audit.canExecute).toBe(false);
    expect(blocked.audit.receiptBody).toContain("Live runner implementation is not present.");
    expect(blocked.noActionTaken).toContain("No browser opened.");
    expect(blocked.noActionTaken).toContain("No page fetched.");
    expect(blocked.noActionTaken).toContain("No runner implementation invoked.");

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits + 1);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("includes the latest blocked runner audit in live-runner preflight without writing rows", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-preflight-audit",
      draftKind: "url",
    });
    const liveApproval = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    await caller.approvals.decide({
      id: liveApproval.approval?.id ?? 0,
      decision: "approved",
      reason: "Preflight audit readback test only.",
    });
    const blocked = await caller.workbench.runBrowserLiveRunnerBlocked({
      proposalId: created.proposal.id,
    });
    const before = {
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const preflight = await caller.workbench.browserLiveRunnerPreflight({
      proposalId: created.proposal.id,
    });

    expect(preflight.latestRunnerAudit?.id).toBe(blocked.audit.id);
    expect(preflight.latestRunnerAudit?.runnerState).toBe("blocked_before_live_runner_implementation");
    expect(preflight.latestRunnerAudit?.canOpenPage).toBe(false);
    expect(preflight.latestRunnerAudit?.canExecute).toBe(false);
    expect(preflight.latestRunnerAudit?.noActionTaken).toContain("No runner implementation invoked.");
    expect(preflight.gates.latestRunnerAudit.present).toBe(true);
    expect(preflight.gates.latestRunnerAudit.detail).toContain(`Runner audit #${blocked.audit.id}`);
    expect(preflight.canOpenPage).toBe(false);
    expect(preflight.canExecute).toBe(false);

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads the live-runner launch gate as blocked after approval and audit receipts", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-launch-gate",
      draftKind: "url",
    });
    const liveApproval = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    await caller.approvals.decide({
      id: liveApproval.approval?.id ?? 0,
      decision: "approved",
      reason: "Launch gate readback only.",
    });
    const blocked = await caller.workbench.runBrowserLiveRunnerBlocked({
      proposalId: created.proposal.id,
    });
    const before = {
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const gate = await caller.workbench.browserLiveRunnerLaunchGate({
      proposalId: created.proposal.id,
    });

    expect(gate.mode).toBe("read_only_launch_gate");
    expect(gate.proposal.id).toBe(created.proposal.id);
    expect(gate.liveRunnerApproved).toBe(true);
    expect(gate.latestRunnerAudit?.id).toBe(blocked.audit.id);
    expect(gate.implementationPresent).toBe(false);
    expect(gate.canOpenPage).toBe(false);
    expect(gate.canExecute).toBe(false);
    expect(gate.hardGate).toBe("live runner implementation missing");
    expect(gate.nextAction).toContain("implementation contract");
    expect(gate.noActionTaken).toContain("No browser opened.");
    expect(gate.noActionTaken).toContain("No page fetched.");

    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
    expect(await countRows("sources")).toBe(before.sources);
  });

  it("reads live-runner approval detail as a blocked Browser runner gate", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/live-runner-approval-detail",
      draftKind: "url",
    });
    const liveApproval = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
    });
    const before = {
      approvals: await countRows("approvals"),
      sources: await countRows("sources"),
      browserRunnerAudits: await countRows("browser_runner_audit_records"),
    };

    const detail = await caller.approvals.detail({
      id: liveApproval.approval?.id ?? 0,
    });

    expect(detail.approval?.origin).toBe("browser");
    expect(detail.approval?.actionType).toBe("browser_live_runner");
    expect(detail.approval?.browserProposalReceipt?.proposalId).toBe(created.proposal.id);
    expect(detail.approval?.browserProposalReceipt?.approvalKind).toBe("live_runner");
    expect(detail.approval?.browserProposalReceipt?.liveRunnerAction).toBe(true);
    expect(detail.approval?.browserProposalReceipt?.canOpenPage).toBe(false);
    expect(detail.approval?.browserProposalReceipt?.canExecute).toBe(false);
    expect(detail.approval?.browserProposalReceipt?.liveRunnerGate).toContain("explicit live-runner approval");
    expect(detail.approval?.browserProposalReceipt?.noActionTaken).toContain("No browser opened.");
    expect(detail.approval?.browserProposalReceipt?.noActionTaken).toContain("No runner audit written.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("browser_runner_audit_records")).toBe(before.browserRunnerAudits);
    expect(await countRows("sources")).toBe(before.sources);
  });
});
