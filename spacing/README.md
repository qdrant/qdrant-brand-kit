# Spacing

Qdrant's 8px grid, page layout and corner radius as tokens. Values come from the qdrant-brand skill ([skills-internal/skills/design](https://github.com/qdrant/skills-internal/blob/main/skills/design/SKILL.md)). Names match Design Lab's `brand-kit/tokens/tokens.json`.

| File | What it is |
| --- | --- |
| `spacing.tokens.json` | W3C tokens: space scale, radius, web layout constants |
| `spacing.css` | `--qd-space-*`, `--qd-radius-*` and `--qd-layout-*` variables |

## Space scale

Every spacing value is a multiple of 8. 4px half-steps are for micro-spacing inside small components only.

| Token | Value | Common use |
| --- | --- | --- |
| `space.half` | 4px | Micro-spacing only |
| `space.1` | 8px | Icon to text, chip padding |
| `space.2` | 16px | Default gap between elements |
| `space.3` | 24px | Card padding, small section gap |
| `space.4` | 32px | Medium section gap |
| `space.5` | 40px | Section padding |
| `space.6` | 48px | Large section gap |
| `space.7` | 56px | Feature section gap |
| `space.8` | 64px | Page section break |
| `space.9` | 72px | Large section break |
| `space.10` | 80px | Major section break |
| `space.11` | 88px | Hero padding |

The scale keeps going in 8px steps.

## Corner radius

| Token | Value | Use |
| --- | --- | --- |
| `radius.sm` | 4px | Badges, pills, tags, copy buttons |
| `radius.md` | 8px | Cards, buttons, inputs, code blocks |
| `radius.lg` | 16px | Hero and CTA containers, prominent cards |
| `radius.full` | 9999px | Pill shapes |
| `radius.card-luma` | 32px | Luma cover cards (added in Design Lab) |

## Web and landing page layout

Designed at a 1440px viewport, content centered in a fixed container.

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

Centered section titles can be constrained to 730–980px.

## Rules

- **No values off the scale.** 10px, 36px or 50px don't exist. Use the nearest multiple of 8.
- **Web sections never go below 80px** of vertical padding.
- **Don't under-space the heading block.** 16px or 24px between a heading and its content is too tight on a marketing page.
- **Marketing pages need more room than product UI.** A 16px gap is fine in a dashboard, cramped on a landing page.
- **Don't "fix" the 30px column gap to 32px.** It's what makes 1110px add up.
