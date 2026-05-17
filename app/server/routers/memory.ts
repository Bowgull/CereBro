import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import {
  getCerebroDb,
  recordArtifact,
  type MemoryKind,
  type MemoryProposalRow,
  type MemoryProposalStatus,
  type MemoryRow,
} from "../cerebroDb";
import { writeObsidianNote } from "../integrations/vault";
import { OBSIDIAN_KNOWLEDGE_ROUTES, OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT } from "../knowledge/contracts";
import { sessionDisplayName } from "./sessions";

const KINDS = ["fact", "note", "reference", "feedback"] as const;
const kindSchema = z.enum(KINDS);

async function readMemoryContract() {
  const db = await getCerebroDb();
  const [entries, proposals] = await Promise.all([
    db.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN kind IN ('fact', 'reference') THEN 1 ELSE 0 END) AS reusable_candidates
      FROM memory_entries
    `),
    db.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN oak_status = 'validated' THEN 1 ELSE 0 END) AS oak_validated,
        SUM(CASE WHEN status = 'written' THEN 1 ELSE 0 END) AS written
      FROM memory_proposals
    `),
  ]);
  const entryRow = entries.rows[0] ?? {};
  const proposalRow = proposals.rows[0] ?? {};
  const normalRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "knowledge");
  const archiveRoute = OBSIDIAN_KNOWLEDGE_ROUTES.find((route) => route.key === "archive");

  return {
    mode: "read_only" as const,
    ownerAgent: "oak" as const,
    supportAgents: ["aang", "spock", "c3po"] as const,
    savedNotes: Number(entryRow.total ?? 0),
    reusableCandidates: Number(entryRow.reusable_candidates ?? 0),
    proposedNotes: Number(proposalRow.total ?? 0),
    pendingProposals: Number(proposalRow.pending ?? 0),
    oakValidatedProposals: Number(proposalRow.oak_validated ?? 0),
    writtenProposals: Number(proposalRow.written ?? 0),
    normalRoute: normalRoute?.relativePath ?? "20_Knowledge",
    archiveRoute: archiveRoute?.relativePath ?? "90_Archive",
    canAutomateRetrieval: false,
    writesExternalSystems: false,
    writesObsidian: false,
    writesMemory: false,
    routeDefaultsChanged: false,
    requiredMetadataFields: OBSIDIAN_RAG_READY_NOTE_METADATA_CONTRACT.requiredFields,
    gates: [
      "Memory proposals require Oak validation before approval.",
      "Reusable notes require current canonical status, active retrieval status, summary, source ids, related notes, and privacy class.",
      "No vector indexing, note scanning, Obsidian write, Notion write, Drive write, model call, or route default change runs from this read.",
    ],
    nextAction: "Validate notes before retrieval or durable knowledge export.",
  };
}

