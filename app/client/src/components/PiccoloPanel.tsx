import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

function severityColor(severity: string): string {
  if (severity === "action_required") return C.danger;
  if (severity === "warning") return C.warning;
  return C.accent;
}

export default function PiccoloPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const report = trpc.piccolo.hygieneReport.useQuery(undefined, { refetchInterval: 10000 });
  const saveReport = trpc.artifacts.writeTextToVault.useMutation({
    onSuccess: () => utils.artifacts.list.invalidate(),
  });
  const data = report.data;
  const findings = data?.findings ?? [];

  function handleSaveReport() {
    if (!data) return;

    const scanned = new Date(data.scannedAt * 1000).toISOString();
    const body = [
      `# Piccolo Hygiene Report - ${scanned}`,
      "",
      `- Mode: ${data.mode}`,
      `- Vault: ${data.vault.exists ? "ready" : "needs setup"}`,
      `- Obsidian: ${data.obsidian.exists ? "ready" : "needs setup"}`,
      `- Artifacts: ${data.artifactCounts.artifacts}`,
      `- Cleanup candidates: ${data.artifactCounts.cleanupCandidates}`,
      `- Repeated artifact storage paths: ${data.artifactCounts.duplicateStoragePaths}`,
      "",
      "## Findings",
      "",
      findings.length === 0
        ? "No hygiene findings. Piccolo remains read-only; no cleanup actions were run."
        : findings
            .map((finding, index) =>
              [
                `### ${index + 1}. ${finding.title}`,
                "",
                `- Severity: ${finding.severity}`,
                `- Area: ${finding.area}`,
                `- Detail: ${finding.detail}`,
                `- Proposed action: ${finding.proposedAction}`,
              ].join("\n"),
            )
            .join("\n\n"),
      "",
      "## Missing Canonical Vault Folders",
      "",
      data.missingVaultFolders.length === 0
        ? "None."
        : data.missingVaultFolders.map((folder) => `- ${folder}`).join("\n"),
      "",
      "No files were moved, archived, or deleted by this report.",
    ].join("\n");

    saveReport.mutate({
      kind: "cleanup_report",
      title: `Piccolo Hygiene ${scanned.slice(0, 10)}`,
      body,
      ownerAgent: "piccolo",
      approved: true,
    });
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.background }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Piccolo Hygiene
            <span className="ml-2" style={{ color: C.textSecondary }}>{findings.length}</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            Read-only storage and workspace scan. No cleanup actions run here.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveReport}
            disabled={!data || saveReport.isPending}
            className="text-xs uppercase tracking-wider"
            style={{ color: data && !saveReport.isPending ? C.textSecondary : C.textMuted }}
          >
            {saveReport.isPending ? "Saving" : "Save Report"}
          </button>
          <button onClick={onClose} className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <StatusBlock label="Vault" value={data?.vault.exists ? "Ready" : "Needs setup"} tone={data?.vault.exists ? C.success : C.warning} />
        <StatusBlock label="Obsidian" value={data?.obsidian.exists ? "Ready" : "Needs setup"} tone={data?.obsidian.exists ? C.success : C.warning} />
        <StatusBlock label="Artifacts" value={String(data?.artifactCounts.artifacts ?? 0)} tone={C.accent} />
        <StatusBlock label="Mode" value={data?.mode ?? "read_only"} tone={C.textSecondary} />
      </div>

      {data?.vault.vaultDir && (
        <div className="px-4 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Vault Path</div>
          <div className="text-xs break-all" style={{ color: C.textSecondary }}>{data.vault.vaultDir}</div>
          {saveReport.data && (
            <div className="text-[10px] mt-1 break-all" style={{ color: saveReport.data.ok ? C.success : C.warning }}>
              {saveReport.data.ok
                ? `Saved cleanup report: ${saveReport.data.relativePath}`
                : saveReport.data.reason ?? "Cleanup report save failed."}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {report.isLoading ? (
          <div className="px-4 py-3 text-xs" style={{ color: C.textMuted }}>Scanning.</div>
        ) : findings.length === 0 ? (
          <div className="px-4 py-3 text-xs leading-relaxed" style={{ color: C.textMuted }}>
            No hygiene findings. Piccolo is only reporting; archive and delete actions remain approval-gated.
          </div>
        ) : (
          findings.map((finding) => {
            const color = severityColor(finding.severity);
            return (
              <div key={finding.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color, background: `${color}22`, border: `1px solid ${color}55` }}
                  >
                    {finding.severity.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                    {finding.area}
                  </span>
                </div>
                <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {finding.title}
                </div>
                <div className="text-xs leading-relaxed mt-1" style={{ color: C.textSecondary }}>
                  {finding.detail}
                </div>
                <div className="text-xs leading-relaxed mt-1" style={{ color: C.textMuted }}>
                  {finding.proposedAction}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="text-xs font-semibold truncate" style={{ color: tone }} title={value}>
        {value}
      </div>
    </div>
  );
}
