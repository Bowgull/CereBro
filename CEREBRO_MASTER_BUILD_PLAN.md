# CereBro Master Build Plan

Last updated: 2026-05-09

## Summary

CereBro is a cloud-backed, local-controlled personal command center for
everyday work, project building, creative production, research, learning,
portfolio growth, and freelance work.

The Keep remains the branded command center, but the build priority is now:

1. Safety, storage, and session handoff.
2. Keep-first UX reset.
3. Personal command intake and project intelligence.
4. Source/search/research.
5. Model routing and cloud-backed learning.
6. Learning/output memory.
7. Aang companion and meeting notes.
8. Keep asset pipeline and creative planning.
9. Agent runtime.
10. UI/animation polish.

Current build instruction:

- CereBro is being built to replace the Codex chat as the user's everyday AI
  operating layer.
- While CereBro is still under construction, Tony/Codex sessions remain the
  external build worker. The work they do is evidence for CereBro's future
  workflow: inspect, plan, build, verify, archive, resume.
- Installed Codex plugins affect how Tony/Codex sessions can build CereBro now.
  They do not change CereBro's product direction, architecture, agent model, or
  roadmap by themselves.
- Do not change CereBro's product shape just because a new tool exists.
  Evaluate the tool, borrow lessons, and borrow code only after
  license/security review. Wrap useful pieces inside CereBro's existing Keep,
  Workshop, agent, memory, permission, and receipt model.
- Build autonomy in stages. First make the work visible and recoverable. Then
  move repeated, proven steps into CereBro itself.
- Tony should read this plan before continuing build passes.

Current build-session plugin rule:

1. Use installed plugins when they make the current build pass better.
2. Record which plugin, skill, or connector was used when it affects evidence,
   output, storage, or privacy.
3. Keep plugin use inside the current task scope.
4. Treat installed plugins as build aids and future reference lanes, not
   automatic CereBro features.
5. Defer OpenClaw/ShibaClaw/OpenCode installs. Study them as references only.

Current front-end build path:

1. **Keep-first UX spine.** The Keep remains the product spine. The first read
   should answer what CereBro thinks the user is doing, who owns it, what proof
   exists, and what needs approval.
2. **Project Lab as map.** Project Lab shows project state, dirty work, branch,
   push readiness, active risks, and the next safe action.
3. **Terminal Lab as Aang's build-teaching lane.** Do not create a separate
   Code Lab surface yet. Fold Codebase-to-Course and Coding Lab lessons into
   Terminal Lab: explain commands, failures, check output, next safe commands,
   Tony handoffs, and Spock gates.
4. **Workbench as visual proof.** Localhost preview, browser views,
   screenshots, images, annotations, before/after, and validation evidence live
   in Workbench.
5. **Ledger as receipts.** Ledger records route, evidence, command/output,
   approvals, validation, artifacts, memory writes, and next actions.
6. **Model/Tool Registry as basement capability map.** Connected tools and
   external services are readable capability proposals, not primary product
   surfaces. Use this for Nano Banana-style vision, PixelLab, Hugging Face,
   GitHub, Notion, Browser Use, and future tools.
7. **Backend agent runtime after proof.** Build the backend agent only after the
   visible Project Lab -> Terminal Lab -> Workbench -> Ledger loop is coherent.
   The backend agent should consume the visible receipts, not replace them.

Core defaults:

- Cloud-backed, not cloud-blind.
- Local-controlled, not local-hoarded.
- Free cloud only unless explicitly approved.
- Google Drive vault for generated files and deliverables.
- Turso/libSQL cloud is the preferred structured brain once configured.
  Local SQLite is the development cache and fallback, not the long-term center.
- Cloud vector retrieval is the preferred RAG path. Local Chroma or local
  embeddings are smoke-test and fallback lanes unless the user approves the
  disk cost.
