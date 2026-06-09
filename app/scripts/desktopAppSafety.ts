import { execFile, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, rm } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const appPath = process.env.CEREBRO_DESKTOP_APP_PATH ?? "/Applications/CereBro.app";
const backupPath = process.env.CEREBRO_DESKTOP_BACKUP_APP_PATH ?? "/Applications/CereBro-known-good.app";
const releaseAppPath = process.env.CEREBRO_DESKTOP_RELEASE_APP_PATH ?? "release/CereBro-darwin-arm64/CereBro.app";
const appName = process.env.CEREBRO_DESKTOP_APP_NAME ?? "CereBro";
const binaryPath = `${appPath}/Contents/MacOS/CereBro`;

function sleep(ms: number) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function mainProcessPids() {
  try {
    return execFileSync("pgrep", ["-f", binaryPath], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function waitForNoMainProcess(timeoutMs = 8_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (mainProcessPids().length === 0) return;
    await sleep(250);
  }
  throw new Error(`CereBro is still running from ${binaryPath}`);
}

async function quitInstalledApp() {
  await execFileAsync("osascript", ["-e", `quit app "${appName}"`]).catch(() => undefined);
  await waitForNoMainProcess().catch(async () => {
    await execFileAsync("pkill", ["-9", "-f", binaryPath]).catch(() => undefined);
    await execFileAsync("pkill", ["-9", "-f", "CereBro Helper"]).catch(() => undefined);
    await waitForNoMainProcess();
  });
}

async function backupInstalledApp() {
  if (!existsSync(appPath)) {
    throw new Error(`Installed app not found at ${appPath}`);
  }
  await rm(backupPath, { recursive: true, force: true });
  await cp(appPath, backupPath, { recursive: true, preserveTimestamps: true });
  console.log(JSON.stringify({ ok: true, mode: "backup", appPath, backupPath }, null, 2));
}

async function installReleaseApp() {
  if (!existsSync(releaseAppPath)) {
    throw new Error(`Release app not found at ${releaseAppPath}. Run pnpm --dir app run desktop:package first.`);
  }
  if (existsSync(appPath)) {
    await backupInstalledApp();
  }
  await quitInstalledApp();
  await rm(appPath, { recursive: true, force: true });
  await cp(releaseAppPath, appPath, { recursive: true, preserveTimestamps: true });
  await execFileAsync("xattr", ["-dr", "com.apple.quarantine", appPath]).catch(() => undefined);
  await execFileAsync("open", [appPath]);
  console.log(JSON.stringify({ ok: true, mode: "install", appPath, backupPath, releaseAppPath }, null, 2));
}

async function restoreKnownGoodApp() {
  if (!existsSync(backupPath)) {
    throw new Error(`Known-good backup not found at ${backupPath}`);
  }
  await quitInstalledApp();
  await rm(appPath, { recursive: true, force: true });
  await cp(backupPath, appPath, { recursive: true, preserveTimestamps: true });
  await execFileAsync("xattr", ["-dr", "com.apple.quarantine", appPath]).catch(() => undefined);
  await execFileAsync("open", [appPath]);
  console.log(JSON.stringify({ ok: true, mode: "restore", appPath, backupPath }, null, 2));
}

async function run() {
  const mode = process.argv[2];
  if (mode === "backup") {
    await backupInstalledApp();
    return;
  }
  if (mode === "install") {
    await installReleaseApp();
    return;
  }
  if (mode === "restore") {
    await restoreKnownGoodApp();
    return;
  }
  throw new Error("Usage: tsx scripts/desktopAppSafety.ts backup|install|restore");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
