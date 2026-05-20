import { describe, expect, it } from "vitest";
import {
  workbenchBrowserActionPreviewModel,
  workbenchBrowserDraftModel,
  workbenchBrowserReadinessModel,
  workbenchBrowserRunnerContractModel,
  workbenchBrowserPrimaryActionCopy,
  workbenchBrowserSessionStorageContractModel,
  workbenchBrowserShellModel,
  workbenchBrowserProjectPinsModel,
  workbenchBrowserTabStateModel,
  workbenchBrowserLocalNavigationStateModel,
  workbenchBrowserOpenGateCopy,
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
    expect(urlDraft.targetUrl).toBe("https://example.com/path?q=1");
    expect(urlDraft.tabLabel).toBe("Page Draft");
    expect(urlDraft.canOpen).toBe(false);
    expect(urlDraft.noActionText).toContain("No browser automation");

    expect(searchDraft.kind).toBe("search");
    expect(searchDraft.displayTarget).toBe("best dub anime sources");
    expect(searchDraft.targetUrl).toBe("https://www.google.com/search?q=best+dub+anime+sources");
    expect(searchDraft.tabLabel).toBe("Search Draft");
    expect(searchDraft.canOpen).toBe(false);

    expect(emptyDraft.kind).toBe("empty");
    expect(emptyDraft.displayTarget).toBe("No page draft.");
    expect(emptyDraft.targetUrl).toBeNull();
    expect(emptyDraft.tabLabel).toBe("Tab 1");
  });

  it("normalizes bare domains into openable https targets", () => {
    const draft = workbenchBrowserDraftModel("example.com/watch/episode-1");

    expect(draft.kind).toBe("url");
    expect(draft.displayTarget).toBe("example.com/watch/episode-1");
    expect(draft.targetUrl).toBe("https://example.com/watch/episode-1");
  });

  it("keeps the primary Browser action user-facing instead of receipt-facing", () => {
    const idle = workbenchBrowserPrimaryActionCopy({
      draftKind: "url",
      isPreparing: false,
    });
    const pending = workbenchBrowserPrimaryActionCopy({
      draftKind: "url",
      isPreparing: true,
    });
    const empty = workbenchBrowserPrimaryActionCopy({
      draftKind: "empty",
      isPreparing: false,
    });
    const combined = JSON.stringify([idle, pending, empty]).toLowerCase();

    expect(idle.label).toBe("Open");
    expect(pending.label).toBe("Opening");
    expect(empty.label).toBe("Open");
    expect(idle.disabled).toBe(false);
    expect(pending.disabled).toBe(true);
    expect(empty.disabled).toBe(true);
    expect(idle.ariaLabel).toBe("Prepare browser page open");
    expect(idle.title).toContain("approval package");
    expect(combined).not.toContain("stage");
    expect(combined).not.toContain("receipt");
  });

  it("keeps Browser open-gate machinery behind proof copy", () => {
    const blocked = workbenchBrowserOpenGateCopy({
      hasProposal: true,
      canOpenPage: false,
      isLoading: false,
      nextAction: "Live runner remains blocked until explicit live-runner approval exists.",
    });
    const ready = workbenchBrowserOpenGateCopy({
      hasProposal: true,
      canOpenPage: true,
      isLoading: false,
      nextAction: "All gates present.",
    });
    const empty = workbenchBrowserOpenGateCopy({
      hasProposal: false,
      canOpenPage: false,
      isLoading: false,
      nextAction: null,
    });
    const visible = JSON.stringify([blocked.visibleTitle, blocked.visibleStatus, blocked.visibleBody, ready.visibleStatus, empty.visibleBody]).toLowerCase();

    expect(blocked.visibleTitle).toBe("Page permission");
    expect(blocked.visibleStatus).toBe("Needs approval");
    expect(blocked.primaryActionLabel).toBe("Open Page");
    expect(blocked.proofLabel).toBe("Proof");
    expect(ready.visibleStatus).toBe("Ready");
    expect(empty.visibleBody).toBe("Enter a page before permission is checked.");
    expect(visible).not.toContain("runner");
    expect(visible).not.toContain("proposal");
    expect(visible).not.toContain("gate");
    expect(visible).not.toContain("receipt");
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

  it("reads tab state without creating or opening browser tabs", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path");
    const emptyDraft = workbenchBrowserDraftModel("");

    const urlTabs = workbenchBrowserTabStateModel(urlDraft);
    const emptyTabs = workbenchBrowserTabStateModel(emptyDraft);

    expect(urlTabs.activeLabel).toBe("Tab 1");
    expect(urlTabs.visibleTabs.map((tab) => tab.label)).toEqual(["Tab 1", "New Tab", "Page Draft"]);
    expect(urlTabs.visibleTabs.at(-1)?.state).toBe("draft");
    expect(urlTabs.canCreateTab).toBe(false);
    expect(urlTabs.tabSummary).toContain("Draft tab is staged");
    expect(urlTabs.noActionText).toContain("No browser tab");

    expect(emptyTabs.visibleTabs.map((tab) => tab.label)).toEqual(["Tab 1", "New Tab"]);
    expect(emptyTabs.tabSummary).toBe("Tab 1 is the only active local page frame.");
    expect(emptyTabs.canCreateTab).toBe(false);
  });

  it("finds real local browser history targets without pretending duplicate rows are navigation", () => {
    const historyItems = [
      {
        id: 3,
        proposalId: 30,
        targetUrl: "https://example.com/episode-2",
        title: "Episode 2",
        createdAt: 300,
      },
      {
        id: 2,
        proposalId: 20,
        targetUrl: "https://example.com/episode-1",
        title: "Episode 1 duplicate open",
        createdAt: 200,
      },
      {
        id: 1,
        proposalId: 10,
        targetUrl: "https://example.com/episode-1",
        title: "Episode 1",
        createdAt: 100,
      },
    ];

    const current = workbenchBrowserLocalNavigationStateModel(historyItems, 30);
    const duplicateOnly = workbenchBrowserLocalNavigationStateModel(historyItems.slice(1), 20);

    expect(current.current?.targetUrl).toBe("https://example.com/episode-2");
    expect(current.backTarget?.targetUrl).toBe("https://example.com/episode-1");
    expect(current.backTarget?.proposalId).toBe(20);
    expect(current.forwardTarget).toBeNull();
    expect(current.canGoBack).toBe(true);
    expect(current.canGoForward).toBe(false);

    expect(duplicateOnly.current?.targetUrl).toBe("https://example.com/episode-1");
    expect(duplicateOnly.backTarget).toBeNull();
    expect(duplicateOnly.canGoBack).toBe(false);
  });

  it("turns real project records into Browser pins without fake bookmarks", () => {
    const pins = workbenchBrowserProjectPinsModel([
      {
        name: "CereBro",
        localPath: "/Users/lindsaybell/Desktop/CereBro",
        localExists: true,
        git: { statusText: "dirty" },
      },
      {
        name: "Missing App",
        localPath: "/Users/lindsaybell/Developer/Missing",
        localExists: false,
        git: { statusText: "unavailable" },
      },
    ]);

    expect(pins.title).toBe("Project pins");
    expect(pins.canOpen).toBe(false);
    expect(pins.items).toEqual([
      {
        label: "CereBro",
        target: "/Users/lindsaybell/Desktop/CereBro",
        statusLabel: "dirty",
      },
    ]);
    expect(pins.noActionText).toContain("No bookmark defaults");
    expect(JSON.stringify(pins).toLowerCase()).not.toContain("youtube");
    expect(JSON.stringify(pins).toLowerCase()).not.toContain("reddit");
  });

  it("reads blocked page action previews without running page actions", () => {
    const shell = workbenchBrowserShellModel();
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path");
    const emptyDraft = workbenchBrowserDraftModel("");

    const watchPreview = workbenchBrowserActionPreviewModel(shell.actions[0], urlDraft);
    const emptyPreview = workbenchBrowserActionPreviewModel(shell.actions[1], emptyDraft);

    expect(watchPreview.label).toBe("Add to Watch");
    expect(watchPreview.targetLabel).toBe("https://example.com/path");
    expect(watchPreview.canPropose).toBe(false);
    expect(watchPreview.statusLabel).toBe("blocked");
    expect(watchPreview.routeLabel).toBe("Needs runner and approval contract.");
    expect(watchPreview.noActionText).toContain("No page action");

    expect(emptyPreview.label).toBe("Save to Sources");
    expect(emptyPreview.targetLabel).toBe("No page draft.");
    expect(emptyPreview.statusLabel).toBe("no page");
    expect(emptyPreview.canPropose).toBe(false);
  });

  it("reads browser readiness without granting runner access", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path");
    const emptyDraft = workbenchBrowserDraftModel("");

    const urlReadiness = workbenchBrowserReadinessModel(urlDraft);
    const emptyReadiness = workbenchBrowserReadinessModel(emptyDraft);

    expect(urlReadiness.statusLabel).toBe("runner blocked");
    expect(urlReadiness.pageStateLabel).toBe("draft staged");
    expect(urlReadiness.canOpen).toBe(false);
    expect(urlReadiness.canRunAutomation).toBe(false);
    expect(urlReadiness.requiredGates).toEqual([
      "Runner contract",
      "Approval receipt",
      "Spock gate",
      "Workbench body",
    ]);
    expect(urlReadiness.noActionText).toContain("No browser runner");

    expect(emptyReadiness.pageStateLabel).toBe("no page");
    expect(emptyReadiness.canOpen).toBe(false);
    expect(emptyReadiness.canRunAutomation).toBe(false);
  });

  it("defines the manual browser runner contract without granting runner access", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path");
    const emptyDraft = workbenchBrowserDraftModel("");

    const urlContract = workbenchBrowserRunnerContractModel(urlDraft);
    const emptyContract = workbenchBrowserRunnerContractModel(emptyDraft);

    expect(urlContract.mode).toBe("manual_browser_runner_contract");
    expect(urlContract.statusLabel).toBe("contract blocked");
    expect(urlContract.canOpenPage).toBe(false);
    expect(urlContract.canFetchPage).toBe(false);
    expect(urlContract.canPersistHistory).toBe(false);
    expect(urlContract.targetLabel).toBe("https://example.com/path");
    expect(urlContract.allowedManualActions).toContain("Open one user-entered URL after runner contract approval.");
    expect(urlContract.blockedActions).toContain("No credential entry.");
    expect(urlContract.requiredReceipts).toContain("Runner contract receipt");
    expect(urlContract.noActionText).toContain("No browser page opens");

    expect(emptyContract.targetLabel).toBe("No page draft.");
    expect(emptyContract.pageStateLabel).toBe("no page");
    expect(emptyContract.requiredReceipts).toContain("Page draft");
  });

  it("defines Browser tab and session storage without persisting real browsing state", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path");
    const emptyDraft = workbenchBrowserDraftModel("");

    const urlStorage = workbenchBrowserSessionStorageContractModel(urlDraft);
    const emptyStorage = workbenchBrowserSessionStorageContractModel(emptyDraft);

    expect(urlStorage.mode).toBe("manual_browser_session_storage_contract");
    expect(urlStorage.statusLabel).toBe("storage blocked");
    expect(urlStorage.canPersistTabs).toBe(false);
    expect(urlStorage.canPersistHistory).toBe(false);
    expect(urlStorage.canPersistCookies).toBe(false);
    expect(urlStorage.activeDraftLabel).toBe("https://example.com/path");
    expect(urlStorage.storageShape.requiredFields).toContain("tab_id");
    expect(urlStorage.storageShape.requiredFields).toContain("target_url");
    expect(urlStorage.blockedState).toContain("No cookies.");
    expect(urlStorage.noActionText).toContain("No tab session");

    expect(emptyStorage.activeDraftLabel).toBe("No page draft.");
    expect(emptyStorage.requiredBeforePersist).toContain("Page draft");
  });
});
