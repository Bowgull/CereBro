import { describe, expect, it } from "vitest";
import { outputsPanelCopy } from "../client/src/lib/outputsPanelCopyModel";

describe("outputsPanelCopyModel", () => {
  it("frames outputs without proof, artifact, or receipt language", () => {
    const copy = outputsPanelCopy();
    const combined = [
      copy.subtitle,
      copy.saveTitleEmpty,
      copy.saveTitleObsidian,
      copy.saveTitleVault,
      copy.emptyText,
      copy.detailsTitle,
      copy.savedVaultText("20_Knowledge/Capture/note.md"),
      copy.fallbackTitle(4),
      copy.locationLabel,
      copy.keepLabel,
    ].join(" ").toLowerCase();

    expect(copy.title).toBe("Saved Outputs");
    expect(copy.subtitle).toContain("destination and retention");
    expect(copy.kindLabel).toBe("Output type");
    expect(copy.detailsTitle).toBe("Output Details");
    expect(copy.savedVaultText("20_Knowledge/Capture/note.md")).toContain("Saved vault output");
    expect(copy.fallbackTitle(4)).toBe("Output 4");
    expect(copy.locationLabel).toBe("Destination");
    expect(copy.keepLabel).toBe("Retention");
    expect(combined).not.toContain("proof");
    expect(combined).not.toContain("receipt");
    expect(combined).not.toContain("artifact");
  });
});
