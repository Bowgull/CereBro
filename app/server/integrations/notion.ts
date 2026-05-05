/**
 * Notion adapter — inbox/outbox pattern.
 *
 * V1 contract:
 * - Inbox: a Notion database the user pushes notes/links/briefs into.
 *   CereBro polls and ingests into memory_entries (kind=note, source=notion).
 * - Outbox: a separate Notion database CereBro publishes outputs to.
 *
 * Auth via env: NOTION_TOKEN (internal integration secret),
 * NOTION_INBOX_DATABASE_ID, NOTION_OUTBOX_DATABASE_ID.
 *
 * This module never throws on missing config — callers check `isConfigured()`.
 * Without the token the adapter is a no-op so dev runs unaffected.
 */

export interface NotionStatus {
  configured: boolean;
  hasInbox: boolean;
  hasOutbox: boolean;
  inboxDatabaseId: string | null;
  outboxDatabaseId: string | null;
}

export function getNotionStatus(): NotionStatus {
  const token = process.env.NOTION_TOKEN;
  const inbox = process.env.NOTION_INBOX_DATABASE_ID ?? null;
  const outbox = process.env.NOTION_OUTBOX_DATABASE_ID ?? null;
  return {
    configured: Boolean(token),
    hasInbox: Boolean(token && inbox),
    hasOutbox: Boolean(token && outbox),
    inboxDatabaseId: inbox,
    outboxDatabaseId: outbox,
  };
}

export function isConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN);
}

/**
 * Placeholder for the inbox poller. Real wiring lands once NOTION_TOKEN
 * is set; the import target (@notionhq/client) is intentionally not
 * pulled in yet to keep the dep surface clean.
 */
export async function pollInbox(): Promise<{ ingested: number; skipped: number }> {
  if (!isConfigured()) return { ingested: 0, skipped: 0 };
  // TODO(phase2): import @notionhq/client lazily, query the inbox database
  // for entries since last_polled_at, write each into memory_entries with
  // source='notion', mark the Notion page as ingested.
  return { ingested: 0, skipped: 0 };
}

export async function publishToOutbox(_payload: {
  title: string;
  body: string;
  sessionId?: number;
}): Promise<{ ok: boolean; pageId?: string; reason?: string }> {
  if (!isConfigured()) {
    return { ok: false, reason: "NOTION_TOKEN not set" };
  }
  // TODO(phase2): create a page in NOTION_OUTBOX_DATABASE_ID with the payload.
  return { ok: false, reason: "outbox publish not yet implemented" };
}
