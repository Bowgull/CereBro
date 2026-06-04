import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(__dirname, "..");

describe("Browser native bridge surface", () => {
  it("uses the native Browser bridge when Electron provides it", async () => {
    const browserPanelSource = await readFile(resolve(appRoot, "client/src/components/BrowserPanel.tsx"), "utf8");

    expect(browserPanelSource).toContain("cerebroNativeBrowser");
    expect(browserPanelSource).toContain("openPage");
    expect(browserPanelSource).toContain("closePage");
    expect(browserPanelSource).toContain("reloadPage");
    expect(browserPanelSource).toContain("goBack");
    expect(browserPanelSource).toContain("goForward");
    expect(browserPanelSource).toContain("onPageEvent");
    expect(browserPanelSource).toContain("recordNativeBrowserPageEvent");
    expect(browserPanelSource).toContain("nativePageActive");
    expect(browserPanelSource).toContain("Native page viewport");
    expect(browserPanelSource).toContain("userInitiated: true");
    expect(browserPanelSource).toContain("Return");
  });
});
