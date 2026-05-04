# CereBro V1 — Revised Architecture Blueprint

## 0. Executive Decision

CereBro V1 is no longer defined as “a castle UI with themed agents.”

CereBro V1 is now defined as:

> A local-first, task-based AI operating system with a real agent harness, persistent project spaces, structured memory, reusable skills, controlled tools, approval gates, browser intelligence, creative/build workflows, validation, and human-facing outputs.

The agents are the interface and behavior layer. They are not the architecture by themselves.

The architecture is built from:

1. Core Harness Runtime
2. Project Spaces
3. Task + Session System
4. Context Engine
5. Skill File System
6. Agent Layer
7. Tool + Adapter Layer
8. Memory Pipeline
9. Output Layer
10. Browser Intelligence Layer
11. Build Pipeline
12. Creative Pipeline
13. Automation/Cleanup Layer
14. Validation + Approval Gates
15. UI/UX Shell
16. Local/Cloud Model Routing
17. Storage/Backup Strategy
18. Future/Sealed Modules

This revision keeps the original vision but makes it buildable, maintainable, and realistic for a MacBook-first setup.

---

## 1. Core Build Philosophy

### 1.1 Do Not Build a Junk Drawer

CereBro should learn from open-source tools, not become a pile of cloned apps.

Use external projects as:

- Architecture lessons
- Optional adapters
- Skill inspirations
- Workflow patterns
- UI/UX references
- Validation models

Do not rebuild full versions of:

- Cline
- Penpot
- Immich
- Trilium
- Skyvern
- Kestra
- Stirling PDF
- Paper

unless there is a specific future reason.

### 1.2 Agents Are Not the System

Agents are personalities and role-bound operators sitting on top of real subsystems.

Bad architecture:

> User talks to agent → agent guesses → agent calls another agent → chaos.

Good architecture:

> User request → Aang captures intent → Harness creates task → Context Engine builds context pack → Cortana routes → agent performs bounded work → tools run with permissions → Oak validates → user approves → output/memory/task updates occur.

### 1.3 Everything Important Becomes an Object

CereBro should persist structured objects, not just chats.

Core objects:

- Project
- Task
- Session
- Context Pack
- Source
- Artifact
- Skill
- Agent Decision
- Tool Call
- Memory Proposal
- Validation Report
- Approval Event
- Output
- Changelog

This is what separates CereBro from a weaker chat wrapper.

---

## 2. V1 Scope Decision

### 2.1 V1 Must Include

V1 must include the structural version of:

- Desktop-first CereBro shell
- Castle-inspired agent UI
- Agent roster and routing rules
- Core Harness Runtime
- Task and session persistence
- Project Spaces
- Source Library
- Context Engine
- Skill File System
- Memory Pipeline
- Obsidian local knowledge layer
- Chroma/vector semantic memory
- Notion Human Output Layer
- Browser Intelligence Layer
- Tony Build Flow
- Gojo Creative Flow
- Professor Oak validation
- Piccolo cleanup/automation jobs
- Spock logic/sanity checks
- Local model routing via Ollama
- Optional external/cloud model fallback
- Human Approval Gates
- File/output organization
- Logs and changelogs

### 2.2 V1 Should Not Fully Build Yet

V1 should not fully build:

- Full Penpot clone
- Full Immich clone
- Full Trilium clone
- Full Skyvern clone
- Full Kestra/n8n orchestration clone
- Full Stirling PDF clone
- Fully autonomous browser agent
- Fully autonomous coding agent with no approval
- Always-on multi-agent swarm
- Separate Declyne Admin Mode
- Full Raven Reviews feed/generation system unless explicitly restored later

### 2.3 V1 Should Be Built So Future Modules Can Plug In

Even parked systems should have placeholder architecture if they affect foundations.

V1 should support future:

- Advanced creative generation
- More browser adapters
- More automation engines
- External cloud model routing
- Private sealed modules
- Dedicated media vault
- Advanced project analytics
- Multi-device sync

But V1 should not depend on these being complete.

---

## 3. Revised System Map

```text
User
  ↓
Aang — Main Interface / Intent Guide
  ↓
Core Harness Runtime
  ↓
Task Object + Session Object
  ↓
Context Engine
  ↓
Cortana — Router / Orchestrator
  ↓
Selected Agent(s), max 1–2 active by default
  ↓
Tool + Adapter Layer
  ↓
C-3PO Output Formatting
  ↓
Professor Oak Validation
  ↓
User Approval Gate
  ↓
Memory Writer / Output Writer / Task Updater
```

Hard rule:

> No agent bypasses the harness. No important output bypasses Oak. No memory write happens without the Memory Pipeline. No tool does risky work without permissions.

---

## 4. Core Harness Runtime

### 4.1 Purpose

The Harness Runtime is the brainstem of CereBro.

It manages:

- Incoming requests
- Intent classification
- Task creation
- Mode selection
- Context assembly
- Agent routing
- Tool permissions
- Execution logs
- Approval gates
- Validation flow
- Memory proposals
- Output creation
- Changelog updates

The harness prevents CereBro from becoming a loose chat between fictional agents.

### 4.2 Harness Responsibilities

For every user request, the harness should answer:

1. Is this a quick answer, an exploration, or a build task?
2. Does this belong to an existing project?
3. Is there relevant memory?
4. Are there files, sources, links, or notes needed?
5. Which agent should own the work?
6. Which tools are allowed?
7. What should be logged?
8. Does the output require validation?
9. Should this become a saved artifact, task, or memory?
10. Does the user need to approve anything before execution?

### 4.3 Request Modes

CereBro V1 should support three primary modes.

#### Quick Mode

For fast answers, summaries, small rewrites, simple planning, and low-risk actions.

Default flow:

```text
Aang → C-3PO → Oak light check → User
```

#### Explore Mode

For research, learning, browsing, comparisons, source analysis, and idea development.

Default flow:

```text
Aang → Cortana → Silver Surfer/Batman → C-3PO → Oak → User
```

#### Build Mode

