import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { NativeVpnCommandResult, NativeVpnStatusResult } from "../shared/nativeVpn";

const execFileAsync = promisify(execFile);
const protonVpnAppPath = "/Applications/ProtonVPN.app";

async function runCommand(command: string, args: string[]) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { timeout: 8_000 });
    return { ok: true, stdout, stderr };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, stdout: err.stdout ?? "", stderr: err.stderr ?? err.message ?? "" };
  }
}

async function appInstalled() {
  try {
    await access(protonVpnAppPath);
    return true;
  } catch {
    return false;
  }
}

function parseService(listOutput: string) {
  const line = listOutput
    .split("\n")
    .find((entry) => entry.includes("ch.protonvpn.mac") || entry.includes('"ProtonVPN"'));
  if (!line) return { connected: false, serviceName: null };
  const quoted = line.match(/"([^"]+)"/);
  return {
    connected: line.includes("(Connected)"),
    serviceName: quoted?.[1] ?? "ProtonVPN",
  };
}

function parseRouteInterface(routeOutput: string) {
  return routeOutput.match(/interface:\s+(\S+)/)?.[1] ?? null;
}

function parseTunnelAddress(ifconfigOutput: string) {
  return ifconfigOutput.match(/inet\s+(10\.\d+\.\d+\.\d+)\s+-->/)?.[1] ?? null;
}

function statusLabel(status: NativeVpnStatusResult["state"]): NativeVpnStatusResult["label"] {
  if (status === "on") return "VPN On";
  if (status === "off") return "VPN Off";
  if (status === "checking") return "Checking";
  if (status === "needs_setup") return "Needs Setup";
  return "Unknown";
}

export async function readNativeVpnStatus(): Promise<NativeVpnStatusResult> {
  const [installed, serviceList, route, interfaces] = await Promise.all([
    appInstalled(),
    runCommand("/usr/sbin/scutil", ["--nc", "list"]),
    runCommand("/sbin/route", ["-n", "get", "default"]),
    runCommand("/sbin/ifconfig", []),
  ]);
  const service = parseService(serviceList.stdout);
  const routeInterface = parseRouteInterface(route.stdout);
  const tunnelAddress = parseTunnelAddress(interfaces.stdout);
  const connected = service.connected && routeInterface?.startsWith("utun") === true;
  const state: NativeVpnStatusResult["state"] = connected
    ? "on"
    : installed && service.serviceName
      ? "off"
      : installed
        ? "needs_setup"
        : "needs_setup";

  return {
    state,
    label: statusLabel(state),
    canConnect: state === "off",
    canDisconnect: state === "on",
    needsSetup: state === "needs_setup",
    checkedAt: new Date().toISOString(),
    detail: {
      provider: installed ? "ProtonVPN" : null,
      appInstalled: installed,
      serviceName: service.serviceName,
      routeInterface,
      tunnelAddress,
    },
  };
}

async function openVpnApp() {
  await runCommand("/usr/bin/open", ["-a", "ProtonVPN"]);
}

export async function connectNativeVpn(): Promise<NativeVpnCommandResult> {
  const before = await readNativeVpnStatus();
  if (before.state === "on") {
    return { ok: true, action: "connect", status: before, message: "VPN is already on." };
  }
  if (!before.detail.serviceName) {
    await openVpnApp();
    const status = await readNativeVpnStatus();
    return { ok: false, action: "connect", status, message: "Open VPN setup." };
  }

  await runCommand("/usr/sbin/scutil", ["--nc", "start", before.detail.serviceName]);
  await openVpnApp();
  const status = await readNativeVpnStatus();
  return {
    ok: status.state === "on",
    action: "connect",
    status,
    message: status.state === "on" ? "VPN turned on." : "Confirm in the VPN app.",
  };
}

export async function disconnectNativeVpn(): Promise<NativeVpnCommandResult> {
  const before = await readNativeVpnStatus();
  if (before.state !== "on" || !before.detail.serviceName) {
    return { ok: true, action: "disconnect", status: before, message: "VPN is already off." };
  }
  await runCommand("/usr/sbin/scutil", ["--nc", "stop", before.detail.serviceName]);
  const status = await readNativeVpnStatus();
  return {
    ok: status.state !== "on",
    action: "disconnect",
    status,
    message: status.state === "on" ? "Confirm in the VPN app." : "VPN turned off.",
  };
}

export async function openNativeVpnSettings(): Promise<NativeVpnCommandResult> {
  await openVpnApp();
  const status = await readNativeVpnStatus();
  return {
    ok: true,
    action: "open-settings",
    status,
    message: "VPN opened.",
  };
}
