# CereBro V1 — Final Implementation Pack Combined

This combined file includes every Markdown file from the implementation pack.



---

# FILE: README_IMPLEMENTATION_PACK.md

# CereBro V1 — Final Implementation Pack

This folder sits beside:

- `CereBro_V1_Revised_Architecture_Blueprint_FULL.md`
- `CereBro_V1_Full_Companion_Build_Docs.md`

Those two files define the architecture and companion build docs.

This implementation pack locks the missing build details that were still underdefined:

1. `TECH_STACK_DECISION.md`
2. `SETUP_AND_INSTALL.md`
3. `MODEL_ROUTING_AND_HARDWARE_PLAN.md`
4. `STORAGE_BACKUP_AND_FILE_LIFECYCLE.md`
5. `NOTION_INTEGRATION_SPEC.md`
6. `OBSIDIAN_INTEGRATION_SPEC.md`
7. `MCP_AND_TOOL_REGISTRY_SPEC.md`
8. `TESTING_STRATEGY.md`
9. `FIRST_RUN_ONBOARDING.md`
10. `CONTENT_ENGINE_SPEC.md`
11. `AANG_LEARNING_MODE_SPEC.md`
12. `BROWSER_ADAPTER_IMPLEMENTATION_SPEC.md`
13. `UI_COMPONENT_SPEC.md`
14. `V1_ACCEPTANCE_CRITERIA.md`
15. `LICENSE_REVIEW_MATRIX.md`

## Build Rule

Claude Code / Opus must read this pack after the two main blueprint files and before writing code.

## Non-Abbreviation Rule

Do not replace detailed implementation requirements with:

- “etc.”
- “and so on”
- “similar”
- “as needed”
- “future work”

When something is not decided, mark it as:

```text
OPEN QUESTION:
```

When something is parked, mark it as:

```text
PARKED:
```

When something is required for V1, mark it as:

```text
V1 REQUIRED:
```

## Source of Truth Hierarchy

1. `CereBro_V1_Revised_Architecture_Blueprint_FULL.md`
2. `CereBro_V1_Full_Companion_Build_Docs.md`
3. This implementation pack
4. Newer user-approved decision logs
5. Code comments and inline implementation notes

If this implementation pack conflicts with the master blueprint, stop and ask the user before changing architecture.



---

# FILE: TECH_STACK_DECISION.md

# CereBro V1 — Tech Stack Decision

## 1. Final V1 Stack Decision

CereBro V1 should be built as a local-first web application first, with a desktop wrapper later only if needed.

## 2. Primary App Architecture

### V1 Required

Use:

- Next.js local web app
- TypeScript
- React
- Tailwind CSS
- shadcn/ui-style component approach
- SQLite for structured local app data
- File system for artifacts, Markdown notes, logs, exports, and rendered files
- Chroma or compatible vector database for semantic memory
- Ollama for local model access
- Playwright-compatible browser layer for browser automation and app testing
- Local scheduler for Piccolo jobs
- Environment-based configuration through `.env.local`
- Local-first storage paths configurable in Settings

### V1 Not Required

Do not require on day one:

- Tauri
- Electron
- Docker
- n8n
- Kestra
- Penpot
- Immich
- Trilium
- Skyvern
- Stirling PDF
- A full browser automation platform
- A full media vault
- Full Raven Reviews implementation

## 3. App Shell Decision

### Decision

Start with:

```text
Local Next.js web app
```

Run it locally at:

```text
http://localhost:3000
```

### Reason

This is the fastest and least fragile path for Claude Code / Opus to build.

It supports:

- Modern React UI
- Local API routes
- File access through server-side code
- SQLite integration
- Obsidian/Markdown writes
- Browser integration later
- Notion API later
- Tauri/Electron wrapper later

### Deferred

Desktop wrapper is deferred.

Future wrappers:

- Tauri if lightweight desktop integration is needed
- Electron only if Tauri becomes too limiting

## 4. Package Manager Decision

### Recommended Default

Use:

```text
pnpm
```

### Reason

- Fast
- Reliable lockfile
- Good monorepo support if CereBro grows
- Common in modern TypeScript projects

### Acceptable Alternative

If Claude Code determines `pnpm` creates friction on the user's machine, use `npm`.

### Do Not Use Without Reason

- Yarn classic
- Bun as primary package manager for V1

Bun may be used later if tested.

## 5. Frontend Stack

### Required

- React
- TypeScript
- Tailwind CSS
- shadcn/ui component style
- lucide-react icons
- class-variance-authority for component variants if needed
- zod for runtime validation
- react-hook-form for forms if forms become complex

### UI Principles

- Desktop-first
- Local app feel
- Fast loading
- No over-animation
- No generic SaaS slop
- Clear agent states
- Clear task states
- Clear permission prompts
- Clear validation states

## 6. Backend / Local API Stack

### Required

Use Next.js server-side API routes or route handlers for:

- Project CRUD
- Task CRUD
- Session CRUD
- Source Library CRUD
- Artifact CRUD
- Memory proposal CRUD
- Validation report CRUD
- Approval event logging
- Tool call logging
- Workflow job registry
- Model registry
- Settings
- File writes
- Obsidian writes
- Notion Bridge integration
- Browser adapter calls
- Chroma integration

### Boundary Rule

Frontend should not directly write to the file system, SQLite, Chroma, Notion, or browser tools.

All side effects go through local API/server layer.

## 7. Database Stack

### Required

Use SQLite as the main structured database.

### Recommended Library

Use Drizzle ORM with SQLite.

### Reason

- TypeScript friendly
- Schema-driven
- Migrations
- Lower overhead than full Prisma for a local app
- Easier to inspect SQL
- Works well with SQLite

### Acceptable Alternative

Use `better-sqlite3` with raw SQL if Drizzle causes build issues.

### Do Not Use As Primary V1 Database

- PostgreSQL
- MySQL
- Supabase
- Firebase
- Chroma
- Notion
- Obsidian Markdown files

## 8. Vector Memory Stack

### Required

Use Chroma or compatible vector database as semantic memory layer.

### Role

Chroma stores vector-searchable memory and source summaries.

### Chroma Must Not Store

- Secrets
- Raw private tokens
- Raven Reviews private memory unless sealed module is explicitly built
- Main structured app state
- Unvalidated hallucinated claims

### Metadata Required For Every Entry

- memory_id
- project_id
- task_id if available
- source_id if available
- type
- sensitivity
- created_at
- updated_at
- confidence
- tags
- origin_agent
- validation_status

## 9. Local Model Stack

### Required

Use Ollama as the local model interface.

### Model Router Must Support

- Local models
- External/cloud fallback models
- Embedding models
- Disabled models
- User approval for cloud escalation
- Model capability tags
- Hardware notes
- Privacy notes

### Do Not Hardcode One Model Per Agent

Agents route to model classes.

Example:

- Aang uses lightweight conversational model for simple tasks.
- C-3PO uses formatting model class.
- Tony uses coding/reasoning model class.
- Batman uses reasoning model class.
- Oak uses validation model class.
- Silver Surfer uses summarization/research model class.
- Gojo uses creative/design model class.

## 10. Browser Stack

### Required In V1

Start with a browser adapter interface.

Implement in this order:

1. Static source ingestion
2. Playwright-compatible browsing/testing
3. Crawl4AI-style extraction if selected
4. Browser Use or Stagehand-style automation if selected
5. Advanced browser automation only after permission system is stable

### Browser Adapter Must Support

- navigate
- extract
- screenshot
- summarize
- save_source
- close_session
- log_action

### Browser Adapter Must Not

- Run always-on
- Browse private accounts without approval
- Bypass user permission rules
- Scrape illegally
- Save private browser data into core memory by default

## 11. Scheduler Stack

### Required

Build a simple local scheduler for V1.

### Jobs

- Cleanup reports
- Backup checks
- Log pruning proposals
- Export organization
- Obsidian sync checks
- Notion sync checks if enabled

### Deferred

n8n/Kestra compatibility is a future pattern, not a V1 dependency.

## 12. File Storage Stack

### Required

Use local file system with configurable root.

Default local root:

```text
~/CereBro
```

External SSD root if configured:

```text
/Volumes/[SSD_NAME]/CereBro
```

Folders:

```text
/apps
/config
/data
/data/sqlite
/data/chroma
/data/projects
/data/tasks
/data/sessions
/data/sources
/data/artifacts
/data/logs
/obsidian-vault
/notion-exports
/skills
/design-systems
/adapters
/models
/renders
/backups
/temp
```

## 13. Environment Variables

Create `.env.example` with:

```bash
CEREBRO_APP_ENV=local
CEREBRO_ROOT_PATH=~/CereBro
CEREBRO_SQLITE_PATH=~/CereBro/data/sqlite/cerebro.sqlite
CEREBRO_OBSIDIAN_VAULT_PATH=~/CereBro/obsidian-vault
CEREBRO_CHROMA_PATH=~/CereBro/data/chroma
CEREBRO_OUTPUTS_PATH=~/CereBro/data/artifacts
CEREBRO_LOGS_PATH=~/CereBro/data/logs

OLLAMA_BASE_URL=http://localhost:11434

NOTION_ENABLED=false
NOTION_API_KEY=
NOTION_ROOT_PAGE_ID=

BROWSER_TOOLS_ENABLED=false
BROWSER_PRIVATE_SESSIONS_ENABLED=false

EXTERNAL_MODELS_ENABLED=false
EXTERNAL_MODEL_APPROVAL_REQUIRED=true

RAVEN_REVIEWS_ENABLED=false
RAVEN_REVIEWS_SEALED=true
```

## 14. Recommended Initial Dependencies

### Core

```bash
pnpm add zod nanoid date-fns
```

### UI

```bash
pnpm add lucide-react class-variance-authority clsx tailwind-merge
```

### Database

```bash
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
```

### Forms

```bash
pnpm add react-hook-form @hookform/resolvers
```

### Browser

```bash
pnpm add playwright
```

