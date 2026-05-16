import { describe, expect, it } from "vitest";
import { workbenchReceiptBodyCopy } from "../client/src/lib/workbenchCopyModel";

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
});
