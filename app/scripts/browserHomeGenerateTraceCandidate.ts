import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import {
  ColorMode,
  Hierarchical,
  OptimizePreset,
  PathSimplifyMode,
  optimize,
  vectorize,
} from "@neplex/vectorizer";

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
  engine: "imagetracer-posterized2" | "imagetracer-high-color-fine" | "vtracer-fine-spline";
  maxMismatchRatio: number;
  status: "accepted" | "rejected";
  manualInstalledVisualReview?: {
    status: "passed" | "failed";
    reviewer: string;
    screenshotPath?: string;
    notes: string;
  };
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
const sourcePath = path.join(repoRoot, "mockups/approved/browser-home-symmetric-rails-target-v1.png");
const outputDir = path.join(appRoot, "client/public/browser-home/trace-candidates");
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";

const traceTargets: Record<string, TraceTarget> = {
  "bookmark-card-add": {
    name: "bookmark-card-add",
    sourceBox: { left: 1260, top: 458, width: 152, height: 116 },
    reason: "ImageTracer posterized2 candidate for add bookmark card; recorded as rejected unless it passes the trace audit threshold.",
    engine: "imagetracer-posterized2",
    maxMismatchRatio: 0,
    status: "rejected",
  },
  "bookmark-card-add-vtracer-fine-spline": {
    name: "bookmark-card-add",
    sourceBox: { left: 1260, top: 458, width: 152, height: 116 },
    reason: "VTracer fine spline candidate for add bookmark card; rejected after installed visual review because the Add label rendered incorrectly despite a low crop mismatch ratio.",
    engine: "vtracer-fine-spline",
    maxMismatchRatio: 0,
    status: "rejected",
    manualInstalledVisualReview: {
      status: "failed",
      reviewer: "codex",
      screenshotPath: "app/output/qa/cerebro-installed-browser-home-smoke.png",
      notes: "Installed screenshot review showed the visible Add label rendered incorrectly as dd.",
    },
  },
  "top-url-omnibox": {
    name: "top-url-omnibox",
    sourceBox: { left: 339, top: 69, width: 948, height: 48 },
    reason: "ImageTracer posterized2 candidate for omnibox; recorded as rejected unless it passes the trace audit threshold.",
    engine: "imagetracer-posterized2",
    maxMismatchRatio: 0,
    status: "rejected",
  },
  "top-url-action-cluster-high-color-fine": {
    name: "top-url-action-cluster",
    sourceBox: { left: 1309, top: 69, width: 240, height: 52 },
    reason: "ImageTracer high-color-fine candidate for the top URL action cluster; rejected because local tracing is not production quality without installed visual review and strict diff proof.",
    engine: "imagetracer-high-color-fine",
    maxMismatchRatio: 0,
    status: "rejected",
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

  const crop = sharp(sourcePath).extract(target.sourceBox).ensureAlpha();
  const raw = await crop.clone().raw().toBuffer({ resolveWithObject: true });

  const svg = target.engine === "imagetracer-posterized2" || target.engine === "imagetracer-high-color-fine"
    ? normalizeSvg(ImageTracer.imagedataToSVG(
      { width: raw.info.width, height: raw.info.height, data: raw.data },
      target.engine === "imagetracer-high-color-fine"
        ? {
          numberofcolors: 48,
          colorsampling: 2,
          colorquantcycles: 6,
          ltres: 0.15,
          qtres: 0.15,
          pathomit: 0,
          rightangleenhance: true,
        }
        : "posterized2",
    ))
    : normalizeSvg(await optimize(await vectorize(await crop.clone().png().toBuffer(), {
      colorMode: ColorMode.Color,
      colorPrecision: 7,
      filterSpeckle: 2,
      spliceThreshold: 40,
      cornerThreshold: 55,
      hierarchical: Hierarchical.Stacked,
      mode: PathSimplifyMode.Spline,
      layerDifference: 4,
      lengthThreshold: 4,
      maxIterations: 3,
      pathPrecision: 4,
    }), { preset: OptimizePreset.Safe, multipass: true, multipassIterations: 4 }));

  const candidateName = `${target.status}-${targetName}`;
  const candidate = {
    name: candidateName,
    status: target.status,
    reason: target.reason,
    sourceBox: target.sourceBox,
    maxMismatchRatio: target.maxMismatchRatio,
    ...(target.manualInstalledVisualReview ? { manualInstalledVisualReview: target.manualInstalledVisualReview } : {}),
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
