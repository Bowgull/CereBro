/**
 * Agent → role + model class + skills + tool scope routing for CereBro V1.
 *
 * Maps each of the 11 agents in the Keep to its corrected canonical role,
 * the model CLASS it requests by default (not a hardcoded model name), the
 * .skill.md modules it loads, and the tool categories it is allowed to
 * request through the Tool Adapter Layer.
 *
 * Source of truth: CEREBRO_TRUTH_RECONCILIATION.md (repo root).
 *
 * Phase 2 work — metadata only. The Harness Runtime, Model Router, Skill
 * Loader, and Tool Adapter Layer are all Phase 6+. This file is what those
 * layers will read once they exist.
 */

export type AgentFloor = "upper" | "ground" | "crypts";

/**
 * Model class strings. The Model Router (Phase 6) resolves these to actual
 * models based on hardware, privacy, and user-set escalation policy. Agent
 * code must NOT hardcode model names; request a class instead.
 */
export type ModelClass =
  | "lightweight_formatter"
  | "local_summary"
  | "local_code_helper"
  | "local_reasoner"
  | "strong_reasoning_external"
  | "strong_coding_external"
  | "long_context_external"
  | "embedding"
  | "none"; // Piccolo and similar rule-based agents make no model calls.

/**
 * Tool scope categories. Each category corresponds to a group of tools the
 * Tool Adapter Layer (Phase 6) will gate by permission class
 * (Safe / Approval Required / Blocked Unless Enabled).
 *
 * Listing a category here means the agent is *allowed to request* tools in
 * that category. The actual permission gate runs at request time per-tool.
 */
export type ToolCategory =
  | "read_metadata"      // Safe. Read project/task/session/source/memory metadata.
  | "search_memory"      // Safe. Query Chroma vector index.
  | "format_output"      // Safe. Markdown / structured formatting.
  | "create_draft"       // Safe. Stage artifact in Output Library (not yet saved).
  | "write_file"         // Approval Required. Write to filesystem / vault / artifacts.
  | "write_obsidian"     // Approval Required. Memory write into Obsidian vault.
  | "write_notion"       // Approval Required. Push to Notion outbox.
  | "read_slack_capture" // Approval Required. Read approved Hedwig DM/channel only.
  | "write_slack"        // Approval Required. Post/reply/remind in Slack.
  | "browser"            // Approval Required + feature toggle. Disabled by default.
  | "terminal"           // Approval Required. Shell commands.
  | "claude_code_handoff" // Approval Required per call. Tony's handoff path.
  | "schedule_workflow"  // Approval Required. Piccolo's cron-style jobs.
  | "destructive_cleanup" // Blocked Unless Enabled. Delete / rm-rf / drop.
  | "convene_ceremony"   // Aang only. Trigger multi-agent gathering.
  | "route_task"         // Cortana only. Pick mode + assign owner/support agents.
  | "set_permissions"    // Cortana only. Narrow tool scope per task.
  | "security_gate"      // Spock only. Preflight URLs, repos, files, and execution requests.
  | "security_scan"      // Spock only. Run approved scanner adapters and record receipts.
  | "validate_output"    // Oak only. Stamp output green or red.
  | "block_write"        // Oak only. Refuse a memory or artifact write.
  | "logic_check"        // Spock only. Detect contradictions, schema mismatches.
  | "bloat_check"        // Spock only. Flag scope creep / overengineering.
  | "sealed_module";     // Cortana only. Enter/exit sealed modules (Raven future).

export interface AgentRouting {
  id: string;
  name: string;
  floor: AgentFloor;
  chamber: string;

  /** Corrected canonical role text. See CEREBRO_TRUTH_RECONCILIATION.md §3. */
  role: string;

  /** Model class this agent requests by default. */
  defaultModelClass: ModelClass;

  /** Class to escalate to when default is insufficient. Requires user approval. */
  escalationModelClass?: ModelClass;

  /** .skill.md module names this agent loads at runtime. */
  skills: string[];

  /** Tool categories this agent is allowed to request. */
  toolScope: ToolCategory[];

  notes?: string;
}

