---
title: Nodes, DAGs & Dependencies
description: How Skylence resolves execution order, runs nodes in parallel, and passes outputs between steps.
sidebar:
  order: 5
---

The execution model is a directed acyclic graph — DAG. Nodes are vertices. Dependency declarations (`needs:`) are directed edges. Skylence computes the topological sort and executes accordingly. If you've worked with GitHub Actions, this will feel familiar. The semantics are the same; the syntax is different.

## How Dependencies Work

A node with no `needs:` declaration has no dependencies. It can run at the start of the workflow.

A node with `needs: [lint-check]` depends on `lint-check`. It cannot start until `lint-check` has completed successfully.

```
§step§
id: lint-check
name: Lint Check
§step§

§step§
id: type-check
name: Type Check
§step§

§step§
id: fix-issues
name: Fix Issues
needs:
  - lint-check
  - type-check
§step§
```

In this workflow: `lint-check` and `type-check` are both independent. They run concurrently. `fix-issues` waits for both to complete before it starts.

## Parallel Execution

Skylence identifies nodes at the same "tier" — nodes whose entire dependency chain has been resolved — and starts them together. There's no explicit parallelism declaration. If nodes don't depend on each other, they run in parallel automatically.

For a workflow with four independent analysis nodes, all four invoke `claude` at the same time. Total runtime is dominated by the slowest one, not the sum of all four.

Practical implication: don't add `needs:` declarations you don't need. Every unnecessary dependency forces sequential execution. Keep the graph sparse.

## Output Injection

When a node completes, its output is stored and made available to dependent nodes. Before Skylence invokes `claude` for a node that has `needs:`, it prepends the outputs of all dependencies as context.

The injected context looks like this in practice:

```
=== Output from: lint-check ===
1. src/server.go:42 — missing error check on db.Query()
2. src/handler.go:88 — unused variable `tmp`
=== End output: lint-check ===

[your node's prompt follows here]
```

Claude sees both the injected context and the node's own prompt. You don't need to reference the upstream output in your prompt text — just write the prompt as if the context is already there, because it is.

This is how multi-step reasoning works in Skylence. `lint-check` produces a finding list. `fix-issues` receives it and applies fixes. Each node does one focused thing; composition handles the rest.

## What Happens on Failure

If a node exits with a non-zero status (the `claude` CLI failed, the token budget was exceeded, the process was killed), the node is marked as failed and the run halts.

Nodes that depend on the failed node do not run. Nodes that were already running concurrently are allowed to finish, then the workflow stops.

The failure is logged with the full error output. You can inspect it with `sky logs --run <run-id>`.

There is no automatic retry at the node level. If you need retry behavior, structure it at the workflow level: use `sky run` from a script with a retry loop, or trigger from a webhook that fires again.

## Cycle Detection

`sky lint` detects cycles before any execution. A cycle means node A depends on node B which depends on node A — an infinite loop in execution order that can never be resolved.

```bash
sky lint my-workflow.sky
# ERROR: cycle detected: fix-issues → lint-check → fix-issues
```

This is a parse-time error. The workflow will not run until the cycle is broken. Cycles are almost always caused by copy-paste errors in `needs:` declarations — check those first.

## Visualizing the Graph

`sky lint --graph my-workflow.sky` prints an ASCII representation of the dependency graph. Useful for debugging complex workflows with many nodes before you run them.
