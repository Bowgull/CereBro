# CereBro External Reference Integration Plan

Last updated: 2026-05-08

## Purpose

This file turns external projects into working CereBro rules.

External references are not a permission slip to copy code. They are source
material for better design, better routing, better validation, and better build
habits.

## Operating Rule

Use external projects in this order:

1. Learn the pattern.
2. Check license.
3. Write the CereBro-native rule.
4. Build against CereBro's current architecture.
5. Cite the source in the handoff when it shaped the work.

Do not paste external code into CereBro without a license review and a recorded
decision.

## References

| Reference | Source | Current license read | CereBro use |
|---|---|---|---|
| Impeccable | https://github.com/pbakaus/impeccable | Apache-2.0 | Design command grammar, anti-pattern checks, `PRODUCT.md` and `DESIGN.md` setup, browser critique loop. |
| Awesome DESIGN.md | https://github.com/VoltAgent/awesome-design-md | MIT | Pattern for root design source files. Use as structure, not brand cloning. |
| getdesign.md | https://getdesign.md/about | Directory/site | Browsable reference for DESIGN.md practice. Treat listed brand systems as inspiration only. |
| Huashu Design | https://github.com/alchaincyf/huashu-design | Personal use license. Commercial/team integration needs authorization. | Workflow reference only. Asset protocol, design directions, critique, HTML deliverables. Do not integrate code/assets without permission. |
| UI UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | MIT | Design-system generator pattern, master plus page override pattern, stack-specific checks. |
| React Bits | https://github.com/DavidHDev/react-bits | MIT + Commons Clause | Motion and component reference. Avoid wholesale dependency until license details are reviewed. |
| Uncodixfy | https://github.com/cyxzdev/Uncodixfy | MIT | Anti-generic UI rules. Fold into Gojo review and frontend work. |
| Google Stitch | https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/ | Product/service reference | High-fidelity UI exploration. Use as a sketch canvas, not a code authority. Rebuild inside CereBro. |
| v0.app | https://vercel.com/docs/v0 | Product/service reference | Fast React/Tailwind component drafts for workbench panels, forms, drawers, tables, and empty states. Treat output as disposable scaffolding. |
| Ruflo | https://github.com/ruvnet/ruflo | MIT | Agent orchestration reference for Phase 3. Study topology, hooks, memory, verification, and federation. Do not replace CereBro's agent model. |
| Docling | https://github.com/docling-project/docling | MIT | Preferred document-intelligence candidate. Local document conversion, layout-aware extraction, tables, OCR, structured exports, Source Library and RAG input. |
| AirLLM | https://github.com/lyogavin/airllm | Apache-2.0 | Model-router research. Hardware realism, profile testing, fallback lanes. Not a V1 dependency. |
| Emil Kowalski Skill | https://github.com/emilkowalski/skill | GitHub API: no license detected 2026-05-08 | Use as design taste reference only. No copying until license is confirmed. |
| Anthropic Frontend Design Skill | https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md | GitHub API: no license detected 2026-05-08 | Anti-generic frontend reference. Use through CereBro `DESIGN.md`, not as a replacement. |
| Karpathy Skills | https://github.com/forrestchang/andrej-karpathy-skills | GitHub API: no license detected 2026-05-08 | Coding-agent discipline reference. Fold into Tony/Spock/Oak checks using original wording. |
| Addy Osmani Agent Skills | https://github.com/addyosmani/agent-skills | MIT | Production engineering skill reference. Strong candidate for Tony/Oak/Spock skill rules. |
| AIDLC Workflows | https://github.com/awslabs/aidlc-workflows | MIT-0 | AI development lifecycle reference. Fold into planning, implementation, validation, and closeout gates. |
| Archon | https://github.com/coleam00/Archon | MIT | Deterministic AI-coding harness reference. Study specs, repeatability, tasks, and validation. |
| Hermes Agent | https://github.com/NousResearch/hermes-agent | MIT | Evolving-agent architecture reference. Study memory, schedules, and model/tool switching. |
| Multica | https://github.com/multica-ai/multica | GitHub API: NOASSERTION 2026-05-08 | Managed-agent task board and runtime reference. Study only until license is clear. |
| GenericAgent | https://github.com/lsdefine/GenericAgent | MIT | Self-evolving skill-tree reference. Study carefully. Full-system-control patterns are gated by Spock. |
| LobeHub | https://github.com/lobehub/lobehub | GitHub API: NOASSERTION 2026-05-08 | Agent workspace, MCP marketplace, knowledge base, multi-model, voice/image pattern reference. Study only until license is clear. |
| local-deep-research | https://github.com/LearningCircuit/local-deep-research | MIT | Strong Surfer/Oak adapter candidate for local research across web, papers, and private docs. |
| ppt-master | https://github.com/hugohe3/ppt-master | MIT | Strong editable-PPTX candidate. Compare with current presentation plugin before integration. |
| Pixelle-Video | https://github.com/AIDC-AI/Pixelle-Video | Apache-2.0 | Video pipeline reference for Gojo/media. Park as heavy future adapter. |
| VoxCPM | https://github.com/OpenBMB/VoxCPM | Apache-2.0 | TTS and voice-design candidate. Voice cloning requires explicit consent and safety gates. |
| Maigret | https://github.com/soxoj/maigret | MIT | Restricted OSINT candidate. Self-audit or approved public-source research only. No people search by default. |
| CloakBrowser | https://github.com/CloakHQ/CloakBrowser | MIT | Restricted browser-evasion reference. Study isolation ideas only. Do not use stealth or bot-bypass behavior. |
| Awesome Codex Skills | https://github.com/ComposioHQ/awesome-codex-skills | GitHub API: no license detected 2026-05-08 | Discovery index only. Verify each linked skill separately. |
| Agent Reach | https://github.com/Panniantong/Agent-Reach | MIT verified 2026-05-09, HEAD `17624268a059ccfb23eba8a2ba50f9f92c8dc0ca` | Required source-access scaffold reference for Surfer, Raven, and future agents. Study and adapt the channel registry, doctor checks, and upstream-tool handoff pattern. Do not install, configure cookies, proxies, browser automation, downloads, or upstream tools without Spock receipt and explicit approval. |

