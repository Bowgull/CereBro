import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { AGENT_ROUTING, getAgentById } from "./agentRouter";
import { appRouter } from "./routers";
import {
  getObsidianKnowledgeRoutes,
  getObsidianStatus,
  getVaultLayout,
  OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
  writeObsidianNote,
  writeVaultTextArtifact,
} from "./integrations/vault";
import { getCerebroDb, recordOutput } from "./cerebroDb";
import { getSkillById, listSkillFiles } from "./skillLoader";

describe("CereBro agent routing metadata", () => {
  it("uses model classes instead of hardcoded Claude model names", () => {
    for (const agent of AGENT_ROUTING) {
      expect(agent.defaultModelClass).not.toMatch(/^claude-/);
      expect(agent.escalationModelClass ?? "").not.toMatch(/^claude-/);
    }
  });

  it("keeps Oak and Spock in their corrected lanes", () => {
    expect(getAgentById("oak")?.role).toContain("Validator");
    expect(getAgentById("oak")?.toolScope).toContain("validate_output");
    expect(getAgentById("spock")?.role).toContain("Logic checker");
    expect(getAgentById("spock")?.toolScope).toContain("bloat_check");
    expect(getAgentById("spock")?.role).toContain("security gate");
    expect(getAgentById("spock")?.toolScope).toContain("security_gate");
    expect(getAgentById("spock")?.toolScope).toContain("security_scan");
  });

  it("binds Aang to a real learning skill file", () => {
    const aang = getAgentById("aang");
    expect(aang?.skills).toContain("aang-learning");
    expect(getSkillById("aang-learning")?.content).toContain("# Aang Learning");
  });

  it("includes Hedwig as the V1 capture and messaging agent", () => {
    const hedwig = getAgentById("hedwig");
    expect(hedwig?.floor).toBe("crypts");
    expect(hedwig?.chamber).toBe("Messenger Roost");
    expect(hedwig?.toolScope).toContain("read_slack_capture");
    expect(hedwig?.toolScope).toContain("write_notion");
  });
});

describe("CereBro skill files", () => {
  it("discovers starter-pack skill files at runtime", () => {
    const skills = listSkillFiles();
    expect(skills.map((s) => s.id)).toContain("validation");
    expect(skills.map((s) => s.id)).toContain("aang-learning");
  });

  it("keeps local Claude agent role files aligned with the truth reconciliation", () => {
    const repoRoot = path.resolve(process.cwd(), "..");
    const oak = fs.readFileSync(path.join(repoRoot, ".claude", "agents", "oak.md"), "utf8");
    const spock = fs.readFileSync(path.join(repoRoot, ".claude", "agents", "spock.md"), "utf8");
    const cortana = fs.readFileSync(path.join(repoRoot, ".claude", "agents", "cortana.md"), "utf8");

    expect(oak).toContain("Final gate");
    expect(oak).not.toContain("Research curator. Reads heavy material");
    expect(spock).toContain("Logic checker");
    expect(cortana).toContain("Hard router");
    expect(cortana).toContain("Browser disabled by default");
  });
});

