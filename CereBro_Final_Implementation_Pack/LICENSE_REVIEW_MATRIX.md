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
| Stirling PDF | https://github.com/Stirling-Tools/stirling-pdf | Adapter candidate | Must verify before integrating | No, verify first | Use as service if needed. |
| Skyvern | https://github.com/skyvern-ai/skyvern | Park | Must verify before copying | No, verify first | Heavy browser automation. |
| Crawl4AI | https://github.com/unclecode/crawl4ai | Strong adapter candidate | Must verify before integrating | No, verify first | Source ingestion candidate. |
| AirLLM | https://github.com/lyogavin/airllm | Research only | Must verify before copying | No, verify first | Do not depend on it for V1. |
| Impeccable | https://github.com/pbakaus/impeccable | Strong design workflow reference | Apache-2.0 verified 2026-05-08 | Yes, with attribution and Apache-2.0 obligations | Prefer original CereBro rules over direct copy. Useful for design commands, anti-pattern checks, and DESIGN.md workflow. |
| Awesome DESIGN.md | https://github.com/VoltAgent/awesome-design-md | Design.md structure reference | MIT verified 2026-05-08 | Yes, with attribution | Do not clone trademarked brand identities. Use as structure and inspiration. |
| Huashu Design | https://github.com/alchaincyf/huashu-design | Workflow reference only | Personal use license verified 2026-05-08 | No | Team, product, client, or commercial integration requires written authorization. Learn from asset protocol and critique workflow only. |
| UI UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | Design-system workflow reference | MIT verified 2026-05-08 | Yes, with attribution | Useful for master plus page override design-system pattern. |
| React Bits | https://github.com/DavidHDev/react-bits | Motion/component reference | MIT + Commons Clause verified 2026-05-08 | No direct dependency until reviewed | Use as inspiration for motion craft. Do not wholesale copy or depend without deeper review. |
| Uncodixfy | https://github.com/cyxzdev/Uncodixfy | Anti-generic UI rule reference | MIT verified 2026-05-08 | Yes, with attribution | Fold concept into Gojo and anti-slop review using CereBro-native wording. |
| Google Stitch | https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/ | High-fidelity UI exploration service | Product/service terms must be reviewed before exporting or reusing generated assets/code | No direct integration | Use as visual exploration only. Rebuild accepted ideas in CereBro with local tokens and screenshot proof. |
| v0.app | https://vercel.com/docs/v0 | React/Tailwind component draft service | Product/service terms must be reviewed before exporting or reusing generated code | No direct integration | Use as disposable scaffolding for panels/forms/tables only. Review, simplify, and rewrite before committing. |
| Ruflo | https://github.com/ruvnet/ruflo | Agent orchestration architecture reference | MIT verified 2026-05-08 | Yes, with attribution | Study topology, hooks, memory, verification. Do not replace CereBro's Aang-first agent model. |
| Docling | https://github.com/docling-project/docling | Document conversion and source-intake candidate | MIT verified 2026-05-08 | Yes, with attribution | Strong candidate for local document processing, OCR, structured exports, Source Library, and RAG intake. Record parser receipts and validation status. |
| Emil Kowalski Skill | https://github.com/emilkowalski/skill | UI taste/reference skill | GitHub API no license detected 2026-05-08 | No | Use concepts only until license is confirmed. Useful for Gojo spacing, hierarchy, and interaction taste. |
| Anthropic Frontend Design Skill | https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md | Frontend design skill reference | GitHub API no license detected 2026-05-08 | No | Use as anti-generic UI reference only. CereBro `DESIGN.md` remains authority. |
| Forrest Chang Karpathy Skills | https://github.com/forrestchang/andrej-karpathy-skills | Coding-agent discipline reference | GitHub API no license detected 2026-05-08 | No | Convert lessons into original Tony/Spock/Oak rules. |
| Addy Osmani Agent Skills | https://github.com/addyosmani/agent-skills | Production engineering skill reference | MIT verified 2026-05-08 | Yes, with attribution | Strong reference for Tony/Oak/Spock skill hardening. |
| AIDLC Workflows | https://github.com/awslabs/aidlc-workflows | AI development lifecycle workflow reference | MIT-0 verified 2026-05-08 | Yes, with attribution | Fold lifecycle gates into planning, implementation, validation, and closeout. |
| Archon | https://github.com/coleam00/Archon | Deterministic AI coding harness reference | MIT verified 2026-05-08 | Yes, with attribution | Study specs, repeatability, task plans, and validation. Do not replace CereBro runtime. |
| Hermes Agent | https://github.com/NousResearch/hermes-agent | Evolving-agent architecture reference | MIT verified 2026-05-08 | Yes, with attribution | Study memory, schedules, model/tool switching, and agent growth. |
| Multica | https://github.com/multica-ai/multica | Managed-agent platform reference | GitHub API NOASSERTION 2026-05-08 | No | Study task board, daemon/runtime, agent assignment, and skill compounding. No install. |
| GenericAgent | https://github.com/lsdefine/GenericAgent | Self-evolving agent reference | MIT verified 2026-05-08 | Yes, with attribution | High-risk full-system-control ideas. Study only behind Spock permission gates. |
| LobeHub | https://github.com/lobehub/lobehub | Agent workspace and multimodal product reference | GitHub API NOASSERTION 2026-05-08 | No | Study MCP marketplace, knowledge base, multi-model, plugin, voice, and image UX. |
| local-deep-research | https://github.com/LearningCircuit/local-deep-research | Local research adapter candidate | MIT verified 2026-05-08 | Yes, with attribution | Strong candidate after Docling/source schema. Review dependencies, network behavior, and storage first. |
| ppt-master | https://github.com/hugohe3/ppt-master | Editable PPTX generation candidate | MIT verified 2026-05-08 | Yes, with attribution | Compare against current presentation plugin before adding. |
| Pixelle-Video | https://github.com/AIDC-AI/Pixelle-Video | Automated video pipeline reference | Apache-2.0 verified 2026-05-08 | Yes, with attribution | Park as heavy future media adapter. Review model/storage costs first. |
| VoxCPM | https://github.com/OpenBMB/VoxCPM | TTS and voice-design candidate | Apache-2.0 verified 2026-05-08 | Yes, with attribution | Voice cloning requires consent, source ownership, and explicit approval. |
| Maigret | https://github.com/soxoj/maigret | OSINT username search candidate | MIT verified 2026-05-08 | Yes, with attribution, restricted use | Self-audit or approved public-source research only. No default people-search automation. |
| CloakBrowser | https://github.com/CloakHQ/CloakBrowser | Stealth browser reference | MIT verified 2026-05-08 | No direct integration | Study isolation ideas only. Do not use stealth, bot bypass, or terms bypass. |
| Awesome Codex Skills | https://github.com/ComposioHQ/awesome-codex-skills | Codex skill discovery index | GitHub API no license detected 2026-05-08 | No bulk copying | Verify every linked skill separately. |
| Agent Reach | https://github.com/Panniantong/Agent-Reach | Required source-access scaffold reference for Surfer, Raven, and future agent source lanes | MIT verified 2026-05-09, HEAD `17624268a059ccfb23eba8a2ba50f9f92c8dc0ca` | Yes, with attribution, but install/config remains approval-gated | Strong channel registry and doctor-check pattern. High-risk install surface: pipx/pip, upstream tools, optional Playwright/browser-cookie3, cookies, proxies, downloads, and MCP servers. Do not install or configure until Spock receipt and user approval. |
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
