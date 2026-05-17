# CereBro UI Redesign Contract

Status: current.
Last updated: 2026-05-17.

This file locks the V1 redesign direction before the execution core expands.
It sits under `DESIGN.md` and beside `CEREBRO_FRONTEND_SYSTEM.md`.

## Purpose

CereBro is a Keep-first AI OS. The redesign must make autonomy easier to
control, not make the product look like a fantasy dashboard or a tool registry.

The UI should answer:

- what Aang read
- where Cortana routed it
- which agent owns it
- what proof exists
- what needs approval
- what will happen next

## Locked Theme Direction

### Verdigris Ivory

Verdigris Ivory is the default Keep shell theme.

Use it for:

- main shell frame
- left rail
- Aang rail
- bottom command bar
- Keep home
- route receipts around the castle
- lightweight everyday OS states

Shape:

- dark verdigris and black stone shell
- ivory text and quiet ivory surfaces where clarity needs it
- restrained gold trim
- carved plaque rail controls
- softened Aang panel
- instrument-like command bar
- quiet OS tabs
- visible focus rings
- 8px maximum radius

### Graphite Candle

Graphite Candle is the dense work-surface theme.

Use it for:

- Workbench
- Terminal Lab
- Project Lab
- Ledger
- Approvals
- Sources
- Model Registry
- Settings and Basement
- tables, logs, receipts, gates, and proof panels

Shape:

- graphite slabs
- candle-warm highlights
- compact controls
- clear row boundaries
- status color by meaning
- destructive and risky actions isolated
- disabled states with reason text when space allows

### Rejected Global Theme

Soft Parchment is rejected as the global shell.

It may be used later for narrow note, learning, document, or source-reading
views only after a surface owner is named. It must not become the default Keep
or OS shell.

## Locked Keep Anatomy

The first redesign pass must not change the Keep anatomy.

Locked:

- 11 agents
- 3 floors
- no extra rooms
- no user sprite
- no new primary surface
- no replacement of the Phaser Keep
- no castle art replacement in the first redesign pass

The 11 V1 agents are:

- Aang
- Cortana
- Tony Stark
- Gojo
- Silver Surfer
- C-3PO
- Batman
- Professor Oak
- Spock
- Piccolo
- Hedwig

Cortana remains the council and routing heart. Aang remains the only
human-facing conversational handle. Agents may be visible when routing or work
state makes them relevant.

Silver Surfer direction is surfboard, not horse. This is an asset and animation
phase item, not a first shell sweep item.

## Product Register

CereBro internal UI is product register.

Do:

- use plain OS labels
- keep the castle as the main object on Keep home
- hide machinery until requested
- surface receipts and approvals only where useful
- use motion to clarify route, focus, and state
- keep mode, route, proof, approval, and next action visible

Do not:

- use RPG labels
- use fake SaaS metric cards as the default read
- show registries, audits, MCPs, plugins, models, and debug proof on the
  primary Keep surface
- use decorative gradients, blobs, glass, or fantasy ornament as filler
- add extra panels just because data exists
- expose execution controls before the approval contract exists

Plain labels stay plain:

- Keep
- Work
- Library
- Memory
- Ledger
- Browser
- Terminal
- Files
- Sources
- Outputs
- Basement

## Shell Contract

The shell remains:

```text
left rail: main surfaces
center: Keep, Workshop, Ledger, or active tool
right rail: Aang context, route, receipt, selected object
bottom bar: Ask Aang and mode-aware action
modal: hard gates only
```

Left rail:

- plaque buttons
- compact icons
- labels visible at wide widths
- active state is structural, not loud
- settings stay in Basement

Center:

- Keep home keeps the castle dominant
- Workshop surfaces carry proof bodies
- Ledger carries receipts
- Basement carries machine capabilities

Right rail:

- Aang first
- soft, readable, low machinery
- default groups: Mode, Read, Route, Current Agent, Next Action
- proof is collapsed unless needed
- raw internals stay out of the default view

Bottom command:

- polished instrument control
- asks Aang
- attachment and source affordances are quiet
- action label changes by mode and risk
- never implies approval of risky work by changing mode

Modals:

- only hard gates
- 8px maximum radius
- action, target, risk class, approver, and recovery note visible
- destructive controls are isolated

## Surface Rollout Order

Build the redesign in bounded slices.

1. Contract and shell tokens.
2. Main shell frame, left rail, Aang rail, and bottom command bar.
3. Keep home route read and quiet OS tabs.
4. Project Lab push readiness and risk read.
5. Terminal Lab command preview and approval gate read.
6. Workbench validation body and browser proof.
7. Ledger receipt readability.
8. Approvals and hard-gate modal shape.
9. Sources and research evidence lanes.
10. Model Registry and Settings/Basement machinery.

Do not sweep all panels in one uncontrolled patch.

## Execution Redesign Dependency

The redesign must prepare the user to approve autonomous work.

Execution controls stay blocked until these exist:

- route receipt
- task or work object
- Workbench body when visual or command proof is needed
- approval receipt
- risk class
- executor agent
- result receipt
- recovery note when possible

`canExecute` remains false until the execution contract is implemented and
tested.

## Screenshot Proof

Material UI changes require screenshot proof.

For each surface:

- name the register
- name the primary object
- name what machinery was hidden
- name what approval or receipt is visible
- save a screenshot path
- record the proof in `CEREBRO_SESSION_HANDOFF.md`

## Drift Gates

Stop and ask before:

- replacing the Phaser Keep
- adding or removing agents
- adding rooms
- creating a new primary surface
- exposing execution runners
- adding paid services
- installing, cloning, or running external repos
- moving Raven data into CereBro
- turning Soft Parchment into the global shell
- changing the Keep from AI OS into RPG UI

## Done Criteria For The First Redesign Pass

The first pass is done when:

- this contract is linked from active build docs
- shell tokens exist in code
- main shell frame follows Verdigris Ivory
- dense surfaces have a Graphite Candle baseline
- Aang rail is softer and less mechanical
- bottom command bar reads as the primary control
- screenshot proof exists
- `pnpm -C app check` passes

The first pass does not need new castle art, new sprite animation, execution
runners, model calls, browser automation, or walkthrough work.
