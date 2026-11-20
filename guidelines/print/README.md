# Print

How to make a printed creative: a flyer, a brochure, a poster, a roll-up, a business card, a booth graphic or a print PDF. Print is a layer on top of the creative rules, not a separate system. Decided by Vanesa on 2026-11-20.

**Everything that isn't physical comes from the same places as social creatives:** the primitives (colors, type, radius), the brand assets (logo, Qbot, imagery, icons), the parts in [`brand-components/`](../../brand-components/) and the composition rules in [`guidelines/`](../) (one hero, two text sizes, button placement). This folder adds what's physical (size, bleed, safe area, margins, folds, resolution, color conversion and export) and the few places where print differs: **no patterns**, light by default for handouts, and text sizes in pt (Vanesa, 2026-11-20).

| File | What it is |
| --- | --- |
| `README.md` | The print rules (this page) |
| `print.tokens.json` | Format presets as data: finished size, bleed, safe area, folds, resolution. The printer's spec always overrides them |

## 1. The printer's spec comes first

Every print job starts from the **spec sheet the printer sends**. It decides the size, bleed, color conversion and file. Colors convert differently for each printer and region (Europe and the US use different profiles), so never guess them.

**Must:** before building, get these from the spec sheet, or ask the person for the ones it doesn't give:

| Ask or read | Why |
| --- | --- |
| **Format**: flyer, brochure, poster, roll-up, business card, booth, print PDF | Picks the preset in `print.tokens.json` |
| **Finished size** (trim), in mm or inches | The size after cutting |
| **Bleed** | Background that runs past the trim, so no white edge shows after cutting |
| **Safe area** (or "live area") | The printer's cutting tolerance inside the trim. The content margin is 2 × this (section 2) |
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

**No printer's profile** (Vanesa, 2026-11-20): if the person goes on without the printer's spec, the job ends at the **proof and an RGB PDF for review**, clearly marked "not for the printer". Never guess a CMYK profile.

**Pantone:** the brand has no fixed Pantone match for its colors. If a printer asks for Pantone colors, ask the person to choose them, and suggest a designer for it. Don't refuse and don't guess.

## 2. The canvas in print

- **Finished size:** the trim size from the spec. Build at that size in mm, with the **bleed outside the trim** on every side. Backgrounds and images run to the bleed edge; nothing else does.
- **Margins: double the safe area** (Vanesa, 2026-11-20). The content margin (text, logo, button, QR code, headshots) is **2 × the safe area**, measured from the trim: with the default 5 mm safe area that's 10 mm on A4 and A5. The safe area is the printer's cutting tolerance, not the margin. If the printer's safe area is bigger than the preset's, it wins, and the margin is 2 × that.
- **Folds:** each panel is laid out as its own area, with the margin on both sides of every fold. Nothing important crosses a fold.
- **Shape and grid:** the shape comes from the **finished size** (trim width ÷ height, not including the bleed; [`layout/`](../layout/), Shapes), so the grid and gap roles are the same as on social, scaled to the finished size (Vanesa, 2026-11-20).

## 3. Backgrounds and theme

