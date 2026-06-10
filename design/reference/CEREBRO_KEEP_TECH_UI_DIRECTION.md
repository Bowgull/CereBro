# CereBro Keep-Tech UI Direction

## Core Direction

CereBro is a Keep-first personal AI OS with a native browser inside it.

The visual language is:

**Fantasy structure. Future function. Browser familiarity.**

This is not a SaaS dashboard, a Chrome clone, or a generic dark app. It should feel like an RPG operating system built inside a living Keep, with software-builder power hidden behind normal controls.

## Tone

- RPG fantasy future tech.
- Ancient council table plus tactical command room.
- Stone, brass, green fire, compass geometry, carved instruments.
- Serious, quiet, readable.
- Native enough to use every day.
- Magical only where it clarifies action.

## Hard UI Rule

Hide the machinery.

Public surfaces must not expose internal language like receipts, routes, runners, contracts, sandbox, source machinery, agent plumbing, or gates.

The user sees normal actions:

- Browse.
- Search.
- Clip.
- Shield.
- Add to Obsidian.
- Add to Watch.
- Screenshot to Aang.
- Annotate.
- Compare.
- Bookmark.

Basement owns settings, diagnostics, providers, and advanced controls.

## Product Spine

- Keep understands.
- Browser browses.
- Workshop builds, researches, designs, reviews, and runs code.
- Ledger proves.
- Basement configures.
- Aang interprets user intent.
- Cortana coordinates agent work at the council table.

Browser stays a top-level daily tab.

## Visual Sources

The CereBro app icon drives the design system:

- source reference: `design/reference/assets/cerebro-app-icon-light-2026-06-08.png`
- circular council-table geometry
- central compass glow
- dark stone surfaces
- brass instrument edges
- green illuminated markers
- room and shelf metaphors
- precise panels, not generic cards

## Browser Direction

The Browser must feel familiar first:

- macOS desktop app shell
- normal tabs
- normal address/search field
- back, forward, reload
- one Shield button
- one Clip button
- one menu button
- Aang command bar at the bottom
- Keep rail on the left

The Browser should not feel like an AI dashboard.

## Browser Home Locked Rules

Browser Home is a new-tab page, not a Keep dashboard.

- The top URL bar is the only browser search/address input.
- The bottom Aang dock is the only Aang input.
- Do not add a duplicate center search bar.
- Do not add a Quick Actions block to Browser Home.
- Pinned sites use real site favicons/logos.
- Bookmark charms hang under the URL bar as small browser-chrome shortcuts.
- Bookmark charms are small: roughly 24-32px medallions with 16-20px favicons.
- Bookmark charms have no labels by default.
- Watch Shelf is closed by default.
- Watch Shelf opens from the right on button click.
- Left Keep rail can collapse.
- Left rail collapse/expand should mirror the Watch Shelf right-drawer behavior.
- Left and right drawers use the same open/close affordance: edge handle, directional arrow, same motion timing, same hit target size.
- The Aang dock accepts text, pasted images, and drag/drop images.
- Replace Aang letter placeholders with an Aang portrait or sprite when the asset exists. If a new asset is needed, make Aang recognizable with an airbending staff.
- Current Aang chat-dock sprite candidate: `app/public/assets/aang/aang-chat-dock-waist-v1.png`.
- Do not use mystery icon clusters in the Aang dock. The dock should show Aang, one input, attach/image, and send.
- Chat collapse uses the same drawer grammar as the side rails, but as a bottom-edge handle. It should not be a floating pill.
- Aang should not sit inside a square box or circular avatar token in the expanded chat state. He stands out of the dock with only grounding/shadow.
- Do not use a random green status dot on Aang. Status should appear only when meaningful, through subtle dock glow or motion.
- Current chat-collapse decision: Aang is the launcher. When chat is collapsed, the chat bar goes away and only Aang remains. Clicking Aang brings the chat back.
- Do not show a ghosted input field in collapsed state.

Current visual targets:

