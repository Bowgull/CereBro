# CereBro V1 Added Layer: Search, Learning Paths, and Browser Efficiency

**File purpose:** This is an added implementation layer for Claude Code / Opus to read **after** the main CereBro V1 blueprint.

**Status:** Additive layer, not a replacement blueprint.

**Date added:** 2026-05-04

---

## 0. How Claude Should Treat This File

This file captures lessons from reviewing three external GitHub/project references:

1. **Coding Interview University**
   - Lesson: structured self-study roadmaps, prerequisites, ordered curriculum, progress tracking.
2. **Meilisearch**
   - Lesson: fast human-facing keyword search, typo tolerance, filtering/faceting, and possible hybrid/semantic search layer.
3. **Lightpanda**
   - Lesson: lightweight headless browsing for AI/browser automation workflows, but treat as experimental until validated.

This file should **not** cause a full redesign of CereBro.

Claude should use this as a **delta layer** that strengthens the existing V1 architecture in three places:

```text
Aang Learning Mode       -> add structured LearningPath / SkillTree artifacts
Knowledge/Search Layer   -> add Search Index service candidate, likely Meilisearch or fallback
Silver Surfer Browser    -> add BrowserProvider abstraction and browsing ladder
```

Do **not** add new agents because of this file.

Do **not** replace Obsidian, Chroma, Notion, or the existing task/session architecture unless a better technical route is clearly justified and presented back to the user.

---

## 1. Pushback / Guardrails

These repos are useful, but they should not become bloat.

### What should change

CereBro V1 should become more explicit about:

- how learning paths are created and stored,
- how global search works across outputs/tasks/notes/sources,
- how browser automation avoids wasting memory on heavy Playwright sessions when unnecessary.

### What should **not** change

Do not:

- turn CereBro into a coding interview prep app,
- add Coding Interview University as a dependency,
- replace Chroma with Meilisearch without analysis,
- make Meilisearch the main database,
- replace Playwright with Lightpanda in core V1,
- make Silver Surfer an always-on autonomous browser agent,
- introduce new agents for search, learning, or browser work,
- expand scope into Declyne or Raven Reviews.

### Claude’s responsibility

Claude should challenge this layer if implementation complexity gets too high.

If something here makes V1 heavier than necessary, Claude should propose a smaller version and explain the tradeoff.

---

## 2. Current CereBro V1 Context This Layer Must Respect

CereBro V1 is a local-first AI operating system with:

- RPG/castle-inspired UI
- persistent task/session architecture
- Project Spaces
- Source Library
- Knowledge/Search Layer
- Notion Human Output Layer
- Obsidian human-readable vault
- Chroma/vector database for semantic memory
- local-first model routing through Ollama where practical
- Claude Code / external reasoning escalation where needed
- Remotion creative pipeline
- Slack communication layer
- approval gates for memory/output writes

Current V1 core agents:

```text
Aang           -> primary user interface, guide, teacher, intent clarifier
Cortana        -> orchestrator, routing authority, task controller
Batman         -> strategy, reasoning, risk/tradeoff analysis
Tony Stark     -> development/build planning, Claude Code handoff, implementation support
Gojo           -> creative studio, UI/design/media/Remotion/content direction
Silver Surfer  -> browser intelligence, web research, external discovery
C-3PO          -> formatting, polished outputs, readable documentation
Professor Oak  -> final validator, hallucination check, blueprint consistency
Piccolo        -> automation/background worker
Spock          -> logic/sanity checker, bloat detection, system consistency
```

Removed from V1:

```text
Declyne mode
Raven Reviews
Raven agent
Scrooge
Wonder Woman / fraud-risk agent
Declyne dashboards and finance/admin workflows
```

This file must respect those decisions.

---

## 3. Lesson 1: Coding Interview University -> Structured Learning Paths

### What we learned

Coding Interview University is valuable because it is not just random learning content. It organizes a large skill domain into a long-form study path with prerequisites, topic ordering, depth levels, review points, and practical exercises.

### CereBro implication

Aang Learning Mode should not simply answer:

```text
"Teach me backend development"
```

with a one-off explanation.

Instead, Aang should be able to create a structured learning artifact:

```text
LearningPath
SkillTree
StudyPlan
PracticeChecklist
ReviewLoop
```

