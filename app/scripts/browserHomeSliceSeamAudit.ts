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

type CandidateSlice = {
  name: string;
  sourceBox: Box;
  targetBox: Box;
};

type RenderScale = {
  name: string;
  scaleX: number;
  scaleY: number;
};

type SliceCandidate = {
  name: string;
  status: "accepted" | "rejected";
  reason: string;
  sourceBox: Box;
  maxMismatchRatio: number;
  renderScales: RenderScale[];
  slices: CandidateSlice[];
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const sourcePath = path.join(repoRoot, "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png");
const candidatesDir = path.join(appRoot, "client/public/browser-home/slice-candidates");
const outputDir = path.join(appRoot, "output/qa/browser-home-slice-seams");
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";

function fail(message: string): never {
  throw new Error(message);
}

function assertBox(name: string, box: Box) {
  for (const key of ["left", "top", "width", "height"] as const) {
    if (!Number.isFinite(box[key])) fail(`${name} has invalid ${key}`);
  }
  if (box.left < 0 || box.top < 0 || box.width <= 0 || box.height <= 0) {
    fail(`${name} has invalid box ${JSON.stringify(box)}`);
  }
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readCandidate(filePath: string) {
  const candidate = JSON.parse(fs.readFileSync(filePath, "utf8")) as SliceCandidate;
  if (!candidate.name.trim()) fail(`${filePath} is missing name`);
  if (candidate.status !== "accepted" && candidate.status !== "rejected") fail(`${candidate.name} has invalid status`);
  if (!candidate.reason.trim()) fail(`${candidate.name} is missing reason`);
  if (!Number.isFinite(candidate.maxMismatchRatio) || candidate.maxMismatchRatio < 0) {
    fail(`${candidate.name} has invalid maxMismatchRatio`);
  }
  assertBox(`${candidate.name}.sourceBox`, candidate.sourceBox);
  if (!Array.isArray(candidate.renderScales) || candidate.renderScales.length === 0) fail(`${candidate.name} has no renderScales`);
  if (!Array.isArray(candidate.slices) || candidate.slices.length === 0) fail(`${candidate.name} has no slices`);

  for (const scale of candidate.renderScales) {
    if (!scale.name.trim()) fail(`${candidate.name} has unnamed renderScale`);
    if (!Number.isFinite(scale.scaleX) || scale.scaleX <= 0) fail(`${candidate.name}.${scale.name} has invalid scaleX`);
    if (!Number.isFinite(scale.scaleY) || scale.scaleY <= 0) fail(`${candidate.name}.${scale.name} has invalid scaleY`);
  }

  for (const slice of candidate.slices) {
    if (!slice.name.trim()) fail(`${candidate.name} has unnamed slice`);
    assertBox(`${candidate.name}.${slice.name}.sourceBox`, slice.sourceBox);
    assertBox(`${candidate.name}.${slice.name}.targetBox`, slice.targetBox);
  }

  return candidate;
}

function scaled(value: number, scale: number) {
  return Math.round(value * scale);
}

async function renderCandidate(candidate: SliceCandidate, renderScale: RenderScale) {
  const expectedWidth = scaled(candidate.sourceBox.width, renderScale.scaleX);
  const expectedHeight = scaled(candidate.sourceBox.height, renderScale.scaleY);
  const expectedBuffer = await sharp(sourcePath)
    .extract(candidate.sourceBox)
    .resize(expectedWidth, expectedHeight, { fit: "fill" })
    .png()
    .toBuffer();

  const composites = await Promise.all(
    candidate.slices.map(async (slice) => {
      const input = await sharp(sourcePath)
        .extract(slice.sourceBox)
        .resize(scaled(slice.targetBox.width, renderScale.scaleX), scaled(slice.targetBox.height, renderScale.scaleY), { fit: "fill" })
        .png()
        .toBuffer();
      return {
        input,
        left: scaled(slice.targetBox.left, renderScale.scaleX),
        top: scaled(slice.targetBox.top, renderScale.scaleY),
      };
    }),
  );

  const actualBuffer = await sharp({
    create: {
      width: expectedWidth,
      height: expectedHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return { expectedBuffer, actualBuffer, width: expectedWidth, height: expectedHeight };
}

async function compare(candidate: SliceCandidate, renderScale: RenderScale) {
  const { expectedBuffer, actualBuffer, width, height } = await renderCandidate(candidate, renderScale);
  const expected = PNG.sync.read(expectedBuffer);
  const actual = PNG.sync.read(actualBuffer);
  const diff = new PNG({ width, height });
  const mismatchedPixels = pixelmatch(expected.data, actual.data, diff.data, width, height, {
    threshold: 0.12,
    includeAA: true,
  });
  const mismatchRatio = mismatchedPixels / (width * height);
  const candidateDir = path.join(outputDir, candidate.name, renderScale.name);
  fs.mkdirSync(candidateDir, { recursive: true });
  fs.writeFileSync(path.join(candidateDir, "expected.png"), expectedBuffer);
  fs.writeFileSync(path.join(candidateDir, "actual.png"), actualBuffer);
  fs.writeFileSync(path.join(candidateDir, "diff.png"), PNG.sync.write(diff));
  return { renderScale: renderScale.name, width, height, mismatchedPixels, mismatchRatio };
}

async function main() {
  if (!fs.existsSync(sourcePath)) fail(`Missing locked Browser Home source: ${sourcePath}`);
  if (sha256(sourcePath) !== lockedBrowserHomeSha256) fail(`Locked Browser Home source changed: ${sha256(sourcePath)}`);
  if (!fs.existsSync(candidatesDir)) fail(`Missing Browser Home slice candidates directory: ${candidatesDir}`);

  fs.mkdirSync(outputDir, { recursive: true });
  const candidateFiles = fs.readdirSync(candidatesDir).filter((file) => file.endsWith(".json")).sort();
  if (candidateFiles.length === 0) fail(`No Browser Home slice candidates found in ${candidatesDir}`);

  const results = [];
  for (const file of candidateFiles) {
    const candidate = readCandidate(path.join(candidatesDir, file));
    const comparisons = [];
    for (const renderScale of candidate.renderScales) {
      comparisons.push(await compare(candidate, renderScale));
    }
    const worstMismatchRatio = Math.max(...comparisons.map((result) => result.mismatchRatio));
    const passesThreshold = worstMismatchRatio <= candidate.maxMismatchRatio;

    if (candidate.status === "accepted" && !passesThreshold) {
      fail(`${candidate.name} regressed: ${worstMismatchRatio} > ${candidate.maxMismatchRatio}`);
    }
    if (candidate.status === "rejected" && passesThreshold) {
      fail(`${candidate.name} no longer reproduces its seam failure: ${worstMismatchRatio} <= ${candidate.maxMismatchRatio}`);
    }

    results.push({
      name: candidate.name,
      status: candidate.status,
      maxMismatchRatio: candidate.maxMismatchRatio,
      worstMismatchRatio,
      comparisons,
    });
  }

  console.log(JSON.stringify({ ok: true, sourcePath, outputDir, results }, null, 2));
}

await main();
