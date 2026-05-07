import { type Client } from "@libsql/client";

export const permissionModes = ["default_permissions", "auto_review", "full_access"] as const;
export const perceptionIds = ["explicit_context", "local_files", "terminal_logs", "workbench_media", "public_browser"] as const;
export const actionIds = ["local_note", "code_edit", "command_execution", "browser_or_media_capture", "external_write", "cleanup"] as const;
export const preflightDecisions = ["allowed_local", "proposal_only", "approval_required", "blocked_by_hard_gate"] as const;

export type PermissionMode = (typeof permissionModes)[number];
export type PerceptionClass = (typeof perceptionIds)[number];
export type ActionClass = (typeof actionIds)[number];
export type PreflightDecision = (typeof preflightDecisions)[number];

export const hardGates = [
  "payments",
  "account permission grants",
  "destructive commands",
  "deleting or overwriting files",
  "sending messages or emails",
  "publishing",
  "uploading private media externally",
  "saving sensitive screenshots to memory",
  "installs",
  "tokens and API keys",
  "sealed Raven or NSFW scope",
];

export const perceptionClasses = [
  {
    id: "explicit_context",
    label: "Explicit user context",
    defaultPermissions: "allowed",
    autoReview: "allowed",
    fullAccess: "allowed",
  },
  {
    id: "local_files",
    label: "Local repo/vault files",
    defaultPermissions: "guided only unless requested",
    autoReview: "approved visible/local evidence only",
    fullAccess: "allowed within session gates",
  },
  {
    id: "terminal_logs",
    label: "Terminal and log output",
    defaultPermissions: "user-provided or recorded observations",
    autoReview: "local observations may be reviewed",
    fullAccess: "allowed within command gates",
  },
  {
    id: "workbench_media",
    label: "Images, screenshots, video frames, previews",
    defaultPermissions: "user-provided only",
    autoReview: "approved visible/local evidence only",
    fullAccess: "allowed within media gates",
  },
  {
    id: "public_browser",
    label: "Public browser pages",
    defaultPermissions: "proposal only",
    autoReview: "proposal only until approved",
    fullAccess: "allowed only after public-browser approval",
  },
];

export const actionClasses = [
  {
    id: "local_note",
    label: "Local note or evidence record",
    gate: "Allowed when visible and local. Sensitive memory still asks.",
  },
  {
    id: "code_edit",
    label: "Code edit",
    gate: "Allowed for CereBro repo slices. External repos need explicit project request.",
  },
  {
    id: "command_execution",
    label: "Command execution",
    gate: "Local checks are allowed. Risky, destructive, deploy, account, network, or secret commands ask.",
  },
  {
    id: "browser_or_media_capture",
    label: "Browser or media capture",
    gate: "Requires separate approval before opening, capturing, downloading, or saving durable media.",
  },
  {
    id: "external_write",
    label: "External write",
    gate: "Notion, Slack, email, publishing, uploads, and provider calls require explicit approval.",
  },
  {
    id: "cleanup",
    label: "Cleanup",
    gate: "Scan/report only by default. Moves, archive, trash staging, and delete require approval.",
  },
];

export function modeLabel(mode: string) {
  if (mode === "default_permissions") return "Default permissions";
  if (mode === "auto_review") return "Auto-review";
  if (mode === "full_access") return "Full access";
  return mode;
}

export function modeSummary(mode: string) {
  if (mode === "default_permissions") {
    return "Reads explicit user-provided context and guides. Broader inspection and action stay proposal-gated.";
  }
  if (mode === "auto_review") {
    return "May proactively inspect approved visible/local evidence and queue suggestions. It does not execute hard-gated actions.";
  }
  if (mode === "full_access") {
    return "May use enabled local/session tools within policy. Hard gates still require visible approval.";
  }
  return "Unknown mode. Treat as Default permissions.";
}

