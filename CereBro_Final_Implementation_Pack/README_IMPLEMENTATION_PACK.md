# CereBro V1 — Final Implementation Pack

This folder sits beside:

- `CereBro_V1_Revised_Architecture_Blueprint_FULL.md`
- `CereBro_V1_Full_Companion_Build_Docs.md`

Those two files define the architecture and companion build docs.

This implementation pack locks the missing build details that were still underdefined:

1. `TECH_STACK_DECISION.md`
2. `SETUP_AND_INSTALL.md`
3. `MODEL_ROUTING_AND_HARDWARE_PLAN.md`
4. `STORAGE_BACKUP_AND_FILE_LIFECYCLE.md`
5. `NOTION_INTEGRATION_SPEC.md`
6. `OBSIDIAN_INTEGRATION_SPEC.md`
7. `MCP_AND_TOOL_REGISTRY_SPEC.md`
8. `TESTING_STRATEGY.md`
9. `FIRST_RUN_ONBOARDING.md`
10. `CONTENT_ENGINE_SPEC.md`
11. `AANG_LEARNING_MODE_SPEC.md`
12. `BROWSER_ADAPTER_IMPLEMENTATION_SPEC.md`
13. `UI_COMPONENT_SPEC.md`
14. `V1_ACCEPTANCE_CRITERIA.md`
15. `LICENSE_REVIEW_MATRIX.md`

## Build Rule

Claude Code / Opus must read this pack after the two main blueprint files and before writing code.

## Non-Abbreviation Rule

Do not replace detailed implementation requirements with:

- “etc.”
- “and so on”
- “similar”
- “as needed”
- “future work”

When something is not decided, mark it as:

```text
OPEN QUESTION:
```

When something is parked, mark it as:

```text
PARKED:
```

When something is required for V1, mark it as:

```text
V1 REQUIRED:
```

## Source of Truth Hierarchy

1. `CereBro_V1_Revised_Architecture_Blueprint_FULL.md`
2. `CereBro_V1_Full_Companion_Build_Docs.md`
3. This implementation pack
4. Newer user-approved decision logs
5. Code comments and inline implementation notes

If this implementation pack conflicts with the master blueprint, stop and ask the user before changing architecture.
