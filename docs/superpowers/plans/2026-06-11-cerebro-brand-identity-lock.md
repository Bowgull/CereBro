# CereBro Brand Identity Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the entire CereBro app inherit the approved Browser Home mockup as its production UI/UX brand system, using real frontend components instead of full-screen screenshot layers.

**Architecture:** Treat the locked mockup as the visual constitution. Extract tokens and reusable primitives first, then replace Browser Home and every CereBro panel with those primitives. Raster assets are allowed only for texture, painterly icon art, and illustrated character art.

**Tech Stack:** React, TypeScript, Tailwind, CSS variables, SVG primitives, installed Electron app QA, screenshot diff QA.

---

## Non-Negotiable End State

CereBro must look like the approved Browser Home mockup across the whole app:

- Same dark stone and brass material language.
- Same green rail treatment.
- Same beveled borders and inner shadows.
- Same compact fantasy-browser controls.
- Same tab, omnibox, medallion, panel, card, dock, and status language.
- Same Aang dock family, but with a cleaner pixel-sprite Aang if the current asset is too detailed.
- Same density and layout discipline.

This cannot be solved by pasting the full mockup image into production and placing invisible click targets over it.

## Long-Term Build Decision

Default path:

1. Codex builds the local brand system first: tokens, primitives, SVG/CSS ornament geometry, real component states, and installed-app QA.
2. Free external tools are used as reference checks, not production blockers.
3. No paid tools, no card-backed trials, no paid asset services, and no paid fallback are allowed unless the user explicitly changes the rule.
4. Raster cutouts stay temporary reference material until replaced by CSS, SVG, or real component structure.
5. Raster textures remain allowed only where texture is the correct medium.

Reason:

The long-term app needs maintainable UI primitives that can cover every CereBro surface. A screenshot-to-UI shortcut may look close for one screen, but it will break when Browser, Keep, Workshop, Ledger, Basement, settings, menus, and loaded-page chrome need consistent behavior.

Correct medium rules:

- CSS and tokens for colors, shadows, bevels, borders, spacing, states.
- React components for rail, tab, button, panel, medallion, card, dock, omnibox, menus.
- SVG or CSS for scalable ornaments, corners, divider glyphs, compass geometry, and frame marks.
- PNG or WebP only for stone grain, brass wear, painterly medallion art, illustrated Aang, and other texture or illustration sources.

## Open Questions Before Execution

Answer these before Task 5 if possible. Work can start before answers, but these decide how far the first global pass goes.

1. Should the whole app use the Browser mockup layout language immediately, including Keep, Workshop, Ledger, Basement, settings, and error states?
2. Should the global left rail stay tall and ornate exactly like the mockup on every route, or should some dense workbench panels use a compact rail variant?
3. Do we keep the current Aang pixel sprite as the V1 asset, or generate a new lower-detail pixel Aang before locking the dock?
4. Is the approved Browser Home mockup the only locked source, or should loaded-page browser chrome also get its own locked mockup before global rollout?
5. Should external tools be used after the first local primitive pass for measurement review and asset critique?

## File Structure

Create:

- `app/client/src/styles/cerebroTheme.css`
  - CSS variables for the locked CereBro brand.
- `app/client/src/lib/cerebroTheme.ts`
  - TypeScript token map for components that need inline style objects.
- `app/client/src/components/cerebro-ui/CereBroFrame.tsx`
  - Main frame, inset borders, corner ornaments, background fields.
- `app/client/src/components/cerebro-ui/CereBroRail.tsx`
  - Global rail with Keep, Browser, Workshop, Ledger, Basement.
- `app/client/src/components/cerebro-ui/CereBroButton.tsx`
  - Icon buttons, plaque buttons, danger buttons, primary green action.
- `app/client/src/components/cerebro-ui/CereBroTab.tsx`
  - Browser tab and generic app tab primitive.
- `app/client/src/components/cerebro-ui/CereBroOmnibox.tsx`
  - Address/search input primitive.