### Testing

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright
```

### Optional Later

```bash
pnpm add framer-motion
pnpm add @notionhq/client
```

## 15. Architecture Guardrail

Do not start by adding advanced tools.

The build order is:

1. Database
2. Local persistence
3. Shell UI
4. Project/task/session system
5. Harness
6. Agents registry
7. Skills
8. Source/output libraries
9. Memory proposals
10. Oak validation
11. Obsidian writes
12. Chroma
13. Notion
14. Browser automation
15. Model router
16. Piccolo scheduler
17. Advanced creative/video tools

## 16. Open Technical Questions

These should be answered during build if needed:

1. Whether Drizzle is better than raw `better-sqlite3` after first migration.
2. Whether Chroma runs as local service or embedded process.
3. Whether Notion integration should be enabled before or after Output Library is stable.
4. Whether Playwright alone is enough before adding Browser Use or Stagehand.
5. Whether Tauri wrapper is necessary after local web V1 works.



---

# FILE: SETUP_AND_INSTALL.md

# CereBro V1 — Setup and Install Guide

## 1. Purpose

This file defines the setup process for building and running CereBro V1 locally.

The goal is to make CereBro usable on the user’s MacBook without requiring paid services, hosted infrastructure, or an external SSD on day one.

## 2. Prerequisites

### Required

- macOS
- Terminal access
- Node.js current long-term-support version
- pnpm
- Git
- SQLite support
- Ollama installed locally
- A code editor
- Browser for local app usage

### Recommended

- External SSD for long-term storage
- Obsidian installed if the user wants to open the local vault manually
- Notion account if the user enables Notion Bridge later
- Claude Code / Opus for build execution

### Not Required On Day One

- Docker
- n8n
- Kestra
- Penpot
- Immich
- Tauri
- Electron
- Full browser automation
- Notion token
- Paid API keys
- External models

## 3. Initial Repository Setup

### Step 1: Create project folder

```bash
mkdir -p ~/CereBroBuild
cd ~/CereBroBuild
```

### Step 2: Initialize repository

```bash
git init
```

### Step 3: Create Next.js app

Preferred:

```bash
pnpm create next-app@latest cerebro
```

Choose:

```text
TypeScript: yes
ESLint: yes
Tailwind CSS: yes
src directory: yes
App Router: yes
Turbopack: optional
Import alias: yes
```

### Step 4: Enter project

```bash
cd cerebro
```

### Step 5: Install required dependencies

```bash
pnpm add zod nanoid date-fns lucide-react class-variance-authority clsx tailwind-merge
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3 vitest @testing-library/react @testing-library/jest-dom jsdom playwright
```

### Step 6: Create CereBro local root

```bash
mkdir -p ~/CereBro
mkdir -p ~/CereBro/config
mkdir -p ~/CereBro/data/sqlite
mkdir -p ~/CereBro/data/chroma
mkdir -p ~/CereBro/data/projects
mkdir -p ~/CereBro/data/tasks
mkdir -p ~/CereBro/data/sessions
mkdir -p ~/CereBro/data/sources
mkdir -p ~/CereBro/data/artifacts
mkdir -p ~/CereBro/data/logs
mkdir -p ~/CereBro/obsidian-vault
mkdir -p ~/CereBro/notion-exports
mkdir -p ~/CereBro/skills
mkdir -p ~/CereBro/design-systems
mkdir -p ~/CereBro/adapters
mkdir -p ~/CereBro/models
mkdir -p ~/CereBro/renders
mkdir -p ~/CereBro/backups
mkdir -p ~/CereBro/temp
```

## 4. Environment File

Create:

```bash
cp .env.example .env.local
```

If `.env.example` does not exist yet, create it with:

```bash
CEREBRO_APP_ENV=local
CEREBRO_ROOT_PATH=~/CereBro
CEREBRO_SQLITE_PATH=~/CereBro/data/sqlite/cerebro.sqlite
CEREBRO_OBSIDIAN_VAULT_PATH=~/CereBro/obsidian-vault
CEREBRO_CHROMA_PATH=~/CereBro/data/chroma
CEREBRO_OUTPUTS_PATH=~/CereBro/data/artifacts
CEREBRO_LOGS_PATH=~/CereBro/data/logs

OLLAMA_BASE_URL=http://localhost:11434

NOTION_ENABLED=false
NOTION_API_KEY=
NOTION_ROOT_PAGE_ID=

BROWSER_TOOLS_ENABLED=false
BROWSER_PRIVATE_SESSIONS_ENABLED=false

EXTERNAL_MODELS_ENABLED=false
EXTERNAL_MODEL_APPROVAL_REQUIRED=true

RAVEN_REVIEWS_ENABLED=false
RAVEN_REVIEWS_SEALED=true
```

## 5. Ollama Setup

### Step 1: Install Ollama

Install Ollama through the official macOS installer.

### Step 2: Confirm Ollama is running

```bash
ollama list
```

### Step 3: Pull a small local model first

Use a lightweight model first to test the pipeline.

Example placeholder:

```bash
ollama pull [LIGHTWEIGHT_MODEL]
```

Do not start by downloading huge models.

### Step 4: Add model to CereBro registry

After the Model Router exists, register models in the app UI or seed file.

## 6. Database Setup

### Step 1: Create schema folder

```bash
mkdir -p src/db
mkdir -p src/db/migrations
```

### Step 2: Create Drizzle config

Create:

```text
drizzle.config.ts
```

### Step 3: Create schema files

Create:

```text
src/db/schema/projects.ts
src/db/schema/tasks.ts
src/db/schema/sessions.ts
src/db/schema/sources.ts
src/db/schema/artifacts.ts
src/db/schema/memory-proposals.ts
src/db/schema/validations.ts
src/db/schema/approval-events.ts
src/db/schema/tool-calls.ts
src/db/schema/workflows.ts
src/db/schema/errors.ts
src/db/schema/model-registry.ts
```

### Step 4: Create migrations

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

If Drizzle migration fails, use raw SQL migration files through `better-sqlite3`.

## 7. First Run

### Step 1: Start dev server

```bash
pnpm dev
```

### Step 2: Open app

```text
http://localhost:3000
```

### Step 3: First-run wizard should appear

The wizard must ask for:

- CereBro root path
- SQLite path
- Obsidian vault path
- Whether Notion is enabled
- Whether browser tools are enabled
- Whether external models are enabled
- Whether Raven Reviews remains sealed/disabled
- First Project Space name
- Approval strictness level

## 8. Verification Checklist

After setup, verify:

- App loads
- Local root path exists
- SQLite database file exists
- Project can be created
- Task can be created
- Session can start
- Agent registry loads
- Skill folder exists
- Obsidian vault path exists
- Output folder exists
- Logs folder exists
- Model registry screen loads
- Notion is disabled unless configured
- Browser tools are disabled unless configured
- Raven Reviews is sealed/disabled unless explicitly enabled

## 9. Common Setup Failures

### Node Not Found

Fix:

Install Node current long-term-support version and restart terminal.

### pnpm Not Found

Fix:

Install pnpm globally or use Corepack if available.

### SQLite Permission Error

Fix:

Check `CEREBRO_SQLITE_PATH`.

Ensure the folder exists and is writable.

### Ollama Not Responding

Fix:

Run:

```bash
ollama list
```

Check `OLLAMA_BASE_URL`.

### Notion Export Fails

Expected if Notion is disabled or token is missing.

No Notion write should occur until user configures it.

### Browser Tools Disabled

Expected by default.

Browser tools must be enabled in Settings.

## 10. External SSD Setup Later

When the user gets an external SSD:

1. Create root folder:

```bash
mkdir -p /Volumes/[SSD_NAME]/CereBro
```

2. Copy large folders first:

```text
models
renders
backups
data/chroma
data/artifacts
browser-captures
```

3. Update paths in Settings.

4. Run Piccolo backup verification.

5. Do not delete internal copies until backup is verified.

## 11. Restore Procedure

To restore CereBro:

1. Install app dependencies.
2. Restore `~/CereBro` or SSD root.
3. Restore SQLite file.
4. Restore Obsidian vault.
5. Restore Chroma folder if used.
6. Restore artifacts.
7. Launch app.
8. Run system health check.
9. Reconnect Notion if needed.
10. Reconnect Ollama if needed.

## 12. Setup Done Means

Setup is complete when:

- App launches
- Project can be created
- Task can be created
- Local paths are configured
- SQLite persists data
- Agent registry loads
- Skills folder exists
- Output Library path exists
- Obsidian vault path exists
- Model Router can see at least one local model or show setup instructions
- Settings page shows system health



---

# FILE: MODEL_ROUTING_AND_HARDWARE_PLAN.md

# CereBro V1 — Model Routing and Hardware Plan

## 1. Purpose

CereBro must be realistic about the user’s MacBook hardware.

The system should not assume every agent has a massive model running locally.

CereBro should route work by:

- Task type
- Complexity
- Privacy level
- Context size
- Hardware limits
- Cost preference
- User approval

## 2. Core Decision

CereBro is local-first, not local-only.

Default:

```text
Use local/Ollama models when possible.
Escalate to stronger external/cloud models only when needed and approved.
```

## 3. Model Classes

### 3.1 `lightweight_formatter`

Use for:

- Formatting
- Simple summaries
- Meeting note structure
- Checklist cleanup
- Basic classification
- Low-risk C-3PO work

Privacy:

- Local preferred

### 3.2 `local_summary`

Use for:

- Summarizing local notes
- Summarizing sources
- Extracting key points
- Creating source cards
- Drafting simple guides

Privacy:

- Local preferred

### 3.3 `local_code_helper`

Use for:

- Small code explanations
- Simple bug ideas
- File structure suggestions
- Basic implementation plans

Privacy:

- Local preferred

### 3.4 `local_reasoner`

Use for:

- Medium reasoning
- Planning
- Tradeoffs
- Light architecture
- Spock sanity checks
- Batman basic analysis

Privacy:

- Local preferred if hardware supports it

### 3.5 `strong_reasoning_external`

Use for:

- Important architecture decisions
- Complex tradeoffs
- Large context reasoning
- Critical blueprint revisions
- High-risk planning

Privacy:

- Requires approval if private context is included

### 3.6 `strong_coding_external`

Use for:

- Complex code generation
- Refactors
- Multi-file debugging
- Claude Code handoff refinement
- Large technical plans

Privacy:

- Requires approval if private code/context is included

### 3.7 `long_context_external`

Use for:

- Large blueprint reviews
- Multi-file reasoning
- Large source comparison
- Cross-document consistency checks

Privacy:

- Requires approval if private context is included

### 3.8 `embedding`

Use for:

- Chroma/vector memory
- Source indexing
- Semantic search

Privacy:

- Local preferred

## 4. Agent To Model Class Mapping

### Aang

Default:

- `lightweight_formatter`
- `local_summary`

Escalate to:

- `local_reasoner` for complicated guidance

### Cortana

Default:

- `local_reasoner`
- rule-based routing where possible

Escalate to:

- `strong_reasoning_external` only if routing requires complex architecture judgment

### Batman

Default:

- `local_reasoner`

Escalate to:

- `strong_reasoning_external` for major architecture, high-stakes tradeoffs, or long-context plans

### Tony Stark

Default:

- `local_code_helper`
- `local_reasoner`

Escalate to:

- `strong_coding_external`
- `long_context_external`

### Gojo

Default:

- `local_reasoner`
- `lightweight_formatter`

Escalate to:

- `strong_reasoning_external` for complex UI/UX system design
- creative external models only if approved

### Silver Surfer

Default:

- `local_summary`
- `local_reasoner`

Escalate to:

- `long_context_external` for large source comparison

### C-3PO

Default:

- `lightweight_formatter`
- `local_summary`

Escalate to:

- rarely needed unless document is huge

### Professor Oak

Default:

- `local_reasoner`

Escalate to:

- `strong_reasoning_external`
- `long_context_external`

### Piccolo

Default:

- rule-based logic
- `lightweight_formatter` for reports

Escalate to:

- not usually needed

### Spock

Default:

- `local_reasoner`

Escalate to:

- `strong_reasoning_external` for architecture contradiction checks

## 5. Hardware Profile Fields

The user’s exact MacBook hardware must be stored in Settings.

Fields:

```json
{
  "device_name": "",
  "chip_or_cpu": "",
  "ram_gb": null,
  "internal_storage_total_gb": null,
  "internal_storage_free_gb": null,
  "external_ssd_connected": false,
  "external_ssd_path": "",
  "gpu_available": "",
  "ollama_installed": false,
  "notes": ""
}
```

## 6. Model Registry Fields

Every model profile must include:

```json
{
  "id": "",
  "name": "",
  "provider": "",
  "location": "local",
  "model_class": "",
  "enabled": true,
  "context_window": null,
  "estimated_ram_need": "",
  "estimated_disk_need": "",
  "best_for": [],
  "avoid_for": [],
  "privacy_notes": "",
  "cost_notes": "",
  "hardware_notes": "",
  "tested_on_device": false,
  "test_result": "",
  "last_tested_at": ""
}
```

## 7. Local Model Testing Procedure

Before using a local model heavily:

1. Confirm model is installed.
2. Run simple prompt.
3. Run formatting prompt.
4. Run summary prompt.
5. Run reasoning prompt.
6. Measure response time.
7. Check memory pressure manually if possible.
8. Save result in model registry.

Test record:

```json
{
  "model_id": "",
  "test_type": "",
  "prompt_size": "",
  "response_time_seconds": null,
  "quality_rating": "unknown",
  "speed_rating": "unknown",
  "stability": "unknown",
  "notes": ""
}
```

Quality ratings:

- poor
- usable
- good
- strong

Speed ratings:

- too_slow
- slow
- usable
- fast

Stability:

- failed
- unstable
- stable

## 8. Model Escalation Prompt

Before using external/cloud model:

```text
This task may exceed the reliable local model capacity.

