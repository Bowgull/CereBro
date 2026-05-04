# CereBro V1 — Acceptance Criteria

## 1. Purpose

This file defines when CereBro V1 is actually done.

Not “cool demo done.”

Not “UI loads once done.”

V1 is done when the core local-first operating system loop works.

## 2. V1 Must Do These Things

### 2.1 App Launch

- App launches locally.
- App opens in browser.
- First-run onboarding appears if not configured.
- Existing setup opens Home screen.
- Settings persist.

### 2.2 Local Storage

- CereBro root path exists.
- SQLite database exists.
- Output folder exists.
- Logs folder exists.
- Skills folder exists.
- Design systems folder exists.
- Obsidian vault path exists or is marked skipped.
- App does not require external SSD to start.
- App handles missing external SSD safely.

### 2.3 Project Spaces

- User can create Project Space.
- User can open Project Space.
- User can edit Project Space summary.
- Project persists after restart.
- Project dashboard shows tasks, sources, outputs, decisions, next actions.

### 2.4 Tasks

- User can create task.
- Task has mode.
- Task has status.
- Task links to project.
- Task can start session.
- Task timeline records events.
- Task persists after restart.
- Task can be completed or archived.

### 2.5 Sessions

- Session starts for active work.
- Session links to task/project.
- Session tracks active mode.
- Session tracks active agent.
- Session can pause/resume.
- Session summary can be saved.

### 2.6 Harness Runtime

- User request can become task.
- Harness can recommend mode.
- Harness can create context pack.
- Harness can route to owner agent.
- Harness enforces tool permissions.
- Harness logs important events.

### 2.7 Agent Registry

- All core agents exist:
  - Aang
  - Cortana
  - Batman
  - Tony Stark
  - Gojo
  - Silver Surfer
  - C-3PO
  - Professor Oak
  - Piccolo
  - Spock
- Each agent has role.
- Each agent has allowed modes.
- Each agent has personality cap.
- Disabled/sealed states work.
- No new agents are created without explicit user decision.

### 2.8 Skill File System

- Skills folder exists.
- Priority skill files exist.
- Skill metadata loads.
- Skills link to owner agents.
- Active skills appear in task context.
- Skill files are editable Markdown.
- App does not rely only on giant hidden prompts.

### 2.9 Source Library

- User can add URL/manual source.
- Source links to project/task.
- Source stores metadata.
- Source can be summarized.
- Source appears in Source Library.
- Source can be used in context pack.
- Source provenance is preserved.

### 2.10 Output Library

- User can save output.
- Output links to project/task.
- Output has type.
- Output has validation status.
- Output can be opened later.
- Output persists after restart.
- Output can be exported locally.

### 2.11 Memory Proposal System

- Agent/system can propose memory.
- Memory proposal links to project/task.
- Proposal has destination.
- Proposal has sensitivity.
- Oak can review proposal.
- User can approve/reject when required.
- Approved memory can write to appropriate layer.

### 2.12 Obsidian Integration

- Obsidian vault path can be configured.
- Project notes can be written.
- Decision notes can be written.
- Build logs can be written.
- Source summaries can be written.
- Frontmatter is included.
- SQLite stores Obsidian path.
- Failed writes are recoverable.

### 2.13 Chroma Integration

- Chroma path can be configured.
- Memory can be embedded.
- Metadata is stored.
- Query by project works.
- Chroma is not the main database.

### 2.14 Notion Bridge

Minimum V1 acceptable:

- Notion can remain disabled.
- Output Library works without Notion.
- If enabled, Notion export asks approval.
- Failed Notion export preserves local output.

### 2.15 Oak Validation

- Oak validation report can be created.
- Status can be pass, pass with notes, needs revision, blocked.
- Blocked output cannot be treated as final.
- Validation reports persist.
- Important outputs require validation.

### 2.16 Tony Build Flow

- Build task type exists.
- Tony can generate build plan.
- Tony can generate Claude Code handoff.
- Handoff includes do-not-break rules.
- Handoff includes acceptance criteria.
- Handoff includes test plan.
- Oak validates handoff.

### 2.17 Gojo Creative Flow

- Gojo can generate UI spec.
- Design system file exists.
- Anti-slop review can run.
- UI spec can save as artifact.
- Gojo does not override architecture.

### 2.18 Silver Surfer Browser/Research

Minimum V1 acceptable:

- Source ingestion works.
- Research report can be created from sources.
- Browser tools can remain disabled.
- If browser enabled, sessions are logged.
- Private browser sessions require approval.

### 2.19 Piccolo Automation

- Workflow registry exists.
- Safe cleanup scan works.
- Backup check stub works.
- Cleanup does not delete important files silently.
- Workflow run logs persist.

### 2.20 Spock Sanity Checks

- Spock can produce logic assessment.
- Spock can flag bloat.
- Spock can flag contradictions.
- Spock does not replace Oak.

### 2.21 Model Router

- Model registry exists.
- Model classes exist.
- Local-only mode exists.
- External escalation requires approval.
- Model failures produce structured error.
- Agent requests model class, not hardcoded model.

### 2.22 Permissions

- Safe actions run.
- Approval-required actions wait.
- Blocked actions are blocked.
- Approval events are logged.
- Rejected actions do not execute.

### 2.23 Error Handling

- Error categories exist.
- Errors appear in UI.
- Failed tool calls create error records.
- Failed writes do not lose content.
- Recovery path is shown.

### 2.24 Testing

- Unit tests run.
- Integration tests run.
- E2E tests run or manual fallback is documented.
- Test database is separate.
- Core flows are tested.

## 3. V1 Must Not Do These Things

V1 must not:

- Require Notion
- Require external SSD
- Require external models
- Require browser automation
- Require Raven Reviews
- Require Declyne
- Run destructive cleanup silently
- Use always-on browsing
- Write private context externally without approval
- Save unvalidated hallucinations as memory
- Let agents bypass harness
- Let output bypass Oak when important
- Turn every feature into a new agent

## 4. Final V1 Acceptance Checklist

V1 is accepted when all are true:

- First-run onboarding works.
- Project Spaces work.
- Tasks and sessions persist.
- Harness routes tasks.
- Agents registry works.
- Skills load.
- Source Library works.
- Output Library works.
- Memory proposals work.
- Oak validation works.
- Obsidian writes work.
- Chroma search works or is safely stubbed with clear next step.
- Notion is optional and safe.
- Tony build handoff works.
- Gojo UI spec works.
- Piccolo cleanup scan works.
- Model Router works.
- Permission system works.
- Error handling works.
- Tests pass.
- Documentation exists.
- Changelog exists.
- Raven remains sealed/disabled unless explicitly enabled.
- Declyne remains removed from V1.
