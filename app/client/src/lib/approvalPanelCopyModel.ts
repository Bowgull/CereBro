export function approvalPanelCopy() {
  return {
    title: "Waiting Gates",
    subtitle: "Review decisions waiting on you. Nothing runs from this queue.",
    summaryAria: "Approval gate summary",
    stats: {
      pending: "Waiting",
      sensitive: "Sensitive",
      checks: "Checks",
      blocked: "Blocked",
      closed: "closed",
    },
    searchLabel: "Search waiting gates",
    searchPlaceholder: "Search action, project, reason, command, capture, source.",
    projectFilterLabel: "Filter waiting gates by project",
    resetAria: "Reset waiting-gate filters to pending local decisions",
    resetTitle: "Reset filters. This does not approve, reject, or change waiting decisions.",
    originFiltersAria: "Waiting-gate origin filters",
    statusFiltersAria: "Waiting-gate status filters",
    groupsAria: "Waiting-gate groups",
    groupsTitle: "Groups",
    groupsSubtitle: "Filter waiting decisions.",
    groupSelectLabel: "Group waiting gates",
    groupLoading: "Reading local gate groups.",
    groupEmpty: "No groups match these filters.",
    groupFilterAria: (label: string) => `Filter waiting gates by ${label}`,
    groupFilterTitle: (label: string) => `Filter local waiting gates by ${label}. No decision runs.`,
    groupCount: (count: number) => `${count} decisions`,
    groupSensitive: (count: number) => `${count} sensitive`,
    groupRecentMatches: (count: number) => `${count} recent match${count === 1 ? "" : "es"}`,
    localOnly: "Local read only. No approval action.",
    gateStatus: (count: number, status: string, sensitive: number) =>
      `Showing ${count} ${status} decision${count === 1 ? "" : "s"}. Sensitive ${sensitive}.`,
    gateLoading: "Reading local waiting gates.",
    checksAria: "Permission check audit records",
    checksTitle: "Permission Checks",
    checksSubtitle: "Local gate checks.",
    openToRead: "open to read",
    records: (count: number) => `${count} records`,
    gated: (count: number) => `${count} gated`,
    auditHistory: "Audit history. Check record only.",
    checkLoading: "Reading local check records.",
    checkEmpty: "No permission check records match these filters.",
    checkChip: "gate check",
    checkedChip: "gate checked",
    empty: "No waiting decisions match these filters. Reset filters or stage a decision from Hedwig, Terminal Lab, Project Lab, Sources, or Model Tools.",
    listAria: "Waiting decision list",
    detailAria: "Waiting decision notes",
    selectEmpty: "Select a waiting decision to inspect notes.",
    selectedLoading: "Reading selected decision.",
    selectedMissing: "Selected waiting decision was not found. Reset filters.",
    decisionSection: "Decision",
    policyCheckLabel: "Gate Check",
    permissionCheckTitle: "Permission Check",
    permissionCheckMissing: "No linked permission check record exists for this waiting decision yet.",
    oakNotesDetail: "risk read",
    contextDetail: "local record",
    chainTitle: "Review Path",
    chainDetail: "next read",
    chainCheckLabel: "Check",
    chainNextLabel: "Next Read",
    securityTitle: "Open Security Gate for this target. Approval Queue does not execute it.",
    securityReceiptTitle: "Open Security Gate for this target. Approval Queue does not execute it.",
  };
}

export function approvalRunnerStateCopy(input: {
  actionType: string | null | undefined;
  costRisk: string | null | undefined;
  origin: string | null | undefined;
  targetType: string | null | undefined;
}) {
  const isGitWrite =
    input.actionType === "project_manual_push"
    || input.costRisk === "git_remote_write"
    || (input.origin === "project_lab" && input.targetType === "project");

  if (isGitWrite) {
    return {
      label: "runner blocked",
      tone: "warning" as const,
      body: "Approval records the decision only. Git remote writes stay manual in V1.",
    };
  }

  return {
    label: "review gate",
    tone: "accent" as const,
    body: "Approval records the decision. This queue does not execute work.",
  };
}
