/**
 * Notion adapter — inbox/outbox pattern.
 *
 * Inbox: a Notion database the user pushes notes/links/briefs into.
 *   pollInbox() ingests new pages into memory_entries with
 *   source='notion:<page_id>'. Re-runs are idempotent because the source
 *   column is checked before insert.
 *
 * Outbox: a separate database CereBro publishes outputs to.
 *   publishToOutbox() creates a page with title + body.
 *
 * Auth via env: NOTION_TOKEN (internal integration secret),
 * NOTION_INBOX_DATABASE_ID, NOTION_OUTBOX_DATABASE_ID. Without the
 * token the adapter is a no-op.
 */
import { getCerebroDb } from "../cerebroDb";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionStatus {
  configured: boolean;
  hasInbox: boolean;
  hasOutbox: boolean;
  inboxDatabaseId: string | null;
  outboxDatabaseId: string | null;
  workspaceName: string | null;
  lastError: string | null;
}

let _workspaceName: string | null = null;
let _lastError: string | null = null;
let _verifiedAt = 0;

async function notion(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<unknown> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN not set");
  const res = await fetch(`${NOTION_API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      (data?.message as string) ?? `Notion ${res.status} on ${path}`,
    );
  }
  return data;
}

async function refreshIdentity(): Promise<void> {
  if (!process.env.NOTION_TOKEN) return;
  if (Date.now() - _verifiedAt < 60_000) return;
  try {
    const me = (await notion("/users/me")) as {
      bot?: { workspace_name?: string };
    };
    _workspaceName = me.bot?.workspace_name ?? null;
    _lastError = null;
    _verifiedAt = Date.now();
  } catch (err) {
    _lastError = err instanceof Error ? err.message : String(err);
  }
}

export async function getNotionStatus(): Promise<NotionStatus> {
  const token = process.env.NOTION_TOKEN;
  const inbox = process.env.NOTION_INBOX_DATABASE_ID ?? null;
  const outbox = process.env.NOTION_OUTBOX_DATABASE_ID ?? null;
  if (token) await refreshIdentity();
  return {
    configured: Boolean(token),
    hasInbox: Boolean(token && inbox),
    hasOutbox: Boolean(token && outbox),
    inboxDatabaseId: inbox,
    outboxDatabaseId: outbox,
    workspaceName: _workspaceName,
    lastError: _lastError,
  };
}

export function isConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN);
}

function extractPageTitle(page: unknown): string {
  const props = (page as { properties?: Record<string, unknown> }).properties;
  if (!props) return "Untitled";
  for (const value of Object.values(props)) {
    const v = value as { type?: string; title?: Array<{ plain_text?: string }> };
    if (v?.type === "title" && Array.isArray(v.title)) {
      const text = v.title.map((t) => t.plain_text ?? "").join("").trim();
      if (text) return text;
    }
  }
  return "Untitled";
}

async function blocksToText(pageId: string): Promise<string> {
  const out: string[] = [];
  let cursor: string | undefined = undefined;
  do {
    const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : `?page_size=100`;
    const res = (await notion(`/blocks/${pageId}/children${qs}`)) as {
      results: Array<Record<string, unknown>>;
      has_more: boolean;
      next_cursor: string | null;
    };
    for (const block of res.results) {
      const type = block.type as string | undefined;
      if (!type) continue;
      const inner = block[type] as
        | { rich_text?: Array<{ plain_text?: string }> }
        | undefined;
      const rich = inner?.rich_text;
      if (Array.isArray(rich)) {
        const line = rich.map((r) => r.plain_text ?? "").join("");
        if (line) out.push(line);
      }
    }
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out.join("\n");
}

export async function pollInbox(): Promise<{
  ingested: number;
  skipped: number;
  error?: string;
}> {
  const dbId = process.env.NOTION_INBOX_DATABASE_ID;
  if (!process.env.NOTION_TOKEN || !dbId) return { ingested: 0, skipped: 0 };
  let ingested = 0;
  let skipped = 0;
  try {
    const db = await getCerebroDb();
    let cursor: string | undefined = undefined;
    do {
      const res = (await notion(`/databases/${dbId}/query`, {
        method: "POST",
        body: cursor
          ? { start_cursor: cursor, page_size: 50 }
          : { page_size: 50 },
      })) as {
        results: Array<{ id: string; properties?: Record<string, unknown> }>;
        has_more: boolean;
        next_cursor: string | null;
      };
      for (const page of res.results) {
        const pageId = page.id;
        const source = `notion:${pageId}`;
        const existing = await db.execute({
          sql: `SELECT id FROM memory_entries WHERE source = ? LIMIT 1`,
          args: [source],
        });
        if (existing.rows[0]) {
          skipped++;
          continue;
        }
        const title = extractPageTitle(page);
        const body = await blocksToText(pageId);
        const composed = body ? `${title}\n\n${body}` : title;
        await db.execute({
          sql: `INSERT INTO memory_entries (kind, body, source) VALUES ('note', ?, ?)`,
          args: [composed, source],
        });
        ingested++;
      }
      cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
    } while (cursor);
    _lastError = null;
    return { ingested, skipped };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    _lastError = msg;
    return { ingested, skipped, error: msg };
  }
}

export async function publishToOutbox(payload: {
  title: string;
  body: string;
  sessionId?: number;
}): Promise<{ ok: boolean; pageId?: string; reason?: string }> {
  const dbId = process.env.NOTION_OUTBOX_DATABASE_ID;
  if (!process.env.NOTION_TOKEN) return { ok: false, reason: "NOTION_TOKEN not set" };
  if (!dbId) return { ok: false, reason: "NOTION_OUTBOX_DATABASE_ID not set" };
  try {
    const titleProp = await findTitlePropertyName(dbId);
    const page = (await notion("/pages", {
      method: "POST",
      body: {
        parent: { database_id: dbId },
        properties: {
          [titleProp]: {
            title: [
              { type: "text", text: { content: payload.title.slice(0, 1900) } },
            ],
          },
        },
        children: chunkBodyToBlocks(payload.body),
      },
    })) as { id: string };
    return { ok: true, pageId: page.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    _lastError = msg;
    return { ok: false, reason: msg };
  }
}

async function findTitlePropertyName(dbId: string): Promise<string> {
  const db = (await notion(`/databases/${dbId}`)) as {
    properties?: Record<string, { type?: string }>;
  };
  const props = db.properties ?? {};
  for (const [name, def] of Object.entries(props)) {
    if (def?.type === "title") return name;
  }
  return "Name";
}

function chunkBodyToBlocks(body: string) {
  const MAX = 1900;
  const lines = body.split(/\r?\n/);
  const blocks: Array<Record<string, unknown>> = [];
  for (const line of lines) {
    let remaining = line;
    do {
      const piece = remaining.slice(0, MAX);
      remaining = remaining.slice(MAX);
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: piece } }],
        },
      });
    } while (remaining.length > 0);
  }
  return blocks;
}
