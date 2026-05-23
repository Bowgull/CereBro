# CereBro Daily OS And Browser Contract

Last updated: 2026-05-17

## Purpose

CereBro is a Keep-first AI OS for daily use. It is not only a coding harness.

The browser is a core OS surface because daily use depends on web context,
services, research, media, source capture, and visible proof.

This contract keeps that direction explicit without exposing the machinery in
the primary UI.

## Product Rule

The user talks to Aang.

Aang reads the intent. Cortana routes the work. The owning agents act inside
their lanes. The UI shows the simple current action first and exposes the route,
risk, proof, and receipts only when needed.

The user should not need to understand an agent matrix, model map, source
policy, browser policy, or execution graph to use CereBro.

## Daily OS Modes

V1 modes:

- Ask
- Capture
- Research
- Build
- Create
- Learn
- Watch
- Review
- Maintain

These are user-facing modes, not separate apps.

Aang infers the mode from the command, selected surface, current project,
attachments, browser context, prior corrections, and risk level. Aang asks only
when the read is ambiguous or the risk class changes.

## Manual Browser Surface

The manual browser is user-controlled first.

V1 manual browser must support:

- open pages
- multiple tabs
- tab switching
- URL/search in one address field
- browser history
- bookmarks
- project pins
- automatic quiet safety
- capture current page to Sources
- attach current page or screenshot to Workbench
- send current page to Aang for explanation
- open a page from Aang, Surfer, Project Lab, Workbench, or Ledger

Manual browsing does not require an agent approval gate. The user is acting.

Agent browsing does require gates.

### Browser V1 Source-Truth Shape

The approved Browser V1 first pass is honest and buildable.

It shows the browser shell and local CereBro controls without pretending
advanced browser automation, persisted service sessions, or media tracking are
already solved.

Default layout:

- left rail: Keep, Browser, Work, Sources, Ledger, Basement
- Browser is active
- no Watch item in the left rail
- main header: CereBro mark, Browser, Online
- browser chrome: back, forward, reload, URL/search field, shield icon,
  Watch Shelf button, three-dot page menu
- tab row: real browser pages only, starting with generic labels such as
  `Tab 1`, `Tab 2`, `New Tab`, and `+`
- no fake default site tabs such as YouTube, Goodreads, Reddit, or Anime
  Search until those are actual user-opened pages
- optional bookmark/project row with user-created items only
- no fake default bookmark folders
- main viewport is the browser page or first-run start page
- Watch Shelf opens as a drawer inside Browser
- Aang lives beside the bottom Ask bar, not in a full right rail
- the bottom bar shows `Ask Aang`, one compact mode pill/dropdown, and quiet
  status such as `Manual browsing`

The Browser first pass must not show:

- a right Aang route rail
- a full route chain
- a Search tab
- a Manual Browser button
- visible browser profile picker
- fake persisted service state
- fake streaming progress
- fake external website content presented as real
- Spock popover unless the risk interaction is actually being designed
- VPN, proxy, download manager, install, clone, or repo-run controls
- giant policy panels, route matrices, source cards, or debug proof

### Page Actions Menu

The three-dot page menu is the home for contextual browser actions.

Initial menu items:

- Add to Watch
- Save to Sources
- Attach to Workbench
- Annotate
- Pin to Project
- Explain with Aang
- Copy Link

Unwired actions should be visibly disabled or labeled as planned in the first
build pass. Do not show them as working actions until their contracts exist.

## Browser Safety Profiles

CereBro keeps browser safety automatic and quiet.

The user does not manage browser profiles in normal use.

Internal policy can treat pages as trusted, normal, research review, risky, or
strict, but the UI does not expose a profile picker or profile manager.

Default user-facing shape:

- normal browsing shows only a small shield icon or no visible warning
- risk changes open a small Spock warning
- Basement owns browser safety settings
- override controls appear only when something is blocked

Spock warning V1:

- small Spock sprite
- plain risk sentence
- `Keep blocked`
- `Allow once`
- `Always allow here` only for safe repeat permissions
- `Why?`

Do not show `Open isolated` in the V1 UI. Isolation can exist internally.

No stealth, bot bypass, paywall bypass, login-wall bypass, terms bypass, proxy
rotation, cookie extraction, or hidden browser automation enters V1 without a
separate Spock receipt and explicit approval.