Reason:
[reason]

Recommended external model class:
[class]

Context that may be sent:
[summary]

Sensitive data included:
[yes/no]

Cost risk:
[low/medium/high/unknown]

Approve external escalation?
```

Options:

- Approve once
- Approve for this task
- Use local only
- Cancel task
- Redact context first

## 9. Local-Only Mode

CereBro must support local-only mode.

When local-only mode is enabled:

- No external models
- No cloud APIs
- No Notion write unless user explicitly enables it
- No web research unless browser/web is enabled
- All tasks must use local models or rule-based logic
- If local model cannot handle task, CereBro says so and offers options

## 10. External Model Mode

External models are disabled by default.

If enabled:

- Each provider must be registered
- Each provider must have privacy notes
- Each provider must have approval policy
- External calls must be logged
- Private/sealed memory must not be sent
- Secrets must be masked

## 11. Minimum Viable Model Setup

Minimum V1 can work with:

1. One lightweight local model for formatting/simple summaries.
2. One embedding model for Chroma.
3. External Claude Code / Opus for actual building outside CereBro.
4. Optional stronger local coding/reasoning model if hardware allows.

CereBro should not require a giant local model to start.

## 12. What Not To Install First

Do not start by installing:

- Huge 70B+ models
- Multiple redundant coding models
- Heavy image/video generation models
- Full ComfyUI setup
- Full SDXL model library
- Raven Reviews generation models

Install only what the current phase needs.

## 13. SSD Impact

An external SSD helps with:

- Storing models
- Storing Chroma database
- Storing rendered videos
- Storing generated images
- Storing browser captures
- Storing backups
- Keeping internal drive from filling up

An external SSD does not magically increase RAM.

An external SSD does not make too-large models run well if RAM/compute are insufficient.

An external SSD reduces storage pressure and can improve workflow organization, but model speed still depends heavily on CPU/GPU/RAM.

## 14. Model Router Done Means

Model Router is complete when:

- Models can be registered
- Models have classes
- Agents request model classes, not specific hardcoded models
- Local-only mode works
- External escalation requires approval
- Model calls are logged
- Failed model calls create structured errors
- Settings page displays model status



---

# FILE: STORAGE_BACKUP_AND_FILE_LIFECYCLE.md

# CereBro V1 — Storage, Backup, and File Lifecycle

## 1. Purpose

CereBro is local-first.

Local-first only works if files are organized, backed up, and cleaned safely.

Piccolo cannot safely clean the system unless file lifecycle rules are explicit.

## 2. Root Storage Paths

### Default Internal Path

```text
~/CereBro
```

### External SSD Path

```text
/Volumes/[SSD_NAME]/CereBro
```

### Cloud Backup Mirror Optional Path

Examples:

```text
~/Library/CloudStorage/GoogleDrive-[ACCOUNT]/My Drive/CereBro_Backup
~/Library/Mobile Documents/com~apple~CloudDocs/CereBro_Backup
~/Dropbox/CereBro_Backup
```

Cloud backup is optional and must be user-configured.

## 3. Folder Structure

```text
/CereBro
  /apps
  /config
  /data
    /sqlite
    /chroma
    /projects
    /tasks
    /sessions
    /sources
    /artifacts
    /logs
    /tool-calls
    /validations
    /approvals
    /errors
  /obsidian-vault
  /notion-exports
  /skills
  /design-systems
  /adapters
  /models
  /renders
  /browser-captures
  /backups
  /temp
  /archive
```

## 4. Folder Ownership

### `/config`

Stores:

- local settings
- path config
- model registry export
- tool registry export
- user preferences that are not sensitive secrets

Does not store:

- API keys
- OAuth secrets
- raw tokens

### `/data/sqlite`

Stores:

- `cerebro.sqlite`
- SQLite backups
- migration metadata

Backup priority:

High.

### `/data/chroma`

Stores:

- vector database files
- semantic memory index

Backup priority:

Medium to high.

If lost, can be partially rebuilt from Obsidian/sources, but not perfectly.

### `/data/projects`

Stores:

- project metadata exports
- project package snapshots
- per-project indexes

Backup priority:

High.

### `/data/sources`

Stores:

- source text extracts
- source metadata exports
- imported source files if copied into CereBro

Backup priority:

High if sources are not available elsewhere.

### `/data/artifacts`

Stores:

- generated outputs
- Markdown docs
- PDFs
- images
- videos
- design specs
- build handoffs
- exported reports

Backup priority:

High.

### `/data/logs`

Stores:

- app logs
- agent logs
- tool logs
- workflow logs

Backup priority:

Medium.

Logs can be pruned after summaries and backups.

### `/obsidian-vault`

Stores:

- human-readable Markdown notes
- project notes
- decision logs
- build logs
- source summaries
- guides

Backup priority:

Very high.

### `/notion-exports`

Stores:

- local copies of Notion-bound content
- export packages
- failed export drafts

Backup priority:

High.

### `/skills`

Stores:

- skill files

Backup priority:

Very high.

### `/design-systems`

Stores:

- design system Markdown files
- UI rules
- visual references metadata

Backup priority:

Very high.

### `/models`

Stores:

- model metadata
- optional model files if the app manages paths
- notes about installed Ollama models

Backup priority:

Low to medium.

Models can usually be redownloaded, but model registry should be backed up.

### `/renders`

Stores:

- Remotion renders
- video exports
- preview renders

Backup priority:

Medium to high depending on user value.

### `/browser-captures`

Stores:

- screenshots
- extracted page snapshots
- browser session artifacts

Backup priority:

Medium.

### `/backups`

Stores:

- local backup snapshots
- compressed project exports
- database backups

Backup priority:

Very high.

### `/temp`

Stores:

- temporary working files
- scratch outputs
- intermediate conversions

Backup priority:

Low.

Piccolo may clean this with safe rules.

### `/archive`

Stores:

- old completed projects
- old artifacts
- pruned logs
- historical exports

Backup priority:

Medium to high.

## 5. File Naming Rules

### Project Folders

```text
YYYY-MM-DD_project-slug
```

Example:

```text
2026-05-04_cerebro-os
```

### Task Files

```text
task_[task_id]_[short-slug].md
```

### Output Files

```text
YYYY-MM-DD_[project]_[output-type]_[short-slug].md
```

### Validation Reports

```text
validation_[validation_id]_[task_id].md
```

### Changelog Files

```text
CHANGELOG_YYYY-MM.md
```

### Backup Files

```text
cerebro_backup_YYYY-MM-DD_HH-mm.zip
```

## 6. Backup Classes

### Critical

Must be backed up before destructive cleanup:

- SQLite database
- Obsidian vault
- Skills
- Design systems
- Project metadata
- Memory proposal records
- Validation records
- Output Library metadata

### Important

Should be backed up regularly:

- Artifacts
- Source extracts
- Notion exports
- Changelogs
- Browser captures linked to tasks
- Rendered videos user saved

### Rebuildable

Can be redownloaded or regenerated:

- Local model files
- Temporary browser cache
- Temporary render intermediates
- Failed export scratch files

### Disposable

Can be cleaned safely:

- `/temp` files older than safe retention
- failed scratch files
- cache files
- preview renders not linked to artifacts

## 7. Backup Frequency

### On Every Important Change

Back up:

- SQLite
- Changelog
- Important output metadata

### Daily If App Was Used

Back up:

- SQLite
- Obsidian changed notes
- project metadata

### Weekly

Back up:

- complete project metadata
- sources
- outputs
- skills
- design systems
- selected artifacts

### Before Cleanup

Backup check must run before:

- deleting files
- moving important folders
- pruning logs
- archiving projects
- changing storage root

## 8. Piccolo Cleanup Rules

### Safe Without Approval

Piccolo may clean:

- `/temp` files older than configured retention
- empty folders in `/temp`
- failed scratch files that are not linked to tasks
- duplicate temporary preview files

Only if:

- files are not linked to a task/artifact/source
- files are not in critical folders
- action is logged

### Approval Required

Piccolo must ask before:

- deleting logs
- moving artifacts
- archiving project folders
- deleting source extracts
- clearing browser captures
- deleting renders
- changing backup paths
- cleaning anything outside CereBro root

### Blocked Unless Explicitly Enabled

Piccolo must not:

- delete SQLite database
- delete Obsidian vault
- delete skills
- delete design systems
- delete project metadata
- delete backups
- clean system folders outside CereBro
- clean Desktop/Downloads unless explicitly configured

## 9. Restore Procedure

### Full Restore

1. Stop CereBro app.
2. Restore `cerebro.sqlite`.
3. Restore `/obsidian-vault`.
4. Restore `/skills`.
5. Restore `/design-systems`.
6. Restore `/data/projects`.
7. Restore `/data/artifacts`.
8. Restore `/data/sources`.
9. Restore `/data/chroma` if available.
10. Start CereBro.
11. Run system health check.
12. Run source/output consistency check.
13. Run Chroma rebuild if vector DB missing.
14. Verify project dashboards.
15. Verify model registry.

### Partial Restore

If only Obsidian survives:

- Rebuild project notes manually.
- Re-index notes into Chroma.
- Recreate missing SQLite metadata where possible.

If only SQLite survives:

- Artifact paths may be broken.
- Run file consistency checker.
- Mark missing files.
- Do not delete broken records automatically.

## 10. SSD Disconnect Behavior

If external SSD is configured and disconnects:

CereBro must:

- Detect missing root path
- Stop file writes to missing path
- Warn user
- Allow read-only mode if SQLite is unavailable
- Queue non-destructive writes only if safe
- Disable cleanup jobs
- Disable render jobs
- Disable model installs
- Ask user to reconnect or switch path

User message:

```text
The configured CereBro storage path is not available. I paused file writes and cleanup jobs to prevent data loss.
```

## 11. Cloud Backup Failure Behavior

If cloud backup fails:

- Do not delete local files.
- Create backup failure error.
- Show Piccolo warning.
- Retry only if configured.
- Let user choose new backup path.

## 12. File Lifecycle States

Files can be:

- draft
- active
- saved
- exported
- backed_up
- archived
- disposable
- missing
- broken_link

## 13. File Lifecycle Done Means

This system is complete when:

- Every artifact has metadata
- Every file path is tracked
- Important files have backup status
- Piccolo can scan safely
- Cleanup proposals are reviewable
- SSD disconnect is handled
- Restore procedure exists
- File deletion requires correct approval



---

# FILE: NOTION_INTEGRATION_SPEC.md

# CereBro V1 — Notion Integration Specification

## 1. Purpose

Notion is the polished human-facing output layer for CereBro.

It is not the primary database.

It is not the source of truth for app state.

It is where completed, useful, user-facing artifacts can be saved.

## 2. Core Decision

Build local Output Library first.

Then build Notion Bridge.

Notion integration must not be required for V1 startup.

## 3. Notion Bridge Role

The Notion Bridge is a logic layer, not an agent.

Allowed agents to request Notion Bridge actions:

- Aang
- C-3PO
- Piccolo

Other agents may propose output, but do not write to Notion directly.

## 4. Notion Write Rule

No Notion write happens without approval unless the user has configured a specific automation.

Default:

```text
Ask before creating or updating Notion pages.
```

## 5. Notion Setup Fields

Settings must support:

```json
{
  "notion_enabled": false,
  "notion_api_key_configured": false,
  "notion_root_page_id": "",
  "notion_projects_database_id": "",
  "notion_outputs_database_id": "",
  "notion_tasks_database_id": "",
  "notion_sources_database_id": "",
  "notion_inbox_database_id": "",
  "default_export_behavior": "ask_every_time"
}
```

## 6. Notion Databases

### 6.1 Projects Database

Properties:

- Name
- Status
- Description
- CereBro Project ID
- Tags
- Active Tasks
- Last Updated
- Related Outputs
- Related Sources

### 6.2 Outputs Database

Properties:

- Title
- Output Type
- CereBro Artifact ID
- Project
- Task ID
- Created Date
- Updated Date
- Validation Status
- Source Links
- Tags
- Saved By Agent

### 6.3 Tasks Database

Properties:

- Title
- CereBro Task ID
- Project
- Status
- Mode
- Owner Agent
- Priority
- Created Date
- Updated Date
- Next Action
- Related Outputs

### 6.4 Sources Database

Properties:

- Title
- Source Type
- URL
- CereBro Source ID
- Project
- Trust Level
- Retrieved Date
- Tags
- Summary

### 6.5 Inbox Database

Properties:

- Title
- Capture Type
- URL/File/Note
- Captured Date
- Status
- Project Suggestion
- Processing Notes
- Processed Output

## 7. Notion Page Templates

### 7.1 Guide Page

```md
# [Guide Title]

