export function homeShellCopy() {
  return {
    zoneBlurbs: {
      browser: "Browse with quiet safety.",
      workshop: "Do the work with bodies and reads.",
    },
    surfaceMeta: {
      browser: "Tabs and pages",
      workbench: "Receipt body surface",
      terminal: "Command teaching",
    },
    zoneMarkers: {
      browser: ["tabs", "watch", "shield"],
      workshop: ["bodies", "tools", "validation"],
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
  if (nav === "projects") return "Check branch, dirty state, risks, bodies, and manual push decisions.";
  if (nav === "terminal") return "Use Terminal Lab for command teaching. Suggested commands stay proposal-only.";
  if (nav === "workbench") return "Attach or inspect the receipt body before Ledger summary or push decisions.";
  if (nav === "ledger") return "Read the audit trail first. Open Workbench for bodies or Project Lab for push context.";
  if (nav === "approvals") return "Review gates. Approval changes risk state but does not run hidden work.";
  if (nav === "security") return "Record Spock receipt before browser, clone, install, download, or execution.";
  if (mode === "explore") return "Use Cortana Council for active source work. Surfer policy stays in Basement.";
  return "Keep the route visible. Use Workbench for the body and Ledger for the audit trail.";
}
