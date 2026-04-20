---
title: Your First Five Minutes
description: Install Skylence, write a minimal workflow, and run it.
sidebar:
  order: 2
---

Let's skip the theory and get you to a win. By the end of this chapter you'll have a workflow that runs, output you can see, and enough context to build from there.

## Prerequisites

Three things need to be true before this works:

1. `sky` is installed and on your `$PATH` — if not, see the [Installation guide](/installation/)
2. The `claude` CLI is installed and authenticated (`claude --version` should return without error)
3. You have a GitHub webhook secret ready, or you're just running manually with `sky run` for now (you can add webhooks later)

## Step 1: Initialize

```bash
sky setup
```

This checks your environment, creates `~/.sky/` if it doesn't exist, initializes the SQLite database, and prints a summary of what it found. If anything is missing it tells you exactly what to fix. Don't skip this step — `sky serve` will start without it, but you'll hit confusing errors later.

Expected output:

```
✓ claude CLI found at /usr/local/bin/claude
✓ Database initialized at ~/.sky/sky.db
✓ Config written to ~/.sky/config.toml
Setup complete.
```

## Step 2: Write a Minimal Workflow

Create a file called `hello-world.sky` anywhere in your project:

```
⊕meta⊕
id: hello-world
name: Hello World
trigger:
  manual: true
⊕meta⊕

※※
A minimal workflow. One node, one prompt, no dependencies.
Just enough to prove the system works end-to-end.
※※

§step§
id: greet
name: Say Hello
§step§

∆prompt∆ greet
You are a helpful assistant. Say hello and describe in one sentence
what Skylence is: a Claude Code harness that executes .sky workflows.
Keep it under 30 words.
∆prompt∆
```

Save it. That's a complete, valid workflow. One node (`greet`), one prompt, triggered manually.

## Step 3: Lint It

```bash
sky lint hello-world.sky
```

Lint validates the file structure before any execution happens. It checks that all node references are defined, all required fields are present, and there are no cycles in the dependency graph.

For this file you should see:

```
hello-world.sky: OK
```

If you see errors, they'll tell you exactly which line and what's wrong. Fix them before proceeding.

## Step 4: Run It

```bash
sky run hello-world
```

Skylence finds `hello-world.sky` in the current directory, resolves the single-node DAG, and invokes `claude` with the `greet` node's prompt. You'll see streaming output as Claude responds:

```
[hello-world] run abc123 started
[greet] running...
[greet] Skylence is a Claude Code harness that executes .sky workflow
        files by calling the Claude CLI, storing results in SQLite.
[greet] done (0.8s, 47 tokens)
[hello-world] run abc123 completed
```

The run is now stored in `~/.sky/sky.db`. You can inspect it:

```bash
sky logs
```

This lists all runs with their status, timing, and token counts.

## What Just Happened

`sky run` bypassed the webhook system entirely and executed the workflow directly. That's intentional — it's how you test workflows during development, without needing a live GitHub event to trigger them.

When you're ready to hook this up to real events, Chapter 7 covers running the daemon as a service and Chapter 3 traces what happens when a webhook arrives and a workflow runs automatically.

For now: you have a working workflow. The next chapter explains the machinery underneath it.
