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
