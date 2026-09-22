# azure-theme — mobile hero video

A mobile-specific version of the homepage video hero, in two copies because the two
themes had already diverged.

| Folder | Base theme | State |
|---|---|---|
| `live/` | `azure-theme` (`210145935709`, **published**) | Not applied. Apply by hand when ready. |
| `staging/` | `azure-theme (staging)` (`210249285981`) | **Pushed and verified** — checksums match. |

Each folder holds `sections/hero.liquid`, `assets/hero-video.css` and
`snippets/hero-video-swap.liquid`.

Staging was ahead of live: it already carried a `color_scheme` dark mode, a
`price` / `price_note` line and `hero-extras.css`, none of which exist on live. The
`staging/` copy keeps all of it. Do not push `live/` files to staging or you will delete
that work — and do not push `staging/` files to live, because it would ship dark mode and
the price line before anyone reviewed them.

Both copies were verified byte-exact: stripping the mobile additions back out of each file
reproduces its own theme's original MD5 (`dea5fc78…` for live, `7937030f…` for staging).
`assets/hero-video.css` was identical on both themes, so the same updated file serves both.

## Which layout your homepage uses

This matters, because the settings split by layout:

- **live** `azure-theme` homepage → `layout: split` (text beside video)
- **staging** homepage → `layout: banner` (video full-bleed behind the text)

## What you get in the theme editor

Under **Hero → Mobile** (all below 750px only; desktop untouched):

| Setting | Applies to |
|---|---|
| **Mobile video placement** — *Behind the text* or **Under the text** | banner layout |
| **Mobile layout** — *Stacked* or **Side by side** | split layout |
| **Video side** / **Video column width** | split, side-by-side mode |
| **Mobile video** — optional separate file for phones | both layouts |
| **Use different video framing on mobile** — shape, fit, zoom | both layouts |

Defaults reproduce current behaviour exactly on both layouts, so nothing changes until
you switch **Mobile video placement** (banner) or **Mobile layout** (split).

### Banner layout: video under the text

On phones the section turns into a column: copy first, video below it in a rounded frame
at the mobile frame shape. The overlay is dropped, and light banner text is reverted to
the normal page colours — white-on-white would otherwise make the heading invisible once
it is no longer sitting over footage.

## Measured on a 390px viewport

| | Stacked (current) | Side by side |
|---|---|---|
| Hero columns | 1 (350px) | 2 (168px + 157px) |
| Hero height | 712px | **385px** |
| Video | 16:9, contain | 9:16, cover |

Desktop at 1440px is identical either way: two 572px columns, 16:9, contain.

The trade-off is a text column about half a phone wide. The CSS drops the heading to
`--text-2xl`, shrinks the subheading, makes buttons full width and tightens the trust row.
Keep the heading short — "The Science of Perfect Sleep" is about the limit.

## How the mobile video swap works

Rendering two `<video>` elements and hiding one makes phones download both files. Instead
there is one `<video>` carrying `data-src-desktop` / `data-src-mobile` and a small inline
script that picks the source from `matchMedia` before the browser starts fetching.

That path is opt-in: it only runs when a **Mobile video** is set *and* both videos have an
mp4 source ready. Otherwise the section falls back to Shopify's `video_tag` exactly as
before, so current behaviour cannot regress. There is a `<noscript>` fallback.

## Previewing staging

https://piloshop.com/?preview_theme_id=210249285981

Open **Online Store → Themes → azure-theme (staging) → Customize**, then
**Hero → Mobile → Side by side**, and view the preview on a real phone. Nothing is
live until that theme is published.

## Check before publishing

- Real phone, portrait and landscape.
- With a mobile video set, DevTools → Network at phone width: only the mobile file is fetched.
- iOS Safari autoplay needs `muted` + `playsinline`; both are on the swapped element.
- The dark `color_scheme` and the price line are staging-only and still unreviewed —
  publishing staging ships those too.

---

# How to use — 3-step section

New section, added to both `live/` and `staging/` (identical — no divergence here),
and **pushed to staging**. It appears in the theme editor under **Add section → How to use**,
preset with three steps already written.

