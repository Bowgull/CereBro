import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TraceTarget = {
  name: string;
  sourceBox: Box;
  role: string;
};

type TracePreset = {
  name: string;
  options: string | Record<string, unknown>;
};

type ImageTracerApi = {
  imagedataToSVG: (
    imageData: { width: number; height: number; data: Buffer },
    options: string | Record<string, unknown>,
  ) => string;
};

const require = createRequire(import.meta.url);
const ImageTracer = require("imagetracerjs") as ImageTracerApi;

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const sourcePath = path.join(repoRoot, "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png");
const outputDir = path.join(
  repoRoot,
  "docs/design/external-ai/local-extraction/2026-06-12/browser-home-trace-sweep",
);
const qaOutputDir = path.join(appRoot, "output/qa/browser-home-trace-sweep");
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";

const traceTargets: TraceTarget[] = [
  {
    name: "top-url-omnibox",
    sourceBox: { left: 339, top: 69, width: 948, height: 48 },
    role: "Top URL row omnibox frame, search icon, and placeholder text.",
  },
  {
    name: "top-url-action-cluster",
    sourceBox: { left: 1309, top: 69, width: 240, height: 52 },
    role: "Top URL row shield, library, stats, and page actions controls.",
  },
  {
    name: "bookmark-card-add",
    sourceBox: { left: 1260, top: 458, width: 152, height: 116 },
    role: "Add bookmark card frame, plus mark, label, and status dot.",
  },
  {
    name: "panel-continue",
    sourceBox: { left: 230, top: 604, width: 384, height: 224 },
    role: "Continue browsing lower panel frame and row styling.",
  },
  {
    name: "panel-recent",
    sourceBox: { left: 636, top: 604, width: 392, height: 224 },
    role: "Recent lower panel frame and row styling.",
  },
  {
    name: "panel-downloads",
    sourceBox: { left: 1051, top: 604, width: 368, height: 224 },
    role: "Downloads lower panel frame and row styling.",
  },
  {
    name: "aang-dock-controls",
    sourceBox: { left: 289, top: 878, width: 1104, height: 70 },
    role: "Bottom Aang input frame and command controls without avatar art.",
  },
];

const tracePresets: TracePreset[] = [
  { name: "posterized2", options: "posterized2" },
  { name: "posterized3", options: "posterized3" },
  { name: "curvy", options: "curvy" },
  { name: "sharp", options: "sharp" },
  {
    name: "low-color-tight",
    options: {
      numberofcolors: 12,
      colorsampling: 2,
      colorquantcycles: 4,
      ltres: 0.4,
      qtres: 0.4,
      pathomit: 2,
      rightangleenhance: true,
    },
  },
  {
    name: "mid-color-tight",
    options: {
      numberofcolors: 24,
      colorsampling: 2,
      colorquantcycles: 5,
      ltres: 0.3,
      qtres: 0.3,
      pathomit: 1,
      rightangleenhance: true,
    },
  },
  {
    name: "high-color-fine",
    options: {
      numberofcolors: 48,
      colorsampling: 2,
      colorquantcycles: 6,
      ltres: 0.15,
      qtres: 0.15,
      pathomit: 0,
      rightangleenhance: true,
    },
  },
  {
    name: "very-high-color-fine",
    options: {
      numberofcolors: 64,
      colorsampling: 2,
      colorquantcycles: 6,
      ltres: 0.1,
      qtres: 0.1,
      pathomit: 0,
      rightangleenhance: true,
    },
  },
];

