---
name: logo-deconstruct-assembly
description: Use when deconstructing complex AI logo concepts or raster references into isolated sub-elements, generating clean component assets, and assembling production-ready vector artwork in Adobe Illustrator.
---

# Logo Deconstruct & Vector Assembly

## 1. Overview
High-end commercial vector logos must be clean, deliberate, and free of AI distortion artifacts. When working from an AI concept or raster screenshot, never auto-trace the entire composite image at once. Deconstruct the composition into modular layers, generate or draw each element separately, and assemble them with mathematical vector precision in Adobe Illustrator.

---

## 2. When to Use
- Taking an AI-generated logo or client raster reference and converting it into a manual production vector.
- Rebuilding multi-element designs (e.g., characters, mountains, foliage, 3D typography, badges).
- Guiding a designer step-by-step through Adobe Illustrator vector tracing, pen-tool drawing, and layer alignment.
- Eliminating AI artifacts (melting lines, broken bevels, irregular strokes, unreadable letterforms).

When NOT to use:
- Simple wordmarks or flat monolithic geometric logos that can be directly typeset or drawn in 2 minutes.

---

## 3. The 5-Phase Assembly Protocol

### Phase 1: Visual Audit & Layer Decomposition
Break the reference into 5–7 discrete structural layers:
1. **Background Canvas / Sky / Frame**
2. **Backdrop Landscaping / Peaks / Architecture**
3. **Midground Foliage / Environmental Accents**
4. **Hero Subject / Character / Mascot Action Silhouette**
5. **Hero Monogram / Custom Beveled Typography**
6. **Secondary Brand Typography & Anchor Plates**
7. **Containment Contour & Die-Cut Cutline**

### Phase 2: Generation vs. Manual Decision Gate
For every identified element, assign an execution path:
- **Generate via AI:** Complex organic forms, athletic silhouettes, anatomical poses, natural rock crags.
  - Requirement: Generate as **flat black and white silhouette on pure white background** (Fooocus or Google Flow format).
- **Construct Manually in Illustrator:** All letterforms, geometric shapes, straight banners, smooth motion ribbons/trails, and die-cut offsets.
  - Requirement: Never trace AI letters or banners. Rebuild with Type Tool + Create Outlines (`Ctrl + Shift + O`) or Pen Tool (`P`).

### Phase 3: Component AI Prompt Engine
When generating isolated elements, use strict isolation prompts:

**Fooocus / SDXL Formula:**
```
Prompt:
[subject], [pose or angle], clean flat vector, black and white, solid shape, isolated on white background, minimal, stock-ready

Negative Prompt:
realistic, photo, photography, 3d, shading, gradient, color, lighting, shadow, texture photo, blur, noise, grain, watercolor, paint, ink bleed, background scene, complex illustration, depth, perspective distortion, soft edges
```

**Google Flow / Natural Language Formula:**
```
[1–2 descriptive sentences of subject and angle in flat black vector style isolated on pure white]. No shadows, gradients, color, lighting, realistic texture, background scene, shading, or 3D.
```

### Phase 4: Illustrator Hand-Holding & Vector Tracing Runbook
Guide the designer through each exact software interaction:

1. **Image Trace Setup:**
   - Place B&W component PNG.
   - Preset: `Black and White Logo` or `Silhouettes`.
   - Threshold: `128` (adjust slightly if fine lines break).
   - Check `Ignore White` (critical: prevents trapped white background paths).
   - Click `Expand`.
   - Run `Object > Path > Simplify` to remove redundant nodes.

2. **Pen Tool Precision Drawing:**
   - Always place anchor points at extreme points of curvature (top, bottom, left, right).
   - Pull direction handles parallel to the curve; hold `Alt` to break handle symmetry for sharp corners.
   - For flowing curves (trails, ribbons): Draw a single open path, set stroke weight, use the **Width Tool** (`Shift + W`) to taper dynamics, then `Object > Path > Outline Stroke`.

3. **3D Bevel & Chamfer Lettering:**
   - Outlined typography (`Ctrl + Shift + O`).
   - Draw internal facet lines across letter diagonals using the **Line Segment Tool** (`\`).
   - Select all stems and lines, activate the **Shape Builder Tool** (`Shift + M`), and click individual facets to separate them into distinct closed polygons.
   - Color code facets: Face = light color; Bevel slope = mid-tone accent; Underside = shadow shade.

4. **Die-Cut Sticker Cutlines:**
   - Select all foreground art, duplicate to dedicated background layer.
   - Pathfinder panel → Click `Unite`.
   - `Object > Path > Offset Path` → Offset: `30–50 px`, Joins: `Round`.
   - Fill with white, add outer stroke if badge containment is needed.

### Phase 5: Production File Verification
Before exporting deliverables:
- [ ] No unexpanded strokes or live text.
- [ ] No hidden raster images or clipped bitmaps.
- [ ] No stray open anchor points (`Select > Object > Stray Points` → Delete).
- [ ] Color mode consistent: RGB for screens, CMYK for print.
- [ ] Layers grouped and labeled (`Artboard`, `Cutline`, `Artwork`, `Typography`).
- [ ] Export formats generated: `.AI` (Master), `.EPS` (Print), `.SVG` (Web), `.PNG` (300DPI transparent).

---

## 4. Common Pitfalls & Solutions
| Pitfall | Root Cause | Fix |
| :--- | :--- | :--- |
| **Wobbly or Jagged Traces** | Tracing a full color composite image | Never trace color composites. Trace high-contrast B&W masks only, then colorize in Illustrator. |
| **Melted / Distorted Letters** | Using AI-generated typography | Type out clean vector fonts, convert to outlines (`Ctrl+Shift+O`), and manually facet. |
| **Excessive Anchor Points** | Default Image Trace node density | Apply `Object > Path > Simplify` and manually delete points on straight segments. |
| **Color Bleed in Printing** | Missing die-cut bleed margins | Apply minimum 3mm / 40px uniform `Offset Path` with round joins. |
