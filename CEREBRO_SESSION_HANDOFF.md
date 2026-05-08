# CereBro Session Handoff

Last updated: 2026-05-08 14:55 EDT

## Current North Star

CereBro is being built into a cloud-backed, local-controlled personal command
center for everyday work, project building, creative production, research,
learning, portfolio growth, and freelance work.

The Keep is now the product spine. The Workshop is the dense work surface.
System machinery stays below the floor until it is needed.

The Mac is the workbench, not the warehouse. Turso/libSQL cloud is the intended
structured brain, Google Drive is the durable file vault, Obsidian is the
readable Markdown knowledge layer, and cloud vector retrieval is the intended
RAG path once selected. Local SQLite, local embeddings, and local model files
are cache/fallback lanes unless the user approves the storage cost.

The canonical session plan lives in `CEREBRO_MASTER_BUILD_PLAN.md`.

## Current Session Goal

2026-05-08 deck pass:

- Added the Aang-first mode intelligence and behavior plan to the master build
  plan before deck production: Aang is always the user-facing bridge, Aang
  reports to Cortana, Cortana routes agents, mode reads are visible, uncertain
  reads ask one clarifying question, and approved corrections can become memory.
- Built a 60-slide CereBro finished-product training deck showing the target
  end-state app, not wireframes and not the current Keep environment.
- The deck keeps the existing agent sprites as canon. Current Keep walls, room
  composition, and environment layout are not treated as canon.
- PixelLab was used for new target room and prop assets. Usable assets were
  kept as target-room overlays. Weak PixelLab results are not canon and should
  be regenerated before implementation.
- Final deliverables were copied to the Drive vault:
  `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault/03_Outputs/exports/cerebro-end-product-training/cerebro-end-product-training.pptx`
  and
  `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault/03_Outputs/exports/cerebro-end-product-training/cerebro-end-product-training-contact-sheet.png`.
- Deck scope now includes Keep, Aang command bridge, Cortana routing, capture,
  watch mode, browser, research, source fingerprints, learning sidecar,
  Workshop, build, evidence annotation, approvals, design review, PixelLab
  asset lifecycle, meetings, Hedwig, Piccolo, Batman, Oak, Spock, C-3PO,
  model routing, memory promotion, settings, buttons, dropdown menus,
  right-click context menus, modular windows, Aang chat states, themes,
  typography, command palette, notifications, source library, output library,
  permissions, and every agent room detail.

Open deck caveat:

- This is a stronger training deck, but it is still a target artifact. It is not
  a claim that the live app already matches it. The next design pass should
  turn these screens into an implementation-grade product spec, then rebuild
  the live Keep and workbench against that spec.

2026-05-08 Obsidian full reorganization:

- User approved a full Obsidian reorganization after the initial color/graph
  pass. The old no-move constraint is superseded for this vault cleanup.
- Reorganized the Obsidian vault into top-level lanes:
  `00_Atlas`, `10_Projects`, `20_Knowledge`, `60_Media`, `80_Templates`, and
  `90_Archive`.
- Moved CereBro session history to
  `90_Archive/CereBro Session History/` and Sundesk build history to
  `90_Archive/Sundesk Build History/`. Snapshots remain append-only.
- Moved project bridges to `10_Projects/<Project>/<Project>.md` for CereBro,
  Bridgefour, Declyne, Sundesk, Sygnalist, and Waymark.
- Moved current knowledge sections to `20_Knowledge/`: Decisions, Sources,
  Learning, Playbooks, Reviews, Ops, and Capture.
- Added `00_Atlas/Vault Map.md`, `20_Knowledge/Knowledge Index.md`,
  `60_Media/Media Index.md`, `90_Archive/Archive Index.md`, and
  `20_Knowledge/Ops/RAG Ready Knowledge Map.md`.
- Updated Obsidian graph colors and default search so archive snapshots are
  hidden from the normal graph view while remaining available in Archive.
- Updated templates with RAG metadata fields:
  `canonical_status`, `retrieval_status`, `llm_summary`, `source_ids`,
  `related_notes`, and `privacy_class`.
- Ran a wiki-link audit after the move. Result: 221 Markdown notes, 0 broken
  wiki links.
- Follow-up lock-in: CereBro's repo rules, lifecycle plan, master build plan,
  Obsidian doctrine notes, and writer code now agree on the same method.
  CereBro writes Obsidian notes into the current lanes, preserves canonical
  folder casing, defaults manual durable notes to `20_Knowledge/Capture`, and
  treats `90_Archive` as archive-only for normal retrieval.
- `integrations.status` now exposes the Obsidian knowledge routes and retrieval
  metadata fields so the app can show the method instead of hardcoding it.
- `handoffs.archivePlan`, `HandoffArchivePanel`, and `ArtifactsPanel` now point
  at the new Obsidian lanes instead of old `CereBro/...` paths.
- RAG-ready notes must carry `canonical_status`, `retrieval_status`,
  `llm_summary`, `source_ids`, `related_notes`, and `privacy_class`.
- Normal retrieval includes current validated notes and indexes. Archive enters
  retrieval only when the user asks for history, provenance, prior decisions,
  or session recovery. Every answer should cite the note path, source row,
  artifact, or memory id used.
- 2026-05-08 GitHub project import: imported all 6 visible Bowgull GitHub repos
  into Obsidian using the approved bridge/source method: Sundesk, CereBro,
  Declyne, Bridgefour, Waymark, and sygnalist-brain. Created or updated project
  bridge notes in `10_Projects`, repository source notes in
  `20_Knowledge/Sources/GitHub`, `00_Atlas/GitHub Project Map.md`,
  `20_Knowledge/Sources/GitHub/GitHub Sources.md`, and
  `20_Knowledge/Playbooks/GitHub Repository Import Method.md`.
- GitHub import rule is now written into `AGENTS.md`,
  `CEREBRO_FILE_LIFECYCLE_PLAN.md`, and `CEREBRO_MASTER_BUILD_PLAN.md`: do not
  copy full repos into Obsidian; use repo URL plus commit SHA fingerprints,
  bridge notes, source summaries, and live repo inspection for exact code facts.

Begin Session 4 after user clarification:

- CereBro is not freelance-first. It is a personal command center with Project
  Intelligence.
- Everyday notes, reminders, messages, research, learning, creative work,
  personal apps, portfolio, and freelance all need to fit.
- Declyne, Waymark, Sygnalist, Bridgefour, and CereBro are the initial project
  set.
- Freelance is a mode inside the broader system.
- Previous vault no-move instruction is superseded by the approved 2026-05-08
  Obsidian full reorganization. Future moves still need a reason and link
  repair. History stays append-only.
- First thin implementation slice is now live: Project Lab shows read-only
  project profiles, local git status, project modes, next actions, risks, and
  agent ownership for Declyne, Waymark, Sygnalist, Bridgefour, and CereBro.
- Latest clarification: CereBro's preview, browser, screenshot, image, video,
  annotation, terminal/log, and validation surfaces must be visible in app as a
  modular workbench. This should be similar in spirit to Codex's preview
  windows: user-visible, agent-readable, and tied to a self-review loop. It is
  not just hidden tool access.
- Follow-up clarification: this is a required workbench function, not a visual
  nice-to-have. The user needs to show CereBro things the same way they use
  Codex broadly: open a preview, mark the exact part that matters, route that
  visual evidence to an agent, and watch the next pass happen in the same app.
  Annotation records need coordinates, context, project/task/session links, and
  agent routing.
- 2026-05-07 clarification: CereBro must understand images as a general input
  type, not only creative assets or setup screenshots. The user wants to drag in
  screenshots, UI states, account screens, app errors, artwork, mockups,
  diagrams, photos, charts, whiteboards, generated images, and other still
  images, then ask open-ended questions about them. Video support should start
  with key-frame/frame understanding and annotation.
- 2026-05-07 clarification: the permissions toggle is a global CereBro control,
  not an image feature. Long term, CereBro should perceive what is happening,
  reason about it, and act on the user's behalf across coding, browser work,
  files, account setup, messaging, reminders, publishing, and desktop context.
  Permission modes govern all perception and action.
- 2026-05-07 locked direction: add a Codex-like global mode selector:
  `Default permissions`, `Auto-review`, and `Full access`. Default reads only
  explicit user-provided context and guides. Auto-review can proactively inspect
  approved visible/local evidence and queue suggestions. Full access can use
  enabled tools in the session, but hard gates remain visible: payments, account
  permission grants, destructive commands, deleting/overwriting files, sending
  messages, publishing, uploading private media externally, saving sensitive
  screenshots to memory, installs, tokens/API keys, and sealed Raven/NSFW scope.
- 2026-05-07 plan update: `CEREBRO_MASTER_BUILD_PLAN.md` now folds this into
  core defaults, Session 10 image/video understanding, Session 11 agent runtime
  permission classes, Session 12 shell/workbench UX, and open provider/model
  decisions.
- 2026-05-07 locked direction: CereBro must become a model/tool opportunist
  with strong routing and validation, not a single-provider chatbot. It should
  use local models, free/generous hosted tiers, specialty AI tools, and a
  frontier hosted lane when the task needs me-level reasoning. Surfer should
  research current models/tools/free tiers/prompt recipes with source links;
  Cortana should route; Batman should risk-review; Spock/Oak should validate;
  Piccolo should monitor cost, rate limits, stale registry entries, and storage.
  Multiple weaker/free models do not automatically equal a frontier model.
  CereBro gets smarter by testing, routing, packaging context, validating, and
  remembering what worked.
- 2026-05-07 reasoning-route plan update: `CEREBRO_MASTER_BUILD_PLAN.md` and
  `CEREBRO_MODEL_ROUTER_BASELINE.md` now include a Model/Tool Capability
  Registry target, Reasoning Gateway direction, eval-backed routing, Surfer's
  Model/Tool Discovery lane, Prompt/Tool Handoff playbooks, and OpenClaw as a
  pattern/reference rather than core runtime.
- 2026-05-08 cloud-backed learning correction: user clarified CereBro is meant
  to be a cloud-based solution because the Mac has limited storage and will be
  used for routine builds. `CEREBRO_MASTER_BUILD_PLAN.md`,
  `CEREBRO_FILE_LIFECYCLE_PLAN.md`, `CEREBRO_MODEL_ROUTER_BASELINE.md`,
  `AGENTS.md`, and `CLAUDE.md` now replace the old local-first framing with
  cloud-backed, local-controlled storage and learning. Obsidian remains useful,
  but it is not the RAG engine or the model brain.
- 2026-05-08 Obsidian organisation pass: added a CereBro vault CSS snippet,
  enabled it in Obsidian appearance settings, created the CereBro knowledge
  folder set, added a knowledge home note, linked the existing `indexes`
  CereBro home note to it, and added templates for decisions, source summaries,
  playbooks, and learning notes. Obsidian can now be visibly organized and
  color-coded without plugins.
- 2026-05-08 terminology cleanup: remaining build-plan escalation language now
  says private/cheap first instead of local first.
- 2026-05-08 Obsidian visual doctrine: user clarified that Obsidian should be
  extremely beautiful and visually distinct because it can become an invaluable
  knowledge surface. Updated graph colors to use more distinct path-based
  groups, aligned the CereBro CSS snippet colors, and recorded the standing
  rule in `AGENTS.md` and `CEREBRO_FILE_LIFECYCLE_PLAN.md`: Obsidian should use
  distinct folder/path colors, templates, frontmatter, backlinks, callouts, and
  indexes. Do not rely on manual tags just to make nodes readable.
- 2026-05-08 Obsidian graph repair: user showed grey unresolved graph nodes and
  disconnected blue template nodes. Created real section index notes for
  Decisions, Sources, Learning, Projects, Playbooks, Reviews, Ops, and Capture;
  rewired CereBro Knowledge Home to link to those files instead of folders;
  linked templates from the home and their matching section indexes; linked the
  legacy `indexes/cerebro-home` note back into the graph; and set Obsidian
  graph `hideUnresolved` to true so ghost nodes do not pollute the map.
- 2026-05-08 Obsidian project bridge reorg: user clarified that Sundesk should
  be visible to CereBro as an active project CereBro will eventually maintain,
  upgrade, and audit. Added `10_Projects/Sundesk/Sundesk.md` as the project
  bridge, linked it from the Project Registry and Knowledge Home, and linked the
  existing Sundesk Build History and Sundesk PPTX Index back to it. Added
  `80_Templates/Template Library.md` so templates form a deliberate cluster instead
  of loose blue nodes. Added `20_Knowledge/Ops/Obsidian Knowledge System.md` as a
  permanent system note for the vault doctrine: visual beauty is comprehension,
  active projects need bridge notes, graph colors are path-based, and history
  should not be moved/deleted just to make the graph prettier.
- 2026-05-07 Reddit direction: CereBro should use Reddit heavily as a trusted
  human-signal source: real user reports, niche community expertise, trend
  radar, product complaints, screenshots, videos, links, and community
  disagreements. This belongs in the Source Library, Surfer research lane,
  Hedwig capture queue, Workbench media/evidence surfaces, and Oak/Spock
  validation flow. Treat Reddit as evidence with fingerprints, not automatic
  truth and not model-training data.
- 2026-05-07 build-cadence clarification: the user does not want to return
  every 2-3 minutes just to say "keep going." This feels pointless and creates
  friction. Future CereBro build sessions should run in bounded autonomous
  blocks: 2-4 related safe slices on one surface, then checks, handoff,
  Obsidian snapshot, commit, and summary. Stop only when a gate is required,
  checks fail, product direction changes, the diff gets broad, context is
  getting heavy, or the block is complete.
- 2026-05-07 07:09 EDT slice: Workbench temporary media metadata now covers
  video-frame notes as well as image-review notes. The Workbench can stage a
  temporary local image or video in browser memory, record metadata-only
  evidence, store media kind plus frame-time/duration fields, and display those
  fields in evidence detail. This does not save media bytes, capture
  screenshots, open browsers, call vision models, or write externally.
- 2026-05-07 07:14 EDT slice: Workbench before/after comparison records are
  now partially live. Spock can append a local comparison evidence row linking
  two existing Workbench evidence records, with before/after ids, result text,
  inherited project/task/session/source/command/artifact links where available,
  a permission preflight audit row, and comparison history in evidence detail.
  This does not open linked targets, capture media, fetch sources, run
  commands, save files, or write externally.
- 2026-05-07 07:18 EDT slice: Workbench before/after comparison now uses a
  dedicated local evidence picker instead of only the visible recent-evidence
  list. The picker reads up to 120 local Workbench evidence rows, excludes the
  selected row, supports local search and kind filtering in the detail panel,
  shows candidate metadata, and keeps gates visible. It does not open linked
  targets, fetch sources, execute commands, capture media, save files, or write
  externally.
- 2026-05-07 07:24 EDT slice: Workbench temporary media previews now support
  metadata-only annotation coordinate capture. Clicking a temporary image or
  video preview records normalized `xPct`/`yPct` coordinates, target metadata,
  and current video frame time when available, switches the draft into
  annotation mode, and displays a local marker. This does not capture
  screenshots, save media bytes, inspect linked files, call a vision model, or
  write externally.
- 2026-05-08 UX reset direction: the current UI/UX has become too jumbled and
  too generic-SaaS. The agents and Keep idea stay. The surrounding surfaces need
  the same simplification pass Sundesk got. Sundesk's product rule was: Daily
  is the product, Build is the workshop, Settings are the basement. CereBro's
  matching rule is: the Keep is the product, the Workshop is the work surface,
  and system machinery stays below the floor until needed.
- 2026-05-08 user direction: CereBro is an everyday OS and creative workshop,
  not only a coding harness. It needs to handle quick questions, research,
  learning code/design, YouTube/anime discovery, anime tracking, source capture,
  repo analysis, creative work, and project continuation without making the
  user learn internal architecture first.
- 2026-05-08 reference locked: the Sundesk final training deck at
  `/Users/lindsaybell/Documents/Codex/2026-05-07/files-mentioned-by-the-user-task/sundesk/outputs/manual-20260508-sundesk-demo/presentations/sundesk-command-center-training/output/sundesk-command-center-training-manual.pptx`
  is the simplification reference. It is screenshot-led, routine-led, and
  shows product use instead of describing feature machinery.
- 2026-05-08 tool mapping: Gitingest is now planned as a Silver Surfer
  repo-digestion primitive. Use local CLI/package or a CereBro-native adapter,
  preserve provenance, token/size counts, ignored files, commit SHA when
  available, and vault/source-library output.
- 2026-05-08 product reference: Skales is useful as Aang companion/desktop
  ergonomics inspiration only. Do not copy code or depend on it because of
  license/product-overlap risk.
- 2026-05-08 Aang direction: Aang can become the meeting notetaker surface,
  Otter-style, but the safe V1 path is transcript-first. Teams and Google Meet
  transcript imports/fetches require account permissions and meeting transcript
  availability. Live call joining, recording, and bot attendance are later
  permission-heavy investigations.
- 2026-05-08 deck direction: create a 24-slide finished-product CereBro
  training target deck in the same spirit as the Sundesk command center deck.
  The deck should use high-fidelity mockups that can be ahead of the current
  app and should become the UI/UX target. First teaching moment: start in the
  Keep, ask, capture, route, and watch the agents work. The deck should show
  one full day in CereBro, all agents visible, everyday OS workflows in the main
  story, Aang as bigger than meeting notes, and vault-backed deck/notes/contact
  sheet/source artifacts indexed in Obsidian. Do not generate the PPTX until
  the 24-slide outline is approved.
- 2026-05-08 11:05 EDT UI/UX market research reset: user rejected the current
  finished-product deck direction and clarified that CereBro is unusable if it
  keeps drifting toward generic SaaS. Ran a research-only pass across product
  docs, GitHub-facing agent tooling, Reddit, Hacker News, UX doctrine, and
  pixel-art UI sources. Wrote an Obsidian research package that proposes the
  Keep-first hybrid OS model: the Keep is where work is understood, the
  Workshop is where work is done, the Ledger is where work is proven, and the
  Basement is where the machine is configured. No code changed.
- 2026-05-08 11:25 EDT full interaction deep dive: user clarified that the
  CereBro reset must inspect every interaction, not just the high-level shell:
  buttons, dropdowns, chat, screens, workbench panes, browser/search, anime and
  media tracking, code building, creative work, research, themes, typography,
  borders, windows, approvals, and drag/drop behavior. Ran a second research
  pass across IDEs and AI builders, browsers, research tools, media trackers,
  design-review tools, OS launchers, and UI design systems. Wrote a full
  Obsidian interaction package. No app code changed.
- 2026-05-08 13:07 EDT Aang-first correction: user clarified Aang is not a
  side helper. Aang is the human bridge and the user should always speak to
  Aang. Aang reports to Cortana. Cortana routes the CereBro realm and agent
  layer. User also clarified PixelLab is not the CereBro creative studio. It is
  the external production tool used to create Keep UI, sprites, and current
  agent art through the user's tier 1 membership. Patched the interaction docs
  and wrote the Aang-first full interaction map. No app code changed.
- 2026-05-08 13:16 EDT mode intelligence and deck gate: added explicit
  Aang-first mode inference to `CEREBRO_MASTER_BUILD_PLAN.md` and `AGENTS.md`.
  CereBro should infer the user's mode from context, have Aang show the read,
  ask only when uncertain or risky, remember corrections with approval, and
  route through Cortana with proof. Also locked the next training deck quality
  gate: no wireframes, no grey boxes, no generic SaaS panels, no fake
  placeholder mock images. The deck must show final target product screens,
  including end-state Keep rooms that are unique, dynamic, and specific to each
  agent. No deck generation started.

## Latest Closeout

### 2026-05-08 13:16 EDT - Mode Intelligence And Deck Gate

Files changed:

- `AGENTS.md`
- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

What changed:

- Added a named `Aang-First Mode Intelligence` section to the master plan.
- Locked the behavior rule: infer mode, have Aang show the read, ask only when
  unclear or risky, route through Cortana, and record proof.
- Added mode signals: current zone, active surface, selected object, user
  language, attachment type, active project, permission mode, recent work, and
  prior corrections.
- Added correction memory as a requirement. Repeated corrections can become
  playbook proposals only with approval.
- Added runtime requirements for mode inference and Aang confirmation behavior.
- Added the deck quality gate: the training deck must show final target product
  screens, not wireframes, grey boxes, placeholder dashboards, or fake
  low-fidelity mock images.
- Added the Keep deck requirement: each agent room should look distinct,
  dynamic, and specific to that agent.
- Recorded PixelLab as the external production tool for Keep UI, sprites,
  chamber props, and agent assets.

Gates preserved:

- No app code changed.
- No deck generated.
- No images generated.
- No PixelLab calls.
- No Notion or Slack writes.
- No external model/tool calls.
- No destructive cleanup.

Known risks:

- The deck needs a tight approval gate before production because it will become
  the visual target for the build.
