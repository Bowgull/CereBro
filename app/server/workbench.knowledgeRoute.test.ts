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

async function getOrCreateProjectId() {
  const db = await getCerebroDb();
  const existing = await db.execute({
    sql: `SELECT id FROM projects WHERE name = ? LIMIT 1`,
    args: ["CereBro"],
  });
  if (existing.rows[0]?.id != null) return Number(existing.rows[0].id);

  const created = await db.execute({
    sql: `INSERT INTO projects (name, path) VALUES (?, ?) RETURNING id`,
    args: ["CereBro", "/Users/lindsaybell/Desktop/CereBro"],
  });
  return Number(created.rows[0]?.id);
}

async function createWorkbenchEvidence(projectId: number) {
  const db = await getCerebroDb();
  const created = await db.execute({
    sql: `
      INSERT INTO workbench_evidence_records (
        kind, title, summary, project_id, owner_agent, validation_status,
        permission_class, sensitive_data_flag
      )
      VALUES ('manual_note', 'Knowledge route test receipt', 'Local receipt for route context.', ?, 'cortana', 'needs_review', 'manual_note', 0)
      RETURNING id
    `,
    args: [projectId],
  });
  return Number(created.rows[0]?.id);
}

describe("Workbench knowledge route context", () => {
  it("shows project knowledge route context without durable knowledge writes", async () => {
    const caller = createCaller();
    const projectId = await getOrCreateProjectId();
    const evidenceId = await createWorkbenchEvidence(projectId);
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const detail = await caller.workbench.evidenceDetail({ id: evidenceId });

    expect(detail.found).toBe(true);
    if (!detail.found) throw new Error("Expected Workbench evidence detail.");
    expect(detail.knowledgeRoute?.projectBridgePath).toBe("10_Projects/CereBro/CereBro.md");
    expect(detail.knowledgeRoute?.repositorySourcePath).toBe(
      "20_Knowledge/Sources/GitHub/CereBro Repository Source.md",
    );
    expect(detail.knowledgeRoute?.archiveRetrieval).toBe("archive_only");
    expect(detail.knowledgeRoute?.writesExternalSystems).toBe(false);
    expect(detail.knowledgeRoute?.approvalGate).toContain("explicit write approval");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });
});
