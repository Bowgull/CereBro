# Claude Code Start Here

You are Claude Code / Opus building CereBro V1.

## Mandatory First Action

Before writing application code, read:

1. `README.md`
2. `MASTER_BLUEPRINT.md`
3. `ARCHITECTURE.md`
4. `AGENTS.md`
5. `SKILLS.md`
6. `DATA_MODEL.md`
7. `ROADMAP.md`
8. `OPEN_QUESTIONS.md`
9. `TECH_STACK_DECISION.md`
10. `V1_ACCEPTANCE_CRITERIA.md`
11. The three larger CereBro planning documents in this folder.

Then report:

```text
Files reviewed:
Missing files:
Architecture risks:
Recommended first build step:
Open questions that block implementation:
Open questions that do not block implementation:
```

## What You Are Building

You are building CereBro V1:

A local-first, task-based AI operating system with a harness, project spaces, tasks, sessions, memory, skill files, agents, validation, outputs, browser research, and controlled tools.

## What You Must Not Do

Do not:

- Remove harness-first architecture.
- Start coding before checking source files.
- Invent new agents.
- Build Raven Reviews first.
- Re-add Declyne to V1.
- Build a full Penpot/Immich/Trilium/Kestra/Skyvern clone.
- Make browser automation always-on.
- Require external models.
- Require Notion.
- Require an external SSD.
- Store secrets in Markdown.
- Let agents write memory directly.
- Let important outputs bypass Oak.
- Run destructive cleanup silently.
- Replace detailed blueprint decisions with summaries.

## First Implementation Phase

Start with Phase 0:

1. Confirm docs.
2. Confirm folder structure.
3. Confirm schemas.
4. Confirm skill files.
5. Confirm agent configs.
6. Confirm environment example.
7. Create or update `CHANGELOG.md`.
8. Create or update `OPEN_QUESTIONS.md`.
9. Do not build UI until documentation and schema scaffolding are aligned.

## Approval Behavior

If a change is architecture-affecting, stop and ask.

If a change is implementation detail within the approved architecture, proceed and log it.

## Required Output After Every Work Session

Report:

- Summary
- Files changed
- Decisions made
- Tests run
- Issues found
- Open questions
- Changelog entry
