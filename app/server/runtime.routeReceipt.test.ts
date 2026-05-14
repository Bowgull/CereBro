import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getCerebroDb } from "./cerebroDb";

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

describe("runtime route receipt preview", () => {
  it("returns a local-only Aang to Cortana receipt without mutating task or evidence history", async () => {
    const caller = createCaller();
    const taskCountBefore = await countRows("tasks");
    const evidenceCountBefore = await countRows("workbench_evidence_records");

    const preview = await caller.runtime.previewRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    expect(preview.mode).toBe("proposal_only");
    expect(preview.writesExternal).toBe(false);
    expect(preview.runsCommand).toBe(false);
    expect(preview.opensBrowser).toBe(false);
    expect(preview.callsModel).toBe(false);
    expect(preview.aangRead).toContain("project build");
    expect(preview.cortanaRoute[0]).toBe("Aang reads mode");
    expect(preview.cortanaRoute[1]).toBe("Cortana routes");
    expect(preview.ownerAgent).toBe("tony");
    expect(preview.supportAgents).toContain("spock");
    expect(preview.project?.slug).toBe("cerebro");
    expect(preview.receipt.kind).toBe("route_preview");
    expect(preview.receipt.bodyTarget).toBe("workbench");
    expect(preview.receipt.auditTarget).toBe("ledger");
    expect(preview.gates.join(" ")).toContain("No model call");

    expect(await countRows("tasks")).toBe(taskCountBefore);
    expect(await countRows("workbench_evidence_records")).toBe(evidenceCountBefore);
  });

  it("keeps public research behind approval gates", async () => {
    const caller = createCaller();

    const preview = await caller.runtime.previewRoute({
      text: "research current Reddit feedback for app builders",
      mode: "explore",
    });

    expect(preview.category).toBe("research");
    expect(preview.ownerAgent).toBe("surfer");
    expect(preview.toolProposal.actionClass).toBe("browser_or_media_capture");
    expect(preview.toolProposal.externalTarget).toBe(true);
    expect(preview.toolProposal.approvalRequired).toBe(true);
    expect(preview.approvalGates).toContain("external target approval");
    expect(preview.approvalGates).toContain("public-browser approval");
    expect(preview.nextAction).toContain("Ask approval before browser/source capture");
  });
});
