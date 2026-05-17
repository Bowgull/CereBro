import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCerebroDb,
  getOrCreateProjectByPath,
  type VisionRow,
  type VisionStatus,
} from "../cerebroDb";

export const VISION_STATUSES = ["active", "paused", "blocked", "achieved", "unmet", "budget_limited"] as const;
const visionStatusSchema = z.enum(VISION_STATUSES);

function rowToVision(row: Record<string, unknown>): VisionRow {
  return {
    id: Number(row.id),
    title: String(row.title),
    intent: String(row.intent),
    status: String(row.status) as VisionStatus,
    statusNote: row.status_note == null ? null : String(row.status_note),
    ownerAgent: String(row.owner_agent ?? "aang"),
    projectId: row.project_id == null ? null : Number(row.project_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    routeRecordId: row.route_record_id == null ? null : Number(row.route_record_id),
    stopRule: String(row.stop_rule),
    successCriteria: String(row.success_criteria),
    riskNote: row.risk_note == null ? null : String(row.risk_note),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    completedAt: row.completed_at == null ? null : Number(row.completed_at),
  };
}

async function readVisionById(id: number): Promise<VisionRow | null> {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `SELECT * FROM visions WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToVision(row as Record<string, unknown>) : null;
}

async function inferProjectFromTask(taskId: number | null) {
  if (taskId == null) return null;
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `SELECT project_id FROM tasks WHERE id = ? LIMIT 1`,
    args: [taskId],
  });
  const row = result.rows[0];
  return row?.project_id == null ? null : Number(row.project_id);
}

async function readVisionTask(taskId: number | null) {
  if (taskId == null) return null;
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, title, status, agent, project_id, session_id, created_at, updated_at
      FROM tasks
      WHERE id = ?
      LIMIT 1
    `,
    args: [taskId],
  });
  const row = result.rows[0];
  return row
    ? {
        id: Number(row.id),
        title: String(row.title),
        status: String(row.status),
        agent: row.agent == null ? null : String(row.agent),
        projectId: row.project_id == null ? null : Number(row.project_id),
        sessionId: row.session_id == null ? null : Number(row.session_id),
        createdAt: Number(row.created_at),
        updatedAt: Number(row.updated_at),
      }
    : null;
}

async function readVisionRoute(routeRecordId: number | null) {
  if (routeRecordId == null) return null;
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, original_text, mode, category, owner_agent, next_action, created_at
      FROM runtime_route_records
      WHERE id = ?
      LIMIT 1
    `,
    args: [routeRecordId],
  });
  const row = result.rows[0];
  return row
    ? {
        id: Number(row.id),
        originalText: String(row.original_text),
        mode: String(row.mode),
        category: String(row.category),
        ownerAgent: String(row.owner_agent),
        nextAction: String(row.next_action),
        createdAt: Number(row.created_at),
      }
    : null;
}

async function readRouteWorkbenchEvidence(routeRecordId: number | null) {
  if (routeRecordId == null) return null;
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, kind, title, summary, target_uri, validation_status, owner_agent, created_at
      FROM workbench_evidence_records
      WHERE target_uri = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    args: [`runtime_route:${routeRecordId}`],
  });
  const row = result.rows[0];
  return row
    ? {
        id: Number(row.id),
        kind: String(row.kind),
        title: String(row.title),
        summary: String(row.summary),
        targetUri: row.target_uri == null ? null : String(row.target_uri),
        validationStatus: String(row.validation_status),
        ownerAgent: String(row.owner_agent),
        createdAt: Number(row.created_at),
      }
    : null;
}

async function readRouteApproval(routeRecordId: number | null) {
  if (routeRecordId == null) return null;
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id, task_id, action_type, status, requested_by_agent, reason, created_at, decided_at
      FROM approvals
      WHERE target_type = 'runtime_route_record'
        AND target_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    args: [routeRecordId],
  });
  const row = result.rows[0];
  return row
    ? {
        id: Number(row.id),
        taskId: row.task_id == null ? null : Number(row.task_id),
        actionType: String(row.action_type),
        status: String(row.status),
        requestedByAgent: row.requested_by_agent == null ? null : String(row.requested_by_agent),
        reason: row.reason == null ? null : String(row.reason),
        createdAt: Number(row.created_at),
        decidedAt: row.decided_at == null ? null : Number(row.decided_at),
      }
    : null;
}

async function readVisionExecutionResults(vision: VisionRow) {
  const db = await getCerebroDb();
  const where: string[] = [];
  const args: number[] = [];
  if (vision.taskId != null) {
    where.push("p.task_id = ?");
    args.push(vision.taskId);
  }
  if (vision.routeRecordId != null) {
    where.push("(p.source_type = 'runtime_route_record' AND p.source_id = ?)");
    args.push(vision.routeRecordId);
  }
  if (where.length === 0) return [];
  const result = await db.execute({
    sql: `
      SELECT r.id, r.proposal_id, r.approval_id, r.executor_agent, r.command, r.status, r.receipt_body, r.created_at
      FROM execution_action_results r
      INNER JOIN execution_action_proposals p ON p.id = r.proposal_id
      WHERE ${where.join(" OR ")}
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT 10
    `,
    args,
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    proposalId: row.proposal_id == null ? null : Number(row.proposal_id),
    approvalId: row.approval_id == null ? null : Number(row.approval_id),
    executorAgent: String(row.executor_agent),
    command: String(row.command),
    status: String(row.status),
    receiptBody: String(row.receipt_body),
    createdAt: Number(row.created_at),
  }));
}

function receiptTrail(input: {
  vision: VisionRow;
  task: Awaited<ReturnType<typeof readVisionTask>>;
  route: Awaited<ReturnType<typeof readVisionRoute>>;
  workbenchEvidence: Awaited<ReturnType<typeof readRouteWorkbenchEvidence>>;
  approval: Awaited<ReturnType<typeof readRouteApproval>>;
  executionResults: Awaited<ReturnType<typeof readVisionExecutionResults>>;
}) {
  const trail = [`Vision #${input.vision.id}`];
  if (input.task) trail.push(`Task #${input.task.id}`);
  if (input.route) trail.push(`Cortana route #${input.route.id}`);
  if (input.workbenchEvidence) trail.push(`Workbench body #${input.workbenchEvidence.id}`);
  if (input.approval) trail.push(`Approval #${input.approval.id}`);
  if (input.executionResults.length > 0) trail.push(`${input.executionResults.length} execution result${input.executionResults.length === 1 ? "" : "s"}`);
  return trail;
}

