import { TRPCError } from "@trpc/server";
import { spawn } from "node:child_process";
import path from "node:path";
import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";

const proposalStatusOptions = ["proposed", "approved", "blocked", "contract_ready", "run_blocked"] as const;
const allowedReadOnlyCommands = new Set(["cat", "date", "find", "git", "ls", "pwd", "rg", "sed", "stat", "tail", "wc", "which"]);
const allowedGitSubcommands = new Set(["branch", "diff", "log", "rev-parse", "show", "status"]);
const runnerTimeoutMs = 5000;

type ProposalJoinRow = Record<string, unknown>;

function splitLines(value: unknown) {
  return value == null ? [] : String(value).split("\n").filter(Boolean);
}

function summarizeOutput(value: string) {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\b(token|secret|password|api[_-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .slice(0, 4000);
}

function parseCommand(command: string) {
  const text = command.trim();
  if (!text) return { ok: false as const, reason: "Command is empty." };
  if (/[\n\r|&;<>()`$]/.test(text) || text.includes(">")) {
    return { ok: false as const, reason: "Shell operators, redirects, command substitution, and chained commands are blocked." };
  }

  const tokens: string[] = [];
  let current = "";
  let quote: "'" | "\"" | null = null;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote) {
      if (char === quote) {
        quote = null;
      } else if (char === "\\" && quote === "\"" && index + 1 < text.length) {
        index += 1;
        current += text[index]!;
      } else {
        current += char;
      }
      continue;
    }
    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    if (char === "\\") {
      return { ok: false as const, reason: "Backslash escapes are blocked in the read-only runner." };
    }
    current += char;
  }
  if (quote) return { ok: false as const, reason: "Unclosed quote in command." };
  if (current) tokens.push(current);
  if (tokens.length === 0) return { ok: false as const, reason: "Command is empty." };
  return { ok: true as const, file: tokens[0]!, args: tokens.slice(1) };
}

function runnerPolicyForCommand(command: string) {
  const parsed = parseCommand(command);
  if (!parsed.ok) return parsed;
  if (!allowedReadOnlyCommands.has(parsed.file)) {
    return { ok: false as const, reason: `Command ${parsed.file} is not in the read-only runner allowlist.` };
  }
  const args = parsed.args.map((arg) => arg.toLowerCase());
  if (parsed.file === "git") {
    if (args.some((arg) => arg === "-c" || arg === "-c." || arg.startsWith("--git-dir") || arg.startsWith("--work-tree"))) {
      return { ok: false as const, reason: "git config, git-dir, and work-tree overrides are blocked in the read-only runner." };
    }
    const subcommand = args.find((arg) => !arg.startsWith("-"));
    if (!subcommand || !allowedGitSubcommands.has(subcommand)) {
      return { ok: false as const, reason: "Only read-only git status, diff, log, show, branch, and rev-parse are allowed." };
    }
  }
  if (parsed.file === "find" && args.some((arg) => arg === "-delete" || arg === "-exec" || arg === "-execdir")) {
    return { ok: false as const, reason: "find delete and exec forms are blocked." };
  }
  if (parsed.file === "sed" && args.some((arg) => arg === "-i" || arg.startsWith("-i"))) {
    return { ok: false as const, reason: "sed in-place edits are blocked." };
  }
  return parsed;
}

function allowedPathRoots(projectPath: string | null) {
  return [
    projectPath ? path.resolve(projectPath) : null,
    "/Users/lindsaybell/Desktop/CereBro",
  ].filter(Boolean) as string[];
}

function pathWithinAllowedRoots(candidate: string, roots: string[]) {
  return roots.some((root) => candidate === root || candidate.startsWith(`${root}${path.sep}`));
}

function containedCwd(cwd: string | null, projectPath: string | null) {
  if (!cwd) return { ok: false as const, reason: "Missing cwd." };
  const resolved = path.resolve(cwd);
  const allowedRoots = allowedPathRoots(projectPath);
  const matched = pathWithinAllowedRoots(resolved, allowedRoots);
  if (!matched) {
    return { ok: false as const, reason: "cwd is outside the approved project boundary." };
  }
  return { ok: true as const, cwd: resolved };
}

function argLooksLikePath(arg: string) {
  return arg === "."
    || arg === ".."
    || arg.startsWith("/")
    || arg.startsWith("./")
    || arg.startsWith("../")
    || arg.startsWith("~/")
    || arg.includes("/")
    || arg.includes(`${path.sep}..${path.sep}`);
}

function containedCommandArgs(input: { file: string; args: string[]; cwd: string; projectPath: string | null }) {
  if (input.file === "git") return { ok: true as const };
  const roots = allowedPathRoots(input.projectPath);
  for (const arg of input.args) {
    if (arg.startsWith("-") || !argLooksLikePath(arg)) continue;
    if (arg.startsWith("~/")) {
      return { ok: false as const, reason: "Home-directory path arguments are blocked in the read-only runner." };
    }
    const candidate = path.resolve(input.cwd, arg);
    if (!pathWithinAllowedRoots(candidate, roots)) {
      return { ok: false as const, reason: "Path arguments must stay inside the approved project boundary." };
    }
  }
  return { ok: true as const };
}

function runReadOnlyCommand(input: { file: string; args: string[]; cwd: string }) {
  return new Promise<{
    exitCode: number | null;
    stdout: string;
    stderr: string;
    durationMs: number;
    timedOut: boolean;
  }>((resolve) => {
    const startedAt = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const child = spawn(input.file, input.args, {
      cwd: input.cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        PATH: process.env.PATH ?? "/usr/bin:/bin:/usr/sbin:/sbin",
        HOME: process.env.HOME ?? "/Users/lindsaybell",
        LC_ALL: "C",
      },
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, runnerTimeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 12000) stdout = stdout.slice(0, 12000);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 12000) stderr = stderr.slice(0, 12000);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        exitCode: null,
        stdout,
        stderr: `${stderr}\n${error.message}`.trim(),
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code,
        stdout,
        stderr,
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
  });
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
    projectPath: row.project_path == null ? null : String(row.project_path),
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
             a.decided_at AS approval_decided_at,
             p.path AS project_path
      FROM execution_action_proposals eap
      LEFT JOIN approvals a ON a.id = eap.approval_id
      LEFT JOIN projects p ON p.id = eap.project_id
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
          sourceType: z.enum(["command_observation", "project_push"]).optional(),
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
                 a.decided_at AS approval_decided_at,
                 p.path AS project_path
          FROM execution_action_proposals eap
          LEFT JOIN approvals a ON a.id = eap.approval_id
          LEFT JOIN projects p ON p.id = eap.project_id
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
      if (proposal.actionType !== "local_read_only_command" || proposal.riskClass !== "read_only") {
        return {
          ok: false as const,
          blocked: true,
          proposal,
          writesExternal: false,
          wouldExecute: false,
          resultState: "blocked_by_runner_policy",
          reason: "Only approved read-only command contracts can run in this V1 slice.",
          gates: ["Mutating, external, git write, install, and destructive actions remain blocked."],
        };
      }
      if (!proposal.command) {
        return {
          ok: false as const,
          blocked: true,
          proposal,
          writesExternal: false,
          wouldExecute: false,
          resultState: "blocked_by_runner_policy",
          reason: "Action proposal has no command.",
          gates: proposal.readiness.requiredBeforeExecution,
        };
      }
      const policy = runnerPolicyForCommand(proposal.command);
      if (!policy.ok) {
        return {
          ok: false as const,
          blocked: true,
          proposal,
          writesExternal: false,
          wouldExecute: false,
          resultState: "blocked_by_runner_policy",
          reason: policy.reason,
          gates: ["Read-only runner allowlist blocked this command before execution."],
        };
      }
      const cwdCheck = containedCwd(proposal.cwd, (proposal as typeof proposal & { projectPath?: string | null }).projectPath ?? null);
      if (!cwdCheck.ok) {
        return {
          ok: false as const,
          blocked: true,
          proposal,
          writesExternal: false,
          wouldExecute: false,
          resultState: "blocked_by_cwd_policy",
          reason: cwdCheck.reason,
          gates: ["cwd containment blocked this command before execution."],
        };
      }
      const argCheck = containedCommandArgs({
        file: policy.file,
        args: policy.args,
        cwd: cwdCheck.cwd,
        projectPath: (proposal as typeof proposal & { projectPath?: string | null }).projectPath ?? null,
      });
      if (!argCheck.ok) {
        return {
          ok: false as const,
          blocked: true,
          proposal,
          writesExternal: false,
          wouldExecute: false,
          resultState: "blocked_by_path_policy",
          reason: argCheck.reason,
          gates: ["Path containment blocked this command before execution."],
        };
      }

      const result = await runReadOnlyCommand({ file: policy.file, args: policy.args, cwd: cwdCheck.cwd });
      const db = await getCerebroDb();
      const status = result.timedOut ? "timed_out" : result.exitCode === 0 ? "completed" : "failed";
      const receiptBody = [
        `Execution result for action proposal #${proposal.id}.`,
        `Command: ${proposal.command}`,
        `cwd: ${cwdCheck.cwd}`,
        `Status: ${status}`,
        `Exit code: ${result.exitCode ?? "none"}`,
        `Duration: ${result.durationMs}ms`,
        "Runner: read-only allowlist, shell disabled.",
      ].join("\n");
      const inserted = await db.execute({
        sql: `
          INSERT INTO execution_action_results (
            proposal_id, approval_id, executor_agent, command, cwd, exit_code,
            stdout_summary, stderr_summary, duration_ms, timed_out, status,
            receipt_body, recovery_note
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id
        `,
        args: [
          proposal.id,
          proposal.approvalId,
          proposal.executorAgent,
          proposal.command,
          cwdCheck.cwd,
          result.exitCode,
          summarizeOutput(result.stdout),
          summarizeOutput(result.stderr),
          result.durationMs,
          result.timedOut ? 1 : 0,
          status,
          receiptBody,
          status === "completed" ? "No recovery needed for a read-only command." : "Review stderr/stdout before proposing another command.",
        ],
      });
      await db.execute({
        sql: `
          UPDATE execution_action_proposals
          SET result_state = ?,
              status = ?,
              updated_at = unixepoch()
          WHERE id = ?
        `,
        args: [status, status === "completed" ? "contract_ready" : "run_blocked", proposal.id],
      });
      const updatedProposal = await proposalById(proposal.id);
      return {
        ok: true as const,
        blocked: false,
        proposal: updatedProposal ?? proposal,
        writesExternal: false,
        wouldExecute: true,
        resultId: Number(inserted.rows[0]!.id),
        resultState: status,
        exitCode: result.exitCode,
        stdoutSummary: summarizeOutput(result.stdout),
        stderrSummary: summarizeOutput(result.stderr),
        durationMs: result.durationMs,
        timedOut: result.timedOut,
        receiptBody,
        gates: [
          "Ran one approved read-only local command.",
          "Shell was disabled.",
          "Result receipt was recorded locally.",
          "No browser opened, model called, git write ran, install ran, or external write occurred.",
        ],
      };
    }),

  results: publicProcedure
    .input(
      z
        .object({
          proposalId: z.number().int().optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (number | string)[] = [];
      if (input?.proposalId !== undefined) {
        where.push("proposal_id = ?");
        args.push(input.proposalId);
      }
      args.push(input?.limit ?? 20);
      const result = await db.execute({
        sql: `
          SELECT
            ear.*,
            eap.workbench_evidence_id,
            eap.source_id AS proposal_source_id,
            eap.source_type AS proposal_source_type
          FROM execution_action_results ear
          LEFT JOIN execution_action_proposals eap ON eap.id = ear.proposal_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY ear.created_at DESC, ear.id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        mode: "local_execution_results" as const,
        writesExternal: false,
        items: result.rows.map((row) => ({
          id: Number(row.id),
          proposalId: row.proposal_id == null ? null : Number(row.proposal_id),
          proposalSourceType: row.proposal_source_type == null ? null : String(row.proposal_source_type),
          proposalSourceId: row.proposal_source_id == null ? null : Number(row.proposal_source_id),
          approvalId: row.approval_id == null ? null : Number(row.approval_id),
          workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
          executorAgent: String(row.executor_agent),
          command: String(row.command),
          cwd: String(row.cwd),
          exitCode: row.exit_code == null ? null : Number(row.exit_code),
          stdoutSummary: row.stdout_summary == null ? "" : String(row.stdout_summary),
          stderrSummary: row.stderr_summary == null ? "" : String(row.stderr_summary),
          durationMs: Number(row.duration_ms),
          timedOut: Boolean(row.timed_out),
          status: String(row.status),
          receiptBody: String(row.receipt_body),
          recoveryNote: row.recovery_note == null ? null : String(row.recovery_note),
          createdAt: Number(row.created_at),
        })),
      };
    }),
});
