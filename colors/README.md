# Colors

The Qdrant palette as tokens. Values come from the qdrant-brand skill ([skills-internal/skills/design](https://github.com/qdrant/skills-internal/blob/main/skills/design/SKILL.md)). Names match Design Lab's `brand-kit/tokens/tokens.json`. Values are interim until Juan's design system lands: keep the names, swap the values.

| File | What it is |
| --- | --- |
| `colors.tokens.json` | W3C tokens: `core` scales, `semantic` roles (dark theme), `theme.light` overrides |
| `colors.css` | The same as `--qd-color-*` variables, with a `[data-theme="light"]` override |

## Core palette

| Scale | Key value | Use |
| --- | --- | --- |
| `primary` (Qdrant red) | 500 `#DC244C` | CTAs, highlights, the logo. 600 hover, 700 pressed |
| `secondary` (violet) | 500 `#6047FF` | Charts, secondary CTAs, code highlights |
| `neutral` | 950 `#0B0F19` | Backgrounds, surfaces, text, borders |
| Extended (teal, light blue, orange, purple, green, cyan, indigo, yellow, red) | 500 | Charts and data visualization only |
| `mascotGlow` | `#976BFF` | The mascot's glow only |
| `gradient.brand` | `#DC244C` → `#6047FF`, 135° | Hero moments only |

## Roles

Use the semantic roles, never core hex values.

| Role | Dark (default) | Light |
| --- | --- | --- |
| `background.default` | `#0B0F19` | `#FFFFFF` |
| `background.surface` | `#111824` | `#F7F8FA` |
| `background.surface-raised` | `#141A2A` | `#F0F3FA` |
| `text.primary` | `#F0F3FA` | `#0B0F19` |
| `text.secondary` | `#656B7F` | `#656B7F` |
| `border.on-dark` / `border.on-light` | `#4E5366` | `#D3D9EB` |
| `accent.primary` | `#DC244C` | `#DC244C` |

Also: `background.overlay` (modals), `background.popover`, `text.disabled`, `text.on-accent`, `text.body-on-light` (documents), `status.*` (success, error, warning, info).

## Data visualization

Use `dataviz.1` to `dataviz.8` in order: red, violet, teal, light blue, orange, purple, green, cyan.

## Rules

- **Dark theme is the default.** Light only for print, documents and light-mode UIs.
- **Red is an accent.** Never a large background fill. Design Lab caps a red fill at 15% of the canvas (to confirm with design).
- **The gradient is never applied to text**, and it's the only gradient.
- **Contrast:** text on dark uses `text.primary` or `text.secondary`. Never light gray on medium gray. Design Lab checks WCAG AA: 4.5 for body text, 3.0 for text from 24 px.
- **Charts:** never rely on color alone to carry meaning.
