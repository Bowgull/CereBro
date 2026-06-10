import { z } from "zod";
import { getCerebroDb } from "../cerebroDb";
import { publicProcedure, router } from "../_core/trpc";

const PROMPT_KINDS = ["reusable_prompt", "tool_handoff", "external_model_handoff", "creative_prompt"] as const;
const SEARCH_FIELDS = ["title", "source_uri", "storage_path", "owner_agent", "prompt_or_instruction"] as const;
const STOP_WORDS = new Set(["the", "that", "this", "from", "with", "into", "prompt", "handoff", "reuse", "old"]);

function rowToPromptHandoff(r: Record<string, unknown>) {
  const prompt = r.prompt_or_instruction == null ? null : String(r.prompt_or_instruction);
  return {
    id: Number(r.id),
    kind: String(r.kind),
    title: r.title == null ? null : String(r.title),
    ownerAgent: r.owner_agent == null ? null : String(r.owner_agent),
    storageProvider: String(r.storage_provider),
    storagePath: String(r.storage_path),
    sourceUri: r.source_uri == null ? null : String(r.source_uri),
    retentionRule: String(r.retention_rule),
    lifecycleState: String(r.lifecycle_state),
    promptPreview: prompt ? `${prompt.slice(0, 180)}${prompt.length > 180 ? "..." : ""}` : null,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function whySuggestion(kind: string, query: string): string {
  if (kind === "external_model_handoff") {
    return "This looks like a saved external-model prompt. Reuse still needs explicit approval before using the external tool/model.";
  }
  if (kind === "tool_handoff") {
    return "This looks like a saved tool workflow. Check the source URL and limits before using it again.";
  }
  if (kind === "creative_prompt") {
    return "This looks like a saved creative prompt that may be adaptable for similar visual work.";
  }
  if (query) {
    return "This saved prompt matched the title, source, or storage metadata for the request.";
  }
  return "Saved reusable prompt memory.";
}

function queryTerms(query: string): string[] {
  const normalized = query.toLowerCase().replace(/[^a-z0-9.\-_/]+/g, " ");
  const terms = normalized
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));
  return [...new Set(terms)].slice(0, 8);
}

export async function searchPromptHandoffs(query: string, limit = 12) {
  const db = await getCerebroDb();
  const args: (string | number)[] = [...PROMPT_KINDS];
  const where = [`kind IN (${PROMPT_KINDS.map(() => "?").join(", ")})`];
  const trimmedQuery = query.trim();
  const terms = queryTerms(trimmedQuery);

  if (trimmedQuery) {
    const clauses: string[] = [];
    const addSearchClause = (value: string) => {
      clauses.push(`(${SEARCH_FIELDS.map((field) => `${field} LIKE ?`).join(" OR ")})`);
      for (const _field of SEARCH_FIELDS) args.push(`%${value}%`);
    };

    addSearchClause(trimmedQuery);
    for (const term of terms) addSearchClause(term);
    where.push(`(${clauses.join(" OR ")})`);
  }

  args.push(limit);

  const result = await db.execute({
    sql: `
      SELECT id, kind, title, owner_agent, storage_provider, storage_path,
             source_uri, retention_rule, lifecycle_state, prompt_or_instruction,
             created_at, updated_at
      FROM artifacts
      WHERE ${where.join(" AND ")}
        AND lifecycle_state NOT IN ('deleted', 'trash_staged')
      ORDER BY updated_at DESC
      LIMIT ?
    `,
    args,
  });

  const matches = result.rows.map(rowToPromptHandoff);
  return {
    mode: "read_only",
    query: trimmedQuery,
    matches,
    suggestions: matches.slice(0, 3).map((match) => ({
      artifactId: match.id,
      title: match.title ?? `${match.kind} #${match.id}`,
      kind: match.kind,
      storagePath: match.storagePath,
      sourceUri: match.sourceUri,
      promptPreview: match.promptPreview,
      why: whySuggestion(match.kind, trimmedQuery),
      requiredDisclosure:
        "Before reuse, CereBro should tell the user which prompt/tool handoff this is, why it applies, and what would change.",
    })),
  };
}

export const promptHandoffsRouter = router({
  search: publicProcedure
    .input(
      z
        .object({
          query: z.string().max(500).optional(),
          limit: z.number().int().min(1).max(50).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return searchPromptHandoffs(input?.query ?? "", input?.limit ?? 12);
    }),
});