- `app/client/src/components/cerebro-ui/CereBroMedallion.tsx`
  - Round pinned bookmark and agent medallion primitive.
- `app/client/src/components/cerebro-ui/CereBroCard.tsx`
  - Bookmark card and repeated item card primitive.
- `app/client/src/components/cerebro-ui/CereBroPanel.tsx`
  - Ornate panel frame for content sections.
- `app/client/src/components/cerebro-ui/CereBroDock.tsx`
  - Bottom Aang dock primitive.
- `app/client/src/components/cerebro-ui/CereBroOrnaments.tsx`
  - SVG/CSS corners, divider spears, compass marks, etched lines.
- `app/client/src/components/cerebro-ui/index.ts`
  - Public exports for the primitive kit.
- `app/client/src/components/cerebro-ui/__tests__/cerebroTheme.test.ts`
  - Token and primitive contract tests.
- `docs/design/cerebro-brand-system.md`
  - Human-readable brand system extracted from the mockup.
- `docs/design/cerebro-brand-rollout.md`
  - Route-by-route rollout tracking.

Modify:

- `app/client/src/index.css`
  - Import brand CSS and set app-level base variables.
- `app/client/src/lib/keepConfig.ts`
  - Reconcile old `cerebroColors` and `cerebroTheme` with the new locked tokens.
- `app/client/src/pages/Home.tsx`
  - Replace route rail and shell decoration with `CereBroRail` and `CereBroFrame`.
- `app/client/src/components/BrowserPanel.tsx`
  - Replace local `browserFrame`, Browser Home asset stage, tabs, omnibox, panels, medallions, and dock with primitives.
- High-priority panels:
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/client/src/components/ConfigPanel.tsx`
  - `app/client/src/components/ModelToolsPanel.tsx`
  - `app/client/src/components/MemoryPanel.tsx`
  - `app/client/src/components/SessionsPanel.tsx`
  - `app/client/src/components/ArtifactsPanel.tsx`
  - `app/client/src/components/SecurityGatePanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/client/src/components/TasksPanel.tsx`

Use existing:

- `mockups/approved/browser-home-symmetric-rails-target-v1.png`
- `mockups/approved/BROWSER_HOME_1TO1_LOCK.md`
- `app/client/public/browser-home/assets/`
- `app/output/qa/cerebro-installed-browser-home-smoke.png`
- `app/output/qa/browser-home-diff/browser-home-diff.png`
- `scripts/desktopInstalledSmoke.ts`
- `scripts/browserHomeVisualDiff.ts`

## Brand Rules

Do:

- Use the mockup as the visual source of truth.
- Measure before changing layout.
- Keep click targets real and visible to accessibility tools.
- Keep the Browser as a usable browser, not a decorative shell.
- Run installed-app screenshots for visible changes.
- Commit after each route or primitive cluster.

Do not:

- Use full-screen mockup images as production UI.
- Duplicate the sidebar inside Browser panel content.
- Hide real DOM under `opacity-0` as the real surface.
- Keep one-off `style={{ ... }}` brand values scattered through panels.
- Ship loaded-page chrome that reverts to the old visual language.
- Call the result exact 1:1 until visual diff and manual inspection agree.

## Task 1: Lock The Brand Source And QA Gates

**Files:**

- Modify: `docs/design/cerebro-brand-system.md`
- Modify: `docs/design/cerebro-brand-rollout.md`
- Modify: `app/client/public/browser-home/assets/README.md`

- [ ] **Step 1: Create the brand-system doc**

Create `docs/design/cerebro-brand-system.md` with this structure:

```markdown
# CereBro Brand System

Source of truth:

- `mockups/approved/browser-home-symmetric-rails-target-v1.png`
- SHA-256: `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

## Rule

The Browser Home mockup defines CereBro's global UI identity.

Use CSS, SVG, and React components for structure.
Use raster assets only for texture and illustration.

## Materials

- Obsidian stone: dark green-black field with low contrast radial etching.
- Aged brass: borders, bevels, controls, ornament strokes.
- Protected green: active rail, shield, allowed state, browser-safe status.
- Warm parchment type: labels, titles, panel headings.

## Components

- Rail
- Frame
- Tab
- Omnibox
- Icon button
- Shield button
- Medallion
- Bookmark card
- Panel
- Aang dock
- Menu
- Status chip

## QA

Every brand slice must run:

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/desktopInstalledSmoke.test.ts server/browserNativeBridgeSurface.test.ts server/browserActionProposalRouter.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff
```
```

- [ ] **Step 2: Create rollout tracker**

Create `docs/design/cerebro-brand-rollout.md`:

```markdown
# CereBro Brand Rollout

## Status Key

- `not-started`
- `tokenized`
- `primitive-backed`
- `installed-qa`
- `locked`

## Surfaces

| Surface | Status | Notes |
| --- | --- | --- |
| Global shell rail | primitive-backed | Uses rail assets. Needs SVG/CSS rail variant. |
| Browser Home | primitive-backed | Uses composed assets and real DOM. Needs backplate and medallion rail pass. |
| Loaded browser chrome | not-started | Must stop reverting to old language. |
| Aang dock | primitive-backed | Uses raster dock. Needs dock primitive. |
| Workbench | not-started | High priority. |
| Keep | not-started | Must inherit rail and frame. |
| Workshop | not-started | Must inherit panel/card primitives. |
| Ledger | not-started | Must inherit table/list primitives. |
| Basement | not-started | Must inherit safety panel primitives. |
| Settings | not-started | Must inherit form primitives. |
| Empty/error/loading states | not-started | Must be branded, not shadcn defaults. |

## Current Locked Reference

