---
name: stock-asset-factory
description: >-
  Master architecture and operational standard for the autonomous multi-format microstock asset factory.
  Governs end-to-end production, quality gates, and platform publishing for vectors (SVG/EPS10/AI), high-resolution
  images (4K/8K JPEG), and broadcast video footage (4K UHD MP4) across Adobe Stock, Shutterstock, Freepik, Vecteezy,
  Pond5, and iStock.
---

# Stock Asset Factory 🏭 — Autonomous Multi-Format Production Standard

## 1. Executive Mission & System Architecture

The **Stock Asset Factory** is an integrated multi-tier commercial content generation system designed to autonomously engineer, pre-flight, embed metadata, and package three major stock deliverable formats with zero manual intervention:

```
                      ┌────────────────────────────────────────┐
                      │        STOCK ASSET FACTORY 🏭          │
                      └──────────────────┬─────────────────────┘
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       ▼                                 ▼                                 ▼
┌──────────────┐                 ┌──────────────┐                  ┌──────────────┐
│ TIER 1:      │                 │ TIER 2:      │                  │ TIER 3:      │
│ VECTORS      │                 │ HI-RES IMAGE │                  │ MOTION VIDEO │
│ SVG / EPS10  │                 │ 4K / 8K JPEG │                  │ 4K UHD MP4   │
│ AI (PDF 1.5) │                 │ APP1 XMP     │                  │ Cycles OptiX │
└──────┬───────┘                 └──────┬───────┘                  └──────┬───────┘
       │                                │                                 │
       └────────────────────────────────┼─────────────────────────────────┘
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │     UNIFIED METADATA & COMPLIANCE CORE       │
                 │  - ReadyTag-Aligned Titles (100–125 Chars)   │
                 │  - 40–45 Ordered Singular Microstock Tags    │
                 │  - Direct In-File Adobe XMP Packet Injection │
                 │  - Zero-Trust Pre-Flight Rejection Linters   │
                 └──────────────────────┬───────────────────────┘
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │          COMMERCIAL MARKETPLACES             │
                 │  Adobe Stock • Shutterstock • Freepik        │
                 │  Vecteezy • Pond5 • iStock (Getty Images)    │
                 └──────────────────────────────────────────────┘
```

---

## 2. Multi-Format Asset Production Specifications

### A. Tier 1: Vector Deliverables (`vectors/`)
- **Master Vector Formats**:
  1. `.svg`: Scalable master with `3840 x 2160` 4K artboard and `<clipPath id="artboard_clip">`.
  2. `.ai`: Adobe Illustrator CS6/CC container (PDF 1.5 stream) with byte-exact XMP padding.
  3. `.eps`: Pure EPS10 PostScript format with binary DOS EPS headers (`psLen`, `tiffStart`).
- **Vector Purity Rules**: Zero embedded raster pixels, zero unmasked bleed, natural human layer naming (`data-name` in Title Case).
- **Governing Skill**: [`stock-vector-standards`](../stock-vector-standards/SKILL.md).

### B. Tier 2: High-Resolution Raster Images (`vectors/JPEG/` & `lab/output/`)
- **Format**: High-Fidelity JPEG (`.jpg`).
- **Resolution**: Minimum `3840 x 2160` (4K) up to `8000 x 4500` (8K UHD).
- **Color Profile**: Embedded **sRGB IEC61966-2.1** ICC profile (strictly no CMYK).
- **Compression**: MozJPEG / Pillow Quality 92–95, subsampling 4:4:4 or 4:2:0, gradient dithering.
- **Metadata**: Injected into `APP1` segment (`http://ns.adobe.com/xap/1.0/\0`).
- **Governing Skill**: [`stock-image-standards`](../stock-image-standards/SKILL.md).

