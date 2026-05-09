# CereBro Skills And Tools Layer

Last updated: 2026-05-09

## Purpose

This file defines how CereBro agents learn repeatable work without giving
unchecked power to prompt files.

The operating rule:

```text
agent -> skill -> allowed context -> allowed tools -> approval gate -> output receipt
```

Skills teach. Tools act. Cortana routes action. Spock and Oak validate risk.
The user approves anything that changes risk, writes durable memory, calls an
external service, publishes, installs, deletes, sends, or spends.

This layer is a blueprint. It does not approve installing third-party skills,
running external tools, cloning repos, downloading model files, or wiring new
runtime dependencies.

## Skill Folder Contract

CereBro skills should use a portable folder shape:

```text
skills/<skill-id>/
  SKILL.md
  scripts/
  references/
  assets/
  templates/
```

Only `SKILL.md` is required.

`SKILL.md` should be short enough to load by default. Large references,
templates, scripts, examples, and assets load only when the task needs them.

Every CereBro skill must declare:

- Owner agent.
- Support agents.
- Purpose.
- Inputs it may read.
- Outputs it may create.
- Tools it may request.
- Tools it may never request.
- Memory lanes it may read.
- Memory lanes it may write.
- Approval gate.
- Validation receipt.
- Stale-data rule.
- Failure mode.

## Security Rule

Third-party skills are source material until reviewed.

No third-party skill gets automatic:

- shell access
- filesystem write access
- browser credential access
- GitHub write access
- Obsidian write access
- Notion write access
- Slack write access
- external model calls
- package installs
- daemon startup
- Docker execution
- media downloads
- payment, account, or permission changes

Public GitHub is not clearance. A skill can be read as reference after license,
security, maintenance, install surface, storage, privacy, and product fit are
recorded.

## Permission Classes

### Context Classes

- `chat_context`: user-provided text and attachments in the current thread.
- `local_read`: approved repo or vault files.
- `terminal_observation`: terminal output and logs.
- `localhost_preview`: app previews on local ports.
- `public_browser`: public web pages.
- `private_connector`: Notion, Slack, GitHub, Drive, or future connector data.
- `media_frame`: uploaded images, screenshots, and selected video frames.
- `sensitive_private`: secrets, keys, credentials, financial data, health data,
  private adult data, and sealed Raven data.

### Action Classes

- `read_only`: inspect, summarize, compare, or classify.
- `local_evidence_write`: write receipts, notes, drafts, or local artifacts.
- `code_edit`: change repo files.
- `command_proposal`: propose a terminal command without running it.
- `command_execution`: run a terminal command.
- `browser_operation`: click, type, download, log in, or submit in a browser.
- `external_write`: write to Notion, Slack, GitHub, Drive, email, or another
  external system.
- `publish`: make content public or client-visible.
- `install`: install packages, apps, plugins, skills, models, or services.
- `cleanup`: delete, move, archive, or overwrite files.

### Standing Gates

These always require visible approval:

- external model calls with private or sensitive context
- private connector reads beyond the current approved scope
- any external write
- sending messages or email
- publishing
- package, model, app, daemon, Docker, plugin, or skill installation
- command execution that changes files, network state, permissions, or services
- destructive cleanup
- credential entry or credential sharing
- payments, trials, billing, or account permission grants
- Raven access, Raven export, or Raven data movement

## Memory Lanes

CereBro memory should be typed. Do not dump everything into one vector heap.

| Lane | Stored In | Retrieval Rule |
|---|---|---|
| `episodic` | libSQL, session handoffs | Used for recent context and history. Ages out of default recall unless promoted. |
| `preference` | libSQL, approved Obsidian notes | Used when the user has approved a durable preference or correction. |
| `project` | libSQL, Obsidian project bridge notes | Used inside the active project. Must cite project path or note. |
| `source` | Source Library, Obsidian source notes, vector index | Used with provenance, source date, checksum or commit SHA where possible. |
| `decision` | Obsidian decision notes, libSQL decision records | Used as policy. Append-only by default. |
| `skill_playbook` | skill folders, playbook records, prompt/tool handoffs | Used only when the input shape and approval gate match. |
| `validation` | Oak/Spock receipts, test logs, eval records | Used to judge confidence, not as source truth. |
| `artifact` | output library, Drive vault, repo outputs | Used when tied to an artifact id, file path, and retention rule. |

