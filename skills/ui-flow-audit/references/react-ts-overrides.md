# React/TypeScript False-Positive Overrides for UI Flow Audit

Embed these rules into the audit pattern matching to avoid flagging standard React patterns. The simple tier (R1, R2, R4, R10) is most susceptible; balanced and complex tiers have higher semantic tolerance but still benefit.

## Matching logic

Apply these as pre-filter rules before running each detection rule. If any match, skip the finding.

---

### 1. `useState` setters are NOT action handlers (skip R1)

```typescript
const [isOpen, setIsOpen] = useState(false);
//                      ^^ setX pattern — skip R1
```

- `setX` names are React state setters, not imperative action handlers.
- Exception: if the setter is renamed in a `useCallback` wrapper to an action name like `openPanel`/`closePanel`, treat as a real handler pair.

### 2. `setX(v => !v)` IS the inverse path (skip R2)

```typescript
setIsOpen(prev => !prev);
//              ^^^^^^^^ toggle path exists — skip R2
```

- A single setter with `!prev` provides both directions.
- Also match: `setX(!x)`, `setX(x ? false : true)`.

### 3. Controlled component `value` + `onChange` pairs (skip R1)

```typescript
<input value={name} onChange={e => setName(e.target.value)} />
//    ^^^^^           ^^^^^^^^ complementary pair — skip R1
```

- `value` + `onChange` is React's controlled component contract. The `onChange` IS the complement.
- Also match: `checked` + `onCheckedChange`, `selected` + `onSelect`.

### 4. `useEffect` cleanup functions ARE the complement (skip R1)

```typescript
useEffect(() => {
  const sub = subscribe();
  return () => sub.unsubscribe();
  //       ^^^^^^^^^^^^^^^^^^^^^^ cleanup IS the complement — skip R1
}, []);
```

- The return function of `useEffect` is guaranteed to run on unmount. That IS the inverse of whatever the effect body started.
- Exception: if the effect body can start something mid-lifecycle AND the cleanup only runs on unmount (not between reruns), still skip R1 — consider R6 (Async Coverage) instead.

### 5. Escape key handlers = close affordance for R10 (skip R10)

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => e.key === 'Escape' && close();
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [close]);
```

- An Escape handler IS a valid close affordance — no visible button required.
- Also match: backdrop click (`onClick={close}` on overlay), `onClose` prop wired from parent.

### 6. Custom hook return setters form cross-module complement pairs (skip R1)

```typescript
// TimerContext.jsx
export function useTimer() {
  const [running, setRunning] = useState(false);
  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  return { startTimer: start, stopTimer: stop, timerSeconds };
}
// MyTime.jsx
const { startTimer, stopTimer } = useTimer();
```

- When a hook returns both `startX` and `stopX`, they form a complement pair even though they're consumed in different callbacks.
- Detection: trace destructured imports to the custom hook definition. If the hook exports both sides, skip the complement check on the consumer side.

### 7. `useMemo` / `useCallback` values in JSX are NOT orphaned (skip R4)

```typescript
const logsToRender = useMemo(() => logs.filter(l => l.date === selectedDate), [logs, selectedDate]);
//                      ^^^^^^^ computed, not state — skip R4
return <CalendarView logsToRender={logsToRender} />;
```

- `useMemo` values are derived computations. If consumed in JSX, they are not orphaned — they are simply not state-managed.
- Detection: check if the value is a `useMemo` result. If yes, skip R4 for that key.

### 8. Destructured context values traced to provider (skip R1 false positive)

```typescript
const { setDrawerOpen } = useOutletContext();  // defined in parent — skip
```

- A setter from context might appear "missing complement" in the consumer file, but the complement lives in the provider.
- Detection: if a handler is destructured from context or a custom hook, check the provider/hook definition file for the inverse pair. If found, skip.

### 9. Callback refs vs inline arrow handlers (informational — skip)

```typescript
<div ref={el => { if (el) observe(el); }} />
//    ^^^ callback ref — different profile from inline arrow
```

- Callback refs have a different identity profile from inline arrow functions. They fire on mount/unmount, not every render.
- Not typically a UI flow issue. Skip unless the callback ref has side effects (writes to state) that lack cleanup.

### 10. HMR refresh artifacts (skip R4)

- Hot Module Replacement can leave temporary state keys in the module closure.
- Detection: if a state key is flagged as orphaned but the component is under a `module.hot` boundary or a known HMR wrapper, skip the finding.

---

## Integration

These overrides should be applied as regex/pattern exclude lists in the audit scanner config:

```jsonc
// .ui-flow-audit.jsonc (example)
{
  "overrides": {
    "skipR1Patterns": [
      "useState\\(|set[A-Z]",
      "value\\s*=\\s*\\{.*\\}\\s+onChange\\s*=",
      "useEffect\\(.*return\\s*\\(?=>",
      "useOutletContext|useContext"
    ],
    "skipR2Patterns": [
      "prev\\s*=>\\s*!"
    ],
    "skipR4Patterns": [
      "useMemo\\(|useCallback\\("
    ],
    "skipR10Patterns": [
      "key==='Escape'|\\.key\\s*===\\s*['\"]Escape",
      "onClick\\s*=\\s*\\{.*close|onClose\\s*=\\s*\\{"
    ]
  }
}
```

Store this config alongside the ruleset for automated tooling. For manual code review audits, apply the heuristics cognitively.
