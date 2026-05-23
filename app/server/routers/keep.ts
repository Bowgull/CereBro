import { publicProcedure, router } from "../_core/trpc";
import { AGENT_ROUTING, resolveModelForAgent } from "../agentRouter";
import { getSkillById, listSkillFiles } from "../skillLoader";
import { z } from "zod";

export const keepRouter = router({
  agents: publicProcedure.query(() => {
    return AGENT_ROUTING.map((a) => ({
      ...a,
      resolvedModel: resolveModelForAgent(a.id),
    }));
  }),
  skills: publicProcedure.query(() => {
    return listSkillFiles().map(({ content: _content, ...skill }) => skill);
  }),
  skill: publicProcedure
    .input(z.object({ id: z.string().min(1).max(120) }))
    .query(({ input }) => {
      return getSkillById(input.id) ?? null;
    }),
});
