export type WorkbenchBrowserAction = {
  label: string;
  enabled: boolean;
  plannedReason: string;
};

export type WorkbenchBrowserTab = {
  label: string;
  active: boolean;
};

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