- Obsidian is the durable Markdown knowledge layer. It is readable history and
  synthesis, not the vector database and not the model brain.
- Notion for polished learning/client outputs and the structured capture inbox.
- Slack is required in V1 as Hedwig's quick-capture intake.
- Sundesk simplification is the product benchmark. Sundesk's locked rule was:
  Daily is the product, Build is the workshop, Settings are the basement.
  CereBro's matching rule is: the Keep is the product, the Workshop is the work
  surface, and system machinery stays below the floor until needed.
- The current UI/UX direction is too jumbled and too generic-SaaS. Do not add
  more primary surfaces until the Keep-first UX spine is redesigned and
  approved.
- Root `DESIGN.md` is now active. UI work must read it before touching code,
  assets, motion, or product copy. It binds the castle spec, Keep-first layout,
  workbench proof surfaces, voice rules, and anti-slop checks into one
  agent-readable source.
- The active Keep composition canon lives in the Obsidian note
  `20_Knowledge/Playbooks/CereBro Keep Composition Spec.md`. Read it before
  changing Keep layout, PixelLab room prompts, pathing, zoom behavior, council
  staging, time/weather ambience, room props, or agent animation states.
- External design, document, and agent projects are reference material, not
  default dependencies. Impeccable, Awesome DESIGN.md, UI UX Pro Max,
  Uncodixfy, Google Stitch, v0.app, React Bits, Huashu Design, Ruflo, Docling,
  Addy Osmani Agent Skills, AIDLC, Archon, Hermes, Multica, GenericAgent,
  LobeHub, local-deep-research, ppt-master, Pixelle-Video, VoxCPM, Maigret,
  CloakBrowser, Awesome Codex Skills, and AirLLM are tracked in
  `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md`. Use their patterns through
  CereBro-native rules and the license matrix.
- Uncodixfy is a standing UI judgment rule. Stitch is a high-fidelity sketch
  lane. v0 is a disposable React/Tailwind component sketch lane. None of them
  outrank `DESIGN.md`, the castle spec, the active renderer, real data, or
  screenshot proof.
- Public GitHub does not equal automatic clearance. Every repo needs license,
  security, maintenance, install-surface, storage, privacy, and product-fit
  review before copying code, installing, running scripts, running Docker,
  starting daemons, downloading weights, or authenticating services.
- Material UI work must run an anti-slop pass before delivery. The pass checks
  for generic AI UI, fake premium gradients, nested cards, placeholder assets
  presented as final, missing proof, unclear agent routing, broken voice, and
  motion without function.
- Aang is the human bridge. The user speaks to Aang first. Aang interprets the
  request and reports to Cortana. Cortana routes the agent layer. The UI must
  show that chain instead of making the user speak directly to the router.
- CereBro must infer the user's mode from context before asking. Aang should
  show the read, ask only when confidence is low or risk changes, remember
  corrections, and route through Cortana with a visible receipt.
- Agents stay visible. The fix is not hiding the roster. The fix is making each
  floor, chamber, and work surface answer one plain user question at a time.
- CereBro is an everyday OS and creative workshop, not only a coding harness.
  Everyday use includes asking questions, learning code/design, web research,
  YouTube/anime discovery, anime episode tracking, source capture, creative
  planning, and project work.
- Reddit is a first-class V1 source lane for human signal, trend sensing,
  niche research, media references, and lived reports. Treat it as evidence
  with provenance, not as truth and not as model-training data.
- Agent Reach is now a non-negotiable source-access reference for Raven,
  Surfer, and future agents. Use its channel registry, upstream-tool handoff,
  and doctor/watch health-check pattern as source architecture input. Do not
  install or configure it yet. Cookie extraction, proxies, browser automation,
  downloads, MCP servers, and upstream tools require Spock receipt and explicit
  approval per channel.
