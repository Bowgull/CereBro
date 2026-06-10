import type { NativeBrowserPageEvent } from "../shared/nativeBrowser";

export function mapNativeNavigationStarted(tabId: string, url: string, at = new Date().toISOString()): NativeBrowserPageEvent {
  return {
    type: "navigation-started",
    tabId,
    url,
    at,
  };
}

export function mapNativeNavigationFinished(tabId: string, url: string, title: string | null, at = new Date().toISOString()): NativeBrowserPageEvent {
  return {
    type: "navigation-finished",
    tabId,
    url,
    title,
    at,
  };
}

export function mapNativeNavigationFailed(tabId: string, url: string, errorCode: number, errorDescription: string, at = new Date().toISOString()): NativeBrowserPageEvent {
  return {
    type: "navigation-failed",
    tabId,
    url,
    errorCode,
    errorDescription,
    at,
  };
}

export function mapNativeTitleUpdated(tabId: string, title: string, at = new Date().toISOString()): NativeBrowserPageEvent {
  return {
    type: "title-updated",
    tabId,
    title,
    at,
  };
}

export function mapNativePopupBlocked(tabId: string, url: string, at = new Date().toISOString()): NativeBrowserPageEvent {
  return {
    type: "popup-blocked",
    tabId,
    url,
    at,
  };
}

export function mapNativeDownloadStarted(tabId: string, filename: string, url: string, savePath: string, at = new Date().toISOString()): NativeBrowserPageEvent {
  return {
    type: "download-started",
    tabId,
    filename,
    url,
    savePath,
    at,
  };
}

export function mapNativeDownloadFinished(
  tabId: string,
  filename: string,
  url: string,
  savePath: string,
  state: "completed" | "cancelled" | "interrupted",
  at = new Date().toISOString(),
): NativeBrowserPageEvent {
  return {
    type: "download-finished",
    tabId,
    filename,
    url,
    savePath,
    state,
    at,
  };
}

export function mapNativeDownloadBlocked(
  tabId: string,
  filename: string,
  url: string,
  reason: "automatic_download" | "multiple_download" | "risky_file",
  at = new Date().toISOString(),
): NativeBrowserPageEvent {
  return {
    type: "download-blocked",
    tabId,
    filename,
    url,
    reason,
    at,
  };
}
