export type TerminalExecutionActionInput = {
  canExecute: boolean;
  actionType: string;
  riskClass: string;
  missing: string[];
  approvalId: number | null;
  workbenchEvidenceId: number | null;
};

export type TerminalExecutionActionModel = {
  canRunReadOnly: boolean;
  runButtonLabel: "Run Approved Read" | "Read Run Gate";
  readyText: string;
  runnerBoundary: string;
  showStageApproval: boolean;
  showOpenApproval: boolean;
  showStageBody: boolean;
  showOpenBody: boolean;
};

export function terminalExecutionActionModel(input: TerminalExecutionActionInput): TerminalExecutionActionModel {
  const missingText = input.missing.join("; ");
  const canRunReadOnly = input.canExecute && input.actionType === "local_read_only_command" && input.riskClass === "read_only";
  return {
    canRunReadOnly,
    runButtonLabel: canRunReadOnly ? "Run Approved Read" : "Read Run Gate",
    readyText: input.canExecute
      ? canRunReadOnly
        ? "Approved read-only contract is ready. This button runs one allowlisted local command and records a Ledger receipt."
        : "Contract is complete, but this action is not eligible for the V1 read-only runner."
      : missingText,
    runnerBoundary: canRunReadOnly
      ? "Runner boundary: allowlisted local read only. Shell disabled. Ledger receipt required."
      : "Runner boundary: blocked until contract, risk, and allowlist checks pass.",
    showStageApproval: missingText.includes("approval receipt"),
    showOpenApproval: input.approvalId != null && !missingText.includes("approval receipt"),
    showStageBody: missingText.includes("Workbench receipt body"),
    showOpenBody: input.workbenchEvidenceId != null && !missingText.includes("Workbench receipt body"),
  };
}
