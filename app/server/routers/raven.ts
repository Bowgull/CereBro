import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";
import { recordPermissionPreflight } from "../permissionPolicy";

const unlockPhrase = "execute order 66";
const confirmPhrase = "i swear i'm up to no good.";
const deleteCandidatePhrase = "delete this raven candidate.";
const lockPhrases = new Set(["we're done here", "we're done here.", "we’re done here", "we’re done here."]);
const eventTypes = ["taste_note", "saved_item", "source_preference", "chat_note", "boundary_note", "preference", "scrub_receipt", "bridge_export_proposal"] as const;
const preferenceCategories = ["visual_style", "tone", "theme", "format", "source", "pace", "avoid"] as const;
const bridgeTargets = ["gojo_moodboard", "private_note", "creative_experiment_task"] as const;
const bridgeProposalStatuses = ["proposed", "queued_for_approval", "needs_revision", "cancelled", "rejected"] as const;
const recommendationCandidateStatuses = ["draft", "kept", "passed", "hidden"] as const;
const candidateTimelineEventKinds = ["status_change", "review_note", "decision_draft_note"] as const;
const candidateOverviewSortFields = ["updated_at", "timeline_event_count", "confidence", "readiness"] as const;
const candidateOverviewPresetIds = ["ready_review", "needs_more_review", "has_decision_rationale", "high_confidence_kept"] as const;
const reviewFreshnessStates = ["missing_private_review", "stale_private_review", "candidate_updated_after_review", "current_private_review"] as const;
const riskFlagIds = ["mixed_preference_signals", "low_confidence", "stale_source_signal", "missing_private_review"] as const;
const evidenceSourceIds = ["preference", "status_history", "review_note", "decision_draft_note"] as const;
const evidencePresetIds = ["complete_evidence", "missing_review_evidence", "missing_decision_rationale", "preference_only"] as const;
const sortDirections = ["asc", "desc"] as const;
const ravenUserBlockTypes = [
  "term",
  "performer",
  "studio",
  "source",
  "tag",
  "visual_style",
  "format",
  "duration_range",
  "language_or_region",
  "never_show_again",
] as const;
const ravenHardBoundaryDefaults = [
  { key: "illegal_content", label: "Illegal Content" },
  { key: "minors_or_age_ambiguous", label: "Minors Or Age-Ambiguous Content" },
  { key: "non_consensual_content", label: "Non-Consensual Content" },
  { key: "coercion_or_trafficking", label: "Coercion Or Trafficking Indicators" },
  { key: "hidden_camera_indicators", label: "Hidden-Camera Indicators" },
  { key: "doxxing_or_stalking", label: "Doxxing Or Stalking Vectors" },
  { key: "malware_scam_or_forced_download", label: "Malware, Scam, Popup, Forced-Download, Or Credential-Harvesting Sources" },
  { key: "access_control_bypass", label: "Access-Control Bypass" },
] as const;
const ravenHardBoundaryKeys = ravenHardBoundaryDefaults.map((boundary) => boundary.key) as [
  typeof ravenHardBoundaryDefaults[number]["key"],
  ...Array<typeof ravenHardBoundaryDefaults[number]["key"]>
];
const ravenSourceAdapterDefaults = [
  { sourceId: "eporner", label: "Eporner", sourceClass: "official_or_open_api", credentialRequired: false, trustLabel: "open_metadata_candidate", adapterConfidence: "medium" },
  { sourceId: "theporndb", label: "ThePornDB", sourceClass: "account_token_api", credentialRequired: true, trustLabel: "token_required", adapterConfidence: "medium" },
  { sourceId: "stashdb", label: "StashDB", sourceClass: "metadata_graph", credentialRequired: false, trustLabel: "metadata_graph_candidate", adapterConfidence: "medium" },
  { sourceId: "manual", label: "Manual Entry", sourceClass: "manual", credentialRequired: false, trustLabel: "user_supplied", adapterConfidence: "high" },
] as const;
const candidateReviewActions = [
  "leave_closed",
  "hold_for_future_private_review",
  "ask_private_clarifying_question",
  "refresh_private_preference",
  "queue_private_preview",
  "collect_one_more_signal",
  "keep_as_low_confidence_draft",
] as const;
const ravenCandidateRetentionModes = [
  "keep_until_manual_delete",
  "delete_blocked_candidates",
  "delete_all_candidates_for_active_session",
] as const;
const ravenPrivateCandidateStatuses = ["draft", "blocked_before_scoring", "ready_for_private_review", "kept", "skipped", "never_again"] as const;
const ravenPrivateCandidateTransitionTargets = ["ready_for_private_review", "kept", "skipped", "never_again"] as const;

const ravenCandidateBoundaryInput = z.object({
  sourceId: z.string().max(120).optional(),
  sourceLabel: z.string().max(160).optional(),
  candidateKey: z.string().max(240).optional(),
  sourceUri: z.string().max(500).optional(),
  title: z.string().max(500).optional(),
  terms: z.array(z.string().max(160)).max(80).optional(),
  performers: z.array(z.string().max(160)).max(80).optional(),
  studios: z.array(z.string().max(160)).max(80).optional(),
  tags: z.array(z.string().max(160)).max(120).optional(),
  visualStyles: z.array(z.string().max(160)).max(80).optional(),
  formats: z.array(z.string().max(120)).max(40).optional(),
  languageOrRegions: z.array(z.string().max(120)).max(40).optional(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  lockedProtectionFlags: z.array(z.enum(ravenHardBoundaryKeys)).max(ravenHardBoundaryDefaults.length).optional(),
});
const ravenManualCandidateNormalisationInput = ravenCandidateBoundaryInput.extend({
  sourceId: z.string().min(1).max(120).default("manual"),
  sourceClass: z.enum(["manual", "official_or_open_api", "metadata_graph", "account_token_api", "unofficial_wrapper"]).default("manual"),
});
const ravenManualCandidateBatchDryRunInput = z.object({
  candidates: z.array(ravenManualCandidateNormalisationInput).min(1).max(25),
});
const ravenCandidateStorageProposal = {
  schemaVersion: "raven_private_candidates_v1",
  proposedTables: [
    {
      name: "raven_private_candidates",
      purpose: "Store normalised Raven candidate metadata inside the sealed Raven boundary.",
      columns: [
        { name: "id", type: "integer primary key", storesPrivateContent: false },
        { name: "candidate_fingerprint", type: "text unique not null", storesPrivateContent: false },
        { name: "source_id", type: "text not null", storesPrivateContent: false },
        { name: "source_class", type: "text not null", storesPrivateContent: false },
        { name: "status", type: "text not null", storesPrivateContent: false },
        { name: "normalised_metadata_json", type: "text not null", storesPrivateContent: true },
        { name: "boundary_receipt_json", type: "text not null", storesPrivateContent: false },
        { name: "created_at", type: "integer not null default unixepoch()", storesPrivateContent: false },
        { name: "updated_at", type: "integer not null default unixepoch()", storesPrivateContent: false },
      ],
      indexes: [
        "unique(candidate_fingerprint)",
        "index(source_id, status)",
        "index(created_at)",
      ],
    },
    {
      name: "raven_private_candidate_events",
      purpose: "Append-only local timeline for candidate review and boundary decisions.",
      columns: [
        { name: "id", type: "integer primary key", storesPrivateContent: false },
        { name: "candidate_id", type: "integer not null", storesPrivateContent: false },
        { name: "event_type", type: "text not null", storesPrivateContent: false },
        { name: "event_json", type: "text not null", storesPrivateContent: true },
        { name: "created_at", type: "integer not null default unixepoch()", storesPrivateContent: false },
      ],
      indexes: [
        "index(candidate_id, created_at)",
        "index(event_type)",
      ],
    },
  ],
  allowedStatuses: ["draft", "blocked_before_scoring", "ready_for_private_review", "kept", "skipped", "never_again"],
  requiredWriteGates: [
    "Raven session must be active.",
    "Raven settings must have Raven enabled.",
    "Manual or source metadata must pass normalisation.",
    "Boundary enforcement must run before scoring.",
    "Blocked candidates may store only the minimum private metadata needed for local receipts.",
    "No source search, browser fetch, media download, external model call, CereBro memory write, Notion write, Slack write, Obsidian knowledge export, or transcript export may run in the write path.",
  ],
  defaultRetention: "local_raven_private_until_user_deletes_or_moves_to_dedicated_db",
} as const;
const ravenCandidateRetentionDeleteProposal = {
  schemaVersion: "raven_private_candidate_retention_v1",
  retentionModes: [
    {
      id: "keep_until_manual_delete",
      label: "Keep Until Manual Delete",
      default: true,
      privateContentKept: true,
    },
    {
      id: "delete_blocked_candidates",
      label: "Delete Blocked Candidates",
      default: false,
      privateContentKept: false,
    },
    {
      id: "delete_all_candidates_for_active_session",
      label: "Delete All Candidates For Active Session",
      default: false,
      privateContentKept: false,
    },
  ],
  deleteGates: [
    "Raven session must be active.",
    "The target candidate must belong to the active Raven session.",
    "Delete preview must run first and return candidate id, fingerprint, status, source, timestamps, event count, and boundary counts only.",
    "A second explicit delete confirmation phrase is required before any destructive mutation exists.",
    "Delete must remove raven_private_candidate_events before or with the candidate row.",
    "Delete receipts must not include private normalised metadata, title, URL, terms, tags, performers, studios, or chat content.",
    "No source search, browser fetch, media download, external model call, CereBro memory write, Notion write, Slack write, Obsidian knowledge export, or transcript export may run in the delete path.",
  ],
  redactionPolicy: {
    previewFieldsAllowed: ["id", "candidateFingerprint", "sourceId", "sourceClass", "status", "createdAt", "updatedAt", "eventCount", "boundaryCounts"],
    privateFieldsNeverReturned: ["normalised metadata", "title", "source URI", "terms", "tags", "performers", "studios", "chat text"],
  },
} as const;

function normalizePhrase(value: string) {
  return value.trim().toLowerCase().replace(/[’]/g, "'");
}

function rowToSession(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    status: String(row.status),
    unlockStage: String(row.unlock_stage),
    privacyScope: String(row.privacy_scope),
    openedBy: String(row.opened_by),
    lockReason: row.lock_reason == null ? null : String(row.lock_reason),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    createdAt: Number(row.created_at),
    lastSeenAt: Number(row.last_seen_at),
    lockedAt: row.locked_at == null ? null : Number(row.locked_at),
  };
}

function rowToEvent(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    eventType: String(row.event_type),
    title: row.title == null ? null : String(row.title),
    body: String(row.body),
    sourceUri: row.source_uri == null ? null : String(row.source_uri),
    sourceLabel: row.source_label == null ? null : String(row.source_label),
    privacyClass: String(row.privacy_class),
    metadata: row.metadata_json == null ? null : JSON.parse(String(row.metadata_json)),
    createdAt: Number(row.created_at),
  };
}

function rowToPreference(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    category: String(row.category),
    signal: String(row.signal),
    weight: Number(row.weight),
    notes: row.notes == null ? null : String(row.notes),
    sourceEventId: row.source_event_id == null ? null : Number(row.source_event_id),
    createdAt: Number(row.created_at),
  };
}

function dbFlag(value: unknown) {
  return Number(value) === 1;
}

function normalizeBoundaryText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizedValues(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map(normalizeBoundaryText);
}

function compactStrings(values: string[] | undefined) {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

function durationMatchesBlock(durationSeconds: number | undefined, value: string) {
  if (durationSeconds == null) return false;
  const normalized = normalizeBoundaryText(value);
  const range = normalized.match(/^(\d+)\s*(?:-|to|–)\s*(\d+)$/);
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    return durationSeconds >= Math.min(min, max) && durationSeconds <= Math.max(min, max);
  }
  const under = normalized.match(/^(?:under|less_than|lt|<)\s*:?\s*(\d+)$/);
  if (under) return durationSeconds < Number(under[1]);
  const over = normalized.match(/^(?:over|greater_than|gt|>)\s*:?\s*(\d+)$/);
  if (over) return durationSeconds > Number(over[1]);
  const exact = normalized.match(/^\d+$/);
  return exact ? durationSeconds === Number(normalized) : false;
}

function userBlockMatchesCandidate(
  block: ReturnType<typeof rowToRavenUserBlock>,
  candidate: z.infer<typeof ravenCandidateBoundaryInput>,
) {
  const blockValue = normalizeBoundaryText(block.value);
  const titleAndTerms = normalizedValues([
    candidate.title,
    ...(candidate.terms ?? []),
    ...(candidate.tags ?? []),
    ...(candidate.visualStyles ?? []),
    ...(candidate.formats ?? []),
    ...(candidate.languageOrRegions ?? []),
  ]);
  const valuesByType: Record<string, string[]> = {
    performer: normalizedValues(candidate.performers ?? []),
    studio: normalizedValues(candidate.studios ?? []),
    source: normalizedValues([candidate.sourceId, candidate.sourceLabel]),
    tag: normalizedValues(candidate.tags ?? []),
    visual_style: normalizedValues(candidate.visualStyles ?? []),
    format: normalizedValues(candidate.formats ?? []),
    language_or_region: normalizedValues(candidate.languageOrRegions ?? []),
    never_show_again: normalizedValues([candidate.candidateKey, candidate.sourceUri]),
  };
  if (block.blockType === "term") {
    return titleAndTerms.some((value) => value.includes(blockValue));
  }
  if (block.blockType === "duration_range") {
    return durationMatchesBlock(candidate.durationSeconds, block.value);
  }
  return (valuesByType[block.blockType] ?? []).some((value) => value === blockValue);
}

function evaluateCandidateBoundary(input: {
  candidate: z.infer<typeof ravenCandidateBoundaryInput>;
  lockedProtections: Array<ReturnType<typeof rowToRavenHardBoundary>>;
  userBlocks: Array<ReturnType<typeof rowToRavenUserBlock>>;
}) {
  const enabledLockedProtections = input.lockedProtections.filter((protection) => protection.enforced);
  const flaggedProtectionKeys = new Set(input.candidate.lockedProtectionFlags ?? []);
  const lockedProtectionHits = enabledLockedProtections
    .filter((protection) => flaggedProtectionKeys.has(protection.key as typeof ravenHardBoundaryKeys[number]))
    .map((protection) => ({
      key: protection.key,
      label: protection.label,
      enforcementStage: protection.enforcementStage,
    }));
  const userBlockHits = input.userBlocks
    .filter((block) => block.enabled && userBlockMatchesCandidate(block, input.candidate))
    .map((block) => ({
      id: block.id,
      blockType: block.blockType,
      label: block.label,
      enforcementStage: "before_scoring" as const,
    }));
  const userBlockCountsByType = userBlockHits.reduce<Record<string, number>>((counts, block) => {
    counts[block.blockType] = (counts[block.blockType] ?? 0) + 1;
    return counts;
  }, {});
  return {
    blockedBeforeScoring: lockedProtectionHits.length > 0 || userBlockHits.length > 0,
    lockedProtectionHitCount: lockedProtectionHits.length,
    userBlockHitCount: userBlockHits.length,
    totalBoundaryHitCount: lockedProtectionHits.length + userBlockHits.length,
    userBlockCountsByType,
    lockedProtectionHits,
    userBlockHits,
    appliedProtectionCount: enabledLockedProtections.length,
    appliedUserBlockCount: input.userBlocks.filter((block) => block.enabled).length,
    enforcementStages: ["before_scoring"],
  };
}

function normaliseManualCandidate(input: z.infer<typeof ravenManualCandidateNormalisationInput>) {
  const candidate = {
    sourceId: input.sourceId,
    sourceLabel: input.sourceLabel?.trim(),
    candidateKey: input.candidateKey?.trim(),
    sourceUri: input.sourceUri?.trim(),
    title: input.title?.trim(),
    terms: compactStrings(input.terms),
    performers: compactStrings(input.performers),
    studios: compactStrings(input.studios),
    tags: compactStrings(input.tags),
    visualStyles: compactStrings(input.visualStyles),
    formats: compactStrings(input.formats),
    languageOrRegions: compactStrings(input.languageOrRegions),
    durationSeconds: input.durationSeconds,
    lockedProtectionFlags: [...new Set(input.lockedProtectionFlags ?? [])],
  };
  const fingerprintParts = [
    candidate.sourceId,
    candidate.sourceLabel,
    candidate.candidateKey,
    candidate.sourceUri,
    candidate.title,
    ...candidate.terms,
    ...candidate.performers,
    ...candidate.studios,
    ...candidate.tags,
    ...candidate.visualStyles,
    ...candidate.formats,
    ...candidate.languageOrRegions,
    String(candidate.durationSeconds ?? ""),
    ...candidate.lockedProtectionFlags,
  ].filter((value): value is string => typeof value === "string" && value.length > 0);
  const fieldCounts = {
    terms: candidate.terms.length,
    performers: candidate.performers.length,
    studios: candidate.studios.length,
    tags: candidate.tags.length,
    visualStyles: candidate.visualStyles.length,
    formats: candidate.formats.length,
    languageOrRegions: candidate.languageOrRegions.length,
    lockedProtectionFlags: candidate.lockedProtectionFlags.length,
  };
  const presentFields = [
    candidate.sourceId ? "sourceId" : null,
    candidate.sourceLabel ? "sourceLabel" : null,
    candidate.candidateKey ? "candidateKey" : null,
    candidate.sourceUri ? "sourceUri" : null,
    candidate.title ? "title" : null,
    candidate.durationSeconds != null ? "durationSeconds" : null,
    ...Object.entries(fieldCounts)
      .filter(([, count]) => count > 0)
      .map(([field]) => field),
  ].filter((field): field is string => field != null);
  return {
    candidate,
    receipt: {
      shapeVersion: "raven_private_candidate_v1" as const,
      sourceId: candidate.sourceId,
      sourceClass: input.sourceClass,
      candidateFingerprint: hashText(fingerprintParts.map(normalizeBoundaryText).sort().join("|")),
      presentFields,
      fieldCounts,
      hasSourceUri: Boolean(candidate.sourceUri),
      hasCandidateKey: Boolean(candidate.candidateKey),
      hasDuration: candidate.durationSeconds != null,
      hasLockedProtectionFlags: candidate.lockedProtectionFlags.length > 0,
    },
  };
}

function aggregateBoundaryReceipts(
  receipts: Array<ReturnType<typeof evaluateCandidateBoundary>>,
) {
  return receipts.reduce(
    (summary, receipt) => {
      summary.blockedCandidateCount += receipt.blockedBeforeScoring ? 1 : 0;
      summary.lockedProtectionHitCount += receipt.lockedProtectionHitCount;
      summary.userBlockHitCount += receipt.userBlockHitCount;
      summary.totalBoundaryHitCount += receipt.totalBoundaryHitCount;
      for (const hit of receipt.lockedProtectionHits) {
        summary.lockedProtectionCountsByKey[hit.key] = (summary.lockedProtectionCountsByKey[hit.key] ?? 0) + 1;
      }
      for (const [blockType, count] of Object.entries(receipt.userBlockCountsByType)) {
        summary.userBlockCountsByType[blockType] = (summary.userBlockCountsByType[blockType] ?? 0) + count;
      }
      return summary;
    },
    {
      blockedCandidateCount: 0,
      lockedProtectionHitCount: 0,
      userBlockHitCount: 0,
      totalBoundaryHitCount: 0,
      lockedProtectionCountsByKey: {} as Record<string, number>,
      userBlockCountsByType: {} as Record<string, number>,
    },
  );
}

