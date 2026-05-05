/**
 * Agent → model routing for CereBro V1.
 *
 * Maps each of the 10 agents in the Keep to its primary model, fallback,
 * role, and floor. Phase 3 wires this into actual dispatch; for now it's
 * a queryable config so the UI can label agents and Phase 3 can plug in
 * without re-deciding the lineup.
 *
 * Models are aspirational defaults; everything is env-overridable per
 * agent via CEREBRO_MODEL_<AGENT>=... once the dispatcher exists.
 */

export type AgentFloor = "upper" | "ground" | "crypts";

export interface AgentRouting {
  id: string;
  name: string;
  floor: AgentFloor;
  chamber: string;
  role: string;
  primaryModel: string;
  fallbackModel?: string;
  notes?: string;
}

export const AGENT_ROUTING: AgentRouting[] = [
  {
    id: "cortana",
    name: "Cortana",
    floor: "ground",
    chamber: "Hub",
    role: "Orchestrator. Visible center of the Keep. Routes work to other agents and speaks to the user via the orb.",
    primaryModel: "claude-opus-4-7",
    fallbackModel: "claude-sonnet-4-6",
  },
  {
    id: "tony",
    name: "Tony Stark",
    floor: "ground",
    chamber: "The Forge",
    role: "Builder. Code generation, refactors, build/test runs. Primary execution path is Claude Code handoffs (existing session quota).",
    primaryModel: "claude-code-handoff",
    fallbackModel: "claude-sonnet-4-6",
    notes: "Always confirms each Claude Code call individually.",
  },
  {
    id: "gojo",
    name: "Gojo",
    floor: "ground",
    chamber: "Atelier",
    role: "Designer. UI critique, visual design, palette and typography work, mockup synthesis.",
    primaryModel: "claude-sonnet-4-6",
  },
  {
    id: "surfer",
    name: "Silver Surfer",
    floor: "ground",
    chamber: "Cartography Hall",
    role: "Source ingestion. Browses, scrapes, summarizes, files into the source library. Crawl4AI under the hood.",
    primaryModel: "claude-sonnet-4-6",
    notes: "Public-page browsing only in V1.",
  },
  {
    id: "c3po",
    name: "C-3PO",
    floor: "ground",
    chamber: "Scriptorium",
    role: "Translation, transcription, formatting, polish. Final-pass writer.",
    primaryModel: "claude-haiku-4-5-20251001",
    fallbackModel: "claude-sonnet-4-6",
  },
  {
    id: "aang",
    name: "Aang",
    floor: "upper",
    chamber: "Great Hall",
    role: "Convener. Multi-agent ceremonies, retrospectives, mediation between disagreeing outputs.",
    primaryModel: "claude-sonnet-4-6",
  },
  {
    id: "batman",
    name: "Batman",
    floor: "upper",
    chamber: "War Room",
    role: "Strategist. Planning, threat models, sequencing, what-could-go-wrong reviews.",
    primaryModel: "claude-opus-4-7",
  },
  {
    id: "oak",
    name: "Professor Oak",
    floor: "upper",
    chamber: "Alchemist's Tower",
    role: "Research curator. Reads heavy material, distills, files references into memory.",
    primaryModel: "claude-sonnet-4-6",
  },
  {
    id: "spock",
    name: "Spock",
    floor: "upper",
    chamber: "Observatory",
    role: "Validator. Logic checks, sanity passes on outputs, schema/format validation.",
    primaryModel: "claude-sonnet-4-6",
  },
  {
    id: "piccolo",
    name: "Piccolo",
    floor: "crypts",
    chamber: "Crypt of Hours",
    role: "Long-running watcher. Schedules, cron-style jobs, background polls (Notion inbox, source refreshes).",
    primaryModel: "claude-haiku-4-5-20251001",
  },
];

export function getAgentById(id: string): AgentRouting | undefined {
  return AGENT_ROUTING.find((a) => a.id === id);
}

export function resolveModelForAgent(id: string): string | undefined {
  const overrideKey = `CEREBRO_MODEL_${id.toUpperCase()}`;
  const override = process.env[overrideKey];
  if (override) return override;
  return getAgentById(id)?.primaryModel;
}
