# CereBro Brand AI Outsourcing Plan

> Required before more Browser UI polish. This plan exists because the locked Browser mockup is the CereBro brand target, not a one-screen background.

## Goal

Make the approved Browser mockup the visual system for CereBro.

The target is exact style, exact layout, exact image language, exact component format. Codex keeps production control, but Codex should not keep guessing visual details by hand when free visual AI tools can extract structure, generate assets, or produce alternate implementation references.

## Non-Negotiables

- No money by default.
- No free trials that need a card.
- No paid fallback.
- No paid model/API call unless the user explicitly approves it in the current session.
- If a tool is free only through a web UI, use it manually and save outputs into the repo.
- Do not call a screenshot crop a design system.
- Do not ship invisible hit targets over mismatched pixels.
- Browser Home and loaded-page browser must use the same CereBro brand system.
- Loaded pages must not revert to the old Browser chrome.

## Locked Brand Source

Primary source:

`mockups/approved/browser-home-symmetric-rails-target-v1.png`

SHA-256:

`f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

Secondary source for loaded-page behavior:

`mockups/approved/browser-loaded-website-target-v1.png`

## Current Failure

The current app is mixing two systems:

- A cropped visual layer from the mockup.
- Older live React controls from the previous Browser shell.

This causes visible and functional drift:

- The left rail is squashed because the mockup rail is roughly 145 px wide while the live rail is still 68 px.
- Bookmark cards and medallions drift because visible pixels and real buttons do not share the same layout.
- Clicking a bookmark opens the loaded-page state and falls back to the older Browser chrome.
- Menus, buttons, tabs, and page frame do not all share one brand language.

## Tool Decision

### Use First: Google Stitch

Purpose:

- Feed the locked Browser Home mockup as the source.
- Ask Stitch to extract a component system and generate React-style structure.
- Use output as a reference, not as production truth.

Why:

- It is built for UI design from prompts and images.
- It can produce UI code and design variants.
- It is better suited than a general chat model for screen-to-interface work.

Free rule:

- Use only free/no-card access.
- If access is blocked, skip it and use local open-source tools.

Prompt:

```text
Use this image as the exact product UI reference for CereBro.

Do not redesign it. Extract it into a production UI system.

Required output:
1. Component inventory.
2. Measured layout grid.
3. Rail dimensions and item spacing.
4. Tab strip dimensions.
5. Omnibox dimensions.
6. Button styles and states.
7. Bookmark medallion and card components.
8. Loaded-page browser frame using the same style.
9. React + Tailwind component skeleton.

Rules:
- Exact dark stone and brass fantasy-tech style.
- No generic SaaS dashboard chrome.
- No purple/blue AI gradient style.
- No rounded modern pill redesign.
- Preserve the left rail, top tabs, URL row, pinned medallions, bottom Aang dock, carved borders, green glow, and brass frame.
- Loaded pages must keep this chrome instead of reverting to a different browser UI.
```

### Use First For Assets: Nano Banana / Gemini Image Editing

Purpose:

- Create or clean exact brand assets when the mockup is not enough.
- Generate rail icons, carved borders, button states, medallion rings, texture plates, and a simpler Aang dock sprite.

Why:

- It is stronger for image edits, consistency passes, and asset variants than Codex.
- It can use the mockup plus current screenshots as reference.

Free rule:

- Use only free/no-card access.
- If paid/API-only, do not use it.

Prompt:

```text
Use this CereBro Browser mockup as the exact visual style reference.

Create production UI assets, not a new design.

Output transparent PNG assets for:
1. Left rail background.
2. Active rail button.
3. Inactive rail button.
4. Brass tab frame.
5. URL bar frame.
6. Medallion ring active.
7. Medallion ring inactive.
8. Bookmark card frame.
9. Bottom Aang dock frame.
10. Aang dock avatar, simpler pixel style, almost 8-bit but slightly upscale.

