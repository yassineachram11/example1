# Pilo 1.0 — 2-pack product shots

Three layouts, built from `pilo-1pack-source.webp` by `make_2pack_v2.py`:

| File | Layout | Size |
|---|---|---|
| `pilo-2pack-behind.*` | second pillow set further back | 1080 × 1350 |
| `pilo-2pack-stacked.*` | one resting on the other | 1080 × 1350 |
| `pilo-2pack-tight.*` | the "behind" layout, framed closer | 1080 × 1100 |

```bash
python3 make_2pack_v2.py behind    # or stacked, or tight
```

Needs `pillow` and `numpy`.

## The background is never touched

An earlier attempt painted the original pillow out and rebuilt the bed so two smaller
pillows could sit side by side. That is where the quality went: row-wise interpolation
gets the colour and gradient right but cannot reproduce satin folds, so the bed came back
flat and slightly grey, with a visible patch outline. Borrowing grain from the clean bed
lower down made it worse — stretching that band turns the folds into vertical streaks.

These three place the second pillow where nothing has to be repaired, so the plate stays
pixel for pixel as shot: real folds, real shadows, real highlights.

## How the cut is made

The black foam separates cleanly on luminance. The white quilted base does not — the
bed's satin highlights are just as bright — so the foam mask is smeared downward to pick
up the base sitting directly beneath it.

Two details that matter:

- A morphological opening first. The source has a couple of thin bright slivers that
  otherwise ride along in the alpha and appear pasted on the bed.
- The skirt is short and tapered. Smearing drags a straight-sided white column under every
  outer tip of the foam, which reads as a block when the copy sits against the wall.

The added pillow is dimmed very slightly and given a soft contact shadow so it sits at a
believable distance rather than floating.

## Honest limits

These are composites of one photograph, so both pillows are lit identically and show the
same creases. It reads fine at product-card size. A real two-pillow photograph is still
better, and the shot list for that is in `../howto-gifs/README.md`.
