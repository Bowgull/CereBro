# CereBro Build Queue

Last updated: 2026-05-15 2347 EDT

This file is CereBro Prime's active queue.

Workers may read this file. Workers do not edit it unless the lead assigns that
specific job.

## Current Build Mode

CereBro Prime plus workers.

Default worker set:

- Frontend worker
- Backend worker
- Knowledge worker
- QA worker when a read-only review is needed

Default block size: 2 to 4 hours.

Long block size: 4 to 6 hours when the slice is coherent, file ownership is
clean, and checks are known.

Default stop point: useful shape, failing check, product gate, context bloat,
cross-lane conflict, or dirty-worktree ambiguity.

## Standing Order

Build in this order:

1. Handoff integrity.
2. Keep-first visible loop.
3. Project Lab as map.
4. Terminal Lab as Aang's build-teaching lane.
5. Workbench as receipt body and visual proof.
6. Ledger as receipts and audit trail.
7. Knowledge contracts before knowledge automation.
8. Backend route receipts before agent execution.
9. Model and Tool Registry as basement capability map.
10. Animation, companion overlay, and walkthrough last.

Do not add a separate Code Lab. Terminal Lab absorbs the code teaching path.

If a proposed task does not serve this order, it waits.

## Active Stop Rules

Stop and ask when:

- product direction changes
- a new primary surface is proposed
- a worker needs to cross lane ownership
- external credentials, paid services, package installs, clone/build/run of
  third-party repos, model downloads, or account setup are needed
- a destructive action, push, deployment, or storage migration is proposed
- Raven boundaries are involved
- context bloat makes a summary and clear better than continuing

## Now

### 2026-05-14 Active Worker Topology

- Prime/integrator: this chat. Owns merge order, checks, percentages, handoff,
  Obsidian archive, commit, and push.
- Backend Worker: owns runtime, permission, receipt, and test contracts.
- Frontend Worker: owns one visible-loop UI slice with explicit file ownership.
- Knowledge Planning Worker: read-only docs, storage/source, and Obsidian audit.
- Knowledge Implementation Worker: assigned docs, storage/source, or Obsidian
  implementation only after Prime names exact files.
- QA Worker: waits when thread capacity is full; lead performs minimal local QA.

Current integration order:

1. Worker findings.
2. Prime-selected implementation slice.
3. Verification, handoff, Obsidian, commit, push.

### Prime

- Keep worker system controlled by this queue.
- Keep `CEREBRO_SESSION_HANDOFF.md`, this queue, and the Obsidian session
  archive aligned before assigning build workers.
- Start every longer pass by classifying dirty files as current slice,
  quarantine, generated/local, or blocked.
- Stage only current-slice files.
- Integrate worker findings into one next block.
- Preserve existing unrelated dirty worktree files.
- Update handoff and Obsidian archive at the end of real build blocks.

Recent Prime slices:

- 2026-05-15 2347 EDT: gated Aang Companion local event counts behind the
  Local Event Strip drawer.
- 2026-05-14 2149 EDT: collapsed Piccolo cleanup rules/storage contract,
  Artifacts save routing, and Memory proposal routing behind explicit details.
  Kept scan results, artifact list, and memory proposal input visible.
- 2026-05-14 2152 EDT: collapsed Hedwig capture rules, Notion schema, Slack
  shape, approval gates, routing rules, triage gates, review fields, approval
  previews, and proposal gates behind explicit details. Kept capture input,
  local captures, proposal basics, reminders, and message drafts visible.
- 2026-05-14 2156 EDT: collapsed Basement Settings bridge setup, how-it-works
  notes, and tracked project list behind explicit details. Kept machine status
  and bridge key copy visible.
- 2026-05-14 2159 EDT: integrated the dirty Raven backend checkpoint as a
  sealed boundary slice after tightening the CereBro launcher to exact phrase
  matching. Raven remains outside core CereBro.
- 2026-05-14 2202 EDT: deleted unused fork remnants `DungeonMap.tsx` and
  `Map.tsx`, then updated stale comments/docs that still pointed at the old
  map pathing model.
