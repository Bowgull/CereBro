import { useState } from "react";
import { ArrowLeft, ArrowRight, Folder, MoreHorizontal, Plus, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cerebroColors as C } from "@/lib/keepConfig";
import { trpc } from "@/lib/trpc";
import {
  workbenchBrowserActionPreviewModel,
  workbenchBrowserDraftModel,
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

export default function BrowserPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: BrowserRoute) => void }) {
  const [browserSurface, setBrowserSurface] = useState<"page" | "watch">("page");
  const [browserAddressDraft, setBrowserAddressDraft] = useState("");
  const [browserActionLabel, setBrowserActionLabel] = useState("Add to Watch");
  const [watchShelfCategory, setWatchShelfCategory] = useState("Watching");
  const [selectedBrowserProposalId, setSelectedBrowserProposalId] = useState<number | null>(null);
  const [preparedApprovalId, setPreparedApprovalId] = useState<number | null>(null);
  const [browserNotice, setBrowserNotice] = useState<string | null>(null);
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

  const browserShell = workbenchBrowserShellModel();
  const browserDraft = workbenchBrowserDraftModel(browserAddressDraft);
  const browserTabState = workbenchBrowserTabStateModel(browserDraft);
  const browserAction =
    browserShell.actions.find((action) => action.label === browserActionLabel) ?? browserShell.actions[0];
  const browserActionPreview = workbenchBrowserActionPreviewModel(browserAction, browserDraft);
  const browserDraftTabs = (browserTabSessionStorageContract.data?.items ?? [])
    .filter((item) => item.state === "draft")
    .slice(0, 3);
  const browserProjectPins = workbenchBrowserProjectPinsModel(projects.data?.projects ?? []);
  const watchShelf = workbenchWatchShelfModel();
  const watchShelfDraft = workbenchWatchShelfDraftModel(browserDraft, watchShelfCategory);
  const isPreparingBrowserDraft =
    createBrowserActionProposal.isPending ||
    createBrowserTabSessionDraft.isPending ||
    createBrowserActionApprovalPreview.isPending ||
    createBrowserActionWorkbenchBody.isPending ||
    createBrowserActionSpockGate.isPending ||
    createBrowserResultRecoveryScaffold.isPending;

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
            className="flex items-center gap-1 overflow-x-auto rounded-t px-1 pt-1"
            aria-label="Browser page tabs"
            style={{ background: "rgba(4, 8, 8, 0.96)", border: `1px solid ${browserFrame.lineSoft}`, borderBottom: 0, boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.05)" }}
          >
            <Button
              type="button"
              size="sm"
              variant={browserSurface === "page" && selectedBrowserProposalId == null ? "secondary" : "outline"}
              className="h-7 shrink-0 rounded-b-none px-2"
              aria-pressed={browserSurface === "page" && selectedBrowserProposalId == null}
              onClick={() => {
                setBrowserSurface("page");
                setSelectedBrowserProposalId(null);
                setBrowserNotice(null);
              }}
              style={{
                background: browserSurface === "page" && selectedBrowserProposalId == null ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.76)",
                border: `1px solid ${browserSurface === "page" && selectedBrowserProposalId == null ? browserFrame.line : browserFrame.lineSoft}`,
                color: browserSurface === "page" && selectedBrowserProposalId == null ? C.textPrimary : C.textMuted,
                boxShadow: browserFrame.bevel,
              }}
            >
              Current Page
            </Button>
            {browserDraftTabs.map((tab) => {
              const active = browserSurface === "page" && selectedBrowserProposalId === tab.proposalId;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "outline"}
                  className="h-7 max-w-[160px] shrink-0 rounded-b-none px-2"
                  aria-pressed={active}
                  title={`${tab.targetUrl}. Draft tab only. No page opens.`}
                  onClick={() => {
                    setBrowserSurface("page");
                    setBrowserAddressDraft(tab.targetUrl);
                    setSelectedBrowserProposalId(tab.proposalId);
                    setBrowserNotice(`Draft tab ${tab.tabId} selected. No page opened.`);
                  }}
                  style={{
                    background: active ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.76)",
                    border: `1px solid ${active ? browserFrame.line : browserFrame.lineSoft}`,
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
              className="h-7 shrink-0 rounded-b-none px-2"
              aria-pressed={browserSurface === "watch"}
              onClick={() => setBrowserSurface("watch")}
              style={{
                background: browserSurface === "watch" ? browserFrame.plaqueActive : "rgba(8, 14, 13, 0.76)",
                border: `1px solid ${browserSurface === "watch" ? browserFrame.line : browserFrame.lineSoft}`,
                color: browserSurface === "watch" ? C.textPrimary : C.textMuted,
                boxShadow: browserFrame.bevel,
              }}
            >
              Watch Shelf
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={!browserTabState.canCreateTab} className="h-7 w-7 shrink-0 px-0" aria-label="New browser tab planned">
              <Plus size={13} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <div className="ml-auto hidden min-w-[180px] text-[10px] leading-snug md:block" style={{ color: C.textMuted }}>
              {browserTabState.tabSummary}
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded p-1.5" style={{ background: "rgba(6, 11, 11, 0.92)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled aria-label="Browser back planned">
              <ArrowLeft size={14} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled aria-label="Browser forward planned">
              <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled aria-label="Browser reload planned">
              <RotateCw size={13} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <Input
              value={browserAddressDraft}
              onChange={(event) => {
                setBrowserAddressDraft(event.target.value);
                setPreparedApprovalId(null);
              }}
              placeholder={browserShell.addressPlaceholder}
              aria-label="Browser address and search field"
              className="h-8 flex-1"
              title="Stages a local page draft only. It does not open, fetch, search, save, or capture."
              style={{
                background: "rgba(3, 7, 7, 0.92)",
                border: `1px solid ${browserFrame.line}`,
                boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.05)",
              }}
            />
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
                    target: browserDraft.raw,
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

          {browserProjectPins.items.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto rounded px-1.5 py-1" aria-label="Browser project pins" style={{ background: "rgba(7, 12, 12, 0.88)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
              <div className="flex shrink-0 items-center gap-1 pr-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                <Folder size={12} strokeWidth={1.8} aria-hidden="true" />
                {browserProjectPins.title}
              </div>
              {browserProjectPins.items.map((pin) => (
                <Button
                  key={`${pin.label}-${pin.target}`}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 max-w-[150px] shrink-0 gap-1 px-2"
                  title={`${pin.target}. Local project pin only. No browser page opens.`}
                  onClick={() => setBrowserNotice(`${pin.label} project pin selected. No page opened.`)}
                  style={{
                    background: "rgba(11, 18, 16, 0.72)",
                    border: `1px solid ${browserFrame.lineSoft}`,
                    boxShadow: browserFrame.bevel,
                  }}
                >
                  <span className="truncate">{pin.label}</span>
                  <span className="shrink-0 text-[9px] uppercase" style={{ color: pin.statusLabel === "clean" ? C.success : C.gold }}>
                    {pin.statusLabel}
                  </span>
                </Button>
              ))}
              <div className="ml-auto hidden min-w-[190px] text-[10px] leading-snug md:block" style={{ color: C.textMuted }}>
                {browserProjectPins.noActionText}
              </div>
            </div>
          )}

          {browserSurface === "page" ? (
            <section className="rounded p-4" aria-label="Browser current page" style={{ background: browserFrame.page, border: `1px solid ${browserFrame.lineSoft}`, minHeight: "clamp(430px, 62dvh, 680px)", boxShadow: "inset 0 1px 28px rgba(0, 0, 0, 0.48), inset 0 0 0 1px rgba(244, 239, 227, 0.02)" }}>
              <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center" style={{ minHeight: "clamp(360px, 54dvh, 600px)" }}>
                <div className="mb-3 h-10 w-10 rounded" aria-hidden="true" style={{ background: browserFrame.plaque, border: `1px solid ${browserFrame.line}`, boxShadow: browserFrame.bevel }} />
                <div className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                  {browserDraft.kind === "empty" ? browserShell.emptyTitle : browserDraft.tabLabel}
                </div>
                <div className="mt-1 max-w-lg text-[11px] leading-snug" style={{ color: C.textMuted }}>
                  {browserDraft.kind === "empty" ? browserShell.emptyBody : browserDraft.displayTarget}
                </div>
                <div className="mt-2 flex justify-center gap-1">
                  <Chip label={browserDraft.kind === "empty" ? "no draft" : browserDraft.kind} tone={browserDraft.kind === "empty" ? C.textMuted : C.accent} />
                  <Chip label={browserDraft.canOpen ? "can open" : "open blocked"} tone={browserDraft.canOpen ? C.success : C.warning} />
                </div>
                <div className="mt-2 max-w-xl text-[11px] leading-snug" style={{ color: C.textMuted }}>
                  {browserDraft.kind === "empty" ? browserShell.noActionText : browserDraft.noActionText}
                </div>
              </div>
            </section>
          ) : (
            <section id="browser-watch-shelf" className="rounded p-3" aria-label="Watch Shelf tab" style={{ background: "radial-gradient(circle at 18% 0%, rgba(198, 155, 85, 0.1), transparent 34%), linear-gradient(180deg, rgba(8, 15, 14, 0.99), rgba(3, 7, 7, 0.99))", border: `1px solid ${browserFrame.line}`, minHeight: "clamp(430px, 62dvh, 680px)", boxShadow: "inset 0 1px 28px rgba(0, 0, 0, 0.46)" }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.gold }}>{watchShelf.title}</div>
                  <div className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>Saved watch pages live here after the runner exists.</div>
                </div>
                <Button type="button" size="sm" variant="outline" disabled={!watchShelfDraft.canSave} title="Requires a real open page before it can save.">
                  {watchShelfDraft.saveLabel}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {watchShelf.categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    size="sm"
                    variant={watchShelfDraft.selectedCategory === category ? "secondary" : "outline"}
                    className="h-7 px-2"
                    onClick={() => setWatchShelfCategory(category)}
                    aria-pressed={watchShelfDraft.selectedCategory === category}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="mt-3 rounded p-3 text-[11px] leading-snug" style={{ background: "rgba(5, 10, 10, 0.82)", border: `1px solid ${browserFrame.lineSoft}`, boxShadow: browserFrame.bevel }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                    {watchShelfDraft.candidateLabel}
                  </div>
                  <Chip label={watchShelfDraft.selectedCategory} tone={watchShelfDraft.selectedCategory === "Anime" ? C.warning : C.accent} />
                </div>
                <div className="mt-1 break-all" style={{ color: C.textMuted }}>{watchShelfDraft.candidateTarget}</div>
                <div className="mt-1" style={{ color: C.textMuted }}>
                  {browserDraft.kind === "empty" ? watchShelf.emptyBody : "This is only a local shelf readback. It cannot save until a real page is open."}
                </div>
              </div>
              <div className="mt-3 text-[11px] leading-snug" style={{ color: C.textMuted }}>
                {watchShelfDraft.noActionText}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-1">
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate?.("workbench")}>Workbench receipts</Button>
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate?.("approvals")}>Approvals</Button>
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate?.("sources")}>Sources</Button>
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate?.("security")}>Spock gate</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