- Raven is now an active sealed smart recommender track, not a parked generic
  review feature. The implementation source is
  `CEREBRO_RAVEN_SMART_RECOMMENDER_PLAN.md`. Raven is a private adult-content
  discovery and taste agent with its own chat, settings, source adapters,
  candidate queue, hard-boundary controls, and taste graph. CereBro never reads,
  writes, routes, indexes, exports, validates, or syncs Raven data. No CereBro
  agent touches Raven. The only bridge is a sealed launcher that opens Raven
  after explicit user action and carries no Raven content back.
- Raven hard boundaries are visible settings, not hidden config. Locked V1
  blocks include illegal content, minors or age-ambiguous content,
  non-consensual content, coercion or trafficking indicators, hidden-camera
  indicators, doxxing or stalking vectors, malware/scam/popup/forced-download
  sources, and access-control bypass. User-defined blocked terms, performers,
  studios, sources, tags, formats, visual styles, and never-show-again items
  are enforced before scoring.
- Docling is a first-class candidate for document source intake. Use it as the
  preferred local path for PDFs, DOCX, PPTX, XLSX, HTML, images, scanned pages,
  transcripts, tables, formulas, figures, layout, and reading-order extraction
  once the adapter is built. Docling output must carry source path, checksum,
  parser version, extraction settings, page or coordinate evidence when
  available, and Oak validation status.
- local-deep-research is the companion candidate for local-first research once
  Docling and Source Library receipts are ready.
- ppt-master is an editable-PPTX candidate. Compare it against the current
  presentation plugin before changing deck generation.
- Pixelle-Video and VoxCPM are future media adapters, not V1 defaults. Video
  and voice model downloads require storage, license, safety, and consent
  receipts.
- Maigret is restricted to self-audit or narrow user-approved public-source
  research. CloakBrowser is restricted to study of browser isolation ideas, not
  stealth automation or bot bypass.
- Cleanliness is a first-class product requirement: every workspace, message,
  image, video, code artifact, source, note, and temp file needs an owner,
  destination, metadata trail, retention rule, and cleanup path.
- Visual beauty is a first-class comprehension requirement. Obsidian, the Keep,
  and CereBro knowledge surfaces should use distinct colors, intentional
  clusters, readable labels, useful spacing, and graph structure that tells the
  truth.
- Nothing new lands grey. Every active project, build history, source lane,
  archive lane, commit/session record, and durable project note needs a visible
  colour group or style rule before it becomes another pile in Obsidian.
- Raven stays separate from CereBro, but separate does not mean invisible or
  grey. Raven gets its own colour lane, bridge note, and archive colour rules
  while private operational data stays sealed outside CereBro memory.
- Sundesk stays simpler than CereBro. CereBro can build, explain, archive,
  demo, and QA Sundesk from outside. Sundesk should not inherit CereBro's agent
  runtime or tool registry unless a Sundesk product requirement demands it.
- The detailed file lifecycle design lives in `CEREBRO_FILE_LIFECYCLE_PLAN.md`.
- Append-only learning is a global rule: history/log/archive/index/note trails
  accumulate, while canonical current-state summaries may update in place.
  CereBro cannot learn the user's needs if its historical evidence is silently
  overwritten.
- The Mac is the workbench, not the warehouse. Heavy generated media, vector
  indexes, source archives, render outputs, and model files should not collect
  on local disk by default. Piccolo must report storage pressure before it
  becomes a build blocker.
- The detailed personal command center and project intelligence design lives in
  `CEREBRO_PROJECT_INTELLIGENCE_PLAN.md`.
- The skills/tools operating contract lives in
  `CEREBRO_SKILLS_AND_TOOLS_LAYER.md`. It defines agent skill loadouts,
  allowed tools, forbidden tools, memory lanes, approval gates, and output
  receipts. Skills teach. Tools act.
- Freelance work is a mode inside the broader command center, not the foundation.
- Surfer can research only with approval.
- Spock is now the security gate. Surfer scouts, but Spock checks risky links,
  GitHub repos, packages, downloads, browser targets, phishing risk, ad-heavy
  sites, and execution requests before Surfer browses deeply or Tony runs code.
