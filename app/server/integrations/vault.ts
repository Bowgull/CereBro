/**
 * Drive vault adapter.
 *
 * V1 strategy: Google Drive *synced folder*. We read and write a regular
 * filesystem path; Drive's desktop client handles the sync. No OAuth in V1.
 *
 * CEREBRO_VAULT_DIR env points at the synced folder. If unset the vault is
 * disabled and writes are skipped (read returns []).
 *
 * Layout under the vault root:
 *   vault/
 *     outputs/<session_id>/<output_id>-<slug>.{txt,md}
 *     sources/<source_id>-<slug>.{md,html}
 *     memory/<yyyy-mm-dd>.md
 */
import fs from "fs/promises";
import path from "path";

export interface VaultStatus {
  configured: boolean;
  vaultDir: string | null;
  exists: boolean;
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

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
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
