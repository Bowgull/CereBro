# CereBro Brand System

Source of truth:

- `mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png`
- SHA-256: `f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

## Rule

The Browser Home mockup defines CereBro's global UI identity.

Use CSS, SVG, and React components for structure.
Use raster assets only for texture and illustration.

No paid tools. No card-backed trials. No paid asset services. No paid fallback.

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

## Production Medium

- Tokens define color, spacing, typography, radii, line weights, shadows, and state colors.
- CSS and SVG define scalable structure, ornaments, corners, dividers, and compass geometry.
- React components define behavior, accessibility, focus states, and hit targets.
- Raster files are allowed for stone grain, brass wear, painterly icons, and illustrated Aang.
- Full-screen mockup images are not production UI.

## QA

Every visible brand slice must run:

```bash
pnpm --dir app exec tsc --noEmit
pnpm --dir app exec vitest run server/desktopInstalledSmoke.test.ts server/browserNativeBridgeSurface.test.ts server/browserActionProposalRouter.test.ts --maxWorkers=1 --no-file-parallelism
pnpm --dir app run desktop:package
pnpm --dir app run desktop:install
CEREBRO_DESKTOP_QA_MODE=browser-home CEREBRO_DESKTOP_QA_CLOSE_EXISTING=1 CEREBRO_DESKTOP_QA_REOPEN_EXISTING=1 CEREBRO_DESKTOP_QA_PORT=9450 pnpm --dir app exec tsx scripts/desktopInstalledSmoke.ts
pnpm --dir app run qa:browser-home-diff
```

Do not claim a surface is 1:1 without the installed screenshot and manual visual check.
