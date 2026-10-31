# UI Flow Audit Ruleset (R1-R12)

Three tiers by confidence. Run cumulatively: explicit `simple` runs only Simple; explicit `complex` runs Simple + Balanced + Complex.

---

## Simple tier - deterministic, high signal

### R1 - Missing Complement
**Signal:** A handler named `start*` exists with no matching `stop*` / `cancel*` / `end*` / `finish*`. `open*` without `close*` / `dismiss*` / `hide*`. `create*` without `delete*` / `remove*`. `add*` without `remove*`. `subscribe*` without `unsubscribe*`. `expand*` without `collapse*`.
**Detection:** Treat the handler name as a verb-object pair. Look in the same file and immediate callees for the inverse pair. Cross-reference imports.
**Fix shape:** Add the inverse handler at the same site. Wire a control (button, gesture, keypress). If the absence is genuinely correct (one-shot navigation, one-time seed), tag with `// ui-flow-audit: R1 intentional - <reason>`.
**Override angle:** Forced-flow affordances; one-time bootstrap actions.

### R2 - Toggle Without Inverse Path
**Signal:** A boolean state has both a `setX(true)` and `setX(false)` setter, OR a single setter that always sets `true`. The "off" branch is missing or routed through a different handler that doesn't flip the same state.
**Detection:** Inspect sites where each boolean is written. Confirm at least one writes `false` (or that an `else` branch exists in the call chain).
**Fix shape:** Either one `toggleX()` that flips both directions, or two clearly named `enable*` / `disable*`.
**Override angle:** Effective-but-hidden inversions via different mechanisms (a parent resets the toggle on mount). Document with a comment if you want it silence on next audit.

### R4 - Orphaned State
**Signal:** A state key is written but never read anywhere. Or read but never set (suggests a removed feature).
**Detection:** Grep the project for each key. Reading = JSX render / template interpolation / API body. Writing = `set*`/`useState` updater / `dispatch` / reducer case.
**Fix shape:** Drop the dead key (preferred). Or wire it to its consumer.
**Override angle:** Debug/telemetry keys with intentional drop. Tag with `// ui-flow-audit: R4 intentional`.

### R10 - Open Without Close (user-flow blocking only)
**Signal:** A modal / banner / panel / drawer / sheet / popover **traps the user** - there is no exit path (no close button, no `onClose`, no keyboard escape, no breadcrumb back) AND the rest of the app is unreachable while it is open. Rendered with `display: block`, `aria-hidden=false`, or mount-on-show with no unmount-away path; the only exit is a full reload.
**Detection:** For each "open*" handler, search the same component for: a button with name Close/Dismiss/Done/Cancel, an `Escape`-key handler, an outside-click handler, an `onClose` prop, or an `aria-modal` + `role="dialog"` with no exit. If the surrounding UI is still operable (e.g. banner is inline, modal is confirm-style with an "OK" only) → not an R10. If none → flag.
**Fix shape:** Add a real exit affordance: close button + (escape/back) + optional click-outside. If the design intent is fire-and-forget (legal splash, fullscreen kiosk, forced wizard step), label the modal `<ForcedActionModal>` and document why no exit is provided.
**Override angle:** Confirm modals (`Are you sure?` with only OK) - restricted exit already present. Cosmetic-only lacks of close (a dismissable hint banner without ESC) are **not** in scope for R10 - those are polish, drop them via the relevance gate.
**Scope:** R10 fires *only* when the open state **blocks** downstream flow. Decorative banners or non-blocking snackbars without close affordances are out of scope here - drop them.

---

## Simple tier - coverage guarantee (non-finding)

