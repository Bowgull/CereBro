# CereBro Anti-Drift Law

Status: current.

This is a hard build law. It is not an agent, a persona, or a new product
surface. It exists to keep CereBro pointed at the user's stated product, not at
whatever looks interesting in the moment.

## Source Order

When instructions conflict, use this order:

1. Newest direct user instruction in the current session.
2. `CEREBRO_MASTER_BUILD_PLAN.md`.
3. `CEREBRO_ANTI_DRIFT_LAW.md`.
4. `AGENTS.md`.
5. `CEREBRO_SESSION_HANDOFF.md` and `CEREBRO_BUILD_QUEUE.md`.
6. Obsidian mirrors, source notes, archives, and older planning packs.

The repo copy of this file is canonical. The Obsidian copy mirrors it for
retrieval and product memory. If they conflict, the repo copy wins unless the
newest direct user instruction updates the rule.

## Core Product Read

CereBro V1 is a fast, local-controlled AI OS with a beautiful low-learning-curve
Keep. It hides machinery until requested, shows proof when needed, routes
through Aang and Cortana, and keeps manual approval visible for risky actions.

The build path is not:

- a generic plugin dashboard
- a new code lab separate from Terminal Lab
- a Raven content system inside CereBro
- a paid cloud AI stack
- a browser automation toy
- a pile of exposed debug panels
- a private-content indexer

GitHub is a standing source lane. CereBro should look at relevant repos,
patterns, issues, docs, and source notes when they can improve the build or the
user's understanding. That is not drift. Drift starts when GitHub becomes a
reason to clone, install, run, copy, or build off-path work without proof,
license review, security review, and a clear return to the current plan.

## Creativity Rule

Creativity is allowed inside the lane. Freestyling is not allowed outside the
lane.

Codex and CereBro should still make judgment calls, improve taste, simplify
surfaces, use GitHub and design references, and make the product feel more
alive. The guardrail is ownership and return path. A creative change is valid
when it clearly serves the current build-plan item, belongs to a named surface,
reduces machinery or improves comprehension, and returns to the planned path.

If a creative idea needs a new surface, new mode, new agent, new integration, or
new product promise, it is not a small creative choice. It is a product decision
and must stop for approval.

## Major Drift

Major drift stops the pass. Ask before continuing.

Major drift includes:

- adding a new primary surface, lab, agent, or mode without explicit approval
- moving Raven data, Raven generation, or Raven memory into core CereBro
- installing, cloning, running, copying, or wiring external projects because
  they are interesting rather than required by the build path
- adding paid services, trials, model downloads, external daemons, account
  setup, or credentials
- building entertainment, browser playback, or media-site automation before the
  locked V1 path is ready
- replacing Terminal Lab with a separate Code Lab
- exposing internal proof, debug, or routing machinery on primary product
  surfaces
- hiding every proof trail so the user cannot verify what happened
- moving away from fast, local-first, visible-control AI OS behavior
- using workers when ownership is unclear or the result cannot be integrated
  safely
- continuing after context bloat when a summary and clear would be cleaner

## Minor Drift

Minor drift is corrected inside the same pass and named in the closeout.

Minor drift includes:

- wording that makes CereBro sound like generic AI software
- a layout that shows too much machinery by default
- a patch that is technically useful but weakly tied to the current build path
- a creative UI or UX change that has no named owner surface or return path
- missing proof of which product surface owns a change
- overlong output that makes the next decision harder

## Required Check Before Edits

Before meaningful edits, answer these internally:

1. What did the user ask for most recently?
2. Which build-plan item does this advance?
3. Which surface owns it?
4. What should not be built in this pass?
5. What condition makes me stop and ask?
6. If GitHub/source material is relevant, what fact, pattern, or warning is it
   being used for, and where does the work return to the plan?
7. If this is a creative UI or UX choice, is it inside the lane or outside it?

If any answer is unclear, inspect the repo and Obsidian first. If it is still
unclear and the risk is product drift, ask the user.

## Required Closeout

Every real build pass should close with a drift check:

- why the work was on path
- files changed
- what was deferred
- whether any drift risk remains
- updated completion percentages

## Agent Use

This should not become a new agent first. It should become a law used by the
system.

Later agent roles:

- Aang restates the user's intent in plain language.
- Cortana routes work only after the intent is stable.
- Spock blocks unsafe or off-path actions.
- Professor Oak checks source and plan truth.

No extra visible agent should be added for drift unless the user approves a
specific product reason.

## Obsidian And RAG Rule

The Obsidian mirror must carry retrieval frontmatter:

- `canonical_status: current`
- `retrieval_status: active`
- `privacy_class: internal`
- `source_ids`
- `related_notes`
- `llm_summary`

Archive snapshots do not override this law. Retrieval must cite this file or
the Obsidian mirror when using it to justify a build decision.
