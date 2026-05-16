export function workbenchHeaderCopy({ isLoading }: { isLoading: boolean }) {
  return {
    subtitle: "Save the receipt body for what just happened.",
    statusText: isLoading ? "Reading Workbench state." : "Local receipts only. Risky moves still go through Security Gate.",
  };
}

export function workbenchCurrentBodyCopy() {
  return {
    label: "Current Body",
    badge: "manual receipt",
    title: "Write the body before summary.",
    text: "Pick a receipt type. Record the observation. Save the body.",
  };
}

export function workbenchProjectReceiptCopy({ open, total }: { open: boolean; total: number }) {
  return {
    title: "Project Receipts",
    subtitle: "Receipts that Project Lab can read before push decisions.",
    closedBadge: "open to read",
    openBadge: `${total} receipts`,
    readTitle: "Project Receipt Read",
    readSubtitle: "Local receipt state before push decisions.",
    loadingText: "Reading local receipt summary.",
    emptyText: "No project receipts exist yet. Save a local receipt, then link it to a project before using it for push context.",
    badge: open ? `${total} receipts` : "open to read",
  };
}

export function workbenchReceiptBodyCopy({ hasDraft }: { hasDraft: boolean }) {
  return {
    title: "Receipt Body",
    subtitle: "Local body. Review, link, save.",
    badge: "local only",
    draftPrefix: hasDraft ? "Body draft." : "",
    draftText: hasDraft ? "Review it, then save the local receipt." : "",
  };
}

export function workbenchReceiptChainCopy() {
  return {
    ariaLabel: "Workbench receipt chain",
    sourceStepLabel: (hasRouteTarget: boolean) => (hasRouteTarget ? "Route reads" : "Aang teaches"),
    emptySourceText: "no command link",
    bodyStepLabel: "Workbench body",
    draftBodyText: "draft body staged",
    emptyBodyText: "select or save a receipt",
    projectStepLabel: "Project Lab reads",
    emptyProjectText: "project not linked",
    footer: "Receipt body lives here. Ledger audits it. Project Lab reads the linked project before push decisions.",
  };
}

export function workbenchReceiptGroupCopy() {
  return {
    title: "Receipt Groups",
    subtitle: "Narrow the local list.",
    controlLabel: "Group by",
    gateText: "Local grouping. No source fetch. No command run.",
    emptyText: "No receipt groups match the current filters.",
    itemHint: "Matches stay local. Open a group to narrow the list.",
  };
}

export function workbenchReceiptListCopy() {
  return {
    readRulesTitle: "Read Gates",
  };
}

export function workbenchReceiptDetailCopy() {
  return {
    readTitle: "Receipt Read",
    readBadge: "local only",
    readRulesTitle: "Read Gates",
    securityTitle: "Security Check",
    noSecurityText: "No linked security check exists for this receipt. Open Security Gate when the target, source, command, or package needs risk review.",
  };
}
