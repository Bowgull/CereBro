import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";
import { memoryPanelCopy } from "@/lib/memoryPanelCopyModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { disambiguateSessionOptions, groupSessionFilters } from "@/lib/sessionLabels";

const KINDS = ["fact", "note", "reference", "feedback"] as const;
type Kind = (typeof KINDS)[number];

function formatRelative(unixSec: number): string {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MemoryPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<Kind>("note");
  const [proposalSessionId, setProposalSessionId] = useState("none");
  const [tags, setTags] = useState("");
  const [deleteGate, setDeleteGate] = useState<{ id: number; body: string } | null>(null);

  const selectedSessionIds =
    sessionFilter === "all" ? undefined : sessionFilter.split(",").map((id) => Number(id)).filter(Boolean);
  const list = trpc.memory.list.useQuery({
    kind: filter === "all" ? undefined : filter,
    sessionIds: selectedSessionIds,
    search: search.trim() || undefined,
  });
  const contract = trpc.memory.contract.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const proposalsQuery = trpc.memory.proposals.useQuery({
    sessionIds: selectedSessionIds,
    limit: 100,
  });
  const sessions = trpc.sessions.recent.useQuery(
    { limit: 50 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const propose = trpc.memory.propose.useMutation({
    onSuccess: () => utils.memory.proposals.invalidate(),
  });
  const del = trpc.memory.delete.useMutation({
    onSuccess: () => utils.memory.list.invalidate(),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    propose.mutate({
      body: trimmed,
      kind,
      tags: tags.trim() || undefined,
      sessionId: proposalSessionId === "none" ? undefined : Number(proposalSessionId),
      proposedByAgent: "aang",
    });
    setBody("");
    setTags("");
  }

  const entries = list.data ?? [];
  const proposals = proposalsQuery.data ?? [];
  const sessionOptions = disambiguateSessionOptions(sessions.data?.items ?? []);
  const sessionFilters = groupSessionFilters(sessions.data?.items ?? []);
  const trusted = entries.filter((entry) => entry.kind === "fact" || entry.kind === "reference").length;
  const copy = memoryPanelCopy();

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ background: C.background, border: `1px solid ${C.borderSoft}` }}
    >
      <div
        className="flex items-center justify-between px-2.5 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            {copy.title}
            <span className="ml-2" style={{ color: C.textSecondary }}>{entries.length}</span>
            {proposals.length > 0 && (
              <span className="ml-2" style={{ color: C.warning }}>{proposals.length} proposed</span>
            )}
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>
            {copy.subtitle}
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <MemoryStat label={copy.stats.saved} value={String(entries.length)} tone={C.gold} />
        <MemoryStat label={copy.stats.trusted} value={String(trusted)} tone={C.success} />
        <MemoryStat label={copy.stats.proposed} value={String(proposals.length)} tone={proposals.length > 0 ? C.warning : C.textMuted} />
      </div>
      <section className="shrink-0 px-2.5 py-1.5" aria-label="Memory reuse contract" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              {copy.contractTitle}
            </div>
            <Badge variant="warning" className="uppercase">
              {copy.contractNoWrite}
            </Badge>
          </div>
          {contract.isLoading ? (
            <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.contractLoading}</div>
          ) : contract.data ? (
            <>
              <div className="grid grid-cols-2 gap-1">
                <MemoryContractDatum
                  label={copy.contractRouteLabel}
                  value={copy.contractRouteValue(contract.data.normalRoute, contract.data.archiveRoute)}
                  tone={C.accent}
                />
                <MemoryContractDatum
                  label={copy.contractReviewLabel}
                  value={copy.contractReviewValue(contract.data.pendingProposals, contract.data.oakValidatedProposals)}
                  tone={contract.data.pendingProposals > 0 ? C.warning : C.success}
                />
                <MemoryContractDatum
                  label={copy.contractGateLabel}
                  value={contract.data.canAutomateRetrieval ? "retrieval allowed" : "validation required"}
                  tone={contract.data.canAutomateRetrieval ? C.danger : C.gold}
                />
                <MemoryContractDatum
                  label={copy.contractNextLabel}
                  value={contract.data.nextAction}
                  tone={C.textSecondary}
                />
              </div>
              <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                {contract.data.gates[2]}
              </div>
            </>
          ) : (
            <div className="text-[11px]" style={{ color: C.danger }}>Reuse contract unavailable.</div>
          )}
        </div>
      </section>
      <div
        className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 shrink-0"
        aria-label="Memory kind filters"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, scrollbarColor: `${C.border} ${C.backgroundSoft}` }}
      >
          {(["all", ...KINDS] as const).map((k) => {
            const active = filter === k;
            return (
              <Button
                type="button"
                key={k}
                onClick={() => setFilter(k)}
                className="shrink-0"
                variant={active ? "secondary" : "ghost"}
                size="sm"
              >
                {k}
              </Button>
            );
          })}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="ml-auto w-44 shrink-0"
          />
      </div>
      <div
        className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 shrink-0"
        aria-label="Memory run filters"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, scrollbarColor: `${C.border} ${C.backgroundSoft}` }}
      >
        <FilterButton
          label={copy.allRunsLabel}
          active={sessionFilter === "all"}
          count={entries.length + proposals.length}
          onClick={() => setSessionFilter("all")}
        />
        {sessionFilters.map((session) => (
          <FilterButton
            key={session.key}
            label={session.label}
            active={sessionFilter === session.ids.join(",")}
            count={
              entries.filter((entry) => entry.sessionId != null && session.ids.includes(entry.sessionId)).length +
              proposals.filter((proposal) => proposal.sessionId != null && session.ids.includes(proposal.sessionId)).length
            }
            title={session.title}
            onClick={() => setSessionFilter(session.ids.join(","))}
          />
        ))}
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-1.5 px-2.5 py-1.5 shrink-0 sm:grid-cols-[minmax(0,1fr)_76px]" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={copy.inputPlaceholder}
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!body.trim() || propose.isPending}
          title={!body.trim() ? copy.stageTitleEmpty : copy.stageTitleReady}
          aria-label={copy.stageAria}
        >
          Propose
        </Button>
        <details className="sm:col-span-2">
          <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" style={{ color: C.textMuted, ["--tw-ring-color" as string]: C.accent }}>
            {copy.routingTitle}
          </summary>
          <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-[120px_145px_minmax(0,1fr)]">
            <AppSelect
              label={copy.kindLabel}
              value={kind}
              onChange={(value) => setKind(value as Kind)}
              options={KINDS.map((k) => ({ value: k, label: k }))}
            />
            <AppSelect
              label={copy.runLinkLabel}
              value={proposalSessionId}
              onChange={setProposalSessionId}
              options={[
                { value: "none", label: copy.noRunLink },
                ...sessionOptions.map((session) => ({
                  value: String(session.id),
                  label: session.optionLabel,
                })),
              ]}
            />
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={copy.tagsPlaceholder}
              className="w-full"
            />
          </div>
        </details>
      </form>

      <div className="flex-1 overflow-y-auto">
        {proposals.length > 0 && (
          <div style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.warning, background: C.surface }}>
              {copy.proposedTitle}
            </div>
            {proposals.map((p) => (
              <div key={p.id} className="px-2.5 py-1.5" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
                <div className="mb-1 flex items-center gap-1">
                  <Badge variant="warning" className="uppercase">
                    {p.status}
                  </Badge>
                  {p.sessionDisplayName && (
                    <Badge variant="outline" className="uppercase" title={p.sessionDisplayName}>
                      {p.sessionDisplayName}
                    </Badge>
                  )}
                  <span className="text-xs" style={{ color: C.textMuted }}>
                    {copy.oakLabel}: {p.oakStatus}
                  </span>
                </div>
                <div className="line-clamp-3 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        )}
        {list.isLoading ? (
          <div className="px-3 py-2 text-[11px]" style={{ color: C.textMuted }}>{copy.loadingText}</div>
        ) : entries.length === 0 ? (
          <div className="mx-2 my-2 rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            {copy.emptyText}
          </div>
        ) : (
          entries.map((m) => (
            <div
              key={m.id}
              className="px-2.5 py-1.5"
              style={{ borderBottom: `1px solid ${C.borderSoft}` }}
            >
              <div className="mb-1 flex items-center gap-1">
                <Badge variant={badgeVariant(m.kind)} className="uppercase">
                  {m.kind}
                </Badge>
                {m.sessionDisplayName && (
                  <Badge variant="outline" className="uppercase" title={m.sessionDisplayName}>
                    {m.sessionDisplayName}
                  </Badge>
                )}
                <span className="text-xs" style={{ color: C.textMuted }}>
                  {formatRelative(m.createdAt)}
                </span>
                {m.tags && (
                  <span className="text-xs" style={{ color: C.textMuted }}>· {m.tags}</span>
                )}
                <Button
                  type="button"
                  onClick={() => setDeleteGate({ id: m.id, body: m.body })}
                  className="ml-auto"
                  variant="destructive"
                  size="sm"
                  aria-label={`Delete memory entry ${m.body.slice(0, 80)}`}
                  title={copy.deleteTitle}
                >
                  Delete
                </Button>
              </div>
              <div className="line-clamp-3 text-[11px] leading-snug" style={{ color: C.textPrimary }}>
                {m.body}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={deleteGate != null} onOpenChange={(open) => !open && setDeleteGate(null)}>
        <DialogContent gate showCloseButton>
          <DialogHeader>
            <DialogTitle>{copy.deleteDialogTitle}</DialogTitle>
            <DialogDescription>
              {copy.deleteDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded p-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.warning }}>
              Target
            </div>
            <div className="line-clamp-3" style={{ color: C.textPrimary }}>
              {deleteGate?.body ?? "Unknown memory entry"}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setDeleteGate(null)}
              title={copy.cancelDeleteTitle}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!deleteGate || del.isPending}
              onClick={() => {
                if (!deleteGate || del.isPending) return;
                del.mutate(
                  { id: deleteGate.id, approved: true },
                  { onSuccess: () => setDeleteGate(null) },
                );
              }}
              title={copy.confirmDeleteTitle}
              aria-label={copy.confirmDeleteAria}
              variant="destructive"
            >
              {del.isPending ? copy.deletingText : copy.deleteButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterButton({
  label,
  active,
  count,
  title,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  title?: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="shrink-0"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      title={title}
    >
      {label}
      <Badge variant={active ? "default" : "secondary"} className="ml-1">
        {count}
      </Badge>
    </Button>
  );
}

function MemoryStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

function MemoryContractDatum({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 rounded px-2 py-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="truncate text-[9px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }} title={label}>
        {label}
      </div>
      <div className="mt-0.5 truncate text-[10px] leading-snug" style={{ color: tone }} title={value}>
        {value}
      </div>
    </div>
  );
}

function AppSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <UiSelect value={value} onValueChange={onChange} aria-label={label}>
      <SelectTrigger size="sm" className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}

function badgeVariant(kind: Kind): "default" | "secondary" | "warning" | "success" {
  if (kind === "fact") return "default";
  if (kind === "reference") return "warning";
  if (kind === "feedback") return "success";
  return "secondary";
}
