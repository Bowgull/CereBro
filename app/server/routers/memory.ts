import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, type MemoryKind, type MemoryRow } from "../cerebroDb";

const KINDS = ["fact", "note", "reference", "feedback"] as const;
const kindSchema = z.enum(KINDS);

function rowToMemory(r: Record<string, unknown>): MemoryRow {
  return {
    id: Number(r.id),
    kind: String(r.kind) as MemoryKind,
    body: String(r.body),
    tags: r.tags == null ? null : String(r.tags),
    source: r.source == null ? null : String(r.source),
    projectId: r.project_id == null ? null : Number(r.project_id),
    sessionId: r.session_id == null ? null : Number(r.session_id),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

export const memoryRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          kind: kindSchema.optional(),
          search: z.string().max(280).optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.kind) {
        where.push("kind = ?");
        args.push(input.kind);
      }
      if (input?.search) {
        where.push("(body LIKE ? OR tags LIKE ?)");
        const like = `%${input.search}%`;
        args.push(like, like);
      }
      const limit = input?.limit ?? 200;
      args.push(limit);
      const result = await db.execute({
        sql: `
          SELECT id, kind, body, tags, source, project_id, session_id,
                 created_at, updated_at
          FROM memory_entries
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToMemory);
    }),

  create: publicProcedure
    .input(
      z.object({
        body: z.string().min(1).max(8000),
        kind: kindSchema.default("note"),
        tags: z.string().max(280).optional(),
        source: z.string().max(280).optional(),
        projectId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO memory_entries (kind, body, tags, source, project_id, session_id)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING id, kind, body, tags, source, project_id, session_id,
                    created_at, updated_at
        `,
        args: [
          input.kind,
          input.body,
          input.tags ?? null,
          input.source ?? null,
          input.projectId ?? null,
          input.sessionId ?? null,
        ],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insert returned no row",
        });
      }
      return rowToMemory(row);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `DELETE FROM memory_entries WHERE id = ?`,
        args: [input.id],
      });
      return { ok: true } as const;
    }),
});
