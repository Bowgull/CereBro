import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
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
  reason: string;
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
const outputDir = path.join(appRoot, "client/public/browser-home/trace-candidates");
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";

const traceTargets: Record<string, TraceTarget> = {
  "bookmark-card-add": {
    name: "bookmark-card-add",
    sourceBox: { left: 1260, top: 458, width: 152, height: 116 },
    reason: "ImageTracer posterized2 candidate for add bookmark card; recorded as rejected unless it passes the trace audit threshold.",
  },
  "top-url-omnibox": {
    name: "top-url-omnibox",
    sourceBox: { left: 339, top: 69, width: 948, height: 48 },
    reason: "ImageTracer posterized2 candidate for omnibox; recorded as rejected unless it passes the trace audit threshold.",
  },
};

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

async function main() {
  const targetName = process.env.CEREBRO_BROWSER_HOME_TRACE_TARGET ?? "bookmark-card-add";
  const target = traceTargets[targetName];
  if (!target) fail(`Unknown Browser Home trace target: ${targetName}`);
  if (!fs.existsSync(sourcePath)) fail(`Missing locked Browser Home source: ${sourcePath}`);
  const sourceSha = sha256(sourcePath);
  if (sourceSha !== lockedBrowserHomeSha256) fail(`Locked Browser Home source changed: ${sourceSha}`);

  const raw = await sharp(sourcePath)
    .extract(target.sourceBox)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const svg = normalizeSvg(ImageTracer.imagedataToSVG(
    { width: raw.info.width, height: raw.info.height, data: raw.data },
    "posterized2",
  ));

  const candidateName = `rejected-${target.name}-imagetracer-posterized2`;
  const candidate = {
    name: candidateName,
    status: "rejected",
    reason: target.reason,
    sourceBox: target.sourceBox,
    maxMismatchRatio: 0,
    svg,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${candidateName}.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(candidate, null, 2)}\n`);

  console.log(JSON.stringify({
    ok: true,
    outputPath,
    target: target.name,
    sourceBox: target.sourceBox,
    candidateName,
    svgLength: svg.length,
  }, null, 2));
}

await main();
