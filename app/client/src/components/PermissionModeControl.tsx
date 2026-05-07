import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

const LABELS: Record<string, string> = {
  default_permissions: "Default permissions",
  auto_review: "Auto-review",
  full_access: "Full access",
};

export default function PermissionModeControl() {
  const utils = trpc.useUtils();
  const current = trpc.permissions.current.useQuery(undefined, { refetchInterval: 15000 });
  const setMode = trpc.permissions.setMode.useMutation({
    onSuccess: () => {
      utils.permissions.current.invalidate();
      utils.permissions.policy.invalidate();
      utils.permissions.history.invalidate();
    },
  });

  const mode = current.data?.mode ?? "default_permissions";
  const isPending = setMode.isPending;

  return (
    <div
      className="flex items-center gap-1.5 rounded px-2 py-1 shrink-0"
      role="group"
      aria-label="Global permission mode"
      style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      title={current.data?.summary ?? "Global permission mode"}
    >
      <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>
        Mode
      </span>
      <select
        value={mode}
        disabled={isPending}
        onChange={(event) => {
          setMode.mutate({
            mode: event.target.value as "default_permissions" | "auto_review" | "full_access",
            reason: "Changed from the Keep header mode selector.",
            requestedByAgent: "cortana",
          });
        }}
        aria-label="Set global permission mode"
        className="max-w-[150px] bg-transparent text-xs font-semibold outline-none"
        style={{ color: isPending ? C.textMuted : C.textPrimary }}
      >
        {Object.entries(LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <span className="sr-only" role="status" aria-live="polite">
        {isPending ? "Recording local permission mode." : `Current permission mode: ${LABELS[mode] ?? mode}. Hard gates still require approval.`}
      </span>
    </div>
  );
}
