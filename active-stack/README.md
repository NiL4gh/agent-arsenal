# Active Stack: Antigravity Agent Configuration

A comprehensive reference to the tools, plugins, skills, and model setups actively powering Google Antigravity (AGY 2.0).

---

## 1. Two-Tier Architecture Overview

Antigravity operates on a strict **Two-Tier Separation** between universal machine discipline and repository-specific context:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: GLOBAL ENVIRONMENT                      │
│                           (~/.gemini/)                                 │
│  - Universal behavioral guardrails (GEMINI.md: 12 rules + Engram)      │
│  - Automated verification gates (hooks.json: post-edit & stop hooks)   │
│  - Headless batch execution (scripts/headless-runner.ps1)              │
│  - Global engineering plugins (superpowers, devtools, android, swarm)  │
│  - System-wide MCP integrations (13 servers: GitHub, Playwright, etc.) │
│  - Core meta-workflow skills (pruning, architect, task-manager, etc.)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ overrides / supplements
┌───────────────────────────────────▼────────────────────────────────────┐
│                       TIER 2: PROJECT WORKSPACE                        │
│                   (<project_root> / .agents/)                          │
│  - Project ground truth & doc index (GEMINI.md / AGENTS.md)            │
│  - Project-scoped domain rules (.agents/rules/*.md: always_on)         │
│  - Dedicated domain skills (.agents/skills/<name>/SKILL.md)            │
└────────────────────────────────────────────────────────────────────────┘
```

### Loading Priority (Highest to Lowest):
1. **Workspace Project (`.agents/`, `<project>/GEMINI.md`)**: Walks up from current working directory to git root.
2. **Global Discovery (`~/.gemini/config/skills/`, `~/.gemini/config/plugins/`)**: Machine-level skills and plugins.
3. **Global Behavioral Rules (`~/.gemini/GEMINI.md`)**: Foundation behavioral guardrails.

---

## 2. Global Machine Setup (`active-stack/system/`)

* **Rules:** [`active-stack/system/GEMINI.md`](./system/GEMINI.md) — 12 global rules (Auto-Routing across Hydrogen/`flash`/headless OpenCode, Verify before stating, Production safeguards, Caveman output, anti-sycophancy, Windows pwsh, Engram protocol).
* **Plugins & Sidecars:** [`active-stack/system/config.example.json`](./system/config.example.json) — `superpowers`, `chrome-devtools-plugin`, `modern-web-guidance-plugin`, `android-cli-plugin` (compose-preview, device-hub), `swarm` (swarm_board).
* **Automated Hooks & Scripts:** [`active-stack/system/hooks.example.json`](./system/hooks.example.json) & [`active-stack/system/scripts/`](./system/scripts/) — `post-tool-hook.ps1` (instant syntax compilation), `stop-verify-hook.ps1` (project-level verification gate on stop), and `headless-runner.ps1` (autonomous batch pipelines).
* **MCP Servers:** [`active-stack/system/mcp-config.example.json`](./system/mcp-config.example.json) — Configured with environment variable placeholders (13 servers).

### Active MCP Integrations (13 Servers)

| Server | Type | Purpose | Primary Tools |
|---|---|---|---|
| **Firecrawl** | Managed / Local | Clean web scraping, deep crawling, markdown extraction. | `firecrawl_scrape`, `firecrawl_crawl`, `firecrawl_search` |
| **GitHub** | Tool Integration | Repository management, PR reviews, issues, code search. | `create_pull_request`, `search_code`, `list_commits` |
| **Sentry** | Diagnostics | Error diagnostics, stack trace, and event inspection. | `search_events`, `search_issues`, `analyze_issue_with_seer` |
| **Figma** | Design Inspection | Design file extraction and inspection for frontend work. | `get_figma_data`, `download_figma_images` |
| **Photoshop** | Headless Automation | Layer manipulation, text styles, rendering, and compositing. | `photoshop_create_layer`, `photoshop_export_as`, `photoshop_execute_script` |
| **Blender** | 3D Engine | Headless 3D viewport control, Cycles/EEVEE rendering, procedural scenes. | `execute_blender_code`, `render_viewport_to_path` |
| **Context7** | Docs Resolver | Live package and library documentation resolution. | `resolve-library-id`, `query-docs` |
| **Cloudflare Docs** | Docs Server | Documentation for Workers, Pages, and Storage. | `search_cloudflare_documentation`, `migrate_pages_to_workers_guide` |
| **Whop Docs** | Docs Server | SDK and API documentation for Whop integrations. | `search_whop_docs`, `query_docs_filesystem_whop_docs` |
| **Supabase** | Remote Database | Schema inspection, migration, and direct MCP DB querying. | Supabase MCP endpoint |
| **Playwright** | Browser Automation | Full browser control via Chrome DevTools Protocol (`localhost:9222`). | `browser_navigate`, `browser_click`, `browser_snapshot` |
| **Fiverr** | Platform Tool | Freelance platform automation and order management. | Fiverr MCP endpoint |
| **Engram** | Persistent Memory | Cross-session memory, architectural decisions, and bug history. | `mem_save`, `mem_context`, `mem_search`, `mem_session_summary` |

---

## 3. Project Workspace Blueprint (`active-stack/project/`)

To initialize a project with scoped intelligence:

1. Copy [`active-stack/project/GEMINI.project.template.md`](./project/GEMINI.project.template.md) to `<project_root>/GEMINI.md`.
2. Copy [`active-stack/project/verify.ps1.template`](./project/verify.ps1.template) to `<project_root>/verify.ps1` to enforce automated Stop Hook verification.
3. Place invariant domain rules in `.agents/rules/*.md`.
4. Drop relevant domain skills from [`suites/`](../suites/) into `.agents/skills/<skill-name>/`.

---

## 4. Skills Library vs. Domain Suites

* **Global Meta-Workflow Skills ([`skills/`](../skills/)):** Universal engineering procedures (TDD, Systematic Debugging, Plan-Execute-Verify, UI Flow Audit, UI/UX Pro Max, Agentic Pruning, Code Reviewer).
* **Domain Suites ([`suites/`](../suites/)):**
  * **`suites/creative-stock/`**: Blender motion graphics, video director, stock asset factory, DesignCraft branding engine, Diffusion Studio editor/watch, and export standards (14 skills).
  * **`suites/cloudflare-supabase/`**: Cloudflare Agents SDK, Workers best practices, Durable Objects, and Supabase Postgres suites.