- Browser Home Final Direction v4: Astral Keep layout clarity with Keep-native object weight.
- Browser Home symmetric rails target v1: `design/reference/candidates/rendered/browser-home-symmetric-rails-target-v1.png`.
- Browser Home expanded chat bottom-handle target v1: `design/reference/candidates/rendered/browser-home-chat-expanded-bottom-handle-v1.png`.
- Browser Home collapsed chat bottom-handle target v1: `design/reference/candidates/rendered/browser-home-chat-collapsed-bottom-handle-v1.png`.
- Browser Home expanded Aang-launcher target v1: `design/reference/candidates/rendered/browser-home-chat-expanded-aang-launcher-v1.png`.
- Browser Home collapsed Aang-launcher target v2: `design/reference/candidates/rendered/browser-home-chat-collapsed-aang-launcher-v2.png`.
- Loaded Browser website target v1: `design/reference/candidates/rendered/browser-loaded-website-target-v1.png`.

## Shield

Shield is one protection object, not many exposed toggles.

It owns:

- VPN state
- adblock
- popup blocking
- cookie controls
- per-site exceptions

Browser chrome shows only simple states:

- Shield On
- Shield Off
- VPN On
- VPN Off
- Checking
- Setup Needed
- Unknown

Provider details and logs live in Basement.

## Clip

Clip is the capture object.

It owns:

- Add to Obsidian
- Bookmark
- Add to Watch
- Screenshot to Aang
- Annotate
- Compare

Clip should feel like a capture rune or crafted instrument, not a generic save button.

## Watch Shelf

Watch Shelf is not a generic sidebar list.

It should feel like a shelf or drawer of saved objects. It can hold:

- pages
- videos
- GitHub repos
- anime/watch items
- tutorials
- references
- pages to revisit

It should detect what it can from the current page, then ask only for missing useful context.

## Annotate

Annotate is visual markup.

Required tools:

- marker
- highlight
- box
- arrow
- text note
- blur
- undo
- done

Color meanings:

- red: fix
- gold: save
- blue: question
- green: good

Annotate output should be usable by Aang.

## Compare

Compare is primarily left and right.

Left is current.
Right is the target.

Targets can come from:

- mockup folder: `mockups/compare`
- screenshot
- live app
- website
- artwork file
- previous version

Compare is for building and reviewing software, websites, UI, art, and media.

Approved visual targets live under `mockups/compare/approved`.
Rejected directions live under `mockups/compare/rejected` so the same mistakes are not repeated.

## Mockup Sequence

Do the home page first.

Then work through the existing Browser mockup set fully:

1. Browser Home / New Tab visual target.
2. Browser loaded-website view with left rail collapsed option. First visual target exists at `design/reference/candidates/rendered/browser-loaded-website-target-v1.png`.
3. Watch Shelf right-drawer open.
4. Browser Clip menu.
5. Shield popover.
6. Browser Annotate.
7. Browser Compare picker.
8. Browser Compare split view.
9. Tools menu.
10. Basement browser settings.
11. Keep home / OS dashboard.
12. Workshop Browse mode.
13. Workshop Build mode.
14. Ledger proof view.
15. Cortana Council active-agent view.

Each screen needs a true high-fidelity visual comp before app implementation.

## Machine Constraint

The current machine can support this direction if the build stays disciplined:

- CSS and SVG for the main interface.
- Static textures where needed.
- Small motion only.
- No always-on 3D scene.
- No heavy animated background.
- No constant canvas effects.
- No bloated extension-style panel stack.

Motion should be reserved for:

- Clip opening.
- Shield state change.
- Watch Shelf drawer.
- tab switching.
- Compare split transition.
- Annotate tool activation.

## Rejected Direction

Do not keep producing styled wireframes and calling them high fidelity.

Avoid:

- generic rectangles with gold borders
- fake control-room dashboards
- card spam
- neon cyberpunk
- flat black panels
- AI product copy inside the UI
- exposed machinery labels

Never present a styled layout blockout as a final mockup. If it reads as boxes,
it is not ready to show as high fidelity.

## Current Decision

The next correct design pass is the loaded Browser website view using the approved Browser Home visual language.

It must show how CereBro looks while browsing an actual website, with the left rail collapsible, Watch Shelf closed by default, bookmark charms available under the URL bar, and Aang dock kept compact.
