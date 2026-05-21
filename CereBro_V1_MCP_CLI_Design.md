# CereBro — MCP Server + CLI Design Doc
*Authored: 2026-05-21 | Status: Ready for implementation | Handoff: Codex*

---

## Why Both

CereBro currently watches Claude Code sessions from the outside. This doc describes
making it a two-way system:

- **MCP Server** — Claude Code sessions call *into* CereBro during work. The brain
  becomes a live context layer: record decisions, store memory, create follow-up
  tasks, dispatch agents, write outputs to vault — all from inside any Claude session
  without leaving it.

- **CLI** — Humans and Claude Code's Bash tool call `cerebro` from the terminal.
  Headless, scriptable, composable. Works whether or not the UI server is running.

Together they make CereBro's brain accessible everywhere:
- From inside Claude Code (MCP)
- From any terminal (CLI)
- From automation scripts and CI hooks (CLI)
- From the Keep UI (existing tRPC)

The UI becomes one of several surfaces, not the only one.

---

## Architecture Overview

```
cerebro/
  app/                       # existing Express + tRPC + Phaser UI
    server/
      mcp/                   # NEW — MCP stdio server
        index.ts             # entry point: McpServer + StdioServerTransport
        tools/
          tasks.ts           # registerTools(server) — task CRUD
          memory.ts          # registerTools(server) — memory CRUD + search
          sessions.ts        # registerTools(server) — sessions read
          outputs.ts         # registerTools(server) — output save + list
          agents.ts          # registerResource(server) — agents config manifest
      cerebroDb.ts           # UNCHANGED — shared by UI server + MCP + CLI
      agentRouter.ts         # UNCHANGED — shared agent config
      routers/               # UNCHANGED — tRPC routers
  cli/                       # NEW — standalone CLI package
    src/
      index.ts               # shebang + Commander program root
      caller.ts              # createCallerFactory wrapper
      output.ts              # TTY-aware formatter (JSON vs table)
      commands/
        task.ts              # cerebro task create|list|set-status|delete
        memory.ts            # cerebro memory add|list|search|delete
        session.ts           # cerebro session list
        output.ts            # cerebro output list|save
        agent.ts             # cerebro agent list  (dispatch in Phase 3)
    package.json
    tsconfig.json
  .mcp.json                  # NEW — project-scoped MCP config (checked in)
```

Both MCP and CLI import `getCerebroDb()` directly from `app/server/cerebroDb.ts`.
Neither requires the Express server to be running. The CLI additionally uses
`createCallerFactory` from tRPC to call existing router logic without HTTP.

---

## Part 1 — MCP Server

### Dependencies

Add to `app/package.json`:
```bash
pnpm add @modelcontextprotocol/sdk
```

`zod` is already installed (`^4.1.12`). No version conflict with the SDK.

### Entry Point — `app/server/mcp/index.ts`

```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerMemoryTools } from "./tools/memory.js";
import { registerSessionTools } from "./tools/sessions.js";
import { registerOutputTools } from "./tools/outputs.js";
import { registerAgentResources } from "./tools/agents.js";

// Validate DB is reachable before accepting connections
const { getCerebroDb } = await import("../cerebroDb.js");
await getCerebroDb(); // fast — lazy client caches after first call

const server = new McpServer({
  name: "cerebro",
  version: "1.0.0",
  description: "CereBro brain — tasks, memory, sessions, outputs, agent config",
});

registerTaskTools(server);
registerMemoryTools(server);
registerSessionTools(server);
registerOutputTools(server);
registerAgentResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);

// IMPORTANT: never use console.log() in this file or any tool file.
// This is a stdio server — stdout is the JSON-RPC channel.
// All diagnostics must go to console.error() (stderr only).
```

### Critical Rule for All Tool Files

**Never call `console.log()` inside the MCP server process.** Any write to stdout
corrupts the JSON-RPC stream and breaks the connection silently. Use `console.error()`
for all diagnostics. This applies to every `tools/*.ts` file.

### Tool File Pattern — `app/server/mcp/tools/tasks.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getCerebroDb } from "../../cerebroDb.js";

