# CereBro Build Queue

Last updated: 2026-05-18 2233 EDT

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

1. Redesign contract and shell foundation.
2. Handoff integrity.
3. Keep-first visible loop.
4. Project Lab as map.
5. Terminal Lab as Aang's build-teaching lane.
6. Daily OS and manual browser contracts.
7. Workbench as receipt body and visual proof.
8. Ledger as receipts and audit trail.
9. Knowledge contracts before knowledge automation.
10. Backend route receipts before agent execution.
11. Model and Tool Registry as basement capability map.
12. Animation, companion overlay, and walkthrough last.

Do not add a separate Code Lab. Terminal Lab absorbs the code teaching path.

If a proposed task does not serve this order, it waits.

## Active Stop Rules

Stop and ask when:

- `CEREBRO_ANTI_DRIFT_LAW.md` marks the slice as major drift
- product direction changes
- a new primary surface is proposed
- a worker needs to cross lane ownership
- external credentials, paid services, package installs, clone/build/run of
  third-party repos, model downloads, or account setup are needed
- a destructive action, push, deployment, or storage migration is proposed
- Raven boundaries are involved
- context bloat makes a summary and clear better than continuing

## Now

### 2026-05-17 Active Redesign Foundation

- `CEREBRO_UI_REDESIGN_CONTRACT.md` is active.
- Current slice: controlled shell foundation before execution wiring.
- Theme lock: Verdigris Ivory for Keep shell, Graphite Candle for dense work
  surfaces, Soft Parchment rejected as global shell.
- Keep anatomy lock: 11 agents, 3 floors, no extra rooms, no user sprite, no
  Phaser Keep replacement, no castle art replacement in the first redesign
  pass.
- Rollout order: contract and shell tokens, main shell frame, Keep home route
  read, Project Lab, Terminal Lab, Workbench, Ledger, Approvals, Sources,
  Basement.
- Execution remains blocked until route receipt, work object, approval receipt,
  risk class, executor, result receipt, and recovery note contracts exist and
  pass tests.

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
- Before edits, state why the slice is on the build path, which surface owns
  it, and what will not be built.
- Before material UI edits, read `CEREBRO_UI_TASTE_AUDIT.md` and name the
  surface register. Product surfaces stay task-led, proof-aware, and low
  machinery.
- Keep creative UI and UX work inside the lane: improve taste, comprehension,
  and feeling only when the change has a named owner surface and a clear return
  to the current build path.
- Close each real build pass with a drift check in the handoff.
- Stage only current-slice files.
- Integrate worker findings into one next block.
- Preserve existing unrelated dirty worktree files.
- Update handoff and Obsidian archive at the end of real build blocks.

Recent Prime slices:

- 2026-05-18 2233 EDT: polished Workbench Browser proportions. Added stronger
  browser-frame material, attached tab styling, folder-style bookmark markers,
  larger address controls, larger Current Page/Watch Shelf bodies, and richer
  Watch Shelf category states. Screenshots saved at
  `output/playwright/workbench-browser-proportion-polish-current-page.png` and
  `output/playwright/workbench-browser-proportion-polish-watch-shelf.png`. No
  page open, fetch, search request, Watch Shelf save, source save, provider
  call, install, external write, or Raven path was added.
- 2026-05-18 2227 EDT: moved Workbench Browser toward the locked
  Browser/Watch Shelf mockup. Browser is now the first Workbench object, with
  `Current Page` and `Watch Shelf` tabs, blocked `+`, one address/search field,
  bookmark rail, Watch Shelf categories, page actions behind the dot menu, and
  Browser proof/gate machinery collapsed. Screenshots saved at
  `output/playwright/workbench-browser-mockup-fidelity-current-page.png` and
  `output/playwright/workbench-browser-mockup-fidelity-watch-shelf.png`. No
  page open, fetch, search request, Watch Shelf save, source save, provider
  call, install, external write, or Raven path was added.
- 2026-05-18 2216 EDT: reduced main-shell right-rail machinery. Changed the
  route rail into compact route/surface/chain/contract/session/next context,
  removed exposed proof/tool-scope/Oak validation blocks from the primary
  shell, narrowed the rail, and removed the floating `The Hub waits` overlay
  from the castle scene. Browser proof saved at
  `output/playwright/main-shell-right-rail-low-machinery-clean.png`. Next best
  slice is Browser/Watch Shelf mockup fidelity inside Workbench.
- 2026-05-18 2205 EDT: moved the main shell toward the locked high-fidelity
  mockup. Added carved/marble outer shell framing, compact plaque-style left
  rail, live Keep scene as the default home view, richer Keep dock/surface tabs,
  dark right context rail, and Aang beside the command input. Browser proof
  saved at `output/playwright/main-shell-mockup-fidelity-pass.png`. Still not
  full 1:1. Next fidelity gaps are Browser/Watch Shelf mockup fidelity, right
  rail machinery reduction, rail icon craft, and tighter command-bar
  composition.
- 2026-05-18 0530 EDT: added Workbench live-runner launch gate.
  `workbench.browserLiveRunnerLaunchGate` reads proposal, live-runner approval,
  and latest runner audit state, then returns `implementationPresent: false`,
  `canOpenPage: false`, and `canExecute: false`. Workbench Live Preflight now
  shows `Launch Gate / live runner implementation missing`. No live browser
  runner, browser automation, real browser tab, page open, fetch, history,
  source save, Watch Shelf item save, progress persistence, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-18 0525 EDT: added Workbench preflight to Ledger runner focus.
  Workbench Live Preflight latest audit now exposes a `Ledger` action that
  stores `browserRunnerAuditId` in the existing local Ledger focus draft.
  Ledger reads it and opens Runner Receipt Detail automatically. No live
  browser runner, browser automation, real browser tab, page open, fetch,
  history, source save, Watch Shelf item save, progress persistence, external
  write, provider/model call, install, pull, or Raven path was added.
- 2026-05-18 0520 EDT: added Workbench Live Preflight latest audit readback.
  `workbench.browserLiveRunnerPreflight` now reads the latest
  `browser_runner_audit_records` row for the proposal and exposes a compact
  `Latest runner audit` gate. Workbench Live Preflight shows the latest blocked
  audit inline. No live browser runner, browser automation, real browser tab,
  page open, fetch, history, source save, Watch Shelf item save, progress
  persistence, external write, provider/model call, install, pull, or Raven
  path was added.
- 2026-05-18 0515 EDT: added Ledger Browser runner audit detail.
  `ledger.browserRunnerAuditDetail` reads one Browser runner audit receipt
  with linked proposal context. Ledger Runner Audits now expose `Inspect` and a
  compact `Runner Receipt Detail` panel with no-page/no-execute state. No live
  browser runner, browser automation, real browser tab, page open, fetch,
  history, source save, Watch Shelf item save, progress persistence, external
  write, provider/model call, install, pull, or Raven path was added.
- 2026-05-18 0510 EDT: added Workbench blocked live-runner check.
  `workbench.runBrowserLiveRunnerBlocked` writes a local blocked runner audit
  receipt and distinguishes missing live-runner approval from missing live
  runner implementation. Workbench Browser proposal details now include
  `Check Live`. No live browser runner, browser automation, real browser tab,
  page open, fetch, history, source save, Watch Shelf item save, progress
  persistence, external write, provider/model call, install, pull, or Raven
  path was added.
- 2026-05-18 0505 EDT: added Ledger Browser live-runner gate readback.
  Ledger Browser Receipt Audit now reads `browser_live_runner` approval rows,
  reports total, pending, and approved live-runner gates, and shows a compact
  `Live Runner Gates` lane with `no page open` state. No live browser runner,
  browser automation, real browser tab, page open, fetch, history, source save,
  Watch Shelf item save, progress persistence, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-18 0500 EDT: added Approval Queue hidden row counts.
  `approvals.queue` now returns total, visible, and hidden approval row counts.
  Approval Queue uses the visible count for the Waiting stat and states when
  older local rows are hidden by the current limit. No rows were deleted. No
  live browser runner, browser automation, real browser tab, page open, fetch,
  history, source save, Watch Shelf item save, progress persistence, external
  write, provider/model call, install, pull, or Raven path was added.
- 2026-05-18 0455 EDT: added Approval Queue Browser live-runner readback.
  Approval detail now marks `browser_live_runner` receipts as live-runner
  gates with `approvalKind`, `liveRunnerAction`, and `liveRunnerGate`.
  Approval Queue shows a compact `live runner gate` chip and no-page/no-runner
  audit copy. No live browser runner, browser automation, real browser tab,
  page open, fetch, history, source save, Watch Shelf item save, progress
  persistence, external write, provider/model call, install, pull, or Raven
  path was added.
- 2026-05-18 0450 EDT: added Workbench Browser live-runner approval preview.
  `workbench.createBrowserLiveRunnerApprovalPreview` now creates one pending
  local `browser_live_runner` approval preview, dedupes existing pending rows,
  and records a local permission preflight. Workbench Browser proposal details
  show `Stage Live`. `browserLiveRunnerPreflight` recognizes approved
  live-runner approval but still returns `canOpenPage: false` and
  `canExecute: false`. No live browser runner, browser automation, real browser
  tab, page open, fetch, history, source save, Watch Shelf item save, progress
  persistence, external write, provider/model call, install, pull, or Raven
  path was added.
