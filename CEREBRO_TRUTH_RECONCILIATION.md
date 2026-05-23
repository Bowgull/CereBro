# CereBro Truth Reconciliation

Single source of truth. Read this first before any agent or UI work. This doc reconciles the planning specs against the current code and corrects every drift found in the audit on 2026-05-05.

If a fact in this doc conflicts with `CLAUDE.md` or auto-memory, this doc wins. If a fact in this doc conflicts with the original planning files in `CereBro_V1_*`, `CereBro_Final_Implementation_Pack/`, or `CereBro_Claude_Code_Repo_Starter_Pack/`, those originals win and this doc must be updated.

---

## 1. What CereBro actually is

A local-first, task-based AI operating system. Not a multi-agent chat. Not a Claude Code wrapper. Not an autonomous swarm.

The architecture is harness-first. Every meaningful request becomes a task object. Tasks flow through a fixed pipeline with explicit gates. Agents are bounded role operators governed by the harness. Skills are reusable Markdown instruction modules loaded by agents at runtime. Tools have permission classes. Memory writes are proposals that pass through validation and user approval before being written.

The default runtime is local Ollama. External Claude is escalation only and requires user approval per call (or per task, with user consent).

---

## 2. Request lifecycle (canonical)

```
User input (typed into "Ask Aang…" command bar)
  ↓
Aang — intent capture, clarifying questions, mode hint
  ↓
Harness — task object created, session opened, context pack assembled
  ↓
Cortana — picks mode (Quick / Explore / Build), assigns owner agent + support agents, sets tool permission scope
  ↓
Agent(s) work, loading relevant .skill.md files, requesting tools through adapters
  ↓
Tool Adapter Layer — checks permission class (Safe / Approval Required / Blocked Unless Enabled)
  ↓
C-3PO — formats output for human readability
  ↓
Professor Oak — validates (facts, sources, dedup, privacy, anti-slop, blueprint consistency)
  ↓
User approval gate (if memory write, Notion write, external model use, browser session, file change, or other Approval Required action)
  ↓
Memory Writer — writes to Chroma / Obsidian vault / Notion / Output Library / SQLite as appropriate
  ↓
Task closed, changelog updated, session ledger entry recorded
```

No agent skips Oak for important output. No memory write skips approval. No tool runs without checking its permission class.

---

## 3. Agent roles (corrected)

The `agentRouter.ts` role descriptions had drift. These are the corrected canonical roles. Code must match.

### Aang — Great Hall (upper)
- **Front door.** Captures user intent. Asks clarifying questions. Hands clarified intent to Cortana.
- **Convener.** Runs multi-agent ceremonies: multi-lens review, retrospective, mediation between conflicting outputs.
- **Teacher.** Aang Learning Mode produces beginner guides, quizzes, flashcards, checklists, practice plans, resource lists, and LearningPaths (structured curricula with prerequisites, modules, checkpoints).
- Does not own routing decisions, code, validation, or memory writing.

### Cortana — Hub (ground)
- **Hard router.** Picks task mode (Quick / Explore / Build). Assigns owner agent and support agents. Sets tool permission scope per task. Controls sealed module entry/exit (e.g., Raven if ever unsealed).
- **Visible center.** Wizard-of-Oz framing: user is hidden, the user-orb represents intent in motion, Cortana faces the orb when she is examining it.
- **Council host (visual layer only).** When Aang convenes a multi-agent ceremony, the rendered gathering happens in Cortana's hub. The convening logic still belongs to Aang.
- Does not own creative direction, validation, code, memory writing, or teaching.

### Tony Stark — The Forge (ground)
- **Build planner.** Converts ideas into specs, data models, implementation phases, test plans, changelogs, and Claude Code handoff prompts.
- **Claude Code handoff.** Uses the `claude-code-handoff.skill.md` to produce exact prompts that can be executed by an external Claude Code session against the existing user quota.
- Does not own validation, creative taste alone, or unapproved coding.

### Gojo — Atelier (ground)
- **Creative direction.** Owns design system selection, UI specs, motion specs, anti-slop creative pass.
- **Content Engine owner.** Idea capture → audience/goal → research pull → outline → draft → format adaptation → polish → C-3PO clarity → Oak validation → Output Library.
- **Skills used:** `frontend-design.skill.md`, `ui-motion.skill.md`, `remotion-video.skill.md`.
- Does not own architecture, routing, memory, or validation.

