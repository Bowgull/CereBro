import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb, recordArtifact } from "../cerebroDb";
import { sourceDisplayName } from "../displayLabels";
import { writeVaultTextArtifact } from "../integrations/vault";
import {
  ARTIFACT_KINDS,
  ARTIFACT_LIFECYCLE_STATES,
  ARTIFACT_STORAGE_PROVIDERS,
  RETENTION_RULES,
  VAULT_TEXT_TARGETS,
  defaultArtifactState,
  defaultRetentionRule,
  type ArtifactKind,
  type VaultTextKind,
} from "../knowledge/contracts";
import { sessionDisplayName } from "./sessions";

const artifactKindSchema = z.enum(ARTIFACT_KINDS);
const lifecycleStateSchema = z.enum(ARTIFACT_LIFECYCLE_STATES);
const retentionRuleSchema = z.enum(RETENTION_RULES);
const storageProviderSchema = z.enum(ARTIFACT_STORAGE_PROVIDERS);

function rowToArtifact(r: Record<string, unknown>) {
  const sessionId = r.session_id == null ? null : Number(r.session_id);
  const sourceUri = r.source_uri == null ? null : String(r.source_uri);
  return {
    id: Number(r.id),
    kind: String(r.kind),
    lifecycleState: String(r.lifecycle_state),
    title: r.title == null ? null : String(r.title),
    projectId: r.project_id == null ? null : Number(r.project_id),
    taskId: r.task_id == null ? null : Number(r.task_id),
    sessionId,
    sessionDisplayName:
      sessionId == null
        ? null
        : sessionDisplayName({
            id: sessionId,
            title: r.session_title == null ? null : String(r.session_title),
            projectName: r.session_project_name == null ? null : String(r.session_project_name),
            heroClass: r.session_hero_class == null ? null : String(r.session_hero_class),
            endedAt: r.session_ended_at == null ? null : Number(r.session_ended_at),
          }),
    ownerAgent: r.owner_agent == null ? null : String(r.owner_agent),
    storageProvider: String(r.storage_provider),
    storagePath: String(r.storage_path),
    sourceUri,
    sourceDisplayName: sourceUri == null ? null : sourceDisplayName(sourceUri),
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
          sessionId: z.number().int().optional(),
          sessionIds: z.array(z.number().int()).max(50).optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.kind) {
        where.push("a.kind = ?");
        args.push(input.kind);
      }
      if (input?.lifecycleState) {
        where.push("a.lifecycle_state = ?");
        args.push(input.lifecycleState);
      }
      if (input?.projectId !== undefined) {
        where.push("a.project_id = ?");
        args.push(input.projectId);
      }
      if (input?.sessionId !== undefined) {
        where.push("a.session_id = ?");
        args.push(input.sessionId);
      }
      if (input?.sessionIds && input.sessionIds.length > 0) {
        where.push(`a.session_id IN (${input.sessionIds.map(() => "?").join(", ")})`);
        args.push(...input.sessionIds);
      }
      args.push(input?.limit ?? 100);
      const result = await db.execute({
        sql: `
          SELECT
            a.id,
            a.kind,
            a.lifecycle_state,
            a.title,
            a.project_id,
            a.task_id,
            a.session_id,
            a.owner_agent,
            a.storage_provider,
            a.storage_path,
            a.source_uri,
            a.retention_rule,
            a.cleanup_eligible_at,
            a.created_at,
            a.updated_at,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            p.name AS session_project_name
          FROM artifacts a
          LEFT JOIN sessions s ON s.id = a.session_id
          LEFT JOIN projects p ON p.id = s.project_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY a.created_at DESC
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
        storageProvider: storageProviderSchema,
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
        lifecycleState: input.lifecycleState ?? defaultArtifactState(input.kind),
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
        retentionRule: input.retentionRule ?? defaultRetentionRule(input.kind),
        sensitiveDataFlag: input.sensitiveDataFlag ?? false,
        clientVisible: input.clientVisible ?? false,
      });
      return { ok: artifactId != null, artifactId };
    }),

  writeTextToVault: publicProcedure
    .input(
      z.object({
        kind: z.enum(Object.keys(VAULT_TEXT_TARGETS) as [VaultTextKind, ...VaultTextKind[]]),
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
      const relativeDir = VAULT_TEXT_TARGETS[input.kind as VaultTextKind];
      const written = await writeVaultTextArtifact({
        relativeDir,
        title: input.title,
        body: input.body,
        ext: input.ext ?? "md",
      });
      if (!written.ok || !written.relativePath) return written;

      const artifactId = await recordArtifact({
        kind: input.kind,
        lifecycleState: input.lifecycleState ?? defaultArtifactState(input.kind as ArtifactKind),
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
        retentionRule: input.retentionRule ?? defaultRetentionRule(input.kind as ArtifactKind),
      });

      return { ...written, artifactId };
    }),
});
