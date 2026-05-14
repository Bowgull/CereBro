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
});
