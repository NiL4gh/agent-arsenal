---
name: example-domain-skill
description: "Project-scoped domain skill for specialized repository workflows."
allowed-tools:
  - read_file
  - run_command
---

# Skill: Example Domain Workflow

This skill is scoped strictly to this repository and is discovered via `.agents/skills/`.

## When to Use
- Specialized domain pipelines (e.g., rendering, media processing, custom code generation).
- Project-specific release checks or verification scripts.

## Procedures
1. Verify prerequisite environment variables and local tooling.
2. Execute domain task with explicit parameters.
3. Validate artifacts against project standards before committing.
