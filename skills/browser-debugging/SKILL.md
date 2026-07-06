---
name: browser-debugging
description: Browser debugging workflow for web apps and extensions — console, network, DOM, CDP
---

# Browser Debugging

## Overview

Browser bugs are usually caused by JS errors, network issues (wrong payload, CORS, cache), DOM/rendering mismatches, or async timing (race conditions, missing awaits, stale closures).

Replaces AGi CLI's chrome-devtools-plugin.

## Debugging Flow

### 1. Console Errors — Pinpoint First
Ask the user to open DevTools Console (F12) and share the full error + stack trace.

Common patterns:
- `undefined is not a function` → something didn't import/initialize
- `Cannot read properties of null/undefined` → element not in DOM when accessed
- `NetworkError` → CORS, wrong URL, or the endpoint rejected the request
- `Uncaught (in promise)` → missing `.catch()` or unhandled async rejection

### 2. Network Tab — Verify Requests
When the app fetches from an API or loads resources, ask the user to:
- Open Network tab, reproduce the issue
- Check: URL correct? Method? Status code? Response body? Request headers (especially auth)?

### 3. Elements Tab — DOM State
For rendering bugs:
- Ask user to inspect the element and check the computed styles
- Compare against what the React/JSX template should produce
- Look for injected styles, missing classes, or layout shifts

### 4. Extension Debugging (Chrome Extensions)
For the **AutoScroll** extension:
- Go to `chrome://extensions/` → find the extension → "Service Worker" or "Inspect views: background page"
- Console output from `background.js` / `service-worker.js` appears there
- Content scripts log to the **page's** console (not the extension's console)

### 5. React-Specific (Time Tracker)
- React DevTools: Components tab shows props/state tree
- Profiler tab shows re-renders (good for performance issues)
- Strict Mode double-invokes effects in dev — accounts for that before debugging

## Common Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Blank page, no errors | Missing root element in HTML | `<div id="root"></div>` |
| API calls fail in production only | Wrong baseURL, missing env vars | Check build-time vs runtime config |
| Extension doesn't run on page | Manifest permissions or matching patterns | Check `host_permissions` in manifest.json |
| CORS error | Server doesn't allow your origin | Add `Access-Control-Allow-Origin` header or use proxy |
| Stale UI after state change | Closure captured old value | Check deps array in useEffect / useCallback |
| Layout shifts | Missing dimensions on images/embeds | Set explicit width/height or use aspect-ratio CSS |
| Extension works after reload but not on install | Missing runtime.onInstalled handler | Add `chrome.runtime.onInstalled.addListener()` |
