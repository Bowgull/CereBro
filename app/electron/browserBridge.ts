import { ipcMain, type BrowserWindow, type Rectangle } from "electron";
import {
  nativeBrowserOpenPageChannel,
  type NativeBrowserOpenResult,
} from "../shared/nativeBrowser";
import { normalizeNativeBrowserOpenRequest } from "./browserRequest";
import { layoutNativeBrowserPageView, type NativeBrowserPageView } from "./browserViews";

function nativePageBounds(mainWindow: BrowserWindow): Rectangle {
  const bounds = mainWindow.getContentBounds();
  return { x: 0, y: 0, width: Math.max(1, bounds.width), height: Math.max(1, bounds.height) };
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
}
