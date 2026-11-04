# Typography

Qdrant's typefaces and type scale as tokens. Values come from the qdrant-brand skill ([skills-internal/skills/design](https://github.com/qdrant/skills-internal/blob/main/skills/design/SKILL.md)). Names match Design Lab's `brand-kit/tokens/tokens.json`.

| File | What it is |
| --- | --- |
| `typography.tokens.json` | W3C tokens: families, weights, the type scale, slide and document sizes |
| `typography.css` | `--qd-font-*` and `--qd-type-*` variables; loads the fonts and turns on ss05 and ss06 |
| `fonts/` | Mona Sans v2.0.27 and Geist Mono v1.9.0 from their official releases, with their licences (SIL Open Font License) |

## Families

| Family | Use | Weights |
| --- | --- | --- |
| Mona Sans | All UI, marketing and creative text | 400, 500, 600; 700 for Display-2 only |
| Geist Mono | Code, technical labels and data | 400 |

**Mona Sans always renders with stylistic sets ss05 and ss06 on** (`font-feature-settings: "ss05" on, "ss06" on;`). They switch `a` and `g` to the double-storey forms. Without them it doesn't look like Qdrant. Never override it.

## Type scale

| Token | Size | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- |
| `display-2` | 104px | 700 | 1.05 | -1.8px |
| `display-1` | 80px | 600 | 1.05 | -1.8px |
| `h1` | 64px | 600 | 1.1 | -1.5px |
| `h2` | 56px | 600 | 1.1 | -0.5px |
| `h3` | 48px | 600 | 1.1 | -0.5px |
| `h4` | 40px | 600 | 1.2 | -0.5px |
| `h5` | 32px | 600 (also 400, 700) | 1.3 | -0.5px |
| `h6` | 24px | 600 (also 400, 500) | 1.3 | -0.5px |
| `text-xl` | 20px | 400 (also 600) | 1.5 | -0.2px |
| `text-lg` | 18px | 400 (also 500, 600) | 1.5 | 0 |
| `text-md` | 16px | 400 (also 600) | 1.5 | 0 |
| `text-sm` | 14px | 400 (also 500, 600) | 1.5 | 0 |
| `text-xs` | 12px | 400 | 1.5 | 0 |
| `mono-xl` | 20px | 400 | 1.5 | -0.2px |
| `mono-h6` | 24px | 400 | 1.3 | -0.5px |
| `mono-sm` | 14px | 400 | 1.5 | 0 |
| `luma-title` | 104px | 600 | 1.05 | -1.8px |

`mono-sm` (code snippets) and `luma-title` (Luma covers) were added in Design Lab.

## Slides and documents

| Role | Slides | Documents |
| --- | --- | --- |
| Title | 44pt | 28pt |
| Section title / H1 | 36pt | 22pt |
| Heading / H2 | 28pt | 18pt |
| Subheading / H3 | 22pt | 14pt |
| Body | 18pt | 11pt |
| Caption | 14pt | 9pt |
| Footnote | 12pt | |

## Rules

- Headings use 600, except Display-2 at 700. Body uses 400, with 600 for inline emphasis.
- Negative letter spacing on headings is intentional: it gives the dense, engineered feel.
- Body line height is 1.5. Headings are tighter, 1.05 to 1.3.
- **Never a gradient on text.** Text is always one solid brand color.
- Design Lab renders with no fallback fonts and a 14px minimum text size (to confirm with design).