export const AGENT_ROUTING: AgentRouting[] = [
  {
    id: "aang",
    name: "Aang",
    floor: "upper",
    chamber: "Great Hall",
    role:
      "Front door. Captures user intent and asks clarifying questions before " +
      "handing intent to Cortana. Convener of multi-agent ceremonies " +
      "(multi-lens review, retrospective, mediation between conflicting outputs). " +
      "Teacher: produces beginner guides, quizzes, flashcards, checklists, " +
      "practice plans, resource lists, and LearningPaths via Aang Learning Mode. " +
      "Does not own routing, code, validation, or memory writing.",
    defaultModelClass: "lightweight_formatter",
    escalationModelClass: "local_reasoner",
    skills: ["aang-learning"],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "create_draft",
      "write_file", "convene_ceremony",
    ],
    notes: "User input arrives at Aang first via the 'Ask Aang…' command bar.",
  },
  {
    id: "cortana",
    name: "Cortana",
    floor: "ground",
    chamber: "The Hub",
    role:
      "Hard router. Picks task mode (Quick / Explore / Build), assigns owner " +
      "and support agents, sets tool permission scope per task, controls " +
      "sealed module entry/exit. Visible center of the Keep. Council host " +
      "(visual layer only): when Aang convenes a ceremony, the gathering " +
      "renders in Cortana's hub. Does not own creative direction, validation, " +
      "code, memory writing, or teaching.",
    defaultModelClass: "local_reasoner",
    escalationModelClass: "strong_reasoning_external",
    skills: [],
    toolScope: [
      "read_metadata", "search_memory", "route_task", "set_permissions",
      "sealed_module",
    ],
  },
  {
    id: "tony",
    name: "Tony Stark",
    floor: "ground",
    chamber: "The Forge",
    role:
      "Build planner. Converts ideas into specs, data models, implementation " +
      "phases, test plans, changelogs, and Claude Code handoff prompts. " +
      "Escalates to strong_coding_external (often via the claude-code-handoff " +
      "skill) for complex builds. Does not own validation, creative taste " +
      "alone, or unapproved coding.",
    defaultModelClass: "local_code_helper",
    escalationModelClass: "strong_coding_external",
    skills: ["tony-build-flow", "claude-code-handoff"],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "create_draft",
      "write_file", "claude_code_handoff",
    ],
    notes: "Confirms each Claude Code handoff individually; eats existing session quota.",
  },
  {
    id: "gojo",
    name: "Gojo",
    floor: "ground",
    chamber: "Atelier",
    role:
      "Creative direction. Owns design system selection, UI specs, motion " +
      "specs, anti-slop creative pass. Content Engine owner: idea → audience " +
      "→ research → outline → draft → format adaptation → polish. Does not " +
      "own architecture, routing, memory, or validation.",
    defaultModelClass: "local_reasoner",
    escalationModelClass: "strong_reasoning_external",
    skills: ["frontend-design", "ui-motion", "remotion-video"],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "create_draft",
      "write_file",
    ],
  },
  {
    id: "surfer",
    name: "Silver Surfer",
    floor: "ground",
    chamber: "Cartography Hall",
    role:
      "Browser intelligence. Source review, web research, GitHub reviews, " +
      "source provenance. Standard extraction ladder: user-provided → static " +
      "fetch → metadata → readability → Playwright text → screenshot → " +
      "Crawl4AI → manual. Does not bypass Spock's security gate for pasted " +
      "URLs, GitHub repos, downloads, package installs, or browser sessions. " +
      "Does not own private browsing without per-session approval.",
    defaultModelClass: "local_summary",
    escalationModelClass: "long_context_external",
    skills: ["web-scraping"],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "create_draft",
      "browser",
    ],
    notes:
      "Browser DISABLED by default. User must explicitly enable in Settings " +
      "before any browse, fetch, or extract action. Spock preflight is required " +
      "for risky URLs, GitHub repos, downloads, package installs, and ad-heavy " +
      "browser targets. Surfer's chamber renders as locked until enabled.",
  },
  {
    id: "c3po",
    name: "C-3PO",
    floor: "ground",
    chamber: "Scriptorium",
    role:
      "Pure formatter. Turns agent work into readable docs, guides, " +
      "checklists, meeting notes, Notion-ready pages, Obsidian-ready notes. " +
      "C-3PO formats; the Memory Writer writes. Does not own strategic " +
      "decisions, validation, or memory writing.",
    defaultModelClass: "lightweight_formatter",
    skills: ["validation", "anti-slop-review"],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "create_draft",
      "write_file",
    ],
  },
  {
    id: "batman",
    name: "Batman",
    floor: "upper",
    chamber: "War Room",
    role:
      "Strategic review and risk sequencing. Tradeoff analysis, architecture " +
      "options, build-vs-package-vs-ship decisions, market/readiness calls, " +
      "scope risk, and what-could-go-wrong reviews. Escalates to " +
      "strong_reasoning_external for major decisions. Does not own " +
      "implementation, validation, routing, or UI.",
    defaultModelClass: "local_reasoner",
    escalationModelClass: "strong_reasoning_external",
    skills: [],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "create_draft",
    ],
  },
  {
    id: "oak",
    name: "Professor Oak",
    floor: "upper",
    chamber: "Alchemist's Tower",
    role:
      "Validator. Final gate before any important output, save, or memory " +
      "write. Checks facts, sources, blueprint consistency, privacy, dedup, " +
      "anti-slop. Reviews proposed memories against existing entries before " +
      "write. Flags secrets, sealed-module references, and PII before any " +
      "external escalation. Oak approves; the Memory Writer writes. Does " +
      "not own routing, implementation, or memory writing itself.",
    defaultModelClass: "strong_reasoning_external",
    escalationModelClass: "long_context_external",
    skills: [],
    toolScope: [
      "read_metadata", "search_memory", "validate_output", "block_write",
    ],
    notes: "Always gets the strongest model class available, local or external.",
  },
  {
    id: "spock",
    name: "Spock",
    floor: "upper",
    chamber: "Observatory",
    role:
      "Logic checker, contradiction detector, bloat detector, and security " +
      "gate. Catches inconsistent assumptions, schema mismatches, scope creep, " +
      "premature abstraction, overengineering, phishing risk, suspicious " +
      "GitHub repos, malicious package signals, secret exposure, unsafe browser " +
      "targets, and command execution risk. Produces security receipts before " +
      "Surfer browses risky targets or Tony runs/install code from pasted repos. " +
      "Recommends simplification. Does not own generic validation; that is " +
      "Oak's role.",
    defaultModelClass: "local_reasoner",
    escalationModelClass: "strong_reasoning_external",
    skills: [],
    toolScope: [
      "read_metadata", "search_memory", "format_output", "logic_check",
      "bloat_check", "security_gate", "security_scan",
    ],
  },
  {
    id: "piccolo",
    name: "Piccolo",
    floor: "crypts",
    chamber: "Crypt of Hours",
    role:
      "Rule-based automation worker. Runs approved scheduled jobs, cleanup " +
      "scans, backup verification, sync support, log pruning. No model " +
      "escalation; no external Claude calls. Does not own core reasoning, " +
      "memory decisions, or unapproved destructive actions.",
    defaultModelClass: "none",
    skills: ["cleanup-backup"],
    toolScope: [
      "read_metadata", "schedule_workflow", "write_file",
      "destructive_cleanup",
    ],
    notes:
      "destructive_cleanup is Blocked Unless Enabled — even with the scope " +
      "listed, individual destructive actions still require user approval.",
  },
  {
    id: "hedwig",
    name: "Hedwig",
    floor: "crypts",
    chamber: "Messenger Roost",
    role:
      "Messenger and capture agent. Owns quick-capture intake, reminders, " +
      "message drafts, Slack DM/capture-channel intake, and routing raw " +
      "captures into the approved Notion capture database. Keeps message " +
      "drafts, follow-ups, captures, and archives attached to the right " +
      "project/context. Does not browse, validate facts, write durable " +
      "knowledge, or read arbitrary Slack surfaces.",
    defaultModelClass: "lightweight_formatter",
    escalationModelClass: "local_reasoner",
    skills: [],
    toolScope: [
      "read_metadata", "format_output", "create_draft", "write_file",
      "write_notion", "read_slack_capture", "write_slack",
    ],
    notes:
      "Slack read/write and Notion capture writes require explicit approval " +
      "and exact approved surfaces/scopes. iMessage is a later OpenClaw track.",
  },
];

export function getAgentById(id: string): AgentRouting | undefined {
  return AGENT_ROUTING.find((a) => a.id === id);
}

/**
 * Resolve the model class an agent will request, honoring per-agent env
 * overrides for force-pin testing.
 *
 * Returns a class string (e.g. "local_reasoner") or, if the env override is
 * set, whatever string the user chose (which may be a class OR a concrete
 * model name for force-pin). The Model Router (Phase 6) resolves classes to
 * actual models based on hardware and policy.
 */
export function resolveModelForAgent(id: string): string | undefined {
  const overrideKey = `CEREBRO_MODEL_${id.toUpperCase()}`;
  const override = process.env[overrideKey];
  if (override) return override;
  return getAgentById(id)?.defaultModelClass;
}
