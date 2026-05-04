# CereBro V1 — Notion Integration Specification

## 1. Purpose

Notion is the polished human-facing output layer for CereBro.

It is not the primary database.

It is not the source of truth for app state.

It is where completed, useful, user-facing artifacts can be saved.

## 2. Core Decision

Build local Output Library first.

Then build Notion Bridge.

Notion integration must not be required for V1 startup.

## 3. Notion Bridge Role

The Notion Bridge is a logic layer, not an agent.

Allowed agents to request Notion Bridge actions:

- Aang
- C-3PO
- Piccolo

Other agents may propose output, but do not write to Notion directly.

## 4. Notion Write Rule

No Notion write happens without approval unless the user has configured a specific automation.

Default:

```text
Ask before creating or updating Notion pages.
```

## 5. Notion Setup Fields

Settings must support:

```json
{
  "notion_enabled": false,
  "notion_api_key_configured": false,
  "notion_root_page_id": "",
  "notion_projects_database_id": "",
  "notion_outputs_database_id": "",
  "notion_tasks_database_id": "",
  "notion_sources_database_id": "",
  "notion_inbox_database_id": "",
  "default_export_behavior": "ask_every_time"
}
```

## 6. Notion Databases

### 6.1 Projects Database

Properties:

- Name
- Status
- Description
- CereBro Project ID
- Tags
- Active Tasks
- Last Updated
- Related Outputs
- Related Sources

### 6.2 Outputs Database

Properties:

- Title
- Output Type
- CereBro Artifact ID
- Project
- Task ID
- Created Date
- Updated Date
- Validation Status
- Source Links
- Tags
- Saved By Agent

### 6.3 Tasks Database

Properties:

- Title
- CereBro Task ID
- Project
- Status
- Mode
- Owner Agent
- Priority
- Created Date
- Updated Date
- Next Action
- Related Outputs

### 6.4 Sources Database

Properties:

- Title
- Source Type
- URL
- CereBro Source ID
- Project
- Trust Level
- Retrieved Date
- Tags
- Summary

### 6.5 Inbox Database

Properties:

- Title
- Capture Type
- URL/File/Note
- Captured Date
- Status
- Project Suggestion
- Processing Notes
- Processed Output

## 7. Notion Page Templates

### 7.1 Guide Page

```md
# [Guide Title]

## Overview

## Why This Matters

## Step-by-Step

## Checklist

## Resources

## Notes

## Next Actions
```

### 7.2 Checklist Page

```md
# [Checklist Title]

## Goal

## Before You Start

## Checklist

## Validation

## Done Means
```

### 7.3 Learning Page

```md
# [Topic] Learning Guide

## Goal

## Beginner Explanation

## Core Concepts

## Examples

## Practice

## Videos / Resources

## Quiz

## Next Lesson
```

### 7.4 Recipe Page

```md
# [Recipe Name]

## Ingredients

## Instructions

## Timing

## Grocery List

## Notes
```

### 7.5 Build Plan Page

```md
# [Build Plan Title]

## Objective

## Requirements

## Non-Goals

## Architecture

## Implementation Phases

## Test Plan

## Risks

## Claude Code Handoff

## Acceptance Criteria
```

## 8. Sync Direction

### V1 Required

CereBro → Notion export.

### V1 Optional

Notion Inbox → CereBro import.

### Deferred

Full two-way sync.

## 9. Conflict Rules

If Notion page was edited manually:

- Do not overwrite silently.
- Fetch latest page metadata if possible.
- Create conflict warning.
- Offer:
  - create new version
  - overwrite Notion
  - keep local only
  - manually merge

## 10. Notion Export Approval Prompt

```text
Save this to Notion?

Title:
Output type:
Project:
Destination:
Sources included:
Validation status:

Approve export?
```

Options:

- Save once
- Save and remember this destination
- Save locally only
- Cancel

## 11. Failed Export Behavior

If export fails:

- Save output locally
- Create Notion sync error
- Show retry option
- Do not lose content
- Do not mark artifact as exported

## 12. Notion Integration Done Means

Notion integration is complete when:

- User can configure token and root page/database IDs
- User can export an artifact to Notion with approval
- Local artifact stores Notion page ID
- Failed export preserves local output
- Notion writes are logged
- Notion is optional