- High-fidelity final-state images may require PixelLab asset generation or
  image generation after approval.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_MASTER_BUILD_PLAN.md`, `CEREBRO_SESSION_HANDOFF.md`, and the Obsidian
note `20_Knowledge/Playbooks/CereBro Aang First Full Interaction Map.md`. Treat
Aang as the human bridge. CereBro must infer mode from context, have Aang show
the read, ask only when uncertain or risky, remember corrections with approval,
and route through Cortana. Do not generate a deck, images, or wireframes until
Josh approves the deck plan. The deck must show final target product screens,
including unique dynamic rooms for every agent, not placeholders.

### 2026-05-08 13:07 EDT - Aang First Interaction Correction

Files changed:

- `CEREBRO_SESSION_HANDOFF.md`
- `00_Atlas/CereBro Knowledge Home.md` in the Obsidian vault
- `20_Knowledge/Sources/2026-05-08 CereBro Full Interaction Source Index.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 Current CereBro Interaction Audit.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 CereBro Market Pattern Matrix.md` in the Obsidian vault
- `20_Knowledge/Playbooks/Playbooks.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Complete Interaction Spec.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Visual System And Theme Spec.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Aang First Full Interaction Map.md` in the Obsidian vault

What changed:

- Corrected the product hierarchy: the user speaks to Aang; Aang interprets
  and reports to Cortana; Cortana routes the agents; the Keep shows the route;
  the Ledger records proof.
- Corrected PixelLab's role: PixelLab is the external asset production tool for
  Keep UI, sprites, chamber art, and agent animation assets. CereBro should
  track and review those outputs, not pretend PixelLab is an in-app creative
  studio.
- Added an Aang-first full interaction map covering Keep home, Aang command
  dock, chamber inspector, Workshop, build mode, browse mode, research mode,
  media mode, Keep asset review, Ledger, Basement, buttons, dropdowns,
  segmented controls, comboboxes, context menus, typography, colour, borders,
  and window rules.
- Inspected local sibling projects for product-family UI grammar: Bridgefour,
  Declyne, Waymark, and Sygnalist. Recorded the guardrail that CereBro should
  share the standard of distinct product identity without copying any one skin.

Research finding:

- Aang is the human-facing operating surface. Cortana is the internal command
  router. That keeps the product emotionally legible while preserving the
  agent hierarchy.

Checks run:

- Local repo inspection for Bridgefour, Declyne, Waymark, and Sygnalist.
- Web source pass for buttons, context menus, dropdowns, dialogs, tooltips,
  target size, and focus appearance.
- Obsidian index update.

Gates preserved:

- No app code changed.
- No app run.
- No PPTX generated.
- No Notion or Slack writes.
- No PixelLab calls.
- No external model/tool calls beyond web research.
- No media generation.
- No destructive cleanup.

Known risks:

- The Aang-first map is still implementation-free. It should be approved before
  wireframes, deck repair, mockups, or shell code.
- The next pass should name the exact first-screen layout and interaction
  order before any styling work starts.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, and the Obsidian note
`20_Knowledge/Playbooks/CereBro Aang First Full Interaction Map.md` first. Treat
Aang as the human bridge. Aang reports to Cortana. Cortana routes agents.
Treat PixelLab as the external Keep/agent asset production tool, not as the
in-app creative studio. Do not write code until Josh approves the Aang-first
interaction map. If approved, produce implementation-free wireframes for Keep
home, Aang command dock, Cortana routing receipt, chamber inspector, Workshop
presets, browser/research/media surfaces, Keep asset review, Ledger, and
Basement.

### 2026-05-08 11:25 EDT - Full Interaction Deep Dive

Files changed:

- `CEREBRO_SESSION_HANDOFF.md`
- `00_Atlas/CereBro Knowledge Home.md` in the Obsidian vault
- `20_Knowledge/Sources/Sources.md` in the Obsidian vault
- `20_Knowledge/Sources/2026-05-08 CereBro Full Interaction Source Index.md` in the Obsidian vault
- `20_Knowledge/Reviews/Reviews.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 Current CereBro Interaction Audit.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 CereBro Market Pattern Matrix.md` in the Obsidian vault
- `20_Knowledge/Playbooks/Playbooks.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Complete Interaction Spec.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Visual System And Theme Spec.md` in the Obsidian vault

What changed:

- Audited the current app shell against the market research and confirmed the
  main failure: internal implementation surfaces are exposed as equal primary
  navigation items.
- Wrote a current interaction audit that calls out the 14-item rail, dev-heavy
  header, old Pixel Punk theme, "Ask Aang" composer mismatch, isolated panels,
  and planning-only workbench.
- Wrote a market pattern matrix comparing CereBro areas against AI IDEs,
  browser spaces, source libraries, media trackers, creative tools, design
  review tools, task systems, and OS launchers.
- Wrote a complete interaction spec for navigation, Keep chambers, command
  dock, Workshop modes, build mode, browser mode, research mode, media mode,
  PixelLab mode, Ledger, approvals, automation, settings, buttons, menus,
  forms, modals, search, notifications, accessibility, and mobile.
- Wrote a visual system and theme spec with Keep Dark, Daylight Archive, Ember
  Forge, Moonlit Violet, High Contrast Terminal, and PixelLab Proof themes.
- Linked all new notes into Obsidian indexes and Knowledge Home.

Research finding:

- CereBro needs a stable 4-zone OS model and market-native specialist modes.
  Keep, Workshop, Ledger, and Basement stay constant. Coding, browsing,
  research, media, creative work, automation, and settings each need their own
  interaction grammar inside that shell.

Checks run:

- Web research with source links across official docs, Reddit user-signal
  threads, and design-system guidance.
- Local inspection of `Home.tsx`, `KeepScene.tsx`, `keepConfig.ts`,
  `WorkbenchPanel.tsx`, and `index.css`.
- Obsidian index link update.

Gates preserved:

- No app code changed.
- No app run.
- No PPTX generated.
- No Notion or Slack writes.
- No PixelLab calls.
- No external model/tool calls beyond web research.
- No media generation.
- No destructive cleanup.

Known risks:

- The interaction spec is implementation-free. It still needs user approval
  before wireframes, deck repair, mockups, or app changes.
- The next implementation step should be a scoped shell reset, not piecemeal
  button restyling.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, and the Obsidian notes
`20_Knowledge/Reviews/2026-05-08 Current CereBro Interaction Audit.md`,
`20_Knowledge/Reviews/2026-05-08 CereBro Market Pattern Matrix.md`,
`20_Knowledge/Playbooks/CereBro Complete Interaction Spec.md`,
`20_Knowledge/Playbooks/CereBro Visual System And Theme Spec.md`, and
`20_Knowledge/Sources/2026-05-08 CereBro Full Interaction Source Index.md`.
Do not write code until Josh approves the interaction direction. If approved,
draft implementation-free wireframes for the 4-zone shell, Cortana orb command
dock, Keep chamber inspector, Workshop pane presets, Ledger object receipt,
Basement settings map, media library mode, and PixelLab asset workflow.

### 2026-05-08 11:05 EDT - UI UX Market Research Reset

Files changed:

- `CEREBRO_SESSION_HANDOFF.md`
- `00_Atlas/CereBro Knowledge Home.md` in the Obsidian vault
- `20_Knowledge/Sources/Sources.md` in the Obsidian vault
- `20_Knowledge/Sources/2026-05-08 AI OS UI UX Source Index.md` in the Obsidian vault
- `20_Knowledge/Reviews/Reviews.md` in the Obsidian vault
- `20_Knowledge/Reviews/2026-05-08 CereBro UI UX Market Research Brief.md` in the Obsidian vault
- `20_Knowledge/Decisions/Decisions.md` in the Obsidian vault
- `20_Knowledge/Decisions/2026-05-08 CereBro Keep First UX Direction.md` in the Obsidian vault
- `20_Knowledge/Playbooks/Playbooks.md` in the Obsidian vault
- `20_Knowledge/Playbooks/CereBro Finished Product UX Spec.md` in the Obsidian vault

What changed:

- Confirmed the prior finished-product deck artifact was not found in the
  CereBro vault or recent Codex output paths. The handoff shows the 10:00 deck
  pass had scoped a deck but preserved the gate not to generate PPTX.
- Researched current AI product and agent UX patterns across official product
  docs, GitHub-facing agent tooling, Reddit, Hacker News, UX doctrine, and
  pixel-art UI sources.
- Wrote a source index with product, Reddit, Hacker News, UX, and PixelLab
  references.
- Wrote a market research brief concluding that CereBro should not be a generic
  dashboard, chat app, or workflow builder.
- Wrote a proposed Keep-first UX decision.
- Wrote a draft finished-product UX spec.
- Linked all new notes into their Obsidian section indexes and Knowledge Home
  so the graph does not create orphaned nodes.

Research finding:

- The market pattern is intake, visible execution, durable evidence, and
  permissioned action. CereBro should express that as Keep, Workshop, Ledger,
  and Basement.

Checks run:

- Web research with source verification and links.
- Local search for the hated CereBro deck in the CereBro vault and recent Codex
  output paths.
- `rg` ban check on new Obsidian notes for em dashes, exclamation marks, and
  banned AI/corporate register.
- `git status --short`.

Gates preserved:

- No app code changed.
- No app run.
- No redesign implementation.
- No PPTX generated.
- No Notion or Slack writes.
- No external model/tool calls beyond web research.
- No PixelLab calls.
- No media generation.
- No destructive cleanup.

Known risks:

- The research package is a strong first pass, not a final visual system.
- The next step needs approval before turning this into wireframes, mockups, or
  app changes.
- The bad deck still may exist in a separate chat export path not visible from
  the repo, vault, or recent Codex output search.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, the Obsidian notes
`20_Knowledge/Reviews/2026-05-08 CereBro UI UX Market Research Brief.md`,
`20_Knowledge/Decisions/2026-05-08 CereBro Keep First UX Direction.md`,
`20_Knowledge/Playbooks/CereBro Finished Product UX Spec.md`, and
`20_Knowledge/Sources/2026-05-08 AI OS UI UX Source Index.md`. Do not write code
until Josh approves the Keep-first UX direction. If approved, produce the
first implementation-free design pass: Keep home IA, chamber inspector, orb
command intake, Workshop shell, Ledger receipt view, Basement settings map,
and PixelLab asset-state list.

### 2026-05-08 10:00 EDT - Finished UI Training Deck Scope

Files changed:

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

What changed:

- Locked the CereBro finished-product training deck target as 24 slides.
- Confirmed the deck should be high-fidelity and allowed to be ahead of the
  current app.
- Confirmed the deck should show a full day in CereBro, not isolated features.
- Confirmed all agents stay visible, with slide focus limited to the agents
  involved in the moment.
- Confirmed everyday OS workflows belong in the main story.
- Confirmed Aang must be shown as companion, explainer, learning guide, event
  surface, and meeting-note helper. Not only meeting notes.
- Confirmed final deck artifacts should live in the CereBro vault media library
  with Obsidian indexing.
- Confirmed PPTX generation waits for outline approval.

Checks run:

- Re-read Session 4.5 in `CEREBRO_MASTER_BUILD_PLAN.md`.
- Re-read the latest closeout in `CEREBRO_SESSION_HANDOFF.md`.
- Read the `goodfit` skill guidance for the deck voice.

Gates preserved:

- No PPTX generated.
- No product UI changed.
- No app run.
- No Notion or Slack writes.
- No external model/tool calls.
- No media generation.
- No destructive cleanup.

Known risks:

- The deck will need a careful source pass across the Keep visual spec and
  current plan files before mockup production.
- The deck must not become a feature inventory. It needs a day-in-the-life
  training path with the Keep as the product spine.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, Session 4.5 in `CEREBRO_MASTER_BUILD_PLAN.md`,
the castle UI visual spec, and the Sundesk command center training deck. Draft
the 24-slide CereBro finished-product training deck outline only. Do not
generate PPTX until the outline is approved. The deck should teach: start in
the Keep, ask/capture/route/watch agents work, one full day in CereBro,
Workshop when needed, system machinery below the floor, all agents visible,
everyday OS workflows in the main story, Aang as companion/teacher/notetaker,
and final artifacts saved to the CereBro vault media library.

### 2026-05-08 09:47 EDT - Keep-First UX Reset Plan

Files changed:

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`

What changed:

- Promoted a Keep-first UX reset ahead of more Workbench/runtime expansion.
- Added Session 4.5 as the next product gate.
- Recorded the Sundesk final training deck as the simplification reference.
- Added the everyday OS lane: ask, capture, research, build, create, learn,
  watch, and review.
- Added Gitingest as the Silver Surfer repo-digest direction.
- Added Skales as Aang companion UX reference only.
- Added Aang transcript-first meeting notes direction.

Checks run:

- Read the Sundesk final deck text from the supplied PPTX. It has 20 slides and
  a clear routine-led flow: start here, product map, paste, edit table, fields,
  tags, links, communities, Today, Waiting On, meetings, timeline views, graph,
  Build, helpers, data/access, routine.
- Viewed the Sundesk command center training contact sheet from the Obsidian
  vault copy.
- Checked current Teams and Google Meet transcript API docs before recording
  Aang's meeting-notes path.

Gates preserved:

- No code changes.
- No app run.
- No Notion or Slack writes.
- No external model/tool calls.
- No media capture or durable media save.
- No desktop overlay process.
- No destructive cleanup.

Known risks:

- The current running UI still needs a separate visual/interaction audit before
  implementation. This update only corrects the plan.
- Aang meeting notes depend on meeting transcripts, account permissions, and
  platform-specific rules. Live bot/audio capture remains out of V1 until it is
  threat-modeled.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md`,
`CEREBRO_SESSION_HANDOFF.md`, and the new Session 4.5 in
`CEREBRO_MASTER_BUILD_PLAN.md`. Do not add new Workbench machinery first. Audit
the current app UI against the Sundesk simplification pattern and draft the
Keep-first UX spine: first screen, everyday modes, chamber actions, Workshop
layer, and system-basement rules. Preserve the Keep and visible agents. Run
checks, update handoff plus Obsidian snapshot/index, and commit locally.

### 2026-05-07 07:24 EDT - Workbench Annotation Coordinates

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`

What changed:

- Added click-to-mark annotation coordinates on temporary image/video previews.
- Coordinates are stored as normalized percentages plus temporary media target
  metadata.
- Video annotations also record the current preview frame time when available.
- Annotation clicks switch the local evidence draft to `annotation`, route it
  to Gojo, and keep the visible marker in the preview.
- Renamed the temporary intake label from image-only to media.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- Coordinates are relative to the rendered preview box. Object-fit letterboxing
  means a later polish slice should translate from preview-box coordinates to
  intrinsic media coordinates.
- Keyboard marking currently records the preview center. Fine-grained keyboard
  adjustment can wait.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation coordinate polish for intrinsic media bounds, or server-side
pagination for the local evidence picker. Preserve all gates. Run checks,
update handoff plus Obsidian snapshot/index, and commit locally.

### 2026-05-07 07:18 EDT - Workbench Evidence Picker

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `app/server/cerebro-foundations.test.ts`

What changed:

- Added `workbench.evidencePicker`, a read-only local candidate query for
  comparison selection.
- Added picker gates and summary metadata for total, sensitive, media, and
  comparison evidence rows.
- Updated the before/after form to use the dedicated picker rather than the
  currently visible recent-evidence list.
- Added local search, kind filtering, selected-candidate metadata, empty state,
  and visible picker gates in the Workbench detail panel.
- Expanded the foundation test to cover picker search, exclusion, summary, and
  no-action guarantees.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- The picker query runs when an evidence detail row is selected and currently
  returns a capped local candidate set. Later it can add server-side pagination
  if Workbench evidence grows large.
- The picker filters locally in the panel after loading candidates. It still
  does not inspect linked files or media bytes.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation-coordinate capture tied to temporary image/video previews, or
server-side pagination for the local evidence picker. Preserve all gates. Run
checks, update handoff plus Obsidian snapshot/index, and commit locally.

### 2026-05-07 07:14 EDT - Workbench Before/After Comparison

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `app/server/cerebroDb.ts`
- `app/server/cerebro-foundations.test.ts`

What changed:

- Added local append-only `before_after` comparison records for Workbench
  evidence.
- Added `before_evidence_id`, `after_evidence_id`, and `comparison_result` to
  the idempotent local DB schema and migration guard.
- Added `workbench.createBeforeAfterComparison`, including existence checks,
  sensitive-flag carryover, inherited local links, and permission preflight
  audit logging.
- Added comparison history to `workbench.evidenceDetail`.
- Added a Workbench detail-panel comparison form that compares the selected
  evidence row with another visible local evidence row and appends a new
  comparison record.
- Expanded the foundation test to cover comparison creation and comparison
  history.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- Comparison options currently come from the visible evidence list in the
  Workbench panel. A later slice should add a dedicated local evidence picker
  so older records outside the current list can be selected.
- Comparisons are notes over existing evidence. They do not inspect linked
  files, replay video frames, or validate visual correctness by themselves.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation-coordinate capture tied to temporary image/video previews, or a
dedicated local evidence picker for before/after comparisons. Preserve all
gates. Run checks, update handoff plus Obsidian snapshot/index, and commit
locally.

### 2026-05-07 07:09 EDT - Workbench Video Frame Metadata

Files changed:

- `app/client/src/components/WorkbenchPanel.tsx`
- `app/server/routers/workbench.ts`
- `app/server/cerebroDb.ts`
- `app/server/cerebro-foundations.test.ts`

What changed:

- Added Workbench support for local temporary video evidence records under
  `video_frame`.
- Added metadata fields for `media_kind`, `media_frame_time_sec`, and
  `media_duration_sec` to the idempotent local DB schema and migration guard.
- Updated Workbench create/read/detail flows to preserve image/video metadata
  without saving media bytes.
- Updated the Workbench panel to stage image or video files with object URLs,
  collect optional video frame time, and display media metadata in evidence
  lists and detail.
- Expanded the foundation test to cover metadata-only video-frame evidence.

Checks run:

- `pnpm test -- server/cerebro-foundations.test.ts` from `app/` passed. Vitest
  also ran the colocated server suites selected by the project config:
  4 files, 36 tests.
- `pnpm check` from `app/` passed.

Gates preserved:

- No Notion or Slack writes.
- No browser/search/fetch.
- No external model/tool calls.
- No media capture and no durable media save.
- No desktop overlay process.
- No external repo edits.
- No moving/deleting/archiving files.
- No secrets, installs, payments, deployment, account setup, destructive git,
  or GitHub push.

Known risks:

- This is metadata-only. The Workbench does not yet extract video frames,
  annotate directly on video, or run a vision model.
- The temporary media preview exists only in the browser session. Evidence rows
  intentionally store the file name, MIME type, byte size, media kind, and
  timing metadata, not the bytes.

Next-session starter prompt:

Continue CereBro from the current branch. Read `AGENTS.md` and
`CEREBRO_SESSION_HANDOFF.md` first. Pick the next safe Workbench slice:
annotation-coordinate capture tied to temporary image/video previews, or a
proposal-only before/after comparison record. Preserve all gates. Run checks,
update handoff plus Obsidian snapshot/index, and commit locally.

## Audit Snapshot

### Repo State

The worktree was already dirty before this handoff was created. Existing modified/untracked files include agent Markdown files, Keep scene/UI files, backend harness/router files, PixelLab/CC0 sprite assets, scripts, tests, and planning docs.

Do not revert or delete existing dirty files unless the user explicitly approves.

### Storage Snapshot

- System data volume: 228Gi total, 166Gi used, 32Gi available, 85% capacity.
- Repo size: 825M.
- `app/`: 791M.
- `app/node_modules`: 751M.
- `app/client/public`: 23M.
- `app/client/public/sprites`: 23M.
- `app/client/public/sprites/cc0`: 11M.
- `app/client/public/sprites/cerebro`: 748K.

Conclusion: the repo is not yet the storage problem. Heavy generated media, model weights, render intermediates, and duplicated asset packs are the future risk.

### Hardware Snapshot

- Machine: MacBook Pro.
- Model Identifier: Mac14,7.
- Chip: Apple M2.
- CPU cores: 8 total, 4 performance and 4 efficiency.
- Memory: 8GB.
- macOS: 26.4.1.
- System data volume remains 228Gi total, 166Gi used, 32Gi available, 85% capacity.

Do not record serial numbers or hardware UUIDs in repo docs.

### Model Snapshot

- `ollama` is not currently found on PATH.
- Ollama was not installed or launched in this session.
- No local models were downloaded.
- `CEREBRO_MODEL_ROUTER_BASELINE.md` now records the Session 2 baseline, Ollama install options, escalation policy, and proposed lightweight M2/8GB shortlist.
- Local model setup still requires user approval before installing Ollama or downloading models.
- The model-router baseline now also records the larger reasoning-route target:
  a Model/Tool Capability Registry, a Reasoning Gateway interface, free-tier
  hosted model/tool lanes, a required frontier lane for hard reasoning, and a
  small eval suite before any model/tool becomes a recommended default.
- Candidate routing infrastructure to evaluate later includes LiteLLM,
  OpenRouter, direct provider SDKs, and a small CereBro-native gateway. No
  gateway dependency was installed in this slice.
- Candidate eval tools to evaluate later include promptfoo, DeepEval, and
  custom Vitest fixtures. No eval dependency was installed in this slice.

### File Lifecycle Snapshot

- `CEREBRO_FILE_LIFECYCLE_PLAN.md` is now the Session 3 source for the cleanliness system.
- Current code only has a simple vault output writer: `app/server/integrations/vault.ts` writes approved outputs to `outputs/<session>/<output>`.
- Current DB now has idempotent `artifacts` and `cleanup_candidates` lifecycle tables in `app/server/cerebroDb.ts`.
- Approved output vault writes now record a first-pass `artifacts` metadata row from `app/server/routers/outputs.ts`.
- `app/server/integrations/vault.ts` now exposes the canonical vault layout, including `07_Knowledge/obsidian-vault` for Obsidian.
- `integrations.status` now returns vault, Notion, Obsidian, and vault layout status.
- `app/server/routers/piccolo.ts` now provides a read-only hygiene report for vault setup, Obsidian setup, repo pollution candidates, missing canonical folders, and artifact counts.
- Google Drive vault path is configured in local env as `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault`.
- Obsidian path is configured in local env as `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com/My Drive/CereBro-Vault/07_Knowledge/obsidian-vault`.
- The canonical vault folder tree was created after user approval. No existing files were moved/deleted.
- Existing legacy vault folders `outputs`, `sources`, and `memory` were observed and left untouched.
- Obsidian app setup was verified: `.obsidian/` exists inside the configured Obsidian vault folder with `app.json`, `appearance.json`, `core-plugins.json`, and `workspace.json`.
- Artifact hooks now exist for Notion inbox imports, Notion outbox publishes, memory writes, approved Obsidian note writes, source notes, creative prompts, messages, code/QA handoffs, model tests, temp notes, and cleanup reports.
- UI visibility now exists for artifact status and Piccolo hygiene findings.
- Remaining Session 3 polish was completed enough to move forward: Artifact Library now has clearer approved write controls for Obsidian notes, source notes, creative prompts, message drafts, and cleanup reports; Piccolo Hygiene can save a read-only cleanup report artifact.
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` now records the corrected Session 4 direction.
- Next implementation target: Session 4 Personal Command Center and Project Intelligence. Richer source capture can wait for Surfer/browser work, and creative binary asset manifests can wait for image/video workflows.

### Project Intelligence Snapshot

- GitHub connector can see `Bowgull/sygnalist-brain`, `Bowgull/Waymark`, `Bowgull/Bridgefour`, `Bowgull/Declyne`, and `Bowgull/CereBro`.
- Local checkouts found:
  - `/Users/lindsaybell/Developer/Declyne`
  - `/Users/lindsaybell/Developer/Waymark`
  - `/Users/lindsaybell/Developer/sygnalist-brain`
  - `/Users/lindsaybell/Developer/bridgefour`
  - `/Users/lindsaybell/Desktop/CereBro`
- Local repo state observed read-only:
  - Declyne: `main`, dirty UI files including `ImportCsvButton.tsx`, `SearchSheet.tsx`, `Credit.tsx`, `EditLog.tsx`, `Holdings.tsx`, `Merchants.tsx`, `Onboarding.tsx`, `Review.tsx`.
  - Waymark: `main...origin/main`, clean.
  - Sygnalist: `main...origin/main`, modified `.gitignore`.
  - Bridgefour: `main...origin/main`, untracked `public/assets/resume_saltxc.docx`.
- Declyne should be treated as a market candidate, but not App Store-ready yet. It needs Plaid/bank-connect architecture, UI/UX repair, financial logic validation, privacy/security review, and App Store readiness work.
- Existing Declyne docs show the connect plan completed through Session 108, but a search did not find Plaid implemented or planned in visible local files.
- Tony must treat Declyne as an active dirty worktree and never overwrite local changes without reading them first.
- `app/server/routers/projectIntelligence.ts` now provides the first read-only
  Project Intelligence API surface. It checks whether each known local checkout
  exists, reads `git status --short --branch`, reads the origin remote, and
  returns the static project profile metadata from
  `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- The Keep left rail now has a live `Project Lab` section instead of the
  previous Project Spaces stub.
- `app/client/src/components/ProjectLabPanel.tsx` displays summary counts,
  intake categories, project modes, local paths, git cleanliness, owner/support
  agents, risks, stack tags, and next-action text.
- This is intentionally not a task runner yet. It does not edit external repos,
  create project tasks, pull GitHub data, mutate vault files, or clean anything.
- Batman is now explicitly part of Project Intelligence as the War Room
  strategy/risk layer: project priority, readiness tradeoffs,
  build-vs-package-vs-ship decisions, failure modes, and smallest next move.
- `app/server/routers/commandIntake.ts` now provides the first proposal-only
  command intake API. It classifies user text into the Session 4 intake
  taxonomy, detects the likely project, maps to a project mode, recommends
  agents, and returns permission gates and a next-step suggestion.
- The bottom command bar now submits intake previews on Enter/Preview and shows
  the proposed route above the bar. It does not create tasks, write files,
  browse, edit code, or touch external project repos.
- The clarified product direction now includes a personal OS loop: ask
  Cortana/Aang, route through Cortana, let Surfer open source/browser findings
  when outside information is needed, validate with Batman/Spock/Oak, learn
  through Aang, and save durable outputs only with approval.
- The intake taxonomy now includes `self_improvement` and
  `system_improvement`. Surfer is a key daily-use agent for both: finding
  current sources, useful tools, references, tutorials, GitHub repos, market
  signals, and ways to improve CereBro or the user.
- Modular panels are now a stated UI direction: Project Lab, Surfer
  Source/Browser Panel, Gojo Preview Studio, Aang Learning Path, Piccolo
  Hygiene, and Artifact Library should behave like focused workspaces/windows.
- `app/server/routers/surfer.ts` now provides the first proposal-only Surfer
  source panel API: browser policy, extraction ladder, saved source records from
  the `sources` table, and offline research-preview source cards.
- The Sources nav is now live and opens `SurferSourcesPanel`. It shows browser
  locked/proposal-only status, saved sources, the browser ladder, policy notes,
  and query-based preview cards. It does not browse, fetch, screenshot, save, or
  write yet.
- Surfer Sources now has an approved public URL ingestion lane. Clicking
  `Ingest URL` approves one public HTTP/HTTPS fetch, extracts a small
  title/summary, upserts a `sources` row, and records `source_url` artifact
  metadata. It does not crawl, run open web search, browse privately, log into
  sites, screenshot, or save full page text.
- Surfer source records now carry first-pass metadata fields for
  `source_type`, `trust_level`, `freshness_status`, `content_type`,
  `word_count`, `sensitive_data_flag`, `scrub_notes`, `trust_notes`, and
  `last_scrubbed_at`. Existing DBs are migrated idempotently on startup.
- Approved public URL ingestion now deterministically classifies source type,
  infers trust level from public URL patterns, redacts email/phone/credential-like
  text from the stored summary, flags scrubbed sensitive-looking summaries, and
  records the trust/scrub notes on the `source_url` artifact metadata.
- Surfer Sources now displays saved-source trust, freshness, word-count, and
  scrubbed badges instead of treating all saved URLs as unknown.
- User clarified storage/capture architecture:
  - Obsidian is for durable Markdown knowledge, including approved CereBro
    session handoff snapshots and a session index note.
  - Notion is the structured capture database for raw ideas, links, TikToks,
    Reddit posts, articles, conversation notes, learning seeds, reminders, and
    "save this for later" items.
  - Slack is nonnegotiable in V1 as Hedwig's quick-capture intake lane.
  - iMessage remains a later OpenClaw/macOS-permission investigation and should
    not block Slack capture.
  - Obsidian graph/constellation view is nice if links emerge naturally, but
    the plan should prioritize simple folders, index notes, tags, and backlinks
    rather than optimizing for graph aesthetics.
