export type BrowserHomeMeasuredBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type BrowserHomeLayerAsset = BrowserHomeMeasuredBox & {
  name: string;
};

export type BrowserHomePanelBox = BrowserHomeMeasuredBox & {
  title: string;
};

export type BrowserHomePanelHitBox = BrowserHomeMeasuredBox & {
  panel: "continue" | "recent" | "downloads";
  target: "view-all" | "row-1" | "row-2" | "row-3";
};

export type BrowserHomeDockHitBoxName = "input" | "attach" | "send";

export type BrowserHomeSideToggleHitBoxName = "leftRail" | "rightWatchShelf";

export type BrowserHomeTopChromeHitBoxName =
  | "activeTab"
  | "tabClose"
  | "newTab"
  | "protectedBadge"
  | "back"
  | "forward"
  | "reload"
  | "omnibox"
  | "shield"
  | "library"
  | "stats"
  | "pageActions";

export type BrowserHomeProvenanceMedium = "raster" | "measured-css" | "traced-svg" | "external-ai-reference";

export type BrowserHomeVisualProvenance = {
  name: string;
  source: string;
  sourceSha256: string;
  box: BrowserHomeMeasuredBox;
  role: string;
  medium: BrowserHomeProvenanceMedium;
  productionAllowed: boolean;
};

export type BrowserHomePercentBox = {
  position: "absolute";
  left: string;
  top: string;
  width: string;
  height: string;
};

export const browserHomeMockupSource = {
  path: "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png",
  sha256: "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c",
  width: 1440,
  height: 992,
} as const;

export const browserHomeFullMockupSource = {
  path: "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png",
  sha256: "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c",
  width: 1585,
  height: 992,
} as const;

export const browserHomeAllowedProvenanceMedia: BrowserHomeProvenanceMedium[] = [
  "raster",
  "measured-css",
  "traced-svg",
  "external-ai-reference",
];

const lockedSource = browserHomeFullMockupSource.path;
const lockedSourceSha256 = browserHomeFullMockupSource.sha256;

function rasterProvenance(name: string, box: BrowserHomeMeasuredBox, role: string): BrowserHomeVisualProvenance {
  return {
    name,
    source: lockedSource,
    sourceSha256: lockedSourceSha256,
    box,
    role,
    medium: "raster",
    productionAllowed: true,
  };
}

function measuredCssProvenance(name: string, box: BrowserHomeMeasuredBox, role: string): BrowserHomeVisualProvenance {
  return {
    name,
    source: lockedSource,
    sourceSha256: lockedSourceSha256,
    box,
    role,
    medium: "measured-css",
    productionAllowed: true,
  };
}

export const browserHomeTopChromeHitBoxes: Record<BrowserHomeTopChromeHitBoxName, BrowserHomeMeasuredBox> = {
  activeTab: { left: 205, top: 14, width: 203, height: 47 },
  tabClose: { left: 367, top: 22, width: 28, height: 28 },
  newTab: { left: 419, top: 16, width: 48, height: 42 },
  protectedBadge: { left: 1290, top: 18, width: 104, height: 38 },
  back: { left: 50, top: 76, width: 42, height: 42 },
  forward: { left: 99, top: 76, width: 42, height: 42 },
  reload: { left: 148, top: 76, width: 42, height: 42 },
  omnibox: { left: 194, top: 70, width: 948, height: 44 },
  shield: { left: 1164, top: 70, width: 50, height: 50 },
  library: { left: 1228, top: 72, width: 48, height: 48 },
  stats: { left: 1292, top: 72, width: 48, height: 48 },
  pageActions: { left: 1356, top: 72, width: 48, height: 48 },
};

export const browserHomeBaseBackplateBox: BrowserHomeMeasuredBox = {
  left: 0,
  top: 0,
  width: 1440,
  height: 992,
};

export const browserHomeLowerBackplateBox: BrowserHomeMeasuredBox = {
  left: 0,
  top: 458,
  width: 1440,
  height: 388,
};

export const browserHomeSideToggleHitBoxes: Record<BrowserHomeSideToggleHitBoxName, BrowserHomeMeasuredBox> = {
  leftRail: { left: 0, top: 345, width: 45, height: 208 },
  rightWatchShelf: { left: 1395, top: 345, width: 45, height: 208 },
};

