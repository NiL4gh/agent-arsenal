# Audit Report Template

Output path: `audits/<project>/flow-audit.md`
Format: tier-grouped markdown. Findings ranked by severity within each tier.

---

## Header (always present)

```
# UI Flow Audit — <project> @ <commit-or-date>

**Tier run:** simple | balanced | complex | full
**Findings:** N total — Simple: A · Balanced: B · Complex: C
**Top 3 by severity** (one line each):
1. …
2. …
3. …
```

---

## Simple tier section

### Simple — High confidence

| # | Rule | Location | Finding | Suggested fix |
|---|------|----------|---------|---------------|
| S1 | R1 | `src/Timer.tsx:42` | `startTimer()` has no complement. | Add `stopTimer()` and wire a Stop control at `src/Timer.tsx:55`. |
| S2 | R4 | `src/store.ts:18` | `lastResult` is written but never read. | Remove the key, or render it in the result panel at `src/Panel.tsx:30`. |
| … | … | … | … | … |

---

## Balanced tier section

### Balanced — Medium confidence

Same five-column shape. Add a `Confidence` column or pair with a one-line justification.

---

## Complex tier section

### Complex — Lower confidence (manual-verify)

Same five-column shape. Findings tagged `manual-verify` carry a clear "**manual-verify**" badge at the start of the finding cell.

---

## Severity legend

- **High** — Simple tier; concrete reproducer.
- **Medium** — Balanced tier; reviewer judgment advised.
- **Low** — Complex tier or `manual-verify`; informational.

---

## Summary block (tail of file)

- Counts by tier and severity.
- Files touched (sorted by finding count).
- Phrase: *"Treat each finding as a candidate fix. Plan → Approve → Execute one at a time. Re-run the audit after fixes to confirm."*