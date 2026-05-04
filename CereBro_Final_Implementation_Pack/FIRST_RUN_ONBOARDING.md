# CereBro V1 — First-Run Onboarding

## 1. Purpose

The first-run onboarding makes CereBro usable without assuming everything is configured.

The app should not fail because Notion, browser tools, external models, or an SSD are missing.

## 2. First-Run Trigger

Show onboarding when:

- No settings record exists
- No CereBro root path is configured
- No SQLite database exists
- User manually resets onboarding

## 3. Onboarding Steps

### Step 1: Welcome

Message:

```text
Welcome to CereBro.

This setup will configure your local workspace, storage paths, memory settings, and optional integrations.
```

Actions:

- Start setup
- Import existing setup

### Step 2: Choose Storage Root

Default:

```text
~/CereBro
```

Options:

- Use default
- Choose another folder
- Use external SSD

Warnings:

If external SSD chosen:

```text
If this drive disconnects, CereBro will pause file writes and cleanup jobs until it is available again.
```

### Step 3: Configure Obsidian Vault

Options:

- Create new vault inside CereBro
- Use existing Obsidian vault
- Skip for now

Recommended default:

```text
Create new vault inside CereBro.
```

### Step 4: Configure Notion

Options:

- Skip for now
- Configure Notion token
- Configure later

Default:

```text
Skip for now.
```

Message:

```text
Notion is optional. CereBro can save outputs locally first and export to Notion later.
```

### Step 5: Configure Ollama

Checks:

- Is Ollama reachable?
- Are models installed?

Options:

- Detect local models
- Skip model setup
- Open instructions

If no model found:

```text
No local models were detected. CereBro can still build the shell and local system. Model-powered actions will wait until Ollama is configured.
```

### Step 6: External Model Policy

Options:

- Local only
- Ask before external escalation
- Disable all external models for now

Default:

```text
Ask before external escalation.
```

### Step 7: Browser Tools

Options:

- Disabled
- Enable source ingestion only
- Enable browser automation with approval

Default:

```text
Disabled.
```

### Step 8: Approval Strictness

Options:

- Strict
- Balanced
- Fast

Recommended default:

```text
Balanced.
```

Strict:

- Ask before most writes/tools.

Balanced:

- Safe actions run, risky actions ask.

Fast:

- Safe and pre-approved recurring actions run, risky actions still ask.

### Step 9: Raven Reviews

Default:

```text
Sealed and disabled.
```

Message:

```text
Raven Reviews is outside the core CereBro workflow. It will remain sealed unless explicitly enabled later.
```

Options:

- Keep sealed
- Remove from visible settings
- Enable placeholder only

Recommended:

```text
Keep sealed.
```

### Step 10: Create First Project Space

Prompt:

```text
What should your first Project Space be?
```

Default suggestion:

```text
CereBro OS
```

### Step 11: System Health Check

Check:

- Root path exists
- SQLite path writable
- Obsidian path exists or skipped
- Output path exists
- Logs path exists
- Skills path exists
- Design systems path exists
- Ollama status
- Notion status
- Browser tools status
- External model status

### Step 12: Finish

Message:

```text
CereBro is ready.

You can start with Aang, create a task, add a source, or open your first Project Space.
```

## 4. First-Run Data Created

Create:

- settings record
- first project if provided
- default agents
- default modes
- default skill records
- default workflow records disabled/safe
- model registry placeholder
- root folder structure
- Obsidian folders if enabled

## 5. First-Run Must Not

First-run must not:

- Force Notion setup
- Force browser tools
- Force external models
- Force Raven Reviews
- Download huge models
- Delete files
- Move user files
- Write outside selected root without permission

## 6. First-Run Done Means

Done when:

- App has settings
- Root folders exist
- Database initialized
- Default agents exist
- Default skills exist
- First Project Space exists or user skipped
- User reaches Home screen
