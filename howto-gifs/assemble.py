from PIL import Image
import subprocess, pathlib, imageio_ffmpeg, shutil

FPS = 14
NAMES = {1: "step-1-open-the-box", 2: "step-2-unwrap-it", 3: "step-3-sleep-on-it"}
HOLD = {1: 8, 2: 8, 3: 0}   # extra end frames so the final state reads before the loop cuts
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

for scene, name in NAMES.items():
    files = sorted(pathlib.Path("frames").glob(f"s{scene}_*.png"))
    frames = [Image.open(f).convert("RGB") for f in files]
    frames += [frames[-1]] * HOLD[scene]

    # GIF: flat vector art quantizes cleanly to a small palette.
    pal = [f.quantize(colors=24, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    pal[0].save(f"{name}.gif", save_all=True, append_images=pal[1:],
                duration=int(1000/FPS), loop=0, optimize=True, disposal=2)

    # MP4: same frames, for the section's Clip field.
    tmp = pathlib.Path(f"_mp4_{scene}")
    if tmp.exists(): shutil.rmtree(tmp)
    tmp.mkdir()
    for i, f in enumerate(frames):
        f.save(tmp / f"f{i:03d}.png")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-framerate", str(FPS),
                    "-i", str(tmp / "f%03d.png"), "-c:v", "libx264", "-preset", "slow",
                    "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-vf", "scale=600:600", f"{name}.mp4"], check=True)
    shutil.rmtree(tmp)

for p in sorted(pathlib.Path(".").glob("step-*")):
    print(f"{p.stat().st_size/1024:8.1f} KB  {p.name}")
