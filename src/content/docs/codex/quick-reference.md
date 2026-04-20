---
title: Quick Reference
description: All CLI commands, config keys, .sky file symbols, and common troubleshooting one-liners in one page.
sidebar:
  order: 10
---

## CLI Commands

### Core

| Command | What it does |
|---------|-------------|
| `sky setup` | Check deps, initialize DB and config, report status |
| `sky serve` | Start the daemon on :3090 |
| `sky run <workflow-id>` | Execute a workflow immediately, bypassing webhook matching |
| `sky lint <file.sky>` | Validate a workflow file (schema, references, cycles) |
| `sky lint --graph <file.sky>` | Print ASCII dependency graph |
| `sky logs` | List recent runs with status, timing, token counts |
| `sky logs --run <run-id>` | Full output for a specific run |
| `sky logs --budget` | Monthly spend summary |

### Update

| Command | What it does |
|---------|-------------|
| `sky update` | Download and install the latest release |
| `sky update --check` | Print latest version, exit 1 if update available |
| `sky update --to vX.Y.Z` | Install a specific version |
| `sky update -y` | Skip confirmation prompt |
| `sky update --no-restart-service` | Update binary without bouncing the service |

### Misc

| Command | What it does |
|---------|-------------|
| `sky version` | Print current version |
| `sky health` | Check daemon status (same as `curl :3090/health`) |

---

## Config Keys

Config lives at `~/.sky/config.toml`.

### `[server]`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `port` | int | `3090` | HTTP/WebSocket listen port |
| `host` | string | `"0.0.0.0"` | Bind address |
| `webhook_secret` | string | - | GitHub webhook HMAC-SHA256 secret |

### `[workflow]`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `dirs` | []string | `["."]` | Directories to scan for `.sky` files |
| `default_model` | string | `"claude-sonnet-4-5"` | Model used when no node-level override |
| `default_budget_tokens` | int | `50000` | Per-node token cap when none declared |

### `[budget]`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `monthly_limit_usd` | float | `0` (disabled) | Hard monthly spend cap |
| `alert_threshold_usd` | float | `0` (disabled) | Log warning at this spend level |

---

## .sky File Symbols

| Symbol | Usage | Description |
|--------|-------|-------------|
| `⊕meta⊕` | Opens/closes meta section | Workflow identity and trigger config |
| `§step§` | Opens/closes step section | Node definition (id, name, needs, budget) |
| `∆prompt∆ <id>` | Opens prompt section | Claude prompt for the named node |
| `∆prompt∆` | Closes prompt section | Marks end of prompt content |
| `※※` | Doc block (paired) | Human-readable comment, ignored by parser |

---

## Health & Status

```bash
# Is the daemon running?
curl http://localhost:3090/health

# What's running right now?
curl http://localhost:3090/api/runs?status=running

# Recent runs (JSON)
curl http://localhost:3090/api/runs?limit=10
```

---

## Common Troubleshooting

```bash
# Daemon won't start - check if already running
sky health   # if this returns 200, daemon is already up

# Find the lock file
ls -la ~/.sky/sky.lock

# Lint errors - validate a specific file
sky lint path/to/workflow.sky

# Check token spend this month
sky logs --budget

# Inspect a failed run
sky logs --run <run-id>

# Watch live daemon output (if running in terminal)
sky serve 2>&1 | tee ~/.sky/daemon.log

# Reset the database (destructive - deletes all run history)
rm ~/.sky/sky.db && sky setup
```

---

## Webhook Payload Reference

Skylence validates and passes through the full GitHub webhook payload. The trigger event type maps directly to the [GitHub webhook event types](https://docs.github.com/en/webhooks/webhook-events-and-payloads).

Common trigger configurations:

```yaml
# Fire on any opened PR
trigger:
  event: pull_request
  action: opened

# Fire on push to main
trigger:
  event: push
  branches: [main]

# Fire on new issue
trigger:
  event: issues
  action: opened

# Manual only (no webhook trigger)
trigger:
  manual: true
```
