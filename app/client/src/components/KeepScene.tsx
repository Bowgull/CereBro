// KeepScene — side-cutaway castle Phaser scene.
//
// Three floors: Upper Spires, Ground Hall, Crypts. Each chamber has:
// - Unique idle motion signature per agent (bob amp/speed/rotation/sway)
// - Active state: faster motion + accent tint + patrol walk within chamber
// - Chamber lighting reacts to state (torch alpha, floor glow)
// - Cortana's orb drifts toward whichever chamber is active
//
// State machine wired via setAgentStates() called from the React wrapper
// whenever tRPC keep.agents reports a change.

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { CHAMBERS, cerebroColors as C, agentStateTier, type AgentState } from "../lib/keepConfig";

// ── Geometry ────────────────────────────────────────────────────────────────
const TILE = 16;
const SCALE = 4;
const TS = TILE * SCALE;

// Phase 4A: chambers got 43% more interior height (7 → 10 rows) so props,
// back-wall features, and agents have room to breathe. Width bumped to 50
// to make room for chamber dividers + the Cortana cathedral nave.
const FLOOR_TILES_TALL = 10;
const FLOOR_TILES_WIDE = 50;

const CANVAS_W = FLOOR_TILES_WIDE * TS;
const CANVAS_H = (FLOOR_TILES_TALL * 3 + 1) * TS;

// Floor segments — chambers, dividers, and the cathedral opening on Upper.
// Order = left-to-right placement. Widths sum to FLOOR_TILES_WIDE (50).
//
// Cortana's chamber on Ground occupies cols 18-31 (14 wide). The Upper floor
// opening occupies the same column range, leaving a vertical cathedral
// nave: Cortana's back wall continues up uninterrupted into Upper Spires.
type FloorSegment =
  | { kind: "chamber"; agentId: string; width: number }
  | { kind: "divider"; width: number }
  | { kind: "opening"; width: number };

const DIVIDER_W = 1;

// Upper Spires: Batman, Aang, [cathedral nave above Cortana], Oak, Spock.
const UPPER_SEGMENTS: FloorSegment[] = [
  { kind: "chamber", agentId: "batman", width: 8 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "aang",   width: 8 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "opening",                    width: 14 }, // cathedral nave
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "oak",    width: 8 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "spock",  width: 8 },
];

// Ground Hall: Tony, Gojo, Cortana (cathedral, 14 wide), Surfer, C-3PO.
const GROUND_SEGMENTS: FloorSegment[] = [
  { kind: "chamber", agentId: "tony",    width: 8 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "gojo",    width: 8 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "cortana", width: 14 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "surfer",  width: 8 },
  { kind: "divider", width: DIVIDER_W },
  { kind: "chamber", agentId: "c3po",    width: 8 },
];

// Crypts: Piccolo alone, full width.
const CRYPTS_SEGMENTS: FloorSegment[] = [
  { kind: "chamber", agentId: "piccolo", width: 50 },
];

// ── Castle tileset (PixelLab — 32×32) ──────────────────────────────────────
// One 32×32 tile occupies a 2×2 block of the 16×16 source grid (96 screen
// px on each side at SCALE=3), so we walk in steps of 2 columns/rows.
// Two batches:
//   tileset/    — original wall + decoration tiles (loaded as castle_0..15)
//   tileset/arch/ — second batch architecture/floor tiles (loaded as arch_0..15)
const CASTLE_TILE_BASE = "/sprites/cerebro/tileset";
const CASTLE_WALL_POOL = [0, 1];      // tileset/tile_0,1 — main wall body (top band)
const CASTLE_BACKWALL_POOL = [2, 3];  // tileset/tile_2,3 — darker stone (chamber interior back wall)
const CASTLE_FLOOR_POOL = [8, 9];     // tileset/tile_8,9 — interior floor (horizontal stone slabs)
const ARCH_PASSAGE = 7;           // arch/tile_7 — open archway passage
const ARCH_DOOR = 6;              // arch/tile_6 — closed wooden door
const ARCH_TRAPDOOR = 8;          // arch/tile_8 — trapdoor in floor
const ARCH_LADDER = 9;            // arch/tile_9 — ladder against wall
const ARCH_RUNE = 15;             // arch/tile_15 — magic circle (under Cortana)

// Inter-floor passages — arched stone doorways with stairs visible descending
// inside. Placed in the top-wall band of the LOWER floor at each transition
// point, so reading from the lower floor you see stairs going up into the
// floor above. arch/tile_7 is a 32×32 archway (2×2 grid cells).
//
// Coords assume FLOOR_TILES_TALL=10: Upper rowOffset=0, Ground rowOffset=10,
// Crypts rowOffset=20. The cathedral opening occupies cols 18-31 on Upper.
type Passage = { col: number; row: number };
const PASSAGES: Passage[] = [
  // Upper ↔ Ground — drawn in Ground's top-wall band (row 10).
  // Place on Aang and Oak chamber edges adjacent to the cathedral opening.
  { col: 14, row: 10 }, // Aang's right edge → opening
  { col: 34, row: 10 }, // Oak's left edge → opening
  // Ground ↔ Crypts — drawn in Crypts' top-wall band (row 20).
  { col: 6,  row: 20 }, // left passage (under Tony)
  { col: 42, row: 20 }, // right passage (under C-3PO)
];

