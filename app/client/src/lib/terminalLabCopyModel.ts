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
    receiptDetailsTitle: "Receipt Read",
    receiptDetailsClosed: "open to read",
    boundaryTitle: "Action Boundary",
    boundaryText: "Terminal Lab explains and records. Commands run elsewhere through approval. Project Lab reads state. Workbench stores the body. Ledger audits it.",
    boundaryStateText: (executesGit: boolean, automationRequiresApproval: boolean) =>
      `Project Lab read only. Git action: ${executesGit ? "yes" : "no"}. Approval required: ${automationRequiresApproval ? "yes" : "no"}.`,
  };
}

export function terminalLabReceiptChainCopy() {
  return {
    ariaLabel: "Aang to Workbench receipt chain",
    firstStepLabel: "Aang teaches",
    emptyObservationText: "no observation selected",
    workbenchStepLabel: "Workbench body",
    emptyReceiptText: "receipt not saved",
    projectStepLabel: "Project read",
    emptyProjectText: "no project match",
    fallbackProjectValue: "project decision reading",
    footer: "Teaching path: Aang explains here. Save the body in Workbench. Read project context before any git decision.",
  };
}
