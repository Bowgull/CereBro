import { execFile } from "child_process";
import fs from "fs/promises";
import { promisify } from "util";
import { z } from "zod";
import { getCerebroDb, getOrCreateProjectByPath } from "../cerebroDb";
import { sourceDisplayName } from "../displayLabels";
import {
  GITHUB_PROJECT_MAP_PATH,
  GITHUB_SOURCES_INDEX_PATH,
  githubProjectBridgePath,
  githubRepositorySourcePath,
} from "../knowledge/contracts";
import { publicProcedure, router } from "../_core/trpc";
import { sessionDisplayName } from "./sessions";

const execFileAsync = promisify(execFile);

const intakeCategories = [
  "quick_answer",
  "everyday_note",
  "decision",
  "reminder",
  "message",
  "learning",
  "self_improvement",
  "system_improvement",
  "research",
  "creative",
  "file_hygiene",
  "project_build",
  "project_design",
  "project_qa",
  "project_ship",
  "project_package",
  "portfolio",
  "freelance",
  "source_capture",
  "prompt_reuse",
  "artifact_write",
] as const;

const projectModes = ["Build", "Design", "QA", "Ship", "Package", "Pitch", "Learn", "Hygiene"] as const;
const draftActionKeys = ["plan_next_slice", "inspect_dirty_state", "package_proof", "validation_pass"] as const;

const projectProfiles = [
  {
    slug: "declyne",
    name: "Declyne",
    localPath: "/Users/lindsaybell/Developer/Declyne",
    githubRepo: "Bowgull/Declyne",
    priorityClass: "market_candidate",
    currentMode: "Build",
    status: "Active build. High-trust finance app, not App Store-ready yet.",
    stack: ["React", "Vite", "Capacitor", "Hono", "Cloudflare D1", "Drizzle", "pnpm"],
    riskFlags: ["dirty_worktree", "finance_logic", "privacy_security", "app_store", "plaid_track"],
    nextAction: "Plan the Plaid/bank-connect track and inspect current dirty UI changes before any code work.",
    ownerAgent: "tony",
    supportAgents: ["batman", "gojo", "oak", "spock", "cortana"],
  },
  {
    slug: "waymark",
    name: "Waymark",
    localPath: "/Users/lindsaybell/Developer/Waymark",
    githubRepo: "Bowgull/Waymark",
    priorityClass: "active_build",
    currentMode: "Build",
    status: "Personal training and AI coach. Strong portfolio proof.",
    stack: ["React", "Vite", "Capacitor", "Cloudflare", "D1", "Hono", "Drizzle", "Strava"],
    riskFlags: ["ios_native", "ai_coaching", "portfolio_proof"],
    nextAction: "Keep active build work safe and package the strongest proof into Bridgefour.",
    ownerAgent: "tony",
    supportAgents: ["batman", "gojo", "aang", "c3po"],
  },
  {
    slug: "sygnalist",
    name: "Sygnalist",
    localPath: "/Users/lindsaybell/Developer/sygnalist-brain",
    githubRepo: "Bowgull/sygnalist-brain",
    priorityClass: "portfolio_proof",
    currentMode: "Package",
    status: "Job-search radar product and freelance/client proof.",
    stack: ["Apps Script", "Next.js", "Supabase", "Vercel", "OpenAI", "Claude"],
    riskFlags: ["modified_gitignore", "multi_source_ingestion", "client_visible"],
    nextAction: "Understand legacy and rebuilt surfaces, then preserve the manual-explicit-visible law.",
    ownerAgent: "tony",
    supportAgents: ["batman", "gojo", "c3po", "spock"],
  },
  {
    slug: "bridgefour",
    name: "Bridgefour",
    localPath: "/Users/lindsaybell/Developer/bridgefour",
    githubRepo: "Bowgull/Bridgefour",
    priorityClass: "portfolio",
    currentMode: "Package",
    status: "Living portfolio website. Always evolving.",
    stack: ["Next.js", "React", "Tailwind", "Framer Motion", "Vercel"],
    riskFlags: ["untracked_resume_asset", "public_portfolio"],
    nextAction: "Keep case studies current and add Declyne when the product story is ready.",
    ownerAgent: "gojo",
    supportAgents: ["batman", "c3po", "tony"],
  },
  {
    slug: "cerebro",
    name: "CereBro",
    localPath: "/Users/lindsaybell/Desktop/CereBro",
    githubRepo: "Bowgull/CereBro",
    priorityClass: "infrastructure",
    currentMode: "Build",
    status: "Personal command center and agent operating layer.",
    stack: ["React", "Tailwind", "Phaser", "Express", "tRPC", "libSQL", "WebSocket"],
    riskFlags: ["dirty_worktree", "agent_runtime", "vault_lifecycle"],
    nextAction: "Build the first Project Intelligence surface and keep the file lifecycle gates intact.",
    ownerAgent: "cortana",
    supportAgents: ["batman", "tony", "gojo", "piccolo", "oak"],
  },
] as const;

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function gitOutput(cwd: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd, timeout: 5000, maxBuffer: 200_000 });
    return stdout.trim();
  } catch {
    return null;
  }
}

