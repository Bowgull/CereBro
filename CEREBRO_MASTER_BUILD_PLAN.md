# CereBro Master Build Plan

Last updated: 2026-05-07

## Summary

CereBro is a local-first, free-cloud-supported personal command center for
everyday work, project building, creative production, research, learning,
portfolio growth, and freelance work.

The Keep remains the branded command center, but the build priority is:

1. Safety, storage, and session handoff.
2. Model routing and local-first power.
3. Personal command intake and project intelligence.
4. Source/search/research.
5. Learning/output memory.
6. Aang companion surface.
7. Creative studio.
8. Agent runtime.
9. UI/animation polish.

Core defaults:

- Local-first, not local-only.
- Free cloud only unless explicitly approved.
- Google Drive vault for generated files and deliverables.
- SQLite/libSQL/Turso for structured brain.
- Obsidian for durable knowledge.
- Notion for polished learning/client outputs and the structured capture inbox.
- Slack is required in V1 as Hedwig's quick-capture intake.
- Reddit is a first-class V1 source lane for human signal, trend sensing,
  niche research, media references, and lived reports. Treat it as evidence
  with provenance, not as truth and not as model-training data.
- Cleanliness is a first-class product requirement: every workspace, message,
  image, video, code artifact, source, note, and temp file needs an owner,
  destination, metadata trail, retention rule, and cleanup path.
- The detailed file lifecycle design lives in `CEREBRO_FILE_LIFECYCLE_PLAN.md`.
- Append-only learning is a global rule: history/log/archive/index/note trails
  accumulate, while canonical current-state summaries may update in place.
  CereBro cannot learn the user's needs if its historical evidence is silently
  overwritten.