- 2026-05-18 0442 EDT: added Workbench Browser live preflight readback.
  `workbench.browserLiveRunnerPreflight` now reads Browser proposal gate state
  and separates approval preview, approved execution approval, and explicit
  live-runner approval. Workbench Browser proposal details show a compact
  `Preflight` read. It returns `canOpenPage: false` and `canExecute: false`
  even when all local scaffolds exist. No live browser runner, browser
  automation, real browser tab, page open, fetch, history, source save, Watch
  Shelf item save, progress persistence, external write, provider/model call,
  install, pull, or Raven path was added.
- 2026-05-18 0434 EDT: added Workbench Browser hidden proposal counts.
  `workbench.browserActionProposals` now returns total, visible, and hidden
  Browser proposal row counts. Workbench Browser Recent Proposals shows compact
  `shown` and `hidden` chips and states that older local rows stay hidden until
  Ledger or a focused approval opens them. No rows were deleted. No live
  browser runner, browser automation, real browser tab, page open, fetch,
  history, source save, Watch Shelf item save, progress persistence, external
  write, provider/model call, install, pull, or Raven path was added.
- 2026-05-18 0427 EDT: added Workbench Browser audit summary readback.
  `workbench.browserActionProposals` now summarizes
  `browser_runner_audit_records` per proposal, including runner audit count,
  latest audit id, latest blocked runner state, and no-page/no-execute state.
  Workbench Browser proposal rows show a compact `audits N` chip and expanded
  proposal details show the latest runner audit. No live browser runner,
  browser automation, real browser tab, page open, fetch, history, source save,
  Watch Shelf item save, progress persistence, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2347 EDT: added Ledger Browser runner audit readback.
  Ledger Browser Receipt Audit now reads `browser_runner_audit_records`,
  exposes runner audit count and latest rows, and shows `Runner Audits` in the
  existing audit section. Ledger shows audit id, proposal id, blocked runner
  state, and no-page state. No live browser runner, browser automation, real
  browser tab, page open, fetch, history, source save, Watch Shelf item save,
  progress persistence, external write, provider/model call, install, pull, or
  Raven path was added.
- 2026-05-17 2341 EDT: added Workbench blocked runner audit receipts.
  `browser_runner_audit_records` now stores local blocked runner checks.
  `workbench.runBrowserActionBlocked` writes a receipt when `Check Runner` is
  used and Workbench shows the audit id. The receipt records that no browser
  opened, no page fetched, no source saved, no Workbench capture was created,
  no Watch Shelf item was saved, and no external write ran. No live browser
  runner, browser automation, real browser tab, page open, fetch, history,
  source save, Watch Shelf item save, progress persistence, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2331 EDT: added Approval Watch Shelf receipt readback.
  Browser approval detail now marks `Add to Watch` proposals as Watch Shelf
  actions, exposes `canSaveWatchShelf: false` and
  `canPersistWatchProgress: false`, and shows a shelf gate explanation.
  Approval Queue shows `shelf blocked` and `no progress` for Add to Watch
  Browser proposals. No Watch Shelf item save, watch progress persistence,
  browser runner, browser automation, real browser tab, page open, fetch,
  history, source save, external write, provider/model call, install, pull, or
  Raven path was added.
- 2026-05-17 2325 EDT: added Ledger Watch Shelf audit readback. Ledger Browser
  Receipt Audit now reads `browser_watch_shelf_items`, exposes shelf count,
  `canSaveWatchShelf: false`, `canPersistWatchProgress: false`, and latest
  shelf rows. Ledger UI shows `Watch Shelf`, `Shelf Save`, and `Progress`
  inside the existing Browser Receipt Audit section. No Watch Shelf item save,
  watch progress persistence, browser runner, browser automation, real browser
  tab, page open, fetch, history, source save, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2317 EDT: added Workbench Watch Shelf storage contract.
  Added local `browser_watch_shelf_items` schema and
  `workbench.watchShelfStorageContract`. Workbench Watch Shelf now reads the
  real shelf table shape and shows `storage blocked`, row count, and
  `no progress` in the drawer. No Watch Shelf item save, watch progress
  persistence, browser runner, browser automation, real browser tab, page open,
  fetch, history, source save, external write, provider/model call, install,
  pull, or Raven path was added.
- 2026-05-17 2307 EDT: compacted Workbench Browser runner readiness UI.
  Removed the side-column receipt layout that compressed text into a narrow
  vertical strip. Runner readiness now uses compact `Target`, `Manual
  Allowance`, and `Blocked` blocks, with required receipt chips below and
  explicit `No page opens here.` copy. No backend behavior changed. No browser
  runner, browser automation, real browser tab, page open, fetch, history,
  source save, Watch Shelf item save, external write, provider/model call,
  install, pull, or Raven path was added.
- 2026-05-17 2303 EDT: added Workbench Browser focused proposal pinning.
  `workbench.browserActionProposals` can now include a focused proposal id
  before the compact recent list, so Approval Queue handoffs keep the exact
  Browser proposal visible even when it is outside the recent limit. Workbench
  passes `selectedBrowserProposalId` into the query and marks the row with a
  `focused` chip. No approval execution, browser runner, browser automation,
  real browser tab, page open, fetch, history, source save, Watch Shelf item
  save, external write, provider/model call, install, pull, or Raven path was
  added.
- 2026-05-17 2257 EDT: added Approval Queue Browser proposal receipt readback.
  `approvals.detail` now reads linked Browser proposal metadata: action,
  target, risk, result state, recovery note, blocked open state, and no-action
  copy. Approval Queue shows a compact Browser proposal receipt card with
  `no page open` and can hand off to Workbench Browser proposal policy readback
  without opening a page. No approval execution, browser runner, browser
  automation, real browser tab, page open, fetch, history, source save, Watch
  Shelf item save, external write, provider/model call, install, pull, or Raven
  path was added.
- 2026-05-17 2250 EDT: added Ledger Browser receipt audit visibility.
  `ledger.overview` now reads Browser proposal counts, draft tab counts,
  blocked result scaffolds, recovery note scaffolds, latest Browser proposals,
  and latest draft tabs. Ledger now shows a compact `Browser Receipt Audit`
  section with `no page open`, `Draft Tabs`, and `No browser opened. No page
  fetched.` copy. Workbench remains the Browser body surface. Ledger remains
  the audit surface. No dedicated Browser nav surface, browser runner, browser
  automation, real browser tab, page open, fetch, history, source save, Watch
  Shelf item save, external write, provider/model call, install, pull, or Raven
  path was added.
- 2026-05-17 2242 EDT: added Workbench Browser result/recovery scaffolding.
  `browser_action_proposals` now has `recovery_note`, and
  `workbench.createBrowserResultRecoveryScaffold` records
  `blocked_before_runner` plus a draft recovery note on a Browser proposal.
  Manual open runner policy now reads result receipt and recovery note gates
  from the Browser proposal. Workbench Browser proposal details expose
  `Stage Result`. Even when all scaffolds are present, `canExecute` and
  `canOpenPage` remain false. No browser runner, browser automation, real
  browser tab, page open, fetch, history, source save, Workbench capture,
  external write, provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2235 EDT: hardened the Workbench Browser manual open runner
  policy. Pending approval preview and approved execution approval are now
  separate gates. A pending Browser approval preview no longer satisfies the
  execution approval gate. The policy panel shows `Approval preview`,
  `Approved execution approval`, `Not execution permission`, and runner blocked
  copy. No browser runner, browser automation, real browser tab, page open,
  fetch, history, source save, Workbench capture, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2230 EDT: added Workbench Browser manual open runner policy
  readback. `workbench.browserManualOpenRunnerPolicy` reads approval preview,
  Spock, Workbench body, draft tab, result receipt, and recovery note gates.
  Workbench Browser proposal details now expose `Read Policy` and show
  `blocked_before_runner`, ready/missing counts, next missing gate, manual
  runner blocked copy, and no-action copy. No browser runner, browser
  automation, real browser tab, page open, fetch, history, source save,
  Workbench capture, external write, provider/model call, install, pull, or
  Raven path was added.
- 2026-05-17 2224 EDT: added local Workbench Browser draft tab rows.
  `browser_tab_sessions` now links to `browser_action_proposals` through
  `proposal_id`, with migration support for existing DBs.
  `workbench.createBrowserTabSessionDraft` creates or reuses one local draft
  tab row and returns no-action copy. Workbench Browser proposal details now
  expose `Stage Tab` and show `Draft tab draft-proposal-... staged. No page
  opened.` No browser runner, browser automation, real browser tab, page open,
  fetch, history, source save, Workbench capture, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2218 EDT: added the blocked Workbench Browser manual open-page
  contract. `workbench.browserManualOpenPageContract` reads a durable Browser
  proposal and returns the target URL, required pre-open receipts, open
  blocked, tab blocked, fetch blocked, manual-open gate, and no-action copy.
  Workbench Browser proposal details now expose `Read Open`. No browser tab
  session row, browser runner, browser automation, real browser tab, page open,
  fetch, history, source save, Workbench capture, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2211 EDT: added the local Workbench Browser tab/session storage
  table contract. `browser_tab_sessions` now exists in the local schema, and
  `workbench.browserTabSessionStorageContract` reads it without writing rows.
  Workbench Browser shows `browser_tab_sessions`, `storage blocked`, row
  count, the first gate, and `No tab session persisted.` No tab session row,
  browser runner, browser automation, real browser tab, page open, fetch,
  history, source save, Workbench capture, external write, provider/model
  call, install, pull, or Raven path was added.
