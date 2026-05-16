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
