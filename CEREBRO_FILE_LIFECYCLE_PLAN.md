# CereBro File Lifecycle Plan

Last updated: 2026-05-08

## Purpose

CereBro must keep the user's workspaces clean by design. This plan extends the
existing Session 3 storage work; it is not a new project.

Cleanliness means every generated file, Obsidian note, Notion page, creative
asset, code artifact, message draft, render, temp file, source capture, and
archive item has:

- An owner.
- A destination.
- A metadata trail.
- A lifecycle state.
- A retention rule.
- A cleanup path.

No destructive cleanup happens without explicit approval until cleanup rules are
implemented and approved.

## Append-Only Learning Law

CereBro learns from history. Anything that represents what happened over time
is append-only by default:

- Session history indexes and handoff archives.
- Audit logs, approvals, tool calls, command/output observations, and validation
  trails.
- Source provenance, capture history, message/reminder history, and cleanup
  history.
- Running notes, learning trails, prompt/tool handoff history, and "never do
  this again" corrections.

These records should append a new entry or create a unique timestamped version.
They should not be silently overwritten or replaced.

Canonical current-state files are different. Living plans, profile summaries,
active configs, current task state, and `CEREBRO_SESSION_HANDOFF.md` may be
edited in place when they are explicitly the current source of truth. If a file
is a history, log, archive, index, or note trail, preserve the sequence. The
short rule is: history accumulates; current state updates.

## Storage Roles

### Turso / libSQL

Structured brain and metadata index.

Stores:

- Reusable prompt and tool/model handoff metadata.
- Projects, tasks, sessions, sources, memory entries, outputs.
- Artifact metadata and lifecycle state.
- Approval records.
- Tool call records.
- Cleanup scan results and proposed actions.
- Model/tool capability records, eval notes, and routing evidence.
- RAG chunk metadata and citation pointers once retrieval is live.

Does not store:

- Large images, videos, renders, model files, zip archives, or heavy exports.

Turso/libSQL cloud is the preferred canonical brain once configured. Local
SQLite remains the development cache and offline fallback.

### Vector Retrieval

Cloud-backed semantic retrieval for RAG.

Stores:

- Embeddings for approved memory entries.
- Embeddings for Obsidian notes that should feed LLM context.
- Embeddings for source summaries and selected source chunks.
- Embeddings for prompt/tool handoffs and reusable playbooks.
- Pointers back to Turso rows, Obsidian paths, source URLs, artifacts, and
  approval records.

Does not store:

- Raw private files by default.
- Full media files.
- Unapproved sensitive screenshots.
- Anything that cannot be traced back to a visible source record.

The vector index is rebuildable. Turso rows, source records, Obsidian notes,
and approved vault artifacts are the durable record. If the vector index is
lost, rebuild it from those sources.

### Google Drive Synced CereBro Vault

Default home for generated files and deliverables once `CEREBRO_VAULT_DIR` is
configured.

Stores:

- Client/project deliverables.
- Creative assets.
- Render outputs and previews.
- Source captures.
- Code handoff packages.
- Message drafts and communication records.
- Exports intended to survive chat context.

Drive should run in a storage-conscious mode where possible. The Mac should not
keep every generated file, render, or source archive pinned locally.

### Obsidian

Human-readable durable Markdown knowledge layer.

Stores:

- Approved CereBro session handoff snapshots.
- Session index notes that link the build history.
- Decisions.
- Learning notes.
- Source summaries.
- Durable summaries of reusable prompts/tool handoffs when they become
  important knowledge.
- Project notes.
- Durable reflections and checklists.
- Index notes that link to vault artifacts.
- RAG-ready summaries when a source or output is worth retrieving later.

Obsidian does not increase disk capacity or local model capacity. It keeps
knowledge findable and editable.

Obsidian does not store:

- Raw image batches.
- Video renders.
- Full source crawls.
- Local vector indexes.
- Duplicate binary files already stored in the Drive vault.

Obsidian notes should be beautiful enough to use directly: clear folders,
frontmatter, backlinks, callouts, and color-coded navigation. Beauty is part of
function here. The vault should make history, sources, decisions, and project
state visible without turning Obsidian into the warehouse.

Current Obsidian lanes:

| Lane | Purpose | Retrieval default |
|---|---|---|
| `00_Atlas` | Human entry points, maps, and navigation notes. | Include indexes. |
| `10_Projects` | Project bridge notes. Every active project routes through one bridge. | Include when current and validated. |
| `20_Knowledge` | Decisions, sources, learning, playbooks, reviews, ops, and capture syntheses. | Include when current and validated. |
| `60_Media` | Indexes and notes about media artifacts. Heavy files stay in Drive. | Include indexes. |
| `80_Templates` | Reusable note templates with retrieval metadata fields. | Include indexes. |
| `90_Archive` | Append-only session/build history and snapshots. | Archive-only by default. |

RAG-ready Obsidian notes use this metadata contract:

```yaml
canonical_status:
retrieval_status:
llm_summary:
source_ids:
related_notes:
privacy_class:
```

Retrieval rule: include `retrieval_status: include` and
`retrieval_status: include_index` for normal context. Include
`archive_only` only when the user asks for history, provenance, or a prior
session. Exclude raw captures, duplicate binaries, rejected assets, full crawls,
and draft notes without a current index.

Write rule: CereBro-created notes must write into the current lanes. Default
manual durable notes go to `20_Knowledge/Capture` until promoted. Project
knowledge goes through `10_Projects/<Project>/<Project>.md`. Session handoff
snapshots go to `90_Archive/CereBro Session History/snapshots/` and update
`90_Archive/CereBro Session History/CereBro Session History.md`.

GitHub project import rule: do not copy full repositories into Obsidian. Import
repository orientation as a project bridge plus a source summary:

- `10_Projects/<Project>/<Project>.md`
- `20_Knowledge/Sources/GitHub/<Project> Repository Source.md`
- `00_Atlas/GitHub Project Map.md`
- `20_Knowledge/Sources/GitHub/GitHub Sources.md`

Each repository source note needs a GitHub URL, owner, repo name, visibility,
commit SHA, last commit signal, stack summary, scripts, docs list, structure
summary, trust notes, and retrieval note. Use it for orientation and routing.
Inspect the live repo for exact code facts.

Color discipline is part of the knowledge system. Major folders should use
distinct path-based colors in Obsidian graph/settings and matching CSS where
possible. Tags can add meaning, but tags should not be required just to make
nodes readable.

Visual beauty is not cosmetic polish for Obsidian. It is how the knowledge map
stays usable. Future notes, indexes, templates, and project bridges should
preserve intentional clusters, distinct colors, readable labels, and clear
relationships.

Every active project represented in Obsidian should have a CereBro project
bridge note under `10_Projects/<Project>/<Project>.md`. Build history,
media indexes, decks, maintenance notes, upgrade plans, sources, and decisions
link through that bridge. This keeps project work visible to CereBro without
moving append-only history.

### Notion

Polished output layer and structured capture database after approval.

Stores:

- Hedwig quick-capture inbox rows from Slack.
- Ideas, links, TikToks, Reddit posts, articles, conversation notes, reminders,
  and "save this for later" items.
- Client-facing pages.
- Learning dashboards.
- Clean summaries.
- Shareable project/status pages.

Notion should not become a duplicate dumping ground for every draft. Raw
captures belong in the capture database with status, project guess, source URI,
owner agent, and follow-up metadata; durable summaries can later graduate to
Obsidian, outputs, tasks, or project notes.

### Slack

Fast personal capture intake for Hedwig in V1.

Stores:

- The user-facing message or capture channel.
- Source links and short context messages.

Does not store:

- CereBro's durable source of truth.
- Full project memory.
- Unbounded private workspace crawls.

Slack messages should flow into Notion capture rows and SQLite/libSQL metadata
after approved connection/scopes. Slack channel expansion, posting, and reading
new message surfaces require approval.

### Repo

Source code and intentionally committed assets only.

Does not default-store:

- Generated images.
- Render intermediates.
- Client deliverables.
- Local model files.
- Bulk research captures.
- Random scratch exports.

## Proposed Vault Folder Tree

