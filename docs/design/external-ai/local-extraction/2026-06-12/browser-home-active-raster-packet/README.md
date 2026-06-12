# Browser Home Active Raster Extraction Packet

Generated: 2026-06-12

Source of truth:

`mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png`

SHA-256:

`f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

Use this packet for no-cost external extraction or local tracing only. Do not redesign the mockup. Do not use a full-screen screenshot as production UI. Production output must become React, CSS, SVG, or narrowly justified raster texture with provenance.

## Active Raster Targets

| Target | Role | Source box | Required next medium | Blocked approaches |
| --- | --- | --- | --- | --- |
| rail-full | Left navigation rail texture, frame, compass, labels, and negative space. | 0,60,145,932 | traced-svg | guessed-css-rail-backplate |
| center-field-title-star-map | Center star-map, title copy, medallion rail, pinned label, edit control, and upper field geometry. | 145,126,1440,332 | traced-svg | center-field-two-piece-slice |
| bottom-dock-row | Bottom Aang dock, input frame, attach/send controls, bottom frame, right edge, and lower texture. | 145,846,1440,146 | traced-svg | bottom-dock-edge-main-lower-partition |

## Crops

- `expected/`: crops from the locked mockup.
- `actual/`: matching crops from the current installed Browser Home screenshot normalized to mockup size.
- `diff/`: matching crops from the current strict visual diff.

## Rejected Candidates

| Candidate | Source box | Reason |
| --- | --- | --- |
| rejected-bottom-dock-partition | 145,846,1440,146 | Source-derived bottom dock partition reproduced installed-app seam drift and must not replace the active full-width bottom-dock-row raster. |
| rejected-center-field-two-piece | 145,126,1440,332 | Source-derived two-piece center-field split reproduced installed-app seam drift and must not be promoted without a seam-safe renderer. |

## Acceptance Rule

Any replacement must pass:

```bash
pnpm --dir app run qa:browser-home-provenance
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/browserHomeBrandLayout.test.ts server/cerebroTheme.test.ts server/cerebroUiPrimitives.test.ts server/desktopInstalledSmoke.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run desktop:backup
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff:strict
```
