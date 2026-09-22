"""Generates print artwork for Pilo Shop shipping mailers.

Everything is laid out in real millimetres so the browser can emit a 1:1 PDF.
"""
import qrcode, pathlib

TRIM_W, TRIM_H = 450, 550      # mm, printable body of the mailer
FLAP = 60                       # mm, seal flap (folds onto the back)
BLEED = 5                       # mm on every edge
SAFE = 20                       # mm keep-out from trim

NAVY = "#101F35"
WHITE = "#FBFAF7"

def qr_svg(data, modules_px=1.0):
    q = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=0)
    q.add_data(data); q.make(fit=True)
    m = q.get_matrix()
    n = len(m)
    rects = "".join(
        f'<rect x="{x}" y="{y}" width="1.02" height="1.02"/>'
        for y, row in enumerate(m) for x, v in enumerate(row) if v
    )
    return f'<svg viewBox="0 0 {n} {n}" xmlns="http://www.w3.org/2000/svg" fill="currentColor">{rects}</svg>', n

QR, QR_N = qr_svg("https://piloshop.com")

STEP_ICONS = {
 "box": '<path d="M4 14 L32 6 L60 14 L60 46 L32 56 L4 46 Z"/><path d="M4 14 L32 24 L60 14"/><path d="M32 24 L32 56"/>',
 "unwrap": '<path d="M8 40 C8 22 20 14 32 14 C44 14 56 22 56 40 C56 48 46 50 32 50 C18 50 8 48 8 40 Z"/><path d="M18 38 C24 30 40 30 46 38"/>',
 "sleep": '<path d="M48 22 A17 17 0 1 0 54 42 A13 13 0 0 1 48 22 Z"/><path d="M6 13 H18 L6 24 H18" stroke-width="2.6"/>',
}

def icon(name):
    return (f'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" '
            f'stroke-linecap="round" stroke-linejoin="round">{STEP_ICONS[name]}</svg>')

STEPS = [("box", "Open the box", "It ships compressed, so it looks smaller than you expect."),
         ("unwrap", "Unwrap it", "Cut the seal and let it breathe until it reaches full shape."),
         ("sleep", "Sleep on it", "Give it three nights. Your neck needs a few to adjust.")]

def steps_html():
    return "".join(f'''
      <div class="step">
        <div class="step-ico">{icon(k)}</div>
        <div class="step-n">{i+1}</div>
        <div class="step-t">{t}</div>
        <div class="step-x">{x}</div>
      </div>''' for i, (k, t, x) in enumerate(STEPS))

CSS = f"""
@page {{ size: {TRIM_W + 2*BLEED}mm {TRIM_H + FLAP + 2*BLEED}mm; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ background: #fff; }}
body {{ font-family: "Liberation Sans", Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.sheet {{
  position: relative; overflow: hidden;
  width: {TRIM_W + 2*BLEED}mm; height: {TRIM_H + FLAP + 2*BLEED}mm;
  background: {WHITE}; color: {NAVY};
}}
.sheet.reverse {{ background: {NAVY}; color: {WHITE}; }}
.art {{ position: absolute; left: {BLEED}mm; top: {BLEED}mm; width: {TRIM_W}mm; height: {TRIM_H + FLAP}mm; }}
.flap {{ position: absolute; left: 0; top: 0; width: 100%; height: {FLAP}mm; }}
.panel {{ position: absolute; left: 0; top: {FLAP}mm; width: 100%; height: {TRIM_H}mm; padding: {SAFE}mm; }}

.wordmark {{ font-size: 96mm; font-weight: 700; letter-spacing: 14mm; text-indent: 14mm; line-height: 1; }}
.rule {{ height: 1.2mm; background: currentColor; }}
.tag {{ font-size: 11mm; letter-spacing: 3.4mm; text-transform: uppercase; }}
.url {{ font-size: 9mm; letter-spacing: 2.4mm; text-transform: uppercase; opacity: .75; }}

.front-mid {{ position: absolute; left: {SAFE}mm; right: {SAFE}mm; top: 46%; transform: translateY(-50%); text-align: center; }}
.front-foot {{ position: absolute; left: 0; right: 0; bottom: {SAFE}mm; text-align: center; }}

.mark {{ font-size: 15mm; font-weight: 700; letter-spacing: 3mm; }}
.label-zone {{ margin: 10mm 0 0; height: 115mm; }}
.zone-hint {{ display: none; }}

.steps-head {{ font-size: 8.4mm; letter-spacing: 2.6mm; text-transform: uppercase; opacity: .7; margin-bottom: 7mm; }}
.steps {{ display: flex; gap: 9mm; }}
.step {{ flex: 1; }}
.step-ico {{ width: 34mm; height: 34mm; margin-bottom: 6mm; }}
.step-ico svg {{ width: 100%; height: 100%; }}
.step-n {{ font-size: 7mm; font-weight: 700; letter-spacing: 1mm; opacity: .55; margin-bottom: 1.5mm; }}
.step-t {{ font-size: 13mm; font-weight: 700; margin-bottom: 3mm; }}
.step-x {{ font-size: 9mm; line-height: 1.35; opacity: .8; }}

.panel.back {{ display: flex; flex-direction: column; justify-content: space-between; }}
.back-foot {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 10mm; }}
.qr {{ width: 40mm; }}
.qr svg {{ width: 40mm; height: 40mm; display: block; }}
.qr-cap {{ font-size: 6.4mm; line-height: 1.3; margin-top: 3mm; opacity: .8; }}
.contact {{ text-align: right; font-size: 8.4mm; line-height: 1.5; }}
.contact strong {{ font-size: 10mm; }}
.recycle {{ display: flex; align-items: center; gap: 3mm; justify-content: flex-end; margin-top: 4mm; font-size: 6.4mm; letter-spacing: .6mm; opacity: .8; }}
.recycle svg {{ width: 9mm; height: 9mm; }}
"""

