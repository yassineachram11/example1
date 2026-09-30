# Pilo Direct

A Shopify theme built for one product. The premise is that **the homepage is
the sales page**: the price, the pack picker and the Add to cart button are on
the first screen, on a phone as well as a desktop, instead of a click away.

## What is in here

```
layout/     theme.liquid, password.liquid
sections/   offer-hero, main-product, usp-strip, problem, mechanism, proof,
            versus, steps, faq, closing-offer, rich-text, header, footer,
            cart-drawer, and the main-* sections for cart, page, 404, search,
            collection, list-collections, blog, article, password
snippets/   buy-box, buy-bar, gallery, card, pagination, icon, meta-tags
templates/  one JSON template per page type, plus the customer account pages
assets/     theme.css, theme.js — no frameworks, no build step
config/     settings_schema.json, settings_data.json
locales/    en.default.json
```

`snippets/buy-box.liquid` is the heart of it. The homepage hero and the product
page both render it, so the price, the packs and the stock line can never drift
apart between the two pages.

## Set it up

1. In the theme editor, open **Theme settings → Product** and point
   `hero_product` at Pilo 1.0. Every buy button, price and stock line on the
   site follows from that one setting.
2. Check the colours, fonts and the announcement bar under Theme settings.
3. On the homepage, the **Offer hero** section holds the reassurance lines and
   the sticky bar switch.

## How savings are worked out

Pack savings are measured against buying that many singles, not against the
compare-at price:

```
baseline = the dearest per-unit price on offer (the single)
saving   = baseline × units − pack price
```

Compare-at is the field merchants most often leave wrong, so nothing on the
page depends on it. The **Best value** flag goes on the pack with the lowest
per-unit price, and only one pack ever gets it.

Pack sizes are read from the variant title: the leading number in `2-pack`,
`3x`, `2x Bundle` is the unit count. A title with no leading number counts as
one.

## Checking a change

The theme has no build step, so the checks are external:

- `liqcheck.py` parses every Liquid file (catches unbalanced tags and broken
  `{% liquid %}` bodies; it does not check filter arguments).
- `preview.py` renders the templates offline against real Pilo data and
  `shoot.py` screenshots them in Chromium.

Those live in the session scratchpad rather than the repo. If you change
`buy-box.liquid`, the one thing worth re-checking by hand is that clicking each
pack updates the price, the strikethrough, the saving, the stock line, the
hidden variant id and the sticky bar together.
