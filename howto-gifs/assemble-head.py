from PIL import Image
import subprocess, pathlib, imageio_ffmpeg, shutil

FPS, HOLD, NAME = 14, 10, "head-on-pilo"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

files = sorted(pathlib.Path("frames-head").glob("h_*.png"))
frames = [Image.open(f).convert("RGB") for f in files]
frames += [frames[-1]] * HOLD          # hold on the resting pose before the loop cuts

pal = [f.quantize(colors=24, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
pal[0].save(f"{NAME}.gif", save_all=True, append_images=pal[1:],
            duration=int(1000/FPS), loop=0, optimize=True, disposal=2)

tmp = pathlib.Path("_mp4_head")
if tmp.exists(): shutil.rmtree(tmp)
tmp.mkdir()
for i, f in enumerate(frames):
    f.save(tmp / f"f{i:03d}.png")
subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-framerate", str(FPS),
                "-i", str(tmp / "f%03d.png"), "-c:v", "libx264", "-preset", "slow",
                "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-vf", "scale=600:600", f"{NAME}.mp4"], check=True)
shutil.rmtree(tmp)

for p in sorted(pathlib.Path(".").glob(f"{NAME}.*")):
    print(f"{p.stat().st_size/1024:8.1f} KB  {p.name}")
