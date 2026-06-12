import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const manifestPath = path.join(repoRoot, "mockups/compare/manifest.json");
const lockedBrowserHomeReference = "approved/browser-home/browser-home-symmetric-rails-target-v1.png";
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";
const expectedPath = path.join(repoRoot, "mockups/compare", lockedBrowserHomeReference);
const actualPath = path.join(appRoot, "output/qa/cerebro-installed-browser-home-smoke.png");
const outputDir = path.join(appRoot, "output/qa/browser-home-diff");
const normalizedActualPath = path.join(outputDir, "browser-home-actual-normalized.png");
const diffPath = path.join(outputDir, "browser-home-diff.png");
const acceptedBrowserHomeMismatchRatio = 0.08862190902615244;
const strictMode = process.env.CEREBRO_BROWSER_HOME_DIFF_STRICT === "1";
const maxMismatchRatio = Number.parseFloat(
  process.env.CEREBRO_BROWSER_HOME_MAX_MISMATCH_RATIO ?? `${acceptedBrowserHomeMismatchRatio}`,
);

type MockupManifest = {
  lockedPrimaryBrowserHomeReference?: string;
  lockedPrimaryBrowserHomeSha256?: string;
};

if (!fs.existsSync(manifestPath)) throw new Error(`Missing mockup manifest: ${manifestPath}`);
if (!fs.existsSync(expectedPath)) throw new Error(`Missing expected mockup: ${expectedPath}`);
if (!fs.existsSync(actualPath)) throw new Error(`Missing actual screenshot: ${actualPath}`);
if (!Number.isFinite(maxMismatchRatio) || maxMismatchRatio <= 0) {
  throw new Error(`Invalid Browser Home max mismatch ratio: ${process.env.CEREBRO_BROWSER_HOME_MAX_MISMATCH_RATIO}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as MockupManifest;
if (manifest.lockedPrimaryBrowserHomeReference !== lockedBrowserHomeReference) {
  throw new Error(`Wrong Browser Home reference: ${manifest.lockedPrimaryBrowserHomeReference ?? "unset"}`);
}
if (manifest.lockedPrimaryBrowserHomeSha256 !== lockedBrowserHomeSha256) {
  throw new Error(`Wrong Browser Home reference hash in manifest: ${manifest.lockedPrimaryBrowserHomeSha256 ?? "unset"}`);
}
if (manifest.lockedPrimaryBrowserHomeReference.includes("browser-loaded")) {
  throw new Error("Browser Home visual diff cannot use the loaded-page mockup.");
}

const expectedHash = crypto.createHash("sha256").update(fs.readFileSync(expectedPath)).digest("hex");
if (expectedHash !== lockedBrowserHomeSha256) {
  throw new Error(`Locked Browser Home mockup hash changed: ${expectedHash}`);
}

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
  lockedBrowserHomeReference,
  lockedBrowserHomeSha256,
  expectedSize: `${expected.width}x${expected.height}`,
  actualSourceSize: `${actualSource.width}x${actualSource.height}`,
  mismatchedPixels,
  mismatchRatio,
  acceptedBrowserHomeMismatchRatio,
  maxMismatchRatio,
  strictMode,
};

console.log(JSON.stringify(summary, null, 2));

if (strictMode && mismatchRatio > maxMismatchRatio) {
  throw new Error(`Browser Home visual diff regressed: ${mismatchRatio} > ${maxMismatchRatio}`);
}
