# CereBro Worker Orchestration

Last updated: 2026-05-14

## Purpose

This file defines how CereBro build work is split across a lead agent and
bounded workers.

The goal is larger build blocks without losing order, context, proof, or git
discipline.

## Operating Shape

Default shape:

```text
Lead chat -> chooses block, owns integration, runs checks, updates handoff, commits, pushes.
Frontend worker -> builds one UI surface or one frontend system slice.
Backend worker -> builds one runtime or data-contract slice.
Knowledge worker -> builds one storage, source, Obsidian, Notion, or vault slice.
QA worker -> read-only review when a broad block needs a second pass.
```

Safe concurrency:

- 2 coding workers is normal.
- 3 coding workers is allowed when file ownership is clean.
- 4 workers is allowed only when the fourth worker is read-only QA.
- 1 lead always owns merge order, tests, handoff, Obsidian archive, commit, and push.

Do not run workers as independent product owners. Workers execute assigned
slices. The lead keeps the total build path coherent.

## Active Topology

This is the approved build method until the user changes it.

```text
This chat = Lead / Frontend Integrator
Backend Runtime Worker = route, permission, receipt, and test contracts
Frontend Worker = one visible-loop UI slice with explicit file ownership
Knowledge Worker = read-only or assigned storage/source/Obsidian slice
QA Worker = read-only review when thread capacity allows
```

Default concurrency:

- 1 lead
- 1 frontend coding worker
- 1 backend coding worker
- 1 knowledge or QA read-only worker

Do not exceed 3 active workers unless the user explicitly asks and the thread
limit allows it. If the fourth worker cannot be spawned, QA waits and the lead
does a minimal local verification pass.

The lead integrates in this order:

1. Backend contract.
2. Frontend surface.
3. Knowledge/archive update.
4. QA findings.
5. Checks, handoff, Obsidian, commit, push.

Workers do not update percentages. The lead updates percentages once per pass.

## Long Pass Protocol

Longer passes are allowed when the scope is coherent and the worktree can stay
clean.

Default long pass shape:

```text
1 lead + 1 coding worker + 1 read-only QA worker
```

Use 2 to 4 hours by default. Use 4 to 6 hours only when:

- the task is on the current critical path
- file ownership is explicit
- unrelated dirty files are quarantined
- checks are known and runnable
- no external credentials, paid services, destructive action, deployment, or
  broad product decision is required

Long passes must end with one of these outcomes:

- commit and push a coherent slice
- stop on a failing check with the failure recorded
- stop on a product or permission gate
- summarize and clear when context is getting heavy

Do not keep coding through context bloat.

## Clean Worktree Protocol

Before each pass, the lead classifies `git status --short` into:

- **current slice**: files this pass owns
- **quarantine**: unrelated dirty files left untouched
- **generated/local**: temp outputs that should be ignored or moved to the vault
- **blocked**: files that need user decision before staging

Rules:

- Stage only the current slice.
- Do not mix Raven/backend/reference drift into frontend visible-loop commits.
- Do not stage generated files from `outputs/`; generated deliverables belong in
  the Drive vault unless explicitly approved for the repo.
- If a dirty file is useful but outside the current slice, record it as
  quarantine and continue.
- If a dirty file blocks the current slice, stop and ask.

## Lead Contract

The lead agent must:

- read `AGENTS.md`, `DESIGN.md`, `CEREBRO_MASTER_BUILD_PLAN.md`,
  `CEREBRO_SESSION_HANDOFF.md`, `CEREBRO_FRONTEND_SYSTEM.md`, and
  `CEREBRO_UX_SYSTEM.md` before UI or UX work
- keep the current path ordered as Keep -> Project Lab -> Terminal Lab ->
  Workbench -> Ledger -> Registry -> backend runtime
- assign one bounded slice per worker
- assign file ownership before edits start
- preserve unrelated dirty worktree files
- integrate worker changes in order
- run the correct checks
- update `CEREBRO_SESSION_HANDOFF.md`
- write the dated Obsidian archive snapshot and append the index entry
- commit and push only when the block has useful shape

