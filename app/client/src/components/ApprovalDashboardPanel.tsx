import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

type OriginFilter = "all" | "hedwig" | "terminal" | "project_lab" | "source" | "other";
type StatusFilter = "pending" | "approved" | "rejected" | "cancelled";
type GroupFilter = "origin" | "project" | "action_type" | "status" | "risk";

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

function formatTime(unixSec: number) {
  return new Date(unixSec * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApprovalDashboardPanel({ onClose }: { onClose: () => void }) {
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

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              Approval Queue
            </h2>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>
              Local preview records. No action buttons.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close approval queue"
            className="px-2 py-1 text-xs font-semibold uppercase rounded"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_auto_auto]">
          <label className="sr-only" htmlFor="approval-search">Search approval previews</label>
          <input
            id="approval-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search action, project, reason, command, capture, source."
            aria-label="Search approval previews"
            className="w-full px-3 py-2 rounded text-xs outline-none"
            style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
          />
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value === "all" ? "all" : Number(event.target.value))}
            aria-label="Filter approvals by project"
            className="px-3 py-2 rounded text-xs outline-none"
            style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
          >
            <option value="all">All projects</option>
            {projectOptions.map((project) => (
              <option key={project.slug} value={project.tasks.projectId ?? ""}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOrigin("all");
              setStatus("pending");
              setProjectId("all");
              setSelectedId(null);
            }}
            aria-label="Reset approval filters to pending local previews"
            className="px-3 py-2 text-xs font-semibold uppercase rounded"
            style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Reset
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2" aria-label="Approval origin filters">
          {origins.map((item) => (
            <FilterButton key={item.id} active={origin === item.id} label={item.label} onClick={() => setOrigin(item.id)} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Approval status filters">
          {statuses.map((item) => (
            <FilterButton key={item.id} active={status === item.id} label={item.label} onClick={() => setStatus(item.id)} />
          ))}
        </div>

        <div className="mt-3 rounded p-3" aria-label="Approval preview groups" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Groups
              </div>
              <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                Local previews only. No approval action.
              </div>
            </div>
            <select
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as GroupFilter)}
              aria-label="Group approval previews"
              className="px-2 py-1.5 rounded text-xs outline-none"
              style={{ background: C.backgroundSoft, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
            >
              <option value="origin">Origin</option>
              <option value="project">Project</option>
              <option value="action_type">Action type</option>
              <option value="status">Status</option>
              <option value="risk">Risk</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(groups.data?.groups ?? []).length === 0 ? (
              <div className="text-xs" style={{ color: C.textMuted }}>No groups match these filters.</div>
            ) : (
              groups.data?.groups.map((group) => (
                <button
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
                  className="min-w-44 rounded p-2 text-left"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="text-xs font-semibold leading-snug truncate" style={{ color: C.textPrimary }} title={group.label}>
                    {labelize(group.label)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Chip label={`${group.count} previews`} tone={C.accent} />
                    {group.sensitive > 0 && <Chip label={`${group.sensitive} sensitive`} tone={C.danger} />}
                  </div>
                  <div className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
                    {group.sampleIds.map((id) => `#${id}`).join(", ")}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-3 text-xs"
          style={{ color: C.textMuted }}
        >
          {approvals.isLoading
            ? "Reading local approval previews."
            : `Showing ${items.length} ${status} preview${items.length === 1 ? "" : "s"}. Sensitive ${approvals.data?.summary.sensitive ?? 0}.`}
        </div>

        <div className="mt-3 rounded p-3" aria-label="Permission preflight audit records" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Permission Preflights
              </div>
              <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                Local audit history. Policy evidence only.
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              <Chip label={`${preflights.data?.summary.total ?? 0} records`} tone={C.accent} />
              {(preflights.data?.summary.approvalRequired ?? 0) > 0 && <Chip label={`${preflights.data?.summary.approvalRequired} gated`} tone={C.warning} />}
              {(preflights.data?.summary.blocked ?? 0) > 0 && <Chip label={`${preflights.data?.summary.blocked} blocked`} tone={C.danger} />}
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {preflights.isLoading ? (
              <div className="text-xs" style={{ color: C.textMuted }}>Reading local preflight records.</div>
            ) : preflightItems.length === 0 ? (
              <div className="text-xs" style={{ color: C.textMuted }}>No permission preflight records match these filters.</div>
            ) : (
              preflightItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded p-2"
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
                    {item.targetSummary ?? (item.requiredApprovals.join(", ") || item.reasons[0] || "No target summary recorded.")}
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
        <section className="overflow-y-auto p-4" aria-label="Approval preview list">
          {(approvals.data?.gates ?? []).map((gate) => (
            <div key={gate} className="mb-2 rounded px-3 py-2 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              {gate}
            </div>
          ))}

          {items.length === 0 ? (
            <div className="rounded p-4 text-sm" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              No approval previews match these filters. Reset filters or stage a preview from Hedwig or Terminal Lab.
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-label={`Inspect approval ${item.id}: ${labelize(item.actionType)}`}
                  className="w-full text-left rounded p-3 transition-colors"
                  style={{
                    background: selected?.id === item.id ? C.surfaceRaised : C.surface,
                    border: `1px solid ${selected?.id === item.id ? C.accent : C.borderSoft}`,
                    color: C.textPrimary,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip label={`#${item.id}`} tone={C.textMuted} />
                    <Chip label={labelize(item.origin)} tone={C.accent} />
                    <Chip label={labelize(item.status)} tone={item.status === "pending" ? C.warning : C.textMuted} />
                    {item.sensitive && <Chip label="sensitive" tone={C.danger} />}
                    {item.projectName && <Chip label={item.projectName} tone={C.gold} />}
                    {item.permissionPreflightId != null && <Chip label={`preflight #${item.permissionPreflightId}`} tone={item.permissionPreflight?.approvalRequired ? C.warning : C.accent} />}
                  </div>
                  <div className="mt-2 text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {labelize(item.actionType)}
                  </div>
                  <div className="mt-1 text-xs line-clamp-2" style={{ color: C.textMuted }}>
                    {item.targetLabel ?? item.reason ?? item.contextSummary ?? "No target label recorded."}
                  </div>
                  <div className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
                    {formatTime(item.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="overflow-y-auto p-4" aria-label="Approval validation notes" style={{ borderLeft: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
          {!selected ? (
            <div className="rounded p-3 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              Select an approval preview to inspect validation notes.
            </div>
          ) : (
            <div className="grid gap-3">
              <Section title={`Approval #${selected.id}`} detail={labelize(selected.actionType)}>
                <Meta label="Origin" value={labelize(selected.origin)} />
                <Meta label="Requested By" value={selected.requestedByAgent ?? "unknown"} />
                <Meta label="Project" value={selected.projectName ?? "unlinked"} />
                <Meta label="Target" value={`${selected.targetType ?? "unknown"} ${selected.targetId ?? ""}`.trim()} />
                <Meta label="Cost/Risk" value={labelize(selected.costRisk)} />
                <Meta label="Permission Preflight" value={selected.permissionPreflightId == null ? "unlinked" : `#${selected.permissionPreflightId}`} />
              </Section>

              <Section title="Permission Preflight" detail={selected.permissionPreflight == null ? "unlinked" : labelize(selected.permissionPreflight.decision)}>
                {selected.permissionPreflight == null ? (
                  <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                    No linked permission preflight record exists for this approval preview yet.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    <div className="flex flex-wrap gap-1">
                      <Chip label={`#${selected.permissionPreflight.id}`} tone={C.textMuted} />
                      <Chip
                        label={labelize(selected.permissionPreflight.decision)}
                        tone={selected.permissionPreflight.decision === "blocked_by_hard_gate" ? C.danger : selected.permissionPreflight.approvalRequired ? C.warning : C.accent}
                      />
                      <Chip label={`${labelize(selected.permissionPreflight.perceptionClass)} / ${labelize(selected.permissionPreflight.actionClass)}`} tone={C.accent} />
                    </div>
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
                      <p className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
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
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.textSecondary }}>
                  {selected.reason ?? "No reason recorded."}
                </p>
              </Section>

              <Section title="Context" detail="local evidence">
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: C.textMuted }}>
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
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider"
      style={{
        background: active ? C.accentSoft : C.surface,
        border: `1px solid ${active ? C.accent : C.borderSoft}`,
        color: active ? C.textPrimary : C.textMuted,
      }}
    >
      {label}
    </button>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: `${tone}22`, color: tone }}>
      {label}
    </span>
  );
}

function Section({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>{title}</h3>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{detail}</span>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-xs leading-snug" style={{ color: C.textSecondary }}>{value}</div>
    </div>
  );
}

function Note({ tone, text }: { tone: string; text: string }) {
  return (
    <div className="rounded px-2 py-1.5 text-xs leading-relaxed" style={{ background: `${tone}14`, border: `1px solid ${tone}33`, color: C.textSecondary }}>
      {text}
    </div>
  );
}
