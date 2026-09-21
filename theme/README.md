# azure-theme — mobile hero video

Two changed files from the live `azure-theme`, with a mobile-specific version of the
homepage video hero. **Nothing has been pushed to your live store** — see *Installing* below.

| File | Change |
|---|---|
| `sections/hero.liquid` | New "Mobile" settings group, mobile classes and CSS vars, optional mobile video swap. |
| `assets/hero-video.css` | New `max-width: 749px` block: side-by-side layout and mobile framing overrides. |

## What you get in the theme editor

Under **Hero → Mobile** (all of it applies below 750px only; desktop is untouched):

- **Mobile layout** — *Stacked* (what you have now: video under the text) or
  **Side by side** — the video sits next to the text on phones.
- **Video side** — left or right, independent of the desktop setting.
- **Video column width** — 30–60% of the screen, default 45%.
- **Mobile video** — optional separate file, e.g. a vertical cut. Phones then download
  *only* this one and never the desktop file.
- **Use different video framing on mobile** — unlocks a separate frame shape, fit and
  zoom for phones. Leave it off and mobile just inherits your desktop values.

## Measured on a 390px viewport

| | Stacked (current) | Side by side |
|---|---|---|
| Hero columns | 1 (350px) | 2 (168px + 157px) |
| Hero height | 712px | **385px** |
| Video | 16:9, contain | 9:16, cover |

Desktop at 1440px is byte-for-byte the same either way: two 572px columns, 16:9, contain.

Side mode roughly halves the hero height, so the reviews carousel is visible without
scrolling on most phones. The trade-off is a text column about half a phone wide — the
CSS drops the heading to `--text-2xl`, shrinks the subheading, makes the buttons full
width and tightens the trust row so it still reads. Keep the heading short or it will
break badly.

## How the mobile video swap works

The obvious approach — render two `<video>` elements and hide one — makes phones
download both files. Instead there is one `<video>` with `data-src-desktop` /
`data-src-mobile` and a small inline script that picks the source from `matchMedia`
before the browser starts fetching. Phones pull the mobile file only.

That path is opt-in: it only runs when a **Mobile video** is set *and* both videos have an
mp4 source ready. Otherwise the section falls back to Shopify's `video_tag` exactly as it
does today, so the current homepage behaviour cannot regress. There is a `<noscript>`
fallback to the desktop file.

## Installing

These files came from the live theme `azure-theme` (`210145935709`), so they are current
as of this commit. Do not paste them into a theme that has since been edited elsewhere —
diff first.

**Safest route:** duplicate the live theme, or use `azure-theme (staging)`
(`210249285981`), upload both files, preview on a real phone, then publish.

With Shopify CLI:

```bash
shopify theme pull --store piloshop.com --theme 210249285981
# copy sections/hero.liquid and assets/hero-video.css over
shopify theme push --store piloshop.com --theme 210249285981
```

Or in admin: **Online Store → Themes → … → Edit code**, replace the two files.

Your current homepage settings (`layout: split`, `video_ratio: 16 / 9`,
`video_fit: contain`, `image_position: right`) all carry over untouched — the new
settings default to stacked, which is exactly today's behaviour. Nothing changes
until you switch **Mobile layout** to *Side by side*.

## Check after installing

- Real phone, portrait and landscape.
- Theme editor: toggle the mobile layout and confirm the preview updates.
- With a mobile video set, open DevTools → Network on a phone-sized viewport and confirm
  only the mobile file is fetched.
- iOS Safari autoplay needs `muted` + `playsinline`; both are on the swapped element.
