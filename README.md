# Qdrant Labs Primitives

The building blocks for Qdrant Design Lab, written as code. Each folder is one primitive with its own README.

| Primitive | Status | What it is |
| --- | --- | --- |
| [`patterns/`](patterns/) | V1, ready to plug in | Brand background and generative patterns at any size and shape, drawn from color tokens. |
| [`imagery/`](imagery/) | Copied from Design Lab, live there | Generated images in a Qdrant style: rules, channel sizes, review checklist and the Default moodboard references. |
| [`mascot/`](mascot/) | Handoff, untested on Sunburst | Qbot in 3D (main) and 2D, with approved poses, prompts and scripts for new poses as transparent PNGs. |
| [`social-template/`](social-template/) | Draft | One HTML template for Qdrant social posts at any size, with a render script and brand checks (MKT-479). |

## Shared rules

- **Tokens are placeholders.** Colors and text styles come from Juan's design system. Until it lands, keep the token names and swap only the values.
- **Code, not images.** Primitives are drawn from tokens and small settings files, so they stay on-brand when the tokens change.
- **Any size.** Every primitive works at any width and height, from a square post to a wide banner.

## Adding a primitive

Add a folder with its own `README.md` (what it is, how to run it, how to add to it) and a row in the table above.
