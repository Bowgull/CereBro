# CereBro V1 — Architecture

## Core Architecture

CereBro V1 is harness-first.

Agents are not the system.

The system is:

```text
User
  ↓
Aang
  ↓
Core Harness Runtime
  ↓
Task + Session
  ↓
Context Engine
  ↓
Cortana Routing
  ↓
Bounded Agent Work
  ↓
Tool Adapter Layer
  ↓
C-3PO Formatting
  ↓
Professor Oak Validation
  ↓
User Approval
  ↓
Memory / Output / Task Update
```

## Main Modules

### Core Harness Runtime

Responsible for:

- request intake
- mode selection
- task creation
- session creation
- context pack generation
- routing
- permission checks
- tool call logging
- validation state
- approval gates

### Project Spaces

Persistent project containers for:

- tasks
- sessions
- sources
- outputs
- decisions
- notes
- memory references
- Notion references
- Obsidian references

### Task System

Every meaningful request becomes a task.

Tasks store:

- mode
- status
- owner agent
- support agents
- context pack
- success criteria
- constraints
- outputs
- validations
- approvals
- changelog

### Session System

Sessions track active work.

Sessions store:

- project
- task
- active mode
- active agent
- last activity
- summary
- next action

### Context Engine

Builds focused context packs from:

- user request
- active project
- task
- session
- sources
- memory
- Obsidian notes
- Notion refs
- skill files
- prior decisions

### Skill File System

Skills are Markdown instruction modules.

They are not agents.

They teach agents specific workflows.

### Agent Layer

Core agents:

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

### Tool Adapter Layer

Tools are wrapped by adapters and governed by permissions.

Tool categories:

- local data
- files
- memory
- outputs
- browser
- build
- automation
- models

### Memory Pipeline

Agents propose memory.

Oak validates.

User approves when needed.

Memory Writer writes to:

- Chroma
- Obsidian
- Notion only if user-facing and approved

### Source Library

Stores:

- URLs
- GitHub repos
- PDFs
- videos
- notes
- files
- screenshots
- browser captures
- source summaries

### Output Library

Stores:

- guides
- checklists
- plans
- meeting notes
- build docs
- design specs
- research reports
- changelogs
- video plans
- Markdown exports
- Notion exports

### Browser Intelligence Layer

Silver Surfer uses controlled browser/source tools.

Browser automation is:

- disabled by default
- task-scoped
- logged
- approval-gated for private/sensitive sessions

### Build Pipeline

Tony owns:

- requirements
- non-goals
- architecture
- implementation phases
- data models
- Claude Code handoffs
- test plans
- changelogs

### Creative Pipeline

Gojo owns:

- UI/UX
- design systems
- creative direction
- motion
- anti-slop review support
- Remotion/video planning

### Automation Layer

Piccolo owns:

- cleanup scans
- backup checks
- log pruning
- export organization
- scheduled jobs

### Validation Layer

Professor Oak validates:

- facts
- sources
- blueprint consistency
- memory proposals
- build handoffs
- privacy
- anti-slop
- output quality

## Persistence

Use:

- SQLite for structured app state
- Chroma for vector memory
- Obsidian for human-readable local notes
- local file system for artifacts/logs/exports
- Notion optionally for polished user-facing outputs

## Default Technical Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM or `better-sqlite3`
- Chroma or compatible vector DB
- Ollama
- Playwright-compatible browser layer
- local scheduler
