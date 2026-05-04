# CereBro V1 — License Review Matrix

## 1. Purpose

This file prevents casual misuse of open-source code.

CereBro can learn from external projects, but direct code copying requires license review.

## 2. Rule

Before copying code from any external repository:

1. Identify license.
2. Confirm compatibility.
3. Record attribution requirements.
4. Record whether code can be modified.
5. Record whether distribution triggers obligations.
6. Ask user if license is restrictive or unclear.

## 3. License Risk Categories

### Low Risk

Usually easier for reuse:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC

Still requires attribution where applicable.

### Medium Risk

Requires care:

- MPL-2.0
- LGPL
- EPL

May have file-level or linking obligations.

### High Risk

Requires extra care:

- GPL
- AGPL

Especially important if CereBro is distributed, hosted, networked, or integrated tightly.

### Unknown Risk

- No license
- Custom license
- Open-core unclear boundary
- Mixed license repository

Treat as inspiration only until reviewed.

## 4. Repository Matrix

| Project | URL | Current CereBro Decision | License Status In This File | Code Copy Allowed Now? | Notes |
|---|---|---|---|---|---|
| Cline | https://github.com/cline/cline | Adapt pattern / maybe use during build | Must verify before copying | No, verify first | Approval gates, checkpoints, tool use patterns are useful. |
| Penpot | https://github.com/penpot/penpot | Pattern / optional external tool | Must verify before copying | No, verify first | Design system and tokens pattern. |
| Immich | https://github.com/immich-app/immich | Park / pattern only | Must verify before copying | No, verify first | Media library architecture only for V1. |
| TriliumNext | https://github.com/TriliumNext/trilium | Pattern only | Must verify before copying | No, verify first | Obsidian remains chosen vault. |
| Karpathy Skills | https://github.com/mbeijen/andrej-karpathy-skills-cursor-vscode | Skill pattern | Must verify before copying | No, verify first | Convert principles into original CereBro skill files. |
| video-use | https://github.com/browser-use/video-use | Gojo/video pattern | Must verify before copying | No, verify first | Transcript/timeline/render/evaluate workflow. |
| Awesome Agent Skills | https://github.com/VoltAgent/awesome-agent-skills | Reference library | Must verify each skill separately | No bulk copying | Skills are not security-audited by default. |
| Hermes Agent | https://github.com/nousresearch/hermes-agent | Architecture reference | Must verify before copying | No, verify first | Memory/scheduling/model switching patterns. |
| Stirling PDF | https://github.com/Stirling-Tools/stirling-pdf | Adapter candidate | Must verify before integrating | No, verify first | Use as service if needed. |
| Skyvern | https://github.com/skyvern-ai/skyvern | Park | Must verify before copying | No, verify first | Heavy browser automation. |
| Crawl4AI | https://github.com/unclecode/crawl4ai | Strong adapter candidate | Must verify before integrating | No, verify first | Source ingestion candidate. |
| AirLLM | https://github.com/lyogavin/airllm | Research only | Must verify before copying | No, verify first | Do not depend on it for V1. |
| Paper Design | https://paper.design/ | Product pattern | Website/product, not code source | No | Design canvas inspiration. |
| MiniMax M2.7 | https://ollama.com/library/minimax-m2.7 | Optional model route | Model terms must be reviewed | No code copy | External/cloud fallback route. |
| Stagehand | https://github.com/browserbase/stagehand | Browser adapter candidate | Must verify before integrating | No, verify first | Browser action abstraction. |
| Lenis | https://github.com/darkroomengineering/lenis | UI polish candidate | Must verify before adding | No, verify first | Optional motion polish. |
| Browser Use | https://github.com/browser-use/browser-use | Browser adapter candidate | Must verify before integrating | No, verify first | Manual/task-scoped browser automation. |
| Polars | https://github.com/pola-rs/polars | Utility candidate | Must verify before adding | No, verify first | Local analytics/logs. |
| Kestra | https://github.com/kestra-io/kestra | Pattern only | Must verify before integrating | No, verify first | Piccolo workflow inspiration. |
| GSAP Skills | https://github.com/greensock/gsap-skills | Gojo skill pattern | Must verify before copying | No, verify first | Motion skill inspiration. |
| Superpowers | https://github.com/obra/superpowers | Core build pattern | Must verify before copying | No, verify first | Spec/TDD/review gate pattern. |
| Claude Code Best Practice | https://github.com/shanraisshan/claude-code-best-practice | Blueprint reference | Must verify before copying | No, verify first | Handoff/workflow inspiration. |
| Get Shit Done | https://github.com/gsd-build/get-shit-done | Core build pattern | Must verify before copying | No, verify first | Context engineering/spec-driven development. |
| Scrapling | https://github.com/D4Vinci/Scrapling | Optional advanced adapter | Must verify before integrating | No, verify first | Legal/scraping caution. |

## 5. Direct Copy Policy

### Allowed Without Further Review

- General concepts
- Workflow ideas
- Original rewritten skill files based on lessons
- Original CereBro architecture inspired by patterns
- High-level module ideas
- Non-identical documentation written specifically for CereBro

### Not Allowed Without Review

- Copying source code
- Copying exact skill files
- Copying repository docs verbatim
- Copying configuration files
- Copying UI assets
- Copying logos/icons
- Copying model weights
- Copying proprietary examples
- Integrating services with unclear license terms

## 6. Attribution Notes

If code or substantial text is reused:

- Add attribution in `THIRD_PARTY_NOTICES.md`
- Include project name
- URL
- License
- What was reused
- Whether modified
- Date reviewed

## 7. Claude Code Instruction

Before adding any external dependency:

```text
Check the license first.
Record it in LICENSE_REVIEW_MATRIX.md.
Explain why the dependency is needed.
Explain why a small internal adapter is not enough.
Wait for approval if license is restrictive, unclear, GPL, AGPL, MPL, open-core, or commercial.
```

## 8. License Review Done Means

License review is complete when:

- Each direct dependency has license recorded
- Each copied code source has attribution
- High-risk licenses are approved manually
- Pattern-only projects are marked as no code copied
- `THIRD_PARTY_NOTICES.md` exists if needed
