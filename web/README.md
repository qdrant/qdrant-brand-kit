# Web

`@qdrant/web`: the sections of Qdrant's marketing web pages, built from the [design system](../design-system/) and previewed in the [studio](../studio/). The qdrant.tech website lives in another repo; this is where its sections are designed and reviewed. Separate from the brand creatives (social posts, ads, banners), which live in [`brand-components/`](../brand-components/) and [`guidelines/`](../guidelines/).

Agents: read [`AGENTS.md`](AGENTS.md).

| Path | What it is |
| --- | --- |
| `sections/` | One file per section (hero, feature grid, pricing card, call to action). Empty for now |
| `package.json` | The `@qdrant/web` package. Its `typecheck` script comes back with the first section |

## Rules in short

Page layout from [`primitives/spacing/`](../primitives/spacing/) ("Web and landing page layout"), components from the design system, pattern backgrounds and Qbot from [`brand-assets/`](../brand-assets/). [`AGENTS.md`](AGENTS.md) has the full list.

## Add a section

Add `sections/<name>.tsx`, export the section, and show it on the studio's web page. Check it at 1440px and on a phone width, in dark and in light, before committing.
