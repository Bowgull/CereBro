import { useState, useMemo } from "react";
import DungeonMap from "@/components/DungeonMapPhaser";
import EstablishingShot from "@/components/EstablishingShot";
import HeroPanel from "@/components/HeroPanel";
import SkillsManager from "@/components/SkillsManager";
import ConfigPanel from "@/components/ConfigPanel";
import { useHeroSocket } from "@/hooks/useHeroSocket";
import { HERO_CLASSES, STATE_COLORS, STATE_LABELS } from "@/lib/dungeonConfig";
import { FLOORS, cerebroColors as C, type FloorId } from "@/lib/keepConfig";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { heroes, setHeroes, mode, connected, log, startDemo, startLive, clearHeroes } =
    useHeroSocket();
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [showSkillsManager, setShowSkillsManager] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [floor, setFloor] = useState<FloorId>("ground");

  const selectedHero = useMemo(
    () => heroes.find((h) => h.id === selectedHeroId) || null,
    [heroes, selectedHeroId]
  );

  const refetchHeroes = trpc.agents.list.useQuery(undefined, { enabled: false });
  const { data: trackedProjects } = trpc.agents.trackedProjects.useQuery(undefined, { refetchInterval: 5000 });

  const stats = useMemo(() => {
    const active = heroes.filter(
      (h) => h.state === "fighting" || h.state === "casting"
    ).length;
    const resting = heroes.filter((h) => h.state === "resting").length;
    const planning = heroes.filter((h) => h.state === "shopping").length;
    return { total: heroes.length, active, resting, planning };
  }, [heroes]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: C.background, color: C.textPrimary, fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      <EstablishingShot />
      {/* ── Header ── */}
      <header
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 shrink-0"
        style={{ background: C.backgroundSoft, borderBottom: `1px solid ${C.borderSoft}` }}
      >
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-8 h-8 flex items-center justify-center rounded"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.gold }}
          >
            <span className="text-lg leading-none">◆</span>
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest leading-none" style={{ color: C.textPrimary }}>
              CereBro
            </h1>
            <p className="text-xs leading-none mt-0.5" style={{ color: C.textMuted }}>
              The Keep
            </p>
          </div>
        </div>

        {/* Floor selector */}
        <div className="flex items-center gap-1 shrink-0">
          {(["upper", "ground", "crypts"] as FloorId[]).map((id) => {
            const f = FLOORS[id];
            const isActive = id === floor;
            return (
              <button
                key={id}
                onClick={() => setFloor(id)}
                className="px-3 py-1.5 text-xs uppercase tracking-widest rounded transition-colors relative whitespace-nowrap"
                style={{
                  background: isActive ? C.surfaceRaised : "transparent",
                  color: isActive ? C.textPrimary : C.textMuted,
                  border: `1px solid ${isActive ? C.accentSoft : C.borderSoft}`,
                }}
                title={f.blurb}
              >
                {f.name}
                {!f.ready && (
                  <span
                    className="ml-2 text-[10px] px-1 rounded"
                    style={{ background: C.warning + "22", color: C.warning }}
                  >
                    pending
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Sessions", value: stats.total, color: C.accent },
            { label: "Active", value: stats.active, color: C.danger },
            { label: "Resting", value: stats.resting, color: C.success },
            { label: "Planning", value: stats.planning, color: C.warning },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded"
              style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
            >
              <div className="text-xs font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs uppercase" style={{ color: C.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded"
            style={{ border: `1px solid ${C.borderSoft}`, background: C.surface }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: connected ? C.success : C.danger }} />
            <span className="text-xs font-semibold uppercase" style={{ color: connected ? C.success : C.danger }}>
              {connected ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex rounded overflow-hidden" style={{ border: `1px solid ${C.borderSoft}` }}>
            <button
              onClick={startDemo}
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{
                background: mode === "demo" ? C.accentSoft : "transparent",
                color: mode === "demo" ? C.textPrimary : C.textMuted,
              }}
            >
              Demo
            </button>
            <button
              onClick={startLive}
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{
                background: mode === "live" ? C.danger : "transparent",
                color: mode === "live" ? C.background : C.textMuted,
              }}
            >
              Live
            </button>
          </div>

          {[
            { label: "Config", on: () => setShowConfig(true) },
            { label: "Skills", on: () => setShowSkillsManager(true) },
            { label: "Clear", on: clearHeroes },
            { label: "Log", on: () => setShowLog(!showLog), active: showLog },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.on}
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
              style={{
                border: `1px solid ${b.active ? C.accent : C.borderSoft}`,
                color: b.active ? C.accent : C.textSecondary,
                background: b.active ? `${C.accent}11` : "transparent",
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left Sidebar */}
        <div
          className="w-56 flex flex-col shrink-0 overflow-hidden"
          style={{ background: C.backgroundSoft, borderRight: `1px solid ${C.borderSoft}` }}
        >
          <div
            className="px-3 py-2"
            style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                Sessions
              </span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: heroes.length > 0 ? `${C.accent}22` : C.surfaceMuted,
                  color: heroes.length > 0 ? C.accent : C.textMuted,
                  border: `1px solid ${C.borderSoft}`,
                }}
              >
                {heroes.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {heroes.length === 0 ? (
              <div className="p-4 text-xs leading-relaxed" style={{ color: C.textMuted }}>
                {mode === "demo"
                  ? "Press Demo to spawn simulated sessions."
                  : "No active Claude Code sessions. Start one in any project; it will appear here."}
              </div>
            ) : (
              heroes.map((hero) => {
                const cls = HERO_CLASSES[hero.heroClass];
                const stateColor = STATE_COLORS[hero.state];
                const stateLabel = STATE_LABELS[hero.state];
                const isSelected = hero.id === selectedHeroId;
                return (
                  <button
                    key={hero.id}
                    onClick={() => setSelectedHeroId(isSelected ? null : hero.id)}
                    className="w-full text-left px-3 py-2.5 transition-colors"
                    style={{
                      background: isSelected ? C.surfaceRaised : "transparent",
                      borderBottom: `1px solid ${C.borderSoft}`,
                      borderLeft: isSelected ? `2px solid ${C.accent}` : "2px solid transparent",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>
                        {hero.name}
                      </div>
                      <div
                        className="text-xs px-1.5 rounded"
                        style={{ color: cls?.color ?? C.textMuted, background: `${cls?.color ?? C.textMuted}22` }}
                      >
                        Lv{hero.level}
                      </div>
                    </div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: stateColor }}>
                      {stateLabel}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div
            className="p-2.5 text-xs"
            style={{ borderTop: `1px solid ${C.borderSoft}`, background: C.surface, color: C.textMuted }}
          >
            {mode === "live" ? "Live — watching ~/.claude/" : "Demo — simulated sessions"}
          </div>
        </div>

        {/* Center - Keep Map */}
        <div className="flex-1 relative overflow-auto" style={{ minHeight: 0, background: C.background }}>
          {floor === "ground" ? (
            <DungeonMap
              heroes={heroes}
              selectedHeroId={selectedHeroId}
              onHeroClick={(id) => setSelectedHeroId(selectedHeroId === id ? null : id)}
            />
          ) : (
            <FloorPending floor={floor} />
          )}

          {floor === "ground" && heroes.length === 0 && (
            <div className="absolute bottom-4 right-4 pointer-events-none">
              <div
                className="px-4 py-3 rounded"
                style={{
                  background: `${C.background}f0`,
                  border: `1px solid ${C.borderSoft}`,
                  backdropFilter: "blur(4px)",
                  maxWidth: 240,
                }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  The Hub waits
                </div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: C.textSecondary }}>
                  {mode === "demo"
                    ? "Press Demo to spawn simulated sessions."
                    : "Start a Claude Code session in any project. The Hub orb will light when you arrive."}
                </div>
              </div>
            </div>
          )}

          {showLog && (
            <div
              className="absolute bottom-0 left-0 right-0 h-40 overflow-y-auto p-3"
              style={{ background: `${C.background}f5`, borderTop: `1px solid ${C.borderSoft}` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  Activity
                </div>
                <button onClick={() => setShowLog(false)} className="text-xs" style={{ color: C.textMuted }}>
                  Close
                </button>
              </div>
              {log.length === 0 ? (
                <div className="text-xs py-2" style={{ color: C.textMuted }}>No activity yet.</div>
              ) : (
                log.slice(-30).map((entry, i) => (
                  <div
                    key={i}
                    className="text-xs leading-relaxed py-0.5"
                    style={{ color: C.textSecondary, borderBottom: `1px solid ${C.borderSoft}` }}
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Hero Details */}
        {selectedHero && (
          <div className="w-64 shrink-0 overflow-hidden">
            <HeroPanel
              hero={selectedHero}
              onClose={() => setSelectedHeroId(null)}
              onSkillsUpdated={() => {}}
            />
          </div>
        )}
      </div>

      {/* Skills Manager Modal */}
      {showSkillsManager && (
        <SkillsManager
          onClose={() => setShowSkillsManager(false)}
          projects={trackedProjects ?? []}
        />
      )}

      {/* Config Panel Modal */}
      {showConfig && (
        <ConfigPanel onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
}

function FloorPending({ floor }: { floor: FloorId }) {
  const f = FLOORS[floor];
  const planned = floor === "upper"
    ? ["War Room — Batman", "Great Hall — Aang", "Alchemist's Tower — Professor Oak", "Observatory — Spock"]
    : ["Crypt of Hours — Piccolo"];
  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div
        className="max-w-md w-full p-6 rounded"
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: C.warning }}>
          Pending art pass
        </div>
        <div className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>
          {f.name}
        </div>
        <div className="text-sm mb-4 leading-relaxed" style={{ color: C.textSecondary }}>
          {f.blurb}. The pixel-art background for this floor isn't authored yet.
          The dungeon ships with a single hand-painted Ground Hall image.
          Upper Spires and Crypts wait on the asset pipeline session.
        </div>
        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>
          Chambers planned for this floor
        </div>
        <ul className="space-y-1.5">
          {planned.map((c) => (
            <li
              key={c}
              className="text-sm px-3 py-1.5 rounded"
              style={{ background: C.surfaceMuted, color: C.textSecondary, border: `1px solid ${C.borderSoft}` }}
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
