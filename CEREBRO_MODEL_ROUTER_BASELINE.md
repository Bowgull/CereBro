# CereBro Model Router Baseline

Last updated: 2026-05-07

## Session 2 Baseline

This is a planning baseline, not a completed local-model test record. No local
models have been installed or downloaded in this session.

## Hardware

- Machine: MacBook Pro.
- Model identifier: Mac14,7.
- Chip: Apple M2.
- CPU cores: 8 total, 4 performance and 4 efficiency.
- Memory: 8GB unified memory.
- macOS: 26.4.1.
- Internal data volume: 228Gi total, 166Gi used, 32Gi available, 85% capacity.

Do not record serial numbers, hardware UUIDs, or provisioning IDs in repo docs.

## Ollama Status

- `ollama` is not currently found on PATH.
- Ollama is not verified as installed.
- Because Ollama is absent, `ollama list`, model pulls, and local model tests
  were not run.

## Confirmed Ollama Install Options

Official Ollama docs as of 2026-05-06 list macOS requirements as macOS Sonoma
14 or newer, with Apple M-series CPU and GPU support:

- Preferred official macOS install: download/mount `ollama.dmg`, drag
  `Ollama.app` to `/Applications`, launch the app, and allow it to create the
  `/usr/local/bin/ollama` CLI link when prompted.
- Official install script: `curl -fsSL https://ollama.com/install.sh | sh`.
  This downloads and installs Ollama and may create/update the CLI link.
- Common developer package-manager option: Homebrew lists `brew install ollama`
  for the Ollama formula. Treat this as a package-manager path, not the primary
  official recommendation.

Ollama stores local models and configuration under `~/.ollama` by default.
Model files can be tens of GB for larger models, so CereBro should keep this
Mac on a deliberately small shortlist until the Drive vault and/or external
storage plan is settled.

Sources:

- https://docs.ollama.com/macos
- https://ollama.com/download
- https://github.com/ollama/ollama
- https://formulae.brew.sh/formula/ollama

## Router Baseline

The repo already has class-based model routing in `app/server/agentRouter.ts`.
Agents request model classes, not hardcoded provider model names.

Current model classes:

- `lightweight_formatter`
- `local_summary`
- `local_code_helper`
- `local_reasoner`
- `strong_reasoning_external`
- `strong_coding_external`
- `long_context_external`
- `embedding`
- `none`

Current storage support:

- `app/server/cerebroDb.ts` defines a `model_registry` table with model class,
  provider, location, estimated RAM/disk, best/avoid notes, privacy/cost notes,
  hardware notes, and tested-on-device status.

Policy baseline:

- Local-first, not local-only.
- Local models handle summaries, formatting, tagging, learning drafts, source
  cards, and light reasoning.
- Free/generous hosted model and tool tiers are useful lanes for everyday work,
  but only when CereBro records provider, current limit, prompt style, privacy
  class, approval need, and observed result quality.
- External model classes handle complex coding, architecture, long context, and
  high-risk validation only after explicit user approval.
- Tony should create model-specific handoff prompts when external escalation is
  justified.
- Oak may request the strongest available class, but private context and sealed
  material still require approval/redaction gates before any external call.
- At least one frontier hosted lane is required for me-level reasoning. Multiple
  weaker/free models do not automatically equal a frontier model; routing must
  be tested and validated.

## Reasoning Gateway Direction

CereBro should route through a small, explicit reasoning layer rather than
hardcoding provider calls into agents.

Candidate gateway paths:

- LiteLLM: broad provider normalization, OpenAI-compatible interface, fallback,
  load balancing, cost tracking, guardrails, and logging. Treat dependency and
  supply-chain risk as part of the decision.
- OpenRouter: fast access to many hosted models and free-tier experiments.
  Treat it as an external broker with privacy and availability tradeoffs.
- Direct provider SDKs: best for high-trust/frontier lanes or places where the
  provider-specific API matters.
- CereBro-native gateway: slower to build but gives maximum control over
  approvals, audit logs, privacy classes, and rate-limit memory.

First implementation should expose one internal interface:

- `routeForTask`: returns proposed model/tool, reason, approval class, expected
  external data, fallback lane, and validation plan.
- `recordModelCall`: records provider, model/tool, task kind, approval id,
  prompt/handoff id, token/input size when available, result status, cost or
  free-tier note, and failure/rate-limit notes.
- `recordModelEval`: records a small scored result against a real CereBro task
  fixture.