describe("CereBro proposal-only shell plans", () => {
  it("keeps Raven behind the sealed private module boundary", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const initial = await caller.raven.status();
    expect(initial.mode).toBe("sealed_private_module");
    expect(initial.writesCoreMemory).toBe(false);
    expect(initial.writesExternal).toBe(false);
    expect(initial.opensBrowser).toBe(false);

    const rejected = await caller.raven.requestUnlock({ phrase: "open raven" });
    expect(rejected.ok).toBe(false);
    expect(rejected.status).toBe("sealed");

    const requested = await caller.raven.requestUnlock({ phrase: "execute order 66" });
    expect(requested.ok).toBe(true);
    expect(requested.status).toBe("confirmation_required");
    expect(requested.message).toBe("Please confirm.");

    const unlocked = await caller.raven.confirmUnlock({
      phrase: "I swear I’m up to no good.",
      privacyScope: "Vitest Raven boundary check.",
    });
    expect(unlocked.ok).toBe(true);
    expect(unlocked.status).toBe("unlocked");
    expect(unlocked.boundary.writesCoreMemory).toBe(false);
    expect(unlocked.boundary.writesExternal).toBe(false);

    const event = await caller.raven.addPrivateEvent({
      ravenSessionId: unlocked.session.id,
      eventType: "taste_note",
      title: "Boundary note",
      body: "Private Raven event. Not core memory.",
      metadata: { testRun: true },
    });
    expect(event.ok).toBe(true);
    expect(event.writesCoreMemory).toBe(false);
    expect(event.event.privacyClass).toBe("raven_private");

    const recent = await caller.raven.recentEvents({
      ravenSessionId: unlocked.session.id,
      limit: 5,
    });
    expect(recent.mode).toBe("private_read");
    expect(recent.items.map((item) => item.id)).toContain(event.event.id);

    const continuation = await caller.commandIntake.preview({
      text: "' keep building",
      mode: "build",
    });
    expect(continuation.category).toBe("raven_build");
    expect(continuation.sealedModule).toBe("raven");
    expect(continuation.trigger).toBe("keep_building");
    expect(continuation.agents).toContain("raven");
    expect(continuation.agents).toContain("spock");
    expect(continuation.permissionGates.join(" ")).toContain("sealed private module");
    expect(continuation.permissionGates.join(" ")).toContain("No browser session");

    const categories = await caller.raven.preferenceCategories();
    expect(categories.categories).toContain("visual_style");
    expect(categories.writesCoreMemory).toBe(false);

    await caller.raven.updateSettings({
      ravenEnabled: false,
      adultDiscoveryEnabled: false,
      runSourceSearchFromChat: false,
      explicitSearchOnly: true,
      backgroundDiscoveryEnabled: false,
      thumbnailsAllowed: false,
      previewMediaAllowed: false,
      candidateRetentionMode: "keep_until_manual_delete",
    });
    await caller.raven.updateSourceAdapter({
      sourceId: "eporner",
      enabled: false,
      searchAllowed: false,
    });

    const defaultRavenSettings = await caller.raven.settings();
    expect(defaultRavenSettings.mode).toBe("sealed_settings");
    expect(defaultRavenSettings.settings.ravenEnabled).toBe(false);
    expect(defaultRavenSettings.settings.adultDiscoveryEnabled).toBe(false);
    expect(defaultRavenSettings.settings.requirePassphraseOnOpen).toBe(true);
    expect(defaultRavenSettings.settings.externalModelPrivateContentAllowed).toBe(false);
    expect(defaultRavenSettings.settings.candidateRetentionMode).toBe("keep_until_manual_delete");
    expect(defaultRavenSettings.settings.candidateRetentionLocalOnly).toBe(true);
    expect(defaultRavenSettings.candidateRetention.localOnly).toBe(true);
    expect(defaultRavenSettings.candidateRetention.batchDeleteEnabled).toBe(false);
    expect(defaultRavenSettings.candidateRetention.externalExportEnabled).toBe(false);
    expect(defaultRavenSettings.discoveryReadiness.canSearch).toBe(false);
    expect(defaultRavenSettings.discoveryReadiness.blockedReasons).toContain("raven_disabled");
    expect(defaultRavenSettings.discoveryReadiness.blockedReasons).toContain("adult_discovery_disabled");
    expect(defaultRavenSettings.discoveryReadiness.blockedReasons).toContain("no_enabled_search_source");
    expect(defaultRavenSettings.sourceReadiness.find((item) => item.sourceId === "eporner")?.canSearch).toBe(false);
    expect(defaultRavenSettings.sourceReadiness.find((item) => item.sourceId === "eporner")?.blockedReasons).toContain("raven_disabled");
    expect(defaultRavenSettings.sourceReadiness.find((item) => item.sourceId === "eporner")?.blockedReasons).toContain("source_disabled");
    expect(defaultRavenSettings.lockedProtections.find((item) => item.key === "illegal_content")?.userEditable).toBe(false);
    expect(defaultRavenSettings.lockedProtections.find((item) => item.key === "illegal_content")?.enforced).toBe(true);
    expect(defaultRavenSettings.lockedProtections.every((item) => item.enforced)).toBe(true);
    expect(defaultRavenSettings.boundaryEnforcement.lockedProtectionCount).toBe(defaultRavenSettings.lockedProtections.length);
    expect(defaultRavenSettings.boundaryEnforcement.enforcedLockedProtectionCount).toBe(defaultRavenSettings.lockedProtections.length);
    expect(defaultRavenSettings.boundaryEnforcement.allLockedProtectionsEnforced).toBe(true);
    expect(defaultRavenSettings.userBlockTypes).toContain("source");
    expect(defaultRavenSettings.sourceAdapters.map((item) => item.sourceId)).toContain("eporner");
    expect(defaultRavenSettings.sourceAdapters.find((item) => item.sourceId === "eporner")?.enabled).toBe(false);
    expect(defaultRavenSettings.writesCoreMemory).toBe(false);
    expect(defaultRavenSettings.opensBrowser).toBe(false);
    expect(defaultRavenSettings.downloadsMedia).toBe(false);

    const retentionSettingsReceipt = await caller.raven.candidateRetentionSettingsReceipt();
    expect(retentionSettingsReceipt.mode).toBe("sealed_candidate_retention_settings_receipt");
    expect(retentionSettingsReceipt.candidateRetention.mode).toBe("keep_until_manual_delete");
    expect(retentionSettingsReceipt.candidateRetention.localOnly).toBe(true);
    expect(retentionSettingsReceipt.candidateRetention.lockedToLocalRaven).toBe(true);
    expect(retentionSettingsReceipt.candidateRetention.batchDeleteEnabled).toBe(false);
    expect(retentionSettingsReceipt.candidateRetention.externalExportEnabled).toBe(false);
    expect(retentionSettingsReceipt.deletesCandidates).toBe(false);
    expect(retentionSettingsReceipt.writesCoreMemory).toBe(false);

    const addedUserBlock = await caller.raven.addUserBlock({
      blockType: "source",
      label: "Vitest blocked source",
      value: "vitest-blocked-source",
      enabled: true,
    });
    const testUserBlock = addedUserBlock.userBlocks.find((item) => item.value === "vitest-blocked-source");
    expect(testUserBlock?.enabled).toBe(true);
    expect(testUserBlock?.userEditable).toBe(true);
    const disabledUserBlock = await caller.raven.updateUserBlock({
      id: testUserBlock!.id,
      enabled: false,
    });
    expect(disabledUserBlock.userBlocks.find((item) => item.id === testUserBlock!.id)?.enabled).toBe(false);
    const reenabledUserBlock = await caller.raven.updateUserBlock({
      id: testUserBlock!.id,
      enabled: true,
    });
    expect(reenabledUserBlock.userBlocks.find((item) => item.id === testUserBlock!.id)?.enabled).toBe(true);
    expect(reenabledUserBlock.boundaryEnforcement.enabledUserBlockCountsByType.source).toBeGreaterThan(0);
    await expect(caller.raven.updateSettings({
      externalModelPrivateContentAllowed: true,
    })).rejects.toThrow("Private Raven content cannot be sent to external models in V1.");
    const updatedRetentionSettings = await caller.raven.updateSettings({
      candidateRetentionMode: "delete_blocked_candidates",
    });
    expect(updatedRetentionSettings.candidateRetention.mode).toBe("delete_blocked_candidates");
    expect(updatedRetentionSettings.candidateRetention.localOnly).toBe(true);
    expect(updatedRetentionSettings.candidateRetention.batchDeleteEnabled).toBe(false);
    expect(updatedRetentionSettings.candidateRetention.externalExportEnabled).toBe(false);
    expect(updatedRetentionSettings.writesCoreMemory).toBe(false);

    const enabledSettings = await caller.raven.updateSettings({
      ravenEnabled: true,
      adultDiscoveryEnabled: true,
    });
    expect(enabledSettings.ok).toBe(true);
    expect(enabledSettings.settings.ravenEnabled).toBe(true);
    expect(enabledSettings.settings.adultDiscoveryEnabled).toBe(true);
    expect(enabledSettings.discoveryReadiness.canSearch).toBe(false);
    expect(enabledSettings.discoveryReadiness.blockedReasons).toEqual(["no_enabled_search_source"]);

    const enabledSource = await caller.raven.updateSourceAdapter({
      sourceId: "eporner",
      enabled: true,
      searchAllowed: true,
    });
    expect(enabledSource.ok).toBe(true);
    expect(enabledSource.sourceAdapters.find((item) => item.sourceId === "eporner")?.enabled).toBe(true);
    expect(enabledSource.sourceAdapters.find((item) => item.sourceId === "eporner")?.searchAllowed).toBe(true);
    expect(enabledSource.discoveryReadiness.canSearch).toBe(true);
    expect(enabledSource.discoveryReadiness.enabledSearchSourceCount).toBeGreaterThan(0);
    expect(enabledSource.opensBrowser).toBe(false);
    expect(enabledSource.downloadsMedia).toBe(false);

    const readinessReceipt = await caller.raven.discoveryReadinessReceipt();
    expect(readinessReceipt.mode).toBe("sealed_discovery_readiness_receipt");
    expect(readinessReceipt.discoveryReadiness.canSearch).toBe(true);
    expect(readinessReceipt.sourceReadiness.find((item) => item.sourceId === "eporner")?.canSearch).toBe(true);
    expect(readinessReceipt.boundaryEnforcement.allLockedProtectionsEnforced).toBe(true);
    expect(readinessReceipt.boundaryEnforcement.enabledUserBlockCount).toBeGreaterThan(0);
    expect(readinessReceipt.receipts.searchableSourceCount).toBeGreaterThan(0);
    expect(readinessReceipt.receipts.lockedProtectionCount).toBe(defaultRavenSettings.lockedProtections.length);
    expect(readinessReceipt.writesCoreMemory).toBe(false);
    expect(readinessReceipt.opensBrowser).toBe(false);
    expect(readinessReceipt.downloadsMedia).toBe(false);

    await caller.raven.addUserBlock({
      blockType: "term",
      label: "Vitest blocked term",
      value: "local-only-avoid-term",
      enabled: true,
    });
    const boundaryReceipt = await caller.raven.candidateBoundaryReceipt({
      sourceId: "vitest-blocked-source",
      title: "Synthetic local-only-avoid-term fixture",
      tags: ["private test tag"],
      durationSeconds: 320,
      lockedProtectionFlags: ["malware_scam_or_forced_download"],
    });
    expect(boundaryReceipt.mode).toBe("sealed_candidate_boundary_receipt");
    expect(boundaryReceipt.receipts.blockedBeforeScoring).toBe(true);
    expect(boundaryReceipt.boundaryReceipt.lockedProtectionHitCount).toBe(1);
    expect(boundaryReceipt.boundaryReceipt.userBlockHitCount).toBeGreaterThanOrEqual(2);
    expect(boundaryReceipt.boundaryReceipt.userBlockCountsByType.source).toBeGreaterThan(0);
    expect(boundaryReceipt.boundaryReceipt.userBlockCountsByType.term).toBeGreaterThan(0);
    expect(boundaryReceipt.boundaryReceipt.lockedProtectionHits.map((item) => item.key)).toContain("malware_scam_or_forced_download");
    expect(JSON.stringify(boundaryReceipt)).not.toContain("Synthetic local-only-avoid-term fixture");
    expect(boundaryReceipt.writesCoreMemory).toBe(false);
    expect(boundaryReceipt.opensBrowser).toBe(false);
    expect(boundaryReceipt.downloadsMedia).toBe(false);

    const normalisationReceipt = await caller.raven.manualCandidateNormalisationReceipt({
      sourceId: "manual",
      sourceClass: "manual",
      candidateKey: "vitest-private-candidate-key",
      sourceUri: "https://example.invalid/private-raven-fixture",
      title: "Synthetic local-only-avoid-term normalisation fixture",
      terms: [" local-only-avoid-term ", "local-only-avoid-term"],
      tags: ["private test tag", "private test tag"],
      durationSeconds: 320,
      lockedProtectionFlags: ["malware_scam_or_forced_download"],
    });
    expect(normalisationReceipt.mode).toBe("sealed_manual_candidate_normalisation_receipt");
    expect(normalisationReceipt.normalisation.shapeVersion).toBe("raven_private_candidate_v1");
    expect(normalisationReceipt.normalisation.sourceId).toBe("manual");
    expect(normalisationReceipt.normalisation.fieldCounts.terms).toBe(1);
    expect(normalisationReceipt.normalisation.fieldCounts.tags).toBe(1);
    expect(normalisationReceipt.receipts.blockedBeforeScoring).toBe(true);
    expect(normalisationReceipt.boundaryReceipt.lockedProtectionHitCount).toBe(1);
    expect(normalisationReceipt.boundaryReceipt.userBlockCountsByType.term).toBeGreaterThan(0);
    expect(normalisationReceipt.storesCandidate).toBe(false);
    expect(normalisationReceipt.scoresCandidate).toBe(false);
    expect(JSON.stringify(normalisationReceipt)).not.toContain("Synthetic local-only-avoid-term normalisation fixture");
    expect(JSON.stringify(normalisationReceipt)).not.toContain("https://example.invalid/private-raven-fixture");
    expect(normalisationReceipt.writesCoreMemory).toBe(false);
    expect(normalisationReceipt.opensBrowser).toBe(false);
    expect(normalisationReceipt.downloadsMedia).toBe(false);

    const batchReceipt = await caller.raven.manualCandidateBatchDryRunReceipt({
      candidates: [
        {
          sourceId: "manual",
          sourceClass: "manual",
          candidateKey: "vitest-private-candidate-key",
          sourceUri: "https://example.invalid/private-raven-fixture",
          title: "Synthetic local-only-avoid-term batch fixture",
          terms: ["local-only-avoid-term"],
          tags: ["private test tag"],
          durationSeconds: 320,
          lockedProtectionFlags: ["malware_scam_or_forced_download"],
        },
        {
          sourceId: "manual",
          sourceClass: "manual",
          candidateKey: "vitest-private-candidate-key",
          sourceUri: "https://example.invalid/private-raven-fixture",
          title: "Synthetic local-only-avoid-term batch fixture",
          terms: ["local-only-avoid-term"],
          tags: ["private test tag"],
          durationSeconds: 320,
          lockedProtectionFlags: ["malware_scam_or_forced_download"],
        },
        {
          sourceId: "manual",
          sourceClass: "manual",
          candidateKey: "vitest-clear-candidate-key",
          title: "Synthetic clear batch fixture",
          terms: ["ordinary local fixture"],
          tags: ["ordinary tag"],
          durationSeconds: 900,
        },
      ],
    });
    expect(batchReceipt.mode).toBe("sealed_manual_candidate_batch_dry_run_receipt");
    expect(batchReceipt.batch.candidateCount).toBe(3);
    expect(batchReceipt.batch.uniqueFingerprintCount).toBe(2);
    expect(batchReceipt.batch.duplicateFingerprintCount).toBe(1);
    expect(batchReceipt.batch.blockedCandidateCount).toBe(2);
    expect(batchReceipt.batch.clearBeforeScoringCount).toBe(1);
    expect(batchReceipt.duplicateFingerprints[0]?.count).toBe(2);
    expect(batchReceipt.boundarySummary.lockedProtectionCountsByKey.malware_scam_or_forced_download).toBe(2);
    expect(batchReceipt.boundarySummary.userBlockCountsByType.term).toBeGreaterThanOrEqual(2);
    expect(batchReceipt.items[0]?.normalisation.fieldCounts.terms).toBe(1);
    expect(batchReceipt.storesCandidates).toBe(false);
    expect(batchReceipt.scoresCandidates).toBe(false);
    expect(JSON.stringify(batchReceipt)).not.toContain("Synthetic local-only-avoid-term batch fixture");
    expect(JSON.stringify(batchReceipt)).not.toContain("https://example.invalid/private-raven-fixture");
    expect(batchReceipt.writesCoreMemory).toBe(false);
    expect(batchReceipt.opensBrowser).toBe(false);
    expect(batchReceipt.downloadsMedia).toBe(false);

    const storageProposal = await caller.raven.candidateStorageProposalReceipt();
    expect(storageProposal.mode).toBe("sealed_candidate_storage_proposal_receipt");
    expect(storageProposal.proposal.schemaVersion).toBe("raven_private_candidates_v1");
    expect(storageProposal.proposal.proposedTables.map((table) => table.name)).toContain("raven_private_candidates");
    expect(storageProposal.proposal.proposedTables.map((table) => table.name)).toContain("raven_private_candidate_events");
    expect(storageProposal.proposal.proposedTables[0]?.columns.some((column) => column.name === "normalised_metadata_json" && column.storesPrivateContent)).toBe(true);
    expect(storageProposal.writeGates.join(" ")).toContain("Boundary enforcement must run before scoring");
    expect(storageProposal.readiness.canCreateCandidateStorage).toBe(false);
    expect(storageProposal.createsTables).toBe(false);
    expect(storageProposal.storesCandidates).toBe(false);
    expect(storageProposal.scoresCandidates).toBe(false);
    expect(storageProposal.writesCoreMemory).toBe(false);
    expect(storageProposal.opensBrowser).toBe(false);
    expect(storageProposal.downloadsMedia).toBe(false);

    const manualDraft = await caller.raven.createManualCandidateDraft({
      sourceId: "manual",
      sourceClass: "manual",
      candidateKey: "vitest-private-draft-key",
      sourceUri: "https://example.invalid/private-raven-draft",
      title: "Synthetic local-only-avoid-term stored draft fixture",
      terms: ["local-only-avoid-term"],
      tags: ["private draft tag"],
      durationSeconds: 420,
      lockedProtectionFlags: ["malware_scam_or_forced_download"],
    });
    expect(manualDraft.mode).toBe("sealed_manual_candidate_draft_write");
    expect(manualDraft.ok).toBe(true);
    expect(manualDraft.candidate.ravenSessionId).toBe(unlocked.session.id);
    expect(manualDraft.candidate.sourceId).toBe("manual");
    expect(manualDraft.candidate.status).toBe("blocked_before_scoring");
    expect(manualDraft.receipts.blockedBeforeScoring).toBe(true);
    expect(manualDraft.boundaryReceipt.lockedProtectionHitCount).toBe(1);
    expect(manualDraft.boundaryReceipt.userBlockCountsByType.term).toBeGreaterThan(0);
    expect(manualDraft.storesCandidate).toBe(true);
    expect(manualDraft.scoresCandidate).toBe(false);
    expect(JSON.stringify(manualDraft)).not.toContain("Synthetic local-only-avoid-term stored draft fixture");
    expect(JSON.stringify(manualDraft)).not.toContain("https://example.invalid/private-raven-draft");
    expect(manualDraft.writesCoreMemory).toBe(false);
    expect(manualDraft.opensBrowser).toBe(false);
    expect(manualDraft.downloadsMedia).toBe(false);
    const ravenDb = await getCerebroDb();
    const storedDraft = await ravenDb.execute({
      sql: `SELECT * FROM raven_private_candidates WHERE candidate_fingerprint = ? LIMIT 1`,
      args: [manualDraft.candidate.candidateFingerprint],
    });
    expect(storedDraft.rows[0]).toBeDefined();
    expect(String(storedDraft.rows[0]?.normalised_metadata_json)).toContain("Synthetic local-only-avoid-term stored draft fixture");
    const storedDraftEvents = await ravenDb.execute({
      sql: `SELECT * FROM raven_private_candidate_events WHERE candidate_id = ?`,
      args: [manualDraft.candidate.id],
    });
    expect(storedDraftEvents.rows.map((row) => String(row.event_type))).toContain("manual_candidate_draft_written");

    const reviewReadyDraft = await caller.raven.createManualCandidateDraft({
      sourceId: "manual",
      sourceClass: "manual",
      candidateKey: "vitest-review-ready-draft-key",
      title: "Synthetic review-ready stored draft fixture",
      terms: ["ordinary local fixture"],
      tags: ["ordinary draft tag"],
      durationSeconds: 900,
    });
    expect(reviewReadyDraft.candidate.status).toBe("draft");
    const queueReceipt = await caller.raven.privateCandidateQueueReceipt();
    expect(queueReceipt.mode).toBe("sealed_private_candidate_queue_receipt");
    expect(queueReceipt.queue.includeStatuses).toContain("draft");
    expect(queueReceipt.queue.excludedStatuses).toContain("blocked_before_scoring");
    expect(queueReceipt.items.some((item) => item.candidate.id === reviewReadyDraft.candidate.id)).toBe(true);
    expect(queueReceipt.items.some((item) => item.candidate.id === manualDraft.candidate.id)).toBe(false);
    expect(queueReceipt.items.every((item) => item.candidate.status !== "blocked_before_scoring")).toBe(true);
    expect(JSON.stringify(queueReceipt)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(queueReceipt)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(queueReceipt.returnsPrivateMetadata).toBe(false);
    expect(queueReceipt.writesCoreMemory).toBe(false);
    expect(queueReceipt.opensBrowser).toBe(false);
    expect(queueReceipt.downloadsMedia).toBe(false);

    const transitionProposal = await caller.raven.privateCandidateStatusTransitionProposalReceipt({
      candidateId: reviewReadyDraft.candidate.id,
      proposedStatus: "ready_for_private_review",
      reason: "Vitest local review lane proposal.",
    });
    expect(transitionProposal.mode).toBe("sealed_private_candidate_status_transition_proposal_receipt");
    expect(transitionProposal.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(transitionProposal.proposal.fromStatus).toBe("draft");
    expect(transitionProposal.proposal.proposedStatus).toBe("ready_for_private_review");
    expect(transitionProposal.proposal.allowed).toBe(true);
    expect(transitionProposal.proposal.allowedTargets).toContain("never_again");
    expect(transitionProposal.mutatesStatus).toBe(false);
    expect(JSON.stringify(transitionProposal)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(transitionProposal)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(transitionProposal.returnsPrivateMetadata).toBe(false);
    expect(transitionProposal.writesCoreMemory).toBe(false);
    expect(transitionProposal.opensBrowser).toBe(false);
    expect(transitionProposal.downloadsMedia).toBe(false);
    const unchangedReviewReadyDraft = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(unchangedReviewReadyDraft.rows[0]?.status)).toBe("draft");
    const transitionedDraft = await caller.raven.updatePrivateCandidateStatus({
      candidateId: reviewReadyDraft.candidate.id,
      status: "ready_for_private_review",
      reason: "Vitest local review lane transition.",
    });
    expect(transitionedDraft.mode).toBe("sealed_private_candidate_status_write");
    expect(transitionedDraft.ok).toBe(true);
    expect(transitionedDraft.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(transitionedDraft.candidate.status).toBe("ready_for_private_review");
    expect(transitionedDraft.transition.fromStatus).toBe("draft");
    expect(transitionedDraft.transition.toStatus).toBe("ready_for_private_review");
    expect(transitionedDraft.mutatesStatus).toBe(true);
    expect(JSON.stringify(transitionedDraft)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(transitionedDraft)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(transitionedDraft.returnsPrivateMetadata).toBe(false);
    expect(transitionedDraft.writesCoreMemory).toBe(false);
    expect(transitionedDraft.opensBrowser).toBe(false);
    expect(transitionedDraft.downloadsMedia).toBe(false);
    const transitionedDraftRow = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(transitionedDraftRow.rows[0]?.status)).toBe("ready_for_private_review");
    const transitionEvents = await ravenDb.execute({
      sql: `SELECT * FROM raven_private_candidate_events WHERE candidate_id = ? AND event_type = ?`,
      args: [reviewReadyDraft.candidate.id, "private_candidate_status_transition"],
    });
    expect(transitionEvents.rows.length).toBeGreaterThan(0);
    const statusHistory = await caller.raven.privateCandidateStatusHistoryReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(statusHistory.mode).toBe("sealed_private_candidate_status_history_receipt");
    expect(statusHistory.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(statusHistory.transitionEvents.length).toBeGreaterThan(0);
    expect(statusHistory.transitionEvents.every((event) => event.eventType === "private_candidate_status_transition")).toBe(true);
    expect(statusHistory.transitionEvents[0]?.fromStatus).toBe("draft");
    expect(statusHistory.transitionEvents[0]?.status).toBe("ready_for_private_review");
    expect(statusHistory.receipts.eventCount).toBeGreaterThan(0);
    expect(JSON.stringify(statusHistory)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(statusHistory)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(statusHistory.returnsPrivateMetadata).toBe(false);
    expect(statusHistory.writesCoreMemory).toBe(false);
    expect(statusHistory.opensBrowser).toBe(false);
    expect(statusHistory.downloadsMedia).toBe(false);
    const reviewNoteDraft = await caller.raven.addPrivateCandidateReviewNoteDraftReceipt({
      candidateId: reviewReadyDraft.candidate.id,
      reviewAction: "hold_for_future_private_review",
      rationale: "Keep the Synthetic review-ready stored draft fixture private. Review https://example.invalid/private-raven-note later.",
    });
    expect(reviewNoteDraft.mode).toBe("sealed_private_candidate_review_note_draft_receipt");
    expect(reviewNoteDraft.ok).toBe(true);
    expect(reviewNoteDraft.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(reviewNoteDraft.candidate.status).toBe("ready_for_private_review");
    expect(reviewNoteDraft.reviewNote.eventType).toBe("private_candidate_review_note_draft");
    expect(reviewNoteDraft.reviewNote.status).toBe("ready_for_private_review");
    expect(reviewNoteDraft.reviewNote.reviewAction).toBe("hold_for_future_private_review");
    expect(reviewNoteDraft.reviewNote.reviewNoteFingerprint).toBe(reviewNoteDraft.receipts.reviewNoteFingerprint);
    expect(reviewNoteDraft.reviewNote.redactedRationale).toContain("[private_rationale_redacted:");
    expect(reviewNoteDraft.reviewNote.rationaleCharCount).toBeGreaterThan(0);
    expect(reviewNoteDraft.reviewNote.redactionFindingCount).toBeGreaterThan(0);
    expect(reviewNoteDraft.receipts.statusUnchanged).toBe(true);
    expect(reviewNoteDraft.mutatesStatus).toBe(false);
    expect(JSON.stringify(reviewNoteDraft)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(reviewNoteDraft)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(reviewNoteDraft)).not.toContain("https://example.invalid/private-raven-note");
    expect(reviewNoteDraft.returnsPrivateMetadata).toBe(false);
    expect(reviewNoteDraft.writesCoreMemory).toBe(false);
    expect(reviewNoteDraft.opensBrowser).toBe(false);
    expect(reviewNoteDraft.downloadsMedia).toBe(false);
    const reviewNoteDraftRow = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(reviewNoteDraftRow.rows[0]?.status)).toBe("ready_for_private_review");
    const reviewNoteDraftEvents = await ravenDb.execute({
      sql: `SELECT * FROM raven_private_candidate_events WHERE candidate_id = ? AND event_type = ?`,
      args: [reviewReadyDraft.candidate.id, "private_candidate_review_note_draft"],
    });
    expect(reviewNoteDraftEvents.rows.length).toBeGreaterThan(0);
    expect(String(reviewNoteDraftEvents.rows[0]?.event_json)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(String(reviewNoteDraftEvents.rows[0]?.event_json)).not.toContain("https://example.invalid/private-raven-note");
    const reviewNoteHistory = await caller.raven.privateCandidateReviewNoteHistoryReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(reviewNoteHistory.mode).toBe("sealed_private_candidate_review_note_history_receipt");
    expect(reviewNoteHistory.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(reviewNoteHistory.reviewNoteEvents.length).toBeGreaterThan(0);
    expect(reviewNoteHistory.reviewNoteEvents.every((event) => event.eventType === "private_candidate_review_note_draft")).toBe(true);
    expect(reviewNoteHistory.reviewNoteEvents[0]?.reviewAction).toBe("hold_for_future_private_review");
    expect(reviewNoteHistory.reviewNoteEvents[0]?.reviewNoteFingerprint).toBe(reviewNoteDraft.receipts.reviewNoteFingerprint);
    expect(reviewNoteHistory.reviewNoteEvents[0]?.redactedRationale).toContain("[private_rationale_redacted:");
    expect(reviewNoteHistory.receipts.eventCount).toBeGreaterThan(0);
    expect(JSON.stringify(reviewNoteHistory)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(reviewNoteHistory)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(reviewNoteHistory)).not.toContain("https://example.invalid/private-raven-note");
    expect(reviewNoteHistory.returnsPrivateMetadata).toBe(false);
    expect(reviewNoteHistory.returnsRawRationale).toBe(false);
    expect(reviewNoteHistory.writesCoreMemory).toBe(false);
    expect(reviewNoteHistory.opensBrowser).toBe(false);
    expect(reviewNoteHistory.downloadsMedia).toBe(false);
    const decisionProposal = await caller.raven.privateCandidateDecisionProposalReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(decisionProposal.mode).toBe("sealed_private_candidate_decision_proposal_receipt");
    expect(decisionProposal.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(decisionProposal.candidate.status).toBe("ready_for_private_review");
    expect(decisionProposal.proposal.proposedStatus).toBe("kept");
    expect(decisionProposal.proposal.allowedTargets).toContain("never_again");
    expect(decisionProposal.proposal.appliesStatus).toBe(false);
    expect(decisionProposal.proposal.requiresExplicitMutation).toBe(true);
    expect(decisionProposal.evidence.statusEventCount).toBeGreaterThan(0);
    expect(decisionProposal.evidence.reviewNoteEventCount).toBeGreaterThan(0);
    expect(decisionProposal.evidence.reviewActions).toContain("hold_for_future_private_review");
    expect(decisionProposal.mutatesStatus).toBe(false);
    expect(JSON.stringify(decisionProposal)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(decisionProposal)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(decisionProposal)).not.toContain("https://example.invalid/private-raven-note");
    expect(decisionProposal.returnsPrivateMetadata).toBe(false);
    expect(decisionProposal.returnsRawRationale).toBe(false);
    expect(decisionProposal.writesCoreMemory).toBe(false);
    expect(decisionProposal.opensBrowser).toBe(false);
    expect(decisionProposal.downloadsMedia).toBe(false);
    const decisionProposalRow = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(decisionProposalRow.rows[0]?.status)).toBe("ready_for_private_review");
    const ravenPrivateDecisionDraftNote = await caller.raven.addPrivateCandidateDecisionDraftNoteReceipt({
      candidateId: reviewReadyDraft.candidate.id,
      proposedStatus: decisionProposal.proposal.proposedStatus,
      reason: decisionProposal.proposal.reason,
      rationale: "Keep the private decision rationale local. Recheck https://example.invalid/private-raven-decision before any explicit status mutation.",
    });
    expect(ravenPrivateDecisionDraftNote.mode).toBe("sealed_private_candidate_decision_draft_note_receipt");
    expect(ravenPrivateDecisionDraftNote.ok).toBe(true);
    expect(ravenPrivateDecisionDraftNote.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(ravenPrivateDecisionDraftNote.candidate.status).toBe("ready_for_private_review");
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.eventType).toBe("private_candidate_decision_draft_note");
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.proposedStatus).toBe(decisionProposal.proposal.proposedStatus);
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.decisionReason).toBe(decisionProposal.proposal.reason);
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.decisionDraftFingerprint).toBe(ravenPrivateDecisionDraftNote.receipts.decisionDraftFingerprint);
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.redactedDecisionRationale).toContain("[private_decision_rationale_redacted:");
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.decisionRationaleCharCount).toBeGreaterThan(0);
    expect(ravenPrivateDecisionDraftNote.decisionDraftNote.redactionFindingCount).toBeGreaterThan(0);
    expect(ravenPrivateDecisionDraftNote.receipts.statusUnchanged).toBe(true);
    expect(ravenPrivateDecisionDraftNote.mutatesStatus).toBe(false);
    expect(JSON.stringify(ravenPrivateDecisionDraftNote)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(ravenPrivateDecisionDraftNote)).not.toContain("private decision rationale local");
    expect(JSON.stringify(ravenPrivateDecisionDraftNote)).not.toContain("https://example.invalid/private-raven-decision");
    expect(ravenPrivateDecisionDraftNote.returnsPrivateMetadata).toBe(false);
    expect(ravenPrivateDecisionDraftNote.returnsRawRationale).toBe(false);
    expect(ravenPrivateDecisionDraftNote.writesCoreMemory).toBe(false);
    expect(ravenPrivateDecisionDraftNote.opensBrowser).toBe(false);
    expect(ravenPrivateDecisionDraftNote.downloadsMedia).toBe(false);
    const ravenPrivateDecisionDraftNoteRow = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(ravenPrivateDecisionDraftNoteRow.rows[0]?.status)).toBe("ready_for_private_review");
    const ravenPrivateDecisionDraftNoteEvents = await ravenDb.execute({
      sql: `SELECT * FROM raven_private_candidate_events WHERE candidate_id = ? AND event_type = ?`,
      args: [reviewReadyDraft.candidate.id, "private_candidate_decision_draft_note"],
    });
    expect(ravenPrivateDecisionDraftNoteEvents.rows.length).toBeGreaterThan(0);
    expect(String(ravenPrivateDecisionDraftNoteEvents.rows[0]?.event_json)).not.toContain("private decision rationale local");
    expect(String(ravenPrivateDecisionDraftNoteEvents.rows[0]?.event_json)).not.toContain("https://example.invalid/private-raven-decision");
    const decisionDraftNoteHistory = await caller.raven.privateCandidateDecisionDraftNoteHistoryReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(decisionDraftNoteHistory.mode).toBe("sealed_private_candidate_decision_draft_note_history_receipt");
    expect(decisionDraftNoteHistory.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(decisionDraftNoteHistory.decisionDraftNoteEvents.length).toBeGreaterThan(0);
    expect(decisionDraftNoteHistory.decisionDraftNoteEvents.every((event) => event.eventType === "private_candidate_decision_draft_note")).toBe(true);
    expect(decisionDraftNoteHistory.decisionDraftNoteEvents[0]?.proposedStatus).toBe(decisionProposal.proposal.proposedStatus);
    expect(decisionDraftNoteHistory.decisionDraftNoteEvents[0]?.decisionReason).toBe(decisionProposal.proposal.reason);
    expect(decisionDraftNoteHistory.decisionDraftNoteEvents[0]?.decisionDraftFingerprint).toBe(ravenPrivateDecisionDraftNote.receipts.decisionDraftFingerprint);
    expect(decisionDraftNoteHistory.decisionDraftNoteEvents[0]?.redactedDecisionRationale).toContain("[private_decision_rationale_redacted:");
    expect(decisionDraftNoteHistory.receipts.eventCount).toBeGreaterThan(0);
    expect(JSON.stringify(decisionDraftNoteHistory)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(decisionDraftNoteHistory)).not.toContain("private decision rationale local");
    expect(JSON.stringify(decisionDraftNoteHistory)).not.toContain("https://example.invalid/private-raven-decision");
    expect(decisionDraftNoteHistory.returnsPrivateMetadata).toBe(false);
    expect(decisionDraftNoteHistory.returnsRawRationale).toBe(false);
    expect(decisionDraftNoteHistory.writesCoreMemory).toBe(false);
    expect(decisionDraftNoteHistory.opensBrowser).toBe(false);
    expect(decisionDraftNoteHistory.downloadsMedia).toBe(false);
    const reviewDossier = await caller.raven.privateCandidateReviewDossierReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(reviewDossier.mode).toBe("sealed_private_candidate_review_dossier_receipt");
    expect(reviewDossier.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(reviewDossier.candidate.status).toBe("ready_for_private_review");
    expect(reviewDossier.statusEvents.length).toBeGreaterThan(0);
    expect(reviewDossier.reviewNoteEvents.length).toBeGreaterThan(0);
    expect(reviewDossier.decisionDraftNoteEvents.length).toBeGreaterThan(0);
    expect(reviewDossier.statusEvents.every((event) => event.eventType === "private_candidate_status_transition")).toBe(true);
    expect(reviewDossier.reviewNoteEvents.every((event) => event.eventType === "private_candidate_review_note_draft")).toBe(true);
    expect(reviewDossier.decisionDraftNoteEvents.every((event) => event.eventType === "private_candidate_decision_draft_note")).toBe(true);
    expect(reviewDossier.proposal.proposedStatus).toBe(decisionProposal.proposal.proposedStatus);
    expect(reviewDossier.proposal.requiresExplicitMutation).toBe(true);
    expect(reviewDossier.receipts.statusEventCount).toBeGreaterThan(0);
    expect(reviewDossier.receipts.reviewNoteEventCount).toBeGreaterThan(0);
    expect(reviewDossier.receipts.decisionDraftNoteEventCount).toBeGreaterThan(0);
    expect(JSON.stringify(reviewDossier)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(reviewDossier)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(reviewDossier)).not.toContain("https://example.invalid/private-raven-note");
    expect(JSON.stringify(reviewDossier)).not.toContain("private decision rationale local");
    expect(JSON.stringify(reviewDossier)).not.toContain("https://example.invalid/private-raven-decision");
    expect(reviewDossier.mutatesStatus).toBe(false);
    expect(reviewDossier.returnsPrivateMetadata).toBe(false);
    expect(reviewDossier.returnsRawRationale).toBe(false);
    expect(reviewDossier.writesCoreMemory).toBe(false);
    expect(reviewDossier.opensBrowser).toBe(false);
    expect(reviewDossier.downloadsMedia).toBe(false);
    const finalApplyProposal = await caller.raven.privateCandidateFinalDecisionApplyProposalReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(finalApplyProposal.mode).toBe("sealed_private_candidate_final_decision_apply_proposal_receipt");
    expect(finalApplyProposal.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(finalApplyProposal.candidate.status).toBe("ready_for_private_review");
    expect(finalApplyProposal.proposal.proposedStatus).toBe(decisionProposal.proposal.proposedStatus);
    expect(finalApplyProposal.apply.canApplyWithExplicitMutation).toBe(true);
    expect(finalApplyProposal.apply.requiredMutation).toBe("raven.updatePrivateCandidateStatus");
    expect(finalApplyProposal.apply.requiredStatus).toBe(decisionProposal.proposal.proposedStatus);
    expect(finalApplyProposal.apply.requiresExplicitMutation).toBe(true);
    expect(finalApplyProposal.apply.mutatesStatusHere).toBe(false);
    expect(finalApplyProposal.apply.blockedReasons).toEqual([]);
    expect(finalApplyProposal.receipts.currentStatus).toBe("ready_for_private_review");
    expect(finalApplyProposal.receipts.matchingDecisionDraftNotePresent).toBe(true);
    expect(finalApplyProposal.mutatesStatus).toBe(false);
    expect(JSON.stringify(finalApplyProposal)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(finalApplyProposal)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(finalApplyProposal)).not.toContain("private decision rationale local");
    expect(JSON.stringify(finalApplyProposal)).not.toContain("https://example.invalid/private-raven-decision");
    expect(finalApplyProposal.returnsPrivateMetadata).toBe(false);
    expect(finalApplyProposal.returnsRawRationale).toBe(false);
    expect(finalApplyProposal.writesCoreMemory).toBe(false);
    expect(finalApplyProposal.opensBrowser).toBe(false);
    expect(finalApplyProposal.downloadsMedia).toBe(false);
    const finalApplyProposalRow = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(finalApplyProposalRow.rows[0]?.status)).toBe("ready_for_private_review");
    const finalApplyWrite = await caller.raven.applyPrivateCandidateFinalDecisionReceipt({
      candidateId: reviewReadyDraft.candidate.id,
      proposedStatus: finalApplyProposal.proposal.proposedStatus,
      reason: finalApplyProposal.proposal.reason,
    });
    expect(finalApplyWrite.mode).toBe("sealed_private_candidate_final_decision_apply_write");
    expect(finalApplyWrite.ok).toBe(true);
    expect(finalApplyWrite.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(finalApplyWrite.candidate.status).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(finalApplyWrite.transition.fromStatus).toBe("ready_for_private_review");
    expect(finalApplyWrite.transition.toStatus).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(finalApplyWrite.finalDecisionEvent.eventType).toBe("private_candidate_final_decision_applied");
    expect(finalApplyWrite.finalDecisionEvent.proposedStatus).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(finalApplyWrite.finalDecisionEvent.decisionReason).toBe(finalApplyProposal.proposal.reason);
    expect(finalApplyWrite.receipts.wroteStatusTransitionEvent).toBe(true);
    expect(finalApplyWrite.receipts.wroteFinalDecisionEvent).toBe(true);
    expect(finalApplyWrite.mutatesStatus).toBe(true);
    expect(JSON.stringify(finalApplyWrite)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(finalApplyWrite)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(finalApplyWrite)).not.toContain("private decision rationale local");
    expect(JSON.stringify(finalApplyWrite)).not.toContain("https://example.invalid/private-raven-decision");
    expect(finalApplyWrite.returnsPrivateMetadata).toBe(false);
    expect(finalApplyWrite.returnsRawRationale).toBe(false);
    expect(finalApplyWrite.writesCoreMemory).toBe(false);
    expect(finalApplyWrite.opensBrowser).toBe(false);
    expect(finalApplyWrite.downloadsMedia).toBe(false);
    const finalApplyWriteRow = await ravenDb.execute({
      sql: `SELECT status FROM raven_private_candidates WHERE id = ?`,
      args: [reviewReadyDraft.candidate.id],
    });
    expect(String(finalApplyWriteRow.rows[0]?.status)).toBe(finalApplyProposal.proposal.proposedStatus);
    const finalApplyEvents = await ravenDb.execute({
      sql: `SELECT * FROM raven_private_candidate_events WHERE candidate_id = ? AND event_type = ?`,
      args: [reviewReadyDraft.candidate.id, "private_candidate_final_decision_applied"],
    });
    expect(finalApplyEvents.rows.length).toBeGreaterThan(0);
    expect(String(finalApplyEvents.rows[0]?.event_json)).not.toContain("private decision rationale local");
    expect(String(finalApplyEvents.rows[0]?.event_json)).not.toContain("https://example.invalid/private-raven-decision");
    const appliedDecisionHistory = await caller.raven.privateCandidateAppliedDecisionHistoryReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(appliedDecisionHistory.mode).toBe("sealed_private_candidate_applied_decision_history_receipt");
    expect(appliedDecisionHistory.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(appliedDecisionHistory.candidate.status).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(appliedDecisionHistory.appliedDecisionEvents.length).toBeGreaterThan(0);
    expect(appliedDecisionHistory.appliedDecisionEvents.every((event) => event.eventType === "private_candidate_final_decision_applied")).toBe(true);
    expect(appliedDecisionHistory.appliedDecisionEvents[0]?.fromStatus).toBe("ready_for_private_review");
    expect(appliedDecisionHistory.appliedDecisionEvents[0]?.status).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(appliedDecisionHistory.appliedDecisionEvents[0]?.proposedStatus).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(appliedDecisionHistory.appliedDecisionEvents[0]?.decisionReason).toBe(finalApplyProposal.proposal.reason);
    expect(appliedDecisionHistory.receipts.eventCount).toBeGreaterThan(0);
    expect(JSON.stringify(appliedDecisionHistory)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(appliedDecisionHistory)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(appliedDecisionHistory)).not.toContain("private decision rationale local");
    expect(JSON.stringify(appliedDecisionHistory)).not.toContain("https://example.invalid/private-raven-decision");
    expect(appliedDecisionHistory.returnsPrivateMetadata).toBe(false);
    expect(appliedDecisionHistory.returnsRawRationale).toBe(false);
    expect(appliedDecisionHistory.writesCoreMemory).toBe(false);
    expect(appliedDecisionHistory.opensBrowser).toBe(false);
    expect(appliedDecisionHistory.downloadsMedia).toBe(false);
    const lifecycleReceipt = await caller.raven.privateCandidateLifecycleReceipt({
      candidateId: reviewReadyDraft.candidate.id,
    });
    expect(lifecycleReceipt.mode).toBe("sealed_private_candidate_lifecycle_receipt");
    expect(lifecycleReceipt.candidate.id).toBe(reviewReadyDraft.candidate.id);
    expect(lifecycleReceipt.lifecycle.currentStatus).toBe(finalApplyProposal.proposal.proposedStatus);
    expect(lifecycleReceipt.lifecycle.statusTransitionCount).toBeGreaterThan(0);
    expect(lifecycleReceipt.lifecycle.reviewNoteCount).toBeGreaterThan(0);
    expect(lifecycleReceipt.lifecycle.decisionDraftNoteCount).toBeGreaterThan(0);
    expect(lifecycleReceipt.lifecycle.appliedDecisionCount).toBeGreaterThan(0);
    expect(["keep_until_manual_delete", "delete_blocked_candidates", "delete_all_candidates_for_active_session"]).toContain(lifecycleReceipt.retention.mode);
    expect(lifecycleReceipt.retention.localOnly).toBe(true);
    expect(lifecycleReceipt.deleteAvailability.previewEndpoint).toBe("raven.privateCandidateDeletePreviewReceipt");
    expect(lifecycleReceipt.deleteAvailability.deleteEndpoint).toBe("raven.deletePrivateCandidate");
    expect(lifecycleReceipt.deleteAvailability.explicitConfirmationRequired).toBe(true);
    expect(lifecycleReceipt.deleteAvailability.canPreviewDelete).toBe(true);
    expect(lifecycleReceipt.deleteAvailability.canDeleteWithConfirmation).toBe(true);
    expect(lifecycleReceipt.transitionAvailability.canTransitionFromCurrentStatus).toBe(false);
    expect(lifecycleReceipt.transitionAvailability.allowedTargets).toEqual([]);
    expect(JSON.stringify(lifecycleReceipt)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(lifecycleReceipt)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(lifecycleReceipt)).not.toContain("private decision rationale local");
    expect(JSON.stringify(lifecycleReceipt)).not.toContain("https://example.invalid/private-raven-decision");
    expect(lifecycleReceipt.mutatesStatus).toBe(false);
    expect(lifecycleReceipt.deletesCandidates).toBe(false);
    expect(lifecycleReceipt.deletesCandidateEvents).toBe(false);
    expect(lifecycleReceipt.returnsPrivateMetadata).toBe(false);
    expect(lifecycleReceipt.returnsRawRationale).toBe(false);
    expect(lifecycleReceipt.writesCoreMemory).toBe(false);
    expect(lifecycleReceipt.opensBrowser).toBe(false);
    expect(lifecycleReceipt.downloadsMedia).toBe(false);
    const queueSummaryReceipt = await caller.raven.privateCandidateQueueSummaryReceipt();
    expect(queueSummaryReceipt.mode).toBe("sealed_private_candidate_queue_summary_receipt");
    expect(queueSummaryReceipt.queue.totalCandidates).toBeGreaterThan(0);
    expect(queueSummaryReceipt.queue.byStatus[finalApplyProposal.proposal.proposedStatus]).toBeGreaterThan(0);
    expect(queueSummaryReceipt.queue.reviewQueueStatuses).toContain("ready_for_private_review");
    expect(queueSummaryReceipt.queue.excludedStatuses).toContain("blocked_before_scoring");
    expect(queueSummaryReceipt.lifecycle.withStatusTransitions).toBeGreaterThan(0);
    expect(queueSummaryReceipt.lifecycle.withReviewNotes).toBeGreaterThan(0);
    expect(queueSummaryReceipt.lifecycle.withDecisionDraftNotes).toBeGreaterThan(0);
    expect(queueSummaryReceipt.lifecycle.withAppliedDecisions).toBeGreaterThan(0);
    expect(queueSummaryReceipt.lifecycle.eventCounts.appliedDecisions).toBeGreaterThan(0);
    expect(["keep_until_manual_delete", "delete_blocked_candidates", "delete_all_candidates_for_active_session"]).toContain(queueSummaryReceipt.retention.mode);
    expect(queueSummaryReceipt.retention.localOnly).toBe(true);
    expect(queueSummaryReceipt.deleteAvailability.previewEndpoint).toBe("raven.privateCandidateDeletePreviewReceipt");
    expect(queueSummaryReceipt.deleteAvailability.deleteEndpoint).toBe("raven.deletePrivateCandidate");
    expect(queueSummaryReceipt.deleteAvailability.explicitConfirmationRequired).toBe(true);
    expect(JSON.stringify(queueSummaryReceipt)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(queueSummaryReceipt)).not.toContain("Synthetic review-ready stored draft fixture");
    expect(JSON.stringify(queueSummaryReceipt)).not.toContain("private decision rationale local");
    expect(JSON.stringify(queueSummaryReceipt)).not.toContain("https://example.invalid/private-raven-decision");
    expect(queueSummaryReceipt.mutatesStatus).toBe(false);
    expect(queueSummaryReceipt.deletesCandidates).toBe(false);
    expect(queueSummaryReceipt.deletesCandidateEvents).toBe(false);
    expect(queueSummaryReceipt.returnsPrivateMetadata).toBe(false);
    expect(queueSummaryReceipt.returnsRawRationale).toBe(false);
    expect(queueSummaryReceipt.writesCoreMemory).toBe(false);
    expect(queueSummaryReceipt.opensBrowser).toBe(false);
    expect(queueSummaryReceipt.downloadsMedia).toBe(false);
    await expect(caller.raven.addPrivateCandidateDecisionDraftNoteReceipt({
      candidateId: reviewReadyDraft.candidate.id,
      proposedStatus: "skipped",
      reason: decisionProposal.proposal.reason,
      rationale: "This mismatch should be rejected locally.",
    })).rejects.toThrow("Private candidate decision draft note must match the current decision proposal.");
    await expect(caller.raven.updatePrivateCandidateStatus({
      candidateId: manualDraft.candidate.id,
      status: "ready_for_private_review",
      reason: "Blocked candidates should not enter review.",
    })).rejects.toThrow("Raven private candidate status can only change from draft or ready_for_private_review.");

    const candidateList = await caller.raven.privateCandidateListReceipt({
      status: "blocked_before_scoring",
      limit: 10,
    });
    expect(candidateList.mode).toBe("sealed_private_candidate_list_receipt");
    expect(candidateList.total).toBeGreaterThan(0);
    expect(candidateList.byStatus.blocked_before_scoring).toBeGreaterThan(0);
    expect(candidateList.boundarySummary.lockedProtectionCountsByKey.malware_scam_or_forced_download).toBeGreaterThan(0);
    const listedDraft = candidateList.items.find((item) => item.candidate.id === manualDraft.candidate.id);
    expect(listedDraft?.candidate.candidateFingerprint).toBe(manualDraft.candidate.candidateFingerprint);
    expect(listedDraft?.candidate.sourceId).toBe("manual");
    expect(listedDraft?.boundary.blockedBeforeScoring).toBe(true);
    expect(JSON.stringify(candidateList)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(candidateList)).not.toContain("Synthetic local-only-avoid-term stored draft fixture");
    expect(JSON.stringify(candidateList)).not.toContain("https://example.invalid/private-raven-draft");
    expect(candidateList.returnsPrivateMetadata).toBe(false);
    expect(candidateList.writesCoreMemory).toBe(false);
    expect(candidateList.opensBrowser).toBe(false);
    expect(candidateList.downloadsMedia).toBe(false);

    const privateCandidateDetail = await caller.raven.privateCandidateDetailReceipt({
      candidateId: manualDraft.candidate.id,
    });
    expect(privateCandidateDetail.mode).toBe("sealed_private_candidate_detail_receipt");
    expect(privateCandidateDetail.candidate.id).toBe(manualDraft.candidate.id);
    expect(privateCandidateDetail.candidate.candidateFingerprint).toBe(manualDraft.candidate.candidateFingerprint);
    expect(privateCandidateDetail.boundary.blockedBeforeScoring).toBe(true);
    expect(privateCandidateDetail.boundary.lockedProtectionKeys).toContain("malware_scam_or_forced_download");
    expect(privateCandidateDetail.eventReceipts.length).toBeGreaterThan(0);
    expect(privateCandidateDetail.eventReceipts[0]?.eventType).toBe("manual_candidate_draft_written");
    expect(privateCandidateDetail.receipts.eventCount).toBeGreaterThan(0);
    expect(JSON.stringify(privateCandidateDetail)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(privateCandidateDetail)).not.toContain("Synthetic local-only-avoid-term stored draft fixture");
    expect(JSON.stringify(privateCandidateDetail)).not.toContain("https://example.invalid/private-raven-draft");
    expect(privateCandidateDetail.returnsPrivateMetadata).toBe(false);
    expect(privateCandidateDetail.writesCoreMemory).toBe(false);
    expect(privateCandidateDetail.opensBrowser).toBe(false);
    expect(privateCandidateDetail.downloadsMedia).toBe(false);

    const retentionDeleteProposal = await caller.raven.candidateRetentionDeleteProposalReceipt();
    expect(retentionDeleteProposal.mode).toBe("sealed_candidate_retention_delete_proposal_receipt");
    expect(retentionDeleteProposal.proposal.schemaVersion).toBe("raven_private_candidate_retention_v1");
    expect(retentionDeleteProposal.deleteGates.join(" ")).toContain("Delete preview must run first");
    expect(retentionDeleteProposal.redactionPolicy.previewFieldsAllowed).toContain("candidateFingerprint");
    expect(retentionDeleteProposal.readiness.canDeleteCandidates).toBe(false);
    expect(retentionDeleteProposal.deletesCandidates).toBe(false);
    expect(retentionDeleteProposal.deletesCandidateEvents).toBe(false);
    expect(retentionDeleteProposal.returnsPrivateMetadata).toBe(false);
    expect(JSON.stringify(retentionDeleteProposal)).not.toContain("Synthetic local-only-avoid-term stored draft fixture");
    expect(JSON.stringify(retentionDeleteProposal)).not.toContain("https://example.invalid/private-raven-draft");
    expect(retentionDeleteProposal.writesCoreMemory).toBe(false);
    expect(retentionDeleteProposal.opensBrowser).toBe(false);
    expect(retentionDeleteProposal.downloadsMedia).toBe(false);

    const deletePreview = await caller.raven.privateCandidateDeletePreviewReceipt({
      candidateId: manualDraft.candidate.id,
    });
    expect(deletePreview.mode).toBe("sealed_private_candidate_delete_preview_receipt");
    expect(deletePreview.candidate.id).toBe(manualDraft.candidate.id);
    expect(deletePreview.boundary.blockedBeforeScoring).toBe(true);
    expect(deletePreview.receipts.eventCount).toBeGreaterThan(0);
    expect(deletePreview.receipts.wouldDeleteCandidate).toBe(true);
    expect(deletePreview.deletesCandidates).toBe(false);
    expect(deletePreview.deletesCandidateEvents).toBe(false);
    expect(deletePreview.previewOnly).toBe(true);
    expect(JSON.stringify(deletePreview)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(deletePreview)).not.toContain("Synthetic local-only-avoid-term stored draft fixture");
    expect(JSON.stringify(deletePreview)).not.toContain("https://example.invalid/private-raven-draft");
    expect(deletePreview.returnsPrivateMetadata).toBe(false);
    expect(deletePreview.writesCoreMemory).toBe(false);
    expect(deletePreview.opensBrowser).toBe(false);
    expect(deletePreview.downloadsMedia).toBe(false);
    const stillStoredDraft = await ravenDb.execute({
      sql: `SELECT COUNT(*) AS count FROM raven_private_candidates WHERE id = ?`,
      args: [manualDraft.candidate.id],
    });
    expect(Number(stillStoredDraft.rows[0]?.count ?? 0)).toBe(1);
    const stillStoredDraftEvents = await ravenDb.execute({
      sql: `SELECT COUNT(*) AS count FROM raven_private_candidate_events WHERE candidate_id = ?`,
      args: [manualDraft.candidate.id],
    });
    expect(Number(stillStoredDraftEvents.rows[0]?.count ?? 0)).toBeGreaterThan(0);
    await expect(caller.raven.deletePrivateCandidate({
      candidateId: manualDraft.candidate.id,
      candidateFingerprint: manualDraft.candidate.candidateFingerprint,
      previewEventCount: deletePreview.receipts.eventCount,
      confirmPhrase: "delete it",
    })).rejects.toThrow("Raven candidate delete requires the exact delete confirmation phrase.");
    const deletedDraft = await caller.raven.deletePrivateCandidate({
      candidateId: manualDraft.candidate.id,
      candidateFingerprint: manualDraft.candidate.candidateFingerprint,
      previewEventCount: deletePreview.receipts.eventCount,
      confirmPhrase: "delete this raven candidate.",
    });
    expect(deletedDraft.mode).toBe("sealed_private_candidate_delete");
    expect(deletedDraft.ok).toBe(true);
    expect(deletedDraft.deletedCandidate.id).toBe(manualDraft.candidate.id);
    expect(deletedDraft.receipts.deletedCandidate).toBe(true);
    expect(deletedDraft.receipts.deletedCandidateEvents).toBe(deletePreview.receipts.eventCount);
    expect(deletedDraft.deletesCandidates).toBe(true);
    expect(deletedDraft.deletesCandidateEvents).toBe(true);
    expect(JSON.stringify(deletedDraft)).not.toContain("normalised_metadata_json");
    expect(JSON.stringify(deletedDraft)).not.toContain("Synthetic local-only-avoid-term stored draft fixture");
    expect(JSON.stringify(deletedDraft)).not.toContain("https://example.invalid/private-raven-draft");
    expect(deletedDraft.returnsPrivateMetadata).toBe(false);
    expect(deletedDraft.writesCoreMemory).toBe(false);
    expect(deletedDraft.opensBrowser).toBe(false);
    expect(deletedDraft.downloadsMedia).toBe(false);
    const deletedDraftRow = await ravenDb.execute({
      sql: `SELECT COUNT(*) AS count FROM raven_private_candidates WHERE id = ?`,
      args: [manualDraft.candidate.id],
    });
    expect(Number(deletedDraftRow.rows[0]?.count ?? 0)).toBe(0);
    const deletedDraftEvents = await ravenDb.execute({
      sql: `SELECT COUNT(*) AS count FROM raven_private_candidate_events WHERE candidate_id = ?`,
      args: [manualDraft.candidate.id],
    });
    expect(Number(deletedDraftEvents.rows[0]?.count ?? 0)).toBe(0);

    const preference = await caller.raven.addPreference({
      ravenSessionId: unlocked.session.id,
      category: "visual_style",
      signal: "cinematic dark violet lounge",
      weight: 3,
      notes: "Private preference. Keep local.",
      sourceEventId: event.event.id,
    });
    expect(preference.ok).toBe(true);
    expect(preference.preference.category).toBe("visual_style");
    expect(preference.preference.sourceEventId).toBe(event.event.id);
    expect(preference.writesCoreMemory).toBe(false);

    await caller.raven.addPreference({
      ravenSessionId: unlocked.session.id,
      category: "visual_style",
      signal: "flat generic dashboard cards",
      weight: -2,
      notes: "Contradiction/avoid signal.",
    });
    await caller.raven.addPreference({
      ravenSessionId: unlocked.session.id,
      category: "avoid",
      signal: "generic public-feed recommendations",
      weight: -4,
      notes: "Private avoid signal.",
    });
    await caller.raven.addPreference({
      ravenSessionId: unlocked.session.id,
      category: "tone",
      signal: "quiet private lounge",
      weight: 2,
    });
    const rollup = await caller.raven.preferenceRollup({
      ravenSessionId: unlocked.session.id,
      limitPerCategory: 3,
    });
    expect(rollup.mode).toBe("private_read");
    expect(rollup.writesCoreMemory).toBe(false);
    expect(rollup.writesExternal).toBe(false);
    expect(rollup.opensBrowser).toBe(false);
    expect(rollup.callsExternalModels).toBe(false);
    expect(rollup.rollups.find((item) => item.category === "visual_style")?.topSignals).toContain("cinematic dark violet lounge");
    expect(rollup.rollups.find((item) => item.category === "visual_style")?.avoidSignals).toContain("flat generic dashboard cards");
    expect(rollup.rollups.find((item) => item.category === "visual_style")?.contradictionState).toBe("mixed");
    expect(rollup.rollups.find((item) => item.category === "visual_style")?.decayBucket).toBe("fresh");
    expect(rollup.rollups.find((item) => item.category === "visual_style")?.decayedWeight).toBe(1);
    expect(rollup.rollups.find((item) => item.category === "avoid")?.avoidSignals).toContain("generic public-feed recommendations");
    expect(rollup.recommendationSeeds.find((item) => item.category === "visual_style")?.source).toBe("raven_private_preferences");
    expect(rollup.recommendationSeeds.find((item) => item.category === "visual_style")?.contradictionState).toBe("mixed");
    expect(rollup.gates.join(" ")).toContain("derived only from raven_private_preferences");

    const draftedCandidates = await caller.raven.draftRecommendationCandidates({
      ravenSessionId: unlocked.session.id,
      limit: 5,
    });
    expect(draftedCandidates.ok).toBe(true);
    expect(draftedCandidates.mode).toBe("private_local_draft");
    expect(draftedCandidates.writesCoreMemory).toBe(false);
    expect(draftedCandidates.writesExternal).toBe(false);
    expect(draftedCandidates.opensBrowser).toBe(false);
    expect(draftedCandidates.downloadsMedia).toBe(false);
    expect(draftedCandidates.callsExternalModels).toBe(false);
    expect(draftedCandidates.items.find((item) => item.seedCategory === "visual_style")?.seedText).toContain("cinematic dark violet lounge");
    expect(draftedCandidates.items.find((item) => item.seedCategory === "visual_style")?.rationale).toContain("Contradiction: mixed");
    expect(draftedCandidates.items.find((item) => item.seedCategory === "visual_style")?.rationale).toContain("Decay: fresh");
    expect(draftedCandidates.items.find((item) => item.seedCategory === "visual_style")?.sourcePreferenceIds.length).toBeGreaterThan(0);
    expect(draftedCandidates.gates.join(" ")).toContain("text-only local drafts");

    const candidateRows = await caller.raven.recommendationCandidates({
      ravenSessionId: unlocked.session.id,
      status: "draft",
      limit: 10,
    });
    expect(candidateRows.mode).toBe("private_read");
    expect(candidateRows.items.length).toBeGreaterThan(0);
    const firstCandidate = candidateRows.items[0]!;
    const candidateDetail = await caller.raven.recommendationCandidateDetail({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(candidateDetail.mode).toBe("private_read");
    expect(candidateDetail.candidate.id).toBe(firstCandidate.id);
    expect(candidateDetail.sourcePreferences.length).toBeGreaterThan(0);
    expect(candidateDetail.rollupContext.category).toBe(firstCandidate.seedCategory);
    expect(candidateDetail.history[0]?.toStatus).toBe("draft");
    expect(candidateDetail.writesExternal).toBe(false);
    expect(candidateDetail.callsExternalModels).toBe(false);

    const keptCandidate = await caller.raven.updateRecommendationCandidateStatus({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      status: "kept",
      reason: "Keep this local seed for later.",
    });
    expect(keptCandidate.ok).toBe(true);
    expect(keptCandidate.candidate.status).toBe("kept");
    expect(keptCandidate.writesExternal).toBe(false);
    expect(keptCandidate.callsExternalModels).toBe(false);
    const keptCandidateDetail = await caller.raven.recommendationCandidateDetail({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(keptCandidateDetail.history.map((item) => item.toStatus)).toContain("kept");
    expect(keptCandidateDetail.history.find((item) => item.toStatus === "kept")?.reason).toContain("local seed");

    const queueSummary = await caller.raven.recommendationCandidateQueueSummary({
      ravenSessionId: unlocked.session.id,
    });
    expect(queueSummary.mode).toBe("private_read");
    expect(queueSummary.summary.total).toBeGreaterThan(0);
    expect(queueSummary.summary.byStatus.kept).toBeGreaterThan(0);
    expect(queueSummary.summary.byContradiction.mixed).toBeGreaterThan(0);
    expect(queueSummary.summary.byDecay.fresh).toBeGreaterThan(0);
    expect((queueSummary.summary.byConfidence.low ?? 0) + (queueSummary.summary.byConfidence.medium ?? 0) + (queueSummary.summary.byConfidence.high ?? 0)).toBeGreaterThan(0);
    expect(queueSummary.rows.find((row) => row.candidateId === firstCandidate.id)?.contradictionState).toBeDefined();
    expect(queueSummary.writesExternal).toBe(false);
    expect(queueSummary.callsExternalModels).toBe(false);
    expect(queueSummary.gates.join(" ")).toContain("derived only from local Raven candidates");

    const reviewPlan = await caller.raven.recommendationCandidateReviewPlan({
      ravenSessionId: unlocked.session.id,
      limit: 10,
    });
    expect(reviewPlan.mode).toBe("private_read");
    expect(reviewPlan.items.length).toBeGreaterThan(0);
    expect(reviewPlan.items.find((item) => item.candidateId === firstCandidate.id)?.action).toBe("hold_for_future_private_review");
    expect(reviewPlan.items.some((item) => item.action === "ask_private_clarifying_question")).toBe(true);
    expect(reviewPlan.writesExternal).toBe(false);
    expect(reviewPlan.callsExternalModels).toBe(false);
    expect(reviewPlan.gates.join(" ")).toContain("deterministic local suggestions");

    const reviewNote = await caller.raven.addRecommendationCandidateReviewNote({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      plannerAction: "hold_for_future_private_review",
      note: "Keep this private. Review it again after one more local preference signal.",
    });
    expect(reviewNote.ok).toBe(true);
    expect(reviewNote.mode).toBe("private_append_only_note");
    expect(reviewNote.note.candidateId).toBe(firstCandidate.id);
    expect(reviewNote.note.plannerAction).toBe("hold_for_future_private_review");
    expect(reviewNote.appendOnly).toBe(true);
    expect(reviewNote.writesExternal).toBe(false);
    expect(reviewNote.callsExternalModels).toBe(false);
    expect(reviewNote.gates.join(" ")).toContain("does not approve export");

    const reviewNotes = await caller.raven.recommendationCandidateReviewNotes({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      limit: 10,
    });
    expect(reviewNotes.mode).toBe("private_read");
    expect(reviewNotes.items.map((item) => item.id)).toContain(reviewNote.note.id);
    expect(reviewNotes.appendOnly).toBe(true);
    expect(reviewNotes.writesExternal).toBe(false);

    const notedCandidateDetail = await caller.raven.recommendationCandidateDetail({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(notedCandidateDetail.reviewNotes.map((item) => item.id)).toContain(reviewNote.note.id);

    const reviewDigest = await caller.raven.recommendationCandidateReviewDigest({
      ravenSessionId: unlocked.session.id,
      limit: 10,
    });
    expect(reviewDigest.mode).toBe("private_read");
    expect(reviewDigest.groups.hold_for_future_private_review?.count).toBeGreaterThan(0);
    expect(reviewDigest.groups.hold_for_future_private_review?.notedCount).toBeGreaterThan(0);
    expect(reviewDigest.groups.ask_private_clarifying_question?.pendingNoteCount).toBeGreaterThan(0);
    const digestRow = reviewDigest.rows.find((item) => item.candidateId === firstCandidate.id);
    expect(digestRow?.plannerAction).toBe("hold_for_future_private_review");
    expect(digestRow?.reviewNoteCount).toBeGreaterThan(0);
    expect(digestRow?.latestReviewNote?.id).toBe(reviewNote.note.id);
    expect(reviewDigest.writesExternal).toBe(false);
    expect(reviewDigest.callsExternalModels).toBe(false);
    expect(reviewDigest.gates.join(" ")).toContain("derived only from local Raven candidates");

    const clarifyIds = reviewDigest.groups.ask_private_clarifying_question?.candidateIds ?? [];
    expect(clarifyIds.length).toBeGreaterThan(0);
    const batchNote = await caller.raven.addRecommendationCandidateReviewBatchNote({
      ravenSessionId: unlocked.session.id,
      candidateIds: clarifyIds,
      plannerAction: "ask_private_clarifying_question",
      note: "Clarify the mixed preference signal before ranking this group.",
    });
    expect(batchNote.ok).toBe(true);
    expect(batchNote.mode).toBe("private_append_only_batch_note");
    expect(batchNote.notes.length).toBe(clarifyIds.length);
    expect(batchNote.notes.every((item) => item.plannerAction === "ask_private_clarifying_question")).toBe(true);
    expect(batchNote.appendOnly).toBe(true);
    expect(batchNote.writesExternal).toBe(false);
    expect(batchNote.callsExternalModels).toBe(false);
    expect(batchNote.gates.join(" ")).toContain("validated against the active Raven session");

    const batchDigest = await caller.raven.recommendationCandidateReviewDigest({
      ravenSessionId: unlocked.session.id,
      limit: 10,
    });
    expect(batchDigest.groups.ask_private_clarifying_question?.pendingNoteCount).toBe(0);
    expect(batchDigest.groups.ask_private_clarifying_question?.notedCount).toBe(clarifyIds.length);

    const filteredReviewNotes = await caller.raven.recommendationCandidateReviewNotes({
      ravenSessionId: unlocked.session.id,
      plannerAction: "ask_private_clarifying_question",
      limit: 10,
    });
    expect(filteredReviewNotes.filters.plannerAction).toBe("ask_private_clarifying_question");
    expect(filteredReviewNotes.items.length).toBe(clarifyIds.length);
    expect(filteredReviewNotes.items.every((item) => item.plannerAction === "ask_private_clarifying_question")).toBe(true);

    const filteredDigest = await caller.raven.recommendationCandidateReviewDigest({
      ravenSessionId: unlocked.session.id,
      plannerAction: "ask_private_clarifying_question",
      limit: 10,
    });
    expect(filteredDigest.filters.plannerAction).toBe("ask_private_clarifying_question");
    expect(Object.keys(filteredDigest.groups)).toEqual(["ask_private_clarifying_question"]);
    expect(filteredDigest.rows.every((item) => item.plannerAction === "ask_private_clarifying_question")).toBe(true);

    const noteSearch = await caller.raven.searchRecommendationCandidateReviewNotes({
      ravenSessionId: unlocked.session.id,
      query: "mixed preference",
      plannerAction: "ask_private_clarifying_question",
      limit: 10,
    });
    expect(noteSearch.mode).toBe("private_read");
    expect(noteSearch.items.length).toBe(clarifyIds.length);
    expect(noteSearch.items.every((item) => item.note.plannerAction === "ask_private_clarifying_question")).toBe(true);
    expect(noteSearch.items[0]?.snippet).toContain("mixed preference");
    expect(noteSearch.items[0]?.seedCategory).toBeDefined();
    expect(noteSearch.writesExternal).toBe(false);
    expect(noteSearch.callsExternalModels).toBe(false);
    expect(noteSearch.gates.join(" ")).toContain("reads only Raven candidate and review-note tables");

    const categorySearch = await caller.raven.searchRecommendationCandidateReviewNotes({
      ravenSessionId: unlocked.session.id,
      query: "visual_style",
      limit: 10,
    });
    expect(categorySearch.items.some((item) => item.seedCategory === "visual_style")).toBe(true);

    const timeline = await caller.raven.recommendationCandidateTimeline({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(timeline.mode).toBe("private_read");
    expect(timeline.candidate.id).toBe(firstCandidate.id);
    expect(timeline.events.some((item) => item.kind === "status_change")).toBe(true);
    expect(timeline.events.some((item) => item.kind === "review_note")).toBe(true);
    expect(timeline.events.map((item) => item.createdAt)).toEqual([...timeline.events.map((item) => item.createdAt)].sort((a, b) => a - b));
    expect(timeline.events.find((item) => item.kind === "review_note")?.reviewNote?.id).toBe(reviewNote.note.id);
    expect(timeline.writesExternal).toBe(false);
    expect(timeline.callsExternalModels).toBe(false);
    expect(timeline.gates.join(" ")).toContain("status history, review notes, and decision draft notes");

    const reviewStats = await caller.raven.recommendationCandidateReviewStats({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(reviewStats.mode).toBe("private_read");
    expect(reviewStats.candidate.id).toBe(firstCandidate.id);
    expect(reviewStats.stats.timelineEventCount).toBe(timeline.events.length);
    expect(reviewStats.stats.reviewNoteCount).toBeGreaterThan(0);
    expect(reviewStats.stats.statusTransitionCount).toBeGreaterThan(0);
    expect(reviewStats.stats.latestNoteAgeSeconds).not.toBeNull();
    expect(reviewStats.stats.plannerActions).toContain("hold_for_future_private_review");
    expect(reviewStats.stats.hasEnoughPrivateReviewEvidence).toBe(false);
    expect(reviewStats.writesExternal).toBe(false);
    expect(reviewStats.callsExternalModels).toBe(false);
    expect(reviewStats.gates.join(" ")).toContain("advisory and derived only from local Raven candidate history");

    const statsSummary = await caller.raven.recommendationCandidateReviewStatsSummary({
      ravenSessionId: unlocked.session.id,
      limit: 10,
    });
    expect(statsSummary.mode).toBe("private_read");
    expect(statsSummary.summary.total).toBeGreaterThan(0);
    expect(statsSummary.summary.byReadiness.needs_more_private_review).toBeGreaterThan(0);
    expect(statsSummary.summary.byPlannerAction.hold_for_future_private_review).toBeGreaterThan(0);
    expect(statsSummary.summary.byPlannerAction.ask_private_clarifying_question).toBeGreaterThan(0);
    expect(statsSummary.summary.byNoteCoverage.one_note + (statsSummary.summary.byNoteCoverage.multiple_notes ?? 0)).toBeGreaterThan(0);
    expect(statsSummary.rows.find((item) => item.candidateId === firstCandidate.id)?.reviewNoteCount).toBeGreaterThan(0);
    expect(statsSummary.writesExternal).toBe(false);
    expect(statsSummary.callsExternalModels).toBe(false);
    expect(statsSummary.gates.join(" ")).toContain("derived only from local Raven candidates");

    const decisionDraft = await caller.raven.draftRecommendationCandidateReviewDecision({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(decisionDraft.mode).toBe("private_read");
    expect(decisionDraft.candidate.id).toBe(firstCandidate.id);
    expect(decisionDraft.decision.proposedStatus).toBe("kept");
    expect(decisionDraft.decision.appliesStatus).toBe(false);
    expect(decisionDraft.decision.requiresExplicitMutation).toBe(true);
    expect(decisionDraft.evidence.reviewNoteCount).toBeGreaterThan(0);
    expect(decisionDraft.evidence.plannerActions).toContain("hold_for_future_private_review");
    expect(decisionDraft.writesExternal).toBe(false);
    expect(decisionDraft.callsExternalModels).toBe(false);
    expect(decisionDraft.gates.join(" ")).toContain("local advice only");

    const clarifyDecisionDraft = await caller.raven.draftRecommendationCandidateReviewDecision({
      ravenSessionId: unlocked.session.id,
      candidateId: clarifyIds[0]!,
    });
    expect(clarifyDecisionDraft.decision.proposedStatus).toBe("draft");
    expect(clarifyDecisionDraft.decision.reason).toContain("Mixed signals");

    const decisionSummary = await caller.raven.draftRecommendationCandidateReviewDecisionSummary({
      ravenSessionId: unlocked.session.id,
      limit: 10,
    });
    expect(decisionSummary.mode).toBe("private_read");
    expect(decisionSummary.summary.total).toBeGreaterThan(0);
    expect(decisionSummary.summary.byProposedStatus.kept).toBeGreaterThan(0);
    expect(decisionSummary.summary.byProposedStatus.draft).toBeGreaterThan(0);
    expect(decisionSummary.rows.find((item) => item.candidateId === firstCandidate.id)?.proposedStatus).toBe("kept");
    expect(decisionSummary.rows.every((item) => item.appliesStatus === false)).toBe(true);
    expect(decisionSummary.rows.every((item) => item.requiresExplicitMutation === true)).toBe(true);
    expect(decisionSummary.writesExternal).toBe(false);
    expect(decisionSummary.callsExternalModels).toBe(false);
    expect(decisionSummary.gates.join(" ")).toContain("local advice only");

    const keptDecisionSummary = await caller.raven.draftRecommendationCandidateReviewDecisionSummary({
      ravenSessionId: unlocked.session.id,
      proposedStatus: "kept",
      plannerAction: "hold_for_future_private_review",
      limit: 10,
    });
    expect(keptDecisionSummary.filters.proposedStatus).toBe("kept");
    expect(keptDecisionSummary.filters.plannerAction).toBe("hold_for_future_private_review");
    expect(keptDecisionSummary.summary.byProposedStatus.kept).toBe(keptDecisionSummary.rows.length);
    expect(keptDecisionSummary.rows.every((item) => item.proposedStatus === "kept")).toBe(true);
    expect(keptDecisionSummary.rows.every((item) => item.plannerActions.includes("hold_for_future_private_review"))).toBe(true);

    const draftDecisionSummary = await caller.raven.draftRecommendationCandidateReviewDecisionSummary({
      ravenSessionId: unlocked.session.id,
      proposedStatus: "draft",
      plannerAction: "ask_private_clarifying_question",
      limit: 10,
    });
    expect(draftDecisionSummary.rows.every((item) => item.proposedStatus === "draft")).toBe(true);
    expect(draftDecisionSummary.rows.every((item) => item.plannerActions.includes("ask_private_clarifying_question"))).toBe(true);

    const decisionDetail = await caller.raven.recommendationCandidateDecisionDraftDetail({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(decisionDetail.mode).toBe("private_read");
    expect(decisionDetail.detail.candidate.id).toBe(firstCandidate.id);
    expect(decisionDetail.detail.sourcePreferences.length).toBeGreaterThan(0);
    expect(decisionDetail.detail.reviewNotes.map((item) => item.id)).toContain(reviewNote.note.id);
    expect(decisionDetail.timeline.events.length).toBe(decisionDetail.stats.timelineEventCount);
    expect(decisionDetail.stats.plannerActions).toContain("hold_for_future_private_review");
    expect(decisionDetail.decision.proposedStatus).toBe("kept");
    expect(decisionDetail.decision.appliesStatus).toBe(false);
    expect(decisionDetail.decision.requiresExplicitMutation).toBe(true);
    expect(decisionDetail.writesExternal).toBe(false);
    expect(decisionDetail.callsExternalModels).toBe(false);
    expect(decisionDetail.gates.join(" ")).toContain("combines only local Raven candidate detail");

    const privateDecisionDraftNote = await caller.raven.addRecommendationCandidateDecisionDraftNote({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      proposedStatus: decisionDraft.decision.proposedStatus,
      reason: decisionDraft.decision.reason,
      note: "Keep the draft rationale local. Do not apply status from this note.",
    });
    expect(privateDecisionDraftNote.ok).toBe(true);
    expect(privateDecisionDraftNote.mode).toBe("private_append_only_decision_draft_note");
    expect(privateDecisionDraftNote.note.candidateId).toBe(firstCandidate.id);
    expect(privateDecisionDraftNote.note.proposedStatus).toBe("kept");
    expect(privateDecisionDraftNote.appendOnly).toBe(true);
    expect(privateDecisionDraftNote.appliesStatus).toBe(false);
    expect(privateDecisionDraftNote.writesExternal).toBe(false);
    expect(privateDecisionDraftNote.callsExternalModels).toBe(false);
    expect(privateDecisionDraftNote.gates.join(" ")).toContain("records rationale only");

    const decisionDraftNotes = await caller.raven.recommendationCandidateDecisionDraftNotes({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      proposedStatus: "kept",
      limit: 10,
    });
    expect(decisionDraftNotes.mode).toBe("private_read");
    expect(decisionDraftNotes.items.map((item) => item.id)).toContain(privateDecisionDraftNote.note.id);
    expect(decisionDraftNotes.items.every((item) => item.proposedStatus === "kept")).toBe(true);
    expect(decisionDraftNotes.summary.byProposedStatus.kept).toBe(decisionDraftNotes.items.length);
    expect(decisionDraftNotes.appendOnly).toBe(true);
    expect(decisionDraftNotes.writesExternal).toBe(false);

    const decisionDetailWithDraftNote = await caller.raven.recommendationCandidateDecisionDraftDetail({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(decisionDetailWithDraftNote.detail.decisionDraftNotes.map((item) => item.id)).toContain(privateDecisionDraftNote.note.id);
    expect(decisionDetailWithDraftNote.stats.decisionDraftNoteCount).toBeGreaterThan(0);
    expect(decisionDetailWithDraftNote.timeline.events.find((item) => item.kind === "decision_draft_note")?.decisionDraftNote?.id).toBe(privateDecisionDraftNote.note.id);

    const timelineWithDecisionDraftNote = await caller.raven.recommendationCandidateTimeline({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
    });
    expect(timelineWithDecisionDraftNote.events.find((item) => item.kind === "decision_draft_note")?.decisionDraftNote?.id).toBe(privateDecisionDraftNote.note.id);
    expect(timelineWithDecisionDraftNote.summary.byKind.status_change).toBeGreaterThan(0);
    expect(timelineWithDecisionDraftNote.summary.byKind.review_note).toBeGreaterThan(0);
    expect(timelineWithDecisionDraftNote.summary.byKind.decision_draft_note).toBeGreaterThan(0);

    const filteredDecisionDraftTimeline = await caller.raven.recommendationCandidateTimeline({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      eventKind: "decision_draft_note",
    });
    expect(filteredDecisionDraftTimeline.filters.eventKind).toBe("decision_draft_note");
    expect(filteredDecisionDraftTimeline.events.every((item) => item.kind === "decision_draft_note")).toBe(true);
    expect(filteredDecisionDraftTimeline.events.map((item) => item.decisionDraftNote?.id)).toContain(privateDecisionDraftNote.note.id);
    expect(filteredDecisionDraftTimeline.summary.byKind.decision_draft_note).toBeGreaterThan(0);
    expect(filteredDecisionDraftTimeline.summary.total).toBeGreaterThan(filteredDecisionDraftTimeline.events.length);

    const filteredDecisionDetail = await caller.raven.recommendationCandidateDecisionDraftDetail({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      eventKind: "decision_draft_note",
    });
    expect(filteredDecisionDetail.timeline.filters.eventKind).toBe("decision_draft_note");
    expect(filteredDecisionDetail.timeline.events.every((item) => item.kind === "decision_draft_note")).toBe(true);
    expect(filteredDecisionDetail.timeline.summary.byKind.decision_draft_note).toBeGreaterThan(0);
    expect(filteredDecisionDetail.stats.timelineEventCount).toBe(filteredDecisionDetail.timeline.events.length);

    const timelineSearch = await caller.raven.searchRecommendationCandidateTimeline({
      ravenSessionId: unlocked.session.id,
      candidateId: firstCandidate.id,
      query: "rationale",
      eventKind: "decision_draft_note",
      limit: 10,
    });
    expect(timelineSearch.mode).toBe("private_read");
    expect(timelineSearch.filters.eventKind).toBe("decision_draft_note");
    expect(timelineSearch.items.map((item) => item.eventId)).toContain(`decision_draft_note:${privateDecisionDraftNote.note.id}`);
    expect(timelineSearch.items.every((item) => item.kind === "decision_draft_note")).toBe(true);
    expect(timelineSearch.items[0]?.snippet).toContain("rationale");
    expect(timelineSearch.summary.total).toBe(timelineSearch.items.length);
    expect(timelineSearch.summary.byKind.decision_draft_note).toBe(timelineSearch.items.length);
    expect(timelineSearch.writesExternal).toBe(false);
    expect(timelineSearch.callsExternalModels).toBe(false);
    expect(timelineSearch.gates.join(" ")).toContain("reads only local Raven candidate history");

    const candidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      limit: 10,
    });
    expect(candidateOverview.mode).toBe("private_read");
    expect(candidateOverview.queue.total).toBeGreaterThan(0);
    expect(candidateOverview.queue.byStatus.kept).toBeGreaterThan(0);
    expect(candidateOverview.review.byPlannerAction.hold_for_future_private_review).toBeGreaterThan(0);
    expect(candidateOverview.decisions.byProposedStatus.kept).toBeGreaterThan(0);
    expect(candidateOverview.timeline.searchableCandidates).toBeGreaterThan(0);
    expect(candidateOverview.timeline.eventCountByKind.decision_draft_note).toBeGreaterThan(0);
    expect(candidateOverview.sort).toEqual({ by: "updated_at", direction: "desc" });
    expect(candidateOverview.presets.readyReview.count).toBe(
      candidateOverview.rows.filter((item) => item.readiness === "ready_for_private_status_review").length,
    );
    expect(candidateOverview.presets.needsMoreReview.count).toBe(
      candidateOverview.rows.filter((item) => item.readiness === "needs_more_private_review").length,
    );
    expect(candidateOverview.presets.hasDecisionRationale.count).toBe(
      candidateOverview.rows.filter((item) => item.eventCounts.decision_draft_note > 0).length,
    );
    expect(candidateOverview.presets.highConfidenceKept.count).toBe(
      candidateOverview.rows.filter((item) => item.status === "kept" && item.confidence === "high").length,
    );
    expect(candidateOverview.presets.hasDecisionRationale.input).toEqual({
      ravenSessionId: unlocked.session.id,
      preset: "has_decision_rationale",
    });
    expect(candidateOverview.review.byFreshnessState.current_private_review).toBe(
      candidateOverview.rows.filter((item) => item.notes.freshnessState === "current_private_review").length,
    );
    expect(candidateOverview.freshnessPresets.currentReview.count).toBe(
      candidateOverview.rows.filter((item) => item.notes.freshnessState === "current_private_review").length,
    );
    expect(candidateOverview.freshnessPresets.missingReview.count).toBe(
      candidateOverview.rows.filter((item) => item.notes.freshnessState === "missing_private_review").length,
    );
    expect(candidateOverview.freshnessPresets.staleReview.count).toBe(
      candidateOverview.rows.filter((item) => item.notes.freshnessState === "stale_private_review").length,
    );
    expect(candidateOverview.freshnessPresets.candidateUpdatedAfterReview.count).toBe(
      candidateOverview.rows.filter((item) => item.notes.freshnessState === "candidate_updated_after_review").length,
    );
    expect(candidateOverview.freshnessPresets.currentReview.input).toEqual({
      ravenSessionId: unlocked.session.id,
      reviewFreshness: "current_private_review",
    });
    expect(candidateOverview.rows.every((item) => item.riskFlags.hasMixedPreferenceSignals === (item.contradictionState === "mixed"))).toBe(true);
    expect(candidateOverview.rows.every((item) => item.riskFlags.hasLowConfidence === (item.confidence === "low"))).toBe(true);
    expect(candidateOverview.rows.every((item) => item.riskFlags.hasStaleSourceSignal === (item.decayBucket === "stale"))).toBe(true);
    expect(candidateOverview.rows.every((item) => item.riskFlags.isMissingPrivateReview === (item.notes.freshnessState === "missing_private_review"))).toBe(true);
    expect(
      candidateOverview.rows.every(
        (item) => item.riskFlags.needsPrivateAttention === (
          item.riskFlags.hasMixedPreferenceSignals
          || item.riskFlags.hasLowConfidence
          || item.riskFlags.hasStaleSourceSignal
          || item.riskFlags.isMissingPrivateReview
        ),
      ),
    ).toBe(true);
    expect(candidateOverview.rows.every((item) => item.riskFlags.exposesPrivateBodies === false)).toBe(true);
    expect(candidateOverview.risk.needsPrivateAttention).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.needsPrivateAttention).length,
    );
    expect(candidateOverview.risk.byFlag.mixed_preference_signals ?? 0).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasMixedPreferenceSignals).length,
    );
    expect(candidateOverview.risk.byFlag.low_confidence ?? 0).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasLowConfidence).length,
    );
    expect(candidateOverview.risk.byFlag.stale_source_signal ?? 0).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasStaleSourceSignal).length,
    );
    expect(candidateOverview.risk.byFlag.missing_private_review ?? 0).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.isMissingPrivateReview).length,
    );
    expect(candidateOverview.riskPresets.needsAttention.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.needsPrivateAttention).length,
    );
    expect(candidateOverview.riskPresets.mixedPreferenceSignals.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasMixedPreferenceSignals).length,
    );
    expect(candidateOverview.riskPresets.lowConfidence.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasLowConfidence).length,
    );
    expect(candidateOverview.riskPresets.staleSourceSignal.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasStaleSourceSignal).length,
    );
    expect(candidateOverview.riskPresets.missingPrivateReview.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.isMissingPrivateReview).length,
    );
    expect(candidateOverview.riskPresets.needsAttention.input).toEqual({
      ravenSessionId: unlocked.session.id,
      needsPrivateAttention: true,
    });
    expect(candidateOverview.riskPresets.mixedPreferenceSignals.input).toEqual({
      ravenSessionId: unlocked.session.id,
      riskFlag: "mixed_preference_signals",
    });
    expect(candidateOverview.combinedRiskPresets.needsAttentionCurrentReview.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.needsPrivateAttention && item.notes.freshnessState === "current_private_review").length,
    );
    expect(candidateOverview.combinedRiskPresets.needsAttentionHasDecisionRationale.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.needsPrivateAttention && item.eventCounts.decision_draft_note > 0).length,
    );
    expect(candidateOverview.combinedRiskPresets.mixedSignalsWithCurrentReview.count).toBe(
      candidateOverview.rows.filter((item) => item.riskFlags.hasMixedPreferenceSignals && item.notes.freshnessState === "current_private_review").length,
    );
    expect(candidateOverview.combinedRiskPresets.needsAttentionCurrentReview.input).toEqual({
      ravenSessionId: unlocked.session.id,
      needsPrivateAttention: true,
      reviewFreshness: "current_private_review",
    });
    expect(candidateOverview.evidencePresets.completeEvidence.count).toBe(
      candidateOverview.rows.filter((item) => (
        item.evidenceSummary.hasPreferenceEvidence
        && item.evidenceSummary.hasStatusHistoryEvidence
        && item.evidenceSummary.hasReviewNoteEvidence
        && item.evidenceSummary.hasDecisionDraftNoteEvidence
      )).length,
    );
    expect(candidateOverview.evidencePresets.missingReviewEvidence.count).toBe(
      candidateOverview.rows.filter((item) => !item.evidenceSummary.hasReviewNoteEvidence).length,
    );
    expect(candidateOverview.evidencePresets.missingDecisionRationale.count).toBe(
      candidateOverview.rows.filter((item) => !item.evidenceSummary.hasDecisionDraftNoteEvidence).length,
    );
    expect(candidateOverview.evidencePresets.preferenceOnly.count).toBe(
      candidateOverview.rows.filter((item) => (
        item.evidenceSummary.hasPreferenceEvidence
        && !item.evidenceSummary.hasStatusHistoryEvidence
        && !item.evidenceSummary.hasReviewNoteEvidence
        && !item.evidenceSummary.hasDecisionDraftNoteEvidence
      )).length,
    );
    expect(candidateOverview.evidencePresets.completeEvidence.input).toEqual({
      ravenSessionId: unlocked.session.id,
      evidencePreset: "complete_evidence",
    });
    expect(candidateOverview.evidenceDrilldowns.sources.reviewNote.present).toEqual({
      endpoint: "raven.recommendationCandidateOverview",
      input: { ravenSessionId: unlocked.session.id, evidenceSource: "review_note" },
    });
    expect(candidateOverview.evidenceDrilldowns.sources.reviewNote.missing).toEqual({
      endpoint: "raven.recommendationCandidateOverview",
      input: { ravenSessionId: unlocked.session.id, missingEvidenceSource: "review_note" },
    });
    expect(candidateOverview.evidenceDrilldowns.presets.complete_evidence).toEqual({
      endpoint: "raven.recommendationCandidateOverview",
      input: { ravenSessionId: unlocked.session.id, evidencePreset: "complete_evidence" },
    });
    expect(candidateOverview.evidenceDrilldowns.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.evidenceDrilldowns.mutatesStatus).toBe(false);
    expect(candidateOverview.evidenceReceipt.activeEvidenceFilters).toEqual({
      evidenceSource: null,
      missingEvidenceSource: null,
      evidencePreset: null,
    });
    expect(candidateOverview.evidenceReceipt.warnings).toEqual([]);
    expect(candidateOverview.evidenceReceipt.recommendations).toEqual([]);
    expect(candidateOverview.evidenceReceipt.summaryLabels).toContain(
      candidateOverview.evidenceSummary.rowsWithAllEvidence === candidateOverview.rows.length ? "complete" : "partial",
    );
    if (candidateOverview.evidenceSummary.bySource.reviewNote.rowsWithEvidence < candidateOverview.rows.length) {
      expect(candidateOverview.evidenceReceipt.summaryLabels).toContain("missing_review_evidence");
      expect(candidateOverview.evidenceReceipt.summaryLabelDrilldowns.missing_review_evidence).toEqual({
        endpoint: "raven.recommendationCandidateOverview",
        input: { ravenSessionId: unlocked.session.id, evidencePreset: "missing_review_evidence" },
      });
    }
    if (candidateOverview.evidenceSummary.bySource.decisionDraftNote.rowsWithEvidence < candidateOverview.rows.length) {
      expect(candidateOverview.evidenceReceipt.summaryLabels).toContain("missing_decision_evidence");
      expect(candidateOverview.evidenceReceipt.summaryLabelDrilldowns.missing_decision_evidence).toEqual({
        endpoint: "raven.recommendationCandidateOverview",
        input: { ravenSessionId: unlocked.session.id, evidencePreset: "missing_decision_rationale" },
      });
    }
    expect(candidateOverview.evidenceReceipt.matchingRowCount).toBe(candidateOverview.rows.length);
    expect(candidateOverview.evidenceReceipt.totalReturnedRows).toBe(candidateOverview.rows.length);
    expect(candidateOverview.evidenceReceipt.evidenceSourceCount).toBe(candidateOverview.evidenceSummary.rowsWithAnyEvidence);
    expect(candidateOverview.evidenceReceipt.completeEvidenceRowCount).toBe(candidateOverview.evidenceSummary.rowsWithAllEvidence);
    expect(candidateOverview.evidenceReceipt.missingEvidenceRowCount).toBe(candidateOverview.evidenceSummary.rowsMissingEvidence);
    expect(candidateOverview.evidenceReceipt.actionManifest.supportedFilters).toEqual([
      "evidenceSource",
      "missingEvidenceSource",
      "evidencePreset",
    ]);
    expect(candidateOverview.evidenceReceipt.actionManifest.supportedSummaryLabels).toContain("complete");
    expect(candidateOverview.evidenceReceipt.actionManifest.supportedSummaryLabels).toContain("missing_review_evidence");
    expect(candidateOverview.evidenceReceipt.actionManifest.supportedWarnings).toContain("empty_evidence_queue");
    expect(candidateOverview.evidenceReceipt.actionManifest.supportedRecommendations).toContain("inspect_complete_evidence");
    expect(candidateOverview.evidenceReceipt.actionManifest.drilldownCategories).toEqual([
      "source_present",
      "source_missing",
      "preset",
      "summary_label",
    ]);
    expect(candidateOverview.evidenceReceipt.actionManifest.activeWarningCount).toBe(candidateOverview.evidenceReceipt.warnings.length);
    expect(candidateOverview.evidenceReceipt.actionManifest.activeRecommendationCount).toBe(candidateOverview.evidenceReceipt.recommendations.length);
    expect(candidateOverview.evidenceReceipt.actionManifest.activeSummaryLabelCount).toBe(candidateOverview.evidenceReceipt.summaryLabels.length);
    expect(candidateOverview.evidenceReceipt.actionManifest.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.evidenceReceipt.actionManifest.mutatesStatus).toBe(false);
    expect(candidateOverview.evidenceReceipt.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.evidenceReceipt.mutatesStatus).toBe(false);
    expect(candidateOverview.evidenceReceipt.writesExternal).toBe(false);
    expect(candidateOverview.evidenceReceipt.callsExternalModels).toBe(false);
    expect(candidateOverview.queueManifest.filterKeys).toEqual([
      "status",
      "proposedStatus",
      "readiness",
      "eventKind",
      "preset",
      "reviewFreshness",
      "needsPrivateAttention",
      "riskFlag",
      "evidenceSource",
      "missingEvidenceSource",
      "evidencePreset",
    ]);
    expect(candidateOverview.queueManifest.sortKeys).toContain("updated_at");
    expect(candidateOverview.queueManifest.sortKeys).toContain("timeline_event_count");
    expect(candidateOverview.queueManifest.presetGroups.map((group) => group.key)).toEqual([
      "presets",
      "freshnessPresets",
      "riskPresets",
      "combinedRiskPresets",
      "evidencePresets",
    ]);
    expect(candidateOverview.queueManifest.presetGroups.find((group) => group.key === "riskPresets")?.ids).toContain("mixed_preference_signals");
    expect(candidateOverview.queueManifest.presetGroups.find((group) => group.key === "combinedRiskPresets")?.ids).toContain("needs_attention_current_review");
    expect(candidateOverview.queueManifest.presetGroups.find((group) => group.key === "evidencePresets")?.ids).toContain("complete_evidence");
    expect(candidateOverview.queueManifest.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.queueManifest.mutatesStatus).toBe(false);
    expect(candidateOverview.capabilityReceipt.readSources).toContain("raven_recommendation_candidates");
    expect(candidateOverview.capabilityReceipt.readSources).toContain("raven_recommendation_candidate_review_notes");
    expect(candidateOverview.capabilityReceipt.supportedFilters).toEqual(candidateOverview.queueManifest.filterKeys);
    expect(candidateOverview.capabilityReceipt.supportedPresetGroups).toEqual([
      "presets",
      "freshnessPresets",
      "riskPresets",
      "combinedRiskPresets",
      "evidencePresets",
    ]);
    expect(candidateOverview.capabilityReceipt.privacyGates.join(" ")).toContain("Does not expose private note bodies");
    expect(candidateOverview.capabilityReceipt.writesExternal).toBe(false);
    expect(candidateOverview.capabilityReceipt.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.capabilityReceipt.mutatesStatus).toBe(false);
    expect(candidateOverview.overviewReceiptManifest.surfaces).toEqual([
      "queue",
      "risk",
      "freshness",
      "evidence",
      "capability",
    ]);
    expect(candidateOverview.overviewReceiptManifest.filterCount).toBe(candidateOverview.queueManifest.filterKeys.length);
    expect(candidateOverview.overviewReceiptManifest.presetGroupCount).toBe(candidateOverview.queueManifest.presetGroups.length);
    expect(candidateOverview.overviewReceiptManifest.activeRowCount).toBe(candidateOverview.rows.length);
    expect(candidateOverview.overviewReceiptManifest.riskFlagCount).toBe(Object.keys(candidateOverview.risk.byFlag).length);
    expect(candidateOverview.overviewReceiptManifest.freshnessStateCount).toBe(Object.keys(candidateOverview.review.byFreshnessState).length);
    expect(candidateOverview.overviewReceiptManifest.evidenceSourceCount).toBe(Object.keys(candidateOverview.evidenceSummary.bySource).length);
    expect(candidateOverview.overviewReceiptManifest.evidenceReceiptWarningCount).toBe(candidateOverview.evidenceReceipt.warnings.length);
    expect(candidateOverview.overviewReceiptManifest.evidenceReceiptRecommendationCount).toBe(candidateOverview.evidenceReceipt.recommendations.length);
    expect(candidateOverview.overviewReceiptManifest.capabilityGateCount).toBe(candidateOverview.capabilityReceipt.privacyGates.length);
    expect(candidateOverview.overviewReceiptManifest.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.overviewReceiptManifest.mutatesStatus).toBe(false);
    const overviewFirstCandidate = candidateOverview.rows.find((item) => item.candidateId === firstCandidate.id);
    expect(overviewFirstCandidate?.riskDrilldowns.mixedPreferenceSignals).toEqual({
      endpoint: "raven.recommendationCandidateDetail",
      input: { ravenSessionId: unlocked.session.id, candidateId: firstCandidate.id },
    });
    expect(overviewFirstCandidate?.riskDrilldowns.lowConfidence.endpoint).toBe("raven.draftRecommendationCandidateReviewDecision");
    expect(overviewFirstCandidate?.riskDrilldowns.staleSourceSignal.endpoint).toBe("raven.recommendationCandidateDetail");
    expect(overviewFirstCandidate?.riskDrilldowns.missingPrivateReview.endpoint).toBe("raven.recommendationCandidateReviewNotes");
    expect(overviewFirstCandidate?.riskDrilldowns.exposesPrivateBodies).toBe(false);
    expect(overviewFirstCandidate?.rowCapabilityReceipt.candidateId).toBe(firstCandidate.id);
    expect(overviewFirstCandidate?.rowCapabilityReceipt.availableDrilldowns).toContain("detail");
    expect(overviewFirstCandidate?.rowCapabilityReceipt.availableDrilldowns).toContain("decisionDraftNotes");
    expect(overviewFirstCandidate?.rowCapabilityReceipt.availableRiskDrilldowns).toContain("missingPrivateReview");
    expect(overviewFirstCandidate?.rowCapabilityReceipt.summary.availableDrilldownCount).toBe(
      overviewFirstCandidate?.rowCapabilityReceipt.availableDrilldowns.length,
    );
    expect(overviewFirstCandidate?.rowCapabilityReceipt.summary.availableRiskDrilldownCount).toBe(
      overviewFirstCandidate?.rowCapabilityReceipt.availableRiskDrilldowns.length,
    );
    expect(overviewFirstCandidate?.rowCapabilityReceipt.summary.totalAvailableDrilldowns).toBe(
      (overviewFirstCandidate?.rowCapabilityReceipt.availableDrilldowns.length ?? 0)
      + (overviewFirstCandidate?.rowCapabilityReceipt.availableRiskDrilldowns.length ?? 0),
    );
    expect(overviewFirstCandidate?.rowCapabilityReceipt.writesExternal).toBe(false);
    expect(overviewFirstCandidate?.rowCapabilityReceipt.exposesPrivateBodies).toBe(false);
    expect(overviewFirstCandidate?.rowCapabilityReceipt.mutatesStatus).toBe(false);
    expect(overviewFirstCandidate?.evidenceSummary.hasPreferenceEvidence).toBe(true);
    expect(overviewFirstCandidate?.evidenceSummary.hasStatusHistoryEvidence).toBe(true);
    expect(overviewFirstCandidate?.evidenceSummary.hasReviewNoteEvidence).toBe(true);
    expect(overviewFirstCandidate?.evidenceSummary.hasDecisionDraftNoteEvidence).toBe(true);
    expect(overviewFirstCandidate?.evidenceSummary.preferenceEvidenceCount).toBeGreaterThan(0);
    expect(overviewFirstCandidate?.evidenceSummary.statusHistoryEvidenceCount).toBeGreaterThan(0);
    expect(overviewFirstCandidate?.evidenceSummary.reviewNoteEvidenceCount).toBe(overviewFirstCandidate?.notes.reviewNoteCount);
    expect(overviewFirstCandidate?.evidenceSummary.decisionDraftNoteEvidenceCount).toBe(overviewFirstCandidate?.notes.decisionDraftNoteCount);
    expect(overviewFirstCandidate?.evidenceSummary.exposesPrivateBodies).toBe(false);
    expect(candidateOverview.evidenceSummary.rowsWithAnyEvidence).toBe(
      candidateOverview.rows.filter((item) => (
        item.evidenceSummary.hasPreferenceEvidence
        || item.evidenceSummary.hasStatusHistoryEvidence
        || item.evidenceSummary.hasReviewNoteEvidence
        || item.evidenceSummary.hasDecisionDraftNoteEvidence
      )).length,
    );
    expect(candidateOverview.evidenceSummary.rowsWithAllEvidence).toBe(
      candidateOverview.rows.filter((item) => (
        item.evidenceSummary.hasPreferenceEvidence
        && item.evidenceSummary.hasStatusHistoryEvidence
        && item.evidenceSummary.hasReviewNoteEvidence
        && item.evidenceSummary.hasDecisionDraftNoteEvidence
      )).length,
    );
    expect(candidateOverview.evidenceSummary.rowsMissingEvidence).toBe(
      candidateOverview.rows.filter((item) => (
        !item.evidenceSummary.hasPreferenceEvidence
        && !item.evidenceSummary.hasStatusHistoryEvidence
        && !item.evidenceSummary.hasReviewNoteEvidence
        && !item.evidenceSummary.hasDecisionDraftNoteEvidence
      )).length,
    );
    expect(candidateOverview.evidenceSummary.bySource.preference.rowsWithEvidence).toBe(
      candidateOverview.rows.filter((item) => item.evidenceSummary.hasPreferenceEvidence).length,
    );
    expect(candidateOverview.evidenceSummary.bySource.statusHistory.rowsWithEvidence).toBe(
      candidateOverview.rows.filter((item) => item.evidenceSummary.hasStatusHistoryEvidence).length,
    );
    expect(candidateOverview.evidenceSummary.bySource.reviewNote.rowsWithEvidence).toBe(
      candidateOverview.rows.filter((item) => item.evidenceSummary.hasReviewNoteEvidence).length,
    );
    expect(candidateOverview.evidenceSummary.bySource.decisionDraftNote.rowsWithEvidence).toBe(
      candidateOverview.rows.filter((item) => item.evidenceSummary.hasDecisionDraftNoteEvidence).length,
    );
    expect(candidateOverview.evidenceSummary.bySource.preference.totalEvidenceCount).toBe(
      candidateOverview.rows.reduce((total, item) => total + item.evidenceSummary.preferenceEvidenceCount, 0),
    );
    expect(candidateOverview.evidenceSummary.bySource.statusHistory.totalEvidenceCount).toBe(
      candidateOverview.rows.reduce((total, item) => total + item.evidenceSummary.statusHistoryEvidenceCount, 0),
    );
    expect(candidateOverview.evidenceSummary.bySource.reviewNote.totalEvidenceCount).toBe(
      candidateOverview.rows.reduce((total, item) => total + item.evidenceSummary.reviewNoteEvidenceCount, 0),
    );
    expect(candidateOverview.evidenceSummary.bySource.decisionDraftNote.totalEvidenceCount).toBe(
      candidateOverview.rows.reduce((total, item) => total + item.evidenceSummary.decisionDraftNoteEvidenceCount, 0),
    );
    expect(candidateOverview.evidenceSummary.exposesPrivateBodies).toBe(false);
    expect(overviewFirstCandidate?.timelineEventCount).toBeGreaterThan(0);
    expect(overviewFirstCandidate?.notes.reviewNoteCount).toBeGreaterThan(0);
    expect(overviewFirstCandidate?.notes.latestReviewNoteAt).toBe(reviewNote.note.createdAt);
    expect(overviewFirstCandidate?.notes.decisionDraftNoteCount).toBeGreaterThan(0);
    expect(overviewFirstCandidate?.notes.latestDecisionDraftNoteAt).toBe(privateDecisionDraftNote.note.createdAt);
    expect(overviewFirstCandidate?.notes.latestPrivateReviewAt).toBe(
      Math.max(reviewNote.note.createdAt, privateDecisionDraftNote.note.createdAt),
    );
    expect(overviewFirstCandidate?.notes.hasReviewNotes).toBe(true);
    expect(overviewFirstCandidate?.notes.hasDecisionDraftNotes).toBe(true);
    expect(overviewFirstCandidate?.notes.freshnessState).toBe("current_private_review");
    expect(overviewFirstCandidate?.notes.isMissingPrivateReview).toBe(false);
    expect(overviewFirstCandidate?.notes.isStalePrivateReview).toBe(false);
    expect(overviewFirstCandidate?.notes.isOutpacedByCandidateUpdate).toBe(false);
    expect(overviewFirstCandidate?.notes.exposesPrivateBodies).toBe(false);
    expect(JSON.stringify(overviewFirstCandidate?.notes)).not.toContain("Keep the draft rationale local");
    expect(overviewFirstCandidate?.drilldowns.detail).toEqual({
      endpoint: "raven.recommendationCandidateDetail",
      input: { ravenSessionId: unlocked.session.id, candidateId: firstCandidate.id },
    });
    expect(overviewFirstCandidate?.drilldowns.timeline.endpoint).toBe("raven.recommendationCandidateTimeline");
    expect(overviewFirstCandidate?.drilldowns.timelineSearch.endpoint).toBe("raven.searchRecommendationCandidateTimeline");
    expect(overviewFirstCandidate?.drilldowns.reviewNotes.endpoint).toBe("raven.recommendationCandidateReviewNotes");
    expect(overviewFirstCandidate?.drilldowns.decisionDraftDetail.endpoint).toBe("raven.draftRecommendationCandidateReviewDecision");
    expect(overviewFirstCandidate?.drilldowns.decisionDraftNotes.endpoint).toBe("raven.recommendationCandidateDecisionDraftNotes");
    expect(candidateOverview.writesExternal).toBe(false);
    expect(candidateOverview.callsExternalModels).toBe(false);
    expect(candidateOverview.gates.join(" ")).toContain("derived only from local Raven candidates");

    const filteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      status: "kept",
      proposedStatus: "kept",
      readiness: "needs_more_private_review",
      eventKind: "decision_draft_note",
      limit: 10,
    });
    expect(filteredCandidateOverview.filters.status).toBe("kept");
    expect(filteredCandidateOverview.filters.proposedStatus).toBe("kept");
    expect(filteredCandidateOverview.filters.eventKind).toBe("decision_draft_note");
    expect(filteredCandidateOverview.rows.every((item) => item.status === "kept")).toBe(true);
    expect(filteredCandidateOverview.rows.every((item) => item.proposedStatus === "kept")).toBe(true);
    expect(filteredCandidateOverview.rows.every((item) => item.eventCounts.decision_draft_note > 0)).toBe(true);
    expect(filteredCandidateOverview.queue.total).toBe(filteredCandidateOverview.rows.length);

    const freshnessFilteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      reviewFreshness: "current_private_review",
      limit: 10,
    });
    expect(freshnessFilteredCandidateOverview.filters.reviewFreshness).toBe("current_private_review");
    expect(freshnessFilteredCandidateOverview.rows.map((item) => item.candidateId)).toContain(firstCandidate.id);
    expect(freshnessFilteredCandidateOverview.rows.every((item) => item.notes.freshnessState === "current_private_review")).toBe(true);
    expect(freshnessFilteredCandidateOverview.queue.total).toBe(freshnessFilteredCandidateOverview.rows.length);
    expect(freshnessFilteredCandidateOverview.review.byFreshnessState.current_private_review).toBe(freshnessFilteredCandidateOverview.rows.length);

    const riskFilteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      needsPrivateAttention: true,
      limit: 10,
    });
    expect(riskFilteredCandidateOverview.filters.needsPrivateAttention).toBe(true);
    expect(riskFilteredCandidateOverview.rows.every((item) => item.riskFlags.needsPrivateAttention)).toBe(true);
    expect(riskFilteredCandidateOverview.risk.needsPrivateAttention).toBe(riskFilteredCandidateOverview.rows.length);

    const combinedRiskFilteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      needsPrivateAttention: true,
      reviewFreshness: "current_private_review",
      limit: 10,
    });
    expect(combinedRiskFilteredCandidateOverview.filters.needsPrivateAttention).toBe(true);
    expect(combinedRiskFilteredCandidateOverview.filters.reviewFreshness).toBe("current_private_review");
    expect(combinedRiskFilteredCandidateOverview.rows.every((item) => item.riskFlags.needsPrivateAttention && item.notes.freshnessState === "current_private_review")).toBe(true);

    const mixedRiskFilteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      riskFlag: "mixed_preference_signals",
      limit: 10,
    });
    expect(mixedRiskFilteredCandidateOverview.filters.riskFlag).toBe("mixed_preference_signals");
    expect(mixedRiskFilteredCandidateOverview.rows.every((item) => item.riskFlags.hasMixedPreferenceSignals)).toBe(true);
    expect(mixedRiskFilteredCandidateOverview.risk.byFlag.mixed_preference_signals).toBe(mixedRiskFilteredCandidateOverview.rows.length);

    const evidenceFilteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      evidenceSource: "review_note",
      limit: 10,
    });
    expect(evidenceFilteredCandidateOverview.filters.evidenceSource).toBe("review_note");
    expect(evidenceFilteredCandidateOverview.rows.every((item) => item.evidenceSummary.hasReviewNoteEvidence)).toBe(true);
    expect(evidenceFilteredCandidateOverview.evidenceSummary.bySource.reviewNote.rowsWithEvidence).toBe(
      evidenceFilteredCandidateOverview.rows.length,
    );
    expect(evidenceFilteredCandidateOverview.evidenceSummary.exposesPrivateBodies).toBe(false);

    const missingEvidenceFilteredCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      missingEvidenceSource: "review_note",
      limit: 10,
    });
    expect(missingEvidenceFilteredCandidateOverview.filters.missingEvidenceSource).toBe("review_note");
    expect(missingEvidenceFilteredCandidateOverview.rows.every((item) => !item.evidenceSummary.hasReviewNoteEvidence)).toBe(true);
    expect(missingEvidenceFilteredCandidateOverview.evidenceSummary.bySource.reviewNote.rowsWithEvidence).toBe(0);
    expect(missingEvidenceFilteredCandidateOverview.evidenceSummary.exposesPrivateBodies).toBe(false);

    const evidencePresetCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      evidencePreset: "complete_evidence",
      limit: 10,
    });
    expect(evidencePresetCandidateOverview.filters.evidencePreset).toBe("complete_evidence");
    expect(evidencePresetCandidateOverview.evidenceReceipt.activeEvidenceFilters).toEqual({
      evidenceSource: null,
      missingEvidenceSource: null,
      evidencePreset: "complete_evidence",
    });
    expect(evidencePresetCandidateOverview.evidenceReceipt.matchingRowCount).toBe(evidencePresetCandidateOverview.rows.length);
    expect(evidencePresetCandidateOverview.evidenceReceipt.summaryLabels).toEqual(["complete"]);
    expect(evidencePresetCandidateOverview.evidenceReceipt.summaryLabelDrilldowns.complete).toEqual({
      endpoint: "raven.recommendationCandidateOverview",
      input: { ravenSessionId: unlocked.session.id, evidencePreset: "complete_evidence" },
    });
    expect(evidencePresetCandidateOverview.evidenceReceipt.exposesPrivateBodies).toBe(false);
    expect(evidencePresetCandidateOverview.rows.every((item) => (
      item.evidenceSummary.hasPreferenceEvidence
      && item.evidenceSummary.hasStatusHistoryEvidence
      && item.evidenceSummary.hasReviewNoteEvidence
      && item.evidenceSummary.hasDecisionDraftNoteEvidence
    ))).toBe(true);
    expect(evidencePresetCandidateOverview.evidenceSummary.rowsWithAllEvidence).toBe(evidencePresetCandidateOverview.rows.length);
    expect(evidencePresetCandidateOverview.evidenceSummary.exposesPrivateBodies).toBe(false);

    const contradictoryEvidenceCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      evidenceSource: "review_note",
      missingEvidenceSource: "review_note",
      limit: 10,
    });
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.activeEvidenceFilters).toEqual({
      evidenceSource: "review_note",
      missingEvidenceSource: "review_note",
      evidencePreset: null,
    });
    expect(contradictoryEvidenceCandidateOverview.rows).toHaveLength(0);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.matchingRowCount).toBe(0);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.warnings).toEqual([
      "contradictory_evidence_source_filters",
      "empty_evidence_queue",
    ]);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.recommendations).toEqual([
      {
        id: "clear_missing_evidence_source",
        reason: "contradictory_evidence_source_filters",
        endpoint: "raven.recommendationCandidateOverview",
        input: { ravenSessionId: unlocked.session.id, evidenceSource: "review_note" },
      },
      {
        id: "inspect_complete_evidence",
        reason: "empty_evidence_queue",
        endpoint: "raven.recommendationCandidateOverview",
        input: { ravenSessionId: unlocked.session.id, evidencePreset: "complete_evidence" },
      },
      {
        id: "inspect_missing_review_evidence",
        reason: "missing_review_note_coverage",
        endpoint: "raven.recommendationCandidateOverview",
        input: { ravenSessionId: unlocked.session.id, evidencePreset: "missing_review_evidence" },
      },
      {
        id: "inspect_missing_decision_rationale",
        reason: "missing_decision_draft_note_coverage",
        endpoint: "raven.recommendationCandidateOverview",
        input: { ravenSessionId: unlocked.session.id, evidencePreset: "missing_decision_rationale" },
      },
    ]);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.summaryLabels).toEqual(["contradictory", "empty"]);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.summaryLabelDrilldowns.contradictory).toEqual({
      endpoint: "raven.recommendationCandidateOverview",
      input: { ravenSessionId: unlocked.session.id, evidenceSource: "review_note" },
    });
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.summaryLabelDrilldowns.empty).toEqual({
      endpoint: "raven.recommendationCandidateOverview",
      input: { ravenSessionId: unlocked.session.id },
    });
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.actionManifest.activeWarningCount).toBe(2);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.actionManifest.activeRecommendationCount).toBe(4);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.actionManifest.activeSummaryLabelCount).toBe(2);
    expect(contradictoryEvidenceCandidateOverview.evidenceReceipt.exposesPrivateBodies).toBe(false);

    const presetCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      preset: "has_decision_rationale",
      limit: 10,
    });
    expect(presetCandidateOverview.filters.preset).toBe("has_decision_rationale");
    expect(presetCandidateOverview.rows.every((item) => item.eventCounts.decision_draft_note > 0)).toBe(true);
    expect(presetCandidateOverview.queue.total).toBe(presetCandidateOverview.rows.length);

    const timelineSortedCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      sortBy: "timeline_event_count",
      sortDirection: "desc",
      limit: 10,
    });
    expect(timelineSortedCandidateOverview.sort).toEqual({ by: "timeline_event_count", direction: "desc" });
    expect(
      timelineSortedCandidateOverview.rows.every((item, index, rows) => index === 0 || rows[index - 1].timelineEventCount >= item.timelineEventCount),
    ).toBe(true);

    const confidenceRank = (confidence: string) => (confidence === "high" ? 3 : confidence === "medium" ? 2 : confidence === "low" ? 1 : 0);
    const confidenceSortedCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      sortBy: "confidence",
      sortDirection: "asc",
      limit: 10,
    });
    expect(confidenceSortedCandidateOverview.sort).toEqual({ by: "confidence", direction: "asc" });
    expect(
      confidenceSortedCandidateOverview.rows.every((item, index, rows) => index === 0 || confidenceRank(rows[index - 1].confidence) <= confidenceRank(item.confidence)),
    ).toBe(true);

    const readinessRank = (readiness: string) => (readiness === "ready_for_private_status_review" ? 1 : 0);
    const readinessSortedCandidateOverview = await caller.raven.recommendationCandidateOverview({
      ravenSessionId: unlocked.session.id,
      sortBy: "readiness",
      sortDirection: "desc",
      limit: 10,
    });
    expect(readinessSortedCandidateOverview.sort).toEqual({ by: "readiness", direction: "desc" });
    expect(
      readinessSortedCandidateOverview.rows.every((item, index, rows) => index === 0 || readinessRank(rows[index - 1].readiness) >= readinessRank(item.readiness)),
    ).toBe(true);

    const privateDecisionDraftNoteSearch = await caller.raven.searchRecommendationCandidateDecisionDraftNotes({
      ravenSessionId: unlocked.session.id,
      query: "rationale",
      proposedStatus: "kept",
      limit: 10,
    });
    expect(privateDecisionDraftNoteSearch.mode).toBe("private_read");
    expect(privateDecisionDraftNoteSearch.filters.proposedStatus).toBe("kept");
    expect(privateDecisionDraftNoteSearch.items.map((item) => item.note.id)).toContain(privateDecisionDraftNote.note.id);
    expect(privateDecisionDraftNoteSearch.items.every((item) => item.note.proposedStatus === "kept")).toBe(true);
    expect(privateDecisionDraftNoteSearch.items[0]?.snippet).toContain("rationale");
    expect(privateDecisionDraftNoteSearch.writesExternal).toBe(false);
    expect(privateDecisionDraftNoteSearch.callsExternalModels).toBe(false);
    expect(privateDecisionDraftNoteSearch.gates.join(" ")).toContain("reads only Raven decision draft note tables");

    const scrub = await caller.raven.scrubPrivateText({
      ravenSessionId: unlocked.session.id,
      targetKind: "free_text",
      body: "Private note from test@example.com with https://example.com and /Users/lindsaybell/private/file.txt",
    });
    expect(scrub.ok).toBe(true);
    expect(scrub.receipt.scrubbedBody).toContain("[email]");
    expect(scrub.receipt.scrubbedBody).toContain("[url]");
    expect(scrub.receipt.scrubbedBody).toContain("[local_path]");
    expect(scrub.receipt.findingLabels).toContain("email");
    expect(scrub.receipt.severity).toBe("medium");
    expect(scrub.writesExternal).toBe(false);

    const highRiskScrub = await caller.raven.scrubPrivateText({
      ravenSessionId: unlocked.session.id,
      targetKind: "free_text",
      body: "token=abc123 and card 4111 1111 1111 1111",
    });
    expect(highRiskScrub.receipt.scrubbedBody).toContain("[secret_like]");
    expect(highRiskScrub.receipt.scrubbedBody).toContain("[financial_id]");
    expect(highRiskScrub.receipt.findingLabels).toContain("secret-like text");
    expect(highRiskScrub.receipt.severity).toBe("high");

    const proposal = await caller.raven.proposeBridgeExport({
      ravenSessionId: unlocked.session.id,
      sourceEventId: event.event.id,
      target: "gojo_moodboard",
      title: "Private visual direction",
      summary: "Moodboard seed from test@example.com and https://example.com. Keep it private until approved.",
    });
    expect(proposal.ok).toBe(true);
    expect(proposal.approvalRequired).toBe(true);
    expect(proposal.proposal.status).toBe("queued_for_approval");
    expect(proposal.proposal.summary).toContain("[email]");
    expect(proposal.proposal.summary).toContain("[url]");
    expect(proposal.proposal.approvalRequired).toContain("Explicit user approval");
    expect(proposal.approvalId).toBeGreaterThan(0);
    expect(proposal.permissionPreflightId).toBeGreaterThan(0);
    expect(proposal.writesCoreMemory).toBe(false);
    expect(proposal.writesExternal).toBe(false);

    const ravenQueue = await caller.approvals.list({
      origin: "raven",
      status: "pending",
      limit: 10,
    });
    expect(ravenQueue.mode).toBe("read_only");
    expect(ravenQueue.summary.raven).toBeGreaterThan(0);
    const queuedRaven = ravenQueue.items.find((item) => item.id === proposal.approvalId);
    expect(queuedRaven?.origin).toBe("raven");
    expect(queuedRaven?.targetLabel).toBe("Private visual direction");
    expect(queuedRaven?.validationPreview.oakNotes.join(" ")).toContain("sealed private scope");
    expect(queuedRaven?.permissionPreflight?.decision).toBe("blocked_by_hard_gate");

    const proposalRows = await caller.raven.bridgeProposals({
      ravenSessionId: unlocked.session.id,
      status: "queued_for_approval",
      limit: 10,
    });
    expect(proposalRows.items.map((item) => item.id)).toContain(proposal.proposal.id);

    const detail = await caller.raven.bridgeProposalDetail({
      ravenSessionId: unlocked.session.id,
      proposalId: proposal.proposal.id,
    });
    expect(detail.mode).toBe("private_read");
    expect(detail.proposal.id).toBe(proposal.proposal.id);
    expect(detail.scrubReceipt?.scrubbedBody).toContain("[email]");
    expect(detail.sourceEvent?.id).toBe(event.event.id);
    expect(detail.approvalPreview?.id).toBe(proposal.approvalId);
    expect(detail.permissionPreflight?.decision).toBe("blocked_by_hard_gate");
    expect(detail.history[0]?.toStatus).toBe("queued_for_approval");
    expect(detail.approvesExport).toBe(false);

    const revised = await caller.raven.updateBridgeProposalStatus({
      ravenSessionId: unlocked.session.id,
      proposalId: proposal.proposal.id,
      status: "needs_revision",
      reason: "Needs a narrower summary before any approval.",
    });
    expect(revised.ok).toBe(true);
    expect(revised.proposal.status).toBe("needs_revision");
    expect(revised.approvesExport).toBe(false);
    expect(revised.writesCoreMemory).toBe(false);

    const revisedDetail = await caller.raven.bridgeProposalDetail({
      ravenSessionId: unlocked.session.id,
      proposalId: proposal.proposal.id,
    });
    expect(revisedDetail.history.map((item) => item.toStatus)).toContain("needs_revision");
    expect(revisedDetail.history.find((item) => item.toStatus === "needs_revision")?.reason).toContain("narrower summary");

    const cancelled = await caller.raven.updateBridgeProposalStatus({
      ravenSessionId: unlocked.session.id,
      proposalId: proposal.proposal.id,
      status: "cancelled",
      reason: "Cancel local proposal preview.",
    });
    expect(cancelled.ok).toBe(true);
    expect(cancelled.proposal.status).toBe("cancelled");
    expect(cancelled.approvesExport).toBe(false);
    const cancelledQueue = await caller.approvals.list({
      origin: "raven",
      status: "cancelled",
      limit: 10,
    });
    expect(cancelledQueue.items.find((item) => item.id === proposal.approvalId)?.status).toBe("cancelled");

    const locked = await caller.raven.lock({
      ravenSessionId: unlocked.session.id,
      phrase: "we’re done here",
    });
    expect(locked.ok).toBe(true);
    expect(locked.status).toBe("sealed");
  });

  it("routes risky web and repo targets through Spock before Surfer or Tony act", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.securityGate.plan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.ownerAgent).toBe("spock");
    expect(plan.routeChain.join(" ")).toContain("Spock gates");
    expect(plan.protectedSurfaces).toContain("GitHub repos.");
    expect(plan.browserBaseline.popupBlocking).toBe(true);

    const repo = await caller.securityGate.inspectTarget({
      target: "https://github.com/DataDog/guarddog",
    });
    expect(repo.opensBrowser).toBe(false);
    expect(repo.clonesRepo).toBe(false);
    expect(repo.executesCommand).toBe(false);
    expect(repo.receipt.targetKind).toBe("github_repo");
    expect(repo.receipt.riskLevel).toBe("medium");
    expect(repo.receipt.blockedActions.join(" ")).toContain("No npm install");
    expect(repo.receipt.checks.join(" ")).toContain("Run Scorecard");

    const animeSite = await caller.securityGate.inspectTarget({
      target: "https://watch-anime-example.test/free-download-login",
    });
    expect(animeSite.receipt.targetKind).toBe("browser_site");
    expect(animeSite.receipt.riskLevel).toBe("high");
    expect(animeSite.receipt.browserPolicy.popupBlocking).toBe(true);
    expect(animeSite.receipt.browserPolicy.blockCredentialEntry).toBe(true);
    expect(animeSite.receipt.allowedActions.join(" ")).toContain("isolated browser profile");

    const review = await caller.securityGate.createReview({
      target: "https://watch-anime-example.test/free-download-login",
    });
    expect(review.ok).toBe(true);
    expect(review.appendOnly).toBe(true);
    expect(review.opensBrowser).toBe(false);
    expect(review.downloadsFile).toBe(false);
    expect(review.executesCommand).toBe(false);
    expect(review.permissionPreflightId).toBeGreaterThan(0);
    expect(review.review?.ownerAgent).toBe("spock");
    expect(review.review?.riskLevel).toBe("high");
    expect(review.gates.join(" ")).toContain("did not open a browser");

    const recent = await caller.securityGate.recent({ limit: 5 });
    expect(recent.mode).toBe("read_only");
    expect(recent.appendOnly).toBe(true);
    expect(recent.items.map((item) => item.id)).toContain(review.review?.id);

    const intake = await caller.commandIntake.preview({
      text: "is this github repo safe or malware",
      mode: "quick",
    });
    expect(intake.category).toBe("security_review");
    expect(intake.projectMode).toBe("QA");
    expect(intake.agents).toContain("spock");
    expect(intake.agents).toContain("surfer");
    expect(intake.permissionGates.join(" ")).toContain("Spock security receipt");
  });

  it("defines the modular workbench without opening tools or writing externally", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.workbench.plan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.writesExternal).toBe(false);
    expect(plan.opensBrowser).toBe(false);
    expect(plan.capturesMedia).toBe(false);
    expect(plan.surfaces.map((surface) => surface.id)).toContain("annotation_canvas");
    expect(plan.surfaces.map((surface) => surface.id)).toContain("localhost_preview");
    const comparisonSurface = plan.surfaces.find((surface) => surface.id === "before_after");
    expect(comparisonSurface?.status).toBe("partially_live");
    const imageSurface = plan.surfaces.find((surface) => surface.id === "image_video_review");
    expect(imageSurface?.status).toBe("partially_live");
    expect(imageSurface?.permission).toContain("Temporary image/video previews");
    expect(plan.evidenceRecordShape.appendOnly).toBe(true);
    expect(plan.gates.join(" ")).toContain("does not open a browser");

    const evidence = await caller.workbench.createEvidence({
      kind: "manual_note",
      title: "Visible issue note",
      summary: "The workbench can record what the user points at without capturing media yet.",
      targetUri: "panel:workbench",
      ownerAgent: "gojo",
      routeAgent: "spock",
      viewport: "1440x900",
      coordinates: "x=120 y=80 w=300 h=140",
      annotationText: "Inspect this visible issue before any automation exists.",
      permissionClass: "manual_note",
    });
    expect(evidence.ok).toBe(true);
    expect(evidence.appendOnly).toBe(true);
    expect(evidence.writesExternal).toBe(false);
    expect(evidence.opensBrowser).toBe(false);
    expect(evidence.capturesMedia).toBe(false);
    expect(evidence.evidence.validationStatus).toBe("unvalidated");
    expect(evidence.evidence.coordinates).toContain("x=120");
    expect(evidence.evidence.permissionPreflightId).toBeGreaterThan(0);
    expect(evidence.permissionPreflightId).toBe(evidence.evidence.permissionPreflightId);

    const imageEvidence = await caller.workbench.createEvidence({
      kind: "image_review",
      title: "Temporary screenshot review",
      summary: "Metadata-only note for a temporary image preview. Image bytes were not saved.",
      targetUri: "temporary-image:settings-screen.png",
      ownerAgent: "gojo",
      routeAgent: "oak",
      mediaName: "settings-screen.png",
      mediaMimeType: "image/png",
      mediaByteSize: 24000,
      mediaKind: "image",
      mediaTemporary: true,
      permissionClass: "media_review",
    });
    expect(imageEvidence.ok).toBe(true);
    expect(imageEvidence.writesExternal).toBe(false);
    expect(imageEvidence.capturesMedia).toBe(false);
    expect(imageEvidence.evidence.kind).toBe("image_review");
    expect(imageEvidence.evidence.permissionClass).toBe("media_review");
    expect(imageEvidence.evidence.mediaName).toBe("settings-screen.png");
    expect(imageEvidence.evidence.mediaMimeType).toBe("image/png");
    expect(imageEvidence.evidence.mediaByteSize).toBe(24000);
    expect(imageEvidence.evidence.mediaKind).toBe("image");
    expect(imageEvidence.evidence.mediaTemporary).toBe(true);
    expect(imageEvidence.evidence.permissionPreflightId).toBeGreaterThan(0);

    const videoFrameEvidence = await caller.workbench.createEvidence({
      kind: "video_frame",
      title: "Temporary video frame review",
      summary: "Metadata-only note for a temporary video frame. Video bytes were not saved.",
      targetUri: "temporary-video:flow-recording.mov",
      ownerAgent: "gojo",
      routeAgent: "spock",
      mediaName: "flow-recording.mov",
      mediaMimeType: "video/quicktime",
      mediaByteSize: 54000,
      mediaKind: "video_frame",
      mediaFrameTimeSec: 12.5,
      mediaDurationSec: 43.25,
      mediaTemporary: true,
      permissionClass: "media_review",
    });
    expect(videoFrameEvidence.ok).toBe(true);
    expect(videoFrameEvidence.writesExternal).toBe(false);
    expect(videoFrameEvidence.capturesMedia).toBe(false);
    expect(videoFrameEvidence.evidence.kind).toBe("video_frame");
    expect(videoFrameEvidence.evidence.mediaKind).toBe("video_frame");
    expect(videoFrameEvidence.evidence.mediaFrameTimeSec).toBe(12.5);
    expect(videoFrameEvidence.evidence.mediaDurationSec).toBe(43.25);
    expect(videoFrameEvidence.evidence.mediaTemporary).toBe(true);
    expect(videoFrameEvidence.gates.join(" ")).toContain("did not capture a screenshot");

    const comparison = await caller.workbench.createBeforeAfterComparison({
      beforeEvidenceId: imageEvidence.evidence.id,
      afterEvidenceId: videoFrameEvidence.evidence.id,
      title: "Media review before/after",
      summary: "Compare the image review note with the video-frame note without opening either target.",
      result: "Needs Spock review before reuse.",
      routeAgent: "spock",
    });
    expect(comparison.ok).toBe(true);
    expect(comparison.writesExternal).toBe(false);
    expect(comparison.opensBrowser).toBe(false);
    expect(comparison.capturesMedia).toBe(false);
    if (comparison.ok) {
      expect(comparison.evidence.kind).toBe("before_after");
      expect(comparison.evidence.beforeEvidenceId).toBe(imageEvidence.evidence.id);
      expect(comparison.evidence.afterEvidenceId).toBe(videoFrameEvidence.evidence.id);
      expect(comparison.evidence.comparisonResult).toContain("Spock review");
      expect(comparison.evidence.targetUri).toBe(`before:${imageEvidence.evidence.id};after:${videoFrameEvidence.evidence.id}`);
      expect(comparison.evidence.permissionPreflightId).toBeGreaterThan(0);
      expect(comparison.gates.join(" ")).toContain("compared evidence records were not overwritten");
    }

    const records = await caller.workbench.evidence({
      query: "visible issue",
      limit: 10,
    });
    expect(records.mode).toBe("read_only");
    expect(records.appendOnly).toBe(true);
    expect(records.writesExternal).toBe(false);
    expect(records.items.map((item) => item.id)).toContain(evidence.evidence.id);

    const picker = await caller.workbench.evidencePicker({
      query: "video frame",
      excludeId: imageEvidence.evidence.id,
      limit: 20,
    });
    expect(picker.mode).toBe("read_only");
    expect(picker.appendOnly).toBe(true);
    expect(picker.writesExternal).toBe(false);
    expect(picker.opensBrowser).toBe(false);
    expect(picker.capturesMedia).toBe(false);
    expect(picker.executesCommand).toBe(false);
    expect(picker.items.map((item) => item.id)).toContain(videoFrameEvidence.evidence.id);
    expect(picker.items.map((item) => item.id)).not.toContain(imageEvidence.evidence.id);
    expect(picker.summary.media).toBeGreaterThan(0);
    expect(picker.gates.join(" ")).toContain("does not open linked targets");

    const detail = await caller.workbench.evidenceDetail({ id: evidence.evidence.id });
    expect(detail.found).toBe(true);
    expect(detail.opensBrowser).toBe(false);
    expect(detail.capturesMedia).toBe(false);
    if (detail.found) {
      expect(detail.evidence.routeAgent).toBe("spock");
      expect(detail.evidence.viewport).toBe("1440x900");
      expect(detail.evidence.annotationText).toContain("visible issue");
      expect(detail.permissionPreflight?.id).toBe(evidence.permissionPreflightId);
      expect(detail.permissionPreflight?.decision).toBe("allowed_local");
      expect(detail.permissionPreflight?.reasons.join(" ")).toContain("Workbench evidence");
      expect(detail.gates.join(" ")).toContain("reads local append-only evidence only");
    }

    const linkOptions = await caller.workbench.linkOptions();
    expect(linkOptions.mode).toBe("read_only");
    expect(linkOptions.writesExternal).toBe(false);
    expect(linkOptions.opensBrowser).toBe(false);
    expect(linkOptions.executesCommand).toBe(false);
    expect(Array.isArray(linkOptions.tasks)).toBe(true);
    expect(Array.isArray(linkOptions.sessions)).toBe(true);
    expect(Array.isArray(linkOptions.artifacts)).toBe(true);
    expect(linkOptions.gates.join(" ")).toContain("does not fetch it");

    const validationNote = await caller.workbench.createValidationNote({
      evidenceId: evidence.evidence.id,
      validatorAgent: "oak",
      status: "needs_review",
      note: "Local validation note only. Check the referenced evidence before reuse.",
    });
    expect(validationNote.ok).toBe(true);
    expect(validationNote.writesExternal).toBe(false);
    expect(validationNote.opensBrowser).toBe(false);
    expect(validationNote.capturesMedia).toBe(false);
    if (validationNote.ok) {
      expect(validationNote.evidence.kind).toBe("validation_note");
      expect(validationNote.evidence.targetUri).toBe(`evidence:${evidence.evidence.id}`);
      expect(validationNote.evidence.validationStatus).toBe("needs_review");
      expect(validationNote.evidence.permissionPreflightId).toBeGreaterThan(0);
      expect(validationNote.evidence.permissionPreflightId).not.toBe(evidence.permissionPreflightId);
      expect(validationNote.permissionPreflightId).toBe(validationNote.evidence.permissionPreflightId);
      expect(validationNote.gates.join(" ")).toContain("original evidence record was not overwritten");
      expect(validationNote.gates.join(" ")).toContain("permission preflight audit row");
    }

    const grouped = await caller.workbench.evidenceGroups({
      groupBy: "validation_status",
      query: "visible issue",
    });
    expect(grouped.mode).toBe("read_only");
    expect(grouped.appendOnly).toBe(true);
    expect(grouped.writesExternal).toBe(false);
    expect(grouped.opensBrowser).toBe(false);
    expect(grouped.executesCommand).toBe(false);
    expect(grouped.groups.map((group) => group.key)).toContain("unvalidated");
    expect(grouped.gates.join(" ")).toContain("do not fetch sources or execute commands");

    const taskGroups = await caller.workbench.evidenceGroups({
      groupBy: "task",
      query: "visible issue",
    });
    expect(taskGroups.mode).toBe("read_only");
    expect(taskGroups.groups.map((group) => group.key)).toContain("unlinked");

    const detailWithHistory = await caller.workbench.evidenceDetail({ id: evidence.evidence.id });
    expect(detailWithHistory.found).toBe(true);
    if (detailWithHistory.found) {
      expect(detailWithHistory.validationHistory.map((item) => item.id)).toContain(validationNote.ok ? validationNote.evidence.id : -1);
      expect(detailWithHistory.validationHistory[0]?.targetUri).toBe(`evidence:${evidence.evidence.id}`);
      expect(detailWithHistory.validationHistory[0]?.permissionPreflightId).toBe(validationNote.ok ? validationNote.evidence.permissionPreflightId : -1);
    }

    const comparisonDetail = await caller.workbench.evidenceDetail({ id: imageEvidence.evidence.id });
    expect(comparisonDetail.found).toBe(true);
    if (comparisonDetail.found) {
      expect(comparisonDetail.comparisonHistory.map((item) => item.id)).toContain(comparison.ok ? comparison.evidence.id : -1);
      expect(comparisonDetail.comparisonHistory[0]?.beforeEvidenceId).toBe(imageEvidence.evidence.id);
      expect(comparisonDetail.comparisonHistory[0]?.afterEvidenceId).toBe(videoFrameEvidence.evidence.id);
    }
  });

  it("defines the Aang Companion event policy without desktop side effects", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const policy = await caller.companion.policy();
    expect(policy.mode).toBe("proposal_only");
    expect(policy.startsDesktopProcess).toBe(false);
    expect(policy.sendsNotifications).toBe(false);
    expect(policy.readsScreen).toBe(false);
    expect(policy.routedBy).toBe("cortana");
    expect(policy.allowedEvents.map((event) => event.id)).toContain("pending_approval");
    expect(policy.blockedEvents).toContain("Slack reads or writes");
    expect(policy.shellOptions.find((option) => option.id === "web_mock")?.status).toBe("recommended_first");

    const events = await caller.companion.localEvents();
    expect(events.mode).toBe("read_only");
    expect(events.writesExternal).toBe(false);
    expect(events.sendsNotifications).toBe(false);
    expect(events.startsDesktopProcess).toBe(false);
    expect(events.events.map((event) => event.id)).toContain("pending_approval");
    expect(events.events.map((event) => event.id)).toContain("workbench_evidence");
    expect(events.gates.join(" ")).toContain("do not notify");
  });

  it("records local design review state without opening tools", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.designReview.plan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.writesExternal).toBe(false);
    expect(plan.opensBrowser).toBe(false);
    expect(plan.capturesMedia).toBe(false);
    expect(plan.executesCommand).toBe(false);
    expect(plan.sourceFiles).toContain("DESIGN.md");
    expect(plan.routeChain[0]).toContain("Aang");
    expect(plan.checklist.map((item) => item.key)).toContain("generic_ui_checked");

    const review = await caller.designReview.create({
      targetType: "workbench",
      targetLabel: "Workbench evidence detail",
      status: "ready_for_patch",
      checklist: ["design_md_loaded", "generic_ui_checked", "proof_visible"],
      violations: ["Proof is present but Gojo review is not visible in the app yet."],
      nextActions: ["Expose Design Review as a first-class panel."],
      proofSummary: "Read DESIGN.md and recorded the review as local state only.",
    });
    expect(review.ok).toBe(true);
    expect(review.appendOnly).toBe(true);
    expect(review.writesExternal).toBe(false);
    expect(review.opensBrowser).toBe(false);
    expect(review.capturesMedia).toBe(false);
    expect(review.executesCommand).toBe(false);
    expect(review.review.routeChain).toContain("Aang reads mode");
    expect(review.review.checklistScore).toBe("3/10");
    expect(review.permissionPreflightId).toBeGreaterThan(0);

    const reviews = await caller.designReview.list({ limit: 10 });
    expect(reviews.mode).toBe("read_only");
    expect(reviews.writesExternal).toBe(false);
    expect(reviews.items.map((item) => item.id)).toContain(review.review.id);
  });

  it("shows Aang to Cortana routing and design protocol in intake preview", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const preview = await caller.commandIntake.preview({
      text: "Use the new DESIGN.md rules to fix the generic CereBro Workbench UI.",
      mode: "build",
    });
    expect(preview.mode).toBe("proposal_only");
    expect(preview.category).toBe("project_design");
    expect(preview.routeChain[0]).toBe("Aang reads mode");
    expect(preview.routeChain[1]).toBe("Cortana routes");
    expect(preview.designProtocol?.required).toBe(true);
    expect(preview.designProtocol?.checklist.join(" ")).toContain("DESIGN.md");
    expect(preview.agents).toContain("gojo");
  });
});

