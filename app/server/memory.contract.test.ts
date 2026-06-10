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

describe("memory contract", () => {
  it("returns a read-only memory contract without durable writes", async () => {
    const caller = createCaller();
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const contract = await caller.memory.contract();

    expect(contract.mode).toBe("read_only");
    expect(contract.ownerAgent).toBe("oak");
    expect(contract.supportAgents).toContain("aang");
    expect(contract.supportAgents).toContain("spock");
    expect(contract.normalRoute).toBe("20_Knowledge");
    expect(contract.archiveRoute).toBe("90_Archive");
    expect(contract.canAutomateRetrieval).toBe(false);
    expect(contract.writesExternalSystems).toBe(false);
    expect(contract.requiredMetadataFields).toContain("canonical_status");
    expect(contract.nextAction).toContain("Validate");
    expect(contract.gates.join(" ")).toContain("No vector indexing");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });
});
