import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";
import { recordPermissionPreflight } from "../permissionPolicy";

const unlockPhrase = "execute order 66";
const confirmPhrase = "i swear i'm up to no good.";
const lockPhrases = new Set(["we're done here", "we're done here.", "we’re done here", "we’re done here."]);
const eventTypes = ["taste_note", "saved_item", "source_preference", "chat_note", "boundary_note"] as const;

function normalizePhrase(value: string) {
  return value.trim().toLowerCase().replace(/[’]/g, "'");
}

function rowToSession(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    status: String(row.status),
    unlockStage: String(row.unlock_stage),
    privacyScope: String(row.privacy_scope),
    openedBy: String(row.opened_by),
    lockReason: row.lock_reason == null ? null : String(row.lock_reason),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    createdAt: Number(row.created_at),
    lastSeenAt: Number(row.last_seen_at),
    lockedAt: row.locked_at == null ? null : Number(row.locked_at),
  };
}

function rowToEvent(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    ravenSessionId: Number(row.raven_session_id),
    eventType: String(row.event_type),
    title: row.title == null ? null : String(row.title),
    body: String(row.body),
    sourceUri: row.source_uri == null ? null : String(row.source_uri),
    sourceLabel: row.source_label == null ? null : String(row.source_label),
    privacyClass: String(row.privacy_class),
    metadata: row.metadata_json == null ? null : JSON.parse(String(row.metadata_json)),
    createdAt: Number(row.created_at),
  };
}