describe("CereBro file lifecycle metadata", () => {
  it("defines a canonical vault layout including Obsidian, creative, messages, and trash staging", () => {
    const layout = getVaultLayout();
    const keys = layout.map((entry) => entry.key);

    expect(keys).toContain("obsidian");
    expect(keys).toContain("creativeImages");
    expect(keys).toContain("creativeVideo");
    expect(keys).toContain("messages");
    expect(keys).toContain("trashStaging");
  });

  it("keeps Obsidian unconfigured when no vault or explicit Obsidian path is set", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    delete process.env.CEREBRO_VAULT_DIR;
    delete process.env.CEREBRO_OBSIDIAN_DIR;

    try {
      await expect(getObsidianStatus()).resolves.toMatchObject({
        configured: false,
        obsidianDir: null,
        exists: false,
        source: "none",
      });
    } finally {
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
    }
  });

  it("writes approved Obsidian notes into the configured vault path", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    const dir = fs.mkdtempSync(path.join(process.cwd(), "tmp-obsidian-"));
    process.env.CEREBRO_OBSIDIAN_DIR = dir;
    delete process.env.CEREBRO_VAULT_DIR;

    try {
      const written = await writeObsidianNote({
        title: "Hello CereBro",
        body: "# Hello CereBro\n\nTest note.",
        subdir: "20_Knowledge/Learning",
      });

      expect(written.ok).toBe(true);
      expect(written.relativePath).toBe("20_Knowledge/Learning/hello-cerebro.md");
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toContain("Test note.");

      const second = await writeObsidianNote({
        title: "Hello CereBro",
        body: "# Hello CereBro\n\nSecond note.",
        subdir: "20_Knowledge/Learning",
      });
      expect(second.ok).toBe(true);
      expect(second.relativePath).toMatch(/^20_Knowledge\/Learning\/hello-cerebro-\d{14}\.md$/);
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toContain("Test note.");
      expect(fs.readFileSync(path.join(dir, second.relativePath!), "utf8")).toContain("Second note.");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
    }
  });

  it("documents the Obsidian write and retrieval lanes CereBro should use", () => {
    const routes = getObsidianKnowledgeRoutes();
    const routePaths = routes.map((route) => route.relativePath);

    expect(routePaths).toEqual([
      "00_Atlas",
      "10_Projects",
      "20_Knowledge",
      "60_Media",
      "80_Templates",
      "90_Archive",
    ]);
    expect(routes.find((route) => route.relativePath === "90_Archive")?.retrievalDefault).toBe("archive_only");
    expect(routes.find((route) => route.relativePath === "20_Knowledge")?.retrievalDefault).toBe("include_when_validated");
    expect(OBSIDIAN_RETRIEVAL_METADATA_FIELDS).toContain("retrieval_status");
    expect(OBSIDIAN_RETRIEVAL_METADATA_FIELDS).toContain("llm_summary");
  });

  it("writes text artifacts into configured vault folders without touching the real vault", async () => {
    const prevVault = process.env.CEREBRO_VAULT_DIR;
    const prevObsidian = process.env.CEREBRO_OBSIDIAN_DIR;
    const dir = fs.mkdtempSync(path.join(process.cwd(), "tmp-vault-"));
    process.env.CEREBRO_VAULT_DIR = dir;
    delete process.env.CEREBRO_OBSIDIAN_DIR;

    try {
      const written = await writeVaultTextArtifact({
        relativeDir: "06_Messages/drafts",
        title: "Follow Up",
        body: "Draft message.",
        ext: "md",
      });

      expect(written.ok).toBe(true);
      expect(written.relativePath).toBe("06_Messages/drafts/follow-up.md");
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toBe("Draft message.");

      const second = await writeVaultTextArtifact({
        relativeDir: "06_Messages/drafts",
        title: "Follow Up",
        body: "Second draft message.",
        ext: "md",
      });
      expect(second.ok).toBe(true);
      expect(second.relativePath).toMatch(/^06_Messages\/drafts\/follow-up-\d{14}\.md$/);
      expect(fs.readFileSync(path.join(dir, written.relativePath!), "utf8")).toBe("Draft message.");
      expect(fs.readFileSync(path.join(dir, second.relativePath!), "utf8")).toBe("Second draft message.");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      if (prevVault === undefined) delete process.env.CEREBRO_VAULT_DIR;
      else process.env.CEREBRO_VAULT_DIR = prevVault;
      if (prevObsidian === undefined) delete process.env.CEREBRO_OBSIDIAN_DIR;
      else process.env.CEREBRO_OBSIDIAN_DIR = prevObsidian;
    }
  });
});

