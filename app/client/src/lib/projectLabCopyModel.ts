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
