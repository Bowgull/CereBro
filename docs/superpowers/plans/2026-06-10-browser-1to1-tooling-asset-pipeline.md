# Browser 1:1 Tooling And Asset Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build CereBro Browser toward the locked Browser Home mockup without paid tools, guesswork, or app-icon drift.

**Architecture:** The locked Browser Home PNG is the visual source of truth. Codex implements and verifies the app. Free pixel and image tools support asset cleanup. Playwright and image diffs measure progress against the mockup and installed app screenshots.

**Tech Stack:** Electron, React, Tailwind, Playwright screenshots, local image diff tooling, existing Keep sprites, Piskel or LibreSprite for pixel edits, PixelLab only if already available without new spend.

**Brand-system escalation:** This plan is now paired with
`docs/superpowers/plans/2026-06-10-cerebro-brand-ai-outsourcing-plan.md`.
The Browser mockup is the CereBro brand source, not a background image. If Codex
cannot reliably translate it to real components, use free/no-card external
visual AI to extract structure and assets before coding more UI by hand.

---

## Non-Negotiables

- No money by default.
- No free trials that need a card.
- No paid fallback.
- No paid image, design, model, or asset service unless the user explicitly overrides this rule in the current session.
- The exact Browser Home reference is:
  `mockups/approved/browser-home-symmetric-rails-target-v1.png`
- Locked reference SHA-256:
  `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`
- Do not use the app icon as a Browser UI reference.
- Do not call a near match `1:1`.
- Aang and other agent dock assets must match the existing Keep sprite family: small pixel character language, almost 8-bit but slightly more upscale.

## Current Inputs

- Locked Browser Home mockup:
  `mockups/approved/browser-home-symmetric-rails-target-v1.png`
- Browser Home lock note:
  `mockups/approved/BROWSER_HOME_1TO1_LOCK.md`
- Current installed Browser Home screenshot:
  `app/output/qa/cerebro-installed-browser-home-smoke.png`
- Current loaded Browser screenshot:
  `app/output/qa/cerebro-installed-browser-smoke.png`
- Browser implementation:
  `app/client/src/components/BrowserPanel.tsx`
- Installed-app QA runner:
  `app/scripts/desktopInstalledSmoke.ts`
- Existing Keep agent sprites:
  `app/client/public/sprites/keep/*/rotations/*.png`

## Tool Matrix

### Free Default Tools

- **Codex:** repo edits, Electron integration, tests, packaging, installed-app QA.
- **Playwright:** browser-state screenshot capture and visual comparisons.
- **PixelLab:** allowed only if already available with no new charge. Use for pixel-sprite generation and cleanup.
- **Piskel:** free sprite editing for small pixel agents and icon cleanup.
- **LibreSprite:** open-source sprite editing if a desktop editor is better than Piskel.
- **GIMP or Krita:** free raster cleanup, crop, transparency, palette cleanup, and slicing.
- **sharp:** already available in the app dependency tree. Use for deterministic local resizing, cropping, contact sheets, and PNG processing.

### Allowed Only Through Free / No-Card Access Or User-Provided Output

- Gemini Flash Image / Nano Banana.
- OpenAI image generation or image editing APIs.
- Claude, ChatGPT, DeepSeek, Qwen, Gemma cloud calls for paid model work.
- v0, Magic Patterns, or paid screenshot-to-code services.
- Aseprite purchase.
- Paid stock assets, paid icon packs, paid texture packs.

These are blocked if they require money, a card, or a trial. They are allowed as
manual research or asset helpers when the user provides free outputs or the tool
has a free/no-card path.

### Research-Only Or Optional

- `screenshot-to-code`: useful for structural drafts, not trusted for production 1:1.
- Local ComfyUI / SDXL / Flux: optional experiments only on this 8 GB M2. Do not make it the main path.
- Qwen, DeepSeek, Gemma local models: useful for code reasoning experiments, not a primary visual 1:1 tool.

## Definition Of 1:1 Progress

Progress is accepted only when all of these are true:

- The installed app screenshot is captured from `/Applications/CereBro.app`.
- The screenshot is compared against the locked Browser Home mockup.
- The diff is reviewed visually.
- Functional browser checks still pass.
- Any visual mismatch is named directly in the handoff.

## Files

- Create: `docs/superpowers/plans/2026-06-10-browser-1to1-tooling-asset-pipeline.md`
- Modify later: `app/scripts/desktopInstalledSmoke.ts`
- Modify later: `app/client/src/components/BrowserPanel.tsx`
- Create later: `app/scripts/browserHomeVisualDiff.ts`
- Create later: `app/output/qa/browser-home-diff/`

### Task 1: Lock The Tooling Contract

