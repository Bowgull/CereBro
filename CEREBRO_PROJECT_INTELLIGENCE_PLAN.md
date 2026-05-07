# CereBro Project Intelligence Plan

Last updated: 2026-05-06

## Purpose

CereBro is a personal command center first. Project Intelligence is the layer
that lets it understand the user's apps, everyday work, learning, creative
ideas, messages, research, and freelance goals without forcing everything into
a client-job workflow.

Freelance work remains important, but it is one mode inside the broader system.

## North Star

CereBro should help the user:

- Finish personal apps and systems.
- Decide what to work on next.
- Keep everyday notes, reminders, messages, and research organized.
- Capture ideas, links, TikToks, Reddit posts, articles, and conversation
  sparks on the fly through Hedwig/Slack into Notion.
- Build portfolio proof from real projects.
- Prepare freelance/client-facing material when useful.
- Route code, design, validation, learning, and cleanup work to the right agent.
- Keep broad awareness while requiring approval for writes, publishing,
  external calls, deployments, cleanup, and destructive actions.

## Access Model

Default posture: broad awareness, gated action.

Read-only by default:

- GitHub repository metadata, READMEs, package files, workflows, issues, PRs,
  and project docs.
- Local repo status, remotes, branches, instructions, scripts, and dirty state.
- Drive vault and Obsidian status.
- Existing CereBro tasks, sessions, artifacts, memory, and outputs.
- Approved Slack capture-channel or DM message metadata once Slack is connected.
- Approved Notion capture database rows once the capture database is configured.

Approval required:

- Code edits.
- Branch creation, commits, pushes, and pull requests.
- Writing files to repo, Drive vault, Obsidian, Notion, or other external tools.
- Connecting Slack, changing Slack scopes, reading new channels, or posting to
  Slack.
- External model calls.
- Browser actions beyond passive source reading.
- App Store, Plaid, Cloudflare, Vercel, Apple Developer, billing, secrets, or
  account operations.

Explicit approval plus high caution:

- Deployments.
- Secret changes.
- Data deletion or migration.
- Force pushes or destructive git operations.
- Moving, archiving, or deleting repo/vault files.
- Financial, privacy, legal, health, or App Store readiness claims.

## Intake Taxonomy

Every user request should first be classified before project routing:

- `quick_answer`
- `everyday_note`
- `decision`
- `reminder`
- `message`
- `learning`
- `self_improvement`
- `system_improvement`
- `research`
- `creative`
- `file_hygiene`
- `project_build`
- `project_design`
- `project_qa`
- `project_ship`
- `project_package`
- `portfolio`
- `freelance`
- `source_capture`
- `prompt_reuse`
- `artifact_write`

Cortana owns this classification. Aang may be the conversational front door,
but Cortana decides routing, permission class, and persistence target.

## Personal OS Loop

CereBro should feel like a personal AI assistant and second brain, not only a
project dashboard. A typical loop should be:

1. The user asks Cortana or Aang a question, search request, project request, or
   everyday request.
2. Cortana classifies intent, project/mode, permission level, and persistence
   target.
3. If outside information is needed, Cortana asks Silver Surfer to find and
   present sources through an approval-gated source/browser panel.
4. Batman, Spock, and Oak decide whether the finding is strategically useful,
   coherent with the system, and trustworthy.
5. Aang turns useful findings into learning paths or personal next steps.
6. C-3PO formats durable notes, checklists, summaries, or artifacts when the
   user approves saving.
7. CereBro may suggest a saved reusable prompt/tool handoff when it recognizes a
   similar workload, but it must name the prompt, explain why it applies, and
   ask before external/heavy tool use.

Companion loop:

1. Aang can sit on the desktop as a small always-on companion surface.
2. The overlay watches only approved local CereBro events at first: active
   project, pending approval, Terminal Lab observation, Hedwig capture/review
   queue, task state, source save, and session status.
3. Aang can show a short bubble, badge, or click target when something matters.
4. Click or hotkey opens a quick ask. The question still routes through
   Cortana, with the same permission gates as the full Keep.
5. The overlay can open the right CereBro panel: Project Lab, Terminal Lab,
   Hedwig Inbox, Sources, Tasks, or Aang Learning Path.
6. Idle behavior is lore-accurate and quiet: goofy fidgeting, tiny airbending
   practice, balancing, sitting, breathing, sleepy states, and time-of-day
   variants. Nothing dramatic. No combat loop. No constant motion.

