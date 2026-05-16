import { describe, expect, it } from "vitest";
import { projectLabGuideCopy, projectLabPushCopy, projectLabReceiptCopy } from "../client/src/lib/projectLabCopyModel";

describe("projectLabCopyModel", () => {
  it("names the local rule drawer as a project map guide", () => {
    const closed = projectLabGuideCopy({ receiptsOpen: false });
    const open = projectLabGuideCopy({ receiptsOpen: true });

    expect(closed.title).toBe("Project Map");
    expect(closed.status).toBe("open to read");
    expect(open.status).toBe("local bodies");
    expect(Object.values(closed).join(" ").toLowerCase()).not.toContain("rules");
    expect(Object.values(closed).join(" ").toLowerCase()).not.toContain("proof");
  });

  it("keeps receipt copy plain and local", () => {
    const closed = projectLabReceiptCopy({ receiptsOpen: false });
    const open = projectLabReceiptCopy({ receiptsOpen: true });

    expect(closed.cardLabel).toBe("open to read");
    expect(open.cardLabel).toBe("bodies loaded");
    expect(closed.closedValue).toBe("open to read");
    expect(closed.closedPushText).toContain("Project Map");
    expect(closed.closedPushText).not.toContain("Project Rules");
    expect(open.chainTerminalLabel).toBe("Terminal read");
    expect(open.chainTerminalValue(2)).toBe("2 command notes");
    expect(open.chainBodyValue(3, 1)).toBe("3 bodies / 1 review");
    expect(open.metaLabel).toBe("Bodies");
    expect(open.metaValue(3, 1)).toBe("3 bodies / 1 review");
    expect(open.chainAria).toBe("Project Lab context path");
  });

  it("keeps push decision copy plain and non-executing", () => {
    const copy = projectLabPushCopy();

    expect(copy.buttonTitle).toBe("Push Decision");
    expect(copy.detailsTitle).toBe("Decision Details");
    expect(copy.manualBlockTitle).toBe("Manual Commands");
    expect(copy.noBodyText("Push branch")).toBe("No Workbench body is linked yet. Push branch is only a local status read until a body exists.");
    expect(copy.reviewText(2)).toContain("Workbench bodies need review");
    expect(copy.supportedText(1, "Push branch")).toContain("checked body support push branch");
    expect(copy.presentText(2)).toBe("2 bodies exist. Use Workbench for bodies and Ledger for the audit trail.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("readiness");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("git-state");
  });
});
