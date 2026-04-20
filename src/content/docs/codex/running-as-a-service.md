---
title: Running as a Service
description: Install sky serve as a persistent daemon on macOS, Linux, or Windows.
sidebar:
  order: 7
---

Running `sky serve` in a terminal tab works fine for development. For production you want the daemon to start at login, restart on crash, and stay out of your way. Each platform has a native mechanism for this — Skylence ships install scripts for all three.

## Before You Install

The daemon needs to be running from a release binary, not a dev build. Check:

```bash
sky version
# should show a version like v0.4.2, not "dev"
```

If it shows "dev", install a release binary first. Download from the [GitHub releases page](https://github.com/skylence-be/skylence/releases) or use `sky update` if you have a prior release installed.

Also confirm the daemon starts correctly before installing as a service:

```bash
sky serve
# should print "Skylence daemon started on :3090"
# Ctrl+C to stop
```

## macOS — launchd LaunchAgent

```bash
curl -fsSL https://get.skylence.be/install-service.sh | bash
```

This creates a LaunchAgent plist at `~/Library/LaunchAgents/be.skylence.daemon.plist` and loads it with `launchctl`. The agent starts at login and restarts automatically on crash with a 10-second backoff.

To check status:

```bash
launchctl print gui/$(id -u)/be.skylence.daemon
```

To uninstall:

```bash
launchctl unload ~/Library/LaunchAgents/be.skylence.daemon.plist
rm ~/Library/LaunchAgents/be.skylence.daemon.plist
```

## Linux — systemd User Service

```bash
curl -fsSL https://get.skylence.be/install-service.sh | bash
```

The same script detects Linux and installs a systemd user unit at `~/.config/systemd/user/skylence.service`. It runs as your user (not root), starts on session, and restarts on failure.

```bash
systemctl --user status skylence
systemctl --user restart skylence
journalctl --user -u skylence -f   # live logs
```

User services require `loginctl enable-linger $(whoami)` if you want the service to survive after you log out (e.g., on a headless server). The install script checks for this and prompts if needed.

## Windows — Scheduled Task

```powershell
irm https://get.skylence.be/install-service.ps1 | iex
```

Creates a Scheduled Task that runs `sky serve` at logon under your user account with no window. The task is set to restart on failure up to three times with a 1-minute delay.

```powershell
Get-ScheduledTask -TaskName "Skylence Daemon"
Start-ScheduledTask -TaskName "Skylence Daemon"
Stop-ScheduledTask -TaskName "Skylence Daemon"
```

Event Viewer → Applications and Services Logs → Skylence for crash logs.

## Verifying the Daemon Is Running

Platform-agnostic health check:

```bash
curl http://localhost:3090/health
```

Returns:

```json
{"status": "ok", "version": "v0.4.2", "uptime_seconds": 3847}
```

If the daemon isn't running, `curl` will fail with "connection refused". If it returns anything other than `"status": "ok"`, check the logs for the service.

## The File Lock

The file lock at `~/.sky/sky.lock` prevents two daemon instances from running simultaneously. If you accidentally start `sky serve` in a terminal while the service is also running, the terminal instance exits immediately with:

```
Error: daemon already running (pid 12345)
```

This is correct behavior. You don't need to do anything. Kill the manual instance and the service continues.

After install, `sky update` knows about the registered service and will restart it automatically after updating the binary. Chapter 8 covers the update flow.
