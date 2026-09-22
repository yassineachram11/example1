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
# Directional. The white base reaches well to the sides and below the foam,
# so the hole has to be generous there or a ghost of it survives. Upward it
# must stay tight: dilating into the wall/bed horizon makes the row-wise
# repair replace that curved edge with a straight one.
base = cut_mask.point(lambda v: 255 if v > 8 else 0)
wide = base.copy()
for dx in range(-120, 121, 6):
    for dy in range(0, 121, 6):
        wide = ImageChops.lighter(wide, ImageChops.offset(base, dx, dy))
wide = ImageChops.lighter(wide, ImageChops.offset(base, 0, -12))
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
# Row interpolation leaves faint horizontal banding; a mild blur confined to
# the repair. The pillows are then placed to cover most of it, so only a
# narrow band near the horizon is left showing.
soft = plate_img.filter(ImageFilter.GaussianBlur(4))
blend = Image.fromarray((hole * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(45))
plate_img = Image.composite(soft, plate_img, blend)

# The fill samples each row's clean ends, which sit outside the pillow's soft
# shadow, so the repair comes back brighter than the bed it replaces and reads
# as a pale rectangle. Match it back down, feathered by the same mask.
rep = np.asarray(plate_img).astype(np.float64)
wgt = np.asarray(blend).astype(np.float64)[:, :, None] / 255.0
# Sample bed rows only. The hole reaches up into the wall, and including
# those dark pixels in the reference drags the correction far too low.
bed_rows = np.zeros((H, W), dtype=bool)
bed_rows[620:1340, :] = True
inside = (wgt[:, :, 0] > 0.55) & bed_rows
ring = np.zeros((H, W), dtype=bool)
grow = np.asarray(Image.fromarray((hole * 255).astype(np.uint8), 'L')
                  .filter(ImageFilter.MaxFilter(9))).astype(float) > 128
for _ in range(1):
    ring |= grow & ~hole & bed_rows
if inside.any() and ring.any():
    factor = float(arr[ring].mean() / max(rep[inside].mean(), 1e-6))
    factor = min(max(factor, 0.80), 1.05)
    rep = rep * (1 - wgt) + rep * wgt * factor
    plate_img = Image.fromarray(np.clip(rep, 0, 255).astype(np.uint8), 'RGB')
    print("repair tone matched by x%.3f" % factor)

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

import sys
from PIL import ImageOps

MODE = sys.argv[1] if len(sys.argv) > 1 else 'stagger'

if MODE == 'facing':
    # A mirrored pair, level with each other. The shadow direction stays the
    # same for both so the scene keeps one light source even though the right
    # pillow is flipped.
    mirrored = ImageOps.mirror(cut)
    out = plate_img
    out = place(out, mirrored, 0.62, 752, 985, shadow=0.44)
    out = place(out, cut, 0.62, 332, 1000, shadow=0.46)
    name = 'pilo-2pack-facing'
else:
    out = plate_img
    out = place(out, cut, 0.56, 690, 880, shadow=0.40)   # back pillow, further away
    out = place(out, cut, 0.64, 430, 1035, shadow=0.48)  # front pillow
    name = 'pilo-2pack'

out.save(name + '.png')
out.convert('RGB').save(name + '.jpg', quality=92)
print("written", name, out.size)
