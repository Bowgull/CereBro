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

type TraceSweepSummary = {
  results: Array<{
    target: string;
    bestPreset: {
      preset: string;
      engine?: string;
      mismatchRatio: number;
      mismatchedPixels: number;
      svgLength: number;
      outputPaths?: {
        actual?: string;
        diff?: string;
      };
    };
  }>;
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const lockedSourceRelativePath = "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png";
const lockedSourceSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";
const sourcePath = path.join(repoRoot, lockedSourceRelativePath);
const currentAssetPath = path.join(appRoot, "client/public/browser-home/assets/top-url-action-cluster.png");
const normalizedActualPath = path.join(appRoot, "output/qa/browser-home-diff/browser-home-actual-normalized.png");
const visualDiffPath = path.join(appRoot, "output/qa/browser-home-diff/browser-home-diff.png");
const traceSweepPath = path.join(
  repoRoot,
  "docs/design/external-ai/local-extraction/2026-06-12/browser-home-trace-sweep/trace-sweep-summary.json",
);
const outputRoot = path.join(
  repoRoot,
  "docs/design/external-ai/local-extraction/2026-06-12/browser-home-action-cluster-packet",
);

const sourceBox: Box = { left: 1309, top: 69, width: 240, height: 52 };
const panelBox: Box = { left: 1164, top: 69, width: 240, height: 52 };

function fail(message: string): never {
  throw new Error(message);
}

function ensureFile(filePath: string) {
  if (!fs.existsSync(filePath)) fail(`Missing required file: ${filePath}`);
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readTraceSweep() {
  if (!fs.existsSync(traceSweepPath)) return null;
  return JSON.parse(fs.readFileSync(traceSweepPath, "utf8")) as TraceSweepSummary;
}

async function cropImage(inputPath: string, box: Box, outputPath: string) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(inputPath).extract(box).png().toFile(outputPath);
}

async function zoomImage(inputPath: string, outputPath: string, scale: number) {
  const metadata = await sharp(inputPath).metadata();
  if (!metadata.width || !metadata.height) fail(`Cannot read dimensions for ${inputPath}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(inputPath)
    .resize(metadata.width * scale, metadata.height * scale, { kernel: "nearest" })
    .png()
    .toFile(outputPath);
}

async function imageSize(inputPath: string) {
  const metadata = await sharp(inputPath).metadata();
  if (!metadata.width || !metadata.height) fail(`Cannot read dimensions for ${inputPath}`);
  return { width: metadata.width, height: metadata.height };
}

function markdownPacket(generatedAt: string, bestTrace: TraceSweepSummary["results"][number]["bestPreset"] | null) {
  const bestTraceText = bestTrace
    ? `${bestTrace.engine ?? "unknown"} / ${bestTrace.preset} / mismatch ${bestTrace.mismatchRatio} / svg ${bestTrace.svgLength}`
    : "none";

  return `# Browser Home Action Cluster Extraction Packet

Generated: ${generatedAt}

Source of truth:

\`${lockedSourceRelativePath}\`

SHA-256:

\`${lockedSourceSha256}\`

This packet is for no-cost extraction only. It does not authorize production replacement.

## Target

- Active asset: \`app/client/public/browser-home/assets/top-url-action-cluster.png\`
- Source box: \`${sourceBox.left},${sourceBox.top},${sourceBox.width},${sourceBox.height}\`
- Browser panel box: \`${panelBox.left},${panelBox.top},${panelBox.width},${panelBox.height}\`
- Required output: full-cluster \`traced-svg\` or \`external-ai-reference\`
- Best local trace so far: \`${bestTraceText}\`

## Files

- \`expected/top-url-action-cluster.png\`: locked mockup crop.
- \`actual/top-url-action-cluster.png\`: current installed screenshot crop normalized to mockup size.
- \`diff/top-url-action-cluster.png\`: strict visual diff crop.
- \`asset/top-url-action-cluster.png\`: current production raster asset.
- \`zoom/*-4x.png\`: nearest-neighbor zooms for manual inspection.

## Prior Rejection

The previous production attempt split the cluster into source crops plus CSS status dots. It regressed strict diff from \`0.08346456192123741\` to \`0.08349381805230488\`, then \`0.08348936603235982\` after tuning.

Do not retry that path.

## Extraction Rules

- No full-screen screenshot UI.
- No raster image embedding in SVG.
- No invented icon, frame, glow, dot, border, gradient, or ornament.
- Preserve the shield button, library button, stats button, page-actions button, inner bevels, green shield glow, status dot, and brass frame language.
- Preserve the exact 240 x 52 target box.
- Preserve real hitboxes in production. The visual extraction is not the interaction model.

## No-Cost External Tool Prompt

\`\`\`
Convert this exact CereBro Browser Home top URL action cluster crop into clean frontend-ready SVG/CSS reference.

Rules:
- Use only the provided crop as source.
- Do not redesign.
- Do not simplify into generic browser buttons.
- Do not embed the PNG as an image.
- Preserve the 240 x 52 layout, shield glow, status dot, brass borders, dark stone surfaces, and all four control frames.
- Return SVG or clear component measurements only.
- If text or icon detail cannot be represented, say which subpart failed instead of inventing a replacement.
\`\`\`

## Acceptance Gates

\`\`\`bash
pnpm --dir app run qa:browser-home-provenance
pnpm --dir app run qa:browser-home-trace-candidates
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/browserHomeTraceCandidateAudit.test.ts server/browserHomeBrandLayout.test.ts server/desktopInstalledSmoke.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run qa:browser-home-diff:strict
\`\`\`

Production promotion also requires package, reinstall, installed-app screenshot, strict diff no worse than \`0.08346456192123741\`, and manual visual-review metadata.
`;
}

async function main() {
  ensureFile(sourcePath);
  ensureFile(currentAssetPath);
  ensureFile(normalizedActualPath);
  ensureFile(visualDiffPath);

  const sourceSha = sha256(sourcePath);
  if (sourceSha !== lockedSourceSha256) fail(`Locked Browser Home source changed: ${sourceSha}`);

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  const expectedPath = path.join(outputRoot, "expected/top-url-action-cluster.png");
  const actualPath = path.join(outputRoot, "actual/top-url-action-cluster.png");
  const diffPath = path.join(outputRoot, "diff/top-url-action-cluster.png");
  const assetPath = path.join(outputRoot, "asset/top-url-action-cluster.png");

  await cropImage(sourcePath, sourceBox, expectedPath);
  await cropImage(normalizedActualPath, panelBox, actualPath);
  await cropImage(visualDiffPath, panelBox, diffPath);
  fs.mkdirSync(path.dirname(assetPath), { recursive: true });
  fs.copyFileSync(currentAssetPath, assetPath);

  await zoomImage(expectedPath, path.join(outputRoot, "zoom/expected-top-url-action-cluster-4x.png"), 4);
  await zoomImage(actualPath, path.join(outputRoot, "zoom/actual-top-url-action-cluster-4x.png"), 4);
  await zoomImage(diffPath, path.join(outputRoot, "zoom/diff-top-url-action-cluster-4x.png"), 4);
  await zoomImage(assetPath, path.join(outputRoot, "zoom/asset-top-url-action-cluster-4x.png"), 4);

  const traceSweep = readTraceSweep();
  const bestTrace = traceSweep?.results.find((result) => result.target === "top-url-action-cluster")?.bestPreset ?? null;
  const generatedAt = new Date().toISOString();
  const packet = {
    generatedAt,
    source: lockedSourceRelativePath,
    sourceSha256: lockedSourceSha256,
    target: "top-url-action-cluster",
    activeAsset: "app/client/public/browser-home/assets/top-url-action-cluster.png",
    sourceBox,
    panelBox,
    currentAssetSize: await imageSize(currentAssetPath),
    expectedCropSize: await imageSize(expectedPath),
    actualCropSize: await imageSize(actualPath),
    diffCropSize: await imageSize(diffPath),
    priorRejectedApproach: {
      name: "source-crops-plus-css-dots",
      strictDiffBefore: 0.08346456192123741,
      strictDiffRejectedFirst: 0.08349381805230488,
      strictDiffRejectedTuned: 0.08348936603235982,
      reason: "Regressed installed strict diff and relied on approximate CSS dots.",
    },
    bestLocalTrace: bestTrace,
    requiredMedium: ["traced-svg", "external-ai-reference"],
    productionRule: "No production promotion without provenance, trace-candidate audit, installed visual review, and strict diff no worse than accepted baseline.",
  };

  fs.writeFileSync(path.join(outputRoot, "packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
  fs.writeFileSync(path.join(outputRoot, "README.md"), markdownPacket(generatedAt, bestTrace));

  console.log(JSON.stringify({
    ok: true,
    outputRoot,
    target: packet.target,
    sourceBox,
    panelBox,
    currentAssetSize: packet.currentAssetSize,
    bestLocalTrace: bestTrace,
  }, null, 2));
}

await main();
