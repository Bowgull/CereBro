import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, type SessionRow } from "../cerebroDb";

export function sessionDisplayName(input: {
  id: number;
  title?: string | null;
  projectName: string | null;
  heroClass: string | null;
  endedAt: number | null;
}): string {
  const title = input.title?.trim();
  if (title) return title;
  const state = input.endedAt == null ? "Active" : "Closed";
  const agent = input.heroClass ? titleCase(input.heroClass) : "Agent";
  const project = input.projectName ? ` - ${input.projectName}` : "";
  return `${state} ${agent} run #${input.id}${project}`;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rowToSession(r: Record<string, unknown>): SessionRow {
  const session = {
    id: Number(r.id),
    claudeSessionId: String(r.claude_session_id),
    projectId: r.project_id == null ? null : Number(r.project_id),
    title: r.title == null ? null : String(r.title),
    notes: r.notes == null ? null : String(r.notes),
    projectName: r.project_name == null ? null : String(r.project_name),
    projectPath: r.project_path == null ? null : String(r.project_path),
    heroClass: r.hero_class == null ? null : String(r.hero_class),
    startedAt: Number(r.started_at),
    lastSeenAt: Number(r.last_seen_at),
    endedAt: r.ended_at == null ? null : Number(r.ended_at),
  };
  return {
    ...session,
    displayName: sessionDisplayName(session),
  };
}

export const sessionsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          activeOnly: z.boolean().optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      if (input?.activeOnly) where.push("s.ended_at IS NULL");
      const limit = input?.limit ?? 100;
      const result = await db.execute({
        sql: `
          SELECT
            s.id, s.claude_session_id, s.project_id, s.hero_class,
            s.title, s.notes,
            s.started_at, s.last_seen_at, s.ended_at,
            p.name AS project_name, p.path AS project_path
          FROM sessions s
          LEFT JOIN projects p ON p.id = s.project_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY s.last_seen_at DESC
          LIMIT ?
        `,
        args: [limit],
      });
      return result.rows.map(rowToSession);
    }),

  updateLedger: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().max(160).nullable().optional(),
        notes: z.string().max(1000).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          UPDATE sessions
          SET title = ?,
              notes = ?,
              last_seen_at = last_seen_at
          WHERE id = ?
          RETURNING id, claude_session_id, project_id, title, notes, hero_class,
                    started_at, last_seen_at, ended_at
        `,
        args: [
          input.title?.trim() ? input.title.trim() : null,
          input.notes?.trim() ? input.notes.trim() : null,
          input.id,
        ],
      });
      const row = result.rows[0];
      if (!row) return { ok: false, session: null };
      const project = await db.execute({
        sql: `SELECT name AS project_name, path AS project_path FROM projects WHERE id = ? LIMIT 1`,
        args: [row.project_id],
      });
      return {
        ok: true,
        session: rowToSession({ ...row, ...(project.rows[0] ?? {}) }),
      };
    }),
});
