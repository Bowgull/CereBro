import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  open: C.warning,
  in_progress: C.accent,
  done: C.success,
  cancelled: C.textMuted,
};

const NEXT_STATUS: Record<string, "open" | "in_progress" | "done" | "cancelled"> = {
  open: "in_progress",
  in_progress: "done",
  done: "open",
  cancelled: "open",
};

export default function TasksPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const list = trpc.tasks.list.useQuery(projectFilter === "all" ? undefined : { projectId: projectFilter });
  const projects = trpc.tasks.projects.useQuery(undefined, { refetchInterval: 10000 });
  const create = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const setStatus = trpc.tasks.setStatus.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const del = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const [title, setTitle] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    create.mutate({ title: trimmed });
    setTitle("");
  }

  const tasks = list.data ?? [];
  const projectOptions = projects.data ?? [];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 max-h-[55%] flex flex-col"
      style={{ background: `${C.background}f5`, borderTop: `1px solid ${C.borderSoft}` }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
          Tasks
          <span className="ml-2" style={{ color: C.textSecondary }}>
            {tasks.length}
          </span>
        </div>
        <button onClick={onClose} className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>
          Close
        </button>
      </div>

      <form onSubmit={submit} className="flex gap-2 px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task. Enter to add."
          className="flex-1 px-2 py-1.5 text-xs rounded outline-none"
          style={{
            background: C.surfaceMuted,
            color: C.textPrimary,
            border: `1px solid ${C.borderSoft}`,
          }}
        />
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
          style={{
            background: title.trim() ? C.accentSoft : C.surfaceMuted,
            color: title.trim() ? C.textPrimary : C.textMuted,
            border: `1px solid ${C.borderSoft}`,
          }}
        >
          Add
        </button>
      </form>

      <div className="flex items-center gap-1 px-3 py-2 shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
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

      <div className="flex-1 overflow-y-auto">
        {list.isLoading ? (
          <div className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>Loading.</div>
        ) : tasks.length === 0 ? (
          <div className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>
            No tasks yet. Add one above.
          </div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-3 py-2"
              style={{ borderBottom: `1px solid ${C.borderSoft}` }}
            >
              <button
                onClick={() => setStatus.mutate({ id: t.id, status: NEXT_STATUS[t.status] })}
                className="text-xs px-2 py-0.5 rounded uppercase tracking-wider shrink-0"
                style={{
                  color: STATUS_COLOR[t.status] ?? C.textMuted,
                  background: `${STATUS_COLOR[t.status] ?? C.textMuted}22`,
                  border: `1px solid ${STATUS_COLOR[t.status] ?? C.textMuted}55`,
                  minWidth: 96,
                }}
                title="Click to advance status"
              >
                {STATUS_LABEL[t.status] ?? t.status}
              </button>
              <div
                className="flex-1 text-xs"
                style={{
                  color: t.status === "done" || t.status === "cancelled" ? C.textMuted : C.textPrimary,
                  textDecoration: t.status === "done" ? "line-through" : "none",
                }}
              >
                <div>{t.title}</div>
                {t.projectId != null && (
                  <div
                    className="text-[10px] uppercase tracking-wider mt-0.5 truncate"
                    style={{ color: C.textMuted }}
                    title={t.projectPath ?? undefined}
                  >
                    {t.projectName ?? `Project #${t.projectId}`}
                  </div>
                )}
              </div>
              <button
                onClick={() => del.mutate({ id: t.id })}
                className="text-xs uppercase tracking-wider"
                style={{ color: C.textMuted }}
                title="Delete"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
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
    <button
      onClick={onClick}
      className="px-2 py-1 text-[10px] uppercase tracking-wider rounded shrink-0"
      style={{
        color: active ? C.textPrimary : C.textMuted,
        background: active ? C.surfaceRaised : "transparent",
        border: `1px solid ${active ? C.accentSoft : C.borderSoft}`,
      }}
      title={title}
    >
      {label}
      <span className="ml-1" style={{ color: active ? C.accent : C.textMuted }}>
        {count}
      </span>
    </button>
  );
}
