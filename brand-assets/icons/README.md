# Icons

Qdrant uses one icon set: **[Lucide](https://lucide.dev/icons/)** (open source, ISC license). Icons help say an action, a feature or an idea quickly. From Brand Guide 2.0, slides 38–39 (Figma `djCexPSttVyDjQXDo9Rka4`, nodes [1:9637](https://www.figma.com/design/djCexPSttVyDjQXDo9Rka4/?node-id=1-9637) and [1:10073](https://www.figma.com/design/djCexPSttVyDjQXDo9Rka4/?node-id=1-10073)). Rules decided by Vanesa on 2026-11-11.

| File | What it is |
| --- | --- |
| `icons.css` | `.qd-icon`: sizes the icon to the text beside it, scales the stroke, and sets an allowed color for the background |

**No icon files live here.** Get the icon from Lucide when you need it: the SVG from [lucide.dev/icons](https://lucide.dev/icons/) (copy SVG), inline in the page. Never draw or edit an icon yourself.

## Style

- **Lucide only.** Never another set, never mixed styles, never a redrawn or edited icon.
- **Outline, one color.** Lucide's own drawing: 24×24 grid, round caps and joins, no fill.
- **Clean backgrounds only.** A plain area, or a calm, masked part of a pattern, like text.

## Sizes

**In UI** (web, product, slides), from the Brand Guide:

| Size | Use | Stroke |
| --- | --- | --- |
| 16px | Dense or compact UI | 1px |
| 20px | A middle step for alignment or spacing | 1.5px |
| 24px | The base size for most icons | 2px |
| 48px / 64px | Larger elements: cards, banners, empty states | 2px |

**In creatives** (posts, ads, banners):

- **The icon is the same height as the text beside it:** the supporting size, 36px at 1080 (40px on story and wide), scaled with the canvas. `.qd-icon` does this.
- **The stroke scales with the icon.** Keep Lucide's `stroke-width="2"` on the 24 grid and let the SVG scale: 2px at 24 becomes 3px at 36. Never fix the stroke in px (no `vector-effect: non-scaling-stroke`). This is slide 39's "scale the stroke as well".
- **Gap to its text:** the shape's `tight` gap, in a `.qd-stack--row.qd-stack--tight`.

## Colors

- **On dark backgrounds, a 400 color. On light backgrounds, a 500 color.** It must keep **3:1** contrast with what's behind it, so it's easy to scan.
- Measured on the backgrounds in [`colors/`](../../primitives/colors/):

  | Background | Allowed | Not allowed (under 3:1) |
  | --- | --- | --- |
  | Dark | `neutral-400`, `primary-400`, `secondary-400` | Any 500 or other value |
  | Light | `indigo-500`, `purple-500`, `secondary-500`, `primary-500`, `red-500`, `teal-500`, `neutral-500` (white and `surface` only, not `surface-raised`) | `green-500`, `cyan-500`, `orange-500`, `yellow-500` |

- This lets icons use the extended palette on light backgrounds, an exception to the "charts only" rule in `colors/`.
- In code, pick the color with a modifier. The theme decides the 400 or the 500:

  | Class | Dark | Light |
  | --- | --- | --- |
  | `.qd-icon` (default) | `neutral-400` | `neutral-500` |
  | `.qd-icon--primary` | `primary-400` | `primary-500` |
  | `.qd-icon--secondary` | `secondary-400` | `secondary-500` |
  | `.qd-icon--indigo`, `--purple`, `--red`, `--teal` | not allowed | the 500 |

## In creatives

- **Where:** next to supporting text, mostly the date / time / place row ([`guidelines/`](../../guidelines/) section 11, rule 12). One icon per line, before the text.
- **Never in buttons,** under any circumstance. Buttons are text only ([`components/button/`](../../components/button/)).
- **Icons aren't a text size.** They don't count toward the two text sizes.

```html
<link rel="stylesheet" href="brand-assets/icons/icons.css">

<div class="qd-stack qd-stack--row qd-stack--tight qd-icon-row">
  <svg class="qd-icon qd-icon--secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- Lucide "calendar", pasted from lucide.dev -->
  </svg>
  <p class="qd-supporting">Thursday, 4 December 2026</p>
</div>
```

## Do and don't (slide 39)

- **Do** scale the icon with its stroke (K in Figma), and use it on clean backgrounds.
- **Don't** distort or stretch it, forget to scale the stroke, add shadows, gradients or other effects, rotate it, fill it with a color, or outline it.

The checks are in [`primitives/layout/checks.md`](../../primitives/layout/checks.md) (row "Icons") and in [`review/`](../../review/).
