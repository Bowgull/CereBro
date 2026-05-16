export function projectLabGuideCopy({ receiptsOpen }: { receiptsOpen: boolean }) {
  return {
    title: "Project Map",
    status: receiptsOpen ? "local receipts" : "open to read",
  };
}

export function projectLabReceiptCopy({ receiptsOpen }: { receiptsOpen: boolean }) {
  return {
    cardLabel: receiptsOpen ? "receipts loaded" : "open to read",
    closedValue: "open to read",
    closedPushText: "Open Project Map to read the compact Workbench receipt summary before treating this as push evidence.",
  };
}

export function projectLabPushCopy() {
  return {
    buttonTitle: "Push Decision",
    buttonTooltip: "Read the push decision. Project Lab does not run git.",
    detailsTitle: "Decision Details",
    readButtonLabel: "Read",
    readButtonTooltip: "Open the push decision read. This is not a git action.",
    manualBlockTitle: "Manual Commands",
    manualBlockBadge: "review first",
    manualBlockText: "Use these after review. This panel never runs git.",
    noReceiptText: (pushLabel: string) => `No Workbench receipt is linked yet. ${pushLabel} is only a local status read until a receipt exists.`,
  };
}
