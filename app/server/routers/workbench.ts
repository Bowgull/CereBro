import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getCerebroDb } from "../cerebroDb";
import { type PerceptionClass, recordPermissionPreflight } from "../permissionPolicy";

const evidenceKinds = [
  "manual_note",
  "localhost_preview",
  "public_browser",
  "screenshot",
  "image_review",
  "video_frame",
  "annotation",
  "terminal_output",
  "validation_note",
  "before_after",
] as const;

const permissionClasses = ["manual_note", "local_preview", "public_browser", "media_review", "annotation", "validation"] as const;
const validationAgents = ["oak", "spock"] as const;
const evidenceGroupBys = ["project", "task", "session", "kind", "source", "command", "artifact", "validation_status"] as const;

function rowToEvidence(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    kind: String(row.kind),
    title: String(row.title),
    summary: String(row.summary),
    targetUri: row.target_uri == null ? null : String(row.target_uri),
    projectId: row.project_id == null ? null : Number(row.project_id),
    projectName: row.project_name == null ? null : String(row.project_name),
    taskId: row.task_id == null ? null : Number(row.task_id),
    sessionId: row.session_id == null ? null : Number(row.session_id),
    sourceId: row.source_id == null ? null : Number(row.source_id),
    commandObservationId: row.command_observation_id == null ? null : Number(row.command_observation_id),
    artifactId: row.artifact_id == null ? null : Number(row.artifact_id),
    ownerAgent: String(row.owner_agent),
    routeAgent: row.route_agent == null ? null : String(row.route_agent),
    viewport: row.viewport == null ? null : String(row.viewport),
    coordinates: row.coordinates == null ? null : String(row.coordinates),
    annotationText: row.annotation_text == null ? null : String(row.annotation_text),
    validationStatus: String(row.validation_status),
    permissionClass: String(row.permission_class),
    permissionPreflightId: row.permission_preflight_id == null ? null : Number(row.permission_preflight_id),
    sensitive: Boolean(row.sensitive_data_flag),
    createdAt: Number(row.created_at),
    taskTitle: row.task_title == null ? null : String(row.task_title),
    sessionClaudeId: row.claude_session_id == null ? null : String(row.claude_session_id),
    sourceTitle: row.source_title == null ? null : String(row.source_title),
    sourceUri: row.source_uri == null ? null : String(row.source_uri),
    command: row.command == null ? null : String(row.command),
    artifactTitle: row.artifact_title == null ? null : String(row.artifact_title),
    artifactPath: row.storage_path == null ? null : String(row.storage_path),
  };
}

function preflightInputForEvidence(input: {
  permissionClass: (typeof permissionClasses)[number];
}) {
  const perceptionClass: PerceptionClass =
    input.permissionClass === "public_browser" ? "public_browser"
    : input.permissionClass === "local_preview" ? "local_files"
    : input.permissionClass === "manual_note" ? "explicit_context"
    : "workbench_media";

  const additionalReasons = ["Workbench evidence records are local append-only history."];
  if (input.permissionClass === "media_review" || input.permissionClass === "annotation") {
    additionalReasons.push("Local Workbench evidence and annotations may be recorded without opening browser/media capture tools.");
  }
  if (input.permissionClass === "local_preview") {
    additionalReasons.push("Local preview metadata can be recorded as evidence, but opening or capturing a preview stays separately gated.");
  }
  if (input.permissionClass === "validation") {
    additionalReasons.push("Validation notes are local evidence records. They do not approve external claims or actions.");
  }

  return {
    perceptionClass,
    actionClass: "local_note" as const,
    additionalReasons,
  };
}

async function recordEvidencePreflight(input: {
  permissionClass: (typeof permissionClasses)[number];
  sensitive: boolean;
  requestedByAgent: string;
  targetSummary: string;
}) {
  const db = await getCerebroDb();
  const preflight = preflightInputForEvidence({
    permissionClass: input.permissionClass,
  });
  const { row } = await recordPermissionPreflight(db, {
    perceptionClass: preflight.perceptionClass,
    actionClass: preflight.actionClass,
    sensitiveData: input.sensitive,
    requestedByAgent: input.requestedByAgent,
    targetSummary: input.targetSummary,
    additionalReasons: preflight.additionalReasons,
  });
  return Number(row.id);
}

