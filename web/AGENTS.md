# Web (for agents)

`@qdrant/web` holds the sections of Qdrant's marketing web pages (a hero, a feature grid, a pricing card, a call to action), built from the [design system](../design-system/). The qdrant.tech website itself lives in another repo; these sections are where its look is designed and reviewed.

Read these first. Their rules apply here too:

1. The [root `AGENTS.md`](../AGENTS.md).
2. [`design-system/AGENTS.md`](../design-system/AGENTS.md), including which "Never" rules apply to web UI.

## Rules for sections

- **Build from the design system.** Import components from `@qdrant/design-system`. A section never sets its own colors, fonts or radii.
- **Page layout** follows [`primitives/spacing/`](../primitives/spacing/), "Web and landing page layout": a 1440px design width, a 1110px content width, vertical section padding of 80 to 120px, never less than 80px, and 40 to 64px between a heading block and its content. The 165px side padding and the 30px column gap are off the 4px grid on purpose.
- **Breakpoints** come from [`primitives/breakpoints/`](../primitives/breakpoints/).
- **Pattern backgrounds** come from [`brand-assets/patterns/`](../brand-assets/patterns/), with its rules: they bleed off every edge, violet by default and red only with a yes, never two patterns or a pattern plus a generated image. Patterns render slowly, so render a section's background once per size, not on every resize.
- **Qbot, the logo and images** come from [`brand-assets/`](../brand-assets/) with their READMEs' rules. Qbot uses its own glow, `.qd-mascot--glow`.
- **Glows and textures belong in sections, not in components.** Components stay quiet; sections carry the brand moments.
- **Amaranth is an accent:** buttons, highlights, small marks. Never a flat fill behind text, and no gradient on text ([`primitives/colors/`](../primitives/colors/)).
- **Copy:** never invent it. Use the copy you're given, or ask.

## Adding a section

One file per section in `sections/`, named for what it is (`hero.tsx`, `feature-grid.tsx`). Add it to the studio's web page, check it there at 1440px and on a phone width, in dark and in light, then commit.