- 2026-05-14 2204 EDT: browser-verified the runtime route receipt loop. Ask
  Aang stages a Workbench draft and focuses Ledger without autosaving.
- 2026-05-14 2206 EDT: deleted unused `HandoffArchivePanel.tsx`. The real
  handoff archive remains the repo handoff plus append-only Obsidian snapshots.
- 2026-05-14 2217 EDT: added local-only `runtime.commitRoute` and
  `runtime_route_records`. Route preview remains non-mutating; commit writes one
  local route record only.
- 2026-05-14 2223 EDT: added `runtime.routeRecords` read model and a compact
  Ledger `Recent Route Reads` strip. Route records are parsed for UI use, stay
  local-only, and remain separate from Workbench evidence bodies.
- 2026-05-14 2253 EDT: added a visible `Save Route` action to the Ask Aang
  route preview. It calls `runtime.commitRoute`, refreshes Ledger routes, and
  changes to the saved route id without running routed work.
- 2026-05-14 2312 EDT: added `Stage Body` on saved Ledger route reads. It
  carries the route draft into Workbench as a local draft only; the user still
  has to press Save Local Receipt to append evidence.
- 2026-05-14 2326 EDT: added `Create Task` on saved Ledger route reads. It
  creates one local task from the route draft, shows the task id, and still does
  not run the task.
- 2026-05-15 0656 EDT: made route-created task ids clickable. Ledger now opens
  Tasks with a focused notice for the created local task.
- 2026-05-15 0716 EDT: made route-created task links durable. Saved route rows
  now store `task_id`, `runtime.createTaskFromRouteRecord` creates at most one
  local task per route, and Ledger reuses the stored task link after refresh.
- 2026-05-15 0752 EDT: capped the Tasks visible DOM to 80 rows at a time,
  added `Show 80 More`, and pinned route-focused tasks into the visible set so
  the focused receipt stays inspectable without dumping the full task pile.
- 2026-05-15 0815 EDT: added `tasks.workQueue`, a paged read-only Tasks read
  model with full status counts and focused task pinning. `TasksPanel` now uses
  this read model instead of fetching the whole task table.
- 2026-05-15 0822 EDT: moved Ledger Overview task counts and Terminal Lab task
  selector to `tasks.workQueue`, removing the old full `tasks.list` fetch from
  those high-traffic surfaces.
- 2026-05-15 1916 EDT: used 3 read-only workers for frontend, backend, and
  primitive audits. Folded findings into this queue, then shipped grouped run
  filters for Memory and Artifacts so duplicate run chips match Tasks.
- 2026-05-15 1920 EDT: normalized the remaining audited primitive drift:
  Button/Badge token fills, menu and command focus rings, Menubar grouping,
  AlertDialog risk/destructive defaults, Sheet edge radius, and Chart token
  selectors.
- 2026-05-15 1926 EDT: added `ledger.overview`, a compact read-only Ledger
  overview model, then switched LedgerOverview from 8 separate queries to one
  read model.
- 2026-05-15 1930 EDT: added `workbench.evidenceSummary` and switched Project
  Lab plus Terminal Lab receipt stats away from full Workbench evidence row
  reads.
- 2026-05-15 1933 EDT: added `sessions.recent`, indexed
  `sessions.last_seen_at`, and switched dropdown/filter surfaces off full
  `sessions.list` where notes are not needed.
- 2026-05-15 1935 EDT: simplified Approval Queue default read by hiding groups
  and permission checks behind disclosures and removing raw ids from default
  approval cards.
- 2026-05-15 1937 EDT: simplified Artifacts into Saved Outputs; raw storage
  path, retention, and owner now sit behind per-output details.
- 2026-05-15 1940 EDT: simplified the Workbench default read; Project Proof,
  receipt grouping, and read gates now sit behind closed disclosures.
- 2026-05-15 1944 EDT: added cached read-only Project Lab git status and moved
  overview/detail reads onto the shared cache.
