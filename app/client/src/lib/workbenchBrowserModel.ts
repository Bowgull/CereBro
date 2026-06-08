export type WorkbenchBrowserAction = {
  label: string;
  enabled: boolean;
  plannedReason: string;
};

export type WorkbenchBrowserTab = {
  label: string;
  active: boolean;
  state?: "open" | "planned" | "draft";
};

export type WorkbenchBrowserDraft = {
  kind: "empty" | "url" | "search";
  raw: string;
  displayTarget: string;
  targetUrl: string | null;
  tabLabel: string;
  canOpen: boolean;
  noActionText: string;
};

export type WorkbenchBrowserPrimaryActionCopy = {
  label: "Open" | "Opening";
  disabled: boolean;
  ariaLabel: string;
  title: string;
  pendingNotice: string;
  failureNotice: string;
};

export type WorkbenchBrowserOpenGateCopy = {
  visibleTitle: "Page permission";
  visibleStatus: "No page" | "Needs approval" | "Ready" | "Checking";
  visibleBody: string;
  primaryActionLabel: "Open Page";
  proofLabel: "Details";
};

export type WorkbenchWatchShelfDraft = {
  selectedCategory: string;
  candidateLabel: "No open page" | "Page draft" | "Search draft";
  candidateTarget: string;
  canSave: boolean;
  saveLabel: string;
  noActionText: string;
};

export type WorkbenchBrowserTabState = {
  activeLabel: string;
  visibleTabs: WorkbenchBrowserTab[];
  canCreateTab: boolean;
  tabSummary: string;
  noActionText: string;
};

export type WorkbenchBrowserActionPreview = {
  label: string;
  targetLabel: string;
  canPropose: boolean;
  statusLabel: "no page" | "blocked";
  routeLabel: string;
  noActionText: string;
};

export type WorkbenchBrowserReadiness = {
  statusLabel: "runner blocked";
  pageStateLabel: "no page" | "draft staged";
  canOpen: boolean;
  canRunAutomation: boolean;
  requiredGates: string[];
  noActionText: string;
};

export type WorkbenchBrowserRunnerContract = {
  mode: "manual_browser_runner_contract";
  statusLabel: "contract blocked";
  pageStateLabel: "no page" | "draft staged";
  targetLabel: string;
  canOpenPage: boolean;
  canFetchPage: boolean;
  canPersistHistory: boolean;
  allowedManualActions: string[];
  blockedActions: string[];
  requiredReceipts: string[];
  noActionText: string;
};

export type WorkbenchBrowserSessionStorageContract = {
  mode: "manual_browser_session_storage_contract";
  statusLabel: "storage blocked";
  activeDraftLabel: string;
  canPersistTabs: boolean;
  canPersistHistory: boolean;
  canPersistCookies: boolean;
  storageShape: {
    requiredFields: string[];
    optionalFields: string[];
  };
  requiredBeforePersist: string[];
  blockedState: string[];
  noActionText: string;
};

export type WorkbenchBrowserProjectPin = {
  label: string;
  target: string;
  statusLabel: string;
};

export type WorkbenchBrowserProjectPins = {
  title: "Project pins";
  canOpen: false;
  items: WorkbenchBrowserProjectPin[];
  noActionText: string;
};

export type WorkbenchBrowserLocalHistoryItem = {
  id: number;
  proposalId: number | null;
  targetUrl: string;
  title?: string | null;
  createdAt: number;
};

export type WorkbenchBrowserLocalNavigationState = {
  current: WorkbenchBrowserLocalHistoryItem | null;
  backTarget: WorkbenchBrowserLocalHistoryItem | null;
  forwardTarget: WorkbenchBrowserLocalHistoryItem | null;
  canGoBack: boolean;
  canGoForward: boolean;
};

type BrowserProjectPinInput = {
  name: string;
  localPath: string;
  localExists: boolean;
  git?: {
    statusText?: string | null;
  } | null;
};