For app building, system design, coding, debugging, architecture, specs, and Claude Code handoff.

Default flow:

```text
Aang → Cortana → Tony + Spock/Batman → C-3PO → Oak → User approval → Build handoff
```

### 4.4 Task Object

Every meaningful request becomes a task object.

Example schema:

```json
{
  "task_id": "task_2026_0001",
  "title": "Build Recipe Vault Gallery UI",
  "project_id": "recipe_vault",
  "mode": "build",
  "status": "planning",
  "owner_agent": "tony",
  "support_agents": ["gojo", "oak"],
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "user_goal": "Create a mobile-friendly recipe gallery",
  "success_criteria": [],
  "constraints": [],
  "context_pack_id": "ctx_0001",
  "tools_allowed": [],
  "outputs": [],
  "memory_proposals": [],
  "validation_reports": [],
  "approval_events": [],
  "changelog": []
}
```

### 4.5 Session Object

Sessions track active work without relying on chat history alone.

A session should include:

- Active project
- Active task
- Recent decisions
- Open questions
- Current mode
- Active agent
- Tool permissions
- Last output
- Next action

This lets CereBro resume work later without losing the thread.

---

## 5. Project Spaces

### 5.1 Purpose

Project Spaces are containers for everything related to a goal.

A Project Space may include:

- Source files
- Links
- Notes
- Tasks
- Sessions
- Generated outputs
- Decisions
- Changelogs
- Build plans
- Design references
- Memory entries
- Notion pages
- Obsidian notes
- Browser findings
- Validation reports

This is the NotebookLM-style lesson applied to CereBro.

### 5.2 Example Project Spaces

- CereBro OS
- Recipe Vault
- Sygnalist
- PMT Notes
- Learning AI/Coding
- Gaming Guides
- Content Ideas
- Personal Research

### 5.3 Project Space Schema

```json
{
  "project_id": "cerebro_os",
  "name": "CereBro OS",
  "description": "Local-first AI operating system build",
  "status": "active",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "sources": [],
  "tasks": [],
  "sessions": [],
  "outputs": [],
  "memory_refs": [],
  "notion_refs": [],
  "obsidian_refs": [],
  "design_system_refs": [],
  "skills_enabled": []
}
```

---

## 6. Context Engine

### 6.1 Purpose

The Context Engine builds clean context packs before agents act.

It prevents agents from relying on vague memory, stale assumptions, or the wrong project context.

### 6.2 Context Pack Inputs

A context pack can pull from:

- Current user request
- Active session
- Project Space
- Recent task history
- Relevant memory from Chroma
- Human-readable notes from Obsidian
- Notion outputs
- Source Library entries
- Browser findings
- Files
- Prior decisions
- Agent-specific skill files

### 6.3 Context Pack Output

A context pack should be structured like:

```json
{
  "context_pack_id": "ctx_0001",
  "task_id": "task_0001",
  "project_id": "cerebro_os",
  "user_goal": "Revise CereBro architecture",
  "known_decisions": [],
  "constraints": [],
  "relevant_sources": [],
  "relevant_memory": [],
  "open_questions": [],
  "recommended_mode": "build",
  "recommended_agents": ["batman", "tony", "spock", "oak"],
  "risks": [],
  "success_criteria": []
}
```

### 6.4 Context Rules

- Do not overload every agent with every memory.
- Provide only relevant project context.
- Include source provenance when available.
- Flag stale or uncertain context.
- Separate user preference from project facts.
- Separate private/sealed module memory from core memory.

---

## 7. Skill File System

### 7.1 Purpose

Skill files are reusable instruction modules.

They allow CereBro to teach agents how to perform specific workflows without hardcoding everything into agent prompts.

This is one of the most important architecture upgrades.

### 7.2 Folder Structure

```text
/cerebro
  /skills
    tony-build-flow.skill.md
    claude-code-handoff.skill.md
    frontend-design.skill.md
    anti-slop-review.skill.md
    browser-research.skill.md
    web-scraping.skill.md
    notion-output.skill.md
    obsidian-memory-write.skill.md
    remotion-video.skill.md
    video-editing.skill.md
    pdf-workflow.skill.md
    cleanup-backup.skill.md
    source-ingestion.skill.md
    task-planning.skill.md
    validation.skill.md
    ui-motion.skill.md
```

### 7.3 Skill File Format

Each skill file should include:

```md
# Skill Name

## Purpose

## When To Use

## Inputs Required

## Steps

## Output Format

## Validation Checklist

## Failure Modes

## Human Approval Required When

## Examples
```

### 7.4 Skill Rules

- Skills are not agents.
- Skills can be used by multiple agents.
- Skills should be small and specific.
- Skills should include success criteria.
- Skills should include anti-failure checks.
- Skills should be versioned.
- Skills should be editable by the user.

### 7.5 Priority V1 Skills

Must-have skills:

1. `tony-build-flow.skill.md`
2. `claude-code-handoff.skill.md`
3. `browser-research.skill.md`
4. `source-ingestion.skill.md`
5. `notion-output.skill.md`
6. `obsidian-memory-write.skill.md`
7. `anti-slop-review.skill.md`
8. `frontend-design.skill.md`
9. `cleanup-backup.skill.md`
10. `validation.skill.md`

Nice-to-have V1 skills:

1. `remotion-video.skill.md`
2. `pdf-workflow.skill.md`
3. `ui-motion.skill.md`
4. `video-editing.skill.md`
5. `web-scraping.skill.md`

---

## 8. Revised Agent Layer

### 8.1 Agent Principles

Each agent needs:

- One clear system responsibility
- Defined inputs
- Defined outputs
- Tool permissions
- Personality cap
- Escalation rules
- Validation requirements
- No unbounded autonomy

Personality should add flavor, not chaos.

Default character influence: 10–20%.

Professional structure comes first.

### 8.2 Agent Roster

#### Aang — Main Interface / Guide / Teacher

Primary role:

- User-facing guide
- Intent capture
- Clarifying questions when useful
- Learning mode
- Friendly explanations
- Converts vague ideas into structured requests

