# Typography

Qdrant's typefaces, text styles and type rules as tokens. Text styles come from the Qdrant Brand Design System in Figma (Main, Display and Mono Typography). Rules come from Brand Guide 2.0 (Typography, slides 29 to 36) and the qdrant-brand skill ([skills-internal/skills/design](https://github.com/qdrant/skills-internal/blob/main/skills/design/SKILL.md)). Weights and the size, line-height and letter-spacing scales match the Figma file **Qdrant Design System Primitives** (`UUpGTk4Ifmpr0FwNr6pXVg`, checked 2026-11-12). The families are the Mona Sans family (2026-11-17). Style names match Design Lab's `brand-kit/tokens/tokens.json`.

| File | What it is |
| --- | --- |
| `typography.tokens.json` | The source. W3C tokens: families, weights, the Figma scales, every text style, sizes per channel, slide and document sizes |
| `typography.css` | `--qd-font-*`, `--qd-font-size-*`, `--qd-line-height-*`, `--qd-letter-spacing-*` and `--qd-type-*` variables, plus the creative classes; loads the fonts and turns on ss05 and ss06. Kept in step with the JSON by hand (it isn't generated, because of the classes) |
| `fonts/` | Mona Sans v2.0.27 from its [official release](https://github.com/github/mona-sans/releases), with its licence (SIL Open Font License): the variable Mona Sans, which includes the Display optical size and the condensed width, and Mona Sans Mono. |

## Families

One family for the whole brand: Mona Sans, its Display cut and its Mono, from the same release (decided by Juan, 2026-11-17). Mona Sans Mono replaced Geist Mono.

| Family | Variable | Use |
| --- | --- | --- |
| Mona Sans Display | `--qd-font-family-display` | Headings and display styles: `display-*`, `h1` to `h6`, creative titles, speaker names and the social titles. The variable Mona Sans at its Display optical size (opsz 72), the cut the font names Display: `fonts/fonts.css` defines it as its own family from the same file. |
| Mona Sans | `--qd-font-family-sans` | Text styles (`text-*`), body and supporting text, speaker roles, UI and buttons. The variable font picks its optical size from the font size. |
| Mona Sans Mono | `--qd-font-family-mono` | Mono styles, short labels, code, charts and data |
| Mona Sans Condensed | `--qd-font-family-condensed` | The condensed display styles (event titles), always uppercase. The font's Display Condensed: 75% width at the Display optical size. |

Figma names Mona Sans `primary`; here it's `--qd-font-family-sans`, the name every creative already uses. The Figma primitives have the same families since 2026-11-17 (`primary`, `display`, `condensed`, `mono`). Figma shows Mona Sans Display and Mona Sans Mono only when their static fonts from the release are installed. Before 2026-11-17, `--qd-font-family-display` was the condensed family.

Mona Sans Display needs a browser that applies `font-variation-settings` inside `@font-face` (Chromium does, checked 2026-11-17). Elsewhere it renders like Mona Sans, whose automatic optical size is close to Display at large sizes.

**Mona Sans and Mona Sans Display always render with stylistic sets ss05 and ss06 on** (`font-feature-settings: "ss05" on, "ss06" on;`). They switch `a` and `g` to the double-storey forms. Without them it doesn't look like Qdrant. Never override it. Mona Sans Mono has no ss05 or ss06; its `a` and `g` are its own.

## Weights

The brand uses three weights: Regular (400), Medium (500) and SemiBold (600). **Bold (700) is retired** (Juan, 2026-11-17): no title, heading or body text uses it, and its uses move to SemiBold. The Figma file still has Bold styles until they're removed. The primitives also have Bold (`--qd-font-weight-bold`). Light (300) was removed on 2026-11-17: nothing used it. Use:

- **Titles and headings: SemiBold.** Never Bold.
- **Display styles: SemiBold only**, in Mona Sans Display and in Mona Sans Condensed (Juan, 2026-11-17). The Figma file still has Regular, Medium and Bold Display styles until they're removed.
- **Body text: Regular,** with SemiBold for key terms.
- Medium exists in the styles but isn't part of the brand rules yet. One exception: speaker names in [`headshot-circle`](../../brand-components/headshot-circle/) use **Medium**, as in the Figma agenda slot (decided 2026-11-11).

The default weight is in each token; `$extensions.qdrant.weights` lists the weights Figma has for that style.

## Scales (Figma primitives)

The building blocks of the type set, updated to the new set on 2026-11-17 (Juan). The new set is the Proposed tab on the studio's Typography page, until it replaces the text styles below. The text styles below and the creative sizes still keep their own values (72, 88 and 96px titles, line height 1.05, letter spacing -1.8px) until then.

| Primitive | Values | Variables |
| --- | --- | --- |
| Font size (px) | 10, 12, 13, 14, 15, 16, 18, 20, 24, 32, 36, 40, 48, 56, 64, 80, 104, 128, 160, 200 | `--qd-font-size-10` to `--qd-font-size-200` |
| Line height | 103, 104, 105, 106, 108, 110, 112, 114, 117, 120, 122, 130, 150 (named by percent: 150 is 1.5) | `--qd-line-height-103` to `--qd-line-height-150` |
| Letter spacing (px) | tighter -1.5, tight -1, snug -0.5, normal 0 | `--qd-letter-spacing-*` |

- **Font size:** the new set uses Text 12 to 20, headings 24 to 64 and Display 80, 104, 128, 160 and 200 (Display grows about ×1.25 per step, on the 8px grid). 10, 13, 15 and 36 are for UI and creatives.
- **Line height:** named by percent since 2026-11-17, so the scale can hold every step. The old names were tight (120) and normal (150). None (100), snug (135) and relaxed (170) were removed on 2026-11-18 because nothing used them. Headings and Display take theirs from one curve through H6 (130) and H1 (110): H5 122, H4 117, H3 114, H2 112, then Display 108, 106, 105, 104 and 103. That keeps about 6.4px of leading above the size at every step. Text uses 150. 120 is used only by today's styles, until they move to the new set.
- **Letter spacing:** every text style in the new set uses normal (0), Text XL included (2026-11-17), because Mona Sans Display is already 2.5% tighter than the text cut. The negative steps are for UI. Letter spacing is in px, as in Figma, so the same value gives the same spacing at any font size.

## Text styles

`display-*` and `h1` to `h6` are in Mona Sans Display, `text-*` in Mona Sans and `mono-*` in Mona Sans Mono.

| Token | Size | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- |
| `display-2` | 104px | 600 | 1.05 | -1.8px |
| `display-1` | 80px | 600 | 1.05 | -1.8px |
| `display-condensed-2` | 104px | 600, condensed, uppercase | 1.05 | -1.8px |
| `display-condensed-1` | 80px | 600, condensed, uppercase | 1.05 | -1.8px |
| `h1` | 64px | 600 | 1.1 | -1.5px |
| `h2` | 56px | 600 | 1.1 | -0.5px |
| `h3` | 48px | 600 | 1.1 | -0.5px |
| `h4` | 40px | 600 | 1.2 | -0.5px |
| `h5` | 32px | 600 | 1.3 | -0.5px |
| `h6` | 24px | 600 | 1.3 | -0.5px |
| `text-xl` | 20px | 400 | 1.5 | -0.2px |
| `text-lg` | 18px | 400 | 1.5 | 0 |
| `text-md` | 16px | 400 | 1.5 | 0 |
| `text-sm` | 14px | 400 | 1.5 | 0 |
| `text-xs` | 12px | 400 | 1.5 | 0 |

**Mono** (Mona Sans Mono) has the same scale from `mono-h1` to `mono-xs`: same sizes, line heights and letter spacing as the Mona Sans styles, except `mono-h3` at 1.2 line height (as in Figma).

**Social** styles, for posts and event promos. Titles, names, the series and the eyebrow are in Mona Sans Display; body and roles in Mona Sans.

| Token | Size | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- |
| `social-event-title` | 104px | 600, condensed, uppercase | 1.05 | -1.8px |
| `social-event-detail` | 40px | Mona Sans Mono 400 | 1.2 | -0.5px |
| `social-event-speaker-name` | 40px | 600 | 1.1 | -0.5px |
| `social-event-speaker-role` | 32px | 400 | 1.3 | 0 |
| `social-event-series` | 32px | 600 | 1.2 | -0.5px |
| `social-post-hero` | 144px | 600 | 1.05 | -1.8px |
| `social-post-title` | 104px | 600 | 1.05 | -1.8px |
| `social-post-eyebrow` (not recommended: only when asked, see [guidelines/](../../guidelines/) section 11) | 56px | 600 | 1.2 | -0.5px |
| `social-post-body` | 32px | 400 | 1.3 | 0 |

`luma-title` (104px, 600) is the Luma cover title, added in Design Lab.

### Text in creatives (social posts, ads, banners)

Decided by Vanesa on 2026-11-04, from the Campaigns ads (Figma `EXDtNCOBfmPCWabNex7sSJ`) and the Vector Space Day banner (Brand-Collateral `2183:41590`). Sizes in px at the reference canvas (see [`layout/`](../../guidelines/layout/)); they scale with the canvas.

**Two sizes only:** one title and one supporting size. Speaker names and roles inside the headshot parts are the only exception. **On the light card** the title and supporting text have their own two sizes, set by the card's width (title 0.0846 W × 1.6 and supporting 0.0483 W, about 80 and 29 at 1080 square; on wide the title is × 1.95 and the supporting text × 1.5. Title bigger since 2026-11-16, logo unchanged), from the Get-the-Guide ad ([`layout/`](../../guidelines/layout/) "Light card layout", decided 2026-11-04). Title Case there too, even for long supporting sentences (the Figma reference uses sentence case; Vanesa kept Title Case, 2026-11-04). **Button text doesn't count:** it scales with the [button](../../brand-components/button/) and is independent of these text styles (decided 2026-11-04).

| | Font | Square, portrait | Wide | Ultrawide | Story |
| --- | --- | --- | --- | --- | --- |
| Title, up to 6 words | Mona Sans Display SemiBold, Title Case, line height 1.05, letter spacing -1.8 | 96 | 128 | 128 | 104 |
| Title, 7 to 10 words | same | 80 | 104 | 104 | 88 |
| Title, 11 words or more | same | 64 | 88 | 88 | 72 |
| Supporting (body, date, time, place) | Mona Sans Regular, line height 1.2, letter spacing -0.5 | 36 | 40 | 40 | 40 |

- **Mona Sans titles are always Title Case, never all caps.** Supporting text (date, place, body sentences) stays in normal sentence case (decided 2026-11-11). **Mona Sans Condensed is always all caps**, and only for special occasions, when the person asks for it (`social-event-title`, `display-condensed-*`).
- **Mona Sans Mono only for very short labels:** one or two words each, like "JUNE 11", "BERLIN" or "SPEAKERS", at the supporting size. Anything longer is Mona Sans.
- **Longer titles step down** to the next size by word count, never in between and never below the 11+ size. If it still doesn't fit, ask the person to shorten it.
- **Wide** follows the Vector Space Day banner (128 on 1920, decided 2026-11-04).
- **Ultrawide** uses the wide sizes (decided 2026-11-11 from the LinkedIn profile cover, 1584×396: a 128 title reads at LinkedIn's small display size). **Beside Qbot** on the LinkedIn cover, the title steps down one size (128 → 104), so Qbot stays the bigger shape ([`layout/`](../../guidelines/layout/) "LinkedIn profile cover"). Not yet tried on a full 3000×400 banner.
- **In code:** `.qd-title` (short), `.qd-title--medium`, `.qd-title--long` and `.qd-supporting` in `typography.css`, inside a `.qd-canvas`. The title classes set Mona Sans Display. Values are in `typography.tokens.json` under `semantic.creative`.
- The `social-*` styles above stay as the Figma reference. For creatives, use this table.

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

- Negative letter spacing on headings is intentional: it gives the dense, engineered feel.
- Body line height is 1.5. Headings are tighter, 1.05 to 1.3.
- Design Lab renders with no fallback fonts and a 14px minimum text size (to confirm with design).
