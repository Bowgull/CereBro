# CereBro V1 — Model Routing and Hardware Plan

## 1. Purpose

CereBro must be realistic about the user’s MacBook hardware.

The system should not assume every agent has a massive model running locally.

CereBro should route work by:

- Task type
- Complexity
- Privacy level
- Context size
- Hardware limits
- Cost preference
- User approval

## 2. Core Decision

CereBro is local-first, not local-only.

Default:

```text
Use local/Ollama models when possible.
Escalate to stronger external/cloud models only when needed and approved.
```

## 3. Model Classes

### 3.1 `lightweight_formatter`

Use for:

- Formatting
- Simple summaries
- Meeting note structure
- Checklist cleanup
- Basic classification
- Low-risk C-3PO work

Privacy:

- Local preferred

### 3.2 `local_summary`

Use for:

- Summarizing local notes
- Summarizing sources
- Extracting key points
- Creating source cards
- Drafting simple guides

Privacy:

- Local preferred

### 3.3 `local_code_helper`

Use for:

- Small code explanations
- Simple bug ideas
- File structure suggestions
- Basic implementation plans

Privacy:

- Local preferred

### 3.4 `local_reasoner`

Use for:

- Medium reasoning
- Planning
- Tradeoffs
- Light architecture
- Spock sanity checks
- Batman basic analysis

Privacy:

- Local preferred if hardware supports it

### 3.5 `strong_reasoning_external`

Use for:

- Important architecture decisions
- Complex tradeoffs
- Large context reasoning
- Critical blueprint revisions
- High-risk planning

Privacy:

- Requires approval if private context is included

### 3.6 `strong_coding_external`

Use for:

- Complex code generation
- Refactors
- Multi-file debugging
- Claude Code handoff refinement
- Large technical plans

Privacy:

- Requires approval if private code/context is included

### 3.7 `long_context_external`

Use for:

- Large blueprint reviews
- Multi-file reasoning
- Large source comparison
- Cross-document consistency checks

Privacy:

- Requires approval if private context is included

### 3.8 `embedding`

Use for:

- Chroma/vector memory
- Source indexing
- Semantic search

Privacy:

- Local preferred

## 4. Agent To Model Class Mapping

### Aang

Default:

- `lightweight_formatter`
- `local_summary`

Escalate to:

- `local_reasoner` for complicated guidance

### Cortana

Default:

- `local_reasoner`
- rule-based routing where possible

Escalate to:

- `strong_reasoning_external` only if routing requires complex architecture judgment

### Batman

Default:

- `local_reasoner`

Escalate to:

- `strong_reasoning_external` for major architecture, high-stakes tradeoffs, or long-context plans

### Tony Stark

Default:

- `local_code_helper`
- `local_reasoner`

Escalate to:

- `strong_coding_external`
- `long_context_external`

### Gojo

Default:

- `local_reasoner`
- `lightweight_formatter`

Escalate to:

- `strong_reasoning_external` for complex UI/UX system design
- creative external models only if approved

### Silver Surfer

Default:

- `local_summary`
- `local_reasoner`

Escalate to:

- `long_context_external` for large source comparison

### C-3PO

Default:

- `lightweight_formatter`
- `local_summary`

Escalate to:

- rarely needed unless document is huge

### Professor Oak

Default:

- `local_reasoner`

Escalate to:

- `strong_reasoning_external`
- `long_context_external`

### Piccolo

Default:

- rule-based logic
- `lightweight_formatter` for reports

Escalate to:

- not usually needed

### Spock

Default:

- `local_reasoner`

Escalate to:

- `strong_reasoning_external` for architecture contradiction checks

## 5. Hardware Profile Fields

The user’s exact MacBook hardware must be stored in Settings.

Fields:

```json
{
  "device_name": "",
  "chip_or_cpu": "",
  "ram_gb": null,
  "internal_storage_total_gb": null,
  "internal_storage_free_gb": null,
  "external_ssd_connected": false,
  "external_ssd_path": "",
  "gpu_available": "",
  "ollama_installed": false,
  "notes": ""
}
```

## 6. Model Registry Fields

Every model profile must include:

```json
{
  "id": "",
  "name": "",
  "provider": "",
  "location": "local",
  "model_class": "",
  "enabled": true,
  "context_window": null,
  "estimated_ram_need": "",
  "estimated_disk_need": "",
  "best_for": [],
  "avoid_for": [],
  "privacy_notes": "",
  "cost_notes": "",
  "hardware_notes": "",
  "tested_on_device": false,
  "test_result": "",
  "last_tested_at": ""
}
```

## 7. Local Model Testing Procedure

Before using a local model heavily:

1. Confirm model is installed.
2. Run simple prompt.
3. Run formatting prompt.
4. Run summary prompt.
5. Run reasoning prompt.
6. Measure response time.
7. Check memory pressure manually if possible.
8. Save result in model registry.

Test record:

```json
{
  "model_id": "",
  "test_type": "",
  "prompt_size": "",
  "response_time_seconds": null,
  "quality_rating": "unknown",
  "speed_rating": "unknown",
  "stability": "unknown",
  "notes": ""
}
```

Quality ratings:

- poor
- usable
- good
- strong

Speed ratings:

- too_slow
- slow
- usable
- fast

Stability:

- failed
- unstable
- stable

## 8. Model Escalation Prompt

Before using external/cloud model:

```text
This task may exceed the reliable local model capacity.

Reason:
[reason]

Recommended external model class:
[class]

Context that may be sent:
[summary]

Sensitive data included:
[yes/no]

Cost risk:
[low/medium/high/unknown]

Approve external escalation?
```

Options:

- Approve once
- Approve for this task
- Use local only
- Cancel task
- Redact context first

## 9. Local-Only Mode

CereBro must support local-only mode.

When local-only mode is enabled:

- No external models
- No cloud APIs
- No Notion write unless user explicitly enables it
- No web research unless browser/web is enabled
- All tasks must use local models or rule-based logic
- If local model cannot handle task, CereBro says so and offers options

## 10. External Model Mode

External models are disabled by default.

If enabled:

- Each provider must be registered
- Each provider must have privacy notes
- Each provider must have approval policy
- External calls must be logged
- Private/sealed memory must not be sent
- Secrets must be masked

## 11. Minimum Viable Model Setup

Minimum V1 can work with:

1. One lightweight local model for formatting/simple summaries.
2. One embedding model for Chroma.
3. External Claude Code / Opus for actual building outside CereBro.
4. Optional stronger local coding/reasoning model if hardware allows.

CereBro should not require a giant local model to start.

## 12. What Not To Install First

Do not start by installing:

- Huge 70B+ models
- Multiple redundant coding models
- Heavy image/video generation models
- Full ComfyUI setup
- Full SDXL model library
- Raven Reviews generation models

Install only what the current phase needs.

## 13. SSD Impact

An external SSD helps with:

- Storing models
- Storing Chroma database
- Storing rendered videos
- Storing generated images
- Storing browser captures
- Storing backups
- Keeping internal drive from filling up

An external SSD does not magically increase RAM.

An external SSD does not make too-large models run well if RAM/compute are insufficient.

An external SSD reduces storage pressure and can improve workflow organization, but model speed still depends heavily on CPU/GPU/RAM.

## 14. Model Router Done Means

Model Router is complete when:

- Models can be registered
- Models have classes
- Agents request model classes, not specific hardcoded models
- Local-only mode works
- External escalation requires approval
- Model calls are logged
- Failed model calls create structured errors
- Settings page displays model status