- 2026-05-15 1946 EDT: removed Skills Manager 3 second polling; agent/skill
  file reads are now active-tab, active-scope, manual-refresh reads.
- 2026-05-15 1950 EDT: added compact `approvals.queue` plus selected
  `approvals.detail`; Approval Queue no longer loads full proof for every row.
- 2026-05-15 1953 EDT: gated Workbench `linkOptions` behind the closed Receipt
  Links drawer, with a 30 second stale window and manual disclosure read.
- 2026-05-15 1955 EDT: gated Design Review `workbench.evidencePicker` behind
  the linked receipt selector.
- 2026-05-15 1957 EDT: gated Workbench comparison `evidencePicker` behind the
  Append Before/After Receipt drawer.
- 2026-05-15 2008 EDT: removed Project Lab selected-detail 10 second polling;
  the selected inspector now uses a 30 second stale local read and mutation
  invalidation.
- 2026-05-15 2011 EDT: removed the remaining Project Lab and Terminal Lab
  timer polling reads; both panels now use 30 second stale local reads with
  focus/reconnect refetch disabled.
- 2026-05-15 2013 EDT: removed drawer/support timer polling from Tasks,
  Memory, Artifacts, Sessions, and Piccolo; local list reads now use stale
  caches and mutation invalidation.
- 2026-05-15 2015 EDT: removed Home shell timer polling from tracked projects,
  embedded Ledger overview, Basement status cards, Piccolo hygiene, and
  security receipt reads.
- 2026-05-15 2017 EDT: removed the last client timer polling from Permission
  Mode, Aang Companion, and Surfer Sources. No `refetchInterval` calls remain
  under `app/client/src`.
- 2026-05-15 2021 EDT: added `runtime.createApprovalPreviewFromRouteRecord`
  and a Ledger `Queue Gate` action so saved route records can queue one local
  approval/preflight preview without running routed work.
- 2026-05-15 2024 EDT: projected pending route approval previews into
  `runtime.routeRecords` and `ledger.overview`; Ledger route cards now show
  `gate #...` and open the existing gate.
- 2026-05-15 2033 EDT: added `runtime.createWorkbenchReceiptFromRouteRecord`;
  saved routes can now append one local Workbench receipt, and Ledger route
  cards show `receipt #...` after saving.
- 2026-05-15 2040 EDT: browser-checked the route-to-Workbench receipt flow on
  localhost. Ask Aang preview saved route #22, Ledger saved Workbench receipt
  #1527, the route row changed from `Save Body` to `Receipt #1527`, and the
  linked receipt button now opens the Workbench body filtered to
  `runtime_route:22`.
- 2026-05-15 2044 EDT: gated Workbench Project Proof reads behind the closed
  drawer and switched the opened read to compact `workbench.evidenceSummary`
  project groups instead of a 100-row receipt body fetch.
- 2026-05-15 2047 EDT: gated Security Gate source-link reads behind a closed
  `Source Link` drawer. Spock no longer loads Workbench source link options on
  default panel open.
- 2026-05-15 2125 EDT: gated Approval Queue support reads behind the closed
  Groups and Permission Checks drawers. Header counts now say `closed` until
  Permission Checks is opened.
- 2026-05-15 2130 EDT: gated Hedwig proposal approval-preview reads behind the
  selected proposal's `Approval Previews` drawer. Selected proposals now start
  with `open to read`.
- 2026-05-15 2319 EDT: gated Model Tools eval notes, route preview reads, and
  Ollama approval-preview reads behind explicit open/read actions.
- 2026-05-15 2323 EDT: gated Terminal Lab side-rail receipt stats and terminal
  approval previews behind explicit drawer opens.
- 2026-05-15 2327 EDT: gated Project Lab Workbench receipt summary behind
  Project Rules so project cards show `open to read` until proof is requested.

### Frontend Worker

Next block:

- Take one high-noise surface pass only if the next surface still shows
  machinery first. Otherwise move to another broad-read reduction or runtime
  receipt contract slice.
- Keep the primitive contract intact: CereBro token colors, visible focus,
  compact density, 8px max radius, risk before destructive, grouped menus, and
  dark shell surfaces.
