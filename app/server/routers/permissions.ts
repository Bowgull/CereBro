import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";
import {
  actionClasses,
  actionIds,
  decidePermissionPreflight,
  hardGates,
  modeLabel,
  modeSummary,
  perceptionClasses,
  perceptionIds,
  permissionModes,
  preflightDecisions,
  recordPermissionPreflight,
} from "../permissionPolicy";

function rowToEvent(row: Record<string, unknown>) {
  const mode = String(row.mode);
  return {
    id: Number(row.id),
    mode,
    label: modeLabel(mode),
    requestedByAgent: String(row.requested_by_agent),
    reason: row.reason == null ? null : String(row.reason),
    scopeSummary: row.scope_summary == null ? null : String(row.scope_summary),
    hardGates: row.hard_gates == null ? null : String(row.hard_gates),
    createdAt: Number(row.created_at),
  };
}

function rowToPreflightRecord(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    mode: String(row.mode),
    label: modeLabel(String(row.mode)),
    perceptionClass: row.perception_class == null ? null : String(row.perception_class),
    actionClass: row.action_class == null ? null : String(row.action_class),
    decision: String(row.decision),
    approvalRequired: Boolean(row.approval_required),
    requiredApprovals: row.required_approvals == null ? [] : String(row.required_approvals).split("\n").filter(Boolean),
    reasons: row.reasons == null ? [] : String(row.reasons).split("\n").filter(Boolean),
    modeEffect: row.mode_effect == null ? null : String(row.mode_effect),
    sensitiveData: Boolean(row.sensitive_data_flag),
    externalTarget: Boolean(row.external_target_flag),
    destructive: Boolean(row.destructive_flag),
    persistsMemory: Boolean(row.persists_memory_flag),
    requestedByAgent: String(row.requested_by_agent),
    targetSummary: row.target_summary == null ? null : String(row.target_summary),
    createdAt: Number(row.created_at),
  };
}

const preflightInputSchema = z.object({
  perceptionClass: z.enum(perceptionIds).optional(),
  actionClass: z.enum(actionIds).optional(),
  sensitiveData: z.boolean().optional(),
  externalTarget: z.boolean().optional(),
  destructive: z.boolean().optional(),
  persistsMemory: z.boolean().optional(),
});

