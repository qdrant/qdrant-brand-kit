# Spacing

Qdrant's spacing scale as tokens, plus the web page layout constants. The scale comes from the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, exported 2026-11-12). Corner radius has its own folder now: [`radius/`](../radius/).

| File | What it is |
| --- | --- |
| `spacing.tokens.json` | The source. W3C tokens: `spacing` (the Figma scale, exact) and `layout` (web page constants) |
| `spacing.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-spacing-*` and `--qd-layout-*` variables. Never edit it by hand |

## Spacing scale

A 4 px grid. A token is named by its value in px, so `spacing.16` is 16 px (`--qd-spacing-16`). Use only these values:

| Token | 0 | 4 | 8 | 12 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80 | 88 | 96 | 104 | 112 | 120 | 144 | 160 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

In Tailwind (the shadcn design system, when it lands) the class number is the value ÷ 4: `p-4` is 16 px.

| Common use | Token |
| --- | --- |
| Micro-spacing inside small components | 4, 8, 12 |
| Icon to text, chip padding | 8 |
| Default gap between elements | 16 |
| Card padding, small section gap | 24 |
| Medium and large section gaps | 32, 48 |
| Section padding | 40 to 80 |
| Hero padding | 88 and up |

Before 2026-11-12 this was an 8 px scale named by step (`space.1` = 8 px to `space.11` = 88 px, and `space.half` = 4 px). Nothing outside this folder used those names. Creatives don't use this scale: their margins and gaps scale with the canvas ([`layout/`](../layout/)).

## Web and landing page layout

Designed at a 1440px viewport, content centered in a fixed container. For social posts, ads and banners, see [`layout/`](../layout/). These move to `web/` when that folder exists.

| Token | Value | Note |
| --- | --- | --- |
| `layout.viewport` | 1440px | Design width |
| `layout.content-width` | 1110px | |
| `layout.side-padding` | 165px | Off-grid on purpose: (1440 − 1110) / 2 |
| `layout.column-gap` | 30px | Off-grid on purpose: three 350px cards + two 30px gaps = 1110px |
| `layout.narrow-content` | 800px | FAQ and other narrow content |
| `layout.nav-height` | 110px | 64px on mobile |
| `layout.section-padding-min` / `-max` | 80px / 120px | Hero and content sections; CTA sections use 120px |
| `layout.heading-to-content-min` / `-max` | 40px / 64px | Gap between a heading block and its content |

Centered section titles can be constrained to 730 to 980px.

## Rules

- **No values off the scale.** 10px, 20px, 36px or 50px don't exist. Use the nearest token.
- **Web sections never go below 80px** of vertical padding.
- **Don't under-space the heading block.** 16px or 24px between a heading and its content is too tight on a marketing page.
- **Marketing pages need more room than product UI.** A 16px gap is fine in a dashboard, cramped on a landing page.
- **Don't "fix" the 30px column gap to 32px.** It's what makes 1110px add up.