```text
CereBro/
  00_Inbox/
    captures/
    dropped-files/
    unsorted/
  01_Projects/
    <project-slug>/
      briefs/
      sources/
      outputs/
      code/
      creative/
      messages/
      approvals/
      archive/
  02_Sources/
    urls/
    docs/
    screenshots/
    github/
    notes/
  03_Outputs/
    drafts/
    review/
    published/
    exports/
  04_Creative/
    images/
      prompts/
      drafts/
      finals/
      rejected/
    video/
      scripts/
      storyboards/
      renders/
      previews/
      exports/
    styleboards/
  05_Code/
    handoffs/
    diffs/
    qa-reports/
    release-notes/
  06_Messages/
    drafts/
    sent/
    follow-ups/
    captures/
    archive/
  07_Knowledge/
    obsidian-vault/
    markdown-exports/
  08_System/
    logs/
    model-tests/
    manifests/
    cleanup-reports/
  09_Temp/
    downloads/
    renders/
    previews/
    scratch/
  99_Archive/
  99_Trash_Staging/
```

Naming notes:

- Use numeric prefixes to keep folders stable in Finder and Drive.
- Use project-scoped folders for client work whenever possible.
- Use global folders for shared sources, general outputs, system logs, and
  unsorted captures.
- `99_Trash_Staging` is a review zone, not automatic deletion.

## Lifecycle States

| State | Meaning | Cleanup behavior |
| --- | --- | --- |
| `inbox` | Captured but not classified | Piccolo can ask for routing |
| `active` | Currently useful for ongoing work | Do not clean |
| `review` | Needs user/Oak/C-3PO review | Do not clean |
| `published` | Final or approved externally visible artifact | Archive only by rule |
| `superseded` | Replaced by a newer approved artifact | Candidate for archive |
| `archived` | Kept intentionally but not active | Excluded from active workspace |
| `temp` | Scratch/intermediate/regenerable | Candidate for pruning proposal |
| `trash_staged` | User-approved candidate awaiting final delete | Delete only after explicit confirmation or approved rule |
| `deleted` | Removed after approval/rule | Metadata remains as audit trail |

## Artifact Kinds

Initial artifact kinds:

- `source_url`
- `source_file`
- `source_screenshot`
- `source_note`
- `memory_note`
- `obsidian_note`
- `notion_page`
- `output_text`
- `output_markdown`
- `output_code`
- `output_diff`
- `creative_prompt`
- `reusable_prompt`
- `tool_handoff`
- `external_model_handoff`
- `creative_image`
- `creative_video`
- `render_intermediate`
- `render_export`
- `message_draft`
- `message_sent`
- `message_follow_up`
- `message_capture`
- `session_handoff`
- `code_handoff`
- `qa_report`
- `model_test`
- `temp_file`
- `archive_item`

## Metadata Fields

Every artifact record should be able to answer:

```json
{
  "id": "",
  "kind": "",
  "lifecycle_state": "",
  "title": "",
  "project_id": null,
  "task_id": null,
  "session_id": null,
  "owner_agent": "",
  "supporting_agents": [],
  "storage_provider": "vault|obsidian|notion|repo|local|external",
  "storage_path": "",
  "source_uri": "",
  "source_artifact_id": "",
  "prompt_or_instruction": "",
  "content_hash": "",
  "byte_size": null,
  "mime_type": "",
  "approval_id": null,
  "validation_id": null,
  "retention_rule": "",
  "cleanup_eligible_at": null,
  "cleanup_reason": "",
  "sensitive_data_flag": false,
  "client_visible": false,
  "created_at": null,
  "updated_at": null,
  "archived_at": null,
  "deleted_at": null
}
```

Recommended database table name: `artifacts`.

Recommended companion table: `cleanup_candidates`.

## Retention Rules

Initial retention rules should be simple and explicit:

- `keep_forever`: Durable knowledge, final deliverables, major decisions.
- `keep_until_project_archive`: Active project artifacts.
- `archive_when_superseded`: Drafts replaced by approved finals.
- `review_after_7_days`: Inbox, temp notes, message drafts.
- `review_after_30_days`: Unused creative drafts, previews, screenshots.
- `delete_after_approval`: Never delete automatically; requires user approval.
- `delete_after_approved_rule`: Can be deleted by Piccolo only after the rule is
  explicitly approved.

Default if unknown: `delete_after_approval`.

## Agent Responsibilities

### Aang

- Captures user intent and creates structured drafts.
- Tags artifacts with project/task/session when obvious.
- Helps turn repeated prompts/workflows into reusable learning aids.
- Does not approve cleanup.

### Cortana

