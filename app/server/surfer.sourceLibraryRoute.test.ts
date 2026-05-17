import { afterEach, describe, expect, it, vi } from "vitest";
import { getCerebroDb } from "./cerebroDb";
import { appRouter } from "./routers";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

async function countRows(table: string) {
  const db = await getCerebroDb();
  const result = await db.execute(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(result.rows[0]?.count ?? 0);
}

describe("Surfer Source Library route", () => {
  it("shows source and GitHub knowledge routes without durable writes", async () => {
    const caller = createCaller();
    const db = await getCerebroDb();
    const stamp = Date.now();
    await db.execute({
      sql: `
        INSERT INTO sources (
          kind, uri, title, summary, source_type, trust_level,
          freshness_status, sensitive_data_flag, trust_notes
        )
        VALUES
          ('url', ?, 'Trusted source receipt fixture', 'Trusted source summary.', 'official_docs', 'official', 'fresh', 0, 'fixture'),
          ('url', ?, 'Unknown source receipt fixture', 'Unknown source summary.', 'public_url', 'unknown', 'stale', 1, 'fixture')
      `,
      args: [
        `https://docs.example.com/cerebro-source-${stamp}`,
        `https://example.com/cerebro-source-${stamp}`,
      ],
    });
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
    expect(panel.sourceLibraryReceipt.mode).toBe("local_read");
    expect(panel.sourceLibraryReceipt.totalSources).toBeGreaterThanOrEqual(2);
    expect(panel.sourceLibraryReceipt.trustedSources).toBeGreaterThanOrEqual(1);
    expect(panel.sourceLibraryReceipt.needsReview).toBeGreaterThanOrEqual(1);
    expect(panel.sourceLibraryReceipt.needsScrub).toBeGreaterThanOrEqual(1);
    expect(panel.sourceLibraryReceipt.staleSources).toBeGreaterThanOrEqual(1);
    expect(panel.sourceLibraryReceipt.routeDefaultsChanged).toBe(false);
    expect(panel.sourceLibraryReceipt.retrievalAutomationEnabled).toBe(false);
    expect(panel.sourceLibraryReceipt.noActionTaken.join(" ")).toContain("No browser");
    expect(panel.sourceResearchLoopAudit.mode).toBe("read_only");
    expect(panel.sourceResearchLoopAudit.ownerAgent).toBe("surfer");
    expect(panel.sourceResearchLoopAudit.totalSources).toBeGreaterThanOrEqual(2);
    expect(panel.sourceResearchLoopAudit.trustedSources).toBeGreaterThanOrEqual(1);
    expect(panel.sourceResearchLoopAudit.reviewSources).toBeGreaterThanOrEqual(1);
    expect(panel.sourceResearchLoopAudit.staleSources).toBeGreaterThanOrEqual(1);
    expect(panel.sourceResearchLoopAudit.sensitiveSources).toBeGreaterThanOrEqual(1);
    expect(panel.sourceResearchLoopAudit.canBrowseFromAudit).toBe(false);
    expect(panel.sourceResearchLoopAudit.canWriteMemoryFromAudit).toBe(false);
    expect(panel.sourceResearchLoopAudit.retrievalAutomationEnabled).toBe(false);
    expect(panel.sourceResearchLoopAudit.gates.join(" ")).toContain("does not browse");

    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });

  it("returns a source save receipt after an approved public URL ingest", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      "<html><head><title>CereBro Source Fixture</title><meta name=\"description\" content=\"Fixture source description.\"></head><body>Fixture body.</body></html>",
      {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    )));
    const caller = createCaller();
    const before = {
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const saved = await caller.surfer.ingestPublicUrl({
      url: `https://docs.example.com/cerebro-save-receipt-${Date.now()}`,
      approved: true,
    });

    expect(saved.ok).toBe(true);
    if (!saved.ok) throw new Error("Expected source ingest to succeed.");
    expect(saved.sourceSaveReceipt.mode).toBe("approved_public_url_ingest");
    expect(saved.sourceSaveReceipt.fetchRan).toBe(true);
    expect(saved.sourceSaveReceipt.browserOpened).toBe(false);
    expect(saved.sourceSaveReceipt.searchRan).toBe(false);
    expect(saved.sourceSaveReceipt.writesExternalSystems).toBe(false);
    expect(saved.sourceSaveReceipt.writesLocalRecords).toBe(true);
    expect(saved.sourceSaveReceipt.sourceId).toBe(saved.source.id);
    expect(saved.sourceSaveReceipt.artifactId).toBe(saved.artifactId);
    expect(saved.sourceSaveReceipt.sourceEventId).toBe(saved.sourceEventId);
    expect(saved.sourceSaveReceipt.routeDefaultsChanged).toBe(false);
    expect(saved.sourceSaveReceipt.retrievalAutomationEnabled).toBe(false);
    expect(saved.sourceSaveReceipt.noActionTaken.join(" ")).toContain("No browser");
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });

  it("records local source validation without browsing or external writes", async () => {
    const caller = createCaller();
    const db = await getCerebroDb();
    const stamp = Date.now();
    const inserted = await db.execute({
      sql: `
        INSERT INTO sources (
          kind, uri, title, summary, source_type, trust_level,
          freshness_status, sensitive_data_flag, trust_notes
        )
        VALUES ('url', ?, 'Validation source fixture', 'Validation source summary.', 'public_url', 'unknown', 'fresh', 0, 'fixture')
        RETURNING id
      `,
      args: [`https://example.com/cerebro-validation-${stamp}`],
    });
    const sourceId = Number(inserted.rows[0]?.id);
    const before = {
      artifacts: await countRows("artifacts"),
      approvals: await countRows("approvals"),
      memoryEntries: await countRows("memory_entries"),
    };

    const result = await caller.surfer.validateSource({
      sourceId,
      decision: "trusted",
      reviewer: "oak",
      note: "Official docs matched the claim in this fixture.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected source validation to succeed.");
    expect(result.source.trustLevel).toBe("high");
    expect(result.sourceValidationReceipt.mode).toBe("local_source_validation");
    expect(result.sourceValidationReceipt.decision).toBe("trusted");
    expect(result.sourceValidationReceipt.reviewer).toBe("oak");
    expect(result.sourceValidationReceipt.browserOpened).toBe(false);
    expect(result.sourceValidationReceipt.searchRan).toBe(false);
    expect(result.sourceValidationReceipt.fetchRan).toBe(false);
    expect(result.sourceValidationReceipt.writesExternalSystems).toBe(false);
    expect(result.sourceValidationReceipt.writesMemory).toBe(false);
    expect(result.sourceValidationReceipt.retrievalAutomationEnabled).toBe(false);
    expect(result.sourceValidationReceipt.noActionTaken.join(" ")).toContain("No browser");

    const events = await db.execute({
      sql: `
        SELECT event_type, owner_agent, source_label, trust_level, trust_notes
        FROM source_events
        WHERE source_id = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      args: [sourceId],
    });
    expect(events.rows[0]?.event_type).toBe("source_validation");
    expect(events.rows[0]?.owner_agent).toBe("oak");
    expect(events.rows[0]?.source_label).toBe("oak_trusted");
    expect(events.rows[0]?.trust_level).toBe("high");
    expect(String(events.rows[0]?.trust_notes ?? "")).toContain("Official docs matched");
    expect(await countRows("artifacts")).toBe(before.artifacts);
    expect(await countRows("approvals")).toBe(before.approvals);
    expect(await countRows("memory_entries")).toBe(before.memoryEntries);
  });
});
