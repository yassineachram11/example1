from playwright.sync_api import sync_playwright
import pathlib, shutil

FRAMES, OUT = 36, pathlib.Path("frames")
if OUT.exists(): shutil.rmtree(OUT)
OUT.mkdir()
d = pathlib.Path('.').resolve()

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 640, "height": 640})
    pg.goto((d / "scenes.html").as_uri())
    for scene in (1, 2, 3):
        for i in range(FRAMES):
            pg.evaluate(f"window.render({scene}, {i/FRAMES})")
            pg.locator(".stage").screenshot(path=str(OUT / f"s{scene}_{i:03d}.png"))
        print(f"scene {scene}: {FRAMES} frames")
    b.close()
