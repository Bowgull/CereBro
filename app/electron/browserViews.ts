import { WebContentsView, type BrowserWindow, type Rectangle } from "electron";
import type { NativeBrowserPageEvent } from "../shared/nativeBrowser";
import { installNativeBrowserPermissionPolicy } from "./browserPermissions";
import {
  mapNativeNavigationFailed,
  mapNativeNavigationFinished,
  mapNativeNavigationStarted,
  mapNativePopupBlocked,
  mapNativeTitleUpdated,
} from "./browserEvents";
import { nativeBrowserSessionWebPreferences } from "./browserSession";
import { isNativeBrowserPopupAllowedForUrl } from "./browserSiteSettings";

export type NativeBrowserPageView = {
  tabId: string;
  view: WebContentsView;
  load: (targetUrl: string) => Promise<void>;
  setBounds: (bounds: Rectangle) => void;
};

export function createNativeBrowserPageView(
  mainWindow: BrowserWindow,
  tabId = "native_tab_1",
  emitPageEvent: (event: NativeBrowserPageEvent) => void = () => {},
): NativeBrowserPageView {
  const view = new WebContentsView({
    webPreferences: nativeBrowserSessionWebPreferences(),
  });

  installNativeBrowserPermissionPolicy(view.webContents.session, { tabId, emitPageEvent });
  view.webContents.setWindowOpenHandler((details) => {
    if (isNativeBrowserPopupAllowedForUrl(view.webContents.getURL())) {
      return { action: "allow" };
    }
    emitPageEvent(mapNativePopupBlocked(tabId, details.url));
    return { action: "deny" };
  });
  view.webContents.on("did-start-navigation", (_event, url) => {
    emitPageEvent(mapNativeNavigationStarted(tabId, url));
  });
  view.webContents.on("did-finish-load", () => {
    emitPageEvent(mapNativeNavigationFinished(tabId, view.webContents.getURL(), view.webContents.getTitle() || null));
  });
  view.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    emitPageEvent(mapNativeNavigationFailed(tabId, validatedURL, errorCode, errorDescription));
  });
  view.webContents.on("page-title-updated", (_event, title) => {
    emitPageEvent(mapNativeTitleUpdated(tabId, title));
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
