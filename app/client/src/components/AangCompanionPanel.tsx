import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LocalState = "awake" | "muted" | "parked" | "sleeping";
type CompanionRoute = "home" | "approvals" | "terminal" | "inbox" | "sources" | "workbench" | "tasks" | "automation";

export default function AangCompanionPanel({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate?: (route: CompanionRoute) => void;
}) {
  const [eventStripOpen, setEventStripOpen] = useState(false);
  const policy = trpc.companion.policy.useQuery();
  const localEvents = trpc.companion.localEvents.useQuery(undefined, {
    enabled: eventStripOpen,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [localState, setLocalState] = useState<LocalState>("awake");
  const data = policy.data;

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: C.background, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}>
      <header className="shrink-0 px-2.5 py-1.5" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest">Aang Companion</h2>
            <p className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>
              Event policy and web mock path. No desktop process.
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close Aang Companion policy"
            variant="outline"
            size="sm"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Close
          </Button>
        </div>
        <div role="status" aria-live="polite" className="mt-2 text-[11px]" style={{ color: C.textMuted }}>
          {policy.isLoading
            ? "Reading companion policy."
            : `Local mock state: ${localState}. Local events ${eventStripOpen ? localEvents.data?.activeCount ?? 0 : "open to read"}. No notifications sent.`}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-2" aria-label="Aang Companion policy" aria-busy={policy.isLoading}>
        {!data ? (
          <div className="rounded p-2 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            Loading companion policy.
          </div>
        ) : (
          <div className="grid gap-2">
            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="mb-2 flex flex-wrap gap-1">
                <Chip label={data.mode.replace(/_/g, " ")} tone={C.warning} />
                <Chip label={data.startsDesktopProcess ? "desktop process" : "no desktop process"} tone={C.success} />
                <Chip label={data.sendsNotifications ? "notifications" : "no notifications"} tone={C.success} />
                <Chip label={data.readsScreen ? "screen access" : "no screen access"} tone={C.success} />
              </div>
              <p className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                {data.summary}
              </p>
            </section>

            <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest">Local Controls</h3>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Aang Companion local mock state">
                {(["awake", "muted", "parked", "sleeping"] as LocalState[]).map((state) => (
                  <Button
                    key={state}
                    type="button"
                    onClick={() => setLocalState(state)}
                    aria-pressed={localState === state}
                    title={`Set local companion preview state to ${state}. This does not change notification channels.`}
                    aria-label={`Set local Aang Companion preview state to ${state}`}
                    variant={localState === state ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 px-2"
                    style={{
                      background: localState === state ? C.accentSoft : C.surfaceMuted,
                      border: `1px solid ${localState === state ? C.accent : C.borderSoft}`,
                      color: localState === state ? C.textPrimary : C.textMuted,
                    }}
                  >
                    {state}
                  </Button>
                ))}
              </div>
            </section>

            <details
              className="rounded p-2"
              aria-label="Live local companion event counts"
              onToggle={(event) => setEventStripOpen(event.currentTarget.open)}
              style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
            >
              <summary className="cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Local Event Strip</h3>
                    <p className="mt-0.5 text-[10px]" style={{ color: C.textMuted }}>
                      Read-only counts. No notification channel.
                    </p>
                  </div>
                  <Chip label={eventStripOpen ? `${localEvents.data?.bubbleCount ?? 0} bubbles` : "open to read"} tone={eventStripOpen ? C.warning : C.textMuted} />
                </div>
              </summary>
              <div className="mt-2">
                {!eventStripOpen ? (
                  <div className="rounded p-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    Open to read local companion event counts.
                  </div>
                ) : localEvents.isLoading ? (
                  <div className="rounded p-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                    Reading local companion event counts.
                  </div>
                ) : (
                  <>
                    {(localEvents.data?.gates ?? []).map((gate) => (
                      <div key={gate} className="mb-1.5 rounded p-1.5 text-[11px]" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                        {gate}
                      </div>
                    ))}
                    <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
                      {(localEvents.data?.events ?? []).map((event) => (
                        <Button
                          key={event.id}
                          type="button"
                          onClick={() => onNavigate?.(event.route as CompanionRoute)}
                          aria-label={`Open ${event.route} for ${event.label}`}
                          title={`Open ${event.route} as a local read. Aang Companion does not trigger notifications.`}
                          variant="outline"
                          className="h-auto justify-start whitespace-normal p-2 text-left"
                          style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                        >
                          <span className="block w-full min-w-0">
                            <span className="flex flex-wrap items-center gap-1">
                              <Chip label={event.source.replace(/_/g, " ")} tone={C.accent} />
                              <Chip label={event.quiet ? "quiet" : "bubble"} tone={event.quiet ? C.textMuted : C.warning} />
                            </span>
                            <span className="mt-1.5 block text-[13px] font-bold leading-none" style={{ color: event.count > 0 ? C.textPrimary : C.textMuted }}>
                              {event.count}
                            </span>
                            <span className="mt-1 block text-[11px] leading-snug" style={{ color: C.textMuted }}>
                              {event.label}
                            </span>
                            <span className="mt-1.5 block text-[10px] uppercase tracking-wider" style={{ color: C.gold }}>
                              Open {event.route}
                            </span>
                          </span>
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </details>

            <section className="grid gap-1.5 md:grid-cols-3" aria-label="Companion shell options">
              {data.shellOptions.map((option) => (
                <article key={option.id} className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">{option.label}</h3>
                    <Chip label={option.status.replace(/_/g, " ")} tone={option.status === "recommended_first" ? C.accent : C.textMuted} />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-snug" style={{ color: C.textMuted }}>{option.reason}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-1.5 lg:grid-cols-2" aria-label="Companion events">
              <article className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest">Allowed Local Events</h3>
                <div className="grid gap-1.5">
                  {data.allowedEvents.map((event) => (
                    <div key={event.id} className="rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap items-center gap-1">
                        <Chip label={event.source.replace(/_/g, " ")} tone={C.accent} />
                        <Chip label={`route ${event.route}`} tone={C.gold} />
                        <Chip label={event.quiet ? "quiet" : "bubble"} tone={event.quiet ? C.textMuted : C.warning} />
                      </div>
                      <div className="mt-1 text-[11px]" style={{ color: C.textSecondary }}>{event.label}</div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest">Blocked Events</h3>
                <div className="flex flex-wrap gap-1">
                  {data.blockedEvents.map((event) => (
                    <Chip key={event} label={event} tone={C.danger} />
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-1.5 lg:grid-cols-2" aria-label="Companion behavior">
              <article className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest">Idle States</h3>
                <div className="flex flex-wrap gap-1">
                  {data.idleStates.map((state) => (
                    <Chip key={state.id} label={`${state.label} / ${state.motion}`} tone={C.textMuted} />
                  ))}
                </div>
              </article>
              <article className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest">First Build Slice</h3>
                <ul className="grid gap-1" style={{ color: C.textMuted }}>
                  {data.firstBuildSlice.map((item) => (
                    <li key={item} className="text-[11px] leading-snug">{item}</li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="grid gap-1.5" aria-label="Companion gates">
              {data.gates.map((gate) => (
                <div key={gate} className="rounded p-1.5 text-[11px]" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  {gate}
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: string }) {
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
    <Badge variant={variant} className="px-1.5 py-0.5" style={{ background: `${tone}22`, color: tone }}>
      {label}
    </Badge>
  );
}