describe("Hedwig capture planning", () => {
  it("keeps Slack/Notion capture proposal-only until approved connections exist", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.hedwig.capturePlan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.notionDatabase.envVar).toBe("NOTION_CAPTURE_DATABASE_ID");
    expect(plan.slackProposal.recommendedShape).toBe("both_dm_and_capture_channel");

    const preview = await caller.hedwig.previewCapture({
      text: "Save this for Declyne later https://example.com/plaid-notes",
      sourceLabel: "slack:capture",
    });
    expect(preview.writesExternal).toBe(false);
    expect(preview.persistedLocalObservation).toBe(true);
    expect(preview.observationId).toBeGreaterThan(0);
    expect(preview.captureType).toBe("link");
    expect(preview.projectGuess).toBe("Declyne");
    expect(preview.proposedNotionRow["Source URI"]).toBe("https://example.com/plaid-notes");

    const observations = await caller.hedwig.observations({ limit: 5 });
    expect(observations.map((item) => item.id)).toContain(preview.observationId);
    expect(observations.find((item) => item.id === preview.observationId)?.source).toBe("hedwig_preview");

    const triage = await caller.hedwig.triageObservation({ id: preview.observationId });
    expect(triage.found).toBe(true);
    expect(triage.writesExternal).toBe(false);
    if (triage.found) {
      expect(triage.recommendedRoute).toBe("source");
      expect(triage.sourceDraft?.uri).toBe("https://example.com/plaid-notes");
      expect(triage.gates.join(" ")).toContain("does not write to Notion");
    }

    const created = await caller.hedwig.createTaskFromObservation({ id: preview.observationId });
    expect(created.ok).toBe(true);
    expect(created.writesExternal).toBe(false);
    if (created.ok) {
      expect(created.task.title).toContain("Triage capture:");
      expect(created.task.agent).toBe("surfer");
      expect(created.observation?.status).toBe("tasked");
      expect(created.observation?.taskId).toBe(created.task.id);
    }

    const sourcePreview = await caller.hedwig.previewCapture({
      text: "Save this for CereBro sources https://example.com/source-card",
      sourceLabel: "slack:capture",
    });
    const savedSource = await caller.hedwig.saveSourceFromObservation({ id: sourcePreview.observationId });
    expect(savedSource.ok).toBe(true);
    expect(savedSource.writesExternal).toBe(false);
    if (savedSource.ok) {
      expect(savedSource.source.uri).toBe("https://example.com/source-card");
      expect(savedSource.observation?.status).toBe("sourced");
      expect(savedSource.artifactId).toBeGreaterThan(0);
      expect(savedSource.sourceEventId).toBeGreaterThan(0);
    }
    const db = await getCerebroDb();
    const sourceEvents = await db.execute({
      sql: `SELECT event_type, uri, owner_agent FROM source_events WHERE uri = ? ORDER BY id DESC LIMIT 5`,
      args: ["https://example.com/source-card"],
    });
    expect(sourceEvents.rows.map((row) => String(row.event_type))).toContain("hedwig_capture_source_save");
    expect(sourceEvents.rows.map((row) => String(row.owner_agent))).toContain("hedwig");

    const panel = await caller.surfer.panel();
    expect(panel.savedSources.map((source) => source.uri)).toContain("https://example.com/source-card");
    expect(panel.recentSourceEvents.map((event) => event.uri)).toContain("https://example.com/source-card");
    expect(panel.recentSourceEvents.map((event) => event.eventType)).toContain("hedwig_capture_source_save");

    const reminderPreview = await caller.hedwig.previewCapture({
      text: "Remind me tomorrow to review the CereBro capture inbox schema",
      sourceLabel: "slack:dm",
    });
    const reminder = await caller.hedwig.createReminderProposalFromObservation({
      id: reminderPreview.observationId,
    });
    expect(reminder.ok).toBe(true);
    expect(reminder.writesExternal).toBe(false);
    if (reminder.ok) {
      expect(reminder.reminder?.timingHint).toBe("tomorrow");
      expect(reminder.reminder?.ownerAgent).toBe("hedwig");
      expect(reminder.observation?.status).toBe("triaged");
    }

    const reminderProposals = await caller.hedwig.reminderProposals({ limit: 5 });
    expect(reminderProposals.map((item) => item.id)).toContain(reminder.ok ? reminder.reminder!.id : -1);
    const reminderDetail = await caller.hedwig.proposalDetail({
      kind: "reminder",
      id: reminder.ok ? reminder.reminder!.id : -1,
    });
    expect(reminderDetail.found).toBe(true);
    expect(reminderDetail.writesExternal).toBe(false);
    if (reminderDetail.found) {
      expect(reminderDetail.statusOptions).toContain("ready_for_approval");
      expect(reminderDetail.gates.join(" ")).toContain("Scheduling");
    }
    const updatedReminder = await caller.hedwig.updateReminderProposalStatus({
      id: reminder.ok ? reminder.reminder!.id : -1,
      status: "ready_for_approval",
    });
    expect(updatedReminder.writesExternal).toBe(false);
    expect(updatedReminder.reminder?.status).toBe("ready_for_approval");
    const reviewedReminder = await caller.hedwig.updateReminderProposalReview({
      id: reminder.ok ? reminder.reminder!.id : -1,
      reviewPriority: "urgent",
      reviewNotes: "Confirm exact time before scheduling anything.",
      approvalScope: "one calendar/slack reminder only",
      proposedExternalTarget: "local approval preview only",
    });
    expect(reviewedReminder.writesExternal).toBe(false);
    expect(reviewedReminder.reminder?.reviewPriority).toBe("urgent");
    expect(reviewedReminder.reminder?.reviewNotes).toContain("Confirm exact time");

    const messagePreview = await caller.hedwig.previewCapture({
      text: "Message Cortana that the Hedwig capture flow needs a calmer empty state",
      sourceLabel: "slack:dm",
    });
    const draft = await caller.hedwig.createMessageDraftProposalFromObservation({
      id: messagePreview.observationId,
    });
    expect(draft.ok).toBe(true);
    expect(draft.writesExternal).toBe(false);
    if (draft.ok) {
      expect(draft.draft?.recipientHint).toBe("Cortana");
      expect(draft.draft?.ownerAgent).toBe("hedwig");
      expect(draft.observation?.status).toBe("triaged");
    }

    const messageDrafts = await caller.hedwig.messageDraftProposals({ limit: 5 });
    expect(messageDrafts.map((item) => item.id)).toContain(draft.ok ? draft.draft!.id : -1);
    const draftDetail = await caller.hedwig.proposalDetail({
      kind: "message",
      id: draft.ok ? draft.draft!.id : -1,
    });
    expect(draftDetail.found).toBe(true);
    expect(draftDetail.writesExternal).toBe(false);
    if (draftDetail.found) {
      expect(draftDetail.statusOptions).toContain("reviewing");
      expect(draftDetail.gates.join(" ")).toContain("Sending");
    }
    const updatedDraft = await caller.hedwig.updateMessageDraftProposalStatus({
      id: draft.ok ? draft.draft!.id : -1,
      status: "reviewing",
    });
    expect(updatedDraft.writesExternal).toBe(false);
    expect(updatedDraft.draft?.status).toBe("reviewing");
    const reviewedDraft = await caller.hedwig.updateMessageDraftProposalReview({
      id: draft.ok ? draft.draft!.id : -1,
      reviewPriority: "high",
      reviewNotes: "Keep this as a draft until recipient and tone are approved.",
      approvalScope: "one reviewed message send only",
      proposedExternalTarget: "Slack DM proposal only",
    });
    expect(reviewedDraft.writesExternal).toBe(false);
    expect(reviewedDraft.draft?.reviewPriority).toBe("high");
    expect(reviewedDraft.draft?.proposedExternalTarget).toBe("Slack DM proposal only");

    const sourceDetail = await caller.hedwig.proposalDetail({
      kind: "source",
      id: sourcePreview.observationId,
    });
    expect(sourceDetail.found).toBe(true);
    expect(sourceDetail.writesExternal).toBe(false);
    if (sourceDetail.found) {
      expect(sourceDetail.statusOptions).toContain("archived");
      expect(sourceDetail.gates.join(" ")).toContain("does not fetch");
    }
    const updatedSource = await caller.hedwig.updateSourceProposalStatus({
      id: sourcePreview.observationId,
      status: "archived",
    });
    expect(updatedSource.writesExternal).toBe(false);
    expect(updatedSource.observation?.status).toBe("archived");
    const reviewedSource = await caller.hedwig.updateSourceProposalReview({
      id: sourcePreview.observationId,
      priority: "high",
      reviewNotes: "Validate with Surfer before trusting the captured link.",
      approvalScope: "one public URL enrichment only",
      proposedExternalTarget: "Surfer source enrichment proposal",
      needsReview: true,
    });
    expect(reviewedSource.writesExternal).toBe(false);
    expect(reviewedSource.observation?.priority).toBe("high");
    expect(reviewedSource.observation?.needsReview).toBe(true);
    expect(reviewedSource.observation?.reviewNotes).toContain("Validate with Surfer");

    const approvalPreview = await caller.hedwig.createApprovalPreviewFromProposal({
      kind: "source",
      id: sourcePreview.observationId,
      actionType: "source_enrichment",
      reason: "Preview approval only; do not fetch yet.",
    });
    expect(approvalPreview.ok).toBe(true);
    expect(approvalPreview.writesExternal).toBe(false);
    expect(approvalPreview.approval?.status).toBe("pending");
    expect(approvalPreview.approval?.actionType).toBe("source_enrichment");
    expect(approvalPreview.approval?.permissionPreflightId).toBeGreaterThan(0);
    expect(approvalPreview.gates.join(" ")).toContain("pending local approval record only");
    const approvalRows = await caller.hedwig.approvalPreviews({
      targetType: "capture_observation",
      targetId: sourcePreview.observationId,
      limit: 5,
    });
    expect(approvalRows.map((item) => item.id)).toContain(approvalPreview.approval?.id);
    expect(approvalRows.find((item) => item.id === approvalPreview.approval?.id)?.permissionPreflightId).toBe(approvalPreview.approval?.permissionPreflightId);

    const approvalQueue = await caller.approvals.list({
      origin: "hedwig",
      query: "source enrichment",
      limit: 20,
    });
    expect(approvalQueue.mode).toBe("read_only");
    expect(approvalQueue.writesExternal).toBe(false);
    expect(approvalQueue.wouldApprove).toBe(false);
    expect(approvalQueue.items.map((item) => item.id)).toContain(approvalPreview.approval?.id);
    const queued = approvalQueue.items.find((item) => item.id === approvalPreview.approval?.id);
    expect(queued?.origin).toBe("hedwig");
    expect(queued?.permissionPreflightId).toBe(approvalPreview.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.id).toBe(approvalPreview.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.decision).toBe("approval_required");
    expect(queued?.permissionPreflight?.reasons.join(" ")).toContain("Hedwig source enrichment");
    expect(queued?.validationPreview.oakNotes.join(" ")).toContain("Source action");
    expect(queued?.validationPreview.spockNotes.join(" ")).toContain("local approval preview");

    const compactApprovalQueue = await caller.approvals.queue({
      origin: "hedwig",
      query: "source enrichment",
      limit: 20,
    });
    expect(compactApprovalQueue.mode).toBe("compact_read_only");
    expect(compactApprovalQueue.writesExternal).toBe(false);
    expect(compactApprovalQueue.wouldApprove).toBe(false);
    expect(compactApprovalQueue.items.map((item) => item.id)).toContain(approvalPreview.approval?.id);
    const compactQueued = compactApprovalQueue.items.find((item) => item.id === approvalPreview.approval?.id);
    expect(compactQueued?.permissionPreflight?.decision).toBe("approval_required");
    expect(JSON.stringify(compactQueued)).not.toContain("oakNotes");
    expect(JSON.stringify(compactQueued)).not.toContain("requiredApprovals");

    const approvalDetail = await caller.approvals.detail({ id: approvalPreview.approval?.id ?? -1 });
    expect(approvalDetail.mode).toBe("read_only");
    expect(approvalDetail.writesExternal).toBe(false);
    expect(approvalDetail.wouldApprove).toBe(false);
    expect(approvalDetail.found).toBe(true);
    expect(approvalDetail.approval?.validationPreview.oakNotes.join(" ")).toContain("Source action");
    expect(approvalDetail.approval?.permissionPreflight?.requiredApprovals.join(" ")).toContain("public-browser approval");

    const hedwigPreflights = await caller.permissions.preflightRecords({
      actionClass: "browser_or_media_capture",
      limit: 20,
    });
    expect(hedwigPreflights.items.map((item) => item.id)).toContain(approvalPreview.approval?.permissionPreflightId);
  });
});

