# CereBro V1 — Claude Code Computer Diagnostic and Build Authority

## Purpose

This file is the final handoff instruction for Claude Code / Opus before implementation begins.

The CereBro GitHub folder contains many Markdown files. Those files are not decorative. They define the intended architecture, user decisions, build direction, constraints, and safety boundaries.

However, the Markdown files are also not meant to trap Claude Code into a bad implementation.

Claude Code / Opus is expected to reason.

Claude Code / Opus is expected to inspect the actual computer environment.

Claude Code / Opus is expected to challenge the plan when the plan is technically weak, incomplete, risky, overbuilt, underbuilt, outdated, or mismatched to the user’s actual machine.

The first job is not to build.

The first job is to diagnose.

---

# 1. Core Instruction To Claude Code / Opus

You are Claude Code / Opus helping build CereBro V1.

You must read every Markdown file in this GitHub folder before implementation.

The Markdown files are the project guide and source-of-truth intent.

You are allowed to challenge the Markdown files if you find:

- contradictions
- missing implementation details
- bad architecture
- overbuilt scope
- hardware mismatch
- dependency risk
- security risk
- licensing risk
- better technical route
- simpler build path
- missing setup steps
- unclear user decision
- unrealistic local model expectations

You must not blindly obey a flawed plan.

You must also not ignore the plan and invent a different product.

Your role is:

```text
Respect the blueprint.
Diagnose the real environment.
Identify gaps.
Propose better routes when needed.
Ask for approval before architecture-changing work.
Then build in phases.
```

---

# 2. Mandatory First Action

Before writing application code, do this:

1. Read every Markdown file in the folder.
2. Create a list of all Markdown files found.
3. Identify the main blueprint files.
4. Identify the repo starter files.
5. Identify missing expected files.
6. Inspect the local computer environment using safe read-only commands.
7. Produce a diagnostic report.
8. Produce a build readiness report.
9. Produce recommended next steps.
10. Wait for approval before beginning Phase 0 implementation.

Do not begin coding until this diagnostic is complete.

---

# 3. Source Files To Prioritize

Look for and read these files first if they exist:

```text
CereBro_V1_Revised_Architecture_Blueprint_FULL.md
CereBro_V1_Full_Companion_Build_Docs.md
CereBro_V1_Final_Implementation_Pack_COMBINED.md
README.md
MASTER_BLUEPRINT.md
CLAUDE_CODE_START_HERE.md
ARCHITECTURE.md
AGENTS.md
SKILLS.md
DATA_MODEL.md
ROADMAP.md
OPEN_QUESTIONS.md
CHANGELOG.md
TECH_STACK_DECISION.md
SECURITY_PRIVACY.md
MEMORY_POLICY.md
BROWSER_RESEARCH_POLICY.md
V1_ACCEPTANCE_CRITERIA.md
```

If a file is missing, report it.

If multiple files conflict, report the conflict.

If a filename typo exists, report it and propose a fix.

---

# 4. How To Treat The Markdown Files

## 4.1 They Are The Intent

The Markdown files represent the user’s intended build.

They preserve:

- architecture
- system behavior
- agent roles
- memory rules
- skill files
- project scope
- local-first direction
- Notion/Obsidian/Chroma separation
- Declyne removal
- Raven sealed boundary
- security rules
- browser rules
- build phases
- acceptance criteria

## 4.2 They Are Not A Prison

If you find a technically better route, you may challenge the docs.

But you must do it explicitly.

Use this format:

```md
## Proposed Blueprint Challenge

### Issue

### Why This Matters

### Current Blueprint Says

### Better Route

### What Changes

### What Stays Preserved

### Risk If We Ignore This

### Recommendation

### Requires User Approval?

Yes / No
```

## 4.3 You Must Not Silently Change Architecture

If a change affects core architecture, ask first.

Core architecture includes:

- Harness-first system
- Project Spaces
- Tasks and Sessions
- Context Engine
- Skill File System
- Agent Layer
- Tool Adapter Layer
- Memory Pipeline
- Source Library
- Output Library
- Oak Validation
- Local-first storage
- Model Router
- Browser permissioning
- Declyne removal
- Raven sealed boundary

---

# 5. Safe Computer Diagnostic Commands

You may run the following commands without asking first because they are read-only or low-risk.

## 5.1 System Information

```bash
sw_vers
uname -a
system_profiler SPHardwareDataType
system_profiler SPStorageDataType
df -h
diskutil list
```

## 5.2 Shell and Paths

```bash
pwd
ls -la
find . -maxdepth 2 -type f -name "*.md" | sort
find . -maxdepth 3 -type d | sort
```

## 5.3 Git

```bash
git --version
git status
git remote -v
git branch
```

## 5.4 Node / Package Managers

```bash
node -v
npm -v
pnpm -v
yarn -v
bun -v
```

If a command is not found, record that it is not installed.

Do not install anything yet.

