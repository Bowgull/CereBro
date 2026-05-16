export type RouteActionStatus = "read" | "pending" | "saved";
export type RouteActionKey = "project" | "workbench" | "gate" | "task";

export type RouteActionInput = {
  routeId: number;
  taskId: number | null;
  evidenceId: number | null;
  approvalId: number | null;
  approvalStatus: string | null;
  creatingTask: boolean;
  creatingReceipt: boolean;
  creatingApproval: boolean;
};

export type RouteAction = {
  key: RouteActionKey;
  destination: "Project" | "Body" | "Gate" | "Task";
  label: string;
  status: RouteActionStatus;
  executes: false;
  ariaLabel: string;
  title: string;
};

export type RoutePreviewActionInput = {
  taskCreated: boolean;
  creatingTask: boolean;
  approvalRequired: boolean;
};

export function routeActionModel(input: RouteActionInput): RouteAction[] {
  const gateLabel = input.approvalId
    ? `${input.approvalStatus === "approved" ? "Approved" : input.approvalStatus === "pending" ? "Gate" : "Closed"} #${input.approvalId}`
    : input.creatingApproval
      ? "Queuing Gate"
      : "Queue Gate";

  return [
    {
      key: "project",
      destination: "Project",
      label: "Project",
      status: "read",
      executes: false,
      ariaLabel: `Open Project Lab context for route ${input.routeId}`,
      title: "Open Project Lab for this saved route. This does not save or run work.",
    },
    {
      key: "workbench",
      destination: "Body",
      label: input.evidenceId ? `Receipt #${input.evidenceId}` : input.creatingReceipt ? "Saving Body" : "Save Body",
      status: input.evidenceId ? "saved" : input.creatingReceipt ? "pending" : "read",
      executes: false,
      ariaLabel: input.evidenceId
        ? `Open Workbench receipt ${input.evidenceId} linked to route ${input.routeId}`
        : input.creatingReceipt
          ? `Saving Workbench receipt for route ${input.routeId}`
          : `Save Workbench receipt for route ${input.routeId}`,
      title: input.evidenceId
        ? "Open the local Workbench body linked to this route."
        : "Save this route as one local Workbench receipt. This does not run work.",
    },
    {
      key: "gate",
      destination: "Gate",
      label: gateLabel,
      status: input.approvalId ? "saved" : input.creatingApproval ? "pending" : "read",
      executes: false,
      ariaLabel: input.approvalId
        ? `Open ${input.approvalStatus ?? "recorded"} approval ${input.approvalId} for route ${input.routeId}`
        : input.creatingApproval
          ? `Queuing approval preview for route ${input.routeId}`
          : `Queue approval preview for route ${input.routeId}`,
      title: input.approvalId
        ? "Open the local approval record for this route."
        : "Queue a local approval/preflight preview for this route. This does not approve or run work.",
    },
    {
      key: "task",
      destination: "Task",
      label: input.taskId ? `Task #${input.taskId}` : input.creatingTask ? "Creating Task" : "Create Task",
      status: input.taskId ? "saved" : input.creatingTask ? "pending" : "read",
      executes: false,
      ariaLabel: input.taskId
        ? `Open task ${input.taskId} created from route ${input.routeId}`
        : input.creatingTask
          ? `Creating task from route ${input.routeId}`
          : `Create local task from route ${input.routeId}`,
      title: input.taskId
        ? "Open the local task created from this route."
        : "Create a local task from this saved route. This does not run the task.",
    },
  ];
}

export function routePreviewActionModel(input: RoutePreviewActionInput): RouteAction[] {
  return [
    {
      key: "project",
      destination: "Project",
      label: "Project",
      status: "read",
      executes: false,
      ariaLabel: "Open Project Lab focused on route preview",
      title: "Open Project Lab for this route preview. No project write is saved.",
    },
    {
      key: "workbench",
      destination: "Body",
      label: "Workbench",
      status: "read",
      executes: false,
      ariaLabel: "Stage route receipt draft in Workbench",
      title: "Stage this route preview as a Workbench draft. This does not save evidence or run work.",
    },
    {
      key: "gate",
      destination: "Gate",
      label: "Ledger",
      status: "read",
      executes: false,
      ariaLabel: "Open Ledger focused on route preview",
      title: "Open Ledger audit focus for this route preview. No audit row is saved.",
    },
    {
      key: "task",
      destination: "Task",
      label: input.taskCreated ? "Task Saved" : input.creatingTask ? "Saving Task" : "Create Task",
      status: input.taskCreated ? "saved" : input.creatingTask ? "pending" : "read",
      executes: false,
      ariaLabel: input.taskCreated ? "Task saved from route receipt" : input.creatingTask ? "Saving route task" : "Create task from route preview",
      title: "Create one local task from this route preview. This does not run the task.",
    },
  ];
}
