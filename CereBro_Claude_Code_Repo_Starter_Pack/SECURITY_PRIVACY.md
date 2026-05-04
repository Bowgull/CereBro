# CereBro V1 — Security and Privacy

## Core Rules

- Local-first by default.
- No external model call with private context without approval.
- No Notion write without approval unless explicitly automated.
- No browser private session without approval.
- No destructive cleanup without approval.
- No secrets in Markdown.
- No secrets in Chroma.
- No secrets in logs.
- No sealed module memory in core memory.

## Secret Storage

Secrets include:

- API keys
- OAuth tokens
- Notion token
- GitHub token
- external model keys
- browser cookies

Secrets must be stored using:

- environment variables
- system keychain if implemented later
- secure local config excluded from Git

Never commit `.env.local`.

## Approval Classes

### Safe

- read local metadata
- create draft output
- search local approved memory
- format text

### Approval Required

- write files
- move files
- delete files
- update Notion
- update Obsidian
- call external model
- run browser automation
- run terminal command
- enable recurring workflow

### Blocked Unless Enabled

- destructive cleanup
- private browser sessions
- sealed modules
- external account automation
- auto-posting
- unreviewed scripts
- background browsing
