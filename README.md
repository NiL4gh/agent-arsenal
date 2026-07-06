# opencode-setup

My portable opencode configuration. Clone this on any new Windows machine and run `bootstrap.ps1` to restore the full setup.

## What's Included

- **opencode.jsonc** — sanitized config with all agents, permissions, MCP servers (API keys replaced with placeholders)
- **skills/** — 40+ custom skills (SDD, TDD, debugging, code review, etc.)
- **plugins/** — engram, model-variants, skill-registry
- **tools/** — multi-replace, replace-file-content utilities
- **commands/** — SDD slash commands
- **AGENTS.md** — 14 Claude Code-matching rules
- **tui.json** — TUI plugin config
- **nvidia-proxy/** — rate-limited proxy for NVIDIA API ([standalone repo](https://github.com/NiL4gh/nvidia-rate-limited-proxy))

## Quick Start (New Machine)

```powershell
# 1. Clone this repo
git clone https://github.com/NiL4gh/opencode-setup.git
cd opencode-setup

# 2. Run bootstrap
.\bootstrap.ps1

# 3. Fill in your API keys
notepad opencode.jsonc
# Replace all <YOUR_*> placeholders with actual values

# 4. Install NVIDIA proxy (optional)
cd nvidia-proxy
npm install
.\install.ps1
```

## What bootstrap.ps1 Does

1. Installs Node.js dependencies (if not present)
2. Copies skills, plugins, tools, commands to `~/.config/opencode/`
3. Copies AGENTS.md and tui.json
4. Backs up any existing config before overwriting
5. Copies the sanitized opencode.jsonc (you fill in keys manually)

## API Keys Required

| Service | Where to get it |
|---|---|
| NVIDIA | https://build.nvidia.com/ |
| GitHub PAT | https://github.com/settings/tokens |
| Firecrawl | https://firecrawl.dev/ |
| Sentry | https://sentry.io/ |
| Figma | https://www.figma.com/developers/api#access-tokens |
| OpenAI | https://platform.openai.com/ (for Sentry embedded agent) |

## Security

- All API keys are replaced with `<PLACEHOLDER>` values in the committed config
- `.gitignore` excludes `node_modules/`, `logs/`, and `*.log`
- Never commit your actual `opencode.jsonc` with real keys
