import { describe, expect, it } from "vitest";
import { workbenchReceiptBodyCopy, workbenchReceiptGroupCopy } from "../client/src/lib/workbenchCopyModel";

describe("workbenchCopyModel", () => {
  it("names the primary Workbench form as a receipt body", () => {
    const copy = workbenchReceiptBodyCopy({ hasDraft: false });

    expect(copy.title).toBe("Receipt Body");
    expect(copy.subtitle).toBe("Local body. Review, link, save.");
    expect(copy.badge).toBe("local only");
  });

  it("uses plain staged-draft copy without machinery language", () => {
    const copy = workbenchReceiptBodyCopy({ hasDraft: true });

    expect(copy.draftPrefix).toBe("Body draft.");
    expect(copy.draftText).toBe("Review it, then save the local receipt.");
  });

  it("keeps receipt grouping plain and out of proof language", () => {
    const copy = workbenchReceiptGroupCopy();

    expect(copy.title).toBe("Receipt Groups");
    expect(copy.subtitle).toBe("Narrow the local list.");
    expect(copy.controlLabel).toBe("Group by");
    expect(copy.emptyText).toBe("No receipt groups match the current filters.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("query proof");
  });
});