## CereBro-Native Lessons

### Source Intake Rule

Public GitHub is not automatic clearance.

For every repo:

1. Check license.
2. Check maintenance.
3. Check install surface.
4. Check security risk.
5. Check product fit.
6. Decide: use now, study, park, restrict, or reject.

Do not clone, install, run scripts, run Docker, authenticate a daemon, download
model weights, or paste code until the decision is recorded.

### Agent Reach Rule

Agent Reach is now a required source-access reference.

Use it as the pattern for:

- channel registry
- channel health checks
- doctor/watch status
- upstream tool handoffs
- public webpage reading
- YouTube transcript extraction
- Reddit and X/Twitter source lanes
- GitHub and RSS source lanes
- optional channel setup receipts

Do not use it as a bypass permission slip.

Boundaries:

- No install until approved.
- No `agent-reach install` until Spock records the install surface.
- No cookie extraction from Chrome or any browser without explicit approval.
- No Twitter/X, Reddit, or other account cookies by default.
- No proxies by default.
- No download automation by default.
- No NSFW media downloads by default.
- No login-wall, paywall, or platform-limit bypass.
- No private account scraping.
- No raw Raven data on this Mac.
- No hidden background watchers until the user approves each channel.

CereBro-native shape:

```text
Aang reads the source request.
Cortana routes.
Spock checks channel risk.
Surfer proposes the source method.
User approves the method.
Adapter runs only the approved lane.
Ledger records the receipt.
Oak validates important claims.
Piccolo watches stale channels, storage, and rate limits.
```

Raven-native shape:

```text
Raven receives a source or search intent.
Source adapter reports public/login/proxy/download risk.
User approves the lane.
Raven inspects only approved public/session data.
Any save goes remote-encrypted only.
Mac stays clean.
```

### Design.md

CereBro now has a root `DESIGN.md`.

It must be read before UI work. It does not replace the castle UI design spec.
It binds the castle, workbench, voice, anti-slop rules, and screenshot review
into one file agents can use.

### Gojo Design Review

Gojo needs a real review loop:

```text
read DESIGN.md -> inspect touched UI -> screenshot -> identify violations
-> patch -> screenshot again -> handoff
```

The review should catch:

- generic SaaS composition
- fake premium gradients
- nested cards
- placeholder assets presented as final
- missing proof
- unclear routing
- copy that breaks the voice
- motion without function

### Frontend Taste References

Use Emil Kowalski's skill, Anthropic's frontend-design skill, UI UX Pro Max,
Uncodixfy, Stitch, and v0 as inputs to one CereBro review loop.

The merged rule:

- pick a clear product job before picking an aesthetic
- avoid default AI layout rhythm
- avoid fake premium styling
- use real assets and data
- make the interface specific to CereBro's Keep, Workshop, Ledger, or Settings
- rebuild generated ideas in local components
- inspect screenshots before calling the UI done

Anthropic-style boldness is useful for public artifacts and one-off creative
pages. CereBro internal tools stay dense, quiet, and proof-led.

Emil-style taste is useful for spacing, hierarchy, motion restraint, and
micro-interaction judgment. Do not copy article text unless a license review
allows it.

### Brand Asset Protocol

Borrow the method, not Huashu's files.

When a task involves a real brand, product, app, venue, person, or design
reference:

1. Ask for or locate authoritative assets.
2. Prefer official sources.
3. Save source links and local paths.
4. Extract colors, fonts, screenshots, product shots, and logo rules.
5. Freeze the result into a short project spec before building.

If assets are missing, say what is missing. Do not fake confidence.

### Master Plus Override Design System

Use a small hierarchy:

```text
DESIGN.md
design-system/MASTER.md
design-system/pages/<surface>.md
```

Root `DESIGN.md` is the global rule. `MASTER.md` can hold implementation
tokens and reusable component patterns. Page files hold exceptions.

Do not create this folder until a UI slice needs it.

### Uncodixfy Rule

If a UI choice feels like a default AI move, reject it and choose the plainer
product choice.

For CereBro this means:

- workbench before hero
- proof before mood
- routing before decoration
- agent state before fake activity
- existing tokens before new color
- screenshot review before final claim

### Stitch Rule

Use Stitch to explore interface directions, not to decide the product.

Before using it, write the constraint block:

- surface
- user question
- real data shown
- proof shown
- agent route shown
- tokens allowed
- patterns forbidden
- target viewport

After using it, keep only what survives CereBro's rules. No imported visual
identity. No generated layout becomes final until it is rebuilt in the repo and
checked in screenshots.

Good uses:

- alternate Workbench panel composition
- approval and security-gate flows
- source-library document review screens
- dense Settings or Ledger arrangements
- mobile compression studies

Bad uses:

- replacing the Keep
- inventing a new brand language
- hiding proof behind a beautiful summary
- accepting generic product-dashboard rhythm

### v0 Rule

Use v0 for disposable component scaffolds.

Good uses:

- table controls
- filters
- drawers
- forms
- empty states
- dense admin panels

Bad uses:

- primary Keep composition
- final code without simplification
- generated copy
- design-system authority
- fake data presented as real state

Every v0 draft needs a cleanup pass:

1. Remove generic shadcn dashboard habits.
2. Replace colors with `cerebroColors`.
3. Replace copy with the AGENTS voice.
4. Remove fake data.
5. Add proof, route, owner, status, and next action.
6. Screenshot before final claim.

### Docling Rule

Docling is the preferred candidate for document intake once the adapter exists.

Use it when CereBro needs to convert or understand:

- PDFs
- DOCX
- PPTX
- XLSX
- HTML
- images
- scanned pages
- transcripts and WebVTT
- tables, formulas, code blocks, figures, and reading order

Default to local execution for private or client documents. External model
calls remain approval-gated.

Required receipts:

- source path or URL
- checksum
- parser name and version
- extraction settings
- page and coordinate when available
- export format
- validation status
- linked Source Library row

Docling output can feed Markdown, HTML, JSON, Obsidian, Notion, RAG, and Oak
validation. It does not replace validation. It gives CereBro better evidence to
validate.

### Source And Research Rule

local-deep-research is a strong candidate after Docling and the Source Library
schema are ready.

Use it to study:

- local-first research loops
- private-document search
- multi-search-engine routing
- citation and confidence records
- encrypted/local storage assumptions

Do not install it until Spock reviews dependencies, network behavior, storage
paths, and hardware fit.

