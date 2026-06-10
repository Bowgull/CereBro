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

describe("Piccolo storage contract receipt", () => {
  it("returns the storage contract as a read-only receipt without writing rows", async () => {
    const caller = createCaller();
    const before = {
      artifacts: await countRows("artifacts"),
      cleanupCandidates: await countRows("cleanup_candidates"),
      approvals: await countRows("approvals"),
    };

    const receipt = await caller.piccolo.storageContractReceipt();

    expect(receipt.mode).toBe("read_only");
    expect(receipt.ownerAgent).toBe("piccolo");
    expect(receipt.supportAgents).toContain("oak");
    expect(receipt.supportAgents).toContain("spock");
    expect(receipt.writesExternalSystems).toBe(false);
    expect(receipt.counts.artifactKinds).toBeGreaterThan(20);
    expect(receipt.counts.obsidianLanes).toBe(6);
    expect(receipt.obsidianContract.archiveRoute?.retrievalDefault).toBe("archive_only");
    expect(receipt.obsidianContract.retrievalMetadataFields).toContain("canonical_status");
    expect(receipt.githubProjectPaths.bridgeExample).toBe("10_Projects/Sundesk/Sundesk.md");
    expect(receipt.githubProjectPaths.sourceExample).toBe(
      "20_Knowledge/Sources/GitHub/Sundesk Repository Source.md",
    );
    expect(receipt.rules.join(" ")).toContain("Real vault");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("cleanup_candidates")).toBe(before.cleanupCandidates);
    expect(await countRows("approvals")).toBe(before.approvals);
  });
});