function rowToMemory(r: Record<string, unknown>): MemoryRow {
  const sessionId = r.session_id == null ? null : Number(r.session_id);
  return {
    id: Number(r.id),
    kind: String(r.kind) as MemoryKind,
    body: String(r.body),
    tags: r.tags == null ? null : String(r.tags),
    source: r.source == null ? null : String(r.source),
    projectId: r.project_id == null ? null : Number(r.project_id),
    sessionId,
    sessionDisplayName: sessionLabelFromRow(sessionId, r),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function rowToProposal(r: Record<string, unknown>): MemoryProposalRow {
  const sessionId = r.session_id == null ? null : Number(r.session_id);
  return {
    id: Number(r.id),
    kind: String(r.kind) as MemoryKind,
    body: String(r.body),
    tags: r.tags == null ? null : String(r.tags),
    source: r.source == null ? null : String(r.source),
    projectId: r.project_id == null ? null : Number(r.project_id),
    sessionId,
    sessionDisplayName: sessionLabelFromRow(sessionId, r),
    proposedByAgent: String(r.proposed_by_agent),
    status: String(r.status) as MemoryProposalStatus,
    oakStatus: String(r.oak_status),
    oakNotes: r.oak_notes == null ? null : String(r.oak_notes),
    approvalId: r.approval_id == null ? null : Number(r.approval_id),
    memoryEntryId: r.memory_entry_id == null ? null : Number(r.memory_entry_id),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

function sessionLabelFromRow(sessionId: number | null, r: Record<string, unknown>) {
  if (sessionId == null) return null;
  return sessionDisplayName({
    id: sessionId,
    title: r.session_title == null ? null : String(r.session_title),
    projectName: r.session_project_name == null ? null : String(r.session_project_name),
    heroClass: r.session_hero_class == null ? null : String(r.session_hero_class),
    endedAt: r.session_ended_at == null ? null : Number(r.session_ended_at),
  });
}

export const memoryRouter = router({
  contract: publicProcedure.query(readMemoryContract),

  list: publicProcedure
    .input(
      z
        .object({
          kind: kindSchema.optional(),
          sessionId: z.number().int().optional(),
          sessionIds: z.array(z.number().int()).max(50).optional(),
          search: z.string().max(280).optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const where: string[] = [];
      const args: (string | number)[] = [];
      if (input?.kind) {
        where.push("m.kind = ?");
        args.push(input.kind);
      }
      if (input?.sessionId !== undefined) {
        where.push("m.session_id = ?");
        args.push(input.sessionId);
      }
      if (input?.sessionIds && input.sessionIds.length > 0) {
        where.push(`m.session_id IN (${input.sessionIds.map(() => "?").join(", ")})`);
        args.push(...input.sessionIds);
      }
      if (input?.search) {
        where.push("(m.body LIKE ? OR m.tags LIKE ?)");
        const like = `%${input.search}%`;
        args.push(like, like);
      }
      const limit = input?.limit ?? 200;
      args.push(limit);
      const result = await db.execute({
        sql: `
          SELECT
            m.id,
            m.kind,
            m.body,
            m.tags,
            m.source,
            m.project_id,
            m.session_id,
            m.created_at,
            m.updated_at,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            p.name AS session_project_name
          FROM memory_entries m
          LEFT JOIN sessions s ON s.id = m.session_id
          LEFT JOIN projects p ON p.id = s.project_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY m.created_at DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToMemory);
    }),

  proposals: publicProcedure
    .input(
      z
        .object({
          status: z
            .enum(["pending", "validated", "needs_revision", "blocked", "approved", "written", "rejected"])
            .optional(),
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
      if (input?.status) {
        where.push("mp.status = ?");
        args.push(input.status);
      }
      if (input?.sessionId !== undefined) {
        where.push("mp.session_id = ?");
        args.push(input.sessionId);
      }
      if (input?.sessionIds && input.sessionIds.length > 0) {
        where.push(`mp.session_id IN (${input.sessionIds.map(() => "?").join(", ")})`);
        args.push(...input.sessionIds);
      }
      const limit = input?.limit ?? 100;
      args.push(limit);
      const result = await db.execute({
        sql: `
          SELECT
            mp.id,
            mp.kind,
            mp.body,
            mp.tags,
            mp.source,
            mp.project_id,
            mp.session_id,
            mp.proposed_by_agent,
            mp.status,
            mp.oak_status,
            mp.oak_notes,
            mp.approval_id,
            mp.memory_entry_id,
            mp.created_at,
            mp.updated_at,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            p.name AS session_project_name
          FROM memory_proposals mp
          LEFT JOIN sessions s ON s.id = mp.session_id
          LEFT JOIN projects p ON p.id = s.project_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY mp.created_at DESC
          LIMIT ?
        `,
        args,
      });
      return result.rows.map(rowToProposal);
    }),

  propose: publicProcedure
    .input(
      z.object({
        body: z.string().min(1).max(8000),
        kind: kindSchema.default("note"),
        tags: z.string().max(280).optional(),
        source: z.string().max(280).optional(),
        projectId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
        proposedByAgent: z.string().min(1).max(64).default("aang"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO memory_proposals
            (kind, body, tags, source, project_id, session_id, proposed_by_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          RETURNING id, kind, body, tags, source, project_id, session_id,
                    proposed_by_agent, status, oak_status, oak_notes,
                    approval_id, memory_entry_id, created_at, updated_at
        `,
        args: [
          input.kind,
          input.body,
          input.tags ?? null,
          input.source ?? null,
          input.projectId ?? null,
          input.sessionId ?? null,
          input.proposedByAgent,
        ],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insert returned no row",
        });
      }
      return rowToProposal(row);
    }),

  setProposalOakStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        oakStatus: z.enum(["pending", "validated", "needs_revision", "blocked"]),
        oakNotes: z.string().max(4000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const status =
        input.oakStatus === "validated"
          ? "validated"
          : input.oakStatus === "blocked"
            ? "blocked"
            : input.oakStatus === "needs_revision"
              ? "needs_revision"
              : "pending";
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          UPDATE memory_proposals
          SET oak_status = ?, oak_notes = ?, status = ?, updated_at = unixepoch()
          WHERE id = ? AND status != 'written'
          RETURNING id, kind, body, tags, source, project_id, session_id,
                    proposed_by_agent, status, oak_status, oak_notes,
                    approval_id, memory_entry_id, created_at, updated_at
        `,
        args: [input.oakStatus, input.oakNotes ?? null, status, input.id],
      });
      const row = result.rows[0];
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: `No open proposal ${input.id}` });
      return rowToProposal(row);
    }),

  approveProposal: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        approvalReason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const proposalResult = await db.execute({
        sql: `
          SELECT id, kind, body, tags, source, project_id, session_id,
                 proposed_by_agent, status, oak_status, oak_notes,
                 approval_id, memory_entry_id, created_at, updated_at
          FROM memory_proposals
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const proposal = proposalResult.rows[0];
      if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: `No proposal ${input.id}` });
      if (String(proposal.oak_status) !== "validated") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Oak must validate the memory proposal before approval.",
        });
      }
      if (String(proposal.status) === "written") {
        return rowToProposal(proposal);
      }

      const approval = await db.execute({
        sql: `
          INSERT INTO approvals
            (action_type, target_type, target_id, requested_by_agent, status, reason, decided_at)
          VALUES ('memory_write', 'memory_proposal', ?, ?, 'approved', ?, unixepoch())
          RETURNING id
        `,
        args: [input.id, String(proposal.proposed_by_agent), input.approvalReason ?? null],
      });
      const approvalId = Number(approval.rows[0]!.id);

      const inserted = await db.execute({
        sql: `
          INSERT INTO memory_entries (kind, body, tags, source, project_id, session_id)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING id
        `,
        args: [
          String(proposal.kind),
          String(proposal.body),
          proposal.tags == null ? null : String(proposal.tags),
          proposal.source == null ? null : String(proposal.source),
          proposal.project_id == null ? null : Number(proposal.project_id),
          proposal.session_id == null ? null : Number(proposal.session_id),
        ],
      });
      const memoryEntryId = Number(inserted.rows[0]!.id);
      await recordArtifact({
        kind: "memory_note",
        lifecycleState: "active",
        title: String(proposal.body).split(/\r?\n/)[0]?.slice(0, 120) || `Memory ${memoryEntryId}`,
        projectId: proposal.project_id == null ? null : Number(proposal.project_id),
        sessionId: proposal.session_id == null ? null : Number(proposal.session_id),
        ownerAgent: String(proposal.proposed_by_agent),
        storageProvider: "local",
        storagePath: `memory_entries:${memoryEntryId}`,
        sourceUri: proposal.source == null ? null : String(proposal.source),
        byteSize: Buffer.byteLength(String(proposal.body), "utf8"),
        mimeType: "text/plain",
        approvalId,
        retentionRule: "keep_forever",
      });

      const updated = await db.execute({
        sql: `
          UPDATE memory_proposals
          SET status = 'written',
              approval_id = ?,
              memory_entry_id = ?,
              updated_at = unixepoch()
          WHERE id = ?
          RETURNING id, kind, body, tags, source, project_id, session_id,
                    proposed_by_agent, status, oak_status, oak_notes,
                    approval_id, memory_entry_id, created_at, updated_at
        `,
        args: [approvalId, memoryEntryId, input.id],
      });
      if (!updated.rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: `No proposal ${input.id}` });
      const withSession = await db.execute({
        sql: `
          SELECT
            mp.id,
            mp.kind,
            mp.body,
            mp.tags,
            mp.source,
            mp.project_id,
            mp.session_id,
            mp.proposed_by_agent,
            mp.status,
            mp.oak_status,
            mp.oak_notes,
            mp.approval_id,
            mp.memory_entry_id,
            mp.created_at,
            mp.updated_at,
            s.title AS session_title,
            s.hero_class AS session_hero_class,
            s.ended_at AS session_ended_at,
            p.name AS session_project_name
          FROM memory_proposals mp
          LEFT JOIN sessions s ON s.id = mp.session_id
          LEFT JOIN projects p ON p.id = s.project_id
          WHERE mp.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      return rowToProposal(withSession.rows[0] ?? updated.rows[0]);
    }),

  create: publicProcedure
    .input(
      z.object({
        body: z.string().min(1).max(8000),
        kind: kindSchema.default("note"),
        tags: z.string().max(280).optional(),
        source: z.string().max(280).optional(),
        projectId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          INSERT INTO memory_entries (kind, body, tags, source, project_id, session_id)
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING id, kind, body, tags, source, project_id, session_id,
                    created_at, updated_at
        `,
        args: [
          input.kind,
          input.body,
          input.tags ?? null,
          input.source ?? null,
          input.projectId ?? null,
          input.sessionId ?? null,
        ],
      });
      const row = result.rows[0];
      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Insert returned no row",
        });
      }
      const memory = rowToMemory(row);
      await recordArtifact({
        kind: "memory_note",
        lifecycleState: "active",
        title: memory.body.split(/\r?\n/)[0]?.slice(0, 120) || `Memory ${memory.id}`,
        projectId: memory.projectId,
        sessionId: memory.sessionId,
        ownerAgent: "aang",
        storageProvider: "local",
        storagePath: `memory_entries:${memory.id}`,
        sourceUri: memory.source,
        byteSize: Buffer.byteLength(memory.body, "utf8"),
        mimeType: "text/plain",
        retentionRule: "keep_forever",
      });
      return memory;
    }),

  writeToObsidian: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(180),
        body: z.string().min(1).max(40000),
        subdir: z.string().max(120).optional(),
        projectId: z.number().int().optional(),
        sessionId: z.number().int().optional(),
        source: z.string().max(280).optional(),
        approved: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const written = await writeObsidianNote({
        title: input.title,
        body: input.body,
        subdir: input.subdir,
      });
      if (!written.ok || !written.relativePath) return written;

      const artifactId = await recordArtifact({
        kind: "obsidian_note",
        lifecycleState: "published",
        title: input.title,
        projectId: input.projectId ?? null,
        sessionId: input.sessionId ?? null,
        ownerAgent: "c3po",
        storageProvider: "obsidian",
        storagePath: written.relativePath,
        sourceUri: input.source ?? null,
        byteSize: Buffer.byteLength(input.body, "utf8"),
        mimeType: "text/markdown",
        retentionRule: "keep_forever",
      });

      return { ...written, artifactId };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number().int(), approved: z.literal(true) }))
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      await db.execute({
        sql: `DELETE FROM memory_entries WHERE id = ?`,
        args: [input.id],
      });
      return { ok: true } as const;
    }),
});