export const browserHomeVisualProvenance: BrowserHomeVisualProvenance[] = [
  measuredCssProvenance("browser-home-base-backplate", browserHomeBaseBackplateBox, "Measured base Browser Home backplate behind source-derived slices."),
  measuredCssProvenance("browser-home-lower-backplate", browserHomeLowerBackplateBox, "Measured lower Browser Home backplate behind pinned and panel slices."),
  measuredCssProvenance("browser-home-left-rail-toggle-hitbox", browserHomeSideToggleHitBoxes.leftRail, "Measured left sidebar arrow hitbox that collapses and opens the Browser nav rail."),
  measuredCssProvenance("browser-home-right-watch-shelf-toggle-hitbox", browserHomeSideToggleHitBoxes.rightWatchShelf, "Measured right sidebar arrow hitbox that opens and closes Watch Shelf."),
  rasterProvenance("rail-full.png", { left: 0, top: 60, width: 145, height: 932 }, "Full left rail texture and frame."),
  rasterProvenance("rail-keep.png", { left: 16, top: 70, width: 118, height: 185 }, "Keep rail button asset."),
  rasterProvenance("rail-browser-active.png", { left: 16, top: 262, width: 118, height: 83 }, "Active Browser rail button asset."),
  rasterProvenance("rail-workshop.png", { left: 17, top: 367, width: 116, height: 80 }, "Workshop rail button asset."),
  rasterProvenance("rail-ledger.png", { left: 17, top: 467, width: 116, height: 80 }, "Ledger rail button asset."),
  rasterProvenance("rail-basement.png", { left: 17, top: 565, width: 116, height: 91 }, "Basement rail button asset."),
  rasterProvenance("top-title-tabs.png", { left: 0, top: 0, width: 1585, height: 61 }, "Top title and tab strip frame."),
  rasterProvenance("top-title-tabs-panel.png", { left: 145, top: 0, width: 1440, height: 61 }, "Top title and tab strip frame in Browser panel coordinates."),
  rasterProvenance("top-url-row.png", { left: 145, top: 61, width: 1440, height: 65 }, "URL/search row with action controls."),
  rasterProvenance("center-field-title-star-map.png", { left: 145, top: 126, width: 1440, height: 332 }, "Center star-map, title, medallion rail, pinned label, and edit control."),
  rasterProvenance("pinned-bookmark-row.png", { left: 145, top: 421, width: 1440, height: 183 }, "Pinned bookmark row background, cards, edit control, and row spacing."),
  rasterProvenance("lower-panels-row.png", { left: 145, top: 604, width: 1440, height: 242 }, "Lower Browser Home panels row, panel frames, list content, and surrounding background."),
  rasterProvenance("bottom-dock-row.png", { left: 145, top: 846, width: 1440, height: 146 }, "Full-width bottom dock row, Aang dock, bottom frame, and right edge."),
  measuredCssProvenance("top-chrome-hitbox-active-tab", browserHomeTopChromeHitBoxes.activeTab, "Measured active tab click target."),
  measuredCssProvenance("top-chrome-hitbox-tab-close", browserHomeTopChromeHitBoxes.tabClose, "Measured active tab close target."),
  measuredCssProvenance("top-chrome-hitbox-new-tab", browserHomeTopChromeHitBoxes.newTab, "Measured new tab click target."),
  measuredCssProvenance("top-chrome-hitbox-protected-badge", browserHomeTopChromeHitBoxes.protectedBadge, "Measured protection status target."),
  measuredCssProvenance("top-chrome-hitbox-back", browserHomeTopChromeHitBoxes.back, "Measured back navigation target."),
  measuredCssProvenance("top-chrome-hitbox-forward", browserHomeTopChromeHitBoxes.forward, "Measured forward navigation target."),
  measuredCssProvenance("top-chrome-hitbox-reload", browserHomeTopChromeHitBoxes.reload, "Measured reload target."),
  measuredCssProvenance("top-chrome-hitbox-omnibox", browserHomeTopChromeHitBoxes.omnibox, "Measured address and search input target."),
  measuredCssProvenance("top-chrome-hitbox-shield", browserHomeTopChromeHitBoxes.shield, "Measured shield menu target."),
  measuredCssProvenance("top-chrome-hitbox-library", browserHomeTopChromeHitBoxes.library, "Measured library action target."),
  measuredCssProvenance("top-chrome-hitbox-stats", browserHomeTopChromeHitBoxes.stats, "Measured browser stats action target."),
  measuredCssProvenance("top-chrome-hitbox-page-actions", browserHomeTopChromeHitBoxes.pageActions, "Measured page actions menu target."),
  rasterProvenance("medallion-github.png", { left: 654, top: 145, width: 48, height: 48 }, "Pinned GitHub medallion."),
  rasterProvenance("medallion-obsidian.png", { left: 715, top: 145, width: 48, height: 48 }, "Pinned Obsidian medallion."),
  rasterProvenance("medallion-youtube.png", { left: 779, top: 145, width: 48, height: 48 }, "Pinned YouTube medallion."),
  rasterProvenance("medallion-x.png", { left: 844, top: 145, width: 48, height: 48 }, "Pinned X medallion."),
  rasterProvenance("medallion-reddit.png", { left: 908, top: 145, width: 48, height: 48 }, "Pinned Reddit medallion."),
  rasterProvenance("medallion-hn.png", { left: 971, top: 145, width: 48, height: 48 }, "Pinned Hacker News medallion."),
  rasterProvenance("medallion-add.png", { left: 1035, top: 145, width: 48, height: 48 }, "Add medallion."),
  rasterProvenance("bookmark-card-frame.png", { left: 230, top: 458, width: 180, height: 116 }, "Bookmark card frame."),
  rasterProvenance("bookmark-card-github.png", { left: 230, top: 458, width: 180, height: 116 }, "GitHub bookmark card asset."),
  rasterProvenance("bookmark-card-obsidian.png", { left: 425, top: 458, width: 170, height: 116 }, "Obsidian bookmark card asset."),
  rasterProvenance("bookmark-card-youtube.png", { left: 609, top: 458, width: 152, height: 116 }, "YouTube bookmark card asset."),
  rasterProvenance("bookmark-card-x.png", { left: 775, top: 458, width: 147, height: 116 }, "X bookmark card asset."),
  rasterProvenance("bookmark-card-reddit.png", { left: 969, top: 458, width: 116, height: 116 }, "Reddit bookmark card asset."),
  rasterProvenance("bookmark-card-hn.png", { left: 1100, top: 458, width: 147, height: 116 }, "Hacker News bookmark card asset."),
  rasterProvenance("bookmark-card-add.png", { left: 1260, top: 458, width: 152, height: 116 }, "Add bookmark card asset."),
  rasterProvenance("panel-continue.png", { left: 230, top: 604, width: 384, height: 224 }, "Continue browsing panel frame."),
  rasterProvenance("panel-recent.png", { left: 636, top: 604, width: 392, height: 224 }, "Recent panel frame."),
  rasterProvenance("panel-downloads.png", { left: 1051, top: 604, width: 368, height: 224 }, "Downloads panel frame."),
  rasterProvenance("aang-dock.png", { left: 158, top: 846, width: 1397, height: 119 }, "Bottom Aang dock frame."),
  rasterProvenance("aang-avatar-medallion.png", { left: 162, top: 849, width: 108, height: 108 }, "Aang avatar medallion from dock."),
];

