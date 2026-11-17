# Web

`@qdrant/web`: the sections of Qdrant's marketing web pages, built from the [design system](../design-system/) and previewed in the [studio](../studio/). The qdrant.tech website lives in another repo; this is where its sections are designed and reviewed. Separate from the brand creatives (social posts, ads, banners), which live in [`brand-components/`](../brand-components/) and [`guidelines/`](../guidelines/).

Agents: read [`AGENTS.md`](AGENTS.md).

| Path | What it is |
| --- | --- |
| `sections/` | One file per section (hero, feature grid, pricing card, call to action). The first ones make up the Resilience page |
| `pages/` | Sections put together into a page, shown in the studio at `/web/<page>`. First: `resilience.tsx`, rebuilt from the Figma (Qdrant Web Design, "Resilience-Subpage") |
| `lib/` | Helpers every section uses: `section.tsx` (padding and the 1110px content width), `type.tsx` (the web type scale), `arrow-link.tsx` (a text link with a chevron), `assets.tsx` (the path to `assets/`), `mono-image.tsx` (a one-color image in the text color) and `cloud-logo.tsx` (the cloud providers' logos) |
| `assets/` | The sections' images, exported from the Figma: `logos/` (cloud providers and customers), `social/`, `badges/` (certifications) and `illustrations/`. The studio serves them at `/repo/web/assets/` |
| `package.json` | The `@qdrant/web` package, with a `typecheck` script |

## Rules in short

Page layout from [`primitives/spacing/`](../primitives/spacing/) ("Web and landing page layout"), components from the design system, pattern backgrounds and Qbot from [`brand-assets/`](../brand-assets/). [`AGENTS.md`](AGENTS.md) has the full list.

## Add a section

Add `sections/<name>.tsx`, export the section, and show it on the studio's web page. Check it at 1440px and on a phone width, in dark and in light, before committing.
