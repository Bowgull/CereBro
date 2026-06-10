import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  nativeBrowserDefaultSessionPartition,
  nativeBrowserSessionWebPreferences,
} from "../electron/browserSession";

const appRoot = resolve(__dirname, "..");

describe("native browser session policy", () => {
  it("defaults normal browsing to an in-memory Electron partition", () => {
    expect(nativeBrowserDefaultSessionPartition).toBe("cerebro-native-browser-normal");
    expect(nativeBrowserDefaultSessionPartition.startsWith("persist:")).toBe(false);
  });

  it("builds native page web preferences from the session policy", () => {
    expect(nativeBrowserSessionWebPreferences()).toEqual({
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: "cerebro-native-browser-normal",
    });
  });

  it("keeps the page view wired to the session policy module", async () => {
    const viewsSource = await readFile(resolve(appRoot, "electron/browserViews.ts"), "utf8");

    expect(viewsSource).toContain("nativeBrowserSessionWebPreferences");
    expect(viewsSource).not.toContain("partition: \"cerebro-native-browser\"");
  });
});
