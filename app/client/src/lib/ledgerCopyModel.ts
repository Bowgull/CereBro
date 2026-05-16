export function ledgerNavCopy() {
  return {
    blurb: "Audit what happened.",
  };
}

export function ledgerOverviewCopy() {
  return {
    title: "Ledger Overview",
    subtitle: "Local audit trail. Select a receipt to inspect body, project, validation, and next step.",
    routeSectionTitle: "Recent Route Receipts",
    routeLoadingText: "Reading local route receipts.",
    routeEmptyText: "No route receipts yet. Ask Aang to read a request, then save the route before work starts.",
    routeActionsTitle: "Next Actions",
    noExecutionText: "no execution",
    receiptSectionTitle: "Latest Workbench Receipts",
    workbenchButton: "Open Workbench Bodies",
    workbenchButtonTitle: "Open Workbench. Ledger stays read-only.",
    workbenchButtonAria: "Open Workbench receipt bodies. Ledger stays read-only.",
    receiptLoadingText: "Reading local Workbench receipts.",
    receiptEmptyText: "No Workbench receipts yet. Open Workbench Bodies and save the first local receipt.",
    focusedReceiptEmptyText: (projectName: string | null | undefined) =>
      `No local Workbench receipts are linked to ${projectName ?? "this project"} in the current Ledger read.`,
    selectedAriaLabel: "Selected Workbench receipt audit",
    auditReadBadge: "audit read only",
    receiptPath: "Receipt path: Workbench holds the body. Ledger holds the audit trail. Project Lab reads push context.",
    rulesTitle: "Ledger Rules",
    rulesBody: "Receipt before summary. Workbench holds bodies. Ledger holds the audit trail. Project Lab reads push context.",
  };
}

export function ledgerRouteText(text: string) {
  return text.replace(/\bproof\b/gi, "audit note");
}

export function ledgerReceiptSummary(summary: string) {
  return summary
    .replace(/^Metadata-only note for a temporary image preview\./i, "Local image preview note.")
    .replace(/^Metadata-only note for a temporary video frame\./i, "Local video frame note.")
    .replace(/\bmetadata-only\b/gi, "preview-only")
    .replace(/\bproof\b/gi, "audit note");
}

export function ledgerKindLabel(kind: string) {
  const labels: Record<string, string> = {
    manual_note: "manual note",
    image_review: "image review",
    video_frame: "video frame",
    annotation: "annotation",
    validation_note: "validation note",
    terminal_output: "terminal output",
    before_after: "before after",
    route_preview: "route preview",
  };

  return labels[kind] ?? kind.replace(/_/g, " ");
}
