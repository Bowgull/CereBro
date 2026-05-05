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
import { CHAMBERS, cerebroColors as C, type AgentState } from "../lib/keepConfig";

// ── Geometry ────────────────────────────────────────────────────────────────
const TILE = 16;
const SCALE = 3;
const TS = TILE * SCALE;

const FLOOR_TILES_TALL = 7;
const FLOOR_TILES_WIDE = 44;

const UPPER_WIDTHS  = [11, 11, 11, 11];
const GROUND_WIDTHS = [8, 8, 12, 8, 8];
const CRYPTS_WIDTHS = [44];

const CANVAS_W = FLOOR_TILES_WIDE * TS;
const CANVAS_H = (FLOOR_TILES_TALL * 3 + 1) * TS;

const UPPER_ORDER  = ["batman", "aang", "oak", "spock"];
const GROUND_ORDER = ["tony", "gojo", "cortana", "surfer", "c3po"];
const CRYPTS_ORDER = ["piccolo"];

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

// Staircase placements — connect floors at chamber boundaries.
// `variant` picks one of stairs/tile_0..3 (all right-going). flipX mirrors for left-going.
// Position is the top-left grid cell where the 32×32 tile is anchored.
type Stair = { col: number; row: number; variant: number; flipX: boolean };
const STAIRS: Stair[] = [
  // Upper Spires ↔ Ground Hall (transition rows 5..8)
  { col: 10, row: 5, variant: 0, flipX: false }, // left-side, ascending right (into Aang's chamber)
  { col: 32, row: 5, variant: 2, flipX: true  }, // right-side, ascending left (into Oak's chamber)
  // Ground Hall ↔ Crypts (transition rows 12..15)
  { col: 6,  row: 12, variant: 1, flipX: false }, // left-side, ascending right
  { col: 36, row: 12, variant: 3, flipX: true  }, // right-side, ascending left
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
  "anvil", "drafting_table", "hitching_post", "gold_lectern",
  "meditation_cushion", "war_table", "spell_lectern", "astrolabe",
  "crystal_pillar", "stained_glass", "bonsai", "bookshelf",
  "telescope", "candelabra", "wooden_chest", "barrel",
] as const;

