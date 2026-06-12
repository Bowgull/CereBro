import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = resolve(import.meta.dirname, "..");

describe("browserHomeTraceCandidateAudit", () => {
  it("keeps trace candidates tied to the locked Browser Home source", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const scriptSource = await readFile(resolve(appRoot, "scripts/browserHomeTraceCandidateAudit.ts"), "utf8");
    const rejectedRail = await readFile(resolve(appRoot, "client/public/browser-home/trace-candidates/rejected-rail-approximate-svg.json"), "utf8");

    expect(packageSource).toContain("\"qa:browser-home-trace-candidates\": \"tsx scripts/browserHomeTraceCandidateAudit.ts\"");
    expect(scriptSource).toContain("mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png");
    expect(scriptSource).toContain("f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c");
    expect(scriptSource).toContain("status: \"accepted\" | \"rejected\"");
    expect(scriptSource).toContain("No Browser Home trace candidates found");
    expect(rejectedRail).toContain("\"name\": \"rejected-rail-approximate-svg\"");
    expect(rejectedRail).toContain("\"left\": 0");
    expect(rejectedRail).toContain("\"top\": 60");
    expect(rejectedRail).toContain("\"width\": 145");
    expect(rejectedRail).toContain("\"height\": 932");
    expect(rejectedRail).toContain("does not preserve the mockup texture");
  });
});