- 2026-05-17 2203 EDT: added blocked Workbench Browser tab/session storage
  contract. `workbenchBrowserSessionStorageContractModel` defines future tab
  storage fields, required gates, and blocked state without persistence.
  Workbench Browser now shows a Tab Storage readback below the tab rail. No
  storage table, tab persistence, history, cookies, credentials, page content
  cache, source row, Watch Shelf save, browser runner, page open, external
  write, provider/model call, install, pull, or Raven path was added.
- 2026-05-17 2158 EDT: added the blocked Workbench Browser runner route.
  `workbench.runBrowserActionBlocked` accepts a Browser proposal id and
  returns a blocked runner result using the existing manual Browser runner
  contract. Workbench Browser proposal details now expose `Check Runner` and
  show `Runner blocked for proposal #... No page opened.` No rows are written.
  No runner, browser automation, page open, fetch, history, source save,
  Workbench capture, external write, provider/model call, install, pull, or
  Raven path was added. `can_execute` remains false.
- 2026-05-17 2153 EDT: added the blocked Workbench Browser runner contract
  readback. `workbenchBrowserRunnerContractModel` defines manual allowance,
  blocked actions, target state, and required receipts without granting runner
  access. Workbench Browser readiness now shows contract blocked state,
  runner contract, manual allowance, and receipt gates. No runner, browser
  automation, page open, fetch, history, source save, Workbench capture,
  external write, provider/model call, install, pull, or Raven path was added.
  `can_execute` remains false.
- 2026-05-17 2147 EDT: compressed Workbench Browser proposal rows.
  Proposal rows now show id/action, target, status, result state, and one
  `Details` control. Stage Approval, Stage Body, Stage Spock, Read Gates, and
  Read Result live inside the selected detail panel. This hides machinery until
  requested and does not change backend contracts, approval state, evidence,
  security rows, source rows, runner behavior, or execution state.
  `can_execute` remains false.
- 2026-05-17 2143 EDT: added Workbench Browser result/recovery contract
  readback. `workbench.browserActionResultRecoveryContract` reads one Browser
  proposal and returns the required result receipt shape plus recovery note
  requirements without writing rows. Workbench Browser proposal rows now expose
  `Read Result` and show result state, blocked state, and recovery status. No
  approval decision, Workbench evidence row, security review row, source row,
  browser runner, page fetch, Watch Shelf save, external write,
  provider/model call, install, pull, or Raven path was added. `can_execute`
  remains false.
- 2026-05-17 2138 EDT: added Workbench Browser gate readiness.
  `workbench.browserActionProposalReadiness` reads one Browser proposal and
  reports runner contract, approval receipt, Spock gate, Workbench body,
  result receipt, and recovery note state without writing rows. Workbench
  Browser proposal rows now expose `Read Gates` and show ready/missing counts
  plus the next missing gate. No approval decision, Workbench evidence row,
  security review row, source row, browser runner, page fetch, Watch Shelf
  save, external write, provider/model call, install, pull, or Raven path was
  added. `can_execute` remains false.
- 2026-05-17 2133 EDT: added Workbench Browser Spock gate linkage.
  `workbench.createBrowserActionSpockGate` stages one local Spock security
  receipt for a durable Browser proposal and records one local permission
  preflight row. Workbench Browser recent proposals now expose `Stage Spock`
  and show `Spock receipt #... saved. Not run.` No approval decision,
  Workbench evidence row, source row, browser runner, page fetch, Watch Shelf
  save, external write, provider/model call, install, pull, or Raven path was
  added. `can_execute` remains false.
- 2026-05-17 2127 EDT: added Workbench Browser body linkage.
  `workbench.createBrowserActionWorkbenchBody` stages one local Workbench
  evidence body for a durable Browser proposal and records one local
  permission preflight row. Workbench Browser recent proposals now expose
  `Stage Body` and show `Workbench body #... saved. Not run.` No approval
  decision, source row, browser runner, page fetch, Watch Shelf save,
  Workbench capture from a live page, external write, provider/model call,
  install, pull, or Raven path was added. `can_execute` remains false.
- 2026-05-17 2119 EDT: added Approval Queue Browser filter/readback.
  `browser` is now a first-class approval origin. Browser approval previews
  classify as `browser`, no longer fall into `other`, and can be filtered and
  grouped in Approval Queue/List/Groups. Browser proposal approvals now show
  target labels from `browser_action_proposals`, and the Approval Queue UI has
  a `Browser` filter. No approval decision, browser runner, page fetch,
  source save, Workbench capture, external write, provider/model call, install,
  pull, or Raven path was added.
- 2026-05-17 1733 EDT: added Workbench Browser approval previews.
  `workbench.createBrowserActionApprovalPreview` stages one pending local
  approval preview for a durable Browser proposal and records one local
  permission preflight row. Re-staging returns the existing pending approval
  instead of duplicating it. Workbench Browser recent proposals now expose
  `Stage Approval` and show `Browser approval #... staged. Not run.` No
  Workbench evidence, source row, or execution output is written. No browser
  runner, browser automation, real browser tab, page open, page fetch, search
  request, history entry, bookmark, source save, Workbench capture, shelf save,
  project pin, explanation route, clipboard write, credential action,
  download, external write, provider/model call, install, pull, or Raven path
  was added.
- 2026-05-17 1727 EDT: added Workbench Browser proposal readback.
  `workbench.browserActionProposals` reads recent durable
  `browser_action_proposals` and the Workbench Browser shell now shows a
  compact `Recent Proposals` list with proposal id, action, target,
  `proposal blocked`, `not_run`, and local-only guard copy. The route test
  proves listing proposals does not write approvals, Workbench evidence,
  sources, or execution output. No browser runner, browser automation, real
  browser tab, page open, page fetch, search request, history entry, bookmark,
  source save, Workbench capture, shelf save, project pin, explanation route,
  clipboard write, credential action, download, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 1718 EDT: added durable local Browser action proposals.
  `browser_action_proposals` stores staged Browser action proposals locally,
  and Workbench Browser page actions now expose `Stage Proposal`. Staging
  writes one local proposal record and shows `Browser proposal #... saved. Not
  run.` The proposal remains `proposal_blocked`, `not_run`, and
  `can_execute = 0`. Route tests prove no approval, Workbench evidence, or
  source rows are written. No browser runner, browser automation, real browser
  tab, page open, page fetch, search request, history entry, bookmark, source
  save, Workbench capture, shelf save, project pin, explanation route,
  clipboard write, credential action, download, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 1712 EDT: added the first backend Browser action proposal
  contract. `browserActionProposalModel` and
  `workbench.browserActionProposalPreview` return a read-only
  `workbench_browser` contract with `PROPOSAL BLOCKED`, `NOT_RUN`, risk class,
  executor agent, target, required gates, and no-action receipt text. The route
  test proves no approval, Workbench evidence, or source rows are written. No
  browser runner, browser automation, real browser tab, page open, page fetch,
  search request, history entry, bookmark, persisted tab state, source save,
  Workbench capture, shelf save, project pin, explanation route, clipboard
  write, credential action, download, external write, provider/model call,
  install, pull, or Raven path was added.
- 2026-05-17 1706 EDT: added Browser runner-readiness readback inside
  Workbench. The Browser shell now shows `Runner Readiness`, `runner blocked`,
  page state, and required gates: `Runner contract`, `Approval receipt`,
  `Spock gate`, and `Workbench body`. `canOpen` and `canRunAutomation` remain
  false. No browser runner, browser automation, real browser tab, page open,
  page fetch, search request, history entry, bookmark, persisted tab state,
  source save, Workbench capture, shelf save, project pin, explanation route,
  clipboard write, credential action, download, external write,
  provider/model call, install, pull, or Raven path was added.
- 2026-05-17 1702 EDT: added blocked Browser page-action previews inside
  Workbench. The three-dot action menu now supports local action selection and
  shows label, target draft, `no page` or `blocked` status, route requirement,
  and no-action receipt text. No browser runner, browser automation, real
  browser tab, page fetch, search request, history entry, bookmark, persisted
  tab state, source save, Workbench capture, shelf save, project pin,
  explanation route, clipboard write, credential action, download, external
  write, provider/model call, install, pull, or Raven path was added.
- 2026-05-17 1657 EDT: added Browser tab-state readback inside Workbench.
  The tab rail now reads from `workbenchBrowserTabStateModel`: `Tab 1` is the
  only active local page frame, `New Tab` remains planned/blocked, and Browser
  drafts appear as staged draft tabs without opening pages. No browser runner,
  browser automation, real browser tab, page fetch, search request, history
  entry, bookmark, persisted tab state, source save, Workbench capture,
  credential action, download, external write, provider/model call, install,
  pull, or Raven path was added.
- 2026-05-17 1654 EDT: added Watch Shelf draft readback inside Workbench.
  The drawer now has local category selection and shows Browser draft state as
  `Page draft`, `Search draft`, or `No open page`. Save remains disabled with
  `Save after page opens` for drafts. No browser automation, page fetch, search
  request, persisted shelf item, service login, resume automation, media
  progress, source save, Workbench capture, credential action, download,
  external write, provider/model call, install, pull, or Raven path was added.
- 2026-05-17 1649 EDT: added local Browser address/search draft state inside
  Workbench. Typed URL-like drafts show `Page Draft`; search-like drafts show
  `Search Draft`; both show staged target, kind, `open blocked`, and no-action
  receipt text. The `Stage` control remains disabled until browser runner and
  approval contracts exist. No browser automation, page fetch, search request,
  service state, source save, Workbench capture, credential action, download,
  external write, provider/model call, install, pull, or Raven path was added.