RAG indexes only approved current material. Every indexed chunk needs source
path, source id, source modified time, chunk version, privacy class,
retrieval status, and stale status. If a source changes, old chunks are stale
until reindexed.

Obsidian is durable Markdown. It is not the vector database and not the model
brain.

## Agent Skill Loadouts

### Aang

Role: human bridge, intake, mode read, teaching surface.

Core skills:

- `task-intake`
- `learning-mode`
- `daily-review`
- `weekly-planning`
- `memory-candidate-capture`
- `messy-thought-to-task`

Allowed tools:

- read current chat context
- read active project summary
- propose memory writes
- propose tasks
- request Cortana routing

Forbidden tools:

- shell execution
- browser operation
- external writes
- direct Obsidian writes
- direct Notion or Slack writes
- model escalation without Cortana route

Receipt:

- inferred mode
- confidence
- correction path
- routed owner
- memory proposal, if any

### Cortana

Role: router, task state, approval state, mode selection.

Core skills:

- `mode-router`
- `project-space-loader`
- `context-pack-builder`
- `approval-gate`
- `model-route-selection`
- `tool-permission-classifier`

Allowed tools:

- read task/session/project state
- read model/tool registry
- create approval requests
- create routing receipts
- assign owner/support agents

Forbidden tools:

- direct risky execution
- direct publishing
- direct credential handling
- bypassing Spock for risky sources, repos, installs, or browser targets

Receipt:

- selected mode
- owner agent
- support agents
- context pack
- permission class
- approval requirement
- fallback route

### Batman

Role: strategy, tradeoffs, threat modeling, feasibility.

Core skills:

- `strategy-review`
- `tradeoff-analysis`
- `scope-of-work`
- `freelance-offer-builder`
- `client-proposal-risk-review`
- `is-this-dumb-check`

Allowed tools:

- read project goals
- read plan drafts
- read source summaries
- propose risks and options

Forbidden tools:

- unilateral tool execution
- external writes
- direct code edits unless routed as support

Receipt:

- recommendation
- rejected options
- risk list
- decision needed

### Tony Stark

Role: builder, repo audit, implementation planning, code validation.

Core skills:

- `repo-audit`
- `app-idea-to-prd`
- `technical-plan`
- `claude-code-handoff`
- `bug-diagnosis`
- `test-and-validate`
- `changelog-writer-support`

Allowed tools:

- local repo reads
- code edits after route approval
- test commands after command class approval
- local localhost preview after route approval
- handoff prompt creation

Forbidden tools:

- installing packages without approval
- destructive commands without approval
- external code paste without license review
- direct GitHub publish without approval
- credential access

Receipt:

- files touched
- commands proposed or run
- tests run
- risks
- next safe slice

### Gojo

Role: design, creative systems, visual review, content planning.

Core skills:

- `brand-kit-builder`
- `landing-page-design`
- `web-app-ui-review`
- `anti-ai-slop-review`
- `social-content-calendar`
- `content-repurposing`
- `short-form-video-pipeline`
- `app-demo-video`

Allowed tools:

- read `DESIGN.md`
- inspect screenshots and previews
- propose image/video generation
- propose design assets
- write design drafts after route approval

Forbidden tools:

- heavy generation without approval
- saving generated assets only in chat
- using unlicensed brand assets
- publishing creative output without approval
- adult or Raven creative generation

Receipt:

- design source used
- screenshot or artifact reviewed
- anti-slop findings
- asset provenance
- mobile/desktop review status

### Silver Surfer

Role: source scouting, public research, browser and repo discovery.

Core skills:

- `browser-research`
- `github-repo-scan`
- `reddit-signal-scan`
- `source-grading`
- `reading-list-ingest`
- `research-synthesis-support`
- `obsidian-rag-search`