Capture loop:

1. The user sends Hedwig a quick thought, link, video, Reddit post, article, or
   "save this for later" item through Slack.
2. Hedwig records the raw capture into the approved Notion capture database with
   source/provenance and minimal classification.
3. Cortana routes the capture toward a project, idea, learning path, reminder,
   source, task, or later-discussion queue.
4. Surfer/Oak/Aang enrich or validate only when the user asks or an approved
   rule applies.
5. Obsidian receives durable summaries, session handoffs, decisions, and
   knowledge notes, not every raw capture.

The system may surface opportunities to improve the user or improve CereBro, but
those should begin as proposals with provenance and approval gates. CereBro
should not silently rewrite its own plans, save memories, browse private sites,
or change projects because it found something interesting.

Learning depends on preserved sequence. CereBro should keep historical trails
append-only by default: session history, command/output observations, approval
records, source provenance, running notes, corrections, and reusable
prompt/tool handoff history. Current-state summaries can be rewritten, but
history must accumulate so CereBro can recognize the user's patterns, needs,
preferences, and hard boundaries over time.

Reusable prompt/tool handoff loop:

1. The user or CereBro identifies a prompt, external-model handoff, PixelLab
   prompt, spreadsheet prompt, tool URL, or source workflow that worked well.
2. CereBro stores it as lightweight reusable memory/artifact only with approval
   or an approved rule.
3. On future similar work, CereBro can say: which prompt/tool handoff it found,
   why it appears relevant, what it would change, and what approval is needed.
4. The user can ask natural questions like "what was that Excel prompt?" or
   "reuse the PixelLab sprite prompt from the other day."
5. Session handoff snapshots still belong mainly in Obsidian; reusable prompts
   are the part CereBro should actively learn from.

## Modular Panel Model

The Keep should support modular panels/windows rather than one fixed dashboard.
Agents can open focused surfaces when useful:

- Project Lab for project status and next moves.
- Silver Surfer Source/Browser Panel for web findings, GitHub references,
  videos, screenshots, source cards, and preview panes.
- Gojo Preview Studio for mockups, rendered assets, video previews, and UI
  critique.
- Aang Learning Path panel for structured skill growth.
- Aang Companion Overlay for always-on quick ask, small status bubbles,
  time-of-day idle presence, and opening the right CereBro surface.
- Piccolo Hygiene for read-only cleanup reports.
- Artifact Library for saved outputs and durable notes.
- Hedwig Capture Inbox for Slack/Notion captures, follow-ups, and later-review
  queues.
- Reusable prompt/tool handoff memory, surfaced in chat when relevant rather
  than as a large dedicated workspace.
- Terminal Lab for project-aware command-line learning, visible command/output
  history, syntax/error coaching, and validation.

The panel system should make CereBro feel like an operating layer: ask once,
route intelligently, show the right workspace, and preserve useful results only
with approval.

## Project Modes

Project work should be represented by mode, not by assuming every project is a
freelance job:

- `Build`: implementation, bug fixes, refactors, tests, technical planning.
- `Design`: UI/UX critique, product clarity, visual system, interaction polish.
- `QA`: checks, validation, risk review, accessibility, browser/device review.
- `Ship`: release, deployment, App Store/TestFlight, runbooks, rollout notes.
- `Package`: README, case study, screenshots, portfolio assets, demos.
- `Pitch`: freelance offer, client framing, outreach, proposals.
- `Learn`: explanations, guides, flashcards, skill growth tied to the project.
- `Hygiene`: stale files, dirty worktrees, duplicate plans, cleanup proposals.

## Initial Project Profiles

### Declyne

- Local path: `/Users/lindsaybell/Developer/Declyne`
- GitHub repo: `Bowgull/Declyne`
- Current role: market candidate and high-trust finance app.
- Stack: pnpm workspace, React/Vite/Tailwind/Capacitor client, Hono Worker,
  Cloudflare D1, Drizzle, tests, GitHub Actions.
- Known state: local worktree has uncommitted UI changes.
- Priority tracks:
  - Plaid/bank-connect architecture.
  - UI/UX repair and product clarity.
  - Financial logic correctness.
  - Privacy/security and data deletion.
  - App Store/TestFlight readiness.
  - Bridgefour/App Store/portfolio packaging.
