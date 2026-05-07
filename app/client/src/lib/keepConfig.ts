// CereBro Keep — castle layout, chambers, agent identity.
//
// All 11 agents on 3 floors. The Hub (Cortana) is the centerpiece on the
// Ground Hall — large, central, Power-Rangers-command-center vibe with the
// user-orb on the dais. Every other chamber is character-coded with its own
// vibe, accent color, and themed objects.

export const cerebroColors = {
  background: "#0E1116",
  backgroundSoft: "#131821",
  surface: "#181F2A",
  surfaceRaised: "#202A38",
  surfaceMuted: "#151A23",
  border: "#334155",
  borderSoft: "#253041",
  textPrimary: "#F4EFE3",
  textSecondary: "#B8C0CC",
  textMuted: "#7E8898",
  accent: "#6BA6FF",
  accentSoft: "#2D5B8F",
  accentViolet: "#8B5CF6",
  glowViolet: "#A78BFA",
  success: "#9FD2B7",
  warning: "#F6C177",
  danger: "#EF6F6C",
  blocked: "#7F1D1D",
  gold: "#D9B56A",
  stone: "#6B7280",

  // Castle stone palette
  stoneWall:    "#1A1F2A",
  stoneWallHi:  "#252C3B",
  stoneWallLo:  "#10131B",
  stoneMortar:  "#2A3340",
  parapet:      "#1F2632",
} as const;

export type FloorId = "upper" | "ground" | "crypts";

export interface FloorMeta {
  id: FloorId;
  name: string;
  blurb: string;
  ready: boolean;
}

export const FLOORS: Record<FloorId, FloorMeta> = {
  upper:  { id: "upper",  name: "Upper Spires", blurb: "Strategy, validation, logic, intent",         ready: true },
  ground: { id: "ground", name: "Ground Hall",  blurb: "The Hub. Cortana routes; council gathers.",   ready: true },
  crypts: { id: "crypts", name: "Crypts",       blurb: "Sealed and quiet",                            ready: true },
};

export type AgentId =
  | "cortana" | "tony" | "gojo" | "surfer" | "c3po"
  | "batman" | "aang" | "oak" | "spock"
  | "piccolo" | "hedwig";

// Chamber definition — visual identity per agent
export interface Chamber {
  agentId: AgentId;
  agentName: string;          // display name
  chamberName: string;        // room name
  floor: FloorId;
  spritePath: string;         // 92x92 (or 110x110 for Surfer-mounted) PNG path
  hue: string;                // accent color
  hueGlow: string;            // softer glow color (alpha-friendly)
  // Character-coded room props (emoji placeholders for now; will become pixel art later)
  props: string[];
  blurb: string;              // one-line "what this chamber is for"
  // Layout hints
  span: number;               // grid column span on its floor (1 = standard, 2 = double-wide for Cortana)
  isHub?: boolean;            // Cortana's Hub gets special treatment
}

