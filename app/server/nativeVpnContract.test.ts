import { describe, expect, it } from "vitest";
import {
  nativeVpnCheckChannel,
  nativeVpnConnectChannel,
  nativeVpnDisconnectChannel,
  nativeVpnOpenSettingsChannel,
  nativeVpnUnknownStatus,
  nativeVpnStates,
  nativeVpnStatusChannel,
  type NativeVpnStatusResult,
} from "../shared/nativeVpn";

describe("native VPN contract", () => {
  it("exports the narrow bridge channels", () => {
    expect(nativeVpnStatusChannel).toBe("cerebro:native-vpn:status");
    expect(nativeVpnCheckChannel).toBe("cerebro:native-vpn:check");
    expect(nativeVpnConnectChannel).toBe("cerebro:native-vpn:connect");
    expect(nativeVpnDisconnectChannel).toBe("cerebro:native-vpn:disconnect");
    expect(nativeVpnOpenSettingsChannel).toBe("cerebro:native-vpn:open-settings");
  });

  it("keeps the public VPN states plain", () => {
    expect(nativeVpnStates).toEqual([
      "unknown",
      "off",
      "on",
      "checking",
      "needs_setup",
      "error",
    ]);

    const status: NativeVpnStatusResult = {
      state: "on",
      label: "VPN On",
      canConnect: false,
      canDisconnect: true,
      needsSetup: false,
      checkedAt: "2026-06-07T12:00:00.000Z",
      detail: {
        provider: "ProtonVPN",
        appInstalled: true,
        serviceName: "ProtonVPN",
        routeInterface: "utun6",
        tunnelAddress: "10.2.0.2",
      },
    };

    expect(status.label).toBe("VPN On");
    expect(status.detail.routeInterface).toBe("utun6");
  });

  it("provides a shared unknown status for non-native windows", () => {
    expect(nativeVpnUnknownStatus("2026-06-07T12:00:00.000Z")).toEqual({
      state: "unknown",
      label: "Unknown",
      canConnect: false,
      canDisconnect: false,
      needsSetup: false,
      checkedAt: "2026-06-07T12:00:00.000Z",
      detail: {
        provider: null,
        appInstalled: false,
        serviceName: null,
        routeInterface: null,
        tunnelAddress: null,
      },
    });
  });
});
