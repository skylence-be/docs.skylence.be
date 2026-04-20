---
title: Writing Prompts for Claude
description: How to write tight node prompts that produce consistent results without burning your token budget.
sidebar:
  order: 9
---

Claude sees your `∆prompt∆` content as its entire task context for that node. It doesn't know about the workflow name, the repository, or what the overall goal is — unless you tell it. A prompt that takes 3 minutes and costs $0.08 versus one that takes 45 minutes and costs $1.40 is almost always a prompting problem, not a model problem.

## What Claude Actually Receives

When Skylence invokes `claude` for a node, Claude receives:

1. The outputs from all `needs:` dependencies, prefixed with headers (see Chapter 5)
2. Your `∆prompt∆` content verbatim
3. Any injected context from the trigger event (PR diff, issue body, push commit list)

That's it. Claude doesn't remember previous runs. It doesn't have access to your codebase unless it uses the filesystem tools during this invocation. Every node is a fresh context window with exactly what Skylence gives it.

## The Core Rules

**Be specific about output format.** Claude will produce whatever format is most natural for the content unless you constrain it. If downstream nodes expect a numbered list, say "Output a numbered list." If the output feeds into a commit message, say "Output only the commit message, no preamble."

**Tell Claude which tools to use.** If you want Claude to edit files, say "Use the Edit tool." If you don't want it to make filesystem changes, say "Do not modify any files — only report findings." Claude respects explicit tool constraints.

**Constrain scope explicitly.** The single biggest source of long, expensive node runs is an open-ended prompt. "Review this PR" invites Claude to review everything — style, logic, security, documentation, tests, CI config. That might be what you want. If it's not, say what you do want: "Review only for logic errors and missing error handling. Ignore style issues."

**Set a clear stopping condition.** "If there are no issues, output 'LGTM' and stop" prevents Claude from manufacturing findings to seem useful.

## Before and After

Here's a prompt that produces inconsistent results and often runs long:

```
∆prompt∆ fix-issues
Fix the issues in the PR.
∆prompt∆
```

Claude doesn't know what "the issues" are unless dependency output says so. It doesn't know what "fix" means (apply changes? create a new branch? open a sub-PR?). It doesn't know when to stop.

Here's a better version:

```
∆prompt∆ fix-issues
The previous step identified issues in this PR. For each issue listed above:

1. Use the Edit tool to apply the fix to the affected file
2. Keep changes minimal — only fix what was identified, nothing else
3. After all fixes are applied, use the Bash tool to run: git add -A && git commit -m "fix: address PR review findings"

If the previous step found no issues (output was "LGTM"), output "No fixes needed." and stop without making any changes.
∆prompt∆
```

Same task. The second version gives Claude a checklist, an explicit tool to use, a scope constraint ("only fix what was identified"), a defined success path, and a defined no-op path. It will run in roughly the same time every time.

## The AI-First Design Note

The `.sky` format was designed so Claude can write workflow files efficiently, not just execute them. When you ask Claude to build a workflow for you, it produces syntactically valid `.sky` files because the format's delimiters are unambiguous and the structure is consistent.

This creates a useful loop: use Claude to write workflows that Claude will later execute. The prompts in those workflows can be quite precise because you're using a language model to write prompts for a language model — it understands what works and what doesn't.

## Token Budget Strategy

As a rough guide:

| Node type | Suggested `budget_tokens` |
|-----------|--------------------------|
| Read-only analysis (lint, review) | 10,000–30,000 |
| Small targeted edits (1–3 files) | 30,000–80,000 |
| Multi-file refactors | 80,000–150,000 |
| Open-ended exploration | Set a hard cap and accept truncation |

Start conservative and increase based on actual runs. `sky logs` shows per-node token counts — use that data to tune your budgets rather than guessing.