- Security receipts are required before pasted GitHub repos can move from
  metadata review into clone, install, build, or execution. Repo stars are weak
  signal. Spock checks ownership, age, recent commits, workflows, package
  scripts, lockfiles, binaries, known vulnerabilities, malicious package
  heuristics, secrets, and suspicious network or credential behaviour.
- Browser safety is a V1 operating layer, not a side feature. Anime and
  streaming sites, fake download pages, popup-heavy sites, and ad-network
  pages open only in an isolated browser profile after approval. Popups,
  notifications, downloads, camera, mic, geolocation, credential entry, and
  third-party cookies are blocked by default for risky targets.
- Security scanners are tools, not truth. The planned Spock stack is OpenSSF
  Scorecard, OSV-Scanner, Datadog GuardDog, Gitleaks, zizmor, Semgrep,
  phishing and malware host feeds, and later YARA/ClamAV-style file triage.
  Scanner versions should be pinned and scanner execution should stay isolated.
- External model calls require approval.
- CereBro should become a model/tool opportunist, not a one-provider assistant.
  It should learn which hosted models, local models, free-tier tools, and
  specialty services work for which jobs, then route through the best available
  lane with visible approval and recorded evidence.
- New plugins and external tools are build aids, reference material, and
  possible future capability lanes. They do not change CereBro's behaviour by
  themselves.
- Current installed Codex plugin lanes for build sessions: Remotion for Gojo
  video work, Presentations/Documents/Spreadsheets for artifacts, Google Drive
  for vault-aware outputs, GitHub for PR/CI/review flows, Browser Use for
  localhost QA, Notion for capture/spec/research work, Hugging Face for model
  and research discovery, Canva for design variants, Supabase for future
  database work, Game Studio for Phaser/Keep/playtest work, and Computer Use
  only when desktop control is explicitly needed and safe.
- Record what each tool can do, what code or patterns may be borrowed, what data
  it touches, what approval it needs, and whether it belongs inside CereBro,
  beside CereBro, or as a manual handoff.
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
- Gitingest is a strong Silver Surfer primitive for repo digestion. Use the
  local CLI/package or a CereBro-native adapter by default, not the hosted web
  path. Surfer should preserve repo URL/path, commit SHA when available, ignored
  files, token/size counts, output path, source date, and reuse notes.
- Skales is a product/UX reference for Aang companion behavior and desktop
  agent ergonomics, not a code dependency. Its BSL license and direct product
  overlap make copying/integrating code the wrong path.
- Heavy media tools require storage/compute review.
- No generated asset is saved only in chat.
- No destructive cleanup without approval.

## Reference Intake And Plugin Rule

External tools, repos, and installed plugins can influence CereBro in three
ways:

1. **Lesson.** Adopt the product pattern, UX idea, safety rule, or workflow
   shape.
2. **Borrowed code.** Copy or adapt code only after license, security,
   maintenance, install surface, storage, privacy, and product-fit review.
3. **Adapter.** Keep the tool outside CereBro and call it through an approved,
   receipt-backed lane when useful.

Default to lesson. Borrow code only when it is small, reviewed, and clearly
better than rebuilding. Use adapters when the tool should remain separate. Use
installed plugins during current Codex/Tony build sessions when they help the
task, then record that use in the handoff if it affects proof, storage, output,
or privacy.

Current references from this pass:

- Brik: Gojo motion/design reference. No dependency until export/API value is
  proven.
- Codebase to Course: Terminal Lab teaching reference for turning repo and
  command work into teachable lessons. Do not add a separate Code Lab surface
  unless Terminal Lab becomes too crowded after the teaching lane is proven.
