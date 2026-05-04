# ADR-0004 — Raven Reviews Sealed Boundary

## Status

Accepted as default until user revises.

## Decision

Raven Reviews is sealed/parked and outside core CereBro.

## Rule

Do not build Raven Reviews before core CereBro works unless the user explicitly changes priority.

## Consequences

Raven memory must not mix with core memory.

Raven does not access Notion, Obsidian, Slack, or core project memory by default.
