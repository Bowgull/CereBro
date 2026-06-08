import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from "electron";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { nativeBrowserPageEventChannel } from "../shared/nativeBrowser";
import { installNativeBrowserAdBlocker } from "./browserAdBlock";
import { installNativeBrowserCommandBridge } from "./browserBridge";
import { createNativeBrowserPageView, layoutNativeBrowserPageView } from "./browserViews";
import { installNativeVpnBridge } from "./vpnBridge";
import type { StartedCereBroServer } from "../server/_core/index";

const electronDirname = __dirname;
const appName = "CereBro";
const appIconPath = join(electronDirname, "../electron/assets/cerebro-app-icon.icns");
const bundledStaticDir = join(electronDirname, "../dist/public");
let embeddedServer: StartedCereBroServer | null = null;

app.setName(appName);

function desktopLog(message: string, error?: unknown) {
  try {
    const logDir = app.getPath("userData");
    mkdirSync(logDir, { recursive: true });
    const detail = error instanceof Error ? `\n${error.stack ?? error.message}` : error == null ? "" : `\n${String(error)}`;
    appendFileSync(join(logDir, "desktop-startup.log"), `[${new Date().toISOString()}] ${message}${detail}\n`);
  } catch {
    // Logging must never block app startup.
  }
}

async function getEmbeddedStartUrl() {
  desktopLog("starting embedded CereBro server");
  process.env.CEREBRO_SERVER_AUTOSTART = "false";
  process.env.CEREBRO_STATIC_DIR = process.env.CEREBRO_STATIC_DIR || bundledStaticDir;
  process.env.NODE_ENV = process.env.NODE_ENV || "production";

  const { startServer } = await import("../server/_core/index");
  embeddedServer = await startServer({ startInboxPoll: true });
  desktopLog(`embedded CereBro server listening at ${embeddedServer.url}`);
  return embeddedServer.url;
}

async function resolveStartUrl() {
  const explicitStartUrl = process.env.ELECTRON_START_URL?.trim();
  if (explicitStartUrl) return explicitStartUrl;
  return getEmbeddedStartUrl();
}

function installApplicationMenu(mainWindow: BrowserWindow) {
  const isMac = process.platform === "darwin";
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: "about" as const },
            {
              label: "Settings",
              accelerator: "CmdOrCtrl+,",
              click: () => mainWindow.webContents.send("cerebro:menu:settings"),
            },
            { type: "separator" as const },
            { role: "quit" as const },
          ],
        }]
      : []),
    {
      label: "File",
      submenu: [
        ...(!isMac
          ? [{
              label: "Settings",
              accelerator: "CmdOrCtrl+,",
              click: () => mainWindow.webContents.send("cerebro:menu:settings"),
            }, { type: "separator" as const }]
          : []),
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: () => mainWindow.webContents.send("cerebro:menu:new-tab"),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createMainWindow() {
  desktopLog("creating main window");
  const mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#020606",
    title: appName,
    icon: appIconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(electronDirname, "preload.cjs"),
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  const pageView = createNativeBrowserPageView(mainWindow, "native_tab_1", (event) => {
    mainWindow.webContents.send(nativeBrowserPageEventChannel, event);
  });
  void installNativeBrowserAdBlocker(pageView.view.webContents.session, desktopLog);
  layoutNativeBrowserPageView(pageView, { x: 0, y: 0, width: 1, height: 1 });
  installNativeBrowserCommandBridge(mainWindow, pageView);
  installNativeVpnBridge();
  installApplicationMenu(mainWindow);
  const startUrl = await resolveStartUrl();
  desktopLog(`loading ${startUrl}`);
  void mainWindow.loadURL(startUrl);

  return mainWindow;
}

function openMainWindow() {
  void createMainWindow().catch((error) => {
    desktopLog("failed to create main window", error);
  });
}

app.whenReady().then(() => {
  openMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) openMainWindow();
  });
});

app.on("before-quit", () => {
  void embeddedServer?.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
