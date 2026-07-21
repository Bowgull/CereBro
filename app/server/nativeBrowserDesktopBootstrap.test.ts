import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(__dirname, "..");

describe("native browser desktop bootstrap", () => {
  it("declares explicit desktop scripts", async () => {
    const packageJson = JSON.parse(await readFile(resolve(appRoot, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
      main?: string;
      productName?: string;
    };

    expect(packageJson.main).toBe("dist-electron/main.cjs");
    expect(packageJson.productName).toBe("CereBro");
    expect(packageJson.devDependencies?.electron).toMatch(/^\^?\d+\./);
    expect(packageJson.devDependencies?.["@electron/packager"]).toMatch(/^\^?\d+\./);
    expect(packageJson.scripts?.["desktop:build"]).toContain("rm -rf dist-electron");
    expect(packageJson.scripts?.["desktop:build"]).toContain(
      "esbuild electron/main.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist-electron/main.cjs",
    );
    expect(packageJson.scripts?.["desktop:build"]).toContain(
      "esbuild electron/preload.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist-electron/preload.cjs",
    );
    expect(packageJson.scripts?.["desktop:dev"]).toBe(
      "pnpm run desktop:build && ELECTRON_START_URL=http://localhost:3000 electron dist-electron/main.cjs",
    );
    expect(packageJson.scripts?.["desktop:package"]).toContain("electron-packager . CereBro");
    expect(packageJson.scripts?.["desktop:package"]).toContain("--icon=electron/assets/cerebro-app-icon.icns");
    expect(packageJson.scripts?.["desktop:package"]).toContain("--asar=false");
    expect(packageJson.scripts?.["desktop:package"]).toContain("--no-prune");
    expect(packageJson.scripts?.["desktop:package"]).toContain("--no-deref-symlinks");
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
    expect(serverSource).not.toContain("import { serveStatic, setupVite } from \"./vite\"");
    expect(serverSource).toContain("await import(\"./vite\")");
    expect(staticSource).toContain("CEREBRO_STATIC_DIR");
  });

  it("guards packaged desktop logging against broken stdout pipes", async () => {
    const mainSource = await readFile(resolve(appRoot, "electron/main.ts"), "utf8");

    expect(mainSource).toContain("installBrokenPipeGuard");
    expect(mainSource).toContain("process.stdout.on(\"error\", ignoreBrokenPipe)");
    expect(mainSource).toContain("process.stderr.on(\"error\", ignoreBrokenPipe)");
    expect(mainSource).toContain("error.code !== \"EPIPE\"");
    expect(mainSource.indexOf("installBrokenPipeGuard();")).toBeLessThan(mainSource.indexOf("app.setName(appName);"));
  });
});