- Favor hidden machinery, compact receipts, obvious next action, and fast AI OS
  feel.
- Do not create a new surface.
- Do not touch backend unless Prime assigns exact files.

Candidate owned files:

- `app/client/src/pages/Home.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/LedgerPanel.tsx`

Checks:

- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- browser or localhost proof when callable

### Backend Worker

Next block:

- Build compact read models before broad UI growth. Highest-value order:
  continue the route receipt contract family only if another visible link is
  missing; otherwise move to the next runtime contract or broad-read reduction
  that keeps CereBro fast.
- Keep Raven outside core CereBro.
- Keep route receipts and approval previews explicit and preview-only unless
  Prime assigns a mutation.
- No model call, browser action, command execution, DB write, or external write.

Candidate owned files when assigned:

- `app/server/routers/runtime.ts`
- `app/server/routers/modelTools.ts`
- `app/server/routers/approvals.ts`
- `app/server/permissionPolicy.ts`
- `app/server/runtime.routeReceipt.test.ts`
- `app/server/modelTools.localFirst.test.ts`

Checks:

- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app test -- runtime`
- `pnpm -C app test -- server/cerebro-foundations.test.ts`

### Knowledge Planning Worker

Next block:

- Keep the master plan, build queue, worker orchestration, handoff, and Obsidian
  archive aligned with the actual build.
- Recommend planning corrections before broad implementation.
- Keep archive snapshots append-only.
- Do not build the vector provider yet.
- Do not write Notion, Slack, Drive, or external project repos without approval.

### Knowledge Implementation Worker

Next block:

- Wait until Prime assigns exact docs, storage contracts, or Obsidian files.
- Do not run as the default knowledge lane.
- Do not update handoff snapshots or the session archive unless Prime explicitly
  assigns that closeout task.

Candidate owned files:

- `CEREBRO_WORKER_ORCHESTRATION.md`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`
- Obsidian session archive snapshots and index

Checks:

- Markdown consistency read
- Handoff snapshot and index append

## Next Blocks

### Block A: Frontend Receipt Loop

Goal:

- The user can see mode read, route, receipt body, validation, output, and next
  safe action without guessing.

Expected shape:

- Project Lab card says dirty state, branch, push readiness, manual push, and
  optional auto policy.
- Terminal Lab explains command observations and suggested next command without
  executing.
- Workbench owns the receipt body and visual proof.
- Ledger owns the audit trail.

### Block B: Backend Receipt Contracts

Goal:

- Backend read models return the fields the frontend needs for the visible loop.
- `runtime.previewRoute` returns Aang read, confidence, category, project,
  Cortana route, owner/support agents, permission class, model/tool proposals,
  approval gates, and next action.
- Next: route preview returns Workbench draft and Ledger focus payloads.
- Browser proof complete: route preview opens Workbench with a staged draft and
  opens Ledger with a focus notice. No receipt or audit row is autosaved.
- Later: `runtime.commitRoute` appends local route records only after UI proves
  the preview shape.
- Done first pass: `runtime.commitRoute` appends one local route record and
  does not run routed work, create tasks, save Workbench evidence, or write
  externally.
- Done second pass: `runtime.routeRecords` lists recent local route records with
  parsed route chain, gates, model/tool proposal, Workbench draft, Ledger focus
  draft, task draft, next action, owner, project, and timestamp.

Expected shape:

- no hidden execution
- no external writes
- no command run from UI
- tests cover state names and receipt boundaries
- risky repo, install, command, browser, package, download, or URL requests route
  through Spock before Tony can act

### Block C: Storage And Obsidian Setup

Goal:

- CereBro can show where outputs, handoffs, source notes, project bridge notes,
  GitHub source notes, RAG-ready notes, and archive snapshots belong.

Expected shape:

