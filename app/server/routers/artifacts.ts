import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, recordArtifact } from "../cerebroDb";
import { writeVaultTextArtifact } from "../integrations/vault";

const artifactKindSchema = z.enum([
  "source_url",
  "source_file",
  "source_screenshot",
  "source_note",
  "creative_prompt",
  "reusable_prompt",
  "tool_handoff",
  "external_model_handoff",
  "creative_image",
  "creative_video",
  "obsidian_note",
  "notion_page",
  "memory_note",
  "output_text",
  "output_markdown",
  "output_code",
  "output_diff",
  "output_file",
  "render_intermediate",
  "render_export",
  "message_draft",
  "message_sent",
  "message_follow_up",
  "message_capture",
  "session_handoff",
  "code_handoff",
  "qa_report",
  "model_test",
  "temp_file",
  "cleanup_report",
]);

const lifecycleStateSchema = z.enum([
  "inbox",
  "active",
  "review",
  "published",
  "superseded",
  "archived",
  "temp",
  "trash_staged",
  "deleted",
]);

const retentionRuleSchema = z.enum([
  "keep_forever",
  "keep_until_project_archive",
  "archive_when_superseded",
  "review_after_7_days",
  "review_after_30_days",
  "delete_after_approval",
  "delete_after_approved_rule",
]);

const vaultTextTargets = {
  source_note: "02_Sources/notes",
  creative_prompt: "04_Creative/images/prompts",
  reusable_prompt: "08_System/manifests/prompts",
  tool_handoff: "08_System/manifests/tool-handoffs",
  external_model_handoff: "08_System/manifests/external-model-handoffs",
  message_draft: "06_Messages/drafts",
  message_sent: "06_Messages/sent",
  message_follow_up: "06_Messages/follow-ups",
  code_handoff: "05_Code/handoffs",
  qa_report: "05_Code/qa-reports",
  model_test: "08_System/model-tests",
  temp_file: "09_Temp/scratch",
  cleanup_report: "08_System/cleanup-reports",
  session_handoff: "08_System/logs",
} as const;

type VaultTextKind = keyof typeof vaultTextTargets;

function defaultState(kind: string): z.infer<typeof lifecycleStateSchema> {
  if (kind === "temp_file" || kind === "render_intermediate") return "temp";
  if (kind === "message_draft" || kind === "source_note") return "review";
  if (kind === "message_sent" || kind === "render_export") return "published";
  return "active";
}

function defaultRetention(kind: string): z.infer<typeof retentionRuleSchema> {
  if (kind === "temp_file" || kind === "render_intermediate") return "review_after_7_days";
  if (kind.startsWith("creative_")) return "review_after_30_days";
  if (kind === "message_sent" || kind === "cleanup_report") return "keep_forever";
  return "delete_after_approval";
}

