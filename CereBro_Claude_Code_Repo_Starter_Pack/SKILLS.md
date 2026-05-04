# CereBro V1 — Skills

## Purpose

Skills are reusable Markdown instruction modules.

They are not agents.

They teach agents how to perform specific workflows.

## Required V1 Skill Files

Located in `/skills`:

- `tony-build-flow.skill.md`
- `claude-code-handoff.skill.md`
- `browser-research.skill.md`
- `source-ingestion.skill.md`
- `notion-output.skill.md`
- `obsidian-memory-write.skill.md`
- `anti-slop-review.skill.md`
- `frontend-design.skill.md`
- `cleanup-backup.skill.md`
- `validation.skill.md`
- `web-scraping.skill.md`
- `remotion-video.skill.md`
- `video-editing.skill.md`
- `ui-motion.skill.md`

## Skill Format

Every skill uses:

```md
# Skill Name

## Version

## Purpose

## Owner Agents

## Supporting Agents

## When To Use

## When Not To Use

## Inputs Required

## Tools Required

## Permission Level

## Steps

## Output Format

## Validation Checklist

## Failure Modes

## Human Approval Required When

## Examples

## Related Skills
```

## Rule

Claude Code must load skills from files.

Do not hardcode all skill behavior into agent prompts.
