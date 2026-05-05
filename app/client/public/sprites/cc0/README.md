# CC0 source art

Staged third-party CC0 packs. Not yet composed into CereBro scenes.

## Packs

- `kenney_tiny-dungeon/` — Kenney, CC0. 16x16 dungeon tile pack (walls, floors, props, characters). License: `kenney_tiny-dungeon/License.txt`. Source: https://kenney.nl/assets/tiny-dungeon

## Status

These are tile sprites, not pre-composed backgrounds. Producing a shippable Upper Spires or Crypts background from this material requires a pixel-layout pass (composing tiles into a scene), then optionally running it through `app/scripts/palette-swap.mjs` to map onto the castle palette.

The palette-swap script is validated against the existing hand-painted `dungeon_bg_v2.png` and preserves structure cleanly. It's the recolor stage that's ready, not the compose stage.

## Next session

- Either compose Crypts art from these tiles (multi-hour layout job), or
- Source a pre-composed CC0 dungeon/crypt background and recolor that, or
- Commission / AI-generate hero backgrounds per the Phase 2 sprite plan.
