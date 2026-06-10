import { describe, expect, it } from "vitest";
import { taskQueueCopy } from "../client/src/lib/taskQueueCopyModel";

describe("taskQueueCopyModel", () => {
  it("frames tasks as a work queue without object or receipt machinery", () => {
    const copy = taskQueueCopy();
    const combined = [
      copy.title,
      copy.subtitle,
      copy.addTitleEmpty,
      copy.addTitleReady,
      copy.loadingText,
      copy.emptyText,
      copy.deleteDialogDescription,
    ].join(" ").toLowerCase();

    expect(copy.title).toBe("Work Queue");
    expect(copy.subtitle).toContain("audit trail");
    expect(copy.addAria).toBe("Add local task");
    expect(copy.deleteDialogDescription).toContain("work queue");
    expect(combined).not.toContain("ledger object");
    expect(combined).not.toContain("task receipt");
    expect(combined).not.toContain("proof");
  });
});
