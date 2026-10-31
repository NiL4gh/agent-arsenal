---
trigger: always_on
---

# Domain Invariants & Rules

Use this rule file to enforce strict, project-specific invariants whenever working in this repository.

## State & Data Invariants
- Immutable store rules: mutations must pass through defined dispatchers or action creators.
- Schema invariants: never alter existing cache keys or serialized formats without explicit migration plans.

## Execution & Tooling Boundaries
- Temporary files must write exclusively to designated scratch or build directories.
- Never add new dependencies or endpoints without prior architectural review.
