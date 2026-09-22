# Pilo 1.0 — 2-pack product shot

`pilo-2pack.png` / `.jpg` — 1080 × 1350 (4:5, matching the other product photos),
built from `pilo-1pack-source.webp` by `make_2pack.py`.

## How it was made

The pillow fills the frame in the source, so a second copy could not just be offset —
it ran off the edge. Instead:

1. **Mask the pillow.** The black foam separates cleanly on luminance. The white quilted
   base does not — the bed's satin highlights are just as bright — so the foam mask is
   smeared downward to carry the base along with it. A morphological opening first,
   because the plate has a couple of thin bright slivers that otherwise ride along in the
   alpha and end up pasted on the bed.
2. **Paint the pillow out of the plate.** Row-wise interpolation across the gap, which
   works because the bed is smooth satin, then a mild blur confined to the repaired area
   so the untouched bed keeps its detail.
3. **Place two copies back** at 0.64 and 0.56 scale with soft contact shadows, the smaller
   one further back.

The OEKO-TEX badge is part of the original plate and is untouched.

## Honest limits

The repaired bed is softer than the original in the area where the pillow used to be.
At product-card size it does not read, but at full screen you can see it if you look.
A real photograph of two pillows will always beat this — treat it as a stopgap.

Re-run after changing the source or the composition:

```bash
python3 make_2pack.py     # needs pillow + numpy
```
