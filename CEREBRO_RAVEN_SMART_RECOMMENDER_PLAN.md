# Raven Smart Recommender Plan

Last updated: 2026-05-09 0624 EDT

## Decision

Raven is a sealed adult-content discovery and taste agent.

Raven finds content, explains why it fits or misses, learns from private
review history, and talks back through a dedicated Raven chat surface.

Raven is not CereBro. CereBro never reads Raven data, writes Raven data,
routes Raven work through CereBro agents, syncs Raven state into core memory,
or exposes Raven content in the Keep, Workshop, Ledger, Notion, Obsidian,
Slack, source library, model/tool registry, or ordinary command intake.

The only allowed connection is a sealed-module launcher that opens Raven after
the user explicitly enters Raven. The launcher carries no Raven data back.

## Product Shape

Raven is a private recommender with 4 parts:

- **Scout.** Searches approved adult sources for candidate content.
- **Normaliser.** Converts source results into one private candidate shape.
- **Taste Engine.** Scores candidates against private Raven history.
- **Raven Chat.** Explains, asks, remembers corrections, and plans the next
  search.

Sources feed Raven. They do not define Raven.

Raven's truth source is the user's private review history:

- saved
- skipped
- rated
- reviewed
- repeated
- stale
- never again
- blocked by hard boundary
- corrected by the user

## Sealed Boundary

Hard rules:

- Raven tables use the `raven_private_*` prefix or a later dedicated Raven DB.
- Raven state is excluded from core memory, source library, Obsidian, Notion,
  Slack, outputs, transcripts, workbench evidence, and normal CereBro search.
- CereBro agents do not inspect Raven records.
- Aang does not route Raven requests.
- Cortana does not route Raven requests.
- Surfer does not browse for Raven.
- Spock does not inspect private Raven content. Raven has its own internal
  safety checks and visible settings.
- Oak does not validate private Raven content.
- Piccolo does not schedule Raven work.
- Hedwig does not capture Raven items.
- No Raven content appears in normal logs, screenshots, chat transcripts, task
  titles, project names, source rows, or handoff snapshots.
- No external model receives private Raven content by default.
- No media download runs in V1.
- No adult image/video generation. Decline generation requests.
- No hidden background crawling.

Allowed bridge:

- A sealed Raven entry action can open Raven.
- The entry action may record only that Raven was opened, if the user approves
  generic activity logging.
- It must not record queries, sources, candidates, reviews, thumbnails, tags,
  or chat content.

## Raven Settings

Hard boundaries must be visible in Raven Settings. The user must be able to see
and change them before discovery runs.

Settings groups:

### Sealed Mode

- Raven enabled: default off until explicit setup.
- Require Raven passphrase on open: default on.
- Store Raven in dedicated DB: target state.
- Hide Raven from CereBro search: locked on.
- Hide Raven from CereBro memory: locked on.
- Hide Raven from handoff snapshots: locked on.
- Allow generic open event in CereBro ledger: default off.

### Discovery

- Adult discovery enabled: default off.
- Run source search from Raven chat: default off until enabled.
- Search only after explicit user command: default on.
- Background discovery: default off.
- Max results per source: visible number control.
- Source freshness window: visible control.
- Deduplicate across sources: default on.
- Show source confidence: default on.

### Source Adapters

Each source gets a visible toggle, trust label, and receipt.

Initial source classes:

- `metadata_graph`: StashDB, ThePornDB, FansDB, JAVStash, PMV Stash.
- `official_or_open_api`: Eporner first.
- `account_token_api`: ThePornDB and FansDB where tokens are user-provided.
- `unofficial_wrapper`: Pornhub, XVideos, xHamster, YouPorn, RedTube, Tube8,
  Xtube, HubTraffic-style wrappers.
- `manual`: pasted URLs and hand-entered items.

Per-source settings:

- enabled
- source class
- credential required
- search allowed
- URL enrichment allowed
- thumbnails allowed
- preview media allowed
- last health check
- last terms/risk review date
- adapter confidence
- notes

### Hard Boundaries

These controls are product-critical. They must live in Raven Settings, not in a
hidden config file.

Locked hard blocks:

