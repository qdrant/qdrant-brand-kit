# Qdrant Labs Primitives

The building blocks for Qdrant Design Lab, written as code. Each folder is one primitive with its own README.

| Primitive | Status | What it is |
| --- | --- | --- |
| [`colors/`](colors/) | Interim values | The palette as tokens and CSS variables: core scales, semantic roles, dark and light themes, data viz, the brand gradient. |
| [`typography/`](typography/) | Interim values | Mona Sans and Geist Mono (font files included), the type scale, ss05/ss06, slide and document sizes. |
| [`spacing/`](spacing/) | Interim values | The 8px space scale, corner radius and web page layout constants. |
| [`patterns/`](patterns/) | V1, ready to plug in | Brand background and generative patterns at any size and shape, drawn from color tokens. |
| [`imagery/`](imagery/) | Copied from Design Lab, live there | Generated images in a Qdrant style: rules, channel sizes, review checklist and the Default moodboard references. |
| [`layout/`](layout/) | V1, no compositions yet | Canvas, Grid, Stack and Box for social posts, ads and banners at any size: shapes, margins, safe zones, columns, gap roles, Box styles and checks. |
| [`mascot/`](mascot/) | Handoff, untested on Sunburst | Qbot in 3D (main) and 2D, with approved poses, prompts and scripts for new poses as transparent PNGs. |

The social post template lives in its own repo: [qdrant-social-template](https://github.com/vanesaajdini/qdrant-social-template).

## Shared rules

- **Tokens are placeholders.** Colors and text styles come from Juan's design system. Until it lands, keep the token names and swap only the values. `colors/`, `typography/` and `spacing/` hold the interim values, from the qdrant-brand skill, with Design Lab's token names.
- **Code, not images.** Primitives are drawn from tokens and small settings files, so they stay on-brand when the tokens change.
- **Any size.** Every primitive works at any width and height, from a square post to a wide banner.

## Adding a primitive

Add a folder with its own `README.md` (what it is, how to run it, how to add to it) and a row in the table above.
