import { describe, expect, it } from "vitest";
import {
  ARTIFACT_KINDS,
  ARTIFACT_LIFECYCLE_STATES,
  GITHUB_PROJECT_MAP_PATH,
  GITHUB_REPOSITORY_SOURCE_PATH,
  GITHUB_SOURCES_INDEX_PATH,
  OBSIDIAN_CANONICAL_STATUSES,
  OBSIDIAN_KNOWLEDGE_ROUTES,
  OBSIDIAN_PRIVACY_CLASSES,
  OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT,
  OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
  OBSIDIAN_RETRIEVAL_STATUSES,
  RETENTION_RULES,
  VAULT_LAYOUT,
  VAULT_TEXT_TARGETS,
  createObsidianRetrievalMetadataTemplate,
  defaultArtifactState,
  defaultRetentionRule,
  githubProjectBridgePath,
  githubRepositorySourcePath,
  isRagReadyObsidianMetadata,
} from "./contracts";

describe("knowledge contracts", () => {
  it("keeps artifact kinds, states, and retention rules centralized", () => {
    expect(ARTIFACT_KINDS).toContain("session_handoff");
    expect(ARTIFACT_KINDS).toContain("creative_video");
    expect(ARTIFACT_KINDS).toContain("cleanup_report");
    expect(ARTIFACT_LIFECYCLE_STATES).toContain("trash_staged");
    expect(RETENTION_RULES).toContain("archive_when_superseded");
  });

  it("keeps default lifecycle and retention behavior visible", () => {
    expect(defaultArtifactState("source_note")).toBe("review");
    expect(defaultArtifactState("render_intermediate")).toBe("temp");
    expect(defaultArtifactState("render_export")).toBe("published");
    expect(defaultRetentionRule("creative_image")).toBe("review_after_30_days");
    expect(defaultRetentionRule("temp_file")).toBe("review_after_7_days");
    expect(defaultRetentionRule("message_sent")).toBe("keep_forever");
  });

  it("routes Obsidian archive history outside normal retrieval", () => {
    const archive = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "archive");
    expect(archive?.relativePath).toBe("90_Archive");
    expect(archive?.retrievalDefault).toBe("archive_only");
    expect(OBSIDIAN_RETRIEVAL_METADATA_FIELDS).toEqual([
      "canonical_status",
      "retrieval_status",
      "llm_summary",
      "source_ids",
      "related_notes",
      "privacy_class",
    ]);
  });

  it("pins the RAG-ready note metadata contract before retrieval automation", () => {
    expect(OBSIDIAN_CANONICAL_STATUSES).toEqual(["draft", "current", "superseded", "archived"]);
    expect(OBSIDIAN_RETRIEVAL_STATUSES).toEqual(["inactive", "needs_validation", "active", "archive_only"]);
    expect(OBSIDIAN_PRIVACY_CLASSES).toEqual(["public", "internal", "private", "restricted"]);
    expect(OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT.requiredFields).toEqual(
      OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
    );
    expect(OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT.defaultsByRouteKey.knowledge).toMatchObject({
      canonical_status: "draft",
      retrieval_status: "needs_validation",
      privacy_class: "internal",
    });
    expect(OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT.defaultsByRouteKey.projects).toMatchObject({
      canonical_status: "draft",
      retrieval_status: "needs_validation",
    });
    expect(OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT.defaultsByRouteKey.archive).toMatchObject({
      canonical_status: "archived",
      retrieval_status: "archive_only",
    });
    expect(OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT.rules.join(" ")).toContain("Raven private data never enters");
  });

  it("classifies RAG-ready metadata without scanning or writing notes", () => {
    const knowledgeRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "knowledge");
    const archiveRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "archive");
    expect(knowledgeRoute).toBeDefined();
    expect(archiveRoute).toBeDefined();

    const ready = createObsidianRetrievalMetadataTemplate({
      canonical_status: "current",
      retrieval_status: "active",
      llm_summary: "Current validated source summary.",
      source_ids: ["source:1"],
      privacy_class: "internal",
    });
    expect(isRagReadyObsidianMetadata(ready, knowledgeRoute!)).toBe(true);
    expect(isRagReadyObsidianMetadata(ready, archiveRoute!)).toBe(false);
    expect(isRagReadyObsidianMetadata({ ...ready, llm_summary: "" }, knowledgeRoute!)).toBe(false);
    expect(isRagReadyObsidianMetadata({ ...ready, privacy_class: "private" }, knowledgeRoute!)).toBe(false);
  });

  it("pins the Drive vault and GitHub project bridge paths", () => {
    expect(VAULT_LAYOUT.map((entry) => entry.relativePath)).toContain("07_Knowledge/obsidian-vault");
    expect(VAULT_TEXT_TARGETS.session_handoff).toBe("08_System/logs");
    expect(githubProjectBridgePath("Sundesk")).toBe("10_Projects/Sundesk/Sundesk.md");
    expect(githubRepositorySourcePath("Sundesk")).toBe(
      "20_Knowledge/Sources/GitHub/Sundesk Repository Source.md",
    );
    expect(GITHUB_PROJECT_MAP_PATH).toBe("00_Atlas/GitHub Project Map.md");
    expect(GITHUB_REPOSITORY_SOURCE_PATH).toContain("<Project>");
    expect(GITHUB_SOURCES_INDEX_PATH).toBe("20_Knowledge/Sources/GitHub/GitHub Sources.md");
  });
});
