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
type ProjectLabFocusDraft = {
  source?: string;
  projectId?: number | null;
  projectName?: string | null;
  evidenceId?: number;
  notice?: string;
};

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
  const [pushReceiptSlug, setPushReceiptSlug] = useState<string | null>(null);
  const [autoPushSlugs, setAutoPushSlugs] = useState<Set<string>>(() => new Set());
  const [ledgerFocusNotice, setLedgerFocusNotice] = useState<string | null>(null);
  const [projectReceiptsOpen, setProjectReceiptsOpen] = useState(false);
  const overview = trpc.projectIntelligence.overview.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const projectGitStatus = trpc.projectIntelligence.gitStatus.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const workbenchEvidenceSummary = trpc.workbench.evidenceSummary.useQuery(
    { groupBy: "project", latestLimit: 1 },
    {
      enabled: projectReceiptsOpen,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = trpc.useUtils();
  const [lastDraftNoteNotice, setLastDraftNoteNotice] = useState<{ draftId: number; noteId: number } | null>(null);
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
    {
      enabled: Boolean(selectedSlug),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const data = overview.data;
  const gitRead = projectGitStatus.data ?? data?.gitStatus;
  const projects = data?.projects ?? [];
  const evidenceByProjectId = new Map(
    (workbenchEvidenceSummary.data?.groups ?? [])
      .filter((group) => group.key !== "unlinked")
      .map((group) => [
        Number(group.key),
        {
          total: group.count,
          terminal: group.terminal,
          needsReview: group.needsReview,
          validated: group.validated,
        },
      ]),
  );
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
    {
      label: "Receipts",
      value: projectReceiptsOpen ? String(workbenchEvidenceSummary.data?.summary.total ?? 0) : "open",
      tone: !projectReceiptsOpen ? C.textMuted : (workbenchEvidenceSummary.data?.summary.needsReview ?? 0) > 0 ? C.warning : C.success,
    },
  ];
  const receiptChainStats = {
    total: projectReceiptsOpen ? workbenchEvidenceSummary.data?.summary.total ?? 0 : 0,
    terminal: projectReceiptsOpen ? workbenchEvidenceSummary.data?.summary.terminal ?? 0 : 0,
    needsReview: projectReceiptsOpen ? workbenchEvidenceSummary.data?.summary.needsReview ?? 0 : 0,
    validated: projectReceiptsOpen ? workbenchEvidenceSummary.data?.summary.validated ?? 0 : 0,
  };

  useEffect(() => {
    if (projects.length === 0) return;
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:project-lab-focus");
      if (raw) window.sessionStorage.removeItem("cerebro:project-lab-focus");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as ProjectLabFocusDraft;
      const focusedProject = projects.find((project) => {
        if (draft.projectId != null && project.tasks.projectId === draft.projectId) return true;
        if (draft.projectName && project.name === draft.projectName) return true;
        return false;
      });
      setProjectFilter("all");
      if (focusedProject) {
        setSelectedSlug(focusedProject.slug);
        setPushReceiptSlug(focusedProject.slug);
        setInspectorQueue("git");
        setLedgerFocusNotice(draft.notice ?? `Ledger opened ${focusedProject.name} push context.`);
      } else {
        setLedgerFocusNotice(draft.notice ?? "Ledger opened Project Lab, but the receipt is not linked to a tracked project.");
      }
    } catch {
      setLedgerFocusNotice("Ledger focus could not be read. Use Project Lab filters.");
    }
  }, [projects]);

  return (
    <div className="flex h-full flex-col overflow-hidden" role="region" aria-label="Project Lab" aria-busy={overview.isLoading} style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              Project Lab
            </div>
            <Badge variant="secondary" className="uppercase">{projects.length} projects</Badge>
            <Badge variant="secondary" className="uppercase">Mode {labelize(data?.mode ?? "read_only")}</Badge>
            <Badge variant={gitRead?.runsGit ? "warning" : "secondary"} className="uppercase">
              Git {gitRead ? (gitRead.runsGit ? "read" : "cached") : "reading"}
            </Badge>
          </div>
        </div>
        <Button type="button" onClick={onClose} aria-label="Close Project Lab" variant="outline" size="sm" className="shrink-0">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1 px-2 py-1.5 shrink-0 md:grid-cols-5" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
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

      <div className="px-2 py-1.5 shrink-0 space-y-1.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="flex flex-wrap items-center gap-1">
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] uppercase tracking-wider" role="status" aria-live="polite" style={{ color: C.textMuted }}>
            {filterSortLabel(projectFilter)} · {viewSummary(topProject?.name ?? null, topScore, filteredProjects.length, projects.length, projectFilter)}
          </div>
          {attentionSignals.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Signals</span>
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
          )}
        </div>
        {ledgerFocusNotice && (
          <div className="flex items-center justify-between gap-2 rounded px-2 py-1 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.gold}66`, color: C.textSecondary }}>
            <span className="min-w-0">{ledgerFocusNotice}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => setLedgerFocusNotice(null)} aria-label="Dismiss Ledger focus notice">
              Dismiss
            </Button>
          </div>
        )}
        {nextSafeProjects.length > 0 && (
          <div className="grid grid-cols-[38px_minmax(0,1fr)] gap-1.5">
            <div className="text-[10px] uppercase tracking-wider pt-1" style={{ color: C.textMuted }}>
              Next
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 min-w-0">
              {nextSafeProjects.map(({ project }, nextIndex) => (
                <Button
                  key={project.slug}
                  type="button"
                  aria-label={`Inspect next safe action for ${project.name}`}
                  onClick={() => {
                    setInspectorQueue(preferredInspectorQueue(project, "attention"));
                    setSelectedSlug(project.slug);
                  }}
                  className="h-auto min-w-0 justify-start rounded p-1.5 text-left"
                  variant="secondary"
                >
                  <span className="block min-w-0 w-full">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.accent }} title={project.name}>
                        {project.name}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none shrink-0"
                        aria-label={`Attention rank ${nextIndex + 1}`}
                        style={{ color: C.warning, background: `${C.warning}14`, border: `1px solid ${C.warning}33` }}
                      >
                        #{nextIndex + 1}
                      </span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug line-clamp-2" title={project.nextSafeAction}>
                      {project.nextSafeAction}
                    </span>
                    <span className="flex flex-wrap gap-1 mt-1.5">
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
        <details
          className="rounded p-1.5"
          onToggle={(event) => setProjectReceiptsOpen(event.currentTarget.open)}
          style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
        >
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Project Rules <span style={{ color: C.textMuted }}>{projectReceiptsOpen ? "local receipts" : "open to read"}</span>
          </summary>
          <div className="mt-2 grid gap-1.5">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="uppercase">mode {labelize(data?.mode ?? "read_only")}</Badge>
              <Badge variant="secondary" className="uppercase">scanned {formatScannedAt(data?.scannedAt)}</Badge>
              <Badge variant="secondary" className="uppercase">{projects.length} projects</Badge>
            </div>
            <ProjectReceiptChainStrip
              stats={receiptChainStats}
              statsOpen={projectReceiptsOpen}
              statsReading={workbenchEvidenceSummary.isLoading}
              projectCount={projects.length}
              topProjectName={topProject?.name ?? null}
              topPushLabel={topProject?.pushReadiness.label ?? null}
            />
          </div>
        </details>
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
          <div className="px-2 py-1.5 text-[11px]" style={{ color: C.textMuted }}>Reading project landscape.</div>
        ) : projects.length === 0 ? (
          <div className="px-2 py-1.5 text-[11px] leading-snug" style={{ color: C.textMuted }}>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 px-2 pt-2 pb-16">
            {filteredProjects.map((project, index) => {
              const statusTone = toneForStatus(project.git.statusText, project.localExists);
              const reasons = attentionReasons(project);
              const rankScore = projectSignalScore(project, projectFilter);
              const scoreParts = signalBreakdown(project, projectFilter);
              const pushReadiness = project.pushReadiness;
              const pushTone = toneForPushState(pushReadiness.state);
              const showPushReceipt = pushReceiptSlug === project.slug;
              const autoPushArmed = autoPushSlugs.has(project.slug);
              const proofStats = project.tasks.projectId == null
                ? { total: 0, terminal: 0, needsReview: 0, validated: 0 }
                : projectReceiptsOpen ? evidenceByProjectId.get(project.tasks.projectId) ?? { total: 0, terminal: 0, needsReview: 0, validated: 0 } : { total: 0, terminal: 0, needsReview: 0, validated: 0 };
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
                  className="min-w-0 rounded p-2"
                  style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-[12px] font-semibold leading-tight" style={{ color: C.textPrimary }}>
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
                      <div className="text-[11px] leading-snug mt-1" style={{ color: C.textSecondary }}>
                        {project.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1.5 mt-2">
                    <MetaBlock label="Owner" value={AGENT_LABELS[project.ownerAgent] ?? project.ownerAgent} />
                    <MetaBlock label="Branch" value={project.git.branch ?? "unavailable"} />
                    <MetaBlock label="Tasks" value={`${project.tasks.inProgress} active / ${project.tasks.open} open`} />
                    <MetaBlock label="Approvals" value={`${project.activity.approvals.pending} pending`} />
                    <MetaBlock label="Hedwig" value={`${hedwigTotal(project.activity.hedwig)} proposals`} />
                    <MetaBlock label="Terminal" value={`${project.activity.terminalStatus.total} observations`} />
                    <MetaBlock label="Routes" value={project.activity.routes.total > 0 ? `${project.activity.routes.total} saved` : "none"} />
                    <MetaBlock label="Receipts" value={projectReceiptsOpen ? `${proofStats.total} receipts / ${proofStats.needsReview} review` : "open to read"} />
                  </div>

                  <ProjectMapRead
                    branch={project.git.branch}
                    dirty={project.git.dirty}
                    dirtyCount={project.git.dirtyCount}
                    pushLabel={pushReadiness.label}
                    pushState={pushReadiness.state}
                    riskFlags={project.riskFlags}
                    receiptStats={proofStats}
                    receiptStatsOpen={projectReceiptsOpen}
                    autoSelected={autoPushArmed}
                    nextSafeAction={project.nextSafeAction}
                  />

                  <div className="mt-2">
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                      Local Path
                    </div>
                    <div className="text-[11px] truncate" style={{ color: project.localExists ? C.textSecondary : C.warning }} title={project.localPath}>
                      {compactPathLabel(project.localPath)}
                    </div>
                  </div>

                  <div className="mt-2 rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPushReceiptSlug(showPushReceipt ? null : project.slug)}
                        aria-expanded={showPushReceipt}
                        aria-label={`Show push readiness receipt for ${project.name}`}
                        title="Read the git-state receipt. Project Lab does not run git."
                        className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none transition-[border-color,box-shadow] focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 focus-visible:outline-none"
                        style={{ color: pushTone, background: C.surface, borderColor: `${pushTone}66` }}
                      >
                        Push Readiness
                        <span>{pushReadiness.label}</span>
                      </button>
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          type="button"
                          variant={autoPushArmed ? "risk" : "outline"}
                          size="sm"
                          aria-pressed={autoPushArmed}
                          aria-label={`${autoPushArmed ? "Disable" : "Enable"} assisted push recommendation for ${project.name}`}
                          title={autoPushArmed ? "Assisted recommendation is selected. Manual push remains visible and approval-gated." : "Manual push remains visible. Assisted recommendation is off."}
                          onClick={() => {
                            setAutoPushSlugs((current) => {
                              const next = new Set(current);
                              if (next.has(project.slug)) next.delete(project.slug);
                              else next.add(project.slug);
                              return next;
                            });
                            setPushReceiptSlug(project.slug);
                          }}
                        >
                          {autoPushArmed ? "Policy: assisted" : "Policy: manual"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          aria-label={`Open push readiness receipt for ${project.name}`}
                          title="Open the push decision read. This is not a git action."
                          onClick={() => setPushReceiptSlug(showPushReceipt ? null : project.slug)}
                        >
                          Read
                        </Button>
                      </div>
                    </div>
                    <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                      {autoPushArmed ? "Assisted recommendation is selected. Manual commands stay visible. Git execution still needs approval." : "Read-only recommendation. Manual push stays visible. No git command runs here."}
                    </div>
                    <PushDecisionNote
                      stats={proofStats}
                      statsOpen={projectReceiptsOpen}
                      pushLabel={pushReadiness.label}
                      pushState={pushReadiness.state}
                    />
                    <details open={showPushReceipt} className="mt-1.5 rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                      <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                        Push Details
                      </summary>
                      <div className="mt-1.5 grid gap-1.5 text-[11px] leading-snug">
                        <PushModeStrip autoSelected={autoPushArmed} />
                        <ManualPushLine commands={pushReadiness.manualCommands} />
                        <PushEvidenceStrip
                          branch={pushReadiness.evidence.branch}
                          upstream={pushReadiness.evidence.upstream}
                          dirtyCount={pushReadiness.evidence.dirtyCount}
                          approvalRequired={pushReadiness.automationRequiresApproval}
                          executesGit={pushReadiness.executesGit}
                        />
                        <div className="mt-1.5 grid gap-1.5 text-[11px] leading-snug">
                          <PushReceiptBlock title="Why" items={pushReadiness.why} tone={pushTone} />
                          <PushReceiptBlock title="Stays Out" items={pushReadiness.staysOut} tone={C.warning} />
                          <PushReceiptBlock title="Checks" items={pushReadiness.checks} tone={C.accent} />
                          <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
                              Suggested Commit
                            </div>
                            <div className="mt-1 break-words" style={{ color: C.textSecondary }}>{pushReadiness.suggestedCommit}</div>
                          </div>
                          <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
                                Manual Push
                              </div>
                              <Badge variant="warning" className="uppercase">
                                <span className="min-w-0 truncate">preview only</span>
                              </Badge>
                            </div>
                            <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                              Copy or run these outside Project Lab after review. This panel never runs git.
                            </div>
                            <div className="mt-1 grid gap-0.5">
                              {pushReadiness.manualCommands.map((command) => (
                                <code key={command} className="block truncate text-[10px]" title={command} style={{ color: C.textSecondary }}>
                                  {command}
                                </code>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  <div className="mt-2 space-y-1.5">
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

                  <div className="mt-2 rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                    <div className="grid gap-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
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

                  <div className="mt-2 grid grid-cols-2 gap-1 xl:grid-cols-5">
                    {activitySignals.map((signal) => (
                      <Button
                        key={signal.title}
                        type="button"
                        aria-label={`Inspect ${project.name} ${signal.title}`}
                        onClick={() => {
                          setInspectorQueue(signal.queue);
                          setSelectedSlug(project.slug);
                        }}
                        className="h-auto min-w-0 justify-start rounded p-1.5 text-left"
                        variant="secondary"
                        style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                      >
                        <span className="block min-w-0 w-full">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.textMuted }}>
                              {signal.title}
                            </span>
                            <span className="text-[12px] font-semibold shrink-0" style={{ color: signal.tone }}>
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

                  {project.git.dirty && (
                    <Button
                      type="button"
                      aria-label={`Inspect Worktree Changes for ${project.name}`}
                      onClick={() => {
                        setInspectorQueue("git");
                        setSelectedSlug(project.slug);
                      }}
                      className="mt-2 h-auto w-full justify-start rounded p-1.5 text-left"
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
                        <span className="block text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                          Open Project Read to review files before any commit.
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
    <section className="shrink-0 px-2 py-1.5" aria-label={`${projectName} Project Read`} aria-busy={isLoading} style={{ background: C.surface, borderBottom: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
            Project Read
          </div>
          <div className="text-[12px] font-semibold truncate" style={{ color: C.textPrimary }} title={projectName}>
            {projectName}
          </div>
        </div>
        <Button type="button" onClick={onClose} aria-label="Hide project read" variant="outline" size="sm" className="shrink-0">
          Hide
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-1.5 text-[11px]" style={{ color: C.textMuted }}>Reading project details.</div>
      ) : (
        <div className="mt-1.5">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-7">
            {queues.map((queue) => (
              <Button
                key={queue.id}
                type="button"
                aria-pressed={activeQueue === queue.id}
                aria-label={`Show ${queue.label} project rows`}
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

          <div className="mt-1.5 grid grid-cols-1 gap-1.5 xl:grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_auto] xl:items-center">
            <Input
              type="search"
              aria-label={`Search ${active.label} project rows`}
              value={inspectorSearch}
              onChange={(event) => {
                setInspectorSearch(event.target.value);
                setSelectedItemId(null);
              }}
              placeholder={`Find ${active.label.toLowerCase()}`}
              className="min-w-0 flex-1"
            />
            <div className="flex flex-wrap gap-1 min-w-0">
              {labelFilters.length > 1 && (
                <Button
                  type="button"
                  aria-pressed={inspectorLabelFilter == null}
                  aria-label={`Show all ${active.label} types`}
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
                    aria-label={`Show ${labelize(label)} ${active.label} type`}
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
                  aria-label={`Sort project rows by ${option.label}`}
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
                  aria-label="Reset project read filters"
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

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] gap-1.5 mt-1.5">
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
    <div className="min-w-0 rounded p-1.5" role="region" aria-label={`${title} project rows`} style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
          {title}{filterActive ? ` filtered: ${filterLabel}` : ""}
        </div>
        <div className="text-[10px] uppercase tracking-wider" role="status" aria-live="polite" style={{ color: items.length ? C.accent : C.textMuted }}>
          {filterActive ? `${items.length}/${totalItems}` : items.length}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-[11px]" style={{ color: C.textMuted }}>{filterActive ? "No rows match the current filter." : empty}</div>
      ) : (
        <>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {visibleItems.map((item) => (
              <Button
                type="button"
                key={item.id}
                aria-pressed={selectedId === item.id}
                aria-label={`Inspect ${item.label}: ${item.text}`}
                onClick={() => onSelect?.(item.id)}
                className="h-auto w-full justify-start rounded px-1.5 py-1 text-left"
                variant={selectedId === item.id ? "secondary" : "ghost"}
                style={{
                  background: selectedId === item.id ? `${C.accent}14` : C.surface,
                  border: `1px solid ${selectedId === item.id ? C.accentSoft : C.borderSoft}`,
                }}
              >
                <span className="grid w-full grid-cols-[76px_minmax(0,1fr)_64px] gap-1.5 text-[10px] leading-snug">
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
              Showing {visibleItems.length} of {items.length} rows
            </div>
          )}
          {filterActive && (
            <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
              Filter matched {items.length} of {totalItems} rows
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
    <div className="min-w-0 rounded p-1.5 max-h-64 overflow-y-auto" role="region" aria-label="Project row detail" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
        Detail
      </div>
      {!item ? (
        <div className="text-[11px]" style={{ color: C.textMuted }}>Select a row to read its metadata.</div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-semibold leading-snug break-words" style={{ color: C.textPrimary }} title={item.text}>
              {item.text}
            </div>
            <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: item.tone }}>
              {item.label}
            </span>
          </div>
          <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-1">
            {(item.fields ?? []).map(([label, value, title]) => (
              <div
                key={label}
                className={`min-w-0 rounded px-1.5 py-1 ${isLongField(value) ? "md:col-span-2" : ""}`}
                style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
              >
                <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                  {label}
                </div>
                <div
                  className="text-[10px] leading-snug break-words whitespace-pre-wrap"
                  style={{ color: C.textSecondary }}
                  title={title ?? value}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
            Read-only details. No action is performed from this row.
          </div>
          {activeQueue === "drafts" && typeof item.id === "number" && (
            <div className="mt-2 rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                Append Draft Note
              </div>
              <Textarea
                value={draftNote ?? ""}
                onChange={(event) => onDraftNoteChange?.(event.target.value)}
                aria-label="Append local Project Lab draft note"
                placeholder="Local note for this draft. No task is created."
                className="min-h-16"
              />
              <div className="mt-1.5 flex items-center justify-between gap-2">
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
      <div className="text-[11px] font-semibold truncate" style={{ color: tone }} title={value}>
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
        className="h-auto min-w-0 justify-start rounded p-1.5 text-left"
        variant="secondary"
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        {content}
      </Button>
    );
  }

  return (
    <div
      className="min-w-0 rounded p-1.5"
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
      <div className="text-[11px] truncate" style={{ color: C.textSecondary }} title={value}>
        {value}
      </div>
    </div>
  );
}

function ProjectMapRead({
  branch,
  dirty,
  dirtyCount,
  pushLabel,
  pushState,
  riskFlags,
  receiptStats,
  receiptStatsOpen,
  autoSelected,
  nextSafeAction,
}: {
  branch: string | null;
  dirty: boolean;
  dirtyCount: number;
  pushLabel: string;
  pushState: string;
  riskFlags: readonly string[];
  receiptStats: { total: number; terminal: number; needsReview: number; validated: number };
  receiptStatsOpen: boolean;
  autoSelected: boolean;
  nextSafeAction: string;
}) {
  const pushTone = toneForPushState(pushState);
  const receiptTone = !receiptStatsOpen ? C.textMuted : receiptStats.needsReview > 0 ? C.warning : receiptStats.total > 0 ? C.success : C.textMuted;
  const riskTone = riskFlags.length > 0 ? C.warning : C.success;
  const rows = [
    { label: "Branch", value: branch ?? "unavailable", tone: branch ? C.textSecondary : C.warning },
    { label: "Dirty", value: dirty ? `${dirtyCount} local change${dirtyCount === 1 ? "" : "s"}` : "clean", tone: dirty ? C.danger : C.success },
    { label: "Push", value: pushLabel, tone: pushTone },
    { label: "Risk", value: riskFlags[0] ?? "none flagged", tone: riskTone },
    { label: "Receipt", value: receiptStatsOpen ? `${receiptStats.total} Workbench / ${receiptStats.needsReview} review` : "open to read", tone: receiptTone },
    { label: "Manual", value: "visible, gated", tone: C.gold },
    { label: "Assist", value: autoSelected ? "recommendation selected" : "off", tone: autoSelected ? C.warning : C.textMuted },
  ];

  return (
    <section className="mt-2 rounded p-1.5" aria-label="Project map read" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.accent }}>
          Project Map Read
        </div>
        <Badge variant="secondary" className="uppercase">
          <span className="min-w-0 truncate">no git execution</span>
        </Badge>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1 md:grid-cols-4 xl:grid-cols-7">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0 rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[9px] font-semibold uppercase leading-none" style={{ color: row.tone }}>
              {row.label}
            </div>
            <div className="mt-0.5 truncate text-[10px] leading-tight" title={row.value} style={{ color: C.textSecondary }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
        Next safe action: <span style={{ color: C.textSecondary }}>{nextSafeAction}</span>
      </div>
    </section>
  );
}

function ProjectReceiptChainStrip({
  stats,
  statsOpen,
  statsReading,
  projectCount,
  topProjectName,
  topPushLabel,
}: {
  stats: { total: number; terminal: number; needsReview: number; validated: number };
  statsOpen: boolean;
  statsReading: boolean;
  projectCount: number;
  topProjectName: string | null;
  topPushLabel: string | null;
}) {
  const receiptTone = !statsOpen ? C.textMuted : stats.needsReview > 0 ? C.warning : stats.total > 0 ? C.success : C.textMuted;
  const steps = [
    {
      label: "Terminal proof",
      value: !statsOpen ? "open to read" : statsReading ? "reading" : stats.terminal > 0 ? `${stats.terminal} command receipt${stats.terminal === 1 ? "" : "s"}` : "no command receipts",
      tone: !statsOpen ? C.textMuted : stats.terminal > 0 ? C.gold : C.textMuted,
    },
    {
      label: "Workbench body",
      value: !statsOpen ? "open to read" : statsReading ? "reading" : `${stats.total} receipts / ${stats.needsReview} review`,
      tone: receiptTone,
    },
    {
      label: "Project context",
      value: topProjectName == null ? `${projectCount} projects read` : `${topProjectName}: ${topPushLabel ?? "push context"}`,
      tone: topProjectName == null ? C.textMuted : C.accent,
    },
  ];

  return (
    <section className="rounded p-1.5" aria-label="Project Lab receipt chain" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="grid gap-1 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="min-w-0 rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[9px] font-semibold uppercase leading-none" style={{ color: step.tone }}>
              {step.label}
            </div>
            <div className="mt-0.5 truncate text-[10px] leading-tight" title={step.value} style={{ color: C.textSecondary }}>
              {step.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
        Project Lab reads context only. Workbench has the body. Terminal has the command observation.
      </div>
    </section>
  );
}

function PushModeStrip({ autoSelected }: { autoSelected: boolean }) {
  return (
    <div className="mt-1 grid gap-1 sm:grid-cols-2" aria-label="Project push mode boundaries">
      <div className="rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="warning" className="uppercase">
            <span className="min-w-0 truncate">manual visible</span>
          </Badge>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
            approval gated
          </span>
        </div>
        <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
          Commands stay readable. The card never runs them.
        </div>
      </div>
      <div className="rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${autoSelected ? C.warning : C.borderSoft}` }}>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant={autoSelected ? "warning" : "secondary"} className="uppercase">
            <span className="min-w-0 truncate">{autoSelected ? "assisted" : "manual policy"}</span>
          </Badge>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: autoSelected ? C.warning : C.textMuted }}>
            recommendation only
          </span>
        </div>
        <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
          Assisted timing is a read. Approval still decides execution.
        </div>
      </div>
    </div>
  );
}

function ManualPushLine({ commands }: { commands: readonly string[] }) {
  const preview = commands.slice(0, 3).map(compactCommandLabel).join(" -> ");
  return (
    <div className="mt-1 rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant="warning" className="uppercase">
          <span className="min-w-0 truncate">manual push visible</span>
        </Badge>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
          approval gated
        </span>
      </div>
      <div className="mt-1 truncate text-[10px] leading-snug" style={{ color: C.textMuted }} title={commands.join(" -> ")}>
        {preview || "git review -> commit -> push"}
      </div>
    </div>
  );
}

function PushDecisionNote({
  stats,
  statsOpen,
  pushLabel,
  pushState,
}: {
  stats: { total: number; terminal: number; needsReview: number; validated: number };
  statsOpen: boolean;
  pushLabel: string;
  pushState: string;
}) {
  const readyState = pushState === "push_branch" || pushState === "open_pr" || pushState === "commit_locally";
  const decision = (() => {
    if (!statsOpen) {
      return {
        label: "open to read",
        tone: C.textMuted,
        text: "Open Project Rules to read the compact Workbench receipt summary before treating this as push evidence.",
      };
    }
    if (stats.needsReview > 0) {
      return {
        label: "hold",
        tone: C.warning,
        text: `${stats.needsReview} Workbench receipt${stats.needsReview === 1 ? "" : "s"} need review. Check the Workbench body and Ledger audit trail before commit.`,
      };
    }
    if (stats.total === 0) {
      return {
        label: "receipts missing",
        tone: readyState ? C.warning : C.textMuted,
        text: `No Workbench receipt is linked yet. ${pushLabel} is only a git-state read until a receipt exists.`,
      };
    }
    if (stats.validated > 0 && readyState) {
      return {
        label: "supported",
        tone: C.success,
        text: `${stats.validated} validated receipt${stats.validated === 1 ? "" : "s"} support ${pushLabel.toLowerCase()}. Review the staged diff before pushing.`,
      };
    }
    return {
      label: "receipts present",
      tone: C.accent,
      text: `${stats.total} receipt${stats.total === 1 ? "" : "s"} exist. Use Workbench for receipt bodies and Ledger for the audit trail.`,
    };
  })();

  return (
    <div className="mt-1 rounded px-1.5 py-1" style={{ background: C.surface, border: `1px solid ${decision.tone}55` }}>
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant={decision.label === "supported" ? "success" : decision.label === "hold" ? "warning" : "secondary"} className="uppercase" title={decision.label}>
          <span className="min-w-0 truncate">{decision.label}</span>
        </Badge>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: decision.tone }}>
          Push Decision Read
        </span>
      </div>
      <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textSecondary }}>
        {decision.text}
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
    <div className="px-2 py-2">
      <div className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              No {labelize(filter)} projects
            </div>
            <div className="text-[10px] leading-snug mt-1" style={{ color: C.textMuted }}>
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
          <div className="flex flex-wrap gap-1 mt-2">
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

function PushEvidenceStrip({
  branch,
  upstream,
  dirtyCount,
  approvalRequired,
  executesGit,
}: {
  branch: string | null;
  upstream: string | null;
  dirtyCount: number;
  approvalRequired: boolean;
  executesGit: boolean;
}) {
  const items = [
    { label: "Branch", value: branch ?? "unavailable", tone: branch ? C.textSecondary : C.warning },
    { label: "Upstream", value: upstream ?? "none", tone: upstream ? C.textSecondary : C.gold },
    { label: "Dirty", value: `${dirtyCount}`, tone: dirtyCount > 0 ? C.warning : C.success },
    { label: "Check", value: "not recorded", tone: C.textMuted },
    { label: "Gate", value: approvalRequired ? "approval" : "open", tone: approvalRequired ? C.accent : C.success },
    { label: "Executes", value: executesGit ? "yes" : "no", tone: executesGit ? C.danger : C.success },
  ];

  return (
    <div className="mt-1 grid grid-cols-2 gap-1 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0 rounded px-1.5 py-1"
          style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
        >
          <div className="text-[9px] font-semibold uppercase leading-none" style={{ color: item.tone }}>
            {item.label}
          </div>
          <div className="mt-0.5 truncate text-[10px] leading-tight" title={item.value} style={{ color: C.textSecondary }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function PushReceiptBlock({ title, items, tone }: { title: string; items: readonly string[]; tone: string }) {
  return (
    <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: tone }}>
        {title}
      </div>
      <ul className="mt-1 grid gap-0.5">
        {items.map((item) => (
          <li key={item} className="text-[10px] leading-snug" style={{ color: C.textSecondary }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function toneForPushState(state: string) {
  if (state === "needs_cleanup") return C.danger;
  if (state === "hold_dirty") return C.warning;
  if (state === "commit_locally") return C.accent;
  if (state === "open_pr") return C.gold;
  return C.success;
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
          <Badge key={item} variant={badgeVariantForTone(tone)} className="uppercase" title={labelize(item)}>
            <span className="min-w-0 truncate">{labelize(item)}</span>
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
