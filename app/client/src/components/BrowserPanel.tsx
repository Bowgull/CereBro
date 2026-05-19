import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Folder, MoreHorizontal, Plus, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cerebroColors as C } from "@/lib/keepConfig";
import { trpc } from "@/lib/trpc";
import {
  workbenchBrowserActionPreviewModel,
  workbenchBrowserDraftModel,
  workbenchBrowserLocalNavigationStateModel,
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

type BrowserRoute = "approvals" | "workbench" | "sources" | "security";

type BrowserDraftTab = {
  id: number;
  tabId: string;
  targetUrl: string;
  title: string | null;
  proposalId: number | null;
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
  if (category === "Research") return C.gold;
  return C.accent;
}

function watchShelfInitial(title: string | null, targetUrl: string) {
  const value = (title ?? targetUrl).trim();
  return (value[0] ?? "W").toUpperCase();
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
  const createBrowserActionProposal = trpc.workbench.createBrowserActionProposal.useMutation({
    onSuccess: () => {
      utils.workbench.browserActionProposals.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createBrowserTabSessionDraft = trpc.workbench.createBrowserTabSessionDraft.useMutation({
    onSuccess: (result) => {
      setSelectedBrowserProposalId(result.tab.proposalId);
      setBrowserNotice(`Draft tab ${result.tab.tabId} staged. No page opened.`);
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
          ? `Live runner approval #${result.approval.id} staged. No page opened.`
          : "Live runner approval was not staged.",
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
      setBrowserNotice(`Live runner audit #${result.audit.id} blocked proposal #${result.proposal.id}. No page opened.`);
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.workbench.browserLiveRunnerLaunchGate.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
    },
  });
  const prepareBrowserLiveRunnerOpenReadiness = trpc.workbench.prepareBrowserLiveRunnerOpenReadiness.useMutation({
    onSuccess: (result) => {
      setBrowserNotice(
        result.ok
          ? `Browser tab ${result.tab.tabId} is runner-ready. No page opened.`
          : `Runner readiness blocked: ${result.missingGates[0] ?? "missing gate"}. No page opened.`,
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
        setBrowserNotice(`Sandbox frame opened for ${result.tab.tabId}. Some sites may refuse frame rendering.`);
      } else {
        setSandboxFrameTarget(null);
        setSandboxFrameProposalId(null);
        setBrowserNotice("Sandbox frame blocked. Prepare runner first.");
      }
      utils.workbench.browserTabSessionStorageContract.invalidate();
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
  const recordBrowserSandboxFrameReload = trpc.workbench.recordBrowserSandboxFrameReload.useMutation({
    onSuccess: (result) => {
      if (result.ok) {
        setSandboxFrameReloadKey((key) => key + 1);
        setBrowserNotice(`Sandbox frame reloaded for ${result.tab.tabId}. No backend fetch ran.`);
      } else {
        setBrowserNotice("Sandbox frame reload blocked. Open the page first.");
      }
      utils.workbench.browserLiveRunnerPreflight.invalidate({ proposalId: result.proposal.id });
      utils.ledger.overview.invalidate();
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
  const browserProjectPins = workbenchBrowserProjectPinsModel(projects.data?.projects ?? []);
  const watchShelf = workbenchWatchShelfModel();
  const watchShelfDraft = workbenchWatchShelfDraftModel(browserDraft, watchShelfCategory);
  const watchShelfItems = (watchShelfStorageContract.data?.items ?? []).filter(
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
    setBrowserNotice(`Local history opened ${target.title ?? target.targetUrl}. No backend fetch ran.`);
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
    createWatchShelfItemFromOpenTab.isPending ||
    recordBrowserSandboxFrameReload.isPending;

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
      setBrowserNotice(focus.notice ?? "Browser proposal focused. No page opened.");
      setPreparedApprovalId(null);
      setSandboxFrameTarget(null);
      setSandboxFrameProposalId(null);
      setSandboxFrameReloadKey(0);
    } catch {
      setBrowserNotice("Browser focus could not be read. No page opened.");
    }
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
            <p className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>Manual browsing. Aang handles search intent.</p>
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
            className="flex items-end gap-1 overflow-x-auto rounded-t px-1.5 pt-1.5"
            aria-label="Browser page tabs"
            style={{ background: "rgba(4, 8, 8, 0.96)", border: `1px solid ${browserFrame.lineSoft}`, borderBottom: 0, boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.05)" }}
          >
            <Button
              type="button"
              size="sm"
              variant={browserSurface === "page" && selectedBrowserProposalId == null ? "secondary" : "outline"}
              className="h-7 shrink-0 rounded-b-none px-2.5 text-[11px]"
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
                  className="h-7 max-w-[170px] shrink-0 rounded-b-none px-2.5 text-[11px]"
                  aria-pressed={active}
                  title={`${tab.targetUrl}. Draft tab only. No page opens.`}
                  onClick={() => {
                    setBrowserSurface("page");
                    setBrowserAddressDraft(tab.targetUrl);
                    setSelectedBrowserProposalId(tab.proposalId);
                    if (sandboxFrameProposalId !== tab.proposalId) setSandboxFrameTarget(null);
                    setBrowserNotice(`${tab.state === "open" ? "Open" : "Draft"} tab ${tab.tabId} selected. No page opened.`);
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
              className="h-7 shrink-0 rounded-b-none px-2.5 text-[11px]"
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
            <Button type="button" size="sm" variant="ghost" disabled={!browserTabState.canCreateTab} className="h-7 w-7 shrink-0 px-0" aria-label="New browser tab planned">
              <Plus size={13} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <div className="ml-auto hidden shrink-0 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-widest md:block" style={{ color: C.textMuted, border: `1px solid ${browserFrame.lineSoft}`, background: "rgba(5, 10, 10, 0.7)", boxShadow: browserFrame.bevel }}>
              Local
            </div>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5 rounded p-1.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]" style={{ background: "rgba(6, 11, 11, 0.92)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
            <div className="flex items-center gap-1 rounded px-1 py-0.5" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 px-0"
                disabled={!browserLocalNavigation.canGoBack}
                aria-label={browserLocalNavigation.canGoBack ? "Go back through local Browser history" : "No previous local Browser history"}
                title={browserLocalNavigation.backTarget ? `Open previous local history row: ${browserLocalNavigation.backTarget.targetUrl}` : "No previous local history for this page."}
                onClick={() => navigateBrowserLocalHistory(browserLocalNavigation.backTarget)}
              >
                <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 px-0"
                disabled={!browserLocalNavigation.canGoForward}
                aria-label={browserLocalNavigation.canGoForward ? "Go forward through local Browser history" : "No next local Browser history"}
                title={browserLocalNavigation.forwardTarget ? `Open next local history row: ${browserLocalNavigation.forwardTarget.targetUrl}` : "No next local history for this page."}
                onClick={() => navigateBrowserLocalHistory(browserLocalNavigation.forwardTarget)}
              >
                <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 px-0"
                disabled={!hasOpenSandboxFrame || selectedBrowserProposalId == null || recordBrowserSandboxFrameReload.isPending}
                aria-label="Reload sandbox frame"
                title={hasOpenSandboxFrame ? "Reload the sandbox frame. No backend fetch runs." : "Open a page before reload."}
                onClick={() => {
                  if (selectedBrowserProposalId == null) return;
                  recordBrowserSandboxFrameReload.mutate({ proposalId: selectedBrowserProposalId });
                }}
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
              className="order-3 col-span-2 h-8 min-w-0 font-mono text-[12px] sm:order-none sm:col-span-1"
              title="Stages a local page draft only. It does not open, fetch, search, save, or capture."
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
                className="h-8 px-2"
                disabled={browserDraft.kind === "empty" || isPreparingBrowserDraft}
                title="Prepare local Browser receipts. This does not open, fetch, search, save, or capture."
                aria-label="Stage browser page draft"
                onClick={async () => {
                  if (browserDraft.kind === "empty" || isPreparingBrowserDraft) return;
                  setBrowserNotice("Preparing local Browser receipts. No page will open.");
                  try {
                    const result = await createBrowserActionProposal.mutateAsync({
                      actionLabel: "Open Page",
                      target: browserDraft.targetUrl ?? browserDraft.raw,
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
                    setBrowserNotice(`Browser proposal #${proposalId} prepared. Approval is waiting. No page opened.`);
                  } catch {
                    setBrowserNotice("Browser preparation failed before any page opened.");
                    setPreparedApprovalId(null);
                  }
                }}
              >
                {isPreparingBrowserDraft ? "Preparing" : "Stage"}
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled aria-label="Browser quiet shield">
                <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
              </Button>
              <details className="relative">
                <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Browser page actions" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textSecondary, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                  <MoreHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-20 mt-1 w-56 rounded p-1.5" role="menu" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, boxShadow: `0 16px 36px ${C.background}cc` }}>
                  <div className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>Page Actions</div>
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
                      <span className="block">
                        <span className="block text-[11px] font-semibold">{action.label}</span>
                        <span className="block text-[10px] font-normal" style={{ color: C.textMuted }}>{action.plannedReason}</span>
                      </span>
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
                          notice: `Browser proposal #${selectedBrowserProposalId ?? "current"} approval focused. No page opens from this handoff.`,
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

          {browserProjectPins.items.length > 0 && !hasOpenSandboxFrame && (
            <div className="flex justify-end">
              <details className="relative">
                <summary className="flex h-7 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Show Browser project pins" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                  <Folder size={12} strokeWidth={1.8} aria-hidden="true" />
                  Pins
                  <span style={{ color: C.gold }}>{browserProjectPins.items.length}</span>
                </summary>
                <div className="absolute right-0 z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                  <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{browserProjectPins.title}</div>
                  <div className="mt-1 grid gap-1">
                    {browserProjectPins.items.map((pin) => (
                      <Button
                        key={`${pin.label}-${pin.target}`}
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-full justify-between px-1.5 text-[10px]"
                        title={`${pin.target}. Local project pin only. No browser page opens.`}
                        onClick={() => setBrowserNotice(`${pin.label} project pin selected. No page opened.`)}
                      >
                        <span className="truncate">{pin.label}</span>
                        <span className="shrink-0 uppercase" style={{ color: pin.statusLabel === "clean" ? C.success : C.gold }}>
                          {pin.statusLabel}
                        </span>
                      </Button>
                    ))}
                  </div>
                  <div className="mt-1">{browserProjectPins.noActionText}</div>
                </div>
              </details>
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
                    <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto sm:shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px]"
                        disabled={createWatchShelfItemFromOpenTab.isPending || selectedBrowserProposalId == null}
                        title="Save this open page to Watch Shelf. No progress, thumbnail, source save, or external write."
                        onClick={() => {
                          if (selectedBrowserProposalId == null) return;
                          createWatchShelfItemFromOpenTab.mutate({
                            proposalId: selectedBrowserProposalId,
                            category: watchShelfCategory as "Watching" | "Want to Watch" | "Anime" | "YouTube" | "Twitch" | "Research",
                          });
                        }}
                      >
                        {createWatchShelfItemFromOpenTab.isPending ? "Saving" : "Save Watch"}
                      </Button>
                      <details className="relative">
                        <summary className="flex h-6 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                          Proof
                        </summary>
                        <div className="absolute right-0 z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                          <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Open receipt</div>
                          <div className="mt-1">Protected frame. No backend fetch, source save, Watch Shelf save, downloads, popups, or credential handling ran.</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Chip label="sandbox" tone={C.accent} />
                            <Chip label="local receipt" tone={C.gold} />
                          </div>
                        </div>
                      </details>
                      {browserProjectPins.items.length > 0 && (
                        <details className="relative">
                          <summary className="flex h-6 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                            <Folder size={11} strokeWidth={1.8} aria-hidden="true" />
                            Pins
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                            <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{browserProjectPins.title}</div>
                            <div className="mt-1 grid gap-1">
                              {browserProjectPins.items.map((pin) => (
                                <Button
                                  key={`${pin.label}-${pin.target}`}
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-full justify-between px-1.5 text-[10px]"
                                  title={`${pin.target}. Local project pin only. No browser page opens.`}
                                  onClick={() => setBrowserNotice(`${pin.label} project pin selected. No page opened.`)}
                                >
                                  <span className="truncate">{pin.label}</span>
                                  <span className="shrink-0 uppercase" style={{ color: pin.statusLabel === "clean" ? C.success : C.gold }}>
                                    {pin.statusLabel}
                                  </span>
                                </Button>
                              ))}
                            </div>
                            <div className="mt-1">{browserProjectPins.noActionText}</div>
                          </div>
                        </details>
                      )}
                      {selectedBrowserHistoryItems.length > 0 && (
                        <details className="relative">
                          <summary className="flex h-6 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                            History
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 w-72 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                            <div className="font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Local history</div>
                            <div className="mt-1 grid gap-1">
                              {selectedBrowserHistoryItems.map((item) => (
                                <div key={item.id} className="rounded px-1.5 py-1" style={{ background: "rgba(5, 10, 10, 0.72)", border: `1px solid ${browserFrame.lineSoft}` }}>
                                  <div className="truncate font-semibold" style={{ color: C.textPrimary }}>{item.title ?? item.targetUrl}</div>
                                  <div className="truncate" style={{ color: C.textMuted }}>{item.eventType.replace(/_/g, " ")}</div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-1">Local receipt only. No cookies, credentials, page cache, or external write.</div>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded p-2" style={{ background: "linear-gradient(180deg, rgba(10, 18, 16, 0.96), rgba(2, 6, 6, 0.99))", border: `1px solid ${browserFrame.line}`, boxShadow: "inset 0 1px 34px rgba(0, 0, 0, 0.5)" }}>
                    <div className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                    <div className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r border-t" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                    <div className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b border-l" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                    <div className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b border-r" aria-hidden="true" style={{ borderColor: browserFrame.line }} />
                    <div className="mb-1.5 flex items-center gap-1.5 px-1">
                      <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" style={{ background: C.warning }} />
                      <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" style={{ background: C.gold }} />
                      <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" style={{ background: C.success }} />
                      <span className="ml-1 truncate text-[10px] font-mono" style={{ color: C.textMuted }}>{sandboxFrameTarget}</span>
                    </div>
                    <iframe
                      key={`${sandboxFrameProposalId ?? "frame"}-${sandboxFrameReloadKey}`}
                      title="CereBro sandbox browser frame"
                      src={sandboxFrameTarget}
                      sandbox="allow-scripts allow-forms"
                      referrerPolicy="no-referrer"
                      className="h-[clamp(300px,52dvh,620px)] w-full rounded sm:h-[clamp(350px,56dvh,620px)]"
                      style={{ background: "#fff", border: "1px solid rgba(244, 239, 227, 0.16)", boxShadow: "0 18px 36px rgba(0, 0, 0, 0.36)" }}
                    />
                  </div>
                </div>
              ) : (
              <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ minHeight: "clamp(360px, 54dvh, 600px)" }}>
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
                      {browserDraft.kind === "empty" ? "Use the address bar. Stage creates the approval package before any page opens." : browserDraft.displayTarget}
                    </div>
                    <div className="mt-3 flex justify-center gap-1">
                      <Chip label={browserDraft.kind === "empty" ? "empty" : browserDraft.kind} tone={browserDraft.kind === "empty" ? C.textMuted : C.accent} />
                      <Chip label={browserDraft.canOpen ? "ready" : "approval gated"} tone={browserDraft.canOpen ? C.success : C.warning} />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="rounded p-3 text-[11px] leading-snug" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Page State</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Chip label={browserDraft.kind === "empty" ? "no draft" : "draft staged"} tone={browserDraft.kind === "empty" ? C.textMuted : C.accent} />
                      <Chip label="local" tone={C.gold} />
                    </div>
                    <div className="mt-2" style={{ color: C.textMuted }}>
                      {browserDraft.kind === "empty" ? "Nothing opens until you stage a target." : "Stage the target to create the approval gate."}
                    </div>
                  </div>
                  {selectedBrowserProposalId != null && (
                  <div className="rounded p-2 text-left text-[10px] leading-snug" aria-label="Browser open gate" style={{ background: "rgba(5, 10, 10, 0.64)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel, color: C.textMuted }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>Open Gate</div>
                        <div className="mt-0.5 truncate">
                          {browserLiveRunnerPreflight.isLoading
                            ? "Reading approval state."
                            : browserLiveRunnerPreflight.data?.nextAction ?? "Open gate is unavailable for this proposal."}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        <Chip label={browserLiveRunnerPreflight.data?.canOpenPage ? "ready" : "blocked"} tone={browserLiveRunnerPreflight.data?.canOpenPage ? C.success : C.warning} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[10px]"
                          disabled={recordBrowserSandboxFrameOpen.isPending || !canOpenSandboxFrame}
                          title={canOpenSandboxFrame ? "Open the target in the sandbox frame." : "Requires open-ready state."}
                          onClick={() => recordBrowserSandboxFrameOpen.mutate({ proposalId: selectedBrowserProposalId })}
                        >
                          {recordBrowserSandboxFrameOpen.isPending ? "Opening" : "Open Frame"}
                        </Button>
                        <details className="relative">
                          <summary className="flex h-6 cursor-pointer list-none items-center rounded px-2 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                            Details
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 w-80 rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, color: C.textMuted, boxShadow: `0 16px 36px ${C.background}cc` }}>
                            <div className="flex flex-wrap gap-1">
                              <Chip label={`proposal #${selectedBrowserProposalId}`} tone={C.accent} />
                              {browserLiveRunnerPreflight.data && (
                                <Chip label={`${browserLiveRunnerPreflight.data.summary.missingCount} missing`} tone={browserLiveRunnerPreflight.data.summary.missingCount > 0 ? C.warning : C.accent} />
                              )}
                            </div>
                            {browserLiveRunnerPreflight.data ? (
                              <div className="mt-2 grid gap-1">
                                {browserLiveRunnerPreflight.data.latestRunnerAudit && (
                                  <div>Latest audit #{browserLiveRunnerPreflight.data.latestRunnerAudit.id}: {browserLiveRunnerPreflight.data.latestRunnerAudit.runnerState.replace(/_/g, " ")}.</div>
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
                                    title="Create the separate live-runner approval preview. This does not open a page."
                                    onClick={() => createBrowserLiveRunnerApprovalPreview.mutate({
                                      proposalId: selectedBrowserProposalId,
                                      reason: "Prepare explicit live-runner approval. This does not open the page.",
                                    })}
                                  >
                                    {createBrowserLiveRunnerApprovalPreview.isPending ? "Staging" : "Stage Gate"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px]"
                                    disabled={runBrowserLiveRunnerBlocked.isPending}
                                    title="Write a blocked live-runner audit. This does not open a page."
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
                                        ? `Blocked by ${browserLiveRunnerPreflight.data.summary.nextMissingGate ?? "missing gate"}.`
                                        : "Mark the local tab runner-ready. This does not open a page."
                                    }
                                    onClick={() => prepareBrowserLiveRunnerOpenReadiness.mutate({ proposalId: selectedBrowserProposalId })}
                                  >
                                    {prepareBrowserLiveRunnerOpenReadiness.isPending ? "Preparing" : "Ready"}
                                  </Button>
                                </div>
                                <div>{browserLiveRunnerPreflight.data.noActionTaken.slice(0, 2).join(" ")}</div>
                              </div>
                            ) : (
                              <div className="mt-2">Open gate is not available for this proposal.</div>
                            )}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                )}
                  <details className="rounded p-2 text-[10px] leading-snug" style={{ background: "rgba(5, 10, 10, 0.56)", border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted }}>
                    <summary className="cursor-pointer list-none font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}>Proof</summary>
                    <div className="mt-1">{browserDraft.kind === "empty" ? browserShell.noActionText : browserDraft.noActionText}</div>
                  </details>
                </div>
              </div>
              )}
            </section>
          ) : (
            <section id="browser-watch-shelf" className="rounded p-2 sm:p-3" aria-label="Watch Shelf tab" style={{ background: "radial-gradient(circle at 18% 0%, rgba(198, 155, 85, 0.1), transparent 34%), linear-gradient(180deg, rgba(8, 15, 14, 0.99), rgba(3, 7, 7, 0.99))", border: `1px solid ${browserFrame.line}`, minHeight: "clamp(430px, 62dvh, 680px)", boxShadow: "inset 0 1px 28px rgba(0, 0, 0, 0.46)" }}>
              <div className="flex flex-wrap items-start justify-between gap-2 rounded px-2 py-1.5" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>{watchShelf.title}</div>
                  <div className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>Saved pages. Local rows only.</div>
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
                      category: watchShelfCategory as "Watching" | "Want to Watch" | "Anime" | "YouTube" | "Twitch" | "Research",
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
                    ? "This saves a local shelf row only. It does not track progress or save media."
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
                    <summary className="cursor-pointer list-none font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}>Proof</summary>
                    <div className="mt-1">{watchShelfDraft.noActionText}</div>
                  </details>
                </div>
              </div>
            </section>
          )}

          <div className="flex justify-end">
            <details className="relative">
              <summary className="flex h-7 cursor-pointer list-none items-center gap-1 rounded px-2 text-[10px] font-semibold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Browser utilities" style={{ border: `1px solid ${browserFrame.lineSoft}`, color: C.textMuted, background: "rgba(8, 14, 13, 0.74)", boxShadow: browserFrame.bevel, ["--tw-ring-color" as string]: C.accent }}>
                <MoreHorizontal size={13} strokeWidth={1.8} aria-hidden="true" />
                Tools
              </summary>
              <div className="absolute bottom-full right-0 z-20 mb-1 grid w-56 gap-1 rounded p-1.5" role="menu" style={{ background: "rgba(9, 16, 15, 0.98)", border: `1px solid ${browserFrame.line}`, boxShadow: `0 16px 36px ${C.background}cc` }}>
                <Button type="button" size="sm" variant="ghost" className="h-7 justify-start px-2 text-[11px]" role="menuitem" onClick={() => onNavigate?.("workbench")}>Workbench receipts</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 justify-start px-2 text-[11px]" role="menuitem" onClick={() => onNavigate?.("approvals")}>Approvals</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 justify-start px-2 text-[11px]" role="menuitem" onClick={() => onNavigate?.("sources")}>Sources</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 justify-start px-2 text-[11px]" role="menuitem" onClick={() => onNavigate?.("security")}>Spock gate</Button>
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
