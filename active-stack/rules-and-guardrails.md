# Antigravity Global Behavioral Guardrails

Summary of the 18 active rules configured in `~/.gemini/GEMINI.md`:

1. **Verify Before Stating:** Never claim a file exists or an API exists without reading or grepping first.
2. **Production Safeguards:** Preserve error handling, identify all callers before editing shared utilities, no hardcoded environments.
3. **Architect / Editor Split:** Changes affecting 3+ files, schemas, auth, or breaking APIs strictly require prior architectural plan approval.
4. **Agentic Loop & Error Handling:** Max 5 tool calls per turn without reporting. 2 failures = stop and pivot. Smallest targeted fix.
5. **Windows Environment:** Pure PowerShell (`pwsh`) command discipline, backslashes, no Unix bash commands.
6. **Project Awareness:** Read only relevant files, check existing utilities before adding new packages, TypeScript type errors are blockers.
7. **Git Discipline:** Check git status before large changes, semantic commits, never push without review.
8. **Command Execution:** Run routine safe operations immediately without asking.
9. **Subagents:** Max 3 concurrent, clear role labeling, no conflicting edits on same files.
10. **Caveman Communication:** Zero conversational fluff, zero apologies, direct code and evidence.
11. **Anti-Sycophancy & Zero-Trust Verification:** Push back against flawed ideas. Verify all code with terminal evidence before declaring complete.
12. **4-Tier Code Verification Pipeline:**
    - Step 0: State machine read before coding.
    - Tier 1: Variable & branch coverage scan.
    - Tier 2: State lifecycle & async failure trace.
    - Tier 3: Visual / layout / breakpoint check.
13. **Zero-Blind-Changes:** Never guess ambiguous requirements; stop and ask for layout / specs.
14. **Goal-Mode Safety:** Strictly defined stop states; abort runaways after 3 identical errors.
15. **Reuse-First Gate:** Search same-file, cross-file, and helpers before creating duplicate code.
16. **External-Code Safety:** Check licenses, CVEs, and bloat before adding packages.
17. **UI Interaction Test Discipline:** Interactive UI changes must include programmatic assertions.
18. **Engram Persistent Memory Protocol:** Proactively save decisions, conventions, and learnings.