Allowed tools:

- public-page browsing after route approval
- source metadata capture
- repo metadata review
- search approved memory and source summaries

Forbidden tools:

- credentialed browsing by default
- downloads by default
- clone/install/run by default
- scraping private accounts
- bypassing paywalls or platform limits
- Raven source access

Receipt:

- source URL
- source type
- access risk
- freshness
- credibility notes
- Spock gate status

### C-3PO

Role: clean writing, documentation, formatting, client-ready output.

Core skills:

- `clean-docs`
- `meeting-recap`
- `client-ready-writing`
- `portfolio-case-study`
- `changelog-writer`
- `research-synthesis`
- `decision-log`

Allowed tools:

- read approved context packs
- draft docs, summaries, recaps, and briefs
- propose Obsidian or Notion writes
- format artifacts

Forbidden tools:

- direct publishing
- direct Notion/Slack/email writes without approval
- inventing citations
- hiding uncertainty

Receipt:

- input sources
- output type
- citation list
- approval needed before external write

### Professor Oak

Role: final QA, hallucination checks, blueprint compliance, validation.

Core skills:

- `final-output-validation`
- `blueprint-compliance-check`
- `source-claim-check`
- `test-result-review`
- `memory-promotion-review`
- `approval-gate-support`

Allowed tools:

- read outputs, source receipts, tests, plans, and memory proposals
- request targeted rechecks
- approve or reject memory promotion proposals

Forbidden tools:

- direct risky execution
- direct external writes
- treating citations as proof without source inspection

Receipt:

- pass/fail
- violated rule, if any
- missing evidence
- required fix
- validation status

### Spock

Role: logic, contradiction detection, security gate, bloat control.

Core skills:

- `anti-bloat-review`
- `logic-check`
- `contradiction-detection`
- `security-preflight`
- `repo-risk-review`
- `tool-install-risk-review`

Allowed tools:

- read plans, diffs, manifests, lockfiles, scripts, source metadata, and policy
- run approved scanners when configured
- block risky routes pending approval

Forbidden tools:

- executing unreviewed code
- credential handling
- approving its own risky action
- bypassing user approval

Receipt:

- risk class
- suspicious surface
- allow/block/defer recommendation
- required approval
- scanner evidence, if any

### Piccolo

Role: maintenance, cleanup proposals, backups, recurring checks.

Core skills:

- `file-cleanup`
- `backup-check`
- `sync-health-check`
- `storage-pressure-report`
- `recurring-maintenance`
- `stale-index-detection`

Allowed tools:

- read storage metadata
- propose cleanup
- report stale indexes
- propose backup/sync jobs
- create approved recurring checks

Forbidden tools:

- deleting files without approval
- moving files without approval
- starting hidden watchers without approval
- writing external systems without approval

Receipt:

- affected paths
- storage impact
- retention rule
- cleanup proposal
- approval status

### Hedwig

Role: capture, messaging intake, outbound communication proposals.

Core skills:

- `slack-capture-intake`
- `notion-capture-intake`
- `message-draft`
- `reminder-capture`
- `inbox-triage`

Allowed tools:

- read approved capture channels
- propose Notion inbox writes
- propose Slack messages
- draft reminders

Forbidden tools:

- sending messages without approval
- reading private channels outside scope
- writing durable memory directly
- handling Raven data

Receipt:

- source channel
- captured item
- destination proposal
- approval needed

## Core System Skills

| Skill | Owner | Gate |
|---|---|---|
| `task-intake` | Aang | Memory write approval if durable. |
| `mode-router` | Cortana | Approval if risk class changes. |
| `project-space-loader` | Cortana | Private files require scoped approval. |
| `approval-gate` | Cortana/Oak | Always visible. |
| `memory-writer` | Aang/C-3PO/Oak | User approval before durable preference or policy memory. |
| `obsidian-rag-search` | Aang/Surfer | Read only by default. |
| `context-pack-builder` | Cortana | Must list included sources. |
| `blueprint-compliance-check` | Oak/Spock | Required before broad system changes. |
| `anti-bloat-review` | Spock | Required before new surfaces or dependencies. |
| `final-output-validation` | Oak | Required for client-visible or durable outputs. |