## Overview

## Why This Matters

## Step-by-Step

## Checklist

## Resources

## Notes

## Next Actions
```

### 7.2 Checklist Page

```md
# [Checklist Title]

## Goal

## Before You Start

## Checklist

## Validation

## Done Means
```

### 7.3 Learning Page

```md
# [Topic] Learning Guide

## Goal

## Beginner Explanation

## Core Concepts

## Examples

## Practice

## Videos / Resources

## Quiz

## Next Lesson
```

### 7.4 Recipe Page

```md
# [Recipe Name]

## Ingredients

## Instructions

## Timing

## Grocery List

## Notes
```

### 7.5 Build Plan Page

```md
# [Build Plan Title]

## Objective

## Requirements

## Non-Goals

## Architecture

## Implementation Phases

## Test Plan

## Risks

## Claude Code Handoff

## Acceptance Criteria
```

## 8. Sync Direction

### V1 Required

CereBro → Notion export.

### V1 Optional

Notion Inbox → CereBro import.

### Deferred

Full two-way sync.

## 9. Conflict Rules

If Notion page was edited manually:

- Do not overwrite silently.
- Fetch latest page metadata if possible.
- Create conflict warning.
- Offer:
  - create new version
  - overwrite Notion
  - keep local only
  - manually merge

## 10. Notion Export Approval Prompt

```text
Save this to Notion?

Title:
Output type:
Project:
Destination:
Sources included:
Validation status:

Approve export?
```

Options:

- Save once
- Save and remember this destination
- Save locally only
- Cancel

## 11. Failed Export Behavior

If export fails:

- Save output locally
- Create Notion sync error
- Show retry option
- Do not lose content
- Do not mark artifact as exported

## 12. Notion Integration Done Means

Notion integration is complete when:

- User can configure token and root page/database IDs
- User can export an artifact to Notion with approval
- Local artifact stores Notion page ID
- Failed export preserves local output
- Notion writes are logged
- Notion is optional



---

# FILE: OBSIDIAN_INTEGRATION_SPEC.md

# CereBro V1 — Obsidian Integration Specification

## 1. Purpose

Obsidian is the local human-readable knowledge vault for CereBro.

It stores durable project knowledge in Markdown.

It should remain useful even if CereBro is not running.

## 2. Core Decision

Obsidian is:

- Human-readable
- Local
- Markdown-based
- Project/decision/source/build oriented

Obsidian is not:

- The main app database
- The vector database
- The artifact file registry
- A replacement for SQLite
- A replacement for Chroma

## 3. Vault Path

Default:

```text
~/CereBro/obsidian-vault
```

External SSD option:

```text
/Volumes/[SSD_NAME]/CereBro/obsidian-vault
```

## 4. Vault Folder Structure

```text
/obsidian-vault
  /Projects
  /Decisions
  /Guides
  /Sources
  /Build Logs
  /Learning
  /Templates
  /Changelogs
  /Daily Notes
  /Indexes
```

## 5. Project Folder Structure

For each project:

```text
/Projects/[project-slug]
  index.md
  decisions.md
  sources.md
  tasks.md
  outputs.md
  changelog.md
  notes.md
```

## 6. Frontmatter Standard

Every CereBro-created Obsidian note must include:

```yaml
---
title:
type:
project_id:
project_name:
task_id:
source_id:
artifact_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---
```

Fields may be blank if not applicable.

## 7. Note Naming Conventions

### Project Index

```text
index.md
```

### Decision Note

```text
YYYY-MM-DD_decision_[short-slug].md
```

### Source Note

```text
YYYY-MM-DD_source_[short-slug].md
```

### Build Log

```text
YYYY-MM-DD_build-log_[task-id].md
```

### Guide

```text
YYYY-MM-DD_guide_[short-slug].md
```

### Learning Note

```text
YYYY-MM-DD_learning_[topic-slug].md
```

## 8. Obsidian Note Templates

### 8.1 Project Index

```md
---
title:
type: project_index
project_id:
project_name:
created_at:
updated_at:
tags:
---

# [Project Name]

## Purpose

## Current Status

## Active Tasks

## Recent Decisions

## Sources

## Outputs

## Open Questions

## Next Actions
```

### 8.2 Decision Note

```md
---
title:
type: decision
project_id:
task_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---

# Decision: [Title]

## Decision

## Reasoning

## Alternatives Considered

## Tradeoffs

## Risks

## What This Changes

## What This Does Not Change

## Related Tasks

## Related Sources
```

### 8.3 Source Note

```md
---
title:
type: source_summary
project_id:
source_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---

# Source: [Title]

## Source Location

## Type

## Retrieved

## Summary

## Key Points

## Why This Matters

## Trust Notes

## Related Tasks

## Related Outputs
```

### 8.4 Build Log

```md
---
title:
type: build_log
project_id:
task_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---

# Build Log: [Task]

## Objective

## Changes Made

## Files Changed

## Tests Run

## Issues Found

## Validation

