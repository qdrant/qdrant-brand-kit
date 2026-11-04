# Components

Ready-made pieces for Qdrant creatives, built only from [`primitives/`](../primitives/) (colors, type, spacing, layout) and [`brand-assets/`](../brand-assets/) (patterns, imagery, mascot). Modelled on Primer Brand's components, which sit apart from its layout rules.

**Four parts are approved so far (button, headshot card, headshot circle, partner lockup), and no posts.** Until there are post components, an agent should say so and ask before laying out a creative.

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
| [`button`](button/) | Part | The call to action: Register, Start Free, Read more. Interim, until the Brand DS button | All | Vanesa, 2026-11-04 |
| [`headshot-card`](headshot-card/) | Part | Featured speakers: cutout on the headshot gradient, name and role below | Wide, square, portrait, story | Vanesa, 2026-11-04 |
| [`headshot-circle`](headshot-circle/) | Part | Small or many speakers, agenda slots, quieter posts | All | Vanesa, 2026-11-04 |
| [`partner-lockup`](partner-lockup/) | Part | Qdrant logo + partner logo: plus for collaborations and case studies, divider for regular co-branding | All | Vanesa, 2026-11-04 |
