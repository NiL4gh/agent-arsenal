---
name: video-director
description: >-
  Master autonomous video director and editor for social media ads, reels, shorts, and marketing clips.
  Use when the user asks to edit, compose, assemble, cut, trim, sync captions, or produce video footage from raw assets, AI clips, or scripts.
  Enforces the 5-phase protocol (Asset Audit, EDL Blueprint, Bespoke Remotion Assembly, Zero-Trust Multi-Modal Frame Check, and Hardware-Accelerated NVENC Render).
  Bans crude raw FFmpeg concatenation, desynced talking-head voiceovers, and unverified exports.
---

# Video Director & Autonomous Editor Engine

## 1. Core Philosophy
- **Bespoke Over Templates**: Every video has unique narrative, assets, music, pacing, and mood. Never force rigid cookie-cutter templates. Build a custom timeline specifically for the clips at hand.
- **Code-as-Video (Remotion)**: Edit videos using declarative React + TypeScript (`remotion`). Timeline math, spring physics, pan-and-zoom keyframes, transitions, and audio ducking are expressed cleanly in code.
- **Zero-Trust Multi-Modal Verification**: Never claim a video is finished without rendering key still frames and visually inspecting them using vision tools.

---

## 2. The 5-Phase Production Standard

Every video editing request MUST proceed through these 5 sequential phases:

### Phase 1: Ingestion & Asset Audit
Before proposing cuts or writing code, inspect the raw assets:
1. **Probe Media Metrics**:
   Run `ffprobe` to determine exact resolution, aspect ratio, duration, and frame rate:
   ```powershell
   ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of json "path\to\clip.mp4"
   ```
2. **Word-Level Audio Transcription**:
   If there is existing speech or voiceover, extract word-level millisecond timestamps using the local Whisper engine:
   ```powershell
   python "$env:VIDEO_ENGINE_DIR\scripts\transcribe.py" "path\to\audio_or_video.mp4" --output "words.json"
   ```
3. **Voiceover Generation (if needed)**:
   If generating synthetic speech, use the local Edge-TTS utility:
   ```powershell
   python "$env:VIDEO_ENGINE_DIR\scripts\generate_voice.py" "script text" --voice "en-US-GuyNeural" --output "voiceover.mp3"
   ```

### Phase 2: Edit Decision List (EDL) Proposal
Present a clear, human-readable timeline plan to the user before assembling:
- **Hook (0.0s – 3.0s)**: Opening clip, punch-in framing, high-contrast hook text.
- **Narrative Arc**: Shot sequence, exact in/out trim points (e.g. `02.5s – 06.2s`), cut-on-action transitions.
- **Audio Architecture**: Primary voiceover level (e.g. `0dB`), background music level (e.g. `-18dB`), and dynamic ducking points (ducking music to `-26dB` during active speech).
- **Typographic Hierarchy**: Font family, color palette, subtitle highlight animation style.

### Phase 3: Bespoke Code Assembly
Implement the timeline in a dedicated Remotion `.tsx` composition:
- Use `<Sequence>` with explicit `from` and `durationInFrames`.
- Use `interpolate()` and `spring()` for smooth velocity curves (no linear/stiff motion).
- Align word highlights directly to the Whisper `words.json` millisecond timestamps.
- Apply pan-and-scan camera drift to static or slow clips to maintain viewer retention.

### Phase 4: Zero-Trust Multi-Modal Frame Check
Extract still frames at critical inflection points and visually inspect them:
```powershell
npx remotion still CompositionName out_frame_hook.png --frame=45
npx remotion still CompositionName out_frame_mid.png --frame=180
npx remotion still CompositionName out_frame_cta.png --frame=360
```
Inspect with vision tools to verify:
- **Platform Safe Zones**: Captions and headlines must remain clear of bottom reels/shorts UI (bottom 250px) and top headers (top 150px).
- **Legibility & Contrast**: Text must have adequate drop shadows or backing cards against bright footage.
- **Visual Cadence**: Ensure no accidental black frames or awkward freeze frames between cuts.

### Phase 5: Hardware-Accelerated NVENC Render
Execute the final production export:
```powershell
npx remotion render CompositionName output.mp4 --codec=h264 --crf=18
```
Verify the output file exists, has a non-zero size, and matches the target duration.

---

## 3. Strict Prohibitions & Anti-Patterns

1. **NO Crude FFmpeg Concat**:
   - NEVER stitch raw AI clips together using `ffmpeg -filter_complex concat` with hard cuts and basic text overlays. All video assembly must happen via Remotion or professional easing engines.
2. **NO Desynced Talking Heads**:
   - If AI footage depicts a person speaking, NEVER overlay an unrelated voiceover unless their mouth is obscured, cut away, or cut to b-roll. If voiceover language/cadence does not match the footage, replace the talking head with procedure/product b-roll.
3. **NO Blind Exports**:
   - NEVER declare an edit finished without extracting and verifying still frames.
4. **NO Stiff Monotone Voiceovers**:
   - Always adjust rate and pitch (e.g., `rate="+5%"`) when using Edge-TTS to eliminate robotic drawl.

---

## 4. Platform Specifications (9:16 Vertical)
- **Canvas**: 1080 x 1920 px (30 fps or 60 fps).
- **Title Safe Margins**: Top: 200px, Bottom: 350px, Sides: 80px.
- **Font Sizing**: Headlines: 56–72px bold; Subtitles/Captions: 40–52px semibold.
