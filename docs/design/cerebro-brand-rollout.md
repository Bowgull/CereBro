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

- Browser Home: `mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png`
- SHA-256: `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

## Rollout Rule

Use the Browser Home mockup as the visual system for all CereBro surfaces.

Ship in slices:

1. Tokens.
2. Primitives.
3. Browser Home primitive replacement.
4. Loaded browser chrome.
5. Global shell rail.
6. Core panels.
7. Brand QA.

Raster cutouts can guide measurements. They are not the end state for structure.
