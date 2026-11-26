# Review

Review a creative before it's shown: render it at exact sizes, check it against the repo's rules, and put the results on one contact sheet. For agents and people making creatives, and for testing the repo.

For generated images, also use the image checklist in [`brand-assets/imagery/guidance/review.md`](../brand-assets/imagery/guidance/review.md). A brand taste review (scoring and calibrated likes and dislikes) will be added here later.

**Mechanics only.** These scripts never decide a size, color or layout. Every rule value comes from the repo's own files (`guidelines/layout/layout.tokens.json`, `primitives/typography/typography.tokens.json`, `brand-assets/logo/logo.css`, `primitives/colors/colors.css`). If the repo doesn't give a value, the check says so instead of guessing.

| File | What it does |
| --- | --- |
| `render.py` | Opens a page in headless Chrome at each size, saves `<name>-<shape>.png` (exactly W×H), a `.bg.png` with the text hidden (for contrast), and `<name>-<shape>.json` with the measurements |
| `measure.js` | Added to the page by `render.py`. Records positions, sizes, fonts, colors and files. No rules |
| `check.py` | Runs the checks from [`guidelines/layout/checks.md`](../guidelines/layout/checks.md) and the type, logo, button and headshot rules on the measurements. Writes a table and lists what to look at by eye |
| `print.py` | Print export for one page: lays it out at 300 dpi with the format's bleed, margins and text sizes (from [`guidelines/print/print.tokens.json`](../guidelines/print/print.tokens.json) and the printer's spec), then writes the PDF with crop marks, converts it to the printer's CMYK profile with Ghostscript, makes a proof image and runs the print checks. See [Print](#print) |
| `print.js` | Added to the page by `render.py`. Does nothing unless `print.py` asks for a print layout |
| `sheet.py` | Puts every render in one labelled `contact-sheet.png`: rows are names, columns are shapes. An option of a shape (`<name>-<shape>-b.png`) gets its own column; `--label name="text"` replaces a row's name |

Needs Google Chrome (or Chromium) and Python 3 with Pillow (`pip install pillow`). Nothing else is installed. `render.py` finds Chrome on a Mac or on Linux (the cloud) by itself; set `QD_CHROME` to its path if it's somewhere else.

## Use

```bash
python3 review/render.py my-ad.html --out out/ --name alt-1 --sizes 1080x1080,1080x1350,1080x1920
python3 review/check.py "out/*.json" --md out/report.md
python3 review/sheet.py out/ --label alt-1="Comet, imagery"
python3 review/render.py my-ad.html --out out/ --name alt-2 --params "photo=b"   # extra query parameters for the page
```

Write the page like this:

- Load repo files from `/repo/…`, e.g. `<link rel="stylesheet" href="/repo/guidelines/layout/layout.css">`. `render.py` serves the repo there.
- Put one `.qd-canvas` in the page and add `<script src="/repo/guidelines/layout/canvas.js"></script>`. `render.py` passes `?w=&h=`, and `canvas.js` sets the shape and size from them.
- If the page loads files from a parent folder (e.g. `../inputs/photo.png`), pass `--root` with that parent folder.
- Never save pages, photos or renders inside the repo. Use a folder outside it, with absolute paths.

## Print

For anything printed, read [`guidelines/print/`](../guidelines/print/) first. Build the page as usual (one `.qd-canvas`), then:

```bash
python3 review/print.py my-flyer.html --format flyer-a4 --out out/ --name spring-flyer --icc printer-profile.icc
```

- `--format` is a preset from `print.tokens.json`. The printer's spec overrides it: `--trim 210x297`, `--bleed 3`, `--safe 5`, `--panels 100,100,97`, `--hidden-bottom 100`, `--min-dpi 150` (the vendor's image resolution, over the format's `minDpi`: 300 up close, 100 to 150 for large formats; the vendor wins, Vanesa 2026-11-26), `--pdfx 4`. The checks show which values still come from the preset. The file format has no brand default: pass the vendor's `--pdfx`, or the checks list it as not from the spec (Vanesa, 2026-11-26).
- Margins are the format's `margin` (8% of the short side, never under 1.5 × the safe area), from the trim: 17 mm on A4, 12 mm on A5, 8.4 mm on A6. The shape and scale come from the finished size, not trim + bleed (Vanesa, 2026-11-20).
- **Text sizes** come from the format's `title` and `supporting` in pt (`print.tokens.json`), so pages never set print sizes: `print.js` sets `.qd-title`, `.qd-supporting` and `.qd-icon`. `--print-scale small` uses `titleMin` and `supportingMin`, for space imagery when that keeps the text in the calm sky. `check.py` checks the print sizes instead of the social scale.
- **Grain:** image fades get a light grain in the PDF only, so they don't band in CMYK.
- `--icc` is the printer's color profile. **Without it** the run ends at the proof and `<name>-rgb.pdf` for review, not for the printer, and the color check fails: color is always checked, so nothing goes to the printer without the CMYK conversion (visual designer, 2026-11-20). With `--icc` but no Ghostscript, the color check fails, with how to install it.
- It writes `<name>.pdf` (for the printer, only with `--icc`), `<name>-rgb.pdf` (before CMYK, not for the printer), `<name>-proof.png` (the piece after cutting, folds dashed), `<name>-full.png` and `.json` (the 300 dpi render and measurements, for `check.py`) and `<name>-print.md` (the print checks).
- Print checks: printer's spec, margin, text size, text on a busy background (a hard stop: detail or a subject behind text that isn't in a card, Vanesa 2026-11-20), reversed text (light on dark: 10 pt or more, Regular or heavier, Vanesa 2026-11-26), no button (a QR code replaces it), folds, logo size, patterns (allowed since 2026-11-26: a 👀 to check the proof for fringing and moiré, and to ask before using the pattern mask), QR codes, image resolution (a hard stop: "Not doable for now", never a plain resize; measured on the part of the file that shows, so a cropped Qbot counts its crop), fonts (👀 on Type 3 fonts, which some printers reject; uses `pdffonts` when installed), color. Then run `check.py` on the `.json` for the brand checks.
- **QR codes:** mark the QR code's element with the class `.qd-qr` (the code plus its quiet zone). The check fails under the format's `qrMin` (25 mm hand-held, 100 mm posters and roll-ups, 300 mm booths) or when it isn't dark on light. Test-scan it from the proof. A button on a print piece fails: the QR code replaces it (Vanesa, 2026-11-26).
- Text, logo and button stay vector in the PDF. The backdrop (canvas color, patterns, faded images) goes in as one 300 dpi image, because Chrome's PDF export loses CSS masks.
- Needs Ghostscript (`brew install ghostscript` on a Mac, `apt install ghostscript` on Linux) on top of what's listed above.

## What the checks can't judge

`check.py` ends with a short list to review by eye: hierarchy and calm, top and bottom spread, crops, text on a calm part of a pattern, the logo version for the background, one hero, no eyebrow or made-up content. Look at every render before showing it.

## Known limits

- Contrast compares the text color with the 5th-percentile pixel behind it, so a few busy pixels can fail a line that reads fine. Look at it.
- Overlaps and margins use the laid-out boxes, not the glyphs.
- Title Case is checked with a short list of small words ("in", "of", "and"…) that may stay lowercase.