RECYCLE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">'
           '<path d="M12 3 L16 10 H8 Z"/><path d="M20 17 L12.5 17 L16.5 10.5"/><path d="M4 17 L11.5 17 L7.5 10.5"/></svg>')

def sheet(kind, reverse=False, annotated=False):
    cls = "sheet reverse" if reverse else "sheet"
    if kind == "front":
        inner = f"""
        <div class="flap"></div>
        <div class="panel">
          <div class="front-mid">
            <div class="wordmark">PILO</div>
            <div class="rule" style="margin: 9mm auto 8mm; width: 62%;"></div>
            <div class="tag">Sleep that repairs you</div>
          </div>
          <div class="front-foot"><div class="url">piloshop.com</div></div>
        </div>"""
    else:
        inner = f"""
        <div class="flap"></div>
        <div class="panel back">
          <div class="mark">PILO</div>
          <div class="label-zone"><div class="zone-hint">SHIPPING LABEL AREA &mdash; KEEP CLEAR, DO NOT PRINT</div></div>
          <div class="steps-head">What to do when it arrives</div>
          <div class="steps">{steps_html()}</div>
          <div class="back-foot">
            <div class="qr">{QR}<div class="qr-cap">Setup &amp; care<br>piloshop.com</div></div>
            <div class="contact">
              <strong>piloshop.com</strong><br>
              @piloshop<br>
              <span class="recycle">{RECYCLE} 04 LDPE &mdash; RECYCLABLE</span>
            </div>
          </div>
        </div>"""
    return f'<div class="{cls}"><div class="art">{inner}</div></div>'

def page(kind, reverse=False, annotated=False, extra_css=""):
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}{extra_css}</style></head>
<body>{sheet(kind, reverse, annotated)}</body></html>"""

out = pathlib.Path(".")
(out / "front.html").write_text(page("front"))
(out / "back.html").write_text(page("back"))
(out / "front-reverse.html").write_text(page("front", reverse=True))

# Annotated copy for the factory: shows bleed, trim, safe area and the label keep-out.
ANNO = f"""
.sheet {{ outline: none; }}
.art::before {{ content: ""; position: absolute; inset: 0; outline: .6mm dashed #D92B2B; }}
.art::after {{ content: "TRIM 450 × 550 mm + 60 mm FLAP"; position: absolute; left: 0; top: -{BLEED - 1}mm;
  font-size: 5mm; color: #D92B2B; letter-spacing: 1mm; }}
.panel::before {{ content: ""; position: absolute; inset: {SAFE}mm; outline: .5mm dashed #2563EB; }}
.flap {{ border-bottom: .6mm dashed #15A34A; }}
.flap::after {{ content: "FOLD — SEAL FLAP, 60 mm"; position: absolute; left: 3mm; bottom: 2mm;
  font-size: 5mm; color: #15A34A; letter-spacing: 1mm; }}
.label-zone {{ outline: .8mm solid #D92B2B; display: flex; align-items: center; justify-content: center; }}
.zone-hint {{ display: block; font-size: 7mm; letter-spacing: 1.4mm; color: #D92B2B; text-align: center; }}
"""
(out / "back-annotated.html").write_text(page("back", extra_css=ANNO))
print("QR modules:", QR_N, "| html written")
