import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { isExactRavenSealedLauncherPhrase, ravenSealedLauncherUrl } from "../client/src/lib/ravenSealedLauncher";

function caller() {
  return appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
  });
}

describe("Raven sealed boundary", () => {
  it("keeps the launcher exact and local", () => {
    expect(isExactRavenSealedLauncherPhrase("execute order 66")).toBe(true);
    expect(isExactRavenSealedLauncherPhrase("open raven")).toBe(false);
    expect(ravenSealedLauncherUrl).toBe("http://127.0.0.1:5174/?handoff=aang");
  });

  it("does not route Raven as a normal CereBro agent", async () => {
    const preview = await caller().commandIntake.preview({
      text: "raven keep building",
      mode: "build",
    });

    expect(preview.category).toBe("raven_build");
    expect(preview.sealedModule).toBe("raven");
    expect(preview.agents).not.toContain("raven");
    expect(preview.agents).toEqual(expect.arrayContaining(["cortana", "spock", "oak", "batman"]));
    expect(preview.permissionGates.join(" ")).toContain("Raven work stays inside the sealed private module.");
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
