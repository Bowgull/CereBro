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
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_path ON projects(path) WHERE path IS NOT NULL`,
      `CREATE TABLE IF NOT EXISTS sessions (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         claude_session_id TEXT NOT NULL UNIQUE,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         hero_class TEXT,
         started_at INTEGER NOT NULL DEFAULT (unixepoch()),
         last_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
         ended_at INTEGER
       )`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC)`,
    ],
    "write",
  );
}

export interface SessionRow {
  id: number;
  claudeSessionId: string;
  projectId: number | null;
  projectName: string | null;
  projectPath: string | null;
  heroClass: string | null;
  startedAt: number;
  lastSeenAt: number;
  endedAt: number | null;
}

export async function getOrCreateProjectByPath(
  name: string,
  pathValue: string,
): Promise<number> {
  const db = await getCerebroDb();
  const existing = await db.execute({
    sql: `SELECT id FROM projects WHERE path = ? LIMIT 1`,
    args: [pathValue],
  });
  if (existing.rows[0]) return Number(existing.rows[0].id);
  const inserted = await db.execute({
    sql: `INSERT INTO projects (name, path) VALUES (?, ?) RETURNING id`,
    args: [name, pathValue],
  });
  return Number(inserted.rows[0]!.id);
}

/**
 * Idempotent. Called on hero-new from the websocket layer when a real
 * Claude Code transcript file is detected. Demo heroes (no sessionFile)
 * must not be passed in.
 */
export async function recordSessionStart(input: {
  claudeSessionId: string;
  projectName: string;
  projectPath: string;
  heroClass: string;
}): Promise<void> {
  try {
    const db = await getCerebroDb();
    const projectId = await getOrCreateProjectByPath(
      input.projectName,
      input.projectPath,
    );
    await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, hero_class)
        VALUES (?, ?, ?)
        ON CONFLICT(claude_session_id) DO UPDATE SET
          last_seen_at = unixepoch(),
          ended_at = NULL,
          project_id = excluded.project_id,
          hero_class = excluded.hero_class
      `,
      args: [input.claudeSessionId, projectId, input.heroClass],
    });
  } catch (err) {
    console.error("[CerebroDB] recordSessionStart failed:", err);
  }
}

export async function recordSessionEnd(claudeSessionId: string): Promise<void> {
  try {
    const db = await getCerebroDb();
    await db.execute({
      sql: `
        UPDATE sessions
        SET ended_at = unixepoch(), last_seen_at = unixepoch()
        WHERE claude_session_id = ? AND ended_at IS NULL
      `,
      args: [claudeSessionId],
    });
  } catch (err) {
    console.error("[CerebroDB] recordSessionEnd failed:", err);
  }
}

export async function touchSession(claudeSessionId: string): Promise<void> {
  try {
    const db = await getCerebroDb();
    await db.execute({
      sql: `UPDATE sessions SET last_seen_at = unixepoch() WHERE claude_session_id = ?`,
      args: [claudeSessionId],
    });
  } catch (err) {
    console.error("[CerebroDB] touchSession failed:", err);
  }
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
