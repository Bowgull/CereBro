# ADR-0001 — Harness-First Architecture

## Status

Accepted.

## Decision

CereBro V1 uses harness-first architecture.

Agents sit on top of the harness.

## Reason

This prevents CereBro from becoming loose agent chat.

## Consequences

All important work flows through:

- task/session creation
- context pack
- routing
- permissions
- validation
- memory/output update