### R13 - Auto-test-generation
**Trigger:** This rule runs during **every** UI flow audit (simple / balanced / complex / full), regardless of whether a finding was raised. It guarantees that each emitted finding ships with at least one runtime test artifact.
**Signal:** Presence of an interactive element (button, toggle, form, link, modal, fetch handler) associated with a finding; or, in `full` mode, every interactive element scanned.
**Detection:**
1. **Infer the project's test framework** - priority order:
   - `package.json` → check `devDependencies` for `@playwright/test` (e2e), `vitest` or `react-testing-library` or `@testing-library/react` (unit), `cypress` (e2e alt).
   - `requirements.txt` / `pyproject.toml` → check for `pytest-playwright`, `pytest`, `playwright`.
   - `Cargo.toml` → check for `cucumber`, `tokio-test`, `wasm-bindgen-test`.
   - None detected → emit a **framework-neutral** scaffold with a `// TODO: replace with your test runner` note.
2. **Search the project's test directory** (`tests/`, `__tests__/`, `*.test.*`, `*.spec.*`) for an existing assertion that references the same handler / element id / route. If found → emit `existing test: <path>` instead of regenerating.
3. **Generate the snippet:**
   - **Button / click handler:** programmatic activation + state-change assertion.
   - **Form / submit:** type → submit → assert network call or state transition.
   - **Modal / dialog open:** assert open path + assert the user-flow-critical exit path (only when R10 fired).
   - **Async fetch handler:** assert success path + at least one error path.
4. Idempotent on regeneration - when re-run, do not duplicate a test for the same handler id.
**Fix shape:** Not a finding - emits a `## Generated Tests` block in the audit report. The block contains one fenced code block per test, each tagged with the framework (`[playwright]`, `[vitest]`, `[rtl]`, `[neutral]`).
**Confidence:** *High* - auto-generation is script-derivable, not interpretive.

### R14 - External-code safety guard (non-finding / fix suggestion only)
**Trigger:** This rule runs **only** when a fix suggestion (or any addition to the codebase under audit) **pulls a public-library solution**. Indicators:
- The fix's code introduces `import` / `require` / `use` of a package not already present in the project's manifest.
- The fix copies or adapts code from a public GitHub/GitLab/NPM etc. source.
**Out of trigger:** Suggestions that reuse an already-vetted project dependency - do not run the safety screen on those.
**Checklist (run from `references/external-code-safety.md`):**
1. **Licence** - Must be OSI-approved permissive, copyleft (LGPL only with dynamic-linking exception), Apache-2.0, MIT, BSD-2/3, MPL-2.0, Unlicense, CC0. **Red-light** if custom/unknown/AGPL without opt-out.
2. **Vulnerability scan** - Run `npm audit --omit=dev`, `pip-audit`, or `cargo audit` against the chosen version. **Red-light** if any severity ≥ high found with no patched release.
3. **Maintenance** - Repo must have a commit within the last 12 months AND at least one release in the last 24 months. **Red-light** if abandoned.
4. **Footprint** - Project must pull **at most 2 new transitive deps** for a single fix (the prime directive: prefer libraries with minimal transitive trees).
5. **Provenance** - Packages must come from the official registry (npmjs, PyPI, crates.io). **Red-light** for arbitrary tarball URLs or unverified mirrors.
**Output:** Prepend `green-light` or `red-light` to the suggestion cell. If red-light, the suggestion is **not auto-applied** - it returns to Plan → Approve → Execute with the user choosing to accept the risk or pick an alternative.
**Confidence:** *Medium.* The checklist is mechanical; the verdict is binary per check.

---

## Balanced tier - semantic, medium signal

### R3 - Side-Effect Containment
**Signal:** Function/handler name suggests a single concern (`filterData`, `sortItems`, `formatCurrency`) but reads or writes state outside its named scope. Caught by inspecting body lines.
**Detection:** Read body. List every state key / API / effect referenced. Compare to the noun in the name.
**Fix shape:** Rename function (it does multiple things) or split it into `filterData` + `invalidateCache`.
**Override angle:** Conflated-by-design (filter that also updates count badge - usually fine).

