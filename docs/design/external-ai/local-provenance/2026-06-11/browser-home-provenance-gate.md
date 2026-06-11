# Browser Home Provenance Gate

Date: 2026-06-11

## Source

Locked mockup:

`mockups/compare/approved/browser-home/browser-home-symmetric-rails-target-v1.png`

SHA-256:

`f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

## External AI Status

No external generated UI output was accepted for this slice.

Reason: this pass only installs the production provenance gate. Stitch, Gemini, Nano Banana, screenshot-to-code, Pic2Code, Figma, and Builder output can be saved here later only if the tool is free, does not require a card, and does not redesign away from the locked mockup.

## Production Rule

Browser Home production visuals must come from one of these media:

- `raster`
- `measured-css`
- `traced-svg`
- `external-ai-reference`

Every production visual needs a manifest entry with:

- source path
- source SHA
- measured box
- role
- medium
- `productionAllowed`

No invented Browser Home visual primitive is allowed through the gate.
