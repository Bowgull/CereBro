# CereBro — repo guide for Claude Code

CereBro V1 is a local-first, harness-first personal AI operating layer with a pixel-art castle UI ("the Keep"). Backend will eventually be the harness (tasks, sessions, projects, memory pipeline, validation, output library, source library, model router, tool adapters). Frontend is the Keep — three floors of agent chambers.

## Where things live

- `app/` — the running client+server. Forked from `thousandsky2024/claude-pixel-agent-web` (MIT, "Claude Dungeon"). React 19 + Tailwind 4 + Phaser 3 + Express + tRPC + Drizzle + WebSocket.
  - `app/client/src/lib/keepConfig.ts` — palette tokens, FLOORS, GROUND_CHAMBERS.
  - `app/client/src/components/DungeonMapPhaser.tsx` — Phaser scene; pixel art preserved, room labels reskinned, Hub orb replaces boss-pentagram glow.
  - `app/client/src/pages/Home.tsx` — header, sidebar, floor selector, `FloorPending` panel for floors without art.
- `mockups/` — early HTML mockups. `keep-v2.html` and `keep-v3.html` are reference only; the live app supersedes them. `mockups/shell.html` predates the project and has scope violations (Declyne/Raven references) — do not use as reference.
- `CereBro_V1_*` and `CereBro_Final_Implementation_Pack/` (root) — locked planning docs. `CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md` is the canonical visual spec.
- `.nvmrc` pins Node 22 LTS.

## Running it

```bash
nvm use      # picks up .nvmrc → Node 22
cd app
pnpm install # only on first run
pnpm dev     # → http://localhost:3002 (auto-bumps from 3000 if busy)
```

Database is optional for boot. Drizzle is wired but `getDb()` is lazy; no `DATABASE_URL` means no DB, dev still runs.

## Locked decisions (do not change without explicit approval)

These live in auto-memory but are repeated here so any Claude reading the repo cold sees them:

- Castle aesthetic per `CereBro_Claude_Code_Repo_Starter_Pack/design-systems/cerebro-castle-ui.md`. Dark cinematic, premium, NOT fake-fantasy. Use `cerebroColors` tokens.
- All 10 agents in V1: Cortana, Tony Stark, Gojo, Silver Surfer, C-3PO (Ground); Aang, Batman, Professor Oak, Spock (Upper Spires); Piccolo (Crypts).
- Wizard-of-Oz: user is hidden. Cortana is the visible center. A glowing orb in Cortana's Hub represents the user. Cortana faces the orb to "speak to you." No "you" sprite anywhere.
- Storage tiers: Turso (libSQL cloud, free) for brain. Google Drive synced folder for vault and outputs. Local for heavy regenerable stuff. All paths env-configurable.
- No money. No paid services, no trials.
- Notion: inbox/outbox pattern, free tier.
- External Claude Code calls confirm individually. No auto-batching. Eats existing Claude Code session quota, not a separate API bill.
- Browser tools start with public-page browsing only.
- Raven Reviews: hard-locked. Zero surface in V1. Sealed code dir only with three-gate password unseal. NSFW image generation declined.
- Walkthrough guide is the LAST phase.

## Build cadence

Claude drives 100%: terminal, file edits, browser, account setup. User reviews and approves at decision level. When a step requires the user (account creation needing personal email/password, payment info, biometric auth, physical hardware), pause and ask, then resume driving.

## Scope discipline

Before any redesign or restyle:
1. Read the renderer/components that would be touched.
2. Inventory the assets that exist vs. the assets the redesign would need.
3. Pitch the version that's actually achievable in this session, with deferrals called out as honest placeholders rather than faked.
4. Get user approval on the scope before plowing in.

Pixel art is load-bearing. Don't sacrifice it for engineering convenience. (Session 2 lesson: first attempt at the castle restyle threw out the Phaser canvas for CSS cards. Reverted. Don't repeat.)

## Phase plan (where we are)

- Phase 0 ✅ doc scaffolding
- Phase 1 ⏳ fork Claude Dungeon → restyle to castle → run locally. Ground Hall live; Upper Spires + Crypts pending art pass.
- Phase 2: harness backend (tasks, sessions, projects, validation, memory, output library, source library) + Notion inbox/outbox + Turso + Drive vault.
- Phase 3: complete agent loop, all 10 agents with model router and skill files.
- Phase 4: full browser automation, OpenClaw input adapter, advanced UI polish.
- Phase 5 (LAST): walkthrough guide.