- Browser Home: `mockups/approved/browser-home-symmetric-rails-target-v1.png`
```

- [ ] **Step 3: Run verification**

Run:

```bash
test -f docs/design/cerebro-brand-system.md
test -f docs/design/cerebro-brand-rollout.md
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/design/cerebro-brand-system.md docs/design/cerebro-brand-rollout.md app/client/public/browser-home/assets/README.md
git commit -m "docs: lock cerebro brand system source"
```

## Task 2: Extract Tokens Into A Real Theme Layer

**Files:**

- Create: `app/client/src/styles/cerebroTheme.css`
- Create: `app/client/src/lib/cerebroTheme.ts`
- Modify: `app/client/src/index.css`
- Modify: `app/client/src/lib/keepConfig.ts`
- Test: `app/client/src/components/cerebro-ui/__tests__/cerebroTheme.test.ts`

- [ ] **Step 1: Add CSS tokens**

Create `app/client/src/styles/cerebroTheme.css`:

```css
:root {
  --cb-ink-950: #020505;
  --cb-ink-900: #050908;
  --cb-ink-850: #07100e;
  --cb-ink-800: #0a1714;
  --cb-green-900: #08241d;
  --cb-green-800: #103b2f;
  --cb-green-600: #6cae74;
  --cb-gold-700: #8f6330;
  --cb-gold-500: #c69b55;
  --cb-gold-300: #e6c284;
  --cb-parchment-200: #ead7ad;
  --cb-parchment-300: #d2aa69;
  --cb-muted-500: #8c8a7e;
  --cb-danger-500: #d56b52;
  --cb-line-brass: rgba(198, 155, 85, 0.42);
  --cb-line-brass-soft: rgba(198, 155, 85, 0.22);
  --cb-line-green-soft: rgba(77, 170, 154, 0.24);
  --cb-shadow-shell: 0 24px 70px rgba(0, 0, 0, 0.52);
  --cb-shadow-bevel: inset 0 1px 0 rgba(244, 239, 227, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.68);
  --cb-radius-frame: 4px;
  --cb-radius-control: 6px;
  --cb-font-display: Georgia, "Times New Roman", serif;
  --cb-font-ui: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --cb-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.cerebro-brand-root {
  color: var(--cb-parchment-200);
  background: var(--cb-ink-950);
}
```

- [ ] **Step 2: Add TypeScript token map**

Create `app/client/src/lib/cerebroTheme.ts`:

```ts
export const cerebroBrand = {
  color: {
    ink950: "#020505",
    ink900: "#050908",
    ink850: "#07100e",
    ink800: "#0a1714",
    green900: "#08241d",
    green800: "#103b2f",
    green600: "#6cae74",
    gold700: "#8f6330",
    gold500: "#c69b55",
    gold300: "#e6c284",
    parchment200: "#ead7ad",
    parchment300: "#d2aa69",
    muted500: "#8c8a7e",
    danger500: "#d56b52",
  },
  line: {
    brass: "rgba(198, 155, 85, 0.42)",
    brassSoft: "rgba(198, 155, 85, 0.22)",
    greenSoft: "rgba(77, 170, 154, 0.24)",
  },
  surface: {
    shell: "radial-gradient(circle at 50% 0%, rgba(198, 155, 85, 0.16), transparent 20%), linear-gradient(145deg, rgba(12, 15, 14, 0.99), rgba(3, 7, 7, 0.99))",
    address: "linear-gradient(180deg, rgba(2, 7, 7, 0.98), rgba(8, 15, 14, 0.98))",
    plaque: "linear-gradient(180deg, rgba(42, 46, 38, 0.96), rgba(8, 18, 16, 0.98))",
    plaqueActive: "linear-gradient(180deg, rgba(48, 71, 59, 0.98), rgba(12, 30, 26, 0.98))",
    page: "radial-gradient(circle at 50% 0%, rgba(77, 170, 154, 0.08), transparent 32%), repeating-linear-gradient(0deg, rgba(244, 239, 227, 0.018) 0 1px, transparent 1px 4px), linear-gradient(180deg, rgba(6, 10, 11, 0.99), rgba(2, 5, 6, 0.99))",
  },
  shadow: {
    shell: "0 24px 70px rgba(0, 0, 0, 0.52)",
    bevel: "inset 0 1px 0 rgba(244, 239, 227, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.68)",
  },
  radius: {
    frame: 4,
    control: 6,
  },
} as const;

export type CereBroBrand = typeof cerebroBrand;
```

- [ ] **Step 3: Import theme CSS**

Modify `app/client/src/index.css` near the top:

```css
@import "./styles/cerebroTheme.css";
```

- [ ] **Step 4: Add token tests**

Create `app/client/src/components/cerebro-ui/__tests__/cerebroTheme.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cerebroBrand } from "@/lib/cerebroTheme";

