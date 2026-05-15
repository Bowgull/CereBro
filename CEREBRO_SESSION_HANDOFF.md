# CereBro Session Handoff

Last updated: 2026-05-14 2104 EDT

## Current North Star

CereBro is being built into a cloud-backed, local-controlled personal command
center for everyday work, project building, creative production, research,
learning, portfolio growth, and freelance work.

The Keep is now the product spine. The Workshop is the dense work surface.
System machinery stays below the floor until it is needed.

The Mac is the workbench, not the warehouse. Turso/libSQL cloud is the intended
structured brain, Google Drive is the durable file vault, Obsidian is the
readable Markdown knowledge layer, and cloud vector retrieval is the intended
RAG path once selected. Local SQLite, local embeddings, and local model files
are cache/fallback lanes unless the user approves the storage cost.

The canonical session plan lives in `CEREBRO_MASTER_BUILD_PLAN.md`.

## Current Session Goal

## 2026-05-14 2104 EDT - Workbench Receipt Body Detail Pass

### What Changed
- Continued in CereBro Prime mode.
- Kept Raven, backend, and reference changes quarantined.
- Left `Home.tsx` untouched because Ledger lives there and that file already
  contains quarantined Raven entry work.
- Updated `WorkbenchPanel` selected receipt detail so the visible read stays
  focused on receipt body, project, validation state, Ledger, and next action.
- Moved knowledge route, full receipt metadata, permission preflight, receipt
  gates, validation trail, comparison trail, before/after append form, and
  validation append form behind closed details.
- No backend behavior changed. No project action, git action from the UI,
  approval execution, command execution from the app, browser action from
  CereBro, Ollama command, install, pull, model call, vector index, external
  write, or storage migration ran.

### Files Touched
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Playwright reloaded `http://localhost:3002/`, opened Workshop, selected
  Workbench receipt `#1461`, and confirmed receipt body read remains visible
  while `Knowledge Route`, `Receipt Metadata`, `Permission Preflight`,
  `Receipt Gates`, `Validation Trail`, `Comparison Trail`, `Append Before/After
  Receipt`, and `Append Validation Receipt` are collapsed.
- Playwright console check returned 0 errors.

### Cleanliness Read
- Current slice: Workbench selected receipt detail low-machinery pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` regenerated during browser proof and
  remains ignored.
- Blocked: Ledger polish in `Home.tsx` should wait until the Raven entry change
  is either committed separately or deliberately integrated.

### Front-End Steward Review
- Workbench now behaves more like the receipt desk CereBro needs.
- The body read and next actions remain visible.
- The audit machinery remains available, but it no longer occupies the default
  inspection view.

### Completion Read
- Overall: 46%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 74%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: either commit or quarantine the
`Home.tsx` Raven entry work before touching Ledger, or continue inside clean
component files. Switch to backend receipt contracts only after the Raven
backend batch is resolved.

## 2026-05-14 2100 EDT - Workbench Add Receipt Detail Pass

### What Changed
- Continued in CereBro Prime mode.
- Kept Raven, backend, and reference changes quarantined.
- Updated `WorkbenchPanel` so Add Receipt keeps only the core action visible:
  receipt kind, title, summary, save status, and Save Local Receipt.
- Moved optional project/task/session/source/command/artifact links behind
  `Receipt Links`.
- Moved route agent, permission class, target, viewport, coordinates,
  annotation text, and sensitive flag behind `Receipt Metadata`.
- Moved temporary media intake behind `Temporary Media`.
- No backend behavior changed. No project action, git action from the UI,
  approval execution, command execution from the app, browser action from
  CereBro, Ollama command, install, pull, model call, vector index, external
  write, or storage migration ran.

### Files Touched
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Playwright opened `http://localhost:3002/`, opened Workshop, and confirmed
  Add Receipt shows `Receipt Links`, `Receipt Metadata`, `Temporary Media`, and
  `Save Local Receipt` while detailed link and metadata labels stay collapsed.
- Playwright console check returned 0 errors.

### Cleanliness Read
- Current slice: Workbench Add Receipt low-machinery pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` regenerated during browser proof and
  remains ignored. `app/.manus-logs` may regenerate from local sessions.
- Blocked: broader Mac cleanup outside this repo stays manual-review only.

### Front-End Steward Review
- Workbench now reads as receipt creation first.
- Optional wiring still exists, but it no longer makes the primary form feel
  like backend administration.
- This keeps the fast AI OS direction intact: one visible action, proof below
  the floor, no hidden execution.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 73%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: inspect Ledger selected receipt and
Workbench recent receipt detail for remaining exposed machinery, then choose the
smallest visible-loop cleanup. Switch to backend receipt contracts only after
the Raven backend batch is resolved.

## 2026-05-14 2054 EDT - Workspace Hygiene Pass

### What Changed
- Continued in CereBro Prime mode.
- Audited generated and stale workspace files before touching anything.
- Removed ignored generated clutter from the local workspace:
  `.DS_Store` files, `.playwright-cli`, `app/dist`, and `app/.manus-logs`.
- Found one tracked macOS junk file:
  `CereBro_Claude_Code_Repo_Starter_Pack/.DS_Store`.
- Removed that tracked `.DS_Store` from git. `.DS_Store` is already ignored, so
  it should not return as a tracked file.
- Confirmed `app/cerebro.db`, `app/.env`, `app/node_modules`, `.codex`,
  `.claude`, and `outputs` were not deleted.
- No frontend behavior changed. No backend behavior changed. No project action,
  git action from the UI, approval execution, command execution from the app,
  browser action from CereBro, Ollama command, install, pull, model call, vector
  index, external write, or storage migration ran.

### Files Touched
- `CereBro_Claude_Code_Repo_Starter_Pack/.DS_Store`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `git status --short --ignored` audited tracked, dirty, and ignored files.
- `du -sh . app app/node_modules app/dist .playwright-cli app/.manus-logs`
  measured workspace size before and after cleanup.
- `git ls-files | rg '(^|/)\\.DS_Store$|\\.log$|\\.tmp$|\\.bak$|~$'` found only
  the starter-pack `.DS_Store` before removal.
- `find . -maxdepth 4` checked for remaining common generated junk.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md CereBro_Claude_Code_Repo_Starter_Pack/.DS_Store` passed.

### Cleanliness Read
- Current slice: workspace hygiene and tracked junk removal.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `app/.manus-logs` may be regenerated by a live browser/dev
  session and remains ignored. `app/cerebro.db`, `.env`, `.codex`, `.claude`,
  `node_modules`, and `outputs` are preserved.
- Blocked: broader Mac cleanup outside this repo should stay manual-review only.

### Front-End Steward Review
- No UI changed in this slice.
- Keeping ignored generated artifacts out of the repo helps future UI diffs stay
  readable.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 72%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: move to Workbench or Ledger visual
proof polish if Terminal Lab reads cleanly. Cleanup outside the repo should be
reported as candidates first, not deleted blindly. Switch to backend receipt
contracts only after the Raven backend batch is resolved.

## 2026-05-14 2051 EDT - Terminal Right Rail Detail Pass

### What Changed
- Continued in CereBro Prime mode.
- Kept Raven, backend, and reference changes quarantined.
- Updated `TerminalLabPanel` right rail so Terminal Map Read and Next Safe
  Action stay visible.
- Moved Workbench receipt counts behind `Receipt Details`.
- Moved the manual command boundary and Project Lab read-only execution note
  behind `Command Boundary`.
- No backend behavior changed. No project action, git action, approval
  execution, command execution, browser action, Ollama command, install, pull,
  model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright reloaded `http://localhost:3002/`, opened Workshop, opened Terminal
  Lab, and confirmed Terminal Map Read and Next Safe Action remain visible while
  `Receipt Details` and `Command Boundary` are collapsed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/TerminalLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Terminal Lab right-rail low-machinery pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Backend receipt contracts remain deferred because
  `app/server/routers/approvals.ts` already contains unstaged Raven
  approval-router changes.

### Front-End Steward Review
- Terminal Lab's right rail now reads as project context first.
- Receipt math and policy are still available, but they do not compete with the
  next safe action.
- The low-machinery pattern is now consistent across Project Lab and Terminal
  Lab.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 72%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: move to Workbench or Ledger visual
proof polish if Terminal Lab reads cleanly. Switch to backend receipt contracts
only after the Raven backend batch is resolved. Do not run Ollama status
commands until the user explicitly approves the real check.

## 2026-05-14 2048 EDT - Terminal Observation Actions Pass

### What Changed
- Continued in CereBro Prime mode.
- Moved from Project Lab to Terminal Lab after Project Lab reached a clean
  map/read split.
- Kept Raven, backend, and reference changes quarantined.
- Updated `TerminalLabPanel` so recent observation cards keep command, cwd,
  output summary, Workbench receipt status, and Aang teaching context visible.
- Moved follow-ups, Tony diagnostic drafts, approval/security gates, task/session
  links, learning proposals, Workbench/Ledger actions, and archive controls
  behind per-row `Observation Actions`.
- No backend behavior changed. No project action, git action, approval
  execution, command execution, browser action, Ollama command, install, pull,
  model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright reloaded `http://localhost:3002/`, opened Workshop, opened Terminal
  Lab, and confirmed recent observations show `Observation Actions` collapsed
  while command/output/receipt context stays visible.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/TerminalLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Terminal Lab observation-card low-machinery pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Backend receipt contracts remain deferred because
  `app/server/routers/approvals.ts` already contains unstaged Raven
  approval-router changes.

### Front-End Steward Review
- Terminal Lab now reads more like a teaching surface.
- Aang's lesson, the command, the output, and the receipt state stay primary.
- Operational controls are still available, but they no longer dominate every
  observation row.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 71%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: inspect Terminal Lab's right rail and
Observed Output panel for density, or move to Workbench if Terminal Lab reads
cleanly. Switch to backend receipt contracts only after the Raven backend batch
is resolved. Do not run Ollama status commands until the user explicitly
approves the real check.

## 2026-05-14 2041 EDT - Project Read Language Pass

### What Changed
- Continued in CereBro Prime mode.
- Kept the slice inside `ProjectLabPanel` because the prior pass made Project
  Read the main support-detail path.
- Renamed the visible `Local Inspector` surface to `Project Read`.
- Updated related search, hide, row, empty, detail, and dirty-worktree copy so
  the surface reads as a project view instead of developer tooling.
- No backend behavior changed. No project action, git action, approval
  execution, command execution, browser action, Ollama command, install, pull,
  model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright reloaded `http://localhost:3002/`, opened Workshop, opened Project
  Lab, opened CereBro Project Read, and confirmed `Project Read`, `Search
  Approvals project rows`, `Read-only details`, and the dirty-worktree Project
  Read copy render.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/ProjectLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Project Read language polish.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Backend receipt contracts remain deferred because
  `app/server/routers/approvals.ts` already contains unstaged Raven
  approval-router changes.

### Front-End Steward Review
- Project Lab now has less visible machinery in both card and detail states.
- `Project Read` is still explicit, but it is less developer-coded than
  `Local Inspector`.
- The map/read split is clearer.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 70%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: move to Terminal Lab command-teaching
polish or pause Project Lab until backend receipt contracts are safe. Switch to
backend receipt contracts only after the Raven backend batch is resolved. Do
not run Ollama status commands until the user explicitly approves the real
check.

## 2026-05-14 2039 EDT - Project Lab Inspector Consolidation Pass

### What Changed
- Continued in CereBro Prime mode.
- Used one read-only frontend worker to confirm the next safe critical-path
  slice. Worker recommended Project Lab inspector consolidation.
- Kept Raven, backend, and reference changes quarantined.
- Updated `ProjectLabPanel` so project cards stop rendering duplicate support
  disclosures and recent lists.
- Removed card-level `Project Details`, `Draft Actions`, and `Activity Details`.
- Removed duplicate knowledge-route, proof-strip, and recent-list helper
  components that were only serving those card disclosures.
- Kept push readiness, push decision, activity signal buttons, next safe action,
  and dirty worktree inspector CTA visible.
- Draft note handling remains in the Local Inspector. No local draft creation
  controls remain on the default card.
- No backend behavior changed. No project action, git action, approval
  execution, command execution, browser action, Ollama command, install, pull,
  model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright reloaded `http://localhost:3002/`, opened Workshop, opened Project
  Lab, and confirmed the removed `Project Details`, `Draft Actions`, and
  `Activity Details` labels no longer appear while Push Details and inspector
  CTAs remain.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/ProjectLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Project Lab inspector consolidation.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Backend receipt contracts remain deferred because
  `app/server/routers/approvals.ts` already contains unstaged Raven
  approval-router changes.

### Front-End Steward Review
- Project Lab now behaves more like a map and less like five tiny dashboards.
- The card shows the daily read first.
- Supporting evidence moves through Inspect, activity buttons, Workbench, or
  Ledger instead of duplicating on every card.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 69%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe slice: inspect whether Local Inspector needs a calmer
first-read header or whether Project Lab can pause and the frontend track should
move to Terminal Lab command-teaching polish. Switch to backend receipt
contracts only after the Raven backend batch is resolved. Do not run Ollama
status commands until the user explicitly approves the real check.

## 2026-05-14 2032 EDT - Project Card Supporting Detail Pass

### What Changed
- Continued in CereBro Prime mode without adding another worker because the next
  safe slice was in the same file and did not need parallel ownership.
- Kept Raven, backend, and reference changes quarantined.
- Updated `ProjectLabPanel` so project cards keep the map read, push decision,
  next action, activity signal buttons, and dirty-state inspector entry visible.
- Moved knowledge route and Workbench proof into `Project Details`.
- Moved local draft creation controls into `Draft Actions`.
- Moved current tasks, terminal observations, Hedwig captures, approval queue
  details, and source-event lists into `Activity Details`.
- Simplified dirty worktree cards to a single inspector CTA instead of showing
  the first five file paths on every project card.
- No backend behavior changed. No project action, git action, approval
  execution, command execution, browser action, Ollama command, install, pull,
  model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright reloaded `http://localhost:3002/`, opened Workshop, opened Project
  Lab, and confirmed `Project Details`, `Draft Actions`, and `Activity Details`
  are collapsed while dirty worktree cards show a single inspector CTA.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/ProjectLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Project Lab supporting-detail density.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Backend receipt contracts remain deferred because
  `app/server/routers/approvals.ts` already contains unstaged Raven
  approval-router changes.

### Front-End Steward Review
- Project Lab now reads more like a project map.
- The default card shows status, next safe action, push decision, and where to
  inspect.
- The machinery remains reachable, but it no longer owns the first read.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 68%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next safe frontend slice: inspect Project Lab after this density
pass and decide whether the project-card inspector should become the main place
for route/proof/activity details. Switch to backend receipt contracts only
after the Raven backend batch is resolved. Do not run Ollama status commands
until the user explicitly approves the real check.

## 2026-05-14 2027 EDT - Project Card Push Detail Pass

### What Changed
- Continued in CereBro Prime mode with one read-only frontend worker finding.
- Worker recommended Project Lab card simplification. Prime took the smallest
  safe slice.
- Kept Raven, backend, and reference changes quarantined.
- Updated `ProjectLabPanel` so each project card keeps push readiness and the
  push decision read visible, while push mode, manual commands, evidence, why,
  stays-out, checks, suggested commit, and manual push preview move behind
  per-card `Push Details`.
- No backend behavior changed. No project action, git action, approval
  execution, command execution, browser action, Ollama command, install, pull,
  model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright opened `http://localhost:3002/`, opened Workshop, opened Project
  Lab, and confirmed project cards still show Push Readiness and Push Decision
  Read while `Push Details` is collapsed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/ProjectLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Project Lab per-card push detail density.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`,
  and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Backend receipt contracts remain deferred because
  `app/server/routers/approvals.ts` already contains unstaged Raven
  approval-router changes.

### Front-End Steward Review
- Project cards now expose the push decision without turning every card into a
  git console.
- Manual push is still present and visible on demand.
- The project map stays closer to a fast daily surface.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 67%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
`CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read
Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
before UI edits. Continue in CereBro Prime mode. Start by classifying dirty
files. Keep Raven implementation quarantined because Raven is being built in a
separate chat. Next frontend slice: continue Project Lab card simplification by
folding Knowledge Route, ProofStatusStrip, draft actions, recent queues, and
dirty lists behind details or inspector. Switch to backend receipt contracts
only after the Raven backend batch is resolved. Do not run Ollama status
commands until the user explicitly approves the real check.

## 2026-05-14 2020 EDT - Ledger Low-Machinery Pass

### What Changed
- Continued in CereBro Prime mode.
- Re-read the active Obsidian design law `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`.
- Kept Raven, backend, and reference changes quarantined.
- Updated Ledger Overview so the primary surface is local history: receipt object counts, latest Workbench receipts, and selected receipt inspection.
- Shortened the visible Ledger intro to the next action.
- Moved audit rules and the receipt-path explanation into one closed `Ledger Rules` disclosure.
- No backend behavior changed. No project action, git action, approval execution, command execution, browser action, Ollama command, install, pull, model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/pages/Home.tsx` Ledger section only
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright refreshed `http://localhost:3002/`, dismissed the establishing shot, opened Ledger, and confirmed receipt history remains primary while `Ledger Rules` is closed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/pages/Home.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Ledger low-machinery frontend pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`, Raven ADR, the existing Raven entry change in `app/client/src/pages/Home.tsx`, and dirty backend/Raven files remain unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Model Tools approval origin backend filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.

### Front-End Steward Review
- Ledger now behaves more like a history surface.
- The user sees receipts and selected evidence first.
- Audit law remains available without taking over the page.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 66%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md` before UI edits. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next frontend slice: reduce Project Lab card push-detail density or switch to backend receipt contracts after the Raven backend batch is resolved. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 2012 EDT - Project Lab Low-Machinery Pass

### What Changed
- Continued in CereBro Prime mode.
- Re-read the active Obsidian design law `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`.
- Kept Raven, backend, and reference changes quarantined.
- Updated `ProjectLabPanel` so the primary Project Lab surface starts with the project map: local/attention/dirty/approval/receipt stats, filters, next safe projects, and project cards.
- Removed `Scanned` from the primary stat row.
- Moved scan state and the project-wide receipt-chain proof into one closed `Project Rules` disclosure.
- No backend behavior changed. No project action, git action, approval execution, command execution, browser action, Ollama command, install, pull, model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright refreshed `http://localhost:3002/`, dismissed the establishing shot, opened Workshop, opened Project Lab, and confirmed `Project Rules` is closed while filters, next safe projects, and project cards stay visible.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/ProjectLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Project Lab low-machinery frontend pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`, Raven ADR, `app/client/src/pages/Home.tsx`, and dirty backend/Raven files remain untouched and unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Model Tools approval origin backend filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.

### Front-End Steward Review
- This pass makes Project Lab feel more like the project map and less like a system console.
- The user now sees what needs attention first.
- Global scan/proof detail is still available, but it does not own the top of the surface.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 65%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md` before UI edits. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next frontend slice: apply the same low-machinery review to Ledger, then decide whether to clean the project-card push detail density or switch to backend receipt contracts after the Raven backend batch is resolved. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 2001 EDT - Terminal Lab Low-Machinery Pass

### What Changed
- Continued in CereBro Prime mode.
- Re-read the active Obsidian design law `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`.
- Kept Raven, backend, and reference changes quarantined.
- Updated `TerminalLabPanel` so the primary Terminal Lab surface stays focused on the work object: command preview input, Aang teaching, receipt chain, recent observations, project context, and observed output.
- Moved Terminal Lab policy, live-link notes, surface inventory, and approval preview history behind one closed `Terminal Rules` disclosure.
- No backend behavior changed. No command execution logic changed. No approval execution, git action, browser action, Ollama command, install, pull, model call, vector index, external write, or storage migration ran.

### Files Touched
- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright refreshed `http://localhost:3002/`, opened Workshop, opened Terminal Lab, and confirmed `Terminal Rules` is closed while command teaching, observations, project context, and observed output stay visible.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/TerminalLabPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Terminal Lab low-machinery frontend pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`, Raven ADR, `app/client/src/pages/Home.tsx`, and dirty backend/Raven files remain untouched and unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Model Tools approval origin backend filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.

### Front-End Steward Review
- This pass keeps Terminal Lab as a teaching lane instead of a machine-status lane.
- Aang's explanation and the command observations now own the screen.
- Policy and approval history remain available, but they no longer compete with the current command work.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 64%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md` before UI edits. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next frontend slice: apply the same low-machinery review to Project Lab, then Ledger. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1957 EDT - Workbench Low-Machinery Pass

### What Changed
- Continued in CereBro Prime mode.
- Read the active Obsidian design law `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`.
- Kept Raven, backend, and reference changes quarantined.
- Updated `WorkbenchPanel` so the primary Workbench surface stays focused on the work object: receipt lanes, receipt chain, project receipt state, Add Receipt, temporary media, and Recent Receipts.
- Moved Workbench plan summary, surface internals, permission model, receipt shape, and gates behind one closed `Workbench Rules` disclosure.
- No backend behavior changed. No receipt creation logic changed. No external action, command execution, git action, browser action, media capture, Ollama command, install, pull, model call, vector index, or storage migration ran.

### Files Touched
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright refreshed `http://localhost:3002/`, opened Workshop, and confirmed Workbench shows Add Receipt and Recent Receipts while `Workbench Rules` is closed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/client/src/components/WorkbenchPanel.tsx` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Workbench low-machinery frontend pass.
- Quarantine: `AGENTS.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`, Raven ADR, `app/client/src/pages/Home.tsx`, and dirty backend/Raven files remain untouched and unstaged.
- Generated/local: `.playwright-cli/` stays ignored as local inspection output.
- Blocked: Model Tools approval origin backend filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.

### Front-End Steward Review
- This pass corrects drift toward an admin panel.
- The Workbench now makes the user's object of work visible first.
- Rules and proof remain available, but they no longer dominate the screen.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 63%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_BUILD_QUEUE.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, and `CEREBRO_SESSION_HANDOFF.md`. Also read Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md` before UI edits. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next frontend slice: apply the same low-machinery review to Terminal Lab or Project Lab without changing backend behavior. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1947 EDT - Approval Queue Receipt Chain Pass

### What Changed
- Continued in CereBro Prime mode.
- Added `.playwright-cli/` to `.gitignore` so local browser inspection artifacts stay out of git status.
- Added a selected-preview Receipt Chain to the Approval Queue.
- The chain shows origin, target, permission preflight, next safe surface, and a Security Gate jump.
- Next surface routing is frontend-only and points to Model Tools, Terminal Lab, Sources, Capture Inbox, Project Lab, or Workbench from the existing approval shape.
- The Approval Queue still does not approve, reject, execute commands, run Ollama checks, browse, push, or write externally.
- Raven, backend, and reference changes remain quarantined.

### Files Touched
- `.gitignore`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Playwright snapshot on `http://localhost:3002/` confirmed the Approval Queue Receipt Chain is visible with Model Tools and Security Gate jumps.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- .gitignore app/client/src/components/ApprovalDashboardPanel.tsx CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Approval Queue selected-preview receipt chain and Playwright output hygiene.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven/backend track.
- Generated/local: `.playwright-cli/` is ignored as local inspection output.
- Blocked: Model Tools approval origin backend filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.
- No command was executed from CereBro UI, no git action from UI, no Ollama status command, install, pull, model call, vector index, external escalation, approval action, or storage migration ran.

### Front-End Steward Review
- The Approval Queue now reads like a route chain, not a detail pile.
- The machinery is still visible, but it is compact and tied to the next safe surface.
- This is the correct visible-loop direction for a fast AI OS: receipt first, action later.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 62%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: wait for the Raven approval-router batch before touching approval backend origin filters, or continue a frontend-only Workbench/Ledger proof refinement. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1938 EDT - Dev Server HMR Console Cleanup Pass

### What Changed
- Continued in CereBro Prime mode.
- Used Playwright CLI to inspect `localhost:3002`.
- Verified the Terminal -> Workbench -> Project Lab receipt chain appears in Workbench, Terminal Lab, and Project Lab snapshots.
- Found Vite dev-server websocket errors in browser console.
- Fixed `app/server/_core/vite.ts` so the Vite middleware honors the existing no-HMR development setup instead of overriding HMR back on.
- Reopened `localhost:3002` with Playwright and confirmed the Vite websocket errors are gone. Only the normal React DevTools info message remains.

### Files Touched
- `app/server/_core/vite.ts`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `command -v npx` passed for Playwright CLI prerequisites.
- `"$HOME/.codex/skills/playwright/scripts/playwright_cli.sh" open http://localhost:3002 --headed` loaded the app.
- Playwright snapshots confirmed receipt-chain regions on Workbench, Terminal Lab, and Project Lab.
- First Playwright console pass showed Vite HMR websocket errors.
- Second Playwright console pass showed no Vite HMR websocket errors.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `git diff --check -- app/server/_core/vite.ts CEREBRO_SESSION_HANDOFF.md CEREBRO_BUILD_QUEUE.md` passed.

### Cleanliness Read
- Current slice: dev-server HMR console cleanup and visual proof record.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven/backend track.
- Generated/local: Playwright wrote `.playwright-cli/` inspection artifacts. They remain untracked local tool output and are not staged.
- Blocked: Model Tools approval origin filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.
- No command was executed from CereBro UI, no git action from UI, no Ollama status command, install, pull, model call, vector index, external escalation, approval action, or storage migration ran.

### Front-End Steward Review
- This pass improves trust in visual proof. The app now loads without dev-console HMR error noise.
- The receipt chain is visible in the three intended Workshop surfaces.
- This does not change product behavior beyond removing broken dev HMR wiring.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 61%.
- Backend/runtime: 30%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: tighten the Approval Queue receipt chain frontend-only, or wait until the Raven approval-router batch is resolved before adding a Model Tools approval origin. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1932 EDT - Prime Worker Operating Model Pass

### What Changed
- Switched this chat into CereBro Prime mode in practice: Prime owns priority, integration, checks, percentages, handoff, Obsidian archive, commit, and push.
- Dispatched three read-only workers:
  - Frontend Worker recommended the Terminal to Workbench proof path as the best next visible-loop slice.
  - Backend Worker confirmed the Model Tools approval origin filter is blocked until dirty Raven approval-router work is resolved.
  - Knowledge Worker confirmed Prime plus lane workers is the durable build model and recommended splitting Knowledge Planning from Knowledge Implementation.
- Dispatched one bounded Frontend Coding Worker for the Terminal to Workbench proof path.
- Added compact receipt-chain strips to Terminal Lab, Workbench, and Project Lab.
- Terminal now shows observation -> Workbench body -> project push read.
- Workbench now shows command link -> staged/saved receipt body -> linked project.
- Project Lab now shows terminal receipt count -> Workbench receipt state -> project context.
- Changed project push copy from auto-push language to assisted recommendation language.
- Updated worker orchestration docs so this chat is CereBro Prime and Knowledge is split into Planning vs Implementation.
- Added the Prime plus workers rule to the master build plan.
- Hardened the Model Tools local-first test so `ollamaStatusApprovalPreviews` proves read-only/no-command/no-install/no-pull behavior.

### Files Touched
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_WORKER_ORCHESTRATION.md`
- `CEREBRO_BUILD_QUEUE.md`
- `app/server/modelTools.localFirst.test.ts`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Frontend Coding Worker ran `pnpm -C app exec tsc --noEmit --pretty false`.
- Prime ran `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false`. 3 files. 7 tests passed.
- Prime ran `pnpm -C app check`. Passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_MASTER_BUILD_PLAN.md CEREBRO_WORKER_ORCHESTRATION.md CEREBRO_BUILD_QUEUE.md app/server/modelTools.localFirst.test.ts app/client/src/components/TerminalLabPanel.tsx app/client/src/components/WorkbenchPanel.tsx app/client/src/components/ProjectLabPanel.tsx` passed.
- Visual browser inspection was attempted, but the available desktop automation tool cannot inspect the Codex app window in this session.

### Cleanliness Read
- Current slice: Prime worker operating model, Model Tools test hardening, and Terminal -> Workbench -> Project Lab proof path.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven/backend track.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: Model Tools approval origin filter remains deferred because `app/server/routers/approvals.ts` already contains unstaged Raven approval-router changes.
- No Ollama status command, install, pull, model call, vector index, external escalation, browser action, command execution, approval action, git execution from UI, or storage migration ran.

### Front-End Steward Review
- This is the right method now: Prime integrates, workers inspect/build bounded lanes, and only Prime ships.
- The visible loop is stronger: Terminal explains, Workbench holds proof, Project Lab reads project context.
- The machine stays hidden until needed. The receipt chain is visible without adding a new surface.

### Completion Read
- Overall: 45%.
- Foundation/docs/planning: 92%.
- Frontend visible loop: 61%.
- Backend/runtime: 29%.
- Knowledge/storage/source: 36%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue in CereBro Prime mode. Start by classifying dirty files. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: visually inspect the Terminal -> Workbench -> Project Lab receipt chain in localhost if browser tooling is callable, then either tighten the Approval Queue receipt chain frontend-only or wait until the Raven approval-router batch is resolved before adding a Model Tools approval origin. Do not run Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1920 EDT - Model Tools Approval Queue Bridge Pass

### What Changed
- Kept Raven quarantined in the separate Raven chat. No Raven files were touched.
- Added an `Open Approval Queue` control beside the Ollama status approval-preview button in `ModelToolsPanel`.
- Passed the app navigation handler into `ModelToolsPanel` from `Home`.
- Updated the Approval Queue empty state so Model Tools is named as a valid preview staging source.
- Avoided editing `app/server/routers/approvals.ts` because it already contains unstaged Raven queue changes. The model-tools origin map should wait until that backend batch is resolved or staged cleanly.

### Files Touched
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `git diff --check -- app/client/src/components/ModelToolsPanel.tsx app/client/src/pages/Home.tsx app/client/src/components/ApprovalDashboardPanel.tsx` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/client/src/components/ModelToolsPanel.tsx app/client/src/pages/Home.tsx app/client/src/components/ApprovalDashboardPanel.tsx` passed.

### Cleanliness Read
- Current slice: Model Tools to Approval Queue bridge.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven chat.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Ollama status command, install, pull, model call, vector index, external escalation, browser action, command execution, approval action, or storage migration ran.

### Front-End Steward Review
- This is the safer next move because the user can now follow the receipt from where it is created to where it is reviewed.
- The Approval Queue still does not approve or execute anything.
- The backend origin filter for Model Tools is intentionally deferred until the existing dirty Raven approval-router work can be handled without mixing commits.

### Completion Read
- Overall: 44%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 60%.
- Backend/runtime: 29%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue CereBro core only. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: visually inspect the Model Details to Approval Queue bridge in localhost, then add the Model Tools approval origin filter only after the dirty Raven approval-router batch is resolved or can be staged separately. Do not run the Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1914 EDT - Ollama Status Approval Preview Pass

### What Changed
- Kept Raven quarantined in the separate Raven chat. No Raven files were touched.
- Added a Model Tools mutation that stages a pending local approval preview for the Ollama install-status check.
- The mutation also records one local permission preflight audit row.
- The preview is metadata only: no command execution, install, model pull, model call, background process, vector index, browser action, external call, or storage migration.
- Added a read-only query for recent Ollama status approval previews.
- Added a compact `Stage Approval Preview` control and recent-preview list to `ModelToolsPanel`.

### Files Touched
- `app/server/routers/modelTools.ts`
- `app/server/modelTools.localFirst.test.ts`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts --pool=forks --fileParallelism=false` passed. 3 tests.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 7 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/modelTools.ts app/server/modelTools.localFirst.test.ts app/client/src/components/ModelToolsPanel.tsx` passed.

### Cleanliness Read
- Current slice: Ollama status approval preview.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven chat.
- Generated/local: ignored `outputs/` stays out of status.
- Local DB note: the targeted mutation test creates append-only local approval/preflight rows. This is expected for this route and does not approve or execute anything.
- Blocked: no Ollama status command, install, pull, model call, vector index, external escalation, browser action, command execution, or storage migration ran.

### Front-End Steward Review
- This is the right next step because it makes the future check explicit before it can run.
- The button sits in Model Details, not the Keep front door.
- The approval queue can now show the readiness request as a receipt, not a hidden command.

### Completion Read
- Overall: 44%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 59%.
- Backend/runtime: 29%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue CereBro core only. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: either visually inspect the new Model Details approval preview in localhost, or continue Keep/Workshop/Ledger hierarchy polish. Do not run the Ollama status commands until the user explicitly approves the real check.

## 2026-05-14 1909 EDT - Ollama Status Check Receipt Draft Pass

### What Changed
- Kept Raven quarantined in the separate Raven chat. No Raven files were touched.
- Added `ollamaSetupPlan.installStatusCheck` to the Model Tools policy.
- The status check is a draft receipt only. It names allowed read-only commands, forbidden install/pull/run actions, receipt fields, missing/present next states, and no-action status.
- Added the install-status check draft to `ModelToolsPanel`.
- Added a compact install-status check readout to Basement Overview.
- No install, model pull, model call, background process, vector index, or external call ran.

### Files Touched
- `app/server/routers/modelTools.ts`
- `app/server/modelTools.localFirst.test.ts`
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts --pool=forks --fileParallelism=false` passed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 6 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/modelTools.ts app/server/modelTools.localFirst.test.ts app/client/src/components/ModelToolsPanel.tsx app/client/src/pages/Home.tsx` passed.

### Cleanliness Read
- Current slice: Ollama install-status check receipt draft.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven chat.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Ollama status command, install, pull, model call, vector index, external escalation, browser action, command execution, or storage migration ran.

### Front-End Steward Review
- This keeps the fast AI OS path understandable without making Basement a control panel.
- The UI shows what CereBro would check and what it refuses to do without approval.
- The Keep stays simple. Model Details holds the command-level receipt shape.

### Completion Read
- Overall: 43%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 59%.
- Backend/runtime: 28%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue CereBro core only. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: either wire an approval-preview row for the Ollama install-status check without executing it, or return to Keep/Workshop/Ledger hierarchy polish.

## 2026-05-14 1903 EDT - Basement Ollama Setup Receipt Pass

### What Changed
- Added `ollamaSetupPlan.nextApprovalSteps` to the Model Tools policy.
- The steps are `Check Install Status`, `Install Ollama`, `Pull First Batch`, and `Run Local Eval`.
- Each step carries a gate, receipt expectation, and `runsFromPolicy: false`.
- Added an Ollama Setup Receipt to Basement Overview so the fast local-first path is visible without opening the full registry.
- Basement now shows status, no-install receipt, next approval steps, first-batch model chips, and a link into Model Details.
- Raven remains owned by the separate Raven chat and untouched here.

### Files Touched
- `app/server/routers/modelTools.ts`
- `app/server/modelTools.localFirst.test.ts`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts --pool=forks --fileParallelism=false` failed first as expected, then passed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed. 3 files. 6 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK` after restarting the dev server with `PORT=3002`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/modelTools.ts app/server/modelTools.localFirst.test.ts app/client/src/pages/Home.tsx` passed.

### Cleanliness Read
- Current slice: Basement Ollama setup receipt.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven chat.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Ollama install, model pull, local model call, vector index, background inference, external escalation, browser action, command, git action, or storage migration ran.

### Front-End Steward Review
- This follows the Sundesk lesson: the home-level Basement read is simple, and the machinery lives in Model Details.
- The setup path is visible without being executable clutter.
- The first action is still approval, not a hidden install.

### Completion Read
- Overall: 43%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 58%.
- Backend/runtime: 27%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue CereBro core only. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: add a read-only Ollama install-status check receipt behind approval, or continue tightening the Keep/Workshop/Ledger/Basement hierarchy without widening surfaces.

## 2026-05-14 1850 EDT - Ollama Setup Readiness Plan Pass

### What Changed
- Kept Raven implementation out of this chat. Raven/backend/reference files remain quarantined for the separate Raven chat.
- Added `ollamaSetupPlan` to `modelTools.policy`.
- The setup plan records not-started status, approval-required execution mode, M2/8GB hardware stance, storage rule, Basement-only UI rule, first approval batch, stretch candidates, blocked first installs, test procedure, and no-action receipt.
- Added a compact Ollama Setup readiness block to `ModelToolsPanel`.
- The panel now shows the first safe local model batch: `all-minilm:22m` and `gemma3:1b`.
- Stretch candidates are visible but not first installs: `qwen3:1.7b` and `llama3.2:3b`.

### Files Touched
- `app/server/routers/modelTools.ts`
- `app/server/modelTools.localFirst.test.ts`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts --pool=forks --fileParallelism=false` failed first as expected, then passed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed: 6 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/modelTools.ts app/server/modelTools.localFirst.test.ts app/client/src/components/ModelToolsPanel.tsx` passed.

### Cleanliness Read
- Current slice: Ollama setup readiness policy and Basement display.
- Quarantine: existing Raven/backend/reference changes remain untouched and are owned by the separate Raven chat.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Ollama install, model pull, model call, vector index, background inference, external escalation, browser action, command, or storage migration ran.

### Front-End Steward Review
- This keeps machinery hidden but inspectable. The daily flow only sees route receipts. Basement carries the install plan.
- This keeps speed honest. Small local models first, measured tests before trust, no giant models first.
- This keeps user control. Every install, pull, delete, vector index, or background inference remains approval-gated.

### Completion Read
- Overall: 42%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 57%.
- Backend/runtime: 26%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue CereBro core only. Keep Raven implementation quarantined because Raven is being built in a separate chat. Next slice: add a read-only Ollama install-status check proposal or continue collapsing Basement model/tool receipts into the visible route loop without installing anything.

## 2026-05-14 1842 EDT - Runtime Model Lane Receipt Pass

### What Changed
- Added model-lane guidance to `runtime.previewRoute`.
- Quick/private text routes now point at `ollama_local_fast_lane` with provider, status, install need, reason, and no-data-leaves-machine receipt.
- Build/design/security routes now point at `frontier_or_codex_escalation` only as an approval-required lane when local may not be strong enough.
- Workbench route drafts now carry `modelLane` metadata.
- Ledger focus drafts now include `modelLaneId` in audit filters.
- Ask Aang route preview now shows the model lane, provider, status, data boundary, and short user-facing summary.

### Files Touched
- `app/server/routers/runtime.ts`
- `app/server/runtime.routeReceipt.test.ts`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` failed first as expected, then passed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/runtime.routeReceipt.test.ts server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts --pool=forks --fileParallelism=false` passed: 5 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/runtime.ts app/server/runtime.routeReceipt.test.ts app/client/src/pages/Home.tsx` passed.

### Cleanliness Read
- Current slice: runtime route receipt model-lane guidance and Ask Aang preview display.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Ollama install, model pull, model call, external escalation, command, browser action, git action, Slack write, Notion write, memory write, or provider call ran.

### Front-End Steward Review
- This hides machinery correctly: the user sees the route decision, not a provider console.
- Local-first speed is now part of the visible loop. Aang can show local Ollama as the first path for small private work.
- External escalation is visible as a gated route, not an automatic assumption.

### Completion Read
- Overall: 41%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 56%.
- Backend/runtime: 25%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the build spine. Start by classifying the dirty worktree. Next slice: reconcile the quarantined Raven/backend batch or add the Ollama install-status read model, depending on whether the dirty batch blocks safe progress.

## 2026-05-14 1836 EDT - Local First Ollama Policy Correction Pass

### What Changed
- Corrected the Model Tools policy to make Ollama/local models part of the core fast local-first router path.
- Added `localModelLanes` to `modelTools.policy` for the Ollama local fast lane and local embedding smoke lane.
- Updated route preview so small private text work recommends `ollama_local_fast_lane` while still doing no install, pull, model call, or background inference.
- Added visible speed stance and routing stance to the Basement Model Registry.
- Added a compact Local Model Lanes section to `ModelToolsPanel` so local AI power is visible in Basement without becoming front-door clutter.
- Updated `CEREBRO_BUILD_QUEUE.md` so future passes do not treat Ollama as optional decoration.

### Files Touched
- `app/server/routers/modelTools.ts`
- `app/server/modelTools.localFirst.test.ts`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts --pool=forks --fileParallelism=false` failed first as expected, then passed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/modelTools.localFirst.test.ts server/modelTools.creativeLanes.test.ts --pool=forks --fileParallelism=false` passed: 2 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/modelTools.ts app/server/modelTools.localFirst.test.ts app/client/src/components/ModelToolsPanel.tsx` passed.

### Cleanliness Read
- Current slice: local-first model policy and Basement visibility.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Ollama install, model pull, model call, gateway, cloud provider, account, token, browser fetch, or storage migration ran.

### Front-End Steward Review
- This keeps CereBro fast: instant shell, rule-based previews, small local lanes for small jobs, and visible background work for slow jobs.
- This hides machinery correctly: Ollama status lives in Basement, while Ask Aang and Cortana only show the route receipt when it matters.
- This corrects the drift: local models are core to CereBro's identity, but model installs and pulls stay gated.

### Completion Read
- Overall: 40%.
- Foundation/docs/planning: 90%.
- Frontend visible loop: 55%.
- Backend/runtime: 23%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the build spine. Start by classifying the dirty worktree. Next slice: connect route receipts to Model Tools lanes so Aang can say when local Ollama is recommended, when external escalation is needed, and what approval is required.

## 2026-05-14 1758 EDT - Model Tool Creative Lane Policy Pass

### What Changed
- Added proposal-only creative tool lanes to `modelTools.policy`.
- Gojo now has a normal creative ComfyUI lane that can enter CereBro only after approval.
- Raven now has a separate private ComfyUI lane that cannot enter normal CereBro memory, RAG, Workbench, Ledger, galleries, or vault routes unless the user approves a scrubbed bridge summary.
- Added RealESRGAN as a local upscale lane with source-file and output-path approval.
- Added free cloud burst as an optional public/scrubbed-only lane with no paid-trial or private Raven use.
- Surfaced these lanes inside the existing Basement Model Registry instead of creating a new tool wall.

### Files Touched
- `app/server/routers/modelTools.ts`
- `app/server/modelTools.creativeLanes.test.ts`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/modelTools.creativeLanes.test.ts --pool=forks --fileParallelism=false` failed first as expected, then passed.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/modelTools.ts app/server/modelTools.creativeLanes.test.ts app/client/src/components/ModelToolsPanel.tsx` passed.

### Cleanliness Read
- Current slice: Model Tools creative lane policy and visible registry section.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no ComfyUI, RealESRGAN, cloud model, gateway, account, token, model weight, browser fetch, or install action was run.

### Front-End Steward Review
- This keeps machinery low. The UI shows lane policy, not a new product area.
- The Raven boundary is now visible and hard to accidentally cross.
- Gojo and Raven can eventually use similar creative infrastructure without sharing outputs or memory.

### Completion Read
- Overall: 39%.
- Foundation/docs/planning: 89%.
- Frontend visible loop: 54%.
- Backend/runtime: 22%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 10%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the build spine. Start by classifying the dirty worktree. Next slice: connect Model Tools capability proposals to the route receipt preview so Aang can explain when a tool is only a proposal, when it needs approval, and when it is blocked.

## 2026-05-14 1751 EDT - Workbench Knowledge Route Context Pass

### What Changed
- Added project knowledge route context to `workbench.evidenceDetail` when a receipt is linked to a project.
- Workbench receipt bodies now show project bridge path, repository source path, archive-only lane, write status, and write approval gate.
- Added a targeted mutation guard test proving the Workbench detail route read does not write artifacts, approvals, or memory entries.
- Updated `CEREBRO_BUILD_QUEUE.md` with this Block C progress.

### Files Touched
- `app/server/routers/workbench.ts`
- `app/server/workbench.knowledgeRoute.test.ts`
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/workbench.knowledgeRoute.test.ts server/knowledge/contracts.test.ts --pool=forks --fileParallelism=false` passed: 5 tests.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/workbench.ts app/server/workbench.knowledgeRoute.test.ts app/client/src/components/WorkbenchPanel.tsx` passed.

### Cleanliness Read
- Current slice: Workbench read-only knowledge route context.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: visual browser screenshot was not available through the current tool set; localhost responded with 200.

### Front-End Steward Review
- Workbench now shows knowledge destination where it matters: on the receipt body.
- No new UI surface was added.
- No Obsidian, vault, Notion, Slack, Drive, memory, git, browser, or source write was added.

### Completion Read
- Overall: 38%.
- Foundation/docs/planning: 89%.
- Frontend visible loop: 53%.
- Backend/runtime: 21%.
- Knowledge/storage/source: 35%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the build spine. Start by classifying the dirty worktree. Next slice: begin Model and Tool Registry as basement capability proposals, keeping ComfyUI/Gojo/Raven separated by privacy lanes and no installs.

## 2026-05-14 1725 EDT - Project Lab Knowledge Route Pass

### What Changed
- Added a read-only `knowledgeRoute` object to each Project Intelligence overview/detail project.
- The route names the project bridge note, GitHub repository source note, GitHub map/index paths, archive lane, archive-only retrieval, and explicit write gate.
- Added a compact Knowledge Route strip to each Project Lab card.
- Added a targeted mutation guard test proving Project Intelligence route reads do not write artifacts, approvals, or memory entries.
- Updated `CEREBRO_BUILD_QUEUE.md` with this Block C progress.

### Files Touched
- `app/server/routers/projectIntelligence.ts`
- `app/server/projectIntelligence.knowledgeRoute.test.ts`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/projectIntelligence.knowledgeRoute.test.ts server/knowledge/contracts.test.ts --pool=forks --fileParallelism=false` passed: 5 tests.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/projectIntelligence.ts app/server/projectIntelligence.knowledgeRoute.test.ts app/client/src/components/ProjectLabPanel.tsx` passed.

### Cleanliness Read
- Current slice: Project Lab read-only knowledge route and backend route contract.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: visual browser screenshot was not available through the current tool set; localhost responded with 200.

### Front-End Steward Review
- This keeps the Sundesk lesson: the card shows where knowledge goes without exposing a storage console.
- Project Lab now connects push readiness and knowledge routing on the same project card.
- No Obsidian, vault, Notion, Slack, Drive, memory, git, or browser write was added.

### Completion Read
- Overall: 37%.
- Foundation/docs/planning: 89%.
- Frontend visible loop: 52%.
- Backend/runtime: 20%.
- Knowledge/storage/source: 33%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the build spine. Start by classifying the dirty worktree. Next slice: make Workbench receipts show project knowledge route context when a project is linked, still without creating durable notes.

## 2026-05-14 1721 EDT - Piccolo Storage Contract Receipt Pass

### What Changed
- Added `piccolo.storageContractReceipt` as a read-only backend receipt for the storage contract.
- The receipt reports artifact kind count, lifecycle states, retention rules, vault folders, Obsidian lanes, vault text targets, RAG metadata fields, and GitHub project bridge paths.
- Added the storage contract strip to `PiccoloPanel` inside Automation Hygiene instead of creating a new surface.
- Added a targeted mutation guard test proving the receipt does not write artifacts, cleanup candidates, or approvals.
- Updated `CEREBRO_BUILD_QUEUE.md` with this Block C progress.

### Files Touched
- `app/server/routers/piccolo.ts`
- `app/server/piccolo.storageContract.test.ts`
- `app/client/src/components/PiccoloPanel.tsx`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/piccolo.storageContract.test.ts server/knowledge/contracts.test.ts --pool=forks --fileParallelism=false` passed: 5 tests.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md app/server/routers/piccolo.ts app/server/piccolo.storageContract.test.ts app/client/src/components/PiccoloPanel.tsx` passed.

### Cleanliness Read
- Current slice: Piccolo read-only storage contract receipt and Automation Hygiene UI.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: visual browser screenshot was not available through the current tool set; localhost responded with 200.

### Front-End Steward Review
- This follows the Sundesk lesson: show the useful read, hide the machinery.
- No new nav item, plugin wall, model console, or storage dashboard was added.
- The UI now says where knowledge goes without offering unsafe write controls.

### Completion Read
- Overall: 36%.
- Foundation/docs/planning: 88%.
- Frontend visible loop: 51%.
- Backend/runtime: 19%.
- Knowledge/storage/source: 31%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue Block C. Start by classifying the dirty worktree. Next slice: add a compact Project Lab storage/push readiness readout that uses the same contract language and keeps all writes approval-gated.

## 2026-05-14 1709 EDT - Knowledge Contract Source Of Truth Pass

### What Changed
- Added `app/server/knowledge/contracts.ts` as the backend source of truth for artifact kinds, lifecycle states, storage providers, retention rules, vault layout, Obsidian lanes, RAG metadata fields, and GitHub project bridge paths.
- Updated `app/server/integrations/vault.ts` to read vault and Obsidian route contracts from the centralized knowledge contract layer.
- Updated `app/server/routers/artifacts.ts` to read artifact schemas, vault text targets, default lifecycle state, and default retention rules from the same contract layer.
- Added targeted tests for the knowledge contract.
- Updated `CEREBRO_BUILD_QUEUE.md` so Block C progress is visible.

### Files Touched
- `app/server/knowledge/contracts.ts`
- `app/server/knowledge/contracts.test.ts`
- `app/server/integrations/vault.ts`
- `app/server/routers/artifacts.ts`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec vitest run server/knowledge/contracts.test.ts --pool=forks --fileParallelism=false` passed: 4 tests.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- Pending: final `git diff --check` before commit.

### Cleanliness Read
- Current slice: backend knowledge contracts plus narrow router imports.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no real vault, Obsidian, Notion, Slack, Drive, or vector writes were added.

### Front-End Steward Review
- This was a backend foundation slice for the visible storage contract.
- The UI did not change yet.
- The next UI move is to expose the storage contract as a readable Piccolo/Oak receipt instead of hiding it in docs.

### Completion Read
- Overall: 35%.
- Foundation/docs/planning: 88%.
- Frontend visible loop: 50%.
- Backend/runtime: 19%.
- Knowledge/storage/source: 29%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue Block C. Start by classifying the dirty worktree. Next slice: add a read-only storage contract receipt to the backend/router layer and surface it in the Keep without writing to the real vault.

## 2026-05-14 1702 EDT - Sundesk Archive Drift Cleanup

### What Changed
- Verified the canonical Sundesk project bridge exists at `10_Projects/Sundesk/Sundesk.md`.
- Verified the canonical Sundesk build history index exists at `90_Archive/Sundesk Build History/Sundesk Build History.md`.
- Removed the empty wrong root vault lane at `Sundesk/`.
- Moved the Sundesk repair note out of the active `Now` queue and into `Done Today` so CereBro does not treat it as current build work.

### Files Touched
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`
- Obsidian vault: removed empty `Sundesk/` directory.
- Obsidian archive: wrote dated CereBro handoff snapshot and appended the session-history index.

### Checks Run
- `rmdir` removed only the empty wrong root `Sundesk/` lane.
- `sed` verified the canonical Sundesk bridge note.
- `sed` verified the canonical Sundesk build-history index.
- `test ! -e .../obsidian-vault/Sundesk` confirmed the wrong root lane is absent.
- `git diff --check -- CEREBRO_BUILD_QUEUE.md CEREBRO_SESSION_HANDOFF.md` passed.

### Cleanliness Read
- Current slice: Sundesk archive drift cleanup and handoff/archive record.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: no Sundesk source checkout was found under the searched local paths; the Obsidian bridge points to `Bowgull/Sundesk`.

### Completion Read
- Overall: 34%.
- Foundation/docs/planning: 87%.
- Frontend visible loop: 50%.
- Backend/runtime: 18%.
- Knowledge/storage/source: 25%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the worker-led CereBro build path. Start by classifying the dirty worktree, then verify the Runtime Route Receipt to Workbench draft flow in browser when callable.

## 2026-05-14 1657 EDT - Worker Topology Route Draft Pass

### What Changed
- Set the active build method in `CEREBRO_WORKER_ORCHESTRATION.md`: this chat is Lead / Frontend Integrator; workers own backend runtime, frontend slices, knowledge/storage, and QA when capacity allows.
- Updated `CEREBRO_BUILD_QUEUE.md` with the active worker topology, integration order, and current route receipt slice.
- Dispatched three workers:
  - Backend Runtime Worker added `workbenchReceiptDraft` and `ledgerFocusDraft` to `runtime.previewRoute`.
  - Frontend Worker connected Runtime Route Receipt buttons to staged Workbench and Ledger session-storage payloads.
  - Knowledge Worker audited Obsidian/archive compliance and confirmed the queue needed updating.
- Lead integrated the backend draft fields into the frontend so Home uses the richer backend payload instead of rebuilding smaller local payloads.

### Files Touched
- `CEREBRO_WORKER_ORCHESTRATION.md`
- `CEREBRO_BUILD_QUEUE.md`
- `app/server/routers/runtime.ts`
- `app/server/runtime.routeReceipt.test.ts`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed: 2 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- CEREBRO_WORKER_ORCHESTRATION.md CEREBRO_BUILD_QUEUE.md app/client/src/pages/Home.tsx app/server/routers/runtime.ts app/server/runtime.routeReceipt.test.ts` passed.

### Worker Findings
- Backend worker: route drafts are preview-only and do not write DB rows.
- Frontend worker: Workbench and Ledger are staged through `sessionStorage`; no save call was added.
- Knowledge worker: handoff/archive rules are being followed; snapshots are growing large because each snapshot copies the accumulated handoff.
- QA worker was not spawned because the thread limit was reached. Lead ran local verification instead.

### Cleanliness Read
- Current slice: worker topology docs plus route receipt Workbench/Ledger draft handoff.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: browser visual QA is still unavailable from this tool set.

### Front-End Steward Review
- This is the better build method now in practice: lead integrates, workers own lanes, and the route receipt loop gets backend and frontend work without mixing files.
- Runtime Route Receipt now leads to Workbench as staged body and Ledger as audit focus.
- No browser, command, git, Slack, Notion, memory, model, provider, DB write, or external action was added.

### Known Risks
- Browser visual QA still needs to inspect the Runtime Route Receipt strip and Workbench draft intake.
- Handoff snapshots are append-only but large. Next knowledge/storage slice should address storage pressure without breaking history.
- Existing unrelated backend/Raven/reference files, an older Sundesk note in docs, and some non-current dirty files remain unstaged.

### Storage Impact
- No app data or schema changed.
- Workbench and Ledger use browser session storage only until the user clicks a save/create action.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 34%.
- Foundation/docs/planning: 86%.
- Frontend visible loop: 50%.
- Backend/runtime: 18%.
- Knowledge/storage/source: 25%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with lead plus worker lanes. Start by classifying the dirty worktree. Next slice: verify the Runtime Route Receipt to Workbench draft flow in browser when callable, then begin Block C storage contracts: artifact kinds, lifecycle states, retention rules, Obsidian lanes, RAG metadata fields, project bridge paths, and archive-only status without real vault writes in tests.

## 2026-05-14 1635 EDT - Ask Aang Dead Preview Cleanup Pass

### What Changed
- Removed the unused `IntakePreview` component from `Home.tsx`.
- Removed the old security helper functions that only existed for the retired intake preview.
- Confirmed the shell no longer references `IntakePreview`, `commandIntake.preview`, `securityTargetFor`, or `securityLabel`.

### Files Touched
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed: 2 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `rg -n "IntakePreview|commandIntake\\.preview|securityTargetFor|securityLabel" app/client/src/pages/Home.tsx` returned no matches.

### Cleanliness Read
- Current slice: Ask Aang dead preview cleanup plus handoff/archive.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: browser visual QA is still unavailable from this tool set.

### Front-End Steward Review
- Ask Aang now has one route preview surface instead of two.
- The UI reads cleaner and there is less dead code hiding old behavior.
- No browser, command, git, Slack, Notion, memory, model, provider, or external action was added.

### Known Risks
- Runtime route receipt still needs browser visual QA for compact/mobile wrapping.
- The route classifier is deterministic and intentionally simple.
- Existing unrelated backend/Raven/reference files, an older Sundesk note in docs, and `CEREBRO_BUILD_QUEUE.md` remain dirty and unstaged.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 33%.
- Foundation/docs/planning: 84%.
- Frontend visible loop: 48%.
- Backend/runtime: 16%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with longer safe passes. Start by classifying the dirty worktree. Next slice: make the route receipt available to Workbench as a staged receipt draft without auto-saving, then add Ledger focus from the runtime route receipt.

## 2026-05-14 1632 EDT - Ask Aang Runtime Route Unification Pass

### What Changed
- Ask Aang now uses `runtime.previewRoute` as the single visible route receipt source.
- Removed the duplicate live call to the older `commandIntake.preview` path from the shell submit flow.
- Runtime route receipts now include a task draft.
- The visible Runtime Route Receipt strip can create a task directly from the Aang -> Cortana route receipt.
- Kept the path preview-only. Task creation is the only user-triggered mutation and still uses the existing local Tasks router.

### Files Touched
- `app/server/routers/runtime.ts`
- `app/server/runtime.routeReceipt.test.ts`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed: 2 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Ask Aang route preview unification, task draft connection, focused tests, handoff/archive.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: browser visual QA is still unavailable from this tool set.

### Front-End Steward Review
- The bottom command path is now simpler: Ask Aang -> runtime route receipt -> optional local task.
- Workbench and Ledger remain visible next stops for receipt body and audit.
- No browser, command, git, Slack, Notion, memory, model, provider, or external action was added.

### Known Risks
- The old `IntakePreview` component still exists in `Home.tsx` but is no longer called. It can be deleted in a cleanup pass after confirming no hidden dependency.
- The route classifier is deterministic and intentionally simple.
- Visual browser inspection through the in-app browser was not callable in this tool set.
- Existing unrelated backend/Raven/reference files, an older Sundesk note in docs, and `CEREBRO_BUILD_QUEUE.md` remain dirty and unstaged.

### Storage Impact
- No schema changed.
- Optional Create Task writes only to the existing local Tasks table after user click.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 33%.
- Foundation/docs/planning: 84%.
- Frontend visible loop: 47%.
- Backend/runtime: 16%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with longer safe passes. Start by classifying the dirty worktree. Next slice: remove the unused `IntakePreview` dead code if safe, then make the route receipt available to Workbench as a staged receipt draft without auto-saving.

## 2026-05-14 1628 EDT - Runtime Route Receipt Preview Pass

### What Changed
- Added `runtime.previewRoute` as a local-only Aang -> Cortana route receipt preview.
- The route preview returns Aang read, Cortana route, owner/support agents, project, permission class, model/tool proposal, approval gates, Workbench body target, Ledger audit target, and next action.
- Added a visible Runtime Route Receipt strip above the Ask Aang bar.
- The strip links to Workbench and Ledger without creating tasks, receipts, memory, browser actions, commands, git actions, Slack writes, Notion writes, model calls, or external provider calls.
- Added focused route receipt tests.

### Files Touched
- `app/server/routers/runtime.ts`
- `app/server/routers.ts`
- `app/server/runtime.routeReceipt.test.ts`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app exec vitest run server/runtime.routeReceipt.test.ts --pool=forks --fileParallelism=false` passed: 2 tests.
- `pnpm -C app check` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `git diff --check -- app/server/routers/runtime.ts app/server/routers.ts app/server/runtime.routeReceipt.test.ts app/client/src/pages/Home.tsx` passed.

### Cleanliness Read
- Current slice: runtime route receipt backend contract, shell visibility, focused tests, handoff/archive.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: browser visual QA is still unavailable from this tool set.

### Front-End Steward Review
- This moves the visible loop from static UI promises into a backend contract.
- Aang reads. Cortana routes. Workbench owns the receipt body. Ledger owns the audit. Nothing acts yet.
- No new Code Lab was added. Terminal Lab remains the build-teaching lane.

### Known Risks
- The old `commandIntake.preview` and new `runtime.previewRoute` currently run side by side, so route copy may duplicate until the next pass unifies the UI around the runtime contract.
- The route classifier is deterministic and intentionally simple. It is a route receipt preview, not a model router.
- Visual browser inspection through the in-app browser was not callable in this tool set.
- Existing unrelated backend/Raven/reference files, an older Sundesk note in docs, and `CEREBRO_BUILD_QUEUE.md` remain dirty and unstaged.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 32%.
- Foundation/docs/planning: 84%.
- Frontend visible loop: 45%.
- Backend/runtime: 15%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with longer safe passes. Start by classifying the dirty worktree. Next slice: unify Ask Aang around `runtime.previewRoute`, reduce duplicate route preview UI, and connect Create Task to the route receipt fields without adding execution.

## 2026-05-14 1620 EDT - Workbench Ledger Receipt Body Pass

### What Changed
- Added a Receipt Body Read to Workbench receipt detail.
- Workbench now shows body, source, project link, validation state, Ledger receipt id, and next safe action before the long metadata list.
- Added Workbench route buttons for Ledger, Project, and Security. They set the same local focus receipts used by the rest of the visible loop.
- Added a selected receipt audit read to Ledger: body, project, validation, route, and next action.
- Kept Workbench and Ledger local/read-only. No browser action, git action, external write, schema change, or command execution was added.

### Files Touched
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. Vitest also ran related server files and reported 42 tests passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Workbench receipt body read plus Ledger audit read.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: browser visual QA is still unavailable from this tool set.

### Front-End Steward Review
- This completes the visible loop shape for Project Lab -> Terminal Lab -> Workbench -> Ledger at the UI contract level.
- Workbench owns the receipt body. Ledger owns the audit trail. Project Lab reads push context. Terminal Lab remains proposal-only.
- No new Code Lab was added.

### Known Risks
- Visual browser inspection through the in-app browser was not callable in this tool set. Computer Use was blocked from controlling Codex, and Playwright is not installed in the app workspace.
- The new Workbench and Ledger compact grids need mobile wrapping review in the browser.
- Existing unrelated backend/Raven/reference files, an older Sundesk note in docs, and `CEREBRO_BUILD_QUEUE.md` remain dirty and unstaged.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 31%.
- Foundation/docs/planning: 84%.
- Frontend visible loop: 43%.
- Backend/runtime: 12%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with longer safe passes. Start by classifying the dirty worktree. Next visible-loop slice: backend route receipts before agent execution. Build local-only Aang -> Cortana route receipt support that the UI can display before any model, browser, git, Slack, Notion, or command action runs.

## 2026-05-14 1614 EDT - Terminal Map Read Pass

### What Changed
- Updated Terminal Lab's Project Context rail into a Terminal Map Read that mirrors the Project Lab map shape.
- The rail now shows branch, dirty state, push readiness, Workbench receipt state, manual command boundary, execution state, and next safe action together.
- Added Project, Workbench, and Ledger route buttons in Terminal Lab's context rail.
- Kept Terminal Lab proposal-only. No command execution was added.

### Files Touched
- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. Vitest also ran related server files and reported 42 tests passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Cleanliness Read
- Current slice: Terminal Lab visible-loop rail plus handoff/archive.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: ignored `outputs/` stays out of status.
- Blocked: browser visual QA is still unavailable from this tool set.

### Front-End Steward Review
- This connects Terminal Lab back to Project Lab, Workbench, and Ledger without adding execution.
- No new Code Lab was added. Terminal Lab remains Aang's build-teaching lane.
- No external action, command execution, provider call, browser automation, git action, Notion write, Slack write, or memory write was added.

### Known Risks
- Visual browser inspection through the in-app browser was not callable in this tool set. Computer Use was blocked from controlling Codex, and Playwright is not installed in the app workspace.
- The Terminal context rail is denser than before and needs browser QA for wrapping.
- Existing unrelated backend/Raven/reference files, an older Sundesk note in docs, and `CEREBRO_BUILD_QUEUE.md` remain dirty and unstaged.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 30%.
- Foundation/docs/planning: 84%.
- Frontend visible loop: 40%.
- Backend/runtime: 12%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with longer safe passes. Start by classifying the dirty worktree. Next visible-loop slice: Workbench as receipt body. Make Workbench first read clearly show source/body, validation, linked project, Ledger audit route, and next safe action without adding external execution.

## 2026-05-14 1610 EDT - Long Pass Cleanliness Protocol

### What Changed
- Added a Long Pass Protocol to the worker orchestration file so CereBro can safely run 2-4 hour default blocks and 4-6 hour blocks when ownership and checks are clean.
- Added a Clean Worktree Protocol that classifies dirty files as current slice, quarantine, generated/local, or blocked before each longer pass.
- Updated the active build queue so the lead must classify dirty files before assigning workers and stage only the current slice.
- Added `outputs/` to `.gitignore` because local generated previews should not keep appearing as repo work. Durable generated deliverables belong in the Drive vault unless explicitly approved for the repo.

### Files Touched
- `.gitignore`
- `CEREBRO_WORKER_ORCHESTRATION.md`
- `CEREBRO_BUILD_QUEUE.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- Pending in this session: `git diff --check`.
- App checks are not required for documentation and ignore-file changes.

### Cleanliness Read
- Current slice: long-pass rules, clean-worktree rules, `outputs/` ignore.
- Quarantine: existing Raven/backend/reference changes remain untouched.
- Generated/local: `outputs/` contains local PixelLab preview files and is now ignored.
- Blocked: no current-slice blocker.

### Known Risks
- The quarantined Raven/backend batch is large and still needs its own review or commit decision.
- `CEREBRO_BUILD_QUEUE.md` and `CEREBRO_SESSION_HANDOFF.md` also contain an older Sundesk Obsidian repair note that is unrelated to this pass and should stay unstaged unless explicitly handled.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 29%.
- Foundation/docs/planning: 84%.
- Frontend visible loop: 38%.
- Backend/runtime: 12%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue with longer safe passes. Start by classifying the dirty worktree. Keep Raven/backend/reference drift quarantined unless the pass explicitly owns it. Next visible-loop slice: Terminal Lab as Aang's build-teaching lane connected to Project Map Read, Workbench receipt body, and Ledger audit trail without executing commands.

## 2026-05-14 1554 EDT - Project Lab Map Read Pass

### What Changed
- Added a compact Project Map Read strip to each Project Lab card.
- The strip shows branch, dirty state/count, push readiness, first risk, Workbench receipt state, manual push policy, optional auto proposal policy, and next safe action.
- Kept Project Lab read-only. The card still does not execute git.
- Kept manual push visible even when the detailed push receipt is collapsed.
- Renamed the auto toggle copy from an armed-sounding state to `Policy: manual` / `Policy: propose auto`.
- Used one read-only frontend QA worker to inspect Project Lab and fold in the policy/manual-push refinements.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. Vitest also ran related server files and reported 42 tests passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review
- This advances Project Lab as the map without adding backend behavior.
- Branch, dirty state, push readiness, risk, receipt, manual push, auto policy, and next action now appear together before the detailed push receipt.
- No new Code Lab was added. Terminal Lab remains the build-teaching lane.
- No external action, command execution, provider call, browser automation, git action, Notion write, Slack write, or memory write was added.

### Known Risks
- Visual browser inspection through the in-app browser was not callable in this tool set. Computer Use was blocked from controlling Codex, and Playwright is not installed in the app workspace.
- Project cards are dense. The new strip helps first scan, but browser QA is still needed to check laptop/mobile wrapping.
- Existing unrelated backend/Raven/reference files, `CEREBRO_BUILD_QUEUE.md`, and `outputs/` remain dirty and unstaged.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 29%.
- Foundation/docs/planning: 83%.
- Frontend visible loop: 38%.
- Backend/runtime: 12%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the visible loop. Next safe slice: visually inspect the Project Map Read and opened context rail in browser if callable; otherwise continue Terminal Lab as Aang's build-teaching lane by making command observations connect to the same Project Map Read, Workbench receipt body, and Ledger audit trail without executing commands.

## 2026-05-14 1548 EDT - Keep Visible Chain Pass

### What Changed
- Opened the right context rail by default so the first screen shows the route context instead of hiding it behind the Context button.
- Added a visible chain block to the context rail: Aang read, Cortana route, owner, receipt, approval, and next action.
- Replaced the old `Wired in Phase 6` rail placeholder with surface-specific next actions and direct buttons to Project Lab, Workbench, Ledger, and Approvals.
- Tightened the Ask Aang intake preview so it names Aang read, mode, Cortana route, owner, receipt, approval, and next action using existing preview data.
- Used one read-only frontend QA worker to inspect `Home.tsx` and confirm the shortest useful first-screen changes.

### Files Touched
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. Vitest also ran related server files and reported 42 tests passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK` after starting the dev server.

### Front-End Steward Review
- This keeps the Keep as the first surface and makes the visible loop readable before any backend runtime work.
- No new Code Lab was added. Terminal Lab remains the build-teaching lane.
- No external action, command execution, provider call, browser automation, git action, Notion write, Slack write, or memory write was added.

### Known Risks
- Visual browser inspection through the in-app browser was not callable in this tool set. Computer Use was blocked from controlling Codex, and Playwright is not installed in the app workspace.
- The context rail now opens by default and may squeeze the Keep on smaller widths; the user can still hide it.
- Existing unrelated backend/Raven/reference files, `CEREBRO_BUILD_QUEUE.md`, and `outputs/` remain dirty and unstaged.

### Storage Impact
- No app data or schema changed.
- Obsidian should receive a dated handoff snapshot and session-history index entry for this pass.

### Completion Read
- Overall: 28%.
- Foundation/docs/planning: 83%.
- Frontend visible loop: 36%.
- Backend/runtime: 12%.
- Knowledge/storage/source: 24%.
- Creative/freelance/watch: 8%.
- Confidence: medium.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue the Keep-first visible loop. Next safe slice: visually inspect the opened context rail and Ask Aang intake preview in the browser; if acceptable, move to Project Lab as map and make the project card first read match branch, dirty state, push readiness, risk, receipt, manual push, and optional auto policy.

## 2026-05-10 0646 EDT - Foundation Critical Path Reconciliation

### What Changed
- Reconciled `CEREBRO_SESSION_HANDOFF.md` back to the current committed handoff body after the worktree copy had drifted backward to an older session state.
- Added a hard current critical path gate to the master build plan so future workers do not treat the full roadmap as equal priority.
- Updated the active build queue so lead and workers start from the same foundation rule: handoff integrity first, then the visible CereBro loop.
- Preserved unrelated dirty backend, Raven, reference, and output files.

### Files Touched
- `CEREBRO_SESSION_HANDOFF.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_BUILD_QUEUE.md`

### Checks Run
- Pending in this session: `git diff --check`.
- App checks are not required for documentation-only changes unless a linked app file changes later in the same pass.

### Known Risks
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.
- `outputs/` remains untracked and was not inspected or staged.
- The critical path gate is now documented, but it still needs to be enforced during every worker assignment.

### Storage Impact
- This pass updates repo planning and handoff docs only.
- An append-only Obsidian handoff snapshot and session-history index entry should be written after verification.
- No app data, Notion, Slack, Drive artifacts, source records, memory, browser state, or external service was mutated.

### Next Session Starter
Read `AGENTS.md`, `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_WORKER_ORCHESTRATION.md`, `CEREBRO_BUILD_QUEUE.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, `CEREBRO_UX_SYSTEM.md`, and `CEREBRO_SESSION_HANDOFF.md`. Continue as CereBro lead build agent. Enforce the current critical path gate: handoff integrity first, then Keep-first visible loop, then Project Lab, Terminal Lab, Workbench, Ledger, knowledge contracts, backend route receipts, and only then broader runtime. Preserve unrelated dirty files.

## 2026-05-09 1336 EDT - Design Review Boundary Pass

### What Changed
- Tightened Design Review checklist controls so each toggle is labeled as a local design checklist item.
- Save Review now states required fields when disabled and states it saves a local design review receipt without patching code or opening tools.
- Confirmed the gate list renders one line per gate.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/DesignReviewPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: visual density and copy audit across the main front-end spine, then use Browser Use if callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1333 EDT - Skills Manager File Boundary Pass

### What Changed
- Tightened Skills Manager editor save so it states it writes an agent or skill file in the selected Claude Code scope.
- Scope buttons now state global vs project scope before file operations.
- Refresh now states it only reloads local lists and does not create, update, or delete files.
- New, copy, edit, and delete buttons now distinguish editor-open, clipboard copy, file-write, and hard-gated delete.
- Delete confirmation now states the file is permanently deleted from the selected Claude Code scope.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/SkillsManager.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` first run hit transient `SQLITE_BUSY`; immediate rerun passed 42 tests.
- `pnpm -C app exec tsc --noEmit --pretty false` rerun after final formatting cleanup.
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.
- Skills Manager still writes files directly on Save; future UX should add an explicit hard-gate save confirmation if this surface remains in V1.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: visual density and copy audit across Project Lab, Terminal Lab, Workbench, Ledger, Security, Approval, Hedwig, and Skills Manager, then use Browser Use if callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1331 EDT - Basement Registry Boundary Pass

### What Changed
- Tightened Model Tools capability rows so inspection is labeled as local proposal review with no provider/tool call.
- Model/tool proposal creation now states it creates a local proposal only.
- Eval note recording now states it records a local note and does not call providers.
- Aang Companion local state controls now state they are local preview state only and do not change notification channels.
- Aang event navigation now states it opens a local read and does not trigger notifications.
- Config bridge copy buttons now state they copy secrets/commands and do not run commands.
- Skills Manager intentionally deferred because it writes skill files and needs its own hard-gate pass.

### Files Touched
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/components/AangCompanionPanel.tsx`
- `app/client/src/components/ConfigPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` first run hit transient `SQLITE_BUSY`; immediate rerun passed 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.
- Skills Manager still needs a dedicated hard-gate and destructive-action pass before it is treated as normalized.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: hard-gate Skills Manager create/update/delete actions because that surface writes skill files, then visually inspect main surface density when Browser Use is callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1329 EDT - Hedwig Local Proposal Boundary Pass

### What Changed
- Tightened Hedwig capture preview so it states no Notion, Slack, task, reminder, or message write runs.
- Local capture actions now distinguish triage read, source detail read, and Security Gate routing.
- Triage proposal actions now state local task/source/reminder/message creation boundaries.
- Proposal detail Security Gate routes now state they gate source enrichment, sync, or external target actions before anything external happens.
- Proposal status, review save, and approval preview actions now state they remain local until approval.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` first run hit transient `SQLITE_BUSY`; immediate rerun passed 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: do a compact visual-density and copy pass across the main front-end spine, or inspect current localhost visually if Browser Use is callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1327 EDT - Ledger Utility Boundary Pass

### What Changed
- Tightened Tasks so add/status/delete actions read as local task receipts with hard-gate deletion.
- Tightened Sessions so run ledger edits state they do not change the run transcript.
- Tightened Piccolo so Save Report opens and confirms a hard-gated vault write only.
- Piccolo report write now states it does not move, archive, or delete files.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/PiccoloPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: tighten Hedwig capture/proposal actions for local-vs-external boundaries, then visually inspect main surface density when Browser Use is callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1325 EDT - Source Output Memory Boundary Pass

### What Changed
- Tightened Surfer source actions so research preview states no browsing and source ingest states one approved public fetch.
- Security route from Surfer now says it opens Security Gate before ingest.
- Output save now states whether it writes an Obsidian note or vault artifact and records the output receipt.
- Memory proposal now states it stages a local proposal, not canonical memory.
- Memory delete now opens and confirms through the hard-gate language.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: visual density and wording pass across the main front-end spine, or tighten task/session panels for receipt-boundary consistency. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1323 EDT - Gate Surface Boundary Pass

### What Changed
- Tightened Security Gate controls so Inspect is explicitly local string review and Record Receipt is explicitly local receipt creation.
- Approval Dashboard reset now states it does not approve, reject, or change previews.
- Approval group filters now state they filter local previews without running approval actions.
- Approval-to-Security routes now state Approval Dashboard does not execute the target.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/SecurityGatePanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: visually inspect the Project Lab, Workbench, Terminal Lab, Approval, and Security gate density if Browser Use is callable, otherwise continue small boundary-label consistency on source/output/memory surfaces. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1321 EDT - Terminal Lab Teaching Boundary Pass

### What Changed
- Tightened Terminal Lab command preview routing so Security Gate states Terminal Lab does not run commands.
- Tony diagnostic draft preview now states it saves a preview observation and does not execute the draft command.
- Teach now states it opens Aang's teaching frame for the selected observation.
- Observed output save now explains missing inputs and confirms it saves only a redacted local summary.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: inspect Terminal Lab observation row density or move to Approval/Security surfaces for boundary-label consistency. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1320 EDT - Workbench Receipt List Boundary Pass

### What Changed
- Tightened Workbench receipt list controls so scan-view actions show their boundaries.
- Reset filters now states it clears filters without changing receipts.
- Receipt group buttons now state they filter local receipts without fetching sources or running commands.
- Receipt rows now state they open only the local receipt body and show an `opens body only` marker.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: move to Terminal Lab teaching-language boundaries or inspect Workbench density visually when Browser Use is callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1319 EDT - Workbench Receipt Action Label Pass

### What Changed
- Tightened Workbench receipt actions so buttons name the exact append or route operation.
- Save Local Receipt now explains required fields and confirms no capture or external action runs.
- Security Gate routing from a receipt now explains Workbench does not browse, clone, install, or execute.
- Before/after and validation append buttons now say Append Comparison and Append Validation.
- Disabled append hover text now names the missing input and preserves append-only semantics.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: tighten Workbench receipt list or Terminal Lab teaching-language boundaries, then visually verify in localhost when Browser Use is callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1317 EDT - Project Lab Push Mode Boundary Pass

### What Changed
- Added a compact manual/auto push mode strip to each Project Lab card.
- Manual push is now visibly separate as approval-gated and readable only.
- Auto push is now visibly framed as a selected recommendation, not execution.
- Added hover copy to push readiness controls stating Project Lab does not run git.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: inspect Project Lab card density in the open localhost tab when Browser Use is callable, then continue Workbench/Ledger receipt body clarity or Terminal Lab teaching-language polish. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1315 EDT - Ledger Receipt Action Boundary Pass

### What Changed
- Tightened the Ledger selected Workbench receipt preview so its route actions declare their boundaries.
- Added read-only audit trail labeling to the selected receipt path.
- Compact target metadata now uses the shared display label helper while preserving the full target in hover text.
- Added title and aria-label copy for the Workbench and Project Lab Ledger actions so they explain what opens and what does not run.
- Backend semantics unchanged.

### Files Touched
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run
- `pnpm -C app exec tsc --noEmit --pretty false`
- `pnpm -C app check`
- `pnpm -C app test -- server/cerebro-foundations.test.ts` (42 tests passed)
- `curl -I --max-time 5 http://localhost:3002/` (200 OK)

### Known Risks
- Browser Use is still not callable in this session, so visual DOM proof remains pending in the open localhost tab.
- Existing unrelated dirty backend/Raven/reference files remain untouched and unstaged.

### Storage Impact
- Added a new append-only Obsidian handoff snapshot and index entry.

### Next Session Starter
Continue as CereBro front-end building agent. Stay on the front-end critical path. Next best slice: continue small Workbench/Ledger density work or move to Project Lab card push-context clarity, with Browser Use visual proof when callable. Do not create a Code Lab. Terminal Lab remains the build teaching lane.

## 2026-05-09 1256 EDT - Terminal Lab Action Boundary Pass

### What Changed

- Added title and aria-label explanations to Terminal Lab observation action buttons.
- Review, Block, Archive, Task, and link buttons now explain when their disabled state is already satisfied or missing a selected target.
- Approval and Security buttons now state they create local approval preview or open Security Gate without running the command.
- Workbench Body and Ledger Trail buttons now state the route boundary when unavailable and the receipt/audit target when available.
- Kept Terminal Lab proposal-only. No command execution path was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This reinforces Terminal Lab as Aang's build-teaching lane, not an executor.
- It makes approval, Security Gate, Workbench receipt body, and Ledger audit trail boundaries visible at the button level.
- It does not add execution, routing, schema, storage, or backend behavior.

### Known Risks

- Browser visual verification still needs Browser Use when callable.
- Button titles are helpful but not a replacement for a future visual QA pass.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify Terminal Lab action boundary states when Browser Use is callable; if unavailable, continue with a small Workbench or Ledger density pass that improves receipt body or audit-trail clarity without backend changes. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1254 EDT - Project Lab Push Boundary Pass

### What Changed

- Tightened Project Lab push-context copy around manual push, automatic recommendation, and read-only state.
- Changed the push mode button from `Manual` / `Auto armed` to `Manual visible` / `Auto selected`.
- Added title text that explains automation is recommendation-only and approval-gated.
- Renamed the push readiness button from `Receipt` to `Read` so it does not imply a new receipt is created.
- Added a `preview only` badge and note to Manual Push commands: Project Lab never runs git.
- Kept backend semantics and push readiness data unchanged.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This keeps Project Lab as push context, not execution.
- It preserves the user-approved idea that automatic push can be selectable while manual push remains visible.
- It makes the no-git boundary visible in the same place the manual commands appear.
- It does not add execution, routing, schema, storage, or backend behavior.

### Known Risks

- Browser visual verification still needs Browser Use when callable.
- Other Project Lab action labels may need another density pass after visual review.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify Project Lab push boundary states when Browser Use is callable; if unavailable, continue with a small Project Lab or Workbench density pass only where it improves receipt bodies, push context, or manual approval clarity. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1252 EDT - Workbench Receipt Detail State Pass

### What Changed

- Tightened Workbench receipt body empty states for permission preflight, validation trail, comparison trail, and comparison picker filters.
- Missing preflight now points to Security Gate when the receipt target/source/command/package needs risk review.
- Missing validation now tells the user to append a local validation note before treating the receipt as checked.
- Missing comparison now tells the user to pick another local receipt and append a comparison.
- Disabled append buttons now expose title text for the most predictable missing input.
- Kept backend semantics and internal `evidence` API names unchanged.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This keeps Workbench as receipt-body owner and makes receipt detail states more explicit.
- It keeps Security Gate as the risk-review path without auto-running anything.
- It does not add execution, routing, schema, storage, or backend behavior.

### Known Risks

- Browser visual verification still needs Browser Use when callable.
- Other non-critical receipt detail states may need the same treatment later.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify Workbench receipt detail states when Browser Use is callable; if unavailable, continue with a small Project Lab push-context density pass that improves manual push/readiness clarity without changing backend semantics. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1239 EDT - Receipt Empty State Action Pass

### What Changed

- Tightened receipt-loop empty states so they name the next action, not only the missing object.
- Workbench project receipt empty state now directs the user to save and link a local receipt before using push context.
- Workbench receipt list empty state now directs the user to pick a lane, name the observation, and save a local receipt.
- Ledger overview empty state now routes the user to Workbench Bodies to create the first receipt.
- Terminal Lab empty state now tells the user to paste, preview, then save the receipt body.
- Terminal Lab disabled Task and Session filters now expose a title and aria-label explaining what must be selected first.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This follows the UX law: empty states give the next action.
- It keeps Workbench as receipt body owner, Ledger as audit trail, Project Lab as push context, and Terminal Lab as teaching lane.
- It does not add execution, routing, schema, storage, or backend behavior.

### Known Risks

- Browser visual verification still needs Browser Use when callable.
- Other non-critical panels may still have weaker empty states; this slice touched the active receipt-loop path only.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify receipt-loop empty/loading/disabled states when Browser Use is callable; if unavailable, continue with a small Project Lab or Workbench state-density pass only where it directly supports push context and receipt bodies. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1237 EDT - Receipt Chip Overflow Pass

### What Changed

- Wrapped receipt-loop badge labels in truncating spans so the tightened Badge primitive can constrain long labels.
- Updated Workbench and Terminal Lab local `Chip` helpers.
- Updated Project Lab receipt status badges, push decision label, and chip rows.
- Updated Ledger receipt preview badges and shell preview chips in `Home.tsx`.
- Kept backend semantics and internal `evidence` API names unchanged.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This finishes the local surface cleanup created by the shared Badge primitive change.
- Long project, session, kind, status, and receipt labels now have title text and truncate inside their badges.
- This supports dense receipt rows without changing data shape, routing, execution, or storage.

### Known Risks

- Browser visual verification still needs Browser Use when callable.
- Other non-critical panels may still pass raw Badge text; this slice only touched the active receipt-loop path.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify primitive and badge truncation states when Browser Use is callable; if unavailable, continue by tightening receipt-loop surface empty/loading/disabled states without changing backend semantics. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1234 EDT - Primitive Focus Density Pass

### What Changed

- Tightened shared UI primitives used by the receipt-loop surfaces.
- Added shell-offset focus rings to buttons, badges, inputs, textareas, selects, tabs, dialogs, and drawers.
- Strengthened disabled affordance on buttons, badges, inputs, textareas, and selects.
- Made hard-gate dialogs visually louder with an amber ring while keeping the 8px max modal radius.
- Added compact grouped-menu separation and minimum item height to dropdown and context menus.
- Added table row focus-within state and bounded table-cell width for dense receipt and Ledger rows.
- Kept backend semantics unchanged.

### Files Touched

- `app/client/src/components/ui/button.tsx`
- `app/client/src/components/ui/card.tsx`
- `app/client/src/components/ui/dialog.tsx`
- `app/client/src/components/ui/drawer.tsx`
- `app/client/src/components/ui/dropdown-menu.tsx`
- `app/client/src/components/ui/context-menu.tsx`
- `app/client/src/components/ui/input.tsx`
- `app/client/src/components/ui/textarea.tsx`
- `app/client/src/components/ui/select.tsx`
- `app/client/src/components/ui/tabs.tsx`
- `app/client/src/components/ui/badge.tsx`
- `app/client/src/components/ui/table.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This keeps the primitive layer within CereBro token language: dark shell surfaces, compact density, visible focus, destructive/risk states, disabled states, grouped menus, and hard-gate modal shape.
- It does not add a new surface or change any route semantics.
- It supports the locked path by improving Project Lab, Terminal Lab, Workbench, Ledger, and system panels through shared controls.

### Known Risks

- Browser visual verification still needs Browser Use when callable.
- Table cell max width may expose places that need explicit truncation or wrapping in a later visual pass.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify primitive focus/density states when Browser Use is callable; if unavailable, continue by tightening receipt-loop surface layout where shared primitives now reveal overflow or weak state language. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1218 EDT - Design Law Receipt Alignment

### What Changed

- Updated `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, and `CEREBRO_UX_SYSTEM.md` so future front-end passes inherit receipt-body, source, and audit-trail language.
- Removed visible `proof/evidence` wording from the active front-end law docs.
- Clarified that Workbench owns receipt bodies, Ledger owns audit trail, and inspected sources remain distinct from receipts.
- Did not touch backend API names, data model names, or runtime behavior.

### Files Touched

- `DESIGN.md`
- `CEREBRO_FRONTEND_SYSTEM.md`
- `CEREBRO_UX_SYSTEM.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `rg -n "\b(evidence|Evidence|proof|Proof)\b" DESIGN.md CEREBRO_FRONTEND_SYSTEM.md CEREBRO_UX_SYSTEM.md` returned no matches.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser Use was still not callable in this context, so visual DOM proof remains pending in the open localhost tab.

### Front-End Steward Review

- This reduces future drift by aligning the law files with the visible receipt-loop UI.
- It preserves the approved build path: Project Lab as map, Terminal Lab as teaching lane, Workbench as receipt body, Ledger as audit trail.
- It keeps source inspection separate from receipt creation.
- No plugin surface, Code Lab surface, or backend runtime path was added.

### Known Risks

- `CEREBRO_MASTER_BUILD_PLAN.md` still contains historical `proof/evidence` wording in many places. It was not rewritten in this slice because it mixes current law, build history, and long-range plan language.
- Internal app code still uses `evidence` names until a deliberate model migration is approved.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, and CEREBRO_SESSION_HANDOFF.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: tighten shared primitive density/focus/disabled/risk states where the receipt-loop surfaces use button, card, dialog, drawer, dropdown-menu, context-menu, input, textarea, select, tabs, badge, and table. Keep backend semantics unchanged. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1214 EDT - Receipt Language Surface Sweep

### What Changed

- Aligned user-facing copy across UI System, Design Review, Terminal Lab, Workbench, Project Lab, Tasks, Security Gate, Config, Model/Tools, and the Keep fortress map.
- Replaced visible proof/evidence wording with receipt, receipt body, audit trail, build support, or push context where that matches the surface owner.
- Kept internal `evidence` API, router, and model field names intact.
- Kept Terminal Lab proposal-only and Project Lab read-only. No execution path was added.

### Files Touched

- `app/client/src/components/UISystemPanel.tsx`
- `app/client/src/components/DesignReviewPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/SecurityGatePanel.tsx`
- `app/client/src/components/ConfigPanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/lib/keepFortressMap.ts`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `rg -n "\b(Evidence|evidence|Proof|proof)\b" app/client/src/components app/client/src/pages/Home.tsx app/client/src/lib` now shows only internal API/model identifiers, one diagnostic value key, and backend-shaped query names.
- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed. 4 files, 42 tests.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- Receipt language is now more consistent across the current front-end build path.
- Workbench owns receipt bodies.
- Ledger owns audit trail language.
- Project Lab owns push context.
- Terminal Lab teaches from observations and receipts without executing commands.

### Known Risks

- Internal code still uses `evidence` names until a deliberate data-model migration is approved.
- Design Review still stores `proofSummary` internally because that is the existing field name.
- Browser visual verification still needs Browser Use when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write was added.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as receipt body -> Ledger as audit trail. Next safe slice: visually verify the receipt language sweep when Browser Use is callable; if unavailable, continue by tightening layout density and focus/disabled states on the receipt-loop surfaces without changing backend semantics. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1209 EDT - Ledger Receipt Route Language

### What Changed

- Tightened Ledger overview and shell copy to use receipt/body/audit language consistently.
- Workshop blurb and Workbench surface metadata now say receipts and receipt body surface.
- Ledger overview now says Receipt before summary and names Workbench body, Ledger audit trail, and Project Lab push context.
- Ledger receipt card meta now says terminal receipts.
- Workbench handoff notice from Ledger now says Workbench receipt.
- Ledger object aria labels and selected receipt preview now use receipt/audit terms.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `rg` found no remaining stale Ledger strings for Evidence surface, Do the work with evidence, Proof read, terminal proof records, Ledger evidence receipt, recent evidence manually, Proof before summary, Ledger proof objects, Open Workbench, Selected evidence receipt preview, Receipt Rules, or `label: "Evidence"`.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps Ledger as the audit trail owner and makes the route to Workbench body and Project Lab push context clearer.
- Workbench remains the receipt body owner. Project Lab remains the push context owner. Terminal Lab remains the teaching lane.
- No data shape, route behavior, or execution behavior changed.
- Manual push remains visible and separate. No hidden execution path was added.

### Known Risks

- Internal code names still use `evidence` because the router/database model is named that way.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Ledger.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Ledger receipt route language when Browser Use is callable; if unavailable, audit the current receipt-loop surfaces for remaining user-facing `evidence/proof` wording and tighten only copy that does not rename API/model concepts. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1207 EDT - Workbench List Receipt Language

### What Changed

- Updated Workbench list and form copy from evidence wording to receipt wording where it is user-facing.
- Lanes now stage receipts.
- Add form now says Add Receipt, Receipt kind, Receipt title, Save Local Receipt, and receipt-sensitive labels.
- Recent list now says Recent Receipts, receipt groups, receipt filters, and local receipts.
- Draft and filter notices now say Workbench receipt.
- This is copy alignment only. Internal `evidence` API, type, and route names were not renamed.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `rg` found no remaining stale Workbench list/form strings for Evidence Record, Add Evidence, Recent Evidence, Evidence Groups, Evidence kind/title/target/summary, Search evidence, Save Local Evidence, local evidence only, Append evidence, Stage evidence, proof draft, Saved evidence, No Workbench evidence, Inspect Workbench evidence, Filter Workbench evidence, Group evidence, Evidence records append, or Mark evidence.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This makes Workbench read as the receipt body owner across list, form, grouping, and detail surfaces.
- Ledger remains the audit trail owner. Project Lab remains the push context owner. Terminal Lab remains the teaching lane.
- Workbench remains local and append-only.
- Manual push remains visible and separate. No hidden execution path was added.

### Known Risks

- Internal code names still use `evidence` because the router/database model is named that way.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Workbench.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Workbench Add Receipt, Recent Receipts, and receipt detail language when Browser Use is callable; if unavailable, continue by tightening Ledger overview copy so receipt cards and route actions use the same Workbench body / Ledger audit / Project push context language. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1204 EDT - Workbench Detail Receipt Language

### What Changed

- Updated Workbench detail panel copy to use receipt body, validation trail, comparison trail, and audit language.
- Empty states now say receipt instead of evidence record where the user is reading a saved body.
- Before/after labels now say before receipt and after receipt.
- Validation append and comparison append controls now say they create local receipts.
- This is copy alignment only. No data shape, routing behavior, or execution behavior changed.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `rg` found no remaining stale Workbench detail strings for reading evidence detail, selecting evidence record, evidence detail aria label, before/after evidence, history headings, local evidence picker, original evidence, new evidence record, or compare with evidence.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps Workbench as the receipt body owner and makes the body/audit model explicit in detail views.
- Ledger remains the audit trail owner. Project Lab remains the push context owner. Terminal Lab remains the teaching lane.
- Workbench remains local and append-only.
- Manual push remains visible and separate. No hidden execution path was added.

### Known Risks

- This pass targeted Workbench detail copy; broader Workbench list/form labels still use some data-model evidence terms.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Workbench.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Workbench detail receipt body/trail language when Browser Use is callable; if unavailable, continue by tightening Workbench list/form language from Evidence to Receipt where it is user-facing and does not rename data model APIs. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1201 EDT - Aang Receipt Language Alignment

### What Changed

- Updated Terminal Lab's Aang teaching frame to use receipt language instead of older proof/evidence wording.
- Observation lessons now refer to Workbench receipt bodies, Ledger trails, and validation state.
- Workbench draft titles staged from Terminal Lab now use Terminal receipt naming.
- Workbench filter notices from Terminal Lab now say Workbench receipt.
- The Aang teaching frame label now says Receipt instead of Proof.
- This is copy alignment only. No data shape, routing behavior, or execution behavior changed.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `rg` found no remaining stale Terminal Lab strings for `Workbench evidence`, `proof receipt`, `Workbench proof`, `Terminal proof`, `Open Proof`, `title="Proof"`, `proof link`, or `proof summary`.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps Terminal Lab as Aang's teaching lane while matching the Workbench/Ledger/Project Lab receipt model.
- Workbench remains the receipt body owner. Ledger remains the audit trail owner. Project Lab remains the push context owner.
- Terminal Lab remains proposal-only and does not execute commands.
- Manual push remains visible and separate. No hidden execution path was added.

### Known Risks

- This pass only changed Terminal Lab wording; other surfaces may still expose `evidence` where the data model name appears.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Terminal Lab.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Terminal Lab Aang Receipt frame and Project Context receipt summary when Browser Use is callable; if unavailable, continue by tightening Workbench detail copy so validation notes and before/after comparisons use receipt/body/audit language consistently. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1159 EDT - Terminal Project Receipt Summary

### What Changed

- Added Workbench receipt summary state to Terminal Lab's Project Context rail.
- The rail now shows project-level receipt totals, terminal receipts, receipts needing review, and validated receipts.
- The rail repeats the ownership rule: Workbench has the body, Ledger has the audit trail, Project Lab reads push context.
- The summary is read-only and derived from existing Workbench receipt data.
- This does not run commands, stage files, commit, push, or alter app data.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This lets Aang read project proof state while staying inside Terminal Lab's teaching lane.
- Workbench remains the receipt body owner. Ledger remains the audit trail owner. Project Lab remains the push context owner.
- Terminal Lab remains proposal-only and does not execute commands.
- Manual push remains visible and separate. No hidden execution path was added.

### Known Risks

- The rail uses the latest 100 Workbench receipts as a client-side summary.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Terminal Lab.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Terminal Lab Project Context receipt summary when Browser Use is callable; if unavailable, continue by tightening Aang teaching copy so command observations use Workbench body / Ledger trail / Project push context language consistently. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1156 EDT - Terminal To Ledger Receipt Trail

### What Changed

- Added a Ledger Trail action to Terminal Lab observations that already have saved Workbench receipts.
- Terminal Lab now labels saved terminal proof as Workbench receipt/body language instead of generic proof language.
- Ledger reads a temporary Terminal Lab focus receipt and selects the exact Workbench receipt preview.
- Ledger shows a dismissible focus notice explaining which Terminal Lab observation opened the receipt.
- This is read-only navigation. It does not run commands, stage files, commit, push, or alter app data.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This closes the read-only path from Terminal Lab command observation to Workbench receipt body and Ledger audit trail.
- Terminal Lab remains proposal-only and teaching-oriented.
- Ledger remains the audit trail owner. Workbench remains the receipt body owner.
- Manual push remains visible and separate. No hidden execution path was added.

### Known Risks

- The Ledger focus handoff uses temporary `sessionStorage`, not durable state.
- If the receipt is outside Ledger's latest 50 Workbench receipt query, the selected id may not be present in the preview list.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Terminal Lab or Ledger.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Terminal Lab -> Ledger Trail and Ledger focus receipt behavior when Browser Use is callable; if unavailable, continue by adding read-only receipt status summaries to Terminal Lab's Project Context rail without executing commands. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1153 EDT - Receipt Language Alignment

### What Changed

- Aligned receipt language across Ledger, Workbench, and Project Lab.
- Ledger now labels the evidence block as Latest Workbench Receipts.
- Ledger's selected receipt preview now names the path: Workbench body, Ledger audit trail, Project Lab push context.
- Project Lab now says Workbench Receipts instead of Workbench Proof.
- Workbench's project grouping now says Project Receipts while preserving proof-state meaning.
- This is copy and navigation-language alignment only. No data shape or execution behavior changed.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps the proof loop legible: Workbench owns receipt bodies, Ledger owns audit trail, Project Lab owns push context.
- It supports the future push-to-GitHub UI by giving the user the same nouns across surfaces.
- Manual push remains visible and separate. No hidden execution path was added.
- Terminal Lab remains the code/build teaching lane. No new Code Lab surface was added.

### Known Risks

- The terminology is now more consistent, but visual verification still needs the Browser Use plugin when callable.
- Some older surfaces may still use generic "evidence" where the data model name is exposed.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this UI language pass.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Ledger, Workbench, and Project Lab receipt language when Browser Use is callable; if unavailable, continue by tightening the read-only path between Terminal Lab command observations and Ledger receipts without executing commands. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1151 EDT - Ledger To Project Push Context

### What Changed

- Added a Project Push Context action to Ledger's selected evidence preview.
- The action opens Project Lab with a temporary focus receipt from Ledger.
- Project Lab reads the focus receipt, selects the matching project, opens its push-readiness receipt, and switches the inspector to Git context.
- Project Lab shows a dismissible Ledger focus notice so the user can see why the card opened.
- This is read-only navigation. It does not run git, stage files, commit, push, or alter app data.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps Ledger as the receipt surface and Project Lab as the push decision map.
- Workbench still owns receipt bodies. Ledger can now route a receipt to project push context.
- Manual push remains visible and separate. No hidden execution path was added.
- Terminal Lab remains the code/build teaching lane. No new Code Lab surface was added.

### Known Risks

- The Project Lab focus handoff uses temporary `sessionStorage`, not durable state.
- Receipts without a linked project open Project Lab with a notice but cannot select a project.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Ledger or Project Lab.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Ledger -> Project Push Context and Project Lab push receipt focus when Browser Use is callable; if unavailable, continue by tightening read-only proof terminology in Ledger/Workbench so receipts, validation, and push-readiness use the same labels. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1142 EDT - Project Lab Push Decision Read

### What Changed

- Added a Push Decision Read note to each Project Lab project card.
- The note reads Workbench proof counts already shown on the card.
- It distinguishes hold, proof missing, proof present, and supported states.
- It points the user to Workbench for receipt bodies and Ledger for the audit trail.
- It keeps push execution separate. No git command is run or hidden behind the UI.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps Project Lab as the map and Workbench/Ledger as proof/receipt owners.
- The card now explains why a push should wait, why proof is missing, or why existing proof supports the current push-readiness state.
- Manual push remains visible. Auto-push remains approval-gated and non-executing here.
- Terminal Lab remains the code/build teaching lane. No new Code Lab surface was added.

### Known Risks

- The Push Decision Read uses UI-level Workbench proof counts from the latest 100 evidence records.
- Push readiness logic still comes from `projectIntelligence`, while proof state is summarized in Project Lab.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Project Lab.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Project Lab Push Decision Read and Workbench Project Proof when Browser Use is callable; if unavailable, continue by making Ledger's latest evidence receipt preview link back to project push context without executing git. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1139 EDT - Workbench Project Proof Grouping

### What Changed

- Added a Project Proof band inside Workbench.
- The band reads the latest local Workbench evidence receipts and groups them by project.
- Each project group shows total receipts, terminal receipts, records needing review, validated records, and latest receipt id/title.
- Clicking a project proof group filters Recent Evidence to that project and sets grouping back to Project.
- This is read-only proof navigation. It does not run commands, push git, open browsers, fetch sources, or create a new lab.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm -C app check` passed.
- `pnpm -C app test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `pnpm check` from repo root failed because `/Users/lindsaybell/Desktop/CereBro` has no root package manifest. The app package check was run instead.
- Browser plugin inspection was not callable in this context, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This follows the locked path: Workbench as proof, Ledger as receipts, Project Lab as map.
- It supports the future push-to-GitHub UI by making project proof state visible before push decisions.
- Manual push remains separate. Auto-push remains a later approval-gated option, not behavior here.
- Terminal Lab stays the code/build teaching lane. No new Code Lab surface was added.

### Known Risks

- Project Proof uses the latest 100 Workbench evidence records, not a server-side aggregate endpoint.
- The band is visual proof navigation only. Push readiness logic still lives in Project Lab until a later slice.
- Browser visual verification still needs the Browser Use plugin when callable.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Workbench.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Workbench Project Proof and Project Lab proof strips when Browser Use is callable; if unavailable, continue proof-loop work by adding read-only push-decision language to the Project Lab card that points at Workbench/Ledger proof without executing git. Run app checks, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1136 EDT - Project Lab Workbench Proof Signals

### What Changed

- Project Lab now reads local Workbench evidence receipts.
- Added a Proof stat to the Project Lab summary rail.
- Project cards now show Workbench proof receipt counts, terminal proof counts, needs-review count, and validated count.
- Added a compact Workbench Proof strip to each project card.
- No command execution, git execution, external write, durable memory write, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed after replacing a local missing `Chip` helper with existing `Badge` primitives.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This brings Workbench proof state back into Project Lab as the project map.
- Project Lab now knows whether a project has proof receipts and how much is still waiting for review.
- Workbench remains the proof owner; Project Lab only summarizes receipt state.
- The flow remains read-only and local.

### Known Risks

- Project Lab reads the latest 100 Workbench evidence records. A dedicated project-proof rollup endpoint may be cleaner later.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: visually verify Project Lab proof strips and Ledger evidence receipts when Browser Use is callable, then tighten spacing only if needed. If unavailable, continue proof-loop work by adding read-only project proof grouping to Ledger or Workbench without adding a new primary surface or executing commands.
```

## 2026-05-09 1133 EDT - Terminal Teaching Uses Workbench Proof Status

### What Changed

- Terminal Lab teaching now reads saved Workbench terminal evidence for the selected observation.
- Aang's Proof and Next Safe Step fields now name the Workbench evidence id and validation status when a saved receipt exists.
- Observation rows now show a compact Workbench proof line with receipt id and validation status.
- Missing proof now says a Workbench receipt is still needed instead of treating output alone as enough.
- No command execution, git execution, external write, durable memory write, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This closes the proof loop back into Aang's teaching layer.
- Terminal Lab can now distinguish output, proof receipt, and validation status.
- The flow remains read-only and local.
- Workbench remains the proof owner; Terminal Lab only reflects its receipt state.

### Known Risks

- Terminal Lab reads the latest 50 terminal-output evidence records. A dedicated lookup endpoint may be cleaner later.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: bring Workbench proof counts/status into Project Lab context or Ledger grouping, without adding a new primary surface or executing commands.
```

## 2026-05-09 1131 EDT - Exact Workbench Receipt Selection

### What Changed

- Ledger and Terminal Lab now pass the exact Workbench evidence id through the Workbench filter handoff.
- Workbench reads that evidence id and selects the exact receipt when it opens.
- Terminal Lab Open Proof now resolves saved proof to its Workbench receipt id instead of only filtering by command observation.
- Ledger Open Receipt now opens the selected evidence receipt directly in Workbench.
- No command execution, git execution, external write, durable memory write, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This tightens the existing receipt path instead of adding UI area.
- Ledger and Terminal Lab now point at the same concrete Workbench proof object.
- The flow remains read-only until the user manually saves evidence in Workbench.
- Session-storage handoff remains temporary navigation state, not durable history.

### Known Risks

- The exact selection depends on the receipt being within Workbench's current fetched evidence set.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: continue tightening the proof loop by showing Workbench receipt validation status back in Terminal Lab teaching or Project Lab context, without adding a new primary surface or executing commands.
```

## 2026-05-09 1129 EDT - Ledger Evidence Detail Preview

### What Changed

- Added a compact selected-receipt preview to Ledger Latest Evidence.
- Latest Evidence rows now select a receipt locally instead of immediately leaving Ledger.
- The preview shows receipt id, kind, sensitive/local state, linked terminal observation, title, summary, project, route, validation status, and target.
- Added a separate Open Receipt action that opens Workbench with the existing evidence filter handoff.
- No command execution, git execution, external write, durable memory write, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This keeps Ledger as proof before summary.
- Receipt inspection is now local to Ledger, with Workbench available only when deeper inspection is needed.
- The preview stays compact and uses existing Workbench evidence data.
- The flow remains read-only and local.

### Known Risks

- Ledger still reads the latest 50 Workbench evidence records and previews from that local set.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: when Browser Use is callable, visually verify Ledger Evidence rows and receipt preview in localhost, then tighten spacing/copy only if the screenshot shows problems. If Browser Use remains unavailable, continue the next critical-path front-end slice from Project Lab -> Terminal Lab -> Workbench -> Ledger without adding a new primary surface or executing commands.
```

## 2026-05-09 1127 EDT - Ledger Latest Evidence Receipts

### What Changed

- Added an inline Latest Evidence section to Ledger Overview.
- Ledger now shows the newest four local Workbench evidence receipts.
- Each receipt shows id, evidence kind, validation status, project name when available, title, and summary.
- Clicking a receipt opens Workbench with an evidence filter handoff for that receipt.
- The Evidence card remains as the count summary; the new section gives the user actual receipt rows to inspect.
- No command execution, git execution, external write, durable memory write, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This follows the locked path: Workbench as proof and Ledger as receipts.
- Ledger now shows proof rows, not only receipt counts.
- Clicking a receipt keeps the action local and read-only; Workbench handles inspection.
- The section stays compact and uses existing CereBro surfaces.

### Known Risks

- Ledger reads the latest 50 Workbench evidence records and displays the first four.
- Receipt click uses temporary browser session state to stage the Workbench filter.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: tighten the Ledger Latest Evidence rows with browser verification and, if needed, add a compact receipt detail preview without adding a new primary surface or executing commands. Verify in browser DOM when available, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1124 EDT - Workbench Proof Findability

### What Changed

- Ledger Overview now includes a Workbench Evidence receipt card.
- The card shows total local Workbench evidence records and the count of terminal proof records.
- Terminal Lab now reads recent Workbench terminal-output evidence records.
- Terminal Lab observations show an evidence chip when a saved Workbench proof exists for that command observation.
- The Proof button becomes Open Proof for observations with saved evidence and opens Workbench with terminal evidence filters staged.
- Workbench now reads a temporary evidence-filter handoff from session storage and applies kind, query, grouping, and a visible notice.
- No command execution, git execution, external write, durable memory write, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This follows the locked path: Workbench as visual proof, Ledger as receipts, Terminal Lab as Aang's build-teaching lane.
- Saved terminal proof now has a visible return path instead of living only in Workbench search.
- Ledger now names evidence as a primary receipt object.
- The flow remains manual and local.

### Known Risks

- Terminal Lab currently reads the latest 50 terminal-output evidence records. A dedicated lookup endpoint may be cleaner later.
- The Workbench filter handoff is temporary browser session state, not durable history.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: make Ledger evidence receipts show the newest Workbench proof rows inline, without executing commands, adding a new Code Lab surface, or writing external memory. Verify in browser DOM when available, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1115 EDT - Terminal To Workbench Proof Draft

### What Changed

- Added a Proof action to Terminal Lab observations.
- Proof stages a Workbench draft in browser session storage and navigates to Workbench.
- Workbench now reads staged drafts, fills the existing Add Evidence form, links the command observation, filters to terminal evidence, and shows a visible draft notice.
- The user still presses Save Local Evidence. No hidden Workbench evidence write happens from Terminal Lab.
- No command execution, git execution, browser capture, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable in this tool set, so visual DOM proof is pending in the open localhost tab.

### Front-End Steward Review

- This follows the locked path: Terminal Lab teaches, Workbench holds visual and validation proof.
- The handoff is explicit and manual. Terminal Lab stages context. Workbench saves only after user action.
- The receipt shape stays local, append-only, and agent-readable.
- No new primary surface was introduced.

### Known Risks

- Draft transfer uses browser session storage, which is appropriate for a temporary handoff but not durable history.
- Visual browser proof still needs a plugin pass when Browser Use is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data is mutated until the user presses Save Local Evidence in Workbench.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from this flow.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: make Workbench saved terminal evidence easier to find from Ledger or Terminal Lab without executing commands, adding a new Code Lab surface, or writing external memory. Verify in browser DOM when available, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1111 EDT - Terminal Lab Project Context Rail

### What Changed

- Connected Terminal Lab to Project Lab's read-only project overview.
- Added a Project Context rail inside Terminal Lab.
- The rail shows matched project, git status, push readiness, branch, upstream, dirty count, pending approvals, blocked terminal observations, reviewing terminal observations, next safe action, and execution boundary.
- Context resolves from the selected observation cwd, selected task project name, current CereBro repo path, or the first known project fallback.
- No command execution, git execution, backend agent runtime, or new Code Lab surface was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Browser plugin inspection was not callable after context compaction, so visual proof is pending in the open localhost tab.

### Front-End Steward Review

- This follows the locked path: Project Lab as map, Terminal Lab as Aang's build-teaching lane.
- Terminal Lab now teaches against project state instead of isolated command rows.
- Push readiness remains advisory and explicit: Project Lab evidence only, executes git no, approval required yes.
- The UI stays inside the existing Terminal Lab rail.

### Known Risks

- The rail uses Project Lab overview data, not a dedicated Terminal Lab project-context endpoint.
- Browser DOM proof still needs the plugin once it is callable again.
- Existing Raven/server/docs edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command, git, browser-source, external model, connector, Notion, Slack, or memory write ran from Terminal Lab.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Stay on the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts. Next safe slice: use the Project Context rail to make Terminal Lab observations link more clearly to Workbench proof receipts, without executing commands or adding a new Code Lab surface. Verify in browser DOM when available, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1104 EDT - Build Plan Front-End Path Ordering

### What Changed

- Added an explicit current front-end build path to `CEREBRO_MASTER_BUILD_PLAN.md`.
- Locked the order: Keep-first UX spine, Project Lab as map, Terminal Lab as Aang's build-teaching lane, Workbench as visual proof, Ledger as receipts, Model/Tool Registry as basement capability map, backend runtime after proof.
- Folded Codebase-to-Course and Coding Lab into Terminal Lab instead of a new Code Lab surface.
- Added the Terminal Lab teaching contract to `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- Added the Obsidian implementation fix into Session 7: color/path rules, project bridge notes, readable session-history index styling, archive lane rules, and Raven's separate visible lane without private data movement.
- Included the referenced skills/tools and Raven smart recommender plan docs so the master plan does not point at missing local files.

### Files Touched

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`
- `CEREBRO_SKILLS_AND_TOOLS_LAYER.md`
- `CEREBRO_RAVEN_SMART_RECOMMENDER_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `rg` verified the new build path, Terminal Lab Code Lab wording, and Obsidian grey-pile fix.
- `git diff` reviewed the docs-only patch.
- No app checks were needed because no app code changed in this slice.

### Front-End Steward Review

- The path now tells the front-end building agent what to build next and what not to create.
- Connected plugins remain capability proposals and build-session aids, not new product surfaces.
- Terminal Lab is now the teaching surface for coding work.
- The backend agent is explicitly later and should consume visible receipts instead of replacing them.

### Known Risks

- The plan now has the right order, but the UI still needs the next slices to catch up.
- Obsidian color/style rules are specified, not implemented as vault CSS or templates yet.
- Existing Raven/server/docs edits remain unrelated to this docs-only ordering pass.

### Storage Impact

- No schema change.
- No app data was mutated.
- No browser, connector, external model, Notion, Slack, or command execution.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as CereBro's front-end building agent. Follow the locked path: Keep-first UX spine -> Project Lab as map -> Terminal Lab as Aang's build-teaching lane -> Workbench as visual proof -> Ledger as receipts -> Model/Tool Registry as basement capability map -> backend runtime after proof. Do not add a new Code Lab surface. Next safe slice: connect Terminal Lab teaching frames to Project Lab context by showing selected project branch/dirty/push-readiness evidence in the Terminal Lab rail without executing commands or adding new primary surfaces. Verify in browser DOM, run pnpm check if app code changes, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 1100 EDT - Front-End Build Steward: Terminal Lab Teaching Frame

### What Changed

- Re-read the adjusted master build plan, frontend system, UX system, and skills/tools layer.
- Clarified the path: no new Code Lab surface. Terminal Lab becomes Aang's teaching lane for code and command work.
- Added an Aang Teaching frame inside Terminal Lab.
- The frame explains the active command preview, selected observation, or empty state.
- It shows route, lesson, proof, next safe step, and not-yet gates.
- Renamed the observation action from Attach to Teach so Terminal Lab reads as a learning/build surface, not just a log sink.
- Browser DOM verified Terminal Lab, Aang Teaching, Lesson, Proof, Next Safe Step, Not Yet, and proposal-only labels at `http://localhost:3002/`.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app Browser Use plugin verified the Terminal Lab teaching frame.

### Front-End Steward Review

- This follows the build plan path: Project Lab is the map, Terminal Lab is the teaching/build lane, Workbench is visual proof, Ledger is receipts.
- No plugin UI was added.
- No new Code Lab route was added.
- Terminal Lab still does not execute commands.

### Known Risks

- The teaching frame is frontend-derived from existing preview and observation fields.
- Backend command lesson receipts still need a future slice.
- Project Lab and Workbench links are still adjacent surfaces, not deeply linked from each observation.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated by the code change.
- No command execution ran from Terminal Lab.
- Browser Use was used only for localhost UI verification.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Continue as the CereBro front-end building agent. Stay on the critical path: Keep-first UX, Project Lab as project map, Terminal Lab as Aang's teaching/build lane, Workbench as visual proof, Ledger as receipts. Next safe slice: connect Terminal Lab teaching frames to Project Lab context by showing selected project branch/dirty/push-readiness evidence in the Terminal Lab rail without executing commands or adding new primary surfaces. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0816 EDT - Front-End Build Steward: Button Primitive Density

### What Changed

- Tightened the shared Button primitive to compact CereBro density.
- Reduced default button height to 28px, small buttons to 24px, and icon buttons by one step.
- Replaced the roomier `rounded-md` default with a compact `rounded` radius while staying under the 8px rule.
- Reduced text and icon sizing to match the already-normalized input, select, badge, menu, and shell controls.
- Browser DOM verified shell buttons, command bar actions, Tools menu, and Clear Visible Sessions hard gate at `http://localhost:3002/`.

### Files Touched

- `app/client/src/components/ui/button.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed button-heavy shell and hard-gate controls still render.

### Front-End Steward Review

- Button density now matches the rest of the normalized shared primitives.
- Destructive, risk, disabled, focus-visible, and invalid states remain explicit.
- Screenshot capture still times out, so visual proof used DOM state plus localhost health.

### Known Risks

- This is a shared primitive change with broad visual reach.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Button Primitive Density. Next safe slice: inspect route surfaces for button fallout, especially small action clusters in Hedwig, Terminal Lab, Project Lab, and Tasks. Patch only visible spacing issues caused by the compact button primitive. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0814 EDT - Front-End Build Steward: Shell Density Pass

### What Changed

- Tightened the Keep shell header spacing, mark size, action button height, and developer-tools menu width.
- Tightened the left zone rail button padding so the global nav matches the compact surface density.
- Converted the Aang command bar from a loose flex row to explicit responsive grid tracks.
- Kept Attach and Preview visible as compact command actions instead of hiding core command affordances at common widths.
- Browser DOM verified the Keep header, zone nav, command bar, Attach, Preview, and Tools menu groups at `http://localhost:3002/`.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed shell controls and menu groups still render.

### Front-End Steward Review

- The global shell now matches the compact primitive and route-surface passes.
- The command bar keeps the visible action model: mode, input, security receipt, attach placeholder, and route preview.
- Screenshot capture still times out, so visual proof used DOM state plus localhost health.

### Known Risks

- This pass changes layout only. It does not alter routing, session controls, command preview, or security receipts.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Shell Density Pass. Next safe slice: inspect active shell and route surfaces for any remaining primitive-normalization fallout, especially focus states, disabled states, destructive labels, and menu grouping. Patch only visible debt. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0746 EDT - Front-End Build Steward: Responsive Grid Surfaces

### What Changed

- Patched remaining active fixed grid surfaces after the compact primitive and form passes.
- Updated Workbench evidence lanes, surface cards, permission cards, and evidence group cards to stack first, then expand at `sm` and `xl`.
- Updated Security Gate posture, linked target controls, receipt links, and receipt lists to avoid forced two-column compression.
- Updated Approval Dashboard summary and filter rail to use explicit responsive tracks.
- Updated Model Registry status blocks, filter rail, and proposal select grid to respect compact controls on narrow panels.
- Browser DOM verified Workbench, Security Gate, Model Registry, and Approval Dashboard at `http://localhost:3002/`.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/SecurityGatePanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed changed route surfaces still render.

### Front-End Steward Review

- This completes the obvious fixed-grid fallout from the shared primitive normalization pass.
- The shell now lets compact controls breathe on narrow panels before returning to dense dashboard layouts.
- Screenshot capture still times out, so visual proof used DOM state plus localhost health.

### Known Risks

- This pass changes layout only. It does not alter approval, security, model registry, or evidence behavior.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Responsive Grid Surfaces. Next safe slice: inspect the shell, command bar, and developer tools menu for remaining density/radius/focus regressions after primitive normalization. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0743 EDT - Front-End Build Steward: Responsive Form Surfaces

### What Changed

- Patched active route forms after the compact primitive pass so controls stack cleanly on narrow surfaces before stepping up at `sm`, `lg`, or `xl`.
- Updated Workbench Add Evidence and Recent Evidence filters from fixed two-column defaults to responsive grids.
- Updated Design Review record form, checklist, and textarea pair to one-column mobile defaults with two-column desktop structure.
- Updated Ledger task, memory proposal, and artifact writer forms so fixed-width controls no longer force cramped layouts on narrow drawers.
- Browser DOM verified Workbench Add Evidence plus Ledger Tasks, Outputs, and Memory after reload at `http://localhost:3002/`.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/DesignReviewPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/MemoryPanel.tsx`
- `app/client/src/components/ArtifactsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed Workbench and Ledger route controls still render.

### Front-End Steward Review

- This pass makes compact controls feel intentional on active surfaces instead of just smaller.
- Narrow surfaces now get a single-column form shape first, then denser multi-column structure when space exists.
- Screenshot capture still times out, so visual proof used DOM state plus localhost health.

### Known Risks

- Design Review was patched from source and TypeScript because it is not exposed as a primary route button in the current shell.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Responsive Form Surfaces. Next safe slice: inspect remaining fixed grid/card surfaces in Workbench, Security Gate, Approval Dashboard, and Model Tools, then patch only active responsive-density debt. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0737 EDT - Front-End Build Steward: Form Primitive Density

### What Changed

- Tightened shared input defaults to compact 28px control height, smaller padding, visible focus rings, and preserved IME composition handling.
- Tightened shared textarea defaults to compact padding and 64px minimum height while preserving invalid, focus, placeholder, and disabled states.
- Tightened shared select defaults: smaller trigger heights, denser item rows, smaller content width, compact labels/separators, and matched icon sizes.
- Tightened shared tabs defaults: smaller tab list, denser triggers, and preserved active, disabled, and focus-visible states.
- Tightened shared badge defaults into compact uppercase status receipts with smaller padding.
- Verified primitive usage across active front-end surfaces by source inventory; affected surfaces include Workbench, Design Review, Tasks, Memory, Security Gate, Hedwig, Terminal Lab, and the shell.

### Files Touched

- `app/client/src/components/ui/input.tsx`
- `app/client/src/components/ui/textarea.tsx`
- `app/client/src/components/ui/select.tsx`
- `app/client/src/components/ui/tabs.tsx`
- `app/client/src/components/ui/badge.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm -C app exec tsc --noEmit --pretty false` passed.
- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Form and status primitives now follow the compact CereBro density rule and stay within the 8px radius limit.
- Focus-visible, invalid, destructive/risk-adjacent, and disabled states remain explicit.
- Browser MCP did not expose a usable Playwright module in this resumed turn, so proof used source inventory, TypeScript, full check, targeted tests, and localhost health.

### Known Risks

- The select/menu visual state still needs live route sampling when browser automation is available again.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Form Primitive Density. Next safe slice: live-sample routes using inputs/selects/badges once browser automation is available, then patch active route-level spacing debt caused by the denser primitives. Verify in browser DOM when possible, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0732 EDT - Front-End Build Steward: Shared Primitive Density

### What Changed

- Tightened hard-gate dialog defaults: smaller body padding, tighter footer, compact title/description, and narrower max width.
- Tightened drawer defaults: smaller handle, header/footer padding, compact title/description.
- Tightened dropdown and context menu defaults: smaller item height, compact menu width, grouped labels, and preserved destructive styling.
- Tightened table defaults: smaller header height, cell padding, and captions.
- Browser DOM verified the Tools dropdown and Clear Visible Sessions hard gate at `http://localhost:3002/`.

### Files Touched

- `app/client/src/components/ui/dialog.tsx`
- `app/client/src/components/ui/drawer.tsx`
- `app/client/src/components/ui/dropdown-menu.tsx`
- `app/client/src/components/ui/context-menu.tsx`
- `app/client/src/components/ui/table.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed Tools dropdown and Clear Visible Sessions hard gate still render.

### Front-End Steward Review

- Menu and hard-gate primitives now follow CereBro compact density and semantic destructive styling.
- Drawer, context menu, and table primitives were normalized for active-surface reuse.
- Drawer and context menu primitives were TypeScript-verified but not directly exercised by a visible current route in this slice.
- Screenshot capture remains unstable in the in-app browser, so visual proof used DOM shape plus localhost health.

### Known Risks

- This was a primitive styling pass. It does not change dialog, drawer, menu, or table behavior.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No app data was mutated.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Shared Primitive Density. Next safe slice: inspect remaining visible shared primitives and route chrome for regressions after dialog/menu/table normalization, then patch only active surface debt. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0728 EDT - Front-End Build Steward: Automation And Card Density

### What Changed

- Browser-reviewed Basement Automation.
- Tightened Piccolo Automation header into compact findings and read-only mode receipts.
- Reduced Automation status blocks and rule cards to the current Basement density.
- Normalized the shared Card primitive toward CereBro density: smaller gap, tighter padding, compact titles, and lighter shell shadow.
- Tightened the UI System panel so the frontend law reads as a compact rule surface instead of roomy card scaffolding.

### Files Touched

- `app/client/src/components/PiccoloPanel.tsx`
- `app/client/src/components/UISystemPanel.tsx`
- `app/client/src/components/ui/card.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed Basement Automation compact receipts, status blocks, rule cards, vault path, and findings.

### Front-End Steward Review

- Automation now fits the compact Basement machine-control treatment.
- Card primitive defaults are closer to CereBro density and still stay within the 8px radius rule.
- UI System was not reachable from the current Tools menu path during browser review; primitive changes were verified through active Basement card usage and TypeScript.
- Screenshot capture remains unstable in the in-app browser, so visual proof used DOM shape plus localhost health.

### Known Risks

- This was a density-only pass. It does not save Piccolo reports or change automation behavior.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No Piccolo report was saved during this slice.
- No Notion, Slack, browser-source intake, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Automation And Card Density. Next safe slice: inspect shared primitives still listed as debt, especially drawer/dialog/menu/table, then patch only the primitive debt that is actively used by visible CereBro surfaces. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0724 EDT - Front-End Build Steward: Basement Security Density

### What Changed

- Browser-reviewed the active Basement overview and Security Gate surfaces.
- Tightened the Basement overview into a compact machine-configuration map.
- Compressed Security Gate header receipts, posture stats, target form, receipt body, scanner plan, recent receipt rail, and gate list.
- Kept Spock security behavior unchanged. No browsing, clone, download, install, execution, or external scan was added.
- Confirmed `localhost:3002` is healthy after a transient curl miss. A temporary auto-bumped dev server on `3003` was stopped.

### Files Touched

- `app/client/src/components/SecurityGatePanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK` after one transient connection miss.
- In-app browser DOM review confirmed Basement overview and Security Gate compact receipt shape.

### Front-End Steward Review

- Security Gate now matches the compact Basement machine-control language.
- The no-browse/no-execute stance is visible at the top of the surface.
- Screenshot capture remains unstable in the in-app browser, so visual proof used DOM shape plus localhost health.

### Known Risks

- This was a density-only pass. It does not record security receipts or run scanners.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No security receipt was recorded during this slice.
- No browser-source intake, Notion, Slack, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Basement Security Density. Next safe slice: inspect Basement Automation and UI System surfaces for remaining density, hard-gate shape, and primitive debt. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0720 EDT - Front-End Build Steward: Project Lab Density

### What Changed

- Browser-reviewed the active Workshop Project Lab surface and local inspector.
- Tightened the Project Lab header into compact project-count and read-only mode receipts.
- Compressed primary stat blocks, filter rail, next-safe-action row, project cards, draft-action receipts, activity blocks, and worktree change blocks.
- Tightened the local inspector header, queue controls, filter row, detail list, metadata preview, and draft-note box.
- Kept Project Lab read-only. Drafts still append local proposal records only.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed Project Lab renders compact receipts, stat blocks, project cards, draft-action controls, and Declyne local inspector.

### Front-End Steward Review

- Project Lab now matches the denser Workshop treatment used by Terminal Lab and Research.
- Read-only and proposal-only states stay visible before any draft or repo-adjacent action.
- Screenshot capture remains unstable in the in-app browser, so visual proof used DOM shape plus localhost health.

### Known Risks

- This was a density-only pass. It does not add new project intelligence behavior or create any drafts.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No project action draft was created during this slice.
- No Notion, Slack, external model, source fetch, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Project Lab Density. Next safe slice: review the Workshop surfaces together in browser DOM, then move to remaining Basement or shared primitive debt if no obvious Workshop density issue remains. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0715 EDT - Front-End Build Steward: Research Density

### What Changed

- Browser-reviewed the active Workshop Research surface.
- Tightened the Research header into compact source and browser-lock receipts.
- Compressed the Surfer preview form, approved URL gate form, helper copy, main grid, saved source cards, source history groups, browser ladder, and policy rail.
- Kept browser/source behavior unchanged. Research remains approval-gated and browser-locked unless app data says otherwise.

### Files Touched

- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed Workshop Research renders compact browser-lock receipt, source count, saved source cards, source history, browser ladder, and policy rail.

### Front-End Steward Review

- Research now fits the same dense Workshop grammar as Terminal Lab.
- The browser lock and Security Gate path stay visible before any ingest action.
- Screenshot capture remains unstable in the in-app browser, so visual proof used DOM shape plus localhost health.

### Known Risks

- This was a density-only pass. It does not add fetch, crawl, or source approval behavior.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No source fetch, Notion, Slack, external model, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Research Density. Next safe slice: inspect Project Lab for remaining dense-workbench debt, especially filters, inspector rail, and draft-plan receipts. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0711 EDT - Front-End Build Steward: Terminal Lab Density

### What Changed

- Browser-reviewed the active Workshop Terminal Lab surface.
- Tightened the Terminal Lab header and kept execution-disabled status visible.
- Compressed the command preview form, task/session selectors, helper copy, and main work grid.
- Reduced padding and type weight across preview receipts, gates, surface summaries, observation rows, diagnostic drafts, and the right rail.
- Kept Terminal Lab proposal-only. No command execution path was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I --max-time 5 http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review confirmed Workshop Terminal Lab renders compact header, execution-disabled receipt, command form, observations, diagnostic drafts, and right rail.

### Front-End Steward Review

- The route now reads more like a dense command lab than a loose document panel.
- Risk and destructive pathways remain visible through badges and risk buttons.
- Screenshot capture timed out in the in-app browser, so visual proof used DOM shape plus localhost health.

### Known Risks

- This was a density-only pass. It does not add execution, new persistence, or new command approval behavior.
- Existing Raven/docs/server edits remain unrelated and unstaged.

### Storage Impact

- No schema change.
- No Notion, Slack, external model, browser-source intake, vault artifact write, or core memory write.
- Obsidian received a dated handoff snapshot and session-history index entry.

### Next Starter Prompt

```text
Read CEREBRO_SESSION_HANDOFF.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, CEREBRO_UX_SYSTEM.md, and AGENTS.md. Continue the CereBro front-end build steward pass from Terminal Lab Density. Next safe slice: inspect Workshop Research/Surfer for remaining density and receipt-shape debt, then compact without changing behavior. Verify in browser DOM, run pnpm check, run pnpm test -- server/cerebro-foundations.test.ts, curl localhost:3002, update handoff, archive to Obsidian, commit, and push.
```

## 2026-05-09 0706 EDT - Front-End Build Steward: Hedwig Capture Density

### What Changed

- Browser-reviewed the active Keep Capture/Hedwig surface after the Aang pass.
- Tightened the Hedwig header, status receipts, capture form, preview guidance,
  main grid, local captures, triage blocks, Notion property cards, proposal
  detail rail, Slack shape, approval gates, routing rules, reminder proposals,
  and message drafts.
- Kept the proposal-only posture visible while reducing large cards and long
  helper text into compact receipt blocks.

### Files Touched

- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed Capture shows
  compact status receipts, capture form, local captures, Notion database block,
  proposal detail rail, and proposal lists.

### Front-End Steward Review

- Hedwig now reads as a capture console instead of a planning document. The
  no-external-write rule stays present while the user can scan the working
  surface faster.

### Known Risks

- This is a first density pass. Deeper proposal-detail interactions may still
  need another focused polish pass after real captured data is present.
- Browser screenshot capture was avoided because recent screenshot attempts
  timed out. This pass used DOM verification plus checks.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Move through Workshop surfaces by current visible density debt, starting with
  the surface open in the browser or Workbench if no surface is active.

## 2026-05-09 0702 EDT - Front-End Build Steward: Aang Companion Density

### What Changed

- Browser-reviewed the active Keep Aang surface after the zone header pass.
- Tightened the Aang Companion header, policy summary, local controls, event
  strip, event cards, shell options, allowed/blocked event lists, idle states,
  first-build slice, and gates.
- Reduced oversized companion cards and event counts into compact receipt blocks
  while preserving the no-desktop-process, no-notifications, no-screen-access
  policy posture.

### Files Touched

- `app/client/src/components/AangCompanionPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed Aang
  Companion shows compact policy, controls, event strip, shell options, event
  lists, behavior, and gates.

### Front-End Steward Review

- Aang Companion now reads as a compact policy and routing surface, not a long
  spec page. The safety posture stays visible without eating the viewport.

### Known Risks

- Browser screenshot capture was avoided because recent screenshot attempts
  timed out. This pass used DOM verification plus checks.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Keep with Capture/Hedwig, then move through Workshop surfaces by
  current visible density debt.

## 2026-05-09 0659 EDT - Front-End Build Steward: Zone Header Density

### What Changed

- Browser-reviewed the shared zone header after the Ledger Overview pass.
- Tightened zone surface buttons from 32px to 28px high.
- Matched the zone surface scroll lane to the compact Ledger filter lanes with
  the same dark scrollbar treatment.
- Reduced surface label type scale so the shell no longer feels heavier than
  the normalized Ledger panels below it.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed the compact
  Ledger zone header and surface tabs load.

### Front-End Steward Review

- The shared shell now has the same compact density as the normalized Ledger
  panels. It reads as navigation, not another content block.

### Known Risks

- Browser screenshot capture was avoided because recent screenshot attempts
  timed out. This pass used DOM verification plus checks.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Move to the next noisiest Workshop or Keep surface, starting with the one
  currently visible in the browser.

## 2026-05-09 0656 EDT - Front-End Build Steward: Ledger Overview Density

### What Changed

- Browser-reviewed the active Ledger Overview surface after the Runs and Tasks
  pass.
- Tightened the overview header, local receipt badge, proof-object cards, and
  receipt rule panel.
- Reduced padding and type scale so Overview matches the density rhythm now used
  by Approvals, Outputs, Memory, Sessions, and Tasks.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Initial `pnpm test -- server/cerebro-foundations.test.ts` hit
  `SQLITE_BUSY` while the live dev server was writing to the same local DB.
  Rerun passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed Ledger
  Overview shows compact proof-object cards and receipt rules.

### Front-End Steward Review

- Ledger Overview now behaves like a command summary instead of a document
  header. It is compact enough to scan before entering the detail surfaces.

### Known Risks

- Browser screenshot capture was avoided because recent screenshot attempts
  timed out. This pass used DOM verification plus checks.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Start a full Ledger cross-surface polish pass, then move to the next noisiest
  Workshop or Keep surface.

## 2026-05-09 0653 EDT - Front-End Build Steward: Ledger Runs And Tasks Density

### What Changed

- Browser-reviewed the active Ledger Sessions and Tasks surfaces after the
  Memory pass.
- Tightened the Sessions table, stat receipts, empty/loading states, status
  pills, project/path text, session ids, and inline edit row.
- Added compact task status receipts for open, active, and done work.
- Tightened the task create row, project filters, run filters, task rows,
  long-task clamping, and destructive delete target block.

### Files Touched

- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- Initial `curl -I http://localhost:3002/` missed the dev server during a brief
  connection gap; a retry returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed Sessions and
  Tasks show compact ledger tables, stats, filters, create/edit controls, and
  destructive controls.

### Front-End Steward Review

- Ledger now has a more consistent density rhythm across Approvals, Outputs,
  Memory, Sessions, and Tasks. Runs and tasks show status receipts before the
  row lists, then keep row actions small and explicit.

### Known Risks

- Browser screenshot capture was avoided because the prior Output slice saw
  screenshot timeouts. This pass used DOM verification plus checks.
- The Tasks surface currently shows a large number of repeated local test rows;
  this slice improves density but does not clean test data.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Review the Ledger Overview surface and then do a full Ledger cross-surface
  polish pass for remaining mismatch in headers, row density, and scroll lanes.

## 2026-05-09 0648 EDT - Front-End Build Steward: Memory Receipt Density

### What Changed

- Browser-reviewed the active Ledger Memory surface after the Output pass.
- Moved memory kind filters and search out of the header into a compact receipt
  lane.
- Tightened run filters, proposal form, receipt stats, proposed rows, saved
  memory rows, empty state, and destructive delete affordance spacing.
- Clamped long proposal and memory bodies so repeated Terminal QA receipts do
  not dominate the first viewport.

### Files Touched

- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed Memory shows
  compact kind filters, run filters, proposal controls, proposed receipts, and
  saved receipts.

### Front-End Steward Review

- Memory now reads as a knowledge receipt ledger. Filters, search, proposal
  staging, Oak status, and destructive delete controls are visible without
  letting long note bodies consume the surface.

### Known Risks

- Browser screenshot capture had timed out on the previous Output slice, so this
  pass used DOM verification rather than another screenshot attempt.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Ledger with Sessions or Tasks, then review the full Ledger zone for
  remaining cross-surface density mismatches.

## 2026-05-09 0643 EDT - Front-End Build Steward: Output Library Density

### What Changed

- Browser-reviewed the active Ledger Outputs surface after the Approval pass.
- Tightened the Output Library header, receipt stats, kind filters, run filters,
  write form, policy receipts, empty state, and artifact rows.
- Converted the kind and run filter areas into horizontal compact lanes instead
  of a wrapped button wall.
- Kept durable-write policy, owner, selected write kind, run link, title, body,
  destination, and latest artifact receipts visible in one operational surface.

### Files Touched

- `app/client/src/components/ArtifactsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser DOM review of `http://localhost:3002/` confirmed Outputs
  shows the compact filter lanes and write station. Browser screenshot capture
  timed out twice after reload, so this slice used DOM verification plus checks.

### Front-End Steward Review

- Outputs now reads as a ledger receipt station. The surface distinguishes
  artifact browsing from durable writing without turning the first viewport
  into a long form.

### Known Risks

- Screenshot capture timed out in the in-app browser runtime after the reload,
  so final visual proof is DOM-based for this slice.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Ledger with Memory or Sessions, starting with the surface with the
  most visible density debt.

## 2026-05-09 0636 EDT - Front-End Build Steward: Approval Gate Density

### What Changed

- Browser-reviewed the active Ledger Approvals surface after the Automation
  pass.
- Tightened the Action Receipt Gate header, receipt stats, search/project/reset
  controls, origin/status filters, groups, and permission preflights.
- Restyled approval rows and the validation detail rail into compact receipt
  blocks.
- Kept pending, sensitive, preflight, blocked, selected-detail, and empty states
  visible in the same operational surface.

### Files Touched

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed Approvals shows
  receipt stats, filters, groups, preflights, empty approval list, and detail
  rail compactly.

### Front-End Steward Review

- Approvals now reads as a hard-gated receipt surface. The user can see what is
  pending, what is sensitive, what is blocked, and what still needs a selected
  receipt without scanning a long policy page.

### Known Risks

- No non-empty approval queue was present in browser, so row state was reviewed
  structurally from the existing markup plus the empty state.
- Existing Raven/docs/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Ledger with Tasks, Sessions, Outputs, or Memory, starting with the
  noisiest visible surface.

## 2026-05-09 0632 - Front-End Build Steward: Automation Hygiene Density

### What Changed

- Browser-reviewed the active Basement Automation surface after the Security
  pass.
- Tightened the Piccolo header, status receipts, rule cards, vault path block,
  and hygiene finding rows.
- Restyled automation posture into compact receipt cards.
- Kept read-only, durable-write, cleanup, vault, and findings context visible
  in one operational surface.

### Files Touched

- `app/client/src/components/PiccoloPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed Automation shows
  status, rules, vault path, and findings compactly.

### Front-End Steward Review

- Automation now reads as a Piccolo hygiene console. It shows what can be read,
  what can be saved, and what remains approval-gated without turning the page
  into a policy document.

### Known Risks

- The Save Report hard-gate dialog was not restyled in this slice.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Browser-review the full Basement zone and then move to active Ledger surfaces.

## 2026-05-09 0629 - Front-End Build Steward: Security Gate Density

### What Changed

- Browser-reviewed the active Basement Security surface after the Models pass.
- Tightened the posture receipts, target inspection form, link selectors, and
  local receipt helper copy.
- Compact-restyled receipt metadata and receipt-list rows.
- Reduced Scanner Plan and Recent Receipts padding so the first viewport shows
  the whole security workflow at the current browser width.

### Files Touched

- `app/client/src/components/SecurityGatePanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed Security shows
  Inspect Target, Scanner Plan, and Recent Receipts in the first viewport.

### Front-End Steward Review

- Security now reads like a gate console. The target field, local-only receipt
  controls, scanner plan, and receipt ledger stay visible together.

### Known Risks

- At the current narrow viewport the posture receipts still stack; a wider
  desktop viewport should show them in columns.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Basement with Automation/Piccolo, then browser-review the full
  Basement zone.

## 2026-05-09 0626 - Front-End Build Steward: Models Registry Density

### What Changed

- Browser-reviewed the active Basement Models surface after the Workbench pass.
- Compact-restyled status receipts, configuration rules, registry filters, and
  capability proposal rows.
- Restyled selected model-tool detail metadata as compact receipt rows.
- Tightened Propose, Eval Note, Route Preview, and Gates panels.
- Compact-restyled the dormant Design Review component so it is less document-
  shaped if it is wired later.

### Files Touched

- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/components/DesignReviewPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed the Models route
  now shows status, rules, registry, detail, and several rows in the first
  viewport.

### Front-End Steward Review

- Models now reads like a machine registry rather than a long proposal document.
  The no-call boundary stays visible while registry and detail work stay close
  together.

### Known Risks

- `DesignReviewPanel` is still not mounted by `Home.tsx`; its changes are not
  user-visible until the route is wired.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Basement surfaces with Security or Automation, whichever is visually
  noisier in the browser.

## 2026-05-09 0621 - Front-End Build Steward: Workbench Evidence Detail Density

### What Changed

- Browser-reviewed a selected Workbench evidence record after the queue-density
  pass.
- Tightened the evidence detail empty, loading, and selected states.
- Restyled evidence metadata as compact receipt rows.
- Reduced padding across permission preflight, validation history, comparison
  history, and append-control blocks.
- Kept append before/after and validation-note controls visible in the right
  rail at wider browser width.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed selected evidence
  detail and append controls render in the compact rail.

### Front-End Steward Review

- Workbench detail now behaves like an inspection rail instead of a document
  stack. The selected record, metadata receipt, history, and append actions stay
  closer together.

### Known Risks

- Workbench still needs a final route pass for mobile/detail transitions and
  any overflow introduced by unusually long metadata values.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Browser-review Workbench end to end, then move to the next Workshop surface
  that still reads as a document.

## 2026-05-09 0617 - Front-End Build Steward: Workbench Recent Evidence Density

### What Changed

- Browser-reviewed Recent Evidence after the Add Evidence density pass.
- Tightened the filter row, group panel, gate receipts, and record stack.
- Capped visible evidence records to 12 and added an overflow count so the
  surface reads as a queue instead of a full log dump.
- Compressed record summaries to two short lines with target metadata kept
  visible when present.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed Recent Evidence
  renders compact filters, groups, records, and overflow state.

### Front-End Steward Review

- Recent Evidence now behaves like a triage queue. It shows current scope,
  grouping, safety gates, a bounded row set, and the next filtering action.

### Known Risks

- Evidence detail still needs its own density pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Compact the Workbench evidence detail panel, validation history, comparison
  history, and append controls.

## 2026-05-09 0615 - Front-End Build Steward: Workbench Add Evidence Density

### What Changed

- Browser-reviewed the Workbench Add Evidence editor after the surface receipt
  pass.
- Changed Add Evidence from a long two-track ladder into compact paired rows at
  the current browser width.
- Kept required evidence title and summary visible while compressing optional
  project, task, session, source, command, artifact, permission, viewport, and
  coordinate fields.
- Tightened Temporary Media, sensitive status, and save controls into the same
  editor viewport.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed the Add Evidence
  editor renders as a compact work form without overlap.

### Front-End Steward Review

- Add Evidence now behaves like a dense operating tool instead of a tall intake
  questionnaire. The required content, metadata, temporary media guard, and save
  state are visible together.

### Known Risks

- Recent Evidence and evidence detail still need density passes.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Compact Recent Evidence filters, evidence groups, and record rows.

## 2026-05-09 0612 - Front-End Build Steward: Workbench Surface Receipts

### What Changed

- Browser-reviewed Workbench after the header-density pass.
- Changed Workbench surface cards to compact two-column receipt cards at the
  current browser width.
- Tightened surface owner, permission, and record-chip spacing.
- Changed Workbench permission cards to compact two-column receipt blocks.
- Reduced Evidence Record padding and list rhythm so the Add Evidence editor
  starts entering the first viewport.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed surface cards now
  render in compact pairs without overlap.

### Front-End Steward Review

- Workbench is beginning to read like a real work surface instead of a long
  document. The top viewport now gives route choice, safety state, and surface
  coverage before the editor.

### Known Risks

- The Add Evidence editor remains tall and still needs grouped lanes,
  collapsible optional metadata, and stronger visual hierarchy.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Compact the Add Evidence editor by grouping required fields first and moving
  optional links into dense rows.

## 2026-05-09 0609 - Front-End Build Steward: Workbench Header Density

### What Changed

- Browser-reviewed Workbench in the in-app browser after the Research rail pass.
- Changed the Workbench lane selector from four full-width stacked cards into a
  compact two-column selector at the current browser width.
- Tightened the active-job block and added a small manual-proof receipt badge.
- Compressed the route safety summary into a smaller receipt block.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed the Workbench
  first viewport now shows all four evidence lanes plus the safety receipt.

### Front-End Steward Review

- Workbench no longer burns the first viewport on one setup card and four
  stacked lane buttons. The route now exposes the work choices and safety state
  immediately.

### Known Risks

- Workbench surfaces, permissions, Add Evidence, Recent Evidence, and evidence
  detail still need their own density passes.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Compact the Workbench surfaces and permission blocks into receipt rows, then
  move into the Add Evidence editor.

## 2026-05-09 0606 - Front-End Build Steward: Research Rail Receipts

### What Changed

- Browser-reviewed the Research route after the source-history grouping pass.
- Compact-restyled Browser Ladder into receipt rows with stable marker and body
  columns.
- Compact-restyled Policy and approval gates into matching rail receipt rows.
- Reduced right-rail padding so Research now matches the density pattern used by
  Terminal Lab.

### Files Touched

- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser review of `http://localhost:3002/` confirmed the Research
  rail receipts render correctly.

### Front-End Steward Review

- Research now has the same compact rail grammar as Terminal Lab: status stays
  visible, repeated text compresses, and policy is readable without feeling like
  documentation pasted into the app.

### Known Risks

- Workbench has not had this route-density pass yet.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Move to Workbench and apply the same compact shell grammar to its primary
  route surface.

## 2026-05-09 0602 - Front-End Build Steward: Research Source History Groups

### What Changed

- Browser-reviewed Research after the route-density pass.
- Grouped repeated source history events by event type, owner, display source,
  and title.
- Added grouped counts, so the 25 repeated Hedwig source-save events now read as
  one grouped row instead of flooding the rail.
- Capped the visible source-history rail to six grouped events with overflow
  text.

### Files Touched

- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- The Research rail now exposes source-history signal without repeating the same
  capture card over and over.

### Known Risks

- Browser Ladder and Policy still need the compact receipt treatment used on
  Terminal Lab.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Finish Research right rail by compacting Browser Ladder and Policy into
  receipt rows, then move on to Workbench.

## 2026-05-09 0600 - Front-End Build Steward: Research Route Density

### What Changed

- Browser-reviewed the Research route in the in-app browser on `localhost:3002`.
- Renamed the visible route header from Surfer Sources to Research to match the
  Workshop nav label.
- Moved mode, browser, owner, and trusted-source counts into compact header
  badges.
- Collapsed the separate status-card row and two stacked forms into one compact
  action band with research preview and source ingest lanes.
- Added composer-safe bottom scroll clearance and removed the unused local
  `StatusBlock` helper.

### Files Touched

- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Research now matches the Workshop route pattern used by Project Lab and
  Terminal Lab: compact header, visible gates, dense first action band, and
  composer-safe scrolling.

### Known Risks

- Source history still repeats many similar Hedwig events and needs a dedicated
  grouping pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Compact the Research source history rail with grouping, caps, and clearer
  event hierarchy.

## 2026-05-09 0556 - Front-End Build Steward: Terminal Lab Right Rail

### What Changed

- Browser-reviewed Terminal Lab after the diagnostic draft pass.
- Compact-restyled the right rail policy and live-link blocks into receipt
  lines.
- Reduced right rail panel padding and shortened output helper copy.
- Kept observed output, approval previews, policy, and live links intact.
- Added a local `RailLine` helper for compact rail receipts.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` first failed on a non-existent `borderStrong` token, then passed
  after switching to the existing `C.border` token.
- `pnpm test -- server/cerebro-foundations.test.ts` first failed on the
  unrelated Raven manifest dirty state, then passed on rerun.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Terminal Lab's right rail now reads like compact policy and linkage receipts
  instead of explanatory paragraphs.

### Known Risks

- The Raven/server worktree remains dirty and is not part of this frontend
  commit.
- Terminal Lab surface is now usable enough to move to the Research route next.

### Next Front-End Slice

- Move to the Research surface and apply the same routed surface density pass:
  header hierarchy, first viewport compression, right rail clearance, and
  composer-safe scrolling.

## 2026-05-09 0553 - Front-End Build Steward: Terminal Lab Diagnostic Drafts

### What Changed

- Browser-reviewed Terminal Lab after the observation action grouping pass.
- Flattened Tony diagnostic draft cards so title, command, reason, and actions
  scan as one compact row before evidence details.
- Shortened the diagnostic action labels to Preview, Copy, and Approval.
- Preserved evidence, expected signal, approval gate text, and proposal-only
  behavior.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` first failed with a
  transient `SQLITE_BUSY: database is locked` from the unrelated Raven path,
  then passed on rerun.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Terminal Lab diagnostic drafts now read as compact proposal rows rather than
  nested mini-pages inside each observation.

### Known Risks

- The right rail still needs a dedicated density pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Terminal Lab by compacting the right rail policy, output, live links,
  and approval preview blocks.

## 2026-05-09 0550 - Front-End Build Steward: Terminal Lab Action Groups

### What Changed

- Browser-reviewed Terminal Lab after the header-density pass.
- Grouped observation action buttons into Review, Gate, Link, and Output lanes.
- Shortened repeated button labels inside those groups while preserving the same
  actions and gating behavior.
- Added a compact local `ActionGroup` helper for Terminal Lab observation rows.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Terminal Lab observation rows now separate review, risk gates, linking, and
  output capture instead of presenting every action as one flat button strip.

### Known Risks

- Diagnostic draft blocks are still dense.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Terminal Lab by compacting diagnostic draft blocks and the right rail.

## 2026-05-09 0547 - Front-End Build Steward: Terminal Lab Header Density

### What Changed

- Browser-reviewed Terminal Lab in the in-app browser on `localhost:3002`.
- Moved mode, owner, support, and execution state from a separate status-card
  row into compact header badges.
- Raised the Terminal Lab header hierarchy to match the active routed surfaces.
- Added bottom scroll clearance so the fixed route composer does not cover the
  lower right rail or observation list.
- Removed the now-unused local `StatusBlock` helper.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Terminal Lab now gets to the command preview form and observation surface
  faster, while keeping the no-execution state visible in the header.

### Known Risks

- Observation cards remain dense and need a dedicated action-row pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Terminal Lab by compacting observation action rows and diagnostic
  draft blocks.

## 2026-05-09 0544 - Front-End Build Steward: Project Lab Next Rank

### What Changed

- Browser-reviewed the Project Lab next-action strip after the filter rail pass.
- Replaced the visible raw weighted attention score with simple rank badges
  `#1`, `#2`, and `#3`.
- Kept the weighted score internal for sorting while making the visible cue
  readable.
- Gave next-action cards slightly more padding and two-line action text.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- The next-action strip now communicates priority without exposing the internal
  score math as noisy UI.

### Known Risks

- Signal buttons remain dense when counts climb.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Project Lab polish on signal grouping or move to Terminal Lab route
  density if Project Lab holds under review.

## 2026-05-09 0540 - Front-End Build Steward: Project Lab Filter Rail

### What Changed

- Browser-reviewed Project Lab after the previous clearance pass.
- Collapsed the duplicated secondary stats and view-filter rows into one compact
  filter rail.
- Moved active sort/readout and attention signals into one status row.
- Kept next safe actions visible while reducing the height of the pre-card
  control area.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Project Lab now starts project cards higher on the screen and avoids repeating
  the same filter controls in two adjacent rows.

### Known Risks

- Signal buttons are still visually dense at high counts.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue browser-led tuning on Project Lab next-action cards and project row
  wrapping, then move to Terminal Lab if the Project Lab surface holds.

## 2026-05-09 0538 - Front-End Build Steward: Project Lab Browser Clearance

### What Changed

- Browser-reviewed Project Lab in the in-app browser on `localhost:3002`.
- Confirmed the card hierarchy and inspector density changes are visible in the
  running app.
- Added bottom scroll clearance to the Project Lab card grid so the fixed route
  composer no longer covers the end of the card surface.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- In-app browser reload of `http://localhost:3002/` succeeded.

### Front-End Steward Review

- Project Lab now has visible card and inspector changes, and the route has
  breathing room above the persistent bottom composer.

### Known Risks

- The project card body is still information-heavy by design.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue browser-led tuning on Project Lab row wrapping and the persistent
  top filter/next-action area.

## 2026-05-09 0536 - Front-End Build Steward: Project Inspector Density

### What Changed

- Tightened the Project Lab inspector shell from a tall explanatory panel into
  a compact local workbench strip.
- Changed queue controls into a count-bearing grid so approvals, terminal,
  Hedwig, sources, git, drafts, and gates scan as one rail.
- Combined search, type filters, sort controls, read-only status, and reset into
  one compact toolbar.
- Reduced inspector padding and fixed the detail column alignment.
- Restarted the dev server after localhost was down; `localhost:3002` is serving
  again.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` first failed because the dev server was not
  running, then passed after `pnpm dev` restarted on port 3002.

### Front-End Steward Review

- Opening a Project Lab card should now expose a denser inspector with clearer
  queue selection and less instructional copy.

### Known Risks

- Browser screenshot capture was not available.
- Detail row cards still deserve a final text wrapping pass after visual review.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Browser-review Project Lab in the running app, then tune row wrapping, empty
  states, and any inspector overflow issues that show up visually.

## 2026-05-09 0014 - Front-End Build Steward: Project Card Density

### What Changed

- Cut Project Lab card metadata from 11 always-visible fields to six operational
  fields: owner, branch, tasks, approvals, Hedwig, and terminal.
- Merged next action and safe action into one compact CereBro surface.
- Replaced five large signal blocks with a compact activity strip for approvals,
  Hedwig, terminal, sources, and drafts.
- Tightened local draft action controls so they read as lightweight proposals,
  not a full card inside the card.
- Removed the unused large signal helper after the card surface moved to the
  compact strip.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Project cards should now show a visible density change in the running app:
  less repeated metadata, fewer blocky sections, and clearer click targets for
  inspection queues.

### Known Risks

- Browser screenshot capture was not available.
- The Project Lab detail inspector still needs a focused density and hierarchy
  pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Project Lab by normalizing the detail inspector queue rail, preview
  columns, and empty states.

## 2026-05-09 0011 - Front-End Build Steward: Project Lab Hierarchy

### What Changed

- Reshaped Project Lab's first viewport from 10 equal tiny metrics into five
  primary status cards plus a compact secondary metrics strip.
- Raised the Project Lab title hierarchy and gave metric controls consistent
  CereBro card framing.
- Removed the extra intake/mode chip rows from the first viewport so project
  cards appear sooner.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` failed once on an optional filter type, then passed after fix.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Project Lab should now feel less like a metrics wall and more like a routed
  work surface with clear primary signals.

### Known Risks

- Browser screenshot capture was not available.
- Project cards and the detail inspector still need a deeper density pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue Project Lab hierarchy below the fold: project cards, signal blocks,
  draft actions, and detail inspector density.

## 2026-05-09 0008 - Front-End Build Steward: Remaining Route Frames

### What Changed

- Added explicit full-height border framing, overflow control, and CereBro text
  color to Project Lab, Model Tools, Security Gate, Artifacts, Piccolo, UI
  System, and Handoff Archive panels.
- Standardized the remaining routed surfaces with the prior Ledger and tool
  route frame passes.
- Left deeper Project Lab hierarchy work for a dedicated pass because the file
  is broad and data-heavy.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/components/SecurityGatePanel.tsx`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/PiccoloPanel.tsx`
- `app/client/src/components/UISystemPanel.tsx`
- `app/client/src/components/HandoffArchivePanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- The major routed panels now have consistent workspace boundaries, which makes
  navigation changes more legible in the running app.

### Known Risks

- Browser screenshot capture was not available.
- Project Lab still needs a focused visual hierarchy pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Run a visible hierarchy pass on Project Lab and any route whose header or
  first viewport still reads too dense after the frame normalization.

## 2026-05-09 0006 - Front-End Build Steward: Routed Tool Surface Frames

### What Changed

- Added explicit full-height border framing and overflow control to Workbench,
  Terminal Lab, Hedwig Inbox, Surfer Sources, Approval Dashboard, and Aang
  Companion routed panels.
- Standardized these visible tool routes with the full-height Ledger and
  Settings surfaces from the prior slice.
- Preserved existing panel behavior and local-only workflow copy.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/AangCompanionPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Routed tool panels now read as deliberate workspace surfaces instead of
  inheriting mixed framing from earlier overlay-era panels.

### Known Risks

- Browser screenshot capture was not available.
- Manual browser QA should still inspect panel overflow and header height
  across desktop and narrow widths.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue visible shell QA with Project Lab, Model Tools, Security Gate,
  Output Library, Automation, and any remaining dormant routed panels.

## 2026-05-09 0004 - Front-End Build Steward: Full-Height Routed Panels

### What Changed

- Converted routed Ledger panels for Tasks, Memory, and Sessions from
  half-height bottom drawers into full workspace surfaces.
- Converted Settings/Config from a fixed modal overlay into an in-route,
  full-height workspace panel.
- Preserved existing behavior and close buttons.

### Files Touched

- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/MemoryPanel.tsx`
- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/ConfigPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- Initial `curl -I http://localhost:3002/` failed because the app server was
  temporarily down. After checking and removing an extra 3004 dev server,
  `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Main nav routes now produce visibly different full surfaces instead of
  looking like a small drawer layered over the Keep.

### Known Risks

- Browser screenshot capture was not available.
- The visible route layout should still get manual browser QA for overflow on
  small screens.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue visible shell QA with Workbench, Terminal, Hedwig, Sources,
  Approvals, and Aang panels. Prioritize hierarchy and obvious state clarity.

## 2026-05-09 0001 - Front-End Build Steward: Compact Sidebar Helpers

### What Changed

- Normalized `Sidebar`, `InputOTP`, `Resizable`, `ButtonGroup`, `Avatar`, and
  `ScrollArea` away from stock shadcn theme tokens.
- Applied CereBro dark shell surfaces, borders, compact text, focus rings,
  disabled states, active states, and 8px max radius.
- Ran the UI primitive stock-token scan. No remaining `bg-background`,
  `bg-popover`, `text-muted-*`, `border-input`, `border-border`, `ring-ring`,
  `bg-muted`, `bg-accent`, large radius, or stock shadow hits remain in
  `app/client/src/components/ui`.

### Files Touched

- `app/client/src/components/ui/sidebar.tsx`
- `app/client/src/components/ui/input-otp.tsx`
- `app/client/src/components/ui/resizable.tsx`
- `app/client/src/components/ui/button-group.tsx`
- `app/client/src/components/ui/avatar.tsx`
- `app/client/src/components/ui/scroll-area.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` failed once with
  `SQLITE_BUSY`, then passed on rerun.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- The shared UI primitive folder is now normalized against the main CereBro
  token and density rules, with the obvious stock theme classes removed.

### Known Risks

- Browser screenshot capture was not available.
- A deeper visual QA pass should still inspect real rendered sidebar and OTP
  states once they are used in visible panels.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Move from primitives to visible shell QA. Inspect the live app panels for
  spacing, hierarchy, focus, and empty/error states that still feel unchanged.

## 2026-05-08 2358 - Front-End Build Steward: Compact Form Helpers

### What Changed

- Normalized `InputGroup`, `Item`, `Kbd`, `Breadcrumb`, and `Calendar`
  primitives away from generic shadcn theme tokens.
- Applied CereBro dark shell surfaces, compact text, visible focus rings,
  disabled/error states, and 8px max radius.
- Kept `Sidebar` out of this slice because it is broad and variable-driven.

### Files Touched

- `app/client/src/components/ui/input-group.tsx`
- `app/client/src/components/ui/item.tsx`
- `app/client/src/components/ui/kbd.tsx`
- `app/client/src/components/ui/breadcrumb.tsx`
- `app/client/src/components/ui/calendar.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Form-adjacent helpers no longer pull light/default shadcn colors into future
  CereBro panels.

### Known Risks

- Browser screenshot capture was not available.
- `Sidebar` still needs a separate scoped pass.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Normalize `Sidebar` and the remaining stock primitives with CSS-variable
  surfaces, then run a global token scan for leftover stock theme classes.

## 2026-05-08 2355 - Front-End Build Steward: Compact Overlay Helpers

### What Changed

- Normalized `NavigationMenu`, `Popover`, `HoverCard`, `Pagination`,
  `Field`, `Form`, `Label`, and chart tooltip/legend surfaces away from stock
  shadcn theme tokens.
- Applied CereBro dark shell surfaces, borders, compact text, focus states,
  disabled states, and 8px max radius.
- Preserved component APIs and behavior.

### Files Touched

- `app/client/src/components/ui/navigation-menu.tsx`
- `app/client/src/components/ui/popover.tsx`
- `app/client/src/components/ui/hover-card.tsx`
- `app/client/src/components/ui/pagination.tsx`
- `app/client/src/components/ui/field.tsx`
- `app/client/src/components/ui/form.tsx`
- `app/client/src/components/ui/label.tsx`
- `app/client/src/components/ui/chart.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Overlay and helper primitives now inherit the same dark, compact system as
  the active shell controls.

### Known Risks

- Browser screenshot capture was not available.
- Visible impact depends on where these stock primitives appear in future work.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue the remaining stock primitive audit with calendar, sidebar,
  input-group, item, kbd, breadcrumb, and command-adjacent helpers.

## 2026-05-08 2351 - Front-End Build Steward: Compact Control Primitives

### What Changed

- Normalized stock `Switch`, `Toggle`, `ToggleGroup`, `RadioGroup`, `Slider`,
  `Progress`, and `Accordion` primitives away from generic shadcn theme tokens.
- Added CereBro shell tokens for dark surfaces, borders, focus rings, disabled
  states, selected states, and slider/progress fills.
- Tightened control density while keeping 8px max radius.

### Files Touched

- `app/client/src/components/ui/switch.tsx`
- `app/client/src/components/ui/toggle.tsx`
- `app/client/src/components/ui/toggle-group.tsx`
- `app/client/src/components/ui/radio-group.tsx`
- `app/client/src/components/ui/slider.tsx`
- `app/client/src/components/ui/progress.tsx`
- `app/client/src/components/ui/accordion.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Dormant stock controls now match the CereBro primitive baseline before they
  become visible in future panels.

### Known Risks

- Browser screenshot capture was not available.
- These primitives are mostly future-facing; visible shell impact may be subtle
  until the controls are used in live panels.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue the remaining stock primitive audit with navigation, popover,
  hover-card, chart tooltip, pagination, and form helper surfaces.

## 2026-05-08 2347 - Front-End Build Steward: Compact Dormant Surfaces

### What Changed

- Normalized dormant `PixelOffice` away from retro neon/pixel-panel styling to
  CereBro background, surface, border, and grid tokens.
- Normalized dormant `ManusDialog` away from the light 20px-radius modal into
  compact CereBro dialog density, token text colors, and token logo well.
- Preserved existing behavior.

### Files Touched

- `app/client/src/components/PixelOffice.tsx`
- `app/client/src/components/ManusDialog.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Dormant surfaces no longer reintroduce neon office styling or light modal
  treatment if they are reused later.

### Known Risks

- Browser screenshot capture was not available.
- Both components appear unreferenced in the current app shell.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue with visible surfaces first. If no visible outliers remain, do a
  targeted primitive pass for stock controls that are likely to be used next.

## 2026-05-08 2345 - Front-End Build Steward: Compact Fallback Surfaces

### What Changed

- Reworked `ErrorBoundary` into a compact CereBro dark-shell error surface with
  token danger state, smaller stack trace panel, and compact reload action.
- Reworked the `NotFound` route from a light marketing-style card into a compact
  CereBro shell card with token warning state and direct return copy.
- Tightened the `Home` stub surface padding and copy scale.

### Files Touched

- `app/client/src/components/ErrorBoundary.tsx`
- `app/client/src/pages/NotFound.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Error, not-found, and stub fallback surfaces now match the rest of the Keep
  shell instead of breaking into light or stock UI treatment.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue visible surfaces first. Dormant primitives can wait unless they are
  about to be used by the Keep shell.

## 2026-05-08 2324 - Front-End Build Steward: Compact Command Menubar Primitives

### What Changed

- Normalized `Command` and `CommandDialog` internals to compact CereBro shell
  colors, smaller input/list rows, token separators, and muted shortcuts.
- Normalized `Menubar` root, triggers, content panes, submenus, labels, items,
  selected states, destructive states, separators, and shortcuts.
- Preserved existing Radix/cmdk behavior.

### Files Touched

- `app/client/src/components/ui/command.tsx`
- `app/client/src/components/ui/menubar.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Command palettes and menu bars now follow CereBro menu grouping rules:
  compact rows, muted group labels, visible focus, dark shell surfaces, and
  explicit destructive styling.

### Known Risks

- Browser screenshot capture was not available.
- `command` and `menubar` are not currently imported by app surfaces, but they
  are now normalized before reuse.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue referenced primitive normalization or switch back to visible
  surfaces. `navigation-menu` and `calendar` remain stock, but neither appears
  reachable from the current shell.

## 2026-05-08 2321 - Front-End Build Steward: Compact Alert Sheet Primitives

### What Changed

- Normalized `Alert` to compact CereBro shell tokens, 8px max radius, smaller
  copy scale, and explicit destructive risk styling.
- Normalized `Sheet` to dark shell surfaces, compact header/footer padding,
  soft overlay, token borders, and visible focus state on the close control.

### Files Touched

- `app/client/src/components/ui/alert.tsx`
- `app/client/src/components/ui/sheet.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Alert messaging and sheet drawers now match the compact dark shell instead of
  stock theme values.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue referenced primitive normalization. Candidate areas: `command`,
  `menubar`, `navigation-menu`, or `calendar` if any become reachable from the
  current Keep shell.

## 2026-05-08 2319 - Front-End Build Steward: Compact Tooltip Skeleton Primitives

### What Changed

- Normalized `Tooltip` to CereBro dark shell tokens with compact padding,
  8px max radius, soft border, and matching arrow fill.
- Normalized `Skeleton` away from generic accent fill to a muted dark shell
  loading surface.

### Files Touched

- `app/client/src/components/ui/tooltip.tsx`
- `app/client/src/components/ui/skeleton.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- App-wide hover help and loading placeholders now match the compact CereBro
  shell instead of stock inverted UI colors.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue referenced primitive normalization. Candidate areas: `alert`,
  `sheet`, `command`, or `menubar`, depending on what is actually reachable
  from the current Keep shell.

## 2026-05-08 2317 - Front-End Build Steward: Compact Alert Empty Primitives

### What Changed

- Normalized `AlertDialog` to the CereBro hard-gate modal shape: dark shell,
  amber risk border, compact padding, 8px radius, and destructive default action.
- Tightened `Empty` primitives to compact dark shell surfaces with token colors,
  smaller icon wells, and reduced spacing.
- Left behavior unchanged.

### Files Touched

- `app/client/src/components/ui/alert-dialog.tsx`
- `app/client/src/components/ui/empty.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `pnpm check` failed on existing dirty Raven backend type errors in
  `app/server/routers/raven.ts`.
- `pnpm test -- server/cerebro-foundations.test.ts` failed on existing dirty
  Raven backend expectations around `decision_draft_note` timeline filters.

### Front-End Steward Review

- Alert confirmations and empty states now align with the compact CereBro shell
  instead of stock shadcn spacing and radius.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.
- Full repo checks are blocked until the dirty Raven backend work is reconciled.

### Next Front-End Slice

- Continue the primitive and visible-surface sweep only if backend dirt remains
  isolated. `ManusDialog` and `PixelOffice` are unreferenced, so prioritize
  referenced surfaces first.

## 2026-05-08 2247 - Front-End Build Steward: Compact Skills Manager Shell

### What Changed

- Replaced hard-coded purple/neon `SkillsManager` shells with CereBro surface,
  border, text, gold, accent, success, and warning tokens.
- Compactly restyled the manager modal, editor modal, tab bar, scope selector,
  new-item row, empty state, item rows, expanded code preview, and warning row.
- Replaced visible emoji markers with the existing lucide `Bot` and `Zap`
  icons while preserving behavior.

### Files Touched

- `app/client/src/components/SkillsManager.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Claude Code Manager now belongs to the dark CereBro shell instead of looking
  like a separate purple tool.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue the visible-surface sweep. Remaining candidates include
  `PixelOffice`, `ManusDialog`, or primitive outliers such as `alert-dialog`
  and `empty`.

## 2026-05-08 2244 - Front-End Build Steward: Compact Stats Surface

### What Changed

- Reworked `StatsPanel` away from old pixel-neon panel classes.
- Applied CereBro shell tokens, compact padding, 8px radius, and bordered dark
  surfaces.
- Added `min-w-0`, truncation, and monospace metric values so compact stats do
  not widen their container.

### Files Touched

- `app/client/src/components/StatsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Stats now belongs to the dark control shell instead of the older neon island
  styling.

### Known Risks

- Browser screenshot capture was not available.
- `StatsPanel` appears currently unreferenced, but it is normalized for reuse.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue visible surface normalization. `SessionsPanel` is already compact,
  so the next useful pass is likely another legacy-styled panel or a dense table
  overflow sweep.

## 2026-05-08 2242 - Front-End Build Steward: Compact UI System Surface

### What Changed

- Tightened `UISystemPanel` header and workspace padding.
- Converted the main grid to minmax tracks so dense cards do not force overflow.
- Tightened build-gate cells and made rule rows responsive at small widths.

### Files Touched

- `app/client/src/components/UISystemPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- UI System now reads like a compact internal control surface instead of a
  spaced-out reference page.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue visible surface normalization. Good candidates are `StatsPanel`,
  `SessionsPanel`, or any panel still using loose spacing against the dark shell.

## 2026-05-08 2240 - Front-End Build Steward: Compact Design Review Surface

### What Changed

- Tightened Design Review workspace padding, section spacing, and right rail width.
- Kept local-only review behavior, proof fields, and evidence linking intact.

### Files Touched

- `app/client/src/components/DesignReviewPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Design Review now matches the compact shell density created by the shared
  primitive pass.

### Known Risks

- Browser screenshot capture was not available.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue product surface composition, likely `UISystemPanel` density or
  another visible surface. Avoid widening backend.

## 2026-05-08 2235 - Front-End Build Steward: Compact Dialog Drawer Primitives

### What Changed

- Tightened shared `Dialog` content density and radius.
- Tightened shared `Drawer` top/bottom radius and header/footer padding.
- Preserved hard-gate modal styling and existing visible focus states.

### Files Touched

- `app/client/src/components/ui/dialog.tsx`
- `app/client/src/components/ui/drawer.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- `pnpm check` failed on existing dirty Raven type errors in
  `app/server/routers/raven.ts`.
- `pnpm test -- server/cerebro-foundations.test.ts` failed on existing dirty
  Raven work with `SQLITE_BUSY: database is locked`.

### Front-End Steward Review

- Dialog and drawer primitives now match the compact shell density and 8px-max
  radius rule more closely.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree are currently blocking full
  verification and were left untouched.

### Next Front-End Slice

- Do not continue widening primitive edits until the dirty Raven backend work is
  reconciled or the frontend branch is isolated from it.

## 2026-05-08 2234 - Front-End Build Steward: Compact Card Primitive

### What Changed

- Tightened the shared `Card` primitive density.
- Reduced card gap, vertical padding, header/content/footer padding, and card
  radius so card surfaces better match the compact CereBro shell.

### Files Touched

- `app/client/src/components/ui/card.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Shared card surfaces now align better with the compact density and 8px-max
  radius rule.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue shared primitive review with dialog/drawer/menu grouping only if
  visible drift remains. Otherwise move back to product surface composition.

## 2026-05-08 2232 - Front-End Build Steward: Compact Approval Model Tool Rows

### What Changed

- Updated approval detail metadata rows so compact labels truncate instead of
  re-wrapping into dense panels.
- Updated model tool proposal rows so long tool names truncate with full names
  in hover titles.

### Files Touched

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Approval and model-tool surfaces now match the compact-label rule used across
  the other dense work panels.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Reassess the normalization tranche against the UI primitive goals and move
  back to primitives only if remaining shared-component drift is visible.

## 2026-05-08 2230 - Front-End Build Steward: Compact Config Secrets

### What Changed

- Updated ConfigPanel machine status values with hover titles for full evidence.
- Compact-displayed the bridge API key so the full secret is not exposed in the
  visible panel. Copy still copies the exact key.
- Compact-displayed local bridge setup commands while preserving exact copy
  behavior.

### Files Touched

- `app/client/src/components/ConfigPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Basement Configuration no longer lets long command strings or full secrets
  dominate the dense setup panel.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue the final dense-display cleanup pass in approval and model-tool
  surfaces, then reassess whether this normalization tranche is complete.

## 2026-05-08 2228 - Front-End Build Steward: Compact Workbench Project Commands

### What Changed

- Updated Workbench evidence detail command and artifact fields to use compact
  command/path labels with full evidence in hover titles.
- Updated Project Lab recent command buttons and terminal inspector fields to
  use compact command labels.
- Extended Project Lab inspector fields with optional full-evidence hover
  titles for compacted values.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` initially failed because the dev server was
  down, then passed after restarting `pnpm dev` on port 3002.

### Front-End Steward Review

- Workbench and Project Lab now keep command evidence visible but no longer let
  raw command/path strings dominate compact inspector rows.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.
- Dev server is now running at `http://localhost:3002/`.

### Next Front-End Slice

- Continue remaining dense display cleanup in approval, model tool, and config
  surfaces. Keep compact labels visible and raw evidence in hover titles.

## 2026-05-08 2225 - Front-End Build Steward: Compact Terminal Commands

### What Changed

- Added `compactCommandLabel` for dense command display.
- Updated Terminal Lab observation history and Tony diagnostic draft rows so
  long commands truncate cleanly instead of forcing horizontal row noise.
- Updated Terminal Lab cwd display to use compact path labels.
- Kept full command and cwd evidence in hover titles.

### Files Touched

- `app/client/src/lib/displayLabels.ts`
- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Terminal Lab keeps focused command previews readable while dense history rows
  use compact labels. Execution evidence remains accessible on hover.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue command/path cleanup in Workbench and Project Lab detail rows where
  raw command evidence can still overwhelm compact surfaces.

## 2026-05-08 2224 - Front-End Build Steward: Compact Path Labels

### What Changed

- Added `compactPathLabel` for dense path display.
- Updated Sessions project paths, Piccolo vault/report paths, Handoff Archive
  candidate paths, and Project Lab local/worktree paths to show compact labels.
- Kept full path evidence in hover titles.

### Files Touched

- `app/client/src/lib/displayLabels.ts`
- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/PiccoloPanel.tsx`
- `app/client/src/components/HandoffArchivePanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed after tightening a nullable Piccolo report path.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Long local paths no longer dominate dense rows. The UI now shows the useful
  tail while preserving the full path as evidence on hover.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue into Terminal Lab command rows and remaining project detail fields,
  keeping commands readable without hiding execution evidence.

## 2026-05-08 2222 - Front-End Build Steward: Workbench Hedwig Source Labels

### What Changed

- Updated Workbench source-link dropdown labels so URI fallbacks use compact
  source labels.
- Updated Hedwig triage source drafts and proposal external targets so visible
  values use compact labels with full target evidence in hover titles.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Workbench and Hedwig now match the same evidence-display rule as Surfer:
  compact source labels on the surface, full target evidence available on hover.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue compacting dense labels in Terminal Lab, Sessions, and project path
  displays where raw paths or commands cause avoidable visual noise.

## 2026-05-08 2220 - Front-End Build Steward: Surfer Project Source Labels

### What Changed

- Updated Surfer URL ingest feedback, saved-source cards, and source history
  rows to use compact source labels instead of raw URI fallbacks.
- Updated Project Lab source event fields to use the shared compact source
  label helper.
- Kept full URI evidence in hover titles where the UI already carries it.

### Files Touched

- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Surfer and Project Lab now follow the same dense source-label pattern as the
  Output Library: compact visible labels, raw evidence available on hover.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue the same normalization pass across remaining dense work surfaces,
  looking for raw IDs, raw paths, and long evidence strings that should be
  compact labels with hover evidence.

## 2026-05-08 2217 - Front-End Build Steward: Artifact Source Label Fallback

### What Changed

- Updated Output Library artifact rows so source fallback labels use the shared
  compact source label helper.
- Full raw source URI remains available in the tooltip.

### Files Touched

- `app/client/src/components/ArtifactsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Output Library now matches the current receipt rule: compact labels in dense
  rows, raw evidence on hover.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue compacting remaining raw labels in Project Lab and Surfer detail
  rows.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2210 - Front-End Build Steward: Hedwig Security Gate Link

### What Changed

- Added `Security Gate` actions to Hedwig:
  - Local capture rows with a `sourceUri`.
  - Triage proposals with a source draft URI.
  - Proposal detail source URI fields.
  - Proposal detail external target fields.
- The action opens Security Gate and pre-fills the target through local session
  storage.
- Wired Hedwig to shell navigation for the Security surface.

### Files Touched

- `app/client/src/components/HedwigInboxPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Hedwig capture and proposal flows now have a visible path to Spock before
  external source work or target review proceeds.
- This closes the biggest remaining source-intake gap in the security receipt
  flow.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Re-run a focused source/target affordance audit and clean up remaining raw
  labels that need compacting.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2208 - Front-End Build Steward: Approval Security Gate Link

### What Changed

- Added `Security Gate` actions to Approval detail records:
  - Approval target labels.
  - Linked permission preflight target summaries.
- The action opens Security Gate and pre-fills the selected target through
  local session storage.
- Wired Approval Gate to shell navigation for the Security surface.

### Files Touched

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Approval review can now hand risky targets directly to Spock without copying
  target text.
- This makes the security path visible at the moment the user is already
  reviewing a gate.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Audit remaining approval/security surfaces for raw target strings and missing
  Spock handoff actions.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2205 - Front-End Build Steward: Terminal Security Gate Link

### What Changed

- Added `Security Gate` actions to Terminal Lab:
  - Command preview detail.
  - Recent command observation rows.
- The action opens Security Gate and pre-fills the command string through local
  session storage.
- Wired Terminal Lab to shell navigation for the Security surface.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Commands can now move to Spock inspection before a run is even implied.
- This keeps Terminal Lab proposal-only while making the security receipt path
  visible at the risky moment.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Add approval-detail affordances for linked Security Gate receipts.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2203 - Front-End Build Steward: Security Gate Link Detail

### What Changed

- Added explicit linked context fields to Security Gate receipt details:
  - `Project Link`
  - `Source Link`
- Added a selector hint explaining when to link a project/source before
  recording a Spock receipt.
- Existing compact chips remain, but the receipt detail now spells out whether
  a recorded receipt is linked or unlinked.

### Files Touched

- `app/client/src/components/SecurityGatePanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Security Gate receipts now show provenance context as fields, not only as
  badges.
- This keeps Spock receipts readable when the target belongs to a project or
  saved source.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Continue tightening receipt affordances in Terminal Lab and Approval surfaces.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2201 - Front-End Build Steward: Workbench Security Gate Link

### What Changed

- Added a `Security Gate` action to Workbench evidence details when an evidence
  record has a `targetUri`.
- The action opens Security Gate and pre-fills the target through local session
  storage.
- Wired Workbench's panel to shell navigation for the Security surface.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Evidence records with external targets can now move directly into a Spock
  receipt without copying the target manually.
- The handoff stays local-only. It does not browse, fetch, clone, install, or
  execute.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Add source/project receipt linking hints to the Security Gate detail output.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2159 - Front-End Build Steward: Surfer Security Gate Link

### What Changed

- Added a `Security Gate` action to Surfer's approved URL intake row.
- The action opens Security Gate and pre-fills the current URL through local
  session storage.
- Updated Surfer's URL intake copy so unfamiliar URLs route through a Spock
  receipt before public ingestion.
- Wired Surfer's panel to the shell navigation for the Security surface.

### Files Touched

- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Surfer can now hand unfamiliar URLs to Spock before source ingestion.
- This keeps browser/source work visibly approval-gated instead of relying on
  explanatory copy alone.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven/server edits in the worktree were left untouched.

### Next Front-End Slice

- Add Workbench target-to-Security Gate prefill for evidence records with
  `targetUri`.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2155 - Front-End Build Steward: Command Spock Chip

### What Changed

- Added a compact Spock security receipt chip to the command bar.
- The chip shows the latest local security risk state:
  - `Spock clear` when no receipts exist.
  - `Spock low|medium|high|blocked` when receipts exist.
- The chip opens the Security Gate surface.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Spock is now visible in the always-present command surface.
- The signal is passive and local-only. It does not run scanners, browse,
  fetch, clone, install, or execute.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Existing Raven edits in the worktree were left untouched.

### Next Front-End Slice

- Add Security Gate source/project linking hints to Workbench and Surfer target
  flows.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2153 - Front-End Build Steward: Command Security Affordance

### What Changed

- Added a command-preview security affordance for pasted links, GitHub repo
  targets, npm targets, and PyPI targets.
- Intake previews now show a Spock receipt block when a security target is
  detected.
- Added a `Security Gate` action on the intake preview.
- The action opens the Security Gate surface and pre-fills the detected target
  locally through session storage.
- Security Gate consumes the prefilled target once, then clears it.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `app/client/src/components/SecurityGatePanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Pasted risky targets now route toward Spock before Surfer or Tony can become
  the implied next step.
- The affordance is local-only. It does not browse, fetch, clone, install, or
  execute.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Detection is intentionally conservative and client-side.
- Existing Raven edits in the worktree were left untouched.

### Next Front-End Slice

- Add a small latest-security receipt chip in the Keep dock or command bar.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2151 - Front-End Build Steward: Basement Security Indicator

### What Changed

- Added Security Gate status to the Basement overview cards.
- Basement now shows:
  - Recent Spock receipt count.
  - Latest risk state when receipts exist.
  - Risk count when high or blocked receipts exist.
- The Security card opens the Security Gate surface.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Spock is now visible from the Basement overview, not hidden one click deeper.
- Security state reads as a machine posture signal instead of another loose
  panel.

### Known Risks

- Browser screenshot capture was not available in this turn.
- The indicator is read-only and uses the latest 20 local receipts.
- Existing Raven edits in the worktree were left untouched.

### Next Front-End Slice

- Add a Keep/Workshop security affordance for pasted links and repo targets.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2145 - Front-End Build Steward: Security Gate Link Receipts

### What Changed

- Added optional project and source selectors to Security Gate receipt creation.
- Security Gate now passes `projectId` and `sourceId` into local Spock receipt
  records when selected.
- Updated recent security receipts to return linked project/source labels.
- Updated the Security Gate UI so recent receipts and active recorded receipts
  show linked project/source context.

### Files Touched

- `app/client/src/components/SecurityGatePanel.tsx`
- `app/server/routers/securityGate.ts`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Spock receipts no longer have to float as unlinked risk notes.
- Source/project context stays visible in the receipt list without opening a
  target or fetching anything.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Security scanner adapters remain planned, not wired executors.
- Two Raven intake files were already modified in the worktree and were left
  untouched by this slice.

### Next Front-End Slice

- Add a compact Security Gate receipt count or latest-risk indicator to the
  Basement overview.
- Then push this follow-up to the open draft PR.

## 2026-05-08 2139 - Front-End Build Steward: Security Gate Surface

### What Changed

- Added `SecurityGatePanel` as a Basement surface for Spock receipts.
- Wired Security Gate into the Basement nav.
- Security Gate now supports:
  - Local target inspection for URLs, GitHub repos, packages, files, and browser
    targets.
  - Local Spock security receipt creation.
  - Recent append-only receipt list.
  - Scanner plan display with compact source labels.
  - Visible allowed, blocked, finding, and check groups.
- The surface does not browse, clone, download, install, execute, or call
  external services.

### Files Touched

- `app/client/src/components/SecurityGatePanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Spock now has a visible Basement surface instead of being only router
  machinery.
- The user can create a local receipt before any Surfer/Tony action happens,
  which matches the locked security posture.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Security scanner adapters remain planned, not wired executors.
- The form currently records unlinked receipts. Project/source linking can come
  next.

### Next Front-End Slice

- Add optional project/source selection to Security Gate receipt creation.
- Then push a follow-up commit to the open draft PR.

## 2026-05-08 2137 - Front-End Build Steward: Approval Receipt Labels

### What Changed

- Updated Approval Gate receipt labels:
  - Permission preflight list rows now show compact target summaries when a
    target summary exists.
  - Approval preview cards now compact target labels when they are URL-like or
    too dense for list display.
  - Approval detail now shows target label evidence with the raw value preserved
    in a tooltip.
  - Linked permission preflight details now include compact target summary
    evidence.
- Updated the approvals router so linked preflight records expose
  `targetSummary` to the approval detail panel.

### Files Touched

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/server/routers/approvals.ts`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Approval Gate now follows the same receipt rule as Hedwig, Surfer, Project
  Lab, Model Tools, and Workbench: dense lists show readable labels while raw
  evidence remains inspectable.
- This keeps approval review fast without hiding the underlying source/target
  record.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Compact target labels use the shared source label helper, so non-URL strings
  fall back to trimmed plain text.

### Next Front-End Slice

- Build the Security Gate client surface or wire its receipts into an existing
  Basement surface.
- Then push a follow-up commit to the open draft PR.

## 2026-05-08 2132 - Front-End Build Steward: Workbench Target Labels

### What Changed

- Updated Workbench evidence list rows so target receipts show compact target
  labels instead of raw full strings.
- Updated Workbench evidence detail:
  - Source metadata now uses compact source labels when only a URI exists.
  - Target metadata now uses compact target labels.
  - Raw source and target values remain available as tooltips.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Workbench evidence now follows the source/target receipt rule used across the
  Ledger and Basement surfaces.
- Dense receipt lists stay readable while preserving inspectable raw values.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Non-URL target strings fall back to the helper's compact string behavior.

### Next Front-End Slice

- Continue Approval and Security Gate receipt shaping.
- Then move into route-level visual QA when browser tooling is available.

## 2026-05-08 2131 - Front-End Build Steward: Model Tool Source Labels

### What Changed

- Updated Model Tools selected capability details so source receipts use compact
  source labels instead of dense raw URL strings.
- Added local source parsing for comma/newline separated source entries.
- Kept each full raw source URI available as tooltip evidence.

### Files Touched

- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Basement model registry now follows the same source receipt rule as Surfer,
  Hedwig, Output Library, and Project Lab.
- Raw URLs remain part of the record, but dense UI uses readable source labels.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Source entry parsing is intentionally simple: comma or newline separated.

### Next Front-End Slice

- Continue Approval and Security Gate receipt shaping.
- Then run another localhost check and archive pass.

## 2026-05-08 2129 - Front-End Build Steward: Hedwig Source Receipt

### What Changed

- Ran a route-level source receipt audit across Surfer, Hedwig, Output Library,
  and Project Lab source surfaces.
- Added a visible compact source receipt to Hedwig local capture rows:
  - The capture list now shows `Source: <compact label>` directly on each
    captured item with a `sourceUri`.
  - The full raw source URI remains available in the tooltip.
- Kept the existing `Source Detail` action for deeper source review.

### Files Touched

- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Hedwig now matches the current provenance rule: list rows should show source
  origin without requiring a detail click.
- The UI still keeps raw URLs out of dense list text while preserving the raw
  value for inspection.

### Known Risks

- Browser screenshot capture was not available in this turn.
- The visible change is subtle by design. It affects Hedwig capture rows that
  already have a `sourceUri`.

### Next Front-End Slice

- Continue source/project receipt cleanup in Approval surfaces and Model Tools.
- Then run another localhost check and archive pass.

## 2026-05-08 2127 - Front-End Build Steward: Source Label Helper

### What Changed

- Consolidated duplicate source display-label helpers:
  - Added `app/server/displayLabels.ts`.
  - Added `app/client/src/lib/displayLabels.ts`.
  - Updated artifact, surfer, and project intelligence routers to use the
    shared server helper.
  - Updated Hedwig source detail UI to use the shared client helper.
- Verified the duplicate helper scan now shows only the two shared helpers and
  their call sites.

### Files Touched

- `app/server/displayLabels.ts`
- `app/client/src/lib/displayLabels.ts`
- `app/server/routers/artifacts.ts`
- `app/server/routers/surfer.ts`
- `app/server/routers/projectIntelligence.ts`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Duplicate helper scan completed:
  - `app/server/displayLabels.ts`
  - `app/client/src/lib/displayLabels.ts`
  - call sites only elsewhere.

### Front-End Steward Review

- Source receipt language is now easier to keep consistent across Surfer,
  Hedwig, Output Library, and Project Lab.
- The client/server split is intentional. Browser bundles should not import
  server modules.

### Known Risks

- Browser screenshot capture was not available in this turn.
- The same function exists once per runtime boundary. A truly shared package is
  unnecessary until more display helpers accumulate.

### Next Front-End Slice

- Run a route-level visual pass across source receipt surfaces.
- Then continue project receipt cleanup in Project Lab and Approval surfaces.

## 2026-05-08 2125 - Front-End Build Steward: Project Lab Source Receipts

### What Changed

- Added compact source receipt data to Project Lab:
  - Source event rollups now include `uri`.
  - Source event rollups now include `sourceDisplayName`.
  - Project detail source event rows now include `uri`.
  - Project detail source event rows now include `sourceDisplayName`.
- Updated Project Lab UI:
  - Project card recent source events use source display labels when no title
    is present.
  - Project inspector source rows use source display labels when no title is
    present.
  - Project inspector source fields show the compact `Source` receipt.

### Files Touched

- `app/server/routers/projectIntelligence.ts`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Project Lab now matches Surfer, Hedwig, and Output Library for source
  receipts.
- Source provenance reads as compact labels while retaining the underlying raw
  URI in data for inspection.

### Known Risks

- Browser screenshot capture was not available in this turn.
- The same `sourceDisplayName` helper now exists in several routers. It should
  move to a shared helper when the next backend cleanup slice is scheduled.

### Next Front-End Slice

- Run a route-level visual pass across Surfer, Hedwig, Output Library, and
  Project Lab source rows.
- Then consolidate duplicate display-label helpers.

## 2026-05-08 2123 - Front-End Build Steward: Surfer Source Receipts

### What Changed

- Added compact source display labels to Surfer data:
  - `SourceRow` now allows `sourceDisplayName`.
  - `surfer.panel` saved source rows return `sourceDisplayName`.
  - `surfer.panel` source event rows return `sourceDisplayName`.
- Updated Surfer UI:
  - Saved source cards show compact source labels instead of raw full URLs.
  - Source history rows show compact source labels instead of raw full URLs.
  - Full URLs remain available in tooltips.
  - URL ingestion success copy uses source title first, then compact source
    label, then raw URL as fallback.

### Files Touched

- `app/server/cerebroDb.ts`
- `app/server/routers/surfer.ts`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Surfer now matches Output Library and Hedwig: source provenance is compact by
  default, with the full URL still inspectable.
- This remains display-only. No fetch, trust, or enrichment behavior changed.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Source event labels are derived from URL parsing and fall back to truncation
  for non-URL strings.

### Next Front-End Slice

- Carry compact source receipts into Project Lab source event summaries.
- Then run a route-level visual pass across Surfer, Hedwig, Output Library, and
  Project Lab source rows.

## 2026-05-08 2121 - Front-End Build Steward: Source Receipt Labels

### What Changed

- Added compact source display labels for Output Library artifact rows:
  - `artifacts.list` now returns `sourceDisplayName`.
  - Output Library shows `hostname/path` style source receipts.
  - Full source URL remains available in the tooltip.
- Updated Hedwig source proposal detail:
  - Source URL metadata now renders as `Source`.
  - The visible value uses the compact source display label.
  - The full URL remains available in the tooltip.

### Files Touched

- `app/server/routers/artifacts.ts`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Source receipts now read like provenance labels, not pasted raw URLs.
- This is display-only. It does not fetch, enrich, or trust any source.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Source display names are derived from URL parsing. Non-URL strings fall back
  to a truncated raw value.

### Next Front-End Slice

- Continue source receipts into Surfer Sources and source-event surfaces.
- Then run a route-level visual pass when browser inspection is stable.

## 2026-05-08 2118 - Front-End Build Steward: Project Source Labels

### What Changed

- Cleaned up Workbench project/source selector labels:
  - Source link options now join project names.
  - Command link options now join project names.
  - Artifact link options now join project names.
- Updated Workbench UI labels:
  - Source selector no longer shows raw `project <id>` labels.
  - Command selector no longer shows raw `project <id>` labels.
  - Artifact selector now includes the linked project name when known.

### Files Touched

- `app/server/routers/workbench.ts`
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Workbench link selectors now read as receipts instead of database ids.
- This keeps source, command, and artifact links aligned with the run receipt
  normalization already completed.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Remaining raw ids are technical fallback labels or explicit row ids.

### Next Front-End Slice

- Run a browser route pass over Workshop and Ledger once stable inspection is
  available.
- Then continue source receipts in Output Library and Hedwig source surfaces.

## 2026-05-08 2116 - Front-End Build Steward: Workbench Run History

### What Changed

- Finished Workbench run receipts in evidence detail history:
  - Validation history rows now join session title/agent/state data.
  - Comparison history rows now join session title/agent/state data.
  - Both history card types show the run display chip when linked.
- Kept Workbench detail consistent with prior Ledger passes:
  - Main evidence detail uses `sessionDisplayName`.
  - Session link options use saved run titles when present.

### Files Touched

- `app/server/routers/workbench.ts`
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.
- Raw run-label text sweep completed. Remaining `Run #` strings are fallback
  labels when no display name is available, and `claudeSessionId` remains only
  in the Sessions technical id column.

### Front-End Steward Review

- Workbench validation and before/after proof rows now speak the same run
  language as Tasks, Project Lab, Outputs, Memory, and Terminal Lab.
- This closes the obvious run-provenance gaps without adding new execution or
  external-write behavior.

### Known Risks

- Browser screenshot capture was not available in this turn.
- The DOM/runtime check was limited to localhost health. A visual route pass
  should follow when the browser bridge exposes stable inspection again.

### Next Front-End Slice

- Run a full browser route pass over Ledger and Workshop run labels.
- Then continue with the next provenance lane: project receipts and source
  receipts.

## 2026-05-08 2114 - Front-End Build Steward: Memory Run Links

### What Changed

- Added optional run selection to Memory proposal creation.
  - New proposals can now carry `sessionId` from the UI.
  - Proposed and saved memory rows already show the run receipt when linked.
- Swept visible raw run labels:
  - Tasks run filters now use saved run titles when present.
  - Terminal Lab session selector and observation chips now use display names.
  - Workbench session link selector now uses display names.
  - Workbench evidence detail now receives and shows `sessionDisplayName`.
- Extended Workbench router session link options:
  - Link options now compute display names from saved run title or fallback
    active/closed agent/project labels.

### Files Touched

- `app/client/src/components/MemoryPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Memory proposals can now join the same run proof trail at creation time.
- Remaining raw session ids are fallback labels or technical receipts, not the
  primary visible path.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Workbench validation/comparison history rows may still lack display names if
  they are rendered from minimal historical queries.

### Next Front-End Slice

- Add run receipts to Workbench validation/comparison history if they appear in
  the detail panel.
- Then do a compact browser DOM pass over Ledger and Workshop run labels.

## 2026-05-08 2109 - Front-End Build Steward: Session Filters

### What Changed

- Added session filtering to Output Library:
  - `artifacts.list` accepts `sessionId`.
  - Output Library has an `All Runs` filter row.
  - Durable vault artifact writes can optionally link to a run.
- Added session filtering to Memory:
  - `memory.list` accepts `sessionId`.
  - `memory.proposals` accepts `sessionId`.
  - Memory has an `All Runs` filter row that filters saved entries and
    proposals together.
- Kept Obsidian note writes unchanged:
  - The optional run selector applies to vault artifact writes.
  - Obsidian note writes still use the existing Obsidian writer path.

### Files Touched

- `app/server/routers/artifacts.ts`
- `app/server/routers/memory.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `pnpm check` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Output and Memory now let the user narrow Ledger receipts by the same titled
  run labels used in Tasks and Project Lab.
- The run link on durable artifact writes makes manual reports and drafts part
  of the same proof trail.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Filter counts are local to the currently loaded filtered rows, not global
  aggregate counts.

### Next Front-End Slice

- Add optional run selection to Memory proposal creation.
- Add a compact linked-run column or chip to any remaining Ledger surfaces that
  still expose raw `sessionId`.

## 2026-05-08 2105 - Front-End Build Steward: Output Memory Run Receipts

### What Changed

- Carried run display receipts into more Ledger paths:
  - `outputs.list` now returns `sessionDisplayName`.
  - `artifacts.list` now returns `sessionDisplayName`.
  - `memory.list` now returns `sessionDisplayName`.
  - `memory.proposals` now returns `sessionDisplayName`.
  - `memory.approveProposal` now returns the joined run display label after
    writing a proposal.
- Updated visible Ledger surfaces:
  - Output Library artifact rows show the run receipt when linked.
  - Memory proposal rows show the run receipt when linked.
  - Saved Memory rows show the run receipt when linked.
- Preserved the title-aware path from the editable Sessions ledger:
  - If a run has a saved title, Output and Memory receipts show that title.
  - Untitled runs still fall back to derived active/closed agent/project labels.

### Files Touched

- `app/server/cerebroDb.ts`
- `app/server/routers/outputs.ts`
- `app/server/routers/artifacts.ts`
- `app/server/routers/memory.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `pnpm check` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Tasks, Project Lab, Output Library, and Memory now share the same run receipt
  vocabulary.
- The Ledger is closer to a single proof trail: task, output, artifact, and
  memory rows can now point back to the same titled run.

### Known Risks

- Browser screenshot capture was not available in this turn.
- Output Library writes still do not expose a session picker. This pass only
  displays receipts when a session is already linked.

### Next Front-End Slice

- Add session filters to Output Library and Memory.
- Then add optional session selection to durable Output Library writes.

## 2026-05-09 - Agent Reach Source Requirement

### What Changed

- Recorded `Panniantong/Agent-Reach` as a non-negotiable source-access
  reference for Raven, Surfer, and future CereBro agents.
- Verified MIT license from the repository `LICENSE`.
- Recorded current HEAD fingerprint:
  `17624268a059ccfb23eba8a2ba50f9f92c8dc0ca`.
- Added Agent Reach to:
  - `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`
  - `CereBro_Final_Implementation_Pack/LICENSE_REVIEW_MATRIX.md`
  - `CEREBRO_MASTER_BUILD_PLAN.md`
  - Raven's Obsidian project plan
  - Raven build history
  - Obsidian GitHub source notes
- Decision: use Agent Reach's channel registry, doctor/watch health checks,
  source-risk classification, credential-needs metadata, and upstream-tool
  handoff pattern.
- No install, clone, script execution, cookie extraction, proxy setup, media
  download, MCP server setup, or browser automation was performed.

### Files Touched

- `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`
- `CereBro_Final_Implementation_Pack/LICENSE_REVIEW_MATRIX.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`
- Obsidian:
  - `10_Projects/Raven/Raven.md`
  - `20_Knowledge/Sources/GitHub/Agent Reach/Agent Reach Repository Source.md`
  - `90_Archive/Raven Build History/Raven Build History.md`
  - `90_Archive/Raven Build History/snapshots/2026-05-09 Agent Reach Source Requirement.md`

### Checks Run

- GitHub repository inspection only.
- `git ls-remote https://github.com/Panniantong/Agent-Reach HEAD` returned
  `17624268a059ccfb23eba8a2ba50f9f92c8dc0ca`.
- Fetched `LICENSE`, `pyproject.toml`, `docs/install.md`, and `SECURITY.md`
  through the GitHub connector.

### Known Risks

- Agent Reach has a broad install surface: `pipx`/`pip`, upstream tools,
  optional Playwright, `browser-cookie3`, cookies, proxies, MCP servers, and
  download-capable tools.
- Reddit and X/Twitter richer lanes depend on cookies or other sensitive setup.
- For Raven, Agent Reach must not write Raven data on this Mac.
- For CereBro, Agent Reach must not bypass Aang, Cortana, Spock, the Approval
  Queue, Ledger receipts, or per-channel approval.

### Next Slice

- Design a shared `SourceGateway` interface for Raven and CereBro using the
  Agent-Reach-shaped channel model.
- Start with public/manual lanes only.
- Keep cookie, proxy, download, MCP, browser automation, and watcher channels
  disabled until Spock records a channel receipt and the user approves.

## 2026-05-08 2100 - Front-End Build Steward: Editable Run Ledger

### What Changed

- Added local run metadata to the Sessions ledger:
  - `sessions.title`
  - `sessions.notes`
  - Existing databases get both columns through an additive migration.
- Updated session display naming:
  - A saved run title now becomes the canonical display name.
  - Untitled runs still fall back to derived active/closed agent/project labels.
- Added `sessions.updateLedger`:
  - Updates only local Ledger title and notes.
  - Does not touch Claude session ids, project ownership, or external systems.
- Updated front-end surfaces:
  - Sessions ledger rows show saved notes under the run label.
  - Each row has a compact inline editor for title and notes.
  - Task receipts and Project Lab receipts inherit saved run titles through the
    existing `sessionDisplayName` path.

### Files Touched

- `app/server/cerebroDb.ts`
- `app/server/routers/sessions.ts`
- `app/server/routers/tasks.ts`
- `app/server/routers/projectIntelligence.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/client/src/components/SessionsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `pnpm check` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- The Sessions ledger now has user-authored labels instead of only generated
  labels.
- The edit UI stays compact and visible. No hidden automation, external write,
  or approval side effect was added.

### Known Risks

- The inline editor has not had screenshot QA in this turn.
- Run notes are currently visible only in Sessions. Outputs and Memory should
  consume the same run label path next.

### Next Front-End Slice

- Carry `sessionDisplayName` into Outputs and Memory receipt rows.
- Then add a small session filter where those surfaces already support project
  or source filtering.

## 2026-05-08 2053 - Front-End Build Steward: Human Run Labels

### What Changed

- Added a shared session display-name contract:
  - `sessions.list` now returns `displayName`.
  - Display names include active/closed state, agent class, run id, and project
    name when known.
- Extended task session receipts:
  - `tasks.list` and `tasks.create` now return `sessionDisplayName` when a task
    is linked to a run.
  - Project Lab recent tasks now receive the same session display label.
- Updated front-end surfaces:
  - Sessions ledger shows the readable run name in the first column.
  - Tasks create-row run selector uses the readable label.
  - Tasks row receipts show the readable label instead of only `Run #id`.
  - Project Lab task receipts show the readable label when present.

### Files Touched

- `app/server/cerebroDb.ts`
- `app/server/routers/sessions.ts`
- `app/server/routers/tasks.ts`
- `app/server/routers/projectIntelligence.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `pnpm check` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- Runs now have a human-readable receipt across Ledger and Project Lab.
- The label is computed in the router, not stored as duplicate database state.
- This keeps provenance visible while preserving the compact shell density.

### Known Risks

- The label is still derived from `hero_class`; future user-facing run titles
  should become canonical once the Sessions ledger supports naming.
- Browser screenshot capture was not available in this turn.

### Next Front-End Slice

- Add editable local run titles or run notes to the Sessions ledger.
- Then use those titles in Tasks, Project Lab, Outputs, and Memory receipts.

## 2026-05-08 2042 - Front-End Build Steward: Task Session Linkage

### What Changed

- Added first-class session linkage to Ledger tasks:
  - `tasks.session_id` is now part of the schema.
  - Existing local databases get the column through an additive migration.
  - `idx_tasks_session` is created after the migration gate, so older
    databases do not fail boot.
- Updated task router behavior:
  - Task list rows now return `sessionId`, session started time, and the
    linked Claude session id when present.
  - `tasks.list` can filter by `sessionId`.
  - `tasks.create` accepts `sessionId`.
  - If a task is created with a session and no explicit project, the task
    inherits the session project.
- Linked generated work:
  - Terminal Lab follow-up tasks now keep the originating observation session.
  - Hedwig capture tasks now keep the originating capture session when present.
- Updated front-end surfaces:
  - Tasks panel has a compact optional run selector in the create row.
  - Task rows show a small `Run #` receipt when linked.
  - Tasks panel now has a compact run filter row.
  - Run selector labels show active/closed state and project name when known.
  - Project Lab current-task rows show the linked run id when present.

### Files Touched

- `app/server/cerebroDb.ts`
- `app/server/routers/tasks.ts`
- `app/server/routers/terminalLab.ts`
- `app/server/routers/hedwig.ts`
- `app/server/routers/projectIntelligence.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `pnpm test -- server/cerebro-foundations.test.ts` passed.
- `curl -I http://localhost:3002/` returned `HTTP/1.1 200 OK`.

### Front-End Steward Review

- This is the first functional bridge after the visual normalization pass.
- The UI now shows task provenance in a small receipt instead of turning runs
  into a large new surface.
- Project Lab remains read-only for task creation. It now reflects session
  linkage without adding hidden writes.

### Known Risks

- Browser screenshot capture was not available in this turn, so visual QA used
  runtime availability plus TypeScript and router tests.
- Run filter counts are intentionally local to the current task query. A later
  aggregate endpoint can make cross-filter counts exact if needed.

### Next Front-End Slice

- Continue linking command observations, tasks, and Project Lab into a clearer
  “this came from that run” trail.
- Add richer session names once the session ledger has user-facing run titles.

## 2026-05-08 2036 - Front-End Build Steward: Viewport Polish

### What Changed

- Ran a viewport-oriented DOM pass after the broad four-zone QA.
- Applied a small shell polish patch:
  - Shortened the Ask Aang placeholder from `Ask Aang. He will read the mode
    before Cortana routes it.` to `Ask Aang. Cortana routes it.`
  - Gave Keep view toggles explicit accessible names:
    - `Show Keep blueprint view`
    - `Show Keep scene view`
  - Changed visible Keep view toggle labels from lowercase `blueprint` /
    `scene` to `Blueprint` / `Scene`.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Native-control audit remains clean outside shared primitive internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`
- Browser DOM/runtime checks passed:
  - No `Unexpected Error`.
  - `Show Keep blueprint view` count: 1.
  - `Show Keep scene view` count: 1.
  - Short Ask Aang placeholder count: 1.

### Front-End Steward Review

- The command bar now fits the compact shell better.
- Keep view toggles now have clearer names for browser automation and assistive
  tech.

### Known Risks

- Screenshot capture is still not reliable through the current browser bridge.
- Further visual polish should stay small and route-specific until screenshot
  QA works.

### Next Front-End Slice

- Either continue small live-browser polish patches or switch from UI cleanup
  into the next functional build slice.

## 2026-05-08 2034 - Front-End Build Steward: Broad Visual QA

### What Changed

- Ran a broad four-zone browser QA pass after the primitive normalization,
  dead-code cleanup, and density work.
- No corrective patch was needed in this pass.

### Files Touched

- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Native-control audit remains clean outside shared primitive internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`
- Browser DOM/runtime checks passed:
  - Keep renders with castle/blueprint content.
  - Ask Aang command input count: 1.
  - Tools button count: 1.
  - Workshop renders Workbench.
  - Workshop exposes Project Lab, Terminal Lab, and Research exact route
    buttons.
  - Ledger renders overview.
  - Ledger exposes Tasks, Outputs, and Memory route buttons.
  - Basement renders overview.
  - Basement exposes Settings, Models, and Automation route buttons.
  - Tools menu exposes Skills and Clear Sessions menu items.
  - No `Unexpected Error` in any checked zone.

### Front-End Steward Review

- The app is stable after the normalization and density passes.
- Current route duplication is intentional where overview cards and zone tabs
  both expose the same destinations.
- Remaining native control matches live inside shared primitives only.

### Known Risks

- This pass used DOM/runtime QA. Screenshot capture still has not been reliable
  enough for a screenshot-first visual review.
- Fine visual issues may remain in dense rows until a screenshot/manual
  viewport pass is done.

### Next Front-End Slice

- Do a screenshot/manual viewport polish pass when image capture cooperates.
- Otherwise continue with small targeted visual patches from the live browser:
  dense row line-height, card heights, and mobile wrapping.

## 2026-05-08 2032 - Front-End Build Steward: Ledger Basement Density

### What Changed

- Continued density and hierarchy work through Ledger and Basement detail
  panels.
- Tightened Ledger panels:
  - `TasksPanel`
  - `SessionsPanel`
  - `ArtifactsPanel`
  - `MemoryPanel`
  - `ApprovalDashboardPanel`
- Tightened Basement panels:
  - `ConfigPanel`
  - `ModelToolsPanel`
  - `PiccoloPanel`
- Reduced first-level header, status strip, form, filter, list, and card
  spacing across those panels.
- Kept behavior unchanged. No new execution, write, approval, fetch, scheduling,
  or cleanup behavior was added.

### Files Touched

- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/MemoryPanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/ConfigPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/components/PiccoloPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Native-control audit remains clean outside shared primitive internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`
- Browser DOM/runtime checks passed:
  - No `Unexpected Error`.
  - Ledger route rendered.
  - Tasks panel rendered.
  - Basement route rendered.
  - Model Registry rendered.

### Front-End Steward Review

- Ledger and Basement panels now better match Workshop and shell density.
- Repeated destination controls count twice in the browser because both the zone
  tabs and overview cards expose the same routes. That is expected.
- The pass stayed focused on first-level layout density. Deep inspector content
  can still be tuned separately.

### Known Risks

- This was DOM/runtime QA, not screenshot QA.
- Some panels may now need visual line-height review in dense rows, especially
  Output Library and Approval Queue.

### Next Front-End Slice

- Run a broad visual QA pass across Keep, Workshop, Ledger, and Basement.
- If screenshot capture still fails, use DOM probes plus selective manual
  browser inspection and keep diffs small.

## 2026-05-08 2030 - Front-End Build Steward: Workshop Density

### What Changed

- Continued visual density and hierarchy work through the live Workshop
  surfaces.
- Tightened `WorkbenchPanel`:
  - Smaller header band.
  - Smaller status text.
  - Reduced main gutter and grid gaps.
  - Denser evidence lane cards.
  - Smaller first-level summary blocks.
- Tightened `TerminalLabPanel`:
  - Smaller header/status strip.
  - Reduced command form spacing.
  - Reduced main content gutter.
  - Narrowed the right column slightly.
- Tightened `SurferSourcesPanel`:
  - Smaller header/status strip.
  - Reduced research/public URL form spacing.
  - Reduced main content gutter.
  - Narrowed the right column slightly.
- Tightened `ProjectLabPanel`:
  - Smaller header/status strip.
  - Reduced filter/control band spacing.
  - Reduced project grid gutter and first-level card padding.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Native-control audit remains clean outside shared primitive internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`
- Browser DOM/runtime checks passed:
  - No `Unexpected Error`.
  - Workbench visible after opening Workshop.
  - `Open Terminal Lab` exact button count: 1.
  - `Open Research` exact button count: 1.
  - `Open Project Lab` exact button count: 1.
  - Terminal Lab visible after opening Terminal Lab.
  - Surfer Sources visible after opening Research.
  - Project Lab visible after opening Project Lab.

### Front-End Steward Review

- Workshop now feels closer to the compact shell density instead of carrying
  large prototype-era gutters.
- The pass stayed at the first-level layout layer. Deep inspector/detail
  surfaces were not rewritten in this slice.

### Known Risks

- This is still DOM/runtime QA, not screenshot QA.
- Browser-tool output again included a Statsig network warning from the in-app
  harness, not from CereBro.
- Workbench remains the largest dense panel. Its deep evidence inspector should
  get a separate pass if it feels visually heavy.

### Next Front-End Slice

- Continue density pass through Ledger detail panels or Basement detail panels.
- Then do screenshot-based visual review when browser image capture cooperates.

## 2026-05-08 2025 - Front-End Build Steward: Zone Content Density

### What Changed

- Continued visual hierarchy work inside the live zone content.
- Tightened Keep view controls:
  - Reduced floor/view control band padding.
  - Reduced floor button height.
  - Reduced empty Hub callout size.
- Tightened Keep first-action dock:
  - Reduced bottom/side inset.
  - Reduced grid gap and padding.
  - Reduced state block and action-card padding.
  - Hid secondary action metadata until wider viewports.
- Tightened Ledger overview:
  - Reduced page padding and grid gaps.
  - Reduced intro band padding and copy scale.
  - Reduced metric-card padding and value size.
  - Reduced Receipt Rules block density.
- Tightened Basement overview with the same pattern:
  - Smaller intro band.
  - Smaller configuration cards.
  - Smaller Configuration Rules block.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Native-control audit remains clean outside shared primitive internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`
- Browser DOM/runtime checks passed:
  - No `Unexpected Error`.
  - Ledger overview and Receipt Rules visible after opening Ledger.
  - Basement overview and Configuration Rules visible after opening Basement.
  - Keep first-action dock controls present:
    - `Evidence: Open Workshop`
    - `Resume: Active work`
    - `Approvals: Waiting gates`
    - `Capture: Hedwig intake`

### Front-End Steward Review

- The live content layer now better matches the tighter shell density.
- Ledger and Basement overview cards read more like operational summaries than
  landing-page blocks.
- Keep first actions remain available without taking as much vertical space
  over the castle/blueprint.

### Known Risks

- This is still DOM/runtime QA, not screenshot QA.
- The visible-text probe does not reliably see bottom overlay text, so use role
  checks for the Keep first-action dock.

### Next Front-End Slice

- Continue into Workshop panel spacing and dense panel headers.
- Then run a broad visual QA pass when screenshot capture is reliable.

## 2026-05-08 2022 - Front-End Build Steward: Shell Density Pass

### What Changed

- Started the visual density and hierarchy pass on the live four-zone shell.
- Tightened the global header:
  - Reduced vertical padding.
  - Reduced mark size.
  - Added a compact active-zone receipt in the center.
- Tightened the left zone rail:
  - Reduced rail width.
  - Reduced item padding.
  - Added a small framed glyph cell for the active zone.
  - Hid rail blurbs until wider viewports.
- Tightened the zone surface row:
  - Reduced padding and tab height.
  - Added a compact zone marker.
  - Hid surface metadata until wider viewports.
  - Tightened receipt badges.
- Tightened the context panel:
  - Reduced width from `w-72` to `270px`.
  - Reduced section padding and text scale in dense receipt areas.
- Tightened the Ask Aang command bar:
  - Reduced vertical padding.
  - Reduced mode/input/action heights.
  - Hid the explanatory routing sentence until `2xl`.
  - Reduced route-preview width.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Native-control audit remains clean outside shared primitive internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`
- Browser DOM/runtime check passed:
  - No `Unexpected Error`.
  - Permission mode control count: 1.
  - Tools control count: 1.
  - `Open Workshop` exact button count: 1.
  - `Open Project Lab` exact button count after opening Workshop: 1.
  - Ask Aang input count: 1.

### Front-End Steward Review

- The first viewport should now feel more like a compact operational shell and
  less like stacked prototype bands.
- The active zone is visible in the header without requiring the user to parse
  the left rail.
- The command bar takes less height while preserving route preview and hard-gate
  language.

### Known Risks

- This was DOM/runtime QA, not a screenshot-reviewed visual pass.
- `Open Keep` still has two exact matches because both the left rail and zone
  surface expose Keep. That is expected. Workshop and Project Lab remain single
  exact targets.
- Browser-tool output included a Statsig network warning from the in-app harness,
  not from the CereBro app.

### Next Front-End Slice

- Continue visual hierarchy into zone content: Keep first-action dock, Ledger
  overview cards, Basement overview cards, and Workshop panel spacing.
- Then do a screenshot-based review if the browser image path cooperates.

## 2026-05-08 2016 - Front-End Build Steward: Dead Fork Cleanup

### What Changed

- Removed confirmed unused old fork/showcase components:
  - `AIChatBox.tsx`
  - `AgentPanel.tsx`
  - `DashboardLayout.tsx`
  - `DashboardLayoutSkeleton.tsx`
  - `HeroPanel.tsx`
  - `Onboarding.tsx`
  - `TranscriptInput.tsx`
  - `pages/ComponentShowcase.tsx`
- Cleaned the stale Onboarding import comment from `Home.tsx`.
- Confirmed `App.tsx` only routes `/` and `/404`; `ComponentShowcase` was not
  reachable from the app router.
- Confirmed deleted components had no remaining source references after cleanup.
- Re-ran the native-control audit. Remaining matches are only shared primitive
  internals:
  - `components/ui/input.tsx`
  - `components/ui/textarea.tsx`
  - `components/ui/sidebar.tsx`

### Files Touched

- `app/client/src/components/AIChatBox.tsx` deleted
- `app/client/src/components/AgentPanel.tsx` deleted
- `app/client/src/components/DashboardLayout.tsx` deleted
- `app/client/src/components/DashboardLayoutSkeleton.tsx` deleted
- `app/client/src/components/HeroPanel.tsx` deleted
- `app/client/src/components/Onboarding.tsx` deleted
- `app/client/src/components/TranscriptInput.tsx` deleted
- `app/client/src/pages/ComponentShowcase.tsx` deleted
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- Reference audit passed for deleted component names.
- Native-control audit passed for active app code; remaining matches are shared
  primitive internals only.
- `pnpm check` passed.
- Browser DOM/runtime check passed:
  - No `Unexpected Error`.
  - `Open Workshop` exact button count: 1.
  - `Open Project Lab` exact button count after opening Workshop: 1.

### Front-End Steward Review

- The active app is no longer carrying a large dead showcase/fork control
  surface.
- The primitive normalization pass now has a clean audit boundary: shared UI
  internals are the only native controls left.
- The duplicate `Open Keep` target is expected because both left rail and zone
  surface expose Keep. Workshop and Project Lab remain exact single targets.

### Known Risks

- If the old showcase route is wanted later, it should be rebuilt against the
  CereBro primitive system instead of restored wholesale.
- If onboarding returns, it should be written as a CereBro setup flow rather
  than reusing the deleted fork wizard.

### Next Front-End Slice

- Move from primitive cleanup into visual density and hierarchy review across
  the four live zones.
- Start with the live first viewport: header, left rail, zone surface row,
  command bar, and context panel spacing.

## 2026-05-08 2013 - Front-End Build Steward: Utility Surfaces

### What Changed

- Normalized `HandoffArchivePanel` close control and size chip with shared
  primitives.
- Normalized `ErrorBoundary` reload action with the shared destructive button
  primitive.
- Audited reachability for remaining native-control files.
- Confirmed `ErrorBoundary` is live through `App.tsx`.
- Confirmed `HandoffArchivePanel` exists but is not currently wired into the
  live shell.
- Confirmed the remaining native-control matches are old fork/showcase or
  disabled onboarding surfaces:
  - `HeroPanel`
  - `Onboarding`
  - `TranscriptInput`
  - `AgentPanel`
  - `AIChatBox`
  - `DashboardLayout`
  - Shared ui internals: `input`, `textarea`, `sidebar`

### Files Touched

- `app/client/src/components/HandoffArchivePanel.tsx`
- `app/client/src/components/ErrorBoundary.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused utility native-control audit passed for `HandoffArchivePanel` and
  `ErrorBoundary`.
- Browser DOM/runtime check passed:
  - No `Unexpected Error`.
  - Global permission mode control count: 1.
  - Tools control count: 1.
  - `Open Workshop` exact button count: 1.

### Front-End Steward Review

- The live error fallback now uses the shared destructive action shape.
- The handoff archive proposal surface is closer to the shared control grammar,
  although it is not currently a live route.
- The remaining raw controls should not be normalized blindly. They should be
  deleted if dead, or redesigned if reintroduced.

### Known Risks

- `ComponentShowcase` still imports `AIChatBox`. That page is not the live
  CereBro shell, but it may still compile as a dev route.
- `Onboarding` is currently commented out in `Home.tsx`; re-enabling it would
  reintroduce old native controls.
- `DashboardLayout`, `AgentPanel`, `HeroPanel`, and `TranscriptInput` appear to
  be old fork surfaces. Confirm before deleting.

### Next Front-End Slice

- Decide dead-code cleanup versus normalization for old fork panels.
- Preferred next move: remove or quarantine confirmed dead fork components
  instead of spending polish on surfaces that CereBro no longer uses.

## 2026-05-08 1958 - Front-End Build Steward: Skills Manager

### What Changed

- Normalized `SkillsManager`, which is still reachable from the live Tools
  menu.
- Replaced editor close/save/cancel controls with shared buttons.
- Replaced the editor textarea with the shared textarea primitive.
- Replaced modal close, Agents/Skills tabs, Global/Project scope controls,
  Refresh, New, row copy/edit/delete icon controls, project selector, and new
  item name input with shared primitives.
- Replaced the browser `confirm()` delete path with a shared hard-gate dialog.
- Ran a focused audit. `SkillsManager.tsx` now has no raw `<button>`,
  `<input>`, `<textarea>`, `<select>`, or `confirm()` use.

### Files Touched

- `app/client/src/components/SkillsManager.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused `SkillsManager` native-control audit passed.
- Browser DOM/runtime check passed:
  - No `Unexpected Error`.
  - Tools menu opens.
  - Skills menu item opens the Claude Code Manager.
  - Close control count: 1.
  - New Agent/Skill control count: 1.

### Front-End Steward Review

- The last reachable Tools modal now follows the shared primitive system.
- Destructive agent/skill deletion is now shaped as an explicit hard gate.
- This still edits real Claude Code agent/skill files through the existing
  mutation paths, so future UX should make scope and destination more visible.

### Known Risks

- `SkillsManager` still has old fork styling and copy. Controls are normalized,
  but the surface needs a CereBro visual-density redesign later.
- Remaining raw controls are now mostly legacy/dead or shell-error surfaces:
  `ErrorBoundary`, `TranscriptInput`, `AIChatBox`, `AgentPanel`,
  `DashboardLayout`, `HeroPanel`, `Onboarding`, and `HandoffArchivePanel`.
- `HandoffArchivePanel` may still be useful if it is wired anywhere. Audit
  reachability before rewriting.

### Next Front-End Slice

- Sweep `HandoffArchivePanel`, `ErrorBoundary`, and any reachable utility
  surfaces.
- Then either normalize or delete confirmed dead fork panels.

## 2026-05-08 1955 - Front-End Build Steward: Active Surface Leftovers

### What Changed

- Continued the primitive normalization pass through active CereBro leftovers.
- Replaced the global permission-mode native select with the shared select
  primitive.
- Normalized Design Review controls:
  - Target/status/project/evidence selects now use shared selects.
  - Checklist toggles now use the shared checkbox primitive.
- Normalized Aang Companion controls:
  - Close, local-state controls, event-route cards, and chips now use shared
    buttons and badges.
- Normalized remaining Model Registry capability row controls.
- Normalized Basement Configuration copy/close controls.
- Replaced the Workbench temporary media file control with the shared input
  primitive.
- Ran a focused audit across the changed active files. No raw native controls
  remain in:
  - `PermissionModeControl.tsx`
  - `DesignReviewPanel.tsx`
  - `AangCompanionPanel.tsx`
  - `ModelToolsPanel.tsx`
  - `ConfigPanel.tsx`
  - `WorkbenchPanel.tsx`

### Files Touched

- `app/client/src/components/PermissionModeControl.tsx`
- `app/client/src/components/DesignReviewPanel.tsx`
- `app/client/src/components/AangCompanionPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/components/ConfigPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused active-file native-control audit passed.
- Browser DOM/runtime check passed:
  - No `Unexpected Error`.
  - Global permission mode control count: 1.
  - Context panel control count: 1.
  - `Open Workshop` exact button count: 1.
  - `Open Project Lab` exact button count: 1.

### Front-End Steward Review

- The active shell, Workshop, Ledger, Basement, Design Review, and Aang
  Companion surfaces now speak the shared primitive language.
- The permission mode selector is no longer a native browser island in the
  header.
- Design Review remains local-record-only and does not patch code or start
  browser/command/file actions.

### Known Risks

- Remaining raw controls are mostly legacy or secondary surfaces:
  `SkillsManager`, `ErrorBoundary`, old `AgentPanel`, `HeroPanel`,
  `AIChatBox`, `TranscriptInput`, `DashboardLayout`, `HandoffArchivePanel`, and
  `Onboarding`.
- `SkillsManager` is still reachable from the Tools menu and should be the next
  cleanup target.
- Browser screenshot capture was not used for this pass.

### Next Front-End Slice

- Normalize `SkillsManager` because it remains reachable from the live Tools
  menu.
- Then sweep `HandoffArchivePanel` and the old fork panels or delete confirmed
  dead code.

## 2026-05-08 1951 - Front-End Build Steward: Home Shell Controls

### What Changed

- Continued the front-end primitive normalization pass through the Home shell.
- Replaced remaining native Home buttons and input with shared primitives:
  - Activity log close.
  - Clear Sessions hard-gate footer actions.
  - Keep floor/view toggles.
  - Keep first-action dock.
  - Zone surface buttons.
  - Ledger and Basement overview card buttons.
  - Intake preview Create Task and Dismiss actions.
  - Context-panel agent/session badges and session row controls.
  - Command mode buttons, Ask Aang input, route-preview chips, Attach, and
    Preview.
- Replaced Home-shell custom chips with shared badges.
- Tightened zone surface accessible names so `Open Project Lab` resolves as an
  exact browser target while keeping the surface metadata visible/title-backed.
- Ran a focused Home native-control audit. `Home.tsx` now has no raw
  `<button>`, `<input>`, `<textarea>`, or `<select>` controls.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused Home native-control audit passed.
- Browser DOM/runtime check passed:
  - No `Unexpected Error`.
  - `Open Workshop` exact button count: 1.
  - `Open Project Lab` exact button count: 1.
  - `Open Terminal Lab` exact button count: 1.
  - Project Lab visible after opening Workshop.

### Front-End Steward Review

- The global shell now uses the same control grammar as the normalized Ledger,
  Workshop, Project Lab, and Basement panels.
- Browser automation can target Project Lab directly again.
- The hard-gate Clear Sessions modal still uses the shared destructive action.

### Known Risks

- This was DOM/runtime QA, not screenshot QA.
- Button-as-card layouts should still get visual screenshot review once capture
  is reliable again.
- A few informational cards remain custom non-interactive surfaces. That is
  acceptable for now because they are not controls.

### Next Front-End Slice

- Sweep any remaining build-only or rarely used component surfaces for raw
  controls.
- Then do a broader visual density pass across the four zones.

## 2026-05-08 1941 - Front-End Build Steward: Project Lab Runtime Check

### What Changed

- Browser-checked Workshop after the Project Lab normalization pass.
- Confirmed via DOM snapshot:
  - No `Unexpected Error` screen is visible.
  - Workshop is visible.
  - Project Lab content is visible.
- The specific browser locator for `Open Project Lab` did not resolve by that
  exact accessible name, but Project Lab content was already present in the
  Workshop snapshot.

### Files Touched

- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- Browser DOM/runtime check passed for Workshop / Project Lab visibility.
- Prior `pnpm check` for Project Lab passed.

### Front-End Steward Review

- Project Lab remains renderable after the large control normalization pass.
- Accessible naming for the Project Lab route button should be tightened later
  so browser automation can target it directly.

### Known Risks

- This remains DOM/runtime QA, not screenshot QA.
- Project Lab route button accessible naming should be audited with the Home
  shell pass.

### Next Front-End Slice

- Continue Home shell and route button accessibility/control normalization.
- Then sweep build-only surfaces.

## 2026-05-08 1941 - Front-End Build Steward: Project Lab Inspector

### What Changed

- Continued Project Lab normalization through the local inspector.
- Replaced inspector Hide, queue tabs, search, reset, type filters, sort
  filters, detail row selectors, draft note textarea, append-note button,
  selectable status blocks, empty-state buttons, signal blocks, and recent-list
  row controls with shared primitives.
- Added shared `Input` and `Textarea` usage to Project Lab.
- Ran a focused Project Lab native-control audit.
- The audit found no raw `<button>`, `<input>`, `<textarea>`, or `<select>`
  controls in `ProjectLabPanel`.
- Kept Project Lab read-only/proposal-only. No repo edits, command execution,
  GitHub writes, external writes, or task behavior changes were added.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused Project Lab native-control audit passed.

### Front-End Steward Review

- Project Lab is no longer a major native-control island.
- The inspector now shares the same button/input/textarea/badge language as
  Ledger, Workshop, and Basement surfaces.

### Known Risks

- Project Lab is large. The native-control audit is clean, but browser visual
  QA is still needed for dense button-as-row/card layouts.
- Screenshot capture has timed out in this browser session, so use DOM/runtime
  checks until screenshots recover.

### Next Front-End Slice

- Browser-check Workshop / Project Lab runtime.
- Then continue shell/Home remaining raw controls and less-used build-only
  surfaces.

## 2026-05-08 1939 - Front-End Build Steward: Project Lab Cards

### What Changed

- Continued Project Lab primitive normalization into the project card area.
- Replaced project Inspect controls with shared buttons.
- Replaced priority/status/rank pills with shared badges.
- Replaced local draft-action buttons with shared buttons.
- Replaced recent Terminal observation and Hedwig capture row buttons with
  shared button-as-row controls.
- Replaced worktree dirty-state button with a shared destructive button-as-card
  control.
- Kept all behavior read-only/proposal-only. No repo edits, command execution,
  GitHub writes, task creation behavior change, or external action was added.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- The main Project Lab card list now uses shared button and badge primitives for
  its primary action rows.
- Dirty worktree state remains visually risk-marked.

### Known Risks

- The Project Lab detail inspector still has many bespoke controls.
- Button-as-card layout needs browser QA once the inspector pass is complete.

### Next Front-End Slice

- Normalize Project Lab local inspector header/search/filter controls.
- Then continue nested inspector queue/detail actions.

## 2026-05-08 1938 - Front-End Build Steward: Project Lab Top Filters

### What Changed

- Started the Project Lab normalization pass.
- Replaced the always-visible Project Lab view filter buttons with shared
  buttons.
- Replaced attention signal filter buttons with shared buttons.
- Replaced next-safe-action project cards with shared button-as-card controls.
- Replaced next-safe-action reason pills with shared badges.
- Kept Project Lab read-only. No repo edits, command execution, GitHub writes,
  external writes, or task creation behavior was added.

### Files Touched

- `app/client/src/components/ProjectLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- The top Project Lab control band is now closer to the shared CereBro control
  system.
- This was deliberately bounded because Project Lab is large and contains many
  inspector surfaces.

### Known Risks

- Project Lab still has many bespoke controls in cards, local inspector,
  signal blocks, draft notes, and nested helper components.
- Button-as-card layout needs browser QA once more of the surface is normalized.

### Next Front-End Slice

- Continue Project Lab card and inspector controls in small passes.
- Run a focused Project Lab native-control audit after each pass.

## 2026-05-08 1936 - Front-End Build Steward: Workshop Runtime Check

### What Changed

- Browser-checked the Workshop route after Terminal Lab and Surfer Sources
  control migration.
- Confirmed via DOM snapshot:
  - Workshop route opens.
  - Workbench is visible.
  - Terminal / Terminal Lab is visible.
  - Surfer / Sources is visible.
  - No `Unexpected Error` screen is visible.

### Files Touched

- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- Browser DOM/runtime check passed for Workshop.
- Prior `pnpm check` for the Terminal/Surfer migration passed.

### Front-End Steward Review

- Workshop remains reachable after the normalization pass.
- The main work surfaces are visible together: Workbench, Terminal, and Surfer.

### Known Risks

- This is DOM/runtime QA, not screenshot QA. Screenshot capture has timed out in
  this browser session.
- Project Lab still contains many bespoke controls and is the next major
  Workshop cleanup target.

### Next Front-End Slice

- Normalize Project Lab controls in bounded passes.
- Then browser-check Workshop again.

## 2026-05-08 1935 - Front-End Build Steward: Terminal Surfer Control Audit

### What Changed

- Continued Terminal Lab normalization beyond the intake row.
- Replaced diagnostic draft preview, copy, approval-copy, observation status,
  approval-preview, link, task creation, learning-note, archive, output summary,
  exit-code, and save-summary controls with shared primitives.
- Replaced observed-output textarea and exit-code input with shared primitives.
- Replaced helper `CopyButton` and `ScopeButton` internals with the shared
  button primitive.
- Ran a focused native-control audit across `TerminalLabPanel` and
  `SurferSourcesPanel`.
- The audit found no raw `<button>`, `<input>`, `<select>`, or `<textarea>`
  controls in those two panels.
- No command execution, shell action, external write, package install, approval
  execution, or additional browser action was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused Terminal/Surfer native-control audit passed.

### Front-End Steward Review

- Terminal Lab is now much closer to a governed build surface: local previews,
  local output summaries, and approval previews share the same control grammar.
- Surfer Sources now aligns with the same control grammar while keeping public
  URL ingest visibly risk-marked.

### Known Risks

- Surfer's `Ingest URL` still performs the existing approved public fetch
  immediately after click. A future pass should add a hard-gate receipt.
- Terminal Lab has many local actions. They are normalized but still need a
  clearer grouping pass.

### Next Front-End Slice

- Browser-check Workshop routes after the Terminal/Surfer migration.
- Then continue remaining main surfaces: Project Lab, Config/Basement leftovers,
  and Home shell action buttons.

## 2026-05-08 1933 - Front-End Build Steward: Surfer Terminal Intake Controls

### What Changed

- Continued primitive normalization into Workshop/source surfaces.
- Terminal Lab:
  - Replaced close, command input, Preview button, task link select, and session
    link select with shared primitives.
  - Replaced local chip rendering with the shared badge primitive.
- Surfer Sources:
  - Replaced close, research query input, Preview button, public URL input,
    Ingest URL button, source-history owner filters, and Scrubbed filter with
    shared primitives.
  - Replaced source trust and mini pills with the shared badge primitive.
  - Kept Ingest URL visibly risk-colored because it approves one public fetch.
- No command execution, shell action, external browse beyond existing approved
  URL ingest behavior, install, Notion write, Slack action, or approval
  execution was added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Terminal's top command-intake path now matches the normalized CereBro controls
  while still stating execution is disabled.
- Surfer's source planning and public-ingest forms now use normalized controls
  and clearer risk coloring.

### Known Risks

- Terminal Lab still has deeper native controls in observation diagnostics,
  local output notes, and helper button rows.
- Surfer Sources still permits existing approved public URL ingestion after
  pressing the risk button. A future pass should add a hard-gate receipt before
  public fetch.

### Next Front-End Slice

- Continue Terminal Lab observation/detail controls.
- Then run browser DOM checks on Workshop routes.

## 2026-05-08 1932 - Front-End Build Steward: Terminal Intake Controls

### What Changed

- Continued primitive normalization outside Ledger into `TerminalLabPanel`.
- Replaced Terminal Lab close, command input, Preview button, task link select,
  and session link select with shared primitives.
- Replaced Terminal Lab chips with the shared badge primitive.
- Kept Terminal Lab proposal-only. No command execution, shell action,
  package install, browser action, external write, or approval execution was
  added.

### Files Touched

- `app/client/src/components/TerminalLabPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Terminal Lab's top command intake now matches the normalized CereBro control
  system.
- The surface still clearly says execution is disabled.

### Known Risks

- Lower observation and diagnostic controls in Terminal Lab still contain
  bespoke buttons and native inputs.
- Deeper cleanup should stay local-only and preserve approval-preview behavior.

### Next Front-End Slice

- Normalize Surfer Sources top forms.
- Then return to Terminal Lab's observation/detail action controls.

## 2026-05-08 1927 - Front-End Build Steward: Output Library Controls

### What Changed

- Continued Ledger primitive normalization through the Output Library.
- Replaced Output Library close, kind filters, write kind select, title/body,
  source/subdir fields, and Save control with shared primitives.
- Replaced artifact lifecycle pills with the shared badge primitive.
- Removed the now-unused `stateColor` helper.
- Ran a focused native-control audit across Ledger panels:
  - `TasksPanel`
  - `ArtifactsPanel`
  - `SessionsPanel`
  - `ApprovalDashboardPanel`
  - `MemoryPanel`
- The audit found no raw `<button>`, `<select>`, `<input>`, `<textarea>`, or
  native checkbox controls in those panels.
- No behavior changes were made to durable artifact writes. Existing writes
  still require valid title/body and continue through the existing approved
  write paths.

### Files Touched

- `app/client/src/components/ArtifactsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused Ledger native-control audit passed.

### Front-End Steward Review

- The visible Ledger suite now has a consistent shared-control language across
  Tasks, Sessions, Approvals, Outputs, and Memory.
- Destructive controls and risk-adjacent actions now use the normalized
  destructive/risk surfaces instead of one-off styles.

### Known Risks

- Output writes are still immediate after pressing Save. The UI describes them
  as durable history/draft/report saves, but a future pass should add a hard
  gate or receipt preview for durable writes.
- Browser visual screenshot capture has not recovered yet.

### Next Front-End Slice

- Browser-check Ledger after the Output Library pass.
- Then continue native-control normalization outside Ledger, likely Terminal Lab
  or Surfer Sources.

## 2026-05-08 1925 - Front-End Build Steward: Tasks Sessions Controls

### What Changed

- Restarted the local dev server cleanly. It is running at
  `http://localhost:3002/` under session `31131`.
- Continued Ledger primitive normalization through Tasks and Sessions.
- Replaced Tasks close, add, status advance, delete, filter, cancel, and
  destructive confirm controls with shared primitives.
- Replaced the Tasks input with the shared input primitive.
- Replaced project filter count pills with shared badges inside shared buttons.
- Replaced Sessions close control with the shared button primitive.
- Kept existing task status, delete hard gate, and session polling behavior.

### Files Touched

- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/components/SessionsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Tasks now matches the Ledger destructive/risk-state language used by Memory.
- Sessions had only one visible bespoke control and is now clean at the header.

### Known Risks

- Task status button coloring is now mapped to shared variants instead of custom
  per-status colors. It is more consistent, but less individually colored.
- Outputs remains the largest Ledger form-control island.

### Next Front-End Slice

- Normalize `ArtifactsPanel` / Ledger Output Library controls.
- Run the focused Ledger native-control audit again.

## 2026-05-08 1923 - Front-End Build Steward: Ledger Runtime Audit

### What Changed

- Removed the now-unused `KIND_COLOR` mapping from `MemoryPanel`.
- Ran a focused native-control audit for `ApprovalDashboardPanel` and
  `MemoryPanel`.
- Confirmed the audit returns no raw `<button>`, `<select>`, `<input>`,
  `<textarea>`, or native checkbox matches in those two Ledger panels.
- Browser-checked the Ledger route through the in-app browser.
- Confirmed via DOM snapshot that:
  - Ledger route opens.
  - Approval surfaces are visible.
  - Memory / Knowledge Receipts are visible.
  - No `Unexpected Error` screen is visible.
- Observed that the dev server optimized new Radix dependencies during the
  session and reloaded the browser client.

### Files Touched

- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Focused native-control audit passed for Approval Dashboard and Memory.
- Browser DOM/runtime check passed for Ledger route visibility.

### Front-End Steward Review

- The two highest-visibility Ledger receipt surfaces now use shared primitives
  rather than native control islands.
- Runtime DOM check shows Ledger is rendering after the migrations.

### Known Risks

- Browser log buffer still contains stale HMR/Radix errors from before Vite
  optimized the new dependencies. Restart the dev server before the next visual
  QA pass.
- Screenshot capture still timed out earlier. Use DOM checks until screenshot
  capture succeeds again.

### Next Front-End Slice

- Restart the local dev server cleanly.
- Reopen localhost and check browser logs after a fresh page load.
- Continue Ledger cleanup through Tasks, Sessions, and Outputs if the fresh
  runtime is clean.

## 2026-05-08 1922 - Front-End Build Steward: Memory Receipt Controls

### What Changed

- Continued Ledger control normalization into `MemoryPanel`.
- Replaced memory kind filter buttons with the shared button primitive.
- Replaced memory search and proposal fields with shared input primitives.
- Replaced the proposal kind native select with the shared select primitive.
- Replaced Propose, Close, Delete, Cancel, and Delete Receipt controls with
  shared buttons.
- Replaced custom memory/proposal pills with the shared badge primitive.
- Preserved the existing hard-gate dialog for deleting memory receipts.
- No memory promotion, external write, source fetch, Notion write, Slack action,
  or agent execution was added.

### Files Touched

- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Memory now fits the same Ledger control language as Tasks and Approval
  Dashboard.
- Destructive memory deletion still goes through the hard-gate modal.
- Proposal entry remains local and explicit.

### Known Risks

- `KIND_COLOR` remains only as a legacy mapping and may be removable after a
  small cleanup pass.
- Memory is still a bottom drawer with compact height. It may need a full Ledger
  page version later.

### Next Front-End Slice

- Run a focused native-control audit for visible Ledger panels.
- Browser-check Ledger routes for runtime errors after the control migrations.

## 2026-05-08 1921 - Front-End Build Steward: Approval Ledger Controls

### What Changed

- Continued the Ledger control normalization pass.
- Replaced Approval Dashboard native selects with the shared select primitive:
  - Project filter.
  - Approval preview grouping.
- Replaced approval group cards with shared button-as-card controls while
  preserving local filter behavior.
- Replaced approval preview row cards with shared button-as-card controls while
  preserving selected-detail behavior.
- No approval, rejection, execution, external write, tool call, browser fetch,
  Notion write, Slack action, or command run was added.

### Files Touched

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Approval Dashboard now uses shared input, button, badge, and select primitives
  across the visible filter and receipt-list surfaces.
- It continues to read as an action receipt gate, not an execution surface.

### Known Risks

- Shared button-as-card composition still needs successful screenshot QA.
- Browser console should be rechecked after the Ledger and Memory passes.

### Next Front-End Slice

- Normalize Memory filters and proposal controls.
- Then run browser DOM/runtime checks for Ledger routes.

## 2026-05-08 1919 - Front-End Build Steward: Browser Runtime Check

### What Changed

- Used the in-app browser to reload `http://localhost:3002/` after the
  Workbench control passes.
- Confirmed the stale `NAV_ITEMS is not defined` runtime error cleared after
  reload.
- Confirmed via DOM snapshot that:
  - Keep is visible.
  - Workshop is visible.
  - Ledger is visible.
  - Basement is visible.
  - Workbench / Add Evidence is visible after opening Workshop.
  - No `Unexpected Error` screen is visible.

### Files Touched

- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` had already passed for the Workbench card-action pass.
- Browser DOM runtime check passed for the main shell and Workshop route.

### Front-End Steward Review

- The app is not sitting on the prior error boundary screen.
- The Workbench route loads after the shared-control migration.
- The browser screenshot API timed out, so this was DOM/runtime verification,
  not pixel screenshot QA.

### Known Risks

- Browser console still contains older Radix hook and Vite HMR websocket errors
  in the log buffer. The current DOM is rendering, but those logs should be
  revisited if they recur after a fresh server restart.
- Screenshot QA still needs a successful capture before claiming visual
  polish.

### Next Front-End Slice

- Restart or refresh the dev server if the stale console errors keep appearing.
- Continue Ledger filter normalization, starting with Approval Dashboard and
  Memory.

## 2026-05-08 1918 - Front-End Build Steward: Workbench Card Actions

### What Changed

- Continued the Workbench normalization sweep after a native-control audit.
- Replaced Workbench lane card actions with the shared button primitive while
  preserving their selected-state border and staging behavior.
- Replaced Workbench evidence row actions with the shared button primitive while
  preserving the selected evidence state and detail-panel behavior.
- Kept the file picker native. It is the actual browser file input and remains
  temporary-by-default.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- The Workbench primary lane and evidence-list actions now share focus,
  disabled, compact density, and token behavior with the rest of the normalized
  control family.
- The Workbench is now much less visually split between custom cards and system
  controls.

### Known Risks

- Shared button-as-card composition needs browser visual QA to confirm no text
  clipping in dense evidence rows.
- Remaining native controls in other main-route panels still need targeted
  cleanup.

### Next Front-End Slice

- Browser-inspect Workbench at localhost.
- Then move to Approval Dashboard or Memory filters, since those remain
  high-visibility Ledger control surfaces.

## 2026-05-08 1916 - Front-End Build Steward: Workbench Filters And Detail Controls

### What Changed

- Continued Workbench primitive normalization beyond the Add Evidence form.
- Replaced native filter selects with the shared select primitive:
  - Evidence kind filter.
  - Project filter.
  - Evidence grouping.
- Replaced the Reset filter button with the shared button primitive.
- Replaced the group-card filter buttons with shared buttons while preserving
  their local filtering behavior.
- Normalized the evidence detail appenders:
  - Before/After picker search now uses shared input.
  - Before/After kind and comparison selects now use shared select.
  - Comparison title, summary, and result now use shared input/textarea.
  - Append comparison now uses shared button.
  - Validator agent and validation status now use shared select.
  - Validation note now uses shared textarea.
  - Append validation now uses shared button.
- Kept all Workbench behavior local-only and append-only.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- First `pnpm check` caught one numeric select value mismatch.
- Fixed `compareWithId` conversion to string for the shared select value.
- Second `pnpm check` passed.

### Front-End Steward Review

- Workbench now has a substantially cleaner shared-control footprint across the
  primary evidence list, filters, grouping, Add Evidence, and detail appenders.
- The panel is closer to the product promise: visible local evidence, shared by
  user and agents, without hidden tool action.

### Known Risks

- A few lower Workbench buttons may still be native if they sit outside the
  inspected sections.
- This pass did not include browser screenshot QA.

### Next Front-End Slice

- Run a targeted `rg` sweep for remaining native controls in main-route panels.
- Then inspect localhost visually for Keep, Workbench, Ledger, and Basement.

## 2026-05-08 1914 - Front-End Build Steward: Workbench Evidence Selects

### What Changed

- Continued the Workbench normalization pass.
- Replaced the visible native selects in the Add Evidence form with the shared
  select primitive.
- Covered:
  - Evidence kind.
  - Project link.
  - Task link.
  - Session link.
  - Route agent.
  - Source link.
  - Command link.
  - Artifact link.
  - Permission class.
- Kept the existing route/permission state behavior intact.
- No external capture, browser action, file write, provider call, or durable
  media save was added.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- The main Workbench evidence-entry form now uses shared select, input,
  textarea, button, badge, and checkbox primitives.
- This makes the first practical evidence path more coherent with the Basement
  and Ledger normalization work.

### Known Risks

- Workbench still has native selects and buttons in lower filter/detail
  surfaces.
- Long option labels can still be dense because the underlying data includes
  full task, source, command, and artifact names.

### Next Front-End Slice

- Normalize Workbench filters and detail-inspector controls.
- Then use the browser to visually inspect the Keep, Workbench, Ledger, and
  Basement routes.

## 2026-05-08 1912 - Front-End Build Steward: Hedwig Action Button Normalization

### What Changed

- Continued the Hedwig control normalization pass.
- Replaced remaining bespoke `<button>` controls in `HedwigInboxPanel` with the
  shared button primitive.
- Covered:
  - Local capture triage.
  - Source detail selection.
  - Create Local Task.
  - Save Source.
  - Create Reminder Proposal.
  - Create Message Draft.
  - Proposal status transitions.
  - Reminder/message detail selection.
- Risk-adjacent proposal actions now use the shared risk button variant.
- No Notion, Slack, reminder scheduling, message sending, browser, fetch, or
  external write action was added.

### Files Touched

- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `rg "<button|</button>" client/src/components/HedwigInboxPanel.tsx -n`
  returned no matches.

### Front-End Steward Review

- Hedwig is no longer a hand-styled button island.
- The panel now uses shared buttons, badges, inputs, textarea, select, and
  checkbox primitives in the visible proposal/review flows.

### Known Risks

- This pass did not change behavior or add hard gates. It only made existing
  local proposal actions visually consistent and risk-colored.
- The actions still need stronger receipt linkage in a later backend/UI pass.

### Next Front-End Slice

- Sweep Workbench for native selects and bespoke buttons.
- Then review main-route panels for any remaining native control islands.

## 2026-05-08 1911 - Front-End Build Steward: Workshop Hedwig Control Sweep

### What Changed

- Continued from the shorthand `'` keep-building request.
- Replaced the Workbench `Sensitive` native checkbox with the shared checkbox
  primitive.
- Normalized the Hedwig proposal review field cluster:
  - Priority and Approval Action now use the shared select primitive.
  - Approval Scope and External Target now use the shared input primitive.
  - Local Review Notes now uses the shared textarea primitive.
  - Needs Review now uses the shared checkbox primitive.
  - Save Local Review and Stage Approval Preview now use shared buttons.
- Kept Hedwig proposal and approval preview behavior local-only. No Notion,
  Slack, reminder, message, browser, fetch, or external action was run.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Workbench and Hedwig now carry the same shared checkbox language as the Model
  Registry.
- Hedwig's review block now reads like a governed Basement/Workshop form rather
  than a hand-styled island.
- The risk action remains visually distinct through the shared risk button.

### Known Risks

- Hedwig still has other bespoke buttons elsewhere in the panel. This pass
  focused on the proposal review cluster because it contains the visible gated
  external-action fields.
- Design Review still contains a native checkbox, but that panel is build-only
  and no longer on the primary user rail.

### Next Front-End Slice

- Continue Hedwig button cleanup where it affects proposal actions.
- Then sweep remaining main-route bespoke selects and native form controls.

## 2026-05-08 1908 - Front-End Build Steward: Checkbox Token Normalization

### What Changed

- Normalized the shared checkbox primitive to CereBro shell tokens.
- Replaced generic theme classes with dark shell surfaces, visible focus ring,
  disabled state, error state, compact 4px control radius, and token-matched
  checked state.
- Replaced the remaining native `Requires frontier reasoning` checkbox in
  `ModelToolsPanel` with the shared checkbox primitive.

### Files Touched

- `app/client/src/components/ui/checkbox.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- The visible Model Registry controls now use shared input, textarea, button,
  badge, select, and checkbox primitives.
- The checkbox primitive now follows the same compact density and focus-state
  language as the rest of the normalized UI family.

### Known Risks

- Other panels still contain native checkboxes and should move to the shared
  checkbox primitive during their surface passes.
- This pass did not add a full checkbox showcase audit.

### Next Front-End Slice

- Continue replacing native checkbox usage in Workbench and Hedwig where those
  surfaces are visible in Workshop and Basement flows.
- Keep each pass small enough to run `pnpm check` and archive.

## 2026-05-08 1907 - Front-End Build Steward: Model Registry Select Migration

### What Changed

- Continued the shared primitive normalization pass inside
  `ModelToolsPanel`.
- Replaced the remaining native filter selects with the shared Radix-backed
  `ui/select` primitive.
- Replaced the local form-select helper internals with the shared select
  primitive across:
  - Capability kind.
  - Access method.
  - Privacy class.
  - Approval level.
  - Eval task.
  - Eval outcome.
  - Route privacy class.
- Removed now-unused local input/button style helpers from the panel.

### Files Touched

- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Model Registry now uses shared input, textarea, button, badge, and select
  primitives for its primary form controls.
- This closes the obvious half-native form state left by the previous Basement
  registry pass.

### Known Risks

- The checkbox in Route Preview is still native. It should move to the shared
  checkbox primitive in a later control sweep.
- Broader form-heavy panels still need the same select migration.

### Next Front-End Slice

- Continue shared control cleanup on the next form-heavy surface.
- Prioritize checkboxes, switches, and select fields that are visible in the
  main Keep / Workshop / Ledger / Basement routes.

## 2026-05-08 1906 - Front-End Build Steward: Piccolo Automation Hygiene

### What Changed

- Continued the Basement cleanup into `PiccoloPanel`.
- Reframed the surface as `Basement Automation Hygiene`.
- Added a three-rule governance band:
  - Read-only scans.
  - Durable report writes require a hard gate.
  - Cleanup proposals remain proposals until action receipts are approved.
- Replaced bespoke header buttons with normalized shared buttons.
- Replaced custom severity pills with the shared badge primitive.
- Put `Save Report` behind the normalized hard-gate dialog.
- Kept Piccolo cleanup read-only. Saving a report still only writes a
  `cleanup_report` artifact after confirmation. It does not move, archive, or
  delete files.

### Files Touched

- `app/client/src/components/PiccoloPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Piccolo now matches the Basement rule: automation and hygiene are visible,
  bounded, and gated.
- The only durable write on the surface is named and confirmed before it runs.
- Cleanup remains proposal-only.

### Known Risks

- The save-report flow still writes into the artifact library with
  `approved: true` after the hard gate. A later backend pass should preserve
  the UI receipt or approval id with the artifact record.
- The hygiene report itself is still driven by the existing report endpoint.
  This pass did not add scheduler automation.

### Next Front-End Slice

- Continue Basement normalization through the Settings surface or the model/tool
  select controls.
- Add receipt linkage for gated local writes when the backend approval model is
  ready.

## 2026-05-08 1905 - Front-End Build Steward: Basement Model Registry

### What Changed

- Continued the visible front-end normalization pass after the user typed `'`.
- Reframed `ModelToolsPanel` from a generic tools page into the Basement Model
  Registry.
- Added a compact five-part registry status strip:
  - Mode.
  - External calls.
  - Untested.
  - External lanes.
  - Blocked.
- Added a Configuration Rules band that makes the model registry boundary
  visible:
  - Registry previews do not call providers, gateways, browsers, or local tools.
  - Source URLs are evidence, not trust.
  - External model/tool use needs a visible action receipt before it runs.
- Converted local inputs, textareas, action buttons, close button, and badges
  in this panel to shared normalized primitives where available.
- Kept route previews proposal-only. No provider call, gateway call, browser
  action, install, account setup, token use, or external write was added.

### Files Touched

- `app/client/src/components/ModelToolsPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.

### Front-End Steward Review

- Basement now has a clearer first model/tool governance surface.
- The panel states the machine boundary before listing capabilities or route
  previews.
- Risk and disabled states now use the same normalized button and badge family
  as the rest of the current shell pass.

### Known Risks

- The panel still uses local inline `select` styling because there is not yet a
  complete app-wide select primitive migration.
- Route previews remain deterministic proposal UI. They do not yet connect to a
  real eval-backed router.
- Browser screenshot verification was not run for this narrow pass. Localhost
  remains available at `http://localhost:3002/`.

### Next Front-End Slice

- Continue Basement cleanup through Piccolo Automation.
- Normalize remaining native select/check controls where shared primitives
  exist.
- Keep all automation and model/tool surfaces proposal-only unless the user
  approves an external action.

2026-05-08 Front rail cleanup correction:

- User called out that the primitive normalization did not visibly change much
  and asked why Design Review and UI / UX were on the front end.
- Answer: they were build-phase reference surfaces, not end-user front-end
  surfaces.
- Removed `Design Review` and `UI / UX` from the primary left rail in
  `app/client/src/pages/Home.tsx`.
- Left the component files in place for now. They can be deleted or moved
  behind a build-only/dev route later.

Files touched in this correction:

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`: passed.

Known risks:

- This only removes the two build-only panels from the primary nav. It does
  not yet make the primitive work visually dramatic across the whole app.
- The next visible improvement should be a real shell pass: nav reduction,
  mode/route/evidence hierarchy, shared select fields, and removal of old
  inline card/control styling.

Storage impact:

- No database, Notion, Slack, browser storage, or generated media changes.
- Obsidian archive snapshot created for this handoff. Session history index
  appended.

Next-session starter prompt:

```text
Read AGENTS.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md,
CEREBRO_UX_SYSTEM.md, and CEREBRO_SESSION_HANDOFF.md. Continue the visible UI
normalization pass. Do not do another invisible primitive-only slice. Reduce
the primary left rail to true user surfaces, move build/dev/reference panels
out of the front rail, convert native selects and bespoke controls on the
remaining visible panels, and make the mode/route/evidence hierarchy readable
in the first viewport. Then run pnpm check, targeted tests, and browser
screenshots. Update the handoff and Obsidian archive at the end.
```

## 2026-05-08 1825 - Front-End Build Steward: Four-Zone Shell Pass

### What Changed

- Started the local dev server at `http://localhost:3002/` so the front-end
  pass can be watched live.
- Replaced the crowded primary left rail with the 4-zone CereBro OS dock:
  Keep, Workshop, Ledger, Basement.
- Added a compact secondary surface strip inside the active zone so existing
  panels remain reachable without making every internal tool a primary route.
- Mapped current surfaces into the new IA:
  - Keep: Keep, Aang, Capture.
  - Workshop: Workbench, Project Lab, Terminal Lab, Research.
  - Ledger: Tasks, Approvals, Outputs, Memory.
  - Basement: Settings, Models, Automation.
- Updated the command dock labels from implementation modes to user-facing
  mode reads: Ask, Research, Build.
- Added visible Aang-to-Cortana route copy under the command input so the shell
  starts showing the required chain before a task is sent.
- Removed the broken `%VITE_ANALYTICS_ENDPOINT%/umami` script placeholder from
  `app/client/index.html`; it was causing malformed URI errors in localhost.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `app/client/index.html`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- `curl http://localhost:3002/` confirmed the analytics placeholder is no
  longer emitted in the served HTML.
- Dev server HMR accepted `Home.tsx` and `index.html` changes.

### Front-End Steward Review

- This pass moves CereBro away from feature-pile navigation and toward the
  locked Keep / Workshop / Ledger / Basement model.
- Existing panels are still present. This is a shell IA pass, not a full
  rewrite of panel contents.
- The Keep remains the first screen and the product spine.
- Workshop is now the default zone for evidence/tool work.
- Ledger now owns proof/history surfaces.
- Basement now owns settings, models, and automation.

### Known Risks

- The top header still exposes too many dev-era controls. Next shell pass should
  reduce Demo, Live, Skills, Clear, Log, and Context into calmer global actions.
- The secondary surface strip is functional, but panel interiors still carry
  older panel-specific styling and should be normalized as surfaces are rebuilt.
- Browser screenshot verification was not available from the current toolset;
  the user can inspect the live localhost while the dev server remains running.
- The dev server still logs missing session cookie messages during unauthenticated
  polling. That is existing auth noise, not part of this visual pass.

### Next Front-End Slice

- Turn the header into the required thin project/status bar.
- Move dev-only controls out of the daily shell.
- Promote the Aang command bridge into a fuller mode/read/route/permission
  preview without increasing shell clutter.
- Continue using Threshold Summarize And Clear if context grows heavy.

## 2026-05-08 1828 - Front-End Build Steward: Header Compression Pass

### What Changed

- Continued the front-end steward pass instead of stopping after the first shell
  correction.
- Compressed the top header into a calmer daily bar:
  - visible brand/project identity on the left
  - Aang/Cortana/Ledger chain in the center
  - permission mode, connection state, context, and tools on the right
- Moved dev-era controls into a compact Tools menu:
  - Demo
  - Live
  - Skills
  - Log
  - Clear Sessions
- Kept all existing actions reachable while reducing top-level noise.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `Home.tsx` update.

### Front-End Steward Review

- This pass supports the locked header rule: left current project/route, center
  active chain summary, right status and global actions.
- It removes another visible chunk of feature-pile behavior without deleting
  working controls.
- Clear Sessions is still available, but demoted because it is a dev/session
  action, not a daily user action.

### Known Risks

- The Tools menu uses native `details`. It is acceptable for this swift pass,
  but should move to the normalized dropdown primitive once the shell settles.
- Header still does not show active project because the shell does not yet have
  a global selected-project object.

### Next Front-End Slice

- Improve the Aang command bridge into one compact object with mode read,
  route preview, permission preview, and attachment affordance.

## 2026-05-08 1830 - Front-End Build Steward: Command Bridge Route Preview

### What Changed

- Continued building inside the live localhost session.
- Added a compact route preview to the bottom command bridge.
- Current route previews:
  - Ask: Aang, Cortana.
  - Research: Aang, Cortana, Surfer, Oak.
  - Build: Aang, Cortana, Tony, Spock.
- Added explicit preview-only gate copy: gates stay closed until approval.
- Kept the intake preview mutation unchanged; this is a visible shell/UX pass.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `Home.tsx` update.

### Front-End Steward Review

- This pass makes the Aang-first chain more legible before submission.
- It supports the locked UX rule that the user should see mode, route, and
  approval posture before work starts.
- It avoids creating another panel or modal.

### Known Risks

- The route preview is mode-based static shell state. The server-side
  `commandIntake.preview` response still provides the richer real classification
  after the user submits text.
- Attachment handling remains disabled and still needs a proper evidence object
  model before it becomes active.

### Next Front-End Slice

- Bind the static route preview more tightly to actual `commandIntake.preview`
  results after submit.
- Add a small project selector once the global selected-project model is ready.

## 2026-05-08 1833 - Front-End Build Steward: Keep First Action Dock

### What Changed

- Added a compact first-action dock directly over the Keep home surface.
- The Keep now exposes the finished-product first-screen actions:
  - Evidence opens Workshop.
  - Resume opens Project Lab.
  - Approvals opens Ledger approval gates.
  - Capture opens Hedwig intake.
- Added a small Keep State readout so the first screen names whether chambers
  are calm or moving.
- Kept the action dock compact and anchored to the Keep rather than adding
  another primary nav surface.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `Home.tsx` update.

### Front-End Steward Review

- This pass follows the finished-product UX spec: the first screen must support
  asking, dropping/reviewing evidence, resuming active work, and reviewing
  waiting approvals without opening a separate dashboard.
- Ask remains in the command dock. The Keep dock covers the remaining first
  actions.
- Pixel art remains the anchor. The dock is a compact operational overlay, not
  a replacement for the Keep.

### Known Risks

- The Evidence action opens the current Workbench shell. The Workbench still
  needs a deeper build/review preset pass.
- The Resume action currently opens Project Lab because there is not yet a
  canonical active-work object.
- Approval count is not wired into the dock yet.

### Next Front-End Slice

- Add live counts to the Keep dock after approval/task/source summaries are
  exposed cheaply enough for the home shell.
- Deepen the Workbench default view so Evidence opens to a useful surface.

## 2026-05-08 1835 - Front-End Build Steward: Workbench Evidence Lanes

### What Changed

- Continued from the Keep Evidence action into the Workbench surface.
- Reframed Workbench copy from "planning only" to "shared evidence surface for
  user and agents."
- Added first-read Workbench lanes:
  - Preview: screens, images, browser views.
  - Terminal: command output and logs.
  - Validate: Oak or Spock notes.
  - Compare: before and after proof.
- Lane buttons stage the matching local evidence kind, route agent, and
  permission class without opening browser/media tools or external writes.
- Kept the Workbench local-only and append-only.

### Files Touched

- `app/client/src/components/WorkbenchPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `WorkbenchPanel.tsx` update.

### Front-End Steward Review

- This pass gives the Keep Evidence action a meaningful destination.
- It follows the Workbench rule: the user and agents look at the same evidence.
- It keeps risky actions gated. The new lane buttons only prepare local records.

### Known Risks

- The lane buttons stage fields but do not scroll/focus the evidence form yet.
- Workbench still needs a denser split-pane layout later. This pass improves
  first-read utility without changing the whole panel architecture.

### Next Front-End Slice

- Add focus/scroll behavior from a lane button to the Add Evidence form.
- Start turning Ledger into the proof layer instead of separate task/memory
  panels.

## 2026-05-08 1836 - Front-End Build Steward: Ledger Task Risk Pass

### What Changed

- Reframed the Tasks panel as `Ledger Work Queue`.
- Added explicit copy that tasks are proof objects and status changes stay
  visible.
- Changed the task delete affordance from a quiet `x` to a visible destructive
  `Delete` button.
- Added explicit `type="button"` and an accessible label to task row controls.

### Files Touched

- `app/client/src/components/TasksPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `TasksPanel.tsx` update.

### Front-End Steward Review

- This pass supports the Ledger rule: proof before summary.
- It also fixes a small risk-state issue. Deleting a task should not be hidden
  behind a tiny neutral glyph.

### Known Risks

- Task deletion is still immediate. A future pass should route destructive
  task removal through a hard gate or convert it to cancel/archive.
- Tasks are only one Ledger object. Outputs, Memory, Sessions, and Approvals
  still need the same proof-layer framing.

### Next Front-End Slice

- Add a Ledger overview surface or make the zone header show proof counts across
  Tasks, Approvals, Outputs, Memory, and Sessions.

## 2026-05-08 1840 - Front-End Build Steward: Ledger Gate And Tools Menu

### What Changed

- Added a hard-gate dialog before deleting a task from the Ledger work queue.
- The delete gate names the action, target, and safer cancel path.
- Replaced the temporary native header `details` Tools menu with the normalized
  dropdown primitive.
- Grouped the Tools menu by purpose:
  - Session: Demo, Live.
  - Tools: Skills, Log.
  - Risk: Clear Sessions.
- Kept Clear Sessions in the destructive/risk group instead of mixing it with
  normal utilities.

### Files Touched

- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted both `TasksPanel.tsx` and `Home.tsx`.

### Front-End Steward Review

- This pass closes the immediate-delete risk called out in the prior Ledger
  pass.
- It also removes the temporary menu shape and brings the header back under the
  shared primitive/menu grouping rule.
- No external writes, browser actions, installs, or project repo operations were
  introduced.

### Known Risks

- The task delete gate uses the normalized dialog, but task deletion still
  removes the row after confirmation. A future data-model pass should consider
  archive/cancel as the default Ledger behavior.
- Clear Sessions is grouped as risk, but does not yet use a hard gate.

### Next Front-End Slice

- Put Clear Sessions behind a hard gate or move it deeper into Basement/dev
  settings.
- Add a Ledger overview surface that unifies tasks, approvals, outputs, memory,
  and sessions as proof objects.

## 2026-05-08 1841 - Front-End Build Steward: Shell Risk Gate And Sessions Route

### What Changed

- Put `Clear Sessions` behind a hard-gate dialog.
- The clear gate names the target and clarifies that it clears visible Keep
  sessions, not saved Ledger records.
- Added `Sessions` back into the Ledger zone strip as a proof surface.
- Wired the existing `SessionsPanel` into the new 4-zone navigation map.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `Home.tsx` update.

### Front-End Steward Review

- Clear Sessions now follows the hard-gate modal rule.
- Ledger now includes the run-history surface it needs to prove work.
- This pass fixes a regression from the shell IA compression: the existing
  Sessions panel was imported but no longer reachable.

### Known Risks

- The Sessions panel itself still uses older panel structure and needs a Ledger
  proof-layer framing pass.
- The hard gate clears visible sessions after confirmation, but does not yet
  create a receipt. A future pass should record local UI clear events.

### Next Front-End Slice

- Reframe Sessions as Ledger run history.
- Add a compact Ledger overview surface before individual proof object views.

## 2026-05-08 1847 - Front-End Build Steward: Ledger Proof Surfaces

### What Changed

- Reframed Sessions as `Ledger Run History`.
- Added session proof stats: Active, Ended, Projects.
- Added receipt-type chips to the active zone header. Ledger now exposes Tasks,
  Sessions, Approvals, Outputs, and Memory as proof object types.
- Reframed Outputs as `Ledger Output Library`.
- Added output receipt stats: Rows, Write Policy, Owner.
- Restored Sessions as a reachable Ledger surface in the 4-zone shell.

### Files Touched

- `app/client/src/components/SessionsPanel.tsx`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed after each slice.
- Vite HMR accepted `SessionsPanel.tsx`, `Home.tsx`, and
  `ArtifactsPanel.tsx`.

### Front-End Steward Review

- This pass makes Ledger read as proof before summary.
- Sessions now explains what it proves: start/end/project ownership.
- Outputs now explains durable artifact receipts and write policy.
- The zone header now shows the conceptual receipt map without adding another
  page.

### Known Risks

- The Ledger still lacks one unified overview surface with live counts across
  all proof objects.
- Memory still needs a proof-layer framing pass.
- Output writing is still available from the Output Library. It is existing
  behavior, but future UX should show destination and approval state more
  clearly before write.

### Next Front-End Slice

- Reframe Memory as Ledger knowledge receipts.
- Add a compact Ledger overview once counts are cheap and stable enough.

## 2026-05-08 1854 - Front-End Build Steward: Memory Knowledge Receipts

### What Changed

- Reframed Memory as `Ledger Knowledge Receipts`.
- Added explanatory copy: memory needs source, approval, and Oak status before
  becoming truth.
- Added summary stats:
  - Saved.
  - Trusted.
  - Proposed.
- Replaced the tiny `x` plus browser `confirm()` delete flow with a visible
  destructive `Delete` button and normalized hard-gate dialog.
- Added explicit button types and accessible delete labels.

### Files Touched

- `app/client/src/components/MemoryPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `MemoryPanel.tsx` update.

### Front-End Steward Review

- Memory now fits the Ledger model as proof/knowledge receipts rather than an
  isolated drawer.
- Deletion now follows the same visible risk pattern as task deletion.
- The pass removes a native browser confirm, which did not match the CereBro
  hard-gate modal shape.

### Known Risks

- Trusted count is currently a local kind heuristic: facts plus references.
  Future Oak validation status should drive this.
- Memory proposal actions remain read-only/listed here. Promotion and approval
  still need a fuller Ledger/Oak flow.

### Next Front-End Slice

- Add a compact Ledger overview that gathers Tasks, Sessions, Approvals,
  Outputs, and Memory into one proof read.

## 2026-05-08 1856 - Front-End Build Steward: Ledger Overview

### What Changed

- Added a first-class `Ledger Overview` route to the 4-zone shell.
- Left rail Ledger now opens the overview instead of jumping straight into
  Tasks.
- Added Ledger proof cards with local live counts:
  - Tasks.
  - Sessions.
  - Approvals.
  - Outputs.
  - Memory.
- Added receipt rules for external action approvals, memory truth, and output
  artifact receipts.
- Kept all existing Ledger surfaces reachable from the zone strip.

### Files Touched

- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `Home.tsx` update.

### Front-End Steward Review

- This pass completes the first practical Ledger IA correction. Ledger is now a
  proof layer with an overview and object-specific surfaces.
- It uses existing tRPC list endpoints. No backend schema changes.
- The overview reads as local receipts, not analytics.

### Known Risks

- Counts are live local reads, but not yet optimized as one summary endpoint.
- The overview uses heuristics for open tasks and active sessions. That is fine
  for V1 shell clarity, but a dedicated Ledger summary router would be cleaner.

### Next Front-End Slice

- Start Basement cleanup: move model/tools/automation/settings into a clearer
  configuration map.
- Or continue Ledger polish by reframing Approvals as the universal action
  receipt surface.

## 2026-05-08 1858 - Front-End Build Steward: Approval Action Receipts

### What Changed

- Reframed Approvals from `Approval Queue` to `Action Receipt Gate`.
- Added explicit copy that the surface owns universal local receipts for
  approvals, blocks, and permission preflights.
- Added receipt summary stats:
  - Pending.
  - Sensitive.
  - Preflights.
  - Blocked.
- Kept the surface read-only. No approve/reject/execute actions were added.

### Files Touched

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed.
- Vite HMR accepted the `ApprovalDashboardPanel.tsx` update.

### Front-End Steward Review

- This pass makes Approvals match the Ledger rule: action receipts and gates
  are visible before summary.
- It keeps execution out of the approval surface while still showing risk and
  preflight state.

### Known Risks

- The receipt stats depend on the current filtered query, not a global summary.
  A later backend summary endpoint would make this cleaner.
- The surface still needs a clearer future path for approve/reject actions, but
  those must remain hard-gated and explicitly designed.

### Next Front-End Slice

- Start Basement cleanup: make settings, models, and automation read as machine
  configuration rather than another set of feature panels.

## 2026-05-08 1902 - Front-End Build Steward: Basement Configuration Map

### What Changed

- Reworked `ConfigPanel` from old fork/dungeon styling into CereBro Basement
  configuration styling.
- Renamed the surface from `Bridge Configuration` to `Basement Configuration`.
- Removed visible old-fork language such as heroes/dungeon phrasing from the
  primary setup copy.
- Converted neon purple/gold hard-coded styling to CereBro tokens.
- Added a first-class `Basement Overview` route to the 4-zone shell.
- Left rail Basement now opens the overview before Settings, Models, or
  Automation.
- Basement Overview shows:
  - Settings: bridge/local watcher status.
  - Models: capability registry mode.
  - Automation: Piccolo storage scan mode.
- Added configuration rules for secrets, model proposals, and automation gates.

### Files Touched

- `app/client/src/components/ConfigPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

### Checks Run

- `pnpm check` passed after each slice.
- Vite HMR accepted `ConfigPanel.tsx` and `Home.tsx`.

### Front-End Steward Review

- This pass moves Basement toward the locked role: configure the machine.
- It removes a high-visibility fork artifact from Settings.
- It preserves existing bridge functionality while making the surface match
  CereBro's shell and language.

### Known Risks

- `ConfigPanel` is still a fixed modal overlay. Future pass should make
  Settings a proper Basement workspace surface or a normalized hard-gate/side
  drawer, depending on final shell direction.
- Some command strings still reference `claude-dungeon-bridge.mjs`; renaming
  the script may require backend/static asset coordination.

### Next Front-End Slice

- Continue Basement cleanup through Model Tools and Piccolo Automation.
- Or normalize Settings out of a fixed modal into a Basement workspace panel.

2026-05-08 UI primitive call-site audit slice:

- Continued the UI normalization pass after the shared primitive refactor.
- Audited the first visible product surfaces against the normalized primitive
  layer:
  Home shell, Workbench, Approval Queue, Design Review, UI / UX, Project Lab,
  Model Tools, and Hedwig Inbox.
- Replaced high-visibility bespoke controls with shared primitives where the
  change was low-risk:
  - Approval Queue now uses shared `Button`, `Input`, and `Badge` for close,
    search, reset, filters, and status chips.
  - Workbench now uses shared `Button`, `Input`, `Textarea`, and `Badge` for
    close, evidence fields, temporary media frame input, clear/save actions,
    search, and chips.
  - Design Review now uses shared `Button`, `Input`, `Textarea`, and `Badge`
    for close, target label, proof/violation/next-action fields, save action,
    and chips.
  - UI / UX panel now uses shared `Button` and `Card` primitives for close,
    rule sections, Golden Path, and Build Gate.
  - Project Lab now uses shared `Button` for close and shared `Badge` for chip
    rows.
  - Model Tools now uses shared `Button`, `Input`, `Textarea`, and `Badge` for
    close, filter, proposal fields, eval note fields, route fields, submit
    actions, and chips.
  - Hedwig Inbox now uses shared `Button`, `Input`, and `Badge` for close,
    capture preview fields, preview action, and chips.
- Kept native `<select>` controls in this slice where converting to Radix
  `Select` would make the diff broad. They now sit beside normalized fields
  and remain marked for the next pass.
- Did not add hard-gate dialog usage yet because these panels are mostly
  proposal/read-only surfaces and do not execute approvals directly.

Files touched in this slice:

- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/DesignReviewPanel.tsx`
- `app/client/src/components/UISystemPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/components/ModelToolsPanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`: passed.
- `pnpm test -- --run server/cerebro-foundations.test.ts server/agents.test.ts`:
  passed. Vitest also ran configured bridge and auth tests. 4 files, 40 tests.
- Browser preview via in-app browser:
  - Started `pnpm dev`.
  - Loaded `http://localhost:3002/`.
  - Opened Workbench, Approvals, Design Review, UI / UX, Project Lab, Model
    Tools, and Inbox from the left rail.
  - Verified each audited panel rendered with a single Close control.
  - Captured a visible Inbox screenshot after the shared primitive pass.

Known risks:

- Native selects remain in the audited panels. Next pass should convert the
  highest-value filters to shared Radix `Select` wrappers or add a small local
  select adapter.
- Many Project Lab action buttons remain bespoke because that file is large
  and action-heavy. The close control and chip rows were normalized first.
- Hedwig Inbox still has deeper proposal action buttons and review form fields
  using bespoke styling below the first viewport.
- Workbench still has many native selects and lower-detail append controls
  that should move to shared primitives in a second pass.
- Browser verification was a smoke pass, not a pixel-perfect visual audit.

Storage impact:

- No database, Notion, Slack, browser storage, or generated media changes.
- Obsidian archive snapshot created for this handoff. Session history index
  appended.

Next-session starter prompt:

```text
Read AGENTS.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md,
CEREBRO_UX_SYSTEM.md, and CEREBRO_SESSION_HANDOFF.md. Continue the UI
call-site normalization pass. Convert native selects and remaining bespoke
buttons in Workbench, Approval Queue, Hedwig Inbox, Project Lab, and Model
Tools to shared primitives or a small local SelectField adapter. Then audit
hard-gate surfaces and add DialogContent gate where an approval modal is
actually required. Run pnpm check, targeted tests, and browser screenshots.
Update the handoff and Obsidian archive at the end.
```

2026-05-08 UI primitive normalization slice:

- User asked to continue the CereBro UI primitive normalization pass after the
  UI/UX system lock.
- Read `AGENTS.md`, `DESIGN.md`, `CEREBRO_FRONTEND_SYSTEM.md`,
  `CEREBRO_UX_SYSTEM.md`, and this handoff first.
- Refactored the shared primitives requested by the user:
  `button`, `card`, `dialog`, `drawer`, `dropdown-menu`, `context-menu`,
  `input`, `textarea`, `select`, `tabs`, `badge`, and `table`.
- Replaced the old neon fork theme variables in `app/client/src/index.css`
  with CereBro shell tokens from `DESIGN.md`: dark shell background,
  dark raised surfaces, soft borders, warm primary text, muted metadata,
  blue active state, violet routing state, gold identity markers, green
  success, amber risk/review, and red destructive/blocked state.
- Removed the global all-button uppercase treatment and global mono body font.
  Product UI now defaults to compact system sans, with monospace reserved for
  explicit local component use.
- Normalized primitive density:
  - Buttons are 28 to 36 px tall depending on size.
  - Inputs and selects default to 32 px.
  - Menus use 12 px item text and compact groups.
  - Tables use 10 px uppercase headers and 12 px rows.
  - Cards, drawers, and dialogs use 8 px radius max.
- Added visible CereBro focus states across controls using blue focus rings
  and invalid/destructive red rings.
- Added a `risk` button variant for caution/approval lanes.
- Added `success`, `warning`, and `violet` badge variants for status chips
  without inventing new color families.
- Added `gate` support to `DialogContent` so hard-gate modals can use the
  approval shape without changing every caller immediately.
- Strengthened destructive menu item styling. Destructive choices now read red
  by default and red-blocked on focus, making the required separate destructive
  menu grouping visible once call sites are audited.
- Updated drawer, dialog, menu, select, input, tabs, card, badge, and table
  defaults to dark shell surfaces and token-aligned borders instead of shadcn
  defaults.

Files touched in this slice:

- `app/client/src/index.css`
- `app/client/src/components/ui/button.tsx`
- `app/client/src/components/ui/card.tsx`
- `app/client/src/components/ui/dialog.tsx`
- `app/client/src/components/ui/drawer.tsx`
- `app/client/src/components/ui/dropdown-menu.tsx`
- `app/client/src/components/ui/context-menu.tsx`
- `app/client/src/components/ui/input.tsx`
- `app/client/src/components/ui/textarea.tsx`
- `app/client/src/components/ui/select.tsx`
- `app/client/src/components/ui/tabs.tsx`
- `app/client/src/components/ui/badge.tsx`
- `app/client/src/components/ui/table.tsx`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`: passed.
- `pnpm test -- --run server/cerebro-foundations.test.ts server/agents.test.ts`:
  passed. Vitest also ran configured bridge and auth tests. 4 files, 40 tests.

Known risks:

- This pass normalizes primitive defaults. It does not yet audit every call
  site for better labels, destructive grouping, disabled-state explanations,
  icon tooltips, or hard-gate `DialogContent gate` adoption.
- `alert-dialog`, `sheet`, `popover`, `command`, `tooltip`, `calendar`,
  `sidebar`, `checkbox`, `switch`, and other inherited primitives still carry
  older shadcn visual defaults in places.
- Some older surfaces still use bespoke inline styles and local `Badge`
  helpers instead of shared primitives.
- Browser screenshot verification was not run in this slice. The requested
  code checks passed.

Storage impact:

- No database, Notion, Slack, browser storage, or generated media changes.
- Obsidian archive snapshot created for this handoff. Session history index
  appended.

Next-session starter prompt:

```text
Read AGENTS.md, DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md,
CEREBRO_UX_SYSTEM.md, and CEREBRO_SESSION_HANDOFF.md. Continue the CereBro UI
normalization pass by auditing call sites. Start with Home, Workbench, Approval
Queue, Design Review, UI / UX, Project Lab, Model Tools, and Hedwig Inbox.
Adopt the normalized primitives, add hard-gate DialogContent gate usage where
approval is required, split destructive menu items into their own groups, add
disabled-state reasons where space allows, and add icon labels/tooltips for
tool actions. Then run pnpm check and targeted tests. Update the handoff and
Obsidian archive at the end.
```

2026-05-08 UI UX system lock slice:

- User asked whether everything all-encompassing for frontend and UX was
  already decided. Answer: no. The constitution existed, but the operating
  manual did not.
- Read `DESIGN.md`, `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`, relevant
  `CEREBRO_MASTER_BUILD_PLAN.md` sections, current app surfaces, and existing
  UI primitives.
- Added `CEREBRO_FRONTEND_SYSTEM.md` as the canonical frontend system:
  shell, typography, color, borders, buttons, inputs, dropdowns, context menus,
  trays, drawers, panels, tables, status chips, modals, toasts, empty states,
  motion, accessibility, and component debt.
- Added `CEREBRO_UX_SYSTEM.md` as the V1 UX operating manual:
  modes, route chain, golden path, Keep UX, Workshop UX, Ledger UX, approvals,
  Spock security, evidence, memory, capture, council, blocked states, errors,
  first run, daily open, navigation, Aang companion, notifications, keyboard,
  and UX debt.
- Added `app/client/src/components/UISystemPanel.tsx`, an in-app reference
  surface summarizing the canonical UI and UX rules.
- Added `UI / UX` to the left rail in `app/client/src/pages/Home.tsx`.
- Opened `http://localhost:3002/` in the in-app browser, clicked `UI / UX`,
  and verified the panel renders inside the app shell.

Files touched in this slice:

- `CEREBRO_FRONTEND_SYSTEM.md`
- `CEREBRO_UX_SYSTEM.md`
- `CEREBRO_SESSION_HANDOFF.md`
- `app/client/src/components/UISystemPanel.tsx`
- `app/client/src/pages/Home.tsx`

Checks run:

- `pnpm check`: passed.
- `pnpm test -- --run server/cerebro-foundations.test.ts server/agents.test.ts`:
  passed. Vitest also ran the configured bridge and auth tests. 4 files, 40
  tests.
- Browser preview: loaded `http://localhost:3002/`, opened `UI / UX`, and
  verified the in-app reference panel.

Known risks:

- The docs are now locked, but the shared UI primitives have not yet been
  refactored to enforce them. `button.tsx`, `card.tsx`, `dialog.tsx`,
  `drawer.tsx`, dropdowns, and context menus still carry default visual
  patterns in places.
- The nav still has too many top-level surfaces. The UX system names the target
  simplification, but this slice did not collapse nav.
- The in-app UI/UX panel is a reference surface, not a live compliance checker.

Next-session starter prompt:

```text
Use DESIGN.md, CEREBRO_FRONTEND_SYSTEM.md, and CEREBRO_UX_SYSTEM.md. Start the
UI primitive normalization pass. Refactor the shared button, card, dialog,
drawer, dropdown, context menu, input, textarea, select, tabs, badge, and table
primitives so they enforce CereBro tokens, radius, focus states, menu rules,
hard-gate language, and compact density. Then audit Home, Workbench, Approval,
Design Review, and UI / UX surfaces against the new primitives.
```

2026-05-08 Keep tile blueprint implementation slice:

- User pushed on the castle floor count and council-space problem. Decision
  moved from a strict 2-floor plan to a 3-readable-level fortress with a short
  undercroft. Cortana owns the vertical center, not an equal room in a row.
- Locked all 11 agent room addresses before final castle art:
  - Aang: ground-left threshold.
  - Cortana: oversized central command nave.
  - Gojo: upper-right gallery.
  - Batman: upper-west war room.
  - Spock: upper observatory.
  - Oak: upper archive lab.
  - Tony: command-west forge.
  - Surfer: command-east cartography.
  - C-3PO: ground-east scriptorium.
  - Piccolo: undercroft watch crypt.
  - Hedwig: undercroft relay roost.
- Added detailed mockups:
  - `mockups/keep-fortress-wireframe.html` for the full residency massing.
  - `mockups/keep-tile-blueprint.html` for the 64 by 34 tile planning grid.
- Added `CEREBRO_KEEP_TILE_BLUEPRINT.md` as the repo-readable blueprint
  reference with room coordinates, floor courses, stairs, path nodes, zoom
  bounds, prop zones, and PixelLab prompt rules.
- Added `app/client/src/lib/keepFortressMap.ts` as the typed app contract for
  rooms, doors, halls, stairs, path nodes, council spots, prop zones, and zoom
  bounds.
- Added `app/client/src/components/KeepFortressBlueprint.tsx`, an in-app
  blueprint surface rendered from the typed map.
- Updated `app/client/src/pages/Home.tsx` so Home defaults to the Blueprint
  view while preserving the existing PixelLab Phaser Scene behind a Scene
  toggle.
- Opened `http://localhost:3002/` in the in-app browser and verified the live
  app renders the fitted blueprint inside the Keep shell.

Files touched in this slice:

- `CEREBRO_KEEP_TILE_BLUEPRINT.md`
- `CEREBRO_SESSION_HANDOFF.md`
- `app/client/src/components/KeepFortressBlueprint.tsx`
- `app/client/src/lib/keepFortressMap.ts`
- `app/client/src/pages/Home.tsx`
- `mockups/keep-fortress-wireframe.html`
- `mockups/keep-tile-blueprint.html`

Checks run:

- `pnpm check`: passed.
- `pnpm test -- --run server/cerebro-foundations.test.ts server/agents.test.ts`:
  passed. Vitest also ran the configured bridge and auth tests. 4 files, 40
  tests.
- Browser preview: loaded `http://localhost:3002/` and verified the live
  Blueprint view renders all 11 assigned rooms inside the app shell.

Known risks:

- The live Phaser scene still uses the older 3-floor PixelLab layout. The new
  blueprint is rendered as a React planning surface, not yet as Phaser room
  geometry.
- The typed map and HTML mockup duplicate the same coordinates manually. Next
  pass should make the typed map the only source and remove drift.
- Room prop zones are first-pass placement blocks, not final PixelLab art.
- The Home view now defaults to Blueprint for this build phase. That is
  intentional while the castle is being rebuilt, but the final default should
  return to the live Scene once the Phaser rebuild lands.

Next-session starter prompt:

```text
Use DESIGN.md and CEREBRO_KEEP_TILE_BLUEPRINT.md. Convert the typed
KEEP_FORTRESS_MAP into the Phaser Keep scene: draw the 64 by 34 fortress shell,
floor slabs, hallways, room rectangles, doors, stairs, path nodes, zoom bounds,
and agent spots from app/client/src/lib/keepFortressMap.ts. Keep PixelLab final
room art deferred. The goal is a Phaser debug castle that matches the in-app
Blueprint view exactly, with the existing Scene toggle preserved.
```

2026-05-08 Keep composition canon slice:

- User approved the next Keep direction before implementation: wide fortress,
  2 floors, 3 active hero rooms first, sealed future wings, zoom-in-place,
  visible stairs/doors/walking paths, and PixelLab as the art source.
- Locked the first hero rooms for the next visual pass: Cortana, Aang, and
  Gojo. Spock remains required in the system and security plan, but his room is
  not part of the first room generation set.
- Locked Cortana's behavior: highest authority and operations room, central
  chamber only, hybrid glass-tech/cathedral command tube, council table that can
  fit all 10 agents if needed, and council calls only when real judgment is
  required.
- Locked Aang's council role: threshold bridge by default, not a table expert.
  He moves closer only when user intent, priority, approval, or tone is the
  issue.
- Locked Gojo's first-room direction: high-end gallery/control room hybrid with
  body-language animation for critique and visual review.
- Locked movement rules: visible travel for work moving through the Keep,
  Cortana call signals in each room when orders are issued, and return behavior
  that either sends agents back, walks them to visible work, or keeps them
  active if blocked.
- Locked animation stance: shared state names across agents, distinct body
  language per agent, no constant floating icons, no overbuilt Gojo block
  feature in V1, and speech shown one agent at a time with summary on demand.
- Locked ambient world direction: local time drives sky exactly, exact-location
  weather may be used only after visible permission/setup, interior lighting
  follows the sky, and weather appears through every window, slit, gap, arch,
  and exterior cutaway while storms affect only the shell and windows.
- Added the canonical Obsidian note
  `20_Knowledge/Playbooks/CereBro Keep Composition Spec.md` with retrieval
  enabled. It covers the fortress layers, placement plan, pathing grammar,
  council staging, time/weather behavior, PixelLab generation strategy, and
  first 3 hero rooms.
- Updated the Obsidian Playbooks index and CereBro project bridge to link the
  new Keep composition spec.
- Updated `CEREBRO_MASTER_BUILD_PLAN.md` to point future Keep, PixelLab,
  pathing, zoom, council, ambience, prop, and animation work to the new
  Obsidian spec.

Files touched in this slice:

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`
- Obsidian:
  `20_Knowledge/Playbooks/CereBro Keep Composition Spec.md`
- Obsidian:
  `20_Knowledge/Playbooks/Playbooks.md`
- Obsidian:
  `10_Projects/CereBro/CereBro.md`

Checks run:

- Manual note/index review. No app code changed.

Known risks:

- This is design canon only. No Phaser layout, PixelLab prompt, room asset,
  path graph, zoom behavior, or weather integration has been implemented yet.
- Exact room dimensions, Cortana chamber width, Gojo side placement, sealed wing
  labeling, and weather source remain open.

Next-session starter prompt:

```text
Read DESIGN.md, CEREBRO_MASTER_BUILD_PLAN.md, and the Obsidian note 20_Knowledge/Playbooks/CereBro Keep Composition Spec.md first. Do not generate PixelLab assets yet. Draft the first implementation-grade Keep fortress map: 2-floor wide fortress, Cortana central chamber, Aang entry chamber, Gojo elevated gallery wing, sealed future wings, doors, stairs, walking lanes, path nodes, council spots, zoom bounds, and local time/weather layer requirements. Ask for approval before code or asset generation.
```

2026-05-08 Spock security gate slice:

- User clarified the need: CereBro should protect daily browsing and pasted
  GitHub repos from phishing, malware, hostile ads, fake buttons, unsafe
  downloads, poisoned packages, suspicious workflows, and credential theft.
- Decision locked: do not add a new cybersecurity agent yet. Spock becomes the
  security gate. Surfer scouts only after Spock's receipt. Tony cannot clone,
  install, build, or run pasted repo code until Spock clears the execution lane.
- Added Spock tool scopes in `app/server/agentRouter.ts`: `security_gate` and
  `security_scan`. Surfer's role now explicitly says it does not bypass Spock
  for risky links, GitHub repos, downloads, package installs, or browser
  sessions.
- Added `security_review_records` to the libSQL schema. Security receipts are
  append-only local records with target, target kind, risk level, route chain,
  checks, findings, allowed actions, blocked actions, scanner plan, browser
  policy, and permission preflight link.
- Added `app/server/routers/securityGate.ts` with:
  - `plan`: returns the Spock security posture and planned scanner stack.
  - `inspectTarget`: classifies a target without browsing, cloning,
    downloading, installing, or executing.
  - `createReview`: records a local Spock security receipt.
  - `recent`: reads recent receipts.
- Wired `securityGate` into the app router.
- Added `security_review` to command intake. Terms such as safe, security,
  cyber, malware, phishing, popups, ad blocker, uBlock, virus, suspicious link,
  and repo safety now route to Spock with Surfer, Batman, and Oak support.
- Updated `CEREBRO_MASTER_BUILD_PLAN.md` and `AGENTS.md` with the locked
  security posture: GitHub repo safety, browser isolation, popup/ad blocking,
  scanner stack, and the rule that scanners are tools, not truth.

Files touched in this implementation slice:

- `app/server/agentRouter.ts`
- `app/server/cerebroDb.ts`
- `app/server/routers/securityGate.ts`
- `app/server/routers.ts`
- `app/server/routers/commandIntake.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `AGENTS.md`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`: passed.
- `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`:
  passed. Vitest also ran the configured bridge and auth tests. 4 files, 40
  tests.

Known risks:

- This is the first deterministic receipt layer. It does not yet run the
  external scanners.
- The browser isolation policy is represented in the route, not yet enforced in
  an in-app browser profile.
- uBlock/adblock-style filtering is planned. No filter engine is wired yet.
- Security tools are themselves attack surfaces. Future adapters must pin
  versions, isolate execution, and record tool provenance.

Next-session starter prompt:

```text
Continue the Spock security gate. Add the first scanner adapter path for GitHub repos: quarantine clone metadata only, no install, then run Scorecard, OSV-Scanner, Gitleaks, zizmor, and GuardDog where available. Surface the security receipt in the app before Surfer or Tony can proceed.
```

2026-05-08 runtime design enforcement slice:

- Implemented the first in-app design enforcement loop instead of leaving the
  new rules as docs only.
- Added `app/server/routers/designReview.ts` with `plan`, `list`, and `create`
  procedures. It records local append-only design review records with
  `DESIGN.md` checklist state, violations, next actions, Aang -> Cortana ->
  Gojo -> Tony -> Spock/Oak route chain, Workbench evidence links, and a local
  permission preflight audit row.
- Added `design_review_records` to the idempotent libSQL schema.
- Added `app/client/src/components/DesignReviewPanel.tsx` and a left-rail
  "Design Review" surface. The panel shows source files, routing chain,
  checklist, Workbench evidence link picker, local review form, gates, and
  recent review ledger.
- Updated command intake so design-ish requests return an explicit route chain
  and `designProtocol` checklist. The Ask Aang preview now shows the Aang ->
  Cortana route and flags when Gojo design review is required.
- Added test coverage for the design review route and the intake design
  protocol.
- Ran `pnpm check`: passed.
- Ran `pnpm test`: passed. 4 files, 39 tests.
- Started the dev server on `http://localhost:3002/` and confirmed the page
  served over HTTP with `curl`. Stopped the server after the smoke check.

Files touched in this implementation slice:

- `app/server/routers/designReview.ts`
- `app/server/routers.ts`
- `app/server/cerebroDb.ts`
- `app/server/routers/commandIntake.ts`
- `app/client/src/components/DesignReviewPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `app/server/cerebro-foundations.test.ts`

Known risks:

- Screenshot/browser inspection is still not automated in this slice. The panel
  records proof and links Workbench evidence, but it does not yet open the
  browser or capture screenshots.
- The Design Review panel can record local review state. It does not yet patch
  code or enforce blocking gates automatically.
- The dev server logged missing optional Vite analytics env vars and stale
  `baseline-browser-mapping` data. These did not block build, tests, or the
  HTTP smoke check.

Next-session starter prompt:

```text
Use DESIGN.md. Continue from the Design Review panel. Wire one real visual proof path: from Workbench evidence or browser screenshot to Design Review, then show before/after comparison and block delivery until Gojo review has a linked evidence record.
```

2026-05-08 external reference intake and anti-generic enforcement:

- User clarified that the reference list is not only for CereBro research. Codex
  itself must use the lessons to build faster, less generic, and with stronger
  design judgment.
- Added root `DESIGN.md` as the active agent-readable design law. It binds the
  Keep, Workshop, Ledger, voice rules, pixel-art constraints, proof surfaces,
  motion rules, and anti-slop review into one file that must be read before UI,
  motion, prototype, deck, asset, or product-copy work.
- Added `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md` to turn Impeccable,
  Awesome DESIGN.md, getdesign.md, Huashu Design, UI UX Pro Max, React Bits,
  Uncodixfy, Ruflo, and AirLLM into CereBro-native operating rules.
- Updated `CereBro_Final_Implementation_Pack/LICENSE_REVIEW_MATRIX.md` with
  verified license reads for the new references. Huashu is workflow-reference
  only because its license requires written authorization for team, product,
  client, or commercial integration. React Bits is held as motion/component
  reference because it uses MIT + Commons Clause.
- Updated `CEREBRO_MASTER_BUILD_PLAN.md` and `AGENTS.md` so root `DESIGN.md`,
  external-reference discipline, and anti-slop review are locked into future
  build behavior.
- Strengthened `frontend-design.skill.md`, `anti-slop-review.skill.md`, and
  `SKILLS.md` so Gojo/Tony work must load `DESIGN.md`, inspect existing
  renderers/assets/tokens, run screenshot or browser review when UI changes,
  and name exact generic-AI violations before delivery.
- No runtime app code changed in this slice. This was a rules and operating
  system pass.

Files touched in this slice:

- `DESIGN.md`
- `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`
- `AGENTS.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CereBro_Final_Implementation_Pack/LICENSE_REVIEW_MATRIX.md`
- `CereBro_Claude_Code_Repo_Starter_Pack/SKILLS.md`
- `CereBro_Claude_Code_Repo_Starter_Pack/skills/frontend-design.skill.md`
- `CereBro_Claude_Code_Repo_Starter_Pack/skills/anti-slop-review.skill.md`

Checks run:

- Web verification of project identity and licenses for the referenced
  projects.
- `rg` check for banned voice terms in new design/reference files and updated
  skills.
- `git diff` review of the changed planning and skill files.

Known risks:

- This does not yet enforce the rules in code at runtime. It makes the rules
  available and binding for agent work.
- `CEREBRO_MODEL_ROUTER_BASELINE.md`, `CLAUDE.md`, and `outputs/` were already
  modified or untracked before this slice and were not touched.
- Existing repo docs still contain older em dash typography in inherited text.
  New files and new skill changes avoid that register.

Next-session starter prompt:

```text
Use root DESIGN.md and CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md. Build the first runtime enforcement slice: expose the active design/anti-slop checklist in the CereBro app or wire Gojo's review flow to a real UI surface. Preserve the Phaser Keep and run visual checks.
```

2026-05-08 deck pass:

- Added the Aang-first mode intelligence and behavior plan to the master build
  plan before deck production: Aang is always the user-facing bridge, Aang
  reports to Cortana, Cortana routes agents, mode reads are visible, uncertain
  reads ask one clarifying question, and approved corrections can become memory.
- Built a 60-slide CereBro finished-product training deck showing the target
  end-state app, not wireframes and not the current Keep environment.
- The deck keeps the existing agent sprites as canon. Current Keep walls, room
  composition, and environment layout are not treated as canon.
- PixelLab was used for new target room and prop assets. Usable assets were
  kept as target-room overlays. Weak PixelLab results are not canon and should
  be regenerated before implementation.
- Final deliverables were copied to the Drive vault:
  `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault/03_Outputs/exports/cerebro-end-product-training/cerebro-end-product-training.pptx`
  and
  `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault/03_Outputs/exports/cerebro-end-product-training/cerebro-end-product-training-contact-sheet.png`.
- Deck scope now includes Keep, Aang command bridge, Cortana routing, capture,
  watch mode, browser, research, source fingerprints, learning sidecar,
  Workshop, build, evidence annotation, approvals, design review, PixelLab
  asset lifecycle, meetings, Hedwig, Piccolo, Batman, Oak, Spock, C-3PO,
  model routing, memory promotion, settings, buttons, dropdown menus,
  right-click context menus, modular windows, Aang chat states, themes,
  typography, command palette, notifications, source library, output library,
  permissions, and every agent room detail.

Open deck caveat:

- This is a stronger training deck, but it is still a target artifact. It is not
  a claim that the live app already matches it. The next design pass should
  turn these screens into an implementation-grade product spec, then rebuild
  the live Keep and workbench against that spec.

2026-05-08 Obsidian full reorganization:

- User approved a full Obsidian reorganization after the initial color/graph
  pass. The old no-move constraint is superseded for this vault cleanup.
- Reorganized the Obsidian vault into top-level lanes:
  `00_Atlas`, `10_Projects`, `20_Knowledge`, `60_Media`, `80_Templates`, and
  `90_Archive`.
- Moved CereBro session history to
  `90_Archive/CereBro Session History/` and Sundesk build history to
  `90_Archive/Sundesk Build History/`. Snapshots remain append-only.
- Moved project bridges to `10_Projects/<Project>/<Project>.md` for CereBro,
  Bridgefour, Declyne, Sundesk, Sygnalist, and Waymark.
- Moved current knowledge sections to `20_Knowledge/`: Decisions, Sources,
  Learning, Playbooks, Reviews, Ops, and Capture.
- Added `00_Atlas/Vault Map.md`, `20_Knowledge/Knowledge Index.md`,
  `60_Media/Media Index.md`, `90_Archive/Archive Index.md`, and
  `20_Knowledge/Ops/RAG Ready Knowledge Map.md`.
- Updated Obsidian graph colors and default search so archive snapshots are
  hidden from the normal graph view while remaining available in Archive.
- Updated templates with RAG metadata fields:
  `canonical_status`, `retrieval_status`, `llm_summary`, `source_ids`,
  `related_notes`, and `privacy_class`.
- Ran a wiki-link audit after the move. Result: 221 Markdown notes, 0 broken
  wiki links.
- Follow-up lock-in: CereBro's repo rules, lifecycle plan, master build plan,
  Obsidian doctrine notes, and writer code now agree on the same method.
  CereBro writes Obsidian notes into the current lanes, preserves canonical
  folder casing, defaults manual durable notes to `20_Knowledge/Capture`, and
  treats `90_Archive` as archive-only for normal retrieval.
- `integrations.status` now exposes the Obsidian knowledge routes and retrieval
  metadata fields so the app can show the method instead of hardcoding it.
- `handoffs.archivePlan`, `HandoffArchivePanel`, and `ArtifactsPanel` now point
  at the new Obsidian lanes instead of old `CereBro/...` paths.
- RAG-ready notes must carry `canonical_status`, `retrieval_status`,
  `llm_summary`, `source_ids`, `related_notes`, and `privacy_class`.
- Normal retrieval includes current validated notes and indexes. Archive enters
  retrieval only when the user asks for history, provenance, prior decisions,
  or session recovery. Every answer should cite the note path, source row,
  artifact, or memory id used.
- 2026-05-08 GitHub project import: imported all 6 visible Bowgull GitHub repos
  into Obsidian using the approved bridge/source method: Sundesk, CereBro,
  Declyne, Bridgefour, Waymark, and sygnalist-brain. Created or updated project
  bridge notes in `10_Projects`, repository source notes in
  `20_Knowledge/Sources/GitHub`, `00_Atlas/GitHub Project Map.md`,
  `20_Knowledge/Sources/GitHub/GitHub Sources.md`, and
  `20_Knowledge/Playbooks/GitHub Repository Import Method.md`.
- GitHub import rule is now written into `AGENTS.md`,
  `CEREBRO_FILE_LIFECYCLE_PLAN.md`, and `CEREBRO_MASTER_BUILD_PLAN.md`: do not
  copy full repos into Obsidian; use repo URL plus commit SHA fingerprints,
  bridge notes, source summaries, and live repo inspection for exact code facts.

Begin Session 4 after user clarification:

- CereBro is not freelance-first. It is a personal command center with Project
  Intelligence.
- Everyday notes, reminders, messages, research, learning, creative work,
  personal apps, portfolio, and freelance all need to fit.
- Declyne, Waymark, Sygnalist, Bridgefour, and CereBro are the initial project
  set.
- Freelance is a mode inside the broader system.
- Previous vault no-move instruction is superseded by the approved 2026-05-08
  Obsidian full reorganization. Future moves still need a reason and link
  repair. History stays append-only.
- First thin implementation slice is now live: Project Lab shows read-only
  project profiles, local git status, project modes, next actions, risks, and
  agent ownership for Declyne, Waymark, Sygnalist, Bridgefour, and CereBro.
- Latest clarification: CereBro's preview, browser, screenshot, image, video,
  annotation, terminal/log, and validation surfaces must be visible in app as a
  modular workbench. This should be similar in spirit to Codex's preview
  windows: user-visible, agent-readable, and tied to a self-review loop. It is
  not just hidden tool access.
- Follow-up clarification: this is a required workbench function, not a visual
  nice-to-have. The user needs to show CereBro things the same way they use
  Codex broadly: open a preview, mark the exact part that matters, route that
  visual evidence to an agent, and watch the next pass happen in the same app.
  Annotation records need coordinates, context, project/task/session links, and
  agent routing.
- 2026-05-07 clarification: CereBro must understand images as a general input
  type, not only creative assets or setup screenshots. The user wants to drag in
  screenshots, UI states, account screens, app errors, artwork, mockups,
  diagrams, photos, charts, whiteboards, generated images, and other still
  images, then ask open-ended questions about them. Video support should start
  with key-frame/frame understanding and annotation.
- 2026-05-07 clarification: the permissions toggle is a global CereBro control,
  not an image feature. Long term, CereBro should perceive what is happening,
  reason about it, and act on the user's behalf across coding, browser work,
  files, account setup, messaging, reminders, publishing, and desktop context.
  Permission modes govern all perception and action.
- 2026-05-07 locked direction: add a Codex-like global mode selector:
  `Default permissions`, `Auto-review`, and `Full access`. Default reads only
  explicit user-provided context and guides. Auto-review can proactively inspect
  approved visible/local evidence and queue suggestions. Full access can use
  enabled tools in the session, but hard gates remain visible: payments, account
  permission grants, destructive commands, deleting/overwriting files, sending
  messages, publishing, uploading private media externally, saving sensitive
  screenshots to memory, installs, tokens/API keys, and sealed Raven/NSFW scope.
- 2026-05-07 plan update: `CEREBRO_MASTER_BUILD_PLAN.md` now folds this into
  core defaults, Session 10 image/video understanding, Session 11 agent runtime
  permission classes, Session 12 shell/workbench UX, and open provider/model
  decisions.
- 2026-05-07 locked direction: CereBro must become a model/tool opportunist
  with strong routing and validation, not a single-provider chatbot. It should
  use local models, free/generous hosted tiers, specialty AI tools, and a
  frontier hosted lane when the task needs me-level reasoning. Surfer should
  research current models/tools/free tiers/prompt recipes with source links;
  Cortana should route; Batman should risk-review; Spock/Oak should validate;
  Piccolo should monitor cost, rate limits, stale registry entries, and storage.
  Multiple weaker/free models do not automatically equal a frontier model.
  CereBro gets smarter by testing, routing, packaging context, validating, and
  remembering what worked.
- 2026-05-07 reasoning-route plan update: `CEREBRO_MASTER_BUILD_PLAN.md` and
  `CEREBRO_MODEL_ROUTER_BASELINE.md` now include a Model/Tool Capability
  Registry target, Reasoning Gateway direction, eval-backed routing, Surfer's
  Model/Tool Discovery lane, Prompt/Tool Handoff playbooks, and OpenClaw as a
  pattern/reference rather than core runtime.
- 2026-05-08 cloud-backed learning correction: user clarified CereBro is meant
  to be a cloud-based solution because the Mac has limited storage and will be
  used for routine builds. `CEREBRO_MASTER_BUILD_PLAN.md`,
  `CEREBRO_FILE_LIFECYCLE_PLAN.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`,
  `AGENTS.md`, and `CLAUDE.md` now replace the old local-first framing with
  cloud-backed, local-controlled storage and learning. Obsidian remains useful,
  but it is not the RAG engine or the model brain.
- 2026-05-08 Obsidian organisation pass: added a CereBro vault CSS snippet,
  enabled it in Obsidian appearance settings, created the CereBro knowledge
  folder set, added a knowledge home note, linked the existing `indexes`
  CereBro home note to it, and added templates for decisions, source summaries,
  playbooks, and learning notes. Obsidian can now be visibly organized and
  color-coded without plugins.
- 2026-05-08 terminology cleanup: remaining build-plan escalation language now
  says private/cheap first instead of local first.
- 2026-05-08 Obsidian visual doctrine: user clarified that Obsidian should be
  extremely beautiful and visually distinct because it can become an invaluable
  knowledge surface. Updated graph colors to use more distinct path-based
  groups, aligned the CereBro CSS snippet colors, and recorded the standing
  rule in `AGENTS.md` and `CEREBRO_FILE_LIFECYCLE_PLAN.md`: Obsidian should use
  distinct folder/path colors, templates, frontmatter, backlinks, callouts, and
  indexes. Do not rely on manual tags just to make nodes readable.
- 2026-05-08 Obsidian graph repair: user showed grey unresolved graph nodes and
  disconnected blue template nodes. Created real section index notes for
  Decisions, Sources, Learning, Projects, Playbooks, Reviews, Ops, and Capture;
  rewired CereBro Knowledge Home to link to those files instead of folders;
  linked templates from the home and their matching section indexes; linked the
  legacy `indexes/cerebro-home` note back into the graph; and set Obsidian
  graph `hideUnresolved` to true so ghost nodes do not pollute the map.
- 2026-05-08 Obsidian project bridge reorg: user clarified that Sundesk should
  be visible to CereBro as an active project CereBro will eventually maintain,
  upgrade, and audit. Added `10_Projects/Sundesk/Sundesk.md` as the project
  bridge, linked it from the Project Registry and Knowledge Home, and linked the
  existing Sundesk Build History and Sundesk PPTX Index back to it. Added
  `80_Templates/Template Library.md` so templates form a deliberate cluster instead
  of loose blue nodes. Added `20_Knowledge/Ops/Obsidian Knowledge System.md` as a
  permanent system note for the vault doctrine: visual beauty is comprehension,
  active projects need bridge notes, graph colors are path-based, and history
  should not be moved/deleted just to make the graph prettier.
- 2026-05-10 Sundesk Obsidian repair: the Sundesk repo `AGENTS.md` had drifted
  back to the root `Sundesk/Build History` lane. Fixed it to use
  `90_Archive/Sundesk Build History/snapshots/`, merged the misplaced Sundesk
  snapshot links into the canonical Sundesk Build History index, moved the
  misplaced snapshots into `90_Archive`, and removed the empty wrong root lane.
  Sundesk remains connected through `10_Projects/Sundesk/Sundesk.md`.
- 2026-05-07 Reddit direction: CereBro should use Reddit heavily as a trusted
  human-signal source: real user reports, niche community expertise, trend
  radar, product complaints, screenshots, videos, links, and community
  disagreements. This belongs in the Source Library, Surfer research lane,
  Hedwig capture queue, Workbench media/evidence surfaces, and Oak/Spock
  validation flow. Treat Reddit as evidence with fingerprints, not automatic
  truth and not model-training data.
- 2026-05-07 build-cadence clarification: the user does not want to return
  every 2-3 minutes just to say "keep going." This feels pointless and creates
  friction. Future CereBro build sessions should run in bounded autonomous
  blocks: 2-4 related safe slices on one surface, then checks, handoff,
  Obsidian snapshot, commit, and summary. Stop only when a gate is required,
  checks fail, product direction changes, the diff gets broad, context is
  getting heavy, or the block is complete.
- 2026-05-07 07:09 EDT slice: Workbench temporary media metadata now covers
  video-frame notes as well as image-review notes. The Workbench can stage a
  temporary local image or video in browser memory, record metadata-only
  evidence, store media kind plus frame-time/duration fields, and display those
  fields in evidence detail. This does not save media bytes, capture
  screenshots, open browsers, call vision models, or write externally.
- 2026-05-07 07:14 EDT slice: Workbench before/after comparison records are
  now partially live. Spock can append a local comparison evidence row linking
  two existing Workbench evidence records, with before/after ids, result text,
  inherited project/task/session/source/command/artifact links where available,
  a permission preflight audit row, and comparison history in evidence detail.
  This does not open linked targets, capture media, fetch sources, run
  commands, save files, or write externally.
- 2026-05-07 07:18 EDT slice: Workbench before/after comparison now uses a
  dedicated local evidence picker instead of only the visible recent-evidence
  list. The picker reads up to 120 local Workbench evidence rows, excludes the
  selected row, supports local search and kind filtering in the detail panel,
  shows candidate metadata, and keeps gates visible. It does not open linked
  targets, fetch sources, execute commands, capture media, save files, or write
  externally.
- 2026-05-07 07:24 EDT slice: Workbench temporary media previews now support
  metadata-only annotation coordinate capture. Clicking a temporary image or
  video preview records normalized `xPct`/`yPct` coordinates, target metadata,
  and current video frame time when available, switches the draft into
  annotation mode, and displays a local marker. This does not capture
  screenshots, save media bytes, inspect linked files, call a vision model, or
  write externally.
- 2026-05-08 UX reset direction: the current UI/UX has become too jumbled and
  too generic-SaaS. The agents and Keep idea stay. The surrounding surfaces need
  the same simplification pass Sundesk got. Sundesk's product rule was: Daily
  is the product, Build is the workshop, Settings are the basement. CereBro's
  matching rule is: the Keep is the product, the Workshop is the work surface,
  and system machinery stays below the floor until needed.
- 2026-05-08 user direction: CereBro is an everyday OS and creative workshop,
  not only a coding harness. It needs to handle quick questions, research,
  learning code/design, YouTube/anime discovery, anime tracking, source capture,
  repo analysis, creative work, and project continuation without making the
  user learn internal architecture first.
- 2026-05-08 reference locked: the Sundesk final training deck at
  `/Users/lindsaybell/Documents/Codex/2026-05-07/files-mentioned-by-the-user-task/sundesk/outputs/manual-20260508-sundesk-demo/presentations/sundesk-command-center-training/output/sundesk-command-center-training-manual.pptx`
  is the simplification reference. It is screenshot-led, routine-led, and
  shows product use instead of describing feature machinery.
- 2026-05-08 tool mapping: Gitingest is now planned as a Silver Surfer
  repo-digestion primitive. Use local CLI/package or a CereBro-native adapter,
  preserve provenance, token/size counts, ignored files, commit SHA when
  available, and vault/source-library output.
- 2026-05-08 product reference: Skales is useful as Aang companion/desktop
  ergonomics inspiration only. Do not copy code or depend on it because of
  license/product-overlap risk.
- 2026-05-08 Aang direction: Aang can become the meeting notetaker surface,
  Otter-style, but the safe V1 path is transcript-first. Teams and Google Meet
  transcript imports/fetches require account permissions and meeting transcript
  availability. Live call joining, recording, and bot attendance are later
  permission-heavy investigations.
- 2026-05-08 deck direction: create a 24-slide finished-product CereBro
  training target deck in the same spirit as the Sundesk command center deck.
  The deck should use high-fidelity mockups that can be ahead of the current
  app and should become the UI/UX target. First teaching moment: start in the
  Keep, ask, capture, route, and watch the agents work. The deck should show
  one full day in CereBro, all agents visible, everyday OS workflows in the main
  story, Aang as bigger than meeting notes, and vault-backed deck/notes/contact
  sheet/source artifacts indexed in Obsidian. Do not generate the PPTX until
  the 24-slide outline is approved.
- 2026-05-08 11:05 EDT UI/UX market research reset: user rejected the current
  finished-product deck direction and clarified that CereBro is unusable if it
  keeps drifting toward generic SaaS. Ran a research-only pass across product
  docs, GitHub-facing agent tooling, Reddit, Hacker News, UX doctrine, and
  pixel-art UI sources. Wrote an Obsidian research package that proposes the
  Keep-first hybrid OS model: the Keep is where work is understood, the
  Workshop is where work is done, the Ledger is where work is proven, and the
  Basement is where the machine is configured. No code changed.
- 2026-05-08 11:25 EDT full interaction deep dive: user clarified that the
  CereBro reset must inspect every interaction, not just the high-level shell:
  buttons, dropdowns, chat, screens, workbench panes, browser/search, anime and
  media tracking, code building, creative work, research, themes, typography,
  borders, windows, approvals, and drag/drop behavior. Ran a second research
  pass across IDEs and AI builders, browsers, research tools, media trackers,
  design-review tools, OS launchers, and UI design systems. Wrote a full
  Obsidian interaction package. No app code changed.
- 2026-05-08 13:07 EDT Aang-first correction: user clarified Aang is not a
  side helper. Aang is the human bridge and the user should always speak to
  Aang. Aang reports to Cortana. Cortana routes the CereBro realm and agent
  layer. User also clarified PixelLab is not the CereBro creative studio. It is
  the external production tool used to create Keep UI, sprites, and current
  agent art through the user's tier 1 membership. Patched the interaction docs
  and wrote the Aang-first full interaction map. No app code changed.
- 2026-05-08 13:16 EDT mode intelligence and deck gate: added explicit
  Aang-first mode inference to `CEREBRO_MASTER_BUILD_PLAN.md` and `AGENTS.md`.
  CereBro should infer the user's mode from context, have Aang show the read,
  ask only when uncertain or risky, remember corrections with approval, and
  route through Cortana with proof. Also locked the next training deck quality
  gate: no wireframes, no grey boxes, no generic SaaS panels, no fake
  placeholder mock images. The deck must show final target product screens,
  including end-state Keep rooms that are unique, dynamic, and specific to each
  agent. No deck generation started.

## Latest Closeout

### 2026-05-08 13:16 EDT - Mode Intelligence And Deck Gate

Files changed:

- `AGENTS.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

What changed:

- Added a named `Aang-First Mode Intelligence` section to the master plan.
- Locked the behavior rule: infer mode, have Aang show the read, ask only when
  unclear or risky, route through Cortana, and record proof.
- Added mode signals: current zone, active surface, selected object, user
  language, attachment type, active project, permission mode, recent work, and
  prior corrections.
- Added correction memory as a requirement. Repeated corrections can become
  playbook proposals only with approval.
- Added runtime requirements for mode inference and Aang confirmation behavior.
- Added the deck quality gate: the training deck must show final target product
  screens, not wireframes, grey boxes, placeholder dashboards, or fake
  low-fidelity mock images.
- Added the Keep deck requirement: each agent room should look distinct,
  dynamic, and specific to that agent.
- Recorded PixelLab as the external production tool for Keep UI, sprites,
  chamber props, and agent assets.

Gates preserved:

- No app code changed.
- No deck generated.
- No images generated.
- No PixelLab calls.
- No Notion or Slack writes.
- No external model/tool calls.
- No destructive cleanup.

Known risks:

- The deck needs a tight approval gate before production because it will become
  the visual target for the build.
- High-fidelity final-state images may require PixelLab asset generation or
  image generation after approval.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_SESSION_HANDOFF.md`, and the Obsidian
note `20_Knowledge/Playbooks/CereBro Aang First Full Interaction Map.md`. Treat
Aang as the human bridge. CereBro must infer mode from context, have Aang show
the read, ask only when uncertain or risky, remember corrections with approval,
and route through Cortana. Do not generate a deck, images, or wireframes until
Josh approves the deck plan. The deck must show final target product screens,
including unique dynamic rooms for every agent, not placeholders.

### 2026-05-08 13:07 EDT - Aang First Interaction Correction

Files changed:

- `CEREBRO_SESSION_HANDOFF.md`
- `00_Atlas/CereBro Knowledge Home.md` in the Obsidian vault
- `20_Knowledge/Sources/2026-05-08 CereBro Full Interaction Source Index.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 Current CereBro Interaction Audit.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 CereBro Market Pattern Matrix.md` in the Obsidian vault
- `20_Knowledge/Playbooks/Playbooks.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Complete Interaction Spec.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Visual System And Theme Spec.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Aang First Full Interaction Map.md` in the Obsidian vault

What changed:

- Corrected the product hierarchy: the user speaks to Aang; Aang interprets
  and reports to Cortana; Cortana routes the agents; the Keep shows the route;
  the Ledger records proof.
- Corrected PixelLab's role: PixelLab is the external asset production tool for
  Keep UI, sprites, chamber art, and agent animation assets. CereBro should
  track and review those outputs, not pretend PixelLab is an in-app creative
  studio.
- Added an Aang-first full interaction map covering Keep home, Aang command
  dock, chamber inspector, Workshop, build mode, browse mode, research mode,
  media mode, Keep asset review, Ledger, Basement, buttons, dropdowns,
  segmented controls, comboboxes, context menus, typography, colour, borders,
  and window rules.
- Inspected local sibling projects for product-family UI grammar: Bridgefour,
  Declyne, Waymark, and Sygnalist. Recorded the guardrail that CereBro should
  share the standard of distinct product identity without copying any one skin.

Research finding:

- Aang is the human-facing operating surface. Cortana is the internal command
  router. That keeps the product emotionally legible while preserving the
  agent hierarchy.

Checks run:

- Local repo inspection for Bridgefour, Declyne, Waymark, and Sygnalist.
- Web source pass for buttons, context menus, dropdowns, dialogs, tooltips,
  target size, and focus appearance.
- Obsidian index update.

Gates preserved:

- No app code changed.
- No app run.
- No PPTX generated.
- No Notion or Slack writes.
- No PixelLab calls.
- No external model/tool calls beyond web research.
- No media generation.
- No destructive cleanup.

Known risks:

- The Aang-first map is still implementation-free. It should be approved before
  wireframes, deck repair, mockups, or shell code.
- The next pass should name the exact first-screen layout and interaction
  order before any styling work starts.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, and the Obsidian note
`20_Knowledge/Playbooks/CereBro Aang First Full Interaction Map.md` first. Treat
Aang as the human bridge. Aang reports to Cortana. Cortana routes agents.
Treat PixelLab as the external Keep/agent asset production tool, not as the
in-app creative studio. Do not write code until Josh approves the Aang-first
interaction map. If approved, produce implementation-free wireframes for Keep
home, Aang command dock, Cortana routing receipt, chamber inspector, Workshop
presets, browser/research/media surfaces, Keep asset review, Ledger, and
Basement.

### 2026-05-08 11:25 EDT - Full Interaction Deep Dive

Files changed:

- `CEREBRO_SESSION_HANDOFF.md`
- `00_Atlas/CereBro Knowledge Home.md` in the Obsidian vault
- `20_Knowledge/Sources/Sources.md` in the Obsidian vault
- `20_Knowledge/Sources/2026-05-08 CereBro Full Interaction Source Index.md` in the Obsidian vault
- `20_Knowledge/Reviews/Reviews.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 Current CereBro Interaction Audit.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 CereBro Market Pattern Matrix.md` in the Obsidian vault
- `20_Knowledge/Playbooks/Playbooks.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Complete Interaction Spec.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Visual System And Theme Spec.md` in the Obsidian vault

What changed:

- Audited the current app shell against the market research and confirmed the
  main failure: internal implementation surfaces are exposed as equal primary
  navigation items.
- Wrote a current interaction audit that calls out the 14-item rail, dev-heavy
  header, old Pixel Punk theme, "Ask Aang" composer mismatch, isolated panels,
  and planning-only workbench.
- Wrote a market pattern matrix comparing CereBro areas against AI IDEs,
  browser spaces, source libraries, media trackers, creative tools, design
  review tools, task systems, and OS launchers.
- Wrote a complete interaction spec for navigation, Keep chambers, command
  dock, Workshop modes, build mode, browser mode, research mode, media mode,
  PixelLab mode, Ledger, approvals, automation, settings, buttons, menus,
  forms, modals, search, notifications, accessibility, and mobile.
- Wrote a visual system and theme spec with Keep Dark, Daylight Archive, Ember
  Forge, Moonlit Violet, High Contrast Terminal, and PixelLab Proof themes.
- Linked all new notes into Obsidian indexes and Knowledge Home.

Research finding:

- CereBro needs a stable 4-zone OS model and market-native specialist modes.
  Keep, Workshop, Ledger, and Basement stay constant. Coding, browsing,
  research, media, creative work, automation, and settings each need their own
  interaction grammar inside that shell.

Checks run:

- Web research with source links across official docs, Reddit user-signal
  threads, and design-system guidance.
- Local inspection of `Home.tsx`, `KeepScene.tsx`, `keepConfig.ts`,
  `WorkbenchPanel.tsx`, and `index.css`.
- Obsidian index link update.

Gates preserved:

- No app code changed.
- No app run.
- No PPTX generated.
- No Notion or Slack writes.
- No PixelLab calls.
- No external model/tool calls beyond web research.
- No media generation.
- No destructive cleanup.

Known risks:

- The interaction spec is implementation-free. It still needs user approval
  before wireframes, deck repair, mockups, or app changes.
- The next implementation step should be a scoped shell reset, not piecemeal
  button restyling.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, and the Obsidian notes
`20_Knowledge/Reviews/2026-05-08 Current CereBro Interaction Audit.md`,
`20_Knowledge/Reviews/2026-05-08 CereBro Market Pattern Matrix.md`,
`20_Knowledge/Playbooks/CereBro Complete Interaction Spec.md`,
`20_Knowledge/Playbooks/CereBro Visual System And Theme Spec.md`, and
`20_Knowledge/Sources/2026-05-08 CereBro Full Interaction Source Index.md`.
Do not write code until Josh approves the interaction direction. If approved,
draft implementation-free wireframes for the 4-zone shell, Cortana orb command
dock, Keep chamber inspector, Workshop pane presets, Ledger object receipt,
Basement settings map, media library mode, and PixelLab asset workflow.

### 2026-05-08 11:05 EDT - UI UX Market Research Reset

Files changed:

- `CEREBRO_SESSION_HANDOFF.md`
- `00_Atlas/CereBro Knowledge Home.md` in the Obsidian vault
- `20_Knowledge/Sources/Sources.md` in the Obsidian vault
- `20_Knowledge/Sources/2026-05-08 AI OS UI UX Source Index.md` in the Obsidian vault
- `20_Knowledge/Reviews/Reviews.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 CereBro UI UX Market Research Brief.md` in the Obsidian vault
- `20_Knowledge/Decisions/Decisions.md` in the Obsidian vault
- `20_Knowledge/Decisions/2026-05-08 CereBro Keep First UX Direction.md` in the Obsidian vault
- `20_Knowledge/Playbooks/Playbooks.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Finished Product UX Spec.md` in the Obsidian vault

What changed:

- Confirmed the prior finished-product deck artifact was not found in the
  CereBro vault or recent Codex output paths. The handoff shows the 10:00 deck
  pass had scoped a deck but preserved the gate not to generate PPTX.
- Researched current AI product and agent UX patterns across official product
  docs, GitHub-facing agent tooling, Reddit, Hacker News, UX doctrine, and
  pixel-art UI sources.
- Wrote a source index with product, Reddit, Hacker News, UX, and PixelLab
  references.
- Wrote a market research brief concluding that CereBro should not be a generic
  dashboard, chat app, or workflow builder.
- Wrote a proposed Keep-first UX decision.
- Wrote a draft finished-product UX spec.
- Linked all new notes into their Obsidian section indexes and Knowledge Home
  so the graph does not create orphaned nodes.

Research finding:

- The market pattern is intake, visible execution, durable evidence, and
  permissioned action. CereBro should express that as Keep, Workshop, Ledger,
  and Basement.

Checks run:

- Web research with source verification and links.
- Local search for the hated CereBro deck in the CereBro vault and recent Codex
  output paths.
- `rg` ban check on new Obsidian notes for em dashes, exclamation marks, and
  banned AI/corporate register.
- `git status --short`.

Gates preserved:

- No app code changed.
- No app run.
- No redesign implementation.
- No PPTX generated.
- No Notion or Slack writes.
- No external model/tool calls beyond web research.
- No PixelLab calls.
- No media generation.
- No destructive cleanup.

Known risks:

- The research package is a strong first pass, not a final visual system.
- The next step needs approval before turning this into wireframes, mockups, or
  app changes.
- The bad deck still may exist in a separate chat export path not visible from
  the repo, vault, or recent Codex output search.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, the Obsidian notes
`20_Knowledge/Reviews/2026-05-08 CereBro UI UX Market Research Brief.md`,
`20_Knowledge/Decisions/2026-05-08 CereBro Keep First UX Direction.md`,
`20_Knowledge/Playbooks/CereBro Finished Product UX Spec.md`, and
`20_Knowledge/Sources/2026-05-08 AI OS UI UX Source Index.md`. Do not write code
until Josh approves the Keep-first UX direction. If approved, produce the
first implementation-free design pass: Keep home IA, chamber inspector, orb
command intake, Workshop shell, Ledger receipt view, Basement settings map,
and PixelLab asset-state list.

### 2026-05-08 10:00 EDT - Finished UI Training Deck Scope

Files changed:

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

What changed:

- Locked the CereBro finished-product training deck target as 24 slides.
- Confirmed the deck should be high-fidelity and allowed to be ahead of the
  current app.
- Confirmed the deck should show a full day in CereBro, not isolated features.
- Confirmed all agents stay visible, with slide focus limited to the agents
  involved in the moment.
- Confirmed everyday OS workflows belong in the main story.
- Confirmed Aang must be shown as companion, explainer, learning guide, event
  surface, and meeting-note helper. Not only meeting notes.
- Confirmed final deck artifacts should live in the CereBro vault media library
  with Obsidian indexing.
- Confirmed PPTX generation waits for outline approval.

Checks run:

- Re-read Session 4.5 in `CEREBRO_MASTER_BUILD_PLAN.md`.
- Re-read the latest closeout in `CEREBRO_SESSION_HANDOFF.md`.
- Read the `goodfit` skill guidance for the deck voice.

Gates preserved:

- No PPTX generated.
- No product UI changed.
- No app run.
- No Notion or Slack writes.
- No external model/tool calls.
- No media generation.
- No destructive cleanup.

Known risks:

- The deck will need a careful source pass across the Keep visual spec and
  current plan files before mockup production.
- The deck must not become a feature inventory. It needs a day-in-the-life
  training path with the Keep as the product spine.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, Session 4.5 in `CEREBRO_MASTER_BUILD_PLAN.md`,
the castle UI visual spec, and the Sundesk command center training deck. Draft
the 24-slide CereBro finished-product training deck outline only. Do not
generate PPTX until the outline is approved. The deck should teach: start in
the Keep, ask/capture/route/watch agents work, one full day in CereBro,
Workshop when needed, system machinery below the floor, all agents visible,
everyday OS workflows in the main story, Aang as companion/teacher/notetaker,
and final artifacts saved to the CereBro vault media library.

### 2026-05-08 09:47 EDT - Keep-First UX Reset Plan

Files changed:

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

What changed:

- Promoted a Keep-first UX reset ahead of more Workbench/runtime expansion.
- Added Session 4.5 as the next product gate.
- Recorded the Sundesk final training deck as the simplification reference.
- Added the everyday OS lane: ask, capture, research, build, create, learn,
  watch, and review.
- Added Gitingest as the Silver Surfer repo-digest direction.
- Added Skales as Aang companion UX reference only.
- Added Aang transcript-first meeting notes direction.

Checks run:

- Read the Sundesk final deck text from the supplied PPTX. It has 20 slides and
  a clear routine-led flow: start here, product map, paste, edit table, fields,
  tags, links, communities, Today, Waiting On, meetings, timeline views, graph,
  Build, helpers, data/access, routine.
- Viewed the Sundesk command center training contact sheet from the Obsidian
  vault copy.
- Checked current Teams and Google Meet transcript API docs before recording
  Aang's meeting-notes path.

Gates preserved:

- No code changes.
- No app run.
- No Notion or Slack writes.
- No external model/tool calls.
- No media capture or durable media save.
- No desktop overlay process.
- No destructive cleanup.

Known risks:

- The current running UI still needs a separate visual/interaction audit before
  implementation. This update only corrects the plan.
- Aang meeting notes depend on meeting transcripts, account permissions, and
  platform-specific rules. Live bot/audio capture remains out of V1 until it is
  threat-modeled.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, and the new Session 4.5 in
`CEREBRO_MASTER_BUILD_PLAN.md`. Do not add new Workbench machinery first. Audit
the current app UI against the Sundesk simplification pattern and draft the
Keep-first UX spine: first screen, everyday modes, chamber actions, Workshop
layer, and system-basement rules. Preserve the Keep and visible agents. Run
checks, update handoff plus Obsidian snapshot/index, and commit locally.

### 2026-05-07 07:24 EDT - Workbench Annotation Coordinates

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`

What changed:

- Added click-to-mark annotation coordinates on temporary image/video previews.
- Coordinates are stored as normalized percentages plus temporary media target
  metadata.
- Video annotations also record the current preview frame time when available.
- Annotation clicks switch the local evidence draft to `annotation`, route it
  to Gojo, and keep the visible marker in the preview.
- Renamed the temporary intake label from image-only to media.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- Coordinates are relative to the rendered preview box. Object-fit letterboxing
  means a later polish slice should translate from preview-box coordinates to
  intrinsic media coordinates.
- Keyboard marking currently records the preview center. Fine-grained keyboard
  adjustment can wait.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation coordinate polish for intrinsic media bounds, or server-side
pagination for the local evidence picker. Preserve all gates. Run checks,
update handoff plus Obsidian snapshot/index, and commit locally.

### 2026-05-07 07:18 EDT - Workbench Evidence Picker

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `app/server/cerebro-foundations.test.ts`

What changed:

- Added `workbench.evidencePicker`, a read-only local candidate query for
  comparison selection.
- Added picker gates and summary metadata for total, sensitive, media, and
  comparison evidence rows.
- Updated the before/after form to use the dedicated picker rather than the
  currently visible recent-evidence list.
- Added local search, kind filtering, selected-candidate metadata, empty state,
  and visible picker gates in the Workbench detail panel.
- Expanded the foundation test to cover picker search, exclusion, summary, and
  no-action guarantees.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- The picker query runs when an evidence detail row is selected and currently
  returns a capped local candidate set. Later it can add server-side pagination
  if Workbench evidence grows large.
- The picker filters locally in the panel after loading candidates. It still
  does not inspect linked files or media bytes.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation-coordinate capture tied to temporary image/video previews, or
server-side pagination for the local evidence picker. Preserve all gates. Run
checks, update handoff plus Obsidian snapshot/index, and commit locally.

### 2026-05-07 07:14 EDT - Workbench Before/After Comparison

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `app/server/cerebroDb.ts`
- `app/server/cerebro-foundations.test.ts`

What changed:

- Added local append-only `before_after` comparison records for Workbench
  evidence.
- Added `before_evidence_id`, `after_evidence_id`, and `comparison_result` to
  the idempotent local DB schema and migration guard.
- Added `workbench.createBeforeAfterComparison`, including existence checks,
  sensitive-flag carryover, inherited local links, and permission preflight
  audit logging.
- Added comparison history to `workbench.evidenceDetail`.
- Added a Workbench detail-panel comparison form that compares the selected
  evidence row with another visible local evidence row and appends a new
  comparison record.
- Expanded the foundation test to cover comparison creation and comparison
  history.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- Comparison options currently come from the visible evidence list in the
  Workbench panel. A later slice should add a dedicated local evidence picker
  so older records outside the current list can be selected.
- Comparisons are notes over existing evidence. They do not inspect linked
  files, replay video frames, or validate visual correctness by themselves.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation-coordinate capture tied to temporary image/video previews, or a
dedicated local evidence picker for before/after comparisons. Preserve all
gates. Run checks, update handoff plus Obsidian snapshot/index, and commit
locally.

### 2026-05-07 07:09 EDT - Workbench Video Frame Metadata

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `app/server/cerebroDb.ts`
- `app/server/cerebro-foundations.test.ts`

What changed:

- Added Workbench support for local temporary video evidence records under
  `video_frame`.
- Added metadata fields for `media_kind`, `media_frame_time_sec`, and
  `media_duration_sec` to the idempotent local DB schema and migration guard.
- Updated Workbench create/read/detail flows to preserve image/video metadata
  without saving media bytes.
- Updated the Workbench panel to stage image or video files with object URLs,
  collect optional video frame time, and display media metadata in evidence
  lists and detail.
- Expanded the foundation test to cover metadata-only video-frame evidence.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- This is metadata-only. The Workbench does not yet extract video frames,
  annotate directly on video, or run a vision model.
- The temporary media preview exists only in the browser session. Evidence rows
  intentionally store the file name, MIME type, byte size, media kind, and
  timing metadata, not the bytes.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation-coordinate capture tied to temporary image/video previews, or a
proposal-only before/after comparison record. Preserve all gates. Run checks,
update handoff plus Obsidian snapshot/index, and commit locally.

## Audit Snapshot

### Repo State

The worktree was already dirty before this handoff was created. Existing modified/untracked files include agent Markdown files, Keep scene/UI files, backend harness/router files, PixelLab/CC0 sprite assets, scripts, tests, and planning docs.

Do not revert or delete existing dirty files unless the user explicitly approves.

### Storage Snapshot

- System data volume: 228Gi total, 166Gi used, 32Gi available, 85% capacity.
- Repo size: 825M.
- `app/`: 791M.
- `app/node_modules`: 751M.
- `app/client/public`: 23M.
- `app/client/public/sprites`: 23M.
- `app/client/public/sprites/cc0`: 11M.
- `app/client/public/sprites/cerebro`: 748K.

Conclusion: the repo is not yet the storage problem. Heavy generated media, model weights, render intermediates, and duplicated asset packs are the future risk.

### Hardware Snapshot

- Machine: MacBook Pro.
- Model Identifier: Mac14,7.
- Chip: Apple M2.
- CPU cores: 8 total, 4 performance and 4 efficiency.
- Memory: 8GB.
- macOS: 26.4.1.
- System data volume remains 228Gi total, 166Gi used, 32Gi available, 85% capacity.

Do not record serial numbers or hardware UUIDs in repo docs.

### Model Snapshot

- `ollama` is not currently found on PATH.
- Ollama was not installed or launched in this session.
- No local models were downloaded.
- `CEREBRO_MODEL_ROUTER_BASELINE.md` now records the Session 2 baseline, Ollama install options, escalation policy, and proposed lightweight M2/8GB shortlist.
- Local model setup still requires user approval before installing Ollama or downloading models.
- The model-router baseline now also records the larger reasoning-route target:
  a Model/Tool Capability Registry, a Reasoning Gateway interface, free-tier
  hosted model/tool lanes, a required frontier lane for hard reasoning, and a
  small eval suite before any model/tool becomes a recommended default.
- Candidate routing infrastructure to evaluate later includes LiteLLM,
  OpenRouter, direct provider SDKs, and a small CereBro-native gateway. No
  gateway dependency was installed in this slice.
- Candidate eval tools to evaluate later include promptfoo, DeepEval, and
  custom Vitest fixtures. No eval dependency was installed in this slice.

### File Lifecycle Snapshot

- `CEREBRO_FILE_LIFECYCLE_PLAN.md` is now the Session 3 source for the cleanliness system.
- Current code only has a simple vault output writer: `app/server/integrations/vault.ts` writes approved outputs to `outputs/<session>/<output>`.
- Current DB now has idempotent `artifacts` and `cleanup_candidates` lifecycle tables in `app/server/cerebroDb.ts`.
- Approved output vault writes now record a first-pass `artifacts` metadata row from `app/server/routers/outputs.ts`.
- `app/server/integrations/vault.ts` now exposes the canonical vault layout, including `07_Knowledge/obsidian-vault` for Obsidian.
- `integrations.status` now returns vault, Notion, Obsidian, and vault layout status.
- `app/server/routers/piccolo.ts` now provides a read-only hygiene report for vault setup, Obsidian setup, repo pollution candidates, missing canonical folders, and artifact counts.
- Google Drive vault path is configured in local env as `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault`.
- Obsidian path is configured in local env as `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault/07_Knowledge/obsidian-vault`.
- The canonical vault folder tree was created after user approval. No existing files were moved/deleted.
- Existing legacy vault folders `outputs`, `sources`, and `memory` were observed and left untouched.
- Obsidian app setup was verified: `.obsidian/` exists inside the configured Obsidian vault folder with `app.json`, `appearance.json`, `core-plugins.json`, and `workspace.json`.
- Artifact hooks now exist for Notion inbox imports, Notion outbox publishes, memory writes, approved Obsidian note writes, source notes, creative prompts, messages, code/QA handoffs, model tests, temp notes, and cleanup reports.
- UI visibility now exists for artifact status and Piccolo hygiene findings.
- Remaining Session 3 polish was completed enough to move forward: Artifact Library now has clearer approved write controls for Obsidian notes, source notes, creative prompts, message drafts, and cleanup reports; Piccolo Hygiene can save a read-only cleanup report artifact.
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` now records the corrected Session 4 direction.
- Next implementation target: Session 4 Personal Command Center and Project Intelligence. Richer source capture can wait for Surfer/browser work, and creative binary asset manifests can wait for image/video workflows.

### Project Intelligence Snapshot

- GitHub connector can see `Bowgull/sygnalist-brain`, `Bowgull/Waymark`, `Bowgull/Bridgefour`, `Bowgull/Declyne`, and `Bowgull/CereBro`.
- Local checkouts found:
  - `/Users/lindsaybell/Developer/Declyne`
  - `/Users/lindsaybell/Developer/Waymark`
  - `/Users/lindsaybell/Developer/sygnalist-brain`
  - `/Users/lindsaybell/Developer/bridgefour`
  - `/Users/lindsaybell/Desktop/CereBro`
- Local repo state observed read-only:
  - Declyne: `main`, dirty UI files including `ImportCsvButton.tsx`, `SearchSheet.tsx`, `Credit.tsx`, `EditLog.tsx`, `Holdings.tsx`, `Merchants.tsx`, `Onboarding.tsx`, `Review.tsx`.
  - Waymark: `main...origin/main`, clean.
  - Sygnalist: `main...origin/main`, modified `.gitignore`.
  - Bridgefour: `main...origin/main`, untracked `public/assets/resume_saltxc.docx`.
- Declyne should be treated as a market candidate, but not App Store-ready yet. It needs Plaid/bank-connect architecture, UI/UX repair, financial logic validation, privacy/security review, and App Store readiness work.
- Existing Declyne docs show the connect plan completed through Session 108, but a search did not find Plaid implemented or planned in visible local files.
- Tony must treat Declyne as an active dirty worktree and never overwrite local changes without reading them first.
- `app/server/routers/projectIntelligence.ts` now provides the first read-only
  Project Intelligence API surface. It checks whether each known local checkout
  exists, reads `git status --short --branch`, reads the origin remote, and
  returns the static project profile metadata from
  `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- The Keep left rail now has a live `Project Lab` section instead of the
  previous Project Spaces stub.
- `app/client/src/components/ProjectLabPanel.tsx` displays summary counts,
  intake categories, project modes, local paths, git cleanliness, owner/support
  agents, risks, stack tags, and next-action text.
- This is intentionally not a task runner yet. It does not edit external repos,
  create project tasks, pull GitHub data, mutate vault files, or clean anything.
- Batman is now explicitly part of Project Intelligence as the War Room
  strategy/risk layer: project priority, readiness tradeoffs,
  build-vs-package-vs-ship decisions, failure modes, and smallest next move.
- `app/server/routers/commandIntake.ts` now provides the first proposal-only
  command intake API. It classifies user text into the Session 4 intake
  taxonomy, detects the likely project, maps to a project mode, recommends
  agents, and returns permission gates and a next-step suggestion.
- The bottom command bar now submits intake previews on Enter/Preview and shows
  the proposed route above the bar. It does not create tasks, write files,
  browse, edit code, or touch external project repos.
- The clarified product direction now includes a personal OS loop: ask
  Cortana/Aang, route through Cortana, let Surfer open source/browser findings
  when outside information is needed, validate with Batman/Spock/Oak, learn
  through Aang, and save durable outputs only with approval.
- The intake taxonomy now includes `self_improvement` and
  `system_improvement`. Surfer is a key daily-use agent for both: finding
  current sources, useful tools, references, tutorials, GitHub repos, market
  signals, and ways to improve CereBro or the user.
- Modular panels are now a stated UI direction: Project Lab, Surfer
  Source/Browser Panel, Gojo Preview Studio, Aang Learning Path, Piccolo
  Hygiene, and Artifact Library should behave like focused workspaces/windows.
- `app/server/routers/surfer.ts` now provides the first proposal-only Surfer
  source panel API: browser policy, extraction ladder, saved source records from
  the `sources` table, and offline research-preview source cards.
- The Sources nav is now live and opens `SurferSourcesPanel`. It shows browser
  locked/proposal-only status, saved sources, the browser ladder, policy notes,
  and query-based preview cards. It does not browse, fetch, screenshot, save, or
  write yet.
- Surfer Sources now has an approved public URL ingestion lane. Clicking
  `Ingest URL` approves one public HTTP/HTTPS fetch, extracts a small
  title/summary, upserts a `sources` row, and records `source_url` artifact
  metadata. It does not crawl, run open web search, browse privately, log into
  sites, screenshot, or save full page text.
- Surfer source records now carry first-pass metadata fields for
  `source_type`, `trust_level`, `freshness_status`, `content_type`,
  `word_count`, `sensitive_data_flag`, `scrub_notes`, `trust_notes`, and
  `last_scrubbed_at`. Existing DBs are migrated idempotently on startup.
- Approved public URL ingestion now deterministically classifies source type,
  infers trust level from public URL patterns, redacts email/phone/credential-like
  text from the stored summary, flags scrubbed sensitive-looking summaries, and
  records the trust/scrub notes on the `source_url` artifact metadata.
- Surfer Sources now displays saved-source trust, freshness, word-count, and
  scrubbed badges instead of treating all saved URLs as unknown.
- User clarified storage/capture architecture:
  - Obsidian is for durable Markdown knowledge, including approved CereBro
    session handoff snapshots and a session index note.
  - Notion is the structured capture database for raw ideas, links, TikToks,
    Reddit posts, articles, conversation notes, learning seeds, reminders, and
    "save this for later" items.
  - Slack is nonnegotiable in V1 as Hedwig's quick-capture intake lane.
  - iMessage remains a later OpenClaw/macOS-permission investigation and should
    not block Slack capture.
  - Obsidian graph/constellation view is nice if links emerge naturally, but
    the plan should prioritize simple folders, index notes, tags, and backlinks
    rather than optimizing for graph aesthetics.
- The master/project/file-lifecycle plans now explicitly place Slack/Notion
  capture under Hedwig, Obsidian session handoff snapshots under Output/Obsidian
  work, and the modular Terminal Lab under runtime/UX/learning.
- Added a proposal-only Handoff Archive slice:
  - `app/server/routers/handoffs.ts` scans repo Markdown read-only for likely
    session handoff candidates.
  - `handoffs.archivePlan` returns the proposed Obsidian folder/index shape,
    configured Obsidian status, candidate files, excerpts, sizes, modified
    times, and recommended paths.
  - `HandoffArchivePanel` is live from the Keep left rail under `Handoffs`.
  - The panel does not write to Obsidian, Notion, Slack, vault files, or repo
    handoff snapshots. It is proposal/inspection only.
  - Read-only search found the live `CEREBRO_SESSION_HANDOFF.md` as the real
    session handoff candidate; other "handoff" hits are mostly old planning
    references and Claude Code handoff templates, not session closeouts.
- User clarified the stronger use case is not a large "session handoffs in
  CereBro" UI. Session handoff snapshots can live in Obsidian, while CereBro
  should actively learn reusable prompts/tool handoffs: external-model prompts,
  PixelLab prompts, spreadsheet prompts, tool URLs, or workflows that worked
  well. When CereBro suggests reuse, it must say which prompt/tool handoff it is
  reusing or adapting and why.
- The `Handoffs` left-rail item was removed so the app does not over-emphasize
  session handoffs as a primary workspace. The proposal-only backend/panel files
  remain available for a later approved Obsidian snapshot flow, but are no
  longer exposed in the main navigation.
- Command intake previews now include a task draft. The preview card has an
  explicit `Create Task` action that writes one normal CereBro task through the
  existing tasks router and then opens the Tasks panel. It does not start agent
  execution, edit files, browse, or touch external repos.
- Intake-created tasks now link to detected Project Intelligence profiles when
  possible. If the intake detects Declyne, Waymark, Sygnalist, Bridgefour, or
  CereBro, `Create Task` creates/finds the matching harness project row by local
  path and stores the task with `project_id`.
- Tasks now return joined project metadata (`projectName`, `projectPath`) and
  display the project name in the Tasks panel instead of only `Project #id`.
- Project Lab now reads harness task rollups for each profile path. Project
  cards show task counts, linked harness project row id, and the most recent
  tasks for that project.
- Tasks now has project filter chips backed by a `tasks.projects` query. Filters
  show All plus projects that currently have tasks, with active/open task counts.
- Project Lab now has the requested read-only integration slice for known
  projects. `projectIntelligence.overview` aggregates local pending approvals,
  Hedwig proposal counts, Terminal Lab observation status/risk counts, source
  event counts, and recent local approval/source snippets by linked harness
  project row. Approvals are resolved through task links or local target records
  such as command observations, Hedwig captures/proposals, and source events.
- Project Lab cards now show a compact signal quartet for `Pending Approvals`,
  `Hedwig Proposals`, `Terminal Status`, and `Source Events`, plus a separate
  `Safe` next-action line computed from the highest-risk local queue first.
  This remains visibility/proposal-only: no UI command execution, external
  repo edit, Notion write, Slack read/write, browser/search action, or source
  fetch was added.
- Direct smoke test of `projectIntelligence.overview` returned 5 known projects,
  7 local pending approvals, 141 Hedwig proposals, 95 Terminal observations,
  and 13 source events at closeout time. These are local SQLite/libSQL records,
  not external service counts.
- Added the first cross-surface local approval queue:
  - `app/server/routers/approvals.ts` provides a read-only `approvals.list`
    API over existing pending approval-preview rows.
  - The router joins local approval previews back to command observations,
    Hedwig capture/reminder/message proposals, source events, tasks, and
    linked projects when available.
  - It supports local filters for status, origin, project, search query, and
    limit.
  - It classifies preview origin as Hedwig, Terminal, Source, Project Lab, or
    other from existing metadata.
  - It adds deterministic Oak risk preflight notes and Spock shape-check notes
    before approval review. These notes are not validation results and do not
    approve anything.
  - `app/client/src/components/ApprovalDashboardPanel.tsx` is live from the
    Keep left rail as `Approvals`.
  - The panel shows search, origin/status/project filters, local preview cards,
    selected-preview detail, reason/context, and Oak/Spock notes. It has no
    approve/reject/execute/fetch/schedule/send/write controls.
  - `app/server/cerebro-foundations.test.ts` now covers the approval queue for
    both Hedwig source-enrichment previews and Terminal command previews.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm test -- app/server/cerebro-foundations.test.ts` passed. Vitest also
    ran the existing bridge, agents, and auth tests in this workspace, with 30
    tests passing.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Local dev server was already listening on port 3002 under a Node process, so
  no new server process was started. The app is available at
  `http://localhost:3002`.
- Files changed in this slice:
  - `app/server/routers/approvals.ts`
  - `app/server/routers.ts`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
- No Notion, Slack, browser/search, external repo, git, cleanup, or destructive
  action was performed.
- Added the first proposal-only modular Workbench shell:
  - `app/server/routers/workbench.ts` exposes `workbench.plan`.
  - `app/client/src/components/WorkbenchPanel.tsx` is live from the Keep left
    rail as `Workbench`.
  - It defines V1 surfaces for localhost previews, public browser views,
    screenshots, image/video review, annotation canvas, terminal/log output,
    validation notes, and before/after comparison.
  - It defines first-pass permission classes for local preview, public browser,
    media review, annotation, and validation.
  - It defines an append-only evidence record shape with project/task/session,
    owner-agent, target, viewport/coordinate, and validation metadata fields.
  - The panel is planning/read-only. It does not open a browser, iframe,
    screenshot tool, file picker, video tool, or terminal.
- Added the first proposal-only Aang Companion policy shell:
  - `app/server/routers/companion.ts` exposes `companion.policy`.
  - `app/client/src/components/AangCompanionPanel.tsx` is live from the Keep
    left rail as `Aang`.
  - It compares web mock, menu bar helper, and transparent overlay shell paths.
    Web mock remains the recommended first build slice.
  - It defines allowed local events for pending approvals, Terminal Lab status,
    Hedwig review, source saves, task creation, session status, and Piccolo
    storage/cleanup warnings.
  - It explicitly blocks screen reading, private app inspection, Slack
    reads/writes, Notion writes, scheduling, external notifications, command
    execution, browser automation, and repo edits.
  - It includes local mock controls for awake/muted/parked/sleeping state, but
    starts no desktop process and sends no notifications.
- Added tests for both new proposal-only shell plans in
  `app/server/cerebro-foundations.test.ts`.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm test -- app/server/cerebro-foundations.test.ts` passed. Vitest also
    ran the existing bridge, agents, and auth tests in this workspace, with 32
    tests passing.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/server/routers/companion.ts`
  - `app/server/routers.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, media capture, desktop overlay process,
  external repo, git, cleanup, or destructive action was performed.
- Added local append-only Workbench evidence records:
  - `app/server/cerebroDb.ts` now creates `workbench_evidence_records`.
  - Records capture evidence kind, title, summary, optional target URI,
    project/task/session/source/command/artifact links, owner/route agent,
    viewport, coordinates, annotation text, validation status, permission
    class, sensitive flag, and created time.
  - `workbench.evidence` lists local evidence records with project/kind/search
    filters.
  - `workbench.createEvidence` creates one local append-only evidence record.
    It does not capture screenshots, open browser/media tools, run commands,
    write files, or write externally.
  - `WorkbenchPanel` now includes a manual `Add Evidence` form and a recent
    evidence list. This is a local DB history lane only.
- Added live local event counts to the Aang Companion policy shell:
  - `companion.localEvents` reads counts for pending approvals, blocked or
    reviewing Terminal observations, Hedwig captures needing review, source
    events from the last 24 hours, tasks created in the last 24 hours, live
    sessions, and cleanup proposals.
  - `AangCompanionPanel` now shows these counts in a local event strip and
    keeps the same awake/muted/parked/sleeping local mock state.
  - This does not send notifications, start a desktop process, inspect the
    screen, read Slack/Notion, route through browser automation, or execute
    commands.
- Added test coverage for Workbench evidence create/list and Companion local
  event counts.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts` passed with 14
    tests. A broader `pnpm test -- app/server/cerebro-foundations.test.ts` run
    launched adjacent test files and hit an intermittent SQLite `SQLITE_BUSY`
    lock in an existing Hedwig DB write path; the direct target-file run passed.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/workbench.ts`
  - `app/server/routers/companion.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, media capture, desktop overlay process,
  external repo, git, cleanup, command execution, file write outside the repo
  handoff/Obsidian closeout path, or destructive action was performed.
- Added local link pickers and append-only validation notes to Workbench:
  - `workbench.linkOptions` returns recent local saved sources and Terminal Lab
    command observations. It is read-only and does not fetch sources or execute
    commands.
  - The Workbench Add Evidence form now supports linking an evidence record to
    a saved source and/or command observation.
  - `workbench.createValidationNote` appends a new `validation_note` evidence
    record for an existing evidence record. It does not mutate or overwrite the
    original evidence row.
  - Validation notes support Oak or Spock, local statuses
    `needs_review`, `looks_consistent`, `blocked`, and
    `validated_for_local_use`, and a local note body.
  - The Workbench evidence detail inspector now has an Append Validation Note
    control. It creates local history only.
- Added Aang Companion event routing buttons:
  - Aang local event cards now open the matching existing Keep panel:
    Approvals, Terminal Lab, Hedwig Inbox, Sources, Tasks, Automation, or Home.
  - This is in-app navigation only. It does not start a desktop overlay,
    notify, execute, read external services, or write externally.
- Added test coverage for `workbench.linkOptions` and
  `workbench.createValidationNote`.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts` passed with 14
    tests.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external repo, git, cleanup, command execution, file write
  outside the repo handoff/Obsidian closeout path, or destructive action was
  performed.
- Deepened Workbench evidence review:
  - `workbench.evidenceDetail` now returns one local evidence record with joined
    project, task, session, source, command observation, and artifact labels
    where available.
  - The detail endpoint is read-only and does not open linked targets, execute
    commands, fetch sources, capture media, or write externally.
  - `WorkbenchPanel` now has evidence search, kind filter, project filter, and
    reset controls.
  - The Add Evidence form now supports route agent, permission class, viewport,
    coordinates, annotation text, and sensitive flag.
  - Recent evidence rows are selectable and open a detail inspector showing
    owner, route agent, links, target, viewport, coordinates, annotation, and
    gates.
- Added test coverage for `workbench.evidenceDetail` and coordinate/annotation
  metadata.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts` passed with 14
    tests.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, media capture, desktop overlay process,
  external repo, git, cleanup, command execution, file write outside the repo
  handoff/Obsidian closeout path, or destructive action was performed.
- Continued the same Session 4 chat with a Project Lab local inspector slice.
  `projectIntelligence.detail` now returns read-only per-project local queue
  rows for pending approvals, Terminal observations, Hedwig captures, reminder
  proposals, message draft proposals, source events, and explicit gates. It
  does not mutate approvals, execute commands, fetch/browse/search, write to
  Notion/Slack, or touch external repos.
- Project Lab cards now include an `Inspect` control that opens an inline Local
  Inspector drawer. The drawer shows bounded local rows for Pending Approvals,
  Terminal Lab, Hedwig, Source Events, and gate text. It is intentionally
  read-only and has no action buttons that approve, run, send, fetch, or write.
- Direct smoke test of `projectIntelligence.detail({ slug: "cerebro" })`
  returned found=true with 7 approvals, 12 Terminal rows, 12 Hedwig captures,
  8 reminders, 8 messages, 12 source events, and 4 gates at closeout time.
- Continued the same Session 4 chat again with Project Lab Local Inspector
  usability polish. The inspector now has queue tabs for Approvals, Terminal,
  Hedwig, Sources, and Gates, plus a read-only detail preview pane for the
  selected row. Selecting rows only changes local UI state; it does not approve,
  execute, fetch, browse/search, send, sync, or write.
- The detail pane exposes local metadata such as approval action/target/reason,
  Terminal command/status/risk/output summary, Hedwig capture/proposal status
  and approval scope, source event trust/sensitivity, and gate text.
- Direct smoke test of `projectIntelligence.detail({ slug: "cerebro" })` after
  the filter/detail polish returned found=true with 9 approvals, 12 Terminal
  rows, 28 combined Hedwig rows, 12 source events, and 4 gates at closeout time.
- Continued the same Session 4 chat with Project Lab project-card view filters.
  The Project Lab header now has local-only filters for All, Attention,
  Approvals, Hedwig, Terminal, and Dirty. These filters only change which known
  project cards are visible in the client; they do not mutate data, approve
  queues, execute commands, browse/search, fetch sources, write externally, or
  touch external repos.
- Direct smoke test of `projectIntelligence.overview` after project-card
  filters returned 5 projects, 4 attention projects, 11 pending approvals, 151
  Hedwig proposals, and 105 Terminal observations at closeout time. These are
  live local SQLite/libSQL records.
- Continued the same Session 4 chat with attention reason badges. When Project
  Lab is in the `Attention` view, each visible project card now shows a `Shown`
  row explaining which local signal brought it into the view: pending
  approvals, Hedwig review needs, blocked/reviewing Terminal observations,
  sensitive source events, or dirty git state. This is explanatory UI only and
  does not mutate queues or trigger actions.
- Continued again with Project Lab filtered-view sorting. Project cards are now
  sorted by the relevant local signal for each view: pending approvals for
  Approvals, Hedwig proposal volume for Hedwig, Terminal observation volume for
  Terminal, dirty file count for Dirty, and a weighted attention score for
  Attention. The header shows the current sort basis. Sorting is client-only UI
  state and performs no queue mutation or external action.
- Continued with Project Lab filtered-view summary polish. The filter header now
  shows how many known projects match the active view and, for filtered views,
  which project is currently top-ranked with its signal score/count. This is
  explanatory UI only and does not affect project data or queue state.
- Continued with Project Lab rank badges. In filtered views, each visible
  project card now shows its rank and current signal score beside the project
  name. This makes the sorted order explain itself locally; it is still
  client-only UI and does not persist ranking or mutate queues.
- Continued with smarter Project Lab inspector defaults. Clicking `Inspect`
  now opens the Local Inspector on the queue that best matches the active
  filter/project signal: Approvals, Terminal, Hedwig, Sources, or Gates. This is
  UI state only; it does not mark rows read, change statuses, approve actions,
  run commands, fetch sources, browse/search, write to Notion/Slack, or edit
  external repos.
- User asked for an Obsidian cleanup check. Read-only audit found three
  root-level clutter files in the configured Obsidian vault:
  `Untitled.canvas` containing `{}`, `Untitled.base` containing only an empty
  table-view stub, and empty `2026-05-06.md`. User approved deletion, and those
  three files were removed. Follow-up scans found no remaining root-level
  files, no `Untitled*` files, and no zero-byte Markdown files.
- Continued with Project Lab Local Inspector readability polish. Detail rows now
  have more vertical room, the selected row title wraps instead of truncating,
  long fields such as approval context span the full detail pane, and the detail
  pane scrolls independently. This is styling/layout only and remains
  read-only.
- Continued with a read-only Git/worktree inspector slice inside Project Lab.
  `projectIntelligence.detail` now returns the same local git status payload
  used by the overview, including branch, upstream/remote, local path, GitHub
  repo name, dirty count, and bounded status rows. This is read-only local
  metadata and does not stage, commit, reset, pull, push, open GitHub, or edit
  external repos.
- Project Lab Local Inspector now has a `Git` tab. The `Dirty` card filter
  opens Inspect directly on that tab, showing a local summary row plus the
  first bounded worktree status rows. Selecting rows only changes local UI
  detail state and performs no git operation or command execution.
- Verification after the Git inspector slice:
  `pnpm check` passed, direct router smoke test for
  `projectIntelligence.detail({ slug: "cerebro" })` returned git dirty=true
  with 94 local status rows at that moment, `pnpm test -- --runInBand` passed
  30 tests on a clean rerun after one transient SQLite lock, and the in-app
  browser verified that the Dirty filter opens the Git tab at
  `http://localhost:3002/`.
- Continued with Project Lab score-breakdown polish. Filtered project cards now
  show a compact `Score` row explaining the local signals behind the current
  rank: pending approvals, Hedwig proposal categories, Terminal blocked/reviewing
  rows, dirty worktree count, or the weighted Attention components. This is
  explanatory UI only; it does not persist priority, change queue state, approve
  anything, execute commands, fetch sources, browse/search, or write externally.
- Verification after score-breakdown polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Attention` view renders visible `Score` text and weighted signal chips.
- Continued with Project Lab signal drill-down polish. The four card signal
  blocks for Pending Approvals, Hedwig Proposals, Terminal Status, and Source
  Events now open the same local Project Lab Inspector directly on the matching
  queue for that project. This is local UI navigation only: it does not approve,
  execute, fetch, browse/search, write to Notion/Slack, mutate queue status, or
  touch external repos.
- Verification after signal drill-down polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  that clicking a Terminal Status signal block opens the Local Inspector on the
  Terminal tab.
- Continued with Project Lab worktree drill-down polish. The Worktree Changes
  preview on dirty project cards now opens the same read-only Local Inspector on
  the `Git` tab for that project. This is local UI navigation only and does not
  stage, commit, reset, pull, push, open GitHub, execute commands, or touch
  external repos.
- Verification after worktree drill-down polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  that clicking Worktree Changes in the Dirty view opens the Git inspector tab
  with local status rows.
- Continued with another Project Lab local drill-down batch. Local Inspector
  list columns now show an explicit `Showing 12 of N local rows` footer when a
  queue has more rows than the visible bounded preview. Recent Approval Queue,
  Source Events, Terminal Observations, and Hedwig Captures rows on project
  cards now also open their matching Local Inspector queue. These are local UI
  navigation affordances only and do not mark rows reviewed, change statuses,
  approve actions, execute commands, fetch sources, browse/search, write to
  Notion/Slack, or touch external repos.
- Verification after the row-cap/recent-row drill-down batch: `pnpm check`
  passed, the first `pnpm test -- --runInBand` hit a transient SQLite lock in an
  existing Hedwig write-heavy test, the clean rerun passed 30 tests, and the
  in-app browser confirmed the capped-row footer plus recent Terminal row
  drill-down into the Terminal inspector queue.
- Continued with Project Lab Local Inspector search. The inspector now has a
  local-only search field for the active queue, filtering row label, text, meta,
  and detail fields in memory. Filtered state is displayed in the queue title
  and count, for example `Git filtered: tony` and `1/11`, plus a match footer.
  Search resets when switching project or queue and does not persist read state,
  mutate queues, approve actions, execute commands, fetch sources, browse/search,
  write to Notion/Slack, or touch external repos.
- Verification after inspector search: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  a Git queue search for `tony` filters to one local worktree row with the
  filtered title, `1/11` count, and match footer.
- Continued with Project Lab Local Inspector type filters. The active queue now
  shows local label/type chips when there is more than one row kind, such as
  Git `M`/`dirty` rows or Hedwig proposal kinds. Type filters combine with text
  search, update the filtered title/count, and can be cleared with a single
  `Reset` control. This remains local UI state only and does not persist read
  state, mutate queues, approve actions, execute commands, fetch sources,
  browse/search, write to Notion/Slack, or touch external repos.
- Verification after inspector type filters: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests on clean rerun after a transient
  SQLite lock, and the in-app browser confirmed Git type chip filtering,
  filtered counts, match footer, and `Reset` clearing back to all Git rows.
- Continued with Project Lab Local Inspector sort controls. The active queue now
  has local-only `Default`, `Type`, and `Text` sort buttons. Sorting combines
  with search and type chips, resets when switching project/queue, and only
  changes client display order. It does not persist state, mutate queue rows,
  approve actions, execute commands, fetch sources, browse/search, write to
  Notion/Slack, or touch external repos.
- Verification after inspector sort controls: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Sort` row and `Text` sort option in the Git inspector.
- Continued with Project Lab Attention Breakdown and Sources filter polish. The
  filter header now shows a local `Signals` strip summarizing the active
  attention drivers across known projects, and `Sources` is now a first-class
  project-card filter. The Sources view sorts by total source event count while
  Attention still weights sensitive source events. This is read-only client UI
  derived from existing overview data and does not fetch sources, browse/search,
  write externally, approve anything, execute commands, or touch external repos.
- Verification after Attention Breakdown/Sources filter polish: `pnpm check`
  passed, `pnpm test -- --runInBand` passed 30 tests, and the in-app browser
  confirmed the `Signals` strip, `Sources` filter, source-event sort label, and
  non-zero Sources score.
- Continued with Project Lab Next Safe Actions strip. The filter header now
  shows the top attention-ranked projects with their deterministic
  `nextSafeAction` text and attention score. Clicking one opens the same
  read-only Local Inspector on the relevant queue for that project. This is
  local UI navigation only and does not start tasks, approve actions, execute
  commands, fetch sources, browse/search, write to Notion/Slack, or touch
  external repos.
- Verification after Next Safe Actions strip: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Next` strip and inspector drill-down.
- Continued with Project Lab summary-count navigation. The top summary counts
  for Dirty, Approvals, Hedwig, Terminal, and Sources now switch the project-card
  view to the matching local filter. This is client-side navigation only and
  does not refetch external data, approve actions, execute commands, fetch
  sources, browse/search, write to Notion/Slack, or touch external repos.
- Verification after summary-count navigation: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  clicking the Terminal summary count switches to the Terminal view.
- Continued with Next Safe Action reason chips. The Project Lab `Next` strip now
  shows compact local attention-reason chips under each top next-safe-action
  project, such as pending approvals, Hedwig review needs, or dirty worktree
  counts. This is explanatory client UI only and does not create tasks, mark
  review state, approve actions, execute commands, fetch sources, browse/search,
  write to Notion/Slack, or touch external repos.
- Verification after Next Safe Action reason chips: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Next` strip shows local reason chips.
- Continued with Project Lab empty-filter state polish. When a local project-card
  filter has no matching projects, the panel now shows a bounded empty state
  with an `All` reset button and current local signal chips instead of a plain
  dead-end message. This is client-side view state only and does not mutate data,
  approve actions, execute commands, fetch sources, browse/search, write to
  Notion/Slack, or touch external repos.
- Verification after empty-filter polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Project Lab still renders the filter surface.
- Continued with Project Lab Missing filter wiring. `Missing` is now a
  first-class project-card filter, the top Missing summary count switches to
  that view, missing-path cards would default to the read-only Git inspector,
  and the current zero-missing state uses the bounded empty-filter panel. This
  is client-side view state only and does not clone, fetch, create repos, mutate
  data, approve actions, execute commands, browse/search, write to Notion/Slack,
  or touch external repos.
- Verification after Missing filter wiring: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Project Lab shows `MISSING 0`, selects the Missing filter, and displays `NO
  MISSING PROJECTS` with the safe reset/signals state.
- Continued with Project Lab summary reset consistency. The top `Local Repos`
  summary count now switches back to the `All` project-card view, matching the
  read-only navigation behavior of Dirty, Missing, Approvals, Hedwig, Terminal,
  and Sources. This is local client navigation only and does not refresh,
  approve, execute, fetch, browse/search, write externally, or touch repos.
- Verification after Local Repos reset wiring: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Missing can show the empty state and `Local Repos` returns to `SHOWING 5 OF 5
  PROJECTS IN REPO ORDER`.
- Continued with Project Lab summary/filter accessibility labels. Summary
  navigation buttons now expose explicit `Show <label> project view` labels,
  project-card filter chips expose `Show <label> projects`, signal chips expose
  `Show <signal> signal projects`, and the active filter chip reports
  `aria-pressed`. This is semantics-only UI polish and does not alter data,
  approval state, execution, fetch/browse/search, external writes, or repos.
- Verification after accessibility-label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the Missing and Local Repos controls are findable by their accessible names
  and the Missing filter reports `aria-pressed="true"` after selection.
- Continued with passive summary and empty-state accessibility labels. Passive
  summary cells such as Mode and Scanned now expose labeled `status` semantics
  and an "Informational only" title, while empty-filter reset/signal controls
  now have explicit accessible names. This is semantics-only UI polish and does
  not alter data, approval state, execution, fetch/browse/search, external
  writes, or repos.
- Verification after passive-summary/empty-state label polish: `pnpm check`
  passed, `pnpm test -- --runInBand` passed 30 tests, and the in-app browser
  confirmed Mode/Scanned status labels, the empty-state `Show all projects`
  reset, and signal-chip accessible names.
- Continued with Project Lab Local Inspector accessibility labels. Inspector
  queue tabs, Hide, Reset, type chips, sort chips, and row-selection buttons now
  expose explicit accessible names, and selectable inspector controls report
  active state with `aria-pressed`. This is semantics-only UI polish and does
  not alter queue data, approval state, execution, fetch/browse/search,
  external writes, or repos.
- Verification after Local Inspector accessibility-label polish: `pnpm check`
  passed, `pnpm test -- --runInBand` passed 30 tests, and the in-app browser
  confirmed the Git queue tab, Text sort control, Hide control, row inspection
  labels, and sort `aria-pressed` state.
- Continued with Project Lab card drill-down accessibility labels. Next Safe
  Action cards, project `Inspect` buttons, signal blocks, recent Terminal rows,
  Hedwig capture rows, approval/source recent rows, and Worktree Changes now
  expose explicit inspect labels. This is semantics-only UI polish and does not
  add actions, approval state, execution, fetch/browse/search, external writes,
  or repo operations.
- Verification after card drill-down label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  accessible labels for Next, project Inspect, signal-block, Worktree Changes,
  and recent-row drill-down controls.
- Continued with Project Lab empty-state reset label cleanup. The empty-filter
  reset button now exposes `Reset to all projects`, distinct from the normal
  `Show All projects` filter chip. This is semantics-only UI polish and does
  not alter data, approval state, execution, fetch/browse/search, external
  writes, or repo operations.
- Verification after empty-state reset label cleanup: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  one `Reset to all projects` empty-state control plus one `Show All projects`
  filter chip.
- Continued with Project Lab close/search accessibility labels. The panel close
  button now exposes `Close Project Lab`, and the Local Inspector search box
  exposes `Search <queue> inspector rows`. This is semantics-only UI polish and
  does not alter data, approval state, execution, fetch/browse/search, external
  writes, or repo operations.
- Verification after close/search label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Close Project Lab` button and inspector searchbox label are discoverable.
- Continued with Project Lab close-button HTML hygiene. The top `Close Project
  Lab` button now explicitly sets `type="button"` so it cannot accidentally act
  as a submit button if the panel is ever nested inside a form-like surface.
  This is semantics-only UI polish and does not alter data, approval state,
  execution, fetch/browse/search, external writes, or repo operations.
- Verification after close-button type hygiene: `pnpm check` passed and
  `pnpm test -- --runInBand` passed 30 tests.
- Continued with Project Lab region accessibility labels. The Project Lab panel,
  project cards, Local Inspector, inspector row list, and inspector detail pane
  now expose region/card labels for assistive navigation. This is semantics-only
  UI polish and does not alter data, approval state, execution,
  fetch/browse/search, external writes, or repo operations.
- Verification after region-label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the Project Lab region, project-card labels, Local Inspector region,
  inspector-row region, and inspector-detail region.
- Continued with Project Lab status live-region semantics. The project filter
  summary and Local Inspector row-count text now use polite status semantics so
  local view/count changes can be announced without changing behavior. This is
  semantics-only UI polish and does not alter data, approval state, execution,
  fetch/browse/search, external writes, or repo operations.
- Verification after status live-region polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  two `role="status"` + `aria-live="polite"` elements after opening a Local
  Inspector.
- Continued with Project Lab non-interactive list semantics. Current task rows
  and worktree change rows now expose list/listitem semantics with project-
  specific list labels. This is semantics-only UI polish and does not alter
  data, approval state, execution, fetch/browse/search, external writes, or repo
  operations.
- Verification after list-semantics polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  current-task lists, worktree-change lists, and list items are exposed.
- Continued with Project Lab busy-state semantics. Project Lab and Local
  Inspector regions now expose `aria-busy` based on their local query loading
  state. This is semantics-only UI polish and does not alter data, approval
  state, execution, fetch/browse/search, external writes, or repo operations.
- Verification after busy-state polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Project Lab and Local Inspector expose `aria-busy="false"` once loaded.
- Continued with Keep left-rail navigation accessibility labels. The canonical
  nav buttons now expose `Open <section>` labels in collapsed icon mode, set
  `aria-current="page"` for the active section, and explicitly use
  `type="button"`. This is navigation semantics only and does not alter panel
  data, approval state, execution, fetch/browse/search, external writes, or repo
  operations.
- Verification after left-rail nav label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  `Open Project Lab` is discoverable, becomes `aria-current="page"`, and opens
  the Project Lab region.
- Continued with a bundled Keep shell accessibility/HTML hygiene pass. The top
  status/control bar, Demo/Live mode buttons, Skills/Clear/Log/Context controls,
  Activity Log close button, floor selector, command mode buttons, command input,
  disabled Attach, Preview submit, intake-preview Create Task/Dismiss controls,
  context session selectors, and shell landmarks now expose explicit labels,
  button types, pressed/expanded/current state, and region/group semantics where
  appropriate. This is local UI semantics only and does not alter panel data,
  approval state, execution, fetch/browse/search, external writes, or repo
  operations.
- Verification after bundled Keep shell polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the connection status, Demo/Live/Skills/Log/Context controls, Keep sections
  nav, Keep workspace, command bar/mode/input/Attach/Preview controls, floor
  selector, context panel expanded state, Project Lab nav active state, and
  Project Lab region are discoverable by accessible names/states.
- Continued from the latest Session 4 local-only Keep work with a narrow
  Project Lab Draft Actions feedback slice. Creating a local Project Lab action
  draft now invalidates the overview immediately, so Draft counts and card
  signals refresh without waiting for the 10-second poll. The Draft Actions card
  also exposes a polite local status line that says when a local draft is being
  created and confirms the created draft id while explicitly stating that no
  task was created and no repo was edited. This is local UI feedback only and
  does not approve actions, execute commands, browse/search, fetch sources,
  write to Notion/Slack, capture media, start a desktop overlay process, move or
  delete files, or touch external repos.
- Verification after Draft Actions feedback: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 33 tests, and `pnpm build` passed. Vite
  still warns about unset analytics env placeholders and large JS chunks; those
  warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/ProjectLabPanel.tsx`
  - `CEREBRO_SESSION_HANDOFF.md`
- Continued again with a bundled Project Lab Draft Actions feedback-scoping
  pass. Draft creation status is now scoped to the project card that created
  the draft, names the specific local draft action while pending, and no longer
  shows stale created-draft success text on unrelated project cards. Appended
  draft-note feedback is also scoped to the exact draft row that received the
  note, so switching rows no longer implies a note was saved elsewhere. The
  overview still refreshes immediately after draft creation and draft-note
  append. This is local UI feedback only and does not create tasks, approve
  actions, execute commands, browse/search, fetch sources, write to
  Notion/Slack, capture media, start a desktop overlay process, move or delete
  files, or touch external repos.
- Verification after Draft Actions feedback scoping: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 33 tests, and `pnpm build` passed. Vite
  still warns about unset analytics env placeholders and large JS chunks; those
  warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/ProjectLabPanel.tsx`
  - `CEREBRO_SESSION_HANDOFF.md`
- Continued with a Project Lab draft-history correctness slice. Local Project
  Lab action drafts are now counted and shown by `project_slug` even before a
  profile has a linked harness `projects` row. This keeps proposal-only draft
  plans and append-only draft notes visible for profiles such as Waymark or
  Sygnalist before intake-created tasks link them to a project row. This is
  local SQLite/libSQL history only and does not create tasks, approve actions,
  execute commands, browse/search, fetch sources, write to Notion/Slack, capture
  media, start a desktop overlay process, move or delete files, or touch
  external repos.
- Verification after unlinked draft-history visibility: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 16 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/projectIntelligence.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- Continued with a local-only Model Tools visibility slice. The existing
  proposal-only `modelTools` router is now visible from the Keep left rail as
  `Model Tools`.
- `app/client/src/components/ModelToolsPanel.tsx` reads the local model/tool
  policy, lists local capability proposals, filters by provider/capability/eval
  status, shows selected proposal detail, records new local capability
  proposals, records append-only local eval notes, and previews route lanes for
  task kind/modality/privacy/frontier need.
- The panel repeats the safety boundary in UI feedback: local records only. It
  does not call models/tools, install gateways, browse/search/fetch, create
  accounts, touch tokens, start provider setup, download models, or mark
  untested capabilities as defaults.
- `app/client/src/pages/Home.tsx` now adds the `Model Tools` nav item and
  panel route.
- Verification after Model Tools panel slice: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 17 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/ModelToolsPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, command execution, or destructive action was performed.
- Continued with the first global permission-mode substrate slice:
  - `app/server/routers/permissions.ts` now exposes local-only permission
    policy, current mode, history, and mode-change recording.
  - `app/server/cerebroDb.ts` now creates append-only
    `permission_mode_events` records.
  - `app/client/src/components/PermissionModeControl.tsx` adds a Keep header
    mode selector for `Default permissions`, `Auto-review`, and `Full access`.
  - `app/client/src/pages/Home.tsx` renders the global mode selector in the
    primary shell header.
  - Mode changes record local policy state only. They do not approve hard
    gates, execute commands, open browser/media, call external models/tools,
    write to Notion/Slack, install anything, touch tokens/accounts, move/delete
    files, or edit external repos.
- Permission policy now names the hard gates that survive every mode:
  payments, account permission grants, destructive commands,
  deleting/overwriting files, sending messages/emails, publishing, uploading
  private media externally, saving sensitive screenshots to memory, installs,
  tokens/API keys, and sealed Raven/NSFW scope.
- Verification after permission-mode substrate: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/permissions.ts`
  - `app/server/routers.ts`
  - `app/client/src/components/PermissionModeControl.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a permission preflight substrate slice:
  - `permissions.preflight` now returns an advisory local decision for a
    proposed perception/action pair under the current global permission mode.
  - It accepts perception class, action class, sensitive-data flag,
    external-target flag, destructive flag, and sensitive-memory persistence
    flag.
  - It returns `allowed_local`, `proposal_only`, `approval_required`, or
    `blocked_by_hard_gate`, plus required approval labels, reasons,
    current-mode effect, hard gates, and a no-action-taken list.
  - This gives Workbench, Approval Queue, Terminal Lab, Hedwig, Model Tools,
    and future media/browser surfaces one shared local policy answer before any
    real action is wired.
- The preflight path is advisory only. It does not approve actions, execute
  commands, open browser/media, call external providers, write to Notion/Slack,
  install anything, touch tokens/accounts, move/delete files, or edit external
  repos.
- Verification after permission preflight substrate: first `pnpm check` caught
  a narrow TypeScript inference issue in `permissions.ts`; fixed locally.
  Rerun `pnpm check` passed. `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests. `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/permissions.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with an append-only permission preflight record slice:
  - `app/server/cerebroDb.ts` now creates local
    `permission_preflight_records` with mode, perception/action class,
    decision, approval-required flag, approval labels, reasons, mode effect,
    sensitive/external/destructive/persistent-memory flags, requesting agent,
    target summary, and created time.
  - `permissions.recordPreflight` appends one local audit record for a proposed
    perception/action pair using the same shared preflight decision logic.
  - `permissions.preflightRecords` reads recent local preflight history with
    decision, perception-class, action-class, and limit filters.
  - `permissions.preflight` remains transient advisory. Surfaces can choose
    when they need an audit record by calling `recordPreflight`.
  - This strengthens the shared permission substrate for Workbench, Terminal
    Lab, Hedwig, Model Tools, Approval Queue, and future browser/media/external
    model surfaces before any real gated action is wired.
- The preflight record path is local audit history only. It does not approve
  actions, execute commands, open browser/media, call external providers, write
  to Notion/Slack, install anything, touch tokens/accounts, move/delete files,
  edit external repos, or run cleanup.
- Verification after append-only preflight records: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/permissions.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with an Approval Queue permission-preflight visibility slice:
  - `app/server/routers/approvals.ts` now exposes
    `approvals.permissionPreflights`, a read-only view over local
    `permission_preflight_records`.
  - The route supports decision, perception-class, action-class, query, and
    limit filters, and returns summary counts for approval-required, blocked,
    and sensitive preflight records.
  - `ApprovalDashboardPanel` now shows a compact Permission Preflights section
    above the approval-preview list. It displays recent local audit records,
    decision badges, perception/action class, sensitivity, and target or gate
    summary.
  - This connects permission evidence to the existing approval-review surface
    before any browser, media, command, external model, cleanup, Slack, Notion,
    or provider action is wired.
- The Approval Queue preflight section is read-only policy evidence. It does
  not approve, reject, execute, fetch, browse/search, capture media, call
  providers, write externally, schedule, send, move/delete files, or mutate the
  source preflight records.
- Verification after Approval Queue preflight visibility: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/approvals.ts`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Workbench evidence permission-link slice:
  - `app/server/cerebroDb.ts` now adds
    `workbench_evidence_records.permission_preflight_id`, with an idempotent
    migration for existing local DBs.
  - `workbench.createEvidence` now appends one local permission preflight audit
    record before inserting the evidence row, then stores that preflight id on
    the evidence record.
  - The preflight is derived from the evidence permission class and sensitive
    flag. Manual local notes are allowed when non-sensitive; sensitive,
    public-browser, and broader media classes record the appropriate gate
    reasons for later review.
  - `workbench.evidenceDetail` now returns the linked permission preflight
    decision, mode, required approvals, and reasons with the evidence detail.
  - `workbench.createValidationNote` preserves the original evidence
    preflight id on appended validation-note records.
- This is local metadata history only. It does not approve actions, execute
  commands, open browser/media, capture screenshots, call external providers,
  write to Notion/Slack, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after Workbench evidence preflight links: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/workbench.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a shared permission-policy helper slice:
  - Added `app/server/permissionPolicy.ts` as the single local permission
    matrix for modes, perception classes, action classes, hard gates, preflight
    decisions, mode labels/summaries, current-mode reads, and append-only
    preflight record writes.
  - `permissions.preflight` and `permissions.recordPreflight` now use the
    shared helper instead of keeping decision logic inside the router.
  - `workbench.createEvidence` now records its linked permission preflight
    through the same helper, with Workbench-specific context appended as local
    evidence reasons instead of a separate policy copy.
  - This keeps Workbench evidence, Approval Queue visibility, and future
    Terminal/Hedwig/media/browser preflights on one local substrate before any
    gated action is wired.
- This is local policy refactoring only. It does not approve actions, execute
  commands, open browser/media, capture screenshots, call external providers,
  write to Notion/Slack, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after shared permission-policy helper:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/permissionPolicy.ts`
  - `app/server/routers/permissions.ts`
  - `app/server/routers/workbench.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Terminal Lab approval-preflight link slice:
  - `app/server/cerebroDb.ts` now adds
    `approvals.permission_preflight_id`, with an idempotent migration for
    existing local DBs.
  - `terminalLab.createApprovalPreviewFromObservation` now records one local
    command-execution permission preflight through the shared
    `permissionPolicy` helper before staging the pending local approval preview.
  - Terminal approval previews now return the linked preflight id, and the
    read-only Approval Queue carries that id through `approvals.list` and
    `approvals.groups` result rows.
  - The preflight is derived from Terminal observation risk:
    `terminal_logs` perception, `command_execution` action, destructive flag
    for destructive commands, and external-target flag for mutating or external
    command classes.
  - This links command approval metadata to the same local preflight substrate
    already used by Workbench evidence.
- This is local metadata history only. It does not approve actions, execute
  commands, open browser/media, capture screenshots, call external providers,
  write to Notion/Slack, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after Terminal approval preflight links:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/terminalLab.ts`
  - `app/server/routers/approvals.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Hedwig approval-preflight link slice:
  - `hedwig.createApprovalPreviewFromProposal` now records one local permission
    preflight through the shared `permissionPolicy` helper before staging a
    pending local approval preview.
  - Hedwig approval previews now return the linked preflight id, and Hedwig's
    read-only approval preview list carries that id.
  - The existing read-only Approval Queue already carries
    `approval.permission_preflight_id`, so Hedwig approval rows now appear with
    the same linked policy evidence as Terminal Lab approval previews.
  - Source-enrichment previews use `public_browser` perception plus
    `browser_or_media_capture` action with an external-target flag. Slack read
    previews use explicit context plus local-note action with an external-target
    flag. Notion writes, reminder scheduling, and message sends use
    `external_write`.
  - This links Hedwig source/reminder/message approval metadata to the same
    local preflight substrate already used by Workbench evidence and Terminal
    Lab approval previews.
- This is local metadata history only. It does not approve actions, read Slack,
  write to Notion/Slack, browse/search/fetch, schedule reminders, send
  messages, execute commands, open browser/media, capture screenshots, call
  external providers, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after Hedwig approval preflight links:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/hedwig.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a read-only Approval Queue linked-preflight detail slice:
  - `approvals.list` now joins each local approval preview to its linked
    `permission_preflight_records` row when one exists.
  - Approval Queue rows now carry preflight decision, mode, perception/action
    class, required approvals, reasons, and mode effect in the selected-preview
    payload.
  - `ApprovalDashboardPanel` now shows a preflight chip on linked approval
    cards and a selected-preview `Permission Preflight` section with the
    linked decision, permission class pair, required approvals, reasons, and
    mode effect.
  - This makes the policy evidence visible at the exact approval row instead
    of only in the separate recent preflight audit list.
- This is read-only local UI and router detail. It does not approve, reject,
  execute commands, browse/search/fetch, read Slack, write to Notion/Slack,
  schedule reminders, send messages, open browser/media, capture screenshots,
  call external providers, install anything, touch tokens/accounts,
  move/delete files, edit external repos, or run cleanup.
- Verification after Approval Queue linked-preflight detail:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/approvals.ts`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Workbench validation-preflight continuity slice:
  - `workbench.createValidationNote` now records a new local permission
    preflight audit row for each appended validation note instead of reusing
    the parent evidence preflight id.
  - Validation-note preflights use the shared `permissionPolicy` helper with
    Workbench-media perception, local-note action, validator-agent ownership,
    sensitive flag carry-through, and local append-only evidence reasons.
  - `WorkbenchPanel` now shows the linked `Permission Preflight` section in the
    evidence detail inspector, including preflight id, mode, decision, required
    approvals, and reasons.
  - Appended validation history rows now display their own linked preflight id
    when one exists.
  - This makes Workbench evidence and Workbench validation notes both carry
    visible local policy evidence at the point of inspection.
- This is local metadata/UI continuity only. It does not approve actions,
  validate external claims, execute commands, browse/search/fetch, read Slack,
  write to Notion/Slack, schedule reminders, send messages, open browser/media,
  capture screenshots, call external providers, install anything, touch
  tokens/accounts, move/delete files, edit external repos, or run cleanup.
- Verification after Workbench validation-preflight continuity:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a stabilization and checkpoint pass after the user asked
  whether the large dirty worktree meant CereBro was in danger:
  - Read-only inventory found the repo on `main...origin/main` ahead by 8
    commits with many uncommitted modified/untracked files from prior CereBro
    build sessions.
  - Disk audit showed the repo at 882M, with `app/node_modules` accounting for
    751M. The tracked app/public sprite assets were not the storage problem.
  - A local untracked `.codex/` config folder was visible to Git and contained
    local connector configuration. `.gitignore` now ignores `.codex/` so local
    Codex config cannot be staged accidentally. The folder was not moved,
    deleted, or committed.
  - Staged secret scan after `.codex/` ignore found no staged bearer tokens,
    private keys, GitHub tokens, Slack tokens, or OpenAI-style API keys.
  - Created local checkpoint branch
    `codex/cerebro-stabilization-checkpoint` from the current working state.
  - Committed the current safe repo state as
    `f24c9b1 Checkpoint CereBro stabilization state`.
  - The checkpoint commit captured the intentional CereBro app/docs/assets
    state so future build waves have a recoverable baseline instead of a large
    uncommitted pile.
- Verification before the checkpoint:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
  `git diff --cached --check` flagged whitespace in third-party CC0 asset pack
  metadata files. Those vendor files were left unnormalized to preserve source
  pack provenance.
- Files changed in this slice:
  - `.gitignore`
  - `CEREBRO_SESSION_HANDOFF.md`
- Git actions in this slice:
  - Created branch `codex/cerebro-stabilization-checkpoint`.
  - Created commit `f24c9b1 Checkpoint CereBro stabilization state`.
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, push, pull, cleanup,
  UI command execution, file move/delete, or destructive action was performed.
- Continued from the clean checkpoint branch with a temporary image-intake
  Workbench slice:
  - `WorkbenchPanel` now exposes `image_review` evidence and `media_review`
    permission class in the Add Evidence and evidence-filter controls.
  - The panel has a `Temporary Image` intake area with drag/drop and file picker
    for local images.
  - Selected images are previewed with a browser-memory object URL only. The
    preview shows filename, MIME type, byte size, and temporary status.
  - Choosing an image fills an image-review evidence draft with a
    `temporary-image:<filename>` target and metadata summary.
  - Saving still creates only a local append-only evidence metadata row. It
    does not save image bytes, write to the vault, upload externally, call a
    vision model, browse, fetch, capture screenshots, or open a media tool.
  - `workbench.plan` now marks image/video review as `partially_live` and
    records temporary image metadata fields.
  - Foundation tests now cover the temporary image-review evidence path and
    media-review permission class.
- Verification after temporary image-intake slice:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/routers/workbench.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, durable media save, media
  capture, desktop overlay process, external model/tool call, vision call,
  gateway install, provider SDK/API key/account setup, model download,
  external repo edit, push, pull, cleanup, UI command execution, file
  move/delete, or destructive action was performed.
- Continued in the same Workbench image lane with structured temporary media
  metadata:
  - `workbench_evidence_records` now has idempotent local DB columns for
    `media_name`, `media_mime_type`, `media_byte_size`, and
    `media_temporary_flag`.
  - `workbench.createEvidence`, `workbench.evidence`,
    `workbench.evidenceGroups`, and `workbench.evidenceDetail` now carry these
    media metadata fields.
  - Workbench evidence search now also matches media name and MIME type.
  - Temporary image intake now sends structured metadata when creating an
    `image_review` evidence row.
  - The recent evidence list marks rows with media metadata and temporary-media
    status.
  - The evidence detail inspector now shows media name, media type, media size,
    and whether the record represents temporary browser preview only.
  - Foundation tests now cover persisted temporary image metadata on
    `image_review` evidence rows.
- This is local metadata only. It does not save image bytes, write to the
  vault, upload externally, call a vision model, run OCR, browse/search/fetch,
  capture screenshots, open a media tool, or approve any future durable-save
  action.
- Verification after structured temporary media metadata:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, durable media save, media
  capture, desktop overlay process, external model/tool call, vision/OCR call,
  gateway install, provider SDK/API key/account setup, model download,
  external repo edit, push, pull, cleanup, UI command execution, file
  move/delete, or destructive action was performed.

### Model Router Snapshot

- `app/server/agentRouter.ts` already routes agents by model class rather than hardcoded provider model names.
- `app/server/cerebroDb.ts` already defines `model_registry`, including model class, provider, location, estimated RAM/disk, privacy/cost notes, hardware notes, and tested-on-device status.
- `CEREBRO_MASTER_BUILD_PLAN.md` now treats model/tool routing as a major
  product capability. CereBro should learn which local models, hosted frontier
  models, free-tier hosted models, and specialty AI tools work for each job.
- `CEREBRO_MODEL_ROUTER_BASELINE.md` now defines the target fields for an
  expanded Model/Tool Capability Registry: provider, model/tool, access method,
  account/API key needs, free tier, rate limits, cost, modality support,
  strengths, weak spots, prompt style, privacy class, eval scores, failure
  notes, fallback suggestions, and source URLs.
- The planned Reasoning Gateway should expose `routeForTask`,
  `recordModelCall`, and `recordModelEval` style behavior. The first
  implementation may be CereBro-native, LiteLLM-backed, OpenRouter-backed, or a
  staged hybrid after dependency/security review.
- Surfer owns current model/tool discovery with sources. Cortana owns routing
  proposals. Batman owns risk review. Spock/Oak own validation. Piccolo owns
  stale registry, cost, rate-limit, and storage hygiene.
- Reddit is now a named V1 source lane in the master plan:
  - Surfer owns Reddit watchlists, search/post/comment capture, trend radar,
    media references, links, and community disagreement tracking.
  - Hedwig owns quick "save this Reddit item" capture from Slack/Notion/browser
    share/manual paste into the Source Library review queue.
  - Oak/Spock validate important Reddit-derived claims before durable memory or
    action.
  - Piccolo keeps Reddit media link-first by default, with approved local copies
    routed to the vault and source URLs/rights notes retained.
  - Boundaries are explicit: no block bypass, proxy scraping, deleted/private
    content harvesting, automatic reposting, or model training/fine-tuning on
    Reddit content.
- First local scaffold is now implemented: `model_tool_capabilities`,
  `model_tool_evals`, and `model_tool_call_logs` tables plus
  `modelTools.policy`, `modelTools.capabilities`, `modelTools.proposeCapability`,
  `modelTools.recordEval`, `modelTools.evals`, and `modelTools.routePreview`.
  These routes are local/proposal-only and do not call or verify external
  providers.
- Proposed local classes for initial testing:
  - `embedding`: `all-minilm:22m`
  - `lightweight_formatter`: `qwen3:0.6b`, `gemma3:1b`
  - `local_summary`: `gemma3:1b`, `llama3.2:1b`
  - `local_reasoner` / `local_code_helper` trial: `qwen3:1.7b`, optional `llama3.2:3b` stretch
- None of these candidates are marked tested.

## Storage And Safety Rules

- Generated assets and deliverables should default to a Google Drive synced CereBro vault once `CEREBRO_VAULT_DIR` is configured.
- Turso/libSQL cloud should become the canonical structured brain once configured.
- Local SQLite stores structured metadata as a development cache and fallback.
- Cloud vector retrieval should become the canonical RAG index once selected.
- Obsidian stores durable Markdown knowledge. It can feed retrieval, but it is not the vector database or the model brain.
- Notion stores polished learning/client outputs after approval.
- Local storage is for active work, cache, dev fallback, and explicitly approved local model experiments.
- Repo folders should not become the default destination for generated images, videos, renders, or client deliverables.
- Cleanliness is a first-class requirement, not a later cosmetic pass. Every workspace, message, image, video, code artifact, source, note, and temp file needs an owner, destination, metadata trail, retention rule, and cleanup path.
- The detailed design for that requirement lives in `CEREBRO_FILE_LIFECYCLE_PLAN.md`.
- Obsidian does not increase Mac storage or local model capacity. It is the durable Markdown knowledge layer. Storage safety comes from routing files into the vault, tracking metadata, and letting Piccolo enforce cleanup workflows.
- Piccolo's default authority is scan/report/dedupe/archive proposal/temp cleanup proposal/storage pressure warning. Destructive deletion remains approval-gated.
- Hedwig owns message/reminder hygiene once implemented: drafts, sent items, follow-ups, archived communications, and future Slack/email bridge records should stay attached to the right project/client/context.
- No destructive cleanup without explicit user approval.
- Piccolo may only identify cleanup candidates until cleanup rules are implemented and approved.

## Every-Session Closeout Protocol

At the end of every session, update this file with:

- What changed.
- Files touched.
- Tests/checks run.
- Known bugs or risks.
- Storage impact.
- Next recommended session.
- Next-session starter prompt.
- Then save a unique timestamped Obsidian snapshot to:
  `90_Archive/CereBro Session History/snapshots/<YYYY-MM-DD HHMM CereBro Session Handoff - short-slice-name>.md`.
- Never overwrite a prior handoff snapshot.
- Then append a new link to the Obsidian index:
  `90_Archive/CereBro Session History/CereBro Session History.md`.
- Never replace a prior index entry.

This append-only Obsidian session history is now user-approved standing
behavior for every CereBro build session.

Also run:

- `git status --short`
- relevant tests/checks for touched code
- storage impact check if assets/dependencies changed

## Cleanup Candidates

No cleanup is approved yet.

Candidates to review later:

- `app/node_modules` is large but expected and should not be deleted unless reinstalling dependencies is acceptable.
- Staged CC0 sprite packs may grow over time; review before adding more.
- Generated render/media/model directories should live outside the repo once the Drive vault is configured.
- Temp files and preview renders need Piccolo cleanup rules before automated cleanup.

## What Was Done This Session

- Created `CEREBRO_MASTER_BUILD_PLAN.md`.
- Created this handoff file.
- Captured repo/storage/hardware/model audit facts.
- Locked Session 1 closeout protocol.
- Updated `AGENTS.md` to point future agents at the master plan and handoff, and to record Hedwig as the eleventh scoped Messenger/Comms agent in the Crypts with Piccolo.
- Continued Session 2 by confirming the current Mac/Ollama baseline.
- Verified Ollama macOS install options from official/current sources.
- Created a safe local model shortlist for M2/8GB without installing or downloading anything.
- Recorded that all proposed models remain untested until user approval.
- Integrated the user's cleanliness requirement into the existing master plan rather than starting a new plan: Session 3 file lifecycle, Session 7 output hygiene, Session 8 Piccolo/Hedwig operations, and Session 10 creative asset lifecycle now explicitly cover workspace/file/message cleanup.
- Created `CEREBRO_FILE_LIFECYCLE_PLAN.md` as the Session 3 source for the cleanliness system.
- Created `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` as the corrected Session 4 source for personal command center and project intelligence.
- Added idempotent `artifacts` and `cleanup_candidates` tables.
- Updated approved output vault writes to create artifact metadata rows.
- Added canonical vault layout helpers and Obsidian status detection.
- Added a read-only Piccolo hygiene report router.
- Registered Piccolo in the app router.
- Added tests for the canonical vault layout and honest unconfigured Obsidian status.
- Confirmed existing Google Drive Desktop mount and existing `CereBro-Vault` path.
- Created the approved canonical vault folder tree inside Google Drive, including `07_Knowledge/obsidian-vault`.
- Added `CEREBRO_OBSIDIAN_DIR` to local env and documented it in `app/.env.example`.
- Left existing legacy vault `outputs`, `sources`, and `memory` folders in place.
- Verified that the user opened the configured folder as an Obsidian vault.
- Added artifact metadata recording for Notion inbox imports (`source_note`) and Notion outbox publishes (`notion_page`).
- Added artifact metadata recording for approved memory writes (`memory_note`).
- Added approved Obsidian Markdown note writer (`memory.writeToObsidian`) with artifact metadata (`obsidian_note`).
- Added test coverage for Obsidian note writing using a temporary local test folder.
- Added general approved `artifacts` router for metadata-only external records and vault text writes.
- Added vault text writer preserving canonical folder names.
- Added test coverage for vault text artifact writes using a temporary local test folder.
- Added `ArtifactsPanel` and `PiccoloPanel` to the Keep UI.
- Wired Outputs nav to the live Artifact Library and Automation nav to Piccolo Hygiene.
- Fixed narrow in-app browser layout clipping: left rail collapses to icons, header status text hides on narrow widths, Artifact Library filters wrap, artifact rows stack, and disabled command-bar buttons hide when space is tight.
- Added first approved user-facing artifact write control in Artifact Library.
- Created the first tracked Obsidian note, `indexes/cerebro-home.md`, through the approved `memory.writeToObsidian` path.
- Changed the artifact body field to a textarea after the first single-line input flattened Markdown; re-saved the note with clean Markdown.
- Added artifact supersession: new artifact writes now mark older active/review/published rows with the same storage provider/path as `superseded`.
- Piccolo Hygiene now reports repeated artifact storage paths as informational audit history.
- Re-saved `indexes/cerebro-home.md` once more to verify supersession; current row is `published`, older rows are `superseded`.
- Started the dev server for preview; port 3000 was busy, so the app is running on `http://localhost:3003/`.
- Chose to finish remaining Session 3 polish before moving to Session 4 because the freelance workspace will need these save/report surfaces immediately.
- Updated Artifact Library write controls with clearer per-kind labels, default owner agents, optional source/context URI, Obsidian subfolder input, and save feedback.
- Added Piccolo Hygiene `Save Report` control that writes the current read-only scan as a tracked `cleanup_report` vault artifact. The saved report states that no files were moved, archived, or deleted.
- Confirmed the preview server is still listening on `http://localhost:3003/`.
- Re-read plan files after user clarified that CereBro should support everyday life, personal projects, portfolio, freelance, learning, creative work, and messages.
- Confirmed the older architecture already defines CereBro as a personal AI operating system / command center with project spaces, memory, tools, validation, learning, creative workflows, and cleanup.
- Identified the mismatch: the latest master plan had narrowed Session 4 to "Freelance Builder Workspace."
- Updated `CEREBRO_MASTER_BUILD_PLAN.md` so Session 4 is now "Personal Command Center And Project Intelligence."
- Added `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` with access model, intake taxonomy, project modes, initial project profiles, agent logic changes, and Session 4 target.
- Added the read-only `projectIntelligence` tRPC router.
- Wired the router into the app router.
- Added the Project Lab panel to the Keep UI.
- Replaced the `Project Spaces` nav stub with live `Project Lab`.
- Verified the implementation with TypeScript and Vitest.
- Added Batman to `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` agent logic.
- Updated Project Lab project profiles so Batman appears as strategic support
  across Declyne, Waymark, Sygnalist, Bridgefour, and CereBro.
- Tightened Batman's app router role around strategic review, risk sequencing,
  market/readiness calls, and build-vs-package-vs-ship decisions.
- Added the proposal-only `commandIntake` tRPC router.
- Wired command intake into the bottom command bar as a route preview.
- The command intake preview now shows category, project, mode, suggested
  agents, and the first permission gate.
- Added the personal OS/self-improvement loop and modular panel model to
  `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- Expanded Surfer's planned role around daily web questions, source/browser
  panels, extraction/scrubbing, previews, and self/system improvement.
- Updated command intake to classify `self_improvement` and
  `system_improvement`, and to route current-web questions such as "best",
  "latest", "right now", "google", "reddit", and "youtube" toward Surfer.
- Updated the Project Lab intake taxonomy display with the new categories.
- Added the proposal-only `surfer` tRPC router.
- Added `SurferSourcesPanel` and wired Sources nav to it.
- Sources nav is no longer a stub; it is the first modular Surfer workspace.
- Added approved public URL ingestion to the Surfer router and panel.
- Added approved intake-preview-to-task creation in the command bar flow.
- Added project name/path metadata to command intake task drafts.
- Updated the tasks router so task creation can create/find a project by local
  path and attach `project_id`.
- Tasks router now joins project metadata for task lists and mutation returns.
- Tasks panel now shows the linked project name, with the project path in the
  tooltip.
- Added task rollups to `projectIntelligence.overview`.
- Project Lab cards now display linked project row, active/open task counts, and
  recent task titles.
- Added `tasks.projects` query for task-backed project filter metadata.
- Added project filter chips to `TasksPanel`.
- Added first-pass Surfer source metadata persistence: source type, trust level,
  freshness, content type, word count, scrub notes, trust notes, and sensitive
  data flag.
- Added deterministic approved-URL scrubbing/trust classification in Surfer
  ingestion and surfaced the metadata in the Surfer Sources panel.
- Updated build-route docs to lock the agreed Slack/Notion/Obsidian capture
  architecture and modular Terminal Lab placement.
- Updated `AGENTS.md` so future sessions see Slack as required V1 intake,
  Notion as capture database, Obsidian as durable knowledge/session history,
  and Terminal Lab as a learning/validation surface.
- Added proposal-only `handoffs` tRPC router.
- Added `HandoffArchivePanel` for proposal-only use, then removed the live
  `Handoffs` left-rail nav item after user clarified this should not become a
  big UI surface.
- Added `message_capture`, `session_handoff`, `reusable_prompt`,
  `tool_handoff`, and `external_model_handoff` to artifact kind surfaces.
- Updated plans and `AGENTS.md` so reusable prompts/tool handoffs are treated as
  a CereBro learning/memory feature with explicit provenance and approval
  language.
- Added `prompt_reuse` to the intake taxonomy and deterministic command-intake
  routing for requests like "that Excel prompt", "PixelLab prompt", "DeepSeek
  prompt", or "reuse prompt".
- Reusable prompt/tool handoff implementation slice:
  - Artifact Library can now explicitly save `reusable_prompt`, `tool_handoff`,
    and `external_model_handoff` vault text artifacts.
  - These save into the configured vault under `08_System/manifests/prompts`,
    `08_System/manifests/tool-handoffs`, and
    `08_System/manifests/external-model-handoffs` after the user clicks Save.
  - Added `promptHandoffs.search`, a read-only tRPC route that searches saved
    prompt/tool handoff artifact metadata and returns suggested matches with
    required disclosure copy.
  - This does not call external tools/models and does not write to
    Obsidian/Notion/Slack.
- Continued the reusable prompt/tool handoff slice:
  - `commandIntake.preview` now performs a read-only prompt handoff search when
    the request is classified as `prompt_reuse`.
  - The command intake preview card now surfaces the top reusable-memory
    suggestions with the required "which prompt / why / what approval" reuse
    disclosure.
  - Approved prompt/tool artifact saves now store a bounded body excerpt in
    artifact metadata (`prompt_or_instruction`) so future searches can match
    more than title/path/source metadata.
  - This remains proposal-only: no external tool/model calls and no
    Obsidian/Notion/Slack writes.
- Added the proposal-only Hedwig Capture Inbox slice:
  - New `app/server/routers/hedwig.ts` exposes `hedwig.capturePlan` with the
    proposed Notion capture database schema, Slack DM/capture-channel shape,
    minimum scope notes, approval gates, and routing rules.
  - New `hedwig.previewCapture` classifies pasted capture text locally and
    returns the proposed Notion row without writing to Notion, reading Slack,
    posting Slack, or creating tasks.
  - New `HedwigInboxPanel` is wired to the Keep `Inbox` nav. It shows the
    Notion capture DB proposal, Slack shape, approval gates, routing rules, and
    a local capture preview form.
  - The recommended Slack V1 shape is both a Hedwig DM and one explicit capture
    channel, with strict approved-surface scope.
  - This does not write to Obsidian, Notion, Slack, vault files, or external
    repos.
- Added first-pass Notion capture status plumbing:
  - `getNotionStatus` now reports `hasCapture` and `captureDatabaseId` from
    `NOTION_CAPTURE_DATABASE_ID`.
  - `app/.env.example` documents `NOTION_CAPTURE_DATABASE_ID` as approval-gated
    and not to be set until the schema/workspace target are approved.
- Added the first Hedwig-as-agent/Keep slice:
  - `app/server/agentRouter.ts` now treats the V1 roster as 11 agents and adds
    Hedwig as the Crypts `Messenger Roost` capture/messaging agent.
  - Hedwig has approval-gated Slack/Notion tool scopes:
    `read_slack_capture`, `write_slack`, and `write_notion`.
  - `app/client/src/lib/keepConfig.ts` now includes Hedwig in the `AgentId`
    union and `CHAMBERS`.
  - `KeepScene` now splits the Crypts into Piccolo's hygiene chamber and
    Hedwig's Messenger Roost, adds Hedwig motion config, prop placements,
    use-spots, council spot, and path-graph node/edge data.
  - Added a small placeholder messenger owl SVG under
    `app/client/public/sprites/keep/hedwig/rotations/south.svg`; this is
    explicitly a placeholder until the final PixelLab owl rotation pass.
- Added first runtime use-spot/facing movement in `KeepScene`:
  - The scene now loads directional agent textures (`south`, `east`, `west`,
    `north`) for every chamber agent.
  - Chamber grid origins are tracked so `CHAMBER_USE_SPOTS` can drive actual
    idle and hero/work positions instead of remaining inert metadata.
  - Active agents now face their configured hero/work spot; idle agents face
    their idle spot.
  - `walking-to-ceremony` and `council-seated` states now move agents to their
    configured Cortana council seats, with front/back depth differences and
    facing changes.
  - Floating state emotes now follow moving sprites during tweens.
  - Added placeholder Hedwig `east`, `west`, and `north` SVG rotations to match
    the runtime directional loader.
- Replaced the Hedwig placeholder sprite with a first PixelLab static asset:
  - PixelLab object id: `1cea6825-714b-44bf-adea-0c50cf902391`.
  - Saved the original generated 92x92 transparent PNG as
    `app/client/public/sprites/keep/hedwig/rotations/south_pixellab_full.png`.
  - Repacked the live `south.png`, `east.png`, `west.png`, and `north.png`
    sprites onto 92x92 transparent canvases with an approximately 30x41 visible
    bird trim so Hedwig reads as a messenger owl rather than a full-height
    character.
  - Generated temporary PNG derivatives for `east`, `west`, and `north` so the
    runtime directional loader can stay PNG-based.
  - Updated Hedwig's `spritePath` from SVG to PNG and updated
    `app/client/public/sprites/keep/hedwig/metadata.json` with the PixelLab
    object id.
  - Removed the earlier SVG placeholder rotations.
  - Queued PixelLab object animation `idle-flutter`, animation id
    `f9603efc-be76-4f97-aa2d-d31be88ef5f5`; PixelLab later reported it
    completed with 9 frames.
  - The available MCP/download endpoint still returned only the static PNG, and
    guessed animation-frame download endpoints returned 404. Local animation
    frames are not downloaded/wired yet.
  - Checked for obvious `PIXEL*` env variable names in repo env files/current
    shell with values redacted; none were present. PixelLab is callable through
    the plugin/app layer. Do not store raw PixelLab API keys in repo docs,
    memory, or settings.
- Upgraded the first Keep pathing slice from inert graph data to runtime
  council walking:
  - Corrected `PATH_NODES` for the current 62-column side-cutaway castle
    geometry.
  - Added a small BFS path finder over `PATH_EDGES`.
  - Added graph-node movement with facing-frame swaps for
    `walking-to-ceremony`.
  - Council movement now routes from each agent's chamber node through the
    static path graph to Cortana's hub before settling into the assigned
    council seat. `council-seated` still uses the short settle tween.
  - This is still a first runtime pass, not full collision/path polish.
- Added the proposal-only Terminal Lab thin slice:
  - New `app/server/routers/terminalLab.ts` exposes `terminalLab.plan` and
    `terminalLab.previewCommand`.
  - `previewCommand` classifies commands as `read_only`,
    `mutating_or_external`, `destructive`, or `unknown`, recommends an owner
    agent, explains the risk, and returns approval gates.
  - The router never executes commands and always reports
    `wouldExecute: false`.
  - New `TerminalLabPanel` is wired into the Keep left rail as `Terminal Lab`.
    It shows command policy, future surfaces, and a local command-preview form.
  - Added test coverage proving read-only and destructive command previews do
    not execute. Fixed an early substring bug where "Terminal" matched `rm` by
    tightening write detection to command tokens/phrases.
  - This does not persist command/output history yet and does not run shell
    commands from the UI.
- Extended Terminal Lab with local command-observation persistence:
  - Added an idempotent `command_observations` table in
    `app/server/cerebroDb.ts` with project/task/session links, command, cwd,
    risk, suggested agent, explanation, gates, source, status, exit code, and
    output summary fields.
  - `terminalLab.previewCommand` now records each preview as a local
    `previewed` observation and returns `observationId`.
  - Added `terminalLab.observations` to list recent observations, filterable by
    project/task/session.
  - `TerminalLabPanel` now shows recent local observations and saved preview
    ids.
  - This still does not run commands, capture stdout/stderr, or add a PTY
    bridge.
- Continued the Session 4 connective layer:
  - `terminalLab.previewCommand` now infers and links the known project from
    `cwd` when possible, so Project Lab can see local command observations for
    CereBro, Declyne, Waymark, Sygnalist, and Bridgefour.
  - Terminal Lab policy copy now reflects the current truth: preview
    observations are locally persisted, but stdout/stderr capture and UI
    execution are not live.
  - Added an idempotent `capture_observations` table for local Hedwig capture
    previews with project/task/session links, raw text, capture type, priority,
    source URI/label, project guess, sensitivity flag, and proposed Notion row.
  - `hedwig.previewCapture` now persists each local preview, returns the saved
    observation id, and links known project guesses to harness project rows.
  - Added `hedwig.observations` and surfaced recent local capture previews in
    `HedwigInboxPanel`.
  - Project Lab now shows local Terminal and Hedwig observation counts plus
    recent command/capture snippets per linked project.
  - Keep pathing got a small runtime stability polish: `KeepScene` now avoids
    reapplying motion/tweens when an agent's state has not changed, so repeated
    state refreshes do not restart council walking mid-route.
  - Still no Obsidian, Notion, Slack, vault, external repo, browser, or shell
    execution writes were added.
- Continued with two more local-only operations slices:
  - Added `hedwig.triageObservation`, a read-only route that loads one saved
    capture preview and proposes a route: task, source, learning, reminder, or
    message.
  - Hedwig triage returns rationale, support agents, task/source/reminder/message
    drafts, proposed status, and approval gates. It does not mutate the capture
    row and does not write to Notion, Slack, Tasks, Sources, or the vault.
  - `HedwigInboxPanel` now has a `Triage` action for local capture previews and
    displays the route proposal plus gates.
- Added `terminalLab.observeOutput`, a local mutation that attaches a
    redacted output summary and optional exit code to an existing command
    observation. It does not execute commands.
  - `TerminalLabPanel` now lets the user select a local observation and paste
    observed output. The saved summary redacts email addresses and simple
    token/secret/password/API-key assignments.
  - Terminal Lab surfaces/policy copy now reflect manual observed-output
    summaries as local persistence, while keeping UI execution disabled.
- Extended Terminal Lab with task/session linkage and follow-up suggestions:
  - Added `terminalLab.linkObservation`, a local-only mutation that attaches an
    existing command observation to a selected task and/or session and infers
    the project link from the task/session when available.
  - `TerminalLabPanel` now loads current tasks and recent sessions, lets new
    command previews attach to the selected task/session, and lets existing
    observations be relinked with `Link Selected`.
  - Saved command observations now return deterministic Aang/Tony follow-up
    suggestions. Aang explains commands, failures, or observed evidence; Tony
    proposes the next read-only diagnostic or project step.
  - This is still proposal-only. It does not execute commands, create shells,
    edit files, write to external repos, browse, or call Notion/Slack.
- Added a second Terminal Lab local action:
  - New `terminalLab.createTaskFromObservation` creates a normal local CereBro
    task from a saved command observation and links the observation back to that
    task.
  - It assigns Tony for failed/error-like observations and Aang for simple
    read-only explanation follow-ups.
  - `TerminalLabPanel` now shows `Create Task` on observations that are not
    already task-linked.
  - This is a local SQLite/libSQL harness write only. It does not execute the
    command, create a shell, edit files, write to external repos, browse, or
    call Notion/Slack.
- Added the first Hedwig local source action:
  - New `hedwig.saveSourceFromObservation` creates or updates a local `sources`
    row from a saved capture observation with a source URL.
  - The saved source is explicitly marked `source_type = hedwig_capture`,
    `trust_level = unknown`, and `freshness_status = unfetched` because no
    browse/fetch/extraction is performed.
  - The capture observation is marked `sourced`, a `source_url` artifact is
    recorded for lifecycle/provenance, and Surfer Sources can display the saved
    URL through the existing saved-source panel.
  - `HedwigInboxPanel` now shows `Save Source` in the triage proposal when a
    capture includes a source URL.
  - This is a local SQLite/libSQL metadata write only. It does not fetch the
    page, browse, write to Notion/Slack, write vault files, or validate claims.
- Added the first Hedwig local reminder proposal action:
  - Added an idempotent `reminder_proposals` table in
    `app/server/cerebroDb.ts` for local reminder proposals linked to projects,
    tasks, sessions, and capture observations.
  - New `hedwig.createReminderProposalFromObservation` creates a local reminder
    proposal from a reminder-like capture, preserving the timing hint and raw
    capture text.
  - New `hedwig.reminderProposals` lists recent local proposals.
  - `HedwigInboxPanel` now shows `Create Reminder Proposal` for reminder triage
    results and a compact local Reminder Proposals list.
  - This is a local SQLite/libSQL metadata write only. It does not schedule,
    notify, post to Slack, write to Notion/calendar, or create any external
    reminder.
- Added the first Hedwig local message draft proposal action:
  - Added an idempotent `message_draft_proposals` table in
    `app/server/cerebroDb.ts` for local draft proposals linked to projects,
    tasks, sessions, and capture observations.
  - New `hedwig.createMessageDraftProposalFromObservation` creates a local
    message draft proposal from a message-like capture, preserving raw capture
    text, draft intent, and a light recipient hint when available.
  - New `hedwig.messageDraftProposals` lists recent local draft proposals.
  - `HedwigInboxPanel` now shows `Create Message Draft` for message triage
    results and a compact local Message Drafts list.
  - This is a local SQLite/libSQL metadata write only. It does not send, post
    to Slack, email, write to Notion, write to the vault, or contact any
    external messaging surface.
- Added Terminal Lab task/session filtered observation views:
  - `TerminalLabPanel` now has `All`, `Task`, and `Session` scope controls for
    recent command observations.
  - The Task and Session scopes use the selected task/session link already used
    for new previews and relinking.
  - This is UI/query filtering over existing local harness rows only. It does
    not execute commands, mutate observations, or write externally.
- Added Terminal Lab learning-note proposal staging:
  - New `terminalLab.createLearningProposalFromObservation` stages a pending
    `memory_proposals` row from a saved command observation.
  - The proposal is owned by Aang, tagged `terminal_lab,aang,learning_note`,
    linked to the observation via `source = terminal_observation:<id>`, and
    includes command, cwd, risk, explanation, observed output summary, and exit
    code when available.
  - `TerminalLabPanel` now shows `Stage Learning Note` on observations.
  - This is a local pending memory proposal only. It does not write durable
    memory, Obsidian, Notion, Slack, vault files, or external tools; Oak/user
    approval is still required before durable memory write.
- Added richer Tony diagnostic drafts in Terminal Lab:
  - Saved command observations now include deterministic `diagnosticDrafts`
    alongside Aang/Tony follow-up suggestions.
  - Current drafts propose narrow read-only commands for common observed-output
    shapes: missing file/path, permission denial, git state, or unclear
    non-zero exits.
  - `TerminalLabPanel` displays these as suggested-only Tony commands with
    rationale and approval reminders.
  - No diagnostic command is executed from the UI and no shell bridge was added.
- Added the first explicit user-approved local action from Hedwig triage:
  - New `hedwig.createTaskFromObservation` creates a normal local CereBro task
    from a saved capture observation, links the observation to the task, marks
    the capture `tasked`, and clears `needs_review`.
  - The task uses the triage-selected owner agent and links to a known project
    row when the capture guessed Declyne, Waymark, Sygnalist, Bridgefour, or
    CereBro.
  - `HedwigInboxPanel` now shows a `Create Local Task` button in the triage
    proposal. This is an explicit local SQLite/libSQL write only; it does not
    write to Notion, Slack, Sources, the vault, Obsidian, or any external repo.
- Created the approved Obsidian session handoff archive:
  - Wrote the current real handoff snapshot to
    `90_Archive/CereBro Session History/snapshots/2026-05-06 CereBro Session Handoff.md`
    inside the configured Obsidian vault.
  - Wrote the Obsidian index note
    `90_Archive/CereBro Session History/CereBro Session History.md`.
  - Read-only inventory found only one real CereBro session handoff file:
    `CEREBRO_SESSION_HANDOFF.md`. Other handoff matches were templates or
    implementation files, not actual session handoffs.
  - Updated `AGENTS.md`, this handoff, and the master plan so future CereBro
    build sessions must save an Obsidian handoff snapshot at closeout.
- Added local proposal detail/status transitions for Hedwig:
  - New `hedwig.proposalDetail` loads source/capture, reminder, and message
    draft proposal details with local-only gates and allowed status options.
  - New `hedwig.updateSourceProposalStatus`,
    `hedwig.updateReminderProposalStatus`, and
    `hedwig.updateMessageDraftProposalStatus` mutate only local SQLite/libSQL
    metadata and always report `writesExternal: false`.
  - `HedwigInboxPanel` now has a proposal detail inspector for source,
    reminder, and message proposals, with local status controls and approval
    gates visible beside the existing Slack/Notion policy surfaces.
  - Source proposal statuses are limited to local capture states:
    `inbox`, `triaged`, `sourced`, and `archived`.
  - Reminder/message proposal statuses are local workflow states:
    `proposed`, `reviewing`, `ready_for_approval`, `deferred`, and `archived`.
  - This does not write to Notion or Slack, does not fetch/browse source URLs,
    does not schedule reminders, and does not send/post/email messages.
- Added a cleaner Tony diagnostic draft handoff in Terminal Lab:
  - New `terminalLab.previewDiagnosticDraft` accepts one of Tony's generated
    diagnostic draft commands for a saved command observation, verifies it is
    still an actual draft for that observation, and converts it into a normal
    local Terminal Lab command preview.
  - The new preview inherits the parent observation's cwd/project/task/session
    links and records `source = terminal_lab_diagnostic:<parentId>` for local
    provenance.
  - `TerminalLabPanel` now shows `Preview Via Codex Path` on Tony diagnostic
    drafts. Clicking it fills the command input and creates a local preview
    card with a handoff note.
  - This does not execute commands, open a shell, edit files, run diagnostics,
    or bypass Codex command approval. It is only a safer bridge from Tony's
    suggestion text into the existing proposal/approval path.
- Added explicit copy/approval affordances for Tony diagnostic drafts:
  - `TerminalLabPanel` now separates Tony draft actions into `Preview Via
    Approval Path`, `Copy`, and `Copy Approval`.
  - The copy approval text includes the parent observation id, command, purpose,
    gate, and an instruction to run only through the normal Codex approval path.
  - The converted Tony draft preview also has `Copy Command` and
    `Copy Approval Note`.
  - If browser clipboard access is blocked, the panel loads the text into the
    command input and marks the action as `Loaded` instead of executing
    anything.
  - This is a client-side affordance only. It does not run commands, create a
    shell, edit files, write durable memory, or change approval state.
- Added saved diagnostic-preview provenance visibility:
  - `terminalLab.observations` now derives `diagnosticParentId` from
    `source = terminal_lab_diagnostic:<parentId>`.
  - `TerminalLabPanel` shows a `from #<parentId>` chip and explanatory
    provenance line on saved Tony diagnostic-preview observations.
  - Saved diagnostic-preview rows also expose a derived `diagnostic preview`
    status chip so they are easy to scan in the local observation list.
  - This makes converted Tony previews auditable after they enter the normal
    Recent Observations list. It does not add execution, shell access, or any
    external writes.
- Added deeper Terminal Lab diagnostic-chain detail:
  - Tony diagnostic drafts now include explicit `evidence` and `expectedSignal`
    text so each suggested read-only command explains what triggered it and
    what useful result it would reveal.
  - Added deterministic draft coverage for port conflicts, missing Node/JS/TS
    modules or packages, missing TypeScript symbols, package-tool failures, git
    state, missing files, permission errors, and unclear non-zero exits.
  - Converted Tony diagnostic previews now persist chain root/depth provenance
    in the local observation source string while preserving the parent
    observation id.
  - `TerminalLabPanel` displays diagnostic root/depth chips plus evidence and
    expected-signal notes on Tony drafts.
  - This remains proposal-only. It does not execute commands, create a shell,
    install packages, mutate files, browse, call Slack/Notion, or bypass the
    normal Codex approval path.
- Added editable local Hedwig review fields and approval previews:
  - `hedwig.updateSourceProposalReview`,
    `hedwig.updateReminderProposalReview`, and
    `hedwig.updateMessageDraftProposalReview` now edit only local SQLite/libSQL
    review metadata: priority, review notes, approval scope, proposed external
    target, and source needs-review state.
  - `hedwig.createApprovalPreviewFromProposal` stages a pending local
    `approvals` row for source enrichment, Notion capture write, Slack capture
    read, reminder scheduling, or message sending.
  - `hedwig.approvalPreviews` lists those pending local approval records.
  - `HedwigInboxPanel` now exposes review field editing, a Stage Approval
    Preview button, and local approval-preview history in proposal detail.
  - This does not approve anything, write to Notion/Slack, fetch/browse a URL,
    schedule reminders, send/post/email messages, or change external state.
- Added Terminal Lab local observation statuses and approval previews:
  - `terminalLab.observationDetail` returns local detail, status options, and
    gates for saved command observations.
  - `terminalLab.updateObservationStatus` can mark observations `reviewing`,
    `blocked`, `archived`, and related local statuses without execution.
  - `terminalLab.createApprovalPreviewFromObservation` stages a pending local
    `approvals` row for a command observation, classed as read-only,
    mutating/external, or destructive.
  - `terminalLab.approvalPreviews` lists pending local approval records for
    command observations.
  - `TerminalLabPanel` now exposes review/block/archive controls plus an
    Approval Preview button and local approval-preview list.
  - Creating a terminal follow-up task marks the observation `tasked`; staging
    an Aang learning proposal marks it `learned`.
  - This does not execute commands, approve commands, create a shell, install
    packages, mutate git/files, browse, or bypass Codex approval.
- Repaired the Obsidian session handoff archive behavior after user correction:
  - Confirmed local disk currently contains only the live
    `CEREBRO_SESSION_HANDOFF.md`, the existing overwritten Obsidian snapshot,
    and Claude Code handoff template files. Exact overwritten same-day snapshot
    contents were not recoverable from ordinary repo/vault files.
  - Updated `AGENTS.md` and this closeout protocol so future handoff snapshots
    use unique timestamped filenames and the Obsidian index is append-only.
  - Added recovered Obsidian archive notes for the prior same-day closeout
    slices that are still represented in the cumulative handoff, clearly marked
    as recovered rather than exact original snapshots.
  - Added the current full handoff as a unique timestamped Obsidian snapshot.
- Promoted append-only history from a handoff-specific fix to a global CereBro
  learning law:
  - Updated `AGENTS.md`, `CEREBRO_FILE_LIFECYCLE_PLAN.md`,
    `CEREBRO_MASTER_BUILD_PLAN.md`, and
    `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
  - Rule: history/log/archive/index/note trails append or version; canonical
    current-state files may update in place.
  - Rationale: CereBro cannot learn the user's needs, preferences, corrections,
    and hard boundaries if historical evidence is silently overwritten.
- Added the first code-level append/version enforcement slice:
  - `writeObsidianNote` now preserves the first slug path when it is unused and
    writes a timestamped version if the same note title/subfolder already
    exists.
  - `writeVaultTextArtifact` now does the same for vault text artifacts such as
    source notes, message drafts, prompt/tool handoffs, QA reports, model tests,
    cleanup reports, and similar durable text outputs.
  - This prevents accidental same-title overwrites while keeping the original
    path stable for first writes.
  - Current-state files that intentionally update in place still need explicit
    dedicated writers rather than using these history/durable-output helpers.
- Added Artifact Library write-policy labels:
  - `ArtifactsPanel` now tells the user that Artifact Library writes are
    durable history/draft/report saves, not current-state overwrites.
  - Each writable kind carries a policy label: history, draft trail, or report
    history.
  - The panel now explicitly says same-title saves create timestamped versions
    and current-state updates need a separate explicit current-state writer.
- Added append-only source provenance events:
  - Added idempotent `source_events` table in `app/server/cerebroDb.ts`.
  - Added `recordSourceEvent` helper so source writes can keep an append-only
    history even when `sources` remains the current-state URL/source card.
  - `surfer.ingestPublicUrl` now records a `surfer_public_url_ingest` source
    event for every approved public URL ingestion.
  - `hedwig.saveSourceFromObservation` now records a
    `hedwig_capture_source_save` source event for every local capture URL saved
    as a source.
  - This preserves provenance/history while allowing the `sources` row to
    remain the current indexed summary for a URL.
- Surfaced source provenance history in Surfer Sources:
  - `surfer.panel` now returns `recentSourceEvents` from the append-only
    `source_events` table.
  - `SurferSourcesPanel` now has a compact Source History rail showing recent
    source events, owner agent, URL/title, trust/freshness, and source label.
  - This is read-only visibility over local provenance. It does not browse,
    fetch, crawl, screenshot, or write externally.
- Continued the append-only learning law with a small provenance/review slice:
  - Audited remaining write-like paths with `rg`. Active durable vault/Obsidian
    text writers now version same-title history/draft/report files. The older
    `agents.ts` config/skill/agent admin writers remain current-state/admin
    writer candidates rather than history surfaces; do not reuse those patterns
    for logs, notes, source provenance, or handoff archives.
  - Added idempotent local review metadata columns for Hedwig capture/reminder/
    message proposals: review notes, approval scope, proposed external target,
    last-reviewed timestamps, and reminder/message review priority.
  - Hedwig proposal creation/status transitions now preserve local-only review
    metadata and mark local review time without writing to Notion, Slack,
    calendars, email, iMessage, vault files, or Obsidian.
  - `HedwigInboxPanel` now displays proposal review priority/scope/target/notes
    in the detail inspector so approval context is explicit before any future
    external action.
  - `surfer.panel` now supports local source-event filtering by owner
    (`surfer`/`hedwig`) and scrubbed-sensitive events.
  - `SurferSourcesPanel` now exposes those filters and shows richer event
    provenance: summary excerpt, word count, scrubbed flag, trust notes, and
    scrub notes.
- Added Aang Companion Overlay to the build route:
  - User clarified that Aang should be the small always-on surface for keeping
    tabs on CereBro: ambient, useful, click-to-ask, and status-aware.
  - Aang stays a full agent, not a pet in the roster.
  - Idle behavior should be lore-accurate and quiet: goofy fidgeting, tiny
    airbending practice, balancing, sitting, breathing, glancing around,
    sleepy/time-of-day states, and gentle wakeups.
  - Avoid combat loops, large effects, constant movement, or dramatic poses.
  - Cortana still routes requests, Hedwig still owns capture/reminders, and
    Piccolo still owns hygiene.
  - `CEREBRO_MASTER_BUILD_PLAN.md` now places the overlay across Session 6
    design/thin target, Session 8 approved local event feed, Session 11 quick
    ask routing, Session 12 desktop shell/UX, and Session 13 richer animation.
  - `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` now records the companion loop,
    modular surface, Aang ownership boundary, and open desktop-shell/event
    policy questions.
- Folded the reasoning-router direction into the build route:
  - User clarified that CereBro should use local models, free/generous
    hosted AI tiers, specialty tools, and a frontier hosted lane through strong
    routing and validation.
  - Updated `CEREBRO_MASTER_BUILD_PLAN.md` so the Model/Tool Capability
    Registry, Surfer Model/Tool Discovery lane, Reasoning Gateway, eval-backed
    routing, Prompt/Tool Handoff playbooks, and OpenClaw-as-reference stance
    are now canonical scope.
  - Updated `CEREBRO_MODEL_ROUTER_BASELINE.md` with the expanded registry
    target, gateway options, first internal interface shape, and first eval task
    set.
  - Recorded the pushback: free-tier model hopping is not the same as me-level
    reasoning. CereBro gets smarter when it tests models/tools, routes with
    evidence, packages context well, validates outputs, and saves what worked.
  - This was docs-only. It did not install LiteLLM, OpenRouter tooling,
    promptfoo, DeepEval, Ollama, or any external provider SDK.
- Implemented the first local Model/Tool Capability Registry scaffold:
  - `app/server/cerebroDb.ts` now creates local
    `model_tool_capabilities`, `model_tool_evals`, and
    `model_tool_call_logs` tables.
  - `app/server/routers/modelTools.ts` exposes a proposal-only policy route,
    read-only capability/eval listing, local append-only capability proposals,
    local append-only eval notes, and a route preview helper.
  - `modelTools.routePreview` returns candidate lanes such as
    local/private-first, Surfer discovery proposal, vision adapter candidate,
    and frontier reasoning candidate, with approval gates and validation steps.
  - Capability records are proposals until source-verified or eval-tested.
    Eval notes do not mark a capability as a recommended default.
  - This did not install LiteLLM, OpenRouter tooling, promptfoo, DeepEval,
    Ollama, or any provider SDK. It did not call external models/tools,
    browse/search/fetch, create accounts, touch tokens, or verify current
    pricing/limits.
- Folded Reddit into the build plan as a first-class source lane:
  - Updated `CEREBRO_MASTER_BUILD_PLAN.md` core defaults, Session 5 Source
    Library, Session 7 Notion/Output capture, and Session 8 Hedwig/Piccolo
    operations.
  - Locked the intended product shape: Reddit watchlists, post/search/comment
    capture, trend radar, media references, outbound links, community
    disagreement tracking, and source records with visible provenance.
  - Locked the learning flow: raw capture -> summarized source -> recurring
    pattern -> approved memory.
  - Locked the safety boundary: conservative public-source capture or approved
    OAuth setup, no block bypass, no proxy scraping, no deleted/private content
    harvesting, no automatic reposting, and no model training/fine-tuning on
    Reddit content.
  - This was docs-only. It did not browse Reddit, fetch sources, install a
    Reddit package, create a Reddit app, download media, write Notion/Slack, or
    save vault media.
- Folded Uncodixfy, Google Stitch, v0.app, and Docling into the standing
  CereBro design/source rules.
- `DESIGN.md` now treats Uncodixfy as anti-generic judgment, Stitch as
  high-fidelity UI exploration, v0 as disposable React/Tailwind component
  scaffolding, and Docling as the preferred local document-intelligence
  candidate once an adapter exists.
- `AGENTS.md` and `CLAUDE.md` now tell future agents to apply those rules to
  themselves as well as CereBro: generators are sketch lanes, Docling output is
  evidence, and all source/document claims need receipts.
- `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`,
  `CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_FRONTEND_SYSTEM.md`, and the
  frontend/anti-slop skills now carry the same rule: no pasted generator output
  as final implementation, no private document sent externally when local
  parsing can extract structure first, and screenshot/provenance proof wins.
- Added the larger external source batch to the reference plan and license
  matrix: Emil Kowalski Skill, Anthropic frontend-design skill, Forrest Chang
  Karpathy Skills, Addy Osmani Agent Skills, AIDLC Workflows, Archon, Hermes,
  Multica, GenericAgent, LobeHub, local-deep-research, ppt-master,
  Pixelle-Video, VoxCPM, Maigret, CloakBrowser, and Awesome Codex Skills.
- Locked the intake stance: public GitHub is source material, not automatic
  clearance. No clone, install, script, Docker, daemon, model-weight download,
  service auth, or code paste until license, security, maintenance, install
  surface, storage, privacy, and product fit are recorded.
- Categorized the batch:
  - Use now as rewritten rules: Emil, Anthropic frontend-design, Addy Osmani,
    AIDLC, and Karpathy-style coding discipline.
  - Study for architecture: Archon, Hermes, Multica, GenericAgent, and LobeHub.
  - Park as future adapters: local-deep-research, ppt-master, Pixelle-Video,
    and VoxCPM.
  - Restrict hard: Maigret and CloakBrowser.

## Files Touched This Session

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`
- `CEREBRO_MODEL_ROUTER_BASELINE.md`
- `CEREBRO_FILE_LIFECYCLE_PLAN.md`
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`
- `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`
- `CEREBRO_FRONTEND_SYSTEM.md`
- `DESIGN.md`
- `AGENTS.md`
- `CLAUDE.md`
- `CereBro_Final_Implementation_Pack/LICENSE_REVIEW_MATRIX.md`
- `CereBro_Claude_Code_Repo_Starter_Pack/skills/frontend-design.skill.md`
- `CereBro_Claude_Code_Repo_Starter_Pack/skills/anti-slop-review.skill.md`
- `app/server/agentRouter.ts`
- `app/server/cerebroDb.ts`
- `app/server/routers/outputs.ts`
- `app/server/integrations/vault.ts`
- `app/server/integrations/notion.ts`
- `app/server/routers/integrations.ts`
- `app/server/routers/piccolo.ts`
- `app/server/routers/projectIntelligence.ts`
- `app/server/routers/commandIntake.ts`
- `app/server/routers/surfer.ts`
- `app/server/routers/handoffs.ts`
- `app/server/routers/promptHandoffs.ts`
- `app/server/routers/hedwig.ts`
- `app/server/routers/terminalLab.ts`
- `app/server/routers/approvals.ts`
- `app/server/routers/workbench.ts`
- `app/server/routers/companion.ts`
- `app/server/routers/modelTools.ts`
- `app/server/routers/tasks.ts`
- `app/server/routers.ts`
- `app/server/routers/memory.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/server/routers/artifacts.ts`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/PiccoloPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/components/HandoffArchivePanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/AangCompanionPanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `app/client/src/lib/keepConfig.ts`
- `app/client/src/components/KeepScene.tsx`
- `app/client/public/sprites/keep/hedwig/metadata.json`
- `app/client/public/sprites/keep/hedwig/rotations/south.png`
- `app/client/public/sprites/keep/hedwig/rotations/south_pixellab_full.png`
- `app/client/public/sprites/keep/hedwig/rotations/east.png`
- `app/client/public/sprites/keep/hedwig/rotations/west.png`
- `app/client/public/sprites/keep/hedwig/rotations/north.png`
- `app/.env` (gitignored local config)
- `app/.env.example`
- Obsidian vault:
  - `90_Archive/CereBro Session History/CereBro Session History.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-07 0510 CereBro Session Handoff - Reasoning Router.md`
- Obsidian vault:
  - `90_Archive/CereBro Session History/CereBro Session History.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-08 1752 CereBro Session Handoff - External Reference Rules.md`
- Obsidian vault:
  - `90_Archive/CereBro Session History/CereBro Session History.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-08 1807 CereBro Session Handoff - Source Batch Intake Rules.md`
- Obsidian vault:
  - `90_Archive/CereBro Session History/CereBro Session History.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 CereBro Session Handoff.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1758 CereBro Session Handoff - Source Review Metadata.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1800 CereBro Session Handoff - Tony Draft Copy Approval.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1803 CereBro Session Handoff - Tony Diagnostic Provenance.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1805 CereBro Session Handoff - Tony Diagnostic Status Label.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1938 CereBro Session Handoff - Aang Companion Overlay.md`

## Tests And Checks

- Reasoning-router plan slice:
  - Docs-only update. No code tests needed.
  - `git status --short`: run. Worktree remains dirty with broad pre-existing
    changes plus the touched planning docs and handoff updates.
- Model/tool capability registry scaffold:
  - `pnpm check`: passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts`: passed, 17 tests.
  - `pnpm build`: passed. Vite still warns about unset analytics env
    placeholders and large JS chunks; those warnings predate this slice.
- `pnpm test` in `app/`: passed. 4 test files, 23 tests.
- `pnpm check` in `app/`: passed. TypeScript completed without errors.
- `git status --short`: run. Worktree remains dirty, mostly from pre-existing changes plus this session's new docs/update.
- Session 2 checks run: `system_profiler SPHardwareDataType`, `sw_vers`, `df -h`, `command -v ollama`, `git status --short`.
- Session 3 code checks run after lifecycle scaffold:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 23 tests.
- Session 3 code checks run after vault layout/Piccolo router:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 25 tests.
- Session 3 setup checks after creating vault folders:
  - Verified Google Drive mount under `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com`.
  - Verified `CereBro-Vault` exists.
  - Verified canonical folder tree exists with `find`.
  - Verified Obsidian setup files exist under `07_Knowledge/obsidian-vault/.obsidian`.
  - `du -sh` for the vault reported `8.0K`.
  - `du -sh` for the Obsidian vault reported `20K`.
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 25 tests.
- Session 3 checks after artifact hooks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 26 tests.
- Session 3 checks after general artifact router:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 3 checks after UI visibility:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - `pnpm dev` started successfully on `http://localhost:3003/` after auto-bumping from busy port 3000.
- Session 3 checks after responsive layout fix:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Browser verified Outputs and Automation at `http://localhost:3003/` in the in-app browser.
- Session 3 checks after first artifact write control:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Browser created and displayed the first tracked Obsidian artifact.
  - Verified `07_Knowledge/obsidian-vault/indexes/cerebro-home.md` contains clean Markdown.
- Session 3 checks after supersession polish:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Browser verified Artifact Library superseded older rows for repeated saves.
  - Browser verified Piccolo reports repeated storage paths as informational history.
  - Verified updated Obsidian note content.
- Session 3 closeout polish checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Verified `http://localhost:3003/` is still listening.
- Project Intelligence planning checks:
  - Read current master/handoff/file lifecycle/model router docs.
  - Read relevant older architecture and implementation-pack references.
  - Read-only GitHub connector inspection of Bowgull repos.
  - Read-only local checkout discovery under `/Users/lindsaybell`.
  - Read-only git status/remotes for Declyne, Waymark, Sygnalist, Bridgefour.
  - No tests needed; docs-only planning change.
- Session 4 Project Lab implementation checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - `git status --short`: run. Worktree remains dirty with pre-existing
    changes plus this session's docs and Project Lab files.
- Session 4 connective-layer checks after Terminal/Hedwig/Project Lab/pathing
  polish:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
  - Confirmed a dev server is listening on `http://localhost:3002/`.
- Session 4 Batman role adjustment checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 command intake checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 personal OS / Surfer route checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Surfer panel scaffold checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 approved public URL ingestion checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 approved intake task creation checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 project-linked intake task checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 task project-name display checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Project Lab task rollup checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Tasks project filter checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Surfer source metadata checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 capture/terminal planning checks:
  - Planning/doc-only update; no app tests required.
- Session 4 proposal-only Handoff Archive checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 reusable prompt/tool-handoff checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 reusable prompt/tool-handoff save/search checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 command-intake prompt reuse surfacing checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 Hedwig capture proposal checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 28 tests.
- Session 4 Notion capture status checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 28 tests.
- Session 4 Hedwig agent/Keep metadata checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/cerebro-home.html http://localhost:3002/`: passed.
  - `curl --fail -L -o /tmp/hedwig-south.svg http://localhost:3002/sprites/keep/hedwig/rotations/south.svg`: passed.
- Session 4 Keep use-spot/facing movement checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/hedwig-east.svg http://localhost:3002/sprites/keep/hedwig/rotations/east.svg`: passed.
  - `curl --fail -L -o /tmp/tony-east.png http://localhost:3002/sprites/keep/tony/rotations/east.png`: passed.
  - `curl --fail -L -o /tmp/cerebro-home.html http://localhost:3002/`: passed.
- Session 4 PixelLab Hedwig static sprite checks:
  - PixelLab `create_map_object`: completed for object
    `1cea6825-714b-44bf-adea-0c50cf902391`.
  - Downloaded object, retained the full generated source at
    `app/client/public/sprites/keep/hedwig/rotations/south_pixellab_full.png`,
    and repacked the live rotations to bird scale.
  - PixelLab `animate_object`: queued `idle-flutter` animation
    `f9603efc-be76-4f97-aa2d-d31be88ef5f5`.
  - PixelLab `get_object`: later reported `idle-flutter` completed with 9
    frames.
  - `curl --fail -L -o /tmp/hedwig-pixellab-object-download https://api.pixellab.ai/mcp/objects/1cea6825-714b-44bf-adea-0c50cf902391/download`: returned the static PNG.
  - Guessed animation download endpoints returned 404, so no local animation
    frame files were saved.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/hedwig-pixellab-south.png http://localhost:3002/sprites/keep/hedwig/rotations/south.png`: passed.
  - `view_image` inspected the local PixelLab sprite.
- Session 4 Hedwig scale correction checks:
  - Compared visible trims for existing agents and Hedwig; the original Hedwig
    object was too close to full character height.
  - Repacked Hedwig live PNG rotations to an approximately 30x41 visible owl on
    the existing 92x92 transparent canvas.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/hedwig-pixellab-south-small.png http://localhost:3002/sprites/keep/hedwig/rotations/south.png`: passed.
- Session 4 Keep path graph walking checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/cerebro-home-pathing.html http://localhost:3002/`: passed.
- Session 4 Terminal Lab proposal checks:
  - Initial `pnpm test -- cerebro-foundations.test.ts` caught a classifier bug:
    the substring `rm` inside "Terminal" caused a read-only `rg` example to be
    marked mutating.
  - Fixed classifier matching to use first command token plus explicit phrases.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `curl --fail -L -o /tmp/cerebro-terminal-lab.html http://localhost:3002/`: passed.
- Session 4 Terminal Lab observation persistence checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `curl --fail -L -o /tmp/cerebro-terminal-persist.html http://localhost:3002/`: passed.
- Session 4 connective-layer checks after Terminal/Hedwig/Project Lab/pathing
  polish:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
  - `git status --short`: run. Worktree remains dirty with pre-existing
    changes plus the current Session 4 local changes.
  - Confirmed a dev server is listening on `http://localhost:3002/`.
- Session 4 Hedwig triage and Terminal observed-output checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
  - `git status --short`: run. Worktree remains dirty with pre-existing
    changes plus the current Session 4 local changes.
- Session 4 Hedwig triage-to-task checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
- Session 4 Terminal Lab task/session linkage checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
  - `pnpm dev` started successfully on `http://localhost:3002/` after
    auto-bumping from busy port 3000.
- Session 4 Terminal Lab follow-up task checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig save-source checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig reminder proposal checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig message draft proposal checks:
  - Initial focused test caught a case-sensitivity bug in recipient hint
    parsing for `Message Cortana`; fixed the regex to match the command word
    case-insensitively.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Terminal Lab observation filter checks:
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
- Session 4 Terminal Lab learning-note proposal checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Tony diagnostic draft checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig proposal status/detail checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
- Session 4 Tony diagnostic draft handoff checks:
  - Initial `pnpm check` caught tRPC union narrowing in
    `TerminalLabPanel`; fixed the UI guard to narrow on the success-only
    `handoffNote` field.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
- Obsidian append-only archive repair checks:
  - Searched repo and configured CereBro vault for handoff Markdown files.
  - Found only `CEREBRO_SESSION_HANDOFF.md`, the existing Obsidian snapshot, and
    Claude Code handoff templates; no separate old exact snapshot files were
    present.
  - Repaired the Obsidian index to preserve entries instead of replacing one
    same-day line.
- Append-only learning law documentation checks:
  - Updated the repo guide, file lifecycle plan, master plan, project
    intelligence plan, and live handoff.
  - Verified no old date-only handoff snapshot instruction remains in
    `AGENTS.md` or `CEREBRO_SESSION_HANDOFF.md`.
- Append/version writer checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - Tests now prove same-title Obsidian notes and vault text artifacts create a
    timestamped second file and preserve the first file's contents.
- Artifact Library write-policy label checks:
  - `pnpm check` in `app/`: passed.
- Source provenance event checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - Test coverage now verifies Hedwig source saves append a `source_events` row
    with owner/provenance while keeping the local source save proposal-only.
- Surfer source history visibility checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - Test coverage now verifies `surfer.panel` returns recent source events.
- Source review metadata slice checks:
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
  - `pnpm typecheck` was attempted but no such package script exists.
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
- Tony draft copy/approval affordance checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
- Tony diagnostic-preview provenance checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
- Tony diagnostic-preview status-label checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
- Obsidian handoff archive checks:
  - Read-only handoff inventory found `CEREBRO_SESSION_HANDOFF.md` as the real
    handoff source.
  - Verified the Obsidian session history index and dated handoff snapshot exist
    in the configured Obsidian vault.
- Aang Companion Overlay planning checks:
  - Updated `CEREBRO_MASTER_BUILD_PLAN.md` and
    `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
  - No code, assets, dependencies, Notion rows, Slack records, app permissions,
    browser actions, external repos, or desktop overlay processes were changed.
- Session 4 Workbench evidence grouping checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test` in `app/`: passed. 4 test files, 32 tests.
  - Test coverage now verifies local Workbench evidence grouping stays
    read-only/no-fetch/no-command and that evidence detail exposes appended
    validation-note history without overwriting the original evidence row.
- Session 4 local proposal bundle checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - A parallel test run while `pnpm check` was still active hit a transient
    `SQLITE_BUSY` lock; rerunning after the compiler finished passed.
  - Test coverage now verifies Approval Queue grouping is read-only/no-approve,
    Workbench link options include local tasks/sessions without mutating them,
    and Project Lab action drafts append local plans without creating tasks or
    editing repos.
- Session 4 local drill-down and companion bridge checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - Approval Queue group cards now act as local drill-down controls.
  - Workbench group cards now act as local drill-down controls, and evidence
    search now includes validation status, saved-source labels/URIs, and linked
    command text.
  - Aang Companion local event counts now include Workbench evidence records
    from the last 24 hours and can route back to Workbench inside the Keep.
- Session 4 Workbench/Project Lab local linking checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - Workbench evidence grouping now includes task, session, and artifact groups
    alongside project/kind/source/command/validation status.
  - Workbench evidence creation now has a local artifact picker in addition to
    project/task/session/source/command links.
  - Workbench evidence search now spans task titles, session ids, artifact
    titles/paths, source labels/URIs, linked commands, and validation status.
  - Project Lab overview/cards now surface local action draft counts, a Drafts
    filter, draft score chips, and a card signal block that opens the Drafts
    inspector queue.
- Session 4 Project Lab draft history checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - Added append-only local `project_action_draft_notes`.
  - Project Lab draft detail now returns recent local notes for each draft.
- Project Lab Drafts inspector can append a local note to a draft without
  creating a task, editing repos, running commands, browsing/searching,
  fetching sources, or writing to Notion/Slack.
- Test coverage now verifies draft notes append and appear in project detail.
- External reference rule fold-in checks:
  - Docs-only update. No app tests needed.
  - Current sources checked for Google Stitch, v0.app, and Docling before
    writing rules.
  - Current GitHub API metadata checked for the larger source batch before
    adding license/status rows.
  - `rg` checked edited docs for banned voice markers and showed only
    pre-existing lines in repo guides/matrix text, not new product-rule copy.
  - `git diff` reviewed the changed docs. Worktree remains dirty with broad
    pre-existing changes plus this docs slice.

## Storage Impact This Session

- No new assets, dependencies, Notion rows, Slack records, command executions,
  or external project repo files were created in the latest Tony draft
  copy/approval affordance slice.
- Local harness DB `app/cerebro.db` exists at about 9.1M and now includes local
  preview rows created by tests for Terminal Lab/Hedwig observation
  persistence plus local triage/output-summary/task-creation/linkage/follow-up
  task/learning-proposal/source-save/reminder-proposal/message-draft/status
  transition test rows. This DB is local app state, not a generated
  deliverable.
- The app schema now adds local-only Hedwig review metadata columns and richer
  Source History query/display metadata. These are SQLite/libSQL schema/state
  changes only.
- Obsidian storage impact: the existing 2026-05-06 session handoff snapshot and
  session history index were previously refreshed in-place. The closeout model
  is now corrected to append-only unique snapshots. New recovered archive notes
  and the current unique timestamped snapshot were added under
  `90_Archive/CereBro Session History/snapshots/`.
- Latest Workbench grouping slice changed code and tests only:
  `app/server/routers/workbench.ts`,
  `app/client/src/components/WorkbenchPanel.tsx`, and
  `app/server/cerebro-foundations.test.ts`.
- Latest local proposal bundle added:
  - `project_action_drafts` local append-only table.
  - Approval Queue local grouping.
  - Workbench local task/session link pickers.
  - Project Lab proposal-only draft action buttons and inspector queue.
- Latest local drill-down/companion bridge added:
  - Clickable local group cards in Approval Queue and Workbench.
  - Workbench evidence search over validation/source/command metadata.
  - Aang Companion `workbench_evidence` local event count and Keep route.
- Latest Workbench/Project Lab local linking bundle added:
  - Workbench task/session/artifact grouping.
  - Workbench artifact link picker.
  - Broader Workbench local evidence search across linked metadata.
  - Project Lab draft counts/filter/signal cards and append-only draft note history.
- Latest Project Lab draft history bundle added:
  - Append-only `project_action_draft_notes` table.
  - Local draft-note append mutation.
  - Recent draft-note history in Project Lab detail.
  - Drafts inspector note composer.
- No new dependencies, media assets, Notion rows, Slack records, browser
  fetches, command-execution UI, desktop overlay process, or external project
  repo files were created.
- Local Workbench evidence created by tests remains in the local app DB only.
  These are harness test/proposal records, not durable vault deliverables.
- Closeout adds one unique append-only Obsidian handoff snapshot and one session
  history index entry.
- Latest reasoning-router plan slice is docs-only. It adds no dependencies,
  model downloads, API calls, Notion rows, Slack records, browser fetches,
  command execution, media assets, or external repo changes.
- Latest Reddit intelligence plan slice is docs-only. It adds no dependencies,
  Reddit API app, OAuth tokens, source fetches, media downloads, Notion rows,
  Slack records, browser actions, command execution, or vault media files.
- Latest external reference rule fold-in is docs-only. It adds no dependencies,
  no Stitch/v0/Docling installation, no API calls, no generated UI, no parsed
  documents, no Notion rows, no Slack records, no browser actions, no command
  execution, no media assets, and no external repo changes.
- Latest larger source-batch fold-in is docs-only. It adds no dependencies, no
  cloned repos, no scripts, no Docker, no daemons, no model weights, no service
  auth, no generated media, no OSINT search, no stealth browser use, no Notion
  rows, no Slack records, no command execution, and no external repo changes.

## Known Risks

- Worktree was already dirty before this session.
- Aang Companion Overlay is now in the plan, but no desktop app shell exists
  yet. Electron/Tauri/menu-bar helper/web-only prototype still needs a local
  spike before implementation.
- Workbench grouping and validation history are local evidence views only. They
  do not capture browser/media evidence, fetch linked sources, execute linked
  commands, or update the validation status of the original evidence row.
- Workbench now has task/session pickers from local records, but no task/session
  mutation. Relationships remain limited by whatever local records already
  exist.
- Project Lab action drafts are proposal-only local records. They do not create
  tasks, stage approvals, edit repos, browse, run commands, or write externally.
  Future work needs explicit conversion paths if drafts should become tasks.
- Approval Queue grouping is local read-only. It still cannot approve/reject
  anything or execute the queued action.
- Workbench group-card drill-downs depend on local labels and search fields.
  They are useful for inspection, but they are not a full relational query UI
  yet.
- Stitch and v0 are now marked important, but product/service terms still need
  review before any generated code/assets are exported or reused.
- Docling is marked as the preferred document-intelligence candidate, but no
  adapter exists yet. Future implementation must pin parser version, decide
  storage paths, record receipts, and keep Oak validation in the loop.
- Some newly tracked repos returned no license or `NOASSERTION` from GitHub API.
  They remain concept-only until license files and terms are reviewed.
- Maigret and CloakBrowser are deliberately restricted. They should not become
  default CereBro tools.
- VoxCPM and Pixelle-Video imply heavy model/media storage and safety review
  before any install or download.
- Aang's Workbench evidence event is a local Keep route only. It does not send a
  desktop notification, start an overlay process, inspect the screen, or capture
  media.
- Project Lab draft counts make local proposals more visible, but drafts still
  have no approved conversion path to tasks or execution.
- Project Lab draft notes are local history only. They do not update the draft
  itself, create a task, stage approval, or perform work.
- Workbench artifact links read existing artifact rows only. They do not open,
  copy, move, archive, delete, or write artifact files.
- Overlay event policy is not implemented. V1 must decide which local CereBro
  events may wake a bubble and which should badge silently.
- `AGENTS.md` previously described 10 V1 agents; master plan now adds Hedwig as an eleventh scoped Messenger/Comms agent in the Crypts with Piccolo.
- Ollama is not installed or not on PATH, so model testing cannot begin until approved in Session 2.
- 32Gi free is workable for code but tight for heavy local media/model workflows.
- `app/server/agentRouter.ts` now represents Hedwig as the eleventh V1 agent.
  Final Hedwig skills/runtime dispatch still need implementation.
- The proposed model shortlist is based on published Ollama metadata, not local performance measurements.
- Any model download will consume disk under `~/.ollama` unless the model storage path is changed before install/use.
- The new model/tool opportunist direction can become messy if implemented as
  free-tier hopping without evals, privacy review, and validation. Routing must
  be evidence-backed.
- Free-tier limits, model quality, pricing, terms, and prompt recipes change
  often. Surfer must re-check current sources before recommending a model/tool
  route as fresh.
- Reddit access rules, rate limits, public endpoint behavior, subreddit
  moderation, and platform policy can change. The first implementation should
  be conservative, source-link-first, and easy to pause.
- Reddit human signal is valuable but uneven. Oak/Spock must separate lived
  reports, repeated patterns, screenshots, official links, and unverified
  claims before CereBro promotes anything to durable memory or action.
- LiteLLM/OpenRouter/direct-provider/CereBro-native gateway choice remains
  open. Do not install a gateway dependency until security, maintenance,
  provider coverage, and approval logging tradeoffs are reviewed.
- OpenClaw should remain a reference/adapter candidate only. Broad
  desktop/file/message access is a security boundary and must not bypass
  CereBro's permission, memory, router, or validation model.
- Cleanup authority is scan/report only. Piccolo/Hedwig destructive lifecycle enforcement has not been implemented and remains approval-gated.
- Lifecycle metadata now covers the main planned text/metadata surfaces. Binary creative files, screenshots, and browser/source captures still need richer manifest handling once those workflows exist.
- The Piccolo report route is read-only and does not create missing folders or cleanup candidates yet.
- Obsidian app and vault setup are verified.
- Direct shell writes into the Drive vault are outside the repo writable root, but approved app routes can write to the configured vault/Obsidian paths through the running server.
- Existing legacy vault folders `outputs`, `sources`, and `memory` still need a future migration/cleanup decision; do not move/delete them without approval.
- Piccolo Hygiene is visible but still report-only; no cleanup candidate persistence or approval workflow UI yet.
- Artifact Library keeps audit history for repeated saves. It supersedes older current rows, but still displays historical rows in the default all-artifacts view.
- Artifact Library write controls are intentionally simple. Session 4 should add project/client selectors once the project workspace concepts exist.
- Project Lab profiles are currently static code, not persisted in CereBro's DB.
- Project Lab only reads local git state. It does not yet use the GitHub
  connector for remote issue/PR/repo intelligence.
- Project Lab uses absolute local paths for the initial Bowgull project set; if
  a checkout moves, it will show as missing until the profile source is updated.
- Project Intelligence does not yet create tasks, sessions, ceremonies, or
  model-routing decisions. It is a visibility layer only.
- Command intake uses deterministic keyword heuristics, not an LLM classifier.
  It is good enough for a first local preview but will need memory/project
  context and model-assisted classification later.
- Command intake can now create tasks only after the user clicks `Create Task`.
  The task is a lightweight task record, not an agent run or external action.
- Intake-created tasks can now link to harness project rows and display project
  names. Tasks can filter by project, and Project Lab now shows task rollups.
  There is still no session linkage.
- Surfer Sources is still approval-gated. It previews research/source cards and
  can fetch/save one explicitly approved public HTTP/HTTPS URL at a time. It
  still does not crawl, run open web search, browse privately, log into sites,
  screenshot, or save full page text.
- Approved public URL ingestion is intentionally narrow: one user-approved
  public URL at a time. Open web search, crawling, screenshots, authenticated
  browsing, full-page extraction, and richer source validation still need
  separate gated layers.
- Source trust inference is deterministic and heuristic. It is a triage signal,
  not a truth claim; important claims still need Oak/source validation.
- Slack is now required for V1. The proposal-only Hedwig capture router/panel
  now defines the Slack DM/capture-channel shape and Notion capture database
  schema, but no Slack connector/app scopes have been installed, no Notion
  capture database has been created, and no external capture sync has been
  implemented.
- Hedwig now has a first PixelLab static owl PNG, scaled/repacked for bird
  proportions in the Keep. East/west/north are temporary static derivatives,
  not true PixelLab directional rotations. PixelLab reports the `idle-flutter`
  animation completed, but the current MCP/download surface did not expose
  local frame downloads in this session.
- Keep movement now uses chamber/council use-spots, and
  `walking-to-ceremony` uses the first node-by-node graph route into Cortana's
  hub. It is BFS over static edges rather than a full A* / collision-aware
  corridor walker, and regular idle/work movement remains room-local.
- Obsidian session handoff snapshots are now approved append-only standing
  behavior. Future sessions must update the repo handoff first, then write a
  unique timestamped Obsidian snapshot and append a new Obsidian index entry
  without replacing earlier entries.
- Append-only history is now a global CereBro learning law. Logs, history
  indexes, handoff archives, audit trails, command/output history, source
  provenance, approval history, running notes, corrections, and learning trails
  should append or create a unique timestamped version. Canonical current-state
  files such as active plans and `CEREBRO_SESSION_HANDOFF.md` may update in
  place, but they must not be treated as historical archives.
- Vault/Obsidian text writers now enforce a first pass of the law by creating
  timestamped versions on filename collision instead of overwriting same-title
  durable notes/artifacts.
- Artifact Library now exposes that write policy in the UI so users can see
  whether they are saving durable history, a draft trail, or report history.
- Source saves now split current-state and history: `sources` is the current
  source card, and `source_events` is the append-only provenance trail.
- Surfer Sources now displays recent local source history events so provenance
  is visible rather than hidden in the DB. It can filter the local history by
  owner agent or scrubbed-sensitive events, but this is still local metadata
  visibility and not live research/search.
- Handoff Archive candidate detection is heuristic. It intentionally avoids
  treating old Claude Code handoff templates or broad planning docs as session
  closeout snapshots unless the user explicitly selects them later.
- Reusable prompt/tool handoff memory is now in the plan and artifact taxonomy,
  has a first read-only search route, and is surfaced in command intake for
  `prompt_reuse` requests. It is not yet a full chat/runtime retrieval layer,
  and body search only covers the bounded prompt excerpt saved in artifact
  metadata rather than full-text vault indexing.
- Terminal Lab now has a proposal-only UI and command classifier. It still has
  local command-observation persistence and can infer project links from known
  `cwd` values. It can attach manually pasted output summaries to observations,
  link observations to selected tasks/sessions, and show deterministic Aang/Tony
  follow-up suggestions from observed output plus read-only Tony diagnostic
  command drafts. It can also create a normal local follow-up task from an
  observation and stage an Aang learning-note memory proposal. Tony diagnostic
  drafts can now be converted into normal local Terminal Lab previews, with
  parent-observation provenance, only if the command still matches one of
  Tony's generated drafts. It has no PTY bridge and no UI execution path. Any
  real command execution remains through Codex's normal approval-gated tool
  path, and durable memory writes still require Oak/user approval.
- Hedwig Capture Inbox now persists local preview observations and Project Lab
  can show capture counts/snippets for linked projects. Hedwig can now preview
  triage routes for saved captures and explicitly create a local CereBro task
  from a triaged capture. Hedwig can now save a local source record from a
  source-like capture without fetching or validating the URL, and create a
  local reminder proposal from a reminder-like capture without scheduling or
  notifications. Hedwig can also create a local message draft proposal from a
  message-like capture without sending or posting. Hedwig now has local detail
  views and status transitions for source/reminder/message proposals. These
  statuses are local workflow metadata only; they do not approve or perform
  external actions. Hedwig proposal details now include local review metadata
  such as review priority, approval scope, proposed external target, review
  notes, and last-reviewed timestamps, but the fields are not yet a full edit
  workflow or external approval record. It still does not write to Notion, read/post Slack,
  fetch/browse sources, write to calendars, send messages, or write to the
  vault/Obsidian.
- Project Lab activity rollups depend on known project rows. Terminal/Hedwig
  preview calls create/link those rows for known project paths/guesses, but
  older previews made before this slice may remain unlinked.
- Project Lab's new approval rollup is local-only and best-effort. It can count
  approvals tied through known local task/target records, but it will not see
  future approval records that lack a project-bearing task or supported target
  type until the schema gains a first-class `project_id` on approvals.
- The Project Lab Local Inspector is intentionally dense but bounded. It is a
  good first inspection surface, not the final approval inbox UX; future polish
  should add filtering/detail drawers without adding execution or external write
  paths.
- Project Lab Local Inspector tabs/details are UI-only state. They do not
  persist read state, change queue status, or record audit events yet.
- Project Lab project-card filters are UI-only state. The `Attention` filter is
  deterministic and currently means any known project with pending approvals,
  Hedwig captures needing review, blocked/reviewing Terminal observations,
  sensitive source events, or dirty git state.
- Project Lab attention reason badges use the same deterministic signals as the
  `Attention` filter. They are not persisted and should not be treated as audit
  history.
- Project Lab filtered-view sorting is deterministic client-side ordering. The
  Attention weight is a UI heuristic, not a priority decision by Batman/Cortana
  and not an audit record.
- The Project Lab filtered-view summary is computed from the same local data as
  the cards. Its scores/counts are live UI signals, not persisted records or
  priority decisions.
- Project Lab rank badges use the same client-side score as the active filter.
  They are not persisted, audited, or treated as agent priority decisions.
- Project Lab score-breakdown chips explain the same client-side score used by
  the active filter. They are not persisted, audited, or treated as review
  history or agent priority decisions.
- Project Lab signal-block drill-down is local UI navigation only. It should not
  be treated as review history, read state, queue mutation, approval, or command
  execution.
- Project Lab Worktree Changes drill-down is also local UI navigation only. It
  exposes the existing bounded Git inspector rows but performs no git operation.
- Project Lab recent-row drill-downs and row-cap footers are local UI clarity
  features. They are not review history, read state, approval, source fetch,
  external write, or command execution.
- Project Lab Local Inspector search is local in-memory UI state. It is not
  persisted, audited, or connected to external search/browsing.
- Project Lab Local Inspector type chips are also local in-memory UI state. They
  are convenience filters only and not proof of review or approval.
- Project Lab Local Inspector sort controls are local in-memory UI state. They
  are display-only and not review history, priority decisions, or mutations.
- Project Lab Signals strip and Sources filter are client-side read-only
  projections of existing overview data. They do not create source events,
  fetch content, browse/search, or persist priority.
- Project Lab Next Safe Actions strip is also client-side read-only. It exposes
  deterministic safe-next-action text but does not create work, mark review
  state, or trigger actions.
- Project Lab summary-count navigation is client-side view state only. It does
  not refetch external data or perform queue actions.
- Project Lab Local Repos summary reset is also client-side view state only. It
  only returns to the All card filter.
- Project Lab summary/filter accessibility labels are semantics-only. They do
  not add new actions or permission surfaces.
- Project Lab passive summary and empty-state accessibility labels are
  semantics-only. They do not add new actions or permission surfaces.
- Project Lab Local Inspector accessibility labels are semantics-only. They do
  not add actions, review state, read receipts, approval state, or permission
  surfaces.
- Project Lab card drill-down accessibility labels are semantics-only. They do
  not add actions, review state, read receipts, approval state, or permission
  surfaces.
- Project Lab empty-state reset label cleanup is semantics-only. It only
  distinguishes reset navigation from the normal All filter chip.
- Project Lab close/search accessibility labels are semantics-only. They do not
  add actions or permission surfaces.
- Project Lab close-button type hygiene is semantics-only. It does not add
  actions or permission surfaces.
- Project Lab region accessibility labels are semantics-only. They do not add
  actions, review state, read receipts, approval state, or permission surfaces.
- Project Lab status live-region semantics are semantics-only. They do not add
  actions, review state, read receipts, approval state, or permission surfaces.
- Project Lab non-interactive list semantics are semantics-only. They do not add
  actions, review state, read receipts, approval state, or permission surfaces.
- Project Lab busy-state semantics are semantics-only. They do not add actions,
  review state, read receipts, approval state, or permission surfaces.
- Keep left-rail navigation accessibility labels are semantics-only. They do
  not add actions, review state, read receipts, approval state, or permission
  surfaces.
- Bundled Keep shell accessibility/HTML hygiene is semantics-only. It does not
  add actions, review state, read receipts, approval state, execution, external
  writes, or permission surfaces.
- Project Lab Next Safe Action reason chips reuse existing local attention
  signals. They are explanatory only, not audit history or priority decisions.
- Project Lab empty-filter state is local UI only. It is not a data change or
  signal that a queue was reviewed.
- Project Lab Missing filter is local existence view state only. It does not
  clone, fetch, create, delete, or repair repositories.
- Project Lab inspector default queue selection is deterministic client-side
  convenience. It should not be treated as triage history or proof that a queue
  was reviewed.
- Obsidian cleanup was intentionally limited to three confirmed empty/stub root
  files after user approval. Session history snapshots and index notes were
  left untouched.
- Project Lab Local Inspector context display is improved, but the panel is
  still dense. Future UI polish can tune the inspector height, mobile behavior,
  and horizontal overflow without adding actions.
- Project Lab Git inspector rows are read-only snapshots from local
  `git status --short --branch`. They are not review history, are not an
  approval surface, and must not grow stage/commit/reset/pull/push buttons
  without explicit approval.
- The new `nextSafeAction` text is deterministic queue triage, not an agent
  decision. It deliberately prioritizes pending approvals, blocked/reviewing
  Terminal observations, Hedwig review queues, sensitive source events, active
  tasks, open tasks, and dirty git state before falling back to the static
  project next action.
- Keep council/path movement is more stable across repeated state refreshes,
  but the path graph is still a simple static BFS graph and still needs stair
  landing/corridor visual polish.
- Declyne local worktree is dirty; treat it as user work and do not overwrite.
- Sygnalist local `.gitignore` is modified; Bridgefour has an untracked resume docx. Do not clean or move without approval.
- Plaid integration for Declyne is not implemented in the visible files inspected. Treat it as a future planned track requiring careful design.

## Next Recommended Session

Session 4 - Personal Command Center And Project Intelligence, continuation.
The first read-only Project Lab surface, proposal-only command intake router,
proposal-only Surfer Sources panel, and approved one-URL public ingestion lane
are live. Intake-created tasks now link to harness project rows and display
project names when a known project is detected, Tasks can filter by linked
project, and Surfer URL ingestion now stores first-pass trust/scrub metadata.
The build route now also explicitly includes Slack as required V1 Hedwig
capture, Notion as the structured capture database, Obsidian handoff snapshots
with an index note, and Terminal Lab as a modular learning/validation surface.
Terminal Lab observations can now link to tasks/sessions, surface local
Aang/Tony follow-up suggestions from pasted observed-output summaries, and
create normal local follow-up tasks from observations. Recent Terminal Lab
observations can now be filtered by the selected task or session. Terminal Lab
can also stage Aang learning-note memory proposals from observations without
writing durable memory, display read-only Tony diagnostic command drafts
from observed output, provide explicit copy/approval-note affordances for
Tony diagnostic drafts without autonomous UI execution, show saved
diagnostic-preview provenance/status labels, show richer diagnostic-chain
evidence, expected-signal, root, and depth detail, and stage local pending
approval previews for command observations without executing or approving
commands. Hedwig can now save a local source record from a triaged
capture URL without fetching or validating the page, create local reminder
proposals without scheduling or notifying, and create local message draft
proposals without sending or posting. Hedwig proposal details now expose richer
local review metadata, editable local review fields, and pending local
approval-record previews for source/reminder/message proposals, while Surfer
Source History now has owner/scrubbed filters plus richer event detail.
Next, decide whether to:

- Keep the Obsidian session handoff archive current at every closeout:
  update the repo handoff, write the dated snapshot, and update the Obsidian
  session history index.
- Extend Project Lab's read-only integration slice with filtering, per-project
  detail drawers, or local-only approval dashboard views. Keep it
  proposal-only: no command execution, external repo edits, Notion/Slack writes,
  browser/search, or source fetching from Project Lab.
- Polish the new Project Lab Local Inspector: add local filters by queue type,
  better truncation/detail affordances, or a single local approval-dashboard
  view that still does not approve, execute, browse/search, send, fetch, or
  write externally.
- Add optional read-only row detail routes only if the inspector needs richer
  context than the current bounded local metadata. Keep status changes and
  approval decisions out of Project Lab until the user explicitly asks for an
  approval workflow.
- Consider adding a compact "why shown" badge for the `Attention` project-card
  filter so each visible project explains which local queue brought it into the
  view.
- The attention "why shown" row is now live; future polish can improve wording
  or add visual severity ordering, but keep it read-only.
- Filtered Project Lab views now have first-pass visual severity ordering.
  Future polish can tune the weights or expose them in a help/detail surface,
  but should keep the view read-only until an approved workflow exists.
- Consider moving repeated Project Lab signal scoring/types into a small local
  helper if the panel grows further; keep the current implementation local while
  this surface is still settling.
- If Project Lab ranking becomes more than a visual aid, move the scoring
  policy into a named server/API contract and have Batman/Cortana explicitly
  label it as a strategy proposal. For now it remains UI-only.
- Future inspector polish can remember the user's last selected queue per
  project, but only as local UI preference unless an explicit audit/read-state
  model is designed.
- Obsidian vault root is currently clean after approved deletion of the three
  empty/stub files. Continue using append-only session snapshots under
  `90_Archive/CereBro Session History/snapshots/`.
- Project Lab Local Inspector readability polish was verified in the in-app
  browser at `http://localhost:3002/`; dev server is running on port 3002.
- Project Lab Git inspector is now live and was verified in the in-app browser:
  the `Dirty` filter opens the inspector on the `Git` tab with local status
  rows. Keep it read-only/proposal-only.
- Project Lab filtered cards now show local score-breakdown chips. Future polish
  can tune wording or move scoring into a named strategy proposal, but do not
  treat the current chips as persisted priority or review history.
- Project Lab signal blocks now open their matching Local Inspector queue. Future
  polish can add similar local-only drill-down for dirty worktree rows, but keep
  git operations out of the UI unless explicitly approved.
- Project Lab Worktree Changes now opens the Git inspector directly. Future
  polish should improve read-only review ergonomics, not add git operations.
- Project Lab inspector lists now disclose when a queue is capped at 12 visible
  rows, and recent card rows open matching inspector queues. Future work can add
  richer local-only filtering/searching inside the inspector.
- Project Lab Local Inspector now has local-only search. Future work can add
  safe sort/group controls or per-queue filter chips, still without action
  buttons or external side effects.
- Project Lab Local Inspector now also has local type chips plus Reset for active
  queue filters. Future work can add sort controls or saved local preferences
  only if a read-state/audit model is explicitly designed.
- Project Lab Local Inspector now also has local sort controls. Future work can
  add saved local preferences only if a read-state/audit model is explicitly
  designed.
- Project Lab now has a Sources project-card filter and a local Signals strip.
  Future work can add richer source review affordances, but source fetching and
  external browsing remain gated.
- Project Lab now has a top Next Safe Actions strip. Future work can add
  proposal-only action drafts, but actual execution/approval remains out of
  Project Lab until explicitly designed.
- Project Lab top summary counts now navigate to matching local filters. Future
  polish can make all dashboard/count surfaces consistently navigable while
  keeping them read-only.
- Project Lab Next Safe Actions now expose compact local reason chips. Future
  polish can improve density/responsiveness, but keep the strip explanatory.
- Project Lab empty-filter states now offer a safe return to All plus local
  signal chips. Future polish can tune copy per filter.
- Project Lab Missing filter is now first-class and wired from the top Missing
  summary count. Future polish can improve missing-path remediation proposals,
  but keep actual clone/fetch/create/repair operations outside Project Lab
  until explicitly approved.
- Project Lab top Local Repos count now resets the project-card view to All.
  Future polish can make the remaining passive summary cells explain why they
  are not clickable.
- Project Lab summary/filter controls now have clearer accessible names and
  active filter state. Future polish can add visible focus styling refinements
  if the current ring is too subtle in the Keep palette.
- Project Lab passive summary cells and empty-filter controls now also have
  clearer accessible labels. Future polish can continue this pattern across
  inspector row controls.
- Project Lab Local Inspector controls now also have clearer accessible labels
  and active states. Future polish can add the same treatment to Project Lab
  card-level recent rows and signal blocks if needed.
- Project Lab card-level drill-down controls now also have clearer accessible
  labels. Future polish can tune visible focus states and wording, but the
  current behavior remains read-only local navigation.
- Project Lab empty-state reset naming now distinguishes reset from filter
  selection. Future polish can tune visible labels if the concise `All` button
  proves unclear.
- Project Lab close/search controls now have direct accessible names. Future
  polish can apply this same pattern to other panels before broader workbench
  routing lands.
- Project Lab top Close button now explicitly uses `type="button"`. Future UI
  hygiene passes can scan other panels for the same form-safety pattern.
- Project Lab main panel, project cards, and inspector panes now have clearer
  accessible region labels. Future polish can continue this pattern across the
  broader Keep panels.
- Project Lab filter summaries and inspector row counts now use polite status
  semantics. Future polish can tune which dynamic counters should announce
  changes if the UI becomes too chatty.
- Project Lab current task rows and worktree change rows now expose list
  semantics. Future polish can continue this pattern for other non-interactive
  repeated metadata groups.
- Project Lab and Local Inspector regions now expose busy state. Future polish
  can carry this pattern into other panels that load local queues.
- Keep left-rail nav buttons now have accessible names in collapsed icon mode
  and expose the active section with `aria-current`. Future polish can scan the
  remaining top-bar/context buttons for the same explicit label/type pattern.
- Keep top-bar controls, floor selector, command bar, context session selectors,
  and shell landmarks now have clearer accessible labels/states and explicit
  button types. Future bundled passes can apply the same pattern to individual
  panels such as Hedwig, Terminal Lab, Sources, Outputs, Tasks, and Memory.
- Keep the Aang Companion Overlay in the route now. First pass should be a
  narrow design/spike: desktop shell choice, allowed local events, click/hotkey
  quick ask, open-Keep routing, park/sleep/mute controls, and lore-accurate
  quiet idle states. Do not build external notifications, Slack/Notion writes,
  screen reading, or private app automation into the overlay without explicit
  approval.
- The master plan now explicitly requires a modular in-app workbench function.
  Session 12 owns the core surface and MVP: live localhost preview, public
  browser, captured screenshots, uploaded/generated images, video/key frames,
  annotation tools, send-to-agent routing, terminal/log output, validation
  notes, evidence ledger, and before/after comparisons. Session 10 owns
  image/video review and generation planning. Session 11 owns the agent-readable
  evidence records, approval gates, and self-review permissions.
- The master/model-router plans now explicitly require the reasoning-router
  direction: a Model/Tool Capability Registry, Surfer's current model/tool/free
  tier discovery lane, a Reasoning Gateway decision, prompt/tool routing
  playbooks, eval-backed routing, cost/rate-limit logs, and validation loops.
  Start proposal-only: no gateway install, model download, provider account,
  API key, external call, or OpenClaw integration until the route and approval
  surface are reviewed.
- Extend the lightweight reusable prompt/tool handoff memory flow beyond command
  intake: add project/source/reason metadata fields, better ranking, and a
  conversational reuse path that says "which prompt" and "why" before any
  external tool/model use.
- Review and approve or revise the proposal-only Notion capture database schema
  and Slack connection shape surfaced in Hedwig Capture Inbox.
- Retrieve and wire Hedwig's PixelLab `idle-flutter` animation frames once an
  exposed frame/download endpoint is available.
- Replace temporary Hedwig directional derivatives with true PixelLab
  directional rotations if a suitable character/object workflow is approved.
  Add matching Hedwig floor/wall assets.
- Polish path-graph walking: add corridor/landing waypoints where stairs
  visually connect, avoid wall-band shortcuts, tune travel speed per sprite
  size, and add visible path/debug toggles only if useful.
- Extend Terminal Lab safely: add a fuller local-only detail inspector for one
  observation, group diagnostic chains, or add Oak/Spock validation preview
  notes before command approval. Keep UI execution disabled and keep
  package/GitHub/network actions approval-gated.
- Extend Hedwig safely: add better filtering/sorting for local proposals,
  duplicate capture detection, or a local-only approval dashboard. Keep
  Notion/Slack writes gated until exact schema/scopes are approved.
- Implement append-only learning policy in code surfaces: make sure future
  logs, running notes, command/output history, approval records, source
  provenance, cleanup history, and prompt/tool handoff history append or version
  instead of overwriting, while current-state summaries remain editable.
- After approval, add `NOTION_CAPTURE_DATABASE_ID` support and an explicit
  approved Notion capture writer. Do not create/write the database until the
  user approves the exact schema and Notion workspace target.
- After approval, install/configure Slack app scopes for Hedwig DM and/or one
  capture channel. Do not connect Slack until the user approves exact scopes and
  surfaces.
- Add approved open-web search to Surfer Sources.
- Add richer source extraction/validation beyond the current metadata and
  summary scrubber.
- Add a proposal-only Reddit Intelligence design slice before fetching Reddit:
  subreddit watchlist model, source record schema additions, media-reference
  manifest shape, trend-radar scoring, source-confidence criteria, and approval
  gates for public capture vs OAuth setup.
- Add a local-only "save Reddit item" preview path through Hedwig that accepts a
  pasted Reddit URL and stages a source proposal without fetching, downloading,
  writing Notion/Slack, or promoting memory.
- Persist project profiles/status snapshots into the harness DB.
- Add session linkage to Tasks and Project Lab.
- Extend Project Lab action drafts with richer draft detail, conversion-to-task
  proposals, or project-specific templates. Keep draft-to-task conversion
  explicit and keep repo edits out of Project Lab.
- Project Lab action drafts now remain visible by profile slug before a harness
  project row exists. Future draft work can add explicit draft-to-task
  proposals, but should keep task creation separate from draft creation.
- Bring GitHub connector data into Project Lab after explicit approval for the
  read scope.

Keep Piccolo read-only until cleanup rules are approved. Do not edit external
project repos without an explicit project-specific request.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_MODEL_ROUTER_BASELINE.md, and CEREBRO_FILE_LIFECYCLE_PLAN.md first. Continue Session 4 from the live Project Lab, command intake, Surfer Sources, prompt/tool handoff memory, Hedwig Capture Inbox, Hedwig-as-agent Keep slice, Terminal Lab, Approval Queue, first runtime use-spot/path-graph movement, Aang Companion policy shell, Workbench policy shell, the new global append-only learning law, the new general image-understanding requirement, the new global permission-mode direction, the new reasoning-router/model-tool opportunist direction, the new Reddit Intelligence source lane, and the expanded external reference rule fold-in: Uncodixfy is standing anti-generic UI judgment, Google Stitch is high-fidelity UI exploration only, v0.app is disposable React/Tailwind component scaffolding only, Docling is the preferred local document-intelligence candidate once an adapter exists, local-deep-research and ppt-master are strong adapter candidates after review, agent-harness repos feed Tony/Spock/Oak runbooks before runtime changes, Pixelle-Video and VoxCPM are parked media adapters, and Maigret/CloakBrowser are restricted by default. Project Intelligence currently has static read-only profiles, local git status, Batman strategy support, deterministic command-intake previews, explicit intake-to-task creation with project linking/project-name display, Tasks project filtering, Project Lab task rollups, Project Lab read-only Git inspector rows for dirty worktrees, Project Lab filtered-card score breakdown chips, Project Lab local signal-block drill-down into inspector queues, Project Lab worktree drill-down into the Git inspector, Project Lab recent-row drill-downs, capped-list disclosure, local inspector search, type chips, sort controls, Signals strip, Sources filter, Missing filter, Local Repos reset-to-All navigation, accessible summary/filter button labels, passive summary and empty-state accessibility labels, Local Inspector accessibility labels, card drill-down accessibility labels, distinct empty-state reset label, close/search accessibility labels, close-button type hygiene, region accessibility labels, status live-region semantics, non-interactive list semantics, busy-state semantics, Keep left-rail and shell accessibility labels, Next Safe Actions strip, Next reason chips, summary-count navigation, empty-filter state, and local action drafts that remain visible by profile slug before a linked harness project row exists, Terminal Lab/Hedwig local observation rollups, self/system improvement categories, a modular panel model, a Surfer source panel scaffold, a local-only Model Tools panel for capability proposals, eval notes, and route previews, a global permission-mode shell with append-only local mode events, advisory permission preflight checks, append-only permission preflight audit records, and a shared server permission-policy helper used by both the Permissions router and Workbench evidence records, a read-only local Approval Queue with status/origin/project/search filters, local grouping, deterministic Oak/Spock preflight notes, and read-only permission preflight audit visibility, a proposal-only Workbench shell with evidence surfaces/permission classes/append-only evidence record shape plus local Workbench evidence record create/list/filter/detail, linked permission preflight ids and preflight detail on evidence records, validation notes that record their own local permission preflight rows, local evidence grouping by project/kind/source/command/validation status, source/command/task/session/artifact picker labels, task/session/artifact grouping, and append-only validation history in the evidence inspector, a proposal-only Aang Companion shell policy with allowed local events/blocked actions/web-mock-first route plus live local event-count strip, approved one-URL public ingestion, first-pass saved-source trust/scrub metadata, Reddit marked as a first-class V1 human-signal source lane, Slack marked as required V1 Hedwig capture, Notion marked as the structured capture database, Obsidian session handoff snapshots/index notes are approved append-only standing closeout behavior, and global history/log/archive/index/note trails must append or version while canonical current-state summaries may update in place. CereBro must understand images as a general input type, not only creative assets or setup screenshots: the user should be able to drag in screenshots, UI states, account screens, app errors, artwork, mockups, diagrams, photos, charts, whiteboards, generated images, and other still images, then ask open-ended questions about them. Video starts with frame/key-frame understanding and annotation. The modular in-app workbench is now a locked product direction: CereBro should show live localhost previews, public browser views, screenshots, images, video/key frames, annotations, terminal/log output, validation notes, and before/after comparisons inside the app; these surfaces are user-visible and agent-readable evidence, not hidden background tools. Add a Codex-like global permission-mode control across all work, not just media: `Default permissions`, `Auto-review`, and `Full access`. Default reads explicit user-provided context and guides. Auto-review proactively inspects approved visible/local evidence and queues suggestions. Full access uses enabled tools in the session, while hard gates still require visible approval for payments, account permission grants, destructive commands, deleting/overwriting files, sending messages, publishing, uploading private media externally, saving sensitive screenshots to memory, installs, tokens/API keys, and sealed Raven/NSFW scope. Vault/Obsidian durable text writers now create timestamped versions on same-title filename collision instead of overwriting, Artifact Library labels its saves as durable history/draft/report trails rather than current-state overwrites, source saves now split current-state `sources` rows from append-only `source_events` provenance, and Surfer Sources displays recent source history events with local owner/scrubbed filters and richer event detail. Aang Companion Overlay is planned as a small always-on desktop surface and now has a proposal-only Keep policy panel for keeping tabs on CereBro: ambient idle presence, click/hotkey quick ask, short status bubbles, open-Keep routing, time-of-day reactions, and quiet lore-accurate idle loops such as goofy fidgeting, tiny airbending practice, sitting, breathing, balancing, and sleepy states. Aang remains an agent, not a pet in the roster. Cortana still routes requests, Hedwig still owns capture/reminders, and Piccolo still owns hygiene. Terminal Lab is a proposal-only panel/router that classifies commands, explains risk, records local preview observations, infers known project links from cwd, accepts manually pasted observed-output summaries with light redaction, can link observations to selected tasks/sessions, filters observations by selected task/session, surfaces deterministic Aang/Tony follow-up suggestions from observed output, surfaces read-only Tony diagnostic command drafts, can convert one of Tony's generated diagnostic drafts into a normal local Terminal Lab preview with parent/root/depth provenance, has copy/approval-note affordances for Tony diagnostic drafts, shows parent-observation provenance and a diagnostic-preview status label on saved diagnostic previews, includes explicit diagnostic evidence and expected-signal notes for Tony draft commands across port conflicts, missing modules/packages, TypeScript symbol errors, package-tool failures, git state, missing files, permission errors, and unclear non-zero exits, supports local observation detail/status transitions, can stage pending local approval-preview rows for command observations without approving or executing commands, can create normal local follow-up tasks from observations, can stage Aang learning-note memory proposals from observations, and never executes commands or writes durable memory directly. Reusable prompt/tool handoffs can be saved as approved vault artifacts, searched read-only, and surfaced in command intake for `prompt_reuse` requests with required reuse disclosure. CereBro must now grow this into a routing playbook tied to the Model/Tool Capability Registry: target model/tool, prompt style, example result, privacy constraints, free-tier sufficiency, eval notes, source URLs, and failure notes. Surfer should propose current models/tools/free tiers only with sources and date checked; Cortana routes; Batman risk-reviews; Spock/Oak validate; Piccolo tracks stale registry entries, cost/rate limits, and storage. Candidate gateway/eval paths include LiteLLM, OpenRouter, direct provider SDKs, a CereBro-native gateway, promptfoo, DeepEval, and custom Vitest fixtures, but do not install or connect any of them without approval. Hedwig has a proposal-only Inbox panel with Notion capture DB schema, Slack DM/capture-channel shape, approval gates, routing rules, local capture preview persistence, recent capture history, read-only triage proposals for saved captures into task/source/learning/reminder/message routes, an explicit `Create Local Task` action that links a capture to a normal local CereBro task without external writes, an explicit `Save Source` action that creates a local unfetched source record plus source event from a capture URL without browsing/fetching, an explicit `Create Reminder Proposal` action that creates a local reminder proposal without scheduling/notifying, an explicit `Create Message Draft` action that creates a local draft proposal without sending/posting, local proposal detail/status transitions for source/reminder/message proposals that remain metadata-only and do not approve external action, editable local review fields for priority/notes/approval scope/external target, and pending local approval-preview rows for source enrichment, Notion capture write, Slack capture read, reminder scheduling, and message sending without approving or executing those external actions. The Approval Queue reads those Hedwig and Terminal approval-preview rows across local surfaces, joins them back to project/task/source/command/capture metadata when available, and still cannot approve, reject, execute, fetch, send, schedule, or write. The Workbench panel defines preview/browser/media/annotation/terminal/validation/comparison surfaces, can create manual local append-only evidence records, filter/group/inspect evidence details, link sources/commands/tasks/sessions/artifacts, append validation notes, show validation history, and does not open tools; the Aang panel defines event policy, local mock controls, live local event counts, and in-app event routing buttons but starts no desktop process. Hedwig is now the 11th agent in router/Keep metadata with a split Crypts Messenger Roost, scaled PixelLab owl sprite, motion config, use-spots, council spot, and path-graph node, and KeepScene now loads directional textures, uses idle/hero/council use-spots for actual movement, swaps facing frames, keeps emotes attached to moving sprites, routes `walking-to-ceremony` through a first BFS path graph into Cortana's hub, and avoids restarting movement tweens when state refreshes do not change an agent state. Do not emphasize session handoffs as a big UI surface; they live in Obsidian. Start proposal-only or implement a small safe slice: continue auditing code surfaces for accidental overwrites of logs/history/notes, add current-state writer proposals only where truly needed, deepen Approval Queue drill-downs or grouping without adding action execution, build the web-only Aang Companion mock inside the Keep without desktop permissions, deepen Workbench task/session linking and validation status display while keeping validation append-only before wiring browser/media automation, prototype image drag/drop artifact intake as temporary-by-default, define the hosted/local vision adapter interface without sending images externally, define a Docling document-intake adapter plan with parser receipts before installing anything, extend Project Lab local action draft history with status/version trails or add explicit draft-to-task proposals without edits, retrieve and wire Hedwig's PixelLab idle-flutter animation frames if an exposed endpoint is available, replace temporary Hedwig directional derivatives with true PixelLab owl rotations, polish path-graph walking with stair/landing waypoints, revise/approve Hedwig schema details, add approved Notion capture writer only after approval, richer reusable prompt/tool handoff metadata and ranking, proposal-only Reddit Intelligence design, local-only Hedwig Reddit URL save previews, approved open-web search, richer source extraction/validation, project profile persistence, or session linkage. At closeout, update `CEREBRO_SESSION_HANDOFF.md`, save a unique timestamped Obsidian snapshot to `90_Archive/CereBro Session History/snapshots/`, and append a new link to `90_Archive/CereBro Session History/CereBro Session History.md` without overwriting any prior snapshot/index entry. Do not write to Notion/Slack or edit external project repos without explicit approval, and do not move/delete existing vault or repo files.
```

## 2026-05-08 2134 EDT — Raven private boundary backend

What changed:

- Raven was explicitly prioritized by the user, with privacy as the main
  constraint.
- Added a backend-only Raven sealed module slice. No Keep frontend files were
  touched because another agent is working that surface.
- Added `raven_private_sessions` and `raven_private_events` tables to the
  harness schema. Raven private data stays out of core memory, Notion,
  Obsidian, Slack, source records, and normal outputs.
- Added `app/server/routers/raven.ts` with:
  - `status`
  - `requestUnlock`
  - `confirmUnlock`
  - `addPrivateEvent`
  - `recentEvents`
  - `lock`
- Wired the Raven router into `app/server/routers.ts`.
- Added a foundation test proving the exact two-phrase unlock, private event
  write, readback, and lock flow.

Files touched in this slice:

- `app/server/cerebroDb.ts`
- `app/server/routers.ts`
- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm vitest run server/cerebro-foundations.test.ts`
- `pnpm check`

Known risks:

- The Raven router is backend-only. There is no UI entry point yet.
- Unlock state is local DB state. It is not a production auth boundary.
- Adult media fetch, private browser sessions, source scanning, downloads,
  generator calls, and external writes remain blocked.
- The repo has a large dirty frontend worktree from other active work. Keep
  future Raven frontend work isolated until that edit surface is clear.

Storage impact:

- Adds local libSQL tables for Raven private session metadata and private event
  records.
- Writes no Raven data to Obsidian or core CereBro memory.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and the Raven section in CereBro_V1_Full_Companion_Build_Docs.md first. Continue Raven from the backend-only private boundary slice. Do not touch Keep/frontend files until the other frontend agent's work is reconciled. Build the next safe Raven layer as local-only backend capability: active-session guard helpers, private preference categories, event redaction/scrub receipts, and an explicit bridge/export proposal shape that does not write core memory unless approved. Keep browser sessions, adult source scanning, media downloads, generator calls, Notion, Obsidian, Slack, and external model calls blocked.
```

## 2026-05-08 2137 EDT — Raven keep-building trigger

What changed:

- Added the Raven equivalent of the Tony `keep building` intake route.
- While a Raven private session is active, command intake now treats
  `keep building`, `' keep building`, and `’ keep building` as a Raven
  continuation trigger.
- The preview category becomes `raven_build`, `sealedModule` is `raven`, and
  `trigger` is `keep_building`.
- The route includes Raven, Spock, Oak, Batman, and Cortana. It keeps the
  sealed-module gates explicit.

Files touched in this slice:

- `app/server/routers/commandIntake.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- The trigger depends on an active Raven private session. If Raven is locked,
  `keep building` falls back to the normal project-build path.
- This is still command-intake routing only. It does not create a frontend
  Raven panel or execute work automatically.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/commandIntake.ts first. Continue Raven routing from the active-session `keep building` trigger. Keep the route backend-only unless the frontend agent's work is reconciled. Add local-only Raven preference categories, redaction receipts, and bridge/export proposals next. Keep browser sessions, source scanning, media downloads, generator calls, Notion, Obsidian, Slack, core-memory export, and external model calls blocked.
```

## 2026-05-08 2145 EDT — Raven private preference and bridge proposal layer

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added local-only Raven private preference records.
- Added local-only Raven scrub receipts with SHA-256 source hashes, scrubbed
  bodies, and finding labels. The receipt stores redacted text and does not
  export anything.
- Added local-only Raven bridge export proposals. These are proposal records
  only. They require explicit user approval before any core memory, Obsidian,
  Notion, Slack, task, or artifact write.
- Added Raven router endpoints:
  - `preferenceCategories`
  - `addPreference`
  - `scrubPrivateText`
  - `proposeBridgeExport`
- Expanded the Raven foundation test to cover preference capture, scrubbed
  sensitive text, and proposal-only bridge export behavior.

Files touched in this slice:

- `app/server/cerebroDb.ts`
- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Scrubbing is deterministic and simple. It catches common emails, phone
  numbers, URLs, local user paths, and secret-like key/value strings, but it is
  not a full privacy classifier.
- Bridge proposals do not yet have status transitions or approval queue
  surfacing.
- No frontend Raven surface exists yet.

Storage impact:

- Adds `raven_private_preferences`, `raven_scrub_receipts`, and
  `raven_bridge_export_proposals` to local libSQL.
- Does not write Raven private data to core memory, Obsidian, Notion, Slack, or
  external systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from the private preference and bridge proposal layer. Keep it backend-only unless the frontend worktree is reconciled. Add proposal status transitions, Approval Queue read-only visibility for Raven bridge exports, and stronger scrub classifications next. Do not approve, export, browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2153 EDT — Raven approval visibility and scrub classes

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Strengthened Raven scrub receipts:
  - Findings now include labels, severity, and replacement markers.
  - Receipts expose `findingLabels` and aggregate `severity`.
  - Added detection for secret-like text, financial IDs, government IDs, and
    IP addresses in addition to email, phone, URL, and local path.
- Raven bridge export proposals now stage a pending local approval preview in
  the normal `approvals` table.
- Approval Queue read-only backend now recognizes Raven as an origin and labels
  `raven_bridge_export_proposal` targets.
- Added Raven bridge proposal listing and status transitions:
  - `bridgeProposals`
  - `updateBridgeProposalStatus`
- Status transitions do not approve or export anything.

Files touched in this slice:

- `app/server/routers/raven.ts`
- `app/server/routers/approvals.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Approval Queue UI has not been touched in this slice. The backend now returns
  Raven origin records, but frontend filter options may need a follow-up once
  the frontend worktree is reconciled.
- Scrub detection is still deterministic pattern matching, not full privacy
  reasoning.
- `blocked_by_hard_gate` preflight records are expected for Raven bridge
  exports because sensitive sealed-module persistence cannot be approved by a
  mode setting.

Storage impact:

- Raven bridge proposals now also create local `approvals` and
  `permission_preflight_records` rows.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md, app/server/routers/raven.ts, and app/server/routers/approvals.ts first. Continue Raven from approval visibility and scrub classes. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add read-only Raven proposal detail receipts with linked scrub receipt + approval preview, add cancellation reason/history, and optionally add frontend filter support for Raven in ApprovalDashboardPanel only after checking the other frontend agent's work. Do not approve, export, browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2156 EDT — Raven proposal detail and history

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added `raven_bridge_export_history` as an append-only local history table for
  bridge export proposal state changes.
- Added `raven.bridgeProposalDetail` to return a private read-only receipt:
  - proposal
  - linked scrub receipt
  - linked source event
  - linked approval preview
  - linked permission preflight
  - proposal history
- `raven.updateBridgeProposalStatus` now accepts an optional reason and writes
  a history row.
- Cancelling or rejecting a Raven bridge proposal also marks its pending local
  approval preview as `cancelled` or `rejected`. This is still local metadata,
  not export approval.
- Cleaned scrub receipt event text so finding labels render plainly.

Files touched in this slice:

- `app/server/cerebroDb.ts`
- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Approval Queue frontend still has not been touched. Raven is backend-visible
  in the queue route, but the panel may need filter UI support after frontend
  reconciliation.
- History is append-only for proposal state changes from this point forward.
  Proposals created before this slice may not have creation history rows.

Storage impact:

- Adds `raven_bridge_export_history` to local libSQL.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from proposal detail and history. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add read-only private preference rollups and recommendation seed summaries derived only from raven_private_preferences/events, with no external sources, browser, media, generators, Notion, Obsidian, Slack, or core memory export.
```

## 2026-05-08 2159 EDT — Raven private preference rollups

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added `raven.preferenceRollup`.
- Rollups are derived only from `raven_private_preferences`.
- Each category returns total signals, total weight, confidence, top signals,
  avoid signals, and latest timestamp.
- Added local recommendation seed summaries from private preference rollups.
  These are hints only. They do not fetch media, browse, call a model, or write
  anywhere.
- Expanded the Raven foundation test to cover positive signals, avoid signals,
  recommendation seed source labels, and no-external-action gates.

Files touched in this slice:

- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Rollups are simple deterministic summaries. They do not yet account for
  decay, contradiction, or source trust.
- Recommendation seeds are not recommendations. They are private local prompts
  for a future Raven ranker.

Storage impact:

- No schema change.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from private preference rollups. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add contradiction/decay metadata to read-only rollups or create a local-only recommendation candidate draft table that stores no media and uses only Raven private preference/event metadata. Do not browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2202 EDT — Raven local recommendation candidates

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added `raven_recommendation_candidates`.
- Added `raven.draftRecommendationCandidates`, which creates text-only local
  draft candidates from `raven_private_preferences`.
- Added `raven.recommendationCandidates` for private read-only listing.
- Added `raven.updateRecommendationCandidateStatus` for local status changes:
  `draft`, `kept`, `passed`, `hidden`.
- Candidate drafts store no URLs, no media paths, no fetched source content,
  and no generated media. They store seed category, seed text, rationale,
  confidence, linked private preference ids, and status.
- Expanded the Raven foundation test to cover candidate draft/list/status
  behavior and no-external-action gates.

Files touched in this slice:

- `app/server/cerebroDb.ts`
- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Candidate generation is deterministic and basic. It does not yet include
  decay, contradiction detection, or ranking beyond preference weights.
- Candidate status changes are local metadata only.

Storage impact:

- Adds `raven_recommendation_candidates` to local libSQL.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from local recommendation candidates. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add contradiction and decay metadata to preference rollups and candidate drafting, using only local Raven private preference/event metadata. Do not browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2204 EDT — Raven contradiction and decay metadata

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added computed `contradictionState` to Raven preference rollups.
- Added computed `decayBucket` and `decayedWeight` to Raven preference rollups.
- Recommendation seed summaries now carry contradiction and decay metadata.
- Recommendation candidate rationale now includes contradiction and decay
  labels.
- Expanded the Raven foundation test with a mixed positive/avoid signal so the
  contradiction path is covered.

Files touched in this slice:

- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Decay is based on broad age buckets: fresh, stable, stale. It is deliberately
  simple and local.
- Contradiction is category-level only. It detects mixed positive and negative
  signals in the same category, not semantic opposites.

Storage impact:

- No schema change.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from contradiction and decay metadata. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add local-only candidate detail receipts with linked source preferences and rollup context, then add status history for recommendation candidates. Do not browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2206 EDT — Raven candidate detail and history

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added `raven_recommendation_candidate_history`.
- Added `raven.recommendationCandidateDetail`.
- Candidate detail returns:
  - candidate
  - linked source preferences
  - local rollup context
  - status history
- `raven.updateRecommendationCandidateStatus` now accepts a reason and appends
  candidate history.
- Candidate creation now writes an initial `draft` history row.
- Expanded the Raven foundation test to cover candidate detail, source
  preference linkage, rollup context, and history reasons.

Files touched in this slice:

- `app/server/cerebroDb.ts`
- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Candidate detail receipts are backend-only. No UI has been touched.
- Source preference ids are resolved from local Raven preferences only.

Storage impact:

- Adds `raven_recommendation_candidate_history` to local libSQL.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from candidate detail and history. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add a local-only candidate review queue summary with counts by status, contradiction, decay, and confidence. Do not browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2208 EDT — Raven candidate queue summary

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added `raven.recommendationCandidateQueueSummary`.
- The summary counts local Raven recommendation candidates by:
  - status
  - confidence
  - contradiction state
  - decay bucket
- The endpoint also returns one lightweight row per candidate with its status,
  confidence, contradiction state, decay bucket, and seed category.
- Expanded the Raven foundation test to cover queue summary counts and
  no-external-action gates.

Files touched in this slice:

- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm check`
- `pnpm vitest run server/cerebro-foundations.test.ts`

Known risks:

- Queue summary is backend-only.
- Counts are recomputed from local preference and candidate metadata on read.

Storage impact:

- No schema change.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from candidate queue summary. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add a local-only Raven review action planner that suggests deterministic next actions for candidates based on status, contradiction, decay, and confidence. Do not browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```

## 2026-05-08 2210 EDT — Raven candidate review planner

What changed:

- Continued from the shorthand `'` keep-building trigger.
- Added `raven.recommendationCandidateReviewPlan`.
- The review planner returns deterministic local suggestions per candidate
  based on status, contradiction state, decay bucket, and confidence.
- Possible actions include:
  - `leave_closed`
  - `hold_for_future_private_review`
  - `ask_private_clarifying_question`
  - `refresh_private_preference`
  - `queue_private_preview`
  - `collect_one_more_signal`
  - `keep_as_low_confidence_draft`
- Expanded the Raven foundation test to cover kept candidates and mixed
  contradiction candidates in the planner.

Files touched in this slice:

- `app/server/routers/raven.ts`
- `app/server/cerebro-foundations.test.ts`
- `CEREBRO_SESSION_HANDOFF.md`

Checks run:

- `pnpm vitest run server/cerebro-foundations.test.ts`
- `pnpm check` was attempted but blocked by unrelated frontend type errors in
  `app/client/src/components/HedwigInboxPanel.tsx`. That surface belongs to
  the active frontend lane and was not touched.

Known risks:

- Planner actions are local suggestions only. They do not execute, approve,
  export, fetch, browse, generate, or write externally.
- Typecheck cannot be used as a global green signal until the active frontend
  lane fixes the Hedwig panel errors.

Storage impact:

- No schema change.
- No Raven data is exported to core memory, Obsidian, Notion, Slack, browser,
  external model providers, or media systems.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md and app/server/routers/raven.ts first. Continue Raven from candidate review planner. Keep backend-only unless the frontend worktree is reconciled. Next safe slice: add local-only review-note capture for candidate planner decisions, with append-only history and no external writes. Do not browse, fetch adult sources, download media, call generators, write Notion/Obsidian/Slack, or write core memory.
```
