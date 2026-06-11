import { execFile, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import WebSocket from "ws";

const execFileAsync = promisify(execFile);

const appPath = process.env.CEREBRO_DESKTOP_APP_PATH ?? "/Applications/CereBro.app";
const binaryPath = `${appPath}/Contents/MacOS/CereBro`;
const port = Number(process.env.CEREBRO_DESKTOP_QA_PORT ?? "9333");
const closeExisting = process.env.CEREBRO_DESKTOP_QA_CLOSE_EXISTING === "1";
const reopenExisting = process.env.CEREBRO_DESKTOP_QA_REOPEN_EXISTING !== "0";
const qaMode = process.env.CEREBRO_DESKTOP_QA_MODE ?? "browser";
const screenshotFile =
  qaMode === "browser-home"
    ? "cerebro-installed-browser-home-smoke.png"
    : qaMode === "launch"
      ? "cerebro-installed-launch-smoke.png"
      : "cerebro-installed-browser-smoke.png";
const screenshotPath = resolve(process.cwd(), "output/qa", screenshotFile);

function sleep(ms: number) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function mainProcessPids() {
  try {
    return execFileSync("pgrep", ["-f", binaryPath], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function waitForNoMainProcess(timeoutMs = 8_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (mainProcessPids().length === 0) return;
    await sleep(250);
  }

  throw new Error(`CereBro is still running from ${binaryPath}`);
}

async function quitExistingApp() {
  await execFileAsync("pkill", ["-f", binaryPath]).catch(() => undefined);
  await waitForNoMainProcess();
}

async function waitForCdpEndpoint(timeoutMs = 30_000) {
  const url = `http://127.0.0.1:${port}/json/version`;
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return url;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }

  throw new Error(`Remote debugging endpoint did not open on ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

type DebugTarget = {
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl?: string;
};

type AppPageTarget = DebugTarget & {
  webSocketDebuggerUrl: string;
};

function appIsRunning() {
  return mainProcessPids().length > 0;
}

async function waitForLaunchedPid(timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const pids = mainProcessPids();
    if (pids[0]) return Number(pids[0]);
    await sleep(250);
  }
  return null;
}

async function waitForStableMainProcess(timeoutMs = 10_000, stableMs = 4_000) {
  const deadline = Date.now() + timeoutMs;
  let stableSince: number | null = null;
  while (Date.now() < deadline) {
    if (mainProcessPids().length > 0) {
      stableSince ??= Date.now();
      if (Date.now() - stableSince >= stableMs) return true;
    } else {
      stableSince = null;
    }
    await sleep(250);
  }
  return false;
}

async function waitForAppPageTarget() {
  await waitForCdpEndpoint();
  const targetsUrl = `http://127.0.0.1:${port}/json/list`;
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    const response = await fetch(targetsUrl);
    if (response.ok) {
      const targets = (await response.json()) as DebugTarget[];
      const target = targets.find(
        (candidate) =>
          candidate.type === "page" &&
          candidate.webSocketDebuggerUrl &&
          (candidate.url.startsWith("http://localhost:") || candidate.url.startsWith("http://127.0.0.1:")),
      );
      if (target?.webSocketDebuggerUrl) return target as AppPageTarget;
    }

    if (!appIsRunning()) throw new Error("CereBro exited before opening a debuggable page");
    await sleep(250);
  }

  throw new Error("CereBro opened, but no app page target was visible over remote debugging");
}

async function waitForLocalAppHttp(targetUrl: string, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus: number | null = null;
  let lastError: unknown = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(targetUrl);
      lastStatus = response.status;
      if (response.ok) return { ok: true, status: response.status, url: targetUrl };
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw new Error(`Local app HTTP did not answer at ${targetUrl}: ${lastStatus ?? (lastError instanceof Error ? lastError.message : String(lastError))}`);
}

async function waitForNativePageTarget(targetUrlPrefix: string, timeoutMs = 20_000) {
  const targetsUrl = `http://127.0.0.1:${port}/json/list`;
  const deadline = Date.now() + timeoutMs;
  let latestTargets: DebugTarget[] = [];

  while (Date.now() < deadline) {
    const response = await fetch(targetsUrl);
    if (response.ok) {
      latestTargets = (await response.json()) as DebugTarget[];
      const target = latestTargets.find((candidate) => candidate.type === "page" && candidate.url.startsWith(targetUrlPrefix));
      if (target) return target;
    }
    await sleep(250);
  }

  throw new Error(`Native Browser page target did not load ${targetUrlPrefix}. Targets: ${JSON.stringify(latestTargets.map((target) => target.url))}`);
}

type CdpResponse = {
  id?: number;
  result?: unknown;
  error?: {
    message: string;
  };
};

class CdpClient {
  private nextId = 1;
  private readonly pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();

  constructor(private readonly socket: WebSocket) {
    this.socket.on("message", (data) => {
      const message = JSON.parse(data.toString()) as CdpResponse;
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message));
        return;
      }
      pending.resolve(message.result);
    });
  }

  static connect(url: string) {
    return new Promise<CdpClient>((resolvePromise, reject) => {
      console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-cdp-connect-start", url }, null, 2));
      const socket = new WebSocket(url);
      socket.once("open", () => {
        console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-cdp-connect-open" }, null, 2));
        resolvePromise(new CdpClient(socket));
      });
      socket.once("error", (error) => {
        console.error(JSON.stringify({ ok: false, mode: "desktop-smoke-cdp-connect-error", message: error.message }, null, 2));
        reject(error);
      });
    });
  }

  send(method: string, params: Record<string, unknown> = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise<unknown>((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 10_000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolvePromise(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
    });
  }

  close() {
    this.socket.close();
  }
}