**Files:**
- Create: `docs/superpowers/plans/2026-06-10-browser-1to1-tooling-asset-pipeline.md`

- [ ] **Step 1: Confirm the locked mockup exists**

Run:

```bash
test -f mockups/approved/browser-home-symmetric-rails-target-v1.png
```

Expected: exit code 0.

- [ ] **Step 2: Confirm the locked hash**

Run:

```bash
shasum -a 256 mockups/approved/browser-home-symmetric-rails-target-v1.png
```

Expected output starts with:

```text
f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c
```

- [ ] **Step 3: Keep the no-money rule visible**

Read this file before recommending any new generator, model, asset source, or UI tool.

```bash
sed -n '1,180p' docs/superpowers/plans/2026-06-10-browser-1to1-tooling-asset-pipeline.md
```

Expected: the `Non-Negotiables` section is present and says no money by default.

- [ ] **Step 4: Commit the tooling contract**

```bash
git add docs/superpowers/plans/2026-06-10-browser-1to1-tooling-asset-pipeline.md
git commit -m "docs: lock browser 1to1 tooling pipeline"
```

### Task 2: Add Browser Home Visual Diff

**Files:**
- Create: `app/scripts/browserHomeVisualDiff.ts`
- Modify: `app/package.json`

- [ ] **Step 1: Add image diff dependencies only if absent**

Check first:

```bash
pnpm --dir app list pixelmatch pngjs
```

If either package is missing, install local dev dependencies:

```bash
pnpm --dir app add -D pixelmatch pngjs @types/pixelmatch @types/pngjs
```

Expected: packages are recorded in `app/package.json` and `app/pnpm-lock.yaml`.

- [ ] **Step 2: Create the visual diff script**

Create `app/scripts/browserHomeVisualDiff.ts` with this behavior:

```ts
import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "..");
const expectedPath = path.join(repoRoot, "mockups/approved/browser-home-symmetric-rails-target-v1.png");
const actualPath = path.join(appRoot, "output/qa/cerebro-installed-browser-home-smoke.png");
const outputDir = path.join(appRoot, "output/qa/browser-home-diff");
const diffPath = path.join(outputDir, "browser-home-diff.png");

if (!fs.existsSync(expectedPath)) throw new Error(`Missing expected mockup: ${expectedPath}`);
if (!fs.existsSync(actualPath)) throw new Error(`Missing actual screenshot: ${actualPath}`);

fs.mkdirSync(outputDir, { recursive: true });

const expected = PNG.sync.read(fs.readFileSync(expectedPath));
const actualSource = PNG.sync.read(fs.readFileSync(actualPath));
const actual = new PNG({ width: expected.width, height: expected.height });

PNG.bitblt(actualSource, actual, 0, 0, Math.min(actualSource.width, expected.width), Math.min(actualSource.height, expected.height), 0, 0);

const diff = new PNG({ width: expected.width, height: expected.height });
const mismatchedPixels = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
  threshold: 0.12,
  includeAA: true,
});

fs.writeFileSync(diffPath, PNG.sync.write(diff));

const totalPixels = expected.width * expected.height;
const mismatchRatio = mismatchedPixels / totalPixels;
const summary = {
  expectedPath,
  actualPath,
  diffPath,
  expectedSize: `${expected.width}x${expected.height}`,
  actualSourceSize: `${actualSource.width}x${actualSource.height}`,
  mismatchedPixels,
  mismatchRatio,
};

console.log(JSON.stringify(summary, null, 2));
```

- [ ] **Step 3: Add package script**

In `app/package.json`, add:

```json
"qa:browser-home-diff": "tsx scripts/browserHomeVisualDiff.ts"
```

- [ ] **Step 4: Run against the current installed screenshot**

Run:

```bash
pnpm --dir app run qa:browser-home-diff
```

Expected: JSON output with `diffPath` under `app/output/qa/browser-home-diff/browser-home-diff.png`.

- [ ] **Step 5: Commit visual diff tooling**

```bash
git add app/package.json app/pnpm-lock.yaml app/scripts/browserHomeVisualDiff.ts
git commit -m "test: add browser home visual diff"
```

### Task 3: Capture Fixed Browser States

**Files:**
- Modify: `app/scripts/desktopInstalledSmoke.ts`

- [ ] **Step 1: Add QA modes**

Add explicit modes:

```ts
type DesktopQaMode =
  | "launch"
  | "browser-home"
  | "browser-loaded"
  | "browser-home-bookmarks-edit"
  | "browser-home-aang-open"
  | "browser-loaded-shield-menu"
  | "browser-loaded-aang-menu";
```

- [ ] **Step 2: Map mode to screenshot filename**

