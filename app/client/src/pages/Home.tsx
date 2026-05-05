import { useState, useMemo } from "react";
import KeepScene from "@/components/KeepScene";
import EstablishingShot from "@/components/EstablishingShot";
import Onboarding, { isOnboardingComplete } from "@/components/Onboarding";
import SkillsManager from "@/components/SkillsManager";
import ConfigPanel from "@/components/ConfigPanel";
import TasksPanel from "@/components/TasksPanel";
import SessionsPanel from "@/components/SessionsPanel";
import MemoryPanel from "@/components/MemoryPanel";
import { useHeroSocket } from "@/hooks/useHeroSocket";
import { STATE_COLORS, STATE_LABELS } from "@/lib/dungeonConfig";
import { FLOORS, cerebroColors as C, type FloorId, type AgentState } from "@/lib/keepConfig";
import { trpc } from "@/lib/trpc";

// ── Canonical shell nav ─────────────────────────────────────────────────────
// Per CEREBRO_TRUTH_RECONCILIATION §9: castle is a creative LAYER, the
// canonical UI shell is left-rail nav + center workspace + right context
// panel + bottom "Ask Aang…" command bar. The shell wraps everything; the
// castle lives inside the Home view of the center workspace.

type NavId =
  | "home"
  | "projects"
  | "inbox"
  | "tasks"
  | "sources"
  | "outputs"
  | "memory"
  | "automation"
  | "settings";

interface NavItem {
  id: NavId;
  label: string;
  glyph: string;       // simple monospace symbol; pixel-art icons later
  ready: boolean;      // shows live content vs Phase-X stub
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",       label: "Home",           glyph: "◆", ready: true },
  { id: "projects",   label: "Project Spaces", glyph: "▣", ready: false },
  { id: "inbox",      label: "Inbox",          glyph: "✉", ready: false },
  { id: "tasks",      label: "Tasks",          glyph: "✓", ready: true },
  { id: "sources",    label: "Sources",        glyph: "⌘", ready: false },
  { id: "outputs",    label: "Outputs",        glyph: "✦", ready: false },
  { id: "memory",     label: "Memory",         glyph: "◈", ready: true },
  { id: "automation", label: "Automation",     glyph: "⟳", ready: false },
  { id: "settings",   label: "Settings",       glyph: "⚙", ready: true },
];

type Mode = "quick" | "explore" | "build";

