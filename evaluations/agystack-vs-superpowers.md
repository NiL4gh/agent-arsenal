# Evaluation: agystack vs. superpowers

Comparison between Joel Taroreh's `agystack` (built on poteto's Cursor `pstack`) and the `superpowers` agentic framework currently driving Antigravity.

---

## Executive Summary

| Dimension | `superpowers` (Current Setup) | `agystack` |
|---|---|---|
| **Core Heritage** | Native Antigravity / Claude Code agentic engineering loop. | Port of Lauren Tan (poteto)'s Cursor `pstack` to Antigravity. |
| **Workflow Model** | Phase-based: Brainstorming -> Planning -> TDD -> Verification -> Code Review. | Playbook-based: 23 individual task playbooks routed by coordinator. |
| **Tooling Dependencies** | Zero external runtimes required (native to Antigravity/Node/pwsh). | Hard-requires **Bun (v1.0+)**, **gh CLI**, and **Graphite CLI (`gt`)**. |
| **Windows Compatibility** | **Native** (PowerShell pwsh, Windows paths). | **High friction** (Bun + Graphite stack workflows expect POSIX/macOS conventions). |
| **Distributed / Cloud** | Local subagent dispatch (`invoke_subagent`). | Cloud swarms via headless Google Cloud Run (`/swarm`) + GCS buckets. |
| **PR Management** | Git worktrees (`using-git-worktrees`), atomic commits, branch integration. | Graphite stacked diff automation (`gt`), automated PR babysitting (`watch-pr`). |

---

## Direct Feature Mapping

| `agystack` Feature | Existing Equivalent in Active Setup | Notes |
|---|---|---|
| `/loop` (Hillclimb test loop) | `test-driven-development` + `plan-execute-verify` | Both enforce write-test -> run-command -> iterate -> verify cycle. |
| `/interrogate`, `/arena` | `code-reviewer` + `judgment-day` + `receiving-code-review` | Active setup runs antagonistic multi-tier review before completion. |
| `/deslop` | Global Rule #12 (Caveman) + Rule #3 (Safeguards) + Rule #16 (Reuse-First) | Global rules strictly prevent AI comments, apologetic text, and bloat. |
| Subagent delegation (>50 lines) | Global Rule #4 (Architect/Editor split) + `subagent-driven-development` | Active setup triggers Architect gate on 3+ files and isolates subagents. |
| Stacked PRs (`gt`) | Native Git branches + `work-unit-commits` | `gt` adds significant workflow complexity unless the team is already on Graphite. |
| Google Cloud Run swarms | Subagent parallelism (`dispatching-parallel-agents`) | Local subagents are free; Cloud Run swarms require GCP billing & container builds. |

---

## Recommendation

* **Stay with `superpowers` + Active Rules:** Your current setup already implements the anti-slop, verification-first rigor that `agystack` advocates, but without the dependency burden of Bun, Graphite CLI, or GCP container fleets on Windows.
* **Potential cherry-picks:** The only elements worth considering from `agystack` are individual specialized prompts from its 23 playbooks (such as `runtime-forensics` or `perf-issue`) if specific edge-case profiling needs arise.
