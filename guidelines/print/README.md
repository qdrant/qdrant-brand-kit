# Print

How to make a printed creative: a flyer, a brochure, a poster, a roll-up, a business card, a booth graphic or a print PDF. Print is a layer on top of the creative rules, not a separate system. Decided by the visual designer on 2026-11-20.

**Everything that isn't physical comes from the same places as social creatives:** the primitives (colors, type, radius), the brand assets (logo, Qbot, imagery, icons), the parts in [`brand-components/`](../../brand-components/) and the composition rules in [`guidelines/`](../) (one hero, two text sizes, button placement). This folder adds what's physical (size, bleed, safe area, margins, folds, resolution, color conversion and export) and the few places where print differs: space imagery only on small prints (visual designer, 2026-11-26), a choice of look instead of the main-visual question, wider margins, and text sizes in pt (visual designer, 2026-11-20). Print uses the **light or the dark theme**, and the person picks **with or without a pattern** (visual designer, 2026-11-26).

> **Large-format print is in progress** (visual designer, 2026-11-20). Booths, roll-ups and retractable banners, event backdrops, large banners and posters (A2 and bigger) aren't settled yet: margins, text sizes, image resolution, layout and export still need rules and testing. These rules are written and tested for pieces read up close (flyers, brochures, business cards, print PDFs). For a large-format piece, work from the vendor's spec, treat the result as a test, and have a designer check it. Booths go through the booth workflow in Figma for now.

| File | What it is |
| --- | --- |
| `README.md` | The print rules (this page) |
| `print.tokens.json` | Format presets as data: finished size, bleed, safe area, margin, folds, resolution and text sizes in pt. The printer's spec always overrides the physical values |
| `stickers.md`, `stickers.tokens.json` | Stickers: contour and predefined shapes, their own logo, mask and cut rules (visual designer, 2026-11-27) |

**This page is the only place for the print rules** (visual designer, 2026-11-26). Other files link here and keep at most a short summary. It absorbed the Print section of [`layout/`](../layout/) on 2026-11-26.

## 1. The printer's spec comes first

Every print job starts from the **spec sheet the printer sends**. It decides the size, bleed, color conversion and file. Colors convert differently for each printer and region (Europe and the US use different profiles), so never guess them.

**Must:** before building, get these from the spec sheet, or ask the person for the ones it doesn't give. **Bleed and safe area always follow the vendor** (visual designer, 2026-11-26): the presets' values are only a fallback until the person says what the vendor's spec says.

