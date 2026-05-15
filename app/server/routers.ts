import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { agentsRouter } from "./routers/agents";
import { artifactsRouter } from "./routers/artifacts";
import { tasksRouter } from "./routers/tasks";
import { sessionsRouter } from "./routers/sessions";
import { memoryRouter } from "./routers/memory";
import { outputsRouter } from "./routers/outputs";
import { integrationsRouter } from "./routers/integrations";
import { keepRouter } from "./routers/keep";
import { piccoloRouter } from "./routers/piccolo";
import { projectIntelligenceRouter } from "./routers/projectIntelligence";
import { commandIntakeRouter } from "./routers/commandIntake";
import { surferRouter } from "./routers/surfer";
import { handoffsRouter } from "./routers/handoffs";
import { promptHandoffsRouter } from "./routers/promptHandoffs";
import { hedwigRouter } from "./routers/hedwig";
import { terminalLabRouter } from "./routers/terminalLab";
import { approvalsRouter } from "./routers/approvals";
import { workbenchRouter } from "./routers/workbench";
import { companionRouter } from "./routers/companion";
import { modelToolsRouter } from "./routers/modelTools";
import { permissionsRouter } from "./routers/permissions";
import { designReviewRouter } from "./routers/designReview";
import { securityGateRouter } from "./routers/securityGate";
import { ravenRouter } from "./routers/raven";
import { runtimeRouter } from "./routers/runtime";
import { ledgerRouter } from "./routers/ledger";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  agents: agentsRouter,
  artifacts: artifactsRouter,
  tasks: tasksRouter,
  sessions: sessionsRouter,
  memory: memoryRouter,
  outputs: outputsRouter,
  integrations: integrationsRouter,
  keep: keepRouter,
  piccolo: piccoloRouter,
  projectIntelligence: projectIntelligenceRouter,
  commandIntake: commandIntakeRouter,
  surfer: surferRouter,
  handoffs: handoffsRouter,
  promptHandoffs: promptHandoffsRouter,
  hedwig: hedwigRouter,
  terminalLab: terminalLabRouter,
  approvals: approvalsRouter,
  workbench: workbenchRouter,
  companion: companionRouter,
  modelTools: modelToolsRouter,
  permissions: permissionsRouter,
  designReview: designReviewRouter,
  securityGate: securityGateRouter,
  raven: ravenRouter,
  runtime: runtimeRouter,
  ledger: ledgerRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