export const visionsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(240),
        intent: z.string().min(1).max(2000),
        successCriteria: z.string().min(1).max(2000),
        stopRule: z.string().min(1).max(1200),
        ownerAgent: z.string().min(1).max(64).default("aang"),
        projectId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
        taskId: z.number().int().optional(),
        routeRecordId: z.number().int().optional(),
        projectName: z.string().min(1).max(160).optional(),
        projectPath: z.string().min(1).max(1000).optional(),
        createTask: z.boolean().default(false),
        taskTitle: z.string().min(1).max(280).optional(),
        riskNote: z.string().max(1200).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      let projectId =
        input.projectId ??
        (input.projectName && input.projectPath
          ? await getOrCreateProjectByPath(input.projectName, input.projectPath)
          : null);
      let taskId = input.taskId ?? null;

      if (input.createTask) {
        const task = await db.execute({
          sql: `
            INSERT INTO tasks (title, agent, project_id, session_id)
            VALUES (?, ?, ?, ?)
            RETURNING id, project_id
          `,
          args: [
            input.taskTitle ?? input.title,
            input.ownerAgent,
            projectId,
            input.sessionId ?? null,
          ],
        });
        taskId = Number(task.rows[0]!.id);
        projectId = task.rows[0]?.project_id == null ? projectId : Number(task.rows[0].project_id);
      } else if (projectId == null) {
        projectId = await inferProjectFromTask(taskId);
      }

      const inserted = await db.execute({
        sql: `
          INSERT INTO visions (
            title, intent, status, owner_agent, project_id, session_id,
            task_id, route_record_id, stop_rule, success_criteria, risk_note
          )
          VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.title,
          input.intent,
          input.ownerAgent,
          projectId,
          input.sessionId ?? null,
          taskId,
          input.routeRecordId ?? null,
          input.stopRule,
          input.successCriteria,
          input.riskNote ?? null,
        ],
      });
      const row = inserted.rows[0];
      if (!row) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Vision insert returned no row" });
      }
      return {
        vision: rowToVision(row as Record<string, unknown>),
        wouldExecute: false,
        opensBrowser: false,
        callsProvider: false,
        writesExternal: false,
        gates: [
          "Vision creation writes a local contract row only.",
          "Optional task creation writes a local task row only.",
          "No command, browser, provider, approval, or external write ran.",
        ],
      };
    }),

  list: publicProcedure
    .input(
      z
        .object({
          status: visionStatusSchema.optional(),
          limit: z.number().int().min(1).max(100).default(25),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where = input?.status ? "WHERE status = ?" : "";
      const result = await db.execute({
        sql: `
          SELECT *
          FROM visions
          ${where}
          ORDER BY
            CASE status
              WHEN 'active' THEN 0
              WHEN 'blocked' THEN 1
              WHEN 'paused' THEN 2
              WHEN 'budget_limited' THEN 3
              WHEN 'unmet' THEN 4
              WHEN 'achieved' THEN 5
            END,
            updated_at DESC,
            id DESC
          LIMIT ?
        `,
        args: input?.status ? [input.status, input.limit ?? 25] : [input?.limit ?? 25],
      });
      return {
        mode: "read_only" as const,
        items: result.rows.map((row) => rowToVision(row as Record<string, unknown>)),
      };
    }),

  detail: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const vision = await readVisionById(input.id);
      if (!vision) throw new TRPCError({ code: "NOT_FOUND", message: `No Vision ${input.id}` });
      const [task, route, workbenchEvidence, approval, executionResults] = await Promise.all([
        readVisionTask(vision.taskId),
        readVisionRoute(vision.routeRecordId),
        readRouteWorkbenchEvidence(vision.routeRecordId),
        readRouteApproval(vision.routeRecordId),
        readVisionExecutionResults(vision),
      ]);
      return {
        mode: "read_only" as const,
        vision,
        task,
        route,
        workbenchEvidence,
        approval,
        executionResults,
        receiptTrail: receiptTrail({ vision, task, route, workbenchEvidence, approval, executionResults }),
      };
    }),

  setStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: visionStatusSchema,
        statusNote: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const terminal = input.status === "achieved" || input.status === "unmet" || input.status === "budget_limited";
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          UPDATE visions
          SET status = ?,
              status_note = ?,
              updated_at = unixepoch(),
              completed_at = CASE WHEN ? THEN COALESCE(completed_at, unixepoch()) ELSE NULL END
          WHERE id = ?
          RETURNING *
        `,
        args: [input.status, input.statusNote ?? null, terminal ? 1 : 0, input.id],
      });
      const row = result.rows[0];
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: `No Vision ${input.id}` });
      return {
        vision: rowToVision(row as Record<string, unknown>),
        wouldExecute: false,
        writesExternal: false,
      };
    }),
});