describe("Terminal Lab planning", () => {
  it("reads a paged task work queue while pinning the focused task", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    const stamp = Date.now();
    const older = await caller.tasks.create({
      title: `Paged queue older ${stamp}`,
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const newer = await caller.tasks.create({
      title: `Paged queue newer ${stamp}`,
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const db = await getCerebroDb();
    const groupedSessionA = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-task-workqueue-group-a-${stamp}`, older.projectId, "Grouped queue run", "tony"],
    });
    const groupedSessionB = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-task-workqueue-group-b-${stamp}`, older.projectId, "Grouped queue run", "tony"],
    });
    const groupedSessionAId = Number(groupedSessionA.rows[0]!.id);
    const groupedSessionBId = Number(groupedSessionB.rows[0]!.id);
    const groupedTaskA = await caller.tasks.create({
      title: `Grouped queue task A ${stamp}`,
      agent: "tony",
      sessionId: groupedSessionAId,
    });
    const groupedTaskB = await caller.tasks.create({
      title: `Grouped queue task B ${stamp}`,
      agent: "tony",
      sessionId: groupedSessionBId,
    });

    const queue = await caller.tasks.workQueue({
      limit: 1,
      focusedTaskId: older.id,
    });

    expect(queue.mode).toBe("read_only");
    expect(queue.items.map((item) => item.id)).toContain(older.id);
    expect(queue.total).toBeGreaterThanOrEqual(2);
    expect(queue.statusCounts.open).toBeGreaterThanOrEqual(2);
    expect(queue.page.limit).toBe(1);
    expect(queue.page.returned).toBe(queue.items.length);
    expect(queue.focusedTaskPinned).toBe(true);

    const groupedQueue = await caller.tasks.workQueue({
      limit: 10,
      sessionIds: [groupedSessionAId, groupedSessionBId],
    });
    expect(groupedQueue.mode).toBe("read_only");
    expect(groupedQueue.items.map((item) => item.id)).toContain(groupedTaskA.id);
    expect(groupedQueue.items.map((item) => item.id)).toContain(groupedTaskB.id);
    expect(groupedQueue.items.map((item) => item.id)).not.toContain(older.id);
    expect(groupedQueue.items.map((item) => item.id)).not.toContain(newer.id);
  });

  it("filters memory and artifacts across grouped run ids", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    const stamp = Date.now();
    const projectTask = await caller.tasks.create({
      title: `Grouped receipt project ${stamp}`,
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const db = await getCerebroDb();
    const sessionA = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-grouped-receipts-a-${stamp}`, projectTask.projectId, "Grouped receipt run", "aang"],
    });
    const sessionB = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-grouped-receipts-b-${stamp}`, projectTask.projectId, "Grouped receipt run", "aang"],
    });
    const sessionOutside = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-grouped-receipts-outside-${stamp}`, projectTask.projectId, "Outside receipt run", "aang"],
    });
    const sessionAId = Number(sessionA.rows[0]!.id);
    const sessionBId = Number(sessionB.rows[0]!.id);
    const sessionOutsideId = Number(sessionOutside.rows[0]!.id);

    const memoryA = await caller.memory.create({
      body: `Grouped memory A ${stamp}`,
      kind: "note",
      sessionId: sessionAId,
      approved: true,
    });
    const memoryB = await caller.memory.create({
      body: `Grouped memory B ${stamp}`,
      kind: "note",
      sessionId: sessionBId,
      approved: true,
    });
    const memoryOutside = await caller.memory.create({
      body: `Outside memory ${stamp}`,
      kind: "note",
      sessionId: sessionOutsideId,
      approved: true,
    });
    const proposalA = await caller.memory.propose({
      body: `Grouped proposal A ${stamp}`,
      kind: "note",
      sessionId: sessionAId,
      proposedByAgent: "aang",
    });
    const proposalB = await caller.memory.propose({
      body: `Grouped proposal B ${stamp}`,
      kind: "note",
      sessionId: sessionBId,
      proposedByAgent: "aang",
    });
    const proposalOutside = await caller.memory.propose({
      body: `Outside proposal ${stamp}`,
      kind: "note",
      sessionId: sessionOutsideId,
      proposedByAgent: "aang",
    });
    const artifactA = await caller.artifacts.recordExternal({
      kind: "qa_report",
      title: `Grouped artifact A ${stamp}`,
      storageProvider: "local",
      storagePath: `test:grouped-artifact-a-${stamp}`,
      sessionId: sessionAId,
      approved: true,
    });
    const artifactB = await caller.artifacts.recordExternal({
      kind: "qa_report",
      title: `Grouped artifact B ${stamp}`,
      storageProvider: "local",
      storagePath: `test:grouped-artifact-b-${stamp}`,
      sessionId: sessionBId,
      approved: true,
    });
    const artifactOutside = await caller.artifacts.recordExternal({
      kind: "qa_report",
      title: `Outside artifact ${stamp}`,
      storageProvider: "local",
      storagePath: `test:outside-artifact-${stamp}`,
      sessionId: sessionOutsideId,
      approved: true,
    });
    expect(artifactA.ok).toBe(true);
    expect(artifactB.ok).toBe(true);
    expect(artifactOutside.ok).toBe(true);

    const groupedMemory = await caller.memory.list({ sessionIds: [sessionAId, sessionBId], limit: 20 });
    expect(groupedMemory.map((item) => item.id)).toContain(memoryA.id);
    expect(groupedMemory.map((item) => item.id)).toContain(memoryB.id);
    expect(groupedMemory.map((item) => item.id)).not.toContain(memoryOutside.id);

    const groupedProposals = await caller.memory.proposals({ sessionIds: [sessionAId, sessionBId], limit: 20 });
    expect(groupedProposals.map((item) => item.id)).toContain(proposalA.id);
    expect(groupedProposals.map((item) => item.id)).toContain(proposalB.id);
    expect(groupedProposals.map((item) => item.id)).not.toContain(proposalOutside.id);

    const groupedArtifacts = await caller.artifacts.list({ sessionIds: [sessionAId, sessionBId], limit: 20 });
    expect(groupedArtifacts.map((item) => item.title)).toContain(`Grouped artifact A ${stamp}`);
    expect(groupedArtifacts.map((item) => item.title)).toContain(`Grouped artifact B ${stamp}`);
    expect(groupedArtifacts.map((item) => item.title)).not.toContain(`Outside artifact ${stamp}`);
  });

  it("returns compact recent sessions ordered by last seen", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    const stamp = Date.now();
    const projectTask = await caller.tasks.create({
      title: `Recent sessions project ${stamp}`,
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const db = await getCerebroDb();
    const older = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class, last_seen_at, ended_at)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-recent-sessions-older-${stamp}`, projectTask.projectId, "Older recent run", "tony", 10, 20],
    });
    const newer = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class, last_seen_at)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-recent-sessions-newer-${stamp}`, projectTask.projectId, "Newer recent run", "tony", 30],
    });
    const olderId = Number(older.rows[0]!.id);
    const newerId = Number(newer.rows[0]!.id);

    const recent = await caller.sessions.recent({ limit: 10 });
    expect(recent.mode).toBe("read_only");
    expect(recent.items.map((item) => item.id)).toContain(olderId);
    expect(recent.items.map((item) => item.id)).toContain(newerId);
    expect(recent.items.findIndex((item) => item.id === newerId)).toBeLessThan(
      recent.items.findIndex((item) => item.id === olderId),
    );
    expect(recent.items.find((item) => item.id === newerId)?.displayName).toBe("Newer recent run");

    const activeOnly = await caller.sessions.recent({ activeOnly: true, limit: 10 });
    expect(activeOnly.items.map((item) => item.id)).toContain(newerId);
    expect(activeOnly.items.map((item) => item.id)).not.toContain(olderId);

    const index = await db.execute({
      sql: `SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_sessions_last_seen' LIMIT 1`,
    });
    expect(index.rows[0]?.name).toBe("idx_sessions_last_seen");
  });

  it("returns a compact Ledger overview read model", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    const stamp = Date.now();
    const task = await caller.tasks.create({
      title: `Ledger overview task ${stamp}`,
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const db = await getCerebroDb();
    const session = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-ledger-overview-${stamp}`, task.projectId, "Ledger overview run", "tony"],
    });
    const sessionId = Number(session.rows[0]!.id);
    await db.execute({
      sql: `
        INSERT INTO approvals (task_id, action_type, target_type, target_id, requested_by_agent, status, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [task.id, "external_write", "test", task.id, "tony", "pending", `Ledger overview approval ${stamp}`],
    });
    await caller.artifacts.recordExternal({
      kind: "qa_report",
      title: `Ledger overview artifact ${stamp}`,
      storageProvider: "local",
      storagePath: `test:ledger-overview-artifact-${stamp}`,
      sessionId,
      approved: true,
    });
    const memory = await caller.memory.create({
      body: `Ledger overview memory ${stamp}`,
      kind: "note",
      sessionId,
      approved: true,
    });
    const proposal = await caller.memory.propose({
      body: `Ledger overview proposal ${stamp}`,
      kind: "note",
      sessionId,
      proposedByAgent: "aang",
    });
    const evidence = await caller.workbench.createEvidence({
      kind: "terminal_output",
      title: `Ledger overview evidence ${stamp}`,
      summary: "Compact read model evidence.",
      projectId: task.projectId ?? undefined,
      taskId: task.id,
      sessionId,
      ownerAgent: "tony",
      routeAgent: "aang",
      permissionClass: "manual_note",
    });
    const route = await caller.runtime.commitRoute({
      text: `Build ledger overview ${stamp}`,
      mode: "build",
    });

    const overview = await caller.ledger.overview({ evidenceLimit: 10, routeLimit: 10 });

    expect(overview.mode).toBe("read_only");
    expect(overview.cards.tasks.total).toBeGreaterThanOrEqual(1);
    expect(overview.cards.tasks.open).toBeGreaterThanOrEqual(1);
    expect(overview.cards.sessions.recent).toBeGreaterThanOrEqual(1);
    expect(overview.cards.sessions.active).toBeGreaterThanOrEqual(1);
    expect(overview.cards.approvals.pending).toBeGreaterThanOrEqual(1);
    expect(overview.cards.outputs.total).toBeGreaterThanOrEqual(1);
    expect(overview.cards.memory.total).toBeGreaterThanOrEqual(1);
    expect(overview.cards.memory.proposed).toBeGreaterThanOrEqual(1);
    expect(overview.cards.receipts.total).toBeGreaterThanOrEqual(1);
    expect(overview.cards.receipts.terminal).toBeGreaterThanOrEqual(1);
    expect(overview.cards.routes.total).toBeGreaterThanOrEqual(1);
    expect(overview.latestEvidence.map((item) => item.id)).toContain(evidence.evidence.id);
    expect(overview.latestEvidence.find((item) => item.id === evidence.evidence.id)?.projectName).toBe("CereBro");
    expect(overview.latestRoutes.map((item) => item.id)).toContain(route.record.id);
    expect(overview.latestRoutes.find((item) => item.id === route.record.id)?.originalText).toContain(`Build ledger overview ${stamp}`);
    expect(overview.gates.join(" ")).toContain("read-only");
    expect(memory.id).toBeGreaterThan(0);
    expect(proposal.id).toBeGreaterThan(0);
  });

  it("returns compact Workbench evidence summary counts", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    const stamp = Date.now();
    const task = await caller.tasks.create({
      title: `Evidence summary task ${stamp}`,
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const db = await getCerebroDb();
    const session = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, title, hero_class)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [`test-evidence-summary-${stamp}`, task.projectId, "Evidence summary run", "tony"],
    });
    const sessionId = Number(session.rows[0]!.id);
    const terminal = await caller.workbench.createEvidence({
      kind: "terminal_output",
      title: `Evidence summary terminal ${stamp}`,
      summary: "Terminal evidence summary row.",
      projectId: task.projectId ?? undefined,
      taskId: task.id,
      sessionId,
      ownerAgent: "tony",
      routeAgent: "aang",
      permissionClass: "manual_note",
    });
    await caller.workbench.createEvidence({
      kind: "validation_note",
      title: `Evidence summary validation ${stamp}`,
      summary: "Validation evidence summary row.",
      projectId: task.projectId ?? undefined,
      taskId: task.id,
      sessionId,
      ownerAgent: "spock",
      routeAgent: "spock",
      permissionClass: "validation",
    });

    const summary = await caller.workbench.evidenceSummary({
      latestLimit: 10,
      groupBy: "project",
      query: String(stamp),
    });

    expect(summary.mode).toBe("read_only");
    expect(summary.summary.total).toBeGreaterThanOrEqual(2);
    expect(summary.summary.terminal).toBeGreaterThanOrEqual(1);
    expect(summary.summary.validationNotes).toBeGreaterThanOrEqual(1);
    expect(summary.latest.map((item) => item.id)).toContain(terminal.evidence.id);
    expect(summary.groups.find((group) => group.key === String(task.projectId))?.terminal).toBeGreaterThanOrEqual(1);
    expect(summary.groups.find((group) => group.key === String(task.projectId))?.validationNotes).toBeGreaterThanOrEqual(1);
    expect(summary.gates.join(" ")).toContain("read-only");
  });

  it("previews commands without executing them", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const plan = await caller.terminalLab.plan();
    expect(plan.mode).toBe("proposal_only");
    expect(plan.policies).toContain("No shell execution from Terminal Lab in this slice.");

    const task = await caller.tasks.create({
      title: "Check Terminal Lab linkage",
      agent: "tony",
      projectName: "CereBro",
      projectPath: "/Users/lindsaybell/Desktop/CereBro",
    });
    const db = await getCerebroDb();
    const sessionClaudeId = `test-terminal-${Date.now()}`;
    const session = await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, hero_class)
        VALUES (?, ?, ?)
        RETURNING id
      `,
      args: [sessionClaudeId, task.projectId, "tony"],
    });
    const sessionId = Number(session.rows[0]!.id);
    const sessionLinkedTask = await caller.tasks.create({
      title: "Task from linked run",
      agent: "aang",
      sessionId,
    });
    expect(sessionLinkedTask.sessionId).toBe(sessionId);
    expect(sessionLinkedTask.projectId).toBe(task.projectId);
    expect(sessionLinkedTask.sessionDisplayName).toContain(`Active Tony run #${sessionId}`);
    const sessionRows = await caller.sessions.list({ limit: 20 });
    expect(sessionRows.find((row) => row.id === sessionId)?.displayName).toContain(`Active Tony run #${sessionId}`);
    const renamedRun = await caller.sessions.updateLedger({
      id: sessionId,
      title: "Terminal QA run",
      notes: "Local run note for task receipts.",
    });
    expect(renamedRun.ok).toBe(true);
    expect(renamedRun.session?.displayName).toBe("Terminal QA run");
    expect(renamedRun.session?.notes).toBe("Local run note for task receipts.");
    const titledTask = await caller.tasks.create({
      title: "Task from titled run",
      sessionId,
    });
    expect(titledTask.sessionDisplayName).toBe("Terminal QA run");
    await recordOutput({
      claudeSessionId: sessionClaudeId,
      kind: "text",
      title: "Linked output",
      body: "This output keeps the titled run receipt.",
      toolName: null,
    });
    const outputs = await caller.outputs.list({ sessionId, limit: 10 });
    expect(outputs.find((output) => output.title === "Linked output")?.sessionDisplayName).toBe("Terminal QA run");
    const linkedArtifact = await caller.artifacts.recordExternal({
      kind: "qa_report",
      title: "Linked QA artifact",
      storageProvider: "local",
      storagePath: "test:linked-qa-artifact",
      sessionId,
      approved: true,
    });
    expect(linkedArtifact.ok).toBe(true);
    const linkedArtifacts = await caller.artifacts.list({ sessionId, limit: 10 });
    expect(linkedArtifacts.find((artifact) => artifact.title === "Linked QA artifact")?.sessionDisplayName).toBe("Terminal QA run");

    const readOnly = await caller.terminalLab.previewCommand({
      command: "rg -n Terminal CEREBRO_MASTER_BUILD_PLAN.md",
      taskId: task.id,
    });
    expect(readOnly.wouldExecute).toBe(false);
    expect(readOnly.risk).toBe("read_only");
    expect(readOnly.persisted).toBe(true);
    expect(readOnly.observationId).toBeGreaterThan(0);

    const destructive = await caller.terminalLab.previewCommand({
      command: "rm -rf app/client/public/sprites",
    });
    expect(destructive.wouldExecute).toBe(false);
    expect(destructive.risk).toBe("destructive");
    expect(destructive.gates.join(" ")).toContain("Destructive commands require explicit approval");

    const observations = await caller.terminalLab.observations({ limit: 5 });
    expect(observations.map((item) => item.id)).toContain(readOnly.observationId);
    expect(observations.find((item) => item.id === readOnly.observationId)?.status).toBe("previewed");
    expect(observations.find((item) => item.id === readOnly.observationId)?.taskId).toBe(task.id);

    const observed = await caller.terminalLab.observeOutput({
      observationId: readOnly.observationId,
      output: "Found 2 matches\nAPI_KEY=abc123\nhello@example.com",
      exitCode: 0,
    });
    expect(observed.wouldExecute).toBe(false);
    expect(observed.writesExternal).toBe(false);
    expect(observed.observation?.status).toBe("observed");
    expect(observed.observation?.outputSummary).toContain("API_KEY=[redacted]");
    expect(observed.observation?.outputSummary).toContain("[redacted-email]");
    expect(observed.observation?.followUps.map((item) => item.agent)).toContain("aang");
    expect(observed.observation?.followUps.map((item) => item.agent)).toContain("tony");

    const linked = await caller.terminalLab.linkObservation({
      observationId: destructive.observationId,
      taskId: task.id,
    });
    expect(linked.ok).toBe(true);
    expect(linked.wouldExecute).toBe(false);
    expect(linked.writesExternal).toBe(false);
    expect(linked.observation?.taskId).toBe(task.id);

    const failedPreview = await caller.terminalLab.previewCommand({
      command: "rg -n MissingThing missing-file.md",
      cwd: "/Users/lindsaybell/Desktop/CereBro",
      sessionId,
    });
    await caller.terminalLab.observeOutput({
      observationId: failedPreview.observationId,
      output: "missing-file.md: No such file or directory",
      exitCode: 2,
    });
    const failedObservation = await caller.terminalLab.observations({ limit: 10 });
    const failedRow = failedObservation.find((item) => item.id === failedPreview.observationId);
    expect(failedRow?.diagnosticDrafts.map((item) => item.command)).toContain("pwd");
    expect(failedRow?.diagnosticDrafts.some((item) => item.command.includes("find . -maxdepth 4"))).toBe(true);
    expect(failedRow?.diagnosticDrafts.find((item) => item.command === "pwd")?.evidence).toContain("missing-file.md");
    expect(failedRow?.diagnosticDrafts.find((item) => item.command === "pwd")?.expectedSignal).toContain("project folder");

    const diagnosticPreview = await caller.terminalLab.previewDiagnosticDraft({
      observationId: failedPreview.observationId,
      command: "pwd",
    });
    expect(diagnosticPreview.ok).toBe(true);
    expect(diagnosticPreview.wouldExecute).toBe(false);
    expect(diagnosticPreview.writesExternal).toBe(false);
    if (diagnosticPreview.ok) {
      expect(diagnosticPreview.parentObservationId).toBe(failedPreview.observationId);
      expect(diagnosticPreview.command).toBe("pwd");
      expect(diagnosticPreview.projectId).toBe(failedPreview.projectId);
      expect(diagnosticPreview.handoffNote).toContain("regular Codex approval path");
      expect(diagnosticPreview.gates.join(" ")).toContain("does not execute");
      expect(diagnosticPreview.diagnosticRootId).toBe(failedPreview.observationId);
      expect(diagnosticPreview.diagnosticDepth).toBe(1);
    }
    const diagnosticRows = await caller.terminalLab.observations({ limit: 10 });
    const diagnosticRow = diagnosticRows.find((item) => item.id === (diagnosticPreview.ok ? diagnosticPreview.observationId : -1));
    expect(diagnosticRow?.diagnosticParentId).toBe(failedPreview.observationId);
    expect(diagnosticRow?.diagnosticRootId).toBe(failedPreview.observationId);
    expect(diagnosticRow?.diagnosticDepth).toBe(1);
    const diagnosticDetail = await caller.terminalLab.observationDetail({ id: failedPreview.observationId });
    expect(diagnosticDetail.found).toBe(true);
    expect(diagnosticDetail.writesExternal).toBe(false);
    expect(diagnosticDetail.wouldExecute).toBe(false);
    if (diagnosticDetail.found) {
      expect(diagnosticDetail.statusOptions).toContain("reviewing");
      expect(diagnosticDetail.gates.join(" ")).toContain("local Terminal Lab metadata only");
    }
    const reviewedObservation = await caller.terminalLab.updateObservationStatus({
      id: failedPreview.observationId,
      status: "reviewing",
    });
    expect(reviewedObservation.ok).toBe(true);
    expect(reviewedObservation.writesExternal).toBe(false);
    expect(reviewedObservation.wouldExecute).toBe(false);
    expect(reviewedObservation.observation?.status).toBe("reviewing");
    const terminalApproval = await caller.terminalLab.createApprovalPreviewFromObservation({
      observationId: failedPreview.observationId,
      reason: "Preview only; user has not approved running anything.",
    });
    expect(terminalApproval.ok).toBe(true);
    expect(terminalApproval.writesExternal).toBe(false);
    expect(terminalApproval.wouldExecute).toBe(false);
    expect(terminalApproval.approval?.status).toBe("pending");
    expect(terminalApproval.approval?.targetType).toBe("command_observation");
    expect(terminalApproval.approval?.permissionPreflightId).toBeGreaterThan(0);
    const terminalApprovals = await caller.terminalLab.approvalPreviews({
      observationId: failedPreview.observationId,
      limit: 5,
    });
    expect(terminalApprovals.map((item) => item.id)).toContain(terminalApproval.approval?.id);
    expect(terminalApprovals.find((item) => item.id === terminalApproval.approval?.id)?.permissionPreflightId).toBe(terminalApproval.approval?.permissionPreflightId);

    const approvalQueue = await caller.approvals.list({
      origin: "terminal",
      query: "missing-file",
      limit: 20,
    });
    expect(approvalQueue.mode).toBe("read_only");
    expect(approvalQueue.writesExternal).toBe(false);
    expect(approvalQueue.wouldApprove).toBe(false);
    expect(approvalQueue.items.map((item) => item.id)).toContain(terminalApproval.approval?.id);
    const queued = approvalQueue.items.find((item) => item.id === terminalApproval.approval?.id);
    expect(queued?.origin).toBe("terminal");
    expect(queued?.projectName).toBe("CereBro");
    expect(queued?.permissionPreflightId).toBe(terminalApproval.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.id).toBe(terminalApproval.approval?.permissionPreflightId);
    expect(queued?.permissionPreflight?.actionClass).toBe("command_execution");
    expect(queued?.permissionPreflight?.reasons.join(" ")).toContain("Terminal Lab approval previews");
    expect(queued?.validationPreview.spockNotes.join(" ")).toContain("local approval preview");

    const compactTerminalQueue = await caller.approvals.queue({
      origin: "terminal",
      query: "missing-file",
      limit: 20,
    });
    expect(compactTerminalQueue.mode).toBe("compact_read_only");
    expect(compactTerminalQueue.writesExternal).toBe(false);
    expect(compactTerminalQueue.wouldApprove).toBe(false);
    expect(compactTerminalQueue.items.map((item) => item.id)).toContain(terminalApproval.approval?.id);
    const compactTerminal = compactTerminalQueue.items.find((item) => item.id === terminalApproval.approval?.id);
    expect(compactTerminal?.origin).toBe("terminal");
    expect(compactTerminal?.permissionPreflight?.approvalRequired).toBe(true);
    expect(JSON.stringify(compactTerminal)).not.toContain("spockNotes");
    expect(JSON.stringify(compactTerminal)).not.toContain("Terminal Lab approval previews");

    const terminalApprovalDetail = await caller.approvals.detail({ id: terminalApproval.approval?.id ?? -1 });
    expect(terminalApprovalDetail.found).toBe(true);
    expect(terminalApprovalDetail.approval?.permissionPreflight?.actionClass).toBe("command_execution");
    expect(terminalApprovalDetail.approval?.validationPreview.spockNotes.join(" ")).toContain("local approval preview");

    const terminalPreflights = await caller.permissions.preflightRecords({
      actionClass: "command_execution",
      limit: 20,
    });
    expect(terminalPreflights.items.map((item) => item.id)).toContain(terminalApproval.approval?.permissionPreflightId);

    const approvalGroups = await caller.approvals.groups({
      groupBy: "origin",
      origin: "terminal",
      query: "missing-file",
    });
    expect(approvalGroups.mode).toBe("read_only");
    expect(approvalGroups.writesExternal).toBe(false);
    expect(approvalGroups.wouldApprove).toBe(false);
    expect(approvalGroups.groups.map((group) => group.key)).toContain("terminal");
    expect(approvalGroups.gates.join(" ")).toContain("does not approve");

    const rejectedDiagnostic = await caller.terminalLab.previewDiagnosticDraft({
      observationId: failedPreview.observationId,
      command: "rm -rf .",
    });
    expect(rejectedDiagnostic.ok).toBe(false);
    expect(rejectedDiagnostic.wouldExecute).toBe(false);
    expect(rejectedDiagnostic.writesExternal).toBe(false);

    const followUpTask = await caller.terminalLab.createTaskFromObservation({
      observationId: failedPreview.observationId,
    });
    expect(followUpTask.ok).toBe(true);
    expect(followUpTask.wouldExecute).toBe(false);
    expect(followUpTask.writesExternal).toBe(false);
    if (followUpTask.ok) {
      expect(followUpTask.task.title).toContain("Follow up terminal observation:");
      expect(followUpTask.task.agent).toBe("tony");
      expect(followUpTask.task.sessionId).toBe(sessionId);
      expect(followUpTask.observation?.taskId).toBe(followUpTask.task.id);
      expect(followUpTask.observation?.projectId).toBe(followUpTask.task.projectId);
    }

    const learningProposal = await caller.terminalLab.createLearningProposalFromObservation({
      observationId: failedPreview.observationId,
    });
    expect(learningProposal.ok).toBe(true);
    expect(learningProposal.wouldExecute).toBe(false);
    expect(learningProposal.writesExternal).toBe(false);
    expect(learningProposal.proposal?.proposedByAgent).toBe("aang");
    expect(learningProposal.proposal?.source).toBe(`terminal_observation:${failedPreview.observationId}`);

    const proposals = await caller.memory.proposals({ limit: 5 });
    expect(proposals.map((item) => item.id)).toContain(learningProposal.proposal?.id);
    expect(proposals.find((item) => item.id === learningProposal.proposal?.id)?.sessionDisplayName).toBe("Terminal QA run");
    await caller.memory.setProposalOakStatus({
      id: learningProposal.proposal?.id ?? -1,
      oakStatus: "validated",
      oakNotes: "Validated for run receipt test.",
    });
    const approvedMemory = await caller.memory.approveProposal({
      id: learningProposal.proposal?.id ?? -1,
      approvalReason: "Local test approval.",
    });
    expect(approvedMemory.sessionDisplayName).toBe("Terminal QA run");
    const memoryRows = await caller.memory.list({ limit: 10 });
    expect(memoryRows.find((item) => item.id === approvedMemory.memoryEntryId)?.sessionDisplayName).toBe("Terminal QA run");
    const filteredMemoryRows = await caller.memory.list({ sessionId, limit: 10 });
    expect(filteredMemoryRows.map((item) => item.id)).toContain(approvedMemory.memoryEntryId);
    const filteredProposals = await caller.memory.proposals({ sessionId, limit: 10 });
    expect(filteredProposals.map((item) => item.id)).toContain(learningProposal.proposal?.id);

    const modulePreview = await caller.terminalLab.previewCommand({
      command: "pnpm test",
      cwd: "/Users/lindsaybell/Desktop/CereBro/app",
    });
    await caller.terminalLab.observeOutput({
      observationId: modulePreview.observationId,
      output: "Error: Cannot find module '@testing-library/react'",
      exitCode: 1,
    });
    const moduleRows = await caller.terminalLab.observations({ limit: 10 });
    const moduleRow = moduleRows.find((item) => item.id === modulePreview.observationId);
    expect(moduleRow?.diagnosticDrafts.map((item) => item.command)).toContain("rg -n \"@testing-library/react\" .");
    expect(moduleRow?.diagnosticDrafts.some((item) => item.command.includes("package.json"))).toBe(true);
    expect(moduleRow?.diagnosticDrafts.find((item) => item.command.includes("@testing-library/react"))?.approvalGate).toContain("No package install");

    const portPreview = await caller.terminalLab.previewCommand({
      command: "pnpm dev",
      cwd: "/Users/lindsaybell/Desktop/CereBro/app",
    });
    await caller.terminalLab.observeOutput({
      observationId: portPreview.observationId,
      output: "Error: Port 3002 is already in use",
      exitCode: 1,
    });
    const portRows = await caller.terminalLab.observations({ limit: 10 });
    const portRow = portRows.find((item) => item.id === portPreview.observationId);
    expect(portRow?.diagnosticDrafts.map((item) => item.command)).toContain("lsof -nP -iTCP:3002 -sTCP:LISTEN");
    expect(portRow?.diagnosticDrafts.find((item) => item.command.includes("3002"))?.expectedSignal).toContain("PID");
  });
});

