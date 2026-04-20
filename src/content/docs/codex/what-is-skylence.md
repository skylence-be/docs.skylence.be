---
title: What Is Skylence?
description: The problem Skylence solves and why the design is the way it is.
sidebar:
  order: 1
---

AI coding assistants are capable but inconsistent. Give Claude the same task twice and you'll get two different approaches, two different file structures, two different scopes of change. That's not a bug in Claude - it's an inherent property of a language model responding to a prompt. The problem is that nobody agreed on what the task was.

Skylence is the agreement layer.

## The Core Separation

A `.sky` workflow file separates two things that most teams accidentally conflate:

- **What happens** - the structure of the work: which steps run, in what order, what each step is trying to produce
- **How the AI thinks** - the content of each step: the reasoning, the code, the decisions

You define the structure. Claude handles the thinking. Skylence executes the plan.

This means your automation is deterministic at the workflow level even though it's probabilistic at the node level. Every time a pull request is opened, the same sequence of nodes runs. `lint-check` always runs before `fix-attempt`. `write-tests` always runs after `fix-attempt`. The DAG is fixed. What Claude writes inside each node varies - but what it's trying to write, and with what context, does not.

## What the Daemon Does

`sky serve` is a long-running process that:

1. Listens for incoming GitHub webhooks on port 3090
2. Matches each event to any `.sky` files whose trigger conditions apply
3. Loads the workflow, resolves the node dependency graph
4. Executes each node in topological order, calling the `claude` CLI for each
5. Streams output over WebSocket so you can watch runs in real time at sandbox.skylence.be
6. Stores every run, every node output, every token count in a local SQLite database

There's no cloud backend, no API key registered somewhere, no account to manage. The binary runs on your machine and calls `claude` exactly the same way you would from the terminal.

## Why Not Just Use Claude Directly?

You could. For one-off tasks, you should. But automation has different requirements than interactive use:

- **Repeatability.** You want the same workflow to run on every PR, not just when someone remembers to run it.
- **Observability.** You want to know what ran, what it produced, how many tokens it cost, whether it succeeded.
- **Composability.** You want the output of one Claude call to feed into the next, with dependencies enforced.
- **Auditability.** You want a log you can refer to when a change breaks something.

None of that is hard to build. Skylence just means you don't have to build it.

## The AI-First Design

The `.sky` format is designed so Claude can write workflows efficiently. The section delimiters (`⊕meta⊕`, `§step§`, `∆prompt∆`) are unambiguous markers that a language model can parse and generate without any ambiguity about what belongs where. Doc blocks (`※※`) let humans leave notes that don't affect execution.

The workflow format isn't ergonomic for humans the way YAML is. It's ergonomic for the tool that writes most of the workflows. When you ask Claude to write you a workflow, it produces syntactically valid `.sky` files on the first attempt because the format was designed with that use case as a constraint.

That said: you can write `.sky` files by hand. Chapter 4 covers the format in full. Chapter 9 covers what to write in your prompts once you understand the structure.