- illegal content
- minors or age-ambiguous content
- non-consensual content
- coercion or trafficking indicators
- hidden-camera indicators
- real-person doxxing or stalking vectors
- malware, scam, popup, forced-download, or credential-harvesting sources
- any source that requires bypassing access controls

User-defined hard blocks:

- blocked terms
- blocked performers
- blocked studios/channels
- blocked sources
- blocked tags
- blocked visual styles
- blocked formats
- blocked duration ranges
- blocked languages or regions if desired
- never-show-again items

Boundary behavior:

- Hard-boundary matches are filtered before scoring.
- Raven can explain that a candidate was blocked, but does not need to show the
  private item details in the main queue.
- Boundary changes are append-only preference events.
- Every blocked result gets a local receipt count by source and reason.

### Learning

- Learn from saves: default on.
- Learn from skips: default on.
- Learn from never-again: default on.
- Learn from chat corrections: default on.
- Learn from dwell/replay behavior: default off for V1.
- Retire stale preferences: default on.
- Novelty slider: visible control.
- Repetition tolerance: visible control.
- Explain scoring: default on.

### Models

- Local Raven model: default route for private chat and scoring explanation.
- External model use: locked off by default.
- Allow sanitized external architecture help: default off.
- Allow private Raven content to external model: locked off for V1.
- Vision model for thumbnails/previews: default off. Local-only target.

## Chat Surface

Raven needs a dedicated chat surface inside the sealed module.

Chat jobs:

- plan searches
- ask what to find
- explain candidate matches
- explain misses
- ask one clarifying question when the taste signal is weak
- record corrections
- turn corrections into preference events
- summarize recent taste drift
- propose next searches
- report blocked-result counts without exposing unwanted details

Chat must show receipts without showing too much machinery.

Visible receipt pattern:

```text
Searched 3 sources. 42 results. 11 blocked. 8 duplicates. 6 candidates kept.
```

Drilldown is optional:

```text
Open receipt.
```

The default chat screen should not look like a database console.

## Discovery Flow

Primary flow:

```text
Raven chat request
-> query plan
-> source adapter search
-> normalised candidates
-> hard-boundary filter
-> dedupe
-> taste scoring
-> explanation
-> review queue
-> user action
-> taste graph update
```

Search strategy:

- Generate multiple query variants from taste graph.
- Track which terms work.
- Track which terms create noise.
- Retire stale queries.
- Expand into adjacent searches when results repeat.
- Prefer structured metadata sources before brittle wrappers.
- Use wrappers as fallback discovery and URL enrichment.
- Never mass crawl.
- Never download media in V1.

## Candidate Shape

Minimum candidate fields:

- id
- source id
- source class
- source URL
- source item id when available
- title
- performers
- studios or channels
- tags
- duration
- thumbnail reference if allowed
- preview reference if allowed
- source confidence
- adapter confidence
- boundary flags
- dedupe fingerprints
- freshness timestamp
- fit score
- novelty score
- repetition score
- explanation summary
- receipt id

Private review fields:

- rating
- save state
- skip reason
- never-again reason
- mood
- likes
- dislikes
- boundary notes
- replay value
- source trust correction
- freeform note

## UI/UX Direction

Raven UI must feel like a sealed review room, not a generic recommendation
dashboard.

Required surfaces:

- Raven Chat.
- Discovery Queue.
- Review Card.
- Taste Graph.
- Source Ledger.
- Boundary Settings.
- Search Receipt Drawer.

Design rules:

- Default view: chat plus a compact candidate queue.
- Settings must expose hard-boundary toggles clearly.
- Do not show every table, score, and source field by default.
- Put machinery behind receipts and drilldowns.
- No generic metric-card grid.
- No public-looking feed.
- No landing page.
- No fake activity.
- No NSFW thumbnails until the user enables thumbnails in Raven Settings.
- No content visible outside the sealed Raven module.
- Empty states give the next action.

Minimum first screen:

```text
Raven chat on the left.
Candidate queue on the right.
Settings and receipts reachable from the header.
No thumbnails until enabled.
```

Important empty states:

```text
Discovery is off. Enable sources in Raven Settings.
```