## Builder Skills

| Skill | Owner | Gate |
|---|---|---|
| `repo-audit` | Tony | Read-only by default. |
| `app-idea-to-prd` | Tony | No external write without approval. |
| `technical-plan` | Tony | No implementation unless approved or already requested. |
| `claude-code-handoff` | Tony | External model/tool call approval. |
| `bug-diagnosis` | Tony | Command execution approval by class. |
| `test-and-validate` | Tony/Oak | Safe test commands can run after route approval. |
| `changelog-writer` | C-3PO | Release/publish approval. |

## Design And Freelance Skills

| Skill | Owner | Gate |
|---|---|---|
| `brand-kit-builder` | Gojo | Asset provenance required. |
| `landing-page-design` | Gojo | Screenshot review required. |
| `web-app-ui-review` | Gojo/Oak | `DESIGN.md` required. |
| `anti-ai-slop-review` | Gojo/Oak | Required before material UI delivery. |
| `portfolio-case-study` | C-3PO/Gojo | Client/public approval. |
| `client-proposal` | C-3PO/Batman | External send approval. |
| `scope-of-work` | Batman/C-3PO | Client send approval. |
| `freelance-offer-builder` | Batman | No publishing without approval. |
| `social-content-calendar` | Gojo/C-3PO | Platform write approval. |
| `content-repurposing` | Gojo | Source rights check. |
| `short-form-video-pipeline` | Gojo | Heavy media/storage approval. |
| `app-demo-video` | Gojo/Tony | Artifact destination required. |

## Everyday OS Skills

| Skill | Owner | Gate |
|---|---|---|
| `daily-review` | Aang | Reads approved current state. |
| `weekly-planning` | Aang/Batman | Durable plan write approval. |
| `file-cleanup` | Piccolo | Delete/move approval. |
| `backup-check` | Piccolo | External account or sync approval if changed. |
| `reading-list-ingest` | Surfer | Source write approval. |
| `research-synthesis` | Surfer/C-3PO | Citations required. |
| `learning-mode` | Aang | Memory promotion approval. |
| `decision-log` | Spock/C-3PO | Append-only by default. |

## Runtime Loading Order

Layer priority should be explicit:

1. System safety rules.
2. User-approved project rules.
3. Active repo `AGENTS.md`.
4. Active project skill loadout.
5. Agent default skills.
6. Personal skills.
7. Third-party reference skills.

Higher layers constrain lower layers. Lower layers cannot loosen security,
privacy, approval, or storage rules.

## Skill Review Checklist

Before a skill becomes active:

- License reviewed.
- Source recorded.
- Owner agent assigned.
- Tool requests declared.
- Forbidden actions declared.
- Memory lanes declared.
- Approval gate declared.
- Output receipt declared.
- Tests or dry-run examples recorded.
- Stale-data behavior recorded.
- Security review complete.

## V1 Acceptance

The skills layer is ready for runtime work when CereBro can:

- list each agent's active skills
- explain why a skill was loaded
- show what context the skill read
- show what tool the skill requested
- block forbidden tools
- create approval records for gated actions
- cite memory, source, note, artifact, or receipt ids used
- mark stale retrieval chunks
- record whether the skill result was approved, rejected, reused, or fixed

## Non-Goals

- No autonomous agent swarm.
- No marketplace installation.
- No blind import from OpenClaw, awesome skill indexes, or GitHub.
- No fine-tuning requirement.
- No local model download requirement.
- No hidden background watchers.
- No Raven bridge.

## Implementation Sequence

1. Keep this file as the contract.
2. Add a skills registry table or config shape.
3. Add read-only skill listing in the Keep or Workshop.
4. Add tool permission classes and forbidden-tool checks.
5. Add approval receipts.
6. Add memory lane declarations.
7. Add the first 3 local skills: `task-intake`, `mode-router`,
   `repo-audit`.
8. Add validation receipts for Oak and Spock.
9. Only then consider external skill references.
