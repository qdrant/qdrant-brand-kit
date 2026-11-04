# Logo

The Qdrant logo for creatives: the files, which one goes on which background, its size per shape, clear space and placement. For the logo next to a partner's, use the [`partner-lockup`](../../components/partner-lockup/) component.

Rules follow **Brand Guide 2.0** (Figma `djCexPSttVyDjQXDo9Rka4`, logo slides 10 to 21). Where the qdrant-brand design skill disagrees (minimum size, clear space, variant names), the Brand Guide wins.

## Files

Exported as SVG from the Qdrant Brand Design System file (`8y0svqBDPZX6caRNF6lddG`), page Components, frame [Logo](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=13653-113). Never redraw, recolor or rebuild them in code.

| File | Figma variant | What it is | Use it on |
| --- | --- | --- | --- |
| `qdrant-logo-dark.svg` | Qdrant-Logo `Color=Dark` (`13655:221`) | Red brandmark + white wordmark | Plain dark backgrounds and dark images |
| `qdrant-logo-white.svg` | Qdrant-Logo `Color=White` (`13655:371`) | All white | Patterns: violet, red and busy ones (mesh and generative) |
| `qdrant-logo-light.svg` | Qdrant-Logo `Color=Color4` (`13655:219`) | Red brandmark + dark wordmark. The Brand Guide calls it "Light"; Figma still says Color4 | The light card (`.qd-box--light-card`) and other light backgrounds |
| `qdrant-logo-black.svg` | Qdrant-Logo `Color=Black` (`13655:267`) | All dark (`neutral.950`) | Light backgrounds when color isn't wanted |
| `qdrant-brandmark-primary.svg` | Qdrant-Brandmark `Color=Primary` (`13655:129`) | Red brandmark, 3 tones | Not in creatives (see below) |
| `qdrant-brandmark-black.svg` | Qdrant-Brandmark `Color=Black` (`13655:131`) | One color, dark | Not in creatives |
| `qdrant-brandmark-white.svg` | Qdrant-Brandmark `Color=White` (`13655:169`) | One color, white | Not in creatives |

- The files keep Figma's own colors (hex inside the SVG). They're brand artwork, not tokens.
- `logo-black`, `brandmark-black` and `brandmark-white` have no SVG export setting in Figma, so their export also carried the Figma frame's background boxes. Those boxes were removed; the logo shapes are exactly as exported.
- SVG only. Make a PNG from the SVG when a tool needs one.

## Which version

| Background | Version |
| --- | --- |
| Plain dark canvas, dark Box, dark image | **Dark** |
| Any pattern: violet, red, mesh, generative | **White** |
| Light card, light background | **Light** (Black only when color isn't wanted) |

- Never the Dark logo on red: the red brandmark disappears.
- No effects, outlines or shadows. Don't distort, rotate, reposition its parts, change the typeface or use other colors (Brand Guide slide 17).

## Size

Logo height in px at each shape's reference canvas. `logo.css` scales it with `--qd-canvas-u`, like the margins and gaps in [`layout/`](../../primitives/layout/).

| Shape | Reference | Logo (w × h) | Clear space |
| --- | --- | --- | --- |
| `ultrawide` | 3000×400 | 270 × 72 | 27 |
| `wide` | 1920×1080 | 300 × 80 | 30 |
| `square` | 1080×1080 | 270 × 72 | 27 |
| `portrait` | 1080×1350 | 270 × 72 | 27 |
| `story` | 1080×1920 | 300 × 80 | 30 |

- **Minimum:** 24 px tall (90×24) on screen, 0.84 cm tall (3.1×0.84 cm) in print. A scaled-down canvas never takes the logo under 24 px.
- **Full logo only** in creatives. The brandmark on its own isn't used there.

## Clear space

Equal to the brandmark's **inner cube** on all four sides: 0.375 × the logo height (30 px at an 80 px logo). Nothing else goes in it: text, buttons, Qbot, screens. The canvas margin counts as clear space, so the logo sits right on the margin line. Backgrounds and patterns may run under it.

## Placement

- **Default: top-left**, leading the content. On the canvas inside the margins when text sits on the canvas or in a zone; on the light card inside its padding when text sits on the card ([guidelines/](../../guidelines/) section 8). On the light card the logo is smaller: 0.0967 × the card width, about 57 px on a 1080 square ([`layout/`](../../primitives/layout/) "Light card layout", decided 2026-11-04).
- **When it has to move** (no room, a busy or low-contrast area, or the visual must lead), the agent picks the spot that makes sense, following the Brand Guide (slide 19), and says where and why:
  - **Top:** upper left preferred, upper right allowed. For functional layouts.
  - **Bottom:** lower left preferred, lower right allowed. When other elements or the visual must take priority.
  - **Center:** only when the logo is on its own, with nothing else. Vertically centered.
- Always keep the clear space and the size.

## Use

```html
<link rel="stylesheet" href="primitives/layout/layout.css">
<link rel="stylesheet" href="brand-assets/logo/logo.css">

<div class="qd-canvas" data-shape="square" style="--qd-canvas-width: 1080; --qd-canvas-height: 1080">
  <img class="qd-logo" src="brand-assets/logo/qdrant-logo-dark.svg" alt="Qdrant">
  …
</div>
```

`logo.css` also sets `--qd-logo-height` and `--qd-logo-clear` on the canvas, for anything that needs to line up with the logo or keep out of its clear space.

## Not here yet

Partner logo files, logo animation, profile images and favicon.
