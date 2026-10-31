---
name: blender-motion-graphics
description: >-
  Use when creating, scripting, or rendering 3D stock motion graphics, background video loops, procedural materials,
  or lighting setups using headless Blender (bpy) with Cycles OptiX or EEVEE on Windows. Covers Blender 5.2 API changes,
  CompositorNodeTree, Principled BSDF v2, 4-point studio lighting, periodic looping math, and the PNG-to-FFmpeg pipeline.
---

# Headless Blender 5.2 3D Motion Graphics Engineering

## 1. Environment & Execution
- **Blender Path**: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`
- **GPU Accelerator**: NVIDIA GeForce RTX 3060 (OptiX / CUDA)
- **Execution Command**:
  ```powershell
  & "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --python "path\to\generator.py"
  ```

---

## 2. Critical Blender 5.2 API Specifics & Pitfalls

### A. Missing Internal FFmpeg (`build_options.ffmpeg = False`)
In Blender 5.2.2 LTS on Windows, `bpy.app.build_options.ffmpeg` is `False`. Setting `scene.render.image_settings.file_format = 'FFMPEG'` causes a fatal runtime crash.
- **Solution**: Always render frames as high-speed PNG image sequence into `%TEMP%`, then invoke external `ffmpeg.exe` to encode the final H.264 High Profile MP4:
  ```python
  # In Python script
  temp_dir = os.path.join(tempfile.gettempdir(), f"render_{uuid4().hex[:8]}")
  os.makedirs(temp_dir, exist_ok=True)
  scene.render.filepath = os.path.join(temp_dir, "frame_#####.png")
  bpy.ops.render.render(animation=True)
  
  # External FFmpeg encode
  ffmpeg_cmd = [
      FFMPEG, "-y", "-framerate", "30",
      "-i", os.path.join(temp_dir, "frame_%05d.png"),
      "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-crf", "17", "-preset", "slow", "-an",
      final_video_path
  ]
  subprocess.run(ffmpeg_cmd, check=True)
  shutil.rmtree(temp_dir)
  ```

### B. Compositor Architecture in Blender 5.2
The legacy `scene.use_nodes = True` is deprecated in Blender 5.2. Instead, create a `CompositorNodeTree` node group:
```python
tree = bpy.data.node_groups.new("PostCompositor", "CompositorNodeTree")
scene.compositing_node_group = tree

rl = tree.nodes.new("CompositorNodeRLayers")
comp = tree.nodes.new("CompositorNodeComposite")

# Glare Bloom
glare = tree.nodes.new("CompositorNodeGlare")
glare.inputs["Type"].default_value = "Bloom"   # Use input socket, not glare.glare_type
glare.inputs["Quality"].default_value = "High"

tree.links.new(rl.outputs["Image"], glare.inputs["Image"])
tree.links.new(glare.outputs["Image"], comp.inputs["Image"])
```

### C. World Ambient Occlusion (AO)
Do **NOT** use `world.light_settings.use_ambient_occlusion = True` (attribute does not exist). Use:
```python
world.light_settings.ao_factor = 0.45
world.light_settings.distance = 1.2
```

### D. Principled BSDF v2 Socket Names
Blender 5.2 uses Principled BSDF v2:
- Transmission: `bsdf.inputs['Transmission Weight'].default_value = 0.95`
- Clear Coat: `bsdf.inputs['Coat Weight'].default_value = 0.45`, `bsdf.inputs['Coat Roughness'].default_value = 0.02`
- Thin Film: `bsdf.inputs['Thin Film Thickness'].default_value = 420.0`, `bsdf.inputs['Thin Film IOR'].default_value = 1.33`

---

## 3. OptiX Ray Tracing & Performance Optimization

To render 360 frames (12s @ 30fps) within 25–35 minutes on an RTX 3060:
```python
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'
prefs.get_devices()
for d in prefs.devices:
    d.use = (d.type == 'OPTIX')

# Resolution: Strict 4K UHD Standard
scene.render.resolution_x = 3840
scene.render.resolution_y = 2160
scene.render.resolution_percentage = 100

# Sampling & Denoising
scene.cycles.samples = 16          # 16 samples + OptiX AI denoiser gives clean broadcast frames
scene.cycles.preview_samples = 8
scene.cycles.use_denoising = True
scene.cycles.denoiser = 'OPTIX'
scene.cycles.denoising_input_passes = 'RGB_ALBEDO_NORMAL'

# Ray Bounces
scene.cycles.max_bounces = 8
scene.cycles.diffuse_bounces = 3
scene.cycles.glossy_bounces = 4
scene.cycles.transmission_bounces = 6
scene.cycles.volume_bounces = 2
```

---

## 4. 4-Point Commercial Studio Lighting Setup

Never use default point lights. A commercial stock lighting rig requires:

```python
def setup_studio_lighting():
    # 1. Key Softbox: Warm champagne, casts contact shadows
    key = create_area_light("Key_Softbox", energy=1200, size=(2.5, 1.8), color=(1.0, 0.96, 0.90))
    key.location = (2.2, -3.2, 2.5)

    # 2. Cool Fill: Soft cyan, lifts deep shadows
    fill = create_area_light("Fill_Softbox", energy=400, size=(3.0, 3.0), color=(0.75, 0.88, 1.0))
    fill.location = (-3.5, -2.5, 1.2)

    # 3. Rim Grazing Light: High angle, creates travelling specular chamfer glints
    rim = create_area_light("Rim_Light", energy=1800, size=(4.0, 0.3), color=(0.85, 0.95, 1.0))
    rim.location = (0.0, 3.8, 3.2)

    # 4. Accent Kicker: Warm gold, emphasizes bevel corners
    kicker = create_area_light("Kicker_Light", energy=600, size=(1.0, 1.0), color=(1.0, 0.80, 0.50))
    kicker.location = (-2.8, 1.5, -1.0)
