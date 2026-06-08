import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Download, ExternalLink, Folder, MoreHorizontal, Pencil, Plus, RotateCw, ShieldCheck, SquareX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cerebroColors as C } from "@/lib/keepConfig";
import { trpc } from "@/lib/trpc";
import type { NativeBrowserPageEvent } from "../../../shared/nativeBrowser";
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

type BrowserRoute = "approvals" | "workbench" | "sources" | "security" | "basement";

type BrowserDraftTab = {
  id: number;
  tabId: string;
  targetUrl: string;
  title: string | null;
  proposalId: number | null;
};

type BrowserDownloadActivity = {
  filename: string;
  state: "active" | "finished" | "blocked";
  message: string;
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
  if (reason === "automatic_download") return "Download blocked";
  if (reason === "multiple_download") return "Multiple downloads blocked";
  return "Download needs review";
}

export default function BrowserPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: BrowserRoute) => void }) {
  const [browserSurface, setBrowserSurface] = useState<"page" | "watch">("page");
  const [browserAddressDraft, setBrowserAddressDraft] = useState("");
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
  const [editingBookmarkId, setEditingBookmarkId] = useState<number | null>(null);
  const [bookmarkTitleDraft, setBookmarkTitleDraft] = useState("");
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
    sandboxFrameProposalId != null &&
    sandboxFrameProposalId === selectedBrowserProposalId;
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
    return window.cerebroNativeBrowser?.onPageEvent((event) => {
      if (event.type === "popup-blocked") {
        setPopupBlockedCount((count) => count + 1);
        setBrowserNotice("Popup blocked.");
      }
      if (event.type === "download-started") {
        setDownloadActivity({
          filename: event.filename,
          state: "active",
          message: "Downloading",
        });
        setBrowserNotice(`Downloading ${event.filename}.`);
      }
      if (event.type === "download-finished") {
        setDownloadActivity({
          filename: event.filename,
          state: event.state === "completed" ? "finished" : "blocked",
          message: event.state === "completed" ? "Download finished" : "Download stopped",
        });
        setBrowserNotice(event.state === "completed" ? `Downloaded ${event.filename}.` : `Download stopped: ${event.filename}.`);
      }
      if (event.type === "download-blocked") {
        const message = downloadBlockedMessage(event.reason);
        setDownloadActivity({
          filename: event.filename,
          state: "blocked",
          message,
        });
        setBrowserNotice(`${message}: ${event.filename}.`);
      }
      recordNativeBrowserPageEvent.mutate(event);
    });
  }, [recordNativeBrowserPageEvent]);

  useEffect(() => {
    void checkVpnStatus();
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
      <header className="shrink-0 px-2.5 py-2" style={{ background: browserFrame.rail, borderBottom: `1px solid ${browserFrame.line}`, boxShadow: browserFrame.bevel }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest">{browserShell.title}</h2>
            <p className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>Search, browse, save, and ask Aang.</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Chip label={browserShell.status} tone={C.success} />
            <Chip label={browserShell.safetyLabel} tone={C.accent} />
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={onClose}>Close</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-2" aria-label="Browser workspace">
        <div className="grid gap-1.5">
          <div
            className="flex items-end gap-0.5 overflow-x-auto rounded-t px-1.5 pt-1.5"
            aria-label="Browser page tabs"
            style={{ background: "rgba(4, 8, 8, 0.96)", border: `1px solid ${browserFrame.lineSoft}`, borderBottom: 0, boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.05)" }}
          >
            <Button
              type="button"
              size="sm"
              variant={browserSurface === "page" && selectedBrowserProposalId == null ? "secondary" : "outline"}
              className="h-6 shrink-0 rounded-b-none px-2 text-[10px]"
              aria-pressed={browserSurface === "page" && selectedBrowserProposalId == null}
              onClick={() => {
                setBrowserSurface("page");
                setSelectedBrowserProposalId(null);
                setBrowserNotice(null);
              }}
              style={{
                background: browserSurface === "page" && selectedBrowserProposalId == null ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.66)",
                border: `1px solid ${browserSurface === "page" && selectedBrowserProposalId == null ? browserFrame.line : browserFrame.lineSoft}`,
                borderBottomColor: browserSurface === "page" && selectedBrowserProposalId == null ? C.gold : "transparent",
                color: browserSurface === "page" && selectedBrowserProposalId == null ? C.textPrimary : C.textMuted,
                boxShadow: browserFrame.bevel,
              }}
            >
              Current Page
            </Button>
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
              className="h-6 shrink-0 rounded-b-none px-2 text-[10px]"
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
            <Button type="button" size="sm" variant="ghost" disabled={!browserTabState.canCreateTab} className="h-6 w-6 shrink-0 px-0" aria-label="New browser tab">
              <Plus size={13} strokeWidth={1.8} aria-hidden="true" />
            </Button>
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
                disabled={!hasOpenSandboxFrame || selectedBrowserProposalId == null || recordBrowserSandboxFrameReload.isPending}
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
                title={browserPrimaryAction.title}
                aria-label={browserPrimaryAction.ariaLabel}
                onClick={async () => {
                  if (browserDraft.kind === "empty" || browserDraft.targetUrl == null || isPreparingBrowserDraft) return;
                  setBrowserNotice(browserPrimaryAction.pendingNotice);
                  try {
                    const result = await createBrowserActionProposal.mutateAsync({
                      actionLabel: "Open Page",
                      target: browserDraft.targetUrl,
                      draftKind: browserDraft.kind,
                    });
                    const proposalId = result.proposal.id;
                    setSelectedBrowserProposalId(proposalId);
                    await createBrowserTabSessionDraft.mutateAsync({ proposalId });
                    const approvalPreview = await createBrowserActionApprovalPreview.mutateAsync({
                      proposalId,
                      reason: "Prepare Browser page open for user approval. This does not open the page.",
                    });
                    setPreparedApprovalId(approvalPreview.approval?.id ?? null);
                    await createBrowserActionWorkbenchBody.mutateAsync({ proposalId });
                    await createBrowserActionSpockGate.mutateAsync({ proposalId });
                    await createBrowserResultRecoveryScaffold.mutateAsync({ proposalId });
                    const liveApprovalPreview = await createBrowserLiveRunnerApprovalPreview.mutateAsync({
                      proposalId,
                      reason: "Prepare Browser open permission after the local page package is staged. This does not open the page.",
                    });
                    setBrowserNotice(
                      `Page is ready for review. Approval #${approvalPreview.approval?.id ?? "pending"} is waiting.`,
                    );
                  } catch {
                    setBrowserNotice(browserPrimaryAction.failureNotice);
                    setPreparedApprovalId(null);
                  }
                }}
              >
                {browserPrimaryAction.label}
              </Button>
              <details className="relative">
                <summary
                  className="flex h-9 cursor-pointer list-none items-center gap-2 rounded px-2.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="VPN shield"
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
                  className="absolute right-0 z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug"
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
                    borderColor: downloadActivity.state === "blocked" ? `${C.warning}88` : `${browserFrame.lineSoft}`,
                    color: downloadActivity.state === "blocked" ? C.warning : C.textSecondary,
                  }}
                >
                  <Download size={14} strokeWidth={1.8} aria-hidden="true" />
                  <span className="hidden text-[11px] font-semibold sm:inline">Downloads</span>
                </Button>
              )}
              <details className="relative">
                <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Browser page actions" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textSecondary, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                  <MoreHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-20 mt-1 w-56 rounded p-1.5" role="menu" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, boxShadow: `0 16px 36px ${C.background}cc` }}>
                  <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Page Actions</div>
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
                    disabled={!hasOpenSandboxFrame || selectedBrowserProposalId == null || createBrowserBookmarkFromOpenTab.isPending}
                    title={hasOpenSandboxFrame ? "Save this page as a bookmark." : "Open a page before saving a bookmark."}
                    role="menuitem"
                    onClick={() => {
                      if (selectedBrowserProposalId == null) return;
                      createBrowserBookmarkFromOpenTab.mutate({ proposalId: selectedBrowserProposalId });
                    }}
                  >
                    <span className="block">
                      <span className="block text-[11px] font-semibold">{createBrowserBookmarkFromOpenTab.isPending ? "Saving Bookmark" : "Bookmark Page"}</span>
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

          {browserNotice && (
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
                  onClick={() => setBrowserNotice(`${pin.label} selected.`)}
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
                  onClick={() => {
                    setBrowserSurface("page");
                    setBrowserAddressDraft(bookmark.targetUrl);
                    setSelectedBrowserProposalId(null);
                    setSandboxFrameTarget(null);
                    setSandboxFrameProposalId(null);
                    setNativePageActive(false);
                    setBrowserNotice("Bookmark loaded.");
                  }}
                >
                  <Bookmark size={12} strokeWidth={1.8} aria-hidden="true" />
                  <span className="max-w-[150px] truncate">{bookmark.title ?? browserOriginLabel(bookmark.targetUrl)}</span>
                </Button>
              ))}
              {browserBookmarkItems.length > 0 && (
                <details className="relative ml-auto shrink-0">
                  <summary className="flex h-7 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Manage Browser bookmarks" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
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
                                onClick={() => {
                                  setBrowserSurface("page");
                                  setBrowserAddressDraft(bookmark.targetUrl);
                                  setSelectedBrowserProposalId(null);
                                  setSandboxFrameTarget(null);
                                  setSandboxFrameProposalId(null);
                                  setNativePageActive(false);
                                  setBrowserNotice("Bookmark loaded.");
                                }}
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
            <section className="rounded p-3 sm:p-4" aria-label="Browser current page" style={{ background: browserFrame.page, border: `1px solid ${browserFrame.lineSoft}`, minHeight: "clamp(430px, 62dvh, 680px)", boxShadow: "inset 0 1px 28px rgba(0, 0, 0, 0.48), inset 0 0 0 1px rgba(244, 239, 227, 0.02)" }}>
              {hasOpenSandboxFrame ? (
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded px-2 py-1.5" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                    <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                      <div className="truncate text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                        {selectedBrowserTab ? browserDraftTabLabel(selectedBrowserTab) : "Open page"}
                      </div>
                      <div className="truncate text-[10px]" style={{ color: C.textMuted }}>
                        {sandboxFrameTarget}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px]"
                      title="Return to the Browser start view."
                      onClick={() => void closeNativeBrowserPage()}
                    >
                      Return
                    </Button>
                    <details className="relative w-full sm:w-auto sm:shrink-0">
                      <summary className="ml-auto flex h-7 w-8 cursor-pointer list-none items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Open page actions" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                        <MoreHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
                      </summary>
                      <div className="absolute right-0 z-20 mt-1 w-80 rounded p-2 text-[10px] leading-snug" role="menu" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                        <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Page Actions</div>
                        <div className="mt-1 grid gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 justify-start px-1.5 text-[11px]"
                            disabled={createBrowserBookmarkFromOpenTab.isPending || selectedBrowserProposalId == null}
                            role="menuitem"
                            title="Save this page as a bookmark."
                            onClick={() => {
                              if (selectedBrowserProposalId == null) return;
                              createBrowserBookmarkFromOpenTab.mutate({ proposalId: selectedBrowserProposalId });
                            }}
                          >
                            {createBrowserBookmarkFromOpenTab.isPending ? "Saving bookmark" : "Bookmark page"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 justify-start px-1.5 text-[11px]"
                            disabled={createWatchShelfItemFromOpenTab.isPending || selectedBrowserProposalId == null}
                            role="menuitem"
                            title="Save this page to Watch Shelf."
                            onClick={() => {
                              if (selectedBrowserProposalId == null) return;
                              createWatchShelfItemFromOpenTab.mutate({
                                proposalId: selectedBrowserProposalId,
                                category: watchShelfCategory as "Watching" | "Want" | "Anime" | "YouTube" | "Twitch" | "Finished",
                              });
                            }}
                          >
                            {createWatchShelfItemFromOpenTab.isPending ? "Saving to Watch Shelf" : "Save to Watch Shelf"}
                          </Button>
                        </div>
                        {browserProjectPins.items.length > 0 && (
                          <div className="mt-2 border-t pt-2" style={{ borderColor: browserFrame.lineSoft }}>
                            <div className="font-bold uppercase tracking-widest" style={{ color: C.textSecondary }}>{browserProjectPins.title}</div>
                            <div className="mt-1 grid gap-1">
                              {browserProjectPins.items.map((pin) => (
                                <Button
                                  key={`${pin.label}-${pin.target}`}
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-full justify-between px-1.5 text-[10px]"
                                  title={pin.target}
                                  role="menuitem"
                                  onClick={() => setBrowserNotice(`${pin.label} selected.`)}
                                >
                                  <span className="truncate">{pin.label}</span>
                                  <span className="shrink-0 uppercase" style={{ color: pin.statusLabel === "clean" ? C.success : C.gold }}>
                                    {pin.statusLabel}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedBrowserHistoryItems.length > 0 && (
                          <div className="mt-2 border-t pt-2" style={{ borderColor: browserFrame.lineSoft }}>
                            <div className="font-bold uppercase tracking-widest" style={{ color: C.textSecondary }}>Local History</div>
                            <div className="mt-1 grid gap-1">
                              {selectedBrowserHistoryItems.map((item) => (
                                <div key={item.id} className="rounded px-1.5 py-1" style={{ background: "rgba(5, 10, 10, 0.72)", border: `1px solid ${browserFrame.lineSoft}` }}>
                                  <div className="truncate font-semibold" style={{ color: C.textPrimary }}>{item.title ?? item.targetUrl}</div>
                                  <div className="truncate" style={{ color: C.textMuted }}>{item.eventType.replace(/_/g, " ")}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 border-t pt-2" style={{ borderColor: browserFrame.lineSoft }}>
                          <div className="font-bold uppercase tracking-widest" style={{ color: C.textSecondary }}>Safety</div>
                          <div className="mt-1">Protected page view. CereBro did not save page content, downloads, popups, or credentials.</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Chip label="protected" tone={C.accent} />
                            <Chip label="local" tone={C.gold} />
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                  <div className="relative overflow-hidden rounded p-1.5" style={{ background: "linear-gradient(180deg, rgba(13, 23, 20, 0.98), rgba(2, 6, 6, 0.99))", border: `1px solid ${browserFrame.line}`, boxShadow: "inset 0 1px 34px rgba(0, 0, 0, 0.5), 0 16px 36px rgba(0, 0, 0, 0.32)" }}>
                    <div className="mb-1.5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded px-1.5 py-1" style={{ background: browserFrame.address, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                      <ShieldCheck size={12} strokeWidth={1.8} aria-hidden="true" style={{ color: C.accent }} />
                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-semibold" style={{ color: C.textPrimary }}>{browserOriginLabel(sandboxFrameTarget)}</div>
                        <div className="truncate text-[9px] font-mono" style={{ color: C.textMuted }}>{sandboxFrameTarget}</div>
                      </div>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider" style={{ color: C.gold, border: `1px solid ${browserFrame.lineSoft}`, background: "rgba(5, 10, 10, 0.72)" }}>open</span>
                    </div>
                    {nativePageActive ? (
                      <div
                        aria-label="Native page viewport"
                        className="h-[clamp(320px,55dvh,640px)] w-full rounded-sm sm:h-[clamp(370px,58dvh,660px)]"
                        style={{ background: "rgba(2, 6, 6, 0.01)", border: "1px solid rgba(244, 239, 227, 0.08)" }}
                      />
                    ) : (
                      <>
                        <iframe
                          key={`${sandboxFrameProposalId ?? "frame"}-${sandboxFrameReloadKey}`}
                          title="CereBro page view"
                          src={sandboxFrameTarget}
                          sandbox="allow-scripts allow-forms"
                          referrerPolicy="no-referrer"
                          className="h-[clamp(320px,55dvh,640px)] w-full rounded-sm sm:h-[clamp(370px,58dvh,660px)]"
                          style={{ background: "#fff", border: "1px solid rgba(244, 239, 227, 0.18)", boxShadow: "0 18px 36px rgba(0, 0, 0, 0.36)" }}
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
                </div>
              ) : (
              <div className={browserDraft.kind === "empty" ? "grid items-center gap-4" : "grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"} style={{ minHeight: "clamp(360px, 54dvh, 600px)" }}>
                <div className="relative overflow-hidden rounded p-4" style={{ background: "radial-gradient(circle at 50% 18%, rgba(77, 170, 154, 0.11), transparent 34%), linear-gradient(180deg, rgba(8, 16, 15, 0.86), rgba(2, 6, 6, 0.94))", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: "inset 0 1px 40px rgba(0, 0, 0, 0.44)" }}>
                  <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center" style={{ minHeight: "clamp(300px, 46dvh, 520px)" }}>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded" aria-hidden="true" style={{ background: browserFrame.plaque, border: `1px solid ${browserDraft.kind === "empty" ? browserFrame.lineSoft : C.gold}`, boxShadow: `${browserFrame.bevel}, 0 0 32px rgba(77, 170, 154, 0.12)` }}>
                      <ShieldCheck size={18} strokeWidth={1.7} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>
                      {browserDraft.kind === "empty" ? "Current Page" : browserDraft.kind}
                    </div>
                    <div className="mt-1 text-[16px] font-semibold leading-tight" style={{ color: C.textPrimary }}>
                      {browserDraft.kind === "empty" ? "Enter a site or search." : browserDraft.tabLabel}
                    </div>
                    <div className="mt-2 max-w-md break-words text-[12px] leading-snug" style={{ color: browserDraft.kind === "empty" ? C.textMuted : C.textSecondary }}>
                      {browserDraft.kind === "empty" ? "Use the address bar. CereBro will ask before anything risky runs." : browserDraft.displayTarget}
                    </div>
                    {browserDraft.kind !== "empty" && (
                      <div className="mt-3 flex justify-center gap-1">
                        <Chip label={browserDraft.kind} tone={C.accent} />
                        <Chip label={browserDraft.canOpen ? "ready" : "approval gated"} tone={browserDraft.canOpen ? C.success : C.warning} />
                      </div>
                    )}
                  </div>
                </div>
                {browserDraft.kind !== "empty" && (
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
                )}
              </div>
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
    </div>
  );
}
