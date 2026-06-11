import { describe, expect, it } from "vitest";
import { cerebroBrand } from "@/lib/cerebroTheme";
import { cerebroColors } from "@/lib/keepConfig";

describe("cerebroBrand", () => {
  it("keeps the locked brass and green brand colors available", () => {
    expect(cerebroBrand.color.gold500).toBe("#c69b55");
    expect(cerebroBrand.color.green900).toBe("#08241d");
    expect(cerebroBrand.line.brass).toContain("198, 155, 85");
  });

  it("defines core surface treatments for app primitives", () => {
    expect(cerebroBrand.surface.app).toContain("radial-gradient");
    expect(cerebroBrand.surface.shell).toContain("radial-gradient");
    expect(cerebroBrand.surface.rail).toContain("linear-gradient");
    expect(cerebroBrand.surface.railActive).toContain("radial-gradient");
    expect(cerebroBrand.surface.address).toContain("linear-gradient");
    expect(cerebroBrand.shadow.bevel).toContain("inset");
  });

  it("routes existing shared colors through the locked brand layer", () => {
    expect(cerebroColors.background).toBe(cerebroBrand.color.ink950);
    expect(cerebroColors.gold).toBe(cerebroBrand.color.gold500);
    expect(cerebroColors.accent).toBe(cerebroBrand.color.green600);
  });
});
