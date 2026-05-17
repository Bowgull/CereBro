export type WorkbenchBrowserAction = {
  label: string;
  enabled: boolean;
  plannedReason: string;
};

export type WorkbenchBrowserTab = {
  label: string;
  active: boolean;
};

export type WorkbenchBrowserDraft = {
  kind: "empty" | "url" | "search";
  raw: string;
  displayTarget: string;
  tabLabel: string;
  canOpen: boolean;
  noActionText: string;
};

export type WorkbenchWatchShelfDraft = {
  selectedCategory: string;
  candidateLabel: "No open page" | "Page draft" | "Search draft";
  candidateTarget: string;
  canSave: boolean;
  saveLabel: string;
  noActionText: string;
};

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(value);
}

export function workbenchBrowserDraftModel(value: string): WorkbenchBrowserDraft {
  const raw = value.trim();
  if (!raw) {
    return {
      kind: "empty",
      raw: "",
      displayTarget: "No page draft.",
      tabLabel: "Tab 1",
      canOpen: false,
      noActionText: "No browser automation, page fetch, search, source save, Workbench capture, or external write runs from an empty draft.",
    };
  }

  const kind = looksLikeUrl(raw) ? "url" : "search";
  return {
    kind,
    raw,
    displayTarget: raw,
    tabLabel: kind === "url" ? "Page Draft" : "Search Draft",
    canOpen: false,
    noActionText: "No browser automation, page fetch, search request, credential action, file transfer, source save, Workbench capture, or external write runs from this draft.",
  };
}

export function workbenchBrowserShellModel() {
  return {
    title: "Browser",
    status: "Manual browsing",
    addressPlaceholder: "Search or enter address.",
    safetyLabel: "quiet shield",
    tabs: [
      { label: "Tab 1", active: true },
      { label: "New Tab", active: false },
    ] satisfies WorkbenchBrowserTab[],
    actions: [
      { label: "Add to Watch", enabled: false, plannedReason: "Planned until Watch Shelf storage exists." },
      { label: "Save to Sources", enabled: false, plannedReason: "Planned until source capture contract exists." },
      { label: "Attach to Workbench", enabled: false, plannedReason: "Planned until page capture contract exists." },
      { label: "Annotate", enabled: false, plannedReason: "Planned until browser annotation contract exists." },
      { label: "Pin to Project", enabled: false, plannedReason: "Planned until project pin storage exists." },
      { label: "Explain with Aang", enabled: false, plannedReason: "Planned until page context can route safely." },
      { label: "Copy Link", enabled: false, plannedReason: "Planned until a real page is open." },
    ] satisfies WorkbenchBrowserAction[],
    emptyTitle: "Open a page.",
    emptyBody: "Use the address field when the manual browser runner is wired. This first pass locks the shell and disabled actions.",
    noActionText: "No browser automation, page fetch, credential action, file transfer, source save, Workbench capture, or external write runs from this shell.",
  };
}

export function workbenchWatchShelfModel() {
  return {
    title: "Watch Shelf",
    categories: ["Watching", "Want", "YouTube", "Twitch", "Anime", "Finished"],
    rows: [] as Array<{ title: string; sourceNote: string; actionLabel: "Open" | "Resume" }>,
    emptyTitle: "Nothing saved yet.",
    emptyBody: "Save the current page after the manual browser runner and shelf storage are wired.",
    emptyAction: "Add current page",
    noActionText: "No fake progress, service session, thumbnail, platform state, media file action, or source search is created here.",
  };
}

export function workbenchWatchShelfDraftModel(
  draft: WorkbenchBrowserDraft,
  selectedCategory: string,
): WorkbenchWatchShelfDraft {
  const noActionText = "No fake progress, service session, thumbnail, platform state, media file action, source search, or durable save is created from this drawer.";

  if (draft.kind === "empty") {
    return {
      selectedCategory,
      candidateLabel: "No open page",
      candidateTarget: "Open a page before saving to Watch Shelf.",
      canSave: false,
      saveLabel: "Add current page",
      noActionText,
    };
  }

  return {
    selectedCategory,
    candidateLabel: draft.kind === "url" ? "Page draft" : "Search draft",
    candidateTarget: draft.displayTarget,
    canSave: false,
    saveLabel: "Save after page opens",
    noActionText,
  };
}