```

---

## 5. Phase-Matched Periodic Looping Math (20s–30s Sweet Spot)

Every animated parameter (location, rotation, light angle, material roughness) must use harmonic trigonometric functions so Frame 0 matches the final frame seamlessly:

- **20.00s Standard**: `600 frames @ 30fps` (or `480 frames @ 24fps`)
- **30.00s Standard**: `900 frames @ 30fps` (or `720 frames @ 24fps`)

```python
def get_periodic_phase(frame_idx, total_frames=600):
    omega = 2.0 * math.pi / total_frames
    t = frame_idx * omega
    return {
        "sin_1x": math.sin(t),
        "cos_1x": math.cos(t),
        "sin_2x": math.sin(2.0 * t),
        "cos_2x": math.cos(2.0 * t),
        "sin_3x": math.sin(3.0 * t),
    }

# Example: Animate floating card tilt and translation with calm, unhurried ease
def update_card_motion(card_obj, frame_idx, total_frames=600):
    p = get_periodic_phase(frame_idx, total_frames)
    card_obj.location.z = base_z + 0.10 * p["sin_1x"]
    card_obj.rotation_euler.x = base_rx + math.radians(3.0) * p["cos_1x"]
    card_obj.rotation_euler.y = base_ry + math.radians(2.5) * p["sin_2x"]
    card_obj.keyframe_insert("location", frame=frame_idx)
    card_obj.keyframe_insert("rotation_euler", frame=frame_idx)
```

---

## 5B. Dual Render Engine Strategy: Cycles OptiX vs EEVEE Next

For 20s–30s footage (600–900 frames), choose the engine matching the physical material requirements:

1. **Cycles OptiX (Photoreal Refraction & Physical Caustics)**:
   - Use for: Frosted glassmorphism, transparent fluid caustics, prism dispersion.
   - RTX 3060 Performance: ~4.5s/frame @ 16 samples OptiX AI Denoise → ~45 min for 600 frames (20s).
2. **EEVEE (Blender 5.2 LTS Realtime Raytracing & CPU/iGPU Turnaround)**:
   - Use for: Anisotropic chrome metals, cyber neon grids, stage spotlights, geometric topography, beveled honeycomb grids.
   - **Critical Enum Name**: In Blender 5.2.2 LTS, the engine name is strictly `'BLENDER_EEVEE'` (NOT `'BLENDER_EEVEE_NEXT'`).
   - Configuration in Blender 5.2:
     ```python
     scene.render.engine = 'BLENDER_EEVEE'
     scene.eevee.taa_render_samples = 16    # 8-16 samples gives clean frames on CPU/iGPU
     scene.eevee.use_shadows = True
     ```
   - **Performance on Intel Core i5-12400 + UHD 730 (No Dedicated GPU)**:
     - 1080p: ~2.7s / frame (~16 min for 360 frames).
     - 4K UHD: ~3.0s – 4.1s / frame (~18–24 min for 360 frames).
   - **Blender Workbench (`BLENDER_WORKBENCH`)**:
     - 4K UHD: **0.51s / frame** (~3 min for 360 frames). Ideal for crisp orthogonal wireframe tunnels and geometric data conduits.

---

## 6. Procedural PBR Material Blueprints

### A. Frosted Glassmorphism with Bevel Normal Perturbation
```python
# Principled BSDF v2
bsdf.inputs["Base Color"].default_value = (0.95, 0.98, 1.0, 1.0)
bsdf.inputs["Roughness"].default_value = 0.16
bsdf.inputs["IOR"].default_value = 1.52
bsdf.inputs["Transmission Weight"].default_value = 0.98
bsdf.inputs["Coat Weight"].default_value = 0.50
bsdf.inputs["Coat Roughness"].default_value = 0.02
bsdf.inputs["Thin Film Thickness"].default_value = 420.0
bsdf.inputs["Thin Film IOR"].default_value = 1.33

# Micro-Bump Procedural Texture
tex_noise = nodes.new("ShaderNodeTexNoise")
tex_noise.inputs["Scale"].default_value = 85.0
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.006
links.new(tex_noise.outputs["Fac"], bump.inputs["Height"])
links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
```

### B. Champagne Gold Corner Rivet Metal
```python
bsdf.inputs["Base Color"].default_value = (0.92, 0.78, 0.52, 1.0)  # Champagne Gold
bsdf.inputs["Metallic"].default_value = 1.0
bsdf.inputs["Roughness"].default_value = 0.08
bsdf.inputs["Anisotropic"].default_value = 0.35
```

---

## 7. Cinematic Camera & Optics Setup
```python
cam_data = bpy.data.cameras.new("CinemaCamera")
cam_data.lens = 85.0                    # 85mm Portrait Focal Length
cam_data.dof.use_dof = True
cam_data.dof.focus_target = focus_target_obj
cam_data.dof.aperture_fstop = 2.4       # Creamy circular bokeh discs
cam_data.dof.aperture_blades = 9        # 9-blade cinema aperture iris
```

