---
title: Self-Updating
description: How sky update works, what it touches, and how it handles service restarts.
sidebar:
  order: 8
---

`sky update` fetches the latest release from GitHub, replaces the binary in place, and - if you have a service installed - bounces it so the new version is live immediately. No manual download, no moving files, no separate restart step.

## Basic Usage

```bash
sky update
```

This checks the GitHub releases API for the latest version. If you're already on it, it exits cleanly:

```
Already on latest version (v0.4.2)
```

If there's a newer release, it downloads the binary for your platform/architecture, verifies the checksum, replaces the binary at the current `sky` location, and then (if a service marker exists at `~/.sky/service.json`) restarts the registered service.

The whole process takes 10–20 seconds on a typical connection.

## Flags

```bash
sky update --check            # print latest version without downloading
sky update --to v0.3.1        # install a specific version (downgrade safe)
sky update -y                 # skip confirmation prompt
sky update --no-restart-service   # update binary but leave service running old version
                                  # (new version takes effect on next service restart)
```

`--check` is useful in scripts and monitoring: it exits 0 if you're current, exits 1 if there's an update available.

## The Service Marker

When you install the daemon via the install scripts (Chapter 7), the install process writes `~/.sky/service.json`:

```json
{
  "platform": "macos",
  "type": "launchd",
  "identifier": "be.skylence.daemon"
}
```

`sky update` reads this file to know how to restart your service. On macOS it runs `launchctl kickstart`; on Linux it runs `systemctl --user restart skylence`; on Windows it uses the Task Scheduler COM API.

If `service.json` doesn't exist (you're running the daemon manually), `sky update` updates the binary but does not attempt a service restart. The new version runs next time you start `sky serve`.

You can delete `service.json` to suppress service restarts temporarily, then recreate it by re-running the install script.

## Dev Builds Can't Self-Update

```bash
$ sky update
Error: self-update is not available in dev builds.
Install a release binary first: https://github.com/skylence-be/skylence/releases
```

Dev builds (built from source with `make build`) have version `dev` baked in. The updater refuses to run on them - there's no meaningful "latest version" to compare against and replacing a dev binary with a release binary could break your development setup.

If you want to test `sky update` behavior, install a release binary alongside your dev build and test with the release one.

## What Gets Replaced

Only the `sky` binary itself. Nothing in `~/.sky/` is touched - config, database, service markers, and run history are all preserved. The update is effectively: download new binary → atomic rename over old binary → restart service.

If the download fails or the checksum doesn't match, the existing binary is left in place unchanged.

## Rollback

```bash
sky update --to v0.3.0
```

`--to` accepts any valid release tag. Use it to roll back if a new version has a regression. The same download-and-replace flow applies - it works the same whether you're going forward or backward.
