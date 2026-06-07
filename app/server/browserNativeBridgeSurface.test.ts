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
    expect(browserPanelSource).toContain("cerebroNativeVpn");
    expect(browserPanelSource).toContain("VPN Shield");
    expect(browserPanelSource).toContain("recordNativeBrowserPageEvent");
    expect(browserPanelSource).toContain("nativePageActive");
    expect(browserPanelSource).toContain("Native page viewport");
    expect(browserPanelSource).toContain("userInitiated: true");
    expect(browserPanelSource).toContain("Return");
  });

  it("keeps native Browser fallback copy out of the main machinery language", async () => {
    const browserPanelSource = await readFile(resolve(appRoot, "client/src/components/BrowserPanel.tsx"), "utf8");

    expect(browserPanelSource).not.toContain("Open Outside");
    expect(browserPanelSource).not.toContain("outside CereBro");
    expect(browserPanelSource).not.toContain("desktop Browser for the best page view");
    expect(browserPanelSource).toContain("Fallback");
    expect(browserPanelSource).toContain("System Browser");
  });

  it("keeps VPN machinery out of the Browser surface", async () => {
    const browserPanelSource = await readFile(resolve(appRoot, "client/src/components/BrowserPanel.tsx"), "utf8");

    expect(browserPanelSource).not.toContain("ProtonVPN");
    expect(browserPanelSource).not.toContain("WireGuard");
    expect(browserPanelSource).not.toContain("PrivateKey");
    expect(browserPanelSource).not.toContain("utun");
    expect(browserPanelSource).not.toContain("scutil");
    expect(browserPanelSource).toContain("VPN On");
    expect(browserPanelSource).toContain("VPN Off");
    expect(browserPanelSource).toContain("Needs Setup");
  });
});