function evidenceWhere(input?: {
  projectId?: number;
  kind?: (typeof evidenceKinds)[number];
  query?: string;
}) {
  const where: string[] = [];
  const args: (number | string)[] = [];
  if (input?.projectId !== undefined) {
    where.push("wer.project_id = ?");
    args.push(input.projectId);
  }
  if (input?.kind !== undefined) {
    where.push("wer.kind = ?");
    args.push(input.kind);
  }
  const query = input?.query?.trim();
  if (query) {
    where.push(`
      (
        wer.title LIKE ?
        OR wer.summary LIKE ?
        OR COALESCE(wer.target_uri, '') LIKE ?
        OR COALESCE(wer.validation_status, '') LIKE ?
        OR COALESCE(p.name, '') LIKE ?
        OR COALESCE(t.title, '') LIKE ?
        OR COALESCE(s.claude_session_id, '') LIKE ?
        OR COALESCE(src.title, '') LIKE ?
        OR COALESCE(src.uri, '') LIKE ?
        OR COALESCE(co.command, '') LIKE ?
        OR COALESCE(a.title, '') LIKE ?
        OR COALESCE(a.storage_path, '') LIKE ?
      )
    `);
    const like = `%${query}%`;
    args.push(like, like, like, like, like, like, like, like, like, like, like, like);
  }
  return { where, args };
}

