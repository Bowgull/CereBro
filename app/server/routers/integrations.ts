import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getNotionStatus,
  pollInbox,
  publishToOutbox,
} from "../integrations/notion";
import {
  getObsidianKnowledgeRoutes,
  getObsidianStatus,
  getVaultLayout,
  getVaultStatus,
  OBSIDIAN_CANONICAL_STATUSES,
  OBSIDIAN_PRIVACY_CLASSES,
  OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT,
  OBSIDIAN_RAG_READY_CRITERIA,
  OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
  OBSIDIAN_RETRIEVAL_STATUSES,
} from "../integrations/vault";

export const integrationsRouter = router({
  status: publicProcedure.query(async () => {
    const [notion, vault, obsidian] = await Promise.all([
      getNotionStatus(),
      getVaultStatus(),
      getObsidianStatus(),
    ]);
    const vaultLayout = getVaultLayout();
    const obsidianKnowledgeRoutes = getObsidianKnowledgeRoutes();
    const archiveOnlyRoutes = obsidianKnowledgeRoutes.filter((route) => route.retrievalDefault === "archive_only").length;
    const includedRouteKeys = obsidianKnowledgeRoutes
      .filter((route) => route.retrievalDefault === "include_index" || route.retrievalDefault === "include_when_validated")
      .map((route) => route.key);
    return {
      notion,
      vault,
      obsidian,
      vaultLayout,
      obsidianKnowledgeRoutes,
      obsidianRetrievalContract: {
        fields: OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
        canonicalStatuses: OBSIDIAN_CANONICAL_STATUSES,
        retrievalStatuses: OBSIDIAN_RETRIEVAL_STATUSES,
        privacyClasses: OBSIDIAN_PRIVACY_CLASSES,
        ragReadyCriteria: OBSIDIAN_RAG_READY_CRITERIA,
        ragReadyNoteMetadataContract: OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT,
      },
      obsidianRetrievalMetadataFields: OBSIDIAN_RETRIEVAL_METADATA_FIELDS,
      knowledgeReadiness: {
        mode: "read_only" as const,
        vaultRoutes: vaultLayout.length,
        obsidianRoutes: obsidianKnowledgeRoutes.length,
        requiredMetadataFields: OBSIDIAN_RETRIEVAL_METADATA_FIELDS.length,
        includedRouteKeys,
        archiveOnlyRoutes,
        canAutomateRetrieval: false,
        rule: "Knowledge contracts are visible before retrieval automation. No note scan, vector index, source fetch, or vault write runs from this read.",
        nextAction: "Validate notes with current metadata before normal retrieval or source automation.",
      },
    };
  }),
  notionPollInbox: publicProcedure.mutation(async () => {
    return pollInbox();
  }),
  notionPublish: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(280),
        body: z.string().min(1).max(20000),
        type: z.enum(["Guide", "Summary", "Brief", "Report", "Note"]).optional(),
        tags: z.array(z.string().max(40)).max(20).optional(),
        project: z.string().max(120).optional(),
        sessionRef: z.string().max(120).optional(),
        sessionId: z.number().int().optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.approved !== true) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Notion publishes require explicit approval.",
        });
      }
      return publishToOutbox(input);
    }),
});
