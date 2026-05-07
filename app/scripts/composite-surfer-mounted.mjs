#!/usr/bin/env node
// Composite Silver Surfer rider on Silver Horse, per direction. Both rider
// and horse must face the same way — that's the user's locked solve. Output
// goes into app/client/public/sprites/keep/surfer-mounted/rotations/{dir}.png
// so the original Surfer-alone sprites stay intact.
//
// Layout: horse at the bottom, rider sitting on top centered + slightly
// offset so they read as mounted. Rider scaled ~60% so proportions read.

import sharp from "sharp";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../client/public/sprites/keep");
const OUT_DIR = join(SRC, "surfer-mounted/rotations");

const W = 110, H = 110;
const HORSE_SIZE = 92;
const RIDER_SIZE = 56;

// Per-direction offset tuning. Horse sits at the bottom; rider sits on its back.
// Horse front-on (south/north) is narrower; side-views (east/west) wider.
const TUNING = {
  south: { riderX: (W - RIDER_SIZE) / 2,         riderY: H - HORSE_SIZE - 4 },
  east:  { riderX: (W - RIDER_SIZE) / 2 + 4,     riderY: H - HORSE_SIZE - 6 },
  north: { riderX: (W - RIDER_SIZE) / 2,         riderY: H - HORSE_SIZE - 4 },
  west:  { riderX: (W - RIDER_SIZE) / 2 - 4,     riderY: H - HORSE_SIZE - 6 },
};

async function compose(dir) {
  const horse = await sharp(join(SRC, `silver-horse/rotations/${dir}.png`))
    .resize(HORSE_SIZE, HORSE_SIZE, { kernel: "nearest" })
    .toBuffer();
  const rider = await sharp(join(SRC, `surfer/rotations/${dir}.png`))
    .resize(RIDER_SIZE, RIDER_SIZE, { kernel: "nearest" })
    .toBuffer();

  const horseTop = H - HORSE_SIZE;
  const horseLeft = Math.floor((W - HORSE_SIZE) / 2);
  const { riderX, riderY } = TUNING[dir];

  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: horse, top: horseTop, left: horseLeft },
      { input: rider, top: Math.round(riderY), left: Math.round(riderX) },
    ])
    .png()
    .toFile(join(OUT_DIR, `${dir}.png`));

  console.log(`  ${dir.padEnd(6)} → ${W}x${H} (horse ${HORSE_SIZE}, rider ${RIDER_SIZE})`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`composite-surfer-mounted → ${OUT_DIR}`);
  for (const d of ["south", "east", "north", "west"]) await compose(d);
  console.log("done. 4 directions.");
}

main().catch((e) => { console.error(e); process.exit(1); });
