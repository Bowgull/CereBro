export function projectLabGuideCopy({ receiptsOpen }: { receiptsOpen: boolean }) {
  return {
    title: "Project Map",
    status: receiptsOpen ? "local bodies" : "open to read",
  };
}

export function projectLabReceiptCopy({ receiptsOpen }: { receiptsOpen: boolean }) {
  return {
    cardLabel: receiptsOpen ? "bodies loaded" : "open to read",
    closedValue: "open to read",
    statLabel: "Bodies",
    statValueClosed: "open",
    closedPushText: "Open Project Map to read the compact Workbench body summary before treating this as push evidence.",
    mapRowLabel: "Body",
    mapRowValue: (total: number, needsReview: number) => `${total} Workbench / ${needsReview} review`,
    metaLabel: "Bodies",
    metaValue: (total: number, needsReview: number) => `${total} bodies / ${needsReview} review`,
    chainAria: "Project Lab context path",
    chainTerminalLabel: "Terminal read",
    chainTerminalValue: (terminal: number) => terminal > 0 ? `${terminal} command note${terminal === 1 ? "" : "s"}` : "no command notes",
    chainBodyLabel: "Workbench body",
    chainBodyValue: (total: number, needsReview: number) => `${total} bodies / ${needsReview} review`,
    chainContextLabel: "Project context",
    chainNote: "Project Lab reads context only. Workbench has the body. Terminal has the command observation.",
  };
}

export function projectLabPushCopy() {
  return {
    buttonTitle: "Push Decision",
    buttonTooltip: "Read the push decision. Project Lab does not run git.",
    buttonAria: (projectName: string) => `Show push decision for ${projectName}`,
    detailsTitle: "Decision Details",
    readButtonLabel: "Read",
    readButtonTooltip: "Open the push decision read. This is not a git action.",
    readButtonAria: (projectName: string) => `Open push decision for ${projectName}`,
    manualBlockTitle: "Manual Commands",
    manualBlockBadge: "review first",
    manualBlockText: "Use these after review. This panel never runs git.",
    noBodyText: (pushLabel: string) => `No Workbench body is linked yet. ${pushLabel} is only a local status read until a body exists.`,
    reviewText: (needsReview: number) =>
      `${needsReview} Workbench bod${needsReview === 1 ? "y needs" : "ies need"} review. Check the Workbench body and Ledger audit trail before commit.`,
    supportedText: (validated: number, pushLabel: string) =>
      `${validated} checked bod${validated === 1 ? "y" : "ies"} support ${pushLabel.toLowerCase()}. Review the staged diff before pushing.`,
    presentText: (total: number) =>
      `${total} bod${total === 1 ? "y exists" : "ies exist"}. Use Workbench for bodies and Ledger for the audit trail.`,
    missingLabel: "body missing",
    presentLabel: "body present",
  };
}

export function projectLabPushContractCopy(input: {
  contractId: number | null;
  approvalStatus: string | null;
  canRunInV1: boolean;
  missing?: string[];
}) {
  const routeMissing = input.missing?.includes("route record") ?? false;

  if (input.canRunInV1) {
    return {
      stateLabel: "runner open",
      stateTone: "danger" as const,
      body: input.contractId == null
        ? "No contract exists."
        : `Contract #${input.contractId}. Approval ${input.approvalStatus ?? "unknown"}. Runner policy must be rechecked before any git action.`,
    };
  }

  if (routeMissing) {
    return {
      stateLabel: "route blocked",
      stateTone: "warning" as const,
      body: input.contractId == null
        ? "Save the Aang route before creating a push contract. The V1 runner still blocks git remote writes."
        : `Contract #${input.contractId}. Approval ${input.approvalStatus ?? "unknown"}. Save the Aang route first; git remote writes stay manual.`,
    };
  }

  return {
    stateLabel: "runner blocked",
    stateTone: "warning" as const,
    body: input.contractId == null
      ? "Create approval receipt and execution proposal. The V1 runner still blocks git remote writes."
      : `Contract #${input.contractId}. Approval ${input.approvalStatus ?? "unknown"}. V1 records the decision only. Git remote writes stay manual.`,
  };
}

export function projectLabPushContractActionCopy(input: { contractId: number | null }) {
  if (input.contractId == null) {
    return {
      label: "Create contract",
      shouldCreateContract: true,
      notice: "Create a local approval receipt and execution proposal. No git command runs.",
    };
  }

  return {
    label: "Read contract",
    shouldCreateContract: false,
    notice: `Contract #${input.contractId} is already open in Project Lab. No git command ran.`,
  };
}
