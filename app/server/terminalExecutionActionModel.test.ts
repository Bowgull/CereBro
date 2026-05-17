import { describe, expect, it } from "vitest";
import { terminalExecutionActionModel } from "../client/src/lib/terminalExecutionActionModel";

describe("terminalExecutionActionModel", () => {
  it("shows ready approved read-only contracts as runnable through the approved read lane", () => {
    const model = terminalExecutionActionModel({
      canExecute: true,
      actionType: "local_read_only_command",
      riskClass: "read_only",
      missing: [],
      approvalId: 44,
      workbenchEvidenceId: 55,
    });

    expect(model.canRunReadOnly).toBe(true);
    expect(model.runButtonLabel).toBe("Run Approved Read");
    expect(model.readyText).toContain("records a Ledger receipt");
    expect(model.showOpenApproval).toBe(true);
    expect(model.showOpenBody).toBe(true);
    expect(model.showStageApproval).toBe(false);
    expect(model.showStageBody).toBe(false);
  });

  it("routes blocked contracts to missing approval and body actions", () => {
    const model = terminalExecutionActionModel({
      canExecute: false,
      actionType: "local_read_only_command",
      riskClass: "read_only",
      missing: ["Workbench receipt body", "approval receipt"],
      approvalId: null,
      workbenchEvidenceId: null,
    });

    expect(model.canRunReadOnly).toBe(false);
    expect(model.runButtonLabel).toBe("Read Run Gate");
    expect(model.readyText).toBe("Workbench receipt body; approval receipt");
    expect(model.showStageApproval).toBe(true);
    expect(model.showStageBody).toBe(true);
    expect(model.showOpenApproval).toBe(false);
    expect(model.showOpenBody).toBe(false);
  });

  it("keeps complete mutating or git-write contracts off the V1 read-only runner", () => {
    const model = terminalExecutionActionModel({
      canExecute: true,
      actionType: "project_manual_push",
      riskClass: "git_remote_write",
      missing: [],
      approvalId: 66,
      workbenchEvidenceId: 77,
    });

    expect(model.canRunReadOnly).toBe(false);
    expect(model.runButtonLabel).toBe("Read Run Gate");
    expect(model.readyText).toContain("not eligible");
    expect(model.showOpenApproval).toBe(true);
    expect(model.showOpenBody).toBe(true);
  });
});
