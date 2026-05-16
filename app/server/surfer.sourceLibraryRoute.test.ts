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

describe("Surfer Source Library route", () => {
  it("shows source and GitHub knowledge routes without durable writes", async () => {
    const caller = createCaller();
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const panel = await caller.surfer.panel();

    expect(panel.sourceLibraryRoute.mode).toBe("read_only");
    expect(panel.sourceLibraryRoute.sourceNoteLane).toBe("20_Knowledge");
    expect(panel.sourceLibraryRoute.githubRepositorySourcePath).toBe(
      "20_Knowledge/Sources/GitHub/<Project> Repository Source.md",
    );
    expect(panel.sourceLibraryRoute.githubProjectMapPath).toBe("00_Atlas/GitHub Project Map.md");
    expect(panel.sourceLibraryRoute.githubSourcesIndexPath).toBe("20_Knowledge/Sources/GitHub/GitHub Sources.md");
    expect(panel.sourceLibraryRoute.archiveRetrieval).toBe("archive_only");
    expect(panel.sourceLibraryRoute.retrievalMetadataFields).toContain("canonical_status");
    expect(panel.sourceLibraryRoute.writesExternalSystems).toBe(false);
    expect(panel.sourceLibraryRoute.approvalGate).toContain("explicit approval");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });
});
