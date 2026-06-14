import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const lockedSourceRelativePath = "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png";
const lockedSourceSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";
const sourcePath = path.join(repoRoot, lockedSourceRelativePath);
const assetDir = path.join(appRoot, "client/public/browser-home/assets");

const targets: Record<string, { outputName: string; box: Box; role: string }> = {
  "top-url-action-cluster": {
    outputName: "top-url-action-cluster.svg",
    box: { left: 1309, top: 69, width: 240, height: 52 },
    role: "Top URL row shield, library, stats, and page actions cluster.",
  },
};

function fail(message: string): never {
  throw new Error(message);
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function colorKey(r: number, g: number, b: number, a: number) {
  return `${r},${g},${b},${a}`;
}

function fillFromKey(key: string) {
  const [r, g, b, a] = key.split(",").map(Number);
  if (a === 255) {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }

  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(4)})`;
}

async function pixelSvg(targetName: string) {
  const target = targets[targetName];
  if (!target) fail(`Unknown Browser Home pixel SVG target: ${targetName}`);
  if (!fs.existsSync(sourcePath)) fail(`Missing locked Browser Home source: ${sourcePath}`);
  const sourceSha = sha256(sourcePath);
  if (sourceSha !== lockedSourceSha256) fail(`Locked Browser Home source changed: ${sourceSha}`);

  const raw = await sharp(sourcePath)
    .extract(target.box)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pathsByColor = new Map<string, string[]>();
  const channels = raw.info.channels;

  for (let y = 0; y < raw.info.height; y += 1) {
    let runStart = 0;
    let runColor = "";

    for (let x = 0; x <= raw.info.width; x += 1) {
      const offset = (y * raw.info.width + x) * channels;
      const nextColor = x < raw.info.width
        ? colorKey(raw.data[offset], raw.data[offset + 1], raw.data[offset + 2], raw.data[offset + 3])
        : "";

      if (x === 0) {
        runStart = 0;
        runColor = nextColor;
        continue;
      }

      if (nextColor !== runColor) {
        if (!pathsByColor.has(runColor)) pathsByColor.set(runColor, []);
        pathsByColor.get(runColor)?.push(`M${runStart} ${y}h${x - runStart}v1H${runStart}z`);
        runStart = x;
        runColor = nextColor;
      }
    }
  }

  const sortedEntries = Array.from(pathsByColor.entries()).sort(([a], [b]) => a.localeCompare(b));
  const paths = sortedEntries
    .map(([key, segments]) => `<path fill="${fillFromKey(key)}" d="${segments.join("")}"/>`)
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${target.box.width}" height="${target.box.height}" viewBox="0 0 ${target.box.width} ${target.box.height}">`,
    `<title>${target.role}</title>`,
    `<desc>Source-derived pixel SVG from ${lockedSourceRelativePath}; source SHA-256 ${lockedSourceSha256}; source box ${target.box.left},${target.box.top},${target.box.width},${target.box.height}. No raster image embedding.</desc>`,
    paths,
    "</svg>",
    "",
  ].join("\n");
}

async function main() {
  const targetName = process.env.CEREBRO_BROWSER_HOME_PIXEL_SVG_TARGET ?? "top-url-action-cluster";
  const target = targets[targetName];
  if (!target) fail(`Unknown Browser Home pixel SVG target: ${targetName}`);
  const svg = await pixelSvg(targetName);
  fs.mkdirSync(assetDir, { recursive: true });
  const outputPath = path.join(assetDir, target.outputName);
  fs.writeFileSync(outputPath, svg);

  console.log(JSON.stringify({
    ok: true,
    outputPath,
    target: targetName,
    outputName: target.outputName,
    source: lockedSourceRelativePath,
    sourceSha256: lockedSourceSha256,
    box: target.box,
    svgLength: svg.length,
  }, null, 2));
}

await main();