Owns:

- User interaction
- Teaching breakdowns
- Beginner-friendly explanations
- User approval prompts
- Personal preference capture

Does not own:

- Final routing authority
- Code building
- Tool execution
- Memory writing

Default output style:

- Clear
- Encouraging
- Step-by-step when needed
- Plain English

#### Cortana — Orchestrator / Router / System Authority

Primary role:

- Routes tasks
- Chooses mode
- Assigns agents
- Controls tool permissions
- Enforces system rules

Owns:

- Task mode selection
- Agent routing
- Execution boundaries
- Permission checks
- Entry/exit of sealed modules

Does not own:

- Creative direction
- Code implementation
- Final validation
- Casual user conversation unless needed

Hard rule:

> No agent executes meaningful work unless Cortana or the harness permits it.

#### Batman — Strategy / Reasoning / Risk Thinking

Primary role:

- Deep reasoning
- Tradeoff analysis
- Risk review
- Architecture decisions
- “Are we being stupid?” checks

Owns:

- Strategic options
- Pros/cons
- Failure modes
- Long-term implications
- Build versus buy reasoning

Does not own:

- Final validation
- Code execution
- UI polish

Use when:

- Important decisions
- Architecture tradeoffs
- Tool choices
- Scope control
- Risky changes

#### Tony Stark — Build Flow / Development Planning / Code Handoff

Primary role:

- Converts ideas into buildable technical plans
- Prepares Claude Code handoffs
- Defines data models, file structure, tasks, tests, and implementation sequence

Owns:

- Build specs
- Technical architecture
- Claude Code prompts
- Implementation checklists
- Debug plans
- Changelogs
- Test plans

Does not own:

- Unapproved direct code changes
- Final validation
- Product taste by himself

Tony V1 flow:

```text
Idea → Requirements → Screen Map → Data Model → Tech Plan → Risks → Build Tasks → Claude Code Handoff → Test Plan → Oak Review
```

#### Gojo — Creative Studio / UI / UX / Media / Motion

Primary role:

- Creative direction
- UI/UX design
- Motion design
- Visual polish
- Content design
- Remotion/video planning

Owns:

- Interface concepts
- Design systems
- Style passes
- Anti-generic creative improvements
- Motion/animation direction
- Video/content layouts
- Visual output quality

Does not own:

- Core architecture
- Task routing
- Memory writing
- Final validation

Gojo’s upgraded V1 stack:

- Design system library
- UI component quality
- Motion rules
- Remotion video planning
- Content Engine support
- Creative Extra Pass

#### Silver Surfer — Browser Intelligence / Research / External Discovery

Primary role:

- Web research
- Browser-assisted discovery
- Source capture
- Link analysis
- External intelligence

Owns:

- Search workflows
- Browser investigation
- Source ingestion
- Web summaries
- Research provenance
- Comparison tables

Does not own:

- Always-on autonomous browsing
- Private sealed browsing unless explicitly permitted
- Final validation

Silver Surfer V1 browser stack:

- Browser Use / Stagehand-style browser actions
- Crawl4AI-style source ingestion
- Optional Scrapling-style extraction for harder pages
- Manual/approved browser sessions only

#### C-3PO — Formatter / Translator / Human Output Layer

Primary role:

- Turns agent work into polished, readable output
- Formats docs, guides, notes, checklists, and Notion-ready pages

Owns:

- Final formatting before validation
- Meeting notes
- Guides
- Lists
- Structured documents
- HubSpot/CRM-style notes
- Notion output formatting
- PDF/document formatting support

Does not own:

- Strategic decisions
- Routing
- Memory decisions

#### Professor Oak — Validator / Hallucination Check / Blueprint Consistency

Primary role:

- Final quality gate
- Validates outputs before user sees or before memory/write actions

Owns:

- Hallucination checks
- Source/provenance checks
- Blueprint consistency
- Anti-slop checks
- Safety/legal/privacy checks
- Build handoff review
- Memory duplication review

Does not own:

- Writing memory directly
- Routing tasks
- User-facing teaching by default

Hard rule:

> Important output does not bypass Oak.

#### Piccolo — Automation / Background Worker / Cleanup

Primary role:

- Executes approved background jobs and system maintenance

Owns:

- Scheduled cleanup
- File organization
- Log pruning
- Backup checks
- Sync jobs
- Export jobs
- Recurring maintenance
- Notification delivery support

Does not own:

- Core reasoning
- Agent routing
- Memory decisions
- Unapproved destructive actions

Piccolo should follow n8n/Kestra-style workflow patterns without requiring n8n/Kestra on day one.

#### Spock — Logic / Consistency / Bloat Detector

Primary role:

- Checks whether the system plan makes sense before build or execution

Owns:

- Contradiction detection
- Workflow sanity checks
- Scope creep detection
- Simplification recommendations
- Systems consistency
- “Does this need to be automated?” judgment

Does not own:

- Final validation
- User-facing formatting
- Build execution

Spock checks logic before or during planning.

Oak validates final outputs.

---

## 9. Tool + Adapter Layer

### 9.1 Principle

CereBro should use adapters, not hard dependencies, wherever possible.

A tool adapter wraps an external library/service/tool behind CereBro’s permissions, logs, and approval gates.

### 9.2 V1 Adapter Categories

#### Browser Adapters

Potential inspirations:

- Browser Use
- Stagehand
- Crawl4AI
- Scrapling
- Skyvern later

V1 functions:

- Open page
- Extract source content
- Summarize page
- Capture screenshots if needed
- Compare sources
- Save source to Project Space
- Create research note

#### Build Adapters

Potential inspirations:

- Cline
- Claude Code best practices
- Superpowers
- GSD

V1 functions:

- Generate Claude Code prompt
- Generate implementation checklist
- Generate test checklist
- Read build logs
- Create changelog
- Prepare rollback notes

#### Design/Creative Adapters

Potential inspirations:

- Paper
- Penpot
- GSAP Skills
- Lenis
- video-use

V1 functions:

- Create design system notes
- Generate UI spec
- Generate motion spec
- Generate Remotion plan
- Review UI for slop
- Generate creative variations

#### Document Adapters

Potential inspirations:

- Stirling PDF

V1 functions:

- PDF merge/split/compress/redact/convert through external service if installed
- Create PDF workflow instructions
- Extract text when appropriate
- Generate polished document outputs

#### Data Adapters

Potential inspirations:

- Polars

V1 functions:

- Analyze CSV/JSON logs
- Summarize task history
- Query local structured data
- Build usage reports
- Find stale files/tasks

#### Automation Adapters

Potential inspirations:

- Kestra
- n8n

V1 functions:

- Scheduled cleanup
- Backup checks
- Sync jobs
- Export jobs
- Recurring research pulls with approval
- Notification routing

---

## 10. Memory Pipeline

### 10.1 Core Decision

Agents do not directly write memory.

Agents propose memory.

The Memory Pipeline decides what becomes memory.

### 10.2 Memory Layers

#### Short-Term Runtime State

Stores:

- Current session
- Active task
- Active project
- Last decisions
- Temporary tool outputs

Used for:

- Current work continuity

#### Chroma / Vector DB

Stores:

- Semantic memory
- Searchable embeddings
- Project context
- Source summaries
- Past decisions
- Relevant user preferences

Used for:

- Retrieval
- Similarity search
- Context pack assembly

#### Obsidian Vault

Stores:

- Human-readable notes
- Project docs
- Decisions
- Guides
- Architecture notes
- Build logs
- Changelogs

Used for:

- Long-term local knowledge
- User-readable second brain

#### Notion Output Layer

Stores:

- Polished guides
- Lists
- Checklists
- Recipes
- Learning materials
- Project dashboards
- User-facing documents

Used for:

- Clean human output
- Organization
- Reusable guides

### 10.3 Memory Flow

```text
Agent completes task
  ↓
Memory Proposal created
  ↓
Oak checks accuracy/deduplication/privacy
  ↓
Aang asks user approval if needed
  ↓
Memory Writer writes to Chroma/Obsidian/Notion as appropriate
  ↓
Task/session updated
```

### 10.4 Memory Proposal Schema

```json
{
  "proposal_id": "memprop_0001",
  "task_id": "task_0001",
  "project_id": "cerebro_os",
  "proposed_by": "tony",
  "memory_type": "architecture_decision",
  "content": "CereBro V1 should use skill files as first-class architecture.",
  "destination": ["chroma", "obsidian"],
  "sensitivity": "normal",
  "requires_user_approval": true,
  "dedupe_candidates": [],
  "oak_status": "pending"
}
```

### 10.5 Memory Rules

- Do not save random noise.
- Do not save temporary confusion as fact.
- Do not mix private/sealed module memory with core memory.
- Do not write to Notion unless the output is user-facing and polished.
- Do not write to Obsidian unless it is meaningful long-term knowledge.
- Do not write to Chroma without metadata and provenance.

---

## 11. Source Library

### 11.1 Purpose

The Source Library stores input material CereBro can reason from.

Source types:

- URLs
- PDFs
- YouTube/video links
- Notes
- Docs
- Code files
- GitHub repos
- Screenshots
- Images
- Browser captures
- Manual user notes

### 11.2 Source Schema

```json
{
  "source_id": "src_0001",
  "project_id": "cerebro_os",
  "type": "github_repo",
  "title": "Cline",
  "url": "https://github.com/cline/cline",
  "added_at": "timestamp",
  "added_by": "user",
  "summary": "IDE agent with tool use, browser, MCP, checkpoints.",
  "trust_level": "high",
  "provenance": {},
  "tags": ["agent", "coding", "mcp", "tool-use"],
  "related_tasks": []
}
```

### 11.3 Source Rules

- Every research result should preserve where it came from.
- Silver Surfer should not just summarize; he should save useful source metadata.
- Source Library should feed Context Engine.
- Sources can become Notion/Obsidian outputs only after formatting and validation.

---

## 12. Human Output Layer

### 12.1 Purpose

The Human Output Layer turns CereBro thinking into useful artifacts for the user.

Outputs include:

- Guides
- Checklists
- Plans
- Meeting notes
- Recipes
- Gaming builds
- Research summaries
- Project dashboards
- Build docs
- Learning materials
- Content calendars
- Design specs

### 12.2 Notion Role

Notion is the polished user-facing workspace.

Use Notion for:

- Guides
- Checklists
- Lists
- Dashboards
- Project pages
- Learning plans
- Recipe/grocery lists
- Watchlists
- Human-friendly output

### 12.3 Obsidian Role

Obsidian is the local human-readable knowledge vault.

Use Obsidian for:

- Project architecture notes
- Decisions
- System docs
- Long-term logs
- Build notes
- Local knowledge
- Raw-ish but clean notes

### 12.4 Output Flow

```text
Agent work
  ↓
C-3PO formats output
  ↓
Oak validates
  ↓
User approves save/export if needed
  ↓
Notion Bridge / Obsidian Writer / File Writer
```

### 12.5 Notion Bridge

The Notion Bridge is not an agent.

It is a logic layer that handles:

- Page creation
- Page updates
- Template selection
- Style profile application
- Database updates
- Checklist creation
- Link embedding
- Video embedding metadata
- Backlinks to Project Space

Controlled agents allowed to interact with Notion Bridge:

- Aang
- C-3PO
- Piccolo

Other agents can propose outputs, but they do not write directly.

---

## 13. Browser Intelligence Layer

### 13.1 Purpose

Silver Surfer uses browser tools to bring external intelligence into CereBro.

This layer must be powerful but controlled.

### 13.2 V1 Browser Capabilities

- Search the web
- Open user-provided links
- Extract page content
- Compare multiple sources
- Save findings to Source Library
- Summarize pages
- Generate research reports
- Capture screenshots when needed
- Use browser automation for app testing when explicitly approved

### 13.3 Browser Rules

