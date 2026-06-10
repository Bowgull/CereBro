#!/usr/bin/env node
// Layer compositor for CereBro agent sprites.
//
// A recipe is a list of layers. Each layer is one of:
//   { kind: "rl",  rc: [row, col],            recolor?: ramp, offset?: [x,y] }     // roguelike-characters cell
//   { kind: "td",  name: "goblin_idle_anim_f0", recolor?: ramp, offset?: [x,y] }   // 0x72 DungeonTileset II frame
//   { kind: "tdun", tile: 100,                recolor?: ramp, offset?: [x,y] }     // kenney_tiny-dungeon tile
//   { kind: "town", tile: 12,                 recolor?: ramp, offset?: [x,y] }     // kenney_tiny-town tile
//   { kind: "paint", pixels: [{x,y,c}, ...] }                                      // per-pixel overlay (c=null erases)
//   { kind: "horse" }                                                              // silver-horse silhouette below rider
//
// Ramps are 3-stop arrays [shadow, mid, highlight] (hex strings). When a recolor
// is set, the layer's source pixels are remapped by luma onto outline/shadow/mid/
// highlight before composite. Layers stack in order (later = on top).

import sharp from "sharp";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../client/public/sprites/cc0");
const SLICED = join(ROOT, "kenney_roguelike-characters/sliced");
const TD_FRAMES = join(ROOT, "0x72_DungeonTilesetII_v1.7/frames");
const TDUN_TILES = join(ROOT, "kenney_tiny-dungeon/Tiles");
const TOWN_TILES = join(ROOT, "kenney_tiny-town/Tiles");
const OUT_DIR = resolve(__dirname, "../../mockups/assets/sprites");

const C = {
  yellow: "#FFD24A", gold: "#D9B56A", goldHi: "#FFE07A",
  cyan: "#7EE0FF", cyanHi: "#CFE6FF",
  blue: "#6BA6FF", trekBlue: "#1E3A8A", trekBlueHi: "#3454C4",
  white: "#F4EFE3", black: "#08080c", ink: "#0a0d12",
  cream: "#FBE5C8", paleSh: "#C9A878",
  silver: "#D8DEE6", silverDark: "#7E8898", silverShade: "#5b6470",
  red: "#C8302D", redHi: "#F25656", redDark: "#4a1410",
  greyHair: "#9aa1ad", capeGrey: "#1a1d24",
  saffron: "#D9821A", saffronHi: "#FFD24A", saffronDark: "#4a2a08",
  monkBrown: "#5a3a1a", monkBrownDark: "#3a2410",
  goblinGreen: "#4ADE80", goblinGreenDark: "#1a3a1a",
  piccoloPurple: "#7a3ec8",
};

// Default canvas: 16x16 chibi. The full-body 16x24 experiment with painted
// legs/pants/boots read as goofy at chamber scale — reverted to the natural
// source-tile size. Each agent is its source tile + recolor + minimal accent
// paint, all inside 16x16.
const DEFAULT_CANVAS = { w: 16, h: 16 };

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function setPixel(buf, w, x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0) return;
  if (x >= w) return;
  const i = (y * w + x) * 4;
  if (i + 3 >= buf.length) return;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}

function blendPixel(buf, w, x, y, [r, g, b], a) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  if (i + 3 >= buf.length) return;
  if (a === 0) return;
  // straight overwrite when source alpha is high; otherwise alpha blend
  if (a >= 250) {
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
  } else {
    const da = buf[i + 3] / 255;
    const sa = a / 255;
    const oa = sa + da * (1 - sa);
    buf[i] = Math.round((r * sa + buf[i] * da * (1 - sa)) / Math.max(oa, 0.001));
    buf[i + 1] = Math.round((g * sa + buf[i + 1] * da * (1 - sa)) / Math.max(oa, 0.001));
    buf[i + 2] = Math.round((b * sa + buf[i + 2] * da * (1 - sa)) / Math.max(oa, 0.001));
    buf[i + 3] = Math.round(oa * 255);
  }
}