- The detailed personal command center and project intelligence design lives in
  `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- Freelance work is a mode inside the broader command center, not the foundation.
- Surfer can research only with approval.
- External model calls require approval.
- CereBro should become a model/tool opportunist, not a one-provider assistant.
  It should learn which hosted models, local models, free-tier tools, and
  specialty services work for which jobs, then route through the best available
  lane with visible approval and recorded evidence.
- The user wants to use free and generous hosted AI tiers where practical:
  DeepSeek-style reasoning/coding models, Gemini/Nano Banana-style image or
  vision tools, OpenRouter-style multi-model access, PixelLab-like generation
  tools, spreadsheet/document helpers, OCR, browser/research tools, and future
  services Surfer finds. CereBro must treat these as current, changing external
  services that need source verification, privacy review, and reuse memory.
- Strong reasoning depends on a frontier-model lane for hard work. Multiple
  weaker/free models do not automatically equal a frontier model. CereBro earns
  better results by routing carefully, packaging the right context, evaluating
  outputs, and escalating only when the task needs it.
- Add a Model/Tool Capability Registry as a core brain table/surface: provider,
  model/tool name, access method, free tier and rate limits, cost, context/input
  limits, modality support, strengths, weak spots, privacy class, prompt style,
  eval scores, failure notes, approval level, last verified date, and source
  links.
- Model/tool routing must be evidence-backed. CereBro should keep a small eval
  suite for real user tasks and record which models/tools passed, failed, or
  were rate-limited. Routing choices should cite this memory when available.
- Surfer owns current discovery of models, tools, free tiers, prompt recipes,
  GitHub projects, docs, comparison posts, and risk reports. Surfer proposes;
  Cortana routes; Batman threat-models; Spock/Oak validate; Piccolo watches
  cost, storage, rate limits, and stale registry entries.
- Heavy media tools require storage/compute review.
- No generated asset is saved only in chat.
- No destructive cleanup without approval.
- CereBro needs a modular in-app workbench function, similar in spirit to the
  Codex app: live localhost preview, browser view, screenshot/image/video
  review, annotation canvas, logs, terminal output, validation notes, and
  before/after comparison surfaces. These are user-visible panels and
  agent-readable evidence, not invisible background tool calls.
- CereBro's core work loop should be visible and repeatable: run local host,
  open preview, capture screenshot, inspect the result, annotate the issue or
  target, reason against the request/reference, patch, rerun checks, and
  preserve the evidence trail.
- The workbench is a required V1 capability. It is how the user shows CereBro
  things, how CereBro shows its own work, and how agents reason from the same
  visible evidence instead of relying on chat text alone.
- General image understanding is a core input, not a creative-only feature.
  CereBro must be able to read user-supplied screenshots, UI states, setup
  screens, app errors, artwork, mockups, diagrams, photos, charts, whiteboards,
  generated images, and other still images. The user should be able to drag in
  an image and ask anything about it.
- Video support starts with frame/key-frame understanding, annotation, and
  comparison. Richer video reasoning can grow later, but the first useful
  version must let CereBro inspect selected frames and answer questions about
  what is visible.
- CereBro's long-term operating model is perception -> reasoning -> action ->
  permission. Perception includes text, files, screenshots, images, video
  frames, previews, browser pages, terminal output, app state, and eventually
  desktop context. Action includes code edits, commands, browser operation,
  file movement, artifact creation, messages, reminders, publishing, and
  account/workspace operations. Permissions govern all of it.
- Add a global permission-mode control, similar in spirit to Codex's mode
  selector. Default permissions allow explicit user-provided context and
  guidance only. Auto-review allows proactive inspection of approved visible or
  local evidence and queues suggestions. Full access allows enabled tools within
  the current session, while high-risk actions still require visible approval.
- Hard gates remain regardless of mode unless the user explicitly changes the
  policy: payments, account permission grants, deleting/overwriting files,
  sending messages or emails, publishing, uploading private files/images
  externally, saving sensitive screenshots to memory, installing system-level
  software, giving tokens/API keys to tools, destructive commands, and sealed
  Raven/NSFW scope.
- CereBro should learn reusable prompts and external tool/model handoffs over
  time. When it suggests reusing or adapting one, it must say which prompt it is
  using, why it applies, and whether an external tool/model call needs approval.
- Aang should become the always-on companion surface for keeping tabs on
  CereBro: small, ambient, click-to-ask, and event-aware. Aang remains a full
  agent, not a pet in the roster.

## Master Session Plan

### Session 1 - Reset, Audit, And Handoff Protocol

Create and maintain `CEREBRO_SESSION_HANDOFF.md`.

Do:

- Audit repo state, dirty files, storage footprint, and app health.
- Record current goals, what is done, what is left, and known risks.
- Establish every-session closeout: files changed, tests run, bugs, storage impact, next prompt.
- Add approved Obsidian snapshots of session handoffs plus a session index.
  This is now standing closeout behavior for CereBro build sessions.
- Identify cleanup candidates only; no deletion without approval.

Acceptance:

- Future sessions can restart from the handoff file without rereading all planning docs.

### Session 2 - Hardware, Model Router, And Local-First Policy

Do:

- Record Mac profile: M2, 8GB RAM, current free disk.
- Confirm Ollama install status.
- Decide/install only approved lightweight local models.
- Populate model registry with tested local candidates.
- Add escalation policy: local first, external only with approval.
- Expand the router from local-vs-external classes into a capability registry
  for local models, hosted frontier models, free-tier hosted models, specialty
  generation/vision tools, and model gateways.
- Track free-tier constraints and current access paths without assuming they
  stay stable: login/API key needs, rate limits, context limits, allowed data,
  privacy posture, and best prompt style.
- Evaluate whether CereBro should use a gateway such as LiteLLM/OpenRouter or a
  small CereBro-native gateway first. The goal is one routing interface with
  provider-specific limits, fallback, logging, and approval gates.
- Add eval-backed routing as a requirement: models/tools only become
  recommended defaults after passing small CereBro task tests.

Default model approach:

- Local: summaries, formatting, tagging, learning drafts, source cards, light reasoning.
- Free/generous hosted tiers: first-pass research, code explanation, image or
  vision attempts, brainstorming, OCR/translation, prompt experiments, and
  specialty tasks after visible approval and privacy review.
- External: complex coding, architecture, long context, hard validation, only with approval.
- Tony creates model-specific handoff prompts when escalation is justified, and
  useful handoff prompts can be saved as reusable prompt memory.
- Frontier lane: keep at least one me-level reasoning/coding/vision model
  available for tasks where quality matters more than conserving free calls.

Acceptance:

- CereBro can say which model class each agent should use and why.
- CereBro can say which specific model/tool it proposes, what evidence supports
  that route, what will be sent externally, what approval is needed, and how it
  will validate the result.

### Session 3 - Storage Root, Drive Vault, And File Lifecycle

Do:

- Use `CEREBRO_FILE_LIFECYCLE_PLAN.md` as the implementation source.
- Configure `CEREBRO_VAULT_DIR` to a Google Drive synced CereBro vault.
- Define folder structure for projects, sources, outputs, images, videos, renders, code artifacts, message drafts, temp, inbox, review, archive, and trash-staging.
- Ensure generated assets do not default into the repo.
- Store artifact metadata in SQLite/libSQL.
- Keep Obsidian for durable Markdown knowledge.
- Keep Notion for polished output pages.
- Define file lifecycle states: inbox, active, review, published, archived, trash-staged, deleted.
- Require every generated/saved file to carry enough metadata to answer:
  project, agent owner, source/prompt, output kind, storage path, created time,
  approval status, retention rule, and cleanup eligibility.
- Establish Piccolo's cleanup authority: Piccolo can scan, report, dedupe,
  archive, and propose cleanup by default; destructive deletes require explicit
  user approval until approved cleanup rules exist.
- Establish Obsidian/Notion hygiene: Obsidian gets durable knowledge notes;
  Notion gets polished pages. Draft clutter, duplicate exports, stale temp
  notes, and abandoned generated files must be routed to review/archive instead
  of accumulating silently.

Acceptance:

- Every generated/saved file has a destination, metadata, retention rule, and
  cleanup policy, and CereBro can explain what will happen to the file over
  time before it creates it.

### Session 4 - Personal Command Center And Project Intelligence

Do:

- Use `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md` as the implementation source.
- Add everyday intake categories before project routing: quick answer, note,
  decision, reminder, message, learning, research, creative, file hygiene,
  project build/design/QA/ship/package, portfolio, freelance, source capture,
  prompt reuse, artifact write.
- Add read-only project profiles for Declyne, Waymark, Sygnalist, Bridgefour,
  and CereBro.
- Track local path, GitHub repo, stack, status, dirty worktree state, priority
  class, current mode, risk flags, and next recommended action.
- Reframe the UI from a freelance workspace into a Project Lab / command center
  surface.
- Keep freelance/client concepts as optional project metadata, not the default
  shape of every project.
- Treat Declyne as a market candidate with Plaid, UI/UX, financial logic,
  privacy/security, and App Store readiness tracks.
- Make Tony a repo continuation engineer, Gojo a product/design/portfolio
  intelligence agent, Cortana the intake/router, Oak the high-stakes validator,
  and Piccolo the project-aware hygiene reporter.

Acceptance:

- CereBro can explain what the user is working on, which mode a request belongs
  to, which agent should own it, what is safe to do next, and whether the work
  belongs to everyday life, a personal app, portfolio packaging, or freelance.

### Session 5 - Source Library And Hybrid Search

Do:

- Build saved-source ingestion first: URLs, notes, files, GitHub references, pasted research.
- Add provenance, freshness, trust level, summaries, citations.
- Add a Reddit Intelligence lane under Surfer:
  watched subreddits, post/search captures, selected comment pulls,
  trend/radar summaries, outbound links, image/video references, and community
  disagreement tracking.
- Start with conservative public-source capture or approved OAuth setup.
  Do not bypass blocks, use proxy scraping, harvest deleted/private content, or
  train/fine-tune models on Reddit content.
- Store Reddit items as source records with subreddit, post URL, capture time,
  score/comment context, media kind, summary, confidence notes, and why the item
  was saved.
- Separate Reddit signals into stages: raw capture, summarized source,
  recurring pattern, approved memory. Most Reddit items should not become
  durable memory until Oak/Spock validation or user approval promotes them.
- Build a Reddit trend radar that looks for repeated questions, repeated
  complaints, cross-subreddit emergence, strong disagreements, screenshots,
  demos, and links cited as evidence.
- Support captures that originate from Slack/Notion/Hedwig by preserving the
  original link, message context, source type, project guess, and follow-up
  status.
- Let Surfer propose new tools/models/sites when they fit the work, with source
  URLs and a clear reason. Do not treat recommendations as reliable without
  current sources and approval for external use.
- Add Surfer's Model/Tool Discovery lane: search current sources for strong
  free or low-friction AI services, provider docs, GitHub repos, prompt recipes,
  free-tier limits, rate-limit reports, privacy warnings, and examples of best
  use.
- Save model/tool discoveries as source-backed registry proposals, not facts.
  Each proposal needs source URLs, date checked, what task it helps, what data
  would be sent, and what approval or account setup is required.
- Add search abstraction with simple SQLite/local search first.
- Keep Meilisearch as later upgrade.
- Surfer handles approved external research only.

Acceptance:

- CereBro can save, search, cite, and reuse research, including Reddit human
  signal with visible provenance and confidence notes.

### Session 6 - Aang Learning Mode And Companion Overlay

Do:

- Make Aang the teaching front door.
- Support guides, quizzes, flashcards, checklists, LearningPaths, weekly learning summaries.
- Connect learning outputs to Source Library, Obsidian, Notion, and Tasks.
- Save learning progress only with approval.
- Add the first Aang Companion Overlay plan and thin implementation target:
  a small always-on desktop surface that can idle, show one short status bubble,
  accept click/hotkey quick ask, and open the full Keep when needed.
- Keep Aang lore-accurate and quiet: goofy idle loops, tiny airbending practice,
  sitting, breathing, glancing, dozing at night, and waking gently. No combat
  stance, large effects, constant motion, or attention-stealing animation.
- Define the overlay as a CereBro surface, not a separate agent. Cortana still
  routes requests. Hedwig still owns reminders/capture. Piccolo still owns
  hygiene. Aang presents the small visible edge.

Acceptance:

- CereBro helps the user understand what they are building, not just produce
  outputs. The first companion-overlay design is locked with a narrow safe
  build path.

### Session 7 - Output Library, Obsidian, And Notion

Do:

- Make outputs first-class: specs, briefs, source summaries, learning notes, client docs, creative plans.
- Obsidian receives durable Markdown notes, including approved CereBro session
  handoff snapshots and an index note for build history.
- Notion receives polished user-facing/team-facing pages after approval.
- Notion also becomes the structured capture database for quick ideas, links,
  TikToks, Reddit posts, articles, conversation notes, learning seeds,
  reminders, and "save this for later" items.
- Reddit captures may enter through Notion/Hedwig as links, posts, comments,
  media references, or trend notes. Notion stores the capture/review queue;
  Obsidian stores only approved durable syntheses or session history.
- Add a lightweight Prompt/Tool Handoff memory lane for reusable prompts,
  external-model handoff prompts, PixelLab prompts, spreadsheet prompts, and
  tool URLs that worked well. This is surfaced conversationally, not as a large
  primary UI surface.
- Extend Prompt/Tool Handoff memory into a reusable routing playbook. It should
  preserve the prompt, target model/tool, input format, example result, failure
  notes, privacy constraints, source/provenance, and whether the free tier was
  sufficient.
- Oak validates important/source-backed/saved outputs.
- Add output hygiene rules: avoid duplicate notes/pages, link related outputs
  back to projects/sources, mark drafts vs final versions, and give Piccolo
  enough metadata to find stale, orphaned, or superseded outputs.

Acceptance:

- Valuable work no longer disappears into chat context, and obsolete work does
  not quietly clutter Obsidian, Notion, or the vault.

### Session 8 - Hedwig And Piccolo Operations Layer

Do:

- Add Hedwig as Messenger/Comms agent in the Crypts with Piccolo.
- Hedwig visual: messenger owl.
- Piccolo: cleanup, backup, schedules, workspace hygiene, stale file reports,
  duplicate detection, archive proposals, temp/render pruning proposals, and
  storage pressure warnings.
- Hedwig: reminders, notifications, message drafts, Slack capture, email bridge
  planning, and message lifecycle hygiene so drafts, sent items, follow-ups,
  captured ideas, and archived communications stay attached to the right
  project/client/context.
- Hedwig should accept "save this Reddit thread/post/comment/media" captures
  from Slack, Notion, browser share, or manual paste, then route them into the
  Source Library with no automatic browsing, downloading, posting, or external
  write unless approved.
- Hedwig and Piccolo must keep Reddit media tidy: link-first by default,
  approved local copies only when useful, vault destination required, source URL
  retained, rights note recorded, and cleanup eligibility visible.
- Feed approved local notification/status events into the Aang Companion
  Overlay: pending approval, terminal failure, captured item waiting for review,
  reminder proposal, source saved, task created, and session status.
- Keep the overlay ambient by default. It may surface a short bubble, badge, or
  click target, but it should not schedule, notify externally, read private
  channels, or send messages on its own.
- Slack is nonnegotiable for V1 as the fast personal capture lane. Start with
  approved DM or capture-channel intake, classify into the Notion capture
  database, and link back to CereBro projects, tasks, sources, or learning paths
  when useful.
- iMessage remains a later OpenClaw/macOS-permission investigation. Do not block
  Slack capture on iMessage.

Acceptance:

- Operations, reminders, messaging, quick capture, and workspace cleanliness are
  represented without bloating core agent work.

### Session 9 - Website Studio Workflow

Do:

- Build the actual website studio flow as a freelance/portfolio mode inside the
  broader Project Lab: intake, research, sitemap, copy, design direction, build
  plan, QA, delivery package.
- Tony handles implementation plans and code handoffs.
- Gojo handles creative direction.
- C-3PO formats client-facing docs.
- Oak validates.

Acceptance:

- CereBro can help produce freelance website deliverables without replacing the
  broader personal project command center.

### Session 10 - Creative Studio: Image And Video

Do:

- Build image and video as equal planning tracks.
- Build the general image-understanding path here too. This is not limited to
  creative review. CereBro must accept user-supplied images from ordinary work:
  screenshots, setup screens, account forms, permission screens, errors,
  diagrams, charts, mockups, artwork, references, and photos.
- Add image input as a first-class artifact type: temporary by default, linked
  to project/task/session when useful, and saved to the vault only after
  approval or an explicit durable-output action.
- Add a vision adapter layer with at least two model classes: hosted
  high-accuracy vision for best results, and local/private vision or OCR for
  sensitive screenshots when available. Hosted model use must be visible and
  approval-gated by the permission mode.
- Add OCR as a cheap local helper for text-heavy screenshots, with vision-model
  reasoning layered on top when layout, visuals, or ambiguity matter.
- Image: prompt library, style boards, brand assets, reference images, image
  upload/review, annotation, asset manifests, output comparisons, and approved
  generation handoffs.
- Video: script, shot list, timeline, scene segmentation, captions, overlays,
  Remotion plan, uploaded clip review, key-frame extraction, frame annotation,
  and later richer video reasoning.
- Store generated files in Drive vault.
- Track creative asset lifecycle: prompt, seed/settings when available, source
  references, draft/final status, usage rights, project/client, variants,
  selected final, rejected variants, retention rule, and cleanup eligibility.
- Keep render intermediates, thumbnails, previews, and exports out of the repo
  by default.
- No heavy ComfyUI/SDXL/render stack without approval.
- Creative surfaces must be visible in the app. The user can show CereBro an
  image or video, mark it up, compare versions, and let agents reason from that
  visible evidence before creating or revising assets.

Acceptance:

- CereBro can plan and organize creative production safely before heavy
  generation, including where files go and how unused drafts get cleaned up.
- CereBro can read user-supplied pictures and first-pass video frames inside the
  app, then tie observations, annotations, prompts, and outputs to the project
  record.
- The user can drag in any ordinary image and ask open-ended questions about
  it. CereBro can describe what it sees, read visible text when possible,
  identify likely state or intent, compare versions, and route follow-up work to
  the right agent without requiring the user to translate the image into prose.

### Session 11 - Agent Runtime Skeleton

Do:

- Wire Aang -> Cortana -> owner/support agents.
- Wire Companion Overlay quick asks through the same Aang -> Cortana route.
  The overlay collects the question. Cortana classifies it. Owner/support
  agents act only through the normal approval model.
- Add skill loader.
- Add tool registry and permission classes.
- Add model class routing.
- Add Model/Tool Capability Registry reads/writes for routing proposals,
  tested status, eval results, free-tier limits, prompt style, privacy class,
  and source-backed freshness.
- Add a Reasoning Gateway interface. Candidate paths include LiteLLM for broad
  provider normalization and fallback, OpenRouter for fast multi-model access,
  direct provider SDKs for sensitive/high-trust lanes, and a small
  CereBro-native gateway if dependency risk outweighs convenience.
- Add eval-backed routing hooks. Candidate tools include promptfoo for prompt
  and model comparisons/red-team tests, and DeepEval for agent/task/tool
  correctness checks. Keep the first suite small and based on real CereBro
  tasks.
- Add routing disclosure: CereBro must explain whether it is using local,
  free-tier hosted, paid/limited hosted, or frontier reasoning, and why.
- Add approval records and tool call logs.
- Add Oak validation gates.
- Add global permission modes across all CereBro work:
  `Default permissions`, `Auto-review`, and `Full access`. These modes govern
  code work, browser/workbench work, media review, file operations, external
  tools, account setup, messaging, reminders, memory writes, and publishing.
  They are not local to images.
- Add the perception/action permission matrix. Perception classes cover
  explicit chat context, local files, terminal/log output, localhost previews,
  public browser pages, uploaded images, screenshots, video frames, generated
  artifacts, connector data, and future desktop/app state. Action classes cover
  read-only inspection, local note/evidence creation, code edits, command
  execution, browser clicks/types, file moves, external writes, message sends,
  account permission changes, installs, publishing, and cleanup.
- Require visible explanation before escalation: CereBro should say what it
  wants to inspect or do, which permission class applies, which agent owns it,
  and what would be stored or sent outside the machine.
- Add prompt/tool-handoff reuse rules: when CereBro reuses or adapts a saved
  prompt, it must name the source prompt, explain why it applies, and ask before
  using external models or paid/heavy tools.
- Add terminal command proposal/observation permissions so CereBro can explain,
  validate, and teach command-line work without silently executing risky
  actions.
- Add workbench evidence permissions: local host preview, public browser view,
  screenshot capture, image/video frame inspection, annotation capture, and
  before/after comparison. Agents may reason from these surfaces, but external
  browsing, private data access, generation, file writes, and destructive
  actions keep their normal approval gates.
- Add workbench records to the harness: preview target, route/URL, screenshot or
  frame artifact, annotation layer, linked task/session/project, agent notes,
  validation status, and follow-up action. An annotation is not just a drawing.
  It is a routed instruction with visual coordinates and context.
- Add a self-review loop for build work: Tony implements, preview opens, Spock
  inspects screenshots/logs, Gojo reviews visual fit when relevant, Aang can
  explain what changed, and Cortana keeps the visible task thread coherent.
- Add multi-model validation patterns where useful: one model drafts, another
  model critiques, deterministic tests/checks inspect the result, and Oak/Spock
  record the final validation note. Do not chain models just to look busy.
- Add cost/rate-limit guardrails: every external call records provider, model,
  token/input size when available, free-tier/rate-limit status if known,
  approval id, and result quality/failure notes.

Acceptance:

- Agents become functional operators, not just metadata.
- CereBro has a clear global permission model for perception and action. The
  user can understand what mode is active and why a proposed action needs
  approval.
- CereBro can look at its own visible work, cite the evidence it inspected, and
  decide whether another build pass is needed.
- The user can point at a visual issue in the workbench and route that mark to
  the right agent without translating the whole problem into prose.
- CereBro can choose among local models, free hosted models, specialty tools,
  and frontier models using recorded capability evidence rather than vibes.

### Session 12 - Command Center Keep UX

Do:

- Preserve dark cinematic castle brand.
- Add/finish left rail, center workspace, right context panel, bottom Ask Aang
  bar, and approval/action area.
- Build the modular in-app workbench as a first-class function. It should
  support docked or focused panels for live localhost preview, public browser,
  captured screenshots, images, video/key frames, annotations, file/artifact
  view, terminal/log output, validation notes, and before/after comparisons.
- Workbench MVP:
  - `Preview` panel for approved local hosts and static/file previews.
  - `Browser` panel for approved public pages.
  - `Capture` action that saves a screenshot or selected video frame as an
    artifact with route/URL/task/session metadata.
  - `Annotate` mode with pen, arrow, rectangle, highlight, pin note, and erase.
  - `Send To Agent` action that routes the marked evidence to Cortana, Tony,
    Gojo, Spock, Aang, or Surfer with the annotation coordinates attached.
  - `Compare` mode for before/after screenshots or asset variants.
  - `Evidence Ledger` showing what CereBro inspected before it changed code or
    created output.
- Localhost is a core V1 workflow. CereBro should be able to run approved local
  dev servers, show them in the workbench, refresh previews, capture
  screenshots, and connect visual findings back to code changes.
- The preview/browser/media panels are bidirectional context: the user can point,
  annotate, and show CereBro things; agents can inspect the same visible
  evidence and explain what they saw.
- Add the global permission-mode control to the primary shell. It should be
  visible during normal coding, setup, research, media review, and project work.
  It is not a media-specific toggle.
- Media drag/drop belongs in the main Ask/Workbench flow. The user should be
  able to drop an image, screenshot, or supported video clip and ask a question
  immediately, with clear temporary-vs-saved handling.
- Add the Aang Companion Overlay to the UX system: positioning, park/sleep,
  mute, dismiss, expand, open Keep, quick ask, and status bubble states.
- Choose the desktop shell approach only after a local spike: Electron/Tauri
  transparent overlay, menu bar helper, or web-only mock if desktop overlay
  permissions are too heavy for V1.
- Add a modular Terminal panel plan: movable/resizable, project-aware, visible
  command/output history, Aang teaching overlays, Tony/Oak validation, and
  approval gates for agent-proposed commands.
- Castle becomes active agent/status map.
- Avoid generic SaaS and corny game UI.

Acceptance:

- UI feels like a premium AI command center inside the Keep.
- Building does not happen offstage. The app shows the preview, browser,
  screenshots, annotations, terminal output, validation state, and agent review
  loop in one coherent workbench.
- The user can use CereBro for visual and web work the same way they use Codex
  now: show it the thing, mark the part that matters, let the right agent inspect
  it, then watch the next pass happen in the same app.
- The user can see and change the current permission mode before CereBro
  inspects broader context or acts. Mode changes do not silently approve hard
  gates.

### Session 13 - Sprite And State Animation

Do:

- Add real state-driven animation after backend states exist.
- Animate idle, working, awaiting approval, validating, blocked, complete.
- Later role animations: Tony forging, Gojo creating, Aang teaching, Surfer researching, Hedwig delivering, Piccolo maintaining.
- Add Aang Companion Overlay idle and status animations. Idle should be mostly
  small loops: airbending forms, balancing, fidgeting, sitting, sleepy, and
  time-of-day variants. Status animation should stay subordinate to the bubble
  and badge.
- PixelLab generation requires explicit approval.

Acceptance:

- Animation reflects real system activity, not decorative noise.

### Session 14 - OpenClaw/Slack Adapter Review

Do:

- Re-evaluate OpenClaw after CereBro's own tool registry works.
- Treat OpenClaw as adapter/reference, not core dependency.
- Study OpenClaw for local control-plane, channel, and automation patterns, but
  do not let it replace CereBro's router, permissions, memory, validation, or
  registry. Broad desktop/file/message access is a security boundary, not a
  convenience detail.
- Use this session for iMessage/macOS automation investigation and any advanced
  Slack/OpenClaw adapter review after the required V1 Slack capture lane exists.
- Only integrate OpenClaw if it gives useful messaging/channel support without
  replacing CereBro's permissions, memory, or agent model.

Acceptance:

- Clear yes/no decision on OpenClaw/iMessage based on actual CereBro needs.

### Session 15 - Debug, QA, Portfolio Packaging

Do:

- Run tests/checks.
- Audit storage, model routing, source saving, output saving, approval gates.
- Package GitHub projects into portfolio/case-study assets.
- Identify first sellable freelance offer.

Acceptance:

- CereBro is stable enough to support real work and show the user's capabilities.

## Open Decisions For Later

- Exact local model shortlist after Ollama testing.
- Exact hosted frontier lane/provider for me-level reasoning and coding.
- Exact model/tool gateway path: LiteLLM, OpenRouter, direct provider SDKs,
  CereBro-native gateway, or a staged combination.
- Exact first eval stack: promptfoo, DeepEval, custom Vitest fixtures, or a
  small hybrid.
- Exact Model/Tool Capability Registry schema and refresh cadence.
- Which free-tier hosted services are worth first-class routes after Surfer
  verifies current limits, terms, quality, and privacy posture.
- Whether Meilisearch is worth adding after SQLite search.
- Whether ComfyUI runs locally, externally, or only by handoff.
- Whether OpenClaw earns an adapter.
- Whether Hedwig gets a full chamber later or stays in the shared Crypts ops area.
- Exact desktop shell/workbench implementation path for embedded preview windows:
  web-only iframe/WebView first, Electron, Tauri, or another local shell.
- Exact first hosted vision provider, local/private vision model, and OCR stack
  after testing against real screenshots, artwork, diagrams, and video frames.
