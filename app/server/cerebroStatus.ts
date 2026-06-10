import { createClient } from "@libsql/client";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_ROUTING } from "./agentRouter";

const moduleDir = dirname(fileURLToPath(import.meta.url));
export const appRoot = resolve(moduleDir, "..");
export const repoRoot = resolve(appRoot, "..");

type BrowserFeature = {
  id: string;
  label: string;
  status: "present" | "missing" | "partial";
  proof: string;
};

type GitStatus = {
  branch: string;
  shortStatus: string[];
};

function readText(relativePath: string) {
  const absolutePath = resolve(appRoot, relativePath);
  if (!existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}

function fileExists(relativePath: string) {
  return existsSync(resolve(appRoot, relativePath));
}

function packageJson() {
  return JSON.parse(readText("package.json")) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

function gitStatus(): GitStatus {
  try {
    const branch = execFileSync("git", ["branch", "--show-current"], { cwd: repoRoot, encoding: "utf8" }).trim() || "detached";
    const shortStatus = execFileSync("git", ["status", "--short"], { cwd: repoRoot, encoding: "utf8" })
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);
    return { branch, shortStatus };
  } catch {
    return { branch: "unknown", shortStatus: [] };
  }
}

function feature(id: string, label: string, ok: boolean, proof: string): BrowserFeature {
  return { id, label, status: ok ? "present" : "missing", proof };
}

export function browserStatus() {
  const pkg = packageJson();
  const browserPanel = readText("client/src/components/BrowserPanel.tsx");
  const nativeBrowser = readText("shared/nativeBrowser.ts");
  const browserViews = readText("electron/browserViews.ts");
  const browserDownloadPolicy = readText("electron/browserDownloadPolicy.ts");
  const browserAdBlock = readText("electron/browserAdBlock.ts");
  const browserBridge = readText("electron/browserBridge.ts");
  const workbenchRouter = readText("server/routers/workbench.ts");

  const features: BrowserFeature[] = [
    feature("native_page_view", "Native Electron page view", browserViews.includes("WebContentsView"), "electron/browserViews.ts"),
    feature("tabs", "Tabs", browserPanel.includes("Browser page tabs") && workbenchRouter.includes("browser_tab_sessions"), "BrowserPanel + browser_tab_sessions"),
    feature("omnibox", "Omnibox URL/search", browserPanel.includes("Browser address and search field"), "BrowserPanel address field"),
    feature("history", "Local history", workbenchRouter.includes("browser_tab_history_items"), "browser_tab_history_items"),
    feature("bookmarks", "Bookmarks rename/delete", browserPanel.includes("Rename bookmark") && workbenchRouter.includes("browser_bookmarks"), "BrowserPanel + browser_bookmarks"),
    feature("downloads", "Download policy", browserDownloadPolicy.includes("classifyNativeBrowserDownload"), "electron/browserDownloadPolicy.ts"),
    feature("popup_blocking", "Popup blocking", browserViews.includes("setWindowOpenHandler") && browserPanel.includes("Allow popups here"), "popup handler + per-site UI"),
    feature("ad_blocking", "Ad blocking", browserAdBlock.includes("ElectronBlocker.fromPrebuiltAdsAndTracking"), "Ghostery Electron blocker"),
    feature("site_settings", "Per-site settings", nativeBrowser.includes("nativeBrowserSiteSettingsChannel"), "shared/nativeBrowser.ts"),
    feature("vpn_shield", "VPN shield", browserPanel.includes("VPN Shield") && fileExists("electron/vpnBridge.ts"), "BrowserPanel + vpnBridge"),
    feature("password_manager_state", "Password manager state", browserPanel.includes("Password Manager: Not set up"), "BrowserPanel honest state"),
    feature("playwright", "Playwright browser proof", Boolean(pkg.devDependencies?.["@playwright/test"]) && fileExists("playwright.config.ts"), "Playwright config and dependency"),
    feature(
      "installed_desktop_qa",
      "Installed app desktop QA",
      Boolean(pkg.scripts?.["test:desktop"]) && fileExists("scripts/desktopInstalledSmoke.ts"),
      "test:desktop installed app smoke",
    ),
  ];

  return {
    lane: "daily_browser",
    summary: "CereBro Browser is the active build lane. System Browser is fallback only.",
    features,
    testCommands: [
      "pnpm --dir app run check",
      "pnpm --dir app run test:desktop",
      "pnpm --dir app run test:e2e",
      "pnpm --dir app exec vitest run server/browserNativeBridgeSurface.test.ts server/nativeBrowserContract.test.ts server/nativeBrowserCommandBridge.test.ts server/nativeBrowserDownloadPolicy.test.ts server/workbenchBrowserModel.test.ts",
    ],
  };
}

export function agentStatus() {
  return AGENT_ROUTING.map((agent) => ({
    id: agent.id,
    name: agent.name,
    chamber: agent.chamber,
    floor: agent.floor,
    role: agent.role,
    defaultModelClass: agent.defaultModelClass,
    escalationModelClass: agent.escalationModelClass ?? null,
    toolScope: agent.toolScope,
  }));
}

export function modelStatus() {
  const byClass = new Map<string, string[]>();
  for (const agent of AGENT_ROUTING) {
    const list = byClass.get(agent.defaultModelClass) ?? [];
    list.push(agent.id);
    byClass.set(agent.defaultModelClass, list);
    if (agent.escalationModelClass) {
      const escalationList = byClass.get(agent.escalationModelClass) ?? [];
      escalationList.push(`${agent.id}:escalation`);
      byClass.set(agent.escalationModelClass, escalationList);
    }
  }
  return Array.from(byClass.entries()).map(([modelClass, agents]) => ({ modelClass, agents }));
}

function configuredDbUrl() {
  return process.env.CEREBRO_DB_URL ?? "file:./cerebro.db";
}

function defaultDbPath() {
  const configured = configuredDbUrl();
  if (!configured.startsWith("file:")) return null;
  const filePath = configured.slice("file:".length);
  return resolve(appRoot, filePath);
}

export async function pendingApprovalsStatus() {
  const dbUrl = configuredDbUrl();
  const dbPath = defaultDbPath();
  if (dbPath && !existsSync(dbPath)) {
    return { available: false, count: 0, rows: [], reason: `Database not found at ${dbPath}` };
  }

  try {
    const db = createClient(process.env.CEREBRO_DB_AUTH_TOKEN ? { url: dbUrl, authToken: process.env.CEREBRO_DB_AUTH_TOKEN } : { url: dbUrl });
    const result = await db.execute({
      sql: `SELECT id, action_type, target_type, requested_by_agent, reason, created_at
            FROM approvals
            WHERE status = 'pending'
            ORDER BY created_at DESC
            LIMIT 10`,
      args: [],
    });
    return {
      available: true,
      count: result.rows.length,
      rows: result.rows.map((row) => ({
        id: Number(row.id),
        actionType: String(row.action_type),
        targetType: row.target_type == null ? null : String(row.target_type),
        requestedByAgent: row.requested_by_agent == null ? null : String(row.requested_by_agent),
        reason: row.reason == null ? null : String(row.reason),
        createdAt: Number(row.created_at),
      })),
      reason: null,
    };
  } catch (error) {
    return {
      available: false,
      count: 0,
      rows: [],
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function handoffStatus() {
  const candidates = [
    "CEREBRO_SESSION_HANDOFF.md",
    "CEREBRO_AGENT_HARNESS_MODEL_STORAGE_HANDOFF.md",
    "CEREBRO_SSD_RECOVERY_STATUS.md",
    "CEREBRO_STORAGE_TOPOLOGY.md",
    "CEREBRO_BUILD_QUEUE.md",
  ];

  return candidates
    .map((relativePath) => {
      const absolutePath = resolve(repoRoot, relativePath);
      if (!existsSync(absolutePath)) return null;
      const stats = statSync(absolutePath);
      return {
        path: relativePath,
        bytes: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);
}

export async function cerebroStatus() {
  const pkg = packageJson();
  const git = gitStatus();
  return {
    app: "CereBro",
    cwd: repoRoot,
    branch: git.branch,
    dirtyFiles: git.shortStatus.length,
    scripts: {
      check: pkg.scripts?.check ?? null,
      test: pkg.scripts?.test ?? null,
      desktop: pkg.scripts?.["test:desktop"] ?? null,
      e2e: pkg.scripts?.["test:e2e"] ?? null,
      cli: pkg.scripts?.cerebro ?? null,
      mcp: pkg.scripts?.mcp ?? null,
    },
    browser: browserStatus(),
    agents: agentStatus().map(({ id, name, chamber, defaultModelClass }) => ({ id, name, chamber, defaultModelClass })),
    models: modelStatus(),
    approvals: await pendingApprovalsStatus(),
    handoffs: handoffStatus(),
  };
}
