import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

describe("Model Tools creative lanes", () => {
  it("keeps public creative lanes free of private-module surfaces", async () => {
    const caller = createCaller();
    const policy = await caller.modelTools.policy();

    const gojo = policy.creativeLanes.find((lane) => lane.id === "gojo_comfyui");
    const upscale = policy.creativeLanes.find((lane) => lane.id === "realesrgan_upscale");
    const normalMap = policy.capabilityMap.find((lane) => lane.id === "creative_normal");
    const serialized = JSON.stringify(policy).toLowerCase();

    expect(gojo?.tool).toBe("ComfyUI");
    expect(gojo?.ownerAgent).toBe("gojo");
    expect(gojo?.privacyLane).toBe("normal_creative");
    expect(gojo?.outputBoundary).toContain("CereBro vault");

    expect(normalMap?.ownerAgent).toBe("gojo");

    expect(upscale?.tool).toBe("RealESRGAN");
    expect(upscale?.approvalGate).toContain("source file");
    expect(serialized).not.toContain("raven");
  });
});
