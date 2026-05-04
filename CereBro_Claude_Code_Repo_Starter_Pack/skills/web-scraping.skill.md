# Web Scraping

## Version

1.0

## Purpose

Define safe extraction procedures for web content when standard ingestion fails.

## Owner Agents

- Silver Surfer

## Supporting Agents

- Professor Oak

## When To Use

- standard extraction fails
- browser-assisted extraction needed

## When Not To Use

- paywall bypass
- access-control evasion
- sensitive personal data

## Inputs Required

- URL
- Reason
- Permission status

## Tools Required

- Browser adapter

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
# Web Scraping Output

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
