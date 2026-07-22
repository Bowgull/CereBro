import { describe, expect, it } from "vitest";
import { terminalLabObservationActionCopy, terminalLabProjectReadCopy, terminalLabReceiptChainCopy } from "../client/src/lib/terminalLabCopyModel";

// Copy locks follow the language-pass glossary (audit item 3, 2026-07-21):
// body → draft · receipt → record · gate → approval.
describe("terminalLabCopyModel", () => {
  it("keeps the Project Read rail plain and non-executing", () => {
    const copy = terminalLabProjectReadCopy();

    expect(copy.headerBadge).toBe("read only");
    expect(copy.headerMode).toBe("Aang reads");
    expect(copy.headerOwner).toBe("Tony drafts");
    expect(copy.headerSupport).toBe("Spock approves");
    expect(copy.intentLine).toBe("Terminal Lab explains commands before they run elsewhere through approval.");
    expect(copy.title).toBe("Project Read");
    expect(copy.readStateLabel).toBe("Decision");
    expect(copy.executionLabel).toBe("Action");
    expect(copy.executionValue(false)).toBe("read only");
    expect(copy.manualValue).toBe("review first");
    expect(copy.bodyStatsLabel).toBe("Drafts");
    expect(copy.bodyStatsValue(4, 1)).toBe("4 / 1 review");
    expect(copy.receiptDetailsTitle).toBe("Draft Read");
    expect(copy.receiptDetailsHeading).toBe("Workbench Drafts");
    expect(copy.receiptDetailsReading).toBe("Reading the Workbench draft summary.");
    expect(copy.boundaryTitle).toBe("Action Boundary");
    expect(copy.boundaryStateText(false, true)).toBe("Project Lab read only. Git action: no. Approval required: yes.");
    const joined = Object.values(copy).join(" ").toLowerCase();
    expect(joined).not.toContain("push readiness");
    expect(joined).not.toContain("command boundary");
    expect(joined).not.toContain("intent classifier");
    // Glossary guard: internal harness nouns must not appear.
    expect(joined).not.toContain("bodies");
    expect(joined).not.toContain("receipt");
  });

  it("names the draft path as Aang explaining before the Workbench draft", () => {
    const copy = terminalLabReceiptChainCopy();

    expect(copy.ariaLabel).toBe("Aang to Workbench draft path");
    expect(copy.firstStepLabel).toBe("Aang explains");
    expect(copy.workbenchStepLabel).toBe("Workbench draft");
    expect(copy.emptyReceiptText).toBe("draft not saved");
    expect(copy.projectStepLabel).toBe("Project read");
    expect(copy.footer).toBe("Aang explains here. Save the draft in Workbench. Read project context before any git decision.");
    const joined = Object.values(copy).join(" ").toLowerCase();
    expect(joined).not.toContain("terminal explains");
    expect(joined).not.toContain("proof path");
    expect(joined).not.toContain("body");
  });

  it("keeps observation action labels user-facing and grouped by next step", () => {
    const copy = terminalLabObservationActionCopy();

    expect(copy.drawerTitle).toBe("Observation Next Steps");
    expect(copy.statusGroup).toBe("Status");
    expect(copy.approvalGroup).toBe("Approval");
    expect(copy.connectGroup).toBe("Connect");
    expect(copy.receiptGroup).toBe("Explain + Record");
    expect(copy.approvalButton).toBe("Approval Read");
    expect(copy.selectedLinkButton).toBe("Link Selected");
    expect(copy.teachButton).toBe("Aang Explains");
    expect(copy.saveReceiptButton).toBe("Save Record");
    expect(copy.ledgerButton).toBe("Ledger");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("output");
    expect(copy.approvalGroup).not.toBe("Gate");
  });
});
