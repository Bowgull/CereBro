export function workbenchReceiptBodyCopy({ hasDraft }: { hasDraft: boolean }) {
  return {
    title: "Receipt Body",
    subtitle: "Local body. Review, link, save.",
    badge: "local only",
    draftPrefix: hasDraft ? "Body draft." : "",
    draftText: hasDraft ? "Review it, then save the local receipt." : "",
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
