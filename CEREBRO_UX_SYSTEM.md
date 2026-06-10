# CereBro UX System

Last updated: 2026-05-09

This is the V1 UX operating manual.

It sits under `DESIGN.md` and beside `CEREBRO_FRONTEND_SYSTEM.md`.

## Stance

CereBro is a local-controlled AI operating layer.

The UX is not chat with extras. It is a visible chain:

```text
Ask Aang -> mode read -> Cortana route -> agent work -> receipt body -> validation -> output -> ledger
```

The system shows its read. The user can correct it. The record stays visible.

## Core Promise

The user should never have to ask:

- what is CereBro doing
- why did it choose that agent
- what source did it use
- what changed
- what needs my approval
- where did the output go
- how do I stop this

## Core Objects

Primary UX objects:

- request
- mode
- route
- task
- agent
- receipt body
- approval
- source
- artifact
- memory
- ledger receipt
- output

Every major flow creates or updates at least one of these objects.

## Modes

V1 everyday modes:

- Ask
- Capture
- Research
- Build
- Create
- Learn
- Watch
- Review

Mode rules:

- Aang infers the mode first.
- Aang states the read when confidence is high.
- Aang asks one short correction question when confidence is low.
- The user can override mode before work starts.
- Mode change does not approve risky action.

Mode receipt:

```text
Aang reads Build mode. Cortana routes Tony. Spock waits on execution approval.
```

## Agent Route

Default route:

```text
user -> Aang -> Cortana -> owner agent -> support agents -> validator -> output
```

Roles:

- Aang reads intent and stays user-facing.
- Cortana owns routing, priority, mode, council, and final decision.
- Tony builds.
- Gojo reviews design and visual output.
- Surfer scouts sources.
- Spock gates security and risky execution.
- Oak curates research and memory truth.
- C-3PO formats and translates.
- Piccolo watches long-running work.
- Hedwig captures, reminds, and relays.
- Batman plans, threat-models, and sequences.

Route rules:

- The route must be visible when work starts.
- Support agents are named when they matter.
- Hidden support work is recorded in the ledger.
- Agent handoff creates a receipt.

## Golden Path

The main flow:

1. User asks or attaches something.
2. Aang reads mode and intent.
3. User can correct the read.
4. Cortana routes the work.
5. Owner agent starts.
6. A receipt body or source is selected or requested.
7. Work proceeds locally when safe.
8. Risky action pauses for approval.
9. Validator checks output when needed.
10. Output lands in the right surface.
11. Ledger records the route, receipt, result, and next action.

Acceptance:

- the user sees the route
- the user sees the receipt
- the user sees the next action
- the user can stop or correct the work

## Keep UX

The Keep is the spatial spine.

Rules:

- Chambers are addresses, not cards.
- Every agent room has one current status.
- The castle shows route movement when work visibly moves.
- Cortana call signals are visible.
- Council appears only when judgment is needed.
- Room zoom stays in place.
- No user sprite.

Primary Keep interactions:

- click room to focus
- hover room to preview status
- click active route to inspect receipt
- open council drawer when active
- switch Blueprint and Scene only during build phase

## Workshop UX

Workshop is for dense work.

Surfaces:

- local preview
- public browser
- terminal
- screenshots
- media frames
- annotations
- source rows
- artifact view
- before and after comparison
- receipt ledger

Rules:

- user can point at a receipt body or source
- agents can inspect the same receipt body or source
- annotations carry coordinates
- visual findings connect back to code or output
- terminal commands show command, owner, approval state, and result
- localhost work is first-class

## Ledger UX

The Ledger is receipt before summary.

It records:

- request
- mode read
- route
- receipt
- approvals
- commands
- sources
- artifacts
- validation
- memory writes
- output location

Rules:

- summary does not replace receipts
- every external action has a receipt
- every memory write has source and approval status
- every artifact has path, owner, and project link

## Approval UX

Approval gates appear for:

- external model call
- browser target with risk
- package install
- clone, build, run, or test external repo
- credential, account, or personal data entry
- file deletion or destructive edit
- storage destination change
- cost or quota risk
- sharing or upload

Gate must show:

- action
- target
- data involved
- agent requesting it
- risk class
- receipt inspected
- allowed actions
- blocked actions
- receipt location

Buttons:

```text
Approve once
Block
Inspect receipt
Change route
```

No global approval by accident.

## Security UX

Spock is the security gate.

Rules:

