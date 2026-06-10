import fs from "fs/promises";
import path from "path";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";
import { getObsidianStatus, getVaultLayout, getVaultStatus } from "../integrations/vault";
import {
  ARTIFACT_KINDS,
  ARTIFACT_LIFECYCLE_STATES,
  GITHUB_PROJECT_MAP_PATH,
  GITHUB_REPOSITORY_SOURCE_PATH,
  GITHUB_SOURCES_INDEX_PATH,
  OBSIDIAN_KNOWLEDGE_ROUTES,
  OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
  RETENTION_RULES,
  VAULT_LAYOUT,
  VAULT_TEXT_TARGETS,
  githubProjectBridgePath,
  githubRepositorySourcePath,
} from "../knowledge/contracts";

type Severity = "info" | "warning" | "action_required";

interface HygieneFinding {
  id: string;
  severity: Severity;
  area: "vault" | "obsidian" | "repo" | "artifacts";
  title: string;
  detail: string;
  proposedAction: string;
}

async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.stat(target);
    return true;
  } catch {
    return false;
  }
}

async function getArtifactCounts(): Promise<{
  artifacts: number;
  cleanupCandidates: number;
  duplicateStoragePaths: number;
}> {
  const db = await getCerebroDb();
  const [artifacts, cleanupCandidates, duplicateStoragePaths] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) AS count FROM artifacts`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) AS count FROM cleanup_candidates`, args: [] }),
    db.execute({
      sql: `
        SELECT COUNT(*) AS count
        FROM (
          SELECT storage_provider, storage_path
          FROM artifacts
          WHERE lifecycle_state NOT IN ('deleted')
          GROUP BY storage_provider, storage_path
          HAVING COUNT(*) > 1
        )
      `,
      args: [],
    }),
  ]);
  return {
    artifacts: Number(artifacts.rows[0]?.count ?? 0),
    cleanupCandidates: Number(cleanupCandidates.rows[0]?.count ?? 0),
    duplicateStoragePaths: Number(duplicateStoragePaths.rows[0]?.count ?? 0),
  };
}

