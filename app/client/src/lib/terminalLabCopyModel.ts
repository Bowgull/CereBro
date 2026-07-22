// Terminal Lab copy. Glossary (language pass, audit item 3):
// body → draft · receipt → record · gate → approval.
export function terminalLabProjectReadCopy() {
  return {
    headerBadge: "read only",
    headerMode: "Aang reads",
    headerOwner: "Tony drafts",
    headerSupport: "Spock approves",
    intentLine: "Terminal Lab explains commands before they run elsewhere through approval.",
    title: "Project Read",
    readStateLabel: "Decision",
    executionLabel: "Action",
    executionValue: (executesGit: boolean) => (executesGit ? "git action" : "read only"),
    manualLabel: "Manual",
    manualValue: "review first",
    bodyStatsLabel: "Drafts",
    bodyStatsClosed: "open to read",
    bodyStatsValue: (total: number, needsReview: number) => `${total} / ${needsReview} review`,
    receiptDetailsTitle: "Draft Read",
    receiptDetailsClosed: "open to read",
    receiptDetailsHeading: "Workbench Drafts",
    receiptDetailsReading: "Reading the Workbench draft summary.",
    receiptDetailsFooter: "Workbench holds the draft. The Ledger holds the history. Project Lab reads push context.",
    boundaryTitle: "Action Boundary",
    boundaryText: "Terminal Lab explains and records. Commands run elsewhere through approval. Project Lab reads state. Workbench stores drafts. The Ledger keeps the history.",
    boundaryStateText: (executesGit: boolean, automationRequiresApproval: boolean) =>
      `Project Lab read only. Git action: ${executesGit ? "yes" : "no"}. Approval required: ${automationRequiresApproval ? "yes" : "no"}.`,
  };
}

export function terminalLabReceiptChainCopy() {
  return {
    ariaLabel: "Aang to Workbench draft path",
    firstStepLabel: "Aang explains",
    emptyObservationText: "no observation selected",
    workbenchStepLabel: "Workbench draft",
    emptyReceiptText: "draft not saved",
    projectStepLabel: "Project read",
    emptyProjectText: "no project match",
    fallbackProjectValue: "project decision reading",
    footer: "Aang explains here. Save the draft in Workbench. Read project context before any git decision.",
  };
}

export function terminalLabObservationActionCopy() {
  return {
    drawerTitle: "Observation Next Steps",
    statusGroup: "Status",
    approvalGroup: "Approval",
    connectGroup: "Connect",
    receiptGroup: "Explain + Record",
    reviewButton: "Review",
    blockButton: "Block",
    approvalButton: "Approval Read",
    securityButton: "Security Check",
    selectedLinkButton: "Link Selected",
    taskButton: "Make Task",
    learningButton: "Learning Note",
    teachButton: "Aang Explains",
    workbenchBodyButton: "Workbench Draft",
    saveReceiptButton: "Save Record",
    ledgerButton: "Ledger",
    archiveButton: "Archive",
  };
}
