import { describe, expect, it } from "vitest";
import { homeShellCopy, homeShellNextActionCopy } from "../client/src/lib/homeShellCopyModel";

describe("homeShellCopyModel", () => {
  it("keeps Workshop and Terminal shell labels aligned to the current body path", () => {
    const copy = homeShellCopy();

    expect(copy.zoneBlurbs.workshop).toBe("Do the work with bodies and reads.");
    expect(copy.surfaceMeta.terminal).toBe("Command teaching");
    expect(copy.zoneMarkers.workshop).toEqual(["bodies", "tools", "validation"]);
    expect(copy.zoneMarkerLabel).toBe("surface markers");
    expect(Object.values(copy.zoneBlurbs).join(" ").toLowerCase()).not.toContain("do the work with receipts");
    expect(Object.values(copy.surfaceMeta).join(" ").toLowerCase()).not.toContain("command previews");
  });

  it("keeps context next actions plain and body-oriented", () => {
    expect(homeShellNextActionCopy("home", 1, "build")).toBe("Open Project Lab to inspect active work and push decisions.");
    expect(homeShellNextActionCopy("projects", 0, "build")).toBe("Check branch, dirty state, risks, bodies, and manual push decisions.");
    expect(homeShellNextActionCopy("ledger", 0, "quick")).toBe("Read the audit trail first. Open Workbench for bodies or Project Lab for push context.");
    expect(homeShellNextActionCopy("unknown", 0, "quick")).toBe("Keep the route visible. Use Workbench for the body and Ledger for the audit trail.");
  });
});