type BrowserSearchShortcut = "!g" | "!s" | "!d" | "!k" | "!gh" | "!r" | "!yt" | "!docs" | "!deep";

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^localhost(:\d+)?([/:?#].*)?$/i.test(value) || /^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(value);
}

function encodeSearchQuery(query: string) {
  return encodeURIComponent(query.trim()).replace(/%20/g, "+");
}

function normalizedUrlTarget(raw: string) {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function splitSearchShortcut(raw: string): { shortcut: BrowserSearchShortcut | null; query: string } {
  const match = raw.match(/^(![a-z]+)\s+(.+)$/i);
  if (!match) return { shortcut: null, query: raw };
  const shortcut = match[1].toLowerCase();
  if (!isBrowserSearchShortcut(shortcut)) return { shortcut: null, query: raw };
  return { shortcut, query: match[2].trim() };
}

function isBrowserSearchShortcut(value: string): value is BrowserSearchShortcut {
  return ["!g", "!s", "!d", "!k", "!gh", "!r", "!yt", "!docs", "!deep"].includes(value);
}

function browserSearchTarget(shortcut: BrowserSearchShortcut | null, query: string) {
  const encoded = encodeSearchQuery(query);
  if (!encoded) return null;
  if (shortcut === "!g") return `https://www.google.com/search?q=${encoded}`;
  if (shortcut === "!s") return `https://www.startpage.com/sp/search?query=${encoded}`;
  if (shortcut === "!d") return `https://duckduckgo.com/?q=${encoded}`;
  if (shortcut === "!k") return null;
  if (shortcut === "!gh") return `https://github.com/search?q=${encoded}&type=repositories`;
  if (shortcut === "!r") return `https://www.reddit.com/search/?q=${encoded}`;
  if (shortcut === "!yt") return `https://www.youtube.com/results?search_query=${encoded}`;
  if (shortcut === "!docs") return `https://search.brave.com/search?q=${encodeSearchQuery(`${query} official docs`)}`;
  return `https://search.brave.com/search?q=${encoded}`;
}

export function workbenchBrowserDraftModel(value: string): WorkbenchBrowserDraft {
  const raw = value.trim();
  if (!raw) {
    return {
      kind: "empty",
      raw: "",
      displayTarget: "No page draft.",
      targetUrl: null,
      tabLabel: "Tab 1",
      canOpen: false,
      noActionText: "No browser automation, page fetch, search, source save, Workbench capture, or external write runs from an empty draft.",
    };
  }

  const kind = looksLikeUrl(raw) ? "url" : "search";
  const search = kind === "search" ? splitSearchShortcut(raw) : null;
  const searchTargetUrl = search ? browserSearchTarget(search.shortcut, search.query) : null;
  const searchDisplayTarget = search?.shortcut === "!k" && !searchTargetUrl ? "Kagi is not set up." : (search?.query ?? raw);
  return {
    kind,
    raw,
    displayTarget: kind === "url" ? raw : searchDisplayTarget,
    targetUrl: kind === "url" ? normalizedUrlTarget(raw) : searchTargetUrl,
    tabLabel: kind === "url" ? "Page Draft" : "Search Draft",
    canOpen: false,
    noActionText: "No browser automation, page fetch, search request, credential action, file transfer, source save, Workbench capture, or external write runs from this draft.",
  };
}

export function workbenchBrowserPrimaryActionCopy(input: {
  draftKind: WorkbenchBrowserDraft["kind"];
  isPreparing: boolean;
}): WorkbenchBrowserPrimaryActionCopy {
  return {
    label: input.isPreparing ? "Opening" : "Open",
    disabled: input.draftKind === "empty" || input.isPreparing,
    ariaLabel: "Prepare browser page open",
    title: "Check this page before opening it.",
    pendingNotice: "Checking this page before it opens.",
    failureNotice: "Browser open preparation failed before any page opened.",
  };
}

export function workbenchBrowserOpenGateCopy(input: {
  hasProposal: boolean;
  canOpenPage: boolean;
  isLoading: boolean;
  nextAction: string | null | undefined;
}): WorkbenchBrowserOpenGateCopy {
  if (!input.hasProposal) {
    return {
      visibleTitle: "Page permission",
      visibleStatus: "No page",
      visibleBody: "Enter a page before permission is checked.",
      primaryActionLabel: "Open Page",
      proofLabel: "Details",
    };
  }

  if (input.isLoading) {
    return {
      visibleTitle: "Page permission",
      visibleStatus: "Checking",
      visibleBody: "Checking whether this page can open.",
      primaryActionLabel: "Open Page",
      proofLabel: "Details",
    };
  }

  if (input.canOpenPage) {
    return {
      visibleTitle: "Page permission",
      visibleStatus: "Ready",
      visibleBody: "This page can open here.",
      primaryActionLabel: "Open Page",
      proofLabel: "Details",
    };
  }

  return {
    visibleTitle: "Page permission",
    visibleStatus: "Needs approval",
    visibleBody: "Review the permission step before this page opens.",
    primaryActionLabel: "Open Page",
    proofLabel: "Details",
  };
}

export function workbenchBrowserShellModel() {
  return {
    title: "Browser",
    status: "Ready",
    addressPlaceholder: "Search or enter address.",
    safetyLabel: "Shield",
    tabs: [
      { label: "Tab 1", active: true },
      { label: "New Tab", active: false },
    ] satisfies WorkbenchBrowserTab[],
    actions: [
      { label: "Add to Watch", enabled: false, plannedReason: "Open a page first." },
      { label: "Save Page", enabled: false, plannedReason: "Open a page first." },
      { label: "Attach", enabled: false, plannedReason: "Open a page first." },
      { label: "Annotate", enabled: false, plannedReason: "Open a page first." },
      { label: "Pin", enabled: false, plannedReason: "Open a page first." },
      { label: "Explain", enabled: false, plannedReason: "Open a page first." },
      { label: "Copy Link", enabled: false, plannedReason: "Open a page first." },
    ] satisfies WorkbenchBrowserAction[],
    emptyTitle: "Open a page.",
    emptyBody: "Use the address bar to open a page.",
    noActionText: "No browser automation, page fetch, credential action, file transfer, source save, Workbench capture, or external write runs from this shell.",
  };
}

export function workbenchBrowserTabStateModel(draft: WorkbenchBrowserDraft): WorkbenchBrowserTabState {
  const visibleTabs: WorkbenchBrowserTab[] = [
    { label: "Tab 1", active: true, state: "open" },
    { label: "New Tab", active: false, state: "planned" },
  ];

  if (draft.kind !== "empty") {
    visibleTabs.push({ label: draft.tabLabel, active: false, state: "draft" });
  }

  return {
    activeLabel: "Tab 1",
    visibleTabs,
    canCreateTab: false,
    tabSummary:
      draft.kind === "empty"
        ? "Tab 1 is the active page."
        : "New page is ready to open.",
    noActionText: "No browser tab, page session, history entry, bookmark, source record, service state, or external browser action is created from this tab rail.",
  };
}

export function workbenchBrowserLocalNavigationStateModel(
  historyItems: WorkbenchBrowserLocalHistoryItem[],
  currentProposalId: number | null,
): WorkbenchBrowserLocalNavigationState {
  const ordered = [...historyItems].sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
  let currentIndex = -1;
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    if (ordered[index].proposalId === currentProposalId) {
      currentIndex = index;
      break;
    }
  }
  const current = currentIndex >= 0 ? ordered[currentIndex] : null;

  const findDistinctTarget = (start: number, direction: -1 | 1) => {
    if (!current) return null;
    for (let index = start; index >= 0 && index < ordered.length; index += direction) {
      const item = ordered[index];
      if (item.targetUrl !== current.targetUrl) return item;
    }
    return null;
  };

  const backTarget = findDistinctTarget(currentIndex - 1, -1);
  const forwardTarget = findDistinctTarget(currentIndex + 1, 1);

  return {
    current,
    backTarget,
    forwardTarget,
    canGoBack: backTarget != null,
    canGoForward: forwardTarget != null,
  };
}

export function workbenchBrowserProjectPinsModel(projects: BrowserProjectPinInput[]): WorkbenchBrowserProjectPins {
  return {
    title: "Project pins",
    canOpen: false,
    items: projects
      .filter((project) => project.localExists && project.localPath.trim())
      .slice(0, 5)
      .map((project) => ({
        label: project.name,
        target: project.localPath,
        statusLabel: project.git?.statusText ?? "unread",
      })),
    noActionText: "No bookmark defaults, browser opens, source saves, project writes, or external actions run from project pins.",
  };
}

export function workbenchBrowserActionPreviewModel(
  action: WorkbenchBrowserAction,
  draft: WorkbenchBrowserDraft,
): WorkbenchBrowserActionPreview {
  return {
    label: action.label,
    targetLabel: draft.kind === "empty" ? "No page draft." : draft.displayTarget,
    canPropose: false,
    statusLabel: draft.kind === "empty" ? "no page" : "blocked",
    routeLabel: draft.kind === "empty" ? "Open a page first." : "Needs page permission.",
    noActionText: "No page action, browser automation, page fetch, source save, Workbench capture, shelf save, project pin, explanation route, clipboard write, or external write runs from this preview.",
  };
}

export function workbenchBrowserReadinessModel(draft: WorkbenchBrowserDraft): WorkbenchBrowserReadiness {
  return {
    statusLabel: "runner blocked",
    pageStateLabel: draft.kind === "empty" ? "no page" : "draft staged",
    canOpen: false,
    canRunAutomation: false,
    requiredGates: ["Page permission", "Safety check", "Page record"],
    noActionText: "No browser automation, page fetch, credential action, source save, Workbench capture, download, or outside write is available from this check.",
  };
}

export function workbenchBrowserRunnerContractModel(draft: WorkbenchBrowserDraft): WorkbenchBrowserRunnerContract {
  return {
    mode: "manual_browser_runner_contract",
    statusLabel: "contract blocked",
    pageStateLabel: draft.kind === "empty" ? "no page" : "draft staged",
    targetLabel: draft.kind === "empty" ? "No page draft." : draft.displayTarget,
    canOpenPage: false,
    canFetchPage: false,
    canPersistHistory: false,
    allowedManualActions: [
      "Open one user-entered URL after page permission.",
      "Keep page state local to the manual browser surface.",
      "Record local page state after the page opens.",
    ],
    blockedActions: [
      "No credential entry.",
      "No form submission.",
      "No download.",
      "No source save.",
      "No Workbench capture.",
      "No Watch Shelf save.",
      "No external write.",
    ],
    requiredReceipts: [
      ...(draft.kind === "empty" ? ["Page draft"] : []),
      "Page permission",
      "Safety check",
      "Workbench body",
      "Page state",
      "Recovery note",
    ],
    noActionText: "No browser page opens, fetches, persists history, saves sources, captures Workbench proof, downloads files, enters credentials, or writes outside CereBro from this contract.",
  };
}

export function workbenchBrowserSessionStorageContractModel(draft: WorkbenchBrowserDraft): WorkbenchBrowserSessionStorageContract {
  return {
    mode: "manual_browser_session_storage_contract",
    statusLabel: "storage blocked",
    activeDraftLabel: draft.kind === "empty" ? "No page draft." : draft.displayTarget,
    canPersistTabs: false,
    canPersistHistory: false,
    canPersistCookies: false,
    storageShape: {
      requiredFields: [
        "tab_id",
        "target_url",
        "title",
        "state",
        "created_at",
        "updated_at",
      ],
      optionalFields: [
        "project_id",
        "source_id",
        "workbench_evidence_id",
        "watch_shelf_id",
        "last_error",
      ],
    },
    requiredBeforePersist: [
      ...(draft.kind === "empty" ? ["Page draft"] : []),
      "Page permission",
      "Local tab storage table",
      "Page state",
      "Recovery note",
    ],
    blockedState: [
      "No cookies.",
      "No credentials.",
      "No private session.",
      "No service login state.",
      "No page content cache.",
      "No source save.",
    ],
    noActionText: "No tab session, browser history, cookie jar, credential state, page content, source row, Watch Shelf item, or Workbench capture is persisted from this contract.",
  };
}

export function workbenchWatchShelfModel() {
  return {
    title: "Watch Shelf",
    categories: ["Watching", "Want", "YouTube", "Twitch", "Anime", "Finished"],
    rows: [] as Array<{ title: string; sourceNote: string; actionLabel: "Open" | "Resume" }>,
    emptyTitle: "Nothing saved yet.",
    emptyBody: "Open a page, then save it here.",
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
