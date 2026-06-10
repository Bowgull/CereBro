import { ipcMain } from "electron";
import {
  nativeVpnCheckChannel,
  nativeVpnConnectChannel,
  nativeVpnDisconnectChannel,
  nativeVpnOpenSettingsChannel,
  nativeVpnStatusChannel,
  type NativeVpnCommandResult,
  type NativeVpnStatusResult,
} from "../shared/nativeVpn";
import { connectNativeVpn, disconnectNativeVpn, openNativeVpnSettings, readNativeVpnStatus } from "./vpnStatus";

export function installNativeVpnBridge() {
  ipcMain.handle(nativeVpnStatusChannel, async (): Promise<NativeVpnStatusResult> => readNativeVpnStatus());
  ipcMain.handle(nativeVpnCheckChannel, async (): Promise<NativeVpnStatusResult> => readNativeVpnStatus());
  ipcMain.handle(nativeVpnConnectChannel, async (): Promise<NativeVpnCommandResult> => connectNativeVpn());
  ipcMain.handle(nativeVpnDisconnectChannel, async (): Promise<NativeVpnCommandResult> => disconnectNativeVpn());
  ipcMain.handle(nativeVpnOpenSettingsChannel, async (): Promise<NativeVpnCommandResult> => openNativeVpnSettings());
}
