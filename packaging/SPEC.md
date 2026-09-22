# Pilo Shop — printed shipping mailers

Artwork and print specification. Send this file plus the two production PDFs to the factory.

## Files

| File | What it is |
|---|---|
| `pilo-mailer-front.pdf` | **Production art, front.** Navy on natural white. |
| `pilo-mailer-back.pdf` | **Production art, back.** Label area is intentionally blank. |
| `pilo-mailer-back-ANNOTATED.pdf` | Reference only — shows trim, bleed, safe area, fold and the label keep-out. **Do not print this one.** |
| `pilo-mailer-front-white-on-navy.pdf` | Alternative: white print on a navy bag. Costs more (bag is dyed, ink coverage is higher). |
| `front.html` / `back.html`, `build.py` | Editable source. Re-run `build.py` then `render.py` after any change. |

## Size

Artwork is drawn at **450 × 550 mm body + 60 mm seal flap**, with **5 mm bleed** on every edge
(PDF page is 460 × 610 mm) and a **20 mm safe margin** inside the trim.

**Measure before ordering.** Lay the compressed, sealed pillow flat and measure it, then:

- bag width = item width + 20 mm ease
- bag length = item length + 40 mm ease + 60 mm flap

Give the factory your measured size and ask them to scale the artwork proportionally —
the layout is built to scale cleanly. Do not let them stretch it to fit.

## Material

- **LDPE co-extruded poly mailer, 60–80 micron.** Thinner than 60 tears with a pillow's weight.
- **Opaque** — grey or black inner liner so the contents are not visible in transit.
- Permanent hot-melt adhesive strip, plus a **tear strip** if they offer it.
- If you want the recycling mark to be truthful, confirm the material really is mono-material
  LDPE 04. If they supply a mixed-laminate bag, remove the mark from the artwork.

## Print

- **One spot colour: navy `#101F35`** on natural white stock. One colour keeps flexo cost and
  setup charges down, and it is the whole reason the design uses no photography or gradients.
- Ask the factory to match the navy from a **physical Pantone book with a draw-down sample**.
  Do not accept a screen-to-Pantone conversion — poly takes ink differently from paper.
- Print one side, or both if the price difference is small. If you can only afford one side,
  **print the back** — that is the one with the steps and the QR code.
- No white underbase needed on a white bag.

## The rule the factory will break if you let them

**The shipping label area on the back must stay blank.** It is 150 mm wide × 115 mm tall,
below the logo. Couriers stick a thermal label there; if there is ink under it the label
peels, and a peeled label means a lost parcel. The annotated PDF marks this zone in red.

Also: **no address printed on the bag**, and no discount codes or dated promotions — you will
be holding this stock for a year and a code that expires makes the whole run dead.

## Before you commit to a big run

Custom-printed mailers usually carry a **1,000–5,000 unit minimum** and a 2–4 week lead time.
If your order volume does not justify that yet, the cheaper route is **plain opaque mailers
plus a printed sticker** using the same front artwork — roughly the same unboxing effect,
a fraction of the commitment, and you can change the design when you learn something.

Ask the factory for: unit price at 1,000 / 3,000 / 5,000, setup and plate charge, whether a
**physical pre-production sample** is included, lead time, and the micron thickness in writing.

## Fonts

Type is set in Liberation Sans (metric-compatible with Helvetica/Arial) and embedded in the
PDFs. If the factory asks for outlined type, say so and it can be re-exported — or swap in
your own brand font in `build.py` first.
