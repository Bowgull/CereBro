import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function caller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

describe("Raven sealed boundary", () => {
  it("blocks private-module requests in public CereBro without naming them back", async () => {
    const preview = await caller().commandIntake.preview({
      text: "raven keep building",
      mode: "build",
    });

    const serialized = JSON.stringify(preview).toLowerCase();
    expect(preview.category).toBe("private_module_blocked");
    expect(preview.sealedModule).toBeNull();
    expect(preview.taskDraft).toBeNull();
    expect(preview.originalText).toBe("Private Module Request");
    expect(preview.agents).toEqual(["cortana", "spock"]);
    expect(preview.permissionGates.join(" ")).toContain("No private module data is read.");
    expect(serialized).not.toContain("raven");
  });

  it("does not mistake building for the ui keyword", async () => {
    const preview = await caller().commandIntake.preview({
      text: "keep building CereBro",
      mode: "build",
    });

    expect(preview.category).toBe("project_build");
    expect(preview.projectMode).toBe("Build");
    expect(preview.designProtocol).toBeNull();
  });
});