- Not always-on by default.
- No uncontrolled background browsing.
- User approval required for sensitive sessions.
- Log all browser sessions.
- Save source provenance.
- Use lightweight extraction first.
- Use heavier automation only when needed.

### 13.4 Suggested V1 Stack

Start simple:

- Playwright or equivalent browser layer
- Crawl4AI-style extraction
- Browser Use or Stagehand-style task automation

Park:

- Skyvern-style full workflow automation
- Heavy autonomous browser workflows
- Anti-bot scraping systems unless legal and necessary

---

## 14. Tony Build Flow

### 14.1 Purpose

Tony converts user ideas into buildable, testable plans for Claude Code or local coding agents.

Tony is not allowed to YOLO-build without structure.

### 14.2 Tony Build Flow

```text
1. Capture user idea
2. Define user goal
3. Extract requirements
4. Define non-goals
5. Define constraints
6. Create screen map if UI exists
7. Create data model
8. Create system architecture
9. Identify risks
10. Ask Spock for sanity check if needed
11. Create implementation phases
12. Create test plan
13. Create Claude Code handoff prompt
14. Oak validates handoff
15. User approves execution
16. Build happens
17. Results are reviewed
18. Changelog written
```

### 14.3 Claude Code Handoff Format

Every handoff should include:

- Project summary
- Current objective
- Existing architecture assumptions
- Files likely involved
- Exact constraints
- Implementation tasks
- Testing requirements
- Do-not-break rules
- Acceptance criteria
- Output expected
- Rollback plan if risky

### 14.4 Tony Must Protect Existing Working Systems

For projects like Sygnalist, Tony must follow:

- Do not destabilize working admin profile switching
- Preserve source-of-truth blueprint
- Avoid unrelated refactors
- Make surgical changes
- Validate before claiming done

---

## 15. Gojo Creative Flow

### 15.1 Purpose

Gojo owns creative execution, UI/UX quality, visual identity, motion, content design, and media planning.

### 15.2 Gojo Flow

```text
1. Understand goal
2. Identify output type
3. Pull design system or style profile
4. Create design direction
5. Generate layout/content structure
6. Add one memorable creative choice
7. Check hierarchy, spacing, typography, motion
8. Run anti-slop pass
9. Prepare output for C-3PO/Oak
```

### 15.3 Gojo Responsibilities

- Product UI design
- Brand/creative design
- Motion/animation suggestions
- Remotion video planning
- Content layout
- Visual report design
- Design system consistency
- Creative Extra Pass

### 15.4 Design System Library

Folder:

```text
/design-systems
  cerebro-castle-ui.md
  recipe-vault-ui.md
  sygnalist-ui.md
  raven-reviews-ui.md
  pm-notes-output-style.md
```

Each design system should include:

- Color palette
- Typography guidance
- Layout rules
- Component style
- Motion rules
- Tone/microcopy
- Anti-slop warnings
- Example screens

### 15.5 Anti-Slop Review

Oak and Gojo should check for:

- Generic AI dashboard look
- Too many cards inside cards
- Lazy gradients
- Random glassmorphism
- Poor spacing
- Weak hierarchy
- Unclear CTAs
- Inconsistent icon use
- Motion with no purpose
- Empty states ignored
- Mobile/desktop mismatch
- No memorable visual identity

---

## 16. Piccolo Automation + Cleanup Layer

### 16.1 Purpose

Piccolo keeps CereBro’s environment clean and executes approved repeatable work.

### 16.2 Piccolo Jobs

V1 jobs:

- Clean temp files
- Organize generated outputs
- Prune logs
- Check backup status
- Sync Notion exports
- Sync Obsidian notes
- Archive old task artifacts
- Generate weekly project summaries
- Move completed outputs into project folders
- Notify user of failed jobs

### 16.3 Automation Rules

- No destructive cleanup without approval or safe rules.
- Backups must be checked before deletion.
- Every job logs what it changed.
- Recurring jobs should be visible in UI.
- User can pause/disable jobs.

### 16.4 Workflow Schema

```json
{
  "workflow_id": "wf_cleanup_weekly",
  "name": "Weekly Cleanup",
  "owner": "piccolo",
  "trigger": "weekly",
  "steps": [],
  "requires_approval": false,
  "safe_mode": true,
  "last_run": null,
  "last_status": null,
  "logs": []
}
```

---

## 17. Professor Oak Validation Layer

### 17.1 Purpose

Oak keeps CereBro trustworthy.

### 17.2 Validation Types

Oak should validate:

- Factual accuracy
- Source quality
- Blueprint consistency
- Memory deduplication
- Privacy boundaries
- Tool safety
- Build handoff quality
- UI/design slop
- Output completeness
- User constraints

### 17.3 Oak Validation Report

```json
{
  "validation_id": "val_0001",
  "task_id": "task_0001",
  "validated_by": "oak",
  "status": "pass_with_notes",
  "checks": {
    "accuracy": "pass",
    "source_quality": "pass",
    "blueprint_consistency": "pass",
    "privacy": "pass",
    "anti_slop": "warning",
    "completeness": "pass"
  },
  "issues": [],
  "recommendations": []
}
```

### 17.4 Oak Severity Levels

- Pass
- Pass with notes
- Needs revision
- Blocked

Blocked means the user should not receive/save/execute the output until revised.

---

## 18. UI/UX Shell

### 18.1 Core Identity

CereBro should feel like a functional AI command center with an RPG/castle skin, not a toy.

The UI should be:

- Desktop-first
- Fast
- Clear
- Dark/cinematic optional
- Agent-status aware
- Task-based
- Project-based
- Not overanimated
- Not SaaS-generic

### 18.2 Main Layout

Recommended V1 layout:

```text
Left Rail:
- Project Spaces
- Inbox
- Tasks
- Outputs
- Sources
- Settings

Center:
- Active task/session
- Conversation/output panel
- Project dashboard

Right Panel:
- Active agent
- Context pack summary
- Task status
- Tool permissions
- Next actions

Bottom / Command Bar:
- Ask Aang...
- Mode selector: Quick / Explore / Build
- Attach source
- Save output
```

