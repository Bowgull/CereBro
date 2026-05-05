import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCerebroDb,
  type TaskRow,
  type TaskStatus,
} from "../cerebroDb";

const TASK_STATUSES = ["open", "in_progress", "done", "cancelled"] as const;
const statusSchema = z.enum(TASK_STATUSES);

function rowToTask(r: Record<string, unknown>): TaskRow {
  return {
    id: Number(r.id),
    projectId: r.project_id == null ? null : Number(r.project_id),
    title: String(r.title),
    status: String(r.status) as TaskStatus,
    agent: r.agent == null ? null : String(r.agent),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

export const tasksRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          status: statusSchema.optional(),
          projectId: z.number().int().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.status) {
        where.push("status = ?");
        args.push(input.status);
      }
      if (input?.projectId !== undefined) {
        where.push("project_id = ?");
        args.push(input.projectId);
      }
      const sql = `
        SELECT id, project_id, title, status, agent, created_at, updated_at
        FROM tasks
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY
          CASE status
            WHEN 'in_progress' THEN 0
            WHEN 'open' THEN 1
            WHEN 'done' THEN 2
            WHEN 'cancelled' THEN 3
          END,
          updated_at DESC
      `;
      const result = await db.execute({ sql, args });
      return result.rows.map(rowToTask);
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(280),
        agent: z.string().max(64).optional(),
        projectId: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO tasks (title, agent, project_id)
          VALUES (?, ?, ?)
          RETURNING id, project_id, title, status, agent, created_at, updated_at
        `,
        args: [input.title, input.agent ?? null, input.projectId ?? null],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insert returned no row",
        });
      }
      return rowToTask(row);
    }),

  setStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: statusSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          UPDATE tasks
          SET status = ?, updated_at = unixepoch()
          WHERE id = ?
          RETURNING id, project_id, title, status, agent, created_at, updated_at
        `,
        args: [input.status, input.id],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `No task ${input.id}` });
      }
      return rowToTask(row);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `DELETE FROM tasks WHERE id = ?`,
        args: [input.id],
      });
      return { ok: true } as const;
    }),
});
