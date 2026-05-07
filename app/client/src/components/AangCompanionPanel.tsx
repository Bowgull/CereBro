import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cerebroColors as C } from "@/lib/keepConfig";

type LocalState = "awake" | "muted" | "parked" | "sleeping";
type CompanionRoute = "home" | "approvals" | "terminal" | "inbox" | "sources" | "workbench" | "tasks" | "automation";

export default function AangCompanionPanel({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate?: (route: CompanionRoute) => void;
}) {
  const policy = trpc.companion.policy.useQuery();
  const localEvents = trpc.companion.localEvents.useQuery(undefined, { refetchInterval: 10000 });
  const [localState, setLocalState] = useState<LocalState>("awake");
  const data = policy.data;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: C.background, color: C.textPrimary }}>
      <header className="shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.backgroundSoft }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Aang Companion</h2>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>
              Event policy and web mock path. No desktop process.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Aang Companion policy"
            className="px-2 py-1 text-xs font-semibold uppercase rounded"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Close
          </button>
        </div>
        <div role="status" aria-live="polite" className="mt-3 text-xs" style={{ color: C.textMuted }}>
          {policy.isLoading ? "Reading companion policy." : `Local mock state: ${localState}. Local events ${localEvents.data?.activeCount ?? 0}. No notifications sent.`}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4" aria-label="Aang Companion policy" aria-busy={policy.isLoading}>
        {!data ? (
          <div className="rounded p-4 text-sm" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
            Loading companion policy.
          </div>
        ) : (
          <div className="grid gap-4">
            <section className="rounded p-4" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex flex-wrap gap-2 mb-3">
                <Chip label={data.mode.replace(/_/g, " ")} tone={C.warning} />
                <Chip label={data.startsDesktopProcess ? "desktop process" : "no desktop process"} tone={C.success} />
                <Chip label={data.sendsNotifications ? "notifications" : "no notifications"} tone={C.success} />
                <Chip label={data.readsScreen ? "screen access" : "no screen access"} tone={C.success} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {data.summary}
              </p>
            </section>

            <section className="rounded p-4" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Local Controls</h3>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Aang Companion local mock state">
                {(["awake", "muted", "parked", "sleeping"] as LocalState[]).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setLocalState(state)}
                    aria-pressed={localState === state}
                    className="px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider"
                    style={{
                      background: localState === state ? C.accentSoft : C.surfaceMuted,
                      border: `1px solid ${localState === state ? C.accent : C.borderSoft}`,
                      color: localState === state ? C.textPrimary : C.textMuted,
                    }}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded p-4" aria-label="Live local companion event counts" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">Local Event Strip</h3>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Read-only counts. No notification channel.
                  </p>
                </div>
                <Chip label={`${localEvents.data?.bubbleCount ?? 0} bubbles`} tone={C.warning} />
              </div>
              {(localEvents.data?.gates ?? []).map((gate) => (
                <div key={gate} className="mb-2 rounded px-3 py-2 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
                  {gate}
                </div>
              ))}
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {(localEvents.data?.events ?? []).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onNavigate?.(event.route as CompanionRoute)}
                    aria-label={`Open ${event.route} for ${event.label}`}
                    className="rounded p-3 text-left"
                    style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                  >
                    <div className="flex flex-wrap items-center gap-1">
                      <Chip label={event.source.replace(/_/g, " ")} tone={C.accent} />
                      <Chip label={event.quiet ? "quiet" : "bubble"} tone={event.quiet ? C.textMuted : C.warning} />
                    </div>
                    <div className="mt-2 text-lg font-bold leading-none" style={{ color: event.count > 0 ? C.textPrimary : C.textMuted }}>
                      {event.count}
                    </div>
                    <div className="mt-1 text-xs leading-snug" style={{ color: C.textMuted }}>
                      {event.label}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-wider" style={{ color: C.gold }}>
                      Open {event.route}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3" aria-label="Companion shell options">
              {data.shellOptions.map((option) => (
                <article key={option.id} className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest">{option.label}</h3>
                    <Chip label={option.status.replace(/_/g, " ")} tone={option.status === "recommended_first" ? C.accent : C.textMuted} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: C.textMuted }}>{option.reason}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-3 lg:grid-cols-2" aria-label="Companion events">
              <article className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Allowed Local Events</h3>
                <div className="grid gap-2">
                  {data.allowedEvents.map((event) => (
                    <div key={event.id} className="rounded px-2 py-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                      <div className="flex flex-wrap items-center gap-1">
                        <Chip label={event.source.replace(/_/g, " ")} tone={C.accent} />
                        <Chip label={`route ${event.route}`} tone={C.gold} />
                        <Chip label={event.quiet ? "quiet" : "bubble"} tone={event.quiet ? C.textMuted : C.warning} />
                      </div>
                      <div className="mt-1 text-xs" style={{ color: C.textSecondary }}>{event.label}</div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Blocked Events</h3>
                <div className="flex flex-wrap gap-1">
                  {data.blockedEvents.map((event) => (
                    <Chip key={event} label={event} tone={C.danger} />
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-3 lg:grid-cols-2" aria-label="Companion behavior">
              <article className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Idle States</h3>
                <div className="flex flex-wrap gap-1">
                  {data.idleStates.map((state) => (
                    <Chip key={state.id} label={`${state.label} / ${state.motion}`} tone={C.textMuted} />
                  ))}
                </div>
              </article>
              <article className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">First Build Slice</h3>
                <ul className="grid gap-1" style={{ color: C.textMuted }}>
                  {data.firstBuildSlice.map((item) => (
                    <li key={item} className="text-xs leading-relaxed">{item}</li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="grid gap-2" aria-label="Companion gates">
              {data.gates.map((gate) => (
                <div key={gate} className="rounded px-3 py-2 text-xs" style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textMuted }}>
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
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: `${tone}22`, color: tone }}>
      {label}
    </span>
  );
}
