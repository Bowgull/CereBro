import { describe, expect, it } from "vitest";
import { projectLabGuideCopy, projectLabReceiptCopy } from "../client/src/lib/projectLabCopyModel";

describe("projectLabCopyModel", () => {
  it("names the local rule drawer as a project map guide", () => {
    const closed = projectLabGuideCopy({ receiptsOpen: false });
    const open = projectLabGuideCopy({ receiptsOpen: true });

    expect(closed.title).toBe("Project Map");
    expect(closed.status).toBe("open to read");
    expect(open.status).toBe("local receipts");
    expect(Object.values(closed).join(" ").toLowerCase()).not.toContain("rules");
    expect(Object.values(closed).join(" ").toLowerCase()).not.toContain("proof");
  });

  it("keeps receipt copy plain and local", () => {
    const closed = projectLabReceiptCopy({ receiptsOpen: false });
    const open = projectLabReceiptCopy({ receiptsOpen: true });

    expect(closed.cardLabel).toBe("open to read");
    expect(open.cardLabel).toBe("receipts loaded");
    expect(closed.closedValue).toBe("open to read");
    expect(closed.closedPushText).toContain("Project Map");
    expect(closed.closedPushText).not.toContain("Project Rules");
  });
});
