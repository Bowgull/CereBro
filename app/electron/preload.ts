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
