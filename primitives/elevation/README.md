# Elevation

Paper elevation for the product, Qdrant Cloud, while it runs on MUI: levels 0 to 24, mirroring MUI's paper elevation. From the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, exported 2026-11-12). New on 2026-11-12.

**Not for creatives, Design Lab or brand and marketing work.** Those use the background roles in [`colors/`](../colors/) (`default`, `raised`, `overlay`, `highlight`). It lives here because this repo is the source of truth for every primitive.

| File | What it is |
| --- | --- |
| `elevation.tokens.json` | The source. W3C tokens: `paper-elevation.light` and `paper-elevation.dark`, aliases of the neutral primitives in `colors/` |
| `elevation.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-paper-elevation-*` variables, dark on `:root` (this repo's default theme) and light on `[data-theme="light"]`. Never edit it by hand |

## Levels

| | Light | Dark |
| --- | --- | --- |
| `default` | `neutral-25` | `neutral-950` |
| 0 | `neutral-25` | `neutral-950` |
| 1 | `neutral-0` | `neutral-925` |
| 2 | `neutral-0` | `neutral-900` |
| 8 | `neutral-0` | `neutral-850` |
| 24 | `neutral-0` | `neutral-800` |

In light mode every level from 1 up is `neutral-0`. In dark mode, the levels between 2, 8 and 24 are computed colors with the same hue and saturation, so every level sits between two neutral steps.

The Figma export puts light on `:root` and dark on `.dark` (the shadcn convention). This repo keeps dark as the default everywhere, so `elevation.css` is the other way round. A MUI theme reads the JSON, not the CSS.