| File | |
|---|---|
| `sections/how-to-use.liquid` | Section, schema and the scroll-triggered playback script |
| `assets/how-to-use.css` | Layout, clip frames, step numbers, mobile swipe mode |

## Per step

Each step block takes a **Clip** (video), an **Image or GIF**, a title and one line of text.
Clip wins if both are set. Up to 4 steps; 3 is the shape the layout is tuned for.

## Settings

Eyebrow, heading, optional text, **Clip shape** (square by default — all steps share it),
step numbers on/off, **On mobile** (stacked or swipe), background colour, optional button.

## MP4 beats GIF here

A 3-second GIF at card size runs 2–5 MB. The same loop as muted MP4 is 150–400 KB —
roughly 10× smaller, and sharper. Use the **Clip** field.

If you do use a GIF, it is served at its original size on purpose: Shopify's image
resizing can flatten an animation to a single frame. So export it small (≤900px wide)
and keep it under ~1 MB.

## Making the clips

Film all three the same way — same distance, same light, same shape — or the row looks
untidy. 3 to 5 seconds each, ending near where it started so the loop is not jarring.

```bash
# square, silent, web-ready loop
ffmpeg -i step1.mov -vf "crop=ih:ih,scale=900:900:flags=lanczos" \
  -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p \
  -movflags +faststart -t 4 step1-open-the-box.mp4
```

Upload under **Content → Files**, then pick each one in its step.

## Preset copy is a placeholder

"It takes about an hour to expand to full shape" is a guess. Replace it with the real
expansion time before this goes live — it is the kind of line customers hold you to.

---

# Footer payment icons

Not a code change — `sections/footer.liquid` already exposes **Show payment icons**
(and optional *Payment badge* blocks for gateways like Whish that Shopify's
`shop.enabled_payment_types` never lists).

Turned **off** on staging by setting `show_payment_icons: false` in
`sections/footer-group.json`. No payment badge blocks were configured, so the row
is now gone entirely.

To do the same on the published theme: **Customize → Footer → uncheck Show payment
icons**. It cannot be pushed through the API — writes to the live theme are blocked.

Note: with no payment providers enabled, the section falls back to placeholder
VISA / MC / AMEX / PAYPAL / APPLE / GPAY pills, which is probably what was showing.

## "Powered by Shopify"

Removed from `staging/sections/footer.liquid` — the `{{ powered_by_link }}` line in the
copyright row is gone; the copyright and policy links are untouched. Verified by putting
the line back and matching the theme's original MD5, so nothing else in the file changed.

The live theme has a **different** footer (13,783 bytes vs staging's 16,899 — they have
diverged), so this edit does not apply to it. Remove it there in
**Edit code → sections/footer.liquid**, deleting the `{{ powered_by_link }}` line.

This only covers the storefront footer. The "Powered by Shopify" on the checkout and on
the password page comes from Shopify, not the theme, and cannot be removed on the Basic plan.

---

# Specs table

`sections/specs-table.liquid` + `assets/specs-table.css`, in both `live/` and `staging/`.
**Pushed to staging and added to the product page**, sitting between the comparison slider
and the reviews. Drag it elsewhere in the editor if you prefer it higher.

Label/value pairs render as a `<dl>` — correct semantics for specs, and it lets the two
columns align without table markup.

## Blocks

- **Spec row** — label, value, and an optional note shown smaller beneath the value.
- **Group heading** — breaks the list into titled sections (Construction / Fit / Care).

## Collapsing

**Collapse the table** has three modes:

- **One panel per group** (default) — each group heading becomes a toggle. Closed until
  pressed.
- **Whole table behind one toggle** — a single row labelled by **Toggle label**.
- **Always open** — the plain table.

**Open the first panel by default** is off, so nothing is expanded on load.

The markup reuses the theme's own `.accordion` from the FAQ section, which means the
existing delegated `[data-toggle]` handler in `theme.js` drives it — no new JavaScript, the
same chevron and animation, and it keeps working after a theme-editor section reload.
The rows stay in the HTML when collapsed, so search engines still read them.

Rows placed *before* the first group heading have no panel to belong to, so they render
above the accordion and stay visible.

## Settings

