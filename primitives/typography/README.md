# Typography

Qdrant's typefaces, text styles and type rules as tokens. Text styles come from the Qdrant Brand Design System in Figma (Main, Display and Mono Typography). Rules come from Brand Guide 2.0 (Typography, slides 29–36) and the qdrant-brand skill ([skills-internal/skills/design](https://github.com/qdrant/skills-internal/blob/main/skills/design/SKILL.md)). Names match Design Lab's `brand-kit/tokens/tokens.json`.

| File | What it is |
| --- | --- |
| `typography.tokens.json` | W3C tokens: families, weights, every text style, sizes per channel, slide and document sizes |
| `typography.css` | `--qd-font-*` and `--qd-type-*` variables; loads the fonts and turns on ss05 and ss06 |
| `fonts/` | Mona Sans v2.0.27 and Geist Mono v1.9.0 from their official releases, with their licences (SIL Open Font License). The variable Mona Sans includes the condensed width. |

## Families

| Family | Use |
| --- | --- |
| Mona Sans | All UI, marketing and creative text |
| Mona Sans Condensed | Event titles and condensed display styles, always uppercase. Same variable font at 75% width. |
| Geist Mono | Charts, diagrams, code, data and technical materials |

**Mona Sans always renders with stylistic sets ss05 and ss06 on** (`font-feature-settings: "ss05" on, "ss06" on;`). They switch `a` and `g` to the double-storey forms. Without them it doesn't look like Qdrant. Never override it.

## Weights

Every style comes in Regular (400), Medium (500), SemiBold (600) and Bold (700) in Figma. Use:

- **Titles and headings: SemiBold.** Never Bold, including Display 1 and 2.
- **Body text: Regular,** with SemiBold for key terms.
- Medium and Bold exist in the styles but aren't part of the brand rules yet. One exception: speaker names in [`headshot-circle`](../../components/headshot-circle/) use **Medium**, as in the Figma agenda slot (decided 2026-11-11).

The default weight is in each token; `$extensions.qdrant.weights` lists the weights Figma has for that style.

## Text styles

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

**Mono** (Geist Mono) has the same scale from `mono-h1` to `mono-xs`: same sizes, line heights and letter spacing as the Mona Sans styles, except `mono-h3` at 1.2 line height (as in Figma).

**Social** styles, for posts and event promos:

| Token | Size | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- |
| `social-event-title` | 104px | 600, condensed, uppercase | 1.05 | -1.8px |
| `social-event-detail` | 40px | Geist Mono 400 | 1.2 | -0.5px |
| `social-event-speaker-name` | 40px | 600 | 1.1 | -0.5px |
| `social-event-speaker-role` | 32px | 400 | 1.3 | 0 |
| `social-event-series` | 32px | 600 | 1.2 | -0.5px |
| `social-post-hero` | 144px | 600 | 1.05 | -1.8px |
| `social-post-title` | 104px | 600 | 1.05 | -1.8px |
| `social-post-eyebrow` (not recommended: only when asked, see [guidelines/](../../guidelines/) section 11) | 56px | 600 | 1.2 | -0.5px |
| `social-post-body` | 32px | 400 | 1.3 | 0 |

`luma-title` (104px, 600) is the Luma cover title, added in Design Lab.

### Text in creatives (social posts, ads, banners)

Decided by Vanesa on 2026-11-04, from the Campaigns ads (Figma `EXDtNCOBfmPCWabNex7sSJ`) and the Vector Space Day banner (Brand-Collateral `2183:41590`). Sizes in px at the reference canvas (see [`layout/`](../layout/)); they scale with the canvas.

**Two sizes only:** one title and one supporting size. Speaker names and roles inside the headshot parts are the only exception. **On the light card** the title and supporting text have their own two sizes, set by the card's width (0.0846 W and 0.0483 W, about 50 and 29 at 1080 square), from the Get-the-Guide ad ([`layout/`](../layout/) "Light card layout", decided 2026-11-04). Title Case there too, even for long supporting sentences (the Figma reference uses sentence case; Vanesa kept Title Case, 2026-11-04). **Button text doesn't count:** it scales with the [button](../../components/button/) and is independent of these text styles (decided 2026-11-04).

| | Font | Square, portrait | Wide | Ultrawide | Story |
| --- | --- | --- | --- | --- | --- |
| Title, up to 6 words | Mona Sans SemiBold, Title Case, line height 1.05, letter spacing -1.8 | 96 | 128 | 128 | 104 |
| Title, 7 to 10 words | same | 80 | 104 | 104 | 88 |
| Title, 11 words or more | same | 64 | 88 | 88 | 72 |
| Supporting (body, date, time, place) | Mona Sans Regular, line height 1.2, letter spacing -0.5 | 36 | 40 | 40 | 40 |

- **Mona Sans titles are always Title Case, never all caps.** Supporting text (date, place, body sentences) stays in normal sentence case (decided 2026-11-11). **Mona Sans Condensed is always all caps**, and only for special occasions, when the person asks for it (`social-event-title`, `display-condensed-*`).
- **Geist Mono only for very short labels:** one or two words each, like "JUNE 11", "BERLIN" or "SPEAKERS", at the supporting size. Anything longer is Mona Sans.
- **Longer titles step down** to the next size by word count, never in between and never below the 11+ size. If it still doesn't fit, ask the person to shorten it.
- **Wide** follows the Vector Space Day banner (128 on 1920, decided 2026-11-04).
- **Ultrawide** uses the wide sizes (decided 2026-11-11 from the LinkedIn profile cover, 1584×396: a 128 title reads at LinkedIn's small display size). **Beside Qbot** on the LinkedIn cover, the title steps down one size (128 → 104), so Qbot stays the bigger shape ([`layout/`](../layout/) "LinkedIn profile cover"). Not yet tried on a full 3000×400 banner.
- **In code:** `.qd-title` (short), `.qd-title--medium`, `.qd-title--long` and `.qd-supporting` in `typography.css`, inside a `.qd-canvas`. Values are in `typography.tokens.json` under `semantic.creative`.
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

- **Headings:** Qdrant red on a single word or phrase.
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
