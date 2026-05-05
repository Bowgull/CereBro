import { publicProcedure, router } from "../_core/trpc";
import { AGENT_ROUTING, resolveModelForAgent } from "../agentRouter";

export const keepRouter = router({
  agents: publicProcedure.query(() => {
    return AGENT_ROUTING.map((a) => ({
      ...a,
      resolvedModel: resolveModelForAgent(a.id),
    }));
  }),
});
