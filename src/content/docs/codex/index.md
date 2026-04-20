---
title: The .sky Codex
description: A complete field guide to Skylence - from zero to production in 10 chapters.
template: splash
sidebar:
  order: 0
hero:
  title: The .sky Codex
  tagline: From zero to production in 10 chapters.
  actions:
    - text: Start reading
      link: /codex/what-is-skylence/
      icon: right-arrow
      variant: primary
---

Ten chapters. No fluff. By the end you'll have a running daemon, a working workflow, and a clear mental model of what happens between a GitHub event and a committed fix.

## How to use this guide

**New to Skylence?** Start at Chapter 1. Read straight through to Chapter 3 before touching any files.

**Want a quick win first?** Jump to [Chapter 2 - Your First Five Minutes](/codex/your-first-five-minutes/). Get something running, then come back.

**Building workflows?** Chapters 4 and 5 are the core loop. Refer to Chapter 6 before you ship anything to production.

**Deploying?** Chapter 7 covers all three platforms. Chapter 8 handles keeping it updated.

---

## Part I - Foundations

| Chapter | What you'll learn |
|---------|-------------------|
| [1. What Is Skylence?](/codex/what-is-skylence/) | The problem it solves and why the design is the way it is |
| [2. Your First Five Minutes](/codex/your-first-five-minutes/) | Install, write a workflow, run it |
| [3. How Skylence Actually Works](/codex/how-it-works/) | Trace a real execution from webhook to WebSocket |

## Part II - The Workflow Format

| Chapter | What you'll learn |
|---------|-------------------|
| [4. The .sky File Format](/codex/sky-format/) | Anatomy of a `.sky` file, all three section types |
| [5. Nodes, DAGs & Dependencies](/codex/nodes-and-dags/) | Execution order, parallel runs, dependency outputs |
| [6. Cost Controls & Safety](/codex/cost-and-safety/) | Lint checks, token budgets, spend caps |

## Part III - Running in Production

| Chapter | What you'll learn |
|---------|-------------------|
| [7. Running as a Service](/codex/running-as-a-service/) | macOS launchd, Linux systemd, Windows Scheduled Task |
| [8. Self-Updating](/codex/self-updating/) | `sky update`, version pinning, service bouncing |

## Part IV - Writing Good Workflows

| Chapter | What you'll learn |
|---------|-------------------|
| [9. Writing Prompts for Claude](/codex/writing-for-claude/) | What Claude sees, before/after examples, scope constraints |
| [10. Quick Reference](/codex/quick-reference/) | Every command, config key, and symbol in one page |