- vault configured or visibly missing
- Obsidian archive path visible
- project bridge expectation visible
- RAG-ready note fields documented and test-backed when code exists
- GitHub helper paths match:
  `10_Projects/<Project>/<Project>.md`,
  `20_Knowledge/Sources/GitHub/<Project> Repository Source.md`,
  `00_Atlas/GitHub Project Map.md`, and
  `20_Knowledge/Sources/GitHub/GitHub Sources.md`
- archive snapshots stay `archive_only` for normal RAG

### Block D: Model And Tool Registry

Goal:

- Connected tools are readable capability proposals, not product sprawl.
- Ollama/local models are part of the core fast local-first router path, not an
  optional decoration.

Expected shape:

- Ollama install status, approved tiny local model shortlist, speed, quality,
  disk impact, and eval result are visible in Basement.
- Nano Banana-style vision, PixelLab, GitHub, Notion, Browser Use, Hugging Face,
  and future tools appear as capability records
- each record shows allowed actions, approval gates, storage impact, and owner
- no plugin becomes a primary CereBro feature just because it is connected
- installs, model pulls, deletes, provider calls, and background inference stay
  approval-gated

### Block E: Agent Runtime Skeleton

Goal:

- Aang reads intent. Cortana routes. Agents produce receipts. Spock gates risk.

Expected shape:

- route proposal first
- approval gate before risky work
- receipt before summary
- validation before durable output when needed

## Blocked Or Needs User

- Exact Drive or Obsidian vault root if not configured in env.
- Slack account/channel setup.
- Turso cloud setup if local SQLite is no longer enough.
- Any external service credentials.
- Any push, deployment, PR, or account setup not already approved in-session.

## Done Today

- Worker system designed as lead plus lane workers.
- Worker ownership rules added.
- Active build queue added.
- Sundesk Obsidian repair closed: build handoffs belong under
  `90_Archive/Sundesk Build History/snapshots/`; the project bridge stays at
  `10_Projects/Sundesk/Sundesk.md`; the wrong root `Sundesk` lane should not
  be recreated.
- Block C knowledge contract layer started: artifact kinds, lifecycle states,
  retention rules, vault layout, Obsidian lanes, RAG metadata fields, and
  GitHub bridge paths now have one backend source of truth.
- Piccolo now exposes the storage contract as a read-only receipt in Automation
  Hygiene. It shows contract counts, Obsidian lane rules, and project bridge
  paths without writing to the vault or creating cleanup actions.
- Project Lab now shows each tracked project's knowledge route: bridge note,
  GitHub source note, archive-only history, and the write approval gate.
- Workbench receipt bodies now show linked project knowledge route context when
  a receipt belongs to a project, without creating durable notes.
- Model Tools now exposes creative capability lanes for Gojo ComfyUI, Raven
  private ComfyUI, RealESRGAN upscale, and free cloud burst tools. All lanes are
  proposal-only, approval-gated, and separated by privacy boundary.
- Model Tools now exposes the fast local-first Ollama path: local summary,
  lightweight routing, small private work, and embedding smoke tests are core
  router lanes, while installs and model pulls remain approval-gated.
- Runtime route receipts now include model-lane guidance so Ask Aang can show
  when local Ollama is the fast first path and when Codex/frontier escalation
  needs approval.
- Model Tools now shows the Ollama setup readiness plan: first approval batch,
  stretch candidates, blocked first installs, test procedure, storage rule, and
  no-action receipt. No install or model pull runs from the panel.
- Basement Overview now shows the Ollama setup receipt directly: status, next
  approval steps, first-batch model chips, and a link into Model Details.
- Model Tools and Basement Overview now expose the Ollama install-status check
  draft: allowed read-only commands, forbidden install/pull/run actions, receipt
  fields, and no-action status.
- Model Tools can now stage a local approval preview for the Ollama
  install-status check. It records approval/preflight metadata only and still
  runs no command, install, pull, model call, or background process.
- Model Details now links staged Ollama status previews directly to the Approval
  Queue, and the Approval Queue empty state now names Model Tools as a staging
  source.
- Dev-server visual proof is cleaner: Express/Vite middleware now honors the
  no-HMR local setup, so Playwright no longer sees Vite websocket errors on
  `localhost:3002`.