export function registerTaskTools(server: McpServer) {

  server.registerTool(
    "tasks_list",
    {
      title: "List Tasks",
      description: "Return tasks from CereBro. Filter by status or projectId.",
      inputSchema: z.object({
        status: z.enum(["open","in_progress","done","cancelled"]).optional()
          .describe("Filter by status. Omit to return all."),
        projectId: z.number().int().optional()
          .describe("Filter to a specific project."),
        limit: z.number().int().min(1).max(100).default(50)
          .describe("Max rows to return. Default 50."),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ status, projectId, limit }) => {
      try {
        const db = await getCerebroDb();
        let sql = "SELECT id, title, status, agent, project_id, created_at FROM tasks WHERE 1=1";
        const args: (string | number)[] = [];
        if (status) { sql += " AND status = ?"; args.push(status); }
        if (projectId) { sql += " AND project_id = ?"; args.push(projectId); }
        sql += " ORDER BY created_at DESC LIMIT ?";
        args.push(limit);
        const result = await db.execute({ sql, args });
        const text = JSON.stringify(result.rows, null, 2);
        return { content: [{ type: "text", text: truncate(text) }] };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "tasks_create",
    {
      title: "Create Task",
      description: "Create a new task in CereBro. Returns the created row.",
      inputSchema: z.object({
        title: z.string().min(1).max(280).describe("Task title"),
        agent: z.string().max(64).optional()
          .describe("Agent ID to assign: cortana|tony|gojo|surfer|c3po|aang|batman|oak|spock|piccolo"),
        projectId: z.number().int().optional().describe("Project to attach task to"),
        priority: z.enum(["low","normal","high"]).default("normal"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ title, agent, projectId, priority }) => {
      try {
        const db = await getCerebroDb();
        const result = await db.execute({
          sql: `INSERT INTO tasks (title, agent, project_id, priority, status, created_at)
                VALUES (?, ?, ?, ?, 'open', unixepoch())
                RETURNING id, title, status, agent, project_id, created_at`,
          args: [title, agent ?? null, projectId ?? null, priority],
        });
        const row = result.rows[0];
        return {
          content: [{ type: "text", text: JSON.stringify(row) }],
          structuredContent: row as Record<string, unknown>,
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        };
      }
    }
  );

  // tasks_set_status, tasks_delete follow the same pattern
}

// Truncation guard — keep responses under ~25k chars
function truncate(text: string, limit = 24000): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + `\n\n[TRUNCATED — ${text.length - limit} chars omitted]`;
}
```

### Full Tool Inventory

#### Tasks
| Tool | Read/Write | Description |
|---|---|---|
| `tasks_list` | read | Filter by status, projectId, limit |
| `tasks_get` | read | Get one task by id |
| `tasks_create` | write | Create task, returns row |
| `tasks_set_status` | write | Cycle status: open→in_progress→done→cancelled |
| `tasks_delete` | write/destructive | Delete by id |

#### Memory
| Tool | Read/Write | Description |
|---|---|---|
| `memory_search` | read | Full-text search + kind filter |
| `memory_list` | read | List entries by kind, limit |
| `memory_create` | write | Add fact/note/reference/feedback |
| `memory_delete` | write/destructive | Delete by id |

#### Sessions
| Tool | Read/Write | Description |
|---|---|---|
| `sessions_list` | read | List sessions; activeOnly flag |
| `sessions_get` | read | Get one session by claudeSessionId |

#### Outputs
| Tool | Read/Write | Description |
|---|---|---|
| `outputs_list` | read | List by kind (text/code/diff/file), session, project |
| `outputs_save` | write | Save an output; optionally write to vault if CEREBRO_VAULT_DIR set |

#### Resources (static reference, not tools)
| Resource URI | Description |
|---|---|
| `cerebro://agents` | All 10-agent config from agentRouter.ts as JSON |
| `cerebro://schema` | DB table definitions (for LLM schema awareness) |

### `.mcp.json` — Project-Scoped Config

Create at repo root (checked in — every Claude Code session in this repo auto-connects):

```json
{
  "mcpServers": {
    "cerebro": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "${CLAUDE_PROJECT_DIR}/app/server/mcp/index.ts"],
      "env": {
        "CEREBRO_DB_URL": "file:${CLAUDE_PROJECT_DIR}/app/cerebro.db"
      }
    }
  }
}
```

For production (after `pnpm build:mcp`):
```json
{
  "mcpServers": {
    "cerebro": {
      "type": "stdio",
      "command": "node",
      "args": ["${CLAUDE_PROJECT_DIR}/app/dist/mcp.js"]
    }
  }
}
```

The server inherits `CEREBRO_DB_AUTH_TOKEN` and other env vars from the shell
environment where Claude Code runs. Only set `CEREBRO_DB_URL` explicitly here to
ensure the right db file path is resolved regardless of working directory.

### Build Config — Add to `app/package.json` scripts

```json
"build:mcp": "esbuild server/mcp/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/mcp --out-extension:.js=.js"
```

### Verification

After wiring, run `/mcp` inside Claude Code. It should show:
- Server: cerebro (connected)
- Tools: ~10 registered
- Resources: 2

Test a tool call manually:
```
Use the cerebro MCP tool to list all open tasks.
```

---

## Part 2 — CLI

### Package Location

Create `cli/` at repo root, **parallel to `app/`**. This keeps it out of the
Express/Vite bundle. It imports from `../app/server/` via relative paths.

### Dependencies — `cli/package.json`

```json
{
  "name": "cerebro-cli",
  "version": "0.1.0",
  "description": "CereBro brain CLI — tasks, memory, sessions from your terminal",
  "type": "module",
  "bin": { "cerebro": "./dist/index.js" },
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev": "tsx src/index.ts --",
    "link": "npm link"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "dotenv": "^17.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.9.0"
  }
}
```

Commander.js is the framework choice: zero transitive dependencies, 180KB,
ESM-native, fast startup (no 70-100ms oclif overhead — matters when Claude Code's
Bash tool calls the CLI in a loop).

**Do not duplicate `@trpc/server`, `@libsql/client`, or `zod` in cli/package.json.**
Import these from `../app/node_modules/` via the workspace or relative path to avoid
version mismatch. Or use pnpm workspace: add `"@cerebro/app": "workspace:*"` as a
dependency.

### `cli/src/caller.ts` — The Bridge

```typescript
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

// Load app/.env so CLI picks up CEREBRO_DB_URL without manual export
const appDir = resolve(fileURLToPath(import.meta.url), "../../../app");
config({ path: resolve(appDir, ".env") });

import { createCallerFactory } from "@trpc/server";
import { appRouter } from "../../app/server/routers.js";

const createCaller = createCallerFactory(appRouter);
export const caller = createCaller({} as any); // publicProcedure needs no auth context
```

`createCallerFactory` calls tRPC procedures in-process with no HTTP roundtrip.
The CLI gets full type safety from existing Zod schemas with zero duplication.
The Express server does not need to be running.

**SQLite concurrency note:** Both the UI server and the CLI may have
`@libsql/client` open the same `file:./cerebro.db`. libSQL uses WAL mode by default —
concurrent reads are fine, writes serialize automatically. No lock conflicts.

### `cli/src/output.ts` — TTY-Aware Formatter

```typescript
export function out(data: unknown, humanText: string, forceJson = false): void {
  if (forceJson || !process.stdout.isTTY) {
    // Claude Code Bash tool: stdout is a pipe, isTTY is undefined (falsy)
    // → always gets clean JSON, no flag needed
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  } else {
    console.log(humanText);
  }
}

export function err(msg: string, exitCode = 1): never {
  process.stderr.write(msg + "\n");
  process.exit(exitCode);
}

export function table(rows: Record<string, unknown>[], cols: string[]): string {
  const widths = cols.map(c =>
    Math.max(c.length, ...rows.map(r => String(r[c] ?? "").length))
  );
  const header = cols.map((c, i) => c.toUpperCase().padEnd(widths[i])).join("  ");
  const divider = widths.map(w => "─".repeat(w)).join("  ");
  const body = rows.map(r =>
    cols.map((c, i) => String(r[c] ?? "").padEnd(widths[i])).join("  ")
  );
  return [header, divider, ...body].join("\n");
}
```

When the Bash tool calls `cerebro task list`, stdout is a pipe → JSON output fires
automatically. Humans in a terminal get a formatted table. Same binary, no flag required.

### `cli/src/commands/task.ts`

```typescript
import { Command } from "commander";
import { caller } from "../caller.js";
import { out, err, table } from "../output.js";

export const taskCmd = new Command("task")
  .description("Manage tasks in the CereBro brain");

taskCmd
  .command("create <title>")
  .description("Create a new task")
  .option("-a, --agent <agent>", "Assign to agent (cortana|tony|gojo|surfer|c3po|aang|batman|oak|spock|piccolo)")
  .option("-p, --project <id>", "Project ID", parseInt)
  .option("--json", "Output as JSON")
  .action(async (title: string, opts) => {
    const task = await caller.tasks.create({
      title,
      agent: opts.agent,
      projectId: opts.project,
    }).catch(e => err(String(e)));
    out(task, `Created #${task.id}: ${task.title}`, opts.json);
  });

taskCmd
  .command("list")
  .description("List tasks")
  .option("--status <status>", "Filter: open|in_progress|done|cancelled")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const tasks = await caller.tasks.list({ status: opts.status }).catch(e => err(String(e)));
    out(tasks, table(tasks, ["id", "title", "status", "agent"]), opts.json);
  });

