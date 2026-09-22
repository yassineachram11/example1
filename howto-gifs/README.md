# How to use — step animations

Three looping animations for the **How to use** section, drawn in the site's own line-art
style (navy `#101F35` on `#F8FAFC`, matching the section's card background).

| Step | GIF | MP4 |
|---|---|---|
| 1. Open the box | `step-1-open-the-box.gif` (150 KB) | `step-1-open-the-box.mp4` (18 KB) |
| 2. Unwrap it | `step-2-unwrap-it.gif` (116 KB) | `step-2-unwrap-it.mp4` (19 KB) |
| 3. Sleep on it | `step-3-sleep-on-it.gif` (183 KB) | `step-3-sleep-on-it.mp4` (21 KB) |

600 × 600 (square, the section's default clip shape), ~3 seconds, looping.

## Use the MP4s

Upload the MP4s under **Content → Files**, then pick each one in its step's **Clip** field.
They are roughly 8× smaller than the GIFs and sharper, and the section only starts playing
them once the step scrolls into view. The GIFs are there if you want them for email,
Instagram or anywhere that will not take a video.

## These are illustrations, not your product

They show a generic carton, roll and pillow — deliberately abstract, so nothing claims to be
footage of the real Pilo. They are a good placeholder and they read clearly at card size, but
real clips of the actual product will always convert better. Replace them when you can film
(the section's README has an ffmpeg recipe for square exports).

Step 3 loops seamlessly. Steps 1 and 2 play once, hold on the finished state, then cut back —
normal for a how-to loop.

## Editing

`scenes.html` holds all three as pure geometry driven by `window.render(scene, t)` where
`t` runs 0 → 1. Change colours or timing there, then:

```bash
python3 capture.py    # renders 36 frames per scene
python3 assemble.py   # writes the GIFs and MP4s
```

Needs `pillow` and `imageio-ffmpeg` (`pip install pillow imageio-ffmpeg`).

## Uploaded to staging

The three MP4s are live in the staging theme (`210249285981`):

| Shopify Files | Attached to |
|---|---|
| `pilo-howto-step-1-open-the-box.mp4` | step block `step_9W6FQE` — "Open the box" |
| `pilo-howto-step-2-unwrap-it.mp4` | step block `step_fXi9FC` — "Unwrap the pillow" |
| `pilo-howto-step-3-sleep-on-it.mp4` | step block `step_ChqiE6` — "Sleep on it" |

Uploaded via `stagedUploadsCreate` → direct POST → `fileCreate`; all three transcoded to
480 × 480 and report `READY`. Only the three `video` keys were added to
`templates/index.json` — the section placement, swipe mode, white background and the hero's
mobile settings were all left exactly as they were set in the theme editor.

Replacing them later with real footage does not need a code change: upload the new clips
under Content → Files and repoint each step's **Clip** field.

## Placing your head on the Pilo

`head-on-pilo.gif` (200 KB) / `head-on-pilo.mp4` (21 KB) — 600 × 600, ~3 seconds.

A side profile lowers onto the pillow: the head swings down about the base of the neck,
the foam compresses under the skull, and a blue dashed line fades in at the end showing the
ear sitting level with the shoulder — the cervical-alignment claim, drawn rather than
asserted. It plays once, holds on the aligned pose for about a second, then cuts back.

This is an illustration, not footage. There is no person and no real Pilo in it — it is
deliberately abstract for the same reason as the three step animations above. It works as a
supporting graphic next to the specs table or the comparison slider; a real clip of someone
lying down will always convert better.

```bash
python3 capture-head.py     # 36 frames from head-scene.html
python3 assemble-head.py    # writes head-on-pilo.gif and .mp4
```

`head-scene.html` is pure geometry driven by `window.render(t)`, `t` running 0 → 1. The
figure is one closed outline — points marked `H()` swing with the head, points marked `B()`
stay on the mattress — so the neck flexes without ever showing a seam at the shoulder.
