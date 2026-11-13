# Brand components

Ready-made pieces for Qdrant creatives, built only from [`primitives/`](../primitives/) (colors, type, spacing), the [layout rules](../guidelines/layout/) and [`brand-assets/`](../brand-assets/) (patterns, imagery, mascot). They belong to the brand. The design system and the web will have their own components (renamed from `components/` on 2026-11-12). Modelled on Primer Brand's components, which sit apart from its layout rules.

**Components are parts only.** There are no fixed post templates: an agent lays out each creative itself, following [`guidelines/`](../guidelines/) section 11 (Composition) and using the parts below (decided 2026-11-04).

A part is one piece used inside a creative: a button, a speaker card, the partner lockup, a stat card, or the badge (still to come).

## Adding one

One folder per component, `brand-components/<name>/`, with a `README.md` that has:

- **Sketch:** a picture of it on every shape it supports.
- **Use it for:** e.g. event with speakers, product announcement, customer stat.
- **Shapes:** which of ultrawide, wide, square, portrait and story it works on.
- **Size and inner gaps** per shape.
- **Approved by / date.**

Add a row here when it's approved:

| Component | Kind | Use it for | Shapes | Approved |
| --- | --- | --- | --- | --- |
| [`button`](button/) | Part | The call to action: Register, Start Free, Read more. Interim, until the Brand DS button | All | Vanesa, 2026-11-04 |
| [`headshot-card`](headshot-card/) | Part | Featured speakers: cutout on the headshot gradient, name and role below | Wide, square, portrait, story | Vanesa, 2026-11-04 |
| [`headshot-circle`](headshot-circle/) | Part | Small or many speakers, agenda slots, quieter posts | All | Vanesa, 2026-11-04 |
| [`partner-lockup`](partner-lockup/) | Part | Qdrant logo + partner logo: plus for collaborations and case studies, divider for regular co-branding | All | Vanesa, 2026-11-04 |
