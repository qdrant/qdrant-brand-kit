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

- **Dark theme is the default.** Light for documents, light-mode UIs, and some light moments in creatives, like the [Hybrid Cloud ad](https://www.figma.com/design/EXDtNCOBfmPCWabNex7sSJ/Campaigns?node-id=2760-5635) (decided 2026-11-04).
- **Print uses both themes, light or dark** (visual designer, 2026-11-26). It replaces "light for print" (2026-11-04). The other color rules hold in print too: no hex values, no gradients on text, red backgrounds only with a yes. How to choose for a printed piece is in [`guidelines/print/`](../../guidelines/print/).
- **Amaranth is an accent** in UI and text: buttons, highlights, small marks. **Red pattern backgrounds are allowed** for creatives that need to grab attention (an amaranth colorway), as [`guidelines/`](../../guidelines/) section 3 says (decided 2026-11-04). Never a flat amaranth fill behind text.
- **Two gradients, never on text.** `gradient.brand` for hero moments, `gradient.headshot` only behind headshot cutouts. No others: the [button](../../brand-components/button/) is a flat `amaranth-600` since 2026-11-19.
- **Never a hex value** in a creative, a component or a page. Use the variables.
- **Contrast:** text on dark uses `text.primary` or `text.secondary`. Never light gray on medium gray. Design Lab checks WCAG AA: 4.5 for body text, 3.0 for text from 24 px.
- **Charts:** never rely on color alone to carry meaning.
- **Icons:** a 400 on dark backgrounds, a 600 on light ones, at 3:1 or more. This includes the extended palette on light backgrounds, the one exception to "charts only" ([`brand-assets/icons/`](../../brand-assets/icons/), decided 2026-11-11, steps updated for the Figma ramps 2026-11-12).

## Print: CMYK and Pantone (visual designer, 2026-11-27)

How the brand colors print. **HEX stays the master** (digital). Each color also has a **CMYK build for Europe** (PSO Coated v3, FOGRA51) and **one for the US** (GRACoL 2006), and a **Pantone** spot color (Solid Coated, C; on uncoated paper use the same number, U). Every step also has them in `colors.tokens.json`, under `$extensions.qdrant.print` (`cmykEurope`, `cmykUS`, `pantone`, `pantoneBrand`, `deltaE2000`). How to use them in print is in [`guidelines/print/`](../../guidelines/print/).

### The brand values

| Role | Token | HEX | Pantone | CMYK Europe | CMYK US |
| --- | --- | --- | --- | --- | --- |
| Amaranth | `amaranth-600` | #DC244C | 192 C | C2 M93 Y54 K4 | C6 M97 Y58 K1 |
| Indigo | `indigo-600` | #6047FF | 2725 C | C75 M65 Y0 K0 | same |
| Dark background | `neutral-950` | #070B11 | Black 6 C | C90 M70 Y45 K90 | C25 M10 Y0 K100 |
| Raised surface, dark | `neutral-925` | #0F151D | Black 6 C | C50 M25 Y5 K95 | same |
| Light background | `neutral-25` | #F8F8F9 | none (paper) | C0 M0 Y0 K5 | same |
| White | `neutral-0` | #FFFFFF | none (paper) | no ink (paper) | same |
| Text on dark | `neutral-50` | #F3F3F5 | none (paper) | no ink (paper) | same |
| Secondary text, dark | `neutral-500` | #889099 | 430 C | C45 M31 Y24 K15 | C50 M35 Y30 K5 |
| Secondary text, light | `neutral-600` | #636D79 | 4129 C | C56 M42 Y29 K29 | C62 M47 Y38 K18 |
| Headshot gradient, dark end | `indigo-900` | #352B83 | 6329 C | C94 M93 Y1 K3 | C94 M99 Y7 K1 |
| Headshot gradient, light end | `indigo-400` | #8385FF | 2715 C | C60 M40 Y0 K0 | same |
| Red | `red-500` | #F24134 | 3556 C | C0 M84 Y79 K0 | same |
| Orange | `orange-500` | #FE9800 | 2013 C | C0 M45 Y90 K0 | C0 M48 Y95 K0 |
| Green | `green-600` | #3CA042 | 7738 C | C71 M4 Y87 K6 | C75 M10 Y95 K0 |
| Teal | `teal-600` | #009487 | 7473 C | C76 M10 Y47 K12 | C81 M18 Y52 K3 |
| Cyan | `cyan-500` | #00B7CF | 3125 C | C71 M0 Y17 K0 | same |
| Blue | `blue-400` | #59A8E7 | 284 C | C63 M21 Y0 K0 | same |
| Purple | `purple-700` | #932EBC | 2592 C | C60 M85 Y0 K0 | same |
| Pink | `pink-600` | #D02E9D | Pink C | C20 M85 Y0 K0 | C22 M87 Y0 K0 |

### How the values were made

- **CMYK:** ICC conversion with LittleCMS, relative colorimetric with black point compensation. Europe: PSO Coated v3 (FOGRA51). US: GRACoL 2006 (Coated GRACoL 2006). Each build is the one with the lowest ΔE 2000 for its region within the print rules: total ink 300% or less, no tint under 5%, and light text on dark prints as paper (no ink).
- **Pantone:** the closest Solid Coated (C) color by ΔE 2000. On uncoated paper, use the same number (U); it looks a bit duller.
- **Screen-simulated, not proofed.** Check the printer's proof. If the printer gives a different profile, convert with theirs and compare.
- **Out of the CMYK gamut, so expect them to look duller:** `indigo-600` (ΔE about 12), `indigo-400`, purple, and the 300 to 600 indigo and purple steps. A Pantone spot color is closer when the color matters (for example purple 2592 C, ΔE 2.0).

### Every step (reference builds)

For reference: only the brand values above are set. Pantone for the other steps is the closest match, for reference. ΔE 2000 in brackets.

<details><summary>All steps, by family</summary>

| Token | HEX | CMYK Europe | CMYK US | Pantone |
| --- | --- | --- | --- | --- |
| `neutral-0` | #FFFFFF | C0 M0 Y0 K0 (0.0) | C0 M0 Y0 K0 (0.0) | **none (paper)** (brand) |
| `neutral-25` | #F8F8F9 | C0 M0 Y0 K5 (0.7) | C0 M0 Y0 K5 (0.9) | **none (paper)** (brand) |
| `neutral-50` | #F3F3F5 | C0 M0 Y0 K0 (2.5) | C0 M0 Y0 K0 (2.5) | **none (paper)** (brand) |
| `neutral-100` | #E6E7EA | C11 M7 Y5 K0 (0.0) | C9 M7 Y6 K0 (1.8) | 663 C (3) |
| `neutral-200` | #D7D9DD | C16 M11 Y9 K0 (0.5) | C16 M11 Y10 K0 (1.0) | 427 C (2.4) |
| `neutral-300` | #CDD0D5 | C21 M14 Y11 K1 (1.4) | C21 M15 Y12 K0 (0.3) | 427 C (2.2) |
| `neutral-400` | #ADB2B9 | C32 M22 Y18 K5 (0.3) | C35 M25 Y21 K1 (1.4) | 6337 C (3.2) |
| `neutral-500` | #889099 | C45 M31 Y24 K15 (0.0) | C50 M35 Y30 K5 (1.0) | **430 C (4)** (brand) |
| `neutral-600` | #636D79 | C56 M42 Y29 K29 (0.0) | C62 M47 Y38 K18 (0.0) | **4129 C (2.8)** (brand) |
| `neutral-700` | #4A5563 | C64 M48 Y31 K42 (0.0) | C71 M56 Y43 K29 (0.7) | 4139 C (2.4) |
| `neutral-800` | #2C3543 | C73 M56 Y34 K61 (0.0) | C82 M69 Y50 K50 (0.7) | 7546 C (3.6) |
| `neutral-850` | #1F2835 | C77 M60 Y35 K70 (0.7) | C88 M76 Y53 K61 (1.3) | 4280 C (2) |
| `neutral-900` | #141B25 | C80 M63 Y38 K80 (0.8) | C91 M80 Y59 K74 (1.5) | 7547 C (1.9) |
| `neutral-925` | #0F151D | C50 M25 Y5 K95 (1.7) | C50 M25 Y5 K95 (1.9) | **Black 6 C (1.4)** (brand) |
| `neutral-950` | #070B11 | C90 M70 Y45 K90 (1.9) | C25 M10 Y0 K100 (2.1) | **Black 6 C (4.3)** (brand) |
| `neutral-975` | #040609 | C83 M65 Y48 K93 (3.2) | C86 M76 Y69 K92 (1.1) | Black 6 C (6) |
| `neutral-1000` | #000000 | C83 M67 Y51 K95 (3.7) | C86 M76 Y71 K96 (0.7) | Black 6 C (7.6) |
| `amaranth-50` | #FDF1F2 | C1 M7 Y3 K0 (0.2) | C0 M7 Y3 K0 (1.4) | 663 C (5.2) |
| `amaranth-100` | #FCE5E7 | C1 M13 Y5 K0 (0.2) | C1 M13 Y5 K0 (0.2) | 705 C (2.9) |
| `amaranth-200` | #FACFD5 | C1 M24 Y8 K0 (0.8) | C0 M24 Y8 K0 (0.0) | 706 C (1.3) |
| `amaranth-300` | #F9A6B2 | C0 M44 Y15 K0 (1.0) | C0 M45 Y15 K0 (0.9) | 1765 C (2) |
| `amaranth-400` | #F67186 | C0 M67 Y29 K0 (1.2) | C0 M69 Y26 K0 (1.4) | 1777 C (2.6) |
| `amaranth-500` | #F14463 | C0 M83 Y45 K0 (1.2) | C0 M85 Y42 K0 (1.4) | 1785 C (2.9) |
| `amaranth-600` | #DC244C | C2 M93 Y54 K4 (0.5) | C6 M97 Y58 K1 (0.5) | **192 C (1.8)** (brand) |
| `amaranth-700` | #BA1E41 | C6 M93 Y55 K21 (0.3) | C18 M100 Y64 K8 (0.4) | 193 C (1.2) |
| `amaranth-800` | #9B1E3D | C11 M92 Y48 K35 (0.6) | C25 M100 Y61 K22 (0.3) | 7420 C (1.4) |
| `amaranth-900` | #821F3B | C18 M90 Y42 K45 (0.3) | C30 M100 Y55 K35 (0.0) | 208 C (1.7) |
| `amaranth-950` | #480D1C | C35 M91 Y45 K72 (0.5) | C44 M99 Y62 K69 (1.5) | 4102 C (3.9) |
| `amaranth-975` | #24060E | C60 M86 Y44 K86 (1.1) | C65 M87 Y63 K87 (3.1) | 4975 C (8) |
| `indigo-50` | #EFF2FF | C7 M4 Y0 K0 (2.7) | C5 M4 Y0 K0 (3.3) | 656 C (4.9) |
| `indigo-100` | #E1E7FF | C13 M8 Y0 K0 (3.0) | C11 M7 Y0 K0 (3.5) | 2706 C (4.7) |
| `indigo-200` | #C9D1FF | C24 M16 Y0 K0 (5.5) | C21 M15 Y0 K0 (6.1) | 2120 C (4.7) |
| `indigo-300` | #A8B2FF | C40 M29 Y0 K0 (7.4) | C36 M27 Y0 K0 (7.4) | 2716 C (3.7) |
| `indigo-400` | #8385FF | C60 M40 Y0 K0 (6.9) | C60 M40 Y0 K0 (6.7) | **2715 C (6.5)** (brand) |
| `indigo-500` | #695DFD | C78 M70 Y0 K0 (13.1) | C75 M67 Y0 K0 (11.6) | 2725 C (7.4) |
| `indigo-600` | #6047FF | C75 M65 Y0 K0 (11.7) | C75 M65 Y0 K0 (11.8) | **2725 C (8.3)** (brand) |
| `indigo-700` | #4A2CD3 | C96 M93 Y0 K0 (10.3) | C84 M80 Y0 K0 (10.1) | 2098 C (5.7) |
| `indigo-800` | #3D29A9 | C96 M95 Y0 K0 (5.1) | C87 M87 Y0 K0 (6.8) | 2098 C (2) |
| `indigo-900` | #352B83 | C94 M93 Y1 K3 (0.6) | C94 M99 Y7 K1 (1.6) | **6329 C (0.8)** (brand) |
| `indigo-950` | #201A4B | C93 M92 Y15 K51 (0.0) | C98 M100 Y42 K35 (4.4) | 275 C (1.3) |
| `indigo-975` | #100D26 | C93 M82 Y27 K78 (0.7) | C98 M98 Y57 K71 (3.7) | 5255 C (4) |
| `red-50` | #FDF2F2 | C1 M6 Y3 K0 (1.2) | C0 M7 Y3 K0 (1.4) | 663 C (5.2) |
| `red-100` | #FDE3E1 | C0 M14 Y8 K0 (0.8) | C0 M14 Y7 K0 (0.0) | 705 C (3.6) |
| `red-200` | #FDCBC9 | C0 M26 Y14 K0 (0.8) | C0 M26 Y13 K0 (0.8) | 6275 C (3) |
| `red-300` | #FCA6A1 | C0 M44 Y27 K0 (1.3) | C0 M45 Y25 K0 (1.3) | 169 C (3.2) |
| `red-400` | #F96D65 | C0 M69 Y53 K0 (2.2) | C0 M70 Y51 K0 (1.8) | 2345 C (1.6) |
| `red-500` | #F24134 | C0 M84 Y79 K0 (1.2) | C0 M84 Y79 K0 (1.1) | **3556 C (1.8)** (brand) |
| `red-600` | #DF2107 | C1 M93 Y100 K4 (0.0) | C3 M96 Y100 K1 (1.6) | 2347 C (1.3) |
| `red-700` | #BA1B05 | C5 M95 Y100 K21 (0.4) | C16 M100 Y100 K9 (4.0) | 3517 C (4.3) |
| `red-800` | #991D10 | C10 M93 Y90 K36 (0.5) | C24 M100 Y100 K23 (1.7) | 484 C (4) |
| `red-900` | #7D2119 | C18 M89 Y79 K48 (0.6) | C28 M98 Y96 K38 (0.6) | 7623 C (4.8) |
| `red-950` | #430D08 | C32 M91 Y65 K76 (0.0) | C45 M97 Y84 K73 (2.3) | 4102 C (7.5) |
| `red-975` | #220604 | C55 M84 Y52 K88 (1.6) | C62 M85 Y73 K89 (2.6) | 4975 C (8) |
| `orange-50` | #FFFBEF | C0 M2 Y7 K0 (0.2) | C0 M2 Y7 K0 (1.4) | 6428 C (7.8) |
| `orange-100` | #FFF2CF | C0 M5 Y22 K0 (1.1) | C0 M5 Y22 K0 (1.1) | 6232 C (2.9) |
| `orange-200` | #FFE49B | C0 M10 Y45 K0 (0.7) | C0 M10 Y45 K0 (0.7) | 1205 C (2.3) |
| `orange-300` | #FFD066 | C0 M19 Y66 K0 (0.7) | C0 M19 Y67 K0 (0.0) | 134 C (1.2) |
| `orange-400` | #FFB82C | C0 M31 Y85 K0 (1.0) | C0 M31 Y86 K0 (0.8) | 1235 C (1.1) |
| `orange-500` | #FE9800 | C0 M45 Y90 K0 (1.8) | C0 M48 Y95 K0 (1.7) | **2013 C (0.2)** (brand) |
| `orange-600` | #E07111 | C2 M61 Y93 K6 (0.5) | C7 M65 Y100 K1 (0.5) | 6263 C (1.1) |
| `orange-700` | #B84E19 | C8 M73 Y89 K22 (0.0) | C19 M78 Y100 K10 (0.4) | 167 C (1.9) |
| `orange-800` | #943D1B | C16 M76 Y84 K36 (0.0) | C25 M82 Y98 K25 (1.0) | 7526 C (2.4) |
| `orange-900` | #79341A | C22 M76 Y80 K49 (0.6) | C30 M82 Y97 K40 (0.6) | 1685 C (2.5) |
| `orange-950` | #451A0A | C33 M80 Y70 K75 (0.3) | C42 M88 Y92 K71 (1.1) | 4625 C (5.5) |
| `orange-975` | #220D05 | C55 M75 Y57 K88 (2.1) | C60 M81 Y79 K88 (1.1) | 4975 C (8.5) |
| `green-50` | #F2FCF4 | C5 M0 Y6 K0 (1.2) | C5 M0 Y6 K0 (2.6) | 621 C (6.6) |
| `green-100` | #E1FAE6 | C13 M0 Y12 K0 (4.0) | C12 M0 Y14 K0 (5.0) | 621 C (7.3) |
| `green-200` | #C5F4CF | C24 M0 Y23 K0 (5.8) | C24 M0 Y25 K0 (6.5) | 2253 C (2.6) |
| `green-300` | #97ECA8 | C40 M0 Y44 K0 (7.6) | C41 M0 Y46 K0 (7.7) | 2267 C (3.4) |
| `green-400` | #63D874 | C58 M0 Y70 K0 (7.7) | C58 M0 Y70 K0 (7.2) | 2268 C (2.2) |
| `green-500` | #4CC255 | C66 M0 Y82 K0 (4.6) | C65 M0 Y83 K0 (3.5) | 6409 C (2.1) |
| `green-600` | #3CA042 | C71 M4 Y87 K6 (0.0) | C75 M10 Y95 K0 (0.4) | **7738 C (1.6)** (brand) |
| `green-700` | #317E38 | C73 M12 Y86 K27 (0.4) | C80 M26 Y100 K11 (0.6) | 356 C (3.3) |
| `green-800` | #2A6331 | C73 M20 Y82 K44 (0.5) | C81 M35 Y99 K28 (0.6) | 7483 C (3.8) |
| `green-900` | #24512C | C72 M25 Y77 K56 (0.0) | C82 M41 Y96 K42 (0.0) | 357 C (2.2) |
| `green-950` | #102D16 | C74 M36 Y72 K78 (0.6) | C84 M55 Y95 K71 (2.1) | 5605 C (6.6) |
| `green-975` | #08160B | C76 M51 Y62 K89 (1.6) | C83 M66 Y81 K87 (3.3) | Black 3 C (6.4) |
| `teal-50` | #F1FDFA | C6 M0 Y3 K0 (1.4) | C5 M0 Y4 K0 (2.8) | 6148 C (6.2) |
| `teal-100` | #CFFAF0 | C17 M0 Y10 K0 (6.8) | C18 M0 Y11 K0 (6.9) | 573 C (5.2) |
| `teal-200` | #9FF5E2 | C31 M0 Y18 K0 (8.8) | C35 M0 Y20 K0 (8.9) | 331 C (4.2) |
| `teal-300` | #5FEAD2 | C47 M0 Y29 K0 (9.4) | C52 M0 Y28 K0 (9.7) | 3533 C (3.7) |
| `teal-400` | #13D3BB | C62 M0 Y38 K0 (7.1) | C65 M0 Y37 K0 (6.9) | 2239 C (1.4) |
| `teal-500` | #00B9A4 | C71 M0 Y44 K0 (2.1) | C73 M0 Y44 K0 (1.9) | 6376 C (2.4) |
| `teal-600` | #009487 | C76 M10 Y47 K12 (0.4) | C81 M18 Y52 K3 (0.4) | **7473 C (2.4)** (brand) |
| `teal-700` | #0C766D | C78 M20 Y49 K29 (0.4) | C84 M29 Y57 K16 (0.0) | 328 C (1.8) |
| `teal-800` | #115E58 | C78 M27 Y49 K44 (0.3) | C85 M37 Y61 K31 (0.8) | 7720 C (2.1) |
| `teal-900` | #164E49 | C78 M32 Y49 K55 (0.0) | C86 M43 Y64 K43 (0.9) | 6384 C (1.7) |
| `teal-950` | #082F2D | C81 M42 Y49 K73 (0.0) | C91 M55 Y69 K67 (0.8) | 5467 C (2.7) |
| `teal-975` | #041817 | C84 M52 Y51 K87 (2.0) | C91 M67 Y73 K84 (1.3) | 5463 C (6.4) |
| `cyan-50` | #EEFEFE | C7 M0 Y1 K0 (2.7) | C6 M0 Y2 K0 (3.7) | 6148 C (6.4) |
| `cyan-100` | #D3F9FB | C16 M0 Y5 K0 (4.8) | C16 M0 Y5 K0 (5.9) | 628 C (6.2) |
| `cyan-200` | #ABF2F7 | C29 M0 Y9 K0 (6.3) | C31 M0 Y8 K0 (7.6) | 317 C (4.5) |
| `cyan-300` | #6AE8F3 | C45 M0 Y13 K0 (7.5) | C49 M0 Y11 K0 (7.9) | 318 C (4.7) |
| `cyan-400` | #00D2E6 | C62 M0 Y16 K0 (5.5) | C65 M0 Y14 K0 (6.0) | 2226 C (2.3) |
| `cyan-500` | #00B7CF | C71 M0 Y17 K0 (0.3) | C71 M0 Y17 K0 (0.6) | **3125 C (2.6)** (brand) |
| `cyan-600` | #0092AE | C75 M13 Y16 K14 (0.4) | C80 M23 Y24 K2 (0.6) | 632 C (1.1) |
| `cyan-700` | #05758D | C78 M24 Y21 K29 (0.7) | C85 M36 Y32 K10 (0.0) | 6131 C (1.3) |
| `cyan-800` | #145F72 | C80 M33 Y27 K39 (0.6) | C87 M46 Y40 K22 (0.7) | 7470 C (1.9) |
| `cyan-900` | #194E5F | C80 M41 Y30 K48 (0.7) | C89 M55 Y44 K32 (0.0) | 2182 C (1.3) |
| `cyan-950` | #0B3341 | C85 M49 Y33 K65 (0.0) | C96 M67 Y52 K52 (0.3) | 547 C (2.8) |
| `cyan-975` | #061920 | C87 M57 Y41 K84 (1.5) | C96 M76 Y65 K78 (1.3) | 5395 C (3.8) |
| `blue-50` | #F0F6FC | C6 M2 Y1 K0 (1.8) | C5 M2 Y1 K0 (1.8) | 656 C (3.8) |
| `blue-100` | #DCEBF8 | C15 M4 Y1 K0 (0.8) | C14 M3 Y1 K0 (0.7) | 656 C (3) |
| `blue-200` | #C1DCF3 | C26 M6 Y0 K0 (0.0) | C25 M6 Y1 K0 (1.0) | 2707 C (2.5) |
| `blue-300` | #94C7EF | C44 M11 Y0 K0 (1.7) | C43 M10 Y0 K0 (1.2) | 283 C (1.7) |
| `blue-400` | #59A8E7 | C63 M21 Y0 K0 (2.5) | C63 M21 Y0 K0 (2.1) | **284 C (2.2)** (brand) |
| `blue-500` | #298BE1 | C75 M37 Y0 K0 (3.9) | C75 M37 Y0 K0 (3.5) | 279 C (1.8) |
| `blue-600` | #0070CF | C85 M53 Y0 K0 (3.7) | C84 M53 Y0 K0 (3.1) | 285 C (0.8) |
| `blue-700` | #005EB6 | C91 M62 Y0 K0 (1.7) | C89 M62 Y0 K0 (1.7) | 300 C (0.3) |
| `blue-800` | #004B9A | C98 M71 Y0 K1 (0.7) | C97 M74 Y2 K0 (0.8) | 2945 C (0.7) |
| `blue-900` | #144179 | C92 M69 Y9 K27 (0.0) | C98 M80 Y22 K8 (0.4) | 4154 C (1.2) |
| `blue-950` | #13294A | C91 M71 Y22 K58 (0.5) | C100 M89 Y42 K40 (1.6) | 2767 C (0.3) |
| `blue-975` | #0A1525 | C89 M67 Y33 K81 (1.4) | C99 M89 Y58 K73 (1.4) | 7547 C (4.5) |
| `purple-50` | #FAF5FF | C3 M5 Y0 K0 (1.6) | C2 M5 Y0 K0 (1.8) | 663 C (5) |
| `purple-100` | #F5EAFF | C6 M9 Y0 K0 (4.1) | C4 M9 Y0 K0 (4.8) | 7436 C (4.8) |
| `purple-200` | #EBD4FF | C13 M19 Y0 K0 (6.6) | C9 M18 Y0 K0 (7.3) | 531 C (4.6) |
| `purple-300` | #E1B3FF | C24 M34 Y0 K0 (9.6) | C19 M32 Y0 K0 (9.9) | 2562 C (5.1) |
| `purple-400` | #D283FF | C39 M55 Y0 K0 (13.5) | C35 M51 Y0 K0 (12.9) | 2572 C (6.7) |
| `purple-500` | #C655FF | C53 M72 Y0 K0 (17.5) | C49 M68 Y0 K0 (15.2) | 252 C (8.2) |
| `purple-600` | #AF38E4 | C62 M84 Y0 K0 (14.8) | C58 M79 Y0 K0 (13.0) | 2582 C (5.6) |
| `purple-700` | #932EBC | C60 M85 Y0 K0 (8.1) | C60 M85 Y0 K0 (8.1) | **2592 C (2)** (brand) |
| `purple-800` | #792999 | C69 M93 Y0 K0 (3.4) | C66 M93 Y0 K0 (4.2) | 527 C (2.9) |
| `purple-900` | #64277B | C69 M93 Y3 K9 (0.0) | C74 M100 Y11 K2 (1.4) | 2613 C (2.2) |
| `purple-950` | #411252 | C75 M98 Y10 K44 (0.6) | C84 M100 Y40 K30 (6.9) | 2627 C (1.5) |
| `purple-975` | #210929 | C82 M94 Y25 K74 (0.5) | C89 M100 Y54 K69 (5.7) | 2695 C (7) |
| `pink-50` | #FAF3FA | C3 M5 Y0 K0 (1.7) | C2 M6 Y0 K0 (0.2) | 663 C (4.3) |
| `pink-100` | #F7E8F7 | C4 M11 Y0 K0 (1.3) | C2 M11 Y0 K0 (1.6) | 7436 C (3.3) |
| `pink-200` | #F2D2F1 | C8 M21 Y0 K0 (3.3) | C5 M21 Y0 K0 (3.4) | 517 C (3.6) |
| `pink-300` | #ECACE6 | C15 M39 Y0 K0 (6.4) | C11 M38 Y0 K0 (6.0) | 2065 C (2.5) |
| `pink-400` | #E474D3 | C24 M63 Y0 K0 (8.1) | C20 M62 Y0 K0 (7.7) | 2375 C (1.4) |
| `pink-500` | #DE4EBD | C26 M77 Y0 K0 (7.8) | C24 M76 Y0 K0 (7.0) | 239 C (3.2) |
| `pink-600` | #D02E9D | C20 M85 Y0 K0 (3.5) | C22 M87 Y0 K0 (3.5) | **Pink C (1.6)** (brand) |
| `pink-700` | #B4227F | C26 M93 Y2 K5 (0.4) | C29 M99 Y5 K0 (0.3) | 675 C (2.5) |
| `pink-800` | #942068 | C29 M92 Y7 K25 (0.0) | C42 M100 Y21 K9 (0.6) | 7648 C (1.4) |
| `pink-900` | #7A2159 | C36 M90 Y14 K37 (0.6) | C49 M100 Y28 K21 (0.6) | 242 C (1.5) |
| `pink-950` | #490F32 | C49 M93 Y26 K64 (0.0) | C59 M100 Y42 K58 (2.0) | 6320 C (5.2) |
| `pink-975` | #240819 | C67 M87 Y36 K82 (0.7) | C75 M91 Y59 K82 (4.0) | 6077 C (9) |

</details>

## Changing a color

Change the value in `colors.tokens.json` (or in Figma first, then export), run `node primitives/build.mjs` from the repo root, and commit the JSON and the generated files together. `node primitives/build.mjs --check` fails if they're out of step.
