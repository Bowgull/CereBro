# CereBro V1 — MCP and Tool Registry Specification

## 1. Purpose

CereBro needs a controlled tool system.

Tools must not become uncontrolled agent powers.

The Tool Registry defines what actions exist, who can request them, what approval is required, and how they are logged.

MCP compatibility is useful later but should not be required before the core system works.

## 2. Core Decision

V1 builds a local Tool Registry first.

MCP support is designed for compatibility but not required as a dependency on day one.

## 3. Tool Registry Fields

Each tool must be registered as:

```json
{
  "id": "",
  "name": "",
  "description": "",
  "category": "",
  "adapter": "",
  "status": "enabled",
  "permission_class": "safe",
  "allowed_agents": [],
  "allowed_modes": [],
  "requires_approval": false,
  "logs_required": true,
  "input_schema": {},
  "output_schema": {},
  "risk_notes": "",
  "created_at": "",
  "updated_at": ""
}
```

## 4. Tool Categories

### Local Data Tools

- project.read
- project.create
- project.update
- task.read
- task.create
- task.update
- session.read
- session.create
- session.update

### File Tools

- file.read
- file.write
- file.move
- file.copy
- file.delete
- file.archive
- file.exists

### Memory Tools

- memory.search
- memory.propose
- memory.validate
- memory.write_chroma
- memory.write_obsidian

### Output Tools

- artifact.create
- artifact.update
- artifact.export_markdown
- artifact.export_pdf
- artifact.export_notion

### Browser Tools

- browser.open
- browser.extract
- browser.screenshot
- browser.close
- browser.session.create
- browser.session.end

### Build Tools

- build.generate_handoff
- build.create_plan
- build.create_test_plan
- build.write_changelog

### Automation Tools

- workflow.create
- workflow.run
- workflow.pause
- workflow.log
- cleanup.scan
- backup.check

### Model Tools

- model.route
- model.call_local
- model.call_external
- model.test
- embedding.create

## 5. Permission Classes

### Safe

Can run without approval:

- read project metadata
- read task metadata
- create draft response
- search local memory
- create draft artifact
- scan safe temp directory

### Approval Required

Needs user approval:

- write file
- move file
- delete file
- update Notion
- update Obsidian
- call external model with private context
- run browser automation
- install packages
- run terminal commands
- enable recurring workflows

### Blocked Unless Enabled

Blocked by default:

- destructive cleanup
- private browser sessions
- sealed module access
- external account automation
- auto-posting
- unreviewed scripts
- background browsing

## 6. Tool Request Flow

```text
Agent requests tool
  ↓
Cortana/harness checks permission
  ↓
If safe: run and log
  ↓
If approval required: ask user
  ↓
If approved: run and log
  ↓
If rejected: mark blocked
  ↓
Oak validates if output is important
```

## 7. MCP Compatibility

### Future MCP Server Role

CereBro may expose tools to Claude Code/Cline as MCP tools later.

Potential MCP tools:

- cerebro.get_project
- cerebro.create_task
- cerebro.get_context_pack
- cerebro.save_artifact
- cerebro.propose_memory
- cerebro.get_blueprint
- cerebro.get_active_task
- cerebro.log_changelog

### Future MCP Client Role

CereBro may consume MCP tools later for:

- file system tools
- browser tools
- GitHub tools
- Notion tools
- local database tools

## 8. MCP Safety Rules

MCP tools must obey the same permission system.

No MCP tool can:

- bypass approvals
- bypass Oak validation
- write private memory into core memory
- access sealed Raven data without unlock
- run destructive actions silently
- send private context externally without approval

## 9. Tool Logging

Every tool call logs:

- tool ID
- agent ID
- task ID
- session ID
- input summary
- output summary
- permission class
- approval event ID if applicable
- started timestamp
- ended timestamp
- status
- error ID if failed

## 10. Tool Registry Done Means

Tool Registry is complete when:

- Tools have metadata
- Tools have permission classes
- Agents can only request allowed tools
- Approvals are enforced
- Tool calls are logged
- Failed tools create structured errors
- MCP compatibility is documented
