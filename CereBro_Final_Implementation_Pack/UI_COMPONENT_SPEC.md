# CereBro V1 — UI Component Specification

## 1. Purpose

This file defines implementation-level UI components for the CereBro shell.

The goal is to give Claude Code enough structure to build the first version without inventing a generic dashboard.

## 2. Design Tokens

### Color Intent

Use tokens, not random hardcoded colors.

```ts
export const colors = {
  background: "deep-charcoal",
  surface: "charcoal-panel",
  surfaceRaised: "raised-panel",
  border: "muted-stone-border",
  textPrimary: "warm-off-white",
  textSecondary: "muted-silver",
  accent: "arcane-blue",
  accentSecondary: "violet-glow",
  success: "sage-green",
  warning: "amber",
  danger: "red",
  blocked: "deep-red"
};
```

Claude Code should translate these into actual Tailwind classes in the design system.

### Typography

Use:

- Strong page titles
- Clear section headings
- Comfortable body text
- Small metadata labels
- Monospace only for IDs/logs/code

### Spacing

Use consistent spacing scale:

- compact controls
- medium panels
- generous main workspace spacing
- no cramped dense cards

## 3. Core Layout Components

### `AppShell`

Props:

```ts
{
  leftRail: ReactNode;
  center: ReactNode;
  rightPanel: ReactNode;
  commandBar: ReactNode;
}
```

Responsibilities:

- Desktop layout
- Resizable or collapsible side panels later
- Main background
- Safe overflow handling

### `LeftRail`

Items:

- Home
- Project Spaces
- Inbox
- Tasks
- Sources
- Outputs
- Memory
- Automation
- Settings

States:

- active
- inactive
- badge
- disabled

### `CommandBar`

Elements:

- input
- mode selector
- attach source button
- create task button
- approval action area when needed

States:

- idle
- typing
- processing
- waiting_for_approval
- disabled

### `RightContextPanel`

Sections:

- Active Agent
- Current Mode
- Task Status
- Context Pack
- Tool Permissions
- Oak Validation
- Next Actions

## 4. Project Components

### `ProjectCard`

Shows:

- project name
- description
- status
- active task count
- source count
- output count
- last updated
- tags

Actions:

- open
- archive
- add source
- create task

### `ProjectDashboard`

Sections:

- summary
- active tasks
- recent sessions
- decisions
- sources
- outputs
- open questions
- next actions

## 5. Task Components

### `TaskCard`

Shows:

- title
- mode
- status
- owner agent
- project
- updated date
- validation status

### `TaskDetail`

Shows:

- title
- goal
- mode
- status
- owner
- supporting agents
- context pack
- timeline
- outputs
- validations
- approvals
- memory proposals

### `TaskTimeline`

Events:

- created
- context_created
- routed
- tool_requested
- approval_requested
- output_created
- validation_passed
- validation_blocked
- saved
- completed

## 6. Agent Components

### `AgentBadge`

Shows:

- agent name
- role
- status

Statuses:

- idle
- active
- waiting
- validating
- blocked
- disabled
- sealed

### `AgentActivityCard`

Shows:

- active agent
- current step
- assigned task
- tool requested
- waiting state

Do not show fake agent conversations.

## 7. Source Components

### `SourceCard`

Shows:

- title
- type
- trust level
- project
- tags
- retrieved date
- summary

### `SourceDetail`

Shows:

- metadata
- summary
- key points
- related tasks
- related outputs
- trust notes
- save/export actions

## 8. Output Components

### `ArtifactCard`

Shows:

- title
- output type
- project
- task
- created date
- validation status
- save destination

### `ArtifactViewer`

Supports:

- Markdown
- source summary
- build handoff
- design spec
- validation report
- checklist
- guide

## 9. Approval Components

### `ApprovalPrompt`

Shows:

- action requested
- requesting agent
- risk level
- context summary
- what will happen
- approve/reject buttons

Risk levels:

- low
- normal
- elevated
- high

### `PermissionBadge`

Shows:

- safe
- approval required
- blocked unless enabled

## 10. Validation Components

### `ValidationStatusBadge`

Statuses:

- pending
- pass
- pass_with_notes
- needs_revision
- blocked

### `ValidationReportCard`

Shows:

- status
- passed checks
- warnings
- blockers
- required fixes
- recommendation

## 11. Settings Components

### `StorageSettings`

Fields:

- root path
- SQLite path
- Obsidian vault path
- Chroma path
- outputs path
- backups path
- external SSD status

### `ModelSettings`

Fields:

- model list
- enabled status
- model class
- local/cloud
- test button
- privacy notes

### `IntegrationSettings`

Sections:

- Notion
- Browser Tools
- External Models
- Obsidian
- Raven Reviews sealed state

## 12. Empty State Copy

### No Projects

```text
No Project Spaces yet. Create one to give CereBro a place to organize tasks, sources, memory, and outputs.
```

### No Tasks

```text
No tasks here yet. Ask Aang for help or create a task manually.
```

### No Sources

```text
No sources saved yet. Add a URL, file, note, or GitHub repo to give CereBro something grounded to work from.
```

### No Outputs

```text
No outputs saved yet. Guides, checklists, build plans, and research reports will appear here.
```

## 13. Error State Copy

### Validation Blocked

```text
Oak blocked this output. Review the issues before saving or using it.
```

### Permission Required

```text
This action needs approval before CereBro can continue.
```

### Storage Missing

```text
The configured storage path is unavailable. File writes and cleanup jobs are paused.
```

### Notion Disabled

```text
Notion is not enabled. This output is still saved locally.
```

## 14. UI Done Means

UI component foundation is complete when:

- Core shell renders
- Left rail navigation works
- Command bar works
- Right panel shows task/agent context
- Projects, tasks, sources, outputs have cards/detail views
- Approval prompts are implemented
- Validation states are visible
- Empty and error states are implemented
- Settings has storage/model/integration sections
