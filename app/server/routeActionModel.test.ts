import { describe, expect, it } from "vitest";
import { routeActionModel, routeExecutionReadinessLabel, routeExecutionReadinessProofModel, routePreviewActionModel, routePreviewProofModel } from "../client/src/lib/routeActionModel";

describe("routeActionModel", () => {
  it("keeps saved route actions grouped by safe destination and state", () => {
    const actions = routeActionModel({
      routeId: 23,
      taskId: 77,
      evidenceId: 88,
      approvalId: 99,
      approvalStatus: "pending",
      creatingTask: false,
      creatingReceipt: false,
      creatingApproval: false,
    });

    expect(actions.map((action) => action.key)).toEqual(["project", "workbench", "gate", "task"]);
    expect(actions.map((action) => action.destination)).toEqual(["Project Read", "Receipt Body", "Approval Gate", "Task Record"]);
    expect(actions.map((action) => action.label)).toEqual(["Open Project", "Receipt #88", "Gate #99", "Task #77"]);
    expect(actions.every((action) => action.executes === false)).toBe(true);
  });

  it("shows pending creation state without implying execution", () => {
    const actions = routeActionModel({
      routeId: 24,
      taskId: null,
      evidenceId: null,
      approvalId: null,
      approvalStatus: null,
      creatingTask: true,
      creatingReceipt: true,
      creatingApproval: true,
    });

    expect(actions.map((action) => action.label)).toEqual(["Open Project", "Saving Receipt", "Queuing Gate", "Creating Task"]);
    expect(actions.map((action) => action.status)).toEqual(["read", "pending", "pending", "pending"]);
  });

  it("keeps route preview destinations separate from the save route action", () => {
    const actions = routePreviewActionModel({
      taskCreated: false,
      creatingTask: false,
      approvalRequired: true,
    });

    expect(actions.map((action) => action.key)).toEqual(["project", "workbench", "gate", "task"]);
    expect(actions.map((action) => action.destination)).toEqual(["Project Read", "Receipt Body", "Approval Gate", "Task Record"]);
    expect(actions.map((action) => action.label)).toEqual(["Open Project", "Stage Body", "Open Ledger", "Create Task"]);
    expect(actions.every((action) => action.executes === false)).toBe(true);
  });

  it("keeps route preview proof out of the primary read", () => {
    const proof = routePreviewProofModel({
      aangRead: "build request read as project build.",
      ownerAgent: "tony",
      receiptSummary: "Aang reads mode -> Cortana routes -> tony owns.",
      nextAction: "Create a task or Workbench receipt before any code.",
      cortanaRoute: ["Aang reads mode", "Cortana routes", "tony owns"],
      approvalGate: "No external action from route preview.",
      modelClass: "local_code_helper",
      provider: "Codex/frontier lane",
      modelStatus: "approval_required",
      toolAction: "code_edit",
      toolApprovalRequired: true,
      dataLeavingMachine: true,
      laneId: "frontier_or_codex_escalation",
      laneSummary: "Use local planning first.",
      registryRead: {
        mode: "local_registry_read",
        totalRecords: 4,
        trustedEvidenceCount: 1,
        cautionCount: 0,
        blockedOrFailedCount: 0,
        routeDefaultsChanged: false,
      },
    });

    expect(proof.primary.map((field) => field.label)).toEqual(["Aang", "Owner", "Receipt", "Next"]);
    expect(proof.detailsSummary).toBe("Route Details");
    expect(proof.detailChips.map((chip) => chip.label)).toContain("model local_code_helper");
    expect(proof.detailChips.map((chip) => chip.label)).toContain("registry 4 rows, 1 trusted");
    expect(proof.detailChips.map((chip) => chip.label)).toContain("route defaults unchanged");
    expect(proof.detailChips.map((chip) => chip.label)).toContain("data leaves machine");
  });

  it("keeps execution readiness labels plain and non-executing", () => {
    expect(routeExecutionReadinessLabel("preview_only")).toBe("preview only");
    expect(routeExecutionReadinessLabel("missing_task_record")).toBe("needs task");
    expect(routeExecutionReadinessLabel("missing_workbench_receipt")).toBe("needs Workbench body");
    expect(routeExecutionReadinessLabel("missing_approval")).toBe("waiting gate");
    expect(routeExecutionReadinessLabel("approval_pending")).toBe("waiting gate");
    expect(routeExecutionReadinessLabel("approval_rejected")).toBe("gate closed");
    expect(routeExecutionReadinessLabel("ready_for_explicit_execution_call")).toBe("ready for future executor review");
  });

  it("shows execution readiness as blocked or future review, never as run now", () => {
    const blocked = routeExecutionReadinessProofModel({
      status: "missing_workbench_receipt",
      taskId: 77,
      workbenchEvidenceId: null,
      approvalId: 99,
      approvalStatus: "pending",
      readyForFutureExecutorReview: false,
    });

    expect(blocked.map((field) => field.label)).toEqual(["Readiness", "Task", "Body", "Gate", "Execution"]);
    expect(blocked.find((field) => field.label === "Execution")).toMatchObject({
      value: "blocked",
      tone: "danger",
    });

    const ready = routeExecutionReadinessProofModel({
      status: "ready_for_explicit_execution_call",
      taskId: 77,
      workbenchEvidenceId: 88,
      approvalId: 99,
      approvalStatus: "approved",
      readyForFutureExecutorReview: true,
    });

    expect(ready.find((field) => field.label === "Readiness")?.value).toBe("ready for future executor review");
    expect(ready.find((field) => field.label === "Execution")).toMatchObject({
      value: "future review only",
      tone: "gold",
    });
  });
});
