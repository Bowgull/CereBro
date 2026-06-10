import { execFile, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const appPath = process.env.CEREBRO_DESKTOP_APP_PATH ?? "/Applications/CereBro.app";
const backupPath = process.env.CEREBRO_DESKTOP_BACKUP_APP_PATH ?? "/Applications/CereBro-known-good.app";
const rollbackPath = process.env.CEREBRO_DESKTOP_ROLLBACK_APP_PATH ?? "/Applications/CereBro-install-rollback.app";
const stagingAppPath = process.env.CEREBRO_DESKTOP_STAGING_APP_PATH ?? "/Applications/CereBro-QA.app";
const releaseAppPath = process.env.CEREBRO_DESKTOP_RELEASE_APP_PATH ?? "release/CereBro-darwin-arm64/CereBro.app";
const appName = process.env.CEREBRO_DESKTOP_APP_NAME ?? "CereBro";
const binaryPath = `${appPath}/Contents/MacOS/CereBro`;
const appRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

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
  await copyAppBundle(appPath, backupPath);
  console.log(JSON.stringify({ ok: true, mode: "backup", appPath, backupPath }, null, 2));
}

async function copyAppBundle(sourcePath: string, targetPath: string) {
  await execFileAsync("ditto", [sourcePath, targetPath]);
}

async function prepareRollbackApp() {
  if (!existsSync(appPath)) {
    throw new Error(`Installed app not found at ${appPath}`);
  }
  await rm(rollbackPath, { recursive: true, force: true });
  await copyAppBundle(appPath, rollbackPath);
  validateAppBundle(rollbackPath);
  console.log(JSON.stringify({ ok: true, mode: "rollback-backup", appPath, rollbackPath }, null, 2));
}

function validateAppBundle(targetAppPath: string) {
  const requiredPaths = [
    `${targetAppPath}/Contents/Info.plist`,
    `${targetAppPath}/Contents/MacOS/CereBro`,
    `${targetAppPath}/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/icudtl.dat`,
    `${targetAppPath}/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework`,
    `${targetAppPath}/Contents/Resources/app/dist/index.js`,
    `${targetAppPath}/Contents/Resources/app/dist/public/index.html`,
  ];
  const missing = requiredPaths.filter((requiredPath) => !existsSync(requiredPath));
  if (missing.length > 0) {
    throw new Error(`App bundle is missing required files: ${missing.join(", ")}`);
  }
}

async function copyReleaseToStaging() {
  if (!existsSync(releaseAppPath)) {
    throw new Error(`Release app not found at ${releaseAppPath}. Run pnpm --dir app run desktop:package first.`);
  }
  validateAppBundle(releaseAppPath);
  await execFileAsync("pkill", ["-f", `${stagingAppPath}/Contents/MacOS/CereBro`]).catch(() => undefined);
  await rm(stagingAppPath, { recursive: true, force: true });
  await copyAppBundle(releaseAppPath, stagingAppPath);
  await execFileAsync("xattr", ["-dr", "com.apple.quarantine", stagingAppPath]).catch(() => undefined);
  validateAppBundle(stagingAppPath);
  console.log(JSON.stringify({ ok: true, mode: "stage", stagingAppPath, releaseAppPath }, null, 2));
}

async function smokeApp(targetAppPath: string, port: string, mode: "launch" | "browser") {
  const { stdout, stderr } = await execFileAsync(
    "pnpm",
    ["exec", "tsx", "scripts/desktopInstalledSmoke.ts"],
    {
      cwd: appRoot,
      env: {
        ...process.env,
        CEREBRO_DESKTOP_APP_PATH: targetAppPath,
        CEREBRO_DESKTOP_QA_CLOSE_EXISTING: "1",
        CEREBRO_DESKTOP_QA_REOPEN_EXISTING: "0",
        CEREBRO_DESKTOP_QA_PORT: port,
        CEREBRO_DESKTOP_QA_MODE: mode,
      },
      maxBuffer: 1024 * 1024 * 20,
    },
  );
  if (stdout.trim()) process.stdout.write(stdout);
  if (stderr.trim()) process.stderr.write(stderr);
  const requiredProof = mode === "launch" ? "\"launchProof\"" : "\"menuLayerProof\"";
  if (!stdout.includes("\"proof\"") || !stdout.includes(requiredProof) || stdout.includes("\"ok\": false")) {
    throw new Error(`Desktop smoke did not produce clean proof output for ${targetAppPath}.`);
  }
}

async function smokeStagingApp() {
  await copyReleaseToStaging();
  console.log(JSON.stringify({ ok: true, mode: "stage-smoke-ready", stagingAppPath }, null, 2));
}

async function installReleaseApp() {
  await copyReleaseToStaging();
  let backupReady = false;
  if (existsSync(appPath)) {
    await prepareRollbackApp();
    backupReady = true;
  }
  try {
    await quitInstalledApp();
    await rm(appPath, { recursive: true, force: true });
    await copyAppBundle(stagingAppPath, appPath);
    await execFileAsync("xattr", ["-dr", "com.apple.quarantine", appPath]).catch(() => undefined);
    validateAppBundle(appPath);
    await smokeApp(appPath, "9333", "launch");
    await waitForNoMainProcess().catch(() => undefined);
    await sleep(1_000);
    await execFileAsync("open", ["-F", "-n", appPath]);
    const relaunched = await waitForStableProcess();
    if (!relaunched) throw new Error(`CereBro did not relaunch from ${appPath} after install.`);
    console.log(JSON.stringify({ ok: true, mode: "install", appPath, backupPath, releaseAppPath, stagingAppPath }, null, 2));
  } catch (error) {
    if (backupReady) {
      await quitInstalledApp().catch(() => undefined);
      await rm(appPath, { recursive: true, force: true });
      await copyAppBundle(rollbackPath, appPath);
      await execFileAsync("xattr", ["-dr", "com.apple.quarantine", appPath]).catch(() => undefined);
      await execFileAsync("open", ["-n", appPath]).catch(() => undefined);
      console.log(JSON.stringify({ ok: true, mode: "restore-after-failed-install", appPath, rollbackPath }, null, 2));
    }
    throw error;
  }
}

async function waitForStableProcess(timeoutMs = 10_000, stableMs = 4_000) {
  const deadline = Date.now() + timeoutMs;
  let stableSince: number | null = null;
  while (Date.now() < deadline) {
    if (mainProcessPids().length > 0) {
      stableSince ??= Date.now();
      if (Date.now() - stableSince >= stableMs) return true;
    } else {
      stableSince = null;
    }
    await sleep(250);
  }
  return false;
}

async function restoreKnownGoodApp() {
  if (!existsSync(backupPath)) {
    throw new Error(`Known-good backup not found at ${backupPath}`);
  }
  await quitInstalledApp();
  await rm(appPath, { recursive: true, force: true });
  await copyAppBundle(backupPath, appPath);
  await execFileAsync("xattr", ["-dr", "com.apple.quarantine", appPath]).catch(() => undefined);
  await execFileAsync("open", ["-n", appPath]);
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
  if (mode === "stage") {
    await copyReleaseToStaging();
    return;
  }
  if (mode === "stage-smoke") {
    await smokeStagingApp();
    return;
  }
  if (mode === "restore") {
    await restoreKnownGoodApp();
    return;
  }
  throw new Error("Usage: tsx scripts/desktopAppSafety.ts backup|stage|stage-smoke|install|restore");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
