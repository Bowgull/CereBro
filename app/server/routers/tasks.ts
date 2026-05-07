import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCerebroDb,
  getOrCreateProjectByPath,
  type TaskRow,
  type TaskStatus,
} from "../cerebroDb";

const TASK_STATUSES = ["open", "in_progress", "done", "cancelled"] as const;
const statusSchema = z.enum(TASK_STATUSES);

function rowToTask(r: Record<string, unknown>): TaskRow {
  return {
    id: Number(r.id),
    projectId: r.project_id == null ? null : Number(r.project_id),
    projectName: r.project_name == null ? null : String(r.project_name),
    projectPath: r.project_path == null ? null : String(r.project_path),
    title: String(r.title),
    status: String(r.status) as TaskStatus,
    agent: r.agent == null ? null : String(r.agent),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

async function getTaskById(id: number): Promise<TaskRow | null> {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT
        t.id,
        t.project_id,
        p.name AS project_name,
        p.path AS project_path,
        t.title,
        t.status,
        t.agent,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      WHERE t.id = ?
      LIMIT 1
    `,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToTask(row) : null;
}

export const tasksRouter = router({
  projects: publicProcedure.query(async () => {
    const db = await getCerebroDb();
    const result = await db.execute({
      sql: `
        SELECT
          p.id,
          p.name,
          p.path,
          COUNT(t.id) AS task_count,
          SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) AS open_count,
          SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count
        FROM projects p
        INNER JOIN tasks t ON t.project_id = p.id
        GROUP BY p.id, p.name, p.path
        ORDER BY p.name COLLATE NOCASE
      `,
    });
    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      path: row.path == null ? null : String(row.path),
      taskCount: Number(row.task_count),
      openCount: Number(row.open_count ?? 0),
      inProgressCount: Number(row.in_progress_count ?? 0),
    }));
  }),

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
        where.push("t.status = ?");
        args.push(input.status);
      }
      if (input?.projectId !== undefined) {
        where.push("t.project_id = ?");
        args.push(input.projectId);
      }
      const sql = `
        SELECT
          t.id,
          t.project_id,
          p.name AS project_name,
          p.path AS project_path,
          t.title,
          t.status,
          t.agent,
          t.created_at,
          t.updated_at
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY
          CASE t.status
            WHEN 'in_progress' THEN 0
            WHEN 'open' THEN 1
            WHEN 'done' THEN 2
            WHEN 'cancelled' THEN 3
          END,
          t.updated_at DESC
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
        projectName: z.string().min(1).max(160).optional(),
        projectPath: z.string().min(1).max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const projectId =
        input.projectId ??
        (input.projectName && input.projectPath
          ? await getOrCreateProjectByPath(input.projectName, input.projectPath)
          : null);
      const result = await db.execute({
        sql: `
          INSERT INTO tasks (title, agent, project_id)
          VALUES (?, ?, ?)
          RETURNING id, project_id, title, status, agent, created_at, updated_at
        `,
        args: [input.title, input.agent ?? null, projectId],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insert returned no row",
        });
      }
      return (await getTaskById(Number(row.id))) ?? rowToTask(row);
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
      return (await getTaskById(Number(row.id))) ?? rowToTask(row);
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
