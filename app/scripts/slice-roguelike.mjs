#!/usr/bin/env node
// Slice the kenney_roguelike-characters modular spritesheet into 12*54=648
// individual 16x16 PNGs and emit a labeled contact sheet so each part can be
// addressed by (row, col) when building agent recipes.

import sharp from "sharp";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHEET = resolve(__dirname, "../client/public/sprites/cc0/kenney_roguelike-characters/Spritesheet/roguelikeChar_transparent.png");
const OUT = resolve(__dirname, "../client/public/sprites/cc0/kenney_roguelike-characters/sliced");
const CONTACT = resolve(__dirname, "../../mockups/assets/roguelike-contact-sheet.png");

const TILE = 16;
const STRIDE = 17;
const COLS = 54;
const ROWS = 12;

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(dirname(CONTACT), { recursive: true });

  // 1. dump every cell as cell_RR_CC.png
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      await sharp(SHEET)
        .extract({ left: c * STRIDE, top: r * STRIDE, width: TILE, height: TILE })
        .png()
        .toFile(join(OUT, `cell_${String(r).padStart(2, "0")}_${String(c).padStart(2, "0")}.png`));
    }
  }
  console.log(`sliced ${ROWS * COLS} cells → ${OUT}`);

  // 2. build labeled contact sheet — 4× upscaled, with row/col labels
  const SCALE = 4;
  const LABEL_PAD = 14;
  const CELL = TILE * SCALE;
  const W = LABEL_PAD + COLS * (CELL + 2);
  const H = LABEL_PAD + ROWS * (CELL + 2);

  // base canvas: dark grey to make transparent tiles visible
  const labels = [];
  for (let r = 0; r < ROWS; r++) {
    labels.push(`<text x="2" y="${LABEL_PAD + r * (CELL + 2) + CELL / 2}" font-family="monospace" font-size="10" fill="#fff">r${r}</text>`);
  }
  for (let c = 0; c < COLS; c++) {
    labels.push(`<text x="${LABEL_PAD + c * (CELL + 2) + 2}" y="10" font-family="monospace" font-size="10" fill="#fff">c${c}</text>`);
  }
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="#222"/>` +
    labels.join("") +
    `</svg>`
  );

  const composites = [{ input: svg, top: 0, left: 0 }];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = await sharp(join(OUT, `cell_${String(r).padStart(2, "0")}_${String(c).padStart(2, "0")}.png`))
        .resize(CELL, CELL, { kernel: "nearest" })
        .toBuffer();
      composites.push({
        input: tile,
        top: LABEL_PAD + r * (CELL + 2),
        left: LABEL_PAD + c * (CELL + 2),
      });
    }
  }

  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0x22, g: 0x22, b: 0x22, alpha: 1 } } })
    .composite(composites)
    .png()
    .toFile(CONTACT);
  console.log(`contact sheet → ${CONTACT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
