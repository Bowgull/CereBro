# CereBro — repo guide for Codex

CereBro V1 is a cloud-backed, local-controlled, harness-first personal AI operating layer with a pixel-art castle UI ("the Keep"). Backend will eventually be the harness (tasks, sessions, projects, memory pipeline, validation, output library, source library, model router, tool adapters). Frontend is the Keep — three floors of agent chambers. The current master build plan is `CEREBRO_MASTER_BUILD_PLAN.md`; every session must update `CEREBRO_SESSION_HANDOFF.md`.

## Where things live

- `app/` — the running client+server. Forked from `thousandsky2024/Codex-pixel-agent-web` (MIT, "Codex Dungeon"). React 19 + Tailwind 4 + Phaser 3 + Express + tRPC + Drizzle + WebSocket.
  - `app/client/src/lib/keepConfig.ts` — palette tokens, FLOORS, CHAMBERS (10 agents), GROUND_CHAMBERS (legacy, scoped for delete).
  - `app/client/src/components/KeepScene.tsx` — **the live Phaser scene**. Side-cutaway castle: 3 floors stacked, 10 chambers laid out left-to-right. **As of 2026-05-05 second pass, every visible tile is custom PixelLab pixel art — no 0x72 atlas references anywhere.** Castle stone walls (top + back), horizontal stone slab floor, custom torch sconces, atmospheric wall variants (arrow slits, alcoves, framed panels), 4 staircases between floors. Each chamber has 2-9 PixelLab hero/decor props. 11 PixelLab agent characters (10 + Surfer's silver horse) in their chambers. Cortana centerpiece: violet dais + floating user-orb + stained_glass on back wall + flanking candelabras. State machine wired (idle/active/dormant motion + chamber lighting).
  - `app/client/src/components/KeepLayout.tsx` — **dead code**. Was a static card-grid that silently took over from the Phaser canvas; reverted in session 5. Kept temporarily; safe to delete next pass.
  - `app/client/src/components/DungeonMapPhaser.tsx` — **deleted in session 5**. Was the fork's hero-pathing dungeon (5 rooms, BFS pathing, HP bars). Replaced by KeepScene per locked Option A: live sessions drive chamber state (tints, activity markers), not wandering hero sprites.
  - `app/client/src/pages/Home.tsx` — header, sidebar, floor selector. Renders `<KeepScene>`. Floor selector is currently visual-only since side-cutaway shows all floors at once; may repurpose for camera focus later. Has dead `FloorPending` function from old per-floor view; safe to delete.
  - `app/scripts/palette-swap.mjs` — recolor any PNG to the castle palette (sharp, MIT). Two modes: `--mode=nearest` (RGB nearest) and `--mode=luma` (preserves source brightness, default). Validated on `dungeon_bg_v2.png`.
  - `app/client/public/sprites/cc0/` — staged third-party CC0 source art (Kenney tiny-dungeon). Tile sprites, not scenes; needs a compose pass before wiring.
- `.Codex/launch.json` — preview-tool config for `pnpm dev` on port 3002.
- `mockups/` — early HTML mockups. `keep-v2.html` and `keep-v3.html` are reference only; the live app supersedes them. `mockups/shell.html` predates the project and has scope violations (Declyne/Raven references) — do not use as reference.
- `CEREBRO_MASTER_BUILD_PLAN.md` — current 15-session master plan folding backend, model routing, storage, learning, creative studio, Hedwig, and Keep UX.
- `CEREBRO_SESSION_HANDOFF.md` — live handoff file. Read first and update at the end of every session. After updating it, save a dated snapshot into the configured Obsidian vault under `90_Archive/CereBro Session History/snapshots/` and update `90_Archive/CereBro Session History/CereBro Session History.md`.
- `CereBro_V1_*` and `CereBro_Final_Implementation_Pack/` (root) — locked planning docs. `CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md` is the canonical visual spec.
- `.nvmrc` pins Node 22 LTS.

## Running it

```bash
nvm use      # picks up .nvmrc → Node 22
cd app
pnpm install # only on first run
pnpm dev     # → http://localhost:3002 (auto-bumps from 3000 if busy)
```

Harness DB is libSQL via `@libsql/client`. Default `file:./cerebro.db`. Set `CEREBRO_DB_URL=libsql://…` + `CEREBRO_DB_AUTH_TOKEN=…` to switch to Turso, no code change. Schema applied idempotently in `app/server/cerebroDb.ts` on first connect (projects, tasks, sessions, memory_entries, outputs, sources). Upstream MySQL `users` table from the fork is unused.

## Env vars (app/.env, gitignored)

- `CEREBRO_DB_URL`, `CEREBRO_DB_AUTH_TOKEN` — harness DB; defaults to local SQLite
- `NOTION_TOKEN`, `NOTION_INBOX_DATABASE_ID`, `NOTION_OUTBOX_DATABASE_ID` — Notion adapter; auto-poll runs every `NOTION_POLL_INTERVAL_SEC` (default 300)
- `CEREBRO_VAULT_DIR` — absolute path to vault root; usually a Drive synced folder
- `CEREBRO_MODEL_<AGENT_ID>` — per-agent model override, honored by `resolveModelForAgent`

## Locked decisions (do not change without explicit approval)

These live in auto-memory but are repeated here so any Codex reading the repo cold sees them:

- Castle aesthetic per `CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md`. Dark cinematic, premium, NOT fake-fantasy. Use `cerebroColors` tokens.
- Root `DESIGN.md` is active. Read it before UI, motion, prototype, deck, asset,
  or product-copy work. It is the agent-readable design law that prevents
  generic AI output.
- Obsidian note `20_Knowledge/Playbooks/Low Machinery Software Design Law.md`
  is active. Read it before app/software UI work. Product screens must hide
  machinery until requested, make the primary object own the screen, put
  settings in a real destination, and keep debug/proof language out of the
  primary product surface.
- External references such as Impeccable, Awesome DESIGN.md, Huashu Design, UI
  UX Pro Max, React Bits, Uncodixfy, Google Stitch, v0.app, Ruflo, Docling,
  Addy Osmani Agent Skills, AIDLC, Archon, Hermes, Multica, GenericAgent,
  LobeHub, local-deep-research, ppt-master, Pixelle-Video, VoxCPM, Maigret,
  CloakBrowser, Awesome Codex Skills, and AirLLM are source material.
  Use `CEREBRO_EXTERNAL_REFERENCE_INTEGRATION_PLAN.md` and
  `CereBro_Final_Implementation_Pack/LICENSE_REVIEW_MATRIX.md` before copying
  code or assets.
- Public GitHub is not automatic clearance. Do not clone, install, run scripts,
  run Docker, start daemons, download model weights, authenticate services, or
  paste code until license, security, maintenance, install surface, storage,
  privacy, and product fit are recorded.
- Uncodixfy, Google Stitch, and v0.app are important frontend inputs, but none
  of them outrank `DESIGN.md`, the castle spec, the active renderer, or
  screenshot proof. Use Uncodixfy as a standing anti-generic review rule. Use
  Stitch for high-fidelity UI exploration. Use v0 for disposable React/Tailwind
  component sketches. Rebuild the chosen result in CereBro's own system.
- Docling is an important document-intelligence candidate for CereBro and for
  Codex work inside this repo. Prefer it for local document conversion,
  source-library intake, layout-aware PDF parsing, table extraction, transcript
  processing, and RAG-ready exports once the adapter exists. Parsed output is
  evidence, not truth. Keep source path, page, coordinate, checksum, parser
  version, extraction settings, and validation status visible.
- All 11 agents in the current V1 master plan: Cortana, Tony Stark, Gojo, Silver Surfer, C-3PO (Ground); Aang, Batman, Professor Oak, Spock (Upper Spires); Piccolo and Hedwig (Crypts). Hedwig is a scoped Messenger/Comms agent, visually a messenger owl sharing the Crypts operations layer with Piccolo.
- Aang-first bridge: the user speaks to Aang. Aang interprets the request and reports to Cortana. Cortana routes the agent layer. The Keep should show that chain. No "you" sprite anywhere.
- Mode intelligence: CereBro should infer the user's mode from context, have Aang show the read, ask only when uncertain or risky, remember corrections with approval, and route through Cortana with a visible receipt.
- Spock is the security gate. Surfer scouts, but Spock checks risky links,
  GitHub repos, packages, downloads, browser targets, phishing risk, ad-heavy
  sites, and execution requests before Surfer browses deeply or Tony runs code.
  Pasted repos need a Spock security receipt before clone, install, build, or
  execution. Risky browser targets use an isolated profile with popups,
  notifications, downloads, credential entry, camera, mic, geolocation, and
  third-party cookies blocked by default.
- Storage tiers: Turso (libSQL cloud, free) for brain. Cloud vector retrieval for RAG once selected. Google Drive synced folder for vault and outputs. Local for active workspace/cache only. All paths env-configurable.
- No money. No paid services, no trials.
- Notion: inbox/outbox pattern, free tier. Notion is also the structured
  Hedwig capture database for ideas, links, TikToks, Reddit posts, articles,
  reminders, learning seeds, and "save this for later" items.
- Slack is nonnegotiable in V1 as Hedwig's fast capture lane. Start with
  approved DM/capture-channel intake into Notion; iMessage remains a later
  OpenClaw/macOS-permission investigation.
- Obsidian is for durable Markdown knowledge, including approved CereBro
  session handoff snapshots and a session index note. It is not the raw
  catch-all capture inbox.
- Obsidian can feed RAG, but it is not the RAG engine, the vector database, or
  the model brain.
- Obsidian retrieval discipline is locked for V1. Retrieval includes only notes
  that are current, validated, and marked for retrieval. Archive snapshots do
  not enter normal RAG unless the user asks for history.
- CereBro-created Obsidian notes must use the current vault lanes:
  `00_Atlas`, `10_Projects`, `20_Knowledge`, `60_Media`, `80_Templates`, and
  `90_Archive`. Do not recreate old `CereBro/...` root folders.
- Every RAG-ready note should carry `canonical_status`, `retrieval_status`,
  `llm_summary`, `source_ids`, `related_notes`, and `privacy_class`.
- Retrieval must cite the exact note path, source row, artifact, or memory id
  used. The system shows its work.
- GitHub project knowledge uses bridge and source notes, not raw code dumps.
  Every imported repo gets `10_Projects/<Project>/<Project>.md` plus
  `20_Knowledge/Sources/GitHub/<Project> Repository Source.md`, linked from
  `00_Atlas/GitHub Project Map.md`. Use commit SHAs as source fingerprints.
  Inspect the live repo for line-level code facts.
- Obsidian must stay beautiful and functional. Use distinct folder/path colors,
  clean templates, frontmatter, backlinks, callouts, and indexes. Do not rely on
  manual tags just to make graph nodes readable.
- Visual beauty is a standing requirement for Obsidian, the Keep, and CereBro
  knowledge surfaces. Treat beauty as comprehension: distinct colors, intentional
  clusters, readable labels, useful spacing, and graph structure that tells the
  truth. Do not let valuable knowledge become a grey pile of disconnected nodes.
- Every active project represented in Obsidian must have a CereBro project
  bridge note under `10_Projects/<Project>/<Project>.md`. Build history,
  media indexes, decks, maintenance notes, upgrade plans, and decisions should
  link through that bridge instead of floating as separate islands.
- Historical records are append-only by default. Logs, session indexes,
  handoff archives, audit trails, command/output history, source provenance,
  approval history, running notes, and learning trails must append or create a
  new timestamped version. Only canonical current-state files/plans may be
  edited in place, and they must not pretend to be history.
- Reusable prompts/tool handoffs are a CereBro learning/memory feature, not a
  big UI surface. If CereBro suggests reusing or adapting one, it must say which
  prompt it found, why it applies, and what approval is needed for any external
  tool/model.
- The modular in-app Terminal belongs on the build route as a learning and
  validation surface: user-visible command/output history, Aang explanations,
  Tony command suggestions, and approval-gated agent execution.
- External Codex calls confirm individually. No auto-batching. Eats existing Codex session quota, not a separate API bill.
- Browser tools start with public-page browsing only.
- Generated files and deliverables should default to a Google Drive synced CereBro vault once `CEREBRO_VAULT_DIR` is configured; repo folders are not the default home for generated images, videos, renders, or client work.
- Raven is a sealed private build track outside core CereBro. Core CereBro must
  not read, write, route, summarize, sync, index, or export Raven data. The only
  allowed CereBro connection is an explicit sealed launcher that carries no
  Raven content back into CereBro. No adult generation surface exists in V1. No
  Raven private content goes to external models in V1. No media downloads run in
  V1.
- Walkthrough guide is the LAST phase.

## Build cadence

Codex drives 100%: terminal, file edits, browser, account setup. User reviews and approves at decision level. When a step requires the user (account creation needing personal email/password, payment info, biometric auth, physical hardware), pause and ask, then resume driving.

Build in bounded autonomous blocks, not tiny "keep going" slices. Default to
2-4 related local slices on one surface before stopping. Stop only when a gate
is required, checks fail, the diff gets broad, product direction changes,
context is getting heavy, or the block is complete. The user explicitly called
out that returning every 2-3 minutes just to say "keep going" creates pointless
friction and burns attention.

Every session closes by updating `CEREBRO_SESSION_HANDOFF.md` with what changed, files touched, tests/checks run, known risks, storage impact, and the next-session starter prompt. Then write a unique Obsidian snapshot of that handoff to `90_Archive/CereBro Session History/snapshots/<YYYY-MM-DD HHMM CereBro Session Handoff - short-slice-name>.md` and append a new link to `90_Archive/CereBro Session History/CereBro Session History.md`. Never overwrite or replace an earlier handoff snapshot/index entry. This append-only Obsidian handoff archive is now user-approved standing behavior for CereBro build sessions.

## Scope discipline

Before any redesign or restyle:
1. Read the renderer/components that would be touched.
2. Inventory the assets that exist vs. the assets the redesign would need.
3. Pitch the version that's actually achievable in this session, with deferrals called out as honest placeholders rather than faked.
4. Get user approval on the scope before plowing in.

Pixel art is load-bearing. Don't sacrifice it for engineering convenience. (Session 2 lesson: first attempt at the castle restyle threw out the Phaser canvas for CSS cards. Reverted. Don't repeat.)

