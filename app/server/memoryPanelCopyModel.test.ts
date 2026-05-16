import { describe, expect, it } from "vitest";
import { memoryPanelCopy } from "../client/src/lib/memoryPanelCopyModel";

describe("memoryPanelCopyModel", () => {
  it("frames memory as knowledge notes without truth or receipt language", () => {
    const copy = memoryPanelCopy();
    const combined = [
      copy.title,
      copy.subtitle,
      copy.inputPlaceholder,
      copy.stageTitleReady,
      copy.deleteDialogTitle,
      copy.deleteDialogDescription,
      copy.confirmDeleteTitle,
    ].join(" ").toLowerCase();

    expect(copy.title).toBe("Knowledge Notes");
    expect(copy.subtitle).toContain("Oak review");
    expect(copy.stats.trusted).toBe("Ready");
    expect(copy.routingTitle).toBe("Note Routing");
    expect(combined).not.toContain("truth");
    expect(combined).not.toContain("receipt");
    expect(combined).not.toContain("ledger");
  });
});
