import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { compactPathLabel } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
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

export default function PiccoloPanel({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [saveGateOpen, setSaveGateOpen] = useState(false);
  const report = trpc.piccolo.hygieneReport.useQuery(undefined, { refetchInterval: 10000 });
  const contract = trpc.piccolo.storageContractReceipt.useQuery(undefined, { refetchInterval: 30000 });
  const saveReport = trpc.artifacts.writeTextToVault.useMutation({
    onSuccess: () => {
      setSaveGateOpen(false);
      utils.artifacts.list.invalidate();
    },
  });
  const data = report.data;
  const findings = data?.findings ?? [];
  const contractData = contract.data;

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
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              Automation Hygiene
            </div>
            <Badge variant="secondary" className="uppercase">{findings.length} findings</Badge>
            <Badge variant="secondary" className="uppercase">Mode {data?.mode ?? "read_only"}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="risk"
            size="sm"
            onClick={() => setSaveGateOpen(true)}
            disabled={!data || saveReport.isPending}
            title={!data ? "Read the hygiene report before saving." : "Open the hard gate before writing a durable vault report."}
            aria-label="Open Piccolo report save gate"
          >
            {saveReport.isPending ? "Saving" : "Save Report"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 px-2 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <StatusBlock label="Vault" value={data?.vault.exists ? "Ready" : "Needs setup"} tone={data?.vault.exists ? C.success : C.warning} />
        <StatusBlock label="Obsidian" value={data?.obsidian.exists ? "Ready" : "Needs setup"} tone={data?.obsidian.exists ? C.success : C.warning} />
        <StatusBlock label="Artifacts" value={String(data?.artifactCounts.artifacts ?? 0)} tone={C.accent} />
        <StatusBlock label="Mode" value={data?.mode ?? "read_only"} tone={C.textSecondary} />
      </div>

      <div className="grid gap-1.5 px-2 py-1.5 shrink-0 md:grid-cols-3" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <RuleCard title="Read Only" body="Scans can report drift. They do not move, archive, delete, install, or schedule." tone={C.success} />
        <RuleCard title="Durable Write" body="Saving a report writes a vault artifact and must pass the hard gate first." tone={C.warning} />
        <RuleCard title="Cleanup" body="Cleanup proposals remain proposals until an action receipt is approved." tone={C.danger} />
      </div>

      <div className="grid gap-1.5 px-2 py-1.5 shrink-0 xl:grid-cols-[0.9fr_1.2fr_1.1fr]" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.gold }}>
              Storage Contract
            </div>
            <Badge variant="secondary" className="uppercase">
              {contractData?.mode ?? "read_only"}
            </Badge>
          </div>
          <div className="mt-1 grid grid-cols-3 gap-1">
            <MiniMetric label="Kinds" value={String(contractData?.counts.artifactKinds ?? 0)} />
            <MiniMetric label="States" value={String(contractData?.counts.lifecycleStates ?? 0)} />
            <MiniMetric label="Rules" value={String(contractData?.counts.retentionRules ?? 0)} />
          </div>
          <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
            Piccolo reports. Oak validates knowledge shape. Spock gates writes.
          </div>
        </div>

        <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.accent }}>
            Obsidian Lanes
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {(contractData?.obsidianContract.routes ?? []).map((route) => (
              <div key={route.key} className="min-w-0 rounded px-1.5 py-1" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="truncate text-[10px] uppercase tracking-wider" style={{ color: route.retrievalDefault === "archive_only" ? C.warning : C.textSecondary }} title={route.relativePath}>
                  {route.relativePath}
                </div>
                <div className="truncate text-[10px]" style={{ color: C.textMuted }}>
                  {route.retrievalDefault.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.success }}>
            Project Bridge
          </div>
          <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
            Active projects enter memory through a bridge note, not a raw code dump.
          </div>
          <div
            className="mt-1 truncate rounded px-1.5 py-1 text-[10px]"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
            title={contractData?.githubProjectPaths.bridgeExample}
          >
            {contractData?.githubProjectPaths.bridgeExample ?? "10_Projects/<Project>/<Project>.md"}
          </div>
          <div
            className="mt-1 truncate rounded px-1.5 py-1 text-[10px]"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}
            title={contractData?.githubProjectPaths.sourceExample}
          >
            {contractData?.githubProjectPaths.sourceExample ?? "20_Knowledge/Sources/GitHub/<Project> Repository Source.md"}
          </div>
        </div>
      </div>

      {data?.vault.vaultDir && (
        <div className="px-2 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Vault Path</div>
          <div className="text-xs truncate" style={{ color: C.textSecondary }} title={data.vault.vaultDir}>
            {compactPathLabel(data.vault.vaultDir)}
          </div>
          {saveReport.data && (
            <div
              className="text-[10px] mt-1 truncate"
              style={{ color: saveReport.data.ok ? C.success : C.warning }}
              title={saveReport.data.ok ? saveReport.data.relativePath : saveReport.data.reason ?? undefined}
            >
              {saveReport.data.ok && saveReport.data.relativePath
                ? `Saved cleanup report: ${compactPathLabel(saveReport.data.relativePath)}`
                : saveReport.data.reason ?? "Cleanup report save failed."}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {report.isLoading ? (
          <div className="px-2 py-1.5 text-[11px]" style={{ color: C.textMuted }}>Scanning.</div>
        ) : findings.length === 0 ? (
          <div className="px-2 py-1.5 text-[11px] leading-snug" style={{ color: C.textMuted }}>
            No hygiene findings. Piccolo is only reporting; archive and delete actions remain approval-gated.
          </div>
        ) : (
          findings.map((finding) => {
            return (
              <div key={finding.id} className="px-2 py-1.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={badgeVariant(finding.severity)} className="uppercase">
                    {finding.severity.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                    {finding.area}
                  </span>
                </div>
                <div className="text-[11px] font-semibold" style={{ color: C.textPrimary }}>
                  {finding.title}
                </div>
                <div className="text-[11px] leading-snug mt-1" style={{ color: C.textSecondary }}>
                  {finding.detail}
                </div>
                <div className="text-[11px] leading-snug mt-1" style={{ color: C.textMuted }}>
                  {finding.proposedAction}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={saveGateOpen} onOpenChange={setSaveGateOpen}>
        <DialogContent gate>
          <DialogHeader>
            <DialogTitle>Save Piccolo Report</DialogTitle>
            <DialogDescription>
              This writes a durable cleanup report to the vault. It does not move, archive, or delete files.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded p-3 text-xs leading-relaxed" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            Target: `cleanup_report` artifact owned by Piccolo. Findings: {findings.length}. Mode: {data?.mode ?? "read_only"}.
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setSaveGateOpen(false)} title="Cancel the durable report write.">
              Cancel
            </Button>
            <Button
              type="button"
              variant="risk"
              onClick={handleSaveReport}
              disabled={!data || saveReport.isPending}
              title="Write the cleanup report to the vault. This does not move, archive, or delete files."
              aria-label="Confirm Piccolo cleanup report vault write"
            >
              {saveReport.isPending ? "Saving" : "Save Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="text-[11px] font-semibold truncate" style={{ color: tone }} title={value}>
        {value}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded px-1.5 py-1" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="truncate text-[11px] font-semibold" style={{ color: C.textPrimary }}>
        {value}
      </div>
    </div>
  );
}

function RuleCard({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className="rounded p-1.5" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tone }}>{title}</div>
      <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textSecondary }}>{body}</div>
    </div>
  );
}

function badgeVariant(severity: string): "default" | "destructive" | "warning" {
  if (severity === "action_required") return "destructive";
  if (severity === "warning") return "warning";
  return "default";
}
