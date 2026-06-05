# Spotify Music Design

Date: 2026-06-05

## Stance

CereBro should add music as a controlled Spotify adapter, not a cloned music app.

Aang is the command surface. Gojo shapes taste. Cortana routes and checks permission. The Spotify adapter performs Spotify calls. Oak validates playlist changes before write. C-3PO formats names and descriptions. Silver Surfer enters only when external discovery is needed.

Core rule:

> Aang owns the conversation. Gojo owns the vibe. Spotify owns playback. The harness owns permission.

## User Goal

The user wants to say things like:

> Make me a bangin playlist based off road trip but include Sunrise by Simply Red.

CereBro should understand:

- This is a playlist creation request.
- `road trip` is the core setting.
- `bangin` means energetic, fun, high-momentum, and not flat.
- `Sunrise` by Simply Red is a required anchor track.
- The output should be a real Spotify playlist, not just a text list.
- The user should see and approve the draft before CereBro writes to Spotify.

## Agent Roles

### Aang

Front door for the request.

Aang:

- Parses the user's music intent.
- Asks one clarifying question only when needed.
- Creates the task/session.
- Requests approval before write actions.
- Explains the result in plain language.

Aang does not execute Spotify tools directly.

### Cortana

System router and permission authority.

Cortana:

- Routes playlist requests to the music workflow.
- Checks whether Spotify is connected.
- Checks whether the requested action needs approval.
- Keeps the task inside the harness.

### Gojo

Creative taste layer.

Gojo:

- Shapes the playlist arc.
- Converts loose vibe language into curation rules.
- Prevents generic playlist output.
- Decides pacing: opener, lift, anchor placement, cooldown, closer.
- Flags tracks that match the keyword but miss the feel.

Gojo is essential for playlist generation. Without Gojo, the feature becomes search plus shuffle.

### Spotify Adapter

Tool boundary.

The adapter:

- Handles OAuth.
- Searches Spotify.
- Reads current playback and devices.
- Creates playlists.
- Adds tracks.
- Starts playback when allowed.
- Adds to queue when allowed.
- Logs tool calls and errors.

The adapter should not expose OAuth, scopes, API, MCP, or CLI wording in the main UI.

### C-3PO

Human output layer.

C-3PO:

- Writes playlist names.
- Writes playlist descriptions.
- Formats the draft for review.
- Keeps explanations concise.

### Oak

Validation layer.

Oak checks:

- Required anchor tracks are included.
- Duplicate tracks are removed.
- Track count matches the request.
- Unavailable tracks are flagged.
- Explicit content rules are respected.
- The playlist was not written without approval.

### Silver Surfer

External discovery only.

Use Silver Surfer when the playlist needs fresh external context, such as:

- New releases.
- Festival lineup playlists.
- A source article.
- A public playlist to borrow direction from.

Do not use Silver Surfer for normal Spotify library or playback commands.

## Product Surface

Music should feel like a small, useful CereBro surface, not a separate app.

Main surface:

- `Connect Spotify`
- `Now Playing`
- Current device
- Queue preview
- Draft playlist preview
- One approval action when writing to Spotify

Music Settings:

- Connected account
- Reconnect
- Device choice
- Permissions
- Token status
- Logs

Hidden machinery:

- OAuth
- PKCE
- scopes
- MCP
- CLI
- access tokens
- refresh tokens
- API endpoints

## Workflow: Make A Playlist

1. User asks Aang for a playlist.
2. Aang extracts intent, mood, setting, exclusions, and required tracks.
3. Cortana routes to the music workflow.
4. Gojo creates a curation brief.
5. Spotify adapter searches candidate tracks.
6. Gojo ranks and shapes the track order.
7. C-3PO names and describes the playlist.
8. Oak validates the draft.
9. CereBro shows the draft.
10. User approves.
11. Spotify adapter creates the playlist and adds tracks.
12. CereBro shows the Spotify link and optional `Play Now`.

## Workflow: Play Music

1. User asks Aang to play music.
2. Cortana checks Spotify connection and playback permissions.
3. Spotify adapter checks active devices.
4. If there is no device, CereBro asks the user to open Spotify or choose a device.
5. Spotify adapter starts playback or queues the requested track, album, playlist, or draft.

Playback control may require Spotify Premium. CereBro should say this plainly when Spotify rejects playback.

## Technical Direction

Use Spotify Web API first.

Expected operations:

- OAuth with PKCE.
- Search catalog.
- Read current playback state.
- Read queue.
- Create playlist.
- Add items to playlist.
- Start or resume playback.
- Add item to queue.

Store secrets outside tracked files. Prefer macOS Keychain or encrypted local storage for refresh tokens.

Request minimum scopes first. Add write scopes only when the user connects playlist creation.

## GitHub Research

SoulSync is useful research, not the first dependency.

SoulSync is a large self-hosted music discovery and library manager. It includes Spotify, Deezer, Tidal, Qobuz, YouTube, Soulseek, MusicBrainz, Last.fm, Plex, Jellyfin, Navidrome, metadata enrichment, download flows, matching, automation, and its own media player.

Borrow from SoulSync:

- Matching confidence.
- Manual match override.
- Metadata enrichment ideas.
- Playlist sync concepts.
- Rate-limit handling.
- Discovery categories like hidden gems and forgotten favorites.

Do not borrow yet:

- Downloading.
- Library file organization.
- Plex, Jellyfin, or Navidrome management.
- Multi-source fallback.
- Background automation chains.
- Any path that requires broad filesystem access.

Smaller GitHub projects and Spotify MCP servers can be reviewed as reference implementations. They should not become CereBro's architecture boundary unless audited.

## Known Constraints

- No money.
- No paid fallback.
- No free trial that needs a card.
- No stream ripping.
- Do not download Spotify content.
- Do not train models on Spotify content.
- Do not store listening history in memory unless the user explicitly turns that on.
- Do not ask for Full Disk Access for Spotify control.

macOS Automation permission may be needed only if CereBro controls the local Spotify desktop app through AppleScript. That is a fallback path, not the main architecture.

## Open Questions

1. Should the first UI be a small Music drawer or a dedicated Keep room/surface?
2. Should playlist drafts default to private playlists?
3. Should CereBro use only the user's library first, or search all Spotify by default?
4. Should Gojo create named playlist arcs such as `open road`, `sunrise`, `gas station banger`, `night drive`, and `home stretch`?
5. Should playback be part of the first build, or should the first slice create and open playlists only?

## First Build Slice

Recommended first slice:

1. Spotify connection status.
2. Natural-language playlist draft.
3. Required-track inclusion.
4. Draft review UI.
5. Approval-gated playlist creation.
6. Add tracks to playlist.
7. Open playlist in Spotify.

Defer:

- Playback control.
- Queue control.
- SoulSync adapter.
- Local library management.
- External discovery enrichment.

This slice proves the hard part: CereBro can turn a human vibe request into a real Spotify playlist without hiding tool actions.
