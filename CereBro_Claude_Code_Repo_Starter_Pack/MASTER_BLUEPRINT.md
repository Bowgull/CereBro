# CereBro V1 — Master Blueprint Index

## Purpose

This file is the repo-facing master index for CereBro V1.

It does not replace the larger blueprint documents. It points Claude Code / Opus to the complete source materials and locks the build hierarchy.

## Source of Truth Files

Claude Code must read these in order:

1. `CereBro_V1_Revised_Architecture_Blueprint_FULL.md`
2. `CereBro_V1_Full_Companion_Build_Docs.md`
3. `CereBro_V1_Final_Implementation_Pack_COMBINED.md`
4. `README.md`
5. `CLAUDE_CODE_START_HERE.md`
6. `ARCHITECTURE.md`
7. `AGENTS.md`
8. `SKILLS.md`
9. `DATA_MODEL.md`
10. `ROADMAP.md`
11. `OPEN_QUESTIONS.md`
12. `TECH_STACK_DECISION.md`
13. `SECURITY_PRIVACY.md`
14. `MEMORY_POLICY.md`
15. `BROWSER_RESEARCH_POLICY.md`
16. `V1_ACCEPTANCE_CRITERIA.md`

If any file is missing, Claude Code must stop and report the missing file before implementing architecture-changing code.

## Core Definition

CereBro V1 is a local-first, task-based AI operating system.

It is not just a themed multi-agent chat.

The system is built around:

- Core Harness Runtime
- Project Spaces
- Tasks
- Sessions
- Context Engine
- Skill File System
- Agent Layer
- Tool Adapter Layer
- Memory Pipeline
- Source Library
- Output Library
- Browser Intelligence Layer
- Tony Build Flow
- Gojo Creative Flow
- Piccolo Automation
- Professor Oak Validation
- Model Router
- Human Approval Gates

## Non-Negotiable Architecture

Claude Code must preserve:

1. Harness-first architecture.
2. Project Spaces.
3. Persistent tasks and sessions.
4. Context Engine.
5. Skill File System.
6. Agent routing through Cortana/harness.
7. Tool permission system.
8. Professor Oak validation.
9. Memory proposals before memory writes.
10. SQLite as structured local database.
11. Chroma as vector memory only.
12. Obsidian as human-readable local vault.
13. Notion as optional human-facing output layer.
14. Local-first default.
15. External model approval.
16. Browser tools disabled by default.
17. Declyne removed from V1.
18. Raven Reviews sealed/parked unless explicitly re-enabled.

## Build Rule

If Claude Code believes a different technical route is better, it must:

1. State the problem.
2. Explain why the current plan is weaker.
3. Propose the better route.
4. Explain what changes.
5. Explain what remains preserved.
6. Add an entry to `OPEN_QUESTIONS.md` or `docs/decisions`.
7. Ask for approval if the change affects architecture.

## Golden Path

Every meaningful task should follow:

```text
User request
  ↓
Aang intent capture
  ↓
Harness task/session creation
  ↓
Context Engine context pack
  ↓
Cortana routing
  ↓
Bounded agent work
  ↓
Skill-guided workflow
  ↓
Tool adapter if needed
  ↓
C-3PO formatting if output is needed
  ↓
Professor Oak validation
  ↓
User approval if needed
  ↓
Memory/output/task update
  ↓
Changelog/log entry
```

## V1 Acceptance

V1 is not accepted until `V1_ACCEPTANCE_CRITERIA.md` is satisfied.
