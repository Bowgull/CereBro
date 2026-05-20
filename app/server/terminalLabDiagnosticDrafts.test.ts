import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

describe("Terminal Lab diagnostic drafts", () => {
  it("keeps port-conflict diagnostics inside the read-only runner allowlist", async () => {
    const caller = createCaller();
    const preview = await caller.terminalLab.previewCommand({
      command: "pnpm dev",
      cwd: "/Users/lindsaybell/Desktop/CereBro/app",
    });
    await caller.terminalLab.observeOutput({
      observationId: preview.observationId,
      output: "Error: Port 3002 is already in use",
      exitCode: 1,
    });

    const rows = await caller.terminalLab.observations({ limit: 20 });
    const row = rows.find((item) => item.id === preview.observationId);
    const commands = row?.diagnosticDrafts.map((item) => item.command) ?? [];

    expect(commands).toContain("rg -n \"3002\" .");
    expect(commands.some((command) => command.startsWith("lsof "))).toBe(false);
  });

  it("does not suggest shell-chained diagnostic commands", async () => {
    const caller = createCaller();
    const preview = await caller.terminalLab.previewCommand({
      command: "pnpm test",
      cwd: "/Users/lindsaybell/Desktop/CereBro/app",
    });
    await caller.terminalLab.observeOutput({
      observationId: preview.observationId,
      output: "ELIFECYCLE Command failed with exit code 1",
      exitCode: 1,
    });

    const rows = await caller.terminalLab.observations({ limit: 20 });
    const row = rows.find((item) => item.id === preview.observationId);
    const commands = row?.diagnosticDrafts.map((item) => item.command) ?? [];

    expect(commands).toContain("which node");
    expect(commands).toContain("which pnpm");
    expect(commands.some((command) => /&&|;|\|\|/.test(command))).toBe(false);
    expect(commands.some((command) => command.startsWith("node ") || command.startsWith("pnpm "))).toBe(false);
  });
});