Maigret is restricted. It can support self-audit or user-approved public-source
research. It cannot become a default people-search tool.

CloakBrowser is restricted. CereBro needs safer browsing and isolated profiles,
not stealth automation or bot-detection bypass.

### Agent Harness Rule

Archon, Hermes, Multica, GenericAgent, AIDLC, Addy Osmani Agent Skills, and
Karpathy Skills are agent-runtime source material.

Use them to improve:

- task specs
- deterministic runbooks
- skill compounding
- progress receipts
- validation gates
- memory/schedule boundaries
- failure recovery
- human-visible status

Keep CereBro's route:

```text
Aang -> Cortana -> owner agent -> support agents -> Spock/Oak -> output
```

Do not import a whole external harness as CereBro's runtime without a separate
architecture decision.

GenericAgent's self-evolving and full-system-control ideas are high-risk. They
belong behind explicit permission, audit logs, and narrow tool scopes.

### Media Adapter Rule

Pixelle-Video, VoxCPM, and ppt-master are adapter candidates, not V1 defaults.

Use them as follows:

- ppt-master: compare against the existing presentation plugin for editable
  PowerPoint output.
- Pixelle-Video: study video automation pipelines for Gojo, not as a local
  dependency yet.
- VoxCPM: study TTS, voice design, and possible local narration. Voice cloning
  requires explicit consent, source-audio ownership, and visible approval.

Generated media goes to the vault by default once approved. Heavy models and
outputs do not collect on the Mac without Piccolo storage review.

### LobeHub Rule

LobeHub is a broad product reference for agent workspaces.

Study:

- agents as work units
- MCP marketplace shape
- knowledge base upload
- multi-model routing
- plugin and tool surfaces
- voice/image modality UX

Do not copy product identity or install it as CereBro. CereBro remains the Keep,
the Workshop, the Ledger, and the user's local-controlled operating layer.

### React Bits Rule

Use React Bits as a reference for motion craft only.

The Keep is Phaser pixel art. Do not drop glossy React animations on top of it
unless they serve a specific workbench interaction.

Candidate use:

- text reveal for source diff only
- before and after preview transition
- command palette micro-motion
- low-motion background texture for non-Keep panels

### Ruflo Rule

Ruflo's value is architecture, not identity.

CereBro already has named agents and rooms. Study Ruflo for:

- task decomposition
- worker topology
- shared memory
- hooks
- verification inventory
- model and tool routing
- cross-agent handoff

Keep Aang-first routing. Keep Cortana as router. Keep Spock/Oak validation.

### AirLLM Rule

AirLLM is a warning against model fantasy.

Every local or cheap model route needs:

- hardware requirements
- measured latency
- context limit
- quality notes
- privacy class
- fallback route
- last verified date

No promise enters the product until it has a receipt.

## Immediate Build Changes

- Root `DESIGN.md` is active.
- `frontend-design.skill.md` should require `DESIGN.md`.
- `anti-slop-review.skill.md` should run before UI delivery.
- Stitch and v0 should be treated as approved exploration lanes only after
  constraints are written.
- Docling should be promoted from parked PDF utility thinking into the Source
  Library and RAG intake plan.
- local-deep-research and Docling should be evaluated together for the Source
  Library lane before either is installed.
- ppt-master should be compared against the current presentation plugin before
  any deck-pipeline change.
- Agent-harness references should feed Tony/Spock/Oak runbooks before runtime
  changes.
- `LICENSE_REVIEW_MATRIX.md` should track these references.
- Future UI work should cite which design rule it used.

## Do Not Do

- Do not make CereBro a clone of any listed project.
- Do not add paid services.
- Do not integrate Huashu into team/product/client workflows without written
  permission.
- Do not treat React Bits as plain MIT.
- Do not replace the Keep with generic component-library UI.
- Do not paste Stitch or v0 output into the repo as final implementation.
- Do not install Ruflo as the CereBro runtime without a separate architecture
  decision.
- Do not send private documents to external models when Docling or another
  local parser can extract the needed structure first.
- Do not run Maigret against another person without explicit, narrow approval.
- Do not use CloakBrowser for stealth, bot bypass, scraping evasion, or terms
  bypass.
- Do not download voice/video/model weights without storage, license, and safety
  receipts.