export const browserHomeLayerAssets: BrowserHomeLayerAsset[] = [
  { name: "top-title-tabs-panel.png", left: 0, top: 0, width: 1440, height: 61 },
  { name: "top-url-row.png", left: 0, top: 61, width: 1440, height: 65 },
  { name: "center-field-title-star-map.png", left: 0, top: 126, width: 1440, height: 332 },
  { name: "pinned-bookmark-row.png", left: 0, top: 421, width: 1440, height: 183 },
  { name: "lower-panels-row.png", left: 0, top: 604, width: 1440, height: 242 },
  { name: "bottom-dock-row.png", left: 0, top: 846, width: 1440, height: 146 },
];

export const browserHomeMedallionBoxes: BrowserHomeMeasuredBox[] = [
  { left: 509, top: 145, width: 48, height: 48 },
  { left: 570, top: 145, width: 48, height: 48 },
  { left: 634, top: 145, width: 48, height: 48 },
  { left: 699, top: 145, width: 48, height: 48 },
  { left: 763, top: 145, width: 48, height: 48 },
  { left: 826, top: 145, width: 48, height: 48 },
];

export const browserHomeAddMedallionBox: BrowserHomeMeasuredBox = {
  left: 890,
  top: 145,
  width: 48,
  height: 48,
};

