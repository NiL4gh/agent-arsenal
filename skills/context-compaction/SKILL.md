---
name: context-compaction
description: "Prevents context window flooding by enforcing log budgeting and intelligent output filtering."
---

# Skill: Context Compaction

## Description
Prevents context window flooding by enforcing log budgeting and intelligent output filtering, similar to Claude Code's automatic compact mode.

## Instructions
Before running any command that may produce large output, estimate the expected line count. If it exceeds the threshold, apply these rules:

### 1. Log Budget Threshold
- **Default Threshold**: 100 lines.
- If a command is expected to output more than 100 lines, DO NOT dump the raw output into the chat stream.

### 2. Filtering Strategies
- **Use Native Tools**: Prefer `read` with `offset`/`limit` to view specific line ranges.
- **Tail/MultiTail**: For logs, read the last 50 lines (`offset: -50`).
- **Grep/Search**: Filter for relevant keywords before outputting.
- **Summarize**: If the output is too large to reasonably share, provide a summary (e.g., "Build completed with 3 warnings") rather than the full log.

### 3. File Operations
- Prefer `read` with `limit` parameter over `bash` with `cat`.
- Prefer `glob` and `grep` for finding files/content instead of `find` or `grep` in bash.
- If you must view a large file, paginate it using multiple `read` calls with increasing `offset`.

### Example:
Instead of:
```bash
bash command: "cat src/large-file.js"
```
Do:
```
read filePath: "src/large-file.js", limit: 50
```