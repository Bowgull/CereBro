# CereBro Design.md

Last updated: 2026-05-16

## Purpose

This file is the design source of truth for agents working on CereBro.

Use it before touching UI, motion, copy, screenshots, assets, or prototypes.
The existing castle spec still rules the pixel scene. This file tells agents how
to build the whole product around it without falling back to generic AI UI.

Active redesign contract:

- `CEREBRO_UI_REDESIGN_CONTRACT.md` locks the V1 shell direction. Verdigris
  Ivory is the Keep shell theme. Graphite Candle is the dense work-surface
  theme. Soft Parchment is rejected as the global shell.
- `CEREBRO_UI_MOCKUP_CONTRACT.md` locks the approved high-fidelity main shell
  mockup and Browser/Watch Shelf mockup as 1:1 visual targets. They are not
  mood boards or loose inspiration.

Primary reference:

- `CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md`

Critical external references:

- Emil Kowalski Skill: UI taste reference for spacing, hierarchy, motion
  restraint, and interaction polish. Use it as craft vocabulary. Concepts only
  until license is confirmed.
- Impeccable: register-aware design workflow. Use its product-vs-brand split,
  shared design memory pattern, and browser critique loop as references.
- Anthropic Frontend Design Skill: anti-generic frontend reference. Use it
  under CereBro's stricter product rules.
- Uncodixfy: anti-generic UI judgment. Use it as a review rule, not a visual
  style to copy.
- Taste Skill: anti-slop frontend framework and skill family. Use it as a
  reference for stronger layout variance, typography, spacing, motion,
  redesign audits, and image-to-code workflows. MIT. Do not install without
  approval.
- Taste with receipts: generated output must be edited down. Keep the direction
  that fits the audience, constraints, and product surface. Reject the rest
  with receipts.
- Addy Osmani Agent Skills and AIDLC Workflows: engineering and lifecycle
  references for build quality, validation, and closeout.
- Google Stitch: high-fidelity UI exploration. Use it for alternate directions,
  then rebuild by hand against CereBro tokens, layout rules, and real data.
- v0.app: disposable React/Tailwind component scaffolding. Use it for panels,
  forms, tables, drawers, and empty states only after constraints are written.
- Docling: local document understanding candidate for source intake,
  source extraction, and RAG-ready document conversion. Use it when PDFs,
  DOCX, PPTX, XLSX, HTML, images, transcripts, tables, or scanned pages need
  structured parsing.

## Product Shape

CereBro is a cloud-backed, local-controlled personal command center.

The Keep is the product spine. The Workshop is the work surface. Ledger,
Settings, storage, routing, tools, and validation stay below the floor until the
user needs them.

The UI should answer one question at a time:

- What does CereBro think I am doing.
- Which agent has it.
- What receipt or source is being used.
- What will happen next.
- What needs approval.
- What changed.

Design register is explicit:

- Brand work: marketing, editorial, portfolio, launch, story. Design can carry
  the message.
- Product work: Keep, Workshop, Ledger, Settings, tools, dashboards. Design
  serves the task.

CereBro internal surfaces default to product register. Do not import landing
page drama into dense work surfaces.

## Visual Register

Use:

- dark cinematic surfaces
- pixel-art Keep as the brand anchor
- clear workbench panels
- visible receipts
- calm status color
- compact information density
- purposeful motion
- practical castle cues
- Verdigris Ivory shell material for the Keep and command frame
- Graphite Candle material for dense work surfaces

Do not use:

- generic SaaS dashboard layout
- fake premium gradients
- glass panels as the default
- purple-blue gradient dominance
- nested card stacks
- decorative blobs
- metric cards as the first instinct
- hero sections inside internal tools
- fantasy labels that make the product feel like cosplay
- placeholder art presented as final
- Soft Parchment as the global shell
- RPG labels for core OS actions

## Color Tokens

Use the existing `cerebroColors` family.

```ts
export const cerebroColors = {
  background: "#0E1116",
  backgroundSoft: "#131821",
  surface: "#181F2A",
  surfaceRaised: "#202A38",
  surfaceMuted: "#151A23",
  border: "#334155",
  borderSoft: "#253041",
  textPrimary: "#F4EFE3",
  textSecondary: "#B8C0CC",
  textMuted: "#7E8898",
  accent: "#6BA6FF",
  accentSoft: "#2D5B8F",
  accentViolet: "#8B5CF6",
  glowViolet: "#A78BFA",
  success: "#9FD2B7",
  warning: "#F6C177",
  danger: "#EF6F6C",
  blocked: "#7F1D1D",
  gold: "#D9B56A",
  stone: "#6B7280"
};
```

Color rules:

- Dark neutrals carry the product.
- Gold marks Keep identity and important artifacts.
- Blue marks active routing and work state.
- Violet belongs to Cortana, validation, and higher-order routing.
- Green means complete or healthy.
- Amber means waiting, review, or caution.
- Red means blocked, destructive, or denied.
- No random color families.

## Typography

Use system sans-serif for product UI unless an existing component already
defines a stronger local pattern.

Use monospace for:

- terminal output
- source fingerprints
- command logs
- ids
- hashes
- model names
- receipt metadata

Type should be compact and readable. Do not scale font size with viewport width.
Do not use display type inside dense work panels.

## Layout

Core shell:

```text
Left navigation
Center Keep or Workshop
Right context and receipt
Bottom command or log strip
Modal only for hard gates
```

