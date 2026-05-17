import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";

const proposalStatusOptions = ["proposed", "approved", "blocked", "contract_ready", "run_blocked"] as const;

type ProposalJoinRow = Record<string, unknown>;

function splitLines(value: unknown) {
  return value == null ? [] : String(value).split("\n").filter(Boolean);
}

function rowToProposal(row: ProposalJoinRow) {
  const requiredApprovals = splitLines(row.required_approvals);
  const approvalStatus = row.approval_status == null ? null : String(row.approval_status);
  const taskId = row.task_id == null ? null : Number(row.task_id);
  const workbenchEvidenceId = row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id);
  const approvalId = row.approval_id == null ? null : Number(row.approval_id);
  const missing: string[] = [];
  if (taskId == null) missing.push("local task record");
  if (workbenchEvidenceId == null) missing.push("Workbench receipt body");
  if (approvalId == null) missing.push("approval receipt");
  else if (approvalStatus !== "approved") missing.push(`approved approval receipt. Current: ${approvalStatus ?? "unknown"}`);
  if (String(row.result_state) !== "not_run") missing.push("not-run result state");

  const canExecute = missing.length === 0;
  const executionState = canExecute ? "contract_ready" : "blocked";
  return {
    id: Number(row.id),
    sourceType: String(row.source_type),
    sourceId: Number(row.source_id),
    actionType: String(row.action_type),
    riskClass: String(row.risk_class),
    requiredApprovals,
    executorAgent: String(row.executor_agent),
    command: row.command == null ? null : String(row.command),
    cwd: row.cwd == null ? null : String(row.cwd),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId,
    approvalId,
    approvalStatus,
    workbenchEvidenceId,
    receiptBody: String(row.receipt_body),
    resultState: String(row.result_state),
    recoveryNote: row.recovery_note == null ? null : String(row.recovery_note),
    status: String(row.status),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    readiness: {
      canExecute,
      executionState,
      missing,
      requiredBeforeExecution: [
        "local action proposal",
        "local task record",
        "Workbench receipt body",
        "approved approval receipt",
        "explicit run request",
      ],
      noActionTaken: [
        "No command ran.",
        "No browser opened.",
        "No model call ran.",
        "No git action ran.",
        "No external write ran.",
      ],
    },
  };
}

