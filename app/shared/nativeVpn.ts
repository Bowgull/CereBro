export const nativeVpnStatusChannel = "cerebro:native-vpn:status";
export const nativeVpnCheckChannel = "cerebro:native-vpn:check";
export const nativeVpnConnectChannel = "cerebro:native-vpn:connect";
export const nativeVpnDisconnectChannel = "cerebro:native-vpn:disconnect";
export const nativeVpnOpenSettingsChannel = "cerebro:native-vpn:open-settings";

export const nativeVpnStates = [
  "unknown",
  "off",
  "on",
  "checking",
  "needs_setup",
  "error",
] as const;

export type NativeVpnState = (typeof nativeVpnStates)[number];

export type NativeVpnStatusResult = {
  state: NativeVpnState;
  label: "VPN On" | "VPN Off" | "Checking" | "Needs Setup" | "Unknown";
  canConnect: boolean;
  canDisconnect: boolean;
  needsSetup: boolean;
  checkedAt: string;
  detail: {
    provider: string | null;
    appInstalled: boolean;
    serviceName: string | null;
    routeInterface: string | null;
    tunnelAddress: string | null;
  };
};

export type NativeVpnCommandResult = {
  ok: boolean;
  action: "status" | "connect" | "disconnect" | "open-settings";
  status: NativeVpnStatusResult;
  message: string;
};

export type NativeVpnBridge = {
  status: () => Promise<NativeVpnStatusResult>;
  check: () => Promise<NativeVpnStatusResult>;
  connect: () => Promise<NativeVpnCommandResult>;
  disconnect: () => Promise<NativeVpnCommandResult>;
  openSettings: () => Promise<NativeVpnCommandResult>;
};

export function nativeVpnUnknownStatus(checkedAt = new Date().toISOString()): NativeVpnStatusResult {
  return {
    state: "unknown",
    label: "Unknown",
    canConnect: false,
    canDisconnect: false,
    needsSetup: false,
    checkedAt,
    detail: {
      provider: null,
      appInstalled: false,
      serviceName: null,
      routeInterface: null,
      tunnelAddress: null,
    },
  };
}

declare global {
  interface Window {
    cerebroNativeVpn?: NativeVpnBridge;
  }
}
