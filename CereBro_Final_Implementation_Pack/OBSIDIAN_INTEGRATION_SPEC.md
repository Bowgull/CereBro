# CereBro V1 — Obsidian Integration Specification

## 1. Purpose

Obsidian is the local human-readable knowledge vault for CereBro.

It stores durable project knowledge in Markdown.

It should remain useful even if CereBro is not running.

## 2. Core Decision

Obsidian is:

- Human-readable
- Local
- Markdown-based
- Project/decision/source/build oriented

Obsidian is not:

- The main app database
- The vector database
- The artifact file registry
- A replacement for SQLite
- A replacement for Chroma

## 3. Vault Path

Default:

```text
~/CereBro/obsidian-vault
```

External SSD option:

```text
/Volumes/[SSD_NAME]/CereBro/obsidian-vault
```

## 4. Vault Folder Structure

```text
/obsidian-vault
  /Projects
  /Decisions
  /Guides
  /Sources
  /Build Logs
  /Learning
  /Templates
  /Changelogs
  /Daily Notes
  /Indexes
```

## 5. Project Folder Structure

For each project:

```text
/Projects/[project-slug]
  index.md
  decisions.md
  sources.md
  tasks.md
  outputs.md
  changelog.md
  notes.md
```

## 6. Frontmatter Standard

Every CereBro-created Obsidian note must include:

```yaml
---
title:
type:
project_id:
project_name:
task_id:
source_id:
artifact_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---
```

Fields may be blank if not applicable.

## 7. Note Naming Conventions

### Project Index

```text
index.md
```

### Decision Note

```text
YYYY-MM-DD_decision_[short-slug].md
```

### Source Note

```text
YYYY-MM-DD_source_[short-slug].md
```

### Build Log

```text
YYYY-MM-DD_build-log_[task-id].md
```

### Guide

```text
YYYY-MM-DD_guide_[short-slug].md
```

### Learning Note

```text
YYYY-MM-DD_learning_[topic-slug].md
```

## 8. Obsidian Note Templates

### 8.1 Project Index

```md
---
title:
type: project_index
project_id:
project_name:
created_at:
updated_at:
tags:
---

# [Project Name]

## Purpose

## Current Status

## Active Tasks

## Recent Decisions

## Sources

## Outputs

## Open Questions

## Next Actions
```

### 8.2 Decision Note

```md
---
title:
type: decision
project_id:
task_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---

# Decision: [Title]

## Decision

## Reasoning

## Alternatives Considered

## Tradeoffs

## Risks

## What This Changes

## What This Does Not Change

## Related Tasks

## Related Sources
```

### 8.3 Source Note

```md
---
title:
type: source_summary
project_id:
source_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---

# Source: [Title]

## Source Location

## Type

## Retrieved

## Summary

## Key Points

## Why This Matters

## Trust Notes

## Related Tasks

## Related Outputs
```

### 8.4 Build Log

```md
---
title:
type: build_log
project_id:
task_id:
created_at:
updated_at:
created_by:
validation_status:
tags:
---

# Build Log: [Task]

## Objective

## Changes Made

## Files Changed

## Tests Run

## Issues Found

## Validation

## Next Steps
```

## 9. Backlink Rules

Every Obsidian note created from a task should link to:

- Project index
- Related task
- Related source if applicable
- Related output if applicable
- Related decision if applicable

Use Markdown links.

## 10. Chroma Linkback Rules

When a note is embedded into Chroma, Chroma metadata must include:

- Obsidian file path
- Project ID
- Task ID if available
- Note type
- Created date
- Updated date
- Tags
- Validation status

## 11. Write Approval Rules

Approval required for:

- Major architecture notes
- User preference memory
- Project decision notes
- Anything sensitive
- Raven/export bridge notes

No approval required for:

- Automatic operational build log summaries if user enabled this
- Source summaries if user explicitly added source to project
- Changelog entries after approved build task

## 12. Obsidian Write Failure

If writing fails:

- Save output locally in Output Library
- Create structured error
- Do not mark memory as written
- Show user recovery path

## 13. Obsidian Integration Done Means

Obsidian integration is complete when:

- Vault path can be configured
- Project folders are created
- Markdown notes can be written
- Frontmatter is valid
- Notes link back to project/task/source
- SQLite stores Obsidian file path
- Chroma metadata links to Obsidian note
- Failed writes do not lose content
