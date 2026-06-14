# Watch Shelf Lock

This is the approved Watch Shelf source-of-truth packet:

- `mockups/compare/approved/watch-shelf/watch-shelf-overview-target-v1.png`
- `mockups/compare/approved/watch-shelf/watch-shelf-category-detail-target-v1.png`
- `mockups/compare/approved/watch-shelf/watch-shelf-save-current-page-target-v1.png`
- `mockups/compare/approved/watch-shelf/watch-shelf-manage-shelves-target-v1.png`

SHA-256:

- `watch-shelf-overview-target-v1.png`: `2f127a5ae61bd0483179591d275f876ac0413ef4972e5e590b9e6413765c0c3d`
- `watch-shelf-category-detail-target-v1.png`: `de2621d9abeaa8afad98ecb4f75c117f51b11b1810a1aa90071636d5ffaa102a`
- `watch-shelf-save-current-page-target-v1.png`: `c906e7b11377a33bbaaeb0f7a48f9c78155abb0347d01d1d76baa3c0694ae205`
- `watch-shelf-manage-shelves-target-v1.png`: `b959cec25a8124b83daa9ac9305a111d9c55d05381c120ca43c6d38a014c6b95`

Behavior:

- The right rail opens Watch Shelf as a contextual drawer.
- The original outer right rail stays untouched.
- Do not paste a second rail strip over the open drawer.
- Do not double-stack brass rails, arrows, or ornaments.
- The drawer sits to the left of the existing right rail with a small air gap.
- The browser page remains visible behind the drawer.
- Default mode is overlay.
- `Pin` keeps the shelf open while browsing.
- `X`, Escape, outside click, or the right rail arrow closes the shelf when unpinned.
- Opening an item closes the shelf unless pinned.
- Narrow windows stay overlay-only.
- Docked resize is not approved for V1.

Product model:

- Watch Shelf is a personal watching command center inside Browser.
- Top modes are `Continue`, `Queue`, `Live / New`, and `Favorites`.
- Shelves are user-editable categories such as `Anime`, `Twitch`, `YouTube`, `Netflix`, `Disney+`, `Crunchyroll`, `Max`, `Prime`, and custom shelves.
- `Watched` is not a shelf.
- `Finished`, `paused`, `dropped`, `watching`, and similar values are item state.
- Provider is metadata and can differ from shelf.
- Twitch is live creator tracking.
- YouTube is video and channel tracking.
- Streaming services are provider shelves for shows and movies.
- Thumbnail states are detected, loading, and missing fallback.
- Missing thumbnails use a branded shelf fallback, not a broken image.

Implementation rules:

- Use these images as Watch Shelf visual targets.
- Use the Browser Home lock as the surrounding shell target.
- Build real controls and hitboxes. Do not use a full screenshot as UI.
- Raster is allowed for source texture and thumbnails. Layout and controls must be React/CSS/SVG.
- Any future Watch Shelf visual change needs a new approved packet or explicit rejection note.
