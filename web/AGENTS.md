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
- **Glows and textures belong in sections, not in components** (Juan, 2026-11-16). Components stay quiet; sections carry the brand moments. Build a section's glows, background lights and star fields in the section file with CSS (gradients, blur), in Qdrant palette colors through their variables, absolutely positioned behind the content, `aria-hidden` and `pointer-events-none`, and softer on light. Never inside a component in `design-system/`.
- **Amaranth is the web's accent** (marketing; product UI uses indigo, [`design-system/AGENTS.md`](../design-system/AGENTS.md)): buttons, highlights, small marks. Never a flat fill behind text, and no gradient on text ([`primitives/colors/`](../primitives/colors/)).
- **Take the Figma's colors for diagrams and icons** (Juan, 2026-11-16): use the palette color nearest to each Figma color (by OKLab distance), through its `--qd-color-*` variable, never a hex. That's the dark-theme value for fills, borders and dots. Icons and colored text keep the nearest family but take the contrast steps in [`primitives/colors/`](../primitives/colors/): 400 or lighter on dark, 600 for icons and 700 or darker for text on light. Give every color a `light:` value.
- **Copy:** never invent it. Use the copy you're given, or ask.
- **Use the helpers in `lib/`:** `Section` for every section (padding, the content width, and `theme` for a light section on a dark page), `type` for headings and text, `ArrowLink` for "Read more >" links, `ASSETS` for the path to `assets/`, `MonoImage` for a one-color image that follows the theme (social marks, badges), and `CloudLogo` for the AWS, Google Cloud and Azure logos.
- **Images from a Figma** (illustrations, customer and partner logos, social marks, certification badges) go in `assets/`, exported from the Figma as they are: SVG for vectors, PNG for the rest (Juan, 2026-11-16). Never redraw or recolor one; a one-color image takes the theme's color through `MonoImage` instead. The one exception is a logo whose maker has a version for light backgrounds, like `aws-on-light.svg`. Ask before adding a photo: the repo is public and holds no photos or working files. Product screens drawn in a Figma are rebuilt with the design system's components instead (in `data-context="product"`, so their accent is indigo).

## Adding a section

One file per section in `sections/`, named for what it is (`hero.tsx`, `feature-grid.tsx`). Put it on a page in `pages/`, check it in the studio at 1440px and on a phone width, in dark and in light, then commit.