### New artifact type: LearningPath

Add a V1 artifact type called `LearningPath`.

Suggested schema:

```ts
type LearningPath = {
  id: string;
  projectSpaceId: string;
  title: string;
  userGoal: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTimeframe?: string;
  prerequisites: string[];
  modules: LearningModule[];
  checkpoints: LearningCheckpoint[];
  resources: SourceReference[];
  tasks: TaskReference[];
  status: "draft" | "active" | "paused" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
  ownerAgent: "Aang";
  validatedBy?: "Professor Oak";
};

type LearningModule = {
  id: string;
  title: string;
  objective: string;
  concepts: string[];
  exercises: string[];
  outputs?: string[];
  reviewQuestions?: string[];
  order: number;
};

type LearningCheckpoint = {
  id: string;
  title: string;
  successCriteria: string[];
  reviewPrompt?: string;
  order: number;
};
```

### Agent ownership

```text
Aang:
- creates/updates learning paths
- explains concepts
- checks progress
- converts vague learning goals into structured curriculum

C-3PO:
- formats learning paths into readable guides/checklists
- prepares Notion-ready versions

Professor Oak:
- validates that the learning path is not hallucinated, bloated, or missing prerequisites

Spock:
- checks whether the sequence makes logical sense
- flags if the learning path is overcomplicated

Piccolo:
- can create recurring review reminders or cleanup stale learning tasks, only with user approval
```

No new agent is required.

### UI implication

In Project Spaces, add a possible tab or section:

```text
Learn
```

This section can contain:

- active learning paths,
- module progress,
- review checkpoints,
- linked notes,
- linked tasks,
- generated beginner guides,
- practice checklists.

### Minimum viable V1 implementation

Do not overbuild this.

V1 can start with:

```text
LearningPath markdown/json object
module checklist
progress status
link to related tasks and outputs
Notion export support
Obsidian save support after approval
```

Advanced spaced repetition, quizzes, flashcards, and adaptive testing can come later.

---

## 4. Lesson 2: Meilisearch -> Real Global Search Layer

### What we learned

Meilisearch is useful because CereBro needs fast, typo-tolerant, human-facing search across a lot of local system content.

CereBro already has semantic memory planned through Chroma, but Chroma alone does not create a polished global search experience.

### CereBro implication

CereBro needs two different retrieval layers:

```text
Chroma
- semantic memory
- embeddings
- meaning-based retrieval
- agent context assembly
- "what does this relate to?"

Search Index, likely Meilisearch or fallback
- fast exact/keyword search
- typo tolerance
- filters/facets
- UI search bar
- "find the thing I saved"
```

### Pushback

Meilisearch should not become the main database.

Meilisearch should not replace:

- SQLite/Postgres/local app DB,
- Obsidian vault,
- Chroma vector store,
- Notion output layer.

It should be treated as an **index**, not the source of truth.

### New service candidate: Search Index Service

Add a service abstraction:

```ts
type SearchIndexService = {
  indexDocument(doc: SearchableDocument): Promise<void>;
  updateDocument(doc: SearchableDocument): Promise<void>;
  removeDocument(id: string): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  rebuildIndex(scope?: SearchRebuildScope): Promise<SearchIndexReport>;
};
```

Suggested `SearchableDocument` schema:

```ts
type SearchableDocument = {
  id: string;
  title: string;
  body: string;
  type:
    | "task"
    | "session"
    | "guide"
    | "note"
    | "source"
    | "decision"
    | "build_log"
    | "learning_path"
    | "content_plan"
    | "design_reference"
    | "notion_output"
    | "obsidian_note";
  projectSpaceId?: string;
  sourceIds?: string[];
  agentOwner?: string;
  status?: string;
  tags?: string[];
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  provenance?: ProvenanceRecord[];
};
```

Suggested `SearchQuery` schema:

```ts
type SearchQuery = {
  text: string;
  filters?: {
    type?: string[];
    projectSpaceId?: string;
    agentOwner?: string[];
    status?: string[];
    tags?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
    sourceBacked?: boolean;
  };
  limit?: number;
};
```

### UI implication

CereBro should eventually have a global search bar that can search across:

