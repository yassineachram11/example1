"""2-pack shots that leave the original plate completely untouched.

The earlier approach painted the pillow out and rebuilt the bed, which is where
the quality went: row interpolation cannot reproduce satin. Here the original
photo is the background, pixel for pixel, and a second pillow is added in a
position where nothing has to be repaired.
"""
from PIL import Image, ImageFilter, ImageChops, ImageEnhance
import numpy as np
import sys

SRC = '/tmp/claude-0/pilo-src.webp'
src = Image.open(SRC).convert('RGB')
W, H = src.size

# ---- cut the pillow (foam by luminance, smeared down for the quilted base) --
lum = np.asarray(src).astype(float).mean(axis=2)
foam = ((lum < 60) & (np.arange(H)[:, None] > 400)).astype(np.uint8) * 255
m = Image.fromarray(foam, 'L')
m = m.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(7))   # kill slivers
m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
# Smearing the foam mask down picks up the quilted base, but it drags a
# straight-sided column under every outer tip of the foam. Keep the skirt
# short, taper it, and soften the alpha so those columns do not read as
# blocks when the copy sits against the wall.
smear = m.copy()
for dy in range(4, 54, 4):
    smear = ImageChops.lighter(smear, ImageChops.offset(m, 0, dy))
for dy in range(54, 82, 4):
    faded = ImageChops.offset(m, 0, dy).point(lambda v, d=dy: int(v * (82 - d) / 28.0))
    smear = ImageChops.lighter(smear, faded)
cut_mask = smear.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(4.5))
BBOX = cut_mask.getbbox()
cut = src.copy(); cut.putalpha(cut_mask); cut = cut.crop(BBOX)


def add(canvas, pillow, scale, x, y, shadow=0.42, blur=26, dim=1.0, dx=20, dy=28):
    """Drop a pillow at (x, y) with a soft contact shadow underneath it."""
    p = pillow.resize((int(pillow.width * scale), int(pillow.height * scale)), Image.LANCZOS)
    if dim != 1.0:
        p = Image.merge('RGBA', (*ImageEnhance.Brightness(p.convert('RGB')).enhance(dim).split(),
                                 p.getchannel('A')))
    sh = Image.new('L', canvas.size, 0)
    sh.paste(p.getchannel('A').point(lambda v: int(v * shadow)),
             (x + int(dx * scale), y + int(dy * scale)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas = Image.composite(Image.new('RGB', canvas.size, (86, 90, 97)), canvas, sh)
    canvas.paste(p, (x, y), p)
    return canvas


MODE = sys.argv[1] if len(sys.argv) > 1 else 'behind'

if MODE == 'behind':
    # Second pillow set further back and to the right. Its lower left is
    # hidden by the original, so only clean edges are on show.
    out = add(src.copy(), cut, 0.74, 268, 318, shadow=0.38, blur=30, dim=0.94)
    out.paste(cut, (BBOX[0], BBOX[1]), cut)          # original back on top
    name = 'pilo-2pack-behind'

elif MODE == 'stacked':
    # One resting on the other, offset so both silhouettes read.
    out = src.copy()
    out = add(out, cut, 0.97, BBOX[0] + 34, BBOX[1] - 150, shadow=0.5, blur=22, dim=0.97)
    name = 'pilo-2pack-stacked'

elif MODE == 'tight':
    # Same idea as 'behind' but framed closer, so the pillows fill the card.
    big = add(src.copy(), cut, 0.74, 268, 318, shadow=0.38, blur=30, dim=0.94)
    big.paste(cut, (BBOX[0], BBOX[1]), cut)
    # Trim the empty foreground, not the top: cropping from above clips the
    # OEKO-TEX badge.
    out = big.crop((0, 30, 1080, 1130))               # 1080x1100
    name = 'pilo-2pack-tight'

out.save(name + '.png')
out.convert('RGB').save(name + '.jpg', quality=92)
print('written', name, out.size)