- The master/project/file-lifecycle plans now explicitly place Slack/Notion
  capture under Hedwig, Obsidian session handoff snapshots under Output/Obsidian
  work, and the modular Terminal Lab under runtime/UX/learning.
- Added a proposal-only Handoff Archive slice:
  - `app/server/routers/handoffs.ts` scans repo Markdown read-only for likely
    session handoff candidates.
  - `handoffs.archivePlan` returns the proposed Obsidian folder/index shape,
    configured Obsidian status, candidate files, excerpts, sizes, modified
    times, and recommended paths.
  - `HandoffArchivePanel` is live from the Keep left rail under `Handoffs`.
  - The panel does not write to Obsidian, Notion, Slack, vault files, or repo
    handoff snapshots. It is proposal/inspection only.
  - Read-only search found the live `CEREBRO_SESSION_HANDOFF.md` as the real
    session handoff candidate; other "handoff" hits are mostly old planning
    references and Claude Code handoff templates, not session closeouts.
- User clarified the stronger use case is not a large "session handoffs in
  CereBro" UI. Session handoff snapshots can live in Obsidian, while CereBro
  should actively learn reusable prompts/tool handoffs: external-model prompts,
  PixelLab prompts, spreadsheet prompts, tool URLs, or workflows that worked
  well. When CereBro suggests reuse, it must say which prompt/tool handoff it is
  reusing or adapting and why.
- The `Handoffs` left-rail item was removed so the app does not over-emphasize
  session handoffs as a primary workspace. The proposal-only backend/panel files
  remain available for a later approved Obsidian snapshot flow, but are no
  longer exposed in the main navigation.
- Command intake previews now include a task draft. The preview card has an
  explicit `Create Task` action that writes one normal CereBro task through the
  existing tasks router and then opens the Tasks panel. It does not start agent
  execution, edit files, browse, or touch external repos.
- Intake-created tasks now link to detected Project Intelligence profiles when
  possible. If the intake detects Declyne, Waymark, Sygnalist, Bridgefour, or
  CereBro, `Create Task` creates/finds the matching harness project row by local
  path and stores the task with `project_id`.
- Tasks now return joined project metadata (`projectName`, `projectPath`) and
  display the project name in the Tasks panel instead of only `Project #id`.
- Project Lab now reads harness task rollups for each profile path. Project
  cards show task counts, linked harness project row id, and the most recent
  tasks for that project.
- Tasks now has project filter chips backed by a `tasks.projects` query. Filters
  show All plus projects that currently have tasks, with active/open task counts.
- Project Lab now has the requested read-only integration slice for known
  projects. `projectIntelligence.overview` aggregates local pending approvals,
  Hedwig proposal counts, Terminal Lab observation status/risk counts, source
  event counts, and recent local approval/source snippets by linked harness
  project row. Approvals are resolved through task links or local target records
  such as command observations, Hedwig captures/proposals, and source events.
- Project Lab cards now show a compact signal quartet for `Pending Approvals`,
  `Hedwig Proposals`, `Terminal Status`, and `Source Events`, plus a separate
  `Safe` next-action line computed from the highest-risk local queue first.
  This remains visibility/proposal-only: no UI command execution, external
  repo edit, Notion write, Slack read/write, browser/search action, or source
  fetch was added.
- Direct smoke test of `projectIntelligence.overview` returned 5 known projects,
  7 local pending approvals, 141 Hedwig proposals, 95 Terminal observations,
  and 13 source events at closeout time. These are local SQLite/libSQL records,
  not external service counts.
- Added the first cross-surface local approval queue:
  - `app/server/routers/approvals.ts` provides a read-only `approvals.list`
    API over existing pending approval-preview rows.
  - The router joins local approval previews back to command observations,
    Hedwig capture/reminder/message proposals, source events, tasks, and
    linked projects when available.
  - It supports local filters for status, origin, project, search query, and
    limit.
  - It classifies preview origin as Hedwig, Terminal, Source, Project Lab, or
    other from existing metadata.
  - It adds deterministic Oak risk preflight notes and Spock shape-check notes
    before approval review. These notes are not validation results and do not
    approve anything.
  - `app/client/src/components/ApprovalDashboardPanel.tsx` is live from the
    Keep left rail as `Approvals`.
  - The panel shows search, origin/status/project filters, local preview cards,
    selected-preview detail, reason/context, and Oak/Spock notes. It has no
    approve/reject/execute/fetch/schedule/send/write controls.
  - `app/server/cerebro-foundations.test.ts` now covers the approval queue for
    both Hedwig source-enrichment previews and Terminal command previews.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm test -- app/server/cerebro-foundations.test.ts` passed. Vitest also
    ran the existing bridge, agents, and auth tests in this workspace, with 30
    tests passing.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Local dev server was already listening on port 3002 under a Node process, so
  no new server process was started. The app is available at
  `http://localhost:3002`.
- Files changed in this slice:
  - `app/server/routers/approvals.ts`
  - `app/server/routers.ts`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
- No Notion, Slack, browser/search, external repo, git, cleanup, or destructive
  action was performed.
- Added the first proposal-only modular Workbench shell:
  - `app/server/routers/workbench.ts` exposes `workbench.plan`.
  - `app/client/src/components/WorkbenchPanel.tsx` is live from the Keep left
    rail as `Workbench`.
  - It defines V1 surfaces for localhost previews, public browser views,
    screenshots, image/video review, annotation canvas, terminal/log output,
    validation notes, and before/after comparison.
  - It defines first-pass permission classes for local preview, public browser,
    media review, annotation, and validation.
  - It defines an append-only evidence record shape with project/task/session,
    owner-agent, target, viewport/coordinate, and validation metadata fields.
  - The panel is planning/read-only. It does not open a browser, iframe,
    screenshot tool, file picker, video tool, or terminal.
- Added the first proposal-only Aang Companion policy shell:
  - `app/server/routers/companion.ts` exposes `companion.policy`.
  - `app/client/src/components/AangCompanionPanel.tsx` is live from the Keep
    left rail as `Aang`.
  - It compares web mock, menu bar helper, and transparent overlay shell paths.
    Web mock remains the recommended first build slice.
  - It defines allowed local events for pending approvals, Terminal Lab status,
    Hedwig review, source saves, task creation, session status, and Piccolo
    storage/cleanup warnings.
  - It explicitly blocks screen reading, private app inspection, Slack
    reads/writes, Notion writes, scheduling, external notifications, command
    execution, browser automation, and repo edits.
  - It includes local mock controls for awake/muted/parked/sleeping state, but
    starts no desktop process and sends no notifications.
- Added tests for both new proposal-only shell plans in
  `app/server/cerebro-foundations.test.ts`.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm test -- app/server/cerebro-foundations.test.ts` passed. Vitest also
    ran the existing bridge, agents, and auth tests in this workspace, with 32
    tests passing.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/server/routers/companion.ts`
  - `app/server/routers.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, media capture, desktop overlay process,
  external repo, git, cleanup, or destructive action was performed.
- Added local append-only Workbench evidence records:
  - `app/server/cerebroDb.ts` now creates `workbench_evidence_records`.
  - Records capture evidence kind, title, summary, optional target URI,
    project/task/session/source/command/artifact links, owner/route agent,
    viewport, coordinates, annotation text, validation status, permission
    class, sensitive flag, and created time.
  - `workbench.evidence` lists local evidence records with project/kind/search
    filters.
  - `workbench.createEvidence` creates one local append-only evidence record.
    It does not capture screenshots, open browser/media tools, run commands,
    write files, or write externally.
  - `WorkbenchPanel` now includes a manual `Add Evidence` form and a recent
    evidence list. This is a local DB history lane only.
- Added live local event counts to the Aang Companion policy shell:
  - `companion.localEvents` reads counts for pending approvals, blocked or
    reviewing Terminal observations, Hedwig captures needing review, source
    events from the last 24 hours, tasks created in the last 24 hours, live
    sessions, and cleanup proposals.
  - `AangCompanionPanel` now shows these counts in a local event strip and
    keeps the same awake/muted/parked/sleeping local mock state.
  - This does not send notifications, start a desktop process, inspect the
    screen, read Slack/Notion, route through browser automation, or execute
    commands.
- Added test coverage for Workbench evidence create/list and Companion local
  event counts.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts` passed with 14
    tests. A broader `pnpm test -- app/server/cerebro-foundations.test.ts` run
    launched adjacent test files and hit an intermittent SQLite `SQLITE_BUSY`
    lock in an existing Hedwig DB write path; the direct target-file run passed.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/workbench.ts`
  - `app/server/routers/companion.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, media capture, desktop overlay process,
  external repo, git, cleanup, command execution, file write outside the repo
  handoff/Obsidian closeout path, or destructive action was performed.
- Added local link pickers and append-only validation notes to Workbench:
  - `workbench.linkOptions` returns recent local saved sources and Terminal Lab
    command observations. It is read-only and does not fetch sources or execute
    commands.
  - The Workbench Add Evidence form now supports linking an evidence record to
    a saved source and/or command observation.
  - `workbench.createValidationNote` appends a new `validation_note` evidence
    record for an existing evidence record. It does not mutate or overwrite the
    original evidence row.
  - Validation notes support Oak or Spock, local statuses
    `needs_review`, `looks_consistent`, `blocked`, and
    `validated_for_local_use`, and a local note body.
  - The Workbench evidence detail inspector now has an Append Validation Note
    control. It creates local history only.
- Added Aang Companion event routing buttons:
  - Aang local event cards now open the matching existing Keep panel:
    Approvals, Terminal Lab, Hedwig Inbox, Sources, Tasks, Automation, or Home.
  - This is in-app navigation only. It does not start a desktop overlay,
    notify, execute, read external services, or write externally.
- Added test coverage for `workbench.linkOptions` and
  `workbench.createValidationNote`.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts` passed with 14
    tests.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/client/src/components/AangCompanionPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external repo, git, cleanup, command execution, file write
  outside the repo handoff/Obsidian closeout path, or destructive action was
  performed.
- Deepened Workbench evidence review:
  - `workbench.evidenceDetail` now returns one local evidence record with joined
    project, task, session, source, command observation, and artifact labels
    where available.
  - The detail endpoint is read-only and does not open linked targets, execute
    commands, fetch sources, capture media, or write externally.
  - `WorkbenchPanel` now has evidence search, kind filter, project filter, and
    reset controls.
  - The Add Evidence form now supports route agent, permission class, viewport,
    coordinates, annotation text, and sensitive flag.
  - Recent evidence rows are selectable and open a detail inspector showing
    owner, route agent, links, target, viewport, coordinates, annotation, and
    gates.
- Added test coverage for `workbench.evidenceDetail` and coordinate/annotation
  metadata.
- Verification run for this slice:
  - `pnpm check` passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts` passed with 14
    tests.
  - `pnpm build` passed. Vite still warns about unset analytics env placeholders
    and large JS chunks; those warnings predate this slice.
  - `curl -I http://localhost:3002` returned `HTTP/1.1 200 OK`.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, media capture, desktop overlay process,
  external repo, git, cleanup, command execution, file write outside the repo
  handoff/Obsidian closeout path, or destructive action was performed.
- Continued the same Session 4 chat with a Project Lab local inspector slice.
  `projectIntelligence.detail` now returns read-only per-project local queue
  rows for pending approvals, Terminal observations, Hedwig captures, reminder
  proposals, message draft proposals, source events, and explicit gates. It
  does not mutate approvals, execute commands, fetch/browse/search, write to
  Notion/Slack, or touch external repos.
- Project Lab cards now include an `Inspect` control that opens an inline Local
  Inspector drawer. The drawer shows bounded local rows for Pending Approvals,
  Terminal Lab, Hedwig, Source Events, and gate text. It is intentionally
  read-only and has no action buttons that approve, run, send, fetch, or write.
- Direct smoke test of `projectIntelligence.detail({ slug: "cerebro" })`
  returned found=true with 7 approvals, 12 Terminal rows, 12 Hedwig captures,
  8 reminders, 8 messages, 12 source events, and 4 gates at closeout time.
- Continued the same Session 4 chat again with Project Lab Local Inspector
  usability polish. The inspector now has queue tabs for Approvals, Terminal,
  Hedwig, Sources, and Gates, plus a read-only detail preview pane for the
  selected row. Selecting rows only changes local UI state; it does not approve,
  execute, fetch, browse/search, send, sync, or write.
- The detail pane exposes local metadata such as approval action/target/reason,
  Terminal command/status/risk/output summary, Hedwig capture/proposal status
  and approval scope, source event trust/sensitivity, and gate text.
- Direct smoke test of `projectIntelligence.detail({ slug: "cerebro" })` after
  the filter/detail polish returned found=true with 9 approvals, 12 Terminal
  rows, 28 combined Hedwig rows, 12 source events, and 4 gates at closeout time.
- Continued the same Session 4 chat with Project Lab project-card view filters.
  The Project Lab header now has local-only filters for All, Attention,
  Approvals, Hedwig, Terminal, and Dirty. These filters only change which known
  project cards are visible in the client; they do not mutate data, approve
  queues, execute commands, browse/search, fetch sources, write externally, or
  touch external repos.
- Direct smoke test of `projectIntelligence.overview` after project-card
  filters returned 5 projects, 4 attention projects, 11 pending approvals, 151
  Hedwig proposals, and 105 Terminal observations at closeout time. These are
  live local SQLite/libSQL records.
- Continued the same Session 4 chat with attention reason badges. When Project
  Lab is in the `Attention` view, each visible project card now shows a `Shown`
  row explaining which local signal brought it into the view: pending
  approvals, Hedwig review needs, blocked/reviewing Terminal observations,
  sensitive source events, or dirty git state. This is explanatory UI only and
  does not mutate queues or trigger actions.
- Continued again with Project Lab filtered-view sorting. Project cards are now
  sorted by the relevant local signal for each view: pending approvals for
  Approvals, Hedwig proposal volume for Hedwig, Terminal observation volume for
  Terminal, dirty file count for Dirty, and a weighted attention score for
  Attention. The header shows the current sort basis. Sorting is client-only UI
  state and performs no queue mutation or external action.
- Continued with Project Lab filtered-view summary polish. The filter header now
  shows how many known projects match the active view and, for filtered views,
  which project is currently top-ranked with its signal score/count. This is
  explanatory UI only and does not affect project data or queue state.
- Continued with Project Lab rank badges. In filtered views, each visible
  project card now shows its rank and current signal score beside the project
  name. This makes the sorted order explain itself locally; it is still
  client-only UI and does not persist ranking or mutate queues.
- Continued with smarter Project Lab inspector defaults. Clicking `Inspect`
  now opens the Local Inspector on the queue that best matches the active
  filter/project signal: Approvals, Terminal, Hedwig, Sources, or Gates. This is
  UI state only; it does not mark rows read, change statuses, approve actions,
  run commands, fetch sources, browse/search, write to Notion/Slack, or edit
  external repos.
- User asked for an Obsidian cleanup check. Read-only audit found three
  root-level clutter files in the configured Obsidian vault:
  `Untitled.canvas` containing `{}`, `Untitled.base` containing only an empty
  table-view stub, and empty `2026-05-06.md`. User approved deletion, and those
  three files were removed. Follow-up scans found no remaining root-level
  files, no `Untitled*` files, and no zero-byte Markdown files.
- Continued with Project Lab Local Inspector readability polish. Detail rows now
  have more vertical room, the selected row title wraps instead of truncating,
  long fields such as approval context span the full detail pane, and the detail
  pane scrolls independently. This is styling/layout only and remains
  read-only.
- Continued with a read-only Git/worktree inspector slice inside Project Lab.
  `projectIntelligence.detail` now returns the same local git status payload
  used by the overview, including branch, upstream/remote, local path, GitHub
  repo name, dirty count, and bounded status rows. This is read-only local
  metadata and does not stage, commit, reset, pull, push, open GitHub, or edit
  external repos.
- Project Lab Local Inspector now has a `Git` tab. The `Dirty` card filter
  opens Inspect directly on that tab, showing a local summary row plus the
  first bounded worktree status rows. Selecting rows only changes local UI
  detail state and performs no git operation or command execution.
- Verification after the Git inspector slice:
  `pnpm check` passed, direct router smoke test for
  `projectIntelligence.detail({ slug: "cerebro" })` returned git dirty=true
  with 94 local status rows at that moment, `pnpm test -- --runInBand` passed
  30 tests on a clean rerun after one transient SQLite lock, and the in-app
  browser verified that the Dirty filter opens the Git tab at
  `http://localhost:3002/`.
- Continued with Project Lab score-breakdown polish. Filtered project cards now
  show a compact `Score` row explaining the local signals behind the current
  rank: pending approvals, Hedwig proposal categories, Terminal blocked/reviewing
  rows, dirty worktree count, or the weighted Attention components. This is
  explanatory UI only; it does not persist priority, change queue state, approve
  anything, execute commands, fetch sources, browse/search, or write externally.
- Verification after score-breakdown polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Attention` view renders visible `Score` text and weighted signal chips.
- Continued with Project Lab signal drill-down polish. The four card signal
  blocks for Pending Approvals, Hedwig Proposals, Terminal Status, and Source
  Events now open the same local Project Lab Inspector directly on the matching
  queue for that project. This is local UI navigation only: it does not approve,
  execute, fetch, browse/search, write to Notion/Slack, mutate queue status, or
  touch external repos.
- Verification after signal drill-down polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  that clicking a Terminal Status signal block opens the Local Inspector on the
  Terminal tab.
- Continued with Project Lab worktree drill-down polish. The Worktree Changes
  preview on dirty project cards now opens the same read-only Local Inspector on
  the `Git` tab for that project. This is local UI navigation only and does not
  stage, commit, reset, pull, push, open GitHub, execute commands, or touch
  external repos.
- Verification after worktree drill-down polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  that clicking Worktree Changes in the Dirty view opens the Git inspector tab
  with local status rows.
- Continued with another Project Lab local drill-down batch. Local Inspector
  list columns now show an explicit `Showing 12 of N local rows` footer when a
  queue has more rows than the visible bounded preview. Recent Approval Queue,
  Source Events, Terminal Observations, and Hedwig Captures rows on project
  cards now also open their matching Local Inspector queue. These are local UI
  navigation affordances only and do not mark rows reviewed, change statuses,
  approve actions, execute commands, fetch sources, browse/search, write to
  Notion/Slack, or touch external repos.
- Verification after the row-cap/recent-row drill-down batch: `pnpm check`
  passed, the first `pnpm test -- --runInBand` hit a transient SQLite lock in an
  existing Hedwig write-heavy test, the clean rerun passed 30 tests, and the
  in-app browser confirmed the capped-row footer plus recent Terminal row
  drill-down into the Terminal inspector queue.
- Continued with Project Lab Local Inspector search. The inspector now has a
  local-only search field for the active queue, filtering row label, text, meta,
  and detail fields in memory. Filtered state is displayed in the queue title
  and count, for example `Git filtered: tony` and `1/11`, plus a match footer.
  Search resets when switching project or queue and does not persist read state,
  mutate queues, approve actions, execute commands, fetch sources, browse/search,
  write to Notion/Slack, or touch external repos.
- Verification after inspector search: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  a Git queue search for `tony` filters to one local worktree row with the
  filtered title, `1/11` count, and match footer.
- Continued with Project Lab Local Inspector type filters. The active queue now
  shows local label/type chips when there is more than one row kind, such as
  Git `M`/`dirty` rows or Hedwig proposal kinds. Type filters combine with text
  search, update the filtered title/count, and can be cleared with a single
  `Reset` control. This remains local UI state only and does not persist read
  state, mutate queues, approve actions, execute commands, fetch sources,
  browse/search, write to Notion/Slack, or touch external repos.
- Verification after inspector type filters: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests on clean rerun after a transient
  SQLite lock, and the in-app browser confirmed Git type chip filtering,
  filtered counts, match footer, and `Reset` clearing back to all Git rows.
- Continued with Project Lab Local Inspector sort controls. The active queue now
  has local-only `Default`, `Type`, and `Text` sort buttons. Sorting combines
  with search and type chips, resets when switching project/queue, and only
  changes client display order. It does not persist state, mutate queue rows,
  approve actions, execute commands, fetch sources, browse/search, write to
  Notion/Slack, or touch external repos.
- Verification after inspector sort controls: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Sort` row and `Text` sort option in the Git inspector.
- Continued with Project Lab Attention Breakdown and Sources filter polish. The
  filter header now shows a local `Signals` strip summarizing the active
  attention drivers across known projects, and `Sources` is now a first-class
  project-card filter. The Sources view sorts by total source event count while
  Attention still weights sensitive source events. This is read-only client UI
  derived from existing overview data and does not fetch sources, browse/search,
  write externally, approve anything, execute commands, or touch external repos.
- Verification after Attention Breakdown/Sources filter polish: `pnpm check`
  passed, `pnpm test -- --runInBand` passed 30 tests, and the in-app browser
  confirmed the `Signals` strip, `Sources` filter, source-event sort label, and
  non-zero Sources score.
- Continued with Project Lab Next Safe Actions strip. The filter header now
  shows the top attention-ranked projects with their deterministic
  `nextSafeAction` text and attention score. Clicking one opens the same
  read-only Local Inspector on the relevant queue for that project. This is
  local UI navigation only and does not start tasks, approve actions, execute
  commands, fetch sources, browse/search, write to Notion/Slack, or touch
  external repos.
- Verification after Next Safe Actions strip: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Next` strip and inspector drill-down.
- Continued with Project Lab summary-count navigation. The top summary counts
  for Dirty, Approvals, Hedwig, Terminal, and Sources now switch the project-card
  view to the matching local filter. This is client-side navigation only and
  does not refetch external data, approve actions, execute commands, fetch
  sources, browse/search, write to Notion/Slack, or touch external repos.
- Verification after summary-count navigation: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  clicking the Terminal summary count switches to the Terminal view.
- Continued with Next Safe Action reason chips. The Project Lab `Next` strip now
  shows compact local attention-reason chips under each top next-safe-action
  project, such as pending approvals, Hedwig review needs, or dirty worktree
  counts. This is explanatory client UI only and does not create tasks, mark
  review state, approve actions, execute commands, fetch sources, browse/search,
  write to Notion/Slack, or touch external repos.
- Verification after Next Safe Action reason chips: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Next` strip shows local reason chips.
- Continued with Project Lab empty-filter state polish. When a local project-card
  filter has no matching projects, the panel now shows a bounded empty state
  with an `All` reset button and current local signal chips instead of a plain
  dead-end message. This is client-side view state only and does not mutate data,
  approve actions, execute commands, fetch sources, browse/search, write to
  Notion/Slack, or touch external repos.
- Verification after empty-filter polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Project Lab still renders the filter surface.
- Continued with Project Lab Missing filter wiring. `Missing` is now a
  first-class project-card filter, the top Missing summary count switches to
  that view, missing-path cards would default to the read-only Git inspector,
  and the current zero-missing state uses the bounded empty-filter panel. This
  is client-side view state only and does not clone, fetch, create repos, mutate
  data, approve actions, execute commands, browse/search, write to Notion/Slack,
  or touch external repos.
- Verification after Missing filter wiring: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Project Lab shows `MISSING 0`, selects the Missing filter, and displays `NO
  MISSING PROJECTS` with the safe reset/signals state.
- Continued with Project Lab summary reset consistency. The top `Local Repos`
  summary count now switches back to the `All` project-card view, matching the
  read-only navigation behavior of Dirty, Missing, Approvals, Hedwig, Terminal,
  and Sources. This is local client navigation only and does not refresh,
  approve, execute, fetch, browse/search, write externally, or touch repos.
- Verification after Local Repos reset wiring: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Missing can show the empty state and `Local Repos` returns to `SHOWING 5 OF 5
  PROJECTS IN REPO ORDER`.
- Continued with Project Lab summary/filter accessibility labels. Summary
  navigation buttons now expose explicit `Show <label> project view` labels,
  project-card filter chips expose `Show <label> projects`, signal chips expose
  `Show <signal> signal projects`, and the active filter chip reports
  `aria-pressed`. This is semantics-only UI polish and does not alter data,
  approval state, execution, fetch/browse/search, external writes, or repos.
- Verification after accessibility-label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the Missing and Local Repos controls are findable by their accessible names
  and the Missing filter reports `aria-pressed="true"` after selection.
- Continued with passive summary and empty-state accessibility labels. Passive
  summary cells such as Mode and Scanned now expose labeled `status` semantics
  and an "Informational only" title, while empty-filter reset/signal controls
  now have explicit accessible names. This is semantics-only UI polish and does
  not alter data, approval state, execution, fetch/browse/search, external
  writes, or repos.