describe("Project Lab proposal-only actions", () => {
  it("creates local draft plans without creating tasks or editing repos", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const db = await getCerebroDb();
    await db.execute({
      sql: `INSERT OR IGNORE INTO projects (name, path) VALUES (?, ?)`,
      args: ["CereBro", "/Users/lindsaybell/Desktop/CereBro"],
    });

    const draft = await caller.projectIntelligence.createActionDraft({
      slug: "cerebro",
      actionKey: "plan_next_slice",
    });
    expect(draft.ok).toBe(true);
    expect(draft.writesExternal).toBe(false);
    expect(draft.editsRepo).toBe(false);
    expect(draft.createsTask).toBe(false);
    if (draft.ok) {
      expect(draft.appendOnly).toBe(true);
      expect(draft.draft.title).toContain("CereBro");
      expect(draft.gates.join(" ")).toContain("does not create a task");
    }

    const draftNote = await caller.projectIntelligence.appendActionDraftNote({
      draftId: draft.ok ? draft.draft.id : -1,
      note: "Local note only. Convert this draft to a task only after explicit approval.",
      authorAgent: "cortana",
    });
    expect(draftNote.ok).toBe(true);
    expect(draftNote.writesExternal).toBe(false);
    expect(draftNote.editsRepo).toBe(false);
    expect(draftNote.createsTask).toBe(false);
    if (draftNote.ok) {
      expect(draftNote.appendOnly).toBe(true);
      expect(draftNote.note.note).toContain("Local note only");
      expect(draftNote.gates.join(" ")).toContain("Created one local append-only");
    }

    const detail = await caller.projectIntelligence.detail({ slug: "cerebro" });
    expect(detail.found).toBe(true);
    if (detail.found) {
      const savedDraft = detail.actionDrafts.find((item) => item.id === (draft.ok ? draft.draft.id : -1));
      expect(savedDraft).toBeTruthy();
      expect(savedDraft?.notes.map((note) => note.id)).toContain(draftNote.ok ? draftNote.note.id : -1);
      expect(detail.gates.join(" ")).toContain("external repo edits are not available");
    }

    const overview = await caller.projectIntelligence.overview();
    expect(overview.summary.actionDrafts).toBeGreaterThan(0);
    expect(overview.projects.find((project) => project.slug === "cerebro")?.activity.actionDrafts.total).toBeGreaterThan(0);
  });

  it("keeps local draft plans visible before a project row exists", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const draft = await caller.projectIntelligence.createActionDraft({
      slug: "waymark",
      actionKey: "validation_pass",
    });
    expect(draft.ok).toBe(true);
    expect(draft.writesExternal).toBe(false);
    expect(draft.editsRepo).toBe(false);
    expect(draft.createsTask).toBe(false);
    if (draft.ok) {
      expect(draft.draft.projectId).toBeNull();
      expect(draft.draft.projectSlug).toBe("waymark");
    }

    const draftNote = await caller.projectIntelligence.appendActionDraftNote({
      draftId: draft.ok ? draft.draft.id : -1,
      note: "Keep this visible as a local proposal even before task/project linking.",
      authorAgent: "spock",
    });
    expect(draftNote.ok).toBe(true);
    expect(draftNote.writesExternal).toBe(false);
    expect(draftNote.editsRepo).toBe(false);
    expect(draftNote.createsTask).toBe(false);

    const detail = await caller.projectIntelligence.detail({ slug: "waymark" });
    expect(detail.found).toBe(true);
    if (detail.found) {
      expect(detail.projectId).toBeNull();
      const savedDraft = detail.actionDrafts.find((item) => item.id === (draft.ok ? draft.draft.id : -1));
      expect(savedDraft).toBeTruthy();
      expect(savedDraft?.notes.map((note) => note.id)).toContain(draftNote.ok ? draftNote.note.id : -1);
    }

    const overview = await caller.projectIntelligence.overview();
    const waymark = overview.projects.find((project) => project.slug === "waymark");
    expect(waymark?.tasks.projectId).toBeNull();
    expect(waymark?.activity.actionDrafts.total).toBeGreaterThan(0);
    expect(waymark?.activity.actionDrafts.byActionKey.validation_pass).toBeGreaterThan(0);
  });

  it("returns read-only push readiness receipts without executing git writes", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const overview = await caller.projectIntelligence.overview();
    const cerebro = overview.projects.find((project) => project.slug === "cerebro");
    expect(cerebro?.pushReadiness).toBeTruthy();
    expect(cerebro?.pushReadiness.executesGit).toBe(false);
    expect(cerebro?.pushReadiness.automationRequiresApproval).toBe(true);
    expect(cerebro?.pushReadiness.automationDefault).toBe("manual");
    expect(cerebro?.pushReadiness.manualCommands).toContain("git status --short --branch");
    expect(cerebro?.pushReadiness.manualCommands.some((command) => command.startsWith("git push"))).toBe(true);
    expect(cerebro?.pushReadiness.checks.join(" ")).toContain("coherent slice");
    expect(cerebro?.pushReadiness.evidence.remote).toBeTruthy();
    expect(typeof cerebro?.pushReadiness.evidence.dirtyCount).toBe("number");
    expect(["hold_dirty", "commit_locally", "push_branch", "open_pr", "needs_cleanup"]).toContain(cerebro?.pushReadiness.state);
  });

  it("returns cached read-only Project Lab git status separately from DB rollups", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const firstRead = await caller.projectIntelligence.gitStatus({ force: true });
    expect(firstRead.mode).toBe("cached_local_read");
    expect(firstRead.readsOnly).toBe(true);
    expect(firstRead.writesRepo).toBe(false);
    expect(firstRead.executesUserCommands).toBe(false);
    expect(firstRead.runsGit).toBe(true);
    expect(firstRead.summary.total).toBeGreaterThan(0);
    expect(firstRead.projects.find((project) => project.slug === "cerebro")?.git.remote).toBeTruthy();
    expect(firstRead.gates.join(" ")).toContain("does not stage");

    const cachedRead = await caller.projectIntelligence.gitStatus();
    expect(cachedRead.cacheHit).toBe(true);
    expect(cachedRead.runsGit).toBe(false);
    expect(cachedRead.scannedAt).toBe(firstRead.scannedAt);

    const overview = await caller.projectIntelligence.overview();
    expect(overview.gitStatus.mode).toBe("cached_local_read");
    expect(overview.gitStatus.runsGit).toBe(false);
    expect(overview.gitStatus.scannedAt).toBe(firstRead.scannedAt);
  });
});

