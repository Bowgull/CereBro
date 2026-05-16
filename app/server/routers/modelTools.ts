import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { recordPermissionPreflight } from "../permissionPolicy";
import { publicProcedure, router } from "../_core/trpc";

const capabilityKinds = [
  "text_reasoning",
  "coding",
  "vision",
  "image_generation",
  "video_frames",
  "ocr",
  "research",
  "spreadsheet",
  "document",
  "browser_tool",
  "gateway",
] as const;

const accessMethods = ["local", "direct_api", "gateway", "web_handoff", "browser_assisted", "manual_copy_paste"] as const;
const privacyClasses = ["local_private", "public_safe", "limited_external", "sensitive_review", "blocked_sensitive", "unknown"] as const;
const evalStatuses = ["untested", "source_verified", "tested_pass", "tested_mixed", "tested_fail", "stale"] as const;
const approvalLevels = ["none", "confirm_each_use", "explicit_approval", "account_setup_required", "blocked"] as const;

const evalTasks = [
  {
    key: "command_intake_route",
    label: "Classify command intake",
    expectedSignal: "Correct category, owner agent, permission gate, and next safe step.",
  },
  {
    key: "source_summary_privacy",
    label: "Summarize a saved source",
    expectedSignal: "Preserves provenance, trust note, and sensitive-data warning.",
  },
  {
    key: "terminal_error_next_step",
    label: "Explain a terminal error",
    expectedSignal: "Plain-language cause plus safe diagnostic commands, not execution.",
  },
  {
    key: "visual_annotation_route",
    label: "Review a screenshot or UI state",
    expectedSignal: "Routed annotation note with coordinates/context and privacy class.",
  },
  {
    key: "handoff_prompt_gate",
    label: "Draft a model/tool handoff",
    expectedSignal: "Names target tool, input format, approval gate, and validation plan.",
  },
  {
    key: "claim_critique",
    label: "Critique unsupported claims",
    expectedSignal: "Flags missing evidence and asks for source-backed validation.",
  },
];

const creativeLanes = [
  {
    id: "gojo_comfyui",
    label: "Gojo ComfyUI",
    ownerAgent: "gojo",
    tool: "ComfyUI",
    status: "proposal_only",
    installStatus: "not_installed",
    accessMethod: "local",
    privacyClass: "local_private",
    privacyLane: "normal_creative",
    approvalGate: "Explicit approval before install, model download, workflow run, or vault write.",
    outputBoundary: "Approved Gojo creative outputs can enter the CereBro vault, Workbench, and normal source records.",
    memoryPolicy: "Allowed in normal CereBro memory only after explicit save or bridge approval.",
    canEnterCereBroMemory: true,
    requiresSeparateChat: false,
    forbiddenForRavenPrivate: true,
  },
  {
    id: "raven_private_comfyui",
    label: "Raven Private ComfyUI",
    ownerAgent: "raven",
    tool: "ComfyUI",
    status: "proposal_only",
    installStatus: "not_installed",
    accessMethod: "local",
    privacyClass: "blocked_sensitive",
    privacyLane: "sealed_private",
    approvalGate: "Raven setup stays separate. Normal CereBro cannot run, view, index, summarize, or route private Raven outputs.",
    outputBoundary: "Raven private output root required. No normal CereBro vault, gallery, Workbench, Ledger, or RAG write.",
    memoryPolicy: "Never enters normal CereBro memory unless the user approves a scrubbed bridge summary.",
    canEnterCereBroMemory: false,
    requiresSeparateChat: true,
    forbiddenForRavenPrivate: false,
  },
  {
    id: "realesrgan_upscale",
    label: "RealESRGAN Upscale",
    ownerAgent: "gojo",
    tool: "RealESRGAN",
    status: "proposal_only",
    installStatus: "not_installed",
    accessMethod: "local",
    privacyClass: "local_private",
    privacyLane: "normal_creative",
    approvalGate: "Confirm source file, target output path, and whether the result may enter the CereBro vault.",
    outputBoundary: "Upscaled files are local working outputs until approved for the vault or client delivery lane.",
    memoryPolicy: "Record metadata only after explicit approval. Do not store private images by default.",
    canEnterCereBroMemory: true,
    requiresSeparateChat: false,
    forbiddenForRavenPrivate: true,
  },
  {
    id: "free_cloud_burst",
    label: "Free Cloud Burst",
    ownerAgent: "cortana",
    tool: "Free-tier external models",
    status: "proposal_only",
    installStatus: "not_connected",
    accessMethod: "direct_api",
    privacyClass: "limited_external",
    privacyLane: "public_or_scrubbed_only",
    approvalGate: "Confirm provider, data leaving the machine, free-tier limit, and no paid trial before each use.",
    outputBoundary: "Use only for public, scrubbed, or user-approved inputs. Never for Raven private work.",
    memoryPolicy: "Record provider, prompt summary, result summary, and validation notes after use.",
    canEnterCereBroMemory: true,
    requiresSeparateChat: false,
    forbiddenForRavenPrivate: true,
  },
] as const;

