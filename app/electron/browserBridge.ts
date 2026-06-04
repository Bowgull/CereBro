import { ipcMain, type BrowserWindow, type Rectangle } from "electron";
import {
  nativeBrowserClosePageChannel,
  nativeBrowserForwardPageChannel,
  nativeBrowserGoBackPageChannel,
  nativeBrowserOpenPageChannel,
  nativeBrowserReloadPageChannel,
  type NativeBrowserCloseResult,
  type NativeBrowserNavigationResult,
  type NativeBrowserOpenResult,
} from "../shared/nativeBrowser";
import { nativeBrowserContentBounds, normalizeNativeBrowserOpenRequest } from "./browserRequest";
import { layoutNativeBrowserPageView, type NativeBrowserPageView } from "./browserViews";

function nativePageBounds(mainWindow: BrowserWindow): Rectangle {
  const bounds = mainWindow.getContentBounds();
  return nativeBrowserContentBounds(bounds);
}

function nativeNavigationResult(pageView: NativeBrowserPageView, ok = true): NativeBrowserNavigationResult {
  return {
    ok,
    tabId: pageView.tabId,
    currentUrl: pageView.view.webContents.getURL() || null,
    title: pageView.view.webContents.getTitle() || null,
  };
}

export function installNativeBrowserCommandBridge(mainWindow: BrowserWindow, pageView: NativeBrowserPageView) {
  ipcMain.handle(nativeBrowserOpenPageChannel, async (_event, input: unknown): Promise<NativeBrowserOpenResult> => {
    const request = normalizeNativeBrowserOpenRequest(input);
    if (!request.ok) {
      return {
        ok: false,
        tabId: request.tabId,
        currentUrl: null,
        title: null,
        blockedReason: request.blockedReason,
      };
    }

    layoutNativeBrowserPageView(pageView, nativePageBounds(mainWindow));
    pageView.view.setVisible(true);
    await pageView.load(request.targetUrl);

    return {
      ok: true,
      tabId: request.tabId,
      currentUrl: request.targetUrl,
      title: pageView.view.webContents.getTitle() || null,
      blockedReason: null,
    };
  });

  ipcMain.handle(nativeBrowserClosePageChannel, async (): Promise<NativeBrowserCloseResult> => {
    const currentUrl = pageView.view.webContents.getURL() || null;
    const title = pageView.view.webContents.getTitle() || null;
    pageView.view.setVisible(false);
    layoutNativeBrowserPageView(pageView, { x: 0, y: 0, width: 1, height: 1 });

    return {
      ok: true,
      tabId: pageView.tabId,
      currentUrl,
      title,
    };
  });

  ipcMain.handle(nativeBrowserReloadPageChannel, async (): Promise<NativeBrowserNavigationResult> => {
    pageView.view.webContents.reload();
    return nativeNavigationResult(pageView);
  });

  ipcMain.handle(nativeBrowserGoBackPageChannel, async (): Promise<NativeBrowserNavigationResult> => {
    if (!pageView.view.webContents.canGoBack()) return nativeNavigationResult(pageView, false);
    pageView.view.webContents.goBack();
    return nativeNavigationResult(pageView);
  });

  ipcMain.handle(nativeBrowserForwardPageChannel, async (): Promise<NativeBrowserNavigationResult> => {
    if (!pageView.view.webContents.canGoForward()) return nativeNavigationResult(pageView, false);
    pageView.view.webContents.goForward();
    return nativeNavigationResult(pageView);
  });
}
