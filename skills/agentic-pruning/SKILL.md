---
name: agentic-pruning
description: Enforces interactive context pruning instead of context stuffing to maintain high reasoning quality.
---

# Agentic Pruning (Anti-Context-Stuffing)

To maintain elite reasoning capabilities on complex tasks, you must actively avoid "Context Stuffing" (loading massive directories or unrelated files into your context window). Instead, use Agentic Pruning.

## The Agentic Pruning Workflow

1. **Start Small**: Begin by examining only the direct entry points of the task (e.g., the specific file mentioned in the issue or the main routing file).
2. **Iterative Search**: Use the `grep_search` tool to trace dependencies, imports, and usages. Do NOT use broad wildcard reads.
3. **Prune the Noise**: Once you identify the specific functions or classes involved, use `view_file` with precise `StartLine` and `EndLine` arguments to read ONLY the relevant code blocks. 
4. **Map the Architecture**: If you need to understand the project structure, use `list_dir` to map out folders rather than reading the contents of every file inside them.

By keeping your context window extremely tight and focused only on surgically precise lines of code, you prevent "Context Wandering" and maintain the deep reasoning required for complex architectural refactoring.