- 2026-05-17 1639 EDT: added the first Browser V1 shell inside Workbench,
  not as a new primary surface. The shell follows
  `CEREBRO_DAILY_OS_BROWSER_CONTRACT.md`: generic page tabs, one URL/search
  field, quiet shield, Watch Shelf drawer, three-dot page actions, first-run
  empty state, no fake service tabs, no profile picker, no Search tab, no
  Manual Browser button, and no browser automation. Added
  `workbenchBrowserShellModel` / `workbenchWatchShelfModel` plus regression
  coverage to hold that shape.
- 2026-05-17 1634 EDT: added selected-capability approval readback to Basement
  Model Registry. `modelTools.capabilityApprovalPreviews` reads local
  approval preview rows for one model/tool capability without running
  providers, local models, browser fetches, installs, pulls, route defaults,
  file writes, memory writes, or external writes. Basement detail now shows
  `Approval Readback`, pending count, approval id, cost/risk label, and
  no-action proof for the selected capability.
- 2026-05-17 1428 EDT: added Approval Queue readback polish for model/tool
  approvals. Approvals now recognize `model_tools` as a first-class origin,
  the queue has a `Models` filter, model/tool approval rows show provider/tool
  labels from `model_tool_capabilities`, search includes provider/tool names,
  and Oak/Spock notes call out model/tool risk without running or approving any
  capability.
- 2026-05-17 1414 EDT: added local model/tool route approval previews.
  `modelTools.createCapabilityRouteApprovalPreview` stages a pending local
  approval plus permission preflight for a selected capability without running
  providers, local models, browser fetches, installs, pulls, route defaults,
  file writes, memory writes, or external writes. Basement selected capability
  details now expose `Stage Route Approval` and `Open Approval Queue`.
- 2026-05-17 1407 EDT: added Basement Model/Tool call receipt readback.
  `modelTools.callLogAudit` and `modelTools.callLogs` read local
  `model_tool_call_logs` rows without running providers, local models, browser
  fetches, installs, pulls, route defaults, file writes, memory writes, or
  external writes. The Basement Model Registry now shows compact `Call
  Receipts` counts and recent receipt summaries.
- 2026-05-17 1356 EDT: added source validation readback to the Research audit.
  `sourceResearchLoopAudit` now counts `source_validation` events and the
  Research panel shows a compact `Validated` datum. This keeps Oak/Spock local
  source checks visible without browsing, retrieval, memory writes, or external
  tools.
- 2026-05-17 1346 EDT: added local Source validation in Research. Saved
  sources can now be marked `Trusted`, `Review`, or `Reject` from the existing
  `Source Rules` drawer. The backend writes only local source trust notes and
  `source_validation` events, returning a receipt that states no browser,
  search, fetch, model, memory, Obsidian, Notion, Drive, retrieval, or external
  tool ran. This advances Research/Sources validation without source
  automation.
- 2026-05-17 1333 EDT: locked the approved Browser V1 source-truth shape into
  `CEREBRO_DAILY_OS_BROWSER_CONTRACT.md`. Browser first pass now requires an
  honest buildable shell: generic real page tabs only, one URL/search field,
  Watch Shelf as a toolbar drawer, page actions in the three-dot menu, Aang
  beside the bottom Ask bar, quiet shield safety, no visible profile picker, no
  Search tab, no Manual Browser button, no right Aang rail, no fake services,
  no fake streaming progress, and no Spock popover until that interaction is
  implemented.
- 2026-05-17 1142 EDT: added `CEREBRO_DAILY_OS_BROWSER_CONTRACT.md` and
  wired it into the master build path. CereBro now explicitly treats manual
  browser, tabs, history, bookmarks, project pins, trusted site profiles,
  Watch/resume, source capture, Workbench attach, Send to Aang, and Aang
  correction/preference memory as V1 Daily OS requirements. Zero is now tracked
  as a Tony explicit-effects reference, not a dependency. No browser
  automation, installs, model downloads, new primary surface, or Raven path was
  added.
- 2026-05-17 1003 EDT: Ledger overview now includes a read-only
  `executionReceiptLoopAudit` and a compact `Execution Receipt Loop` section.
  It counts execution proposals, Terminal sources, approval/body/task links,
  approved receipts, read-only and blocked-risk contracts, result links,
  completed results, and validation notes while reporting
  `canExecuteFromAudit: false`. Regression coverage proves the approved
  read-only command loop is readable without granting execution.
- 2026-05-17 0958 EDT: Approval detail now reads execution proposals and
  latest execution results linked to the selected approval receipt. The
  existing Approvals receipt chain shows proposal/result chips and read-only
  `Open Terminal` / `Open Body` routes. Regression coverage proves approval
  detail returns the linked proposal, Workbench body id, result id, status, and
  exit code after an approved read-only local command.
- 2026-05-17 0953 EDT: Workbench execution-linked receipt bodies now show
  quick Spock validation controls inside `Append Validation Receipt`.
  `Mark Looks Consistent` and `Mark Blocked` prepare local append-only
  validation notes without rerunning, approving, or changing the original
  execution result. Regression coverage proves validation notes append to the
  execution-linked body and read back in validation history.
- 2026-05-17 0947 EDT: Terminal Lab observations now support a focused
  observation id and pin it above the current page when needed. Ledger-to-
  Terminal result focus now shows the linked command observation row, teaching
  frame, Workbench body, and recent result receipts together. Regression
  coverage proves focused observation pinning.
- 2026-05-17 0944 EDT: Ledger execution result cards now include
  `Open Terminal`. Ledger result reads preserve proposal source type/id, and
  Terminal Lab reads a one-time focus notice with command text and linked
  command observation id. Regression coverage proves the source id readback.
- 2026-05-17 0940 EDT: Workbench receipt filters now include an
  `Execution Linked` toggle. The receipt list and receipt groups can narrow to
  local receipt bodies linked to execution results. Regression coverage proves
  the filtered read returns linked rows only.
- 2026-05-17 0936 EDT: Workbench recent receipt rows now show execution
  result badges for terminal receipt bodies linked to execution results.
  The Workbench list read returns latest execution result id, status, and exit
  code. Regression coverage proves the read shape after an approved read-only
  run.
- 2026-05-17 0933 EDT: Terminal Lab recent result receipts now show the
  linked Workbench body id and include an `Open Body` action. The execution
  result read now returns Workbench evidence id and source proposal metadata.
  Regression coverage proves the linked body id/source read shape.
- 2026-05-17 0929 EDT: Workbench receipt detail now reads linked execution
  results for receipt bodies used by action proposals. The existing detail
  panel shows result id, status, exit code, risk class, command, executor,
  approval id, recovery note, and no-rerun copy. Regression coverage proves
  the Workbench detail read after an approved read-only run.
- 2026-05-17 0925 EDT: added Terminal Lab runner boundary readback to the
  existing execution contract cards. Ready read-only actions state the local
  allowlisted shell-disabled boundary. Blocked actions state the gate remains
  closed until contract, risk, and allowlist checks pass. Model tests now cover
  both states.
- 2026-05-17 0921 EDT: extracted Terminal Lab execution contract button and
  readiness logic into `terminalExecutionActionModel`. Added tests for ready
  approved read-only, blocked missing pieces, and complete but non-runnable
  git-write/mutating contracts. This locks the UI model without adding seed
  endpoints or broadening the runner.
- 2026-05-17 0917 EDT: Terminal Lab execution contract cards now show direct
  missing-piece actions. Blocked contracts can stage missing approval previews
  or Workbench bodies; linked contracts can open existing approval/body
  receipts. The run gate remains separate.
- 2026-05-17 0913 EDT: added approval receipt focus to Ledger execution
  result cards. Existing result cards now show approval ids and can open the
  linked approval in the Approvals panel with a focus notice. Approval detail
  can load the focused id directly, even if the current queue filter does not
  already include it.
- 2026-05-17 0908 EDT: surfaced execution recovery notes in Terminal Lab
  recent execution receipts and Ledger execution result cards. Regression
  coverage now proves execution result reads and Ledger audit rows preserve the
  recovery note. No runner broadening.
- 2026-05-17 0904 EDT: fixed Workbench staged focus readback. Ledger-to-
  Workbench jumps now show the exact `Focus Ledger opened Workbench body...`
  notice near the receipt chain, and the receipt creation panel repeats the
  exact staged notice instead of generic draft copy.
- 2026-05-17 0900 EDT: added an `Open Body` action to existing Ledger
  execution result cards. Linked execution results can now open Workbench with
  the terminal-output receipt body selected. Ledger stays read-only and
  Workbench remains the receipt body surface.
- 2026-05-17 0857 EDT: strengthened Ledger execution result rows by joining
  result receipts back to their action proposals. Ledger now exposes and shows
  action type, risk class, project, task, and Workbench receipt body id on the
  existing execution result cards. This keeps the Terminal Lab -> Workbench ->
  Ledger loop inspectable without broadening the read-only runner.
- 2026-05-17 0851 EDT: added compact `Recent Results` readback to Terminal
  Lab's existing Execution Contract section. It reads local execution result
  receipts with result id, exit code, timeout/status, command, and redacted
  output summary. This keeps the Terminal Lab -> Ledger loop visible without
  creating a new surface or broadening the runner.
