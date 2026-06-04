import { describe, expect, it } from "vitest";
import {
  nativeBrowserClosePageChannel,
  nativeBrowserOpenPageChannel,
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
    expect(nativeBrowserPageEventTypes).toEqual([
      "navigation-started",
      "navigation-finished",
      "navigation-failed",
      "title-updated",
    ]);
    expect(nativeBrowserBlockedReasons).toEqual([
      "permission",
      "invalid_url",
      "navigation_failed",
    ]);
  });
});
