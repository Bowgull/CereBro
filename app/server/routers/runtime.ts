import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";
import { decidePermissionPreflight, type ActionClass, type PerceptionClass } from "../permissionPolicy";

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
      auditFilters: {
        ownerAgent,
        category,
        projectSlug,
        modelLaneId: modelProposal.laneId,
        bodyTarget: "workbench",
      },
      focusSummary: `Focus Ledger on ${ownerAgent} ${category.replace(/_/g, " ")} route preview. No audit row is saved.`,
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

      return {
        mode: "local_route_record" as const,
        writesExternal: false,
        runsCommand: false,
        opensBrowser: false,
        callsModel: false,
        record: {
          id: Number(result.lastInsertRowid),
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