- 2026-05-17 0849 EDT: corrected Terminal Lab execution contract copy after
  the read-only runner landed. Ready read-only contracts now show
  `Run Approved Read`; blocked, mutating, external, destructive, and git-write
  proposals stay on `Read Run Gate`. Successful read-only runs surface result
  id, exit code, and redacted output summary in the existing Terminal Lab
  status area. No new surface, git-write runner, install, destructive command,
  browser automation, provider call, external write, paid service, or Raven
  path was added.
- 2026-05-17 0453 EDT: continued item 9 Model and Tool Registry hardening.
  Surfaced `modelTools.registryAudit` inside the existing Basement Model
  Registry panel. Added a compact Registry Audit proof section with register,
  owner, record/eval counts, trust/source counts, blocked action proof, lane
  counts, and no-action text. Capability, eval, and status mutations now
  invalidate the audit read. Browser proof used an isolated temp DB and
  headless Playwright, saving
  `output/playwright/model-registry-audit-basement.png`. No new dashboard,
  route default change, executor, provider/model call, browser/fetch action,
  install, pull, dependency, external write, or Raven path was added.
- 2026-05-17 0445 EDT: continued item 9 Model and Tool Registry hardening.
  Added `modelTools.registryAudit`, a read-only backend contract that reports
  capability count, eval note count, trust distribution, source readiness, lane
  counts, gates, and no-action proof. The audit reports no external/local model
  calls, no installs, no pulls, no browser/fetch, no external writes, and no
  route default changes. Test coverage proves the read does not mutate
  capability records, eval notes, approvals, or preflights. No provider, model,
  gateway, browser, install, pull, local inference, UI surface, dependency, or
  Raven path was added.
- 2026-05-17 0441 EDT: finished item 8 by surfacing
  `runtime.routeReceiptAudit` inside the existing Ledger route card. Saved
  routes now have a `Read Audit` control that renders Task, Body, Gate,
  Executor, and Execute proof on demand. Browser proof used an isolated temp
  DB, created one throwaway route through the app, clicked `Read Audit`, and
  saved `output/playwright/ledger-route-receipt-audit-read.png`. No route
  executor, command runner, browser action, model/provider call, git action,
  external write, new primary surface, dependency, or Raven path was added.
- 2026-05-17 0436 EDT: continued item 8 backend route receipts before agent
  execution. Added `runtime.routeReceiptAudit`, a read-only single-route audit
  query that returns the saved route, task link, Workbench body link, approval
  link, execution readiness, proof booleans, gate text, no-action proof,
  executor `not_built`, and `canExecute: false`. Test coverage proves the read
  does not mutate local records. No route executor, command runner, browser
  action, model/provider call, git action, route save, task creation, external
  write, new UI surface, dependency, or Raven path was added.
- 2026-05-17 0431 EDT: continued item 8 backend route receipts before agent
  execution. Added `routeReceiptContractProofModel` so Ledger route contract
  fields use the same typed proof-model pattern as route execution readiness.
  Kept Execute as `blocked`. Also carried the Runtime approval origin lane:
  route-record approvals now filter under Runtime and resolve route labels in
  queue/detail/list/group reads. Browser proof saved
  `output/playwright/ledger-route-contract-proof-model.png` and
  `output/playwright/approvals-runtime-origin-filter.png`. No route executor,
  command runner, browser action, model/provider call, git action, route save,
  task creation, external write, new surface, dependency, or Raven path was
  added.
- 2026-05-17 0429 EDT: continued item 8 backend route receipts before agent
  execution. Added `runtime` as an Approval Queue origin for approvals created
  from runtime route records. Runtime route approval labels now resolve to
  `runtime_route:<id>` so the UI shows `Route #<id>`, and queue/detail/list/
  group reads join runtime route records for search and labels. Approval
  Dashboard now has a Runtime filter. No route executor, command runner,
  browser action, model/provider call, git action, route save, task creation,
  external write, new surface, dependency, or Raven path was added.
- 2026-05-17 0023 EDT: continued item 8 backend route receipts before agent
  execution. Added a read-only Ledger route receipt contract and surfaced it
  in Ledger Overview with route count, task links, Workbench body links, gate
  count, future-review-only count, and Execute blocked. Contract reports
  Workbench as body surface, Ledger as audit surface, executor `not_built`, and
  `canExecute: false`. No route executor, command runner, browser action,
  model/provider call, git action, route save, task creation, external write,
  new surface, dependency, or Raven path was added. Browser proof used an
  isolated server on port 3317 because the existing 3000 server had a locked
  SQLite DB, and saved `output/playwright/ledger-route-receipt-contract.png`.
- 2026-05-17 0019 EDT: continued item 8 backend route receipts before agent
  execution. Added `routeExecutionReadinessProofModel` and showed Ledger route
  readiness, task, body, gate, and execution state through shared
  `CompactReadDatum`. Execution reads only as `blocked` or `future review
  only`; route logic still returns `canExecute: false`. No route executor,
  command runner, browser action, model/provider call, git action, external
  write, new surface, dependency, or Raven path was added. Browser proof opened
  Ledger Overview and saved
  `output/playwright/ledger-route-readiness-proof-compact-read.png`.
- 2026-05-17 0016 EDT: moved to item 8 backend route receipts, read-only
  visible proof first. Ledger selected body audit read and Runtime route
  preview primary proof now use shared `CompactReadDatum`; the local
  `PreviewField` helper was removed. Runtime route logic is unchanged. No
  route executor, command runner, browser action, model/provider call, git
  action, external write, new surface, dependency, or Raven path was added.
  Browser proof opened Ledger Overview, captured
  `output/playwright/ledger-selected-body-audit-compact-read.png`, previewed
  `keep building CereBro front end` without saving a route or creating a task,
  and captured `output/playwright/runtime-route-proof-compact-read.png`.
- 2026-05-17 0013 EDT: continued item 7 Knowledge/source contract cleanup.
  Piccolo `Automation Hygiene` now uses shared `CompactReadDatum` for storage
  status, contract counts, Obsidian lanes, and Project Bridge/Source examples.
  The cleanup report hard gate and approval wording remain unchanged. No note
  scan, vector index, source fetch, Obsidian/Notion/Drive/memory write,
  model/provider/tool call, route default change, new surface, cleanup action
  runner, dependency, or Raven path was added. Browser proof opened Basement >
  Automation, expanded `Cleanup Rules And Storage Contract`, and saved
  `output/playwright/piccolo-storage-contract-compact-read.png`.
- 2026-05-17 0009 EDT: continued item 7 Knowledge/source contract cleanup.
  Project Lab `Knowledge Route` now uses shared `CompactReadDatum`, shows the
  source index path, and keeps the explicit write gate visible. No note scan,
  vector index, source fetch, Obsidian/Notion/Drive/memory write,
  model/provider/tool call, route default change, new surface, command runner,
  dependency, or Raven path was added. Browser proof opened Workshop > Project
  Lab, inspected CereBro, and saved
  `output/playwright/project-lab-knowledge-route-compact.png`.
- 2026-05-17 0007 EDT: continued item 7 Knowledge/source contract cleanup.
  Research `Source Route` now uses shared `CompactReadDatum` for source notes,
  GitHub repository source, Project Map, GitHub sources index, archive lane,
  and write status. Browser Ladder and Policy remain rail lines. No note scan,
  vector index, source fetch, Obsidian/Notion/Drive/memory write,
  model/provider/tool call, route default change, new surface, command runner,
  dependency, or Raven path was added. Browser proof opened Workshop > Research
  and saved `output/playwright/source-route-compact-read.png`.
- 2026-05-17 0004 EDT: continued item 7 Knowledge/source contract cleanup.
  Research `Source Receipt` stat cards now use shared `CompactReadDatum`, and
  the local `ReceiptStat` helper was removed. Same source counts, route state,
  retrieval state, and next action remain visible. No note scan, vector index,
  source fetch, Obsidian/Notion/Drive/memory write, model/provider/tool call,
  route default change, new surface, command runner, dependency, or Raven path
  was added. Browser proof opened Workshop > Research and saved
  `output/playwright/source-receipt-compact-read.png`.
- 2026-05-17 0002 EDT: continued item 7 Knowledge/source contract cleanup.
  Added shared `CompactReadDatum` frontend primitive and replaced duplicate
  compact datum components in Knowledge Notes, Ledger, and Workbench. Same
  data, routes, gates, and proof remain visible. No note scan, vector index,
  source fetch, Obsidian/Notion/Drive/memory write, model/provider/tool call,
  route default change, new surface, command runner, dependency, or Raven path
  was added.
- 2026-05-16 2358 EDT: continued item 7 Knowledge/source contracts through
  Ledger. `ledger.overview` now returns the shared read-only Memory reuse
  contract, and Ledger shows a compact Memory Reuse Read with route, archive,
  review counts, validation gate, next action, and no-automation proof. No note
  scan, vector index, source fetch, Obsidian/Notion/Drive/memory write,
  model/provider/tool call, route default change, new surface, command runner,
  dependency, or Raven path was added.
- 2026-05-16 2353 EDT: continued item 7 Knowledge/source contracts through
  Memory. Added a read-only `memory.contract` endpoint and a compact Knowledge
  Notes `Reuse Contract` strip with normal route, archive route, proposal
  review counts, validation gate, and no-retrieval-automation status. Ledger
  Overview now reads the same contract as a compact audit block. No note scan,
  vector index, source fetch, Obsidian/Notion/Drive/memory write,
  model/provider/tool call, route default change, new surface, command runner,
  dependency, or Raven path was added. Browser proof opened Ledger > Memory and
  Ledger Overview, saving local screenshots at
  `output/playwright/memory-reuse-contract.png` and
  `output/playwright/ledger-memory-reuse-read.png`.
