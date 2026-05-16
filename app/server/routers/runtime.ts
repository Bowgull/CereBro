import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCerebroDb,
  getOrCreateProjectByPath,
  type TaskRow,
  type TaskStatus,
} from "../cerebroDb";
import { decidePermissionPreflight, recordPermissionPreflight, type ActionClass, type PerceptionClass } from "../permissionPolicy";

const runtimeModes = ["quick", "explore", "build"] as const;
const routeCategories = [
  "quick_answer",
  "research",
  "creative",
  "project_build",
  "project_design",
  "project_qa",
  "project_ship",
  "freelance",
  "security_review",
  "file_hygiene",
  "message",
  "reminder",
  "artifact_write",
] as const;

type RuntimeMode = (typeof runtimeModes)[number];
type RouteCategory = (typeof routeCategories)[number];

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapRouteRecordRow(row: Record<string, unknown>) {
  const id = Number(row.id);
  const projectSlug = row.project_slug == null ? null : String(row.project_slug);
  const projectName = row.project_name == null ? null : String(row.project_name);
  const projectPath = row.project_path == null ? null : String(row.project_path);
  const approvalGates = parseJsonField<string[]>(row.approval_gates_json, []);
  const approvalPreview = row.approval_id == null ? null : {
    id: Number(row.approval_id),
    taskId: row.approval_task_id == null ? null : Number(row.approval_task_id),
    status: String(row.approval_status ?? "pending"),
    actionType: String(row.approval_action_type ?? ""),
    requestedByAgent: row.approval_requested_by_agent == null ? null : String(row.approval_requested_by_agent),
    permissionPreflightId: row.approval_permission_preflight_id == null ? null : Number(row.approval_permission_preflight_id),
    decidedAt: row.approval_decided_at == null ? null : Number(row.approval_decided_at),
  };
  const workbenchEvidence = row.workbench_evidence_id == null ? null : {
    id: Number(row.workbench_evidence_id),
    kind: String(row.workbench_evidence_kind ?? ""),
    title: String(row.workbench_evidence_title ?? ""),
    targetUri: row.workbench_evidence_target_uri == null ? null : String(row.workbench_evidence_target_uri),
    taskId: row.workbench_evidence_task_id == null ? null : Number(row.workbench_evidence_task_id),
    permissionPreflightId: row.workbench_evidence_permission_preflight_id == null ? null : Number(row.workbench_evidence_permission_preflight_id),
  };
  const taskId = row.task_id == null ? null : Number(row.task_id);
  return {
    id,
    originalText: String(row.original_text ?? ""),
    mode: String(row.mode ?? "quick") as RuntimeMode,
    category: String(row.category ?? "quick_answer") as RouteCategory,
    confidence: String(row.confidence ?? "medium"),
    aangRead: String(row.aang_read ?? ""),
    ownerAgent: String(row.owner_agent ?? "aang"),
    supportAgents: parseJsonField<string[]>(row.support_agents_json, []),
    projectSlug,
    projectName,
    projectPath,
    permissionClass: String(row.permission_class ?? "local_note"),
    routeChain: parseJsonField<string[]>(row.route_chain_json, []),
    approvalGates,
    modelProposal: parseJsonField<Record<string, unknown>>(row.model_proposal_json, {}),
    toolProposal: parseJsonField<Record<string, unknown>>(row.tool_proposal_json, {}),
    workbenchReceiptDraft: parseJsonField<Record<string, unknown>>(row.workbench_draft_json, {}),
    ledgerFocusDraft: parseJsonField<Record<string, unknown>>(row.ledger_focus_json, {}),
    projectFocusDraft: {
      kind: "route_record_project_focus",
      focusTarget: "project_lab",
      autosave: false,
      projectSlug,
      projectName,
      projectPath,
      projectId: null,
      routeRecordId: id,
      focusSummary: `Open Project Lab for route #${id}. No project write is saved.`,
    },
    taskDraft: parseJsonField<Record<string, unknown>>(row.task_draft_json, {}),
    taskId,
    approvalPreview,
    workbenchEvidence,
    executionReadiness: routeExecutionReadiness({
      routeRecordId: id,
      taskId,
      approvalGates,
      approvalId: approvalPreview?.id ?? null,
      approvalStatus: approvalPreview?.status ?? null,
      workbenchEvidenceId: workbenchEvidence?.id ?? null,
    }),
    nextAction: String(row.next_action ?? ""),
    createdAt: Number(row.created_at ?? 0),
  };
}

function mapRuntimeWorkbenchEvidence(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    kind: String(row.kind),
    title: String(row.title),
    summary: String(row.summary),
    targetUri: row.target_uri == null ? null : String(row.target_uri),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    taskId: row.task_id == null ? null : Number(row.task_id),
    ownerAgent: String(row.owner_agent),
    routeAgent: row.route_agent == null ? null : String(row.route_agent),
    validationStatus: String(row.validation_status),
    permissionClass: String(row.permission_class),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    createdAt: Number(row.created_at),
  };
}

