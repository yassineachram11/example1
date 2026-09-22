from playwright.sync_api import sync_playwright
import pathlib
d = pathlib.Path('.').resolve()
W, H = 460, 610  # mm, incl. 5mm bleed
jobs = [("front","pilo-mailer-front"),("back","pilo-mailer-back"),
        ("front-reverse","pilo-mailer-front-white-on-navy"),("back-annotated","pilo-mailer-back-ANNOTATED")]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 1740, "height": 2300})
    for src, name in jobs:
        pg.goto((d / f"{src}.html").as_uri())
        pg.wait_for_timeout(200)
        pg.pdf(path=f"{name}.pdf", width=f"{W}mm", height=f"{H}mm",
               print_background=True, margin={"top":"0","bottom":"0","left":"0","right":"0"})
        el = pg.locator(".sheet")
        el.screenshot(path=f"{name}.png")
    b.close()
print("done")