function parseStatus(status: string | null) {
  if (!status) {
    return {
      branch: null,
      upstream: null,
      dirty: false,
      dirtyCount: 0,
      changes: [] as string[],
      statusText: "unavailable",
    };
  }

  const lines = status.split("\n").filter(Boolean);
  const header = lines[0] ?? "";
  const changes = lines.slice(1);
  const branchMatch = header.match(/^##\s+([^.\s]+)(?:\.\.\.([^\s]+))?/);

  return {
    branch: branchMatch?.[1] ?? (header.replace(/^##\s*/, "") || null),
    upstream: branchMatch?.[2] ?? null,
    dirty: changes.length > 0,
    dirtyCount: changes.length,
    changes: changes.slice(0, 10),
    statusText: changes.length > 0 ? "dirty" : "clean",
  };
}

type ProjectGitStatusSnapshot = {
  slug: string;
  name: string;
  localPath: string;
  githubRepo: string;
  localExists: boolean;
  git: ReturnType<typeof parseStatus> & { remote: string | null };
};

const gitStatusCacheTtlMs = 30_000;
let projectGitStatusCache:
  | {
      scannedAt: number;
      expiresAt: number;
      projects: ProjectGitStatusSnapshot[];
    }
  | null = null;

async function readProjectGitStatusSnapshots(): Promise<ProjectGitStatusSnapshot[]> {
  return Promise.all(
    projectProfiles.map(async (profile) => {
      const exists = await pathExists(profile.localPath);
      const [status, remote] = exists
        ? await Promise.all([
            gitOutput(profile.localPath, ["status", "--short", "--branch"]),
            gitOutput(profile.localPath, ["remote", "get-url", "origin"]),
          ])
        : [null, null];

      return {
        slug: profile.slug,
        name: profile.name,
        localPath: profile.localPath,
        githubRepo: profile.githubRepo,
        localExists: exists,
        git: {
          ...parseStatus(status),
          remote,
        },
      };
    }),
  );
}

async function projectGitStatusSnapshot(options: { force?: boolean } = {}) {
  const nowMs = Date.now();
  if (!options.force && projectGitStatusCache && projectGitStatusCache.expiresAt > nowMs) {
    return {
      ...projectGitStatusCache,
      cacheHit: true,
    };
  }

  const projects = await readProjectGitStatusSnapshots();
  projectGitStatusCache = {
    scannedAt: Math.floor(nowMs / 1000),
    expiresAt: nowMs + gitStatusCacheTtlMs,
    projects,
  };

  return {
    ...projectGitStatusCache,
    cacheHit: false,
  };
}

function emptyGitStatus() {
  return {
    ...parseStatus(null),
    remote: null,
  };
}

function rowToTaskSummary(r: Record<string, unknown>) {
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
    title: String(r.title),
    status: String(r.status),
    agent: r.agent == null ? null : String(r.agent),
    updatedAt: Number(r.updated_at),
  };
}

async function taskRollupForPath(pathValue: string) {
  const db = await getCerebroDb();
  const project = await db.execute({
    sql: `SELECT id FROM projects WHERE path = ? LIMIT 1`,
    args: [pathValue],
  });
  const projectId = project.rows[0]?.id == null ? null : Number(project.rows[0].id);
  if (projectId == null) {
    return {
      projectId: null,
      open: 0,
      inProgress: 0,
      done: 0,
      total: 0,
      recent: [] as ReturnType<typeof rowToTaskSummary>[],
    };
  }

  const [counts, recent] = await Promise.all([
    db.execute({
      sql: `
        SELECT status, COUNT(*) AS count
        FROM tasks
        WHERE project_id = ?
        GROUP BY status
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT
          t.id,
          t.session_id,
          t.title,
          t.status,
          t.agent,
          t.updated_at,
          s.hero_class AS session_hero_class,
          s.title AS session_title,
          s.ended_at AS session_ended_at,
          p.name AS session_project_name
        FROM tasks t
        LEFT JOIN sessions s ON s.id = t.session_id
        LEFT JOIN projects p ON p.id = s.project_id
        WHERE t.project_id = ?
        ORDER BY
          CASE t.status
            WHEN 'in_progress' THEN 0
            WHEN 'open' THEN 1
            WHEN 'done' THEN 2
            WHEN 'cancelled' THEN 3
          END,
          t.updated_at DESC
        LIMIT 5
      `,
      args: [projectId],
    }),
  ]);

  const countMap = new Map(counts.rows.map((row) => [String(row.status), Number(row.count)]));
  const open = countMap.get("open") ?? 0;
  const inProgress = countMap.get("in_progress") ?? 0;
  const done = countMap.get("done") ?? 0;
  const cancelled = countMap.get("cancelled") ?? 0;

  return {
    projectId,
    open,
    inProgress,
    done,
    total: open + inProgress + done + cancelled,
    recent: recent.rows.map(rowToTaskSummary),
  };
}

function rowToCommandSummary(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    command: String(r.command),
    risk: String(r.risk),
    suggestedAgent: r.suggested_agent == null ? null : String(r.suggested_agent),
    createdAt: Number(r.created_at),
  };
}

function rowToCaptureSummary(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    title: String(r.title),
    captureType: String(r.capture_type),
    status: String(r.status),
    sensitive: Boolean(r.sensitive_data_flag),
    createdAt: Number(r.created_at),
  };
}

function rowToApprovalSummary(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    actionType: String(r.action_type),
    targetType: r.target_type == null ? null : String(r.target_type),
    requestedByAgent: r.requested_by_agent == null ? null : String(r.requested_by_agent),
    sensitive: Boolean(r.sensitive_data_flag),
    costRisk: r.cost_risk == null ? null : String(r.cost_risk),
    reason: r.reason == null ? null : String(r.reason),
    contextSummary: r.context_summary == null ? null : String(r.context_summary),
    createdAt: Number(r.created_at),
  };
}

function rowToReminderSummary(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    title: String(r.title),
    status: String(r.status),
    reviewPriority: r.review_priority == null ? "normal" : String(r.review_priority),
    timingHint: r.timing_hint == null ? null : String(r.timing_hint),
    approvalScope: r.approval_scope == null ? null : String(r.approval_scope),
    createdAt: Number(r.created_at),
  };
}

function rowToMessageSummary(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    title: String(r.title),
    status: String(r.status),
    reviewPriority: r.review_priority == null ? "normal" : String(r.review_priority),
    recipientHint: r.recipient_hint == null ? null : String(r.recipient_hint),
    approvalScope: r.approval_scope == null ? null : String(r.approval_scope),
    createdAt: Number(r.created_at),
  };
}

function rowToActionDraftNote(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    draftId: r.draft_id == null ? null : Number(r.draft_id),
    projectId: r.project_id == null ? null : Number(r.project_id),
    projectSlug: String(r.project_slug),
    note: String(r.note),
    authorAgent: String(r.author_agent),
    status: String(r.status),
    createdAt: Number(r.created_at),
  };
}

function rowsToCountMap(rows: Record<string, unknown>[], keyName: string) {
  return Object.fromEntries(rows.map((row) => [String(row[keyName]), Number(row.count)]));
}

function pendingApprovalWhereForProject(projectId: number) {
  return {
    sql: `
      a.status = 'pending'
      AND (
        t.project_id = ?
        OR co.project_id = ?
        OR cap.project_id = ?
        OR rp.project_id = ?
        OR mp.project_id = ?
        OR se.project_id = ?
      )
    `,
    args: [projectId, projectId, projectId, projectId, projectId, projectId],
  };
}

const approvalProjectBaseFrom = `
  FROM approvals a
  LEFT JOIN tasks t ON t.id = a.task_id
  LEFT JOIN command_observations co ON a.target_type = 'command_observation' AND co.id = a.target_id
  LEFT JOIN capture_observations cap ON a.target_type = 'capture_observation' AND cap.id = a.target_id
  LEFT JOIN reminder_proposals rp ON a.target_type = 'reminder_proposal' AND rp.id = a.target_id
  LEFT JOIN message_draft_proposals mp ON a.target_type = 'message_draft_proposal' AND mp.id = a.target_id
  LEFT JOIN source_events se ON a.target_type = 'source_event' AND se.id = a.target_id
`;

