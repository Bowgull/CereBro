import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

const TRUST_TONES: Record<string, string> = {
  official: C.success,
  primary: C.success,
  high: C.accent,
  medium: C.warning,
  low: C.danger,
  unknown: C.textMuted,
};

export default function SurferSourcesPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [eventOwner, setEventOwner] = useState<"all" | "surfer" | "hedwig">("all");
  const [sensitiveEventsOnly, setSensitiveEventsOnly] = useState(false);
  const utils = trpc.useUtils();
  const panel = trpc.surfer.panel.useQuery(
    {
      eventOwner: eventOwner === "all" ? undefined : eventOwner,
      sensitiveOnly: sensitiveEventsOnly || undefined,
      limit: 25,
    },
    { refetchInterval: 15000 },
  );
  const preview = trpc.surfer.previewResearch.useMutation();
  const ingestUrl = trpc.surfer.ingestPublicUrl.useMutation({
    onSuccess: () => utils.surfer.panel.invalidate(),
  });
  const data = panel.data;
  const savedSources = data?.savedSources ?? [];
  const sourceEvents = data?.recentSourceEvents ?? [];
  const cards = preview.data?.cards ?? [];

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || preview.isPending) return;
    preview.mutate({ query: trimmed });
  }

  function submitUrl(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || ingestUrl.isPending) return;
    ingestUrl.mutate({ url: trimmed, approved: true });
  }

  return (
    <div className="h-full flex flex-col" style={{ background: C.background }}>
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Surfer Sources
            <span className="ml-2" style={{ color: C.textSecondary }}>{savedSources.length}</span>
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: C.textMuted }}>
            Source cards, browser ladder, and approval-gated research previews.
          </div>
        </div>
        <button onClick={onClose} className="text-xs uppercase tracking-wider shrink-0" style={{ color: C.textMuted }}>
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <StatusBlock label="Mode" value={data?.mode ?? "proposal_only"} tone={C.textSecondary} />
        <StatusBlock label="Browser" value={data?.browserEnabled ? "Enabled" : "Locked"} tone={data?.browserEnabled ? C.success : C.warning} />
        <StatusBlock label="Owner" value={data?.ownerAgent ?? "surfer"} tone={C.accent} />
        <StatusBlock label="Trusted" value={`${savedSources.filter((source) => ["official", "primary", "high"].includes(source.trustLevel)).length}/${savedSources.length}`} tone={C.textSecondary} />
      </div>

      <form onSubmit={submit} className="px-4 py-3 shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask Surfer what to find, compare, source, or preview."
            className="px-2 py-1.5 text-xs rounded outline-none"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
          />
          <button
            type="submit"
            disabled={!query.trim() || preview.isPending}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
            style={{
              background: query.trim() && !preview.isPending ? C.accentSoft : C.surfaceMuted,
              color: query.trim() && !preview.isPending ? C.textPrimary : C.textMuted,
              border: `1px solid ${C.borderSoft}`,
            }}
          >
            {preview.isPending ? "Reading" : "Preview"}
          </button>
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
          This panel does not browse yet. It previews the research plan and approval gates before Surfer touches the web.
        </div>
      </form>

      <form onSubmit={submitUrl} className="px-4 py-3 shrink-0 space-y-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Approved public URL to ingest as a source."
            className="px-2 py-1.5 text-xs rounded outline-none"
            style={{ background: C.surfaceMuted, color: C.textPrimary, border: `1px solid ${C.borderSoft}` }}
          />
          <button
            type="submit"
            disabled={!url.trim() || ingestUrl.isPending}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded"
            style={{
              background: url.trim() && !ingestUrl.isPending ? C.accentSoft : C.surfaceMuted,
              color: url.trim() && !ingestUrl.isPending ? C.textPrimary : C.textMuted,
              border: `1px solid ${C.borderSoft}`,
            }}
          >
            {ingestUrl.isPending ? "Fetching" : "Ingest URL"}
          </button>
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
          Clicking Ingest URL approves one public fetch and source-library record. No private, logged-in, crawler, or screenshot action runs here.
        </div>
        {ingestUrl.data && (
          <div className="text-[11px] leading-relaxed break-all" style={{ color: ingestUrl.data.ok ? C.success : C.warning }}>
            {ingestUrl.data.ok && ingestUrl.data.source
              ? `Saved source: ${ingestUrl.data.source.title ?? ingestUrl.data.source.uri}`
                : ingestUrl.data.reason ?? "URL ingestion failed."}
          </div>
        )}
      </form>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-3 p-4">
          <div className="space-y-3 min-w-0">
            {preview.data && (
              <section className="space-y-2">
                <SectionTitle title="Research Preview" detail={preview.data.taskType.replace(/_/g, " ")} />
                {cards.map((card) => (
                  <SourceCard
                    key={card.id}
                    title={card.title}
                    sourceType={card.sourceType}
                    trustLevel={card.trustLevel}
                    preview={card.preview}
                    whyItMatters={card.whyItMatters}
                    requiredApproval={card.requiredApproval}
                  />
                ))}
                <div className="text-xs leading-relaxed rounded p-2" style={{ color: C.textSecondary, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  {preview.data.nextStep}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <SectionTitle title="Saved Sources" detail={savedSources.length ? `${savedSources.length} records` : "empty"} />
              {panel.isLoading ? (
                <div className="text-xs" style={{ color: C.textMuted }}>Reading source library.</div>
              ) : savedSources.length === 0 ? (
                <div className="text-xs leading-relaxed rounded p-3" style={{ color: C.textMuted, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  No saved source records yet. Surfer will use this space for source cards once public browsing and source saves are approved.
                </div>
              ) : (
                savedSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    title={source.title ?? source.uri}
                    sourceType={source.sourceType ?? source.kind}
                    trustLevel={source.trustLevel ?? "unknown"}
                    freshnessStatus={source.freshnessStatus ?? "unknown"}
                    wordCount={source.wordCount ?? null}
                    sensitiveDataFlag={source.sensitiveDataFlag}
                    preview={source.summary ?? "Saved source record without summary."}
                    whyItMatters={source.uri}
                    requiredApproval={source.trustNotes ?? "Already saved in the Source Library."}
                    scrubNotes={source.scrubNotes ?? undefined}
                  />
                ))
              )}
            </section>
          </div>

          <aside className="space-y-3 min-w-0">
            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Source History" detail={`${sourceEvents.length} events`} />
              <div className="flex flex-wrap gap-1 mt-2">
                {(["all", "surfer", "hedwig"] as const).map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => setEventOwner(owner)}
                    className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                    style={{
                      background: eventOwner === owner ? C.accentSoft : C.surfaceMuted,
                      color: eventOwner === owner ? C.textPrimary : C.textMuted,
                      border: `1px solid ${C.borderSoft}`,
                    }}
                  >
                    {owner}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSensitiveEventsOnly((value) => !value)}
                  className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded"
                  style={{
                    background: sensitiveEventsOnly ? C.accentSoft : C.surfaceMuted,
                    color: sensitiveEventsOnly ? C.textPrimary : C.warning,
                    border: `1px solid ${C.borderSoft}`,
                  }}
                >
                  Scrubbed
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {sourceEvents.length === 0 ? (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                    No source history events recorded yet.
                  </div>
                ) : (
                  sourceEvents.slice(0, 8).map((event) => (
                    <div key={event.id} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: C.textSecondary }}>
                          {event.eventType.replace(/_/g, " ")}
                        </div>
                        <MiniBadge label={event.ownerAgent ?? "unknown"} tone={event.ownerAgent === "surfer" ? C.accent : C.gold} />
                      </div>
                      <div className="text-xs font-semibold truncate mt-1" style={{ color: C.textPrimary }} title={event.title ?? event.uri}>
                        {event.title ?? event.uri}
                      </div>
                      <div className="text-[10px] leading-snug truncate mt-1" style={{ color: C.textMuted }} title={event.uri}>
                        {event.uri}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.trustLevel && <MiniBadge label={event.trustLevel} tone={TRUST_TONES[event.trustLevel] ?? C.textMuted} />}
                        {event.freshnessStatus && <MiniBadge label={event.freshnessStatus} tone={C.textMuted} />}
                        {event.sourceLabel && <MiniBadge label={event.sourceLabel} tone={C.textMuted} />}
                        {event.wordCount != null && <MiniBadge label={`${event.wordCount} words`} tone={C.textMuted} />}
                        {event.sensitiveDataFlag && <MiniBadge label="scrubbed" tone={C.warning} />}
                      </div>
                      {event.summary && (
                        <div className="text-[11px] leading-snug mt-2 line-clamp-3" style={{ color: C.textSecondary }} title={event.summary}>
                          {event.summary}
                        </div>
                      )}
                      {(event.trustNotes || event.scrubNotes) && (
                        <div className="text-[10px] leading-snug mt-2" style={{ color: C.textMuted }}>
                          {event.trustNotes ?? event.scrubNotes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Browser Ladder" detail="lowest sufficient rung" />
              <div className="space-y-1 mt-2">
                {(data?.ladder ?? []).map((step, index) => (
                  <div key={step} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 text-[11px] leading-snug">
                    <span style={{ color: C.textMuted }}>{index}</span>
                    <span style={{ color: C.textSecondary }}>{step}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Policy" detail="approval-gated" />
              <div className="space-y-2 mt-2">
                {data?.policy && Object.entries(data.policy).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>
                      {value}
                    </div>
                  </div>
                ))}
                {preview.data?.gates.map((gate) => (
                  <div key={gate} className="text-[11px] leading-relaxed" style={{ color: C.warning }}>
                    {gate}
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

function SourceCard({
  title,
  sourceType,
  trustLevel,
  freshnessStatus,
  wordCount,
  sensitiveDataFlag = false,
  preview,
  whyItMatters,
  requiredApproval,
  scrubNotes,
}: {
  title: string;
  sourceType: string;
  trustLevel: string;
  freshnessStatus?: string;
  wordCount?: number | null;
  sensitiveDataFlag?: boolean;
  preview: string;
  whyItMatters: string;
  requiredApproval: string;
  scrubNotes?: string;
}) {
  const tone = TRUST_TONES[trustLevel] ?? C.textMuted;
  return (
    <article className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: C.textPrimary }} title={title}>
            {title}
          </div>
          <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: C.textMuted }}>
            {sourceType.replace(/_/g, " ")}
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ color: tone, background: `${tone}1a`, border: `1px solid ${tone}55` }}
        >
          {trustLevel}
        </span>
      </div>
      {(freshnessStatus || wordCount != null || sensitiveDataFlag) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {freshnessStatus && <MiniBadge label={freshnessStatus} tone={freshnessStatus === "fresh" || freshnessStatus === "recent" ? C.success : C.warning} />}
          {wordCount != null && <MiniBadge label={`${wordCount} words`} tone={C.textMuted} />}
          {sensitiveDataFlag && <MiniBadge label="scrubbed" tone={C.warning} />}
        </div>
      )}
      <div className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
        {preview}
      </div>
      <div className="text-[11px] leading-relaxed mt-2 break-all" style={{ color: C.textMuted }}>
        {whyItMatters}
      </div>
      <div className="text-[11px] leading-relaxed mt-2" style={{ color: C.warning }}>
        {requiredApproval}
      </div>
      {scrubNotes && (
        <div className="text-[11px] leading-relaxed mt-2" style={{ color: C.textMuted }}>
          {scrubNotes}
        </div>
      )}
    </article>
  );
}

function MiniBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{ color: tone, background: `${tone}14`, border: `1px solid ${tone}44` }}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}
