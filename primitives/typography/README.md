# Typography

Qdrant's typefaces, text styles and type rules as tokens. The text styles are the type set adopted on 2026-11-18 (Juan), which replaced the styles taken from the Qdrant Brand Design System in Figma; the Figma text styles move to it after review. Rules come from Brand Guide 2.0 (Typography, slides 29 to 36) and the qdrant-brand skill ([skills-internal/skills/design](https://github.com/qdrant/skills-internal/blob/main/skills/design/SKILL.md)). Weights and the size, line-height and letter-spacing scales match the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, checked 2026-11-12). The families are the Mona Sans family (2026-11-17).

| File | What it is |
| --- | --- |
| `typography.tokens.json` | The source. W3C tokens: families, weights, the Figma scales, every text style, sizes per channel, slide and document sizes |
| `typography.css` | `--qd-font-*`, `--qd-font-size-*`, `--qd-line-height-*` and `--qd-type-*` variables, plus the creative classes; loads the fonts and turns on ss05 and ss06. Kept in step with the JSON by hand (it isn't generated, because of the classes) |
| `fonts/` | Mona Sans v2.0.27 from its [official release](https://github.com/github/mona-sans/releases), with its licence (SIL Open Font License): the variable Mona Sans, which includes the Display optical size and the condensed width, and Mona Sans Mono. |

## Families

One family for the whole brand: Mona Sans, its Display cut and its Mono, from the same release (decided by Juan, 2026-11-17). Mona Sans Mono replaced Geist Mono.

| Family | Variable | Use |
| --- | --- | --- |
| Mona Sans Display | `--qd-font-family-display` | Headings and display styles: `display-*` and `h1` to `h6`, and in creatives the titles, the supporting text and the headshot names and roles. The variable Mona Sans at its Display optical size (opsz 72), the cut the font names Display: `fonts/fonts.css` defines it as its own family from the same file. |
| Mona Sans | `--qd-font-family-sans` | Text styles (`text-*`): body text on the web, UI and buttons. The variable font picks its optical size from the font size. |
| Mona Sans Mono | `--qd-font-family-mono` | Mono styles, short labels, code, charts and data |
| Mona Sans Display Condensed | `--qd-font-family-condensed` | The condensed display styles (`display-condensed-*`, for event titles), always uppercase. The font's Display Condensed: 75% width at the Display optical size. |

Figma names Mona Sans `primary`; here it's `--qd-font-family-sans`, the name every creative already uses. The Figma primitives have the same families since 2026-11-17 (`primary`, `display`, `condensed`, `mono`), with the same names since 2026-11-18. The Qdrant Figma organization has Mona Sans v2.0.27 as static fonts since 2026-11-18: Mona Sans and its four widths in every weight, and Mona Sans Display, Display Condensed and Mono in Regular, Medium, SemiBold and Bold. Figma's "Mona Sans Condensed" is the text cut at 75% width, from the older files; the condensed styles here are Mona Sans Display Condensed. Before 2026-11-17, `--qd-font-family-display` was the condensed family.

Mona Sans Display needs a browser that applies `font-variation-settings` inside `@font-face` (Chromium does, checked 2026-11-17). Elsewhere it renders like Mona Sans, whose automatic optical size is close to Display at large sizes.

**Mona Sans and Mona Sans Display always render with stylistic sets ss05 and ss06 on** (`font-feature-settings: "ss05" on, "ss06" on;`). They switch `a` and `g` to the double-storey forms. Without them it doesn't look like Qdrant. Never override it. Mona Sans Mono has no ss05 or ss06; its `a` and `g` are its own.

## Weights

The brand uses three weights: Regular (400), Medium (500) and SemiBold (600). **Bold (700) is retired** (Juan, 2026-11-17): no title, heading or body text uses it, and its uses move to SemiBold. The Figma file still has Bold styles until they're removed. The primitives also have Bold (`--qd-font-weight-bold`). Light (300) was removed on 2026-11-17: nothing used it. Use:

- **Titles and headings: SemiBold.** Never Bold.
- **Display styles: SemiBold only**, in Mona Sans Display and in Mona Sans Display Condensed (Juan, 2026-11-17). The Figma file still has Regular, Medium and Bold Display styles until they're removed.
- **Body text: Regular,** with SemiBold for key terms.
- Medium exists in the styles but isn't part of the brand rules yet. One exception: speaker names in [`headshot-circle`](../../brand-components/headshot-circle/) use **Medium**, as in the Figma agenda slot (decided 2026-11-11).

The default weight is in each token; `$extensions.qdrant.weights` lists the weights the style comes in.

## Scales (Figma primitives)

The building blocks of the type set, updated on 2026-11-17 (Juan). The text styles and the creative sizes below use them since 2026-11-18.

| Primitive | Values | Variables |
| --- | --- | --- |
| Font size (px) | 10, 12, 13, 14, 15, 16, 18, 20, 24, 32, 36, 40, 48, 56, 64, 80, 104, 128, 160, 200 | `--qd-font-size-10` to `--qd-font-size-200` |
| Line height | 103, 104, 105, 106, 108, 110, 112, 114, 117, 122, 130, 150 (named by percent: 150 is 1.5) | `--qd-line-height-103` to `--qd-line-height-150` |

- **Font size:** the type set uses Text 12 to 20, headings 24 to 64 and Display 80, 104, 128, 160 and 200 (Display grows about ×1.25 per step, on the 8px grid). 10, 13, 15 and 36 are for UI and the creative button.
- **Line height:** named by percent since 2026-11-17, so the scale can hold every step. The old names were none (100), tight (120), snug (135), normal (150) and relaxed (170); all but normal were removed on 2026-11-18 because nothing used them once the type set was in. Headings and Display take theirs from one curve through H6 (130) and H1 (110): H5 122, H4 117, H3 114, H2 112, then Display 108, 106, 105, 104 and 103. That keeps about 6.4px of leading above the size at every step. Text uses 150.
- **Letter spacing:** there's no scale. Every text style uses 0, the font's default, Text XL and the creative text included (decided 2026-11-17, in use since 2026-11-18), because Mona Sans Display is already 2.5% tighter than the text cut. The scale (tighter -1.5px, tight -1px, snug -0.5px and normal 0) was removed on 2026-11-18 because nothing used it.

## Text styles

The type set, adopted on 2026-11-18 (Juan), after comparing it with the old styles in the studio's Typography page. One set for brand, web and marketing, named as in Figma (`Display/2/SemiBold`, `Heading/H4/Mono`, `Text/md/Regular`):

- **Display** 1 to 5 in Mona Sans Display SemiBold, each also **Condensed** (`display-condensed-*`: Mona Sans Display Condensed SemiBold, uppercase). Numbered from the smallest, so larger steps can be added as 6, 7 and on.
- **Headings** H1 to H6 in Mona Sans Display, Regular, Medium or SemiBold (SemiBold by default), each also in **Mono** (`mono-h1` to `mono-h6`: Mona Sans Mono Regular).
- **Text** XL to XS in Mona Sans, Regular, Medium or SemiBold, each also in Mono (`mono-xl` to `mono-xs`).

| Token | Size | Weights | Line height |
| --- | --- | --- | --- |
| `display-5` | 200px | 600 | 1.03 |
| `display-4` | 160px | 600 | 1.04 |
| `display-3` | 128px | 600 | 1.05 |
| `display-2` | 104px | 600 | 1.06 |
| `display-1` | 80px | 600 | 1.08 |
| `h1` | 64px | 400, 500, 600 | 1.1 |
| `h2` | 56px | 400, 500, 600 | 1.12 |
| `h3` | 48px | 400, 500, 600 | 1.14 |
| `h4` | 40px | 400, 500, 600 | 1.17 |
| `h5` | 32px | 400, 500, 600 | 1.22 |
| `h6` | 24px | 400, 500, 600 | 1.3 |
| `text-xl` to `text-xs` | 20, 18, 16, 14, 12px | 400, 500, 600 | 1.5 |

`display-condensed-*` has the Display sizes and line heights, `mono-h*` the heading ones and `mono-xl` to `mono-xs` the text ones. Letter spacing is 0 for every style. Headings and Display take their line height from one curve, 1 + k / size^p through H6 (1.3) and H1 (1.1), which keeps about 6.4px of leading above the size at every step.

**The old styles** (until 2026-11-18) moved to these steps: `display-2` and `display-1` keep their names and sizes; `social-post-hero` (144px) is `display-4`; `social-post-title` and `luma-title` (104px) are `display-2`; `social-event-title` is `display-condensed-2`; `social-post-eyebrow` (56px) is `h2` (still only when asked, see [guidelines/](../../guidelines/) section 11); `social-event-speaker-name` (40px) is `h4` and `social-event-detail` `mono-h4`; `social-event-series` (32px) is `h5`, and `social-event-speaker-role` and `social-post-body` are `h5` in Regular. Their letter spacing (-0.2 to -1.8px) went to 0, and Bold went.

### Text in creatives (social posts, ads, banners)

Decided by Vanesa on 2026-11-04, from the Campaigns ads (Figma `EXDtNCOBfmPCWabNex7sSJ`) and the Vector Space Day banner (Brand-Collateral `2183:41590`). Since 2026-11-18 every size is a step of the type set, with that step's line height and letter spacing 0 (Juan): the square and portrait short title went from 96 to 104, the wide and ultrawide long title from 88 to 80, the story titles from 88 and 72 to 80 and 64, and the supporting text from 36 to 40 on square and portrait. Sizes in px at the reference canvas (see [`layout/`](../../guidelines/layout/)); they scale with the canvas.

**Two sizes only:** one title and one supporting size. Speaker names and roles inside the headshot parts are the only exception. **On the light card** the title and supporting text have their own two sizes, set by the card's width (title 0.0846 W × 1.6 and supporting 0.0483 W, about 80 and 29 at 1080 square; on wide the supporting text is × 1.5 and the title stays × 1.6 (2026-11-19). Title bigger since 2026-11-16, logo unchanged), from the Get-the-Guide ad ([`layout/`](../../guidelines/layout/) "Light card layout", decided 2026-11-04). Title Case there too, even for long supporting sentences (the Figma reference uses sentence case; Vanesa kept Title Case, 2026-11-04). **Button text doesn't count:** it scales with the [button](../../brand-components/button/) and is independent of these text styles (decided 2026-11-04).

| | Font | Square, portrait | Wide | Ultrawide | Story |
| --- | --- | --- | --- | --- | --- |
| Title, up to 6 words | Mona Sans Display SemiBold, Title Case | 104 (Display 2) | 128 (Display 3) | 128 | 104 |
| Title, 7 to 10 words | same | 80 (Display 1) | 104 (Display 2) | 104 | 80 |
| Title, 11 words or more | same | 64 (H1) | 80 (Display 1) | 80 | 64 |
| Supporting (body, date, time, place) | Mona Sans Display Regular (H4 Regular) | 40 | 40 | 40 | 40 |

- **Mona Sans titles are always Title Case, never all caps.** Supporting text (date, place, body sentences) stays in normal sentence case (decided 2026-11-11). **Mona Sans Display Condensed is always all caps**, and only for special occasions, when the person asks for it (`display-condensed-*`).
- **Mona Sans Mono only for very short labels:** one or two words each, like "JUNE 11", "BERLIN" or "SPEAKERS", at the supporting size. Anything longer is Mona Sans.
- **Longer titles step down** to the next size by word count, never in between and never below the 11+ size. If it still doesn't fit, ask the person to shorten it.
- **Wide** follows the Vector Space Day banner (128 on 1920, decided 2026-11-04).
- **Ultrawide** uses the wide sizes (decided 2026-11-11 from the LinkedIn profile cover, 1584×396: a 128 title reads at LinkedIn's small display size). **Beside Qbot** on the LinkedIn cover, the title steps down one size (128 → 104), so Qbot stays the bigger shape ([`layout/`](../../guidelines/layout/) "LinkedIn profile cover"). Not yet tried on a full 3000×400 banner.
- **In code:** `.qd-title` (short), `.qd-title--medium`, `.qd-title--long` and `.qd-supporting` in `typography.css`, inside a `.qd-canvas`. They set Mona Sans Display and each step's line height. Values are in `typography.tokens.json` under `semantic.creative`.

The values are guidance: adjust for the medium, scale, screen and production method when needed.

## Sizes per channel

From Brand Guide 2.0. Tokens under `semantic.channels`.

| Channel | Element | Size |
| --- | --- | --- |
| Website | Hero headline | 64px desktop, 40px mobile |
| Website | Body text | 16–20px desktop, 16–18px mobile |
| Ads | Headings | 80px minimum |
| Ads | Sub-copy | 36–40px |
| Ads | Legal text | 12–16px |
| Print | Street poster (A0–A2) | 64–148pt |
| Print | Event backdrop | 240–560pt, logos big enough for camera shots |
| Print | A4 | 10–12pt, 300 DPI |
| Slides | Title / section / heading / subheading / body / caption / footnote | 44 / 36 / 28 / 22 / 18 / 14 / 12pt |
| Documents | Title / H1 / H2 / H3 / body / caption | 28 / 22 / 18 / 14 / 11 / 9pt |

## Hierarchy

Body text scales with its heading: keep body copy between **20% and 40%** of the heading size. For example, H2 at 56px takes body text from 14px (Text SM) to 20px (Text XL).

## Alignment and spacing

- **Left-aligned or centered. Never right-aligned.**
- Watch the rag (the uneven right edge) and avoid orphans and widows: single words or lines left alone at the end or start of a paragraph.
- Use as few styles as needed. Keep it clear, calm and confident.
- Gaps between paragraphs and padding inside frames follow the 8px grid. Brand Guide examples: 64px or 56px side padding with a 24px gap, or 56px with a 16px gap.

## Emphasis

- **Headings: no highlight by default** (decided 2026-11-11). A highlighted word competes with the red button and the red of the logo mark. If the person asks for one, only **Qdrant red** (`accent.primary`) on a single word or phrase, never another color, and never on a red background or a red-heavy pattern, where it doesn't stand out.
- **Body text:** SemiBold for important terms only. Keep the rest Regular.
- Use emphasis sparingly, especially in long text.

## Don't

- Use gradients, strokes, drop shadows or underlines on text.
- Use unapproved fonts or weights, or Bold for titles.
- Change letter spacing outside the styles above.
- Stretch, compress or distort type to fit a layout.
- Use colors outside the palette.
- Right-align text.
- Use random gaps.
- Use the fallback font when the brand fonts are available.

## Other rules

- Letter spacing is 0 on every style (2026-11-18): Mona Sans Display is already tighter than the text cut, so headings keep their dense, engineered feel without negative spacing.
- Body line height is 1.5. Headings and Display are tighter, from 1.3 (H6) to 1.03 (Display 5).
- Design Lab renders with no fallback fonts and a 14px minimum text size (to confirm with design).
