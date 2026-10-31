# ⚔️ Agent Arsenal

A curated repository of autonomous agent workflows, portable skill definitions, MCP tool configurations, proxy engines, and architectural evaluations for AI pair-programming systems (Google Antigravity, Claude Code, and Cursor).

---

## 📂 Repository Structure

```
agent-arsenal/
├── active-stack/           # Active Google Antigravity two-tier configuration & blueprints
│   ├── system/             # Machine-level environment (~/.gemini/): GEMINI.md, MCPs, plugins
│   ├── project/            # Workspace template (<project>/.agents/): rules, skills, GEMINI.md
│   ├── README.md           # Breakdown of active MCPs, loading precedence, and architecture
│   └── rules-and-guardrails.md # The 16-rule universal behavioral standard
├── suites/                 # Specialized domain skill packs (project-scoped)
│   ├── creative-stock/     # Blender, video director, stock asset factory, designcraft, Diffusion Studio (14 skills)
│   └── cloudflare-supabase/# Cloudflare Agents SDK, Workers, Durable Objects, Supabase (13 skills)
├── skills/                 # 50+ portable, flat agent skills (SDD, TDD, Meta-Workflows, Debugging)
├── evaluations/            # Architectural comparisons & tool trade-off reviews
│   ├── firecrawl-vs-agent-reach.md # Web crawlers vs. social session scrapers
│   └── agystack-vs-superpowers.md  # poteto's pstack/agystack vs. Antigravity Superpowers
└── archives/               # Preserved legacy configurations and utilities
    └── opencode/           # OpenCode configs, plugins, SDD commands, and local proxies
        ├── nvidia-proxy/   # Local rate-limiting proxy for NVIDIA AI Foundation API
        ├── agentrouter-proxy/ # Multi-provider routing proxy
        └── README.md       # OpenCode migration notes & manual proxy execution guide
```

---

## ⚡ Active Stack (Antigravity 2.0)

See [`active-stack/README.md`](./active-stack/README.md) for full configuration details.

* **Core Engine:** Google Antigravity CLI / IDE (`agy`).
* **Agentic Framework:** `superpowers` (Brainstorming, Writing Plans, TDD, Systematic Debugging, Worktrees, Verification-before-completion, Antagonistic Code Reviews).
* **Active MCP Tools (11 Servers):** Firecrawl, GitHub, Sentry, Figma, Photoshop, Blender, Context7, Cloudflare Docs, Whop Docs, Supabase, Engram.
* **Separation of Concerns:**
  * **Global Tier (`active-stack/system/`):** Universal discipline, anti-sycophancy, Windows pwsh rules, persistent memory, and machine-wide tools.
  * **Project Tier (`active-stack/project/`):** Ground-truth indices, domain invariants (`.agents/rules/`), and dedicated domain skills (`.agents/skills/`).

---

## 📦 Domain Skill Suites (`suites/`)

Self-contained skill collections designed to be selectively mounted into any project's `.agents/skills/`:

* **`suites/creative-stock/`**: `blender-motion-graphics`, `video-director`, `stock-asset-factory`, `brand-presentation-suite`, `designcraft`, `designcraft-social`, `editor`, `fiverr-order-copilot`, `logo-deconstruct-assembly`, `stock-image-standards`, `stock-vector-standards`, `stock-video-motion-standards`, `stock-video-quality-benchmark`, `watch`.
* **`suites/cloudflare-supabase/`**: `agents-sdk`, `cloudflare`, `cloudflare-email-service`, `cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `sandbox-sdk`, `supabase`, `supabase-postgres-best-practices`, `turnstile-spin`, `web-perf`, `workers-best-practices`, `wrangler`.

---

## 🧰 Portable Skills Library (`skills/`)

The repository includes 50+ modular, flat agent skills:

* **Meta-Workflows & Architecture:** `system-architect`, `task-manager`, `plan-execute-verify`, `agentic-pruning`, `code-reviewer`, `ui-ux-pro-max`, `ui-flow-audit`, `project-templates`.
* **Spec-Driven Development (SDD):** `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`.
* **Rigor & Verification:** `verification-before-completion`, `test-driven-development`, `test-driven-correction`, `systematic-debugging`, `plan-first-reflection`.
* **Code Review & Quality:** `judgment-day` (4-reviewer panel), `requesting-code-review`, `receiving-code-review`, `comment-writer`.
* **Execution & Flow:** `atomic-command-execution`, `caveman`, `ponytail`, `using-git-worktrees`, `dispatching-parallel-agents`, `work-unit-commits`.

---

## 📊 Tool & Architecture Evaluations

In-depth technical evaluations comparing emerging agent tooling with the active stack:

* [**Firecrawl vs. Agent-Reach**](./evaluations/firecrawl-vs-agent-reach.md): Why managed cloud scraping (Firecrawl) beats reverse-engineered browser session scrapers for developer workloads, and when social cookie scrapers make sense.
* [**agystack vs. Superpowers**](./evaluations/agystack-vs-superpowers.md): Comparing Joel Taroreh's poteto-mode Cursor port against Antigravity's native `superpowers` suite on Windows.

---

## 🗄️ Legacy Utilities & Proxies (`archives/opencode/`)

Legacy tooling originally built for OpenCode has been organized under `archives/opencode/`:

* **NVIDIA Proxy:** Manual startup instructions and rate-limiting scripts are preserved in [`archives/opencode/README.md`](./archives/opencode/README.md).
  * *Note: System boot auto-launch is disabled. Run on-demand via `archives/opencode/nvidia-proxy/proxy-start.ps1`.*
* **OpenCode Runtime Files:** `opencode.jsonc`, `dcp.jsonc`, custom plugins (`browser-smoke`, `dcp`), and slash commands.
