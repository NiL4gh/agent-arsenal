---
name: plan-first-reflection
description: "Forces the agent to enter a mandatory reflection phase before executing any action or writing any code."
---

# Skill: Plan-First Reflection

## Description
Forces the agent to enter a mandatory reflection phase before executing any action or writing any code, similar to Claude Code's deep reasoning.

## Instructions
Before executing ANY tool call or writing any code, you MUST output a brief internal thought log inside a `<thinking>` XML block.

### Required Content for `<thinking>` Block:
- **Current Goal**: What are we trying to accomplish right now?
- **Edge Cases**: What could go wrong? What assumptions are we making?
- **Affected Files**: Which files will be read, modified, or created?
- **Dependencies**: Will this change break anything else?
- **Rollback Plan**: If this goes wrong, how do we undo it?

### Example:
```xml
<thinking>
Goal: Add a new API endpoint for user authentication.
Edge Cases: The user table might not exist yet; duplicate email handling.
Affected Files: src/routes/auth.js, src/models/user.js
Dependencies: Requires bcrypt for password hashing.
Rollback Plan: Revert the route registration in src/app.js.
</thinking>
```

### Constraints:
- The `<thinking>` block must be present before the first tool call in a sequence.
- It should be concise but thorough (aim for 3-5 bullet points).
- Do not skip this step, even for trivial edits.