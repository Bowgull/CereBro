import { contextBridge, ipcRenderer } from "electron";
import {
  nativeBrowserClosePageChannel,
  nativeBrowserAllowPopupsHereChannel,
  nativeBrowserForwardPageChannel,
  nativeBrowserGoBackPageChannel,
  nativeBrowserOpenPageChannel,
  nativeBrowserPageEventChannel,
  nativeBrowserReloadPageChannel,
  nativeBrowserSetBoundsChannel,
  nativeBrowserSetBlockingForSiteChannel,
  nativeBrowserSiteSettingsChannel,
  type NativeBrowserBridge,
  type NativeBrowserBounds,
  type NativeBrowserOpenRequest,
  type NativeBrowserPageEvent,
  type NativeBrowserSetBlockingRequest,
} from "../shared/nativeBrowser";
import {
  nativeVpnCheckChannel,
  nativeVpnConnectChannel,
  nativeVpnDisconnectChannel,
  nativeVpnOpenSettingsChannel,
  nativeVpnStatusChannel,
  type NativeVpnBridge,
} from "../shared/nativeVpn";

const nativeBrowserBridge: NativeBrowserBridge = {
  openPage: (request: NativeBrowserOpenRequest) => ipcRenderer.invoke(nativeBrowserOpenPageChannel, request),
  closePage: () => ipcRenderer.invoke(nativeBrowserClosePageChannel),
  reloadPage: () => ipcRenderer.invoke(nativeBrowserReloadPageChannel),
  goBack: () => ipcRenderer.invoke(nativeBrowserGoBackPageChannel),
  goForward: () => ipcRenderer.invoke(nativeBrowserForwardPageChannel),
  setBounds: (bounds: NativeBrowserBounds) => ipcRenderer.invoke(nativeBrowserSetBoundsChannel, bounds),
  siteSettings: () => ipcRenderer.invoke(nativeBrowserSiteSettingsChannel),
  allowPopupsHere: () => ipcRenderer.invoke(nativeBrowserAllowPopupsHereChannel),
  setBlockingForSite: (request: NativeBrowserSetBlockingRequest) => ipcRenderer.invoke(nativeBrowserSetBlockingForSiteChannel, request),
  onPageEvent: (callback: (event: NativeBrowserPageEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, pageEvent: NativeBrowserPageEvent) => callback(pageEvent);
    ipcRenderer.on(nativeBrowserPageEventChannel, listener);
    return () => ipcRenderer.removeListener(nativeBrowserPageEventChannel, listener);
  },
};

contextBridge.exposeInMainWorld("cerebroNativeBrowser", nativeBrowserBridge);

const nativeVpnBridge: NativeVpnBridge = {
  status: () => ipcRenderer.invoke(nativeVpnStatusChannel),
  check: () => ipcRenderer.invoke(nativeVpnCheckChannel),
  connect: () => ipcRenderer.invoke(nativeVpnConnectChannel),
  disconnect: () => ipcRenderer.invoke(nativeVpnDisconnectChannel),
  openSettings: () => ipcRenderer.invoke(nativeVpnOpenSettingsChannel),
};

contextBridge.exposeInMainWorld("cerebroNativeVpn", nativeVpnBridge);
