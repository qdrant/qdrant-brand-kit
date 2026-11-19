# Breakpoints

Qdrant's breakpoints as tokens: Tailwind's defaults, which shadcn uses (Juan, 2026-11-18), so the design system, the product and Figma share one set. The Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`) has the same values. Until 2026-11-18 they were xs 444, sm 600, md 900, lg 1200 and xl 1536. For web UI only: creatives pick a shape from their width and height instead ([`layout/`](../../guidelines/layout/)).

| File | What it is |
| --- | --- |
| `breakpoints.tokens.json` | The source. W3C tokens, Tailwind's default values |
| `breakpoints.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-breakpoint-*` variables. Never edit it by hand |

## Scale

Minimum widths: a breakpoint applies from its width up.

| Token | Min width |
| --- | --- |
| `breakpoint.sm` | 640px |
| `breakpoint.md` | 768px |
| `breakpoint.lg` | 1024px |
| `breakpoint.xl` | 1280px |
| `breakpoint.2xl` | 1536px |

## Rules

- **CSS variables don't work inside `@media`.** Write the px value there (`@media (min-width: 768px)`), or use the design system's Tailwind prefixes (`sm:` to `2xl:`), which have the same widths.
- **Don't change them** for one page or design: the product will use the same design system (Juan, 2026-11-18).
- Web pages are designed at a 1440px viewport ([`spacing/`](../spacing/) "Web and landing page layout").