- Approval Queue now shows a compact receipt chain on selected previews:
  origin, target, preflight, next safe surface, and Security Gate jump.
- Local Playwright inspection output is ignored through `.gitignore`.
- Workbench now follows the low-machinery rule more closely: surfaces,
  permissions, receipt shape, and gates live behind one `Workbench Rules`
  disclosure instead of occupying the primary work flow.
- Terminal Lab now follows the same low-machinery pattern: command teaching,
  observations, observed output, and project context stay visible while policy,
  live links, surface inventory, and approval preview history sit behind
  `Terminal Rules`.
- Project Lab now moves global scan state and the project-wide receipt-chain
  proof into `Project Rules`, leaving project filters, next safe projects, and
  project cards as the default work surface.
- Ledger now keeps receipt history and selected receipt inspection primary,
  with audit rules and the receipt-path explanation tucked into `Ledger Rules`.
- Project Lab project cards now keep the push decision visible while manual
  commands, policy/evidence, checks, suggested commit, and manual push preview
  live behind per-card `Push Details`.
- Project Lab project cards now keep route/proof, local draft actions, recent
  queues, and dirty file lists behind `Project Details`, `Draft Actions`,
  `Activity Details`, or the inspector instead of showing every supporting row
  on the default card.
- Project Lab card support detail is now consolidated into the Local Inspector
  path. The default card no longer renders `Project Details`, `Draft Actions`,
  `Activity Details`, duplicate recent lists, or first-five dirty file lists.
- Project Lab inspector language now reads as `Project Read`, with calmer search,
  empty, detail, and dirty-worktree copy.
- Terminal Lab observation cards now keep command, output, receipt, and teaching
  context visible while follow-ups, Tony diagnostics, gates, links, and archive
  controls live behind per-row `Observation Actions`.
- Terminal Lab right rail now keeps Terminal Map Read and Next Safe Action
  visible while receipt counts and command-boundary policy live behind
  `Receipt Details` and `Command Boundary`.
- Repo hygiene pass removed ignored generated clutter from the workspace and
  removed the only tracked `.DS_Store` file from the starter pack.
- Workbench Add Receipt now keeps receipt kind, title, summary, save status, and
  save action visible while optional links, metadata, sensitive flag, and
  temporary media intake live behind closed details.
- Workbench selected receipt detail now keeps the body read and next actions
  visible while knowledge route, metadata, permission preflight, gates,
  validation trail, comparison trail, and append forms live behind closed
  details.
- Approval Queue selected detail now keeps receipt chain and approval summary
  visible while permission preflight, Oak notes, Spock notes, reason, and
  context live behind closed details.
- Security Gate now keeps target, risk, project link, and source link visible
  while receipt findings/checks/browser policy and scanner adapters live behind
  closed details.
- Research now keeps saved-source identity and summaries visible while per-card
  source rules, browser ladder, and approval policy live behind closed details.
- Model Tools now keeps registry, selected capability detail, and route preview
  visible while Ollama status internals, model batches, proposal form, eval
  form, and gates live behind closed details.
- Runtime route records now have a backend read model and a compact Ledger
  overview section. Ledger shows recent Aang to Cortana route reads without raw
  JSON or hidden execution.
- Ask Aang route previews now have an explicit `Save Route` action. Saving
  writes one local route record, disables the save button with the route id, and
  refreshes Ledger route reads. It does not create a task, save Workbench
  evidence, run a command, call a model, open a browser, or write externally.
- Saved Ledger route reads now expose `Stage Body`. It moves the saved route
  into Workbench's Add Receipt form as a draft, preserves review-before-save,
  and still avoids hidden execution or evidence writes.
- Saved Ledger route reads now expose `Create Task`. It turns a route into one
  local task record and displays the created task id. Route, task, Workbench
  evidence, command, browser, and model actions remain separate.
- Route-created task ids now open Tasks with a focus notice. This is a UI focus
  handoff only; it does not add a new route-task relation or run work.