describe("Model/tool capability registry", () => {
  it("keeps model/tool routing proposal-only until capabilities are verified", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const policy = await caller.modelTools.policy();
    expect(policy.mode).toBe("proposal_only");
    expect(policy.writesExternal).toBe(false);
    expect(policy.callsExternalModels).toBe(false);
    expect(policy.installsDependencies).toBe(false);
    expect(policy.browsesOrFetches).toBe(false);
    expect(policy.gatewayCandidates).toContain("LiteLLM");
    expect(policy.evalTasks.map((task) => task.key)).toContain("handoff_prompt_gate");

    const proposal = await caller.modelTools.proposeCapability({
      provider: "Example AI",
      toolName: "Example Vision Free Tier",
      capabilityKind: "vision",
      accessMethod: "web_handoff",
      accountRequired: "unknown",
      freeTier: "Unverified. Surfer must source-check current limits before use.",
      modalities: "image, screenshot, text",
      strengths: "Potential first-pass UI screenshot review.",
      weaknesses: "No local evidence yet. Treat as untrusted until tested.",
      promptStyle: "Provide visible context, privacy summary, and exact question.",
      privacyClass: "limited_external",
      approvalLevel: "explicit_approval",
      sourceUris: "https://example.com/docs",
      riskReview: "Do not send private screenshots until Oak reviews the privacy class.",
    });
    expect(proposal.ok).toBe(true);
    expect(proposal.appendOnly).toBe(true);
    expect(proposal.writesExternal).toBe(false);
    expect(proposal.callsExternalModels).toBe(false);
    expect(proposal.installsDependencies).toBe(false);
    expect(proposal.capability.evalStatus).toBe("untested");
    expect(proposal.gates.join(" ")).toContain("did not call the model/tool");

    const evalNote = await caller.modelTools.recordEval({
      capabilityId: proposal.capability.id,
      evalTaskKey: "visual_annotation_route",
      taskSummary: "Check whether the tool can turn a UI screenshot into a routed annotation note.",
      expectedSignal: "Names the route agent, privacy class, and visible evidence.",
      resultSummary: "Not run. Placeholder eval note for the local registry.",
      status: "recorded",
      evaluatorAgent: "spock",
      privacyNotes: "No screenshot was sent.",
    });
    expect(evalNote.ok).toBe(true);
    expect(evalNote.appendOnly).toBe(true);
    expect(evalNote.writesExternal).toBe(false);
    expect(evalNote.callsExternalModels).toBe(false);

    const capabilities = await caller.modelTools.capabilities({ capabilityKind: "vision", limit: 10 });
    expect(capabilities.mode).toBe("read_only");
    expect(capabilities.writesExternal).toBe(false);
    expect(capabilities.callsExternalModels).toBe(false);
    expect(capabilities.items.map((item) => item.id)).toContain(proposal.capability.id);

    const evals = await caller.modelTools.evals({ capabilityId: proposal.capability.id });
    expect(evals.items.map((item) => item.id)).toContain(evalNote.eval.id);

    const route = await caller.modelTools.routePreview({
      taskKind: "screenshot vision review",
      modality: "image",
      privacyClass: "sensitive_review",
      requiresFrontier: true,
    });
    expect(route.routeStatus).toBe("proposal_only");
    expect(route.approvalGate).toContain("Oak/Spock review");
    expect(route.lanes.map((lane) => lane.lane)).toContain("vision_adapter_candidate");
    expect(route.lanes.map((lane) => lane.lane)).toContain("frontier_reasoning_candidate");
    expect(route.noActionTaken.join(" ")).toContain("No external model or tool was called");
  });
});