- OpenCode: coding-agent UX and session-management reference.
- ShibaClaw: security-hardening reference for agent tool execution.
- OpenClaw: broad desktop/channel automation reference. High-risk. Do not
  install or integrate until Spock review and explicit approval.

## Aang-First Mode Intelligence

CereBro should feel smart because it reads context, not because it asks the
user to file every thought into a menu.

Behavior rule:

```text
infer mode -> Aang shows the read -> ask only if unclear or risky -> Cortana routes -> Ledger records proof
```

Mode signals:

- Current zone: Keep, Workshop, Ledger, Basement.
- Active surface: browser, code, terminal, research, media, asset review,
  source reader, preview, approval, settings.
- Selected object: task, source, file, output, media item, asset, screenshot,
  approval, memory, decision.
- User language: ask, save, watch, track, build, fix, review, compare,
  research, remind, publish, message.
- Attached content: URL, image, video frame, repo, file, PixelLab asset,
  screenshot, terminal output.
- Active project and recent work.
- Permission mode and risk class.
- Prior corrections from the user.

Required behavior:

- If confidence is high, Aang states the read and proceeds to Cortana routing.
- If confidence is medium, Aang offers the likely read and one correction path.
- If confidence is low, Aang asks a short choice question.
- If the inferred mode changes risk, Aang pauses for approval.
- If the user corrects the mode, CereBro records the correction as reusable
  preference evidence.
- Repeated corrections can become a playbook rule after approval.

Example:

- User pastes an anime link and says "save this, I want to watch it."
  Aang reads Media mode, reports to Cortana, and routes to the media tracker.
- User pastes the same link and says "what are people saying about this."
  Aang reads Research mode and routes to Surfer.
- User pastes the same link and says "use this vibe for the Keep."
  Aang reads Keep asset reference and routes to Gojo with asset review context.
- User pastes the link with no instruction. Aang asks whether this is watchlist,
  research, or asset reference.

Acceptance:

- The UI always shows the mode CereBro thinks the user is in.
- The user can correct the mode without leaving the command flow.
- Aang is the voice of the inference.
- Cortana is the router behind the inference.
- Corrections can teach CereBro future defaults, with proof and approval.

## Cloud-Backed Learning System

CereBro does not become smarter by pretending every note is model training.
It becomes smarter by keeping receipts, retrieving the right context, and
turning repeated wins into playbooks.

V1 learning layers:

1. **Structured brain.** Turso/libSQL stores projects, tasks, sessions,
   sources, memories, artifacts, approvals, evals, tool calls, and routing
   records. Local SQLite mirrors or backs off when cloud setup is unavailable.
2. **Readable knowledge.** Obsidian stores durable Markdown: decisions,
   session handoffs, source summaries, learning notes, project indexes, and
   approved syntheses. It stays useful to a human even if CereBro is offline.
3. **Retrieval layer.** RAG indexes approved notes, source summaries, memory
   entries, prompt/tool handoffs, and selected outputs into a cloud vector
   service once chosen. The first implementation may use simple SQLite search,
   but the target is cloud vector retrieval with citations.
4. **Playbook layer.** Repeated prompts, model/tool handoffs, source workflows,
   build procedures, validation patterns, and "never do this again" corrections
   become reusable playbooks with owner, scope, input shape, privacy class,
   example result, failure notes, and approval gate.
5. **Evaluation layer.** CereBro records approval, rejection, reuse, stale
   source warnings, rate limits, failures, validation notes, and whether a
   result shipped. Routing improves from this evidence, not from vibes.
6. **Disclosure layer.** When CereBro uses remembered context, it names the
   memory, source, note, or playbook it relied on. The system shows its work.

Promotion path:

```text
raw capture -> source/event -> summary -> approved memory -> retrieved context
-> reusable playbook -> eval-backed routing rule
```

RAG acceptance for V1:

- Saved sources, Obsidian notes, memory entries, and prompt/tool handoffs can be
  searched from one route.