export function decidePermissionPreflight(input: {
  mode: string;
  perceptionClass?: PerceptionClass;
  actionClass?: ActionClass;
  sensitiveData?: boolean;
  externalTarget?: boolean;
  destructive?: boolean;
  persistsMemory?: boolean;
}) {
  const reasons: string[] = [];
  const requiredApprovals: string[] = [];
  let decision: PreflightDecision = "proposal_only";

  if (input.destructive) {
    return {
      decision: "blocked_by_hard_gate" as const,
      approvalRequired: true,
      modeEffect: "Hard gate overrides every permission mode.",
      requiredApprovals: ["explicit destructive-action approval with exact target and recovery path"],
      reasons: ["Destructive actions cannot be approved by permission mode alone."],
    };
  }

  if (input.externalTarget) {
    requiredApprovals.push("external target approval");
    reasons.push("The target leaves the local/session boundary.");
  }

  if (input.sensitiveData) {
    requiredApprovals.push("sensitive-data review");
    reasons.push("Sensitive-looking context needs Oak/Spock review before broad use.");
  }

  if (input.persistsMemory && input.sensitiveData) {
    return {
      decision: "blocked_by_hard_gate" as const,
      approvalRequired: true,
      modeEffect: "Hard gate overrides every permission mode.",
      requiredApprovals: ["explicit sensitive-memory approval"],
      reasons: ["Saving sensitive screenshots or private context to memory is a hard gate."],
    };
  }

  if (input.perceptionClass === "public_browser") {
    requiredApprovals.push("public-browser approval");
    reasons.push("Public browser inspection remains approval-gated until the browser surface is explicitly opened.");
  }

  if (input.perceptionClass === "workbench_media" && input.actionClass === "browser_or_media_capture") {
    requiredApprovals.push("media capture approval");
    reasons.push("Showing or recording user-provided local media is separate from capturing or saving media.");
  }

  if (input.actionClass === "external_write") {
    requiredApprovals.push("external write approval");
    reasons.push("Notion, Slack, email, publishing, uploads, and provider calls require explicit approval.");
  } else if (input.actionClass === "browser_or_media_capture") {
    requiredApprovals.push("browser/media action approval");
    reasons.push("Opening, capturing, downloading, or durable-saving visible media/browser evidence is gated.");
  } else if (input.actionClass === "cleanup") {
    requiredApprovals.push("cleanup approval");
    reasons.push("Piccolo may scan/report by default. Move/archive/trash/delete actions need approval.");
  } else if (input.actionClass === "command_execution") {
    if (input.mode === "full_access" && requiredApprovals.length === 0) {
      decision = "allowed_local";
      reasons.push("Full access allows enabled local/session tools, but risky command classes still ask.");
    } else {
      requiredApprovals.push("command execution approval");
      reasons.push("Command execution needs a visible command, cwd, risk class, and expected result.");
    }
  } else if (input.actionClass === "code_edit") {
    if (input.externalTarget) {
      requiredApprovals.push("external repo edit approval");
      reasons.push("External repos require an explicit project-specific request.");
    } else if (input.mode === "default_permissions" || input.mode === "auto_review" || input.mode === "full_access") {
      decision = input.sensitiveData ? "approval_required" : "allowed_local";
      reasons.push("Local CereBro repo edits are allowed for bounded safe slices.");
    }
  } else if (input.actionClass === "local_note") {
    decision = input.sensitiveData ? "approval_required" : "allowed_local";
    reasons.push("Local notes and evidence records are allowed when visible and non-sensitive.");
  }

  if (input.mode === "default_permissions" && decision === "proposal_only") {
    reasons.push("Default permissions guides from explicit context and keeps broader action proposal-gated.");
  }
  if (input.mode === "auto_review" && decision === "proposal_only") {
    reasons.push("Auto-review may inspect approved local/visible evidence and queue suggestions, not execute action.");
  }
  if (input.mode === "full_access" && decision === "proposal_only") {
    reasons.push("Full access can use enabled tools, but this class still has a separate approval gate.");
  }

  const uniqueApprovals = [...new Set(requiredApprovals)];
  if (uniqueApprovals.length > 0) {
    decision = "approval_required";
  }

  return {
    decision,
    approvalRequired: decision === "approval_required",
    modeEffect: modeSummary(input.mode),
    requiredApprovals: uniqueApprovals,
    reasons,
  };
}

export async function readCurrentPermissionMode(db: Client) {
  const current = await db.execute(`
    SELECT mode
    FROM permission_mode_events
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);
  return current.rows[0]?.mode == null ? "default_permissions" : String(current.rows[0].mode);
}

export async function recordPermissionPreflight(
  db: Client,
  input: {
    mode?: string;
    perceptionClass?: PerceptionClass;
    actionClass?: ActionClass;
    sensitiveData?: boolean;
    externalTarget?: boolean;
    destructive?: boolean;
    persistsMemory?: boolean;
    requestedByAgent?: string;
    targetSummary?: string | null;
    additionalReasons?: string[];
  },
) {
  const mode = input.mode ?? await readCurrentPermissionMode(db);
  const result = decidePermissionPreflight({
    mode,
    perceptionClass: input.perceptionClass,
    actionClass: input.actionClass,
    sensitiveData: input.sensitiveData,
    externalTarget: input.externalTarget,
    destructive: input.destructive,
    persistsMemory: input.persistsMemory,
  });
  const reasons = [...new Set([...result.reasons, ...(input.additionalReasons ?? [])])];
  const inserted = await db.execute({
    sql: `
      INSERT INTO permission_preflight_records (
        mode, perception_class, action_class, decision, approval_required,
        required_approvals, reasons, mode_effect, sensitive_data_flag,
        external_target_flag, destructive_flag, persists_memory_flag,
        requested_by_agent, target_summary
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `,
    args: [
      mode,
      input.perceptionClass ?? null,
      input.actionClass ?? null,
      result.decision,
      result.approvalRequired ? 1 : 0,
      result.requiredApprovals.join("\n"),
      reasons.join("\n"),
      result.modeEffect,
      input.sensitiveData ? 1 : 0,
      input.externalTarget ? 1 : 0,
      input.destructive ? 1 : 0,
      input.persistsMemory ? 1 : 0,
      input.requestedByAgent ?? "cortana",
      input.targetSummary ?? null,
    ],
  });

  return {
    result: {
      ...result,
      reasons,
    },
    row: inserted.rows[0]!,
  };
}
