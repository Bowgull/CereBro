# Anti-Slop Review

## Version

1.0

## Purpose

Prevent generic lazy low-quality AI output in design, writing, and creative work.

## Owner Agents

- Professor Oak / Gojo

## Supporting Agents

- C-3PO
- Tony

## When To Use

- UI design
- dashboards
- brand design
- content plans
- important docs

## When Not To Use

- tiny internal notes

## Inputs Required

- Draft output
- Project context
- Style profile
- Root `DESIGN.md` for UI, motion, or product copy
- Screenshot or rendered output when visual work changed

## Tools Required

- Validation

## Permission Level

Planning and drafting are safe.

Any file writes, Notion writes, Obsidian writes, browser automation, terminal commands, external model calls, or destructive actions require the permission rules defined in `SECURITY_PRIVACY.md`.

## Steps

1. Confirm the active Project Space.
2. Confirm the task and mode.
3. Read root `DESIGN.md` when UI, motion, or product copy is involved.
4. Load relevant context pack.
5. Identify the likely generic AI moves for this output.
6. Check the draft against those failure modes.
7. If Stitch or v0 shaped the output, check that the result was rebuilt in CereBro's system rather than pasted through.
8. If document intelligence shaped the output, check that Docling or parser receipts are visible where relevant.
9. Name concrete violations.
10. Patch the output or return a punch list if patching is out of scope.
11. Produce structured output.
12. Mark assumptions and uncertainty.
13. Request Oak validation if the output is important, factual, saved, architectural, or build-related.
14. Request user approval if the action writes externally, exports, executes risky commands, browses privately, or changes long-term memory.
15. Log the result.

## Output Format

```md
# Anti-Slop Review Output

## Objective

## Context

## Work Performed

## Result

## Risks / Warnings

## Required Approval

## Validation Needed

## Next Action
```

## Validation Checklist

- The output matches the user goal.
- The output respects the active project.
- The output preserves blueprint rules.
- The output does not use generic SaaS defaults.
- The output does not use fake premium gradients, glass panels, decorative blobs, or card mazes.
- The output does not hide proof behind summary.
- The output uses project tokens, project voice, and real assets where available.
- Generated UI output is treated as sketch material, not final authority.
- Document extraction claims cite source path, page or coordinate when available, parser, and validation state.
- The output names placeholders honestly.
- The output closes on a fact, state, or next action.
- Required details are not summarized away.
- Risky actions are approval-gated.
- Saved outputs go through Oak where required.
- Memory writes are proposals, not direct writes.

## Failure Modes

- Acting without enough context.
- Skipping approval.
- Skipping validation.
- Reviewing vibes instead of naming exact violations.
- Calling output final without seeing it.
- Letting copied reference style override CereBro's identity.
- Letting Stitch or v0 polish hide weak product structure.
- Treating parsed document output as truth without receipts.
- Treating open-source inspiration as license clearance.
- Overbuilding a simple task.
- Mixing project memory.
- Replacing detailed requirements with vague summaries.

## Human Approval Required When

- Writing files.
- Updating Notion.
- Updating Obsidian.
- Running browser automation.
- Running terminal commands.
- Calling external models with private context.
- Deleting or moving files.
- Saving long-term memory.

## Examples

Examples should be added during implementation when the skill is used successfully in the app.

## Related Skills

See `SKILLS.md`.
