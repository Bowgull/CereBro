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
  contractStateLabel: "read runnable" | "runner blocked" | "route blocked" | "contract blocked";
  readyText: string;
  runnerBoundary: string;
  showStageApproval: boolean;
  showOpenApproval: boolean;
  showStageBody: boolean;
  showOpenBody: boolean;
};

export function terminalExecutionActionModel(input: TerminalExecutionActionInput): TerminalExecutionActionModel {
  const missingText = input.missing.join("; ");
  const routeMissing = input.missing.includes("route record");
  const canRunReadOnly = input.canExecute && input.actionType === "local_read_only_command" && input.riskClass === "read_only";
  return {
    canRunReadOnly,
    runButtonLabel: canRunReadOnly ? "Run Approved Read" : "Read Run Gate",
    contractStateLabel: canRunReadOnly
      ? "read runnable"
      : input.canExecute
        ? "runner blocked"
        : routeMissing
          ? "route blocked"
          : "contract blocked",
    readyText: input.canExecute
      ? canRunReadOnly
        ? "Approved read-only contract is ready. This button runs one allowlisted local command and records a Ledger receipt."
        : "Contract is complete, but this action is not eligible for the V1 read-only runner."
      : routeMissing
        ? "Save the Aang route before execution. Terminal Lab cannot run work from a direct task alone."
      : missingText,
    runnerBoundary: canRunReadOnly
      ? "Runner boundary: allowlisted local read only. Shell disabled. Ledger receipt required."
      : routeMissing
        ? "Runner boundary: blocked until the Aang route spine is saved."
      : "Runner boundary: blocked until contract, risk, and allowlist checks pass.",
    showStageApproval: missingText.includes("approval receipt"),
    showOpenApproval: input.approvalId != null && !missingText.includes("approval receipt"),
    showStageBody: missingText.includes("Workbench receipt body"),
    showOpenBody: input.workbenchEvidenceId != null && !missingText.includes("Workbench receipt body"),
  };
}
