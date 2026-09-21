# azure-theme — mobile hero video

A mobile-specific version of the homepage video hero, in two copies because the two
themes had already diverged.

| Folder | Base theme | State |
|---|---|---|
| `live/` | `azure-theme` (`210145935709`, **published**) | Not applied. Apply by hand when ready. |
| `staging/` | `azure-theme (staging)` (`210249285981`) | **Pushed and verified** — checksums match. |

Staging was ahead of live: it already carried a `color_scheme` dark mode, a
`price` / `price_note` line and `hero-extras.css`, none of which exist on live. The
`staging/` copy keeps all of it. Do not push `live/` files to staging or you will delete
that work — and do not push `staging/` files to live, because it would ship dark mode and
the price line before anyone reviewed them.

Both copies were verified byte-exact: stripping the mobile additions back out of each file
reproduces its own theme's original MD5 (`dea5fc78…` for live, `7937030f…` for staging).
`assets/hero-video.css` was identical on both themes, so the same updated file serves both.

## What you get in the theme editor

Under **Hero → Mobile** (all below 750px only; desktop untouched):

- **Mobile layout** — *Stacked* (current behaviour) or **Side by side**
- **Video side** — left or right, independent of the desktop setting
- **Video column width** — 30–60% of the screen, default 45%
- **Mobile video** — optional separate file, e.g. a vertical cut
- **Use different video framing on mobile** — separate shape, fit and zoom for phones

Defaults reproduce today's stacked layout exactly, so nothing changes until you switch
**Mobile layout** to *Side by side*.

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