function recolorBuffer(data, ramp) {
  if (!ramp) return data;
  const [shadow, mid, highlight] = ramp.map(hex);
  const outline = shadow.map((c) => Math.round(c * 0.4));
  const out = Buffer.from(data);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 8) continue;
    const L = luma(data[i], data[i + 1], data[i + 2]);
    let pick;
    if (L < 50) pick = outline;
    else if (L < 110) pick = shadow;
    else if (L < 190) pick = mid;
    else pick = highlight;
    out[i] = pick[0]; out[i + 1] = pick[1]; out[i + 2] = pick[2];
  }
  return out;
}

async function loadLayerRaw(layer) {
  let path;
  if (layer.kind === "rl") {
    const [r, c] = layer.rc;
    path = join(SLICED, `cell_${String(r).padStart(2, "0")}_${String(c).padStart(2, "0")}.png`);
  } else if (layer.kind === "td") {
    path = join(TD_FRAMES, `${layer.name}.png`);
  } else if (layer.kind === "tdun") {
    path = join(TDUN_TILES, `tile_${String(layer.tile).padStart(4, "0")}.png`);
  } else if (layer.kind === "town") {
    path = join(TOWN_TILES, `tile_${String(layer.tile).padStart(4, "0")}.png`);
  } else {
    return null;
  }
  const img = sharp(path).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// Side-view silver horse, 16 wide × 10 tall. Chunky pony silhouette: solid
// body, 4 distinct legs (back pair + front pair with gap between), forward-
// facing head with ear, mane line, hooves at bottom row. Designed so the
// rider sits ON the back row (y=2-3) with their legs straddling the body.
function horsePixels(xOff, yOff) {
  const grid = [
    "................",  // y=0
    ".............DDD.",  // y=1  ear
    "..DDDDDDDDDDSSSDD",  // y=2  back/mane line
    ".DSSSSSSSSSSSSDDD",  // y=3  body top
    ".DSSSSSSSSSSSSSSD",  // y=4  body mid
    ".DSSSSSSSSSSSSSSD",  // y=5  body lower (legs attach)
    "..DSDD....DDSD..",   // y=6  hip + legs upper
    "..DSD......DSD..",   // y=7  legs mid
    "..DSD......DSD..",   // y=8  legs lower
    "..DDD......DDD..",   // y=9  hooves
  ];
  const map = { ".": null, S: C.silver, D: C.silverShade };
  const out = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const ch = grid[y][x];
      const c = map[ch];
      if (c) out.push({ x: x + xOff, y: y + yOff, c });
    }
  }
  return out;
}

async function compose(agent) {
  const W = agent.canvas?.w ?? DEFAULT_CANVAS.w;
  const H = agent.canvas?.h ?? DEFAULT_CANVAS.h;
  const out = Buffer.alloc(W * H * 4);

  for (const layer of agent.layers) {
    if (layer.kind === "paint") {
      for (const p of layer.pixels) {
        if (p.c === null) {
          setPixel(out, W, p.x, p.y, [0, 0, 0], 0);
        } else {
          setPixel(out, W, p.x, p.y, hex(p.c), 255);
        }
      }
      continue;
    }
    if (layer.kind === "horse") {
      const [xOff, yOff] = layer.offset ?? [0, H - 8];
      for (const p of horsePixels(xOff, yOff)) {
        setPixel(out, W, p.x, p.y, hex(p.c), 255);
      }
      continue;
    }
    const src = await loadLayerRaw(layer);
    if (!src) continue;
    const data = recolorBuffer(src.data, layer.recolor);
    const [xOff, yOff] = layer.offset ?? [0, 0];
    for (let sy = 0; sy < src.h; sy++) {
      for (let sx = 0; sx < src.w; sx++) {
        const i = (sy * src.w + sx) * 4;
        const a = data[i + 3];
        if (a < 8) continue;
        blendPixel(out, W, sx + xOff, sy + yOff, [data[i], data[i + 1], data[i + 2]], a);
      }
    }
  }

  const SCALE = 4;
  const outPath = join(OUT_DIR, `${agent.name}.png`);
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .resize(W * SCALE, H * SCALE, { kernel: "nearest" })
    .png()
    .toFile(outPath);
  console.log(`  ${agent.name.padEnd(10)} ${W}x${H}  ${agent.layers.length} layers`);
}

// ---------- Agent recipes (16x16 chibi, tiny-dungeon character tiles) ----------
//
// Each agent = one source tile (kenney_tiny-dungeon, tiles 84-126) recolored
// to its palette + minimal accent paint. Canvas is 16x16 default; agents that
// need a small upward extension (Surfer board) override agent.canvas.

