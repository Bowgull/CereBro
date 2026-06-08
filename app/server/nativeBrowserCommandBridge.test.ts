import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { nativeBrowserContentBounds, normalizeNativeBrowserOpenRequest } from "../electron/browserRequest";

const appRoot = resolve(__dirname, "..");

describe("native browser command bridge", () => {
  it("normalizes only user-initiated http and https open requests", () => {
    expect(normalizeNativeBrowserOpenRequest({
      tabId: "tab_1",
      targetUrl: "https://example.com/path",
      userInitiated: true,
    })).toEqual({
      ok: true,
      tabId: "tab_1",
      targetUrl: "https://example.com/path",
    });

    expect(normalizeNativeBrowserOpenRequest({
      tabId: "tab_1",
      targetUrl: "file:///Users/lindsaybell/secret.txt",
      userInitiated: true,
    })).toEqual({ ok: false, tabId: "tab_1", blockedReason: "invalid_url" });

    expect(normalizeNativeBrowserOpenRequest({
      tabId: "tab_1",
      targetUrl: "https://example.com/path",
      userInitiated: false,
    })).toEqual({ ok: false, tabId: "tab_1", blockedReason: "permission" });
  });

  it("exposes one preload command and one main-process handler", async () => {
    const preloadSource = await readFile(resolve(appRoot, "electron/preload.ts"), "utf8");
    const bridgeSource = await readFile(resolve(appRoot, "electron/browserBridge.ts"), "utf8");
    const mainSource = await readFile(resolve(appRoot, "electron/main.ts"), "utf8");
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");

    expect(preloadSource).toContain("contextBridge.exposeInMainWorld");
    expect(preloadSource).toContain("cerebroNativeBrowser");
    expect(preloadSource).toContain("nativeBrowserOpenPageChannel");
    expect(preloadSource).toContain("nativeBrowserClosePageChannel");
    expect(preloadSource).toContain("nativeBrowserReloadPageChannel");
    expect(preloadSource).toContain("nativeBrowserGoBackPageChannel");
    expect(preloadSource).toContain("nativeBrowserForwardPageChannel");
    expect(preloadSource).toContain("nativeBrowserPageEventChannel");
    expect(preloadSource).toContain("cerebroNativeVpn");
    expect(preloadSource).toContain("nativeVpnStatusChannel");
    expect(preloadSource).toContain("onPageEvent");
    expect(preloadSource).toContain("reloadPage");
    expect(preloadSource).toContain("goBack");
    expect(preloadSource).toContain("goForward");
    expect(bridgeSource).toContain("ipcMain.handle");
    expect(bridgeSource).toContain("nativeBrowserOpenPageChannel");
    expect(bridgeSource).toContain("nativeBrowserClosePageChannel");
    expect(bridgeSource).toContain("nativeBrowserReloadPageChannel");
    expect(bridgeSource).toContain("nativeBrowserGoBackPageChannel");
    expect(bridgeSource).toContain("nativeBrowserForwardPageChannel");
    expect(bridgeSource).toContain("canGoBack");
    expect(bridgeSource).toContain("canGoForward");
    expect(mainSource).toContain("installNativeBrowserCommandBridge");
    expect(mainSource).toContain("installNativeVpnBridge");
    expect(mainSource).toContain("installApplicationMenu");
    expect(mainSource).toContain("New Tab");
    expect(mainSource).toContain("Settings");
    expect(mainSource).toContain("togglefullscreen");
    expect(mainSource).toContain("webContents.send");
    expect(packageSource).toContain("electron/preload.ts");
  });

  it("keeps native page content below the CereBro command chrome", () => {
    expect(nativeBrowserContentBounds({ width: 1320, height: 860 })).toEqual({
      x: 0,
      y: 168,
      width: 1320,
      height: 692,
    });
    expect(nativeBrowserContentBounds({ width: 320, height: 220 })).toEqual({
      x: 0,
      y: 168,
      width: 320,
      height: 52,
    });
  });
});
