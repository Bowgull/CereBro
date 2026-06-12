import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

type BrowserHomeBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type BrowserHomeMedium = "raster" | "measured-css" | "traced-svg" | "external-ai-reference";

type BrowserHomeAssetEntry = {
  name: string;
  source: string;
  sourceSha256: string;
  box: BrowserHomeBox;
  role: string;
  medium: BrowserHomeMedium;
  productionAllowed: boolean;
};

type BrowserHomeAssetManifest = {
  source: string;
  sourceSha256: string;
  allowedMedia: BrowserHomeMedium[];
  assets: BrowserHomeAssetEntry[];
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const assetDir = path.join(appRoot, "client", "public", "browser-home", "assets");
const manifestPath = path.join(assetDir, "manifest.json");
const browserPanelPath = path.join(appRoot, "client", "src", "components", "BrowserPanel.tsx");
const lockedBrowserHomeReference = "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png";
const lockedBrowserHomeSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";
const allowedMedia = new Set<BrowserHomeMedium>(["raster", "measured-css", "traced-svg", "external-ai-reference"]);

function fail(message: string): never {
  throw new Error(message);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function assertBox(name: string, box: BrowserHomeBox) {
  const fields: Array<keyof BrowserHomeBox> = ["left", "top", "width", "height"];
  for (const field of fields) {
    if (!Number.isFinite(box[field]) || box[field] < 0) fail(`${name} has invalid box.${field}`);
  }
  if (box.width <= 0 || box.height <= 0) fail(`${name} has non-positive dimensions`);
}

function browserHomeAssetImports() {
  const source = fs.readFileSync(browserPanelPath, "utf8");
  const matches = source.matchAll(/["'`]\/browser-home\/assets\/([^"'`]+)["'`]/g);
  return new Set(Array.from(matches, (match) => match[1]).filter((name) => !name.includes("${")));
}

function assertTracedSvg(name: string, svg: string) {
  if (!svg.includes("<svg") || !svg.includes("</svg>")) fail(`${name} is not valid SVG content`);
  if (/<image\b/i.test(svg)) fail(`${name} embeds raster image content instead of traced vector geometry`);
  if (/data:image\//i.test(svg)) fail(`${name} embeds a data image instead of traced vector geometry`);
  if (/\bhref\s*=\s*["'][^"']+\.(png|jpe?g|webp|gif|avif|bmp|tiff?)/i.test(svg)) {
    fail(`${name} references a raster image instead of traced vector geometry`);
  }
}

async function main() {
  if (!fs.existsSync(manifestPath)) fail(`Missing Browser Home asset manifest: ${manifestPath}`);
  if (!fs.existsSync(browserPanelPath)) fail(`Missing BrowserPanel source: ${browserPanelPath}`);

  const manifest = readJson<BrowserHomeAssetManifest>(manifestPath);
  if (manifest.source !== lockedBrowserHomeReference) fail(`Wrong Browser Home source: ${manifest.source}`);
  if (manifest.sourceSha256 !== lockedBrowserHomeSha256) fail(`Wrong Browser Home source hash in manifest: ${manifest.sourceSha256}`);

  const sourcePath = path.join(repoRoot, manifest.source);
  if (!fs.existsSync(sourcePath)) fail(`Missing locked Browser Home source image: ${sourcePath}`);
  const actualSourceSha = sha256(sourcePath);
  if (actualSourceSha !== lockedBrowserHomeSha256) fail(`Locked Browser Home source changed: ${actualSourceSha}`);

  if (!Array.isArray(manifest.allowedMedia) || manifest.allowedMedia.some((medium) => !allowedMedia.has(medium))) {
    fail("Browser Home manifest has invalid allowedMedia");
  }

  const names = new Set<string>();
  for (const asset of manifest.assets) {
    if (names.has(asset.name)) fail(`Duplicate Browser Home asset entry: ${asset.name}`);
    names.add(asset.name);
    if (asset.source !== manifest.source) fail(`${asset.name} does not carry the locked source path`);
    if (asset.sourceSha256 !== manifest.sourceSha256) fail(`${asset.name} does not carry the locked source hash`);
    if (!allowedMedia.has(asset.medium)) fail(`${asset.name} has invalid medium: ${asset.medium}`);
    if (asset.productionAllowed !== true) fail(`${asset.name} is not allowed for production`);
    if (!asset.role.trim()) fail(`${asset.name} is missing role`);
    assertBox(asset.name, asset.box);

    const assetPath = path.join(assetDir, asset.name);
    if (asset.medium === "raster") {
      if (!fs.existsSync(assetPath)) fail(`Missing Browser Home asset file: ${assetPath}`);
      const metadata = await sharp(assetPath).metadata();
      if (metadata.width !== asset.box.width || metadata.height !== asset.box.height) {
        fail(`${asset.name} dimensions ${metadata.width}x${metadata.height} do not match box ${asset.box.width}x${asset.box.height}`);
      }
    } else if (asset.medium === "traced-svg") {
      if (!fs.existsSync(assetPath)) fail(`Missing Browser Home traced SVG asset file: ${assetPath}`);
      const svg = fs.readFileSync(assetPath, "utf8");
      assertTracedSvg(asset.name, svg);
      const metadata = await sharp(Buffer.from(svg)).metadata();
      if (metadata.width !== asset.box.width || metadata.height !== asset.box.height) {
        fail(`${asset.name} dimensions ${metadata.width}x${metadata.height} do not match box ${asset.box.width}x${asset.box.height}`);
      }
    }
  }

  const importedAssets = browserHomeAssetImports();
  for (const imported of importedAssets) {
    if (!names.has(imported)) fail(`BrowserPanel imports unproven Browser Home asset: ${imported}`);
  }

  const files = fs.readdirSync(assetDir).filter((file) => file.endsWith(".png") || file.endsWith(".svg"));
  for (const file of files) {
    if (!names.has(file)) fail(`Browser Home asset file is not listed in manifest: ${file}`);
  }

  console.log(JSON.stringify({
    ok: true,
    source: manifest.source,
    sourceSha256: manifest.sourceSha256,
    assetCount: manifest.assets.length,
    importedAssetCount: importedAssets.size,
  }, null, 2));
}

await main();
