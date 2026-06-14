import fs from "node:fs";
import path from "node:path";

type TraceSweepSummary = {
  results: Array<{
    target: string;
    bestPreset: {
      preset: string;
      engine?: string;
      mismatchRatio: number;
      mismatchedPixels: number;
      svgLength: number;
    };
  }>;
};

type ActiveRasterTarget = {
  name: string;
  active: boolean;
  textRisk: "none" | "low" | "high";
  groupedInsideLargerRaster: boolean;
  blockedBy: string[];
  nextPath: string;
};

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const traceSweepPath = path.join(
  repoRoot,
  "docs/design/external-ai/local-extraction/2026-06-12/browser-home-trace-sweep/trace-sweep-summary.json",
);
const outputDir = path.join(
  repoRoot,
  "docs/design/external-ai/local-extraction/2026-06-12/browser-home-active-raster-readiness",
);

const activeTargets: ActiveRasterTarget[] = [
  {
    name: "top-url-action-cluster",
    active: true,
    textRisk: "none",
    groupedInsideLargerRaster: false,
    blockedBy: ["source-crops-plus-css-dots regressed installed strict diff to 0.08348936603235982"],
    nextPath: "Best next small target, but only with a cleaner full-cluster vector extraction or no-cost external extraction. Do not split it again with approximate CSS dots.",
  },
  {
    name: "top-url-omnibox",
    active: true,
    textRisk: "high",
    groupedInsideLargerRaster: false,
    blockedBy: [
      "approximate DOM/CSS omnibox regressed installed strict diff to 0.0837552152233642",
      "ImageTracer posterized2 rejected at 0.03560126582278481",
      "trace sweep best was 0.020283931082981717 with 2109532 SVG characters",
    ],
    nextPath: "Requires label-preserving extraction or a measured reconstruction that matches frame, search icon, and placeholder text under installed visual review.",
  },
  {
    name: "bookmark-card-add",
    active: true,
    textRisk: "high",
    groupedInsideLargerRaster: false,
    blockedBy: [
      "measured CSS primitive regressed installed strict diff to 0.08388623181031851",
      "ImageTracer candidate rejected at 0.03522005444646098",
      "VTracer fine spline rendered Add as dd during installed visual review",
      "VTracer hybrid label kept text readable but worsened crop mismatch to 0.03130671506352087 and flattened the frame",
    ],
    nextPath: "Do not retry without a new source-to-vector strategy or external extraction that preserves the Add label and frame.",
  },
  {
    name: "center-field-title-star-map",
    active: true,
    textRisk: "high",
    groupedInsideLargerRaster: false,
    blockedBy: [
      "two-piece source partition failed seam preflight",
      "exact no-overlap partition failed seam preflight",
      "visible medallion rail lives inside this raster",
    ],
    nextPath: "Needs full center-field vector extraction or seam-safe renderer before replacing medallions, title, or star-map pieces.",
  },
  {
    name: "bottom-dock-row",
    active: true,
    textRisk: "low",
    groupedInsideLargerRaster: false,
    blockedBy: [
      "bottom-dock partition failed installed-scale seam preflight",
      "dock controls trace sweep was close at 0.00562888198757764 but 4696227 SVG characters and not a full active-raster replacement",
    ],
    nextPath: "Promising only if the Aang dock controls can be simplified and the full bottom row can be split without seam drift.",
  },
  {
    name: "lower-panel-assets",
    active: true,
    textRisk: "high",
    groupedInsideLargerRaster: false,
    blockedBy: [
      "trace sweep panel candidates were 5748530 to 6540214 SVG characters",
      "panels contain multiple text rows and icons, so pixel diff alone is weak evidence",
    ],
    nextPath: "Defer until text rendering and panel row primitives can be matched with installed visual review.",
  },
  {
    name: "rail-full",
    active: true,
    textRisk: "high",
    groupedInsideLargerRaster: false,
    blockedBy: [
      "guessed CSS rail backplate regressed strict diff to 0.08553475119568536",
      "approximate rail SVG rejected at 0.10677815598638449",
    ],
    nextPath: "Needs external extraction or a measured full rail reconstruction. Do not invent compass or ornament geometry.",
  },
];

function readTraceSweep() {
  if (!fs.existsSync(traceSweepPath)) return null;
  return JSON.parse(fs.readFileSync(traceSweepPath, "utf8")) as TraceSweepSummary;
}

function readinessForTarget(target: ActiveRasterTarget, traceSweep: TraceSweepSummary | null) {
  const sweep = traceSweep?.results.find((result) => result.target === target.name);
  const productionReady = target.blockedBy.length === 0 && target.textRisk !== "high" && (sweep?.bestPreset.mismatchRatio ?? Number.POSITIVE_INFINITY) <= 0.01;

  return {
    ...target,
    traceSweepBest: sweep?.bestPreset ?? null,
    productionReady,
    disposition: productionReady
      ? "ready-for-installed-production-attempt"
      : target.name === "top-url-action-cluster"
        ? "best-next-external-extraction-target"
        : "blocked-or-defer",
  };
}

function main() {
  const traceSweep = readTraceSweep();
  const targets = activeTargets.map((target) => readinessForTarget(target, traceSweep));
  const recommended = targets.find((target) => target.disposition === "best-next-external-extraction-target") ?? targets[0];

  fs.mkdirSync(outputDir, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    source: "mockups/approved/browser-home-symmetric-rails-target-v1.png",
    rule: "This readiness audit does not authorize production replacement. It ranks active raster targets for the next measured extraction attempt.",
    acceptedStrictDiff: 0.08346456192123741,
    recommendedNextTarget: recommended.name,
    targets,
  };

  fs.writeFileSync(path.join(outputDir, "readiness.json"), `${JSON.stringify(summary, null, 2)}\n`);

  const rows = targets.map((target) => {
    const best = target.traceSweepBest;
    const bestText = best ? `${best.preset} / ${best.mismatchRatio} / ${best.svgLength}` : "none";
    return `| ${target.name} | ${target.textRisk} | ${target.disposition} | ${bestText} | ${target.nextPath} |`;
  });
  const readme = [
    "# Browser Home Active Raster Readiness",
    "",
    "This file ranks active Browser Home raster targets for the next mockup-to-code conversion attempt.",
    "It does not authorize production replacement by itself.",
    "",
    `Accepted strict diff: \`${summary.acceptedStrictDiff}\``,
    `Recommended next target: \`${summary.recommendedNextTarget}\``,
    "",
    "| Target | Text risk | Disposition | Best trace sweep | Next path |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "Current conclusion: no active raster target is production-ready from local tracing alone. The next practical target is `top-url-action-cluster`, but it needs cleaner full-cluster extraction or no-cost external extraction before production.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outputDir, "README.md"), readme);

  console.log(JSON.stringify({
    ok: true,
    outputDir,
    recommendedNextTarget: summary.recommendedNextTarget,
    productionReadyTargets: targets.filter((target) => target.productionReady).map((target) => target.name),
  }, null, 2));
}

main();
