import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(__dirname, "..");

describe("installed desktop app QA script", () => {
  it("tests the installed app instead of the dev server", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const scriptSource = await readFile(resolve(appRoot, "scripts/desktopInstalledSmoke.ts"), "utf8");

    expect(packageSource).toContain("\"test:desktop\": \"CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 tsx scripts/desktopInstalledSmoke.ts\"");
    expect(scriptSource).toContain("/Applications/CereBro.app");
    expect(scriptSource).toContain("Contents/MacOS/CereBro");
    expect(scriptSource).toContain("--remote-debugging-port=");
    expect(scriptSource).toContain("/json/list");
    expect(scriptSource).toContain("Runtime.evaluate");
    expect(scriptSource).toContain("CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1");
    expect(scriptSource).toContain("Browser address and search field");
    expect(scriptSource).toContain("Open page in CereBro");
    expect(scriptSource).toContain("Native page viewport");
    expect(scriptSource).toContain("New browser tab");
    expect(scriptSource).toContain("pressEnterInInputByLabel");
    expect(scriptSource).toContain("search.brave.com");
  });
});