async function runtimeRouteWorkbenchEvidenceByRouteId(routeRecordId: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT
        wer.*,
        p.name AS project_name
      FROM workbench_evidence_records wer
      LEFT JOIN projects p ON p.id = wer.project_id
      WHERE wer.target_uri = ?
      ORDER BY wer.created_at DESC, wer.id DESC
      LIMIT 1
    `,
    args: [`runtime_route:${routeRecordId}`],
  });
  const row = result.rows[0];
  return row ? mapRuntimeWorkbenchEvidence(row as Record<string, unknown>) : null;
}

function mapRuntimeTaskRow(row: Record<string, unknown>): TaskRow {
  return {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    projectPath: row.project_path == null ? null : String(row.project_path),
    title: String(row.title),
    status: String(row.status) as TaskStatus,
    agent: row.agent == null ? null : String(row.agent),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function mapRuntimeApprovalPreview(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    actionType: String(row.action_type),
    targetType: row.target_type == null ? null : String(row.target_type),
    targetId: row.target_id == null ? null : Number(row.target_id),
    requestedByAgent: row.requested_by_agent == null ? null : String(row.requested_by_agent),
    status: String(row.status),
    reason: row.reason == null ? null : String(row.reason),
    contextSummary: row.context_summary == null ? null : String(row.context_summary),
    sensitive: Boolean(row.sensitive_data_flag),
    costRisk: row.cost_risk == null ? null : String(row.cost_risk),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    permissionPreflight: row.permission_preflight_id == null ? null : {
      id: Number(row.permission_preflight_id),
      mode: row.preflight_mode == null ? null : String(row.preflight_mode),
      decision: row.preflight_decision == null ? null : String(row.preflight_decision),
      approvalRequired: row.preflight_approval_required == null ? false : Boolean(row.preflight_approval_required),
      requiredApprovals: row.preflight_required_approvals == null ? [] : String(row.preflight_required_approvals).split("\n").filter(Boolean),
      reasons: row.preflight_reasons == null ? [] : String(row.preflight_reasons).split("\n").filter(Boolean),
      modeEffect: row.preflight_mode_effect == null ? null : String(row.preflight_mode_effect),
      perceptionClass: row.preflight_perception_class == null ? null : String(row.preflight_perception_class),
      actionClass: row.preflight_action_class == null ? null : String(row.preflight_action_class),
      targetSummary: row.preflight_target_summary == null ? null : String(row.preflight_target_summary),
    },
    createdAt: Number(row.created_at),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
  };
}

function routeRequiresApproval(approvalGates: string[]) {
  return approvalGates.some((gate) => gate !== "No external action from route preview.");
}

function routeExecutionReadiness(input: {
  routeRecordId: number | null;
  taskId: number | null;
  approvalGates: string[];
  approvalId: number | null;
  approvalStatus: string | null;
  workbenchEvidenceId: number | null;
}) {
  const approvalRequired = routeRequiresApproval(input.approvalGates);
  const taskReady = input.taskId != null;
  const workbenchReady = input.workbenchEvidenceId != null;
  const approvalReady = !approvalRequired || input.approvalStatus === "approved";
  const requiredBeforeExecution = [
    "route record",
    "local task record",
    "Workbench receipt body",
    ...(approvalRequired ? ["approved approval gate"] : []),
    "future explicit execution call",
  ];
  const noActionTaken = [
    "No command ran.",
    "No browser opened.",
    "No model call ran.",
    "No git action ran.",
    "No external write ran.",
  ];
  let status:
    | "preview_only"
    | "missing_route_record"
    | "missing_workbench_receipt"
    | "missing_approval"
    | "approval_pending"
    | "approval_rejected"
    | "ready_for_explicit_execution_call" = "ready_for_explicit_execution_call";

  if (input.routeRecordId == null) status = "preview_only";
  else if (!taskReady) status = "missing_route_record";
  else if (!workbenchReady) status = "missing_workbench_receipt";
  else if (approvalRequired && input.approvalStatus == null) status = "missing_approval";
  else if (approvalRequired && input.approvalStatus === "pending") status = "approval_pending";
  else if (approvalRequired && input.approvalStatus !== "approved") status = "approval_rejected";

  return {
    routeRecordId: input.routeRecordId,
    taskId: input.taskId,
    approvalId: input.approvalId,
    approvalStatus: approvalRequired ? input.approvalStatus : "not_required",
    workbenchEvidenceId: input.workbenchEvidenceId,
    canExecute: false,
    status,
    requiredBeforeExecution,
    noActionTaken,
    readyForFutureExecutorReview: input.routeRecordId != null && taskReady && approvalReady && workbenchReady,
  };
}

async function runtimeRouteApprovalByRouteId(routeRecordId: number) {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT
        a.id, a.task_id, a.action_type, a.target_type, a.target_id,
        a.requested_by_agent, a.status, a.reason, a.context_summary,
        a.sensitive_data_flag, a.cost_risk, a.permission_preflight_id,
        a.decided_at, a.created_at,
        ppr.mode AS preflight_mode,
        ppr.decision AS preflight_decision,
        ppr.approval_required AS preflight_approval_required,
        ppr.required_approvals AS preflight_required_approvals,
        ppr.reasons AS preflight_reasons,
        ppr.mode_effect AS preflight_mode_effect,
        ppr.perception_class AS preflight_perception_class,
        ppr.action_class AS preflight_action_class,
        ppr.target_summary AS preflight_target_summary
      FROM approvals a
      LEFT JOIN permission_preflight_records ppr ON ppr.id = a.permission_preflight_id
      WHERE a.target_type = 'runtime_route_record'
        AND a.target_id = ?
        AND a.status = 'pending'
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT 1
    `,
    args: [routeRecordId],
  });
  const row = result.rows[0];
  return row ? mapRuntimeApprovalPreview(row as Record<string, unknown>) : null;
}