### Silver Surfer — Cartography Hall (ground)
- **Browser intelligence.** Source review, web research, GitHub reviews, source provenance.
- **Disabled by default.** Browser tools require explicit user enable. Until enabled, Surfer's chamber is locked: he cannot fetch, browse, or extract.
- **Skill used:** `web-scraping.skill.md` for fallback extraction. Standard ladder: user-provided → static fetch → metadata → readability parse → Playwright text → screenshot → Crawl4AI → manual.
- Does not own private browsing without per-session approval.

### C-3PO — Scriptorium (ground)
- **Pure formatter.** Turns agent work into readable docs, guides, checklists, meeting notes, Notion-ready pages, Obsidian-ready notes.
- Does not own strategic decisions, validation, or memory writing. C-3PO formats; the Memory Writer writes.

### Batman — War Room (upper)
- **Strategy and risk.** Tradeoff analysis, architecture options, build-vs-buy, scope risk, what-could-go-wrong.
- Does not own implementation, validation, or UI.

### Professor Oak — Alchemist's Tower (upper)
- **Validator.** Final gate before any important output, save, or memory write. Checks facts, sources, blueprint consistency, privacy, dedup, anti-slop.
- **Memory dedup.** Reviews proposed memories against existing entries before write.
- **Privacy check.** Flags secrets, sealed-module references, and PII before any external escalation or external write.
- Does not own routing, implementation, or memory writing itself. Oak approves; the Memory Writer writes.
- Earlier description "Research curator" was wrong. That role belongs to no single agent; research happens via Surfer (sourcing) + agent-specific reading.

### Spock — Observatory (upper)
- **Logic checker.** Catches contradictions, inconsistent assumptions, schema mismatches.
- **Bloat detector.** Flags scope creep, premature abstraction, overengineering. Recommends simplification.
- Does not own generic validation. Oak is the validator. Spock is the simplifier and contradiction finder.

### Piccolo — Crypt of Hours (crypts)
- **Rule-based automation worker.** Runs approved scheduled jobs, cleanup scans, backup verification, sync support, log pruning.
- **Skill used:** `cleanup-backup.skill.md`.
- **No model escalation.** Piccolo does rule-based work. No external Claude calls.
- Does not own core reasoning, memory decisions, or unapproved destructive actions.

### Raven — sealed
- **Parked.** Three-gate password unseal. Zero surface in V1. NSFW image generation declined. May not exist as a chamber in the castle UI at all in V1; if rendered, must read as sealed/locked.

---

## 4. Model class system

Agents request models by class. The Model Router selects the actual model based on hardware, privacy, and user-set escalation policy. Agent code must not hardcode model names.

| Class | Use | Default | Escalation |
|---|---|---|---|
| `lightweight_formatter` | Formatting, summaries, checklists | Local Ollama | Rare |
| `local_summary` | Note summaries, drafting | Local | Rare |
| `local_code_helper` | Small code explanations, scaffolding | Local | `strong_coding_external` |
| `local_reasoner` | Planning, tradeoffs, sanity checks | Local | `strong_reasoning_external` |
| `strong_reasoning_external` | Architecture decisions, high-stakes reasoning | External Claude | Approval required |
| `strong_coding_external` | Complex refactors, multi-file debugging | External Claude (often Claude Code handoff) | Approval required |
| `long_context_external` | Multi-file analysis, large blueprints | External Claude | Approval required |
| `embedding` | Vector memory (Chroma) | Local | None |

### Per-agent class assignments

| Agent | Default class | Escalation class | Notes |
|---|---|---|---|
| Aang | `lightweight_formatter` + `local_summary` | `local_reasoner` for harder synthesis | Rarely needs external |
| Cortana | `local_reasoner` | `strong_reasoning_external` | Routing decisions |
| Tony | `local_code_helper` | `strong_coding_external` (often via Claude Code handoff skill) | Build flow |
| Gojo | `local_reasoner` | `strong_reasoning_external` | Rare external |
| Surfer | `local_summary` | `long_context_external` | For comparing many sources |
| C-3PO | `lightweight_formatter` | None | Pure formatter |
| Batman | `local_reasoner` | `strong_reasoning_external` | Major decisions |
| Oak | Strongest available | `strong_reasoning_external` | Always best class |
| Spock | `local_reasoner` | `strong_reasoning_external` | Architecture contradictions |
| Piccolo | None (rule-based) | None | No model calls |

User escalation prompt must show: reason, model class, context summary, sensitive data flag, cost risk, and options (approve once / for task / use local only / redact and retry / cancel).

---

## 5. Skills binding

Skills are `.skill.md` files. Currently they live at `~/.claude/skills/` (Claude Code filesystem). They must be loaded into the CereBro app — either copied to `app/skills/` or mounted at runtime — so the harness can resolve `agent.requestSkill(name)` to the file content.

