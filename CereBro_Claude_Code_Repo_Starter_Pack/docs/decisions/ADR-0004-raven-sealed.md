# ADR-0004: Raven Sealed Smart Recommender Boundary

## Status

Revised on 2026-05-09.

## Decision

Raven is an active sealed build track.

Raven is a private adult-content discovery and taste agent. It can search
approved sources, normalise candidates, score them against private review
history, explain fit or miss, and talk back through a dedicated Raven chat
surface.

Raven remains outside core CereBro.

## Rule

CereBro never touches Raven data.

Core CereBro agents do not read, write, route, validate, summarize, sync, index,
or export Raven data. Raven does not use core memory, Notion, Obsidian, Slack,
source library, workbench evidence, normal command intake, or ordinary CereBro
handoff snapshots.

The only allowed connection is a sealed Raven launcher. It opens Raven after
explicit user action and carries no Raven content back to CereBro.

Raven hard boundaries live in Raven Settings as visible controls. Locked hard
blocks cannot be disabled in V1.

## Consequences

- Raven data stays in `raven_private_*` tables or a later dedicated Raven DB.
- Raven search runs only from Raven after discovery and source toggles are
  enabled.
- Raven source adapters are labelled by trust class: metadata graph, official
  or open API, account-token API, unofficial wrapper, scraper, manual.
- Raven chat is sealed. It can discuss Raven state inside Raven only.
- No Raven private content goes to external models in V1.
- No media downloads run in V1.
- No adult generation surface exists.
- UI must expose hard-boundary settings while keeping low-level machinery behind
  receipts and drilldowns.

Implementation source:

- `CEREBRO_RAVEN_SMART_RECOMMENDER_PLAN.md`
