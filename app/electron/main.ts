import { app, BrowserWindow } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nativeBrowserPageEventChannel } from "../shared/nativeBrowser";
import { installNativeBrowserCommandBridge } from "./browserBridge";
import { createNativeBrowserPageView, layoutNativeBrowserPageView } from "./browserViews";

const defaultStartUrl = "http://localhost:3000";
const electronDirname = dirname(fileURLToPath(import.meta.url));

function getStartUrl() {
  const value = process.env.ELECTRON_START_URL?.trim();
  return value || defaultStartUrl;
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#020606",
    title: "CereBro",
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