async function getActiveSession() {
  const db = await getCerebroDb();
  const result = await db.execute(`
    SELECT *
    FROM raven_private_sessions
    WHERE status = 'active'
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);
  return result.rows[0] ? rowToSession(result.rows[0]) : null;
}

export const ravenRouter = router({
  status: publicProcedure.query(async () => {
    const activeSession = await getActiveSession();
    return {
      mode: "sealed_private_module" as const,
      status: activeSession ? "unlocked" : "sealed",
      activeSession,
      writesExternal: false,
      opensBrowser: false,
      downloadsMedia: false,
      callsExternalModels: false,
      writesCoreMemory: false,
      writesNotion: false,
      writesObsidian: false,
      gates: [
        "Unlock requires the exact two-phrase confirmation.",
        "Raven data stays in raven_private_* tables.",
        "No source scanning, browser session, media download, generator call, or core-memory export is active.",
      ],
    };
  }),

  requestUnlock: publicProcedure
    .input(z.object({ phrase: z.string().min(1) }))
    .mutation(async ({ input }) => {
      if (normalizePhrase(input.phrase) !== unlockPhrase) {
        return {
          ok: false,
          status: "sealed" as const,
          message: "Raven stays sealed.",
          nextAction: "Enter the first unlock phrase.",
        };
      }
      return {
        ok: true,
        status: "confirmation_required" as const,
        message: "Please confirm.",
        nextAction: "Enter the second unlock phrase.",
      };
    }),

  confirmUnlock: publicProcedure
    .input(
      z.object({
        phrase: z.string().min(1),
        privacyScope: z.string().min(1).max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (normalizePhrase(input.phrase) !== confirmPhrase) {
        return {
          ok: false,
          status: "sealed" as const,
          message: "Raven stays sealed.",
        };
      }

      const db = await getCerebroDb();
      const permissionPreflight = await recordPermissionPreflight(db, {
        actionClass: "local_note",
        sensitiveData: true,
        persistsMemory: false,
        requestedByAgent: "cortana",
        targetSummary: "Raven sealed module unlock.",
        additionalReasons: [
          "User explicitly requested Raven unlock in this session.",
          "Private data remains outside core CereBro memory.",
        ],
      });
      const result = await db.execute({
        sql: `
          INSERT INTO raven_private_sessions (
            status,
            unlock_stage,
            privacy_scope,
            opened_by,
            permission_preflight_id
          )
          VALUES ('active', 'confirmed', ?, 'cortana', ?)
          RETURNING *
        `,
        args: [
          input.privacyScope ??
            "Local-only Raven build session. No external writes, browser sessions, downloads, generator calls, Notion, Obsidian, Slack, or core-memory export.",
          Number(permissionPreflight.row.id),
        ],
      });
      return {
        ok: true,
        status: "unlocked" as const,
        session: rowToSession(result.rows[0]!),
        boundary: {
          writesExternal: false,
          opensBrowser: false,
          downloadsMedia: false,
          callsExternalModels: false,
          writesCoreMemory: false,
        },
      };
    }),

  addPrivateEvent: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        eventType: z.enum(eventTypes),
        title: z.string().max(160).optional(),
        body: z.string().min(1).max(5000),
        sourceUri: z.string().url().optional(),
        sourceLabel: z.string().max(160).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const activeSession = input.ravenSessionId
        ? await db.execute({
            sql: `SELECT * FROM raven_private_sessions WHERE id = ? AND status = 'active' LIMIT 1`,
            args: [input.ravenSessionId],
          })
        : await db.execute(`
            SELECT *
            FROM raven_private_sessions
            WHERE status = 'active'
            ORDER BY created_at DESC, id DESC
            LIMIT 1
          `);
      const sessionRow = activeSession.rows[0];
      if (!sessionRow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Raven is sealed. Unlock Raven before writing private events.",
        });
      }

      const result = await db.execute({
        sql: `
          INSERT INTO raven_private_events (
            raven_session_id,
            event_type,
            title,
            body,
            source_uri,
            source_label,
            privacy_class,
            metadata_json
          )
          VALUES (?, ?, ?, ?, ?, ?, 'raven_private', ?)
          RETURNING *
        `,
        args: [
          Number(sessionRow.id),
          input.eventType,
          input.title ?? null,
          input.body,
          input.sourceUri ?? null,
          input.sourceLabel ?? null,
          input.metadata == null ? null : JSON.stringify(input.metadata),
        ],
      });
      await db.execute({
        sql: `UPDATE raven_private_sessions SET last_seen_at = unixepoch() WHERE id = ?`,
        args: [Number(sessionRow.id)],
      });
      return {
        ok: true,
        writesCoreMemory: false,
        writesExternal: false,
        event: rowToEvent(result.rows[0]!),
      };
    }),

  recentEvents: publicProcedure
    .input(
      z
        .object({
          ravenSessionId: z.number().int().positive().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          mode: "sealed" as const,
          items: [],
          writesCoreMemory: false,
          writesExternal: false,
        };
      }
      const db = await getCerebroDb();
      const sessionId = input?.ravenSessionId ?? activeSession.id;
      const result = await db.execute({
        sql: `
          SELECT *
          FROM raven_private_events
          WHERE raven_session_id = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [sessionId, input?.limit ?? 30],
      });
      return {
        mode: "private_read" as const,
        ravenSessionId: sessionId,
        items: result.rows.map(rowToEvent),
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),

  lock: publicProcedure
    .input(
      z.object({
        ravenSessionId: z.number().int().positive().optional(),
        phrase: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (!lockPhrases.has(normalizePhrase(input.phrase))) {
        return {
          ok: false,
          status: "active" as const,
          message: "Raven remains open.",
        };
      }
      const activeSession = await getActiveSession();
      if (!activeSession) {
        return {
          ok: true,
          status: "sealed" as const,
          message: "Raven is already sealed.",
        };
      }
      const sessionId = input.ravenSessionId ?? activeSession.id;
      const db = await getCerebroDb();
      await db.execute({
        sql: `
          UPDATE raven_private_sessions
          SET status = 'locked',
              lock_reason = 'user_phrase',
              locked_at = unixepoch(),
              last_seen_at = unixepoch()
          WHERE id = ? AND status = 'active'
        `,
        args: [sessionId],
      });
      return {
        ok: true,
        status: "sealed" as const,
        ravenSessionId: sessionId,
        writesCoreMemory: false,
        writesExternal: false,
      };
    }),
});
