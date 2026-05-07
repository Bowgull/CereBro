import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { searchPromptHandoffs } from "./promptHandoffs";

const intakeCategories = [
  "quick_answer",
  "everyday_note",
  "decision",
  "reminder",
  "message",
  "learning",
  "self_improvement",
  "system_improvement",
  "research",
  "creative",
  "file_hygiene",
  "project_build",
  "project_design",
  "project_qa",
  "project_ship",
  "project_package",
  "portfolio",
  "freelance",
  "source_capture",
  "prompt_reuse",
  "artifact_write",
] as const;

const projectModes = ["Build", "Design", "QA", "Ship", "Package", "Pitch", "Learn", "Hygiene"] as const;

type IntakeCategory = (typeof intakeCategories)[number];
type ProjectMode = (typeof projectModes)[number];

const projectHints = [
  { slug: "declyne", label: "Declyne", localPath: "/Users/lindsaybell/Developer/Declyne", aliases: ["declyne", "plaid", "finance", "budget", "bank", "app store"] },
  { slug: "waymark", label: "Waymark", localPath: "/Users/lindsaybell/Developer/Waymark", aliases: ["waymark", "strava", "training", "coach", "run", "running"] },
  { slug: "sygnalist", label: "Sygnalist", localPath: "/Users/lindsaybell/Developer/sygnalist-brain", aliases: ["sygnalist", "job search", "jobs", "supabase", "signalist"] },
  { slug: "bridgefour", label: "Bridgefour", localPath: "/Users/lindsaybell/Developer/bridgefour", aliases: ["bridgefour", "portfolio", "case study", "resume"] },
  { slug: "cerebro", label: "CereBro", localPath: "/Users/lindsaybell/Desktop/CereBro", aliases: ["cerebro", "agent", "keep", "vault", "obsidian", "piccolo", "cortana", "surfer"] },
] as const;

const categoryRules: Array<{ category: IntakeCategory; keywords: string[] }> = [
  { category: "reminder", keywords: ["remind", "reminder", "follow up", "check back", "tomorrow", "next week"] },
  { category: "message", keywords: ["message", "email", "text", "reply", "send", "draft"] },
  { category: "system_improvement", keywords: ["improve cerebro", "improve itself", "make cerebro better", "better system", "better workflow", "better tools"] },
  { category: "self_improvement", keywords: ["improve me", "help me improve", "get better at", "habit", "routine", "skill path", "learn path"] },
  { category: "file_hygiene", keywords: ["clean", "cleanup", "archive", "delete", "move files", "organize files", "duplicate"] },
  { category: "project_ship", keywords: ["ship", "release", "deploy", "testflight", "app store", "publish"] },
  { category: "project_qa", keywords: ["qa", "test", "bug", "validate", "review", "broken", "risk"] },
  { category: "project_design", keywords: ["ui", "ux", "design", "polish", "screen", "layout", "visual"] },
  { category: "project_package", keywords: ["package", "readme", "case study", "screenshot", "demo", "portfolio"] },
  { category: "freelance", keywords: ["freelance", "client", "proposal", "lead", "invoice", "contract"] },
  { category: "prompt_reuse", keywords: ["reuse prompt", "that prompt", "old prompt", "excel prompt", "spreadsheet prompt", "pixellab prompt", "prompt from", "handoff prompt", "deepseek prompt", "nanobanana", "nano banana", "tool handoff"] },
  { category: "research", keywords: ["research", "source", "docs", "compare", "look up", "find", "google", "best", "right now", "latest", "current", "reddit", "youtube"] },
  { category: "learning", keywords: ["teach", "learn", "explain", "understand", "lesson"] },
  { category: "creative", keywords: ["idea", "creative", "image", "video", "prompt", "brand"] },
  { category: "artifact_write", keywords: ["save", "write note", "obsidian", "notion", "artifact"] },
  { category: "decision", keywords: ["should i", "decide", "which", "what next", "priority", "worth"] },
  { category: "project_build", keywords: ["build", "implement", "fix", "code", "refactor", "feature"] },
];

