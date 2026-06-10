import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const expectedPath = path.join(repoRoot, "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png");
const actualPath = path.join(appRoot, "output/qa/cerebro-installed-browser-home-smoke.png");
const outputDir = path.join(appRoot, "output/qa/browser-home-diff");
const normalizedActualPath = path.join(outputDir, "browser-home-actual-normalized.png");
const diffPath = path.join(outputDir, "browser-home-diff.png");

if (!fs.existsSync(expectedPath)) throw new Error(`Missing expected mockup: ${expectedPath}`);
if (!fs.existsSync(actualPath)) throw new Error(`Missing actual screenshot: ${actualPath}`);

fs.mkdirSync(outputDir, { recursive: true });

const expected = PNG.sync.read(fs.readFileSync(expectedPath));
const actualSource = PNG.sync.read(fs.readFileSync(actualPath));
const normalizedActualBuffer = await sharp(actualPath)
  .resize(expected.width, expected.height, { fit: "fill" })
  .png()
  .toBuffer();
const actual = PNG.sync.read(normalizedActualBuffer);

fs.writeFileSync(normalizedActualPath, PNG.sync.write(actual));

const diff = new PNG({ width: expected.width, height: expected.height });
const mismatchedPixels = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
  threshold: 0.12,
  includeAA: true,
});

fs.writeFileSync(diffPath, PNG.sync.write(diff));

const totalPixels = expected.width * expected.height;
const mismatchRatio = mismatchedPixels / totalPixels;
const summary = {
  expectedPath,
  actualPath,
  normalizedActualPath,
  diffPath,
  expectedSize: `${expected.width}x${expected.height}`,
  actualSourceSize: `${actualSource.width}x${actualSource.height}`,
  mismatchedPixels,
  mismatchRatio,
};

console.log(JSON.stringify(summary, null, 2));
