# CereBro Browser Candidate Mockups

Status: candidate. Not approved.

These files recreate the missing Browser and Watch Shelf high-fidelity target
as a repo-native HTML/CSS reference. They are meant for user review before any
live UI implementation pass.

## Files

- `cerebro-browser-hifi-mockups.html`
  - `?screen=home`
  - `?screen=capture`
  - `?screen=annotate`
  - `?screen=compare-picker`
  - `?screen=compare`
  - `?screen=watch`
- `rendered/cerebro-browser-home.png`
- `rendered/cerebro-browser-capture.png`
- `rendered/cerebro-browser-annotate.png`
- `rendered/cerebro-browser-compare-picker.png`
- `rendered/cerebro-browser-compare.png`
- `rendered/cerebro-browser-watch.png`

## Target Decisions

- Browser is a primary CereBro surface.
- Normal browsing stays simple.
- Browser chrome shows tabs, URL/search, Shield, Capture, Tools, and menu.
- Capture owns Bookmark, Add to Obsidian, Add to Watch, Attach to Work,
  Screenshot to Aang, Annotate, and Compare.
- Watch Shelf is a drawer inside Browser, not a top-level app.
- Annotation is visual markup: box, arrow, marker, highlight, text, blur,
  colors, undo, compare, done.
- Compare is for current work versus target: app, website, artwork, mockup,
  screenshot, previous version, or reference.
- Compare asks where the target comes from before opening the comparison.
- Compare needs a mockup/reference library, not random Downloads files.
- Aang receives screenshots, annotations, and comparisons as work context.
- Add to Watch detects what it can and asks for missing title/category/details.

## Hidden Machinery Rule

Do not expose Sources, receipts, routes, runners, sandbox, contracts, vectors,
or agent internals on this surface. Those can exist behind Browser, Workshop,
Ledger, or Basement.

## Review Questions

- Is the browser chrome clean enough for daily use.
- Is Capture the right top-level concept.
- Does Watch Shelf feel useful without becoming a fake streaming app.
- Does annotation feel powerful without becoming clutter.
- Does Compare clearly support building apps, sites, art, and UI.
- Does the Compare target picker explain where references come from.
- Does the Watch Shelf focus flow feel like everyday browser use.
