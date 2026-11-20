# Print

How to make a printed creative: a flyer, a brochure, a poster, a roll-up, a business card, a booth graphic or a print PDF. Print is a layer on top of the creative rules, not a separate system. Decided by Vanesa on 2026-11-20.

**Everything that isn't physical comes from the same places as social creatives:** the primitives (colors, type, radius), the brand assets (logo, Qbot, imagery, icons), the parts in [`brand-components/`](../../brand-components/) and the composition rules in [`guidelines/`](../) (one hero, two text sizes, button placement). This folder adds what's physical (size, bleed, safe area, margins, folds, resolution, color conversion and export) and the few places where print differs: **no patterns**, a choice between space imagery and a plain look instead of the main-visual question, wider margins, and text sizes in pt (Vanesa, 2026-11-20).

| File | What it is |
| --- | --- |
| `README.md` | The print rules (this page) |
| `print.tokens.json` | Format presets as data: finished size, bleed, safe area, margin, folds, resolution and text sizes in pt. The printer's spec always overrides the physical values |

## 1. The printer's spec comes first

Every print job starts from the **spec sheet the printer sends**. It decides the size, bleed, color conversion and file. Colors convert differently for each printer and region (Europe and the US use different profiles), so never guess them.

**Must:** before building, get these from the spec sheet, or ask the person for the ones it doesn't give:

| Ask or read | Why |
| --- | --- |
| **Format**: flyer, brochure, poster, roll-up, business card, booth, print PDF | Picks the preset in `print.tokens.json` |
| **Finished size** (trim), in mm or inches | The size after cutting |
| **Bleed** | Background that runs past the trim, so no white edge shows after cutting |
| **Safe area** (or "live area") | The printer's cutting tolerance inside the trim. The content margin is never less than 2 × this (section 2) |
| **Folds or panels** (brochures), and any hidden area (e.g. a roll-up's base) | Where nothing important may sit |
| **Color**: the printer's CMYK profile (e.g. FOGRA39, GRACoL), or Pantone colors if the printer asks for them | How the brand colors convert |
| **File type**: PDF/X-4, PDF/X-1a or what the printer asks | How to export |
| **Resolution** for images | Usually 300 dpi at final size; less for large formats seen from far away |

**When the spec is missing**, in this order:

1. Ask the person to get the spec from the printer.
2. If they can't, explain the risks plainly and let them decide whether to go on with the preset's defaults (then the job ends at a proof and an RGB PDF for review, see below):
   - colors can shift, the brand red most of all;
   - a wrong size or bleed can leave white edges or cut off content;
   - the printer may reject the file.
3. Suggest checking with a designer.

**No printer's profile** (Vanesa, 2026-11-20): if the person goes on without the printer's spec, the job ends at the **proof and an RGB PDF for review**, clearly marked "not for the printer". Never guess a CMYK profile. **Color is always checked:** without the CMYK conversion to the printer's profile, the color check fails and nothing is delivered for print.

**Pantone:** the brand has no fixed Pantone match for its colors. If a printer asks for Pantone colors, ask the person to choose them, and suggest a designer for it. Don't refuse and don't guess.

## 2. The canvas in print

- **Finished size:** the trim size from the spec. Build at that size in mm, with the **bleed outside the trim** on every side. Backgrounds and images run to the bleed edge; nothing else does.
- **Margins: 8% of the short side** (Vanesa, 2026-11-20). One rule for every format, so the margin shrinks with the piece: the content margin (text, logo, button, QR code, headshots) is **8% of the finished piece's short side**, measured from the trim, and **never less than 1.5 × the printer's safe area**. A4: 17 mm, A5: 12 mm, A6: 8.4 mm, A2: 34 mm, roll-up: 68 mm. Brochures use the short side of the folded panel. Why 8%: Vanesa wants 1.5 to 2 cm on A4 (7 to 9.5% of 210 mm), and 8% lands in the middle. The safe area is the printer's cutting tolerance; a bigger safe area in the printer's spec pushes the margin up to 1.5 × that. Each format's `margin` in `print.tokens.json` is computed this way. Replaces "about 12%, at least 2 × safe" (25 mm on A4).
- **Folds:** each panel is laid out as its own area, with the margin on both sides of every fold. Nothing important crosses a fold.
- **Shape and grid:** the shape comes from the **finished size** (trim width ÷ height, not including the bleed; [`layout/`](../layout/), Shapes), so the grid and gap roles are the same as on social, scaled to the finished size (Vanesa, 2026-11-20).

## 3. Backgrounds and the look

- **Must: no patterns in print, for now** (Vanesa, 2026-11-20). No pattern of any kind (Color, Mesh, Generative, Dithered) on a printed piece, and no pattern mask. Patterns stay for digital; Vanesa may add them back case by case later. Why: fine-line patterns (Dash, Glyph) get color fringing when the four inks don't line up exactly, the soft mask turns muddy in CMYK, and **dithered patterns cause moiré** against the printer's halftone screen.
- **No default look: the person chooses** (Vanesa, 2026-11-20). For print, this question replaces the "main visual" question in [`AGENTS.md`](../../AGENTS.md) step 1. "Pattern only" is never offered for print. Ask, with the recommendation:
  - **Dark with space imagery:** a generated astronaut or space image on `neutral-950`, following [`brand-assets/imagery/`](../../brand-assets/imagery/). Recommended for commercial pieces handed out at events.
  - **Plain and serious:** a solid brand color, light (paper white or `neutral-25`) or dark (`neutral-950`). Recommended light for documents (white papers, brochure inside pages).
  - Qbot may be added in some cases, following [`guidelines/`](../) section 6: one hero, never with a generated image.
- **Must: space imagery is always dark** (Vanesa, 2026-11-20). Image fades are dark-only ([`guidelines/`](../) section 5), so a space-imagery print piece is dark.
- **Must: text never sits on the image's subject or on busy ground** (Vanesa, 2026-11-20): not on the astronaut, rocks, the Milky Way or bright stars, the same rule as [`guidelines/`](../) section 5. If the text reaches the subject, first tighten the gaps between groups ([`guidelines/`](../) section 11, rule 11), then use the smaller print sizes (section 4), then ask to cut copy. **Text on a busy background is a hard stop** (Vanesa, 2026-11-20): `review/print.py` fails it, and the piece is never shown or delivered until every line sits on calm, legible ground. If no layout keeps the text calm, split the piece over two sides (image and title on the front, details on a plain back), use the plain look, or ask to cut copy.
- **Rich black** (Vanesa, 2026-11-20): large dark areas use the printer's rich black, never black ink alone.
- **Gradients and image fades** (Vanesa, 2026-11-20): slight grain (noise) on large gradients and image fades so they don't band in CMYK. `review/print.js` adds it to `.qd-image-fade` in print renders, so pages don't add it themselves. No tints under 5%: they drop out on paper.

## 4. Text in print

Sizes are in pt. Two kinds of printed piece, two type systems (Vanesa, 2026-11-20):

**One-page promos (flyers, posters, roll-ups):** the creative rules, with one title size and one supporting size ([`guidelines/`](../) section 11). Keep the title 2 to 3 times the supporting size.

**Text in print (proposed, to confirm: Vanesa, 2026-11-20).** Every size is a step of the type set in [`primitives/typography/`](../../primitives/typography/), read as pt (a 40 px step is 40 pt): 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64, 80, 104, 128, 160, 200. Never a size in between (Vanesa, 2026-11-20). The values live in `print.tokens.json` (`title`, `supporting` and the smaller `titleMin`, `supportingMin` per format, in pt), and `review/print.py` applies them, so pages never set print sizes themselves:

| Format | Solid | Space imagery, smallest |
| --- | --- | --- |
| Flyer A4, US Letter | Title 40 pt, supporting 18 pt | Title 32 pt, supporting 12 pt |
| Flyer A5 | Title 32 pt, supporting 14 pt | Title 24 pt, supporting 12 pt |
| Flyer A6 (proposed) | Title 24 pt, supporting 12 pt | the same (no step under 12) |
| Poster A2 | Title 128 pt, supporting 48 pt | the same |
| Poster A1 | Title 160 pt, supporting 64 pt | the same |
| Roll-up 850 × 2000 | Title 160 pt, supporting 64 pt | the same |

- **Front covers** (Vanesa, 2026-11-20): when a front holds only the logo, the title and the image (a two-sided piece, see section 3), the title is about **1.45 × the title size** (`titleCover`, snapped to the nearest step; A6: 32 pt, H5) and takes the calm sky's width. Use `.qd-title--cover`.
- **Solid pieces** use the solid sizes. From testing: A4 at 12 pt looked empty and 22 pt slightly big in cards; A5 worked anywhere from 10.5 to 15.5 pt.
- **Space-imagery pieces** use the same sizes, or smaller down to the smallest ones when that's what keeps all text in the calm sky (section 3). `review/print.py --print-scale small` uses them.
- **To decide (Vanesa, 2026-11-20):** 12 pt is the type set's smallest step. Content-heavy A6 pieces only fitted at 9 to 10 pt in testing: either print gets steps under 12 (the document scale uses 11 and 9 pt), or A6 carries less copy.

**Documents (white papers, brochure inside pages, multi-page handouts):** the Brand Guide document scale in [`primitives/typography/`](../../primitives/typography/), "Sizes per channel": title / H1 / H2 / H3 / body / caption = 28 / 22 / 18 / 14 / 11 / 9 pt. Body text at least 9 pt and in full `text.on-light` (never mid-grey), aiming for 7:1 contrast on paper.

- **Minimum:** never under 8 pt, and 6 pt only for legal text.
- **Reversed text** (Vanesa, 2026-11-20): white (light) text on a dark background is at least 9 pt and Regular weight or heavier.
- **Event backdrops and booths:** 240–560 pt, logos big enough for camera shots (Brand Guide 2.0).
- **Logo:** at least 0.84 cm tall (3.1 × 0.84 cm), as [`brand-assets/logo/`](../../brand-assets/logo/) says.

## 5. Images and QR codes

- **Must: image resolution is a hard stop** (Vanesa, 2026-11-20). Every image is at least 300 dpi at final size for anything read up close (A4 is about 2480 × 3508 px), or the format's `minDpi` for pieces seen from far away (posters 150, roll-ups, booths and banners 100). An image under it is **never delivered, and never enlarged** to pass the check, astronaut imagery included. Resolution counts the part of the file that shows: a cropped image (a Qbot crop, `object-fit: cover`) counts only its crop. Until an upscaler is approved, the answer is "This is not doable for now", with the plain, solid version offered instead.
  - Design Lab's largest image is 1024 × 1536 px: sharp enough at 300 dpi only up to about 87 mm wide (business cards). So A5 and A4 space imagery is refused for now.
  - **To decide (Vanesa):** the Topaz Labs upscale API is proposed for the workflow (needs approval). A 4× upscale (4096 × 6144 px) would cover A4 and A3 at 300 dpi, and A2, A1 and the roll-up at their `minDpi`.
- The subject stays clear of the trim and any fold. **One image per piece.**
- **Headshots** follow [`imagery/headshots/`](../../brand-assets/imagery/headshots/); for print they need the dpi above.
- **QR codes** (Vanesa, 2026-11-20): at least 20 × 20 mm, dark on light only, with a quiet zone of 4 modules around it, the short URL printed under it, and test-scanned from the proof. Mark it with the class `.qd-qr` so the print checks find it.

## 6. Export

- **One PDF** (with the printer's profile) at trim size plus bleed, with crop marks outside the bleed, fonts embedded, converted to the printer's CMYK profile and in the file type the spec asks for (PDF/X-4 by default).
- **One proof image** (PNG) of every page, to review before printing.
- **Without the printer's profile:** only the proof and an RGB PDF for review (`<name>-rgb.pdf`), not for the printer (section 1).
- **Needs Ghostscript** on the computer of whoever makes print creatives, for the CMYK conversion. The export says how to install it if it's missing.
- **How:** [`review/print.py`](../../review/README.md#print) makes the PDF, the proof and the print checks from the page, this file's format presets and the printer's spec.
- **Fonts:** Chrome exports the variable Mona Sans as Type 3 fonts, which some prepress workflows reject; the print checks show a 👀. The static files in [`primitives/typography/fonts/`](../../primitives/typography/fonts/) are the older text cut, not Mona Sans Display, so they change the look (titles set wider and wrap differently) and aren't used. **To decide (Vanesa, 2026-11-20):** add static Mona Sans Display v2.0.27 files (Regular, Medium, SemiBold, Bold, as in Figma) to the repo for print, or outline the text before sending.
- **Suggest:** have a designer check the proof before it goes to the printer (to be reviewed after testing, 2026-11-20).

## 7. Formats

The presets are in `print.tokens.json`: finished size, bleed, safe area, margin, folds, minimum image resolution and text sizes. They're starting points: **the printer's spec always wins.**

| Preset | Status |
| --- | --- |
| Flyers: A4, A5, A6, US Letter | Ready to test (A6 proposed 2026-11-20) |
| Brochures: A4 bi-fold, A4 tri-fold, US Letter tri-fold | Ready to test |
| Posters: A2, A1 | Ready to test |
| Roll-up 850 × 2000 | Ready to test |
| Business cards: EU, US | Ready to test |
| Booth graphics | In progress (being tested). Always from the vendor's spec: no default size |
| Print PDF (screen PDF, no bleed, no CMYK) | Ready to test |

## Changing these rules

Ask Vanesa first. Add the date and what changed next to the rule. A new format is one entry in `print.tokens.json`.
