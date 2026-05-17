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
});