async function approvalRollupForProject(projectId: number | null) {
  if (projectId == null) {
    return {
      pending: 0,
      sensitive: 0,
      byActionType: {} as Record<string, number>,
      recent: [] as ReturnType<typeof rowToApprovalSummary>[],
    };
  }

  const db = await getCerebroDb();
  const where = pendingApprovalWhereForProject(projectId);
  const [counts, byActionType, recent] = await Promise.all([
    db.execute({
      sql: `
        SELECT
          COUNT(DISTINCT a.id) AS pending,
          SUM(CASE WHEN a.sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive
        ${approvalProjectBaseFrom}
        WHERE ${where.sql}
      `,
      args: where.args,
    }),
    db.execute({
      sql: `
        SELECT a.action_type, COUNT(DISTINCT a.id) AS count
        ${approvalProjectBaseFrom}
        WHERE ${where.sql}
        GROUP BY a.action_type
      `,
      args: where.args,
    }),
    db.execute({
      sql: `
        SELECT DISTINCT a.id, a.action_type, a.target_type, a.requested_by_agent,
                        a.sensitive_data_flag, a.cost_risk, a.reason,
                        a.context_summary, a.created_at
        ${approvalProjectBaseFrom}
        WHERE ${where.sql}
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT 3
      `,
      args: where.args,
    }),
  ]);

  return {
    pending: Number(counts.rows[0]?.pending ?? 0),
    sensitive: Number(counts.rows[0]?.sensitive ?? 0),
    byActionType: rowsToCountMap(byActionType.rows, "action_type"),
    recent: recent.rows.map(rowToApprovalSummary),
  };
}

async function hedwigRollupForProject(projectId: number | null) {
  if (projectId == null) {
    return {
      pendingCaptures: 0,
      sourceProposals: 0,
      reminderProposals: 0,
      messageDrafts: 0,
      needsReview: 0,
      sensitive: 0,
      byCaptureType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };
  }

  const db = await getCerebroDb();
  const openProposalStatuses = ["proposed", "reviewing", "ready_for_approval"];
  const sourceCaptureTypes = ["link", "article", "video", "reddit"];
  const [captureCounts, captureTypes, captureStatuses, reminders, messages] = await Promise.all([
    db.execute({
      sql: `
        SELECT
          COUNT(*) AS pending_captures,
          SUM(CASE WHEN needs_review = 1 THEN 1 ELSE 0 END) AS needs_review,
          SUM(CASE WHEN sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive,
          SUM(CASE WHEN capture_type IN (${sourceCaptureTypes.map(() => "?").join(",")})
                    AND status IN ('inbox', 'triaged', 'sourced')
                   THEN 1 ELSE 0 END) AS source_proposals
        FROM capture_observations
        WHERE project_id = ? AND status != 'archived'
      `,
      args: [...sourceCaptureTypes, projectId],
    }),
    db.execute({
      sql: `
        SELECT capture_type, COUNT(*) AS count
        FROM capture_observations
        WHERE project_id = ? AND status != 'archived'
        GROUP BY capture_type
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT status, COUNT(*) AS count
        FROM capture_observations
        WHERE project_id = ? AND status != 'archived'
        GROUP BY status
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT COUNT(*) AS count
        FROM reminder_proposals
        WHERE project_id = ? AND status IN (${openProposalStatuses.map(() => "?").join(",")})
      `,
      args: [projectId, ...openProposalStatuses],
    }),
    db.execute({
      sql: `
        SELECT COUNT(*) AS count
        FROM message_draft_proposals
        WHERE project_id = ? AND status IN (${openProposalStatuses.map(() => "?").join(",")})
      `,
      args: [projectId, ...openProposalStatuses],
    }),
  ]);

  return {
    pendingCaptures: Number(captureCounts.rows[0]?.pending_captures ?? 0),
    sourceProposals: Number(captureCounts.rows[0]?.source_proposals ?? 0),
    reminderProposals: Number(reminders.rows[0]?.count ?? 0),
    messageDrafts: Number(messages.rows[0]?.count ?? 0),
    needsReview: Number(captureCounts.rows[0]?.needs_review ?? 0),
    sensitive: Number(captureCounts.rows[0]?.sensitive ?? 0),
    byCaptureType: rowsToCountMap(captureTypes.rows, "capture_type"),
    byStatus: rowsToCountMap(captureStatuses.rows, "status"),
  };
}

async function terminalStatusRollupForProject(projectId: number | null) {
  if (projectId == null) {
    return {
      total: 0,
      blocked: 0,
      reviewing: 0,
      byStatus: {} as Record<string, number>,
      byRisk: {} as Record<string, number>,
    };
  }

  const db = await getCerebroDb();
  const [statusCounts, riskCounts] = await Promise.all([
    db.execute({
      sql: `
        SELECT status, COUNT(*) AS count
        FROM command_observations
        WHERE project_id = ?
        GROUP BY status
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT risk, COUNT(*) AS count
        FROM command_observations
        WHERE project_id = ?
        GROUP BY risk
      `,
      args: [projectId],
    }),
  ]);
  const byStatus = rowsToCountMap(statusCounts.rows, "status");
  const byRisk = rowsToCountMap(riskCounts.rows, "risk");

  return {
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    blocked: byStatus.blocked ?? 0,
    reviewing: byStatus.reviewing ?? 0,
    byStatus,
    byRisk,
  };
}

async function sourceEventRollupForProject(projectId: number | null) {
  if (projectId == null) {
    return {
      total: 0,
      sensitive: 0,
      byEventType: {} as Record<string, number>,
      byTrustLevel: {} as Record<string, number>,
      recent: [] as Array<{
        id: number;
        eventType: string;
        title: string | null;
        sourceDisplayName: string | null;
        uri: string | null;
        trustLevel: string | null;
        sensitive: boolean;
        createdAt: number;
      }>,
    };
  }

  const db = await getCerebroDb();
  const [counts, eventTypes, trustLevels, recent] = await Promise.all([
    db.execute({
      sql: `
        SELECT COUNT(*) AS total, SUM(CASE WHEN sensitive_data_flag = 1 THEN 1 ELSE 0 END) AS sensitive
        FROM source_events
        WHERE project_id = ?
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT event_type, COUNT(*) AS count
        FROM source_events
        WHERE project_id = ?
        GROUP BY event_type
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT COALESCE(trust_level, 'unknown') AS trust_level, COUNT(*) AS count
        FROM source_events
        WHERE project_id = ?
        GROUP BY COALESCE(trust_level, 'unknown')
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT id, event_type, title, uri, trust_level, sensitive_data_flag, created_at
        FROM source_events
        WHERE project_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 3
      `,
      args: [projectId],
    }),
  ]);

  return {
    total: Number(counts.rows[0]?.total ?? 0),
    sensitive: Number(counts.rows[0]?.sensitive ?? 0),
    byEventType: rowsToCountMap(eventTypes.rows, "event_type"),
    byTrustLevel: rowsToCountMap(trustLevels.rows, "trust_level"),
    recent: recent.rows.map((row) => ({
      id: Number(row.id),
      eventType: String(row.event_type),
      title: row.title == null ? null : String(row.title),
      uri: row.uri == null ? null : String(row.uri),
      sourceDisplayName: row.uri == null ? null : sourceDisplayName(String(row.uri)),
      trustLevel: row.trust_level == null ? null : String(row.trust_level),
      sensitive: Boolean(row.sensitive_data_flag),
      createdAt: Number(row.created_at),
    })),
  };
}

