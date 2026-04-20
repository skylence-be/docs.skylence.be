---
title: Cost Controls & Safety
description: Two layers of protection - lint catches structural problems before execution, runtime controls cap what Claude can spend.
sidebar:
  order: 6
---

Two things can go wrong with AI-driven automation: structural problems (malformed workflows, undefined references, injection risks) and economic problems (a workflow that costs $40 per run because nobody set a budget). Skylence handles both, at different layers.

## Layer 1: Lint (Parse Time)

`sky lint` is the first gate. It runs before any execution and catches problems that would either fail at runtime or - worse - succeed with unintended behavior.

Run it explicitly:

```bash
sky lint my-workflow.sky
```

`sky run` calls lint automatically before executing. You can't bypass it with `sky run`. You can bypass it with direct SQLite manipulation, but don't.

### What lint checks

**Schema validation.** All required fields are present. Field types are correct. No unknown fields that suggest typos.

**Reference integrity.** Every node ID in a `needs:` list exists as a declared `§step§` in the same workflow. Missing references catch copy-paste errors before they cause confusing runtime failures.

**Cycle detection.** Dependency graph has no cycles. (See Chapter 5.)

**Prompt injection risks.** Lint scans prompt content for patterns that suggest template injection - cases where variable-looking syntax in a prompt might expand to something unintended. This is a heuristic check, not a guarantee.

**Budget validation.** `budget_tokens` values are within the allowed range for the configured model.

### A lint error in practice

```bash
$ sky lint deploy.sky
deploy.sky:34: ERROR - node 'run-tests' references undefined node 'setup-env' in needs
deploy.sky:61: WARNING - budget_tokens 200000 exceeds recommended limit for claude-haiku-4-5 (100000)
```

Errors block execution. Warnings allow it but flag for review. Line numbers point directly to the problem - fix them and re-lint.

## Layer 2: Runtime Controls

Once a workflow is running, two controls limit what it can spend.

### Per-node token budget

Set `budget_tokens` on any node:

```
§step§
id: fix-issues
name: Fix Issues
budget_tokens: 50000
§step§
```

When Claude reaches 50,000 tokens on this node, the invocation terminates. The node is marked as failed with reason `budget_exceeded`. The workflow halts.

If no `budget_tokens` is set, the node inherits the global default from config. The global default has its own ceiling.

### Monthly spend cap

In `~/.sky/config.toml`:

```toml
[budget]
monthly_limit_usd = 100.0
alert_threshold_usd = 80.0
```

Skylence tracks cumulative token costs across all runs. When spending hits `alert_threshold_usd`, a warning appears in logs and the WebSocket feed. When it hits `monthly_limit_usd`, new workflow runs are rejected until the month rolls over.

The alert threshold exists so you have warning time before the hard cap. Set it at 80% of your limit and you'll see the alert before you run out of budget mid-workflow.

### Check current spend

```bash
sky logs --budget
```

Prints total spend for the current month, per-workflow breakdown, and remaining budget against the configured limit.

## The Right Habit

Lint locally before you commit a workflow. The lint check in `sky run` is there as a safety net, not a development workflow. Get in the habit of `sky lint my-workflow.sky` as the last step before pushing a workflow file - same as you'd run tests before pushing code.
