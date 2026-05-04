# CereBro V1 — Memory Policy

## Core Rule

Agents do not directly write long-term memory.

Agents propose memory.

Oak validates.

User approves when needed.

Memory Writer writes.

## Memory Layers

### Runtime State

Temporary session/task state.

### SQLite

Structured app state.

### Chroma

Vector semantic memory.

### Obsidian

Human-readable durable notes.

### Notion

Polished user-facing output.

## Save Automatically

- operational logs
- task metadata
- artifact metadata
- validation reports
- approval events
- source metadata

## Requires Approval

- user preferences
- architecture decisions
- project direction changes
- style preferences
- sensitive/private details
- memory affecting future behavior
- writes to Notion
- major Obsidian notes

## Never Save Automatically

- secrets
- raw credentials
- sealed Raven memory into core
- temporary frustration
- unverified claims
- hallucinations
- duplicate noise
- private browser data

## Conflict Rule

Do not overwrite memory silently.

Mark conflict and ask for review.
