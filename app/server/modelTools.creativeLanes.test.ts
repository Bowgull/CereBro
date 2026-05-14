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
  it("keeps Gojo and Raven ComfyUI lanes separate before any install", async () => {
    const caller = createCaller();
    const policy = await caller.modelTools.policy();

    const gojo = policy.creativeLanes.find((lane) => lane.id === "gojo_comfyui");
    const raven = policy.creativeLanes.find((lane) => lane.id === "raven_private_comfyui");
    const upscale = policy.creativeLanes.find((lane) => lane.id === "realesrgan_upscale");

    expect(gojo?.tool).toBe("ComfyUI");
    expect(gojo?.ownerAgent).toBe("gojo");
    expect(gojo?.privacyLane).toBe("normal_creative");
    expect(gojo?.outputBoundary).toContain("CereBro vault");

    expect(raven?.tool).toBe("ComfyUI");
    expect(raven?.ownerAgent).toBe("raven");
    expect(raven?.privacyLane).toBe("sealed_private");
    expect(raven?.outputBoundary).toContain("Raven private");
    expect(raven?.canEnterCereBroMemory).toBe(false);
    expect(raven?.requiresSeparateChat).toBe(true);

    expect(upscale?.tool).toBe("RealESRGAN");
    expect(upscale?.approvalGate).toContain("source file");
    expect(policy.gates.join(" ")).toContain("Raven outputs stay outside normal CereBro memory");
  });
});
