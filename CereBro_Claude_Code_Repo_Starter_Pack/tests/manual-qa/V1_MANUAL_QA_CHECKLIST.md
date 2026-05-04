# CereBro V1 — Manual QA Checklist

## Setup

- [ ] App launches locally.
- [ ] First-run onboarding appears on fresh setup.
- [ ] Settings persist after reload.
- [ ] Root folders exist.
- [ ] SQLite database exists.

## Project Spaces

- [ ] Create project.
- [ ] Open project.
- [ ] Edit project summary.
- [ ] Project persists after restart.

## Tasks

- [ ] Create task.
- [ ] Assign mode.
- [ ] Start session.
- [ ] Update status.
- [ ] Complete task.
- [ ] Task timeline records events.

## Agents

- [ ] Agent registry loads.
- [ ] Aang appears as interface.
- [ ] Cortana routing appears.
- [ ] Oak validation status appears.
- [ ] Disabled/sealed state works.

## Skills

- [ ] Skill files load.
- [ ] Active skills appear in task context.
- [ ] Missing skill creates readable error.

## Sources

- [ ] Add manual source.
- [ ] Add URL source.
- [ ] Link source to project.
- [ ] Source appears in Source Library.

## Outputs

- [ ] Create artifact.
- [ ] Save output locally.
- [ ] Open output later.
- [ ] Validation status appears.

## Memory

- [ ] Create memory proposal.
- [ ] Oak reviews proposal.
- [ ] User approves or rejects.
- [ ] Approved proposal writes to correct destination.

## Permissions

- [ ] Safe action runs.
- [ ] Approval action waits.
- [ ] Blocked action blocks.
- [ ] Rejected action does not execute.

## Piccolo

- [ ] Cleanup scan runs.
- [ ] Proposed actions shown.
- [ ] No important files deleted silently.

## Model Router

- [ ] Model registry opens.
- [ ] Local-only mode works.
- [ ] External escalation asks approval.

## Browser

- [ ] Browser tools disabled by default.
- [ ] Public source ingestion works if enabled.
- [ ] Private session asks approval.

## Raven / Declyne

- [ ] Raven Reviews sealed/disabled by default.
- [ ] Declyne is not present in V1 navigation.
