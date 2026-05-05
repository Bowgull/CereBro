// KeepScene — side-cutaway castle Phaser scene.
//
// Three floors stacked top-to-bottom (Upper Spires, Ground Hall, Crypts) with
// chambers laid out left-to-right. Each chamber is a tiled stone room from the
// 0x72 DungeonTilesetII atlas, with the agent's sprite centered on the floor
// row. Cortana's Hub is a wider centerpiece on the Ground Hall.
//
// V1 scope: static layout, single agent (Cortana) gets a vertical bob tween as
// proof-of-motion. Other agents are placed but static. Active/dormant state,
// idle anims for the rest, ambient effects (torch flicker, fountain ripple)
// land in the next pass.
//
// Data: useHeroSocket-driven agent state will pipe in via props later. For now
// the scene draws the room frame and places everyone.

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { CHAMBERS, cerebroColors as C, type AgentState } from "../lib/keepConfig";

// ── Geometry ────────────────────────────────────────────────────────────────
const TILE = 16;            // source tile size in atlas
const SCALE = 3;            // render upscale
const TS = TILE * SCALE;    // 48px on screen per tile

// Each floor is 7 tiles tall (1 top wall, 5 interior, 1 floor edge).
const FLOOR_TILES_TALL = 7;
const FLOOR_TILES_WIDE = 44; // every floor pads to 44 tiles wide

// Per-floor chamber widths (sum must = FLOOR_TILES_WIDE)
const UPPER_WIDTHS  = [11, 11, 11, 11];        // batman, aang, oak, spock
const GROUND_WIDTHS = [8, 8, 12, 8, 8];        // tony, gojo, cortana, surfer, c3po
const CRYPTS_WIDTHS = [44];                     // piccolo wide alone

const CANVAS_W = FLOOR_TILES_WIDE * TS;                 // 2112
const CANVAS_H = (FLOOR_TILES_TALL * 3 + 1) * TS;       // 22 tiles tall, 1056

// Order on screen, top to bottom
const UPPER_ORDER  = ["batman", "aang", "oak", "spock"];
const GROUND_ORDER = ["tony", "gojo", "cortana", "surfer", "c3po"];
const CRYPTS_ORDER = ["piccolo"];

// ── Atlas frame definitions (0x72 DungeonTilesetII v1.7) ────────────────────
// Each entry: name → [x, y, w, h] in source PNG.
const ATLAS_KEY = "d2_atlas";
const ATLAS_FRAMES: Record<string, [number, number, number, number]> = {
  floor_1:        [16, 64, 16, 16],
  floor_2:        [32, 64, 16, 16],
  floor_3:        [48, 64, 16, 16],
  wall_mid:       [32, 16, 16, 16],
  wall_top_mid:   [32,  0, 16, 16],
  wall_left:      [16, 16, 16, 16],
  wall_right:     [48, 16, 16, 16],
  wall_top_left:  [16,  0, 16, 16],
  wall_top_right: [48,  0, 16, 16],
  column:         [80, 80, 16, 48],
  column_wall:    [96, 80, 16, 48],
  banner_blue:    [32, 32, 16, 16],
  banner_red:     [16, 32, 16, 16],
  banner_green:   [16, 48, 16, 16],
  banner_yellow:  [32, 48, 16, 16],
  fountain_top:   [80,  0, 16, 16],
  fountain_mid:   [80, 48, 16, 16],
  fountain_basin: [80, 64, 16, 16],
};

// Per-agent banner color
const AGENT_BANNER: Record<string, "blue" | "red" | "green" | "yellow"> = {
  cortana: "blue",
  tony:    "red",
  gojo:    "blue",
  surfer:  "blue",
  c3po:    "yellow",
  batman:  "yellow",
  aang:    "green",
  oak:     "blue",
  spock:   "blue",
  piccolo: "green",
};

// ── Scene ───────────────────────────────────────────────────────────────────
class KeepScene extends Phaser.Scene {
  private agentSprites: Map<string, Phaser.GameObjects.Image> = new Map();

  constructor() { super({ key: "KeepScene" }); }

  preload() {
    // 0x72 atlas — single image, frames defined manually in create()
    this.load.image(ATLAS_KEY, "/sprites/cc0/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7.png");
    // Torch (single static frame from 0x72 v5 for now; animation deferred)
    this.load.image("torch", "/sprites/cc0/0x72_16x16DungeonTileset.v5/items/torch_1.png");

    // Agent sprites — each chamber's character portrait
    for (const c of CHAMBERS) {
      this.load.image(`agent_${c.agentId}`, c.spritePath);
    }
  }

