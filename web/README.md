# Web

`@qdrant/web`: Qdrant's website section library, built from the [design system](../design-system/) and shown in the [studio](../studio/)'s Web page (canvas, docs, pages and a page builder). The qdrant.tech website lives in another repo; this is where its sections are designed, documented and reviewed, code-first. Separate from the brand creatives (social posts, ads, banners), which live in [`brand-components/`](../brand-components/) and [`guidelines/`](../guidelines/).

Agents: read [`AGENTS.md`](AGENTS.md).

| Path | What it is |
| --- | --- |
| `sections/` | One file per section (50, about 90 variants), each with its layouts as a prop. Navigation: announcement bar, navbar, anchor nav. Openers: hero, page header. Proof: logo cloud, stats, testimonials, case studies. Features: feature grid, feature rows, bento, feature tabs, steps, with and without. Developers: code showcase, install command, SDK grid, benchmark chart. Enterprise: architecture diagram, security and compliance. Pricing: pricing tiers, pricing calculator, comparison table. FAQ. Calls to action: CTA, promo banner. Forms: newsletter, contact, signup form. Listings: blog grid, resource cards, filterable index, integrations directory, events list. Content: article, legal, changelog. People and company: team grid, profile grid, partner directory, about story, values, backers. Community: community channels, community wall. Events: event agenda, sponsor tiers. Utility: not found. Footer. The `resilience-*`, `site-header`, `site-footer` and `cta-banner` files are the Resilience page's, built before the library |
| `registry/` | The library's catalog: each section's category, variants (ready-made props), docs and the fields the page builder edits. The studio's canvas, docs and builder read it |
| `content/` | Example content for the variants: real qdrant.tech copy, verbatim (`site.ts`: menus, heroes, the closing CTA, the footer; `sections.ts`: features, stats, steps, logos and the quickstart code; `conversion.ts`, `listings.ts`, `company.ts` and `platform.ts` for the rest) |
| `styles/web.css` | The website's surfaces (the design system's page, card, popover and highlight colors as the background roles, by theme and surface), lines and material, tones for icons, indigo hints and the trial type |
| `patterns/` | The patterns: backgrounds behind a section (starfield, orbits, horizon, coordinate grid, vector graph) and surfaces inside its cards (grain, indigo tint, dot corner, card grid), one file each, listed in `index.tsx`. Add one there and it shows in the studio and the builder |
| `pages/` | Sections put together into a page, shown in the studio's Web page under Pages. First: `resilience.tsx`, rebuilt from the Figma (Qdrant Web Design, "Resilience-Subpage") |
| `lib/` | Helpers every section uses: `section.tsx` (theme, surface, padding and the 1200px container), `section-header.tsx`, `type.tsx` (the web type scale and responsive headings), `link-button.tsx`, `icon.tsx` (Lucide icons by name), `logo.tsx`, `code-panel.tsx`, `copy-snippet.tsx`, `media-frame.tsx`, `arrow-link.tsx`, `assets.tsx`, `mono-image.tsx` and `cloud-logo.tsx` |
| `assets/` | The sections' images, exported from the Figma: `logos/` (cloud providers and customers), `social/`, `badges/` (certifications) and `illustrations/`. The studio serves them at `/repo/web/assets/` |
| `package.json` | The `@qdrant/web` package, with a `typecheck` script |

## Rules in short

Page layout from [`primitives/spacing/`](../primitives/spacing/) ("Web and landing page layout"), components from the design system, pattern backgrounds and Qbot from [`brand-assets/`](../brand-assets/). [`AGENTS.md`](AGENTS.md) has the full list.

## Add a section

Add `sections/<name>.tsx` and its entry in `registry/`, then check every variant in the studio's Web page (Docs tab) at desktop and phone width, in dark and in light, before committing. [`AGENTS.md`](AGENTS.md) has the steps.
