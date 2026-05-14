import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
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

function rowToCapability(row: Record<string, unknown>) {
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
    status: String(row.status),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
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

export const modelToolsRouter = router({
  policy: publicProcedure.query(async () => ({
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
    evalTasks,
    gates: [
      "Surfer may propose model/tool discoveries only with source URLs and date checked.",
      "Cortana routes, Batman risk-reviews, Spock/Oak validate, and Piccolo watches cost/rate-limit/staleness.",
      "External model/tool use requires visible approval and a summary of data leaving the machine.",
      "No model/tool becomes a recommended default without an eval or an explicit untested label.",
      "Ollama stays on the core local-first path, but install, pulls, deletes, and background inference still need approval.",
      "Raven outputs stay outside normal CereBro memory, RAG, galleries, Workbench, Ledger, and vault lanes unless the user approves a scrubbed bridge summary.",
    ],
    localModelLanes,
    creativeLanes,
  })),

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
          SELECT *
          FROM model_tool_capabilities
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
            approval_level, source_uris, discovered_by_agent, risk_review,
            validation_notes, failure_notes, fallback_suggestion
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
});