Eyebrow, heading, optional text, **one or two columns** on desktop (ignored when collapsing
by group; always one below 750px), label column width, max width, background, and a
footnote for tolerances.

## Fill these in before it goes live

Three rows say **"Add your measurement"** — Dimensions, Loft (height), Weight. I did not
invent numbers for them.

Everything else is taken from claims already on your own site: adaptive contour memory
foam, the zip-off cooling cover, OEKO-TEX® STANDARD 100, back and side sleeping, free
Lebanon delivery in 1–5 days, and the unopened-only returns policy from your FAQ. Check each
one still reflects reality before publishing.

Worth adding once you have them: fill density, cover fabric composition, and country of
origin. Those three are what people actually compare between pillows.

## Multiple products later

Blocks live on the *template*, so every product using `product.json` shows the same table.
That is fine with one product. If you add more, move the values to product metafields and
read them in the section instead.

---

# Bundle selector — image per pack

`snippets/bundle-option.liquid` + `assets/bundle.js`, in `live/` and `staging/`.
**Pushed to staging.** Picking a pack row now also swaps the gallery to that variant's
own image, and landing on `?variant=<id>` shows the right image on load.

## It does nothing until you assign variant images

Right now **neither variant has an image**, and all seven product photos show one pillow.
There is no two-pillow shot to swap to. Until that changes the code is inert — which is
why nothing looks different on staging yet.

To turn it on:

1. Shoot (or composite) a photo of two Pilos and upload it to the product's media.
2. **Products → Pilo 1.0 → Variants → 2-pack → Media** and pick that photo.
3. Do the same for **1-pack** with the single-pillow hero shot.

Step 3 matters. A variant with no image leaves the gallery untouched — the standard
Shopify behaviour, and what Dawn does. If only the 2-pack has an image, switching back to
1-pack leaves the two-pillow photo on screen. Give both variants an image and it reads
correctly in either direction.

## How it works

The row's radio carries `data-image`, built at `width: 1200` — the same width the
thumbnails use for `data-full`. `bundle.js` matches that URL against the thumbnails and
presses the matching one, so the theme's existing preload-and-fade and active-thumb
handling runs instead of a second copy of it. If the variant image is not among the
thumbnails it swaps the main image directly.

Verified in a browser against a mock of the real gallery markup plus the thumbnail handler
copied from `theme.js`: click swaps the image and moves the active thumb, the form's
variant id follows, a variant without an image leaves the gallery alone, and a preselected
multi-pack renders its image on load.

---

# Buy button settings

`sections/main-product.liquid` (buy_buttons block) + `assets/buy-buttons.css` +
`assets/buy-now.js`. **Pushed to staging.** Every setting is inert at its default, so an
untouched block renders exactly as before.

## Under Product information → Buy buttons

**Labels** — Add to cart and Sold out. Leave empty to keep the theme's wording.

**Buy now** — an optional second button that adds to the cart and goes straight to
checkout, with its own label.

**Appearance** — size (large or regular), full width, corner radius 0–40px, and four
colours: Add to cart background/text and Buy now background/text. Leave a colour empty
and it falls back to the theme's. Hover shades are derived by darkening the chosen colour
8%, so there is nothing extra to pick.

## Why there is a custom Buy now button

Shopify's dynamic checkout button (`payment_button` — Shop Pay, PayPal and the rest) has
its wording and colour controlled by Shopify. It cannot be relabelled or recoloured from
the theme. The Buy now button here is a normal button that posts to `cart/add.js` and then
redirects to checkout, so it takes your colours and your words. Both can be on at once.

## Full width

The quantity stepper keeps its own row and the button drops below it, rather than the two
sharing a line.

## Verified

Rendered the block through a Liquid engine across six setting combinations — defaults,
custom labels, buy now on, brand colours, full width at regular size, and sold out —
checking the HTML nests and the right CSS variables are emitted. Checked in a browser
that the overrides beat `.btn--primary` on specificity, including on hover.

One note: the uploaded file carries a real em dash in one schema `info` string where the
local copy had a `—` escape. Both are valid JSON and identical in the editor; the
repo copy was synced to match the theme.
