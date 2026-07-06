---
name: test-driven-correction
description: "Implements a relentless verification loop, running tests and self-correcting on failures."
---

# Skill: Test-Driven Self-Correction Loop

## Description
Implements a relentless verification loop. Before finalizing any task, the agent attempts to run the project's test suite. If tests fail, it routes the error back to itself for diagnosis and patching, mimicking Claude Code's self-healing behavior.

## Instructions
After completing a code change, you MUST verify it using the following loop:

### 1. Detect Test Command
- Look for common test runners in the project:
  - `package.json` scripts: `npm test`, `yarn test`, `pnpm test`
  - Python: `pytest`, `python -m unittest`
  - Go: `go test ./...`
  - Rust: `cargo test`
  - Ruby: `bundle exec rspec`
- If a test command is found, run it.

### 2. Evaluate Results
- **If PASS**: Confirm success to the user and stop.
- **If FAIL**: Capture the error log and proceed to Step 3.

### 3. Diagnose and Patch (Self-Correction)
- Create a hidden thought log analyzing the failure.
- Identify the root cause (e.g., typo, missing import, broken logic).
- Propose and implement a fix.
- Re-run the test command (repeat from Step 2).

### 4. Max Retries
- If the test fails after 3 iterations, stop the loop.
- Report the failure to the user with the final error log and a summary of attempted fixes.

### Example Loop:
```
[User] Add a new function to utils.js.

[Agent] Code written. Running `npm test`...
[Agent] Test failed: SyntaxError in utils.js:12
[Agent] <thinking> Diagnosing... Missing closing bracket. </thinking>
[Agent] Fix applied. Re-running `npm test`...
[Agent] Test passed. Task complete.
```