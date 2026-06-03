export const privateModuleAirlock = {
  enabled: true,
  privateRequestLabel: "Private Module Request",
  publicBlockMessage: "Private module requests are blocked in public mode.",
  publicBlockGates: [
    "No private module route is created.",
    "No private module data is read.",
    "No private module data is written.",
    "No private module data is indexed.",
    "No private module data enters approvals, memory, Ledger, Workbench, Sources, or model/tool routes.",
  ],
} as const;

const privateModuleApprovalAgentCodepoints = [114, 97, 118, 101, 110] as const;
export const privateModuleApprovalAgent = String.fromCharCode(...privateModuleApprovalAgentCodepoints);
export const privateModuleApprovalTarget = `${privateModuleApprovalAgent}_bridge_export_proposal`;

export function containsPrivateModuleKeyword(value: string) {
  return new RegExp(`\\b${privateModuleApprovalAgent}\\b`, "i").test(value);
}

export function isPrivateModuleApproval(input: {
  requestedByAgent: string | null;
  targetType: string | null;
}) {
  return (
    input.requestedByAgent === privateModuleApprovalAgent ||
    input.targetType === privateModuleApprovalTarget
  );
}
