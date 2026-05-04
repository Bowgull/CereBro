# CereBro V1 — Data Model

## Primary Database

SQLite.

## ORM Recommendation

Drizzle ORM.

Fallback:

`better-sqlite3` with raw SQL.

## Core Tables

Core data objects:

- projects
- tasks
- sessions
- context_packs
- agents
- skills
- sources
- artifacts
- memory_proposals
- validations
- approval_events
- tool_calls
- workflows
- workflow_runs
- errors
- model_registry
- settings

## Schema Source

JSON schemas live in:

```text
/data/schema
```

Seed data lives in:

```text
/data/seeds
```

## Structured State Rule

SQLite is the source of truth for app state.

Chroma is vector memory only.

Obsidian is human-readable notes only.

Notion is optional user-facing output only.