| Skill | Owner | Supporters |
|---|---|---|
| `claude-code-handoff` | Tony | Oak, Spock, Gojo, Batman |
| `frontend-design` | Gojo | Tony, Oak |
| `ui-motion` | Gojo | Oak |
| `remotion-video` | Gojo | Tony, Oak |
| `web-scraping` | Surfer | Oak |
| `cleanup-backup` | Piccolo | Oak, C-3PO |

Skills declare: owner agent, supporters, when/when-not-to-use, required inputs, tools used, permission level, steps, output format, validation checklist, failure modes, human approval gates.

Open: Aang's teaching mode currently has no `.skill.md`. May need `aang-learning.skill.md` covering the artifact pipeline (guide / quiz / flashcard / LearningPath generation).

---

## 6. Tool registry and permissions

Three permission classes:

**Safe** (no approval): read project/task metadata, search local memory, format output, create draft artifact.

**Approval Required**: write file, update Notion, update Obsidian, call external model with private context, run browser automation, run terminal command, enable recurring workflow.

**Blocked Unless Enabled**: destructive cleanup (rm, drop, force-overwrite), private browser session, sealed module access, external account automation, auto-posting, background browsing.

Tool flow: agent requests tool → Cortana/Harness checks permission class → Safe runs and logs → Approval Required prompts user → Blocked refuses unless toggled on in Settings → Oak validates output if critical.

Every tool call is logged with: agent, task, input summary, output summary, permission class, approval status, timestamp.

---

## 7. Storage tiers

| Tier | Path | Purpose | Backup priority |
|---|---|---|---|
| SQLite | `~/CereBro/data/sqlite/cerebro.sqlite` | Structured app state (projects, tasks, sessions, sources, artifacts, approvals, errors, model registry) | Very high |
| Chroma | `~/CereBro/data/chroma/` | Vector semantic memory index. Linkback to Obsidian file paths. Rebuildable from sources. | High |
| Obsidian vault | `~/CereBro/obsidian-vault/` | Human-readable durable knowledge: project notes, decisions, build logs, sources, guides, learning, daily notes. Stays useful offline. | Very high |
| Output Library | `~/CereBro/data/artifacts/` | Generated outputs: Markdown, PDFs, images, videos, specs, handoffs. Metadata in SQLite. | High |
| Notion | Optional | Polished export layer. Not source of truth. Read inbox optional. Write requires approval. | High if configured |

Rules:
- Notion is optional and not required for V1 startup.
- Chroma is rebuildable. Obsidian and SQLite are not. Backup priority follows.
- Memory writes go through Memory Writer only, never directly from agent code.
- Conflicts on Notion writes: never overwrite silently; offer resolution.

---

## 8. Agent state machine (real harness states)

These are the states the UI must surface. They map to real task and tool events, not vibes.

| State | Trigger | Visible signal |
|---|---|---|
| `idle` | No task assigned | Subtle ambient motion, muted color |
| `loading-context` | Cortana routed in, context pack being assembled | Brief animation, spinner near agent |
| `working-local` | Running on local Ollama | Active animation at hero prop, accent glow |
| `escalation-pending` | External model call needs user approval | Amber wait icon, approval gate visible |
| `working-external` | Approved, running externally | Active animation with violet accent |
| `output-pending-validation` | Done, Oak hasn't validated yet | Violet pulse, "awaiting Oak" indicator |
| `validation-failed` | Oak rejected; reworking | Red flash, then return to working state |
| `awaiting-user-approval` | Oak passed; user must approve write | Amber "needs input" emote, prompt in UI |
| `walking-to-ceremony` | Aang convened; en route to Cortana's hub | Walk cycle, position transitioning |
| `council-seated` | In ceremony at Cortana's hub | Seated animation, attentive |
| `receiving-call` | Cortana addressing this agent | Head turn toward Cortana, brief highlight |
| `dormant` | Disabled or sealed (e.g., Surfer browser-off, Raven) | Low alpha, locked indicator |
| `complete` | Task closed | Success sigil briefly, then back to idle |

State icons (in-scene, above sprite): `!` alert, `?` needs input, `⏸` paused, `⚙` working, `💬` speaking-to-user (Aang only), `🚶` walking, `💤` dormant, `🔒` locked.

The right context panel must show the same state in detail: agent, task, mode, model class in use, tools requested, Oak status, approval gate state, next action.

---

## 9. UI shell vs castle layering

The canonical UI is a dark cinematic command center with this anatomy:

