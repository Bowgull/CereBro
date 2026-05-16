import { describe, expect, it } from "vitest";
import { sessionHistoryCopy } from "../client/src/lib/sessionHistoryCopyModel";

describe("sessionHistoryCopyModel", () => {
  it("frames run history as audit trail without proof or raw session language", () => {
    const copy = sessionHistoryCopy();
    const combined = [
      copy.title,
      copy.subtitle,
      copy.loadingText,
      copy.emptyText,
      ...Object.values(copy.columns),
      copy.editTitle,
      copy.saveTitle,
    ].join(" ").toLowerCase();

    expect(copy.title).toBe("Run History");
    expect(copy.subtitle).toContain("Local audit trail");
    expect(copy.columns.agent).toBe("Agent");
    expect(copy.columns.run).toBe("Run");
    expect(copy.columns.actions).toBe("Actions");
    expect(combined).not.toContain("prove");
    expect(combined).not.toContain("class");
    expect(combined).not.toContain("session rows");
    expect(combined).not.toContain("claude code");
  });
});
