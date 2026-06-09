import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, Bookmark, ChevronDown, ChevronUp, Download, ExternalLink, Folder, MoreHorizontal, Paperclip, Pencil, Plus, RotateCw, ShieldCheck, SquareX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cerebroColors as C } from "@/lib/keepConfig";
import { trpc } from "@/lib/trpc";
import type { NativeBrowserPageEvent, NativeBrowserSiteSettings } from "../../../shared/nativeBrowser";
import { nativeVpnUnknownStatus, type NativeVpnStatusResult } from "../../../shared/nativeVpn";
import {
  workbenchBrowserActionPreviewModel,
  workbenchBrowserDraftModel,
  workbenchBrowserLocalNavigationStateModel,
  workbenchBrowserOpenGateCopy,
  workbenchBrowserPrimaryActionCopy,
  workbenchBrowserProjectPinsModel,
  workbenchBrowserShellModel,
  workbenchBrowserTabStateModel,
  workbenchWatchShelfDraftModel,
  workbenchWatchShelfModel,
} from "@/lib/workbenchBrowserModel";

const browserFrame = {
  shell: "linear-gradient(145deg, rgba(7, 13, 12, 0.99), rgba(3, 7, 7, 0.99))",
  rail: "linear-gradient(180deg, rgba(20, 35, 31, 0.98), rgba(6, 13, 12, 0.99))",
  plaque: "linear-gradient(180deg, rgba(28, 45, 38, 0.96), rgba(8, 18, 16, 0.98))",
  plaqueActive: "linear-gradient(180deg, rgba(42, 66, 55, 0.98), rgba(12, 30, 26, 0.98))",
  address: "linear-gradient(180deg, rgba(2, 7, 7, 0.98), rgba(8, 15, 14, 0.98))",
  page: "radial-gradient(circle at 50% 0%, rgba(77, 170, 154, 0.08), transparent 32%), linear-gradient(180deg, rgba(6, 10, 11, 0.99), rgba(2, 5, 6, 0.99))",
  line: "rgba(198, 155, 85, 0.32)",
  lineSoft: "rgba(77, 170, 154, 0.2)",
  bevel: "inset 0 1px 0 rgba(244, 239, 227, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.58)",
  shadow: "0 24px 70px rgba(0, 0, 0, 0.52)",
};

const browserHomePins = [
  { label: "GitHub", target: "https://github.com", domain: "github.com", fallback: "GH" },
  { label: "Obsidian", target: "https://obsidian.md", domain: "obsidian.md", fallback: "O" },
  { label: "YouTube", target: "https://youtube.com", domain: "youtube.com", fallback: "YT" },
  { label: "Reddit", target: "https://reddit.com", domain: "reddit.com", fallback: "R" },
  { label: "Hacker News", target: "https://news.ycombinator.com", domain: "news.ycombinator.com", fallback: "HN" },
];

function faviconUrl(domain: string, size = 64) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

type BrowserRoute = "approvals" | "workbench" | "sources" | "security" | "basement";

type BrowserDraftTab = {
  id: number;
  tabId: string;
  targetUrl: string;
  title: string | null;
  proposalId: number | null;
};

type DailyBrowserTab = {
  id: string;
  title: string | null;
  targetUrl: string | null;
  addressDraft: string;
};

type BrowserDownloadActivity = {
  filename: string;
  state: "downloading" | "saved" | "blocked" | "needs_approval";
  message: string;
};

type BrowserChromeMenu = "bookmarks" | "shield" | "aang" | "pageActions" | "savedBookmarks" | null;

type BrowserAangRoutePreview = {
  aangRead: string;
  ownerAgent: string;
  receipt: {
    summary: string;
  };
};

function browserDraftTabLabel(tab: BrowserDraftTab) {
  const title = tab.title?.trim();
  if (title && !/^open page draft$/i.test(title)) return title;

  try {
    const url = new URL(tab.targetUrl);
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return `${url.hostname}${path}`.slice(0, 34);
  } catch {
    return tab.targetUrl.slice(0, 34) || tab.tabId;
  }
}

function browserOriginLabel(targetUrl: string | null) {
  if (!targetUrl) return "Open page";
  try {
    const url = new URL(targetUrl);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return targetUrl.slice(0, 42) || "Open page";
  }
}

function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: tone, border: `1px solid ${browserFrame.lineSoft}`, background: "rgba(5, 10, 10, 0.72)", boxShadow: browserFrame.bevel }}>
      {label}
    </span>
  );
}

function watchShelfTone(category: string) {
  if (category === "Anime") return C.warning;
  if (category === "Watching") return C.success;
  if (category === "Finished") return C.gold;
  return C.accent;
}

function watchShelfInitial(title: string | null, targetUrl: string) {
  const value = (title ?? targetUrl).trim();
  return (value[0] ?? "W").toUpperCase();
}

function vpnStatusTone(status: NativeVpnStatusResult | null) {
  if (status?.state === "on") return C.success;
  if (status?.state === "checking") return C.gold;
  if (status?.state === "needs_setup" || status?.state === "error") return C.warning;
  return C.textMuted;
}

const vpnSurfaceLabels = {
  on: "VPN On",
  off: "VPN Off",
  checking: "Checking",
  needs_setup: "Needs Setup",
  unknown: "Unknown",
  error: "Unknown",
} satisfies Record<NativeVpnStatusResult["state"], string>;

function vpnStatusLabel(status: NativeVpnStatusResult | null, isBusy: boolean) {
  if (isBusy) return "Checking";
  return status ? vpnSurfaceLabels[status.state] : "Unknown";
}

function vpnPrimaryActionLabel(status: NativeVpnStatusResult | null, isBusy: boolean) {
  if (isBusy) return "Checking";
  if (!status || status.state === "unknown" || status.state === "error") return "Check";
  if (status?.state === "on") return "Turn Off";
  if (status?.state === "needs_setup") return "Set Up";
  return "Turn On";
}

function downloadBlockedMessage(reason: Extract<NativeBrowserPageEvent, { type: "download-blocked" }>["reason"]) {
  if (reason === "automatic_download") return "Blocked";
  if (reason === "multiple_download") return "Blocked";
  return "Needs Approval";
}

function downloadBlockedState(reason: Extract<NativeBrowserPageEvent, { type: "download-blocked" }>["reason"]): BrowserDownloadActivity["state"] {
  return reason === "risky_file" ? "needs_approval" : "blocked";
}

function siteBlockingLabel(settings: NativeBrowserSiteSettings | null) {
  if (settings?.blockingPolicy === "off") return "Blocking Off";
  if (settings?.adBlockEngine === "starting") return "Blocking Starting";
  if (settings?.adBlockEngine === "unavailable") return "Blocking Unavailable";
  return "Blocking Strict";
}