## Next Steps
```

## 9. Backlink Rules

Every Obsidian note created from a task should link to:

- Project index
- Related task
- Related source if applicable
- Related output if applicable
- Related decision if applicable

Use Markdown links.

## 10. Chroma Linkback Rules

When a note is embedded into Chroma, Chroma metadata must include:

- Obsidian file path
- Project ID
- Task ID if available
- Note type
- Created date
- Updated date
- Tags
- Validation status

## 11. Write Approval Rules

Approval required for:

- Major architecture notes
- User preference memory
- Project decision notes
- Anything sensitive
- Raven/export bridge notes

No approval required for:

- Automatic operational build log summaries if user enabled this
- Source summaries if user explicitly added source to project
- Changelog entries after approved build task

## 12. Obsidian Write Failure

If writing fails:

- Save output locally in Output Library
- Create structured error
- Do not mark memory as written
- Show user recovery path

## 13. Obsidian Integration Done Means

Obsidian integration is complete when:

- Vault path can be configured
- Project folders are created
- Markdown notes can be written
- Frontmatter is valid
- Notes link back to project/task/source
- SQLite stores Obsidian file path
- Chroma metadata links to Obsidian note
- Failed writes do not lose content



---

# FILE: MCP_AND_TOOL_REGISTRY_SPEC.md

# CereBro V1 — MCP and Tool Registry Specification

## 1. Purpose

CereBro needs a controlled tool system.

Tools must not become uncontrolled agent powers.

The Tool Registry defines what actions exist, who can request them, what approval is required, and how they are logged.

MCP compatibility is useful later but should not be required before the core system works.

## 2. Core Decision

V1 builds a local Tool Registry first.

MCP support is designed for compatibility but not required as a dependency on day one.

## 3. Tool Registry Fields

Each tool must be registered as:

```json
{
  "id": "",
  "name": "",
  "description": "",
  "category": "",
  "adapter": "",
  "status": "enabled",
  "permission_class": "safe",
  "allowed_agents": [],
  "allowed_modes": [],
  "requires_approval": false,
  "logs_required": true,
  "input_schema": {},
  "output_schema": {},
  "risk_notes": "",
  "created_at": "",
  "updated_at": ""
}
```

## 4. Tool Categories

### Local Data Tools

- project.read
- project.create
- project.update
- task.read
- task.create
- task.update
- session.read
- session.create
- session.update

### File Tools

- file.read
- file.write
- file.move
- file.copy
- file.delete
- file.archive
- file.exists

### Memory Tools

- memory.search
- memory.propose
- memory.validate
- memory.write_chroma
- memory.write_obsidian

### Output Tools

- artifact.create
- artifact.update
- artifact.export_markdown
- artifact.export_pdf
- artifact.export_notion

### Browser Tools

- browser.open
- browser.extract
- browser.screenshot
- browser.close
- browser.session.create
- browser.session.end

### Build Tools

- build.generate_handoff
- build.create_plan
- build.create_test_plan
- build.write_changelog

### Automation Tools

- workflow.create
- workflow.run
- workflow.pause
- workflow.log
- cleanup.scan
- backup.check

### Model Tools

- model.route
- model.call_local
- model.call_external
- model.test
- embedding.create

## 5. Permission Classes

### Safe

Can run without approval:

- read project metadata
- read task metadata
- create draft response
- search local memory
- create draft artifact
- scan safe temp directory

### Approval Required

Needs user approval:

- write file
- move file
- delete file
- update Notion
- update Obsidian
- call external model with private context
- run browser automation
- install packages
- run terminal commands
- enable recurring workflows

### Blocked Unless Enabled

Blocked by default:

- destructive cleanup
- private browser sessions
- sealed module access
- external account automation
- auto-posting
- unreviewed scripts
- background browsing

## 6. Tool Request Flow

```text
Agent requests tool
  ↓
Cortana/harness checks permission
  ↓
If safe: run and log
  ↓
If approval required: ask user
  ↓
If approved: run and log
  ↓
If rejected: mark blocked
  ↓
Oak validates if output is important
```

## 7. MCP Compatibility

### Future MCP Server Role

CereBro may expose tools to Claude Code/Cline as MCP tools later.

Potential MCP tools:

- cerebro.get_project
- cerebro.create_task
- cerebro.get_context_pack
- cerebro.save_artifact
- cerebro.propose_memory
- cerebro.get_blueprint
- cerebro.get_active_task
- cerebro.log_changelog

### Future MCP Client Role

CereBro may consume MCP tools later for:

- file system tools
- browser tools
- GitHub tools
- Notion tools
- local database tools

## 8. MCP Safety Rules

MCP tools must obey the same permission system.

No MCP tool can:

- bypass approvals
- bypass Oak validation
- write private memory into core memory
- access sealed Raven data without unlock
- run destructive actions silently
- send private context externally without approval

## 9. Tool Logging

Every tool call logs:

- tool ID
- agent ID
- task ID
- session ID
- input summary
- output summary
- permission class
- approval event ID if applicable
- started timestamp
- ended timestamp
- status
- error ID if failed

## 10. Tool Registry Done Means

Tool Registry is complete when:

- Tools have metadata
- Tools have permission classes
- Agents can only request allowed tools
- Approvals are enforced
- Tool calls are logged
- Failed tools create structured errors
- MCP compatibility is documented



---

# FILE: TESTING_STRATEGY.md

# CereBro V1 — Testing Strategy

## 1. Purpose

CereBro must be tested as a local-first system with persistence, routing, memory, tool permissions, and validation.

Do not rely only on manual testing.

## 2. Test Types

### Unit Tests

Use for:

- schemas
- helpers
- routing functions
- permission checks
- mode selection
- file path utilities
- model routing decisions
- validation status logic

### Integration Tests

Use for:

- SQLite operations
- task lifecycle
- project/task/session linking
- source creation
- artifact creation
- memory proposal flow
- validation reports
- approval events
- tool call logging

### UI Tests

Use for:

- app shell
- project creation
- task creation
- source library
- output library
- approval prompt
- validation report display
- settings screens

### End-to-End Tests

Use for:

- first-run onboarding
- create project → create task → generate output → validate → save artifact
- add source → summarize → save source
- create build task → generate Claude Code handoff → Oak validation
- Piccolo cleanup scan → approval prompt → report

### Manual QA

Use for:

- visual polish
- Gojo anti-slop review
- desktop layout
- external SSD behavior
- Obsidian file inspection
- Notion integration once enabled
- browser behavior once enabled

## 3. Recommended Test Tools

Use:

- Vitest for unit/integration tests
- React Testing Library for component behavior
- Playwright for end-to-end app tests
- SQLite test database
- Mock adapters for Notion, browser, external models, and Chroma

## 4. Required Test Folders

```text
/tests
  /unit
  /integration
  /e2e
  /fixtures
  /mocks
```

## 5. Test Database

Use separate test SQLite path:

```text
~/CereBroTest/data/sqlite/cerebro-test.sqlite
```

Never run tests against the real user database.

## 6. Required Unit Tests

### Routing

Test:

- Quick Mode routes correctly
- Explore Mode routes to Silver Surfer/Batman where appropriate
- Build Mode routes to Tony
- Creative requests route to Gojo
- Automation requests route to Piccolo
- Validation requests route to Oak
- Max active agent rule is enforced

### Permissions

Test:

- safe tool runs without approval
- approval tool blocks until approved
- destructive tool blocks by default
- external model requires approval when private context exists

### Task Status

Test transitions:

- inbox → planning
- planning → waiting_for_context
- planning → ready
- ready → in_progress
- in_progress → validating
- validating → complete
- validating → needs_revision
- any risky failure → blocked

### Model Router

Test:

- simple formatting maps to lightweight_formatter
- complex build maps to strong_coding_external candidate
- local-only mode blocks external candidate
- privacy warning appears

## 7. Required Integration Tests

### Project Task Session Flow

1. Create project
2. Create task
3. Start session
4. Generate context pack
5. Assign owner agent
6. Complete task
7. Verify all relationships

### Source Flow

1. Add source
2. Link to project
3. Summarize source
4. Create source record
5. Save source metadata
6. Verify source appears in project dashboard

### Memory Proposal Flow

1. Create memory proposal
2. Run Oak validation
3. Approve proposal
4. Write to fake Chroma/Obsidian adapter
5. Verify proposal status updated

### Output Flow

1. Create artifact
2. Run Oak validation
3. Approve save
4. Write local output
5. Verify artifact metadata

### Tool Logging Flow

1. Request tool
2. Check permission
3. Log started
4. Run mock tool
5. Log completed
6. Verify tool_call record

## 8. Required End-to-End Tests

### E2E-001 First Run

- App opens
- First-run wizard appears
- User chooses local root
- User disables Notion
- User disables browser tools
- User creates first project
- Dashboard appears

### E2E-002 Project Task Output

- Create project
- Create task
- Assign mode
- Generate draft output
- Oak validates
- Save artifact
- Artifact appears in Output Library

### E2E-003 Build Handoff

- Create build task
- Enter requirements
- Tony generates handoff
- Oak validates
- Handoff saved as artifact

### E2E-004 Memory Approval

- Agent proposes memory
- Oak reviews
- User approves
- Memory status updates
- Obsidian mock write appears

### E2E-005 Piccolo Cleanup Scan

- Create temp files in test root
- Run cleanup scan
- Show proposed actions
- Approve safe cleanup
- Verify only safe files removed

## 9. Manual QA Checklist

### Visual

- Layout fits MacBook screen
- Left rail does not crowd main workspace
- Right panel is readable
- Command bar is obvious
- Agent status is useful
- Validation status is clear
- Empty states are not generic
- UI does not look like basic SaaS template

### Functional

- Data persists after restart
- Project switching works
- Task status updates correctly
- Approval prompts are clear
- Output save works
- Error states are recoverable
- Settings values persist

### Safety

- Notion does not write when disabled
- Browser tools do not run when disabled
- External model does not run without approval
- Destructive cleanup does not run silently
- Raven Reviews remains sealed/disabled

## 10. Test Commands

Recommended scripts:

```json
{
  "test": "vitest",
  "test:unit": "vitest tests/unit",
  "test:integration": "vitest tests/integration",
  "test:e2e": "playwright test",
  "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
}
```

## 11. Definition Of Test Done

Testing system is complete when:

- Unit tests cover routing, permissions, model routing, and task status
- Integration tests cover core persistence flows
- E2E tests cover first-run, project/task/output, memory approval, and cleanup
- Manual QA checklist exists
- CI is optional but test scripts run locally



---

# FILE: FIRST_RUN_ONBOARDING.md

# CereBro V1 — First-Run Onboarding

## 1. Purpose

The first-run onboarding makes CereBro usable without assuming everything is configured.

The app should not fail because Notion, browser tools, external models, or an SSD are missing.

## 2. First-Run Trigger

Show onboarding when:

- No settings record exists
- No CereBro root path is configured
- No SQLite database exists
- User manually resets onboarding

## 3. Onboarding Steps

### Step 1: Welcome

Message:

```text
Welcome to CereBro.

