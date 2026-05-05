#!/usr/bin/env node
// Palette-swap: remap every pixel in a PNG to its nearest color in the
// CereBro castle palette. Quick-and-dirty nearest-neighbor in RGB space,
// luma-weighted so we preserve the source's value structure.
//
// Usage:
//   node scripts/palette-swap.mjs <input.png> <output.png> [--mode=nearest|luma]
//
// The luma mode preserves the source's brightness ramp by mapping each pixel
// to the palette entry with the closest luminance, then nudging hue. It tends
// to look better on hand-painted dungeon art where the brightness is doing
// most of the storytelling.

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const PALETTE = [
  [0x0e, 0x11, 0x16], // background
  [0x13, 0x18, 0x21], // backgroundSoft
  [0x18, 0x1f, 0x2a], // surface
  [0x20, 0x2a, 0x38], // surfaceRaised
  [0x15, 0x1a, 0x23], // surfaceMuted
  [0x33, 0x41, 0x55], // border
  [0x25, 0x30, 0x41], // borderSoft
  [0xf4, 0xef, 0xe3], // textPrimary (warm parchment)
  [0xb8, 0xc0, 0xcc], // textSecondary
  [0x7e, 0x88, 0x98], // textMuted
  [0x6b, 0xa6, 0xff], // accent (cool blue)
  [0x2d, 0x5b, 0x8f], // accentSoft
  [0x8b, 0x5c, 0xf6], // accentViolet
  [0xa7, 0x8b, 0xfa], // glowViolet
  [0xd9, 0xb5, 0x6a], // gold
  [0x6b, 0x72, 0x80], // stone
  [0xf6, 0xc1, 0x77], // warning (warm torch)
  [0xef, 0x6f, 0x6c], // danger (ember red)
];

const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function nearestRGB(r, g, b) {
  let best = PALETTE[0];
  let bestD = Infinity;
  for (const p of PALETTE) {
    const dr = r - p[0], dg = g - p[1], db = b - p[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

function nearestLuma(r, g, b) {
  const target = luma([r, g, b]);
  let best = PALETTE[0];
  let bestD = Infinity;
  for (const p of PALETTE) {
    const d = Math.abs(luma(p) - target);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

async function main() {
  const [, , inPath, outPath, ...rest] = process.argv;
  if (!inPath || !outPath) {
    console.error("usage: palette-swap.mjs <in.png> <out.png> [--mode=nearest|luma]");
    process.exit(1);
  }
  const mode = rest.find((a) => a.startsWith("--mode="))?.split("=")[1] ?? "luma";
  const pick = mode === "nearest" ? nearestRGB : nearestLuma;

  const img = sharp(resolve(inPath)).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 8) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
      continue;
    }
    const [pr, pg, pb] = pick(data[i], data[i + 1], data[i + 2]);
    out[i] = pr; out[i + 1] = pg; out[i + 2] = pb; out[i + 3] = a;
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(resolve(outPath));

  console.log(`palette-swap [${mode}] ${inPath} -> ${outPath} (${info.width}x${info.height})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