function BrowserHomeStart({
  chatOpen,
  onToggleChat,
  onOpenTarget,
  onAddBookmark,
  aangDraft,
  onAangDraftChange,
  onSubmitAang,
  savedBookmarks,
}: {
  chatOpen: boolean;
  onToggleChat: () => void;
  onOpenTarget: (target: string) => void;
  onAddBookmark: () => void;
  aangDraft: string;
  onAangDraftChange: (value: string) => void;
  onSubmitAang: () => void;
  savedBookmarks: { id: number; targetUrl: string; title: string | null }[];
}) {
  const pinnedTargets = new Set(savedBookmarks.map((bookmark) => bookmark.targetUrl));
  const homePins = [
    ...savedBookmarks.slice(0, 4).map((bookmark) => ({
      key: `bookmark-${bookmark.id}`,
      label: bookmark.title ?? browserOriginLabel(bookmark.targetUrl),
      target: bookmark.targetUrl,
      domain: browserOriginLabel(bookmark.targetUrl),
      saved: true,
    })),
    ...browserHomePins
      .filter((pin) => !pinnedTargets.has(pin.target))
      .map((pin) => ({ key: `default-${pin.label}`, ...pin, saved: false })),
  ].slice(0, 7);

  return (
    <div className="relative min-h-[clamp(520px,68dvh,760px)] overflow-hidden rounded" style={{ background: "radial-gradient(circle at 50% 30%, rgba(214, 158, 67, 0.16), transparent 11%), radial-gradient(circle at 50% 24%, rgba(198, 155, 85, 0.12), transparent 28%), radial-gradient(circle at 88% 12%, rgba(77, 170, 154, 0.08), transparent 28%), linear-gradient(180deg, rgba(7, 13, 12, 0.98), rgba(2, 5, 5, 0.99))", border: `1px solid ${browserFrame.line}`, boxShadow: "inset 0 1px 44px rgba(0, 0, 0, 0.56)" }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 opacity-70" aria-hidden="true" style={{ background: "repeating-radial-gradient(circle at 50% 58%, rgba(198, 155, 85, 0.26) 0 1px, transparent 1px 46px)" }} />
      <div className="pointer-events-none absolute left-3 top-3 h-7 w-7 border-l border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
      <div className="pointer-events-none absolute right-3 top-3 h-7 w-7 border-r border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
      <div className="pointer-events-none absolute bottom-3 left-3 h-7 w-7 border-b border-l" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
      <div className="pointer-events-none absolute bottom-3 right-3 h-7 w-7 border-b border-r" aria-hidden="true" style={{ borderColor: browserFrame.line }} />

      <div className="relative z-10 flex flex-col px-4 pb-28 pt-8 sm:px-6 sm:pt-10">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="mb-4 h-px w-64 max-w-full" aria-hidden="true" style={{ background: `linear-gradient(90deg, transparent, ${browserFrame.line}, transparent)` }} />
          <div className="flex h-12 w-12 items-center justify-center rounded-full" aria-hidden="true" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.line}`, boxShadow: `${browserFrame.bevel}, 0 0 30px rgba(214, 158, 67, 0.22)` }}>
            <ShieldCheck size={18} strokeWidth={1.7} style={{ color: C.gold }} />
          </div>
          <div className="mt-4 text-[28px] font-semibold leading-none sm:text-[34px]" style={{ color: C.textPrimary, fontFamily: "Georgia, serif" }}>
            Where to next?
          </div>
          <div className="mt-2 text-[13px]" style={{ color: C.textSecondary }}>
            Search the web or ask CereBro anything.
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-6xl gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[14px] font-semibold" style={{ color: C.gold }}>Pinned</div>
            <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={onAddBookmark}>
              Add Current
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
            {homePins.map((pin) => (
              <button
                key={pin.key}
                type="button"
                aria-label={`Open bookmark ${pin.label}`}
                title={pin.target}
                className="group relative flex min-h-[104px] flex-col items-center justify-center rounded px-2 py-3 text-center transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                onClick={() => onOpenTarget(pin.target)}
                style={{ background: "linear-gradient(180deg, rgba(13, 20, 18, 0.9), rgba(5, 9, 9, 0.95))", border: `1px solid ${browserFrame.line}`, boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}
              >
                <span className="pointer-events-none absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                <img
                  src={faviconUrl(pin.domain, 96)}
                  alt=""
                  className="h-10 w-10 rounded"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span className="mt-2 max-w-full truncate text-[12px] font-semibold" style={{ color: C.textPrimary }}>{pin.label}</span>
                {pin.saved && <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.gold }}>Saved</span>}
                <span className="absolute bottom-[-5px] h-2.5 w-2.5 rounded-full" aria-hidden="true" style={{ background: C.success, border: `1px solid ${browserFrame.line}`, boxShadow: `0 0 12px ${C.success}66` }} />
              </button>
            ))}
            <button
              type="button"
              aria-label="Add current page bookmark"
              className="relative flex min-h-[104px] flex-col items-center justify-center rounded px-2 py-3 text-center transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={onAddBookmark}
              style={{ background: "linear-gradient(180deg, rgba(13, 20, 18, 0.9), rgba(5, 9, 9, 0.95))", border: `1px solid ${browserFrame.line}`, boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}
            >
              <Plus size={28} strokeWidth={1.6} aria-hidden="true" style={{ color: C.gold }} />
              <span className="mt-2 text-[12px] font-semibold" style={{ color: C.textPrimary }}>Add</span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-7 grid w-full max-w-6xl gap-3 lg:grid-cols-3">
          {[
            ["Continue browsing", "electron / electron", "CereBro Shell", "MDN Web Docs"],
            ["Recent", "Awesome Lists", "Design Systems", "Deep Work"],
            ["Downloads", "CereBro-Setup.dmg", "project-brief.pdf", "notes.zip"],
          ].map(([title, a, b, c]) => (
            <div key={title} className="rounded p-3" style={{ background: "rgba(5, 10, 10, 0.68)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[14px] font-semibold" style={{ color: C.gold }}>{title}</div>
                <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-[10px]">View all</Button>
              </div>
              {[a, b, c].map((item) => {
                const target =
                  item === "MDN Web Docs"
                    ? "https://developer.mozilla.org"
                    : item === "electron / electron"
                      ? "https://github.com/electron/electron"
                      : item === "Awesome Lists"
                        ? "https://github.com/sindresorhus/awesome"
                        : item === "Design Systems"
                          ? "https://www.designsystems.com"
                          : item === "Deep Work"
                            ? "https://en.wikipedia.org/wiki/Deep_Work"
                            : null;
                return (
                  <button key={item} type="button" className="grid w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2 rounded px-1 py-1.5 text-left disabled:cursor-default disabled:opacity-70" disabled={!target} onClick={() => target && onOpenTarget(target)}>
                    <span className="flex h-8 w-8 items-center justify-center rounded text-[10px] font-bold" aria-hidden="true" style={{ background: browserFrame.address, border: `1px solid ${browserFrame.lineSoft}`, color: C.gold }}>{item.slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-semibold" style={{ color: C.textPrimary }}>{item}</span>
                      <span className="block truncate text-[10px]" style={{ color: C.textMuted }}>Local browser memory</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3 z-20 rounded-t-2xl px-3 py-3" style={{ background: "linear-gradient(180deg, rgba(4, 8, 8, 0.9), rgba(2, 5, 5, 0.98))", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: "0 -18px 46px rgba(0, 0, 0, 0.5)" }}>
        <div className={chatOpen ? "grid grid-cols-[74px_minmax(0,1fr)_auto_auto] items-center gap-3" : "grid grid-cols-[74px_minmax(0,1fr)] items-center gap-3"}>
          <button
            type="button"
            aria-label={chatOpen ? "Close Aang chat" : "Open Aang chat"}
            onClick={onToggleChat}
            className="group relative h-[74px] w-[74px] rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            style={{ background: "rgba(8, 14, 13, 0.92)", border: `1px solid ${browserFrame.line}`, boxShadow: `${browserFrame.bevel}, 0 12px 30px rgba(0,0,0,0.36)`, ["--tw-ring-color" as string]: C.accent }}
          >
            <img src="/assets/aang/aang-chat-dock-waist-v1.png" alt="" className="absolute bottom-1 left-1/2 h-[86px] max-w-none -translate-x-1/2 object-contain" />
            <span className="absolute -bottom-2 left-1/2 flex h-5 w-12 -translate-x-1/2 items-center justify-center rounded-full" aria-hidden="true" style={{ background: browserFrame.address, border: `1px solid ${browserFrame.line}`, color: C.gold }}>
              {chatOpen ? <ChevronDown size={13} strokeWidth={2} /> : <ChevronUp size={13} strokeWidth={2} />}
            </span>
          </button>
          {chatOpen ? (
            <>
              <Input
                aria-label="Ask Aang from Browser Home"
                value={aangDraft}
                onChange={(event) => onAangDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  onSubmitAang();
                }}
                placeholder="Ask Aang about this browser session..."
                className="h-12 min-w-0 text-[12px]"
                style={{ background: browserFrame.address, border: `1px solid ${browserFrame.line}`, boxShadow: "inset 0 1px 12px rgba(0, 0, 0, 0.58)" }}
              />
              <Button type="button" size="sm" variant="outline" className="h-12 w-12 px-0" aria-label="Attach image for Aang">
                <Paperclip size={16} strokeWidth={1.8} aria-hidden="true" />
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-12 w-12 px-0" aria-label="Send to Aang" onClick={onSubmitAang}>
                <ArrowRight size={18} strokeWidth={1.9} aria-hidden="true" />
              </Button>
            </>
          ) : (
            <button type="button" onClick={onToggleChat} className="h-12 rounded px-4 text-left text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ background: "rgba(3, 8, 7, 0.56)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, ["--tw-ring-color" as string]: C.accent }}>
              Ask Aang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowserPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: BrowserRoute) => void }) {
  const [browserSurface, setBrowserSurface] = useState<"page" | "watch">("page");
  const [browserAddressDraft, setBrowserAddressDraft] = useState("");
  const [dailyBrowserTabs, setDailyBrowserTabs] = useState<DailyBrowserTab[]>([
    { id: "daily-tab-1", title: "New Tab", targetUrl: null, addressDraft: "" },
  ]);
  const [selectedDailyBrowserTabId, setSelectedDailyBrowserTabId] = useState("daily-tab-1");
  const [browserActionLabel, setBrowserActionLabel] = useState("Add to Watch");
  const [watchShelfCategory, setWatchShelfCategory] = useState("Watching");
  const [selectedBrowserProposalId, setSelectedBrowserProposalId] = useState<number | null>(null);
  const [preparedApprovalId, setPreparedApprovalId] = useState<number | null>(null);
  const [browserNotice, setBrowserNotice] = useState<string | null>(null);
  const [sandboxFrameTarget, setSandboxFrameTarget] = useState<string | null>(null);
  const [sandboxFrameProposalId, setSandboxFrameProposalId] = useState<number | null>(null);
  const [sandboxFrameReloadKey, setSandboxFrameReloadKey] = useState(0);
  const [nativePageActive, setNativePageActive] = useState(false);
  const [vpnStatus, setVpnStatus] = useState<NativeVpnStatusResult | null>(null);
  const [vpnBusy, setVpnBusy] = useState(false);
  const [popupBlockedCount, setPopupBlockedCount] = useState(0);
  const [downloadActivity, setDownloadActivity] = useState<BrowserDownloadActivity | null>(null);
  const [siteSettings, setSiteSettings] = useState<NativeBrowserSiteSettings | null>(null);
  const [editingBookmarkId, setEditingBookmarkId] = useState<number | null>(null);
  const [bookmarkTitleDraft, setBookmarkTitleDraft] = useState("");
  const [browserHomeChatOpen, setBrowserHomeChatOpen] = useState(false);
  const [browserAangDraft, setBrowserAangDraft] = useState("");
  const [localAangRoutePreview, setLocalAangRoutePreview] = useState<BrowserAangRoutePreview | null>(null);
  const [activeBrowserChromeMenu, setActiveBrowserChromeMenu] = useState<BrowserChromeMenu>(null);
  const [nativeViewportHeight, setNativeViewportHeight] = useState(360);
  const nativeViewportRef = useRef<HTMLDivElement | null>(null);
  const utils = trpc.useUtils();
  const projects = trpc.projectIntelligence.overview.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const browserTabSessionStorageContract = trpc.workbench.browserTabSessionStorageContract.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const watchShelfStorageContract = trpc.workbench.watchShelfStorageContract.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const browserBookmarkStorageContract = trpc.workbench.browserBookmarkStorageContract.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const browserAangRoutePreview = trpc.runtime.previewRoute.useMutation({
    onSuccess: (result) => {
      setLocalAangRoutePreview(result);
      setBrowserNotice("Aang read staged.");
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserActionProposal = trpc.workbench.createBrowserActionProposal.useMutation({
    onSuccess: () => {
      utils.workbench.browserActionProposals.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserTabSessionDraft = trpc.workbench.createBrowserTabSessionDraft.useMutation({
    onSuccess: (result) => {
      setSelectedBrowserProposalId(result.tab.proposalId);
      setBrowserNotice(`Tab ready: ${result.tab.tabId}.`);
      utils.workbench.browserTabSessionStorageContract.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserActionApprovalPreview = trpc.workbench.createBrowserActionApprovalPreview.useMutation({
    onSuccess: () => {
      utils.approvals.list.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserActionWorkbenchBody = trpc.workbench.createBrowserActionWorkbenchBody.useMutation({
    onSuccess: () => {
      utils.workbench.evidence.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserActionSpockGate = trpc.workbench.createBrowserActionSpockGate.useMutation({
    onSuccess: () => {
      utils.securityGate.recent.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserResultRecoveryScaffold = trpc.workbench.createBrowserResultRecoveryScaffold.useMutation({
    onSuccess: () => {
      utils.workbench.browserActionProposals.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserLiveRunnerApprovalPreview = trpc.workbench.createBrowserLiveRunnerApprovalPreview.useMutation({
    onSuccess: (result) => {
      setPreparedApprovalId(result.approval?.id ?? null);
      setBrowserNotice(
        result.approval
          ? `Page approval #${result.approval.id} is ready.`
          : "Page approval was not created.",
      );
      if (typeof result.approval?.targetId === "number") {
        utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.approval.targetId });
      }
      utils.approvals.list.invalidate();
      utils.approvals.queue.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const runBrowserLiveRunnerBlocked = trpc.workbench.runBrowserLiveRunnerBlocked.useMutation({
    onSuccess: (result) => {
      setBrowserNotice("Page check blocked this open.");
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.workbench.browserLiveRunnerLaunchGate.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
    },
  });
  const prepareBrowserLiveRunnerOpenReadiness = trpc.workbench.prepareBrowserLiveRunnerOpenReadiness.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Browser tab ${result.tab.tabId} is ready.`
          : `Page is not ready: ${result.missingGates[0] ?? "approval needed"}.`,
      );
      utils.workbench.browserTabSessionStorageContract.invalidate();
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.workbench.browserLiveRunnerLaunchGate.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
    },
  });
  const recordBrowserSandboxFrameOpen = trpc.workbench.recordBrowserSandboxFrameOpen.useMutation({
    onSuccess: (result) => {
      if (result.ok) {
        setSandboxFrameTarget(result.tab.targetUrl);
        setSandboxFrameProposalId(result.proposal.id);
        setNativePageActive(false);
        const nativeBridge = window.cerebroNativeBrowser;
        if (nativeBridge) {
          void nativeBridge.openPage({
            tabId: result.tab.tabId,
            targetUrl: result.tab.targetUrl,
            userInitiated: true,
          }).then((nativeResult) => {
            if (nativeResult.ok) {
              setNativePageActive(true);
              void refreshSiteSettings();
              setBrowserNotice("Page opened in CereBro.");
              return;
            }
            setBrowserNotice("Page blocked. Try again.");
          }).catch(() => {
            setNativePageActive(false);
            setBrowserNotice(`Page opened in ${result.tab.tabId}.`);
          });
        } else {
          setBrowserNotice(`Page opened in ${result.tab.tabId}.`);
        }
      } else {
        setSandboxFrameTarget(null);
        setSandboxFrameProposalId(null);
        setNativePageActive(false);
        setBrowserNotice("Page blocked. Finish permission first.");
      }
      utils.workbench.browserTabSessionStorageContract.invalidate();
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.workbench.browserLiveRunnerLaunchGate.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
    },
  });
  const recordBrowserSandboxFrameFallback = trpc.workbench.recordBrowserSandboxFrameFallback.useMutation({
    onSuccess: (result) => {
      if (result.ok && result.externalUrl) {
        setBrowserNotice("System fallback opened by request. No page content was saved.");
        window.open(result.externalUrl, "_blank", "noopener,noreferrer");
      } else {
        setBrowserNotice("System fallback blocked. Open the page first.");
      }
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.workbench.browserLiveRunnerLaunchGate.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
    },
  });
  const createWatchShelfItemFromOpenTab = trpc.workbench.createWatchShelfItemFromOpenTab.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Saved to Watch Shelf: ${result.item?.title ?? result.item?.targetUrl ?? "current page"}.`
          : "Watch Shelf save blocked. Open the page first.",
      );
      utils.workbench.watchShelfStorageContract.invalidate();
      utils.workbench.browserTabSessionStorageContract.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserBookmarkFromOpenTab = trpc.workbench.createBrowserBookmarkFromOpenTab.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Bookmarked: ${result.bookmark?.title ?? result.bookmark?.targetUrl ?? "current page"}.`
          : "Bookmark blocked. Open the page first.",
      );
      utils.workbench.browserBookmarkStorageContract.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserBookmark = trpc.workbench.createBrowserBookmark.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Bookmarked: ${result.bookmark?.title ?? result.bookmark?.targetUrl ?? "current page"}.`
          : "Bookmark blocked. Open a page first.",
      );
      utils.workbench.browserBookmarkStorageContract.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const removeBrowserBookmark = trpc.workbench.removeBrowserBookmark.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Removed bookmark: ${result.removedBookmark?.title ?? result.removedBookmark?.targetUrl ?? "bookmark"}.`
          : "Bookmark was already gone.",
      );
      utils.workbench.browserBookmarkStorageContract.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const renameBrowserBookmark = trpc.workbench.renameBrowserBookmark.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Renamed bookmark: ${result.bookmark?.title ?? result.bookmark?.targetUrl ?? "bookmark"}.`
          : "Bookmark was already gone.",
      );
      setEditingBookmarkId(null);
      setBookmarkTitleDraft("");
      utils.workbench.browserBookmarkStorageContract.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const recordBrowserSandboxFrameReload = trpc.workbench.recordBrowserSandboxFrameReload.useMutation({
    onSuccess: (result) => {
      if (result.ok) {
        setSandboxFrameReloadKey((key) => key + 1);
        setBrowserNotice(`Page reloaded for ${result.tab.tabId}.`);
      } else {
        setBrowserNotice("Reload blocked. Open the page first.");
      }
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
    },
  });
  const recordNativeBrowserPageEvent = trpc.workbench.recordNativeBrowserPageEvent.useMutation({
    onSuccess: (result) => {
      if (result.ok) {
        utils.workbench.browserTabSessionStorageContract.invalidate();
        utils.ledger.overview.invalidate();
      }
    },
  });

  const browserShell = workbenchBrowserShellModel();
  const browserDraft = workbenchBrowserDraftModel(browserAddressDraft);
  const browserTabState = workbenchBrowserTabStateModel(browserDraft);
  const browserAction =
    browserShell.actions.find((action) => action.label === browserActionLabel) ?? browserShell.actions[0];
  const browserActionPreview = workbenchBrowserActionPreviewModel(browserAction, browserDraft);
  const browserVisibleTabs = (browserTabSessionStorageContract.data?.items ?? [])
    .filter((item) => item.state === "draft" || item.state === "open_ready" || item.state === "open")
    .slice(0, 3);
  const browserHistoryItems = browserTabSessionStorageContract.data?.historyItems ?? [];
  const selectedBrowserTab = browserVisibleTabs.find((tab) => tab.proposalId === selectedBrowserProposalId) ?? null;
  const selectedBrowserHistoryItems = browserHistoryItems.filter((item) => item.proposalId === selectedBrowserProposalId).slice(0, 3);
  const browserLocalNavigation = workbenchBrowserLocalNavigationStateModel(
    browserHistoryItems,
    sandboxFrameProposalId ?? selectedBrowserProposalId,
  );
  const canOpenSandboxFrame = selectedBrowserTab?.state === "open_ready" || selectedBrowserTab?.state === "open";
  const hasOpenSandboxFrame =
    sandboxFrameTarget != null &&
    nativePageActive &&
    (selectedBrowserProposalId == null || sandboxFrameProposalId === selectedBrowserProposalId);
  const browserLiveRunnerPreflight = trpc.workbench.browserLiveRunnerPreflight.useQuery(
    { proposalId: selectedBrowserProposalId ?? 0 },
    {
      enabled: selectedBrowserProposalId != null,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const browserLiveRunnerLaunchGate = trpc.workbench.browserLiveRunnerLaunchGate.useQuery(
    { proposalId: selectedBrowserProposalId ?? 0 },
    {
      enabled: selectedBrowserProposalId != null,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const browserOpenGateCopy = workbenchBrowserOpenGateCopy({
    hasProposal: selectedBrowserProposalId != null,
    canOpenPage: Boolean(browserLiveRunnerPreflight.data?.canOpenPage),
    isLoading: browserLiveRunnerPreflight.isLoading,
    nextAction: browserLiveRunnerPreflight.data?.nextAction,
  });
  const browserProjectPins = workbenchBrowserProjectPinsModel(projects.data?.projects ?? []);
  const watchShelf = workbenchWatchShelfModel();
  const watchShelfDraft = workbenchWatchShelfDraftModel(browserDraft, watchShelfCategory);
  const watchShelfItems = (watchShelfStorageContract.data?.items ?? []).filter(
    (item, index, items) => items.findIndex((candidate) => candidate.targetUrl === item.targetUrl) === index,
  );
  const browserBookmarkItems = (browserBookmarkStorageContract.data?.items ?? []).filter(
    (item, index, items) => items.findIndex((candidate) => candidate.targetUrl === item.targetUrl) === index,
  );
  const selectedDailyBrowserTab = dailyBrowserTabs.find((tab) => tab.id === selectedDailyBrowserTabId) ?? dailyBrowserTabs[0] ?? null;
  const browserMedallions = [
    ...browserBookmarkItems.slice(0, 5).map((bookmark) => ({
      key: `bookmark-${bookmark.id}`,
      label: bookmark.title ?? browserOriginLabel(bookmark.targetUrl),
      target: bookmark.targetUrl,
      domain: browserOriginLabel(bookmark.targetUrl),
      saved: true,
    })),
    ...browserHomePins
      .filter((pin) => !browserBookmarkItems.some((bookmark) => bookmark.targetUrl === pin.target))
      .map((pin) => ({ key: `default-${pin.label}`, label: pin.label, target: pin.target, domain: pin.domain, saved: false })),
  ].slice(0, 8);
  const currentPageTarget = sandboxFrameTarget ?? selectedDailyBrowserTab?.targetUrl ?? browserDraft.targetUrl ?? null;
  const aangRoutePreview = browserAangRoutePreview.data ?? localAangRoutePreview;
  const nativeMenuReserveTop = activeBrowserChromeMenu && hasOpenSandboxFrame ? 320 : 0;
  const toggleBrowserChromeMenu = (menu: Exclude<BrowserChromeMenu, null>) => {
    setActiveBrowserChromeMenu((active) => (active === menu ? null : menu));
  };
  const submitBrowserAangDraft = () => {
    const text = browserAangDraft.trim();
    if (!text || browserAangRoutePreview.isPending) return;
    setLocalAangRoutePreview({
      aangRead: text,
      ownerAgent: "Aang",
      receipt: { summary: "Aang route staged from Browser." },
    });
    browserAangRoutePreview.mutate({ text, mode: "quick" });
  };
  const stageCurrentPageAangAction = (kind: "explain" | "note" | "workshop") => {
    if (!currentPageTarget) {
      setBrowserNotice("Open a page before asking Aang about it.");
      return;
    }
    const title = selectedDailyBrowserTab?.title ?? browserOriginLabel(currentPageTarget);
    const prompt =
      kind === "explain"
        ? `Explain this page for me: ${title} (${currentPageTarget})`
        : kind === "note"
          ? `Turn this page into a short local note: ${title} (${currentPageTarget})`
          : `Send this page to Workshop with context: ${title} (${currentPageTarget})`;
    setBrowserAangDraft(prompt);
    setBrowserHomeChatOpen(true);
    setLocalAangRoutePreview({
      aangRead: prompt,
      ownerAgent: kind === "workshop" ? "Tony Stark" : "Aang",
      receipt: { summary: `${title} staged from the current Browser page.` },
    });
    browserAangRoutePreview.mutate({ text: prompt, mode: kind === "workshop" ? "build" : "quick" });
  };
  const navigateBrowserLocalHistory = (target: typeof browserLocalNavigation.backTarget) => {
    if (!target || target.proposalId == null) {
      setBrowserNotice("No real local Browser history target is available.");
      return;
    }
    setBrowserSurface("page");
    setSelectedBrowserProposalId(target.proposalId);
    setBrowserAddressDraft(target.targetUrl);
    setSandboxFrameTarget(target.targetUrl);
    setSandboxFrameProposalId(target.proposalId);
    setSandboxFrameReloadKey((key) => key + 1);
    setPreparedApprovalId(null);
    setBrowserNotice(`Local history opened ${target.title ?? target.targetUrl}.`);
  };
  const goBack = async () => {
    try {
      const result = await window.cerebroNativeBrowser?.goBack();
      if (result?.ok) {
        setBrowserNotice("Back.");
        return;
      }
    } catch {
      // Fall back to local Browser history below.
    }
    navigateBrowserLocalHistory(browserLocalNavigation.backTarget);
  };
  const goForward = async () => {
    try {
      const result = await window.cerebroNativeBrowser?.goForward();
      if (result?.ok) {
        setBrowserNotice("Forward.");
        return;
      }
    } catch {
      // Fall back to local Browser history below.
    }
    navigateBrowserLocalHistory(browserLocalNavigation.forwardTarget);
  };
  const reloadPage = async () => {
    try {
      const result = await window.cerebroNativeBrowser?.reloadPage();
      if (result?.ok) {
        setBrowserNotice("Reloaded.");
        return;
      }
    } catch {
      // Fall back to the web page receipt below.
    }
    if (selectedBrowserProposalId == null) return;
    recordBrowserSandboxFrameReload.mutate({ proposalId: selectedBrowserProposalId });
  };
  const syncNativeBrowserBounds = useCallback(async () => {
    const element = nativeViewportRef.current;
    const nativeBridge = window.cerebroNativeBrowser;
    if (!element || !nativeBridge) return;
    const rect = element.getBoundingClientRect();
    const left = Math.max(0, rect.left);
    const top = Math.max(0, rect.top);
    const right = Math.min(window.innerWidth, rect.right);
    const bottomLimit = Math.max(top + 1, window.innerHeight - 16);
    const bottom = Math.min(bottomLimit, rect.bottom);
    const height = Math.max(1, bottom - top);
    const reservedTop = Math.min(nativeMenuReserveTop, Math.max(0, height - 180));
    const clippedHeight = Math.max(1, height - reservedTop);
    setNativeViewportHeight(Math.round(clippedHeight));
    await nativeBridge.setBounds({
      x: left,
      y: top + reservedTop,
      width: Math.max(1, right - left),
      height: clippedHeight,
    });
  }, [nativeMenuReserveTop]);
  const openDailyBrowserTarget = async (rawTarget: string) => {
    const draft = workbenchBrowserDraftModel(rawTarget);
    if (draft.kind === "empty" || draft.targetUrl == null) {
      setBrowserNotice("Enter a site or search.");
      return;
    }
    const nativeBridge = window.cerebroNativeBrowser;
    if (!nativeBridge) {
      setBrowserNotice("CereBro Browser is not available in this window.");
      return;
    }

    const targetUrl = draft.targetUrl;
    setBrowserNotice("Opening page.");
    setBrowserSurface("page");
    setSelectedBrowserProposalId(null);
    setPreparedApprovalId(null);
    setSandboxFrameTarget(targetUrl);
    setSandboxFrameProposalId(null);
    setNativePageActive(true);
    setDailyBrowserTabs((tabs) =>
      tabs.map((tab) =>
        tab.id === selectedDailyBrowserTabId
          ? { ...tab, targetUrl, addressDraft: rawTarget, title: browserOriginLabel(targetUrl) }
          : tab,
      ),
    );
    setBrowserAddressDraft(targetUrl);

    try {
      window.requestAnimationFrame(() => {
        void syncNativeBrowserBounds();
      });
      const result = await nativeBridge.openPage({
        tabId: selectedDailyBrowserTabId,
        targetUrl,
        userInitiated: true,
      });
      if (!result.ok) {
        setNativePageActive(false);
        setBrowserNotice("Page blocked.");
        return;
      }
      setNativePageActive(true);
      setSandboxFrameTarget(result.currentUrl ?? targetUrl);
      setDailyBrowserTabs((tabs) =>
        tabs.map((tab) =>
          tab.id === selectedDailyBrowserTabId
            ? {
                ...tab,
                targetUrl: result.currentUrl ?? targetUrl,
                addressDraft: result.currentUrl ?? targetUrl,
                title: result.title ?? browserOriginLabel(result.currentUrl ?? targetUrl),
              }
            : tab,
        ),
      );
      if (result.currentUrl) setBrowserAddressDraft(result.currentUrl);
      await refreshSiteSettings();
      await syncNativeBrowserBounds();
      setBrowserNotice("Page opened in CereBro.");
    } catch {
      setNativePageActive(false);
      setBrowserNotice("Page failed to open.");
    }
  };
  const openDailyBrowserPage = () => openDailyBrowserTarget(browserAddressDraft);
  const saveCurrentBrowserBookmark = () => {
    const targetUrl = sandboxFrameTarget ?? selectedDailyBrowserTab?.targetUrl ?? browserDraft.targetUrl;
    if (!targetUrl) {
      setBrowserNotice("Open a page before adding a bookmark.");
      return;
    }
    createBrowserBookmark.mutate({
      targetUrl,
      title: selectedDailyBrowserTab?.title ?? browserOriginLabel(targetUrl),
    });
  };
  const closeNativeBrowserPage = async () => {
    setSandboxFrameTarget(null);
    setSandboxFrameProposalId(null);
    setNativePageActive(false);
    try {
      await window.cerebroNativeBrowser?.closePage();
    } catch {
      // The web fallback has no native page view to close.
    }
    setBrowserNotice("Returned to Browser.");
  };
  const createDailyBrowserTab = () => {
    const nextTab: DailyBrowserTab = {
      id: `daily-tab-${Date.now()}`,
      title: "New Tab",
      targetUrl: null,
      addressDraft: "",
    };
    setDailyBrowserTabs((tabs) =>
      tabs.map((tab) =>
        tab.id === selectedDailyBrowserTabId
          ? { ...tab, addressDraft: browserAddressDraft, targetUrl: sandboxFrameTarget ?? tab.targetUrl }
          : tab,
      ).concat(nextTab),
    );
    setSelectedDailyBrowserTabId(nextTab.id);
    setSelectedBrowserProposalId(null);
    setPreparedApprovalId(null);
    setSandboxFrameTarget(null);
    setSandboxFrameProposalId(null);
    setNativePageActive(false);
    setBrowserAddressDraft("");
    setBrowserSurface("page");
    setBrowserNotice("New tab.");
  };
  const selectDailyBrowserTab = async (tab: DailyBrowserTab) => {
    setDailyBrowserTabs((tabs) =>
      tabs.map((item) =>
        item.id === selectedDailyBrowserTabId
          ? { ...item, addressDraft: browserAddressDraft, targetUrl: sandboxFrameTarget ?? item.targetUrl }
          : item,
      ),
    );
    setSelectedDailyBrowserTabId(tab.id);
    setSelectedBrowserProposalId(null);
    setPreparedApprovalId(null);
    setBrowserAddressDraft(tab.addressDraft || tab.targetUrl || "");
    setBrowserSurface("page");
    setSandboxFrameProposalId(null);
    if (!tab.targetUrl) {
      setSandboxFrameTarget(null);
      setNativePageActive(false);
      setBrowserNotice("New tab selected.");
      return;
    }
    setSandboxFrameTarget(tab.targetUrl);
    try {
      setNativePageActive(true);
      window.requestAnimationFrame(() => {
        void syncNativeBrowserBounds();
      });
      const result = await window.cerebroNativeBrowser?.openPage({
        tabId: tab.id,
        targetUrl: tab.targetUrl,
        userInitiated: true,
      });
      setNativePageActive(Boolean(result?.ok));
      await syncNativeBrowserBounds();
      await refreshSiteSettings();
      setBrowserNotice("Tab selected.");
    } catch {
      setNativePageActive(false);
      setBrowserNotice("Tab selected.");
    }
  };
  const closeDailyBrowserTab = async (tabId: string, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    const closingIndex = dailyBrowserTabs.findIndex((tab) => tab.id === tabId);
    if (closingIndex < 0) return;

    const closingActive = selectedDailyBrowserTabId === tabId;
    const remainingTabs = dailyBrowserTabs.filter((tab) => tab.id !== tabId);
    if (!closingActive) {
      setDailyBrowserTabs(remainingTabs);
      setBrowserNotice("Tab closed.");
      return;
    }

    const nextTab = remainingTabs[Math.max(0, closingIndex - 1)] ?? remainingTabs[0] ?? null;
    if (!nextTab) {
      const blankTab: DailyBrowserTab = {
        id: `daily-tab-${Date.now()}`,
        title: "New Tab",
        targetUrl: null,
        addressDraft: "",
      };
      setDailyBrowserTabs([blankTab]);
      setSelectedDailyBrowserTabId(blankTab.id);
      setSelectedBrowserProposalId(null);
      setPreparedApprovalId(null);
      setBrowserAddressDraft("");
      setBrowserSurface("page");
      setSandboxFrameTarget(null);
      setSandboxFrameProposalId(null);
      setNativePageActive(false);
      try {
        await window.cerebroNativeBrowser?.closePage();
      } catch {
        // The web fallback has no native page view to close.
      }
      setBrowserNotice("Tab closed.");
      return;
    }

    setDailyBrowserTabs(remainingTabs);
    setSelectedDailyBrowserTabId(nextTab.id);
    setSelectedBrowserProposalId(null);
    setPreparedApprovalId(null);
    setBrowserAddressDraft(nextTab.addressDraft || nextTab.targetUrl || "");
    setBrowserSurface("page");
    setSandboxFrameProposalId(null);
    if (!nextTab.targetUrl) {
      setSandboxFrameTarget(null);
      setNativePageActive(false);
      try {
        await window.cerebroNativeBrowser?.closePage();
      } catch {
        // The web fallback has no native page view to close.
      }
      setBrowserNotice("Tab closed.");
      return;
    }

    setSandboxFrameTarget(nextTab.targetUrl);
    try {
      setNativePageActive(true);
      window.requestAnimationFrame(() => {
        void syncNativeBrowserBounds();
      });
      const result = await window.cerebroNativeBrowser?.openPage({
        tabId: nextTab.id,
        targetUrl: nextTab.targetUrl,
        userInitiated: true,
      });
      setNativePageActive(Boolean(result?.ok));
      await syncNativeBrowserBounds();
      await refreshSiteSettings();
      setBrowserNotice("Tab closed.");
    } catch {
      setNativePageActive(false);
      setBrowserNotice("Tab closed.");
    }
  };
  const checkVpnStatus = async () => {
    setVpnBusy(true);
    try {
      const status = await window.cerebroNativeVpn?.check();
      if (status) {
        setVpnStatus(status);
        return status;
      }
      setVpnStatus(nativeVpnUnknownStatus());
      return null;
    } catch {
      setBrowserNotice("VPN check failed.");
      return null;
    } finally {
      setVpnBusy(false);
    }
  };
  const toggleVpn = async () => {
    setVpnBusy(true);
    try {
      const bridge = window.cerebroNativeVpn;
      if (!bridge) {
        setBrowserNotice("VPN setup is not available in this window.");
        return;
      }
      const result =
        vpnStatus?.state === "on"
          ? await bridge.disconnect()
          : vpnStatus?.state === "needs_setup"
            ? await bridge.openSettings()
            : vpnStatus?.state === "off"
              ? await bridge.connect()
              : { ok: true, action: "status" as const, status: await bridge.check(), message: "VPN checked." };
      setVpnStatus(result.status);
      setBrowserNotice(result.message);
    } catch {
      setBrowserNotice("VPN action failed.");
    } finally {
      setVpnBusy(false);
    }
  };
  const refreshSiteSettings = async () => {
    try {
      const settings = await window.cerebroNativeBrowser?.siteSettings();
      if (settings) setSiteSettings(settings);
      return settings ?? null;
    } catch {
      return null;
    }
  };
  const allowPopupsHere = async () => {
    try {
      const settings = await window.cerebroNativeBrowser?.allowPopupsHere();
      if (settings) {
        setSiteSettings(settings);
        setBrowserNotice(settings.host ? `Popups allowed for ${settings.host}.` : "Open a page before allowing popups.");
      }
    } catch {
      setBrowserNotice("Popup setting failed.");
    }
  };
  const setBlockingForCurrentSite = async (blockingPolicy: NativeBrowserSiteSettings["blockingPolicy"]) => {
    try {
      const settings = await window.cerebroNativeBrowser?.setBlockingForSite({ blockingPolicy });
      if (settings) {
        setSiteSettings(settings);
        setBrowserNotice(settings.host ? `${siteBlockingLabel(settings)} for ${settings.host}.` : "Open a page before changing blocking.");
      }
    } catch {
      setBrowserNotice("Blocking setting failed.");
    }
  };
  const isPreparingBrowserDraft =
    createBrowserActionProposal.isPending ||
    createBrowserTabSessionDraft.isPending ||
    createBrowserActionApprovalPreview.isPending ||
    createBrowserActionWorkbenchBody.isPending ||
    createBrowserActionSpockGate.isPending ||
    createBrowserResultRecoveryScaffold.isPending ||
    createBrowserLiveRunnerApprovalPreview.isPending ||
    runBrowserLiveRunnerBlocked.isPending ||
    prepareBrowserLiveRunnerOpenReadiness.isPending ||
    recordBrowserSandboxFrameOpen.isPending ||
    recordBrowserSandboxFrameFallback.isPending ||
    createWatchShelfItemFromOpenTab.isPending ||
    createBrowserBookmarkFromOpenTab.isPending ||
    createBrowserBookmark.isPending ||
    removeBrowserBookmark.isPending ||
    renameBrowserBookmark.isPending ||
    recordBrowserSandboxFrameReload.isPending;
  const browserPrimaryAction = workbenchBrowserPrimaryActionCopy({
    draftKind: browserDraft.kind,
    isPreparing: isPreparingBrowserDraft,
  });

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:browser-focus");
      if (raw) window.sessionStorage.removeItem("cerebro:browser-focus");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const focus = JSON.parse(raw) as { proposalId?: number; query?: string; notice?: string };
      if (typeof focus.query === "string") setBrowserAddressDraft(focus.query);
      if (typeof focus.proposalId === "number") setSelectedBrowserProposalId(focus.proposalId);
      setBrowserSurface("page");
      setBrowserNotice(focus.notice ?? "Page focused.");
      setPreparedApprovalId(null);
      setSandboxFrameTarget(null);
      setSandboxFrameProposalId(null);
      setSandboxFrameReloadKey(0);
      setNativePageActive(false);
    } catch {
      setBrowserNotice("Browser focus could not be read.");
    }
  }, []);

  useEffect(() => {
    if (!nativePageActive) return;
    void syncNativeBrowserBounds();
    const handleResize = () => {
      void syncNativeBrowserBounds();
    };
    window.addEventListener("resize", handleResize);
    const interval = window.setInterval(handleResize, 500);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearInterval(interval);
    };
  }, [nativePageActive, sandboxFrameTarget, browserSurface, activeBrowserChromeMenu, syncNativeBrowserBounds]);

  useEffect(() => {
    return window.cerebroNativeBrowser?.onPageEvent((event) => {
      if (event.type === "popup-blocked") {
        setPopupBlockedCount((count) => count + 1);
        setBrowserNotice("Popup blocked.");
      }
      if (event.type === "navigation-finished") {
        void refreshSiteSettings();
      }
      if (event.type === "download-started") {
        setDownloadActivity({
          filename: event.filename,
          state: "downloading",
          message: "Downloading",
        });
        setBrowserNotice(`Downloading ${event.filename}.`);
      }
      if (event.type === "download-finished") {
        setDownloadActivity({
          filename: event.filename,
          state: event.state === "completed" ? "saved" : "blocked",
          message: event.state === "completed" ? "Saved" : "Blocked",
        });
        setBrowserNotice(event.state === "completed" ? `Saved ${event.filename}.` : `Blocked: ${event.filename}.`);
      }
      if (event.type === "download-blocked") {
        const message = downloadBlockedMessage(event.reason);
        setDownloadActivity({
          filename: event.filename,
          state: downloadBlockedState(event.reason),
          message,
        });
        setBrowserNotice(`${message}: ${event.filename}.`);
      }
      recordNativeBrowserPageEvent.mutate(event);
    });
  }, [recordNativeBrowserPageEvent]);

  useEffect(() => {
    void checkVpnStatus();
    void refreshSiteSettings();
  }, []);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded"
      role="region"
      aria-label="Browser"
      style={{
        background: browserFrame.shell,
        border: `1px solid ${browserFrame.line}`,
        color: C.textPrimary,
        boxShadow: `${browserFrame.shadow}, ${browserFrame.bevel}`,
      }}
    >
      <main className="flex-1 overflow-hidden p-1.5" aria-label="Browser workspace">
        <div className="grid h-full min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)] gap-1.5">
          <div
            className="flex items-end gap-0.5 overflow-x-auto rounded-t px-1.5 pt-1.5"
            aria-label="Browser page tabs"
            style={{ background: "rgba(4, 8, 8, 0.96)", border: `1px solid ${browserFrame.lineSoft}`, borderBottom: 0, boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.05)" }}
          >
            {dailyBrowserTabs.map((tab) => {
              const active = browserSurface === "page" && selectedBrowserProposalId == null && selectedDailyBrowserTabId === tab.id;
              return (
                <div
                  key={tab.id}
                  className="flex max-w-[190px] shrink-0 overflow-hidden rounded-t"
                  style={{
                    background: active ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.66)",
                    border: `1px solid ${active ? browserFrame.line : browserFrame.lineSoft}`,
                    borderBottomColor: active ? C.gold : "transparent",
                    boxShadow: browserFrame.bevel,
                  }}
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 min-w-0 flex-1 rounded-none px-2 text-[11px]"
                    aria-pressed={active}
                    title={tab.targetUrl ?? "New tab"}
                    onClick={() => void selectDailyBrowserTab(tab)}
                    style={{ color: active ? C.textPrimary : C.textMuted }}
                  >
                    <span className="truncate">{tab.title ?? browserOriginLabel(tab.targetUrl)}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 rounded-none px-0"
                    aria-label={`Close tab ${tab.title ?? browserOriginLabel(tab.targetUrl)}`}
                    title="Close tab"
                    onClick={(event) => void closeDailyBrowserTab(tab.id, event)}
                    style={{ color: active ? C.gold : C.textMuted, borderLeft: `1px solid ${browserFrame.lineSoft}` }}
                  >
                    <SquareX size={12} strokeWidth={1.8} aria-hidden="true" />
                  </Button>
                </div>
              );
            })}
            {browserVisibleTabs.map((tab) => {
              const active = browserSurface === "page" && selectedBrowserProposalId === tab.proposalId;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "outline"}
                  className="h-6 max-w-[150px] shrink-0 rounded-b-none px-2 text-[10px]"
                  aria-pressed={active}
                  title={tab.targetUrl}
                  onClick={() => {
                    setBrowserSurface("page");
                    setBrowserAddressDraft(tab.targetUrl);
                    setSelectedBrowserProposalId(tab.proposalId);
                    if (sandboxFrameProposalId !== tab.proposalId) {
                      setSandboxFrameTarget(null);
                      setNativePageActive(false);
                    }
                    setBrowserNotice(`${tab.state === "open" ? "Open" : "Ready"} tab selected.`);
                  }}
                  style={{
                    background: active ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.66)",
                    border: `1px solid ${active ? browserFrame.line : browserFrame.lineSoft}`,
                    borderBottomColor: active ? C.gold : "transparent",
                    color: active ? C.textPrimary : C.textMuted,
                    boxShadow: browserFrame.bevel,
                  }}
                >
                  <span className="truncate">{browserDraftTabLabel(tab)}</span>
                </Button>
              );
            })}
            <Button
              type="button"
              size="sm"
              variant={browserSurface === "watch" ? "secondary" : "outline"}
              className="h-7 shrink-0 rounded-b-none px-2 text-[11px]"
              aria-pressed={browserSurface === "watch"}
              onClick={() => setBrowserSurface("watch")}
              style={{
                background: browserSurface === "watch" ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.66)",
                border: `1px solid ${browserSurface === "watch" ? browserFrame.line : browserFrame.lineSoft}`,
                borderBottomColor: browserSurface === "watch" ? C.gold : "transparent",
                color: browserSurface === "watch" ? C.textPrimary : C.textMuted,
                boxShadow: browserFrame.bevel,
              }}
            >
              Watch Shelf
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={!browserTabState.canCreateTab} className="h-7 w-7 shrink-0 px-0" aria-label="New browser tab" onClick={createDailyBrowserTab}>
              <Plus size={13} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <div className="ml-auto flex shrink-0 items-center gap-1 pb-0.5">
              <Chip label={browserShell.status} tone={C.success} />
              <Chip label={browserShell.safetyLabel} tone={C.accent} />
              <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={onClose}>Keep</Button>
            </div>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded px-2 py-1" aria-label="Browser bookmark medallions" style={{ background: "linear-gradient(180deg, rgba(10, 18, 16, 0.92), rgba(4, 9, 9, 0.96))", border: `1px solid ${browserFrame.line}`, boxShadow: browserFrame.bevel }}>
            <div className="hidden items-center gap-1 sm:flex">
              <div className="h-px w-8" aria-hidden="true" style={{ background: `linear-gradient(90deg, transparent, ${browserFrame.line})` }} />
              <Bookmark size={13} strokeWidth={1.8} aria-hidden="true" style={{ color: C.gold }} />
            </div>
            <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
              {browserMedallions.map((pin) => (
                <button
                  key={pin.key}
                  type="button"
                  aria-label={`Open bookmark ${pin.label}`}
                  title={pin.target}
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  onClick={() => void openDailyBrowserTarget(pin.target)}
                  style={{ background: browserFrame.plaque, border: `1px solid ${pin.saved ? C.gold : browserFrame.lineSoft}`, boxShadow: `${browserFrame.bevel}, inset 0 0 16px rgba(214, 158, 67, 0.08)`, ["--tw-ring-color" as string]: C.accent }}
                >
                  <img
                    src={faviconUrl(pin.domain, 64)}
                    alt=""
                    className="h-5 w-5 rounded"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="sr-only">{pin.label}</span>
                  <span className="pointer-events-none absolute -bottom-0.5 h-1.5 w-1.5 rounded-full" aria-hidden="true" style={{ background: pin.saved ? C.gold : C.success, border: `1px solid ${browserFrame.line}`, boxShadow: `0 0 10px ${(pin.saved ? C.gold : C.success)}66` }} />
                </button>
              ))}
            </div>
            <details className="relative justify-self-end" open={activeBrowserChromeMenu === "bookmarks"}>
              <summary className="flex h-9 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Bookmarks" onClick={(event) => { event.preventDefault(); toggleBrowserChromeMenu("bookmarks"); }} style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textSecondary, background: "rgba(8, 14, 13, 0.76)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                <Bookmark size={13} strokeWidth={1.8} aria-hidden="true" />
                Bookmarks
              </summary>
              <div className="absolute right-0 z-20 mt-1 w-[min(360px,86vw)] rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Bookmarks</div>
                    <div className="mt-0.5">Saved on this device.</div>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-[10px]" disabled={createBrowserBookmark.isPending} onClick={saveCurrentBrowserBookmark}>
                    <Plus size={12} strokeWidth={1.8} aria-hidden="true" />
                    Add Current
                  </Button>
                </div>
                <div className="mt-2 grid gap-1">
                  {browserBookmarkItems.length === 0 ? (
                    <div className="rounded px-2 py-2" style={{ background: "rgba(5, 10, 10, 0.52)", border: `1px solid ${browserFrame.lineSoft}` }}>
                      Open a page, then add it here.
                    </div>
                  ) : browserBookmarkItems.slice(0, 8).map((bookmark) => {
                    const editing = editingBookmarkId === bookmark.id;
                    return (
                      <div key={bookmark.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 rounded" style={{ background: "rgba(5, 10, 10, 0.52)", border: `1px solid ${browserFrame.lineSoft}` }}>
                        {editing ? (
                          <Input
                            value={bookmarkTitleDraft}
                            onChange={(event) => setBookmarkTitleDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setEditingBookmarkId(null);
                                setBookmarkTitleDraft("");
                              }
                              if (event.key === "Enter" && bookmarkTitleDraft.trim()) {
                                renameBrowserBookmark.mutate({ bookmarkId: bookmark.id, title: bookmarkTitleDraft.trim() });
                              }
                            }}
                            aria-label={`Rename bookmark ${bookmark.title ?? bookmark.targetUrl}`}
                            className="h-8 min-w-0 text-[11px]"
                            style={{ background: browserFrame.address, border: `1px solid ${browserFrame.lineSoft}` }}
                          />
                        ) : (
                          <Button type="button" size="sm" variant="ghost" className="h-auto min-w-0 justify-start px-1.5 py-1.5 text-left" title={bookmark.targetUrl} aria-label={`Open bookmark ${bookmark.title ?? browserOriginLabel(bookmark.targetUrl)}`} onClick={() => void openDailyBrowserTarget(bookmark.targetUrl)}>
                            <span className="min-w-0">
                              <span className="block truncate text-[11px] font-semibold">{bookmark.title ?? browserOriginLabel(bookmark.targetUrl)}</span>
                              <span className="block truncate text-[10px] font-normal" style={{ color: C.textMuted }}>{bookmark.targetUrl}</span>
                            </span>
                          </Button>
                        )}
                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled={renameBrowserBookmark.isPending} aria-label={editing ? `Save bookmark ${bookmark.title ?? bookmark.targetUrl}` : `Rename bookmark ${bookmark.title ?? bookmark.targetUrl}`} title={editing ? "Save local bookmark title." : "Rename this bookmark."} onClick={() => {
                          if (editing) {
                            if (!bookmarkTitleDraft.trim()) return;
                            renameBrowserBookmark.mutate({ bookmarkId: bookmark.id, title: bookmarkTitleDraft.trim() });
                            return;
                          }
                          setEditingBookmarkId(bookmark.id);
                          setBookmarkTitleDraft(bookmark.title ?? bookmark.targetUrl);
                        }}>
                          <Pencil size={12} strokeWidth={1.8} aria-hidden="true" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled={removeBrowserBookmark.isPending} aria-label={`Remove bookmark ${bookmark.title ?? bookmark.targetUrl}`} title="Remove this bookmark." onClick={() => removeBrowserBookmark.mutate({ bookmarkId: bookmark.id })}>
                          <Trash2 size={12} strokeWidth={1.8} aria-hidden="true" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded-b px-1.5 py-1.5" style={{ background: "rgba(6, 11, 11, 0.92)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
            <div className="flex items-center gap-1 rounded px-1 py-0.5" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 px-0"
                disabled={!hasOpenSandboxFrame && !browserLocalNavigation.canGoBack}
                aria-label="Go back"
                title="Go back."
                onClick={() => void goBack()}
              >
                <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 px-0"
                disabled={!hasOpenSandboxFrame && !browserLocalNavigation.canGoForward}
                aria-label="Go forward"
                title="Go forward."
                onClick={() => void goForward()}
              >
                <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 px-0"
                disabled={!hasOpenSandboxFrame || recordBrowserSandboxFrameReload.isPending}
                aria-label="Reload page"
                title={hasOpenSandboxFrame ? "Reload the page." : "Open a page before reload."}
                onClick={() => void reloadPage()}
              >
                <RotateCw size={13} strokeWidth={1.8} aria-hidden="true" />
              </Button>
            </div>
            <Input
              value={browserAddressDraft}
              onChange={(event) => {
                setBrowserAddressDraft(event.target.value);
                setPreparedApprovalId(null);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                void openDailyBrowserPage();
              }}
              placeholder={browserShell.addressPlaceholder}
              aria-label="Browser address and search field"
              className="h-9 min-w-0 font-mono text-[12px]"
              title="Enter a site or search."
              style={{
                background: browserFrame.address,
                border: `1px solid ${browserFrame.line}`,
                boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.05), inset 0 -10px 20px rgba(0, 0, 0, 0.18)",
              }}
            />
            <div className="flex items-center justify-self-end gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 px-3"
                disabled={browserPrimaryAction.disabled || browserDraft.targetUrl == null}
                title="Open this page in CereBro."
                aria-label="Open page in CereBro"
                onClick={() => void openDailyBrowserPage()}
              >
                Open
              </Button>
              <details className="relative" open={activeBrowserChromeMenu === "shield"}>
                <summary
                  className="flex h-9 cursor-pointer list-none items-center gap-2 rounded px-2.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="VPN shield"
                  onClick={(event) => { event.preventDefault(); toggleBrowserChromeMenu("shield"); }}
                  style={{
                    border: `1px solid ${vpnStatusTone(vpnStatus)}66`,
                    color: vpnStatusTone(vpnStatus),
                    background: "linear-gradient(180deg, rgba(9, 18, 16, 0.92), rgba(3, 8, 8, 0.96))",
                    boxShadow: `${browserFrame.bevel}, inset 0 0 18px ${vpnStatusTone(vpnStatus)}12`,
                    ["--tw-ring-color" as string]: C.accent,
                  }}
                >
                  <ShieldCheck size={14} strokeWidth={1.9} aria-hidden="true" />
                  <span className="hidden sm:inline">{vpnStatusLabel(vpnStatus, vpnBusy)}</span>
                  <span className="sr-only">{vpnStatusLabel(vpnStatus, vpnBusy)}</span>
                </summary>
                <div
                  className="absolute right-0 top-full z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug"
                  role="menu"
                  style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>VPN Shield</div>
                      <div className="mt-1 text-[12px] font-semibold" style={{ color: vpnStatusTone(vpnStatus) }}>
                        {vpnStatusLabel(vpnStatus, vpnBusy)}
                      </div>
                    </div>
                    <span className="mt-0.5 h-2.5 w-2.5 rounded-full" aria-hidden="true" style={{ background: vpnStatusTone(vpnStatus), boxShadow: `0 0 18px ${vpnStatusTone(vpnStatus)}66` }} />
                  </div>
                  <div className="mt-2" style={{ color: C.textSecondary }}>
                    {vpnStatus?.state === "on"
                      ? "VPN is on."
                      : vpnStatus?.state === "needs_setup"
                        ? "Finish setup once, then the shield can check it."
                        : "Turn it on before private browsing."}
                  </div>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 justify-center px-2 text-[11px]"
                      disabled={vpnBusy}
                      role="menuitem"
                      onClick={() => void toggleVpn()}
                    >
                      {vpnPrimaryActionLabel(vpnStatus, vpnBusy)}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-[11px]"
                      disabled={vpnBusy}
                      role="menuitem"
                      onClick={() => void checkVpnStatus()}
                    >
                      Check
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-7 w-full justify-start px-1.5 text-[10px]"
                    role="menuitem"
                    onClick={() => onNavigate?.("basement")}
                  >
                    VPN Settings
                  </Button>
                </div>
              </details>
              {popupBlockedCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 px-2"
                  aria-label={`${popupBlockedCount} popup blocked`}
                  title={`${popupBlockedCount} popup${popupBlockedCount === 1 ? "" : "s"} blocked.`}
                  onClick={() => setBrowserNotice(`${popupBlockedCount} popup${popupBlockedCount === 1 ? "" : "s"} blocked.`)}
                >
                  <SquareX size={14} strokeWidth={1.8} aria-hidden="true" />
                  <span className="hidden text-[11px] font-semibold sm:inline">Popup blocked</span>
                </Button>
              )}
              {downloadActivity && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 px-2"
                  aria-label={`Downloads: ${downloadActivity.message}`}
                  title={`${downloadActivity.message}: ${downloadActivity.filename}`}
                  onClick={() => setBrowserNotice(`${downloadActivity.message}: ${downloadActivity.filename}`)}
                  style={{
                    borderColor: downloadActivity.state === "blocked" || downloadActivity.state === "needs_approval" ? `${C.warning}88` : `${browserFrame.lineSoft}`,
                    color: downloadActivity.state === "blocked" || downloadActivity.state === "needs_approval" ? C.warning : C.textSecondary,
                  }}
                >
                  <Download size={14} strokeWidth={1.8} aria-hidden="true" />
                  <span className="hidden text-[11px] font-semibold sm:inline">Downloads</span>
                </Button>
              )}
              <details className="relative" open={activeBrowserChromeMenu === "aang"}>
                <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded px-2.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Aang page actions" onClick={(event) => { event.preventDefault(); toggleBrowserChromeMenu("aang"); }} style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.gold, background: "linear-gradient(180deg, rgba(9, 18, 16, 0.92), rgba(3, 8, 8, 0.96))", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                  <img src="/assets/aang/aang-chat-dock-waist-v1.png" alt="" className="h-6 w-6 object-contain" />
                  <span className="hidden sm:inline">Aang</span>
                </summary>
                <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug" role="menu" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                  <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Current Page</div>
                  <div className="mt-1 truncate">{currentPageTarget ?? "No page open"}</div>
                  <div className="mt-2 grid gap-1">
                    <Button type="button" variant="ghost" size="sm" className="h-auto justify-start px-1.5 py-1.5 text-left" disabled={!currentPageTarget || browserAangRoutePreview.isPending} role="menuitem" onClick={() => stageCurrentPageAangAction("explain")}>
                      <span className="block">
                        <span className="block text-[11px] font-semibold">Explain page</span>
                        <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>Stage a local Aang read.</span>
                      </span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-auto justify-start px-1.5 py-1.5 text-left" disabled={!currentPageTarget || browserAangRoutePreview.isPending} role="menuitem" onClick={() => stageCurrentPageAangAction("note")}>
                      <span className="block">
                        <span className="block text-[11px] font-semibold">Make note</span>
                        <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>Prepare a note request.</span>
                      </span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-auto justify-start px-1.5 py-1.5 text-left" disabled={!currentPageTarget || browserAangRoutePreview.isPending} role="menuitem" onClick={() => stageCurrentPageAangAction("workshop")}>
                      <span className="block">
                        <span className="block text-[11px] font-semibold">Send to Workshop</span>
                        <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>Stage a build route.</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </details>
              <details className="relative" open={activeBrowserChromeMenu === "pageActions"}>
                <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Browser page actions" onClick={(event) => { event.preventDefault(); toggleBrowserChromeMenu("pageActions"); }} style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textSecondary, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                  <MoreHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
                </summary>
                <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded p-1.5" role="menu" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, boxShadow: `0 16px 36px ${C.background}cc` }}>
                  <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Page Actions</div>
                  <div className="mb-1 rounded px-1.5 py-1.5 text-[10px] leading-snug" style={{ background: "rgba(5, 10, 10, 0.72)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold" style={{ color: C.textPrimary }}>Site settings</span>
                      <span style={{ color: siteSettings?.blockingPolicy === "off" ? C.warning : C.success }}>{siteBlockingLabel(siteSettings)}</span>
                    </div>
                    <div className="mt-1 truncate">{siteSettings?.host ?? "No site open"}</div>
                    <div className="mt-1">Password Manager: Not set up</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto w-full justify-start px-1.5 py-1.5 text-left"
                    disabled={!siteSettings?.host}
                    role="menuitem"
                    onClick={() => void allowPopupsHere()}
                  >
                    <span className="block">
                      <span className="block text-[11px] font-semibold">Allow popups here</span>
                      <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>{siteSettings?.popupPolicy === "allow" ? "Allowed for this site." : "Blocked by default."}</span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto w-full justify-start px-1.5 py-1.5 text-left"
                    disabled={!siteSettings?.host}
                    role="menuitem"
                    onClick={() => void setBlockingForCurrentSite(siteSettings?.blockingPolicy === "off" ? "strict" : "off")}
                  >
                    <span className="block">
                      <span className="block text-[11px] font-semibold">{siteSettings?.blockingPolicy === "off" ? "Turn blocking on for this site" : "Turn blocking off for this site"}</span>
                      <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>Ad and popup blocking stay strict elsewhere.</span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto w-full justify-start px-1.5 py-1.5 text-left"
                    role="menuitem"
                    onClick={() => onNavigate?.("basement")}
                  >
                    <span className="block">
                      <span className="block text-[11px] font-semibold">VPN Settings</span>
                      <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>Open VPN settings.</span>
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto w-full justify-start px-1.5 py-1.5 text-left"
                    disabled={(!sandboxFrameTarget && !selectedDailyBrowserTab?.targetUrl && browserDraft.targetUrl == null) || createBrowserBookmark.isPending}
                    title={sandboxFrameTarget || selectedDailyBrowserTab?.targetUrl ? "Save this page as a bookmark." : "Open a page before saving a bookmark."}
                    role="menuitem"
                    onClick={saveCurrentBrowserBookmark}
                  >
                    <span className="block">
                      <span className="block text-[11px] font-semibold">{createBrowserBookmark.isPending ? "Saving Bookmark" : "Bookmark Page"}</span>
                      <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>Save this page.</span>
                    </span>
                  </Button>
                  {browserShell.actions.map((action) => (
                    <Button
                      key={action.label}
                      type="button"
                      variant={browserActionPreview.label === action.label ? "secondary" : "ghost"}
                      size="sm"
                      className="h-auto w-full justify-start px-1.5 py-1.5 text-left"
                      title={action.plannedReason}
                      role="menuitem"
                      onClick={() => setBrowserActionLabel(action.label)}
                    >
                      <span className="block text-[11px] font-semibold">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {browserNotice && !hasOpenSandboxFrame && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded px-2 py-1 text-[10px] leading-snug" role="status" style={{ background: "rgba(8, 14, 13, 0.84)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted }}>
              <span>{browserNotice}</span>
              {preparedApprovalId != null && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => {
                    try {
                      window.sessionStorage.setItem(
                        "cerebro:approvals-focus",
                        JSON.stringify({
                          source: "browser_prepare_open_package",
                          approvalId: preparedApprovalId,
                          status: "pending",
                          origin: "browser",
                          query: browserDraft.raw,
                          notice: "Page approval focused.",
                        }),
                      );
                    } catch {
                      // Approval Queue still opens and can be searched manually.
                    }
                    onNavigate?.("approvals");
                  }}
                >
                  Review approval
                </Button>
              )}
            </div>
          )}

          {(browserProjectPins.items.length > 0 || browserBookmarkItems.length > 0) && !hasOpenSandboxFrame && (
            <div className="flex items-center gap-1 overflow-x-auto rounded px-1.5 py-1" aria-label="Browser saved row" style={{ background: "rgba(5, 10, 10, 0.72)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
              {browserProjectPins.items.slice(0, 3).map((pin) => (
                <Button
                  key={`${pin.label}-${pin.target}`}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 shrink-0 gap-1 px-2 text-[10px]"
                  title={pin.target}
                  onClick={() => void openDailyBrowserTarget(pin.target)}
                >
                  <Folder size={12} strokeWidth={1.8} aria-hidden="true" />
                  <span className="max-w-[130px] truncate">Project: {pin.label}</span>
                </Button>
              ))}
              {browserBookmarkItems.slice(0, 4).map((bookmark) => (
                <Button
                  key={bookmark.id}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 shrink-0 gap-1 px-2 text-[10px]"
                  title={bookmark.targetUrl}
                  aria-label={`Open bookmark ${bookmark.title ?? browserOriginLabel(bookmark.targetUrl)}`}
                  onClick={() => void openDailyBrowserTarget(bookmark.targetUrl)}
                >
                  <Bookmark size={12} strokeWidth={1.8} aria-hidden="true" />
                  <span className="max-w-[150px] truncate">{bookmark.title ?? browserOriginLabel(bookmark.targetUrl)}</span>
                </Button>
              ))}
              {browserBookmarkItems.length > 0 && (
                <details className="relative ml-auto shrink-0" open={activeBrowserChromeMenu === "savedBookmarks"}>
                  <summary className="flex h-7 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Manage Browser bookmarks" onClick={(event) => { event.preventDefault(); toggleBrowserChromeMenu("savedBookmarks"); }} style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                    <MoreHorizontal size={13} strokeWidth={1.8} aria-hidden="true" />
                    Manage
                  </summary>
                  <div className="absolute right-0 z-20 mt-1 w-80 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                    <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Local Bookmarks</div>
                    <div className="mt-1 grid gap-1">
                      {browserBookmarkItems.slice(0, 6).map((bookmark) => {
                        const editing = editingBookmarkId === bookmark.id;
                        return (
                          <div key={bookmark.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 rounded" style={{ background: "rgba(5, 10, 10, 0.52)", border: `1px solid ${browserFrame.lineSoft}` }}>
                            {editing ? (
                              <Input
                                value={bookmarkTitleDraft}
                                onChange={(event) => setBookmarkTitleDraft(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") {
                                    setEditingBookmarkId(null);
                                    setBookmarkTitleDraft("");
                                  }
                                  if (event.key === "Enter" && bookmarkTitleDraft.trim()) {
                                    renameBrowserBookmark.mutate({ bookmarkId: bookmark.id, title: bookmarkTitleDraft.trim() });
                                  }
                                }}
                                aria-label={`Rename bookmark ${bookmark.title ?? bookmark.targetUrl}`}
                                className="h-7 min-w-0 text-[11px]"
                                style={{ background: browserFrame.address, border: `1px solid ${browserFrame.lineSoft}` }}
                              />
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-auto min-w-0 justify-start px-1.5 py-1.5 text-left"
                                title={bookmark.targetUrl}
                                aria-label={`Open bookmark ${bookmark.title ?? browserOriginLabel(bookmark.targetUrl)}`}
                                onClick={() => void openDailyBrowserTarget(bookmark.targetUrl)}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-[11px] font-semibold">{bookmark.title ?? bookmark.targetUrl}</span>
                                  <span className="block truncate text-[10px] font-normal" style={{ color: C.textMuted }}>{bookmark.targetUrl}</span>
                                </span>
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 px-0"
                              disabled={renameBrowserBookmark.isPending}
                              aria-label={editing ? `Save bookmark ${bookmark.title ?? bookmark.targetUrl}` : `Rename bookmark ${bookmark.title ?? bookmark.targetUrl}`}
                              title={editing ? "Save local bookmark title. No external write." : "Rename this local bookmark."}
                              onClick={() => {
                                if (editing) {
                                  if (!bookmarkTitleDraft.trim()) return;
                                  renameBrowserBookmark.mutate({ bookmarkId: bookmark.id, title: bookmarkTitleDraft.trim() });
                                  return;
                                }
                                setEditingBookmarkId(bookmark.id);
                                setBookmarkTitleDraft(bookmark.title ?? bookmark.targetUrl);
                              }}
                            >
                              <Pencil size={12} strokeWidth={1.8} aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 px-0"
                              disabled={removeBrowserBookmark.isPending}
                              aria-label={`Remove bookmark ${bookmark.title ?? bookmark.targetUrl}`}
                              title="Remove this local bookmark. No external write."
                              onClick={() => removeBrowserBookmark.mutate({ bookmarkId: bookmark.id })}
                            >
                              <Trash2 size={12} strokeWidth={1.8} aria-hidden="true" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-1">Saved on this device.</div>
                  </div>
                </details>
              )}
            </div>
          )}

          {browserSurface === "page" ? (
            <section
              className={hasOpenSandboxFrame ? "flex min-h-0 flex-col rounded p-1" : "overflow-y-auto rounded p-3 sm:p-4"}
              aria-label="Browser current page"
              style={{
                background: browserFrame.page,
                border: `1px solid ${browserFrame.lineSoft}`,
                minHeight: hasOpenSandboxFrame ? 0 : "clamp(430px, 62dvh, 680px)",
                boxShadow: "inset 0 1px 28px rgba(0, 0, 0, 0.48), inset 0 0 0 1px rgba(244, 239, 227, 0.02)",
              }}
            >
              {hasOpenSandboxFrame ? (
                <div className="relative flex min-h-0 flex-1 overflow-hidden rounded" style={{ background: "rgba(2, 6, 6, 0.99)", border: `1px solid ${browserFrame.line}`, boxShadow: "inset 0 1px 34px rgba(0, 0, 0, 0.5)" }}>
                    {nativePageActive ? (
                      <div
                        ref={nativeViewportRef}
                        aria-label="Native page viewport"
                        data-native-menu-reserve-top={nativeMenuReserveTop}
                        className="w-full flex-1 rounded-sm"
                        style={{ height: "100%", minHeight: 0, background: "rgba(2, 6, 6, 0.01)" }}
                      />
                    ) : (
                      <>
                        <iframe
                          key={`${sandboxFrameProposalId ?? "frame"}-${sandboxFrameReloadKey}`}
                          title="CereBro page view"
                          src={sandboxFrameTarget}
                          sandbox="allow-scripts allow-forms"
                          referrerPolicy="no-referrer"
                          className="w-full rounded-sm"
                          style={{ height: nativeViewportHeight, background: "#fff", border: "1px solid rgba(244, 239, 227, 0.18)", boxShadow: "0 18px 36px rgba(0, 0, 0, 0.36)" }}
                        />
                        <details className="mt-1.5 rounded px-1.5 py-1 text-[10px] leading-snug" style={{ background: "rgba(5, 10, 10, 0.72)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted }}>
                          <summary className="cursor-pointer list-none font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}>
                            Fallback
                          </summary>
                          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                            <span>Use only when this page will not render in CereBro.</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 px-2 text-[10px]"
                              disabled={selectedBrowserProposalId == null || recordBrowserSandboxFrameFallback.isPending}
                              title="Open this URL in the system browser by request."
                              onClick={() => {
                                if (selectedBrowserProposalId == null) return;
                                recordBrowserSandboxFrameFallback.mutate({
                                  proposalId: selectedBrowserProposalId,
                                  reason: "Site did not render in CereBro.",
                                });
                              }}
                            >
                              <ExternalLink size={12} strokeWidth={1.8} aria-hidden="true" />
                              {recordBrowserSandboxFrameFallback.isPending ? "Opening" : "System Browser"}
                            </Button>
                          </div>
                        </details>
                      </>
                    )}
                </div>
              ) : (
              browserDraft.kind === "empty" ? (
                <BrowserHomeStart
                  chatOpen={browserHomeChatOpen}
                  onToggleChat={() => setBrowserHomeChatOpen((open) => !open)}
                  onOpenTarget={(target) => void openDailyBrowserTarget(target)}
                  onAddBookmark={saveCurrentBrowserBookmark}
                  aangDraft={browserAangDraft}
                  onAangDraftChange={setBrowserAangDraft}
                  onSubmitAang={submitBrowserAangDraft}
                  savedBookmarks={browserBookmarkItems}
                />
              ) : (
              <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ minHeight: "clamp(360px, 54dvh, 600px)" }}>
                <div className="relative overflow-hidden rounded p-4" style={{ background: "radial-gradient(circle at 50% 18%, rgba(77, 170, 154, 0.11), transparent 34%), linear-gradient(180deg, rgba(8, 16, 15, 0.86), rgba(2, 6, 6, 0.94))", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: "inset 0 1px 40px rgba(0, 0, 0, 0.44)" }}>
                  <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center" style={{ minHeight: "clamp(300px, 46dvh, 520px)" }}>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded" aria-hidden="true" style={{ background: browserFrame.plaque, border: `1px solid ${C.gold}`, boxShadow: `${browserFrame.bevel}, 0 0 32px rgba(77, 170, 154, 0.12)` }}>
                      <ShieldCheck size={18} strokeWidth={1.7} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>
                      {browserDraft.kind}
                    </div>
                    <div className="mt-1 text-[16px] font-semibold leading-tight" style={{ color: C.textPrimary }}>
                      {browserDraft.tabLabel}
                    </div>
                    <div className="mt-2 max-w-md break-words text-[12px] leading-snug" style={{ color: C.textSecondary }}>
                      {browserDraft.displayTarget}
                    </div>
                    <div className="mt-3 flex justify-center gap-1">
                      <Chip label={browserDraft.kind} tone={C.accent} />
                      <Chip label={browserDraft.canOpen ? "ready" : "approval gated"} tone={browserDraft.canOpen ? C.success : C.warning} />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="rounded p-3 text-[11px] leading-snug" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Page State</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Chip label="ready" tone={C.accent} />
                      <Chip label="local" tone={C.gold} />
                    </div>
                    <div className="mt-2" style={{ color: C.textMuted }}>
                      Open the target to start the page permission step.
                    </div>
                  </div>
                  {selectedBrowserProposalId != null && (
                  <div className="rounded p-2 text-left text-[10px] leading-snug" aria-label="Browser open gate" style={{ background: "rgba(5, 10, 10, 0.64)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel, color: C.textMuted }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{browserOpenGateCopy.visibleTitle}</div>
                        <div className="mt-0.5 truncate">
                          {browserOpenGateCopy.visibleBody}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        <Chip label={browserOpenGateCopy.visibleStatus} tone={browserLiveRunnerPreflight.data?.canOpenPage ? C.success : C.warning} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          disabled={recordBrowserSandboxFrameOpen.isPending || !canOpenSandboxFrame}
                          title={canOpenSandboxFrame ? "Open the target in CereBro." : "Finish permission first."}
                          onClick={() => recordBrowserSandboxFrameOpen.mutate({ proposalId: selectedBrowserProposalId })}
                        >
                          {recordBrowserSandboxFrameOpen.isPending ? "Opening" : browserOpenGateCopy.primaryActionLabel}
                        </Button>
                        <details className="relative">
                          <summary className="flex h-6 cursor-pointer list-none items-center rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                            {browserOpenGateCopy.proofLabel}
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 w-80 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                            <div className="flex flex-wrap gap-1">
                              <Chip label="page" tone={C.accent} />
                              {browserLiveRunnerPreflight.data && (
                                <Chip label={`${browserLiveRunnerPreflight.data.summary.missingCount} missing`} tone={browserLiveRunnerPreflight.data.summary.missingCount > 0 ? C.warning : C.accent} />
                              )}
                            </div>
                            {browserLiveRunnerPreflight.data ? (
                              <div className="mt-2 grid gap-1">
                                {browserLiveRunnerPreflight.data.latestRunnerAudit && (
                                  <div>Last page check: {browserLiveRunnerPreflight.data.latestRunnerAudit.runnerState.replace(/_/g, " ")}.</div>
                                )}
                                {browserLiveRunnerLaunchGate.data && (
                                  <div>{browserLiveRunnerLaunchGate.data.nextAction}</div>
                                )}
                                <div className="flex flex-wrap gap-1 pt-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={createBrowserLiveRunnerApprovalPreview.isPending}
                                    title="Ask for page approval. This does not open a page."
                                    onClick={() => createBrowserLiveRunnerApprovalPreview.mutate({
                                      proposalId: selectedBrowserProposalId,
                                      reason: "Prepare explicit live-runner approval. This does not open the page.",
                                    })}
                                  >
                                    {createBrowserLiveRunnerApprovalPreview.isPending ? "Asking" : "Ask"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={runBrowserLiveRunnerBlocked.isPending}
                                    title="Check whether this page can open."
                                    onClick={() => runBrowserLiveRunnerBlocked.mutate({ proposalId: selectedBrowserProposalId })}
                                  >
                                    {runBrowserLiveRunnerBlocked.isPending ? "Checking" : "Check"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={prepareBrowserLiveRunnerOpenReadiness.isPending || browserLiveRunnerPreflight.data.summary.missingCount > 0}
                                    title={
                                      browserLiveRunnerPreflight.data.summary.missingCount > 0
                                        ? `Blocked by ${browserLiveRunnerPreflight.data.summary.nextMissingGate ?? "permission"}.`
                                        : "Mark this tab ready. This does not open a page."
                                    }
                                    onClick={() => prepareBrowserLiveRunnerOpenReadiness.mutate({ proposalId: selectedBrowserProposalId })}
                                  >
                                    {prepareBrowserLiveRunnerOpenReadiness.isPending ? "Preparing" : "Ready"}
                                  </Button>
                                </div>
                                <div>CereBro is waiting for page permission.</div>
                              </div>
                            ) : (
                              <div className="mt-2">Page permission is not available yet.</div>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                )}
                  <details className="rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(5, 10, 10, 0.56)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted }}>
                    <summary className="cursor-pointer list-none font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}>More</summary>
                    <div className="mt-1">{browserDraft.noActionText}</div>
                  </details>
                </div>
              </div>
              )
              )}
            </section>
          ) : (
            <section id="browser-watch-shelf" className="rounded p-2 sm:p-3" aria-label="Watch Shelf tab" style={{ background: "radial-gradient(circle at 18% 0%, rgba(198, 155, 85, 0.1), transparent 34%), linear-gradient(180deg, rgba(8, 15, 14, 0.99), rgba(3, 7, 7, 0.99))", border: `1px solid ${browserFrame.line}`, minHeight: "clamp(430px, 62dvh, 680px)", boxShadow: "inset 0 1px 28px rgba(0, 0, 0, 0.46)" }}>
              <div className="flex flex-wrap items-start justify-between gap-2 rounded px-2 py-1.5" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>{watchShelf.title}</div>
                  <div className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>Saved pages.</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 w-full sm:w-auto"
                  disabled={!hasOpenSandboxFrame || selectedBrowserProposalId == null || createWatchShelfItemFromOpenTab.isPending}
                  title={hasOpenSandboxFrame ? "Save the current open page to Watch Shelf." : "Requires a real open page before it can save."}
                  onClick={() => {
                    if (selectedBrowserProposalId == null) return;
                    createWatchShelfItemFromOpenTab.mutate({
                      proposalId: selectedBrowserProposalId,
                      category: watchShelfCategory as "Watching" | "Want" | "Anime" | "YouTube" | "Twitch" | "Finished",
                    });
                  }}
                >
                  {createWatchShelfItemFromOpenTab.isPending ? "Saving" : hasOpenSandboxFrame ? "Save Page" : watchShelfDraft.saveLabel}
                </Button>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="grid content-start gap-1 rounded p-2" style={{ background: "rgba(5, 10, 10, 0.62)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                  {watchShelf.categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      size="sm"
                      variant={watchShelfDraft.selectedCategory === category ? "secondary" : "ghost"}
                      className="h-7 justify-between px-2 text-[11px]"
                      onClick={() => setWatchShelfCategory(category)}
                      aria-pressed={watchShelfDraft.selectedCategory === category}
                      style={watchShelfDraft.selectedCategory === category ? { color: C.textPrimary, borderColor: watchShelfTone(category), boxShadow: `inset 2px 0 0 ${watchShelfTone(category)}` } : { color: C.textMuted }}
                    >
                      <span>{category}</span>
                      {watchShelfDraft.selectedCategory === category && <span aria-hidden="true" style={{ color: watchShelfTone(category) }}>•</span>}
                    </Button>
                  ))}
                </div>
                <div className="grid gap-3">
              <div className="rounded p-3 text-[11px] leading-snug" style={{ background: "rgba(5, 10, 10, 0.82)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                    {hasOpenSandboxFrame ? "Open page" : watchShelfDraft.candidateLabel}
                  </div>
                  <Chip label={watchShelfDraft.selectedCategory} tone={watchShelfDraft.selectedCategory === "Anime" ? C.warning : C.accent} />
                </div>
                <div className="mt-1 break-all" style={{ color: C.textMuted }}>{hasOpenSandboxFrame ? sandboxFrameTarget : watchShelfDraft.candidateTarget}</div>
                <div className="mt-1" style={{ color: C.textMuted }}>
                  {hasOpenSandboxFrame
                    ? "Save this page for later."
                    : browserDraft.kind === "empty"
                      ? watchShelf.emptyBody
                      : "This is only a local shelf readback. It cannot save until a real page is open."}
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {watchShelfItems.length > 0 ? (
                  watchShelfItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[38px_minmax(0,1fr)] gap-2 rounded p-2 text-[11px] leading-snug"
                      style={{
                        background: "linear-gradient(145deg, rgba(11, 20, 18, 0.94), rgba(4, 8, 8, 0.96))",
                        border: `1px solid ${browserFrame.lineSoft}`,
                        boxShadow: `${browserFrame.bevel}, inset 0 0 0 1px rgba(244, 239, 227, 0.02)`,
                      }}
                    >
                      <div
                        className="flex h-[38px] w-[38px] items-center justify-center rounded text-[13px] font-bold"
                        aria-hidden="true"
                        style={{
                          color: watchShelfTone(item.category),
                          background: browserFrame.plaque,
                          border: `1px solid ${watchShelfTone(item.category)}55`,
                          boxShadow: browserFrame.bevel,
                        }}
                      >
                        {watchShelfInitial(item.title, item.targetUrl)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold" style={{ color: C.textPrimary }}>{item.title ?? item.targetUrl}</span>
                          <Chip label={item.category} tone={watchShelfTone(item.category)} />
                        </div>
                        <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textMuted }}>{item.targetUrl}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px]" style={{ color: C.textMuted }}>
                          <span className="inline-flex items-center gap-1">
                            <Bookmark size={10} strokeWidth={1.8} aria-hidden="true" />
                            Local shelf row
                          </span>
                          <span aria-hidden="true">/</span>
                          <span>No progress or media</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded px-2 py-2 text-[11px] md:col-span-2" style={{ background: "rgba(7, 12, 12, 0.72)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted }}>
                    Open a page, then save it here.
                  </div>
                )}
              </div>
                  <details className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    <summary className="cursor-pointer list-none font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}>More</summary>
                    <div className="mt-1">{watchShelfDraft.noActionText}</div>
                  </details>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>
      <form
        className="grid shrink-0 grid-cols-[58px_minmax(0,1fr)_auto_auto] items-center gap-2 px-2 pb-2"
        aria-label="Browser Aang command bar"
        onSubmit={(event) => {
          event.preventDefault();
          submitBrowserAangDraft();
        }}
      >
        <button
          type="button"
          aria-label={browserHomeChatOpen ? "Close Aang chat" : "Open Aang chat"}
          onClick={() => setBrowserHomeChatOpen((open) => !open)}
          className="relative h-[58px] w-[58px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.line}`, boxShadow: `${browserFrame.bevel}, 0 12px 30px rgba(0,0,0,0.36)`, ["--tw-ring-color" as string]: C.accent }}
        >
          <img src="/assets/aang/aang-chat-dock-waist-v1.png" alt="" className="absolute bottom-0 left-1/2 h-[68px] max-w-none -translate-x-1/2 object-contain" />
        </button>
        <Input
          aria-label="Ask Aang or search from Browser"
          value={browserAangDraft}
          onChange={(event) => {
            setBrowserAangDraft(event.target.value);
            setBrowserNotice(null);
          }}
          placeholder={currentPageTarget ? "Ask Aang about the current page" : "Ask Aang from Browser"}
          className="h-11 min-w-0 text-[13px]"
          style={{ background: browserFrame.address, border: `1px solid ${browserFrame.line}`, boxShadow: "inset 0 1px 12px rgba(0, 0, 0, 0.58)" }}
        />
        <Button type="button" size="sm" variant="outline" className="h-11 w-11 px-0" aria-label="Attach image for Aang" disabled title="Not set up">
          <Paperclip size={16} strokeWidth={1.8} aria-hidden="true" />
        </Button>
        <Button type="submit" size="sm" variant="secondary" className="h-11 w-12 px-0" aria-label="Send to Aang" disabled={!browserAangDraft.trim() || browserAangRoutePreview.isPending}>
          <ArrowRight size={18} strokeWidth={1.9} aria-hidden="true" />
        </Button>
      </form>
      {aangRoutePreview && (
        <div className="mx-2 mb-2 rounded px-2 py-1.5 text-[10px] leading-snug" role="status" aria-label="Aang route preview" style={{ background: "rgba(8, 14, 13, 0.92)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, boxShadow: browserFrame.bevel }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-semibold" style={{ color: C.gold }}>Aang read:</span>{" "}
              <span>{aangRoutePreview.aangRead}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Chip label={aangRoutePreview.ownerAgent} tone={C.accent} />
              <Chip label="local preview" tone={C.success} />
            </div>
          </div>
          <div className="mt-1 truncate">{aangRoutePreview.receipt.summary}</div>
        </div>
      )}
    </div>
  );
}