- 2026-05-16 2349 EDT: continued item 7 Knowledge/source contracts through
  Workbench. Evidence detail now shows a fuller Knowledge Route Read with
  bridge note, repository source note, Project Map, GitHub sources index,
  archive lane/retrieval, write gate, and no-action proof. No note scan, vector
  index, source fetch, Obsidian/Notion/Drive/memory write, model/provider/tool
  call, route default change, new surface, command runner, dependency, or Raven
  path was added. Browser proof selected receipt `#1527` and saved the local
  screenshot at `output/playwright/workbench-knowledge-route-polish.png`.
- 2026-05-16 2341 EDT: continued item 7 Knowledge/source contracts. Surfer
  approved public URL ingest now returns a visible `sourceSaveReceipt` with
  source id, artifact id, source-event id, fetch status, no-browser/no-search,
  local-write/external-write, route-default, and retrieval status. Research
  shows that receipt after save. No source automation, note scan, vector index,
  Obsidian/Notion/Drive/memory write, model call, route default change, schema
  migration, new surface, command runner, dependency, or Raven path was added.
- 2026-05-16 2338 EDT: continued item 7 Knowledge/source contracts. Project
  Lab Project Read now shows the project's Knowledge Route: bridge note,
  repository source note, Project Map, archive retrieval, no external write,
  and the explicit write gate. No note scan, vector index, source fetch,
  Obsidian/Notion/Drive/memory write, route default change, schema migration,
  new surface, command runner, dependency, or Raven path was added.
- 2026-05-16 2334 EDT: continued item 7 Knowledge/source contracts. Research
  now shows a compact local Source Receipt with source totals, trusted count,
  review count, scrub count, stale count, source-event count, route unchanged,
  and retrieval off. `surfer.panel` computes that read from local SQLite only.
  No browser/search/fetch/parser/model/vector index, Obsidian/Notion/Drive/
  memory write, route default change, schema migration, new surface, command
  runner, dependency, or Raven path was added.
- 2026-05-16 2327 EDT: returned to item 7 Knowledge contracts before knowledge
  automation. `integrations.status` now exposes a read-only
  `knowledgeReadiness` summary with vault route count, Obsidian lane count,
  required RAG metadata field count, included retrieval lane keys, and
  archive-only lane count. Basement Configuration shows the compact Knowledge
  Contract read below Machine Status. No note scan, vector index, source fetch,
  vault write, provider/model/tool call, route default change, install,
  token/account action, schema migration, new surface, command runner,
  dependency, or Raven path was added.
- 2026-05-16 2322 EDT: returned to item 8 backend route receipts. Runtime
  route previews now read local Model/Tool Registry evidence for the proposed
  model lane and carry that read into saved route receipt drafts. The existing
  Runtime Route Receipt surface shows compact registry row/trusted counts and
  unchanged route defaults in route details. No provider/model/tool/gateway
  call, route default change, install, browser/search/fetch, token/account
  action, Ollama status command, schema migration, new surface, external write,
  command runner, dependency, or Raven path was added.
- 2026-05-16 2001 EDT: continued item 9 in Basement Model Tools. Added a
  compact local status-decision readback to policy and route preview. The
  Models tab now shows source-ready, eval-ready, mixed, failed, stale, and
  unchanged route-default status as registry-only evidence. No provider/model/
  tool call, route default change, install, browser/search/fetch, token/account
  action, Ollama status command, schema migration, new surface, external write,
  command runner, dependency, or Raven path was added.
- 2026-05-16 1951 EDT: continued item 9 in Basement Model Tools. Added an
  explicit local Status Decision action for capability proposals. The action
  can set source-verified, tested-pass, tested-mixed, tested-fail, or stale
  status with required validation notes. The selected proposal detail now has
  a Status Decision drawer. No pass eval is auto-promoted, no route default
  changes, and no provider/model/tool call, install, browser/search/fetch,
  token/account action, Ollama status command, schema migration, new surface,
  external write, command runner, dependency, or Raven path was added.
- 2026-05-16 1943 EDT: continued item 9 in Basement Model Tools. Capability
  reads now include latest local eval evidence from `model_tool_evals`, and
  source readiness can show `eval recorded` or `eval blocked` without changing
  the proposal's trusted `eval_status`. The Models tab now shows eval evidence
  on the row, decision path, and selected detail. No provider/model/tool call,
  route default change, install, browser/search/fetch, token/account action,
  Ollama status command, schema migration, new surface, external write,
  command runner, dependency, or Raven path was added.
- 2026-05-16 1931 EDT: tightened item 9 in Basement Model Tools proposal
  creation. Local capability proposals now store a source check date, risk
  review, and validation notes from the existing Propose drawer. Source
  readiness now removes those required fields when present while still holding
  the proposal at source review until Oak/Spock verification or eval exists.
  No provider/model/tool/gateway/browser/search/fetch call, install, token,
  account action, Ollama status command, schema migration, new surface,
  external write, command runner, dependency, or Raven path was added.
- 2026-05-16 1637 EDT: tightened item 9 in Basement Model Tools. Route
  previews now expose a Source → Eval → Approval decision path, and the Models
  tab shows the same path for the selected capability and local route preview.
  No browser/search/fetch, provider/model/gateway call, install, token/account
  action, Ollama status command, schema migration, new primary surface,
  external write, command runner, dependency, or Raven path was added.
- 2026-05-16 1632 EDT: continued item 9 in Basement Model Tools. Capability
  records now compute local source readiness, policy exposes a read-only
  Source Verification Gate, and the Models tab shows readiness counts, no-action
  proof, registry badges, and selected next steps. No browser/search/fetch,
  provider/model/gateway call, install, token/account action, Ollama status
  command, schema migration, new surface, external write, or Raven path was
  added.
- 2026-05-16 1538 EDT: surfaced item 8 readiness in the existing Ledger route
  read. Runtime and Ledger now share the same `executionReadiness` helper, and
  Ledger route cards show one compact `Readiness: ...` plus `No execution`
  strip. No new surface, executor, command runner, browser action, model call,
  approval bypass, external write, Raven path, GitHub clone, or RAG automation
  was added.
- 2026-05-16 1532 EDT: started item 8 backend route receipts before agent
  execution. Runtime route previews and saved route reads now expose computed
  `executionReadiness` with required local records and no-action proof.
  `canExecute` stays false. No executor, agent loop, command runner, browser
  action, model call, approval bypass, new UI surface, external write, or Raven
  path was added.
- 2026-05-16 1525 EDT: finished the next Block C contract slice. Knowledge
  contracts now define Obsidian RAG-ready note metadata values, route defaults,
  required fields, readiness rules, and helpers. `integrations.status` exposes
  the contract for future backend and worker use. Kept the full metadata
  contract out of Settings after read-only worker review. No note scanning,
  frontmatter generation, RAG automation, folder creation, external write, or
  Raven path was added.
- 2026-05-16 1519 EDT: continued Block C storage/source visibility in
  Basement Settings. Machine Status now shows compact Vault and Obsidian
  readiness from `integrations.status`. Read-only worker placement review moved
  the status out of Research to keep machinery below the Keep. No folder
  creation, RAG automation, browser crawling, external write, Obsidian write,
  Drive write, Notion write, memory write, model install, or Raven path was
  added.
- 2026-05-16 1502 EDT: started the Block C knowledge/source route lane in
  Research. Surfer panel now shows a read-only Source Route with source note
  lane, GitHub source path, Project Map path, archive-only retrieval, and a
  Write Gate. No browsing, RAG, Obsidian write, Notion write, Drive write, or
  memory write was added.
- 2026-05-16 0902 EDT: cleaned Home shell copy around Workshop, Project Lab,
  and Terminal Lab. Workshop now says `Do the work with bodies and reads`,
  Terminal Lab is `Command teaching`, the shell marker row is `surface markers`,
  and context next actions now say push decisions/bodies instead of push
  readiness/receipts.
- 2026-05-16 0857 EDT: cleaned Terminal Lab body-path labels. The Project
  Read rail now says `Bodies`, the drawer says `Body Read` / `Workbench
  Bodies`, and the Aang-to-Workbench strip is now a body path instead of a
  receipt chain.
- 2026-05-16 0850 EDT: finished Project Lab visible context leak cleanup. Top
  stats now say `Bodies`, project card body rows stay `Body`, and push decision
  buttons no longer expose `push readiness receipt` accessibility labels.
- 2026-05-16 0846 EDT: cleaned Project Lab context-path labels. Project cards
  now show `Bodies`, Project Map reads show `Body`, the context bridge uses
  Terminal read / Workbench body / Project context language, and push decisions
  now say body missing/present instead of receipt missing/present.
- 2026-05-16 0840 EDT: cleaned Ledger overview object labels. Overview cards
  now use `saved outputs`, `saved route reads`, `Workbench`, and `Latest
  Workbench Bodies`; selected reads now say body/audit path instead of
  receipt-object wording.
- 2026-05-16 0835 EDT: cleaned Approvals waiting-gate copy. The panel now
  opens as `Waiting Gates`, uses local gate/check language, shows `Review Path`
  for the selected decision, and removes primary-surface preflight/policy/
  receipt-chain wording while keeping Security Gate routing intact.
