# opencode-setup

My portable [opencode](https://github.com/opencode-ai/opencode) configuration. Clone this on any new Windows machine and run `bootstrap.ps1` to restore the full setup.

This repo makes opencode work as close to Claude Code as possible through CONFIG ONLY — no forked code.

---

## Quick Start

```powershell
git clone https://github.com/NiL4gh/opencode-setup.git
cd opencode-setup
.\bootstrap.ps1    # copies everything to ~/.config/opencode/
```

Then edit `~/.config/opencode/opencode.jsonc` — replace all `<YOUR_*>` placeholders with real API keys.

---

## What's Included

```
opencode-setup/
├── opencode.jsonc          # Main config — agents, MCP servers, permissions
├── AGENTS.md               # 14 Claude Code-matching behavioral rules
├── tui.json                # TUI plugin config (statusline)
├── bootstrap.ps1           # One-command setup script
├── .gitignore              # Excludes node_modules, logs, secrets
├── skills/                 # 45 skills (see below)
├── plugins/                # 3 TypeScript plugins
├── tools/                  # 2 custom opencode tools
├── commands/               # 12 SDD slash commands
└── nvidia-proxy/           # Rate-limited proxy for NVIDIA API
```

---

## opencode.jsonc — What's Configured and Why

### Agents

| Agent | Model | Purpose |
|---|---|---|
| `build` | DeepSeek V4 Pro (NVIDIA) | Main coding agent — writes, edits, debugs. Permission set to `allow` (zero prompts). |
| `gentle-orchestrator` | DeepSeek V4 Pro (NVIDIA) | Coordinates SDD phases — delegates to sub-agents, tracks progress. |
| `sdd-apply`, `sdd-design`, `sdd-explore`, `sdd-spec`, `sdd-tasks`, `sdd-verify`, `sdd-verify-risk`, `sdd-verify-readability`, `sdd-verify-reliability`, `sdd-verify-resilience` | DeepSeek V4 Pro (NVIDIA) | SDD sub-agents — each handles one phase of Spec-Driven Development. |
| `brainstorming` | DeepSeek V4 Pro (NVIDIA) | Explores user intent, requirements, and design before implementation. |

### Providers

| Provider | Type | Why |
|---|---|---|
| **NVIDIA** | `openai-compatible` | Free tier via NVIDIA AI Foundation Endpoints. Routes through local rate-limited proxy to avoid 429s. |
| **opencode-go** | `openai-compatible` | Disabled — no subscription available. Reserved for future use. |

### MCP Servers (10)

| Server | Why It Exists |
|---|---|
| **filesystem** | File read/write access for the agent. |
| **github** | GitHub API — issues, PRs, repos, search. Enables the agent to manage code on GitHub. |
| **sentry** | Error tracking — read issues/events from Sentry dashboards. |
| **figma** | Design handoff — read Figma files for UI implementation. |
| **firecrawl** | Web scraping and search — fetch web content, extract data, search the internet. |
| **supabase** | Database, auth, edge functions, storage — full Supabase stack access. |
| **context7** | Library documentation — fetch up-to-date docs for any framework/SDK. |
| **aidesigner** | AI-powered web design generation — create websites and landing pages. |
| **engram** | Persistent memory across sessions — decisions, bugs, discoveries survive compactions. |
| **illustrator** | Adobe Illustrator automation — document creation, text editing, SVG export. |

---

## Skills (45) — Why Each Exists

### SDD Suite (Spec-Driven Development) — 10 skills

The core workflow for complex multi-file changes. Instead of jumping into code, SDD forces you to explore, propose, spec, design, break into tasks, implement, verify, and archive. This prevents the "start coding and hope" trap.

| Skill | Why |
|---|---|
| `sdd-init` | Bootstraps SDD in a new project — creates the directory structure and config. |
| `sdd-explore` | Investigates the codebase before writing anything. Understands context, patterns, dependencies. |
| `sdd-propose` | Writes a change proposal — intent, scope, approach. Gets alignment before implementation. |
| `sdd-spec` | Detailed requirements and acceptance scenarios. What must be true when done. |
| `sdd-design` | Architecture decisions and tradeoffs. Documents WHY, not just WHAT. |
| `sdd-tasks` | Breaks the spec into atomic, independent implementation tasks. |
| `sdd-apply` | Implements each task. Uses sub-agents for parallel execution. |
| `sdd-verify` | Runs all reviewers in parallel — security, readability, reliability, resilience. |
| `sdd-archive` | Syncs delta specs and archives completed artifacts. Keeps the project clean. |
| `sdd-onboard` | Onboards a new team member to the SDD workflow. |

### Code Quality — 5 skills

| Skill | Why |
|---|---|
| `verification-before-completion` | Forces running verification commands before claiming work is done. Prevents "it should work" syndrome. |
| `requesting-code-review` | Structured flow for requesting reviews — prepares context, picks reviewers, formats the ask. |
| `receiving-code-review` | How to process review feedback — categorize, prioritize, respond. |
| `judgment-day` | Runs 4 parallel reviewers (R1-R4) for comprehensive code audit. |
| `receiving-code-review` | Structured approach to processing review feedback without defensiveness. |

### TDD & Testing — 3 skills

| Skill | Why |
|---|---|
| `test-driven-development` | Forces writing tests before code. Prevents confirmation-bias testing after the fact. |
| `test-driven-correction` | When tests fail, this skill systematically diagnoses and fixes — not random changes. |
| `go-testing` | Go-specific testing patterns — table-driven tests, `teatest`, golden files, `t.TempDir()`. |

### Git & PR Workflow — 5 skills

| Skill | Why |
|---|---|
| `using-git-worktrees` | Git worktrees for parallel development without stashing. |
| `work-unit-commits` | Commit after each logical unit of work, not at the end of a 2-hour session. |
| `chained-pr` | Break large changes into a chain of small, reviewable PRs. |
| `branch-pr` | Branch → implement → PR → merge cycle. Standard workflow. |
| `finishing-a-development-branch` | Cleanup when done — merge, delete, update docs. |

### Execution & Planning — 4 skills

| Skill | Why |
|---|---|
| `executing-plans` | Loads a written plan and executes it task by task. For use in separate sessions. |
| `subagent-driven-development` | Executes plans by dispatching fresh subagents per task with two-stage review. |
| `dispatching-parallel-agents` | Spawns independent agents for independent problems. Speeds up debugging. |
| `writing-plans` | Creates structured implementation plans from vague requirements. |

### Architecture & Communication — 3 skills

| Skill | Why |
|---|---|
| `ponytail` | Enforces YAGNI and simplicity. Prevents over-engineering. Ask "do we actually need this?" before writing code. |
| `caveman` | Ultra-terse communication. Cuts filler ("Sure!", "Great!") to save tokens and time. |
| `cognitive-doc-design` | Writes docs that reduce cognitive load — progressive disclosure, chunking, signposting. |

### Web & Browser — 3 skills

| Skill | Why |
|---|---|
| `modern-web-guidance` | React, TypeScript, CSS best practices. Prevents common web dev mistakes. |
| `browser-debugging` | Systematic browser debugging — console errors, network tab, DOM state, CDP. |
| `brainstorming` | Explores user intent before building. Prevents building the wrong thing. |

### Context & Memory — 2 skills

| Skill | Why |
|---|---|
| `context-compaction` | Prevents context window flooding by enforcing log budgeting and output filtering. |
| `plan-first-reflection` | Forces a `<thinking>` block before every action. Covers goals, edge cases, dependencies, rollback. |

### Documentation & Code Comments — 2 skills

| Skill | Why |
|---|---|
| `comment-writer` | Writes warm, direct PR/issue comments. Not corporate bot speak. |
| `cognitive-doc-design` | Designs docs for readability — lead with answer, progressive disclosure, signposting. |

### Meta Skills — 3 skills

| Skill | Why |
|---|---|
| `skill-creator` | Creates new LLM-first skills with valid frontmatter. |
| `skill-improver` | Audits and upgrades existing skills. |
| `skill-registry` | Indexes available skills by trigger and path. Auto-discovers new skills. |

### Orchestration — 3 skills

| Skill | Why |
|---|---|
| `using-superpowers` | Entry point — shows all available skills, requires Skill tool invocation before ANY response. |
| `project-templates` | Scaffolds new projects with opinionated structure. |
| `atomic-command-execution` | One command at a time with verification between steps. Prevents cascading failures. |

### Issue Management — 1 skill

| Skill | Why |
|---|---|
| `issue-creation` | Creates GitHub issues with templates — prevents blank issues, auto-adds `status:needs-review`. |

### Go — 1 skill

| Skill | Why |
|---|---|
| `go-testing` | Go-specific patterns — table-driven tests, `teatest`, golden files, `t.TempDir()`. |

---

## Plugins (3) — What They Do

| Plugin | Why |
|---|---|
| `engram.ts` | Persistent memory — stores decisions, bugs, discoveries across sessions. Survives context compactions. Uses Engram MCP server. |
| `model-variants.ts` | Caches model variant data for the gentle-ai orchestrator — knows which models are available and their capabilities. |
| `skill-registry.ts` | Auto-refreshes the skill registry on startup so newly installed skills are immediately discoverable. |

---

## Tools (2) — What They Add

| Tool | Why |
|---|---|
| `multi_replace_file_content.ts` | Apply multiple non-contiguous edits to a file in one call. Faster than 10 separate edit calls. |
| `replace_file_content.ts` | Targeted line-range replacement — surgical edits without reading the whole file. |

---

## Commands (12 SDD Slash Commands)

Slash commands for the SDD workflow — `/sdd-init`, `/sdd-new`, `/sdd-continue`, `/sdd-status`, `/sdd-verify`, etc. These are the entry points for Spec-Driven Development.

---

## AGENTS.md — 14 Behavioral Rules

The behavioral rules that make opencode behave like Claude Code:

1. **Plan-first reflection** — `<thinking>` block before every action
2. **Verify before stating** — read before claiming, grep before assuming
3. **Production safeguards** — never remove error handling, never change behavior silently
4. **Architect/Editor split** — 3+ file changes trigger Architect phase
5. **Agentic loop** — max 5 tool calls per step, 2 failures = plan B
6. **Windows environment** — PowerShell, backslashes, no bash
7. **Project awareness** — grep before adding, match existing patterns
8. **Git discipline** — semantic commits, revert on break
9. **Command execution** — run safe commands immediately, no permission prompts
10. **Response standards** — no filler, comments explain WHY
11. **Anti-sycophancy** — push back on bad ideas, verify your own work
12. **Zero-blind-changes** — ask if requirements are unclear
13. **Goal-mode safety** — 3 same errors = pause and ask for help
14. **Instant rewind** — checkpoint before risky operations

---

## nvidia-proxy

A standalone rate-limited proxy for the NVIDIA API. Prevents 429 errors when parallel agents fire requests. See [standalone repo](https://github.com/NiL4gh/nvidia-rate-limited-proxy) for details.

---

## API Keys Required

| Service | Where to get it |
|---|---|
| NVIDIA | https://build.nvidia.com/ |
| GitHub PAT | https://github.com/settings/tokens |
| Firecrawl | https://firecrawl.dev/ |
| Sentry | https://sentry.io/ |
| Figma | https://www.figma.com/developers/api#access-tokens |
| OpenAI | https://platform.openai.com/ (for Sentry embedded agent) |

---

## Security

- All API keys are `<PLACEHOLDER>` values in the committed config
- `.gitignore` excludes `node_modules/`, `logs/`, `*.log`
- `bootstrap.ps1` detects real API keys and refuses to overwrite
- Never commit your actual `opencode.jsonc` with real keys
