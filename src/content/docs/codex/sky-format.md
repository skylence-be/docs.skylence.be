---
title: The .sky File Format
description: Anatomy of a .sky file - the three section types, delimiters, and a complete working example.
sidebar:
  order: 4
---

A `.sky` file has exactly three section types, each delimited by a pair of Unicode markers. The markers were chosen to be visually distinctive and unambiguous - no collisions with code, no ambiguity about where a section starts or ends.

## Section Types

### `⊕meta⊕` - Workflow Metadata

The meta section appears once, at the top. It contains the workflow's identity and trigger conditions in a YAML-like format:

```
⊕meta⊕
id: fix-pr-issues
name: Fix PR Issues
trigger:
  event: pull_request
  action: opened
  repos:
    - skylence-be/skylence
  branches:
    - main
    - "feature/*"
⊕meta⊕
```

Required fields: `id`, `name`, `trigger`. The `id` must be unique across all loaded workflows. It's what you pass to `sky run`.

The `trigger` block supports:
- `manual: true` - only runs via `sky run`, never from webhooks
- `event:` - the GitHub event type (`pull_request`, `push`, `issues`)
- `action:` - the event action (`opened`, `synchronize`, `closed`, `created`)
- `repos:` - list of `owner/repo` patterns to match
- `branches:` - list of branch names or glob patterns

### `§step§` - Node Definitions

Each node in the workflow gets a `§step§` section. This is where you declare the node's identity, dependencies, and execution parameters:

```
§step§
id: lint-check
name: Run Lint Check
§step§

§step§
id: fix-issues
name: Fix Lint Issues
needs:
  - lint-check
model: claude-opus-4-5
budget_tokens: 50000
§step§
```

Required fields: `id`, `name`. Optional: `needs`, `model`, `budget_tokens`.

The `needs:` field takes a list of node IDs. Skylence enforces that all listed IDs exist in the same workflow - `sky lint` will catch undefined references before any execution happens.

### `∆prompt∆` - Claude Prompt Content

Each node gets a `∆prompt∆` section containing the prompt Claude will receive for that node. The section is tagged with the node ID it belongs to:

```
∆prompt∆ lint-check
Review the following diff for lint issues. List each issue with:
- File path and line number
- Issue description
- Suggested fix

Output as a structured list. Be specific. If there are no issues, say "No issues found."
∆prompt∆
```

The content between the markers is passed verbatim to `claude`. Dependency outputs are prepended as context automatically - you don't need to reference them in the prompt. (Chapter 5 covers how dependency injection works.)

## Doc Blocks

`※※` blocks appear between sections. They're for human readers only - completely ignored during parsing and execution.

```
※※
This workflow runs on every opened PR. lint-check runs first
(no dependencies), then fix-issues runs after, with lint output
as context. Expected runtime: 2-4 minutes.
※※
```

Use them. A workflow you wrote six months ago is hard to read without them.

## A Complete Working Example

```
⊕meta⊕
id: pr-lint-fix
name: PR Lint and Fix
trigger:
  event: pull_request
  action: opened
  repos:
    - my-org/my-repo
⊕meta⊕

※※
Two-node workflow. lint-check runs first, fix-issues runs after
with lint output injected as context. Targets main branch PRs only.
※※

§step§
id: lint-check
name: Check for Issues
§step§

§step§
id: fix-issues
name: Fix Found Issues
needs:
  - lint-check
budget_tokens: 80000
§step§

∆prompt∆ lint-check
You are a code reviewer. Analyze the PR diff and identify any:
- Obvious bugs or logic errors
- Missing error handling
- Inconsistent naming

Output a numbered list. If nothing is found, say "LGTM".
∆prompt∆

∆prompt∆ fix-issues
Based on the issues found in the previous step, apply fixes to the
affected files. Use the Edit tool to make changes. Commit with message
"fix: address PR review issues".

If the previous step said "LGTM", output "No fixes needed." and stop.
∆prompt∆
```

Validate before running:

```bash
sky lint pr-lint-fix.sky
```

Then test manually:

```bash
sky run pr-lint-fix
```

The format reference at [/workflow-format/](/workflow-format/) covers every field in full detail. This chapter covers the structure - that one covers the schema.
