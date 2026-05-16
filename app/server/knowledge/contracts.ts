export const ARTIFACT_KINDS = [
  "source_url",
  "source_file",
  "source_screenshot",
  "source_note",
  "creative_prompt",
  "reusable_prompt",
  "tool_handoff",
  "external_model_handoff",
  "creative_image",
  "creative_video",
  "obsidian_note",
  "notion_page",
  "memory_note",
  "output_text",
  "output_markdown",
  "output_code",
  "output_diff",
  "output_file",
  "render_intermediate",
  "render_export",
  "message_draft",
  "message_sent",
  "message_follow_up",
  "message_capture",
  "session_handoff",
  "code_handoff",
  "qa_report",
  "model_test",
  "temp_file",
  "cleanup_report",
] as const;

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export const ARTIFACT_LIFECYCLE_STATES = [
  "inbox",
  "active",
  "review",
  "published",
  "superseded",
  "archived",
  "temp",
  "trash_staged",
  "deleted",
] as const;

export type ArtifactLifecycleState = (typeof ARTIFACT_LIFECYCLE_STATES)[number];

export const ARTIFACT_STORAGE_PROVIDERS = [
  "vault",
  "obsidian",
  "notion",
  "repo",
  "local",
  "external",
] as const;

export type ArtifactStorageProvider = (typeof ARTIFACT_STORAGE_PROVIDERS)[number];

export const RETENTION_RULES = [
  "keep_forever",
  "keep_until_project_archive",
  "archive_when_superseded",
  "review_after_7_days",
  "review_after_30_days",
  "delete_after_approval",
  "delete_after_approved_rule",
] as const;

export type RetentionRule = (typeof RETENTION_RULES)[number];

export interface VaultLayoutEntry {
  key: string;
  relativePath: string;
  purpose: string;
}

export const VAULT_LAYOUT: VaultLayoutEntry[] = [
  { key: "inboxCaptures", relativePath: "00_Inbox/captures", purpose: "Unsorted quick captures." },
  { key: "inboxDroppedFiles", relativePath: "00_Inbox/dropped-files", purpose: "User-dropped files waiting for routing." },
  { key: "projects", relativePath: "01_Projects", purpose: "Project/client-scoped workspaces." },
  { key: "sources", relativePath: "02_Sources", purpose: "Saved source captures and provenance." },
  { key: "outputDrafts", relativePath: "03_Outputs/drafts", purpose: "Draft outputs before review." },
  { key: "outputReview", relativePath: "03_Outputs/review", purpose: "Outputs awaiting approval or validation." },
  { key: "outputPublished", relativePath: "03_Outputs/published", purpose: "Approved durable outputs." },
  { key: "creativeImages", relativePath: "04_Creative/images", purpose: "Image prompts, drafts, finals, and rejected variants." },
  { key: "creativeVideo", relativePath: "04_Creative/video", purpose: "Video scripts, previews, renders, and exports." },
  { key: "code", relativePath: "05_Code", purpose: "Code handoffs, diffs, QA reports, and release notes." },
  { key: "messages", relativePath: "06_Messages", purpose: "Drafts, sent items, follow-ups, and archives." },
  { key: "obsidian", relativePath: "07_Knowledge/obsidian-vault", purpose: "Durable Markdown knowledge vault." },
  { key: "markdownExports", relativePath: "07_Knowledge/markdown-exports", purpose: "Markdown exports outside the live Obsidian vault." },
  { key: "systemLogs", relativePath: "08_System/logs", purpose: "System logs and operational records." },
  { key: "modelTests", relativePath: "08_System/model-tests", purpose: "Local model test notes and metrics." },
  { key: "cleanupReports", relativePath: "08_System/cleanup-reports", purpose: "Piccolo scan reports." },
  { key: "temp", relativePath: "09_Temp", purpose: "Regenerable scratch files and previews." },
  { key: "archive", relativePath: "99_Archive", purpose: "Approved archived material." },
  { key: "trashStaging", relativePath: "99_Trash_Staging", purpose: "Review zone before any approved deletion." },
];

export type ObsidianRetrievalDefault =
  | "include_index"
  | "include_when_validated"
  | "archive_only"
  | "exclude";