const AGENTS = [
  // Cortana — tile 98 (woman, long hair, red dress) recolored cyan; glow
  // accents at the chest hex + forehead. Reads as a hologram silhouette.
  {
    name: "cortana",
    layers: [
      { kind: "tdun", tile: 98, recolor: ["#0a3a4a", "#4FC3D9", "#B6F0FA"] },
      { kind: "paint", pixels: [
        { x: 7, y: 9, c: C.cyanHi }, { x: 8, y: 9, c: C.cyanHi },
        { x: 7, y: 4, c: C.cyanHi }, { x: 8, y: 4, c: C.cyanHi },
      ]},
    ],
  },

  // Tony Stark — tile 99 (red bandana adventurer) recolored red+gold; arc
  // reactor at mid-chest.
  {
    name: "tony",
    layers: [
      { kind: "tdun", tile: 99, recolor: [C.redDark, C.red, C.goldHi] },
      { kind: "paint", pixels: [
        { x: 7, y: 11, c: C.cyan },   { x: 8, y: 11, c: C.cyanHi },
        { x: 7, y: 12, c: C.cyanHi }, { x: 8, y: 12, c: C.cyan },
      ]},
    ],
  },

  // Gojo — purple Jujutsu uniform, pale cream skin (face + arms), single
  // black bar over the eyes for the blindfold, white hair tuft on top.
  // Source tile 97 has the white-hair character; recoloring to purple turns
  // hair purple too, so we paint the white hair back in.
  {
    name: "gojo",
    layers: [
      { kind: "tdun", tile: 97, recolor: ["#1a0a2a", "#4a2b80", "#7a3ec8"] },
      { kind: "paint", pixels: [
        // white hair tuft on top of head
        { x: 4, y: 2, c: C.white }, { x: 5, y: 2, c: C.white }, { x: 6, y: 2, c: C.white },
        { x: 7, y: 2, c: C.white }, { x: 8, y: 2, c: C.white }, { x: 9, y: 2, c: C.white },
        { x: 10, y: 2, c: C.white }, { x: 11, y: 2, c: C.white },
        { x: 5, y: 3, c: C.white }, { x: 6, y: 3, c: C.white }, { x: 7, y: 3, c: C.white },
        { x: 8, y: 3, c: C.white }, { x: 9, y: 3, c: C.white }, { x: 10, y: 3, c: C.white },
        // pale cream face
        { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream }, { x: 7, y: 4, c: C.cream },
        { x: 8, y: 4, c: C.cream }, { x: 9, y: 4, c: C.cream }, { x: 10, y: 4, c: C.cream },
        { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream }, { x: 7, y: 6, c: C.cream },
        { x: 8, y: 6, c: C.cream }, { x: 9, y: 6, c: C.cream }, { x: 10, y: 6, c: C.cream },
        // single black bar over the eyes (blindfold)
        { x: 4, y: 5, c: C.black }, { x: 5, y: 5, c: C.black }, { x: 6, y: 5, c: C.black },
        { x: 7, y: 5, c: C.black }, { x: 8, y: 5, c: C.black }, { x: 9, y: 5, c: C.black },
        { x: 10, y: 5, c: C.black }, { x: 11, y: 5, c: C.black },
        // pale cream hands at the sides
        { x: 3, y: 12, c: C.cream }, { x: 12, y: 12, c: C.cream },
        { x: 3, y: 13, c: C.cream }, { x: 12, y: 13, c: C.cream },
      ]},
    ],
  },

  // Silver Surfer — tile 109 (bare-chested figure) recolored silver, painted
  // surfboard underneath as a placeholder. The canonical design is a horse;
  // we'll switch back when a sprite pack with a usable horse arrives.
  {
    name: "surfer",
    canvas: { w: 16, h: 20 },
    layers: [
      { kind: "tdun", tile: 109, recolor: ["#2a2f3a", C.silver, "#F0F4F8"] },
      { kind: "paint", pixels: [
        // surfboard — horizontal oval below the figure
        { x: 3, y: 17, c: C.silverShade }, { x: 4, y: 17, c: C.silver }, { x: 5, y: 17, c: C.silver },
        { x: 6, y: 17, c: "#F0F4F8" }, { x: 7, y: 17, c: "#F0F4F8" }, { x: 8, y: 17, c: "#F0F4F8" },
        { x: 9, y: 17, c: "#F0F4F8" }, { x: 10, y: 17, c: C.silver }, { x: 11, y: 17, c: C.silver },
        { x: 12, y: 17, c: C.silverShade },
        { x: 2, y: 18, c: C.silverShade }, { x: 3, y: 18, c: C.silver }, { x: 4, y: 18, c: C.silver },
        { x: 5, y: 18, c: C.silver }, { x: 6, y: 18, c: C.silver }, { x: 7, y: 18, c: C.silver },
        { x: 8, y: 18, c: C.silver }, { x: 9, y: 18, c: C.silver }, { x: 10, y: 18, c: C.silver },
        { x: 11, y: 18, c: C.silver }, { x: 12, y: 18, c: C.silver }, { x: 13, y: 18, c: C.silverShade },
        { x: 3, y: 19, c: C.silverShade }, { x: 4, y: 19, c: C.silverShade }, { x: 5, y: 19, c: C.silverShade },
        { x: 6, y: 19, c: C.silverShade }, { x: 7, y: 19, c: C.silverShade }, { x: 8, y: 19, c: C.silverShade },
        { x: 9, y: 19, c: C.silverShade }, { x: 10, y: 19, c: C.silverShade }, { x: 11, y: 19, c: C.silverShade },
        { x: 12, y: 19, c: C.silverShade },
      ]},
    ],
  },

  // C-3PO — tile 96 (full-armor knight) recolored full gold + cyan visor slit.
  {
    name: "c3po",
    layers: [
      { kind: "tdun", tile: 96, recolor: ["#4a3010", C.gold, C.goldHi] },
      { kind: "paint", pixels: [
        { x: 6, y: 6, c: C.cyan }, { x: 7, y: 6, c: C.cyan },
        { x: 8, y: 6, c: C.cyan }, { x: 9, y: 6, c: C.cyan },
      ]},
    ],
  },

  // Aang — tile 86 (bare-chest skinhead). Body recolored RED for the monk
  // robes (the visible chest "clothing" is red, per user reference). Face,
  // bald head, hands stay cream. Blue arrow tattoo painted on the FOREHEAD.
  {
    name: "aang",
    layers: [
      { kind: "tdun", tile: 86, recolor: [C.redDark, C.red, "#F25656"] },
      { kind: "paint", pixels: [
        // cream BALD head + face
        { x: 5, y: 2, c: C.cream }, { x: 6, y: 2, c: C.cream }, { x: 7, y: 2, c: C.cream },
        { x: 8, y: 2, c: C.cream }, { x: 9, y: 2, c: C.cream }, { x: 10, y: 2, c: C.cream },
        { x: 4, y: 3, c: C.cream }, { x: 5, y: 3, c: C.cream }, { x: 6, y: 3, c: C.cream },
        { x: 7, y: 3, c: C.cream }, { x: 8, y: 3, c: C.cream }, { x: 9, y: 3, c: C.cream },
        { x: 10, y: 3, c: C.cream }, { x: 11, y: 3, c: C.cream },
        { x: 4, y: 4, c: C.cream }, { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream },
        { x: 7, y: 4, c: C.cream }, { x: 8, y: 4, c: C.cream }, { x: 9, y: 4, c: C.cream },
        { x: 10, y: 4, c: C.cream }, { x: 11, y: 4, c: C.cream },
        { x: 4, y: 5, c: C.cream }, { x: 5, y: 5, c: C.cream }, { x: 7, y: 5, c: C.cream },
        { x: 8, y: 5, c: C.cream }, { x: 10, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream },
        { x: 4, y: 6, c: C.cream }, { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream },
        { x: 7, y: 6, c: C.cream }, { x: 8, y: 6, c: C.cream }, { x: 9, y: 6, c: C.cream },
        { x: 10, y: 6, c: C.cream }, { x: 11, y: 6, c: C.cream },
        // eyes
        { x: 6, y: 5, c: C.black }, { x: 9, y: 5, c: C.black },
        // BLUE ARROW on the forehead (tip pointing up between eyes)
        { x: 7, y: 2, c: C.blue }, { x: 8, y: 2, c: C.blue },
        { x: 7, y: 3, c: C.blue }, { x: 8, y: 3, c: C.blue },
        { x: 7, y: 4, c: C.blue }, { x: 8, y: 4, c: C.blue },
        // small saffron sash detail at collar to break up the solid red
        { x: 6, y: 8, c: C.saffronHi }, { x: 9, y: 8, c: C.saffronHi },
        // cream hands at the sides
        { x: 3, y: 12, c: C.cream }, { x: 12, y: 12, c: C.cream },
        { x: 3, y: 13, c: C.cream }, { x: 12, y: 13, c: C.cream },
      ]},
    ],
  },

  // Batman — tile 87 (knight). REMOVE the source tile's existing horns
  // (paint them transparent), then paint TWO clean POINTY bat-spikes on top
  // of the head (no panda rounds). Yellow chest emblem + utility belt.
  {
    name: "batman",
    layers: [
      { kind: "tdun", tile: 87, recolor: ["#08080c", "#2a2f3a", "#6B7280"] },
      { kind: "paint", pixels: [
        // ERASE the source's horn pixels at the very top of the head
        { x: 4, y: 0, c: null }, { x: 5, y: 0, c: null }, { x: 6, y: 0, c: null },
        { x: 7, y: 0, c: null }, { x: 8, y: 0, c: null }, { x: 9, y: 0, c: null },
        { x: 10, y: 0, c: null }, { x: 11, y: 0, c: null },
        { x: 4, y: 1, c: null }, { x: 11, y: 1, c: null },
        // TWO pointy bat-spikes — single-pixel triangle tips (left + right)
        // Left spike: tip at top, widens 1 pixel below
        { x: 5, y: 0, c: C.black },
        { x: 5, y: 1, c: C.black }, { x: 6, y: 1, c: C.black },
        // Right spike: mirror
        { x: 10, y: 0, c: C.black },
        { x: 9, y: 1, c: C.black }, { x: 10, y: 1, c: C.black },
        // yellow chest emblem
        { x: 7, y: 9, c: C.yellow }, { x: 8, y: 9, c: C.yellow },
        // yellow utility belt
        { x: 5, y: 12, c: C.yellow }, { x: 6, y: 12, c: C.yellow }, { x: 7, y: 12, c: C.yellow },
        { x: 8, y: 12, c: C.yellow }, { x: 9, y: 12, c: C.yellow }, { x: 10, y: 12, c: C.yellow },
      ]},
    ],
  },

  // Prof Oak — tile 102 (bald grey elder) recolored white for the lab coat;
  // grey hair brushed back on top, brown beard along the jawline, dark eyes.
  // No purple shirt strip (it read as a tongue). Simple white-coat scientist.
  {
    name: "oak",
    layers: [
      { kind: "tdun", tile: 102, recolor: ["#cfcfcf", "#F0F0F0", "#FFFFFF"] },
      { kind: "paint", pixels: [
        // grey hair on top of bald head
        { x: 4, y: 1, c: C.greyHair }, { x: 5, y: 1, c: C.greyHair }, { x: 6, y: 1, c: C.greyHair },
        { x: 7, y: 1, c: C.greyHair }, { x: 8, y: 1, c: C.greyHair }, { x: 9, y: 1, c: C.greyHair },
        { x: 10, y: 1, c: C.greyHair }, { x: 11, y: 1, c: C.greyHair },
        { x: 3, y: 2, c: C.greyHair }, { x: 4, y: 2, c: C.greyHair }, { x: 5, y: 2, c: C.greyHair },
        { x: 6, y: 2, c: C.greyHair }, { x: 7, y: 2, c: C.greyHair }, { x: 8, y: 2, c: C.greyHair },
        { x: 9, y: 2, c: C.greyHair }, { x: 10, y: 2, c: C.greyHair }, { x: 11, y: 2, c: C.greyHair }, { x: 12, y: 2, c: C.greyHair },
        // cream face
        { x: 4, y: 3, c: C.cream }, { x: 5, y: 3, c: C.cream }, { x: 6, y: 3, c: C.cream },
        { x: 7, y: 3, c: C.cream }, { x: 8, y: 3, c: C.cream }, { x: 9, y: 3, c: C.cream },
        { x: 10, y: 3, c: C.cream }, { x: 11, y: 3, c: C.cream },
        { x: 4, y: 4, c: C.cream }, { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream },
        { x: 7, y: 4, c: C.cream }, { x: 8, y: 4, c: C.cream }, { x: 9, y: 4, c: C.cream },
        { x: 10, y: 4, c: C.cream }, { x: 11, y: 4, c: C.cream },
        { x: 4, y: 5, c: C.cream }, { x: 5, y: 5, c: C.cream }, { x: 7, y: 5, c: C.cream },
        { x: 8, y: 5, c: C.cream }, { x: 10, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream },
        { x: 4, y: 6, c: C.cream }, { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream },
        { x: 7, y: 6, c: C.cream }, { x: 8, y: 6, c: C.cream }, { x: 9, y: 6, c: C.cream },
        { x: 10, y: 6, c: C.cream }, { x: 11, y: 6, c: C.cream },
        // dark eyes
        { x: 6, y: 5, c: C.black }, { x: 9, y: 5, c: C.black },
        // brown beard along the jaw
        { x: 5, y: 7, c: C.monkBrown }, { x: 6, y: 7, c: C.monkBrown }, { x: 7, y: 7, c: C.monkBrown },
        { x: 8, y: 7, c: C.monkBrown }, { x: 9, y: 7, c: C.monkBrown }, { x: 10, y: 7, c: C.monkBrown },
      ]},
    ],
  },

  // Spock — tile 85 (brown hooded figure) recolored Starfleet blue, painted
  // black bowl-cut hair, cream face, pointy ear tips, gold delta on chest.
  {
    name: "spock",
    layers: [
      { kind: "tdun", tile: 85, recolor: [C.ink, C.trekBlue, C.trekBlueHi] },
      { kind: "paint", pixels: [
        // black bowl-cut crown
        { x: 5, y: 2, c: C.black }, { x: 6, y: 2, c: C.black }, { x: 7, y: 2, c: C.black },
        { x: 8, y: 2, c: C.black }, { x: 9, y: 2, c: C.black }, { x: 10, y: 2, c: C.black },
        { x: 4, y: 3, c: C.black }, { x: 5, y: 3, c: C.black },
        { x: 10, y: 3, c: C.black }, { x: 11, y: 3, c: C.black },
        // cream face
        { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream }, { x: 7, y: 4, c: C.cream },
        { x: 8, y: 4, c: C.cream }, { x: 9, y: 4, c: C.cream }, { x: 10, y: 4, c: C.cream },
        { x: 5, y: 5, c: C.cream }, { x: 7, y: 5, c: C.cream }, { x: 8, y: 5, c: C.cream }, { x: 10, y: 5, c: C.cream },
        { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream }, { x: 9, y: 6, c: C.cream }, { x: 10, y: 6, c: C.cream },
        // pointy ear tips
        { x: 4, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream },
        // eyes
        { x: 6, y: 5, c: C.black }, { x: 9, y: 5, c: C.black },
        // gold delta comm badge
        { x: 8, y: 9, c: C.gold }, { x: 9, y: 9, c: C.gold },
      ]},
    ],
  },

  // Piccolo — tile 108 (green ghost/slime). Round chibi shape preserved;
  // white turban on top + purple cape flares at the shoulders.
  {
    name: "piccolo",
    layers: [
      { kind: "tdun", tile: 108, recolor: [C.goblinGreenDark, C.goblinGreen, "#A7F0C0"] },
      { kind: "paint", pixels: [
        { x: 5, y: 2, c: C.white }, { x: 6, y: 2, c: C.white }, { x: 7, y: 2, c: C.white },
        { x: 8, y: 2, c: C.white }, { x: 9, y: 2, c: C.white }, { x: 10, y: 2, c: C.white },
        { x: 6, y: 3, c: C.white }, { x: 7, y: 3, c: C.white }, { x: 8, y: 3, c: C.white }, { x: 9, y: 3, c: C.white },
        { x: 3, y: 8, c: C.piccoloPurple }, { x: 12, y: 8, c: C.piccoloPurple },
        { x: 2, y: 9, c: C.piccoloPurple }, { x: 13, y: 9, c: C.piccoloPurple },
      ]},
    ],
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`compose-agents → ${OUT_DIR}`);
  for (const a of AGENTS) await compose(a);
  console.log(`done. ${AGENTS.length} sprites.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
