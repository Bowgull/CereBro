import fs from "fs";
import os from "os";
import path from "path";
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

describe("integrations status", () => {
  it("reports vault and Obsidian readiness without writing rows", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), "cerebro-vault-"));
    fs.mkdirSync(path.join(vaultDir, "07_Knowledge", "obsidian-vault"), { recursive: true });

    try {
      process.env.CEREBRO_VAULT_DIR = vaultDir;
      delete process.env.CEREBRO_OBSIDIAN_DIR;
      const caller = createCaller();
      const before = {
        artifacts: await countRows("artifacts"),
        approvals: await countRows("approvals"),
        memoryEntries: await countRows("memory_entries"),
      };

      const status = await caller.integrations.status();

      expect(status.vault).toMatchObject({
        configured: true,
        vaultDir,
        exists: true,
      });
      expect(status.obsidian).toMatchObject({
        configured: true,
        obsidianDir: path.join(vaultDir, "07_Knowledge", "obsidian-vault"),
        exists: true,
        source: "vault-default",
      });
      expect(status.vaultLayout.map((entry) => entry.relativePath)).toContain("07_Knowledge/obsidian-vault");
      expect(status.obsidianKnowledgeRoutes.map((route) => route.relativePath)).toContain("20_Knowledge");
      expect(status.obsidianRetrievalMetadataFields).toContain("canonical_status");
      expect(status.obsidianRetrievalContract.fields).toEqual(status.obsidianRetrievalMetadataFields);
      expect(status.obsidianRetrievalContract.ragReadyNoteMetadataContract.defaultsByRouteKey.archive).toMatchObject({
        canonical_status: "archived",
        retrieval_status: "archive_only",
      });
      expect(status.obsidianRetrievalContract.ragReadyNoteMetadataContract.defaultsByRouteKey.knowledge).toMatchObject({
        canonical_status: "draft",
        retrieval_status: "needs_validation",
      });
      expect(status.obsidianRetrievalContract.ragReadyNoteMetadataContract.rules.join(" ")).toContain(
        "Normal retrieval requires",
      );
      expect(status.knowledgeReadiness).toMatchObject({
        mode: "read_only",
        vaultRoutes: status.vaultLayout.length,
        obsidianRoutes: status.obsidianKnowledgeRoutes.length,
        requiredMetadataFields: status.obsidianRetrievalMetadataFields.length,
        archiveOnlyRoutes: 1,
        canAutomateRetrieval: false,
      });
      expect(status.knowledgeReadiness.includedRouteKeys).toContain("knowledge");
      expect(status.knowledgeReadiness.nextAction).toContain("Validate notes");

      expect(await countRows("artifacts")).toBe(before.artifacts);
      expect(await countRows("approvals")).toBe(before.approvals);
      expect(await countRows("memory_entries")).toBe(before.memoryEntries);
    } finally {
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
      fs.rmSync(vaultDir, { recursive: true, force: true });
    }
  });
});
