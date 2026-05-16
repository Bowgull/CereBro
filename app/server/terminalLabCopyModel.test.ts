import { describe, expect, it } from "vitest";
import { terminalLabProjectReadCopy } from "../client/src/lib/terminalLabCopyModel";

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
    expect(copy.receiptDetailsTitle).toBe("Receipt Read");
    expect(copy.boundaryTitle).toBe("Action Boundary");
    expect(copy.boundaryStateText(false, true)).toBe("Project Lab read only. Git action: no. Approval required: yes.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("push readiness");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("command boundary");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("intent classifier");
  });
});