async function getRuntimeTaskById(id: number): Promise<TaskRow | null> {
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT
        t.id,
        t.project_id,
        t.session_id,
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
  return row ? mapRuntimeTaskRow(row as Record<string, unknown>) : null;
}

const projectHints = [
  { slug: "cerebro", label: "CereBro", localPath: "/Users/lindsaybell/Desktop/CereBro", aliases: ["cerebro", "keep", "aang", "cortana", "terminal lab", "workbench", "ledger"] },
  { slug: "declyne", label: "Declyne", localPath: "/Users/lindsaybell/Developer/Declyne", aliases: ["declyne", "plaid", "finance", "budget", "bank"] },
  { slug: "waymark", label: "Waymark", localPath: "/Users/lindsaybell/Developer/Waymark", aliases: ["waymark", "strava", "training", "run", "running"] },
  { slug: "sygnalist", label: "Sygnalist", localPath: "/Users/lindsaybell/Developer/sygnalist-brain", aliases: ["sygnalist", "job search", "jobs", "supabase"] },
  { slug: "bridgefour", label: "Bridgefour", localPath: "/Users/lindsaybell/Developer/bridgefour", aliases: ["bridgefour", "portfolio", "case study", "resume"] },
] as const;

const categoryRules: Array<{ category: RouteCategory; keywords: string[] }> = [
  { category: "security_review", keywords: ["safe", "security", "malware", "phishing", "scan this repo", "github repo safe", "suspicious link"] },
  { category: "project_ship", keywords: ["ship", "deploy", "release", "publish", "app store"] },
  { category: "project_qa", keywords: ["qa", "test", "validate", "review", "bug", "broken"] },
  { category: "project_design", keywords: ["ui", "ux", "design", "polish", "screen", "layout", "visual"] },
  { category: "research", keywords: ["research", "source", "docs", "compare", "look up", "find", "latest", "current", "reddit"] },
  { category: "project_build", keywords: ["build", "implement", "fix", "code", "refactor", "feature"] },
  { category: "creative", keywords: ["image", "video", "creative", "brand", "prompt"] },
  { category: "freelance", keywords: ["freelance", "client", "proposal", "lead", "invoice", "contract"] },
  { category: "file_hygiene", keywords: ["clean", "cleanup", "archive", "delete", "move files", "organize"] },
  { category: "message", keywords: ["message", "email", "text", "reply", "send", "draft"] },
  { category: "reminder", keywords: ["remind", "reminder", "follow up", "check back"] },
  { category: "artifact_write", keywords: ["save", "write note", "obsidian", "notion", "artifact"] },
];

function includesAny(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => {
    if (keyword.length <= 3) {
      return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);
    }
    return text.includes(keyword);
  });
}

function classifyRoute(text: string, mode: RuntimeMode): RouteCategory {
  const matched = categoryRules.find((rule) => includesAny(text, rule.keywords));
  if (matched) return matched.category;
  if (mode === "build") return "project_build";
  if (mode === "explore") return "research";
  return "quick_answer";
}

function detectProject(text: string) {
  return projectHints.find((project) => includesAny(text, project.aliases)) ?? null;
}

function ownerFor(category: RouteCategory) {
  if (category === "project_design" || category === "creative") return "gojo";
  if (category === "research") return "surfer";
  if (category === "security_review") return "spock";
  if (category === "project_qa") return "oak";
  if (category === "file_hygiene") return "piccolo";
  if (category === "message" || category === "reminder") return "hedwig";
  if (category === "artifact_write") return "c3po";
  if (category === "freelance") return "batman";
  if (category === "project_build" || category === "project_ship") return "tony";
  return "aang";
}

function supportAgentsFor(category: RouteCategory, projectSlug: string | null) {
  const agents = new Set<string>();
  if (category.startsWith("project_")) agents.add("spock");
  if (category === "project_design" || category === "creative") agents.add("tony");
  if (category === "research") agents.add("oak");
  if (category === "security_review") {
    agents.add("surfer");
    agents.add("tony");
  }
  if (category === "freelance") {
    agents.add("gojo");
    agents.add("c3po");
  }
  if (projectSlug === "cerebro") {
    agents.add("batman");
    agents.add("spock");
  }
  return [...agents].filter((agent) => agent !== ownerFor(category));
}

