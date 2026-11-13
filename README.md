# Qdrant Marketing Brand System

The building blocks for Qdrant marketing creatives (social posts, ads, banners, events) and the design system for web UI, written as code. Product UI comes later and will use the same design system. Organised like [Primer Brand](https://primer.style/brand/): rules first, then brand assets, then the components built from both. Each folder has its own README.

**Agents: start with [`AGENTS.md`](AGENTS.md).** It gives the reading order and the rules never to break.

## Primitives: the rules

Tokens and rules only. No finished designs. Each folder's `.tokens.json` is the source; its `.css` is generated with `node primitives/build.mjs` (typography's CSS is kept in step by hand).

| Folder | Status | What it is |
| --- | --- | --- |
| [`primitives/colors/`](primitives/colors/) | Figma primitives, 2026-11-12 | The palette as tokens and CSS variables: 11 color families from Figma, brand names, roles for dark and light, data viz, the brand and headshot gradients. |
| [`primitives/typography/`](primitives/typography/) | V1, Figma scales added | Mona Sans and Geist Mono (font files included), the Figma size, line-height and letter-spacing scales, every text style (incl. condensed, mono and social), sizes per channel, hierarchy, emphasis and misuse rules. |
| [`primitives/spacing/`](primitives/spacing/) | Figma primitives, 2026-11-12 | The 4px spacing scale and the web page layout constants. |
| [`primitives/radius/`](primitives/radius/) | Figma primitives, 2026-11-12 | Corner radius, from none to full. |
| [`primitives/border-width/`](primitives/border-width/) | Figma primitives, 2026-11-12 | Border widths: hairline, thin, medium, thick. |
| [`primitives/breakpoints/`](primitives/breakpoints/) | Figma primitives, 2026-11-12 | Breakpoints for web UI, xs to xl. |
| [`primitives/elevation/`](primitives/elevation/) | Figma primitives, 2026-11-12. Product only | Paper elevation 0 to 24 for Qdrant Cloud on MUI. Not used by creatives or marketing. |

## Guidelines: choosing and combining

| Folder | Status | What it is |
| --- | --- | --- |
| [`guidelines/`](guidelines/) | V1 | Which pattern to pick by tone, when red is allowed, how patterns cover the canvas, one hero per creative, Qbot and product screens on patterns, logo, headline length, and what to ask the person first. |
| [`guidelines/layout/`](guidelines/layout/) | V1 | Canvas, Grid, Stack and Box for social posts, ads and banners at any size: shapes, margins, safe zones, columns, gap roles, Box styles and checks. |

## Brand assets

Brand materials that components use.

| Folder | Status | What it is |
| --- | --- | --- |
| [`brand-assets/logo/`](brand-assets/logo/) | V1 | The Qdrant logo and brandmark as SVG from Figma, which version on which background, size per shape, clear space and placement. |
| [`brand-assets/icons/`](brand-assets/icons/) | V1 | Lucide icons: rules only, no files. Style, sizes, stroke, colors per background, where icons go in creatives. |
| [`brand-assets/patterns/`](brand-assets/patterns/) | V1, ready to plug in | Brand background and generative patterns at any size and shape, drawn from color tokens. |
| [`brand-assets/imagery/`](brand-assets/imagery/) | Copied from Design Lab, live there | Generated images in a Qdrant style: rules, channel sizes, review checklist and the Default moodboard references. Plus how to prepare speaker headshots. |
| [`brand-assets/mascot/`](brand-assets/mascot/) | Handoff, untested on Sunburst | Qbot in 3D (main) and 2D, with approved poses, prompts and scripts for new poses as transparent PNGs. |

## Brand components

| Folder | Status | What it is |
| --- | --- | --- |
| [`brand-components/`](brand-components/) | Button, headshot card, headshot circle, partner lockup approved | Ready-made parts for creatives, built only from primitives and brand assets. They belong to the brand: the design system and the web will have their own components. No fixed post templates: creatives are composed by the rules in `guidelines/` section 11. |

The old social post template lives in its own archived repo: [qdrant-social-template](https://github.com/vanesaajdini/qdrant-social-template).

## Design system, web and studio

Code packages in one pnpm workspace. Run `pnpm install` once from the repo root, then `pnpm dev` to open the studio.

| Folder | Status | What it is |
| --- | --- | --- |
| [`design-system/`](design-system/) | New, 2026-11-12 | The UI component library: shadcn on Base UI, styled only through the primitives. Dark by default, with a light theme |
| [`web/`](web/) | New, empty | Sections of the marketing web pages, built from the design system |
| [`studio/`](studio/) | New, preview page | The workshop app that shows the design system and the web sections on the real tokens. Never ships |

## Review

| Folder | Status | What it is |
| --- | --- | --- |
| [`review/`](review/) | New | Review a creative before it's shown: render it at exact sizes, check it against the rules, make a contact sheet. Mechanics only: every value comes from the repo. |

## Shared rules

- **This repo is the source of truth for the primitives.** They match the Figma file Qdrant Design System Primitives (`UUpGTk4Ifmpr0FwNr6pXVg`, 2026-11-12); Figma is synced from here. Change the `.tokens.json`, run `node primitives/build.mjs`, and commit both.
- **Code, not images.** Everything is drawn from tokens and small settings files, so it stays on-brand when the tokens change.
- **Any size.** Everything works at any width and height, from a square post to a wide banner.
- **Components use only what's here.** A component takes its values from primitives and its materials from brand assets. It never sets its own colors, sizes or gaps.

## Adding something

- **A token** (colors, type, spacing, radius, and other scales): a folder in `primitives/`.
- **A rule for choosing and combining** (layout, composition): `guidelines/`, or a folder inside it.
- **A brand material** (patterns, images, mascot, logos): a folder in `brand-assets/`.
- **A ready-made piece for creatives:** a folder in `brand-components/`. See [its README](brand-components/README.md).
- **A UI component:** `design-system/components/qdrant/`, or a shadcn component from the studio. See [its README](design-system/README.md).
- **A web section:** a file in `web/sections/`. See [its README](web/README.md).

Each folder gets its own `README.md` (what it is, how to use it, how to add to it) and a row in the right table above.
