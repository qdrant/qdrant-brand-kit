# Web (for agents)

`@qdrant/web` is Qdrant's website section library: every section a site the size of qdrant.tech needs (navigation, heroes, features, proof, pricing, FAQ, calls to action, listings, footers and more), built from the [design system](../design-system/), with variants, docs and a page builder in the studio's Web page (Juan, 2026-11-21). The qdrant.tech website itself lives in another repo; this is where its sections are designed, documented and reviewed. The work is code-first: a section is built and approved here, and goes to Figma afterwards.

Read these first. Their rules apply here too:

1. The [root `AGENTS.md`](../AGENTS.md).
2. [`design-system/AGENTS.md`](../design-system/AGENTS.md), including which "Never" rules apply to web UI.

## The website's rules

The website's rules (layout, type, color, links, icons, actions, lines, patterns, content) are in [`guidelines.ts`](guidelines.ts), shown first in the studio's Web page, Docs, Guidelines. They're for this repo and for the Hugo build: the dev team and their agents build qdrant.tech from them. Read them all before you build or change a section. Each section's own rules are in its registry entry.

**When Juan decides a rule for the website, add it to `guidelines.ts` in the same commit as the change** (Juan, 2026-11-22): in its group, as a short title and what it means in practice, with who decided it and when, and where its values live. Change a rule there when it changes. Don't keep a second copy of a rule here; this file says only how to work in this repo.

## How sections are built

- **Import components from `@qdrant/design-system`** and style through tokens and the website's classes in [`styles/web.css`](styles/web.css), loaded after the design system's `globals.css`. A page's root has `data-web` and a `data-theme`; `Section` sets each section's `data-theme` and `data-surface`.
- **Every section has the shared props** from `lib/section.tsx` (`theme`, `surface`, `pattern`, `cardPattern`, `id`, `className`) and takes its content as props, so pages and the builder can fill it. Example content lives in [`content/`](content/): real qdrant.tech copy, verbatim. A slot the site has no copy for stays empty.
- **Use the helpers in `lib/`:** `Section` for every section (theme, surface, padding, the 1200px container or `narrow` or `full`, the rails and seams), `SectionHeader` for a section's kicker, title, text and actions (stacked, split or with an action on the right), `heading` for responsive headings (page, section, statement, card) and `type` for text, `LinkButton` for every call to action, `ArrowLink` for "Read more >" links, `Icon` for Lucide icons named in content, `IconTile` and `toneAt(i)` for icons ([`lib/tone.tsx`](lib/tone.tsx)), `Node` for the hexagon where lines meet and before kickers, steps and tabs (`solid` over a line, `active` for the current one), `Plate` for cards, `Logo`, `CodePanel`, `CopySnippet`, `MediaFrame` for a media slot under review, `ASSETS` for the path to `assets/`, `MonoImage` for a one-color image that follows the theme (social marks, badges), and `CloudLogo` for the AWS, Google Cloud and Azure logos.
- **Cards are `Plate`s** ([`lib/plate.tsx`](lib/plate.tsx)): every card, panel and tile renders `<Plate as="li" …>`, never a div with `web-plate`, so the section's `cardPattern` reaches it. Media (code panels, image slots) keep `web-plate` as a class.
- **Lines and material are classes** in `styles/web.css`: `web-tray` for a framed holder around media, `web-grid` for a hairline grid of cells (it reaches the rails and draws every line in one color), `web-cells` for a row of facts, `web-rule` for a divider, and `web-bleed` on a horizontal line inside a section so it reaches the rails. Use them instead of a new border or fill.
- **Links are classes too:** `web-link` for a text link, `web-link-quiet` for a card title or a crumb that turns indigo on hover. Colored text takes `--web-indigo-text` or `--web-link`, marks take `--web-indigo` (the values by theme are in `styles/web.css`).
- **Patterns** live in [`patterns/`](patterns/), one file each (see "Adding a pattern"). A section passes `pattern` and `cardPattern` straight to `Section`. Never draw a pattern in a section's own file. A brand pattern from [`brand-assets/patterns/`](../brand-assets/patterns/) renders slowly, so render a section's background once per size, not on every resize.
- **Effects, when they come,** go in the section file with CSS (gradients, blur), in palette colors through their variables, absolutely positioned behind the content, `aria-hidden` and `pointer-events-none`. Never inside a component in `design-system/`. Qbot uses its own glow, `.qd-mascot--glow`.
- **Images** go in `assets/`, exported from the Figma as they are. A one-color image takes the theme's color through `MonoImage`; the one exception is a logo whose maker has a version for light backgrounds, like `aws-on-light.svg`. Product screens drawn in a Figma are rebuilt with the design system's components (in `data-context="product"`, so their accent is indigo).
- **Style switches** compare the website with and without a decision: `data-web-lines`, `data-web-material`, `data-web-patterns` and `data-web-indigo` set to `"off"`, and `data-web-type="current"` for the type set as it is (the trial type moves into `primitives/typography` if it's kept, with Vanesa's yes). The studio's Canvas, Docs and Builder have them.

## Adding a section

1. **The section**: one file in `sections/`, named for what it is (`hero.tsx`, `feature-grid.tsx`), one exported component that takes `SectionProps` plus its content, and passes `theme`, `surface`, `pattern`, `cardPattern`, `id` and `className` to `Section`. Layouts are a prop (`layout`), not separate files. Cards are `Plate`s; icons are `IconTile`s.
2. **Its registry entry**: a file in `registry/` with `defineSection`: its category, a one-line summary, its variants (ready-made props from `content/`, each with a name and a line on when to use it), its docs (when to use it, rules, anatomy, props) and the fields the page builder can edit. Add it to `registry/index.ts`. The studio's canvas, docs and builder read the registry, so a section without an entry doesn't exist for them.
3. **Check it** in the studio's Web page: every variant in the Docs tab, in dark and light, at desktop and phone width, then on the Canvas. Fix what reads wrong, then commit.

`web/sections` also holds the Resilience page's sections (`resilience-*`, `site-header`, `site-footer`, `cta-banner`), built before the library. They stay as a reference page until it's rebuilt from the library, then they go.

## Adding a pattern

One file in `patterns/` exporting `definePattern({ id, name, kind, description, Layer })`: `kind` is `"background"` (behind a section) or `"surface"` (inside each card). `Layer` is a component that fills its parent (absolute, inset 0), still and subtle, in the website's variables, in both themes. List it in `patterns/index.tsx`. It then shows in the studio's Patterns tab, in the builder's pattern pickers, and on any section through `pattern` or `cardPattern`.