- 2026-05-16 0829 EDT: cleaned Outputs saved-output copy. The panel now says
  details keep destination and retention visible, vault writes report `Saved
  vault output`, fallback rows say `Output #`, and details read `Destination`
  and `Retention` instead of storage/proof-shaped wording.
- 2026-05-16 0708 EDT: started Workbench receipt-body clarity. Header now says
  `Save the receipt body for what just happened.`, the first card says
  `Current Body`, the receipt chain says `Aang teaches` / `Workbench body`,
  and the project drawer says `Project Receipts` instead of `Project Proof`.
- 2026-05-16 0704 EDT: cleaned Terminal Lab observation actions. The closed
  drawer now says `Observation Next Steps`; groups now read `Status`,
  `Approval`, `Connect`, and `Teach + Receipt`; buttons use plain next-action
  labels such as `Approval Read`, `Link Selected`, `Aang Teach`, and `Receipt
  Body`.
- 2026-05-16 0701 EDT: made Terminal Lab's receipt chain Aang-first. The
  strip now says `Aang teaches`, its region is `Aang to Workbench receipt
  chain`, and the helper line says `Teaching path` instead of `Proof path`.
- 2026-05-16 0654 EDT: cleaned Terminal Lab's project read and command
  teaching copy. Header now says `read only lane`, `Aang reads`, `Tony
  drafts`, and `Spock gates`; the project rail now says `Action` / `read only`
  and `Action Boundary` instead of execution-shaped labels.
- 2026-05-16 0648 EDT: simplified Project Lab push decision wording. Project
  cards now say `Push Decision`, details say `Decision Details`, and visible
  manual command blocks say `Manual Commands` with `review first`.
- 2026-05-16 0645 EDT: started Project Lab low-machinery cleanup. The local
  guide drawer now reads `Project Map`, receipt text stays plain, and push
  decision notes point to Project Map instead of Project Rules.
- 2026-05-16 0636 EDT: cleaned selected Workbench receipt detail copy. The
  detail read now says `Receipt Read`, `local only`, `Security Check`, and
  `Read Gates` instead of proof/preflight language.
- 2026-05-16 0633 EDT: cleaned Workbench receipt grouping copy. Group drawer
  now says `Receipt Groups` and `Narrow the local list.`, removes duplicated
  heading/proof wording, and keeps the local-only gate visible inside the
  drawer.
- 2026-05-16 0628 EDT: hardened the Raven sealed boundary after applying the
  anti-drift law. Raven no longer appears as a normal command-intake agent;
  the exact local sealed launcher is isolated in a small model. Also fixed the
  short-keyword classifier so `building` no longer matches the `ui` design
  keyword.
- 2026-05-16 0613 EDT: updated the anti-drift law with the creativity rule:
  creativity is allowed inside the lane; freestyling outside the lane stops for
  approval.
- 2026-05-16 0608 EDT: added the canonical
  `CEREBRO_ANTI_DRIFT_LAW.md`, mirrored it into Obsidian retrieval, and wired
  AGENTS plus this queue to treat major drift as a stop condition.
- 2026-05-16 0605 EDT: Workbench receipt form copy now names the primary
  object `Receipt Body`. The staged draft state now reads `Body draft. Review
  it, then save the local receipt.` instead of exposing draft machinery.
- 2026-05-16 0601 EDT: route preview proof now stays behind a closed
  `Route proof` detail. The primary preview read keeps Aang, Owner, Receipt,
  and Next visible while model/tool/gate proof remains available on request.
- 2026-05-16 0556 EDT: runtime route preview now uses the same compact safe
  destination rail as saved route rows. Save Route remains the local route
  record action; Project, Body, Gate, and Task sit below it as no-execution
  destinations.
- 2026-05-16 0552 EDT: Ledger saved route rows now use a compact safe-action
  rail. The row groups Project, Body, Gate, and Task as separate read/save
  destinations, marks saved and pending state, and keeps `no execution`
  visible.
- 2026-05-16 0546 EDT: saved route reads now expose a Project Lab focus
  draft derived from route record project columns. Ledger saved route rows now
  have a Project action beside task/body/gate actions, so saved routes can open
  the project map without saving or running work.
- 2026-05-16 0539 EDT: `runtime.previewRoute` now includes a Project Lab
  focus draft. Ask Aang route previews expose a compact Project action beside
  Workbench and Ledger, and Project Lab can resolve preview focus by project
  id, name, or local path.
- 2026-05-16 0516 EDT: `runtime.previewRoute` Workbench drafts now carry a
  formal `projectFocus` object with CereBro name/path proof. The route preview
  Workbench action forwards that object, and Workbench resolves it after
  project options load so the receipt chain shows `Project Lab reads CereBro`
  before any receipt is saved.
- 2026-05-16 0358 EDT: `runtime.previewRoute` Ledger focus drafts now carry
  project name as well as slug. Ledger accepts project-name focus for
  preview-only routes, so Ask Aang route preview can open CereBro-scoped Ledger
  receipts before any route record is saved.
- 2026-05-16 0320 EDT: Workbench validation chips and receipt body reads now
  use the same validation tones as Ledger and Terminal Lab: blocked is risk,
  needs review is warning, checked states are success, and unknown/unvalidated
  stays muted.
- 2026-05-16 0318 EDT: Workbench now forwards receipt project id/name into
  Ledger and Project Lab focus drafts. Ledger opens exact receipts while also
  keeping the project-scoped receipt read.
- 2026-05-16 0259 EDT: Ledger now honors project-level focus drafts from
  Terminal Lab. Focused reads scope the Workbench receipt preview list to the
  matched project and expose a visible Clear Focus control.
- 2026-05-16 0241 EDT: Terminal Lab Workbench and Ledger buttons now carry
  the matched project/audit context forward. Workbench consumes project focus
  drafts so Terminal Lab opens CereBro receipts directly instead of a generic
  receipt list.
- 2026-05-16 0213 EDT: Terminal Lab Project button now carries the matched
  project context into Project Lab. Browser proof confirmed the CereBro project
  read opens from Terminal Lab with the notice and Git inspector focused.
- 2026-05-16 0102 EDT: Workbench receipt chain strip now shows
  `Route reads` / `Route #<id>` for route-linked receipts instead of saying
  there is no command link.
- 2026-05-16 0032 EDT: route targets now display as `Route #<id>` through the
  shared display-label helper while keeping raw `runtime_route:<id>` proof in
  titles.
- 2026-05-16 0023 EDT: added saved route read counts to Project Intelligence
  and surfaced them as a compact `Routes` line on Project Lab cards.
- 2026-05-16 0020 EDT: linked manual Workbench saves with
  `targetUri: runtime_route:<id>` back to the route project and task on the
  server. Immediate Workbench save responses now return the joined display
  fields used by read models.
- 2026-05-16 0015 EDT: hardened route child creation so duplicate approval
  preview and Workbench receipt calls return one child row instead of creating
  duplicate route children.
- 2026-05-16 0012 EDT: kept route-linked approvals visible after approval
  decisions. Ledger route cards now distinguish pending, approved, and closed
  gate records.
- 2026-05-16 0009 EDT: preserved runtime route targets in Workbench drafts
  staged from saved Ledger routes. Stage Body now carries `runtime_route:<id>`
  instead of a project path.
- 2026-05-15 2352 EDT: repaired runtime route task linkage so existing
  route-linked approval previews and Workbench receipts receive the created
  task id when task creation happens after them.
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
- Workbench Add Receipt now says `Receipt Details` and `Temporary Preview`
  instead of metadata/media language. Assigned agent, review type, viewport,
  marked area, target, note, sensitive flag, and temporary-file gates remain in
  the same drawers.
- Temporary Workbench preview now says `Local browser preview. No upload. No
  vault save. No vision model.` and `Choose File`, keeping the no-durable-media
  boundary visible without naming browser-memory machinery.
- Recent Workbench rows now translate old saved media receipt data into display
  labels like `preview reference`, `local only`, and `Local image preview note.`
  The stored receipt body is unchanged.
- Selected Workbench receipt details now use the same low-machinery labels:
  `Receipt Details`, `Assigned Agent`, `Marked Area`, `Preview Reference`, and
  `Preview Storage`.
- Ledger now uses a copy model for audit-trail language. The nav reads `Audit
  what happened.`, the overview says `Local audit trail`, route records are
  `Recent Route Receipts`, and route buttons are `Next Actions`.
- Ledger route action controls now use clearer destinations: `Project Read`,
  `Receipt Body`, `Approval Gate`, and `Task Record`; route receipt creation now
  says `Save Receipt`.
- Sessions/Ledger run history now says `Run History`, `Local audit trail`,
  `Agent`, `Status`, `Run`, and `Actions` instead of proof/class/session
  wording.
- Tasks/Ledger work queue now says `Work Queue` and `Local tasks. Status
  changes stay visible in the audit trail.` instead of Ledger-object or
  task-receipt wording.
- Memory/Ledger knowledge now says `Knowledge Notes`, `Saved and proposed
  notes`, `Ready`, and `Note Routing` instead of knowledge-receipt or truth
  wording.
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
- Source Research now has a read-only local loop audit for source/source-event
  records. It reports trusted/review/stale/sensitive/fetched/GitHub/community
  counts plus Surfer/Hedwig events while explicitly keeping browser, memory
  writes, and retrieval automation off. Next Research/Sources slice should add
  a local source validation proposal path for Oak/Spock without browsing,
  retrieval, external writes, provider calls, installs, or Raven routing.