## Watch Mode

Watch mode is normal entertainment and media continuation.

Supported V1 intent examples:

- open a saved service page, playlist, channel, or source
- add the current page to Watch from the page menu
- add the current page to Watch by asking Aang
- find the likely saved bookmark or source for a show
- remember approved preferences such as dub-only anime
- search for public source options when the user asks
- surface options with source/risk notes
- open the selected option

CereBro does not steal credentials, bypass access controls, download media, or
hide platform risk. Legit services stay in trusted local browser state.

Raven is not part of Watch mode. Raven stays sealed and separate.

### Watch Shelf

Watch Shelf is not a primary surface and not a browser tab.

It opens from:

- Browser toolbar button
- page menu
- Aang command

V1 shelf categories:

- Watching
- Want
- YouTube
- Twitch
- Anime
- Finished

These categories are shelf filters, not separate apps.

Default row shape:

- title
- source note
- optional preference chip such as `Dub Only`
- `Open`

Use `Open` unless CereBro has a saved last-known page, episode, playlist, or
progress note. Use `Resume` only when the saved data supports it.

No thumbnails by default in the first build pass. Covers can come later after
storage, copyright, and source handling are clear.

First-run shelf state:

- no fake saved services
- no fake progress
- no real platform logos
- show a plain empty state and `Add current page` when a page is open

## Agent Responsibilities

This matrix is internal. Do not expose it as a primary UI.

| Agent | Daily OS role |
|---|---|
| Aang | Intent reader, companion, explainer, correction loop, preference memory proposal. |
| Cortana | Router, mode owner, lane assignment, receipt spine. |
| Surfer | Web, Reddit, GitHub, services, source discovery, browser/source proposals. |
| Spock | URL, download, credential, install, script, repo, permission, and browser risk gate. |
| Oak | Source validation, knowledge hygiene, memory promotion, stale-source review. |
| Tony | Build work, approved commands, small tools, code explanation, recovery notes. |
| Gojo | UI quality, screenshot critique, visual polish, taste review, asset fit. |
| C-3PO | Output formatting, rewriting, translation, documents, messages. |
| Piccolo | Watchers, reminders, recurring checks, uptime, stale-state nudges. |
| Hedwig | Capture intake from Slack, Notion, browser share, manual paste, and reminders. |
| Batman | Planning, sequencing, threat models, project strategy, what-could-go-wrong review. |

## Tony Explicit-Effects Rule

Zero is a reference for Tony's future small-tool discipline, not a V1
dependency.

Tony proposals should state:

- command or tool target
- files touched
- network use
- external writes
- install or dependency change
- destructive action risk
- credential risk
- expected output
- expected failure modes
- rollback or recovery note when possible

Spock reads the effect scope before approval. Ledger stores the effect scope in
the receipt. Terminal Lab explains it in plain language.

Do not install Zero, rewrite CereBro in Zero, or add a Zero toolchain until the
approval-gated execution lane is stable and a separate install receipt is
approved.

## UI Rule

The product UI shows:

- Aang's read
- current mode
- primary action
- agent movement/status when relevant
- approval gate when risk appears
- simple receipt when the user opens details

The product UI hides:

- agent capability matrix
- model assignment tables
- raw tool lists
- browser policies
- route graphs
- storage metadata
- source scoring internals

Hidden does not mean absent. It means available behind the right drawer,
Workbench body, Ledger receipt, or Basement setting.

## Build Path Impact

Immediate plan changes:

1. Add Daily OS and Browser OS to the master plan.
2. Keep Research/Sources contract work active.
3. Add manual browser as a V1 lane before powerful agent browser automation.
4. Keep Tony's explicit-effects contract in Terminal Lab and Ledger.
5. Finish Model/Tool Registry readiness before model installs.
6. Keep PixelLab/high-fidelity UI polish after contracts settle.

No new primary surface is approved by this contract. The manual browser is part
of the existing Workshop/Workbench OS surface unless a later UI decision
approves a dedicated visible browser view.

## Stop Rules

Stop and ask before:

- browser automation beyond the approved lane
- cookie extraction
- proxy or VPN integration
- downloads
- credential entry automation
- account setup
- paid service use
- external model/provider calls
- model downloads
- third-party repo install or daemon
- Raven data movement into CereBro
- new primary navigation surface
