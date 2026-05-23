# CereBro Keep Tile Blueprint

Last updated: 2026-05-08

This is the first tile-accurate planning map for the full Keep castle.

The live preview is `mockups/keep-tile-blueprint.html`.

## Stance

The Keep uses a 64 by 34 planning grid.

The castle has 3 readable work levels and 1 short undercroft:

- Upper review level.
- Command level.
- Ground entry level.
- Undercroft operations band.

Cortana owns the center. Her chamber is visibly larger than every other room and spans the command core. The council table lives inside her chamber. Piccolo and Hedwig move to the undercroft so the main floors do not crowd.

## Grid

Use `x y w h` coordinates.

One planning tile maps to one Phaser logical tile. Pixel art may render at 16 px or 32 px, but anchors stay fixed.

| Agent | Room | Coordinates | First art pass |
| --- | --- | --- | --- |
| Aang | Threshold | `x5 y22 w12 h6` | yes |
| Cortana | Command nave | `x18 y9 w28 h14` | yes |
| Gojo | Gallery | `x45 y4 w14 h7` | yes |
| Batman | War room | `x4 y4 w10 h7` | dim |
| Spock | Observatory | `x16 y4 w9 h7` | dim |
| Oak | Archive lab | `x27 y4 w8 h7` | dim |
| Tony | Forge | `x4 y13 w10 h7` | dim |
| Surfer | Cartography | `x50 y13 w10 h7` | dim |
| C-3PO | Scriptorium | `x50 y22 w10 h6` | dim |
| Piccolo | Watch crypt | `x10 y29 w16 h4` | yes |
| Hedwig | Relay roost | `x36 y29 w16 h4` | yes |

## Floors

| Surface | Row |
| --- | --- |
| Upper hallway | `y10` |
| Upper slab | `y11` |
| Command hallway | `y19` |
| Command slab | `y20` |
| Ground hallway | `y26` |
| Ground slab | `y27` |
| Undercroft hallway | `y28` |
| Undercroft rooms | `y29 to y33` |

## Stairs

| Stair | Coordinates | Use |
| --- | --- | --- |
| Entry to command | `x17 y20 w7 h5` | Aang to Cortana route |
| Command to upper | `x40 y10 w7 h5` | Cortana to Gojo, Spock, Oak |
| Ground to undercroft | `x30 y26 w5 h4` | maintenance and capture route |

## Path Nodes

Use these first path nodes for Phaser route movement:

| Node | Coordinates | Purpose |
| --- | --- | --- |
| `entry_gate` | `x2 y25` | Main gate |
| `aang_work` | `x11 y25` | Aang work spot |
| `aang_exit` | `x18 y25` | Aang to stair |
| `command_west` | `x26 y19` | Command lane west |
| `cortana_table` | `x31 y19` | Council front |
| `command_east` | `x45 y19` | Command lane east |
| `upper_stair` | `x45 y10` | Upper stair landing |
| `gojo_work` | `x52 y10` | Gojo gallery spot |
| `crypt_stair` | `x31 y28` | Undercroft landing |
| `piccolo_work` | `x18 y28` | Piccolo route point |
| `hedwig_work` | `x44 y28` | Hedwig route point |

## Zoom Bounds

| Focus | Bounds |
| --- | --- |
| Aang threshold | `x3 y20 w17 h9` |
| Cortana command | `x16 y8 w32 h16` |
| Gojo gallery | `x43 y3 w18 h9` |
| Undercroft | `x8 y28 w46 h6` |

## Room Template Rules

Every room asset must follow the same side-cutaway template:

- Fixed room dimensions from the coordinate table.
- Same camera angle.
- Same wall thickness.
- Visible floor lane on the bottom tile row.
- Door anchors stay clear.
- Windows sit on the back wall.
- Props sit behind or above the walking lane.
- Agent work spot stays visible at default zoom.
- No perspective drift.
- No standalone fantasy painting.

## First Prop Zones

| Room | Required zones |
| --- | --- |
| Cortana | vertical tube, routing wall, decision ledger, council table, 10 council marks, threshold spot |
| Aang | intake desk, request cards, correction shelf, mode compass, threshold marker |
| Gojo | review plinth, proof rail, palette wall, lighting rig, rejected-output shelf |
| Piccolo | watcher line, timer board, maintenance shelf, heartbeat marker |
| Hedwig | relay roost, capture chute, message queue, Notion and Slack relay desk |
| Batman | war table, threat board, sequencing wall |
| Spock | scanner bench, risk receipt wall, observatory window |
| Oak | archive shelves, source review table, specimen drawer |
| Tony | forge bench, build anvil, diff rack |
| Surfer | map table, browser gate, source shelf |
| C-3PO | lectern, translation desk, format shelf |

## PixelLab Prompt Base

Use this base prompt before adding agent-specific objects:

```text
Side-cutaway pixel-art fortress chamber. Same camera angle as the CereBro Keep tile blueprint. Fixed room dimensions: [width] tiles wide by [height] tiles tall. Dark cinematic stone shell. Shared wall thickness. Back wall with window openings. Visible walking lane along the bottom tile row. Door anchors at [left/right/center]. Props stay behind the walking lane. No perspective drift. No standalone fantasy painting. Modular assets for Phaser assembly.
```

## Next Build Move

Convert this blueprint into a typed layout module for the live Phaser scene:

- `app/client/src/lib/keepFortressMap.ts`
- room coordinates
- floor courses
- doors
- path nodes
- stair anchors
- zoom bounds
- prop zones

Then render it in `KeepScene.tsx` as a debug map before generating final PixelLab room art.
