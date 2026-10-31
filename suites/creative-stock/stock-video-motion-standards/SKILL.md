---
name: stock-video-motion-standards
description: >-
  Microstock video motion graphics engineering and compliance standard for Adobe Stock Video, Shutterstock Footage,
  Pond5, and iStock (Getty). Enforces the 7 Golden Rules of commercial footage, 12s sweet spot (360 frames @ 30fps),
  lossless direct Adobe XMP UUID injection (be7acfcb-97a9-42e8-9c71-999491e3afac), QuickTime container metadata tags,
  H.264 High Profile progressive video, zero-audio tracks, and strict rejection prevention against low-bitrate/flat assets.
---

# Microstock Video Motion Engine & Compliance Standards

## 1. Core Purpose
Governs the creation, rendering, pre-flighting, direct metadata injection, and platform compliance of commercial stock video footage (MP4, MOV) destined for major microstock agencies (Adobe Stock, Shutterstock, Pond5, iStock).

---

## 2. Platform Compliance & Legal Classification

### Generative AI vs Procedural 3D CGI
- **Classification**: All procedural animations, mathematical simulations (NumPy/OpenCV), and 3D ray-traced renders (Blender Cycles/EEVEE) are **100% Computer Generated Imagery (CGI) / Motion Graphics**.
- **Zero Neural Models**: They do NOT use diffusion models, GANs, latent vectors, or prompt-to-video AI tools (Midjourney, Runway, Sora, Kling, Firefly).
- **Contributor Portal Action**:
  - Do **NOT** check "Created using generative AI tools" on Adobe Stock.
  - Do **NOT** submit as AI generated on Shutterstock (Shutterstock strictly bans contributor AI video).
  - Submit under **3D Animation / CGI / Motion Graphics** or **Abstract Backgrounds**.
  - No model release, property release, or AI disclosure is required.

---

## 3. The 7 Golden Rules for Commercial Footage (Ready-to-Use Out of the Box)

Top-selling stock video assets on Shutterstock, Adobe Stock, and Pond5 must look like finished, polished commercial b-roll immediately out of the box (drop-in ready for video editors without requiring color grading, stabilization, or relighting):

1. **Commercial Duration (20s–30s) & Unhurried Pacing**:
   - **Duration Standard**: **20.00s to 30.00s** (`600–900 frames @ 30fps`, or `480–720 frames @ 24fps`).
   - **Why 20–30s is the Industry Sweet Spot**: Professional editors cutting 15s or 30s broadcast commercials, corporate keynote backdrops, and product intros require sustained, unhurried footage that fits an entire timeline segment without looping seams.
   - **Pacing**: Hypnotic, calm cinematic cadence. Zero jerky rotation or rapid twitching. Camera tracking and object drifts glide at slow, majestic velocities with smooth trigonometric easing.
   - **Looping Math**: Perfectly phase-matched periodic harmonics (`omega = 2.0 * math.pi * frame / total_frames`). Frame 0 and the final frame match seamlessly with continuous momentum.

2. **Deep Physical Contact Shadows & Ambient Occlusion (AO)**:
   - Floating elements must never look like unanchored flat stickers in a void.
   - Angled soft Key light casting rich physical contact shadows onto backdrops and secondary surfaces.
   - World Ambient Occlusion (`distance=1.2m`, `factor=0.45`) emphasizing card seams, chamfers, and overlapping geometry.

3. **Dynamic Multi-Source Studio Lighting & Specular Rim Sweeps**:
   - **4-Point Rig**: Warm high-energy Key softbox, tinted cool Fill, high-angle grazing Rim, and subtle accent Kicker.
   - **Animated Light Sweeps**: Lights gently oscillate in space (5–10° sweep over 20–30s) so bright specular glints travel continuously along beveled edges.

4. **Multi-Layer Surface Reflections & Dual-Lobe PBR**:
   - **Outer Clear Coat**: High-gloss reflection (`Coat Weight=0.45`, `Coat Roughness=0.02`) mirroring studio softboxes.
   - **Internal Translucency/Transmission**: Refractive frosted body (`Transmission Weight=0.95`, `IOR=1.50`, `Roughness=0.14–0.22`).
   - **Micro-Tactile Normal Bump**: Subtle procedural glass surface normal perturbation (`strength=0.006`) preventing artificial CGI flatness.

5. **Tactile Textures & Internal Hardware Accents**:
   - High-end corporate stock requires authentic physical hardware and UI accents:
     - Geometric corner bevels (`segments=16`) and edge chamfers.
     - Metallic corner rivets/studs (Champagne Gold / Titanium Chrome).
     - Etched hairline inset borders (`0.5pt`) catching light at grazing angles.
     - Micro-surface roughness variation and anisotropic brushed metal maps.

