import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";

export const companionRouter = router({
  policy: publicProcedure.query(() => ({
    mode: "proposal_only" as const,
    startsDesktopProcess: false,
    sendsNotifications: false,
    readsScreen: false,
    ownerAgent: "aang",
    routedBy: "cortana",
    summary:
      "Aang Companion is a small always-on CereBro surface for status, quick ask, and opening the right Keep panel. It is not a separate agent and does not own reminders, capture, or hygiene.",
    shellOptions: [
      {
        id: "web_mock",
        label: "Web-only mock",
        status: "recommended_first",
        reason: "Safest first pass. It can prove event policy, copy density, and routing without desktop permissions.",
      },
      {
        id: "menu_bar_helper",
        label: "Menu bar helper",
        status: "later",
        reason: "Good low-noise desktop surface after the web mock proves the event model.",
      },
      {
        id: "transparent_overlay",
        label: "Transparent desktop overlay",
        status: "later_high_caution",
        reason: "Needs native-window permissions and careful focus/click-through behavior.",
      },
    ],
    allowedEvents: [
      { id: "pending_approval", label: "Pending approval", source: "approvals", route: "approvals", quiet: false },
      { id: "terminal_blocked", label: "Terminal blocked or reviewing", source: "terminal_lab", route: "terminal", quiet: false },
      { id: "hedwig_review", label: "Hedwig capture waiting", source: "hedwig", route: "inbox", quiet: false },
      { id: "source_saved", label: "Source saved locally", source: "surfer", route: "sources", quiet: true },
      { id: "workbench_evidence", label: "Workbench evidence recorded", source: "workbench", route: "workbench", quiet: true },
      { id: "task_created", label: "Task created", source: "tasks", route: "tasks", quiet: true },
      { id: "session_status", label: "Live session status", source: "sessions", route: "home", quiet: true },
      { id: "storage_pressure", label: "Storage or cleanup warning", source: "piccolo", route: "automation", quiet: false },
    ],
    blockedEvents: [
      "Screen reading",
      "Private app inspection",
      "Slack reads or writes",
      "Notion writes",
      "Calendar scheduling",
      "External notifications",
      "Command execution",
      "Browser automation",
      "Repo edits",
    ],
    idleStates: [
      { id: "breathing", label: "Breathing", motion: "minimal", timeOfDay: "any" },
      { id: "sitting", label: "Sitting", motion: "minimal", timeOfDay: "any" },
      { id: "balance", label: "Balancing", motion: "small", timeOfDay: "day" },
      { id: "airbending_practice", label: "Tiny airbending practice", motion: "small", timeOfDay: "day" },
      { id: "fidget", label: "Goofy fidget", motion: "small", timeOfDay: "any" },
      { id: "sleepy", label: "Sleepy", motion: "minimal", timeOfDay: "night" },
    ],
    interactionPolicy: [
      "Click opens quick ask or the relevant Keep panel.",
      "Quick ask routes through Cortana before any owner agent acts.",
      "Bubbles stay short and factual.",
      "Mute, park, and sleep controls must exist before any persistent desktop shell.",
      "The overlay never schedules, sends, reads private channels, or runs commands on its own.",
    ],
    firstBuildSlice: [
      "Add web-only mock inside the Keep.",
      "Show one allowed local event summary.",
      "Route Open Keep buttons to existing panels.",
      "Add mute/park/sleep state controls as local UI state.",
      "Do not create a native desktop process yet.",
    ],
    gates: [
      "Aang remains an agent. The companion is only a presentation surface.",
      "Cortana routes requests. Hedwig owns capture/reminders. Piccolo owns hygiene.",
      "No desktop overlay process, notification, Slack/Notion action, or screen access is created in this policy slice.",
    ],
  })),

  localEvents: publicProcedure.query(async () => {
    const db = await getCerebroDb();
    const [approvals, terminal, captures, sources, workbench, tasks, sessions, cleanup] = await Promise.all([
      db.execute(`SELECT COUNT(*) AS count FROM approvals WHERE status = 'pending'`),
      db.execute(`SELECT COUNT(*) AS count FROM command_observations WHERE status IN ('blocked', 'reviewing')`),
      db.execute(`SELECT COUNT(*) AS count FROM capture_observations WHERE needs_review = 1 AND status != 'archived'`),
      db.execute(`SELECT COUNT(*) AS count FROM source_events WHERE created_at >= unixepoch() - 86400`),
      db.execute(`SELECT COUNT(*) AS count FROM workbench_evidence_records WHERE created_at >= unixepoch() - 86400`),
      db.execute(`SELECT COUNT(*) AS count FROM tasks WHERE created_at >= unixepoch() - 86400`),
      db.execute(`SELECT COUNT(*) AS count FROM sessions WHERE ended_at IS NULL`),
      db.execute(`SELECT COUNT(*) AS count FROM cleanup_candidates WHERE status = 'proposed'`),
    ]);

    const rows = [
      {
        id: "pending_approval",
        label: "Pending approval",
        count: Number(approvals.rows[0]?.count ?? 0),
        route: "approvals",
        source: "approvals",
        quiet: false,
      },
      {
        id: "terminal_blocked",
        label: "Terminal blocked or reviewing",
        count: Number(terminal.rows[0]?.count ?? 0),
        route: "terminal",
        source: "terminal_lab",
        quiet: false,
      },
      {
        id: "hedwig_review",
        label: "Hedwig capture waiting",
        count: Number(captures.rows[0]?.count ?? 0),
        route: "inbox",
        source: "hedwig",
        quiet: false,
      },
      {
        id: "source_saved",
        label: "Source events in last 24h",
        count: Number(sources.rows[0]?.count ?? 0),
        route: "sources",
        source: "surfer",
        quiet: true,
      },
      {
        id: "workbench_evidence",
        label: "Workbench evidence in last 24h",
        count: Number(workbench.rows[0]?.count ?? 0),
        route: "workbench",
        source: "workbench",
        quiet: true,
      },
      {
        id: "task_created",
        label: "Tasks created in last 24h",
        count: Number(tasks.rows[0]?.count ?? 0),
        route: "tasks",
        source: "tasks",
        quiet: true,
      },
      {
        id: "session_status",
        label: "Live sessions",
        count: Number(sessions.rows[0]?.count ?? 0),
        route: "home",
        source: "sessions",
        quiet: true,
      },
      {
        id: "storage_pressure",
        label: "Cleanup proposals",
        count: Number(cleanup.rows[0]?.count ?? 0),
        route: "automation",
        source: "piccolo",
        quiet: false,
      },
    ];

    return {
      mode: "read_only" as const,
      writesExternal: false,
      sendsNotifications: false,
      startsDesktopProcess: false,
      events: rows,
      activeCount: rows.reduce((sum, row) => sum + row.count, 0),
      bubbleCount: rows.filter((row) => !row.quiet && row.count > 0).length,
      gates: [
        "Local event counts do not notify, schedule, read Slack/Notion, inspect the screen, or run commands.",
        "Click routing is still a Keep UI action, not a desktop overlay.",
      ],
    };
  }),
});