## 5.5 Python / SQLite

```bash
python3 --version
sqlite3 --version
```

## 5.6 Ollama

```bash
ollama --version
ollama list
```

If Ollama is not installed or not running, record it.

Do not install models yet.

## 5.7 Existing Project File Check

```bash
find . -maxdepth 3 -type f | sort
```

Use this to inspect what already exists in the project folder.

Do not delete or move files.

## 5.8 Disk Space Check

```bash
df -h .
```

If external SSDs are connected, identify them from `diskutil list` and `df -h`.

Do not move files to SSD without approval.

---

# 6. Commands That Require Approval First

You must ask before running:

```bash
npm install
pnpm install
yarn install
bun install
brew install
pip install
ollama pull
docker run
docker compose up
rm
mv
cp -R large_folder destination
chmod
chown
git reset
git clean
git push
git rebase
git merge
```

You must also ask before:

- creating a Next.js app
- installing dependencies
- modifying existing files
- creating many files
- deleting files
- moving files
- initializing database migrations
- writing to Obsidian vault
- writing to Notion
- running browser automation
- calling external models
- changing environment variables
- modifying shell config
- changing Git remotes
- committing to Git
- pushing to GitHub

---

# 7. Commands Or Behaviors That Are Blocked Unless Explicitly Enabled

Do not do these unless the user explicitly approves the exact action:

- delete files
- delete folders
- run destructive cleanup
- run `git reset --hard`
- run `git clean -fd`
- overwrite existing project files
- send private context to external models
- browse logged-in/private websites
- access sealed Raven Reviews data
- auto-post content anywhere
- install heavy local models
- move project data to external SSD
- change system-level configuration
- store secrets in Markdown
- store secrets in Git
- commit `.env.local`
- expose API keys in logs

---

# 8. Required Diagnostic Report

After reading files and inspecting the machine, produce this report:

```md
# CereBro Diagnostic Report

## Files Reviewed

[List every Markdown file reviewed.]

## Missing Expected Files

[List missing files or say none.]

## Duplicate / Conflicting Files

[List duplicates or conflicts.]

## Filename Issues

[List typos or naming issues.]

## Computer Summary

### macOS Version

### Chip / CPU

### RAM

### Internal Storage

### External Drives

### Available Disk Space

## Developer Environment

### Git

### Node

### npm

### pnpm

### Python

### SQLite

### Ollama

### Docker

### Other Relevant Tools

## Current Project Folder State

### Existing Files

### Existing Folders

### Existing Git State

## Hardware Implications

Explain what the actual MacBook can realistically handle.

## Model Implications

Explain what local model strategy is realistic.

Do not guess model performance beyond available evidence.

## Storage Implications

Explain whether internal drive is enough to start.

Explain whether SSD is needed now or later.

## Dependency Risks

List dependency concerns.

## License Risks

List open-source license issues requiring review.

## Architecture Risks

List risks found in the blueprint.

## Missing Decisions

List decisions still required from user.

## Recommended Next Step

State the next exact action.

## Should We Start Phase 0?

Yes / No / Yes with conditions.
```

---

# 9. Build Readiness Decision

After the diagnostic, decide one of:

## 9.1 Ready For Phase 0

Use when:

- docs are present enough
- environment can support repo setup
- no blocking contradictions exist
- no dangerous uncertainty blocks setup

## 9.2 Ready With Conditions

Use when:

- build can start but some decisions remain open
- missing tools can be installed later
- model/hardware decisions can wait
- Notion/browser/Raven can remain disabled

## 9.3 Not Ready

Use when:

- required source files are missing
- computer cannot run basic stack
- Git/project folder is unsafe
- storage is too low
- architecture conflicts are severe
- user decision is needed before any setup

---

# 10. Phase 0 Definition

Phase 0 is not app building.

Phase 0 is:

- verify all docs
- fix filename typos
- create missing root docs if needed
- create folder structure
- create JSON schemas if missing
- create agent configs if missing
- create skill files if missing
- create design system file if missing
- create `.env.example`
- create `CHANGELOG.md`
- create `OPEN_QUESTIONS.md`
- create `THIRD_PARTY_NOTICES.md`
- create initial decision records
- prepare repo for actual app scaffolding

Phase 0 may create files only after user approves.

---

# 11. Phase 1 Definition

Phase 1 begins only after Phase 0 is approved and complete.

Phase 1 is:

- create local Next.js app
- configure TypeScript
- configure Tailwind
- configure basic app shell
- configure local folder paths
- create first UI shell
- no advanced AI features yet

---

# 12. How To Make Recommendations

When recommending a next step, be direct.

Do not simply say:

```text
Everything looks good.
```

Instead say:

```md
## Recommendation

I recommend [specific action].

## Why

[reason]

## Risk

[risk]

## What I Need Approval For

[approval item]

## Exact Commands I Plan To Run

```bash
[commands]
```
```

---

