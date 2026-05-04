# CereBro V1 — Open Questions

## Blocking Questions

### OQ-001 Exact User MacBook Specs

Needed for final model routing.

Need:

- chip/CPU
- RAM
- internal storage total
- internal storage free
- Apple Silicon or Intel
- external SSD status

Status:

Open.

### OQ-002 Exact Local Model Shortlist

Need to test Ollama models on the actual MacBook.

Status:

Open.

### OQ-003 Chroma Runtime Approach

Need to decide whether Chroma runs as:

- local service
- embedded process
- Docker later
- alternate vector store

Status:

Open but not blocking Phase 0 or Phase 1.

### OQ-004 Notion Timing

Need to confirm whether Notion Bridge is built after local Output Library or during it.

Recommended:

After local Output Library.

Status:

Open but not blocking core app.

### OQ-005 Raven Reviews Priority

Current default:

Raven Reviews remains sealed/parked and is not built before core CereBro.

Need final user decision later:

- remove entirely
- sealed future module only
- placeholder shell in V1
- build after core V1

Status:

Open but not blocking core CereBro.

## Non-Blocking Questions

### OQ-006 Tauri Desktop Wrapper

Recommended:

Build local Next.js first, wrapper later.

Status:

Deferred.

### OQ-007 Browser Use Versus Stagehand

Recommended:

Define browser adapter first. Choose implementation after source ingestion works.

Status:

Deferred.

### OQ-008 Crawl4AI Timing

Recommended:

Add after static source ingestion works.

Status:

Deferred.

### OQ-009 Remotion Video Editor Depth

Recommended:

Include planning skill in V1, full editor later.

Status:

Deferred.

### OQ-010 Content Engine Depth

Recommended:

Build idea/outline/draft/save flow only in V1.

Status:

Deferred.
