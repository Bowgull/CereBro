import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C, cerebroTheme as T } from "@/lib/keepConfig";
import { approvalPanelCopy, approvalRunnerStateCopy } from "@/lib/approvalPanelCopyModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OriginFilter = "all" | "hedwig" | "terminal" | "runtime" | "project_lab" | "source" | "browser" | "model_tools" | "other";
type StatusFilter = "pending" | "approved" | "rejected" | "cancelled";
type GroupFilter = "origin" | "project" | "action_type" | "status" | "risk";
type ApprovalRoute = "browser" | "security" | "terminal" | "workbench" | "projects" | "sources" | "inbox" | "model_tools";
type SelectOption = { value: string; label: string };
type ApprovalFocusDraft = {
  approvalId?: number;
  status?: StatusFilter;
  origin?: OriginFilter;
  query?: string;
  notice?: string;
};
type BrowserProposalReceipt = {
  proposalId: number;
  approvalKind: "review" | "live_runner";
  actionLabel: string;
  target: string;
  draftKind: string;
  riskClass: string;
  executorAgent: string;
  statusLabel: string;
  resultState: string;
  recoveryNote: string | null;
  canOpenPage: boolean;
  canExecute: boolean;
  liveRunnerAction: boolean;
  liveRunnerGate: string | null;
  watchShelfAction: boolean;
  canSaveWatchShelf: boolean;
  canPersistWatchProgress: boolean;
  watchShelfGate: string | null;
  noActionTaken: string[];
};

const origins: Array<{ id: OriginFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "hedwig", label: "Hedwig" },
  { id: "terminal", label: "Terminal" },
  { id: "runtime", label: "Runtime" },
  { id: "project_lab", label: "Projects" },
  { id: "source", label: "Sources" },
  { id: "browser", label: "Browser" },
  { id: "model_tools", label: "Models" },
  { id: "other", label: "Other" },
];

