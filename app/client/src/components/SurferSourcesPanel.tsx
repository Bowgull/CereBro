import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { sourceDisplayName } from "@/lib/displayLabels";
import { cerebroColors as C, cerebroTheme as T } from "@/lib/keepConfig";
import { CompactReadDatum } from "@/components/CompactReadDatum";
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

const G = T.graphiteCandle;

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
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const preview = trpc.surfer.previewResearch.useMutation();
  const ingestUrl = trpc.surfer.ingestPublicUrl.useMutation({
    onSuccess: () => utils.surfer.panel.invalidate(),
  });
  const validateSource = trpc.surfer.validateSource.useMutation({
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

  function markSource(sourceId: number, decision: "trusted" | "needs_review" | "rejected") {
    const reviewer = decision === "rejected" ? "spock" : "oak";
    const note = decision === "trusted"
      ? "User marked this saved source trusted from Research."
      : decision === "needs_review"
        ? "User kept this saved source in review from Research."
        : "User rejected this saved source from Research.";
    validateSource.mutate({ sourceId, decision, reviewer, note });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: G.slabMuted, border: `1px solid ${G.line}`, color: C.textPrimary }}>
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 shrink-0"
        style={{ borderBottom: `1px solid ${G.lineSoft}`, background: G.slab }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
              Research
            </div>
            <Badge variant={data?.browserEnabled ? "success" : "warning"} className="uppercase">Browser {data?.browserEnabled ? "enabled" : "locked"}</Badge>
            <Badge variant="secondary" className="uppercase">{savedSources.length} sources</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="secondary" className="uppercase">Mode {(data?.mode ?? "proposal_only").replace(/_/g, " ")}</Badge>
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

      <div className="grid grid-cols-1 gap-1.5 px-2 py-1.5 shrink-0 xl:grid-cols-2" style={{ borderBottom: `1px solid ${G.lineSoft}` }}>
        <form onSubmit={submit} className="space-y-1.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask Surfer what to find, compare, source, or preview."
            />
            <Button
              type="submit"
              disabled={!query.trim() || preview.isPending}
              title={!query.trim() ? "Enter a research question before previewing." : "Preview a research plan. Surfer does not browse from this action."}
              aria-label="Preview Surfer research plan"
            >
              {preview.isPending ? "Reading" : "Preview"}
            </Button>
          </div>
          <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
            Plan only. Surfer does not browse from this preview.
          </div>
        </form>

        <form onSubmit={submitUrl} className="space-y-1.5">
          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-[minmax(0,1fr)_auto_auto]">
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
              title={url.trim() ? "Open Security Gate for this URL before ingest." : "Enter a URL before opening Security Gate."}
              aria-label="Open Security Gate for source URL"
            >
              Security
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || ingestUrl.isPending}
              title={!url.trim() ? "Enter an approved public URL before ingest." : "Fetch one approved public URL into the Source Library."}
              aria-label="Ingest approved public URL"
              variant="risk"
            >
              {ingestUrl.isPending ? "Fetching" : "Ingest"}
            </Button>
          </div>
          <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
            One approved public fetch. Use Spock for unfamiliar URLs.
          </div>
          {ingestUrl.data && (
            ingestUrl.data.ok && ingestUrl.data.source && ingestUrl.data.sourceSaveReceipt ? (
              <div className="rounded p-1.5 text-[10px] leading-snug" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}`, color: C.textSecondary }}>
                <div className="font-semibold truncate" style={{ color: C.success }} title={ingestUrl.data.source.uri}>
                  Saved source #{ingestUrl.data.sourceSaveReceipt.sourceId}: {ingestUrl.data.source.title ?? ingestUrl.data.source.sourceDisplayName ?? sourceDisplayName(ingestUrl.data.source.uri)}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <MiniBadge label={`event ${ingestUrl.data.sourceSaveReceipt.sourceEventId}`} tone={C.accent} />
                  <MiniBadge label={`artifact ${ingestUrl.data.sourceSaveReceipt.artifactId}`} tone={C.gold} />
                  <MiniBadge label={ingestUrl.data.sourceSaveReceipt.browserOpened ? "browser opened" : "no browser"} tone={ingestUrl.data.sourceSaveReceipt.browserOpened ? C.warning : C.success} />
                  <MiniBadge label={ingestUrl.data.sourceSaveReceipt.retrievalAutomationEnabled ? "retrieval on" : "retrieval off"} tone={ingestUrl.data.sourceSaveReceipt.retrievalAutomationEnabled ? C.warning : C.textMuted} />
                </div>
                <div className="mt-1" style={{ color: C.textMuted }}>
                  {ingestUrl.data.sourceSaveReceipt.nextAction}
                </div>
              </div>
            ) : (
              <div className="text-[10px] leading-snug break-all" style={{ color: C.warning }}>
                {ingestUrl.data.reason ?? "URL ingestion failed."}
              </div>
            )
          )}
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-2 px-2 pt-2 pb-16">
          <div className="space-y-2 min-w-0">
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
                <div className="text-[11px] leading-snug rounded p-1.5" style={{ color: C.textSecondary, background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
                  {preview.data.nextStep}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <SectionTitle title="Saved Sources" detail={savedSources.length ? `${savedSources.length} records` : "empty"} />
              {panel.isLoading ? (
                <div className="text-[11px]" style={{ color: C.textMuted }}>Reading source library.</div>
              ) : savedSources.length === 0 ? (
                <div className="text-[11px] leading-snug rounded p-2" style={{ color: C.textMuted, background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
                  No saved source records yet. Approved public sources will appear here.
                </div>
              ) : (
                savedSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    sourceId={source.id}
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
                    onValidate={markSource}
                    validationPending={validateSource.isPending && validateSource.variables?.sourceId === source.id}
                  />
                ))
              )}
            </section>
          </div>

          <aside className="space-y-1.5 min-w-0">
            <section className="rounded p-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
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
              <div className="space-y-1.5 mt-2">
                {sourceEvents.length === 0 ? (
                  <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                    No source history events recorded yet.
                  </div>
                ) : (
                  sourceEventGroups.slice(0, 6).map(({ event, display, title, count }) => (
                    <div key={`${event.id}-${count}`} className="rounded p-1.5" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
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
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.trustLevel && <MiniBadge label={event.trustLevel} tone={TRUST_TONES[event.trustLevel] ?? C.textMuted} />}
                        {event.freshnessStatus && <MiniBadge label={event.freshnessStatus} tone={C.textMuted} />}
                        {event.sourceLabel && <MiniBadge label={event.sourceLabel} tone={C.textMuted} />}
                        {event.wordCount != null && <MiniBadge label={`${event.wordCount} words`} tone={C.textMuted} />}
                        {event.sensitiveDataFlag && <MiniBadge label="scrubbed" tone={C.warning} />}
                      </div>
                      {event.summary && (
                        <div className="text-[10px] leading-snug mt-1 line-clamp-3" style={{ color: C.textSecondary }} title={event.summary}>
                          {event.summary}
                        </div>
                      )}
                      {(event.trustNotes || event.scrubNotes) && (
                        <div className="text-[10px] leading-snug mt-1" style={{ color: C.textMuted }}>
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

            {data?.sourceLibraryReceipt && (
              <section className="rounded p-1.5" aria-label="Source Library receipt" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                <SectionTitle title="Source Receipt" detail={data.sourceLibraryReceipt.mode.replace(/_/g, " ")} />
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <CompactReadDatum label="Total" value={data.sourceLibraryReceipt.totalSources} tone={C.accent} />
                  <CompactReadDatum label="Trusted" value={data.sourceLibraryReceipt.trustedSources} tone={C.success} />
                  <CompactReadDatum label="Review" value={data.sourceLibraryReceipt.needsReview} tone={data.sourceLibraryReceipt.needsReview > 0 ? C.warning : C.textMuted} />
                  <CompactReadDatum label="Scrub" value={data.sourceLibraryReceipt.needsScrub} tone={data.sourceLibraryReceipt.needsScrub > 0 ? C.warning : C.textMuted} />
                  <CompactReadDatum label="Stale" value={data.sourceLibraryReceipt.staleSources} tone={data.sourceLibraryReceipt.staleSources > 0 ? C.warning : C.textMuted} />
                  <CompactReadDatum label="Events" value={data.sourceLibraryReceipt.sourceEvents} tone={C.textSecondary} />
                </div>
                <div className="mt-2 rounded p-1.5 text-[10px] leading-snug" style={{ color: C.textMuted, background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
                  {data.sourceLibraryReceipt.nextAction}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <MiniBadge label={data.sourceLibraryReceipt.routeDefaultsChanged ? "route changed" : "route unchanged"} tone={data.sourceLibraryReceipt.routeDefaultsChanged ? C.danger : C.success} />
                  <MiniBadge label={data.sourceLibraryReceipt.retrievalAutomationEnabled ? "retrieval on" : "retrieval off"} tone={data.sourceLibraryReceipt.retrievalAutomationEnabled ? C.warning : C.textMuted} />
                </div>
              </section>
            )}

            {data?.sourceResearchLoopAudit && (
              <section className="rounded p-1.5" aria-label="Source research loop audit" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                <SectionTitle title="Source Loop Audit" detail={data.sourceResearchLoopAudit.mode.replace(/_/g, " ")} />
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <CompactReadDatum label="Sources" value={data.sourceResearchLoopAudit.totalSources} tone={C.accent} />
                  <CompactReadDatum label="Trusted" value={data.sourceResearchLoopAudit.trustedSources} tone={C.success} />
                  <CompactReadDatum label="Review" value={data.sourceResearchLoopAudit.reviewSources} tone={data.sourceResearchLoopAudit.reviewSources > 0 ? C.warning : C.textMuted} />
                  <CompactReadDatum label="Stale" value={data.sourceResearchLoopAudit.staleSources} tone={data.sourceResearchLoopAudit.staleSources > 0 ? C.warning : C.textMuted} />
                  <CompactReadDatum label="Scrub" value={data.sourceResearchLoopAudit.sensitiveSources} tone={data.sourceResearchLoopAudit.sensitiveSources > 0 ? C.warning : C.textMuted} />
                  <CompactReadDatum label="Fetched" value={data.sourceResearchLoopAudit.fetchedSources} tone={C.textSecondary} />
                  <CompactReadDatum label="GitHub" value={data.sourceResearchLoopAudit.githubSources} tone={C.gold} />
                  <CompactReadDatum label="Community" value={data.sourceResearchLoopAudit.communitySources} tone={C.textSecondary} />
                  <CompactReadDatum label="Surfer" value={data.sourceResearchLoopAudit.surferEvents} tone={C.textSecondary} />
                  <CompactReadDatum label="Hedwig" value={data.sourceResearchLoopAudit.hedwigEvents} tone={C.textSecondary} />
                  <CompactReadDatum label="Validated" value={data.sourceResearchLoopAudit.validationEvents} tone={data.sourceResearchLoopAudit.validationEvents > 0 ? C.success : C.textMuted} />
                </div>
                <div className="mt-2 rounded p-1.5 text-[10px] leading-snug" style={{ color: C.textMuted, background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
                  {data.sourceResearchLoopAudit.nextAction}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <MiniBadge label={data.sourceResearchLoopAudit.canBrowseFromAudit ? "browse allowed" : "no browse"} tone={data.sourceResearchLoopAudit.canBrowseFromAudit ? C.danger : C.success} />
                  <MiniBadge label={data.sourceResearchLoopAudit.canWriteMemoryFromAudit ? "memory write" : "no memory write"} tone={data.sourceResearchLoopAudit.canWriteMemoryFromAudit ? C.danger : C.success} />
                  <MiniBadge label={data.sourceResearchLoopAudit.retrievalAutomationEnabled ? "retrieval on" : "retrieval off"} tone={data.sourceResearchLoopAudit.retrievalAutomationEnabled ? C.warning : C.textMuted} />
                </div>
                <details className="mt-2 rounded p-1.5" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                    Audit Gates
                  </summary>
                  <div className="mt-1.5 grid gap-1">
                    {data.sourceResearchLoopAudit.gates.map((gate) => (
                      <RailLine key={gate} marker="G" text={gate} />
                    ))}
                  </div>
                </details>
              </section>
            )}

            {data?.sourceLibraryRoute && (
              <section className="rounded p-1.5" aria-label="Source Library route" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
                <SectionTitle title="Source Route" detail={data.sourceLibraryRoute.mode.replace(/_/g, " ")} />
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <CompactReadDatum label="Source notes" value={data.sourceLibraryRoute.sourceNoteLane} tone={C.accent} wrap />
                  <CompactReadDatum label="GitHub source" value={data.sourceLibraryRoute.githubRepositorySourcePath} tone={C.gold} wrap />
                  <CompactReadDatum label="Project map" value={data.sourceLibraryRoute.githubProjectMapPath} tone={C.textSecondary} wrap />
                  <CompactReadDatum label="Source index" value={data.sourceLibraryRoute.githubSourcesIndexPath} tone={C.textSecondary} wrap />
                  <CompactReadDatum label="Archive" value={data.sourceLibraryRoute.archiveRetrieval} tone={C.warning} wrap />
                  <CompactReadDatum
                    label="Writes"
                    value={data.sourceLibraryRoute.writesExternalSystems ? "enabled" : "approval gated"}
                    tone={data.sourceLibraryRoute.writesExternalSystems ? C.danger : C.gold}
                    wrap
                  />
                </div>
                <details className="mt-2 rounded p-1.5" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                    Write Gate
                  </summary>
                  <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.warning }}>
                    {data.sourceLibraryRoute.approvalGate}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {data.sourceLibraryRoute.retrievalMetadataFields.map((field) => (
                      <MiniBadge key={field} label={field} tone={C.textMuted} />
                    ))}
                  </div>
                </details>
              </section>
            )}

            <details className="rounded p-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
              <summary className="cursor-pointer">
                <SectionTitle title="Browser Ladder" detail="lowest sufficient rung" />
              </summary>
              <div className="mt-2 grid gap-1">
                {(data?.ladder ?? []).map((step, index) => (
                  <RailLine key={step} marker={String(index)} text={step} />
                ))}
              </div>
            </details>

            <details className="rounded p-1.5" style={{ background: G.slab, border: `1px solid ${G.lineSoft}` }}>
              <summary className="cursor-pointer">
                <SectionTitle title="Policy" detail="approval-gated" />
              </summary>
              <div className="mt-2 grid gap-1.5">
                {data?.policy && Object.entries(data.policy).map(([key, value]) => (
                  <RailLine key={key} marker={key.replace(/([A-Z])/g, " $1")} text={String(value)} />
                ))}
                {preview.data?.gates.map((gate) => (
                  <RailLine key={gate} marker="gate" text={gate} tone={C.warning} />
                ))}
              </div>
            </details>
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
  sourceId,
  onValidate,
  validationPending = false,
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
  sourceId?: number;
  onValidate?: (sourceId: number, decision: "trusted" | "needs_review" | "rejected") => void;
  validationPending?: boolean;
}) {
  return (
    <article className="rounded p-2" style={{ background: G.slabRaised, border: `1px solid ${G.lineSoft}` }}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold truncate" style={{ color: C.textPrimary }} title={title}>
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
        <div className="flex flex-wrap gap-1 mb-1.5">
          {freshnessStatus && <MiniBadge label={freshnessStatus} tone={freshnessStatus === "fresh" || freshnessStatus === "recent" ? C.success : C.warning} />}
          {wordCount != null && <MiniBadge label={`${wordCount} words`} tone={C.textMuted} />}
          {sensitiveDataFlag && <MiniBadge label="scrubbed" tone={C.warning} />}
        </div>
      )}
      <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
        {preview}
      </div>
      <div className="text-[10px] leading-snug mt-1.5 truncate" style={{ color: C.textMuted }} title={sourceUri ?? whyItMatters}>
        {whyItMatters}
      </div>
      {(requiredApproval || scrubNotes) && (
        <details className="mt-1.5 rounded p-1.5" style={{ background: G.slabMuted, border: `1px solid ${G.lineSoft}` }}>
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textPrimary }}>
            Source Rules
          </summary>
          {requiredApproval && (
            <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.warning }}>
              {requiredApproval}
            </div>
          )}
          {scrubNotes && (
            <div className="text-[10px] leading-snug mt-1.5" style={{ color: C.textMuted }}>
              {scrubNotes}
            </div>
          )}
          {sourceId != null && onValidate && (
            <div className="mt-2 flex flex-wrap gap-1">
              <Button type="button" size="sm" variant="secondary" disabled={validationPending} onClick={() => onValidate(sourceId, "trusted")}>
                Trusted
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={validationPending} onClick={() => onValidate(sourceId, "needs_review")}>
                Review
              </Button>
              <Button type="button" size="sm" variant="risk" disabled={validationPending} onClick={() => onValidate(sourceId, "rejected")}>
                Reject
              </Button>
            </div>
          )}
        </details>
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
    <div className="grid grid-cols-[38px_minmax(0,1fr)] gap-1.5 text-[10px] leading-snug">
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
