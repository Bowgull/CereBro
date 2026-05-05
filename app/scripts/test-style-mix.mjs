#!/usr/bin/env node
// One-shot style-mix test.
// Extracts a few candidate "interior furniture" tiles from kenney 1-bit,
// palette-swaps them, and composites alongside 0x72 banners + torches
// to see whether the styles can sit next to each other.

import sharp from "sharp";
import { resolve } from "node:path";

const APP = process.cwd();
const KENNEY = resolve(APP, "client/public/sprites/cc0/kenney_1-bit-pack/Tilesheet/colored.png");
const D2 = resolve(APP, "client/public/sprites/cc0/0x72_DungeonTilesetII_v1.7/0x72_DungeonTilesetII_v1.7.png");
const V5 = resolve(APP, "client/public/sprites/cc0/0x72_16x16DungeonTileset.v5/0x72_16x16DungeonTileset.v5.png");

const PALETTE = [
  [0x0e, 0x11, 0x16], [0x13, 0x18, 0x21], [0x18, 0x1f, 0x2a],
  [0x20, 0x2a, 0x38], [0x15, 0x1a, 0x23], [0x33, 0x41, 0x55],
  [0x25, 0x30, 0x41], [0xf4, 0xef, 0xe3], [0xb8, 0xc0, 0xcc],
  [0x7e, 0x88, 0x98], [0x6b, 0xa6, 0xff], [0x2d, 0x5b, 0x8f],
  [0x8b, 0x5c, 0xf6], [0xa7, 0x8b, 0xfa], [0xd9, 0xb5, 0x6a],
  [0x6b, 0x72, 0x80], [0xf6, 0xc1, 0x77], [0xef, 0x6f, 0x6c],
];
const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function nearestLuma(r, g, b) {
  const t = luma([r, g, b]);
  let best = PALETTE[0], bd = Infinity;
  for (const p of PALETTE) {
    const d = Math.abs(luma(p) - t);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

async function recolor(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    const [r, g, b] = nearestLuma(out[i], out[i + 1], out[i + 2]);
    out[i] = r; out[i + 1] = g; out[i + 2] = b;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function tileFromKenney(col, row) {
  return sharp(KENNEY).extract({ left: col * 17, top: row * 17, width: 16, height: 16 }).png().toBuffer();
}
async function rectFromKenney(col, row, w, h) {
  return sharp(KENNEY).extract({ left: col * 17, top: row * 17, width: w * 17 - 1, height: h * 17 - 1 }).png().toBuffer();
}

async function tileFrom0x72(file, x, y, w = 16, h = 16) {
  return sharp(file).extract({ left: x, top: y, width: w, height: h }).png().toBuffer();
}

async function main() {
  // candidate kenney furniture tiles — let's try a horizontal strip from rows
  // where I saw bookshelves/desks/chairs in the colored.png preview.
  // Sheet is 49 wide x 22 tall. I'll pull a 24x10 region from middle-left
  // (interior furniture zone) and recolor it as one block — that gives us
  // the most variety to inspect at once.
  const interior = await rectFromKenney(0, 5, 24, 10);
  const interiorRecolored = await recolor(interior);

  // Reference 0x72 props for side-by-side: banner_blue (16,32 in atlas
  // walls? no — banners are in main sheet at 32,32 16x16), torch from v5,
  // a chest from 0x72 II.
  const banner = await tileFrom0x72(D2, 32, 32, 16, 16);   // wall_banner_blue
  const fountain = await tileFrom0x72(D2, 64, 48, 16, 16); // wall_fountain_mid_blue
  const chest = await tileFrom0x72(D2, 304, 416, 16, 16);  // chest_full
  const column = await tileFrom0x72(D2, 80, 80, 16, 48);   // column

  // Build a 800x400 canvas. Two zones:
  // Top: raw kenney recolored block (so we can pick props)
  // Bottom: a faux "room" — stone floor strip + 0x72 props + recolored kenney prop
  const W = 800, H = 400;
  const bg = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 14, g: 17, b: 22, alpha: 1 } }
  }).png().toBuffer();

  // Need a stone floor tile from 0x72 II — floor_1 is at (16,64).
  const floorTile = await tileFrom0x72(D2, 16, 64, 16, 16);
  const wallMid = await tileFrom0x72(D2, 32, 16, 16, 16);

  // Build a small 12-tile-wide floor strip (192px) with wall above (3 tiles tall)
  const TS = 16, SCALE = 3; // upscale 3x so we can see detail
  const STRIP_W = 12;

  // Compose tile grid: 3 rows wall, 3 rows floor — render each tile then upscale once at the end.
  const baseW = STRIP_W * TS;
  const baseH = 6 * TS;
  const baseRoom = await sharp({
    create: { width: baseW, height: baseH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).png().toBuffer();

  const layers = [];
  for (let x = 0; x < STRIP_W; x++) {
    for (let y = 0; y < 3; y++) layers.push({ input: wallMid, left: x * TS, top: y * TS });
    for (let y = 3; y < 6; y++) layers.push({ input: floorTile, left: x * TS, top: y * TS });
  }
  // place 0x72 props on the floor row (y = 3*TS, the back floor row, sitting against wall)
  layers.push({ input: banner, left: 1 * TS, top: 2 * TS });   // banner on wall
  layers.push({ input: fountain, left: 2 * TS, top: 2 * TS });
  layers.push({ input: chest, left: 4 * TS, top: 4 * TS });
  // place a kenney bookshelf-candidate on the floor — use tile (10,8) from sheet, recolored
  const candidate = await recolor(await tileFromKenney(10, 8));
  layers.push({ input: candidate, left: 6 * TS, top: 4 * TS });
  const candidate2 = await recolor(await tileFromKenney(11, 8));
  layers.push({ input: candidate2, left: 7 * TS, top: 4 * TS });
  const candidate3 = await recolor(await tileFromKenney(12, 8));
  layers.push({ input: candidate3, left: 8 * TS, top: 4 * TS });

  const composedRoom = await sharp(baseRoom).composite(layers).png().toBuffer();
  const upscaledRoom = await sharp(composedRoom).resize(baseW * SCALE, baseH * SCALE, { kernel: "nearest" }).png().toBuffer();

  // Final canvas: top = kenney palette block upscaled, bottom = room
  const interiorUp = await sharp(interiorRecolored).resize((24 * 17 - 1) * 2, (10 * 17 - 1) * 2, { kernel: "nearest" }).png().toBuffer();
  const interiorMeta = await sharp(interiorUp).metadata();
  const roomMeta = await sharp(upscaledRoom).metadata();

  const finalH = interiorMeta.height + roomMeta.height + 24;
  const finalW = Math.max(interiorMeta.width, roomMeta.width);

  const final = await sharp({
    create: { width: finalW, height: finalH, channels: 4, background: { r: 14, g: 17, b: 22, alpha: 1 } }
  })
    .composite([
      { input: interiorUp, left: 0, top: 0 },
      { input: upscaledRoom, left: 0, top: interiorMeta.height + 24 },
    ])
    .png()
    .toBuffer();

  const outPath = resolve(APP, "../mockups/style-mix-test.png");
  await sharp(final).toFile(outPath);
  console.log("wrote", outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
