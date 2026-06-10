# Aang Learning

## Version

1.0

## Purpose

Turn a user learning goal into structured teaching artifacts without pretending learning progress has been validated.

## Owner Agents

- Aang

## Supporting Agents

- C-3PO
- Professor Oak
- Spock
- Gojo

## When To Use

- beginner guide requests
- explain-it-to-me requests
- quizzes
- flashcards
- checklists
- practice plans
- resource lists
- LearningPath curricula

## When Not To Use

- direct implementation tasks
- factual research without a teaching goal
- private or high-stakes advice that needs a domain expert

## Inputs Required

- Learning goal
- Current learner level
- Desired artifact type
- Time horizon
- Constraints or preferred format
- Source material, if the user supplied any

## Tools Required

- Local memory search
- Source Library when source-backed learning is needed
- Artifact creator
- Validation registry

## Permission Level

Planning and drafting are safe.

Any file writes, Notion writes, Obsidian writes, browser automation, terminal commands, external model calls, or long-term memory writes require the permission rules defined in `SECURITY_PRIVACY.md`.

## Steps

1. Clarify the learner level and goal if either is unclear.
2. Pick the smallest useful artifact type.
3. Build a context pack from user-provided material first.
4. If external sources are required, request Surfer and the browser policy gate.
5. Draft the learning artifact.
6. Mark assumptions, prerequisites, and confidence.
7. Ask C-3PO to format for the target surface.
8. Ask Spock to check structure and contradictions for curricula.
9. Ask Oak to validate factual claims for important or saved artifacts.
10. Save only after the user approves the output destination.

## Output Format

```md
# Aang Learning Output

## Learner Goal

## Assumed Level

## Artifact Type

## Prerequisites

## Lesson / Plan / Cards / Quiz

## Practice

## Checkpoints

## Sources / Assumptions

## Validation Needed

## Next Action
```

For LearningPaths, use:

```md
# LearningPath

## Goal

## Starting Level

## Outcome

## Modules

## Checkpoints

## Practice Cadence

## Review / Refresh Schedule

## Sources / Assumptions
```

## Validation Checklist

- The artifact matches the learner level.
- The first step is actionable.
- Prerequisites are explicit.
- Important factual claims are source-backed or marked.
- The artifact does not pretend completion or mastery.
- Saved artifacts go through Oak where required.
- Memory writes are proposals, not direct writes.

## Failure Modes

- Teaching above the learner's level.
- Creating a giant curriculum when a short guide was enough.
- Treating unsourced claims as facts.
- Saving progress or preferences without approval.
- Replacing the user's goal with generic study advice.

## Human Approval Required When

- Saving to memory.
- Saving to Notion or Obsidian.
- Browsing for sources.
- Calling external models with private context.
- Creating recurring study reminders.

## Examples

Examples should be added after this skill is used successfully in the app.

## Related Skills

- `source-ingestion`
- `validation`
- `notion-output`
- `obsidian-memory-write`
