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
});
