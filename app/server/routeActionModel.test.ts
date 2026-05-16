import { describe, expect, it } from "vitest";
import { routeActionModel } from "../client/src/lib/routeActionModel";

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
    expect(actions.map((action) => action.destination)).toEqual(["Project", "Body", "Gate", "Task"]);
    expect(actions.map((action) => action.label)).toEqual(["Project", "Receipt #88", "Gate #99", "Task #77"]);
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

    expect(actions.map((action) => action.label)).toEqual(["Project", "Saving Body", "Queuing Gate", "Creating Task"]);
    expect(actions.map((action) => action.status)).toEqual(["read", "pending", "pending", "pending"]);
  });
});