- Answers can cite the exact source row, note path, artifact, or memory id used.
- Obsidian can feed RAG, but Obsidian is not the RAG engine.
- Obsidian retrieval uses the current lane contract: `00_Atlas`,
  `10_Projects`, `20_Knowledge`, `60_Media`, `80_Templates`, and `90_Archive`.
- Normal retrieval includes only current, validated notes with explicit
  retrieval metadata. `90_Archive` is archive-only unless the user asks for
  history or provenance.
- Every RAG-ready Obsidian note carries `canonical_status`, `retrieval_status`,
  `llm_summary`, `source_ids`, `related_notes`, and `privacy_class`.
- GitHub repositories enter retrieval as source summaries and project bridges,
  not full-code note dumps. Source fingerprints use repo URL plus commit SHA.
  For exact code facts, CereBro inspects the live repo or checkout.
- Cloud vector storage is preferred for the real index. Local vector storage is
  optional and size-budgeted.
- Private or sensitive material is never sent to an external model or vector
  provider without visible approval and a recorded data summary.
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
  software, giving tokens/API keys to tools, destructive commands, and Raven
  sealed scope. Raven is not routed through CereBro agents.
- CereBro should learn reusable prompts and external tool/model handoffs over
  time. When it suggests reusing or adapting one, it must say which prompt it is
  using, why it applies, and whether an external tool/model call needs approval.
- Aang should become the always-on companion surface for keeping tabs on
  CereBro: small, ambient, click-to-ask, and event-aware. Aang remains a full
  agent, not a pet in the roster.
- Aang can become the meeting notetaker surface, Otter-style, but the safe V1
  path is transcript-first. Google Meet and Microsoft Teams both expose
  transcript APIs when transcripts exist and permissions are granted. Live
  meeting attendance, audio capture, bot joins, and screen/desktop recording
  require separate permission, platform, and consent reviews.

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
- Add escalation policy: private/cheap first, stronger external lanes only with approval.
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

### Session 4.5 - Keep-First UX Reset

Do this before expanding the Workbench, runtime, or additional panels.

Source references:

- Sundesk final training target:
  `/Users/lindsaybell/Documents/Codex/2026-05-07/files-mentioned-by-the-user-task/sundesk/outputs/manual-20260508-sundesk-demo/presentations/sundesk-command-center-training/output/sundesk-command-center-training-manual.pptx`
- Sundesk simplification rules:
  Start with the daily routine, show real work happening, keep helper surfaces
  contextual, and make the powerful engine available without making it the
  first thing the user has to understand.

Do:

- Audit the current CereBro UI against the question: "What would I do in the
  next 30 seconds?"
- Preserve the Keep as the main product surface. Do not replace it with generic
  SaaS panels or a flat dashboard.
- Reframe navigation around a small set of everyday modes:
  `Ask`, `Capture`, `Research`, `Build`, `Create`, `Learn`, `Watch`, and
  `Review`.
- Make mode selection intelligent. CereBro should infer the mode from screen,
  selected object, command language, attachment type, current project, and prior
  corrections. Aang shows the inferred mode, asks only when uncertain, and
  reports the final route to Cortana.
- Treat the mode selector as correction and control, not homework.
- Show the Aang -> Cortana -> agent route as a visible receipt whenever work is
  created, routed, approved, or corrected.
- Make the Keep itself actionable: chambers are not decorative cards. Each
  chamber should expose one current job, one status, and one next action.
- Create a Workshop layer for the dense surfaces: repo digestion, terminal,
  preview/browser, evidence ledger, source review, model/tool registry, and
  project detail.
- Move system machinery out of the first read: permissions, storage metadata,
  model routing, preflight logs, DB records, and adapters stay visible when
  relevant, not always on top.
- Define the everyday OS lane explicitly: web questions, code/design learning,
  anime discovery/tracking, YouTube/research, source capture, creative ideas,
  reminders, and project continuation all enter through the same simple Keep
  intake.
