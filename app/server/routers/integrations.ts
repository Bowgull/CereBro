import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getNotionStatus,
  pollInbox,
  publishToOutbox,
} from "../integrations/notion";
import { getVaultStatus } from "../integrations/vault";

export const integrationsRouter = router({
  status: publicProcedure.query(async () => {
    const [notion, vault] = await Promise.all([getNotionStatus(), getVaultStatus()]);
    return { notion, vault };
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
      }),
    )
    .mutation(async ({ input }) => {
      return publishToOutbox(input);
    }),
});
