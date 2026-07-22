// User-facing shell copy. Glossary (language pass, audit item 3):
// body → draft · receipt → record · gate → approval. Agent lore names stay as
// agent names only — never as feature nouns.
export function homeShellCopy() {
  return {
    zoneBlurbs: {
      browser: "Browse with quiet safety.",
      workshop: "Draft, review, and ship work.",
    },
    surfaceMeta: {
      browser: "Tabs and pages",
      workbench: "Drafts and records",
      terminal: "Command teaching",
    },
    zoneMarkers: {
      browser: ["tabs", "watch", "shield"],
      workshop: ["drafts", "tools", "validation"],
    },
    zoneMarkerLabel: "surface markers",
  };
}

export function homeShellNextActionCopy(nav: string, activeSessionCount: number, mode: string) {
  if (nav === "home") {
    return activeSessionCount > 0
      ? "Open Project Lab to inspect active work and push decisions."
      : "Ask Aang or open Project Lab. No action runs from the Keep alone.";
  }
  if (nav === "browser") return "Open a page, save it, or ask Aang about it.";
  if (nav === "projects") return "Check branch, uncommitted changes, risks, drafts, and manual push decisions.";
  if (nav === "terminal") return "Use Terminal Lab to explain commands. Suggested commands stay proposal-only.";
  if (nav === "workbench") return "Attach or inspect a draft before the Ledger summary or a push decision.";
  if (nav === "ledger") return "Read the history first. Open Workbench for drafts or Project Lab for push context.";
  if (nav === "approvals") return "Review pending approvals. Approving changes risk state but never runs hidden work.";
  if (nav === "security") return "Record a security check before any browse, clone, install, download, or run.";
  if (mode === "explore") return "Use the council for active source work. Browsing policy lives in the Basement.";
  return "Keep the route visible. Workbench holds the draft; the Ledger holds the history.";
}
