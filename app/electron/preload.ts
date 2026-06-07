import { contextBridge, ipcRenderer } from "electron";
import {
  nativeBrowserClosePageChannel,
  nativeBrowserForwardPageChannel,
  nativeBrowserGoBackPageChannel,
  nativeBrowserOpenPageChannel,
  nativeBrowserPageEventChannel,
  nativeBrowserReloadPageChannel,
  type NativeBrowserBridge,
  type NativeBrowserOpenRequest,
  type NativeBrowserPageEvent,
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
