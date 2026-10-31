---
name: ui-ux-pro-max
description: Premium UI/UX design engine for modern web apps, landing pages, glassmorphism, micro-animations, curated color systems, and responsive layouts.
---

# Skill: UI/UX Pro Max Design Engine

## Design Principles & Tokens

### 1. Color Palette System
- Avoid pure `#000000` or `#ffffff` backgrounds. Use rich dark slate (`#0b0f17`, `#111827`) or warm neutral light tones (`#f8fafc`).
- Primary accents: Curated HSL colors with high contrast for interactive targets (e.g., Indigo `hsl(238, 83%, 66%)`, Emerald `hsl(160, 84%, 39%)`, Cyan `hsl(188, 95%, 44%)`).

### 2. Micro-Interactions & Motion
- All interactive controls (buttons, cards, links, toggles) must have active hover, focus-visible, and press states with smooth transitions (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`).
- Loading states: Use pulse skeletons or customized CSS spinners instead of blank screens.

### 3. Glassmorphism & Depth
- Layer surfaces with subtle border strokes (`border: 1px solid rgba(255, 255, 255, 0.08)`) and backdrop filters (`backdrop-filter: blur(12px)`).
- Use elevation shadows tailored to dark/light modes (`box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3)`).

### 4. Typography & Spacing
- Use clean modern sans-serif typefaces (Inter, Outfit, Plus Jakarta Sans, Roboto).
- Scale heading levels (`h1`, `h2`, `h3`) with modular type scales (`font-weight: 700; letter-spacing: -0.02em`).