function includesAny(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function classifyCategory(text: string): IntakeCategory {
  const matched = categoryRules.find((rule) => includesAny(text, rule.keywords));
  if (matched) return matched.category;
  if (text.length > 180) return "everyday_note";
  return "quick_answer";
}

function modeForCategory(category: IntakeCategory): ProjectMode | null {
  if (category === "project_build") return "Build";
  if (category === "project_design") return "Design";
  if (category === "project_qa") return "QA";
  if (category === "project_ship") return "Ship";
  if (category === "project_package" || category === "portfolio") return "Package";
  if (category === "freelance") return "Pitch";
  if (category === "learning" || category === "self_improvement" || category === "prompt_reuse") return "Learn";
  if (category === "file_hygiene") return "Hygiene";
  if (category === "decision" || category === "system_improvement") return "Build";
  return null;
}

function detectProject(text: string) {
  return projectHints.find((project) => includesAny(text, project.aliases)) ?? null;
}

function agentsFor(category: IntakeCategory, projectSlug: string | null): string[] {
  const agents = new Set<string>(["cortana"]);

  if (category === "decision") agents.add("batman");
  if (category.startsWith("project_")) agents.add("tony");
  if (category === "project_design" || category === "project_package" || category === "portfolio") agents.add("gojo");
  if (category === "project_qa" || category === "project_ship") agents.add("oak");
  if (category === "freelance") {
    agents.add("batman");
    agents.add("gojo");
    agents.add("c3po");
  }
  if (category === "research" || category === "source_capture") agents.add("surfer");
  if (category === "prompt_reuse") {
    agents.add("aang");
    agents.add("c3po");
    agents.add("surfer");
  }
  if (category === "learning" || category === "self_improvement") {
    agents.add("aang");
    agents.add("surfer");
  }
  if (category === "system_improvement") {
    agents.add("surfer");
    agents.add("batman");
    agents.add("spock");
    agents.add("oak");
  }
  if (category === "message" || category === "reminder") agents.add("hedwig");
  if (category === "artifact_write") agents.add("c3po");
  if (category === "file_hygiene") agents.add("piccolo");
  if (category === "creative") agents.add("gojo");

  if (projectSlug === "declyne") {
    agents.add("batman");
    agents.add("oak");
    agents.add("spock");
  }
  if (projectSlug === "cerebro") {
    agents.add("batman");
    agents.add("spock");
  }

  return [...agents];
}

function permissionGates(category: IntakeCategory, text: string): string[] {
  const gates = ["No writes or external actions from intake preview."];
  if (category.startsWith("project_")) gates.push("Code edits require explicit project-specific approval.");
  if (category === "project_ship") gates.push("Deployments, App Store, and account operations require explicit approval.");
  if (category === "file_hygiene") gates.push("Moving, archiving, or deleting files requires explicit approval.");
  if (category === "artifact_write") gates.push("Vault, Obsidian, Notion, and repo writes require explicit approval.");
  if (category === "research" || category === "source_capture") gates.push("External browsing/source capture requires approval when requested.");
  if (category === "prompt_reuse") gates.push("Saved prompts can be suggested from memory, but external tools/models still require explicit approval.");
  if (category === "self_improvement") gates.push("Personal recommendations should stay proposal-only until saved or scheduled.");
  if (category === "system_improvement") gates.push("CereBro improvement ideas need Batman/Spock review before implementation.");
  if (text.includes("latest") || text.includes("current") || text.includes("right now") || text.includes("best")) {
    gates.push("Current web claims need fresh sources before being treated as reliable.");
  }
  if (text.includes("plaid") || text.includes("bank") || text.includes("finance")) {
    gates.push("Financial/data-handling claims need Oak validation before being treated as true.");
  }
  return gates;
}

function nextStep(category: IntakeCategory, projectLabel: string | null): string {
  const target = projectLabel ? `${projectLabel}: ` : "";
  if (category === "decision") return `${target}ask Batman for a tradeoff map, then let Cortana choose the smallest next move.`;
  if (category === "project_build") return `${target}ask Tony to inspect instructions, git status, and propose one safe implementation slice.`;
  if (category === "project_design") return `${target}ask Gojo for a focused UI/UX critique before Tony changes code.`;
  if (category === "project_qa") return `${target}ask Oak to define validation checks and risks before ship work.`;
  if (category === "project_ship") return `${target}ask Batman and Oak for readiness risks before any release action.`;
  if (category === "project_package" || category === "portfolio") return `${target}ask Gojo and C-3PO to shape the proof into portfolio material.`;
  if (category === "freelance") return "ask Batman to pick the offer angle, then C-3PO can draft client-facing material.";
  if (category === "research" || category === "source_capture") return `${target}ask Surfer to gather source cards, then Oak can validate anything important.`;
  if (category === "prompt_reuse") return `${target}search reusable prompt/tool handoff memory, then explain which prompt fits and why before adapting it.`;
  if (category === "self_improvement") return "ask Aang to shape this into a learning or habit path, with Surfer finding current resources if needed.";
  if (category === "system_improvement") return "ask Surfer to find references, then Batman and Spock decide whether it improves CereBro or adds bloat.";
  if (category === "file_hygiene") return "ask Piccolo for a read-only cleanup report and approval-gated proposals.";
  if (category === "message" || category === "reminder") return "ask Hedwig to draft or schedule the follow-up once reminder tooling is wired.";
  return "keep this as a lightweight intake note until the user asks for an action.";
}

function taskTitleFor(text: string, category: IntakeCategory, projectLabel: string | null): string {
  const prefix = projectLabel ? `${projectLabel}: ` : "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const shortText = cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
  return `${prefix}${category.replace(/_/g, " ")} - ${shortText}`;
}

export const commandIntakeRouter = router({
  preview: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(2000),
        mode: z.enum(["quick", "explore", "build"]).default("quick"),
      }),
    )
    .mutation(async ({ input }) => {
      const normalized = input.text.toLowerCase();
      const category = classifyCategory(normalized);
      const project = detectProject(normalized);
      const projectMode = modeForCategory(category);
      const agents = agentsFor(category, project?.slug ?? null);
      const promptHandoffSuggestions =
        category === "prompt_reuse"
          ? (await searchPromptHandoffs(input.text, 3)).suggestions
          : [];

      return {
        mode: "proposal_only",
        receivedMode: input.mode,
        originalText: input.text,
        category,
        projectMode,
        project: project ? { slug: project.slug, label: project.label, localPath: project.localPath } : null,
        agents,
        promptHandoffSuggestions,
        permissionGates: permissionGates(category, normalized),
        nextStep: nextStep(category, project?.label ?? null),
        taskDraft: {
          title: taskTitleFor(input.text, category, project?.label ?? null),
          agent: agents[1] ?? agents[0] ?? "cortana",
          projectName: project?.label ?? null,
          projectPath: project?.localPath ?? null,
        },
      };
    }),
});
