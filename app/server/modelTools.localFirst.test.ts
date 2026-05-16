import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

describe("Model Tools local-first routing policy", () => {
  it("keeps Ollama on the core fast local-first path without installing anything", async () => {
    const caller = createCaller();
    const policy = await caller.modelTools.policy();
    const route = await caller.modelTools.routePreview({
      taskKind: "summarize a private source card",
      modality: "text",
      privacyClass: "local_private",
    });

    const ollama = policy.localModelLanes.find((lane) => lane.id === "ollama_local_fast_lane");
    const embedding = policy.localModelLanes.find((lane) => lane.id === "local_embedding_smoke_lane");

    expect(policy.routingStance).toContain("local-first");
    expect(policy.speedStance).toContain("Instant shell");
    expect(policy.capabilityMap.find((lane) => lane.id === "local_first")?.uiRule).toContain("Basement readiness");
    expect(policy.capabilityMap.find((lane) => lane.id === "external_gateway")?.approvalRule).toContain("Confirm each use");
    expect(ollama?.tool).toBe("Ollama");
    expect(ollama?.defaultUse).toContain("summaries");
    expect(ollama?.installStatus).toBe("not_verified");
    expect(ollama?.approvalGate).toContain("approval before install");
    expect(embedding?.modelClass).toBe("embedding");
    expect(policy.gates.join(" ")).toContain("Ollama stays on the core local-first path");

    expect(route.recommendedLane).toBe("ollama_local_fast_lane");
    expect(route.lanes[0]?.lane).toBe("ollama_local_fast_lane");
    expect(route.lanes[0]?.status).toBe("not_verified_no_install");
    expect(route.decisionPath.map((step) => step.step)).toEqual(["Source", "Eval", "Approval"]);
    expect(route.decisionPath.find((step) => step.step === "Approval")?.status).toBe("local_receipt");
    expect(route.noActionTaken.join(" ")).toContain("No Ollama install");
  });

  it("defines the approved Ollama setup plan before the install pass", async () => {
    const caller = createCaller();
    const policy = await caller.modelTools.policy();

    expect(policy.ollamaSetupPlan.status).toBe("not_started");
    expect(policy.ollamaSetupPlan.executionMode).toBe("approval_required");
    expect(policy.ollamaSetupPlan.noActionTaken).toContain("No Ollama install ran.");
    expect(policy.ollamaSetupPlan.firstApprovalBatch.map((item) => item.model)).toEqual([
      "all-minilm:22m",
      "gemma3:1b",
    ]);
    expect(policy.ollamaSetupPlan.stretchCandidates.map((item) => item.model)).toEqual([
      "qwen3:1.7b",
      "llama3.2:3b",
    ]);
    expect(policy.ollamaSetupPlan.blockedFirstInstalls).toContain("7B+ chat/coding models");
    expect(policy.ollamaSetupPlan.testProcedure).toContain("Run a health prompt.");
    expect(policy.ollamaSetupPlan.storageRule).toContain("Mac is the workbench");
    expect(policy.ollamaSetupPlan.uiRule).toContain("Basement");
    expect(policy.ollamaSetupPlan.nextApprovalSteps.map((item) => item.label)).toEqual([
      "Check Install Status",
      "Install Ollama",
      "Pull First Batch",
      "Run Local Eval",
    ]);
    expect(policy.ollamaSetupPlan.nextApprovalSteps.every((item) => item.runsFromPolicy === false)).toBe(true);
    expect(policy.ollamaSetupPlan.installStatusCheck.status).toBe("not_run");
    expect(policy.ollamaSetupPlan.installStatusCheck.allowedCommands).toEqual([
      "command -v ollama",
      "ollama --version",
      "ollama list",
    ]);
    expect(policy.ollamaSetupPlan.installStatusCheck.forbiddenCommands).toContain("ollama pull");
    expect(policy.ollamaSetupPlan.installStatusCheck.receiptFields).toContain("no_install_or_pull_confirmation");
    expect(policy.ollamaSetupPlan.installStatusCheck.noActionTaken).toContain("No status command has run");
  });

  it("stages the Ollama status check as a local approval preview without running it", async () => {
    const caller = createCaller();
    const result = await caller.modelTools.createOllamaStatusApprovalPreview({
      reason: "Test approval preview only.",
    });

    expect(result.ok).toBe(true);
    expect(result.executesCommands).toBe(false);
    expect(result.installsDependencies).toBe(false);
    expect(result.pullsModels).toBe(false);
    expect(result.callsLocalModels).toBe(false);
    expect(result.approval?.actionType).toBe("ollama_status_read_only_check");
    expect(result.approval?.targetType).toBe("model_tool_ollama_status_check");
    expect(result.approval?.contextSummary).toContain("Allowed commands: command -v ollama, ollama --version, ollama list");
    expect(result.gates.join(" ")).toContain("No command was executed.");

    const previews = await caller.modelTools.ollamaStatusApprovalPreviews({ limit: 10 });
    expect(previews.mode).toBe("read_only");
    expect(previews.executesCommands).toBe(false);
    expect(previews.installsDependencies).toBe(false);
    expect(previews.pullsModels).toBe(false);
    expect(previews.callsLocalModels).toBe(false);
    expect(previews.items.map((item) => item.id)).toContain(result.approval?.id);
    const preview = previews.items.find((item) => item.id === result.approval?.id);
    expect(preview?.status).toBe("pending");
    expect(preview?.costRisk).toBe("local_read_only_command_review");
    expect(preview?.permissionPreflightId).toBe(result.approval?.permissionPreflightId);
  });

  it("returns live registry counts without running a model or provider", async () => {
    const caller = createCaller();
    const stamp = Date.now();
    const before = await caller.modelTools.policy();
    const local = await caller.modelTools.proposeCapability({
      provider: `Local Test ${stamp}`,
      toolName: "Small local formatter",
      capabilityKind: "text_reasoning",
      accessMethod: "local",
      privacyClass: "local_private",
      approvalLevel: "explicit_approval",
      sourceUris: "local:test",
    });
    await caller.modelTools.proposeCapability({
      provider: `Gateway Test ${stamp}`,
      toolName: "External gateway candidate",
      capabilityKind: "gateway",
      accessMethod: "gateway",
      privacyClass: "limited_external",
      approvalLevel: "confirm_each_use",
      sourceUris: "https://example.com/gateway",
    });
    await caller.modelTools.recordEval({
      capabilityId: local.capability.id,
      evalTaskKey: "handoff_prompt_gate",
      taskSummary: "Local count test. No model ran.",
      status: "recorded",
      evaluatorAgent: "spock",
    });

    const after = await caller.modelTools.policy();

    expect(after.capabilityMapSummary.totalRecords).toBeGreaterThanOrEqual(before.capabilityMapSummary.totalRecords + 2);
    expect(after.capabilityMapSummary.evalNotes).toBeGreaterThanOrEqual(before.capabilityMapSummary.evalNotes + 1);
    expect(after.capabilityMap.find((lane) => lane.id === "local_first")?.registryRecordCount).toBeGreaterThanOrEqual(1);
    expect(after.capabilityMap.find((lane) => lane.id === "external_gateway")?.registryRecordCount).toBeGreaterThanOrEqual(1);
    expect(after.capabilityMapSummary.noActionTaken.join(" ")).toContain("No provider");
  });

  it("computes source readiness from local registry fields only", async () => {
    const caller = createCaller();
    const stamp = Date.now();

    const missing = await caller.modelTools.proposeCapability({
      provider: `Missing Source ${stamp}`,
      toolName: "Unverified local helper",
      capabilityKind: "text_reasoning",
      accessMethod: "manual_copy_paste",
      privacyClass: "unknown",
      approvalLevel: "explicit_approval",
    });
    const sourced = await caller.modelTools.proposeCapability({
      provider: `Source Review ${stamp}`,
      toolName: "Documented helper",
      capabilityKind: "research",
      accessMethod: "web_handoff",
      privacyClass: "public_safe",
      approvalLevel: "confirm_each_use",
      sourceUris: "https://example.com/docs",
    });

    expect(missing.capability.sourceReadiness.status).toBe("missing_sources");
    expect(missing.capability.sourceReadiness.requiredBeforeTrust).toContain("Source URLs.");
    expect(sourced.capability.sourceReadiness.status).toBe("needs_source_review");
    expect(sourced.capability.sourceReadiness.sourceUriCount).toBe(1);
    expect(sourced.capability.sourceReadiness.noActionTaken.join(" ")).toContain("No browser");

    const policy = await caller.modelTools.policy();
    const route = await caller.modelTools.routePreview({
      taskKind: "research current model options",
      modality: "text",
      privacyClass: "public_safe",
    });
    expect(policy.sourceVerificationGate.mode).toBe("read_only");
    expect(policy.sourceVerificationGate.trustedStates).toEqual(["source_verified", "tested_pass"]);
    expect(policy.sourceVerificationGate.noActionTaken.join(" ")).toContain("No browser");
    expect(policy.capabilityMapSummary.sourceReadiness.missingSources).toBeGreaterThanOrEqual(1);
    expect(policy.capabilityMapSummary.sourceReadiness.needsSourceReview).toBeGreaterThanOrEqual(1);
    expect(route.decisionPath.find((step) => step.step === "Source")?.status).toBe("required_before_trust");
    expect(route.decisionPath.find((step) => step.step === "Eval")?.ownerAgent).toBe("spock");
  });
});
