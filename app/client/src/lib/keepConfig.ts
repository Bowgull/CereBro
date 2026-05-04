// CereBro Keep — palette tokens, floor + agent map.
// Phase 1: only Ground Hall renders. Upper + Crypts are honest placeholders
// until the art pipeline session authors their backgrounds.

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

export interface FloorMeta {
  id: FloorId;
  name: string;
  blurb: string;
  ready: boolean;
}

export const FLOORS: Record<FloorId, FloorMeta> = {
  upper: { id: "upper", name: "Upper Spires", blurb: "Strategy, doctrine, observation, knowledge", ready: false },
  ground: { id: "ground", name: "Ground Hall", blurb: "The Hub. Where Cortana speaks to you.", ready: true },
  crypts: { id: "crypts", name: "Crypts", blurb: "Sealed and quiet", ready: false },
};

// Ground floor: maps the 5 existing dungeon rooms to CereBro chambers/agents.
// RoomId values match the keys in DungeonMapPhaser ROOMS.
export type GroundRoomId = "spawn" | "dungeon" | "boss" | "shop" | "rest";

export interface ChamberLabel {
  room: GroundRoomId;
  chamber: string;
  agent: string;
  hue: string;
}

export const GROUND_CHAMBERS: ChamberLabel[] = [
  { room: "boss",    chamber: "The Hub",          agent: "Cortana",       hue: cerebroColors.glowViolet },
  { room: "spawn",   chamber: "The Forge",        agent: "Tony Stark",    hue: cerebroColors.danger },
  { room: "dungeon", chamber: "Atelier",          agent: "Gojo",          hue: cerebroColors.accentViolet },
  { room: "shop",    chamber: "Cartography Hall", agent: "Silver Surfer", hue: cerebroColors.accent },
  { room: "rest",    chamber: "Scriptorium",      agent: "C-3PO",         hue: cerebroColors.gold },
];
