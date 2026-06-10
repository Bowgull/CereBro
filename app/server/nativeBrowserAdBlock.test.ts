import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(__dirname, "..");

describe("native browser ad blocking", () => {
  it("uses Ghostery as the first Electron blocking engine", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const adBlockSource = await readFile(resolve(appRoot, "electron/browserAdBlock.ts"), "utf8");
    const mainSource = await readFile(resolve(appRoot, "electron/main.ts"), "utf8");

    expect(packageSource).toContain("@ghostery/adblocker-electron");
    expect(adBlockSource).toContain("ElectronBlocker.fromPrebuiltAdsAndTracking");
    expect(adBlockSource).toContain("enableBlockingInSession");
    expect(adBlockSource).toContain("disableBlockingInSession");
    expect(adBlockSource).toContain("ghostery-engine.bin");
    expect(mainSource).toContain("installNativeBrowserAdBlocker");
  });
});
