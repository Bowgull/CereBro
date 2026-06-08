import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nativeBrowserPageEventChannel } from "../shared/nativeBrowser";
import { installNativeBrowserCommandBridge } from "./browserBridge";
import { createNativeBrowserPageView, layoutNativeBrowserPageView } from "./browserViews";
import { installNativeVpnBridge } from "./vpnBridge";
import type { StartedCereBroServer } from "../server/_core/index";

const electronDirname = dirname(fileURLToPath(import.meta.url));
const appName = "CereBro";
const appIconPath = join(electronDirname, "../electron/assets/cerebro-app-icon.icns");
const bundledStaticDir = join(electronDirname, "../dist/public");
let embeddedServer: StartedCereBroServer | null = null;

app.setName(appName);

async function getEmbeddedStartUrl() {
  process.env.CEREBRO_SERVER_AUTOSTART = "false";
  process.env.CEREBRO_STATIC_DIR = process.env.CEREBRO_STATIC_DIR || bundledStaticDir;
  process.env.NODE_ENV = process.env.NODE_ENV || "production";

  const { startServer } = await import("../server/_core/index");
  embeddedServer = await startServer({ startInboxPoll: true });
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
  layoutNativeBrowserPageView(pageView, { x: 0, y: 0, width: 1, height: 1 });
  installNativeBrowserCommandBridge(mainWindow, pageView);
  installNativeVpnBridge();
  installApplicationMenu(mainWindow);
  void mainWindow.loadURL(await resolveStartUrl());

  return mainWindow;
}

app.whenReady().then(() => {
  void createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createMainWindow();
  });
});

app.on("before-quit", () => {
  void embeddedServer?.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
