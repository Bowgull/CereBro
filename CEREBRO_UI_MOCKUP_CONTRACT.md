# CereBro UI Mockup Contract

Status: current.

This is a hard visual contract for CereBro UI work. It exists because the
approved high-fidelity mockups are not mood boards. They are the build target.

## Non-Negotiable Target

The approved high-fidelity main CereBro shell mockup is the 1:1 visual target.

The approved high-fidelity Browser and Watch Shelf mockup is the 1:1 visual
target.

Future UI work must move the live app toward those mockups directly. Do not
interpret them as loose inspiration, a palette reference, or a general vibe.

## Source Order

For UI work, use this order:

1. Newest direct user instruction.
2. `CEREBRO_UI_MOCKUP_CONTRACT.md`.
3. `DESIGN.md`.
4. `CEREBRO_UI_REDESIGN_CONTRACT.md`.
5. `CEREBRO_ANTI_DRIFT_LAW.md`.
6. Castle composition spec and active Phaser renderer.
7. `CEREBRO_UI_TASTE_AUDIT.md`.
8. External taste references and tools.

Safety, privacy, Raven seal, approval gates, no-paid-services, and no-external
execution rules still apply. A visual mockup never authorizes unsafe behavior.

## Main Shell Fidelity

Match the approved main shell mockup as closely as the current stack allows:

- outer carved frame
- black marble or dark rich material field
- verdigris and ivory shell treatment
- gold structural trim
- plaque-style left rail
- compact OS labels
- quiet bottom OS tabs
- instrument-like command bar
- softened Aang presence near the command input
- right rail or context panel only when it serves the mockup and current route
- hidden machinery until requested
- castle as the primary object

The castle itself remains unchanged unless the user explicitly approves asset
replacement. Do not fake rooms, agents, sprites, or animation states that do not
exist.

## Browser Fidelity

Match the approved Browser and Watch Shelf mockup as closely as the current
stack allows:

- Browser is a core OS surface inside Workbench unless explicitly promoted
- normal page tabs represent real browser pages
- one URL/search bar behaves like a normal browser address field
- Watch Shelf is a named tab or drawer, not a fake streaming service
- Watch Shelf categories may exist when useful
- Add to Watch Shelf belongs behind the menu or Aang command
- Aang sits near the command box instead of taking a large right rail by default
- security is mostly automatic, with Spock surfacing only meaningful blocks
- no visible profile/private-window machinery in V1
- no generic Search tab when the URL bar and Aang already cover search intent
- no fake progress, fake logins, fake playback, or fake source discovery

## Deviation Rule

Any deviation from the approved mockups must be named before building.

Allowed deviation reasons:

- the live castle asset cannot yet match the generated image
- a control would imply functionality that does not exist
- safety or approval gates require a different state
- responsive layout requires a smaller equivalent
- the current component stack cannot reproduce a detail without a larger asset
  or renderer pass

Unallowed deviation reasons:

- easier to implement
- generic SaaS convention
- dashboard habit
- adding visible machinery
- replacing the mockup with a new taste direction
- interpreting the mockup as only a mood board

## Required UI Pass Workflow

Before meaningful UI edits:

1. Name the target: main shell mockup, Browser mockup, or both.
2. List the exact visible elements being matched.
3. List the exact deviations and why they are required.
4. Confirm no fake function is being added.
5. Confirm the castle is preserved.

After meaningful UI edits:

1. Screenshot the changed surface.
2. Compare against the approved mockup target.
3. Record what moved closer.
4. Record what still does not match.
5. Update `CEREBRO_SESSION_HANDOFF.md`.
6. Write the Obsidian session snapshot.

## Hard Stops

Stop and ask before:

- changing castle art, agent count, room count, floor count, or sprite identity
- adding a new primary surface
- adding visible machinery to the Keep shell
- changing the visual target away from the approved mockups
- using an external generator as a new source of truth
- replacing the Browser mockup with a generic browser/dashboard surface
- implementing fake browser, watch, source, login, streaming, or agent behavior

## Standing Closeout Line

Every UI pass closeout must include:

```text
Mockup fidelity: target used, screenshot path, matched elements, deviations, next fidelity gap.
```
