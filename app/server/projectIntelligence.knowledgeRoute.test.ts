import { describe, expect, it } from "vitest";
import { getCerebroDb } from "./cerebroDb";
import { appRouter } from "./routers";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

async function countRows(table: string) {
  const db = await getCerebroDb();
  const result = await db.execute(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(result.rows[0]?.count ?? 0);
}

describe("Project Intelligence knowledge routes", () => {
  it("returns bridge and source paths without writing durable knowledge", async () => {
    const caller = createCaller();
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const overview = await caller.projectIntelligence.overview();
    const cerebro = overview.projects.find((project) => project.slug === "cerebro");

    expect(cerebro?.knowledgeRoute.mode).toBe("read_only");
    expect(cerebro?.knowledgeRoute.projectBridgePath).toBe("10_Projects/CereBro/CereBro.md");
    expect(cerebro?.knowledgeRoute.repositorySourcePath).toBe(
      "20_Knowledge/Sources/GitHub/CereBro Repository Source.md",
    );
    expect(cerebro?.knowledgeRoute.archiveRetrieval).toBe("archive_only");
    expect(cerebro?.knowledgeRoute.writesExternalSystems).toBe(false);
    expect(cerebro?.knowledgeRoute.approvalGate).toContain("explicit write approval");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });
});
