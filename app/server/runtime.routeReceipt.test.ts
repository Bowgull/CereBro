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

const previewMutationTables = [
  "tasks",
  "sessions",
  "memory_entries",
  "memory_proposals",
  "outputs",
  "validations",
  "approvals",
  "tool_calls",
  "command_observations",
  "capture_observations",
  "reminder_proposals",
  "message_draft_proposals",
  "sources",
  "source_events",
  "workbench_evidence_records",
  "permission_preflight_records",
  "runtime_route_records",
] as const;

async function countPreviewMutationRows() {
  const counts = new Map<string, number>();
  for (const table of previewMutationTables) {
    counts.set(table, await countRows(table));
  }
  return counts;
}

describe("runtime route receipt preview", () => {
  it("returns a local-only Aang to Cortana receipt draft without mutating history", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

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
    expect(preview.workbenchReceiptDraft.kind).toBe("route_preview");
    expect(preview.workbenchReceiptDraft.stage).toBe("staged");
    expect(preview.workbenchReceiptDraft.saveTarget).toBe("workbench");
    expect(preview.workbenchReceiptDraft.autosave).toBe(false);
    expect(preview.workbenchReceiptDraft.summary).toBe(preview.receipt.summary);
    expect(preview.workbenchReceiptDraft.routeChain).toEqual(preview.cortanaRoute);
    expect(preview.workbenchReceiptDraft.gates).toContain("No external action from route preview.");
    expect(preview.ledgerFocusDraft.kind).toBe("route_preview_audit_focus");
    expect(preview.ledgerFocusDraft.focusTarget).toBe("ledger");
    expect(preview.ledgerFocusDraft.autosave).toBe(false);
    expect(preview.ledgerFocusDraft.projectSlug).toBe("cerebro");
    expect(preview.ledgerFocusDraft.auditFilters).toEqual({
      ownerAgent: "tony",
      category: "project_build",
      projectSlug: "cerebro",
      modelLaneId: "frontier_or_codex_escalation",
      bodyTarget: "workbench",
    });
    expect(preview.ledgerFocusDraft.focusSummary).toContain("tony");
    expect(preview.taskDraft.agent).toBe("tony");
    expect(preview.taskDraft.projectName).toBe("CereBro");
    expect(preview.taskDraft.title).toContain("project build");
    expect(preview.gates.join(" ")).toContain("No model call");

    for (const table of previewMutationTables) {
      expect(await countRows(table)).toBe(rowCountsBefore.get(table));
    }
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

  it("shows local-first model lane guidance before any model call", async () => {
    const caller = createCaller();

    const quickPreview = await caller.runtime.previewRoute({
      text: "summarize this private CereBro source note",
      mode: "quick",
    });

    expect(quickPreview.modelProposal.modelClass).toBe("local_summary");
    expect(quickPreview.modelProposal.laneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.modelProposal.provider).toBe("Ollama");
    expect(quickPreview.modelProposal.approvalRequired).toBe(false);
    expect(quickPreview.modelProposal.dataLeavingMachine).toBe(false);
    expect(quickPreview.modelProposal.installRequired).toBe(true);
    expect(quickPreview.modelProposal.status).toBe("not_verified_no_install");
    expect(quickPreview.modelProposal.reason).toContain("fast local-first");
    expect(quickPreview.workbenchReceiptDraft.modelLane?.laneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.ledgerFocusDraft.auditFilters.modelLaneId).toBe("ollama_local_fast_lane");
    expect(quickPreview.gates.join(" ")).toContain("No Ollama install");

    const buildPreview = await caller.runtime.previewRoute({
      text: "implement the next CereBro frontend build slice",
      mode: "build",
    });

    expect(buildPreview.modelProposal.laneId).toBe("frontier_or_codex_escalation");
    expect(buildPreview.modelProposal.approvalRequired).toBe(true);
    expect(buildPreview.modelProposal.dataLeavingMachine).toBe(true);
    expect(buildPreview.modelProposal.reason).toContain("local lane may not be strong enough");
    expect(buildPreview.approvalGates).toContain("external model escalation approval");
  });

  it("commits a local route record without running the routed work", async () => {
    const caller = createCaller();
    const rowCountsBefore = await countPreviewMutationRows();

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    expect(committed.mode).toBe("local_route_record");
    expect(committed.writesExternal).toBe(false);
    expect(committed.runsCommand).toBe(false);
    expect(committed.opensBrowser).toBe(false);
    expect(committed.callsModel).toBe(false);
    expect(committed.record.id).toBeGreaterThan(0);
    expect(committed.record.category).toBe("project_build");
    expect(committed.record.ownerAgent).toBe("tony");
    expect(committed.record.projectSlug).toBe("cerebro");
    expect(committed.record.workbenchReceiptDraft.autosave).toBe(false);
    expect(committed.record.ledgerFocusDraft.autosave).toBe(false);
    expect(committed.nextAction).toContain("Workbench receipt");

    expect(await countRows("runtime_route_records")).toBe((rowCountsBefore.get("runtime_route_records") ?? 0) + 1);
    for (const table of previewMutationTables.filter((table) => table !== "runtime_route_records")) {
      expect(await countRows(table)).toBe(rowCountsBefore.get(table));
    }
  });

  it("lists committed route records as parsed Ledger audit reads", async () => {
    const caller = createCaller();

    const committed = await caller.runtime.commitRoute({
      text: "keep building CereBro front end",
      mode: "build",
    });

    const records = await caller.runtime.routeRecords({
      limit: 5,
      projectSlug: "cerebro",
      ownerAgent: "tony",
    });

    expect(records.items[0]?.id).toBe(committed.record.id);
    expect(records.items[0]?.originalText).toBe("keep building CereBro front end");
    expect(records.items[0]?.mode).toBe("build");
    expect(records.items[0]?.category).toBe("project_build");
    expect(records.items[0]?.ownerAgent).toBe("tony");
    expect(records.items[0]?.supportAgents).toContain("spock");
    expect(records.items[0]?.projectSlug).toBe("cerebro");
    expect(records.items[0]?.routeChain[0]).toBe("Aang reads mode");
    expect(records.items[0]?.approvalGates).toContain("No external action from route preview.");
    expect(records.items[0]?.workbenchReceiptDraft.autosave).toBe(false);
    expect(records.items[0]?.ledgerFocusDraft.autosave).toBe(false);
    expect(records.items[0]?.taskDraft.agent).toBe("tony");
    expect(records.items[0]?.createdAt).toBeGreaterThan(0);
  });
});
