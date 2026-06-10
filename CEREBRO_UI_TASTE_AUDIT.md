# CereBro UI Taste Audit

Status: current.
Last updated: 2026-05-16.

This file turns the new UI references into a working audit system for CereBro.
It does not replace `DESIGN.md`, the castle spec, or the anti-drift law.

## Source Order

Use this order every time:

1. Newest direct user instruction.
2. `CEREBRO_MASTER_BUILD_PLAN.md`.
3. `CEREBRO_ANTI_DRIFT_LAW.md`.
4. `DESIGN.md`.
5. Castle spec and active renderer.
6. This audit.
7. External UI references.

External references are pressure, not permission.

## Register First

Before judging UI, name the register.

- Product surface: Keep, Workshop, Project Lab, Terminal Lab, Workbench,
  Ledger, Basement, Settings, security, tools, model registry, source library.
- Brand surface: public site, launch page, deck, portfolio, showcase, client
  story, editorial artifact.

CereBro app surfaces default to product register. Product register is quiet,
dense, task-led, and proof-aware. Brand register may carry more atmosphere and
story only when the surface is meant to sell or explain CereBro externally.

## Reference Roles

### Taste Skill

Use Taste Skill for anti-slop frontend pressure:

- layout variance
- typography hierarchy
- spacing discipline
- motion restraint
- redesign audits
- image-to-code workflow ideas
- visual variant thinking

Do not install or copy Taste Skill files without approval.

### Impeccable

Use Impeccable for process:

- product-vs-brand register split
- shared design memory
- screenshot critique loop
- critique before patching
- browser proof before calling a surface done

Do not import its product identity.

### Emil Kowalski

Use Emil as craft vocabulary:

- hierarchy
- spacing
- calm motion
- interaction polish
- anchored popovers
- restrained transitions

Concepts only unless license is confirmed.

### Uncodixfy

Use Uncodixfy as the rejection check:

- reject generic AI dashboard rhythm
- reject fake premium gradients
- reject nested card piles
- reject meaningless icons or labels
- reject placeholders pretending to be final

### Stitch And v0

Use these only as sketch lanes.

Before using either, write the constraint block:

- surface
- register
- user question
- real data shown
- route shown
- receipt shown
- tokens allowed
- forbidden patterns

Never paste generated UI into CereBro as final. Rebuild the surviving idea by
hand with CereBro tokens and real data.

## Audit Flow

Run this before material UI work and before closing material UI work.

1. Read the owning component and any copy model.
2. Name the surface and register.
3. Name the current user question the surface must answer.
4. Identify the primary object on screen.
5. Check that Aang, Cortana, owner, receipt, approval, or next action is visible
   where the surface needs it.
6. Find the machinery. Move it below the floor, into a disclosure, or into
   Basement if it is not the primary object.
7. Reject generic AI UI moves before polishing.
8. Patch the smallest complete slice.
9. Run targeted tests or `pnpm check` when app code changed.
10. Screenshot-proof visual changes.
11. Record the rejected generic move and the product reason in the handoff.

## Surface Questions

- Keep: What is active, who owns it, what happens next.
- Project Lab: What project needs attention, what is dirty, what is safe next.
- Terminal Lab: What command means, what failed, what Tony should do elsewhere.
- Workbench: What body or proof exists, what needs validation.
- Ledger: What happened, what receipt proves it, what action is waiting.
- Basement: What machinery exists, what is ready, what is gated.
- Source/Research: What source was used, how trustworthy it is, where it goes.
- Approvals/Security: What is blocked, why, and what approval would change.

## Anti-Slop Kill List

Kill these before polish:

- generic SaaS dashboard layout
- fake metric cards
- fake premium gradients
- purple-blue wash as identity
- glass panels as default
- nested cards
- decorative blobs
- unexplained shimmer
- motion without state meaning
- raw ids as primary labels
- proof hidden so deeply the user cannot verify
- proof exposed so loudly the product becomes debug UI
- vague empty states
- "AI assistant" language where Aang/Cortana/agent routing should be explicit
- brand drama inside product tools

## Motion Rules

Motion must explain state.

Allowed:

- route handoff
- drawer open/close
- approval prompt entry
- before/after reveal
- progress tied to a real operation
- subtle pressed state

Not allowed:

- random hover lifts
- constant shimmer
- movement under the cursor
- motion that hides status
- transition-all as default

Respect reduced motion.

## Screenshot Review

For visual changes, capture proof.

Minimum review:

- desktop viewport
- the changed surface open
- the primary object visible
- no overlapping text
- no broken focus or disabled state
- no hidden destructive/risk state
- screenshot path recorded in handoff

If browser tooling is unavailable, say so. Do not claim visual proof.

## Scorecard

Use this quick score in handoffs when a UI slice matters.

```text
Surface:
Register:
Primary object:
User question:
Route visible:
Receipt/proof visible:
Approval/risk visible:
Machinery hidden until needed:
Generic UI rejected:
Screenshot proof:
Remaining taste risk:
```

## Stop Rules

Stop and ask before:

- new primary surface
- replacing the Phaser Keep
- adding brand-register drama to product tools
- installing UI tools or copying skill files
- using generated UI as final code
- adding dependencies
- moving Raven into CereBro
- hiding all receipts
- exposing all machinery

## Current Surface Audit Queue

1. Model Tools: live capability map, source-verified proposal path, eval counts.
2. Project Lab: project card density, push decision clarity, proof placement.
3. Terminal Lab: teaching lane clarity, no execution confusion.
4. Workbench: body/proof hierarchy, visual validation flow.
5. Ledger: audit trail scan, route/body/gate action clarity.
6. Home shell: first read, next action, context panel compression.
7. Keep scene: only after active build path returns to animation/pixel pass.

Do not run this queue as a redesign. Apply it to the active build path.
