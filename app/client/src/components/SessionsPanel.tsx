import { Fragment, useState } from "react";
import { trpc } from "@/lib/trpc";
import { compactPathLabel } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function formatRelative(unixSec: number): string {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDuration(startSec: number, endSec: number | null): string {
  const end = endSec ?? Date.now() / 1000;
  const s = Math.max(0, end - startSec);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${(s / 3600).toFixed(1)}h`;
}

export default function SessionsPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const list = trpc.sessions.list.useQuery(undefined, { refetchInterval: 5000 });
  const updateLedger = trpc.sessions.updateLedger.useMutation({
    onSuccess: () => {
      utils.sessions.list.invalidate();
      utils.tasks.list.invalidate();
    },
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const sessions = list.data ?? [];
  const active = sessions.filter((s) => s.endedAt == null).length;
  const ended = sessions.length - active;
  const projects = new Set(sessions.map((session) => session.projectName).filter(Boolean)).size;

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
            Ledger Run History
            <span className="ml-2" style={{ color: C.textSecondary }}>
              {sessions.length}
            </span>
            {active > 0 && (
              <span className="ml-2" style={{ color: C.success }}>
                {active} active
              </span>
            )}
          </div>
          <div className="text-[10px] mt-1" style={{ color: C.textMuted }}>
            Session rows prove when work started, ended, and which project owned it.
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <RunStat label="Active" value={String(active)} tone={active > 0 ? C.success : C.textMuted} />
        <RunStat label="Ended" value={String(ended)} tone={C.textSecondary} />
        <RunStat label="Projects" value={String(projects)} tone={C.gold} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {list.isLoading ? (
          <div className="px-3 py-2 text-xs" style={{ color: C.textMuted }}>Loading.</div>
        ) : sessions.length === 0 ? (
          <div className="px-3 py-2 text-xs" style={{ color: C.textMuted }}>
            No sessions recorded. Start a Claude Code session in any project; it will appear here.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead style={{ color: C.textMuted }}>
              <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <th className="text-left px-2.5 py-1.5 font-semibold uppercase tracking-wider">Project</th>
                <th className="text-left px-2.5 py-1.5 font-semibold uppercase tracking-wider">Class</th>
                <th className="text-left px-2.5 py-1.5 font-semibold uppercase tracking-wider">State</th>
                <th className="text-left px-2.5 py-1.5 font-semibold uppercase tracking-wider">Started</th>
                <th className="text-left px-2.5 py-1.5 font-semibold uppercase tracking-wider">Duration</th>
                <th className="text-left px-2.5 py-1.5 font-semibold uppercase tracking-wider">Session</th>
                <th className="text-right px-2.5 py-1.5 font-semibold uppercase tracking-wider">Ledger</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const isActive = s.endedAt == null;
                return (
                  <Fragment key={s.id}>
                    <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                      <td className="px-2.5 py-1.5" style={{ color: C.textPrimary }}>
                        <div className="font-semibold" title={s.displayName}>
                          {s.displayName}
                        </div>
                        {s.notes && (
                          <div className="text-[10px] mt-0.5 truncate max-w-[300px]" style={{ color: C.textSecondary }}>
                            {s.notes}
                          </div>
                        )}
                        {s.projectName ?? "—"}
                        {s.projectPath && (
                          <div className="text-xs truncate max-w-[260px]" style={{ color: C.textMuted }} title={s.projectPath}>
                            {compactPathLabel(s.projectPath)}
                          </div>
                        )}
                      </td>
                      <td className="px-2.5 py-1.5" style={{ color: C.textSecondary }}>
                        {s.heroClass ?? "—"}
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            color: isActive ? C.success : C.textMuted,
                            background: isActive ? `${C.success}22` : C.surfaceMuted,
                            border: `1px solid ${isActive ? C.success + "55" : C.borderSoft}`,
                          }}
                        >
                          {isActive ? "Active" : "Ended"}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5" style={{ color: C.textSecondary }}>
                        {formatRelative(s.startedAt)}
                      </td>
                      <td className="px-2.5 py-1.5" style={{ color: C.textSecondary }}>
                        {formatDuration(s.startedAt, s.endedAt)}
                      </td>
                      <td
                        className="px-2.5 py-1.5 font-mono"
                        style={{ color: C.textMuted }}
                        title={s.claudeSessionId}
                      >
                        {s.claudeSessionId.slice(0, 8)}
                      </td>
                      <td className="px-2.5 py-1.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(s.id);
                            setTitleDraft(s.title ?? "");
                            setNotesDraft(s.notes ?? "");
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                    {editingId === s.id && (
                      <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                        <td colSpan={7} className="px-2.5 py-2" style={{ background: C.surfaceMuted }}>
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] gap-1.5 items-start">
                            <Input
                              value={titleDraft}
                              onChange={(event) => setTitleDraft(event.target.value)}
                              placeholder="Run title"
                              aria-label="Run title"
                            />
                            <Textarea
                              value={notesDraft}
                              onChange={(event) => setNotesDraft(event.target.value)}
                              placeholder="Run notes"
                              aria-label="Run notes"
                              className="min-h-16"
                            />
                            <div className="flex gap-1.5 justify-end">
                              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={updateLedger.isPending}
                                onClick={() => {
                                  updateLedger.mutate(
                                    { id: s.id, title: titleDraft, notes: notesDraft },
                                    { onSuccess: () => setEditingId(null) },
                                  );
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RunStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded px-2 py-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}
