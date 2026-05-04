# CereBro V1 — Storage, Backup, and File Lifecycle

## 1. Purpose

CereBro is local-first.

Local-first only works if files are organized, backed up, and cleaned safely.

Piccolo cannot safely clean the system unless file lifecycle rules are explicit.

## 2. Root Storage Paths

### Default Internal Path

```text
~/CereBro
```

### External SSD Path

```text
/Volumes/[SSD_NAME]/CereBro
```

### Cloud Backup Mirror Optional Path

Examples:

```text
~/Library/CloudStorage/GoogleDrive-[ACCOUNT]/My Drive/CereBro_Backup
~/Library/Mobile Documents/com~apple~CloudDocs/CereBro_Backup
~/Dropbox/CereBro_Backup
```

Cloud backup is optional and must be user-configured.

## 3. Folder Structure

```text
/CereBro
  /apps
  /config
  /data
    /sqlite
    /chroma
    /projects
    /tasks
    /sessions
    /sources
    /artifacts
    /logs
    /tool-calls
    /validations
    /approvals
    /errors
  /obsidian-vault
  /notion-exports
  /skills
  /design-systems
  /adapters
  /models
  /renders
  /browser-captures
  /backups
  /temp
  /archive
```

## 4. Folder Ownership

### `/config`

Stores:

- local settings
- path config
- model registry export
- tool registry export
- user preferences that are not sensitive secrets

Does not store:

- API keys
- OAuth secrets
- raw tokens

### `/data/sqlite`

Stores:

- `cerebro.sqlite`
- SQLite backups
- migration metadata

Backup priority:

High.

### `/data/chroma`

Stores:

- vector database files
- semantic memory index

Backup priority:

Medium to high.

If lost, can be partially rebuilt from Obsidian/sources, but not perfectly.

### `/data/projects`

Stores:

- project metadata exports
- project package snapshots
- per-project indexes

Backup priority:

High.

### `/data/sources`

Stores:

- source text extracts
- source metadata exports
- imported source files if copied into CereBro

Backup priority:

High if sources are not available elsewhere.

### `/data/artifacts`

Stores:

- generated outputs
- Markdown docs
- PDFs
- images
- videos
- design specs
- build handoffs
- exported reports

Backup priority:

High.

### `/data/logs`

Stores:

- app logs
- agent logs
- tool logs
- workflow logs

Backup priority:

Medium.

Logs can be pruned after summaries and backups.

### `/obsidian-vault`

Stores:

- human-readable Markdown notes
- project notes
- decision logs
- build logs
- source summaries
- guides

Backup priority:

Very high.

### `/notion-exports`

Stores:

- local copies of Notion-bound content
- export packages
- failed export drafts

Backup priority:

High.

### `/skills`

Stores:

- skill files

Backup priority:

Very high.

### `/design-systems`

Stores:

- design system Markdown files
- UI rules
- visual references metadata

Backup priority:

Very high.

### `/models`

Stores:

- model metadata
- optional model files if the app manages paths
- notes about installed Ollama models

Backup priority:

Low to medium.

Models can usually be redownloaded, but model registry should be backed up.

### `/renders`

Stores:

- Remotion renders
- video exports
- preview renders

Backup priority:

Medium to high depending on user value.

### `/browser-captures`

Stores:

- screenshots
- extracted page snapshots
- browser session artifacts

Backup priority:

Medium.

### `/backups`

Stores:

- local backup snapshots
- compressed project exports
- database backups

Backup priority:

Very high.

### `/temp`

Stores:

- temporary working files
- scratch outputs
- intermediate conversions

Backup priority:

Low.

Piccolo may clean this with safe rules.

### `/archive`

Stores:

- old completed projects
- old artifacts
- pruned logs
- historical exports

Backup priority:

Medium to high.

## 5. File Naming Rules

### Project Folders

```text
YYYY-MM-DD_project-slug
```

Example:

```text
2026-05-04_cerebro-os
```

### Task Files

```text
task_[task_id]_[short-slug].md
```

### Output Files

```text
YYYY-MM-DD_[project]_[output-type]_[short-slug].md
```

### Validation Reports

```text
validation_[validation_id]_[task_id].md
```

