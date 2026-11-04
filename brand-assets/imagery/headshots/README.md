# Headshots

How to choose and prepare a speaker's photo before it goes into [`headshot-card`](../../../components/headshot-card/) or [`headshot-circle`](../../../components/headshot-circle/). Used for speakers, event guests, new team members and YouTube thumbnails.

Qdrant doesn't shoot these photos. The job is choosing a good one and treating it the same way every time. From Brand Guide 2.0, slide 56 "Headshot Treatment" (Figma `djCexPSttVyDjQXDo9Rka4`, [node 1:12057](https://www.figma.com/design/djCexPSttVyDjQXDo9Rka4/?node-id=1-12057)).

| File | What it is |
| --- | --- |
| `check-headshot.py` | Checks a finished cutout. Needs Pillow |

## 1. Choose

- [ ] Front-facing.
- [ ] Framed from the shoulders up. Both sides and the top of the head fully visible.
- [ ] Clean, uncluttered background.
- [ ] The highest resolution you can find.
- [ ] Clean, well-lit and authentic.

**Never:** cropped shots (head or shoulders cut off), close-ups, black and white.

## 2. Treat, in Figma

1. **Boost resolution:** select the image, Image → Image tools (AI) → Boost Resolution.
2. **Remove the background:** Image → Image tools (AI) → Remove background. Always, for consistency.
3. **Adjust** brightness, contrast and saturation for a clean, consistent result.

## 3. Export the cutout

- PNG with a transparent background.
- Square, at least 512 × 512 px.
- Top of the head about 4% below the top edge (22 px on a 512 px square).
- Shoulders run off the bottom edge.

The components rely on this framing to place the head. [`leadership-headshots`](#examples) are examples.

## 4. Check it

```bash
python3 brand-assets/imagery/headshots/check-headshot.py path/to/cutout.png
```

It checks: transparent background, square and at least 512 px, color (not black and white), the head not cut off and about 4% from the top, shoulders running off the bottom, and not a close-up. Fix anything it lists and run it again. It can't judge lighting or expression: that's the checklist above.

## Examples

`Neil-Kanungo.png` and `David-Stockton.png` (512 × 512, kept outside the repo in `~/Desktop/Tools/leadership-headshots/`) pass every check.

## Rules

- **Every speaker has a photo.** If one is missing, ask for it. Don't make a post without it.
- **Never with Qbot.** Headshots and the mascot don't appear in the same creative.