This setup will configure your local workspace, storage paths, memory settings, and optional integrations.
```

Actions:

- Start setup
- Import existing setup

### Step 2: Choose Storage Root

Default:

```text
~/CereBro
```

Options:

- Use default
- Choose another folder
- Use external SSD

Warnings:

If external SSD chosen:

```text
If this drive disconnects, CereBro will pause file writes and cleanup jobs until it is available again.
```

### Step 3: Configure Obsidian Vault

Options:

- Create new vault inside CereBro
- Use existing Obsidian vault
- Skip for now

Recommended default:

```text
Create new vault inside CereBro.
```

### Step 4: Configure Notion

Options:

- Skip for now
- Configure Notion token
- Configure later

Default:

```text
Skip for now.
```

Message:

```text
Notion is optional. CereBro can save outputs locally first and export to Notion later.
```

### Step 5: Configure Ollama

Checks:

- Is Ollama reachable?
- Are models installed?

Options:

- Detect local models
- Skip model setup
- Open instructions

If no model found:

```text
No local models were detected. CereBro can still build the shell and local system. Model-powered actions will wait until Ollama is configured.
```

### Step 6: External Model Policy

Options:

- Local only
- Ask before external escalation
- Disable all external models for now

Default:

```text
Ask before external escalation.
```

### Step 7: Browser Tools

Options:

- Disabled
- Enable source ingestion only
- Enable browser automation with approval

Default:

```text
Disabled.
```

### Step 8: Approval Strictness

Options:

- Strict
- Balanced
- Fast

Recommended default:

```text
Balanced.
```

Strict:

- Ask before most writes/tools.

Balanced:

- Safe actions run, risky actions ask.

Fast:

- Safe and pre-approved recurring actions run, risky actions still ask.

### Step 9: Raven Reviews

Default:

```text
Sealed and disabled.
```

Message:

```text
Raven Reviews is outside the core CereBro workflow. It will remain sealed unless explicitly enabled later.
```

Options:

- Keep sealed
- Remove from visible settings
- Enable placeholder only

Recommended:

```text
Keep sealed.
```

### Step 10: Create First Project Space

Prompt:

```text
What should your first Project Space be?
```

Default suggestion:

```text
CereBro OS
```

### Step 11: System Health Check

Check:

- Root path exists
- SQLite path writable
- Obsidian path exists or skipped
- Output path exists
- Logs path exists
- Skills path exists
- Design systems path exists
- Ollama status
- Notion status
- Browser tools status
- External model status

### Step 12: Finish

Message:

```text
CereBro is ready.

You can start with Aang, create a task, add a source, or open your first Project Space.
```

## 4. First-Run Data Created

Create:

- settings record
- first project if provided
- default agents
- default modes
- default skill records
- default workflow records disabled/safe
- model registry placeholder
- root folder structure
- Obsidian folders if enabled

## 5. First-Run Must Not

First-run must not:

- Force Notion setup
- Force browser tools
- Force external models
- Force Raven Reviews
- Download huge models
- Delete files
- Move user files
- Write outside selected root without permission

## 6. First-Run Done Means

Done when:

- App has settings
- Root folders exist
- Database initialized
- Default agents exist
- Default skills exist
- First Project Space exists or user skipped
- User reaches Home screen



---

# FILE: CONTENT_ENGINE_SPEC.md

# CereBro V1 — Content Engine Specification

## 1. Purpose

The Content Engine turns ideas, research, and outputs into reusable content assets.

This comes from the Blotato-style lesson, but CereBro should not become an auto-posting content farm.

V1 should support planning and drafting content, not automatic publishing.

## 2. Ownership

Primary owner:

- Gojo

Supporting agents:

- C-3PO
- Silver Surfer
- Aang
- Oak
- Tony if content requires technical implementation

## 3. Content Engine Scope

### V1 Required

Support:

- Idea capture
- Research-backed content outline
- Script draft
- Carousel/thread outline
- Video outline
- Remotion plan
- Publishing checklist
- Repurposing plan
- Output Library storage

### V1 Not Required

Do not build:

- Auto-posting
- Social account automation
- Full content calendar automation
- Analytics ingestion
- Engagement scraping
- Paid platform integrations

## 4. Content Object Schema

```json
{
  "content_id": "",
  "project_id": "",
  "task_id": "",
  "title": "",
  "content_type": "",
  "status": "",
  "idea": "",
  "audience": "",
  "goal": "",
  "source_ids": [],
  "draft_artifact_ids": [],
  "platforms": [],
  "repurpose_targets": [],
  "created_at": "",
  "updated_at": "",
  "validation_status": ""
}
```

Content type enum:

- idea
- post
- thread
- carousel
- script
- video_outline
- remotion_plan
- newsletter
- guide
- checklist

Status enum:

- captured
- researching
- outlining
- drafting
- reviewing
- ready
- archived

## 5. Content Pipeline

```text
Idea capture
  ↓
Audience + goal
  ↓
Research/source pull
  ↓
Angle selection
  ↓
Outline
  ↓
Draft
  ↓
Format-specific adaptation
  ↓
Gojo creative pass
  ↓
C-3PO clarity pass
  ↓
Oak validation
  ↓
Save to Output Library
  ↓
Optional Notion export
```

## 6. Output Templates

### 6.1 Post Draft

```md
# Post Draft

## Goal

## Audience

## Hook

## Main Point

## Supporting Points

## CTA

## Notes

## Repurpose Options
```

### 6.2 Thread Outline

```md
# Thread Outline

## Topic

## Audience

## Promise

## Post 1 Hook

## Posts

1.
2.
3.

## Closing CTA

## Sources

## Repurpose Notes
```

### 6.3 Carousel Outline

```md
# Carousel Outline

## Topic

## Visual Direction

## Slide 1 Hook

## Slides

1.
2.
3.

## Final Slide CTA

## Design Notes

## Sources
```

### 6.4 Video Script

```md
# Video Script

## Goal

## Audience

## Duration

## Hook

## Sections

## Script

## Visual Notes

## B-Roll / Assets

## Captions

## CTA

## Remotion Notes
```

### 6.5 Repurposing Plan

```md
# Repurposing Plan

## Original Asset

## Core Idea

## Turn Into

- Short post
- Thread
- Carousel
- Video script
- Guide
- Checklist

## Notes Per Format
```

## 7. Content Quality Rules

Content must avoid:

- Generic motivational slop
- Fake expertise
- Overly polished corporate tone unless requested
- Unclear audience
- Weak hook
- No source grounding when factual
- Too many formats at once
- Auto-posting without approval

## 8. Content Engine Done Means

Content Engine is complete when:

- Content ideas can be captured
- Content can link to sources
- Gojo can generate format-specific outlines
- C-3PO can polish drafts
- Oak can validate factual/source claims
- Outputs save to Output Library
- Auto-posting is not enabled by default



---

# FILE: AANG_LEARNING_MODE_SPEC.md

# CereBro V1 — Aang Learning Mode Specification

## 1. Purpose

Aang Learning Mode helps the user learn topics over time and convert learning into structured artifacts.

This is inspired by NotebookLM-style source-grounded learning and the user's interest in learning tech, AI, coding, gaming, and practical skills.

## 2. Ownership

Primary owner:

- Aang

Supporting agents:

- Silver Surfer for source/video discovery
- C-3PO for learning artifact formatting
- Oak for accuracy validation
- Tony for coding/technical lessons
- Gojo for visual learning aids and diagrams

## 3. Learning Mode Scope

### V1 Required

Support:

- Beginner explanations
- Step-by-step guides
- Learning plans
- Quizzes
- Flashcards
- Checklists
- Video resource suggestions
- Save learning artifacts to Output Library
- Optional Notion export

### V1 Not Required

Do not build:

- Full spaced repetition system
- Full LMS
- Auto-generated course marketplace
- Progress analytics beyond basic task status
- Video downloading
- Paid course integration

## 4. Learning Request Flow

```text
User asks to learn something
  ↓
Aang identifies current level
  ↓
Context Engine checks existing learning notes
  ↓
Silver Surfer fetches sources if needed
  ↓
Aang explains simply
  ↓
C-3PO formats guide/checklist
  ↓
Oak validates factual accuracy
  ↓
User can save as guide, checklist, quiz, or Notion page
```

## 5. Learning Artifact Types

### Beginner Guide

Use when the user wants to understand a topic.

### Checklist

Use when the user needs repeatable steps.

### Quiz

Use when the user wants to test understanding.

### Flashcards

Use when the user wants memory aids.

### Practice Plan

Use when the user wants to improve a skill.

### Resource List

Use when useful videos/articles/tools should be saved.

## 6. Beginner Guide Template

```md
# [Topic] Beginner Guide

## Plain-English Explanation

## Why It Matters

## Core Concepts

## Example

## Step-by-Step

## Common Mistakes

## Practice Task

## Quick Quiz

## Useful Resources

## Next Lesson
```

## 7. Quiz Template

```md
# Quiz: [Topic]

## Questions

1.
2.
3.

## Answer Key

1.
2.
3.

## What To Review If You Missed These
```

## 8. Flashcard Template

```md
# Flashcards: [Topic]

## Cards

### Card 1

Front:
Back:

### Card 2

