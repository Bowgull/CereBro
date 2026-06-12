import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TraceCandidate = {
  name: string;
  status: "accepted" | "rejected";
  reason: string;
  sourceBox: Box;
  maxMismatchRatio: number;
  svg: string | string[];
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const sourcePath = path.join(repoRoot, "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png");
const candidatesDir = process.env.CEREBRO_BROWSER_HOME_TRACE_CANDIDATES_DIR
  ? path.resolve(appRoot, process.env.CEREBRO_BROWSER_HOME_TRACE_CANDIDATES_DIR)
  : path.join(appRoot, "client/public/browser-home/trace-candidates");
const outputDir = path.join(appRoot, "output/qa/browser-home-trace-candidates");
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";

function fail(message: string): never {
  throw new Error(message);
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function assertBox(name: string, box: Box) {
  for (const field of ["left", "top", "width", "height"] as const) {
    if (!Number.isFinite(box[field])) fail(`${name} has invalid ${field}`);
  }
  if (box.left < 0 || box.top < 0 || box.width <= 0 || box.height <= 0) {
    fail(`${name} has invalid box ${JSON.stringify(box)}`);
  }
}

function readCandidate(filePath: string) {
  const candidate = JSON.parse(fs.readFileSync(filePath, "utf8")) as TraceCandidate;
  if (!candidate.name.trim()) fail(`${filePath} is missing name`);
  if (candidate.status !== "accepted" && candidate.status !== "rejected") fail(`${candidate.name} has invalid status`);
  if (!candidate.reason.trim()) fail(`${candidate.name} is missing reason`);
  assertBox(`${candidate.name}.sourceBox`, candidate.sourceBox);
  if (!Number.isFinite(candidate.maxMismatchRatio) || candidate.maxMismatchRatio < 0) {
    fail(`${candidate.name} has invalid maxMismatchRatio`);
  }
  const svg = Array.isArray(candidate.svg) ? candidate.svg.join("\n") : candidate.svg;
  if (!svg.includes("<svg") || !svg.includes("</svg>")) fail(`${candidate.name} has invalid svg`);
  if (/<image\b/i.test(svg)) fail(`${candidate.name} embeds raster image content instead of traced vector geometry`);
  if (/data:image\//i.test(svg)) fail(`${candidate.name} embeds a data image instead of traced vector geometry`);
  if (/\bhref\s*=\s*["'][^"']+\.(png|jpe?g|webp|gif|avif|bmp|tiff?)/i.test(svg)) {
    fail(`${candidate.name} references a raster image instead of traced vector geometry`);
  }
  return { ...candidate, svg };
}

async function renderCandidate(candidate: TraceCandidate & { svg: string }) {
  const expectedBuffer = await sharp(sourcePath).extract(candidate.sourceBox).png().toBuffer();
  const actualBuffer = await sharp(Buffer.from(candidate.svg)).resize(candidate.sourceBox.width, candidate.sourceBox.height, { fit: "fill" }).png().toBuffer();
  return { expectedBuffer, actualBuffer };
}

async function compare(candidate: TraceCandidate & { svg: string }) {
  const { expectedBuffer, actualBuffer } = await renderCandidate(candidate);
  const expected = PNG.sync.read(expectedBuffer);
  const actual = PNG.sync.read(actualBuffer);
  const diff = new PNG({ width: expected.width, height: expected.height });
  const mismatchedPixels = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
    threshold: 0.12,
    includeAA: true,
  });
  const mismatchRatio = mismatchedPixels / (expected.width * expected.height);
  const candidateDir = path.join(outputDir, candidate.name);
  fs.mkdirSync(candidateDir, { recursive: true });
  fs.writeFileSync(path.join(candidateDir, "expected.png"), expectedBuffer);
  fs.writeFileSync(path.join(candidateDir, "actual.png"), actualBuffer);
  fs.writeFileSync(path.join(candidateDir, "diff.png"), PNG.sync.write(diff));
  return {
    width: expected.width,
    height: expected.height,
    mismatchedPixels,
    mismatchRatio,
  };
}

async function main() {
  if (!fs.existsSync(sourcePath)) fail(`Missing locked Browser Home source: ${sourcePath}`);
  const sourceSha = sha256(sourcePath);
  if (sourceSha !== lockedBrowserHomeSha256) fail(`Locked Browser Home source changed: ${sourceSha}`);
  if (!fs.existsSync(candidatesDir)) fail(`Missing Browser Home trace candidates directory: ${candidatesDir}`);

  fs.mkdirSync(outputDir, { recursive: true });
  const candidateFiles = fs.readdirSync(candidatesDir).filter((file) => file.endsWith(".json")).sort();
  if (candidateFiles.length === 0) fail(`No Browser Home trace candidates found in ${candidatesDir}`);

  const results = [];
  for (const file of candidateFiles) {
    const candidate = readCandidate(path.join(candidatesDir, file));
    const comparison = await compare(candidate);
    const passesThreshold = comparison.mismatchRatio <= candidate.maxMismatchRatio;

    if (candidate.status === "accepted" && !passesThreshold) {
      fail(`${candidate.name} regressed: ${comparison.mismatchRatio} > ${candidate.maxMismatchRatio}`);
    }
    if (candidate.status === "rejected" && passesThreshold) {
      fail(`${candidate.name} no longer reproduces its trace failure: ${comparison.mismatchRatio} <= ${candidate.maxMismatchRatio}`);
    }

    results.push({
      name: candidate.name,
      status: candidate.status,
      maxMismatchRatio: candidate.maxMismatchRatio,
      ...comparison,
    });
  }

  console.log(JSON.stringify({
    ok: true,
    sourcePath,
    outputDir,
    results,
  }, null, 2));
}

await main();