const statuses: Array<{ id: StatusFilter; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

const G = T.graphiteCandle;

function labelize(value: string | null | undefined) {
  if (!value) return "unknown";
  return value.replace(/_/g, " ");
}

function receiptLabel(value: string | null | undefined) {
  if (!value) return null;
  return sourceDisplayName(value);
}

function formatTime(unixSec: number) {
  return new Date(unixSec * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApprovalDashboardPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: ApprovalRoute) => void }) {
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [groupBy, setGroupBy] = useState<GroupFilter>("origin");
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [preflightsOpen, setPreflightsOpen] = useState(false);
  const [focusNotice, setFocusNotice] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const projects = trpc.projectIntelligence.overview.useQuery();
  const projectOptions = useMemo(
    () => (projects.data?.projects ?? []).filter((project) => project.tasks.projectId != null),
    [projects.data?.projects],
  );
  const [projectId, setProjectId] = useState<number | "all">("all");

  const approvals = trpc.approvals.queue.useQuery({
    status,
    origin,
    projectId: projectId === "all" ? undefined : projectId,
    query: query.trim() || undefined,
    limit: 60,
  });
  const groups = trpc.approvals.groups.useQuery(
    {
      groupBy,
      status,
      origin,
      projectId: projectId === "all" ? undefined : projectId,
      query: query.trim() || undefined,
    },
    {
      enabled: groupsOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const preflights = trpc.approvals.permissionPreflights.useQuery(
    {
      query: query.trim() || undefined,
      limit: 8,
    },
    {
      enabled: preflightsOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const items = approvals.data?.items ?? [];
  const selectedPreviewId = selectedId ?? items[0]?.id ?? null;
  const selectedPreview = selectedPreviewId == null ? null : items.find((item) => item.id === selectedPreviewId) ?? null;
  const selectedDetail = trpc.approvals.detail.useQuery(
    { id: selectedPreviewId ?? 0 },
    { enabled: selectedPreviewId != null },
  );
  const selected = selectedDetail.data?.approval ?? null;
  const sensitiveCount = approvals.data?.summary.sensitive ?? 0;
  const gitWriteCount = approvals.data?.summary.gitRemoteWrite ?? 0;
  const preflightItems = preflightsOpen ? preflights.data?.items ?? [] : [];
  const preflightTotal = preflightsOpen ? preflights.data?.summary.total ?? 0 : null;
  const blockedPreflights = preflightsOpen ? preflights.data?.summary.blocked ?? 0 : null;
  const copy = approvalPanelCopy();
  const visibleApprovalRows = approvals.data?.summary.visible ?? items.length;
  const hiddenApprovalRows = approvals.data?.summary.hidden ?? 0;
  const decideApproval = trpc.approvals.decide.useMutation({
    onSuccess: (result) => {
      const decidedStatus = result.approval.status as StatusFilter;
      setStatus(decidedStatus);
      setSelectedId(result.approval.id);
      setFocusNotice(`Approval #${result.approval.id} ${labelize(result.approval.status)}. No action ran.`);
      utils.approvals.queue.invalidate();
      utils.approvals.detail.invalidate();
      utils.approvals.list.invalidate();
      utils.ledger.overview.invalidate();
    },
  });

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:approvals-focus");
      if (raw) window.sessionStorage.removeItem("cerebro:approvals-focus");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as ApprovalFocusDraft;
      if (draft.status && statuses.some((item) => item.id === draft.status)) setStatus(draft.status);
      if (draft.origin && origins.some((item) => item.id === draft.origin)) setOrigin(draft.origin);
      if (typeof draft.query === "string") setQuery(draft.query);
      if (typeof draft.approvalId === "number") setSelectedId(draft.approvalId);
      setFocusNotice(draft.notice ?? "Approval receipt focused.");
    } catch {
      setFocusNotice("Approval focus could not be read. Use queue search.");
    }
  }, []);

  function openSecurityGate(target: string | null | undefined) {
    if (!target?.trim() || !onNavigate) return;
    try {
      window.sessionStorage.setItem("cerebro:security-target", target.trim());
    } catch {
      // Ignore storage failure. The Security Gate form still opens.
    }
    onNavigate("security");
  }

  function focusBrowserProposal(input: BrowserProposalReceipt) {
    try {
      window.sessionStorage.setItem(
        "cerebro:browser-focus",
        JSON.stringify({
          source: "approval_decision_return",
          proposalId: input.proposalId,
          query: input.target,
          notice: `Browser proposal #${input.proposalId} focused after approval decision. Page open remains blocked.`,
        }),
      );
    } catch {
      // Browser still opens; the user can select the staged tab manually.
    }
    onNavigate?.("browser");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: G.slabMuted, border: `1px solid ${G.line}`, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${G.line}`, background: G.slab }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              {copy.title}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              {copy.subtitle}
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close approval queue"
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-5" aria-label={copy.summaryAria}>
          <ReceiptStat label={copy.stats.pending} value={String(visibleApprovalRows)} tone={visibleApprovalRows > 0 ? C.warning : C.textMuted} />
          <ReceiptStat label={copy.stats.sensitive} value={String(sensitiveCount)} tone={sensitiveCount > 0 ? C.danger : C.textMuted} />
          <ReceiptStat label="Git Writes" value={String(gitWriteCount)} tone={gitWriteCount > 0 ? C.danger : C.textMuted} />
          <ReceiptStat label={copy.stats.checks} value={preflightTotal == null ? copy.stats.closed : String(preflightTotal)} tone={preflightTotal == null ? C.textMuted : C.accent} />
          <ReceiptStat label={copy.stats.blocked} value={blockedPreflights == null ? copy.stats.closed : String(blockedPreflights)} tone={(blockedPreflights ?? 0) > 0 ? C.danger : C.textMuted} />
        </div>

        <div className="mt-2 grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="sr-only" htmlFor="approval-search">{copy.searchLabel}</label>
          <Input
            id="approval-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchLabel}
          />
          <AppSelect
            label={copy.projectFilterLabel}
            value={String(projectId)}
            onChange={(value) => setProjectId(value === "all" ? "all" : Number(value))}
            options={[
              { value: "all", label: "All projects" },
              ...projectOptions.map((project) => ({
                value: String(project.tasks.projectId ?? ""),
                label: project.name,
              })),
            ]}
          />
          <Button
            type="button"
            onClick={() => {
              setQuery("");
              setOrigin("all");
              setStatus("pending");
              setProjectId("all");
              setSelectedId(null);
            }}
            aria-label={copy.resetAria}
            title={copy.resetTitle}
            variant="outline"
          >
            Reset
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5" aria-label={copy.originFiltersAria}>
          {origins.map((item) => (
            <FilterButton key={item.id} active={origin === item.id} label={item.label} onClick={() => setOrigin(item.id)} />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label={copy.statusFiltersAria}>
          {statuses.map((item) => (
            <FilterButton key={item.id} active={status === item.id} label={item.label} onClick={() => setStatus(item.id)} />
          ))}
        </div>

        <details
          className="mt-2 rounded p-2"
          aria-label={copy.groupsAria}
          onToggle={(event) => setGroupsOpen(event.currentTarget.open)}
          style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}
        >
          <summary className="cursor-pointer list-none">
            <span className="flex items-center justify-between gap-2">
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                  {copy.groupsTitle}
                </span>
                <span className="mt-0.5 block text-[11px]" style={{ color: C.textMuted }}>
                  {copy.groupsSubtitle}
                </span>
              </span>
              <Badge variant="secondary" className="uppercase">
                {groupsOpen ? groups.data?.groups.length ?? 0 : copy.openToRead}
              </Badge>
            </span>
          </summary>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.localOnly}</div>
            <AppSelect
              label={copy.groupSelectLabel}
              value={groupBy}
              onChange={(value) => setGroupBy(value as GroupFilter)}
              options={[
                { value: "origin", label: "Origin" },
                { value: "project", label: "Project" },
                { value: "action_type", label: "Action type" },
                { value: "status", label: "Status" },
                { value: "risk", label: "Risk" },
              ]}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {groups.isLoading ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.groupLoading}</div>
            ) : (groups.data?.groups ?? []).length === 0 ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.groupEmpty}</div>
            ) : (
              groups.data?.groups.map((group) => (
                <Button
                  key={group.key}
                  type="button"
                  onClick={() => {
                    if (groupBy === "origin" && origins.some((item) => item.id === group.key)) setOrigin(group.key as OriginFilter);
                    if (groupBy === "status" && statuses.some((item) => item.id === group.key)) setStatus(group.key as StatusFilter);
                    if (groupBy === "project") setProjectId(group.key === "unlinked" ? "all" : Number(group.key));
                    if (groupBy === "action_type" || groupBy === "risk") setQuery(group.key === "unknown" ? "" : group.key);
                    setSelectedId(null);
                  }}
                  aria-label={copy.groupFilterAria(labelize(group.label))}
                  title={copy.groupFilterTitle(labelize(group.label))}
                  className="h-auto min-w-40 justify-start rounded p-1.5 text-left"
                  variant="secondary"
                >
                  <span className="block w-full">
                    <span className="block truncate text-[11px] font-semibold leading-snug" title={group.label}>
                      {labelize(group.label)}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      <Chip label={copy.groupCount(group.count)} tone={C.accent} />
                      {group.sensitive > 0 && <Chip label={copy.groupSensitive(group.sensitive)} tone={C.danger} />}
                    </span>
                    <span className="mt-1 block text-[11px]" style={{ color: C.textMuted }}>
                      {copy.groupRecentMatches(group.sampleIds.length)}
                    </span>
                  </span>
                </Button>
              ))
            )}
          </div>
        </details>

        <div
          role="status"
          aria-live="polite"
          className="mt-2 text-[11px]"
          style={{ color: C.textMuted }}
        >
          {approvals.isLoading
            ? copy.gateLoading
            : `${copy.gateStatus(visibleApprovalRows, status, approvals.data?.summary.sensitive ?? 0)}${hiddenApprovalRows > 0 ? ` ${hiddenApprovalRows} hidden by current limit.` : ""}`}
        </div>
        {focusNotice && (
          <div
            role="status"
            className="mt-2 rounded px-2 py-1.5 text-[11px] leading-snug"
            style={{ background: G.slabRaised, border: `1px solid ${G.candleSoft}`, color: C.textSecondary }}
          >
            <span className="font-semibold uppercase tracking-wider" style={{ color: C.gold }}>Focus</span> {focusNotice}
          </div>
        )}

        <details
          className="mt-2 rounded p-2"
          aria-label={copy.checksAria}
          onToggle={(event) => setPreflightsOpen(event.currentTarget.open)}
          style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}
        >
          <summary className="cursor-pointer list-none">
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                  {copy.checksTitle}
                </span>
                <span className="mt-0.5 block text-[11px]" style={{ color: C.textMuted }}>
                  {copy.checksSubtitle}
                </span>
              </span>
              <span className="flex flex-wrap justify-end gap-1">
                <Chip label={preflightsOpen ? copy.records(preflights.data?.summary.total ?? 0) : copy.openToRead} tone={preflightsOpen ? C.accent : C.textMuted} />
                {(preflights.data?.summary.approvalRequired ?? 0) > 0 && <Chip label={copy.gated(preflights.data?.summary.approvalRequired ?? 0)} tone={C.warning} />}
                {(preflights.data?.summary.blocked ?? 0) > 0 && <Chip label={`${preflights.data?.summary.blocked} blocked`} tone={C.danger} />}
              </span>
            </span>
          </summary>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.auditHistory}</div>
            <div className="flex flex-wrap justify-end gap-1">
              <Chip label={copy.records(preflights.data?.summary.total ?? 0)} tone={C.accent} />
              {(preflights.data?.summary.approvalRequired ?? 0) > 0 && <Chip label={copy.gated(preflights.data?.summary.approvalRequired ?? 0)} tone={C.warning} />}
              {(preflights.data?.summary.blocked ?? 0) > 0 && <Chip label={`${preflights.data?.summary.blocked} blocked`} tone={C.danger} />}
            </div>
          </div>
          <div className="mt-2 grid gap-1.5">
            {preflights.isLoading ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.checkLoading}</div>
            ) : preflightItems.length === 0 ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>{copy.checkEmpty}</div>
            ) : (
              preflightItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded p-1.5"
                  style={{ background: C.backgroundSoft, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <Chip label={copy.checkChip} tone={C.textMuted} />
                    <Chip label={labelize(item.decision)} tone={item.decision === "blocked_by_hard_gate" ? C.danger : item.approvalRequired ? C.warning : C.accent} />
                    {item.sensitiveData && <Chip label="sensitive" tone={C.danger} />}
                  </div>
                  <div className="mt-1 text-xs leading-snug" style={{ color: C.textSecondary }}>
                    {labelize(item.perceptionClass)} / {labelize(item.actionClass)}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug line-clamp-2" style={{ color: C.textMuted }}>
                    {item.targetSummary
                      ? (
                          <span title={item.targetSummary}>
                            {receiptLabel(item.targetSummary)}
                          </span>
                        )
                      : item.requiredApprovals.join(", ") || item.reasons[0] || "No target summary recorded."}
                  </div>
                </div>
              ))
            )}
          </div>
          {(preflights.data?.gates ?? []).slice(0, 1).map((gate) => (
            <div key={gate} className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
              {gate}
            </div>
          ))}
        </details>
      </header>

      <div className="flex-1 grid gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]" style={{ minHeight: 0 }}>
        <section className="overflow-y-auto p-2" aria-label={copy.listAria}>
          {(approvals.data?.gates ?? []).map((gate) => (
            <div key={gate} className="mb-2 rounded px-2.5 py-1.5 text-xs" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
              {gate}
            </div>
          ))}

          {items.length === 0 ? (
            <div className="rounded p-2 text-[11px]" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
              {copy.empty}
            </div>
          ) : (
            <div className="grid gap-1.5">
              {items.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-label={`Inspect approval ${item.id}: ${labelize(item.actionType)}`}
                  className="h-auto w-full justify-start rounded p-2 text-left"
                  variant="secondary"
                  style={{
                    background: selectedPreviewId === item.id ? G.slabRaised : G.slab,
                    border: `1px solid ${selectedPreviewId === item.id ? G.candleSoft : G.lineSoft}`,
                    color: C.textPrimary,
                  }}
                >
                  <span className="block w-full">
                    <span className="flex flex-wrap items-center gap-1">
                      <Chip label={labelize(item.origin)} tone={C.accent} />
                      <Chip label={labelize(item.status)} tone={item.status === "pending" ? C.warning : C.textMuted} />
                      {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
                      {item.projectName && <Chip label={item.projectName} tone={C.gold} />}
                      {(item.costRisk === "git_remote_write" || item.actionType === "project_manual_push") && <Chip label="git write blocked" tone={C.danger} />}
                      {item.permissionPreflightId != null && <Chip label={copy.checkedChip} tone={item.permissionPreflight?.approvalRequired ? C.warning : C.accent} />}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                      {labelize(item.actionType)}
                    </span>
                    <span className="mt-1 block text-[11px] whitespace-normal line-clamp-2" style={{ color: C.textMuted }}>
                      {item.targetLabel
                        ? (
                            <span title={item.targetLabel}>
                              {receiptLabel(item.targetLabel)}
                            </span>
                          )
                        : item.reason ?? item.contextSummary ?? "No target label recorded."}
                    </span>
                    <span className="mt-1 block text-[11px]" style={{ color: C.textMuted }}>
                      {formatTime(item.createdAt)}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          )}
        </section>

        <aside className="overflow-y-auto p-2" aria-label={copy.detailAria} style={{ borderLeft: `1px solid ${G.lineSoft}`, background: G.slabRaised }}>
          {selectedPreviewId == null ? (
            <div className="rounded p-2 text-[11px]" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
              {copy.selectEmpty}
            </div>
          ) : selectedDetail.isLoading ? (
            <div className="rounded p-2 text-[11px]" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
              {copy.selectedLoading}
            </div>
          ) : !selected ? (
            <div className="rounded p-2 text-[11px]" style={{ background: G.slab, border: `1px solid ${G.lineSoft}`, color: C.textMuted }}>
              {copy.selectedMissing}
            </div>
          ) : (
            <div className="grid gap-2">
              <ApprovalReceiptChain selected={selected} onNavigate={onNavigate} onOpenSecurity={openSecurityGate} />
              <Section title={copy.decisionSection} detail={labelize(selected.status)}>
                <Meta label="Origin" value={labelize(selected.origin)} />
                <Meta label="Requested By" value={selected.requestedByAgent ?? "unknown"} />
                <Meta label="Project" value={selected.projectName ?? "unlinked"} />
                <Meta label="Action" value={labelize(selected.actionType)} />
                <Meta label="Target" value={labelize(selected.targetType)} />
                {selected.targetLabel && (
                  <Meta label="Target Label" value={receiptLabel(selected.targetLabel) ?? "unknown"} title={selected.targetLabel} />
                )}
                {selected.targetLabel && (
                  <Button
                    type="button"
                    onClick={() => openSecurityGate(selected.targetLabel)}
                    disabled={!onNavigate}
                    variant="risk"
                    size="sm"
                    className="w-fit"
                    title={copy.securityTitle}
                    aria-label={`Open Security Gate for approval ${selected.id}`}
                  >
                    Security Gate
                  </Button>
                )}
                <Meta label="Cost/Risk" value={labelize(selected.costRisk)} />
                <Meta label={copy.policyCheckLabel} value={selected.permissionPreflightId == null ? "unlinked" : labelize(selected.permissionPreflight?.decision)} />
                <div className="flex flex-wrap gap-1">
                  {selected.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={decideApproval.isPending}
                        onClick={() =>
                          decideApproval.mutate({
                            id: selected.id,
                            decision: "approved",
                            reason: "Approved from Approval Queue. This records metadata only and does not run the linked action.",
                          })
                        }
                      >
                        {decideApproval.isPending ? "Recording" : "Approve"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="risk"
                        disabled={decideApproval.isPending}
                        onClick={() =>
                          decideApproval.mutate({
                            id: selected.id,
                            decision: "rejected",
                            reason: "Rejected from Approval Queue. Linked action remains blocked.",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selected.browserProposalReceipt && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!onNavigate}
                      onClick={() => focusBrowserProposal(selected.browserProposalReceipt!)}
                    >
                      Return to Browser
                    </Button>
                  )}
                </div>
              </Section>

              <DetailSection title={copy.permissionCheckTitle} detail={selected.permissionPreflight == null ? "unlinked" : labelize(selected.permissionPreflight.decision)}>
                {selected.permissionPreflight == null ? (
                  <p className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    {copy.permissionCheckMissing}
                  </p>
                ) : (
                  <div className="grid gap-1.5">
                    <div className="flex flex-wrap gap-1">
                      <Chip label={`#${selected.permissionPreflight.id}`} tone={C.textMuted} />
                      <Chip
                        label={labelize(selected.permissionPreflight.decision)}
                        tone={selected.permissionPreflight.decision === "blocked_by_hard_gate" ? C.danger : selected.permissionPreflight.approvalRequired ? C.warning : C.accent}
                      />
                      <Chip label={`${labelize(selected.permissionPreflight.perceptionClass)} / ${labelize(selected.permissionPreflight.actionClass)}`} tone={C.accent} />
                    </div>
                    {selected.permissionPreflight.targetSummary && (
                      <Meta
                        label="Target Summary"
                        value={receiptLabel(selected.permissionPreflight.targetSummary) ?? "unknown"}
                        title={selected.permissionPreflight.targetSummary}
                      />
                    )}
                    {selected.permissionPreflight.targetSummary && (
                      <Button
                        type="button"
                        onClick={() => openSecurityGate(selected.permissionPreflight?.targetSummary)}
                        disabled={!onNavigate}
                        variant="risk"
                        size="sm"
                        className="w-fit"
                        title={copy.securityTitle}
                        aria-label={`Open Security Gate for permission check ${selected.permissionPreflight.id}`}
                      >
                        Security Gate
                      </Button>
                    )}
                    {selected.permissionPreflight.requiredApprovals.length > 0 && (
                      <div className="grid gap-1">
                        {selected.permissionPreflight.requiredApprovals.map((approval) => (
                          <Note key={approval} tone={C.warning} text={approval} />
                        ))}
                      </div>
                    )}
                    <div className="grid gap-1">
                      {selected.permissionPreflight.reasons.slice(0, 4).map((reason) => (
                        <Note key={reason} tone={C.accent} text={reason} />
                      ))}
                    </div>
                    {selected.permissionPreflight.modeEffect && (
                      <p className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                        {selected.permissionPreflight.modeEffect}
                      </p>
                    )}
                  </div>
                )}
              </DetailSection>

              <DetailSection title="Oak Notes" detail={copy.oakNotesDetail}>
                {selected.validationPreview.oakNotes.map((note) => (
                  <Note key={note} tone={C.warning} text={note} />
                ))}
              </DetailSection>

              <DetailSection title="Spock Notes" detail="shape check">
                {selected.validationPreview.spockNotes.map((note) => (
                  <Note key={note} tone={C.accent} text={note} />
                ))}
              </DetailSection>

              <DetailSection title="Reason" detail="local record">
                <p className="text-[11px] leading-snug whitespace-pre-wrap" style={{ color: C.textSecondary }}>
              {selected.reason ?? "No reason recorded."}
                </p>
              </DetailSection>

              <DetailSection title="Context" detail={copy.contextDetail}>
                <p className="text-[11px] leading-snug whitespace-pre-wrap" style={{ color: C.textMuted }}>
                  {selected.contextSummary ?? "No context summary recorded."}
                </p>
              </DetailSection>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      variant={active ? "secondary" : "ghost"}
      size="sm"
    >
      {label}
    </Button>
  );
}

function ReceiptStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

type ApprovalChainItem = {
  id: number;
  origin: string;
  actionType: string;
  targetType: string | null;
  requestedByAgent: string | null;
  projectName: string | null;
  targetLabel: string | null;
  permissionPreflightId: number | null;
  permissionPreflight: {
    decision: string | null;
    approvalRequired: boolean;
    targetSummary: string | null;
  } | null;
  costRisk: string | null;
  browserProposalReceipt?: BrowserProposalReceipt | null;
  executionLinks?: Array<{
    proposalId: number;
    sourceType: string;
    sourceId: number;
    actionType: string;
    riskClass: string;
    executorAgent: string;
    command: string | null;
    cwd: string | null;
    workbenchEvidenceId: number | null;
    proposalResultState: string;
    proposalStatus: string;
    recoveryNote: string | null;
    resultId: number | null;
    resultStatus: string | null;
    resultExitCode: number | null;
    resultCreatedAt: number | null;
  }>;
};

function nextSurfaceForApproval(item: ApprovalChainItem): { label: string; route: ApprovalRoute | null; reason: string } {
  if (item.targetType === "browser_action_proposal" || item.browserProposalReceipt) {
    return {
      label: "Workbench",
      route: "workbench",
      reason: "Review the Browser proposal body, policy, and gates. Approval Queue does not open pages.",
    };
  }
  if (item.targetType === "model_tool_ollama_status_check" || item.actionType.includes("ollama") || item.actionType.includes("model")) {
    return {
      label: "Model Tools",
      route: "model_tools",
      reason: "Review capability setup. The queue does not run the check.",
    };
  }
  if (item.actionType === "project_manual_push" || item.costRisk === "git_remote_write") {
    return {
      label: "Project Lab",
      route: "projects",
      reason: "Review branch, dirty state, Workbench body, and push contract. Git writes remain blocked in V1.",
    };
  }
  if (item.targetType === "command_observation" || item.actionType.startsWith("terminal_")) {
    return {
      label: "Terminal Lab",
      route: "terminal",
      reason: "Review command context. Workbench holds the saved body.",
    };
  }
  if (item.targetType === "source_event" || item.actionType.includes("source")) {
    return {
      label: "Sources",
      route: "sources",
      reason: "Review source context before browser, fetch, or enrichment work.",
    };
  }
  if (item.requestedByAgent === "hedwig" || item.targetType === "capture_observation") {
    return {
      label: "Capture Inbox",
      route: "inbox",
      reason: "Review capture context before external writes or reminders.",
    };
  }
  if (item.projectName || item.targetType === "task" || item.targetType === "project") {
    return {
      label: "Project Lab",
      route: "projects",
      reason: "Review project state, saved bodies, and push context.",
    };
  }
  return {
    label: "Workbench",
    route: "workbench",
    reason: "Review the saved body before any summary or action.",
  };
}