export interface ObsidianKnowledgeRoute {
  key: string;
  relativePath: string;
  purpose: string;
  retrievalDefault: ObsidianRetrievalDefault;
}

export const OBSIDIAN_KNOWLEDGE_ROUTES: ObsidianKnowledgeRoute[] = [
  {
    key: "atlas",
    relativePath: "00_Atlas",
    purpose: "Human entry points, vault maps, and navigation notes.",
    retrievalDefault: "include_index",
  },
  {
    key: "projects",
    relativePath: "10_Projects",
    purpose: "Project bridge notes. Every active project routes through one bridge.",
    retrievalDefault: "include_when_validated",
  },
  {
    key: "knowledge",
    relativePath: "20_Knowledge",
    purpose: "Current decisions, sources, learning, playbooks, reviews, operations, and capture syntheses.",
    retrievalDefault: "include_when_validated",
  },
  {
    key: "media",
    relativePath: "60_Media",
    purpose: "Indexes and notes about media artifacts. Heavy files stay in Drive.",
    retrievalDefault: "include_index",
  },
  {
    key: "templates",
    relativePath: "80_Templates",
    purpose: "Reusable note templates with RAG metadata fields.",
    retrievalDefault: "include_index",
  },
  {
    key: "archive",
    relativePath: "90_Archive",
    purpose: "Append-only session and build history. Searchable by humans, excluded from normal retrieval.",
    retrievalDefault: "archive_only",
  },
];

export const OBSIDIAN_RETRIEVAL_METADATA_FIELDS = [
  "canonical_status",
  "retrieval_status",
  "llm_summary",
  "source_ids",
  "related_notes",
  "privacy_class",
] as const;

export type ObsidianRetrievalMetadataField =
  (typeof OBSIDIAN_RETRIEVAL_METADATA_FIELDS)[number];

export const OBSIDIAN_CANONICAL_STATUSES = [
  "draft",
  "current",
  "superseded",
  "archived",
] as const;

export type ObsidianCanonicalStatus =
  (typeof OBSIDIAN_CANONICAL_STATUSES)[number];

export const OBSIDIAN_RETRIEVAL_STATUSES = [
  "inactive",
  "needs_validation",
  "active",
  "archive_only",
] as const;

export type ObsidianRetrievalStatus =
  (typeof OBSIDIAN_RETRIEVAL_STATUSES)[number];

export const OBSIDIAN_PRIVACY_CLASSES = [
  "public",
  "internal",
  "private",
  "restricted",
] as const;

export type ObsidianPrivacyClass =
  (typeof OBSIDIAN_PRIVACY_CLASSES)[number];

export interface ObsidianRetrievalMetadataTemplate {
  canonical_status: ObsidianCanonicalStatus;
  retrieval_status: ObsidianRetrievalStatus;
  llm_summary: string;
  source_ids: string[];
  related_notes: string[];
  privacy_class: ObsidianPrivacyClass;
}

export const OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT = {
  requiredFields: OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
  canonicalStatuses: OBSIDIAN_CANONICAL_STATUSES,
  retrievalStatuses: OBSIDIAN_RETRIEVAL_STATUSES,
  privacyClasses: OBSIDIAN_PRIVACY_CLASSES,
  defaultsByRouteKey: {
    atlas: {
      canonical_status: "draft",
      retrieval_status: "inactive",
      privacy_class: "internal",
    },
    projects: {
      canonical_status: "draft",
      retrieval_status: "needs_validation",
      privacy_class: "internal",
    },
    knowledge: {
      canonical_status: "draft",
      retrieval_status: "needs_validation",
      privacy_class: "internal",
    },
    media: {
      canonical_status: "draft",
      retrieval_status: "inactive",
      privacy_class: "internal",
    },
    templates: {
      canonical_status: "draft",
      retrieval_status: "inactive",
      privacy_class: "internal",
    },
    archive: {
      canonical_status: "archived",
      retrieval_status: "archive_only",
      privacy_class: "internal",
    },
  } satisfies Record<
    ObsidianKnowledgeRoute["key"],
    Pick<
      ObsidianRetrievalMetadataTemplate,
      "canonical_status" | "retrieval_status" | "privacy_class"
    >
  >,
  rules: [
    "Normal retrieval requires canonical_status=current.",
    "Normal retrieval requires retrieval_status=active.",
    "Normal retrieval requires a non-empty llm_summary.",
    "Normal retrieval allows only public or internal privacy classes.",
    "Archive route notes stay archive_only unless the user asks for history.",
    "Raven private data never enters this contract.",
  ],
} as const;

