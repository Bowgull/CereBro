import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(import.meta.dirname, "..");

describe("browserHomeActionClusterExtractionPacket", () => {
  it("locks the action-cluster packet to the approved Browser Home mockup", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const scriptSource = await readFile(resolve(appRoot, "scripts/browserHomeActionClusterExtractionPacket.ts"), "utf8");

    expect(packageSource).toContain("\"qa:browser-home-action-cluster-packet\": \"tsx scripts/browserHomeActionClusterExtractionPacket.ts\"");
    expect(scriptSource).toContain("mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png");
    expect(scriptSource).toContain("f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c");
    expect(scriptSource).toContain("top-url-action-cluster.png");
    expect(scriptSource).toContain("sourceBox: Box = { left: 1309, top: 69, width: 240, height: 52 }");
    expect(scriptSource).toContain("panelBox: Box = { left: 1164, top: 69, width: 240, height: 52 }");
    expect(scriptSource).toContain("source-crops-plus-css-dots");
    expect(scriptSource).toContain("0.08348936603235982");
    expect(scriptSource).toContain("No full-screen screenshot UI.");
    expect(scriptSource).toContain("No invented icon, frame, glow, dot, border, gradient, or ornament.");
  });
});
