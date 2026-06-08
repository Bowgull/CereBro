import type { Session } from "electron";
import type { NativeBrowserSiteSettings } from "../shared/nativeBrowser";
import { nativeBrowserAdBlockEngineState, setNativeBrowserAdBlockingEnabled } from "./browserAdBlock";
import type { NativeBrowserPageView } from "./browserViews";

const popupAllowedHosts = new Set<string>();
const blockingOffHosts = new Set<string>();

function hostFromUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isNativeBrowserPopupAllowedForUrl(value: string | null | undefined) {
  const host = hostFromUrl(value);
  return host != null && popupAllowedHosts.has(host);
}

export function nativeBrowserSiteSettingsForUrl(value: string | null | undefined): NativeBrowserSiteSettings {
  const host = hostFromUrl(value);
  return {
    host,
    popupPolicy: host != null && popupAllowedHosts.has(host) ? "allow" : "block",
    blockingPolicy: host != null && blockingOffHosts.has(host) ? "off" : "strict",
    adBlockEngine: nativeBrowserAdBlockEngineState(),
    passwordManager: "not_set_up",
  };
}

export function nativeBrowserSiteSettingsForPage(pageView: NativeBrowserPageView): NativeBrowserSiteSettings {
  return nativeBrowserSiteSettingsForUrl(pageView.view.webContents.getURL());
}

export function allowNativeBrowserPopupsForCurrentSite(pageView: NativeBrowserPageView) {
  const host = hostFromUrl(pageView.view.webContents.getURL());
  if (host) popupAllowedHosts.add(host);
  return nativeBrowserSiteSettingsForPage(pageView);
}

export function setNativeBrowserBlockingForCurrentSite(
  pageView: NativeBrowserPageView,
  browserSession: Session,
  blockingPolicy: NativeBrowserSiteSettings["blockingPolicy"],
) {
  const host = hostFromUrl(pageView.view.webContents.getURL());
  if (host && blockingPolicy === "off") blockingOffHosts.add(host);
  if (host && blockingPolicy === "strict") blockingOffHosts.delete(host);
  setNativeBrowserAdBlockingEnabled(browserSession, blockingPolicy === "strict");
  return nativeBrowserSiteSettingsForPage(pageView);
}

export function applyNativeBrowserBlockingForUrl(browserSession: Session, targetUrl: string) {
  const settings = nativeBrowserSiteSettingsForUrl(targetUrl);
  setNativeBrowserAdBlockingEnabled(browserSession, settings.blockingPolicy === "strict");
  return settings;
}