const localModelLanes = [
  {
    id: "ollama_local_fast_lane",
    label: "Ollama Local Fast Lane",
    ownerAgent: "cortana",
    tool: "Ollama",
    modelClass: "local_summary",
    status: "proposal_only",
    installStatus: "not_verified",
    accessMethod: "local",
    privacyClass: "local_private",
    speedClass: "fast_when_small",
    defaultUse: "Private summaries, labels, source cards, learning-note drafts, route drafts, and light reasoning.",
    avoidFor: "Large coding tasks, long-context architecture, critical validation, and anything that needs frontier quality.",
    approvalGate: "Spock approval before install, model pull, model deletion, or background local inference.",
    uiRule: "Visible in Basement only. Aang and Cortana may cite the lane in receipts without showing model settings on the Keep.",
  },
  {
    id: "local_embedding_smoke_lane",
    label: "Local Embedding Smoke Lane",
    ownerAgent: "oak",
    tool: "Ollama",
    modelClass: "embedding",
    status: "proposal_only",
    installStatus: "not_verified",
    accessMethod: "local",
    privacyClass: "local_private",
    speedClass: "fast_when_small",
    defaultUse: "Small semantic-search smoke tests and retrieval experiments before a cloud vector lane is selected.",
    avoidFor: "Full vault indexing, heavy source archives, or background jobs that would fill local storage.",
    approvalGate: "Approval before install, model pull, vector index creation, or durable storage writes.",
    uiRule: "Visible in Basement and storage receipts only. Normal users see search quality and source citations, not embedding plumbing.",
  },
] as const;

const ollamaSetupPlan = {
  status: "not_started",
  executionMode: "approval_required",
  hardwareStance: "M2 with 8GB RAM means small models only. Speed and memory pressure must be measured on this Mac.",
  storageRule: "Mac is the workbench, not the warehouse. Keep model pulls deliberately small until storage pressure and vault routing are proven.",
  uiRule: "Basement shows install status, model shortlist, and test results. Keep and Ask Aang show only route receipts.",
  firstApprovalBatch: [
    {
      model: "all-minilm:22m",
      modelClass: "embedding",
      expectedSize: "46MB",
      use: "First semantic-search smoke test.",
      avoid: "Long documents and nuanced retrieval.",
    },
    {
      model: "gemma3:1b",
      modelClass: "lightweight_formatter",
      expectedSize: "815MB",
      use: "Rewrites, short summaries, learning-card drafts, and source-card drafts.",
      avoid: "Hard reasoning, large code work, and critical validation.",
    },
  ],
  stretchCandidates: [
    {
      model: "qwen3:1.7b",
      modelClass: "local_reasoner",
      expectedSize: "1.4GB",
      use: "Light planning and simple code explanations if the first chat model is fast enough.",
      avoid: "Multi-file implementation and architecture decisions.",
    },
    {
      model: "llama3.2:3b",
      modelClass: "local_reasoner",
      expectedSize: "2.0GB",
      use: "Instruction-following trial if memory pressure stays acceptable.",
      avoid: "Always-on background use on 8GB RAM.",
    },
  ],
  blockedFirstInstalls: [
    "7B+ chat/coding models",
    "12B/14B/27B/70B models",
    "multiple redundant chat models",
    "local image/video generation stacks",
    "Raven generation models",
  ],
  testProcedure: [
    "Confirm Ollama is installed.",
    "Run a health prompt.",
    "Run a formatting prompt.",
    "Run a short summary prompt.",
    "Run one light reasoning prompt.",
    "Record rough latency, quality, stability, disk impact, and memory pressure.",
    "Mark a model as tested only after the result is recorded.",
  ],
  nextApprovalSteps: [
    {
      label: "Check Install Status",
      gate: "Read-only command check may run after user approval.",
      receipt: "Record PATH/version/list status. No install or pull.",
      runsFromPolicy: false,
    },
    {
      label: "Install Ollama",
      gate: "Explicit install approval required.",
      receipt: "Record installer path, version, disk impact, and CLI link status.",
      runsFromPolicy: false,
    },
    {
      label: "Pull First Batch",
      gate: "Explicit model-pull approval required for each model.",
      receipt: "Pull only all-minilm:22m and gemma3:1b first. Record disk impact.",
      runsFromPolicy: false,
    },
    {
      label: "Run Local Eval",
      gate: "Explicit local eval approval required.",
      receipt: "Record health, formatting, summary, light reasoning, latency, quality, and stability.",
      runsFromPolicy: false,
    },
  ],
  installStatusCheck: {
    status: "not_run",
    approvalGate: "Ask before running the read-only status check. The check may inspect PATH, version, and local model list only.",
    allowedCommands: [
      "command -v ollama",
      "ollama --version",
      "ollama list",
    ],
    forbiddenCommands: [
      "install",
      "brew install",
      "curl | sh",
      "ollama pull",
      "ollama run",
      "ollama serve",
      "ollama rm",
    ],
    receiptFields: [
      "timestamp",
      "ollama_binary_path",
      "ollama_version",
      "local_model_count",
      "local_model_names",
      "command_exit_codes",
      "no_install_or_pull_confirmation",
    ],
    nextStateIfMissing: "Show install proposal. Do not install.",
    nextStateIfPresent: "Show model inventory and ask before any pull or eval.",
    noActionTaken: "No status command has run from CereBro.",
  },
  noActionTaken: [
    "No Ollama install ran.",
    "No model was pulled.",
    "No local model was called.",
    "No vector index was created.",
    "No background inference was enabled.",
  ],
} as const;

