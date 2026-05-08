/**
 * Drive vault adapter.
 *
 * V1 strategy: Google Drive *synced folder*. We read and write a regular
 * filesystem path; Drive's desktop client handles the sync. No OAuth in V1.
 *
 * CEREBRO_VAULT_DIR env points at the synced folder. If unset the vault is
 * disabled and writes are skipped (read returns []).
 *
 * The canonical Session 3 layout is exposed by getVaultLayout(). The current
 * legacy output writer still writes approved outputs to outputs/<session_id>
 * until all write surfaces move to the lifecycle layout.
 */
import fs from "fs/promises";
import path from "path";

export interface VaultStatus {
  configured: boolean;
  vaultDir: string | null;
  exists: boolean;
}

export interface VaultLayoutEntry {
  key: string;
  relativePath: string;
  purpose: string;
}

export interface ObsidianStatus {
  configured: boolean;
  obsidianDir: string | null;
  exists: boolean;
  source: "env" | "vault-default" | "none";
}

export interface ObsidianKnowledgeRoute {
  key: string;
  relativePath: string;
  purpose: string;
  retrievalDefault: "include_index" | "include_when_validated" | "archive_only" | "exclude";
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

export async function getVaultStatus(): Promise<VaultStatus> {
  const vaultDir = process.env.CEREBRO_VAULT_DIR ?? null;
  if (!vaultDir) return { configured: false, vaultDir: null, exists: false };
  let exists = false;
  try {
    const stat = await fs.stat(vaultDir);
    exists = stat.isDirectory();
  } catch {}
  return { configured: true, vaultDir, exists };
}

export function isConfigured(): boolean {
  return Boolean(process.env.CEREBRO_VAULT_DIR);
}

export function getVaultLayout(): VaultLayoutEntry[] {
  return VAULT_LAYOUT;
}

export function getObsidianKnowledgeRoutes(): ObsidianKnowledgeRoute[] {
  return OBSIDIAN_KNOWLEDGE_ROUTES;
}

function sanitizeObsidianSubdir(subdir?: string): string | null {
  if (!subdir?.trim()) return null;
  const parts = subdir
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const safeParts = parts.map((part) =>
    part
      .replace(/^\.+$/, "")
      .replace(/[^A-Za-z0-9 _.-]+/g, "-")
      .replace(/^\.+/, "")
      .replace(/\.+$/, ""),
  ).filter(Boolean);
  if (safeParts.length === 0) return null;
  return safeParts.join("/");
}

export async function getObsidianStatus(): Promise<ObsidianStatus> {
  const explicitDir = process.env.CEREBRO_OBSIDIAN_DIR ?? null;
  const vault = await getVaultStatus();
  const obsidianDir =
    explicitDir ??
    (vault.configured && vault.vaultDir
      ? path.join(vault.vaultDir, "07_Knowledge", "obsidian-vault")
      : null);

  if (!obsidianDir) {
    return { configured: false, obsidianDir: null, exists: false, source: "none" };
  }

  let exists = false;
  try {
    const stat = await fs.stat(obsidianDir);
    exists = stat.isDirectory();
  } catch {}

  return {
    configured: Boolean(explicitDir || vault.configured),
    obsidianDir,
    exists,
    source: explicitDir ? "env" : "vault-default",
  };
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function timestampSlug(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

async function versionedPath(dir: string, baseSlug: string, ext: string) {
  const cleanExt = ext.replace(/^\./, "") || "md";
  const first = path.join(dir, `${baseSlug || "untitled"}.${cleanExt}`);
  try {
    await fs.access(first);
  } catch {
    return first;
  }

  const stamped = path.join(dir, `${baseSlug || "untitled"}-${timestampSlug()}.${cleanExt}`);
  try {
    await fs.access(stamped);
  } catch {
    return stamped;
  }

  for (let i = 2; i < 1000; i += 1) {
    const candidate = path.join(dir, `${baseSlug || "untitled"}-${timestampSlug()}-${i}.${cleanExt}`);
    try {
      await fs.access(candidate);
    } catch {
      return candidate;
    }
  }
  throw new Error(`Could not create unique filename in ${dir}`);
}

export async function writeOutput(args: {
  outputId: number;
  sessionClaudeId: string | null;
  title: string | null;
  body: string;
  ext: string;
}): Promise<{ ok: boolean; relativePath?: string; reason?: string }> {
  const status = await getVaultStatus();
  if (!status.configured || !status.vaultDir) {
    return { ok: false, reason: "CEREBRO_VAULT_DIR not set" };
  }
  if (!status.exists) {
    return { ok: false, reason: `Vault dir does not exist: ${status.vaultDir}` };
  }
  const sessionDir = args.sessionClaudeId ?? "no-session";
  const dir = path.join(status.vaultDir, "outputs", sessionDir);
  await fs.mkdir(dir, { recursive: true });
  const titleSlug = slug(args.title ?? `output-${args.outputId}`);
  const filename = `${args.outputId}-${titleSlug}.${args.ext.replace(/^\./, "") || "txt"}`;
  const full = path.join(dir, filename);
  await fs.writeFile(full, args.body, "utf8");
  return { ok: true, relativePath: path.relative(status.vaultDir, full) };
}

export async function writeObsidianNote(args: {
  title: string;
  body: string;
  subdir?: string;
}): Promise<{ ok: boolean; relativePath?: string; fullPath?: string; reason?: string }> {
  const status = await getObsidianStatus();
  if (!status.configured || !status.obsidianDir) {
    return { ok: false, reason: "Obsidian vault not configured" };
  }
  if (!status.exists) {
    return { ok: false, reason: `Obsidian vault dir does not exist: ${status.obsidianDir}` };
  }

  const safeSubdir = sanitizeObsidianSubdir(args.subdir) ?? "20_Knowledge/Capture";
  const dir = safeSubdir ? path.join(status.obsidianDir, safeSubdir) : status.obsidianDir;
  await fs.mkdir(dir, { recursive: true });

  const fullPath = await versionedPath(dir, slug(args.title), "md");
  await fs.writeFile(fullPath, args.body, "utf8");
  return {
    ok: true,
    fullPath,
    relativePath: path.relative(status.obsidianDir, fullPath),
  };
}

export async function writeVaultTextArtifact(args: {
  relativeDir: string;
  title: string;
  body: string;
  ext?: string;
}): Promise<{ ok: boolean; relativePath?: string; fullPath?: string; reason?: string }> {
  const status = await getVaultStatus();
  if (!status.configured || !status.vaultDir) {
    return { ok: false, reason: "CEREBRO_VAULT_DIR not set" };
  }
  if (!status.exists) {
    return { ok: false, reason: `Vault dir does not exist: ${status.vaultDir}` };
  }

  const safeDir = args.relativeDir
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
  if (!safeDir) return { ok: false, reason: "relativeDir resolved to empty path" };

  const ext = (args.ext ?? "md").replace(/^\./, "") || "md";
  const dir = path.join(status.vaultDir, safeDir);
  await fs.mkdir(dir, { recursive: true });
  const fullPath = await versionedPath(dir, slug(args.title), ext);
  await fs.writeFile(fullPath, args.body, "utf8");
  return {
    ok: true,
    fullPath,
    relativePath: path.relative(status.vaultDir, fullPath),
  };
}