function permissionShape(category: RouteCategory): {
  perceptionClass: PerceptionClass;
  actionClass: ActionClass;
  permissionClass: string;
  externalTarget: boolean;
  destructive: boolean;
  persistsMemory: boolean;
} {
  if (category === "research") {
    return { perceptionClass: "public_browser", actionClass: "browser_or_media_capture", permissionClass: "public_browser", externalTarget: true, destructive: false, persistsMemory: false };
  }
  if (category === "security_review") {
    return { perceptionClass: "explicit_context", actionClass: "local_note", permissionClass: "security_receipt", externalTarget: false, destructive: false, persistsMemory: false };
  }
  if (category === "artifact_write") {
    return { perceptionClass: "explicit_context", actionClass: "external_write", permissionClass: "external_write", externalTarget: true, destructive: false, persistsMemory: true };
  }
  if (category === "file_hygiene") {
    return { perceptionClass: "local_files", actionClass: "cleanup", permissionClass: "cleanup", externalTarget: false, destructive: true, persistsMemory: false };
  }
  if (category.startsWith("project_")) {
    return { perceptionClass: "local_files", actionClass: "code_edit", permissionClass: "local_code", externalTarget: false, destructive: false, persistsMemory: false };
  }
  return { perceptionClass: "explicit_context", actionClass: "local_note", permissionClass: "local_note", externalTarget: false, destructive: false, persistsMemory: false };
}

function modelProposalFor(ownerAgent: string, category: RouteCategory) {
  if (ownerAgent === "tony") return category === "project_build" ? "local_code_helper" : "local_reasoner";
  if (ownerAgent === "oak" || ownerAgent === "spock" || ownerAgent === "batman") return "local_reasoner";
  if (ownerAgent === "surfer") return "local_summary";
  if (ownerAgent === "c3po" || ownerAgent === "aang" || ownerAgent === "hedwig") return "lightweight_formatter";
  return "local_reasoner";
}

function modelLaneProposalFor(ownerAgent: string, category: RouteCategory) {
  const modelClass = modelProposalFor(ownerAgent, category);
  const needsExternalEscalation =
    category === "project_build" ||
    category === "project_ship" ||
    category === "project_design" ||
    category === "security_review";

  if (needsExternalEscalation) {
    return {
      ownerAgent,
      modelClass,
      laneId: "frontier_or_codex_escalation",
      provider: "Codex/frontier lane",
      status: "approval_required",
      approvalRequired: true,
      dataLeavingMachine: true,
      installRequired: false,
      reason: "This task may need multi-file or high-stakes reasoning where the small local lane may not be strong enough.",
      userFacingSummary: "Use local planning first. Escalate only with approval if quality or task size needs it.",
    };
  }

  return {
    ownerAgent,
    modelClass,
    laneId: "ollama_local_fast_lane",
    provider: "Ollama",
    status: "not_verified_no_install",
    approvalRequired: false,
    dataLeavingMachine: false,
    installRequired: true,
    reason: "fast local-first lane for small private text work once Ollama is installed and tested.",
    userFacingSummary: "Aang can route this to the local lane first. No install, pull, or model call runs from preview.",
  };
}

function nextActionFor(category: RouteCategory, ownerAgent: string) {
  if (category === "security_review") return "Open Security Gate and record a Spock receipt before browsing or execution.";
  if (category === "research") return "Ask approval before browser/source capture. Save source cards before memory.";
  if (category.startsWith("project_")) return "Create a task or Workbench receipt before any code, command, git, or external action.";
  if (category === "file_hygiene") return "Create a read-only cleanup proposal. Moves and deletes stay blocked.";
  if (category === "artifact_write") return "Stage a local receipt first. External writes need explicit approval.";
  return `${ownerAgent} can draft locally. Any action still needs its matching gate.`;
}

function taskTitleFor(text: string, category: RouteCategory, projectLabel: string | null) {
  const prefix = projectLabel ? `${projectLabel}: ` : "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const shortText = cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
  return `${prefix}${category.replace(/_/g, " ")} - ${shortText}`;
}