export const workbenchRouter = router({
  plan: publicProcedure.query(() => ({
    mode: "proposal_only" as const,
    writesExternal: false,
    opensBrowser: false,
    capturesMedia: false,
    ownerAgent: "cortana",
    supportAgents: ["gojo", "surfer", "tony", "oak", "spock", "aang"],
    summary:
      "The modular workbench is the visible evidence surface for previews, browser views, screenshots, images, video frames, annotations, terminal output, validation notes, and before/after review.",
    surfaces: [
      {
        id: "localhost_preview",
        label: "Localhost preview",
        ownerAgent: "tony",
        status: "planned",
        permission: "Requires explicit local preview approval and a target URL.",
        records: ["url", "project_id", "task_id", "session_id", "opened_at", "last_refresh_at"],
      },
      {
        id: "public_browser",
        label: "Public browser view",
        ownerAgent: "surfer",
        status: "planned",
        permission: "Public HTTP/HTTPS only. No login, private workspace, crawling, or form submission without separate approval.",
        records: ["url", "source_id", "trust_level", "freshness_status", "opened_at"],
      },
      {
        id: "screenshots",
        label: "Screenshots",
        ownerAgent: "gojo",
        status: "planned",
        permission: "Capture only from approved workbench targets.",
        records: ["image_path", "target_url", "viewport", "created_at", "owner_agent"],
      },
      {
        id: "image_video_review",
        label: "Image and video review",
        ownerAgent: "gojo",
        status: "partially_live",
        permission: "Local/uploaded/generated assets only. Temporary image previews stay browser-local. Durable saves use vault artifact rules.",
        records: ["file_name", "mime_type", "byte_size", "artifact_id", "frame_time", "media_kind", "notes"],
      },
      {
        id: "annotation_canvas",
        label: "Annotation canvas",
        ownerAgent: "gojo",
        status: "planned",
        permission: "Annotations are local evidence records. Routing to agents is explicit.",
        records: ["x", "y", "width", "height", "viewport", "note", "target_agent", "project_id", "task_id", "session_id"],
      },
      {
        id: "terminal_output",
        label: "Terminal and log output",
        ownerAgent: "tony",
        status: "partially_live",
        permission: "Read from Terminal Lab observations only. No command execution from Workbench.",
        records: ["command_observation_id", "output_summary", "risk", "status"],
      },
      {
        id: "validation_notes",
        label: "Validation notes",
        ownerAgent: "oak",
        status: "partially_live",
        permission: "Deterministic preflight notes are allowed. Human approval still gates action.",
        records: ["validator_agent", "target_type", "target_id", "findings"],
      },
      {
        id: "before_after",
        label: "Before and after comparison",
        ownerAgent: "spock",
        status: "planned",
        permission: "Compare approved local evidence records. No hidden capture.",
        records: ["before_artifact_id", "after_artifact_id", "comparison_notes", "result"],
      },
    ],
    permissionModel: [
      {
        class: "local_preview",
        allowed: ["Open approved localhost URL", "Refresh view", "Record visible target metadata"],
        blocked: ["Start dev server automatically", "Edit repo", "Run terminal commands"],
      },
      {
        class: "public_browser",
        allowed: ["Open approved public URL", "Record source metadata", "Route visible evidence to Surfer/Oak"],
        blocked: ["Login", "Private pages", "Crawling", "Form submission", "Download without approval"],
      },
      {
        class: "media_review",
        allowed: ["Show local artifact", "Capture annotation coordinates", "Create local review notes"],
        blocked: ["Generate new media", "Save durable artifact", "Upload externally"],
      },
      {
        class: "annotation",
        allowed: ["Attach coordinates to a task/session/project", "Route note to selected agent"],
        blocked: ["Mutate target file", "Approve implementation", "Write external notes"],
      },
      {
        class: "validation",
        allowed: ["Show Oak/Spock preflight notes", "Link evidence records"],
        blocked: ["Mark high-stakes claims validated without review", "Approve external action"],
      },
    ],
    groupingModel: [
      "Project grouping shows which local project owns the evidence.",
      "Source grouping shows saved-source links without fetching the source.",
      "Command grouping shows Terminal Lab observation links without executing the command.",
      "Validation grouping shows current local status based on appended records.",
    ],
    evidenceRecordShape: {
      required: ["kind", "target_uri_or_artifact", "project_id", "task_id", "session_id", "owner_agent", "created_at"],
      optional: ["source_id", "command_observation_id", "viewport", "coordinates", "annotation_text", "validation_status"],
      appendOnly: true,
      note: "Evidence records are history. They append or version. Current-state summaries can update separately.",
    },
    gates: [
      "This plan does not open a browser, iframe, camera, file picker, screenshot tool, video tool, or terminal.",
      "Workbench evidence must be user-visible and agent-readable.",
      "Browser, media capture, durable saves, external tools, and command execution each need explicit approval when implemented.",
    ],
  })),

  evidence: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().int().optional(),
          kind: z.enum(evidenceKinds).optional(),
          query: z.string().max(200).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const { where, args } = evidenceWhere(input);
      args.push(input?.limit ?? 30);
      const result = await db.execute({
        sql: `
          SELECT wer.*, p.name AS project_name
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY wer.created_at DESC, wer.id DESC
          LIMIT ?
        `,
        args,
      });
      const items = result.rows.map(rowToEvidence);
      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        items,
        summary: {
          total: items.length,
          sensitive: items.filter((item) => item.sensitive).length,
          annotations: items.filter((item) => item.kind === "annotation").length,
          validationNotes: items.filter((item) => item.kind === "validation_note").length,
        },
        gates: [
          "Workbench evidence is local append-only history.",
          "Listing evidence does not open browser/media tools, execute commands, or write externally.",
        ],
      };
    }),

  evidenceGroups: publicProcedure
    .input(
      z
        .object({
          groupBy: z.enum(evidenceGroupBys).default("project"),
          projectId: z.number().int().optional(),
          kind: z.enum(evidenceKinds).optional(),
          query: z.string().max(200).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const groupBy = input?.groupBy ?? "project";
      const { where, args } = evidenceWhere(input);
      const result = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            t.title AS task_title,
            s.claude_session_id,
            src.title AS source_title,
            src.uri AS source_uri,
            co.command,
            a.title AS artifact_title,
            a.storage_path
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY wer.created_at DESC, wer.id DESC
          LIMIT 300
        `,
        args,
      });
      const groups = new Map<string, {
        key: string;
        label: string;
        count: number;
        sensitive: number;
        validationNotes: number;
        latestAt: number;
        sampleIds: number[];
      }>();
      for (const row of result.rows) {
        const item = rowToEvidence(row);
        const key =
          groupBy === "project" ? String(item.projectId ?? "unlinked")
          : groupBy === "task" ? String(item.taskId ?? "unlinked")
          : groupBy === "session" ? String(item.sessionId ?? "unlinked")
          : groupBy === "kind" ? item.kind
          : groupBy === "source" ? String(item.sourceId ?? "unlinked")
          : groupBy === "command" ? String(item.commandObservationId ?? "unlinked")
          : groupBy === "artifact" ? String(item.artifactId ?? "unlinked")
          : item.validationStatus;
        const label =
          groupBy === "project" ? (item.projectName ?? "Unlinked project")
          : groupBy === "task" ? (item.taskTitle ?? "Unlinked task")
          : groupBy === "session" ? (item.sessionClaudeId ?? "Unlinked session")
          : groupBy === "kind" ? item.kind.replace(/_/g, " ")
          : groupBy === "source" ? (item.sourceTitle ?? item.sourceUri ?? "Unlinked source")
          : groupBy === "command" ? (item.command ?? "Unlinked command")
          : groupBy === "artifact" ? (item.artifactTitle ?? item.artifactPath ?? "Unlinked artifact")
          : item.validationStatus.replace(/_/g, " ");
        const existing = groups.get(key) ?? {
          key,
          label,
          count: 0,
          sensitive: 0,
          validationNotes: 0,
          latestAt: 0,
          sampleIds: [],
        };
        existing.count += 1;
        existing.sensitive += item.sensitive ? 1 : 0;
        existing.validationNotes += item.kind === "validation_note" ? 1 : 0;
        existing.latestAt = Math.max(existing.latestAt, item.createdAt);
        if (existing.sampleIds.length < 4) existing.sampleIds.push(item.id);
        groups.set(key, existing);
      }

      return {
        mode: "read_only" as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        executesCommand: false,
        groupBy,
        groups: Array.from(groups.values()).sort((a, b) => b.count - a.count || b.latestAt - a.latestAt),
        gates: [
          "Evidence grouping reads local records only.",
          "Source and command groups are links to existing metadata. They do not fetch sources or execute commands.",
        ],
      };
    }),

  evidenceDetail: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getCerebroDb();
      const result = await db.execute({
        sql: `
          SELECT
            wer.*,
            p.name AS project_name,
            t.title AS task_title,
            s.claude_session_id,
            src.title AS source_title,
            src.uri AS source_uri,
            co.command,
            a.title AS artifact_title,
            a.storage_path,
            ppr.decision AS preflight_decision,
            ppr.required_approvals AS preflight_required_approvals,
            ppr.reasons AS preflight_reasons,
            ppr.mode AS preflight_mode
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          LEFT JOIN tasks t ON t.id = wer.task_id
          LEFT JOIN sessions s ON s.id = wer.session_id
          LEFT JOIN sources src ON src.id = wer.source_id
          LEFT JOIN command_observations co ON co.id = wer.command_observation_id
          LEFT JOIN artifacts a ON a.id = wer.artifact_id
          LEFT JOIN permission_preflight_records ppr ON ppr.id = wer.permission_preflight_id
          WHERE wer.id = ?
          LIMIT 1
        `,
        args: [input.id],
      });
      const row = result.rows[0];
      if (!row) {
        return {
          found: false as const,
          id: input.id,
          writesExternal: false,
          opensBrowser: false,
          capturesMedia: false,
          gates: ["No Workbench evidence record exists for this id."],
        };
      }
      const validationHistory = await db.execute({
        sql: `
          SELECT wer.*, p.name AS project_name
          FROM workbench_evidence_records wer
          LEFT JOIN projects p ON p.id = wer.project_id
          WHERE wer.kind = 'validation_note' AND wer.target_uri = ?
          ORDER BY wer.created_at ASC, wer.id ASC
        `,
        args: [`evidence:${input.id}`],
      });

      return {
        found: true as const,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(row),
        permissionPreflight: row.permission_preflight_id == null ? null : {
          id: Number(row.permission_preflight_id),
          mode: row.preflight_mode == null ? null : String(row.preflight_mode),
          decision: row.preflight_decision == null ? null : String(row.preflight_decision),
          requiredApprovals: row.preflight_required_approvals == null ? [] : String(row.preflight_required_approvals).split("\n").filter(Boolean),
          reasons: row.preflight_reasons == null ? [] : String(row.preflight_reasons).split("\n").filter(Boolean),
        },
        validationHistory: validationHistory.rows.map(rowToEvidence),
        gates: [
          "This detail view reads local append-only evidence only.",
          "It does not open linked targets, execute commands, fetch sources, capture media, or write externally.",
        ],
      };
    }),

  linkOptions: publicProcedure.query(async () => {
    const db = await getCerebroDb();
    const [sources, commands, tasks, sessions, artifacts] = await Promise.all([
      db.execute({
        sql: `
          SELECT id, uri, title, source_type, trust_level, freshness_status, project_id, created_at
          FROM sources
          ORDER BY created_at DESC, id DESC
          LIMIT 30
        `,
      }),
      db.execute({
        sql: `
          SELECT id, command, risk, status, project_id, created_at
          FROM command_observations
          ORDER BY created_at DESC, id DESC
          LIMIT 30
        `,
      }),
      db.execute({
        sql: `
          SELECT t.id, t.title, t.status, t.agent, t.project_id, p.name AS project_name, t.updated_at
          FROM tasks t
          LEFT JOIN projects p ON p.id = t.project_id
          ORDER BY
            CASE t.status
              WHEN 'in_progress' THEN 0
              WHEN 'open' THEN 1
              WHEN 'done' THEN 2
              WHEN 'cancelled' THEN 3
            END,
            t.updated_at DESC,
            t.id DESC
          LIMIT 40
        `,
      }),
      db.execute({
        sql: `
          SELECT s.id, s.claude_session_id, s.hero_class, s.project_id, p.name AS project_name, s.started_at, s.ended_at
          FROM sessions s
          LEFT JOIN projects p ON p.id = s.project_id
          ORDER BY COALESCE(s.ended_at, s.last_seen_at, s.started_at) DESC, s.id DESC
          LIMIT 30
        `,
      }),
      db.execute({
        sql: `
          SELECT id, kind, lifecycle_state, title, project_id, storage_provider, storage_path, created_at
          FROM artifacts
          ORDER BY created_at DESC, id DESC
          LIMIT 40
        `,
      }),
    ]);

    return {
      mode: "read_only" as const,
      writesExternal: false,
      opensBrowser: false,
      executesCommand: false,
      sources: sources.rows.map((row) => ({
        id: Number(row.id),
        uri: String(row.uri),
        title: row.title == null ? null : String(row.title),
        sourceType: String(row.source_type),
        trustLevel: String(row.trust_level),
        freshnessStatus: String(row.freshness_status),
        projectId: row.project_id == null ? null : Number(row.project_id),
        createdAt: Number(row.created_at),
      })),
      commandObservations: commands.rows.map((row) => ({
        id: Number(row.id),
        command: String(row.command),
        risk: String(row.risk),
        status: String(row.status),
        projectId: row.project_id == null ? null : Number(row.project_id),
        createdAt: Number(row.created_at),
      })),
      tasks: tasks.rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title),
        status: String(row.status),
        agent: row.agent == null ? null : String(row.agent),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        updatedAt: Number(row.updated_at),
      })),
      sessions: sessions.rows.map((row) => ({
        id: Number(row.id),
        claudeSessionId: String(row.claude_session_id),
        heroClass: row.hero_class == null ? null : String(row.hero_class),
        projectId: row.project_id == null ? null : Number(row.project_id),
        projectName: row.project_name == null ? null : String(row.project_name),
        startedAt: Number(row.started_at),
        endedAt: row.ended_at == null ? null : Number(row.ended_at),
      })),
      artifacts: artifacts.rows.map((row) => ({
        id: Number(row.id),
        kind: String(row.kind),
        lifecycleState: String(row.lifecycle_state),
        title: row.title == null ? null : String(row.title),
        projectId: row.project_id == null ? null : Number(row.project_id),
        storageProvider: String(row.storage_provider),
        storagePath: String(row.storage_path),
        createdAt: Number(row.created_at),
      })),
      gates: [
        "Link options read existing local records only.",
        "Selecting a source does not fetch it. Selecting a command observation does not execute it. Selecting a task/session/artifact does not mutate it.",
      ],
    };
  }),

  createValidationNote: publicProcedure
    .input(
      z.object({
        evidenceId: z.number().int(),
        validatorAgent: z.enum(validationAgents),
        status: z.enum(["needs_review", "looks_consistent", "blocked", "validated_for_local_use"]),
        note: z.string().min(1).max(1600),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const existing = await db.execute({
        sql: `
          SELECT id, title, project_id, task_id, session_id, source_id,
                 command_observation_id, artifact_id, permission_preflight_id,
                 sensitive_data_flag
          FROM workbench_evidence_records
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.evidenceId],
      });
      const row = existing.rows[0];
      if (!row) {
        return {
          ok: false as const,
          writesExternal: false,
          opensBrowser: false,
          capturesMedia: false,
          reason: "No Workbench evidence record exists for this id.",
        };
      }

      const title = `${input.validatorAgent.toUpperCase()} note for evidence #${input.evidenceId}`;
      const summary = [
        `Status: ${input.status.replace(/_/g, " ")}`,
        input.note,
      ].join("\n");
      const preflight = preflightInputForEvidence({ permissionClass: "validation" });
      const { row: preflightRow } = await recordPermissionPreflight(db, {
        perceptionClass: preflight.perceptionClass,
        actionClass: preflight.actionClass,
        sensitiveData: Boolean(row.sensitive_data_flag),
        requestedByAgent: input.validatorAgent,
        targetSummary: `validation_note: evidence #${input.evidenceId}`,
        additionalReasons: preflight.additionalReasons,
      });
      const permissionPreflightId = Number(preflightRow.id);

      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, project_id, task_id, session_id,
            source_id, command_observation_id, artifact_id, owner_agent,
            route_agent, annotation_text, validation_status,
            permission_class, permission_preflight_id, sensitive_data_flag
          )
          VALUES (
            'validation_note', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, 'validation', ?, ?
          )
          RETURNING *
        `,
        args: [
          title,
          summary,
          `evidence:${input.evidenceId}`,
          row.project_id ?? null,
          row.task_id ?? null,
          row.session_id ?? null,
          row.source_id ?? null,
          row.command_observation_id ?? null,
          row.artifact_id ?? null,
          input.validatorAgent,
          input.note,
          input.status,
          permissionPreflightId,
          row.sensitive_data_flag ?? 0,
        ],
      });

      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created a new validation note record. The original evidence record was not overwritten.",
          "Recorded one local permission preflight audit row for this validation note.",
          "This did not validate any external claim, open a target, run a command, fetch a source, or write externally.",
        ],
      };
    }),

  createEvidence: publicProcedure
    .input(
      z.object({
        kind: z.enum(evidenceKinds),
        title: z.string().min(1).max(160),
        summary: z.string().min(1).max(2000),
        targetUri: z.string().max(1000).nullable().optional(),
        projectId: z.number().int().nullable().optional(),
        taskId: z.number().int().nullable().optional(),
        sessionId: z.number().int().nullable().optional(),
        sourceId: z.number().int().nullable().optional(),
        commandObservationId: z.number().int().nullable().optional(),
        artifactId: z.number().int().nullable().optional(),
        ownerAgent: z.string().min(1).max(80).default("cortana"),
        routeAgent: z.string().max(80).nullable().optional(),
        viewport: z.string().max(200).nullable().optional(),
        coordinates: z.string().max(500).nullable().optional(),
        annotationText: z.string().max(1200).nullable().optional(),
        permissionClass: z.enum(permissionClasses).default("manual_note"),
        sensitive: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const permissionPreflightId = await recordEvidencePreflight({
        permissionClass: input.permissionClass,
        sensitive: input.sensitive,
        requestedByAgent: input.routeAgent ?? input.ownerAgent,
        targetSummary: `${input.kind}: ${input.title}`,
      });
      const result = await db.execute({
        sql: `
          INSERT INTO workbench_evidence_records (
            kind, title, summary, target_uri, project_id, task_id, session_id,
            source_id, command_observation_id, artifact_id, owner_agent,
            route_agent, viewport, coordinates, annotation_text,
            validation_status, permission_class, permission_preflight_id,
            sensitive_data_flag
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unvalidated', ?, ?, ?)
          RETURNING *
        `,
        args: [
          input.kind,
          input.title,
          input.summary,
          input.targetUri ?? null,
          input.projectId ?? null,
          input.taskId ?? null,
          input.sessionId ?? null,
          input.sourceId ?? null,
          input.commandObservationId ?? null,
          input.artifactId ?? null,
          input.ownerAgent,
          input.routeAgent ?? null,
          input.viewport ?? null,
          input.coordinates ?? null,
          input.annotationText ?? null,
          input.permissionClass,
          permissionPreflightId,
          input.sensitive ? 1 : 0,
        ],
      });
      return {
        ok: true,
        appendOnly: true,
        writesExternal: false,
        opensBrowser: false,
        capturesMedia: false,
        evidence: rowToEvidence(result.rows[0]!),
        permissionPreflightId,
        gates: [
          "Created one local Workbench evidence record.",
          "Recorded one local permission preflight audit row for this evidence record.",
          "This did not capture a screenshot, open a browser, run a command, save a file, or write externally.",
        ],
      };
    }),
});
