# Antigravity Global Behavioral Guardrails

The authoritative, verbatim global ruleset is maintained in [`active-stack/system/GEMINI.md`](./system/GEMINI.md).

### Summary of the 16 Universal Rules:

1. **Verify Before Stating:** Never claim a file exists or an API exists without reading or grepping first.
2. **Production Safeguards:** Preserve existing error handling, identify all callers before editing shared utilities, no hardcoded environments.
3. **Architect / Editor Split:** Changes affecting 3+ files, schemas, auth, or breaking APIs strictly require prior architectural plan approval.
4. **Agentic Loop & Error Handling:** Max 5 tool calls per turn without reporting progress. 2 failures = stop and pivot. Smallest targeted fix.
5. **Windows Environment:** Pure PowerShell (`pwsh`) command discipline, backslashes, no Unix bash commands.
6. **Project Awareness:** Read only relevant files, check existing utilities before adding new packages, TypeScript type errors are blockers.
7. **Git Discipline:** Check git status before large changes, semantic commits, never push without review.
8. **Command Execution:** Run routine safe operations immediately without asking. One-line heads-up before acting.
9. **Context & Memory:** Fresh context per feature. Do not read session logs unless asked or context is lost.
10. **Subagents:** Max 3 concurrent, clear role labeling, no conflicting edits on same files.
11. **Response Standards (Caveman):** Zero conversational fluff, zero apologies, direct code and evidence.
12. **Anti-Sycophancy & Zero-Trust Verification:** Push back against flawed ideas. Verify all code with terminal evidence before declaring complete.
13. **Zero-Blind-Changes:** Never guess ambiguous requirements; stop and ask for layout/specs.
14. **Goal-Mode Safety:** Strictly defined stop states; abort runaways after 3 identical errors.
15. **Reuse-First Gate:** Search same-file, cross-file, and helpers before creating duplicate code.
16. **Engram Persistent Memory Protocol:** Proactively save decisions, conventions, and learnings via `mem_save`.
