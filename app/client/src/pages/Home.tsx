import { useState, useMemo } from "react";
import KeepScene from "@/components/KeepScene";
import KeepFortressBlueprint from "@/components/KeepFortressBlueprint";
import EstablishingShot from "@/components/EstablishingShot";
import SkillsManager from "@/components/SkillsManager";
import ConfigPanel from "@/components/ConfigPanel";
import TasksPanel from "@/components/TasksPanel";
import SessionsPanel from "@/components/SessionsPanel";
import MemoryPanel from "@/components/MemoryPanel";
import ArtifactsPanel from "@/components/ArtifactsPanel";
import PiccoloPanel from "@/components/PiccoloPanel";
import ProjectLabPanel from "@/components/ProjectLabPanel";
import SurferSourcesPanel from "@/components/SurferSourcesPanel";
import HedwigInboxPanel from "@/components/HedwigInboxPanel";
import TerminalLabPanel from "@/components/TerminalLabPanel";
import ApprovalDashboardPanel from "@/components/ApprovalDashboardPanel";
import WorkbenchPanel from "@/components/WorkbenchPanel";
import AangCompanionPanel from "@/components/AangCompanionPanel";
import ModelToolsPanel from "@/components/ModelToolsPanel";
import SecurityGatePanel from "@/components/SecurityGatePanel";
import PermissionModeControl from "@/components/PermissionModeControl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  | "ledger"
  | "tasks"
  | "sessions"
  | "sources"
  | "terminal"
  | "approvals"
  | "workbench"
  | "companion"
  | "model_tools"
  | "security"
  | "outputs"
  | "memory"
  | "basement"
  | "automation"
  | "settings";

type ZoneId = "keep" | "workshop" | "ledger" | "basement";

interface ZoneNavItem {
  zone: ZoneId;
  id: NavId;
  label: string;
  glyph: string;
  blurb: string;
}

interface ZoneSurface {
  id: NavId;
  label: string;
  meta: string;
}

const ZONE_NAV_ITEMS: ZoneNavItem[] = [
  { zone: "keep", id: "home", label: "Keep", glyph: "◆", blurb: "Understand what is active." },
  { zone: "workshop", id: "workbench", label: "Workshop", glyph: "▤", blurb: "Do the work with evidence." },
  { zone: "ledger", id: "ledger", label: "Ledger", glyph: "◇", blurb: "Prove what happened." },
  { zone: "basement", id: "basement", label: "Basement", glyph: "⚙", blurb: "Configure the machine." },
];

const ZONE_SURFACES: Record<ZoneId, ZoneSurface[]> = {
  keep: [
    { id: "home", label: "Keep", meta: "Agents and current state" },
    { id: "companion", label: "Aang", meta: "Human bridge" },
    { id: "inbox", label: "Capture", meta: "Hedwig intake" },
  ],
  workshop: [
    { id: "workbench", label: "Workbench", meta: "Evidence surface" },
    { id: "projects", label: "Project Lab", meta: "Local project state" },
    { id: "terminal", label: "Terminal Lab", meta: "Command previews" },
    { id: "sources", label: "Research", meta: "Source review" },
  ],
  ledger: [
    { id: "ledger", label: "Overview", meta: "Proof read" },
    { id: "tasks", label: "Tasks", meta: "Work queue" },
    { id: "sessions", label: "Sessions", meta: "Run history" },
    { id: "approvals", label: "Approvals", meta: "Waiting gates" },
    { id: "outputs", label: "Outputs", meta: "Artifacts" },
    { id: "memory", label: "Memory", meta: "Knowledge records" },
  ],
  basement: [
    { id: "basement", label: "Overview", meta: "Machine map" },
    { id: "settings", label: "Settings", meta: "Storage and app config" },
    { id: "model_tools", label: "Models", meta: "Capability proposals" },
    { id: "security", label: "Security", meta: "Spock receipts" },
    { id: "automation", label: "Automation", meta: "Piccolo watchers" },
  ],
};

const ZONE_RECEIPTS: Record<ZoneId, string[]> = {
  keep: ["state", "route", "approval"],
  workshop: ["evidence", "tools", "validation"],
  ledger: ["tasks", "sessions", "approvals", "outputs", "memory"],
  basement: ["permissions", "models", "storage"],
};

const NAV_TO_ZONE = Object.entries(ZONE_SURFACES).reduce<Record<NavId, ZoneId>>(
  (acc, [zone, surfaces]) => {
    for (const surface of surfaces) acc[surface.id] = zone as ZoneId;
    return acc;
  },
  {} as Record<NavId, ZoneId>,
);

type Mode = "quick" | "explore" | "build";

const MODE_LABELS: Record<Mode, string> = {
  quick: "Ask",
  explore: "Research",
  build: "Build",
};

const MODE_HINTS: Record<Mode, string> = {
  quick: "Aang answers or captures the next object.",
  explore: "Aang routes Surfer and Oak for source work.",
  build: "Aang routes Cortana, Tony, and Spock.",
};

const MODE_ROUTES: Record<Mode, string[]> = {
  quick: ["Aang", "Cortana"],
  explore: ["Aang", "Cortana", "Surfer", "Oak"],
  build: ["Aang", "Cortana", "Tony", "Spock"],
};