export const OBSIDIAN_RAG_READY_CRITERIA = {
  canonicalStatus: "current",
  retrievalStatus: "active",
  requiredSummary: true,
  allowedPrivacyClasses: ["public", "internal"] as const,
  excludedRouteDefaults: ["archive_only", "exclude"] as const,
} as const;

export function createObsidianRetrievalMetadataTemplate(
  overrides: Partial<ObsidianRetrievalMetadataTemplate> = {},
): ObsidianRetrievalMetadataTemplate {
  return {
    canonical_status: "draft",
    retrieval_status: "needs_validation",
    llm_summary: "",
    source_ids: [],
    related_notes: [],
    privacy_class: "internal",
    ...overrides,
  };
}

export function isRagReadyObsidianMetadata(
  metadata: ObsidianRetrievalMetadataTemplate,
  route: ObsidianKnowledgeRoute,
): boolean {
  if (
    (OBSIDIAN_RAG_READY_CRITERIA.excludedRouteDefaults as readonly ObsidianRetrievalDefault[])
      .includes(route.retrievalDefault)
  ) {
    return false;
  }
  return (
    metadata.canonical_status === OBSIDIAN_RAG_READY_CRITERIA.canonicalStatus &&
    metadata.retrieval_status === OBSIDIAN_RAG_READY_CRITERIA.retrievalStatus &&
    metadata.llm_summary.trim().length > 0 &&
    (OBSIDIAN_RAG_READY_CRITERIA.allowedPrivacyClasses as readonly ObsidianPrivacyClass[])
      .includes(metadata.privacy_class)
  );
}

export const GITHUB_PROJECT_BRIDGE_PATH = "10_Projects/<Project>/<Project>.md";
export const GITHUB_REPOSITORY_SOURCE_PATH =
  "20_Knowledge/Sources/GitHub/<Project> Repository Source.md";
export const GITHUB_PROJECT_MAP_PATH = "00_Atlas/GitHub Project Map.md";
export const GITHUB_SOURCES_INDEX_PATH = "20_Knowledge/Sources/GitHub/GitHub Sources.md";

export const VAULT_TEXT_TARGETS = {
  source_note: "02_Sources/notes",
  creative_prompt: "04_Creative/images/prompts",
  reusable_prompt: "08_System/manifests/prompts",
  tool_handoff: "08_System/manifests/tool-handoffs",
  external_model_handoff: "08_System/manifests/external-model-handoffs",
  message_draft: "06_Messages/drafts",
  message_sent: "06_Messages/sent",
  message_follow_up: "06_Messages/follow-ups",
  code_handoff: "05_Code/handoffs",
  qa_report: "05_Code/qa-reports",
  model_test: "08_System/model-tests",
  temp_file: "09_Temp/scratch",
  cleanup_report: "08_System/cleanup-reports",
  session_handoff: "08_System/logs",
} as const;

export type VaultTextKind = keyof typeof VAULT_TEXT_TARGETS;

export function defaultArtifactState(kind: ArtifactKind): ArtifactLifecycleState {
  if (kind === "temp_file" || kind === "render_intermediate") return "temp";
  if (kind === "message_draft" || kind === "source_note") return "review";
  if (kind === "message_sent" || kind === "render_export") return "published";
  return "active";
}

export function defaultRetentionRule(kind: ArtifactKind): RetentionRule {
  if (kind === "temp_file" || kind === "render_intermediate") return "review_after_7_days";
  if (kind.startsWith("creative_")) return "review_after_30_days";
  if (kind === "message_sent" || kind === "cleanup_report") return "keep_forever";
  return "delete_after_approval";
}

export function githubProjectBridgePath(projectName: string): string {
  return GITHUB_PROJECT_BRIDGE_PATH.split("<Project>").join(projectName);
}

export function githubRepositorySourcePath(projectName: string): string {
  return GITHUB_REPOSITORY_SOURCE_PATH.split("<Project>").join(projectName);
}