- Verification after passive-summary/empty-state label polish: `pnpm check`
  passed, `pnpm test -- --runInBand` passed 30 tests, and the in-app browser
  confirmed Mode/Scanned status labels, the empty-state `Show all projects`
  reset, and signal-chip accessible names.
- Continued with Project Lab Local Inspector accessibility labels. Inspector
  queue tabs, Hide, Reset, type chips, sort chips, and row-selection buttons now
  expose explicit accessible names, and selectable inspector controls report
  active state with `aria-pressed`. This is semantics-only UI polish and does
  not alter queue data, approval state, execution, fetch/browse/search,
  external writes, or repos.
- Verification after Local Inspector accessibility-label polish: `pnpm check`
  passed, `pnpm test -- --runInBand` passed 30 tests, and the in-app browser
  confirmed the Git queue tab, Text sort control, Hide control, row inspection
  labels, and sort `aria-pressed` state.
- Continued with Project Lab card drill-down accessibility labels. Next Safe
  Action cards, project `Inspect` buttons, signal blocks, recent Terminal rows,
  Hedwig capture rows, approval/source recent rows, and Worktree Changes now
  expose explicit inspect labels. This is semantics-only UI polish and does not
  add actions, approval state, execution, fetch/browse/search, external writes,
  or repo operations.
- Verification after card drill-down label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  accessible labels for Next, project Inspect, signal-block, Worktree Changes,
  and recent-row drill-down controls.
- Continued with Project Lab empty-state reset label cleanup. The empty-filter
  reset button now exposes `Reset to all projects`, distinct from the normal
  `Show All projects` filter chip. This is semantics-only UI polish and does
  not alter data, approval state, execution, fetch/browse/search, external
  writes, or repo operations.
- Verification after empty-state reset label cleanup: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  one `Reset to all projects` empty-state control plus one `Show All projects`
  filter chip.
- Continued with Project Lab close/search accessibility labels. The panel close
  button now exposes `Close Project Lab`, and the Local Inspector search box
  exposes `Search <queue> inspector rows`. This is semantics-only UI polish and
  does not alter data, approval state, execution, fetch/browse/search, external
  writes, or repo operations.
- Verification after close/search label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the `Close Project Lab` button and inspector searchbox label are discoverable.
- Continued with Project Lab close-button HTML hygiene. The top `Close Project
  Lab` button now explicitly sets `type="button"` so it cannot accidentally act
  as a submit button if the panel is ever nested inside a form-like surface.
  This is semantics-only UI polish and does not alter data, approval state,
  execution, fetch/browse/search, external writes, or repo operations.
- Verification after close-button type hygiene: `pnpm check` passed and
  `pnpm test -- --runInBand` passed 30 tests.
- Continued with Project Lab region accessibility labels. The Project Lab panel,
  project cards, Local Inspector, inspector row list, and inspector detail pane
  now expose region/card labels for assistive navigation. This is semantics-only
  UI polish and does not alter data, approval state, execution,
  fetch/browse/search, external writes, or repo operations.
- Verification after region-label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the Project Lab region, project-card labels, Local Inspector region,
  inspector-row region, and inspector-detail region.
- Continued with Project Lab status live-region semantics. The project filter
  summary and Local Inspector row-count text now use polite status semantics so
  local view/count changes can be announced without changing behavior. This is
  semantics-only UI polish and does not alter data, approval state, execution,
  fetch/browse/search, external writes, or repo operations.
- Verification after status live-region polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  two `role="status"` + `aria-live="polite"` elements after opening a Local
  Inspector.
- Continued with Project Lab non-interactive list semantics. Current task rows
  and worktree change rows now expose list/listitem semantics with project-
  specific list labels. This is semantics-only UI polish and does not alter
  data, approval state, execution, fetch/browse/search, external writes, or repo
  operations.
- Verification after list-semantics polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  current-task lists, worktree-change lists, and list items are exposed.
- Continued with Project Lab busy-state semantics. Project Lab and Local
  Inspector regions now expose `aria-busy` based on their local query loading
  state. This is semantics-only UI polish and does not alter data, approval
  state, execution, fetch/browse/search, external writes, or repo operations.
- Verification after busy-state polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  Project Lab and Local Inspector expose `aria-busy="false"` once loaded.
- Continued with Keep left-rail navigation accessibility labels. The canonical
  nav buttons now expose `Open <section>` labels in collapsed icon mode, set
  `aria-current="page"` for the active section, and explicitly use
  `type="button"`. This is navigation semantics only and does not alter panel
  data, approval state, execution, fetch/browse/search, external writes, or repo
  operations.
- Verification after left-rail nav label polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  `Open Project Lab` is discoverable, becomes `aria-current="page"`, and opens
  the Project Lab region.
- Continued with a bundled Keep shell accessibility/HTML hygiene pass. The top
  status/control bar, Demo/Live mode buttons, Skills/Clear/Log/Context controls,
  Activity Log close button, floor selector, command mode buttons, command input,
  disabled Attach, Preview submit, intake-preview Create Task/Dismiss controls,
  context session selectors, and shell landmarks now expose explicit labels,
  button types, pressed/expanded/current state, and region/group semantics where
  appropriate. This is local UI semantics only and does not alter panel data,
  approval state, execution, fetch/browse/search, external writes, or repo
  operations.
- Verification after bundled Keep shell polish: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 30 tests, and the in-app browser confirmed
  the connection status, Demo/Live/Skills/Log/Context controls, Keep sections
  nav, Keep workspace, command bar/mode/input/Attach/Preview controls, floor
  selector, context panel expanded state, Project Lab nav active state, and
  Project Lab region are discoverable by accessible names/states.
- Continued from the latest Session 4 local-only Keep work with a narrow
  Project Lab Draft Actions feedback slice. Creating a local Project Lab action
  draft now invalidates the overview immediately, so Draft counts and card
  signals refresh without waiting for the 10-second poll. The Draft Actions card
  also exposes a polite local status line that says when a local draft is being
  created and confirms the created draft id while explicitly stating that no
  task was created and no repo was edited. This is local UI feedback only and
  does not approve actions, execute commands, browse/search, fetch sources,
  write to Notion/Slack, capture media, start a desktop overlay process, move or
  delete files, or touch external repos.
- Verification after Draft Actions feedback: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 33 tests, and `pnpm build` passed. Vite
  still warns about unset analytics env placeholders and large JS chunks; those
  warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/ProjectLabPanel.tsx`
  - `CEREBRO_SESSION_HANDOFF.md`
- Continued again with a bundled Project Lab Draft Actions feedback-scoping
  pass. Draft creation status is now scoped to the project card that created
  the draft, names the specific local draft action while pending, and no longer
  shows stale created-draft success text on unrelated project cards. Appended
  draft-note feedback is also scoped to the exact draft row that received the
  note, so switching rows no longer implies a note was saved elsewhere. The
  overview still refreshes immediately after draft creation and draft-note
  append. This is local UI feedback only and does not create tasks, approve
  actions, execute commands, browse/search, fetch sources, write to
  Notion/Slack, capture media, start a desktop overlay process, move or delete
  files, or touch external repos.
- Verification after Draft Actions feedback scoping: `pnpm check` passed,
  `pnpm test -- --runInBand` passed 33 tests, and `pnpm build` passed. Vite
  still warns about unset analytics env placeholders and large JS chunks; those
  warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/ProjectLabPanel.tsx`
  - `CEREBRO_SESSION_HANDOFF.md`
- Continued with a Project Lab draft-history correctness slice. Local Project
  Lab action drafts are now counted and shown by `project_slug` even before a
  profile has a linked harness `projects` row. This keeps proposal-only draft
  plans and append-only draft notes visible for profiles such as Waymark or
  Sygnalist before intake-created tasks link them to a project row. This is
  local SQLite/libSQL history only and does not create tasks, approve actions,
  execute commands, browse/search, fetch sources, write to Notion/Slack, capture
  media, start a desktop overlay process, move or delete files, or touch
  external repos.
- Verification after unlinked draft-history visibility: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 16 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/projectIntelligence.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- Continued with a local-only Model Tools visibility slice. The existing
  proposal-only `modelTools` router is now visible from the Keep left rail as
  `Model Tools`.
- `app/client/src/components/ModelToolsPanel.tsx` reads the local model/tool
  policy, lists local capability proposals, filters by provider/capability/eval
  status, shows selected proposal detail, records new local capability
  proposals, records append-only local eval notes, and previews route lanes for
  task kind/modality/privacy/frontier need.
- The panel repeats the safety boundary in UI feedback: local records only. It
  does not call models/tools, install gateways, browse/search/fetch, create
  accounts, touch tokens, start provider setup, download models, or mark
  untested capabilities as defaults.
- `app/client/src/pages/Home.tsx` now adds the `Model Tools` nav item and
  panel route.
- Verification after Model Tools panel slice: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 17 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/ModelToolsPanel.tsx`
  - `app/client/src/pages/Home.tsx`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, command execution, or destructive action was performed.
- Continued with the first global permission-mode substrate slice:
  - `app/server/routers/permissions.ts` now exposes local-only permission
    policy, current mode, history, and mode-change recording.
  - `app/server/cerebroDb.ts` now creates append-only
    `permission_mode_events` records.
  - `app/client/src/components/PermissionModeControl.tsx` adds a Keep header
    mode selector for `Default permissions`, `Auto-review`, and `Full access`.
  - `app/client/src/pages/Home.tsx` renders the global mode selector in the
    primary shell header.
  - Mode changes record local policy state only. They do not approve hard
    gates, execute commands, open browser/media, call external models/tools,
    write to Notion/Slack, install anything, touch tokens/accounts, move/delete
    files, or edit external repos.
- Permission policy now names the hard gates that survive every mode:
  payments, account permission grants, destructive commands,
  deleting/overwriting files, sending messages/emails, publishing, uploading
  private media externally, saving sensitive screenshots to memory, installs,
  tokens/API keys, and sealed Raven/NSFW scope.
- Verification after permission-mode substrate: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/permissions.ts`
  - `app/server/routers.ts`
  - `app/client/src/components/PermissionModeControl.tsx`
  - `app/client/src/pages/Home.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a permission preflight substrate slice:
  - `permissions.preflight` now returns an advisory local decision for a
    proposed perception/action pair under the current global permission mode.
  - It accepts perception class, action class, sensitive-data flag,
    external-target flag, destructive flag, and sensitive-memory persistence
    flag.
  - It returns `allowed_local`, `proposal_only`, `approval_required`, or
    `blocked_by_hard_gate`, plus required approval labels, reasons,
    current-mode effect, hard gates, and a no-action-taken list.
  - This gives Workbench, Approval Queue, Terminal Lab, Hedwig, Model Tools,
    and future media/browser surfaces one shared local policy answer before any
    real action is wired.
- The preflight path is advisory only. It does not approve actions, execute
  commands, open browser/media, call external providers, write to Notion/Slack,
  install anything, touch tokens/accounts, move/delete files, or edit external
  repos.
- Verification after permission preflight substrate: first `pnpm check` caught
  a narrow TypeScript inference issue in `permissions.ts`; fixed locally.
  Rerun `pnpm check` passed. `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests. `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/permissions.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with an append-only permission preflight record slice:
  - `app/server/cerebroDb.ts` now creates local
    `permission_preflight_records` with mode, perception/action class,
    decision, approval-required flag, approval labels, reasons, mode effect,
    sensitive/external/destructive/persistent-memory flags, requesting agent,
    target summary, and created time.
  - `permissions.recordPreflight` appends one local audit record for a proposed
    perception/action pair using the same shared preflight decision logic.
  - `permissions.preflightRecords` reads recent local preflight history with
    decision, perception-class, action-class, and limit filters.
  - `permissions.preflight` remains transient advisory. Surfaces can choose
    when they need an audit record by calling `recordPreflight`.
  - This strengthens the shared permission substrate for Workbench, Terminal
    Lab, Hedwig, Model Tools, Approval Queue, and future browser/media/external
    model surfaces before any real gated action is wired.
- The preflight record path is local audit history only. It does not approve
  actions, execute commands, open browser/media, call external providers, write
  to Notion/Slack, install anything, touch tokens/accounts, move/delete files,
  edit external repos, or run cleanup.
- Verification after append-only preflight records: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/permissions.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with an Approval Queue permission-preflight visibility slice:
  - `app/server/routers/approvals.ts` now exposes
    `approvals.permissionPreflights`, a read-only view over local
    `permission_preflight_records`.
  - The route supports decision, perception-class, action-class, query, and
    limit filters, and returns summary counts for approval-required, blocked,
    and sensitive preflight records.
  - `ApprovalDashboardPanel` now shows a compact Permission Preflights section
    above the approval-preview list. It displays recent local audit records,
    decision badges, perception/action class, sensitivity, and target or gate
    summary.
  - This connects permission evidence to the existing approval-review surface
    before any browser, media, command, external model, cleanup, Slack, Notion,
    or provider action is wired.
- The Approval Queue preflight section is read-only policy evidence. It does
  not approve, reject, execute, fetch, browse/search, capture media, call
  providers, write externally, schedule, send, move/delete files, or mutate the
  source preflight records.
- Verification after Approval Queue preflight visibility: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/approvals.ts`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Workbench evidence permission-link slice:
  - `app/server/cerebroDb.ts` now adds
    `workbench_evidence_records.permission_preflight_id`, with an idempotent
    migration for existing local DBs.
  - `workbench.createEvidence` now appends one local permission preflight audit
    record before inserting the evidence row, then stores that preflight id on
    the evidence record.
  - The preflight is derived from the evidence permission class and sensitive
    flag. Manual local notes are allowed when non-sensitive; sensitive,
    public-browser, and broader media classes record the appropriate gate
    reasons for later review.
  - `workbench.evidenceDetail` now returns the linked permission preflight
    decision, mode, required approvals, and reasons with the evidence detail.
  - `workbench.createValidationNote` preserves the original evidence
    preflight id on appended validation-note records.
- This is local metadata history only. It does not approve actions, execute
  commands, open browser/media, capture screenshots, call external providers,
  write to Notion/Slack, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after Workbench evidence preflight links: `pnpm check` passed,
  `pnpm exec vitest run server/cerebro-foundations.test.ts` passed 18 tests,
  and `pnpm build` passed. Vite still warns about unset analytics env
  placeholders and large JS chunks; those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/workbench.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a shared permission-policy helper slice:
  - Added `app/server/permissionPolicy.ts` as the single local permission
    matrix for modes, perception classes, action classes, hard gates, preflight
    decisions, mode labels/summaries, current-mode reads, and append-only
    preflight record writes.
  - `permissions.preflight` and `permissions.recordPreflight` now use the
    shared helper instead of keeping decision logic inside the router.
  - `workbench.createEvidence` now records its linked permission preflight
    through the same helper, with Workbench-specific context appended as local
    evidence reasons instead of a separate policy copy.
  - This keeps Workbench evidence, Approval Queue visibility, and future
    Terminal/Hedwig/media/browser preflights on one local substrate before any
    gated action is wired.
- This is local policy refactoring only. It does not approve actions, execute
  commands, open browser/media, capture screenshots, call external providers,
  write to Notion/Slack, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after shared permission-policy helper:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/permissionPolicy.ts`
  - `app/server/routers/permissions.ts`
  - `app/server/routers/workbench.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Terminal Lab approval-preflight link slice:
  - `app/server/cerebroDb.ts` now adds
    `approvals.permission_preflight_id`, with an idempotent migration for
    existing local DBs.
  - `terminalLab.createApprovalPreviewFromObservation` now records one local
    command-execution permission preflight through the shared
    `permissionPolicy` helper before staging the pending local approval preview.
  - Terminal approval previews now return the linked preflight id, and the
    read-only Approval Queue carries that id through `approvals.list` and
    `approvals.groups` result rows.
  - The preflight is derived from Terminal observation risk:
    `terminal_logs` perception, `command_execution` action, destructive flag
    for destructive commands, and external-target flag for mutating or external
    command classes.
  - This links command approval metadata to the same local preflight substrate
    already used by Workbench evidence.
- This is local metadata history only. It does not approve actions, execute
  commands, open browser/media, capture screenshots, call external providers,
  write to Notion/Slack, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after Terminal approval preflight links:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/terminalLab.ts`
  - `app/server/routers/approvals.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Hedwig approval-preflight link slice:
  - `hedwig.createApprovalPreviewFromProposal` now records one local permission
    preflight through the shared `permissionPolicy` helper before staging a
    pending local approval preview.
  - Hedwig approval previews now return the linked preflight id, and Hedwig's
    read-only approval preview list carries that id.
  - The existing read-only Approval Queue already carries
    `approval.permission_preflight_id`, so Hedwig approval rows now appear with
    the same linked policy evidence as Terminal Lab approval previews.
  - Source-enrichment previews use `public_browser` perception plus
    `browser_or_media_capture` action with an external-target flag. Slack read
    previews use explicit context plus local-note action with an external-target
    flag. Notion writes, reminder scheduling, and message sends use
    `external_write`.
  - This links Hedwig source/reminder/message approval metadata to the same
    local preflight substrate already used by Workbench evidence and Terminal
    Lab approval previews.
- This is local metadata history only. It does not approve actions, read Slack,
  write to Notion/Slack, browse/search/fetch, schedule reminders, send
  messages, execute commands, open browser/media, capture screenshots, call
  external providers, install anything, touch tokens/accounts, move/delete
  files, edit external repos, or run cleanup.
- Verification after Hedwig approval preflight links:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/hedwig.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a read-only Approval Queue linked-preflight detail slice:
  - `approvals.list` now joins each local approval preview to its linked
    `permission_preflight_records` row when one exists.
  - Approval Queue rows now carry preflight decision, mode, perception/action
    class, required approvals, reasons, and mode effect in the selected-preview
    payload.
  - `ApprovalDashboardPanel` now shows a preflight chip on linked approval
    cards and a selected-preview `Permission Preflight` section with the
    linked decision, permission class pair, required approvals, reasons, and
    mode effect.
  - This makes the policy evidence visible at the exact approval row instead
    of only in the separate recent preflight audit list.
- This is read-only local UI and router detail. It does not approve, reject,
  execute commands, browse/search/fetch, read Slack, write to Notion/Slack,
  schedule reminders, send messages, open browser/media, capture screenshots,
  call external providers, install anything, touch tokens/accounts,
  move/delete files, edit external repos, or run cleanup.
- Verification after Approval Queue linked-preflight detail:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/approvals.ts`
  - `app/client/src/components/ApprovalDashboardPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a Workbench validation-preflight continuity slice:
  - `workbench.createValidationNote` now records a new local permission
    preflight audit row for each appended validation note instead of reusing
    the parent evidence preflight id.
  - Validation-note preflights use the shared `permissionPolicy` helper with
    Workbench-media perception, local-note action, validator-agent ownership,
    sensitive flag carry-through, and local append-only evidence reasons.
  - `WorkbenchPanel` now shows the linked `Permission Preflight` section in the
    evidence detail inspector, including preflight id, mode, decision, required
    approvals, and reasons.
  - Appended validation history rows now display their own linked preflight id
    when one exists.
  - This makes Workbench evidence and Workbench validation notes both carry
    visible local policy evidence at the point of inspection.
- This is local metadata/UI continuity only. It does not approve actions,
  validate external claims, execute commands, browse/search/fetch, read Slack,
  write to Notion/Slack, schedule reminders, send messages, open browser/media,
  capture screenshots, call external providers, install anything, touch
  tokens/accounts, move/delete files, edit external repos, or run cleanup.
- Verification after Workbench validation-preflight continuity:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, git operation,
  cleanup, UI command execution, file move/delete, or destructive action was
  performed.
- Continued with a stabilization and checkpoint pass after the user asked
  whether the large dirty worktree meant CereBro was in danger:
  - Read-only inventory found the repo on `main...origin/main` ahead by 8
    commits with many uncommitted modified/untracked files from prior CereBro
    build sessions.
  - Disk audit showed the repo at 882M, with `app/node_modules` accounting for
    751M. The tracked app/public sprite assets were not the storage problem.
  - A local untracked `.codex/` config folder was visible to Git and contained
    local connector configuration. `.gitignore` now ignores `.codex/` so local
    Codex config cannot be staged accidentally. The folder was not moved,
    deleted, or committed.
  - Staged secret scan after `.codex/` ignore found no staged bearer tokens,
    private keys, GitHub tokens, Slack tokens, or OpenAI-style API keys.
  - Created local checkpoint branch
    `codex/cerebro-stabilization-checkpoint` from the current working state.
  - Committed the current safe repo state as
    `f24c9b1 Checkpoint CereBro stabilization state`.
  - The checkpoint commit captured the intentional CereBro app/docs/assets
    state so future build waves have a recoverable baseline instead of a large
    uncommitted pile.
- Verification before the checkpoint:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
  `git diff --cached --check` flagged whitespace in third-party CC0 asset pack
  metadata files. Those vendor files were left unnormalized to preserve source
  pack provenance.
- Files changed in this slice:
  - `.gitignore`
  - `CEREBRO_SESSION_HANDOFF.md`
- Git actions in this slice:
  - Created branch `codex/cerebro-stabilization-checkpoint`.
  - Created commit `f24c9b1 Checkpoint CereBro stabilization state`.
- No Notion, Slack, browser/search, source fetch, media capture, desktop
  overlay process, external model/tool call, gateway install, provider SDK/API
  key/account setup, model download, external repo edit, push, pull, cleanup,
  UI command execution, file move/delete, or destructive action was performed.
- Continued from the clean checkpoint branch with a temporary image-intake
  Workbench slice:
  - `WorkbenchPanel` now exposes `image_review` evidence and `media_review`
    permission class in the Add Evidence and evidence-filter controls.
  - The panel has a `Temporary Image` intake area with drag/drop and file picker
    for local images.
  - Selected images are previewed with a browser-memory object URL only. The
    preview shows filename, MIME type, byte size, and temporary status.
  - Choosing an image fills an image-review evidence draft with a
    `temporary-image:<filename>` target and metadata summary.
  - Saving still creates only a local append-only evidence metadata row. It
    does not save image bytes, write to the vault, upload externally, call a
    vision model, browse, fetch, capture screenshots, or open a media tool.
  - `workbench.plan` now marks image/video review as `partially_live` and
    records temporary image metadata fields.
  - Foundation tests now cover the temporary image-review evidence path and
    media-review permission class.
