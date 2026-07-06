---
name: modern-web-guidance
description: Frontend best practices — responsive design, a11y, performance, modern CSS/JS, React patterns
---

# Modern Web Guidance

Replaces AGi CLI's modern-web-guidance-plugin.

## Responsive Design

- **Mobile-first CSS**: base styles for mobile, `min-width` media queries for larger screens
- **Flexbox/Grid** over float-based layouts. Grid for 2D layouts, Flexbox for 1D
- **Viewport units** (`vw`/`vh`/`dvh`/`svh`) for full-screen sections, `clamp()` for fluid typography
- **Container queries** (`@container`) for component-level responsiveness instead of viewport-based
- **Touch targets** ≥ 44×44px for interactive elements
- Never hide critical content behind hover on mobile

## Accessibility (a11y)

- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<button>`) over `<div>` soup
- All images need `alt` text. Decorative images get `alt=""`
- Focus indicators visible on all interactive elements (never `outline: none` without replacement)
- Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Form inputs need `<label>` elements, not just placeholders
- ARIA only when semantic HTML can't do the job
- Test with keyboard-only navigation before claiming it's accessible

## Performance

- Lazy-load below-fold images and heavy components
- Bundle size matters: code-split route-level chunks, prefetch critical ones
- Avoid layout thrashing — batch DOM reads before writes
- `will-change` as a last resort, not a default
- Images: use appropriate format (WebP/AVIF), serve responsive sizes via `srcset`
- Animations: prefer `transform` and `opacity` (GPU-composited) over `width`/`height`/`top`

## React Best Practices (for Time Tracker)

- Components stay pure — same props = same output. Side effects go in `useEffect` or event handlers
- State lives as close to where it's needed as possible. Don't lift state "just in case"
- `useEffect` deps are explicit. Missing deps cause stale closures; extra deps cause wasted re-renders
- Avoid `useState` for derived values — compute them during render with `useMemo` instead
- Keys are stable and unique per list — index-as-key breaks with reordering
- Custom hooks extract reusable logic, not just UI. Name them `use*` consistently
- TypeScript: avoid `any`. Prefer proper types, generics, or at minimum `unknown`
- Server components in Next.js App Router: push client interactivity as far down the tree as possible

## Chrome Extension Best Practices (for AutoScroll)

- Manifest V3. No V2 for new extensions
- Service workers (not background pages) — they can terminate after 30s idle. Use `chrome.alarms` or `storage.onChanged` to wake
- Content scripts have limited API access — use messaging to service worker for anything beyond DOM manipulation
- `chrome.storage.local` and `chrome.storage.sync`, not `localStorage` (which is page-scoped)
- Permissions: request the minimum. Use `activeTab` over `tabs` when possible
- Extension icons: provide 16, 48, 128px sizes in the manifest

## CSS Modern Patterns

- Use CSS custom properties (`--color-primary`) for theming. No preprocessor variables needed — native is sufficient
- `:has()` selector enables parent-selector-like behavior natively
- `aspect-ratio` property replaces the padding-bottom hack
- `scroll-behavior: smooth` over JS scroll libraries
- `overscroll-behavior: contain` for modals/drawers to prevent body scroll
- `content-visibility: auto` for long scrollable pages — defers rendering of offscreen elements
