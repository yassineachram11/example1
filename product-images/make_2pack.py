"""Build a 2-pack product shot from the single-pillow photo.

The pillow fills the frame, so a second copy cannot simply be offset without
running off the edge. Instead the original pillow is painted out of the plate
(row-wise interpolation across the bed, which is smooth satin) and two smaller
copies are placed back on the clean background.
"""
from PIL import Image, ImageFilter, ImageChops
import numpy as np

SRC = '/tmp/claude-0/pilo-src.webp'

src = Image.open(SRC).convert('RGB')
W, H = src.size
arr = np.asarray(src).astype(np.float64)
lum = arr.mean(axis=2)

# ---- 1. mask the pillow -----------------------------------------------------
# The foam separates cleanly on luminance; the white base does not (bed
# highlights are just as bright), so the foam mask is smeared downward to
# carry the quilted base along with it.
foam = ((lum < 60) & (np.arange(H)[:, None] > 400)).astype(np.uint8) * 255
m = Image.fromarray(foam, 'L')
# Opening first: the plate has a couple of thin bright slivers that otherwise
# ride along in the alpha and show up pasted on the bed.
m = m.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(7))
m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
smear = m.copy()
for dy in range(4, 86, 4):
    smear = ImageChops.lighter(smear, ImageChops.offset(m, 0, dy))
cut_mask = smear.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2.5))

cut = src.copy(); cut.putalpha(cut_mask)
cut = cut.crop(cut_mask.getbbox())

# ---- 2. paint the pillow out of the plate ----------------------------------
# A wider mask, so the pillow's soft shadow goes too.
wide = cut_mask.point(lambda v: 255 if v > 8 else 0).filter(ImageFilter.MaxFilter(9))
for _ in range(5):
    wide = wide.filter(ImageFilter.MaxFilter(9))
hole = np.asarray(wide).astype(bool)

plate = arr.copy()
xs = np.arange(W)
for y in range(H):
    bad = hole[y]
    if not bad.any():
        continue
    good = ~bad
    if good.sum() < 8:               # nothing to sample on this row
        plate[y] = plate[y - 1]
        continue
    for c in range(3):
        plate[y, :, c] = np.interp(xs, xs[good], arr[y, good, c])

plate_img = Image.fromarray(plate.astype(np.uint8), 'RGB')
# Interpolating row by row leaves horizontal banding; a mild blur inside the
# repaired area only, so the untouched bed keeps its detail.
soft = plate_img.filter(ImageFilter.GaussianBlur(6))
blend = Image.fromarray((hole * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(14))
plate_img = Image.composite(soft, plate_img, blend)
plate_img.save('_plate.jpg', quality=90)

# ---- 3. place two pillows --------------------------------------------------
def place(canvas, pillow, scale, cx, bottom, shadow=0.45):
    p = pillow.resize((int(pillow.width * scale), int(pillow.height * scale)), Image.LANCZOS)
    x = int(cx - p.width / 2)
    y = int(bottom - p.height)
    sh = Image.new('L', canvas.size, 0)
    a = p.getchannel('A').point(lambda v: int(v * shadow))
    sh.paste(a, (x + int(18 * scale), y + int(26 * scale)))
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    canvas = Image.composite(Image.new('RGB', canvas.size, (96, 99, 105)), canvas, sh)
    canvas.paste(p, (x, y), p)
    return canvas

out = plate_img
out = place(out, cut, 0.56, 690, 880, shadow=0.40)   # back pillow, further away
out = place(out, cut, 0.64, 430, 1035, shadow=0.48)  # front pillow

out.save('pilo-2pack.png')
out.convert('RGB').save('pilo-2pack.jpg', quality=92)
print("written", out.size)