- Verification after temporary image-intake slice:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/routers/workbench.ts`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, durable media save, media
  capture, desktop overlay process, external model/tool call, vision call,
  gateway install, provider SDK/API key/account setup, model download,
  external repo edit, push, pull, cleanup, UI command execution, file
  move/delete, or destructive action was performed.
- Continued in the same Workbench image lane with structured temporary media
  metadata:
  - `workbench_evidence_records` now has idempotent local DB columns for
    `media_name`, `media_mime_type`, `media_byte_size`, and
    `media_temporary_flag`.
  - `workbench.createEvidence`, `workbench.evidence`,
    `workbench.evidenceGroups`, and `workbench.evidenceDetail` now carry these
    media metadata fields.
  - Workbench evidence search now also matches media name and MIME type.
  - Temporary image intake now sends structured metadata when creating an
    `image_review` evidence row.
  - The recent evidence list marks rows with media metadata and temporary-media
    status.
  - The evidence detail inspector now shows media name, media type, media size,
    and whether the record represents temporary browser preview only.
  - Foundation tests now cover persisted temporary image metadata on
    `image_review` evidence rows.
- This is local metadata only. It does not save image bytes, write to the
  vault, upload externally, call a vision model, run OCR, browse/search/fetch,
  capture screenshots, open a media tool, or approve any future durable-save
  action.
- Verification after structured temporary media metadata:
  `pnpm check` passed, `pnpm exec vitest run
  server/cerebro-foundations.test.ts` passed 18 tests, and `pnpm build` passed.
  Vite still warns about unset analytics env placeholders and large JS chunks;
  those warnings predate this slice.
- Files changed in this slice:
  - `app/server/cerebroDb.ts`
  - `app/server/routers/workbench.ts`
  - `app/client/src/components/WorkbenchPanel.tsx`
  - `app/server/cerebro-foundations.test.ts`
  - `CEREBRO_SESSION_HANDOFF.md`
- No Notion, Slack, browser/search, source fetch, durable media save, media
  capture, desktop overlay process, external model/tool call, vision/OCR call,
  gateway install, provider SDK/API key/account setup, model download,
  external repo edit, push, pull, cleanup, UI command execution, file
  move/delete, or destructive action was performed.

### Model Router Snapshot

- `app/server/agentRouter.ts` already routes agents by model class rather than hardcoded provider model names.
- `app/server/cerebroDb.ts` already defines `model_registry`, including model class, provider, location, estimated RAM/disk, privacy/cost notes, hardware notes, and tested-on-device status.
- `CEREBRO_MASTER_BUILD_PLAN.md` now treats model/tool routing as a major
  product capability. CereBro should learn which local models, hosted frontier
  models, free-tier hosted models, and specialty AI tools work for each job.
- `CEREBRO_MODEL_ROUTER_BASELINE.md` now defines the target fields for an
  expanded Model/Tool Capability Registry: provider, model/tool, access method,
  account/API key needs, free tier, rate limits, cost, modality support,
  strengths, weak spots, prompt style, privacy class, eval scores, failure
  notes, fallback suggestions, and source URLs.
- The planned Reasoning Gateway should expose `routeForTask`,
  `recordModelCall`, and `recordModelEval` style behavior. The first
  implementation may be CereBro-native, LiteLLM-backed, OpenRouter-backed, or a
  staged hybrid after dependency/security review.
- Surfer owns current model/tool discovery with sources. Cortana owns routing
  proposals. Batman owns risk review. Spock/Oak own validation. Piccolo owns
  stale registry, cost, rate-limit, and storage hygiene.
- Reddit is now a named V1 source lane in the master plan:
  - Surfer owns Reddit watchlists, search/post/comment capture, trend radar,
    media references, links, and community disagreement tracking.
  - Hedwig owns quick "save this Reddit item" capture from Slack/Notion/browser
    share/manual paste into the Source Library review queue.
  - Oak/Spock validate important Reddit-derived claims before durable memory or
    action.
  - Piccolo keeps Reddit media link-first by default, with approved local copies
    routed to the vault and source URLs/rights notes retained.
  - Boundaries are explicit: no block bypass, proxy scraping, deleted/private
    content harvesting, automatic reposting, or model training/fine-tuning on
    Reddit content.
- First local scaffold is now implemented: `model_tool_capabilities`,
  `model_tool_evals`, and `model_tool_call_logs` tables plus
  `modelTools.policy`, `modelTools.capabilities`, `modelTools.proposeCapability`,
  `modelTools.recordEval`, `modelTools.evals`, and `modelTools.routePreview`.
  These routes are local/proposal-only and do not call or verify external
  providers.
- Proposed local classes for initial testing:
  - `embedding`: `all-minilm:22m`
  - `lightweight_formatter`: `qwen3:0.6b`, `gemma3:1b`
  - `local_summary`: `gemma3:1b`, `llama3.2:1b`
  - `local_reasoner` / `local_code_helper` trial: `qwen3:1.7b`, optional `llama3.2:3b` stretch
- None of these candidates are marked tested.

## Storage And Safety Rules

- Generated assets and deliverables should default to a Google Drive synced CereBro vault once `CEREBRO_VAULT_DIR` is configured.
- Turso/libSQL cloud should become the canonical structured brain once configured.
- Local SQLite stores structured metadata as a development cache and fallback.
- Cloud vector retrieval should become the canonical RAG index once selected.
- Obsidian stores durable Markdown knowledge. It can feed retrieval, but it is not the vector database or the model brain.
- Notion stores polished learning/client outputs after approval.
- Local storage is for active work, cache, dev fallback, and explicitly approved local model experiments.
- Repo folders should not become the default destination for generated images, videos, renders, or client deliverables.
- Cleanliness is a first-class requirement, not a later cosmetic pass. Every workspace, message, image, video, code artifact, source, note, and temp file needs an owner, destination, metadata trail, retention rule, and cleanup path.
- The detailed design for that requirement lives in `CEREBRO_FILE_LIFECYCLE_PLAN.md`.
- Obsidian does not increase Mac storage or local model capacity. It is the durable Markdown knowledge layer. Storage safety comes from routing files into the vault, tracking metadata, and letting Piccolo enforce cleanup workflows.
- Piccolo's default authority is scan/report/dedupe/archive proposal/temp cleanup proposal/storage pressure warning. Destructive deletion remains approval-gated.
- Hedwig owns message/reminder hygiene once implemented: drafts, sent items, follow-ups, archived communications, and future Slack/email bridge records should stay attached to the right project/client/context.
- No destructive cleanup without explicit user approval.
- Piccolo may only identify cleanup candidates until cleanup rules are implemented and approved.

## Every-Session Closeout Protocol

At the end of every session, update this file with:

- What changed.
- Files touched.
- Tests/checks run.
- Known bugs or risks.
- Storage impact.
- Next recommended session.
- Next-session starter prompt.
- Then save a unique timestamped Obsidian snapshot to:
  `90_Archive/CereBro Session History/snapshots/<YYYY-MM-DD HHMM CereBro Session Handoff - short-slice-name>.md`.
- Never overwrite a prior handoff snapshot.
- Then append a new link to the Obsidian index:
  `90_Archive/CereBro Session History/CereBro Session History.md`.
- Never replace a prior index entry.

This append-only Obsidian session history is now user-approved standing
behavior for every CereBro build session.

Also run:

- `git status --short`
- relevant tests/checks for touched code
- storage impact check if assets/dependencies changed

## Cleanup Candidates

No cleanup is approved yet.

Candidates to review later:

- `app/node_modules` is large but expected and should not be deleted unless reinstalling dependencies is acceptable.
- Staged CC0 sprite packs may grow over time; review before adding more.
- Generated render/media/model directories should live outside the repo once the Drive vault is configured.
- Temp files and preview renders need Piccolo cleanup rules before automated cleanup.

## What Was Done This Session

- Created `CEREBRO_MASTER_BUILD_PLAN.md`.
- Created this handoff file.
- Captured repo/storage/hardware/model audit facts.
- Locked Session 1 closeout protocol.
- Updated `AGENTS.md` to point future agents at the master plan and handoff, and to record Hedwig as the eleventh scoped Messenger/Comms agent in the Crypts with Piccolo.
- Continued Session 2 by confirming the current Mac/Ollama baseline.
- Verified Ollama macOS install options from official/current sources.
- Created a safe local model shortlist for M2/8GB without installing or downloading anything.
- Recorded that all proposed models remain untested until user approval.
- Integrated the user's cleanliness requirement into the existing master plan rather than starting a new plan: Session 3 file lifecycle, Session 7 output hygiene, Session 8 Piccolo/Hedwig operations, and Session 10 creative asset lifecycle now explicitly cover workspace/file/message cleanup.
- Created `CEREBRO_FILE_LIFECYCLE_PLAN.md` as the Session 3 source for the cleanliness system.
- Created `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` as the corrected Session 4 source for personal command center and project intelligence.
- Added idempotent `artifacts` and `cleanup_candidates` tables.
- Updated approved output vault writes to create artifact metadata rows.
- Added canonical vault layout helpers and Obsidian status detection.
- Added a read-only Piccolo hygiene report router.
- Registered Piccolo in the app router.
- Added tests for the canonical vault layout and honest unconfigured Obsidian status.
- Confirmed existing Google Drive Desktop mount and existing `CereBro-Vault` path.
- Created the approved canonical vault folder tree inside Google Drive, including `07_Knowledge/obsidian-vault`.
- Added `CEREBRO_OBSIDIAN_DIR` to local env and documented it in `app/.env.example`.
- Left existing legacy vault `outputs`, `sources`, and `memory` folders in place.
- Verified that the user opened the configured folder as an Obsidian vault.
- Added artifact metadata recording for Notion inbox imports (`source_note`) and Notion outbox publishes (`notion_page`).
- Added artifact metadata recording for approved memory writes (`memory_note`).
- Added approved Obsidian Markdown note writer (`memory.writeToObsidian`) with artifact metadata (`obsidian_note`).
- Added test coverage for Obsidian note writing using a temporary local test folder.
- Added general approved `artifacts` router for metadata-only external records and vault text writes.
- Added vault text writer preserving canonical folder names.
- Added test coverage for vault text artifact writes using a temporary local test folder.
- Added `ArtifactsPanel` and `PiccoloPanel` to the Keep UI.
- Wired Outputs nav to the live Artifact Library and Automation nav to Piccolo Hygiene.
- Fixed narrow in-app browser layout clipping: left rail collapses to icons, header status text hides on narrow widths, Artifact Library filters wrap, artifact rows stack, and disabled command-bar buttons hide when space is tight.
- Added first approved user-facing artifact write control in Artifact Library.
- Created the first tracked Obsidian note, `indexes/cerebro-home.md`, through the approved `memory.writeToObsidian` path.
- Changed the artifact body field to a textarea after the first single-line input flattened Markdown; re-saved the note with clean Markdown.
- Added artifact supersession: new artifact writes now mark older active/review/published rows with the same storage provider/path as `superseded`.
- Piccolo Hygiene now reports repeated artifact storage paths as informational audit history.
- Re-saved `indexes/cerebro-home.md` once more to verify supersession; current row is `published`, older rows are `superseded`.
- Started the dev server for preview; port 3000 was busy, so the app is running on `http://localhost:3003/`.
- Chose to finish remaining Session 3 polish before moving to Session 4 because the freelance workspace will need these save/report surfaces immediately.
- Updated Artifact Library write controls with clearer per-kind labels, default owner agents, optional source/context URI, Obsidian subfolder input, and save feedback.
- Added Piccolo Hygiene `Save Report` control that writes the current read-only scan as a tracked `cleanup_report` vault artifact. The saved report states that no files were moved, archived, or deleted.
- Confirmed the preview server is still listening on `http://localhost:3003/`.
- Re-read plan files after user clarified that CereBro should support everyday life, personal projects, portfolio, freelance, learning, creative work, and messages.
- Confirmed the older architecture already defines CereBro as a personal AI operating system / command center with project spaces, memory, tools, validation, learning, creative workflows, and cleanup.
- Identified the mismatch: the latest master plan had narrowed Session 4 to "Freelance Builder Workspace."
- Updated `CEREBRO_MASTER_BUILD_PLAN.md` so Session 4 is now "Personal Command Center And Project Intelligence."
- Added `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` with access model, intake taxonomy, project modes, initial project profiles, agent logic changes, and Session 4 target.
- Added the read-only `projectIntelligence` tRPC router.
- Wired the router into the app router.
- Added the Project Lab panel to the Keep UI.
- Replaced the `Project Spaces` nav stub with live `Project Lab`.
- Verified the implementation with TypeScript and Vitest.
- Added Batman to `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` agent logic.
- Updated Project Lab project profiles so Batman appears as strategic support
  across Declyne, Waymark, Sygnalist, Bridgefour, and CereBro.
- Tightened Batman's app router role around strategic review, risk sequencing,
  market/readiness calls, and build-vs-package-vs-ship decisions.
- Added the proposal-only `commandIntake` tRPC router.
- Wired command intake into the bottom command bar as a route preview.
- The command intake preview now shows category, project, mode, suggested
  agents, and the first permission gate.
- Added the personal OS/self-improvement loop and modular panel model to
  `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- Expanded Surfer's planned role around daily web questions, source/browser
  panels, extraction/scrubbing, previews, and self/system improvement.
- Updated command intake to classify `self_improvement` and
  `system_improvement`, and to route current-web questions such as "best",
  "latest", "right now", "google", "reddit", and "youtube" toward Surfer.
- Updated the Project Lab intake taxonomy display with the new categories.
- Added the proposal-only `surfer` tRPC router.
- Added `SurferSourcesPanel` and wired Sources nav to it.
- Sources nav is no longer a stub; it is the first modular Surfer workspace.
- Added approved public URL ingestion to the Surfer router and panel.
- Added approved intake-preview-to-task creation in the command bar flow.
- Added project name/path metadata to command intake task drafts.
- Updated the tasks router so task creation can create/find a project by local
  path and attach `project_id`.
- Tasks router now joins project metadata for task lists and mutation returns.
- Tasks panel now shows the linked project name, with the project path in the
  tooltip.
- Added task rollups to `projectIntelligence.overview`.
- Project Lab cards now display linked project row, active/open task counts, and
  recent task titles.
- Added `tasks.projects` query for task-backed project filter metadata.
- Added project filter chips to `TasksPanel`.
- Added first-pass Surfer source metadata persistence: source type, trust level,
  freshness, content type, word count, scrub notes, trust notes, and sensitive
  data flag.
- Added deterministic approved-URL scrubbing/trust classification in Surfer
  ingestion and surfaced the metadata in the Surfer Sources panel.
- Updated build-route docs to lock the agreed Slack/Notion/Obsidian capture
  architecture and modular Terminal Lab placement.
- Updated `AGENTS.md` so future sessions see Slack as required V1 intake,
  Notion as capture database, Obsidian as durable knowledge/session history,
  and Terminal Lab as a learning/validation surface.
- Added proposal-only `handoffs` tRPC router.
- Added `HandoffArchivePanel` for proposal-only use, then removed the live
  `Handoffs` left-rail nav item after user clarified this should not become a
  big UI surface.
- Added `message_capture`, `session_handoff`, `reusable_prompt`,
  `tool_handoff`, and `external_model_handoff` to artifact kind surfaces.
- Updated plans and `AGENTS.md` so reusable prompts/tool handoffs are treated as
  a CereBro learning/memory feature with explicit provenance and approval
  language.
- Added `prompt_reuse` to the intake taxonomy and deterministic command-intake
  routing for requests like "that Excel prompt", "PixelLab prompt", "DeepSeek
  prompt", or "reuse prompt".
- Reusable prompt/tool handoff implementation slice:
  - Artifact Library can now explicitly save `reusable_prompt`, `tool_handoff`,
    and `external_model_handoff` vault text artifacts.
  - These save into the configured vault under `08_System/manifests/prompts`,
    `08_System/manifests/tool-handoffs`, and
    `08_System/manifests/external-model-handoffs` after the user clicks Save.
  - Added `promptHandoffs.search`, a read-only tRPC route that searches saved
    prompt/tool handoff artifact metadata and returns suggested matches with
    required disclosure copy.
  - This does not call external tools/models and does not write to
    Obsidian/Notion/Slack.
- Continued the reusable prompt/tool handoff slice:
  - `commandIntake.preview` now performs a read-only prompt handoff search when
    the request is classified as `prompt_reuse`.
  - The command intake preview card now surfaces the top reusable-memory
    suggestions with the required "which prompt / why / what approval" reuse
    disclosure.
  - Approved prompt/tool artifact saves now store a bounded body excerpt in
    artifact metadata (`prompt_or_instruction`) so future searches can match
    more than title/path/source metadata.
  - This remains proposal-only: no external tool/model calls and no
    Obsidian/Notion/Slack writes.
- Added the proposal-only Hedwig Capture Inbox slice:
  - New `app/server/routers/hedwig.ts` exposes `hedwig.capturePlan` with the
    proposed Notion capture database schema, Slack DM/capture-channel shape,
    minimum scope notes, approval gates, and routing rules.
  - New `hedwig.previewCapture` classifies pasted capture text locally and
    returns the proposed Notion row without writing to Notion, reading Slack,
    posting Slack, or creating tasks.
  - New `HedwigInboxPanel` is wired to the Keep `Inbox` nav. It shows the
    Notion capture DB proposal, Slack shape, approval gates, routing rules, and
    a local capture preview form.
  - The recommended Slack V1 shape is both a Hedwig DM and one explicit capture
    channel, with strict approved-surface scope.
  - This does not write to Obsidian, Notion, Slack, vault files, or external
    repos.
- Added first-pass Notion capture status plumbing:
  - `getNotionStatus` now reports `hasCapture` and `captureDatabaseId` from
    `NOTION_CAPTURE_DATABASE_ID`.
  - `app/.env.example` documents `NOTION_CAPTURE_DATABASE_ID` as approval-gated
    and not to be set until the schema/workspace target are approved.
- Added the first Hedwig-as-agent/Keep slice:
  - `app/server/agentRouter.ts` now treats the V1 roster as 11 agents and adds
    Hedwig as the Crypts `Messenger Roost` capture/messaging agent.
  - Hedwig has approval-gated Slack/Notion tool scopes:
    `read_slack_capture`, `write_slack`, and `write_notion`.
  - `app/client/src/lib/keepConfig.ts` now includes Hedwig in the `AgentId`
    union and `CHAMBERS`.
  - `KeepScene` now splits the Crypts into Piccolo's hygiene chamber and
    Hedwig's Messenger Roost, adds Hedwig motion config, prop placements,
    use-spots, council spot, and path-graph node/edge data.
  - Added a small placeholder messenger owl SVG under
    `app/client/public/sprites/keep/hedwig/rotations/south.svg`; this is
    explicitly a placeholder until the final PixelLab owl rotation pass.
- Added first runtime use-spot/facing movement in `KeepScene`:
  - The scene now loads directional agent textures (`south`, `east`, `west`,
    `north`) for every chamber agent.
  - Chamber grid origins are tracked so `CHAMBER_USE_SPOTS` can drive actual
    idle and hero/work positions instead of remaining inert metadata.
  - Active agents now face their configured hero/work spot; idle agents face
    their idle spot.
  - `walking-to-ceremony` and `council-seated` states now move agents to their
    configured Cortana council seats, with front/back depth differences and
    facing changes.
  - Floating state emotes now follow moving sprites during tweens.
  - Added placeholder Hedwig `east`, `west`, and `north` SVG rotations to match
    the runtime directional loader.
- Replaced the Hedwig placeholder sprite with a first PixelLab static asset:
  - PixelLab object id: `1cea6825-714b-44bf-adea-0c50cf902391`.
  - Saved the original generated 92x92 transparent PNG as
    `app/client/public/sprites/keep/hedwig/rotations/south_pixellab_full.png`.
  - Repacked the live `south.png`, `east.png`, `west.png`, and `north.png`
    sprites onto 92x92 transparent canvases with an approximately 30x41 visible
    bird trim so Hedwig reads as a messenger owl rather than a full-height
    character.
  - Generated temporary PNG derivatives for `east`, `west`, and `north` so the
    runtime directional loader can stay PNG-based.
  - Updated Hedwig's `spritePath` from SVG to PNG and updated
    `app/client/public/sprites/keep/hedwig/metadata.json` with the PixelLab
    object id.
  - Removed the earlier SVG placeholder rotations.
  - Queued PixelLab object animation `idle-flutter`, animation id
    `f9603efc-be76-4f97-aa2d-d31be88ef5f5`; PixelLab later reported it
    completed with 9 frames.
  - The available MCP/download endpoint still returned only the static PNG, and
    guessed animation-frame download endpoints returned 404. Local animation
    frames are not downloaded/wired yet.
  - Checked for obvious `PIXEL*` env variable names in repo env files/current
    shell with values redacted; none were present. PixelLab is callable through
    the plugin/app layer. Do not store raw PixelLab API keys in repo docs,
    memory, or settings.
- Upgraded the first Keep pathing slice from inert graph data to runtime
  council walking:
  - Corrected `PATH_NODES` for the current 62-column side-cutaway castle
    geometry.
  - Added a small BFS path finder over `PATH_EDGES`.
  - Added graph-node movement with facing-frame swaps for
    `walking-to-ceremony`.
  - Council movement now routes from each agent's chamber node through the
    static path graph to Cortana's hub before settling into the assigned
    council seat. `council-seated` still uses the short settle tween.
  - This is still a first runtime pass, not full collision/path polish.
- Added the proposal-only Terminal Lab thin slice:
  - New `app/server/routers/terminalLab.ts` exposes `terminalLab.plan` and
    `terminalLab.previewCommand`.
  - `previewCommand` classifies commands as `read_only`,
    `mutating_or_external`, `destructive`, or `unknown`, recommends an owner
    agent, explains the risk, and returns approval gates.
  - The router never executes commands and always reports
    `wouldExecute: false`.
  - New `TerminalLabPanel` is wired into the Keep left rail as `Terminal Lab`.
    It shows command policy, future surfaces, and a local command-preview form.
  - Added test coverage proving read-only and destructive command previews do
    not execute. Fixed an early substring bug where "Terminal" matched `rm` by
    tightening write detection to command tokens/phrases.
  - This does not persist command/output history yet and does not run shell
    commands from the UI.
- Extended Terminal Lab with local command-observation persistence:
  - Added an idempotent `command_observations` table in
    `app/server/cerebroDb.ts` with project/task/session links, command, cwd,
    risk, suggested agent, explanation, gates, source, status, exit code, and
    output summary fields.
  - `terminalLab.previewCommand` now records each preview as a local
    `previewed` observation and returns `observationId`.
  - Added `terminalLab.observations` to list recent observations, filterable by
    project/task/session.
  - `TerminalLabPanel` now shows recent local observations and saved preview
    ids.
  - This still does not run commands, capture stdout/stderr, or add a PTY
    bridge.
- Continued the Session 4 connective layer:
  - `terminalLab.previewCommand` now infers and links the known project from
    `cwd` when possible, so Project Lab can see local command observations for
    CereBro, Declyne, Waymark, Sygnalist, and Bridgefour.
  - Terminal Lab policy copy now reflects the current truth: preview
    observations are locally persisted, but stdout/stderr capture and UI
    execution are not live.
  - Added an idempotent `capture_observations` table for local Hedwig capture
    previews with project/task/session links, raw text, capture type, priority,
    source URI/label, project guess, sensitivity flag, and proposed Notion row.
  - `hedwig.previewCapture` now persists each local preview, returns the saved
    observation id, and links known project guesses to harness project rows.
  - Added `hedwig.observations` and surfaced recent local capture previews in
    `HedwigInboxPanel`.
  - Project Lab now shows local Terminal and Hedwig observation counts plus
    recent command/capture snippets per linked project.
  - Keep pathing got a small runtime stability polish: `KeepScene` now avoids
    reapplying motion/tweens when an agent's state has not changed, so repeated
    state refreshes do not restart council walking mid-route.
  - Still no Obsidian, Notion, Slack, vault, external repo, browser, or shell
    execution writes were added.
- Continued with two more local-only operations slices:
  - Added `hedwig.triageObservation`, a read-only route that loads one saved
    capture preview and proposes a route: task, source, learning, reminder, or
    message.
  - Hedwig triage returns rationale, support agents, task/source/reminder/message
    drafts, proposed status, and approval gates. It does not mutate the capture
    row and does not write to Notion, Slack, Tasks, Sources, or the vault.
  - `HedwigInboxPanel` now has a `Triage` action for local capture previews and
    displays the route proposal plus gates.
- Added `terminalLab.observeOutput`, a local mutation that attaches a
    redacted output summary and optional exit code to an existing command
    observation. It does not execute commands.
  - `TerminalLabPanel` now lets the user select a local observation and paste
    observed output. The saved summary redacts email addresses and simple
    token/secret/password/API-key assignments.
  - Terminal Lab surfaces/policy copy now reflect manual observed-output
    summaries as local persistence, while keeping UI execution disabled.
- Extended Terminal Lab with task/session linkage and follow-up suggestions:
  - Added `terminalLab.linkObservation`, a local-only mutation that attaches an
    existing command observation to a selected task and/or session and infers
    the project link from the task/session when available.
  - `TerminalLabPanel` now loads current tasks and recent sessions, lets new
    command previews attach to the selected task/session, and lets existing
    observations be relinked with `Link Selected`.
  - Saved command observations now return deterministic Aang/Tony follow-up
    suggestions. Aang explains commands, failures, or observed evidence; Tony
    proposes the next read-only diagnostic or project step.
  - This is still proposal-only. It does not execute commands, create shells,
    edit files, write to external repos, browse, or call Notion/Slack.
- Added a second Terminal Lab local action:
  - New `terminalLab.createTaskFromObservation` creates a normal local CereBro
    task from a saved command observation and links the observation back to that
    task.
  - It assigns Tony for failed/error-like observations and Aang for simple
    read-only explanation follow-ups.
  - `TerminalLabPanel` now shows `Create Task` on observations that are not
    already task-linked.
  - This is a local SQLite/libSQL harness write only. It does not execute the
    command, create a shell, edit files, write to external repos, browse, or
    call Notion/Slack.
- Added the first Hedwig local source action:
  - New `hedwig.saveSourceFromObservation` creates or updates a local `sources`
    row from a saved capture observation with a source URL.
  - The saved source is explicitly marked `source_type = hedwig_capture`,
    `trust_level = unknown`, and `freshness_status = unfetched` because no
    browse/fetch/extraction is performed.
  - The capture observation is marked `sourced`, a `source_url` artifact is
    recorded for lifecycle/provenance, and Surfer Sources can display the saved
    URL through the existing saved-source panel.
  - `HedwigInboxPanel` now shows `Save Source` in the triage proposal when a
    capture includes a source URL.
  - This is a local SQLite/libSQL metadata write only. It does not fetch the
    page, browse, write to Notion/Slack, write vault files, or validate claims.
- Added the first Hedwig local reminder proposal action:
  - Added an idempotent `reminder_proposals` table in
    `app/server/cerebroDb.ts` for local reminder proposals linked to projects,
    tasks, sessions, and capture observations.
  - New `hedwig.createReminderProposalFromObservation` creates a local reminder
    proposal from a reminder-like capture, preserving the timing hint and raw
    capture text.
  - New `hedwig.reminderProposals` lists recent local proposals.
  - `HedwigInboxPanel` now shows `Create Reminder Proposal` for reminder triage
    results and a compact local Reminder Proposals list.
  - This is a local SQLite/libSQL metadata write only. It does not schedule,
    notify, post to Slack, write to Notion/calendar, or create any external
    reminder.
- Added the first Hedwig local message draft proposal action:
  - Added an idempotent `message_draft_proposals` table in
    `app/server/cerebroDb.ts` for local draft proposals linked to projects,
    tasks, sessions, and capture observations.
  - New `hedwig.createMessageDraftProposalFromObservation` creates a local
    message draft proposal from a message-like capture, preserving raw capture
    text, draft intent, and a light recipient hint when available.
  - New `hedwig.messageDraftProposals` lists recent local draft proposals.
  - `HedwigInboxPanel` now shows `Create Message Draft` for message triage
    results and a compact local Message Drafts list.
  - This is a local SQLite/libSQL metadata write only. It does not send, post
    to Slack, email, write to Notion, write to the vault, or contact any
    external messaging surface.
- Added Terminal Lab task/session filtered observation views:
  - `TerminalLabPanel` now has `All`, `Task`, and `Session` scope controls for
    recent command observations.
  - The Task and Session scopes use the selected task/session link already used
    for new previews and relinking.
  - This is UI/query filtering over existing local harness rows only. It does
    not execute commands, mutate observations, or write externally.
- Added Terminal Lab learning-note proposal staging:
  - New `terminalLab.createLearningProposalFromObservation` stages a pending
    `memory_proposals` row from a saved command observation.
  - The proposal is owned by Aang, tagged `terminal_lab,aang,learning_note`,
    linked to the observation via `source = terminal_observation:<id>`, and
    includes command, cwd, risk, explanation, observed output summary, and exit
    code when available.
  - `TerminalLabPanel` now shows `Stage Learning Note` on observations.
  - This is a local pending memory proposal only. It does not write durable
    memory, Obsidian, Notion, Slack, vault files, or external tools; Oak/user
    approval is still required before durable memory write.
- Added richer Tony diagnostic drafts in Terminal Lab:
  - Saved command observations now include deterministic `diagnosticDrafts`
    alongside Aang/Tony follow-up suggestions.
  - Current drafts propose narrow read-only commands for common observed-output
    shapes: missing file/path, permission denial, git state, or unclear
    non-zero exits.
  - `TerminalLabPanel` displays these as suggested-only Tony commands with
    rationale and approval reminders.
  - No diagnostic command is executed from the UI and no shell bridge was added.
- Added the first explicit user-approved local action from Hedwig triage:
  - New `hedwig.createTaskFromObservation` creates a normal local CereBro task
    from a saved capture observation, links the observation to the task, marks
    the capture `tasked`, and clears `needs_review`.
  - The task uses the triage-selected owner agent and links to a known project
    row when the capture guessed Declyne, Waymark, Sygnalist, Bridgefour, or
    CereBro.
  - `HedwigInboxPanel` now shows a `Create Local Task` button in the triage
    proposal. This is an explicit local SQLite/libSQL write only; it does not
    write to Notion, Slack, Sources, the vault, Obsidian, or any external repo.
- Created the approved Obsidian session handoff archive:
  - Wrote the current real handoff snapshot to
    `90_Archive/CereBro Session History/snapshots/2026-05-06 CereBro Session Handoff.md`
    inside the configured Obsidian vault.
  - Wrote the Obsidian index note
    `90_Archive/CereBro Session History/CereBro Session History.md`.
  - Read-only inventory found only one real CereBro session handoff file:
    `CEREBRO_SESSION_HANDOFF.md`. Other handoff matches were templates or
    implementation files, not actual session handoffs.
  - Updated `AGENTS.md`, this handoff, and the master plan so future CereBro
    build sessions must save an Obsidian handoff snapshot at closeout.
- Added local proposal detail/status transitions for Hedwig:
  - New `hedwig.proposalDetail` loads source/capture, reminder, and message
    draft proposal details with local-only gates and allowed status options.
  - New `hedwig.updateSourceProposalStatus`,
    `hedwig.updateReminderProposalStatus`, and
    `hedwig.updateMessageDraftProposalStatus` mutate only local SQLite/libSQL
    metadata and always report `writesExternal: false`.
  - `HedwigInboxPanel` now has a proposal detail inspector for source,
    reminder, and message proposals, with local status controls and approval
    gates visible beside the existing Slack/Notion policy surfaces.
  - Source proposal statuses are limited to local capture states:
    `inbox`, `triaged`, `sourced`, and `archived`.
  - Reminder/message proposal statuses are local workflow states:
    `proposed`, `reviewing`, `ready_for_approval`, `deferred`, and `archived`.
  - This does not write to Notion or Slack, does not fetch/browse source URLs,
    does not schedule reminders, and does not send/post/email messages.
- Added a cleaner Tony diagnostic draft handoff in Terminal Lab:
  - New `terminalLab.previewDiagnosticDraft` accepts one of Tony's generated
    diagnostic draft commands for a saved command observation, verifies it is
    still an actual draft for that observation, and converts it into a normal
    local Terminal Lab command preview.
  - The new preview inherits the parent observation's cwd/project/task/session
    links and records `source = terminal_lab_diagnostic:<parentId>` for local
    provenance.
  - `TerminalLabPanel` now shows `Preview Via Codex Path` on Tony diagnostic
    drafts. Clicking it fills the command input and creates a local preview
    card with a handoff note.
  - This does not execute commands, open a shell, edit files, run diagnostics,
    or bypass Codex command approval. It is only a safer bridge from Tony's
    suggestion text into the existing proposal/approval path.
- Added explicit copy/approval affordances for Tony diagnostic drafts:
  - `TerminalLabPanel` now separates Tony draft actions into `Preview Via
    Approval Path`, `Copy`, and `Copy Approval`.
  - The copy approval text includes the parent observation id, command, purpose,
    gate, and an instruction to run only through the normal Codex approval path.
  - The converted Tony draft preview also has `Copy Command` and
    `Copy Approval Note`.
  - If browser clipboard access is blocked, the panel loads the text into the
    command input and marks the action as `Loaded` instead of executing
    anything.
  - This is a client-side affordance only. It does not run commands, create a
    shell, edit files, write durable memory, or change approval state.
- Added saved diagnostic-preview provenance visibility:
  - `terminalLab.observations` now derives `diagnosticParentId` from
    `source = terminal_lab_diagnostic:<parentId>`.
  - `TerminalLabPanel` shows a `from #<parentId>` chip and explanatory
    provenance line on saved Tony diagnostic-preview observations.
  - Saved diagnostic-preview rows also expose a derived `diagnostic preview`
    status chip so they are easy to scan in the local observation list.
  - This makes converted Tony previews auditable after they enter the normal
    Recent Observations list. It does not add execution, shell access, or any
    external writes.
