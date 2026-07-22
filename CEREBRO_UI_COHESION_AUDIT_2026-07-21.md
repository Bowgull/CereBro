# CereBro UI Cohesion Audit — 2026-07-21

Full click-through of the running app (dev server = installed build, post
browser-1to1 merge). Three lenses: end user, front-end dev, UI/UX designer.
Verdict: **the app is a set of excellent parts that do not form one product.**
Browser Home is finished software; everything else is harness internals worn on
the outside.

## Severity legend
P0 = broken/blocking · P1 = major cohesion failure · P2 = polish

## Findings

### P0 — Broken
1. **Keep scene renders a black void.** ~~Silent render-loop/asset race.~~
   **FIXED 2026-07-21 — corrected diagnosis after live debugging:** Phaser's
   loop runs on requestAnimationFrame, which never fires in a hidden document —
   the loader wedged mid-preload (32/170 assets) with zero errors and the scene
   never reached create(). Hit in any hidden context (background/minimized
   start, embedded views). Fix: `fps.forceSetTimeOut` when starting hidden
   (timer-driven stepping), plus a branded loading overlay with progress so the
   scene is never a silent black box. Related real finding: the Electron window
   showed immediately with a near-black background seconds before first paint —
   fixed with `show:false` + ready-to-show + 4s fallback (verify at next
   repackage). Verified: castle now fully renders (170/170 assets, 646 objects)
   in the previously-fatal hidden environment.
2. **Duplicate mounted browser chrome.** Accessibility tree shows two complete
   copies at once: 2 address bars, 2 VPN menus, 2 full bookmark sets, duplicate
   page-action menus. Double event targets, screen-reader chaos.

### P1 — Major cohesion failures
3. **Five visual languages in one app.** Ornate gold astrolabe (Browser) ·
   flat grey-green chrome (Keep shell) · technical blue blueprint (Blueprint
   view) · dense chip dashboards (Project Lab, Ledger) · plain form panels
   (Terminal Lab, Capture, Aang tab). The brand kit (`cerebroTheme.ts`) exists —
   only Browser consumes it.
4. **Four competing navigation systems on one screen.** Left rail (Keep/Browser/
   Workshop/Ledger/Basement) + per-surface top tabs + Keep bottom bar (Browser/
   Terminal/Files/Outputs — duplicating the rail) + Context-panel action buttons
   (Project/Workbench/Ledger/Gates). Same destinations reachable 2–3 ways,
   styled differently each time.
5. **Two browsers.** The gilded Browser surface AND a second flat browser inside
   Workshop → Workbench (own tabs, address bar, pins). Same concept, two
   implementations, two styles.
6. **Impenetrable language.** UI copy is internal harness vocabulary: bodies,
   receipts, gates, lanes, routes, council, Hedwig, "Do the work with bodies and
   reads", "Receipt body surface", "Nothing is proven yet." Raw enums shipped:
   `proposal_only`, `PROPOSAL_ONLY`, `READ_ONLY`; env var name
   `NOTION_CAPTURE_DATABASE_ID` as a visible label. Fork-legacy game jargon:
   session status "FIGHTING BOSS".
7. **Roadmap rendered as product.** Buttons/labels shipped for things that don't
   exist: "Browser back planned", "New browser tab planned", "Attach artifact
   unavailable until Phase 6", "File lane not wired", badges "EXECUTOR NOT
   BUILT", "NO EXECUTION", Aang tab cards marked "LATER" / "LATER HIGH CAUTION",
   7 identical dead menu items "Open a page first."
8. **Dashboards of zeros.** Ledger overview: 9 stat counters, 8 read `0`.
   Terminal Lab: 10 panels, nearly all empty states. No guided empty-state
   pattern — just labeled nothing.
9. **Dead controls.** Floor selector (Upper Spires/Ground Hall/Crypts) highlights
   but changes nothing. Blueprint bottom rooms (Piccolo Watch Crypt, Hedwig
   Relay Roost) clipped by container, no scroll.

### P2 — Polish
10. **Two Aangs.** Pixel-sprite Aang (URL bar, Context panel, command bar) vs
    illustrated Aang (Browser dock) — sometimes on the same screen. One
    canonical pose was already decided (2026-07-21).
11. **Chip anarchy.** Dozens of chip styles carrying unrelated semantics
    (status, filter, warning, phase, policy) with no shared component.
12. **Watch Shelf opens as a tab**; the lock doc specifies overlay drawer.
    Empty-state copy repeats twice on screen.
13. **Debug labels in chrome.** "CEREBRO OS / DEMO NODE" bottom-left.

## What is genuinely good
- Browser Home: passes the strict 1:1 gate (8.34%), feels premium, IS the brand.
- Blueprint view: legible, attractive schematic (own language though).
- Project Lab: real data, real function under the jargon.
- The safety/approval model underneath is coherent — it's the *presentation*
  that's raw.

## Root cause
Harness-first development shipped its internals as UI. Backend contracts
(receipts, gates, bodies, lanes) were surfaced verbatim instead of being
translated into a product layer. Each surface was built in the idiom of the
session that made it. The brand system arrived last (Browser only).

## Prescription — path to one cohesive product
1. **P0 first: fix the Keep scene render failure.** The home cannot be a void.
2. **One navigation model.** Ornate left rail is THE nav (it's the brand
   reference). Kill the Keep bottom-bar duplicate nav; unify per-surface tabs
   into one styled tab component; Context panel links become links, not a 4th nav.
3. **Language pass.** One glossary; no raw enums; no env vars; no fork jargon
   ("FIGHTING BOSS"); no internal nouns (body → draft, receipt → record, gate →
   approval) in user-facing copy. Lore names (Aang, Cortana, Hedwig) stay as
   *agent names*, not as feature nouns.
4. **Hide the roadmap.** Unbuilt = invisible (or one consistent "coming soon"
   treatment). No "planned" buttons, no "not built" badges, no Phase numbers.
5. **Brand propagation** (already locked 2026-07-21): every surface adopts the
   kit via approved mockups, most-seen-first: Keep chrome → Workshop → Ledger →
   Outputs → Terminal → Basement. Browser is the reference implementation.
6. **Consolidate duplicates.** One browser component (Workbench embeds the same
   Browser). One Outputs home. One Aang. One chip component with ≤4 semantic
   variants.
7. **Empty-state system.** Every empty surface gets: one sentence, one primary
   action. No zero-dashboards.
8. **Fix or remove dead controls.** Floor selector either drives the camera or
   goes; clipped blueprint gets scroll/fit.

Suggested order: 1 → 2 → 3+4 (one copy/cleanup pass) → 5 (per-surface, gated by
approved mockups + strict diff where locks exist) → 6 → 7+8 ride along per
surface.

## Method note
Audited in the in-app preview (dev server, same commit as installed build).
Screenshots captured per surface during the click-through (see session
2026-07-21). Video capture unavailable in the audit tooling; screenshot
sequences used instead.
