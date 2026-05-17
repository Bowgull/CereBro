import { describe, expect, it } from "vitest";
import {
  workbenchBrowserShellModel,
  workbenchWatchShelfModel,
} from "../client/src/lib/workbenchBrowserModel";

describe("workbenchBrowserModel", () => {
  it("keeps the Browser V1 shell honest and low machinery", () => {
    const shell = workbenchBrowserShellModel();
    const combined = JSON.stringify(shell).toLowerCase();

    expect(shell.title).toBe("Browser");
    expect(shell.status).toBe("Manual browsing");
    expect(shell.tabs.map((tab) => tab.label)).toEqual(["Tab 1", "New Tab"]);
    expect(shell.actions.map((action) => action.label)).toEqual([
      "Add to Watch",
      "Save to Sources",
      "Attach to Workbench",
      "Annotate",
      "Pin to Project",
      "Explain with Aang",
      "Copy Link",
    ]);
    expect(shell.actions.every((action) => action.enabled === false)).toBe(true);
    expect(shell.safetyLabel).toBe("quiet shield");
    expect(shell.emptyTitle).toBe("Open a page.");
    expect(shell.noActionText).toContain("No browser automation");
    expect(combined).not.toContain("manual browser button");
    expect(combined).not.toContain("profile");
    expect(combined).not.toContain("search tab");
    expect(combined).not.toContain("route chain");
    expect(combined).not.toContain("youtube");
    expect(combined).not.toContain("reddit");
    expect(combined).not.toContain("anime search");
    expect(combined).not.toContain("streaming progress");
  });

  it("keeps Watch Shelf as a drawer model, not a tab or fake service", () => {
    const shelf = workbenchWatchShelfModel();
    const combined = JSON.stringify(shelf).toLowerCase();

    expect(shelf.title).toBe("Watch Shelf");
    expect(shelf.categories).toEqual(["Watching", "Want", "YouTube", "Twitch", "Anime", "Finished"]);
    expect(shelf.emptyTitle).toBe("Nothing saved yet.");
    expect(shelf.emptyAction).toBe("Add current page");
    expect(shelf.rows).toEqual([]);
    expect(shelf.noActionText).toContain("No fake progress");
    expect(combined).not.toContain("resume");
    expect(combined).not.toContain("profile");
    expect(combined).not.toContain("download");
  });
});
