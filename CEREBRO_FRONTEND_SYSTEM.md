# CereBro Frontend System

Last updated: 2026-05-08

This is the canonical frontend system for CereBro V1.

It sits under `DESIGN.md` and above component-level code. If a component,
panel, menu, tray, modal, or mockup conflicts with this file, fix the component.

## Stance

CereBro is a working command center, not a generic dashboard.

The frontend should feel like a local machine with a living Keep inside it:
dark, dense, legible, manual, and visible.

The user should always know:

- what mode CereBro read
- which agent owns the work
- what evidence is being used
- what needs approval
- what changed
- where the receipt lives

External UI generators are sketch lanes, not frontend law.

- Uncodixfy is a review lens for rejecting default AI UI.
- Stitch can explore high-fidelity screen directions.
- v0 can draft React/Tailwind component shapes.
- Accepted ideas are rebuilt in CereBro's components, tokens, and copy voice.
- Screenshot proof decides. The generator does not.

## Shell

The app uses one primary shell:

```text
top bar: mode, permission, connection, global actions
left rail: main surfaces
center: Keep, Workshop, Ledger, or active tool
right rail: context, evidence, active agent
bottom bar: Ask Aang and attachments
modal: hard gates only
```

Rules:

- The Keep is the home surface.
- The Workshop is the dense work surface.
- The Ledger is proof and history.
- Settings, permissions, storage, model routing, and adapter state stay visible only when relevant.
- Do not make separate dashboards for concepts that belong in the same shell.

## Typography

Use compact type.

Default:

- system sans for normal product UI
- monospace for terminal, ids, hashes, source paths, logs, model names, command output, and evidence metadata

Scale:

- app title: 14 to 18 px, uppercase only where already part of the shell
- panel title: 12 to 14 px, uppercase, tight tracking
- section label: 10 to 11 px, uppercase
- body: 12 to 13 px
- dense metadata: 10 to 11 px
- button text: 11 to 12 px

Rules:

- No viewport-scaled type.
- No display type inside panels.
- Line length stays short in side rails.
- Long paths and ids use monospace and wrap or truncate with visible title text.
- Text must never overlap controls, status chips, or proof records.

## Color

Use `cerebroColors`.

Meaning:

- dark neutrals carry the product
- gold marks Keep identity, receipts, artifacts, and council surfaces
- blue marks active routing and work state
- violet marks Cortana, validation, routing, and council authority
- green marks complete or healthy
- amber marks waiting, review, or caution
- red marks blocked, destructive, denied, or failed
- muted grey marks dormant, archived, or unavailable

Rules:

- No new color family without a written reason.
- No purple-blue gradient dominance.
- No decorative blobs.
- No random accent color per panel.
- Destructive states must use red plus text, not red alone.

## Borders And Shape

Default radius:

- buttons: 4 to 6 px
- input fields: 4 to 6 px
- cards and bounded tools: 6 to 8 px
- modal windows: 8 px max
- pixel Keep surfaces: square or 2 px where possible

Border rules:

- Use `borderSoft` for passive separation.
- Use `border` for active panels and tool frames.
- Use agent color only for state, ownership, or route.
- Do not nest cards inside cards.
- Do not style whole page sections as floating cards.
- Panels are slabs, rails, drawers, or windows. Cards are repeated items.

## Buttons

Button types:

- icon button: tool action with standard icon
- text button: judgment action
- segmented button: mode or view switch
- destructive button: irreversible or risky action
- ghost button: low-risk local view change

Rules:

- Primary buttons are rare.
- Text buttons use verbs.
- Disabled buttons explain why when space allows.
- Icon buttons need labels and tooltips.
- Button text is short. No marketing.
- Hard approval actions must say the action, target, and risk class nearby.

Examples:

```text
Preview
Attach
Route to Gojo
Record evidence
Block action
Reset filters
```

## Inputs

Ask Aang is the primary command input.

Rules:

- Placeholder text names the action.
- Attachments show temporary vs saved state.
- Search inputs say what they search.
- Textareas should preserve line breaks for notes, receipts, and evidence.
- Empty required fields block submission and name the missing field.
- The system must not hide submitted context inside a toast.

## Dropdown Menus

Use dropdowns for compact choice sets.

Rules:

- Trigger label shows current value.
- Menu items use sentence case unless they are product names.
- Destructive menu items sit in their own group.
- Menus never contain long explanations.
- If the choice changes risk, use an approval gate instead of a silent menu change.
- Keyboard navigation must work.

## Context Menus

Use context menus only on objects with local actions:

- evidence record
- source row
- artifact
- annotation
- room
- task
- command log line

Rules:

- First item should be inspect, open, or focus.
- Risky actions require a gate.
- Context menus do not hide primary actions.
- Every context action must have a visible equivalent somewhere else.

## Trays, Drawers, And Rails

Right rail:

- active agent
- current route
- evidence
- selected object
- permission state

Bottom drawer:

- logs
- council
- comparison
- temporary media review
- long command output

Side drawer:

- settings
- filters
- detailed source metadata

Rules:

- Drawers preserve current work.
- Drawers do not replace hard gates.
- Trays show status and next action.
- Long-running work stays visible in rail or ledger.

## Windows And Panels

Panel anatomy:

```text
title
status or route
filters or controls
primary content
evidence or receipt footer
```

Rules:

- Panel title says the surface, not the feature pitch.
- Status appears near the title.
- Filters sit above the content they affect.
- Empty state sits in content position.
- Receipts sit in footer or detail rail.
- Panels must be scroll-safe.

## Tables And Lists

Use tables for comparisons, ledgers, source rows, and queues.

Use lists for records where the title and summary matter more than columns.

Rules:

- Left aligned.
- Ownership and status visible.
- Time and source visible when it affects trust.
- No fake metrics.
- Row click opens detail. It does not trigger action.
- Action buttons live at row end or in detail view.

## Status Chips

Status chips are facts, not decoration.

Required status classes:

- idle
- working
- waiting
- needs approval
- blocked
- validating
- failed
- complete
- dormant

Rules:

- Chip color matches semantic color.
- Chip text is short.
- The detail view explains the reason.
- Dormant is visible but quiet.

## Modals

Use modals only for hard gates:

- external action
- destructive action
- credential or account step
- privacy-sensitive source
- risky browser target
- package install or code execution
- storage or cost change

Rules:

- Modal title names the decision.
- Body lists action, target, data involved, risk, and receipt location.
- Buttons are explicit.
- Escape and close do not approve.
- The user can inspect evidence before deciding.

## Toasts

Toasts are for short confirmation only.

Rules:

- Toasts never carry the only receipt.
- Toasts do not explain complex failure.
- Toasts do not congratulate.
- Errors name the failed operation and next action.

Examples:

```text
Evidence recorded.
Scan failed. Check the source URL.
Approval saved.
```

## Empty States

Empty states say what is missing and what to do.

Examples:

```text
No evidence selected. Pick a screenshot, source row, command, or artifact.
No approvals match these filters. Reset filters or change status.
No source rows yet. Capture a URL, file, note, or GitHub repo.
```

## Motion

Motion explains state.

Allowed:

- chamber state change
- route pulse
- drawer entry
- approval gate entry
- before and after comparison reveal
- loading tied to real operation

Not allowed:

- decorative shimmer
- random hover motion
- motion that hides text
- motion that makes proof hard to read

Respect reduced motion.

## Accessibility

Rules:

- Every interactive control has an accessible name.
- Focus states are visible.
- Keyboard flow matches visual flow.
- Esc closes non-destructive overlays only.
- Hard gates cannot be approved accidentally.
- Text contrast must hold on dark surfaces.
- Color cannot be the only status signal.
- Tables and forms use labels.

## Component Debt

Current `app/client/src/components/ui/*` primitives are useful, but many still
carry default shadcn-style visual choices.

Debt to resolve:

- card radius is too large in `card.tsx`
- menu and dialog classes use generic theme tokens
- button variants do not map to CereBro semantic intent yet
- drawer and dialog chrome need CereBro surface, border, and copy rules
- context menus need visible-equivalent action rules

Do not refactor all primitives at once. Update them as surfaces are rebuilt.

## Build Rule

Before shipping a frontend slice:

1. Read `DESIGN.md`.
2. Read this file.
3. Name the surface and UX job.
4. If Stitch or v0 shaped the slice, write the constraint block and cleanup
   notes.
5. Inspect the current component.
6. Patch with existing tokens.
7. Screenshot or preview.
8. Record evidence in the handoff.