async function proposalById(id: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT eap.*,
             a.status AS approval_status,
             a.decided_at AS approval_decided_at
      FROM execution_action_proposals eap
      LEFT JOIN approvals a ON a.id = eap.approval_id
      WHERE eap.id = ?
      LIMIT 1
    `,
    args: [id],
  });
  const row = result.rows[0];
  return row ? rowToProposal(row) : null;
}

async function latestApprovalForObservation(observationId: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id
      FROM approvals
      WHERE target_type = 'command_observation'
        AND target_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    args: [observationId],
  });
  return result.rows[0]?.id == null ? null : Number(result.rows[0].id);
}

async function latestWorkbenchReceiptForObservation(observationId: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT id
      FROM workbench_evidence_records
      WHERE command_observation_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    args: [observationId],
  });
  return result.rows[0]?.id == null ? null : Number(result.rows[0].id);
}

export const executionRouter = router({
  proposeFromCommandObservation: publicProcedure
    .input(
      z.object({
        observationId: z.number().int(),
        approvalId: z.number().int().nullable().optional(),
        workbenchEvidenceId: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const observationResult = await db.execute({
        sql: `
          SELECT id, project_id, task_id, session_id, command, cwd, risk,
                 suggested_agent, explanation, gates, status, exit_code, output_summary
          FROM command_observations
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.observationId],
      });
      const observation = observationResult.rows[0];
      if (!observation) throw new TRPCError({ code: "NOT_FOUND", message: `No command observation ${input.observationId}` });

      const approvalId = input.approvalId ?? await latestApprovalForObservation(input.observationId);
      const workbenchEvidenceId = input.workbenchEvidenceId ?? await latestWorkbenchReceiptForObservation(input.observationId);
      const risk = String(observation.risk);
      const actionType = risk === "read_only"
        ? "local_read_only_command"
        : risk === "destructive"
          ? "local_destructive_command"
          : "local_mutating_or_external_command";
      const requiredApprovals = [
        "Spock command execution approval",
        risk === "read_only" ? "Tony local read confirmation" : "Tony implementation risk review",
        "Workbench receipt body",
      ];
      const receiptBody = [
        `Action proposal from Terminal Lab observation #${input.observationId}.`,
        `Command: ${String(observation.command)}`,
        observation.cwd == null ? null : `Working directory: ${String(observation.cwd)}`,
        `Risk: ${risk.replace(/_/g, " ")}`,
        `Executor: ${String(observation.suggested_agent ?? "tony")}`,
        observation.explanation == null ? null : `Read: ${String(observation.explanation)}`,
        observation.output_summary == null ? null : `Observed output: ${String(observation.output_summary)}`,
        "Result state: not run.",
      ].filter(Boolean).join("\n");
      const inserted = await db.execute({
        sql: `
          INSERT INTO execution_action_proposals (
            source_type, source_id, action_type, risk_class, required_approvals,
            executor_agent, command, cwd, project_id, task_id, approval_id,
            workbench_evidence_id, receipt_body, result_state, recovery_note, status
          )
          VALUES (
            'command_observation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_run', ?, 'proposed'
          )
          RETURNING id
        `,
        args: [
          input.observationId,
          actionType,
          risk,
          requiredApprovals.join("\n"),
          String(observation.suggested_agent ?? "tony"),
          String(observation.command),
          observation.cwd == null ? null : String(observation.cwd),
          observation.project_id == null ? null : Number(observation.project_id),
          observation.task_id == null ? null : Number(observation.task_id),
          approvalId,
          workbenchEvidenceId,
          receiptBody,
          risk === "read_only"
            ? "Read-only command output can be ignored or superseded by a later receipt."
            : "Mutating, external, git, install, and destructive actions need a manual recovery plan before any runner exists.",
        ],
      });
      const proposal = await proposalById(Number(inserted.rows[0]!.id));
      return {
        ok: true as const,
        proposal,
        writesExternal: false,
        wouldExecute: false,
        opensBrowser: false,
        callsModel: false,
        gates: [
          "Created one local execution action proposal.",
          "This did not run the command or approve a future run.",
          "The separate run request stays blocked until task, Workbench body, approval receipt, and explicit run request exist.",
        ],
      };
    }),

  proposals: publicProcedure
    .input(
      z
        .object({
          sourceType: z.literal("command_observation").optional(),
          sourceId: z.number().int().optional(),
          status: z.enum(proposalStatusOptions).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.sourceType) {
        where.push("eap.source_type = ?");
        args.push(input.sourceType);
      }
      if (input?.sourceId !== undefined) {
        where.push("eap.source_id = ?");
        args.push(input.sourceId);
      }
      if (input?.status) {
        where.push("eap.status = ?");
        args.push(input.status);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT eap.*,
                 a.status AS approval_status,
                 a.decided_at AS approval_decided_at
          FROM execution_action_proposals eap
          LEFT JOIN approvals a ON a.id = eap.approval_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY eap.created_at DESC, eap.id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        mode: "local_execution_contract" as const,
        writesExternal: false,
        wouldExecute: false,
        items: result.rows.map(rowToProposal),
      };
    }),

  runApprovedAction: publicProcedure
    .input(z.object({ proposalId: z.number().int(), approved: z.literal(true) }))
    .mutation(async ({ input }) => {
      const proposal = await proposalById(input.proposalId);
      if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: `No execution action proposal ${input.proposalId}` });
      if (!proposal.readiness.canExecute) {
        return {
          ok: false as const,
          blocked: true,
          proposal,
          writesExternal: false,
          wouldExecute: false,
          resultState: "blocked_before_runner",
          reason: proposal.readiness.missing.join("; ") || "Execution contract is not ready.",
          gates: proposal.readiness.requiredBeforeExecution,
        };
      }

      return {
        ok: false as const,
        blocked: true,
        proposal,
        writesExternal: false,
        wouldExecute: false,
        resultState: "contract_ready_no_runner",
        reason: "The approval-gated execution contract is ready, but the shell runner adapter is not installed in this V1 slice.",
        gates: [
          "Contract passed task, Workbench body, and approval receipt checks.",
          "No command ran because the runner adapter is not wired yet.",
          "Next slice must add the local read-only runner with output capture and Ledger receipt before live execution.",
        ],
      };
    }),
});
