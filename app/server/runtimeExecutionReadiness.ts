export type RouteExecutionReadinessStatus =
  | "preview_only"
  | "missing_task_record"
  | "missing_workbench_receipt"
  | "missing_approval"
  | "approval_pending"
  | "approval_rejected"
  | "ready_for_explicit_execution_call";

export function routeRequiresApproval(approvalGates: string[]) {
  return approvalGates.some((gate) => gate !== "No external action from route preview.");
}

export function routeExecutionReadiness(input: {
  routeRecordId: number | null;
  taskId: number | null;
  approvalGates: string[];
  approvalId: number | null;
  approvalStatus: string | null;
  workbenchEvidenceId: number | null;
}) {
  const approvalRequired = routeRequiresApproval(input.approvalGates);
  const taskReady = input.taskId != null;
  const workbenchReady = input.workbenchEvidenceId != null;
  const approvalReady = !approvalRequired || input.approvalStatus === "approved";
  const requiredBeforeExecution = [
    "route record",
    "local task record",
    "Workbench receipt body",
    ...(approvalRequired ? ["approved approval gate"] : []),
    "future explicit execution call",
  ];
  const noActionTaken = [
    "No command ran.",
    "No browser opened.",
    "No model call ran.",
    "No git action ran.",
    "No external write ran.",
  ];
  let status: RouteExecutionReadinessStatus = "ready_for_explicit_execution_call";

  if (input.routeRecordId == null) status = "preview_only";
  else if (!taskReady) status = "missing_task_record";
  else if (!workbenchReady) status = "missing_workbench_receipt";
  else if (approvalRequired && input.approvalStatus == null) status = "missing_approval";
  else if (approvalRequired && input.approvalStatus === "pending") status = "approval_pending";
  else if (approvalRequired && input.approvalStatus !== "approved") status = "approval_rejected";

  return {
    routeRecordId: input.routeRecordId,
    taskId: input.taskId,
    approvalId: input.approvalId,
    approvalStatus: approvalRequired ? input.approvalStatus : "not_required",
    workbenchEvidenceId: input.workbenchEvidenceId,
    canExecute: false,
    status,
    requiredBeforeExecution,
    noActionTaken,
    readyForFutureExecutorReview: input.routeRecordId != null && taskReady && approvalReady && workbenchReady,
  };
}