The lead is the only agent that stages, commits, pushes, or updates the final
session archive unless the user explicitly changes that rule.

## Worker Contract

Every worker receives:

- goal
- lane
- owned files or owned module
- files it may read
- files it must not edit
- checks it should run if it edits code
- stop rules

Every coding worker must be told:

```text
You are not alone in the codebase. Do not revert edits made by others.
Work only inside your assigned files. If another change touches your path,
adapt to it and report the conflict instead of undoing it.
Do not stage, commit, push, or update the session handoff.
```

## Lane Map

### Frontend Worker

Owns CereBro UI and UX implementation.

Primary files:

- `app/client/src/components/**`
- `app/client/src/pages/Home.tsx`
- `app/client/src/lib/**`
- `app/client/src/index.css`
- frontend tests or fixtures when present

Reads:

- `DESIGN.md`
- `CEREBRO_FRONTEND_SYSTEM.md`
- `CEREBRO_UX_SYSTEM.md`
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`

Priority order:

1. Keep-first UX spine.
2. Project Lab as map.
3. Terminal Lab as Aang teaching lane.
4. Workbench as visual proof.
5. Ledger as receipts.
6. Basement model/tool registry.
7. Animation and polish.

Rules:

- Do not add a new Code Lab.
- Terminal Lab owns code learning and command teaching.
- UI must use CereBro tokens, compact density, visible focus, dark shell
  surfaces, 8 px max radius, and hard-gate modal shape.
- Do not hide execution behind clever UI.
- Browser or screenshot proof is required for material visual changes when the
  browser tool is callable.

### Backend Worker

Owns runtime, data contracts, routers, local persistence, and test coverage.

Primary files:

- `app/server/**`
- `app/shared/**`
- `app/server/cerebro-foundations.test.ts`
- backend-facing generated schemas or local test fixtures

Reads:

- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`
- `CEREBRO_SKILLS_AND_TOOLS_LAYER.md`
- `CEREBRO_MODEL_ROUTER_BASELINE.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`

Priority order:

1. Visible receipt data contracts for Project Lab, Terminal Lab, Workbench, and
   Ledger.
2. Aang mode read and Cortana route skeleton.
3. Approval and permission receipts.
4. Tool call and command observation ledger.
5. Model and tool registry state.
6. Agent runtime skeleton.
7. Validation and evaluator hooks.

Rules:

- Backend should serve the visible receipt loop before autonomous execution.
- No external repo clone, package run, browser target, model call, credential
  use, or destructive action without a Spock-style receipt and approval.
- Raven remains sealed. Do not mix Raven data into CereBro memory, UI, Obsidian,
  Notion, Slack, or source library.

### Knowledge Worker

Owns storage, source, archive, Obsidian, Notion, Drive vault, and RAG readiness.

Primary files:

- `CEREBRO_FILE_LIFECYCLE_PLAN.md`
- `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `app/server/integrations/vault.ts`
- source, memory, output, handoff, and Piccolo router files when assigned
- approved Obsidian vault files

Priority order:

1. File lifecycle and storage destination rules.
2. Obsidian session archive and project bridge notes.
3. Source Library intake receipts.
4. Notion capture and output lanes.
5. RAG-ready note metadata.
6. Reusable prompt/tool handoff memory.
7. Piccolo cleanup and storage pressure reporting.

Rules:

- History is append-only.
- Obsidian uses `00_Atlas`, `10_Projects`, `20_Knowledge`, `60_Media`,
  `80_Templates`, and `90_Archive`.
- Archive snapshots do not enter normal RAG.
- Every durable note needs provenance, status, privacy class, and retrieval
  status when it becomes RAG-ready.

### QA Worker

Owns read-only review unless explicitly assigned a narrow fix.

Reads:

- changed files
- tests
- UI routes
- docs that define acceptance

Outputs:

- findings with file and line references
- missing checks
- residual risk
- no edits by default

Priority order:

1. Runtime breakage.
2. Data-loss or unsafe-action risk.
3. UI confusion that changes user decisions.
4. Accessibility and focus.
5. Visual drift from the CereBro system.
6. Missing tests.

## Stop Rules

Any worker stops and reports when:

- the requested slice needs product direction
- the edit would cross lane ownership
- tests fail in a way unrelated to the slice
- the worktree has conflicting user edits in the same files
- the slice would require external services, credentials, paid services, or
  downloads
- the slice would touch Raven outside a sealed Raven task
- context is getting too large to summarize cleanly

## Block Sizes

Use 2 to 4 hour blocks.

A good block changes one coherent thing:

- one surface
- one data contract
- one route and its test
- one archive/storage lane
- one visual QA pass

A bad block mixes UI redesign, backend schema, external integrations, and
storage migration at the same time.

## Default Worker Prompts

### Frontend Worker Prompt

```text
You are a CereBro Frontend Worker. Read AGENTS.md, DESIGN.md,
CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_FRONTEND_SYSTEM.md,
CEREBRO_UX_SYSTEM.md, and CEREBRO_SESSION_HANDOFF.md.

You are not alone in the codebase. Do not revert edits made by others.
Work only inside the assigned frontend files. Do not stage, commit, push, or
update the session handoff.

Assigned slice:
[slice]

Owned files:
[files]

Rules:
- Keep-first path only.
- No new Code Lab.
- Terminal Lab is Aang's code teaching lane.
- Use CereBro tokens, compact density, visible focus, dark shell surfaces,
  destructive/risk states, disabled states, menu grouping, and 8 px max radius.
- Hard gates use modal shape only.

Return changed files, checks run, risks, and exact next step.
```

### Backend Worker Prompt

```text
You are a CereBro Backend Worker. Read AGENTS.md,
CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md,
CEREBRO_SKILLS_AND_TOOLS_LAYER.md, and CEREBRO_SESSION_HANDOFF.md.

You are not alone in the codebase. Do not revert edits made by others.
Work only inside the assigned backend files. Do not stage, commit, push, or
update the session handoff.

Assigned slice:
[slice]

Owned files:
[files]

Rules:
- Backend serves the visible receipt loop first.
- No hidden execution.
- Approval, command, tool, source, memory, and output events need receipts.
- Raven remains sealed and separate.

Return changed files, checks run, risks, and exact next step.
```

### Knowledge Worker Prompt

```text
You are a CereBro Knowledge Worker. Read AGENTS.md,
CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_FILE_LIFECYCLE_PLAN.md,
CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md, and
CEREBRO_SESSION_HANDOFF.md.

You are not alone in the codebase. Do not revert edits made by others.
Work only inside the assigned docs, storage, or vault files. Do not stage,
commit, push, or update the session handoff unless explicitly assigned by the
lead.

Assigned slice:
[slice]

Owned files:
[files]

Rules:
- History is append-only.
- Obsidian archive snapshots are append-only.
- Raw capture goes to Notion first.
- Durable synthesis goes to Obsidian only with approval or an approved rule.
- Every RAG-ready note needs provenance and retrieval status.

Return changed files, checks run, risks, and exact next step.
```

### QA Worker Prompt

```text
You are a CereBro QA Worker. Read the changed files and the governing docs.
Do not edit files unless explicitly asked.

Review for:
- runtime breakage
- unsafe action paths
- user confusion
- design-system drift
- accessibility and focus
- missing checks

Return findings first with file and line references. Then list missing checks
and residual risk. If there are no findings, say that plainly.
```

## Integration Checklist

Before a block is called complete:

- `git status --short` inspected
- unrelated dirty files preserved
- code formatted by the repo's normal tools when needed
- `pnpm -C app exec tsc --noEmit --pretty false` run for app code changes
- `pnpm -C app check` run for material app changes
- targeted tests run for touched backend contracts
- localhost or browser proof captured for material UI changes when callable
- `CEREBRO_SESSION_HANDOFF.md` updated
- Obsidian snapshot written
- Obsidian session index appended
- commit uses one plain sentence
- push happens only after the block has useful shape
