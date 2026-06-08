import { app, type Session } from "electron";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ElectronBlocker } from "@ghostery/adblocker-electron";

type NativeBrowserAdBlockEngine = ElectronBlocker;

let blocker: NativeBrowserAdBlockEngine | null = null;
let engineState: "starting" | "ghostery" | "unavailable" = "starting";
let blockingEnabled = true;

export function nativeBrowserAdBlockEngineState() {
  return engineState;
}

export function setNativeBrowserAdBlockingEnabled(browserSession: Session, enabled: boolean) {
  blockingEnabled = enabled;
  if (!blocker) return;
  if (enabled) {
    blocker.enableBlockingInSession(browserSession);
    return;
  }
  blocker.disableBlockingInSession(browserSession);
}

export async function installNativeBrowserAdBlocker(browserSession: Session, log: (message: string, error?: unknown) => void = () => {}) {
  try {
    const cacheDir = join(app.getPath("userData"), "browser");
    mkdirSync(cacheDir, { recursive: true });
    blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
      path: join(cacheDir, "ghostery-engine.bin"),
      read: (path) => import("node:fs/promises").then((fs) => fs.readFile(path)),
      write: (path, data) => import("node:fs/promises").then((fs) => fs.writeFile(path, data)),
    }) as ElectronBlocker;
    engineState = "ghostery";
    setNativeBrowserAdBlockingEnabled(browserSession, blockingEnabled);
    log("native browser ad blocking ready");
  } catch (error) {
    engineState = "unavailable";
    log("native browser ad blocking unavailable", error);
  }
}
