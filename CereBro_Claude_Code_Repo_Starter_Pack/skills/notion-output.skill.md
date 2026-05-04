# Notion Output

## Version

1.0

## Purpose

Format and export polished user-facing outputs to Notion.

## Owner Agents

- C-3PO

## Supporting Agents

- Aang
- Piccolo
- Professor Oak

## When To Use

- guides
- checklists
- project dashboards
- recipes
- learning plans

## When Not To Use

- raw internal memory
- temporary notes

## Inputs Required

- Title
- Output type
- Project
- Template
- Approval status

## Tools Required

- Notion Bridge

## Permission Level

Planning and drafting are safe.

Any file writes, Notion writes, Obsidian writes, browser automation, terminal commands, external model calls, or destructive actions require the permission rules defined in `SECURITY_PRIVACY.md`.

## Steps

1. Confirm the active Project Space.
2. Confirm the task and mode.
3. Confirm required inputs.
4. Load relevant context pack.
5. Apply this skill's workflow.
6. Produce structured output.
7. Mark assumptions and uncertainty.
8. Request Oak validation if the output is important, factual, saved, architectural, or build-related.
9. Request user approval if the action writes, exports, executes, browses privately, or changes long-term memory.
10. Log the result.

## Output Format

```md
# Notion Output Output

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
- Required details are not summarized away.
- Risky actions are approval-gated.
- Saved outputs go through Oak where required.
- Memory writes are proposals, not direct writes.

## Failure Modes

- Acting without enough context.
- Skipping approval.
- Skipping validation.
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
