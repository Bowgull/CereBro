import { describe, expect, it } from "vitest";
import { sourceDisplayName } from "./displayLabels";

describe("display labels", () => {
  it("labels runtime route targets without exposing the raw URI as display text", () => {
    expect(sourceDisplayName("runtime_route:23")).toBe("Route #23");
  });
});
