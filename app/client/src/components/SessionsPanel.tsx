import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

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
  const list = trpc.sessions.list.useQuery(undefined, { refetchInterval: 5000 });
  const sessions = list.data ?? [];
  const active = sessions.filter((s) => s.endedAt == null).length;

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
          Sessions ledger
          <span className="ml-2" style={{ color: C.textSecondary }}>
            {sessions.length}
          </span>
          {active > 0 && (
            <span className="ml-2" style={{ color: C.success }}>
              {active} active
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {list.isLoading ? (
          <div className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>Loading.</div>
        ) : sessions.length === 0 ? (
          <div className="px-3 py-3 text-xs" style={{ color: C.textMuted }}>
            No sessions recorded. Start a Claude Code session in any project; it will appear here.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead style={{ color: C.textMuted }}>
              <tr style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <th className="text-left px-3 py-1.5 font-semibold uppercase tracking-wider">Project</th>
                <th className="text-left px-3 py-1.5 font-semibold uppercase tracking-wider">Class</th>
                <th className="text-left px-3 py-1.5 font-semibold uppercase tracking-wider">State</th>
                <th className="text-left px-3 py-1.5 font-semibold uppercase tracking-wider">Started</th>
                <th className="text-left px-3 py-1.5 font-semibold uppercase tracking-wider">Duration</th>
                <th className="text-left px-3 py-1.5 font-semibold uppercase tracking-wider">Session</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const isActive = s.endedAt == null;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                    <td className="px-3 py-1.5" style={{ color: C.textPrimary }}>
                      {s.projectName ?? "—"}
                      {s.projectPath && (
                        <div className="text-xs truncate max-w-[260px]" style={{ color: C.textMuted }}>
                          {s.projectPath}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-1.5" style={{ color: C.textSecondary }}>
                      {s.heroClass ?? "—"}
                    </td>
                    <td className="px-3 py-1.5">
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
                    <td className="px-3 py-1.5" style={{ color: C.textSecondary }}>
                      {formatRelative(s.startedAt)}
                    </td>
                    <td className="px-3 py-1.5" style={{ color: C.textSecondary }}>
                      {formatDuration(s.startedAt, s.endedAt)}
                    </td>
                    <td
                      className="px-3 py-1.5 font-mono"
                      style={{ color: C.textMuted }}
                      title={s.claudeSessionId}
                    >
                      {s.claudeSessionId.slice(0, 8)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
