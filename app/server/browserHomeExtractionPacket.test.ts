import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(import.meta.dirname, "..");

describe("browserHomeExtractionPacket", () => {
  it("packages only locked Browser Home extraction targets", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const scriptSource = await readFile(resolve(appRoot, "scripts/browserHomeExtractionPacket.ts"), "utf8");

    expect(packageSource).toContain("\"qa:browser-home-extraction-packet\": \"tsx scripts/browserHomeExtractionPacket.ts\"");
    expect(scriptSource).toContain("mockups/approved/browser-home-symmetric-rails-target-v1.png");
    expect(scriptSource).toContain("f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c");
    expect(scriptSource).toContain("rail-full");
    expect(scriptSource).toContain("center-field-title-star-map");
    expect(scriptSource).toContain("bottom-dock-row");
    expect(scriptSource).toContain("guessed-css-rail-backplate");
    expect(scriptSource).toContain("center-field-two-piece-slice");
    expect(scriptSource).toContain("bottom-dock-edge-main-lower-partition");
    expect(scriptSource).toContain("Do not redesign the mockup.");
    expect(scriptSource).toContain("Do not use a full-screen screenshot as production UI.");
  });
});
