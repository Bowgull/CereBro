import { describe, expect, it } from "vitest";
import {
  ledgerKindLabel,
  ledgerNavCopy,
  ledgerOverviewCopy,
  ledgerReceiptSummary,
  ledgerRouteText,
} from "../client/src/lib/ledgerCopyModel";

describe("ledgerCopyModel", () => {
  it("frames Ledger as an audit trail without proof language", () => {
    const nav = ledgerNavCopy();
    const overview = ledgerOverviewCopy();
    const combined = [
      ...Object.values(nav),
      overview.title,
      overview.subtitle,
      overview.cardMeta.outputs,
      overview.cardMeta.routes,
      overview.cardMeta.workbench(2),
      overview.routeSectionTitle,
      overview.routeLoadingText,
      overview.routeEmptyText,
      overview.receiptSectionTitle,
      overview.receiptLoadingText,
      overview.receiptEmptyText,
      overview.receiptPath,
      overview.memoryContractTitle,
      overview.memoryContractBadge,
      overview.rulesBody,
      overview.rules.external.body,
      overview.rules.memory.body,
      overview.rules.output.body,
    ].join(" ").toLowerCase();

    expect(nav.blurb).toBe("Audit what happened.");
    expect(overview.subtitle).toContain("Local audit trail");
    expect(overview.cardMeta.outputs).toBe("saved outputs");
    expect(overview.cardMeta.routes).toBe("saved route reads");
    expect(overview.routeSectionTitle).toBe("Recent Route Reads");
    expect(overview.routeActionsTitle).toBe("Next Actions");
    expect(overview.auditReadBadge).toBe("audit read only");
    expect(overview.memoryContractTitle).toBe("Memory Reuse Read");
    expect(combined).not.toContain("proof");
    expect(combined).not.toContain("artifact receipts");
    expect(combined).not.toContain("route receipts");
    expect(combined).not.toContain("safe actions");
    expect(combined).not.toContain("aang to cortana reads");
  });

  it("keeps receipt rows out of metadata language", () => {
    const summary = ledgerReceiptSummary("Metadata-only note for a temporary video frame. Video bytes were not saved.");

    expect(summary).toBe("Local video frame note. Video bytes were not saved.");
    expect(ledgerKindLabel("terminal_output")).toBe("terminal output");
    expect(`${summary} ${ledgerKindLabel("image_review")}`.toLowerCase()).not.toContain("metadata");
  });

  it("softens old route text that contains proof language", () => {
    const display = ledgerRouteText("continue CereBro staged route receipt proof");

    expect(display).toBe("continue CereBro staged route receipt audit note");
    expect(display.toLowerCase()).not.toContain("proof");
  });
});