- Keep agents visible and named. The user likes the roster. The simplification
  target is the surrounding UX, not the agent idea.
- Draft a 24-slide CereBro finished-product training target deck before
  rebuilding the UI, mirroring the Sundesk method. The deck should show the app
  doing real daily work, not describe every feature.
- The deck should use high-fidelity product mockups that may be ahead of the
  current app. It is the build target, not a screenshot archive.
- The deck must not use wireframes, grey boxes, placeholder dashboards, generic
  SaaS panels, or fake low-fidelity mock images. It must show the final target
  product output as if CereBro already exists.
- The Keep in the deck must show the end-state direction, not the current
  unfinished scene. Each agent room should look distinct, dynamic, and specific
  to the agent: room design, props, state, animation intent, current work, and
  relationship to the rest of the Keep.
- PixelLab is the external production tool for Keep UI, sprites, chamber props,
  and agent assets. The deck may show PixelLab-produced target assets, but it
  should not frame PixelLab as CereBro's in-app creative studio.
- Keep room generation must start from the whole fortress composition, not
  isolated pretty rooms. The first layout is a wide 2-floor fortress with
  Cortana central, Aang near the entry, Gojo in an elevated gallery wing,
  sealed future wings for the other agents, visible doors, stairs, walking
  lanes, click-to-zoom camera focus, and local time/weather visible through
  every window and gap.
- The first teaching moment is: start in the Keep, ask, capture, route, and
  watch the agents work.
- The deck should show one full day in CereBro: morning orientation, capture,
  meeting notes, research, learning, source work, creative workshop, anime or
  YouTube tracking, project build, review, and end-of-day memory.
- The deck should show all agents in the Keep while focusing each slide on the
  agents involved in that moment. Do not flatten agent identity into generic
  job buttons.
- Aang should be shown as more than meeting notes: companion, explainer,
  learning guide, event surface, quiet meeting-note helper, and the small edge
  of the Keep when the full app is not open.
- Aang should be shown as the human bridge. The user speaks to Aang. Aang
  interprets, shows the mode read, reports to Cortana, and stays with the user
  while the Keep responds.
- Everyday OS workflows such as anime tracking, YouTube/research, code/design
  learning, and quick questions belong in the main deck, not an appendix.
- Final deck artifacts should live in the CereBro vault media library with the
  deck, notes, contact sheet, and source files indexed in Obsidian.
- Deck copy should use the user's production voice: short declaratives, no hype,
  no generic SaaS language, no exclamation marks, no em dashes.

Acceptance:

- CereBro has a locked UX spine before more features are added.
- The first screen reads as a premium pixel-art AI workshop, not a generic SaaS
  dashboard with a castle background.
- The deck depicts final target screens, not wireframes or temporary mock
  images.
- The Keep rooms in the deck are unique and agent-specific.
- The Aang-first mode inference behavior is visible in at least one complete
  flow.
- A new user can name what to click for a quick question, source capture, repo
  analysis, meeting notes, anime tracking, and build continuation without
  training on internal architecture.
- The 24-slide training deck outline is approved before PPTX generation begins.

### Session 5 - Source Library And Hybrid Search

Do:

- Build saved-source ingestion first: URLs, notes, files, GitHub references, pasted research.
- Add a Docling-backed document intake lane for approved local files:
  PDFs, DOCX, PPTX, XLSX, HTML, images, scanned pages, transcripts, tables,
  formulas, figures, and reading order. Store parser receipts with source path,
  checksum, parser version, extraction settings, page or coordinate evidence,
  export format, and Oak validation status.
- Add a local repo-digest lane based on Gitingest or a CereBro-native adapter:
  path/URL in, structured digest out, token/size counts, ignored-file summary,
  commit SHA when available, provenance, and vault/source-library storage.