Use stable file names:

```ts
const screenshotByMode: Record<DesktopQaMode, string> = {
  launch: "cerebro-installed-launch-smoke.png",
  "browser-home": "cerebro-installed-browser-home-smoke.png",
  "browser-loaded": "cerebro-installed-browser-smoke.png",
  "browser-home-bookmarks-edit": "cerebro-installed-browser-home-bookmarks-edit.png",
  "browser-home-aang-open": "cerebro-installed-browser-home-aang-open.png",
  "browser-loaded-shield-menu": "cerebro-installed-browser-loaded-shield-menu.png",
  "browser-loaded-aang-menu": "cerebro-installed-browser-loaded-aang-menu.png",
};
```

- [ ] **Step 3: Add selectors only after UI labels exist**

Use accessible labels already present in the UI:

```ts
await page.getByLabel("Browser Home medallions").waitFor({ timeout: 20_000 });
```

For modes whose labels do not exist yet, fail with a clear error rather than silently clicking coordinates.

- [ ] **Step 4: Run each stable mode**

Run:

```bash
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
```

Expected: `app/output/qa/cerebro-installed-browser-home-smoke.png`.

- [ ] **Step 5: Commit QA state capture**

```bash
git add app/scripts/desktopInstalledSmoke.ts
git commit -m "test: capture fixed browser qa states"
```

### Task 4: Build The Free Asset Kit

**Files:**
- Create: `app/client/public/browser-home/assets/README.md`
- Create later: `app/client/public/browser-home/assets/*.png`

- [ ] **Step 1: Create asset kit readme**

Create `app/client/public/browser-home/assets/README.md`:

```md
# Browser Home Asset Kit

This folder holds Browser Home 1:1 assets derived from the locked Browser Home mockup or from existing CereBro Keep sprites.

No paid assets. No app-icon-derived Browser UI assets.

Allowed sources:

- `mockups/approved/browser-home-symmetric-rails-target-v1.png`
- `app/client/public/sprites/keep/*/rotations/*.png`
- free local edits made in Piskel, LibreSprite, GIMP, Krita, or PixelLab if already available without new spend

Asset targets:

- frame corners
- top URL rail treatments
- side rail plaques
- bookmark medallion bases
- pinned-card borders
- center compass and rune field
- bottom Aang dock frame
- agent dock sprite variants
```

- [ ] **Step 2: Generate a Keep agent contact sheet**

Run the existing local `sharp` contact sheet flow or create a small script if this becomes repeated.

Expected output:

```text
app/output/qa/keep-agent-south-contact-sheet.png
```

- [ ] **Step 3: Commit the asset kit manifest**

```bash
git add app/client/public/browser-home/assets/README.md
git commit -m "docs: add browser home asset kit manifest"
```

### Task 5: Use The Pipeline Before Each Browser UI Slice

**Files:**
- Modify per slice: `app/client/src/components/BrowserPanel.tsx`
- Read every slice: `docs/superpowers/plans/2026-06-10-browser-1to1-tooling-asset-pipeline.md`
- Read every slice: `mockups/approved/BROWSER_HOME_1TO1_LOCK.md`

- [ ] **Step 1: Open the locked mockup**

Use visual inspection before editing:

```bash
open mockups/approved/browser-home-symmetric-rails-target-v1.png
```

In Codex, also use the image viewer when available.

- [ ] **Step 2: Open the current installed screenshot**

```bash
open app/output/qa/cerebro-installed-browser-home-smoke.png
```

- [ ] **Step 3: Name the visual gap before editing**

Write one sentence in the session update:

```text
This slice targets <specific mismatch>, measured against the locked Browser Home mockup.
```

- [ ] **Step 4: Edit only that mismatch**

Keep the change bounded. Do not mix browser behavior, model planning, and visual chrome in one commit unless the user explicitly asks.

- [ ] **Step 5: Reinstall and QA**

Run:

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff
```

Expected:

- Typecheck passes.
- Desktop package succeeds.
- `/Applications/CereBro.app` is reinstalled.
- Browser Home screenshot is refreshed.
- Diff image is refreshed.

## Self-Review

- Spec coverage: no-money default, locked mockup, agent sprite direction, free tooling, optional paid tooling, screenshot diff, installed-app QA, and asset kit are all covered.
- Placeholder scan: no `TBD`, no `TODO`, no undefined future placeholders.
- Type consistency: the QA mode names are exact string unions and match the screenshot map.

## Stance

The most powerful path for this machine is not another cloud model. It is a disciplined local pipeline: locked mockup, free asset cleanup, Codex implementation, installed-app screenshots, and image diffs. Paid image tools can help later, but they are not part of the default plan.
