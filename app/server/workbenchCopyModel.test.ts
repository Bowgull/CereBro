import { describe, expect, it } from "vitest";
import {
  workbenchCurrentBodyCopy,
  workbenchHeaderCopy,
  workbenchProjectReceiptCopy,
  workbenchReceiptBodyCopy,
  workbenchReceiptChainCopy,
  workbenchReceiptDetailCopy,
  workbenchReceiptDetailsCopy,
  workbenchReceiptGroupCopy,
  workbenchReceiptListCopy,
  workbenchTemporaryPreviewCopy,
} from "../client/src/lib/workbenchCopyModel";

describe("workbenchCopyModel", () => {
  it("keeps the Workbench header focused on receipt bodies", () => {
    const ready = workbenchHeaderCopy({ isLoading: false });
    const loading = workbenchHeaderCopy({ isLoading: true });

    expect(ready.subtitle).toBe("Save the receipt body for what just happened.");
    expect(ready.statusText).toContain("Local receipts only");
    expect(loading.statusText).toBe("Reading Workbench state.");
    expect(Object.values(ready).join(" ").toLowerCase()).not.toContain("proof");
  });

  it("keeps the current move card named as the current body", () => {
    const copy = workbenchCurrentBodyCopy();

    expect(copy.label).toBe("Current Body");
    expect(copy.title).toBe("Write the body before summary.");
    expect(copy.text).toBe("Pick a receipt type. Record the observation. Save the body.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("proof");
  });

  it("names project receipt reads without proof language", () => {
    const closed = workbenchProjectReceiptCopy({ open: false, total: 12 });
    const open = workbenchProjectReceiptCopy({ open: true, total: 12 });

    expect(closed.title).toBe("Project Receipts");
    expect(closed.badge).toBe("open to read");
    expect(open.badge).toBe("12 receipts");
    expect(open.readTitle).toBe("Project Receipt Read");
    expect(Object.values(open).join(" ").toLowerCase()).not.toContain("proof");
  });

  it("names the primary Workbench form as a receipt body", () => {
    const copy = workbenchReceiptBodyCopy({ hasDraft: false });

    expect(copy.title).toBe("Receipt Body");
    expect(copy.subtitle).toBe("Local body. Review, link, save.");
    expect(copy.badge).toBe("local only");
  });

  it("uses plain staged-draft copy without machinery language", () => {
    const copy = workbenchReceiptBodyCopy({ hasDraft: true });

    expect(copy.draftPrefix).toBe("Body draft.");
    expect(copy.draftText).toBe("Review it, then save the local receipt.");
  });

  it("names receipt setup details without metadata language", () => {
    const copy = workbenchReceiptDetailsCopy();

    expect(copy.title).toBe("Receipt Details");
    expect(copy.routeLabel).toBe("Assigned Agent");
    expect(copy.permissionLabel).toBe("Review Type");
    expect(copy.viewportPlaceholder).toContain("Screen size");
    expect(copy.coordinatesPlaceholder).toContain("Marked area");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("metadata");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("permission class");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("route agent");
  });

  it("names temporary media as a temporary preview while preserving gates", () => {
    const copy = workbenchTemporaryPreviewCopy();

    expect(copy.title).toBe("Temporary Preview");
    expect(copy.statusText).toBe("Local browser preview. No upload. No vault save. No vision model.");
    expect(copy.chooseButton).toBe("Choose File");
    expect(copy.selectedText).toContain("It does not save the media bytes.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("temporary media");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("browser-memory");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("target metadata");
  });

  it("keeps receipt grouping plain and out of proof language", () => {
    const copy = workbenchReceiptGroupCopy();

    expect(copy.title).toBe("Receipt Groups");
    expect(copy.subtitle).toBe("Narrow the local list.");
    expect(copy.controlLabel).toBe("Group by");
    expect(copy.emptyText).toBe("No receipt groups match the current filters.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("query proof");
  });

  it("keeps selected receipt detail plain while preserving gates", () => {
    const copy = workbenchReceiptDetailCopy();

    expect(copy.readTitle).toBe("Receipt Read");
    expect(copy.readBadge).toBe("local only");
    expect(copy.readRulesTitle).toBe("Read Gates");
    expect(copy.securityTitle).toBe("Security Check");
    expect(copy.noSecurityText).toContain("Open Security Gate");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("preflight");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("proof read");
  });

  it("uses the same plain read-gate title in the receipt list", () => {
    const copy = workbenchReceiptListCopy();

    expect(copy.readRulesTitle).toBe("Read Gates");
  });

  it("keeps the Workbench chain Aang-first for command-linked receipts", () => {
    const copy = workbenchReceiptChainCopy();

    expect(copy.sourceStepLabel(false)).toBe("Aang teaches");
    expect(copy.sourceStepLabel(true)).toBe("Route reads");
    expect(copy.bodyStepLabel).toBe("Workbench body");
    expect(copy.footer).toBe("Receipt body lives here. Ledger audits it. Project Lab reads the linked project before push decisions.");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("terminal explains");
    expect(Object.values(copy).join(" ").toLowerCase()).not.toContain("proof");
  });
});
