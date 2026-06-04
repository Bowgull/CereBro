export const nativeBrowserOpenPageChannel = "cerebro:native-browser:open-page";
export const nativeBrowserClosePageChannel = "cerebro:native-browser:close-page";
export const nativeBrowserPageEventChannel = "cerebro:native-browser:page-event";

export const nativeBrowserPageEventTypes = [
  "navigation-started",
  "navigation-finished",
  "navigation-failed",
  "title-updated",
] as const;

export const nativeBrowserBlockedReasons = [
  "permission",
  "invalid_url",
  "navigation_failed",
] as const;

export type NativeBrowserPageEventType = (typeof nativeBrowserPageEventTypes)[number];
export type NativeBrowserBlockedReason = (typeof nativeBrowserBlockedReasons)[number];

export type NativeBrowserOpenRequest = {
  tabId: string;
  targetUrl: string;
  userInitiated: true;
};

export type NativeBrowserOpenResult = {
  ok: boolean;
  tabId: string;
  currentUrl: string | null;
  title: string | null;
  blockedReason: NativeBrowserBlockedReason | null;
};

export type NativeBrowserCloseResult = {
  ok: true;
  tabId: string;
  currentUrl: string | null;
  title: string | null;
};

export type NativeBrowserBridge = {
  openPage: (request: NativeBrowserOpenRequest) => Promise<NativeBrowserOpenResult>;
  closePage: () => Promise<NativeBrowserCloseResult>;
  onPageEvent: (callback: (event: NativeBrowserPageEvent) => void) => () => void;
};

export type NativeBrowserPageEvent =
  | { type: "navigation-started"; tabId: string; url: string; at: string }
  | { type: "navigation-finished"; tabId: string; url: string; title: string | null; at: string }
  | { type: "navigation-failed"; tabId: string; url: string; errorCode: number; errorDescription: string; at: string }
  | { type: "title-updated"; tabId: string; title: string; at: string };

declare global {
  interface Window {
    cerebroNativeBrowser?: NativeBrowserBridge;
  }
}
