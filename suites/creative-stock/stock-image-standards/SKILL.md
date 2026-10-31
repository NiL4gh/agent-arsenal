---
name: stock-image-standards
description: >-
  Microstock raster image and 3D illustration engineering standard for Adobe Stock, Shutterstock, Freepik, Vecteezy,
  and iStock. Enforces 4K/8K high-resolution requirements (minimum 20MP, 5000-8000px longest side), sRGB IEC61966-2.1
  ICC color profiling, high-fidelity MozJPEG/Pillow compression (quality 92-95, zero banding), APP1 segment XMP/IPTC
  metadata injection, 100% crop inspection clarity, and anti-rejection safeguards.
---

# Microstock Raster Image & Illustration Standards

## 1. Core Purpose
Governs the generation, color management, compression, pre-flighting, and metadata embedding of commercial raster illustrations, 3D render plates, and vector preview images (JPEG, PNG) for top microstock marketplaces (Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock).

---

## 2. Resolution & Canvas Dimensions (Strict Mandate)

Stock agencies pay tiered royalties or rank higher based on native pixel resolution:

- **Minimum Resolution**: Minimum `4000 x 2250` px (~9 MP) or `4000 x 4000` px (16 MP).
- **Commercial Sweet Spot**: **`6000 x 3375` px to `8000 x 4500` px** (20–36 Megapixels).
  - Maximizes buyer utility (print-ready billboards, 4K/8K digital banners, packaging).
- **Aspect Ratios**:
  - `16:9` (`7680 x 4320` or `5760 x 3240`): Primary landscape wallpaper / presentation / banner format.
  - `1:1` (`5000 x 5000`): Social media, album art, icons, and packaging.
  - `4:3` / `3:2` (`6000 x 4000`): Editorial, print publication, and fine art posters.
  - `9:16` (`3240 x 5760`): Mobile wallpapers, TikTok/Reels backgrounds.
- **Pixel Aspect Ratio**: Strictly Square Pixels (`1.0`).

---

## 3. Color Management & ICC Profiles

Color shifting on stock contributor web previewers is a major cause of rejection:

- **Mandatory Color Space**: **sRGB IEC61966-2.1**.
  - NEVER deliver images in raw CMYK, Display P3, or uncalibrated Adobe RGB. Web browsers and agency thumbnail generators misinterpret CMYK and non-sRGB spaces, resulting in muddy, washed-out colors.
- **Embedded Profile**: Every JPEG must have the standard sRGB ICC profile embedded in its binary headers.
- **Bit Depth**: 8-bit per channel (`RGB24`).

---

## 4. Compression Fidelity & Gradient Dithering

Stock review algorithms use automated edge-detection and block-variance checkers:

- **Compression Quality**: **Quality 92–95** (MozJPEG or Pillow with `optimize=True`).
- **Subsampling**: Use `4:4:4` (zero chroma subsampling) whenever sharp hairline vectors or contrast edges are present.
- **Anti-Banding Mandate**:
  - Pure mathematical 8-bit gradients (`0–255`) produce visible stepping/banding in dark regions.
  - **Required Solution**: Add a subtle 16-bit to 8-bit Floyd-Steinberg dither or procedural micro-grain (`amplitude 0.5%–1.0%`) to all large gradient washes.
- **File Size Window**: Typically **5 MB to 25 MB** per 4K/8K JPEG. Never submit JPEGs exceeding 45 MB (fails agency HTTP uploader limits).

---

## 5. APP1 Segment Direct XMP & IPTC Metadata Injection

Every stock image must carry complete Dublin Core, Photoshop, and IPTC metadata embedded directly into the JPEG `APP1` marker (`http://ns.adobe.com/xap/1.0/\0`):

### Standard APP1 Packet Structure
```xml
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.1-c000 1.000000, 2023/01/01-00:00:00        ">
   <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
            xmlns:xmp="http://ns.adobe.com/xap/1.0/">
         <dc:format>image/jpeg</dc:format>
         <dc:title>
            <rdf:Alt>
               <rdf:li xml:lang="x-default">TITLE (100-125 chars)</rdf:li>
            </rdf:Alt>
         </dc:title>
         <dc:description>
            <rdf:Alt>
               <rdf:li xml:lang="x-default">DESCRIPTION</rdf:li>
            </rdf:Alt>
         </dc:description>
         <dc:subject>
            <rdf:Bag>
               <!-- 40-45 Singular Keywords -->
               <rdf:li>keyword 1</rdf:li>
               <rdf:li>keyword 2</rdf:li>
            </rdf:Bag>
         </dc:subject>
         <photoshop:Headline>TITLE</photoshop:Headline>
         <photoshop:Credit><Author Name></photoshop:Credit>
         <xmp:CreatorTool>Adobe Illustrator 30.6 (Windows)</xmp:CreatorTool>
      </rdf:Description>
   </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>
```

---

## 6. Pre-Flight Rejection Prevention Audit (100% Crop Inspection)

Inspect every rendered image at **100% magnification** (1:1 pixel scale) before batching:

1. **Edge Sharpness**: Lines and geometry must be crisp without pixelation or staircasing aliasing (use 4x multi-sample anti-aliasing during render).
2. **Zero Halos**: High-contrast edges must be free of sharpening rings or white fringing.
3. **Purity**: Zero digital noise, compression blockiness, or chromatic fringing in shadow regions.
4. **No Protected Elements**: Zero real-world brand logos, registered emblems, or watermarks.
5. **Generative AI Check**: Mark as **CGI / Digital Illustration**, NOT Generative AI.