taskCmd
  .command("set-status <id> <status>")
  .description("Update task status")
  .option("--json", "Output as JSON")
  .action(async (id: string, status: string, opts) => {
    const task = await caller.tasks.setStatus({ id: parseInt(id), status: status as any })
      .catch(e => err(String(e)));
    out(task, `Task #${id} → ${status}`, opts.json);
  });

taskCmd
  .command("delete <id>")
  .description("Delete a task")
  .action(async (id: string) => {
    await caller.tasks.delete({ id: parseInt(id) }).catch(e => err(String(e)));
    console.log(`Deleted #${id}`);
  });
```

### `cli/src/commands/memory.ts`

```typescript
import { Command } from "commander";
import { caller } from "../caller.js";
import { out, err, table } from "../output.js";

export const memoryCmd = new Command("memory")
  .description("Manage the CereBro memory store");

memoryCmd
  .command("add <content>")
  .description("Add a memory entry")
  .option("-k, --kind <kind>", "fact|note|reference|feedback", "note")
  .option("--tags <tags>", "Comma-separated tags")
  .option("--json", "Output as JSON")
  .action(async (content: string, opts) => {
    const entry = await caller.memory.create({
      content,
      kind: opts.kind,
      tags: opts.tags ? opts.tags.split(",").map((t: string) => t.trim()) : [],
    }).catch(e => err(String(e)));
    out(entry, `Saved memory #${entry.id}`, opts.json);
  });

