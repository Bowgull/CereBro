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
  destination: "Project Read" | "Receipt Body" | "Approval Gate" | "Task Record";
  label: string;
  status: RouteActionStatus;
  executes: false;
  ariaLabel: string;
  title: string;
};

export type RouteExecutionReadinessStatus =
  | "preview_only"
  | "missing_task_record"
  | "missing_workbench_receipt"
  | "missing_approval"
  | "approval_pending"
  | "approval_rejected"
  | "ready_for_explicit_execution_call";

export type RoutePreviewActionInput = {
  taskCreated: boolean;
  creatingTask: boolean;
  approvalRequired: boolean;
};

export type RoutePreviewProofInput = {
  aangRead: string;
  ownerAgent: string;
  receiptSummary: string;
  nextAction: string;
  cortanaRoute: string[];
  approvalGate: string;
  modelClass: string;
  provider: string;
  modelStatus: string;
  toolAction: string;
  toolApprovalRequired: boolean;
  dataLeavingMachine: boolean;
  laneId: string;
  laneSummary: string;
};

export type RoutePreviewProofField = {
  label: string;
  value: string;
  tone: "gold" | "accent" | "warning" | "success" | "muted";
};

export type RoutePreviewProofChip = {
  label: string;
  tone: "gold" | "accent" | "warning" | "success" | "danger" | "muted";
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
      destination: "Project Read",
      label: "Open Project",
      status: "read",
      executes: false,
      ariaLabel: `Open Project Lab context for route ${input.routeId}`,
      title: "Open Project Lab for this saved route. This does not save or run work.",
    },
    {
      key: "workbench",
      destination: "Receipt Body",
      label: input.evidenceId ? `Receipt #${input.evidenceId}` : input.creatingReceipt ? "Saving Receipt" : "Save Receipt",
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
      destination: "Approval Gate",
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
      destination: "Task Record",
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

export function routeExecutionReadinessLabel(status: RouteExecutionReadinessStatus | string | null | undefined) {
  if (status === "preview_only") return "preview only";
  if (status === "missing_task_record") return "needs task";
  if (status === "missing_workbench_receipt") return "needs Workbench body";
  if (status === "missing_approval" || status === "approval_pending") return "waiting gate";
  if (status === "approval_rejected") return "gate closed";
  if (status === "ready_for_explicit_execution_call") return "ready for future executor review";
  return "read route first";
}

export function routePreviewActionModel(input: RoutePreviewActionInput): RouteAction[] {
  return [
    {
      key: "project",
      destination: "Project Read",
      label: "Open Project",
      status: "read",
      executes: false,
      ariaLabel: "Open Project Lab focused on route preview",
      title: "Open Project Lab for this route preview. No project write is saved.",
    },
    {
      key: "workbench",
      destination: "Receipt Body",
      label: "Stage Body",
      status: "read",
      executes: false,
      ariaLabel: "Stage route receipt draft in Workbench",
      title: "Stage this route preview as a Workbench draft. This does not save evidence or run work.",
    },
    {
      key: "gate",
      destination: "Approval Gate",
      label: "Open Ledger",
      status: "read",
      executes: false,
      ariaLabel: "Open Ledger focused on route preview",
      title: "Open Ledger audit focus for this route preview. No audit row is saved.",
    },
    {
      key: "task",
      destination: "Task Record",
      label: input.taskCreated ? "Task Saved" : input.creatingTask ? "Saving Task" : "Create Task",
      status: input.taskCreated ? "saved" : input.creatingTask ? "pending" : "read",
      executes: false,
      ariaLabel: input.taskCreated ? "Task saved from route receipt" : input.creatingTask ? "Saving route task" : "Create task from route preview",
      title: "Create one local task from this route preview. This does not run the task.",
    },
  ];
}

export function routePreviewProofModel(input: RoutePreviewProofInput) {
  return {
    primary: [
      { label: "Aang", value: input.aangRead, tone: "gold" },
      { label: "Owner", value: input.ownerAgent, tone: "accent" },
      { label: "Receipt", value: input.receiptSummary, tone: "gold" },
      { label: "Next", value: input.nextAction, tone: "muted" },
    ] satisfies RoutePreviewProofField[],
    detailsSummary: "Route Details",
    routeChain: input.cortanaRoute.join(" -> "),
    lane: {
      label: input.laneId.replace(/_/g, " "),
      summary: input.laneSummary,
      tone: input.modelStatus === "approval_required" ? "warning" as const : "success" as const,
    },
    detailChips: [
      { label: input.cortanaRoute.length > 0 ? input.cortanaRoute.join(" -> ") : "No route chain", tone: "accent" },
      { label: input.approvalGate, tone: input.toolApprovalRequired ? "warning" : "success" },
      { label: `model ${input.modelClass}`, tone: "muted" },
      { label: input.provider, tone: "gold" },
      { label: input.modelStatus.replace(/_/g, " "), tone: input.modelStatus === "approval_required" ? "warning" : "success" },
      { label: `tool ${input.toolAction}`, tone: "muted" },
      { label: input.toolApprovalRequired ? "approval required" : "local only", tone: input.toolApprovalRequired ? "warning" : "success" },
      { label: input.dataLeavingMachine ? "data leaves machine" : "no data leaves machine", tone: input.dataLeavingMachine ? "danger" : "success" },
    ] satisfies RoutePreviewProofChip[],
  };
}