export const CHAMBERS: Chamber[] = [
  // ── Ground Hall ──────────────────────────────────────────────────────────
  {
    agentId: "tony", agentName: "Tony Stark", chamberName: "The Forge", floor: "ground",
    spritePath: "/sprites/keep/tony/rotations/south.png",
    hue: cerebroColors.danger, hueGlow: "rgba(239,111,108,0.18)",
    props: ["⚒", "⚙", "🔥"],
    blurb: "Build. Code. Ship.",
    span: 1,
  },
  {
    agentId: "gojo", agentName: "Gojo", chamberName: "Atelier", floor: "ground",
    spritePath: "/sprites/keep/gojo/rotations/south.png",
    hue: cerebroColors.accentViolet, hueGlow: "rgba(139,92,246,0.18)",
    props: ["🎨", "✦", "🖌"],
    blurb: "Design. Critique. Refine.",
    span: 1,
  },
  {
    agentId: "cortana", agentName: "Cortana", chamberName: "The Hub", floor: "ground",
    spritePath: "/sprites/keep/cortana/rotations/south.png",
    hue: cerebroColors.glowViolet, hueGlow: "rgba(167,139,250,0.22)",
    props: ["◯", "✦", "◇", "✦", "◯"],
    blurb: "Route. Mode. Permissions. Council host.",
    span: 1, isHub: true,
  },
  {
    agentId: "surfer", agentName: "Silver Surfer", chamberName: "Cartography Hall", floor: "ground",
    spritePath: "/sprites/keep/surfer/rotations/south.png",
    hue: cerebroColors.accent, hueGlow: "rgba(107,166,255,0.18)",
    props: ["◯", "✦", "▧"],
    blurb: "Source. Scrape. Portal. Locked until enabled.",
    span: 1,
  },
  {
    agentId: "c3po", agentName: "C-3PO", chamberName: "Scriptorium", floor: "ground",
    spritePath: "/sprites/keep/c3po/rotations/south.png",
    hue: cerebroColors.gold, hueGlow: "rgba(217,181,106,0.18)",
    props: ["📜", "⚙", "✎"],
    blurb: "Translate. Format. Polish.",
    span: 1,
  },

  // ── Upper Spires ─────────────────────────────────────────────────────────
  {
    agentId: "batman", agentName: "Batman", chamberName: "War Room", floor: "upper",
    spritePath: "/sprites/keep/batman/rotations/south.png",
    hue: cerebroColors.warning, hueGlow: "rgba(246,193,119,0.16)",
    props: ["⚠", "▣", "✕"],
    blurb: "Strategy. Threat models. Sequencing.",
    span: 1,
  },
  {
    agentId: "aang", agentName: "Aang", chamberName: "Great Hall", floor: "upper",
    spritePath: "/sprites/keep/aang/rotations/south.png",
    hue: cerebroColors.success, hueGlow: "rgba(159,210,183,0.16)",
    props: ["☯", "≋", "✿"],
    blurb: "Intent. Convene. Mediate. Teach.",
    span: 1,
  },
  {
    agentId: "oak", agentName: "Prof. Oak", chamberName: "Alchemist's Tower", floor: "upper",
    spritePath: "/sprites/keep/oak/rotations/south.png",
    hue: "#8FB4D9", hueGlow: "rgba(143,180,217,0.16)",
    props: ["⚗", "📚", "⌬"],
    blurb: "Validate. Dedup. Privacy. Block.",
    span: 1,
  },
  {
    agentId: "spock", agentName: "Spock", chamberName: "Observatory", floor: "upper",
    spritePath: "/sprites/keep/spock/rotations/south.png",
    hue: "#5BA3D9", hueGlow: "rgba(91,163,217,0.16)",
    props: ["✦", "▲", "✓"],
    blurb: "Logic. Contradiction. Bloat.",
    span: 1,
  },

  // ── Crypts ───────────────────────────────────────────────────────────────
  {
    agentId: "piccolo", agentName: "Piccolo", chamberName: "Sealed Chamber", floor: "crypts",
    spritePath: "/sprites/keep/piccolo/rotations/south.png",
    hue: "#4ADE80", hueGlow: "rgba(74,222,128,0.16)",
    props: ["☾", "✦", "☾"],
    blurb: "Watch. Wait. Long-running jobs.",
    span: 1,
  },
  {
    agentId: "hedwig", agentName: "Hedwig", chamberName: "Messenger Roost", floor: "crypts",
    spritePath: "/sprites/keep/hedwig/rotations/south.png",
    hue: "#E9D5FF", hueGlow: "rgba(233,213,255,0.16)",
    props: ["✉", "◌", "☾"],
    blurb: "Capture. Remind. Message. Route to Notion.",
    span: 1,
  },
];

// Helper: get chambers for a specific floor in display order
export function chambersForFloor(floor: FloorId): Chamber[] {
  return CHAMBERS.filter(c => c.floor === floor);
}

