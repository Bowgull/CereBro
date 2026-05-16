export function ledgerNavCopy() {
  return {
    blurb: "Audit what happened.",
  };
}

export function ledgerOverviewCopy() {
  return {
    title: "Ledger Overview",
    subtitle: "Local audit trail. Select a saved body to inspect project, validation, and next step.",
    cardsAria: "Ledger audit objects",
    cardMeta: {
      tasks: (total: number) => `${total} total work records`,
      sessions: (recent: number) => `${recent} recent runs`,
      approvals: "pending gates",
      outputs: "saved outputs",
      workbench: (terminal: number) => `${terminal} terminal notes`,
      routes: "saved route reads",
      memory: (proposed: number) => `${proposed} proposed`,
    },
    routeSectionTitle: "Recent Route Reads",
    routeLoadingText: "Reading local route reads.",
    routeEmptyText: "No route reads yet. Ask Aang to read a request, then save the route before work starts.",
    routeActionsTitle: "Next Actions",
    noExecutionText: "no execution",
    receiptSectionTitle: "Latest Workbench Bodies",
    workbenchButton: "Open Workbench Bodies",
    workbenchButtonTitle: "Open Workbench. Ledger stays read-only.",
    workbenchButtonAria: "Open Workbench bodies. Ledger stays read-only.",
    receiptLoadingText: "Reading local Workbench bodies.",
    receiptEmptyText: "No Workbench bodies yet. Open Workbench Bodies and save the first local body.",
    focusedReceiptEmptyText: (projectName: string | null | undefined) =>
      `No local Workbench bodies are linked to ${projectName ?? "this project"} in the current Ledger read.`,
    selectedAriaLabel: "Selected Workbench body audit",
    auditReadBadge: "audit read only",
    receiptPath: "Path: Workbench holds the body. Ledger holds the audit trail. Project Lab reads push context.",
    rulesTitle: "Ledger Rules",
    rulesBody: "Saved body before summary. Workbench holds bodies. Ledger holds the audit trail. Project Lab reads push context.",
    rules: {
      external: {
        title: "External action",
        body: "Needs a waiting gate before it runs.",
      },
      memory: {
        title: "Memory",
        body: "Needs source, approval, and Oak status before reuse.",
      },
      output: {
        title: "Output",
        body: "Needs owner, destination, write policy, and saved path.",
      },
    },
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
