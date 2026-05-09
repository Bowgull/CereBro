import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { compactCommandLabel, compactPathLabel, sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AGENT_LABELS: Record<string, string> = {
  aang: "Aang",
  batman: "Batman",
  c3po: "C-3PO",
  cortana: "Cortana",
  gojo: "Gojo",
  oak: "Professor Oak",
  piccolo: "Piccolo",
  spock: "Spock",
  surfer: "Silver Surfer",
  tony: "Tony",
};

function toneForStatus(statusText: string, exists: boolean): string {
  if (!exists || statusText === "unavailable") return C.warning;
  if (statusText === "dirty") return C.danger;
  return C.success;
}

function labelize(value: string): string {
  return value.replace(/_/g, " ");
}

function formatScannedAt(unixSec: number | undefined): string {
  if (!unixSec) return "scanning";
  return new Date(unixSec * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function hedwigTotal(hedwig: {
  pendingCaptures: number;
  reminderProposals: number;
  messageDrafts: number;
}): number {
  return hedwig.pendingCaptures + hedwig.reminderProposals + hedwig.messageDrafts;
}

function countChips(counts: Record<string, number>): string[] {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => `${label} ${count}`);
}

function compactTime(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function attentionReasons(project: {
  activity: {
    approvals: { pending: number };
    hedwig: { needsReview: number };
    terminalStatus: { blocked: number; reviewing: number };
    sourceEvents: { sensitive: number };
  };
  git: { dirty: boolean; dirtyCount: number };
}): string[] {
  const reasons: string[] = [];
  if (project.activity.approvals.pending > 0) reasons.push(`approvals ${project.activity.approvals.pending}`);
  if (project.activity.hedwig.needsReview > 0) reasons.push(`hedwig ${project.activity.hedwig.needsReview}`);
  if (project.activity.terminalStatus.blocked > 0) reasons.push(`blocked ${project.activity.terminalStatus.blocked}`);
  if (project.activity.terminalStatus.reviewing > 0) reasons.push(`reviewing ${project.activity.terminalStatus.reviewing}`);
  if (project.activity.sourceEvents.sensitive > 0) reasons.push(`sensitive sources ${project.activity.sourceEvents.sensitive}`);
  if (project.git.dirty) reasons.push(`dirty ${project.git.dirtyCount}`);
  return reasons;
}

type ProjectViewFilter = "all" | "attention" | "approvals" | "hedwig" | "terminal" | "sources" | "drafts" | "dirty" | "missing";
type InspectorQueue = "approvals" | "terminal" | "hedwig" | "sources" | "git" | "drafts" | "gates";
type InspectorSort = "default" | "type" | "text";
type DraftActionKey = "plan_next_slice" | "inspect_dirty_state" | "package_proof" | "validation_pass";

function projectSignalScore(project: {
  localExists?: boolean;
  activity: {
    approvals: { pending: number };
    hedwig: { needsReview: number; pendingCaptures: number; reminderProposals: number; messageDrafts: number };
    terminalStatus: { total: number; blocked: number; reviewing: number };
    sourceEvents: { total: number; sensitive: number };
    actionDrafts: { total: number };
  };
  git: { dirty: boolean; dirtyCount: number };
}, filter: ProjectViewFilter): number {
  if (filter === "approvals") return project.activity.approvals.pending;
  if (filter === "hedwig") return hedwigTotal(project.activity.hedwig);
  if (filter === "terminal") return project.activity.terminalStatus.total;
  if (filter === "sources") return project.activity.sourceEvents.total;
  if (filter === "drafts") return project.activity.actionDrafts.total;
  if (filter === "dirty") return project.git.dirtyCount;
  if (filter === "missing") return project.localExists === false ? 1 : 0;
  if (filter === "attention") {
    return (
      project.activity.approvals.pending * 1000 +
      project.activity.terminalStatus.blocked * 500 +
      project.activity.terminalStatus.reviewing * 250 +
      project.activity.hedwig.needsReview * 100 +
      project.activity.sourceEvents.sensitive * 75 +
      project.git.dirtyCount
    );
  }
  return 0;
}

function signalBreakdown(project: {
  localExists?: boolean;
  activity: {
    approvals: { pending: number };
    hedwig: {
      needsReview: number;
      pendingCaptures: number;
      sourceProposals: number;
      reminderProposals: number;
      messageDrafts: number;
    };
    terminalStatus: { total: number; blocked: number; reviewing: number };
    sourceEvents: { total: number; sensitive: number };
    actionDrafts: { total: number; byActionKey: Record<string, number> };
  };
  git: { dirty: boolean; dirtyCount: number };
}, filter: ProjectViewFilter): string[] {
  if (filter === "approvals") return [`pending ${project.activity.approvals.pending}`];
  if (filter === "dirty") return [`worktree ${project.git.dirtyCount}`];
  if (filter === "missing") return project.localExists === false ? ["missing local path"] : [];
  if (filter === "hedwig") {
    return [
      `captures ${project.activity.hedwig.pendingCaptures}`,
      `sources ${project.activity.hedwig.sourceProposals}`,
      `reminders ${project.activity.hedwig.reminderProposals}`,
      `messages ${project.activity.hedwig.messageDrafts}`,
    ].filter((item) => !item.endsWith(" 0"));
  }
  if (filter === "terminal") {
    const other = Math.max(0, project.activity.terminalStatus.total - project.activity.terminalStatus.blocked - project.activity.terminalStatus.reviewing);
    return [
      `blocked ${project.activity.terminalStatus.blocked}`,
      `reviewing ${project.activity.terminalStatus.reviewing}`,
      `other ${other}`,
    ].filter((item) => !item.endsWith(" 0"));
  }
  if (filter === "sources") return [`events ${project.activity.sourceEvents.total}`, `sensitive ${project.activity.sourceEvents.sensitive}`];
  if (filter === "drafts") return [`drafts ${project.activity.actionDrafts.total}`, ...countChips(project.activity.actionDrafts.byActionKey)];
  if (filter === "attention") {
    return [
      project.activity.approvals.pending > 0 ? `approvals ${project.activity.approvals.pending}x1000` : null,
      project.activity.terminalStatus.blocked > 0 ? `blocked ${project.activity.terminalStatus.blocked}x500` : null,
      project.activity.terminalStatus.reviewing > 0 ? `reviewing ${project.activity.terminalStatus.reviewing}x250` : null,
      project.activity.hedwig.needsReview > 0 ? `hedwig ${project.activity.hedwig.needsReview}x100` : null,
      project.activity.sourceEvents.sensitive > 0 ? `sensitive ${project.activity.sourceEvents.sensitive}x75` : null,
      project.git.dirty ? `dirty ${project.git.dirtyCount}x1` : null,
    ].filter((item): item is string => Boolean(item));
  }
  return [];
}

function filterSortLabel(filter: ProjectViewFilter): string {
  if (filter === "attention") return "sorted by local attention weight";
  if (filter === "approvals") return "sorted by pending approvals";
  if (filter === "hedwig") return "sorted by Hedwig proposal count";
  if (filter === "terminal") return "sorted by Terminal observation count";
  if (filter === "sources") return "sorted by source event count";
  if (filter === "drafts") return "sorted by Project Lab draft count";
  if (filter === "dirty") return "sorted by dirty worktree count";
  if (filter === "missing") return "showing missing local checkouts";
  return "repo order";
}

function viewSummary(projectName: string | null, score: number, matches: number, total: number, filter: ProjectViewFilter): string {
  if (filter === "all") return `showing ${matches} of ${total} projects in repo order`;
  if (!projectName) return `showing 0 of ${total} projects`;
  if (filter === "attention") return `showing ${matches} of ${total}; top attention: ${projectName} (${score})`;
  return `showing ${matches} of ${total}; top: ${projectName} (${score})`;
}

function attentionBreakdown(projects: Array<{
  activity: {
    approvals: { pending: number };
    hedwig: { needsReview: number };
    terminalStatus: { blocked: number; reviewing: number };
    sourceEvents: { sensitive: number };
  };
  git: { dirty: boolean; dirtyCount: number };
}>): Array<{ id: ProjectViewFilter; label: string; count: number; tone: string }> {
  const items: Array<{ id: ProjectViewFilter; label: string; count: number; tone: string }> = [
    {
      id: "approvals",
      label: "Approvals",
      count: projects.reduce((sum, project) => sum + project.activity.approvals.pending, 0),
      tone: C.warning,
    },
    {
      id: "terminal",
      label: "Blocked",
      count: projects.reduce((sum, project) => sum + project.activity.terminalStatus.blocked, 0),
      tone: C.danger,
    },
    {
      id: "terminal",
      label: "Reviewing",
      count: projects.reduce((sum, project) => sum + project.activity.terminalStatus.reviewing, 0),
      tone: C.warning,
    },
    {
      id: "hedwig",
      label: "Hedwig",
      count: projects.reduce((sum, project) => sum + project.activity.hedwig.needsReview, 0),
      tone: C.accent,
    },
    {
      id: "sources",
      label: "Sensitive Sources",
      count: projects.reduce((sum, project) => sum + project.activity.sourceEvents.sensitive, 0),
      tone: C.warning,
    },
    {
      id: "dirty",
      label: "Dirty Files",
      count: projects.reduce((sum, project) => sum + project.git.dirtyCount, 0),
      tone: C.danger,
    },
  ];

  return items.filter((item) => item.count > 0);
}

function preferredInspectorQueue(project: {
  localExists?: boolean;
  activity: {
    approvals: { pending: number };
    hedwig: { needsReview: number; pendingCaptures: number; reminderProposals: number; messageDrafts: number };
    terminalStatus: { total: number; blocked: number; reviewing: number };
    sourceEvents: { total: number; sensitive: number };
    actionDrafts: { total: number };
  };
  git: { dirty: boolean; dirtyCount: number };
}, filter: ProjectViewFilter): InspectorQueue {
  if (filter === "approvals") return "approvals";
  if (filter === "hedwig") return "hedwig";
  if (filter === "terminal") return "terminal";
  if (filter === "sources") return "sources";
  if (filter === "drafts") return "drafts";
  if (filter === "dirty") return "git";
  if (filter === "missing") return "git";
  if (filter === "attention") {
    if (project.activity.approvals.pending > 0) return "approvals";
    if (project.activity.terminalStatus.blocked > 0 || project.activity.terminalStatus.reviewing > 0 || project.activity.terminalStatus.total > 0) return "terminal";
    if (project.activity.hedwig.needsReview > 0 || hedwigTotal(project.activity.hedwig) > 0) return "hedwig";
    if (project.activity.sourceEvents.sensitive > 0 || project.activity.sourceEvents.total > 0) return "sources";
    if (project.git.dirty) return "git";
  }
  return "approvals";
}

export default function ProjectLabPanel({ onClose }: { onClose: () => void }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<ProjectViewFilter>("all");
  const [inspectorQueue, setInspectorQueue] = useState<InspectorQueue>("approvals");
  const overview = trpc.projectIntelligence.overview.useQuery(undefined, { refetchInterval: 10000 });
  const utils = trpc.useUtils();
  const [pendingDraftTarget, setPendingDraftTarget] = useState<{ slug: string; actionKey: DraftActionKey } | null>(null);
  const [lastDraftNotice, setLastDraftNotice] = useState<{ slug: string; id: number } | null>(null);
  const [lastDraftNoteNotice, setLastDraftNoteNotice] = useState<{ draftId: number; noteId: number } | null>(null);
  const createActionDraft = trpc.projectIntelligence.createActionDraft.useMutation({
    onMutate: (variables) => {
      setPendingDraftTarget({ slug: variables.slug, actionKey: variables.actionKey });
      setLastDraftNotice(null);
    },
    onSuccess: (result, variables) => {
      if (result.ok) setLastDraftNotice({ slug: variables.slug, id: result.draft.id });
      utils.projectIntelligence.detail.invalidate({ slug: variables.slug });
      utils.projectIntelligence.overview.invalidate();
    },
    onSettled: () => setPendingDraftTarget(null),
  });
  const appendActionDraftNote = trpc.projectIntelligence.appendActionDraftNote.useMutation({
    onMutate: () => {
      setLastDraftNoteNotice(null);
    },
    onSuccess: (result, variables) => {
      if (result.ok) setLastDraftNoteNotice({ draftId: variables.draftId, noteId: result.note.id });
      if (selectedSlug) utils.projectIntelligence.detail.invalidate({ slug: selectedSlug });
      utils.projectIntelligence.overview.invalidate();
    },
  });
  const detail = trpc.projectIntelligence.detail.useQuery(
    { slug: selectedSlug ?? "" },
    { enabled: Boolean(selectedSlug), refetchInterval: 10000 },
  );
  const data = overview.data;
  const projects = data?.projects ?? [];
  const filteredProjects = [
    ...projects.filter((project) => {
      if (projectFilter === "approvals") return project.activity.approvals.pending > 0;
      if (projectFilter === "hedwig") return hedwigTotal(project.activity.hedwig) > 0;
      if (projectFilter === "terminal") return project.activity.terminalStatus.total > 0;
      if (projectFilter === "sources") return project.activity.sourceEvents.total > 0;
      if (projectFilter === "drafts") return project.activity.actionDrafts.total > 0;
      if (projectFilter === "dirty") return project.git.dirty;
      if (projectFilter === "missing") return !project.localExists;
      if (projectFilter === "attention") {
        return (
          project.activity.approvals.pending > 0 ||
          project.activity.hedwig.needsReview > 0 ||
          project.activity.terminalStatus.blocked > 0 ||
          project.activity.terminalStatus.reviewing > 0 ||
          project.activity.sourceEvents.sensitive > 0 ||
          project.git.dirty
        );
      }
      return true;
    }),
  ].sort((a, b) => projectSignalScore(b, projectFilter) - projectSignalScore(a, projectFilter));
  const projectFilters = [
    { id: "all" as const, label: "All", count: projects.length },
    {
      id: "attention" as const,
      label: "Attention",
      count: projects.filter(
        (project) =>
          project.activity.approvals.pending > 0 ||
          project.activity.hedwig.needsReview > 0 ||
          project.activity.terminalStatus.blocked > 0 ||
          project.activity.terminalStatus.reviewing > 0 ||
          project.activity.sourceEvents.sensitive > 0 ||
          project.git.dirty,
      ).length,
    },
    { id: "approvals" as const, label: "Approvals", count: projects.filter((project) => project.activity.approvals.pending > 0).length },
    { id: "hedwig" as const, label: "Hedwig", count: projects.filter((project) => hedwigTotal(project.activity.hedwig) > 0).length },
    { id: "terminal" as const, label: "Terminal", count: projects.filter((project) => project.activity.terminalStatus.total > 0).length },
    { id: "sources" as const, label: "Sources", count: projects.filter((project) => project.activity.sourceEvents.total > 0).length },
    { id: "drafts" as const, label: "Drafts", count: projects.filter((project) => project.activity.actionDrafts.total > 0).length },
    { id: "dirty" as const, label: "Dirty", count: projects.filter((project) => project.git.dirty).length },
    { id: "missing" as const, label: "Missing", count: projects.filter((project) => !project.localExists).length },
  ];
  const selectedProject = projects.find((project) => project.slug === selectedSlug) ?? null;
  const topProject = filteredProjects[0] ?? null;
  const topScore = topProject ? projectSignalScore(topProject, projectFilter) : 0;
  const attentionSignals = attentionBreakdown(projects);
  const nextSafeProjects = [...projects]
    .map((project) => ({ project, score: projectSignalScore(project, "attention" as const) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const primaryStats = [
    { label: "Local", value: String(data?.summary.local ?? 0), tone: C.accent, filter: "all" as const },
    { label: "Attention", value: String(projectFilters.find((filter) => filter.id === "attention")?.count ?? 0), tone: (projectFilters.find((filter) => filter.id === "attention")?.count ?? 0) > 0 ? C.warning : C.success, filter: "attention" as const },
    { label: "Dirty", value: String(data?.summary.dirty ?? 0), tone: (data?.summary.dirty ?? 0) > 0 ? C.danger : C.success, filter: "dirty" as const },
    { label: "Approvals", value: String(data?.summary.pendingApprovals ?? 0), tone: (data?.summary.pendingApprovals ?? 0) > 0 ? C.warning : C.success, filter: "approvals" as const },
    { label: "Scanned", value: formatScannedAt(data?.scannedAt), tone: C.textSecondary },
  ];
  const secondaryStats = [
    { label: "Missing", value: String(data?.summary.missing ?? 0), tone: (data?.summary.missing ?? 0) > 0 ? C.warning : C.success, filter: "missing" as const },
    { label: "Hedwig", value: String(data?.summary.hedwigProposals ?? 0), tone: (data?.summary.hedwigProposals ?? 0) > 0 ? C.accent : C.textSecondary, filter: "hedwig" as const },
    { label: "Terminal", value: String(data?.summary.terminalObservations ?? 0), tone: (data?.summary.terminalObservations ?? 0) > 0 ? C.accent : C.textSecondary, filter: "terminal" as const },
    { label: "Sources", value: String(data?.summary.sourceEvents ?? 0), tone: (data?.summary.sourceEvents ?? 0) > 0 ? C.accent : C.textSecondary, filter: "sources" as const },
    { label: "Drafts", value: String(data?.summary.actionDrafts ?? 0), tone: (data?.summary.actionDrafts ?? 0) > 0 ? C.accent : C.textSecondary, filter: "drafts" as const },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden" role="region" aria-label="Project Lab" aria-busy={overview.isLoading} style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-3 px-3 py-2.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Project Lab
            <span className="ml-2" style={{ color: C.textSecondary }}>{projects.length}</span>
          </div>
          <div className="text-[11px] mt-1 truncate" style={{ color: C.textMuted }}>
            Read-only project intelligence for local repos, agent ownership, and next build direction.
          </div>
        </div>
        <Button type="button" onClick={onClose} aria-label="Close Project Lab" variant="outline" size="sm" className="shrink-0">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 px-3 py-2 shrink-0 md:grid-cols-5" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        {primaryStats.map((stat) => (
          <StatusBlock
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            onSelect={"filter" in stat && stat.filter ? () => setProjectFilter(stat.filter) : undefined}
          />
        ))}
      </div>

      <div className="px-3 py-2 shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="uppercase">Mode {labelize(data?.mode ?? "read_only")}</Badge>
          {secondaryStats.map((stat) => (
            <Button
              key={stat.label}
              type="button"
              onClick={() => setProjectFilter(stat.filter)}
              aria-label={`Show ${stat.label} projects`}
              className="h-6 px-2"
              variant={projectFilter === stat.filter ? "default" : "secondary"}
              size="sm"
            >
              {stat.label} <span style={{ color: stat.tone }}>{stat.value}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-wider shrink-0 w-14" style={{ color: C.textMuted }}>
            View
          </div>
          <div className="flex flex-wrap gap-1 min-w-0">
            {projectFilters.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                onClick={() => setProjectFilter(filter.id)}
                aria-pressed={projectFilter === filter.id}
                aria-label={`Show ${filter.label} projects`}
                variant={projectFilter === filter.id ? "default" : "secondary"}
                size="sm"
              >
                {filter.label} {filter.count}
              </Button>
            ))}
          </div>
        </div>
        <div className="pl-16 text-[10px] uppercase tracking-wider" role="status" aria-live="polite" style={{ color: C.textMuted }}>
          {filterSortLabel(projectFilter)} · {viewSummary(topProject?.name ?? null, topScore, filteredProjects.length, projects.length, projectFilter)}
        </div>
        {attentionSignals.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-[10px] uppercase tracking-wider shrink-0 w-14" style={{ color: C.textMuted }}>
              Signals
            </div>
            <div className="flex flex-wrap gap-1 min-w-0">
              {attentionSignals.map((signal) => (
                <Button
                  key={`${signal.label}-${signal.id}`}
                  type="button"
                  onClick={() => setProjectFilter(signal.id)}
                  aria-label={`Show ${signal.label} signal projects`}
                  variant={projectFilter === signal.id ? "default" : "secondary"}
                  size="sm"
                >
                  {signal.label} {signal.count}
                </Button>
              ))}
            </div>
          </div>
        )}
        {nextSafeProjects.length > 0 && (
          <div className="flex items-start gap-2">
            <div className="text-[10px] uppercase tracking-wider shrink-0 w-14 pt-1" style={{ color: C.textMuted }}>
              Next
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 min-w-0 flex-1">
              {nextSafeProjects.map(({ project, score }) => (
                <Button
                  key={project.slug}
                  type="button"
                  aria-label={`Inspect next safe action for ${project.name}`}
                  onClick={() => {
                    setInspectorQueue(preferredInspectorQueue(project, "attention"));
                    setSelectedSlug(project.slug);
                  }}
                  className="h-auto min-w-0 justify-start rounded px-2 py-1 text-left"
                  variant="secondary"
                >
                  <span className="block min-w-0 w-full">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.accent }} title={project.name}>
                        {project.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: C.warning }}>
                        {score}
                      </span>
                    </span>
                    <span className="block text-[11px] leading-snug truncate" title={project.nextSafeAction}>
                      {project.nextSafeAction}
                    </span>
                    <span className="flex flex-wrap gap-1 mt-1">
                      {attentionReasons(project).slice(0, 3).map((reason) => (
                        <Badge key={reason} variant="secondary" className="uppercase">
                          {reason}
                        </Badge>
                      ))}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedSlug && (
        <ProjectDetailInspector
          projectName={selectedProject?.name ?? selectedSlug}
          detail={detail.data}
          initialQueue={inspectorQueue}
          isLoading={detail.isLoading}
          onClose={() => setSelectedSlug(null)}
          onAppendDraftNote={(draftId, note) => {
            appendActionDraftNote.mutate({ draftId, note, authorAgent: "cortana" });
          }}
          appendingDraftNote={appendActionDraftNote.isPending}
          appendedDraftNoteId={lastDraftNoteNotice?.noteId ?? null}
          appendedDraftNoteDraftId={lastDraftNoteNotice?.draftId ?? null}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {overview.isLoading ? (
          <div className="px-3 py-2 text-xs" style={{ color: C.textMuted }}>Reading project landscape.</div>
        ) : projects.length === 0 ? (
          <div className="px-3 py-2 text-xs leading-relaxed" style={{ color: C.textMuted }}>
            No project profiles are available yet.
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyProjectFilter
            filter={projectFilter}
            signals={attentionSignals}
            onShowAll={() => setProjectFilter("all")}
            onSelectFilter={setProjectFilter}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 px-3 pt-3 pb-20">
            {filteredProjects.map((project, index) => {
              const statusTone = toneForStatus(project.git.statusText, project.localExists);
              const reasons = attentionReasons(project);
              const rankScore = projectSignalScore(project, projectFilter);
              const scoreParts = signalBreakdown(project, projectFilter);
              const pendingDraftForProject = pendingDraftTarget?.slug === project.slug ? pendingDraftTarget : null;
              const lastDraftForProject = lastDraftNotice?.slug === project.slug ? lastDraftNotice : null;
              const activitySignals: Array<{
                title: string;
                count: number;
                tone: string;
                detail: string;
                queue: InspectorQueue;
              }> = [
                {
                  title: "Approvals",
                  count: project.activity.approvals.pending,
                  tone: project.activity.approvals.pending > 0 ? C.warning : C.success,
                  detail: `${project.activity.approvals.sensitive} sensitive`,
                  queue: "approvals",
                },
                {
                  title: "Hedwig",
                  count: hedwigTotal(project.activity.hedwig),
                  tone: hedwigTotal(project.activity.hedwig) > 0 ? C.accent : C.textSecondary,
                  detail: `${project.activity.hedwig.needsReview} review`,
                  queue: "hedwig",
                },
                {
                  title: "Terminal",
                  count: project.activity.terminalStatus.total,
                  tone: project.activity.terminalStatus.blocked > 0 ? C.danger : project.activity.terminalStatus.reviewing > 0 ? C.warning : C.textSecondary,
                  detail: `${project.activity.terminalStatus.blocked} blocked`,
                  queue: "terminal",
                },
                {
                  title: "Sources",
                  count: project.activity.sourceEvents.total,
                  tone: project.activity.sourceEvents.sensitive > 0 ? C.warning : C.textSecondary,
                  detail: `${project.activity.sourceEvents.sensitive} sensitive`,
                  queue: "sources",
                },
                {
                  title: "Drafts",
                  count: project.activity.actionDrafts.total,
                  tone: project.activity.actionDrafts.total > 0 ? C.accent : C.textSecondary,
                  detail: "local plans",
                  queue: "drafts",
                },
              ];
              return (
                <article
                  key={project.slug}
                  aria-label={`${project.name} project card`}
                  className="min-w-0 rounded p-2.5"
                  style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-semibold leading-tight" style={{ color: C.textPrimary }}>
                          {project.name}
                        </h2>
                        {projectFilter !== "all" && (
                          <Badge variant="warning" className="uppercase">
                            #{index + 1} · {rankScore}
                          </Badge>
                        )}
                        <Badge variant="default" className="uppercase">
                          {labelize(project.priorityClass)}
                        </Badge>
                      </div>
                      <div className="text-xs leading-relaxed mt-1" style={{ color: C.textSecondary }}>
                        {project.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        aria-label={`Inspect ${project.name}`}
                        onClick={() => {
                          setInspectorQueue(preferredInspectorQueue(project, projectFilter));
                          setSelectedSlug(project.slug);
                        }}
                        size="sm"
                      >
                        Inspect
                      </Button>
                      <Badge variant={project.localExists && project.git.statusText !== "dirty" ? "success" : project.git.statusText === "dirty" ? "destructive" : "warning"} className="uppercase">
                        {project.localExists ? project.git.statusText : "missing"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2 mt-3">
                    <MetaBlock label="Owner" value={AGENT_LABELS[project.ownerAgent] ?? project.ownerAgent} />
                    <MetaBlock label="Branch" value={project.git.branch ?? "unavailable"} />
                    <MetaBlock label="Tasks" value={`${project.tasks.inProgress} active / ${project.tasks.open} open`} />
                    <MetaBlock label="Approvals" value={`${project.activity.approvals.pending} pending`} />
                    <MetaBlock label="Hedwig" value={`${hedwigTotal(project.activity.hedwig)} proposals`} />
                    <MetaBlock label="Terminal" value={`${project.activity.terminalStatus.total} observations`} />
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                      Local Path
                    </div>
                    <div className="text-xs truncate" style={{ color: project.localExists ? C.textSecondary : C.warning }} title={project.localPath}>
                      {compactPathLabel(project.localPath)}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {projectFilter === "attention" && reasons.length > 0 && (
                      <ChipRow label="Shown" items={reasons} tone={C.warning} compact />
                    )}
                    {projectFilter !== "all" && scoreParts.length > 0 && (
                      <ChipRow label="Score" items={scoreParts} tone={C.accent} compact />
                    )}
                    <ChipRow label="Risks" items={project.riskFlags} tone={C.warning} compact />
                    <ChipRow label="Stack" items={project.stack} compact />
                    <ChipRow label="Support" items={project.supportAgents.map((agent) => AGENT_LABELS[agent] ?? agent)} tone={C.accent} compact />
                  </div>

                  <div className="mt-3 rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                    <div className="grid gap-1.5 text-xs leading-snug" style={{ color: C.textSecondary }}>
                      <div className="min-w-0">
                        <span className="uppercase tracking-wider text-[10px]" style={{ color: C.textMuted }}>Next </span>
                        <span>{project.nextAction}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="uppercase tracking-wider text-[10px]" style={{ color: C.accent }}>Safe </span>
                        <span>{project.nextSafeAction}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Draft Actions</div>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: C.success }}>proposal only</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {([
                        ["plan_next_slice", "Plan slice"],
                        ["inspect_dirty_state", "Inspect state"],
                        ["package_proof", "Package proof"],
                        ["validation_pass", "Validate"],
                      ] as Array<[DraftActionKey, string]>).map(([actionKey, label]) => (
                        <Button
                          key={actionKey}
                          type="button"
                          disabled={createActionDraft.isPending}
                          aria-label={`Create local draft action for ${project.name}: ${label}`}
                          onClick={() => {
                            createActionDraft.mutate({ slug: project.slug, actionKey });
                            setInspectorQueue("drafts");
                            setSelectedSlug(project.slug);
                          }}
                          className="h-auto justify-start rounded text-left"
                          variant="secondary"
                          size="sm"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                    <div role="status" aria-live="polite" className="mt-1 text-[10px] leading-relaxed" style={{ color: C.textMuted }}>
                      {pendingDraftForProject
                        ? `Creating ${labelize(pendingDraftForProject.actionKey)} draft locally. No task or repo action is running.`
                        : lastDraftForProject
                          ? `Created local draft #${lastDraftForProject.id}. No task was created and no repo was edited.`
                          : "Drafts append local plans. They do not create tasks or edit repos."}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 xl:grid-cols-5">
                    {activitySignals.map((signal) => (
                      <Button
                        key={signal.title}
                        type="button"
                        aria-label={`Inspect ${project.name} ${signal.title}`}
                        onClick={() => {
                          setInspectorQueue(signal.queue);
                          setSelectedSlug(project.slug);
                        }}
                        className="h-auto min-w-0 justify-start rounded p-2 text-left"
                        variant="secondary"
                        style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                      >
                        <span className="block min-w-0 w-full">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.textMuted }}>
                              {signal.title}
                            </span>
                            <span className="text-sm font-semibold shrink-0" style={{ color: signal.tone }}>
                              {signal.count}
                            </span>
                          </span>
                          <span className="block text-[11px] leading-snug truncate" style={{ color: C.textSecondary }} title={signal.detail}>
                            {signal.detail}
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>

                  {project.tasks.recent.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                        Current Tasks
                      </div>
                      <div className="space-y-1" role="list" aria-label={`${project.name} current tasks`}>
                        {project.tasks.recent.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            role="listitem"
                            className="grid grid-cols-[72px_minmax(0,1fr)] gap-2 text-[11px] leading-snug px-2 py-1 rounded"
                            style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                          >
                            <span className="uppercase tracking-wider truncate" style={{ color: task.status === "in_progress" ? C.accent : C.textMuted }}>
                              {task.status.replace(/_/g, " ")}
                            </span>
                            <span className="truncate" title={task.title}>
                              {task.title}
                              {task.sessionId != null && (
                                <span
                                  className="ml-1 uppercase tracking-wider"
                                  style={{ color: C.textMuted }}
                                  title={task.sessionDisplayName ?? undefined}
                                >
                                  {task.sessionDisplayName ?? `Run #${task.sessionId}`}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(project.activity.recentCommands.length > 0 || project.activity.recentCaptures.length > 0) && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.activity.recentCommands.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                            Terminal Observations
                          </div>
                          <div className="space-y-1">
                            {project.activity.recentCommands.map((item) => (
                              <Button
                                type="button"
                                key={item.id}
                                aria-label={`Inspect Terminal observation for ${project.name}: ${item.command}`}
                                onClick={() => {
                                  setInspectorQueue("terminal");
                                  setSelectedSlug(project.slug);
                                }}
                                className="h-auto w-full min-w-0 justify-start rounded text-left"
                                variant="secondary"
                                size="sm"
                              >
                                <span className="min-w-0 truncate">
                                  <Badge variant={item.risk === "read_only" ? "success" : "warning"} className="mr-1 uppercase">
                                    {labelize(item.risk)}
                                  </Badge>
                                  <span className="truncate" title={item.command}>{compactCommandLabel(item.command)}</span>
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {project.activity.recentCaptures.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                            Hedwig Captures
                          </div>
                          <div className="space-y-1">
                            {project.activity.recentCaptures.map((item) => (
                              <Button
                                type="button"
                                key={item.id}
                                aria-label={`Inspect Hedwig capture for ${project.name}: ${item.title}`}
                                onClick={() => {
                                  setInspectorQueue("hedwig");
                                  setSelectedSlug(project.slug);
                                }}
                                className="h-auto w-full min-w-0 justify-start rounded text-left"
                                variant="secondary"
                                size="sm"
                              >
                                <span className="min-w-0 truncate">
                                  <Badge variant={item.sensitive ? "destructive" : "default"} className="mr-1 uppercase">
                                    {labelize(item.status)}
                                  </Badge>
                                  <span className="truncate" title={item.title}>{labelize(item.captureType)}: {item.title}</span>
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(project.activity.approvals.recent.length > 0 || project.activity.sourceEvents.recent.length > 0) && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {project.activity.approvals.recent.length > 0 && (
                        <RecentList
                          title="Approval Queue"
                          onSelect={() => {
                            setInspectorQueue("approvals");
                            setSelectedSlug(project.slug);
                          }}
                          items={project.activity.approvals.recent.map((item) => ({
                            id: item.id,
                            label: labelize(item.actionType),
                            text: item.requestedByAgent ? `by ${AGENT_LABELS[item.requestedByAgent] ?? item.requestedByAgent}` : item.targetType ?? "local approval",
                            tone: item.sensitive ? C.danger : C.warning,
                          }))}
                        />
                      )}
                      {project.activity.sourceEvents.recent.length > 0 && (
                        <RecentList
                          title="Source Events"
                          onSelect={() => {
                            setInspectorQueue("sources");
                            setSelectedSlug(project.slug);
                          }}
                          items={project.activity.sourceEvents.recent.map((item) => ({
                            id: item.id,
                            label: labelize(item.eventType),
                            text: item.title ?? item.sourceDisplayName ?? item.trustLevel ?? "source event",
                            tone: item.sensitive ? C.danger : C.accent,
                          }))}
                        />
                      )}
                    </div>
                  )}

                  {project.git.dirty && (
                    <Button
                      type="button"
                      aria-label={`Inspect Worktree Changes for ${project.name}`}
                      onClick={() => {
                        setInspectorQueue("git");
                        setSelectedSlug(project.slug);
                      }}
                      className="mt-3 h-auto w-full justify-start rounded p-2 text-left"
                      variant="destructive"
                      style={{ background: `${C.danger}0d`, border: `1px solid ${C.danger}33` }}
                    >
                      <span className="block w-full">
                        <span className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                            Worktree Changes
                          </span>
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: C.danger }}>
                            {project.git.dirtyCount}
                          </span>
                        </span>
                        <span className="space-y-1" role="list" aria-label={`${project.name} worktree changes`}>
                          {project.git.changes.slice(0, 5).map((change) => (
                            <span
                              key={change}
                              role="listitem"
                              className="block text-[11px] leading-snug truncate px-2 py-1 rounded"
                              style={{ color: C.textSecondary, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                              title={change}
                            >
                              {compactPathLabel(change)}
                            </span>
                          ))}
                        </span>
                      </span>
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectDetailInspector({
  projectName,
  detail,
  initialQueue,
  isLoading,
  onClose,
  onAppendDraftNote,
  appendingDraftNote,
  appendedDraftNoteId,
  appendedDraftNoteDraftId,
}: {
  projectName: string;
  detail: any;
  initialQueue: InspectorQueue;
  isLoading: boolean;
  onClose: () => void;
  onAppendDraftNote?: (draftId: number, note: string) => void;
  appendingDraftNote?: boolean;
  appendedDraftNoteId?: number | null;
  appendedDraftNoteDraftId?: number | null;
}) {
  const approvals = detail?.approvals ?? [];
  const terminal = detail?.terminalObservations ?? [];
  const captures = detail?.hedwigCaptures ?? [];
  const reminders = detail?.reminderProposals ?? [];
  const messages = detail?.messageDrafts ?? [];
  const sources = detail?.sourceEvents ?? [];
  const drafts = detail?.actionDrafts ?? [];
  const git = detail?.git;
  const [activeQueue, setActiveQueue] = useState<InspectorQueue>(initialQueue);
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
  const [inspectorSearch, setInspectorSearch] = useState("");
  const [inspectorLabelFilter, setInspectorLabelFilter] = useState<string | null>(null);
  const [inspectorSort, setInspectorSort] = useState<InspectorSort>("default");
  const [draftNote, setDraftNote] = useState("");
  useEffect(() => {
    setActiveQueue(initialQueue);
    setSelectedItemId(null);
    setInspectorSearch("");
    setInspectorLabelFilter(null);
    setInspectorSort("default");
  }, [initialQueue, projectName]);
  const hedwigItems = [
    ...captures.map((item: any) => ({
      id: `capture-${item.id}`,
      label: labelize(item.status),
      text: `${labelize(item.captureType)}: ${item.title}`,
      meta: item.sensitive ? "sensitive" : compactTime(item.createdAt),
      tone: item.sensitive ? C.danger : C.accent,
      fields: [
        ["Kind", "Hedwig capture"],
        ["Capture Type", labelize(item.captureType)],
        ["Status", labelize(item.status)],
        ["Sensitive", item.sensitive ? "yes" : "no"],
        ["Created", compactTime(item.createdAt)],
      ],
    })),
    ...reminders.map((item: any) => ({
      id: `reminder-${item.id}`,
      label: "reminder",
      text: item.title,
      meta: item.timingHint ?? labelize(item.status),
      tone: C.warning,
      fields: [
        ["Kind", "Reminder proposal"],
        ["Status", labelize(item.status)],
        ["Review Priority", labelize(item.reviewPriority)],
        ["Timing Hint", item.timingHint ?? "unset"],
        ["Approval Scope", item.approvalScope ?? "none"],
      ],
    })),
    ...messages.map((item: any) => ({
      id: `message-${item.id}`,
      label: "message",
      text: item.title,
      meta: item.recipientHint ?? labelize(item.status),
      tone: C.warning,
      fields: [
        ["Kind", "Message draft proposal"],
        ["Status", labelize(item.status)],
        ["Review Priority", labelize(item.reviewPriority)],
        ["Recipient Hint", item.recipientHint ?? "unset"],
        ["Approval Scope", item.approvalScope ?? "none"],
      ],
    })),
  ];
  const gitItems = git
    ? [
        {
          id: "git-summary",
          label: git.statusText === "dirty" ? "dirty" : git.localExists ? git.statusText : "missing",
          text: git.localExists ? `${git.dirtyCount} local worktree change${git.dirtyCount === 1 ? "" : "s"}` : "local repo path missing",
          meta: git.branch ?? "no branch",
          tone: git.statusText === "dirty" ? C.danger : git.localExists ? C.success : C.warning,
          fields: [
            ["Status", git.localExists ? labelize(git.statusText) : "missing"],
            ["Branch", git.branch ?? "unavailable"],
            ["Upstream", git.upstream ?? git.remote ?? "unavailable"],
            ["Remote", git.remote ?? "unavailable"],
            ["Local Path", git.localPath],
            ["GitHub Repo", git.githubRepo],
            ["Dirty Count", String(git.dirtyCount)],
          ],
        },
        ...((git.changes ?? []) as string[]).map((change, index) => ({
          id: `git-change-${index}`,
          label: change.slice(0, 2).trim() || "change",
          text: change.slice(3).trim() || change,
          meta: git.branch ?? "worktree",
          tone: C.warning,
          fields: [
            ["Status Code", change.slice(0, 2).trim() || "unknown"],
            ["Path", change.slice(3).trim() || change],
            ["Raw", change],
            ["Branch", git.branch ?? "unavailable"],
            ["Local Path", git.localPath],
          ],
        })),
      ]
    : [];
  const queues = [
    {
      id: "approvals" as const,
      label: "Approvals",
      empty: "No local pending approvals.",
      items: approvals.map((item: any) => ({
        id: item.id,
        label: labelize(item.actionType),
        text: item.reason ?? item.contextSummary ?? item.targetType ?? "local approval preview",
        meta: item.requestedByAgent ? `by ${AGENT_LABELS[item.requestedByAgent] ?? item.requestedByAgent}` : compactTime(item.createdAt),
        tone: item.sensitive ? C.danger : C.warning,
        fields: [
          ["Action", labelize(item.actionType)],
          ["Target", item.targetType ? labelize(item.targetType) : "none"],
          ["Requested By", item.requestedByAgent ? (AGENT_LABELS[item.requestedByAgent] ?? item.requestedByAgent) : "unknown"],
          ["Sensitive", item.sensitive ? "yes" : "no"],
          ["Cost/Risk", item.costRisk ?? "not set"],
          ["Reason", item.reason ?? "not set"],
          ["Context", item.contextSummary ?? "not set"],
        ],
      })),
    },
    {
      id: "terminal" as const,
      label: "Terminal",
      empty: "No local terminal observations.",
      items: terminal.map((item: any) => ({
        id: item.id,
        label: labelize(item.status),
        text: item.outputSummary ?? compactCommandLabel(item.command),
        meta: labelize(item.risk),
        tone: item.status === "blocked" ? C.danger : item.status === "reviewing" ? C.warning : C.accent,
        fields: [
          ["Command", compactCommandLabel(item.command), item.command],
          ["Status", labelize(item.status)],
          ["Risk", labelize(item.risk)],
          ["Suggested Agent", item.suggestedAgent ? (AGENT_LABELS[item.suggestedAgent] ?? item.suggestedAgent) : "none"],
          ["Output Summary", item.outputSummary ?? "none"],
          ["Created", compactTime(item.createdAt)],
        ],
      })),
    },
    {
      id: "hedwig" as const,
      label: "Hedwig",
      empty: "No local Hedwig proposals.",
      items: hedwigItems,
    },
    {
      id: "sources" as const,
      label: "Sources",
      empty: "No local source events.",
      items: sources.map((item: any) => ({
        id: item.id,
        label: labelize(item.eventType),
        text: item.title ?? item.sourceDisplayName ?? item.trustLevel ?? "source event",
        meta: item.trustLevel ?? compactTime(item.createdAt),
        tone: item.sensitive ? C.danger : C.accent,
        fields: [
          ["Event Type", labelize(item.eventType)],
          ["Title", item.title ?? "untitled"],
          ["Source", item.sourceDisplayName ?? (item.uri ? sourceDisplayName(item.uri) : "not recorded")],
          ["Trust Level", item.trustLevel ?? "unknown"],
          ["Sensitive", item.sensitive ? "yes" : "no"],
          ["Created", compactTime(item.createdAt)],
        ],
      })),
    },
    {
      id: "drafts" as const,
      label: "Drafts",
      empty: "No local Project Lab action drafts.",
      items: drafts.map((item: any) => ({
        id: item.id,
        label: labelize(item.actionKey),
        text: item.title,
        meta: item.ownerAgent ? (AGENT_LABELS[item.ownerAgent] ?? item.ownerAgent) : compactTime(item.createdAt),
        tone: C.accent,
        fields: [
          ["Draft", item.title],
          ["Action", labelize(item.actionKey)],
          ["Status", labelize(item.status)],
          ["Proposed By", AGENT_LABELS[item.proposedByAgent] ?? item.proposedByAgent],
          ["Owner", item.ownerAgent ? (AGENT_LABELS[item.ownerAgent] ?? item.ownerAgent) : "none"],
          ["Summary", item.summary],
          ["Notes", item.notes?.length ? item.notes.map((note: any) => `${compactTime(note.createdAt)} ${AGENT_LABELS[note.authorAgent] ?? note.authorAgent}: ${note.note}`).join("\n\n") : "none"],
          ["Created", compactTime(item.createdAt)],
        ],
      })),
    },
    {
      id: "git" as const,
      label: "Git",
      empty: "No local git status returned.",
      items: gitItems,
    },
    {
      id: "gates" as const,
      label: "Gates",
      empty: "No gates returned.",
      items: (detail?.gates ?? []).map((gate: string, index: number) => ({
        id: `gate-${index}`,
        label: "gate",
        text: gate,
        meta: "policy",
        tone: C.textMuted,
        fields: [["Gate", gate]],
      })),
    },
  ];
  const active = queues.find((queue) => queue.id === activeQueue) ?? queues[0];
  const searchNeedle = inspectorSearch.trim().toLowerCase();
  const labelCounts = active.items.reduce((counts: Record<string, number>, item: { label: string }) => {
    counts[item.label] = (counts[item.label] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const labelFilters = (Object.entries(labelCounts) as Array<[string, number]>)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);
  const labelFilteredItems = inspectorLabelFilter
    ? active.items.filter((item: { label: string }) => item.label === inspectorLabelFilter)
    : active.items;
  const filterActive = Boolean(searchNeedle || inspectorLabelFilter);
  const filterLabel = [inspectorLabelFilter ? labelize(inspectorLabelFilter) : null, searchNeedle || null].filter(Boolean).join(" + ");
  const filteredActiveItems = searchNeedle
    ? labelFilteredItems.filter((item: { label: string; text: string; meta: string; fields?: string[][] }) => {
        const haystack = [
          item.label,
          item.text,
          item.meta,
          ...(item.fields ?? []).flatMap(([label, value]) => [label, value]),
        ].join(" ").toLowerCase();
        return haystack.includes(searchNeedle);
      })
    : labelFilteredItems;
  const visibleActiveItems = [...filteredActiveItems].sort((a: { label: string; text: string; meta: string }, b: { label: string; text: string; meta: string }) => {
    if (inspectorSort === "type") {
      return a.label.localeCompare(b.label) || a.text.localeCompare(b.text) || a.meta.localeCompare(b.meta);
    }
    if (inspectorSort === "text") {
      return a.text.localeCompare(b.text) || a.label.localeCompare(b.label) || a.meta.localeCompare(b.meta);
    }
    return 0;
  });
  const selectedItem = visibleActiveItems.find((item: { id: string | number }) => item.id === selectedItemId) ?? visibleActiveItems[0] ?? null;
  const sortOptions: Array<{ id: InspectorSort; label: string }> = [
    { id: "default", label: "Default" },
    { id: "type", label: "Type" },
    { id: "text", label: "Text" },
  ];

  return (
    <section className="shrink-0 px-3 py-2" aria-label={`${projectName} Local Inspector`} aria-busy={isLoading} style={{ background: C.surface, borderBottom: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
            Local Inspector
          </div>
          <div className="text-sm font-semibold truncate" style={{ color: C.textPrimary }} title={projectName}>
            {projectName}
          </div>
        </div>
        <Button type="button" onClick={onClose} aria-label="Hide local inspector" variant="outline" size="sm" className="shrink-0">
          Hide
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-2 text-xs" style={{ color: C.textMuted }}>Reading local queue details.</div>
      ) : (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-7">
            {queues.map((queue) => (
              <Button
                key={queue.id}
                type="button"
                aria-pressed={activeQueue === queue.id}
                aria-label={`Show ${queue.label} inspector queue`}
                onClick={() => {
                  setActiveQueue(queue.id);
                  setSelectedItemId(null);
                  setInspectorSearch("");
                  setInspectorLabelFilter(null);
                  setInspectorSort("default");
                }}
                variant={activeQueue === queue.id ? "default" : "secondary"}
                size="sm"
                className="justify-between"
              >
                <span>{queue.label}</span>
                <span className="ml-2" style={{ color: activeQueue === queue.id ? undefined : C.textMuted }}>{queue.items.length}</span>
              </Button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-1.5 xl:grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_auto] xl:items-center">
            <Input
              type="search"
              aria-label={`Search ${active.label} inspector rows`}
              value={inspectorSearch}
              onChange={(event) => {
                setInspectorSearch(event.target.value);
                setSelectedItemId(null);
              }}
              placeholder={`Filter ${active.label.toLowerCase()} rows`}
              className="min-w-0 flex-1"
            />
            <div className="flex flex-wrap gap-1 min-w-0">
              {labelFilters.length > 1 && (
                <Button
                  type="button"
                  aria-pressed={inspectorLabelFilter == null}
                  aria-label={`Show all ${active.label} row types`}
                  onClick={() => {
                    setInspectorLabelFilter(null);
                    setSelectedItemId(null);
                  }}
                  variant={inspectorLabelFilter == null ? "default" : "secondary"}
                  size="sm"
                >
                  All {active.items.length}
                </Button>
              )}
              {labelFilters.length > 1 && labelFilters.map(([label, count]) => (
                  <Button
                    type="button"
                    key={label}
                    aria-pressed={inspectorLabelFilter === label}
                    aria-label={`Show ${labelize(label)} ${active.label} rows`}
                    onClick={() => {
                      setInspectorLabelFilter(label);
                      setSelectedItemId(null);
                    }}
                    variant={inspectorLabelFilter === label ? "default" : "secondary"}
                    size="sm"
                  >
                    {labelize(label)} {count}
                  </Button>
              ))}
              {sortOptions.map((option) => (
                <Button
                  type="button"
                  key={option.id}
                  aria-pressed={inspectorSort === option.id}
                  aria-label={`Sort inspector rows by ${option.label}`}
                  onClick={() => {
                    setInspectorSort(option.id);
                    setSelectedItemId(null);
                  }}
                  variant={inspectorSort === option.id ? "default" : "secondary"}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 xl:justify-end">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: C.success }}>
                read-only
              </span>
              {filterActive && (
                <Button
                  type="button"
                  aria-label="Reset inspector filters"
                  onClick={() => {
                    setInspectorSearch("");
                    setInspectorLabelFilter(null);
                    setSelectedItemId(null);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-2 mt-2">
            <DetailColumn
              title={active.label}
              empty={active.empty}
              items={visibleActiveItems}
              totalItems={active.items.length}
              filterActive={filterActive}
              filterLabel={filterLabel}
              selectedId={selectedItem?.id ?? null}
              onSelect={setSelectedItemId}
            />
            <DetailPreview
              item={selectedItem}
              activeQueue={activeQueue}
              draftNote={draftNote}
              onDraftNoteChange={setDraftNote}
              onAppendDraftNote={(draftId) => {
                if (!draftNote.trim()) return;
                onAppendDraftNote?.(draftId, draftNote.trim());
                setDraftNote("");
              }}
              appendingDraftNote={appendingDraftNote}
              appendedDraftNoteId={appendedDraftNoteId}
              appendedDraftNoteDraftId={appendedDraftNoteDraftId}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function DetailColumn({
  title,
  empty,
  items,
  totalItems,
  filterActive,
  filterLabel,
  selectedId,
  onSelect,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string | number; label: string; text: string; meta: string; tone: string; fields?: Array<[string, string, string?]> }>;
  totalItems: number;
  filterActive: boolean;
  filterLabel: string;
  selectedId?: string | number | null;
  onSelect?: (id: string | number) => void;
}) {
  const visibleItems = items.slice(0, 12);

  return (
    <div className="min-w-0 rounded p-2" role="region" aria-label={`${title} inspector rows`} style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
          {title}{filterActive ? ` filtered: ${filterLabel}` : ""}
        </div>
        <div className="text-[10px] uppercase tracking-wider" role="status" aria-live="polite" style={{ color: items.length ? C.accent : C.textMuted }}>
          {filterActive ? `${items.length}/${totalItems}` : items.length}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-[11px]" style={{ color: C.textMuted }}>{filterActive ? "No local rows match the current filter." : empty}</div>
      ) : (
        <>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {visibleItems.map((item) => (
              <Button
                type="button"
                key={item.id}
                aria-pressed={selectedId === item.id}
                aria-label={`Inspect ${item.label}: ${item.text}`}
                onClick={() => onSelect?.(item.id)}
                className="h-auto w-full justify-start rounded px-2 py-1 text-left"
                variant={selectedId === item.id ? "secondary" : "ghost"}
                style={{
                  background: selectedId === item.id ? `${C.accent}14` : C.surface,
                  border: `1px solid ${selectedId === item.id ? C.accentSoft : C.borderSoft}`,
                }}
              >
                <span className="grid w-full grid-cols-[86px_minmax(0,1fr)_72px] gap-2 text-[11px] leading-snug">
                  <span className="uppercase tracking-wider truncate" style={{ color: item.tone }} title={item.label}>
                    {item.label}
                  </span>
                  <span className="truncate" title={item.text}>
                    {item.text}
                  </span>
                  <span className="truncate text-right" style={{ color: C.textMuted }} title={item.meta}>
                    {item.meta}
                  </span>
                </span>
              </Button>
            ))}
          </div>
          {items.length > visibleItems.length && (
            <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
              Showing {visibleItems.length} of {items.length} local rows
            </div>
          )}
          {filterActive && (
            <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
              Filter matched {items.length} of {totalItems} local rows
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailPreview({
  item,
  activeQueue,
  draftNote,
  onDraftNoteChange,
  onAppendDraftNote,
  appendingDraftNote,
  appendedDraftNoteId,
  appendedDraftNoteDraftId,
}: {
  item: { id: string | number; label: string; text: string; meta: string; tone: string; fields?: Array<[string, string, string?]> } | null;
  activeQueue?: InspectorQueue;
  draftNote?: string;
  onDraftNoteChange?: (value: string) => void;
  onAppendDraftNote?: (draftId: number) => void;
  appendingDraftNote?: boolean;
  appendedDraftNoteId?: number | null;
  appendedDraftNoteDraftId?: number | null;
}) {
  const isLongField = (value: string) => value.length > 120 || value.includes("\n");
  const savedNoteForThisDraft = activeQueue === "drafts" && typeof item?.id === "number" && appendedDraftNoteDraftId === item.id
    ? appendedDraftNoteId
    : null;

  return (
    <div className="min-w-0 rounded p-2 max-h-72 overflow-y-auto" role="region" aria-label="Inspector row detail" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
        Detail
      </div>
      {!item ? (
        <div className="text-[11px]" style={{ color: C.textMuted }}>Select a local row to inspect metadata.</div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs font-semibold leading-snug break-words" style={{ color: C.textPrimary }} title={item.text}>
              {item.text}
            </div>
            <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: item.tone }}>
              {item.label}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
            {(item.fields ?? []).map(([label, value, title]) => (
              <div
                key={label}
                className={`min-w-0 rounded px-2 py-1 ${isLongField(value) ? "md:col-span-2" : ""}`}
                style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
              >
                <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                  {label}
                </div>
                <div
                  className="text-[11px] leading-relaxed break-words whitespace-pre-wrap"
                  style={{ color: C.textSecondary }}
                  title={title ?? value}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
            Read-only metadata. No action is performed from this row.
          </div>
          {activeQueue === "drafts" && typeof item.id === "number" && (
            <div className="mt-3 rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                Append Draft Note
              </div>
              <Textarea
                value={draftNote ?? ""}
                onChange={(event) => onDraftNoteChange?.(event.target.value)}
                aria-label="Append local Project Lab draft note"
                placeholder="Local note for this draft. No task is created."
                className="min-h-20"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div role="status" aria-live="polite" className="text-[10px]" style={{ color: C.textMuted }}>
                  {savedNoteForThisDraft ? `Saved note #${savedNoteForThisDraft}.` : "Notes append to local draft history."}
                </div>
                <Button
                  type="button"
                  disabled={!draftNote?.trim() || appendingDraftNote}
                  onClick={() => onAppendDraftNote?.(item.id as number)}
                  aria-label="Append local Project Lab draft note"
                  size="sm"
                >
                  {appendingDraftNote ? "Saving" : "Append"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBlock({ label, value, tone, onSelect }: { label: string; value: string; tone: string; onSelect?: () => void }) {
  const content = (
    <>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="text-xs font-semibold truncate" style={{ color: tone }} title={value}>
        {labelize(value)}
      </div>
    </>
  );

  if (onSelect) {
    return (
      <Button
        type="button"
        onClick={onSelect}
        aria-label={`Show ${label} project view`}
        className="h-auto min-w-0 justify-start rounded p-2 text-left"
        variant="secondary"
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        {content}
      </Button>
    );
  }

  return (
    <div
      className="min-w-0 rounded p-2"
      role="status"
      aria-label={`${label}: ${labelize(value)}. Informational only.`}
      title={`${label}: ${labelize(value)}. Informational only.`}
      style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
    >
      {content}
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="text-xs truncate" style={{ color: C.textSecondary }} title={value}>
        {value}
      </div>
    </div>
  );
}

function EmptyProjectFilter({
  filter,
  signals,
  onShowAll,
  onSelectFilter,
}: {
  filter: ProjectViewFilter;
  signals: Array<{ id: ProjectViewFilter; label: string; count: number; tone: string }>;
  onShowAll: () => void;
  onSelectFilter: (filter: ProjectViewFilter) => void;
}) {
  return (
    <div className="px-4 py-4">
      <div className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              No {labelize(filter)} projects
            </div>
            <div className="text-[11px] leading-relaxed mt-1" style={{ color: C.textMuted }}>
              This local view has no matching project cards right now. No data was changed.
            </div>
          </div>
          <Button
            type="button"
            onClick={onShowAll}
            aria-label="Reset to all projects"
            className="shrink-0"
            size="sm"
          >
            All
          </Button>
        </div>
        {signals.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {signals.map((signal) => (
              <Button
                key={`${signal.label}-${signal.id}`}
                type="button"
                onClick={() => onSelectFilter(signal.id)}
                aria-label={`Show ${signal.label} signal projects`}
                variant="secondary"
                size="sm"
              >
                {signal.label} {signal.count}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentList({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: Array<{ id: number; label: string; text: string; tone: string }>;
  onSelect?: () => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            type="button"
            key={item.id}
            onClick={onSelect}
            aria-label={`Inspect ${title}: ${item.label} ${item.text}`}
            className="h-auto w-full justify-start rounded px-2 py-1 text-left"
            variant="secondary"
          >
            <span className="grid w-full grid-cols-[92px_minmax(0,1fr)] gap-2 text-[11px] leading-snug">
              <span className="uppercase tracking-wider truncate" style={{ color: item.tone }} title={item.label}>
                {item.label}
              </span>
              <span className="truncate" title={item.text}>
                {item.text}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function ChipRow({
  label,
  items,
  tone = C.textSecondary,
  compact = false,
}: {
  label: string;
  items: readonly string[];
  tone?: string;
  compact?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className={compact ? "" : "flex items-start gap-2"}>
      <div
        className={compact ? "text-[10px] uppercase tracking-wider mb-1" : "text-[10px] uppercase tracking-wider pt-1 shrink-0 w-14"}
        style={{ color: C.textMuted }}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-1 min-w-0">
        {items.map((item) => (
          <Badge key={item} variant={badgeVariantForTone(tone)} className="uppercase">
            {labelize(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function badgeVariantForTone(tone: string) {
  if (tone === C.danger) return "destructive";
  if (tone === C.warning || tone === C.gold) return "warning";
  if (tone === C.success) return "success";
  if (tone === C.accentViolet || tone === C.glowViolet) return "violet";
  if (tone === C.accent) return "default";
  return "secondary";
}