function buildRoutePreview(input: { text: string; mode: RuntimeMode }) {
  const normalized = input.text.toLowerCase().replace(/\s+/g, " ").trim();
  const category = classifyRoute(normalized, input.mode);
  const project = detectProject(normalized);
  const ownerAgent = ownerFor(category);
  const supportAgents = supportAgentsFor(category, project?.slug ?? null);
  const permission = permissionShape(category);
  const preflight = decidePermissionPreflight({
    mode: "default_permissions",
    perceptionClass: permission.perceptionClass,
    actionClass: permission.actionClass,
    externalTarget: permission.externalTarget,
    destructive: permission.destructive,
    persistsMemory: permission.persistsMemory,
  });
  const routeChain = ["Aang reads mode", "Cortana routes", `${ownerAgent} owns`, ...supportAgents.map((agent) => `${agent} supports`)];
  const modelProposal = modelLaneProposalFor(ownerAgent, category);
  const approvalGates = preflight.requiredApprovals.length > 0
    ? preflight.requiredApprovals
    : ["No external action from route preview."];
  if (modelProposal.approvalRequired) approvalGates.push("external model escalation approval");
  const receiptSummary = `${routeChain.join(" -> ")}. ${nextActionFor(category, ownerAgent)}`;
  const projectSlug = project?.slug ?? null;
  const executionReadiness = routeExecutionReadiness({
    routeRecordId: null,
    taskId: null,
    approvalGates,
    approvalId: null,
    approvalStatus: null,
    workbenchEvidenceId: null,
  });

  return {
    mode: "proposal_only" as const,
    writesExternal: false,
    runsCommand: false,
    opensBrowser: false,
    callsModel: false,
    originalText: input.text,
    category,
    confidence: normalized.length < 8 ? "medium" : "high",
    aangRead: `${input.mode} request read as ${category.replace(/_/g, " ")}.`,
    cortanaRoute: routeChain,
    project: project ? { slug: project.slug, label: project.label, localPath: project.localPath } : null,
    ownerAgent,
    supportAgents,
    permissionClass: permission.permissionClass,
    modelProposal: {
      ...modelProposal,
    },
    toolProposal: {
      actionClass: permission.actionClass,
      perceptionClass: permission.perceptionClass,
      externalTarget: permission.externalTarget,
      approvalRequired: preflight.approvalRequired,
    },
    approvalGates,
    executionReadiness,
    receipt: {
      kind: "route_preview",
      ownerAgent,
      routeAgent: "cortana",
      bodyTarget: "workbench",
      auditTarget: "ledger",
      validationTarget: supportAgents.includes("oak") ? "oak" : supportAgents.includes("spock") ? "spock" : "none",
      summary: receiptSummary,
    },
    workbenchReceiptDraft: {
      kind: "route_preview",
      stage: "staged",
      saveTarget: "workbench",
      autosave: false,
      ownerAgent,
      routeAgent: "cortana",
      category,
      permissionClass: permission.permissionClass,
      projectSlug,
      projectName: project?.label ?? null,
      projectPath: project?.localPath ?? null,
      projectFocus: {
        projectSlug,
        projectName: project?.label ?? null,
        projectPath: project?.localPath ?? null,
        projectId: null,
        resolution: "name_or_path_preview",
        autosave: false,
      },
      summary: receiptSummary,
      routeChain,
      gates: approvalGates,
      nextAction: nextActionFor(category, ownerAgent),
      modelLane: {
        laneId: modelProposal.laneId,
        provider: modelProposal.provider,
        modelClass: modelProposal.modelClass,
        status: modelProposal.status,
        reason: modelProposal.reason,
      },
    },
    ledgerFocusDraft: {
      kind: "route_preview_audit_focus",
      focusTarget: "ledger",
      autosave: false,
      ownerAgent,
      category,
      projectSlug,
      projectName: project?.label ?? null,
      auditFilters: {
        ownerAgent,
        category,
        projectSlug,
        projectName: project?.label ?? null,
        modelLaneId: modelProposal.laneId,
        bodyTarget: "workbench",
      },
      focusSummary: `Focus Ledger on ${ownerAgent} ${category.replace(/_/g, " ")} route preview. No audit row is saved.`,
    },
    projectFocusDraft: {
      kind: "route_preview_project_focus",
      focusTarget: "project_lab",
      autosave: false,
      projectSlug,
      projectName: project?.label ?? null,
      projectPath: project?.localPath ?? null,
      projectId: null,
      focusSummary: project?.label
        ? `Open Project Lab for ${project.label} route preview context. No project write is saved.`
        : "Open Project Lab for route preview context. No project write is saved.",
    },
    taskDraft: {
      title: taskTitleFor(input.text, category, project?.label ?? null),
      agent: ownerAgent,
      projectName: project?.label ?? null,
      projectPath: project?.localPath ?? null,
    },
    nextAction: nextActionFor(category, ownerAgent),
    gates: [
      "Preview only. No model call, browser action, command, git action, Slack write, Notion write, memory write, or external provider call runs.",
      "No Ollama install, local model pull, external model call, or provider escalation runs from route preview.",
      preflight.modeEffect,
      ...preflight.reasons,
    ],
  };
}