Front:
Back:
```

## 9. Coding Learning Flow

When teaching coding:

1. Explain the concept simply.
2. Show a tiny example.
3. Explain each line.
4. Show a practical use case.
5. Give a small exercise.
6. Explain common errors.
7. Offer to save as a guide.

Tony supports technical accuracy.

Oak validates.

## 10. Video Resource Behavior

When user likes video guides:

Silver Surfer can find videos if browser/web is enabled.

For each video resource:

- Title
- Creator/channel
- URL
- Why it helps
- Difficulty
- Relevant timestamps if available
- Notes
- Save to Source Library if approved

## 11. Outdated Note Detection

If Aang finds an existing learning note that may be outdated:

- Mark it as possibly stale.
- Ask Silver Surfer to refresh if current info matters.
- Do not overwrite without approval.
- Create updated version if approved.

## 12. Learning Mode Done Means

Learning Mode is complete when:

- Aang can explain a topic
- Aang can create beginner guide
- Aang can create quiz
- Aang can create checklist
- Silver Surfer can attach resources
- C-3PO can format learning output
- Oak can validate
- Output can save locally and optionally to Notion



---

# FILE: BROWSER_ADAPTER_IMPLEMENTATION_SPEC.md

# CereBro V1 — Browser Adapter Implementation Specification

## 1. Purpose

The Browser Adapter gives Silver Surfer controlled access to web sources and browser workflows.

Browser actions must be task-scoped, permissioned, logged, and recoverable.

## 2. Build Order

Implement in this order:

1. Browser adapter interface
2. Static URL source ingestion
3. Browser session logging
4. Screenshot capture
5. Playwright-based controlled browsing
6. Source extraction fallbacks
7. Browser automation actions
8. Optional Browser Use or Stagehand adapter
9. Optional Crawl4AI adapter
10. Advanced extraction parked

## 3. Browser Adapter Interface

TypeScript interface:

```ts
export interface BrowserAdapter {
  createSession(input: CreateBrowserSessionInput): Promise<BrowserSession>;
  navigate(input: NavigateInput): Promise<NavigateResult>;
  extract(input: ExtractInput): Promise<ExtractResult>;
  screenshot(input: ScreenshotInput): Promise<ScreenshotResult>;
  closeSession(input: CloseBrowserSessionInput): Promise<CloseBrowserSessionResult>;
}
```

## 4. Session Object

```ts
export type BrowserSession = {
  id: string;
  taskId: string;
  projectId?: string;
  mode: "research" | "app_testing" | "source_ingestion" | "private";
  status: "active" | "closed" | "failed";
  createdAt: string;
  closedAt?: string;
  requiresApproval: boolean;
  approved: boolean;
};
```

## 5. Navigate Input

```ts
export type NavigateInput = {
  sessionId: string;
  url: string;
  reason: string;
};
```

## 6. Extract Result

```ts
export type ExtractResult = {
  sessionId: string;
  url: string;
  title?: string;
  text?: string;
  markdown?: string;
  metadata?: Record<string, unknown>;
  extractionQuality: "none" | "poor" | "usable" | "good";
  warnings: string[];
};
```

## 7. Screenshot Result

```ts
export type ScreenshotResult = {
  sessionId: string;
  url: string;
  filePath: string;
  createdAt: string;
};
```

## 8. Browser Permission Rules

### Static URL Ingestion

Permission:

- Safe for public URLs if browser tools enabled

### Browser Session

Permission:

- Approval required if interaction is needed

### Private Browser Session

Permission:

- Explicit approval required

### Logged-In Account

Permission:

- Explicit approval required every session unless user creates a specific trusted rule

### Sensitive Sites

Permission:

- Explicit approval required

## 9. Extraction Fallback Order

1. User-provided content
2. Static fetch
3. Metadata extraction
4. Readability-style extraction
5. Playwright page text extraction
6. Screenshot capture
7. User-assisted manual extraction
8. Optional Crawl4AI adapter
9. Optional advanced extraction with approval

## 10. GitHub Repository Ingestion

For GitHub URLs:

Extract:

- Repository name
- Owner
- Description
- README summary
- License if available
- Stars/forks if available
- Main languages if available
- Last updated if available
- Releases if useful
- Why it matters
- CereBro decision
- Module impact

Do not clone the repo unless user approves.

## 11. Reddit Research Fallback

If Reddit API is not available:

Use:

- Search-accessible pages
- User-provided links
- Manual browser-assisted viewing
- Metadata-only records

Do not:

- scrape private communities
- bypass login requirements
- treat one comment as fact

## 12. Screenshot Storage

Store screenshots in:

```text
/CereBro/browser-captures/[project-id]/[task-id]/YYYY-MM-DD_HH-mm_[slug].png
```

Screenshot metadata stored in Source Library if saved.

## 13. Browser Session Logs

Every browser action logs:

- session ID
- task ID
- URL
- action
- timestamp
- status
- output summary
- file path if screenshot
- error if failed

## 14. Browser Done Means

Browser layer is complete when:

- Browser tools can be disabled
- Public URL ingestion works
- Browser sessions are logged
- Screenshots save correctly
- Private sessions require approval
- Failed extraction creates error
- Sources can be saved to Source Library



---

# FILE: UI_COMPONENT_SPEC.md

# CereBro V1 — UI Component Specification

## 1. Purpose

This file defines implementation-level UI components for the CereBro shell.

The goal is to give Claude Code enough structure to build the first version without inventing a generic dashboard.

## 2. Design Tokens

### Color Intent

Use tokens, not random hardcoded colors.

```ts
export const colors = {
  background: "deep-charcoal",
  surface: "charcoal-panel",
  surfaceRaised: "raised-panel",
  border: "muted-stone-border",
  textPrimary: "warm-off-white",
  textSecondary: "muted-silver",
  accent: "arcane-blue",
  accentSecondary: "violet-glow",
  success: "sage-green",
  warning: "amber",
  danger: "red",
  blocked: "deep-red"
};
```

Claude Code should translate these into actual Tailwind classes in the design system.

### Typography

Use:

- Strong page titles
- Clear section headings
- Comfortable body text
- Small metadata labels
- Monospace only for IDs/logs/code

### Spacing

Use consistent spacing scale:

- compact controls
- medium panels
- generous main workspace spacing
- no cramped dense cards

## 3. Core Layout Components

### `AppShell`

Props:

```ts
{
  leftRail: ReactNode;
  center: ReactNode;
  rightPanel: ReactNode;
  commandBar: ReactNode;
}
```

Responsibilities:

- Desktop layout
- Resizable or collapsible side panels later
- Main background
- Safe overflow handling

### `LeftRail`

Items:

- Home
- Project Spaces
- Inbox
- Tasks
- Sources
- Outputs
- Memory
- Automation
- Settings

States:

- active
- inactive
- badge
- disabled

### `CommandBar`

Elements:

- input
- mode selector
- attach source button
- create task button
- approval action area when needed

States:

- idle
- typing
- processing
- waiting_for_approval
- disabled

### `RightContextPanel`

Sections:

- Active Agent
- Current Mode
- Task Status
- Context Pack
- Tool Permissions
- Oak Validation
- Next Actions

## 4. Project Components

### `ProjectCard`

Shows:

- project name
- description
- status
- active task count
- source count
- output count
- last updated
- tags

Actions:

- open
- archive
- add source
- create task

### `ProjectDashboard`

Sections:

- summary
- active tasks
- recent sessions
- decisions
- sources
- outputs
- open questions
- next actions

## 5. Task Components

### `TaskCard`

Shows:

- title
- mode
- status
- owner agent
- project
- updated date
- validation status

### `TaskDetail`

Shows:

- title
- goal
- mode
- status
- owner
- supporting agents
- context pack
- timeline
- outputs
- validations
- approvals
- memory proposals

### `TaskTimeline`

Events:

- created
- context_created
- routed
- tool_requested
- approval_requested
- output_created
- validation_passed
- validation_blocked
- saved
- completed

## 6. Agent Components

### `AgentBadge`

Shows:

- agent name
- role
- status

Statuses:

- idle
- active
- waiting
- validating
- blocked
- disabled
- sealed

### `AgentActivityCard`

Shows:

- active agent
- current step
- assigned task
- tool requested
- waiting state

Do not show fake agent conversations.

## 7. Source Components

### `SourceCard`

Shows:

- title
- type
- trust level
- project
- tags
- retrieved date
- summary

### `SourceDetail`

Shows:

- metadata
- summary
- key points
- related tasks
- related outputs
- trust notes
- save/export actions

## 8. Output Components

### `ArtifactCard`

Shows:

- title
- output type
- project
- task
- created date
- validation status
- save destination

### `ArtifactViewer`

Supports:

- Markdown
- source summary
- build handoff
- design spec
- validation report
- checklist
- guide

## 9. Approval Components

### `ApprovalPrompt`

Shows:

- action requested
- requesting agent
- risk level
- context summary
- what will happen
- approve/reject buttons

Risk levels:

- low
- normal
- elevated
- high

### `PermissionBadge`

Shows:

- safe
- approval required
- blocked unless enabled

## 10. Validation Components

### `ValidationStatusBadge`

Statuses:

- pending
- pass
- pass_with_notes
- needs_revision
- blocked

### `ValidationReportCard`

Shows:

- status
- passed checks
- warnings
- blockers
- required fixes
- recommendation

## 11. Settings Components

### `StorageSettings`

Fields:

- root path
- SQLite path
- Obsidian vault path
- Chroma path
- outputs path
- backups path
- external SSD status

### `ModelSettings`

Fields:

- model list
- enabled status
- model class
- local/cloud
- test button
- privacy notes

### `IntegrationSettings`

Sections:

- Notion
- Browser Tools
- External Models
- Obsidian
- Raven Reviews sealed state

## 12. Empty State Copy

### No Projects

```text
No Project Spaces yet. Create one to give CereBro a place to organize tasks, sources, memory, and outputs.
```

### No Tasks

```text
No tasks here yet. Ask Aang for help or create a task manually.
```

### No Sources

```text
No sources saved yet. Add a URL, file, note, or GitHub repo to give CereBro something grounded to work from.
```

### No Outputs

```text
No outputs saved yet. Guides, checklists, build plans, and research reports will appear here.
```

## 13. Error State Copy

### Validation Blocked

```text
Oak blocked this output. Review the issues before saving or using it.
```

### Permission Required

```text
This action needs approval before CereBro can continue.
```

### Storage Missing

```text
The configured storage path is unavailable. File writes and cleanup jobs are paused.
```

### Notion Disabled

```text
Notion is not enabled. This output is still saved locally.
```

## 14. UI Done Means

UI component foundation is complete when:

- Core shell renders
- Left rail navigation works
- Command bar works
- Right panel shows task/agent context
- Projects, tasks, sources, outputs have cards/detail views
- Approval prompts are implemented
- Validation states are visible
- Empty and error states are implemented
- Settings has storage/model/integration sections



---

# FILE: V1_ACCEPTANCE_CRITERIA.md

# CereBro V1 — Acceptance Criteria

## 1. Purpose

This file defines when CereBro V1 is actually done.

Not “cool demo done.”

Not “UI loads once done.”

V1 is done when the core local-first operating system loop works.

## 2. V1 Must Do These Things

### 2.1 App Launch

- App launches locally.
- App opens in browser.
- First-run onboarding appears if not configured.
- Existing setup opens Home screen.
- Settings persist.

### 2.2 Local Storage

- CereBro root path exists.
- SQLite database exists.
- Output folder exists.
- Logs folder exists.
- Skills folder exists.
- Design systems folder exists.
- Obsidian vault path exists or is marked skipped.
- App does not require external SSD to start.
- App handles missing external SSD safely.

### 2.3 Project Spaces

- User can create Project Space.
- User can open Project Space.
- User can edit Project Space summary.
- Project persists after restart.
- Project dashboard shows tasks, sources, outputs, decisions, next actions.

### 2.4 Tasks

- User can create task.
- Task has mode.
- Task has status.
- Task links to project.
- Task can start session.
- Task timeline records events.
- Task persists after restart.
- Task can be completed or archived.

### 2.5 Sessions

- Session starts for active work.
- Session links to task/project.
- Session tracks active mode.
- Session tracks active agent.
- Session can pause/resume.
- Session summary can be saved.

### 2.6 Harness Runtime

- User request can become task.
- Harness can recommend mode.
- Harness can create context pack.
- Harness can route to owner agent.
- Harness enforces tool permissions.
- Harness logs important events.

### 2.7 Agent Registry

- All core agents exist:
  - Aang
  - Cortana
  - Batman
  - Tony Stark
  - Gojo
  - Silver Surfer
  - C-3PO
  - Professor Oak
  - Piccolo
  - Spock
- Each agent has role.
- Each agent has allowed modes.
- Each agent has personality cap.
- Disabled/sealed states work.
- No new agents are created without explicit user decision.

### 2.8 Skill File System

- Skills folder exists.
- Priority skill files exist.
- Skill metadata loads.
- Skills link to owner agents.
- Active skills appear in task context.
- Skill files are editable Markdown.
- App does not rely only on giant hidden prompts.

### 2.9 Source Library

- User can add URL/manual source.
- Source links to project/task.
- Source stores metadata.
- Source can be summarized.
- Source appears in Source Library.
- Source can be used in context pack.
- Source provenance is preserved.

### 2.10 Output Library

- User can save output.
- Output links to project/task.
- Output has type.
- Output has validation status.
- Output can be opened later.
- Output persists after restart.
- Output can be exported locally.

### 2.11 Memory Proposal System

- Agent/system can propose memory.
- Memory proposal links to project/task.
- Proposal has destination.
- Proposal has sensitivity.
- Oak can review proposal.
- User can approve/reject when required.
- Approved memory can write to appropriate layer.

### 2.12 Obsidian Integration

- Obsidian vault path can be configured.
- Project notes can be written.
- Decision notes can be written.
- Build logs can be written.
- Source summaries can be written.
- Frontmatter is included.
- SQLite stores Obsidian path.
- Failed writes are recoverable.

### 2.13 Chroma Integration

- Chroma path can be configured.
- Memory can be embedded.
- Metadata is stored.
- Query by project works.
- Chroma is not the main database.

### 2.14 Notion Bridge

Minimum V1 acceptable:

- Notion can remain disabled.
- Output Library works without Notion.
- If enabled, Notion export asks approval.
- Failed Notion export preserves local output.

### 2.15 Oak Validation

- Oak validation report can be created.
- Status can be pass, pass with notes, needs revision, blocked.
- Blocked output cannot be treated as final.
- Validation reports persist.
- Important outputs require validation.

### 2.16 Tony Build Flow

- Build task type exists.
- Tony can generate build plan.
- Tony can generate Claude Code handoff.
- Handoff includes do-not-break rules.
- Handoff includes acceptance criteria.
- Handoff includes test plan.
- Oak validates handoff.

### 2.17 Gojo Creative Flow

- Gojo can generate UI spec.
- Design system file exists.
- Anti-slop review can run.
- UI spec can save as artifact.
- Gojo does not override architecture.

### 2.18 Silver Surfer Browser/Research

Minimum V1 acceptable:

- Source ingestion works.
- Research report can be created from sources.
- Browser tools can remain disabled.
- If browser enabled, sessions are logged.
- Private browser sessions require approval.

### 2.19 Piccolo Automation

- Workflow registry exists.
- Safe cleanup scan works.
- Backup check stub works.
- Cleanup does not delete important files silently.
- Workflow run logs persist.

### 2.20 Spock Sanity Checks

- Spock can produce logic assessment.
- Spock can flag bloat.
- Spock can flag contradictions.
- Spock does not replace Oak.

### 2.21 Model Router

- Model registry exists.
- Model classes exist.
- Local-only mode exists.
- External escalation requires approval.
- Model failures produce structured error.
- Agent requests model class, not hardcoded model.

### 2.22 Permissions

- Safe actions run.
- Approval-required actions wait.
- Blocked actions are blocked.
- Approval events are logged.
- Rejected actions do not execute.

### 2.23 Error Handling

- Error categories exist.
- Errors appear in UI.
- Failed tool calls create error records.
- Failed writes do not lose content.
- Recovery path is shown.

### 2.24 Testing

- Unit tests run.
- Integration tests run.
- E2E tests run or manual fallback is documented.
- Test database is separate.
- Core flows are tested.

## 3. V1 Must Not Do These Things

V1 must not:

- Require Notion
- Require external SSD
- Require external models
- Require browser automation
- Require Raven Reviews
- Require Declyne
- Run destructive cleanup silently
- Use always-on browsing
- Write private context externally without approval
- Save unvalidated hallucinations as memory
- Let agents bypass harness
- Let output bypass Oak when important
- Turn every feature into a new agent

## 4. Final V1 Acceptance Checklist

V1 is accepted when all are true:

- First-run onboarding works.
- Project Spaces work.
- Tasks and sessions persist.
- Harness routes tasks.
- Agents registry works.
- Skills load.
- Source Library works.
- Output Library works.
- Memory proposals work.
- Oak validation works.
- Obsidian writes work.
- Chroma search works or is safely stubbed with clear next step.
- Notion is optional and safe.
- Tony build handoff works.
- Gojo UI spec works.
- Piccolo cleanup scan works.
- Model Router works.
- Permission system works.
- Error handling works.
- Tests pass.
- Documentation exists.
- Changelog exists.
- Raven remains sealed/disabled unless explicitly enabled.
- Declyne remains removed from V1.



---

# FILE: LICENSE_REVIEW_MATRIX.md

# CereBro V1 — License Review Matrix

## 1. Purpose

This file prevents casual misuse of open-source code.

CereBro can learn from external projects, but direct code copying requires license review.

## 2. Rule

Before copying code from any external repository:

1. Identify license.
2. Confirm compatibility.
3. Record attribution requirements.
4. Record whether code can be modified.
5. Record whether distribution triggers obligations.
6. Ask user if license is restrictive or unclear.

## 3. License Risk Categories

### Low Risk

Usually easier for reuse:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC

Still requires attribution where applicable.

### Medium Risk

Requires care:

- MPL-2.0
- LGPL
- EPL

May have file-level or linking obligations.

### High Risk

Requires extra care:

- GPL
- AGPL

Especially important if CereBro is distributed, hosted, networked, or integrated tightly.

### Unknown Risk

- No license
- Custom license
- Open-core unclear boundary
- Mixed license repository

Treat as inspiration only until reviewed.

## 4. Repository Matrix

| Project | URL | Current CereBro Decision | License Status In This File | Code Copy Allowed Now? | Notes |
|---|---|---|---|---|---|
| Cline | https://github.com/cline/cline | Adapt pattern / maybe use during build | Must verify before copying | No, verify first | Approval gates, checkpoints, tool use patterns are useful. |
| Penpot | https://github.com/penpot/penpot | Pattern / optional external tool | Must verify before copying | No, verify first | Design system and tokens pattern. |
| Immich | https://github.com/immich-app/immich | Park / pattern only | Must verify before copying | No, verify first | Media library architecture only for V1. |
| TriliumNext | https://github.com/TriliumNext/trilium | Pattern only | Must verify before copying | No, verify first | Obsidian remains chosen vault. |
| Karpathy Skills | https://github.com/mbeijen/andrej-karpathy-skills-cursor-vscode | Skill pattern | Must verify before copying | No, verify first | Convert principles into original CereBro skill files. |
| video-use | https://github.com/browser-use/video-use | Gojo/video pattern | Must verify before copying | No, verify first | Transcript/timeline/render/evaluate workflow. |
| Awesome Agent Skills | https://github.com/VoltAgent/awesome-agent-skills | Reference library | Must verify each skill separately | No bulk copying | Skills are not security-audited by default. |
| Hermes Agent | https://github.com/nousresearch/hermes-agent | Architecture reference | Must verify before copying | No, verify first | Memory/scheduling/model switching patterns. |
| Stirling PDF | https://github.com/Stirling-Tools/stirling-pdf | Adapter candidate | Must verify before integrating | No, verify first | Use as service if needed. |
| Skyvern | https://github.com/skyvern-ai/skyvern | Park | Must verify before copying | No, verify first | Heavy browser automation. |
| Crawl4AI | https://github.com/unclecode/crawl4ai | Strong adapter candidate | Must verify before integrating | No, verify first | Source ingestion candidate. |
| AirLLM | https://github.com/lyogavin/airllm | Research only | Must verify before copying | No, verify first | Do not depend on it for V1. |
| Paper Design | https://paper.design/ | Product pattern | Website/product, not code source | No | Design canvas inspiration. |
| MiniMax M2.7 | https://ollama.com/library/minimax-m2.7 | Optional model route | Model terms must be reviewed | No code copy | External/cloud fallback route. |
| Stagehand | https://github.com/browserbase/stagehand | Browser adapter candidate | Must verify before integrating | No, verify first | Browser action abstraction. |
| Lenis | https://github.com/darkroomengineering/lenis | UI polish candidate | Must verify before adding | No, verify first | Optional motion polish. |
| Browser Use | https://github.com/browser-use/browser-use | Browser adapter candidate | Must verify before integrating | No, verify first | Manual/task-scoped browser automation. |
| Polars | https://github.com/pola-rs/polars | Utility candidate | Must verify before adding | No, verify first | Local analytics/logs. |
| Kestra | https://github.com/kestra-io/kestra | Pattern only | Must verify before integrating | No, verify first | Piccolo workflow inspiration. |
| GSAP Skills | https://github.com/greensock/gsap-skills | Gojo skill pattern | Must verify before copying | No, verify first | Motion skill inspiration. |
| Superpowers | https://github.com/obra/superpowers | Core build pattern | Must verify before copying | No, verify first | Spec/TDD/review gate pattern. |
| Claude Code Best Practice | https://github.com/shanraisshan/claude-code-best-practice | Blueprint reference | Must verify before copying | No, verify first | Handoff/workflow inspiration. |
| Get Shit Done | https://github.com/gsd-build/get-shit-done | Core build pattern | Must verify before copying | No, verify first | Context engineering/spec-driven development. |
| Scrapling | https://github.com/D4Vinci/Scrapling | Optional advanced adapter | Must verify before integrating | No, verify first | Legal/scraping caution. |

## 5. Direct Copy Policy

### Allowed Without Further Review

- General concepts
- Workflow ideas
- Original rewritten skill files based on lessons
- Original CereBro architecture inspired by patterns
- High-level module ideas
- Non-identical documentation written specifically for CereBro

### Not Allowed Without Review

- Copying source code
- Copying exact skill files
- Copying repository docs verbatim
- Copying configuration files
- Copying UI assets
- Copying logos/icons
- Copying model weights
- Copying proprietary examples
- Integrating services with unclear license terms

## 6. Attribution Notes

If code or substantial text is reused:

- Add attribution in `THIRD_PARTY_NOTICES.md`
- Include project name
- URL
- License
- What was reused
- Whether modified
- Date reviewed

## 7. Claude Code Instruction

Before adding any external dependency:

```text
Check the license first.
Record it in LICENSE_REVIEW_MATRIX.md.
Explain why the dependency is needed.
Explain why a small internal adapter is not enough.
Wait for approval if license is restrictive, unclear, GPL, AGPL, MPL, open-core, or commercial.
```

## 8. License Review Done Means

License review is complete when:

- Each direct dependency has license recorded
- Each copied code source has attribution
- High-risk licenses are approved manually
- Pattern-only projects are marked as no code copied
- `THIRD_PARTY_NOTICES.md` exists if needed