type RuntimeEvaluation = {
  result?: {
    value?: unknown;
  };
};

async function evaluate(client: CdpClient, expression: string) {
  const response = (await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })) as RuntimeEvaluation;
  return response.result?.value;
}

async function waitFor(client: CdpClient, expression: string, timeoutMs = 15_000, label = expression) {
  const deadline = Date.now() + timeoutMs;
  let lastValue: unknown = null;
  while (Date.now() < deadline) {
    lastValue = await evaluate(client, expression);
    if (lastValue === true) return;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for installed app UI state "${label}". Last value: ${JSON.stringify(lastValue)}`);
}

async function clickButtonByName(client: CdpClient, name: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastLabels: string[] = [];

  while (Date.now() < deadline) {
    const result = (await evaluate(
      client,
      `(() => {
        const labelFor = (element) => (element.getAttribute("aria-label") || element.textContent || "").trim();
        const buttons = Array.from(document.querySelectorAll("button,[role='button']"));
        const target = buttons.find((element) => labelFor(element).includes(${JSON.stringify(name)}));
        if (!target) {
          return { ok: false, labels: buttons.map(labelFor).filter(Boolean).slice(0, 40) };
        }
        target.click();
        return { ok: true, label: labelFor(target) };
      })()`,
    )) as { ok?: boolean; labels?: string[]; label?: string } | undefined;

    if (result?.ok) return;
    lastLabels = result?.labels ?? [];
    await sleep(250);
  }

  throw new Error(`Button "${name}" was not found in installed app. Visible button labels: ${JSON.stringify(lastLabels)}`);
}

async function clickButtonByTitle(client: CdpClient, title: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastTitles: string[] = [];

  while (Date.now() < deadline) {
    const result = (await evaluate(
      client,
      `(() => {
        const buttons = Array.from(document.querySelectorAll("button,[role='button']"));
        const target = buttons.find((element) => (element.getAttribute("title") || "").trim() === ${JSON.stringify(title)});
        if (!target) {
          return { ok: false, titles: buttons.map((element) => (element.getAttribute("title") || "").trim()).filter(Boolean).slice(0, 40) };
        }
        target.click();
        return { ok: true, title: target.getAttribute("title") };
      })()`,
    )) as { ok?: boolean; titles?: string[]; title?: string } | undefined;

    if (result?.ok) return;
    lastTitles = result?.titles ?? [];
    await sleep(250);
  }

  throw new Error(`Button title "${title}" was not found in installed app. Visible button titles: ${JSON.stringify(lastTitles)}`);
}

async function clickElementByAriaLabel(client: CdpClient, label: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastLabels: string[] = [];

  while (Date.now() < deadline) {
    const result = (await evaluate(
      client,
      `(() => {
        const elements = Array.from(document.querySelectorAll("[aria-label]"));
        const target = elements.find((element) => (element.getAttribute("aria-label") || "").trim() === ${JSON.stringify(label)});
        if (!target) {
          return { ok: false, labels: elements.map((element) => (element.getAttribute("aria-label") || "").trim()).filter(Boolean).slice(0, 60) };
        }
        target.click();
        return { ok: true, label: target.getAttribute("aria-label") };
      })()`,
    )) as { ok?: boolean; labels?: string[]; label?: string } | undefined;

    if (result?.ok) return;
    lastLabels = result?.labels ?? [];
    await sleep(250);
  }

  throw new Error(`Element "${label}" was not found in installed app. Visible aria labels: ${JSON.stringify(lastLabels)}`);
}

async function fillInputByLabel(client: CdpClient, label: string, value: string) {
  const result = (await evaluate(
    client,
    `(() => {
      const input = document.querySelector(${JSON.stringify(`[aria-label="${label}"]`)});
      if (!(input instanceof HTMLInputElement)) return { ok: false, labels: Array.from(document.querySelectorAll("input")).map((item) => item.getAttribute("aria-label") || item.placeholder || "").filter(Boolean) };
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: ${JSON.stringify(value)} }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return { ok: input.value === ${JSON.stringify(value)}, value: input.value };
    })()`,
  )) as { ok?: boolean; labels?: string[]; value?: string } | undefined;

  if (!result?.ok) {
    throw new Error(`Input "${label}" was not found or could not be filled. Visible inputs: ${JSON.stringify(result?.labels ?? [])}`);
  }
}

async function clearAndFillInputByLabel(client: CdpClient, label: string, value: string) {
  const result = (await evaluate(
    client,
    `(() => {
      const input = document.querySelector(${JSON.stringify(`[aria-label="${label}"]`)});
      if (!(input instanceof HTMLInputElement)) return { ok: false, labels: Array.from(document.querySelectorAll("input")).map((item) => item.getAttribute("aria-label") || item.placeholder || "").filter(Boolean) };
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, "");
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null }));
      setter?.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: ${JSON.stringify(value)} }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return { ok: input.value === ${JSON.stringify(value)}, value: input.value };
    })()`,
  )) as { ok?: boolean; labels?: string[]; value?: string } | undefined;

  if (!result?.ok) {
    throw new Error(`Input "${label}" was not found or could not be refilled. Visible inputs: ${JSON.stringify(result?.labels ?? [])}`);
  }
}

async function pressEnterInInputByLabel(client: CdpClient, label: string) {
  const result = (await evaluate(
    client,
    `(() => {
      const input = document.querySelector(${JSON.stringify(`[aria-label="${label}"]`)});
      if (!(input instanceof HTMLInputElement)) return { ok: false };
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
      return { ok: true };
    })()`,
  )) as { ok?: boolean } | undefined;

  if (!result?.ok) {
    throw new Error(`Input "${label}" was not found for Enter.`);
  }
}

async function captureDesktopScreenshot(pid: number | undefined) {
  await mkdir(resolve(process.cwd(), "output/qa"), { recursive: true });
  if (typeof pid === "number") {
    await execFileAsync("osascript", [
      "-e",
      `tell application "System Events" to set frontmost of first process whose unix id is ${pid} to true`,
    ]).catch(() => undefined);
  }
  await sleep(750);
  if (typeof pid === "number") {
    const bounds = await execFileAsync("osascript", [
      "-e",
      `tell application "System Events" to tell first process whose unix id is ${pid} to get {position, size} of front window`,
    ]).catch(() => null);
    const region = bounds?.stdout
      .trim()
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((part) => Number.isFinite(part));

    if (region?.length === 4 && region[2] > 0 && region[3] > 0) {
      await execFileAsync("screencapture", ["-x", `-R${region.join(",")}`, screenshotPath]);
      return screenshotPath;
    }
  }
  await execFileAsync("screencapture", ["-x", screenshotPath]);
  return screenshotPath;
}

type CdpScreenshotResult = {
  data?: string;
};

async function captureCdpScreenshot(client: CdpClient) {
  await mkdir(resolve(process.cwd(), "output/qa"), { recursive: true });
  await client.send("Page.enable");
  const result = (await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  })) as CdpScreenshotResult;
  if (!result.data) throw new Error("CDP screenshot did not return image data");
  await writeFile(screenshotPath, Buffer.from(result.data, "base64"));
  return screenshotPath;
}

function hasButtonLabelExpression(label: string) {
  return `Array.from(document.querySelectorAll("button,[role='button']")).some((element) => ((element.getAttribute("aria-label") || element.textContent || "").trim()).includes(${JSON.stringify(label)}))`;
}

async function run() {
  console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-start", appPath, binaryPath, port, qaMode }, null, 2));
  if (!existsSync(binaryPath)) {
    throw new Error(`Installed CereBro binary not found at ${binaryPath}`);
  }

  const existingPids = mainProcessPids();
  const hadExistingApp = existingPids.length > 0;
  console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-existing", hadExistingApp, existingPids }, null, 2));
  if (hadExistingApp && !closeExisting) {
    throw new Error(`CereBro is already running from ${binaryPath}. Set CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 to test one installed app instance.`);
  }

  if (hadExistingApp) {
    await quitExistingApp();
    console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-quit-existing" }, null, 2));
  }

  await execFileAsync("open", ["-n", appPath, "--args", `--remote-debugging-port=${port}`], {
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });
  const launchedPid = await waitForLaunchedPid();
  console.log(JSON.stringify({ ok: launchedPid != null, mode: "desktop-smoke-launched", pid: launchedPid }, null, 2));

  try {
    const target = await waitForAppPageTarget();
    console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-target", title: target.title, url: target.url }, null, 2));
    if (qaMode === "launch") {
      const httpProof = await waitForLocalAppHttp(target.url);
      const screenshot = await captureDesktopScreenshot(launchedPid ?? undefined);
      const stable = await waitForStableMainProcess();
      if (!stable) throw new Error("CereBro exposed an app page but did not remain running after launch.");
      console.log(
        JSON.stringify(
          {
            ok: true,
            appPath,
            binaryPath,
            remoteDebuggingPort: port,
            pageUrl: target.url,
            screenshot,
            launchProof: {
              pid: launchedPid,
              targetUrl: target.url,
              httpStatus: httpProof.status,
              stableMs: 4_000,
            },
            proof: "Installed CereBro launched through the .app bundle, exposed a debuggable app page, answered local app HTTP, and produced a desktop screenshot.",
          },
          null,
          2,
        ),
      );
      return;
    }
    const client = await CdpClient.connect(target.webSocketDebuggerUrl);
    console.log(JSON.stringify({ ok: true, mode: "desktop-smoke-cdp-ready" }, null, 2));
    try {
      await client.send("Runtime.enable");
      await waitFor(client, "document.readyState === 'interactive' || document.readyState === 'complete'");
      await clickButtonByName(client, "Browser");
      await waitFor(client, "document.querySelector('[aria-label=\"Browser address and search field\"]') instanceof HTMLInputElement", 15_000, "omnibox");
      if (qaMode === "browser-home") {
        await waitFor(client, "document.querySelector('[aria-label=\"Browser Home medallions\"]') instanceof HTMLElement", 15_000, "browser home medallions");
        await waitFor(client, "document.querySelector('[aria-label=\"Browser Home top chrome controls\"]') instanceof HTMLElement", 15_000, "browser home top chrome controls");
        const screenshot = await captureCdpScreenshot(client);
        console.log(
          JSON.stringify(
            {
              ok: true,
              appPath,
              binaryPath,
              remoteDebuggingPort: port,
              pageUrl: target.url,
              screenshot,
              proof: "Installed /Applications/CereBro.app opened the Browser Home surface and produced a renderer screenshot for the locked 1:1 reference comparison.",
            },
            null,
            2,
          ),
        );
        return;
      }
      await fillInputByLabel(client, "Browser address and search field", "example.com");
      await pressEnterInInputByLabel(client, "Browser address and search field");
      await waitFor(client, "document.querySelector('[aria-label=\"Native page viewport\"]') instanceof HTMLElement", 20_000, "native page viewport");
      await waitForNativePageTarget("https://example.com");
      const viewportBounds = await evaluate(
        client,
        `(() => {
          const viewport = document.querySelector('[aria-label="Native page viewport"]');
          if (!(viewport instanceof HTMLElement)) return null;
          const rect = viewport.getBoundingClientRect();
          const x = Math.max(0, rect.x);
          const y = Math.max(0, rect.y);
          const width = Math.max(1, Math.min(window.innerWidth, rect.right) - x);
          const height = Math.max(1, Math.min(window.innerHeight, rect.bottom) - y);
          return {
            x,
            y,
            width,
            height,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
          };
        })()`,
      ) as { x: number; y: number; width: number; height: number; innerWidth: number; innerHeight: number } | null;
      if (
        !viewportBounds ||
        viewportBounds.y > 190 ||
        viewportBounds.x < 70 ||
        viewportBounds.width < viewportBounds.innerWidth - 180 ||
        viewportBounds.height > viewportBounds.innerHeight - viewportBounds.y ||
        viewportBounds.height < viewportBounds.innerHeight * 0.58 ||
        viewportBounds.y + viewportBounds.height > viewportBounds.innerHeight - 72
      ) {
        throw new Error(`Native Browser viewport is not using the Browser mockup canvas: ${JSON.stringify(viewportBounds)}`);
      }
      await sleep(1_000);
      await clickElementByAriaLabel(client, "VPN shield");
      await waitFor(client, "document.querySelector('[aria-label=\"VPN shield\"]')?.closest('details')?.open === true", 10_000, "VPN shield menu open");
      const menuLayerProof = await evaluate(
        client,
        `(() => {
          const shield = document.querySelector('[aria-label="VPN shield"]')?.closest('details');
          const menu = shield?.querySelector('[role="menu"]');
          const viewport = document.querySelector('[aria-label="Native page viewport"]');
          if (!(shield instanceof HTMLDetailsElement) || !(menu instanceof HTMLElement) || !(viewport instanceof HTMLElement)) return null;
          const summary = shield.querySelector("summary");
          const summaryRect = summary instanceof HTMLElement ? summary.getBoundingClientRect() : null;
          const menuRect = menu.getBoundingClientRect();
          return {
            open: shield.open,
            reserveTop: Number(viewport.dataset.nativeMenuReserveTop || "0"),
            opensDownward: summaryRect ? menuRect.top >= summaryRect.bottom - 2 : false,
            menuTop: menuRect.top,
            menuBottom: menuRect.bottom,
            viewportTop: viewport.getBoundingClientRect().top
          };
        })()`,
      ) as { open: boolean; reserveTop: number; opensDownward: boolean; menuTop: number; menuBottom: number; viewportTop: number } | null;
      if (!menuLayerProof?.open || !menuLayerProof.opensDownward || menuLayerProof.reserveTop < 280) {
        throw new Error(`Browser chrome menu did not reserve native page space: ${JSON.stringify(menuLayerProof)}`);
      }
      const screenshot = await captureDesktopScreenshot(launchedPid ?? undefined);
      await clickElementByAriaLabel(client, "VPN shield");
      await waitFor(client, "document.querySelector('[aria-label=\"VPN shield\"]')?.closest('details')?.open === false", 10_000, "VPN shield menu closed");
      await clickButtonByName(client, "Add Current");
      await waitFor(client, hasButtonLabelExpression("Open bookmark"), 10_000, "bookmark medallion");
      await waitFor(client, hasButtonLabelExpression("Allow popups here"), 10_000, "popup exception control");
      await waitFor(client, hasButtonLabelExpression("Turn blocking off for this site"), 10_000, "blocking exception control");
      await waitFor(client, hasButtonLabelExpression("VPN Settings"), 10_000, "VPN settings control");
      await clearAndFillInputByLabel(client, "Browser address and search field", "example.com");
      await clickElementByAriaLabel(client, "Aang page actions");
      await clickButtonByName(client, "Explain page");
      await waitFor(client, "document.querySelector('[aria-label=\"Aang route preview\"]') instanceof HTMLElement", 10_000, "Aang current-page route preview");
      await clickButtonByName(client, "New browser tab");
      await waitFor(
        client,
        `(() => {
          const input = document.querySelector('[aria-label="Browser address and search field"]');
          return input instanceof HTMLInputElement && input.value === "";
        })()`,
        10_000,
        "new tab blank omnibox",
      );
      await clickButtonByTitle(client, "https://example.com/");
      await waitForNativePageTarget("https://example.com");
      await clickButtonByName(client, "New browser tab");
      await waitFor(
        client,
        `(() => {
          const input = document.querySelector('[aria-label="Browser address and search field"]');
          return input instanceof HTMLInputElement && input.value === "";
        })()`,
        10_000,
        "second new tab blank omnibox",
      );
      await fillInputByLabel(client, "Browser address and search field", "cerebro browser smoke");
      await clickButtonByName(client, "Open page in CereBro");
      await waitFor(
        client,
        `(() => {
          const input = document.querySelector('[aria-label="Browser address and search field"]');
          return input instanceof HTMLInputElement && input.value.includes("search.brave.com");
        })()`,
        20_000,
        "default search route",
      );

      console.log(
        JSON.stringify(
          {
            ok: true,
            appPath,
            binaryPath,
            remoteDebuggingPort: port,
            pageUrl: target.url,
            screenshot,
            menuLayerProof,
            proof: "Installed /Applications/CereBro.app opened a typed URL with Enter, opened the VPN Shield menu downward over a real native page while reserving native page bounds, saved the current page as a bookmark, closed the VPN Shield menu, proved the URL bar still accepts input, staged an Aang current-page route preview, opened that bookmark from a new tab, created another tab, and routed a search query.",
          },
          null,
          2,
        ),
      );
    } finally {
      client.close();
    }
  } finally {
    await execFileAsync("pkill", ["-f", binaryPath]).catch(() => undefined);
    await waitForNoMainProcess().catch(() => undefined);
    if (hadExistingApp && reopenExisting) {
      await execFileAsync("open", [appPath]).catch(() => undefined);
    }
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
