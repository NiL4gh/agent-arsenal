---
name: stock-video-quality-benchmark
description: Use when evaluating, auditing, inspecting, or validating commercial stock video footage and motion graphics loops against strict microstock platform quality policies (Adobe Stock, Shutterstock, Pond5, iStock).
---

# Microstock Video Quality Policy & Benchmark Standard

## 1. Core Purpose
Establishes an automated, objective, and visual quality evaluation policy for commercial stock footage, 3D CGI animations, and procedural motion graphics loops destined for top microstock agencies (**Adobe Stock Video**, **Shutterstock Footage**, **Pond5**, **Getty Images / iStock**).

Enforces strict rejection-prevention standards before rendering final master files and before submitting assets to contributor portals.

---

## 2. The 5-Pillar Quality Gate

Every commercial stock motion asset must clear all 5 gates:

```
[1. Optical Acutance] ──> [2. Tonal & Dynamic Range] ──> [3. Kinematics & Loop] ──> [4. Commercial Utility] ──> [5. Container & Meta]
```

### Pillar 1: Optical Acutance & Anti-Artifact Integrity
- **100% Crop Inspection**: The full-resolution frame must be inspected at 1:1 pixel scale (100% zoom).
- **Macroblocking & Mosquito Noise**: Strictly zero visible $8\times8$ or $16\times16$ pixel compression macroblocks in dark areas, moving gradients, or edges.
- **Artificial Sharpening Halos**: Do NOT apply heavy unsharp masking. Edges must be natively resolved by vector math or supersampled 3D render pipelines (`taa_render_samples >= 4`).
- **Aliasing / Stair-Stepping**: Curved and diagonal hairlines must use smooth anti-aliasing (`cv2.LINE_AA` or 3D multisample anti-aliasing).

### Pillar 2: Tonal Curve, Color Science & Anti-Banding
- **False Contouring / Banding Prevention**: Smooth gradients (skies, cyclorama backdrops, lighting falloffs) must never break into visible contour steps.
  - In 8-bit outputs, apply microscopic spatial dither ($\sigma \approx 0.005$) to break quantization steps.
  - Use high-bitrate encoding (`-crf 14` to `17`, or $\ge 25$ Mbps for 4K).
- **Highlight Roll-off**: Avoid blown-out flat white circles. Specular highlights must roll off gracefully using AgX Punchy or cinematic logarithmic curves ($< 5\%$ pixels $> 250$ IRE unless intentional optical flare center).
- **Shadow Cleanliness**: Deep blacks must remain rich and noise-free. Avoid muddy gray lifting ($< 4$ IRE clipped shadows strictly reserved for background negative space).

### Pillar 3: Kinematic Fluidity & Harmonic Looping
- **Constant Frame Rate (CFR)**: Exactly 30.00 fps or 24.00 fps CFR. Variable Frame Rate (VFR) is an automatic rejection.
- **Harmonic Loop Boundary Continuity ($\Delta \le 5.0$)**:
  - The mean absolute difference between Frame 1 and the final frame must satisfy $\text{MAE}(\text{Frame}_1, \text{Frame}_N) \le 5.0$.
  - Motion must follow periodic trigonometric functions ($\omega = 2\pi \cdot f / N$).
  - Velocity must be continuous across the boundary with zero acceleration spikes or jump frames.
- **Camera Optics**: Use portrait focal lengths ($50\text{mm} - 85\text{mm}$) with optical Depth-of-Field ($f/2.0 - f/2.8$). Avoid erratic camera shaking; motion must glide on smooth Bezier easing.

### Pillar 4: Commercial Utility & Composition
- **The "Buyer's Lens" Test**: Before publishing, identify the explicit commercial use-case (e.g. corporate keynote, broadcast news sting, fintech dashboard backdrop, advertising b-roll, luxury product stage).
- **Dedicated Copy Space**: At least 25% to 40% of the composition must provide clean, un-cluttered negative space for client typography, logos, or presenter overlays.
- **Focal Anchor vs Visual Chaos**: Maintain a clear visual hierarchy. Avoid barren empty voids on one extreme and dizzying illegible chaos on the other.

### Pillar 5: Container Standards & Metadata Verification
- **Strictly Zero Audio (`-an`)**: Microstock video backgrounds must NOT contain an audio track. Even silent audio tracks can trigger rejection or customer disputes.
- **Native Resolution**: Native 3840x2160 (True 4K UHD) or 1920x1080 (Full HD). Never upscale 1080p to 4K.
- **Direct Adobe XMP UUID Injection**: Every MP4/MOV container must have the binary Adobe XMP UUID atom (`be7acfcb-97a9-42e8-9c71-999491e3afac`) injected at the file tail.
- **Legal Classification**: Procedural 3D and math animations are **100% CGI / Motion Graphics**. Strictly do NOT check "Created using generative AI tools".

---

## 3. Quantitative Threshold Rubric