```text
Project Spaces
Tasks
Sessions
Guides
Learning Paths
Saved sources
Agent decisions
Build logs
Notion outputs
Obsidian notes
Design references
Content plans
```

Search result cards should show:

```text
Title
Type
Project Space
Snippet
Source/provenance
Last updated
Confidence / validation status if applicable
Suggested next action
```

Example:

```text
Search: "bg3 monk beginner build"

Result:
- Beginner BG3 Monk Build Guide
  Type: Guide
  Space: Gaming
  Source-backed: Yes
  Related tasks: 3
  Last updated: 2026-05-04
  Suggested action: Open guide / export to Notion / create checklist
```

### Implementation recommendation

Claude should evaluate these options:

```text
Option A: Meilisearch
- Better UX for search
- Typo tolerance and filtering
- Real search service
- More moving parts

Option B: SQLite FTS / local simpler search
- Simpler V1
- Less setup
- Weaker search experience
- Better for first prototype if complexity is high

Option C: Hybrid staged approach
- Start with local DB/SQLite FTS
- Add Meilisearch behind SearchIndexService later
- Best if speed-to-build matters
```

Recommended direction:

```text
Build SearchIndexService abstraction now.
Use the simplest viable backend first if needed.
Keep Meilisearch as the preferred upgrade path for strong V1/V1.5 search.
```

This protects the architecture without forcing a dependency too early.

---

## 5. Lesson 3: Lightpanda -> Browser Provider Ladder

### What we learned

Lightpanda is interesting because it targets AI/browser automation with a lightweight headless browser model.

That matters for CereBro because Silver Surfer should not always pay the cost of full browser automation.

### Pushback

Do not replace Playwright with Lightpanda in core V1.

Reasons:

- Lightpanda is still newer/less proven.
- API/web compatibility may be incomplete.
- Playwright remains the safer default for complex browsing, auth flows, screenshots, and visual tests.
- CereBro needs reliability more than theoretical speed in V1.

### CereBro implication

Add a `BrowserProvider` abstraction and a browsing ladder.

```text
Silver Surfer Browser Ladder

Level 0: No browser
- Use existing source library, local cache, saved docs, or user-provided text.

Level 1: HTTP fetch / parser
- Static docs
- GitHub READMEs
- blogs/articles
- simple pages

Level 2: Lightweight headless provider
- Candidate: Lightpanda
- only for simple JS pages after testing
- optional experimental provider

Level 3: Full Playwright provider
- complex JS sites
- login flows
- screenshots
- visual validation
- authenticated/manual flows

Level 4: User-assisted browser
- CAPTCHA
- MFA
- sensitive auth
- cases requiring human approval
```

### New abstraction

```ts
type BrowserProvider = {
  name: "fetch" | "lightpanda" | "playwright" | "manual";
  canHandle(request: BrowserRequest): Promise<BrowserCapabilityResult>;
  run(request: BrowserRequest): Promise<BrowserResult>;
};

type BrowserRequest = {
  url: string;
  taskType:
    | "fetch_text"
    | "extract_links"
    | "summarize_page"
    | "screenshot"
    | "form_fill"
    | "authenticated_browse"
    | "visual_test"
    | "automation";
  requiresAuth?: boolean;
  requiresScreenshot?: boolean;
  requiresJavascript?: boolean;
  riskLevel?: "low" | "medium" | "high";
};

type BrowserCapabilityResult = {
  supported: boolean;
  confidence: number;
  reason?: string;
};
```

### Agent ownership

```text
Silver Surfer:
- owns browser intelligence and chooses the required browsing level through Cortana-approved tools

Cortana:
- enforces permissions and tool routing

Professor Oak:
- validates source quality and prevents unsupported claims

Spock:
- checks whether a browser task is overkill and suggests simpler retrieval when possible

Piccolo:
- can run approved recurring fetch/sync jobs, but not autonomous unrestricted browsing
```

### Minimum viable V1 implementation

V1 does not need Lightpanda working on day one.

V1 should include:

```text
BrowserProvider interface
Fetch provider
Playwright provider
Manual handoff state
Clear place for optional Lightpanda provider later
```

Lightpanda can be a marked experimental provider:

```text
lightpandaProvider_optional_experimental
```

