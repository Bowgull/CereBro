import { describe, expect, it } from "vitest";
import { browserActionProposalModel } from "./browserActionProposalModel";

describe("browserActionProposalModel", () => {
  it("creates a blocked Browser action proposal contract without execution", () => {
    const proposal = browserActionProposalModel({
      actionLabel: "Save to Sources",
      target: "https://example.com/source",
      draftKind: "url",
    });

    expect(proposal.surface).toBe("workbench_browser");
    expect(proposal.actionLabel).toBe("Save to Sources");
    expect(proposal.target).toBe("https://example.com/source");
    expect(proposal.riskClass).toBe("browser_write");
    expect(proposal.executorAgent).toBe("surfer");
    expect(proposal.canExecute).toBe(false);
    expect(proposal.resultState).toBe("not_run");
    expect(proposal.requiredGates).toEqual([
      "Runner contract",
      "Approval receipt",
      "Spock gate",
      "Workbench body",
      "Result receipt",
      "Recovery note",
    ]);
    expect(proposal.noActionTaken).toContain("No browser opened.");
    expect(proposal.noActionTaken).toContain("No source saved.");
  });

  it("keeps empty Browser drafts blocked before proposal execution", () => {
    const proposal = browserActionProposalModel({
      actionLabel: "Add to Watch",
      target: "",
      draftKind: "empty",
    });

    expect(proposal.target).toBe("No page draft.");
    expect(proposal.riskClass).toBe("browser_read");
    expect(proposal.canExecute).toBe(false);
    expect(proposal.blockers).toContain("page draft");
    expect(proposal.statusLabel).toBe("proposal blocked");
  });
});
