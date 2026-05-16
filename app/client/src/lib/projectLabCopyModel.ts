export function projectLabGuideCopy({ receiptsOpen }: { receiptsOpen: boolean }) {
  return {
    title: "Project Map",
    status: receiptsOpen ? "local bodies" : "open to read",
  };
}

export function projectLabReceiptCopy({ receiptsOpen }: { receiptsOpen: boolean }) {
  return {
    cardLabel: receiptsOpen ? "bodies loaded" : "open to read",
    closedValue: "open to read",
    statLabel: "Bodies",
    statValueClosed: "open",
    closedPushText: "Open Project Map to read the compact Workbench body summary before treating this as push evidence.",
    mapRowLabel: "Body",
    mapRowValue: (total: number, needsReview: number) => `${total} Workbench / ${needsReview} review`,
    metaLabel: "Bodies",
    metaValue: (total: number, needsReview: number) => `${total} bodies / ${needsReview} review`,
    chainAria: "Project Lab context path",
    chainTerminalLabel: "Terminal read",
    chainTerminalValue: (terminal: number) => terminal > 0 ? `${terminal} command note${terminal === 1 ? "" : "s"}` : "no command notes",
    chainBodyLabel: "Workbench body",
    chainBodyValue: (total: number, needsReview: number) => `${total} bodies / ${needsReview} review`,
    chainContextLabel: "Project context",
    chainNote: "Project Lab reads context only. Workbench has the body. Terminal has the command observation.",
  };
}

export function projectLabPushCopy() {
  return {
    buttonTitle: "Push Decision",
    buttonTooltip: "Read the push decision. Project Lab does not run git.",
    buttonAria: (projectName: string) => `Show push decision for ${projectName}`,
    detailsTitle: "Decision Details",
    readButtonLabel: "Read",
    readButtonTooltip: "Open the push decision read. This is not a git action.",
    readButtonAria: (projectName: string) => `Open push decision for ${projectName}`,
    manualBlockTitle: "Manual Commands",
    manualBlockBadge: "review first",
    manualBlockText: "Use these after review. This panel never runs git.",
    noBodyText: (pushLabel: string) => `No Workbench body is linked yet. ${pushLabel} is only a local status read until a body exists.`,
    reviewText: (needsReview: number) =>
      `${needsReview} Workbench bod${needsReview === 1 ? "y needs" : "ies need"} review. Check the Workbench body and Ledger audit trail before commit.`,
    supportedText: (validated: number, pushLabel: string) =>
      `${validated} checked bod${validated === 1 ? "y" : "ies"} support ${pushLabel.toLowerCase()}. Review the staged diff before pushing.`,
    presentText: (total: number) =>
      `${total} bod${total === 1 ? "y exists" : "ies exist"}. Use Workbench for bodies and Ledger for the audit trail.`,
    missingLabel: "body missing",
    presentLabel: "body present",
  };
}