memoryCmd
  .command("search <query>")
  .description("Search memory entries")
  .option("-k, --kind <kind>", "Filter by kind")
  .option("--json", "Output as JSON")
  .action(async (query: string, opts) => {
    const results = await caller.memory.search({ query, kind: opts.kind })
      .catch(e => err(String(e)));
    out(results, table(results, ["id", "kind", "content"]), opts.json);
  });

memoryCmd
  .command("list")
  .description("List memory entries")
  .option("-k, --kind <kind>", "Filter by kind")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const entries = await caller.memory.list({ kind: opts.kind })
      .catch(e => err(String(e)));
    out(entries, table(entries, ["id", "kind", "content", "created_at"]), opts.json);
  });
```

### `cli/src/index.ts` — Root Entry

```typescript
#!/usr/bin/env node
import { Command } from "commander";
import { taskCmd } from "./commands/task.js";
import { memoryCmd } from "./commands/memory.js";
import { sessionCmd } from "./commands/session.js";
import { outputCmd } from "./commands/output.js";
import { agentCmd } from "./commands/agent.js";

const program = new Command()
  .name("cerebro")
  .description("CereBro brain CLI")
  .version("0.1.0");

program.addCommand(taskCmd);
program.addCommand(memoryCmd);
program.addCommand(sessionCmd);
program.addCommand(outputCmd);
program.addCommand(agentCmd);

program.parse();
```

### Full Command Surface

```
cerebro task create <title> [-a agent] [-p projectId]
cerebro task list [--status open|in_progress|done|cancelled]
cerebro task set-status <id> <status>
cerebro task delete <id>

cerebro memory add <content> [-k fact|note|reference|feedback] [--tags tag1,tag2]
cerebro memory search <query> [-k kind]
cerebro memory list [-k kind]
cerebro memory delete <id>

cerebro session list [--active]
cerebro session get <claudeSessionId>

cerebro output list [--kind text|code|diff|file] [--session <id>]
cerebro output save <content> --kind <kind> [--session <id>]

