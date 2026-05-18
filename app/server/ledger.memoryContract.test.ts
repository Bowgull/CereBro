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

describe("Ledger memory contract read", () => {
  it("includes memory reuse contract context without writing durable rows", async () => {
    const caller = createCaller();
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const overview = await caller.ledger.overview({ evidenceLimit: 5, routeLimit: 3 });

    expect(overview.memoryContract.mode).toBe("read_only");
    expect(overview.memoryContract.normalRoute).toBe("20_Knowledge");
    expect(overview.memoryContract.archiveRoute).toBe("90_Archive");
    expect(overview.memoryContract.canAutomateRetrieval).toBe(false);
    expect(overview.memoryContract.writesExternalSystems).toBe(false);
    expect(overview.memoryContract.nextAction).toContain("Validate");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });

  it("includes route receipt contract context without running or writing work", async () => {
    const caller = createCaller();
    const before = {
      routeRecords: await countRows("runtime_route_records"),
      tasks: await countRows("tasks"),
      approvals: await countRows("approvals"),
      evidence: await countRows("workbench_evidence_records"),
      preflights: await countRows("permission_preflight_records"),
      memoryEntries: await countRows("memory_entries"),
    };

    const overview = await caller.ledger.overview({ evidenceLimit: 5, routeLimit: 3 });

    expect(overview.routeReceiptContract.mode).toBe("read_only");
    expect(overview.routeReceiptContract.ownerAgent).toBe("cortana");
    expect(overview.routeReceiptContract.bodySurface).toBe("workbench");
    expect(overview.routeReceiptContract.auditSurface).toBe("ledger");
    expect(overview.routeReceiptContract.executorStatus).toBe("not_built");
    expect(overview.routeReceiptContract.canExecute).toBe(false);
    expect(overview.routeReceiptContract.totalRoutes).toBeGreaterThanOrEqual(0);
    expect(overview.routeReceiptContract.noActionTaken.join(" ")).toContain("No command ran");
    expect(overview.routeReceiptContract.noActionTaken.join(" ")).toContain("No route was saved");
    expect(overview.routeReceiptContract.nextAction).toContain("route receipts");

    expect(await countRows("runtime_route_records")).toBe(before.routeRecords);
    expect(await countRows("tasks")).toBe(before.tasks);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.evidence);
    expect(await countRows("permission_preflight_records")).toBe(before.preflights);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });

  it("includes Browser receipt audit context without opening pages or writing external rows", async () => {
    const caller = createCaller();
    const created = await caller.workbench.createBrowserActionProposal({
      actionLabel: "Open Page",
      target: "https://example.com/ledger-browser-audit",
      draftKind: "url",
    });
    await caller.workbench.createBrowserTabSessionDraft({ proposalId: created.proposal.id });
    await caller.workbench.createBrowserResultRecoveryScaffold({ proposalId: created.proposal.id });
    const runner = await caller.workbench.runBrowserActionBlocked({ proposalId: created.proposal.id });
    const liveApproval = await caller.workbench.createBrowserLiveRunnerApprovalPreview({
      proposalId: created.proposal.id,
      reason: "Ledger live-runner readback test only.",
    });
    const before = {
      approvals: await countRows("approvals"),
      workbenchEvidence: await countRows("workbench_evidence_records"),
      sources: await countRows("sources"),
      browserTabs: await countRows("browser_tab_sessions"),
    };

    const overview = await caller.ledger.overview({ evidenceLimit: 5, routeLimit: 3 });

    expect(overview.browserReceiptAudit.mode).toBe("read_only");
    expect(overview.browserReceiptAudit.ownerAgent).toBe("spock");
    expect(overview.browserReceiptAudit.canOpenPage).toBe(false);
    expect(overview.browserReceiptAudit.canExecute).toBe(false);
    expect(overview.browserReceiptAudit.proposals).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.draftTabs).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.resultScaffolds).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.recoveryScaffolds).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.watchShelfItems).toBeGreaterThanOrEqual(0);
    expect(overview.browserReceiptAudit.runnerAudits).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.liveRunnerApprovals).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.pendingLiveRunnerApprovals).toBeGreaterThan(0);
    expect(overview.browserReceiptAudit.approvedLiveRunnerApprovals).toBeGreaterThanOrEqual(0);
    expect(overview.browserReceiptAudit.canSaveWatchShelf).toBe(false);
    expect(overview.browserReceiptAudit.canPersistWatchProgress).toBe(false);
    expect(overview.browserReceiptAudit.latestWatchShelfItems).toEqual([]);
    expect(overview.browserReceiptAudit.latestRunnerAudits[0]?.id).toBe(runner.audit.id);
    expect(overview.browserReceiptAudit.latestRunnerAudits[0]?.proposalId).toBe(created.proposal.id);
    expect(overview.browserReceiptAudit.latestRunnerAudits[0]?.runnerState).toBe("blocked_before_runner");
    expect(overview.browserReceiptAudit.latestRunnerAudits[0]?.canOpenPage).toBe(false);
    expect(overview.browserReceiptAudit.latestRunnerAudits[0]?.canExecute).toBe(false);
    expect(overview.browserReceiptAudit.latestRunnerAudits[0]?.receiptBody).toContain("No browser opened.");
    expect(overview.browserReceiptAudit.latestLiveRunnerApprovals[0]?.id).toBe(liveApproval.approval?.id);
    expect(overview.browserReceiptAudit.latestLiveRunnerApprovals[0]?.proposalId).toBe(created.proposal.id);
    expect(overview.browserReceiptAudit.latestLiveRunnerApprovals[0]?.status).toBe("pending");
    expect(overview.browserReceiptAudit.latestProposals[0]?.id).toBe(created.proposal.id);
    expect(overview.browserReceiptAudit.latestTabs.some((tab) => tab.proposalId === created.proposal.id)).toBe(true);
    expect(overview.browserReceiptAudit.gates.join(" ")).toContain("does not open pages");
    expect(overview.browserReceiptAudit.gates.join(" ")).toContain("runner audit rows");
    expect(overview.browserReceiptAudit.gates.join(" ")).toContain("live-runner approval rows");
    expect(overview.browserReceiptAudit.gates.join(" ")).toContain("does not save Watch Shelf items");
    expect(overview.browserReceiptAudit.noActionTaken).toContain("No browser opened.");
    expect(overview.browserReceiptAudit.noActionTaken).toContain("No page fetched.");
    expect(overview.browserReceiptAudit.noActionTaken).toContain("No Watch Shelf item saved.");
    expect(overview.browserReceiptAudit.noActionTaken).toContain("No progress persisted.");

    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.workbenchEvidence);
    expect(await countRows("sources")).toBe(before.sources);
    expect(await countRows("browser_tab_sessions")).toBe(before.browserTabs);
  });
});
