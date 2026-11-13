# Breakpoints

Qdrant's breakpoints as tokens, from the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, exported 2026-11-12). New on 2026-11-12. For web UI only: creatives pick a shape from their width and height instead ([`layout/`](../layout/)).

| File | What it is |
| --- | --- |
| `breakpoints.tokens.json` | The source. W3C tokens, the Figma values exactly |
| `breakpoints.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-breakpoint-*` variables. Never edit it by hand |

## Scale

Minimum widths: a breakpoint applies from its width up.

| Token | Min width |
| --- | --- |
| `breakpoint.xs` | 444px |
| `breakpoint.sm` | 600px |
| `breakpoint.md` | 900px |
| `breakpoint.lg` | 1200px |
| `breakpoint.xl` | 1536px |

## Rules

- **CSS variables don't work inside `@media`.** Write the px value there (`@media (min-width: 900px)`), or use the design system's Tailwind prefixes (`md:`), which come from these tokens.
- Web pages are designed at a 1440px viewport ([`spacing/`](../spacing/) "Web and landing page layout").
