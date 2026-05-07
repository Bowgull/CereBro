/**
 * Harness DB for CereBro V1.
 *
 * Local-first by default (file:./cerebro.db). Turso is the same client with
 * a libsql:// URL + auth token; swap via env, no code change.
 *
 * V1 skips drizzle-kit migrations on purpose — schema lives here, applied
 * idempotently on first connect. Move to drizzle migrations in Phase 2 once
 * the schema stabilizes.
 */
import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _ready: Promise<void> | null = null;

function buildClient(): Client {
  const url = process.env.CEREBRO_DB_URL ?? "file:./cerebro.db";
  const authToken = process.env.CEREBRO_DB_AUTH_TOKEN;
  return createClient(authToken ? { url, authToken } : { url });
}

async function ensureSchema(client: Client): Promise<void> {
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS projects (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         path TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE TABLE IF NOT EXISTS tasks (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         title TEXT NOT NULL,
         status TEXT NOT NULL DEFAULT 'open',
         agent TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_path ON projects(path) WHERE path IS NOT NULL`,
      `CREATE TABLE IF NOT EXISTS sessions (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         claude_session_id TEXT NOT NULL UNIQUE,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         hero_class TEXT,
         started_at INTEGER NOT NULL DEFAULT (unixepoch()),
         last_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
         ended_at INTEGER
       )`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC)`,
      `CREATE TABLE IF NOT EXISTS memory_entries (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         kind TEXT NOT NULL DEFAULT 'note',
         body TEXT NOT NULL,
         tags TEXT,
         source TEXT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         embedding BLOB,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_memory_kind ON memory_entries(kind)`,
      `CREATE INDEX IF NOT EXISTS idx_memory_created ON memory_entries(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS memory_proposals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         kind TEXT NOT NULL DEFAULT 'note',
         body TEXT NOT NULL,
         tags TEXT,
         source TEXT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         proposed_by_agent TEXT NOT NULL DEFAULT 'aang',
         status TEXT NOT NULL DEFAULT 'pending',
         oak_status TEXT NOT NULL DEFAULT 'pending',
         oak_notes TEXT,
         approval_id INTEGER,
         memory_entry_id INTEGER REFERENCES memory_entries(id) ON DELETE SET NULL,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_memory_proposals_status ON memory_proposals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_memory_proposals_project ON memory_proposals(project_id)`,
      `CREATE TABLE IF NOT EXISTS outputs (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         kind TEXT NOT NULL DEFAULT 'text',
         title TEXT,
         body TEXT NOT NULL,
         tool_name TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_outputs_session ON outputs(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_outputs_created ON outputs(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS validations (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         target_type TEXT NOT NULL,
         target_id INTEGER,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         memory_proposal_id INTEGER REFERENCES memory_proposals(id) ON DELETE SET NULL,
         output_id INTEGER REFERENCES outputs(id) ON DELETE SET NULL,
         validator_agent TEXT NOT NULL DEFAULT 'oak',
         status TEXT NOT NULL,
         findings TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_validations_target ON validations(target_type, target_id)`,
      `CREATE INDEX IF NOT EXISTS idx_validations_memory_proposal ON validations(memory_proposal_id)`,
      `CREATE TABLE IF NOT EXISTS approvals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         action_type TEXT NOT NULL,
         target_type TEXT,
         target_id INTEGER,
         requested_by_agent TEXT,
         status TEXT NOT NULL DEFAULT 'pending',
         reason TEXT,
         context_summary TEXT,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         cost_risk TEXT,
         permission_preflight_id INTEGER REFERENCES permission_preflight_records(id) ON DELETE SET NULL,
         decided_at INTEGER,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_approvals_target ON approvals(target_type, target_id)`,
      `CREATE TABLE IF NOT EXISTS tool_calls (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         agent_id TEXT,
         tool_name TEXT NOT NULL,
         permission_class TEXT NOT NULL,
         approval_id INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
         input_summary TEXT,
         output_summary TEXT,
         status TEXT NOT NULL DEFAULT 'logged',
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_tool_calls_task ON tool_calls(task_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tool_calls_agent ON tool_calls(agent_id)`,
      `CREATE TABLE IF NOT EXISTS command_observations (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         command TEXT NOT NULL,
         cwd TEXT,
         risk TEXT NOT NULL DEFAULT 'unknown',
         suggested_agent TEXT,
         explanation TEXT,
         gates TEXT,
         source TEXT NOT NULL DEFAULT 'terminal_lab_preview',
         status TEXT NOT NULL DEFAULT 'previewed',
         exit_code INTEGER,
         output_summary TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_command_observations_created ON command_observations(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_command_observations_project ON command_observations(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_command_observations_task ON command_observations(task_id)`,
      `CREATE TABLE IF NOT EXISTS capture_observations (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         title TEXT NOT NULL,
         raw_text TEXT NOT NULL,
         capture_type TEXT NOT NULL,
         status TEXT NOT NULL DEFAULT 'inbox',
         priority TEXT NOT NULL DEFAULT 'normal',
         source_uri TEXT,
         source_label TEXT,
         project_guess TEXT,
         owner_agent TEXT NOT NULL DEFAULT 'hedwig',
         needs_review INTEGER NOT NULL DEFAULT 1,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         proposed_notion_row TEXT,
         source TEXT NOT NULL DEFAULT 'hedwig_preview',
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_capture_observations_created ON capture_observations(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_capture_observations_project ON capture_observations(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_capture_observations_status ON capture_observations(status)`,
      `CREATE TABLE IF NOT EXISTS reminder_proposals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         capture_observation_id INTEGER REFERENCES capture_observations(id) ON DELETE SET NULL,
         title TEXT NOT NULL,
         timing_hint TEXT,
         raw_text TEXT NOT NULL,
         status TEXT NOT NULL DEFAULT 'proposed',
         owner_agent TEXT NOT NULL DEFAULT 'hedwig',
         approval_required TEXT NOT NULL,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_reminder_proposals_created ON reminder_proposals(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_reminder_proposals_status ON reminder_proposals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_reminder_proposals_capture ON reminder_proposals(capture_observation_id)`,
      `CREATE TABLE IF NOT EXISTS message_draft_proposals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         capture_observation_id INTEGER REFERENCES capture_observations(id) ON DELETE SET NULL,
         title TEXT NOT NULL,
         recipient_hint TEXT,
         raw_text TEXT NOT NULL,
         draft_intent TEXT NOT NULL,
         status TEXT NOT NULL DEFAULT 'proposed',
         owner_agent TEXT NOT NULL DEFAULT 'hedwig',
         approval_required TEXT NOT NULL,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_message_draft_proposals_created ON message_draft_proposals(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_message_draft_proposals_status ON message_draft_proposals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_message_draft_proposals_capture ON message_draft_proposals(capture_observation_id)`,
      `CREATE TABLE IF NOT EXISTS sources (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         kind TEXT NOT NULL DEFAULT 'url',
         uri TEXT NOT NULL,
         title TEXT,
         summary TEXT,
         source_type TEXT NOT NULL DEFAULT 'public_url',
         trust_level TEXT NOT NULL DEFAULT 'unknown',
         freshness_status TEXT NOT NULL DEFAULT 'unknown',
         content_type TEXT,
         word_count INTEGER,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         scrub_notes TEXT,
         trust_notes TEXT,
         last_scrubbed_at INTEGER,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         fetched_at INTEGER,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_sources_uri ON sources(uri)`,
      `CREATE TABLE IF NOT EXISTS source_events (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
         uri TEXT NOT NULL,
         event_type TEXT NOT NULL,
         title TEXT,
         summary TEXT,
         source_type TEXT,
         trust_level TEXT,
         freshness_status TEXT,
         content_type TEXT,
         word_count INTEGER,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         scrub_notes TEXT,
         trust_notes TEXT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         owner_agent TEXT,
         source_label TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_source_events_uri ON source_events(uri)`,
      `CREATE INDEX IF NOT EXISTS idx_source_events_source ON source_events(source_id)`,
      `CREATE INDEX IF NOT EXISTS idx_source_events_created ON source_events(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS workbench_evidence_records (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         kind TEXT NOT NULL,
         title TEXT NOT NULL,
         summary TEXT NOT NULL,
         target_uri TEXT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
         command_observation_id INTEGER REFERENCES command_observations(id) ON DELETE SET NULL,
         artifact_id INTEGER REFERENCES artifacts(id) ON DELETE SET NULL,
         owner_agent TEXT NOT NULL DEFAULT 'cortana',
         route_agent TEXT,
         viewport TEXT,
         coordinates TEXT,
         annotation_text TEXT,
         media_name TEXT,
         media_mime_type TEXT,
         media_byte_size INTEGER,
         media_kind TEXT,
         media_frame_time_sec REAL,
         media_duration_sec REAL,
         media_temporary_flag INTEGER NOT NULL DEFAULT 0,
         before_evidence_id INTEGER REFERENCES workbench_evidence_records(id) ON DELETE SET NULL,
         after_evidence_id INTEGER REFERENCES workbench_evidence_records(id) ON DELETE SET NULL,
         comparison_result TEXT,
         validation_status TEXT NOT NULL DEFAULT 'unvalidated',
         permission_class TEXT NOT NULL DEFAULT 'manual_note',
         permission_preflight_id INTEGER REFERENCES permission_preflight_records(id) ON DELETE SET NULL,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_workbench_evidence_created ON workbench_evidence_records(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_workbench_evidence_project ON workbench_evidence_records(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_workbench_evidence_kind ON workbench_evidence_records(kind)`,
      `CREATE TABLE IF NOT EXISTS project_action_drafts (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         project_slug TEXT NOT NULL,
         action_key TEXT NOT NULL,
         title TEXT NOT NULL,
         summary TEXT NOT NULL,
         proposed_by_agent TEXT NOT NULL DEFAULT 'batman',
         owner_agent TEXT,
         gates TEXT,
         status TEXT NOT NULL DEFAULT 'drafted',
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_project_action_drafts_project ON project_action_drafts(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_project_action_drafts_created ON project_action_drafts(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS project_action_draft_notes (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         draft_id INTEGER REFERENCES project_action_drafts(id) ON DELETE SET NULL,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         project_slug TEXT NOT NULL,
         note TEXT NOT NULL,
         author_agent TEXT NOT NULL DEFAULT 'cortana',
         status TEXT NOT NULL DEFAULT 'noted',
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_project_action_draft_notes_draft ON project_action_draft_notes(draft_id)`,
      `CREATE INDEX IF NOT EXISTS idx_project_action_draft_notes_project ON project_action_draft_notes(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_project_action_draft_notes_created ON project_action_draft_notes(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS artifacts (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         kind TEXT NOT NULL,
         lifecycle_state TEXT NOT NULL DEFAULT 'active',
         title TEXT,
         project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
         task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
         session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
         owner_agent TEXT,
         storage_provider TEXT NOT NULL,
         storage_path TEXT NOT NULL,
         source_uri TEXT,
         source_artifact_id INTEGER REFERENCES artifacts(id) ON DELETE SET NULL,
         prompt_or_instruction TEXT,
         content_hash TEXT,
         byte_size INTEGER,
         mime_type TEXT,
         approval_id INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
         validation_id INTEGER REFERENCES validations(id) ON DELETE SET NULL,
         retention_rule TEXT NOT NULL DEFAULT 'delete_after_approval',
         cleanup_eligible_at INTEGER,
         cleanup_reason TEXT,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         client_visible INTEGER NOT NULL DEFAULT 0,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
         archived_at INTEGER,
         deleted_at INTEGER
       )`,
      `CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_artifacts_state ON artifacts(lifecycle_state)`,
      `CREATE INDEX IF NOT EXISTS idx_artifacts_storage_path ON artifacts(storage_provider, storage_path)`,
      `CREATE INDEX IF NOT EXISTS idx_artifacts_cleanup ON artifacts(cleanup_eligible_at)`,
      `CREATE TABLE IF NOT EXISTS cleanup_candidates (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         artifact_id INTEGER REFERENCES artifacts(id) ON DELETE SET NULL,
         scan_type TEXT NOT NULL,
         proposed_action TEXT NOT NULL,
         reason TEXT NOT NULL,
         risk_level TEXT NOT NULL DEFAULT 'low',
         status TEXT NOT NULL DEFAULT 'proposed',
         requested_by_agent TEXT NOT NULL DEFAULT 'piccolo',
         approval_id INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         decided_at INTEGER
       )`,
      `CREATE INDEX IF NOT EXISTS idx_cleanup_candidates_status ON cleanup_candidates(status)`,
      `CREATE INDEX IF NOT EXISTS idx_cleanup_candidates_artifact ON cleanup_candidates(artifact_id)`,
      `CREATE TABLE IF NOT EXISTS model_registry (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL,
         provider TEXT NOT NULL,
         location TEXT NOT NULL,
         model_class TEXT NOT NULL,
         enabled INTEGER NOT NULL DEFAULT 1,
         context_window INTEGER,
         estimated_ram_need TEXT,
         estimated_disk_need TEXT,
         best_for TEXT,
         avoid_for TEXT,
         privacy_notes TEXT,
         cost_notes TEXT,
         hardware_notes TEXT,
         tested_on_device INTEGER NOT NULL DEFAULT 0,
         test_result TEXT,
         last_tested_at INTEGER,
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_model_registry_class ON model_registry(model_class)`,
      `CREATE TABLE IF NOT EXISTS model_tool_capabilities (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         provider TEXT NOT NULL,
         tool_name TEXT NOT NULL,
         capability_kind TEXT NOT NULL,
         access_method TEXT NOT NULL,
         account_required TEXT NOT NULL DEFAULT 'unknown',
         free_tier TEXT,
         rate_limit TEXT,
         cost_notes TEXT,
         context_window INTEGER,
         input_limits TEXT,
         output_limits TEXT,
         modalities TEXT,
         strengths TEXT,
         weaknesses TEXT,
         prompt_style TEXT,
         privacy_class TEXT NOT NULL DEFAULT 'unknown',
         data_allowed TEXT,
         eval_status TEXT NOT NULL DEFAULT 'untested',
         eval_score REAL,
         approval_level TEXT NOT NULL DEFAULT 'explicit_approval',
         source_uris TEXT,
         last_verified_at INTEGER,
         discovered_by_agent TEXT NOT NULL DEFAULT 'surfer',
         risk_review TEXT,
         validation_notes TEXT,
         failure_notes TEXT,
         fallback_suggestion TEXT,
         status TEXT NOT NULL DEFAULT 'proposal',
         created_at INTEGER NOT NULL DEFAULT (unixepoch()),
         updated_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_capabilities_provider ON model_tool_capabilities(provider)`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_capabilities_kind ON model_tool_capabilities(capability_kind)`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_capabilities_eval ON model_tool_capabilities(eval_status)`,
      `CREATE TABLE IF NOT EXISTS model_tool_evals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         capability_id INTEGER REFERENCES model_tool_capabilities(id) ON DELETE SET NULL,
         eval_task_key TEXT NOT NULL,
         task_summary TEXT NOT NULL,
         prompt_or_handoff_id INTEGER REFERENCES artifacts(id) ON DELETE SET NULL,
         expected_signal TEXT,
         result_summary TEXT,
         score REAL,
         status TEXT NOT NULL DEFAULT 'recorded',
         evaluator_agent TEXT NOT NULL DEFAULT 'spock',
         validation_notes TEXT,
         privacy_notes TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_evals_capability ON model_tool_evals(capability_id)`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_evals_task ON model_tool_evals(eval_task_key)`,
      `CREATE TABLE IF NOT EXISTS model_tool_call_logs (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         capability_id INTEGER REFERENCES model_tool_capabilities(id) ON DELETE SET NULL,
         provider TEXT,
         tool_name TEXT,
         task_kind TEXT NOT NULL,
         agent_id TEXT,
         approval_id INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
         prompt_or_handoff_id INTEGER REFERENCES artifacts(id) ON DELETE SET NULL,
         input_summary TEXT,
         output_summary TEXT,
         token_or_input_size TEXT,
         cost_or_free_tier_note TEXT,
         result_status TEXT NOT NULL DEFAULT 'logged',
         failure_notes TEXT,
         validation_notes TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_call_logs_capability ON model_tool_call_logs(capability_id)`,
      `CREATE INDEX IF NOT EXISTS idx_model_tool_call_logs_created ON model_tool_call_logs(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS permission_mode_events (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         mode TEXT NOT NULL,
         requested_by_agent TEXT NOT NULL DEFAULT 'cortana',
         reason TEXT,
         scope_summary TEXT,
         hard_gates TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_permission_mode_events_created ON permission_mode_events(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS permission_preflight_records (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         mode TEXT NOT NULL,
         perception_class TEXT,
         action_class TEXT,
         decision TEXT NOT NULL,
         approval_required INTEGER NOT NULL DEFAULT 0,
         required_approvals TEXT,
         reasons TEXT,
         mode_effect TEXT,
         sensitive_data_flag INTEGER NOT NULL DEFAULT 0,
         external_target_flag INTEGER NOT NULL DEFAULT 0,
         destructive_flag INTEGER NOT NULL DEFAULT 0,
         persists_memory_flag INTEGER NOT NULL DEFAULT 0,
         requested_by_agent TEXT NOT NULL DEFAULT 'cortana',
         target_summary TEXT,
         created_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
      `CREATE INDEX IF NOT EXISTS idx_permission_preflight_created ON permission_preflight_records(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_permission_preflight_decision ON permission_preflight_records(decision)`,
      `CREATE INDEX IF NOT EXISTS idx_permission_preflight_action ON permission_preflight_records(action_class)`,
      `CREATE TABLE IF NOT EXISTS skill_registry (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL,
         source_path TEXT NOT NULL,
         owner_agents TEXT,
         supporting_agents TEXT,
         risk_level TEXT NOT NULL DEFAULT 'normal',
         enabled INTEGER NOT NULL DEFAULT 1,
         loaded_at INTEGER NOT NULL DEFAULT (unixepoch())
       )`,
    ],
    "write",
  );

  await ensureSourceMetadataColumns(client);
  await ensureHedwigProposalMetadataColumns(client);
  await ensureWorkbenchEvidenceColumns(client);
  await ensureApprovalColumns(client);
}

async function ensureSourceMetadataColumns(client: Client): Promise<void> {
  const table = await client.execute(`PRAGMA table_info(sources)`);
  const existing = new Set(table.rows.map((row) => String(row.name)));
  const columns: Array<{ name: string; sql: string }> = [
    { name: "source_type", sql: `ALTER TABLE sources ADD COLUMN source_type TEXT NOT NULL DEFAULT 'public_url'` },
    { name: "trust_level", sql: `ALTER TABLE sources ADD COLUMN trust_level TEXT NOT NULL DEFAULT 'unknown'` },
    { name: "freshness_status", sql: `ALTER TABLE sources ADD COLUMN freshness_status TEXT NOT NULL DEFAULT 'unknown'` },
    { name: "content_type", sql: `ALTER TABLE sources ADD COLUMN content_type TEXT` },
    { name: "word_count", sql: `ALTER TABLE sources ADD COLUMN word_count INTEGER` },
    { name: "sensitive_data_flag", sql: `ALTER TABLE sources ADD COLUMN sensitive_data_flag INTEGER NOT NULL DEFAULT 0` },
    { name: "scrub_notes", sql: `ALTER TABLE sources ADD COLUMN scrub_notes TEXT` },
    { name: "trust_notes", sql: `ALTER TABLE sources ADD COLUMN trust_notes TEXT` },
    { name: "last_scrubbed_at", sql: `ALTER TABLE sources ADD COLUMN last_scrubbed_at INTEGER` },
  ];

  for (const column of columns) {
    if (!existing.has(column.name)) {
      await client.execute(column.sql);
    }
  }
}

async function ensureHedwigProposalMetadataColumns(client: Client): Promise<void> {
  const tableColumns = async (tableName: string) => {
    const table = await client.execute(`PRAGMA table_info(${tableName})`);
    return new Set(table.rows.map((row) => String(row.name)));
  };

  const captureColumns = await tableColumns("capture_observations");
  const captureAdditions: Array<{ name: string; sql: string }> = [
    { name: "review_notes", sql: `ALTER TABLE capture_observations ADD COLUMN review_notes TEXT` },
    { name: "approval_scope", sql: `ALTER TABLE capture_observations ADD COLUMN approval_scope TEXT` },
    { name: "proposed_external_target", sql: `ALTER TABLE capture_observations ADD COLUMN proposed_external_target TEXT` },
    { name: "last_reviewed_at", sql: `ALTER TABLE capture_observations ADD COLUMN last_reviewed_at INTEGER` },
  ];
  for (const column of captureAdditions) {
    if (!captureColumns.has(column.name)) {
      await client.execute(column.sql);
    }
  }

  for (const tableName of ["reminder_proposals", "message_draft_proposals"]) {
    const existing = await tableColumns(tableName);
    const additions: Array<{ name: string; sql: string }> = [
      { name: "review_priority", sql: `ALTER TABLE ${tableName} ADD COLUMN review_priority TEXT NOT NULL DEFAULT 'normal'` },
      { name: "review_notes", sql: `ALTER TABLE ${tableName} ADD COLUMN review_notes TEXT` },
      { name: "approval_scope", sql: `ALTER TABLE ${tableName} ADD COLUMN approval_scope TEXT` },
      { name: "proposed_external_target", sql: `ALTER TABLE ${tableName} ADD COLUMN proposed_external_target TEXT` },
      { name: "last_reviewed_at", sql: `ALTER TABLE ${tableName} ADD COLUMN last_reviewed_at INTEGER` },
    ];
    for (const column of additions) {
      if (!existing.has(column.name)) {
        await client.execute(column.sql);
      }
    }
  }
}

async function ensureWorkbenchEvidenceColumns(client: Client): Promise<void> {
  const table = await client.execute(`PRAGMA table_info(workbench_evidence_records)`);
  const existing = new Set(table.rows.map((row) => String(row.name)));
  const additions: Array<{ name: string; sql: string }> = [
    { name: "media_name", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_name TEXT` },
    { name: "media_mime_type", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_mime_type TEXT` },
    { name: "media_byte_size", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_byte_size INTEGER` },
    { name: "media_kind", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_kind TEXT` },
    { name: "media_frame_time_sec", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_frame_time_sec REAL` },
    { name: "media_duration_sec", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_duration_sec REAL` },
    { name: "media_temporary_flag", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN media_temporary_flag INTEGER NOT NULL DEFAULT 0` },
    { name: "before_evidence_id", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN before_evidence_id INTEGER REFERENCES workbench_evidence_records(id) ON DELETE SET NULL` },
    { name: "after_evidence_id", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN after_evidence_id INTEGER REFERENCES workbench_evidence_records(id) ON DELETE SET NULL` },
    { name: "comparison_result", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN comparison_result TEXT` },
    { name: "permission_preflight_id", sql: `ALTER TABLE workbench_evidence_records ADD COLUMN permission_preflight_id INTEGER REFERENCES permission_preflight_records(id) ON DELETE SET NULL` },
  ];
  for (const column of additions) {
    if (!existing.has(column.name)) {
      await client.execute(column.sql);
    }
  }
}

async function ensureApprovalColumns(client: Client): Promise<void> {
  const table = await client.execute(`PRAGMA table_info(approvals)`);
  const existing = new Set(table.rows.map((row) => String(row.name)));
  if (!existing.has("permission_preflight_id")) {
    await client.execute(`ALTER TABLE approvals ADD COLUMN permission_preflight_id INTEGER REFERENCES permission_preflight_records(id) ON DELETE SET NULL`);
  }
}

export type MemoryKind = "fact" | "note" | "reference" | "feedback";
export type MemoryProposalStatus =
  | "pending"
  | "validated"
  | "needs_revision"
  | "blocked"
  | "approved"
  | "written"
  | "rejected";
export interface MemoryRow {
  id: number;
  kind: MemoryKind;
  body: string;
  tags: string | null;
  source: string | null;
  projectId: number | null;
  sessionId: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryProposalRow {
  id: number;
  kind: MemoryKind;
  body: string;
  tags: string | null;
  source: string | null;
  projectId: number | null;
  sessionId: number | null;
  proposedByAgent: string;
  status: MemoryProposalStatus;
  oakStatus: string;
  oakNotes: string | null;
  approvalId: number | null;
  memoryEntryId: number | null;
  createdAt: number;
  updatedAt: number;
}

export type OutputKind = "text" | "code" | "file" | "diff" | "tool_result";
export interface OutputRow {
  id: number;
  sessionId: number | null;
  projectId: number | null;
  kind: OutputKind;
  title: string | null;
  body: string;
  toolName: string | null;
  createdAt: number;
}

export type SourceKind = "url" | "doc" | "file" | "note";
export interface SourceRow {
  id: number;
  kind: SourceKind;
  uri: string;
  title: string | null;
  summary: string | null;
  sourceType: string;
  trustLevel: string;
  freshnessStatus: string;
  contentType: string | null;
  wordCount: number | null;
  sensitiveDataFlag: boolean;
  scrubNotes: string | null;
  trustNotes: string | null;
  lastScrubbedAt: number | null;
  projectId: number | null;
  fetchedAt: number | null;
  createdAt: number;
}

export interface SourceEventInput {
  sourceId?: number | null;
  uri: string;
  eventType: string;
  title?: string | null;
  summary?: string | null;
  sourceType?: string | null;
  trustLevel?: string | null;
  freshnessStatus?: string | null;
  contentType?: string | null;
  wordCount?: number | null;
  sensitiveDataFlag?: boolean;
  scrubNotes?: string | null;
  trustNotes?: string | null;
  projectId?: number | null;
  ownerAgent?: string | null;
  sourceLabel?: string | null;
}

export type ArtifactLifecycleState =
  | "inbox"
  | "active"
  | "review"
  | "published"
  | "superseded"
  | "archived"
  | "temp"
  | "trash_staged"
  | "deleted";

export type ArtifactStorageProvider =
  | "vault"
  | "obsidian"
  | "notion"
  | "repo"
  | "local"
  | "external";

export interface ArtifactInput {
  kind: string;
  lifecycleState?: ArtifactLifecycleState;
  title?: string | null;
  projectId?: number | null;
  taskId?: number | null;
  sessionId?: number | null;
  ownerAgent?: string | null;
  storageProvider: ArtifactStorageProvider;
  storagePath: string;
  sourceUri?: string | null;
  sourceArtifactId?: number | null;
  promptOrInstruction?: string | null;
  contentHash?: string | null;
  byteSize?: number | null;
  mimeType?: string | null;
  approvalId?: number | null;
  validationId?: number | null;
  retentionRule?: string;
  cleanupEligibleAt?: number | null;
  cleanupReason?: string | null;
  sensitiveDataFlag?: boolean;
  clientVisible?: boolean;
}

export interface SessionRow {
  id: number;
  claudeSessionId: string;
  projectId: number | null;
  projectName: string | null;
  projectPath: string | null;
  heroClass: string | null;
  startedAt: number;
  lastSeenAt: number;
  endedAt: number | null;
}

export async function getOrCreateProjectByPath(
  name: string,
  pathValue: string,
): Promise<number> {
  const db = await getCerebroDb();
  const existing = await db.execute({
    sql: `SELECT id FROM projects WHERE path = ? LIMIT 1`,
    args: [pathValue],
  });
  if (existing.rows[0]) return Number(existing.rows[0].id);
  const inserted = await db.execute({
    sql: `INSERT INTO projects (name, path) VALUES (?, ?) RETURNING id`,
    args: [name, pathValue],
  });
  return Number(inserted.rows[0]!.id);
}

/**
 * Idempotent. Called on hero-new from the websocket layer when a real
 * Claude Code transcript file is detected. Demo heroes (no sessionFile)
 * must not be passed in.
 */
export async function recordSessionStart(input: {
  claudeSessionId: string;
  projectName: string;
  projectPath: string;
  heroClass: string;
}): Promise<void> {
  try {
    const db = await getCerebroDb();
    const projectId = await getOrCreateProjectByPath(
      input.projectName,
      input.projectPath,
    );
    await db.execute({
      sql: `
        INSERT INTO sessions (claude_session_id, project_id, hero_class)
        VALUES (?, ?, ?)
        ON CONFLICT(claude_session_id) DO UPDATE SET
          last_seen_at = unixepoch(),
          ended_at = NULL,
          project_id = excluded.project_id,
          hero_class = excluded.hero_class
      `,
      args: [input.claudeSessionId, projectId, input.heroClass],
    });
  } catch (err) {
    console.error("[CerebroDB] recordSessionStart failed:", err);
  }
}

export async function recordSessionEnd(claudeSessionId: string): Promise<void> {
  try {
    const db = await getCerebroDb();
    await db.execute({
      sql: `
        UPDATE sessions
        SET ended_at = unixepoch(), last_seen_at = unixepoch()
        WHERE claude_session_id = ? AND ended_at IS NULL
      `,
      args: [claudeSessionId],
    });
  } catch (err) {
    console.error("[CerebroDB] recordSessionEnd failed:", err);
  }
}

export async function recordOutput(input: {
  claudeSessionId: string | null;
  kind: OutputKind;
  title: string | null;
  body: string;
  toolName: string | null;
}): Promise<void> {
  try {
    const db = await getCerebroDb();
    let sessionId: number | null = null;
    let projectId: number | null = null;
    if (input.claudeSessionId) {
      const r = await db.execute({
        sql: `SELECT id, project_id FROM sessions WHERE claude_session_id = ? LIMIT 1`,
        args: [input.claudeSessionId],
      });
      const row = r.rows[0];
      if (row) {
        sessionId = Number(row.id);
        projectId = row.project_id == null ? null : Number(row.project_id);
      }
    }
    await db.execute({
      sql: `
        INSERT INTO outputs (session_id, project_id, kind, title, body, tool_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [sessionId, projectId, input.kind, input.title, input.body, input.toolName],
    });
  } catch (err) {
    console.error("[CerebroDB] recordOutput failed:", err);
  }
}

export async function recordArtifact(input: ArtifactInput): Promise<number | null> {
  try {
    const db = await getCerebroDb();
    await db.execute({
      sql: `
        UPDATE artifacts
        SET lifecycle_state = 'superseded',
            cleanup_reason = COALESCE(cleanup_reason, 'Superseded by newer artifact for the same storage path.'),
            archived_at = COALESCE(archived_at, unixepoch()),
            updated_at = unixepoch()
        WHERE storage_provider = ?
          AND storage_path = ?
          AND lifecycle_state NOT IN ('superseded', 'archived', 'deleted')
      `,
      args: [input.storageProvider, input.storagePath],
    });
    const result = await db.execute({
      sql: `
        INSERT INTO artifacts (
          kind, lifecycle_state, title, project_id, task_id, session_id,
          owner_agent, storage_provider, storage_path, source_uri,
          source_artifact_id, prompt_or_instruction, content_hash, byte_size,
          mime_type, approval_id, validation_id, retention_rule,
          cleanup_eligible_at, cleanup_reason, sensitive_data_flag,
          client_visible
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `,
      args: [
        input.kind,
        input.lifecycleState ?? "active",
        input.title ?? null,
        input.projectId ?? null,
        input.taskId ?? null,
        input.sessionId ?? null,
        input.ownerAgent ?? null,
        input.storageProvider,
        input.storagePath,
        input.sourceUri ?? null,
        input.sourceArtifactId ?? null,
        input.promptOrInstruction ?? null,
        input.contentHash ?? null,
        input.byteSize ?? null,
        input.mimeType ?? null,
        input.approvalId ?? null,
        input.validationId ?? null,
        input.retentionRule ?? "delete_after_approval",
        input.cleanupEligibleAt ?? null,
        input.cleanupReason ?? null,
        input.sensitiveDataFlag ? 1 : 0,
        input.clientVisible ? 1 : 0,
      ],
    });
    return Number(result.rows[0]!.id);
  } catch (err) {
    console.error("[CerebroDB] recordArtifact failed:", err);
    return null;
  }
}

export async function recordSourceEvent(input: SourceEventInput): Promise<number | null> {
  try {
    const db = await getCerebroDb();
    const result = await db.execute({
      sql: `
        INSERT INTO source_events (
          source_id, uri, event_type, title, summary, source_type, trust_level,
          freshness_status, content_type, word_count, sensitive_data_flag,
          scrub_notes, trust_notes, project_id, owner_agent, source_label
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `,
      args: [
        input.sourceId ?? null,
        input.uri,
        input.eventType,
        input.title ?? null,
        input.summary ?? null,
        input.sourceType ?? null,
        input.trustLevel ?? null,
        input.freshnessStatus ?? null,
        input.contentType ?? null,
        input.wordCount ?? null,
        input.sensitiveDataFlag ? 1 : 0,
        input.scrubNotes ?? null,
        input.trustNotes ?? null,
        input.projectId ?? null,
        input.ownerAgent ?? null,
        input.sourceLabel ?? null,
      ],
    });
    return Number(result.rows[0]!.id);
  } catch (err) {
    console.error("[CerebroDB] recordSourceEvent failed:", err);
    return null;
  }
}

export async function touchSession(claudeSessionId: string): Promise<void> {
  try {
    const db = await getCerebroDb();
    await db.execute({
      sql: `UPDATE sessions SET last_seen_at = unixepoch() WHERE claude_session_id = ?`,
      args: [claudeSessionId],
    });
  } catch (err) {
    console.error("[CerebroDB] touchSession failed:", err);
  }
}

export async function getCerebroDb(): Promise<Client> {
  if (_client && _ready) {
    await _ready;
    return _client;
  }
  _client = buildClient();
  _ready = ensureSchema(_client).catch((err) => {
    console.error("[CerebroDB] Failed to apply schema:", err);
    throw err;
  });
  await _ready;
  return _client;
}

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface TaskRow {
  id: number;
  projectId: number | null;
  projectName: string | null;
  projectPath: string | null;
  title: string;
  status: TaskStatus;
  agent: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectRow {
  id: number;
  name: string;
  path: string | null;
  createdAt: number;
}
