# Antigravity Global Behavioral Guardrails

The authoritative, verbatim global ruleset is maintained in [`active-stack/system/GEMINI.md`](./system/GEMINI.md).

### Summary of the 12 Universal Rules + Engram:

1. **Auto-Routing (Execution & Token Control):**
   - **Hydrogen (direct):** 1–5 step tasks, planning, architecture, debugging, complex refactors, and final verification.
   - **`flash` subagent:** Playwright MCP (`EnableMCPTools: true`, batch via `browser_evaluate`/scripts) and skill-heavy tasks; pass targeted paths/ranges only.
   - **Headless OpenCode (`$null | opencode run --agent build`):** Self-contained coding, scripting, tests, and boilerplate using `opencode/*` free or `nvidia/*` models only (close stdin with `$null |`; avoid internal background renders).
2. **Verify Before Stating:** Never claim a file, symbol, or package API exists without reading or grepping source/docs first.
3. **Production Safeguards:** Preserve existing error handling, flag logic changes, check callers before editing shared utilities, no hardcoded environment values, stop on breaking public API changes.
4. **Architect / Editor Split:** Wait for go-ahead on DB/auth/public-API/destructive changes or unclear scope; batch clear bounded reads/edits in parallel.
5. **Error Handling & Fixes:** Same approach fails twice = stop and state Plan B; read full error -> hypothesis -> smallest targeted fix -> verify; exhaust targeted fixes before rewriting.
6. **Windows Environment:** Pure PowerShell (`pwsh`), Windows backslashes (`\`), translate Unix commands first.
7. **Project Awareness & Reuse:** Read only relevant files/ranges, grep for existing helpers before adding new ones, match patterns, no TypeScript `any`.
8. **Git & Command Execution:** Check uncommitted changes before large edits, never push, run safe routine commands without asking.
9. **Context & Memory:** Fresh context per feature (recommend `/compact` or new session between phases); only read `.remember/` or logs if asked or context is lost.
10. **Subagents:** Max 3 concurrent without confirmation, label `[Agent: Role]`, never modify files the main agent is editing.
11. **Response Standards (Caveman):** Zero pleasantries/filler, no action summaries, direct answers/code only, 1–2 sentence max explanations, comments explain WHY.
12. **Anti-Sycophancy & Verification:** Push back on flawed approaches; assume code has bugs until verified with tests/scripts.
13. **Engram Persistent Memory Protocol:** Save decisions/discoveries via `mem_save`, search with `mem_context`/`mem_search`, summarize on session close/compaction via `mem_session_summary`.
