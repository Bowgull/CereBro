# CereBro Native Browser Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real native CereBro browser shell without breaking the current Browser command surface.

**Architecture:** Keep the current React and Express app as the command surface. Add a separate Electron shell that opens the local CereBro app and owns real web page views with `WebContentsView`. Browser state still flows through existing CereBro routes first, then native page events write back through narrow local IPC.

**Tech Stack:** Electron, React, Vite, Express, tRPC, local SQLite, Vitest.

---

## Decision

Use Electron first.

Electron is the best fit because CereBro needs real Chromium page rendering, popup control, session partitions, cookie/cache controls, download interception, permission prompts, and future ad/tracker blocking. Tauri is lighter, but its webview differs by OS. Lightpanda is headless and belongs in a later worker lane, not the human day-to-day browser.

Sources checked:

- Electron `webContents`: https://www.electronjs.org/docs/latest/api/web-contents
- Electron `session`: https://www.electronjs.org/docs/latest/api/session
- Tauri webview versions: https://v2.tauri.app/reference/webview-versions/
- Lightpanda browser: https://github.com/lightpanda-io/browser
- Ghostery adblocker: https://github.com/ghostery/adblocker
- Brave adblock-rust: https://github.com/brave/adblock-rust

## File Structure

- Create `app/electron/main.ts`: native app bootstrap, local app loading, page view ownership.
- Create `app/electron/preload.ts`: narrow typed bridge for Browser commands.
- Create `app/electron/browserSession.ts`: Electron session partition policy.
- Create `app/electron/browserPermissions.ts`: popups, downloads, permissions, external-open policy.
- Create `app/electron/browserViews.ts`: tab/page view lifecycle.
- Create `app/electron/browserEvents.ts`: navigation, title, favicon, load failure, and history event mapping.
- Create `app/server/nativeBrowserContract.test.ts`: contract tests for native shell event payloads.
- Modify `app/package.json`: add Electron scripts only after the first native files exist.
- Modify `app/client/src/components/BrowserPanel.tsx`: add a hidden capability check so the same Browser UI can call native shell methods when present.

## Task 1: Lock Native Browser Contracts

- [x] Create `app/shared/nativeBrowser.ts`.

```ts
export type NativeBrowserOpenRequest = {
  tabId: string;
  targetUrl: string;
  userInitiated: true;
};

export type NativeBrowserOpenResult = {
  ok: boolean;
  tabId: string;
  currentUrl: string | null;
  title: string | null;
  blockedReason: "permission" | "invalid_url" | "navigation_failed" | null;
};

export type NativeBrowserPageEvent =
  | { type: "navigation-started"; tabId: string; url: string; at: string }
  | { type: "navigation-finished"; tabId: string; url: string; title: string | null; at: string }
  | { type: "navigation-failed"; tabId: string; url: string; errorCode: number; errorDescription: string; at: string }
  | { type: "title-updated"; tabId: string; title: string; at: string };
```

- [x] Add `app/server/nativeBrowserContract.test.ts`.

```ts
import { describe, expect, it } from "vitest";
import type { NativeBrowserOpenRequest, NativeBrowserPageEvent } from "../shared/nativeBrowser";

describe("native browser contract", () => {
  it("keeps open requests user initiated", () => {
    const request: NativeBrowserOpenRequest = {
      tabId: "tab_1",
      targetUrl: "https://example.com",
      userInitiated: true,
    };

    expect(request.userInitiated).toBe(true);
  });

  it("keeps page events narrow", () => {
    const event: NativeBrowserPageEvent = {
      type: "navigation-finished",
      tabId: "tab_1",
      url: "https://example.com",
      title: "Example",
      at: "2026-06-03T23:00:00.000Z",
    };

    expect(Object.keys(event).sort()).toEqual(["at", "tabId", "title", "type", "url"]);
  });
});
```

- [x] Run `pnpm --dir app exec vitest run server/nativeBrowserContract.test.ts`.

Expected: pass.

## Task 2: Add Electron Shell Without Browser Power

- [x] Install only the local desktop dependency after approval for this slice: `pnpm --dir app add -D electron`.
- [x] Create `app/electron/main.ts` that opens the existing local CereBro URL and does not create web page views yet.
- [x] Add scripts:

```json
{
  "desktop:build": "esbuild electron/main.ts --platform=node --packages=external --bundle --format=esm --outfile=dist-electron/main.mjs",
  "desktop:dev": "pnpm run desktop:build && ELECTRON_START_URL=http://localhost:3000 electron dist-electron/main.mjs"
}
```

- [x] Run the app server and Electron shell together.
- [x] Verify the existing CereBro app opens in the native shell.

## Task 3: Add One Real Page View

- [x] Add `browserViews.ts` with one `WebContentsView`.
- [x] Add popup blocking through `setWindowOpenHandler`.
- [x] Add download blocking through Electron `session` events.
- [x] Add permission denial by default.
- [x] Add page load events mapped to `NativeBrowserPageEvent`.
- [x] Keep the current iframe path as fallback until the native shell is proven.

## Task 4: Add Privacy Defaults

- [x] Add preload bridge for `window.cerebroNativeBrowser.openPage`.
- [x] Add main-process IPC handler for one user-initiated open command.
- [x] Validate native open commands as user-initiated `http` or `https` only.
- [x] Wire BrowserPanel to call the bridge when Electron provides it.

- [ ] Default to in-memory session partitions for normal browsing until trusted-site profiles exist.
- [ ] Add trusted-site persistent partitions later.
- [ ] Add forget-site action before broad privacy modes.
- [ ] Add Ghostery adblocker-electron first only after native navigation is stable.
- [ ] Revisit Brave `adblock-rust` only if Electron-side blocking is too slow or too limited.

## Task 5: Replace Outside Open

- [ ] When native shell is available, page opens must use the native page view.
- [ ] Outside open stays optional and off the main path.
- [ ] Sites that fail to render show a normal browser error state.
- [ ] No fake success state.

## Test Plan

- `pnpm --dir app exec vitest run server/nativeBrowserContract.test.ts`
- `pnpm --dir app exec vitest run server/browserActionProposalRouter.test.ts`
- `pnpm --dir app run check`
- `pnpm --dir app run build`
- Manual desktop proof: open `https://example.com`, block a popup test page, block a download, reload, close tab.

## Do Not Build

- No CAPTCHA bypass.
- No login bypass.
- No scraping abuse.
- No stealth or anti-detection work.
- No proxy rotation.
- No hidden automation.
- No paid service.
