import { describe, expect, it } from "vitest";
import { terminalLabObservationActionCopy, terminalLabProjectReadCopy, terminalLabReceiptChainCopy } from "../client/src/lib/terminalLabCopyModel";

describe("terminalLabCopyModel", () => {
  it("keeps the Project Read rail plain and non-executing", () => {
    const copy = terminalLabProjectReadCopy();

    expect(copy.headerBadge).toBe("read only lane");
    expect(copy.headerMode).toBe("Aang reads");
    expect(copy.headerOwner).toBe("Tony drafts");
    expect(copy.headerSupport).toBe("Spock gates");
    expect(copy.intentLine).toBe("Terminal Lab reads commands before they run elsewhere through approval.");
    expect(copy.title).toBe("Project Read");
    expect(copy.readStateLabel).toBe("Decision");
    expect(copy.executionLabel).toBe("Action");
    expect(copy.executionValue(false)).toBe("read only");
    expect(copy.manualValue).toBe("review first");
    expect(copy.bodyStatsLabel).toBe("Bodies");
    expect(copy.bodyStatsValue(4, 1)).toBe("4 / 1 review");
    expect(copy.receiptDetailsTitle).toBe("Body Read");
    expect(copy.receiptDetailsHeading).toBe("Workbench Bodies");
    expect(copy.receiptDetailsReading).toBe("Reading Workbench body summary.");
    expect(copy.boundaryTitle).toBe("Action Boundary");
    expect(copy.boundaryStateText(false, true)).toBe("Project Lab read only. Git action: no. Approval required: yes.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("push readiness");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("command boundary");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("intent classifier");
  });

  it("names the body path as Aang teaching before Workbench body", () => {
    const copy = terminalLabReceiptChainCopy();

    expect(copy.ariaLabel).toBe("Aang to Workbench body path");
    expect(copy.firstStepLabel).toBe("Aang teaches");
    expect(copy.workbenchStepLabel).toBe("Workbench body");
    expect(copy.emptyReceiptText).toBe("body not saved");
    expect(copy.projectStepLabel).toBe("Project read");
    expect(copy.footer).toBe("Teaching path: Aang explains here. Save the body in Workbench. Read project context before any git decision.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("terminal explains");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("proof path");
  });

  it("keeps observation action labels user-facing and grouped by next step", () => {
    const copy = terminalLabObservationActionCopy();

    expect(copy.drawerTitle).toBe("Observation Next Steps");
    expect(copy.statusGroup).toBe("Status");
    expect(copy.approvalGroup).toBe("Approval");
    expect(copy.connectGroup).toBe("Connect");
    expect(copy.receiptGroup).toBe("Teach + Receipt");
    expect(copy.approvalButton).toBe("Approval Read");
    expect(copy.selectedLinkButton).toBe("Link Selected");
    expect(copy.teachButton).toBe("Aang Teach");
    expect(copy.saveReceiptButton).toBe("Receipt Body");
    expect(copy.ledgerButton).toBe("Ledger");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("output");
    expect(copy.approvalGroup).not.toBe("Gate");
  });
});
