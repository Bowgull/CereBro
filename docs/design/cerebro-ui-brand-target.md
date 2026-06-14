# CereBro UI Brand Target

Last updated: 2026-06-13

This is the UI target Claude should understand before touching CereBro visuals.

## Intent

CereBro should feel like a daily browser and AI operating layer built inside a precise fantasy-tech artifact.

The approved Browser Home mockup is not decoration. It is the brand source of truth. The rest of CereBro should inherit its frame language, material system, spacing, button style, rail behavior, and command surfaces.

## Source Of Truth

Primary Browser Home:

`mockups/approved/browser-home-symmetric-rails-target-v1.png`

Watch Shelf:

`mockups/approved/WATCH_SHELF_LOCK.md`

Mockup map:

`docs/design/cerebro-mockup-source-map.md`

Manifest:

`mockups/approved/manifest.json`

## Visual Language

CereBro should use:

- dark engraved surfaces
- brass linework
- green-black rail panels
- restrained amber status light
- compact browser controls
- medallion-style pinned shortcuts
- thin bordered panels
- visible frame hierarchy
- clear left and right rails
- Aang dock at the bottom
- real browser page space preserved as the main surface

CereBro should not use:

- generic blue or slate dashboard chrome
- default Tailwind cards
- random fantasy ornament
- new icons that do not match the mockup
- full screenshot layers as UI
- duplicated rail strips
- floating controls that ignore the frame
- fake browser behavior

## Layout Target

Browser Home structure:

- macOS title bar
- top tab strip
- URL/search bar
- left navigation rail
- center browser home field
- medallion row
- pinned bookmark cards
- lower panels
- right rail drawer handle
- bottom Aang dock

Loaded Browser structure:

- real browser page remains the primary content
- CereBro chrome stays around it
- menus and drawers render above the browser surface
- loaded pages do not escape the CereBro frame

Watch Shelf structure:

- opens from the right rail as an overlay drawer
- original right rail stays untouched
- drawer sits to the left of the right rail
- `Pin` keeps the drawer open
- `X`, Escape, outside click, or the right rail arrow closes it
- opening an item closes the drawer unless pinned
- docked resize is not approved for V1

## Product Model

Watch Shelf is a personal watching command center inside Browser.

Modes:

- `Continue`
- `Queue`
- `Live / New`
- `Favorites`

Shelves:

- `Anime`
- `Twitch`
- `YouTube`
- `Netflix`
- `Disney+`
- `Crunchyroll`
- `Max`
- `Prime`
- custom shelves

Item state:

- `watching`
- `queued`
- `paused`
- `finished`
- `dropped`
- `favorite`
- `notify`

Provider is metadata. It can differ from shelf.

Examples:

- Shelf `Anime`, provider `Crunchyroll`, state `watching`.
- Shelf `Twitch`, provider `Twitch`, state `live`.
- Shelf `YouTube`, provider `YouTube`, state `new`.
- Shelf `Netflix`, provider `Netflix`, state `queued`.

`Watched` is not a shelf. Finished or watched is item state.

## Implementation Standard

Build real UI.

- React components for structure.
- CSS for material, spacing, borders, and state.
- SVG only when the geometry is traceable or simple.
- PNG or WebP only for texture, source art, thumbnails, and painterly assets.
- Every visual piece should point back to an approved mockup, measured source, or documented proposal.

Do not freestyle. If a control is not in the mockup packet, design it as a proposal before implementation.

## Next UI Slice

The next implementation slice should be Watch Shelf Drawer Foundation:

1. Replace full Watch Shelf tab behavior with right overlay drawer state.
2. Keep the original right rail untouched.
3. Add `Pin` and `X`.
4. Add Escape, outside click, and right rail toggle close behavior.
5. Keep the browser page visible behind the drawer.
6. Add tests proving Watch Shelf is a drawer, not a tab.
7. Screenshot the installed app against the approved Watch Shelf packet.

Do not build thumbnail provider APIs in that slice. Build the drawer foundation first.