### R5 - Destructive Without Confirm
**Signal:** Handler name matches `delete*`, `reset*`, `clear*`, `remove*`, `trash*`, `wipe*`, `purge*`, `revoke*`, `terminate*`. No `confirm(...)` call, no `<Dialog>`/`Modal` guard, no `await showConfirm` style guard.
**Detection:** Pattern-match the handler name. Inspect body for a confirm step.
**Fix shape:** Add a confirmation step. For "soft" deletes from a list, allow undo (R11 territory).
**Override angle:** Auth/permission already enforced and the action is fast-tracked by design.

### R6 - Async Coverage
**Signal:** Handler uses `await`, `fetch`, `axios`, `trpc.*`, Supabase insert/select, etc. But no surrounding loading state in component (no spinner, skeleton, `isLoading` flag), no error state surfaced, or errors swallowed (`.catch(() => {})` with empty body).
**Detection:** Sniff for async ops. Check the same file for `isLoading`/`loading`/`error` derived state. Check that errors are surfaced to user.
**Fix shape:** Tri-state `{loading, error, data}`. Surface errors with a recovery path.
**Override angle:** Optimistic UI by design (intent to update UI before server confirms).

### R7 - Dead-End Reachability (intra-component)
**Signal:** A state value can be set into, but has no in-component path to set out of except reload. Or a mount-with-no-unmount flow.
**Detection:** List all setters per state. If the only sane exit is reload → flag.
**Fix shape:** Provide a clear exit affordance.
**Override angle:** Coerced flows (legal splash, fullscreen kiosk).

---

## Complex tier - holistic, lower signal

### R7c - Dead-End Reachability (cross-route)
**Signal:** Tracing nav across screens: user enters A → B → C. From C no route back to A or B without reload.
**Detection:** Use the route registry (Next.js `app/`, React Router children, Vue router records). Build a directed graph. Find nodes with one-way edges.
**Fix shape:** Add exit edges. Breadcrumbs if appropriate.
**Override angle:** Onboarding wizards (return gated until completion).

### R9 - Simplicity Cap
**Threshold:** Handler body > 40 LOC OR > 5 distinct branch points (`if`/`switch`/`&&` chain).
**Detection:** Count branches and lines. Flag, don't fail.
**Fix shape:** Extract helpers. Use a reducer if state transitions are the source.
**Override angle:** Generator tables; complex transforms inherent to the domain.

### R11 - Revertibility
**Signal:** A mutation handler (state write, POST/PUT/DELETE) does not expose an undo path AND isn't tagged `// ui-flow-audit: destructive-intentional`.
**Detection:** Cross-reference handlers against any history/undo store, optimistic update with rollback, or soft-delete semantics.
**Fix shape:** Either add undo (history stack + replay) or downgrade to a confirm-gated action (R5).
**Override angle:** Server-authoritative writes with permanent side effects (payment captures).

### R12 - Idempotent-On-Retry
**Signal:** A side-effecting handler has NO re-entry guard:
  - no `isLoading`/`isPending` early return,
  - no `disabled={isLoading}` on the trigger,
  - no `AbortController`,
  - no debounce,
  - no idempotency key on the body,
  - no mutual-exclusion flag,
AND the side-effect is not idempotent (POSTs, mutating writes).
**Severity label:** `manual-verify` when in doubt. Confidence is lower - surface, don't assert.
**Detection:** Inspect handler body for any guard pattern. Inspect trigger element for `disabled` binding. Inspect fetch/axios for `signal` or `AbortController`. Inspect for retry-safe APIs (PUT-idempotency-key).
**Fix shape:** Add ONE guard: `if (isLoading) return;`, disabled button, `AbortController` on the fetch, or an idempotency key. Re-entry safe in one line.
**Override angle:** GETs and pure reads are inherently retry-safe. Idempotent APIs (PUT with key) are safe. Tag with `// ui-flow-audit: R12 intentional`.

---

## How to apply

1. Inventory interactions per file.
2. Classify each by tier-relevant signal.
3. Drop violations into the audit report under their tier, with `file:line`, the rule, and a concrete fix description.
4. Promote/demote confidence only via tier boundaries - Simple findings can be marked `manual-verify` only if the AI genuinely cannot verify; otherwise keep them at high confidence.
5. Always suggest a one-line fix.