### Changelog Files

```text
CHANGELOG_YYYY-MM.md
```

### Backup Files

```text
cerebro_backup_YYYY-MM-DD_HH-mm.zip
```

## 6. Backup Classes

### Critical

Must be backed up before destructive cleanup:

- SQLite database
- Obsidian vault
- Skills
- Design systems
- Project metadata
- Memory proposal records
- Validation records
- Output Library metadata

### Important

Should be backed up regularly:

- Artifacts
- Source extracts
- Notion exports
- Changelogs
- Browser captures linked to tasks
- Rendered videos user saved

### Rebuildable

Can be redownloaded or regenerated:

- Local model files
- Temporary browser cache
- Temporary render intermediates
- Failed export scratch files

### Disposable

Can be cleaned safely:

- `/temp` files older than safe retention
- failed scratch files
- cache files
- preview renders not linked to artifacts

## 7. Backup Frequency

### On Every Important Change

Back up:

- SQLite
- Changelog
- Important output metadata

### Daily If App Was Used

Back up:

- SQLite
- Obsidian changed notes
- project metadata

### Weekly

Back up:

- complete project metadata
- sources
- outputs
- skills
- design systems
- selected artifacts

### Before Cleanup

Backup check must run before:

- deleting files
- moving important folders
- pruning logs
- archiving projects
- changing storage root

## 8. Piccolo Cleanup Rules

### Safe Without Approval

Piccolo may clean:

- `/temp` files older than configured retention
- empty folders in `/temp`
- failed scratch files that are not linked to tasks
- duplicate temporary preview files

Only if:

- files are not linked to a task/artifact/source
- files are not in critical folders
- action is logged

### Approval Required

Piccolo must ask before:

- deleting logs
- moving artifacts
- archiving project folders
- deleting source extracts
- clearing browser captures
- deleting renders
- changing backup paths
- cleaning anything outside CereBro root

### Blocked Unless Explicitly Enabled

Piccolo must not:

- delete SQLite database
- delete Obsidian vault
- delete skills
- delete design systems
- delete project metadata
- delete backups
- clean system folders outside CereBro
- clean Desktop/Downloads unless explicitly configured

## 9. Restore Procedure

### Full Restore

1. Stop CereBro app.
2. Restore `cerebro.sqlite`.
3. Restore `/obsidian-vault`.
4. Restore `/skills`.
5. Restore `/design-systems`.
6. Restore `/data/projects`.
7. Restore `/data/artifacts`.
8. Restore `/data/sources`.
9. Restore `/data/chroma` if available.
10. Start CereBro.
11. Run system health check.
12. Run source/output consistency check.
13. Run Chroma rebuild if vector DB missing.
14. Verify project dashboards.
15. Verify model registry.

### Partial Restore

If only Obsidian survives:

- Rebuild project notes manually.
- Re-index notes into Chroma.
- Recreate missing SQLite metadata where possible.

If only SQLite survives:

- Artifact paths may be broken.
- Run file consistency checker.
- Mark missing files.
- Do not delete broken records automatically.

## 10. SSD Disconnect Behavior

If external SSD is configured and disconnects:

CereBro must:

- Detect missing root path
- Stop file writes to missing path
- Warn user
- Allow read-only mode if SQLite is unavailable
- Queue non-destructive writes only if safe
- Disable cleanup jobs
- Disable render jobs
- Disable model installs
- Ask user to reconnect or switch path

User message:

```text
The configured CereBro storage path is not available. I paused file writes and cleanup jobs to prevent data loss.
```

## 11. Cloud Backup Failure Behavior

If cloud backup fails:

- Do not delete local files.
- Create backup failure error.
- Show Piccolo warning.
- Retry only if configured.
- Let user choose new backup path.

## 12. File Lifecycle States

Files can be:

- draft
- active
- saved
- exported
- backed_up
- archived
- disposable
- missing
- broken_link

## 13. File Lifecycle Done Means

This system is complete when:

- Every artifact has metadata
- Every file path is tracked
- Important files have backup status
- Piccolo can scan safely
- Cleanup proposals are reviewable
- SSD disconnect is handled
- Restore procedure exists
- File deletion requires correct approval
