# Print

How to make a printed creative: a flyer, a brochure, a poster, a roll-up, a business card, a booth graphic or a print PDF. Print is a layer on top of the creative rules, not a separate system. Decided by Vanesa on 2026-11-20.

**Everything that isn't physical comes from the same places as social creatives:** the primitives (colors, type, radius), the brand assets (logo, patterns, Qbot, imagery, icons), the parts in [`brand-components/`](../../brand-components/) and the composition rules in [`guidelines/`](../) (one hero, two text sizes, the light card, the pattern mask, button placement). This folder adds only what's physical: size, bleed, safe area, folds, resolution, color conversion and export.

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
| **Safe area** (or "live area") | How far text, the logo and the button stay inside the trim |
| **Folds or panels** (brochures), and any hidden area (e.g. a roll-up's base) | Where nothing important may sit |
| **Color**: the printer's CMYK profile (e.g. FOGRA39, GRACoL), or Pantone colors if the printer asks for them | How the brand colors convert |
| **File type**: PDF/X-4, PDF/X-1a or what the printer asks | How to export |
| **Resolution** for images | Usually 300 dpi at final size; less for large formats seen from far away |

**When the spec is missing**, in this order:

1. Ask the person to get the spec from the printer.
2. If they can't, explain the risks plainly and let them decide whether to go on with the preset's defaults:
   - colors can shift, the brand red most of all;
   - a wrong size or bleed can leave white edges or cut off content;
   - the printer may reject the file.
3. Suggest checking with a designer.

**Pantone:** the brand has no fixed Pantone match for its colors. If a printer asks for Pantone colors, ask the person to choose them, and suggest a designer for it. Don't refuse and don't guess.

## 2. The canvas in print

- **Finished size:** the trim size from the spec. Build at that size in mm, with the **bleed outside the trim** on every side. Backgrounds, patterns and images run to the bleed edge; nothing else does.
- **Safe area = the margins.** Text, the logo, the button and headshots stay inside it, like the margins on social ([`layout/`](../layout/)). The spec's safe area wins over the preset's.
- **Folds:** each panel is laid out as its own area, with the safe area on both sides of every fold. Nothing important crosses a fold.
- **Shape and grid:** the shape still comes from width ÷ height ([`layout/`](../layout/), Shapes), so the grid and gap roles are the same as on social, scaled to the finished size.
- **Dark or light:** the same rule as social (dark by default, light moments allowed, [`guidelines/`](../) section 4). Large dark areas use the printer's rich black, never plain black from the hex value.

## 3. Text in print

The same two text sizes and composition rules as social ([`guidelines/`](../) section 11). Sizes are in pt, from Brand Guide 2.0 ([`primitives/typography/`](../../primitives/typography/), "Sizes per channel"):

| Format | Sizes |
| --- | --- |
| A4 and smaller (flyers, brochures, cards) | Body 10–12 pt |
| Street poster (A0–A2) | 64–148 pt |
| Event backdrop, booth | 240–560 pt, logos big enough for camera shots |

**To decide (Vanesa):** the title and supporting sizes for each preset, as a "Text in print" table like "Text in creatives". Until then, use the ranges above and keep the title 2–3 times the supporting size, as on social.

- **Minimum (proposed, to confirm):** never under 8 pt, and 6 pt only for legal text. Brand Guide 2.0's smallest document size is a 9 pt caption.
- **Logo:** at least 0.84 cm tall (3.1 × 0.84 cm), as [`brand-assets/logo/`](../../brand-assets/logo/) says.

## 4. Images and patterns

- **Photos and generated images:** at least 300 dpi at final size for anything read up close (flyers, brochures, cards); the preset's `minDpi` for large formats.
- **Patterns** are drawn at the final size, so they stay sharp at any size.
- **Headshots** follow [`imagery/headshots/`](../../brand-assets/imagery/headshots/); for print they need the dpi above.

## 5. Export

- **One PDF** at trim size plus bleed, with crop marks outside the bleed, fonts embedded, converted to the printer's CMYK profile and in the file type the spec asks for (PDF/X-4 by default).
- **One proof image** (PNG) of every page, to review before printing.
- **Needs Ghostscript** on the computer of whoever makes print creatives, for the CMYK conversion. The export says how to install it if it's missing.
- **How:** [`review/print.py`](../../review/README.md#print) makes the PDF, the proof and the print checks from the page, this file's format presets and the printer's spec.
- **Suggest:** have a designer check the proof before it goes to the printer (to be reviewed after testing, 2026-11-20).

## 6. Formats

The presets are in `print.tokens.json`: finished size, bleed, safe area, folds and minimum image resolution. They're starting points: **the printer's spec always wins.**

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