Rules:
- Match the mockup exactly.
- Dark green-black stone.
- Aged brass bevels.
- Muted parchment text.
- Green glow only for active/protected state.
- No modern flat SaaS look.
- No new composition.
- Transparent PNG where possible.
```

### Use As Cross-Check: screenshot-to-code

Purpose:

- Generate a second structural interpretation from the mockup.
- Compare its component hierarchy against Codex's plan.

Why:

- Open-source.
- Can generate React/Tailwind references from screenshots.

Limits:

- It usually needs model API keys.
- It is not trusted for production code.
- It may hallucinate layout details.

Action:

- Use only if it can run with an already-free provider.
- Save output under `docs/design/external-ai/screenshot-to-code/`.

### Use As Cross-Check: Pic2Code

Purpose:

- Test free provider routes for screenshot-to-code structure.
- Compare Gemini, Qwen, DeepSeek, Claude, and GPT outputs if free access exists.

Limits:

- Reference only.
- Do not paste generated code into production without review.

Action:

- Use only no-money/no-card routes.
- Save output under `docs/design/external-ai/pic2code/`.

## Not The Main Tool

### DeepSeek

Use for:

- Architecture critique.
- Code review.
- Diff review.

Do not use as primary visual translator.

### Qwen / Gemma

Use for:

- Local reasoning experiments.
- Code review.
- Model routing research.

Do not use as primary visual translator.

### Figma

Use only if it does not add money or account friction.

Figma can become the inspection layer if Stitch or Gemini produces usable components. It is not required for the first migration.

## Brand System Extraction

Extract these into real code tokens and components:

- Shell black: `#101010`
- Deep green-black: `#001010`
- Dark stone: `#202010`
- Brass line: roughly `#504030`
- Soft stone line: roughly `#303020`
- Muted ivory text from the mockup, sampled manually during implementation.
- Green active glow from the protected and rail active states.

Component families:

- `CereBroShellFrame`
- `CereBroRail`
- `CereBroRailButton`
- `CereBroTabStrip`
- `CereBroTab`
- `CereBroOmnibox`
- `CereBroIconButton`
- `CereBroMedallion`
- `CereBroBookmarkCard`
- `CereBroPanel`
- `CereBroDockInput`
- `CereBroAangDock`
- `CereBroNativePageFrame`

## Implementation Order

### Slice 1: Stop the rail squash

- Make the Browser route rail use the mockup rail proportion.
- Do not compress a 145 px visual into 68 px.
- Convert rail items into real branded buttons.
- Keep route switching functional.

### Slice 2: Make bookmarks real components

- Replace invisible bookmark hit targets over mockup pixels.
- Render medallions and bookmark cards as real buttons.
- Align click targets to the visible medallion/card bounds.
- Keep add, rename, delete, and open flows.

### Slice 3: Unify loaded-page chrome

- Loaded pages must keep the CereBro brand chrome.
- Remove the old Browser row that appears after opening Obsidian/GitHub/etc.
- Native page viewport sits inside `CereBroNativePageFrame`.
- Top tabs, URL row, shield, Aang, bookmark controls, and bottom dock stay on brand.

### Slice 4: External AI pass

- Send the locked Browser Home mockup to Stitch.
- Send Browser Home plus current installed screenshot to Nano Banana/Gemini if free.
- Save outputs.
- Compare generated structure against live code.
- Implement only the parts that improve fidelity.

### Slice 5: QA gates

- Installed app screenshot for Browser Home.
- Installed app screenshot for loaded Obsidian.
- Visual diff against Browser Home target.
- Visual diff against loaded-page target.
- Click-map test for rail buttons.
- Click-map test for bookmark cards and medallions.
- URL bar open test.
- Tab close test.
- Aang dock open/submit test.

## Source Notes

- Google Stitch is the right category for UI image-to-design/code extraction.
- Gemini/Nano Banana is the right category for image editing and UI asset generation.
- screenshot-to-code and Pic2Code are useful open-source cross-checks.
- DeepSeek, Qwen, and Gemma are not the main visual solution.

## Stance

Codex remains the production engineer. External AI becomes the visual extraction and asset assistant.

The build path changes from `hand-code a crop` to `extract a brand system, generate missing assets, build real components, and verify with installed-app screenshots`.