export const runtimeRouter = router({
  routeRecords: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        projectSlug: z.string().min(1).max(80).optional(),
        ownerAgent: z.string().min(1).max(80).optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: Array<string | number> = [];
      if (input?.projectSlug) {
        where.push("r.project_slug = ?");
        args.push(input.projectSlug);
      }
      if (input?.ownerAgent) {
        where.push("r.owner_agent = ?");
        args.push(input.ownerAgent);
      }
      args.push(input?.limit ?? 10);

      const result = await db.execute({
        sql: `
          SELECT
            r.*,
            a.id AS approval_id,
            a.task_id AS approval_task_id,
            a.status AS approval_status,
            a.action_type AS approval_action_type,
            a.requested_by_agent AS approval_requested_by_agent,
            a.permission_preflight_id AS approval_permission_preflight_id,
            a.decided_at AS approval_decided_at,
            wer.id AS workbench_evidence_id,
            wer.kind AS workbench_evidence_kind,
            wer.title AS workbench_evidence_title,
            wer.target_uri AS workbench_evidence_target_uri,
            wer.task_id AS workbench_evidence_task_id,
            wer.permission_preflight_id AS workbench_evidence_permission_preflight_id
          FROM runtime_route_records r
          LEFT JOIN approvals a ON a.id = (
            SELECT latest.id
            FROM approvals latest
            WHERE latest.target_type = 'runtime_route_record'
              AND latest.target_id = r.id
            ORDER BY latest.created_at DESC, latest.id DESC
            LIMIT 1
          )
          LEFT JOIN workbench_evidence_records wer ON wer.id = (
            SELECT latest_evidence.id
            FROM workbench_evidence_records latest_evidence
            WHERE latest_evidence.target_uri = 'runtime_route:' || r.id
            ORDER BY latest_evidence.created_at DESC, latest_evidence.id DESC
            LIMIT 1
          )
          ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY r.created_at DESC, r.id DESC
          LIMIT ?
        `,
        args,
      });
      return {
        items: result.rows.map((row) => mapRouteRecordRow(row as Record<string, unknown>)),
      };
    }),
  previewRoute: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(2000),
        mode: z.enum(runtimeModes).default("quick"),
      }),
    )
    .mutation(({ input }) => {
      return buildRoutePreview(input);
    }),
  createTaskFromRouteRecord: publicProcedure
    .input(
      z.object({
        routeRecordId: z.number().int().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const routeResult = await db.execute({
        sql: `SELECT * FROM runtime_route_records WHERE id = ? LIMIT 1`,
        args: [input.routeRecordId],
      });
      const routeRow = routeResult.rows[0] as Record<string, unknown> | undefined;
      if (!routeRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route record not found",
        });
      }

      const linkedTaskId = routeRow.task_id == null ? null : Number(routeRow.task_id);
      if (linkedTaskId != null) {
        const linkedTask = await getRuntimeTaskById(linkedTaskId);
        if (linkedTask) {
          return {
            mode: "local_task_record" as const,
            created: false,
            writesExternal: false,
            runsCommand: false,
            opensBrowser: false,
            callsModel: false,
            routeRecordId: input.routeRecordId,
            task: linkedTask,
            gates: [
              "Existing local task link returned. No routed work runs.",
            ],
          };
        }
      }

      const taskDraft = parseJsonField<Record<string, unknown>>(routeRow.task_draft_json, {});
      const title =
        typeof taskDraft.title === "string" && taskDraft.title.trim().length > 0
          ? taskDraft.title.trim()
          : `Route #${input.routeRecordId}: ${String(routeRow.original_text ?? "")}`.slice(0, 280);
      const agent = typeof taskDraft.agent === "string" && taskDraft.agent.trim().length > 0 ? taskDraft.agent.trim() : null;
      const projectName =
        typeof taskDraft.projectName === "string" && taskDraft.projectName.trim().length > 0
          ? taskDraft.projectName.trim()
          : routeRow.project_name == null
            ? null
            : String(routeRow.project_name);
      const projectPath =
        typeof taskDraft.projectPath === "string" && taskDraft.projectPath.trim().length > 0
          ? taskDraft.projectPath.trim()
          : routeRow.project_path == null
            ? null
            : String(routeRow.project_path);
      const projectId = projectName && projectPath ? await getOrCreateProjectByPath(projectName, projectPath) : null;

      const insertResult = await db.execute({
        sql: `
          INSERT INTO tasks (title, agent, project_id, session_id)
          VALUES (?, ?, ?, NULL)
          RETURNING id
        `,
        args: [title, agent, projectId],
      });
      const taskId = Number(insertResult.rows[0]?.id);
      if (!Number.isFinite(taskId) || taskId <= 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Task insert failed",
        });
      }

      await db.execute({
        sql: `UPDATE runtime_route_records SET task_id = ? WHERE id = ?`,
        args: [taskId, input.routeRecordId],
      });
      await db.execute({
        sql: `
          UPDATE approvals
          SET task_id = ?
          WHERE target_type = 'runtime_route_record'
            AND target_id = ?
            AND task_id IS NULL
        `,
        args: [taskId, input.routeRecordId],
      });
      await db.execute({
        sql: `
          UPDATE workbench_evidence_records
          SET task_id = ?
          WHERE target_uri = ?
            AND task_id IS NULL
        `,
        args: [taskId, `runtime_route:${input.routeRecordId}`],
      });

      const task = await getRuntimeTaskById(taskId);
      if (!task) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Task readback failed",
        });
      }

      return {
        mode: "local_task_record" as const,
        created: true,
        writesExternal: false,
        runsCommand: false,
        opensBrowser: false,
        callsModel: false,
        routeRecordId: input.routeRecordId,
        task,
        gates: [
          "Local task record only. No routed work runs.",
          "No Workbench evidence, command, browser, model call, git action, Slack write, Notion write, memory write, or external provider call runs.",
        ],
      };
    }),
  createApprovalPreviewFromRouteRecord: publicProcedure
    .input(
      z.object({
        routeRecordId: z.number().int().min(1),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const routeResult = await db.execute({
        sql: `SELECT * FROM runtime_route_records WHERE id = ? LIMIT 1`,
        args: [input.routeRecordId],
      });
      const routeRow = routeResult.rows[0] as Record<string, unknown> | undefined;
      if (!routeRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route record not found",
        });
      }

      const existingApproval = await runtimeRouteApprovalByRouteId(input.routeRecordId);
      if (existingApproval) {
        return {
          mode: "local_approval_preview" as const,
          created: false,
          writesExternal: false,
          runsCommand: false,
          opensBrowser: false,
          callsModel: false,
          routeRecordId: input.routeRecordId,
          approval: existingApproval,
          gates: [
            "Existing pending local approval preview returned. No routed work runs.",
          ],
        };
      }

      const route = mapRouteRecordRow(routeRow);
      const toolProposal = route.toolProposal as {
        actionClass?: ActionClass;
        perceptionClass?: PerceptionClass;
        externalTarget?: boolean;
        approvalRequired?: boolean;
      };
      const actionClass = toolProposal.actionClass ?? "local_note";
      const perceptionClass = toolProposal.perceptionClass ?? "explicit_context";
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass,
        actionClass,
        externalTarget: Boolean(toolProposal.externalTarget),
        destructive: route.category === "file_hygiene",
        persistsMemory: route.category === "artifact_write",
        requestedByAgent: route.ownerAgent,
        targetSummary: `Runtime route #${route.id}: ${route.originalText}`,
        additionalReasons: [
          "Runtime route approval previews are local metadata only.",
          "The routed work still needs a separate explicit action after approval review.",
        ],
      });
      const contextSummary = [
        `Route #${route.id}: ${route.originalText}`,
        `Category: ${route.category}`,
        `Owner agent: ${route.ownerAgent}`,
        route.projectName ? `Project: ${route.projectName}` : null,
        `Next action: ${route.nextAction}`,
        route.approvalGates.length ? `Route gates: ${route.approvalGates.join("; ")}` : null,
      ].filter(Boolean).join("\n");
      const result = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            status, reason, context_summary, sensitive_data_flag, cost_risk,
            permission_preflight_id
          )
          SELECT ?, ?, 'runtime_route_record', ?, ?, 'pending', ?, ?, 0, ?, ?
          WHERE NOT EXISTS (
            SELECT 1
            FROM approvals
            WHERE target_type = 'runtime_route_record'
              AND target_id = ?
              AND status = 'pending'
          )
          RETURNING id, task_id, action_type, target_type, target_id,
                    requested_by_agent, status, reason, context_summary,
                    sensitive_data_flag, cost_risk, permission_preflight_id,
                    decided_at, created_at
        `,
        args: [
          route.taskId,
          `runtime_${actionClass}`,
          route.id,
          route.ownerAgent,
          input.reason ?? "Local runtime route approval preview only. This does not run or approve routed work.",
          contextSummary,
          actionClass === "local_note" || actionClass === "code_edit" ? "local_route_review" : "route_action_requires_explicit_review",
          Number(preflight.row.id),
          route.id,
        ],
      });

      const row = result.rows[0] as Record<string, unknown> | undefined;
      const approval = await runtimeRouteApprovalByRouteId(route.id);
      return {
        mode: "local_approval_preview" as const,
        created: Boolean(row),
        writesExternal: false,
        runsCommand: false,
        opensBrowser: false,
        callsModel: false,
        routeRecordId: input.routeRecordId,
        approval,
        gates: [
          "This is a pending local approval record only.",
          "Recorded one local permission preflight audit row for this route approval preview.",
          "It does not execute routed work or approve a future action.",
          "The routed work still needs the normal surface-specific action after approval review.",
        ],
      };
    }),
  createWorkbenchReceiptFromRouteRecord: publicProcedure
    .input(
      z.object({
        routeRecordId: z.number().int().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const routeResult = await db.execute({
        sql: `SELECT * FROM runtime_route_records WHERE id = ? LIMIT 1`,
        args: [input.routeRecordId],
      });
      const routeRow = routeResult.rows[0] as Record<string, unknown> | undefined;
      if (!routeRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Route record not found",
        });
      }

      const existingEvidence = await runtimeRouteWorkbenchEvidenceByRouteId(input.routeRecordId);
      if (existingEvidence) {
        return {
          mode: "local_workbench_receipt" as const,
          created: false,
          writesExternal: false,
          runsCommand: false,
          opensBrowser: false,
          callsModel: false,
          routeRecordId: input.routeRecordId,
          evidence: existingEvidence,
          gates: [
            "Existing local Workbench receipt returned. No routed work runs.",
          ],
        };
      }

      const route = mapRouteRecordRow(routeRow);
      const draft = route.workbenchReceiptDraft as {
        summary?: string;
        nextAction?: string;
        permissionClass?: string;
      };
      const projectId = route.projectName && route.projectPath ? await getOrCreateProjectByPath(route.projectName, route.projectPath) : null;
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: "explicit_context",
        actionClass: "local_note",
        requestedByAgent: route.ownerAgent,
        targetSummary: `workbench route receipt: route #${route.id}`,
        additionalReasons: [
          "Runtime route Workbench receipts are local append-only history.",
          "Saving the route receipt does not approve or run routed work.",
        ],
      });
      const title = `Route #${route.id}: ${route.category.replace(/_/g, " ")}`;
      const summary = [
        typeof draft.summary === "string" && draft.summary.trim() ? draft.summary.trim() : route.originalText,
        "",
        `Aang read: ${route.aangRead}`,
        `Route chain: ${route.routeChain.join(" -> ")}`,
        `Next action: ${typeof draft.nextAction === "string" && draft.nextAction.trim() ? draft.nextAction.trim() : route.nextAction}`,
        route.approvalGates.length ? `Gates: ${route.approvalGates.join("; ")}` : null,
      ].filter((part) => part != null).join("\n");
      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, project_id, task_id, session_id,
            source_id, command_observation_id, artifact_id, owner_agent,
            route_agent, annotation_text, validation_status,
            permission_class, permission_preflight_id, sensitive_data_flag
          )
          SELECT
            'manual_note', ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?,
            'cortana', ?, 'unvalidated', 'manual_note', ?, 0
          WHERE NOT EXISTS (
            SELECT 1
            FROM workbench_evidence_records
            WHERE target_uri = ?
          )
          RETURNING *
        `,
        args: [
          title,
          summary,
          `runtime_route:${route.id}`,
          projectId,
          route.taskId,
          route.ownerAgent,
          `Saved from runtime route #${route.id}. Review before using as proof.`,
          Number(preflight.row.id),
          `runtime_route:${route.id}`,
        ],
      });

      const evidence = await runtimeRouteWorkbenchEvidenceByRouteId(route.id);
      return {
        mode: "local_workbench_receipt" as const,
        created: Boolean(result.rows[0]),
        writesExternal: false,
        runsCommand: false,
        opensBrowser: false,
        callsModel: false,
        routeRecordId: input.routeRecordId,
        evidence,
        gates: [
          "Created one local Workbench receipt from the route record.",
          "Recorded one local permission preflight audit row for this Workbench receipt.",
          "This did not create a task, approve a gate, run a command, open a browser, call a model, write memory, write files, or write externally.",
        ],
      };
    }),
  commitRoute: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(2000),
        mode: z.enum(runtimeModes).default("quick"),
      }),
    )
    .mutation(async ({ input }) => {
      const preview = buildRoutePreview(input);
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO runtime_route_records (
            original_text, mode, category, confidence, aang_read,
            owner_agent, support_agents_json,
            project_slug, project_name, project_path,
            permission_class, route_chain_json, approval_gates_json,
            model_proposal_json, tool_proposal_json,
            workbench_draft_json, ledger_focus_json, task_draft_json,
            next_action
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          preview.originalText,
          input.mode,
          preview.category,
          preview.confidence,
          preview.aangRead,
          preview.ownerAgent,
          JSON.stringify(preview.supportAgents),
          preview.project?.slug ?? null,
          preview.project?.label ?? null,
          preview.project?.localPath ?? null,
          preview.permissionClass,
          JSON.stringify(preview.cortanaRoute),
          JSON.stringify(preview.approvalGates),
          JSON.stringify(preview.modelProposal),
          JSON.stringify(preview.toolProposal),
          JSON.stringify(preview.workbenchReceiptDraft),
          JSON.stringify(preview.ledgerFocusDraft),
          JSON.stringify(preview.taskDraft),
          preview.nextAction,
        ],
      });
      const routeRecordId = Number(result.lastInsertRowid);
      const executionReadiness = routeExecutionReadiness({
        routeRecordId,
        taskId: null,
        approvalGates: preview.approvalGates,
        approvalId: null,
        approvalStatus: null,
        workbenchEvidenceId: null,
      });

      return {
        mode: "local_route_record" as const,
        writesExternal: false,
        runsCommand: false,
        opensBrowser: false,
        callsModel: false,
        record: {
          id: routeRecordId,
          originalText: preview.originalText,
          category: preview.category,
          confidence: preview.confidence,
          aangRead: preview.aangRead,
          ownerAgent: preview.ownerAgent,
          supportAgents: preview.supportAgents,
          projectSlug: preview.project?.slug ?? null,
          projectName: preview.project?.label ?? null,
          projectPath: preview.project?.localPath ?? null,
          permissionClass: preview.permissionClass,
          routeChain: preview.cortanaRoute,
          approvalGates: preview.approvalGates,
          executionReadiness,
          modelProposal: preview.modelProposal,
          toolProposal: preview.toolProposal,
          workbenchReceiptDraft: preview.workbenchReceiptDraft,
          ledgerFocusDraft: preview.ledgerFocusDraft,
          taskDraft: preview.taskDraft,
          nextAction: preview.nextAction,
        },
        nextAction: preview.nextAction,
        gates: [
          "Local route record only. No routed work runs.",
          ...preview.gates,
        ],
      };
    }),
});
