#!/usr/bin/env node
// Recolor Kenney tiny-dungeon tiles into per-agent palettes, extend the canvas
// where needed (bat-cowl spikes, horse, ear flares), and stamp lore-accurate
// pixel accents on top before upscaling 4× for the browser mockup.

import sharp from "sharp";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACK_DIRS = {
  dungeon: resolve(__dirname, "../client/public/sprites/cc0/kenney_tiny-dungeon/Tiles"),
  town:    resolve(__dirname, "../client/public/sprites/cc0/kenney_tiny-town/Tiles"),
};
const OUT_DIR   = resolve(__dirname, "../../mockups/assets/sprites");

const C = {
  yellow: "#FFD24A",
  gold:   "#D9B56A",
  cyan:   "#7EE0FF",
  cyanHi: "#CFE6FF",
  blue:   "#6BA6FF",
  white:  "#F4EFE3",
  black:  "#08080c",
  ink:    "#0a0d12",
  cream:  "#FBE5C8",
  paleSh: "#C9A878",
  silver: "#D8DEE6",
  silverDark: "#7E8898",
  silverShade: "#5b6470",
  red:    "#C8302D",
  redHi:  "#F25656",
  greyHair: "#9aa1ad",
  capeGrey: "#1a1d24",
};

// Source coords (pre-extension, 16×16). Extension shifts everything by xOff/yOff.
const AGENTS = [
  {
    name: "cortana", tile: 98, color: "cyan",
    // feminine silhouette (Kenney woman) recolored cyan; long hair flows like Halo Cortana's hard-light form
    ramp: ["#0a3a4a", "#4FC3D9", "#B6F0FA"],
    paint: [
      // bright hex accent on chest
      { x: 7, y: 9, c: C.cyanHi }, { x: 8, y: 9, c: C.cyanHi },
      // glow accent on forehead
      { x: 7, y: 4, c: C.cyanHi }, { x: 8, y: 4, c: C.cyanHi },
    ],
  },
  {
    name: "tony", tile: 99, color: "red+gold",
    ramp: ["#4a1410", "#C8302D", "#FFD24A"],
    paint: [
      // arc reactor — center of chest (was y=8, too high; now y=10-11)
      { x: 7, y: 10, c: C.cyan },   { x: 8, y: 10, c: C.cyanHi },
      { x: 7, y: 11, c: C.cyanHi }, { x: 8, y: 11, c: C.cyan },
    ],
  },
  {
    name: "gojo", tile: 97, color: "black+white-hair",
    // black uniform from the ramp; white spiky hair sits above and on the crown;
    // single solid black blindfold band; one purple slash on the torso as accent.
    ramp: ["#050507", "#1a1a22", "#0a0a12"],
    extend: { top: 2 },
    paint: [
      // wide white hair tuft above head (canvas y=0-1) — silhouette spikes
      { x: 5, y: 1, c: C.white }, { x: 6, y: 1, c: C.white }, { x: 7, y: 1, c: C.white },
      { x: 8, y: 1, c: C.white }, { x: 9, y: 1, c: C.white }, { x: 10, y: 1, c: C.white },
      { x: 4, y: 0, c: null },    { x: 11, y: 0, c: null },
      { x: 6, y: 0, c: C.white }, { x: 9, y: 0, c: C.white },
      // hair main mass on crown (canvas y=2-3)
      { x: 4, y: 2, c: C.white }, { x: 5, y: 2, c: C.white }, { x: 6, y: 2, c: C.white },
      { x: 7, y: 2, c: C.white }, { x: 8, y: 2, c: C.white }, { x: 9, y: 2, c: C.white },
      { x: 10, y: 2, c: C.white }, { x: 11, y: 2, c: C.white },
      { x: 4, y: 3, c: C.white }, { x: 5, y: 3, c: C.white }, { x: 6, y: 3, c: C.white },
      { x: 7, y: 3, c: C.white }, { x: 8, y: 3, c: C.white }, { x: 9, y: 3, c: C.white },
      { x: 10, y: 3, c: C.white }, { x: 11, y: 3, c: C.white },
      // cream face block (canvas y=4-7)
      { x: 4, y: 4, c: C.cream }, { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream },
      { x: 7, y: 4, c: C.cream }, { x: 8, y: 4, c: C.cream }, { x: 9, y: 4, c: C.cream },
      { x: 10, y: 4, c: C.cream }, { x: 11, y: 4, c: C.cream },
      { x: 4, y: 5, c: C.cream }, { x: 5, y: 5, c: C.cream }, { x: 10, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream },
      { x: 4, y: 7, c: C.cream }, { x: 5, y: 7, c: C.cream }, { x: 6, y: 7, c: C.cream },
      { x: 7, y: 7, c: C.cream }, { x: 8, y: 7, c: C.cream }, { x: 9, y: 7, c: C.cream },
      { x: 10, y: 7, c: C.cream }, { x: 11, y: 7, c: C.cream },
      // solid black blindfold band (canvas y=6)
      { x: 4, y: 6, c: C.black }, { x: 5, y: 6, c: C.black }, { x: 6, y: 6, c: C.black },
      { x: 7, y: 6, c: C.black }, { x: 8, y: 6, c: C.black }, { x: 9, y: 6, c: C.black },
      { x: 10, y: 6, c: C.black }, { x: 11, y: 6, c: C.black },
      // single purple diagonal slash across the chest (cursed-energy accent)
      { x: 5, y: 9,  c: "#7a3ec8" },
      { x: 6, y: 10, c: "#7a3ec8" },
      { x: 7, y: 11, c: "#7a3ec8" },
      { x: 8, y: 12, c: "#7a3ec8" },
    ],
  },
  {
    name: "surfer", tile: 112, color: "silver",
    ramp: ["#2a2f3a", "#B0BEC5", "#F0F4F8"],
    extend: { bottom: 8 }, // 16 wide × 24 tall: surfer top, horse bottom 8 rows
    paint: [
      ...horseSilhouette(0, 16),
    ],
  },
  {
    name: "c3po", pack: "town", tile: 128, color: "gold-knight",
    // tiny-town knight silhouette, fully gold (no silver), cyan visor slit only.
    // Lower body's source pixels are mostly dark — paint them mid-gold so the
    // whole figure reads gold instead of helm-on-shadow.
    ramp: ["#4a3010", "#D4A03A", "#FFE07A"],
    paint: [
      // cyan visor slit at the helm face
      { x: 7, y: 6, c: C.cyan }, { x: 8, y: 6, c: C.cyan },
      { x: 7, y: 7, c: C.cyanHi }, { x: 8, y: 7, c: C.cyanHi },
      // brighten the legs/feet (y=11-14) — source is all-shadow, repaint gold mid
      { x: 6, y: 11, c: "#D4A03A" }, { x: 7, y: 11, c: "#FFE07A" }, { x: 8, y: 11, c: "#FFE07A" }, { x: 9, y: 11, c: "#D4A03A" },
      { x: 6, y: 12, c: "#D4A03A" }, { x: 7, y: 12, c: "#D4A03A" }, { x: 8, y: 12, c: "#D4A03A" }, { x: 9, y: 12, c: "#D4A03A" },
      { x: 6, y: 13, c: "#D4A03A" }, { x: 7, y: 13, c: "#D4A03A" }, { x: 8, y: 13, c: "#D4A03A" }, { x: 9, y: 13, c: "#D4A03A" },
    ],
  },
  {
    name: "aang", tile: 88, color: "saffron-monk",
    // tiny-dungeon dwarf: wide symmetric body — proper monk silhouette.
    // Saffron robe ramp; head painted cream (bald); blue arrow tattoo.
    ramp: ["#4a2a08", "#D9821A", "#FFD24A"],
    paint: [
      // BALD head + cream face (kill source hair across crown + sides)
      { x: 5, y: 2, c: C.cream }, { x: 6, y: 2, c: C.cream }, { x: 7, y: 2, c: C.cream },
      { x: 8, y: 2, c: C.cream }, { x: 9, y: 2, c: C.cream }, { x: 10, y: 2, c: C.cream },
      { x: 5, y: 3, c: C.cream }, { x: 6, y: 3, c: C.cream }, { x: 7, y: 3, c: C.cream },
      { x: 8, y: 3, c: C.cream }, { x: 9, y: 3, c: C.cream }, { x: 10, y: 3, c: C.cream },
      { x: 4, y: 4, c: C.cream }, { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream },
      { x: 9, y: 4, c: C.cream }, { x: 10, y: 4, c: C.cream }, { x: 11, y: 4, c: C.cream },
      { x: 4, y: 5, c: C.cream }, { x: 5, y: 5, c: C.cream }, { x: 6, y: 5, c: C.cream }, { x: 7, y: 5, c: C.cream },
      { x: 8, y: 5, c: C.cream }, { x: 9, y: 5, c: C.cream }, { x: 10, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream },
      { x: 4, y: 6, c: C.cream }, { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream }, { x: 7, y: 6, c: C.cream },
      { x: 8, y: 6, c: C.cream }, { x: 9, y: 6, c: C.cream }, { x: 10, y: 6, c: C.cream }, { x: 11, y: 6, c: C.cream },
      { x: 4, y: 7, c: C.cream }, { x: 11, y: 7, c: C.cream },
      { x: 3, y: 7, c: null }, { x: 12, y: 7, c: null },
      { x: 3, y: 8, c: null }, { x: 12, y: 8, c: null },
      { x: 3, y: 9, c: null }, { x: 12, y: 9, c: null },
      // small eye dots
      { x: 6, y: 5, c: C.black }, { x: 9, y: 5, c: C.black },
      // blue arrow tattoo down forehead — center column with flared tip
      { x: 7, y: 2, c: C.blue }, { x: 8, y: 2, c: C.blue },
      { x: 7, y: 3, c: C.blue }, { x: 8, y: 3, c: C.blue },
      { x: 7, y: 4, c: C.blue }, { x: 8, y: 4, c: C.blue },
    ],
  },
  {
    name: "batman", tile: 100, color: "black+grey",
    ramp: ["#08080c", "#2a2f3a", "#6B7280"],
    extend: { top: 2, bottom: 3, left: 2, right: 2 }, // room for bat-spikes + cape
    paint: [
      // bat-spike ears rising above the cowl (above source y=2 → after top:2 shift, source y=2 = canvas y=4)
      // spikes go above head: at canvas y=1, y=2, y=3
      { x: 5, y: 1, c: C.black }, { x: 5, y: 2, c: C.black }, { x: 5, y: 3, c: C.black },
      { x: 6, y: 2, c: C.black }, { x: 6, y: 3, c: C.black },
      { x: 12, y: 1, c: C.black }, { x: 12, y: 2, c: C.black }, { x: 12, y: 3, c: C.black },
      { x: 11, y: 2, c: C.black }, { x: 11, y: 3, c: C.black },
      // cape silhouette flaring out from shoulders + below feet (canvas-space)
      // shoulders ≈ source y=8 → canvas y=10. body ends ≈ source y=14 → canvas y=16.
      { x: 1, y: 11, c: C.capeGrey }, { x: 2, y: 11, c: C.capeGrey },
      { x: 1, y: 12, c: C.capeGrey }, { x: 2, y: 12, c: C.capeGrey }, { x: 3, y: 12, c: C.capeGrey },
      { x: 1, y: 13, c: C.capeGrey }, { x: 2, y: 13, c: C.capeGrey }, { x: 3, y: 13, c: C.capeGrey },
      { x: 1, y: 14, c: C.capeGrey }, { x: 2, y: 14, c: C.capeGrey }, { x: 3, y: 14, c: C.capeGrey }, { x: 4, y: 14, c: C.capeGrey },
      { x: 1, y: 15, c: C.capeGrey }, { x: 2, y: 15, c: C.capeGrey }, { x: 3, y: 15, c: C.capeGrey }, { x: 4, y: 15, c: C.capeGrey }, { x: 5, y: 15, c: C.capeGrey },
      { x: 2, y: 16, c: C.capeGrey }, { x: 3, y: 16, c: C.capeGrey }, { x: 4, y: 16, c: C.capeGrey }, { x: 5, y: 16, c: C.capeGrey }, { x: 6, y: 16, c: C.capeGrey },
      { x: 3, y: 17, c: C.capeGrey }, { x: 4, y: 17, c: C.capeGrey }, { x: 5, y: 17, c: C.capeGrey }, { x: 6, y: 17, c: C.capeGrey }, { x: 7, y: 17, c: C.capeGrey },
      { x: 4, y: 18, c: C.capeGrey }, { x: 5, y: 18, c: C.capeGrey }, { x: 6, y: 18, c: C.capeGrey }, { x: 7, y: 18, c: C.capeGrey }, { x: 8, y: 18, c: C.capeGrey }, { x: 9, y: 18, c: C.capeGrey },
      // mirror on right side
      { x: 17, y: 11, c: C.capeGrey }, { x: 18, y: 11, c: C.capeGrey },
      { x: 16, y: 12, c: C.capeGrey }, { x: 17, y: 12, c: C.capeGrey }, { x: 18, y: 12, c: C.capeGrey },
      { x: 16, y: 13, c: C.capeGrey }, { x: 17, y: 13, c: C.capeGrey }, { x: 18, y: 13, c: C.capeGrey },
      { x: 15, y: 14, c: C.capeGrey }, { x: 16, y: 14, c: C.capeGrey }, { x: 17, y: 14, c: C.capeGrey }, { x: 18, y: 14, c: C.capeGrey },
      { x: 14, y: 15, c: C.capeGrey }, { x: 15, y: 15, c: C.capeGrey }, { x: 16, y: 15, c: C.capeGrey }, { x: 17, y: 15, c: C.capeGrey }, { x: 18, y: 15, c: C.capeGrey },
      { x: 13, y: 16, c: C.capeGrey }, { x: 14, y: 16, c: C.capeGrey }, { x: 15, y: 16, c: C.capeGrey }, { x: 16, y: 16, c: C.capeGrey }, { x: 17, y: 16, c: C.capeGrey },
      { x: 12, y: 17, c: C.capeGrey }, { x: 13, y: 17, c: C.capeGrey }, { x: 14, y: 17, c: C.capeGrey }, { x: 15, y: 17, c: C.capeGrey }, { x: 16, y: 17, c: C.capeGrey },
      { x: 10, y: 18, c: C.capeGrey }, { x: 11, y: 18, c: C.capeGrey }, { x: 12, y: 18, c: C.capeGrey }, { x: 13, y: 18, c: C.capeGrey }, { x: 14, y: 18, c: C.capeGrey }, { x: 15, y: 18, c: C.capeGrey },
      // yellow chest oval + yellow belt (shifted by extension: source x+2, source y+2)
      { x: 9, y: 11, c: C.yellow }, { x: 10, y: 11, c: C.yellow },
      { x: 7, y: 13, c: C.yellow }, { x: 8, y: 13, c: C.yellow },
      { x: 9, y: 13, c: C.yellow }, { x: 10, y: 13, c: C.yellow },
      { x: 11, y: 13, c: C.yellow }, { x: 12, y: 13, c: C.yellow },
    ],
  },
  {
    name: "oak", pack: "town", tile: 131, color: "white-coat",
    // tiny-town hooded merchant — symmetric, broad. Hood (y=0-2) repainted as
    // wild grey hair; brim band (y=3) painted cream as forehead; lab coat white;
    // glasses + red collar + brown trousers via paint.
    ramp: ["#0a0d12", "#F0F0F0", "#FFFFFF"],
    paint: [
      // grey hair across the hood region (y=0-2)
      { x: 3, y: 0, c: C.greyHair }, { x: 4, y: 0, c: C.greyHair }, { x: 5, y: 0, c: C.greyHair },
      { x: 6, y: 0, c: C.greyHair }, { x: 7, y: 0, c: C.greyHair }, { x: 8, y: 0, c: C.greyHair },
      { x: 9, y: 0, c: C.greyHair }, { x: 10, y: 0, c: C.greyHair }, { x: 11, y: 0, c: C.greyHair }, { x: 12, y: 0, c: C.greyHair },
      { x: 2, y: 1, c: C.greyHair }, { x: 3, y: 1, c: C.greyHair }, { x: 4, y: 1, c: C.greyHair }, { x: 5, y: 1, c: C.greyHair },
      { x: 6, y: 1, c: C.greyHair }, { x: 7, y: 1, c: C.greyHair }, { x: 8, y: 1, c: C.greyHair }, { x: 9, y: 1, c: C.greyHair },
      { x: 10, y: 1, c: C.greyHair }, { x: 11, y: 1, c: C.greyHair }, { x: 12, y: 1, c: C.greyHair }, { x: 13, y: 1, c: C.greyHair },
      { x: 1, y: 2, c: C.greyHair }, { x: 2, y: 2, c: C.greyHair }, { x: 3, y: 2, c: C.greyHair }, { x: 4, y: 2, c: C.greyHair },
      { x: 5, y: 2, c: C.greyHair }, { x: 6, y: 2, c: C.greyHair }, { x: 7, y: 2, c: C.greyHair }, { x: 8, y: 2, c: C.greyHair },
      { x: 9, y: 2, c: C.greyHair }, { x: 10, y: 2, c: C.greyHair }, { x: 11, y: 2, c: C.greyHair }, { x: 12, y: 2, c: C.greyHair },
      { x: 13, y: 2, c: C.greyHair }, { x: 14, y: 2, c: C.greyHair },
      // forehead (y=3 brim band) becomes cream skin — kill brim outline pixels then fill
      { x: 4, y: 3, c: C.cream }, { x: 5, y: 3, c: C.cream }, { x: 6, y: 3, c: C.cream },
      { x: 7, y: 3, c: C.cream }, { x: 8, y: 3, c: C.cream }, { x: 9, y: 3, c: C.cream },
      { x: 10, y: 3, c: C.cream }, { x: 11, y: 3, c: C.cream }, { x: 12, y: 3, c: C.cream },
      // cream face (y=4-7)
      { x: 4, y: 4, c: C.cream }, { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream }, { x: 7, y: 4, c: C.cream },
      { x: 8, y: 4, c: C.cream }, { x: 9, y: 4, c: C.cream }, { x: 10, y: 4, c: C.cream }, { x: 11, y: 4, c: C.cream }, { x: 12, y: 4, c: C.cream },
      { x: 4, y: 5, c: C.cream }, { x: 7, y: 5, c: C.cream }, { x: 8, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream }, { x: 12, y: 5, c: C.cream },
      { x: 4, y: 6, c: C.cream }, { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream }, { x: 7, y: 6, c: C.cream },
      { x: 8, y: 6, c: C.cream }, { x: 9, y: 6, c: C.cream }, { x: 10, y: 6, c: C.cream }, { x: 11, y: 6, c: C.cream }, { x: 12, y: 6, c: C.cream },
      // glasses (single black pixel per lens at y=5)
      { x: 5, y: 5, c: C.black }, { x: 6, y: 5, c: C.black },
      { x: 9, y: 5, c: C.black }, { x: 10, y: 5, c: C.black },
      // red collar/shirt at chest (y=8-9, narrow band beneath neck)
      { x: 7, y: 8, c: C.red }, { x: 8, y: 8, c: C.red },
      { x: 6, y: 9, c: C.red }, { x: 7, y: 9, c: C.red }, { x: 8, y: 9, c: C.red }, { x: 9, y: 9, c: C.red },
      // brown trousers on lower body (y=12-13)
      { x: 4, y: 12, c: "#5a3a1a" }, { x: 5, y: 12, c: "#5a3a1a" }, { x: 6, y: 12, c: "#5a3a1a" },
      { x: 9, y: 12, c: "#5a3a1a" }, { x: 10, y: 12, c: "#5a3a1a" }, { x: 11, y: 12, c: "#5a3a1a" }, { x: 12, y: 12, c: "#5a3a1a" },
      { x: 4, y: 13, c: "#3a2410" }, { x: 5, y: 13, c: "#3a2410" }, { x: 6, y: 13, c: "#3a2410" },
      { x: 9, y: 13, c: "#3a2410" }, { x: 10, y: 13, c: "#3a2410" }, { x: 11, y: 13, c: "#3a2410" }, { x: 12, y: 13, c: "#3a2410" },
    ],
  },
  {
    name: "spock", tile: 85, color: "blue+black",
    // Vulcan: solid Starfleet-blue uniform from shoulders down, single skin face,
    // tight black bowl-cut on crown only, pointy ears in extended canvas, gold delta.
    ramp: ["#0a1228", "#1E3A8A", "#3454C4"],
    extend: { left: 1, right: 1 },
    paint: [
      // clear the source's long-hair drape that flows past shoulders
      { x: 3, y: 7, c: null }, { x: 14, y: 7, c: null },
      { x: 3, y: 8, c: null }, { x: 14, y: 8, c: null },
      { x: 3, y: 9, c: null }, { x: 14, y: 9, c: null },
      { x: 3, y: 10, c: null }, { x: 14, y: 10, c: null },
      { x: 3, y: 11, c: null }, { x: 14, y: 11, c: null },
      // tight black bowl-cut on crown only (y=2-3, no temple bangs)
      { x: 6, y: 2, c: C.black }, { x: 7, y: 2, c: C.black }, { x: 8, y: 2, c: C.black },
      { x: 9, y: 2, c: C.black }, { x: 10, y: 2, c: C.black }, { x: 11, y: 2, c: C.black },
      { x: 5, y: 3, c: C.black }, { x: 6, y: 3, c: C.black }, { x: 7, y: 3, c: C.black }, { x: 8, y: 3, c: C.black },
      { x: 9, y: 3, c: C.black }, { x: 10, y: 3, c: C.black }, { x: 11, y: 3, c: C.black }, { x: 12, y: 3, c: C.black },
      // single clean skin face block (y=4-7)
      { x: 5, y: 4, c: C.cream }, { x: 6, y: 4, c: C.cream }, { x: 7, y: 4, c: C.cream }, { x: 8, y: 4, c: C.cream },
      { x: 9, y: 4, c: C.cream }, { x: 10, y: 4, c: C.cream }, { x: 11, y: 4, c: C.cream }, { x: 12, y: 4, c: C.cream },
      { x: 5, y: 5, c: C.cream }, { x: 6, y: 5, c: C.cream }, { x: 7, y: 5, c: C.cream }, { x: 8, y: 5, c: C.cream },
      { x: 9, y: 5, c: C.cream }, { x: 10, y: 5, c: C.cream }, { x: 11, y: 5, c: C.cream }, { x: 12, y: 5, c: C.cream },
      { x: 5, y: 6, c: C.cream }, { x: 6, y: 6, c: C.cream }, { x: 7, y: 6, c: C.cream }, { x: 8, y: 6, c: C.cream },
      { x: 9, y: 6, c: C.cream }, { x: 10, y: 6, c: C.cream }, { x: 11, y: 6, c: C.cream }, { x: 12, y: 6, c: C.cream },
      { x: 5, y: 7, c: C.cream }, { x: 6, y: 7, c: C.cream }, { x: 11, y: 7, c: C.cream }, { x: 12, y: 7, c: C.cream },
      // pointy ear tips poking out into extended columns (x=4, x=13)
      { x: 4, y: 5, c: C.cream }, { x: 4, y: 6, c: C.cream },
      { x: 13, y: 5, c: C.cream }, { x: 13, y: 6, c: C.cream },
      // eyebrows + eyes (the iconic flat brow)
      { x: 7, y: 5, c: C.black }, { x: 8, y: 5, c: C.black },
      { x: 10, y: 5, c: C.black }, { x: 11, y: 5, c: C.black },
      // solid Starfleet-blue uniform across shoulders/torso (y=8-12)
      { x: 5, y: 8, c: "#1E3A8A" }, { x: 6, y: 8, c: "#1E3A8A" }, { x: 7, y: 8, c: "#1E3A8A" }, { x: 8, y: 8, c: "#1E3A8A" },
      { x: 9, y: 8, c: "#1E3A8A" }, { x: 10, y: 8, c: "#1E3A8A" }, { x: 11, y: 8, c: "#1E3A8A" }, { x: 12, y: 8, c: "#1E3A8A" },
      { x: 5, y: 9, c: "#1E3A8A" }, { x: 6, y: 9, c: "#1E3A8A" }, { x: 7, y: 9, c: "#1E3A8A" }, { x: 8, y: 9, c: "#1E3A8A" },
      { x: 11, y: 9, c: "#1E3A8A" }, { x: 12, y: 9, c: "#1E3A8A" },
      // gold delta comm badge — center of chest
      { x: 9, y: 9, c: C.gold }, { x: 10, y: 9, c: C.gold },
    ],
  },
  {
    name: "piccolo", tile: 108, color: "green+purple",
    ramp: ["#1a3a1a", "#4ADE80", "#A78BFA"],
    paint: [
      { x: 6, y: 2, c: C.white }, { x: 7, y: 2, c: C.white },
      { x: 8, y: 2, c: C.white }, { x: 9, y: 2, c: C.white },
      { x: 4, y: 8, c: C.white }, { x: 11, y: 8, c: C.white },
    ],
  },
];

