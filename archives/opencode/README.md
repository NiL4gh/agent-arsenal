# Archived OpenCode Setup

This directory contains the legacy configuration, proxies, plugins, and custom tools originally built for [OpenCode](https://github.com/opencode-ai/opencode).

---

## Contents

* **`nvidia-proxy/`**: Local rate-limiting reverse proxy for NVIDIA AI Foundation API (DeepSeek V4 Pro, etc.).
* **`agentrouter-proxy/`**: Reverse proxy for routing requests across multiple providers.
* **`plugins/`**: OpenCode TypeScript plugins (`browser-smoke`, `dcp`, `opencode-statusline`).
* **`tools/`**: Custom OpenCode tool implementations.
* **`commands/`**: Spec-Driven Development (SDD) slash commands.
* **`opencode.jsonc` & `dcp.jsonc`**: Agent configurations, model provider profiles, and MCP configurations.
* **`AGENTS.md` & `global_rules.md`**: Behavioral constraints, permissions, and execution rules.
* **`bootstrap.ps1`**: Installer that deployed these files to `~/.config/opencode/`.

---

## Manual Execution: NVIDIA Proxy

The automatic startup shortcut has been permanently removed from Windows Startup (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\NvidiaProxy.lnk`). The proxy will **never** start on boot.

If you ever need to start the proxy manually:

### Start
```powershell
powershell -ExecutionPolicy Bypass -File "D:\Projects\agent-arsenal\archives\opencode\nvidia-proxy\proxy-start.ps1"
```
Or run directly in console:
```cmd
cd D:\Projects\agent-arsenal\archives\opencode\nvidia-proxy
node server.js
```

### Check Status
```powershell
powershell -ExecutionPolicy Bypass -File "D:\Projects\agent-arsenal\archives\opencode\nvidia-proxy\proxy-status.ps1"
```

### Stop
```powershell
powershell -ExecutionPolicy Bypass -File "D:\Projects\agent-arsenal\archives\opencode\nvidia-proxy\proxy-stop.ps1"
```
Default port: `http://127.0.0.1:1340`