export const browserHomeCardBoxes: BrowserHomeMeasuredBox[] = [
  { left: 85, top: 458, width: 180, height: 116 },
  { left: 280, top: 458, width: 170, height: 116 },
  { left: 464, top: 458, width: 152, height: 116 },
  { left: 630, top: 458, width: 147, height: 116 },
  { left: 824, top: 458, width: 116, height: 116 },
  { left: 955, top: 458, width: 147, height: 116 },
];

export const browserHomeAddCardBox: BrowserHomeMeasuredBox = {
  left: 1115,
  top: 458,
  width: 152,
  height: 116,
};

export const browserHomeEditPinnedBox: BrowserHomeMeasuredBox = {
  left: 1126,
  top: 421,
  width: 112,
  height: 31,
};

export const browserHomePanelBoxes: BrowserHomePanelBox[] = [
  { title: "Continue browsing", left: 85, top: 604, width: 384, height: 224 },
  { title: "Recent", left: 491, top: 604, width: 392, height: 224 },
  { title: "Downloads", left: 906, top: 604, width: 368, height: 224 },
];

export const browserHomePanelHitBoxes: BrowserHomePanelHitBox[] = [
  { panel: "continue", target: "view-all", left: 399, top: 617, width: 59, height: 29 },
  { panel: "continue", target: "row-1", left: 105, top: 657, width: 333, height: 43 },
  { panel: "continue", target: "row-2", left: 105, top: 706, width: 333, height: 43 },
  { panel: "continue", target: "row-3", left: 105, top: 755, width: 333, height: 43 },
  { panel: "recent", target: "view-all", left: 802, top: 617, width: 69, height: 29 },
  { panel: "recent", target: "row-1", left: 511, top: 657, width: 342, height: 43 },
  { panel: "recent", target: "row-2", left: 511, top: 706, width: 342, height: 43 },
  { panel: "recent", target: "row-3", left: 511, top: 755, width: 342, height: 43 },
  { panel: "downloads", target: "view-all", left: 1194, top: 617, width: 69, height: 29 },
  { panel: "downloads", target: "row-1", left: 923, top: 657, width: 324, height: 43 },
  { panel: "downloads", target: "row-2", left: 923, top: 706, width: 324, height: 43 },
  { panel: "downloads", target: "row-3", left: 923, top: 755, width: 324, height: 43 },
];

export const browserHomeDockBox: BrowserHomeMeasuredBox = {
  left: 13,
  top: 846,
  width: 1397,
  height: 119,
};

export const browserHomeDockHitBoxes: Record<BrowserHomeDockHitBoxName, BrowserHomeMeasuredBox> = {
  input: { left: 144, top: 878, width: 1104, height: 70 },
  attach: { left: 1260, top: 886, width: 58, height: 54 },
  send: { left: 1331, top: 886, width: 68, height: 54 },
};

export const browserHomeMedallionAssetByDomain: Record<string, string> = {
  "github.com": "/browser-home/assets/medallion-github.png",
  "obsidian.md": "/browser-home/assets/medallion-obsidian.png",
  "youtube.com": "/browser-home/assets/medallion-youtube.png",
  "x.com": "/browser-home/assets/medallion-x.png",
  "reddit.com": "/browser-home/assets/medallion-reddit.png",
  "news.ycombinator.com": "/browser-home/assets/medallion-hn.png",
};

function percent(value: number, source: number) {
  return `${(value / source) * 100}%`;
}

export function browserHomeToPercentBox(box: BrowserHomeMeasuredBox): BrowserHomePercentBox {
  return {
    position: "absolute",
    left: percent(box.left, browserHomeMockupSource.width),
    top: percent(box.top, browserHomeMockupSource.height),
    width: percent(box.width, browserHomeMockupSource.width),
    height: percent(box.height, browserHomeMockupSource.height),
  };
}
