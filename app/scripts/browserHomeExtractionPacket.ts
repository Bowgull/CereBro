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

type PacketTarget = {
  name: string;
  role: string;
  sourceBox: Box;
  currentMedium: "raster";
  requiredNextMedium: "measured-css" | "traced-svg" | "external-ai-reference";
  blockedApproaches: string[];
};

type RejectedCandidate = {
  name: string;
  status: "accepted" | "rejected";
  reason: string;
  sourceBox: Box;
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const lockedSourceRelativePath = "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png";
const lockedSourceSha256 = "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c";
const sourcePath = path.join(repoRoot, lockedSourceRelativePath);
const normalizedActualPath = path.join(appRoot, "output/qa/browser-home-diff/browser-home-actual-normalized.png");
const visualDiffPath = path.join(appRoot, "output/qa/browser-home-diff/browser-home-diff.png");
const candidatesDir = path.join(appRoot, "client/public/browser-home/slice-candidates");
const outputRoot = path.join(repoRoot, "docs/design/external-ai/local-extraction/2026-06-12/browser-home-active-raster-packet");

const packetTargets: PacketTarget[] = [
  {
    name: "rail-full",
    role: "Left navigation rail texture, frame, compass, labels, and negative space.",
    sourceBox: { left: 0, top: 60, width: 145, height: 932 },
    currentMedium: "raster",
    requiredNextMedium: "traced-svg",
    blockedApproaches: ["guessed-css-rail-backplate"],
  },
  {
    name: "center-field-title-star-map",
    role: "Center star-map, title copy, medallion rail, pinned label, edit control, and upper field geometry.",
    sourceBox: { left: 145, top: 126, width: 1440, height: 332 },
    currentMedium: "raster",
    requiredNextMedium: "traced-svg",
    blockedApproaches: ["center-field-two-piece-slice"],
  },
  {
    name: "bottom-dock-row",
    role: "Bottom Aang dock, input frame, attach/send controls, bottom frame, right edge, and lower texture.",
    sourceBox: { left: 145, top: 846, width: 1440, height: 146 },
    currentMedium: "raster",
    requiredNextMedium: "traced-svg",
    blockedApproaches: ["bottom-dock-edge-main-lower-partition"],
  },
];

function fail(message: string): never {
  throw new Error(message);
}

function sha256(filePath: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readJson<T>(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function ensureFile(filePath: string) {
  if (!fs.existsSync(filePath)) fail(`Missing required file: ${filePath}`);
}

async function cropImage(inputPath: string, box: Box, outputPath: string) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(inputPath).extract(box).png().toFile(outputPath);
}

function rejectedCandidates() {
  if (!fs.existsSync(candidatesDir)) return [];
  return fs.readdirSync(candidatesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJson<RejectedCandidate>(path.join(candidatesDir, file)))
    .filter((candidate) => candidate.status === "rejected")
    .map((candidate) => ({
      name: candidate.name,
      reason: candidate.reason,
      sourceBox: candidate.sourceBox,
    }));
}

function markdownPacket(generated: string, rejected: ReturnType<typeof rejectedCandidates>) {
  const targetRows = packetTargets
    .map((target) => `| ${target.name} | ${target.role} | ${target.sourceBox.left},${target.sourceBox.top},${target.sourceBox.width},${target.sourceBox.height} | ${target.requiredNextMedium} | ${target.blockedApproaches.join(", ")} |`)
    .join("\n");
  const rejectionRows = rejected.length > 0
    ? rejected.map((candidate) => `| ${candidate.name} | ${candidate.sourceBox.left},${candidate.sourceBox.top},${candidate.sourceBox.width},${candidate.sourceBox.height} | ${candidate.reason} |`).join("\n")
    : "| none | none | none |";

  return `# Browser Home Active Raster Extraction Packet

Generated: ${generated}

Source of truth:

\`${lockedSourceRelativePath}\`

SHA-256:

\`${lockedSourceSha256}\`

Use this packet for no-cost external extraction or local tracing only. Do not redesign the mockup. Do not use a full-screen screenshot as production UI. Production output must become React, CSS, SVG, or narrowly justified raster texture with provenance.

## Active Raster Targets

| Target | Role | Source box | Required next medium | Blocked approaches |
| --- | --- | --- | --- | --- |
${targetRows}

## Crops

- \`expected/\`: crops from the locked mockup.
- \`actual/\`: matching crops from the current installed Browser Home screenshot normalized to mockup size.
- \`diff/\`: matching crops from the current strict visual diff.

## Rejected Candidates

| Candidate | Source box | Reason |
| --- | --- | --- |
${rejectionRows}

## Acceptance Rule

Any replacement must pass:

\`\`\`bash
pnpm --dir app run qa:browser-home-provenance
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/browserHomeBrandLayout.test.ts server/cerebroTheme.test.ts server/cerebroUiPrimitives.test.ts server/desktopInstalledSmoke.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run desktop:backup
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff:strict
\`\`\`
`;
}

async function main() {
  ensureFile(sourcePath);
  ensureFile(normalizedActualPath);
  ensureFile(visualDiffPath);

  const sourceSha = sha256(sourcePath);
  if (sourceSha !== lockedSourceSha256) fail(`Locked Browser Home source changed: ${sourceSha}`);

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  for (const target of packetTargets) {
    await cropImage(sourcePath, target.sourceBox, path.join(outputRoot, "expected", `${target.name}.png`));
    await cropImage(normalizedActualPath, target.sourceBox, path.join(outputRoot, "actual", `${target.name}.png`));
    await cropImage(visualDiffPath, target.sourceBox, path.join(outputRoot, "diff", `${target.name}.png`));
  }

  const rejected = rejectedCandidates();
  const packet = {
    generated: "2026-06-12",
    source: lockedSourceRelativePath,
    sourceSha256: lockedSourceSha256,
    normalizedActualPath: path.relative(repoRoot, normalizedActualPath),
    visualDiffPath: path.relative(repoRoot, visualDiffPath),
    targets: packetTargets,
    rejectedCandidates: rejected,
  };

  fs.writeFileSync(path.join(outputRoot, "packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
  fs.writeFileSync(path.join(outputRoot, "README.md"), markdownPacket(packet.generated, rejected));

  console.log(JSON.stringify({
    ok: true,
    outputRoot,
    source: lockedSourceRelativePath,
    sourceSha256: lockedSourceSha256,
    targetCount: packetTargets.length,
    rejectedCandidateCount: rejected.length,
  }, null, 2));
}

await main();
