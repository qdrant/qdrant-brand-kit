# Qdrant social post HTML template

> **Draft.** The layouts aren't final yet. Don't build on it until it's approved.

One HTML template for every Qdrant social post. You give it content and a size. It picks the right layout, renders a PNG or JPG at that exact size, and checks the result.

## Set up (once)

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/playwright install chromium   # skip this if Google Chrome is installed
```

The script uses Google Chrome when it's installed, otherwise Playwright's own Chromium.

## Run it

```bash
# every sample at every test size, plus contact sheets and out/index.html
.venv/bin/python render.py --preview

# your own content at the sizes you need
.venv/bin/python render.py --content samples/event.json --size 1080x1080 --size 3000x400

# JPG instead of PNG
.venv/bin/python render.py --content samples/ad.json --size 1200x627 --format jpg
```

Output goes to `out/`. Open `out/index.html` to see every render with its check results. The exit code is 1 if any render fails a check.

You can also open `template/index.html` in a browser to see the built-in sample. Add `?sample=announcement` or `?sample=ad` for the others.

## Content

Everything is optional except `title`. A slot only appears when it has content.

| Field | What it is |
| --- | --- |
| `preset` | `event`, `announcement` or `ad`. Sets the title style. |
| `title` | Main line. Events use condensed caps, announcements use sentence case, ads use the large hero size. Wrap one word or phrase in `*stars*` to show it in Qdrant red. |
| `shortTitle` | Used on ultra-wide banners instead of `title`. Aim for 35 characters, or 25 with 3 speakers. |
| `titleStyle` | Overrides the preset: `caps`, `sentence` or `hero`. |
| `eyebrow` | Line above the title (ads). |
| `body` | Supporting copy under the title. Wrap key terms in `**double stars**` for SemiBold. |
| `series` | Series name, e.g. "Vector Space Talks". |
| `date`, `time`, `location` | Event details, each with its icon. |
| `speakers` | Up to 3: `{ "name", "role", "photo" }`. A photo is best as a cutout on a transparent background. |
| `partnerLogo` | Path or URL to the partner logo (light version). Shown as Qdrant logo + partner logo, per the logo rules. |
| `button` | Button label, e.g. "Learn More". |
| `background` | A color (`#123456`) or an image path/URL. Plain dark when left out. |
| `shape` | Forces a shape instead of choosing it from the size. |

Paths in a content file are relative to that file.

## Shapes

The shape comes from the width divided by the height:

| Shape | Ratio | Reference canvas | Layout |
| --- | --- | --- | --- |
| Ultra-wide | above 3 | 3000×400 | One row: logos, title with body or details, speakers, series and button. When the text doesn't fit the height, the eyebrow is left out (with a warning). |
| Wide 16:9 | 1.4 to 3 | 1920×1080 | Text left, speakers right as photo cards. 2 speakers: second card lower. 3: narrow cards, middle one highest. No speakers: text at most 1056 px wide, the right side free for artwork. |
| Square 1:1 | 0.85 to 1.4 | 1080×1080 | Stacked: header, body, speakers. |
| Portrait 4:5 | 0.65 to 0.85 | 1080×1350 | Stacked, larger type. |
| Story 9:16 | below 0.65 | 1080×1920 | Stacked. 256 px top and 344 px bottom padding keep text clear of the app UI (profile bar, reply box, stickers). Speakers one per row. |

Other rules:
- Type follows the Brand Guide 2.0: SemiBold titles (never Bold), left-aligned text (never right-aligned), no gradients, strokes or shadows on text, gaps on the 8 px grid.
- Wide posts with photo cards and a partner logo put the lockup at the bottom left, as in the VSD partner posts.
- Partnership lockup (Brand Guide 2.0): Qdrant logo + partner logo at the same height, no added colors, with a plus the size of the clear-space cube and one cube of space each side (48 px at an 80 px logo). A warning is printed if the lockup sits over a background image, which the guide rules out when the image is busy.
- In stacked shapes, speakers show as a round photo with name and role beside it. 2 speakers go one per row; 3 go two on the first row and one on the second.
- With a partner logo, the header is full. The series moves above the title and the button moves under the text, as in the partner posts. Ultra-wide keeps them at the end.

Every size (padding, gaps, logo, type, photos, button) is set once per shape in the `[data-shape]` blocks at the top of `template/index.html`, in px at the reference canvas. Spacing is on the 8 px grid. The template scales everything to the requested size, so a 1200×627 post uses the Wide values at 0.58×.

## Automatic checks

| Check | Fails when |
| --- | --- |
| Text fits | Any text is cut off: title over 3 lines (1 on ultra-wide), body over 2, and so on. |
| Letters not clipped | Text ink touches the bottom of its box, which means descenders (g, y, p) are cut off. |
| Contrast | Any text is below 4.5:1 against the worst 5% of the pixels behind it. |
| Logo present | The Qdrant logo didn't load, isn't visible, or is under 24 px tall (Brand Guide minimum web size 90×24) or 3% of the shorter side. |
| Logo clear space | Anything sits within the clear space: one brandmark inner cube (about 0.375 × the logo height) on every side. |
| Inside padding | Anything crosses the padding, including the story safe zones. |
| Balanced margins | The header's right-hand content (series or button) doesn't reach the right padding, so the side margins look different. |
| No overlaps | Two slots overlap. |
| Images load | A photo or logo is missing. |
| Type sizes | At the reference canvas, the heading is under 80 px or the body under 36 px (Brand Guide 2.0, ads). |
| Hierarchy | Body copy is outside 20-40% of the heading size (Brand Guide 2.0). |
| Brand fonts | Mona Sans (and Geist Mono for details) didn't load. |

## To map later

These are placeholders until Juan's design system is connected. They're all CSS variables in `:root` in `template/index.html`, so they can be swapped without touching the layout:
- **Fonts:** `--font-sans` (Mona Sans), `--font-mono` (Geist Mono), `--stretch-condensed` (condensed width for event titles). They load from Google Fonts, so rendering needs internet.
- **Colors:** background, text, muted text, divider, accent, photo gradient.
- **Button:** rebuilt in CSS from the library Button (accent fill, Mona Sans SemiBold). Compare it with the library version when the design system lands.

## Not done yet

- Light theme.
- Running inside Design Lab. Rendering needs a headless browser, so Design Lab needs a render step for this template.
- The org-wide skill filling this from a chat request.

## Files

- `template/index.html`: the template
- `template/assets/logos/`: Qdrant logo SVGs from the qdrant-brand skill
- `render.py`: fill, render, check, contact sheets, gallery
- `samples/`: sample content, the headshots, and a placeholder partner logo
- `requirements.txt`: Python packages for `render.py`
