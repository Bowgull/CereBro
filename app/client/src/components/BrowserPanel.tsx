import { useState } from "react";
import { ArrowLeft, ArrowRight, Folder, MoreHorizontal, Plus, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cerebroColors as C, cerebroTheme as T } from "@/lib/keepConfig";
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

const G = T.graphiteCandle;

type BrowserRoute = "workbench" | "sources" | "security";

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
    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: tone, border: `1px solid ${G.lineSoft}`, background: G.slabMuted }}>
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

  return (
    <div className="flex h-full flex-col overflow-hidden" role="region" aria-label="Browser" style={{ background: G.slabMuted, border: `1px solid ${G.line}`, color: C.textPrimary }}>
      <header className="shrink-0 px-2.5 py-2" style={{ background: G.slabRaised, borderBottom: `1px solid ${G.lineSoft}` }}>
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
          <div className="flex items-center gap-1 overflow-x-auto rounded-t px-1 pt-1" aria-label="Browser page tabs" style={{ background: "rgba(7, 12, 12, 0.96)", border: `1px solid ${G.lineSoft}`, borderBottom: 0 }}>
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

          <div className="flex items-center gap-1.5 rounded p-1.5" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
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
              onChange={(event) => setBrowserAddressDraft(event.target.value)}
              placeholder={browserShell.addressPlaceholder}
              aria-label="Browser address and search field"
              className="h-8 flex-1"
              title="Stages a local page draft only. It does not open, fetch, search, save, or capture."
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2"
              disabled={browserDraft.kind === "empty" || createBrowserActionProposal.isPending || createBrowserTabSessionDraft.isPending}
              title="Stage a local Browser proposal and draft tab row. This does not open, fetch, search, save, or capture."
              aria-label="Stage browser page draft"
              onClick={() => {
                createBrowserActionProposal.mutate(
                  {
                    actionLabel: browserActionPreview.label,
                    target: browserDraft.raw,
                    draftKind: browserDraft.kind,
                  },
                  {
                    onSuccess: (result) => {
                      setSelectedBrowserProposalId(result.proposal.id);
                      setBrowserNotice(`Browser proposal #${result.proposal.id} saved. Not run.`);
                      createBrowserTabSessionDraft.mutate({ proposalId: result.proposal.id });
                    },
                  },
                );
              }}
            >
              {createBrowserActionProposal.isPending || createBrowserTabSessionDraft.isPending ? "Staging" : "Stage"}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 px-0" disabled aria-label="Browser quiet shield">
              <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
            </Button>
            <details className="relative">
              <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" aria-label="Browser page actions" style={{ border: `1px solid ${G.lineSoft}`, color: C.textSecondary, ["--tw-ring-color" as string]: C.accent }}>
                <MoreHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
              </summary>
              <div className="absolute right-0 z-20 mt-1 w-56 rounded p-1.5" role="menu" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}`, boxShadow: `0 16px 36px ${C.background}cc` }}>
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
            <div className="rounded px-2 py-1 text-[10px] leading-snug" role="status" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
              {browserNotice}
            </div>
          )}

          {browserProjectPins.items.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto rounded px-1.5 py-1" aria-label="Browser project pins" style={{ background: "rgba(7, 12, 12, 0.88)", border: `1px solid ${G.lineSoft}` }}>
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
            <section className="rounded p-4" aria-label="Browser current page" style={{ background: C.background, border: `1px solid ${G.lineSoft}`, minHeight: "clamp(360px, 54dvh, 560px)" }}>
              <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center" style={{ minHeight: "clamp(300px, 46dvh, 500px)" }}>
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
            <section id="browser-watch-shelf" className="rounded p-3" aria-label="Watch Shelf tab" style={{ background: G.slab, border: `1px solid ${G.candleSoft}`, minHeight: "clamp(360px, 54dvh, 560px)" }}>
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
              <div className="mt-3 rounded p-3 text-[11px] leading-snug" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
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
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate?.("sources")}>Sources</Button>
            <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate?.("security")}>Spock gate</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
