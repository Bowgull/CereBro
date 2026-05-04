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