### C. Tier 3: 3D Stock Motion Video Footage (`motion/`)
- **Format**: MP4 (`.mp4`) or ProRes (`.mov`).
- **Resolution & Frame Rate**: Strictly **3840x2160** (4K UHD) @ `30.00 fps` or `24.00 fps` CFR (1080p strictly deprecated per buyer demand).
- **Duration Standard**: **20.00s to 30.00s** (`600–900 frames @ 30fps`, or `480–720 frames @ 24fps`), perfectly looped with harmonic trigonometric easing.
- **Ready-to-Use Out of the Box**: Drop-in commercial deliverable with finished studio lighting (Key/Fill/Rim/Kicker), physical contact shadows, dual-lobe clear-coat PBR reflections, micro-bump textures, and AgX/Rec.709 finished grade. Zero post-processing needed by buyer.
- **Render Engine**: Headless Blender 5.2.2 LTS via Cycles OptiX (photorealism/refraction) or EEVEE Next (realtime raytracing).
- **Audio**: **Zero audio tracks** (`-an`).
- **Metadata**: Dual in-file metadata — Official Adobe XMP UUID packet (`be7acfcb-97a9-42e8-9c71-999491e3afac`) + QuickTime container atoms. Zero CSV dependency.
- **Governing Skills**: [`stock-video-motion-standards`](../stock-video-motion-standards/SKILL.md) & [`blender-motion-graphics`](../blender-motion-graphics/SKILL.md).

---

## 3. The Unified ReadyTag-Aligned Metadata Standard

All assets across Vectors, Images, and Videos share a unified metadata generation contract:

### A. Title Engineering
- **Length**: Strict **100–125 characters** (hard minimum: 100 characters).
- **Syntax**: Commas (`,`) and periods (`.`) only. Zero dashes, colons, or parentheses.
- **Structure**: `[Varied Subject Lead] + [Geometry / Dynamic Motion / Lighting] + [High-Intent Commercial Deliverable Tail]`.
- **Anti-Patterns**: Strip all index numbers (`01`, `xx`), template string concatenations, and clichés (`ideal for`, `vector illustration of`).

### B. Keyword Engineering (40–45 Tags)
- **Tag Count**: Strict **40–45 singular tags**.
- **Ordering Hierarchy**:
  - `Tags 1–5`: Mirror core title terms.
  - `Tags 6–15`: Materials, geometry, lighting, palette, mood.
  - `Tags 16–25`: Media format tags (`vector, eps, svg, illustration` OR `video, 4k, loop, footage, motion graphic, cgi`).
  - `Tags 26–45`: Commercial use cases (`saas hero, luxury branding, gala backdrop, keynote presentation, fintech`).
- **Grammar**: Strictly singular nouns (`arch` not `arches`, `wave` not `waves`) and root verbs (`flow` not `flowing`).

---

## 4. Legal & Regulatory Compliance

1. **Generative AI Policy**:
   - **All factory assets are 100% Computer Generated Imagery (CGI) / Procedural Art.**
   - Zero diffusion models, GANs, or prompt-to-image/video tools were used.
   - Do **NOT** check "Created using generative AI tools" on Adobe Stock.
   - Do **NOT** submit as AI generated on Shutterstock (Shutterstock bans contributor AI video).
2. **Model & Property Releases**:
   - Always select **NO** (all assets are original abstract/procedural geometry without recognizable persons, private property, or protected logos).
3. **Licensing**:
   - Always select **Commercial** (not Editorial).

---

## 5. Factory Quality Gate & Pre-Flight Linters

Before submitting any batch to stock agencies, run the automated verification suite:

```powershell
# 1. Audit Vector Compliance & Clipping Masks
node tools/lint_stock_compliance.js

# 2. Verify Byte-Exact XMP in Vectors & Images
python tools/verify_all_embedded_assets.py
python tools/verify_batch2_all_formats.py

# 3. Audit Video Quality (Bitrate, Motion Delta, Sharpness)
python motion/tools/audit_video_quality.py

# 4. Verify Direct In-File Adobe XMP in Videos
python -c "
import glob
uuid = bytes.fromhex('be7acfcb97a942e89c71999491e3afac')
for v in glob.glob('motion/outputs/videos/*.mp4'):
    with open(v, 'rb') as f:
        assert uuid in f.read(), f'Missing XMP in {v}'
print('All videos 100% XMP compliant!')
"
```