### 18.3 Agent Activity View

Show:

- Which agent is active
- What they are doing
- Which tool they are using
- Whether they are waiting for approval
- Whether Oak has validated

Avoid fake agent chatter.

### 18.4 Task Timeline

Every important task should show:

- Created
- Context built
- Agent assigned
- Tools used
- Output generated
- Validation status
- Approval status
- Saved/exported status

### 18.5 Project Dashboard

Each project should show:

- Active tasks
- Recent sessions
- Important decisions
- Sources
- Outputs
- Open questions
- Next actions
- Related Notion/Obsidian links

---

## 19. Model Routing Layer

### 19.1 Principle

CereBro should not assume one model does everything.

It should route by capability, hardware, cost, privacy, and task difficulty.

### 19.2 Local-First Default

Use local/Ollama models for:

- Simple classification
- Summaries
- Formatting
- Lightweight reasoning
- Drafting
- Small code help
- Tagging
- Memory extraction

### 19.3 Strong Model Escalation

Use stronger external/cloud models when:

- Architecture is complex
- Coding requires high reliability
- Local model fails
- Large context is needed
- High-stakes reasoning is needed
- User explicitly approves escalation

### 19.4 Model Router Schema

```json
{
  "request_type": "build_architecture",
  "privacy_level": "normal",
  "complexity": "high",
  "context_size": "large",
  "recommended_model_class": "strong_reasoning",
  "local_candidate": "qwen/deepseek/local",
  "external_candidate": "claude/minimax/cloud",
  "requires_user_approval": true
}
```

### 19.5 Hardware Realism

CereBro should be built to run on the MacBook now, with external SSD support later.

Rules:

- Do not require every heavy model/service on day one.
- Keep V1 modular.
- Allow services to be disabled.
- Run lightweight local models by default.
- Keep heavy media/model assets on external SSD when available.
- Use cloud fallback only with permission.

---

## 20. Storage + Backup Strategy

### 20.1 Storage Decision

CereBro remains local-first.

External SSD is strongly recommended for long-term use, especially for:

- Ollama models
- Chroma/vector database
- Obsidian vault backups
- Generated media
- Remotion renders
- Browser caches
- Logs
- Source archives
- Local backups

But V1 can begin on the MacBook internal drive if built modularly.

### 20.2 Folder Structure

```text
/CereBro
  /apps
  /config
  /data
    /tasks
    /sessions
    /projects
    /sources
    /outputs
    /logs
    /memory
    /chroma
  /obsidian-vault
  /notion-exports
  /skills
  /design-systems
  /adapters
  /models
  /renders
  /backups
```

### 20.3 Backup Rules

- Important data must have a backup path.
- Piccolo checks backups.
- No cleanup job deletes unbacked-up important files.
- Generated outputs should be tied to project/task IDs.
- Logs should be pruned, not ignored.

---

## 21. Security, Privacy, and Permissions

### 21.1 Permission Classes

Tool actions should be classified:

#### Safe

- Read local project metadata
- Format output
- Search local memory
- Summarize existing notes

#### Approval Required

- Write files
- Update Notion
- Update Obsidian
- Run browser automation
- Run terminal commands
- Use external/cloud models
- Delete or move files
- Send notifications
- Modify project settings

#### Blocked Unless Explicitly Enabled

- Destructive cleanup
- Access private/sealed modules
- Persistent background browsing
- External account automation
- Auto-posting content
- Unreviewed code execution

### 21.2 Logs

Every meaningful tool action should log:

- Agent
- Task
- Tool
- Inputs summary
- Outputs summary
- Timestamp
- Approval event if applicable
- Error status

---

## 22. External Project Lessons Incorporated

### 22.1 Cline

Lesson:

- Human-approved tool use, file edits, terminal commands, browser use, checkpoints, and MCP are essential patterns.

CereBro steal:

- Approval-gated build actions
- Checkpoints
- Tool execution logs
- Claude Code handoff discipline

### 22.2 Superpowers / GSD / Claude Code Best Practice

Lesson:

- Spec-driven development beats vague prompting.
- Skills, commands, workflows, worktrees, tests, and review gates reduce chaos.

CereBro steal:

- Tony Build Flow
- Skill File System
- Claude Code handoff standard
- Context-rot prevention

### 22.3 Hermes Agent

Lesson:

- Memory, scheduled tasks, model switching, messaging, and skills need to be system-level capabilities.

CereBro steal:

- Model Router
- Scheduled task architecture
- Memory nudges
- Messaging bridge pattern

### 22.4 Browser Use / Stagehand / Crawl4AI / Scrapling / Skyvern

Lesson:

- Browser intelligence needs layers: simple extraction, browser control, task automation, and heavier workflow automation.

CereBro steal:

- Silver Surfer Browser Stack
- Source ingestion
- Browser session logs
- Manual permissioned automation

### 22.5 Paper / Penpot

Lesson:

- Design and code should stay connected through tokens, components, canvas thinking, and design systems.

CereBro steal:

- Gojo Design System Library
- Design-token thinking
- Creative canvas concept
- UI-to-code feedback loop

### 22.6 GSAP Skills / Lenis

Lesson:

- Motion should be intentional, skilled, and lightweight.

CereBro steal:

- UI motion skill
- Anti-slop animation rules
- Smooth UI polish where appropriate

### 22.7 video-use

Lesson:

- Video editing can be agentic if the agent works from transcript, timeline, screenshots, overlays, render steps, and self-evaluation.

CereBro steal:

- Gojo Remotion/video flow
- Timeline-based video reasoning
- Preview/evaluate loop

### 22.8 Immich

Lesson:

- Media libraries need metadata, tags, albums, search, backup, and source organization.

CereBro steal:

- Output Library pattern
- Future media vault architecture

### 22.9 TriliumNext

Lesson:

- Local personal knowledge systems need hierarchy, links, and long-term structure.

CereBro steal:

- Reinforces Obsidian as human-readable local knowledge layer
- Project Spaces as knowledge containers

