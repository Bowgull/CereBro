import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCerebroDb,
  recordArtifact,
  type OutputKind,
  type OutputRow,
} from "../cerebroDb";
import { writeOutput as vaultWriteOutput } from "../integrations/vault";
import { sessionDisplayName } from "./sessions";

const KINDS = ["text", "code", "file", "diff", "tool_result"] as const;

function artifactKindForOutput(kind: string, ext: string): string {
  if (kind === "code") return "output_code";
  if (kind === "diff") return "output_diff";
  if (kind === "file") return "output_file";
  if (ext === "md") return "output_markdown";
  return "output_text";
}

function rowToOutput(r: Record<string, unknown>): OutputRow {
  const sessionId = r.session_id == null ? null : Number(r.session_id);
  return {
    id: Number(r.id),
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
    projectId: r.project_id == null ? null : Number(r.project_id),
    kind: String(r.kind) as OutputKind,
    title: r.title == null ? null : String(r.title),
    body: String(r.body),
    toolName: r.tool_name == null ? null : String(r.tool_name),
    createdAt: Number(r.created_at),
  };
}

export const outputsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          sessionId: z.number().int().optional(),
          projectId: z.number().int().optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.sessionId !== undefined) {
        where.push("o.session_id = ?");
        args.push(input.sessionId);
      }
      if (input?.projectId !== undefined) {
        where.push("o.project_id = ?");
        args.push(input.projectId);
      }
      const limit = input?.limit ?? 100;
      args.push(limit);
      const result = await db.execute({
        sql: `
          SELECT
            o.id,
            o.session_id,
            o.project_id,
            o.kind,
            o.title,
            o.body,
            o.tool_name,
            o.created_at,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            p.name AS session_project_name
          FROM outputs o
          LEFT JOIN sessions s ON s.id = o.session_id
          LEFT JOIN projects p ON p.id = s.project_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY o.created_at DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToOutput);
    }),

  writeToVault: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        ext: z.string().max(8).optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT
            o.id,
            o.session_id,
            o.project_id,
            o.title,
            o.body,
            o.kind,
            s.claude_session_id
          FROM outputs o
          LEFT JOIN sessions s ON s.id = o.session_id
          WHERE o.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `No output ${input.id}` });
      }
      const kind = String(row.kind);
      const ext =
        input.ext ??
        (kind === "code" ? "txt" : kind === "diff" ? "diff" : kind === "file" ? "txt" : "md");
      const written = await vaultWriteOutput({
        outputId: Number(row.id),
        sessionClaudeId: row.claude_session_id == null ? null : String(row.claude_session_id),
        title: row.title == null ? null : String(row.title),
        body: String(row.body),
        ext,
      });
      if (!written.ok || !written.relativePath) return written;

      const artifactId = await recordArtifact({
        kind: artifactKindForOutput(kind, ext),
        lifecycleState: "active",
        title: row.title == null ? null : String(row.title),
        projectId: row.project_id == null ? null : Number(row.project_id),
        sessionId: row.session_id == null ? null : Number(row.session_id),
        ownerAgent: "c3po",
        storageProvider: "vault",
        storagePath: written.relativePath,
        byteSize: Buffer.byteLength(String(row.body), "utf8"),
        mimeType: ext === "md" ? "text/markdown" : "text/plain",
        retentionRule: "keep_until_project_archive",
      });

      return { ...written, artifactId };
    }),
});
