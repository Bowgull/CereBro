// CereBro Keep — chamber + agent layout for V1
// Three floors. Ten agents, one chamber each. Cortana is the visible center.
// User is hidden; user presence shows as a glowing orb in Cortana's Hub.

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
} as const;

export type FloorId = "upper" | "ground" | "crypts";

export interface FloorConfig {
  id: FloorId;
  name: string;
  index: number;
  blurb: string;
}

export const FLOORS: Record<FloorId, FloorConfig> = {
  upper: { id: "upper", name: "Upper Spires", index: 2, blurb: "Strategy, doctrine, observation, knowledge" },
  ground: { id: "ground", name: "Ground Hall", index: 1, blurb: "The Hub. Where Cortana speaks to you." },
  crypts: { id: "crypts", name: "Crypts", index: 0, blurb: "Sealed and quiet" },
};

export type AgentId =
  | "cortana"
  | "aang"
  | "tony"
  | "gojo"
  | "batman"
  | "surfer"
  | "c3po"
  | "oak"
  | "spock"
  | "piccolo";

export interface AgentConfig {
  id: AgentId;
  name: string;
  role: string;
  chamber: string;
  floor: FloorId;
  // Chamber position on the floor's 3-col grid (col 0..2, row 0..1).
  col: number;
  row: number;
  hue: string;
  initial: string;
}

// Layout per locked plan in memory.
// Upper: Aang (Great Hall), Batman (War Room), Oak (Alchemist's Tower), Spock (Observatory)
// Ground: Cortana (Hub, center), Tony (Forge), Gojo (Atelier), Surfer (Cartography Hall), C-3PO (Scriptorium)
// Crypts: Piccolo
export const AGENTS: Record<AgentId, AgentConfig> = {
  // ── Upper Spires ──
  aang: { id: "aang", name: "Aang", role: "Doctrine & alignment", chamber: "Great Hall", floor: "upper", col: 1, row: 0, hue: cerebroColors.warning, initial: "A" },
  batman: { id: "batman", name: "Batman", role: "Strategy & threat model", chamber: "War Room", floor: "upper", col: 0, row: 0, hue: cerebroColors.stone, initial: "B" },
  oak: { id: "oak", name: "Professor Oak", role: "Knowledge & taxonomy", chamber: "Alchemist's Tower", floor: "upper", col: 2, row: 0, hue: cerebroColors.success, initial: "O" },
  spock: { id: "spock", name: "Spock", role: "Observation & validation", chamber: "Observatory", floor: "upper", col: 2, row: 1, hue: cerebroColors.accent, initial: "S" },

  // ── Ground Hall ──
  cortana: { id: "cortana", name: "Cortana", role: "Conductor. The visible center.", chamber: "The Hub", floor: "ground", col: 1, row: 0, hue: cerebroColors.glowViolet, initial: "C" },
  tony: { id: "tony", name: "Tony Stark", role: "Build & ship", chamber: "The Forge", floor: "ground", col: 0, row: 0, hue: cerebroColors.danger, initial: "T" },
  gojo: { id: "gojo", name: "Gojo", role: "Design & form", chamber: "Atelier", floor: "ground", col: 2, row: 0, hue: cerebroColors.accentViolet, initial: "G" },
  surfer: { id: "surfer", name: "Silver Surfer", role: "Source & ingest", chamber: "Cartography Hall", floor: "ground", col: 0, row: 1, hue: cerebroColors.accent, initial: "Σ" },
  c3po: { id: "c3po", name: "C-3PO", role: "Translation & format", chamber: "Scriptorium", floor: "ground", col: 2, row: 1, hue: cerebroColors.gold, initial: "3" },

  // ── Crypts ──
  piccolo: { id: "piccolo", name: "Piccolo", role: "Scheduling & long memory", chamber: "Crypt of Hours", floor: "crypts", col: 1, row: 0, hue: cerebroColors.success, initial: "P" },
};

export const AGENTS_BY_FLOOR: Record<FloorId, AgentConfig[]> = {
  upper: Object.values(AGENTS).filter((a) => a.floor === "upper"),
  ground: Object.values(AGENTS).filter((a) => a.floor === "ground"),
  crypts: Object.values(AGENTS).filter((a) => a.floor === "crypts"),
};

// V1: every active Claude Code session lights up Cortana's Hub orb.
// Phase 3 will introduce session→agent identification.
export const SESSION_DEFAULT_AGENT: AgentId = "cortana";
