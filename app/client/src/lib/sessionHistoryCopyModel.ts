export function sessionHistoryCopy() {
  return {
    title: "Run History",
    subtitle: "Local audit trail for when work started, ended, and which project owned it.",
    loadingText: "Reading run history.",
    emptyText: "No runs recorded. Start work in a project and the run will appear here.",
    columns: {
      project: "Project",
      agent: "Agent",
      status: "Status",
      started: "Started",
      duration: "Duration",
      run: "Run",
      actions: "Actions",
    },
    editTitle: "Edit local run title and notes.",
    editAria: (displayName: string) => `Edit run history row ${displayName}`,
    titlePlaceholder: "Run title",
    notesPlaceholder: "Run notes",
    cancelTitle: "Discard local run edits.",
    saveTitle: "Save local run title and notes. This does not change the transcript.",
    saveAria: (displayName: string) => `Save run edits for ${displayName}`,
  };
}
