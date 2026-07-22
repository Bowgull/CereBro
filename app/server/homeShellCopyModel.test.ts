import { describe, expect, it } from "vitest";
import { homeShellCopy, homeShellNextActionCopy } from "../client/src/lib/homeShellCopyModel";

// Copy locks follow the language-pass glossary (audit item 3, 2026-07-21):
// body → draft · receipt → record · gate → approval. No internal jargon in
// user-facing copy.
describe("homeShellCopyModel", () => {
  it("keeps Workshop and Terminal shell labels aligned to the draft path", () => {
    const copy = homeShellCopy();

    expect(copy.zoneBlurbs.workshop).toBe("Draft, review, and ship work.");
    expect(copy.zoneBlurbs.browser).toBe("Browse with quiet safety.");
    expect(copy.surfaceMeta.browser).toBe("Tabs and pages");
    expect(copy.surfaceMeta.terminal).toBe("Command teaching");
    expect(copy.zoneMarkers.workshop).toEqual(["drafts", "tools", "validation"]);
    expect(copy.zoneMarkers.browser).toEqual(["tabs", "watch", "shield"]);
    expect(copy.zoneMarkerLabel).toBe("surface markers");
    // Glossary guard: internal harness nouns must not appear in shell copy.
    const allShellCopy = [...Object.values(copy.zoneBlurbs), ...Object.values(copy.surfaceMeta)].join(" ").toLowerCase();
    expect(allShellCopy).not.toContain("bodies");
    expect(allShellCopy).not.toContain("receipt");
    expect(allShellCopy).not.toContain("command previews");
  });

  it("keeps context next actions plain and draft-oriented", () => {
    expect(homeShellNextActionCopy("home", 1, "build")).toBe("Open Project Lab to inspect active work and push decisions.");
    expect(homeShellNextActionCopy("browser", 0, "quick")).toBe("Open a page, save it, or ask Aang about it.");
    expect(homeShellNextActionCopy("projects", 0, "build")).toBe("Check branch, uncommitted changes, risks, drafts, and manual push decisions.");
    expect(homeShellNextActionCopy("ledger", 0, "quick")).toBe("Read the history first. Open Workbench for drafts or Project Lab for push context.");
    expect(homeShellNextActionCopy("unknown", 0, "quick")).toBe("Keep the route visible. Workbench holds the draft; the Ledger holds the history.");
  });
});
