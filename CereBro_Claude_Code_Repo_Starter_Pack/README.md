# CereBro V1 — Claude Code Repo Starter Pack

This folder is the missing repo-ready layer that sits beside the three larger CereBro planning documents already generated.

The user should place this folder in the same GitHub repository/folder as:

- `CereBro_V1_Revised_Architecture_Blprint_FULL.md`
- `CereBro_V1_Revised_Architecture_Blueprint_FULL.md`
- `CereBro_V1_Full_Companion_Build_Docs.md`
- `CereBro_V1_Final_Implementation_Pack_COMBINED.md`
- `CereBro_V1_Final_Implementation_Pack.zip`

If the filename has a typo, Claude Code must still locate the matching CereBro V1 revised architecture blueprint by content.

## Purpose

This starter pack gives Claude Code / Opus the actual repo-facing files it needs before writing application code.

It includes:

- root source-of-truth docs
- exact Claude start prompt
- open questions
- roadmap
- changelog
- agent registry
- machine-readable agent configs
- skill files
- JSON schemas
- design system starter
- Obsidian templates
- Notion templates
- output templates
- seed registries
- environment example
- manual QA checklist
- third-party notices placeholder
- decision records

## Build Rule

Claude Code must read:

1. `README.md`
2. `MASTER_BLUEPRINT.md`
3. `CLAUDE_CODE_START_HERE.md`
4. The three larger CereBro blueprint/planning documents
5. All files in this starter pack

before building code.

## Non-Abbreviation Rule

Do not summarize away important details.

Do not replace lists with:

- “etc.”
- “and so on”
- “similar”
- “as needed”

When a detail is not defined, add it to `OPEN_QUESTIONS.md`.

When a decision changes, add it to `docs/decisions`.

When code changes, update `CHANGELOG.md`.

## V1 Build Priority

Build in this order:

1. Documentation alignment
2. Schema validation
3. Local app shell
4. SQLite database
5. Project Spaces
6. Tasks and Sessions
7. Harness Runtime
8. Agent registry
9. Skill loader
10. Source Library
11. Output Library
12. Memory proposal flow
13. Oak validation
14. Obsidian writer
15. Chroma integration
16. Notion Bridge
17. Tony Build Flow
18. Gojo Creative Flow
19. Piccolo workflows
20. Model Router
21. Browser adapter
22. Testing and hardening

Do not start with Raven Reviews.

Do not start with Declyne.

Do not start with advanced browser automation.

Do not start with a full media vault.

Do not start with a desktop wrapper.
