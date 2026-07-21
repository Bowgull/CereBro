# CereBro Brand System Spec — v0 (draft for approval)

Status: DRAFT. Nothing built yet. This defines the shared brand layer before any code.

## 1. The one rule

The ornate brass-on-black astrolabe identity is CereBro's brand language, not a
Browser skin. It is defined **once** as a shared kit and **inherited** by every
surface and every tab. No surface hand-rolls its own gold, frames, or glow.

This spec sits under `DESIGN.md` and the castle spec
(`CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md`),
which stay the higher authority. Where they conflict, they win; this spec is the
implementation layer.

## 2. Where it lives (code home)

- `app/client/src/lib/keepConfig.ts` — already the single color source
  (`cerebroColors`, `gold: #D9B56A`). We EXTEND it with a `cerebroBrand` treatment
  block (frame lines, plaques, bevels, glow recipes). No new color file.
- `app/client/src/components/brand/` — NEW folder for the reusable components
  (`CompassRose`, `BrassFrame`, `FiligreeCorners`, `AstrolabeField`, `AangDock`).
- Extraction source: the ornate values currently trapped in the local
  `browserFrame` const inside `BrowserPanel.tsx` (plaque, greenPlaque, bevel,
  line, lineSoft, address) get promoted here verbatim, then BrowserPanel imports
  them back. Exact values are lifted from that const during extraction, not
  invented.

## 3. The token layer (`cerebroBrand`)

Names are the contract; values finalized at extraction from `browserFrame` + the
target mockup. All surfaces reference these — never literal rgba in a component.

| Token | Purpose |
|---|---|
| `brand.frameLine` / `frameLineSoft` | Brass hairline borders (strong / subtle) |
| `brand.plaque` / `plaqueGreen` | Recessed panel/card backfill (neutral / active-green) |
| `brand.bevel` | Inset shadow recipe that gives brass its carved edge |
| `brand.address` | Input/omnibox field backfill |
| `brand.goldGlow` | The radial gold-bloom gradient recipe (center fields, headers) |
| `brand.astrolabeLines` | The faint concentric star-chart background pattern |
| `brand.gold`, `brand.goldDim` | Re-exported from `cerebroColors` for one import |

Guardrail: if a component needs a gold value or a frame treatment and it is NOT
in this table, we ADD it here — we do not inline it.

## 4. The component layer (`components/brand/`)

Each is a small, themeable, self-contained part. APIs are the review surface.

- `CompassRose` — `size`, `bloom?` (light-bloom on/off), `variant` (`center` big
  hero / `rail` small nav icon). SVG, gold gradients. **Must be built new** — no
  reusable source exists today (target PNG's compass was composed in an editor;
  live panel uses a placeholder `ShieldCheck`).
- `BrassFrame` — wraps any panel/card in the brass border + bevel. `tone`
  (`neutral` / `active`). Replaces per-surface ad-hoc borders.
- `FiligreeCorners` — decorative corner ornaments, `corners` (which to show),
  `scale`. SVG. Built new.
- `AstrolabeField` — the star-chart backdrop for large open areas (center of
  Browser Home, Keep scene backplate). Uses `brand.astrolabeLines`.
- `AangDock` — the bottom command bar with the REAL Aang illustration
  (`app/public/assets/aang/…`), replacing the tiny pixel sprite
  (`/sprites/keep/aang/rotations/south.png`) currently used in 3 places.

## 5. Adoption sequence

1. Ship §3 tokens + §4 components (kit only, not yet wired).
2. Refactor Browser Home to consume the kit = the reference build. Verify against
   `mockups/approved/browser-home-symmetric-rails-target-v1.png` in live preview.
3. Propagate, in this order (most-seen first):
   `Keep chrome/header → Keep scene backplate → Workshop → Ledger → Outputs →
    Terminal → Basement → Files → Watch Shelf drawer`.
4. Each surface adopts via BrassFrame/AstrolabeField/tokens — no local gold left.

## 6. Definition of done (per surface)

- Zero literal gold/frame rgba in the surface file; all via `cerebroBrand`.
- Brass frame, gold glow, and (where applicable) compass/filigree present and
  matching the reference build.
- Passes a side-by-side screenshot check against the surface's approved mockup
  where one exists.

## 7. Non-goals / guardrails

- Not a redesign of layout or IA — identity/finish only. Layouts already locked
  (e.g. Browser Home 1:1 lock) are untouched.
- No new brand colors beyond the castle palette.
- Sealed modules (Raven) stay out of scope entirely.
- Pixel-art assets stay pixel art; the brand kit is the vector/CSS chrome AROUND
  them, not a replacement for the Keep's PixelLab tiles.

## 8. Open questions for you

- Adoption order in §5 — is "most-seen first" right, or do you want a specific
  surface prioritized?
- Aang dock: one canonical pose everywhere, or per-surface poses (the asset set
  has several)?
- Do we commit the current at-risk uncommitted Browser work as a checkpoint
  before extraction begins?
