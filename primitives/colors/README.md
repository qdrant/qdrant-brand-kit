# Colors

The Qdrant palette as tokens. The primitives come from the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, exported 2026-11-12). This repo is the source of truth: Figma is synced from it.

| File | What it is |
| --- | --- |
| `colors.tokens.json` | The source. W3C tokens: `color` (the Figma primitives, exact, plus `neutral-975`, added here first and then to Figma on 2026-11-16, and a 975 for every other color on 2026-11-19), then this repo's brand layer, semantic tokens that stay out of the Figma file (it holds primitives only): `brand` (the brand color names), `asset`, `gradient`, `semantic` roles (dark theme) and `theme.light` overrides |
| `colors.css` | Generated from the JSON by [`../build.mjs`](../build.mjs): `--qd-color-*` and `--qd-gradient-*` variables. The dark roles are on `:root` and `[data-theme="dark"]`, the light ones on `[data-theme="light"]`, so any section can switch theme. Never edit it by hand |

## Primitives

11 families, each with 11 steps from 50 to 950, built in OKLCH on one lightness curve, so a step number means the same lightness in every family. A family's main color sits on the step that matches its natural lightness, so it isn't always 500. Each family also has a **975**, halfway from its 950 to black, like `neutral-975`: the deepest tint, for backgrounds in dark (added 2026-11-19).

| Family | Main color | Use |
| --- | --- | --- |
| `neutral` | Steps 0 (white), 25, 50 to 950, 850, 925, 975 and 1000 (black) | Backgrounds, surfaces, text, borders |
| `amaranth` | 600 `#DC244C` | Brand identity: calls to action, highlights, the logo |
| `indigo` | 600 `#6047FF` | Brand action and accent: charts, secondary calls to action, code highlights |
| `red` | 500 `#F24134` | Error and destructive |
| `orange` | 500 `#FE9800` | Warning |
| `green` | 600 `#3CA042` | Charts |
| `teal` | 600 `#009487` | Success |
| `cyan` | 500 `#00B7CF` | Charts |
| `blue` | 400 `#59A8E7` | Info |
| `purple` | 700 `#932EBC` | Charts |
| `pink` | 600 `#D02E9D` | Expressive only. Never for brand marks or calls to action |

- **Brand names:** `brand.amaranth` and `brand.indigo`, aliases of the two 600s (`--qd-color-brand-amaranth`, `--qd-color-brand-indigo`).
- **Legacy accent steps** (`a100`, `a200`, `a400`, `a700`) in nine families are Material Design accents, kept in the JSON only for Qdrant Cloud while it runs on MUI. They're marked `$deprecated` and aren't in `colors.css`. Never use them in creatives or web work.
- **`asset.mascotGlow`** `#976BFF`: Qbot's glow only ([`mascot/`](../../brand-assets/mascot/)), not part of the palette.

Before 2026-11-12 the families were `primary` (red, main at 500) and `secondary` (violet, main at 500), plus Material colors for charts. The brand red and violet didn't change; they now sit at 600. The patterns keep the old names in their own token file (see [`patterns/`](../../brand-assets/patterns/)).

## Gradients

| Token | Value | Use |
| --- | --- | --- |
| `gradient.brand` | `amaranth-600` → `indigo-600`, 135° | Hero moments only |
| `gradient.headshot` | `indigo-900` → `indigo-400`, both at 70%, 204° | Only behind headshots ([`headshot-card`](../../brand-components/headshot-card/), [`headshot-circle`](../../brand-components/headshot-circle/)) |

## Roles

Use the roles, never a primitive step, unless a README names one. They're the same groups and values as the Color collection in the Figma file [Qdrant Brand Design](https://www.figma.com/design/2u6KfDsYjibQuf9ji6lFBR/Qdrant-Brand-Design) (decided 2026-11-21): a role named `primary/hover` in Figma is `primary.hover` in `colors.tokens.json` and `--qd-color-primary-hover` in CSS. The main token of a group drops its repeated name: `primary/primary` is `--qd-color-primary`, and `secondary/secondary` is `--qd-color-secondary`.

| Role | Dark (default) | Light | Use |
| --- | --- | --- | --- |
| `text.primary` | `neutral-50` | `neutral-900` | Titles and body text |
| `text.secondary` | `neutral-500` | `neutral-600` | Supporting text, labels, captions |
| `text.disabled` | `neutral-600` | `neutral-400` | Placeholders and disabled text |
| `text.on-accent` | `neutral-0` | `neutral-0` | Text on primary and secondary, like a button label |
| `primary.primary` | `amaranth-600` | `amaranth-600` | Buttons and the one strong mark |
| `primary.hover` | `amaranth-700` | `amaranth-700` | The primary button on hover: it always darkens |
| `primary.subtle` | `amaranth-950` | `amaranth-100` | Soft fills: kickers, chips, highlights |
| `primary.text` | `amaranth-400` | `amaranth-800` | Colored text, links and icons |
| `secondary.secondary` | `indigo-600` | `indigo-600` | Secondary marks, and the accent in product UI |
| `secondary.subtle` | `indigo-950` | `indigo-100` | Tags and soft fills |
| `secondary.text` | `indigo-400` | `indigo-700` | Text and icons on its soft fill. Light was `indigo-800` until 2026-11-24 (design lead): 700 reads less dark and keeps 8.1:1 on white, 6.6:1 on `secondary.subtle` |
| `status.<state>.text` | 200 | 900 | Text and icons in badges and alerts |
| `status.<state>.subtle` | 950 | 100 | Badge fill |
| `status.<state>.alert-fill` | 975 | 50 | Alert fill |
| `status.<state>.border` | 950 | 200 | Alert border |
| `background.default` | `neutral-950` | `neutral-25` | The base of the page, slide or post |
| `background.raised` | `neutral-925` | `neutral-0` | Cards, panels and content blocks on the base |
| `background.overlay` | `neutral-850` | `neutral-0` | Menus, popovers, modals, tooltips, and a card inside a card |
| `background.highlight` | `neutral-800` | `neutral-50` | Selected states, chips, areas to draw attention to |
| `border.subtle` | `neutral-850` | `neutral-200` | Dividers and card outlines |
| `border.default` | `neutral-700` | `neutral-200` | Lines that need to show: chart gridlines, tables |
| `border.strong` | `neutral-500` | `neutral-500` | Fields and outline buttons, at 3:1 |
| `static.white` / `static.black` | `neutral-0` / `neutral-1000` | the same | On images and art, whatever the theme |

