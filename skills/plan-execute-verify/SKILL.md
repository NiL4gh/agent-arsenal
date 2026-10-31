---
name: plan-execute-verify
description: Enforces the strict sequential reasoning loop used by elite coding agents.
---

# Plan-Execute-Verify Architecture

When handling complex tasks, you must abandon the "fan-out speed" philosophy and instead adopt a strict, sequential three-phase agentic loop.

## Phase 1: Gather Context & Plan
- Do not write code immediately.
- Use `agentic-pruning` to map the project's dependencies, implicit constraints, existing testing frameworks, and assertion patterns.
- Outline a strategic breakdown of the fix. If the change involves more than 3 files or core architectural changes, present the plan to the user for explicit approval.

## Phase 2: Execute (Isolate & Fix)
- Apply the code changes sequentially.
- If delegating to subagents, use the `agent-worktree` skill to isolate their work in separate Git branches to eliminate architectural race conditions.

## Phase 3: The Self-Correction Loop (Verify)
- After proposing a code diff, you MUST dynamically run the project's build tool or test framework (e.g., `npm test`, `pytest`, `cargo test`) using the `run_command` tool.
- Intercept your own output. If a test fails, read the terminal stack trace, log the regression, re-reason, and modify your diff.
- Do NOT present the result to the user until you have a polished, working product that passes the verification loop.
- Once verified, use standard Git commands to write a clean, semantic commit message.