- Required agents:
  - Tony for implementation slices.
  - Batman for strategic sequencing, market/readiness tradeoffs, and failure
    modes.
  - Gojo for UI/UX and product story.
  - Oak for finance/privacy/security/App Store validation.
  - Spock for contradiction and scope checks.
  - Cortana for sequencing and permission gates.

### Waymark

- Local path: `/Users/lindsaybell/Developer/Waymark`
- GitHub repo: `Bowgull/Waymark`
- Current role: personal training/AI coach and strong portfolio proof.
- Stack: React/Vite/Capacitor, Cloudflare/D1/Hono/Drizzle, iOS native surfaces,
  Strava, AI coaching layer.
- Known state: local `main` appears clean.
- Priority tracks:
  - Continue active build safely.
  - Preserve voice canon and iOS-native behavior.
  - Package as portfolio proof through Bridgefour.

### Sygnalist

- Local path: `/Users/lindsaybell/Developer/sygnalist-brain`
- GitHub repo: `Bowgull/sygnalist-brain`
- Current role: job-search product and freelance/client proof.
- Known state: local `.gitignore` modified.
- Priority tracks:
  - Understand legacy Apps Script plus Next/Supabase/Vercel architecture.
  - Preserve manual-explicit-visible law.
  - Package client-facing proof and operational story.

### Bridgefour

- Local path: `/Users/lindsaybell/Developer/bridgefour`
- GitHub repo: `Bowgull/Bridgefour`
- Current role: living portfolio website.
- Known state: untracked resume docx under `public/assets`.
- Priority tracks:
  - Keep evolving as portfolio home.
  - Add Declyne when ready.
  - Maintain case studies for Waymark and Sygnalist.

### CereBro

- Local path: `/Users/lindsaybell/Desktop/CereBro`
- GitHub repo: `Bowgull/CereBro`
- Current role: personal command center and agent operating layer.
- Priority tracks:
  - Project Intelligence.
  - Everyday command intake.
  - Storage/file lifecycle.
  - Agent runtime and permission gates.
  - Keep UI as command center, not toy dashboard.

## Agent Logic Changes

### Cortana

Owns intake classification, project/mode routing, permission gates, and
sequencing. Cortana should always check whether a request belongs to a project,
everyday work, learning, research, creative work, messaging, or hygiene.

### Tony Stark

Becomes repo continuation engineer. Before code changes Tony must:

- Read project instructions.
- Check git status.
- Detect dirty worktree risk.
- Identify the smallest meaningful slice.
- State required tests/checks.
- Suggest terminal commands when useful, with plain-language explanations and
  approval gates for risky execution.
- Decide whether current Codex is enough or whether stronger model escalation is
  worth asking for.
- Pair with Oak for high-stakes logic and Gojo for UI/UX-heavy work.

### Gojo

Owns product/design/portfolio intelligence:

- UI/UX critique.
- Product clarity.
- App Store screenshots and product-page story.
- Bridgefour case studies.
- Visual polish and design-system fit.
- "What makes this impressive?" framing.

### Batman

Owns strategic review and risk sequencing:

- Project priority and tradeoff calls.
- Market/readiness questions.
- Build-vs-package-vs-ship decisions.
- What-could-go-wrong reviews before major tracks.
- Failure modes for Plaid, App Store, freelance/client work, and agent runtime.
- Smallest next move when too many good options compete.

Batman should be invoked when the user asks what to work on next, when a project
has high opportunity/risk, or when a decision affects sequencing across Declyne,
Waymark, Sygnalist, Bridgefour, CereBro, portfolio, and freelance goals.
Batman does not implement, validate, route, or own UI.

### Professor Oak

Validates high-stakes outputs:

- Finance logic.
- Privacy/security claims.
- App Store readiness assumptions.
- Plaid/data-handling risks.
- Source-backed factual claims.
- Memory writes that affect future behavior.

### Spock

Prevents contradictions and sprawl:

- Duplicate project plans.
- Conflicting docs.
- Overlapping systems.
- Unclear source of truth.
- Scope drift.

### Piccolo

Reports project-aware hygiene:

- Dirty repos.
- Stale worktrees.
- Untracked generated files.
- Repo/vault pollution.
- Duplicate plans or orphaned artifacts.

Piccolo remains read-only until cleanup rules are approved.

### Hedwig

Owns reminders, follow-ups, message drafts, and future communication channels.
Hedwig should support both everyday life and project/freelance work.

- Slack quick capture is required for V1.
- Notion is the structured capture database for raw captured ideas, links,
  TikToks, Reddit posts, articles, conversation notes, reminders, learning
  seeds, and "talk about this later" items.