## Model/Tool Capability Registry Target

The current `model_registry` table is a good seed but needs to grow beyond
local model metadata.

Target fields:

- Provider and model/tool name.
- Access method: local, direct API, gateway, web handoff, browser-assisted, or
  manual copy/paste.
- Account/API key need.
- Free tier, rate limit, cost, and last verified date.
- Context/input/output limits.
- Modality support: text, code, vision, image generation, video frames, audio,
  files, browser, terminal, spreadsheet, document.
- Strengths and weak spots.
- Best prompt style and known prompt templates.
- Privacy class and data allowed.
- Eval scores and task examples.
- Failure notes, stale-source notes, and fallback suggestions.
- Source URLs for claims about limits, pricing, docs, or recommended prompting.

Registry records are proposals until tested or source-verified. Surfer owns
fresh discovery. Cortana owns routing. Batman owns risk review. Spock/Oak own
validation. Piccolo owns stale registry and cost/rate-limit hygiene.

## Evaluation Baseline

CereBro needs a tiny eval suite before it trusts routing defaults.

Candidate tools:

- promptfoo for prompt/model comparison, red-team checks, and local eval runs.
- DeepEval for agent task completion, tool correctness, plan adherence, answer
  relevance, and hallucination checks.
- Custom Vitest fixtures for deterministic CereBro routing, approval, and
  metadata behavior.

Initial eval tasks should be small and real:

1. Classify a command-intake request and propose the right agent.
2. Summarize a saved source with provenance and a privacy note.
3. Explain a terminal error and propose safe next commands.
4. Review a screenshot or UI state and produce a routed annotation note.
5. Draft a model/tool handoff prompt and name the approval gate.
6. Critique another model's answer for unsupported claims.

No model/tool should become a recommended default until it has at least one
passing eval or a visible "untested" label.

## Lightweight Local Model Shortlist For M2 / 8GB

These are candidates to approve for future download and testing. Disk sizes and
context windows come from Ollama library listings on 2026-05-06. RAM behavior
still must be tested locally.

| Candidate | Size | Context | Proposed class | Best for | Avoid for |
| --- | ---: | ---: | --- | --- | --- |
| `all-minilm:22m` | 46MB | 512 | `embedding` | Cheapest first semantic search smoke test | Long documents, nuanced retrieval |
| `qwen3:0.6b` | 523MB | 40K | `lightweight_formatter` | Classification, title/tag drafts, tiny summaries | Reliable planning, coding, validation |
| `gemma3:1b` | 815MB | 32K | `lightweight_formatter`, `local_summary` | Rewrites, short summaries, learning-card drafts | Hard reasoning, long code work |
| `llama3.2:1b` | 1.3GB | 128K | `local_summary` | Personal-info workflows, retrieval summaries, rewriting | Deep reasoning, correctness gates |
| `qwen3:1.7b` | 1.4GB | 40K | `local_reasoner`, `local_code_helper` trial | Light planning and simple code explanations | Multi-file implementation, critical architecture |
| `llama3.2:3b` | 2.0GB | 128K | stretch `local_reasoner` trial | Better instruction following/tool-style prompts if memory pressure is acceptable | Always-on background use on 8GB RAM |

Recommended first approval batch, when the user is ready:

1. Install Ollama only.
2. Pull `all-minilm:22m` for embeddings.
3. Pull exactly one small chat model first: `gemma3:1b` or `llama3.2:1b`.
4. Test speed, memory pressure, and answer quality before adding `qwen3:1.7b`
   or `llama3.2:3b`.

Do not start with:

- 7B+ chat/coding models.
- 12B/14B/27B/70B models.
- Multiple redundant chat models.
- Local image/video generation stacks.

Sources:

- https://ollama.com/library/all-minilm
- https://ollama.com/library/qwen3
- https://ollama.com/library/gemma3
- https://ollama.com/library/llama3.2

## Proposed Test Procedure After Approval

For each approved model:

1. Confirm `ollama --version`.
2. Confirm `ollama list`.
3. Pull only the approved model.
4. Run a 1-2 sentence health prompt.
5. Run a formatting prompt.
6. Run a short summary prompt.
7. Run one light reasoning prompt.
8. Record rough latency, quality, stability, disk impact, and any obvious
   memory pressure in `model_registry` or the session handoff.

No model should be marked `tested_on_device = 1` until this procedure runs on
this Mac.
