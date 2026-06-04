import { contextBridge, ipcRenderer } from "electron";
import {
  nativeBrowserOpenPageChannel,
  type NativeBrowserBridge,
  type NativeBrowserOpenRequest,
} from "../shared/nativeBrowser";

const nativeBrowserBridge: NativeBrowserBridge = {
  openPage: (request: NativeBrowserOpenRequest) => ipcRenderer.invoke(nativeBrowserOpenPageChannel, request),
};

contextBridge.exposeInMainWorld("cerebroNativeBrowser", nativeBrowserBridge);