- Routes artifact ownership.
- Sets permission scope for write, publish, archive, and cleanup actions.
- Handles approval prompts.

### Tony Stark

- Owns code handoffs, diffs, QA notes, release notes, and implementation plans.
- Keeps generated code artifacts project-scoped.
- Owns reusable code/build prompts and external coding-model handoffs when
  escalation is justified.

### Gojo

- Owns creative direction artifacts, styleboards, prompt libraries, image/video
  drafts, and final creative selections.
- Owns reusable visual/model prompts such as PixelLab prompts when they prove
  useful.

### Silver Surfer

- Owns source captures, research notes, provenance, screenshots, and freshness
  metadata after browsing/source work is approved.
- Owns source-backed tool/model recommendations and URLs for reusable handoffs.

### C-3PO

- Formats drafts into durable Markdown, Notion-ready pages, client docs, and
  clean exports.
- Marks draft/final status clearly.

### Professor Oak

- Validates important outputs before memory writes, published pages, client
  deliverables, or external escalation.
- Flags privacy, source, and consistency risks.

### Spock

- Detects contradictions, duplicate structures, overgrown folder plans, and
  places where multiple systems are storing the same thing unnecessarily.
- Recommends simplification.

### Piccolo

- Runs cleanliness scans.
- Reports stale files, oversized folders, orphaned artifacts, duplicate hashes,
  temp/render buildup, missing metadata, and broken paths.
- Proposes archive/cleanup actions.
- May move items to archive/trash-staging only after the applicable approval
  rule exists.
- Does not destructively delete without explicit approval or an approved rule.

### Hedwig

- Owns message/reminder lifecycle hygiene.
- Owns Slack quick capture for V1.
- Keeps drafts, sent messages, follow-ups, captures, archives, and future
  email/iMessage bridge records attached to the right project/client/context.
- Routes raw captures into Notion first, then proposes tasks, sources, learning
  notes, or durable Obsidian summaries when useful.

## Cleanup Scan Types

Piccolo should eventually support:

- Missing metadata scan.
- Orphaned file scan: file exists in vault but no artifact record.
- Broken path scan: artifact record points to missing file.
- Duplicate hash scan.
- Oversized folder scan.
- Old temp/render scan.
- Stale inbox scan.
- Superseded draft scan.
- Notion duplicate/superseded page scan.
- Obsidian stale draft scan.
- Message follow-up due scan.
- Repo pollution scan: generated media, client deliverables, model files, and
  render intermediates accidentally placed inside the repo.

## Approval Gates

Safe without approval:

- Scan.
- Report.
- Classify.
- Suggest folder destination.
- Suggest retention rule.
- Detect duplicate hash.

Approval required:

- Write to vault.
- Write to Obsidian.
- Publish to Notion.
- Move/rename user-visible files.
- Archive active project files.
- Move files into trash staging.

Blocked until explicit rule or one-time approval:

- Permanent delete.
- Bulk cleanup.
- Deleting anything in the repo.
- Deleting final deliverables.
- Deleting source files.
- Deleting message records.

## Session 3 Implementation Target

Minimum useful implementation:

1. Add a vault layout helper with canonical folder names. Done in
   `app/server/integrations/vault.ts` on 2026-05-06.
2. Add `artifacts` and `cleanup_candidates` tables idempotently. Done in
   `app/server/cerebroDb.ts` on 2026-05-06.
3. Update vault writes to create artifact metadata. Initial approved-output
   write metadata was added in `app/server/routers/outputs.ts` on 2026-05-06.
4. Add a Piccolo scan/report route that only reports repo/vault risks. Initial
   read-only report added in `app/server/routers/piccolo.ts` on 2026-05-06.
5. Add artifact hooks for Notion imports/publishes and memory writes. Initial
   hooks added in `app/server/integrations/notion.ts` and
   `app/server/routers/memory.ts` on 2026-05-06.
6. Add approved Obsidian note writes. Initial route added as
   `memory.writeToObsidian` on 2026-05-06.
7. Add general artifact hooks for source notes, creative prompts, messages,
   code/QA handoffs, model tests, temp notes, and cleanup reports. Initial
   approved router added as `artifacts` in `app/server/routers/artifacts.ts`
   on 2026-05-06.
8. Add UI visibility later, after backend routes exist.

Do not create/move/delete user files during this design pass.
