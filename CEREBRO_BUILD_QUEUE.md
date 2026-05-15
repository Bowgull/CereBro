# CereBro Build Queue

Last updated: 2026-05-14

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

### Frontend Worker

Next block:

- Inspect the current visible loop and recommend one safe UI slice.
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

- Inspect current dirty backend/Raven files and report what can safely move into
  CereBro core without mixing quarantined Raven work.
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
- Later: `runtime.commitRoute` appends local route records only after UI proves
  the preview shape.

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
