import { useEffect, useState, useMemo } from "react";
import { Castle, Hammer, ScrollText, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { CompactReadDatum } from "@/components/CompactReadDatum";
import { Input } from "@/components/ui/input";
import { useHeroSocket } from "@/hooks/useHeroSocket";
import { STATE_COLORS, STATE_LABELS } from "@/lib/dungeonConfig";
import { compactCommandLabel, sourceDisplayName } from "@/lib/displayLabels";
import { homeShellCopy, homeShellNextActionCopy } from "@/lib/homeShellCopyModel";
import { FLOORS, cerebroColors as C, cerebroTheme as T, type FloorId, type AgentState } from "@/lib/keepConfig";
import { ledgerKindLabel, ledgerNavCopy, ledgerOverviewCopy, ledgerReceiptSummary, ledgerRouteText } from "@/lib/ledgerCopyModel";
import { isExactRavenSealedLauncherPhrase, ravenSealedLauncherUrl } from "@/lib/ravenSealedLauncher";
import { routeActionModel, routeExecutionReadinessProofModel, routePreviewActionModel, routePreviewProofModel, routeReceiptContractProofModel, type RouteAction } from "@/lib/routeActionModel";
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
  Icon: LucideIcon;
  blurb: string;
}

interface ZoneSurface {
  id: NavId;
  label: string;
  meta: string;
}

const shellCopy = homeShellCopy();

const ZONE_NAV_ITEMS: ZoneNavItem[] = [
  { zone: "keep", id: "home", label: "Keep", Icon: Castle, blurb: "Understand what is active." },
  { zone: "workshop", id: "workbench", label: "Workshop", Icon: Hammer, blurb: shellCopy.zoneBlurbs.workshop },
  { zone: "ledger", id: "ledger", label: "Ledger", Icon: ScrollText, blurb: ledgerNavCopy().blurb },
  { zone: "basement", id: "basement", label: "Basement", Icon: Settings, blurb: "Configure the machine." },
];

