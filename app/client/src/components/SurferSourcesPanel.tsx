import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TRUST_TONES: Record<string, string> = {
  official: C.success,
  primary: C.success,
  high: C.accent,
  medium: C.warning,
  low: C.danger,
  unknown: C.textMuted,
};

export default function SurferSourcesPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (route: "security") => void }) {
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
  const sourceEventGroups = Array.from(
    sourceEvents.reduce((groups, event) => {
      const display = event.sourceDisplayName ?? (event.uri ? sourceDisplayName(event.uri) : "unlinked source");
      const title = event.title ?? display;
      const key = [event.eventType, event.ownerAgent ?? "unknown", display, title].join("::");
      const current = groups.get(key);
      if (current) {
        current.count += 1;
      } else {
        groups.set(key, { event, display, title, count: 1 });
      }
      return groups;
    }, new Map<string, { event: (typeof sourceEvents)[number]; display: string; title: string; count: number }>()).values(),
  );

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

  function openSecurityGate() {
    const trimmed = url.trim();
    if (!trimmed || !onNavigate) return;
    try {
      window.sessionStorage.setItem("cerebro:security-target", trimmed);
    } catch {
      // Ignore storage failure. The Security Gate form still opens.
    }
    onNavigate("security");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-3 px-3 py-2.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="min-w-0">
          <div className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Research
            <span className="ml-2" style={{ color: C.textSecondary }}>{savedSources.length}</span>
          </div>
          <div className="text-[11px] mt-0.5 truncate" style={{ color: C.textMuted }}>
            Source cards, browser ladder, and approval-gated research previews.
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="secondary" className="uppercase">Mode {(data?.mode ?? "proposal_only").replace(/_/g, " ")}</Badge>
            <Badge variant={data?.browserEnabled ? "success" : "warning"} className="uppercase">Browser {data?.browserEnabled ? "enabled" : "locked"}</Badge>
            <Badge variant="default" className="uppercase">Owner {data?.ownerAgent ?? "surfer"}</Badge>
            <Badge variant="secondary" className="uppercase">
              Trusted {savedSources.filter((source) => ["official", "primary", "high"].includes(source.trustLevel)).length}/{savedSources.length}
            </Badge>
          </div>
        </div>
        <Button type="button" onClick={onClose} variant="outline" size="sm" className="shrink-0">
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 px-3 py-2 shrink-0 xl:grid-cols-2" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <form onSubmit={submit} className="space-y-1.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask Surfer what to find, compare, source, or preview."
            />
            <Button
              type="submit"
              disabled={!query.trim() || preview.isPending}
            >
              {preview.isPending ? "Reading" : "Preview"}
            </Button>
          </div>
          <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
            Plan only. Surfer does not browse from this preview.
          </div>
        </form>

        <form onSubmit={submitUrl} className="space-y-1.5">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Approved public URL to ingest as a source."
            />
            <Button
              type="button"
              disabled={!url.trim() || !onNavigate}
              onClick={openSecurityGate}
              variant="secondary"
              title={url.trim() ? sourceDisplayName(url.trim()) : "Open Security Gate"}
            >
              Security
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || ingestUrl.isPending}
              variant="risk"
            >
              {ingestUrl.isPending ? "Fetching" : "Ingest"}
            </Button>
          </div>
          <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
            One approved public fetch. Use Spock for unfamiliar URLs.
          </div>
          {ingestUrl.data && (
            <div className="text-[11px] leading-relaxed break-all" style={{ color: ingestUrl.data.ok ? C.success : C.warning }}>
              {ingestUrl.data.ok && ingestUrl.data.source
                ? `Saved source: ${
                    ingestUrl.data.source.title ??
                    ingestUrl.data.source.sourceDisplayName ??
                    sourceDisplayName(ingestUrl.data.source.uri)
                  }`
                : ingestUrl.data.reason ?? "URL ingestion failed."}
            </div>
          )}
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-2.5 px-3 pt-3 pb-20">
          <div className="space-y-2.5 min-w-0">
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
                    whyItMatters={source.sourceDisplayName ?? sourceDisplayName(source.uri)}
                    sourceUri={source.uri}
                    requiredApproval={source.trustNotes ?? "Already saved in the Source Library."}
                    scrubNotes={source.scrubNotes ?? undefined}
                  />
                ))
              )}
            </section>
          </div>

          <aside className="space-y-2.5 min-w-0">
            <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Source History" detail={`${sourceEventGroups.length}/${sourceEvents.length} groups`} />
              <div className="flex flex-wrap gap-1 mt-2">
                {(["all", "surfer", "hedwig"] as const).map((owner) => (
                  <Button
                    key={owner}
                    type="button"
                    onClick={() => setEventOwner(owner)}
                    variant={eventOwner === owner ? "secondary" : "ghost"}
                    size="sm"
                  >
                    {owner}
                  </Button>
                ))}
                <Button
                  type="button"
                  onClick={() => setSensitiveEventsOnly((value) => !value)}
                  variant={sensitiveEventsOnly ? "secondary" : "risk"}
                  size="sm"
                >
                  Scrubbed
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {sourceEvents.length === 0 ? (
                  <div className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
                    No source history events recorded yet.
                  </div>
                ) : (
                  sourceEventGroups.slice(0, 6).map(({ event, display, title, count }) => (
                    <div key={`${event.id}-${count}`} className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: C.textSecondary }}>
                          {event.eventType.replace(/_/g, " ")}
                        </div>
                        <div className="flex items-center gap-1">
                          {count > 1 && <MiniBadge label={`${count}x`} tone={C.textMuted} />}
                          <MiniBadge label={event.ownerAgent ?? "unknown"} tone={event.ownerAgent === "surfer" ? C.accent : C.gold} />
                        </div>
                      </div>
                      <div className="text-xs font-semibold truncate mt-1" style={{ color: C.textPrimary }} title={event.title ?? event.uri}>
                        {title}
                      </div>
                      <div className="text-[10px] leading-snug truncate mt-1" style={{ color: C.textMuted }} title={event.uri}>
                        {display}
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
                {sourceEventGroups.length > 6 && (
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                    Showing 6 of {sourceEventGroups.length} grouped source events
                  </div>
                )}
              </div>
            </section>

            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Browser Ladder" detail="lowest sufficient rung" />
              <div className="mt-2 grid gap-1">
                {(data?.ladder ?? []).map((step, index) => (
                  <RailLine key={step} marker={String(index)} text={step} />
                ))}
              </div>
            </section>

            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <SectionTitle title="Policy" detail="approval-gated" />
              <div className="mt-2 grid gap-1.5">
                {data?.policy && Object.entries(data.policy).map(([key, value]) => (
                  <RailLine key={key} marker={key.replace(/([A-Z])/g, " $1")} text={String(value)} />
                ))}
                {preview.data?.gates.map((gate) => (
                  <RailLine key={gate} marker="gate" text={gate} tone={C.warning} />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
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
  sourceUri,
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
  sourceUri?: string;
}) {
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
        <Badge variant={badgeVariant(trustLevel)} className="uppercase shrink-0">
          {trustLevel}
        </Badge>
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
      <div className="text-[11px] leading-relaxed mt-2 truncate" style={{ color: C.textMuted }} title={sourceUri ?? whyItMatters}>
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
  const variant = tone === C.danger
    ? "destructive"
    : tone === C.warning || tone === C.gold
      ? "warning"
      : tone === C.success
        ? "success"
        : tone === C.accent
          ? "default"
          : "secondary";

  return (
    <Badge variant={variant} className="uppercase">
      {label.replace(/_/g, " ")}
    </Badge>
  );
}

function RailLine({ marker, text, tone = C.textSecondary }: { marker: string; text: string; tone?: string }) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 text-[11px] leading-snug">
      <span className="truncate uppercase tracking-wider" style={{ color: C.textMuted }} title={marker}>
        {marker}
      </span>
      <span style={{ color: tone }}>
        {text}
      </span>
    </div>
  );
}

function badgeVariant(trustLevel: string): "default" | "secondary" | "destructive" | "warning" | "success" {
  if (trustLevel === "official" || trustLevel === "primary") return "success";
  if (trustLevel === "high") return "default";
  if (trustLevel === "medium") return "warning";
  if (trustLevel === "low") return "destructive";
  return "secondary";
}
