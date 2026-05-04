# CereBro V1 — Tech Stack Decision

## Locked V1 Defaults

- Local Next.js web app
- TypeScript
- React
- Tailwind CSS
- shadcn/ui-style components
- SQLite
- Drizzle ORM preferred
- `better-sqlite3` acceptable fallback
- Chroma or compatible vector store
- Ollama
- Playwright-compatible browser layer
- local scheduler
- local filesystem storage

## Package Manager

Preferred:

```text
pnpm
```

Fallback:

```text
npm
```

## Not Required On Day One

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
- full Raven Reviews
- full Remotion editor

## Build Order

1. documentation
2. schemas
3. local app
4. SQLite
5. projects/tasks/sessions
6. harness
7. agents/skills
8. sources/outputs
9. memory/validation
10. integrations
