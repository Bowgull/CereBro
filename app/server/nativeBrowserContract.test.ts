import { describe, expect, it } from "vitest";
import {
  nativeBrowserClosePageChannel,
  nativeBrowserForwardPageChannel,
  nativeBrowserGoBackPageChannel,
  nativeBrowserOpenPageChannel,
  nativeBrowserReloadPageChannel,
  nativeBrowserBlockedReasons,
  nativeBrowserPageEventTypes,
  type NativeBrowserOpenRequest,
  type NativeBrowserPageEvent,
} from "../shared/nativeBrowser";

describe("native browser contract", () => {
  it("keeps open requests user initiated", () => {
    const request: NativeBrowserOpenRequest = {
      tabId: "tab_1",
      targetUrl: "https://example.com",
      userInitiated: true,
    };

    expect(request.userInitiated).toBe(true);
  });

  it("keeps page events narrow", () => {
    const event: NativeBrowserPageEvent = {
      type: "navigation-finished",
      tabId: "tab_1",
      url: "https://example.com",
      title: "Example",
      at: "2026-06-03T23:00:00.000Z",
    };

    expect(Object.keys(event).sort()).toEqual(["at", "tabId", "title", "type", "url"]);
  });

  it("exports the narrow runtime vocabularies used by Electron", () => {
    expect(nativeBrowserOpenPageChannel).toBe("cerebro:native-browser:open-page");
    expect(nativeBrowserClosePageChannel).toBe("cerebro:native-browser:close-page");
    expect(nativeBrowserReloadPageChannel).toBe("cerebro:native-browser:reload-page");
    expect(nativeBrowserGoBackPageChannel).toBe("cerebro:native-browser:go-back-page");
    expect(nativeBrowserForwardPageChannel).toBe("cerebro:native-browser:forward-page");
    expect(nativeBrowserPageEventTypes).toEqual([
      "navigation-started",
      "navigation-finished",
      "navigation-failed",
      "title-updated",
      "popup-blocked",
      "download-started",
      "download-finished",
      "download-blocked",
    ]);
    expect(nativeBrowserBlockedReasons).toEqual([
      "permission",
      "invalid_url",
      "navigation_failed",
    ]);
  });

  it("keeps native browser safety events narrow", () => {
    const popupEvent: NativeBrowserPageEvent = {
      type: "popup-blocked",
      tabId: "tab_1",
      url: "https://ads.example.com",
      at: "2026-06-08T15:00:00.000Z",
    };
    const downloadEvent: NativeBrowserPageEvent = {
      type: "download-started",
      tabId: "tab_1",
      filename: "cerebro.pdf",
      url: "https://example.com/cerebro.pdf",
      savePath: "/Users/lindsaybell/Downloads/cerebro.pdf",
      at: "2026-06-08T15:00:01.000Z",
    };

    expect(Object.keys(popupEvent).sort()).toEqual(["at", "tabId", "type", "url"]);
    expect(Object.keys(downloadEvent).sort()).toEqual(["at", "filename", "savePath", "tabId", "type", "url"]);
  });
});
