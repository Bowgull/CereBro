export function terminalLabProjectReadCopy() {
  return {
    headerBadge: "read only lane",
    headerMode: "Aang reads",
    headerOwner: "Tony drafts",
    headerSupport: "Spock gates",
    intentLine: "Terminal Lab reads commands before they run elsewhere through approval.",
    title: "Project Read",
    readStateLabel: "Decision",
    executionLabel: "Action",
    executionValue: (executesGit: boolean) => (executesGit ? "git action" : "read only"),
    manualLabel: "Manual",
    manualValue: "review first",
    bodyStatsLabel: "Bodies",
    bodyStatsClosed: "open to read",
    bodyStatsValue: (total: number, needsReview: number) => `${total} / ${needsReview} review`,
    receiptDetailsTitle: "Body Read",
    receiptDetailsClosed: "open to read",
    receiptDetailsHeading: "Workbench Bodies",
    receiptDetailsReading: "Reading Workbench body summary.",
    receiptDetailsFooter: "Workbench has the body. Ledger has the audit trail. Project Lab reads push context.",
    boundaryTitle: "Action Boundary",
    boundaryText: "Terminal Lab explains and records. Commands run elsewhere through approval. Project Lab reads state. Workbench stores the body. Ledger audits it.",
    boundaryStateText: (executesGit: boolean, automationRequiresApproval: boolean) =>
      `Project Lab read only. Git action: ${executesGit ? "yes" : "no"}. Approval required: ${automationRequiresApproval ? "yes" : "no"}.`,
  };
}

export function terminalLabReceiptChainCopy() {
  return {
    ariaLabel: "Aang to Workbench body path",
    firstStepLabel: "Aang teaches",
    emptyObservationText: "no observation selected",
    workbenchStepLabel: "Workbench body",
    emptyReceiptText: "body not saved",
    projectStepLabel: "Project read",
    emptyProjectText: "no project match",
    fallbackProjectValue: "project decision reading",
    footer: "Teaching path: Aang explains here. Save the body in Workbench. Read project context before any git decision.",
  };
}

export function terminalLabObservationActionCopy() {
  return {
    drawerTitle: "Observation Next Steps",
    statusGroup: "Status",
    approvalGroup: "Approval",
    connectGroup: "Connect",
    receiptGroup: "Teach + Receipt",
    reviewButton: "Review",
    blockButton: "Block",
    approvalButton: "Approval Read",
    securityButton: "Security Gate",
    selectedLinkButton: "Link Selected",
    taskButton: "Make Task",
    learningButton: "Learning Note",
    teachButton: "Aang Teach",
    workbenchBodyButton: "Workbench Body",
    saveReceiptButton: "Receipt Body",
    ledgerButton: "Ledger",
    archiveButton: "Archive",
  };
}
