import { publicProcedure, router } from "../_core/trpc";
import { getNotionStatus } from "../integrations/notion";
import { getVaultStatus } from "../integrations/vault";

export const integrationsRouter = router({
  status: publicProcedure.query(async () => {
    const [notion, vault] = await Promise.all([
      Promise.resolve(getNotionStatus()),
      getVaultStatus(),
    ]);
    return { notion, vault };
  }),
});
