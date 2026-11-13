# Radius

Qdrant's corner radius as tokens, from the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, exported 2026-11-12).

| File | What it is |
| --- | --- |
| `radius.tokens.json` | The source. W3C tokens, the Figma values exactly |
| `radius.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-radius-*` variables. Never edit it by hand |

## Scale

| Token | Value | Common use |
| --- | --- | --- |
| `radius.none` | 0 | Full-bleed and joined edges |
| `radius.xs` | 4px | Badges, pills, tags, copy buttons |
| `radius.sm` | 8px | Buttons, inputs, code blocks, small cards |
| `radius.md` | 16px | Cards, hero and CTA containers |
| `radius.lg` | 24px | Large containers |
| `radius.xl` | 32px | Luma cover cards |
| `radius.full` | 9999px | Pill shapes |

**The names moved one step on 2026-11-12.** Before, `radius.sm` was 4px, `radius.md` 8px, `radius.lg` 16px and `radius.card-luma` 32px (they lived in [`spacing/`](../spacing/)). The same px values are now `xs`, `sm`, `md` and `xl`. Nothing in the repo used the old variables; docs that named them were updated.

## Rules

- **Only these values.** A corner is never 6px or 12px.
- **Creatives scale their corners with the canvas** (the button, the headshot card, the light card), in px at the reference canvas. Those numbers live in their components; this scale is for web UI.