- **Backgrounds: solid colors or space imagery** (Vanesa, 2026-11-20). A printed piece uses a plain solid brand color (the neutrals in [`primitives/colors/`](../../primitives/colors/): paper white or `neutral-25` for light, `neutral-950` as the printer's rich black for dark) or a generated space image (astronaut or space imagery, following [`brand-assets/imagery/`](../../brand-assets/imagery/)). Qbot may be added in some cases, following [`guidelines/`](../) section 6: one hero, never with a generated image.
- **Must: no patterns in print, for now** (Vanesa, 2026-11-20). No pattern of any kind (Color, Mesh, Generative, Dithered) on a printed piece, and no pattern mask. Patterns stay for digital; Vanesa may add them back case by case later. Why: fine-line patterns (Dash, Glyph) get color fringing when the four inks don't line up exactly, the soft mask turns muddy in CMYK, and **dithered patterns cause moiré** against the printer's halftone screen.
- **Light by default for handouts** (Vanesa, 2026-11-20). Flyers, brochures and white papers people take away default to the light theme (paper white, dark text). Posters, roll-ups and booth graphics are dark (rich black). For print, this replaces "dark is the default" in [`guidelines/`](../) section 4. The preset's `theme` in `print.tokens.json` says which.
- **Rich black** (Vanesa, 2026-11-20): large dark areas use the printer's rich black, never black ink alone.
- **Gradients and image fades** (Vanesa, 2026-11-20): add slight grain (noise) to large gradients and image fades so they don't band. No tints under 5%: they drop out on paper.

## 4. Text in print

Sizes are in pt. Two kinds of printed piece, two type systems (Vanesa, 2026-11-20):

**One-page promos (flyers, posters, roll-ups):** the creative rules, with one title size and one supporting size ([`guidelines/`](../) section 11). Keep the title 2 to 3 times the supporting size.

**Text in print (proposed, to confirm: Vanesa)**

| Format | Title | Supporting |
| --- | --- | --- |
| Flyer A5 | 28 pt | 10.5 pt |
| Flyer A4, US Letter | 32 pt | 12 pt |
| Poster A2 | 120 pt | 48 pt |
| Poster A1 | 148 pt | 64 pt |
| Roll-up 850 × 2000 | 160 pt | 64 pt |

A4 supporting text sits at the top of Brand Guide 2.0's 10–12 pt for A4, A5 just under it; poster titles come from its 64–148 pt street-poster range ([`primitives/typography/`](../../primitives/typography/), "Sizes per channel"). A5 is never larger than A4 for the same piece.

**Documents (white papers, brochure inside pages, multi-page handouts):** the Brand Guide document scale in [`primitives/typography/`](../../primitives/typography/), "Sizes per channel": title / H1 / H2 / H3 / body / caption = 28 / 22 / 18 / 14 / 11 / 9 pt. Body text at least 9 pt and in full `text.on-light` (never mid-grey), aiming for 7:1 contrast on paper.

- **Minimum:** never under 8 pt, and 6 pt only for legal text.
- **Reversed text** (Vanesa, 2026-11-20): white (light) text on a dark background is at least 9 pt and Regular weight or heavier.
- **Event backdrops and booths:** 240–560 pt, logos big enough for camera shots (Brand Guide 2.0).
- **Logo:** at least 0.84 cm tall (3.1 × 0.84 cm), as [`brand-assets/logo/`](../../brand-assets/logo/) says.

## 5. Images and QR codes

- **Images** (Vanesa, 2026-11-20): at least 300 dpi at final size for anything read up close (A4 is about 2480 × 3508 px); the preset's `minDpi` for large formats. Generated images usually need upscaling, so check. The subject stays clear of the trim and any fold. **One image per piece.**
- **Headshots** follow [`imagery/headshots/`](../../brand-assets/imagery/headshots/); for print they need the dpi above.
- **QR codes** (Vanesa, 2026-11-20): at least 20 × 20 mm, dark on light only, with a quiet zone of 4 modules around it, the short URL printed under it, and test-scanned from the proof. Mark it with the class `.qd-qr` so the print checks find it.

## 6. Export

- **One PDF** (with the printer's profile) at trim size plus bleed, with crop marks outside the bleed, fonts embedded, converted to the printer's CMYK profile and in the file type the spec asks for (PDF/X-4 by default).
- **One proof image** (PNG) of every page, to review before printing.
- **Without the printer's profile:** only the proof and an RGB PDF for review (`<name>-rgb.pdf`), not for the printer (section 1).
- **Needs Ghostscript** on the computer of whoever makes print creatives, for the CMYK conversion. The export says how to install it if it's missing.
- **How:** [`review/print.py`](../../review/README.md#print) makes the PDF, the proof and the print checks from the page, this file's format presets and the printer's spec.
- **Suggest:** have a designer check the proof before it goes to the printer (to be reviewed after testing, 2026-11-20).

## 7. Formats

The presets are in `print.tokens.json`: finished size, bleed, safe area, folds, minimum image resolution and theme (light or dark). They're starting points: **the printer's spec always wins.**

| Preset | Status |
| --- | --- |
| Flyers: A4, A5, US Letter | Ready to test |
| Brochures: A4 bi-fold, A4 tri-fold, US Letter tri-fold | Ready to test |
| Posters: A2, A1 | Ready to test |
| Roll-up 850 × 2000 | Ready to test |
| Business cards: EU, US | Ready to test |
| Booth graphics | In progress (being tested). Always from the vendor's spec: no default size |
| Print PDF (screen PDF, no bleed, no CMYK) | Ready to test |

## Changing these rules

Ask Vanesa first. Add the date and what changed next to the rule. A new format is one entry in `print.tokens.json`.
