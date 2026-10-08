# Global Rules — Agent‑wide Conventions

> Loaded by every skill that creates, audits, or refactors code. Skill‑local rules (e.g. `ui-flow-audit/references/rules.md`) tighten these for a specific domain, but never relax them.

---

## 1. Simplicity & Reuse

> **Principle:** "Simplicity" means **the implementation path is small**, not that the feature is small. A 2,000‑LOC feature can still be implemented with a simple, layered path if it reuses existing primitives. Over‑engineering is inventing a new mechanism when an existing one already fits.

### 1.1 Reuse‑First Gate (mandatory before any new code)
Before authoring a new function, component, hook, module, or route, run **all four checks** in order:

1. **Same‑file search** — `grep` for verbs / nouns / return types that match the new intent.
2. **Cross‑file search** — `grep --include` across the source root for the same shape.
3. **Existing‑helper audit** — if a candidate exists, confirm it is the right shape:
   - Same signature (or trivially adaptable).
   - Same error semantics.
   - No hidden coupling that would force a different architecture.
4. **Decision log** — if you skip reuse (chose to author anew), record a one‑sentence `why-not-reuse` justification in your work output: *“Built a new {thing} rather than reusing {existing} because {concrete reason}.”*

If a helper already solves the problem, copy‑and‑adapt it instead of inventing a replacement. Cite the source in a comment: `// Reused from <path>:<line> — adapted for <new-intent>`.

### 1.2 Layered growth over parallel re‑implementations
When extending a feature, **layer onto the existing implementation** rather than forking it. Examples:
- New page with a similar action → use the existing route layout, not a fresh one.
- New batch operation that resembles navigation → call the existing navigation primitive rather than writing a new traversal.
- New export format → reuse the existing serializer pipeline before adding a branch.

### 1.3 Refactor only when reuse is blocked
If new code is needed **because the existing helper is mis‑shaped**, refactor the existing helper first (subject to `Plan → Approve → Execute`), then layer. Do not silently grow parallel mechanisms.

---

## 2. External‑Code Safety Policy

> Re‑states the R14 guard from `ui-flow-audit` at the global layer so it applies to **any** import the assistant proposes, not only audit‑triggered ones.

### 2.1 Trigger
Run the external‑code safety checklist (`~/.config/opencode/skills/ui-flow-audit/references/external-code-safety.md`) whenever the assistant proposes to add a **new** public‑registry dependency or copy code from a public repository. Routine reuse of vetted, existing project dependencies does **not** trigger this gate.

### 2.2 Verdict flow
- `green-light` → the suggestion may be applied automatically with the stated caveat.
- `green-light — caveat: …` → apply but surface the caveat in the work output.
- `red-light` → **do not apply automatically**. Return to Plan → Approve → Execute; the user must explicitly accept the risk.

### 2.3 Why
Public registries are convenient but not uniformly safe. Licence incompatibility, known CVEs, abandoned packages, or transitive‑explosion are common. A 90‑second checklist prevents an hour of remediation.

---

## 3. UI Interaction Test Discipline

> Any session that **modifies UI code** must leave behind a UI‑interaction test artifact. Text‑only "I checked it manually" is insufficient.

### 3.1 Default behaviour
After editing any interactive element (button, toggle, form, link, modal, fetch handler), the assistant must:

1. Infer the project's test framework (Playwright, Vitest/React‑Testing‑Library, pytest‑playwright, etc.). Project‑specific detection lives in the skill's R13 detection logic.
2. Search for an existing test that already covers the change. If present → cite it, do not duplicate.
3. Otherwise, emit at minimum:
   - A test that **activates** the interaction programmatically.
   - An assertion on the user‑observable state after activation (success path).
   - Where the interaction is async or side‑effecting, an assertion on the error path too.

### 3.2 Where to place the test
- Frontend project: alongside the existing test directory (`tests/`, `__tests__/`, `*.test.ts(x)`, `*.spec.ts(x)`).
- Backend / CLI: alongside existing integration / unit tests.
- New projects with no test directory yet: the assistant must propose creating one and create it only after user approval.

### 3.3 Why
Manual spot‑checks miss regressions. A 5‑line test that survives a refactor is cheaper than a 30‑minute re‑QA cycle.

---

## 4. User‑Flow Relevance Gate (UI audits)

> When auditing or reviewing UI changes, only surface findings whose fix **changes a flow** a user can actually perform. Cosmetic / quality‑of‑life improvements are out of scope unless they block flow.

### 4.1 In‑scope
- Missing stop / close / undo that leaves the user stuck.
- Orphaned state that makes a screen behave inconsistently.
- Destructive actions without confirm.
- Async handlers with no loading/error state.
- Dead‑end routes that block return to a parent page.

### 4.2 Out of scope (drop, do **not** report)
- Missing ESC key on a dismissable banner.
- Missing focus ring on a non‑interactive element.
- Missing `aria-live` politeness on a status hint.
- Any "this would be nicer" suggestion that does not change a user flow.

If uncertain, drop the finding.

---

## 5. Audit‑Don't‑Fix Boundary

> Reporting and fixing are separate acts. The assistant reports findings and proposed fixes; **the user decides which to apply**. Plan → Approve → Execute applies.

### 5.1 What this means
- Do not auto‑apply fixes that change behaviour in a reviewed codebase unless the user has approved the change in the current session.
- Do auto‑apply trivial formatting / comment fixes only when they are 1‑line and the surrounding intent is obvious.

### 5.2 Why
Auto‑applying changes makes review and rollback harder. A clear boundary keeps the assistant accountable and the user in control.

---

## 6. Compatibility

These global rules are designed to layer cleanly on top of existing skill rules. A skill may **tighten** a rule (e.g. add a more specific test pattern) but **never relax** one. When a skill's instructions appear to conflict with a global rule, the global rule wins; surface the conflict in the work output.
