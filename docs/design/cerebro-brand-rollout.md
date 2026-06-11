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
| Global theme tokens | primitive-backed | Root CSS variables, shared buttons, and dropdowns use CereBro ink/brass/green. Needs full form/table sweep. |
| Global shell rail | primitive-backed | Uses rail assets. Needs SVG/CSS rail variant and better proportional lock. |
| Hosted panel frame | primitive-backed | PanelHost wraps app panels in CereBroFrame. Internal panel surfaces still need route-by-route cleanup. |
| Browser Home | primitive-backed | Uses composed assets and real DOM. Needs backplate and medallion rail pass. |
| Loaded browser chrome | not-started | Must stop reverting to old language. |
| Aang dock | primitive-backed | Uses raster dock. Needs dock primitive. |
| Workbench | tokenized | Inherits root controls and hosted frame. Needs internal panel/card/table primitives. |
| Keep | tokenized | Inherits root controls. Needs measured rail/frame pass. |
| Workshop | tokenized | Inherits root controls and hosted frame. Needs panel/card primitives. |
| Ledger | tokenized | Inherits root controls. Needs table/list primitives. |
| Basement | tokenized | Inherits root controls. Needs safety panel primitives. |
| Settings | tokenized | Inherits root controls. Needs form primitives. |
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
