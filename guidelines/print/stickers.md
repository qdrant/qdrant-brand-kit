# Stickers

How to make a printed sticker from one request ("stickers for <event>"), with no Figma or Adobe step, ready for the vendor. Decided by the visual designer on 2026-11-27. Stickers are print, but they have their own rules for the logo, the mask and the cut, written here.

**Agents: when the request is for a sticker, read only this page, [`stickers.tokens.json`](stickers.tokens.json) and the files this page links to.** Not the rest of `guidelines/`, `layout/`, patterns, buttons, headshots or other print formats. Don't ask the main-visual, channel or copy questions.

| File | What it is |
| --- | --- |
| `stickers.md` | The sticker rules (this page) |
| `stickers.tokens.json` | Border, margins, logo size, mask steps, color profiles, cut line, vendor products |
| [`review/sticker/`](../../review/sticker/) | Builds the sticker, its PDF and its checks ([`review/README.md`](../../review/README.md#stickers)) |

## 1. What kind of sticker

Every request is read as three settings (visual designer, 2026-11-27). Take them from the request or the vendor's product; when neither says, use the default. Requests vary and can't all be predicted, so a new kind of sticker is a new entry in `stickers.tokens.json`, not a new rule. If a request fits no entry, build the closest one and say so in the proof.

| Setting | Options | Default |
| --- | --- | --- |
| **Shape** | **Contour**: die-cut around the subject. **Predefined shape**: circle, oval, square, rectangle, rounded square | Contour |
| **Layout** | One sticker, or a sheet of several (A4, A5 or the vendor's sheet) | One sticker, unless the request asks for several designs or a sheet |
| **Cut** | Die-cut (through the backing) or kiss-cut (peels off a sheet) | The vendor product's |

**Color region** (visual designer, 2026-11-27): the vendor's spec gives the CMYK profile. When it doesn't, decide from where the stickers are printed, or the event's place in the request (KubeCon Atlanta: US), and ask in one short question only if neither says. Europe: PSO Coated v3. US: GRACoL 2013. The proof says which profile was used. This is the sticker exception to "never guess a profile" in [`README.md`](README.md) section 1.

## 2. The image

- **Contour:** one element in the approved style (astronaut, helmet, planet, rocket, Qbot pose), isolated on a plain background, generated through Design Lab ([`brand-assets/imagery/`](../../brand-assets/imagery/)), then cut out.
- **Predefined shape:** a full image with its background, by the imagery rules, never split from the background (visual designer, 2026-11-27). Ask Design Lab for calm sky or ground at the top or bottom center, where the logo goes (section 4).
- **Resolution: 300 ppi at the printed size, a hard stop** ([`README.md`](README.md) section 5). A 1024 px image holds 300 ppi up to about 85 mm. Never enlarged to pass.

## 3. Contour stickers

- **White border:** the subject's outline grown by `border` (2 mm) all round, filled white (visual designer, 2026-11-27; width to confirm).
- **Logo: the full logo on every sticker, as a tab of the border** (visual designer, 2026-11-27):
  - The **Light** logo (red brandmark, dark wordmark) on a white backing: the logo's shape grown by the **same width as the border**, merged into the border so it looks like part of the outline. The backing sits over the artwork where they overlap.
  - **On the edge of the subject:** part over the artwork, part over the border, on a fairly straight stretch of the outline, never on the face or visor, the hands, a light source or the main focal point. Upper half first.
  - **Angle: any angle, vertical included, following the outline at that spot** (visual designer, 2026-11-27). The logo's bottom faces the subject. **Never upside down:** where that would flip it (the bottom edge), use another stretch.
- **Die line:** one closed path around the border and the logo tab together, smoothed so there are no notches where the tab meets the border (`closeMm`). Outside it, the vendor's bleed of paper white.
- The reference: the hand-made astronaut sticker in the Qdrant Brand Design file (Figma `2u6KfDsYjibQuf9ji6lFBR`, node `20914:19611`).

## 4. Predefined shapes

- **No cutout and no white border.** The image fills the shape and runs into the bleed. The cut line is the shape itself.
- **Logo: the full White logo** (visual designer, 2026-11-27), inside the shape, at the print margin (8% of the short side, never under 1.5 × the safe area, [`README.md`](README.md) section 2):
  - **Round shapes (circle, oval): centered left to right, at the top or the bottom**, as close to the edge as the safe area allows.
  - **Shapes with corners (square, rectangle, rounded square): a corner**, top left, top right, bottom left or bottom right.
- **The logo never touches the subject, and the subject stays inside the cut.** The agent may reframe the image to get there: zoom while it holds 300 ppi, and shift.
- **Mask: one very soft gradient from the edge nearest the logo** (visual designer, 2026-11-27), toward rich black (neutral 950 on screen). It must look like one piece with the background: no visible start or end, never a shape or patch behind the logo. The curve is smootherstep (`mask.curve`).
  - **As long as possible** (up to `mask.reachMax`, 70% of the sticker) without darkening the subject's **head, torso or hands** (its upper 60%). The feet may sit in the fade.
  - **As soft as possible:** the agent measures the logo's contrast and uses the first step in `mask.steps` that passes, from no mask up to **80% at the edge** (`mask.max`). Contrast is measured like [`check.py`](../../review/check.py): at the 5th-percentile pixel behind it, 4.5:1 for the wordmark, 3:1 for the brandmark.
  - **Which position:** the one whose mask hides the least of the picture (bright, lit areas count most). Then less zoom, then top before bottom and left before right. For the reference circle, that's center bottom: at the top the mask would darken the astronaut's head.
  - **If no position passes at 80%:** don't go stronger. Generate the image again with calm space for the logo.

## 5. Logo exceptions for stickers

Stickers break three logo rules on purpose (visual designer, 2026-11-27). Everything else in [`brand-assets/logo/`](../../brand-assets/logo/) holds.

| Logo rule | On stickers |
| --- | --- |
| Don't rotate it | Contour stickers: rotated to follow the outline (section 3) |
| No outlines or effects | Contour stickers: the white backing, the same width as the border, as part of the cut |
| Dark logo on dark images | Predefined shapes: the White logo on the image, with the soft mask (section 4) |
| Minimum 3.1 × 0.84 cm in print | About 20% of the sticker's width, never under `logo.minHeightMm` (5 mm) tall. Stickers are read up close, and at 300 ppi they stay under about 85 mm |

## 6. The file

- **One PDF per sticker or sheet, PDF/X-4, CMYK only** (no RGB anywhere), converted with the profile from section 1, which is also the output intent.
- **Two layers:** `Artwork` and `CutContour`. The cut is a spot color named by the vendor (default `CutContour`, C0 M100 Y0 K0), 0.25 pt stroke, no fill, overprint, one closed path per sticker.
- **No fonts:** the logo is vector shapes from [`brand-assets/logo/`](../../brand-assets/logo/). The dark wordmark is K100 only; large dark areas are the rich black, C90 M70 Y45 K90 in Europe and C25 M10 Y0 K100 in the US ([`README.md`](README.md) section 3; visual designer, 2026-11-27).
- **A proof PNG** with the cut line drawn thick, the cut plate on its own, and a zoom on the logo for contour stickers.
- **New file names every round** (`_v2`, `_v3`): Acrobat keeps showing an older file with the same name.

## 7. Checks

Hard stops: a sticker that fails one is never shown or delivered.

| Check | Contour | Shape |
| --- | --- | --- |
| Image 300 ppi at the printed size | ✓ | ✓ |
| Artwork and logo inside the cut | ✓ | ✓ |
| Border as wide as `border` all round, the logo's backing included | ✓ | |
| No inside corners or necks tighter than 1 mm | ✓ | |
| One closed cut path per sticker | ✓ | ✓ |
| The logo off the subject; the subject inside the cut | | ✓ |
| Logo contrast: wordmark 4.5:1, brandmark 3:1 | ✓ | ✓ |
| The mask doesn't darken the subject's head, torso or hands | | ✓ |
| CMYK only, `CutContour` spot on its own layer, PDF/X-4 output intent | ✓ | ✓ |

**Suggest:** a designer checks the first real runs, and any run with a new vendor or a new kind of sticker. After that, the checks are enough.

## 8. Still to decide

- Border width: 2 mm in the prototype; the hand-made reference is closer to 3 mm.
- Sheets (several stickers on A4 or A5, kiss-cut): written, not built yet.
- Cutting out a freshly generated image (plain or black background): not tested yet. The prototype started from an existing cutout.
- The focal areas (face, hands, light) for the contour logo: the prototype marks them by hand; the agent needs a vision step. Shapes use a segmentation model for the subject.
- Whether the corner positions on square stickers also use the White logo.
- [`review/print.py`](../../review/print.py)'s busy-background check counts sparse stars as busy, so a logo can never pass on a starry sky with it. Stickers use the contrast check instead.

## Changing these rules

Ask the visual designer first. Add the date and what changed next to the rule. A new sticker product or shape is an entry in `stickers.tokens.json`.
