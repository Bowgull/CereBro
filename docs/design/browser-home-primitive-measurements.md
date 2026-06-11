# Browser Home Primitive Measurements

Source of truth:

- `mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png`
- SHA-256: `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`
- Measured source size: `1440x992`

Implementation contract:

- Measurements live in `app/client/src/lib/browserHomeBrandLayout.ts`.
- Rendering consumes those measurements through `browserHomeToPercentBox`.
- Tests live in `app/server/browserHomeBrandLayout.test.ts`.

## Locked Boxes

| Element | Left | Top | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Top title and tabs asset | 0 | 0 | 1440 | 61 |
| Top URL row asset | 0 | 61 | 1440 | 65 |
| Medallion 1 | 509 | 145 | 48 | 48 |
| Medallion 2 | 570 | 145 | 48 | 48 |
| Medallion 3 | 634 | 145 | 48 | 48 |
| Medallion 4 | 699 | 145 | 48 | 48 |
| Medallion 5 | 763 | 145 | 48 | 48 |
| Medallion 6 | 826 | 145 | 48 | 48 |
| Add medallion | 890 | 145 | 48 | 48 |
| Card 1 | 85 | 458 | 180 | 116 |
| Card 2 | 280 | 458 | 170 | 116 |
| Card 3 | 464 | 458 | 152 | 116 |
| Card 4 | 630 | 458 | 147 | 116 |
| Card 5 | 824 | 458 | 116 | 116 |
| Card 6 | 955 | 458 | 147 | 116 |
| Add card | 1115 | 458 | 152 | 116 |
| Edit pinned | 1126 | 421 | 112 | 31 |
| Continue browsing panel | 85 | 604 | 384 | 224 |
| Recent panel | 491 | 604 | 392 | 224 |
| Downloads panel | 906 | 604 | 368 | 224 |
| Aang dock | 13 | 846 | 1397 | 119 |

## Current Gaps

- Medallion primitive still nests full medallion art inside a medallion shell. That is not final.
- Cards are real DOM, but the material is flatter than the mockup.
- Panels are real DOM, but need tighter texture, type, row density, and ornament tuning.
- Aang dock is real DOM, but the avatar scale and input frame need another measured pass.
- Top chrome still uses asset slices. It must become primitives after the home body is stable.

## Rule

Do not tune this screen by eye without updating the measurement contract and running screenshot QA.

Required checks for visible changes:

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/browserHomeBrandLayout.test.ts server/cerebroTheme.test.ts server/cerebroUiPrimitives.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff
```
