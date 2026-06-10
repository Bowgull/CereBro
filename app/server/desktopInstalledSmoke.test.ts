import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(__dirname, "..");

describe("installed desktop app QA script", () => {
  it("tests the installed app instead of the dev server", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const scriptSource = await readFile(resolve(appRoot, "scripts/desktopInstalledSmoke.ts"), "utf8");
    const safetySource = await readFile(resolve(appRoot, "scripts/desktopAppSafety.ts"), "utf8");

    expect(packageSource).toContain("\"test:desktop\": \"CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 tsx scripts/desktopInstalledSmoke.ts\"");
    expect(packageSource).toContain("\"desktop:stage-smoke\": \"tsx scripts/desktopAppSafety.ts stage-smoke\"");
    expect(scriptSource).toContain("/Applications/CereBro.app");
    expect(scriptSource).toContain("Contents/MacOS/CereBro");
    expect(scriptSource).toContain("--remote-debugging-port=");
    expect(scriptSource).toContain("/json/list");
    expect(scriptSource).toContain("CEREBRO_DESKTOP_QA_MODE");
    expect(scriptSource).toContain("launchProof");
    expect(scriptSource).toContain("waitForLocalAppHttp");
    expect(scriptSource).toContain("Runtime.evaluate");
    expect(scriptSource).toContain("CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1");
    expect(scriptSource).toContain("Browser address and search field");
    expect(scriptSource).toContain("Open page in CereBro");
    expect(scriptSource).toContain("Native page viewport");
    expect(scriptSource).toContain("screencapture");
    expect(scriptSource).toContain("cerebro-installed-browser-smoke.png");
    expect(scriptSource).toContain("Native Browser viewport is not using the Browser mockup canvas");
    expect(scriptSource).toContain("Browser chrome menu did not reserve native page space");
    expect(scriptSource).toContain("waitForNativePageTarget");
    expect(scriptSource).toContain("https://example.com");
    expect(scriptSource).toContain("New browser tab");
    expect(scriptSource).toContain("pressEnterInInputByLabel");
    expect(scriptSource).toContain("search.brave.com");
    expect(safetySource).toContain("/Applications/CereBro-QA.app");
    expect(safetySource).toContain("stage-smoke");
    expect(safetySource).toContain("validateAppBundle");
    expect(safetySource).toContain("/Applications/CereBro-install-rollback.app");
    expect(safetySource).toContain("prepareRollbackApp");
    expect(safetySource).toContain("restore-after-failed-install");
    expect(safetySource).toContain("await smokeApp(appPath, \"9333\", \"launch\")");
    expect(safetySource).toContain("mode === \"launch\" ? \"\\\"launchProof\\\"\" : \"\\\"menuLayerProof\\\"\"");
    expect(safetySource.indexOf("await prepareRollbackApp()")).toBeLessThan(safetySource.indexOf("await smokeApp(appPath, \"9333\", \"launch\")"));
    expect(safetySource.indexOf("await smokeApp(appPath, \"9333\", \"launch\")")).toBeLessThan(safetySource.indexOf("mode: \"install\""));
  });
});
