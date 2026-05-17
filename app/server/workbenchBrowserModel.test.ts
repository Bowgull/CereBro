import { describe, expect, it } from "vitest";
import {
  workbenchBrowserDraftModel,
  workbenchBrowserShellModel,
  workbenchWatchShelfDraftModel,
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

  it("reads an address draft without opening or fetching the page", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path?q=1");
    const searchDraft = workbenchBrowserDraftModel("best dub anime sources");
    const emptyDraft = workbenchBrowserDraftModel("   ");

    expect(urlDraft.kind).toBe("url");
    expect(urlDraft.displayTarget).toBe("https://example.com/path?q=1");
    expect(urlDraft.tabLabel).toBe("Page Draft");
    expect(urlDraft.canOpen).toBe(false);
    expect(urlDraft.noActionText).toContain("No browser automation");

    expect(searchDraft.kind).toBe("search");
    expect(searchDraft.displayTarget).toBe("best dub anime sources");
    expect(searchDraft.tabLabel).toBe("Search Draft");
    expect(searchDraft.canOpen).toBe(false);

    expect(emptyDraft.kind).toBe("empty");
    expect(emptyDraft.displayTarget).toBe("No page draft.");
    expect(emptyDraft.tabLabel).toBe("Tab 1");
  });

  it("reads Watch Shelf draft state without saving fake media state", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/watch/episode-1");
    const searchDraft = workbenchBrowserDraftModel("dub anime to watch");
    const emptyDraft = workbenchBrowserDraftModel("");

    const urlShelf = workbenchWatchShelfDraftModel(urlDraft, "Anime");
    const searchShelf = workbenchWatchShelfDraftModel(searchDraft, "Want");
    const emptyShelf = workbenchWatchShelfDraftModel(emptyDraft, "Watching");

    expect(urlShelf.selectedCategory).toBe("Anime");
    expect(urlShelf.candidateLabel).toBe("Page draft");
    expect(urlShelf.candidateTarget).toBe("https://example.com/watch/episode-1");
    expect(urlShelf.canSave).toBe(false);
    expect(urlShelf.saveLabel).toBe("Save after page opens");
    expect(urlShelf.noActionText).toContain("No fake progress");

    expect(searchShelf.selectedCategory).toBe("Want");
    expect(searchShelf.candidateLabel).toBe("Search draft");
    expect(searchShelf.candidateTarget).toBe("dub anime to watch");
    expect(searchShelf.canSave).toBe(false);

    expect(emptyShelf.candidateLabel).toBe("No open page");
    expect(emptyShelf.candidateTarget).toBe("Open a page before saving to Watch Shelf.");
    expect(emptyShelf.canSave).toBe(false);
  });
});