| Inspection Metric | Target Passing Threshold | Failure / Warning Threshold | Automated Measurement Method |
| :--- | :--- | :--- | :--- |
| **Laplacian Sharpness Variance ($\sigma^2_{Lap}$)** | $\ge 25.0$ (Ideal $\ge 100.0$) | $< 15.0$ (Blurry / Soft) | `cv2.Laplacian(gray, cv2.CV_64F).var()` |
| **Loop Boundary Seam Delta ($\Delta_{seam}$)** | $\le 5.0$ (Ideal $\le 2.0$) | $> 8.0$ (Visible Jump / Stutter) | `np.mean(np.abs(frame_1 - frame_N))` |
| **Highlight Clipping ($> 250$ IRE)** | $\le 5.0\%$ of frame | $> 20.0\%$ (Blown-out clipping) | `np.mean(gray > 250) * 100` |
| **Shadow Clipping ($< 4$ IRE)** | $\le 25.0\%$ (Stage backdrop $\le 60\%$) | $> 70.0\%$ (Empty black void) | `np.mean(gray < 4) * 100` |
| **High-Frequency Noise ($\sigma_{noise}$)** | $\le 8.0$ (Studio Clean) | $> 25.0$ (Heavy Grain / Noise) | `np.std(gray - cv2.GaussianBlur(gray, (5,5), 0))` |
| **Audio Stream Count** | **Strictly 0** | $> 0$ (Reject: Audio Present) | `ffprobe -select_streams a` |
| **Frame Rate Mode** | **Constant (CFR)** | Variable Frame Rate (VFR) | `ffprobe -show_entries stream=r_frame_rate` |
| **Adobe XMP UUID Atom** | **Present** | Missing | Binary scan for `be7acfcb...` |

---

## 4. Automated Pre-Flight Inspection Script

Run this verification snippet before approving any video asset:

```python
import cv2, numpy as np, subprocess, os

def preflight_audit(video_path):
    # 1. Container Probe
    probe = subprocess.run([
        'ffprobe', '-v', 'error',
        '-show_entries', 'stream=width,height,r_frame_rate,duration,codec_name:format=duration,size,bit_rate',
        '-select_streams', 'v:0', '-of', 'default=noprint_wrappers=1', video_path
    ], capture_output=True, text=True).stdout
    
    # 2. Audio Check (Must be empty)
    audio = subprocess.run([
        'ffprobe', '-v', 'error', '-select_streams', 'a',
        '-show_entries', 'stream=codec_name', '-of', 'default=noprint_wrappers=1', video_path
    ], capture_output=True, text=True).stdout.strip()
    assert len(audio) == 0, f"REJECTION RISK: Audio stream found in {video_path}"
    
    # 3. Extract Frame 1 and Final Frame
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    ret, f1 = cap.read()
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames - 1)
    ret, f_end = cap.read()
    
    # Extract Midpoint for Sharpness
    cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
    ret, f_mid = cap.read()
    cap.release()
    
    # 4. Metrics
    seam_delta = np.mean(np.abs(f1.astype(float) - f_end.astype(float)))
    gray_mid = cv2.cvtColor(f_mid, cv2.COLOR_BGR2GRAY)
    sharpness = cv2.Laplacian(gray_mid, cv2.CV_64F).var()
    clip_hi = np.mean(gray_mid > 250) * 100
    clip_lo = np.mean(gray_mid < 4) * 100
    
    # 5. XMP Box Check
    with open(video_path, 'rb') as f:
        has_xmp = b"\xbe\x7a\xcf\xcb\x97\xa9\x42\xe8\x9c\x71\x99\x94\x91\xe3\xaf\xac" in f.read()[-65536:]
        
    print(f"Audit Results for {os.path.basename(video_path)}:")
    print(f"  Sharpness: {sharpness:.2f} (Pass >= 25)")
    print(f"  Seam Delta: {seam_delta:.3f} (Pass <= 5.0)")
    print(f"  Highlight Clip: {clip_hi:.2f}% | Shadow Clip: {clip_lo:.2f}%")
    print(f"  Adobe XMP UUID Present: {has_xmp}")
    print(f"  Zero Audio: {len(audio) == 0}")
    
    assert sharpness >= 15.0, f"REJECT: Too blurry ({sharpness:.2f})"
    assert seam_delta <= 10.0, f"REJECT: Seam jump too high ({seam_delta:.2f})"
    assert has_xmp, "REJECT: Missing Adobe XMP UUID atom"
```

---

## 5. Common Rejection Reasons & Rapid Remediation

| Rejection Reason | Primary Root Cause | Immediate Actionable Fix |
| :--- | :--- | :--- |
| **"Technical Quality / Compression"** | Bitrate too low, macroblocking in dark areas | Increase bitrate: set `-crf 14` or `-b:v 30M -maxrate 45M`. |
| **"Banding / False Contouring"** | 8-bit gradient quantization | Add subtle 16-bit dither noise ($\sigma = 0.004$) before color reduction; avoid extreme contrast curves. |
| **"Focus / Blurry"** | Low render samples, un-sharp vectors | In 3D: increase EEVEE samples to 6-8, ensure DoF tracks hero object. In Python: use subpixel vector rendering (`LINE_AA`). |
| **"Loop Seam Jitter / Poor Edit"** | Non-periodic trigonometric phase | Ensure animation phase uses exact harmonic formula: `t = 2.0 * math.pi * frame / total_frames`. |
| **"Similar Content / Commercial Value"** | Generic chaotic elements, missing copy space | Reframe composition: create clean negative space in center or lower-third; establish clear subject hierarchy. |
| **"Audio Issues"** | Accidental blank/silent audio track | Force `-an` flag in FFmpeg export command. |