- **Status** has one group per state, in its family: `error` red, `warning` orange, `info` blue, `success` teal. So `status.success.text` is `teal-200` on dark and `teal-900` on light.
- The four background roles are the brand and marketing roles decided with the Figma primitives. A card is `raised`; a card inside a card is `overlay` ([`layout/`](../../guidelines/layout/) "Box").
- **Only in this repo, for creatives** (Figma's Color collection doesn't have them, and they don't change with the theme): `background.light` (`neutral-0`) and `background.light-surface` (`neutral-25`, the light card) for light pieces on a dark creative; `text.on-light` (`neutral-950`) and `text.body-on-light` (`neutral-800`, documents and the light card); `border.on-dark` (`neutral-700`) and `border.on-light` (`neutral-200`).
- **Before 2026-11-21** the brand accents were `accent.primary`, `accent.primary-hover`, `accent.primary-pressed` (removed: nothing used it, and Figma doesn't have it) and `accent.secondary`, and each status was one color (`status.success` `teal-600`, `status.error` `red-500`, `status.warning` `orange-500`, `status.info` `blue-400`). `text.primary` was `neutral-950` on light, and `dataviz.4` to `dataviz.8` used other steps (blue 400, orange 500, purple 700, cyan 500).

## Data visualization

Use `dataviz.1` to `dataviz.8` in order: amaranth, indigo, teal, blue, orange, purple, green, cyan, each family's 600 (its solid, step 7 of the palette) in both themes.

## Contrast

From the Figma primitives. These hold for every family and pass WCAG 2.2 AA (4.5:1 for text).

| Use | Step |
| --- | --- |
| Colored text or icons on the dark canvas (`neutral-950`) | 400 or lighter |
| Colored text or links on white | 700 or darker |
| White label on a filled button | 600 or darker for amaranth, indigo, red, blue, purple, pink. 700 or darker for orange, green, teal, cyan |
| Neutral body text, dark | `neutral-500` or lighter |
| Neutral body text, light | `neutral-600` or darker (`neutral-500` on white only for large text) |
| Tint badges and alerts | The status roles: `status.<state>.text` (900 on light, 200 on dark) on the badge fill (100, 950) or the alert fill (50, 975), at 8:1 or more |
| Borders of inputs, checkboxes and focus rings (3:1) | `neutral-600` on dark. `neutral-700` and `neutral-800` are for decorative borders only |

Supporting colors in marketing: on dark backgrounds, step 500 of any family. On light backgrounds, step 600 for fills and 700 for text.

## Rules

- **Dark theme is the default.** Light for print, documents, light-mode UIs, and some light moments in creatives, like the [Hybrid Cloud ad](https://www.figma.com/design/EXDtNCOBfmPCWabNex7sSJ/Campaigns?node-id=2760-5635) (decided 2026-11-04).
- **Amaranth is an accent** in UI and text: buttons, highlights, small marks. **Red pattern backgrounds are allowed** for creatives that need to grab attention (a red colorway, Hexagon-B, Dash-B), as [`guidelines/`](../../guidelines/) section 3 says (decided 2026-11-04). Never a flat amaranth fill behind text.
- **Two gradients, never on text.** `gradient.brand` for hero moments, `gradient.headshot` only behind headshot cutouts. No others: the [button](../../brand-components/button/) is a flat `amaranth-600` since 2026-11-19.
- **Never a hex value** in a creative, a component or a page. Use the variables.
- **Contrast:** text on dark uses `text.primary` or `text.secondary`. Never light gray on medium gray. Design Lab checks WCAG AA: 4.5 for body text, 3.0 for text from 24 px.
- **Charts:** never rely on color alone to carry meaning.
- **Icons:** a 400 on dark backgrounds, a 600 on light ones, at 3:1 or more. This includes the extended palette on light backgrounds, the one exception to "charts only" ([`brand-assets/icons/`](../../brand-assets/icons/), decided 2026-11-11, steps updated for the Figma ramps 2026-11-12).

## Changing a color

Change the value in `colors.tokens.json` (or in Figma first, then export), run `node primitives/build.mjs` from the repo root, and commit the JSON and the generated files together. `node primitives/build.mjs --check` fails if they're out of step.