6. **Animated Morphing Background Chromatics**:
   - Zero flat black void backgrounds. Background colored emitter orbs or subtle gradient meshes must weave organically behind foreground elements over the 20–30s loop.

7. **Cinematic 3D Camera Optics & Finished Color Grade**:
   - Commercial portrait focal lengths (`68mm – 85mm`).
   - Optical Depth-of-Field (`f/2.2 – f/2.8`, 9 diaphragm blades) producing creamy circular background bokeh discs.
   - Finished commercial color grade: AgX Punchy or Rec.709 with rich blacks, crisp highlight roll-off, and subtle optical glare/bloom. Drop-in ready out of the box.

---

## 3.1 The 4 Photographic Cinematography Overrides (Mandatory for Blender 3D Renders)

To ensure generated stock footage competes with top-selling commercial b-roll on Adobe Stock and Shutterstock, every Blender procedural generator must enforce 4 hard cinematic overrides:

1. **Photographic Lens & Optical Depth-of-Field (DoF)**:
   - Camera must use cinematic portrait focal lengths: **50mm or 85mm** (never extreme flat wide-angles).
   - Optical Depth-of-Field is mandatory: `cam_data.dof.use_dof = True`.
   - Set aperture between **f/1.8 and f/2.8** with **9 diaphragm blades** to create creamy circular background bokeh discs.
   - Explicitly track focus distance or focus object to the primary foreground hero element (`cam_data.dof.focus_distance` or `cam_data.dof.focus_object`).

2. **Large-Scale Studio Softbox Lighting Architecture**:
   - **Zero Point Lights**: Point lights cause harsh, artificial CG shadows and wash out surfaces.
   - **Massive Dominant Key Softbox**: Area light scaled large (**Size: 15m to 22m across**, Energy: **12,000W to 20,000W**), positioned at a 45° offset with a warm color temperature (~5500K / warm champagne).
   - **High-Intensity Grazing Rim Softbox**: Positioned behind the asset pointing toward camera (Size: **18m to 24m**, Energy: **18,000W to 25,000W**) to trace edges and separate foreground crests from dark backgrounds.
   - **Reflection Dome / World Fill**: Set World Background or HDRI shader strength to **0.20 to 0.35**. (Crucial: 100% metallic mirror surfaces like liquid gold or chrome reflect the world; an empty black world causes metallic objects to render pitch black).

3. **Motion Fluidity & 180° Physical Camera Shutter**:
   - **Physical Motion Blur**: Mandatory in Cycles:
     ```python
     scene.render.use_motion_blur = True
     scene.render.motion_blur_shutter = 0.5  # Emulates real 180-degree physical cinema camera shutter
     scene.render.motion_blur_position = 'CENTER'
     ```
   - **Directional Momentum & Trigonometric Easing**: Motion must have purposeful directional translation (traveling Gerstner waves, forward camera travel through space, relativistic Keplerian vortex) using smooth Bezier or harmonic trigonometric curves (`omega = 2.0 * math.pi * frame / total_frames`). Never use sudden linear starts or stationary robotic rotation.

4. **AgX Color Science & Highlight Roll-off**:
   - Always enforce `scene.view_settings.view_transform = 'AgX'` and `scene.view_settings.look = 'AgX - Punchy'`.
   - Protects specular highlights from clipping into blown-out flat white circles.

---

## 3.2 Composition & Production Quality Gates

1. **Full-Frame Immersion Standard (Strict Ban on Isolated Props)**:
   - Stock buyers require usable background b-roll for titles, UI, and video overlays.
   - **NEVER** render an isolated mechanical object or gadget (e.g. toy gyroscope, spinning floating prop) on a floor cove.
   - Elements must fill 100% of the 16:9 canvas (undulating liquid ocean, infinite perspective tunnel, cosmic accretion disk).
2. **Zero 2D Flat OpenCV**:
   - Never use `cv2.circle`, `cv2.line`, or 2D canvas drawing for microstock video suites. All stock footage must be 100% ray-traced PBR 3D in Blender Cycles OptiX.
3. **Anti-Monopoly / Distinct Style Archetypes**:
   - Never force all videos to share one aesthetic (e.g. synthwave neon grid). Maintain distinct visual worlds:
     - *Luxury Liquid Metal*: Anisotropic 24K gold and chrome ocean swells.
     - *Cinematic Deep Space*: Relativistic black hole accretion disks with Keplerian plasma spirals.
     - *High-Tech Computing*: Futuristic quantum data conduits with frosted glass HUD telemetry.
4. **Mandatory 4K Still Visual Verification**:
   - Before launching any multi-frame video render, always render a 4K master still and inspect it via image viewing tools (`view_file`). Never assume code works without visual verification.