- Added deeper Terminal Lab diagnostic-chain detail:
  - Tony diagnostic drafts now include explicit `evidence` and `expectedSignal`
    text so each suggested read-only command explains what triggered it and
    what useful result it would reveal.
  - Added deterministic draft coverage for port conflicts, missing Node/JS/TS
    modules or packages, missing TypeScript symbols, package-tool failures, git
    state, missing files, permission errors, and unclear non-zero exits.
  - Converted Tony diagnostic previews now persist chain root/depth provenance
    in the local observation source string while preserving the parent
    observation id.
  - `TerminalLabPanel` displays diagnostic root/depth chips plus evidence and
    expected-signal notes on Tony drafts.
  - This remains proposal-only. It does not execute commands, create a shell,
    install packages, mutate files, browse, call Slack/Notion, or bypass the
    normal Codex approval path.
- Added editable local Hedwig review fields and approval previews:
  - `hedwig.updateSourceProposalReview`,
    `hedwig.updateReminderProposalReview`, and
    `hedwig.updateMessageDraftProposalReview` now edit only local SQLite/libSQL
    review metadata: priority, review notes, approval scope, proposed external
    target, and source needs-review state.
  - `hedwig.createApprovalPreviewFromProposal` stages a pending local
    `approvals` row for source enrichment, Notion capture write, Slack capture
    read, reminder scheduling, or message sending.
  - `hedwig.approvalPreviews` lists those pending local approval records.
  - `HedwigInboxPanel` now exposes review field editing, a Stage Approval
    Preview button, and local approval-preview history in proposal detail.
  - This does not approve anything, write to Notion/Slack, fetch/browse a URL,
    schedule reminders, send/post/email messages, or change external state.
- Added Terminal Lab local observation statuses and approval previews:
  - `terminalLab.observationDetail` returns local detail, status options, and
    gates for saved command observations.
  - `terminalLab.updateObservationStatus` can mark observations `reviewing`,
    `blocked`, `archived`, and related local statuses without execution.
  - `terminalLab.createApprovalPreviewFromObservation` stages a pending local
    `approvals` row for a command observation, classed as read-only,
    mutating/external, or destructive.
  - `terminalLab.approvalPreviews` lists pending local approval records for
    command observations.
  - `TerminalLabPanel` now exposes review/block/archive controls plus an
    Approval Preview button and local approval-preview list.
  - Creating a terminal follow-up task marks the observation `tasked`; staging
    an Aang learning proposal marks it `learned`.
  - This does not execute commands, approve commands, create a shell, install
    packages, mutate git/files, browse, or bypass Codex approval.
- Repaired the Obsidian session handoff archive behavior after user correction:
  - Confirmed local disk currently contains only the live
    `CEREBRO_SESSION_HANDOFF.md`, the existing overwritten Obsidian snapshot,
    and Claude Code handoff template files. Exact overwritten same-day snapshot
    contents were not recoverable from ordinary repo/vault files.
  - Updated `AGENTS.md` and this closeout protocol so future handoff snapshots
    use unique timestamped filenames and the Obsidian index is append-only.
  - Added recovered Obsidian archive notes for the prior same-day closeout
    slices that are still represented in the cumulative handoff, clearly marked
    as recovered rather than exact original snapshots.
  - Added the current full handoff as a unique timestamped Obsidian snapshot.
- Promoted append-only history from a handoff-specific fix to a global CereBro
  learning law:
  - Updated `AGENTS.md`, `CEREBRO_FILE_LIFECYCLE_PLAN.md`,
    `CEREBRO_MASTER_BUILD_PLAN.md`, and
    `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
  - Rule: history/log/archive/index/note trails append or version; canonical
    current-state files may update in place.
  - Rationale: CereBro cannot learn the user's needs, preferences, corrections,
    and hard boundaries if historical evidence is silently overwritten.
- Added the first code-level append/version enforcement slice:
  - `writeObsidianNote` now preserves the first slug path when it is unused and
    writes a timestamped version if the same note title/subfolder already
    exists.
  - `writeVaultTextArtifact` now does the same for vault text artifacts such as
    source notes, message drafts, prompt/tool handoffs, QA reports, model tests,
    cleanup reports, and similar durable text outputs.
  - This prevents accidental same-title overwrites while keeping the original
    path stable for first writes.
  - Current-state files that intentionally update in place still need explicit
    dedicated writers rather than using these history/durable-output helpers.
- Added Artifact Library write-policy labels:
  - `ArtifactsPanel` now tells the user that Artifact Library writes are
    durable history/draft/report saves, not current-state overwrites.
  - Each writable kind carries a policy label: history, draft trail, or report
    history.
  - The panel now explicitly says same-title saves create timestamped versions
    and current-state updates need a separate explicit current-state writer.
- Added append-only source provenance events:
  - Added idempotent `source_events` table in `app/server/cerebroDb.ts`.
  - Added `recordSourceEvent` helper so source writes can keep an append-only
    history even when `sources` remains the current-state URL/source card.
  - `surfer.ingestPublicUrl` now records a `surfer_public_url_ingest` source
    event for every approved public URL ingestion.
  - `hedwig.saveSourceFromObservation` now records a
    `hedwig_capture_source_save` source event for every local capture URL saved
    as a source.
  - This preserves provenance/history while allowing the `sources` row to
    remain the current indexed summary for a URL.
- Surfaced source provenance history in Surfer Sources:
  - `surfer.panel` now returns `recentSourceEvents` from the append-only
    `source_events` table.
  - `SurferSourcesPanel` now has a compact Source History rail showing recent
    source events, owner agent, URL/title, trust/freshness, and source label.
  - This is read-only visibility over local provenance. It does not browse,
    fetch, crawl, screenshot, or write externally.
- Continued the append-only learning law with a small provenance/review slice:
  - Audited remaining write-like paths with `rg`. Active durable vault/Obsidian
    text writers now version same-title history/draft/report files. The older
    `agents.ts` config/skill/agent admin writers remain current-state/admin
    writer candidates rather than history surfaces; do not reuse those patterns
    for logs, notes, source provenance, or handoff archives.
  - Added idempotent local review metadata columns for Hedwig capture/reminder/
    message proposals: review notes, approval scope, proposed external target,
    last-reviewed timestamps, and reminder/message review priority.
  - Hedwig proposal creation/status transitions now preserve local-only review
    metadata and mark local review time without writing to Notion, Slack,
    calendars, email, iMessage, vault files, or Obsidian.
  - `HedwigInboxPanel` now displays proposal review priority/scope/target/notes
    in the detail inspector so approval context is explicit before any future
    external action.
  - `surfer.panel` now supports local source-event filtering by owner
    (`surfer`/`hedwig`) and scrubbed-sensitive events.
  - `SurferSourcesPanel` now exposes those filters and shows richer event
    provenance: summary excerpt, word count, scrubbed flag, trust notes, and
    scrub notes.
- Added Aang Companion Overlay to the build route:
  - User clarified that Aang should be the small always-on surface for keeping
    tabs on CereBro: ambient, useful, click-to-ask, and status-aware.
  - Aang stays a full agent, not a pet in the roster.
  - Idle behavior should be lore-accurate and quiet: goofy fidgeting, tiny
    airbending practice, balancing, sitting, breathing, glancing around,
    sleepy/time-of-day states, and gentle wakeups.
  - Avoid combat loops, large effects, constant movement, or dramatic poses.
  - Cortana still routes requests, Hedwig still owns capture/reminders, and
    Piccolo still owns hygiene.
  - `CEREBRO_MASTER_BUILD_PLAN.md` now places the overlay across Session 6
    design/thin target, Session 8 approved local event feed, Session 11 quick
    ask routing, Session 12 desktop shell/UX, and Session 13 richer animation.
  - `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` now records the companion loop,
    modular surface, Aang ownership boundary, and open desktop-shell/event
    policy questions.
- Folded the reasoning-router direction into the build route:
  - User clarified that CereBro should use local models, free/generous
    hosted AI tiers, specialty tools, and a frontier hosted lane through strong
    routing and validation.
  - Updated `CEREBRO_MASTER_BUILD_PLAN.md` so the Model/Tool Capability
    Registry, Surfer Model/Tool Discovery lane, Reasoning Gateway, eval-backed
    routing, Prompt/Tool Handoff playbooks, and OpenClaw-as-reference stance
    are now canonical scope.
  - Updated `CEREBRO_MODEL_ROUTER_BASELINE.md` with the expanded registry
    target, gateway options, first internal interface shape, and first eval task
    set.
  - Recorded the pushback: free-tier model hopping is not the same as me-level
    reasoning. CereBro gets smarter when it tests models/tools, routes with
    evidence, packages context well, validates outputs, and saves what worked.
  - This was docs-only. It did not install LiteLLM, OpenRouter tooling,
    promptfoo, DeepEval, Ollama, or any external provider SDK.
- Implemented the first local Model/Tool Capability Registry scaffold:
  - `app/server/cerebroDb.ts` now creates local
    `model_tool_capabilities`, `model_tool_evals`, and
    `model_tool_call_logs` tables.
  - `app/server/routers/modelTools.ts` exposes a proposal-only policy route,
    read-only capability/eval listing, local append-only capability proposals,
    local append-only eval notes, and a route preview helper.
  - `modelTools.routePreview` returns candidate lanes such as
    local/private-first, Surfer discovery proposal, vision adapter candidate,
    and frontier reasoning candidate, with approval gates and validation steps.
  - Capability records are proposals until source-verified or eval-tested.
    Eval notes do not mark a capability as a recommended default.
  - This did not install LiteLLM, OpenRouter tooling, promptfoo, DeepEval,
    Ollama, or any provider SDK. It did not call external models/tools,
    browse/search/fetch, create accounts, touch tokens, or verify current
    pricing/limits.
- Folded Reddit into the build plan as a first-class source lane:
  - Updated `CEREBRO_MASTER_BUILD_PLAN.md` core defaults, Session 5 Source
    Library, Session 7 Notion/Output capture, and Session 8 Hedwig/Piccolo
    operations.
  - Locked the intended product shape: Reddit watchlists, post/search/comment
    capture, trend radar, media references, outbound links, community
    disagreement tracking, and source records with visible provenance.
  - Locked the learning flow: raw capture -> summarized source -> recurring
    pattern -> approved memory.
  - Locked the safety boundary: conservative public-source capture or approved
    OAuth setup, no block bypass, no proxy scraping, no deleted/private content
    harvesting, no automatic reposting, and no model training/fine-tuning on
    Reddit content.
  - This was docs-only. It did not browse Reddit, fetch sources, install a
    Reddit package, create a Reddit app, download media, write Notion/Slack, or
    save vault media.

## Files Touched This Session

- `CEREBRO_MASTER_BUILD_PLAN.md`
- `CEREBRO_SESSION_HANDOFF.md`
- `CEREBRO_MODEL_ROUTER_BASELINE.md`
- `CEREBRO_FILE_LIFECYCLE_PLAN.md`
- `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`
- `AGENTS.md`
- `app/server/agentRouter.ts`
- `app/server/cerebroDb.ts`
- `app/server/routers/outputs.ts`
- `app/server/integrations/vault.ts`
- `app/server/integrations/notion.ts`
- `app/server/routers/integrations.ts`
- `app/server/routers/piccolo.ts`
- `app/server/routers/projectIntelligence.ts`
- `app/server/routers/commandIntake.ts`
- `app/server/routers/surfer.ts`
- `app/server/routers/handoffs.ts`
- `app/server/routers/promptHandoffs.ts`
- `app/server/routers/hedwig.ts`
- `app/server/routers/terminalLab.ts`
- `app/server/routers/approvals.ts`
- `app/server/routers/workbench.ts`
- `app/server/routers/companion.ts`
- `app/server/routers/modelTools.ts`
- `app/server/routers/tasks.ts`
- `app/server/routers.ts`
- `app/server/routers/memory.ts`
- `app/server/cerebro-foundations.test.ts`
- `app/server/routers/artifacts.ts`
- `app/client/src/components/ArtifactsPanel.tsx`
- `app/client/src/components/PiccoloPanel.tsx`
- `app/client/src/components/ProjectLabPanel.tsx`
- `app/client/src/components/SurferSourcesPanel.tsx`
- `app/client/src/components/HandoffArchivePanel.tsx`
- `app/client/src/components/HedwigInboxPanel.tsx`
- `app/client/src/components/TerminalLabPanel.tsx`
- `app/client/src/components/WorkbenchPanel.tsx`
- `app/client/src/components/AangCompanionPanel.tsx`
- `app/client/src/components/ApprovalDashboardPanel.tsx`
- `app/client/src/components/TasksPanel.tsx`
- `app/client/src/pages/Home.tsx`
- `app/client/src/lib/keepConfig.ts`
- `app/client/src/components/KeepScene.tsx`
- `app/client/public/sprites/keep/hedwig/metadata.json`
- `app/client/public/sprites/keep/hedwig/rotations/south.png`
- `app/client/public/sprites/keep/hedwig/rotations/south_pixellab_full.png`
- `app/client/public/sprites/keep/hedwig/rotations/east.png`
- `app/client/public/sprites/keep/hedwig/rotations/west.png`
- `app/client/public/sprites/keep/hedwig/rotations/north.png`
- `app/.env` (gitignored local config)
- `app/.env.example`
- Obsidian vault:
  - `90_Archive/CereBro Session History/CereBro Session History.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-07 0510 CereBro Session Handoff - Reasoning Router.md`
- Obsidian vault:
  - `90_Archive/CereBro Session History/CereBro Session History.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 CereBro Session Handoff.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1758 CereBro Session Handoff - Source Review Metadata.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1800 CereBro Session Handoff - Tony Draft Copy Approval.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1803 CereBro Session Handoff - Tony Diagnostic Provenance.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1805 CereBro Session Handoff - Tony Diagnostic Status Label.md`
  - `90_Archive/CereBro Session History/snapshots/2026-05-06 1938 CereBro Session Handoff - Aang Companion Overlay.md`

## Tests And Checks

- Reasoning-router plan slice:
  - Docs-only update. No code tests needed.
  - `git status --short`: run. Worktree remains dirty with broad pre-existing
    changes plus the touched planning docs and handoff updates.
- Model/tool capability registry scaffold:
  - `pnpm check`: passed.
  - `pnpm exec vitest run server/cerebro-foundations.test.ts`: passed, 17 tests.
  - `pnpm build`: passed. Vite still warns about unset analytics env
    placeholders and large JS chunks; those warnings predate this slice.
- `pnpm test` in `app/`: passed. 4 test files, 23 tests.
- `pnpm check` in `app/`: passed. TypeScript completed without errors.
- `git status --short`: run. Worktree remains dirty, mostly from pre-existing changes plus this session's new docs/update.
- Session 2 checks run: `system_profiler SPHardwareDataType`, `sw_vers`, `df -h`, `command -v ollama`, `git status --short`.
- Session 3 code checks run after lifecycle scaffold:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 23 tests.
- Session 3 code checks run after vault layout/Piccolo router:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 25 tests.
- Session 3 setup checks after creating vault folders:
  - Verified Google Drive mount under `/Users/lindsaybell/Library/CloudStorage/GoogleDrive-bocas.joshua@gmail.com`.
  - Verified `CereBro-Vault` exists.
  - Verified canonical folder tree exists with `find`.
  - Verified Obsidian setup files exist under `07_Knowledge/obsidian-vault/.obsidian`.
  - `du -sh` for the vault reported `8.0K`.
  - `du -sh` for the Obsidian vault reported `20K`.
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 25 tests.
- Session 3 checks after artifact hooks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 26 tests.
- Session 3 checks after general artifact router:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 3 checks after UI visibility:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - `pnpm dev` started successfully on `http://localhost:3003/` after auto-bumping from busy port 3000.
- Session 3 checks after responsive layout fix:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Browser verified Outputs and Automation at `http://localhost:3003/` in the in-app browser.
- Session 3 checks after first artifact write control:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Browser created and displayed the first tracked Obsidian artifact.
  - Verified `07_Knowledge/obsidian-vault/indexes/cerebro-home.md` contains clean Markdown.
- Session 3 checks after supersession polish:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Browser verified Artifact Library superseded older rows for repeated saves.
  - Browser verified Piccolo reports repeated storage paths as informational history.
  - Verified updated Obsidian note content.
- Session 3 closeout polish checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - Verified `http://localhost:3003/` is still listening.
- Project Intelligence planning checks:
  - Read current master/handoff/file lifecycle/model router docs.
  - Read relevant older architecture and implementation-pack references.
  - Read-only GitHub connector inspection of Bowgull repos.
  - Read-only local checkout discovery under `/Users/lindsaybell`.
  - Read-only git status/remotes for Declyne, Waymark, Sygnalist, Bridgefour.
  - No tests needed; docs-only planning change.
- Session 4 Project Lab implementation checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
  - `git status --short`: run. Worktree remains dirty with pre-existing
    changes plus this session's docs and Project Lab files.
- Session 4 connective-layer checks after Terminal/Hedwig/Project Lab/pathing
  polish:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
  - Confirmed a dev server is listening on `http://localhost:3002/`.
- Session 4 Batman role adjustment checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 command intake checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 personal OS / Surfer route checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Surfer panel scaffold checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 approved public URL ingestion checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 approved intake task creation checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 project-linked intake task checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 task project-name display checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Project Lab task rollup checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Tasks project filter checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 27 tests.
- Session 4 Surfer source metadata checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 capture/terminal planning checks:
  - Planning/doc-only update; no app tests required.
- Session 4 proposal-only Handoff Archive checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 reusable prompt/tool-handoff checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 reusable prompt/tool-handoff save/search checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 command-intake prompt reuse surfacing checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 27 tests.
- Session 4 Hedwig capture proposal checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 28 tests.
- Session 4 Notion capture status checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 28 tests.
- Session 4 Hedwig agent/Keep metadata checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/cerebro-home.html http://localhost:3002/`: passed.
  - `curl --fail -L -o /tmp/hedwig-south.svg http://localhost:3002/sprites/keep/hedwig/rotations/south.svg`: passed.
