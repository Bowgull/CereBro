import { execFile, execFileSync, spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import WebSocket from "ws";

const execFileAsync = promisify(execFile);

const appPath = process.env.CEREBRO_DESKTOP_APP_PATH ?? "/Applications/CereBro.app";
const appName = process.env.CEREBRO_DESKTOP_APP_NAME ?? "CereBro";
const binaryPath = `${appPath}/Contents/MacOS/CereBro`;
const port = Number(process.env.CEREBRO_DESKTOP_QA_PORT ?? "9333");
const closeExisting = process.env.CEREBRO_DESKTOP_QA_CLOSE_EXISTING === "1";
const reopenExisting = process.env.CEREBRO_DESKTOP_QA_REOPEN_EXISTING !== "0";
const screenshotPath = resolve(process.cwd(), "output/qa/cerebro-installed-browser-smoke.png");

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
  await execFileAsync("osascript", ["-e", `quit app "${appName}"`]).catch(() => undefined);
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

async function waitForAppPageTarget(child: ChildProcessWithoutNullStreams) {
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

    if (child.exitCode !== null) throw new Error(`CereBro exited before opening a debuggable page, code ${child.exitCode}`);
    await sleep(250);
  }

  throw new Error("CereBro opened, but no app page target was visible over remote debugging");
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
      const socket = new WebSocket(url);
      socket.once("open", () => resolvePromise(new CdpClient(socket)));
      socket.once("error", (error) => reject(error));
    });
  }

  send(method: string, params: Record<string, unknown> = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise<unknown>((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject });
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

async function captureDesktopScreenshot() {
  await mkdir(resolve(process.cwd(), "output/qa"), { recursive: true });
  await execFileAsync("osascript", ["-e", `tell application "${appName}" to activate`]).catch(() => undefined);
  await sleep(750);
  await execFileAsync("screencapture", ["-x", screenshotPath]);
  return screenshotPath;
}

function hasButtonLabelExpression(label: string) {
  return `Array.from(document.querySelectorAll("button,[role='button']")).some((element) => ((element.getAttribute("aria-label") || element.textContent || "").trim()).includes(${JSON.stringify(label)}))`;
}

async function run() {
  if (!existsSync(binaryPath)) {
    throw new Error(`Installed CereBro binary not found at ${binaryPath}`);
  }

  const existingPids = mainProcessPids();
  const hadExistingApp = existingPids.length > 0;
  if (hadExistingApp && !closeExisting) {
    throw new Error(`CereBro is already running from ${binaryPath}. Set CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 to test one installed app instance.`);
  }

  if (hadExistingApp) {
    await quitExistingApp();
  }

  const child = spawn(binaryPath, [`--remote-debugging-port=${port}`], {
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
    stdio: "pipe",
  });

  try {
    const target = await waitForAppPageTarget(child);
    const client = await CdpClient.connect(target.webSocketDebuggerUrl);
    try {
      await client.send("Runtime.enable");
      await waitFor(client, "document.readyState === 'interactive' || document.readyState === 'complete'");
      await clickButtonByName(client, "Browser");
      await waitFor(client, "document.querySelector('[aria-label=\"Browser address and search field\"]') instanceof HTMLInputElement", 15_000, "omnibox");
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
      const screenshot = await captureDesktopScreenshot();
      await clickButtonByName(client, "Add Current");
      await waitFor(client, hasButtonLabelExpression("Open bookmark"), 10_000, "bookmark medallion");
      await waitFor(client, hasButtonLabelExpression("Allow popups here"), 10_000, "popup exception control");
      await waitFor(client, hasButtonLabelExpression("Turn blocking off for this site"), 10_000, "blocking exception control");
      await waitFor(client, hasButtonLabelExpression("VPN Settings"), 10_000, "VPN settings control");
      await clickElementByAriaLabel(client, "VPN shield");
      await waitFor(client, "document.querySelector('[aria-label=\"VPN shield\"]')?.closest('details')?.open === true", 10_000, "VPN shield menu open");
      await clickElementByAriaLabel(client, "VPN shield");
      await waitFor(client, "document.querySelector('[aria-label=\"VPN shield\"]')?.closest('details')?.open === false", 10_000, "VPN shield menu closed");
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
            proof: "Installed /Applications/CereBro.app opened a typed URL with Enter, saved the current page as a bookmark, opened and closed the VPN Shield menu, proved the URL bar still accepts input, staged an Aang current-page route preview, opened that bookmark from a new tab, created another tab, and routed a search query.",
          },
          null,
          2,
        ),
      );
    } finally {
      client.close();
    }
  } finally {
    child.kill();
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