- Route repo digestion to Silver Surfer by default, with Tony and Spock as
  follow-up owners for implementation and validation packets.
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
- Surfer's long-term source-access layer should be Agent-Reach-shaped:
  public page, search, GitHub, RSS, YouTube, Reddit, X/Twitter, and other
  channels register as capabilities with health checks, risk class, credential
  needs, and approval requirements. Agent Reach is a source of patterns, not a
  bypass around CereBro gates.

Acceptance:

- CereBro can save, search, cite, and reuse research, including Reddit human
  signal and repo digests with visible provenance and confidence notes.

### Session 6 - Aang Learning Mode And Companion Overlay

Do:

- Make Aang the teaching front door.
- Make Aang the low-friction meeting notetaker surface, with transcript-first
  behavior before live attendance. V1 should import or fetch approved Teams and
  Google Meet transcripts, summarize decisions/action items/questions, and save
  notes to the right project/source/output lane.
- Keep meeting capture consent and platform limits explicit. Aang cannot join a
  call, record audio, read calendars, fetch transcripts, or save meeting notes
  without the matching account permission and visible approval.
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
- Aang has a defined transcript-first meeting-notes path, with live bot/audio
  capture treated as a later permission-heavy investigation.

### Session 7 - Output Library, Obsidian, And Notion

Do:

- Make outputs first-class: specs, briefs, source summaries, learning notes, client docs, creative plans.
- Obsidian receives durable Markdown notes, including approved CereBro session
  handoff snapshots and an index note for build history.
- Obsidian must not become a grey pile. Add visible folder/path colour rules
  for active projects, build history, source lanes, archive lanes, decisions,
  media, output artifacts, and session records.
- Every active project represented in Obsidian needs a project bridge note
  under `10_Projects/<Project>/<Project>.md`, with backlinks to build history,
  source summaries, media indexes, maintenance notes, decisions, and current
  next actions.
- Session history needs a readable index style: dated entries, short slice
  names, project/surface labels, and color lane guidance. Archive snapshots
  remain append-only and out of normal retrieval unless history is requested.
- Raven gets its own colour lane, bridge note, and archive styling, but private
  Raven operational data stays sealed outside CereBro memory, retrieval, and
  normal Obsidian knowledge notes.
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
- Add mode inference before routing. The runtime should read screen context,
  selected object, attachment type, active project, recent history, permission
  mode, and user corrections before deciding the route.
- Add Aang mode confirmation behavior. Aang states the inferred mode when
  confidence is high, offers a correction when confidence is medium, asks a
  short question when confidence is low, and pauses when risk changes.
- Add correction memory. When the user changes the inferred mode, record the
  correction with context, selected object, project, original inference, final
  mode, and route outcome. Promote repeated corrections to playbook proposals
  only with approval.
- Add skill loader.
- Use `CEREBRO_SKILLS_AND_TOOLS_LAYER.md` as the implementation contract for
  agent skills, tool permissions, memory access, approval gates, and receipts.
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

- Treat Session 4.5 as the authority for the UX spine. Session 12 implements
  the fuller shell only after the Keep-first product map is locked.
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
- Raven first source adapter: Eporner open metadata path, ThePornDB/Stash-box
  token path, or manual URL enrichment first.
- Raven storage split: keep `raven_private_*` tables in the current DB for the
  next slice or move to a dedicated Raven DB before source adapters.
- Raven thumbnail policy for V1. Default is no thumbnails until enabled in
  Raven Settings.
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
- Exact meeting-notes path for Aang after account review: Teams transcript API,
  Google Meet transcript API, calendar-triggered imports, manual transcript
  upload, or later live meeting bot/audio capture.
- Exact local repo-digest implementation: depend on Gitingest CLI/package,
  build a CereBro-native adapter, or support both behind Surfer.
- Exact Skales teardown scope for Aang companion UX, desktop ergonomics, and
  approval bubbles. Reference only. No code dependency.
