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
    expect(shell.status).toBe("Ready");
    expect(shell.tabs.map((tab) => tab.label)).toEqual(["Tab 1", "New Tab"]);
    expect(shell.actions.map((action) => action.label)).toEqual([
      "Add to Watch",
      "Save Page",
      "Attach",
      "Annotate",
      "Pin",
      "Explain",
      "Copy Link",
    ]);
    expect(shell.actions.every((action) => action.enabled === false)).toBe(true);
    expect(shell.safetyLabel).toBe("Shield");
    expect(shell.emptyTitle).toBe("Open a page.");
    expect(shell.noActionText).toBe("No page is open.");
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
    expect(urlDraft.noActionText).toBe("Open this page in CereBro.");

    expect(searchDraft.kind).toBe("search");
    expect(searchDraft.displayTarget).toBe("best dub anime sources");
    expect(searchDraft.targetUrl).toBe("https://search.brave.com/search?q=best+dub+anime+sources");
    expect(searchDraft.tabLabel).toBe("Search Draft");
    expect(searchDraft.canOpen).toBe(false);

    expect(emptyDraft.kind).toBe("empty");
    expect(emptyDraft.displayTarget).toBe("No page draft.");
    expect(emptyDraft.targetUrl).toBeNull();
    expect(emptyDraft.tabLabel).toBe("Tab 1");
  });

  it("routes omnibox search shortcuts without requiring visible engine controls", () => {
    expect(workbenchBrowserDraftModel("!g weird exact error").targetUrl).toBe("https://www.google.com/search?q=weird+exact+error");
    expect(workbenchBrowserDraftModel("!s best hotels near me").targetUrl).toBe("https://www.startpage.com/sp/search?query=best+hotels+near+me");
    expect(workbenchBrowserDraftModel("!d privacy friendly vpn mac").targetUrl).toBe("https://duckduckgo.com/?q=privacy+friendly+vpn+mac");
    expect(workbenchBrowserDraftModel("!gh electron adblock browser").targetUrl).toBe("https://github.com/search?q=electron+adblock+browser&type=repositories");
    expect(workbenchBrowserDraftModel("!r best brave search alternative").targetUrl).toBe("https://www.reddit.com/search/?q=best+brave+search+alternative");
    expect(workbenchBrowserDraftModel("!yt electron browser tutorial").targetUrl).toBe("https://www.youtube.com/results?search_query=electron+browser+tutorial");
    expect(workbenchBrowserDraftModel("!docs electron will-download").targetUrl).toBe("https://search.brave.com/search?q=electron+will-download+official+docs");
    expect(workbenchBrowserDraftModel("!deep best electron browser architecture").targetUrl).toBe("https://search.brave.com/search?q=best+electron+browser+architecture");
  });

  it("keeps Kagi disabled until the user configures it", () => {
    const draft = workbenchBrowserDraftModel("!k electron webcontentsview downloads");

    expect(draft.kind).toBe("search");
    expect(draft.targetUrl).toBeNull();
    expect(draft.displayTarget).toBe("Kagi is not set up.");
    expect(draft.canOpen).toBe(false);
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
    expect(idle.ariaLabel).toBe("Open page in CereBro");
    expect(idle.title).toBe("Open this page in CereBro.");
    expect(combined).not.toContain("stage");
    expect(combined).not.toContain("receipt");
  });

  it("keeps Browser open permission low-machinery", () => {
    const blocked = workbenchBrowserOpenGateCopy({
      hasProposal: true,
      canOpenPage: false,
      isLoading: false,
      nextAction: "Page remains blocked until explicit page approval exists.",
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
    expect(blocked.proofLabel).toBe("Details");
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

  it("reads tab state and allows local tab creation without side effects", () => {
    const urlDraft = workbenchBrowserDraftModel("https://example.com/path");
    const emptyDraft = workbenchBrowserDraftModel("");

    const urlTabs = workbenchBrowserTabStateModel(urlDraft);
    const emptyTabs = workbenchBrowserTabStateModel(emptyDraft);

    expect(urlTabs.activeLabel).toBe("Tab 1");
    expect(urlTabs.visibleTabs.map((tab) => tab.label)).toEqual(["Tab 1", "New Tab", "Page Draft"]);
    expect(urlTabs.visibleTabs.at(-1)?.state).toBe("draft");
    expect(urlTabs.canCreateTab).toBe(true);
    expect(urlTabs.tabSummary).toContain("New page is ready to open.");
    expect(urlTabs.noActionText).toBe("No tab is open.");

    expect(emptyTabs.visibleTabs.map((tab) => tab.label)).toEqual(["Tab 1", "New Tab"]);
    expect(emptyTabs.tabSummary).toBe("Tab 1 is the active page.");
    expect(emptyTabs.canCreateTab).toBe(true);
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
    expect(pins.noActionText).toBe("Project pins are local shortcuts.");
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
    expect(watchPreview.routeLabel).toBe("Needs page permission.");
    expect(watchPreview.noActionText).toBe("Choose a page action.");

    expect(emptyPreview.label).toBe("Save Page");
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
      "Page permission",
      "Safety check",
      "Page record",
    ]);
    expect(urlReadiness.noActionText).toBe("Open a page first.");

    expect(emptyReadiness.pageStateLabel).toBe("no page");
    expect(emptyReadiness.canOpen).toBe(false);
    expect(emptyReadiness.canRunAutomation).toBe(false);
  });

  it("defines the manual browser contract without granting page access", () => {
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
    expect(urlContract.allowedManualActions).toContain("Open one user-entered URL after page permission.");
    expect(urlContract.blockedActions).toContain("No credential entry.");
    expect(urlContract.requiredReceipts).toContain("Page permission");
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
