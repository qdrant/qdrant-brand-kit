# Qdrant Labs Primitives

The building blocks for Qdrant creatives, written as code. Organised like [Primer Brand](https://primer.style/brand/): rules first, then brand assets, then the components built from both. Each folder has its own README.

## Primitives: the rules

Tokens and rules only. No finished designs.

| Folder | Status | What it is |
| --- | --- | --- |
| [`primitives/colors/`](primitives/colors/) | Interim values | The palette as tokens and CSS variables: core scales, semantic roles, dark and light themes, data viz, the brand gradient. |
| [`primitives/typography/`](primitives/typography/) | Interim values | Mona Sans and Geist Mono (font files included), the type scale, ss05/ss06, slide and document sizes. |
| [`primitives/spacing/`](primitives/spacing/) | Interim values | The 8px space scale, corner radius and web page layout constants. |
| [`primitives/layout/`](primitives/layout/) | V1 | Canvas, Grid, Stack and Box for social posts, ads and banners at any size: shapes, margins, safe zones, columns, gap roles, Box styles and checks. |

## Brand assets

Brand materials that components use.

| Folder | Status | What it is |
| --- | --- | --- |
| [`brand-assets/patterns/`](brand-assets/patterns/) | V1, ready to plug in | Brand background and generative patterns at any size and shape, drawn from color tokens. |
| [`brand-assets/imagery/`](brand-assets/imagery/) | Copied from Design Lab, live there | Generated images in a Qdrant style: rules, channel sizes, review checklist and the Default moodboard references. |
| [`brand-assets/mascot/`](brand-assets/mascot/) | Handoff, untested on Sunburst | Qbot in 3D (main) and 2D, with approved poses, prompts and scripts for new poses as transparent PNGs. |

## Components

| Folder | Status | What it is |
| --- | --- | --- |
| [`components/`](components/) | None approved yet | Ready-made parts (button, speaker card, partner lockup…) and whole posts (event promo, announcement…), built only from primitives and brand assets. |

The old social post template lives in its own archived repo: [qdrant-social-template](https://github.com/vanesaajdini/qdrant-social-template).

## Shared rules

- **Tokens are placeholders.** Colors and text styles come from Juan's design system. Until it lands, keep the token names and swap only the values. `primitives/colors/`, `primitives/typography/` and `primitives/spacing/` hold the interim values, from the qdrant-brand skill, with Design Lab's token names.
- **Code, not images.** Everything is drawn from tokens and small settings files, so it stays on-brand when the tokens change.
- **Any size.** Everything works at any width and height, from a square post to a wide banner.
- **Components use only what's here.** A component takes its values from primitives and its materials from brand assets. It never sets its own colors, sizes or gaps.

## Adding something

- **A rule** (tokens, scales, layout): a folder in `primitives/`.
- **A brand material** (patterns, images, mascot, logos): a folder in `brand-assets/`.
- **A ready-made piece:** a folder in `components/`. See [its README](components/README.md).

Each folder gets its own `README.md` (what it is, how to use it, how to add to it) and a row in the right table above.
