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
