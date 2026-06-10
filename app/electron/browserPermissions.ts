import { app, type Session } from "electron";
import type { NativeBrowserPageEvent } from "../shared/nativeBrowser";
import { classifyNativeBrowserDownload } from "./browserDownloadPolicy";
import {
  mapNativeDownloadBlocked,
  mapNativeDownloadFinished,
  mapNativeDownloadStarted,
} from "./browserEvents";

const downloadBurstWindowMs = 4000;
const recentDownloadStartsByWebContentsId = new Map<number, number[]>();

export function installNativeBrowserPermissionPolicy(
  browserSession: Session,
  options: {
    tabId?: string;
    emitPageEvent?: (event: NativeBrowserPageEvent) => void;
  } = {},
) {
  const tabId = options.tabId ?? "native_tab_1";
  const emitPageEvent = options.emitPageEvent ?? (() => {});

  browserSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  browserSession.on("will-download", (event, item, webContents) => {
    const now = Date.now();
    const recentStarts = (recentDownloadStartsByWebContentsId.get(webContents.id) ?? []).filter(
      (startedAt) => now - startedAt < downloadBurstWindowMs,
    );
    const filename = item.getFilename();
    const url = item.getURL();
    const decision = classifyNativeBrowserDownload({
      filename,
      url,
      hasUserGesture: item.hasUserGesture(),
      recentDownloadCount: recentStarts.length,
      downloadsPath: app.getPath("downloads"),
    });

    if (decision.action === "block") {
      event.preventDefault();
      item.cancel();
      emitPageEvent(mapNativeDownloadBlocked(tabId, filename, url, decision.reason));
      return;
    }

    recentDownloadStartsByWebContentsId.set(webContents.id, [...recentStarts, now]);
    item.setSavePath(decision.savePath);
    emitPageEvent(mapNativeDownloadStarted(tabId, filename, url, decision.savePath));
    item.once("done", (_doneEvent, state) => {
      emitPageEvent(mapNativeDownloadFinished(tabId, filename, url, decision.savePath, state));
    });
  });
}
