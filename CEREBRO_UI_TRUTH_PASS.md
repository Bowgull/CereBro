# CereBro UI Truth Pass

Status: current.

Date: 2026-05-19.

## Purpose

This file compares the live UI against the approved 1:1 high-fidelity mockups.
It prevents the build from drifting into generic dashboard shape while the V1
plan continues.

## Approved Target

- Main shell mockup: carved Keep OS, black marble field, verdigris/ivory
  surfaces, gold structural trim, plaque rail, castle as the primary object,
  Aang command bar, quiet context.
- Browser mockup: first-class Browser OS surface, normal tab row,
  one URL/search field, quiet shield, page menu, Watch Shelf access, project
  pins/bookmarks only when real, no fake site tabs or fake media state.

## Live UI Gap

- The Keep exists, but the castle still does not own the screen as strongly as
  the mockup.
- The shell material is closer than before, but still reads too much like a
  dense app dashboard.
- Route Read existed as an always-open right rail. It should be collapsed by
  default and open only on request, risk, or approval need.
- Browser was buried inside Workbench. That was wrong for the final OS shape.
- Workbench still carries too much receipt machinery near primary work.
- Browser tabs, project pins, and Watch Shelf are honest shells, but the real
  page runner, history, bookmarks, source capture, and Watch saves are not done.
- Aang command exists, but Aang is not yet visually soft or close enough to the
  command surface.

## Corrections Locked This Pass

- Browser is promoted to a first-class OS zone.
- Route Read is collapsed by default.
- Workbench remains receipt/proof/body infrastructure.
- Browser remains honest: no page render, no fake service state, no fake saved
  bookmarks, no fake Watch progress.

## What Must Not Change In This Pass

- Castle art.
- Agent count.
- Room count.
- Sprite identity.
- Raven boundary.
- Paid-service rules.
- Browser runner safety gates.
- Any external browsing, fetching, saving, downloading, login, or source
  discovery behavior.

## Next UI Fidelity Work

1. Make Browser visuals closer to the approved high-fidelity Browser mockup.
2. Reduce remaining generic dashboard chrome around the shell.
3. Move Aang visually closer to the bottom command bar.
4. Keep Route Read available as a compact disclosure, not a permanent rail.
5. Build the real manual browser runner only after the approval/safety contract
   is ready.

## Mockup Fidelity Rule

Every UI pass must state:

```text
Mockup fidelity: target used, screenshot path, matched elements, deviations, next fidelity gap.
```
