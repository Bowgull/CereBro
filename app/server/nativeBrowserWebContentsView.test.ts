import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  mapNativeNavigationFailed,
  mapNativeNavigationFinished,
  mapNativeNavigationStarted,
  mapNativeTitleUpdated,
} from "../electron/browserEvents";

const appRoot = resolve(__dirname, "..");

describe("native browser web contents view", () => {
  it("maps page events into the shared native browser contract", () => {
    expect(mapNativeNavigationStarted("native_tab_1", "https://example.com", "2026-06-04T01:20:00.000Z")).toEqual({
      type: "navigation-started",
      tabId: "native_tab_1",
      url: "https://example.com",
      at: "2026-06-04T01:20:00.000Z",
    });
    expect(mapNativeNavigationFinished("native_tab_1", "https://example.com", "Example", "2026-06-04T01:20:01.000Z")).toEqual({
      type: "navigation-finished",
      tabId: "native_tab_1",
      url: "https://example.com",
      title: "Example",
      at: "2026-06-04T01:20:01.000Z",
    });
    expect(mapNativeNavigationFailed("native_tab_1", "https://example.com", -3, "ABORTED", "2026-06-04T01:20:02.000Z")).toEqual({
      type: "navigation-failed",
      tabId: "native_tab_1",
      url: "https://example.com",
      errorCode: -3,
      errorDescription: "ABORTED",
      at: "2026-06-04T01:20:02.000Z",
    });
    expect(mapNativeTitleUpdated("native_tab_1", "Example", "2026-06-04T01:20:03.000Z")).toEqual({
      type: "title-updated",
      tabId: "native_tab_1",
      title: "Example",
      at: "2026-06-04T01:20:03.000Z",
    });
  });

  it("defines one native page view without replacing the command surface", async () => {
    const browserViewsSource = await readFile(resolve(appRoot, "electron/browserViews.ts"), "utf8");
    const mainSource = await readFile(resolve(appRoot, "electron/main.ts"), "utf8");

    expect(browserViewsSource).toContain("WebContentsView");
    expect(browserViewsSource).toContain("contentView.addChildView");
    expect(browserViewsSource).toContain("loadURL");
    expect(mainSource).toContain("createNativeBrowserPageView");
    expect(mainSource).toContain("layoutNativeBrowserPageView");
  });

  it("blocks risky native browser capabilities by default", async () => {
    const permissionsSource = await readFile(resolve(appRoot, "electron/browserPermissions.ts"), "utf8");
    const viewsSource = await readFile(resolve(appRoot, "electron/browserViews.ts"), "utf8");

    expect(permissionsSource).toContain("setPermissionRequestHandler");
    expect(permissionsSource).toContain("callback(false)");
    expect(permissionsSource).toContain("will-download");
    expect(permissionsSource).toContain("event.preventDefault()");
    expect(viewsSource).toContain("setWindowOpenHandler");
    expect(viewsSource).toContain("action: \"deny\"");
  });
});
