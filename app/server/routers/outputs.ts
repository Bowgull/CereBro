import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, type OutputKind, type OutputRow } from "../cerebroDb";

const KINDS = ["text", "code", "file", "diff", "tool_result"] as const;

function rowToOutput(r: Record<string, unknown>): OutputRow {
  return {
    id: Number(r.id),
    sessionId: r.session_id == null ? null : Number(r.session_id),
    projectId: r.project_id == null ? null : Number(r.project_id),
    kind: String(r.kind) as OutputKind,
    title: r.title == null ? null : String(r.title),
    body: String(r.body),
    toolName: r.tool_name == null ? null : String(r.tool_name),
    createdAt: Number(r.created_at),
  };
}

export const outputsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          sessionId: z.number().int().optional(),
          projectId: z.number().int().optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.sessionId !== undefined) {
        where.push("session_id = ?");
        args.push(input.sessionId);
      }
      if (input?.projectId !== undefined) {
        where.push("project_id = ?");
        args.push(input.projectId);
      }
      const limit = input?.limit ?? 100;
      args.push(limit);
      const result = await db.execute({
        sql: `
          SELECT id, session_id, project_id, kind, title, body, tool_name, created_at
          FROM outputs
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToOutput);
    }),
});