const CHAMBER_PIXELLAB_PROPS: Record<string, Prop[]> = {
  // Ground Hall (chambers 8 wide; cortana 12 wide)
  tony: [
    // Stair at chamber cols 6-7 (Ground→Crypts left), so props live at cols 0-5.
    { key: "anvil",         col: 0, row: 0 },
    { key: "wooden_chest",  col: 2, row: 0 },
    { key: "barrel",        col: 4, row: 0 },
  ],
  gojo: [
    { key: "drafting_table", col: 1, row: 0 },
    { key: "candelabra",     col: 4, row: 0 },
    { key: "bookshelf",      col: 6, row: 0 },
  ],
  cortana: [
    // Hub backdrop already has stained glass + lanterns; keep chamber clean.
  ],
  surfer: [
    { key: "hitching_post",  col: 1, row: 0 },
    { key: "barrel",         col: 4, row: 0 },
    { key: "candelabra",     col: 6, row: 0 },
  ],
  c3po: [
    // Stair at chamber cols 0-1 (Ground→Crypts right), so props live at cols 2-7.
    { key: "gold_lectern",   col: 2, row: 0 },
    { key: "wooden_chest",   col: 4, row: 0 },
    { key: "candelabra",     col: 6, row: 0 },
  ],
  // Upper Spires (chambers 11 wide)
  batman: [
    { key: "war_table",      col: 4, row: 0 },
    { key: "candelabra",     col: 1, row: 0 },
    { key: "wooden_chest",   col: 8, row: 0 },
  ],
  aang: [
    { key: "meditation_cushion", col: 4, row: 0 },
    { key: "bonsai",             col: 1, row: 0 },
    { key: "bonsai",             col: 8, row: 0 },
  ],
  oak: [
    { key: "spell_lectern",  col: 1, row: 0 },
    { key: "bookshelf",      col: 4, row: 0 },
    { key: "bookshelf",      col: 8, row: 0 },
  ],
  spock: [
    { key: "astrolabe",      col: 1, row: 0 },
    { key: "telescope",      col: 4, row: 0 },
    { key: "bookshelf",      col: 8, row: 0 },
  ],
  // Crypts (44 wide — Piccolo alone, lots of room to fill)
  piccolo: [
    { key: "crystal_pillar", col: 21, row: 0 },
    { key: "candelabra",     col: 4,  row: 0 },
    { key: "candelabra",     col: 14, row: 0 },
    { key: "wooden_chest",   col: 8,  row: 0 },
    { key: "barrel",         col: 17, row: 0 },
    { key: "candelabra",     col: 30, row: 0 },
    { key: "candelabra",     col: 40, row: 0 },
    { key: "wooden_chest",   col: 36, row: 0 },
    { key: "barrel",         col: 26, row: 0 },
  ],
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

  // State tracking
  private currentStates: Partial<Record<string, AgentState>> = {};

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
    // Staircase batch — first 4 right-going variants (we flip for left)
    for (let i = 0; i < 4; i++) {
      this.load.image(`stair_${i}`, `${CASTLE_TILE_BASE}/stairs/tile_${i}.png`);
    }
    // Bonus tiles from the stairs batch — portcullis gate (decorative)
    this.load.image("portcullis", `${CASTLE_TILE_BASE}/stairs/tile_13.png`);
    // PixelLab chamber props (32×32, named)
    for (const key of PROP_KEYS) {
      this.load.image(`prop_${key}`, `${PROP_PATH}/${key}.png`);
    }
    // Cortana hub backdrop — 320×200 hand-pixeled throne room
    this.load.image("cortana_hub", "/sprites/cerebro/hub/v1.png");
  }

  create() {
    this.cameras.main.setBackgroundColor(C.background);

    this.buildFloor("upper",  UPPER_ORDER,  UPPER_WIDTHS,  0);
    this.buildFloor("ground", GROUND_ORDER, GROUND_WIDTHS, FLOOR_TILES_TALL);
    this.buildFloor("crypts", CRYPTS_ORDER, CRYPTS_WIDTHS, FLOOR_TILES_TALL * 2);
    this.drawCrenellations();
    this.placeStairs();

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
          this.tweens.add({ targets: spock, scaleX: -1.6, duration: 60, yoyo: true, ease: "Linear", onComplete: () => spock.setScaleX(1.6) });
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
    order: string[],
    widths: number[],
    rowOffset: number
  ) {
    const yTop = rowOffset;
    const yWallBase = rowOffset + FLOOR_TILES_TALL - 2;
    const yFloor = rowOffset + FLOOR_TILES_TALL - 1;

    // Back wall — darker stone fills the chamber interior (rows yTop+2 .. yTop+4).
    // Two staggered passes of 32×32 tiles cover 4 grid rows; the floor draws
    // afterward and covers the bottom-half overlap.
    for (let c = 0; c < FLOOR_TILES_WIDE; c += 2) {
      const variant = Math.floor(c / 2) + Math.floor(rowOffset / 2);
      const a = CASTLE_BACKWALL_POOL[variant % CASTLE_BACKWALL_POOL.length];
      const b = CASTLE_BACKWALL_POOL[(variant + 1) % CASTLE_BACKWALL_POOL.length];
      this.placeCastleTile(c, yTop + 2, `castle_${a}`);
      this.placeCastleTile(c, yTop + 3, `castle_${b}`);
    }

    // Floor tiles — custom castle stone. One 32×32 tile spans 2×2 grid cells,
    // so we step by 2 across yWallBase row and the tile naturally covers
    // both yWallBase and yFloor rows.
    for (let c = 0; c < FLOOR_TILES_WIDE; c += 2) {
      const variant = Math.floor(c / 2) + Math.floor(rowOffset / 2);
      const tileIdx = CASTLE_FLOOR_POOL[variant % CASTLE_FLOOR_POOL.length];
      this.placeCastleTile(c, yWallBase, `castle_${tileIdx}`);
    }

    // Top wall — custom 32×32 PixelLab castle tiles. One tile spans 2 cols × 2 rows.
    // Periodically swap in atmospheric variants (arrow slits, alcoves) for variety.
    const wallSpecials = [
      { every: 7, key: "arch_11" }, // arrow slit window (every 7th wall position)
      { every: 5, key: "castle_12" }, // arched alcove
    ];
    for (let c = 0; c < FLOOR_TILES_WIDE; c += 2) {
      const slot = Math.floor(c / 2) + Math.floor(rowOffset / 2);
      let key = `castle_${CASTLE_WALL_POOL[slot % CASTLE_WALL_POOL.length]}`;
      for (const sp of wallSpecials) {
        if (slot > 0 && slot % sp.every === 0) { key = sp.key; break; }
      }
      this.placeCastleTile(c, yTop, key);
    }

    let cx = 0;
    for (let i = 0; i < order.length; i++) {
      const agentId = order[i];
      const w = widths[i];
      const chamber = CHAMBERS.find((c) => c.agentId === agentId);
      if (!chamber) { cx += w; continue; }

      const xLeftPx  = cx * TS;
      const xRightPx = (cx + w) * TS;
      const yFloorPx = (yWallBase + 1) * TS;
      this.chamberBounds.set(agentId, { xLeft: xLeftPx, xRight: xRightPx, yFloor: yFloorPx });

      // Two torches per chamber
      const t1 = this.spawnTorch(cx + Math.floor(w / 4), yTop + 2, i * 2);
      const t2 = this.spawnTorch(cx + Math.ceil(w * 3 / 4) - 1, yTop + 2, i * 2 + 3);
      this.chamberTorches.set(agentId, [t1, t2]);

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

        // Hand-pixeled hub backdrop (320×200) fills her chamber's interior.
        // Anchored to the chamber center, sized to the chamber width.
        const hubW = w * TS;
        const hubH = (FLOOR_TILES_TALL - 1) * TS;
        const hub = this.add.image(cx * TS, yTop * TS, "cortana_hub");
        hub.setOrigin(0, 0).setDisplaySize(hubW, hubH).setDepth(0.5);

        const dais = this.add.graphics();
        dais.fillStyle(0xa78bfa, 0.22);
        dais.fillCircle(glowCx, glowCy, TS * 1.6);
        dais.setDepth(3);
        this.tweens.add({ targets: dais, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

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
        .setOrigin(0.5, 1).setScale(1.6).setDepth(5);
      this.agentSprites.set(agentId, sprite);
      this.agentBaseX.set(agentId, sxPx);
      this.agentBaseY.set(agentId, syPx);

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

    // Map CereBro socket states to our 3-tier. Unmapped agents default to
    // idle (full opacity) — they're present, just not currently doing anything.
    // "dormant" is reserved for explicit disconnect/unavailable states.
    const mapState = (s?: AgentState): "active" | "idle" | "dormant" => {
      if (s === "fighting" || s === "casting" || s === "shopping") return "active";
      return "idle";
    };

    let firstActiveNonCortana: string | null = null;

    for (const [agentId, sprite] of this.agentSprites) {
      if (!sprite) continue;
      const tier = mapState(states[agentId]);

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
    }

    this.updateOrbTarget(firstActiveNonCortana);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private spawnTorch(col: number, row: number, phase: number): Phaser.GameObjects.Image {
    // Custom castle torch — tileset/tile_11 (lit torch sconce). Renders at
    // 1.5× source so it matches the visual scale of the old 16×16 torches.
    const t = this.add.image(col * TS + TS / 2, row * TS + TS / 2, "castle_11");
    t.setScale(SCALE / 2).setDepth(3).setData("phase", phase);
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

  private placeStairs() {
    // Stairs render above floor (depth 0) and above wall tiles, below props/agents.
    // They span the floor↔wall transition zone (a 32×32 tile = 2 grid rows).
    for (const s of STAIRS) {
      const img = this.add.image(s.col * TS, s.row * TS, `stair_${s.variant}`);
      img.setOrigin(0, 0).setScale(SCALE).setDepth(2);
      if (s.flipX) img.setFlipX(true);
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
      scale: { mode: Phaser.Scale.NONE, width: CANVAS_W, height: CANVAS_H },
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
