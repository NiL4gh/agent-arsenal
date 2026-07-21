# External-code Safety Checklist (R14)

**When to run:** Only when a fix suggestion pulls a **public‑library solution** — i.e. the suggested code introduces `import` / `require` / `use` of a package not already in the project's manifest, or copies code from a public repo to resolve a specific issue/feature.

**When to skip:** Fixes that reuse already‑vetted project dependencies do not trigger this check.

Run the four gates below **in order**. Any gate that fails → `red-light` the suggestion.

---

## Gate 1 — Licence

- **Pass:** OSI‑approved permissive, copyleft with dynamic‑linking exception, Apache‑2.0, MIT, BSD‑2/3, MPL‑2.0, Unlicense, CC0, ISC, 0BSD.
- **Pass with caveat:** LGPL, EPL, MPL — only when the integration model is compatible (dynamic linking / weak copyleft). Mark with `green-light — caveat: <licence>`.
- **Fail:**
  - Custom or unknown licence.
  - AGPL‑3.0 **without** an opt‑out (AGPL is viral for network use; default to **red-light**).
  - SSPL, BUSL‑1.1, Elastic License v2 — treat as source‑available, **red-light** unless you explicitly want that model.
  - "All rights reserved", "Internal use only", or no licence file.

**Action on fail:** Suggest an alternative package with a passing licence OR drop the suggestion.

---

## Gate 2 — Vulnerability scan

Run the project's existing audit command against the candidate version before recommending:

| Ecosystem | Command |
|-----------|---------|
| npm       | `npm audit --omit=dev --package-lock-only` then resolve. Prefer `npm audit` with the target version pinned. |
| Yarn      | `yarn npm audit [--level moderate]` |
| pnpm      | `pnpm audit [--prod]` |
| Python    | `pip-audit -r requirements.txt` (or `safety check`) |
| Rust      | `cargo audit` |
| Go        | `govulncheck ./...` |

- **Pass:** Zero advisories **at or above** the project's tolerance (default: high and critical). Low/moderate are acceptable when patched in the same release channel.
- **Fail (red-light):** One or more **high or critical** unpatched advisories. The audit must:
  1. Pin to a version that resolves the advisory, OR
  2. Drop the suggestion and propose an alternative.

**Gotchas:**
- Audit commands must run against the **exact version** being added; floating ranges (`^1`) are evaluated at lockfile resolution time, not at suggestion time.
- For libraries with respect‑deferred issues (e.g. SSRF in an internal helper), note the risk in the green‑light caveat.

---

## Gate 3 — Maintenance

- **Pass if ALL:** Last commit within **12 months**, at least one release in **24 months**, primary maintainers publicly identifiable, issue tracker has reasonable response cadence.
- **Fail:** No commit in 18+ months, no release in 36+ months, repo archived, or maintainer unresponsive to outstanding CVEs.
- **Verify via:** GitHub repo `Insights → Contributors` and `Releases`, npm `versions` history, crates.io `versions`, PyPI `Release history`.

**Action on fail:** Pick a maintained alternative that solves the same problem.

---

## Gate 4 — Footprint

The **single fix** must not explode the project's transitive dependency graph.

- **Pass:** The candidate adds **at most 2 new transitive deps** that the project hasn't already pulled.
- **Soft pass (green‑light — caveat):** 3–5 new transitive deps. Note the network/install impact in the caveat.
- **Fail:** More than 5 new transitive deps → red-light. The fix is bigger than the problem.

**Why:** Every new transitive node is a future maintenance burden. If a 6‑dep library solves a 1‑dep problem, prefer the smaller sibling.

---

## Gate 5 — Provenance

- **Pass:** Package is fetched from the **official registry** (npmjs.com, PyPI.org, crates.io, pkg.go.dev, RubyGems.org).
- **Pass with caveat:** GitHub‑hosted tarball pinned to a specific commit SHA — `green-light — caveat: <commit-sha>`.
- **Fail:**
  - Arbitrary tarball URL not pinned to a commit.
  - Unverified mirror (e.g. private CDN with no checksum).
  - Direct copy of code from a public repo without attribution — refuse and demand the user run gate 1 against the original repo.

---

## Output formatting

When R14 runs, prepend the verdict to the *suggestion cell* of the finding row:

| Verdict        | Tag                       | Action                                   |
|----------------|---------------------------|------------------------------------------|
| All gates pass | `green-light`              | Suggestion stands.                        |
| Soft pass      | `green-light — caveat: …`  | Suggestion stands; caveat is in‑cell note.|
| Any gate fails | `red-light`                | Suggestion **withdrawn**, propose alt.    |

Example row cells:

```
| S2 | R1 | src/Timer.tsx:42 | startTimer no complement. | green-light — caveat: audit pulls `lodash.debounce@4.0.8`, 1 transitive; low footprint. Apply. |
| B3 | R5 | src/Account.tsx:18 | delete without confirm. | red-light — pulled `confirm-shell@2.0.0` is AGPL-3.0 (Gate 1). Use a tiny custom confirm util instead. |
```

---

## Trigger matrix (quick reference)

| Situation                                            | Run R14? |
|------------------------------------------------------|----------|
| Existing project dependency stays in the fix         | No       |
| Fix adds a package, but it was already in the lockfile | No       |
| Fix adds a brand-new package from npm / PyPI / Cargo | Yes      |
| Fix copies code from a public GitHub repo            | Yes      |
| Fix rewrites existing code with no new deps          | No       |

**Reminder:** The default is **cheap to run, expensive to skip**. When in doubt, run the checklist.
