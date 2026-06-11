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

export const browserHomeLayerAssets: BrowserHomeLayerAsset[] = [
  { name: "top-title-tabs-panel.png", left: 0, top: 0, width: 1440, height: 61 },
  { name: "top-url-row.png", left: 0, top: 61, width: 1440, height: 65 },
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

export const browserHomeDockBox: BrowserHomeMeasuredBox = {
  left: 13,
  top: 846,
  width: 1397,
  height: 119,
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
