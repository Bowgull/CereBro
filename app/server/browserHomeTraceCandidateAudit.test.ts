import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("browserHomeTraceCandidateAudit", () => {
  it("rejects SVG candidates that embed raster image data", async () => {
    const candidatesDir = await mkdtemp(path.join(tmpdir(), "cerebro-trace-candidate-"));
    try {
      await writeFile(
        path.join(candidatesDir, "embedded-raster.json"),
        JSON.stringify(
          {
            name: "embedded-raster",
            status: "accepted",
            reason: "This should be rejected because it hides a raster inside SVG.",
            sourceBox: { left: 0, top: 0, width: 10, height: 10 },
            maxMismatchRatio: 1,
            manualInstalledVisualReview: {
              status: "passed",
              reviewer: "test",
              notes: "Synthetic candidate review passed so the raster shortcut assertion is reached.",
            },
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><image href="data:image/png;base64,AAAA" width="10" height="10"/></svg>',
          },
          null,
          2,
        ),
      );

      await expect(
        execFileAsync("pnpm", ["exec", "tsx", "scripts/browserHomeTraceCandidateAudit.ts"], {
          cwd: process.cwd(),
          env: {
            ...process.env,
            CEREBRO_BROWSER_HOME_TRACE_CANDIDATES_DIR: candidatesDir,
          },
        }),
      ).rejects.toMatchObject({
        stderr: expect.stringContaining("embeds raster image content instead of traced vector geometry"),
      });
    } finally {
      await rm(candidatesDir, { recursive: true, force: true });
    }
  });

  it("rejects accepted trace candidates without installed visual review proof", async () => {
    const candidatesDir = await mkdtemp(path.join(tmpdir(), "cerebro-trace-candidate-"));
    try {
      await writeFile(
        path.join(candidatesDir, "missing-review.json"),
        JSON.stringify(
          {
            name: "missing-review",
            status: "accepted",
            reason: "This should be rejected because accepted trace candidates need installed visual review proof.",
            sourceBox: { left: 0, top: 0, width: 10, height: 10 },
            maxMismatchRatio: 1,
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>',
          },
          null,
          2,
        ),
      );

      await expect(
        execFileAsync("pnpm", ["exec", "tsx", "scripts/browserHomeTraceCandidateAudit.ts"], {
          cwd: process.cwd(),
          env: {
            ...process.env,
            CEREBRO_BROWSER_HOME_TRACE_CANDIDATES_DIR: candidatesDir,
          },
        }),
      ).rejects.toMatchObject({
        stderr: expect.stringContaining("is accepted but has no manualInstalledVisualReview"),
      });
    } finally {
      await rm(candidatesDir, { recursive: true, force: true });
    }
  });
});
