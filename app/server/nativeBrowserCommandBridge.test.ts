import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeNativeBrowserOpenRequest } from "../electron/browserRequest";

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
    expect(bridgeSource).toContain("ipcMain.handle");
    expect(bridgeSource).toContain("nativeBrowserOpenPageChannel");
    expect(mainSource).toContain("installNativeBrowserCommandBridge");
    expect(packageSource).toContain("electron/preload.ts");
  });
});
