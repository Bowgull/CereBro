import { trpc } from "@/lib/trpc";
import { compactPathLabel } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HandoffArchivePanel({ onClose }: { onClose: () => void }) {
  const plan = trpc.handoffs.archivePlan.useQuery(undefined, { refetchInterval: 30000 });
  const data = plan.data;
  const candidates = data?.candidates ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Handoff Archive
            <span className="ml-2" style={{ color: C.textSecondary }}>{candidates.length}</span>
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>
            Proposal-only Obsidian session history plan.
          </div>
        </div>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="shrink-0"
          style={{ color: C.textMuted }}
        >
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <StatusBlock label="Mode" value={data?.mode ?? "proposal_only"} tone={C.textSecondary} />
        <StatusBlock label="Obsidian" value={data?.obsidian.exists ? "Ready" : "Missing"} tone={data?.obsidian.exists ? C.success : C.warning} />
        <StatusBlock label="Folder" value={data?.archive.subdir ?? "90_Archive/CereBro Session History"} tone={C.accent} />
        <StatusBlock label="Candidates" value={String(candidates.length)} tone={C.textSecondary} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-3 p-4">
          <section className="space-y-3 min-w-0">
            <SectionTitle title="Read-Only Candidates" detail={plan.isLoading ? "scanning" : `${candidates.length} found`} />
            {plan.isLoading ? (
              <div className="text-xs" style={{ color: C.textMuted }}>Scanning repo Markdown files.</div>
            ) : candidates.length === 0 ? (
              <div className="rounded p-3 text-xs leading-relaxed" style={{ color: C.textMuted, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                No session-handoff candidates found.
              </div>
            ) : (
              candidates.map((candidate) => (
                <article key={candidate.relativePath} className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: C.textPrimary }} title={candidate.title}>
                        {candidate.title}
                      </div>
                      <div className="text-[11px] mt-1 truncate" style={{ color: C.textMuted }} title={candidate.relativePath}>
                        {compactPathLabel(candidate.relativePath)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0" style={{ color: C.textMuted }}>
                      {formatSize(candidate.byteSize)}
                    </Badge>
                  </div>
                  <div className="text-xs leading-relaxed mt-2" style={{ color: C.textSecondary }}>
                    {candidate.excerpt || "No excerpt available."}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    <MetaBlock label="Modified" value={formatDate(candidate.modifiedAt)} />
                    <MetaBlock label="Proposed Path" value={candidate.recommendedObsidianPath} />
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="space-y-3 min-w-0">
            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Archive Shape" detail="needs approval" />
              <div className="space-y-2 mt-2">
                <MetaBlock label="Snapshot Folder" value={data?.archive.subdir ?? "90_Archive/CereBro Session History"} />
                <MetaBlock label="Index Note" value={data?.archive.indexTitle ?? "CereBro Session Index"} />
                <MetaBlock label="Index Path" value={data?.archive.indexPath ?? "90_Archive/CereBro Session History/CereBro Session History.md"} />
              </div>
              <div className="text-[11px] leading-relaxed mt-3" style={{ color: C.warning }}>
                {data?.archive.writePolicy ?? "No Obsidian writes run from this proposal."}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Recommendations" detail="C-3PO" />
              <div className="space-y-2 mt-2">
                {(data?.recommendations ?? []).map((item) => (
                  <div key={item} className="text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
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
        {value.replace(/_/g, " ")}
      </div>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
        {title}
      </div>
      <div className="text-[10px] uppercase tracking-wider truncate" style={{ color: C.textMuted }}>
        {detail}
      </div>
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
