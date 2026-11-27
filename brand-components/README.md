# Brand components

Ready-made pieces for Qdrant creatives, built only from [`primitives/`](../primitives/) (colors, type, spacing), the [layout rules](../guidelines/layout/) and [`brand-assets/`](../brand-assets/) (patterns, imagery, mascot). They belong to the brand. The design system and the web will have their own components (renamed from `components/` on 2026-11-12). Modelled on Primer Brand's components, which sit apart from its layout rules.

**Components are parts only.** There are no fixed post templates: an agent lays out each creative itself, following [`guidelines/`](../guidelines/) section 11 (Composition) and using the parts below (decided 2026-11-04).

A part is one piece used inside a creative: a button, a speaker card, the partner lockup, a stat card, or the badge (still to come).

**The design system's web components are not for creatives** (visual designer, 2026-11-19). `design-system/components/ui/` has parts with similar names, built for web pages: **Badge** (a red pill: creatives use the event label, guidelines section 11 rule 3), **Card** (its fill is the same dark as a creative's background, so it disappears: creatives use `.qd-box--card`, [`guidelines/layout/`](../guidelines/layout/)) and **Avatar** (falls back to initials: creatives use [`headshot-circle`](headshot-circle/) with the speaker's real photo). Creatives take their values from the design system's primitives, never its web components. **The exception is the [code block](code-block/)** (visual designer, 2026-11-25): code is drawn exactly like the design system's CodeBlock, with rules on top for creatives.

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
| [`button`](button/) | Part | The call to action: Register, Start Free, Read more | All | Visual designer, 2026-11-04 |
| [`headshot-card`](headshot-card/) | Part | Featured speakers: cutout on the headshot gradient, name and role below | Wide, square, portrait, story | Visual designer, 2026-11-04 |
| [`headshot-circle`](headshot-circle/) | Part | Small or many speakers, agenda slots, quieter posts | All | Visual designer, 2026-11-04 |
| [`partner-lockup`](partner-lockup/) | Part | Qdrant logo + partner logo: plus for collaborations and case studies, divider for regular co-branding | All | Visual designer, 2026-11-04 |
| [`code-block`](code-block/) | Part | Code: the design system's CodeBlock, open on calm patterns (up to 6 lines) or in a code window | All | Visual designer, 2026-11-25 (draft) |