// Side-view horse silhouette painted into a 16×8 region.
// xOff/yOff position the top-left corner inside the larger canvas.
function horseSilhouette(xOff, yOff) {
  const grid = [
    "................", // y=0
    ".........DDDD...", // y=1   head profile (right)
    "..DDDDDDDSSSSDS.", // y=2   back + neck + ear flick
    ".DSSSSSSSSSSSDS.", // y=3   body top
    ".DSSSSSSSSSSSDD.", // y=4   body underline
    ".D..SD.....SD...", // y=5   front + back legs
    ".D..SD.....SD...", // y=6   legs
    ".....D......D...", // y=7   hooves
  ];
  const map = { ".": null, S: C.silver, D: C.silverShade, O: C.black };
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

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function setPixel(buf, w, x, y, [r, g, b], a = 255) {
  const i = (y * w + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}

async function recolor(agent) {
  const dir = PACK_DIRS[agent.pack ?? "dungeon"];
  const tilePath = join(dir, `tile_${String(agent.tile).padStart(4, "0")}.png`);
  const [shadow, mid, highlight] = agent.ramp.map(hex);
  const outline = shadow.map((c) => Math.round(c * 0.4));

  const img = sharp(tilePath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const W = info.width  + (agent.extend?.right  ?? 0) + (agent.extend?.left  ?? 0);
  const H = info.height + (agent.extend?.bottom ?? 0) + (agent.extend?.top   ?? 0);
  const xOff = agent.extend?.left ?? 0;
  const yOff = agent.extend?.top  ?? 0;

  const out = Buffer.alloc(W * H * 4);

  for (let sy = 0; sy < info.height; sy++) {
    for (let sx = 0; sx < info.width; sx++) {
      const si = (sy * info.width + sx) * 4;
      const a = data[si + 3];
      if (a < 8) continue;
      const L = luma(data[si], data[si + 1], data[si + 2]);
      let pick;
      if (L < 50) pick = outline;
      else if (L < 110) pick = shadow;
      else if (L < 190) pick = mid;
      else pick = highlight;
      setPixel(out, W, sx + xOff, sy + yOff, pick, a);
    }
  }

  for (const p of agent.paint ?? []) {
    if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) continue;
    if (p.c === null) {
      // transparent — clear pixel (used to erase unwanted source pixels like wizard hat tip)
      setPixel(out, W, p.x, p.y, [0, 0, 0], 0);
    } else {
      setPixel(out, W, p.x, p.y, hex(p.c), 255);
    }
  }

  const outPath = join(OUT_DIR, `${agent.name}.png`);
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .resize(W * 4, H * 4, { kernel: "nearest" })
    .png()
    .toFile(outPath);
  console.log(`  ${agent.name.padEnd(10)} ← tile_${String(agent.tile).padStart(4, "0")}.png  (${agent.color})  ${W}×${H}  ${(agent.paint?.length ?? 0)} paint`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`recolor-agents → ${OUT_DIR}`);
  for (const a of AGENTS) await recolor(a);
  console.log(`done. ${AGENTS.length} sprites.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
