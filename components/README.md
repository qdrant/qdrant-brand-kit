# Components

Ready-made pieces for Qdrant creatives, built only from [`primitives/`](../primitives/) (colors, type, spacing, layout) and [`brand-assets/`](../brand-assets/) (patterns, imagery, mascot). Modelled on Primer Brand's components, which sit apart from its layout rules.

**None approved yet.** Until there are some, an agent should say so and ask before laying out a creative.

## Two kinds

| Kind | What it is | Examples |
| --- | --- | --- |
| **Part** | One piece used inside a post | Button, speaker card, partner logo lockup, stat card, date / time / place row |
| **Post** | A whole layout for one kind of post, made from parts | Event promo, announcement, customer stat, quote |

## Adding one

One folder per component, `components/<name>/`, with a `README.md` that has:

- **Sketch:** a picture of it on every shape it supports.
- **Use it for:** e.g. event with speakers, product announcement, customer stat.
- **Kind:** part or post.
- **Shapes:** which of ultrawide, wide, square, portrait and story it works on (posts only).
- **Slots per shape:** column start and span, order, and the gap role between each slot (posts), or size and inner gaps (parts).
- **Parts used** (posts only).
- **Approved by / date.**

Add a row here when it's approved:

| Component | Kind | Use it for | Shapes | Approved |
| --- | --- | --- | --- | --- |