function ApprovalReceiptChain({
  selected,
  onNavigate,
  onOpenSecurity,
}: {
  selected: ApprovalChainItem;
  onNavigate?: (route: ApprovalRoute) => void;
  onOpenSecurity: (target: string | null | undefined) => void;
}) {
  const copy = approvalPanelCopy();
  const runnerState = approvalRunnerStateCopy({
    actionType: selected.actionType,
    costRisk: selected.costRisk,
    origin: selected.origin,
    targetType: selected.targetType,
  });
  const nextSurface = nextSurfaceForApproval(selected);
  const executionLinks = selected.executionLinks ?? [];
  const browserProposalReceipt = selected.browserProposalReceipt ?? null;
  const preflightTone = selected.permissionPreflight == null
    ? C.warning
    : selected.permissionPreflight.decision === "blocked_by_hard_gate"
      ? C.danger
      : selected.permissionPreflight.approvalRequired
        ? C.warning
        : C.accent;
  const securityTarget = selected.permissionPreflight?.targetSummary ?? selected.targetLabel;
  const steps = [
    {
      label: "Origin",
      value: `${labelize(selected.origin)} / ${selected.requestedByAgent ?? "unknown"}`,
      tone: C.accent,
    },
    {
      label: "Target",
      value: selected.targetLabel
        ? receiptLabel(selected.targetLabel) ?? selected.targetLabel
        : labelize(selected.targetType),
      tone: selected.targetType ? C.gold : C.textMuted,
    },
    {
      label: copy.chainCheckLabel,
      value: selected.permissionPreflightId == null
        ? "unlinked"
        : `#${selected.permissionPreflightId} ${labelize(selected.permissionPreflight?.decision)}`,
      tone: preflightTone,
    },
    {
      label: copy.chainNextLabel,
      value: nextSurface.label,
      tone: C.success,
    },
  ];
  function openTerminalLink(link: NonNullable<ApprovalChainItem["executionLinks"]>[number]) {
    if (!onNavigate) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:terminal-focus",
        JSON.stringify({
          source: "approval_execution_link",
          resultId: link.resultId,
          observationId: link.sourceType === "command_observation" ? link.sourceId : null,
          command: link.command ?? "",
          notice: `Approvals opened Terminal Lab context for proposal #${link.proposalId}.`,
        }),
      );
    } catch {
      // Terminal Lab still opens; the user can inspect recent results manually.
    }
    onNavigate("terminal");
  }

  function openWorkbenchLink(link: NonNullable<ApprovalChainItem["executionLinks"]>[number]) {
    if (!onNavigate || link.workbenchEvidenceId == null) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-filter",
        JSON.stringify({
          source: "approval_execution_link",
          evidenceId: link.workbenchEvidenceId,
          kind: "terminal_output",
          query: link.command ?? `#${link.workbenchEvidenceId}`,
          groupBy: "command",
          notice: `Approvals opened Workbench body #${link.workbenchEvidenceId} from proposal #${link.proposalId}.`,
        }),
      );
    } catch {
      // Workbench still opens; the user can inspect recent terminal receipts manually.
    }
    onNavigate("workbench");
  }

  function openBrowserProposalInWorkbench() {
    if (!onNavigate || !browserProposalReceipt) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-browser-focus",
        JSON.stringify({
          source: "approval_browser_proposal",
          proposalId: browserProposalReceipt.proposalId,
          query: browserProposalReceipt.target,
          notice: `Approvals opened Browser proposal #${browserProposalReceipt.proposalId}. No page opens from this handoff.`,
        }),
      );
    } catch {
      // Workbench still opens; Browser proposal rows remain visible there.
    }
    onNavigate("workbench");
  }

  return (
    <Section title={copy.chainTitle} detail={copy.chainDetail}>
      <div className="grid gap-1 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step.label} className="min-w-0 rounded px-1.5 py-1" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[9px] font-semibold uppercase leading-none" style={{ color: step.tone }}>
              {step.label}
            </div>
            <div className="mt-0.5 truncate text-[10px] leading-tight" title={step.value} style={{ color: C.textSecondary }}>
              {step.value}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
        {nextSurface.reason}
      </p>
      <div className="grid gap-1 rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
        <div className="flex items-center gap-1">
          <Chip label={runnerState.label} tone={runnerState.tone === "warning" ? C.warning : C.accent} />
          <span className="min-w-0 truncate text-[10px] uppercase" style={{ color: C.textMuted }}>
            Execution state
          </span>
        </div>
        <p className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
          {runnerState.body}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => nextSurface.route && onNavigate?.(nextSurface.route)}
          disabled={!nextSurface.route || !onNavigate}
          title={`Open ${nextSurface.label}. Approval Queue does not approve or execute it.`}
          aria-label={`Open ${nextSurface.label} for approval ${selected.id}`}
        >
          Open {nextSurface.label}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="risk"
          onClick={() => onOpenSecurity(securityTarget)}
          disabled={!securityTarget || !onNavigate}
          title={copy.securityReceiptTitle}
          aria-label={`Open Security Gate for approval ${selected.id}`}
        >
          Security Gate
        </Button>
      </div>
      {browserProposalReceipt && (
        <div className="grid gap-1 rounded p-1.5" aria-label="Browser approval proposal receipt" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex flex-wrap items-center gap-1">
            <Chip label={`browser proposal #${browserProposalReceipt.proposalId}`} tone={C.accent} />
            {browserProposalReceipt.liveRunnerAction && <Chip label="live runner gate" tone={C.warning} />}
            <Chip label={browserProposalReceipt.statusLabel} tone={browserProposalReceipt.canExecute ? C.danger : C.success} />
            <Chip label={labelize(browserProposalReceipt.resultState)} tone={browserProposalReceipt.resultState === "not_run" ? C.warning : C.textMuted} />
            <Chip label={browserProposalReceipt.canOpenPage ? "can open" : "no page open"} tone={browserProposalReceipt.canOpenPage ? C.danger : C.success} />
            {browserProposalReceipt.watchShelfAction && (
              <>
                <Chip label={browserProposalReceipt.canSaveWatchShelf ? "shelf save" : "shelf blocked"} tone={browserProposalReceipt.canSaveWatchShelf ? C.danger : C.success} />
                <Chip label={browserProposalReceipt.canPersistWatchProgress ? "progress" : "no progress"} tone={browserProposalReceipt.canPersistWatchProgress ? C.danger : C.textMuted} />
              </>
            )}
          </div>
          <div className="truncate text-[10px]" title={browserProposalReceipt.target} style={{ color: C.textMuted }}>
            {browserProposalReceipt.actionLabel}: {browserProposalReceipt.target}
          </div>
          <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
            {browserProposalReceipt.noActionTaken.slice(0, 2).join(" ")}
          </div>
          {browserProposalReceipt.liveRunnerAction && (
            <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {browserProposalReceipt.liveRunnerGate} No runner audit written.
            </div>
          )}
          {browserProposalReceipt.watchShelfAction && (
            <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {browserProposalReceipt.watchShelfGate} No Watch Shelf item saved. No progress persisted.
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={openBrowserProposalInWorkbench}
              disabled={!onNavigate}
              title="Open this Browser proposal in Workbench. No page opens."
              aria-label={`Open Workbench Browser proposal ${browserProposalReceipt.proposalId}`}
            >
              Open Browser Proposal
            </Button>
          </div>
        </div>
      )}
      {executionLinks.length > 0 && (
        <div className="grid gap-1" aria-label="Approval linked execution receipts">
          {executionLinks.map((link) => (
            <div key={link.proposalId} className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex flex-wrap items-center gap-1">
                <Chip label={`proposal #${link.proposalId}`} tone={C.accent} />
                <Chip label={labelize(link.riskClass)} tone={link.riskClass === "read_only" ? C.success : C.danger} />
                <Chip label={labelize(link.proposalResultState)} tone={link.proposalResultState === "not_run" ? C.warning : C.textMuted} />
                {link.resultId != null && <Chip label={`result #${link.resultId}`} tone={link.resultStatus === "completed" ? C.success : C.warning} />}
                {link.resultExitCode != null && <Chip label={`exit ${link.resultExitCode}`} tone={link.resultExitCode === 0 ? C.success : C.warning} />}
              </div>
              <div className="mt-1 truncate text-[10px]" title={link.command ?? link.actionType} style={{ color: C.textMuted }}>
                {link.command ?? labelize(link.actionType)}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openTerminalLink(link)}
                  disabled={!onNavigate}
                  title="Open Terminal Lab context for this linked execution proposal. No command runs."
                  aria-label={`Open Terminal Lab for execution proposal ${link.proposalId}`}
                >
                  Open Terminal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openWorkbenchLink(link)}
                  disabled={!onNavigate || link.workbenchEvidenceId == null}
                  title="Open the linked Workbench receipt body. No action runs."
                  aria-label={`Open Workbench body for execution proposal ${link.proposalId}`}
                >
                  Open Body
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
  const variant = tone === C.danger
    ? "destructive"
    : tone === C.warning || tone === C.gold
      ? "warning"
      : tone === C.success
        ? "success"
        : tone === C.accentViolet || tone === C.glowViolet
          ? "violet"
          : tone === C.accent
            ? "default"
            : "secondary";

  return (
    <Badge variant={variant} className="uppercase">
      {label}
    </Badge>
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
  options: readonly SelectOption[];
}) {
  return (
    <UiSelect value={value} onValueChange={onChange} aria-label={label}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
}

function Section({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="rounded p-2" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{title}</h3>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{detail}</span>
      </div>
      <div className="grid gap-1.5">{children}</div>
    </section>
  );
}

function DetailSection({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <details className="rounded p-2" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
      <summary className="cursor-pointer list-none">
        <span className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{title}</span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{detail}</span>
        </span>
      </summary>
      <div className="mt-2 grid gap-1.5">{children}</div>
    </details>
  );
}

function Meta({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[94px_minmax(0,1fr)] gap-2 text-[11px] leading-snug">
      <div className="truncate uppercase tracking-wider" style={{ color: C.textMuted }} title={label}>{label}</div>
      <div className="truncate" style={{ color: C.textSecondary }} title={title ?? value}>{value}</div>
    </div>
  );
}

function Note({ tone, text }: { tone: string; text: string }) {
  return (
    <div className="rounded px-2 py-1.5 text-[11px] leading-snug" style={{ background: `${tone}14`, border: `1px solid ${tone}33`, color: C.textSecondary }}>
      {text}
    </div>
  );
}
