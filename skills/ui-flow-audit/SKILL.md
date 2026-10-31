---
name: ui-flow-audit
description: Use when auditing app UIs for missing interaction pairs, orphaned state, destructive actions without confirm, async actions without loading/error states, dead-end intra- or cross-route flows, or over-complicated handlers. Trips on unfinished features, dead-end UI flows, and silent state inconsistencies. **User-flow only** - does NOT report cosmetic polish (e.g. "add ESC to banner") unless it blocks the actual user flow.
license: Apache-2.0
metadata:
  author: agent-arsenal
  version: "0.2.0"
allowed-tools:
  - read_file
  - run_command
---

# Skill: ui-flow-audit

## Activation Contract

Use when the user asks to audit, lint, or check a UI for broken/incomplete **user flows**, OR asks "is this ready to ship?" after building a feature. The goal is to **reduce manual UI testing time** by surfacing code-grounded findings before runtime.

Triggers: `audit the UI of <project>`, `check for missing Stop / close / undo`, `did I orphan any state?`, `are my handlers double-click safe?`, release readiness review.

Do NOT use for:
- Cosmetic / quality-of-life suggestions (visual tweaks, minor affordances that don't change a flow).
- Business-logic correctness, visual design, performance, project-wide lint of style/consistency.

## Hard Rules

- **Source-grounded only.** Every finding cites `file:line`. No invented refs.
- **User-flow relevance gate.** A finding is only in-scope if fixing it changes a flow the user can hit (start/stop, navigate, submit, undo). Suggestions that only improve polish (e.g. "add ESC key to banner") are out of scope and must NOT be emitted, even if they would otherwise match a rule.
- **Tier the output.** Simple always first. Balanced second. Complex last. `manual-verify` badge on uncertain ones.
- **No new test infra in Phase 1.** Phase 1 ships the simple tier audit. Playwright/runtime verification (Layer B) lives in Phase 6.
- **Auto-test-generation (R13) is required whenever the audit touches UI code.** After interaction discovery, emit a minimal UI-interaction test snippet (target framework inferred from the project - Playwright for e2e, Vitest/RTL for unit). The audit report must include the snippet, not just a textual claim that a test is needed.
- **Fix suggestion per finding.** Don't just name the bug - say what change closes it.
- **Tier governs confidence.** Demote only with a justification. Don't promote "sounds bad" findings.
- **Audit, don't fix.** This skill reports. The user decides; Plan → Approve → Execute applies.
- **External-code safety (R14) only on public-library pull.** Trigger the safety screen **only** when a fix suggestion (or any new code being added) imports a package from a public registry or copies code from a public repo to resolve a specific issue/feature. Routine use of already-vetted project dependencies is not screened. On trigger, run the licence / vulnerability / maintenance checklist from `references/external-code-safety.md` and label the suggestion **green-light** or **red-light**.

## Execution Steps

When invoked with `ui-flow-audit [phase] [path]`:

1. **Phase arg** - `simple` (default), `balanced`, `complex`, `full`. `full` = all three cumulatively.
2. **Path arg** - defaults to project root (`./src`, `./app`).
3. **Load `references/rules.md`** once for the rule definitions.
4. **Discover interactions** - for each file under `path`:
   - List every interactive element (button, toggle, form, link, modal, fetch handler).
   - For each: record element + handler + state touched + tier-relevant signal.
5. **Apply only the phase's tier rules.** Even if you spot balanced/complex findings while in `simple` phase, do not include them - Plan next-phase run (`ui-flow-audit balanced`).
6. **User-flow relevance gate.** Before composing the report, drop any candidate finding whose only impact is cosmetic (e.g. "banner lacks ESC key", "spinner lacks polite aria", "button needs focus ring"). A finding is in-scope only if reversing it changes a flow a user can perform. When uncertain, prefer dropping it.
7. **Auto-test-generation (R13) - run whenever the audit scans UI code.** For each in-scope finding, infer the project's test framework from `package.json`, `requirements.txt`, `pyproject.toml`, or Cargo manifests (Playwright when e2e is configured; Vitest/React-Testing-Library when unit tests exist; otherwise emit a framework-neutral scaffold). Append the generated snippet under a `## Generated Tests` block in the audit report. Every finding gets at least one test. Idempotent - if a test for that handler already exists in the project's test directory, note `existing test: <path>` and skip regeneration.
8. **External-code safety (R14) - run only when a fix suggestion pulls a public library.** If a finding's suggested fix imports a new package from npm, PyPI, crates.io, etc., or copies code from a public repo, run `references/external-code-safety.md`, then prepend a `green-light` or `red-light` tag to the suggestion cell. If a finding's fix uses only already-vetted project dependencies, skip R14.
9. **Compose report** - fill `references/audit-template.md`, output to `audits/<project>/flow-audit.md`.

## Tier → Rule map

| Tier     | Rules                                                              | Confidence | Speed |
|----------|--------------------------------------------------------------------|------------|-------|
| Simple   | R1 Complement · R2 Toggle inverse · R4 Orphaned state · R10 Open-without-close (user-flow blocking only) · **R13 Auto-test-generation** | High       | Fast  |
| Balanced | R3 Side-effect leak · R5 Destructive-without-confirm · R6 Async coverage · R7 Intra-component dead-end | Medium     | Medium|
| Complex  | R9 Simplicity cap · R11 Revertibility · R12 Idempotent-on-retry · R7c Cross-route dead-end | Lower (`manual-verify`) | Slow |

Notes:
- **R10** applies **only** when the lack of a close path traps the user (forced-flow dialogs where the modal blocks the rest of the app and has no exit). Cosmetic exit hints (ESC, backdrop click) are **not** R10 findings - drop them via the relevance gate.
- **R13** runs in *every* tier (simple, balanced, complex, full) - it is a coverage guarantee, not a finding.
- **R14** does not occupy a tier - it is a guard applied to fix suggestions independently of the audit tier.

## Output Contract

Return:
- Generated `audits/<project>/flow-audit.md` path.
- Total findings per tier.
- **Generated Tests section** listing each UI interaction and its auto-generated test snippet (or `existing test: <path>` note).
- **External-code-safety tags** near each suggestion that pulled a public library (green/red-light).
- Top 3 by severity.
- Any rules skipped (missing files, no parseable state).

## TDD discipline (skill authoring)

- **RED baseline:** my prior ad-hoc reasoning in this conversation is the working behavior to outperform.
- **GREEN proof:** `fixtures/sample-app/App.js` is seeded with R1/R2/R4/R10/R12 violations. Manually follow the skill against this fixture (`fixtures/sample-app/flow-audit-example.md` exists as proof).
- **REFACTOR:** tune in Phase 2 against real Chronos findings.

## References

- `references/rules.md` - full R1-R12 definitions, signals, fix shapes, override angles.
- `references/audit-template.md` - output report template.
- `references/external-code-safety.md` - R14 checklist for vetting public-library pulls (licence, vulnerability scan, maintenance status, footprint). Only invoked when the fix pulls a new public dependency.
- `fixtures/sample-app/` - seeded-bug mini app for self-verification.