- Tasks now groups duplicate run filter labels into one compact chip, such as
  `Terminal QA run (25)`, and sends the grouped session ids through the
  read-only work queue instead of flooding the filter lane.
- Terminal Lab now disambiguates duplicate session labels with run ids in its
  task/observation surface, such as `Terminal QA run #539`, while keeping
  execution disabled.
- Terminal Lab link pickers now have compact local search fields for task and
  session links. Searching `539` narrows the Session Link dropdown to
  `Terminal QA run #539` without changing the proposal-only command boundary.
- Workbench Receipt Links now use the same compact local search pattern for
  task and session links. Receipt creation stays append-only and local; the
  search only narrows already loaded link options.
- Workbench Receipt Links now also has compact local search for source,
  command, and artifact links. The whole receipt-link disclosure now narrows
  loaded options instead of exposing raw long dropdowns.
- Memory and Artifacts now group duplicate run filter chips by display label
  while keeping exact run ids visible in write/link dropdowns.
- Shared primitives now use tighter CereBro token/focus/risk contracts across
  Button, Badge, Dropdown Menu, Menubar, Command, AlertDialog, Sheet, and Chart.
- Ledger Overview now reads one compact backend model instead of fanning out
  into Tasks, Sessions, Approvals, Artifacts, Memory, Workbench, and Runtime
  read calls from React.
- Project Lab and Terminal Lab now use compact Workbench evidence summaries for
  receipt stats instead of full receipt row reads.
- Tasks, Terminal Lab, Memory, and Artifacts now use compact recent session
  label reads instead of full session ledger rows.
- Approval Queue now shows waiting decisions first; grouping and permission
  check machinery sit behind closed disclosures.
- Artifacts now reads as Saved Outputs first; raw storage path, retention, and
  owner proof sit behind per-output details.
- Workbench now keeps Add Receipt and Recent Receipts primary while Project
  Proof, receipt grouping, and read gates sit behind closed disclosures.
- Project Lab now reads git status through a cached read-only model and shows a
  compact Git read/cached badge instead of silently shelling out on every
  overview/detail refresh.
- Skills Manager now reads local agent/skill files only for the active
  tab/scope and uses manual refresh instead of 3 second polling.
- Approval Queue now uses compact local queue rows by default and loads full
  preflight/Oak/Spock proof only for the selected decision.
- Workbench now reads link options only when the Receipt Links drawer is open.
- Design Review now reads Workbench receipt candidates only when the linked
  receipt selector is opened.
- Workbench now reads comparison receipt candidates only when the Append
  Before/After Receipt drawer is open.
- Project Lab selected detail no longer polls every 10 seconds while idle; it
  now uses a 30 second stale local read and explicit mutation invalidation.
- Project Lab and Terminal Lab no longer timer-poll their default project,
  task, session, git, and receipt summary reads while idle.
- Tasks, Memory, Artifacts, Sessions, and Piccolo no longer timer-poll local
  list/support reads while their drawers are idle.
- Home shell no longer timer-polls tracked projects, embedded Ledger overview,
  Basement status cards, Piccolo hygiene, or security receipt summaries while
  idle.
- Permission Mode, Aang Companion, and Surfer Sources no longer timer-poll
  client reads; `app/client/src` has no remaining `refetchInterval` calls.
- Runtime route records can now queue one local approval/preflight preview from
  Ledger through `Queue Gate`; repeated clicks reuse the existing pending
  approval.
- Runtime route reads now show pending gate ids, and Ledger opens the existing
  gate instead of hiding that state.
- Runtime route records can now save one local Workbench receipt through
  `Save Body`; repeated saves reuse the existing receipt.
- Browser proof confirms the Ask Aang -> Save Route -> Ledger -> Save Body ->
  Receipt #... loop works on localhost without hidden execution.
- Route receipt buttons now open the Workbench body directly, preserving
  Ledger as audit trail and Workbench as receipt body.
- Workbench Project Proof now reads only when opened and uses compact project
  receipt groups instead of fetching 100 receipt bodies while closed.
- Security Gate source links now read only when the `Source Link` drawer opens.