- Session 4 Keep use-spot/facing movement checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/hedwig-east.svg http://localhost:3002/sprites/keep/hedwig/rotations/east.svg`: passed.
  - `curl --fail -L -o /tmp/tony-east.png http://localhost:3002/sprites/keep/tony/rotations/east.png`: passed.
  - `curl --fail -L -o /tmp/cerebro-home.html http://localhost:3002/`: passed.
- Session 4 PixelLab Hedwig static sprite checks:
  - PixelLab `create_map_object`: completed for object
    `1cea6825-714b-44bf-adea-0c50cf902391`.
  - Downloaded object, retained the full generated source at
    `app/client/public/sprites/keep/hedwig/rotations/south_pixellab_full.png`,
    and repacked the live rotations to bird scale.
  - PixelLab `animate_object`: queued `idle-flutter` animation
    `f9603efc-be76-4f97-aa2d-d31be88ef5f5`.
  - PixelLab `get_object`: later reported `idle-flutter` completed with 9
    frames.
  - `curl --fail -L -o /tmp/hedwig-pixellab-object-download https://api.pixellab.ai/mcp/objects/1cea6825-714b-44bf-adea-0c50cf902391/download`: returned the static PNG.
  - Guessed animation download endpoints returned 404, so no local animation
    frame files were saved.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/hedwig-pixellab-south.png http://localhost:3002/sprites/keep/hedwig/rotations/south.png`: passed.
  - `view_image` inspected the local PixelLab sprite.
- Session 4 Hedwig scale correction checks:
  - Compared visible trims for existing agents and Hedwig; the original Hedwig
    object was too close to full character height.
  - Repacked Hedwig live PNG rotations to an approximately 30x41 visible owl on
    the existing 92x92 transparent canvas.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/hedwig-pixellab-south-small.png http://localhost:3002/sprites/keep/hedwig/rotations/south.png`: passed.
- Session 4 Keep path graph walking checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 29 tests.
  - `curl --fail -L -o /tmp/cerebro-home-pathing.html http://localhost:3002/`: passed.
- Session 4 Terminal Lab proposal checks:
  - Initial `pnpm test -- cerebro-foundations.test.ts` caught a classifier bug:
    the substring `rm` inside "Terminal" caused a read-only `rg` example to be
    marked mutating.
  - Fixed classifier matching to use first command token plus explicit phrases.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `curl --fail -L -o /tmp/cerebro-terminal-lab.html http://localhost:3002/`: passed.
- Session 4 Terminal Lab observation persistence checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `curl --fail -L -o /tmp/cerebro-terminal-persist.html http://localhost:3002/`: passed.
- Session 4 connective-layer checks after Terminal/Hedwig/Project Lab/pathing
  polish:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
  - `git status --short`: run. Worktree remains dirty with pre-existing
    changes plus the current Session 4 local changes.
  - Confirmed a dev server is listening on `http://localhost:3002/`.
- Session 4 Hedwig triage and Terminal observed-output checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
  - `git status --short`: run. Worktree remains dirty with pre-existing
    changes plus the current Session 4 local changes.
- Session 4 Hedwig triage-to-task checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test` in `app/`: passed. 4 test files, 30 tests.
- Session 4 Terminal Lab task/session linkage checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
  - `pnpm dev` started successfully on `http://localhost:3002/` after
    auto-bumping from busy port 3000.
- Session 4 Terminal Lab follow-up task checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig save-source checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig reminder proposal checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig message draft proposal checks:
  - Initial focused test caught a case-sensitivity bug in recipient hint
    parsing for `Message Cortana`; fixed the regex to match the command word
    case-insensitively.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Terminal Lab observation filter checks:
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
- Session 4 Terminal Lab learning-note proposal checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Tony diagnostic draft checks:
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - `pnpm -s exec tsc --noEmit` in `app/`: passed.
- Session 4 Hedwig proposal status/detail checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
- Session 4 Tony diagnostic draft handoff checks:
  - Initial `pnpm check` caught tRPC union narrowing in
    `TerminalLabPanel`; fixed the UI guard to narrow on the success-only
    `handoffNote` field.
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
- Obsidian append-only archive repair checks:
  - Searched repo and configured CereBro vault for handoff Markdown files.
  - Found only `CEREBRO_SESSION_HANDOFF.md`, the existing Obsidian snapshot, and
    Claude Code handoff templates; no separate old exact snapshot files were
    present.
  - Repaired the Obsidian index to preserve entries instead of replacing one
    same-day line.
- Append-only learning law documentation checks:
  - Updated the repo guide, file lifecycle plan, master plan, project
    intelligence plan, and live handoff.
  - Verified no old date-only handoff snapshot instruction remains in
    `AGENTS.md` or `CEREBRO_SESSION_HANDOFF.md`.
- Append/version writer checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - Tests now prove same-title Obsidian notes and vault text artifacts create a
    timestamped second file and preserve the first file's contents.
- Artifact Library write-policy label checks:
  - `pnpm check` in `app/`: passed.
- Source provenance event checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - Test coverage now verifies Hedwig source saves append a `source_events` row
    with owner/provenance while keeping the local source save proposal-only.
- Surfer source history visibility checks:
  - `pnpm check` in `app/`: passed.
  - `pnpm test -- cerebro-foundations.test.ts` in `app/`: passed. Vitest also
    ran matching related suites; 4 test files, 30 tests.
  - Test coverage now verifies `surfer.panel` returns recent source events.
- Source review metadata slice checks:
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
  - `pnpm typecheck` was attempted but no such package script exists.
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
- Tony draft copy/approval affordance checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
- Tony diagnostic-preview provenance checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
- Tony diagnostic-preview status-label checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --run app/server/cerebro-foundations.test.ts app/server/agents.test.ts`
    in `app/`: passed. Vitest ran matching related suites; 4 test files, 30
    tests.
- Obsidian handoff archive checks:
  - Read-only handoff inventory found `CEREBRO_SESSION_HANDOFF.md` as the real
    handoff source.
  - Verified the Obsidian session history index and dated handoff snapshot exist
    in the configured Obsidian vault.
- Aang Companion Overlay planning checks:
  - Updated `CEREBRO_MASTER_BUILD_PLAN.md` and
    `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
  - No code, assets, dependencies, Notion rows, Slack records, app permissions,
    browser actions, external repos, or desktop overlay processes were changed.
- Session 4 Workbench evidence grouping checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test` in `app/`: passed. 4 test files, 32 tests.
  - Test coverage now verifies local Workbench evidence grouping stays
    read-only/no-fetch/no-command and that evidence detail exposes appended
    validation-note history without overwriting the original evidence row.
- Session 4 local proposal bundle checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - A parallel test run while `pnpm check` was still active hit a transient
    `SQLITE_BUSY` lock; rerunning after the compiler finished passed.
  - Test coverage now verifies Approval Queue grouping is read-only/no-approve,
    Workbench link options include local tasks/sessions without mutating them,
    and Project Lab action drafts append local plans without creating tasks or
    editing repos.
- Session 4 local drill-down and companion bridge checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - Approval Queue group cards now act as local drill-down controls.
  - Workbench group cards now act as local drill-down controls, and evidence
    search now includes validation status, saved-source labels/URIs, and linked
    command text.
  - Aang Companion local event counts now include Workbench evidence records
    from the last 24 hours and can route back to Workbench inside the Keep.
- Session 4 Workbench/Project Lab local linking checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - Workbench evidence grouping now includes task, session, and artifact groups
    alongside project/kind/source/command/validation status.
  - Workbench evidence creation now has a local artifact picker in addition to
    project/task/session/source/command links.
  - Workbench evidence search now spans task titles, session ids, artifact
    titles/paths, source labels/URIs, linked commands, and validation status.
  - Project Lab overview/cards now surface local action draft counts, a Drafts
    filter, draft score chips, and a card signal block that opens the Drafts
    inspector queue.
- Session 4 Project Lab draft history checks:
  - `pnpm check` in `app/`: passed. TypeScript completed without errors.
  - `pnpm test -- --runInBand` in `app/`: passed. 4 test files, 33 tests.
  - Added append-only local `project_action_draft_notes`.
  - Project Lab draft detail now returns recent local notes for each draft.
  - Project Lab Drafts inspector can append a local note to a draft without
    creating a task, editing repos, running commands, browsing/searching,
    fetching sources, or writing to Notion/Slack.
  - Test coverage now verifies draft notes append and appear in project detail.

## Storage Impact This Session

- No new assets, dependencies, Notion rows, Slack records, command executions,
  or external project repo files were created in the latest Tony draft
  copy/approval affordance slice.
- Local harness DB `app/cerebro.db` exists at about 9.1M and now includes local
  preview rows created by tests for Terminal Lab/Hedwig observation
  persistence plus local triage/output-summary/task-creation/linkage/follow-up
  task/learning-proposal/source-save/reminder-proposal/message-draft/status
  transition test rows. This DB is local app state, not a generated
  deliverable.
- The app schema now adds local-only Hedwig review metadata columns and richer
  Source History query/display metadata. These are SQLite/libSQL schema/state
  changes only.
- Obsidian storage impact: the existing 2026-05-06 session handoff snapshot and
  session history index were previously refreshed in-place. The closeout model
  is now corrected to append-only unique snapshots. New recovered archive notes
  and the current unique timestamped snapshot were added under
  `90_Archive/CereBro Session History/snapshots/`.
- Latest Workbench grouping slice changed code and tests only:
  `app/server/routers/workbench.ts`,
  `app/client/src/components/WorkbenchPanel.tsx`, and
  `app/server/cerebro-foundations.test.ts`.
- Latest local proposal bundle added:
  - `project_action_drafts` local append-only table.
  - Approval Queue local grouping.
  - Workbench local task/session link pickers.
  - Project Lab proposal-only draft action buttons and inspector queue.
- Latest local drill-down/companion bridge added:
  - Clickable local group cards in Approval Queue and Workbench.
  - Workbench evidence search over validation/source/command metadata.
  - Aang Companion `workbench_evidence` local event count and Keep route.
- Latest Workbench/Project Lab local linking bundle added:
  - Workbench task/session/artifact grouping.
  - Workbench artifact link picker.
  - Broader Workbench local evidence search across linked metadata.
  - Project Lab draft counts/filter/signal cards and append-only draft note history.
- Latest Project Lab draft history bundle added:
  - Append-only `project_action_draft_notes` table.
  - Local draft-note append mutation.
  - Recent draft-note history in Project Lab detail.
  - Drafts inspector note composer.
- No new dependencies, media assets, Notion rows, Slack records, browser
  fetches, command-execution UI, desktop overlay process, or external project
  repo files were created.
- Local Workbench evidence created by tests remains in the local app DB only.
  These are harness test/proposal records, not durable vault deliverables.
- Closeout adds one unique append-only Obsidian handoff snapshot and one session
  history index entry.
- Latest reasoning-router plan slice is docs-only. It adds no dependencies,
  model downloads, API calls, Notion rows, Slack records, browser fetches,
  command execution, media assets, or external repo changes.
- Latest Reddit intelligence plan slice is docs-only. It adds no dependencies,
  Reddit API app, OAuth tokens, source fetches, media downloads, Notion rows,
  Slack records, browser actions, command execution, or vault media files.

## Known Risks

- Worktree was already dirty before this session.
- Aang Companion Overlay is now in the plan, but no desktop app shell exists
  yet. Electron/Tauri/menu-bar helper/web-only prototype still needs a local
  spike before implementation.
- Workbench grouping and validation history are local evidence views only. They
  do not capture browser/media evidence, fetch linked sources, execute linked
  commands, or update the validation status of the original evidence row.
- Workbench now has task/session pickers from local records, but no task/session
  mutation. Relationships remain limited by whatever local records already
  exist.
- Project Lab action drafts are proposal-only local records. They do not create
  tasks, stage approvals, edit repos, browse, run commands, or write externally.
  Future work needs explicit conversion paths if drafts should become tasks.
- Approval Queue grouping is local read-only. It still cannot approve/reject
  anything or execute the queued action.
- Workbench group-card drill-downs depend on local labels and search fields.
  They are useful for inspection, but they are not a full relational query UI
  yet.
- Aang's Workbench evidence event is a local Keep route only. It does not send a
  desktop notification, start an overlay process, inspect the screen, or capture
  media.
- Project Lab draft counts make local proposals more visible, but drafts still
  have no approved conversion path to tasks or execution.
- Project Lab draft notes are local history only. They do not update the draft
  itself, create a task, stage approval, or perform work.
- Workbench artifact links read existing artifact rows only. They do not open,
  copy, move, archive, delete, or write artifact files.
- Overlay event policy is not implemented. V1 must decide which local CereBro
  events may wake a bubble and which should badge silently.
- `AGENTS.md` previously described 10 V1 agents; master plan now adds Hedwig as an eleventh scoped Messenger/Comms agent in the Crypts with Piccolo.
- Ollama is not installed or not on PATH, so model testing cannot begin until approved in Session 2.
- 32Gi free is workable for code but tight for heavy local media/model workflows.
- `app/server/agentRouter.ts` now represents Hedwig as the eleventh V1 agent.
  Final Hedwig skills/runtime dispatch still need implementation.
- The proposed model shortlist is based on published Ollama metadata, not local performance measurements.
- Any model download will consume disk under `~/.ollama` unless the model storage path is changed before install/use.
- The new model/tool opportunist direction can become messy if implemented as
  free-tier hopping without evals, privacy review, and validation. Routing must
  be evidence-backed.
- Free-tier limits, model quality, pricing, terms, and prompt recipes change
  often. Surfer must re-check current sources before recommending a model/tool
  route as fresh.
- Reddit access rules, rate limits, public endpoint behavior, subreddit
  moderation, and platform policy can change. The first implementation should
  be conservative, source-link-first, and easy to pause.
- Reddit human signal is valuable but uneven. Oak/Spock must separate lived
  reports, repeated patterns, screenshots, official links, and unverified
  claims before CereBro promotes anything to durable memory or action.
- LiteLLM/OpenRouter/direct-provider/CereBro-native gateway choice remains
  open. Do not install a gateway dependency until security, maintenance,
  provider coverage, and approval logging tradeoffs are reviewed.
- OpenClaw should remain a reference/adapter candidate only. Broad
  desktop/file/message access is a security boundary and must not bypass
  CereBro's permission, memory, router, or validation model.
- Cleanup authority is scan/report only. Piccolo/Hedwig destructive lifecycle enforcement has not been implemented and remains approval-gated.
- Lifecycle metadata now covers the main planned text/metadata surfaces. Binary creative files, screenshots, and browser/source captures still need richer manifest handling once those workflows exist.
- The Piccolo report route is read-only and does not create missing folders or cleanup candidates yet.
- Obsidian app and vault setup are verified.
- Direct shell writes into the Drive vault are outside the repo writable root, but approved app routes can write to the configured vault/Obsidian paths through the running server.
- Existing legacy vault folders `outputs`, `sources`, and `memory` still need a future migration/cleanup decision; do not move/delete them without approval.
- Piccolo Hygiene is visible but still report-only; no cleanup candidate persistence or approval workflow UI yet.
- Artifact Library keeps audit history for repeated saves. It supersedes older current rows, but still displays historical rows in the default all-artifacts view.
- Artifact Library write controls are intentionally simple. Session 4 should add project/client selectors once the project workspace concepts exist.
- Project Lab profiles are currently static code, not persisted in CereBro's DB.
- Project Lab only reads local git state. It does not yet use the GitHub
  connector for remote issue/PR/repo intelligence.
- Project Lab uses absolute local paths for the initial Bowgull project set; if
  a checkout moves, it will show as missing until the profile source is updated.
- Project Intelligence does not yet create tasks, sessions, ceremonies, or
  model-routing decisions. It is a visibility layer only.
- Command intake uses deterministic keyword heuristics, not an LLM classifier.
  It is good enough for a first local preview but will need memory/project
  context and model-assisted classification later.
- Command intake can now create tasks only after the user clicks `Create Task`.
  The task is a lightweight task record, not an agent run or external action.
- Intake-created tasks can now link to harness project rows and display project
  names. Tasks can filter by project, and Project Lab now shows task rollups.
  There is still no session linkage.
- Surfer Sources is still approval-gated. It previews research/source cards and
  can fetch/save one explicitly approved public HTTP/HTTPS URL at a time. It
  still does not crawl, run open web search, browse privately, log into sites,
  screenshot, or save full page text.
- Approved public URL ingestion is intentionally narrow: one user-approved
  public URL at a time. Open web search, crawling, screenshots, authenticated
  browsing, full-page extraction, and richer source validation still need
  separate gated layers.
- Source trust inference is deterministic and heuristic. It is a triage signal,
  not a truth claim; important claims still need Oak/source validation.
- Slack is now required for V1. The proposal-only Hedwig capture router/panel
  now defines the Slack DM/capture-channel shape and Notion capture database
  schema, but no Slack connector/app scopes have been installed, no Notion
  capture database has been created, and no external capture sync has been
  implemented.
- Hedwig now has a first PixelLab static owl PNG, scaled/repacked for bird
  proportions in the Keep. East/west/north are temporary static derivatives,
  not true PixelLab directional rotations. PixelLab reports the `idle-flutter`
  animation completed, but the current MCP/download surface did not expose
  local frame downloads in this session.
- Keep movement now uses chamber/council use-spots, and
  `walking-to-ceremony` uses the first node-by-node graph route into Cortana's
  hub. It is BFS over static edges rather than a full A* / collision-aware
  corridor walker, and regular idle/work movement remains room-local.
- Obsidian session handoff snapshots are now approved append-only standing
  behavior. Future sessions must update the repo handoff first, then write a
  unique timestamped Obsidian snapshot and append a new Obsidian index entry
  without replacing earlier entries.
- Append-only history is now a global CereBro learning law. Logs, history
  indexes, handoff archives, audit trails, command/output history, source
  provenance, approval history, running notes, corrections, and learning trails
  should append or create a unique timestamped version. Canonical current-state
  files such as active plans and `CEREBRO_SESSION_HANDOFF.md` may update in
  place, but they must not be treated as historical archives.
- Vault/Obsidian text writers now enforce a first pass of the law by creating
  timestamped versions on filename collision instead of overwriting same-title
  durable notes/artifacts.
- Artifact Library now exposes that write policy in the UI so users can see
  whether they are saving durable history, a draft trail, or report history.
- Source saves now split current-state and history: `sources` is the current
  source card, and `source_events` is the append-only provenance trail.
- Surfer Sources now displays recent local source history events so provenance
  is visible rather than hidden in the DB. It can filter the local history by
  owner agent or scrubbed-sensitive events, but this is still local metadata
  visibility and not live research/search.
- Handoff Archive candidate detection is heuristic. It intentionally avoids
  treating old Claude Code handoff templates or broad planning docs as session
  closeout snapshots unless the user explicitly selects them later.
- Reusable prompt/tool handoff memory is now in the plan and artifact taxonomy,
  has a first read-only search route, and is surfaced in command intake for
  `prompt_reuse` requests. It is not yet a full chat/runtime retrieval layer,
  and body search only covers the bounded prompt excerpt saved in artifact
  metadata rather than full-text vault indexing.
- Terminal Lab now has a proposal-only UI and command classifier. It still has
  local command-observation persistence and can infer project links from known
  `cwd` values. It can attach manually pasted output summaries to observations,
  link observations to selected tasks/sessions, and show deterministic Aang/Tony
  follow-up suggestions from observed output plus read-only Tony diagnostic
  command drafts. It can also create a normal local follow-up task from an
  observation and stage an Aang learning-note memory proposal. Tony diagnostic
  drafts can now be converted into normal local Terminal Lab previews, with
  parent-observation provenance, only if the command still matches one of
  Tony's generated drafts. It has no PTY bridge and no UI execution path. Any
  real command execution remains through Codex's normal approval-gated tool
  path, and durable memory writes still require Oak/user approval.
- Hedwig Capture Inbox now persists local preview observations and Project Lab
  can show capture counts/snippets for linked projects. Hedwig can now preview
  triage routes for saved captures and explicitly create a local CereBro task
  from a triaged capture. Hedwig can now save a local source record from a
  source-like capture without fetching or validating the URL, and create a
  local reminder proposal from a reminder-like capture without scheduling or
  notifications. Hedwig can also create a local message draft proposal from a
  message-like capture without sending or posting. Hedwig now has local detail
  views and status transitions for source/reminder/message proposals. These
  statuses are local workflow metadata only; they do not approve or perform
  external actions. Hedwig proposal details now include local review metadata
  such as review priority, approval scope, proposed external target, review
  notes, and last-reviewed timestamps, but the fields are not yet a full edit
  workflow or external approval record. It still does not write to Notion, read/post Slack,
  fetch/browse sources, write to calendars, send messages, or write to the
  vault/Obsidian.
- Project Lab activity rollups depend on known project rows. Terminal/Hedwig
  preview calls create/link those rows for known project paths/guesses, but
  older previews made before this slice may remain unlinked.
- Project Lab's new approval rollup is local-only and best-effort. It can count
  approvals tied through known local task/target records, but it will not see
  future approval records that lack a project-bearing task or supported target
  type until the schema gains a first-class `project_id` on approvals.
- The Project Lab Local Inspector is intentionally dense but bounded. It is a
  good first inspection surface, not the final approval inbox UX; future polish
  should add filtering/detail drawers without adding execution or external write
  paths.
- Project Lab Local Inspector tabs/details are UI-only state. They do not
  persist read state, change queue status, or record audit events yet.
- Project Lab project-card filters are UI-only state. The `Attention` filter is
  deterministic and currently means any known project with pending approvals,
  Hedwig captures needing review, blocked/reviewing Terminal observations,
  sensitive source events, or dirty git state.
- Project Lab attention reason badges use the same deterministic signals as the
  `Attention` filter. They are not persisted and should not be treated as audit
  history.
- Project Lab filtered-view sorting is deterministic client-side ordering. The
  Attention weight is a UI heuristic, not a priority decision by Batman/Cortana
  and not an audit record.
- The Project Lab filtered-view summary is computed from the same local data as
  the cards. Its scores/counts are live UI signals, not persisted records or
  priority decisions.
- Project Lab rank badges use the same client-side score as the active filter.
  They are not persisted, audited, or treated as agent priority decisions.
- Project Lab score-breakdown chips explain the same client-side score used by
  the active filter. They are not persisted, audited, or treated as review
  history or agent priority decisions.
- Project Lab signal-block drill-down is local UI navigation only. It should not
  be treated as review history, read state, queue mutation, approval, or command
  execution.
- Project Lab Worktree Changes drill-down is also local UI navigation only. It
  exposes the existing bounded Git inspector rows but performs no git operation.
- Project Lab recent-row drill-downs and row-cap footers are local UI clarity
  features. They are not review history, read state, approval, source fetch,
  external write, or command execution.
- Project Lab Local Inspector search is local in-memory UI state. It is not
  persisted, audited, or connected to external search/browsing.
- Project Lab Local Inspector type chips are also local in-memory UI state. They
  are convenience filters only and not proof of review or approval.
- Project Lab Local Inspector sort controls are local in-memory UI state. They
  are display-only and not review history, priority decisions, or mutations.
- Project Lab Signals strip and Sources filter are client-side read-only
  projections of existing overview data. They do not create source events,
  fetch content, browse/search, or persist priority.
- Project Lab Next Safe Actions strip is also client-side read-only. It exposes
  deterministic safe-next-action text but does not create work, mark review
  state, or trigger actions.
- Project Lab summary-count navigation is client-side view state only. It does
  not refetch external data or perform queue actions.
- Project Lab Local Repos summary reset is also client-side view state only. It
  only returns to the All card filter.
- Project Lab summary/filter accessibility labels are semantics-only. They do
  not add new actions or permission surfaces.
- Project Lab passive summary and empty-state accessibility labels are
  semantics-only. They do not add new actions or permission surfaces.
- Project Lab Local Inspector accessibility labels are semantics-only. They do
  not add actions, review state, read receipts, approval state, or permission
  surfaces.
- Project Lab card drill-down accessibility labels are semantics-only. They do
  not add actions, review state, read receipts, approval state, or permission
  surfaces.
- Project Lab empty-state reset label cleanup is semantics-only. It only
  distinguishes reset navigation from the normal All filter chip.
- Project Lab close/search accessibility labels are semantics-only. They do not
  add actions or permission surfaces.
- Project Lab close-button type hygiene is semantics-only. It does not add
  actions or permission surfaces.
- Project Lab region accessibility labels are semantics-only. They do not add
  actions, review state, read receipts, approval state, or permission surfaces.
- Project Lab status live-region semantics are semantics-only. They do not add
  actions, review state, read receipts, approval state, or permission surfaces.
- Project Lab non-interactive list semantics are semantics-only. They do not add
  actions, review state, read receipts, approval state, or permission surfaces.
- Project Lab busy-state semantics are semantics-only. They do not add actions,
  review state, read receipts, approval state, or permission surfaces.
- Keep left-rail navigation accessibility labels are semantics-only. They do
  not add actions, review state, read receipts, approval state, or permission
  surfaces.
- Bundled Keep shell accessibility/HTML hygiene is semantics-only. It does not
  add actions, review state, read receipts, approval state, execution, external
  writes, or permission surfaces.
- Project Lab Next Safe Action reason chips reuse existing local attention
  signals. They are explanatory only, not audit history or priority decisions.
- Project Lab empty-filter state is local UI only. It is not a data change or
  signal that a queue was reviewed.
- Project Lab Missing filter is local existence view state only. It does not
  clone, fetch, create, delete, or repair repositories.
- Project Lab inspector default queue selection is deterministic client-side
  convenience. It should not be treated as triage history or proof that a queue
  was reviewed.
- Obsidian cleanup was intentionally limited to three confirmed empty/stub root
  files after user approval. Session history snapshots and index notes were
  left untouched.
- Project Lab Local Inspector context display is improved, but the panel is
  still dense. Future UI polish can tune the inspector height, mobile behavior,
  and horizontal overflow without adding actions.
- Project Lab Git inspector rows are read-only snapshots from local
  `git status --short --branch`. They are not review history, are not an
  approval surface, and must not grow stage/commit/reset/pull/push buttons
  without explicit approval.
- The new `nextSafeAction` text is deterministic queue triage, not an agent
  decision. It deliberately prioritizes pending approvals, blocked/reviewing
  Terminal observations, Hedwig review queues, sensitive source events, active
  tasks, open tasks, and dirty git state before falling back to the static
  project next action.
- Keep council/path movement is more stable across repeated state refreshes,
  but the path graph is still a simple static BFS graph and still needs stair
  landing/corridor visual polish.
- Declyne local worktree is dirty; treat it as user work and do not overwrite.
- Sygnalist local `.gitignore` is modified; Bridgefour has an untracked resume docx. Do not clean or move without approval.
- Plaid integration for Declyne is not implemented in the visible files inspected. Treat it as a future planned track requiring careful design.

## Next Recommended Session

Session 4 - Personal Command Center And Project Intelligence, continuation.
The first read-only Project Lab surface, proposal-only command intake router,
proposal-only Surfer Sources panel, and approved one-URL public ingestion lane
are live. Intake-created tasks now link to harness project rows and display
project names when a known project is detected, Tasks can filter by linked
project, and Surfer URL ingestion now stores first-pass trust/scrub metadata.
The build route now also explicitly includes Slack as required V1 Hedwig
capture, Notion as the structured capture database, Obsidian handoff snapshots
with an index note, and Terminal Lab as a modular learning/validation surface.
Terminal Lab observations can now link to tasks/sessions, surface local
Aang/Tony follow-up suggestions from pasted observed-output summaries, and
create normal local follow-up tasks from observations. Recent Terminal Lab
observations can now be filtered by the selected task or session. Terminal Lab
can also stage Aang learning-note memory proposals from observations without
writing durable memory, display read-only Tony diagnostic command drafts
from observed output, provide explicit copy/approval-note affordances for
Tony diagnostic drafts without autonomous UI execution, show saved
diagnostic-preview provenance/status labels, show richer diagnostic-chain
evidence, expected-signal, root, and depth detail, and stage local pending
approval previews for command observations without executing or approving
commands. Hedwig can now save a local source record from a triaged
capture URL without fetching or validating the page, create local reminder
proposals without scheduling or notifying, and create local message draft
proposals without sending or posting. Hedwig proposal details now expose richer
local review metadata, editable local review fields, and pending local
approval-record previews for source/reminder/message proposals, while Surfer
Source History now has owner/scrubbed filters plus richer event detail.
Next, decide whether to:

- Keep the Obsidian session handoff archive current at every closeout:
  update the repo handoff, write the dated snapshot, and update the Obsidian
  session history index.
- Extend Project Lab's read-only integration slice with filtering, per-project
  detail drawers, or local-only approval dashboard views. Keep it
  proposal-only: no command execution, external repo edits, Notion/Slack writes,
  browser/search, or source fetching from Project Lab.
- Polish the new Project Lab Local Inspector: add local filters by queue type,
  better truncation/detail affordances, or a single local approval-dashboard
  view that still does not approve, execute, browse/search, send, fetch, or
  write externally.
- Add optional read-only row detail routes only if the inspector needs richer
  context than the current bounded local metadata. Keep status changes and
  approval decisions out of Project Lab until the user explicitly asks for an
  approval workflow.
- Consider adding a compact "why shown" badge for the `Attention` project-card
  filter so each visible project explains which local queue brought it into the
  view.
- The attention "why shown" row is now live; future polish can improve wording
  or add visual severity ordering, but keep it read-only.
- Filtered Project Lab views now have first-pass visual severity ordering.
  Future polish can tune the weights or expose them in a help/detail surface,
  but should keep the view read-only until an approved workflow exists.
- Consider moving repeated Project Lab signal scoring/types into a small local
  helper if the panel grows further; keep the current implementation local while
  this surface is still settling.
- If Project Lab ranking becomes more than a visual aid, move the scoring
  policy into a named server/API contract and have Batman/Cortana explicitly
  label it as a strategy proposal. For now it remains UI-only.
- Future inspector polish can remember the user's last selected queue per
  project, but only as local UI preference unless an explicit audit/read-state
  model is designed.
- Obsidian vault root is currently clean after approved deletion of the three
  empty/stub files. Continue using append-only session snapshots under
  `90_Archive/CereBro Session History/snapshots/`.
- Project Lab Local Inspector readability polish was verified in the in-app
  browser at `http://localhost:3002/`; dev server is running on port 3002.