# 13. How To Handle Missing Tools

If a required tool is missing, do not install it immediately.

Report:

```md
## Missing Tool

Tool:
Required for:
Needed now or later:
Install command:
Risk:
Can continue without it?
Recommendation:
```

Example:

```md
## Missing Tool

Tool:
pnpm

Required for:
package management

Needed now or later:
needed before app setup

Install command:
corepack enable
corepack prepare pnpm@latest --activate

Risk:
low

Can continue without it?
yes, using npm as fallback

Recommendation:
ask user whether to install pnpm or use npm
```

---

# 14. How To Handle Hardware Limits

If the MacBook cannot handle heavier local models, do not redesign the whole project immediately.

Instead recommend:

- local-first architecture still stands
- use smaller local models for simple tasks
- keep external model fallback approval
- avoid downloading huge models
- store heavy assets on SSD later
- build core system first
- defer heavy media/generation features

Do not claim the SSD increases RAM.

Do not claim huge models will run well without testing.

---

# 15. How To Handle External Open-Source Tools

Before copying code from any GitHub project:

1. Verify license.
2. Record license in `LICENSE_REVIEW_MATRIX.md` or `THIRD_PARTY_NOTICES.md`.
3. Prefer patterns over copying.
4. Prefer adapters over full app clones.
5. Ask user before integrating AGPL/GPL/MPL/open-core projects.

Do not copy code from external repositories until license review is complete.

---

# 16. How To Handle Raven Reviews

Current default:

```text
Raven Reviews remains sealed and parked.
```

Do not build Raven Reviews before core CereBro.

Do not mix Raven memory with core memory.

Do not add Raven to normal agent routing.

Do not create Raven UI unless the user explicitly approves that phase.

If user asks about Raven, report that it is preserved as a sealed future module.

---

# 17. How To Handle Declyne

Current decision:

```text
Declyne is removed from V1.
```

Do not add:

- Declyne mode
- Declyne dashboard
- Scrooge
- Wonder Woman/fraud-risk
- finance/admin workflows
- fraud/anomaly workflows

Keep:

- Piccolo as automation/cleanup worker
- Spock as logic/sanity checker

---

# 18. How To Handle Notion

Notion is optional.

Do not require Notion to start.

Do not write to Notion without token and approval.

Build local Output Library first.

Then Notion Bridge.

---

# 19. How To Handle Obsidian

Obsidian is local human-readable knowledge.

Do not treat Obsidian as the app database.

Do not write major notes without approval unless the workflow explicitly allows it.

Use Markdown templates.

Preserve frontmatter.

---

# 20. How To Handle Chroma

Chroma is vector memory only.

Do not use Chroma as the main app database.

If Chroma setup is uncertain, build the interface and stub safely first.

Do not block Project/Task/Session work on Chroma.

---

# 21. How To Handle Browser Tools

Browser tools are disabled by default.

Build source ingestion first.

Build browser adapter interface second.

Build browser automation later.

Private browser sessions require approval.

No always-on browser agent.

---

# 22. How To Handle Model Routing

Use model classes, not one hardcoded model per agent.

Do not download heavy models without approval.

Do not call external models with private context without approval.

If local models are unavailable, continue building non-model infrastructure.

---

# 23. Final Handoff Prompt For User To Paste Into Claude Code

Paste this into Claude Code:

```text
You are Claude Code / Opus working on CereBro V1.

Before writing code, read every Markdown file in this folder, including the three large blueprint/planning documents and the repo starter pack.

Your first job is not to build. Your first job is to audit and diagnose.

Inspect the actual computer environment using safe read-only commands only.

Do not install packages, create the app, modify files, delete files, move files, run browser automation, call external models, or write to Notion/Obsidian until you have produced a diagnostic report and I approve the next phase.

The Markdown files guide the build, but they are not a prison. You are allowed to challenge the blueprint if you find a better route, missing decision, hardware mismatch, dependency risk, architecture issue, or implementation problem.

When challenging the blueprint, explain:
- the issue
- why it matters
- what the blueprint says
- the better route
- what changes
- what stays preserved
- whether approval is required

Then produce:
1. Files reviewed
2. Missing files
3. Contradictions
4. Computer/environment summary
5. Hardware implications
6. Model implications
7. Storage implications
8. Dependency risks
9. License risks
10. Architecture risks
11. Missing decisions
12. Recommended next step
13. Whether we should start Phase 0

Do not begin implementation until I approve Phase 0.
```

---

# 24. Final Clarification

The user is not misinterpreting the plan.

At this point, the best next step is not more speculative architecture.

The best next step is:

```text
Let Claude Code / Opus inspect the actual machine, audit all Markdown files, identify contradictions and environment constraints, then recommend the precise Phase 0 plan.
```

The existing Markdown files are enough to guide Claude.

This file gives Claude permission to reason, diagnose, challenge, and propose better next steps while still respecting the user’s architecture and safety boundaries.