describe("cerebroBrand", () => {
  it("keeps the locked brass and green brand colors available", () => {
    expect(cerebroBrand.color.gold500).toBe("#c69b55");
    expect(cerebroBrand.color.green900).toBe("#08241d");
    expect(cerebroBrand.line.brass).toContain("198, 155, 85");
  });

  it("defines core surface treatments for app primitives", () => {
    expect(cerebroBrand.surface.shell).toContain("radial-gradient");
    expect(cerebroBrand.surface.address).toContain("linear-gradient");
    expect(cerebroBrand.shadow.bevel).toContain("inset");
  });
});
```

- [ ] **Step 5: Run tests**

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run app/client/src/components/cerebro-ui/__tests__/cerebroTheme.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: TypeScript passes and the token test passes.

- [ ] **Step 6: Commit**

```bash
git add app/client/src/styles/cerebroTheme.css app/client/src/lib/cerebroTheme.ts app/client/src/index.css app/client/src/components/cerebro-ui/__tests__/cerebroTheme.test.ts
git commit -m "feat: add cerebro brand theme tokens"
```

## Task 3: Build The Primitive Component Kit

**Files:**

- Create: `app/client/src/components/cerebro-ui/CereBroOrnaments.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroFrame.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroButton.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroTab.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroOmnibox.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroMedallion.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroCard.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroPanel.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroDock.tsx`
- Create: `app/client/src/components/cerebro-ui/index.ts`

- [ ] **Step 1: Add ornament primitives**

Create `CereBroOrnaments.tsx` with SVG/CSS corners, compass marks, and etched line components. Keep `pointer-events-none` on decorative elements.

- [ ] **Step 2: Add frame primitive**

Create `CereBroFrame.tsx` with props:

```ts
type CereBroFrameProps = {
  children: React.ReactNode;
  variant?: "shell" | "panel" | "browser-page";
  className?: string;
};
```

It must render branded background, brass border, inner bevel, and corner ornaments.

- [ ] **Step 3: Add control primitives**

Create:

- `CereBroButton`
- `CereBroTab`
- `CereBroOmnibox`
- `CereBroMedallion`

These must support active, hover, disabled, and focus-visible states.

- [ ] **Step 4: Add content primitives**

Create:

- `CereBroCard`
- `CereBroPanel`
- `CereBroDock`

These must use CSS/SVG structure first, and allow texture background props only where needed.

- [ ] **Step 5: Export primitives**

Create `index.ts`:

```ts
export * from "./CereBroButton";
export * from "./CereBroCard";
export * from "./CereBroDock";
export * from "./CereBroFrame";
export * from "./CereBroMedallion";
export * from "./CereBroOmnibox";
export * from "./CereBroOrnaments";
export * from "./CereBroPanel";
export * from "./CereBroTab";
```

- [ ] **Step 6: Run verification**

```bash
pnpm --dir app exec tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add app/client/src/components/cerebro-ui
git commit -m "feat: add cerebro ui primitives"
```

## Task 4: Replace Browser Home Asset Stage With Primitives

**Files:**

- Modify: `app/client/src/components/BrowserPanel.tsx`
- Modify: `app/client/src/components/cerebro-ui/*`
- Use: `app/client/public/browser-home/assets/*`

- [ ] **Step 1: Replace top chrome**

Replace `top-title-tabs-panel.png` and `top-url-row.png` usage with `CereBroTab`, `CereBroOmnibox`, and `CereBroButton`.

Keep the raster assets available as visual references, not the active layout.

- [ ] **Step 2: Replace medallion row**

Replace medallion cutout placement with `CereBroMedallion`.

Use painterly icon art as medallion center art only.

- [ ] **Step 3: Replace bookmark cards**

Replace bookmark-card raster placement with `CereBroCard`.

Use real text and icons. The card frame must be CSS/SVG.

- [ ] **Step 4: Replace panels**

Replace `panel-continue.png`, `panel-recent.png`, and `panel-downloads.png` with `CereBroPanel`.

Keep real history, recent, and download rows clickable where data exists.

- [ ] **Step 5: Replace Aang dock**

Replace `aang-dock.png` with `CereBroDock`.

Use Aang sprite/illustration only inside avatar well.

- [ ] **Step 6: Verify installed app**

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/desktopInstalledSmoke.test.ts server/browserNativeBridgeSurface.test.ts server/browserActionProposalRouter.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff
```

Expected:

- Installed app launches.
- Browser Home screenshot exists.
- Diff does not regress without explicit reason.
- Manual screenshot shows no duplicate rail and no hidden full mockup layer.

- [ ] **Step 7: Commit**

```bash
git add app/client/src/components/BrowserPanel.tsx app/client/src/components/cerebro-ui
git commit -m "feat: rebuild browser home with cerebro primitives"
```

## Task 5: Apply The Brand To Loaded Browser Chrome

**Files:**

- Modify: `app/client/src/components/BrowserPanel.tsx`
- Modify: `scripts/desktopInstalledSmoke.ts` if loaded-page screenshot mode needs repair.
- Modify: `docs/design/cerebro-brand-rollout.md`

- [ ] **Step 1: Replace loaded-page tab strip**

Use `CereBroTab` for all loaded browser tabs.

- [ ] **Step 2: Replace loaded-page address row**

Use `CereBroOmnibox` and `CereBroButton` for back, forward, reload, shield, Aang, and menu controls.

- [ ] **Step 3: Fix menu layering**

Menus from shield, Aang, bookmarks, page actions, and downloads must render above the native browser view.

If the native view always wins z-order, render menus through the Electron overlay bridge rather than inside the covered DOM.

- [ ] **Step 4: Repair loaded-page screenshot QA**

Loaded-page screenshot QA must not produce black images.

Run:

```bash
CEREBRO_DESKTOP_QA_MODE=browser-page CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
```

Expected:

- Screenshot shows CereBro chrome and a loaded page.
- Screenshot is not blank or black.

- [ ] **Step 5: Commit**

```bash
git add app/client/src/components/BrowserPanel.tsx scripts/desktopInstalledSmoke.ts docs/design/cerebro-brand-rollout.md
git commit -m "feat: apply cerebro brand to browser chrome"
```

## Task 6: Apply The Brand To Global Shell And Rail

**Files:**

- Modify: `app/client/src/pages/Home.tsx`
- Create: `app/client/src/components/cerebro-ui/CereBroRail.tsx`
- Modify: `docs/design/cerebro-brand-rollout.md`

- [ ] **Step 1: Create `CereBroRail`**

Rail props:

```ts
type CereBroRailItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
};
```

The rail must support:

- Full ornate variant.
- Compact variant if approved.
- Active green plaque.
- Brass inactive labels.
- Keyboard focus.

- [ ] **Step 2: Replace Home rail rendering**

Replace rail-specific image positioning in `Home.tsx` with `CereBroRail`.

- [ ] **Step 3: Verify no squashed rail**

Use installed app screenshot:

```bash
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
```

Expected:

- Left rail is not duplicated.
- Left rail is not horizontally squashed.
- Active Browser hit area matches the visible Browser button.

- [ ] **Step 4: Commit**

```bash
git add app/client/src/pages/Home.tsx app/client/src/components/cerebro-ui/CereBroRail.tsx docs/design/cerebro-brand-rollout.md
git commit -m "feat: apply cerebro brand rail globally"
```

## Task 7: Apply The Brand To Core Panels

**Files:**

- Modify: `app/client/src/components/WorkbenchPanel.tsx`
- Modify: `app/client/src/components/ApprovalDashboardPanel.tsx`
- Modify: `app/client/src/components/ConfigPanel.tsx`
- Modify: `app/client/src/components/ModelToolsPanel.tsx`
- Modify: `app/client/src/components/MemoryPanel.tsx`
- Modify: `app/client/src/components/SessionsPanel.tsx`
- Modify: `app/client/src/components/ArtifactsPanel.tsx`
- Modify: `app/client/src/components/SecurityGatePanel.tsx`
- Modify: `app/client/src/components/AangCompanionPanel.tsx`
- Modify: `app/client/src/components/TasksPanel.tsx`
- Modify: `docs/design/cerebro-brand-rollout.md`

- [ ] **Step 1: Convert one panel at a time**

Order:

1. `AangCompanionPanel`
2. `WorkbenchPanel`
3. `MemoryPanel`
4. `SessionsPanel`
5. `ArtifactsPanel`
6. `ApprovalDashboardPanel`
7. `ConfigPanel`
8. `ModelToolsPanel`
9. `SecurityGatePanel`
10. `TasksPanel`

- [ ] **Step 2: Replace generic panel containers**

For each panel:

- Replace local card wrappers with `CereBroPanel`.
- Replace action buttons with `CereBroButton`.
- Replace tabs with `CereBroTab`.
- Replace repeated result cards with `CereBroCard`.
- Keep data layout dense and readable.

- [ ] **Step 3: Verify each panel manually**

After each panel:

```bash
pnpm --dir app exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit per 2-3 panels**

```bash
git add app/client/src/components/AangCompanionPanel.tsx app/client/src/components/WorkbenchPanel.tsx docs/design/cerebro-brand-rollout.md
git commit -m "feat: apply cerebro brand to work surfaces"
```

Then continue with the next panel batch.

## Task 8: Add Brand QA Beyond Browser Home

**Files:**

- Modify: `scripts/desktopInstalledSmoke.ts`
- Create: `scripts/cerebroBrandVisualAudit.ts`
- Modify: `app/package.json`
- Modify: `docs/design/cerebro-brand-rollout.md`

- [ ] **Step 1: Add QA modes**

Add smoke modes for:

- `brand-browser-home`
- `brand-browser-page`
- `brand-workbench`
- `brand-memory`
- `brand-settings`

- [ ] **Step 2: Add brand visual audit script**

Create `scripts/cerebroBrandVisualAudit.ts` to check:

- No full mockup background usage in active app surfaces.
- No hidden `opacity-0` real UI under a screenshot layer.
- No old generic background colors on branded routes.
- No menus hidden behind the browser view.

- [ ] **Step 3: Add package script**

Add to `app/package.json`:

```json
"qa:brand": "tsx scripts/cerebroBrandVisualAudit.ts"
```

- [ ] **Step 4: Run full QA**

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app run qa:brand
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
```

Expected:

- Brand audit passes.
- Installed app launches.
- Screenshots exist for each QA mode.

- [ ] **Step 5: Commit**

```bash
git add scripts/desktopInstalledSmoke.ts scripts/cerebroBrandVisualAudit.ts app/package.json docs/design/cerebro-brand-rollout.md
git commit -m "test: add cerebro brand visual qa"
```

## Task 9: External AI Assistance Lane

**Files:**

- Modify: `docs/design/external-ai/README.md`
- Create: `docs/design/external-ai/stitch-prompt.md`
- Create: `docs/design/external-ai/figma-make-prompt.md`
- Create: `docs/design/external-ai/gemini-asset-prompt.md`

- [ ] **Step 1: Create Stitch prompt**

Use Stitch for component inventory and measurement reference only if it can be used without payment, card-backed trial, or future cost exposure.

Prompt must say:

```markdown
Analyze this Browser Home mockup as a production app UI system.
Do not generate a marketing page.
Extract design tokens, component primitives, measurements, layout rules, and state variants.
Target React and Tailwind.
Do not suggest a full screenshot background as UI.
```

- [ ] **Step 2: Create Figma Make prompt**

Use Figma Make only if it is available at no cost without payment setup. If not, skip it and keep working from local measurements.

- [ ] **Step 3: Create Gemini asset prompt**

Use Gemini/Nano Banana only if available at no cost without payment setup. Use it only for:

- stone texture tile
- brass wear texture tile
- low-detail pixel Aang revision
- painterly medallion icon source art

It must not generate the app layout.

- [ ] **Step 4: Commit**

```bash
git add docs/design/external-ai
git commit -m "docs: add cerebro brand external ai prompts"
```

## Task 10: Merge Criteria

Do not merge the brand identity branch until:

- Browser Home is primitive-backed.
- Loaded browser chrome is primitive-backed.
- Global rail is primitive-backed.
- At least `AangCompanionPanel`, `WorkbenchPanel`, `MemoryPanel`, and `ConfigPanel` use brand primitives.
- Installed app QA passes.
- Browser Home visual diff is not worse than the current accepted baseline without a documented reason.
- No production surface uses a full mockup screenshot as the active UI.
- Menus render over browser content.
- Browser remains usable as a daily browser.

## Execution Order

1. Task 1: source and rollout docs.
2. Task 2: tokens.
3. Task 3: primitives.
4. Task 4: Browser Home primitive rebuild.
5. Task 5: loaded browser chrome.
6. Task 6: global rail.
7. Task 7: core panels.
8. Task 8: brand QA.
9. Task 9: external AI prompts.
10. Task 10: merge check.

## Follow-Up Questions

1. Should the first merge lock Browser, shell, Aang, Workbench, Memory, and Settings before the rest of the app, or include every panel in one larger merge?
2. Should a new lower-detail pixel Aang asset be generated after the primitives stabilize, or should the current Aang remain through the first brand-system merge?