export default function Home() {
  const { heroes, mode: connMode, connected, log, startDemo, startLive, clearHeroes } =
    useHeroSocket();

  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete());
  const [nav, setNav] = useState<NavId>("home");
  const [floor, setFloor] = useState<FloorId>("ground");
  const [mode, setMode] = useState<Mode>("quick");
  const [askInput, setAskInput] = useState("");
  const [showSkillsManager, setShowSkillsManager] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);

  const selectedHero = useMemo(
    () => heroes.find((h) => h.id === selectedHeroId) || null,
    [heroes, selectedHeroId]
  );

  const { data: trackedProjects } = trpc.agents.trackedProjects.useQuery(undefined, { refetchInterval: 5000 });
  const { data: agentRoster } = trpc.keep.agents.useQuery();

  // Active agent for the right rail. Default Cortana (orchestrator).
  // Phase 6 wires this to the harness-resolved owner agent for the active
  // task. For now, picking the agent named on the selected hero, or Cortana.
  const activeAgentId = useMemo(() => {
    if (selectedHero) {
      const map: Record<string, string> = { warrior: "tony", mage: "gojo", cleric: "aang" };
      return map[selectedHero.heroClass] ?? "cortana";
    }
    return "cortana";
  }, [selectedHero]);

  const activeAgent = useMemo(
    () => agentRoster?.find((a) => a.id === activeAgentId),
    [agentRoster, activeAgentId]
  );

  // Map fork hero states (fighting/casting/shopping/resting) to canonical
  // AgentState (truth doc §8). Real harness wiring lands in Phase 6; this
  // stub keeps the castle reactive to live Claude Code sessions.
  const agentStates = useMemo<Record<string, AgentState>>(() => {
    const states: Record<string, AgentState> = {};
    if (heroes.length === 0) return states;
    states.cortana = "working-local";
    const classToAgent: Record<string, string> = { warrior: "tony", mage: "gojo", cleric: "aang" };
    const heroToAgent: Record<string, AgentState> = {
      idle: "idle",
      walking: "walking-to-ceremony",
      fighting: "working-local",
      casting: "working-local",
      resting: "complete",
      shopping: "loading-context",
      hurt: "validation-failed",
    };
    for (const h of heroes) {
      const a = classToAgent[h.heroClass];
      if (a) states[a] = heroToAgent[h.state] ?? "idle";
    }
    return states;
  }, [heroes]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: C.background, color: C.textPrimary, fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      <EstablishingShot />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between gap-3 px-4 py-2 shrink-0"
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
              style={{ background: connMode === "demo" ? C.accentSoft : "transparent", color: connMode === "demo" ? C.textPrimary : C.textMuted }}
            >
              Demo
            </button>
            <button
              onClick={startLive}
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ background: connMode === "live" ? C.danger : "transparent", color: connMode === "live" ? C.background : C.textMuted }}
            >
              Live
            </button>
          </div>

          <button
            onClick={() => setShowSkillsManager(true)}
            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Skills
          </button>
          <button
            onClick={clearHeroes}
            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded"
            style={{ border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            Clear
          </button>
          <button
            onClick={() => setShowLog((v) => !v)}
            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded"
            style={{
              border: `1px solid ${showLog ? C.accent : C.borderSoft}`,
              color: showLog ? C.accent : C.textSecondary,
              background: showLog ? `${C.accent}11` : "transparent",
            }}
          >
            Log
          </button>
        </div>
      </header>

      {/* ── Main: left rail + center + right context panel ─────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left rail — canonical 9 sections */}
        <nav
          className="w-48 flex flex-col shrink-0 overflow-hidden"
          style={{ background: C.backgroundSoft, borderRight: `1px solid ${C.borderSoft}` }}
        >
          <div className="flex-1 overflow-y-auto py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = nav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setNav(item.id)}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors"
                  style={{
                    background: isActive ? C.surfaceRaised : "transparent",
                    borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
                    color: isActive ? C.textPrimary : C.textSecondary,
                  }}
                >
                  <span className="text-sm" style={{ color: isActive ? C.accent : C.textMuted }}>{item.glyph}</span>
                  <span className="text-xs uppercase tracking-widest font-semibold flex-1">{item.label}</span>
                  {!item.ready && (
                    <span
                      className="text-[9px] px-1 rounded"
                      style={{ background: `${C.warning}22`, color: C.warning }}
                    >
                      stub
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div
            className="px-3 py-2 text-xs"
            style={{ borderTop: `1px solid ${C.borderSoft}`, background: C.surface, color: C.textMuted }}
          >
            {connMode === "live" ? "Live — watching ~/.claude/" : "Demo — simulated sessions"}
          </div>
        </nav>

        {/* Center workspace */}
        <main className="flex-1 relative overflow-hidden" style={{ minHeight: 0, background: C.background }}>
          {nav === "home" && (
            <HomeView
              floor={floor}
              setFloor={setFloor}
              agentStates={agentStates}
              heroesCount={heroes.length}
              connMode={connMode}
            />
          )}
          {nav === "tasks" && <PanelHost><TasksPanel onClose={() => setNav("home")} /></PanelHost>}
          {nav === "memory" && <PanelHost><MemoryPanel onClose={() => setNav("home")} /></PanelHost>}
          {nav === "settings" && <ConfigPanel onClose={() => setNav("home")} />}
          {nav === "projects" && <StubView title="Project Spaces" phase="Phase 6 — harness wiring" />}
          {nav === "inbox" && <StubView title="Inbox" phase="Phase 9 — Notion bridge full" />}
          {nav === "sources" && <StubView title="Sources" phase="Phase 8 — Surfer browser adapter" />}
          {nav === "outputs" && <StubView title="Output Library" phase="Phase 6 — harness wiring" />}
          {nav === "automation" && <StubView title="Automation" phase="Phase 6 — Piccolo workflow registry" />}

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
        </main>

        {/* Right context panel — active agent + state + sessions + Oak + perms */}
        <aside
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ background: C.backgroundSoft, borderLeft: `1px solid ${C.borderSoft}` }}
        >
          <ContextPanel
            agent={activeAgent}
            mode={mode}
            heroes={heroes}
            selectedHeroId={selectedHeroId}
            onSelectHero={setSelectedHeroId}
            connMode={connMode}
          />
        </aside>
      </div>

      {/* ── Bottom command bar — "Ask Aang…" ──────────────────────────── */}
      <CommandBar
        value={askInput}
        onChange={setAskInput}
        mode={mode}
        onModeChange={setMode}
      />

      {/* Skills Manager modal (kept as-is) */}
      {showSkillsManager && (
        <SkillsManager
          onClose={() => setShowSkillsManager(false)}
          projects={trackedProjects ?? []}
        />
      )}

      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

// ── Home view: castle scene ──────────────────────────────────────────────────
function HomeView({
  floor, setFloor, agentStates, heroesCount, connMode,
}: {
  floor: FloorId;
  setFloor: (id: FloorId) => void;
  agentStates: Record<string, AgentState>;
  heroesCount: number;
  connMode: "demo" | "live";
}) {
  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between gap-3 px-4 py-2 shrink-0"
        style={{ background: C.backgroundSoft, borderBottom: `1px solid ${C.borderSoft}` }}
      >
        <div className="flex items-center gap-1">
          {(["upper", "ground", "crypts"] as FloorId[]).map((id) => {
            const f = FLOORS[id];
            const isActive = id === floor;
            return (
              <button
                key={id}
                onClick={() => setFloor(id)}
                className="px-3 py-1.5 text-xs uppercase tracking-widest rounded transition-colors whitespace-nowrap"
                style={{
                  background: isActive ? C.surfaceRaised : "transparent",
                  color: isActive ? C.textPrimary : C.textMuted,
                  border: `1px solid ${isActive ? C.accentSoft : C.borderSoft}`,
                }}
                title={f.blurb}
              >
                {f.name}
              </button>
            );
          })}
        </div>
        <div className="text-xs uppercase tracking-widest" style={{ color: C.textMuted }}>
          The Keep
        </div>
      </div>

      <div className="flex-1 relative overflow-auto" style={{ minHeight: 0, background: C.background }}>
        <KeepScene agentStates={agentStates} />

        {heroesCount === 0 && (
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <div
              className="px-4 py-3 rounded"
              style={{
                background: `${C.background}f0`,
                border: `1px solid ${C.borderSoft}`,
                maxWidth: 240,
              }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                The Hub waits
              </div>
              <div className="text-xs mt-1 leading-relaxed" style={{ color: C.textSecondary }}>
                {connMode === "demo"
                  ? "Press Demo to spawn simulated sessions."
                  : "Start a Claude Code session in any project. The Hub orb will light when you arrive."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stub view for not-yet-built nav sections ────────────────────────────────
function StubView({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div
        className="max-w-md w-full p-6 rounded"
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: C.warning }}>
          Stub
        </div>
        <div className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>
          {title}
        </div>
        <div className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          This canonical section is in the spec but not yet wired. Slated for {phase}.
        </div>
      </div>
    </div>
  );
}

// ── Panel host: hosts existing TasksPanel/MemoryPanel which were authored as
//    bottom drawers. The host gives them a relative container so the absolute
//    children render in the workspace area instead of overlaying the castle.
function PanelHost({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-hidden" style={{ background: C.background }}>
      {children}
    </div>
  );
}

// ── Right context panel ─────────────────────────────────────────────────────
function ContextPanel({
  agent, mode, heroes, selectedHeroId, onSelectHero, connMode,
}: {
  agent: { id: string; name: string; chamber: string; role: string; floor: string; defaultModelClass: string; escalationModelClass?: string; skills: string[]; toolScope: string[] } | undefined;
  mode: Mode;
  heroes: Array<{ id: number; name: string; level: number; state: string; heroClass: string }>;
  selectedHeroId: number | null;
  onSelectHero: (id: number | null) => void;
  connMode: "demo" | "live";
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Active Agent */}
      <div
        className="px-3 py-2.5 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
          Active Agent
        </div>
        {agent ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {agent.name}
              </div>
              <div
                className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: `${C.accent}22`, color: C.accent }}
              >
                {agent.chamber}
              </div>
            </div>
            <div className="text-xs leading-snug" style={{ color: C.textSecondary }}>
              {agent.role.split(". ")[0]}.
            </div>
          </>
        ) : (
          <div className="text-xs" style={{ color: C.textMuted }}>Loading…</div>
        )}
      </div>

      {/* Mode + Model Class */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>Mode</div>
            <div className="text-xs font-semibold" style={{ color: C.textPrimary }}>{mode.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>Model</div>
            <div className="text-xs font-semibold truncate" style={{ color: C.textPrimary }} title={agent?.defaultModelClass}>
              {agent?.defaultModelClass ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Tool Permissions */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
          Tool Scope
        </div>
        {agent?.toolScope?.length ? (
          <div className="flex flex-wrap gap-1">
            {agent.toolScope.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: C.surfaceMuted, color: C.textSecondary, border: `1px solid ${C.borderSoft}` }}
              >
                {t}
              </span>
            ))}
            {agent.toolScope.length > 6 && (
              <span className="text-[10px]" style={{ color: C.textMuted }}>
                +{agent.toolScope.length - 6}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs" style={{ color: C.textMuted }}>—</div>
        )}
      </div>

      {/* Oak Validation */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
            Oak Validation
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
            Not wired
          </div>
        </div>
      </div>

      {/* Sessions list (moved from left rail) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-3 py-2 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
        >
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
        <div className="flex-1 overflow-y-auto">
          {heroes.length === 0 ? (
            <div className="p-3 text-xs leading-relaxed" style={{ color: C.textMuted }}>
              {connMode === "demo"
                ? "Press Demo to spawn simulated sessions."
                : "No active Claude Code sessions. Start one in any project."}
            </div>
          ) : (
            heroes.map((hero) => {
              const stateColor = STATE_COLORS[hero.state as keyof typeof STATE_COLORS];
              const stateLabel = STATE_LABELS[hero.state as keyof typeof STATE_LABELS];
              const isSelected = hero.id === selectedHeroId;
              return (
                <button
                  key={hero.id}
                  onClick={() => onSelectHero(isSelected ? null : hero.id)}
                  className="w-full text-left px-3 py-2 transition-colors"
                  style={{
                    background: isSelected ? C.surfaceRaised : "transparent",
                    borderBottom: `1px solid ${C.borderSoft}`,
                    borderLeft: isSelected ? `2px solid ${C.accent}` : "2px solid transparent",
                  }}
                >
                  <div className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>
                    {hero.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: stateColor }}>
                    {stateLabel}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Next Actions */}
      <div className="px-3 py-2 shrink-0" style={{ borderTop: `1px solid ${C.borderSoft}`, background: C.surface }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
          Next Actions
        </div>
        <div className="text-xs" style={{ color: C.textMuted }}>
          Wired in Phase 6.
        </div>
      </div>
    </div>
  );
}

// ── Bottom command bar ──────────────────────────────────────────────────────
function CommandBar({
  value, onChange, mode, onModeChange,
}: {
  value: string;
  onChange: (s: string) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 shrink-0"
      style={{ background: C.backgroundSoft, borderTop: `1px solid ${C.borderSoft}` }}
    >
      <div className="flex rounded overflow-hidden shrink-0" style={{ border: `1px solid ${C.borderSoft}` }}>
        {(["quick", "explore", "build"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{
              background: mode === m ? C.accentSoft : "transparent",
              color: mode === m ? C.textPrimary : C.textMuted,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask Aang…"
        className="flex-1 px-3 py-1.5 text-sm rounded outline-none"
        style={{
          background: C.surface,
          border: `1px solid ${C.borderSoft}`,
          color: C.textPrimary,
        }}
      />

      <button
        disabled
        className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded shrink-0"
        style={{ border: `1px solid ${C.borderSoft}`, color: C.textMuted, opacity: 0.6 }}
        title="Phase 6"
      >
        Attach
      </button>
      <button
        disabled
        className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded shrink-0"
        style={{ border: `1px solid ${C.borderSoft}`, color: C.textMuted, opacity: 0.6 }}
        title="Phase 6"
      >
        Create Task
      </button>
    </div>
  );
}
