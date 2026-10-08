# ⚔️ Agent Arsenal

A curated repository of autonomous agent workflows, portable skill definitions, MCP tool configurations, proxy engines, and architectural evaluations for AI pair-programming systems (Google Antigravity, Claude Code, and Cursor).

---

## 📂 Repository Structure

```
agent-arsenal/
├── active-stack/           # Active Google Antigravity configuration, MCPs & rules
│   ├── README.md           # Breakdown of active MCPs, plugins, and domain engines
│   └── rules-and-guardrails.md # The 18-tier behavioral and safety ruleset
├── evaluations/            # Architectural comparisons & tool trade-off reviews
│   ├── firecrawl-vs-agent-reach.md # Web crawlers vs. social session scrapers
│   └── agystack-vs-superpowers.md  # poteto's pstack/agystack vs. Antigravity Superpowers
├── skills/                 # 45+ portable agent skills (SDD, TDD, Review, Debugging)
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
* **Active MCP Tools:** Firecrawl, GitHub, Sentry, Figma, Cloudflare Documentation, Whop Documentation, Headless Blender.
* **Domain Engines:** Blender Motion Graphics, Stock Asset Factory (Vectors/Images/Videos), Video Director (Remotion), UI/UX Pro Max, Cloudflare & Supabase suites.

---

## 📊 Tool & Architecture Evaluations

In-depth technical evaluations comparing emerging agent tooling with the active stack:

* [**Firecrawl vs. Agent-Reach**](./evaluations/firecrawl-vs-agent-reach.md): Why managed cloud scraping (Firecrawl) beats reverse-engineered browser session scrapers for developer workloads, and when social cookie scrapers make sense.
* [**agystack vs. Superpowers**](./evaluations/agystack-vs-superpowers.md): Comparing Joel Taroreh's poteto-mode Cursor port against Antigravity's native `superpowers` suite on Windows.

---

## 🧰 Portable Skills Library (`skills/`)

The repository includes 45+ modular, platform-agnostic agent skills:

* **Spec-Driven Development (SDD):** `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`.
* **Rigor & Verification:** `verification-before-completion`, `test-driven-development`, `test-driven-correction`, `systematic-debugging`, `plan-first-reflection`.
* **Code Review & Quality:** `judgment-day` (4-reviewer panel), `requesting-code-review`, `receiving-code-review`, `comment-writer`.
* **Execution & Flow:** `atomic-command-execution`, `caveman`, `ponytail`, `using-git-worktrees`, `dispatching-parallel-agents`.

---

## 🗄️ Legacy Utilities & Proxies (`archives/opencode/`)

Legacy tooling originally built for OpenCode has been organized under `archives/opencode/`:

* **NVIDIA Proxy:** Manual startup instructions and rate-limiting scripts are preserved in [`archives/opencode/README.md`](./archives/opencode/README.md).
  * *Note: System boot auto-launch is disabled. Run on-demand via `archives/opencode/nvidia-proxy/proxy-start.ps1`.*
* **OpenCode Runtime Files:** `opencode.jsonc`, `dcp.jsonc`, custom plugins (`browser-smoke`, `dcp`), and slash commands.