- Model Tools now has a read-only Basement capability map for `Local First`,
  `External Gateway`, `Creative Normal`, and `Creative Sealed`. Item 9 is active.
  Continue by adding compact live registry/eval counts or tightening the
  registry proposal/eval read. Do not install, pull, run models, call external
  providers, or route Raven content into CereBro.
- Model Tools now reads live local registry/eval counts and groups duplicate
  capability rows in the visible list. The next item 9 slice should add a
  source-verified proposal path or approved Ollama status/capability read. Do
  not clean the repeated dev DB rows without a separate data-cleanup approval.
- `CEREBRO_UI_TASTE_AUDIT.md` is active. It operationalizes Taste Skill,
  Impeccable, Emil Kowalski, Uncodixfy, Stitch, and v0 as a CereBro-native
  review loop. Use it before material UI changes and record the scorecard in
  handoff when a UI slice matters. It is not a redesign queue and does not
  outrank `DESIGN.md`, the castle spec, or the anti-drift law.
- 2026-05-17 2247 EDT: CLI/MCP responsibility note for the active builder.
  Do not put all CLI/MCP work on Spock. Spock owns risk classification,
  preflight receipts, scanner posture, and blocked/allowed execution gates.
  Tony owns command proposal, code/test/build execution after approval, and
  runner integration. Aang owns user-facing command explanation and next-action
  teaching. Cortana owns routing and approval state. Piccolo owns storage,
  cleanup, timeout, process hygiene, and background-job pressure. Surfer owns
  source/tool discovery and current docs, but does not execute. Oak owns
  validation, provenance, and whether a CLI/MCP output is evidence or noise.
  C-3PO owns handoff, summaries, and durable receipt wording. Gojo owns visual
  proof and media/design tool routes. Hedwig owns capture-lane candidates only.
  Next correct CLI slice is a small read-only CommandRunner contract with
  allowlist, redaction, timeout, cancellation, receipt capture, and Spock gate
  hooks. Do not install tools, run MCP servers, browse, call providers, execute
  mutating commands, or add a generic CLI/MCP marketplace without explicit
  approval.
- 2026-05-17 2258 EDT: CLI/MCP current-source research update. MCP is a
  protocol for JSON-RPC tool/resource/prompt connections with capability
  negotiation, tool listing, tool-call outputs, and optional approvals. OpenAI
  docs explicitly treat connectors and remote MCP servers as external-service
  access with sensitive-data, third-party-server, prompt-injection, URL, and
  data-retention risk. CereBro should therefore treat remote MCP as an external
  action lane, not a default local runner. Use official provider-hosted MCP
  servers first when MCP is needed. Avoid third-party aggregator MCP servers
  until Surfer records source research and Spock/Oak approve the risk. Keep MCP
  approvals on by default.
- 2026-05-17 2258 EDT: CLI research update. Codex CLI is officially a local
  terminal coding agent that can inspect repos, edit files, and run commands.
  Docling, OSV-Scanner, Semgrep, Ollama, Scorecard, Gitleaks, GuardDog, zizmor,
  Gitingest, and Playwright all fit CereBro better first as CLI/native-adapter
  candidates than as generic MCP marketplace entries. Each candidate still
  needs a registry row before use: install method, executable path, version,
  allowed commands, forbidden commands, network behavior, output format,
  storage impact, approval class, owner agent, and last verified source URL.
- 2026-05-17 2315 EDT: added `CEREBRO_CLI_MCP_RESEARCH.md` as the durable
  research note for the active build chat. Current shortlist: Tier 0 local
  commands and repo-native checks first; Tier 1 adapters are Docling, Gitingest,
  OSV-Scanner, Gitleaks, and Semgrep after registry rows and approval; Tier 2
  adapters are zizmor, Scorecard, GuardDog, and Ollama. MCP shortlist is
  official/provider-hosted paths only at first: OpenAI connectors, GitHub
  official MCP, Notion official hosted MCP, and Slack official MCP after Slack
  capture requirements are approved. The note defines CommandRunner fields,
  controls, ownership, registry fields, and source links.
- 2026-05-17 2325 EDT: locked CLI/MCP policy contracts in
  `CEREBRO_CLI_MCP_RESEARCH.md`. Direct/native APIs are for stable
  CereBro-owned product workflows. MCP is for provider-maintained,
  approval-gated external agent access. Raw secrets cannot be stored in DB,
  Obsidian, receipts, logs, screenshots, stdout/stderr, browser evidence, or
  handoffs. First `CommandRunner` is read-only, allowlisted, no shell
  interpolation, cwd-bound, timed, output-capped, cancellable, no background
  processes, no daemons, no installs, no network, no writes by default.
  stdout/stderr must be redacted before receipts. CLI network is off by
  default. Tools need version governance and no auto-upgrade. Oak grades
  evidence as proof/strong_signal/weak_signal/warning/noise. CLI/MCP machinery
  belongs in Terminal Lab, Basement/Model Tools, Workbench, Ledger, and
  Approvals, not the Keep primary surface. First build slice is either
  read-only `CommandRunner` contract or registry/proposal rows. No tool install
  or MCP server is approved by this policy.
- 2026-05-18 0535 EDT: Ledger now reads Browser launch gate state from the
  Browser receipt audit. It shows `live runner implementation missing`,
  `implementationPresent: false`, `canOpenPage: false`, and `canExecute: false`
  without opening pages or running the Browser live runner. Browser V1 remains
  hard-blocked until a separate live runner implementation is built and
  approved. Next Browser work should either close a real missing contract gap
  or move forward to the next Daily OS Browser surface. Do not keep expanding
  Ledger machinery if it does not improve user-visible safety or clarity.
- 2026-05-18 0538 EDT: Model/Tool Registry trust promotion now requires risk
  review before `source_verified` or `tested_pass`. Source URLs alone are not
  enough. The UI disables trusted status updates when source URLs or risk review
  are missing. This keeps Basement as the machinery destination and does not
  run models, tools, providers, installs, pulls, browsing, fetching, route
  default changes, or Raven routes.
- 2026-05-18 0542 EDT: Model/tool route approval previews now include
  source-readiness status, required-before-trust fields, and next source step in
  the approval context. Approval previews can still be staged for untrusted
  capabilities, but the receipt now exposes why they are not trusted. No
  provider call, model call, install, pull, browse, fetch, route default change,
  external write, or Raven route was added.
- 2026-05-18 0548 EDT: `CEREBRO_UI_MOCKUP_CONTRACT.md` is active. The approved
  high-fidelity main shell mockup and approved Browser/Watch Shelf mockup are
  1:1 visual targets, not inspiration. Future UI work must name the mockup
  target, call out required deviations before building, preserve the castle,
  avoid fake function, and screenshot-proof fidelity after changes. The next UI
  build slice should move the live shell or Browser toward the approved mockup
  directly.
- 2026-05-18 2239 EDT: Workbench Browser/Watch Shelf icon polish landed. Raw
  browser glyphs were replaced with `lucide-react` icons, the bookmark rail now
  uses folder icons, and the collapsed browser proof block now reads as
  `Safety read` with compact `local only`, `blocked safely`, and `details`
  chips. Browser behavior remains honestly blocked. Next UI fidelity slice
  should reduce surrounding Workbench chrome and improve material/proportions
  against the approved Browser mockup, without faking page rendering or Watch
  Shelf saves.
- 2026-05-18 2244 EDT: Workbench Browser frame polish landed. The Workbench
  header is more compact, its status text is visually hidden, main padding is
  tighter, and the Browser frame has richer dark material plus stronger inset
  depth. Browser behavior remains blocked and honest. Next UI fidelity slice
  should reduce route/context rail dominance during Browser focus or refine
  plaque/sidebar material. Do not create a new Browser primary surface without
  approval.
- 2026-05-18 2325 EDT: Workbench Browser context focus landed. While Workbench
  is open, the right rail narrows to 184px and hides Active Contract, Sessions,
  and route shortcut buttons. It keeps Route Read, Mode, Surface, Chain, and
  Next visible. Browser behavior remains blocked and honest. Next UI fidelity
  slice should refine left rail plaque material, top Workbench tab treatment,
  or Browser proportions.
- 2026-05-18 2330 EDT: Workbench shell plaque tabs landed. Left rail zone
  buttons now use richer plaque gradients and inset shadows, and active
  Workbench tabs read more attached to the shell. Browser behavior remains
  blocked and honest. Next UI fidelity slice should replace temporary shell
  glyphs with approved icon treatment, refine Browser proportions, or reduce
  generic Workbench panel chrome.
- 2026-05-18 2334 EDT: Shell rail icon treatment landed. Temporary left rail
  text glyphs were replaced with `lucide-react` icons: Castle, Hammer,
  ScrollText, and Settings. This keeps the four-zone model unchanged. Next UI
  fidelity slice should refine Browser proportions, reduce generic Workbench
  panel chrome, or design final custom shell icons.
- 2026-05-18 2339 EDT: Workbench Browser viewport proportions landed. Browser
  current-page and Watch Shelf bodies now use a taller responsive viewport and
  stronger inner material depth. Browser behavior remains blocked and honest.
  Next UI fidelity slice should reduce generic Workbench panel chrome around
  Browser or continue final shell/icon treatment.
