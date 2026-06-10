# CereBro Compare Mockup Library

This folder is the source library for CereBro Compare.

Compare should pull from here when the user wants to compare the live app, a screenshot, artwork, browser page, or implementation pass against an approved visual target.

## Folder Rules

- `approved/` holds visual targets that are good enough to build toward.
- `candidates/` holds useful options that are not locked yet.
- `rejected/` holds failed directions that explain what not to repeat.

Do not delete rejected images casually. They prevent design drift.

## Current Approved Browser Targets

- `approved/browser-home/browser-home-symmetric-rails-target-v1.png`
- `approved/browser-home/browser-home-chat-expanded-aang-launcher-v1.png`
- `approved/browser-home/browser-home-chat-collapsed-aang-launcher-v2.png`
- `approved/browser-loaded/browser-loaded-website-target-v1.png`

## Current Rejected Browser Targets

- `rejected/browser-home/browser-home-chat-expanded-bottom-handle-v1.png`
- `rejected/browser-home/browser-home-chat-collapsed-bottom-handle-v1.png`
- `rejected/browser-home/browser-home-aang-standing-companion-target-v1.png`

## Compare Behavior

Default Compare is left and right:

- left side: live app, screenshot, webpage, or current build.
- right side: selected mockup from this folder.

The user should not have to know file paths. The UI should show plain labels such as:

- Browser Home.
- Browser Home, chat open.
- Browser Home, chat closed.
- Browser loaded page.

Technical filenames stay hidden.
