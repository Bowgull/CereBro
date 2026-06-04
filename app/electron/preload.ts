import { contextBridge, ipcRenderer } from "electron";
import {
  nativeBrowserClosePageChannel,
  nativeBrowserOpenPageChannel,
  type NativeBrowserBridge,
  type NativeBrowserOpenRequest,
} from "../shared/nativeBrowser";

const nativeBrowserBridge: NativeBrowserBridge = {
  openPage: (request: NativeBrowserOpenRequest) => ipcRenderer.invoke(nativeBrowserOpenPageChannel, request),
  closePage: () => ipcRenderer.invoke(nativeBrowserClosePageChannel),
};

contextBridge.exposeInMainWorld("cerebroNativeBrowser", nativeBrowserBridge);
