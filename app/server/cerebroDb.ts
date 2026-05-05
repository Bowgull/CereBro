/**
 * Harness DB for CereBro V1.
 *
 * Local-first by default (file:./cerebro.db). Turso is the same client with
 * a libsql:// URL + auth token; swap via env, no code change.
 *
 * V1 skips drizzle-kit migrations on purpose — schema lives here, applied
 * idempotently on first connect. Move to drizzle migrations in Phase 2 once
 * the schema stabilizes.
 */
import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _ready: Promise<void> | null = null;

function buildClient(): Client {
  const url = process.env.CEREBRO_DB_URL ?? "file:./cerebro.db";
  const authToken = process.env.CEREBRO_DB_AUTH_TOKEN;
  return createClient(authToken ? { url, authToken } : { url });
}

async function ensureSchema(client: Client): Promise<void> {
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS projects (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         path TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE TABLE IF NOT EXISTS tasks (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         title TEXT NOT NULL,
         status TEXT NOT NULL DEFAULT 'open',
         agent TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)`,
    ],
    "write",
  );
}

export async function getCerebroDb(): Promise<Client> {
  if (_client && _ready) {
    await _ready;
    return _client;
  }
  _client = buildClient();
  _ready = ensureSchema(_client).catch((err) => {
    console.error("[CerebroDB] Failed to apply schema:", err);
    throw err;
  });
  await _ready;
  return _client;
}

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface TaskRow {
  id: number;
  projectId: number | null;
  title: string;
  status: TaskStatus;
  agent: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectRow {
  id: number;
  name: string;
  path: string | null;
  createdAt: number;
}
