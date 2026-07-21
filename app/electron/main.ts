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
const mainWindowTitle = "CereBro Browser";
const appIconPath = join(electronDirname, "../electron/assets/cerebro-app-icon.icns");
const bundledStaticDir = join(electronDirname, "../dist/public");
let embeddedServer: StartedCereBroServer | null = null;
let mainWindowRef: BrowserWindow | null = null;

function installBrokenPipeGuard() {
  const ignoreBrokenPipe = (error: NodeJS.ErrnoException) => {
    if (error.code !== "EPIPE") throw error;
  };

  process.stdout.on("error", ignoreBrokenPipe);
  process.stderr.on("error", ignoreBrokenPipe);
}

installBrokenPipeGuard();
app.setName(appName);

const disablePreload = process.env.CEREBRO_DISABLE_PRELOAD === "1";
const disableNativeBrowser = process.env.CEREBRO_DISABLE_NATIVE_BROWSER === "1";
const disableAdBlock = process.env.CEREBRO_DISABLE_ADBLOCK === "1";

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
    title: mainWindowTitle,
    icon: appIconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      ...(disablePreload ? {} : { preload: join(electronDirname, "preload.cjs") }),
      sandbox: true,
    },
  });
  mainWindowRef = mainWindow;
  mainWindow.on("close", () => desktopLog("main window close requested"));
  mainWindow.on("closed", () => {
    desktopLog("main window closed");
    if (mainWindowRef === mainWindow) mainWindowRef = null;
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    desktopLog(`renderer gone: ${details.reason} ${details.exitCode}`);
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    desktopLog(`main window failed load ${validatedURL}: ${errorCode} ${errorDescription}`);
  });
  mainWindow.webContents.on("did-finish-load", () => {
    desktopLog(`main window finished load ${mainWindow.webContents.getURL()}`);
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  if (!disableNativeBrowser) {
    const pageView = createNativeBrowserPageView(mainWindow, "native_tab_1", (event) => {
      mainWindow.webContents.send(nativeBrowserPageEventChannel, event);
    });
    layoutNativeBrowserPageView(pageView, { x: 0, y: 0, width: 1, height: 1 });
    installNativeBrowserCommandBridge(mainWindow, pageView);
    if (!disableAdBlock) {
      mainWindow.webContents.once("did-finish-load", () => {
        setTimeout(() => {
          void installNativeBrowserAdBlocker(pageView.view.webContents.session, desktopLog);
        }, 1000);
      });
    } else {
      desktopLog("native browser ad blocking disabled by env");
    }
  } else {
    desktopLog("native browser view disabled by env");
  }
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
  desktopLog("before quit");
  void embeddedServer?.close();
});

app.on("window-all-closed", () => {
  desktopLog("window all closed");
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  desktopLog("will quit");
});

app.on("quit", (_event, exitCode) => {
  desktopLog(`quit ${exitCode}`);
});