5. **Strict Permanent Ban on Fake Bokeh Discs & Point-Cloud Approximations**:
   - **No Fake CoC Bokeh Discs ("Blurred Balls")**: Never draw 2D translucent bokeh disc overlays (`is_bokeh_orb=True`). They clutter the frame with dirty blobs and look amateurish.
   - **No Point-Cloud Replacements for Solid Geometry**: Never approximate solid objects (chips, grids, ribbons, crystals) using 1px–2px dots. Solid objects must use real 3D meshes with beveled chamfers and PBR materials.
6. **Environmental Background Standard (Ban on Flat `#000000` Void)**:
   - Floating elements must never exist in a pure pitch-black vacuum. All scenes must incorporate environmental depth: volumetric ambient light gradients (midnight navy, deep teal, amber), horizon glows, or reflective stage floor planes.
7. **CPU / iGPU Hardware Execution (Intel Core i5-12400 + UHD 730)**:
   - When no dedicated GPU is available, execute 100% via headless Blender 5.2 EEVEE (`scene.render.engine = 'BLENDER_EEVEE'`, `taa_render_samples = 16`, rendering in ~3.0s/frame) or Blender Workbench (`BLENDER_WORKBENCH`, 0.5s/frame).

---

## 4. Technical Video Encoding Specifications

All delivered stock video files must comply with:

- **Container**: MP4 (`.mp4`) or QuickTime (`.mov`).
- **Video Codec**: H.264 (`avc1`) High Profile, Level 4.2.
- **Pixel Format**: `yuv420p` (progressive scan, 8-bit).
- **Resolution**: Strictly **3840x2160** (4K UHD 16:9). 1080p Full HD is strictly deprecated across all video production pipelines per buyer demand (4K scales down, 1080p cannot).
- **Frame Rate**: Exactly `30.00 fps` Constant Frame Rate (CFR).
- **Bitrate Range**: 15.0 Mbps to 45.0 Mbps (CRF 17–18 for 4K). Never submit files under 8.0 Mbps for 4K (triggers automated sparsity/quality rejection).
- **Audio**: **Zero audio tracks** (`-an`). Silent audio tracks trigger quality rejections on Pond5 and Adobe Stock.

---

## 5. Direct In-File Adobe XMP Metadata Injection (Zero CSV)

Stock video assets must carry both official Adobe XMP RDF/XML metadata and standard QuickTime container atoms embedded directly inside the MP4 container:

### A. Official Adobe XMP UUID Box
Inside the MP4 container, write a top-level box of type `uuid` with extended type:
`BE 7A CF CB 97 A9 42 E8 9C 71 99 94 91 E3 AF AC`
Payload: UTF-8 serialized Adobe XMP packet:
```xml
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.1-c000 1.000000, 2023/01/01-00:00:00        ">
   <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
            xmlns:xmp="http://ns.adobe.com/xap/1.0/">
         <dc:format>video/mp4</dc:format>
         <dc:title>
            <rdf:Alt>
               <rdf:li xml:lang="x-default">TITLE</rdf:li>
            </rdf:Alt>
         </dc:title>
         <dc:description>
            <rdf:Alt>
               <rdf:li xml:lang="x-default">DESCRIPTION</rdf:li>
            </rdf:Alt>
         </dc:description>
         <dc:subject>
            <rdf:Bag>
               <rdf:li>keyword 1</rdf:li>
               <rdf:li>keyword 2</rdf:li>
            </rdf:Bag>
         </dc:subject>
         <photoshop:Headline>TITLE</photoshop:Headline>
         <photoshop:Credit><Author Name></photoshop:Credit>
         <xmp:CreatorTool>Adobe Media Encoder</xmp:CreatorTool>
      </rdf:Description>
   </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>
```

### B. QuickTime Container Atoms
Use `ffmpeg` lossless stream copy to write native metadata atoms (`title`, `description`, `comment`, `keywords`, `copyright`, `artist`):
```powershell
ffmpeg -i input.mp4 -metadata title="Title" -metadata description="Description" -metadata comment="Tags" -metadata keywords="Tags" -metadata copyright="<Author Name>" -metadata artist="<Author Name>" -codec copy output.mp4
```

---

## 6. Pre-Flight Rejection Prevention Checklist

Run this audit before uploading any batch of video assets:

1. **File Size Check**: Verify file size is `>= 1.5 MB` for 10s clips (sub-1MB files indicate empty or static frames).
2. **Motion Delta Check**: Inter-frame pixel delta must be `>= 5.0` (prevents "static image with minimal motion" rejection).
3. **Sharpness / Contrast Check**: Laplacian variance `>= 10.0` (prevents blurry/hazy rejection).
4. **Metadata Check**: Verify XMP UUID box is present in binary bytes (`uuid` search) and tags are readable via `ffprobe`.
5. **Portal Settings**:
   - Releases: Select **NO**.
   - Generative AI: Select **NO (Toggle OFF)**.
   - License: Select **Commercial**.