Do not block V1 if it is unstable or incompatible.

---

## 6. Build Changes Summary

### New or updated architecture pieces

```text
1. Add LearningPath artifact type
2. Add SearchIndexService abstraction
3. Add SearchableDocument schema
4. Add BrowserProvider abstraction
5. Add Browser Ladder policy
6. Add Search UI expectations
7. Add Learning tab/section to Project Spaces if feasible
```

### No new agents

These capabilities map to existing agents:

```text
Learning paths       -> Aang + C-3PO + Oak + Spock
Global search        -> system service + C-3PO UI formatting + Oak validation
Browser ladder       -> Silver Surfer + Cortana + Oak + Spock
Background indexing  -> Piccolo, only when approved
```

### Files / modules Claude may need to create or modify

Exact paths depend on the repo structure, but conceptually:

```text
/src/core/search/SearchIndexService.ts
/src/core/search/SearchableDocument.ts
/src/core/search/providers/LocalSearchProvider.ts
/src/core/search/providers/MeilisearchProvider.ts optional
/src/core/learning/LearningPath.ts
/src/core/browser/BrowserProvider.ts
/src/core/browser/providers/FetchProvider.ts
/src/core/browser/providers/PlaywrightProvider.ts
/src/core/browser/providers/LightpandaProvider.experimental.ts optional
/src/core/agents/aang/learningMode.ts
/src/core/agents/silver-surfer/browserPolicy.ts
/src/core/validation/oakValidation.ts
/src/core/sanity/spockChecks.ts
/src/ui/search/GlobalSearch.tsx
/src/ui/project-space/LearnPanel.tsx optional
```

If the existing repo structure is different, Claude should adapt the paths while preserving the same concepts.

---

## 7. Implementation Priority

### Priority 1: Search architecture

This is the biggest practical upgrade.

Build the abstraction even if the first backend is simple.

```text
Must have:
- SearchIndexService interface
- SearchableDocument schema
- indexing hooks for tasks/outputs/notes/sources
- basic global search UI or command palette search
```

### Priority 2: LearningPath artifact

This strengthens Aang and makes CereBro feel like a personal operating system instead of a chat wrapper.

```text
Must have:
- create LearningPath
- break into modules
- convert modules into tasks/checklists
- export/save with approval
```

### Priority 3: Browser ladder

Do the interface now. Do not overbuild the providers.

```text
Must have:
- BrowserProvider interface
- fetch-first policy
- Playwright fallback
- manual handoff state

Optional:
- Lightpanda provider after compatibility test
```

---

## 8. Claude Questions / Challenges to Raise During Build

Claude should actively challenge the user if needed.

Suggested questions Claude may ask only if blocking:

```text
1. Should V1 start with SQLite/local FTS and keep Meilisearch as an upgrade path?
2. Should the first search UI be a command palette instead of a full search page?
3. Should LearningPath progress be stored as tasks, artifact metadata, or both?
4. Should BrowserProvider be implemented now with only fetch + Playwright, leaving Lightpanda as a stub?
```

Claude should **not** ask these questions if it can make a sensible default decision and continue.

Recommended defaults:

```text
1. Start with SearchIndexService abstraction.
2. Use a simple local search backend first if Meilisearch setup slows V1.
3. Store LearningPath progress both as artifact metadata and linked tasks.
4. Implement BrowserProvider with fetch + Playwright first; add Lightpanda as optional experimental later.
```

---

## 9. Updated CereBro Principle From These Lessons

CereBro should not only remember things.

It should make saved knowledge:

```text
findable,
teachable,
actionable,
and source-aware.
```

That means:

```text
Aang turns knowledge into learning paths.
Search makes knowledge easy to retrieve.
Silver Surfer gathers external information efficiently.
Oak keeps the system honest.
Cortana prevents tools from becoming chaos.
```

---

## 10. Final Instruction to Claude

Treat this as an enhancement layer.

Do not rewrite CereBro around these repos.

Do not add new agents.

Do not overfit the build to external tools.

Instead, absorb the lessons into the existing V1 architecture:

```text
Structured learning paths.
Real global search.
Browser automation ladder.
```

If any implementation choice threatens V1 stability, Claude should present a smaller safer alternative and explain the tradeoff before proceeding.