Keep mode:

- The pixel-art castle remains primary.
- Agents stay visible.
- Chamber state reflects work state.
- Aang is the user-facing bridge.
- Cortana is the router.
- No user sprite.

Workshop mode:

- Dense, practical panels.
- Browser, preview, terminal, media, source, and annotation surfaces can sit
  side by side.
- Receipt records must show coordinates, source path, frame time, command,
  task, project, session, and agent route when known.

Ledger mode:

- Timeline first.
- Receipt before summary.
- Show source rows, artifact ids, memory ids, and approval records.

Settings mode:

- Basement feel.
- Plain controls.
- No marketing language.

## Component Rules

Cards:

- Use cards for repeated items, modals, and bounded tools.
- Radius 8px or less unless existing code requires otherwise.
- No card inside card.
- No floating card maze.

Buttons:

- Use icons for tool actions where a standard icon exists.
- Use text for commands that need judgment.
- Primary buttons are rare.
- Disabled states must explain why when space allows.

Panels:

- Stable dimensions.
- Clear headings.
- Source and status metadata visible.
- No decorative labels.

Tables and lists:

- Left aligned.
- Scan friendly.
- Status and ownership columns visible.
- No fake data.

Generated UI drafts:

- Stitch and v0 drafts are sketches, not source of truth.
- Keep the idea only after it survives `DESIGN.md`, the castle spec, the
  anti-slop review, and screenshot inspection.
- Do not paste generated component trees into CereBro without reading and
  simplifying them first.
- Do not accept default shadcn dashboard rhythm when the product needs a Keep,
  Workshop, Ledger, or Settings surface.
- Every generated UI idea must answer the active user question, show receipt,
  show route, or reduce a real control burden.

Empty states:

- Say what is missing.
- Give the next action.
- Do not encourage.

Example:

```text
No receipt selected. Pick a screenshot, source row, command, or artifact.
```

## Motion

Motion must explain state.

Allowed:

- chamber active states
- routing handoff pulses
- approval prompt entry
- drawer transitions
- before and after comparison reveal
- loading state tied to a real operation
- interruptible feedback when the user can change direction

Not allowed:

- constant decorative shimmer
- random hover transforms
- fake background energy
- motion that moves text under the cursor
- animation that hides status or receipts
- frequent keyboard actions or repeated tool toggles

Respect reduced-motion settings.

Interaction polish rules:

- Pressable controls need a subtle pressed state.
- Avoid `transition: all`; animate named properties.
- Prefer transform and opacity for motion.
- Do not animate from nothing. Start with visible scale or opacity context.
- Popovers should feel anchored to their trigger. Modals stay centered.
- Reduce movement before removing useful state feedback.

## Pixel Art Rules

Pixel art is load-bearing.

- Do not replace the Phaser Keep with CSS cards.
- Do not mix unmatched asset packs into the live Keep.
- Inventory existing assets before asking for or generating new ones.
- Call weak or temporary PixelLab output a placeholder.
- Preserve crisp edges.
- Prefer small, readable chamber props over noisy scene filling.

## Copy Rules

Use the project voice from `AGENTS.md`.

- Short declaratives.
- No em dashes.
- No exclamation marks.
- No corporate AI register.
- No cheerleading.
- No vague comfort copy.
- Show the system's read and receipts.

Good:

```text
Aang reads Build mode. Cortana routed Tony. Spock is waiting on the receipt.
```

Bad:

```text
Everything is easier now.
```

## Design Workflow

Every material UI change follows this order:

1. Read the renderer and touched components.
2. Inventory existing assets and tokens.
3. Pick the register: brand or product.
4. If using Stitch or v0, write the constraints first: user question, data,
   receipt, route, tokens, forbidden patterns, and target surface.
5. State the achievable scope.
6. Build the smallest complete slice.
7. Run the app or relevant checks.
8. Inspect screenshots when visual behavior changed.
9. Kill generic directions before polishing.
10. Name the receipts: audience, constraints, source, screenshot, rejected
    alternative, or product reason.
11. Apply the anti-slop review.
12. Record the result in the session handoff.

## Anti-Slop Review

Before delivery, check:

- Does this look like CereBro, or a generic AI dashboard.
- Did I reject the default AI move when it appeared.
- Did I use real project tokens.
- Did I name the product or brand register before judging it.
- Did I make the Keep or workbench clearer.
- Did I hide receipts behind summary.
- Did I use fake charts, fake data, or fake activity.
- Did I add a card because I had no layout idea.
- Did I add a gradient because I had no asset.
- Did I ask the user to decide something the system can infer.
- Did I run visual checks when UI changed.

If the answer is wrong, fix it before delivery.

Taste is not vibes. A good design decision should say what it rejected and why.

## Document Intelligence

Docling is a preferred candidate for source-library document conversion once
the adapter is built.

Use it for:

- PDF, DOCX, PPTX, XLSX, HTML, image, transcript, and scanned-page intake.
- Layout-aware extraction with reading order, tables, formulas, code blocks,
  images, and page coordinates when available.
- Local processing for sensitive documents before any external model call.
- Markdown, HTML, JSON, and structured export lanes feeding Source Library,
  Obsidian, Notion, RAG, and Oak validation.

Do not use it as a blind trust layer. Parsed output still needs source path,
page, coordinate, checksum, parser version, extraction settings, and validation
status.