function rowToRavenSettings(row: Record<string, unknown>) {
  return {
    ravenEnabled: dbFlag(row.raven_enabled),
    requirePassphraseOnOpen: dbFlag(row.require_passphrase_on_open),
    adultDiscoveryEnabled: dbFlag(row.adult_discovery_enabled),
    runSourceSearchFromChat: dbFlag(row.run_source_search_from_chat),
    explicitSearchOnly: dbFlag(row.explicit_search_only),
    backgroundDiscoveryEnabled: dbFlag(row.background_discovery_enabled),
    thumbnailsAllowed: dbFlag(row.thumbnails_allowed),
    previewMediaAllowed: dbFlag(row.preview_media_allowed),
    externalModelPrivateContentAllowed: dbFlag(row.external_model_private_content_allowed),
    candidateRetentionMode: String(row.candidate_retention_mode ?? "keep_until_manual_delete"),
    candidateRetentionLocalOnly: row.candidate_retention_local_only == null ? true : dbFlag(row.candidate_retention_local_only),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToRavenHardBoundary(row: Record<string, unknown>) {
  return {
    key: String(row.boundary_key),
    label: String(row.label),
    type: "locked_protection" as const,
    enforced: dbFlag(row.enabled),
    userEditable: false,
    enforcementStage: "before_scoring" as const,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToRavenUserBlock(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    blockType: String(row.block_type),
    label: String(row.label),
    value: String(row.value),
    enabled: dbFlag(row.enabled),
    userEditable: true,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToRavenSourceAdapter(row: Record<string, unknown>) {
  return {
    sourceId: String(row.source_id),
    label: String(row.label),
    sourceClass: String(row.source_class),
    enabled: dbFlag(row.enabled),
    credentialRequired: dbFlag(row.credential_required),
    searchAllowed: dbFlag(row.search_allowed),
    urlEnrichmentAllowed: dbFlag(row.url_enrichment_allowed),
    thumbnailsAllowed: dbFlag(row.thumbnails_allowed),
    previewMediaAllowed: dbFlag(row.preview_media_allowed),
    trustLabel: String(row.trust_label),
    adapterConfidence: String(row.adapter_confidence),
    notes: row.notes == null ? null : String(row.notes),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToRavenPrivateCandidate(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    candidateFingerprint: String(row.candidate_fingerprint),
    sourceId: String(row.source_id),
    sourceClass: String(row.source_class),
    status: String(row.status),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function boundaryCountsFromRow(row: Record<string, unknown>) {
  const boundary = JSON.parse(String(row.boundary_receipt_json));
  const lockedProtectionHits = Array.isArray(boundary.lockedProtectionHits)
    ? boundary.lockedProtectionHits as Array<{ key?: unknown }>
    : [];
  return {
    blockedBeforeScoring: Boolean(boundary.blockedBeforeScoring),
    lockedProtectionHitCount: Number(boundary.lockedProtectionHitCount ?? 0),
    userBlockHitCount: Number(boundary.userBlockHitCount ?? 0),
    totalBoundaryHitCount: Number(boundary.totalBoundaryHitCount ?? 0),
    lockedProtectionKeys: lockedProtectionHits.map((hit) => String(hit.key ?? "")).filter(Boolean),
    userBlockCountsByType: typeof boundary.userBlockCountsByType === "object" && boundary.userBlockCountsByType != null
      ? boundary.userBlockCountsByType as Record<string, number>
      : {},
  };
}

function rowToRavenPrivateCandidateEventReceipt(row: Record<string, unknown>) {
  const event = JSON.parse(String(row.event_json));
  const boundary = event && typeof event.boundary === "object" ? event.boundary as Record<string, unknown> : {};
  return {
    id: Number(row.id),
    candidateId: Number(row.candidate_id),
    ravenSessionId: Number(row.raven_session_id),
    eventType: String(row.event_type),
    candidateFingerprint: event?.candidateFingerprint == null ? null : String(event.candidateFingerprint),
    fromStatus: event?.fromStatus == null ? null : String(event.fromStatus),
    status: event?.status == null ? null : String(event.status),
    reason: event?.reason == null ? null : String(event.reason),
    reviewAction: event?.reviewAction == null ? null : String(event.reviewAction),
    reviewNoteFingerprint: event?.reviewNoteFingerprint == null ? null : String(event.reviewNoteFingerprint),
    rationaleCharCount: event?.rationaleCharCount == null ? null : Number(event.rationaleCharCount),
    redactionFindingCount: event?.redactionFindingCount == null ? null : Number(event.redactionFindingCount),
    redactedRationale: event?.redactedRationale == null ? null : String(event.redactedRationale),
    proposedStatus: event?.proposedStatus == null ? null : String(event.proposedStatus),
    decisionReason: event?.decisionReason == null ? null : String(event.decisionReason),
    decisionDraftFingerprint: event?.decisionDraftFingerprint == null ? null : String(event.decisionDraftFingerprint),
    decisionRationaleCharCount: event?.decisionRationaleCharCount == null ? null : Number(event.decisionRationaleCharCount),
    redactedDecisionRationale: event?.redactedDecisionRationale == null ? null : String(event.redactedDecisionRationale),
    boundary: {
      blockedBeforeScoring: Boolean(boundary.blockedBeforeScoring),
      lockedProtectionHitCount: Number(boundary.lockedProtectionHitCount ?? 0),
      userBlockHitCount: Number(boundary.userBlockHitCount ?? 0),
      totalBoundaryHitCount: Number(boundary.totalBoundaryHitCount ?? 0),
      lockedProtectionKeys: Array.isArray(boundary.lockedProtectionKeys)
        ? boundary.lockedProtectionKeys.map((key) => String(key)).filter(Boolean)
        : [],
      userBlockCountsByType: typeof boundary.userBlockCountsByType === "object" && boundary.userBlockCountsByType != null
        ? boundary.userBlockCountsByType as Record<string, number>
        : {},
    },
    createdAt: Number(row.created_at),
  };
}

function proposeRavenPrivateCandidateDecision(input: {
  status: string;
  statusEventCount: number;
  reviewNoteEventCount: number;
  reviewActions: string[];
}) {
  const hasPositiveReviewAction = input.reviewActions.some((action) => (
    action === "hold_for_future_private_review"
      || action === "queue_private_preview"
      || action === "collect_one_more_signal"
  ));
  const proposedStatus = input.status === "blocked_before_scoring" || input.status === "never_again"
    ? "never_again"
    : input.status === "ready_for_private_review" && input.reviewNoteEventCount > 0 && hasPositiveReviewAction
      ? "kept"
      : input.status === "ready_for_private_review" && input.reviewNoteEventCount > 0
        ? "skipped"
        : "skipped";
  const confidence = input.reviewNoteEventCount > 0 && input.statusEventCount > 0 ? "medium" : "low";
  const reason = proposedStatus === "kept"
    ? "Redacted review-note receipts and status history support keeping this private candidate."
    : proposedStatus === "never_again"
      ? "Candidate is blocked or already marked never-again. Keep it out of review."
      : "Not enough redacted review evidence exists to keep this private candidate.";
  return {
    proposedStatus,
    reason,
    confidence,
  };
}

function rowToScrubReceipt(row: Record<string, unknown>) {
  const findings = JSON.parse(String(row.findings_json));
  const findingLabels = Array.isArray(findings)
    ? findings.map((finding) => typeof finding === "string" ? finding : String(finding.label)).filter(Boolean)
    : [];
  const severityRank = findingLabels.some((label) => ["secret-like text", "financial id", "government id"].includes(label))
    ? "high"
    : findingLabels.length > 0
      ? "medium"
      : "low";
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    targetKind: String(row.target_kind),
    targetId: row.target_id == null ? null : Number(row.target_id),
    originalSha256: String(row.original_sha256),
    scrubbedBody: String(row.scrubbed_body),
    findings,
    findingLabels,
    severity: severityRank,
    createdAt: Number(row.created_at),
  };
}

function rowToBridgeProposal(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    sourceEventId: row.source_event_id == null ? null : Number(row.source_event_id),
    scrubReceiptId: row.scrub_receipt_id == null ? null : Number(row.scrub_receipt_id),
    target: String(row.target),
    title: String(row.title),
    summary: String(row.summary),
    status: String(row.status),
    approvalRequired: String(row.approval_required),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToBridgeHistory(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    proposalId: Number(row.proposal_id),
    ravenSessionId: Number(row.raven_session_id),
    fromStatus: row.from_status == null ? null : String(row.from_status),
    toStatus: String(row.to_status),
    reason: row.reason == null ? null : String(row.reason),
    actor: String(row.actor),
    createdAt: Number(row.created_at),
  };
}

function rowToApprovalPreview(row: Record<string, unknown> | undefined) {
  if (!row) return null;
  return {
    id: Number(row.id),
    actionType: String(row.action_type),
    targetType: row.target_type == null ? null : String(row.target_type),
    targetId: row.target_id == null ? null : Number(row.target_id),
    requestedByAgent: row.requested_by_agent == null ? null : String(row.requested_by_agent),
    status: String(row.status),
    reason: row.reason == null ? null : String(row.reason),
    contextSummary: row.context_summary == null ? null : String(row.context_summary),
    sensitive: Boolean(row.sensitive_data_flag),
    costRisk: row.cost_risk == null ? null : String(row.cost_risk),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    createdAt: Number(row.created_at),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
  };
}

function rowToRecommendationCandidate(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    seedCategory: String(row.seed_category),
    seedText: String(row.seed_text),
    rationale: String(row.rationale),
    confidence: String(row.confidence),
    sourcePreferenceIds: JSON.parse(String(row.source_preference_ids_json)),
    status: String(row.status),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function rowToRecommendationCandidateHistory(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    candidateId: Number(row.candidate_id),
    ravenSessionId: Number(row.raven_session_id),
    fromStatus: row.from_status == null ? null : String(row.from_status),
    toStatus: String(row.to_status),
    reason: row.reason == null ? null : String(row.reason),
    actor: String(row.actor),
    createdAt: Number(row.created_at),
  };
}

function rowToRecommendationCandidateReviewNote(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    candidateId: Number(row.candidate_id),
    ravenSessionId: Number(row.raven_session_id),
    plannerAction: row.planner_action == null ? null : String(row.planner_action),
    note: String(row.note),
    actor: String(row.actor),
    createdAt: Number(row.created_at),
  };
}

function rowToRecommendationCandidateDecisionDraftNote(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    candidateId: Number(row.candidate_id),
    ravenSessionId: Number(row.raven_session_id),
    proposedStatus: String(row.proposed_status),
    reason: String(row.reason),
    note: String(row.note),
    actor: String(row.actor),
    createdAt: Number(row.created_at),
  };
}

function makePrivateSnippet(value: string, query: string) {
  const normalized = value.toLowerCase();
  const needle = query.toLowerCase();
  const matchIndex = normalized.indexOf(needle);
  const start = Math.max(0, (matchIndex === -1 ? 0 : matchIndex) - 40);
  const end = Math.min(value.length, (matchIndex === -1 ? 80 : matchIndex + query.length + 40));
  return value.slice(start, end).trim();
}

function privateReviewReadiness(input: {
  status: string;
  confidence: string;
  reviewNoteCount: number;
  plannerActions: string[];
}) {
  return input.status === "draft"
    && input.reviewNoteCount >= 1
    && input.plannerActions.length >= 1
    && input.confidence !== "low";
}

function draftPrivateReviewDecision(input: {
  status: string;
  confidence: string;
  reviewNoteCount: number;
  plannerActions: string[];
}) {
  if (input.status === "hidden" || input.status === "passed") {
    return {
      proposedStatus: input.status,
      reason: "Candidate is already closed. Leave status unchanged.",
      confidence: "high",
    };
  }
  if (input.plannerActions.includes("ask_private_clarifying_question")) {
    return {
      proposedStatus: "draft",
      reason: "Mixed signals remain. Keep draft until private clarification is resolved.",
      confidence: "medium",
    };
  }
  if (privateReviewReadiness(input)) {
    return {
      proposedStatus: "kept",
      reason: "Local notes and planner actions support keeping this candidate for private review.",
      confidence: input.confidence,
    };
  }
  return {
    proposedStatus: input.status,
    reason: "Not enough private review evidence to change status.",
    confidence: "low",
  };
}

function countTimelineEvents(events: Array<{ kind: string }>) {
  const byKind: Record<string, number> = {};
  for (const event of events) {
    byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;
  }
  return {
    total: events.length,
    byKind,
  };
}

function scoreConfidence(totalSignals: number, absoluteWeight: number) {
  if (totalSignals >= 5 && absoluteWeight >= 10) return "high";
  if (totalSignals >= 2 && absoluteWeight >= 3) return "medium";
  return "low";
}

function ageBucket(createdAt: number | null, now: number) {
  if (createdAt == null) return "none";
  const ageSeconds = Math.max(0, now - createdAt);
  if (ageSeconds <= 86400) return "fresh";
  if (ageSeconds <= 60 * 86400) return "stable";
  return "stale";
}

function candidateConfidenceRank(confidence: string) {
  if (confidence === "high") return 3;
  if (confidence === "medium") return 2;
  if (confidence === "low") return 1;
  return 0;
}

function candidateReadinessRank(readiness: string) {
  return readiness === "ready_for_private_status_review" ? 1 : 0;
}

function reviewFreshnessState(input: {
  latestReviewNoteAt: number | null;
  latestDecisionDraftNoteAt: number | null;
  candidateUpdatedAt: number;
  now: number;
}) {
  const latestReviewAt = Math.max(input.latestReviewNoteAt ?? 0, input.latestDecisionDraftNoteAt ?? 0);
  if (latestReviewAt === 0) return "missing_private_review";
  if (latestReviewAt < input.candidateUpdatedAt) return "candidate_updated_after_review";
  if (ageBucket(latestReviewAt, input.now) === "stale") return "stale_private_review";
  return "current_private_review";
}

function decayMultiplier(bucket: string) {
  if (bucket === "fresh") return 1;
  if (bucket === "stable") return 0.75;
  if (bucket === "stale") return 0.4;
  return 0;
}

function contradictionState(positiveCount: number, negativeCount: number) {
  if (positiveCount > 0 && negativeCount > 0) return "mixed";
  if (positiveCount > 0) return "positive";
  if (negativeCount > 0) return "avoid_only";
  return "empty";
}

function recommendationSeedsFromRollups(rollups: Array<{
  category: string;
  topSignals: string[];
  avoidSignals: string[];
  totalWeight: number;
  totalSignals: number;
  contradictionState?: string;
  decayBucket?: string;
}>) {
  const activeRollups = rollups.filter((rollup) => rollup.topSignals.length > 0 || rollup.avoidSignals.length > 0);
  return activeRollups.slice(0, 5).map((rollup) => ({
    category: rollup.category,
    seed: [
      rollup.topSignals.length ? `prefer ${rollup.topSignals.slice(0, 3).join(", ")}` : null,
      rollup.avoidSignals.length ? `avoid ${rollup.avoidSignals.slice(0, 3).join(", ")}` : null,
    ].filter(Boolean).join("; "),
    confidence: scoreConfidence(
      rollup.totalSignals,
      Math.abs(rollup.totalWeight),
    ),
    contradictionState: rollup.contradictionState ?? "empty",
    decayBucket: rollup.decayBucket ?? "none",
    source: "raven_private_preferences",
  }));
}

function candidateRationale(input: {
  category: string;
  topSignals: string[];
  avoidSignals: string[];
  confidence: string;
  contradictionState?: string;
  decayBucket?: string;
}) {
  const parts = [
    input.topSignals.length ? `Positive signals: ${input.topSignals.slice(0, 3).join(", ")}.` : null,
    input.avoidSignals.length ? `Avoid signals: ${input.avoidSignals.slice(0, 3).join(", ")}.` : null,
    `Confidence: ${input.confidence}.`,
    input.contradictionState ? `Contradiction: ${input.contradictionState}.` : null,
    input.decayBucket ? `Decay: ${input.decayBucket}.` : null,
  ].filter(Boolean);
  return `${input.category}: ${parts.join(" ")}`;
}

function reviewActionFor(input: {
  status: string;
  confidence: string;
  contradictionState: string;
  decayBucket: string;
}) {
  if (input.status === "hidden" || input.status === "passed") {
    return {
      action: "leave_closed",
      reason: "Candidate is already out of the active review lane.",
    };
  }
  if (input.status === "kept") {
    return {
      action: "hold_for_future_private_review",
      reason: "Candidate was kept locally. Do not export or fetch anything.",
    };
  }
  if (input.contradictionState === "mixed") {
    return {
      action: "ask_private_clarifying_question",
      reason: "Positive and avoid signals both exist for this category.",
    };
  }
  if (input.decayBucket === "stale") {
    return {
      action: "refresh_private_preference",
      reason: "The source preference signal is stale.",
    };
  }
  if (input.confidence === "high") {
    return {
      action: "queue_private_preview",
      reason: "Confidence is high enough for a local preview draft only.",
    };
  }
  if (input.confidence === "medium") {
    return {
      action: "collect_one_more_signal",
      reason: "More private feedback would make this safer to rank.",
    };
  }
  return {
    action: "keep_as_low_confidence_draft",
    reason: "Signal strength is low.",
  };
}

function hashText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function scrubPrivateText(value: string) {
  const findings: Array<{ label: string; severity: "medium" | "high"; replacement: string }> = [];
  let scrubbed = value;
  const replacements: Array<{ pattern: RegExp; replacement: string; label: string; severity: "medium" | "high" }> = [
    { pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: "[email]", label: "email", severity: "medium" },
    { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[phone]", label: "phone", severity: "medium" },
    { pattern: /https?:\/\/[^\s)]+/gi, replacement: "[url]", label: "url", severity: "medium" },
    { pattern: /\/Users\/[^\s)]+/g, replacement: "[local_path]", label: "local path", severity: "medium" },
    { pattern: /\b(?:api|token|key|secret|password)\s*[:=]\s*[^\s]+/gi, replacement: "[secret_like]", label: "secret-like text", severity: "high" },
    { pattern: /\b(?:\d[ -]*?){13,16}\b/g, replacement: "[financial_id]", label: "financial id", severity: "high" },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[government_id]", label: "government id", severity: "high" },
    { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[ip_address]", label: "ip address", severity: "medium" },
  ];
  for (const { pattern, replacement, label, severity } of replacements) {
    if (pattern.test(scrubbed)) {
      findings.push({ label, severity, replacement });
      scrubbed = scrubbed.replace(pattern, replacement);
    }
  }
  return {
    scrubbed,
    findings: [...new Map(findings.map((finding) => [finding.label, finding])).values()],
  };
}

async function getActiveSession() {
  const db = await getCerebroDb();
  const result = await db.execute(`
    SELECT *
    FROM raven_private_sessions
    WHERE status = 'active'
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);
  return result.rows[0] ? rowToSession(result.rows[0]) : null;
}

async function requireActiveSession(ravenSessionId?: number) {
  const db = await getCerebroDb();
  const result = ravenSessionId
    ? await db.execute({
        sql: `SELECT * FROM raven_private_sessions WHERE id = ? AND status = 'active' LIMIT 1`,
        args: [ravenSessionId],
      })
    : await db.execute(`
        SELECT *
        FROM raven_private_sessions
        WHERE status = 'active'
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `);
  const row = result.rows[0];
  if (!row) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Raven is sealed. Unlock Raven before writing private state.",
    });
  }
  return { db, session: rowToSession(row) };
}

async function updateRavenPrivateCandidateStatus(input: {
  db: Awaited<ReturnType<typeof getCerebroDb>>;
  session: ReturnType<typeof rowToSession>;
  candidateId: number;
  status: typeof ravenPrivateCandidateTransitionTargets[number];
  reason: string | null;
}) {
  const candidateResult = await input.db.execute({
    sql: `
      SELECT
        id,
        raven_session_id,
        candidate_fingerprint,
        source_id,
        source_class,
        status,
        boundary_receipt_json,
        created_at,
        updated_at
      FROM raven_private_candidates
      WHERE id = ?
        AND raven_session_id = ?
      LIMIT 1
    `,
    args: [input.candidateId, input.session.id],
  });
  const row = candidateResult.rows[0];
  if (!row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No sealed Raven private candidate matched that id.",
    });
  }
  const candidate = rowToRavenPrivateCandidate(row);
  const allowedFrom = candidate.status === "draft" || candidate.status === "ready_for_private_review";
  if (!allowedFrom) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Raven private candidate status can only change from draft or ready_for_private_review.",
    });
  }
  await input.db.execute({
    sql: `
      UPDATE raven_private_candidates
      SET status = ?,
          updated_at = unixepoch()
      WHERE id = ?
        AND raven_session_id = ?
    `,
    args: [input.status, input.candidateId, input.session.id],
  });
  await input.db.execute({
    sql: `
      INSERT INTO raven_private_candidate_events (
        candidate_id,
        raven_session_id,
        event_type,
        event_json
      )
      VALUES (?, ?, ?, ?)
    `,
    args: [
      input.candidateId,
      input.session.id,
      "private_candidate_status_transition",
      JSON.stringify({
        candidateFingerprint: candidate.candidateFingerprint,
        fromStatus: candidate.status,
        status: input.status,
        reason: input.reason,
        boundary: boundaryCountsFromRow(row),
      }),
    ],
  });
  const updatedResult = await input.db.execute({
    sql: `
      SELECT
        id,
        raven_session_id,
        candidate_fingerprint,
        source_id,
        source_class,
        status,
        created_at,
        updated_at
      FROM raven_private_candidates
      WHERE id = ?
        AND raven_session_id = ?
      LIMIT 1
    `,
    args: [input.candidateId, input.session.id],
  });
  return {
    previousCandidate: candidate,
    updatedCandidate: rowToRavenPrivateCandidate(updatedResult.rows[0]!),
    boundary: boundaryCountsFromRow(row),
  };
}

async function ensureRavenSettingsDefaults() {
  const db = await getCerebroDb();
  await db.execute({
    sql: `
      INSERT INTO raven_private_settings (id)
      VALUES (1)
      ON CONFLICT(id) DO NOTHING
    `,
    args: [],
  });
  const settingsColumns = await db.execute(`PRAGMA table_info(raven_private_settings)`);
  const existingSettingsColumns = new Set(settingsColumns.rows.map((row) => String(row.name)));
  if (!existingSettingsColumns.has("candidate_retention_mode")) {
    await db.execute(`ALTER TABLE raven_private_settings ADD COLUMN candidate_retention_mode TEXT NOT NULL DEFAULT 'keep_until_manual_delete'`);
  }
  if (!existingSettingsColumns.has("candidate_retention_local_only")) {
    await db.execute(`ALTER TABLE raven_private_settings ADD COLUMN candidate_retention_local_only INTEGER NOT NULL DEFAULT 1`);
  }
  for (const boundary of ravenHardBoundaryDefaults) {
    await db.execute({
      sql: `
        INSERT INTO raven_private_hard_boundaries (
          boundary_key,
          label,
          locked,
          enabled
        )
        VALUES (?, ?, 1, 1)
        ON CONFLICT(boundary_key) DO NOTHING
      `,
      args: [boundary.key, boundary.label],
    });
  }
  for (const source of ravenSourceAdapterDefaults) {
    await db.execute({
      sql: `
        INSERT INTO raven_private_source_adapters (
          source_id,
          label,
          source_class,
          credential_required,
          trust_label,
          adapter_confidence
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(source_id) DO NOTHING
      `,
      args: [
        source.sourceId,
        source.label,
        source.sourceClass,
        source.credentialRequired ? 1 : 0,
        source.trustLabel,
        source.adapterConfidence,
      ],
    });
  }
  return db;
}

async function readRavenSettingsState() {
  const db = await ensureRavenSettingsDefaults();
  const settingsResult = await db.execute({
    sql: `SELECT * FROM raven_private_settings WHERE id = 1 LIMIT 1`,
    args: [],
  });
  const protectionsResult = await db.execute({
    sql: `
      SELECT *
      FROM raven_private_hard_boundaries
      ORDER BY boundary_key ASC
    `,
    args: [],
  });
  const userBlocksResult = await db.execute({
    sql: `
      SELECT *
      FROM raven_private_user_blocks
      ORDER BY enabled DESC, block_type ASC, label ASC, id DESC
    `,
    args: [],
  });
  const sourcesResult = await db.execute({
    sql: `
      SELECT *
      FROM raven_private_source_adapters
      ORDER BY source_id ASC
    `,
    args: [],
  });
  const settings = rowToRavenSettings(settingsResult.rows[0]!);
  const lockedProtections = protectionsResult.rows.map(rowToRavenHardBoundary);
  const userBlocks = userBlocksResult.rows.map(rowToRavenUserBlock);
  const sourceAdapters = sourcesResult.rows.map(rowToRavenSourceAdapter);
  const enabledSearchSources = sourceAdapters.filter((source) => source.enabled && source.searchAllowed);
  const enabledUserBlocks = userBlocks.filter((block) => block.enabled);
  const sourceReadiness = sourceAdapters.map((source) => ({
    sourceId: source.sourceId,
    label: source.label,
    sourceClass: source.sourceClass,
    canSearch: settings.ravenEnabled && settings.adultDiscoveryEnabled && source.enabled && source.searchAllowed,
    enabled: source.enabled,
    searchAllowed: source.searchAllowed,
    credentialRequired: source.credentialRequired,
    trustLabel: source.trustLabel,
    adapterConfidence: source.adapterConfidence,
    blockedReasons: [
      ...(!settings.ravenEnabled ? ["raven_disabled" as const] : []),
      ...(!settings.adultDiscoveryEnabled ? ["adult_discovery_disabled" as const] : []),
      ...(!source.enabled ? ["source_disabled" as const] : []),
      ...(!source.searchAllowed ? ["source_search_disabled" as const] : []),
    ],
  }));
  const boundaryEnforcement = {
    lockedProtectionCount: lockedProtections.length,
    enforcedLockedProtectionCount: lockedProtections.filter((protection) => protection.enforced).length,
    enabledUserBlockCount: enabledUserBlocks.length,
    enabledUserBlockCountsByType: enabledUserBlocks.reduce<Record<string, number>>((counts, block) => {
      counts[block.blockType] = (counts[block.blockType] ?? 0) + 1;
      return counts;
    }, {}),
    enforcementStages: ["before_scoring"],
    allLockedProtectionsEnforced: lockedProtections.every((protection) => protection.enforced),
  };
  return {
    db,
    settings,
    lockedProtections,
    userBlocks,
    sourceAdapters,
    sourceReadiness,
    boundaryEnforcement,
    discoveryReadiness: {
      canSearch: settings.ravenEnabled && settings.adultDiscoveryEnabled && enabledSearchSources.length > 0,
      ravenEnabled: settings.ravenEnabled,
      adultDiscoveryEnabled: settings.adultDiscoveryEnabled,
      enabledSearchSourceCount: enabledSearchSources.length,
      blockedReasons: [
        ...(!settings.ravenEnabled ? ["raven_disabled" as const] : []),
        ...(!settings.adultDiscoveryEnabled ? ["adult_discovery_disabled" as const] : []),
        ...(enabledSearchSources.length === 0 ? ["no_enabled_search_source" as const] : []),
      ],
    },
  };
}

export const ravenRouter = router({
  status: publicProcedure.query(async () => {
    const activeSession = await getActiveSession();
    return {
      mode: "sealed_private_module" as const,
      status: activeSession ? "unlocked" : "sealed",
      activeSession,
      writesExternal: false,
      opensBrowser: false,
      downloadsMedia: false,
      callsExternalModels: false,
      writesCoreMemory: false,
      writesNotion: false,
      writesObsidian: false,
      gates: [
        "Unlock requires the exact two-phrase confirmation.",
        "Raven data stays in raven_private_* tables.",
        "Bridge exports are proposals only until explicitly approved.",
        "No source scanning, browser session, media download, generator call, or core-memory export is active.",
      ],
    };
  }),

  preferenceCategories: publicProcedure.query(() => ({
    mode: "sealed_private_reference" as const,
    categories: preferenceCategories,
    writesExternal: false,
    writesCoreMemory: false,
  })),

  settings: publicProcedure.query(async () => {
    const state = await readRavenSettingsState();
    return {
      mode: "sealed_settings" as const,
      settings: state.settings,
      candidateRetention: {
        mode: state.settings.candidateRetentionMode,
        localOnly: state.settings.candidateRetentionLocalOnly,
        modes: ravenCandidateRetentionModes,
        lockedToLocalRaven: true,
        batchDeleteEnabled: false,
        externalExportEnabled: false,
      },
      lockedProtections: state.lockedProtections,
      userBlocks: state.userBlocks,
      userBlockTypes: ravenUserBlockTypes,
      sourceAdapters: state.sourceAdapters,
      sourceReadiness: state.sourceReadiness,
      boundaryEnforcement: state.boundaryEnforcement,
      discoveryReadiness: state.discoveryReadiness,
      gates: [
        "Raven settings are stored only in raven_private_* tables.",
        "Locked protections are read-only enforcement receipts, not toggles.",
        "User blocks are editable toggles.",
        "Candidate retention stays local to Raven and does not enable batch delete or export.",
        "Discovery cannot run until Raven, adult discovery, and at least one source search toggle are enabled.",
        "This endpoint does not browse, fetch adult sources, download media, call models, or write core memory.",
      ],
      writesCoreMemory: false,
      writesExternal: false,
      opensBrowser: false,
      callsExternalModels: false,
      downloadsMedia: false,
    };
  }),

  discoveryReadinessReceipt: publicProcedure.query(async () => {
    const state = await readRavenSettingsState();
    return {
      mode: "sealed_discovery_readiness_receipt" as const,
      discoveryReadiness: state.discoveryReadiness,
      sourceReadiness: state.sourceReadiness,
      boundaryEnforcement: state.boundaryEnforcement,
      receipts: {
        sourceCount: state.sourceAdapters.length,
        searchableSourceCount: state.sourceReadiness.filter((source) => source.canSearch).length,
        lockedProtectionCount: state.boundaryEnforcement.lockedProtectionCount,
        enabledUserBlockCount: state.boundaryEnforcement.enabledUserBlockCount,
      },
      gates: [
        "This receipt is a local readiness check only.",
        "Future discovery must call this gate before source search.",
        "Locked protections and enabled user blocks are boundary inputs before scoring.",
        "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
      ],
      writesCoreMemory: false,
      writesExternal: false,
      opensBrowser: false,
      callsExternalModels: false,
      downloadsMedia: false,
    };
  }),

  candidateRetentionSettingsReceipt: publicProcedure.query(async () => {
    const state = await readRavenSettingsState();
    return {
      mode: "sealed_candidate_retention_settings_receipt" as const,
      candidateRetention: {
        mode: state.settings.candidateRetentionMode,
        localOnly: state.settings.candidateRetentionLocalOnly,
        modes: ravenCandidateRetentionModes,
        lockedToLocalRaven: true,
        batchDeleteEnabled: false,
        externalExportEnabled: false,
      },
      gates: [
        "Candidate retention settings are stored only in raven_private_settings.",
        "Candidate retention is locked to local Raven storage.",
        "Changing retention mode does not run batch delete.",
        "Changing retention mode does not enable external export.",
        "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
      ],
      writesCoreMemory: false,
      writesExternal: false,
      opensBrowser: false,
      callsExternalModels: false,
      downloadsMedia: false,
      deletesCandidates: false,
      deletesCandidateEvents: false,
    };
  }),

  candidateBoundaryReceipt: publicProcedure
    .input(ravenCandidateBoundaryInput)
    .query(async ({ input }) => {
      const state = await readRavenSettingsState();
      const boundaryReceipt = evaluateCandidateBoundary({
        candidate: input,
        lockedProtections: state.lockedProtections,
        userBlocks: state.userBlocks,
      });
      return {
        mode: "sealed_candidate_boundary_receipt" as const,
        boundaryReceipt,
        receipts: {
          blockedBeforeScoring: boundaryReceipt.blockedBeforeScoring,
          lockedProtectionHitCount: boundaryReceipt.lockedProtectionHitCount,
          userBlockHitCount: boundaryReceipt.userBlockHitCount,
          totalBoundaryHitCount: boundaryReceipt.totalBoundaryHitCount,
        },
        gates: [
          "This is a local candidate metadata boundary check only.",
          "Future discovery must run this before scoring.",
          "The receipt returns boundary counts and matched controls. It does not echo candidate text.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  manualCandidateNormalisationReceipt: publicProcedure
    .input(ravenManualCandidateNormalisationInput)
    .query(async ({ input }) => {
      const state = await readRavenSettingsState();
      const normalised = normaliseManualCandidate(input);
      const boundaryReceipt = evaluateCandidateBoundary({
        candidate: normalised.candidate,
        lockedProtections: state.lockedProtections,
        userBlocks: state.userBlocks,
      });
      return {
        mode: "sealed_manual_candidate_normalisation_receipt" as const,
        normalisation: normalised.receipt,
        boundaryReceipt,
        receipts: {
          normalisedShapeVersion: normalised.receipt.shapeVersion,
          blockedBeforeScoring: boundaryReceipt.blockedBeforeScoring,
          lockedProtectionHitCount: boundaryReceipt.lockedProtectionHitCount,
          userBlockHitCount: boundaryReceipt.userBlockHitCount,
          totalBoundaryHitCount: boundaryReceipt.totalBoundaryHitCount,
        },
        gates: [
          "This is a local dry-run normaliser receipt for manually supplied metadata.",
          "Candidate metadata is normalised only in memory and is not stored.",
          "Boundary enforcement runs before any scoring.",
          "The response returns shape, fingerprint, counts, and matched controls. It does not echo candidate text.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        storesCandidate: false,
        scoresCandidate: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  manualCandidateBatchDryRunReceipt: publicProcedure
    .input(ravenManualCandidateBatchDryRunInput)
    .query(async ({ input }) => {
      const state = await readRavenSettingsState();
      const items = input.candidates.map((candidateInput, index) => {
        const normalised = normaliseManualCandidate(candidateInput);
        const boundaryReceipt = evaluateCandidateBoundary({
          candidate: normalised.candidate,
          lockedProtections: state.lockedProtections,
          userBlocks: state.userBlocks,
        });
        return {
          index,
          normalisation: normalised.receipt,
          boundary: {
            blockedBeforeScoring: boundaryReceipt.blockedBeforeScoring,
            lockedProtectionHitCount: boundaryReceipt.lockedProtectionHitCount,
            userBlockHitCount: boundaryReceipt.userBlockHitCount,
            totalBoundaryHitCount: boundaryReceipt.totalBoundaryHitCount,
            lockedProtectionKeys: boundaryReceipt.lockedProtectionHits.map((hit) => hit.key),
            userBlockCountsByType: boundaryReceipt.userBlockCountsByType,
          },
          boundaryReceipt,
        };
      });
      const fingerprintCounts = items.reduce<Record<string, number>>((counts, item) => {
        counts[item.normalisation.candidateFingerprint] = (counts[item.normalisation.candidateFingerprint] ?? 0) + 1;
        return counts;
      }, {});
      const duplicateFingerprints = Object.entries(fingerprintCounts)
        .filter(([, count]) => count > 1)
        .map(([candidateFingerprint, count]) => ({ candidateFingerprint, count }));
      const boundarySummary = aggregateBoundaryReceipts(items.map((item) => item.boundaryReceipt));
      return {
        mode: "sealed_manual_candidate_batch_dry_run_receipt" as const,
        batch: {
          shapeVersion: "raven_private_candidate_batch_v1" as const,
          candidateCount: items.length,
          uniqueFingerprintCount: Object.keys(fingerprintCounts).length,
          duplicateFingerprintCount: duplicateFingerprints.length,
          duplicateCandidateCount: duplicateFingerprints.reduce((sum, item) => sum + item.count, 0),
          blockedCandidateCount: boundarySummary.blockedCandidateCount,
          clearBeforeScoringCount: items.length - boundarySummary.blockedCandidateCount,
        },
        items: items.map((item) => ({
          index: item.index,
          normalisation: item.normalisation,
          boundary: item.boundary,
        })),
        duplicateFingerprints,
        boundarySummary,
        gates: [
          "This is a local dry-run batch receipt for manually supplied metadata.",
          "Candidates are normalised only in memory and are not stored.",
          "Duplicate detection uses local fingerprints only.",
          "Boundary enforcement runs before any scoring.",
          "The response returns fingerprints, counts, and matched control categories. It does not echo candidate text.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        storesCandidates: false,
        scoresCandidates: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  candidateStorageProposalReceipt: publicProcedure.query(async () => {
    const state = await readRavenSettingsState();
    return {
      mode: "sealed_candidate_storage_proposal_receipt" as const,
      proposal: ravenCandidateStorageProposal,
      readiness: {
        canCreateCandidateStorage: false,
        reason: "This endpoint is a proposal receipt only. It does not create tables or write candidates.",
        ravenEnabled: state.settings.ravenEnabled,
        adultDiscoveryEnabled: state.settings.adultDiscoveryEnabled,
        boundaryEnforcementReady: state.boundaryEnforcement.allLockedProtectionsEnforced,
      },
      writeGates: ravenCandidateStorageProposal.requiredWriteGates,
      gates: [
        "This receipt describes the future Raven candidate storage contract only.",
        "No table is created here.",
        "No candidate row is written here.",
        "No candidate metadata is accepted by this endpoint.",
        "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
      ],
      createsTables: false,
      storesCandidates: false,
      scoresCandidates: false,
      writesCoreMemory: false,
      writesExternal: false,
      opensBrowser: false,
      callsExternalModels: false,
      downloadsMedia: false,
    };
  }),

  candidateRetentionDeleteProposalReceipt: publicProcedure.query(async () => {
    const state = await readRavenSettingsState();
    return {
      mode: "sealed_candidate_retention_delete_proposal_receipt" as const,
      proposal: ravenCandidateRetentionDeleteProposal,
      readiness: {
        canDeleteCandidates: false,
        reason: "This endpoint is a proposal receipt only. It does not delete candidates or candidate events.",
        ravenEnabled: state.settings.ravenEnabled,
        boundaryEnforcementReady: state.boundaryEnforcement.allLockedProtectionsEnforced,
      },
      deleteGates: ravenCandidateRetentionDeleteProposal.deleteGates,
      redactionPolicy: ravenCandidateRetentionDeleteProposal.redactionPolicy,
      gates: [
        "This receipt describes future Raven candidate retention and delete gates only.",
        "No candidate row is deleted here.",
        "No candidate event row is deleted here.",
        "No private candidate metadata is accepted or returned by this endpoint.",
        "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
      ],
      deletesCandidates: false,
      deletesCandidateEvents: false,
      returnsPrivateMetadata: false,
      writesCoreMemory: false,
      writesExternal: false,
      opensBrowser: false,
      callsExternalModels: false,
      downloadsMedia: false,
    };
  }),

  createManualCandidateDraft: publicProcedure
    .input(ravenManualCandidateNormalisationInput)
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const state = await readRavenSettingsState();
      if (!state.settings.ravenEnabled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Raven candidate drafts require Raven to be enabled in sealed settings.",
        });
      }
      const normalised = normaliseManualCandidate(input);
      const boundaryReceipt = evaluateCandidateBoundary({
        candidate: normalised.candidate,
        lockedProtections: state.lockedProtections,
        userBlocks: state.userBlocks,
      });
      const status = boundaryReceipt.blockedBeforeScoring ? "blocked_before_scoring" : "draft";
      const writeReceipt = {
        shapeVersion: normalised.receipt.shapeVersion,
        candidateFingerprint: normalised.receipt.candidateFingerprint,
        status,
        boundary: {
          blockedBeforeScoring: boundaryReceipt.blockedBeforeScoring,
          lockedProtectionHitCount: boundaryReceipt.lockedProtectionHitCount,
          userBlockHitCount: boundaryReceipt.userBlockHitCount,
          totalBoundaryHitCount: boundaryReceipt.totalBoundaryHitCount,
          lockedProtectionKeys: boundaryReceipt.lockedProtectionHits.map((hit) => hit.key),
          userBlockCountsByType: boundaryReceipt.userBlockCountsByType,
        },
      };
      const result = await db.execute({
        sql: `
          INSERT INTO raven_private_candidates (
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            normalised_metadata_json,
            boundary_receipt_json
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(candidate_fingerprint) DO UPDATE SET
            raven_session_id = excluded.raven_session_id,
            source_id = excluded.source_id,
            source_class = excluded.source_class,
            status = excluded.status,
            normalised_metadata_json = excluded.normalised_metadata_json,
            boundary_receipt_json = excluded.boundary_receipt_json,
            updated_at = unixepoch()
          RETURNING *
        `,
        args: [
          session.id,
          normalised.receipt.candidateFingerprint,
          normalised.receipt.sourceId,
          normalised.receipt.sourceClass,
          status,
          JSON.stringify(normalised.candidate),
          JSON.stringify(boundaryReceipt),
        ],
      });
      const candidate = rowToRavenPrivateCandidate(result.rows[0]!);
      await db.execute({
        sql: `
          INSERT INTO raven_private_candidate_events (
            candidate_id,
            raven_session_id,
            event_type,
            event_json
          )
          VALUES (?, ?, ?, ?)
        `,
        args: [
          candidate.id,
          session.id,
          "manual_candidate_draft_written",
          JSON.stringify(writeReceipt),
        ],
      });
      return {
        ok: true,
        mode: "sealed_manual_candidate_draft_write" as const,
        candidate,
        normalisation: normalised.receipt,
        boundaryReceipt,
        receipts: {
          candidateId: candidate.id,
          candidateFingerprint: candidate.candidateFingerprint,
          status,
          blockedBeforeScoring: boundaryReceipt.blockedBeforeScoring,
          lockedProtectionHitCount: boundaryReceipt.lockedProtectionHitCount,
          userBlockHitCount: boundaryReceipt.userBlockHitCount,
          totalBoundaryHitCount: boundaryReceipt.totalBoundaryHitCount,
        },
        gates: [
          "Raven session was active before the write.",
          "Raven was enabled before the write.",
          "Manual metadata was normalised before insert.",
          "Boundary enforcement ran before insert and before scoring.",
          "Private metadata was written only to raven_private_candidates.",
          "No scoring, browser, adult source fetch, media download, external model call, or core memory write ran here.",
        ],
        storesCandidate: true,
        scoresCandidate: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateListReceipt: publicProcedure
    .input(
      z
        .object({
          status: z.enum(ravenPrivateCandidateStatuses).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const where = ["raven_session_id = ?"];
      const args: Array<string | number> = [session.id];
      if (input?.status) {
        where.push("status = ?");
        args.push(input.status);
      }
      const result = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE ${where.join(" AND ")}
          ORDER BY updated_at DESC, id DESC
          LIMIT ?
        `,
        args: [...args, input?.limit ?? 50],
      });
      const rows = result.rows.map((row) => ({
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
      }));
      const byStatus = rows.reduce<Record<string, number>>((counts, row) => {
        counts[row.candidate.status] = (counts[row.candidate.status] ?? 0) + 1;
        return counts;
      }, {});
      const boundarySummary = rows.reduce(
        (summary, row) => {
          summary.blockedCandidateCount += row.boundary.blockedBeforeScoring ? 1 : 0;
          summary.lockedProtectionHitCount += row.boundary.lockedProtectionHitCount;
          summary.userBlockHitCount += row.boundary.userBlockHitCount;
          summary.totalBoundaryHitCount += row.boundary.totalBoundaryHitCount;
          for (const key of row.boundary.lockedProtectionKeys) {
            summary.lockedProtectionCountsByKey[key] = (summary.lockedProtectionCountsByKey[key] ?? 0) + 1;
          }
          for (const [type, count] of Object.entries(row.boundary.userBlockCountsByType)) {
            summary.userBlockCountsByType[type] = (summary.userBlockCountsByType[type] ?? 0) + Number(count);
          }
          return summary;
        },
        {
          blockedCandidateCount: 0,
          lockedProtectionHitCount: 0,
          userBlockHitCount: 0,
          totalBoundaryHitCount: 0,
          lockedProtectionCountsByKey: {} as Record<string, number>,
          userBlockCountsByType: {} as Record<string, number>,
        },
      );
      return {
        mode: "sealed_private_candidate_list_receipt" as const,
        filter: {
          status: input?.status ?? null,
          limit: input?.limit ?? 50,
        },
        total: rows.length,
        byStatus,
        boundarySummary,
        items: rows,
        gates: [
          "Raven session must be active before reading private candidates.",
          "This endpoint reads only raven_private_candidates receipt fields.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "The response returns ids, fingerprints, status, source, timestamps, and boundary counts only.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateQueueSummaryReceipt: publicProcedure
    .query(async () => {
      const { db, session } = await requireActiveSession();
      const candidateCountsResult = await db.execute({
        sql: `
          SELECT status, COUNT(*) AS candidate_count
          FROM raven_private_candidates
          WHERE raven_session_id = ?
          GROUP BY status
        `,
        args: [session.id],
      });
      const eventCountsResult = await db.execute({
        sql: `
          SELECT events.event_type, COUNT(DISTINCT events.candidate_id) AS candidate_count, COUNT(*) AS event_count
          FROM raven_private_candidate_events events
          INNER JOIN raven_private_candidates candidates
            ON candidates.id = events.candidate_id
           AND candidates.raven_session_id = events.raven_session_id
          WHERE events.raven_session_id = ?
          GROUP BY events.event_type
        `,
        args: [session.id],
      });
      const byStatus = candidateCountsResult.rows.reduce<Record<string, number>>((counts, row) => {
        counts[String(row.status)] = Number(row.candidate_count ?? 0);
        return counts;
      }, {});
      const totalCandidates = Object.values(byStatus).reduce((total, count) => total + count, 0);
      const eventSummary = eventCountsResult.rows.reduce<Record<string, { candidateCount: number; eventCount: number }>>((summary, row) => {
        summary[String(row.event_type)] = {
          candidateCount: Number(row.candidate_count ?? 0),
          eventCount: Number(row.event_count ?? 0),
        };
        return summary;
      }, {});
      const settings = await readRavenSettingsState();
      return {
        mode: "sealed_private_candidate_queue_summary_receipt" as const,
        queue: {
          totalCandidates,
          byStatus,
          reviewQueueStatuses: ["draft", "ready_for_private_review"] as const,
          excludedStatuses: ["blocked_before_scoring"] as const,
        },
        lifecycle: {
          withStatusTransitions: eventSummary.private_candidate_status_transition?.candidateCount ?? 0,
          withReviewNotes: eventSummary.private_candidate_review_note_draft?.candidateCount ?? 0,
          withDecisionDraftNotes: eventSummary.private_candidate_decision_draft_note?.candidateCount ?? 0,
          withAppliedDecisions: eventSummary.private_candidate_final_decision_applied?.candidateCount ?? 0,
          eventCounts: {
            statusTransitions: eventSummary.private_candidate_status_transition?.eventCount ?? 0,
            reviewNotes: eventSummary.private_candidate_review_note_draft?.eventCount ?? 0,
            decisionDraftNotes: eventSummary.private_candidate_decision_draft_note?.eventCount ?? 0,
            appliedDecisions: eventSummary.private_candidate_final_decision_applied?.eventCount ?? 0,
          },
        },
        retention: {
          mode: settings.settings.candidateRetentionMode,
          localOnly: settings.settings.candidateRetentionLocalOnly,
          lockedToLocalRaven: true,
          batchDeleteEnabled: false,
          externalExportEnabled: false,
        },
        deleteAvailability: {
          previewEndpoint: "raven.privateCandidateDeletePreviewReceipt" as const,
          deleteEndpoint: "raven.deletePrivateCandidate" as const,
          explicitConfirmationRequired: true,
          confirmationPhrase: deleteCandidatePhrase,
        },
        gates: [
          "Raven session must be active before reading private candidate queue summary.",
          "Queue summary reads only candidate status counts, event counts, and local retention settings.",
          "Private normalised metadata and raw rationale are deliberately omitted from the SELECT and response.",
          "No candidate rows, event rows, or status fields are mutated here.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        mutatesStatus: false,
        deletesCandidates: false,
        deletesCandidateEvents: false,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateQueueReceipt: publicProcedure
    .input(
      z
        .object({
          includeStatuses: z.array(z.enum(["draft", "ready_for_private_review", "kept", "skipped", "never_again"])).min(1).max(5).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const includeStatuses = input?.includeStatuses ?? ["draft", "ready_for_private_review"];
      const result = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE raven_session_id = ?
            AND status IN (${includeStatuses.map(() => "?").join(", ")})
            AND status != 'blocked_before_scoring'
          ORDER BY updated_at DESC, id DESC
          LIMIT ?
        `,
        args: [session.id, ...includeStatuses, input?.limit ?? 50],
      });
      const items = result.rows.map((row) => ({
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
      }));
      const byStatus = items.reduce<Record<string, number>>((counts, item) => {
        counts[item.candidate.status] = (counts[item.candidate.status] ?? 0) + 1;
        return counts;
      }, {});
      return {
        mode: "sealed_private_candidate_queue_receipt" as const,
        queue: {
          total: items.length,
          byStatus,
          includeStatuses,
          excludedStatuses: ["blocked_before_scoring"],
          limit: input?.limit ?? 50,
        },
        items,
        gates: [
          "Raven session must be active before reading the private candidate queue.",
          "The default queue includes review-ready local candidates only.",
          "blocked_before_scoring candidates are excluded by default.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateStatusTransitionProposalReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        proposedStatus: z.enum(ravenPrivateCandidateTransitionTargets),
        reason: z.string().min(1).max(500).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const candidate = rowToRavenPrivateCandidate(row);
      const allowedFrom = candidate.status === "draft" || candidate.status === "ready_for_private_review";
      return {
        mode: "sealed_private_candidate_status_transition_proposal_receipt" as const,
        candidate,
        boundary: boundaryCountsFromRow(row),
        proposal: {
          fromStatus: candidate.status,
          proposedStatus: input.proposedStatus,
          allowed: allowedFrom,
          reason: input.reason ?? null,
          allowedTargets: ravenPrivateCandidateTransitionTargets,
        },
        gates: [
          "Raven session must be active before proposing a candidate status transition.",
          "Candidate ownership is validated against the active Raven session.",
          "This endpoint proposes status only. It does not mutate the candidate row.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        mutatesStatus: false,
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  updatePrivateCandidateStatus: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        status: z.enum(ravenPrivateCandidateTransitionTargets),
        reason: z.string().min(1).max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const updated = await updateRavenPrivateCandidateStatus({
        db,
        session,
        candidateId: input.candidateId,
        status: input.status,
        reason: input.reason ?? null,
      });
      return {
        ok: true,
        mode: "sealed_private_candidate_status_write" as const,
        candidate: updated.updatedCandidate,
        transition: {
          fromStatus: updated.previousCandidate.status,
          toStatus: input.status,
          reason: input.reason ?? null,
        },
        boundary: updated.boundary,
        gates: [
          "Raven session was active before status mutation.",
          "Candidate ownership was validated against the active Raven session.",
          "Allowed transition validation ran before update.",
          "A redacted status transition event was written to raven_private_candidate_events.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write ran here.",
        ],
        mutatesStatus: true,
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  addPrivateCandidateReviewNoteDraftReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        reviewAction: z.enum(candidateReviewActions).optional(),
        rationale: z.string().min(1).max(1200),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const candidate = rowToRavenPrivateCandidate(row);
      const scrubbed = scrubPrivateText(input.rationale);
      const reviewNoteFingerprint = hashText(`${candidate.candidateFingerprint}|${input.rationale}`);
      const eventResult = await db.execute({
        sql: `
          INSERT INTO raven_private_candidate_events (
            candidate_id,
            raven_session_id,
            event_type,
            event_json
          )
          VALUES (?, ?, ?, ?)
          RETURNING
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
        `,
        args: [
          input.candidateId,
          session.id,
          "private_candidate_review_note_draft",
          JSON.stringify({
            candidateFingerprint: candidate.candidateFingerprint,
            status: candidate.status,
            reviewAction: input.reviewAction ?? null,
            reviewNoteFingerprint,
            rationaleCharCount: input.rationale.length,
            rationaleWordCount: input.rationale.trim().split(/\s+/).filter(Boolean).length,
            redactionFindingCount: scrubbed.findings.length,
            redactionFindings: scrubbed.findings.map((finding) => ({
              label: finding.label,
              severity: finding.severity,
            })),
            redactedRationale: `[private_rationale_redacted:${reviewNoteFingerprint.slice(0, 12)}]`,
            boundary: boundaryCountsFromRow(row),
          }),
        ],
      });
      const statusResult = await db.execute({
        sql: `
          SELECT status
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      return {
        ok: true,
        mode: "sealed_private_candidate_review_note_draft_receipt" as const,
        candidate,
        reviewNote: rowToRavenPrivateCandidateEventReceipt(eventResult.rows[0]!),
        receipts: {
          candidateId: input.candidateId,
          statusUnchanged: String(statusResult.rows[0]?.status) === candidate.status,
          storesRawRationale: false,
          reviewNoteFingerprint,
        },
        gates: [
          "Raven session was active before review note draft write.",
          "Candidate ownership was validated against the active Raven session.",
          "The event stores a redacted rationale receipt, not raw rationale text.",
          "This endpoint does not change candidate status.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write ran here.",
        ],
        appendOnly: true,
        mutatesStatus: false,
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateReviewNoteHistoryReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const historyResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input.candidateId, session.id, "private_candidate_review_note_draft", input.limit],
      });
      const reviewNoteEvents = historyResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      return {
        mode: "sealed_private_candidate_review_note_history_receipt" as const,
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
        reviewNoteEvents,
        receipts: {
          candidateId: input.candidateId,
          eventCount: reviewNoteEvents.length,
          latestEventType: reviewNoteEvents[0]?.eventType ?? null,
          limit: input.limit,
        },
        gates: [
          "Raven session must be active before reading private candidate review note history.",
          "Candidate ownership is validated against the active Raven session.",
          "This endpoint reads only redacted private_candidate_review_note_draft event receipts.",
          "Private normalised metadata and raw rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateDecisionDraftNoteHistoryReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const historyResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input.candidateId, session.id, "private_candidate_decision_draft_note", input.limit],
      });
      const decisionDraftNoteEvents = historyResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      return {
        mode: "sealed_private_candidate_decision_draft_note_history_receipt" as const,
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
        decisionDraftNoteEvents,
        receipts: {
          candidateId: input.candidateId,
          eventCount: decisionDraftNoteEvents.length,
          latestEventType: decisionDraftNoteEvents[0]?.eventType ?? null,
          limit: input.limit,
        },
        gates: [
          "Raven session must be active before reading private candidate decision draft note history.",
          "Candidate ownership is validated against the active Raven session.",
          "This endpoint reads only redacted private_candidate_decision_draft_note event receipts.",
          "Private normalised metadata and raw decision rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateAppliedDecisionHistoryReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const historyResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input.candidateId, session.id, "private_candidate_final_decision_applied", input.limit],
      });
      const appliedDecisionEvents = historyResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      return {
        mode: "sealed_private_candidate_applied_decision_history_receipt" as const,
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
        appliedDecisionEvents,
        receipts: {
          candidateId: input.candidateId,
          eventCount: appliedDecisionEvents.length,
          latestEventType: appliedDecisionEvents[0]?.eventType ?? null,
          limit: input.limit,
        },
        gates: [
          "Raven session must be active before reading private candidate applied decision history.",
          "Candidate ownership is validated against the active Raven session.",
          "This endpoint reads only redacted private_candidate_final_decision_applied event receipts.",
          "Private normalised metadata and raw rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateLifecycleReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const eventCountsResult = await db.execute({
        sql: `
          SELECT event_type, COUNT(*) AS event_count, MAX(created_at) AS latest_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
          GROUP BY event_type
        `,
        args: [input.candidateId, session.id],
      });
      const eventCounts = new Map(eventCountsResult.rows.map((eventRow) => [
        String(eventRow.event_type),
        {
          count: Number(eventRow.event_count ?? 0),
          latestAt: eventRow.latest_at == null ? null : Number(eventRow.latest_at),
        },
      ]));
      const countFor = (eventType: string) => eventCounts.get(eventType)?.count ?? 0;
      const latestFor = (eventType: string) => eventCounts.get(eventType)?.latestAt ?? null;
      const candidate = rowToRavenPrivateCandidate(row);
      const settings = await readRavenSettingsState();
      const allowedFromStatus = candidate.status === "draft" || candidate.status === "ready_for_private_review";
      return {
        mode: "sealed_private_candidate_lifecycle_receipt" as const,
        candidate,
        boundary: boundaryCountsFromRow(row),
        lifecycle: {
          currentStatus: candidate.status,
          statusTransitionCount: countFor("private_candidate_status_transition"),
          reviewNoteCount: countFor("private_candidate_review_note_draft"),
          decisionDraftNoteCount: countFor("private_candidate_decision_draft_note"),
          appliedDecisionCount: countFor("private_candidate_final_decision_applied"),
          latestStatusTransitionAt: latestFor("private_candidate_status_transition"),
          latestReviewNoteAt: latestFor("private_candidate_review_note_draft"),
          latestDecisionDraftNoteAt: latestFor("private_candidate_decision_draft_note"),
          latestAppliedDecisionAt: latestFor("private_candidate_final_decision_applied"),
        },
        retention: {
          mode: settings.settings.candidateRetentionMode,
          localOnly: settings.settings.candidateRetentionLocalOnly,
          lockedToLocalRaven: true,
          batchDeleteEnabled: false,
          externalExportEnabled: false,
        },
        deleteAvailability: {
          previewEndpoint: "raven.privateCandidateDeletePreviewReceipt" as const,
          deleteEndpoint: "raven.deletePrivateCandidate" as const,
          explicitConfirmationRequired: true,
          confirmationPhrase: deleteCandidatePhrase,
          canPreviewDelete: true,
          canDeleteWithConfirmation: true,
          wouldDeleteCandidateEvents: Array.from(eventCounts.values()).reduce((total, item) => total + item.count, 0),
        },
        transitionAvailability: {
          canTransitionFromCurrentStatus: allowedFromStatus,
          allowedTargets: allowedFromStatus ? ravenPrivateCandidateTransitionTargets : [],
        },
        gates: [
          "Raven session must be active before reading private candidate lifecycle.",
          "Candidate ownership is validated against the active Raven session.",
          "Lifecycle receipt reads only receipt-safe candidate fields, event counts, timestamps, and retention settings.",
          "Private normalised metadata and raw rationale are deliberately omitted from the SELECT and response.",
          "No delete or status mutation runs here.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        mutatesStatus: false,
        deletesCandidates: false,
        deletesCandidateEvents: false,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateReviewDossierReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const readEvents = async (eventType: string) => {
        const result = await db.execute({
          sql: `
            SELECT
              id,
              candidate_id,
              raven_session_id,
              event_type,
              event_json,
              created_at
            FROM raven_private_candidate_events
            WHERE candidate_id = ?
              AND raven_session_id = ?
              AND event_type = ?
            ORDER BY created_at DESC, id DESC
            LIMIT ?
          `,
          args: [input.candidateId, session.id, eventType, input.limit],
        });
        return result.rows.map(rowToRavenPrivateCandidateEventReceipt);
      };
      const [statusEvents, reviewNoteEvents, decisionDraftNoteEvents] = await Promise.all([
        readEvents("private_candidate_status_transition"),
        readEvents("private_candidate_review_note_draft"),
        readEvents("private_candidate_decision_draft_note"),
      ]);
      const candidate = rowToRavenPrivateCandidate(row);
      const reviewActions = [...new Set(reviewNoteEvents.map((event) => event.reviewAction).filter((action): action is string => Boolean(action)))];
      const decision = proposeRavenPrivateCandidateDecision({
        status: candidate.status,
        statusEventCount: statusEvents.length,
        reviewNoteEventCount: reviewNoteEvents.length,
        reviewActions,
      });
      return {
        mode: "sealed_private_candidate_review_dossier_receipt" as const,
        candidate,
        boundary: boundaryCountsFromRow(row),
        statusEvents,
        reviewNoteEvents,
        decisionDraftNoteEvents,
        proposal: {
          proposedStatus: decision.proposedStatus,
          allowedTargets: ["kept", "skipped", "never_again"] as const,
          reason: decision.reason,
          confidence: decision.confidence,
          appliesStatus: false,
          requiresExplicitMutation: true,
        },
        receipts: {
          candidateId: input.candidateId,
          statusEventCount: statusEvents.length,
          reviewNoteEventCount: reviewNoteEvents.length,
          decisionDraftNoteEventCount: decisionDraftNoteEvents.length,
          latestStatusEventType: statusEvents[0]?.eventType ?? null,
          latestReviewNoteEventType: reviewNoteEvents[0]?.eventType ?? null,
          latestDecisionDraftNoteEventType: decisionDraftNoteEvents[0]?.eventType ?? null,
          limit: input.limit,
        },
        gates: [
          "Raven session must be active before reading a private candidate review dossier.",
          "Candidate ownership is validated against the active Raven session.",
          "Dossier reads only receipt-safe candidate fields and redacted event receipt lanes.",
          "Decision proposal is advisory only. This endpoint does not mutate candidate status.",
          "Private normalised metadata, raw review rationale, and raw decision rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        mutatesStatus: false,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateFinalDecisionApplyProposalReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const readEvents = async (eventType: string) => {
        const result = await db.execute({
          sql: `
            SELECT
              id,
              candidate_id,
              raven_session_id,
              event_type,
              event_json,
              created_at
            FROM raven_private_candidate_events
            WHERE candidate_id = ?
              AND raven_session_id = ?
              AND event_type = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 25
          `,
          args: [input.candidateId, session.id, eventType],
        });
        return result.rows.map(rowToRavenPrivateCandidateEventReceipt);
      };
      const [statusEvents, reviewNoteEvents, decisionDraftNoteEvents] = await Promise.all([
        readEvents("private_candidate_status_transition"),
        readEvents("private_candidate_review_note_draft"),
        readEvents("private_candidate_decision_draft_note"),
      ]);
      const candidate = rowToRavenPrivateCandidate(row);
      const reviewActions = [...new Set(reviewNoteEvents.map((event) => event.reviewAction).filter((action): action is string => Boolean(action)))];
      const decision = proposeRavenPrivateCandidateDecision({
        status: candidate.status,
        statusEventCount: statusEvents.length,
        reviewNoteEventCount: reviewNoteEvents.length,
        reviewActions,
      });
      const allowedFromStatus = candidate.status === "draft" || candidate.status === "ready_for_private_review";
      const alreadyAtProposedStatus = candidate.status === decision.proposedStatus;
      const hasDecisionDraftNote = decisionDraftNoteEvents.some((event) => (
        event.proposedStatus === decision.proposedStatus
          && event.decisionReason === decision.reason
      ));
      const canApplyWithExplicitMutation = allowedFromStatus && !alreadyAtProposedStatus && hasDecisionDraftNote;
      const blockedReasons = [
        ...(allowedFromStatus ? [] : ["current_status_cannot_transition"]),
        ...(alreadyAtProposedStatus ? ["candidate_already_has_proposed_status"] : []),
        ...(hasDecisionDraftNote ? [] : ["matching_decision_draft_note_missing"]),
      ];
      return {
        mode: "sealed_private_candidate_final_decision_apply_proposal_receipt" as const,
        candidate,
        boundary: boundaryCountsFromRow(row),
        proposal: {
          proposedStatus: decision.proposedStatus,
          reason: decision.reason,
          confidence: decision.confidence,
          allowedTargets: ["kept", "skipped", "never_again"] as const,
        },
        apply: {
          canApplyWithExplicitMutation,
          blockedReasons,
          requiredMutation: "raven.updatePrivateCandidateStatus" as const,
          requiredStatus: decision.proposedStatus,
          requiresExplicitMutation: true,
          mutatesStatusHere: false,
        },
        receipts: {
          candidateId: input.candidateId,
          currentStatus: candidate.status,
          proposedStatus: decision.proposedStatus,
          statusEventCount: statusEvents.length,
          reviewNoteEventCount: reviewNoteEvents.length,
          decisionDraftNoteEventCount: decisionDraftNoteEvents.length,
          matchingDecisionDraftNotePresent: hasDecisionDraftNote,
        },
        gates: [
          "Raven session must be active before proposing final decision application.",
          "Candidate ownership is validated against the active Raven session.",
          "Apply proposal reads only receipt-safe candidate fields and redacted event receipt lanes.",
          "This endpoint does not mutate candidate status. Use the explicit status mutation endpoint separately.",
          "Private normalised metadata, raw review rationale, and raw decision rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        mutatesStatus: false,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  applyPrivateCandidateFinalDecisionReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        proposedStatus: z.enum(["kept", "skipped", "never_again"]),
        reason: z.string().min(1).max(800),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const readEvents = async (eventType: string) => {
        const result = await db.execute({
          sql: `
            SELECT
              id,
              candidate_id,
              raven_session_id,
              event_type,
              event_json,
              created_at
            FROM raven_private_candidate_events
            WHERE candidate_id = ?
              AND raven_session_id = ?
              AND event_type = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 25
          `,
          args: [input.candidateId, session.id, eventType],
        });
        return result.rows.map(rowToRavenPrivateCandidateEventReceipt);
      };
      const [statusEvents, reviewNoteEvents, decisionDraftNoteEvents] = await Promise.all([
        readEvents("private_candidate_status_transition"),
        readEvents("private_candidate_review_note_draft"),
        readEvents("private_candidate_decision_draft_note"),
      ]);
      const candidate = rowToRavenPrivateCandidate(row);
      const reviewActions = [...new Set(reviewNoteEvents.map((event) => event.reviewAction).filter((action): action is string => Boolean(action)))];
      const decision = proposeRavenPrivateCandidateDecision({
        status: candidate.status,
        statusEventCount: statusEvents.length,
        reviewNoteEventCount: reviewNoteEvents.length,
        reviewActions,
      });
      const hasDecisionDraftNote = decisionDraftNoteEvents.some((event) => (
        event.proposedStatus === decision.proposedStatus
          && event.decisionReason === decision.reason
      ));
      const allowedFromStatus = candidate.status === "draft" || candidate.status === "ready_for_private_review";
      const alreadyAtProposedStatus = candidate.status === decision.proposedStatus;
      const canApplyWithExplicitMutation = allowedFromStatus && !alreadyAtProposedStatus && hasDecisionDraftNote;
      if (!canApplyWithExplicitMutation || input.proposedStatus !== decision.proposedStatus || input.reason !== decision.reason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Private candidate final decision apply must match a ready apply proposal.",
        });
      }
      const updated = await updateRavenPrivateCandidateStatus({
        db,
        session,
        candidateId: input.candidateId,
        status: input.proposedStatus,
        reason: input.reason,
      });
      const finalEventResult = await db.execute({
        sql: `
          INSERT INTO raven_private_candidate_events (
            candidate_id,
            raven_session_id,
            event_type,
            event_json
          )
          VALUES (?, ?, ?, ?)
          RETURNING
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
        `,
        args: [
          input.candidateId,
          session.id,
          "private_candidate_final_decision_applied",
          JSON.stringify({
            candidateFingerprint: candidate.candidateFingerprint,
            fromStatus: updated.previousCandidate.status,
            status: updated.updatedCandidate.status,
            proposedStatus: input.proposedStatus,
            decisionReason: input.reason,
            statusEventCount: statusEvents.length,
            reviewNoteEventCount: reviewNoteEvents.length,
            decisionDraftNoteEventCount: decisionDraftNoteEvents.length,
            boundary: updated.boundary,
          }),
        ],
      });
      return {
        ok: true,
        mode: "sealed_private_candidate_final_decision_apply_write" as const,
        candidate: updated.updatedCandidate,
        transition: {
          fromStatus: updated.previousCandidate.status,
          toStatus: updated.updatedCandidate.status,
          reason: input.reason,
        },
        finalDecisionEvent: rowToRavenPrivateCandidateEventReceipt(finalEventResult.rows[0]!),
        receipts: {
          candidateId: input.candidateId,
          appliedStatus: updated.updatedCandidate.status,
          wroteStatusTransitionEvent: true,
          wroteFinalDecisionEvent: true,
        },
        gates: [
          "Raven session was active before final decision apply.",
          "Candidate ownership was validated against the active Raven session.",
          "A ready apply proposal existed and matched the submitted status and reason.",
          "The same sealed status update helper used by raven.updatePrivateCandidateStatus performed the status mutation.",
          "A redacted final decision apply event was written to raven_private_candidate_events.",
          "Private normalised metadata and raw rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write ran here.",
        ],
        mutatesStatus: true,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateDecisionProposalReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const statusEventsResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT 25
        `,
        args: [input.candidateId, session.id, "private_candidate_status_transition"],
      });
      const reviewNoteEventsResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT 25
        `,
        args: [input.candidateId, session.id, "private_candidate_review_note_draft"],
      });
      const candidate = rowToRavenPrivateCandidate(row);
      const statusEvents = statusEventsResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      const reviewNoteEvents = reviewNoteEventsResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      const reviewActions = [...new Set(reviewNoteEvents.map((event) => event.reviewAction).filter((action): action is string => Boolean(action)))];
      const decision = proposeRavenPrivateCandidateDecision({
        status: candidate.status,
        statusEventCount: statusEvents.length,
        reviewNoteEventCount: reviewNoteEvents.length,
        reviewActions,
      });
      return {
        mode: "sealed_private_candidate_decision_proposal_receipt" as const,
        candidate,
        boundary: boundaryCountsFromRow(row),
        proposal: {
          proposedStatus: decision.proposedStatus,
          allowedTargets: ["kept", "skipped", "never_again"] as const,
          reason: decision.reason,
          confidence: decision.confidence,
          appliesStatus: false,
          requiresExplicitMutation: true,
        },
        evidence: {
          statusEventCount: statusEvents.length,
          reviewNoteEventCount: reviewNoteEvents.length,
          reviewActions,
          latestStatusEventType: statusEvents[0]?.eventType ?? null,
          latestReviewNoteEventType: reviewNoteEvents[0]?.eventType ?? null,
        },
        gates: [
          "Raven session must be active before proposing a private candidate decision.",
          "Candidate ownership is validated against the active Raven session.",
          "Decision proposal reads only receipt-safe candidate fields, status history receipts, and review note history receipts.",
          "This endpoint is advisory only. It does not mutate candidate status.",
          "Private normalised metadata and raw rationale are deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        mutatesStatus: false,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  addPrivateCandidateDecisionDraftNoteReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        proposedStatus: z.enum(["kept", "skipped", "never_again"]),
        reason: z.string().min(1).max(800),
        rationale: z.string().min(1).max(1200),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const statusEventsResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT 25
        `,
        args: [input.candidateId, session.id, "private_candidate_status_transition"],
      });
      const reviewNoteEventsResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT 25
        `,
        args: [input.candidateId, session.id, "private_candidate_review_note_draft"],
      });
      const candidate = rowToRavenPrivateCandidate(row);
      const statusEvents = statusEventsResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      const reviewNoteEvents = reviewNoteEventsResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      const reviewActions = [...new Set(reviewNoteEvents.map((event) => event.reviewAction).filter((action): action is string => Boolean(action)))];
      const decision = proposeRavenPrivateCandidateDecision({
        status: candidate.status,
        statusEventCount: statusEvents.length,
        reviewNoteEventCount: reviewNoteEvents.length,
        reviewActions,
      });
      if (input.proposedStatus !== decision.proposedStatus || input.reason !== decision.reason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Private candidate decision draft note must match the current decision proposal.",
        });
      }
      const scrubbed = scrubPrivateText(input.rationale);
      const decisionDraftFingerprint = hashText(`${candidate.candidateFingerprint}|${input.proposedStatus}|${input.reason}|${input.rationale}`);
      const eventResult = await db.execute({
        sql: `
          INSERT INTO raven_private_candidate_events (
            candidate_id,
            raven_session_id,
            event_type,
            event_json
          )
          VALUES (?, ?, ?, ?)
          RETURNING
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
        `,
        args: [
          input.candidateId,
          session.id,
          "private_candidate_decision_draft_note",
          JSON.stringify({
            candidateFingerprint: candidate.candidateFingerprint,
            status: candidate.status,
            proposedStatus: input.proposedStatus,
            decisionReason: input.reason,
            confidence: decision.confidence,
            decisionDraftFingerprint,
            decisionRationaleCharCount: input.rationale.length,
            decisionRationaleWordCount: input.rationale.trim().split(/\s+/).filter(Boolean).length,
            redactionFindingCount: scrubbed.findings.length,
            redactionFindings: scrubbed.findings.map((finding) => ({
              label: finding.label,
              severity: finding.severity,
            })),
            redactedDecisionRationale: `[private_decision_rationale_redacted:${decisionDraftFingerprint.slice(0, 12)}]`,
            evidence: {
              statusEventCount: statusEvents.length,
              reviewNoteEventCount: reviewNoteEvents.length,
              reviewActions,
            },
            boundary: boundaryCountsFromRow(row),
          }),
        ],
      });
      const statusResult = await db.execute({
        sql: `
          SELECT status
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      return {
        ok: true,
        mode: "sealed_private_candidate_decision_draft_note_receipt" as const,
        candidate,
        decisionDraftNote: rowToRavenPrivateCandidateEventReceipt(eventResult.rows[0]!),
        proposal: {
          proposedStatus: decision.proposedStatus,
          reason: decision.reason,
          confidence: decision.confidence,
          appliesStatus: false,
          requiresExplicitMutation: true,
        },
        evidence: {
          statusEventCount: statusEvents.length,
          reviewNoteEventCount: reviewNoteEvents.length,
          reviewActions,
        },
        receipts: {
          candidateId: input.candidateId,
          statusUnchanged: String(statusResult.rows[0]?.status) === candidate.status,
          storesRawRationale: false,
          decisionDraftFingerprint,
        },
        gates: [
          "Raven session was active before decision draft note write.",
          "Candidate ownership was validated against the active Raven session.",
          "Decision draft note must match the current sealed decision proposal.",
          "The event stores a redacted decision rationale receipt, not raw rationale text.",
          "This endpoint does not change candidate status.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write ran here.",
        ],
        appendOnly: true,
        mutatesStatus: false,
        returnsPrivateMetadata: false,
        returnsRawRationale: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateStatusHistoryReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const historyResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
            AND event_type = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input.candidateId, session.id, "private_candidate_status_transition", input.limit],
      });
      const transitionEvents = historyResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      return {
        mode: "sealed_private_candidate_status_history_receipt" as const,
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
        transitionEvents,
        receipts: {
          candidateId: input.candidateId,
          eventCount: transitionEvents.length,
          latestEventType: transitionEvents[0]?.eventType ?? null,
          limit: input.limit,
        },
        gates: [
          "Raven session must be active before reading private candidate status history.",
          "Candidate ownership is validated against the active Raven session.",
          "This endpoint reads only redacted private_candidate_status_transition event receipts.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateDetailReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const eventsResult = await db.execute({
        sql: `
          SELECT
            id,
            candidate_id,
            raven_session_id,
            event_type,
            event_json,
            created_at
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
          ORDER BY created_at DESC, id DESC
        `,
        args: [input.candidateId, session.id],
      });
      const eventReceipts = eventsResult.rows.map(rowToRavenPrivateCandidateEventReceipt);
      return {
        mode: "sealed_private_candidate_detail_receipt" as const,
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
        eventReceipts,
        receipts: {
          candidateId: input.candidateId,
          eventCount: eventReceipts.length,
          latestEventType: eventReceipts[0]?.eventType ?? null,
        },
        gates: [
          "Raven session must be active before reading private candidate detail.",
          "This endpoint reads only receipt-safe candidate fields and event receipt fields.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "The response returns one candidate receipt, boundary counts, and candidate event receipts only.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  privateCandidateDeletePreviewReceipt: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const eventCountResult = await db.execute({
        sql: `
          SELECT COUNT(*) AS event_count
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
        `,
        args: [input.candidateId, session.id],
      });
      const eventCount = Number(eventCountResult.rows[0]?.event_count ?? 0);
      return {
        mode: "sealed_private_candidate_delete_preview_receipt" as const,
        candidate: rowToRavenPrivateCandidate(row),
        boundary: boundaryCountsFromRow(row),
        receipts: {
          candidateId: input.candidateId,
          eventCount,
          wouldDeleteCandidate: true,
          wouldDeleteCandidateEvents: eventCount,
        },
        gates: [
          "Raven session must be active before previewing delete.",
          "Candidate ownership is validated against the active Raven session.",
          "This preview reads only receipt-safe candidate fields and event count.",
          "Private normalised metadata is deliberately omitted from the SELECT and response.",
          "No delete runs here. A future destructive mutation must require a second explicit confirmation phrase.",
          "No browser, adult source fetch, media download, external model call, or core memory write runs here.",
        ],
        previewOnly: true,
        deletesCandidates: false,
        deletesCandidateEvents: false,
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  deletePrivateCandidate: publicProcedure
    .input(
      z.object({
        candidateId: z.number().int().positive(),
        candidateFingerprint: z.string().min(64).max(64),
        previewEventCount: z.number().int().min(0),
        confirmPhrase: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (normalizePhrase(input.confirmPhrase) !== deleteCandidatePhrase) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Raven candidate delete requires the exact delete confirmation phrase.",
        });
      }
      const { db, session } = await requireActiveSession();
      const candidateResult = await db.execute({
        sql: `
          SELECT
            id,
            raven_session_id,
            candidate_fingerprint,
            source_id,
            source_class,
            status,
            boundary_receipt_json,
            created_at,
            updated_at
          FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const row = candidateResult.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No sealed Raven private candidate matched that id.",
        });
      }
      const candidate = rowToRavenPrivateCandidate(row);
      if (candidate.candidateFingerprint !== input.candidateFingerprint) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Raven candidate delete preview fingerprint did not match the current row.",
        });
      }
      const eventCountResult = await db.execute({
        sql: `
          SELECT COUNT(*) AS event_count
          FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
        `,
        args: [input.candidateId, session.id],
      });
      const eventCount = Number(eventCountResult.rows[0]?.event_count ?? 0);
      if (eventCount !== input.previewEventCount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Raven candidate delete preview event count is stale.",
        });
      }
      const boundary = boundaryCountsFromRow(row);
      await db.execute({
        sql: `
          DELETE FROM raven_private_candidate_events
          WHERE candidate_id = ?
            AND raven_session_id = ?
        `,
        args: [input.candidateId, session.id],
      });
      await db.execute({
        sql: `
          DELETE FROM raven_private_candidates
          WHERE id = ?
            AND raven_session_id = ?
        `,
        args: [input.candidateId, session.id],
      });
      return {
        ok: true,
        mode: "sealed_private_candidate_delete" as const,
        deletedCandidate: candidate,
        boundary,
        receipts: {
          candidateId: input.candidateId,
          candidateFingerprint: candidate.candidateFingerprint,
          deletedCandidate: true,
          deletedCandidateEvents: eventCount,
          status: candidate.status,
        },
        gates: [
          "Raven session was active before delete.",
          "Candidate ownership was validated against the active Raven session.",
          "Preview-compatible fingerprint and event count were checked before delete.",
          "The exact second delete confirmation phrase was required.",
          "Candidate events were deleted before the candidate row.",
          "No private normalised metadata is returned by this mutation.",
          "No browser, adult source fetch, media download, external model call, or core memory write ran here.",
        ],
        deletesCandidates: true,
        deletesCandidateEvents: true,
        returnsPrivateMetadata: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  updateSettings: publicProcedure
    .input(
      z.object({
        ravenEnabled: z.boolean().optional(),
        adultDiscoveryEnabled: z.boolean().optional(),
        runSourceSearchFromChat: z.boolean().optional(),
        explicitSearchOnly: z.boolean().optional(),
        backgroundDiscoveryEnabled: z.boolean().optional(),
        thumbnailsAllowed: z.boolean().optional(),
        previewMediaAllowed: z.boolean().optional(),
        externalModelPrivateContentAllowed: z.boolean().optional(),
        candidateRetentionMode: z.enum(ravenCandidateRetentionModes).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.externalModelPrivateContentAllowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Private Raven content cannot be sent to external models in V1.",
        });
      }
      const state = await readRavenSettingsState();
      await state.db.execute({
        sql: `
          UPDATE raven_private_settings
          SET raven_enabled = COALESCE(?, raven_enabled),
              adult_discovery_enabled = COALESCE(?, adult_discovery_enabled),
              run_source_search_from_chat = COALESCE(?, run_source_search_from_chat),
              explicit_search_only = COALESCE(?, explicit_search_only),
              background_discovery_enabled = COALESCE(?, background_discovery_enabled),
              thumbnails_allowed = COALESCE(?, thumbnails_allowed),
              preview_media_allowed = COALESCE(?, preview_media_allowed),
              external_model_private_content_allowed = 0,
              candidate_retention_mode = COALESCE(?, candidate_retention_mode),
              candidate_retention_local_only = 1,
              updated_at = unixepoch()
          WHERE id = 1
        `,
        args: [
          input.ravenEnabled == null ? null : input.ravenEnabled ? 1 : 0,
          input.adultDiscoveryEnabled == null ? null : input.adultDiscoveryEnabled ? 1 : 0,
          input.runSourceSearchFromChat == null ? null : input.runSourceSearchFromChat ? 1 : 0,
          input.explicitSearchOnly == null ? null : input.explicitSearchOnly ? 1 : 0,
          input.backgroundDiscoveryEnabled == null ? null : input.backgroundDiscoveryEnabled ? 1 : 0,
          input.thumbnailsAllowed == null ? null : input.thumbnailsAllowed ? 1 : 0,
          input.previewMediaAllowed == null ? null : input.previewMediaAllowed ? 1 : 0,
          input.candidateRetentionMode ?? null,
        ],
      });
      const next = await readRavenSettingsState();
      return {
        ok: true,
        mode: "sealed_settings_write" as const,
        settings: next.settings,
        candidateRetention: {
          mode: next.settings.candidateRetentionMode,
          localOnly: next.settings.candidateRetentionLocalOnly,
          modes: ravenCandidateRetentionModes,
          lockedToLocalRaven: true,
          batchDeleteEnabled: false,
          externalExportEnabled: false,
        },
        discoveryReadiness: next.discoveryReadiness,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  addUserBlock: publicProcedure
    .input(
      z.object({
        blockType: z.enum(ravenUserBlockTypes),
        label: z.string().min(1).max(120),
        value: z.string().min(1).max(240),
        enabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const state = await readRavenSettingsState();
      await state.db.execute({
        sql: `
          INSERT INTO raven_private_user_blocks (
            block_type,
            label,
            value,
            enabled
          )
          VALUES (?, ?, ?, ?)
          ON CONFLICT(block_type, value) DO UPDATE SET
            label = excluded.label,
            enabled = excluded.enabled,
            updated_at = unixepoch()
        `,
        args: [input.blockType, input.label, input.value, input.enabled === false ? 0 : 1],
      });
      const next = await readRavenSettingsState();
      return {
        ok: true,
        mode: "sealed_user_block_write" as const,
        userBlocks: next.userBlocks,
        boundaryEnforcement: next.boundaryEnforcement,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  updateUserBlock: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const state = await readRavenSettingsState();
      const block = state.userBlocks.find((item) => item.id === input.id);
      if (!block) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Raven user block matched that id.",
        });
      }
      await state.db.execute({
        sql: `
          UPDATE raven_private_user_blocks
          SET enabled = ?,
              updated_at = unixepoch()
          WHERE id = ?
        `,
        args: [input.enabled ? 1 : 0, input.id],
      });
      const next = await readRavenSettingsState();
      return {
        ok: true,
        mode: "sealed_user_block_toggle" as const,
        userBlocks: next.userBlocks,
        boundaryEnforcement: next.boundaryEnforcement,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  updateSourceAdapter: publicProcedure
    .input(
      z.object({
        sourceId: z.string().min(1),
        enabled: z.boolean().optional(),
        searchAllowed: z.boolean().optional(),
        urlEnrichmentAllowed: z.boolean().optional(),
        thumbnailsAllowed: z.boolean().optional(),
        previewMediaAllowed: z.boolean().optional(),
        notes: z.string().max(500).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const state = await readRavenSettingsState();
      const source = state.sourceAdapters.find((item) => item.sourceId === input.sourceId);
      if (!source) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Raven source adapter matched that id.",
        });
      }
      await state.db.execute({
        sql: `
          UPDATE raven_private_source_adapters
          SET enabled = COALESCE(?, enabled),
              search_allowed = COALESCE(?, search_allowed),
              url_enrichment_allowed = COALESCE(?, url_enrichment_allowed),
              thumbnails_allowed = COALESCE(?, thumbnails_allowed),
              preview_media_allowed = COALESCE(?, preview_media_allowed),
              notes = COALESCE(?, notes),
              updated_at = unixepoch()
          WHERE source_id = ?
        `,
        args: [
          input.enabled == null ? null : input.enabled ? 1 : 0,
          input.searchAllowed == null ? null : input.searchAllowed ? 1 : 0,
          input.urlEnrichmentAllowed == null ? null : input.urlEnrichmentAllowed ? 1 : 0,
          input.thumbnailsAllowed == null ? null : input.thumbnailsAllowed ? 1 : 0,
          input.previewMediaAllowed == null ? null : input.previewMediaAllowed ? 1 : 0,
          input.notes ?? null,
          input.sourceId,
        ],
      });
      const next = await readRavenSettingsState();
      return {
        ok: true,
        mode: "sealed_source_write" as const,
        sourceAdapters: next.sourceAdapters,
        discoveryReadiness: next.discoveryReadiness,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        downloadsMedia: false,
      };
    }),

  preferenceRollup: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          limitPerCategory: z.number().int().min(1).max(10).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          rollups: [],
          recommendationSeeds: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_private_preferences
          WHERE raven_session_id = ?
          ORDER BY created_at DESC, id DESC
        `,
        args: [sessionId],
      });
      const preferences = result.rows.map(rowToPreference);
      const limitPerCategory = input?.limitPerCategory ?? 5;
      const now = Math.floor(Date.now() / 1000);
      const rollups = preferenceCategories.map((category) => {
        const categoryPreferences = preferences.filter((preference) => preference.category === category);
        const totalWeight = categoryPreferences.reduce((sum, preference) => sum + preference.weight, 0);
        const positive = categoryPreferences
          .filter((preference) => preference.weight > 0)
          .sort((a, b) => b.weight - a.weight || b.createdAt - a.createdAt)
          .slice(0, limitPerCategory);
        const negative = categoryPreferences
          .filter((preference) => preference.weight < 0)
          .sort((a, b) => a.weight - b.weight || b.createdAt - a.createdAt)
          .slice(0, limitPerCategory);
        const latestAt = categoryPreferences[0]?.createdAt ?? null;
        const decayBucket = ageBucket(latestAt, now);
        const absoluteWeight = categoryPreferences.reduce((sum, preference) => sum + Math.abs(preference.weight), 0);
        return {
          category,
          totalSignals: categoryPreferences.length,
          totalWeight,
          decayedWeight: Number((totalWeight * decayMultiplier(decayBucket)).toFixed(2)),
          contradictionState: contradictionState(positive.length, negative.length),
          decayBucket,
          confidence: scoreConfidence(
            categoryPreferences.length,
            absoluteWeight,
          ),
          topSignals: positive.map((preference) => preference.signal),
          avoidSignals: negative.map((preference) => preference.signal),
          latestAt,
        };
      });
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        rollups,
        recommendationSeeds: recommendationSeedsFromRollups(rollups),
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Rollups are derived only from raven_private_preferences.",
          "Recommendation seeds are local hints, not fetched media or external recommendations.",
          "No browser, source scan, generator, core memory export, or external write runs from this endpoint.",
        ],
      };
    }),

  draftRecommendationCandidates: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(10).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_private_preferences
          WHERE raven_session_id = ?
          ORDER BY created_at DESC, id DESC
        `,
        args: [session.id],
      });
      const preferences = result.rows.map(rowToPreference);
      const now = Math.floor(Date.now() / 1000);
      const candidates: Array<{
        seedCategory: string;
        seedText: string;
        rationale: string;
        confidence: string;
        sourcePreferenceIds: number[];
      }> = [];
      for (const category of preferenceCategories) {
        const categoryPreferences = preferences.filter((preference) => preference.category === category);
        if (categoryPreferences.length === 0) continue;
        const positive = categoryPreferences
          .filter((preference) => preference.weight > 0)
          .sort((a, b) => b.weight - a.weight || b.createdAt - a.createdAt)
          .slice(0, 3);
        const negative = categoryPreferences
          .filter((preference) => preference.weight < 0)
          .sort((a, b) => a.weight - b.weight || b.createdAt - a.createdAt)
          .slice(0, 3);
        const topSignals = positive.map((preference) => preference.signal);
        const avoidSignals = negative.map((preference) => preference.signal);
        if (topSignals.length === 0 && avoidSignals.length === 0) continue;
        const totalAbsWeight = categoryPreferences.reduce((sum, preference) => sum + Math.abs(preference.weight), 0);
        const decayBucket = ageBucket(categoryPreferences[0]?.createdAt ?? null, now);
        const state = contradictionState(positive.length, negative.length);
        const confidence = scoreConfidence(categoryPreferences.length, totalAbsWeight);
        candidates.push({
          seedCategory: category,
          seedText: [
            topSignals.length ? `prefer ${topSignals.join(", ")}` : null,
            avoidSignals.length ? `avoid ${avoidSignals.join(", ")}` : null,
          ].filter(Boolean).join("; "),
          rationale: candidateRationale({
            category,
            topSignals,
            avoidSignals,
            confidence,
            contradictionState: state,
            decayBucket,
          }),
          confidence,
          sourcePreferenceIds: [...positive, ...negative].map((preference) => preference.id),
        });
      }
      const inserted = [];
      for (const candidate of candidates.slice(0, input.limit ?? 5)) {
        const existing = await db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
              AND seed_category = ?
              AND seed_text = ?
              AND status = 'draft'
            LIMIT 1
          `,
          args: [session.id, candidate.seedCategory, candidate.seedText],
        });
        if (existing.rows[0]) {
          inserted.push(rowToRecommendationCandidate(existing.rows[0]));
          continue;
        }
        const created = await db.execute({
          sql: `
            INSERT INTO raven_recommendation_candidates (
              raven_session_id,
              seed_category,
              seed_text,
              rationale,
              confidence,
              source_preference_ids_json,
              status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'draft')
            RETURNING *
          `,
          args: [
            session.id,
            candidate.seedCategory,
            candidate.seedText,
            candidate.rationale,
            candidate.confidence,
            JSON.stringify(candidate.sourcePreferenceIds),
          ],
        });
        await db.execute({
          sql: `
            INSERT INTO raven_recommendation_candidate_history (
              candidate_id,
              raven_session_id,
              from_status,
              to_status,
              reason,
              actor
            )
            VALUES (?, ?, NULL, 'draft', ?, 'raven')
          `,
          args: [
            Number(created.rows[0]!.id),
            session.id,
            "Text-only local candidate drafted from private preference metadata.",
          ],
        });
        inserted.push(rowToRecommendationCandidate(created.rows[0]!));
      }
      return {
        ok: true,
        mode: "private_local_draft" as const,
        items: inserted,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        downloadsMedia: false,
        callsExternalModels: false,
        gates: [
          "Candidates are text-only local drafts.",
          "No media URL, browser fetch, generator call, source scan, or export is created.",
          "Source ids point only to raven_private_preferences.",
        ],
      };
    }),

  recommendationCandidates: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          status: z.enum(recommendationCandidateStatuses).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
        };
      }
      const db = await getCerebroDb();
      const where = ["raven_session_id = ?"];
      const args: (number | string)[] = [input?.ravenSessionId ?? activeSession.id];
      if (input?.status) {
        where.push("status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 40);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE ${where.join(" AND ")}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        mode: "private_read" as const,
        items: result.rows.map(rowToRecommendationCandidate),
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
      };
    }),

  recommendationCandidateQueueSummary: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          summary: {
            total: 0,
            byStatus: {},
            byConfidence: {},
            byContradiction: {},
            byDecay: {},
          },
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const [candidatesResult, preferencesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_private_preferences
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
      ]);
      const candidates = candidatesResult.rows.map(rowToRecommendationCandidate);
      const preferences = preferencesResult.rows.map(rowToPreference);
      const now = Math.floor(Date.now() / 1000);
      const byStatus: Record<string, number> = {};
      const byConfidence: Record<string, number> = {};
      const byContradiction: Record<string, number> = {};
      const byDecay: Record<string, number> = {};
      const rows = candidates.map((candidate) => {
        const categoryPreferences = preferences.filter((preference) => preference.category === candidate.seedCategory);
        const positiveCount = categoryPreferences.filter((preference) => preference.weight > 0).length;
        const negativeCount = categoryPreferences.filter((preference) => preference.weight < 0).length;
        const contradiction = contradictionState(positiveCount, negativeCount);
        const decay = ageBucket(categoryPreferences[0]?.createdAt ?? null, now);
        byStatus[candidate.status] = (byStatus[candidate.status] ?? 0) + 1;
        byConfidence[candidate.confidence] = (byConfidence[candidate.confidence] ?? 0) + 1;
        byContradiction[contradiction] = (byContradiction[contradiction] ?? 0) + 1;
        byDecay[decay] = (byDecay[decay] ?? 0) + 1;
        return {
          candidateId: candidate.id,
          status: candidate.status,
          confidence: candidate.confidence,
          contradictionState: contradiction,
          decayBucket: decay,
          seedCategory: candidate.seedCategory,
        };
      });
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        summary: {
          total: candidates.length,
          byStatus,
          byConfidence,
          byContradiction,
          byDecay,
        },
        rows,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Queue summary is derived only from local Raven candidates and preferences.",
          "No ranking model, browser, media fetch, generator, export, or external write runs from this endpoint.",
        ],
      };
    }),

  recommendationCandidateReviewPlan: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const [candidatesResult, preferencesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
            ORDER BY updated_at DESC, id DESC
            LIMIT ?
          `,
          args: [sessionId, input?.limit ?? 40],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_private_preferences
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
      ]);
      const candidates = candidatesResult.rows.map(rowToRecommendationCandidate);
      const preferences = preferencesResult.rows.map(rowToPreference);
      const now = Math.floor(Date.now() / 1000);
      const items = candidates.map((candidate) => {
        const categoryPreferences = preferences.filter((preference) => preference.category === candidate.seedCategory);
        const positiveCount = categoryPreferences.filter((preference) => preference.weight > 0).length;
        const negativeCount = categoryPreferences.filter((preference) => preference.weight < 0).length;
        const contradiction = contradictionState(positiveCount, negativeCount);
        const decay = ageBucket(categoryPreferences[0]?.createdAt ?? null, now);
        const plan = reviewActionFor({
          status: candidate.status,
          confidence: candidate.confidence,
          contradictionState: contradiction,
          decayBucket: decay,
        });
        return {
          candidateId: candidate.id,
          seedCategory: candidate.seedCategory,
          status: candidate.status,
          confidence: candidate.confidence,
          contradictionState: contradiction,
          decayBucket: decay,
          action: plan.action,
          reason: plan.reason,
        };
      });
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        items,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Review actions are deterministic local suggestions.",
          "No candidate action approves export, fetches sources, opens a browser, downloads media, or calls a model.",
        ],
      };
    }),

  recommendationCandidateDetail: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const candidate = rowToRecommendationCandidate(candidateRow);
      const sourceIds = Array.isArray(candidate.sourcePreferenceIds)
        ? candidate.sourcePreferenceIds.filter((id): id is number => Number.isFinite(Number(id))).map(Number)
        : [];
      const sourcePreferences = sourceIds.length === 0
        ? { rows: [] }
        : await db.execute({
            sql: `
              SELECT *
              FROM raven_private_preferences
              WHERE raven_session_id = ?
                AND id IN (${sourceIds.map(() => "?").join(", ")})
              ORDER BY created_at DESC, id DESC
            `,
            args: [session.id, ...sourceIds],
          });
      const history = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_history
          WHERE candidate_id = ?
          ORDER BY created_at ASC, id ASC
        `,
        args: [candidate.id],
      });
      const reviewNotes = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_review_notes
          WHERE candidate_id = ?
            AND raven_session_id = ?
          ORDER BY created_at ASC, id ASC
        `,
        args: [candidate.id, session.id],
      });
      const rollup = await db.execute({
        sql: `
          SELECT *
          FROM raven_private_preferences
          WHERE raven_session_id = ?
            AND category = ?
          ORDER BY created_at DESC, id DESC
        `,
        args: [session.id, candidate.seedCategory],
      });
      const categoryPreferences = rollup.rows.map(rowToPreference);
      const now = Math.floor(Date.now() / 1000);
      const positive = categoryPreferences.filter((preference) => preference.weight > 0);
      const negative = categoryPreferences.filter((preference) => preference.weight < 0);
      const latestAt = categoryPreferences[0]?.createdAt ?? null;
      return {
        mode: "private_read" as const,
        candidate,
        sourcePreferences: sourcePreferences.rows.map(rowToPreference),
        rollupContext: {
          category: candidate.seedCategory,
          totalSignals: categoryPreferences.length,
          totalWeight: categoryPreferences.reduce((sum, preference) => sum + preference.weight, 0),
          contradictionState: contradictionState(positive.length, negative.length),
          decayBucket: ageBucket(latestAt, now),
          latestAt,
        },
        history: history.rows.map(rowToRecommendationCandidateHistory),
        reviewNotes: reviewNotes.rows.map(rowToRecommendationCandidateReviewNote),
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
      };
    }),

  recommendationCandidateTimeline: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
        eventKind: z.enum(candidateTimelineEventKinds).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const [historyResult, notesResult, decisionDraftNotesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_history
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [input.candidateId, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [input.candidateId, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_decision_draft_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [input.candidateId, session.id],
        }),
      ]);
      const statusEvents = historyResult.rows.map(rowToRecommendationCandidateHistory).map((item) => ({
        id: `status:${item.id}`,
        kind: "status_change" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        actor: item.actor,
        summary: item.fromStatus == null
          ? `Candidate entered ${item.toStatus}.`
          : `Candidate moved from ${item.fromStatus} to ${item.toStatus}.`,
        status: {
          fromStatus: item.fromStatus,
          toStatus: item.toStatus,
          reason: item.reason,
        },
        reviewNote: null,
      }));
      const noteEvents = notesResult.rows.map(rowToRecommendationCandidateReviewNote).map((item) => ({
        id: `note:${item.id}`,
        kind: "review_note" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        actor: item.actor,
        summary: item.plannerAction == null
          ? "Review note added."
          : `Review note added for ${item.plannerAction}.`,
        status: null,
        reviewNote: item,
      }));
      const decisionDraftNoteEvents = decisionDraftNotesResult.rows.map(rowToRecommendationCandidateDecisionDraftNote).map((item) => ({
        id: `decision_draft_note:${item.id}`,
        kind: "decision_draft_note" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        actor: item.actor,
        summary: `Decision draft note added for ${item.proposedStatus}.`,
        status: null,
        reviewNote: null,
        decisionDraftNote: item,
      }));
      const allEvents = [...statusEvents, ...noteEvents, ...decisionDraftNoteEvents].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
      const events = input.eventKind ? allEvents.filter((event) => event.kind === input.eventKind) : allEvents;
      const summary = countTimelineEvents(allEvents);
      return {
        mode: "private_read" as const,
        candidate: rowToRecommendationCandidate(candidateRow),
        events,
        summary,
        filters: {
          eventKind: input.eventKind ?? null,
        },
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Timeline merges only local Raven candidate status history, review notes, and decision draft notes.",
          "No browser, source search, media fetch, export, core memory write, or model call runs from this endpoint.",
        ],
      };
    }),

  searchRecommendationCandidateTimeline: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
        query: z.string().min(1).max(120),
        eventKind: z.enum(candidateTimelineEventKinds).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const [historyResult, reviewNotesResult, decisionDraftNotesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_history
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [input.candidateId, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [input.candidateId, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_decision_draft_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [input.candidateId, session.id],
        }),
      ]);
      const statusEvents = historyResult.rows.map(rowToRecommendationCandidateHistory).map((item) => ({
        eventId: `status:${item.id}`,
        kind: "status_change" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        text: [
          item.fromStatus == null ? `Candidate entered ${item.toStatus}.` : `Candidate moved from ${item.fromStatus} to ${item.toStatus}.`,
          item.reason ?? "",
        ].join(" "),
      }));
      const reviewNoteEvents = reviewNotesResult.rows.map(rowToRecommendationCandidateReviewNote).map((item) => ({
        eventId: `note:${item.id}`,
        kind: "review_note" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        text: [item.plannerAction ?? "", item.note].join(" "),
      }));
      const decisionDraftNoteEvents = decisionDraftNotesResult.rows.map(rowToRecommendationCandidateDecisionDraftNote).map((item) => ({
        eventId: `decision_draft_note:${item.id}`,
        kind: "decision_draft_note" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        text: [item.proposedStatus, item.reason, item.note].join(" "),
      }));
      const query = input.query.toLowerCase();
      const allEvents = [...statusEvents, ...reviewNoteEvents, ...decisionDraftNoteEvents]
        .filter((event) => !input.eventKind || event.kind === input.eventKind)
        .filter((event) => event.text.toLowerCase().includes(query))
        .sort((a, b) => b.createdAt - a.createdAt || b.eventId.localeCompare(a.eventId))
        .slice(0, input.limit ?? 20);
      const summary = countTimelineEvents(allEvents);
      return {
        mode: "private_read" as const,
        candidate: rowToRecommendationCandidate(candidateRow),
        query: input.query,
        filters: {
          eventKind: input.eventKind ?? null,
        },
        summary,
        items: allEvents.map((event) => ({
          eventId: event.eventId,
          kind: event.kind,
          candidateId: event.candidateId,
          createdAt: event.createdAt,
          snippet: makePrivateSnippet(event.text, input.query),
        })),
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Timeline search reads only local Raven candidate history, review notes, and decision draft notes.",
          "Snippets are local excerpts from private timeline event text.",
          "No browser, source search, media fetch, export, core memory write, or model call runs from this endpoint.",
        ],
      };
    }),

  recommendationCandidateOverview: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          status: z.enum(recommendationCandidateStatuses).optional(),
          proposedStatus: z.enum(recommendationCandidateStatuses).optional(),
          readiness: z.enum(["ready_for_private_status_review", "needs_more_private_review"]).optional(),
          eventKind: z.enum(candidateTimelineEventKinds).optional(),
          preset: z.enum(candidateOverviewPresetIds).optional(),
          reviewFreshness: z.enum(reviewFreshnessStates).optional(),
          needsPrivateAttention: z.boolean().optional(),
          riskFlag: z.enum(riskFlagIds).optional(),
          evidenceSource: z.enum(evidenceSourceIds).optional(),
          missingEvidenceSource: z.enum(evidenceSourceIds).optional(),
          evidencePreset: z.enum(evidencePresetIds).optional(),
          sortBy: z.enum(candidateOverviewSortFields).optional(),
          sortDirection: z.enum(sortDirections).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          queue: { total: 0, byStatus: {}, byConfidence: {}, byContradiction: {}, byDecay: {} },
          review: { byReadiness: {}, byPlannerAction: {}, byNoteCoverage: {}, byFreshnessState: {} },
          risk: { needsPrivateAttention: 0, byFlag: {} },
          decisions: { byProposedStatus: {}, byReason: {} },
          timeline: { searchableCandidates: 0, eventCountByKind: {} },
          evidenceSummary: {
            rowsWithAnyEvidence: 0,
            rowsWithAllEvidence: 0,
            rowsMissingEvidence: 0,
            bySource: {
              preference: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
              statusHistory: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
              reviewNote: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
              decisionDraftNote: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
            },
            exposesPrivateBodies: false,
          },
          evidenceDrilldowns: {
            sources: {},
            presets: {},
            exposesPrivateBodies: false,
            mutatesStatus: false,
          },
          evidenceReceipt: {
            mode: "sealed" as const,
            activeEvidenceFilters: {
              evidenceSource: null,
              missingEvidenceSource: null,
              evidencePreset: null,
            },
            warnings: [],
            recommendations: [],
            summaryLabels: ["empty"],
            summaryLabelDrilldowns: {},
            actionManifest: {
              supportedFilters: [],
              supportedSummaryLabels: ["empty"],
              supportedWarnings: [],
              supportedRecommendations: [],
              drilldownCategories: [],
              activeWarningCount: 0,
              activeRecommendationCount: 0,
              activeSummaryLabelCount: 1,
              exposesPrivateBodies: false,
              mutatesStatus: false,
            },
            matchingRowCount: 0,
            totalReturnedRows: 0,
            exposesPrivateBodies: false,
            mutatesStatus: false,
            writesExternal: false,
            callsExternalModels: false,
          },
          queueManifest: {
            filterKeys: [],
            sortKeys: [],
            presetGroups: [],
            exposesPrivateBodies: false,
          },
          overviewReceiptManifest: {
            mode: "sealed" as const,
            surfaces: [],
            filterCount: 0,
            presetGroupCount: 0,
            activeRowCount: 0,
            riskFlagCount: 0,
            freshnessStateCount: 0,
            evidenceSourceCount: 0,
            evidenceReceiptWarningCount: 0,
            evidenceReceiptRecommendationCount: 0,
            capabilityGateCount: 0,
            exposesPrivateBodies: false,
            mutatesStatus: false,
          },
          rows: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const [candidatesResult, preferencesResult, historyResult, reviewNotesResult, decisionDraftNotesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
            ORDER BY updated_at DESC, id DESC
            LIMIT ?
          `,
          args: [sessionId, input?.limit ?? 40],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_private_preferences
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_history
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_decision_draft_notes
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
      ]);
      const candidates = candidatesResult.rows.map(rowToRecommendationCandidate);
      const preferences = preferencesResult.rows.map(rowToPreference);
      const history = historyResult.rows.map(rowToRecommendationCandidateHistory);
      const reviewNotes = reviewNotesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const decisionDraftNotes = decisionDraftNotesResult.rows.map(rowToRecommendationCandidateDecisionDraftNote);
      const historyByCandidate = new Map<number, typeof history>();
      for (const item of history) {
        const existing = historyByCandidate.get(item.candidateId) ?? [];
        existing.push(item);
        historyByCandidate.set(item.candidateId, existing);
      }
      const reviewNotesByCandidate = new Map<number, typeof reviewNotes>();
      for (const note of reviewNotes) {
        const existing = reviewNotesByCandidate.get(note.candidateId) ?? [];
        existing.push(note);
        reviewNotesByCandidate.set(note.candidateId, existing);
      }
      const decisionNotesByCandidate = new Map<number, typeof decisionDraftNotes>();
      for (const note of decisionDraftNotes) {
        const existing = decisionNotesByCandidate.get(note.candidateId) ?? [];
        existing.push(note);
        decisionNotesByCandidate.set(note.candidateId, existing);
      }
      const now = Math.floor(Date.now() / 1000);
      const allRows = candidates.map((candidate) => {
        const categoryPreferences = preferences.filter((preference) => preference.category === candidate.seedCategory);
        const positiveCount = categoryPreferences.filter((preference) => preference.weight > 0).length;
        const negativeCount = categoryPreferences.filter((preference) => preference.weight < 0).length;
        const contradiction = contradictionState(positiveCount, negativeCount);
        const decay = ageBucket(categoryPreferences[0]?.createdAt ?? null, now);
        const candidateHistory = historyByCandidate.get(candidate.id) ?? [];
        const candidateReviewNotes = reviewNotesByCandidate.get(candidate.id) ?? [];
        const candidateDecisionNotes = decisionNotesByCandidate.get(candidate.id) ?? [];
        const plannerActions = [...new Set(candidateReviewNotes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
        const ready = privateReviewReadiness({
          status: candidate.status,
          confidence: candidate.confidence,
          reviewNoteCount: candidateReviewNotes.length,
          plannerActions,
        });
        const readiness = ready ? "ready_for_private_status_review" : "needs_more_private_review";
        const noteCoverage = candidateReviewNotes.length === 0 ? "no_notes" : candidateReviewNotes.length === 1 ? "one_note" : "multiple_notes";
        const decision = draftPrivateReviewDecision({
          status: candidate.status,
          confidence: candidate.confidence,
          reviewNoteCount: candidateReviewNotes.length,
          plannerActions,
        });
        const eventCounts = {
          status_change: candidateHistory.length,
          review_note: candidateReviewNotes.length,
          decision_draft_note: candidateDecisionNotes.length,
        };
        const latestReviewNoteAt = candidateReviewNotes[0]?.createdAt ?? null;
        const latestDecisionDraftNoteAt = candidateDecisionNotes[0]?.createdAt ?? null;
        const latestPrivateReviewAt = Math.max(latestReviewNoteAt ?? 0, latestDecisionDraftNoteAt ?? 0) || null;
        const freshnessState = reviewFreshnessState({
          latestReviewNoteAt,
          latestDecisionDraftNoteAt,
          candidateUpdatedAt: candidate.updatedAt,
          now,
        });
        const riskFlags = {
          hasMixedPreferenceSignals: contradiction === "mixed",
          hasLowConfidence: candidate.confidence === "low",
          hasStaleSourceSignal: decay === "stale",
          isMissingPrivateReview: freshnessState === "missing_private_review",
          exposesPrivateBodies: false,
        };
        return {
          candidateId: candidate.id,
          seedCategory: candidate.seedCategory,
          updatedAt: candidate.updatedAt,
          status: candidate.status,
          confidence: candidate.confidence,
          contradictionState: contradiction,
          decayBucket: decay,
          readiness,
          noteCoverage,
          proposedStatus: decision.proposedStatus,
          decisionReason: decision.reason,
          plannerActions,
          riskFlags: {
            ...riskFlags,
            needsPrivateAttention: Object.entries(riskFlags)
              .filter(([key]) => key !== "exposesPrivateBodies")
              .some(([, value]) => value),
          },
          riskDrilldowns: {
            mixedPreferenceSignals: {
              endpoint: "raven.recommendationCandidateDetail",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            lowConfidence: {
              endpoint: "raven.draftRecommendationCandidateReviewDecision",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            staleSourceSignal: {
              endpoint: "raven.recommendationCandidateDetail",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            missingPrivateReview: {
              endpoint: "raven.recommendationCandidateReviewNotes",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            exposesPrivateBodies: false,
          },
          eventCounts,
          timelineEventCount: eventCounts.status_change + eventCounts.review_note + eventCounts.decision_draft_note,
          notes: {
            reviewNoteCount: candidateReviewNotes.length,
            latestReviewNoteAt,
            decisionDraftNoteCount: candidateDecisionNotes.length,
            latestDecisionDraftNoteAt,
            latestPrivateReviewAt,
            hasReviewNotes: candidateReviewNotes.length > 0,
            hasDecisionDraftNotes: candidateDecisionNotes.length > 0,
            freshnessState,
            isMissingPrivateReview: freshnessState === "missing_private_review",
            isStalePrivateReview: freshnessState === "stale_private_review",
            isOutpacedByCandidateUpdate: freshnessState === "candidate_updated_after_review",
            exposesPrivateBodies: false,
          },
          evidenceSummary: {
            hasPreferenceEvidence: categoryPreferences.length > 0,
            hasStatusHistoryEvidence: candidateHistory.length > 0,
            hasReviewNoteEvidence: candidateReviewNotes.length > 0,
            hasDecisionDraftNoteEvidence: candidateDecisionNotes.length > 0,
            preferenceEvidenceCount: categoryPreferences.length,
            statusHistoryEvidenceCount: candidateHistory.length,
            reviewNoteEvidenceCount: candidateReviewNotes.length,
            decisionDraftNoteEvidenceCount: candidateDecisionNotes.length,
            exposesPrivateBodies: false,
          },
          drilldowns: {
            detail: {
              endpoint: "raven.recommendationCandidateDetail",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            timeline: {
              endpoint: "raven.recommendationCandidateTimeline",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            timelineSearch: {
              endpoint: "raven.searchRecommendationCandidateTimeline",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            reviewNotes: {
              endpoint: "raven.recommendationCandidateReviewNotes",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            decisionDraftDetail: {
              endpoint: "raven.draftRecommendationCandidateReviewDecision",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
            decisionDraftNotes: {
              endpoint: "raven.recommendationCandidateDecisionDraftNotes",
              input: { ravenSessionId: sessionId, candidateId: candidate.id },
            },
          },
          rowCapabilityReceipt: {
            mode: "private_row_read" as const,
            candidateId: candidate.id,
            summary: {
              availableDrilldownCount: 6,
              availableRiskDrilldownCount: 4,
              totalAvailableDrilldowns: 10,
            },
            availableDrilldowns: [
              "detail",
              "timeline",
              "timelineSearch",
              "reviewNotes",
              "decisionDraftDetail",
              "decisionDraftNotes",
            ],
            availableRiskDrilldowns: [
              "mixedPreferenceSignals",
              "lowConfidence",
              "staleSourceSignal",
              "missingPrivateReview",
            ],
            writesCoreMemory: false,
            writesExternal: false,
            opensBrowser: false,
            callsExternalModels: false,
            exposesPrivateBodies: false,
            mutatesStatus: false,
          },
        };
      });
      const presetMatches = (row: (typeof allRows)[number], preset: (typeof candidateOverviewPresetIds)[number]) => {
        if (preset === "ready_review") return row.readiness === "ready_for_private_status_review";
        if (preset === "needs_more_review") return row.readiness === "needs_more_private_review";
        if (preset === "has_decision_rationale") return row.eventCounts.decision_draft_note > 0;
        return row.status === "kept" && row.confidence === "high";
      };
      const presets = {
        readyReview: {
          id: "ready_review" as const,
          title: "Ready Review",
          count: allRows.filter((row) => presetMatches(row, "ready_review")).length,
          input: { ravenSessionId: sessionId, preset: "ready_review" as const },
        },
        needsMoreReview: {
          id: "needs_more_review" as const,
          title: "Needs More Review",
          count: allRows.filter((row) => presetMatches(row, "needs_more_review")).length,
          input: { ravenSessionId: sessionId, preset: "needs_more_review" as const },
        },
        hasDecisionRationale: {
          id: "has_decision_rationale" as const,
          title: "Has Decision Rationale",
          count: allRows.filter((row) => presetMatches(row, "has_decision_rationale")).length,
          input: { ravenSessionId: sessionId, preset: "has_decision_rationale" as const },
        },
        highConfidenceKept: {
          id: "high_confidence_kept" as const,
          title: "High Confidence Kept",
          count: allRows.filter((row) => presetMatches(row, "high_confidence_kept")).length,
          input: { ravenSessionId: sessionId, preset: "high_confidence_kept" as const },
        },
      };
      const freshnessPresets = {
        currentReview: {
          id: "current_private_review" as const,
          title: "Current Review",
          count: allRows.filter((row) => row.notes.freshnessState === "current_private_review").length,
          input: { ravenSessionId: sessionId, reviewFreshness: "current_private_review" as const },
        },
        missingReview: {
          id: "missing_private_review" as const,
          title: "Missing Review",
          count: allRows.filter((row) => row.notes.freshnessState === "missing_private_review").length,
          input: { ravenSessionId: sessionId, reviewFreshness: "missing_private_review" as const },
        },
        staleReview: {
          id: "stale_private_review" as const,
          title: "Stale Review",
          count: allRows.filter((row) => row.notes.freshnessState === "stale_private_review").length,
          input: { ravenSessionId: sessionId, reviewFreshness: "stale_private_review" as const },
        },
        candidateUpdatedAfterReview: {
          id: "candidate_updated_after_review" as const,
          title: "Candidate Updated After Review",
          count: allRows.filter((row) => row.notes.freshnessState === "candidate_updated_after_review").length,
          input: { ravenSessionId: sessionId, reviewFreshness: "candidate_updated_after_review" as const },
        },
      };
      const riskFlagMatches = (row: (typeof allRows)[number], riskFlag: (typeof riskFlagIds)[number]) => {
        if (riskFlag === "mixed_preference_signals") return row.riskFlags.hasMixedPreferenceSignals;
        if (riskFlag === "low_confidence") return row.riskFlags.hasLowConfidence;
        if (riskFlag === "stale_source_signal") return row.riskFlags.hasStaleSourceSignal;
        return row.riskFlags.isMissingPrivateReview;
      };
      const evidenceSourceMatches = (row: (typeof allRows)[number], evidenceSource: (typeof evidenceSourceIds)[number]) => {
        if (evidenceSource === "preference") return row.evidenceSummary.hasPreferenceEvidence;
        if (evidenceSource === "status_history") return row.evidenceSummary.hasStatusHistoryEvidence;
        if (evidenceSource === "review_note") return row.evidenceSummary.hasReviewNoteEvidence;
        return row.evidenceSummary.hasDecisionDraftNoteEvidence;
      };
      const evidencePresetMatches = (row: (typeof allRows)[number], evidencePreset: (typeof evidencePresetIds)[number]) => {
        if (evidencePreset === "complete_evidence") {
          return row.evidenceSummary.hasPreferenceEvidence
            && row.evidenceSummary.hasStatusHistoryEvidence
            && row.evidenceSummary.hasReviewNoteEvidence
            && row.evidenceSummary.hasDecisionDraftNoteEvidence;
        }
        if (evidencePreset === "missing_review_evidence") return !row.evidenceSummary.hasReviewNoteEvidence;
        if (evidencePreset === "missing_decision_rationale") return !row.evidenceSummary.hasDecisionDraftNoteEvidence;
        return row.evidenceSummary.hasPreferenceEvidence
          && !row.evidenceSummary.hasStatusHistoryEvidence
          && !row.evidenceSummary.hasReviewNoteEvidence
          && !row.evidenceSummary.hasDecisionDraftNoteEvidence;
      };
      const riskPresets = {
        needsAttention: {
          id: "needs_private_attention" as const,
          title: "Needs Private Attention",
          count: allRows.filter((row) => row.riskFlags.needsPrivateAttention).length,
          input: { ravenSessionId: sessionId, needsPrivateAttention: true },
        },
        mixedPreferenceSignals: {
          id: "mixed_preference_signals" as const,
          title: "Mixed Preference Signals",
          count: allRows.filter((row) => riskFlagMatches(row, "mixed_preference_signals")).length,
          input: { ravenSessionId: sessionId, riskFlag: "mixed_preference_signals" as const },
        },
        lowConfidence: {
          id: "low_confidence" as const,
          title: "Low Confidence",
          count: allRows.filter((row) => riskFlagMatches(row, "low_confidence")).length,
          input: { ravenSessionId: sessionId, riskFlag: "low_confidence" as const },
        },
        staleSourceSignal: {
          id: "stale_source_signal" as const,
          title: "Stale Source Signal",
          count: allRows.filter((row) => riskFlagMatches(row, "stale_source_signal")).length,
          input: { ravenSessionId: sessionId, riskFlag: "stale_source_signal" as const },
        },
        missingPrivateReview: {
          id: "missing_private_review" as const,
          title: "Missing Private Review",
          count: allRows.filter((row) => riskFlagMatches(row, "missing_private_review")).length,
          input: { ravenSessionId: sessionId, riskFlag: "missing_private_review" as const },
        },
      };
      const combinedRiskPresets = {
        needsAttentionCurrentReview: {
          id: "needs_attention_current_review" as const,
          title: "Needs Attention, Current Review",
          count: allRows.filter((row) => row.riskFlags.needsPrivateAttention && row.notes.freshnessState === "current_private_review").length,
          input: { ravenSessionId: sessionId, needsPrivateAttention: true, reviewFreshness: "current_private_review" as const },
        },
        needsAttentionHasDecisionRationale: {
          id: "needs_attention_has_decision_rationale" as const,
          title: "Needs Attention, Has Decision Rationale",
          count: allRows.filter((row) => row.riskFlags.needsPrivateAttention && row.eventCounts.decision_draft_note > 0).length,
          input: { ravenSessionId: sessionId, needsPrivateAttention: true, preset: "has_decision_rationale" as const },
        },
        mixedSignalsWithCurrentReview: {
          id: "mixed_signals_current_review" as const,
          title: "Mixed Signals, Current Review",
          count: allRows.filter((row) => row.riskFlags.hasMixedPreferenceSignals && row.notes.freshnessState === "current_private_review").length,
          input: { ravenSessionId: sessionId, riskFlag: "mixed_preference_signals" as const, reviewFreshness: "current_private_review" as const },
        },
      };
      const evidencePresets = {
        completeEvidence: {
          id: "complete_evidence" as const,
          title: "Complete Evidence",
          count: allRows.filter((row) => evidencePresetMatches(row, "complete_evidence")).length,
          input: { ravenSessionId: sessionId, evidencePreset: "complete_evidence" as const },
        },
        missingReviewEvidence: {
          id: "missing_review_evidence" as const,
          title: "Missing Review Evidence",
          count: allRows.filter((row) => evidencePresetMatches(row, "missing_review_evidence")).length,
          input: { ravenSessionId: sessionId, evidencePreset: "missing_review_evidence" as const },
        },
        missingDecisionRationale: {
          id: "missing_decision_rationale" as const,
          title: "Missing Decision Rationale",
          count: allRows.filter((row) => evidencePresetMatches(row, "missing_decision_rationale")).length,
          input: { ravenSessionId: sessionId, evidencePreset: "missing_decision_rationale" as const },
        },
        preferenceOnly: {
          id: "preference_only" as const,
          title: "Preference Only",
          count: allRows.filter((row) => evidencePresetMatches(row, "preference_only")).length,
          input: { ravenSessionId: sessionId, evidencePreset: "preference_only" as const },
        },
      };
      const evidenceDrilldowns = {
        sources: {
          preference: {
            present: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, evidenceSource: "preference" as const },
            },
            missing: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, missingEvidenceSource: "preference" as const },
            },
          },
          statusHistory: {
            present: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, evidenceSource: "status_history" as const },
            },
            missing: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, missingEvidenceSource: "status_history" as const },
            },
          },
          reviewNote: {
            present: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, evidenceSource: "review_note" as const },
            },
            missing: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, missingEvidenceSource: "review_note" as const },
            },
          },
          decisionDraftNote: {
            present: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, evidenceSource: "decision_draft_note" as const },
            },
            missing: {
              endpoint: "raven.recommendationCandidateOverview",
              input: { ravenSessionId: sessionId, missingEvidenceSource: "decision_draft_note" as const },
            },
          },
        },
        presets: Object.fromEntries(
          Object.values(evidencePresets).map((preset) => [
            preset.id,
            {
              endpoint: "raven.recommendationCandidateOverview",
              input: preset.input,
            },
          ]),
        ),
        exposesPrivateBodies: false,
        mutatesStatus: false,
      };
      const rows = allRows.filter((row) => {
        if (input?.preset && !presetMatches(row, input.preset)) return false;
        if (input?.status && row.status !== input.status) return false;
        if (input?.proposedStatus && row.proposedStatus !== input.proposedStatus) return false;
        if (input?.readiness && row.readiness !== input.readiness) return false;
        if (input?.eventKind && (row.eventCounts[input.eventKind] ?? 0) === 0) return false;
        if (input?.reviewFreshness && row.notes.freshnessState !== input.reviewFreshness) return false;
        if (input?.needsPrivateAttention != null && row.riskFlags.needsPrivateAttention !== input.needsPrivateAttention) return false;
        if (input?.riskFlag && !riskFlagMatches(row, input.riskFlag)) return false;
        if (input?.evidenceSource && !evidenceSourceMatches(row, input.evidenceSource)) return false;
        if (input?.missingEvidenceSource && evidenceSourceMatches(row, input.missingEvidenceSource)) return false;
        if (input?.evidencePreset && !evidencePresetMatches(row, input.evidencePreset)) return false;
        return true;
      }).sort((a, b) => {
        const sortBy = input?.sortBy ?? "updated_at";
        const direction = input?.sortDirection ?? "desc";
        let comparison = 0;
        if (sortBy === "timeline_event_count") {
          comparison = a.timelineEventCount - b.timelineEventCount;
        } else if (sortBy === "confidence") {
          comparison = candidateConfidenceRank(a.confidence) - candidateConfidenceRank(b.confidence);
        } else if (sortBy === "readiness") {
          comparison = candidateReadinessRank(a.readiness) - candidateReadinessRank(b.readiness);
        } else {
          comparison = a.updatedAt - b.updatedAt;
        }
        const directedComparison = direction === "asc" ? comparison : -comparison;
        return directedComparison || b.updatedAt - a.updatedAt || b.candidateId - a.candidateId;
      });
      const byStatus: Record<string, number> = {};
      const byConfidence: Record<string, number> = {};
      const byContradiction: Record<string, number> = {};
      const byDecay: Record<string, number> = {};
      const byReadiness: Record<string, number> = {};
      const byPlannerAction: Record<string, number> = {};
      const byNoteCoverage: Record<string, number> = {};
      const byFreshnessState: Record<string, number> = {};
      const byRiskFlag: Record<string, number> = {};
      const byProposedStatus: Record<string, number> = {};
      const byReason: Record<string, number> = {};
      const eventCountByKind: Record<string, number> = {};
      const evidenceSummary = {
        rowsWithAnyEvidence: 0,
        rowsWithAllEvidence: 0,
        rowsMissingEvidence: 0,
        bySource: {
          preference: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
          statusHistory: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
          reviewNote: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
          decisionDraftNote: { rowsWithEvidence: 0, totalEvidenceCount: 0 },
        },
        exposesPrivateBodies: false,
      };
      let searchableCandidates = 0;
      let needsPrivateAttention = 0;
      for (const row of rows) {
        byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
        byConfidence[row.confidence] = (byConfidence[row.confidence] ?? 0) + 1;
        byContradiction[row.contradictionState] = (byContradiction[row.contradictionState] ?? 0) + 1;
        byDecay[row.decayBucket] = (byDecay[row.decayBucket] ?? 0) + 1;
        byReadiness[row.readiness] = (byReadiness[row.readiness] ?? 0) + 1;
        byNoteCoverage[row.noteCoverage] = (byNoteCoverage[row.noteCoverage] ?? 0) + 1;
        byFreshnessState[row.notes.freshnessState] = (byFreshnessState[row.notes.freshnessState] ?? 0) + 1;
        if (row.riskFlags.needsPrivateAttention) needsPrivateAttention += 1;
        if (row.riskFlags.hasMixedPreferenceSignals) byRiskFlag.mixed_preference_signals = (byRiskFlag.mixed_preference_signals ?? 0) + 1;
        if (row.riskFlags.hasLowConfidence) byRiskFlag.low_confidence = (byRiskFlag.low_confidence ?? 0) + 1;
        if (row.riskFlags.hasStaleSourceSignal) byRiskFlag.stale_source_signal = (byRiskFlag.stale_source_signal ?? 0) + 1;
        if (row.riskFlags.isMissingPrivateReview) byRiskFlag.missing_private_review = (byRiskFlag.missing_private_review ?? 0) + 1;
        for (const action of row.plannerActions) {
          byPlannerAction[action] = (byPlannerAction[action] ?? 0) + 1;
        }
        byProposedStatus[row.proposedStatus] = (byProposedStatus[row.proposedStatus] ?? 0) + 1;
        byReason[row.decisionReason] = (byReason[row.decisionReason] ?? 0) + 1;
        for (const [kind, count] of Object.entries(row.eventCounts)) {
          eventCountByKind[kind] = (eventCountByKind[kind] ?? 0) + count;
        }
        const evidenceSources = [
          {
            summary: evidenceSummary.bySource.preference,
            hasEvidence: row.evidenceSummary.hasPreferenceEvidence,
            count: row.evidenceSummary.preferenceEvidenceCount,
          },
          {
            summary: evidenceSummary.bySource.statusHistory,
            hasEvidence: row.evidenceSummary.hasStatusHistoryEvidence,
            count: row.evidenceSummary.statusHistoryEvidenceCount,
          },
          {
            summary: evidenceSummary.bySource.reviewNote,
            hasEvidence: row.evidenceSummary.hasReviewNoteEvidence,
            count: row.evidenceSummary.reviewNoteEvidenceCount,
          },
          {
            summary: evidenceSummary.bySource.decisionDraftNote,
            hasEvidence: row.evidenceSummary.hasDecisionDraftNoteEvidence,
            count: row.evidenceSummary.decisionDraftNoteEvidenceCount,
          },
        ];
        let rowEvidenceSourceCount = 0;
        for (const source of evidenceSources) {
          if (source.hasEvidence) {
            source.summary.rowsWithEvidence += 1;
            rowEvidenceSourceCount += 1;
          }
          source.summary.totalEvidenceCount += source.count;
        }
        if (rowEvidenceSourceCount > 0) evidenceSummary.rowsWithAnyEvidence += 1;
        if (rowEvidenceSourceCount === evidenceSources.length) evidenceSummary.rowsWithAllEvidence += 1;
        if (rowEvidenceSourceCount === 0) evidenceSummary.rowsMissingEvidence += 1;
        if (row.timelineEventCount > 0) searchableCandidates += 1;
      }
      const queueManifest = {
        filterKeys: [
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
        ],
        sortKeys: [...candidateOverviewSortFields],
        presetGroups: [
          {
            key: "presets",
            ids: Object.values(presets).map((preset) => preset.id),
          },
          {
            key: "freshnessPresets",
            ids: Object.values(freshnessPresets).map((preset) => preset.id),
          },
          {
            key: "riskPresets",
            ids: Object.values(riskPresets).map((preset) => preset.id),
          },
          {
            key: "combinedRiskPresets",
            ids: Object.values(combinedRiskPresets).map((preset) => preset.id),
          },
          {
            key: "evidencePresets",
            ids: Object.values(evidencePresets).map((preset) => preset.id),
          },
        ],
        exposesPrivateBodies: false,
        mutatesStatus: false,
      };
      const capabilityReceipt = {
        mode: "private_read" as const,
        readSources: [
          "raven_recommendation_candidates",
          "raven_private_preferences",
          "raven_recommendation_candidate_history",
          "raven_recommendation_candidate_review_notes",
          "raven_recommendation_candidate_decision_draft_notes",
        ],
        supportedFilters: queueManifest.filterKeys,
        supportedSorts: queueManifest.sortKeys,
        supportedPresetGroups: queueManifest.presetGroups.map((group) => group.key),
        privacyGates: [
          "Reads only local Raven tables.",
          "Does not expose private note bodies.",
          "Does not mutate candidate status.",
          "Does not approve export.",
          "Does not open browser or call models.",
        ],
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        exposesPrivateBodies: false,
        mutatesStatus: false,
      };
      const evidenceReceiptWarnings = [
        ...(input?.evidenceSource && input?.missingEvidenceSource && input.evidenceSource === input.missingEvidenceSource
          ? ["contradictory_evidence_source_filters" as const]
          : []),
        ...(rows.length === 0 ? ["empty_evidence_queue" as const] : []),
      ];
      const evidenceReceiptRecommendations = [
        ...(evidenceReceiptWarnings.includes("contradictory_evidence_source_filters")
          ? [
              {
                id: "clear_missing_evidence_source" as const,
                reason: "contradictory_evidence_source_filters" as const,
                endpoint: "raven.recommendationCandidateOverview",
                input: {
                  ravenSessionId: sessionId,
                  evidenceSource: input?.evidenceSource,
                },
              },
            ]
          : []),
        ...(evidenceReceiptWarnings.includes("empty_evidence_queue")
          ? [
              {
                id: "inspect_complete_evidence" as const,
                reason: "empty_evidence_queue" as const,
                endpoint: "raven.recommendationCandidateOverview",
                input: {
                  ravenSessionId: sessionId,
                  evidencePreset: "complete_evidence" as const,
                },
              },
            ]
          : []),
        ...(evidenceSummary.bySource.reviewNote.rowsWithEvidence === 0
          ? [
              {
                id: "inspect_missing_review_evidence" as const,
                reason: "missing_review_note_coverage" as const,
                endpoint: "raven.recommendationCandidateOverview",
                input: {
                  ravenSessionId: sessionId,
                  evidencePreset: "missing_review_evidence" as const,
                },
              },
            ]
          : []),
        ...(evidenceSummary.bySource.decisionDraftNote.rowsWithEvidence === 0
          ? [
              {
                id: "inspect_missing_decision_rationale" as const,
                reason: "missing_decision_draft_note_coverage" as const,
                endpoint: "raven.recommendationCandidateOverview",
                input: {
                  ravenSessionId: sessionId,
                  evidencePreset: "missing_decision_rationale" as const,
                },
              },
            ]
          : []),
      ];
      const evidenceReceiptSummaryLabels = [
        ...(evidenceReceiptWarnings.includes("contradictory_evidence_source_filters") ? ["contradictory" as const] : []),
        ...(rows.length === 0 ? ["empty" as const] : []),
        ...(rows.length > 0 && evidenceSummary.rowsWithAllEvidence === rows.length ? ["complete" as const] : []),
        ...(rows.length > 0 && evidenceSummary.rowsWithAllEvidence < rows.length ? ["partial" as const] : []),
        ...(rows.length > 0 && evidenceSummary.bySource.reviewNote.rowsWithEvidence < rows.length ? ["missing_review_evidence" as const] : []),
        ...(rows.length > 0 && evidenceSummary.bySource.decisionDraftNote.rowsWithEvidence < rows.length ? ["missing_decision_evidence" as const] : []),
      ];
      const allEvidenceReceiptLabelDrilldowns = {
        complete: {
          endpoint: "raven.recommendationCandidateOverview",
          input: { ravenSessionId: sessionId, evidencePreset: "complete_evidence" as const },
        },
        partial: {
          endpoint: "raven.recommendationCandidateOverview",
          input: { ravenSessionId: sessionId },
        },
        empty: {
          endpoint: "raven.recommendationCandidateOverview",
          input: { ravenSessionId: sessionId },
        },
        contradictory: {
          endpoint: "raven.recommendationCandidateOverview",
          input: {
            ravenSessionId: sessionId,
            ...(input?.evidenceSource ? { evidenceSource: input.evidenceSource } : {}),
          },
        },
        missing_review_evidence: {
          endpoint: "raven.recommendationCandidateOverview",
          input: { ravenSessionId: sessionId, evidencePreset: "missing_review_evidence" as const },
        },
        missing_decision_evidence: {
          endpoint: "raven.recommendationCandidateOverview",
          input: { ravenSessionId: sessionId, evidencePreset: "missing_decision_rationale" as const },
        },
      };
      const evidenceReceiptSummaryLabelDrilldowns = Object.fromEntries(
        evidenceReceiptSummaryLabels.map((label) => [label, allEvidenceReceiptLabelDrilldowns[label]]),
      );
      const evidenceReceiptActionManifest = {
        supportedFilters: ["evidenceSource", "missingEvidenceSource", "evidencePreset"],
        supportedSummaryLabels: [
          "complete",
          "partial",
          "empty",
          "contradictory",
          "missing_review_evidence",
          "missing_decision_evidence",
        ],
        supportedWarnings: ["contradictory_evidence_source_filters", "empty_evidence_queue"],
        supportedRecommendations: [
          "clear_missing_evidence_source",
          "inspect_complete_evidence",
          "inspect_missing_review_evidence",
          "inspect_missing_decision_rationale",
        ],
        drilldownCategories: ["source_present", "source_missing", "preset", "summary_label"],
        activeWarningCount: evidenceReceiptWarnings.length,
        activeRecommendationCount: evidenceReceiptRecommendations.length,
        activeSummaryLabelCount: evidenceReceiptSummaryLabels.length,
        exposesPrivateBodies: false,
        mutatesStatus: false,
      };
      const evidenceReceipt = {
        mode: "private_read" as const,
        activeEvidenceFilters: {
          evidenceSource: input?.evidenceSource ?? null,
          missingEvidenceSource: input?.missingEvidenceSource ?? null,
          evidencePreset: input?.evidencePreset ?? null,
        },
        warnings: evidenceReceiptWarnings,
        recommendations: evidenceReceiptRecommendations,
        summaryLabels: evidenceReceiptSummaryLabels,
        summaryLabelDrilldowns: evidenceReceiptSummaryLabelDrilldowns,
        actionManifest: evidenceReceiptActionManifest,
        matchingRowCount: rows.length,
        totalReturnedRows: rows.length,
        evidenceSourceCount: evidenceSummary.rowsWithAnyEvidence,
        completeEvidenceRowCount: evidenceSummary.rowsWithAllEvidence,
        missingEvidenceRowCount: evidenceSummary.rowsMissingEvidence,
        exposesPrivateBodies: false,
        mutatesStatus: false,
        writesExternal: false,
        callsExternalModels: false,
      };
      const overviewReceiptManifest = {
        mode: "private_read" as const,
        surfaces: ["queue", "risk", "freshness", "evidence", "capability"],
        filterCount: queueManifest.filterKeys.length,
        presetGroupCount: queueManifest.presetGroups.length,
        activeRowCount: rows.length,
        riskFlagCount: Object.keys(byRiskFlag).length,
        freshnessStateCount: Object.keys(byFreshnessState).length,
        evidenceSourceCount: Object.keys(evidenceSummary.bySource).length,
        evidenceReceiptWarningCount: evidenceReceipt.warnings.length,
        evidenceReceiptRecommendationCount: evidenceReceipt.recommendations.length,
        capabilityGateCount: capabilityReceipt.privacyGates.length,
        exposesPrivateBodies: false,
        mutatesStatus: false,
      };
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        queue: {
          total: rows.length,
          byStatus,
          byConfidence,
          byContradiction,
          byDecay,
        },
        review: {
          byReadiness,
          byPlannerAction,
          byNoteCoverage,
          byFreshnessState,
        },
        risk: {
          needsPrivateAttention,
          byFlag: byRiskFlag,
        },
        decisions: {
          byProposedStatus,
          byReason,
        },
        timeline: {
          searchableCandidates,
          eventCountByKind,
        },
        evidenceSummary,
        filters: {
          status: input?.status ?? null,
          proposedStatus: input?.proposedStatus ?? null,
          readiness: input?.readiness ?? null,
          eventKind: input?.eventKind ?? null,
          preset: input?.preset ?? null,
          reviewFreshness: input?.reviewFreshness ?? null,
          needsPrivateAttention: input?.needsPrivateAttention ?? null,
          riskFlag: input?.riskFlag ?? null,
          evidenceSource: input?.evidenceSource ?? null,
          missingEvidenceSource: input?.missingEvidenceSource ?? null,
          evidencePreset: input?.evidencePreset ?? null,
        },
        presets,
        freshnessPresets,
        riskPresets,
        combinedRiskPresets,
        evidencePresets,
        evidenceDrilldowns,
        evidenceReceipt,
        queueManifest,
        capabilityReceipt,
        overviewReceiptManifest,
        sort: {
          by: input?.sortBy ?? "updated_at",
          direction: input?.sortDirection ?? "desc",
        },
        rows,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Overview is derived only from local Raven candidates, preferences, status history, review notes, and decision draft notes.",
          "This endpoint does not change status, approve export, fetch sources, open a browser, write core memory, or call a model.",
        ],
      };
    }),

  recommendationCandidateReviewStats: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const [historyResult, notesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_history
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [input.candidateId, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [input.candidateId, session.id],
        }),
      ]);
      const candidate = rowToRecommendationCandidate(candidateRow);
      const history = historyResult.rows.map(rowToRecommendationCandidateHistory);
      const notes = notesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const now = Math.floor(Date.now() / 1000);
      const latestNote = notes[0] ?? null;
      const latestNoteAgeSeconds = latestNote == null ? null : Math.max(0, now - latestNote.createdAt);
      const statusTransitionCount = history.filter((item) => item.fromStatus != null && item.fromStatus !== item.toStatus).length;
      const plannerActions = [...new Set(notes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
      const hasEnoughPrivateReviewEvidence = privateReviewReadiness({
        status: candidate.status,
        confidence: candidate.confidence,
        reviewNoteCount: notes.length,
        plannerActions,
      });
      return {
        mode: "private_read" as const,
        candidate,
        stats: {
          timelineEventCount: history.length + notes.length,
          statusHistoryCount: history.length,
          reviewNoteCount: notes.length,
          statusTransitionCount,
          latestNoteAt: latestNote?.createdAt ?? null,
          latestNoteAgeSeconds,
          plannerActions,
          hasEnoughPrivateReviewEvidence,
          readinessHint: hasEnoughPrivateReviewEvidence
            ? "Candidate has local review evidence for a private status review."
            : "Keep collecting private review evidence before changing status.",
        },
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Stats are advisory and derived only from local Raven candidate history and review notes.",
          "This endpoint does not change status, approve export, fetch sources, open a browser, write core memory, or call a model.",
        ],
      };
    }),

  recommendationCandidateReviewStatsSummary: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          summary: {
            total: 0,
            byReadiness: {},
            byPlannerAction: {},
            byNoteCoverage: {},
          },
          rows: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const [candidatesResult, historyResult, notesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
            ORDER BY updated_at DESC, id DESC
            LIMIT ?
          `,
          args: [sessionId, input?.limit ?? 40],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_history
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
      ]);
      const candidates = candidatesResult.rows.map(rowToRecommendationCandidate);
      const history = historyResult.rows.map(rowToRecommendationCandidateHistory);
      const notes = notesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const historyByCandidate = new Map<number, ReturnType<typeof rowToRecommendationCandidateHistory>[]>();
      for (const item of history) {
        const existing = historyByCandidate.get(item.candidateId) ?? [];
        existing.push(item);
        historyByCandidate.set(item.candidateId, existing);
      }
      const notesByCandidate = new Map<number, ReturnType<typeof rowToRecommendationCandidateReviewNote>[]>();
      for (const note of notes) {
        const existing = notesByCandidate.get(note.candidateId) ?? [];
        existing.push(note);
        notesByCandidate.set(note.candidateId, existing);
      }
      const byReadiness: Record<string, number> = {};
      const byPlannerAction: Record<string, number> = {};
      const byNoteCoverage: Record<string, number> = {};
      const rows = candidates.map((candidate) => {
        const candidateHistory = historyByCandidate.get(candidate.id) ?? [];
        const candidateNotes = notesByCandidate.get(candidate.id) ?? [];
        const plannerActions = [...new Set(candidateNotes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
        const hasEnoughPrivateReviewEvidence = privateReviewReadiness({
          status: candidate.status,
          confidence: candidate.confidence,
          reviewNoteCount: candidateNotes.length,
          plannerActions,
        });
        const readiness = hasEnoughPrivateReviewEvidence ? "ready_for_private_status_review" : "needs_more_private_review";
        const noteCoverage = candidateNotes.length === 0 ? "no_notes" : candidateNotes.length === 1 ? "one_note" : "multiple_notes";
        byReadiness[readiness] = (byReadiness[readiness] ?? 0) + 1;
        byNoteCoverage[noteCoverage] = (byNoteCoverage[noteCoverage] ?? 0) + 1;
        for (const action of plannerActions) {
          byPlannerAction[action] = (byPlannerAction[action] ?? 0) + 1;
        }
        return {
          candidateId: candidate.id,
          seedCategory: candidate.seedCategory,
          status: candidate.status,
          confidence: candidate.confidence,
          reviewNoteCount: candidateNotes.length,
          statusHistoryCount: candidateHistory.length,
          statusTransitionCount: candidateHistory.filter((item) => item.fromStatus != null && item.fromStatus !== item.toStatus).length,
          plannerActions,
          latestNoteAt: candidateNotes[0]?.createdAt ?? null,
          readiness,
          noteCoverage,
        };
      });
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        summary: {
          total: rows.length,
          byReadiness,
          byPlannerAction,
          byNoteCoverage,
        },
        rows,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Stats summary is derived only from local Raven candidates, status history, and review notes.",
          "This endpoint does not change status, approve export, fetch sources, open a browser, write core memory, or call a model.",
        ],
      };
    }),

  draftRecommendationCandidateReviewDecision: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const notesResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_review_notes
          WHERE candidate_id = ?
            AND raven_session_id = ?
          ORDER BY created_at DESC, id DESC
        `,
        args: [input.candidateId, session.id],
      });
      const candidate = rowToRecommendationCandidate(candidateRow);
      const notes = notesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const plannerActions = [...new Set(notes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
      const decision = draftPrivateReviewDecision({
        status: candidate.status,
        confidence: candidate.confidence,
        reviewNoteCount: notes.length,
        plannerActions,
      });
      return {
        mode: "private_read" as const,
        candidate,
        decision: {
          proposedStatus: decision.proposedStatus,
          reason: decision.reason,
          confidence: decision.confidence,
          appliesStatus: false,
          requiresExplicitMutation: true,
        },
        evidence: {
          reviewNoteCount: notes.length,
          plannerActions,
          latestNoteAt: notes[0]?.createdAt ?? null,
        },
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Decision draft is local advice only.",
          "This endpoint does not change status, approve export, fetch sources, open a browser, write core memory, or call a model.",
        ],
      };
    }),

  draftRecommendationCandidateReviewDecisionSummary: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          proposedStatus: z.enum(recommendationCandidateStatuses).optional(),
          plannerAction: z.enum(candidateReviewActions).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          summary: {
            total: 0,
            byProposedStatus: {},
            byReason: {},
          },
          rows: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const [candidatesResult, notesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
            ORDER BY updated_at DESC, id DESC
            LIMIT ?
          `,
          args: [sessionId, input?.limit ?? 40],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
      ]);
      const candidates = candidatesResult.rows.map(rowToRecommendationCandidate);
      const notes = notesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const notesByCandidate = new Map<number, ReturnType<typeof rowToRecommendationCandidateReviewNote>[]>();
      for (const note of notes) {
        const existing = notesByCandidate.get(note.candidateId) ?? [];
        existing.push(note);
        notesByCandidate.set(note.candidateId, existing);
      }
      const allRows = candidates.map((candidate) => {
        const candidateNotes = notesByCandidate.get(candidate.id) ?? [];
        const plannerActions = [...new Set(candidateNotes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
        const decision = draftPrivateReviewDecision({
          status: candidate.status,
          confidence: candidate.confidence,
          reviewNoteCount: candidateNotes.length,
          plannerActions,
        });
        return {
          candidateId: candidate.id,
          seedCategory: candidate.seedCategory,
          currentStatus: candidate.status,
          confidence: candidate.confidence,
          proposedStatus: decision.proposedStatus,
          reason: decision.reason,
          decisionConfidence: decision.confidence,
          reviewNoteCount: candidateNotes.length,
          plannerActions,
          latestNoteAt: candidateNotes[0]?.createdAt ?? null,
          appliesStatus: false,
          requiresExplicitMutation: true,
        };
      });
      const rows = allRows.filter((row) => {
        if (input?.proposedStatus && row.proposedStatus !== input.proposedStatus) return false;
        if (input?.plannerAction && !row.plannerActions.includes(input.plannerAction)) return false;
        return true;
      });
      const byProposedStatus: Record<string, number> = {};
      const byReason: Record<string, number> = {};
      for (const row of rows) {
        byProposedStatus[row.proposedStatus] = (byProposedStatus[row.proposedStatus] ?? 0) + 1;
        byReason[row.reason] = (byReason[row.reason] ?? 0) + 1;
      }
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        summary: {
          total: rows.length,
          byProposedStatus,
          byReason,
        },
        rows,
        filters: {
          proposedStatus: input?.proposedStatus ?? null,
          plannerAction: input?.plannerAction ?? null,
        },
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Decision draft summary is local advice only.",
          "This endpoint does not change status, approve export, fetch sources, open a browser, write core memory, or call a model.",
        ],
      };
    }),

  recommendationCandidateDecisionDraftDetail: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
        eventKind: z.enum(candidateTimelineEventKinds).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const candidate = rowToRecommendationCandidate(candidateRow);
      const sourceIds = Array.isArray(candidate.sourcePreferenceIds)
        ? candidate.sourcePreferenceIds.filter((id): id is number => Number.isFinite(Number(id))).map(Number)
        : [];
      const [sourcePreferencesResult, historyResult, reviewNotesResult, decisionDraftNotesResult, rollupResult] = await Promise.all([
        sourceIds.length === 0
          ? Promise.resolve({ rows: [] })
          : db.execute({
              sql: `
                SELECT *
                FROM raven_private_preferences
                WHERE raven_session_id = ?
                  AND id IN (${sourceIds.map(() => "?").join(", ")})
                ORDER BY created_at DESC, id DESC
              `,
              args: [session.id, ...sourceIds],
            }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_history
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [candidate.id, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [candidate.id, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_decision_draft_notes
            WHERE candidate_id = ?
              AND raven_session_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [candidate.id, session.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_private_preferences
            WHERE raven_session_id = ?
              AND category = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [session.id, candidate.seedCategory],
        }),
      ]);
      const history = historyResult.rows.map(rowToRecommendationCandidateHistory);
      const reviewNotes = reviewNotesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const decisionDraftNotes = decisionDraftNotesResult.rows.map(rowToRecommendationCandidateDecisionDraftNote);
      const categoryPreferences = rollupResult.rows.map(rowToPreference);
      const now = Math.floor(Date.now() / 1000);
      const positive = categoryPreferences.filter((preference) => preference.weight > 0);
      const negative = categoryPreferences.filter((preference) => preference.weight < 0);
      const latestAt = categoryPreferences[0]?.createdAt ?? null;
      const latestNote = reviewNotes[reviewNotes.length - 1] ?? null;
      const plannerActions = [...new Set(reviewNotes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
      const statusEvents = history.map((item) => ({
        id: `status:${item.id}`,
        kind: "status_change" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        actor: item.actor,
        summary: item.fromStatus == null
          ? `Candidate entered ${item.toStatus}.`
          : `Candidate moved from ${item.fromStatus} to ${item.toStatus}.`,
        status: {
          fromStatus: item.fromStatus,
          toStatus: item.toStatus,
          reason: item.reason,
        },
        reviewNote: null,
      }));
      const noteEvents = reviewNotes.map((item) => ({
        id: `note:${item.id}`,
        kind: "review_note" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        actor: item.actor,
        summary: item.plannerAction == null
          ? "Review note added."
          : `Review note added for ${item.plannerAction}.`,
        status: null,
        reviewNote: item,
      }));
      const decisionDraftNoteEvents = decisionDraftNotes.map((item) => ({
        id: `decision_draft_note:${item.id}`,
        kind: "decision_draft_note" as const,
        candidateId: item.candidateId,
        createdAt: item.createdAt,
        actor: item.actor,
        summary: `Decision draft note added for ${item.proposedStatus}.`,
        status: null,
        reviewNote: null,
        decisionDraftNote: item,
      }));
      const allEvents = [...statusEvents, ...noteEvents, ...decisionDraftNoteEvents].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
      const events = input.eventKind ? allEvents.filter((event) => event.kind === input.eventKind) : allEvents;
      const timelineSummary = countTimelineEvents(allEvents);
      const statusTransitionCount = history.filter((item) => item.fromStatus != null && item.fromStatus !== item.toStatus).length;
      const hasEnoughPrivateReviewEvidence = privateReviewReadiness({
        status: candidate.status,
        confidence: candidate.confidence,
        reviewNoteCount: reviewNotes.length,
        plannerActions,
      });
      const decision = draftPrivateReviewDecision({
        status: candidate.status,
        confidence: candidate.confidence,
        reviewNoteCount: reviewNotes.length,
        plannerActions,
      });
      return {
        mode: "private_read" as const,
        detail: {
          candidate,
          sourcePreferences: sourcePreferencesResult.rows.map(rowToPreference),
          rollupContext: {
            category: candidate.seedCategory,
            totalSignals: categoryPreferences.length,
            totalWeight: categoryPreferences.reduce((sum, preference) => sum + preference.weight, 0),
            contradictionState: contradictionState(positive.length, negative.length),
            decayBucket: ageBucket(latestAt, now),
            latestAt,
          },
          history,
          reviewNotes,
          decisionDraftNotes,
        },
        timeline: {
          events,
          summary: timelineSummary,
          filters: {
            eventKind: input.eventKind ?? null,
          },
        },
        stats: {
          timelineEventCount: events.length,
          statusHistoryCount: history.length,
          reviewNoteCount: reviewNotes.length,
          decisionDraftNoteCount: decisionDraftNotes.length,
          statusTransitionCount,
          latestNoteAt: latestNote?.createdAt ?? null,
          latestNoteAgeSeconds: latestNote == null ? null : Math.max(0, now - latestNote.createdAt),
          plannerActions,
          hasEnoughPrivateReviewEvidence,
          readinessHint: hasEnoughPrivateReviewEvidence
            ? "Candidate has local review evidence for a private status review."
            : "Keep collecting private review evidence before changing status.",
        },
        decision: {
          proposedStatus: decision.proposedStatus,
          reason: decision.reason,
          confidence: decision.confidence,
          appliesStatus: false,
          requiresExplicitMutation: true,
        },
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Decision detail combines only local Raven candidate detail, timeline, stats, and decision draft.",
          "This endpoint does not change status, approve export, fetch sources, open a browser, write core memory, or call a model.",
        ],
      };
    }),

  addRecommendationCandidateDecisionDraftNote: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
        proposedStatus: z.enum(recommendationCandidateStatuses),
        reason: z.string().min(1).max(1000),
        note: z.string().min(1).max(1200),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const candidateRow = candidateResult.rows[0];
      if (!candidateRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const notesResult = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_review_notes
          WHERE candidate_id = ?
            AND raven_session_id = ?
          ORDER BY created_at DESC, id DESC
        `,
        args: [input.candidateId, session.id],
      });
      const candidate = rowToRecommendationCandidate(candidateRow);
      const notes = notesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const plannerActions = [...new Set(notes.map((note) => note.plannerAction).filter((action): action is string => Boolean(action)))];
      const decision = draftPrivateReviewDecision({
        status: candidate.status,
        confidence: candidate.confidence,
        reviewNoteCount: notes.length,
        plannerActions,
      });
      if (input.proposedStatus !== decision.proposedStatus || input.reason !== decision.reason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Decision draft note must match the current local decision draft.",
        });
      }
      const result = await db.execute({
        sql: `
          INSERT INTO raven_recommendation_candidate_decision_draft_notes (
            candidate_id,
            raven_session_id,
            proposed_status,
            reason,
            note,
            actor
          )
          VALUES (?, ?, ?, ?, ?, 'raven')
          RETURNING *
        `,
        args: [
          input.candidateId,
          session.id,
          input.proposedStatus,
          input.reason,
          input.note,
        ],
      });
      return {
        ok: true,
        mode: "private_append_only_decision_draft_note" as const,
        note: rowToRecommendationCandidateDecisionDraftNote(result.rows[0]!),
        appendOnly: true,
        appliesStatus: false,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Decision draft notes stay in raven_recommendation_candidate_decision_draft_notes.",
          "This endpoint records rationale only. It does not change candidate status.",
          "No browser, source search, media fetch, export, core memory write, or model call runs from this endpoint.",
        ],
      };
    }),

  recommendationCandidateDecisionDraftNotes: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          candidateId: z.number().int().positive().optional(),
          proposedStatus: z.enum(recommendationCandidateStatuses).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const where = ["raven_session_id = ?"];
      const args: (number | string)[] = [input?.ravenSessionId ?? activeSession.id];
      if (input?.candidateId) {
        where.push("candidate_id = ?");
        args.push(input.candidateId);
      }
      if (input?.proposedStatus) {
        where.push("proposed_status = ?");
        args.push(input.proposedStatus);
      }
      args.push(input?.limit ?? 40);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_decision_draft_notes
          WHERE ${where.join(" AND ")}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToRecommendationCandidateDecisionDraftNote);
      const byProposedStatus: Record<string, number> = {};
      for (const item of items) {
        byProposedStatus[item.proposedStatus] = (byProposedStatus[item.proposedStatus] ?? 0) + 1;
      }
      return {
        mode: "private_read" as const,
        items,
        summary: {
          total: items.length,
          byProposedStatus,
        },
        appendOnly: true,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        filters: {
          candidateId: input?.candidateId ?? null,
          proposedStatus: input?.proposedStatus ?? null,
        },
      };
    }),

  searchRecommendationCandidateDecisionDraftNotes: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        query: z.string().min(1).max(120),
        proposedStatus: z.enum(recommendationCandidateStatuses).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const where = ["raven_session_id = ?", "(lower(note) LIKE ? OR lower(reason) LIKE ?)"];
      const likeQuery = `%${input.query.toLowerCase()}%`;
      const args: (number | string)[] = [input.ravenSessionId ?? activeSession.id, likeQuery, likeQuery];
      if (input.proposedStatus) {
        where.push("proposed_status = ?");
        args.push(input.proposedStatus);
      }
      args.push(input.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_decision_draft_notes
          WHERE ${where.join(" AND ")}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToRecommendationCandidateDecisionDraftNote).map((item) => ({
        note: item,
        snippet: makePrivateSnippet(`${item.reason} ${item.note}`, input.query),
      }));
      return {
        mode: "private_read" as const,
        query: input.query,
        filters: {
          proposedStatus: input.proposedStatus ?? null,
        },
        items,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Search reads only Raven decision draft note tables.",
          "Snippets are local excerpts from private decision draft rationale.",
          "No browser, source search, media fetch, export, core memory write, or model call runs from this endpoint.",
        ],
      };
    }),

  addRecommendationCandidateReviewNote: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
        plannerAction: z.enum(candidateReviewActions).optional(),
        note: z.string().min(1).max(1200),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidate = await db.execute({
        sql: `
          SELECT id
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      if (!candidate.rows[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const result = await db.execute({
        sql: `
          INSERT INTO raven_recommendation_candidate_review_notes (
            candidate_id,
            raven_session_id,
            planner_action,
            note,
            actor
          )
          VALUES (?, ?, ?, ?, 'raven')
          RETURNING *
        `,
        args: [
          input.candidateId,
          session.id,
          input.plannerAction ?? null,
          input.note,
        ],
      });
      return {
        ok: true,
        mode: "private_append_only_note" as const,
        note: rowToRecommendationCandidateReviewNote(result.rows[0]!),
        appendOnly: true,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Review notes stay in raven_recommendation_candidate_review_notes.",
          "This endpoint does not approve export, change candidate status, fetch sources, open a browser, or call a model.",
        ],
      };
    }),

  recommendationCandidateReviewNotes: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          candidateId: z.number().int().positive().optional(),
          plannerAction: z.enum(candidateReviewActions).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const where = ["raven_session_id = ?"];
      const args: (number | string)[] = [input?.ravenSessionId ?? activeSession.id];
      if (input?.candidateId) {
        where.push("candidate_id = ?");
        args.push(input.candidateId);
      }
      if (input?.plannerAction) {
        where.push("planner_action = ?");
        args.push(input.plannerAction);
      }
      args.push(input?.limit ?? 40);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidate_review_notes
          WHERE ${where.join(" AND ")}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        mode: "private_read" as const,
        items: result.rows.map(rowToRecommendationCandidateReviewNote),
        appendOnly: true,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        filters: {
          candidateId: input?.candidateId ?? null,
          plannerAction: input?.plannerAction ?? null,
        },
      };
    }),

  addRecommendationCandidateReviewBatchNote: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateIds: z.array(z.number().int().positive()).min(1).max(50),
        plannerAction: z.enum(candidateReviewActions).optional(),
        note: z.string().min(1).max(1200),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const candidateIds = [...new Set(input.candidateIds)];
      const candidates = await db.execute({
        sql: `
          SELECT id
          FROM raven_recommendation_candidates
          WHERE raven_session_id = ?
            AND id IN (${candidateIds.map(() => "?").join(", ")})
        `,
        args: [session.id, ...candidateIds],
      });
      const foundIds = new Set(candidates.rows.map((row) => Number(row.id)));
      const missingIds = candidateIds.filter((id) => !foundIds.has(id));
      if (missingIds.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Every Raven review batch note candidate must belong to the active Raven session.",
        });
      }
      const inserted = [];
      for (const candidateId of candidateIds) {
        const result = await db.execute({
          sql: `
            INSERT INTO raven_recommendation_candidate_review_notes (
              candidate_id,
              raven_session_id,
              planner_action,
              note,
              actor
            )
            VALUES (?, ?, ?, ?, 'raven')
            RETURNING *
          `,
          args: [
            candidateId,
            session.id,
            input.plannerAction ?? null,
            input.note,
          ],
        });
        inserted.push(rowToRecommendationCandidateReviewNote(result.rows[0]!));
      }
      return {
        ok: true,
        mode: "private_append_only_batch_note" as const,
        notes: inserted,
        candidateIds,
        appendOnly: true,
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Batch review notes stay in raven_recommendation_candidate_review_notes.",
          "All candidate ids are validated against the active Raven session before any note is written.",
          "This endpoint does not approve export, change candidate status, fetch sources, open a browser, or call a model.",
        ],
      };
    }),

  searchRecommendationCandidateReviewNotes: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        query: z.string().min(1).max(120),
        plannerAction: z.enum(candidateReviewActions).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input.ravenSessionId ?? activeSession.id;
      const where = ["notes.raven_session_id = ?", "(lower(notes.note) LIKE ? OR lower(candidates.seed_category) LIKE ?)"];
      const likeQuery = `%${input.query.toLowerCase()}%`;
      const args: (number | string)[] = [sessionId, likeQuery, likeQuery];
      if (input.plannerAction) {
        where.push("notes.planner_action = ?");
        args.push(input.plannerAction);
      }
      args.push(input.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT
            notes.*,
            candidates.seed_category,
            candidates.seed_text,
            candidates.status,
            candidates.confidence
          FROM raven_recommendation_candidate_review_notes notes
          INNER JOIN raven_recommendation_candidates candidates
            ON candidates.id = notes.candidate_id
           AND candidates.raven_session_id = notes.raven_session_id
          WHERE ${where.join(" AND ")}
          ORDER BY notes.created_at DESC, notes.id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        mode: "private_read" as const,
        query: input.query,
        filters: {
          plannerAction: input.plannerAction ?? null,
        },
        items: result.rows.map((row) => ({
          note: rowToRecommendationCandidateReviewNote(row),
          seedCategory: String(row.seed_category),
          seedText: String(row.seed_text),
          candidateStatus: String(row.status),
          candidateConfidence: String(row.confidence),
          snippet: makePrivateSnippet(String(row.note), input.query),
        })),
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Search reads only Raven candidate and review-note tables.",
          "Snippets are local excerpts from private review notes.",
          "No browser, source search, media fetch, export, core memory write, or model call runs from this endpoint.",
        ],
      };
    }),

  recommendationCandidateReviewDigest: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          plannerAction: z.enum(candidateReviewActions).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          groups: {},
          rows: [],
          writesCoreMemory: false,
          writesExternal: false,
          opensBrowser: false,
          callsExternalModels: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const [candidatesResult, preferencesResult, reviewNotesResult] = await Promise.all([
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidates
            WHERE raven_session_id = ?
            ORDER BY updated_at DESC, id DESC
            LIMIT ?
          `,
          args: [sessionId, input?.limit ?? 40],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_private_preferences
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_recommendation_candidate_review_notes
            WHERE raven_session_id = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sessionId],
        }),
      ]);
      const candidates = candidatesResult.rows.map(rowToRecommendationCandidate);
      const preferences = preferencesResult.rows.map(rowToPreference);
      const reviewNotes = reviewNotesResult.rows.map(rowToRecommendationCandidateReviewNote);
      const notesByCandidate = new Map<number, ReturnType<typeof rowToRecommendationCandidateReviewNote>[]>();
      for (const note of reviewNotes) {
        const existing = notesByCandidate.get(note.candidateId) ?? [];
        existing.push(note);
        notesByCandidate.set(note.candidateId, existing);
      }
      const now = Math.floor(Date.now() / 1000);
      const groups: Record<string, {
        count: number;
        notedCount: number;
        pendingNoteCount: number;
        candidateIds: number[];
      }> = {};
      const allRows = candidates.map((candidate) => {
        const categoryPreferences = preferences.filter((preference) => preference.category === candidate.seedCategory);
        const positiveCount = categoryPreferences.filter((preference) => preference.weight > 0).length;
        const negativeCount = categoryPreferences.filter((preference) => preference.weight < 0).length;
        const contradiction = contradictionState(positiveCount, negativeCount);
        const decay = ageBucket(categoryPreferences[0]?.createdAt ?? null, now);
        const plan = reviewActionFor({
          status: candidate.status,
          confidence: candidate.confidence,
          contradictionState: contradiction,
          decayBucket: decay,
        });
        const candidateNotes = notesByCandidate.get(candidate.id) ?? [];
        const latestReviewNote = candidateNotes[0] ?? null;
        const group = groups[plan.action] ?? {
          count: 0,
          notedCount: 0,
          pendingNoteCount: 0,
          candidateIds: [],
        };
        group.count += 1;
        if (latestReviewNote) {
          group.notedCount += 1;
        } else {
          group.pendingNoteCount += 1;
        }
        group.candidateIds.push(candidate.id);
        groups[plan.action] = group;
        return {
          candidateId: candidate.id,
          seedCategory: candidate.seedCategory,
          status: candidate.status,
          confidence: candidate.confidence,
          contradictionState: contradiction,
          decayBucket: decay,
          plannerAction: plan.action,
          plannerReason: plan.reason,
          reviewNoteCount: candidateNotes.length,
          latestReviewNote,
        };
      });
      const rows = input?.plannerAction
        ? allRows.filter((row) => row.plannerAction === input.plannerAction)
        : allRows;
      const filteredGroups: typeof groups = {};
      for (const row of rows) {
        const sourceGroup = groups[row.plannerAction];
        if (!sourceGroup) continue;
        filteredGroups[row.plannerAction] = {
          count: rows.filter((item) => item.plannerAction === row.plannerAction).length,
          notedCount: rows.filter((item) => item.plannerAction === row.plannerAction && item.latestReviewNote).length,
          pendingNoteCount: rows.filter((item) => item.plannerAction === row.plannerAction && !item.latestReviewNote).length,
          candidateIds: rows.filter((item) => item.plannerAction === row.plannerAction).map((item) => item.candidateId),
        };
      }
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        groups: input?.plannerAction ? filteredGroups : groups,
        rows,
        filters: {
          plannerAction: input?.plannerAction ?? null,
        },
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
        gates: [
          "Digest is derived only from local Raven candidates, preferences, and review notes.",
          "No digest item approves export, changes status, fetches sources, opens a browser, writes core memory, or calls a model.",
        ],
      };
    }),

  updateRecommendationCandidateStatus: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        candidateId: z.number().int().positive(),
        status: z.enum(recommendationCandidateStatuses),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const current = await db.execute({
        sql: `
          SELECT *
          FROM raven_recommendation_candidates
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.candidateId, session.id],
      });
      const currentRow = current.rows[0];
      if (!currentRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven recommendation candidate matched that id.",
        });
      }
      const fromStatus = String(currentRow.status);
      const result = await db.execute({
        sql: `
          UPDATE raven_recommendation_candidates
          SET status = ?,
              updated_at = unixepoch()
          WHERE id = ?
            AND raven_session_id = ?
          RETURNING *
        `,
        args: [input.status, input.candidateId, session.id],
      });
      await db.execute({
        sql: `
          INSERT INTO raven_recommendation_candidate_history (
            candidate_id,
            raven_session_id,
            from_status,
            to_status,
            reason,
            actor
          )
          VALUES (?, ?, ?, ?, ?, 'raven')
        `,
        args: [
          input.candidateId,
          session.id,
          fromStatus,
          input.status,
          input.reason ?? null,
        ],
      });
      return {
        ok: true,
        candidate: rowToRecommendationCandidate(result.rows[0]),
        writesCoreMemory: false,
        writesExternal: false,
        opensBrowser: false,
        callsExternalModels: false,
      };
    }),

  requestUnlock: publicProcedure
    .input(z.object({ phrase: z.string().min(1) }))
    .mutation(async ({ input }) => {
      if (normalizePhrase(input.phrase) !== unlockPhrase) {
        return {
          ok: false,
          status: "sealed" as const,
          message: "Raven stays sealed.",
          nextAction: "Enter the first unlock phrase.",
        };
      }
      return {
        ok: true,
        status: "confirmation_required" as const,
        message: "Please confirm.",
        nextAction: "Enter the second unlock phrase.",
      };
    }),

  confirmUnlock: publicProcedure
    .input(
      z.object({
        phrase: z.string().min(1),
        privacyScope: z.string().min(1).max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (normalizePhrase(input.phrase) !== confirmPhrase) {
        return {
          ok: false,
          status: "sealed" as const,
          message: "Raven stays sealed.",
        };
      }

      const db = await getCerebroDb();
      const permissionPreflight = await recordPermissionPreflight(db, {
        actionClass: "local_note",
        sensitiveData: true,
        persistsMemory: false,
        requestedByAgent: "cortana",
        targetSummary: "Raven sealed module unlock.",
        additionalReasons: [
          "User explicitly requested Raven unlock in this session.",
          "Private data remains outside core CereBro memory.",
        ],
      });
      const result = await db.execute({
        sql: `
          INSERT INTO raven_private_sessions (
            status,
            unlock_stage,
            privacy_scope,
            opened_by,
            permission_preflight_id
          )
          VALUES ('active', 'confirmed', ?, 'cortana', ?)
          RETURNING *
        `,
        args: [
          input.privacyScope ??
            "Local-only Raven build session. No external writes, browser sessions, downloads, generator calls, Notion, Obsidian, Slack, or core-memory export.",
          Number(permissionPreflight.row.id),
        ],
      });
      return {
        ok: true,
        status: "unlocked" as const,
        session: rowToSession(result.rows[0]!),
        boundary: {
          writesExternal: false,
          opensBrowser: false,
          downloadsMedia: false,
          callsExternalModels: false,
          writesCoreMemory: false,
        },
      };
    }),

  addPrivateEvent: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        eventType: z.enum(eventTypes),
        title: z.string().max(160).optional(),
        body: z.string().min(1).max(5000),
        sourceUri: z.string().url().optional(),
        sourceLabel: z.string().max(160).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);

      const result = await db.execute({
        sql: `
          INSERT INTO raven_private_events (
            raven_session_id,
            event_type,
            title,
            body,
            source_uri,
            source_label,
            privacy_class,
            metadata_json
          )
          VALUES (?, ?, ?, ?, ?, ?, 'raven_private', ?)
          RETURNING *
        `,
        args: [
          session.id,
          input.eventType,
          input.title ?? null,
          input.body,
          input.sourceUri ?? null,
          input.sourceLabel ?? null,
          input.metadata == null ? null : JSON.stringify(input.metadata),
        ],
      });
      await db.execute({
        sql: `UPDATE raven_private_sessions SET last_seen_at = unixepoch() WHERE id = ?`,
        args: [session.id],
      });
      return {
        ok: true,
        writesCoreMemory: false,
        writesExternal: false,
        event: rowToEvent(result.rows[0]!),
      };
    }),

  addPreference: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        category: z.enum(preferenceCategories),
        signal: z.string().min(1).max(240),
        weight: z.number().int().min(-5).max(5).default(1),
        notes: z.string().max(1000).optional(),
        sourceEventId: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const result = await db.execute({
        sql: `
          INSERT INTO raven_private_preferences (
            raven_session_id,
            category,
            signal,
            weight,
            notes,
            source_event_id
          )
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          session.id,
          input.category,
          input.signal,
          input.weight,
          input.notes ?? null,
          input.sourceEventId ?? null,
        ],
      });
      await db.execute({
        sql: `
          INSERT INTO raven_private_events (
            raven_session_id,
            event_type,
            title,
            body,
            privacy_class,
            metadata_json
          )
          VALUES (?, 'preference', ?, ?, 'raven_private', ?)
        `,
        args: [
          session.id,
          `Preference: ${input.category}`,
          input.signal,
          JSON.stringify({ preferenceId: Number(result.rows[0]!.id), weight: input.weight }),
        ],
      });
      return {
        ok: true,
        preference: rowToPreference(result.rows[0]!),
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),

  scrubPrivateText: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        targetKind: z.enum(["event", "preference", "bridge_proposal", "free_text"]),
        targetId: z.number().int().positive().optional(),
        body: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const scrubbed = scrubPrivateText(input.body);
      const result = await db.execute({
        sql: `
          INSERT INTO raven_scrub_receipts (
            raven_session_id,
            target_kind,
            target_id,
            original_sha256,
            scrubbed_body,
            findings_json
          )
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          session.id,
          input.targetKind,
          input.targetId ?? null,
          hashText(input.body),
          scrubbed.scrubbed,
          JSON.stringify(scrubbed.findings),
        ],
      });
      await db.execute({
        sql: `
          INSERT INTO raven_private_events (
            raven_session_id,
            event_type,
            title,
            body,
            privacy_class,
            metadata_json
          )
          VALUES (?, 'scrub_receipt', 'Scrub receipt', ?, 'raven_private', ?)
        `,
        args: [
          session.id,
          `Scrubbed ${input.targetKind}. Findings: ${scrubbed.findings.length ? scrubbed.findings.map((finding) => finding.label).join(", ") : "none"}.`,
          JSON.stringify({ scrubReceiptId: Number(result.rows[0]!.id) }),
        ],
      });
      return {
        ok: true,
        receipt: rowToScrubReceipt(result.rows[0]!),
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),

  proposeBridgeExport: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        sourceEventId: z.number().int().positive().optional(),
        target: z.enum(bridgeTargets),
        title: z.string().min(1).max(180),
        summary: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const scrubbed = scrubPrivateText(input.summary);
      const permissionPreflight = await recordPermissionPreflight(db, {
        actionClass: "external_write",
        sensitiveData: true,
        persistsMemory: true,
        requestedByAgent: "raven",
        targetSummary: `Raven bridge export proposal: ${input.title}`,
        additionalReasons: [
          "Raven bridge export is a sealed private module hard gate.",
          "This records a local approval preview only.",
        ],
      });
      const receipt = await db.execute({
        sql: `
          INSERT INTO raven_scrub_receipts (
            raven_session_id,
            target_kind,
            target_id,
            original_sha256,
            scrubbed_body,
            findings_json
          )
          VALUES (?, 'bridge_proposal', ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          session.id,
          input.sourceEventId ?? null,
          hashText(input.summary),
          scrubbed.scrubbed,
          JSON.stringify(scrubbed.findings),
        ],
      });
      const result = await db.execute({
        sql: `
          INSERT INTO raven_bridge_export_proposals (
            raven_session_id,
            source_event_id,
            scrub_receipt_id,
            target,
            title,
            summary,
            status,
            approval_required
          )
          VALUES (?, ?, ?, ?, ?, ?, 'queued_for_approval', ?)
          RETURNING *
        `,
        args: [
          session.id,
          input.sourceEventId ?? null,
          Number(receipt.rows[0]!.id),
          input.target,
          input.title,
          scrubbed.scrubbed,
          "Explicit user approval required before any core memory, Obsidian, Notion, Slack, task, or artifact write.",
        ],
      });
      const approval = await db.execute({
        sql: `
          INSERT INTO approvals (
            action_type,
            target_type,
            target_id,
            requested_by_agent,
            status,
            reason,
            context_summary,
            sensitive_data_flag,
            cost_risk,
            permission_preflight_id
          )
          VALUES (?, ?, ?, 'raven', 'pending', ?, ?, 1, 'sealed_private_export', ?)
          RETURNING id
        `,
        args: [
          "raven_bridge_export",
          "raven_bridge_export_proposal",
          Number(result.rows[0]!.id),
          "Raven bridge export proposal staged for explicit user approval. No export happened.",
          scrubbed.scrubbed,
          Number(permissionPreflight.row.id),
        ],
      });
      await db.execute({
        sql: `
          INSERT INTO raven_bridge_export_history (
            proposal_id,
            raven_session_id,
            from_status,
            to_status,
            reason,
            actor
          )
          VALUES (?, ?, NULL, 'queued_for_approval', ?, 'raven')
        `,
        args: [
          Number(result.rows[0]!.id),
          session.id,
          "Bridge export proposal created. Local approval preview staged. No export happened.",
        ],
      });
      await db.execute({
        sql: `
          INSERT INTO raven_private_events (
            raven_session_id,
            event_type,
            title,
            body,
            privacy_class,
            metadata_json
          )
          VALUES (?, 'bridge_export_proposal', ?, ?, 'raven_private', ?)
        `,
        args: [
          session.id,
          input.title,
          scrubbed.scrubbed,
          JSON.stringify({ proposalId: Number(result.rows[0]!.id), approvalId: Number(approval.rows[0]!.id), target: input.target }),
        ],
      });
      return {
        ok: true,
        proposal: rowToBridgeProposal(result.rows[0]!),
        scrubReceipt: rowToScrubReceipt(receipt.rows[0]!),
        approvalId: Number(approval.rows[0]!.id),
        permissionPreflightId: Number(permissionPreflight.row.id),
        writesCoreMemory: false,
        writesExternal: false,
        approvalRequired: true,
      };
    }),

  bridgeProposalDetail: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        proposalId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const proposal = await db.execute({
        sql: `
          SELECT *
          FROM raven_bridge_export_proposals
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.proposalId, session.id],
      });
      const proposalRow = proposal.rows[0];
      if (!proposalRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven bridge proposal matched that id.",
        });
      }
      const proposalDetail = rowToBridgeProposal(proposalRow);
      const [scrubReceipt, sourceEvent, approval, history] = await Promise.all([
        proposalDetail.scrubReceiptId == null
          ? Promise.resolve({ rows: [] })
          : db.execute({
              sql: `SELECT * FROM raven_scrub_receipts WHERE id = ? LIMIT 1`,
              args: [proposalDetail.scrubReceiptId],
            }),
        proposalDetail.sourceEventId == null
          ? Promise.resolve({ rows: [] })
          : db.execute({
              sql: `SELECT * FROM raven_private_events WHERE id = ? LIMIT 1`,
              args: [proposalDetail.sourceEventId],
            }),
        db.execute({
          sql: `
            SELECT *
            FROM approvals
            WHERE target_type = 'raven_bridge_export_proposal'
              AND target_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 1
          `,
          args: [proposalDetail.id],
        }),
        db.execute({
          sql: `
            SELECT *
            FROM raven_bridge_export_history
            WHERE proposal_id = ?
            ORDER BY created_at ASC, id ASC
          `,
          args: [proposalDetail.id],
        }),
      ]);
      const approvalPreview = rowToApprovalPreview(approval.rows[0]);
      const preflight = approvalPreview?.permissionPreflightId == null
        ? { rows: [] }
        : await db.execute({
            sql: `SELECT * FROM permission_preflight_records WHERE id = ? LIMIT 1`,
            args: [approvalPreview.permissionPreflightId],
          });
      return {
        mode: "private_read" as const,
        proposal: proposalDetail,
        scrubReceipt: scrubReceipt.rows[0] ? rowToScrubReceipt(scrubReceipt.rows[0]) : null,
        sourceEvent: sourceEvent.rows[0] ? rowToEvent(sourceEvent.rows[0]) : null,
        approvalPreview,
        permissionPreflight: preflight.rows[0]
          ? {
              id: Number(preflight.rows[0].id),
              decision: String(preflight.rows[0].decision),
              requiredApprovals: preflight.rows[0].required_approvals == null
                ? []
                : String(preflight.rows[0].required_approvals).split("\n").filter(Boolean),
              reasons: preflight.rows[0].reasons == null
                ? []
                : String(preflight.rows[0].reasons).split("\n").filter(Boolean),
            }
          : null,
        history: history.rows.map(rowToBridgeHistory),
        writesCoreMemory: false,
        writesExternal: false,
        approvesExport: false,
      };
    }),

  bridgeProposals: publicProcedure
    .input(
      z
        .object({
          status: z.enum(bridgeProposalStatuses).optional(),
          ravenSessionId: z.number().int().positive().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
        };
      }
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      where.push("raven_session_id = ?");
      args.push(input?.ravenSessionId ?? activeSession.id);
      if (input?.status) {
        where.push("status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 40);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_bridge_export_proposals
          WHERE ${where.join(" AND ")}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        mode: "private_read" as const,
        items: result.rows.map(rowToBridgeProposal),
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),

  updateBridgeProposalStatus: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        proposalId: z.number().int().positive(),
        status: z.enum(bridgeProposalStatuses),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { db, session } = await requireActiveSession(input.ravenSessionId);
      const current = await db.execute({
        sql: `
          SELECT *
          FROM raven_bridge_export_proposals
          WHERE id = ?
            AND raven_session_id = ?
          LIMIT 1
        `,
        args: [input.proposalId, session.id],
      });
      const currentRow = current.rows[0];
      if (!currentRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Raven bridge proposal matched that id.",
        });
      }
      const fromStatus = String(currentRow.status);
      const result = await db.execute({
        sql: `
          UPDATE raven_bridge_export_proposals
          SET status = ?,
              updated_at = unixepoch()
          WHERE id = ?
            AND raven_session_id = ?
          RETURNING *
        `,
        args: [input.status, input.proposalId, session.id],
      });
      await db.execute({
        sql: `
          INSERT INTO raven_bridge_export_history (
            proposal_id,
            raven_session_id,
            from_status,
            to_status,
            reason,
            actor
          )
          VALUES (?, ?, ?, ?, ?, 'raven')
        `,
        args: [
          input.proposalId,
          session.id,
          fromStatus,
          input.status,
          input.reason ?? null,
        ],
      });
      if (input.status === "cancelled" || input.status === "rejected") {
        await db.execute({
          sql: `
            UPDATE approvals
            SET status = ?,
                decided_at = unixepoch()
            WHERE target_type = 'raven_bridge_export_proposal'
              AND target_id = ?
              AND status = 'pending'
          `,
          args: [input.status, input.proposalId],
        });
      }
      return {
        ok: true,
        proposal: rowToBridgeProposal(result.rows[0]),
        writesCoreMemory: false,
        writesExternal: false,
        approvesExport: false,
      };
    }),

  recentEvents: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_private_events
          WHERE raven_session_id = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [sessionId, input?.limit ?? 30],
      });
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        items: result.rows.map(rowToEvent),
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),

  lock: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        phrase: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (!lockPhrases.has(normalizePhrase(input.phrase))) {
        return {
          ok: false,
          status: "active" as const,
          message: "Raven remains open.",
        };
      }
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          ok: true,
          status: "sealed" as const,
          message: "Raven is already sealed.",
        };
      }
      const sessionId = input.ravenSessionId ?? activeSession.id;
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE raven_private_sessions
          SET status = 'locked',
              lock_reason = 'user_phrase',
              locked_at = unixepoch(),
              last_seen_at = unixepoch()
          WHERE id = ? AND status = 'active'
        `,
        args: [sessionId],
      });
      return {
        ok: true,
        status: "sealed" as const,
        ravenSessionId: sessionId,
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),
});