- **Left rail**: Home, Project Spaces, Inbox, Tasks, Sources, Outputs, Memory, Automation, Settings.
- **Center workspace**: project / task / source / output content depending on left-rail selection.
- **Right context panel**: active agent, current mode, task status, context pack summary, tool permissions, Oak validation state, next actions.
- **Bottom command bar**: "Ask Aang…" text input, mode selector, attach source, create task, approval action area.

The castle scene is a **creative layer** that occupies the center workspace when the user is on Home (or a future "Castle" view). It does not replace the shell. The current build inverts this: the castle has eaten the center, the left rail shows only sessions, the right panel shows hero stats, and the command bar does not exist. This is a structural inversion that must be corrected before deeper castle work continues.

Locked color tokens (already correct in `keepConfig.ts`):
```
background       #0E1116
backgroundSoft   #131821
surface          #181F2A
surfaceRaised    #202A38
border           #334155
textPrimary      #F4EFE3
accent           #6BA6FF
accentViolet     #8B5CF6
glowViolet       #A78BFA
success          #9FD2B7
warning          #F6C177
danger           #EF6F6C
gold             #D9B56A
stone            #6B7280
```

Anti-slop: no SaaS blue defaults, no glassmorphism, no gradient blobs without purpose, no nested cards, no fake agent chat, no fantasy decoration overload.

---

## 10. Gap matrix (current vs spec)

| Component | Spec | Current | Status |
|---|---|---|---|
| Harness lifecycle | Full pipeline | Claude Code session watcher only | Stub |
| Agent system | Runtime entities loading skills + tools | Metadata-only in `agentRouter.ts` | Stub |
| Skills loader | `.skill.md` loaded by agent at runtime | Files exist outside app, not loaded | Missing |
| Tool registry + adapters | Safe / Approval / Blocked classes | Nothing | Missing |
| Model router | Class-based with escalation | Hardcoded model names | Wrong |
| Chroma vector memory | Required tier | Nothing | Missing |
| Obsidian vault writer | Memory + outputs path | Outputs stub only | Partial |
| Notion bridge | Optional inbox/outbox | Stub | Partial |
| Memory pipeline | Propose → Oak → approve → write | Flat insert | Stub |
| Approval gates | Visible UI per gate | Nothing | Missing |
| Browser adapter | Disabled by default, ladder fallback | Nothing | Missing |
| First-run onboarding | 12-step flow | Nothing | Missing |
| Aang teaching artifacts | Guide, quiz, flashcard, LearningPath | Nothing | Missing |
| Project Spaces | Primary org unit | Flat `projects` table | Stub |
| Left rail | 9-section nav | Sessions only | Wrong |
| Right context panel | Agent + mode + task + perms + Oak + next | Hero stats only | Partial |
| Command bar | "Ask Aang…" | None | Missing |
| Castle scene as layer | Optional in center | Has eaten the shell | Structural inversion |
| Locked color tokens | Required values | Correct values used | Correct |

---

## 11. Per-agent role corrections needed in `agentRouter.ts`

| Agent | Field | Current | Correct |
|---|---|---|---|
| Aang | role | "Convener. Multi-agent ceremonies, retrospectives, mediation between disagreeing outputs." | Add: intent capture (front door), teaching mode (guides, quizzes, flashcards, LearningPaths). |
| Aang | primaryModel | `claude-sonnet-4-6` | Class: `lightweight_formatter` + `local_summary`. Escalate to `local_reasoner` when needed. |
| Oak | role | "Research curator. Reads heavy material, distills, files references into memory." | Replace entirely: Validator. Final gate before output, save, or memory write. Dedup, privacy, anti-slop. |
| Oak | primaryModel | `claude-sonnet-4-6` | Class: strongest available. Escalate to `strong_reasoning_external`. |
| Spock | role | "Validator. Logic checks, sanity passes on outputs, schema/format validation." | Replace: Logic checker, contradiction detector, bloat detector. Challenges overengineering. Not a generic validator. |
| Surfer | notes | "Public-page browsing only in V1." | "Browser disabled by default. User must enable in Settings before any browse, fetch, or extract action." |
| Tony | primaryModel | `claude-code-handoff` | Class: `local_code_helper`. Escalate to `strong_coding_external` via `claude-code-handoff.skill.md` for complex builds. |
| All | primaryModel + fallbackModel | Hardcoded names | Class strings only. Router resolves. Env override: `CEREBRO_MODEL_<AGENT>` still allowed for force-pin. |
| All | (new field) `skills` | Missing | List of `.skill.md` names this agent loads. |
| All | (new field) `toolScope` | Missing | List of tool names this agent is allowed to request. Cortana further narrows per task. |

