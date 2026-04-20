---
title: How Skylence Actually Works
description: Trace a real execution from GitHub webhook to WebSocket output.
sidebar:
  order: 3
---

Let's trace exactly what happens when a pull request opens and a workflow runs. Every step here is real — this is the actual execution path, not an abstraction.

## The Execution Path

### 1. Webhook arrives

GitHub POSTs to `http://your-server:3090/webhooks/github`. The daemon validates the HMAC-SHA256 signature against your configured webhook secret. If it doesn't match, the request is rejected with a 401 and nothing runs.

If the signature is valid, the event is parsed: what type of event is this (`pull_request`, `push`, `issue`), what repository, what branch, what action (`opened`, `synchronize`, `closed`).

### 2. Workflow matching

The daemon scans all `.sky` files it knows about — those in the directories you've configured in `~/.sky/config.toml` under `workflow_dirs`. For each file, it checks the `trigger:` block in the `⊕meta⊕` section against the incoming event.

A workflow matches if the event type, repository, branch pattern, and action all satisfy the trigger conditions. Multiple workflows can match a single event — they run independently.

### 3. DAG resolution

The matching workflow is loaded and the node dependency graph is built. Each `§step§` declares an optional `needs:` field listing other node IDs it depends on. Skylence performs a topological sort to determine execution order.

Independent nodes — those with no `needs:` relationship between them — are placed in the same execution tier and run concurrently. This matters for performance: a workflow with four independent analysis nodes doesn't run them sequentially.

### 4. Node execution

For each node (in topological order, tier by tier), Skylence assembles the invocation:

- The node's `∆prompt∆` content becomes the prompt
- Outputs from `needs:` dependencies are injected as context
- The `claude` CLI is invoked with the assembled prompt and any node-level flags (model, token budget, tools)

Skylence captures stdout and stderr from `claude`. Output streams in real time.

### 5. WebSocket streaming

As each node produces output, it's pushed over a WebSocket connection to any connected clients. The sandbox.skylence.be SPA connects via `?server=http://your-server:3090` and shows live output as it arrives. You don't need to wait for a workflow to complete to see what's happening.

### 6. Storage

Every run gets a record in SQLite: the workflow ID, run ID, start time, end time, status, and the trigger event that caused it. Every node within the run gets its own record: the prompt sent, the full output, token count, timing, and exit status.

This is queryable with `sky logs`. The database lives at `~/.sky/sky.db` and you can query it directly with any SQLite client.

## The Daemon Model

`sky serve` is a single process. It holds an exclusive file lock at `~/.sky/sky.lock` when running. If you try to start a second instance, it detects the lock and exits immediately with a clear error.

This is intentional. The daemon manages a pool of in-flight runs, routes WebSocket connections, and serializes writes to SQLite. Two instances fighting over the same database would produce corrupt run records. The file lock prevents that class of bug entirely.

The lock is advisory on Linux/macOS (fcntl) and mandatory on Windows (LockFileEx). Platform-specific implementation, same behavior.

## What `sky run` Does Differently

`sky run <workflow>` bypasses the webhook listener and the trigger matching entirely. It finds the named workflow file, builds the DAG, and executes it immediately. The rest of the path — node execution, streaming, storage — is identical.

Use `sky run` during development. Use the webhook path in production. The workflow behavior is the same either way.
