# Review

Review a creative before it's shown: render it at exact sizes, check it against the repo's rules, and put the results on one contact sheet. For agents and people making creatives, and for testing the repo.

For generated images, also use the image checklist in [`brand-assets/imagery/guidance/review.md`](../brand-assets/imagery/guidance/review.md). A brand taste review (scoring and calibrated likes and dislikes) will be added here later.

**Mechanics only.** These scripts never decide a size, color or layout. Every rule value comes from the repo's own files (`guidelines/layout/layout.tokens.json`, `primitives/typography/typography.tokens.json`, `brand-assets/logo/logo.css`, `primitives/colors/colors.css`). If the repo doesn't give a value, the check says so instead of guessing.

| File | What it does |
| --- | --- |
| `render.py` | Opens a page in headless Chrome at each size, saves `<name>-<shape>.png` (exactly W×H), a `.bg.png` with the text hidden (for contrast), and `<name>-<shape>.json` with the measurements |
| `measure.js` | Added to the page by `render.py`. Records positions, sizes, fonts, colors and files. No rules |
| `check.py` | Runs the checks from [`guidelines/layout/checks.md`](../guidelines/layout/checks.md) and the type, logo, button and headshot rules on the measurements. Writes a table and lists what to look at by eye |
| `sheet.py` | Puts every render in one labelled `contact-sheet.png`: rows are names, columns are shapes. An option of a shape (`<name>-<shape>-b.png`) gets its own column; `--label name="text"` replaces a row's name |

Needs Google Chrome and Python 3 with Pillow (`pip install pillow`). Nothing else is installed.

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

## What the checks can't judge

`check.py` ends with a short list to review by eye: hierarchy and calm, top and bottom spread, crops, text on a calm part of a pattern, the logo version for the background, one hero, no eyebrow or made-up content. Look at every render before showing it.

## Known limits

- Contrast compares the text color with the 5th-percentile pixel behind it, so a few busy pixels can fail a line that reads fine. Look at it.
- Overlaps and margins use the laid-out boxes, not the glyphs.
- Title Case is checked with a short list of small words ("in", "of", "and"…) that may stay lowercase.
