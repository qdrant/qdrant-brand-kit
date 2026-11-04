# Headshots

How to choose and prepare a speaker's photo before it goes into [`headshot-card`](../../../components/headshot-card/) or [`headshot-circle`](../../../components/headshot-circle/). Used for speakers, event guests, new team members and YouTube thumbnails.

Qdrant doesn't shoot these photos. The job is choosing a good one and treating it the same way every time. From Brand Guide 2.0, slide 56 "Headshot Treatment" (Figma `djCexPSttVyDjQXDo9Rka4`, [node 1:12057](https://www.figma.com/design/djCexPSttVyDjQXDo9Rka4/?node-id=1-12057)).

**No Figma needed.** `prepare-headshot.py` does the whole treatment on your own computer. Figma is one other way to do it, not a requirement.

| File | What it is |
| --- | --- |
| `prepare-headshot.py` | Photo in, finished cutout out: removes the background, boosts resolution if it can, adjusts, crops to the standard framing, then checks it |
| `check-headshot.py` | Checks a finished cutout, however it was made |

## 1. Choose

- [ ] Front-facing.
- [ ] Framed from the shoulders up. Both sides and the top of the head fully visible.
- [ ] Clean, uncluttered background.
- [ ] The highest resolution you can find. The person should be at least 512 px tall from the top of the head to the bottom of the photo.
- [ ] Clean, well-lit and authentic.

**Never:** cropped shots (head or shoulders cut off), close-ups, black and white.

An agent can check this list by looking at the photo before preparing it.

## 2. Prepare

```bash
python3 brand-assets/imagery/headshots/prepare-headshot.py path/to/photo.jpg
```

It writes `photo-cutout.png` next to the photo (`-o name.png` to choose the name; several photos at once also work). In order, it:

1. **Removes the background** with [rembg](https://github.com/danielgatis/rembg). Open source and runs on your computer, so photos never leave it. Skipped when the photo is already a cutout.
2. **Boosts resolution** with [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN), when the photo is small and Real-ESRGAN is installed. Without it, a photo where the person is under 480 px tall is rejected: ask for a bigger one.
3. **Adjusts brightness, contrast and saturation:** the same mild correction for everyone (contrast clipped at 0.5%, saturation +5%, brightness unchanged). Values are at the top of the script. Change them only with design's OK.
4. **Crops to the standard framing** (below).
5. **Runs `check-headshot.py`** on the result and prints OK or what to fix.

### What it needs

Nothing here is installed by the brand system. Whoever runs the script installs these once:

| Tool | For | Install |
| --- | --- | --- |
| Python 3 + Pillow | Everything | `pip install pillow` |
| rembg | Removing the background | `pip install "rembg[cpu]"` (downloads a ~170 MB model the first time) |
| Real-ESRGAN (optional) | Boosting small photos | The portable `realesrgan-ncnn-vulkan` from the [releases page](https://github.com/xinntao/Real-ESRGAN/releases), on the PATH. No Python needed |

If rembg is missing, the script still works on photos whose background is already removed, and says what to install when it isn't.

### Other ways to remove the background

Any tool works as long as the result passes `check-headshot.py`: Figma (Image → Image tools (AI) → Remove background, and Boost Resolution), or another editor. Then run `prepare-headshot.py` on the PNG to get the same adjustments and framing as everyone else.

Avoid online background removers for speakers' photos unless the speaker has agreed: they upload the photo to a third party.

## 3. The standard framing

- PNG with a transparent background.
- Square, 1024 × 1024 px (512 × 512 at the least).
- Top of the head 4% below the top edge (22 px on 512, 44 px on 1024).
- Head centered. Shoulders run off the bottom edge.

The components rely on this framing to place the head.

## 4. Check it

```bash
python3 brand-assets/imagery/headshots/check-headshot.py path/to/cutout.png
```

`prepare-headshot.py` already runs this. Run it on its own for cutouts made another way. It checks: transparent background, square and at least 512 px, color (not black and white), the head not cut off and 2 to 8% from the top, shoulders running off the bottom, and not a close-up. It can't judge lighting or expression: that's the checklist in step 1.

## Examples

`Neil-Kanungo.png` and `David-Stockton.png` (512 × 512, kept outside the repo in `~/Desktop/Tools/leadership-headshots/`) pass every check, and `prepare-headshot.py` keeps them at the same framing.

## Rules

- **Every speaker has a photo.** If one is missing, ask for it. Don't make a post without it.
- **Never with Qbot.** Headshots and the mascot don't appear in the same creative.