- Surfer does not browse deeply before Spock clears risky targets.
- Tony does not clone, install, build, or run pasted repo code before Spock clears the execution lane.
- Security tools produce receipts, not truth by decree.
- Browser isolation state must be visible when active.
- Risky target detail stays inspectable after the decision.

## Receipt UX

Receipts are first-class.

Receipt bodies can be:

- screenshot
- image
- video frame
- annotation
- source row
- command output
- file path
- artifact
- memory record
- approval record

Rules:

- receipts show source, owner, time, route, and privacy class when known
- temporary media is marked temporary
- saved receipt bodies create Ledger records
- agents cite the receipt or source they used
- no output claims inspection without a receipt or source

## Memory UX

Memory is approval-aware.

Rules:

- CereBro suggests memory writes.
- User approves meaningful durable memory.
- Current validated notes are retrieval-ready.
- Archive snapshots stay out of normal retrieval unless user asks for history.
- Memory entries cite source id, note path, artifact id, or receipt id.

## Capture UX

Capture enters through Hedwig or Ask Aang.

Capture kinds:

- idea
- reminder
- URL
- TikTok or Reddit link
- YouTube or article
- note
- screenshot
- source
- meeting fragment

Rules:

- capture is fast
- route is visible
- default destination is Notion inbox or configured vault lane
- Obsidian is durable knowledge, not raw catch-all inbox
- user sees whether capture is temporary, inboxed, or archived

## Council UX

Council is for real judgment.

Triggers:

- unclear intent
- risk changed
- taste and implementation conflict
- source truth uncertain
- storage or cost affected
- security block
- validator disagreement
- approval needed

Council view shows:

- reason
- agents present
- current speaker
- receipt
- disagreement
- Cortana decision
- next action
- approval needed

Speech is one agent at a time. Summary is available on demand.

## Blocked UX

Blocked is a working state.

Blocked states must show:

- what is blocked
- why
- who owns it
- what receipt or source is missing
- what user action can unblock it
- what CereBro can do without approval

No vague failures.

## Error UX

Errors should be diagnostic.

Pattern:

```text
Operation failed. Cause if known. Next action.
```

Examples:

```text
Scan failed. Check the source URL.
Preview failed. Start the dev server or choose another target.
Memory write blocked. Pick a source or mark this as a draft.
```

## First Run UX

First run should ask only what is needed:

- vault location
- Notion capture setup
- permission mode
- preferred daily surfaces
- optional Slack capture lane

Rules:

- no long product tour
- no account work unless required
- no fake completion
- show which systems are configured and which are pending

## Daily Open UX

The first read should answer:

- what is active
- what is waiting
- what changed since last open
- what needs approval
- what can be continued

The Keep remains visible. The user can ask immediately.

## Navigation UX

Primary surfaces should resolve toward:

- Keep
- Workshop
- Ledger
- Inbox
- Projects
- Sources
- Terminal
- Approvals
- Settings

Current nav can keep more entries while V1 surfaces are still forming, but the
target user model is smaller.

## Aang Companion UX

Aang companion is a surface, not a second app.

States:

- parked
- listening
- reading mode
- waiting on correction
- routing
- explaining
- blocked
- muted

Rules:

- Aang can explain what CereBro is doing.
- Aang can start quick asks.
- Aang can show one status bubble.
- Aang does not approve hard gates alone.

## Notifications

Notifications must be sparse.

Allowed:

- approval needed
- long-running job done
- scheduled reminder
- capture failed
- security block
- daily brief if enabled

Rules:

- notification opens the relevant receipt or task
- no motivational noise
- no hidden background action

## Accessibility And Keyboard

Minimum V1 keyboard:

- focus Ask Aang
- open command palette or mode selector
- move between rails
- close non-destructive overlays
- submit forms intentionally
- inspect selected receipt

Rules:

- hard gates cannot be approved by stray Enter
- context menus have keyboard equivalents
- focus returns to the invoking control
- reduced motion is respected

## UX Debt

Current debt:

- nav has too many equal top-level surfaces
- Blueprint and Scene toggle is build-phase only
- right context rail is optional but should become smarter
- command intake preview is a start, not the full route receipt
- panel states are inconsistent
- approval queue records previews but does not yet perform approvals
- design review records receipt state but does not yet enforce receipt gates

## Build Rule

Before adding a feature, answer:

1. What user mode is this.
2. Which object does it create or update.
3. Which agent owns it.
4. What receipt or source is used.
5. What approval can block it.
6. Where the receipt lands.
7. What happens when it fails.