describe("Global permission modes", () => {
  it("records mode changes locally without approving hard-gated actions", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const policy = await caller.permissions.policy();
    expect(policy.mode).toBe("local_policy_shell");
    expect(policy.appendOnly).toBe(true);
    expect(policy.writesExternal).toBe(false);
    expect(policy.executesCommands).toBe(false);
    expect(policy.opensBrowser).toBe(false);
    expect(policy.capturesMedia).toBe(false);
    expect(policy.callsExternalModels).toBe(false);
    expect(policy.modes.map((mode) => mode.id)).toContain("auto_review");
    expect(policy.hardGates).toContain("tokens and API keys");
    expect(policy.preflightShape.note).toContain("recordPreflight appends local history");
    expect(policy.gates.join(" ")).toContain("Mode changes do not approve hard gates");

    const event = await caller.permissions.setMode({
      mode: "auto_review",
      reason: "Test local permission event.",
      requestedByAgent: "cortana",
    });
    expect(event.ok).toBe(true);
    expect(event.appendOnly).toBe(true);
    expect(event.event.mode).toBe("auto_review");
    expect(event.writesExternal).toBe(false);
    expect(event.executesCommands).toBe(false);
    expect(event.opensBrowser).toBe(false);
    expect(event.capturesMedia).toBe(false);
    expect(event.callsExternalModels).toBe(false);
    expect(event.gates.join(" ")).toContain("did not approve browser");

    const current = await caller.permissions.current();
    expect(current.mode).toBe("auto_review");
    expect(current.appendOnly).toBe(true);
    expect(current.summary).toContain("approved visible/local evidence");

    const history = await caller.permissions.history({ limit: 10 });
    expect(history.mode).toBe("read_only");
    expect(history.appendOnly).toBe(true);
    expect(history.items.map((item) => item.id)).toContain(event.event.id);

    const browserPreflight = await caller.permissions.preflight({
      perceptionClass: "public_browser",
      actionClass: "browser_or_media_capture",
    });
    expect(browserPreflight.advisoryOnly).toBe(true);
    expect(browserPreflight.opensBrowser).toBe(false);
    expect(browserPreflight.capturesMedia).toBe(false);
    expect(browserPreflight.decision).toBe("approval_required");
    expect(browserPreflight.requiredApprovals).toContain("public-browser approval");
    expect(browserPreflight.noActionTaken.join(" ")).toContain("No browser or media tool was opened");

    const sensitiveMemoryPreflight = await caller.permissions.preflight({
      perceptionClass: "workbench_media",
      actionClass: "local_note",
      sensitiveData: true,
      persistsMemory: true,
    });
    expect(sensitiveMemoryPreflight.decision).toBe("blocked_by_hard_gate");
    expect(sensitiveMemoryPreflight.requiredApprovals).toContain("explicit sensitive-memory approval");
    expect(sensitiveMemoryPreflight.callsExternalModels).toBe(false);

    const localNotePreflight = await caller.permissions.preflight({
      perceptionClass: "explicit_context",
      actionClass: "local_note",
    });
    expect(localNotePreflight.decision).toBe("allowed_local");
    expect(localNotePreflight.approvalRequired).toBe(false);

    const recordedPreflight = await caller.permissions.recordPreflight({
      perceptionClass: "workbench_media",
      actionClass: "browser_or_media_capture",
      sensitiveData: true,
      requestedByAgent: "gojo",
      targetSummary: "Local screenshot review request for Workbench evidence.",
    });
    expect(recordedPreflight.ok).toBe(true);
    expect(recordedPreflight.appendOnly).toBe(true);
    expect(recordedPreflight.advisoryOnly).toBe(true);
    expect(recordedPreflight.record.mode).toBe("auto_review");
    expect(recordedPreflight.record.decision).toBe("approval_required");
    expect(recordedPreflight.record.approvalRequired).toBe(true);
    expect(recordedPreflight.record.requiredApprovals).toContain("media capture approval");
    expect(recordedPreflight.record.requestedByAgent).toBe("gojo");
    expect(recordedPreflight.record.targetSummary).toContain("Workbench evidence");
    expect(recordedPreflight.opensBrowser).toBe(false);
    expect(recordedPreflight.capturesMedia).toBe(false);
    expect(recordedPreflight.callsExternalModels).toBe(false);
    expect(recordedPreflight.noActionTaken.join(" ")).toContain("No approval was granted");

    const preflightRecords = await caller.permissions.preflightRecords({
      actionClass: "browser_or_media_capture",
      limit: 10,
    });
    expect(preflightRecords.mode).toBe("read_only");
    expect(preflightRecords.appendOnly).toBe(true);
    expect(preflightRecords.writesExternal).toBe(false);
    expect(preflightRecords.executesCommands).toBe(false);
    expect(preflightRecords.opensBrowser).toBe(false);
    expect(preflightRecords.capturesMedia).toBe(false);
    expect(preflightRecords.callsExternalModels).toBe(false);
    expect(preflightRecords.items.map((item) => item.id)).toContain(recordedPreflight.record.id);
    expect(preflightRecords.summary.approvalRequired).toBeGreaterThan(0);
    expect(preflightRecords.gates.join(" ")).toContain("local append-only audit history");

    const approvalPreflightAudit = await caller.approvals.permissionPreflights({
      actionClass: "browser_or_media_capture",
      query: "Workbench evidence",
      limit: 10,
    });
    expect(approvalPreflightAudit.mode).toBe("read_only");
    expect(approvalPreflightAudit.appendOnly).toBe(true);
    expect(approvalPreflightAudit.writesExternal).toBe(false);
    expect(approvalPreflightAudit.wouldApprove).toBe(false);
    expect(approvalPreflightAudit.executesCommands).toBe(false);
    expect(approvalPreflightAudit.opensBrowser).toBe(false);
    expect(approvalPreflightAudit.capturesMedia).toBe(false);
    expect(approvalPreflightAudit.callsExternalModels).toBe(false);
    expect(approvalPreflightAudit.items.map((item) => item.id)).toContain(recordedPreflight.record.id);
    expect(approvalPreflightAudit.summary.approvalRequired).toBeGreaterThan(0);
    expect(approvalPreflightAudit.gates.join(" ")).toContain("policy evidence");
  });
});
