# CereBro V1 — Testing Strategy

## 1. Purpose

CereBro must be tested as a local-first system with persistence, routing, memory, tool permissions, and validation.

Do not rely only on manual testing.

## 2. Test Types

### Unit Tests

Use for:

- schemas
- helpers
- routing functions
- permission checks
- mode selection
- file path utilities
- model routing decisions
- validation status logic

### Integration Tests

Use for:

- SQLite operations
- task lifecycle
- project/task/session linking
- source creation
- artifact creation
- memory proposal flow
- validation reports
- approval events
- tool call logging

### UI Tests

Use for:

- app shell
- project creation
- task creation
- source library
- output library
- approval prompt
- validation report display
- settings screens

### End-to-End Tests

Use for:

- first-run onboarding
- create project → create task → generate output → validate → save artifact
- add source → summarize → save source
- create build task → generate Claude Code handoff → Oak validation
- Piccolo cleanup scan → approval prompt → report

### Manual QA

Use for:

- visual polish
- Gojo anti-slop review
- desktop layout
- external SSD behavior
- Obsidian file inspection
- Notion integration once enabled
- browser behavior once enabled

## 3. Recommended Test Tools

Use:

- Vitest for unit/integration tests
- React Testing Library for component behavior
- Playwright for end-to-end app tests
- SQLite test database
- Mock adapters for Notion, browser, external models, and Chroma

## 4. Required Test Folders

```text
/tests
  /unit
  /integration
  /e2e
  /fixtures
  /mocks
```

## 5. Test Database

Use separate test SQLite path:

```text
~/CereBroTest/data/sqlite/cerebro-test.sqlite
```

Never run tests against the real user database.

## 6. Required Unit Tests

### Routing

Test:

- Quick Mode routes correctly
- Explore Mode routes to Silver Surfer/Batman where appropriate
- Build Mode routes to Tony
- Creative requests route to Gojo
- Automation requests route to Piccolo
- Validation requests route to Oak
- Max active agent rule is enforced

### Permissions

Test:

- safe tool runs without approval
- approval tool blocks until approved
- destructive tool blocks by default
- external model requires approval when private context exists

### Task Status

Test transitions:

- inbox → planning
- planning → waiting_for_context
- planning → ready
- ready → in_progress
- in_progress → validating
- validating → complete
- validating → needs_revision
- any risky failure → blocked

### Model Router

Test:

- simple formatting maps to lightweight_formatter
- complex build maps to strong_coding_external candidate
- local-only mode blocks external candidate
- privacy warning appears

## 7. Required Integration Tests

### Project Task Session Flow

1. Create project
2. Create task
3. Start session
4. Generate context pack
5. Assign owner agent
6. Complete task
7. Verify all relationships

### Source Flow

1. Add source
2. Link to project
3. Summarize source
4. Create source record
5. Save source metadata
6. Verify source appears in project dashboard

### Memory Proposal Flow

1. Create memory proposal
2. Run Oak validation
3. Approve proposal
4. Write to fake Chroma/Obsidian adapter
5. Verify proposal status updated

### Output Flow

1. Create artifact
2. Run Oak validation
3. Approve save
4. Write local output
5. Verify artifact metadata

### Tool Logging Flow

1. Request tool
2. Check permission
3. Log started
4. Run mock tool
5. Log completed
6. Verify tool_call record

## 8. Required End-to-End Tests

### E2E-001 First Run

- App opens
- First-run wizard appears
- User chooses local root
- User disables Notion
- User disables browser tools
- User creates first project
- Dashboard appears

### E2E-002 Project Task Output

- Create project
- Create task
- Assign mode
- Generate draft output
- Oak validates
- Save artifact
- Artifact appears in Output Library

### E2E-003 Build Handoff

- Create build task
- Enter requirements
- Tony generates handoff
- Oak validates
- Handoff saved as artifact

### E2E-004 Memory Approval

- Agent proposes memory
- Oak reviews
- User approves
- Memory status updates
- Obsidian mock write appears

### E2E-005 Piccolo Cleanup Scan

- Create temp files in test root
- Run cleanup scan
- Show proposed actions
- Approve safe cleanup
- Verify only safe files removed

## 9. Manual QA Checklist

### Visual

- Layout fits MacBook screen
- Left rail does not crowd main workspace
- Right panel is readable
- Command bar is obvious
- Agent status is useful
- Validation status is clear
- Empty states are not generic
- UI does not look like basic SaaS template

### Functional

- Data persists after restart
- Project switching works
- Task status updates correctly
- Approval prompts are clear
- Output save works
- Error states are recoverable
- Settings values persist

### Safety

- Notion does not write when disabled
- Browser tools do not run when disabled
- External model does not run without approval
- Destructive cleanup does not run silently
- Raven Reviews remains sealed/disabled

## 10. Test Commands

Recommended scripts:

```json
{
  "test": "vitest",
  "test:unit": "vitest tests/unit",
  "test:integration": "vitest tests/integration",
  "test:e2e": "playwright test",
  "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
}
```

## 11. Definition Of Test Done

Testing system is complete when:

- Unit tests cover routing, permissions, model routing, and task status
- Integration tests cover core persistence flows
- E2E tests cover first-run, project/task/output, memory approval, and cleanup
- Manual QA checklist exists
- CI is optional but test scripts run locally
