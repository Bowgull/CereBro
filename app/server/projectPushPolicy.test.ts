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

describe("Project Lab push policy", () => {
  it("saves an assisted push policy without running git or writing externally", async () => {
    const caller = createCaller();
    const db = await getCerebroDb();
    await db.execute({
      sql: `
        DELETE FROM project_push_policies
        WHERE project_id IN (
          SELECT id FROM projects WHERE path = ?
        )
      `,
      args: ["/Users/lindsaybell/Desktop/CereBro"],
    });

    const before = {
      policies: await countRows("project_push_policies"),
      approvals: await countRows("approvals"),
      proposals: await countRows("execution_action_proposals"),
    };

    const saved = await caller.projectIntelligence.savePushPolicy({
      slug: "cerebro",
      mode: "assisted",
    });
    const second = await caller.projectIntelligence.savePushPolicy({
      slug: "cerebro",
      mode: "manual",
    });
    const overview = await caller.projectIntelligence.overview();
    const cerebro = overview.projects.find((project) => project.slug === "cerebro");

    expect(saved.ok).toBe(true);
    expect(saved.mode).toBe("saved_project_push_policy");
    expect(saved.policy.mode).toBe("assisted");
    expect(saved.policy.executesGit).toBe(false);
    expect(saved.policy.writesExternal).toBe(false);
    expect(saved.noActionTaken).toContain("No git command ran.");
    expect(saved.noActionTaken).toContain("No external write ran.");

    expect(second.policy.id).toBe(saved.policy.id);
    expect(second.policy.mode).toBe("manual");
    expect(cerebro?.pushReadiness.policy.mode).toBe("manual");
    expect(cerebro?.pushReadiness.policy.executesGit).toBe(false);
    expect(cerebro?.pushReadiness.policy.writesExternal).toBe(false);

    expect(await countRows("project_push_policies")).toBe(before.policies + 1);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("execution_action_proposals")).toBe(before.proposals);
  });
});
