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
import {
  OBSIDIAN_KNOWLEDGE_ROUTES,
  VAULT_LAYOUT,
  type ObsidianKnowledgeRoute,
  type VaultLayoutEntry,
} from "../knowledge/contracts";

export { OBSIDIAN_RETRIEVAL_METADATA_FIELDS } from "../knowledge/contracts";

export interface VaultStatus {
  configured: boolean;
  vaultDir: string | null;
  exists: boolean;
}

export interface ObsidianStatus {
  configured: boolean;
  obsidianDir: string | null;
  exists: boolean;
  source: "env" | "vault-default" | "none";
}

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