function fail(message: string): never {
  throw new Error(message);
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function normalizeSvg(svg: string) {
  return svg
    .replace(/<desc>.*?<\/desc>/gs, "")
    .replace(/\s+id="[^"]*"/g, "");
}

async function cropTarget(target: TraceTarget) {
  const crop = await sharp(sourcePath).extract(target.sourceBox).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const png = await sharp(sourcePath).extract(target.sourceBox).png().toBuffer();

  return {
    imageData: {
      width: crop.info.width,
      height: crop.info.height,
      data: crop.data,
    },
    png,
  };
}

async function compareSvgToCrop(svg: string, expectedBuffer: Buffer, box: Box) {
  const actualBuffer = await sharp(Buffer.from(svg)).resize(box.width, box.height, { fit: "fill" }).png().toBuffer();
  const expected = PNG.sync.read(expectedBuffer);
  const actual = PNG.sync.read(actualBuffer);
  const diff = new PNG({ width: expected.width, height: expected.height });
  const mismatchedPixels = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
    threshold: 0.12,
    includeAA: true,
  });

  return {
    actualBuffer,
    diffBuffer: PNG.sync.write(diff),
    mismatchedPixels,
    mismatchRatio: mismatchedPixels / (expected.width * expected.height),
  };
}

async function main() {
  if (!fs.existsSync(sourcePath)) fail(`Missing locked Browser Home source: ${sourcePath}`);
  const sourceSha256 = sha256(sourcePath);
  if (sourceSha256 !== lockedBrowserHomeSha256) fail(`Locked Browser Home source changed: ${sourceSha256}`);

  fs.rmSync(qaOutputDir, { force: true, recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(qaOutputDir, { recursive: true });

  const results = [];

  for (const target of traceTargets) {
    const crop = await cropTarget(target);
    const targetOutputDir = path.join(qaOutputDir, target.name);
    fs.mkdirSync(targetOutputDir, { recursive: true });
    fs.writeFileSync(path.join(targetOutputDir, "expected.png"), crop.png);

    const presetResults = [];

    for (const preset of tracePresets) {
      const svg = normalizeSvg(ImageTracer.imagedataToSVG(crop.imageData, preset.options));
      const comparison = await compareSvgToCrop(svg, crop.png, target.sourceBox);

      fs.writeFileSync(path.join(targetOutputDir, `${preset.name}.actual.png`), comparison.actualBuffer);
      fs.writeFileSync(path.join(targetOutputDir, `${preset.name}.diff.png`), comparison.diffBuffer);

      presetResults.push({
        preset: preset.name,
        mismatchRatio: comparison.mismatchRatio,
        mismatchedPixels: comparison.mismatchedPixels,
        svgLength: svg.length,
        output: {
          actual: path.relative(repoRoot, path.join(targetOutputDir, `${preset.name}.actual.png`)),
          diff: path.relative(repoRoot, path.join(targetOutputDir, `${preset.name}.diff.png`)),
        },
      });
    }

    presetResults.sort((a, b) => a.mismatchRatio - b.mismatchRatio);

    results.push({
      target: target.name,
      role: target.role,
      sourceBox: target.sourceBox,
      bestPreset: presetResults[0],
      presets: presetResults,
    });
  }

  const summary = {
    source: path.relative(repoRoot, sourcePath),
    sourceSha256,
    generatedAt: new Date().toISOString(),
    rule: "Trace sweep is evidence only. Do not promote a target into production unless a candidate passes trace audit and installed strict visual diff.",
    promotionThreshold: "Must improve or preserve accepted strict Browser Home mismatch ratio and pass provenance audit.",
    results,
  };

  fs.writeFileSync(path.join(outputDir, "trace-sweep-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

  const rows = results.map((result) => {
    const best = result.bestPreset;
    return `| ${result.target} | ${best.preset} | ${best.mismatchRatio} | ${best.mismatchedPixels} | ${best.svgLength} |`;
  });
  const readme = [
    "# Browser Home Trace Sweep",
    "",
    "Local extraction evidence only. This does not authorize a production replacement by itself.",
    "",
    `Source: \`${summary.source}\``,
    `SHA-256: \`${sourceSha256}\``,
    "",
    "| Target | Best preset | Mismatch ratio | Mismatched pixels | SVG length |",
    "| --- | --- | ---: | ---: | ---: |",
    ...rows,
    "",
    "QA image outputs are written under `app/output/qa/browser-home-trace-sweep/` and are intentionally not committed.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outputDir, "README.md"), readme);

  console.log(JSON.stringify({ ok: true, outputDir, qaOutputDir, results: results.map(({ target, bestPreset }) => ({ target, bestPreset })) }, null, 2));
}

await main();
