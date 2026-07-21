# CereBro Mockup Source Map

Last updated: 2026-06-13

This file tells Claude and other build agents where the approved CereBro UI mockups live on this machine and in the repo.

## Local Repo Root

Current working checkout:

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish`

GitHub branch:

`codex/browser-1to1-polish`

## Approved Browser Home

Use this as the global Browser Home source of truth:

Repo path:

`mockups/approved/browser-home-symmetric-rails-target-v1.png`

Local absolute path:

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/browser-home-symmetric-rails-target-v1.png`

Lock doc:

`mockups/approved/BROWSER_HOME_1TO1_LOCK.md`

Local absolute path:

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/BROWSER_HOME_1TO1_LOCK.md`

SHA-256:

`f535fbd4d10b268f04879074c739482cd732e0ba62972f21792d197c1b5ebb7c`

## Approved Watch Shelf

Use these as the approved Watch Shelf source-of-truth packet.

Overview:

`mockups/approved/watch-shelf-overview-target-v1.png`

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/watch-shelf-overview-target-v1.png`

Category detail:

`mockups/approved/watch-shelf-category-detail-target-v1.png`

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/watch-shelf-category-detail-target-v1.png`

Save current page:

`mockups/approved/watch-shelf-save-current-page-target-v1.png`

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/watch-shelf-save-current-page-target-v1.png`

Manage shelves:

`mockups/approved/watch-shelf-manage-shelves-target-v1.png`

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/watch-shelf-manage-shelves-target-v1.png`

Lock doc:

`mockups/approved/WATCH_SHELF_LOCK.md`

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/WATCH_SHELF_LOCK.md`

## Approved Loaded Browser Page

Repo path:

`mockups/approved/browser-loaded-website-target-v1.png`

Local absolute path:

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/browser-loaded-website-target-v1.png`

## Manifest

The central mockup manifest is:

`mockups/approved/manifest.json`

Local absolute path:

`/Users/lindsaybell/SSD-Recovery/Repos/Desktop/CereBro-browser-1to1-polish/mockups/approved/manifest.json`

Read this first when a build pass asks what visual target is approved.

## Rules For Build Agents

- Use approved mockups, not proposal folders.
- Do not use the app icon as the Browser UI reference.
- Do not use a full screenshot as production UI.
- Raster is acceptable for texture, thumbnails, and painterly source art.
- Layout, controls, hitboxes, drawers, tabs, cards, and forms must become real React, CSS, and SVG.
- The right Watch Shelf rail must not duplicate the outer right rail.
- If a new visual direction is needed, create a proposal first. Do not ship it as production UI.
