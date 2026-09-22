# Pilo 1.0 — 2-pack product shot

Two layouts, both 1080 × 1350 (4:5, matching the other product photos), built from
`pilo-1pack-source.webp` by `make_2pack.py`:

- `pilo-2pack-facing.*` — a mirrored pair facing each other (`python3 make_2pack.py facing`)
- `pilo-2pack.*` — one behind the other, staggered (`python3 make_2pack.py`)

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
3. **Place two copies back** with soft contact shadows. The facing layout mirrors the
   right-hand one so the two contoured cradles turn toward each other, and keeps the
   shadow direction the same for both so the scene still has one light source.

The paint-out mask is dilated directionally — generously sideways and downward, barely
upward. The white base reaches much further right than the foam does, and anything left
behind shows as a ghost; but dilating up into the wall/bed horizon makes the row-wise
repair replace that curved edge with a straight one.

The repair is then tone-matched back down, sampling bed rows only. Sampling the whole
ring around the hole pulls dark wall pixels into the reference and over-darkens the patch.

The OEKO-TEX badge is part of the original plate and is untouched.

## Honest limits

The repaired bed is flatter and slightly greyer than the original where the pillow used
to be — row interpolation gets the colour and gradient right but cannot reproduce satin
folds. It passes as soft depth-of-field falloff at card size; at full screen you can see
it. Borrowing grain from the clean bed lower down was tried and made it worse: stretching
that band turns the folds into vertical streaks.

A real photograph of two pillows beats this. Treat it as a stopgap.

Re-run after changing the source or the composition:

```bash
python3 make_2pack.py     # needs pillow + numpy
```
