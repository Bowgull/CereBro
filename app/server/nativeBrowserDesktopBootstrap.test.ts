import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(__dirname, "..");

describe("native browser desktop bootstrap", () => {
  it("declares explicit desktop scripts", async () => {
    const packageJson = JSON.parse(await readFile(resolve(appRoot, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(packageJson.devDependencies?.electron).toMatch(/^\^?\d+\./);
    expect(packageJson.scripts?.["desktop:build"]).toContain(
      "esbuild electron/main.ts --platform=node --packages=external --bundle --format=esm --outfile=dist-electron/main.mjs",
    );
    expect(packageJson.scripts?.["desktop:build"]).toContain(
      "esbuild electron/preload.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist-electron/preload.cjs",
    );
    expect(packageJson.scripts?.["desktop:dev"]).toBe(
      "pnpm run desktop:build && ELECTRON_START_URL=http://localhost:3000 electron dist-electron/main.mjs",
    );
  });

  it("uses the dev URL for desktop dev and starts CereBro locally for normal desktop launch", async () => {
    const mainSource = await readFile(resolve(appRoot, "electron/main.ts"), "utf8");
    const serverSource = await readFile(resolve(appRoot, "server/_core/index.ts"), "utf8");
    const staticSource = await readFile(resolve(appRoot, "server/_core/vite.ts"), "utf8");

    expect(mainSource).toContain("ELECTRON_START_URL");
    expect(mainSource).toContain("CEREBRO_SERVER_AUTOSTART");
    expect(mainSource).toContain("CEREBRO_STATIC_DIR");
    expect(mainSource).toContain("startServer");
    expect(mainSource).toContain("embeddedServer");
    expect(mainSource).toContain("BrowserWindow");
    expect(mainSource).not.toContain("WebContentsView");
    expect(serverSource).toContain("export async function startServer");
    expect(serverSource).toContain("CEREBRO_SERVER_AUTOSTART");
    expect(staticSource).toContain("CEREBRO_STATIC_DIR");
  });
});