## Phase plan (where we are)

- Phase 0 ✅ doc scaffolding
- Phase 1 ✅ fork Codex Dungeon → restyle to castle → run locally. Ground Hall has real art; Upper Spires + Crypts are honest placeholders awaiting art pass. Establishing exterior shot wired (Castle in the Dark, CC0).
- Phase 2 ✅ harness backend live. libSQL + drizzle-less idempotent schema. Tables: projects, tasks, sessions, memory_entries, outputs, sources. tRPC routers: tasks, sessions, memory, outputs, integrations, keep. UI panels: Tasks, Memory, Sessions ledger. Notion inbox poller (auto every 5min) + outbox publisher with rich properties. Drive vault writes via `outputs.writeToVault`. Transcript watcher captures assistant text into the outputs library tied to live sessions. Model router scaffold (`server/agentRouter.ts`) maps all 10 agents to floor/chamber/role/model.
- Phase 3 ⏳ runtime agent loop — wire `resolveModelForAgent` into actual dispatch, build the 10 agent skill files, validation pass, multi-agent ceremonies, output kind expansion (code/diff/file). This is where `keep.agents` becomes load-bearing instead of metadata.
- Keep UI parallel track ⏳ side-cutaway scene shipped session 5; **PixelLab foundation pass shipped 2026-05-05 second visit**: full custom castle tileset (walls + back wall + floor + stairs + atmospheric wall variants), 16 chamber props, 11 character sprites — 0x72 atlas fully purged. Outstanding: stair geometry (stairs sit in wall band, don't visually connect to landing floor), Cortana chamber composition (hub/v1.png is a separate-perspective hand-pixel that doesn't fit the side-cutaway view — reverted), active-state animations via PixelLab `animate_character`, use-spot pathing per locked chamber interaction model, ambient FX via `animate_object`, Cortana-faces-orb dynamic. ~36 of 50 PixelLab tiles still unused on the shelf (castle_4-7/13-15, most arch tiles, stair bonuses). Tested 2026-05-05 that Kenney 1-bit pack cannot mix with 0x72 even after recolor (line weight + shading mismatch); Kenney 1-bit reserved for UI-only icons later.
- Phase 4: full browser automation, OpenClaw input adapter, advanced UI polish.
- Phase 5 (LAST): walkthrough guide.

## Phase 2 surface map (current)

- `app/server/cerebroDb.ts` — schema + helpers (recordSessionStart/End, recordOutput, getOrCreateProjectByPath)
- `app/server/agentRouter.ts` — 10-agent routing config
- `app/server/integrations/notion.ts` — raw fetch against Notion API; pollInbox dedupes via `memory_entries.source = notion:<page_id>`; publishToOutbox sets full property set; auto-poll on boot
- `app/server/integrations/vault.ts` — filesystem writer; reads `CEREBRO_VAULT_DIR`
- `app/server/websocket.ts` — additive hooks at hero-new (recordSessionStart), removeHero (recordSessionEnd), processLine assistant text (recordOutput)
- `app/server/routers/{tasks,sessions,memory,outputs,integrations,keep}.ts` — tRPC surface
- `app/client/src/components/{TasksPanel,MemoryPanel,SessionsPanel}.tsx` — bottom drawers, mutually exclusive with Log