```text
No candidates kept. Open the receipt to see what was filtered.
```

```text
No reviews yet. Paste a URL or run a source search.
```

## Build Phases

### Phase R0: Stop And Reframe

- Stop narrow evidence-receipt work.
- Read this plan, the revised ADR, and the latest handoff.
- Keep current Raven backend work unless it conflicts.
- Do not add source browsing yet.

Acceptance:

- The active build agent can state Raven's new product shape in one paragraph.

### Phase R1: Settings And Boundary Model

- Add Raven Settings model.
- Add hard-boundary toggles and locked defaults.
- Add source adapter registry schema.
- Add per-source enablement flags.
- Add tests proving locked boundaries cannot be disabled in V1.

Acceptance:

- Raven cannot search until discovery and at least one source are enabled.
- Hard blocks are visible and enforced before scoring.

### Phase R2: Chat Skeleton

- Add sealed Raven chat table.
- Add local chat endpoint.
- Add deterministic non-LLM first replies for setup, search state, and receipt
  summaries.
- Add chat-to-preference correction events.

Acceptance:

- Raven can answer "what can you search" from settings and source registry.

### Phase R3: Candidate And Review Core

- Add candidate item table.
- Add review table.
- Add taste event table.
- Add candidate queue endpoints.
- Add review actions: save, skip, rate, never again, annotate.

Acceptance:

- Manual candidate in, review action out, taste event recorded.

### Phase R4: First Discovery Adapter

- Start with Eporner or another source with the cleanest open metadata path
  after current verification.
- Add source health check.
- Add search receipt.
- Add normalisation.
- Add boundary filter.
- Add dedupe.

Acceptance:

- Raven can run one approved source search and produce a private queue.

### Phase R5: Wrapper Adapters

- Add Pornhub/XVideos/xHamster/YouPorn wrappers only behind source toggles.
- Label every result `unofficial_wrapper`.
- Add adapter health and failure notes.
- Never download media.

Acceptance:

- Wrapper failure degrades to a receipt. It does not break Raven.

### Phase R6: Taste Scoring

- Add structured scoring from private review history.
- Add novelty and repetition controls.
- Add stale preference handling.
- Add explanation summaries.

Acceptance:

- Raven can explain a candidate using private evidence without exposing all
  machinery on the main screen.

### Phase R7: UI First Pass

- Build sealed Raven shell.
- Build Raven Settings first enough to expose hard boundaries.
- Build chat plus candidate queue.
- Build review card.
- Build receipt drawer.
- Screenshot review required.

Acceptance:

- A user can see what Raven can do, what is blocked, what sources are enabled,
  and why a candidate appeared.

### Phase R8: Local LLM Lane

- Select local model after hardware/model-router testing.
- Use local model for chat phrasing, search planning, taste summaries, and
  explanation drafts.
- Keep scoring structured and auditable.

Acceptance:

- Raven can talk back without sending private content externally.

## Tests And Evaluation

Required test cases:

- Raven sealed status hides all private records from normal CereBro routes.
- CereBro agents cannot read Raven tables through ordinary routers.
- Discovery cannot run while disabled.
- Source search cannot run unless source is enabled.
- Locked hard blocks cannot be turned off in V1.
- Hard-boundary filter runs before taste scoring.
- Never-again suppresses future candidates.
- Dedupe merges the same item across sources.
- Wrapper failure creates a receipt.
- Chat correction creates a preference event.
- External model use is blocked for private Raven content.
- Handoff snapshots do not include Raven private content.

## Open Questions

- First source adapter: Eporner open API or ThePornDB/Stash-box token path.
- Dedicated Raven DB now or after current `raven_private_*` tables settle.
- First local model after hardware check.
- Thumbnail policy for V1.
- Whether generic "Raven opened" activity should be recorded at all.

## Builder Instruction

If another agent is building Raven right now, stop the current narrow backend
slice and read this file first.

Do not continue by adding more evidence receipt filters.

Next correct slice:

```text
Implement Raven Settings and hard-boundary/source-toggle schema first. Keep
Raven sealed. Do not browse, fetch adult sources, download media, call external
models, write Notion/Obsidian/Slack, or expose Raven data through CereBro.
```
