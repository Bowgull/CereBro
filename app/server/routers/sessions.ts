import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, type SessionRow } from "../cerebroDb";

function rowToSession(r: Record<string, unknown>): SessionRow {
  return {
    id: Number(r.id),
    claudeSessionId: String(r.claude_session_id),
    projectId: r.project_id == null ? null : Number(r.project_id),
    projectName: r.project_name == null ? null : String(r.project_name),
    projectPath: r.project_path == null ? null : String(r.project_path),
    heroClass: r.hero_class == null ? null : String(r.hero_class),
    startedAt: Number(r.started_at),
    lastSeenAt: Number(r.last_seen_at),
    endedAt: r.ended_at == null ? null : Number(r.ended_at),
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
});
