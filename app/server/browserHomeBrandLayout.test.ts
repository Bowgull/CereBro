import { describe, expect, it } from "vitest";
import {
  browserHomeAddCardBox,
  browserHomeAddMedallionBox,
  browserHomeCardBoxes,
  browserHomeDockBox,
  browserHomeEditPinnedBox,
  browserHomeLayerAssets,
  browserHomeMedallionBoxes,
  browserHomeMockupSource,
  browserHomePanelBoxes,
  browserHomeToPercentBox,
} from "@/lib/browserHomeBrandLayout";

describe("browserHomeBrandLayout", () => {
  it("locks the approved Browser Home mockup source", () => {
    expect(browserHomeMockupSource).toEqual({
      path: "mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png",
      sha256: "f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c",
      width: 1440,
      height: 992,
    });
  });

  it("keeps the top chrome asset slices measured against the mockup", () => {
    expect(browserHomeLayerAssets).toEqual([
      { name: "top-title-tabs-panel.png", left: 0, top: 0, width: 1440, height: 61 },
      { name: "top-url-row.png", left: 0, top: 61, width: 1440, height: 65 },
    ]);
  });

  it("locks the pinned medallion rail and add medallion coordinates", () => {
    expect(browserHomeMedallionBoxes).toHaveLength(6);
    expect(browserHomeMedallionBoxes[0]).toEqual({ left: 509, top: 145, width: 48, height: 48 });
    expect(browserHomeMedallionBoxes[5]).toEqual({ left: 826, top: 145, width: 48, height: 48 });
    expect(browserHomeAddMedallionBox).toEqual({ left: 890, top: 145, width: 48, height: 48 });
  });

  it("locks the pinned card row and edit action coordinates", () => {
    expect(browserHomeCardBoxes).toEqual([
      { left: 85, top: 458, width: 180, height: 116 },
      { left: 280, top: 458, width: 170, height: 116 },
      { left: 464, top: 458, width: 152, height: 116 },
      { left: 630, top: 458, width: 147, height: 116 },
      { left: 824, top: 458, width: 116, height: 116 },
      { left: 955, top: 458, width: 147, height: 116 },
    ]);
    expect(browserHomeAddCardBox).toEqual({ left: 1115, top: 458, width: 152, height: 116 });
    expect(browserHomeEditPinnedBox).toEqual({ left: 1126, top: 421, width: 112, height: 31 });
  });

  it("locks the lower panels and Aang dock coordinates", () => {
    expect(browserHomePanelBoxes).toEqual([
      { title: "Continue browsing", left: 85, top: 604, width: 384, height: 224 },
      { title: "Recent", left: 491, top: 604, width: 392, height: 224 },
      { title: "Downloads", left: 906, top: 604, width: 368, height: 224 },
    ]);
    expect(browserHomeDockBox).toEqual({ left: 13, top: 846, width: 1397, height: 119 });
  });

  it("converts measured mockup boxes into percent-positioned browser boxes", () => {
    expect(browserHomeToPercentBox({ left: 720, top: 496, width: 144, height: 99.2 })).toEqual({
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "10%",
      height: "10%",
    });
  });
});