### 22.10 Stirling PDF

Lesson:

- Do not manually build every document utility. Use adapters for specialized document operations.

CereBro steal:

- PDF/document adapter pattern

### 22.11 Polars

Lesson:

- Local data/log analysis should be fast and structured.

CereBro steal:

- Use Polars for logs, task analytics, source inventories, and large local data.

### 22.12 Kestra / n8n Pattern

Lesson:

- Recurring automation needs jobs, triggers, retries, logs, and UI visibility.

CereBro steal:

- Piccolo workflow structure
- Automation Bridge pattern

### 22.13 AirLLM / MiniMax / Local Model Lessons

Lesson:

- Model execution needs routing, fallback, and hardware realism.

CereBro steal:

- Model Router
- Local-first default
- External escalation option
- No fantasy assumption that every huge model runs well locally

---

## 23. Revised V1 Build Phases

### Phase 0 — Blueprint Freeze + Repo Setup

Goal:

Create the build foundation.

Tasks:

- Finalize V1 blueprint
- Create repo structure
- Add `/skills`
- Add `/design-systems`
- Add `/docs`
- Add architecture decision records
- Add initial data schemas
- Define environment config
- Define local storage paths

Outputs:

- `MASTER_BLUEPRINT.md`
- `ARCHITECTURE.md`
- `AGENTS.md`
- `SKILLS.md`
- `DATA_MODEL.md`
- `ROADMAP.md`

### Phase 1 — Core Shell + Project Spaces

Goal:

Build the basic desktop app/web app shell.

Tasks:

- Create UI shell
- Create left nav
- Create command bar
- Create Project Spaces view
- Create Tasks view
- Create Outputs view
- Create Sources view
- Create Settings view
- Add local persistence

Outputs:

- Usable shell
- Project creation
- Task creation
- Basic persistence

### Phase 2 — Harness Runtime

Goal:

Create the system brainstem.

Tasks:

- Implement task object
- Implement session object
- Implement mode selection
- Implement context pack generation
- Implement agent routing stub
- Implement tool permission model
- Implement logs
- Implement validation status

Outputs:

- Requests become tasks
- Tasks have mode/status/owner/context
- Basic agent routing works

### Phase 3 — Agent Layer V1

Goal:

Implement agents as structured roles.

Tasks:

- Add agent definitions
- Add personality caps
- Add input/output formats
- Add routing rules
- Add agent status UI
- Add Cortana routing logic
- Add Aang interface behavior
- Add Oak validation stub

Outputs:

- Aang, Cortana, Tony, Gojo, Silver Surfer, C-3PO, Oak, Piccolo, Spock, Batman defined
- Routing is visible and controlled

### Phase 4 — Skill File System

Goal:

Make skills first-class.

Tasks:

- Add skill loader
- Add skill metadata
- Add skill selection rules
- Add priority skill files
- Attach skills to agents
- Show active skills in task context

Outputs:

- Skill files influence agent behavior
- Build/research/output skills available

### Phase 5 — Memory Pipeline

Goal:

Make CereBro remember safely.

Tasks:

- Add Chroma/vector layer
- Add Obsidian write path
- Add memory proposal object
- Add Memory Writer
- Add dedupe checks
- Add Oak memory validation
- Add user approval for important memory writes

Outputs:

- Searchable semantic memory
- Clean Obsidian notes
- Controlled memory writes

### Phase 6 — Source Library + Browser Intelligence

Goal:

Let CereBro ingest and reason from external sources.

Tasks:

- Add Source Library
- Add URL ingestion
- Add web extraction adapter
- Add source summaries
- Add provenance metadata
- Add Silver Surfer research workflow
- Add browser session logs

Outputs:

- User can add links/sources
- Silver Surfer can research and save findings

### Phase 7 — Human Output Layer

Goal:

Turn work into useful guides, lists, docs, and checklists.

Tasks:

- Add Output Library
- Add C-3PO formatting workflows
- Add Notion Bridge stub/integration
- Add templates
- Add style profile system
- Add save/export approval

Outputs:

- Outputs can be saved as useful artifacts
- Notion-ready pages/checklists/guides

### Phase 8 — Tony Build Flow

Goal:

Make CereBro useful for actual development.

Tasks:

- Add build task type
- Add requirements extractor
- Add data model planner
- Add implementation planner
- Add Claude Code handoff generator
- Add test plan generator
- Add build changelog
- Add Oak build review

Outputs:

- Tony can prepare strong Claude Code build prompts
- Build tasks are trackable

### Phase 9 — Gojo Creative Flow

Goal:

Make CereBro visually useful.

Tasks:

- Add design system library
- Add frontend design skill
- Add anti-slop review
- Add UI spec generator
- Add motion spec support
- Add Remotion/video planning stub

Outputs:

- Gojo can guide UI/UX/content/video direction
- Oak/Gojo can flag generic AI slop

### Phase 10 — Piccolo Automation + Cleanup

Goal:

Keep the system clean.

Tasks:

- Add workflow object
- Add scheduled job registry
- Add safe cleanup job
- Add backup check job
- Add log pruning job
- Add export organization job
- Add job status UI

Outputs:

- CereBro can maintain its local environment safely

### Phase 11 — Model Router

Goal:

Use local and external models intelligently.

Tasks:

- Add model registry
- Add model capability tags
- Add routing rules
- Add local-first defaults
- Add external escalation prompt
- Add cost/privacy warnings
- Add fallback behavior

Outputs:

- CereBro routes tasks to appropriate model class
- User controls external escalation

### Phase 12 — Integration Hardening

Goal:

Make V1 stable.

Tasks:

- Add error categories
- Add graceful failure states
- Add retry logic
- Add missing-source warnings
- Add validation blocks
- Add backup warnings
- Add import/export
- Add docs

Outputs:

- V1 is usable as daily-driver foundation

---

## 24. V1 MVP Definition

The minimum V1 worth building must let the user:

1. Open CereBro desktop/web shell.
2. Create/select a Project Space.
3. Ask Aang for help.
4. Have the harness create a task/session.
5. Route work to the right agent.
6. Use skill files to shape the response.
7. Save meaningful outputs.
8. Store project memory safely.
9. Add sources/links.
10. Generate Claude Code handoffs.
11. Generate useful guides/checklists.
12. Validate important outputs with Oak.
13. Track tasks and next actions.
14. Keep files/logs organized through Piccolo.

If V1 does these well, it is successful.

---

## 25. What CereBro Is Not

CereBro V1 is not:

- A fully autonomous AGI
- A replacement for Claude Code
- A replacement for ChatGPT
- A full design platform
- A full photo/video library
- A full browser automation enterprise product
- A fully autonomous content farm
- A random set of agents talking endlessly
- A system that runs huge models magically on weak hardware

CereBro V1 is:

- A structured personal AI operating system
- A memory/task/project shell
- A local-first workflow engine
- A guided build/research/creative assistant
- A second-brain interface
- A system that makes external tools and models more useful

---

## 26. Build Guardrails for Claude Code / Opus

Claude Code/Opus should be allowed to challenge the blueprint.

However, it must follow these rules:

1. Do not remove core harness architecture without explaining why.
2. Do not add new agents unless a clear responsibility gap exists.
3. Prefer skills/adapters/workflows over new agents.
4. Preserve local-first architecture.
5. Preserve Project Spaces.
6. Preserve task/session persistence.
7. Preserve memory pipeline and approval gates.
8. Preserve Oak validation.
9. Preserve Notion/Obsidian/Chroma roles.
10. Preserve controlled browser behavior.
11. Preserve Tony Build Flow.
12. Preserve Gojo Creative Flow.
13. Avoid scope creep.
14. Make surgical changes.
15. Explain better routes before implementing them.
16. Ask questions when the blueprint is underspecified.
17. Always produce changelogs for major changes.

---

## 27. Open Questions Still Worth Deciding

These are the few remaining items that should be answered before or during early build.

### 27.1 App Shell

Question:

Should V1 be built as:

- Next.js local web app
- Electron/Tauri desktop app
- Local web app first, desktop wrapper later

Recommended default:

> Local Next.js web app first, desktop wrapper later if needed.

Reason:

Faster to build, easier for Claude Code, easier to debug, still local-first.

### 27.2 Database

Question:

What stores structured tasks/projects/sessions?

Recommended default:

> SQLite for structured local app data.

Use Chroma only for vector memory, not as the main app database.

### 27.3 Job Runner

Question:

How does Piccolo run scheduled jobs?

Recommended default:

> Simple local scheduler in V1. n8n/Kestra-compatible design later.

### 27.4 Notion Integration Timing

Question:

Should Notion integration be day-one or after local output works?

Recommended default:

> Build Output Library locally first, then Notion Bridge.

### 27.5 Browser Automation Timing

Question:

Should browser automation be day-one?

Recommended default:

> Source ingestion first. Browser automation second. App testing/browser control third.

### 27.6 Raven Reviews Status

Question:

Is Raven Reviews included in V1, sealed/parked, or removed entirely?

Recommended default until user confirms:

> Keep Raven Reviews outside core architecture as a sealed/parked module definition only. Do not build it before core CereBro works. If removed, Gojo retains creative/media powers and no core architecture breaks.

---

## 28. Final Revised Architecture Statement

CereBro V1 should be built as a modular, local-first AI operating system where:

- Aang interfaces with the user.
- The Harness turns requests into structured tasks.
- The Context Engine assembles relevant context.
- Cortana routes work.
- Agents perform bounded responsibilities.
- Skills teach agents specific workflows.
- Tools are accessed through controlled adapters.
- Oak validates important work.
- The Memory Pipeline saves only approved, useful knowledge.
- Notion and Obsidian become human-facing knowledge/output layers.
- Piccolo keeps the system clean.
- Tony turns ideas into buildable plans.
- Gojo prevents creative slop and owns visual/media output.
- Silver Surfer brings in external intelligence safely.
- Spock keeps the system sane.
- The model router keeps hardware limitations realistic.

This revision is stronger than the original plan because it makes CereBro a real operating system around tasks, memory, skills, tools, and validation — not just a themed multi-agent chat UI.

---

# Appendix A — Non-Abbreviation Rule for Future Blueprint Work

For CereBro architecture documents, do not abbreviate important sections to “etc.” or “and so on.”

When revising this blueprint:

- Preserve all existing decisions unless explicitly changed.
- Mark changes clearly.
- Do not replace detailed lists with summaries.
- Do not compress agent roles.
- Do not remove guardrails.
- Do not omit parked modules if they affect future architecture.
- Do not silently change V1 scope.
- If something is uncertain, label it as an open question instead of deleting it.

---

# Appendix B — Immediate Files Claude Code Should Create

When beginning the actual repository build, Claude Code should create:

```text
/MASTER_BLUEPRINT.md
/ARCHITECTURE.md
/AGENTS.md
/SKILLS.md
/DATA_MODEL.md
/ROADMAP.md
/OPEN_QUESTIONS.md
/CHANGELOG.md

/skills/tony-build-flow.skill.md
/skills/claude-code-handoff.skill.md
/skills/browser-research.skill.md
/skills/source-ingestion.skill.md
/skills/notion-output.skill.md
/skills/obsidian-memory-write.skill.md
/skills/anti-slop-review.skill.md
/skills/frontend-design.skill.md
/skills/cleanup-backup.skill.md
/skills/validation.skill.md

/design-systems/cerebro-castle-ui.md
/design-systems/pm-notes-output-style.md

/data/schema/task.schema.json
/data/schema/session.schema.json
/data/schema/project.schema.json
/data/schema/source.schema.json
/data/schema/memory-proposal.schema.json
/data/schema/validation-report.schema.json
/data/schema/workflow.schema.json
```

---

# Appendix C — Golden Rule

CereBro should always prefer:

> structured task + relevant context + bounded agent + correct skill + approved tool + validation + saved output

over:

> chatty agent + vague memory + random tool use + unvalidated answer
