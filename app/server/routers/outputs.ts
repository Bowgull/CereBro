import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, type OutputKind, type OutputRow } from "../cerebroDb";
import { writeOutput as vaultWriteOutput } from "../integrations/vault";

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

  writeToVault: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        ext: z.string().max(8).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT o.id, o.title, o.body, o.kind, s.claude_session_id
          FROM outputs o
          LEFT JOIN sessions s ON s.id = o.session_id
          WHERE o.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `No output ${input.id}` });
      }
      const kind = String(row.kind);
      const ext =
        input.ext ??
        (kind === "code" ? "txt" : kind === "diff" ? "diff" : kind === "file" ? "txt" : "md");
      return vaultWriteOutput({
        outputId: Number(row.id),
        sessionClaudeId: row.claude_session_id == null ? null : String(row.claude_session_id),
        title: row.title == null ? null : String(row.title),
        body: String(row.body),
        ext,
      });
    }),
});