const ZONE_SURFACES: Record<ZoneId, ZoneSurface[]> = {
  keep: [
    { id: "home", label: "Keep", meta: "Agents and current state" },
    { id: "companion", label: "Aang", meta: "Human bridge" },
    { id: "inbox", label: "Capture", meta: "Hedwig intake" },
  ],
  workshop: [
    { id: "workbench", label: "Workbench", meta: shellCopy.surfaceMeta.workbench },
    { id: "projects", label: "Project Lab", meta: "Local project state" },
    { id: "terminal", label: "Terminal Lab", meta: shellCopy.surfaceMeta.terminal },
    { id: "sources", label: "Research", meta: "Source review" },
  ],
  ledger: [
    { id: "ledger", label: "Overview", meta: "Audit trail" },
    { id: "tasks", label: "Tasks", meta: "Work queue" },
    { id: "sessions", label: "Sessions", meta: "Run history" },
    { id: "approvals", label: "Approvals", meta: "Waiting gates" },
    { id: "outputs", label: "Outputs", meta: "Saved outputs" },
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
  workshop: shellCopy.zoneMarkers.workshop,
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

const shellFrame = T.verdigrisIvory;
const workFrame = T.graphiteCandle;
const mockupShell = {
  frame: "#060A09",
  frameSoft: "#0A1110",
  marble: "#080D0C",
  marbleLine: "rgba(198, 155, 85, 0.34)",
  marbleLineSoft: "rgba(77, 170, 154, 0.22)",
  plaque: "linear-gradient(180deg, rgba(26, 43, 37, 0.96), rgba(9, 19, 17, 0.98))",
  plaqueActive: "linear-gradient(180deg, rgba(39, 65, 54, 0.98), rgba(14, 31, 27, 0.98))",
  bevel: "inset 0 1px 0 rgba(244, 239, 227, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.55)",
  outerShadow: "0 28px 80px rgba(0, 0, 0, 0.7)",
};
const marbleBackground = `
  radial-gradient(circle at 82% 8%, rgba(198, 155, 85, 0.16), transparent 24%),
  radial-gradient(circle at 18% 12%, rgba(77, 170, 154, 0.14), transparent 28%),
  linear-gradient(138deg, rgba(244, 239, 227, 0.04) 0 1px, transparent 1px 38px),
  linear-gradient(42deg, rgba(77, 170, 154, 0.05) 0 1px, transparent 1px 54px),
  #050806
`;

export default function Home() {
  const { heroes, mode: connMode, connected, log, startDemo, startLive, clearHeroes } =
    useHeroSocket();

  const [nav, setNav] = useState<NavId>("home");
  const [floor, setFloor] = useState<FloorId>("ground");
  const [mode, setMode] = useState<Mode>("quick");
  const [askInput, setAskInput] = useState("");
  const [showSkillsManager, setShowSkillsManager] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(true);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [showClearGate, setShowClearGate] = useState(false);
  const [lastRouteRequest, setLastRouteRequest] = useState<{ text: string; mode: Mode } | null>(null);
  const isWorkbenchFocus = nav === "workbench";

  const selectedHero = useMemo(
    () => heroes.find((h) => h.id === selectedHeroId) || null,
    [heroes, selectedHeroId]
  );

  const { data: trackedProjects } = trpc.agents.trackedProjects.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const { data: agentRoster } = trpc.keep.agents.useQuery();
  const routePreview = trpc.runtime.previewRoute.useMutation();
  const utils = trpc.useUtils();
  const commitRoute = trpc.runtime.commitRoute.useMutation({
    onSuccess: () => {
      utils.runtime.routeRecords.invalidate();
      utils.ledger.overview.invalidate();
    },
  });
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.workQueue.invalidate();
      utils.ledger.overview.invalidate();
    },
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
      className="h-[100dvh] min-h-[100dvh] flex flex-col overflow-hidden gap-1.5 p-1.5 sm:p-2"
      style={{
        background: marbleBackground,
        color: C.textPrimary,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <EstablishingShot />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 shrink-0 rounded"
        aria-label="Keep header"
        style={{
          background: mockupShell.plaque,
          border: `1px solid ${mockupShell.marbleLine}`,
          boxShadow: mockupShell.bevel,
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-6 h-6 flex items-center justify-center rounded"
            style={{ background: mockupShell.frameSoft, border: `1px solid ${shellFrame.brassSoft}`, color: shellFrame.brass, boxShadow: mockupShell.bevel }}
          >
            <span className="text-sm leading-none">◆</span>
          </div>
          <div>
            <h1 className="text-[12px] font-bold uppercase tracking-widest leading-none" style={{ color: C.textPrimary }}>
              CereBro
            </h1>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: C.textMuted }}>
              The Keep
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 min-w-0 items-center justify-center">
          <div
            className="flex min-w-0 items-center gap-1.5 rounded px-2 py-1"
            style={{ background: mockupShell.frameSoft, border: `1px solid ${mockupShell.marbleLineSoft}`, boxShadow: mockupShell.bevel }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.gold }}>
              {ZONE_NAV_ITEMS.find((item) => item.zone === NAV_TO_ZONE[nav])?.label ?? "Keep"}
            </span>
            <span className="h-3 w-px shrink-0" style={{ background: shellFrame.shellLineSoft }} />
            <span className="truncate text-[11px] leading-none" style={{ color: C.textMuted }}>
              <span style={{ color: C.gold }}>Aang</span> reads. <span style={{ color: C.accentViolet }}>Cortana</span> routes. Ledger records.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 min-w-0">
          <PermissionModeControl />

          <div
            className="flex h-7 items-center gap-1.5 rounded px-1.5 text-[11px] shrink-0"
            role="status"
            aria-label={`Connection status: ${connected ? "Online" : "Offline"}`}
            style={{ border: `1px solid ${shellFrame.shellLineSoft}`, background: shellFrame.shellPlaque }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: connected ? C.success : C.danger }} />
            <span className="hidden sm:inline text-[11px] font-semibold uppercase" style={{ color: connected ? C.success : C.danger }}>
              {connected ? "Online" : "Offline"}
            </span>
          </div>

          <Button
            type="button"
            onClick={() => setIsContextPanelOpen((v) => !v)}
            aria-pressed={isContextPanelOpen}
            aria-expanded={isContextPanelOpen}
            aria-label={isContextPanelOpen ? "Hide context panel" : "Show context panel"}
            className="h-7 shrink-0 px-2"
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
                className="h-7 shrink-0 px-2"
                aria-label="Open developer tools"
                variant="outline"
                size="sm"
              >
                Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
      <div
        className="flex flex-1 overflow-hidden rounded"
        style={{
          minHeight: 0,
          background: mockupShell.marble,
          border: `1px solid ${mockupShell.marbleLine}`,
          boxShadow: `${mockupShell.outerShadow}, ${mockupShell.bevel}`,
        }}
      >
        {/* Left rail — four-zone OS dock */}
        <nav
          className="w-[68px] flex flex-col shrink-0 overflow-hidden"
          aria-label="CereBro zones"
          style={{ background: "rgba(5, 10, 9, 0.94)", borderRight: `1px solid ${mockupShell.marbleLine}` }}
        >
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
            {ZONE_NAV_ITEMS.map((item) => {
              const isActive = NAV_TO_ZONE[nav] === item.zone;
              const ZoneIcon = item.Icon;
              return (
                <Button
                  key={item.zone}
                  type="button"
                  onClick={() => setNav(item.id)}
                  aria-label={`Open ${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  className="h-[58px] w-full flex-col justify-center gap-1 rounded px-1 py-1 text-center"
                  variant="ghost"
                  style={{
                    background: isActive
                      ? "linear-gradient(180deg, rgba(51, 72, 58, 0.98), rgba(13, 29, 25, 0.98))"
                      : "linear-gradient(180deg, rgba(17, 30, 27, 0.96), rgba(7, 15, 14, 0.98))",
                    border: `1px solid ${isActive ? shellFrame.brassSoft : shellFrame.shellLineSoft}`,
                    color: isActive ? C.textPrimary : C.textSecondary,
                    boxShadow: isActive
                      ? `inset 0 0 0 1px ${mockupShell.marbleLineSoft}, inset 0 1px 0 rgba(244, 239, 227, 0.12), inset 0 -10px 18px rgba(0, 0, 0, 0.28)`
                      : "inset 0 1px 0 rgba(244, 239, 227, 0.06), inset 0 -8px 16px rgba(0, 0, 0, 0.24)",
                  }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[12px]"
                    style={{
                      background: isActive ? "rgba(198, 155, 85, 0.12)" : "rgba(244, 239, 227, 0.04)",
                      color: isActive ? shellFrame.brass : C.textMuted,
                      border: `1px solid ${isActive ? shellFrame.brassSoft : shellFrame.shellLineSoft}`,
                    }}
                  >
                    <ZoneIcon size={13} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="block min-w-0">
                    <span className="block text-[9px] uppercase tracking-wider font-semibold leading-none">{item.label}</span>
                  </span>
                </Button>
              );
            })}
          </div>
          <div
            className="px-1.5 py-1.5 text-[9px] leading-snug text-center uppercase tracking-wider"
            style={{ borderTop: `1px solid ${mockupShell.marbleLine}`, background: mockupShell.plaque, color: C.textMuted }}
          >
            {connMode === "live" ? "Live" : "Demo"}
          </div>
        </nav>

        {/* Center workspace */}
        <main className="flex-1 flex flex-col overflow-hidden" aria-label="CereBro workspace" style={{ minHeight: 0, background: "rgba(6, 10, 10, 0.96)" }}>
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
            {nav === "inbox" && <PanelHost><HedwigInboxPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "sources" && <PanelHost><SurferSourcesPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "terminal" && <PanelHost><TerminalLabPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "approvals" && <PanelHost><ApprovalDashboardPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "workbench" && <PanelHost><WorkbenchPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
            {nav === "companion" && <PanelHost><AangCompanionPanel onClose={() => setNav("home")} onNavigate={(route) => setNav(route)} /></PanelHost>}
            {nav === "model_tools" && <PanelHost><ModelToolsPanel onClose={() => setNav("home")} onNavigate={setNav} /></PanelHost>}
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

        {/* Right context panel — quiet route context only */}
        {isContextPanelOpen && (
          <aside
            className={`${isWorkbenchFocus ? "w-[184px]" : "w-[250px]"} shrink-0 flex flex-col overflow-hidden transition-[width] duration-200`}
            aria-label="Context panel"
            style={{ background: "rgba(7, 15, 13, 0.96)", borderLeft: `1px solid ${mockupShell.marbleLine}`, boxShadow: "inset 1px 0 0 rgba(244, 239, 227, 0.05)" }}
          >
            <ContextPanel
              agent={activeAgent}
              mode={mode}
              nav={nav}
              heroes={heroes}
              selectedHeroId={selectedHeroId}
              onSelectHero={setSelectedHeroId}
              onNavigate={setNav}
              connMode={connMode}
              compact={isWorkbenchFocus}
            />
          </aside>
        )}
      </div>

      {/* ── Bottom command bar — "Ask Aang…" ──────────────────────────── */}
      {routePreview.data && (
        <RuntimeRouteReceipt
          result={routePreview.data}
          onDismiss={() => {
            routePreview.reset();
            commitRoute.reset();
            setLastRouteRequest(null);
          }}
          onNavigate={setNav}
          isCreatingTask={createTask.isPending}
          taskCreated={Boolean(createTask.data)}
          isSavingRoute={commitRoute.isPending}
          routeSavedId={commitRoute.data?.record.id ?? null}
          onSaveRoute={() => {
            if (!lastRouteRequest || commitRoute.isPending) return;
            commitRoute.mutate(lastRouteRequest);
          }}
          onCreateTask={() => {
            const draft = routePreview.data?.taskDraft;
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
        isClassifying={routePreview.isPending}
        onSubmit={() => {
          const text = askInput.trim();
          if (!text || routePreview.isPending) return;
          if (isExactRavenSealedLauncherPhrase(text)) {
            window.location.assign(ravenSealedLauncherUrl);
            return;
          }
          commitRoute.reset();
          setLastRouteRequest({ text, mode });
          routePreview.mutate({ text, mode });
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
  const [keepView, setKeepView] = useState<"scene" | "blueprint">("scene");
  const activeAgents = Object.values(agentStates).filter((state) => state && state !== "idle" && state !== "dormant").length;

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5 shrink-0"
        style={{ background: "rgba(6, 12, 11, 0.94)", borderBottom: `1px solid ${mockupShell.marbleLineSoft}` }}
      >
        <div className="flex items-center gap-1" aria-label="Keep floor focus">
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
                  border: `1px solid ${isActive ? shellFrame.brassSoft : shellFrame.shellLineSoft}`,
                  boxShadow: isActive ? mockupShell.bevel : undefined,
                }}
                title={f.blurb}
              >
                {f.name}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded overflow-hidden" style={{ border: `1px solid ${mockupShell.marbleLineSoft}`, background: mockupShell.frameSoft }}>
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
                    background: isActive ? shellFrame.shellPlaqueActive : "transparent",
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

      <div
        className="flex-1 relative overflow-hidden"
        style={{
          minHeight: 0,
          background: `
            radial-gradient(circle at 50% 42%, rgba(198, 155, 85, 0.08), transparent 34%),
            radial-gradient(circle at 50% 65%, rgba(77, 170, 154, 0.08), transparent 38%),
            #050706
          `,
        }}
      >
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
      label: "Workbench",
      meta: "Open Workbench",
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
        style={{
          background: "rgba(5, 9, 8, 0.92)",
          border: `1px solid ${mockupShell.marbleLine}`,
          boxShadow: `0 18px 46px rgba(0, 0, 0, 0.62), ${mockupShell.bevel}`,
          backdropFilter: "blur(10px)",
        }}
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
            style={{ background: mockupShell.plaque, border: `1px solid ${shellFrame.shellLineSoft}`, color: C.textSecondary, boxShadow: mockupShell.bevel }}
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
        className="max-w-md w-full p-3 rounded"
        style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}
      >
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: C.warning }}>
          Stub
        </div>
        <div className="text-[13px] font-semibold mb-2" style={{ color: C.textPrimary }}>
          {title}
        </div>
        <div className="text-[12px] leading-snug" style={{ color: C.textSecondary }}>
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
      className="flex shrink-0 items-center gap-1.5 overflow-hidden px-2.5 py-1.5"
      style={{
        background: "linear-gradient(180deg, rgba(9, 16, 15, 0.98), rgba(5, 10, 10, 0.98))",
        borderBottom: `1px solid ${mockupShell.marbleLineSoft}`,
        boxShadow: "inset 0 1px 0 rgba(244, 239, 227, 0.04)",
      }}
    >
      <div className="hidden xl:flex min-w-[150px] items-center gap-2">
        <div className="h-7 w-1 rounded-full" style={{ background: shellFrame.brass }} />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            {zoneItem.label}
          </div>
          <div className="truncate text-[10px] leading-snug mt-0.5" style={{ color: C.textMuted }}>
            {zoneItem.blurb}
          </div>
        </div>
      </div>

      <div
        className="flex flex-1 items-stretch gap-1 overflow-x-auto"
        role="group"
        aria-label={`${zoneItem.label} surfaces`}
        style={{ scrollbarColor: `${workFrame.line} ${workFrame.slab}` }}
      >
        {surfaces.map((surface) => {
          const isActive = nav === surface.id;
          return (
            <Button
              key={surface.id}
              type="button"
              onClick={() => onNavigate(surface.id)}
              aria-pressed={isActive}
              aria-label={`Open ${surface.label}`}
              className="h-7 shrink-0 justify-start whitespace-normal rounded-b-none px-2 text-left"
              variant={isActive ? "secondary" : "outline"}
              style={{
                background: isActive
                  ? "linear-gradient(180deg, rgba(38, 59, 50, 0.98), rgba(12, 27, 24, 0.98))"
                  : "rgba(8, 13, 13, 0.72)",
                color: isActive ? C.textPrimary : C.textSecondary,
                border: `1px solid ${isActive ? shellFrame.brassSoft : workFrame.lineSoft}`,
                borderBottomColor: isActive ? "rgba(12, 27, 24, 0.98)" : workFrame.lineSoft,
                boxShadow: isActive ? "inset 0 1px 0 rgba(244, 239, 227, 0.1), 0 -1px 0 rgba(198, 155, 85, 0.24)" : undefined,
              }}
              title={surface.meta}
            >
              <span className="block min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider leading-none">
                  {surface.label}
                </span>
                <span className="mt-1 hidden text-[10px] leading-none xl:block" style={{ color: C.textMuted }}>
                  {surface.meta}
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <div className="hidden 2xl:flex items-center gap-1.5 shrink-0" aria-label={`${zoneItem.label} ${shellCopy.zoneMarkerLabel}`}>
        {receipts.map((receipt) => (
          <Badge
            key={receipt}
            variant={zone === "ledger" ? "warning" : "secondary"}
            className="px-1.5 py-0.5"
            style={{ color: zone === "ledger" ? C.gold : C.textMuted, background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}
          >
            {receipt}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function LedgerOverview({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null);
  const [ledgerFocusNotice, setLedgerFocusNotice] = useState<string | null>(null);
  const [ledgerFocusProject, setLedgerFocusProject] = useState<{ id: number | null; name: string | null } | null>(null);
  const [creatingRouteTaskId, setCreatingRouteTaskId] = useState<number | null>(null);
  const [creatingRouteApprovalId, setCreatingRouteApprovalId] = useState<number | null>(null);
  const [creatingRouteReceiptId, setCreatingRouteReceiptId] = useState<number | null>(null);
  const [selectedRouteAuditId, setSelectedRouteAuditId] = useState<number | null>(null);
  const [selectedBrowserRunnerAuditId, setSelectedBrowserRunnerAuditId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const ledgerOverview = trpc.ledger.overview.useQuery(
    { evidenceLimit: 50, routeLimit: 6 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const createTaskFromRoute = trpc.runtime.createTaskFromRouteRecord.useMutation({
    onSuccess: () => {
      utils.runtime.routeRecords.invalidate();
      utils.ledger.overview.invalidate();
      utils.tasks.list.invalidate();
      utils.tasks.workQueue.invalidate();
      utils.tasks.projects.invalidate();
    },
  });
  const createApprovalFromRoute = trpc.runtime.createApprovalPreviewFromRouteRecord.useMutation({
    onSuccess: () => {
      utils.ledger.overview.invalidate();
      utils.approvals.queue.invalidate();
      utils.approvals.detail.invalidate();
      utils.approvals.list.invalidate();
      utils.companion.localEvents.invalidate();
    },
  });
  const createWorkbenchReceiptFromRoute = trpc.runtime.createWorkbenchReceiptFromRouteRecord.useMutation({
    onSuccess: () => {
      utils.ledger.overview.invalidate();
      utils.runtime.routeRecords.invalidate();
      utils.workbench.evidence.invalidate();
      utils.workbench.evidenceSummary.invalidate();
    },
  });
  const routeReceiptAudit = trpc.runtime.routeReceiptAudit.useQuery(
    { routeRecordId: selectedRouteAuditId ?? 0 },
    {
      enabled: selectedRouteAuditId != null,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const browserRunnerAuditDetail = trpc.ledger.browserRunnerAuditDetail.useQuery(
    { id: selectedBrowserRunnerAuditId ?? 0 },
    {
      enabled: selectedBrowserRunnerAuditId != null,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const ledgerCopy = ledgerOverviewCopy();

  const overviewCards = ledgerOverview.data?.cards;
  const memoryContract = ledgerOverview.data?.memoryContract;
  const routeReceiptContract = ledgerOverview.data?.routeReceiptContract;
  const executionReceiptLoopAudit = ledgerOverview.data?.executionReceiptLoopAudit;
  const browserReceiptAudit = ledgerOverview.data?.browserReceiptAudit;
  const routeReceiptContractProof = routeReceiptContract ? routeReceiptContractProofModel(routeReceiptContract) : [];
  const evidenceRows = ledgerOverview.data?.latestEvidence ?? [];
  const executionRows = ledgerOverview.data?.latestExecutionResults ?? [];
  const gitWriteRows = ledgerOverview.data?.latestGitWriteObservations ?? [];
  const projectPushContractRows = ledgerOverview.data?.latestProjectPushContracts ?? [];
  const routeRows = ledgerOverview.data?.latestRoutes ?? [];
  const focusedEvidenceRows = ledgerFocusProject
    ? evidenceRows.filter((item) => (
        ledgerFocusProject.id != null
          ? item.projectId === ledgerFocusProject.id
          : ledgerFocusProject.name != null && item.projectName === ledgerFocusProject.name
      ))
    : evidenceRows;
  const latestEvidenceRows = focusedEvidenceRows.slice(0, 4);
  const latestExecutionRows = executionRows.slice(0, 4);
  const latestGitWriteRows = gitWriteRows.slice(0, 3);
  const latestProjectPushContractRows = projectPushContractRows.slice(0, 3);
  const latestRouteRows = routeRows.slice(0, 4);
  const selectedEvidence = evidenceRows.find((item) => item.id === selectedEvidenceId) ?? latestEvidenceRows[0] ?? null;
  const terminalEvidenceCount = overviewCards?.receipts.terminal ?? 0;
  const activeSessions = overviewCards?.sessions.active ?? 0;
  const taskTotal = overviewCards?.tasks.total ?? 0;
  const openTasks = overviewCards?.tasks.open ?? 0;
  const selectedAuditRead = selectedEvidence
    ? [
        { label: "Body", value: `Workbench #${selectedEvidence.id}`, tone: C.gold },
        { label: "Project", value: selectedEvidence.projectName ?? "unlinked", tone: selectedEvidence.projectName ? C.success : C.warning },
        { label: "Validation", value: selectedEvidence.validationStatus.replace(/_/g, " "), tone: selectedEvidence.validationStatus === "needs_review" ? C.warning : C.success },
        { label: "Route", value: selectedEvidence.routeAgent ?? "unrouted", tone: selectedEvidence.routeAgent ? C.accent : C.warning },
        {
          label: "Next",
          value:
            selectedEvidence.validationStatus === "needs_review"
              ? "Open Workbench Body and append validation."
              : selectedEvidence.projectName
                ? "Open Project Push Context before git."
                : "Link a project before push context.",
          tone: C.textSecondary,
        },
      ]
    : [];

  useEffect(() => {
    if (ledgerOverview.isLoading) return;
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("cerebro:ledger-focus");
      if (raw) window.sessionStorage.removeItem("cerebro:ledger-focus");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { evidenceId?: number; observationId?: number; browserRunnerAuditId?: number; projectId?: number | null; projectName?: string | null; notice?: string };
      if (typeof draft.projectId === "number" || draft.projectName) {
        setLedgerFocusProject({ id: typeof draft.projectId === "number" ? draft.projectId : null, name: draft.projectName ?? null });
        if (typeof draft.evidenceId !== "number") setSelectedEvidenceId(null);
      }
      if (typeof draft.evidenceId === "number") setSelectedEvidenceId(draft.evidenceId);
      if (typeof draft.browserRunnerAuditId === "number") setSelectedBrowserRunnerAuditId(draft.browserRunnerAuditId);
      setLedgerFocusNotice(draft.notice ?? "Ledger opened a focused receipt.");
    } catch {
      setLedgerFocusNotice("Ledger focus could not be read. Select a receipt manually.");
    }
  }, [ledgerOverview.isLoading]);

  const cards = [
    {
      label: "Tasks",
      value: String(openTasks),
      meta: ledgerCopy.cardMeta.tasks(taskTotal),
      target: "tasks" as NavId,
      tone: C.warning,
    },
    {
      label: "Sessions",
      value: String(activeSessions),
      meta: ledgerCopy.cardMeta.sessions(overviewCards?.sessions.recent ?? 0),
      target: "sessions" as NavId,
      tone: C.success,
    },
    {
      label: "Approvals",
      value: String(overviewCards?.approvals.pending ?? 0),
      meta: ledgerCopy.cardMeta.approvals,
      target: "approvals" as NavId,
      tone: (overviewCards?.approvals.pending ?? 0) > 0 ? C.warning : C.textMuted,
    },
    {
      label: "Outputs",
      value: String(overviewCards?.outputs.total ?? 0),
      meta: ledgerCopy.cardMeta.outputs,
      target: "outputs" as NavId,
      tone: C.gold,
    },
    {
      label: "Receipts",
      value: String(overviewCards?.receipts.total ?? 0),
      meta: ledgerCopy.cardMeta.workbench(terminalEvidenceCount),
      target: "workbench" as NavId,
      tone: C.accentViolet,
    },
    {
      label: "Routes",
      value: String(overviewCards?.routes.total ?? 0),
      meta: ledgerCopy.cardMeta.routes,
      target: "ledger" as NavId,
      tone: C.accent,
    },
    {
      label: "Runs",
      value: String(overviewCards?.execution?.total ?? 0),
      meta: "approved local read results",
      target: "ledger" as NavId,
      tone: (overviewCards?.execution?.total ?? 0) > 0 ? C.success : C.textMuted,
    },
    {
      label: "Git Writes",
      value: String(overviewCards?.gitWrites?.terminalPreviews ?? 0),
      meta: ledgerCopy.cardMeta.gitWrites(overviewCards?.gitWrites?.projectPushContracts ?? 0),
      target: "ledger" as NavId,
      tone: (overviewCards?.gitWrites?.projectPushContracts ?? 0) > 0 ? C.warning : C.textMuted,
    },
    {
      label: "Memory",
      value: String(overviewCards?.memory.total ?? 0),
      meta: ledgerCopy.cardMeta.memory(overviewCards?.memory.proposed ?? 0),
      target: "memory" as NavId,
      tone: C.accent,
    },
  ];

  function openWorkbenchEvidence(item: { id: number; kind: string; targetUri: string | null; title: string }) {
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-filter",
        JSON.stringify({
          source: "ledger",
          evidenceId: item.id,
          kind: item.kind,
          query: item.targetUri ?? item.title,
          groupBy: "kind",
          notice: `Showing Workbench receipt #${item.id} from Ledger.`,
        }),
      );
    } catch {
      // Workbench still opens; the user can inspect recent receipts manually.
    }
    onNavigate("workbench");
  }

  function openExecutionWorkbenchBody(item: { id: number; workbenchEvidenceId: number | null; command: string }) {
    if (item.workbenchEvidenceId == null) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-filter",
        JSON.stringify({
          source: "ledger_execution_result",
          evidenceId: item.workbenchEvidenceId,
          kind: "terminal_output",
          query: item.command,
          groupBy: "command",
          notice: `Ledger opened Workbench body #${item.workbenchEvidenceId} from execution result #${item.id}.`,
        }),
      );
    } catch {
      // Workbench still opens; the user can inspect recent terminal receipts manually.
    }
    onNavigate("workbench");
  }

  function openExecutionApprovalReceipt(item: { id: number; approvalId: number | null; command: string }) {
    if (item.approvalId == null) return;
    try {
      window.sessionStorage.setItem(
        "cerebro:approvals-focus",
        JSON.stringify({
          source: "ledger_execution_result",
          approvalId: item.approvalId,
          status: "approved",
          origin: "all",
          query: "",
          notice: `Ledger opened approval #${item.approvalId} from execution result #${item.id}.`,
        }),
      );
    } catch {
      // Approvals still opens; the user can inspect the approved queue manually.
    }
    onNavigate("approvals");
  }

  function openExecutionTerminalFocus(item: { id: number; proposalSourceType: string | null; proposalSourceId: number | null; command: string }) {
    try {
      window.sessionStorage.setItem(
        "cerebro:terminal-focus",
        JSON.stringify({
          source: "ledger_execution_result",
          resultId: item.id,
          observationId: item.proposalSourceType === "command_observation" ? item.proposalSourceId : null,
          command: item.command,
          notice: `Ledger opened Terminal Lab context for execution result #${item.id}.`,
        }),
      );
    } catch {
      // Terminal Lab still opens; the user can inspect recent results manually.
    }
    onNavigate("terminal");
  }

  function openProjectPushContext(item: { id: number; projectId: number | null; projectName: string | null }) {
    try {
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "ledger",
          evidenceId: item.id,
          projectId: item.projectId,
          projectName: item.projectName,
          notice: item.projectName
            ? `Ledger receipt #${item.id} opened ${item.projectName} push context.`
            : `Ledger receipt #${item.id} has no linked project.`,
        }),
      );
    } catch {
      // Project Lab still opens; the user can inspect project push context manually.
    }
    onNavigate("projects");
  }

  function openProjectPushContract(item: { id: number; projectId: number | null; projectName: string | null; sourceId: number }) {
    try {
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "ledger_project_push_contract",
          proposalId: item.id,
          projectId: item.projectId ?? item.sourceId,
          projectName: item.projectName,
          notice: item.projectName
            ? `Ledger opened ${item.projectName} push contract #${item.id}.`
            : `Ledger opened push contract #${item.id}.`,
        }),
      );
    } catch {
      // Project Lab still opens; the user can inspect project push context manually.
    }
    onNavigate("projects");
  }

  function openRouteProjectFocus(item: {
    id: number;
    projectName: string | null;
    projectPath: string | null;
    projectFocusDraft?: Record<string, unknown>;
  }) {
    const draft = item.projectFocusDraft;
    try {
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "runtime_route_record",
          routeRecordId: item.id,
          projectName: typeof draft?.projectName === "string" ? draft.projectName : item.projectName,
          projectPath: typeof draft?.projectPath === "string" ? draft.projectPath : item.projectPath,
          projectFocus: draft,
          notice:
            typeof draft?.focusSummary === "string"
              ? draft.focusSummary
              : `Route #${item.id} opened Project Lab. No project write is saved.`,
        }),
      );
    } catch {
      // Project Lab still opens; the route remains visible in Ledger.
    }
    onNavigate("projects");
  }

  function openRouteWorkbenchDraft(item: {
    id: number;
    taskId: number | null;
    originalText: string;
    workbenchReceiptDraft: Record<string, unknown>;
    taskDraft: Record<string, unknown>;
  }) {
    const draft = item.workbenchReceiptDraft;
    const taskDraft = item.taskDraft;
    const routeChain = Array.isArray(draft.routeChain) ? draft.routeChain : [];
    const gates = Array.isArray(draft.gates) ? draft.gates : [];
    try {
      window.sessionStorage.setItem(
        "cerebro:workbench-draft",
        JSON.stringify({
          kind: "manual_note",
          source: "runtime_route_record",
          routeRecordId: item.id,
          routeKind: typeof draft.kind === "string" ? draft.kind : "route_preview",
          title: typeof taskDraft.title === "string" ? taskDraft.title : `Route #${item.id}: ${item.originalText}`,
          summary: typeof draft.summary === "string" ? draft.summary : item.originalText,
          routeAgent: typeof draft.ownerAgent === "string" ? draft.ownerAgent : null,
          permissionClass: "manual_note",
          targetUri: `runtime_route:${item.id}`,
          taskId: item.taskId,
          projectName: typeof draft.projectName === "string" ? draft.projectName : null,
          projectPath: typeof draft.projectPath === "string" ? draft.projectPath : null,
          projectFocus: typeof draft.projectFocus === "object" && draft.projectFocus != null ? draft.projectFocus : null,
          routeChain,
          gates,
          nextAction: typeof draft.nextAction === "string" ? draft.nextAction : "Review this route before saving a Workbench receipt.",
          modelLane: typeof draft.modelLane === "object" && draft.modelLane != null ? draft.modelLane : null,
          notice: `Route #${item.id} staged as a Workbench draft. Target stays runtime_route:${item.id}. Review before saving.`,
        }),
      );
    } catch {
      // Workbench still opens; the route remains visible in Ledger.
    }
    onNavigate("workbench");
  }

  function createTaskFromRouteRecord(item: { id: number }) {
    if (createTaskFromRoute.isPending) return;
    setCreatingRouteTaskId(item.id);
    createTaskFromRoute.mutate(
      {
        routeRecordId: item.id,
      },
      {
        onSuccess: (result) => openCreatedRouteTask(result.task.id, item.id),
        onSettled: () => {
          setCreatingRouteTaskId(null);
        },
      },
    );
  }

  function createApprovalFromRouteRecord(item: { id: number }) {
    if (createApprovalFromRoute.isPending) return;
    setCreatingRouteApprovalId(item.id);
    createApprovalFromRoute.mutate(
      {
        routeRecordId: item.id,
        reason: "Route requires approval before any surfaced action runs.",
      },
      {
        onSuccess: (result) => {
          const approvalId = result.approval?.id;
          setLedgerFocusNotice(
            approvalId
              ? `Approval #${approvalId} queued for route #${item.id}.`
              : `Route #${item.id} approval preview could not be read back.`,
          );
          onNavigate("approvals");
        },
        onSettled: () => {
          setCreatingRouteApprovalId(null);
        },
      },
    );
  }

  function createWorkbenchReceiptFromRouteRecord(item: { id: number }) {
    if (createWorkbenchReceiptFromRoute.isPending) return;
    setCreatingRouteReceiptId(item.id);
    createWorkbenchReceiptFromRoute.mutate(
      {
        routeRecordId: item.id,
      },
      {
        onSuccess: (result) => {
          const evidenceId = result.evidence?.id;
          setLedgerFocusNotice(
            evidenceId
              ? `Workbench receipt #${evidenceId} saved for route #${item.id}.`
              : `Route #${item.id} Workbench receipt could not be read back.`,
          );
        },
        onSettled: () => {
          setCreatingRouteReceiptId(null);
        },
      },
    );
  }

  function openCreatedRouteTask(taskId: number, routeId: number) {
    try {
      window.sessionStorage.setItem(
        "cerebro:tasks-focus",
        JSON.stringify({
          source: "ledger_route",
          taskId,
          routeId,
          notice: `Showing task #${taskId} created from route #${routeId}.`,
        }),
      );
    } catch {
      // Tasks still opens; the new task is listed in the local queue.
    }
    onNavigate("tasks");
  }

  return (
    <div className="h-full overflow-y-auto p-2" style={{ background: workFrame.slabMuted }} aria-label="Ledger overview">
      <div className="grid gap-2">
        <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                {ledgerCopy.title}
              </h2>
              <p className="mt-1 max-w-2xl text-[11px] leading-snug" style={{ color: C.textMuted }}>
                {ledgerCopy.subtitle}
              </p>
            </div>
            <Badge variant="secondary" className="uppercase">read-only</Badge>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-1.5 lg:grid-cols-5 xl:grid-cols-10" aria-label={ledgerCopy.cardsAria}>
          {cards.map((card) => (
            <Button
              key={card.label}
              type="button"
              onClick={() => onNavigate(card.target)}
              aria-label={`Open ${card.label}`}
              title={card.meta}
              variant="outline"
              className="h-auto justify-start whitespace-normal p-2 text-left"
              style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}`, color: C.textSecondary }}
            >
              <span className="block w-full min-w-0">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: card.tone }}>
                    {card.label}
                  </span>
                  <span className="text-[13px] font-semibold leading-none" style={{ color: C.textPrimary }}>
                    {card.value}
                  </span>
                </span>
                <span className="mt-1 block text-[11px] leading-snug" style={{ color: C.textMuted }}>
                  {card.meta}
                </span>
              </span>
            </Button>
          ))}
        </section>

        {memoryContract && (
          <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label={ledgerCopy.memoryContractAria}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                {ledgerCopy.memoryContractTitle}
              </div>
              <Badge variant="warning" className="uppercase">
                {ledgerCopy.memoryContractBadge}
              </Badge>
            </div>
            <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
              <CompactReadDatum
                label={ledgerCopy.memoryContractRouteLabel}
                value={ledgerCopy.memoryContractRouteValue(memoryContract.normalRoute, memoryContract.archiveRoute)}
                tone={C.accent}
              />
              <CompactReadDatum
                label={ledgerCopy.memoryContractReviewLabel}
                value={ledgerCopy.memoryContractReviewValue(memoryContract.pendingProposals, memoryContract.oakValidatedProposals)}
                tone={memoryContract.pendingProposals > 0 ? C.warning : C.success}
              />
              <CompactReadDatum
                label={ledgerCopy.memoryContractGateLabel}
                value={memoryContract.canAutomateRetrieval ? "retrieval allowed" : "validation required"}
                tone={memoryContract.canAutomateRetrieval ? C.danger : C.gold}
              />
              <CompactReadDatum
                label={ledgerCopy.memoryContractNextLabel}
                value={memoryContract.nextAction}
                tone={C.textSecondary}
              />
            </div>
            <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {memoryContract.gates[2]}
            </div>
          </section>
        )}

        {routeReceiptContract && (
          <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Route receipt contract">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Route Receipt Contract
              </div>
              <Badge variant="secondary" className="uppercase">
                executor {routeReceiptContract.executorStatus.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-6">
              {routeReceiptContractProof.map((field) => (
                <CompactReadDatum key={field.label} label={field.label} value={field.value} tone={proofTone(field.tone)} />
              ))}
            </div>
            <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {routeReceiptContract.gates[2]}
            </div>
          </section>
        )}

        {executionReceiptLoopAudit && (
          <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Execution receipt loop audit">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                  Execution Receipt Loop
                </div>
                <div className="mt-0.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                  Terminal, Approval, Workbench, and Ledger links. Read-only audit.
                </div>
              </div>
              <Badge variant="secondary" className="uppercase">
                no execution
              </Badge>
            </div>
            <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-6">
              <CompactReadDatum label="Proposals" value={String(executionReceiptLoopAudit.proposals)} tone={C.accent} />
              <CompactReadDatum label="Approved" value={`${executionReceiptLoopAudit.approved}/${executionReceiptLoopAudit.approvalLinked}`} tone={executionReceiptLoopAudit.approved > 0 ? C.success : C.warning} />
              <CompactReadDatum label="Bodies" value={String(executionReceiptLoopAudit.bodyLinked)} tone={executionReceiptLoopAudit.bodyLinked > 0 ? C.success : C.warning} />
              <CompactReadDatum label="Results" value={`${executionReceiptLoopAudit.completed}/${executionReceiptLoopAudit.resultLinked}`} tone={executionReceiptLoopAudit.completed > 0 ? C.success : C.textMuted} />
              <CompactReadDatum label="Validation" value={String(executionReceiptLoopAudit.validationNotes)} tone={executionReceiptLoopAudit.validationNotes >= executionReceiptLoopAudit.resultLinked ? C.success : C.warning} />
              <CompactReadDatum label="Blocked Risk" value={String(executionReceiptLoopAudit.blockedRisk)} tone={executionReceiptLoopAudit.blockedRisk > 0 ? C.danger : C.textMuted} />
            </div>
            <div className="mt-1.5 grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
              <CompactReadDatum label="Terminal Source" value={String(executionReceiptLoopAudit.terminalSource)} tone={C.accent} />
              <CompactReadDatum label="Task Links" value={String(executionReceiptLoopAudit.taskLinked)} tone={executionReceiptLoopAudit.taskLinked > 0 ? C.success : C.warning} />
              <CompactReadDatum label="Ready Review" value={String(executionReceiptLoopAudit.readyToReview)} tone={executionReceiptLoopAudit.readyToReview > 0 ? C.success : C.warning} />
              <CompactReadDatum label="Can Execute" value={executionReceiptLoopAudit.canExecuteFromAudit ? "yes" : "no"} tone={executionReceiptLoopAudit.canExecuteFromAudit ? C.danger : C.success} />
            </div>
            <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
              {executionReceiptLoopAudit.gates[2]} Next: {executionReceiptLoopAudit.nextAction}
            </div>
          </section>
        )}

        {browserReceiptAudit && (
          <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Browser receipt audit">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                  Browser Receipt Audit
                </div>
                <div className="mt-0.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                  Workbench holds the Browser body. Ledger holds the audit trail.
                </div>
              </div>
              <Badge variant="secondary" className="uppercase">
                no page open
              </Badge>
            </div>
            <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-6">
              <CompactReadDatum label="Proposals" value={String(browserReceiptAudit.proposals)} tone={C.accent} />
              <CompactReadDatum label="Draft Tabs" value={String(browserReceiptAudit.draftTabs)} tone={browserReceiptAudit.draftTabs > 0 ? C.gold : C.textMuted} />
              <CompactReadDatum label="Watch Shelf" value={String(browserReceiptAudit.watchShelfItems)} tone={browserReceiptAudit.watchShelfItems > 0 ? C.gold : C.textMuted} />
              <CompactReadDatum label="Runner Audits" value={String(browserReceiptAudit.runnerAudits)} tone={browserReceiptAudit.runnerAudits > 0 ? C.gold : C.textMuted} />
              <CompactReadDatum label="Live Gates" value={String(browserReceiptAudit.liveRunnerApprovals)} tone={browserReceiptAudit.liveRunnerApprovals > 0 ? C.gold : C.textMuted} />
              <CompactReadDatum label="Result Scaffolds" value={String(browserReceiptAudit.resultScaffolds)} tone={browserReceiptAudit.resultScaffolds > 0 ? C.success : C.textMuted} />
              <CompactReadDatum label="Recovery Notes" value={String(browserReceiptAudit.recoveryScaffolds)} tone={browserReceiptAudit.recoveryScaffolds > 0 ? C.success : C.textMuted} />
              <CompactReadDatum label="Can Open" value={browserReceiptAudit.canOpenPage ? "yes" : "no"} tone={browserReceiptAudit.canOpenPage ? C.danger : C.success} />
              <CompactReadDatum label="Can Execute" value={browserReceiptAudit.canExecute ? "yes" : "no"} tone={browserReceiptAudit.canExecute ? C.danger : C.success} />
              <CompactReadDatum label="Launch Gate" value={browserReceiptAudit.launchGate.canExecute ? "open" : "blocked"} tone={browserReceiptAudit.launchGate.canExecute ? C.danger : C.success} />
              <CompactReadDatum label="Shelf Save" value={browserReceiptAudit.canSaveWatchShelf ? "yes" : "no"} tone={browserReceiptAudit.canSaveWatchShelf ? C.danger : C.success} />
              <CompactReadDatum label="Progress" value={browserReceiptAudit.canPersistWatchProgress ? "yes" : "no"} tone={browserReceiptAudit.canPersistWatchProgress ? C.danger : C.success} />
            </div>
            <div className="mt-1.5 rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                    Launch Gate
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
                    {browserReceiptAudit.launchGate.hardGate}. No page open. No execute.
                  </div>
                </div>
                <Badge variant="secondary" className="uppercase">
                  blocked
                </Badge>
              </div>
            </div>
            <div className="mt-1.5 grid gap-1.5 xl:grid-cols-5">
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  Latest Browser Proposals
                </div>
                {browserReceiptAudit.latestProposals.length === 0 ? (
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    No Browser proposals recorded.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browserReceiptAudit.latestProposals.map((item) => (
                      <div key={item.id} className="rounded px-2 py-1" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: C.textPrimary }}>
                          <span className="truncate">#{item.id} {item.actionLabel}</span>
                          <span className="shrink-0" style={{ color: item.canExecute ? C.danger : C.success }}>
                            {item.statusLabel}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textMuted }}>
                          {item.resultState.replace(/_/g, " ")} · {item.target}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  Latest Draft Tabs
                </div>
                {browserReceiptAudit.latestTabs.length === 0 ? (
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    No draft tabs recorded.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browserReceiptAudit.latestTabs.map((item) => (
                      <div key={item.id} className="rounded px-2 py-1" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: C.textPrimary }}>
                          <span className="truncate">{item.tabId}</span>
                          <span className="shrink-0" style={{ color: item.state === "draft" ? C.gold : C.textMuted }}>
                            {item.state}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textMuted }}>
                          proposal {item.proposalId ? `#${item.proposalId}` : "unlinked"} · {item.targetUrl}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  Watch Shelf
                </div>
                {browserReceiptAudit.latestWatchShelfItems.length === 0 ? (
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    No Watch Shelf items saved.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browserReceiptAudit.latestWatchShelfItems.map((item) => (
                      <div key={item.id} className="rounded px-2 py-1" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: C.textPrimary }}>
                          <span className="truncate">#{item.id} {item.title ?? item.category}</span>
                          <span className="shrink-0" style={{ color: item.state === "draft" ? C.gold : C.textMuted }}>
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textMuted }}>
                          {item.progressLabel ?? "no progress"} · {item.targetUrl}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  Runner Audits
                </div>
                {browserReceiptAudit.latestRunnerAudits.length === 0 ? (
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    No runner audits recorded.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browserReceiptAudit.latestRunnerAudits.map((item) => (
                      <div key={item.id} className="rounded px-2 py-1" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: C.textPrimary }}>
                          <span className="truncate">Audit #{item.id}</span>
                          <span className="shrink-0" style={{ color: item.canExecute ? C.danger : C.success }}>
                            {item.runnerState.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px]" style={{ color: C.textMuted }}>
                          <span className="min-w-0 flex-1 truncate">
                            proposal {item.proposalId ? `#${item.proposalId}` : "unlinked"} · {item.canOpenPage ? "can open" : "no page open"}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 rounded px-1.5 py-0.5 uppercase tracking-wider"
                            onClick={() => setSelectedBrowserRunnerAuditId(item.id)}
                            style={{ color: C.accent, border: `1px solid ${workFrame.lineSoft}`, background: workFrame.slabMuted }}
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                  Live Runner Gates
                </div>
                {browserReceiptAudit.latestLiveRunnerApprovals.length === 0 ? (
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    No live-runner gates recorded.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {browserReceiptAudit.latestLiveRunnerApprovals.map((item) => (
                      <div key={item.id} className="rounded px-2 py-1" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: C.textPrimary }}>
                          <span className="truncate">Gate #{item.id}</span>
                          <span className="shrink-0" style={{ color: item.status === "approved" ? C.gold : C.textMuted }}>
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[10px]" style={{ color: C.textMuted }}>
                          proposal {item.proposalId ? `#${item.proposalId}` : "unlinked"} · no page open
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
              No browser opened. No page fetched. No Watch Shelf item saved. No progress persisted. Next: {browserReceiptAudit.nextAction}
            </div>
            {selectedBrowserRunnerAuditId != null && (
              <div className="mt-1.5 rounded p-2" aria-label="Browser runner audit receipt detail" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                    Runner Receipt Detail
                  </span>
                  <Badge variant="secondary" className="uppercase">
                    read only
                  </Badge>
                </div>
                {browserRunnerAuditDetail.isLoading ? (
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    Reading runner receipt.
                  </div>
                ) : browserRunnerAuditDetail.data?.audit ? (
                  <div className="grid gap-1.5">
                    <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
                      <CompactReadDatum label="Audit" value={`#${browserRunnerAuditDetail.data.audit.id}`} tone={C.accent} />
                      <CompactReadDatum label="Runner" value={browserRunnerAuditDetail.data.audit.runnerState.replace(/_/g, " ")} tone={C.gold} />
                      <CompactReadDatum label="Can Open" value={browserRunnerAuditDetail.data.audit.canOpenPage ? "yes" : "no"} tone={browserRunnerAuditDetail.data.audit.canOpenPage ? C.danger : C.success} />
                      <CompactReadDatum label="Can Execute" value={browserRunnerAuditDetail.data.audit.canExecute ? "yes" : "no"} tone={browserRunnerAuditDetail.data.audit.canExecute ? C.danger : C.success} />
                    </div>
                    <div className="rounded px-2 py-1.5 text-[11px] leading-snug" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}`, color: C.textSecondary }}>
                      {browserRunnerAuditDetail.data.audit.proposal
                        ? `Proposal #${browserRunnerAuditDetail.data.audit.proposal.id}: ${browserRunnerAuditDetail.data.audit.proposal.target}`
                        : "Proposal unlinked."}
                    </div>
                    <div className="rounded px-2 py-1.5 text-[10px] leading-snug" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
                      {browserRunnerAuditDetail.data.audit.noActionTaken.slice(0, 4).join(" ")}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px]" style={{ color: C.warning }}>
                    Runner receipt could not be read.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Git write audit trail">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
                Git Write Trail
              </div>
              <div className="mt-0.5 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                Terminal previews route to Project Lab. Ledger records the contract. Nothing runs here.
              </div>
            </div>
            <Badge variant="warning" className="uppercase">
              blocked by default
            </Badge>
          </div>
          {ledgerOverview.isLoading ? (
            <div className="rounded p-2 text-[11px]" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              Reading git write audit trail.
            </div>
          ) : latestGitWriteRows.length === 0 && latestProjectPushContractRows.length === 0 ? (
            <div className="rounded p-2 text-[11px]" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              No git write previews or Project Lab push contracts yet.
            </div>
          ) : (
            <div className="grid gap-1.5 xl:grid-cols-2">
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                    Terminal Preview
                  </span>
                  <Badge variant="secondary" className="uppercase">
                    no git ran
                  </Badge>
                </div>
                {latestGitWriteRows.length === 0 ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    No terminal git-write previews are saved.
                  </div>
                ) : (
                  <div className="grid gap-1.5">
                    {latestGitWriteRows.map((item) => (
                      <div key={item.id} className="rounded p-1.5" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant="secondary" className="uppercase">terminal #{item.id}</Badge>
                          <Badge variant="warning" className="uppercase">{item.risk.replace(/_/g, " ")}</Badge>
                          {item.projectName && <Badge variant="secondary" className="uppercase" title={item.projectName}>{item.projectName}</Badge>}
                        </div>
                        <div className="mt-1 truncate rounded px-2 py-1 text-[11px]" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textPrimary }} title={item.command}>
                          <code>{compactCommandLabel(item.command)}</code>
                        </div>
                        <div className="mt-1 line-clamp-2 text-[10px] leading-snug" style={{ color: C.textMuted }} title={item.explanation}>
                          {item.explanation || "Git write preview saved. Project Lab must read push context before any write."}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                    Project Lab Contract
                  </span>
                  <Badge variant="warning" className="uppercase">
                    Spock gate
                  </Badge>
                </div>
                {latestProjectPushContractRows.length === 0 ? (
                  <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    No Project Lab push contract has been created.
                  </div>
                ) : (
                  <div className="grid gap-1.5">
                    {latestProjectPushContractRows.map((item) => (
                      <div key={item.id} className="rounded p-1.5" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant="secondary" className="uppercase">proposal #{item.id}</Badge>
                          <Badge variant="destructive" className="uppercase">{item.riskClass.replace(/_/g, " ")}</Badge>
                          <Badge variant={item.approvalStatus === "approved" ? "success" : item.approvalStatus === "rejected" ? "destructive" : "warning"} className="uppercase">
                            {item.approvalStatus ?? "no approval"}
                          </Badge>
                          <Badge variant="secondary" className="uppercase">{item.resultState.replace(/_/g, " ")}</Badge>
                          {item.projectName && <Badge variant="warning" className="uppercase" title={item.projectName}>{item.projectName}</Badge>}
                        </div>
                        <div className="mt-1 grid gap-1 sm:grid-cols-3">
                          <CompactReadDatum label="Executor" value={item.executorAgent} tone={C.accent} />
                          <CompactReadDatum label="Body" value={item.workbenchEvidenceId ? `#${item.workbenchEvidenceId}` : "missing"} tone={item.workbenchEvidenceId ? C.success : C.warning} />
                          <CompactReadDatum label="Task" value={item.taskId ? `#${item.taskId}` : "missing"} tone={item.taskId ? C.success : C.warning} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openProjectPushContract(item)}
                            title="Open this Project Lab push context. Ledger does not run git."
                            aria-label={`Open Project Lab push contract ${item.id}`}
                          >
                            Open Project Lab
                          </Button>
                          <span className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                            Manual push stays blocked until the Project Lab gate is explicit.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Recent route records">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              {ledgerCopy.routeSectionTitle}
            </div>
            <Badge variant="secondary" className="uppercase">local only</Badge>
          </div>
          {ledgerOverview.isLoading ? (
            <div className="mt-2 rounded px-2 py-1.5 text-[11px]" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              {ledgerCopy.routeLoadingText}
            </div>
          ) : latestRouteRows.length === 0 ? (
            <div className="mt-2 rounded px-2 py-1.5 text-[11px] leading-snug" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              {ledgerCopy.routeEmptyText}
            </div>
          ) : (
            <div className="mt-2 grid gap-1.5 xl:grid-cols-2">
              {latestRouteRows.map((item) => {
                const routeTaskId = item.taskId;
                const routeApprovalId = item.approvalPreview?.id ?? null;
                const routeApprovalStatus = item.approvalPreview?.status ?? null;
                const routeApprovalDone = routeApprovalStatus != null && routeApprovalStatus !== "pending";
                const routeEvidence = item.workbenchEvidence;
                const routeEvidenceId = routeEvidence?.id ?? null;
                const linkedVision = item.linkedVision;
                const readiness = item.executionReadiness;
                const routeAudit = selectedRouteAuditId === item.id ? routeReceiptAudit.data : null;
                const routeAuditProof = routeAudit
                  ? [
                      { label: "Task", value: routeAudit.proof.hasTask ? "linked" : "missing", tone: routeAudit.proof.hasTask ? C.success : C.warning },
                      { label: "Body", value: routeAudit.proof.hasWorkbenchBody ? "linked" : "missing", tone: routeAudit.proof.hasWorkbenchBody ? C.success : C.warning },
                      { label: "Gate", value: routeAudit.proof.approvalStatus ?? "not queued", tone: routeAudit.proof.hasApprovalPreview ? C.gold : C.textMuted },
                      { label: "Vision", value: routeAudit.linkedVision ? `#${routeAudit.linkedVision.id}` : "unlinked", tone: routeAudit.linkedVision ? C.gold : C.warning },
                      { label: "Executor", value: routeAudit.executorStatus.replace(/_/g, " "), tone: C.gold },
                      { label: "Execute", value: routeAudit.canExecute ? "enabled" : "blocked", tone: routeAudit.canExecute ? C.danger : C.gold },
                    ]
                  : [];
                const readinessProof = readiness
                  ? routeExecutionReadinessProofModel({
                      status: readiness.status,
                      taskId: readiness.taskId,
                      workbenchEvidenceId: readiness.workbenchEvidenceId,
                      approvalId: readiness.approvalId,
                      approvalStatus: readiness.approvalStatus,
                      readyForFutureExecutorReview: readiness.readyForFutureExecutorReview,
                    })
                  : [];
                const routeActions = routeActionModel({
                  routeId: item.id,
                  taskId: routeTaskId,
                  evidenceId: routeEvidenceId,
                  approvalId: routeApprovalId,
                  approvalStatus: routeApprovalStatus,
                  creatingTask: creatingRouteTaskId === item.id,
                  creatingReceipt: creatingRouteReceiptId === item.id,
                  creatingApproval: creatingRouteApprovalId === item.id,
                });
                return (
                  <div key={item.id} className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant="secondary" className="uppercase"><span className="min-w-0 truncate">route #{item.id}</span></Badge>
                      <Badge variant="default" className="uppercase"><span className="min-w-0 truncate">{item.ownerAgent}</span></Badge>
                      <Badge variant="warning" className="uppercase"><span className="min-w-0 truncate">{item.category.replace(/_/g, " ")}</span></Badge>
                      {item.projectName && <Badge variant="secondary" className="uppercase" title={item.projectName}><span className="min-w-0 truncate">{item.projectName}</span></Badge>}
                      {routeApprovalId && (
                        <Badge variant={routeApprovalDone ? routeApprovalStatus === "approved" ? "success" : "destructive" : "warning"} className="uppercase">
                          <span className="min-w-0 truncate">{routeApprovalDone ? `${routeApprovalStatus} gate #${routeApprovalId}` : `gate #${routeApprovalId}`}</span>
                        </Badge>
                      )}
                      {routeEvidenceId && <Badge variant="success" className="uppercase"><span className="min-w-0 truncate">body #{routeEvidenceId}</span></Badge>}
                      {linkedVision && (
                        <Badge variant={linkedVision.status === "active" ? "warning" : linkedVision.status === "achieved" ? "success" : "secondary"} className="uppercase" title={linkedVision.title}>
                          <span className="min-w-0 truncate">vision #{linkedVision.id}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug" style={{ color: C.textPrimary }} title={ledgerRouteText(item.originalText)}>
                      {ledgerRouteText(item.originalText)}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[11px] leading-snug" style={{ color: C.textMuted }} title={ledgerRouteText(item.nextAction)}>
                      {ledgerRouteText(item.nextAction)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] leading-none" style={{ color: C.textMuted }}>
                      <span>Aang</span>
                      <span style={{ color: C.border }}>/</span>
                      <span>{item.mode}</span>
                      <span style={{ color: C.border }}>/</span>
                      <span>{new Date(item.createdAt * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                      <button
                        type="button"
                        className="ml-auto rounded px-1.5 py-0.5 uppercase tracking-wider"
                        onClick={() => {
                          setSelectedRouteAuditId(item.id);
                          setLedgerFocusNotice(`Reading local audit chain for route #${item.id}.`);
                        }}
                        style={{ color: C.accent, border: `1px solid ${workFrame.lineSoft}`, background: workFrame.slab }}
                      >
                        Read Audit
                      </button>
                    </div>
                    {selectedRouteAuditId === item.id && (
                      <div className="mt-2 rounded p-1.5" aria-label={`Route ${item.id} receipt audit read`} style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                            Receipt Audit
                          </span>
                          <span className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                            {routeReceiptAudit.isLoading ? "reading" : "read-only"}
                          </span>
                        </div>
                        {routeReceiptAudit.isError ? (
                          <div className="text-[10px] leading-snug" style={{ color: C.warning }}>
                            Route audit could not be read.
                          </div>
                        ) : routeAudit ? (
                          <>
                            <div className="grid grid-cols-2 gap-1 lg:grid-cols-6">
                              {routeAuditProof.map((field) => (
                                <CompactReadDatum key={field.label} label={field.label} value={field.value} tone={field.tone} />
                              ))}
                            </div>
                            {routeAudit.linkedVision && (
                              <div className="mt-1 grid grid-cols-2 gap-1 lg:grid-cols-4">
                                <CompactReadDatum label="Vision Status" value={routeAudit.linkedVision.status.replace(/_/g, " ")} tone={routeAudit.linkedVision.status === "active" ? C.gold : C.textSecondary} />
                                <CompactReadDatum label="Vision Owner" value={routeAudit.linkedVision.ownerAgent} tone={C.accent} />
                                <CompactReadDatum label="Vision Task" value={routeAudit.linkedVision.taskId ? `#${routeAudit.linkedVision.taskId}` : "unlinked"} tone={routeAudit.linkedVision.taskId ? C.success : C.warning} />
                                <CompactReadDatum label="Vision Stop" value={routeAudit.linkedVision.stopRule} tone={C.textSecondary} />
                              </div>
                            )}
                            <div className="mt-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                              {routeAudit.gates[2]}
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                            Reading local route proof.
                          </div>
                        )}
                      </div>
                    )}
                    {readiness && (
                      <div className="mt-2 rounded p-1.5" aria-label={`Route ${item.id} execution readiness`} style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                            Execution Readiness
                          </span>
                          <span className="text-[9px] uppercase tracking-wider" style={{ color: C.warning }}>
                            No execution
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 lg:grid-cols-5">
                          {readinessProof.map((field) => (
                            <CompactReadDatum key={field.label} label={field.label} value={field.value} tone={proofTone(field.tone)} />
                          ))}
                        </div>
                      </div>
                    )}
                    {linkedVision && (
                      <div className="mt-2 rounded p-1.5" aria-label={`Route ${item.id} linked Vision read`} style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                            Vision Link
                          </span>
                          <span className="text-[9px] uppercase tracking-wider" style={{ color: linkedVision.status === "active" ? C.gold : C.textMuted }}>
                            {linkedVision.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
                          <CompactReadDatum label="Vision" value={`#${linkedVision.id}`} tone={C.gold} />
                          <CompactReadDatum label="Owner" value={linkedVision.ownerAgent} tone={C.accent} />
                          <CompactReadDatum label="Task" value={linkedVision.taskId ? `#${linkedVision.taskId}` : "unlinked"} tone={linkedVision.taskId ? C.success : C.warning} />
                          <CompactReadDatum label="Stop" value={linkedVision.stopRule} tone={C.textSecondary} />
                        </div>
                      </div>
                    )}
                    <div className="mt-2 rounded p-1.5" aria-label={`Route ${item.id} safe actions`} style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                          {ledgerCopy.routeActionsTitle}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                          {ledgerCopy.noExecutionText}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                        {routeActions.map((action) => (
                          <RouteActionButton
                            key={action.key}
                            action={action}
                            onClick={() => {
                              if (action.key === "project") {
                                openRouteProjectFocus(item);
                                return;
                              }
                              if (action.key === "workbench") {
                                if (routeEvidence) {
                                  openWorkbenchEvidence(routeEvidence);
                                  return;
                                }
                                createWorkbenchReceiptFromRouteRecord(item);
                                return;
                              }
                              if (action.key === "gate") {
                                if (routeApprovalId) {
                                  setLedgerFocusNotice(`Approval #${routeApprovalId} ${routeApprovalStatus ?? "recorded"} for route #${item.id}.`);
                                  onNavigate("approvals");
                                  return;
                                }
                                createApprovalFromRouteRecord(item);
                                return;
                              }
                              if (routeTaskId) {
                                openCreatedRouteTask(routeTaskId, item.id);
                                return;
                              }
                              createTaskFromRouteRecord(item);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Latest execution results">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              Execution Results
            </div>
            <Badge variant="secondary" className="uppercase">
              read-only lane
            </Badge>
          </div>
          {ledgerOverview.isLoading ? (
            <div className="mt-2 rounded px-2 py-1.5 text-[11px]" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              Reading local execution receipts.
            </div>
          ) : latestExecutionRows.length === 0 ? (
            <div className="mt-2 rounded px-2 py-1.5 text-[11px] leading-snug" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              No execution result receipts yet. Approved read-only commands will appear here after the run gate records output.
            </div>
          ) : (
            <div className="mt-2 grid gap-1.5 xl:grid-cols-2">
              {latestExecutionRows.map((item) => (
                <div key={item.id} className="rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}>
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="secondary" className="uppercase">result #{item.id}</Badge>
                    <Badge variant={item.status === "completed" ? "success" : item.status === "timed_out" ? "warning" : "destructive"} className="uppercase">
                      {item.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="warning" className="uppercase">proposal #{item.proposalId ?? "none"}</Badge>
                    <Badge variant={item.approvalId ? "success" : "secondary"} className="uppercase">approval #{item.approvalId ?? "none"}</Badge>
                    <Badge variant="secondary" className="uppercase">{item.durationMs}ms</Badge>
                  </div>
                  <div className="mt-1 truncate rounded px-2 py-1 text-[11px]" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}`, color: C.textPrimary }} title={item.command}>
                    <code>{compactCommandLabel(item.command)}</code>
                  </div>
                  <div className="mt-1 grid gap-1 sm:grid-cols-3">
                    <CompactReadDatum
                      label="Risk"
                      value={item.riskClass?.replace(/_/g, " ") ?? "unknown"}
                      tone={item.riskClass === "read_only" ? C.success : item.riskClass === "git_remote_write" ? C.danger : C.warning}
                    />
                    <CompactReadDatum label="Body" value={item.workbenchEvidenceId ? `#${item.workbenchEvidenceId}` : "missing"} tone={item.workbenchEvidenceId ? C.success : C.warning} />
                    <CompactReadDatum label="Task" value={item.taskId ? `#${item.taskId}` : "missing"} tone={item.taskId ? C.success : C.warning} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => openExecutionWorkbenchBody(item)}
                      disabled={item.workbenchEvidenceId == null}
                      title={
                        item.workbenchEvidenceId
                          ? `Open Workbench body #${item.workbenchEvidenceId}. Ledger keeps the execution audit read-only.`
                          : "No Workbench body is linked to this execution result."
                      }
                      aria-label={
                        item.workbenchEvidenceId
                          ? `Open Workbench body ${item.workbenchEvidenceId} for execution result ${item.id}`
                          : `Execution result ${item.id} has no Workbench body`
                      }
                    >
                      Open Body
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 px-2"
                      onClick={() => openExecutionApprovalReceipt(item)}
                      disabled={item.approvalId == null}
                      title={
                        item.approvalId
                          ? `Open approval receipt #${item.approvalId}. Ledger keeps the execution audit read-only.`
                          : "No approval receipt is linked to this execution result."
                      }
                      aria-label={
                        item.approvalId
                          ? `Open approval receipt ${item.approvalId} for execution result ${item.id}`
                          : `Execution result ${item.id} has no approval receipt`
                      }
                    >
                      Open Approval
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => openExecutionTerminalFocus(item)}
                      title="Open Terminal Lab context for this result. This does not rerun the command."
                      aria-label={`Open Terminal Lab context for execution result ${item.id}`}
                    >
                      Open Terminal
                    </Button>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[10px] leading-snug" style={{ color: C.textMuted }} title={item.stdoutSummary || item.stderrSummary || item.receiptBody}>
                    {item.stdoutSummary || item.stderrSummary || item.receiptBody}
                  </div>
                  {item.recoveryNote && (
                    <div className="mt-1 rounded px-2 py-1 text-[10px] leading-snug" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}`, color: item.status === "completed" ? C.success : C.warning }}>
                      Recovery: {item.recoveryNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }} aria-label="Latest Workbench receipts">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              {ledgerFocusProject ? `${ledgerFocusProject.name ?? "Focused Project"} Workbench Receipts` : ledgerCopy.receiptSectionTitle}
            </div>
            <Button
              type="button"
              onClick={() => onNavigate("workbench")}
              variant="outline"
              size="sm"
              title={ledgerCopy.workbenchButtonTitle}
              aria-label={ledgerCopy.workbenchButtonAria}
            >
              {ledgerCopy.workbenchButton}
            </Button>
          </div>
          {ledgerOverview.isLoading ? (
            <div className="mt-2 rounded px-2 py-1.5 text-[11px]" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              {ledgerCopy.receiptLoadingText}
            </div>
          ) : latestEvidenceRows.length === 0 ? (
            <div className="mt-2 rounded px-2 py-1.5 text-[11px] leading-snug" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              {ledgerFocusProject
                ? ledgerCopy.focusedReceiptEmptyText(ledgerFocusProject.name)
                : ledgerCopy.receiptEmptyText}
            </div>
          ) : (
            <div className="mt-2 grid gap-1.5 xl:grid-cols-2">
              {latestEvidenceRows.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedEvidenceId(item.id)}
                  variant="secondary"
                  className="h-auto justify-start rounded p-2 text-left"
                  aria-label={`Preview Workbench body ${item.id}`}
                  style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }}
                >
                  <span className="block w-full min-w-0">
                    <span className="flex flex-wrap items-center gap-1">
                      <Badge variant="secondary" className="uppercase"><span className="min-w-0 truncate">#{item.id}</span></Badge>
                      <Badge variant={item.kind === "terminal_output" ? "warning" : "default"} className="uppercase">
                        <span className="min-w-0 truncate">{ledgerKindLabel(item.kind)}</span>
                      </Badge>
                      <Badge variant={item.validationStatus === "needs_review" ? "warning" : "success"} className="uppercase">
                        <span className="min-w-0 truncate">{item.validationStatus.replace(/_/g, " ")}</span>
                      </Badge>
                      {item.projectName && <Badge variant="warning" className="uppercase" title={item.projectName}><span className="min-w-0 truncate">{item.projectName}</span></Badge>}
                    </span>
                    <span className="mt-1 block truncate text-[12px] font-semibold" style={{ color: C.textPrimary }} title={item.title}>
                      {item.title}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-[11px] leading-snug whitespace-normal" style={{ color: C.textMuted }}>
                      {ledgerReceiptSummary(item.summary)}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          )}
          {selectedEvidence && (
            <div className="mt-2 rounded p-2" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}` }} aria-label={ledgerCopy.selectedAriaLabel}>
              {ledgerFocusNotice && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded px-2 py-1 text-[11px]" style={{ background: workFrame.slab, border: `1px solid ${workFrame.candleSoft}`, color: C.textSecondary }}>
                  <span className="min-w-0">{ledgerFocusNotice}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setLedgerFocusNotice(null)} aria-label="Dismiss Ledger focus notice">
                    Dismiss
                  </Button>
                  {ledgerFocusProject && (
                    <Button type="button" size="sm" variant="outline" onClick={() => setLedgerFocusProject(null)} aria-label="Clear Ledger project focus">
                      Clear Focus
                    </Button>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant="secondary" className="uppercase"><span className="min-w-0 truncate">body #{selectedEvidence.id}</span></Badge>
                  <Badge variant={selectedEvidence.kind === "terminal_output" ? "warning" : "default"} className="uppercase">
                    <span className="min-w-0 truncate">{ledgerKindLabel(selectedEvidence.kind)}</span>
                  </Badge>
                  <Badge variant={selectedEvidence.sensitive ? "destructive" : "success"} className="uppercase">
                    <span className="min-w-0 truncate">{selectedEvidence.sensitive ? "sensitive" : "local"}</span>
                  </Badge>
                  {selectedEvidence.commandObservationId != null && (
                    <Badge variant="warning" className="uppercase"><span className="min-w-0 truncate">terminal #{selectedEvidence.commandObservationId}</span></Badge>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => openWorkbenchEvidence(selectedEvidence)}
                  variant="outline"
                  size="sm"
                  title={`Open body #${selectedEvidence.id} in Workbench. Ledger keeps the audit trail read-only.`}
                  aria-label={`Open Workbench body ${selectedEvidence.id}`}
                >
                  Open Workbench Body
                </Button>
                <Button
                  type="button"
                  onClick={() => openProjectPushContext(selectedEvidence)}
                  variant="secondary"
                  size="sm"
                  title={
                    selectedEvidence.projectName
                      ? `Open ${selectedEvidence.projectName} push context in Project Lab. This does not run git.`
                      : "Open Project Lab push context. This receipt is not linked to a project and does not run git."
                  }
                  aria-label={`Open Project Lab push context for body ${selectedEvidence.id}. This does not run git.`}
                >
                  Project Push Context
                </Button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 rounded px-2 py-1 text-[10px] leading-snug" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
                <Badge variant="secondary" className="uppercase">
                  <span className="min-w-0 truncate">{ledgerCopy.auditReadBadge}</span>
                </Badge>
                <span className="min-w-0">
                  {ledgerCopy.receiptPath}
                </span>
              </div>
              <div className="mt-2 grid gap-1 sm:grid-cols-2 xl:grid-cols-5" aria-label="Selected body audit read">
                {selectedAuditRead.map((item) => (
                  <CompactReadDatum key={item.label} label={item.label} value={item.value} tone={item.tone} wrap />
                ))}
              </div>
              <div className="mt-2 grid gap-1.5 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold" style={{ color: C.textPrimary }} title={selectedEvidence.title}>
                    {selectedEvidence.title}
                  </div>
                  <div className="mt-1 line-clamp-3 text-[11px] leading-snug" style={{ color: C.textMuted }}>
                    {ledgerReceiptSummary(selectedEvidence.summary)}
                  </div>
                </div>
                <div className="grid min-w-0 gap-1 text-[10px] leading-snug" style={{ color: C.textMuted }}>
                  <span className="truncate" title={selectedEvidence.projectName ?? "unlinked"}>Project: {selectedEvidence.projectName ?? "unlinked"}</span>
                  <span className="truncate" title={selectedEvidence.routeAgent ?? "unrouted"}>Route: {selectedEvidence.routeAgent ?? "unrouted"}</span>
                  <span className="truncate" title={selectedEvidence.validationStatus.replace(/_/g, " ")}>Validation: {selectedEvidence.validationStatus.replace(/_/g, " ")}</span>
                  <span className="truncate" title={selectedEvidence.targetUri ?? "none"}>
                    Target: {selectedEvidence.targetUri ? sourceDisplayName(selectedEvidence.targetUri) : "none"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        <details className="rounded p-2" style={{ background: workFrame.slab, border: `1px solid ${workFrame.lineSoft}` }}>
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            {ledgerCopy.rulesTitle}
          </summary>
          <div className="mt-2 grid gap-2">
            <div className="rounded p-2 text-[11px] leading-snug" style={{ background: workFrame.slabMuted, border: `1px solid ${workFrame.lineSoft}`, color: C.textMuted }}>
              {ledgerCopy.rulesBody}
            </div>
            <div className="grid gap-1.5 md:grid-cols-3">
              <LedgerRule title={ledgerCopy.rules.external.title} body={ledgerCopy.rules.external.body} tone={C.warning} />
              <LedgerRule title={ledgerCopy.rules.memory.title} body={ledgerCopy.rules.memory.body} tone={C.accent} />
              <LedgerRule title={ledgerCopy.rules.output.title} body={ledgerCopy.rules.output.body} tone={C.gold} />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

function LedgerRule({ title, body, tone }: { title: string; body: string; tone: string }) {
  return (
    <div className="rounded p-2" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: tone }}>
        {title}
      </div>
      <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>
        {body}
      </div>
    </div>
  );
}

function RouteActionButton({ action, onClick }: { action: RouteAction; onClick: () => void }) {
  const tone = action.status === "saved" ? C.success : action.status === "pending" ? C.warning : C.accent;
  return (
    <Button
      type="button"
      size="sm"
      variant={action.status === "saved" ? "secondary" : "outline"}
      className="h-auto min-h-10 justify-start whitespace-normal px-2 py-1 text-left"
      onClick={onClick}
      disabled={action.status === "pending"}
      aria-label={action.ariaLabel}
      title={action.title}
      style={{ background: action.status === "saved" ? C.surfaceRaised : C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
    >
      <span className="block min-w-0">
        <span className="block text-[9px] font-semibold uppercase tracking-widest leading-none" style={{ color: tone }}>
          {action.destination}
        </span>
        <span className="mt-1 block text-[11px] leading-tight" style={{ color: C.textPrimary }}>
          {action.label}
        </span>
      </span>
    </Button>
  );
}

function BasementOverview({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const connection = trpc.agents.connectionStatus.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const modelPolicy = trpc.modelTools.policy.useQuery();
  const piccolo = trpc.piccolo.hygieneReport.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const security = trpc.securityGate.recent.useQuery(
    { limit: 20 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const status = connection.data;
  const hygiene = piccolo.data;
  const securityRows = security.data?.items ?? [];
  const riskyReceipts = securityRows.filter((item) => item.riskLevel === "high" || item.riskLevel === "blocked").length;
  const latestRisk = securityRows[0]?.riskLevel ?? "none";
  const ollamaSetup = modelPolicy.data?.ollamaSetupPlan;

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
    <div className="h-full overflow-y-auto p-2" style={{ background: C.background }} aria-label="Basement overview">
      <div className="grid gap-2">
        <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                Basement Overview
              </h2>
              <p className="text-[10px] leading-snug mt-1 max-w-2xl" style={{ color: C.textMuted }}>
                Machine configuration. Providers, models, storage, security, and automation stay below the Keep until needed.
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
              className="h-auto justify-start whitespace-normal p-2 text-left"
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
                <span className="block text-[10px] leading-snug mt-1" style={{ color: C.textMuted }}>
                  {card.meta}
                </span>
              </span>
            </Button>
          ))}
        </section>

        {ollamaSetup && (
          <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }} aria-label="Ollama setup receipt">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
                  Ollama Setup Receipt
                </div>
                <p className="mt-1 max-w-2xl text-[10px] leading-snug" style={{ color: C.textMuted }}>
                  Fast local-first lane. Nothing runs from this overview. Install, pulls, and evals need approval.
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="warning" className="px-1.5 py-0.5" style={{ color: C.warning, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  {ollamaSetup.status.replace(/_/g, " ")}
                </Badge>
                <Badge variant="secondary" className="px-1.5 py-0.5" style={{ color: C.success, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  no install ran
                </Badge>
              </div>
            </div>

            <div className="mt-2 grid gap-1.5 lg:grid-cols-4">
              {ollamaSetup.nextApprovalSteps.map((step) => (
                <div key={step.label} className="rounded p-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  <div className="font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                    {step.label}
                  </div>
                  <div className="mt-1" style={{ color: C.textSecondary }}>{step.gate}</div>
                  <div className="mt-1" style={{ color: C.textMuted }}>{step.receipt}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 grid gap-1.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded p-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
                    Install Status Check
                  </div>
                  <Badge variant="warning" className="px-1.5 py-0.5" style={{ color: C.warning, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                    {ollamaSetup.installStatusCheck.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="mt-1" style={{ color: C.textSecondary }}>{ollamaSetup.installStatusCheck.approvalGate}</div>
                <div className="mt-1" style={{ color: C.textMuted }}>{ollamaSetup.installStatusCheck.noActionTaken}</div>
              </div>
              <div className="rounded p-2 text-[11px] leading-snug" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                <div className="font-semibold uppercase tracking-wider" style={{ color: C.accent }}>
                  Receipt Fields
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ollamaSetup.installStatusCheck.receiptFields.map((field) => (
                    <Badge key={field} variant="secondary" className="px-1.5 py-0.5" style={{ color: C.textSecondary, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
                      {field.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {ollamaSetup.firstApprovalBatch.map((item) => (
                <Badge key={item.model} variant="secondary" className="px-1.5 py-0.5" style={{ color: C.accent, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
                  {item.model}
                </Badge>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => onNavigate("model_tools")} aria-label="Open Model Tools for Ollama setup details">
                Open Model Details
              </Button>
            </div>
          </section>
        )}

        <section className="rounded p-2" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.textPrimary }}>
            Configuration Rules
          </div>
          <div className="grid gap-1.5 mt-1.5 md:grid-cols-3">
            <LedgerRule title="Secrets" body="Tokens, keys, and account grants need explicit approval." tone={C.danger} />
            <LedgerRule title="Models" body="Capability proposals do not call providers by themselves." tone={C.accent} />
            <LedgerRule title="Automation" body="Watchers report first. Writes and cleanup stay gated." tone={C.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}

function RuntimeRouteReceipt({
  result,
  onDismiss,
  onNavigate,
  onSaveRoute,
  onCreateTask,
  isSavingRoute,
  isCreatingTask,
  routeSavedId,
  taskCreated,
}: {
  result: {
    category: string;
    confidence: string;
    aangRead: string;
    cortanaRoute: string[];
    project: { slug: string; label: string; localPath: string } | null;
    ownerAgent: string;
    supportAgents: string[];
    permissionClass: string;
    modelProposal: {
      modelClass: string;
      laneId: string;
      provider: string;
      status: string;
      approvalRequired: boolean;
      dataLeavingMachine: boolean;
      installRequired: boolean;
      reason: string;
      userFacingSummary: string;
      registryRead?: {
        mode: string;
        laneId: string;
        provider: string;
        totalRecords: number;
        trustedEvidenceCount: number;
        cautionCount: number;
        blockedOrFailedCount: number;
        routeDefaultsChanged: boolean;
        rule: string;
        noActionTaken: string[];
      };
    };
    toolProposal: { actionClass: string; perceptionClass: string; externalTarget: boolean; approvalRequired: boolean };
    approvalGates: string[];
    receipt: { kind: string; bodyTarget: string; auditTarget: string; validationTarget: string; summary: string };
    workbenchReceiptDraft: {
      kind: string;
      stage: string;
      saveTarget: string;
      autosave: boolean;
      ownerAgent: string;
      routeAgent: string;
      category: string;
      permissionClass: string;
      projectSlug: string | null;
      projectName: string | null;
      projectPath: string | null;
      projectFocus?: {
        projectSlug: string | null;
        projectName: string | null;
        projectPath: string | null;
        projectId: number | null;
        resolution: string;
        autosave: boolean;
      };
      summary: string;
      routeChain: string[];
      gates: string[];
      nextAction: string;
      modelLane?: {
        laneId: string;
        provider: string;
        modelClass: string;
        status: string;
        reason: string;
        registryRead?: {
          mode: string;
          laneId: string;
          provider: string;
          totalRecords: number;
          trustedEvidenceCount: number;
          cautionCount: number;
          blockedOrFailedCount: number;
          routeDefaultsChanged: boolean;
          rule: string;
          noActionTaken: string[];
        };
      };
    };
    ledgerFocusDraft: {
      kind: string;
      focusTarget: string;
      autosave: boolean;
      ownerAgent: string;
      category: string;
      projectSlug: string | null;
      projectName: string | null;
      auditFilters: {
        ownerAgent: string;
        category: string;
        projectSlug: string | null;
        projectName?: string | null;
        modelLaneId?: string;
        bodyTarget: string;
      };
      focusSummary: string;
    };
    projectFocusDraft?: {
      kind: string;
      focusTarget: string;
      autosave: boolean;
      projectSlug: string | null;
      projectName: string | null;
      projectPath: string | null;
      projectId: number | null;
      focusSummary: string;
    };
    taskDraft: { title: string; agent: string; projectName: string | null; projectPath: string | null };
    nextAction: string;
    gates: string[];
  };
  onDismiss: () => void;
  onNavigate: (id: NavId) => void;
  onSaveRoute: () => void;
  onCreateTask: () => void;
  isSavingRoute: boolean;
  isCreatingTask: boolean;
  routeSavedId: number | null;
  taskCreated: boolean;
}) {
  const routePreviewProof = routePreviewProofModel({
    aangRead: result.aangRead,
    ownerAgent: result.ownerAgent,
    receiptSummary: `${result.receipt.bodyTarget} body. ${result.receipt.auditTarget} audit.`,
    nextAction: result.nextAction,
    cortanaRoute: result.cortanaRoute,
    approvalGate: result.approvalGates[0] ?? "No gate listed",
    modelClass: result.modelProposal.modelClass,
    provider: result.modelProposal.provider,
    modelStatus: result.modelProposal.status,
    toolAction: result.toolProposal.actionClass,
    toolApprovalRequired: result.toolProposal.approvalRequired,
    dataLeavingMachine: result.modelProposal.dataLeavingMachine,
    laneId: result.modelProposal.laneId,
    laneSummary: result.modelProposal.userFacingSummary,
    registryRead: result.modelProposal.registryRead,
  });
  const previewActions = routePreviewActionModel({
    taskCreated,
    creatingTask: isCreatingTask,
    approvalRequired: result.toolProposal.approvalRequired,
  });

  function workbenchPermissionClass(permissionClass: string) {
    if (permissionClass === "public_browser") return "public_browser";
    if (permissionClass === "local_preview") return "local_preview";
    if (permissionClass === "media_review") return "media_review";
    if (permissionClass === "annotation") return "annotation";
    if (permissionClass === "validation") return "validation";
    return "manual_note";
  }

  function openWorkbenchRouteDraft() {
    try {
      const draft = result.workbenchReceiptDraft;
      window.sessionStorage.setItem(
        "cerebro:workbench-draft",
        JSON.stringify({
          kind: "manual_note",
          source: "runtime_route",
          routeKind: draft.kind,
          title: result.taskDraft.title,
          summary: draft.summary,
          routeAgent: draft.ownerAgent,
          permissionClass: workbenchPermissionClass(draft.permissionClass),
          targetUri: draft.projectPath,
          projectName: draft.projectName,
          projectPath: draft.projectPath,
          projectFocus: draft.projectFocus,
          routeChain: draft.routeChain,
          gates: draft.gates,
          nextAction: draft.nextAction,
          modelLane: draft.modelLane,
          notice: "Runtime route receipt staged as a Workbench draft. Review before saving.",
        }),
      );
    } catch {
      // Workbench still opens; no receipt is saved automatically.
    }
    onNavigate("workbench");
  }

  function openLedgerRouteFocus() {
    try {
      const focus = result.ledgerFocusDraft;
      window.sessionStorage.setItem(
        "cerebro:ledger-focus",
        JSON.stringify({
          source: "runtime_route",
          focusKind: focus.kind,
          projectName: focus.projectName,
          filters: focus.auditFilters,
          notice: focus.focusSummary,
        }),
      );
    } catch {
      // Ledger still opens; the user can inspect recent receipts manually.
    }
    onNavigate("ledger");
  }

  function openProjectRouteFocus() {
    try {
      const draft = result.projectFocusDraft;
      window.sessionStorage.setItem(
        "cerebro:project-lab-focus",
        JSON.stringify({
          source: "runtime_route",
          projectId: draft?.projectId ?? null,
          projectName: draft?.projectName ?? result.taskDraft.projectName,
          projectPath: draft?.projectPath ?? result.taskDraft.projectPath,
          projectFocus: draft,
          notice: draft?.focusSummary ?? "Route preview opened Project Lab. No project write is saved.",
        }),
      );
    } catch {
      // Project Lab still opens; the user can select the project manually.
    }
    onNavigate("projects");
  }

  return (
    <div className="px-3 py-2 shrink-0" style={{ background: C.backgroundSoft, borderTop: `1px solid ${C.borderSoft}` }}>
      <section className="rounded p-2" aria-label="Runtime route receipt preview" style={{ background: C.surface, border: `1px solid ${C.borderSoft}` }}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <PreviewChip label="runtime preview" tone={C.gold} />
              <PreviewChip label={result.category.replace(/_/g, " ")} tone={C.accent} />
              <PreviewChip label={`${result.confidence} confidence`} tone={result.confidence === "high" ? C.success : C.warning} />
              {result.project && <PreviewChip label={result.project.label} tone={C.gold} />}
              <PreviewChip label={result.permissionClass.replace(/_/g, " ")} tone={C.textSecondary} />
            </div>
            <div className="mt-1 text-[11px] leading-snug" style={{ color: C.textMuted }}>
              {result.receipt.summary}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={routeSavedId ? "secondary" : "default"}
              className="h-7 px-2"
              onClick={onSaveRoute}
              disabled={isSavingRoute || routeSavedId != null}
              aria-label={routeSavedId ? `Route saved as record ${routeSavedId}` : isSavingRoute ? "Saving route record" : "Save route record"}
              title="Save this Aang to Cortana route read locally. No routed work runs."
            >
              {routeSavedId ? `Route #${routeSavedId}` : isSavingRoute ? "Saving" : "Save Route"}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={onDismiss} aria-label="Dismiss runtime route receipt">
              Dismiss
            </Button>
          </div>
        </div>
        <div className="mt-2 rounded p-1.5" aria-label="Route preview safe actions" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
              Safe destinations
            </span>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>
              save route first
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {previewActions.map((action) => (
              <RouteActionButton
                key={action.key}
                action={action}
                onClick={() => {
                  if (action.key === "project") {
                    openProjectRouteFocus();
                    return;
                  }
                  if (action.key === "workbench") {
                    openWorkbenchRouteDraft();
                    return;
                  }
                  if (action.key === "gate") {
                    openLedgerRouteFocus();
                    return;
                  }
                  onCreateTask();
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
          {routePreviewProof.primary.map((field) => (
            <CompactReadDatum key={field.label} label={field.label} value={field.value} tone={proofTone(field.tone)} />
          ))}
        </div>
        <details className="mt-2 rounded p-1.5" style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}>
          <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            {routePreviewProof.detailsSummary}
          </summary>
          <div className="mt-2 flex flex-wrap gap-1" aria-label="Runtime route proof">
            {routePreviewProof.detailChips.map((chip) => (
              <PreviewChip key={chip.label} label={chip.label} tone={proofTone(chip.tone)} />
            ))}
          </div>
          <div className="mt-2 rounded px-2 py-1 text-[11px] leading-snug" style={{ color: C.textSecondary, background: C.surface, border: `1px solid ${C.borderSoft}` }}>
            <span className="font-semibold uppercase tracking-wider" style={{ color: proofTone(routePreviewProof.lane.tone) }}>
              {routePreviewProof.lane.label}
            </span>{" "}
            {routePreviewProof.lane.summary}
          </div>
        </details>
      </section>
    </div>
  );
}

function PreviewChip({ label, tone }: { label: string; tone: string }) {
  return (
    <Badge
      variant="secondary"
      className="px-1.5 py-0.5"
      style={{ color: tone, background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
    >
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  );
}

function proofTone(tone: "gold" | "accent" | "warning" | "success" | "danger" | "muted") {
  if (tone === "gold") return C.gold;
  if (tone === "accent") return C.accent;
  if (tone === "warning") return C.warning;
  if (tone === "success") return C.success;
  if (tone === "danger") return C.danger;
  return C.textMuted;
}

// ── Right context panel ─────────────────────────────────────────────────────
function ContextPanel({
  agent, mode, nav, heroes, selectedHeroId, onSelectHero, onNavigate, connMode, compact = false,
}: {
  agent: { id: string; name: string; chamber: string; role: string; floor: string; defaultModelClass: string; escalationModelClass?: string; skills: string[]; toolScope: string[] } | undefined;
  mode: Mode;
  nav: NavId;
  heroes: Array<{ id: number; name: string; level: number; state: string; heroClass: string }>;
  selectedHeroId: number | null;
  onSelectHero: (id: number | null) => void;
  onNavigate: (id: NavId) => void;
  connMode: "demo" | "live";
  compact?: boolean;
}) {
  const route = MODE_ROUTES[mode];
  const owner = route[2] ?? "Cortana";
  const activeSurface = activeSurfaceLabel(nav);
  const nextAction = nextActionForSurface(nav, heroes.length, mode);
  const selectedHero = selectedHeroId == null ? null : heroes.find((hero) => hero.id === selectedHeroId) ?? null;
  const activeVisions = trpc.visions.list.useQuery(
    { status: "active", limit: 1 },
    {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const activeVision = activeVisions.data?.items[0] ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Active Agent */}
      <div
        className="px-2.5 py-2 shrink-0"
        style={{
          borderBottom: `1px solid ${mockupShell.marbleLineSoft}`,
          background: "linear-gradient(180deg, rgba(24, 42, 35, 0.98), rgba(8, 17, 15, 0.98))",
          boxShadow: mockupShell.bevel,
        }}
      >
        <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: shellFrame.ivoryMuted }}>
          Route read
        </div>
        {agent ? (
          <>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 shrink-0 rounded flex items-center justify-center"
                style={{ background: mockupShell.frameSoft, border: `1px solid ${shellFrame.brassSoft}`, boxShadow: mockupShell.bevel }}
              >
                <img src="/sprites/keep/aang/rotations/south.png" alt="" className="h-7 w-7" style={{ imageRendering: "pixelated" }} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold" style={{ color: C.textPrimary }}>
                  {agent.name}
                </div>
                <div className="truncate text-[11px]" style={{ color: C.textSecondary }}>
                  {agent.chamber}
                </div>
              </div>
            </div>
            <div className="mt-1.5 text-[11px] leading-snug" style={{ color: C.textSecondary }}>
              {agent.role.split(". ")[0]}.
            </div>
          </>
        ) : (
          <div className="text-xs" style={{ color: C.textMuted }}>Loading…</div>
        )}
      </div>

      <div className={`${compact ? "px-2 py-1.5 space-y-1.5" : "px-2.5 py-2 space-y-2"} shrink-0`} style={{ borderBottom: `1px solid ${mockupShell.marbleLineSoft}` }}>
        <div className="grid grid-cols-2 gap-1.5">
          <ShellMiniStat label="Mode" value={MODE_LABELS[mode]} />
          <ShellMiniStat label="Surface" value={activeSurface} />
        </div>
        <div className={`${compact ? "rounded px-2 py-1.5" : "rounded p-2"}`} style={{ background: "rgba(5, 11, 10, 0.74)", border: `1px solid ${mockupShell.marbleLineSoft}` }}>
          <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: C.textMuted }}>
            Chain
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {route.map((agentName, index) => (
              <Badge
                key={`${agentName}-${index}`}
                variant={index === 0 ? "warning" : index === 1 ? "violet" : "secondary"}
                className="px-1.5 py-0.5"
                style={{
                  background: index === 0
                    ? "rgba(198, 155, 85, 0.14)"
                    : index === 1
                      ? "rgba(154, 114, 255, 0.12)"
                      : "rgba(77, 170, 154, 0.10)",
                  border: `1px solid ${mockupShell.marbleLineSoft}`,
                  color: index === 0 ? C.gold : index === 1 ? C.accentViolet : C.textSecondary,
                }}
              >
                {agentName}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className={`${compact ? "hidden" : "px-2.5 py-2 shrink-0 space-y-1.5"}`} style={{ borderBottom: `1px solid ${mockupShell.marbleLineSoft}`, background: "rgba(5, 11, 10, 0.55)" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
            Active contract
          </div>
          <Badge variant={activeVision ? "warning" : "secondary"} className="px-1.5 py-0.5 uppercase" style={{ color: activeVision ? C.gold : C.textMuted, background: shellFrame.shellSoft, border: `1px solid ${shellFrame.shellLineSoft}` }}>
            {activeVision ? activeVision.status.replace(/_/g, " ") : "none"}
          </Badge>
        </div>
        {activeVision ? (
          <>
            <div className="truncate text-[12px] font-semibold" style={{ color: C.textPrimary }} title={activeVision.title}>
              {activeVision.title}
            </div>
            <div className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
              {activeVision.taskId ? `Task #${activeVision.taskId}` : "Create first task"}.
            </div>
          </>
        ) : (
          <div className="text-[11px] leading-snug" style={{ color: C.textMuted }}>
            No active contract.
          </div>
        )}
      </div>

      {/* Sessions list (moved from left rail) */}
      <div className={compact ? "hidden" : "flex-1 flex flex-col overflow-hidden"}>
        <div
          className="px-2.5 py-1.5 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${mockupShell.marbleLineSoft}`, background: "rgba(6, 13, 12, 0.7)" }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
            {selectedHero ? "Selected" : "Sessions"}
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
          {selectedHero ? (
            <div className="p-2.5">
              <div className="rounded p-2" style={{ background: shellFrame.shellPlaque, border: `1px solid ${mockupShell.marbleLineSoft}` }}>
                <div className="truncate text-xs font-semibold" style={{ color: C.textPrimary }} title={selectedHero.name}>
                  {selectedHero.name}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: STATE_COLORS[selectedHero.state as keyof typeof STATE_COLORS] }}>
                  {STATE_LABELS[selectedHero.state as keyof typeof STATE_LABELS]}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 w-full px-2"
                  onClick={() => onSelectHero(null)}
                  aria-label="Clear selected session"
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : heroes.length === 0 ? (
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
                    background: isSelected ? shellFrame.shellPlaque : "transparent",
                    borderBottom: `1px solid ${mockupShell.marbleLineSoft}`,
                    borderLeft: isSelected ? `2px solid ${shellFrame.brass}` : "2px solid transparent",
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
      <div className={`${compact ? "px-2 py-1.5" : "px-2.5 py-2"} shrink-0`} style={{ borderTop: `1px solid ${mockupShell.marbleLineSoft}`, background: mockupShell.plaque }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
          Next
        </div>
        <div className={`${compact ? "line-clamp-3 text-[10px]" : "text-[11px]"} leading-snug`} style={{ color: C.textSecondary }}>
          {nextAction}
        </div>
        <div className={`${compact ? "hidden" : "mt-2 grid grid-cols-2 gap-1"}`}>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate("projects")} aria-label="Open Project Lab map">
            Project
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate("workbench")} aria-label="Open Workbench receipt body">
            Workbench
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate("ledger")} aria-label="Open Ledger audit trail">
            Ledger
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2" onClick={() => onNavigate("approvals")} aria-label="Open approval gates">
            Gates
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShellMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded px-2 py-1.5" style={{ background: shellFrame.shellPlaque, border: `1px solid ${mockupShell.marbleLineSoft}`, boxShadow: mockupShell.bevel }}>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>
        {label}
      </div>
      <div className="mt-0.5 truncate text-[11px] font-semibold" style={{ color: C.textPrimary }} title={value}>
        {value}
      </div>
    </div>
  );
}

function activeSurfaceLabel(nav: NavId) {
  for (const surfaces of Object.values(ZONE_SURFACES)) {
    const found = surfaces.find((surface) => surface.id === nav);
    if (found) return found.label;
  }
  return "Keep";
}

function nextActionForSurface(nav: NavId, activeSessionCount: number, mode: Mode) {
  return homeShellNextActionCopy(nav, activeSessionCount, mode);
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
  const security = trpc.securityGate.recent.useQuery(
    { limit: 1 },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
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
      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-1.5 rounded px-2.5 py-1.5 shrink-0 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto]"
      aria-label="Ask Aang command bar"
      style={{
        background: mockupShell.plaque,
        border: `1px solid ${mockupShell.marbleLine}`,
        boxShadow: `0 -18px 42px rgba(0, 0, 0, 0.55), ${mockupShell.bevel}`,
      }}
    >
      <div className="flex h-7 overflow-hidden rounded shrink-0" role="group" aria-label="Command mode" style={{ border: `1px solid ${shellFrame.brassSoft}` }}>
        {(["quick", "explore", "build"] as Mode[]).map((m) => (
          <Button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
            aria-label={`Set command mode to ${m}`}
            variant={mode === m ? "secondary" : "ghost"}
            size="sm"
            className="h-full rounded-none px-1.5 sm:px-2"
            style={{
              background: mode === m ? shellFrame.shellPlaqueActive : "transparent",
              color: mode === m ? C.textPrimary : C.textMuted,
            }}
          >
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded sm:flex"
            style={{ background: mockupShell.frameSoft, border: `1px solid ${shellFrame.brassSoft}`, boxShadow: mockupShell.bevel }}
            aria-hidden="true"
          >
            <img
              src="/sprites/keep/aang/rotations/south.png"
              alt=""
              className="h-7 w-7"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <Input
            type="text"
            aria-label="Ask Aang command input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask Aang. Cortana routes it."
            className="h-8 flex-1 min-w-0"
            style={{
              background: "rgba(5, 10, 9, 0.86)",
              border: `1px solid ${mockupShell.marbleLineSoft}`,
              color: C.textPrimary,
              boxShadow: "inset 0 1px 5px rgba(0, 0, 0, 0.45)",
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

      <div className="hidden xl:block shrink-0 w-44">
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
        style={{ border: `1px solid ${shellFrame.shellLineSoft}`, color: latestRiskTone, background: shellFrame.shellPlaque }}
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
        className="h-7 shrink-0 px-2"
        style={{ border: `1px solid ${shellFrame.shellLineSoft}`, color: C.textMuted, background: shellFrame.shellPlaque, opacity: 0.6 }}
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
        className="h-7 shrink-0 px-2"
        style={{
          border: `1px solid ${value.trim() && !isClassifying ? shellFrame.brassSoft : shellFrame.shellLineSoft}`,
          color: value.trim() && !isClassifying ? C.textPrimary : C.textMuted,
          background: value.trim() && !isClassifying ? shellFrame.shellPlaqueActive : "transparent",
          opacity: value.trim() && !isClassifying ? 1 : 0.6,
        }}
        title="Preview routing"
      >
        {isClassifying ? "Reading" : "Preview"}
      </Button>
    </form>
  );
}

function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isExactPhrase(input: string, target: string): boolean {
  return normalizePhrase(input) === normalizePhrase(target);
}
