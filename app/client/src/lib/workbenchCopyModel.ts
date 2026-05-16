export function workbenchReceiptBodyCopy({ hasDraft }: { hasDraft: boolean }) {
  return {
    title: "Receipt Body",
    subtitle: "Local body. Review, link, save.",
    badge: "local only",
    draftPrefix: hasDraft ? "Body draft." : "",
    draftText: hasDraft ? "Review it, then save the local receipt." : "",
  };
}
