import { describe, expect, it } from "vitest";
import { projectLabGuideCopy, projectLabPushCopy, projectLabReceiptCopy } from "../client/src/lib/projectLabCopyModel";

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

  it("keeps push decision copy plain and non-executing", () => {
    const copy = projectLabPushCopy();

    expect(copy.buttonTitle).toBe("Push Decision");
    expect(copy.detailsTitle).toBe("Decision Details");
    expect(copy.manualBlockTitle).toBe("Manual Commands");
    expect(copy.noReceiptText("Push branch")).toBe("No Workbench receipt is linked yet. Push branch is only a local status read until a receipt exists.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("readiness");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("git-state");
  });
});
