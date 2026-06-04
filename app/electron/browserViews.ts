import { WebContentsView, type BrowserWindow, type Rectangle } from "electron";
import { installNativeBrowserPermissionPolicy } from "./browserPermissions";
import {
  mapNativeNavigationFailed,
  mapNativeNavigationFinished,
  mapNativeNavigationStarted,
  mapNativeTitleUpdated,
} from "./browserEvents";

export type NativeBrowserPageView = {
  tabId: string;
  view: WebContentsView;
  load: (targetUrl: string) => Promise<void>;
  setBounds: (bounds: Rectangle) => void;
};

export function createNativeBrowserPageView(mainWindow: BrowserWindow, tabId = "native_tab_1"): NativeBrowserPageView {
  const view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: "cerebro-native-browser",
    },
  });

  installNativeBrowserPermissionPolicy(view.webContents.session);
  view.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  view.webContents.on("did-start-navigation", (_event, url) => {
    mapNativeNavigationStarted(tabId, url);
  });
  view.webContents.on("did-finish-load", () => {
    mapNativeNavigationFinished(tabId, view.webContents.getURL(), view.webContents.getTitle() || null);
  });
  view.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    mapNativeNavigationFailed(tabId, validatedURL, errorCode, errorDescription);
  });
  view.webContents.on("page-title-updated", (_event, title) => {
    mapNativeTitleUpdated(tabId, title);
  });

  mainWindow.contentView.addChildView(view);
  view.setVisible(false);

  return {
    tabId,
    view,
    load: (targetUrl: string) => view.webContents.loadURL(targetUrl),
    setBounds: (bounds: Rectangle) => view.setBounds(bounds),
  };
}

export function layoutNativeBrowserPageView(pageView: NativeBrowserPageView, bounds: Rectangle) {
  pageView.setBounds(bounds);
}
