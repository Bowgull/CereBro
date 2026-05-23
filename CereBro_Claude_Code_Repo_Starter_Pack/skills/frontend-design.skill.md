# Frontend Design

## Version

1.0

## Purpose

Create implementation-ready frontend UI specifications.

## Owner Agents

- Gojo

## Supporting Agents

- Tony
- Professor Oak

## When To Use

- new screens
- UI refactors
- component planning
- dashboard design

## When Not To Use

- backend-only tasks

## Inputs Required

- Screen goal
- User goal
- Root `DESIGN.md`
- Castle design system when the Keep is touched
- External design constraint block when using Stitch or v0
- Target device
- Data displayed
- Existing component or renderer path
- Existing assets and tokens

## Tools Required

- Design System
- Screenshot or browser preview when UI changes

## Permission Level

Planning and drafting are safe.

Any file writes, Notion writes, Obsidian writes, browser automation, terminal commands, external model calls, or destructive actions require the permission rules defined in `SECURITY_PRIVACY.md`.

## Steps

1. Confirm the active Project Space.
2. Confirm the task and mode.
3. Read root `DESIGN.md`.
4. Read `CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md` if the Keep, agents, castle, palette, or pixel art are touched.
5. Read the renderer and components that would be edited.
6. Inventory existing assets, tokens, states, and data before proposing new ones.
7. If using Stitch or v0, write the constraint block first: surface, user question, real data, proof, route, tokens, forbidden patterns, and viewport.
8. Treat generated UI as a sketch. Rebuild the accepted idea in CereBro's own components.
9. State the achievable scope and any honest placeholders.
10. Build the smallest complete slice.
11. Run relevant checks.
12. Inspect the UI with browser or screenshot review when visuals changed.
13. Run Anti-Slop Review before delivery.
14. Mark assumptions and uncertainty.
15. Request Oak validation if the output is important, factual, saved, architectural, or build-related.
16. Request user approval if the action writes externally, exports, executes risky commands, browses privately, or changes long-term memory.
17. Log the result.

## Output Format

```md
# Frontend Design Output

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
- Root `DESIGN.md` was used.
- Existing tokens and assets were checked before new ones were added.
- Stitch or v0 output, if used, was simplified and rebuilt rather than pasted as final.
- UI does not look like generic SaaS or default AI output.
- Pixel art was preserved when the Keep was touched.
- Workbench surfaces show proof, routing, and next action.
- Copy follows `AGENTS.md` voice.
- Visual changes were checked in a running UI or screenshot where possible.
- Required details are not summarized away.
- Risky actions are approval-gated.
- Saved outputs go through Oak where required.
- Memory writes are proposals, not direct writes.

## Failure Modes

- Acting without enough context.
- Skipping `DESIGN.md`.
- Skipping approval.
- Skipping validation.
- Shipping generic UI because it was faster.
- Trusting Stitch or v0 output because it looked polished.
- Replacing pixel art with ordinary web layout.
- Presenting placeholder assets as final.
- Adding motion without function.
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
