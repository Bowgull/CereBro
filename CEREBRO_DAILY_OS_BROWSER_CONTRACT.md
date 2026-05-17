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
- browser history
- bookmarks
- project pins
- trusted site profiles
- capture current page to Sources
- attach current page or screenshot to Workbench
- send current page to Aang for explanation
- open a page from Aang, Surfer, Project Lab, Workbench, or Ledger

Manual browsing does not require an agent approval gate. The user is acting.

Agent browsing does require gates.

## Browser Safety Profiles

CereBro keeps browser safety visible but quiet.

Profiles:

- Trusted service: known user-approved services. Login stays local.
- Normal public page: public page opened manually or after low-risk approval.
- Research review: Surfer opens or inspects sources after approval.
- Risky page: Spock gates before deeper browsing.
- Isolated page: popups, downloads, camera, mic, location, notifications,
  third-party cookies, and credential entry blocked by default.

No stealth, bot bypass, paywall bypass, login-wall bypass, terms bypass, proxy
rotation, cookie extraction, or hidden browser automation enters V1 without a
separate Spock receipt and explicit approval.

## Watch Mode

Watch mode is normal entertainment and media continuation.

Supported V1 intent examples:

- resume a trusted service page
- find the likely service or saved bookmark for a show
- remember approved preferences such as dub-only anime
- search for public source options when the user asks
- surface options with source/risk notes
- open the selected option

CereBro does not steal credentials, bypass access controls, download media, or
hide platform risk. Legit services stay in trusted local browser state.

Raven is not part of Watch mode. Raven stays sealed and separate.

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