// ── Per-agent motion config ──────────────────────────────────────────────────
interface TweenCfg {
  bobAmp: number; bobDur: number;
  xAmp: number;   xDur: number;
  rotAmp: number; rotDur: number;
  ease: string;   alpha: number;
}

interface AgentMotion {
  idle: TweenCfg;
  active: TweenCfg;
  tint: number;
  patrol: boolean;
}

const MOTION: Record<string, AgentMotion> = {
  cortana: {
    idle:   { bobAmp: 6, bobDur: 1400, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 9, bobDur: 900,  xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0xa78bfa, patrol: false,
  },
  tony: {
    idle:   { bobAmp: 3, bobDur: 1400, xAmp: 0, xDur: 0,   rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 2, bobDur: 180,  xAmp: 3, xDur: 70,  rotAmp: 0, rotDur: 0, ease: "Linear",         alpha: 1 },
    tint: 0xf97316, patrol: true,
  },
  gojo: {
    idle:   { bobAmp: 2, bobDur: 2200, xAmp: 0, xDur: 0,    rotAmp: 1.5,  rotDur: 3200, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 3, bobDur: 1100, xAmp: 0, xDur: 0,    rotAmp: -3.5, rotDur: 1200, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0x60a5fa, patrol: true,
  },
  batman: {
    idle:   { bobAmp: 2, bobDur: 3800, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 4, bobDur: 1600, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Bounce.easeOut",  alpha: 1 },
    tint: 0xfbbf24, patrol: true,
  },
  aang: {
    idle:   { bobAmp: 5, bobDur: 950,  xAmp: 4, xDur: 1500, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 9, bobDur: 580,  xAmp: 0, xDur: 0,    rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0x34d399, patrol: true,
  },
  oak: {
    idle:   { bobAmp: 2, bobDur: 2600, xAmp: 6, xDur: 3000, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 2, bobDur: 1800, xAmp: 0, xDur: 0,    rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0x6ee7b7, patrol: true,
  },
  spock: {
    idle:   { bobAmp: 2, bobDur: 2400, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 2, bobDur: 1600, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0x67e8f9, patrol: true,
  },
  surfer: {
    idle:   { bobAmp: 4, bobDur: 1700, xAmp: 7,  xDur: 2400, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 7, bobDur: 900,  xAmp: 0,  xDur: 0,    rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0xe2e8f0, patrol: true,
  },
  c3po: {
    idle:   { bobAmp: 2, bobDur: 1900, xAmp: 0, xDur: 0,  rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 4, bobDur: 110,  xAmp: 2, xDur: 55, rotAmp: 0, rotDur: 0, ease: "Linear",         alpha: 1 },
    tint: 0xfde68a, patrol: false,
  },
  piccolo: {
    idle:   { bobAmp: 4, bobDur: 3400, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    active: { bobAmp: 5, bobDur: 2200, xAmp: 0, xDur: 0, rotAmp: 0, rotDur: 0, ease: "Sine.easeInOut", alpha: 1 },
    tint: 0x059669, patrol: true,
  },
};

// ── Chamber props ─────────────────────────────────────────────────────────────
type Prop = { key: string; col: number; row: number; depth?: number };

// Per-chamber PixelLab props — 32×32 hero pieces and supporting decor.
// `key` is a loaded texture, `col` is grid cells from chamber's left edge,
// `row` is grid rows from the floor surface (0 = on floor, negative = up wall).
const PROP_PATH = "/sprites/cerebro/props";
const PROP_KEYS = [
  "anvil", "forge_bellows", "drafting_table", "mannequin",
  "hitching_post", "saddlebag", "gold_lectern",
  "war_table", "weapon_rack", "wind_chimes",
  "herb_shelf", "magnifying_glass", "astrolabe", "telescope",
  "crystal_ball",
] as const;

// Per-chamber prop placements. Cols are chamber-local (0 = chamber's left
// edge). After Phase 4A geometry: Ground/Upper non-Cortana chambers are 8
// wide, Cortana 14 wide, Crypts 50 wide. All anchored to row 0 (floor).
const CHAMBER_PIXELLAB_PROPS: Record<string, Prop[]> = {
  // Ground Hall — chambers 8 wide except Cortana (14)
  tony: [
    { key: "anvil",          col: 2, row: 0 },
    { key: "forge_bellows",  col: 5, row: 0 },
  ],
  gojo: [
    { key: "drafting_table", col: 2, row: 0 },
    { key: "mannequin",      col: 5, row: 0 },
  ],
  cortana: [],
  surfer: [
    { key: "hitching_post",  col: 2, row: 0 },
    { key: "saddlebag",      col: 5, row: 0 },
  ],
  c3po: [
    { key: "gold_lectern",   col: 2, row: 0 },
  ],
  // Upper Spires — chambers 8 wide
  batman: [
    { key: "war_table",      col: 2, row: 0 },
    { key: "weapon_rack",    col: 5, row: -1 },
  ],
  aang: [
    { key: "wind_chimes",    col: 3, row: -2 },
  ],
  oak: [
    { key: "herb_shelf",        col: 2, row: -1 },
    { key: "magnifying_glass",  col: 5, row: 0 },
  ],
  spock: [
    { key: "astrolabe",      col: 2, row: 0 },
    { key: "telescope",      col: 5, row: 0 },
  ],
  // Crypts — Piccolo alone, 50 wide
  piccolo: [
    { key: "crystal_ball",   col: 24, row: 0 },
  ],
};

// ── Use-spots & path graph ──────────────────────────────────────────────────
// Phase 4A: data only. The runtime A* + animation pass land in Phase 4B/5.
// Coords are chamber-local; the runtime adds chamber offsets at lookup time.
//
// hero  = where the agent stands when actively working at their hero prop
// idle  = neutral standing position when nothing is happening
// council = position in Cortana's hub during a multi-agent ceremony
//
// Cortana's council ring is two-tier per the locked Z option: 6 use-spots in
// front (closer to camera, full size) and 4 in back (further, slightly higher
// y, partially behind the dais). Aang gets the marked seat closest to Cortana
// to read as the convener.

interface UseSpot {
  type: "hero" | "idle";
  col: number;   // chamber-local col
  row: number;   // grid rows above floor surface (0 = on floor, negative = up)
  facing: "south" | "east" | "north" | "west";
}

interface CouncilSpot {
  agentId: string;
  col: number;
  row: number;
  facing: "south" | "east" | "north" | "west";
  tier: "front" | "back";
  marked?: boolean;  // Aang's convener seat
}

const CHAMBER_USE_SPOTS: Record<string, { hero: UseSpot; idle: UseSpot }> = {
  tony:    { hero: { type: "hero", col: 1, row: 0, facing: "east"  }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  gojo:    { hero: { type: "hero", col: 2, row: 0, facing: "east"  }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  cortana: { hero: { type: "hero", col: 7, row: 0, facing: "south" }, idle: { type: "idle", col: 7, row: 0, facing: "south" } },
  surfer:  { hero: { type: "hero", col: 2, row: 0, facing: "east"  }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  c3po:    { hero: { type: "hero", col: 2, row: 0, facing: "east"  }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  batman:  { hero: { type: "hero", col: 4, row: 0, facing: "south" }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  aang:    { hero: { type: "hero", col: 4, row: 0, facing: "south" }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  oak:     { hero: { type: "hero", col: 2, row: 0, facing: "east"  }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  spock:   { hero: { type: "hero", col: 4, row: 0, facing: "south" }, idle: { type: "idle", col: 4, row: 0, facing: "south" } },
  piccolo: { hero: { type: "hero", col: 24, row: 0, facing: "south" }, idle: { type: "idle", col: 24, row: 0, facing: "south" } },
};

// Cortana's hub is 14 wide. Cortana stands at chamber col 7 (center).
const CORTANA_COUNCIL_SPOTS: CouncilSpot[] = [
  // Aang — convener, marked seat closest to Cortana
  { agentId: "aang",    col: 6,  row: 1, facing: "east",  tier: "front", marked: true },
  // Front row (6 total including Aang) — closer to camera
  { agentId: "tony",    col: 2,  row: 0, facing: "east",  tier: "front" },
  { agentId: "gojo",    col: 4,  row: 0, facing: "east",  tier: "front" },
  { agentId: "surfer",  col: 9,  row: 0, facing: "west",  tier: "front" },
  { agentId: "c3po",    col: 11, row: 0, facing: "west",  tier: "front" },
  { agentId: "batman",  col: 1,  row: 0, facing: "east",  tier: "front" },
  // Back row (4) — further from camera, slightly raised, may be partly
  // occluded by the dais. Render scale is reduced in Phase 5.
  { agentId: "oak",     col: 4,  row: -1, facing: "south", tier: "back" },
  { agentId: "spock",   col: 10, row: -1, facing: "south", tier: "back" },
  { agentId: "piccolo", col: 6,  row: -1, facing: "south", tier: "back" },
  { agentId: "batman",  col: 8,  row: -1, facing: "south", tier: "back" },  // overflow / paired call
];

// Path graph — static nodes + edges for inter-chamber walking. The runtime
// A* pass uses this in Phase 5. Coords are canvas grid (col, row).
interface PathNode { id: string; col: number; row: number }
interface PathEdge { from: string; to: string }

const PATH_NODES: PathNode[] = [
  // Chamber centers (canvas coords reflect new geometry)
  { id: "chamber:batman",  col: 4,  row: 8  },
  { id: "chamber:aang",    col: 13, row: 8  },
  { id: "chamber:oak",     col: 37, row: 8  },
  { id: "chamber:spock",   col: 46, row: 8  },
  { id: "chamber:tony",    col: 4,  row: 18 },
  { id: "chamber:gojo",    col: 13, row: 18 },
  { id: "chamber:cortana", col: 25, row: 18 },
  { id: "chamber:surfer",  col: 37, row: 18 },
  { id: "chamber:c3po",    col: 46, row: 18 },
  { id: "chamber:piccolo", col: 25, row: 28 },
  // Passages (entry points on each side)
  { id: "passage:upper-aang-down",    col: 14, row: 10 },
  { id: "passage:upper-oak-down",     col: 34, row: 10 },
  { id: "passage:ground-tony-down",   col: 6,  row: 20 },
  { id: "passage:ground-c3po-down",   col: 42, row: 20 },
];

const PATH_EDGES: PathEdge[] = [
  // Upper corridor
  { from: "chamber:batman", to: "chamber:aang" },
  { from: "chamber:aang",   to: "passage:upper-aang-down" },
  { from: "chamber:oak",    to: "passage:upper-oak-down" },
  { from: "chamber:oak",    to: "chamber:spock" },
  // Ground corridor
  { from: "chamber:tony",    to: "chamber:gojo" },
  { from: "chamber:gojo",    to: "chamber:cortana" },
  { from: "chamber:cortana", to: "chamber:surfer" },
  { from: "chamber:surfer",  to: "chamber:c3po" },
  // Floor transitions
  { from: "passage:upper-aang-down", to: "chamber:cortana" },
  { from: "passage:upper-oak-down",  to: "chamber:cortana" },
  { from: "chamber:tony",  to: "passage:ground-tony-down" },
  { from: "chamber:c3po",  to: "passage:ground-c3po-down" },
  { from: "passage:ground-tony-down", to: "chamber:piccolo" },
  { from: "passage:ground-c3po-down", to: "chamber:piccolo" },
];

// ── State icon emote glyphs ─────────────────────────────────────────────────
// Floating pixel-art icon above sprite, mapped from the 12-state machine.
// Phase 4B uses 16×16 PixelLab icons. States with no icon ("") render
// nothing — the chamber lighting + agent motion carries the signal.
const STATE_ICON_KEY: Record<string, string> = {
  idle:                       "",
  "loading-context":          "icon_working",
  "working-local":            "icon_working",
  "escalation-pending":       "icon_alert",
  "working-external":         "icon_working",
  "output-pending-validation":"icon_needs_input",
  "validation-failed":        "icon_alert",
  "awaiting-user-approval":   "icon_needs_input",
  "walking-to-ceremony":      "icon_working",
  "council-seated":           "",
  "receiving-call":           "icon_speaking",
  dormant:                    "icon_paused",
  complete:                   "",
};

// ── Scene ─────────────────────────────────────────────────────────────────────
class KeepScene extends Phaser.Scene {
  // Sprite refs
  private agentSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private agentBaseX: Map<string, number> = new Map();
  private agentBaseY: Map<string, number> = new Map();

  // Chamber structural refs (for state-driven changes)
  private chamberBounds: Map<string, { xLeft: number; xRight: number; yFloor: number }> = new Map();
  private chamberTorches: Map<string, Phaser.GameObjects.Image[]> = new Map();
  private chamberGlows: Map<string, Phaser.GameObjects.Graphics> = new Map();

  // Torch flicker
  private allTorches: Phaser.GameObjects.Image[] = [];

  // Cortana specials
  private orbRef: Phaser.GameObjects.Graphics | null = null;
  private cortanaCenterX: number = 0;

  // State tracking + floating state-icon emote per agent
  private currentStates: Partial<Record<string, AgentState>> = {};
  private agentEmotes: Map<string, Phaser.GameObjects.Image> = new Map();

  constructor() { super({ key: "KeepScene" }); }

  preload() {
    for (const c of CHAMBERS) {
      this.load.image(`agent_${c.agentId}`, c.spritePath);
    }
    // Custom castle tiles (32×32 PixelLab) — first batch (walls/decor)
    for (let i = 0; i < 16; i++) {
      this.load.image(`castle_${i}`, `${CASTLE_TILE_BASE}/tile_${i}.png`);
    }
    // Custom castle tiles — second batch (architecture: floors, doors, ladders)
    for (let i = 0; i < 16; i++) {
      this.load.image(`arch_${i}`, `${CASTLE_TILE_BASE}/arch/tile_${i}.png`);
    }
    // PixelLab chamber props (32×32, named)
    for (const key of PROP_KEYS) {
      this.load.image(`prop_${key}`, `${PROP_PATH}/${key}.png`);
    }
    // Cortana hub backdrop — 320×200 hand-pixeled throne room
    this.load.image("cortana_hub", "/sprites/cerebro/hub/v1.png");

    // Phase 4B: per-chamber themed tiles. floor_<id> = chamber-specific floor
    // overlay (forge brick for Tony, marble for Cortana, dirt for Piccolo,
    // etc.). feature_<id> = signature back-wall feature (forge furnace,
    // holographic dome, telescope chart, etc.). Plus Cortana cathedral
    // specials and state-icon glyphs.
    const themedAgents = ["tony", "gojo", "cortana", "surfer", "c3po",
      "batman", "aang", "oak", "spock", "piccolo"];
    for (const id of themedAgents) {
      this.load.image(`floor_${id}`,   `${CASTLE_TILE_BASE}/floors/${id}.png`);
      this.load.image(`feature_${id}`, `${CASTLE_TILE_BASE}/features/${id}.png`);
    }
    this.load.image("feature_cortana_column", `${CASTLE_TILE_BASE}/features/cortana_column.png`);
    this.load.image("feature_cortana_dome",   `${CASTLE_TILE_BASE}/features/cortana_dome.png`);

    // State icon emote glyphs (16×16). Phase 4B replaces the Phaser.Text
    // Unicode placeholders with these pixel-art icons.
    const icons = ["alert", "needs_input", "paused", "working", "speaking"];
    for (const k of icons) {
      this.load.image(`icon_${k}`, `/sprites/cerebro/icons/${k}.png`);
    }

    // Storage destination signage (placed in Phase 4C / harness wiring).
    this.load.image("storage_vault",   "/sprites/cerebro/storage/vault.png");
    this.load.image("storage_gallery", "/sprites/cerebro/storage/gallery.png");
    this.load.image("storage_notion",  "/sprites/cerebro/storage/notion_portal.png");
  }

  create() {
    this.cameras.main.setBackgroundColor(C.background);

    this.buildFloor("upper",  UPPER_SEGMENTS,  0);
    this.buildFloor("ground", GROUND_SEGMENTS, FLOOR_TILES_TALL);
    this.buildFloor("crypts", CRYPTS_SEGMENTS, FLOOR_TILES_TALL * 2);
    this.drawCrenellations();
    this.placePassages();

    // Torch flicker — alpha + scale pulse on the static custom torch tile.
    for (const t of this.allTorches) {
      const phase = (t.getData("phase") as number) ?? 0;
      this.tweens.add({
        targets: t, alpha: 0.7, duration: 180 + phase * 30, yoyo: true,
        repeat: -1, ease: "Sine.easeInOut", delay: phase * 60,
      });
    }

    // Spock head-tilt twitch — periodic x-scale snap
    const spock = this.agentSprites.get("spock");
    if (spock) {
      this.time.addEvent({
        delay: 4200, loop: true,
        callback: () => {
          this.tweens.add({ targets: spock, scaleX: -3.0, duration: 60, yoyo: true, ease: "Linear", onComplete: () => spock.setScale(3.0, spock.scaleY) });
        },
      });
    }

    // Ambient dust motes
    this.spawnDustMotes(0, FLOOR_TILES_TALL, 12);
    this.spawnDustMotes(FLOOR_TILES_TALL, FLOOR_TILES_TALL * 2, 12);
    this.spawnDustMotes(FLOOR_TILES_TALL * 2, FLOOR_TILES_TALL * 3, 8);

    // Start everyone in idle
    for (const [agentId] of this.agentSprites) {
      this.applyIdleMotion(agentId);
    }
  }

  private buildFloor(
    _floorId: "upper" | "ground" | "crypts",
    segments: FloorSegment[],
    rowOffset: number
  ) {
    const yTop = rowOffset;
    const yWallBase = rowOffset + FLOOR_TILES_TALL - 2;
    const yFloor = rowOffset + FLOOR_TILES_TALL - 1;

    // Walk segments once to map every column to its segment kind. Opening
    // columns skip top wall + back wall + floor (cathedral nave reaches up).
    const colKind: Array<"chamber" | "divider" | "opening"> = [];
    {
      let cx = 0;
      for (const seg of segments) {
        for (let k = 0; k < seg.width; k++) colKind.push(seg.kind);
        cx += seg.width;
      }
      while (colKind.length < FLOOR_TILES_WIDE) colKind.push("opening");
    }
    const isOpen = (c: number) => colKind[c] === "opening";

    // Back wall — three layers of 32×32 tiles fill rows 2..7 between the top
    // wall (rows 0-1) and the floor (rows 8-9). Each tile spans 2 grid rows.
    // Skip opening columns so Cortana's back wall extends up uninterrupted.
    for (const rowBase of [yTop + 2, yTop + 4, yTop + 6]) {
      for (let c = 0; c < FLOOR_TILES_WIDE; c += 2) {
        if (isOpen(c) || isOpen(c + 1)) continue;
        const variant = Math.floor(c / 2) + Math.floor(rowBase / 2);
        const idx = CASTLE_BACKWALL_POOL[variant % CASTLE_BACKWALL_POOL.length];
        this.placeCastleTile(c, rowBase, `castle_${idx}`);
      }
    }

    // Floor tiles — skip opening columns so the cathedral has no ceiling cap.
    for (let c = 0; c < FLOOR_TILES_WIDE; c += 2) {
      if (isOpen(c) || isOpen(c + 1)) continue;
      const variant = Math.floor(c / 2) + Math.floor(rowOffset / 2);
      const tileIdx = CASTLE_FLOOR_POOL[variant % CASTLE_FLOOR_POOL.length];
      this.placeCastleTile(c, yWallBase, `castle_${tileIdx}`);
    }

    // Top wall — skip opening columns. Phase 4A removes the every-N atmospheric
    // tile rotation since it created visual noise; back to plain stone with
    // accents reserved for per-chamber theming in Phase 4B.
    for (let c = 0; c < FLOOR_TILES_WIDE; c += 2) {
      if (isOpen(c) || isOpen(c + 1)) continue;
      const slot = Math.floor(c / 2) + Math.floor(rowOffset / 2);
      const key = `castle_${CASTLE_WALL_POOL[slot % CASTLE_WALL_POOL.length]}`;
      this.placeCastleTile(c, yTop, key);
    }

    // Chamber dividers — single stone column tile in the middle band so the
    // divider reads as architectural punctuation, not a wall.
    {
      let cx = 0;
      for (const seg of segments) {
        if (seg.kind === "divider") {
          const dc = cx - (cx % 2);
          this.placeCastleTile(dc, yTop + 4, "castle_6");
        }
        cx += seg.width;
      }
    }

    // Iterate chambers (skipping dividers and openings) for props/agents.
    let cx = 0;
    for (const seg of segments) {
      if (seg.kind !== "chamber") { cx += seg.width; continue; }
      const agentId = seg.agentId;
      const w = seg.width;
      const chamber = CHAMBERS.find((c) => c.agentId === agentId);
      if (!chamber) { cx += w; continue; }

      const xLeftPx  = cx * TS;
      const xRightPx = (cx + w) * TS;
      const yFloorPx = (yWallBase + 1) * TS;
      this.chamberBounds.set(agentId, { xLeft: xLeftPx, xRight: xRightPx, yFloor: yFloorPx });

      // Two torches per chamber, snapped to even col so they align with the
      // 2×2 back-wall grid. Phase indexed by agent name length to keep the
      // alpha flicker phases varied across the keep without segment-index math.
      const torchPhase = agentId.length;
      const t1 = this.spawnTorch(cx, yTop + 2, torchPhase * 2);
      const t2 = this.spawnTorch(cx + w - 2, yTop + 2, torchPhase * 2 + 3);
      this.chamberTorches.set(agentId, [t1, t2]);

      // Phase 4B: per-chamber themed floor overlay. Replaces the generic
      // stone slab in this chamber's column range. 32×32 tiles tile across
      // the chamber width every 2 grid cols. Drawn at depth 0.5 so it
      // overlays the base floor but sits below props.
      const floorKey = `floor_${agentId}`;
      if (this.textures.exists(floorKey)) {
        for (let dc = 0; dc < w; dc += 2) {
          if (cx + dc + 1 >= FLOOR_TILES_WIDE) break;
          const img = this.add.image((cx + dc) * TS, yWallBase * TS, floorKey);
          img.setOrigin(0, 0).setScale(SCALE).setDepth(0.5);
        }
      }

      // Phase 4B back-wall features disabled — opaque backgrounds clash.
      // Will regen with transparent BGs in a future pass.

      // Floor glow — hidden until agent is active
      const glowCx = (cx + w / 2) * TS;
      const glowCy = yFloorPx;
      const glow = this.add.graphics();
      glow.fillStyle(MOTION[agentId]?.tint ?? 0xffffff, 0.12);
      glow.fillRect(xLeftPx, yFloorPx - TS / 2, xRightPx - xLeftPx, TS);
      glow.setDepth(1).setAlpha(0);
      this.chamberGlows.set(agentId, glow);

      // Cortana hub
      if (agentId === "cortana") {
        this.cortanaCenterX = glowCx;

        // Flanking stone columns — castle_6 mounted in the back wall band,
        // symmetric around Cortana's center. Chamber is 14 wide; columns at
        // chamber cols 2 and 10 (even-snapped). Three stacked tiles per
        // column for the cathedral-tall back wall (rows 2-7).
        for (const cc of [cx + 2, cx + 10]) {
          this.placeCastleTile(cc, yTop + 2, "castle_6");
          this.placeCastleTile(cc, yTop + 4, "castle_6");
          this.placeCastleTile(cc, yTop + 6, "castle_6");
        }

        // Layered violet dais — outer halo + inner core.
        const daisOuter = this.add.graphics();
        daisOuter.fillStyle(0xa78bfa, 0.12);
        daisOuter.fillCircle(glowCx, glowCy, TS * 2.4);
        daisOuter.setDepth(2);
        this.tweens.add({ targets: daisOuter, alpha: 0.32, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

        const dais = this.add.graphics();
        dais.fillStyle(0xa78bfa, 0.28);
        dais.fillCircle(glowCx, glowCy, TS * 1.6);
        dais.setDepth(3);
        this.tweens.add({ targets: dais, alpha: 0.6, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

        const orb = this.add.graphics();
        orb.fillStyle(0xa78bfa, 0.95);
        orb.fillCircle(0, 0, 7);
        orb.x = glowCx + TS * 1.5;
        orb.y = glowCy - TS * 0.4;
        orb.setDepth(6);
        this.orbRef = orb;
        this.tweens.add({ targets: orb, alpha: 0.55, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: orb, y: orb.y - TS * 0.25, duration: 1900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

      }

      // PixelLab chamber props — 32×32, anchored to floor row, scaled 3×.
      // `row` is grid rows from the floor surface (0 = on floor, negative = up wall).
      const props = CHAMBER_PIXELLAB_PROPS[agentId] ?? [];
      for (const p of props) {
        const px = (cx + p.col) * TS;
        const py = (yWallBase + p.row) * TS;
        this.add.image(px, py, `prop_${p.key}`)
          .setOrigin(0, 0).setScale(SCALE).setDepth(p.depth ?? 4);
      }

      // Agent sprite
      const sxPx = (cx + w / 2) * TS;
      const syPx = (yWallBase + 0.4) * TS;
      const sprite = this.add.image(sxPx, syPx, `agent_${agentId}`)
        .setOrigin(0.5, 1).setScale(3.0).setDepth(5);
      this.agentSprites.set(agentId, sprite);
      this.agentBaseX.set(agentId, sxPx);
      this.agentBaseY.set(agentId, syPx);

      // State-icon emote — pixel-art icon hovering above the sprite. Texture
      // swap on state change in setAgentStates(). Cortana is excluded; her
      // dais halo + orb carry the signal.
      const emote = this.add.image(sxPx, syPx - sprite.displayHeight - 14, "icon_alert")
        .setOrigin(0.5, 0.5).setScale(SCALE * 0.9).setDepth(8).setVisible(false);
      this.agentEmotes.set(agentId, emote);

      cx += w;
    }
  }

  // ── Motion helpers ──────────────────────────────────────────────────────────

  private applyIdleMotion(agentId: string) {
    const sprite = this.agentSprites.get(agentId);
    if (!sprite) return;
    const m = MOTION[agentId];
    if (!m) return;
    const cfg = m.idle;
    const baseX = this.agentBaseX.get(agentId)!;
    const baseY = this.agentBaseY.get(agentId)!;

    this.tweens.killTweensOf(sprite);
    sprite.setTint(0xffffff).setAlpha(cfg.alpha);

    // Reset to base position
    sprite.x = baseX;
    sprite.y = baseY;

    // Bob
    this.tweens.add({ targets: sprite, y: baseY - cfg.bobAmp, duration: cfg.bobDur, yoyo: true, repeat: -1, ease: cfg.ease });

    // X sway (idle only — active uses patrol)
    if (cfg.xAmp > 0) {
      this.tweens.add({ targets: sprite, x: baseX + cfg.xAmp, duration: cfg.xDur, yoyo: true, repeat: -1, ease: cfg.ease });
    }

    // Rotation
    if (cfg.rotAmp !== 0) {
      this.tweens.add({ targets: sprite, angle: cfg.rotAmp, duration: cfg.rotDur, yoyo: true, repeat: -1, ease: cfg.ease });
    }
  }

  private applyActiveMotion(agentId: string) {
    const sprite = this.agentSprites.get(agentId);
    if (!sprite) return;
    const m = MOTION[agentId];
    if (!m) return;
    const cfg = m.active;
    const baseX = this.agentBaseX.get(agentId)!;
    const baseY = this.agentBaseY.get(agentId)!;
    const bounds = this.chamberBounds.get(agentId);

    this.tweens.killTweensOf(sprite);
    sprite.clearTint().setAlpha(cfg.alpha);

    sprite.x = baseX;
    sprite.y = baseY;

    // Bob
    this.tweens.add({ targets: sprite, y: baseY - cfg.bobAmp, duration: cfg.bobDur, yoyo: true, repeat: -1, ease: cfg.ease });

    // Active x-shake (tony, c3po)
    if (cfg.xAmp > 0 && !m.patrol) {
      this.tweens.add({ targets: sprite, x: baseX + cfg.xAmp, duration: cfg.xDur, yoyo: true, repeat: -1, ease: cfg.ease });
    }

    // Rotation (gojo reversal)
    if (cfg.rotAmp !== 0) {
      this.tweens.add({ targets: sprite, angle: cfg.rotAmp, duration: cfg.rotDur, yoyo: true, repeat: -1, ease: cfg.ease });
    }

    // Patrol walk within chamber bounds
    if (m.patrol && bounds) {
      const margin = TS * 1.5;
      const left  = bounds.xLeft  + margin;
      const right = bounds.xRight - margin;
      const range = right - left;
      const dur = Math.max(1800, range * 3.5);
      sprite.x = left + range / 2;
      this.tweens.add({ targets: sprite, x: right, duration: dur, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
        onYoyo: () => sprite.setFlipX(true),
        onRepeat: () => sprite.setFlipX(false),
      });
    }
  }

  private applyDormantMotion(agentId: string) {
    const sprite = this.agentSprites.get(agentId);
    if (!sprite) return;
    const baseY = this.agentBaseY.get(agentId)!;
    const baseX = this.agentBaseX.get(agentId)!;

    this.tweens.killTweensOf(sprite);
    sprite.clearTint().setAlpha(0.45).setAngle(0).setFlipX(false);
    sprite.x = baseX;
    sprite.y = baseY;

    // Very slow shallow bob
    this.tweens.add({ targets: sprite, y: baseY - 1.5, duration: 3800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  private applyChamberLighting(agentId: string, state: "idle" | "active" | "dormant") {
    const torches = this.chamberTorches.get(agentId) ?? [];
    const glow = this.chamberGlows.get(agentId);

    if (state === "active") {
      for (const t of torches) {
        this.tweens.killTweensOf(t);
        this.tweens.add({ targets: t, alpha: 1.0, duration: 400, ease: "Sine.easeOut" });
        this.tweens.add({ targets: t, scaleX: SCALE * 1.1, scaleY: SCALE * 1.1, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      if (glow) {
        this.tweens.killTweensOf(glow);
        this.tweens.add({ targets: glow, alpha: 1, duration: 600, ease: "Sine.easeOut" });
        this.tweens.add({ targets: glow, alpha: 0.6, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: 600 });
      }
    } else if (state === "idle") {
      for (const t of torches) {
        this.tweens.killTweensOf(t);
        this.tweens.add({ targets: t, alpha: 0.85, scaleX: SCALE, scaleY: SCALE, duration: 400 });
      }
      if (glow) {
        this.tweens.killTweensOf(glow);
        this.tweens.add({ targets: glow, alpha: 0, duration: 600 });
      }
    } else {
      for (const t of torches) {
        this.tweens.killTweensOf(t);
        this.tweens.add({ targets: t, alpha: 0.35, scaleX: SCALE, scaleY: SCALE, duration: 600 });
      }
      if (glow) {
        this.tweens.killTweensOf(glow);
        this.tweens.add({ targets: glow, alpha: 0, duration: 400 });
      }
    }
  }

  private updateOrbTarget(activeChamber: string | null) {
    if (!this.orbRef) return;
    const bounds = activeChamber ? this.chamberBounds.get(activeChamber) : null;
    const targetX = bounds
      ? bounds.xLeft + (bounds.xRight - bounds.xLeft) / 2
      : this.cortanaCenterX + TS * 1.5;

    this.tweens.killTweensOf(this.orbRef);
    this.tweens.add({ targets: this.orbRef, x: targetX, duration: 2200, ease: "Sine.easeInOut" });

    // Cortana flips to face the active chamber
    const cortana = this.agentSprites.get("cortana");
    if (cortana && bounds) {
      const facingRight = targetX > this.cortanaCenterX;
      cortana.setFlipX(!facingRight);
    }
  }

  setAgentStates(states: Partial<Record<string, AgentState>>) {
    this.currentStates = states;

    // Map the 12-state machine to render tier (active / idle / dormant).
    // Truth doc §8 lists the full vocabulary; agentStateTier collapses it.
    let firstActiveNonCortana: string | null = null;

    for (const [agentId, sprite] of this.agentSprites) {
      if (!sprite) continue;
      const state = states[agentId];
      const tier = agentStateTier(state);

      if (tier === "active") {
        this.applyActiveMotion(agentId);
        this.applyChamberLighting(agentId, "active");
        if (agentId !== "cortana" && !firstActiveNonCortana) firstActiveNonCortana = agentId;
      } else if (tier === "idle") {
        this.applyIdleMotion(agentId);
        this.applyChamberLighting(agentId, "idle");
      } else {
        this.applyDormantMotion(agentId);
        this.applyChamberLighting(agentId, "dormant");
      }

      // State-icon emote — swap texture or hide. Cortana excluded; her dais
      // halo + orb carry the signal.
      const emote = this.agentEmotes.get(agentId);
      if (emote && agentId !== "cortana") {
        const key = STATE_ICON_KEY[state ?? "idle"] ?? "";
        if (key && this.textures.exists(key)) {
          emote.setTexture(key).setVisible(true);
        } else {
          emote.setVisible(false);
        }
      }
    }

    this.updateOrbTarget(firstActiveNonCortana);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private spawnTorch(col: number, row: number, phase: number): Phaser.GameObjects.Image {
    // Castle torch sconce — castle_11 is a 32×32 tile with the wall section
    // baked in. Origin (0.5, 0.5) so the active-state scale tween grows the
    // sprite outward symmetrically rather than down-and-right (which read as
    // sliding instead of pulsing). Position is the center of the 2×2 grid
    // block the torch occupies, so the visual still aligns with the back wall.
    const evenCol = col - (col % 2);
    const t = this.add.image(evenCol * TS + TS, row * TS + TS, "castle_11");
    t.setOrigin(0.5, 0.5).setScale(SCALE).setDepth(6).setData("phase", phase);
    this.allTorches.push(t);
    return t;
  }

  private spawnDustMotes(rowStart: number, rowEnd: number, count: number) {
    const yMin = rowStart * TS + TS;
    const yMax = (rowEnd - 1) * TS - TS;
    for (let i = 0; i < count; i++) {
      const m = this.add.graphics();
      m.fillStyle(0xfff6c8, 0.22);
      m.fillCircle(0, 0, 1.2);
      m.x = Math.random() * CANVAS_W;
      m.y = yMin + Math.random() * (yMax - yMin);
      m.setDepth(7);
      const dur = 9000 + Math.random() * 6000;
      this.tweens.add({
        targets: m,
        x: m.x + (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 200),
        y: m.y + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60),
        alpha: 0.04, duration: dur, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
        delay: Math.random() * 4000,
      });
    }
  }

  // 32×32 PixelLab castle tile — occupies a 2×2 block of the 16×16 grid.
  // Origin top-left so (col, row) addresses the upper-left corner; the tile
  // spans columns [col..col+1] and rows [row..row+1].
  private placeCastleTile(col: number, row: number, key: string, alpha = 1) {
    const img = this.add.image(col * TS, row * TS, key);
    img.setOrigin(0, 0).setScale(SCALE).setDepth(0);
    if (alpha < 1) img.setAlpha(alpha);
    return img;
  }

  private placePassages() {
    // Archway passages render above wall tiles, below props/agents. arch/tile_7
    // is a stone arch with stairs descending inside — placed in the lower
    // floor's top-wall band, it reads as an opening leading up to the floor above.
    for (const p of PASSAGES) {
      const img = this.add.image(p.col * TS, p.row * TS, "arch_7");
      img.setOrigin(0, 0).setScale(SCALE).setDepth(2);
    }
  }

  private drawCrenellations() {
    for (let c = 0; c < FLOOR_TILES_WIDE; c++) {
      if (c % 2 === 0) {
        this.add.rectangle(c * TS + TS / 2, -TS / 4, TS, TS, 0x252c3b).setDepth(1);
      }
    }
  }
}

// ── React wrapper ─────────────────────────────────────────────────────────────
interface Props {
  agentStates?: Partial<Record<string, AgentState>>;
}

export default function KeepSceneView({ agentStates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<KeepScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: CANVAS_W, height: CANVAS_H,
      backgroundColor: C.background,
      parent: containerRef.current,
      pixelArt: true, antialias: false, roundPixels: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CANVAS_W,
        height: CANVAS_H,
      },
      scene: [KeepScene],
    });

    gameRef.current = game;
    game.events.on("ready", () => {
      sceneRef.current = game.scene.getScene("KeepScene") as KeepScene;
    });

    const applyStyle = () => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.imageRendering = "pixelated";
        canvas.style.display = "block";
      }
    };
    const t1 = setTimeout(applyStyle, 200);
    const t2 = setTimeout(applyStyle, 800);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      game.destroy(true);
      gameRef.current = null; sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && agentStates) sceneRef.current.setAgentStates(agentStates);
  }, [agentStates]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%", height: "100%", overflow: "auto",
        backgroundColor: C.background, display: "flex",
        justifyContent: "center", alignItems: "flex-start",
        padding: "0.5rem", lineHeight: 0, fontSize: 0,
      }}
    />
  );
}