| Ask or read | Why |
| --- | --- |
| **Format**: flyer, brochure, poster, roll-up, business card, booth, print PDF | Picks the preset in `print.tokens.json` |
| **Finished size** (trim), in mm or inches | The size after cutting |
| **Bleed** | Background that runs past the trim, so no white edge shows after cutting. Some vendors want no bleed: then build without it (visual designer, 2026-11-26) |
| **Safe area** (or "live area") | The printer's cutting tolerance inside the trim. The content margin is never less than 1.5 × this (section 2) |
| **Folds or panels** (brochures), and any hidden area (e.g. a roll-up's base) | Where nothing important may sit |
| **Color**: the printer's CMYK profile (e.g. FOGRA39, GRACoL), or Pantone colors if the printer asks for them | How the brand colors convert |
| **File format**: the PDF/X version and crop marks (fonts are always outlined, section 6) | How to export. Each vendor decides: there's no brand default (visual designer, 2026-11-26) |
| **Resolution** for images | 300 dpi at the printed size for small pieces read up close; 100 to 150 dpi for large formats, or what the vendor's spec requires: the vendor wins (visual designer, 2026-11-26) |
| **Large formats: where it hangs or stands**: hung from the ceiling or standing on the floor | Where eye level is on the piece (section 2) (visual designer, 2026-11-26) |
| **Large formats: what might cover it**: counters, furniture, people | Where nothing important may sit (section 2) (visual designer, 2026-11-26) |

**When the spec is missing**, in this order:

1. Ask the person to get the spec from the printer.
2. If they can't, explain the risks plainly and let them decide whether to go on with the preset's defaults (then the job ends at a proof and an RGB PDF for review, see below):
   - colors can shift, the brand red most of all;
   - a wrong size or bleed can leave white edges or cut off content;
   - the printer may reject the file.
3. Suggest checking with a designer.

**No printer's profile** (visual designer, 2026-11-20): if the person goes on without the printer's spec, the job ends at the **proof and an RGB PDF for review**, clearly marked "not for the printer". Never guess a CMYK profile. **Color is always checked:** without the CMYK conversion to the printer's profile, the color check fails and nothing is delivered for print.

**Pantone** (visual designer, 2026-11-27): the brand Pantones are set, Solid Coated (C), in [`primitives/colors/`](../../primitives/colors/), "Print: CMYK and Pantone" (for example amaranth 192 C, indigo 2725 C). On uncoated paper, use the same number (U). It replaces "the brand has no fixed Pantone match; ask the person to choose" (2026-11-20). A Pantone spot color is closer than CMYK for the colors outside the CMYK gamut (indigo, purple).

## 2. The canvas in print

The layout rules here hold at every size, from a business card to a booth backdrop, because each one is a proportion of the piece or comes from the printer's spec (visual designer, 2026-11-26).

- **Same system** (visual designer, 2026-11-20). Print uses the same Canvas, Grid, Stack and Box as [`layout/`](../layout/), at the finished size.
- **Finished size:** the trim size from the spec. Build at that size in mm, with the **bleed outside the trim** on every side, as wide as the vendor asks (none, if the vendor wants no bleed) (visual designer, 2026-11-26). Backgrounds (solid color, image or pattern) run to the bleed edge on every side; nothing else does (visual designer, 2026-11-20).
- **Margins: 8% of the short side** (visual designer, 2026-11-20). **Margins scale with the piece: a share of the short edge, like the social canvases, never a fixed size in mm per format** (visual designer, 2026-11-26). One rule for every format, so the margin shrinks with the piece: the content margin (text, logo, QR code, headshots; no button in print, section 5) is **8% of the finished piece's short side**, measured from the trim, and **never less than 1.5 × the printer's safe area**. What that gives, for example: A4 17 mm, A5 12 mm, A6 8.4 mm, A2 34 mm, roll-up 68 mm. Brochures use the short side of the folded panel. Why 8%: the visual designer wants 1.5 to 2 cm on A4 (7 to 9.5% of 210 mm), and 8% lands in the middle. The safe area is the printer's cutting tolerance; a bigger safe area in the printer's spec pushes the margin up to 1.5 × that. Each format's `margin` in `print.tokens.json` is computed this way, from the 8%; it's never set by hand. Replaces "about 12%, at least 2 × safe" (25 mm on A4).
- **Folds:** each panel is laid out as its own area, with the margin on both sides of every fold. Nothing important crosses a fold.
- **Large formats: main content at eye level** (visual designer, 2026-11-26). Roll-ups, backdrops and booth walls keep the main content (title, logo, QR code) at eye level. Before building, ask the person whether the piece hangs from the ceiling or stands on the floor, and whether anything will cover part of it (counters, furniture, people). Place the content from the answers: nothing important where it will be covered.
- **Shape and grid:** the shape comes from the **finished size** (trim width ÷ height, not including the bleed; [`layout/`](../layout/), Shapes), so the grid and gap roles are the same as on social, scaled to the finished size (visual designer, 2026-11-20).

## 3. Backgrounds and the look

- **Space imagery: small prints only, at 300 dpi** (visual designer, 2026-11-26). Space imagery is approved only for small-scale print (flyers, cards and other pieces read up close), and only when the image holds **300 dpi at the printed size** (section 5). Not on large formats. It replaces "space imagery is not approved for print yet", decided earlier that day.
- **Light or dark** (visual designer, 2026-11-26). A printed piece uses the light or the dark theme. It replaces "light for print" in [`primitives/colors/`](../../primitives/colors/) (2026-11-04). The other color rules stay: no hex values, no gradients on text, red backgrounds only with the person's yes.
- **Patterns: the person picks with or without** (visual designer, 2026-11-26). Patterns may be used as backgrounds.
  - **Recommend** (visual designer, 2026-11-26): **with a pattern for large formats** (banners, roll-ups, booths, backdrops, posters A2 and bigger), where it gives the piece a strong effect. **A cleaner background, without a pattern, for small formats** (flyers A6 to A3), especially when the content is heavy or the piece has a high-resolution image.
  - **Painted at the printed size** (visual designer, 2026-11-26): patterns are code, so they're always painted fresh by the pattern code at the piece's printed size and resolution, never taken from a smaller file or enlarged. `review/print.py` paints them at 300 dpi at the printed size.
  - Any pattern from [`brand-assets/patterns/`](../../brand-assets/patterns/), with the same rules as on screen ([`guidelines/`](../) sections 2 to 4). Like every background, a pattern runs to the bleed edge. It replaces "no patterns in print, for now" (2026-11-20), which kept them out because fine-line patterns (Dash, Glyph) can fringe when the inks don't line up, the soft mask can turn muddy in CMYK, and dithered patterns can cause moiré against the printer's halftone screen. Look for these on the proof.
- **Must: never "pattern only" in print** (visual designer, 2026-11-26). A pattern may be a background, but a printed piece is never pattern only, so "Pattern only" is never offered in the look question below. It settles the open question raised earlier that day.
- **To decide (visual designer, raised 2026-11-26):** whether the pattern mask (`.qd-pattern-mask`) is allowed in print. Until then, ask the person before using it.
- **No default look: the person chooses** (visual designer, 2026-11-20). For print, this question replaces the "main visual" question in [`AGENTS.md`](../../AGENTS.md) step 1. Ask, with the recommendation:
  - **Dark with space imagery:** small prints only, at 300 dpi (visual designer, 2026-11-26). A generated astronaut or space image on `neutral-950`, following [`brand-assets/imagery/`](../../brand-assets/imagery/). Recommended for commercial pieces handed out at events (visual designer, 2026-11-20).
  - **Plain and serious:** brand colors, light (paper white or `neutral-25`) or dark (`neutral-950`), the theme the person picks, with or without a pattern background (visual designer, 2026-11-26; recommendation above). Recommended light for documents (white papers, brochure inside pages).
  - Qbot may be added in some cases, following [`guidelines/`](../) section 6 and section 5 here: one hero, never with a generated image.
- **Must: space imagery is always dark** (visual designer, 2026-11-20). Image fades are dark-only ([`guidelines/`](../) section 5), so a space-imagery print piece is dark.
- **Must: text never sits on the image's subject or on busy ground** (visual designer, 2026-11-20): not on the astronaut, rocks, the Milky Way or bright stars, the same rule as [`guidelines/`](../) section 5. If the text reaches the subject, first tighten the gaps between groups ([`guidelines/`](../) section 11, rule 11), then use the smaller print sizes (section 4), then ask to cut copy. **Text on a busy background is a hard stop** (visual designer, 2026-11-20): `review/print.py` fails it, and the piece is never shown or delivered until every line sits on calm, legible ground. If no layout keeps the text calm, split the piece over two sides (image and title on the front, details on a plain back), use the plain look, or ask to cut copy.
- **Rich black** (visual designer, 2026-11-20): large dark areas use a rich black, never black ink alone. The rich black is the dark background's (`neutral-950`) print build: **C90 M70 Y45 K90 in Europe** (FOGRA51, 295% total ink) and **C25 M10 Y0 K100 in the US** (GRACoL 2006) (visual designer, 2026-11-27). It replaces the cool black C40 M0 Y0 K100 (2026-11-26), which replaced C70 M50 Y30 K100. If the vendor sets a lower ink limit, the vendor wins. Dark text and thin lines on light use **K100 only**, never rich black (visual designer, 2026-11-26).
- **Color mode: CMYK, never RGB** (visual designer, 2026-11-26). Files go to the printer in CMYK. Printers are in Europe and in the US, so the brand colors get two sets of CMYK values, one per region's profile.
  - **CMYK values** (visual designer, 2026-11-27): Europe uses the FOGRA51 set (PSO Coated v3), the US the GRACoL 2006 set, both in [`primitives/colors/`](../../primitives/colors/), "Print: CMYK and Pantone". It replaces "CMYK values: to decide" (2026-11-26). A printer's own profile still wins: convert with theirs and check it on the proof. The values are screen-simulated, not proofed.
- **Gradients and image fades** (visual designer, 2026-11-20): slight grain (noise) on large gradients and image fades so they don't band in CMYK. `review/print.js` adds it to `.qd-image-fade` in print renders, so pages don't add it themselves. No tints under 5%: they drop out on paper.

## 4. Text in print

Sizes are in pt. Two kinds of printed piece, two type systems (visual designer, 2026-11-20):

**One-page promos (flyers, posters, roll-ups):** the creative rules, with one title size and one supporting size ([`guidelines/`](../) section 11). Keep the title 2 to 3 times the supporting size.

**Text in print: sized for good legibility at the printed size** (visual designer, 2026-11-26; replaces "proposed, to confirm", 2026-11-20). The sizes below are the recommended ones for each format; for a size not listed, pick what reads well at that size and distance. Every size is a step of the type set in [`primitives/typography/`](../../primitives/typography/), read as pt (a 40 px step is 40 pt): 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64, 80, 104, 128, 160, 200. Print adds two steps below them: **10 pt** for body copy on small formats and **8 pt** for legal text, footers and small print only. Never a size in between (visual designer, 2026-11-20). The values live in `print.tokens.json` (`title`, `supporting` and the smaller `titleMin`, `supportingMin` per format, in pt), and `review/print.py` applies them, so pages never set print sizes themselves:

| Format | Solid | Space imagery, smallest |
| --- | --- | --- |
| Flyer A4, US Letter | Title 40 pt, supporting 18 pt | Title 32 pt, supporting 12 pt |
| Flyer A5 | Title 32 pt, supporting 14 pt | Title 24 pt, supporting 10 pt |
| Flyer A6 | Title 24 pt, supporting 10 pt | the same |
| Poster A2 | Title 128 pt, supporting 48 pt | the same |
| Poster A1 | Title 160 pt, supporting 64 pt | the same |
| Roll-up 850 × 2000 | Title 160 pt, supporting 64 pt | the same |

- **Front covers** (visual designer, 2026-11-20): when a front holds only the logo, the title and the image (a two-sided piece, see section 3), the title is about **1.45 × the title size** (`titleCover`, snapped to the nearest step; A6: 32 pt, H5) and takes the calm sky's width. Use `.qd-title--cover`.
- **Solid pieces** use the solid sizes. From testing: A4 at 12 pt looked empty and 22 pt slightly big in cards; A5 worked anywhere from 10.5 to 15.5 pt.
- **Space-imagery pieces** use the same sizes, or smaller down to the smallest ones when that's what keeps all text in the calm sky (section 3). `review/print.py --print-scale small` uses them.

**Documents (white papers, brochure inside pages, multi-page handouts):** the Brand Guide document scale in [`primitives/typography/`](../../primitives/typography/), "Sizes per channel": title / H1 / H2 / H3 / body / caption = 28 / 22 / 18 / 14 / 11 / 9 pt. The Print rows there are confirmed as they are (visual designer, 2026-11-26). Body text at least 9 pt and in full `text.on-light` (never mid-grey), aiming for 7:1 contrast on paper.

- **Must: easily legible when printed** (visual designer, 2026-11-20). Body copy is **10 to 12 pt**. **8 pt is the minimum**, and only for legal text, footers and small print. Nothing under 8 pt, legal text included.
- **Reversed text** (visual designer, 2026-11-20; 10 pt on rich black (visual designer, 2026-11-26)): white (light) text on a dark background is Regular weight or heavier, and light text reversed out of rich black is **at least 10 pt**. So 8 pt small print only goes on light backgrounds.
- **Event backdrops and booths:** 240–560 pt, logos big enough for camera shots (Brand Guide 2.0).
- **Logo:** at least 0.84 cm tall (3.1 × 0.84 cm), as [`brand-assets/logo/`](../../brand-assets/logo/) says.

## 5. Qbot, images and QR codes

- **Qbot in print** (visual designer, 2026-11-26). It replaces "Qbot, headshots and images are allowed when they hold the resolution" (visual designer, earlier on 2026-11-26).
  - **A transparent PNG without its drop shadow:** no `.qd-mascot--glow` on print.
  - **Rendered at high quality**, at the resolution below (the vendor's dpi wins).
  - **Every Qbot rule holds:** where it sits in the frame, how it's trimmed (no cut face), one hero, never with headshots or a generated image, margins ([`guidelines/`](../) section 6). If it doesn't meet all of them, it isn't used.
- **Headshots in print** (visual designer, 2026-11-26): allowed, when the photo is **very large and high quality**: it holds the resolution below at its printed size, measured on the part that shows in the card or circle. A smaller or soft photo isn't used. It settles the open question raised earlier that day.
- **Must: image resolution is a hard stop** (visual designer, 2026-11-20; per format (visual designer, 2026-11-26)). It applies to every image: Qbot, headshots and space imagery (always 300 dpi). **300 dpi at the printed size for small prints read up close** (flyers, brochures, cards; A4 is about 2480 × 3508 px). **Large formats (posters, roll-ups, booths, banners) use 100 to 150 dpi** (the format's `minDpi`: posters 150, roll-ups, booths and banners 100), **or what the vendor's spec requires: the vendor wins** (`review/print.py --min-dpi`). It settles the "to confirm" on 300 dpi against `minDpi` raised earlier that day. An image under it is **never delivered, and never enlarged** to pass the check, astronaut imagery included. Resolution counts the part of the file that shows: a cropped image (a Qbot crop, `object-fit: cover`) counts only its crop. Until an upscaler is approved, the answer is "This is not doable for now", with the plain, solid version offered instead.
  - Design Lab's largest image is 1024 × 1536 px: sharp enough at 300 dpi only up to about 87 mm wide (business cards). So A5 and A4 space imagery is refused for now.
  - **No upscaler, for now** (visual designer, 2026-11-26). The Topaz Labs upscale API was proposed (a 4× upscale, 4096 × 6144 px, would cover A4 and A3 at 300 dpi) and is not approved. So space imagery stays limited by Design Lab's image size.
- The subject stays clear of the trim and any fold. **One image per piece.**
- **Headshots** follow [`imagery/headshots/`](../../brand-assets/imagery/headshots/); for print they need the dpi above.
- **QR codes replace the button** (visual designer, 2026-11-26). **No button on print pieces.** Mark the code with the class `.qd-qr` so the print checks find it, and test-scan it from the proof (visual designer, 2026-11-20).
  - **Size:** the side is at least the scanning distance ÷ 10, and never under 2.5 cm. It replaces 20 mm (2026-11-20). The minimum per format is `qrMin` in `print.tokens.json`:

    | Read from | Pieces | QR side |
    | --- | --- | --- |
    | Arm's length | Hand-held: flyers, cards, brochures, A5 to A4 | at least 2.5 cm |
    | 1 to 2 m | Posters and roll-ups | 10 to 20 cm, never under 10 cm |
    | 3 m or more | Booth walls and backdrops | at least 30 cm |

  - **Color:** dark modules on a light square, with a quiet zone of 4 modules on every side, even on a dark piece.
  - **URL:** a short URL written under it at the supporting size, left-aligned with the code.
  - **Where:** where the button would sit, inside the margins. On large formats it sits **1.0 to 1.6 m from the floor**, so phones can reach it.

## 6. Export

- **One PDF** (with the printer's profile) at trim size plus bleed, with crop marks outside the bleed, all text outlined (section 6, Fonts), converted to the printer's CMYK profile, never RGB (visual designer, 2026-11-26).
- **File format: each vendor's** (visual designer, 2026-11-26). The PDF/X version and crop marks follow the vendor's spec; fonts are always outlined (Fonts, below). There's no brand default (it replaces "PDF/X-4 by default"). `review/print.py --pdfx` takes the vendor's version; without it, the print checks list the file format as not from the spec.
- **One proof image** (PNG) of every page, to review before printing.
- **Without the printer's profile:** only the proof and an RGB PDF for review (`<name>-rgb.pdf`), not for the printer (section 1).
- **Needs Ghostscript** on the computer of whoever makes print creatives, for the CMYK conversion. The export says how to install it if it's missing.
- **How:** [`review/print.py`](../../review/README.md#print) makes the PDF, the proof and the print checks from the page, this file's format presets and the printer's spec.
- **Fonts: outlined before print** (visual designer, 2026-11-26). The fonts are exactly the design system's (Mona Sans from [`primitives/typography/`](../../primitives/typography/)), pulled from there and never swapped or changed. Before the file goes to the printer, all text is outlined (turned into shapes), so the printer needs no fonts and nothing can be substituted. `review/print.py` does it in the CMYK conversion. It settles the 2026-11-20 question (static Mona Sans Display files or outlines), which came from Chrome exporting Mona Sans as Type 3 fonts that some printers reject.
- **Suggest:** have a designer check the proof before it goes to the printer (to be reviewed after testing, 2026-11-20).

## 7. Formats

The presets are in `print.tokens.json`: finished size, bleed, safe area, margin, folds, minimum image resolution and text sizes. They're starting points: **the printer's spec always wins.**

| Preset | Status |
| --- | --- |
| Flyers: A4, A5, A6, US Letter | Ready to test (A6 proposed 2026-11-20) |
| Brochures: A4 bi-fold, A4 tri-fold, US Letter tri-fold | Ready to test |
| Posters: A2, A1 | In progress (large format, 2026-11-20) |
| Roll-up 850 × 2000 | In progress (large format, 2026-11-20) |
| Business cards: EU, US | Ready to test |
| Booth graphics | In progress (large format). Always from the vendor's spec: no default size |
| Print PDF (screen PDF, no bleed, no CMYK) | Ready to test |

## Changing these rules

Ask the visual designer first. Add the date and what changed next to the rule. A new format is one entry in `print.tokens.json`.