- Keep messages and captures attached to project/client/context when obvious.
- iMessage is a later OpenClaw/macOS-permission investigation, not a blocker for
  Slack capture.

### Aang

Helps the user understand what they are building and what changed. Aang turns
technical work into learning notes, explanations, and next-step clarity.
Aang also explains terminal commands, flags, syntax errors, and validation
output in plain language. Aang should help convert useful repeated workflows
into reusable prompts or learning notes when the user approves.

Aang also owns the companion-overlay presentation layer. This does not make him
a pet in the agent roster. It makes him the visible ambient edge of CereBro:
idle presence, quick ask, status bubbles, time-of-day reactions, and one-click
routes into the Keep. Cortana still handles routing. Hedwig still owns
capture/reminders. Piccolo still owns hygiene. The overlay should stay ambient
unless the user clicks, uses a hotkey, or an approved local event needs a small
surface.

### C-3PO

Formats messy work into durable artifacts: notes, checklists, README upgrades,
case studies, App Store review notes, client summaries, and polished outputs.

### Silver Surfer

Handles approved research and source capture: Plaid docs, Apple docs,
competitor scans, GitHub references, public-page browsing, videos, citations,
and everyday web questions.

Surfer is a core daily-use agent. He should support requests like current game
builds, product references, tutorials, docs, tool/library discovery, market
signals, and "what should I look at?" questions. His value comes from source
quality, extraction/scrubbing, provenance, and clean presentation, not from
always-on autonomous browsing.

Surfer should eventually open a modular Source/Browser Panel where the user can
inspect what he found: source cards, trust level, extracted summaries, links,
screenshots, GitHub repo reviews, video references, and save/discard controls.
Private/logged-in browsing, scraping, screenshots, and saved source records
remain approval-gated.

Surfer can suggest external tools or models when a task may be better served
outside CereBro, but must provide the URL/source, why it fits, and approval
needed before use.

### Terminal Lab

The in-app terminal is part of the learning and validation surface, not just a
developer convenience. It should eventually:

- Be a modular/movable Keep panel.
- Show current project, cwd, branch, dirty state, and command history.
- Let the user run or paste commands while CereBro observes output.
- Let Aang explain command syntax and errors.
- Let Tony suggest next commands and checks.
- Let Oak/Spock validate outputs and warn about risky commands.
- Keep agent-initiated execution approval-gated.
- Block or escalate destructive commands, secret exposure, deployments, and
  external account operations.

## V1 Data Additions

Project Intelligence should eventually add structured fields for:

- Project name and slug.
- Local path.
- GitHub repo.
- Primary stack.
- Status.
- Priority class: `market_candidate`, `active_build`, `portfolio_proof`,
  `infrastructure`, `freelance_asset`, `learning_project`.
- Current mode.
- Dirty worktree state.
- Last inspected time.
- Next recommended action.
- Owner/support agents.
- Risk flags.
- Linked artifacts, sources, tasks, outputs, and notes.

## Session 4 Target

Session 4 should implement the first thin vertical slice:

1. Update docs and handoff to lock this direction.
2. Add read-only project profile data for the five initial projects.
3. Add a Project Lab / Command Center surface that shows those profiles.
4. Add repo status display using local paths where available.
5. Add mode labels and next-action placeholders.
6. Do not edit external project repos.
7. Do not move/delete vault or repo files.
8. Lock Slack-as-required V1 quick capture, Notion-as-capture-database,
   Obsidian-as-durable-knowledge/session-history, and Terminal Lab placement in
   the build route.

## Open Questions

- Whether repo inventory should be persisted in SQLite immediately or start as a
  read-only derived router.
- Whether everyday reminders should move earlier than the full Hedwig session.
- Whether the first Aang Companion Overlay should be Electron, Tauri, a macOS
  menu bar helper, or a web-only prototype before native overlay permissions.
- Which local CereBro events are allowed to wake the overlay in V1, and which
  events should only badge silently.
- Exact Notion capture database schema for Hedwig quick capture.
- Exact Slack connection shape: DM bot, capture channel, or both.
- Whether Terminal Lab starts as read-only observed output, user-run commands,
  or agent-proposed commands with approval.
- Whether Declyne's Plaid track should be planned inside CereBro first or in
  Declyne's own repo after Project Intelligence exists.
- Whether Bridgefour should become the first packaging workflow after Declyne's
  next major milestone.