// Agent state — canonical 12-state machine per CEREBRO_TRUTH_RECONCILIATION §8.
// These map to real harness events (task lifecycle, validation, approval),
// not vibes. The Phase 6 harness wiring drives these directly.
export type AgentState =
  | "idle"
  | "loading-context"
  | "working-local"
  | "escalation-pending"
  | "working-external"
  | "output-pending-validation"
  | "validation-failed"
  | "awaiting-user-approval"
  | "walking-to-ceremony"
  | "council-seated"
  | "receiving-call"
  | "dormant"
  | "complete";

export const AGENT_STATE_COLOR: Record<AgentState, string> = {
  idle:                       cerebroColors.accent,
  "loading-context":          cerebroColors.accent,
  "working-local":            cerebroColors.warning,
  "escalation-pending":       "#F97316",                     // amber-orange — approval gate
  "working-external":         cerebroColors.accentViolet,
  "output-pending-validation":cerebroColors.accentViolet,
  "validation-failed":        cerebroColors.danger,
  "awaiting-user-approval":   "#F97316",
  "walking-to-ceremony":      cerebroColors.accent,
  "council-seated":           cerebroColors.glowViolet,
  "receiving-call":           cerebroColors.accent,
  dormant:                    cerebroColors.textMuted,
  complete:                   cerebroColors.success,
};

export const AGENT_STATE_LABEL: Record<AgentState, string> = {
  idle:                       "IDLE",
  "loading-context":          "LOADING",
  "working-local":            "WORKING",
  "escalation-pending":       "APPROVE TO ESCALATE",
  "working-external":         "WORKING (EXT)",
  "output-pending-validation":"AWAITING OAK",
  "validation-failed":        "REWORKING",
  "awaiting-user-approval":   "AWAITS YOU",
  "walking-to-ceremony":      "WALKING",
  "council-seated":           "IN COUNCIL",
  "receiving-call":           "ATTENTIVE",
  dormant:                    "DORMANT",
  complete:                   "COMPLETE",
};

// Render tier for the chamber lighting + motion logic. Many of the 12 states
// collapse to the same tier from a visual-motion standpoint.
export type AgentStateTier = "active" | "idle" | "dormant";

export function agentStateTier(s: AgentState | undefined): AgentStateTier {
  if (!s) return "idle";
  if (s === "dormant") return "dormant";
  if (s === "idle" || s === "complete") return "idle";
  return "active";
}

// Legacy export — Phaser scene still imports this name. Map of ground chambers.
// Kept for backward compatibility while DungeonMapPhaser is being phased out.
export type GroundRoomId = "spawn" | "dungeon" | "boss" | "shop" | "rest";

export interface ChamberLabel {
  room: GroundRoomId;
  chamber: string;
  agent: string;
  hue: string;
  spriteKey: string;
  spritePath: string;
  spriteScale: number;
}

export const GROUND_CHAMBERS: ChamberLabel[] = [
  { room: "boss",    chamber: "The Hub",          agent: "Cortana",       hue: cerebroColors.glowViolet,   spriteKey: "agent_cortana", spritePath: "/sprites/keep/cortana/rotations/south.png", spriteScale: 2.5 },
  { room: "spawn",   chamber: "The Forge",        agent: "Tony Stark",    hue: cerebroColors.danger,       spriteKey: "agent_tony",    spritePath: "/sprites/keep/tony/rotations/south.png",    spriteScale: 2.5 },
  { room: "dungeon", chamber: "Atelier",          agent: "Gojo",          hue: cerebroColors.accentViolet, spriteKey: "agent_gojo",    spritePath: "/sprites/keep/gojo/rotations/south.png",    spriteScale: 2.5 },
  { room: "shop",    chamber: "Cartography Hall", agent: "Silver Surfer", hue: cerebroColors.accent,       spriteKey: "agent_surfer",  spritePath: "/sprites/keep/surfer/rotations/south.png", spriteScale: 2.5 },
  { room: "rest",    chamber: "Scriptorium",      agent: "C-3PO",         hue: cerebroColors.gold,         spriteKey: "agent_c3po",    spritePath: "/sprites/keep/c3po/rotations/south.png",    spriteScale: 2.5 },
];