export const piccoloRouter = router({
  storageContractReceipt: publicProcedure.query(async () => {
    const [vault, obsidian] = await Promise.all([getVaultStatus(), getObsidianStatus()]);
    const archiveRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "archive");

    return {
      mode: "read_only" as const,
      ownerAgent: "piccolo" as const,
      supportAgents: ["oak", "spock"] as const,
      writesExternalSystems: false,
      vault,
      obsidian,
      counts: {
        artifactKinds: ARTIFACT_KINDS.length,
        lifecycleStates: ARTIFACT_LIFECYCLE_STATES.length,
        retentionRules: RETENTION_RULES.length,
        vaultFolders: VAULT_LAYOUT.length,
        obsidianLanes: OBSIDIAN_KNOWLEDGE_ROUTES.length,
        vaultTextTargets: Object.keys(VAULT_TEXT_TARGETS).length,
      },
      rules: [
        "Artifacts need kind, lifecycle state, storage provider, storage path, and retention rule.",
        "Obsidian archive lanes are archive-only for normal RAG.",
        "Project bridge notes are the entry point for active project knowledge.",
        "Real vault, Obsidian, Notion, Slack, Drive, and cleanup writes require approval.",
      ],
      obsidianContract: {
        routes: OBSIDIAN_KNOWLEDGE_ROUTES,
        retrievalMetadataFields: OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
        archiveRoute,
      },
      githubProjectPaths: {
        bridgeExample: githubProjectBridgePath("Sundesk"),
        sourceExample: githubRepositorySourcePath("Sundesk"),
        bridgeTemplate: "10_Projects/<Project>/<Project>.md",
        sourceTemplate: GITHUB_REPOSITORY_SOURCE_PATH,
        mapPath: GITHUB_PROJECT_MAP_PATH,
        sourcesIndexPath: GITHUB_SOURCES_INDEX_PATH,
      },
      nextAction: "Expose this as a Keep receipt before adding any storage automation.",
    };
  }),

  hygieneReport: publicProcedure.query(async () => {
    const [vault, obsidian, counts] = await Promise.all([
      getVaultStatus(),
      getObsidianStatus(),
      getArtifactCounts(),
    ]);
    const findings: HygieneFinding[] = [];
    const layout = getVaultLayout();

    if (!vault.configured) {
      findings.push({
        id: "vault-not-configured",
        severity: "action_required",
        area: "vault",
        title: "Vault root is not configured",
        detail: "CEREBRO_VAULT_DIR is not set, so generated files cannot be routed into the Drive-backed CereBro vault yet.",
        proposedAction: "Choose the CereBro vault folder, then set CEREBRO_VAULT_DIR before enabling generated deliverables.",
      });
    } else if (!vault.exists) {
      findings.push({
        id: "vault-missing",
        severity: "action_required",
        area: "vault",
        title: "Vault root path does not exist",
        detail: `CEREBRO_VAULT_DIR points at ${vault.vaultDir}, but that directory is not present.`,
        proposedAction: "Confirm the Drive folder path or create the folder after user approval.",
      });
    }

    const missingVaultDirs: string[] = [];
    if (vault.exists && vault.vaultDir) {
      for (const entry of layout) {
        const fullPath = path.join(vault.vaultDir, entry.relativePath);
        if (!(await directoryExists(fullPath))) {
          missingVaultDirs.push(entry.relativePath);
        }
      }
      if (missingVaultDirs.length > 0) {
        findings.push({
          id: "vault-layout-missing",
          severity: "warning",
          area: "vault",
          title: "Canonical vault folders are not present yet",
          detail: `${missingVaultDirs.length} expected folder(s) are missing. Nothing was created automatically.`,
          proposedAction: "After user approval, create the canonical Session 3 vault folder tree.",
        });
      }
    }

    if (!obsidian.configured) {
      findings.push({
        id: "obsidian-not-configured",
        severity: "warning",
        area: "obsidian",
        title: "Obsidian vault is not configured",
        detail: "CereBro has no explicit Obsidian path and no configured vault default yet.",
        proposedAction: "During setup, create or choose the Obsidian vault folder under the CereBro vault.",
      });
    } else if (!obsidian.exists) {
      findings.push({
        id: "obsidian-missing",
        severity: "warning",
        area: "obsidian",
        title: "Obsidian vault folder is not present",
        detail: `${obsidian.obsidianDir} is the planned Obsidian path, but it does not exist yet.`,
        proposedAction: "Create or select the Obsidian vault folder after user approval.",
      });
    }

    const repoRoot = path.resolve(process.cwd(), "..");
    const repoRiskPaths = [
      "outputs",
      "renders",
      "exports",
      "generated",
      "models",
      "ComfyUI",
      "app/outputs",
      "app/renders",
      "app/generated",
      "app/models",
    ];
    const existingRepoRiskPaths: string[] = [];
    for (const rel of repoRiskPaths) {
      if (await pathExists(path.join(repoRoot, rel))) existingRepoRiskPaths.push(rel);
    }
    if (existingRepoRiskPaths.length > 0) {
      findings.push({
        id: "repo-pollution-candidates",
        severity: "warning",
        area: "repo",
        title: "Generated-file folders may be inside the repo",
        detail: `Found: ${existingRepoRiskPaths.join(", ")}.`,
        proposedAction: "Review these paths before adding generated media, renders, models, or client deliverables to the repo.",
      });
    }

    if (counts.artifacts === 0) {
      findings.push({
        id: "artifact-index-empty",
        severity: "info",
        area: "artifacts",
        title: "Artifact index is empty",
        detail: "The lifecycle tables exist, but no artifacts have been recorded yet.",
        proposedAction: "As integrations write files, record artifact metadata for each saved output/source/note/asset.",
      });
    }
    if (counts.duplicateStoragePaths > 0) {
      findings.push({
        id: "duplicate-artifact-storage-paths",
        severity: "info",
        area: "artifacts",
        title: "Artifact history contains repeated storage paths",
        detail: `${counts.duplicateStoragePaths} storage path(s) have multiple artifact rows. This can happen when a file is re-saved and tracked as history.`,
        proposedAction: "Keep the audit trail for now. New saves supersede older active rows; a later cleanup rule can archive old history views.",
      });
    }

    return {
      scannedAt: Math.floor(Date.now() / 1000),
      mode: "read_only",
      vault,
      obsidian,
      expectedVaultFolders: layout,
      missingVaultFolders: missingVaultDirs,
      artifactCounts: counts,
      findings,
    };
  }),
});
