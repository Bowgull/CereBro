import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
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

type OriginFilter = "all" | "hedwig" | "terminal" | "project_lab" | "source" | "other";
type StatusFilter = "pending" | "approved" | "rejected" | "cancelled";
type GroupFilter = "origin" | "project" | "action_type" | "status" | "risk";
type ApprovalRoute = "security" | "terminal" | "workbench" | "projects" | "sources" | "inbox" | "model_tools";
type SelectOption = { value: string; label: string };

const origins: Array<{ id: OriginFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "hedwig", label: "Hedwig" },
  { id: "terminal", label: "Terminal" },
  { id: "project_lab", label: "Projects" },
  { id: "source", label: "Sources" },
  { id: "other", label: "Other" },
];

const statuses: Array<{ id: StatusFilter; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

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

  const projects = trpc.projectIntelligence.overview.useQuery();
  const projectOptions = useMemo(
    () => (projects.data?.projects ?? []).filter((project) => project.tasks.projectId != null),
    [projects.data?.projects],
  );
  const [projectId, setProjectId] = useState<number | "all">("all");

  const approvals = trpc.approvals.list.useQuery({
    status,
    origin,
    projectId: projectId === "all" ? undefined : projectId,
    query: query.trim() || undefined,
    limit: 60,
  });
  const groups = trpc.approvals.groups.useQuery({
    groupBy,
    status,
    origin,
    projectId: projectId === "all" ? undefined : projectId,
    query: query.trim() || undefined,
  });
  const preflights = trpc.approvals.permissionPreflights.useQuery({
    query: query.trim() || undefined,
    limit: 8,
  });

  const items = approvals.data?.items ?? [];
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const preflightItems = preflights.data?.items ?? [];
  const sensitiveCount = approvals.data?.summary.sensitive ?? 0;
  const preflightTotal = preflights.data?.summary.total ?? 0;
  const blockedPreflights = preflights.data?.summary.blocked ?? 0;

  function openSecurityGate(target: string | null | undefined) {
    if (!target?.trim() || !onNavigate) return;
    try {
      window.sessionStorage.setItem("cerebro:security-target", target.trim());
    } catch {
      // Ignore storage failure. The Security Gate form still opens.
    }
    onNavigate("security");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <header className="shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              Action Receipt Gate
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              Universal local receipts for approvals, blocks, and permission preflights. No action execution.
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

        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Approval receipt summary">
          <ReceiptStat label="Pending" value={String(items.length)} tone={items.length > 0 ? C.warning : C.textMuted} />
          <ReceiptStat label="Sensitive" value={String(sensitiveCount)} tone={sensitiveCount > 0 ? C.danger : C.textMuted} />
          <ReceiptStat label="Preflights" value={String(preflightTotal)} tone={C.accent} />
          <ReceiptStat label="Blocked" value={String(blockedPreflights)} tone={blockedPreflights > 0 ? C.danger : C.textMuted} />
        </div>

        <div className="mt-2 grid gap-1.5 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="sr-only" htmlFor="approval-search">Search approval previews</label>
          <Input
            id="approval-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search action, project, reason, command, capture, source."
            aria-label="Search approval previews"
          />
          <AppSelect
            label="Filter approvals by project"
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
            aria-label="Reset approval filters to pending local previews"
            title="Reset approval filters. This does not approve, reject, or change previews."
            variant="outline"
          >
            Reset
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Approval origin filters">
          {origins.map((item) => (
            <FilterButton key={item.id} active={origin === item.id} label={item.label} onClick={() => setOrigin(item.id)} />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Approval status filters">
          {statuses.map((item) => (
            <FilterButton key={item.id} active={status === item.id} label={item.label} onClick={() => setStatus(item.id)} />
          ))}
        </div>

        <div className="mt-2 rounded p-2" aria-label="Approval preview groups" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Groups
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>
                Local previews only. No approval action.
              </div>
            </div>
            <AppSelect
              label="Group approval previews"
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
            {(groups.data?.groups ?? []).length === 0 ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>No groups match these filters.</div>
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
                  aria-label={`Filter approval previews by ${labelize(group.label)}`}
                  title={`Filter local approval previews by ${labelize(group.label)}. No approval action runs.`}
                  className="h-auto min-w-40 justify-start rounded p-1.5 text-left"
                  variant="secondary"
                >
                  <span className="block w-full">
                    <span className="block truncate text-[11px] font-semibold leading-snug" title={group.label}>
                      {labelize(group.label)}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      <Chip label={`${group.count} previews`} tone={C.accent} />
                      {group.sensitive > 0 && <Chip label={`${group.sensitive} sensitive`} tone={C.danger} />}
                    </span>
                    <span className="mt-1 block text-[11px]" style={{ color: C.textMuted }}>
                      {group.sampleIds.map((id) => `#${id}`).join(", ")}
                    </span>
                  </span>
                </Button>
              ))
            )}
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-2 text-[11px]"
          style={{ color: C.textMuted }}
        >
          {approvals.isLoading
            ? "Reading local approval previews."
            : `Showing ${items.length} ${status} preview${items.length === 1 ? "" : "s"}. Sensitive ${approvals.data?.summary.sensitive ?? 0}.`}
        </div>

        <div className="mt-2 rounded p-2" aria-label="Permission preflight audit records" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Permission Preflights
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: C.textMuted }}>
                Local audit history. Policy receipt only.
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              <Chip label={`${preflights.data?.summary.total ?? 0} records`} tone={C.accent} />
              {(preflights.data?.summary.approvalRequired ?? 0) > 0 && <Chip label={`${preflights.data?.summary.approvalRequired} gated`} tone={C.warning} />}
              {(preflights.data?.summary.blocked ?? 0) > 0 && <Chip label={`${preflights.data?.summary.blocked} blocked`} tone={C.danger} />}
            </div>
          </div>
          <div className="mt-2 grid gap-1.5">
            {preflights.isLoading ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>Reading local preflight records.</div>
            ) : preflightItems.length === 0 ? (
              <div className="text-[11px]" style={{ color: C.textMuted }}>No permission preflight records match these filters.</div>
            ) : (
              preflightItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded p-1.5"
                  style={{ background: C.backgroundSoft, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <Chip label={`preflight #${item.id}`} tone={C.textMuted} />
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
        </div>
      </header>

      <div className="flex-1 grid gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]" style={{ minHeight: 0 }}>
        <section className="overflow-y-auto p-2" aria-label="Approval preview list">
          {(approvals.data?.gates ?? []).map((gate) => (
            <div key={gate} className="mb-2 rounded px-2.5 py-1.5 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              {gate}
            </div>
          ))}

          {items.length === 0 ? (
            <div className="rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              No approval previews match these filters. Reset filters or stage a preview from Hedwig, Terminal Lab, Project Lab, Sources, or Model Tools.
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
                    background: selected?.id === item.id ? C.surfaceRaised : C.surface,
                    border: `1px solid ${selected?.id === item.id ? C.accent : C.borderSoft}`,
                    color: C.textPrimary,
                  }}
                >
                  <span className="block w-full">
                    <span className="flex flex-wrap items-center gap-1">
                      <Chip label={`#${item.id}`} tone={C.textMuted} />
                      <Chip label={labelize(item.origin)} tone={C.accent} />
                      <Chip label={labelize(item.status)} tone={item.status === "pending" ? C.warning : C.textMuted} />
                      {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
                      {item.projectName && <Chip label={item.projectName} tone={C.gold} />}
                      {item.permissionPreflightId != null && <Chip label={`preflight #${item.permissionPreflightId}`} tone={item.permissionPreflight?.approvalRequired ? C.warning : C.accent} />}
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

        <aside className="overflow-y-auto p-2" aria-label="Approval validation notes" style={{ borderLeft: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
          {!selected ? (
            <div className="rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              Select an approval preview to inspect validation notes.
            </div>
          ) : (
            <div className="grid gap-2">
              <ApprovalReceiptChain selected={selected} onNavigate={onNavigate} onOpenSecurity={openSecurityGate} />
              <Section title={`Approval #${selected.id}`} detail={labelize(selected.actionType)}>
                <Meta label="Origin" value={labelize(selected.origin)} />
                <Meta label="Requested By" value={selected.requestedByAgent ?? "unknown"} />
                <Meta label="Project" value={selected.projectName ?? "unlinked"} />
                <Meta label="Target" value={`${selected.targetType ?? "unknown"} ${selected.targetId ?? ""}`.trim()} />
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
                    title="Open Security Gate for this approval target. Approval Dashboard does not execute it."
                    aria-label={`Open Security Gate for approval ${selected.id}`}
                  >
                    Security Gate
                  </Button>
                )}
                <Meta label="Cost/Risk" value={labelize(selected.costRisk)} />
                <Meta label="Permission Preflight" value={selected.permissionPreflightId == null ? "unlinked" : `#${selected.permissionPreflightId}`} />
              </Section>

              <Section title="Permission Preflight" detail={selected.permissionPreflight == null ? "unlinked" : labelize(selected.permissionPreflight.decision)}>
                {selected.permissionPreflight == null ? (
                  <p className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    No linked permission preflight record exists for this approval preview yet.
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
                        title="Open Security Gate for this preflight target. Approval Dashboard does not execute it."
                        aria-label={`Open Security Gate for permission preflight ${selected.permissionPreflight.id}`}
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
              </Section>

              <Section title="Oak Notes" detail="risk preflight">
                {selected.validationPreview.oakNotes.map((note) => (
                  <Note key={note} tone={C.warning} text={note} />
                ))}
              </Section>

              <Section title="Spock Notes" detail="shape check">
                {selected.validationPreview.spockNotes.map((note) => (
                  <Note key={note} tone={C.accent} text={note} />
                ))}
              </Section>

              <Section title="Reason" detail="local record">
                <p className="text-[11px] leading-snug whitespace-pre-wrap" style={{ color: C.textSecondary }}>
                  {selected.reason ?? "No reason recorded."}
                </p>
              </Section>

              <Section title="Context" detail="local receipt">
                <p className="text-[11px] leading-snug whitespace-pre-wrap" style={{ color: C.textMuted }}>
                  {selected.contextSummary ?? "No context summary recorded."}
                </p>
              </Section>
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
};

function nextSurfaceForApproval(item: ApprovalChainItem): { label: string; route: ApprovalRoute | null; reason: string } {
  if (item.targetType === "model_tool_ollama_status_check" || item.actionType.includes("ollama") || item.actionType.includes("model")) {
    return {
      label: "Model Tools",
      route: "model_tools",
      reason: "Review capability setup. The queue does not run the check.",
    };
  }
  if (item.targetType === "command_observation" || item.actionType.startsWith("terminal_")) {
    return {
      label: "Terminal Lab",
      route: "terminal",
      reason: "Review command context. Workbench holds the receipt body.",
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
      reason: "Review project state, receipts, and push context.",
    };
  }
  return {
    label: "Workbench",
    route: "workbench",
    reason: "Review receipt body before any summary or action.",
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
  const nextSurface = nextSurfaceForApproval(selected);
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
      label: "Preflight",
      value: selected.permissionPreflightId == null
        ? "unlinked"
        : `#${selected.permissionPreflightId} ${labelize(selected.permissionPreflight?.decision)}`,
      tone: preflightTone,
    },
    {
      label: "Next Surface",
      value: nextSurface.label,
      tone: C.success,
    },
  ];

  return (
    <Section title="Receipt Chain" detail="review path">
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
          title="Open Security Gate for this receipt target. Approval Queue does not execute it."
          aria-label={`Open Security Gate for approval ${selected.id}`}
        >
          Security Gate
        </Button>
      </div>
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
    <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{title}</h3>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{detail}</span>
      </div>
      <div className="grid gap-1.5">{children}</div>
    </section>
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