async function actionDraftRollupForProject(projectId: number | null, projectSlug: string) {
  const db = await getCerebroDb();
  const whereSql = projectId == null ? `project_slug = ?` : `(project_id = ? OR project_slug = ?)`;
  const args = projectId == null ? [projectSlug] : [projectId, projectSlug];
  const [counts, byActionKey] = await Promise.all([
    db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM project_action_drafts
        WHERE ${whereSql}
      `,
      args,
    }),
    db.execute({
      sql: `
        SELECT action_key, COUNT(*) AS count
        FROM project_action_drafts
        WHERE ${whereSql}
        GROUP BY action_key
      `,
      args,
    }),
  ]);

  return {
    total: Number(counts.rows[0]?.total ?? 0),
    byActionKey: rowsToCountMap(byActionKey.rows, "action_key"),
  };
}

function rowToRouteActivity(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    category: String(row.category),
    ownerAgent: String(row.owner_agent),
    originalText: String(row.original_text),
    createdAt: Number(row.created_at),
  };
}

async function routeRollupForProject(projectSlug: string) {
  const db = await getCerebroDb();
  const [counts, latest] = await Promise.all([
    db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM runtime_route_records
        WHERE project_slug = ?
      `,
      args: [projectSlug],
    }),
    db.execute({
      sql: `
        SELECT id, category, owner_agent, original_text, created_at
        FROM runtime_route_records
        WHERE project_slug = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      args: [projectSlug],
    }),
  ]);

  return {
    total: Number(counts.rows[0]?.total ?? 0),
    latest: latest.rows[0] == null ? null : rowToRouteActivity(latest.rows[0]),
  };
}

async function activityRollupForProject(projectId: number | null, projectSlug: string) {
  if (projectId == null) {
    return {
      terminalObservations: 0,
      captureObservations: 0,
      recentCommands: [] as ReturnType<typeof rowToCommandSummary>[],
      recentCaptures: [] as ReturnType<typeof rowToCaptureSummary>[],
      approvals: await approvalRollupForProject(null),
      hedwig: await hedwigRollupForProject(null),
      terminalStatus: await terminalStatusRollupForProject(null),
      sourceEvents: await sourceEventRollupForProject(null),
      actionDrafts: await actionDraftRollupForProject(null, projectSlug),
      routes: await routeRollupForProject(projectSlug),
    };
  }

  const db = await getCerebroDb();
  const [
    commandCount,
    captureCount,
    recentCommands,
    recentCaptures,
    approvals,
    hedwig,
    terminalStatus,
    sourceEvents,
    actionDrafts,
    routeRollup,
  ] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) AS count FROM command_observations WHERE project_id = ?`,
      args: [projectId],
    }),
    db.execute({
      sql: `SELECT COUNT(*) AS count FROM capture_observations WHERE project_id = ?`,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT id, command, risk, suggested_agent, created_at
        FROM command_observations
        WHERE project_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 3
      `,
      args: [projectId],
    }),
    db.execute({
      sql: `
        SELECT id, title, capture_type, status, sensitive_data_flag, created_at
        FROM capture_observations
        WHERE project_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 3
      `,
      args: [projectId],
    }),
    approvalRollupForProject(projectId),
    hedwigRollupForProject(projectId),
    terminalStatusRollupForProject(projectId),
    sourceEventRollupForProject(projectId),
    actionDraftRollupForProject(projectId, projectSlug),
    routeRollupForProject(projectSlug),
  ]);

  return {
    terminalObservations: Number(commandCount.rows[0]?.count ?? 0),
    captureObservations: Number(captureCount.rows[0]?.count ?? 0),
    recentCommands: recentCommands.rows.map(rowToCommandSummary),
    recentCaptures: recentCaptures.rows.map(rowToCaptureSummary),
    approvals,
    hedwig,
    terminalStatus,
    sourceEvents,
    actionDrafts,
    routes: routeRollup,
  };
}

type ProjectOverviewItem = (typeof projectProfiles)[number] & {
  localExists: boolean;
  tasks: Awaited<ReturnType<typeof taskRollupForPath>>;
  activity: Awaited<ReturnType<typeof activityRollupForProject>>;
  git: ReturnType<typeof parseStatus> & { remote: string | null };
};

type PushReadinessState = "hold_dirty" | "commit_locally" | "push_branch" | "open_pr" | "needs_cleanup";

function rowToPushContractSummary(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    projectId: row.project_id == null ? null : Number(row.project_id),
    taskId: row.task_id == null ? null : Number(row.task_id),
    approvalId: row.approval_id == null ? null : Number(row.approval_id),
    approvalStatus: row.approval_status == null ? null : String(row.approval_status),
    workbenchEvidenceId: row.workbench_evidence_id == null ? null : Number(row.workbench_evidence_id),
    actionType: String(row.action_type),
    riskClass: String(row.risk_class),
    command: row.command == null ? null : String(row.command),
    resultState: String(row.result_state),
    status: String(row.status),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    canRunInV1: false,
    gate: "Git remote writes are blocked by the V1 runner.",
  };
}

async function latestPushContractForProject(projectId: number | null) {
  if (projectId == null) return null;
  const db = await getCerebroDb();
  const result = await db.execute({
    sql: `
      SELECT eap.*,
             a.status AS approval_status
      FROM execution_action_proposals eap
      LEFT JOIN approvals a ON a.id = eap.approval_id
      WHERE eap.source_type = 'project_push'
        AND eap.source_id = ?
        AND eap.action_type = 'project_manual_push'
      ORDER BY eap.created_at DESC, eap.id DESC
      LIMIT 1
    `,
    args: [projectId],
  });
  const row = result.rows[0];
  return row ? rowToPushContractSummary(row) : null;
}

function pushReadinessForProject(project: ProjectOverviewItem) {
  const blockers: string[] = [];
  const why: string[] = [];
  const staysOut: string[] = [];
  const checks: string[] = [];

  if (!project.localExists) blockers.push("Local checkout is missing.");
  if (!project.git.branch) blockers.push("No branch is available.");
  if (!project.git.remote) blockers.push("No origin remote is available.");
  if (project.activity.approvals.pending > 0) blockers.push(`${project.activity.approvals.pending} pending approval${project.activity.approvals.pending === 1 ? "" : "s"}.`);
  if (project.activity.terminalStatus.blocked > 0) blockers.push(`${project.activity.terminalStatus.blocked} blocked terminal observation${project.activity.terminalStatus.blocked === 1 ? "" : "s"}.`);
  if (project.activity.terminalStatus.reviewing > 0) blockers.push(`${project.activity.terminalStatus.reviewing} terminal observation${project.activity.terminalStatus.reviewing === 1 ? "" : "s"} still reviewing.`);
  if (project.activity.hedwig.needsReview > 0) blockers.push(`${project.activity.hedwig.needsReview} Hedwig capture${project.activity.hedwig.needsReview === 1 ? "" : "s"} need review.`);
  if (project.activity.sourceEvents.sensitive > 0) blockers.push(`${project.activity.sourceEvents.sensitive} sensitive source event${project.activity.sourceEvents.sensitive === 1 ? "" : "s"} need review.`);

  if (project.git.dirty) {
    why.push(`${project.git.dirtyCount} local worktree change${project.git.dirtyCount === 1 ? "" : "s"} detected.`);
    staysOut.push("Unrelated dirty files stay unstaged until the slice is scoped.");
  } else {
    why.push("Worktree is clean.");
  }

  if (project.tasks.inProgress > 0) why.push(`${project.tasks.inProgress} active task${project.tasks.inProgress === 1 ? "" : "s"} may still be mid-slice.`);
  if (project.tasks.open > 0 && project.tasks.inProgress === 0) why.push(`${project.tasks.open} open task${project.tasks.open === 1 ? "" : "s"} remain.`);
  if (project.git.upstream) why.push(`Upstream exists: ${project.git.upstream}.`);
  if (!project.git.upstream && project.git.branch) why.push("Branch has no upstream yet.");

  checks.push("Inspect `git status --short --branch`.");
  checks.push("Stage only the coherent slice.");
  checks.push("Run the project check command before commit.");
  checks.push("Confirm no unrelated files are staged.");

  let state: PushReadinessState = "hold_dirty";
  if (blockers.length > 0) {
    state = "needs_cleanup";
  } else if (project.git.dirty) {
    state = project.tasks.inProgress > 0 ? "hold_dirty" : "commit_locally";
  } else if (project.git.branch && project.git.upstream) {
    state = "push_branch";
  } else if (project.git.branch) {
    state = "open_pr";
  }

  const label: Record<PushReadinessState, string> = {
    hold_dirty: "Hold dirty",
    commit_locally: "Commit locally",
    push_branch: "Push branch",
    open_pr: "Open PR",
    needs_cleanup: "Needs cleanup",
  };
  const branch = project.git.branch ?? "<branch>";

  return {
    state,
    label: label[state],
    automationAvailable: true,
    automationDefault: "manual" as const,
    automationRequiresApproval: true,
    executesGit: false,
    why: blockers.length > 0 ? blockers : why,
    staysOut: staysOut.length > 0 ? staysOut : ["Nothing obvious, but verify the staged diff before commit."],
    checks,
    manualCommands: [
      `cd ${project.localPath}`,
      "git status --short --branch",
      "git add <reviewed files>",
      `git commit -m "<coherent slice>"`,
      project.git.upstream ? "git push" : `git push -u origin ${branch}`,
    ],
    suggestedCommit: project.git.dirty ? "<short coherent slice>" : "No commit suggested while clean.",
    contract: null as Awaited<ReturnType<typeof latestPushContractForProject>>,
    evidence: {
      branch: project.git.branch,
      upstream: project.git.upstream,
      remote: project.git.remote,
      dirty: project.git.dirty,
      dirtyCount: project.git.dirtyCount,
      pendingApprovals: project.activity.approvals.pending,
      blockedTerminal: project.activity.terminalStatus.blocked,
      reviewingTerminal: project.activity.terminalStatus.reviewing,
      hedwigNeedsReview: project.activity.hedwig.needsReview,
      sensitiveSources: project.activity.sourceEvents.sensitive,
      inProgressTasks: project.tasks.inProgress,
      openTasks: project.tasks.open,
    },
  };
}

function knowledgeRouteForProject(project: (typeof projectProfiles)[number]) {
  return {
    mode: "read_only" as const,
    projectBridgePath: githubProjectBridgePath(project.name),
    repositorySourcePath: githubRepositorySourcePath(project.name),
    projectMapPath: GITHUB_PROJECT_MAP_PATH,
    sourcesIndexPath: GITHUB_SOURCES_INDEX_PATH,
    normalRagLane: "10_Projects + 20_Knowledge/Sources" as const,
    archiveLane: "90_Archive" as const,
    archiveRetrieval: "archive_only" as const,
    writesExternalSystems: false,
    approvalGate: "Creating or updating bridge/source notes requires an explicit write approval.",
  };
}

function nextSafeActionForProject(project: ProjectOverviewItem) {
  const { activity, tasks, git } = project;
  if (activity.approvals.pending > 0) {
    return `Review ${activity.approvals.pending} local pending approval${activity.approvals.pending === 1 ? "" : "s"} before any external or command action.`;
  }
  if (activity.terminalStatus.blocked > 0 || activity.terminalStatus.reviewing > 0) {
    return "Resolve Terminal Lab blocked/reviewing observations using read-only diagnostics only.";
  }
  if (activity.hedwig.needsReview > 0) {
    return `Triage ${activity.hedwig.needsReview} Hedwig capture${activity.hedwig.needsReview === 1 ? "" : "s"}; keep Notion/Slack writes approval-gated.`;
  }
  if (activity.sourceEvents.sensitive > 0) {
    return "Review sensitive-looking source events before any reuse, enrichment, or durable write.";
  }
  if (tasks.inProgress > 0) {
    return "Continue the active linked task and keep changes scoped to the current project.";
  }
  if (tasks.open > 0) {
    return "Pick the oldest open linked task and convert it into a narrow proposal or build step.";
  }
  if (git.dirty) {
    return "Inspect the dirty worktree carefully before proposing code changes or git operations.";
  }
  return project.nextAction;
}

function draftActionForProject(project: (typeof projectProfiles)[number], actionKey: (typeof draftActionKeys)[number]) {
  if (actionKey === "inspect_dirty_state") {
    return {
      title: `Inspect ${project.name} local state`,
      summary: [
        `Goal: make a read-only inspection plan for ${project.name}.`,
        `Read local status, known risks, and current linked signals before any edit.`,
        "Output: a short inspection checklist and questions for approval.",
      ].join("\n"),
      proposedByAgent: "spock",
      ownerAgent: "tony",
    };
  }
  if (actionKey === "package_proof") {
    return {
      title: `Package ${project.name} proof`,
      summary: [
        `Goal: draft a portfolio/package plan for ${project.name}.`,
        "Identify the strongest proof, missing screenshots/assets, risks, and audience.",
        "Output: a draft packaging outline only. No files are written.",
      ].join("\n"),
      proposedByAgent: "c3po",
      ownerAgent: "gojo",
    };
  }
  if (actionKey === "validation_pass") {
    return {
      title: `Validate ${project.name} readiness`,
      summary: [
        `Goal: draft a validation plan for ${project.name}.`,
        "List claims, checks, high-risk areas, and what evidence is needed.",
        "Output: Oak/Spock validation checklist only.",
      ].join("\n"),
      proposedByAgent: "oak",
      ownerAgent: "spock",
    };
  }
  return {
    title: `Plan next ${project.name} slice`,
    summary: [
      `Goal: draft the safest next implementation or planning slice for ${project.name}.`,
      `Use current mode: ${project.currentMode}. Respect risks: ${project.riskFlags.join(", ")}.`,
      "Output: a proposal only. No task is created and no repo is edited.",
    ].join("\n"),
    proposedByAgent: "batman",
    ownerAgent: project.ownerAgent,
  };
}

async function actionDraftRowsForProject(projectId: number | null, projectSlug: string) {
  const db = await getCerebroDb();
  const whereSql = projectId == null ? `project_slug = ?` : `(project_id = ? OR project_slug = ?)`;
  const args = projectId == null ? [projectSlug] : [projectId, projectSlug];
  const [actionDrafts, actionDraftNotes] = await Promise.all([
    db.execute({
      sql: `
        SELECT id, action_key, title, summary, proposed_by_agent, owner_agent, status, created_at
        FROM project_action_drafts
        WHERE ${whereSql}
        ORDER BY created_at DESC, id DESC
        LIMIT 12
      `,
      args,
    }),
    db.execute({
      sql: `
        SELECT id, draft_id, project_id, project_slug, note, author_agent, status, created_at
        FROM project_action_draft_notes
        WHERE ${whereSql}
        ORDER BY created_at DESC, id DESC
        LIMIT 40
      `,
      args,
    }),
  ]);
  const notesByDraftId = new Map<number, ReturnType<typeof rowToActionDraftNote>[]>();
  for (const note of actionDraftNotes.rows.map(rowToActionDraftNote)) {
    if (note.draftId == null) continue;
    const notes = notesByDraftId.get(note.draftId) ?? [];
    if (notes.length < 5) notes.push(note);
    notesByDraftId.set(note.draftId, notes);
  }

  return actionDrafts.rows.map((row) => ({
    id: Number(row.id),
    actionKey: String(row.action_key),
    title: String(row.title),
    summary: String(row.summary),
    proposedByAgent: String(row.proposed_by_agent),
    ownerAgent: row.owner_agent == null ? null : String(row.owner_agent),
    status: String(row.status),
    createdAt: Number(row.created_at),
    notes: notesByDraftId.get(Number(row.id)) ?? [],
  }));
}

function emptyProjectDetail(slug: string, reason: string) {
  return {
    found: false as const,
    mode: "read_only" as const,
    slug,
    reason,
    gates: [
      "Project Lab detail is local metadata only.",
      "It does not approve records, execute commands, browse/search, write to Notion/Slack, or edit external repositories.",
    ],
    approvals: [] as ReturnType<typeof rowToApprovalSummary>[],
    terminalObservations: [] as Array<ReturnType<typeof rowToCommandSummary> & { status: string; outputSummary: string | null }>,
    hedwigCaptures: [] as ReturnType<typeof rowToCaptureSummary>[],
    reminderProposals: [] as ReturnType<typeof rowToReminderSummary>[],
    messageDrafts: [] as ReturnType<typeof rowToMessageSummary>[],
    sourceEvents: [] as Awaited<ReturnType<typeof sourceEventRollupForProject>>["recent"],
    actionDrafts: [] as Array<{
      id: number;
      actionKey: string;
      title: string;
      summary: string;
      proposedByAgent: string;
      ownerAgent: string | null;
      status: string;
      createdAt: number;
      notes: ReturnType<typeof rowToActionDraftNote>[];
    }>,
    git: null as (ReturnType<typeof parseStatus> & {
      remote: string | null;
      localExists: boolean;
      localPath: string;
      githubRepo: string;
    }) | null,
  };
}

async function projectDetailForSlug(slug: string) {
  const profile = projectProfiles.find((candidate) => candidate.slug === slug);
  if (!profile) return emptyProjectDetail(slug, "Unknown Project Lab profile.");

  const gitSnapshot = await projectGitStatusSnapshot();
  const profileGit = gitSnapshot.projects.find((candidate) => candidate.slug === profile.slug);
  const git = {
    ...(profileGit?.git ?? emptyGitStatus()),
    localExists: profileGit?.localExists ?? false,
    localPath: profile.localPath,
    githubRepo: profile.githubRepo,
  };

  const tasks = await taskRollupForPath(profile.localPath);
  if (tasks.projectId == null) {
    return {
      ...emptyProjectDetail(slug, "No linked harness project row exists yet."),
      found: true as const,
      project: profile,
      projectId: null,
      git,
      knowledgeRoute: knowledgeRouteForProject(profile),
      actionDrafts: await actionDraftRowsForProject(null, slug),
    };
  }

  const db = await getCerebroDb();
  const approvalWhere = pendingApprovalWhereForProject(tasks.projectId);
  const [approvals, terminal, captures, reminders, messages, sources, actionDrafts] = await Promise.all([
    db.execute({
      sql: `
        SELECT DISTINCT a.id, a.action_type, a.target_type, a.requested_by_agent,
                        a.sensitive_data_flag, a.cost_risk, a.reason,
                        a.context_summary, a.created_at
        ${approvalProjectBaseFrom}
        WHERE ${approvalWhere.sql}
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT 12
      `,
      args: approvalWhere.args,
    }),
    db.execute({
      sql: `
        SELECT id, command, risk, suggested_agent, status, output_summary, created_at
        FROM command_observations
        WHERE project_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 12
      `,
      args: [tasks.projectId],
    }),
    db.execute({
      sql: `
        SELECT id, title, capture_type, status, sensitive_data_flag, created_at
        FROM capture_observations
        WHERE project_id = ? AND status != 'archived'
        ORDER BY created_at DESC, id DESC
        LIMIT 12
      `,
      args: [tasks.projectId],
    }),
    db.execute({
      sql: `
        SELECT id, title, timing_hint, status, review_priority, approval_scope, created_at
        FROM reminder_proposals
        WHERE project_id = ? AND status != 'archived'
        ORDER BY created_at DESC, id DESC
        LIMIT 8
      `,
      args: [tasks.projectId],
    }),
    db.execute({
      sql: `
        SELECT id, title, recipient_hint, status, review_priority, approval_scope, created_at
        FROM message_draft_proposals
        WHERE project_id = ? AND status != 'archived'
        ORDER BY created_at DESC, id DESC
        LIMIT 8
      `,
      args: [tasks.projectId],
    }),
    db.execute({
      sql: `
        SELECT id, event_type, title, uri, trust_level, sensitive_data_flag, created_at
        FROM source_events
        WHERE project_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 12
      `,
      args: [tasks.projectId],
    }),
    actionDraftRowsForProject(tasks.projectId, slug),
  ]);

  return {
    found: true as const,
    mode: "read_only" as const,
    project: profile,
    projectId: tasks.projectId,
    git,
    knowledgeRoute: knowledgeRouteForProject(profile),
    gates: [
      "Project Lab detail is local metadata only.",
      "Approval rows shown here are pending local previews, not approved actions.",
      "Commands still run only through Codex's normal command path.",
      "Notion, Slack, browser/search, source fetches, and external repo edits are not available from this view.",
    ],
    approvals: approvals.rows.map(rowToApprovalSummary),
    terminalObservations: terminal.rows.map((row) => ({
      ...rowToCommandSummary(row),
      status: String(row.status),
      outputSummary: row.output_summary == null ? null : String(row.output_summary),
    })),
    hedwigCaptures: captures.rows.map(rowToCaptureSummary),
    reminderProposals: reminders.rows.map(rowToReminderSummary),
    messageDrafts: messages.rows.map(rowToMessageSummary),
    sourceEvents: sources.rows.map((row) => ({
      id: Number(row.id),
      eventType: String(row.event_type),
      title: row.title == null ? null : String(row.title),
      uri: row.uri == null ? null : String(row.uri),
      sourceDisplayName: row.uri == null ? null : sourceDisplayName(String(row.uri)),
      trustLevel: row.trust_level == null ? null : String(row.trust_level),
      sensitive: Boolean(row.sensitive_data_flag),
      createdAt: Number(row.created_at),
    })),
    actionDrafts,
  };
}

export const projectIntelligenceRouter = router({
  overview: publicProcedure.query(async () => {
    const gitSnapshot = await projectGitStatusSnapshot();
    const gitBySlug = new Map(gitSnapshot.projects.map((project) => [project.slug, project]));
    const projects = await Promise.all(
      projectProfiles.map(async (profile) => {
        const gitStatus = gitBySlug.get(profile.slug);

        const tasks = await taskRollupForPath(profile.localPath);
        const activity = await activityRollupForProject(tasks.projectId, profile.slug);

        const project = {
          ...profile,
          localExists: gitStatus?.localExists ?? false,
          tasks,
          activity,
          git: gitStatus?.git ?? emptyGitStatus(),
        };
        const pushReadiness = pushReadinessForProject(project);

        return {
          ...project,
          nextSafeAction: nextSafeActionForProject(project),
          pushReadiness: {
            ...pushReadiness,
            contract: await latestPushContractForProject(tasks.projectId),
          },
          knowledgeRoute: knowledgeRouteForProject(profile),
        };
      }),
    );

    return {
      mode: "read_only",
      scannedAt: Math.floor(Date.now() / 1000),
      gitStatus: {
        mode: "cached_local_read",
        scannedAt: gitSnapshot.scannedAt,
        cacheTtlMs: gitStatusCacheTtlMs,
        cacheHit: gitSnapshot.cacheHit,
        runsGit: !gitSnapshot.cacheHit,
      },
      intakeCategories,
      projectModes,
      projects,
      summary: {
        total: projects.length,
        local: projects.filter((p) => p.localExists).length,
        dirty: projects.filter((p) => p.git.dirty).length,
        missing: projects.filter((p) => !p.localExists).length,
        pendingApprovals: projects.reduce((sum, p) => sum + p.activity.approvals.pending, 0),
        hedwigProposals: projects.reduce(
          (sum, p) => sum + p.activity.hedwig.pendingCaptures + p.activity.hedwig.reminderProposals + p.activity.hedwig.messageDrafts,
          0,
        ),
        terminalObservations: projects.reduce((sum, p) => sum + p.activity.terminalStatus.total, 0),
        sourceEvents: projects.reduce((sum, p) => sum + p.activity.sourceEvents.total, 0),
        actionDrafts: projects.reduce((sum, p) => sum + p.activity.actionDrafts.total, 0),
        routes: projects.reduce((sum, p) => sum + p.activity.routes.total, 0),
      },
    };
  }),

  gitStatus: publicProcedure
    .input(z.object({ force: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const snapshot = await projectGitStatusSnapshot({ force: input?.force });
      return {
        mode: "cached_local_read" as const,
        scannedAt: snapshot.scannedAt,
        cacheTtlMs: gitStatusCacheTtlMs,
        cacheHit: snapshot.cacheHit,
        runsGit: !snapshot.cacheHit,
        readsOnly: true,
        writesRepo: false,
        executesUserCommands: false,
        projects: snapshot.projects,
        summary: {
          total: snapshot.projects.length,
          local: snapshot.projects.filter((project) => project.localExists).length,
          dirty: snapshot.projects.filter((project) => project.git.dirty).length,
          missing: snapshot.projects.filter((project) => !project.localExists).length,
          dirtyChanges: snapshot.projects.reduce((sum, project) => sum + project.git.dirtyCount, 0),
        },
        gates: [
          "Project git status is a cached read-only local shell read.",
          "It runs `git status --short --branch` and `git remote get-url origin` only when the cache expires or force is true.",
          "It does not stage, commit, push, pull, fetch, checkout, reset, or edit files.",
        ],
      };
    }),

  detail: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(80) }))
    .query(async ({ input }) => projectDetailForSlug(input.slug)),

  createActionDraft: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(80),
        actionKey: z.enum(draftActionKeys),
      }),
    )
    .mutation(async ({ input }) => {
      const profile = projectProfiles.find((candidate) => candidate.slug === input.slug);
      if (!profile) {
        return {
          ok: false as const,
          writesExternal: false,
          editsRepo: false,
          createsTask: false,
          reason: "Unknown Project Lab profile.",
        };
      }
      const db = await getCerebroDb();
      const project = await db.execute({
        sql: `SELECT id FROM projects WHERE path = ? LIMIT 1`,
        args: [profile.localPath],
      });
      const projectId = project.rows[0]?.id == null ? null : Number(project.rows[0].id);
      const draft = draftActionForProject(profile, input.actionKey);
      const gates = [
        "Project Lab action drafts are proposal-only.",
        "This does not create a task, edit a repo, run a command, browse/search, fetch sources, or write to Notion/Slack.",
        "Any later execution requires a separate explicit approval.",
      ];
      const result = await db.execute({
        sql: `
          INSERT INTO project_action_drafts (
            project_id, project_slug, action_key, title, summary,
            proposed_by_agent, owner_agent, gates
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id, project_id, project_slug, action_key, title, summary,
                    proposed_by_agent, owner_agent, gates, status, created_at
        `,
        args: [
          projectId,
          profile.slug,
          input.actionKey,
          draft.title,
          draft.summary,
          draft.proposedByAgent,
          draft.ownerAgent,
          gates.join("\n"),
        ],
      });
      const row = result.rows[0]!;
      return {
        ok: true as const,
        mode: "local_draft" as const,
        appendOnly: true,
        writesExternal: false,
        editsRepo: false,
        createsTask: false,
        draft: {
          id: Number(row.id),
          projectId: row.project_id == null ? null : Number(row.project_id),
          projectSlug: String(row.project_slug),
          actionKey: String(row.action_key),
          title: String(row.title),
          summary: String(row.summary),
          proposedByAgent: String(row.proposed_by_agent),
          ownerAgent: row.owner_agent == null ? null : String(row.owner_agent),
          status: String(row.status),
          createdAt: Number(row.created_at),
        },
        gates,
      };
    }),

  createPushActionContract: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(80),
        workbenchEvidenceId: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const profile = projectProfiles.find((candidate) => candidate.slug === input.slug);
      if (!profile) {
        return {
          ok: false as const,
          writesExternal: false,
          wouldExecute: false,
          reason: "Unknown Project Lab profile.",
        };
      }

      const snapshot = await projectGitStatusSnapshot({ force: true });
      const gitStatus = snapshot.projects.find((project) => project.slug === profile.slug);
      const tasks = await taskRollupForPath(profile.localPath);
      const activity = await activityRollupForProject(tasks.projectId, profile.slug);
      const project = {
        ...profile,
        localExists: gitStatus?.localExists ?? false,
        tasks,
        activity,
        git: gitStatus?.git ?? emptyGitStatus(),
      };
      const pushReadiness = pushReadinessForProject(project);
      const db = await getCerebroDb();
      const projectId = await getOrCreateProjectByPath(profile.name, profile.localPath);
      const existing = await latestPushContractForProject(projectId);
      if (existing && existing.resultState === "not_run" && !["rejected", "cancelled"].includes(existing.approvalStatus ?? "")) {
        if (input.workbenchEvidenceId != null && existing.workbenchEvidenceId == null) {
          await db.execute({
            sql: `
              UPDATE execution_action_proposals
              SET workbench_evidence_id = ?,
                  updated_at = unixepoch()
              WHERE id = ?
            `,
            args: [input.workbenchEvidenceId, existing.id],
          });
        }
        const updated = await latestPushContractForProject(projectId);
        return {
          ok: true as const,
          mode: "approval_gated_push_contract" as const,
          reusedExisting: true,
          writesExternal: false,
          wouldExecute: false,
          projectId,
          taskId: updated?.taskId ?? existing.taskId,
          approvalId: updated?.approvalId ?? existing.approvalId,
          proposalId: updated?.id ?? existing.id,
          pushReadiness,
          contract: updated ?? existing,
          gates: [
            "Reused the latest not-run Project Lab push action contract.",
            "This did not create another task or approval receipt.",
            "This did not stage, commit, push, pull, fetch, checkout, reset, or edit files.",
            "The current V1 runner blocks git remote writes even after approval.",
          ],
        };
      }
      const task = await db.execute({
        sql: `
          INSERT INTO tasks (project_id, title, status, agent)
          VALUES (?, ?, 'open', 'tony')
          RETURNING id
        `,
        args: [projectId, `Review manual push for ${profile.name}`],
      });
      const taskId = Number(task.rows[0]!.id);
      const approval = await db.execute({
        sql: `
          INSERT INTO approvals (
            task_id, action_type, target_type, target_id, requested_by_agent,
            reason, context_summary, sensitive_data_flag, cost_risk
          )
          VALUES (?, 'project_manual_push', 'project', ?, 'spock', ?, ?, 0, 'git_remote_write')
          RETURNING id
        `,
        args: [
          taskId,
          projectId,
          `Approve a manual git push contract for ${profile.name}.`,
          [
            `Project: ${profile.name}`,
            `Path: ${profile.localPath}`,
            `Branch: ${project.git.branch ?? "unavailable"}`,
            `Upstream: ${project.git.upstream ?? "none"}`,
            `Dirty changes: ${project.git.dirtyCount}`,
            `Readiness: ${pushReadiness.label}`,
          ].join("\n"),
        ],
      });
      const approvalId = Number(approval.rows[0]!.id);
      const command = project.git.upstream ? "git push" : `git push -u origin ${project.git.branch ?? "<branch>"}`;
      const receiptBody = [
        `Project push action proposal for ${profile.name}.`,
        `Command target: ${command}`,
        `Working directory: ${profile.localPath}`,
        `Risk: git remote write.`,
        "Executor: Tony after Spock approval.",
        `Readiness: ${pushReadiness.label}.`,
        ...pushReadiness.why.map((item) => `Why: ${item}`),
        ...pushReadiness.checks.map((item) => `Check: ${item}`),
        "Result state: not run.",
      ].join("\n");
      const proposal = await db.execute({
        sql: `
          INSERT INTO execution_action_proposals (
            source_type, source_id, action_type, risk_class, required_approvals,
            executor_agent, command, cwd, project_id, task_id, approval_id,
            workbench_evidence_id, receipt_body, result_state, recovery_note, status
          )
          VALUES (
            'project_push', ?, 'project_manual_push', 'git_remote_write', ?, 'tony',
            ?, ?, ?, ?, ?, ?, ?, 'not_run', ?, 'proposed'
          )
          RETURNING id
        `,
        args: [
          projectId,
          [
            "Spock git remote write approval",
            "Tony staged diff review",
            "Workbench receipt body",
            "Explicit run request",
          ].join("\n"),
          command,
          profile.localPath,
          projectId,
          taskId,
          approvalId,
          input.workbenchEvidenceId ?? null,
          receiptBody,
          "Remote git writes require a manual rollback note before any runner exists.",
        ],
      });

      return {
        ok: true as const,
        mode: "approval_gated_push_contract" as const,
        writesExternal: false,
        wouldExecute: false,
        projectId,
        taskId,
        approvalId,
        proposalId: Number(proposal.rows[0]!.id),
        pushReadiness,
        contract: await latestPushContractForProject(projectId),
        reusedExisting: false,
        gates: [
          "Created one local Project Lab push action contract.",
          "Created one pending Spock approval receipt.",
          "This did not stage, commit, push, pull, fetch, checkout, reset, or edit files.",
          "The current V1 runner blocks git remote writes even after approval.",
        ],
      };
    }),

  appendActionDraftNote: publicProcedure
    .input(
      z.object({
        draftId: z.number().int(),
        note: z.string().min(1).max(1200),
        authorAgent: z.string().min(1).max(80).default("cortana"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getCerebroDb();
      const draft = await db.execute({
        sql: `
          SELECT id, project_id, project_slug
          FROM project_action_drafts
          WHERE id = ?
          LIMIT 1
        `,
        args: [input.draftId],
      });
      const row = draft.rows[0];
      if (!row) {
        return {
          ok: false as const,
          writesExternal: false,
          editsRepo: false,
          createsTask: false,
          reason: "No Project Lab action draft exists for this id.",
        };
      }

      const result = await db.execute({
        sql: `
          INSERT INTO project_action_draft_notes (
            draft_id, project_id, project_slug, note, author_agent
          )
          VALUES (?, ?, ?, ?, ?)
          RETURNING id, draft_id, project_id, project_slug, note, author_agent, status, created_at
        `,
        args: [
          input.draftId,
          row.project_id ?? null,
          String(row.project_slug),
          input.note.trim(),
          input.authorAgent,
        ],
      });

      return {
        ok: true as const,
        appendOnly: true,
        writesExternal: false,
        editsRepo: false,
        createsTask: false,
        note: rowToActionDraftNote(result.rows[0]!),
        gates: [
          "Created one local append-only Project Lab draft note.",
          "This did not create a task, edit a repo, run a command, browse/search, fetch sources, or write to Notion/Slack.",
        ],
      };
    }),
});