---

## 12. Build phase order (locked)

1. **Phase 1 — Truth doc.** This file. Done when committed.
2. **Phase 2 — Code fix `agentRouter.ts`.** Apply role corrections, swap to model classes, add `skills` and `toolScope` fields. No behavior wired yet, just corrected metadata.
3. **Phase 3 — Canonical shell rebuild.** Add left rail (9 sections), right context panel (agent + mode + task + perms + Oak + next actions), bottom command bar with "Ask Aang…". Castle scene shrinks to center workspace area. First-run onboarding wizard authored but pinned (see §16).
4. **Phase 4 — Castle re-skin.** Bigger chambers, dividers, Cortana cathedral nave, per-chamber theming reflecting real role nuance, A* pathing, council use-spots, state icons above sprites, visible storage destination chambers.
5. **Phase 5 — Animation pass.** PixelLab `animate_character` per agent: idle, walk×4, cast at hero prop, council-seated, receiving-call, "needs input" pose. Roughly 80 generations.
6. **Phase 6 — Harness wiring.** Real intent capture, real router, skill loader, tool adapters with permission classes, model class router, memory pipeline with Oak validation and approval gates. Backend setup happens here: Claude configures storage root, Obsidian vault, Ollama detection, Notion bridge, browser policy, and approval strictness from this doc and the planning files. The onboarding wizard from §16 is the user-visible polish at the very end, not the build path.
7. **Phase 7 — Aang teaching mode.** Artifact pipeline for guides, quizzes, flashcards, LearningPaths.
8. **Phase 8 — Surfer browser adapter.** Disabled-by-default, ladder fallback, session logging.
9. **Phase 9 — Notion bridge full.** Outbox + optional inbox.
10. **Phase 10 — V1 hardening.** Tests, acceptance criteria pass, walkthrough guide. Wire the pinned onboarding wizard into first-mount detection here, after the backend it depends on actually exists.

---

## 13. PixelLab generation rule

PixelLab is the image generation source. Every generation must be requested in chat first and approved before the call is made. No silent generation. No batched generation without per-batch approval. The 2000/month budget is the user's; do not spend without consent.

When a generation is approved, log: what was generated, why, where it lives in `app/client/public/sprites/cerebro/`, and what code references it. So future Claude can find and reuse.

---

## 14. Open questions still

From `OPEN_QUESTIONS.md` and active build:

- Exact MacBook hardware (chip, RAM, storage) — needed for final model routing.
- Exact local Ollama model shortlist — must test on the actual machine.
- Chroma runtime: local service, embedded, Docker, or alternate vector store.
- Notion timing: build after local Output Library is solid.
- Raven Reviews fate: remove entirely, sealed future module, or placeholder shell.
- `aang-learning.skill.md` — needs to be authored.
- Whether the castle has visible storage chambers (vault, gallery, optional Notion portal) or treats storage as plumbing.

---

## 15. Locked decisions (carry forward from CLAUDE.md and auto-memory)

- Local-first. Free tier only. No paid services.
- Wizard-of-Oz: user is hidden; Cortana is the visible center; user-orb represents intent in motion, not the user.
- Council convening logic belongs to Aang. The visual gathering renders in Cortana's hub.
- All 10 agents in V1: Cortana, Tony, Gojo, Surfer, C-3PO (ground); Aang, Batman, Oak, Spock (upper); Piccolo (crypts).
- Silver Surfer rides a silver horse, not a board.
- Storage: libSQL (Turso free tier when ready) for SQLite tier; Drive synced folder for vault; local for regenerable.
- Notion: inbox/outbox pattern, optional, free tier.
- Browser: public-page only when enabled, disabled by default.
- External Claude Code: confirms each call individually, eats existing session quota.
- Walkthrough guide is the LAST phase.
- Castle is a creative layer on top of the canonical UI shell. Castle does not replace the shell.

---

## 16. Onboarding wizard pinned

The 12-step first-run wizard at `app/client/src/components/Onboarding.tsx` is authored and committed (Phase 3B) but **not rendered**. The import and the `showOnboarding` gate in `app/client/src/pages/Home.tsx` are commented out.

Reason: backend setup (storage root, Obsidian vault, Ollama, Notion, browser policy, approval strictness) happens in Phase 6, where Claude configures CereBro directly from this truth doc and the planning files. The user does not fill in a setup wizard during the build. The wizard is the polish path for end-users who install CereBro fresh after V1 ships.

To re-enable, restore the import line and the `{showOnboarding && <Onboarding … />}` block in Home.tsx, and let Phase 6 backend back the choices with real settings persistence + system health checks.
