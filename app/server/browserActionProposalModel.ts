type BrowserDraftKind = "empty" | "url" | "search";

type BrowserActionProposalInput = {
  actionLabel: string;
  target: string;
  draftKind: BrowserDraftKind;
};

function riskForAction(actionLabel: string, draftKind: BrowserDraftKind) {
  if (draftKind === "empty") return "browser_read";
  if (actionLabel === "Save to Sources" || actionLabel === "Add to Watch" || actionLabel === "Attach to Workbench" || actionLabel === "Pin to Project") {
    return "browser_write";
  }
  return "browser_read";
}

export function browserActionProposalModel(input: BrowserActionProposalInput) {
  const target = input.target.trim() || "No page draft.";
  const blockers = [
    "runner contract",
    "approval receipt",
    "Spock gate",
    "Workbench body",
    "result receipt",
    "recovery note",
  ];
  if (input.draftKind === "empty") blockers.unshift("page draft");

  return {
    surface: "workbench_browser" as const,
    actionLabel: input.actionLabel,
    target,
    draftKind: input.draftKind,
    riskClass: riskForAction(input.actionLabel, input.draftKind),
    executorAgent: input.actionLabel === "Explain with Aang" ? "aang" : "surfer",
    statusLabel: "proposal blocked" as const,
    canExecute: false,
    resultState: "not_run" as const,
    blockers,
    requiredGates: [
      "Runner contract",
      "Approval receipt",
      "Spock gate",
      "Workbench body",
      "Result receipt",
      "Recovery note",
    ],
    noActionTaken: [
      "No browser opened.",
      "No page fetched.",
      "No source saved.",
      "No Workbench capture created.",
      "No Watch Shelf item saved.",
      "No credential action ran.",
      "No external write ran.",
    ],
  };
}
