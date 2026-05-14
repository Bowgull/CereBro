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
    expect(ollama?.tool).toBe("Ollama");
    expect(ollama?.defaultUse).toContain("summaries");
    expect(ollama?.installStatus).toBe("not_verified");
    expect(ollama?.approvalGate).toContain("approval before install");
    expect(embedding?.modelClass).toBe("embedding");
    expect(policy.gates.join(" ")).toContain("Ollama stays on the core local-first path");

    expect(route.recommendedLane).toBe("ollama_local_fast_lane");
    expect(route.lanes[0]?.lane).toBe("ollama_local_fast_lane");
    expect(route.lanes[0]?.status).toBe("not_verified_no_install");
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
  });
});