function rowToArtifact(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    kind: String(r.kind),
    lifecycleState: String(r.lifecycle_state),
    title: r.title == null ? null : String(r.title),
    projectId: r.project_id == null ? null : Number(r.project_id),
    taskId: r.task_id == null ? null : Number(r.task_id),
    sessionId: r.session_id == null ? null : Number(r.session_id),
    ownerAgent: r.owner_agent == null ? null : String(r.owner_agent),
    storageProvider: String(r.storage_provider),
    storagePath: String(r.storage_path),
    sourceUri: r.source_uri == null ? null : String(r.source_uri),
    retentionRule: String(r.retention_rule),
    cleanupEligibleAt: r.cleanup_eligible_at == null ? null : Number(r.cleanup_eligible_at),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

export const artifactsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          kind: artifactKindSchema.optional(),
          lifecycleState: lifecycleStateSchema.optional(),
          projectId: z.number().int().optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.kind) {
        where.push("kind = ?");
        args.push(input.kind);
      }
      if (input?.lifecycleState) {
        where.push("lifecycle_state = ?");
        args.push(input.lifecycleState);
      }
      if (input?.projectId !== undefined) {
        where.push("project_id = ?");
        args.push(input.projectId);
      }
      args.push(input?.limit ?? 100);
      const result = await db.execute({
        sql: `
          SELECT id, kind, lifecycle_state, title, project_id, task_id,
                 session_id, owner_agent, storage_provider, storage_path,
                 source_uri, retention_rule, cleanup_eligible_at,
                 created_at, updated_at
          FROM artifacts
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY created_at DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToArtifact);
    }),

  recordExternal: publicProcedure
    .input(
      z.object({
        kind: artifactKindSchema,
        title: z.string().min(1).max(240),
        storageProvider: z.enum(["vault", "obsidian", "notion", "repo", "local", "external"]),
        storagePath: z.string().min(1).max(1000),
        lifecycleState: lifecycleStateSchema.optional(),
        projectId: z.number().int().optional(),
        taskId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
        ownerAgent: z.string().max(64).optional(),
        sourceUri: z.string().max(1000).optional(),
        byteSize: z.number().int().nonnegative().optional(),
        mimeType: z.string().max(120).optional(),
        retentionRule: retentionRuleSchema.optional(),
        sensitiveDataFlag: z.boolean().optional(),
        clientVisible: z.boolean().optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const artifactId = await recordArtifact({
        kind: input.kind,
        lifecycleState: input.lifecycleState ?? defaultState(input.kind),
        title: input.title,
        projectId: input.projectId ?? null,
        taskId: input.taskId ?? null,
        sessionId: input.sessionId ?? null,
        ownerAgent: input.ownerAgent ?? null,
        storageProvider: input.storageProvider,
        storagePath: input.storagePath,
        sourceUri: input.sourceUri ?? null,
        byteSize: input.byteSize ?? null,
        mimeType: input.mimeType ?? null,
        retentionRule: input.retentionRule ?? defaultRetention(input.kind),
        sensitiveDataFlag: input.sensitiveDataFlag ?? false,
        clientVisible: input.clientVisible ?? false,
      });
      return { ok: artifactId != null, artifactId };
    }),

  writeTextToVault: publicProcedure
    .input(
      z.object({
        kind: z.enum([
          "source_note",
          "creative_prompt",
          "reusable_prompt",
          "tool_handoff",
          "external_model_handoff",
          "message_draft",
          "message_sent",
          "message_follow_up",
          "code_handoff",
          "qa_report",
          "model_test",
          "temp_file",
          "cleanup_report",
        ]),
        title: z.string().min(1).max(180),
        body: z.string().min(1).max(50000),
        ext: z.string().max(8).optional(),
        lifecycleState: lifecycleStateSchema.optional(),
        projectId: z.number().int().optional(),
        taskId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
        ownerAgent: z.string().max(64).optional(),
        sourceUri: z.string().max(1000).optional(),
        retentionRule: retentionRuleSchema.optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const relativeDir = vaultTextTargets[input.kind as VaultTextKind];
      const written = await writeVaultTextArtifact({
        relativeDir,
        title: input.title,
        body: input.body,
        ext: input.ext ?? "md",
      });
      if (!written.ok || !written.relativePath) return written;

      const artifactId = await recordArtifact({
        kind: input.kind,
        lifecycleState: input.lifecycleState ?? defaultState(input.kind),
        title: input.title,
        projectId: input.projectId ?? null,
        taskId: input.taskId ?? null,
        sessionId: input.sessionId ?? null,
        ownerAgent: input.ownerAgent ?? null,
        storageProvider: "vault",
        storagePath: written.relativePath,
        sourceUri: input.sourceUri ?? null,
        promptOrInstruction: [
          "creative_prompt",
          "reusable_prompt",
          "tool_handoff",
          "external_model_handoff",
        ].includes(input.kind) ? input.body.slice(0, 4000) : null,
        byteSize: Buffer.byteLength(input.body, "utf8"),
        mimeType: input.ext === "txt" ? "text/plain" : "text/markdown",
        retentionRule: input.retentionRule ?? defaultRetention(input.kind),
      });

      return { ...written, artifactId };
    }),
});