export default function Home() {
  const { heroes, mode: connMode, connected, log, startDemo, startLive, clearHeroes } =
    useHeroSocket();

  const [nav, setNav] = useState<NavId>("home");
  const [floor, setFloor] = useState<FloorId>("ground");
  const [mode, setMode] = useState<Mode>("quick");
  const [askInput, setAskInput] = useState("");
  const [showSkillsManager, setShowSkillsManager] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [showClearGate, setShowClearGate] = useState(false);

  const selectedHero = useMemo(
    () => heroes.find((h) => h.id === selectedHeroId) || null,
    [heroes, selectedHeroId]
  );

  const { data: trackedProjects } = trpc.agents.trackedProjects.useQuery(undefined, { refetchInterval: 5000 });
  const { data: agentRoster } = trpc.keep.agents.useQuery();
  const commandIntake = trpc.commandIntake.preview.useMutation();
  const utils = trpc.useUtils();
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });

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
    const states: Record<string, AgentState> = {
      // Browser/source work is disabled by default per the V1 plan. Until the
      // browser policy is wired in Settings, Surfer should read as locked.
      surfer: "dormant",
    };
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
        className="flex items-center justify-between gap-2 px-3 py-1.5 shrink-0"
        aria-label="Keep header"
        style={{ background: C.backgroundSoft, borderBottom: `1px solid ${C.borderSoft}` }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 flex items-center justify-center rounded"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.gold }}
          >
            <span className="text-base leading-none">◆</span>
          </div>
          <div>
            <h1 className="text-[13px] font-bold uppercase tracking-widest leading-none" style={{ color: C.textPrimary }}>
              CereBro
            </h1>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: C.textMuted }}>
              The Keep
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 min-w-0 items-center justify-center">
          <div
            className="flex min-w-0 items-center gap-2 rounded px-2 py-1"
            style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.gold }}>
              {ZONE_NAV_ITEMS.find((item) => item.zone === NAV_TO_ZONE[nav])?.label ?? "Keep"}
            </span>
            <span className="h-3 w-px shrink-0" style={{ background: C.borderSoft }} />
            <span className="truncate text-[11px] leading-none" style={{ color: C.textMuted }}>
              <span style={{ color: C.gold }}>Aang</span> reads. <span style={{ color: C.accentViolet }}>Cortana</span> routes. Ledger records.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <PermissionModeControl />

          <div
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded shrink-0"
            role="status"
            aria-label={`Connection status: ${connected ? "Online" : "Offline"}`}
            style={{ border: `1px solid ${C.borderSoft}`, background: C.surface }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: connected ? C.success : C.danger }} />
            <span className="hidden sm:inline text-xs font-semibold uppercase" style={{ color: connected ? C.success : C.danger }}>
              {connected ? "Online" : "Offline"}
            </span>
          </div>

          <Button
            type="button"
            onClick={() => setIsContextPanelOpen((v) => !v)}
            aria-pressed={isContextPanelOpen}
            aria-expanded={isContextPanelOpen}
            aria-label={isContextPanelOpen ? "Hide context panel" : "Show context panel"}
            className="shrink-0"
            variant={isContextPanelOpen ? "secondary" : "outline"}
            size="sm"
            style={{
              border: `1px solid ${isContextPanelOpen ? C.accent : C.borderSoft}`,
            }}
            title={isContextPanelOpen ? "Hide context panel" : "Show context panel"}
          >
            Context
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="shrink-0"
                aria-label="Open developer tools"
                variant="outline"
                size="sm"
              >
                Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Session</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={startDemo}>
                  Demo
                  <span className="ml-auto text-[10px]" style={{ color: connMode === "demo" ? C.accent : C.textMuted }}>
                    {connMode === "demo" ? "active" : "start"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={startLive}>
                  Live
                  <span className="ml-auto text-[10px]" style={{ color: connMode === "live" ? C.danger : C.textMuted }}>
                    {connMode === "live" ? "active" : "watch"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tools</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setShowSkillsManager(true)}>
                  Skills
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowLog((v) => !v)}>
                  {showLog ? "Hide Log" : "Show Log"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Risk</DropdownMenuLabel>
              <DropdownMenuItem variant="destructive" onSelect={() => setShowClearGate(true)}>
                Clear Sessions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Main: left rail + center + right context panel ─────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left rail — four-zone OS dock */}
        <nav
          className="w-12 lg:w-44 flex flex-col shrink-0 overflow-hidden"
          aria-label="CereBro zones"
          style={{ background: C.backgroundSoft, borderRight: `1px solid ${C.borderSoft}` }}
        >
          <div className="flex-1 overflow-y-auto py-1.5">
            {ZONE_NAV_ITEMS.map((item) => {
              const isActive = NAV_TO_ZONE[nav] === item.zone;
              return (
                <Button
                  key={item.zone}
                  type="button"
                  onClick={() => setNav(item.id)}
                  aria-label={`Open ${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  className="h-auto w-full justify-start rounded-none px-2.5 py-2 text-left"
                  variant="ghost"
                  style={{
                    background: isActive ? C.surfaceRaised : "transparent",
                    borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
                    color: isActive ? C.textPrimary : C.textSecondary,
                  }}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-sm"
                    style={{
                      background: isActive ? C.surfaceMuted : "transparent",
                      color: isActive ? C.accent : C.textMuted,
                      border: `1px solid ${isActive ? C.borderSoft : "transparent"}`,
                    }}
                  >
                    {item.glyph}
                  </span>
                  <span className="hidden lg:block min-w-0">
                    <span className="block text-[11px] uppercase tracking-widest font-semibold">{item.label}</span>
                    <span className="hidden xl:block text-[10px] leading-snug mt-0.5 normal-case tracking-normal" style={{ color: C.textMuted }}>
                      {item.blurb}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
          <div
            className="px-2.5 py-1.5 text-[10px] leading-snug hidden lg:block"
            style={{ borderTop: `1px solid ${C.borderSoft}`, background: C.surface, color: C.textMuted }}
          >
            {connMode === "live" ? "Live. Watching ~/.claude/." : "Demo. Simulated sessions."}
          </div>
        </nav>

        {/* Center workspace */}
        <main className="flex-1 flex flex-col overflow-hidden" aria-label="CereBro workspace" style={{ minHeight: 0, background: C.background }}>
          <ZoneHeader nav={nav} onNavigate={setNav} />

          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
            {nav === "home" && (
              <HomeView
                floor={floor}
                setFloor={setFloor}
              agentStates={agentStates}
              heroesCount={heroes.length}
              connMode={connMode}
              onNavigate={setNav}
            />
            )}
            {nav === "ledger" && <LedgerOverview onNavigate={setNav} />}
            {nav === "tasks" && <PanelHost><TasksPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "sessions" && <PanelHost><SessionsPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "memory" && <PanelHost><MemoryPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "basement" && <BasementOverview onNavigate={setNav} />}
            {nav === "settings" && <ConfigPanel onClose={() => setNav("home")} />}
            {nav === "projects" && <PanelHost><ProjectLabPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "inbox" && <PanelHost><HedwigInboxPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "sources" && <PanelHost><SurferSourcesPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "terminal" && <PanelHost><TerminalLabPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "approvals" && <PanelHost><ApprovalDashboardPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "workbench" && <PanelHost><WorkbenchPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "companion" && <PanelHost><AangCompanionPanel onClose={() => setNav("home")} onNavigate={(route) => setNav(route)} /></PanelHost>}
            {nav === "model_tools" && <PanelHost><ModelToolsPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "security" && <PanelHost><SecurityGatePanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "outputs" && <PanelHost><ArtifactsPanel onClose={() => setNav("home")} /></PanelHost>}
            {nav === "automation" && <PanelHost><PiccoloPanel onClose={() => setNav("home")} /></PanelHost>}

            {showLog && (
              <div
                className="absolute bottom-0 left-0 right-0 h-40 overflow-y-auto p-3"
                style={{ background: `${C.background}f5`, borderTop: `1px solid ${C.borderSoft}` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                    Activity
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowLog(false)}
                    aria-label="Close activity log"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    style={{ color: C.textMuted }}
                  >
                    Close
                  </Button>
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
        </main>

        {/* Right context panel — active agent + state + sessions + Oak + perms */}
        {isContextPanelOpen && (
          <aside
            className="w-[270px] shrink-0 flex flex-col overflow-hidden"
            aria-label="Context panel"
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
        )}
      </div>

      {/* ── Bottom command bar — "Ask Aang…" ──────────────────────────── */}
      {commandIntake.data && (
        <IntakePreview
          result={commandIntake.data}
          onDismiss={() => commandIntake.reset()}
          isCreatingTask={createTask.isPending}
          taskCreated={Boolean(createTask.data)}
          onNavigate={setNav}
          onCreateTask={() => {
            const draft = commandIntake.data?.taskDraft;
            if (!draft || createTask.isPending) return;
            createTask.mutate(
              {
                title: draft.title,
                agent: draft.agent,
                projectName: draft.projectName ?? undefined,
                projectPath: draft.projectPath ?? undefined,
              },
              {
                onSuccess: () => {
                  setAskInput("");
                  setNav("tasks");
                },
              },
            );
          }}
        />
      )}
      <CommandBar
        value={askInput}
        onChange={setAskInput}
        mode={mode}
        onModeChange={setMode}
        onNavigate={setNav}
        isClassifying={commandIntake.isPending}
        onSubmit={() => {
          const text = askInput.trim();
          if (!text || commandIntake.isPending) return;
          commandIntake.mutate({ text, mode });
        }}
      />

      {/* Skills Manager modal (kept as-is) */}
      {showSkillsManager && (
        <SkillsManager
          onClose={() => setShowSkillsManager(false)}
          projects={trackedProjects ?? []}
        />
      )}

      <Dialog open={showClearGate} onOpenChange={setShowClearGate}>
        <DialogContent gate showCloseButton>
          <DialogHeader>
            <DialogTitle>Clear Visible Sessions</DialogTitle>
            <DialogDescription>
              This clears the local session sprites from the Keep view. It does not delete saved Ledger records.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded p-3 text-xs" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.warning }}>
              Target
            </div>
            <div style={{ color: C.textPrimary }}>
              {heroes.length} visible session{heroes.length === 1 ? "" : "s"}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowClearGate(false)}
              variant="outline"
              size="sm"
              style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                clearHeroes();
                setShowClearGate(false);
              }}
              variant="destructive"
              size="sm"
              style={{ background: `${C.danger}22`, border: `1px solid ${C.danger}66`, color: C.danger }}
            >
              Clear View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ── Home view: castle scene ──────────────────────────────────────────────────
function HomeView({
  floor, setFloor, agentStates, heroesCount, connMode, onNavigate,
}: {
  floor: FloorId;
  setFloor: (id: FloorId) => void;
  agentStates: Record<string, AgentState>;
  heroesCount: number;
  connMode: "demo" | "live";
  onNavigate: (id: NavId) => void;
}) {
  const [keepView, setKeepView] = useState<"scene" | "blueprint">("blueprint");
  const activeAgents = Object.values(agentStates).filter((state) => state && state !== "idle" && state !== "dormant").length;

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5 shrink-0"
        style={{ background: C.backgroundSoft, borderBottom: `1px solid ${C.borderSoft}` }}
      >
        <div className="flex items-center gap-1">
          {(["upper", "ground", "crypts"] as FloorId[]).map((id) => {
            const f = FLOORS[id];
            const isActive = id === floor;
            return (
              <Button
                key={id}
                type="button"
                onClick={() => setFloor(id)}
                aria-pressed={isActive}
                aria-label={`Show ${f.name}`}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5"
                style={{
                  background: isActive ? C.surfaceRaised : "transparent",
                  color: isActive ? C.textPrimary : C.textMuted,
                  border: `1px solid ${isActive ? C.accentSoft : C.borderSoft}`,
                }}
                title={f.blurb}
              >
                {f.name}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded overflow-hidden" style={{ border: `1px solid ${C.borderSoft}` }}>
            {(["blueprint", "scene"] as const).map((id) => {
              const isActive = keepView === id;
              return (
                <Button
                  key={id}
                  type="button"
                  onClick={() => setKeepView(id)}
                  aria-pressed={isActive}
                  aria-label={`Show Keep ${id} view`}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 rounded-none px-2"
                  style={{
                    background: isActive ? C.surfaceRaised : "transparent",
                    color: isActive ? C.textPrimary : C.textMuted,
                  }}
                >
                  {id === "blueprint" ? "Blueprint" : "Scene"}
                </Button>
              );
            })}
          </div>
          <div className="hidden sm:block text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
            The Keep
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0, background: C.background }}>
        {keepView === "blueprint" ? (
          <KeepFortressBlueprint />
        ) : (
          <KeepScene agentStates={agentStates} />
        )}

        <KeepHomeDock
          activeAgents={activeAgents}
          heroesCount={heroesCount}
          onNavigate={onNavigate}
        />

        {keepView === "scene" && heroesCount === 0 && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <div
              className="px-3 py-2 rounded"
              style={{
                background: `${C.background}f0`,
                border: `1px solid ${C.borderSoft}`,
                maxWidth: 220,
              }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                The Hub waits
              </div>
              <div className="text-[11px] mt-1 leading-relaxed" style={{ color: C.textSecondary }}>
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

function KeepHomeDock({
  activeAgents,
  heroesCount,
  onNavigate,
}: {
  activeAgents: number;
  heroesCount: number;
  onNavigate: (id: NavId) => void;
}) {
  const actions: Array<{
    label: string;
    meta: string;
    value: string;
    tone: string;
    target: NavId;
  }> = [
    {
      label: "Evidence",
      meta: "Open Workshop",
      value: "Workbench",
      tone: C.accent,
      target: "workbench",
    },
    {
      label: "Resume",
      meta: "Active work",
      value: heroesCount > 0 ? `${heroesCount} session${heroesCount === 1 ? "" : "s"}` : "No sessions",
      tone: heroesCount > 0 ? C.success : C.textMuted,
      target: "projects",
    },
    {
      label: "Approvals",
      meta: "Waiting gates",
      value: "Review",
      tone: C.warning,
      target: "approvals",
    },
    {
      label: "Capture",
      meta: "Hedwig intake",
      value: "Inbox",
      tone: C.gold,
      target: "inbox",
    },
  ];

  return (
    <div className="absolute left-2.5 right-2.5 bottom-2.5 pointer-events-none">
      <div
        className="pointer-events-auto grid grid-cols-2 lg:grid-cols-[0.95fr_repeat(4,1fr)] gap-1.5 rounded p-1.5"
        style={{ background: `${C.background}e8`, border: `1px solid ${C.borderSoft}` }}
        aria-label="Keep first actions"
      >
        <div className="hidden lg:block px-2 py-1">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
            Keep State
          </div>
          <div className="text-xs font-semibold mt-1" style={{ color: C.textPrimary }}>
            {activeAgents > 0 ? `${activeAgents} chamber${activeAgents === 1 ? "" : "s"} moving` : "Calm watch"}
          </div>
          <div className="hidden xl:block text-[10px] leading-snug mt-1" style={{ color: C.textMuted }}>
            Ask through Aang. Cortana routes the work.
          </div>
        </div>

        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            onClick={() => onNavigate(action.target)}
            aria-label={`${action.label}: ${action.meta}`}
            variant="outline"
            className="h-auto justify-start whitespace-normal px-2 py-1.5 text-left"
            style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
          >
            <span className="block w-full min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: action.tone }}>
                  {action.label}
                </span>
                <span className="hidden xl:inline text-[10px]" style={{ color: C.textMuted }}>
                  {action.meta}
                </span>
              </span>
              <span className="block truncate text-[11px] font-semibold mt-1" style={{ color: C.textPrimary }}>
                {action.value}
              </span>
            </span>
          </Button>
        ))}
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

function ZoneHeader({ nav, onNavigate }: { nav: NavId; onNavigate: (id: NavId) => void }) {
  const zone = NAV_TO_ZONE[nav];
  const zoneItem = ZONE_NAV_ITEMS.find((item) => item.zone === zone) ?? ZONE_NAV_ITEMS[0];
  const surfaces = ZONE_SURFACES[zone];
  const receipts = ZONE_RECEIPTS[zone];

  return (
    <div
      className="shrink-0 px-2.5 py-1.5 flex items-center gap-2 overflow-hidden"
      style={{ background: C.backgroundSoft, borderBottom: `1px solid ${C.borderSoft}` }}
    >
      <div className="hidden xl:flex min-w-[150px] items-center gap-2">
        <div className="h-7 w-1 rounded-full" style={{ background: C.accent }} />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            {zoneItem.label}
          </div>
          <div className="truncate text-[10px] leading-snug mt-0.5" style={{ color: C.textMuted }}>
            {zoneItem.blurb}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-stretch gap-1 overflow-x-auto" role="group" aria-label={`${zoneItem.label} surfaces`}>
        {surfaces.map((surface) => {
          const isActive = nav === surface.id;
          return (
            <Button
              key={surface.id}
              type="button"
              onClick={() => onNavigate(surface.id)}
              aria-pressed={isActive}
              aria-label={`Open ${surface.label}`}
              className="h-8 shrink-0 justify-start whitespace-normal px-2 text-left"
              variant={isActive ? "secondary" : "outline"}
              style={{
                background: isActive ? C.surfaceRaised : C.surface,
                color: isActive ? C.textPrimary : C.textSecondary,
                border: `1px solid ${isActive ? C.accentSoft : C.borderSoft}`,
              }}
              title={surface.meta}
            >
              <span className="block min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider leading-none">
                  {surface.label}
                </span>
                <span className="hidden xl:block text-[10px] leading-none mt-1" style={{ color: C.textMuted }}>
                  {surface.meta}
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <div className="hidden 2xl:flex items-center gap-1.5 shrink-0" aria-label={`${zoneItem.label} receipt types`}>
        {receipts.map((receipt) => (
          <Badge
            key={receipt}
            variant={zone === "ledger" ? "warning" : "secondary"}
            className="px-1.5 py-0.5"
            style={{ color: zone === "ledger" ? C.gold : C.textMuted, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
          >
            {receipt}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function LedgerOverview({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const tasks = trpc.tasks.list.useQuery(undefined, { refetchInterval: 10000 });
  const sessions = trpc.sessions.list.useQuery({ limit: 50 }, { refetchInterval: 5000 });
  const approvals = trpc.approvals.list.useQuery({
    status: "pending",
    origin: "all",
    limit: 50,
  });
  const outputs = trpc.artifacts.list.useQuery({ limit: 50 });
  const memory = trpc.memory.list.useQuery({});
  const proposals = trpc.memory.proposals.useQuery({ limit: 50 });

  const taskRows = tasks.data ?? [];
  const sessionRows = sessions.data ?? [];
  const approvalRows = approvals.data?.items ?? [];
  const outputRows = outputs.data ?? [];
  const memoryRows = memory.data ?? [];
  const proposalRows = proposals.data ?? [];
  const activeSessions = sessionRows.filter((session) => session.endedAt == null).length;
  const openTasks = taskRows.filter((task) => task.status === "open" || task.status === "in_progress").length;

  const cards = [
    {
      label: "Tasks",
      value: String(openTasks),
      meta: `${taskRows.length} total work records`,
      target: "tasks" as NavId,
      tone: C.warning,
    },
    {
      label: "Sessions",
      value: String(activeSessions),
      meta: `${sessionRows.length} recent runs`,
      target: "sessions" as NavId,
      tone: C.success,
    },
    {
      label: "Approvals",
      value: String(approvalRows.length),
      meta: "pending gates",
      target: "approvals" as NavId,
      tone: approvalRows.length > 0 ? C.warning : C.textMuted,
    },
    {
      label: "Outputs",
      value: String(outputRows.length),
      meta: "artifact receipts",
      target: "outputs" as NavId,
      tone: C.gold,
    },
    {
      label: "Memory",
      value: String(memoryRows.length),
      meta: `${proposalRows.length} proposed`,
      target: "memory" as NavId,
      tone: C.accent,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-3" style={{ background: C.background }} aria-label="Ledger overview">
      <div className="grid gap-3">
        <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Ledger Overview
              </h2>
              <p className="text-[11px] leading-relaxed mt-1 max-w-2xl" style={{ color: C.textMuted }}>
                Proof before summary. This surface gathers the local records that show what was asked, what ran, what needs approval, what was saved, and what CereBro thinks it knows.
              </p>
            </div>
            <Badge variant="warning" className="px-2 py-0.5" style={{ color: C.gold, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              local receipts
            </Badge>
          </div>
        </section>

        <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-5" aria-label="Ledger proof objects">
          {cards.map((card) => (
            <Button
              key={card.label}
              type="button"
              onClick={() => onNavigate(card.target)}
              aria-label={`Open ${card.label}`}
              title={card.meta}
              variant="outline"
              className="h-auto justify-start whitespace-normal p-2.5 text-left"
              style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
            >
              <span className="block w-full min-w-0">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: card.tone }}>
                    {card.label}
                  </span>
                  <span className="text-base font-semibold leading-none" style={{ color: C.textPrimary }}>
                    {card.value}
                  </span>
                </span>
                <span className="block text-[11px] leading-snug mt-1.5" style={{ color: C.textMuted }}>
                  {card.meta}
                </span>
              </span>
            </Button>
          ))}
        </section>

        <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Receipt Rules
          </div>
          <div className="grid gap-2 mt-2 md:grid-cols-3">
            <LedgerRule title="External action" body="Needs an approval receipt before it runs." tone={C.warning} />
            <LedgerRule title="Memory" body="Needs source, approval, and Oak status before truth." tone={C.accent} />
            <LedgerRule title="Output" body="Needs owner, destination, write policy, and artifact path." tone={C.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}

function LedgerRule({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className="rounded px-2.5 py-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: tone }}>
        {title}
      </div>
      <div className="text-[11px] leading-snug mt-1" style={{ color: C.textMuted }}>
        {body}
      </div>
    </div>
  );
}

function BasementOverview({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const connection = trpc.agents.connectionStatus.useQuery(undefined, { refetchInterval: 10000 });
  const modelPolicy = trpc.modelTools.policy.useQuery();
  const piccolo = trpc.piccolo.hygieneReport.useQuery(undefined, { refetchInterval: 10000 });
  const security = trpc.securityGate.recent.useQuery({ limit: 20 }, { refetchInterval: 10000 });
  const status = connection.data;
  const hygiene = piccolo.data;
  const securityRows = security.data?.items ?? [];
  const riskyReceipts = securityRows.filter((item) => item.riskLevel === "high" || item.riskLevel === "blocked").length;
  const latestRisk = securityRows[0]?.riskLevel ?? "none";

  const cards = [
    {
      label: "Settings",
      value: status?.claudeExists ? "Ready" : "Setup",
      meta: "Bridge and local watcher",
      target: "settings" as NavId,
      tone: status?.claudeExists ? C.success : C.warning,
    },
    {
      label: "Models",
      value: modelPolicy.data?.mode ?? "proposal",
      meta: "Capability registry",
      target: "model_tools" as NavId,
      tone: C.accent,
    },
    {
      label: "Security",
      value: riskyReceipts > 0 ? `${riskyReceipts} risk` : latestRisk,
      meta: `${securityRows.length} Spock receipt${securityRows.length === 1 ? "" : "s"}`,
      target: "security" as NavId,
      tone: riskyReceipts > 0 ? C.danger : securityRows.length > 0 ? C.success : C.textMuted,
    },
    {
      label: "Automation",
      value: hygiene?.mode ?? "read only",
      meta: "Piccolo storage scan",
      target: "automation" as NavId,
      tone: C.gold,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-3" style={{ background: C.background }} aria-label="Basement overview">
      <div className="grid gap-3">
        <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Basement Overview
              </h2>
              <p className="text-[11px] leading-relaxed mt-1 max-w-2xl" style={{ color: C.textMuted }}>
                Machine configuration lives here. Providers, bridge state, model/tool proposals, storage hygiene, permissions, and automation stay out of the daily Keep until needed.
              </p>
            </div>
            <Badge variant="warning" className="px-2 py-0.5" style={{ color: C.gold, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              configuration
            </Badge>
          </div>
        </section>

        <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4" aria-label="Basement configuration map">
          {cards.map((card) => (
            <Button
              key={card.label}
              type="button"
              onClick={() => onNavigate(card.target)}
              aria-label={`Open ${card.label}`}
              title={card.meta}
              variant="outline"
              className="h-auto justify-start whitespace-normal p-2.5 text-left"
              style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textSecondary }}
            >
              <span className="block w-full min-w-0">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: card.tone }}>
                    {card.label}
                  </span>
                  <span className="max-w-28 truncate text-xs font-semibold uppercase leading-none" style={{ color: C.textPrimary }}>
                    {card.value}
                  </span>
                </span>
                <span className="block text-[11px] leading-snug mt-1.5" style={{ color: C.textMuted }}>
                  {card.meta}
                </span>
              </span>
            </Button>
          ))}
        </section>

        <section className="rounded p-3" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Configuration Rules
          </div>
          <div className="grid gap-2 mt-2 md:grid-cols-3">
            <LedgerRule title="Secrets" body="Tokens, keys, and account grants need explicit approval." tone={C.danger} />
            <LedgerRule title="Models" body="Capability proposals do not call providers by themselves." tone={C.accent} />
            <LedgerRule title="Automation" body="Watchers report first. Writes and cleanup stay gated." tone={C.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}

function IntakePreview({
  result,
  onDismiss,
  onCreateTask,
  onNavigate,
  isCreatingTask,
  taskCreated,
}: {
  result: {
    mode: string;
    originalText: string;
    category: string;
    projectMode: string | null;
    project: { slug: string; label: string; localPath: string } | null;
    agents: string[];
    routeChain: string[];
    designProtocol: {
      required: boolean;
      checklist: string[];
      ownerAgent: string;
      route: string;
    } | null;
    promptHandoffSuggestions: Array<{
      artifactId: number;
      title: string;
      kind: string;
      storagePath: string;
      sourceUri: string | null;
      promptPreview: string | null;
      why: string;
      requiredDisclosure: string;
    }>;
    permissionGates: string[];
    nextStep: string;
    taskDraft: { title: string; agent: string; projectName: string | null; projectPath: string | null };
  };
  onDismiss: () => void;
  onCreateTask: () => void;
  onNavigate: (id: NavId) => void;
  isCreatingTask: boolean;
  taskCreated: boolean;
}) {
  const securityTarget = securityTargetFor(result.originalText);
  const needsSecurity = result.category === "security_review" || securityTarget != null;

  function openSecurityGate() {
    if (securityTarget) {
      try {
        window.sessionStorage.setItem("cerebro:security-target", securityTarget);
      } catch {
        // Ignore storage failures. Navigation still opens the manual form.
      }
    }
    onNavigate("security");
  }

  return (
    <div className="px-3 py-2 shrink-0" style={{ background: C.backgroundSoft, borderTop: `1px solid ${C.borderSoft}` }}>
      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)_auto] gap-2 rounded p-2"
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <PreviewChip label={result.mode.replace(/_/g, " ")} tone={C.textSecondary} />
            <PreviewChip label={result.category.replace(/_/g, " ")} tone={C.accent} />
            {result.project && <PreviewChip label={result.project.label} tone={C.gold} />}
            {result.projectMode && <PreviewChip label={result.projectMode} tone={C.success} />}
          </div>
          <div className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
            {result.nextStep}
          </div>
          <div className="mt-2 flex flex-wrap gap-1" aria-label="Aang Cortana route chain">
            {result.routeChain.map((step, index) => (
              <PreviewChip key={`${step}-${index}`} label={`${index + 1}. ${step}`} tone={index === 0 ? C.gold : index === 1 ? C.accentViolet : C.textSecondary} />
            ))}
          </div>
          {result.promptHandoffSuggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                Reusable Memory
              </div>
              {result.promptHandoffSuggestions.map((suggestion) => (
                <div
                  key={suggestion.artifactId}
                  className="rounded px-2 py-1"
                  style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <PreviewChip label={suggestion.kind.replace(/_/g, " ")} tone={C.gold} />
                    <span className="text-[11px] font-semibold truncate" style={{ color: C.textPrimary }}>
                      {suggestion.title}
                    </span>
                  </div>
                  <div className="text-[11px] leading-snug mt-1" style={{ color: C.textMuted }}>
                    {suggestion.why}
                  </div>
                  <div className="text-[10px] leading-snug mt-1" style={{ color: C.textMuted }}>
                    {suggestion.requiredDisclosure}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
            Agents
          </div>
          <div className="flex flex-wrap gap-1">
            {result.agents.map((agent) => (
              <PreviewChip key={agent} label={agent} tone={agent === "batman" ? C.warning : C.textSecondary} />
            ))}
          </div>
          {result.designProtocol && (
            <div className="mt-2 rounded px-2 py-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex flex-wrap gap-1 mb-1">
                <PreviewChip label="design review required" tone={C.warning} />
                <PreviewChip label={result.designProtocol.ownerAgent} tone={C.accent} />
              </div>
              <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                {result.designProtocol.checklist[0]}
              </div>
            </div>
          )}
          {needsSecurity && (
            <div className="mt-2 rounded px-2 py-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex flex-wrap items-center gap-1 mb-1">
                <PreviewChip label="spock receipt" tone={C.warning} />
                <PreviewChip label="no browser" tone={C.danger} />
              </div>
              <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                {securityTarget ? `Target detected: ${securityLabel(securityTarget)}` : "Security review requested before browser, clone, install, download, or execution."}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="hidden xl:block max-w-sm">
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
              Gates
            </div>
            <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
              {result.permissionGates[0]}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {needsSecurity && (
              <Button
                type="button"
                onClick={openSecurityGate}
                aria-label="Open Security Gate with this target"
                variant="risk"
                size="sm"
                className="h-7 px-2"
                title={securityTarget ?? "Open Security Gate"}
              >
                Security Gate
              </Button>
            )}
            <Button
              type="button"
              onClick={onCreateTask}
              disabled={isCreatingTask}
              aria-label={taskCreated ? "Task saved" : isCreatingTask ? "Saving task" : `Create task: ${result.taskDraft.title}`}
              variant={taskCreated ? "secondary" : "default"}
              size="sm"
              className="h-7 px-2"
              style={{ color: taskCreated ? C.success : isCreatingTask ? C.textMuted : C.accent }}
              title={result.taskDraft.title}
            >
              {taskCreated ? "Task Saved" : isCreatingTask ? "Saving" : "Create Task"}
            </Button>
            <Button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss intake preview"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              style={{ color: C.textMuted }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function securityTargetFor(text: string) {
  const match = text.match(/https?:\/\/[^\s"'<>]+|github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+|npm:[^\s"'<>]+|pypi:[^\s"'<>]+/i);
  return match?.[0] ?? null;
}

function securityLabel(target: string) {
  try {
    const parsed = new URL(target.startsWith("http") ? target : `https://${target}`);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`.slice(0, 80);
  } catch {
    return target.slice(0, 80);
  }
}

function PreviewChip({ label, tone }: { label: string; tone: string }) {
  return (
    <Badge
      variant="secondary"
      className="px-1.5 py-0.5"
      style={{ color: tone, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
    >
      {label}
    </Badge>
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
        className="px-2.5 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
      >
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
          Active Agent
        </div>
        {agent ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[13px] font-semibold" style={{ color: C.textPrimary }}>
                {agent.name}
              </div>
              <Badge
                variant="violet"
                className="px-1.5 py-0.5"
                style={{ background: `${C.accent}22`, color: C.accent }}
              >
                {agent.chamber}
              </Badge>
            </div>
            <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
              {agent.role.split(". ")[0]}.
            </div>
          </>
        ) : (
          <div className="text-xs" style={{ color: C.textMuted }}>Loading…</div>
        )}
      </div>

      {/* Mode + Model Class */}
      <div className="px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
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
      <div className="px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
          Tool Scope
        </div>
        {agent?.toolScope?.length ? (
          <div className="flex flex-wrap gap-1">
            {agent.toolScope.slice(0, 6).map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="px-1.5 py-0.5"
                style={{ background: C.surfaceMuted, color: C.textSecondary, border: `1px solid ${C.borderSoft}` }}
              >
                {t}
              </Badge>
            ))}
            {agent.toolScope.length > 6 && (
              <Badge variant="outline" className="px-1.5 py-0.5" style={{ color: C.textMuted }}>
                +{agent.toolScope.length - 6}
              </Badge>
            )}
          </div>
        ) : (
          <div className="text-xs" style={{ color: C.textMuted }}>—</div>
        )}
      </div>

      {/* Oak Validation */}
      <div className="px-2.5 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
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
          className="px-2.5 py-1.5 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${C.borderSoft}`, background: C.surface }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            Sessions
          </span>
          <Badge
            variant={heroes.length > 0 ? "violet" : "secondary"}
            className="px-1.5 py-0.5"
            style={{
              background: heroes.length > 0 ? `${C.accent}22` : C.surfaceMuted,
              color: heroes.length > 0 ? C.accent : C.textMuted,
              border: `1px solid ${C.borderSoft}`,
            }}
          >
            {heroes.length}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto">
          {heroes.length === 0 ? (
            <div className="p-2.5 text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
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
                <Button
                  key={hero.id}
                  type="button"
                  onClick={() => onSelectHero(isSelected ? null : hero.id)}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? "Deselect" : "Select"} session ${hero.name}`}
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-none px-2.5 py-1.5 text-left whitespace-normal"
                  style={{
                    background: isSelected ? C.surfaceRaised : "transparent",
                    borderBottom: `1px solid ${C.borderSoft}`,
                    borderLeft: isSelected ? `2px solid ${C.accent}` : "2px solid transparent",
                  }}
                >
                  <span className="block min-w-0">
                    <span className="block truncate text-xs font-semibold" style={{ color: C.textPrimary }}>
                      {hero.name}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider mt-0.5" style={{ color: stateColor }}>
                      {stateLabel}
                    </span>
                  </span>
                </Button>
              );
            })
          )}
        </div>
      </div>

      {/* Next Actions */}
      <div className="px-2.5 py-1.5 shrink-0" style={{ borderTop: `1px solid ${C.borderSoft}`, background: C.surface }}>
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
  value, onChange, mode, onModeChange, onNavigate, onSubmit, isClassifying,
}: {
  value: string;
  onChange: (s: string) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onNavigate: (id: NavId) => void;
  onSubmit: () => void;
  isClassifying: boolean;
}) {
  const security = trpc.securityGate.recent.useQuery({ limit: 1 }, { refetchInterval: 10000 });
  const latestReceipt = security.data?.items[0] ?? null;
  const latestRiskTone = latestReceipt == null
    ? C.textMuted
    : latestReceipt.riskLevel === "blocked" || latestReceipt.riskLevel === "high"
      ? C.danger
      : latestReceipt.riskLevel === "medium"
        ? C.warning
        : C.success;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2 px-2.5 py-1.5 shrink-0"
      aria-label="Ask Aang command bar"
      style={{ background: C.backgroundSoft, borderTop: `1px solid ${C.borderSoft}` }}
    >
      <div className="flex rounded overflow-hidden shrink-0" role="group" aria-label="Command mode" style={{ border: `1px solid ${C.borderSoft}` }}>
        {(["quick", "explore", "build"] as Mode[]).map((m) => (
          <Button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
            aria-label={`Set command mode to ${m}`}
            variant={mode === m ? "secondary" : "ghost"}
            size="sm"
            className="h-7 rounded-none px-2"
            style={{
              background: mode === m ? C.accentSoft : "transparent",
              color: mode === m ? C.textPrimary : C.textMuted,
            }}
          >
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            aria-label="Ask Aang command input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask Aang. Cortana routes it."
            className="h-7 flex-1 min-w-0"
            style={{
              background: C.surface,
              border: `1px solid ${C.borderSoft}`,
              color: C.textPrimary,
            }}
          />
        </div>
        <div className="hidden 2xl:flex items-center gap-1.5 mt-1 text-[10px]" style={{ color: C.textMuted }}>
          <span style={{ color: C.gold }}>Aang</span>
          <span>reads {MODE_LABELS[mode]}.</span>
          <span style={{ color: C.accentViolet }}>Cortana</span>
          <span>{MODE_HINTS[mode]}</span>
        </div>
      </div>

      <div className="hidden xl:block shrink-0 w-48">
        <div className="text-[10px] uppercase tracking-wider leading-none mb-1" style={{ color: C.textMuted }}>
          Route Preview
        </div>
        <div className="flex flex-wrap gap-1">
          {MODE_ROUTES[mode].map((agent, index) => (
            <Badge
              key={agent}
              variant={index === 0 ? "warning" : index === 1 ? "violet" : "secondary"}
              className="px-1.5 py-0.5"
              style={{
                color: index === 0 ? C.gold : index === 1 ? C.accentViolet : C.textSecondary,
                background: C.surfaceMuted,
                border: `1px solid ${C.borderSoft}`,
              }}
            >
              {agent}
            </Badge>
          ))}
        </div>
        <div className="text-[10px] leading-none mt-1" style={{ color: C.warning }}>
          Preview only. Gates stay closed.
        </div>
      </div>

      <Button
        type="button"
        onClick={() => onNavigate("security")}
        aria-label="Open latest Security Gate receipt"
        variant="outline"
        size="sm"
        className="hidden h-7 shrink-0 px-2 lg:block"
        style={{ border: `1px solid ${C.borderSoft}`, color: latestRiskTone, background: C.surface }}
        title={latestReceipt ? latestReceipt.targetUri : "No security receipts recorded"}
      >
        {latestReceipt ? `Spock ${latestReceipt.riskLevel}` : "Spock clear"}
      </Button>

      <Button
        type="button"
        disabled
        aria-label="Attach artifact unavailable until Phase 6"
        variant="secondary"
        size="sm"
        className="hidden h-7 shrink-0 px-2 sm:block"
        style={{ border: `1px solid ${C.borderSoft}`, color: C.textMuted, opacity: 0.6 }}
        title="Phase 6"
      >
        Attach
      </Button>
      <Button
        type="submit"
        disabled={!value.trim() || isClassifying}
        aria-label={isClassifying ? "Reading command intent" : "Preview command routing"}
        variant={value.trim() && !isClassifying ? "secondary" : "outline"}
        size="sm"
        className="hidden h-7 shrink-0 px-2 md:block"
        style={{
          border: `1px solid ${C.borderSoft}`,
          color: value.trim() && !isClassifying ? C.textPrimary : C.textMuted,
          background: value.trim() && !isClassifying ? C.accentSoft : "transparent",
          opacity: value.trim() && !isClassifying ? 1 : 0.6,
        }}
        title="Preview routing"
      >
        {isClassifying ? "Reading" : "Preview"}
      </Button>
    </form>
  );
}
