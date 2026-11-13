# Border width

Qdrant's border widths as tokens, from the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, exported 2026-11-12). New on 2026-11-12.

| File | What it is |
| --- | --- |
| `border-width.tokens.json` | The source. W3C tokens, the Figma values exactly |
| `border-width.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-border-width-*` variables. Never edit it by hand |

## Scale

| Token | Value | Use |
| --- | --- | --- |
| `border-width.hairline` | 0.5px | Very fine dividers on high-density screens |
| `border-width.thin` | 1px | Default borders and dividers |
| `border-width.medium` | 1.5px | Emphasis |
| `border-width.thick` | 2px | Focus rings, selected states |

Tailwind v4 has no theme namespace for border widths, so the design system adds them as utilities (`border-hairline`, `border-thin`, `border-medium`, `border-thick`).

## Rules

- **Borders only separate things.** They're never decoration ([`layout/`](../layout/) "Box").
- Creatives use their own canvas-scaled line width (`--qd-box-border-width` in [`layout/`](../layout/)), not this scale.
