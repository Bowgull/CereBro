import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nativeBrowserPageEventChannel } from "../shared/nativeBrowser";
import { installNativeBrowserCommandBridge } from "./browserBridge";
import { createNativeBrowserPageView, layoutNativeBrowserPageView } from "./browserViews";
import { installNativeVpnBridge } from "./vpnBridge";

const defaultStartUrl = "http://localhost:3000";
const electronDirname = dirname(fileURLToPath(import.meta.url));
const appName = "CereBro";
const appIconPath = join(electronDirname, "../electron/assets/cerebro-app-icon.icns");

app.setName(appName);

function getStartUrl() {
  const value = process.env.ELECTRON_START_URL?.trim();
  return value || defaultStartUrl;
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

function createMainWindow() {
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
  void mainWindow.loadURL(getStartUrl());

  return mainWindow;
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
