---
name: stock-vector-standards
description: >-
  Microstock vector engineering and compliance standard for Adobe Stock, Shutterstock, Freepik, and Vecteezy.
  Enforces 4K master artboard clipping masks, human-crafted layer hierarchies (id + data-name), ReadyTag-aligned
  SEO titles and keyword ordering (35-45 singular tags), binary container byte-alignment (PDF /Length & DOS EPS headers),
  and anti-flagging metadata sanitization.
---

# Microstock Vector Engine & Compliance Standards

## 1. Core Purpose
Governs the generation, pre-flighting, layer hierarchy, and metadata engineering of commercial vector assets (SVG, AI, EPS, JPEG) destined for top microstock marketplaces (Adobe Stock, Shutterstock, Freepik, Vecteezy, Creative Market).

---

## 2. Canvas & Artboard Architecture (Strict Mandate)

### 4K Artboard & Mandatory Clipping Mask
- **Resolution**: Fixed `3840 x 2160` px (`viewBox="0 0 3840 2160"`).
- **Zero Bleed Rule**: Artwork paths and gradient bounds must **never** extend beyond the artboard boundaries unmasked.
- **Master Artboard Clip Structure**:
  ```xml
  <defs>
    <clipPath id="artboard_clip">
      <rect x="0" y="0" width="3840" height="2160" />
    </clipPath>
  </defs>
  <g id="Artboard" data-name="Artboard" clip-path="url(#artboard_clip)">
    <!-- Natural Layer Groups -->
  </g>
  ```

---

## 3. Natural Human Designer Layer Hierarchy

When opened in Adobe Illustrator, layer names and grouping must look like they were crafted by a human art director, never an automated script.

### Layer Naming Conventions
- `id` uses snake_case / PascalCase (`Ambient_Glow`).
- `data-name` uses Spaced Title Case (`Ambient Glow`) so Illustrator's Layers panel renders natural human titles:
  1. `id="Background"` `data-name="Background"` — Base rectangle + ambient linear/radial foundation.
  2. `id="Ambient_Glow"` `data-name="Ambient Glow"` — Atmospheric back-lighting and specular gradients.
  3. `id="[Descriptive_Group]"` `data-name="[Descriptive Name]"` (e.g. `Sunburst_Beams` -> `Sunburst Beams`, `Kumiko_Lattice` -> `Kumiko Lattice`, `Vault_Arches` -> `Vault Arches`, `Topographic_Isolines` -> `Topographic Isolines`).
  4. `id="Luxury_Frame"` `data-name="Luxury Frame"` — Geometric border frame or ornamental corners (if applicable).
  5. `id="Grain_Texture"` `data-name="Grain Texture"` — Particle accents / specular point grids (if applicable).

---

## 4. ReadyTag-Aligned Microstock Metadata Engine

### A. Title Engineering (Hard Enforced)
- **Length**: Strict **100–125 characters** (Hard minimum: 100 characters).
- **Varied Lead**: Opener must rotate across mood, lighting, geometry, and composition.
- **Strict Anti-Patterns**:
  - **Zero String Template Concatenation**: NEVER use fixed template prefixes like `` `luxurious 24k gold ${filename}...` ``.
  - **Zero Numeric Prefixes**: Strip all index numbers (`01`, `02`, `xx`) from titles.
  - **Zero Connector Clichés**: No `ideal for`, `perfect for`, `designed for`, `vector illustration of`, `high resolution`.
- **Punctuation**: Commas (`,`) and periods (`.`) only. Zero dashes (`-`, `—`), colons (`:`), semicolons, or brackets.

### B. Keyword Discipline (40–45 Tags)
- **Tag Count**: Strict **40–45 keywords** (Hard minimum: 40 tags).
- **Strict Ordering**:
  - **Tags 1–5**: Mirror core keywords from the title exactly.
  - **Tags 6–15**: Deep subject geometry, lighting, palette, mood, and art style.
  - **Tags 16–25**: Vector format terms (`vector, eps, svg, scalable, illustration, background, wallpaper, pattern, backdrop, abstract`).
  - **Tags 26–45**: Earned commercial use cases (`luxury packaging, gala invitation, fintech hero, saas landing page, book cover, wall art, certificate`).
- **Grammar Constraints**:
  - **Nouns**: Strictly singular (`arch` not `arches`, `wave` not `waves`, `cube` not `cubes`, `contour` not `contours`).
  - **Verbs**: Infinitive root verbs (`flow` not `flowing`, `shine` not `shining`, `cascade` not `cascading`).
  - **Cohesive Keyphrases**: Preserved as space-separated units (`art deco`, `sacred geometry`, `gold foil`, `golden spiral`).
  - **Forbidden**: Zero brand names (`adobe`, `shutterstock`, `freepik`, `figma`) and zero metadata noise (`watermark`, `copyright`, `premium vector`).

### C. Mandatory Pre-Flight Verification
- Always run `node tools/lint_stock_compliance.js` before embedding. It verifies both 4K artboard clipping and metadata rules (100–125 chars title, 40–45 tags).

---

## 5. Anti-Flagging & Traceability Safeguards

Microstock ingestion parsers scan files for bot/generator flags:
1. **CreatorTool**: Must always be standard native Adobe software: `Adobe Illustrator 30.6 (Windows)` (or generic `Adobe Illustrator`). Never use `Stock Vector Engine`, generator names, or bot script labels.
2. **Local Machine Paths**: Zero file paths (`C:\Users\...`, local disk references) in headers, comments, or metadata.
3. **Author Credit**: Standardized to `<Author Name>` in `<photoshop:Credit>` and `%%For: (<Author Name>)`.
4. **Vector Purity**: 0 embedded raster images, data URIs, or bitmap textures in vector exports.

---

## 6. Binary Stream & Container Byte-Alignment (CRITICAL)

When modifying XMP metadata in exported `.ai` and `.eps` binary files:
- **`.ai` Files (PDF 1.5 Containers)**: Object `2 0 obj` defines `/Length <N>`. The injected XMP XML must be padded with whitespace (`\n   ...`) so the byte count between `stream` and `endstream` equals **EXACTLY `<N>` bytes**, preserving the PDF `xref` table and `startxref` pointer.
- **`.eps` Files (Binary DOS EPS Headers)**: The 30-byte header defines `psLen`, `tiffStart`, and `tiffLen`. Injected XMP must be padded so that PostScript text length equals `psLen` and TIFF preview offset `tiffStart` remains exact (0 byte drift).
- **`.jpg` Files**: Embedded using standard `APP1` XMP marker (`http://ns.adobe.com/xap/1.0/\0`).
