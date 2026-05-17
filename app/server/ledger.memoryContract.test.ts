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

describe("Ledger memory contract read", () => {
  it("includes memory reuse contract context without writing durable rows", async () => {
    const caller = createCaller();
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const overview = await caller.ledger.overview({ evidenceLimit: 5, routeLimit: 3 });

    expect(overview.memoryContract.mode).toBe("read_only");
    expect(overview.memoryContract.normalRoute).toBe("20_Knowledge");
    expect(overview.memoryContract.archiveRoute).toBe("90_Archive");
    expect(overview.memoryContract.canAutomateRetrieval).toBe(false);
    expect(overview.memoryContract.writesExternalSystems).toBe(false);
    expect(overview.memoryContract.nextAction).toContain("Validate");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });

  it("includes route receipt contract context without running or writing work", async () => {
    const caller = createCaller();
    const before = {
      routeRecords: await countRows("runtime_route_records"),
      tasks: await countRows("tasks"),
      approvals: await countRows("approvals"),
      evidence: await countRows("workbench_evidence_records"),
      preflights: await countRows("permission_preflight_records"),
      memoryEntries: await countRows("memory_entries"),
    };

    const overview = await caller.ledger.overview({ evidenceLimit: 5, routeLimit: 3 });

    expect(overview.routeReceiptContract.mode).toBe("read_only");
    expect(overview.routeReceiptContract.ownerAgent).toBe("cortana");
    expect(overview.routeReceiptContract.bodySurface).toBe("workbench");
    expect(overview.routeReceiptContract.auditSurface).toBe("ledger");
    expect(overview.routeReceiptContract.executorStatus).toBe("not_built");
    expect(overview.routeReceiptContract.canExecute).toBe(false);
    expect(overview.routeReceiptContract.totalRoutes).toBeGreaterThanOrEqual(0);
    expect(overview.routeReceiptContract.noActionTaken.join(" ")).toContain("No command ran");
    expect(overview.routeReceiptContract.noActionTaken.join(" ")).toContain("No route was saved");
    expect(overview.routeReceiptContract.nextAction).toContain("route receipts");

    expect(await countRows("runtime_route_records")).toBe(before.routeRecords);
    expect(await countRows("tasks")).toBe(before.tasks);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("workbench_evidence_records")).toBe(before.evidence);
    expect(await countRows("permission_preflight_records")).toBe(before.preflights);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });
});