- Project Lab Git inspector is now live and was verified in the in-app browser:
  the `Dirty` filter opens the inspector on the `Git` tab with local status
  rows. Keep it read-only/proposal-only.
- Project Lab filtered cards now show local score-breakdown chips. Future polish
  can tune wording or move scoring into a named strategy proposal, but do not
  treat the current chips as persisted priority or review history.
- Project Lab signal blocks now open their matching Local Inspector queue. Future
  polish can add similar local-only drill-down for dirty worktree rows, but keep
  git operations out of the UI unless explicitly approved.
- Project Lab Worktree Changes now opens the Git inspector directly. Future
  polish should improve read-only review ergonomics, not add git operations.
- Project Lab inspector lists now disclose when a queue is capped at 12 visible
  rows, and recent card rows open matching inspector queues. Future work can add
  richer local-only filtering/searching inside the inspector.
- Project Lab Local Inspector now has local-only search. Future work can add
  safe sort/group controls or per-queue filter chips, still without action
  buttons or external side effects.
- Project Lab Local Inspector now also has local type chips plus Reset for active
  queue filters. Future work can add sort controls or saved local preferences
  only if a read-state/audit model is explicitly designed.
- Project Lab Local Inspector now also has local sort controls. Future work can
  add saved local preferences only if a read-state/audit model is explicitly
  designed.
- Project Lab now has a Sources project-card filter and a local Signals strip.
  Future work can add richer source review affordances, but source fetching and
  external browsing remain gated.
- Project Lab now has a top Next Safe Actions strip. Future work can add
  proposal-only action drafts, but actual execution/approval remains out of
  Project Lab until explicitly designed.
- Project Lab top summary counts now navigate to matching local filters. Future
  polish can make all dashboard/count surfaces consistently navigable while
  keeping them read-only.
- Project Lab Next Safe Actions now expose compact local reason chips. Future
  polish can improve density/responsiveness, but keep the strip explanatory.
- Project Lab empty-filter states now offer a safe return to All plus local
  signal chips. Future polish can tune copy per filter.
- Project Lab Missing filter is now first-class and wired from the top Missing
  summary count. Future polish can improve missing-path remediation proposals,
  but keep actual clone/fetch/create/repair operations outside Project Lab
  until explicitly approved.
- Project Lab top Local Repos count now resets the project-card view to All.
  Future polish can make the remaining passive summary cells explain why they
  are not clickable.
- Project Lab summary/filter controls now have clearer accessible names and
  active filter state. Future polish can add visible focus styling refinements
  if the current ring is too subtle in the Keep palette.
- Project Lab passive summary cells and empty-filter controls now also have
  clearer accessible labels. Future polish can continue this pattern across
  inspector row controls.
- Project Lab Local Inspector controls now also have clearer accessible labels
  and active states. Future polish can add the same treatment to Project Lab
  card-level recent rows and signal blocks if needed.
- Project Lab card-level drill-down controls now also have clearer accessible
  labels. Future polish can tune visible focus states and wording, but the
  current behavior remains read-only local navigation.
- Project Lab empty-state reset naming now distinguishes reset from filter
  selection. Future polish can tune visible labels if the concise `All` button
  proves unclear.
- Project Lab close/search controls now have direct accessible names. Future
  polish can apply this same pattern to other panels before broader workbench
  routing lands.
- Project Lab top Close button now explicitly uses `type="button"`. Future UI
  hygiene passes can scan other panels for the same form-safety pattern.
- Project Lab main panel, project cards, and inspector panes now have clearer
  accessible region labels. Future polish can continue this pattern across the
  broader Keep panels.
- Project Lab filter summaries and inspector row counts now use polite status
  semantics. Future polish can tune which dynamic counters should announce
  changes if the UI becomes too chatty.
- Project Lab current task rows and worktree change rows now expose list
  semantics. Future polish can continue this pattern for other non-interactive
  repeated metadata groups.
- Project Lab and Local Inspector regions now expose busy state. Future polish
  can carry this pattern into other panels that load local queues.
- Keep left-rail nav buttons now have accessible names in collapsed icon mode
  and expose the active section with `aria-current`. Future polish can scan the
  remaining top-bar/context buttons for the same explicit label/type pattern.
- Keep top-bar controls, floor selector, command bar, context session selectors,
  and shell landmarks now have clearer accessible labels/states and explicit
  button types. Future bundled passes can apply the same pattern to individual
  panels such as Hedwig, Terminal Lab, Sources, Outputs, Tasks, and Memory.
- Keep the Aang Companion Overlay in the route now. First pass should be a
  narrow design/spike: desktop shell choice, allowed local events, click/hotkey
  quick ask, open-Keep routing, park/sleep/mute controls, and lore-accurate
  quiet idle states. Do not build external notifications, Slack/Notion writes,
  screen reading, or private app automation into the overlay without explicit
  approval.
- The master plan now explicitly requires a modular in-app workbench function.
  Session 12 owns the core surface and MVP: live localhost preview, public
  browser, captured screenshots, uploaded/generated images, video/key frames,
  annotation tools, send-to-agent routing, terminal/log output, validation
  notes, evidence ledger, and before/after comparisons. Session 10 owns
  image/video review and generation planning. Session 11 owns the agent-readable
  evidence records, approval gates, and self-review permissions.
- The master/model-router plans now explicitly require the reasoning-router
  direction: a Model/Tool Capability Registry, Surfer's current model/tool/free
  tier discovery lane, a Reasoning Gateway decision, prompt/tool routing
  playbooks, eval-backed routing, cost/rate-limit logs, and validation loops.
  Start proposal-only: no gateway install, model download, provider account,
  API key, external call, or OpenClaw integration until the route and approval
  surface are reviewed.
- Extend the lightweight reusable prompt/tool handoff memory flow beyond command
  intake: add project/source/reason metadata fields, better ranking, and a
  conversational reuse path that says "which prompt" and "why" before any
  external tool/model use.
- Review and approve or revise the proposal-only Notion capture database schema
  and Slack connection shape surfaced in Hedwig Capture Inbox.
- Retrieve and wire Hedwig's PixelLab `idle-flutter` animation frames once an
  exposed frame/download endpoint is available.
- Replace temporary Hedwig directional derivatives with true PixelLab
  directional rotations if a suitable character/object workflow is approved.
  Add matching Hedwig floor/wall assets.
- Polish path-graph walking: add corridor/landing waypoints where stairs
  visually connect, avoid wall-band shortcuts, tune travel speed per sprite
  size, and add visible path/debug toggles only if useful.
- Extend Terminal Lab safely: add a fuller local-only detail inspector for one
  observation, group diagnostic chains, or add Oak/Spock validation preview
  notes before command approval. Keep UI execution disabled and keep
  package/GitHub/network actions approval-gated.
- Extend Hedwig safely: add better filtering/sorting for local proposals,
  duplicate capture detection, or a local-only approval dashboard. Keep
  Notion/Slack writes gated until exact schema/scopes are approved.
- Implement append-only learning policy in code surfaces: make sure future
  logs, running notes, command/output history, approval records, source
  provenance, cleanup history, and prompt/tool handoff history append or version
  instead of overwriting, while current-state summaries remain editable.
- After approval, add `NOTION_CAPTURE_DATABASE_ID` support and an explicit
  approved Notion capture writer. Do not create/write the database until the
  user approves the exact schema and Notion workspace target.
- After approval, install/configure Slack app scopes for Hedwig DM and/or one
  capture channel. Do not connect Slack until the user approves exact scopes and
  surfaces.
- Add approved open-web search to Surfer Sources.
- Add richer source extraction/validation beyond the current metadata and
  summary scrubber.
- Add a proposal-only Reddit Intelligence design slice before fetching Reddit:
  subreddit watchlist model, source record schema additions, media-reference
  manifest shape, trend-radar scoring, source-confidence criteria, and approval
  gates for public capture vs OAuth setup.
- Add a local-only "save Reddit item" preview path through Hedwig that accepts a
  pasted Reddit URL and stages a source proposal without fetching, downloading,
  writing Notion/Slack, or promoting memory.
- Persist project profiles/status snapshots into the harness DB.
- Add session linkage to Tasks and Project Lab.
- Extend Project Lab action drafts with richer draft detail, conversion-to-task
  proposals, or project-specific templates. Keep draft-to-task conversion
  explicit and keep repo edits out of Project Lab.
- Project Lab action drafts now remain visible by profile slug before a harness
  project row exists. Future draft work can add explicit draft-to-task
  proposals, but should keep task creation separate from draft creation.
- Bring GitHub connector data into Project Lab after explicit approval for the
  read scope.

Keep Piccolo read-only until cleanup rules are approved. Do not edit external
project repos without an explicit project-specific request.

Next-session starter prompt:

```text
Read CEREBRO_SESSION_HANDOFF.md, CEREBRO_MASTER_BUILD_PLAN.md, CEREBRO_PROJECT_INTELLIGENCE_PLAN.md, CEREBRO_MODEL_ROUTER_BASELINE.md, and CEREBRO_FILE_LIFECYCLE_PLAN.md first. Continue Session 4 from the live Project Lab, command intake, Surfer Sources, prompt/tool handoff memory, Hedwig Capture Inbox, Hedwig-as-agent Keep slice, Terminal Lab, Approval Queue, first runtime use-spot/path-graph movement, Aang Companion policy shell, Workbench policy shell, the new global append-only learning law, the new general image-understanding requirement, the new global permission-mode direction, the new reasoning-router/model-tool opportunist direction, and the new Reddit Intelligence source lane. Project Intelligence currently has static read-only profiles, local git status, Batman strategy support, deterministic command-intake previews, explicit intake-to-task creation with project linking/project-name display, Tasks project filtering, Project Lab task rollups, Project Lab read-only Git inspector rows for dirty worktrees, Project Lab filtered-card score breakdown chips, Project Lab local signal-block drill-down into inspector queues, Project Lab worktree drill-down into the Git inspector, Project Lab recent-row drill-downs, capped-list disclosure, local inspector search, type chips, sort controls, Signals strip, Sources filter, Missing filter, Local Repos reset-to-All navigation, accessible summary/filter button labels, passive summary and empty-state accessibility labels, Local Inspector accessibility labels, card drill-down accessibility labels, distinct empty-state reset label, close/search accessibility labels, close-button type hygiene, region accessibility labels, status live-region semantics, non-interactive list semantics, busy-state semantics, Keep left-rail and shell accessibility labels, Next Safe Actions strip, Next reason chips, summary-count navigation, empty-filter state, and local action drafts that remain visible by profile slug before a linked harness project row exists, Terminal Lab/Hedwig local observation rollups, self/system improvement categories, a modular panel model, a Surfer source panel scaffold, a local-only Model Tools panel for capability proposals, eval notes, and route previews, a global permission-mode shell with append-only local mode events, advisory permission preflight checks, append-only permission preflight audit records, and a shared server permission-policy helper used by both the Permissions router and Workbench evidence records, a read-only local Approval Queue with status/origin/project/search filters, local grouping, deterministic Oak/Spock preflight notes, and read-only permission preflight audit visibility, a proposal-only Workbench shell with evidence surfaces/permission classes/append-only evidence record shape plus local Workbench evidence record create/list/filter/detail, linked permission preflight ids and preflight detail on evidence records, validation notes that record their own local permission preflight rows, local evidence grouping by project/kind/source/command/validation status, source/command/task/session/artifact picker labels, task/session/artifact grouping, and append-only validation history in the evidence inspector, a proposal-only Aang Companion shell policy with allowed local events/blocked actions/web-mock-first route plus live local event-count strip, approved one-URL public ingestion, first-pass saved-source trust/scrub metadata, Reddit marked as a first-class V1 human-signal source lane, Slack marked as required V1 Hedwig capture, Notion marked as the structured capture database, Obsidian session handoff snapshots/index notes are approved append-only standing closeout behavior, and global history/log/archive/index/note trails must append or version while canonical current-state summaries may update in place. CereBro must understand images as a general input type, not only creative assets or setup screenshots: the user should be able to drag in screenshots, UI states, account screens, app errors, artwork, mockups, diagrams, photos, charts, whiteboards, generated images, and other still images, then ask open-ended questions about them. Video starts with frame/key-frame understanding and annotation. The modular in-app workbench is now a locked product direction: CereBro should show live localhost previews, public browser views, screenshots, images, video/key frames, annotations, terminal/log output, validation notes, and before/after comparisons inside the app; these surfaces are user-visible and agent-readable evidence, not hidden background tools. Add a Codex-like global permission-mode control across all work, not just media: `Default permissions`, `Auto-review`, and `Full access`. Default reads explicit user-provided context and guides. Auto-review proactively inspects approved visible/local evidence and queues suggestions. Full access uses enabled tools in the session, while hard gates still require visible approval for payments, account permission grants, destructive commands, deleting/overwriting files, sending messages, publishing, uploading private media externally, saving sensitive screenshots to memory, installs, tokens/API keys, and sealed Raven/NSFW scope. Vault/Obsidian durable text writers now create timestamped versions on same-title filename collision instead of overwriting, Artifact Library labels its saves as durable history/draft/report trails rather than current-state overwrites, source saves now split current-state `sources` rows from append-only `source_events` provenance, and Surfer Sources displays recent source history events with local owner/scrubbed filters and richer event detail. Aang Companion Overlay is planned as a small always-on desktop surface and now has a proposal-only Keep policy panel for keeping tabs on CereBro: ambient idle presence, click/hotkey quick ask, short status bubbles, open-Keep routing, time-of-day reactions, and quiet lore-accurate idle loops such as goofy fidgeting, tiny airbending practice, sitting, breathing, balancing, and sleepy states. Aang remains an agent, not a pet in the roster. Cortana still routes requests, Hedwig still owns capture/reminders, and Piccolo still owns hygiene. Terminal Lab is a proposal-only panel/router that classifies commands, explains risk, records local preview observations, infers known project links from cwd, accepts manually pasted observed-output summaries with light redaction, can link observations to selected tasks/sessions, filters observations by selected task/session, surfaces deterministic Aang/Tony follow-up suggestions from observed output, surfaces read-only Tony diagnostic command drafts, can convert one of Tony's generated diagnostic drafts into a normal local Terminal Lab preview with parent/root/depth provenance, has copy/approval-note affordances for Tony diagnostic drafts, shows parent-observation provenance and a diagnostic-preview status label on saved diagnostic previews, includes explicit diagnostic evidence and expected-signal notes for Tony draft commands across port conflicts, missing modules/packages, TypeScript symbol errors, package-tool failures, git state, missing files, permission errors, and unclear non-zero exits, supports local observation detail/status transitions, can stage pending local approval-preview rows for command observations without approving or executing commands, can create normal local follow-up tasks from observations, can stage Aang learning-note memory proposals from observations, and never executes commands or writes durable memory directly. Reusable prompt/tool handoffs can be saved as approved vault artifacts, searched read-only, and surfaced in command intake for `prompt_reuse` requests with required reuse disclosure. CereBro must now grow this into a routing playbook tied to the Model/Tool Capability Registry: target model/tool, prompt style, example result, privacy constraints, free-tier sufficiency, eval notes, source URLs, and failure notes. Surfer should propose current models/tools/free tiers only with sources and date checked; Cortana routes; Batman risk-reviews; Spock/Oak validate; Piccolo tracks stale registry entries, cost/rate limits, and storage. Candidate gateway/eval paths include LiteLLM, OpenRouter, direct provider SDKs, a CereBro-native gateway, promptfoo, DeepEval, and custom Vitest fixtures, but do not install or connect any of them without approval. Hedwig has a proposal-only Inbox panel with Notion capture DB schema, Slack DM/capture-channel shape, approval gates, routing rules, local capture preview persistence, recent capture history, read-only triage proposals for saved captures into task/source/learning/reminder/message routes, an explicit `Create Local Task` action that links a capture to a normal local CereBro task without external writes, an explicit `Save Source` action that creates a local unfetched source record plus source event from a capture URL without browsing/fetching, an explicit `Create Reminder Proposal` action that creates a local reminder proposal without scheduling/notifying, an explicit `Create Message Draft` action that creates a local draft proposal without sending/posting, local proposal detail/status transitions for source/reminder/message proposals that remain metadata-only and do not approve external action, editable local review fields for priority/notes/approval scope/external target, and pending local approval-preview rows for source enrichment, Notion capture write, Slack capture read, reminder scheduling, and message sending without approving or executing those external actions. The Approval Queue reads those Hedwig and Terminal approval-preview rows across local surfaces, joins them back to project/task/source/command/capture metadata when available, and still cannot approve, reject, execute, fetch, send, schedule, or write. The Workbench panel defines preview/browser/media/annotation/terminal/validation/comparison surfaces, can create manual local append-only evidence records, filter/group/inspect evidence details, link sources/commands/tasks/sessions/artifacts, append validation notes, show validation history, and does not open tools; the Aang panel defines event policy, local mock controls, live local event counts, and in-app event routing buttons but starts no desktop process. Hedwig is now the 11th agent in router/Keep metadata with a split Crypts Messenger Roost, scaled PixelLab owl sprite, motion config, use-spots, council spot, and path-graph node, and KeepScene now loads directional textures, uses idle/hero/council use-spots for actual movement, swaps facing frames, keeps emotes attached to moving sprites, routes `walking-to-ceremony` through a first BFS path graph into Cortana's hub, and avoids restarting movement tweens when state refreshes do not change an agent state. Do not emphasize session handoffs as a big UI surface; they live in Obsidian. Start proposal-only or implement a small safe slice: continue auditing code surfaces for accidental overwrites of logs/history/notes, add current-state writer proposals only where truly needed, deepen Approval Queue drill-downs or grouping without adding action execution, build the web-only Aang Companion mock inside the Keep without desktop permissions, deepen Workbench task/session linking and validation status display while keeping validation append-only before wiring browser/media automation, prototype image drag/drop artifact intake as temporary-by-default, define the hosted/local vision adapter interface without sending images externally, extend Project Lab local action draft history with status/version trails or add explicit draft-to-task proposals without edits, retrieve and wire Hedwig's PixelLab idle-flutter animation frames if an exposed endpoint is available, replace temporary Hedwig directional derivatives with true PixelLab owl rotations, polish path-graph walking with stair/landing waypoints, revise/approve Hedwig schema details, add approved Notion capture writer only after approval, richer reusable prompt/tool handoff metadata and ranking, proposal-only Reddit Intelligence design, local-only Hedwig Reddit URL save previews, approved open-web search, richer source extraction/validation, project profile persistence, or session linkage. At closeout, update `CEREBRO_SESSION_HANDOFF.md`, save a unique timestamped Obsidian snapshot to `90_Archive/CereBro Session History/snapshots/`, and append a new link to `90_Archive/CereBro Session History/CereBro Session History.md` without overwriting any prior snapshot/index entry. Do not write to Notion/Slack or edit external project repos without explicit approval, and do not move/delete existing vault or repo files.
```
