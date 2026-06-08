import { describe, expect, it } from "vitest";
import { classifyNativeBrowserDownload, nativeBrowserRiskyDownloadExtensions } from "../electron/browserDownloadPolicy";

describe("native browser download policy", () => {
  it("allows normal user-clicked downloads to macOS Downloads", () => {
    const decision = classifyNativeBrowserDownload({
      filename: "guide.pdf",
      url: "https://example.com/guide.pdf",
      hasUserGesture: true,
      recentDownloadCount: 0,
      downloadsPath: "/Users/lindsaybell/Downloads",
    });

    expect(decision).toEqual({
      action: "allow",
      reason: "user_download",
      savePath: "/Users/lindsaybell/Downloads/guide.pdf",
    });
  });

  it("blocks automatic downloads", () => {
    const decision = classifyNativeBrowserDownload({
      filename: "background.pdf",
      url: "https://example.com/background.pdf",
      hasUserGesture: false,
      recentDownloadCount: 0,
      downloadsPath: "/Users/lindsaybell/Downloads",
    });

    expect(decision).toEqual({
      action: "block",
      reason: "automatic_download",
      savePath: null,
    });
  });

  it("blocks risky file extensions before saving", () => {
    expect(nativeBrowserRiskyDownloadExtensions).toContain(".dmg");
    const decision = classifyNativeBrowserDownload({
      filename: "installer.dmg",
      url: "https://example.com/installer.dmg",
      hasUserGesture: true,
      recentDownloadCount: 0,
      downloadsPath: "/Users/lindsaybell/Downloads",
    });

    expect(decision).toEqual({
      action: "block",
      reason: "risky_file",
      savePath: null,
    });
  });

  it("blocks multiple downloads from the same short burst", () => {
    const decision = classifyNativeBrowserDownload({
      filename: "second.pdf",
      url: "https://example.com/second.pdf",
      hasUserGesture: true,
      recentDownloadCount: 1,
      downloadsPath: "/Users/lindsaybell/Downloads",
    });

    expect(decision).toEqual({
      action: "block",
      reason: "multiple_download",
      savePath: null,
    });
  });
});