function rowToCapability(row: Record<string, unknown>) {
  const latestEval = readLatestEval(row);
  const sourceReadiness = readSourceReadiness({
    approvalLevel: String(row.approval_level),
    evalStatus: String(row.eval_status),
    lastVerifiedAt: row.last_verified_at == null ? null : Number(row.last_verified_at),
    latestEvalStatus: latestEval?.status ?? null,
    privacyClass: String(row.privacy_class),
    riskReview: row.risk_review == null ? null : String(row.risk_review),
    sourceUris: row.source_uris == null ? null : String(row.source_uris),
    validationNotes: row.validation_notes == null ? null : String(row.validation_notes),
  });

  return {
    id: Number(row.id),
    provider: String(row.provider),
    toolName: String(row.tool_name),
    capabilityKind: String(row.capability_kind),
    accessMethod: String(row.access_method),
    accountRequired: String(row.account_required),
    freeTier: row.free_tier == null ? null : String(row.free_tier),
    rateLimit: row.rate_limit == null ? null : String(row.rate_limit),
    costNotes: row.cost_notes == null ? null : String(row.cost_notes),
    contextWindow: row.context_window == null ? null : Number(row.context_window),
    inputLimits: row.input_limits == null ? null : String(row.input_limits),
    outputLimits: row.output_limits == null ? null : String(row.output_limits),
    modalities: row.modalities == null ? null : String(row.modalities),
    strengths: row.strengths == null ? null : String(row.strengths),
    weaknesses: row.weaknesses == null ? null : String(row.weaknesses),
    promptStyle: row.prompt_style == null ? null : String(row.prompt_style),
    privacyClass: String(row.privacy_class),
    dataAllowed: row.data_allowed == null ? null : String(row.data_allowed),
    evalStatus: String(row.eval_status),
    evalScore: row.eval_score == null ? null : Number(row.eval_score),
    approvalLevel: String(row.approval_level),
    sourceUris: row.source_uris == null ? null : String(row.source_uris),
    lastVerifiedAt: row.last_verified_at == null ? null : Number(row.last_verified_at),
    discoveredByAgent: String(row.discovered_by_agent),
    riskReview: row.risk_review == null ? null : String(row.risk_review),
    validationNotes: row.validation_notes == null ? null : String(row.validation_notes),
    failureNotes: row.failure_notes == null ? null : String(row.failure_notes),
    fallbackSuggestion: row.fallback_suggestion == null ? null : String(row.fallback_suggestion),
    latestEval,
    sourceReadiness,
    status: String(row.status),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function readLatestEval(row: Record<string, unknown>) {
  const count = Number(row.eval_note_count ?? 0);
  if (count === 0 || row.latest_eval_status == null) return null;
  return {
    count,
    status: String(row.latest_eval_status),
    taskKey: row.latest_eval_task_key == null ? null : String(row.latest_eval_task_key),
    summary: row.latest_eval_summary == null ? null : String(row.latest_eval_summary),
    validationNotes: row.latest_eval_validation_notes == null ? null : String(row.latest_eval_validation_notes),
    createdAt: row.latest_eval_created_at == null ? null : Number(row.latest_eval_created_at),
  };
}

function splitSourceUris(value: string | null | undefined) {
  return (value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readSourceReadiness(input: {
  approvalLevel: string;
  evalStatus: string;
  lastVerifiedAt: number | null;
  latestEvalStatus: string | null;
  privacyClass: string;
  riskReview: string | null;
  sourceUris: string | null;
  validationNotes: string | null;
}) {
  const sourceUriCount = splitSourceUris(input.sourceUris).length;
  const hasCheckedDate = input.lastVerifiedAt != null;
  const hasRiskReview = Boolean(input.riskReview?.trim());
  const hasValidationNotes = Boolean(input.validationNotes?.trim());
  const noActionTaken = [
    "No browser, search, fetch, provider, model, gateway, install, token, or account action ran.",
    "Readiness is computed from local registry fields only.",
  ];

  if (input.privacyClass === "blocked_sensitive" || input.approvalLevel === "blocked") {
    return {
      status: "blocked" as const,
      label: "blocked",
      sourceUriCount,
      nextStep: "Keep blocked. Do not route without an explicit policy change.",
      requiredBeforeTrust: ["User approval to change policy.", "Spock review.", "Oak validation notes."],
      noActionTaken,
    };
  }

  if (input.evalStatus === "tested_pass") {
    return {
      status: "eval_ready" as const,
      label: "eval ready",
      sourceUriCount,
      nextStep: "Can be considered for a route proposal with a visible approval receipt.",
      requiredBeforeTrust: sourceUriCount > 0 ? [] : ["Add source URLs for provenance."],
      noActionTaken,
    };
  }

  if (input.evalStatus === "source_verified") {
    return {
      status: "source_ready" as const,
      label: "source ready",
      sourceUriCount,
      nextStep: "Run a small CereBro eval before making this a recommended default.",
      requiredBeforeTrust: ["Local eval note.", "Failure notes if eval is mixed or blocked."],
      noActionTaken,
    };
  }

  if (input.latestEvalStatus != null) {
    const failed = input.latestEvalStatus === "fail" || input.latestEvalStatus === "blocked";
    return {
      status: failed ? "eval_blocked" as const : "eval_recorded" as const,
      label: failed ? "eval blocked" : "eval recorded",
      sourceUriCount,
      nextStep: failed
        ? "Keep out of route defaults until Spock resolves the failed eval."
        : "Eval evidence exists. It does not mark this trusted until Oak or Spock changes the capability status.",
      requiredBeforeTrust: failed
        ? ["Failure review.", "Replacement or retest.", "Explicit trusted-status decision."]
        : ["Explicit trusted-status decision."],
      noActionTaken,
    };
  }

  if (sourceUriCount === 0) {
    return {
      status: "missing_sources" as const,
      label: "missing sources",
      sourceUriCount,
      nextStep: "Add source URLs before Surfer or Oak can validate the claim.",
      requiredBeforeTrust: [
        "Source URLs.",
        ...(hasCheckedDate ? [] : ["Date checked."]),
        ...(hasRiskReview ? [] : ["Risk review."]),
        ...(hasValidationNotes ? [] : ["Validation notes."]),
      ],
      noActionTaken,
    };
  }

  return {
    status: "needs_source_review" as const,
    label: "needs source review",
    sourceUriCount,
    nextStep: hasRiskReview && hasValidationNotes
      ? "Have Oak mark source verification or run a local eval."
      : "Have Surfer/Oak review sources, then add risk and validation notes.",
    requiredBeforeTrust: [
      ...(hasCheckedDate ? [] : ["Date checked."]),
      ...(hasRiskReview ? [] : ["Risk review."]),
      ...(hasValidationNotes ? [] : ["Validation notes."]),
      "Source verification status or eval result.",
    ],
    noActionTaken,
  };
}

function rowToEval(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    capabilityId: row.capability_id == null ? null : Number(row.capability_id),
    evalTaskKey: String(row.eval_task_key),
    taskSummary: String(row.task_summary),
    promptOrHandoffId: row.prompt_or_handoff_id == null ? null : Number(row.prompt_or_handoff_id),
    expectedSignal: row.expected_signal == null ? null : String(row.expected_signal),
    resultSummary: row.result_summary == null ? null : String(row.result_summary),
    score: row.score == null ? null : Number(row.score),
    status: String(row.status),
    evaluatorAgent: String(row.evaluator_agent),
    validationNotes: row.validation_notes == null ? null : String(row.validation_notes),
    privacyNotes: row.privacy_notes == null ? null : String(row.privacy_notes),
    createdAt: Number(row.created_at),
  };
}

function rowToApprovalPreview(row: Record<string, unknown>) {
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
    sensitiveDataFlag: Boolean(row.sensitive_data_flag),
    costRisk: row.cost_risk == null ? null : String(row.cost_risk),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    decidedAt: row.decided_at == null ? null : Number(row.decided_at),
    createdAt: Number(row.created_at),
  };
}

function approvalForPrivacy(privacyClass: string) {
  if (privacyClass === "local_private") return "No external model/tool approval needed for the route preview itself.";
  if (privacyClass === "public_safe") return "Confirm before sending public-safe context to any external model/tool.";
  if (privacyClass === "limited_external") return "Explicit approval required. Show provider, data summary, and storage/cost notes first.";
  if (privacyClass === "sensitive_review") return "Oak/Spock review required before any external call. Prefer local/private route first.";
  if (privacyClass === "blocked_sensitive") return "Blocked for external use unless the user changes the policy.";
  return "Treat as explicit approval required until privacy class is known.";
}

function routePlanForTask(input: {
  taskKind: string;
  modality?: string;
  privacyClass?: string;
  requiresFrontier?: boolean;
}) {
  const privacyClass = input.privacyClass ?? "unknown";
  const kind = input.taskKind.toLowerCase();
  const modality = input.modality?.toLowerCase() ?? "text";

  const needsVision = modality.includes("image") || modality.includes("video") || kind.includes("vision") || kind.includes("screenshot");
  const needsCode = kind.includes("code") || kind.includes("implementation") || kind.includes("debug");
  const needsCurrentSources = kind.includes("research") || kind.includes("current") || kind.includes("source");
  const localSmallText = !needsVision && !needsCode && !input.requiresFrontier;

  const lanes = [
    {
      lane: localSmallText ? "ollama_local_fast_lane" : "local_or_private_first",
      reason: localSmallText
        ? "Use the fast local-first Ollama lane for private or lightweight text work once installed and tested."
        : "Use this when data is private, sensitive, or the task is lightweight enough for local summary/formatting.",
      approvalLevel: privacyClass === "local_private" ? "none" : "confirm_each_use",
      status: localSmallText ? "not_verified_no_install" : "available_policy_only",
    },
  ];

  if (needsCurrentSources) {
    lanes.push({
      lane: "surfer_discovery_proposal",
      reason: "Current model/tool/source claims require Surfer source verification before registry trust.",
      approvalLevel: "explicit_approval",
      status: "requires_source_approval",
    });
  }

  if (needsVision) {
    lanes.push({
      lane: "vision_adapter_candidate",
      reason: "Image/video understanding needs a hosted high-accuracy lane or local/private OCR/vision fallback.",
      approvalLevel: "explicit_approval",
      status: "adapter_not_connected",
    });
  }

  if (needsCode || input.requiresFrontier) {
    lanes.push({
      lane: "frontier_reasoning_candidate",
      reason: "Hard coding/reasoning should not be replaced by model pileups. Use a frontier lane when quality matters.",
      approvalLevel: "explicit_approval",
      status: "provider_not_selected",
    });
  }

  return {
    taskKind: input.taskKind,
    modality: input.modality ?? "text",
    privacyClass,
    routeStatus: "proposal_only",
    recommendedLane: input.requiresFrontier ? "frontier_reasoning_candidate" : lanes[0]?.lane ?? "ollama_local_fast_lane",
    approvalGate: approvalForPrivacy(privacyClass),
    decisionPath: [
      {
        step: "Source",
        status: needsCurrentSources || needsVision || needsCode ? "required_before_trust" : "recommended_before_default",
        ownerAgent: needsCurrentSources ? "surfer" : "oak",
        receipt: "Source URLs, date checked, risk review, and validation notes.",
      },
      {
        step: "Eval",
        status: "required_before_default",
        ownerAgent: "spock",
        receipt: "Local eval note tied to a CereBro eval task.",
      },
      {
        step: "Approval",
        status: privacyClass === "local_private" ? "local_receipt" : "required_before_use",
        ownerAgent: "spock",
        receipt: approvalForPrivacy(privacyClass),
      },
    ],
    lanes,
    validationPlan: [
      "Check whether a capability record exists and is source-verified or eval-tested.",
      "Use a small CereBro eval task before marking a model/tool as recommended.",
      "Have Spock/Oak inspect unsupported claims, privacy fit, and failure notes before reuse.",
      "Record call/eval results before changing routing defaults.",
    ],
    noActionTaken: [
      "No external model or tool was called.",
      "No Ollama install, local model pull, or local model call was made.",
      "No gateway dependency was installed.",
      "No browser/search/fetch was used.",
      "No account, token, payment, or provider setup was touched.",
    ],
  };
}

const capabilityMap = [
  {
    id: "local_first",
    label: "Local First",
    ownerAgent: "cortana",
    laneIds: ["ollama_local_fast_lane", "local_embedding_smoke_lane"],
    status: "proposal_only",
    defaultUse: "Fast private summaries, small reasoning jobs, embeddings, and low-risk local checks.",
    escalationRule: "Escalate only when quality, context size, or missing local install makes local work the wrong tool.",
    approvalRule: "Install, pulls, deletes, and inference need approval until the local runtime is verified.",
    uiRule: "Show as Basement readiness. Do not put model switches on the Keep.",
    noActionTaken: "No install, pull, model call, fetch, browser run, account setup, or token use ran.",
  },
  {
    id: "external_gateway",
    label: "External Gateway",
    ownerAgent: "spock",
    laneIds: ["gatewayCandidates"],
    status: "gated_proposal",
    defaultUse: "Public-safe or scrubbed work that clearly needs a stronger external model or specific provider tool.",
    escalationRule: "Use only when local quality is not enough or the requested tool exists only outside CereBro.",
    approvalRule: "Confirm each use and show what data leaves the machine.",
    uiRule: "Surface only at the approval/route receipt moment.",
    noActionTaken: "No external provider, gateway, browser, search, or fetch call ran.",
  },
  {
    id: "creative_normal",
    label: "Creative Normal",
    ownerAgent: "gojo",
    laneIds: ["gojo_comfyui", "realesrgan_upscale", "video_frame_lane"],
    status: "proposal_only",
    defaultUse: "CereBro-safe images, upscales, visual drafts, and future video frame work.",
    escalationRule: "Use a creative tool only when it improves the artifact beyond normal code/UI work.",
    approvalRule: "Approve install/run/storage path before any tool call or generated output.",
    uiRule: "Keep setup in Basement. Put finished outputs in the Workbench or vault.",
    noActionTaken: "No ComfyUI, RealESRGAN, video, model, or media command ran.",
  },
  {
    id: "creative_sealed",
    label: "Creative Sealed",
    ownerAgent: "raven",
    laneIds: ["raven_private_comfyui"],
    status: "sealed_private",
    defaultUse: "Raven-only private generation in its own chat and storage boundary.",
    escalationRule: "Do not route normal CereBro tasks here.",
    approvalRule: "No Raven content enters CereBro memory, RAG, Ledger, gallery, Workbench, or vault lanes.",
    uiRule: "CereBro may show a sealed launcher only. It carries no content back.",
    noActionTaken: "No Raven content was read, written, indexed, summarized, synced, exported, or routed.",
  },
] as const;

function countValue(row: Record<string, unknown> | undefined, key: string) {
  return Number(row?.[key] ?? 0);
}

async function readCapabilityMapSummary() {
  const db = await getCerebroDb();
  const [totals, evalTotals, mapCounts] = await Promise.all([
    db.execute({
      sql: `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN eval_status = 'untested' THEN 1 ELSE 0 END) AS untested,
          SUM(CASE WHEN eval_status IN ('tested_pass', 'tested_mixed', 'tested_fail') THEN 1 ELSE 0 END) AS tested,
          SUM(CASE WHEN access_method != 'local' THEN 1 ELSE 0 END) AS external,
          SUM(CASE WHEN privacy_class = 'blocked_sensitive' OR approval_level = 'blocked' THEN 1 ELSE 0 END) AS blocked,
          SUM(CASE WHEN source_uris IS NULL OR TRIM(source_uris) = '' THEN 1 ELSE 0 END) AS missing_sources,
          SUM(CASE WHEN source_uris IS NOT NULL AND TRIM(source_uris) != '' AND eval_status NOT IN ('source_verified', 'tested_pass') THEN 1 ELSE 0 END) AS needs_source_review,
          SUM(CASE WHEN eval_status = 'source_verified' THEN 1 ELSE 0 END) AS source_ready,
          SUM(CASE WHEN eval_status = 'tested_pass' THEN 1 ELSE 0 END) AS eval_ready
        FROM model_tool_capabilities
      `,
      args: [],
    }),
    db.execute({
      sql: "SELECT COUNT(*) AS total FROM model_tool_evals",
      args: [],
    }),
    db.execute({
      sql: `
        SELECT
          SUM(CASE WHEN access_method = 'local' THEN 1 ELSE 0 END) AS local_first,
          SUM(CASE WHEN access_method != 'local' OR capability_kind = 'gateway' THEN 1 ELSE 0 END) AS external_gateway,
          SUM(CASE WHEN capability_kind IN ('image_generation', 'video_frames') AND privacy_class != 'blocked_sensitive' THEN 1 ELSE 0 END) AS creative_normal,
          SUM(CASE WHEN privacy_class = 'blocked_sensitive' OR approval_level = 'blocked' THEN 1 ELSE 0 END) AS creative_sealed
        FROM model_tool_capabilities
      `,
      args: [],
    }),
  ]);

  const totalRow = totals.rows[0] as Record<string, unknown> | undefined;
  const evalRow = evalTotals.rows[0] as Record<string, unknown> | undefined;
  const mapRow = mapCounts.rows[0] as Record<string, unknown> | undefined;

  return {
    totalRecords: countValue(totalRow, "total"),
    untestedRecords: countValue(totalRow, "untested"),
    testedRecords: countValue(totalRow, "tested"),
    externalRecords: countValue(totalRow, "external"),
    blockedRecords: countValue(totalRow, "blocked"),
    sourceReadiness: {
      missingSources: countValue(totalRow, "missing_sources"),
      needsSourceReview: countValue(totalRow, "needs_source_review"),
      sourceReady: countValue(totalRow, "source_ready"),
      evalReady: countValue(totalRow, "eval_ready"),
    },
    evalNotes: countValue(evalRow, "total"),
    mapCounts: {
      local_first: countValue(mapRow, "local_first"),
      external_gateway: countValue(mapRow, "external_gateway"),
      creative_normal: countValue(mapRow, "creative_normal"),
      creative_sealed: countValue(mapRow, "creative_sealed"),
    },
    noActionTaken: [
      "Summary reads local registry rows only.",
      "No provider, model, gateway, browser, install, pull, or external tool ran.",
    ],
  };
}

export const modelToolsRouter = router({
  policy: publicProcedure.query(async () => {
    const capabilityMapSummary = await readCapabilityMapSummary();

    return {
      mode: "proposal_only",
      writesExternal: false,
      callsExternalModels: false,
      installsDependencies: false,
      browsesOrFetches: false,
      routingStance: "Fast local-first, not local-only. Use Ollama/local lanes when possible, then escalate only when quality or size requires it.",
      speedStance: "Instant shell, rule-based previews, small local models for small jobs, and visible background work for anything slow.",
      registryStatus: "local_proposal_records_only",
      gatewayCandidates: ["CereBro-native gateway", "LiteLLM", "OpenRouter", "direct provider SDKs"],
      registryShape: {
        required: [
          "provider",
          "tool/model name",
          "access method",
          "free tier/rate limit/cost",
          "modality",
          "privacy class",
          "prompt style",
          "eval status",
          "source URLs",
          "last verified date",
        ],
        rule: "A capability is a proposal until source-verified or eval-tested.",
      },
      sourceVerificationGate: {
        register: "product_surface",
        mode: "read_only",
        ownerAgent: "surfer",
        validatorAgents: ["oak", "spock"],
        trustedStates: ["source_verified", "tested_pass"],
        requiredFields: [
          "source URLs",
          "date checked",
          "risk review",
          "validation notes",
          "privacy class",
          "approval level",
        ],
        nextAction: "Review sources locally in the registry before a capability can become a route default.",
        noActionTaken: [
          "No browser, search, fetch, provider, model, gateway, install, token, or account action ran.",
          "The source gate reads local registry rows only.",
        ],
      },
      capabilityMap: capabilityMap.map((lane) => ({
        ...lane,
        registryRecordCount: capabilityMapSummary.mapCounts[lane.id],
      })),
      capabilityMapSummary,
      evalTasks,
      gates: [
        "Surfer may propose model/tool discoveries only with source URLs and date checked.",
        "Cortana routes, Batman risk-reviews, Spock/Oak validate, and Piccolo watches cost/rate-limit/staleness.",
        "External model/tool use requires visible approval and a summary of data leaving the machine.",
        "No model/tool becomes a recommended default without an eval or an explicit untested label.",
        "Ollama stays on the core local-first path, but install, pulls, deletes, and background inference still need approval.",
        "Raven outputs stay outside normal CereBro memory, RAG, galleries, Workbench, Ledger, and vault lanes unless the user approves a scrubbed bridge summary.",
      ],
      ollamaSetupPlan,
      localModelLanes,
      creativeLanes,
    };
  }),

  capabilities: publicProcedure
    .input(
      z
        .object({
          capabilityKind: z.enum(capabilityKinds).optional(),
          evalStatus: z.enum(evalStatuses).optional(),
          provider: z.string().max(120).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.capabilityKind) {
        where.push("capability_kind = ?");
        args.push(input.capabilityKind);
      }
      if (input?.evalStatus) {
        where.push("eval_status = ?");
        args.push(input.evalStatus);
      }
      if (input?.provider) {
        where.push("provider LIKE ?");
        args.push(`%${input.provider}%`);
      }
      args.push(input?.limit ?? 50);
      const result = await db.execute({
        sql: `
          SELECT
            c.*,
            (
              SELECT COUNT(*)
              FROM model_tool_evals e
              WHERE e.capability_id = c.id
            ) AS eval_note_count,
            latest.status AS latest_eval_status,
            latest.eval_task_key AS latest_eval_task_key,
            latest.task_summary AS latest_eval_summary,
            latest.validation_notes AS latest_eval_validation_notes,
            latest.created_at AS latest_eval_created_at
          FROM model_tool_capabilities c
          LEFT JOIN model_tool_evals latest
            ON latest.id = (
              SELECT e2.id
              FROM model_tool_evals e2
              WHERE e2.capability_id = c.id
              ORDER BY e2.created_at DESC, e2.id DESC
              LIMIT 1
            )
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY updated_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });

      return {
        mode: "read_only",
        writesExternal: false,
        callsExternalModels: false,
        items: result.rows.map(rowToCapability),
      };
    }),

  proposeCapability: publicProcedure
    .input(
      z.object({
        provider: z.string().min(1).max(120),
        toolName: z.string().min(1).max(160),
        capabilityKind: z.enum(capabilityKinds),
        accessMethod: z.enum(accessMethods),
        accountRequired: z.string().max(160).optional(),
        freeTier: z.string().max(500).optional(),
        rateLimit: z.string().max(500).optional(),
        costNotes: z.string().max(500).optional(),
        contextWindow: z.number().int().positive().optional(),
        modalities: z.string().max(500).optional(),
        strengths: z.string().max(1200).optional(),
        weaknesses: z.string().max(1200).optional(),
        promptStyle: z.string().max(1200).optional(),
        privacyClass: z.enum(privacyClasses).optional(),
        dataAllowed: z.string().max(1200).optional(),
        approvalLevel: z.enum(approvalLevels).optional(),
        sourceUris: z.string().max(2000).optional(),
        sourceCheckedAt: z.number().int().positive().optional(),
        discoveredByAgent: z.string().max(80).optional(),
        riskReview: z.string().max(1200).optional(),
        validationNotes: z.string().max(1200).optional(),
        failureNotes: z.string().max(1200).optional(),
        fallbackSuggestion: z.string().max(1200).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO model_tool_capabilities (
            provider, tool_name, capability_kind, access_method, account_required,
            free_tier, rate_limit, cost_notes, context_window, modalities,
            strengths, weaknesses, prompt_style, privacy_class, data_allowed,
            approval_level, source_uris, last_verified_at, discovered_by_agent, risk_review,
            validation_notes, failure_notes, fallback_suggestion
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.provider,
          input.toolName,
          input.capabilityKind,
          input.accessMethod,
          input.accountRequired ?? "unknown",
          input.freeTier ?? null,
          input.rateLimit ?? null,
          input.costNotes ?? null,
          input.contextWindow ?? null,
          input.modalities ?? null,
          input.strengths ?? null,
          input.weaknesses ?? null,
          input.promptStyle ?? null,
          input.privacyClass ?? "unknown",
          input.dataAllowed ?? null,
          input.approvalLevel ?? "explicit_approval",
          input.sourceUris ?? null,
          input.sourceCheckedAt ?? null,
          input.discoveredByAgent ?? "surfer",
          input.riskReview ?? null,
          input.validationNotes ?? null,
          input.failureNotes ?? null,
          input.fallbackSuggestion ?? null,
        ],
      });

      return {
        ok: true as const,
        mode: "local_registry_proposal" as const,
        appendOnly: true,
        writesExternal: false,
        callsExternalModels: false,
        installsDependencies: false,
        capability: rowToCapability(result.rows[0]!),
        gates: [
          "Created one local Model/Tool Capability proposal.",
          "This did not verify current pricing, limits, docs, or quality.",
          "This did not call the model/tool, install a gateway, browse/search/fetch, or create an external account.",
        ],
      };
    }),

  recordEval: publicProcedure
    .input(
      z.object({
        capabilityId: z.number().int().optional(),
        evalTaskKey: z.string().min(1).max(120),
        taskSummary: z.string().min(1).max(1200),
        promptOrHandoffId: z.number().int().optional(),
        expectedSignal: z.string().max(1200).optional(),
        resultSummary: z.string().max(1600).optional(),
        score: z.number().min(0).max(1).optional(),
        status: z.enum(["recorded", "pass", "mixed", "fail", "blocked"]).optional(),
        evaluatorAgent: z.string().max(80).optional(),
        validationNotes: z.string().max(1600).optional(),
        privacyNotes: z.string().max(1200).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO model_tool_evals (
            capability_id, eval_task_key, task_summary, prompt_or_handoff_id,
            expected_signal, result_summary, score, status, evaluator_agent,
            validation_notes, privacy_notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.capabilityId ?? null,
          input.evalTaskKey,
          input.taskSummary,
          input.promptOrHandoffId ?? null,
          input.expectedSignal ?? null,
          input.resultSummary ?? null,
          input.score ?? null,
          input.status ?? "recorded",
          input.evaluatorAgent ?? "spock",
          input.validationNotes ?? null,
          input.privacyNotes ?? null,
        ],
      });

      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        callsExternalModels: false,
        eval: rowToEval(result.rows[0]!),
        gates: [
          "Recorded one local eval note.",
          "This did not run a model/tool or mark any capability as a recommended default.",
        ],
      };
    }),

  evals: publicProcedure
    .input(
      z
        .object({
          capabilityId: z.number().int().optional(),
          evalTaskKey: z.string().max(120).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.capabilityId !== undefined) {
        where.push("capability_id = ?");
        args.push(input.capabilityId);
      }
      if (input?.evalTaskKey) {
        where.push("eval_task_key = ?");
        args.push(input.evalTaskKey);
      }
      args.push(input?.limit ?? 50);
      const result = await db.execute({
        sql: `
          SELECT *
          FROM model_tool_evals
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args,
      });

      return {
        mode: "read_only",
        writesExternal: false,
        callsExternalModels: false,
        items: result.rows.map(rowToEval),
      };
    }),

  routePreview: publicProcedure
    .input(
      z.object({
        taskKind: z.string().min(1).max(120),
        modality: z.string().max(80).optional(),
        privacyClass: z.enum(privacyClasses).optional(),
        requiresFrontier: z.boolean().optional(),
      }),
    )
    .query(({ input }) => routePlanForTask(input)),

  createOllamaStatusApprovalPreview: publicProcedure
    .input(
      z
        .object({
          reason: z.string().max(1000).optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const statusCheck = ollamaSetupPlan.installStatusCheck;
      const contextSummary = [
        "Ollama install-status check proposal.",
        `Allowed commands: ${statusCheck.allowedCommands.join(", ")}`,
        `Forbidden actions: ${statusCheck.forbiddenCommands.join(", ")}`,
        `Receipt fields: ${statusCheck.receiptFields.join(", ")}`,
        statusCheck.noActionTaken,
      ].join("\n");
      const preflight = await recordPermissionPreflight(db, {
        perceptionClass: "terminal_logs",
        actionClass: "command_execution",
        requestedByAgent: "spock",
        targetSummary: "Ollama install-status check. Read-only PATH/version/list inspection.",
        additionalReasons: [
          "Model Tools approval previews are local metadata only.",
          "This preview does not run the status command.",
          "Install, pull, run, serve, and remove actions remain forbidden from this preview.",
        ],
      });
      const result = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            status, reason, context_summary, sensitive_data_flag, cost_risk,
            permission_preflight_id
          )
          VALUES (NULL, 'ollama_status_read_only_check', 'model_tool_ollama_status_check', NULL, 'spock', 'pending', ?, ?, 0, ?, ?)
          RETURNING id, task_id, action_type, target_type, target_id,
                    requested_by_agent, status, reason, context_summary,
                    sensitive_data_flag, cost_risk, permission_preflight_id,
                    decided_at, created_at
        `,
        args: [
          input?.reason ?? "Local approval preview for Ollama install-status check. This does not run a command.",
          contextSummary,
          "local_read_only_command_review",
          Number(preflight.row.id),
        ],
      });
      const row = result.rows[0];
      return {
        ok: Boolean(row),
        appendOnly: true as const,
        writesExternal: false,
        executesCommands: false,
        installsDependencies: false,
        pullsModels: false,
        callsLocalModels: false,
        approval: row ? rowToApprovalPreview(row) : null,
        gates: [
          "This is a pending local approval preview only.",
          "Recorded one local permission preflight audit row.",
          "No command was executed.",
          "No install, pull, model call, background server, vector index, browser action, external call, or storage write ran.",
        ],
      };
    }),

  ollamaStatusApprovalPreviews: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT id, task_id, action_type, target_type, target_id,
                 requested_by_agent, status, reason, context_summary,
                 sensitive_data_flag, cost_risk, permission_preflight_id,
                 decided_at, created_at
          FROM approvals
          WHERE target_type = 'model_tool_ollama_status_check'
          ORDER BY created_at DESC, id DESC
          LIMIT ?
        `,
        args: [input?.limit ?? 5],
      });

      return {
        mode: "read_only" as const,
        writesExternal: false,
        executesCommands: false,
        installsDependencies: false,
        pullsModels: false,
        callsLocalModels: false,
        items: result.rows.map(rowToApprovalPreview),
      };
    }),
});
