# Bag back-panel footer

Two worked examples of the strip that carries the Instagram handle, plus everything
else that belongs down there. `bag-footer.png` is the render; `bag-footer.html` is the
source — open it in a browser and edit the text directly.

Colours and type are the live theme's: primary `#35608F`, ink `#2c3845`, muted
`#5c6b7d`, panel `#F4F6F9`, Assistant for headings, Cabin for text.

## A — minimal

One centred line: `piloshop.com · ⌾ @shop.pilo · WhatsApp +961 …`

Use it if the bag is printed one colour, or if a separate hang tag or insert card
already carries the certification and warning text.

## B — recommended

A three-part row, then the marks, then the warning. It fits in about 55 mm of panel
height and it is the version that survives a compliance check.

## The rules that matter more than the layout

**Stay off the seal.** The bottom of a poly bag is heat-welded. Keep every element at
least 10–15 mm clear of the seal, any fold and any gusset crimp. Ask the printer for
the dieline before committing — the safe area is usually marked on it.

**Minimum type size.** Nothing below about 6 pt. The warning line in B sits near that
floor; if the bag is small, drop the copyright rather than shrinking the warning.

**The OEKO-TEX block is a placeholder.** You cannot set that lock-up yourself. The mark
has to carry your certificate number and the issuing institute, in the artwork they
supply. Ask your certifier for the print files and use those exactly.

**The recycling triangle is a placeholder too.** The resin code must match what the bag
is actually made of — the printer or bag supplier will tell you. `04` in the example is
LDPE, the usual choice for this kind of bag, but confirm it.

**Fill in before printing:** the WhatsApp number, country of origin, certificate number
and institute, and the resin code.

## Worth deciding first

`@shop.pilo` under a logo that reads `pilo` is a small mismatch. If a cleaner handle is
free, change it before the bags are printed — it costs nothing now and it is expensive
once a print run and a following exist.

If you add a QR code, add exactly one, and point it at a redirect on `piloshop.com`
rather than a raw Instagram URL, so the destination can be changed without reprinting.

## Regenerating

```bash
python3 - <<'PY'
from playwright.sync_api import sync_playwright
import pathlib
d = pathlib.Path('.').resolve()
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1270, "height": 1180}, device_scale_factor=2)
    pg.goto((d / "bag-footer.html").as_uri())
    pg.wait_for_timeout(2500)
    pg.set_viewport_size({"width": 1270, "height": pg.evaluate("document.body.scrollHeight") + 20})
    pg.screenshot(path="bag-footer.png")
    b.close()
PY
```

This is a layout study, not print-ready artwork. Final files should go to your printer
as vector (AI/PDF) at the bag's real dimensions, in CMYK or spot colour, with the
dieline on its own layer.
