# Icons

Qdrant uses one icon set: **[Lucide](https://lucide.dev/icons/)** (open source, ISC license). Icons help say an action, a feature or an idea quickly. From Brand Guide 2.0, slides 38–39 (Figma `djCexPSttVyDjQXDo9Rka4`, nodes [1:9637](https://www.figma.com/design/djCexPSttVyDjQXDo9Rka4/?node-id=1-9637) and [1:10073](https://www.figma.com/design/djCexPSttVyDjQXDo9Rka4/?node-id=1-10073)). Rules decided by Vanesa on 2026-11-11.

| File | What it is |
| --- | --- |
| `icons.css` | `.qd-icon`: sizes the icon to the text beside it, scales the stroke, and sets an allowed color for the background |

**No icon files live here.** Get the icon from Lucide when you need it: the SVG from [lucide.dev/icons](https://lucide.dev/icons/) (copy SVG), inline in the page. Never draw or edit an icon yourself.

## Style

- **Lucide only.** Never another set, never mixed styles, never a redrawn or edited icon.
- **Outline, one color.** Lucide's own drawing: 24×24 grid, round caps and joins, no fill.
- **Clean backgrounds only.** A plain area, a calm, masked part of a pattern, or a calm pattern that isn't masked, like text.

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

- **On a pattern that isn't masked** (violet or red mid-tones, where a 400 disappears): **white**, the same color as the text beside it, with `.qd-icon--on-pattern` (decided 2026-11-11).
- **On dark backgrounds, a 400 color. On light backgrounds, a 600 color.** The light card counts as a light background, even in a dark creative. It must keep **3:1** contrast with what's behind it, so it's easy to scan. (Steps updated 2026-11-12 for the Figma ramps, where the brand colors sit at 600; before, it was a 500 on light.)
- Measured on the backgrounds in [`colors/`](../../primitives/colors/):

  | Background | Allowed | Not allowed |
  | --- | --- | --- |
  | Dark (`background.default`) | `neutral-400`, `amaranth-400`, `indigo-400` | Any other step |
  | Light (white, `neutral-25`, the light card) | `neutral-600`, `amaranth-600`, `indigo-600`, `blue-600`, `purple-600`, `red-600`, `teal-600` | `orange`, `green`, `cyan` (about 3:1 on white and under it on `neutral-50`), `pink` (never for brand marks) |

- This lets icons use the extended palette on light backgrounds, an exception to the "charts only" rule in `colors/`.
- In code, pick the color with a modifier. The theme decides the 400 or the 600:

  | Class | Dark | Light |
  | --- | --- | --- |
  | `.qd-icon` (default) | `neutral-400` | `neutral-600` |
  | `.qd-icon--amaranth` | `amaranth-400` | `amaranth-600` |
  | `.qd-icon--indigo` | `indigo-400` | `indigo-600` |
  | `.qd-icon--on-pattern` | white (`text.primary`), only on a pattern that isn't masked | not used |
  | `.qd-icon--blue`, `--purple`, `--red`, `--teal` | not allowed | the 600 |

  Renamed 2026-11-12 with the Figma color names: `--primary` is now `--amaranth`, `--secondary` is now `--indigo`, and the old `--indigo` (a Material blue) is now `--blue`.

## In creatives

- **Where:** next to supporting text, mostly the date / time / place row ([`guidelines/`](../../guidelines/) section 11, rule 12). One icon per line, before the text.
- **Never in buttons,** under any circumstance. Buttons are text only ([`brand-components/button/`](../../brand-components/button/)).
- **Icons aren't a text size.** They don't count toward the two text sizes.

```html
<link rel="stylesheet" href="brand-assets/icons/icons.css">

<div class="qd-stack qd-stack--row qd-stack--tight qd-icon-row">
  <svg class="qd-icon qd-icon--indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- Lucide "calendar", pasted from lucide.dev -->
  </svg>
  <p class="qd-supporting">Thursday, 4 December 2026</p>
</div>
```

## Do and don't (slide 39)

- **Do** scale the icon with its stroke (K in Figma), and use it on clean backgrounds.
- **Don't** distort or stretch it, forget to scale the stroke, add shadows, gradients or other effects, rotate it, fill it with a color, or outline it.

The checks are in [`guidelines/layout/checks.md`](../../guidelines/layout/checks.md) (row "Icons") and in [`review/`](../../review/).
