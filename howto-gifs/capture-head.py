from playwright.sync_api import sync_playwright
import pathlib, shutil

FRAMES, OUT = 36, pathlib.Path("frames-head")
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir()
d = pathlib.Path('.').resolve()

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 640, "height": 640})
    pg.goto((d / "head-scene.html").as_uri())
    for i in range(FRAMES):
        pg.evaluate(f"window.render({i/FRAMES})")
        pg.locator(".stage").screenshot(path=str(OUT / f"h_{i:03d}.png"))
    b.close()
print(f"{FRAMES} frames")