cerebro agent list
cerebro agent dispatch --id <agentId> --task <description>  # Phase 3
```

Every command: `--json` flag forces JSON output. Without the flag, TTY detection
handles it automatically (pipe = JSON, terminal = table).

### Installation

Dev (linked global):
```bash
cd cli
pnpm install
pnpm build
npm link
cerebro task list
```

Within a Claude Code session via Bash tool (no install needed):
```bash
npx tsx /path/to/CereBro/cli/src/index.ts task list
```

Single binary (Bun, after V1):
```bash
bun build cli/src/index.ts --compile --outfile cerebro-bin
```

---

## Part 3 — Shared Patterns

### DB Concurrency

Both MCP server and CLI open `getCerebroDb()` which returns a cached `@libsql/client`
instance. If the UI server is also running against the same `file:./cerebro.db`,
all three processes share it safely — libSQL WAL mode handles concurrent readers and
serializes writers. This is intentional.

### Environment Variable Resolution

Priority order (highest to lowest):
1. Shell environment at the time Claude Code / terminal session starts
2. `app/.env` (loaded by CLI's `dotenv` call in `caller.ts`)
3. Defaults in `cerebroDb.ts` (`file:./cerebro.db`)

The MCP server inherits the environment from Claude Code's launch context.
`CEREBRO_DB_URL` in `.mcp.json`'s `env` block overrides if set there.

### Error Handling

MCP tools: return `{ content: [...], isError: true }` — never throw. Thrown errors
become protocol faults that crash the MCP session.

CLI commands: call `.catch(e => err(String(e)))` which writes to stderr and exits 1.
The Bash tool sees a non-zero exit code and knows the command failed.

---

## Implementation Order for Codex

### Session 1 — MCP Server (core)
1. `pnpm add @modelcontextprotocol/sdk` in `app/`
2. Create `app/server/mcp/index.ts` (entry point, McpServer + StdioServerTransport)
3. Create `app/server/mcp/tools/tasks.ts` — `tasks_list` and `tasks_create` first
4. Create `app/server/mcp/tools/memory.ts` — `memory_search` and `memory_create`
5. Create `app/server/mcp/tools/sessions.ts` — `sessions_list`
6. Create `app/server/mcp/tools/outputs.ts` — `outputs_list` and `outputs_save`
7. Create `app/server/mcp/tools/agents.ts` — `cerebro://agents` resource
8. Create `.mcp.json` at repo root
9. Add `"build:mcp"` script to `app/package.json`
10. Test: `/mcp` inside Claude Code shows server connected with ~10 tools

### Session 2 — CLI (core)
1. Scaffold `cli/` with `package.json`, `tsconfig.json`
2. Create `cli/src/caller.ts` (dotenv + createCallerFactory)
3. Create `cli/src/output.ts` (TTY-aware formatter)
4. Create `cli/src/commands/task.ts` (create + list first)
5. Create `cli/src/commands/memory.ts` (add + search + list)
6. Create `cli/src/commands/session.ts` (list)
7. Create `cli/src/commands/output.ts` (list)
8. Create `cli/src/commands/agent.ts` (list only in V1)
9. Create `cli/src/index.ts` (root program)
10. `npm link` + test `cerebro task list` from any directory
11. Test Bash tool integration: `cerebro task list --json` returns clean JSON

### Session 3 — Hardening
- Full tool set: `tasks_set_status`, `tasks_delete`, `memory_delete`, `outputs_save`
- Truncation guards on all list tools (24k char cap)
- `readOnlyHint`/`destructiveHint` annotations on all tools
- Startup DB validation in MCP entry point (fail fast on bad URL)
- `cerebro://schema` resource from `cerebroDb.ts` table definitions

---

## What This Unlocks

Once MCP is live, a Claude Code session working on any project can:

```
"Record to CereBro memory: prefer Zod v4 schemas over manual type guards in this project."
→ cerebro MCP: memory_create(kind="preference", content="...")

"We need to refactor the auth module but not now. Create a task for Tony."
→ cerebro MCP: tasks_create(title="refactor auth module", agent="tony")

"What have we decided about the database schema?"
→ cerebro MCP: memory_search(query="database schema")

"Ask Batman to threat-model this OAuth flow."
→ cerebro MCP: tasks_create(title="threat-model OAuth flow", agent="batman", priority="high")
```

The Keep UI becomes the visualization layer for everything accumulating in the brain.
The brain itself is now accessible from anywhere.
