import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { agentStatus, browserStatus, cerebroStatus, handoffStatus, modelStatus } from "./cerebroStatus";
import { CEREBRO_MCP_TOOLS, handleMcpRequest } from "../mcp/server";

const appRoot = resolve(__dirname, "..");

describe("CereBro CLI and MCP status layer", () => {
  it("returns the daily Browser feature map from shared status code", () => {
    const status = browserStatus();
    const featureIds = status.features.map((feature) => feature.id);

    expect(status.lane).toBe("daily_browser");
    expect(featureIds).toContain("native_page_view");
    expect(featureIds).toContain("ad_blocking");
    expect(featureIds).toContain("popup_blocking");
    expect(featureIds).toContain("playwright");
    expect(featureIds).toContain("installed_desktop_qa");
    expect(status.features.find((feature) => feature.id === "ad_blocking")?.status).toBe("present");
    expect(status.testCommands.join("\n")).toContain("test:desktop");
    expect(status.testCommands.join("\n")).toContain("test:e2e");
  });

  it("returns agents, model classes, and handoff metadata without running providers", async () => {
    const status = await cerebroStatus();

    expect(status.app).toBe("CereBro");
    expect(status.scripts.cli).toBe("tsx cli/cerebro.ts");
    expect(status.scripts.mcp).toBe("tsx mcp/server.ts");
    expect(status.scripts.desktop).toBe("CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 tsx scripts/desktopInstalledSmoke.ts");
    expect(agentStatus().map((agent) => agent.id)).toContain("cortana");
    expect(modelStatus().map((model) => model.modelClass)).toContain("local_reasoner");
    expect(Array.isArray(handoffStatus())).toBe(true);
  });

  it("adds repo-native CLI and MCP package scripts", async () => {
    const packageSource = await readFile(resolve(appRoot, "package.json"), "utf8");
    const cliSource = await readFile(resolve(appRoot, "cli/cerebro.ts"), "utf8");
    const mcpSource = await readFile(resolve(appRoot, "mcp/server.ts"), "utf8");

    expect(packageSource).toContain("\"cerebro\": \"tsx cli/cerebro.ts\"");
    expect(packageSource).toContain("\"mcp\": \"tsx mcp/server.ts\"");
    expect(packageSource).toContain("\"test:desktop\": \"CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 tsx scripts/desktopInstalledSmoke.ts\"");
    expect(cliSource).toContain("All commands in this slice are read-only.");
    expect(cliSource).toContain("arg === \"--\"");
    expect(mcpSource).toContain("tools/list");
    expect(mcpSource).toContain("tools/call");
  });

  it("exposes read-only local MCP tools", async () => {
    expect(CEREBRO_MCP_TOOLS.map((tool) => tool.name)).toEqual([
      "cerebro_status",
      "cerebro_browser_status",
      "cerebro_browser_qa",
      "cerebro_agents_list",
      "cerebro_models_list",
      "cerebro_approvals_pending",
      "cerebro_handoff_current",
    ]);

    const writes: unknown[] = [];
    const originalWrite = process.stdout.write;
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push(chunk.toString());
      return true;
    }) as typeof process.stdout.write;
    try {
      await handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    } finally {
      process.stdout.write = originalWrite;
    }

    expect(writes.join("")).toContain("cerebro_browser_status");
  });
});
