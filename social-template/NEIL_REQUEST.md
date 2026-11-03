# Request for Neil: social post template in Design Lab (MKT-479)

From Vanesa, Nov 3, 2026. Review renders: https://claude.ai/artifact/RMwHqVQByKY4GSYayG8E82 (private, ask Vanesa for access).

## What exists

One HTML template that makes any Qdrant social post at any size, plus a small render script that exports it and checks the result. It's the "Social creatives" family from the architecture doc.

- **Template:** one file, `template/index.html` (52 KB with the two logo SVGs). It contains HTML, CSS and JavaScript. You give it content as JSON and open it at the target size. It picks the layout from the aspect ratio:
  - Ultra-wide: above 3:1
  - Wide 16:9: 1.4 to 3
  - Square 1:1: 0.85 to 1.4
  - Portrait 4:5: 0.65 to 0.85
  - Story 9:16: below 0.65

  It then fills the slots and scales everything to the exact size.
- **Render script:** `render.py` (Python, Playwright and Pillow).
  1. Opens the template in headless Chrome at 2x.
  2. Injects the content as `window.__CONTENT__`.
  3. Waits for `window.__READY__`.
  4. Takes a screenshot and downsamples it to the exact size (PNG or JPG).
  5. Runs the checks.

  It takes about 2 seconds per size.
- **Checks:** 11 automatic checks, run on the template's layout report (`window.__REPORT__`) and on the pixels:
  - text fits (nothing cut off)
  - contrast at least 4.5:1
  - logo present and at least 24 px tall
  - logo clear space
  - inside padding, including story safe zones
  - balanced margins
  - no overlaps
  - images load
  - brand fonts loaded
  - type sizes (Brand Guide 2.0 minimums)
  - hierarchy (body 20–40% of the heading)

  All 30 test renders (5 samples × 6 sizes) pass.
- **Rules it follows:** Brand Guide 2.0 (logo, partnership lockup, type sizes, hierarchy, emphasis) and the spacing and layouts from our past posts.
- **Files:** currently on Vanesa's laptop in `~/Desktop/Tools/social-template`. Vanesa will share them however suits you (repo, zip or Drive). See `README.md` there for every field and rule.

## How it fits Design Lab

Today `generate_image` makes images. This adds a second engine for posts with text: no image model, just rendering. The flow:

1. A person asks Claude for a post ("speaker announcement for LinkedIn and a story").
2. The skill (or the person) fills the content JSON.
3. Design Lab renders the template at each requested size and runs the checks.
4. Design Lab saves the renders to the Library and returns image links plus check results to Claude.
5. If a check fails, Claude explains why (title too long, low contrast) and offers a fix. For example, a short title for banners.

Artwork from `generate_image` can go into the background slot later. For now the background is a plain dark placeholder.

## What we need from you

1. **One new connector tool**, for example `render_social_post`. This is the one connector change; after it, template updates don't touch the connector.
   - Input: `content` (JSON, fields below), `sizes` (a list of "WxH"), optional `format` ("png" or "jpg").
   - Output, per size: image URL, Library ID, shape, pass or fail, the list of failed checks with reasons, and warnings.
2. **A render step that runs a headless browser.** Options:
   - a serverless Chromium on Vercel, such as `@sparticuz/chromium` with Playwright or Puppeteer (needs about 1–2 GB of memory)
   - a small separate render service, such as a container on Cloud Run or Fly running the existing `render.py` as is

   The second is the least work and keeps the checks identical. The template loads Mona Sans and Geist Mono from Google Fonts, so the renderer needs internet, or we bundle the font files.
3. **Hosting for the template files** (`index.html` and two logo SVGs), with a version number, so Vanesa can publish a new template version without an app or connector change. Same Draft → Test → Publish idea as recipes.
4. **Asset handling:** speaker photos (cutouts, transparent PNG preferred), partner logos (light version) and background images. These come in as URLs (Library or upload) and are passed into the content JSON.
5. **Library:** save each render with its content JSON, size, shape and check results. "Design-approved" could mean all checks passed, until the taste review exists.

## Content fields (the JSON the tool takes)

Only `title` is required.
- `preset`: event, announcement or ad. Sets the title style.
- `title`: `*word*` shows in Qdrant red.
- `shortTitle`: used on ultra-wide banners instead of the title.
- `eyebrow`
- `body`: `**term**` is SemiBold.
- `series`
- `date`, `time`, `location`
- `speakers`: up to 3, each `{name, role, photo}`.
- `partnerLogo`
- `button`
- `background`: a color or an image URL.
- `shape`: forces a layout instead of choosing it from the size.

Example (`samples/event.json`):

```json
{
  "preset": "event",
  "series": "Vector Space Talks",
  "title": "On-device AI RAG using *Qdrant Edge*",
  "shortTitle": "Qdrant Edge RAG",
  "date": "September 26", "time": "5:00 PM CET", "location": "Berlin",
  "speakers": [{ "name": "Neil Kanungo", "role": "Head of Developer Relations, Qdrant", "photo": "speaker.png" }]
}
```

## How we'd test it together

1. You render the 5 sample contents at the 6 test sizes (1080×1080, 1080×1350, 1080×1920, 1920×1080, 1200×627, 3000×400) through your endpoint.
2. We compare them with Vanesa's local renders. They should match, and all checks should pass.
3. We try failure cases: a 120-character title, a light background, a broken photo URL. Each should fail with a clear reason.
4. End to end: ask Claude for a post in a normal chat and get the images back with their check results.

## Questions for you

- Where should the render step run: on Vercel, or as a separate service?
- Do renders count against the monthly cap? They cost compute only, no model spend.
- How should a new template version be published and tested?
- Do you want the checks ported to TypeScript, or kept in Python behind the render service?

## Not done yet

- Light theme.
- Brand tokens from Juan's design system: fonts and colors are placeholders in one block of the template.
- Comparing the CSS button against the library Button.
- The org-wide skill that fills the content from a chat request.