  create() {
    // Register atlas frames so we can address them by name.
    const tex = this.textures.get(ATLAS_KEY);
    for (const [name, [x, y, w, h]] of Object.entries(ATLAS_FRAMES)) {
      tex.add(name, 0, x, y, w, h);
    }

    // Backdrop
    this.cameras.main.setBackgroundColor(C.background);

    // Build all three floors
    this.buildFloor("upper",  UPPER_ORDER,  UPPER_WIDTHS,  0);
    this.buildFloor("ground", GROUND_ORDER, GROUND_WIDTHS, FLOOR_TILES_TALL);
    this.buildFloor("crypts", CRYPTS_ORDER, CRYPTS_WIDTHS, FLOOR_TILES_TALL * 2);

    // Crenellation row on top
    this.drawCrenellations();

    // Cortana idle bob — proof of motion.
    const cortana = this.agentSprites.get("cortana");
    if (cortana) {
      this.tweens.add({
        targets: cortana,
        y: cortana.y - 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  /** Draw one horizontal floor: walls, floor row, chambers, props, agent. */
  private buildFloor(floorId: "upper" | "ground" | "crypts", order: string[], widths: number[], rowOffset: number) {
    const yTop = rowOffset;                                // tile row of top wall
    const yWallBase = rowOffset + FLOOR_TILES_TALL - 2;    // tile row of bottom wall (the "floor surface line")
    const yFloor = rowOffset + FLOOR_TILES_TALL - 1;       // tile row of floor edge

    // Floor surface (all tiles across this floor)
    for (let c = 0; c < FLOOR_TILES_WIDE; c++) {
      this.placeTile(c, yWallBase, "floor_1");
      this.placeTile(c, yFloor,    "floor_2");
    }

    // Top wall row (back wall behind chambers)
    for (let c = 0; c < FLOOR_TILES_WIDE; c++) {
      this.placeTile(c, yTop,     "wall_top_mid");
      this.placeTile(c, yTop + 1, "wall_mid");
    }

    // Per-chamber dressing
    let cx = 0;
    for (let i = 0; i < order.length; i++) {
      const agentId = order[i];
      const w = widths[i];
      const chamber = CHAMBERS.find((c) => c.agentId === agentId);
      if (!chamber) { cx += w; continue; }

      // Banner + torch on the back wall, roughly centered in the chamber
      const bannerCol = cx + Math.floor(w / 2) - 1;
      const torchCol  = cx + Math.floor(w / 2) + 1;
      const banner = `banner_${AGENT_BANNER[agentId]}`;
      this.placeTile(bannerCol, yTop + 1, banner);
      // torch as image (16x16) on top of wall
      this.add.image(
        torchCol * TS + TS / 2,
        (yTop + 1) * TS + TS / 2,
        "torch"
      ).setScale(SCALE).setDepth(2);

      // Dividing column between chambers (skip leftmost edge)
      if (i > 0) {
        const colTile = cx;
        for (let r = 0; r < FLOOR_TILES_TALL - 1; r++) {
          this.placeTile(colTile, yTop + r, "wall_mid", 0.6);
        }
      }

      // Hub gets a glowing dais under Cortana
      if (agentId === "cortana") {
        const cxPx = (cx + w / 2) * TS;
        const cyPx = (yWallBase + 1) * TS;
        const dais = this.add.graphics();
        dais.fillStyle(0xa78bfa, 0.18);
        dais.fillCircle(cxPx, cyPx, TS * 1.4);
        dais.setDepth(3);
        // Floating user-orb
        const orb = this.add.graphics();
        orb.fillStyle(0xa78bfa, 0.9);
        orb.fillCircle(cxPx + TS * 1.5, cyPx - TS * 0.2, 6);
        orb.setDepth(6);
        this.tweens.add({
          targets: orb,
          alpha: 0.55,
          duration: 1400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      // Piccolo gets a scrying pool (animated fountain frame, static for now)
      if (agentId === "piccolo") {
        const poolCol = cx + Math.floor(w / 2) - 4;
        this.placeTile(poolCol,     yWallBase - 1, "fountain_top");
        this.placeTile(poolCol,     yWallBase,     "fountain_mid");
        this.placeTile(poolCol,     yFloor,        "fountain_basin");
      }

      // Agent sprite — placed centered, feet on the floor surface
      const sxPx = (cx + w / 2) * TS;
      const syPx = (yWallBase + 0.4) * TS;
      const sprite = this.add.image(sxPx, syPx, `agent_${agentId}`)
        .setOrigin(0.5, 1)
        .setScale(1.6)
        .setDepth(5);
      this.agentSprites.set(agentId, sprite);

      cx += w;
    }
  }

  private placeTile(col: number, row: number, frame: string, alpha = 1) {
    const img = this.add.image(col * TS + TS / 2, row * TS + TS / 2, ATLAS_KEY, frame);
    img.setScale(SCALE);
    img.setDepth(0);
    if (alpha < 1) img.setAlpha(alpha);
    return img;
  }

  private drawCrenellations() {
    // top of canvas: alternating block crenellation strip
    const y = -TS / 2;
    for (let c = 0; c < FLOOR_TILES_WIDE; c++) {
      if (c % 2 === 0) {
        const block = this.add.rectangle(c * TS + TS / 2, y + TS / 2, TS, TS, 0x252c3b);
        block.setDepth(1);
      }
    }
  }

  setAgentStates(_states: Partial<Record<string, AgentState>>) {
    // wired next session — will tint chambers / brighten torches per state
  }
}

// ── React wrapper ───────────────────────────────────────────────────────────
interface Props {
  agentStates?: Partial<Record<string, AgentState>>;
}

export default function KeepSceneView({ agentStates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<KeepScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: C.background,
      parent: containerRef.current,
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      scale: { mode: Phaser.Scale.NONE, width: CANVAS_W, height: CANVAS_H },
      scene: [KeepScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    game.events.on("ready", () => {
      sceneRef.current = game.scene.getScene("KeepScene") as KeepScene;
    });

    const applyStyle = () => {
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.maxWidth = `${CANVAS_W * 0.6}px`;
        canvas.style.imageRendering = "pixelated";
        canvas.style.display = "block";
      }
    };
    const t1 = setTimeout(applyStyle, 200);
    const t2 = setTimeout(applyStyle, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && agentStates) sceneRef.current.setAgentStates(agentStates);
  }, [agentStates]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        backgroundColor: C.background,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "1rem",
        lineHeight: 0,
        fontSize: 0,
      }}
    />
  );
}