async function currentMode() {
  const db = await getCerebroDb();
  const result = await db.execute(`
    SELECT *
    FROM permission_mode_events
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);
  const event = result.rows[0] ? rowToEvent(result.rows[0]) : null;
  const mode = event?.mode ?? "default_permissions";
  return {
    mode,
    label: modeLabel(mode),
    summary: modeSummary(mode),
    event,
  };
}

export const permissionsRouter = router({
  policy: publicProcedure.query(async () => {
    const current = await currentMode();
    return {
      mode: "local_policy_shell" as const,
      appendOnly: true,
      writesExternal: false,
      executesCommands: false,
      opensBrowser: false,
      capturesMedia: false,
      callsExternalModels: false,
      current,
      modes: permissionModes.map((mode) => ({
        id: mode,
        label: modeLabel(mode),
        summary: modeSummary(mode),
      })),
      perceptionClasses,
      actionClasses,
      hardGates,
      preflightShape: {
        perceptionClasses: perceptionIds,
        actionClasses: actionIds,
        result: ["allowed_local", "proposal_only", "approval_required", "blocked_by_hard_gate"],
        note: "Preflight is advisory. It does not execute, approve, persist external writes, or open tools. recordPreflight appends local history when a surface needs an audit trail.",
      },
      gates: [
        "Changing permission mode records local policy state only.",
        "Mode changes do not approve hard gates.",
        "External writes, browser/media capture, provider calls, installs, secrets, cleanup, and destructive actions still require separate approval.",
      ],
    };
  }),

  current: publicProcedure.query(async () => {
    const current = await currentMode();
    return {
      ...current,
      appendOnly: true,
      writesExternal: false,
      executesCommands: false,
      opensBrowser: false,
      capturesMedia: false,
      callsExternalModels: false,
      hardGates,
    };
  }),

  history: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT *
          FROM permission_mode_events
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input?.limit ?? 40],
      });
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        items: result.rows.map(rowToEvent),
      };
    }),

  preflight: publicProcedure
    .input(preflightInputSchema)
    .query(async ({ input }) => {
      const current = await currentMode();
      const result = decidePermissionPreflight({
        mode: current.mode,
        ...input,
      });
      return {
        mode: current.mode,
        label: current.label,
        appendOnly: false,
        advisoryOnly: true,
        writesExternal: false,
        executesCommands: false,
        opensBrowser: false,
        capturesMedia: false,
        callsExternalModels: false,
        input,
        ...result,
        hardGates,
        noActionTaken: [
          "No approval was granted.",
          "No command was executed.",
          "No browser or media tool was opened.",
          "No external model/tool/provider was called.",
          "No Notion, Slack, file cleanup, account, token, install, or external write action ran.",
        ],
      };
    }),

  recordPreflight: publicProcedure
    .input(
      preflightInputSchema.extend({
        requestedByAgent: z.string().max(80).optional(),
        targetSummary: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const current = await currentMode();
      const { row } = await recordPermissionPreflight(db, {
        mode: current.mode,
        perceptionClass: input.perceptionClass,
        actionClass: input.actionClass,
        sensitiveData: input.sensitiveData,
        externalTarget: input.externalTarget,
        destructive: input.destructive,
        persistsMemory: input.persistsMemory,
        requestedByAgent: input.requestedByAgent ?? "cortana",
        targetSummary: input.targetSummary ?? null,
      });

      return {
        ok: true as const,
        appendOnly: true,
        advisoryOnly: true,
        writesExternal: false,
        executesCommands: false,
        opensBrowser: false,
        capturesMedia: false,
        callsExternalModels: false,
        record: rowToPreflightRecord(row),
        hardGates,
        noActionTaken: [
          "No approval was granted.",
          "No command was executed.",
          "No browser or media tool was opened.",
          "No external model/tool/provider was called.",
          "No Notion, Slack, cleanup, account, token, install, or external write action ran.",
        ],
      };
    }),

  preflightRecords: publicProcedure
    .input(
      z
        .object({
          decision: z.enum(preflightDecisions).optional(),
          perceptionClass: z.enum(perceptionIds).optional(),
          actionClass: z.enum(actionIds).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.decision) {
        where.push("decision = ?");
        args.push(input.decision);
      }
      if (input?.perceptionClass) {
        where.push("perception_class = ?");
        args.push(input.perceptionClass);
      }
      if (input?.actionClass) {
        where.push("action_class = ?");
        args.push(input.actionClass);
      }
      args.push(input?.limit ?? 40);
      const records = await db.execute({
        sql: `
          SELECT *
          FROM permission_preflight_records
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });
      const items = records.rows.map(rowToPreflightRecord);
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        executesCommands: false,
        opensBrowser: false,
        capturesMedia: false,
        callsExternalModels: false,
        items,
        summary: {
          total: items.length,
          approvalRequired: items.filter((item) => item.approvalRequired).length,
          blocked: items.filter((item) => item.decision === "blocked_by_hard_gate").length,
        },
        gates: [
          "Permission preflight records are local append-only audit history.",
          "Reading them does not approve, execute, browse, capture, call providers, or write externally.",
        ],
      };
    }),

  setMode: publicProcedure
    .input(
      z.object({
        mode: z.enum(permissionModes),
        reason: z.string().max(500).optional(),
        requestedByAgent: z.string().max(80).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO permission_mode_events (
            mode, requested_by_agent, reason, scope_summary, hard_gates
          )
          VALUES (?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.mode,
          input.requestedByAgent ?? "cortana",
          input.reason ?? "User changed global permission mode.",
          modeSummary(input.mode),
          hardGates.join("; "),
        ],
      });
      return {
        ok: true as const,
        appendOnly: true,
        event: rowToEvent(result.rows[0]!),
        writesExternal: false,
        executesCommands: false,
        opensBrowser: false,
        capturesMedia: false,
        callsExternalModels: false,
        gates: [
          "Recorded one local permission-mode event.",
          "This did not approve browser, media, command, provider, file, Slack, Notion, cleanup, or destructive actions.",
        ],
      };
    }),
});
