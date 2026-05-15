import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";
import { disambiguateSessionOptions, groupSessionFilters } from "@/lib/sessionLabels";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const NEXT_STATUS: Record<string, "open" | "in_progress" | "done" | "cancelled"> = {
  open: "in_progress",
  in_progress: "done",
  done: "open",
  cancelled: "open",
};

const TASK_PAGE_STEP = 80;

export default function TasksPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");
  const projects = trpc.tasks.projects.useQuery(undefined, { refetchInterval: 10000 });
  const sessions = trpc.sessions.list.useQuery({ limit: 25 }, { refetchInterval: 10000 });
  const rawSessionOptions = sessions.data ?? [];
  const sessionOptions = disambiguateSessionOptions(rawSessionOptions);
  const sessionFilterGroups = groupSessionFilters(rawSessionOptions);
  const selectedSessionGroup = sessionFilter === "all"
    ? null
    : sessionFilterGroups.find((group) => group.key === sessionFilter) ?? null;
  const listFilters =
    projectFilter === "all" && !selectedSessionGroup
      ? undefined
      : {
          ...(projectFilter === "all" ? {} : { projectId: projectFilter }),
          ...(selectedSessionGroup
            ? selectedSessionGroup.ids.length === 1
              ? { sessionId: selectedSessionGroup.ids[0] }
              : { sessionIds: selectedSessionGroup.ids }
            : {}),
        };
  const create = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.workQueue.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const setStatus = trpc.tasks.setStatus.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.workQueue.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const del = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.workQueue.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const [title, setTitle] = useState("");
  const [sessionDraft, setSessionDraft] = useState("none");
  const [deleteGate, setDeleteGate] = useState<{ id: number; title: string } | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [focusNotice, setFocusNotice] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(TASK_PAGE_STEP);
  const queueInput = {
    ...listFilters,
    limit: visibleLimit,
    focusedTaskId: focusedTaskId ?? undefined,
  };
  const queue = trpc.tasks.workQueue.useQuery(queueInput);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:tasks-focus");
      if (raw) window.sessionStorage.removeItem("cerebro:tasks-focus");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const focus = JSON.parse(raw) as { taskId?: number; notice?: string };
      if (typeof focus.taskId === "number") setFocusedTaskId(focus.taskId);
      setFocusNotice(focus.notice ?? "Tasks opened with a focused local task.");
    } catch {
      setFocusNotice("Task focus could not be read. Inspect the latest local task.");
    }
  }, []);

  useEffect(() => {
    setVisibleLimit(TASK_PAGE_STEP);
  }, [projectFilter, sessionFilter, focusedTaskId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const sessionId = sessionDraft === "none" ? undefined : Number(sessionDraft);
    create.mutate({ title: trimmed, sessionId });
    setTitle("");
  }

  const tasks = queue.data?.items ?? [];
  const projectOptions = projects.data ?? [];
  const totalTasks = queue.data?.total ?? 0;
  const openTasks = queue.data?.statusCounts.open ?? 0;
  const inProgressTasks = queue.data?.statusCounts.inProgress ?? 0;
  const doneTasks = queue.data?.statusCounts.done ?? 0;
  const focusedTaskPinned = queue.data?.focusedTaskPinned ?? false;
  const hasMoreTasks = queue.data?.page.hasMore ?? false;

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
            Ledger Work Queue
            <span className="ml-2" style={{ color: C.textSecondary }}>
              {totalTasks}
            </span>
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>
            Tasks are Ledger objects. Status changes stay visible.
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <TaskStat label="Open" value={String(openTasks)} tone={openTasks > 0 ? C.warning : C.textMuted} />
        <TaskStat label="Active" value={String(inProgressTasks)} tone={inProgressTasks > 0 ? C.accent : C.textMuted} />
        <TaskStat label="Done" value={String(doneTasks)} tone={doneTasks > 0 ? C.success : C.textMuted} />
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-1.5 px-2.5 py-1.5 shrink-0 sm:grid-cols-[minmax(0,1fr)_160px_64px]" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task. Enter to add."
          className="flex-1"
        />
        <Select value={sessionDraft} onValueChange={setSessionDraft}>
          <SelectTrigger
            size="sm"
            className="w-full"
            aria-label="Link new task to session"
          >
            <SelectValue placeholder="Run link" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No run link</SelectItem>
            {sessionOptions.map((session) => (
              <SelectItem key={session.id} value={String(session.id)}>
                {session.optionLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || create.isPending}
          title={!title.trim() ? "Enter a task title before adding a local task receipt." : "Add a local task receipt to the Ledger work queue."}
          aria-label="Add local task receipt"
        >
          Add
        </Button>
      </form>

      <div
        className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 shrink-0"
        aria-label="Task project filters"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, scrollbarColor: `${C.border} ${C.backgroundSoft}` }}
      >
        <FilterButton
          label="All"
          active={projectFilter === "all"}
          count={projectOptions.reduce((sum, project) => sum + project.taskCount, 0)}
          onClick={() => setProjectFilter("all")}
        />
        {projectOptions.map((project) => (
          <FilterButton
            key={project.id}
            label={project.name}
            active={projectFilter === project.id}
            count={project.openCount + project.inProgressCount}
            title={project.path ?? undefined}
            onClick={() => setProjectFilter(project.id)}
          />
        ))}
      </div>
      <div
        className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 shrink-0"
        aria-label="Task run filters"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, scrollbarColor: `${C.border} ${C.backgroundSoft}` }}
      >
        <FilterButton
          label="All Runs"
          active={sessionFilter === "all"}
          count={totalTasks}
          onClick={() => setSessionFilter("all")}
        />
        {sessionFilterGroups.map((session) => (
          <FilterButton
            key={session.key}
            label={session.label}
            active={sessionFilter === session.key}
            count={sessionFilter === session.key ? totalTasks : undefined}
            title={session.title}
            onClick={() => setSessionFilter(session.key)}
          />
        ))}
      </div>

      {focusNotice && (
        <div className="mx-2 mt-2 flex items-center justify-between gap-2 rounded px-2 py-1 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.gold}66`, color: C.textSecondary }}>
          <span className="min-w-0">{focusNotice}</span>
          <div className="flex shrink-0 items-center gap-1">
            {focusedTaskId != null && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setFocusedTaskId(null)} aria-label="Clear focused task">
                Clear
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" onClick={() => setFocusNotice(null)} aria-label="Dismiss task focus notice">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {queue.isLoading ? (
          <div className="px-3 py-2 text-[11px]" style={{ color: C.textMuted }}>Loading.</div>
        ) : totalTasks === 0 ? (
          <div className="mx-2 my-2 rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            No tasks yet. Add one above.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 px-2.5 py-1 text-[10px] uppercase tracking-widest" style={{ borderBottom: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
              <span>
                Showing {tasks.length} of {totalTasks}
              </span>
              {focusedTaskPinned && <span style={{ color: C.gold }}>Focused task pinned</span>}
            </div>
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5"
                style={{
                  background: focusedTaskId === t.id ? `${C.gold}14` : "transparent",
                  borderBottom: `1px solid ${C.borderSoft}`,
                  boxShadow: focusedTaskId === t.id ? `inset 2px 0 0 ${C.gold}` : "none",
                }}
              >
                <Button
                  type="button"
                  onClick={() => setStatus.mutate({ id: t.id, status: NEXT_STATUS[t.status] })}
                  className="min-w-24 shrink-0"
                  variant={statusVariant(t.status)}
                  size="sm"
                  title={`Advance local task status from ${STATUS_LABEL[t.status] ?? t.status} to ${STATUS_LABEL[NEXT_STATUS[t.status]] ?? NEXT_STATUS[t.status]}.`}
                  aria-label={`Advance task ${t.title} status`}
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </Button>
                <div
                  className="flex-1 text-[11px]"
                  style={{
                    color: t.status === "done" || t.status === "cancelled" ? C.textMuted : C.textPrimary,
                    textDecoration: t.status === "done" ? "line-through" : "none",
                  }}
                >
                  <div className="line-clamp-2">{t.title}</div>
                  {(t.projectId != null || t.sessionId != null) && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {t.projectId != null && (
                        <span
                          className="text-[10px] uppercase tracking-wider truncate"
                          style={{ color: C.textMuted }}
                          title={t.projectPath ?? undefined}
                        >
                          {t.projectName ?? `Project #${t.projectId}`}
                        </span>
                      )}
                      {t.sessionId != null && (
                        <Badge variant="outline" className="text-[10px] uppercase" title={t.sessionDisplayName ?? undefined}>
                          {t.sessionDisplayName ?? `Run #${t.sessionId}`}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => setDeleteGate({ id: t.id, title: t.title })}
                  variant="destructive"
                  size="sm"
                  aria-label={`Delete task ${t.title}`}
                  title="Open the hard-gate confirmation before deleting this local task receipt."
                >
                  Delete
                </Button>
              </div>
            ))}
            {hasMoreTasks && (
              <Button
                type="button"
                onClick={() => setVisibleLimit((current) => current + TASK_PAGE_STEP)}
                variant="outline"
                className="m-2 w-[calc(100%-1rem)]"
                size="sm"
                aria-label="Show more local tasks"
              >
                Show 80 More
              </Button>
            )}
          </>
        )}
      </div>

      <Dialog open={deleteGate != null} onOpenChange={(open) => !open && setDeleteGate(null)}>
        <DialogContent gate showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              This removes a local task row from the Ledger work queue. Cancel keeps the record visible.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded p-2 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            <div className="mb-1 text-[10px] uppercase tracking-widest" style={{ color: C.warning }}>
              Target
            </div>
            <div style={{ color: C.textPrimary }}>{deleteGate?.title ?? "Unknown task"}</div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setDeleteGate(null)}
              title="Keep the task receipt visible."
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
                  { id: deleteGate.id },
                  { onSuccess: () => setDeleteGate(null) },
                );
              }}
              title="Permanently delete this local task receipt after confirmation."
              aria-label="Confirm delete task receipt"
              variant="destructive"
            >
              {del.isPending ? "Deleting" : "Delete Task"}
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
  count?: number;
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
      {count !== undefined && (
        <Badge variant={active ? "default" : "secondary"} className="ml-1">
          {count}
        </Badge>
      )}
    </Button>
  );
}

function TaskStat({ label, value, tone }: { label: string; value: string; tone: string }) {
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

function statusVariant(status: string): "default" | "secondary" | "risk" {
  if (status === "open") return "risk";
  if (status === "in_progress") return "default";
  return "secondary";
}
