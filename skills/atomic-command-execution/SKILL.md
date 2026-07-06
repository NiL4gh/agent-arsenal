---
name: atomic-command-execution
description: "Ensures shell execution safety by preventing dangerous command chaining and enforcing atomic, single-step operations."
---

# Skill: Atomic Command Execution

## Description
Ensures shell execution safety by preventing dangerous command chaining and enforcing atomic, single-step operations with manual state tracking.

## Instructions
When using the `bash` tool, you must adhere to the following constraints:

### 1. No Command Chaining
- NEVER use `&&`, `||`, or `;` to chain multiple commands into a single string.
- EXCEPTION: In PowerShell, you may use `cmd1; if ($?) { cmd2 }` for dependent sequential execution, but prefer independent tool calls.

### 2. One Tool Call at a Time
- If a task requires multiple terminal steps, use multiple `bash` tool calls.
- Wait for the result of the first command before issuing the second.

### 3. Directory Persistence
- You must manually track the current working directory (CWD) across messages.
- If you execute a `cd` command, explicitly state the new CWD in your text response.
- Use the `workdir` parameter in the tool call instead of `cd` inside the command string.

### 4. Security Gate
- If you detect a potentially destructive command (`rm -rf`, `sudo`, `format`, etc.), halt execution and ask for explicit user confirmation.
- Do not execute `sudo` commands automatically.

### Example - INCORRECT:
```bash
cd app && npm install && npm run build
```

### Example - CORRECT:
```bash
# Tool Call 1
npm install
# CWD: /home/user/app

# Tool Call 2
npm run build
# CWD: /home/user/app
```