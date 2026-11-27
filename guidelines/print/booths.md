# Booths

How to make booth graphics (back walls, counters, cabinets, headers, banners, hanging signs) from one request, with no Figma or Adobe step, ready for the vendor. Decided by the visual designer on 2026-11-27. Booths are large-format print: everything in [`README.md`](README.md) holds unless this page says otherwise.

**Agents: when the request is for a booth, read only this page, [`booths.tokens.json`](booths.tokens.json) and the files this page links to.** Not the rest of `guidelines/`, social sizes, headshots, imagery or other print formats. Don't ask the main-visual or channel questions.

| File | What it is |
| --- | --- |
| `booths.md` | The booth rules (this page) |
| `booths.tokens.json` | Piece types, sizes for reading distance, logo size, eye level, QR code, dpi, profiles, draft and final settings |
| [`review/print.py`](../../review/print.py) | Builds the drafts and the final PDF, and runs the checks ([`review/README.md`](../../review/README.md#booths)) |

## 1. How a booth request runs

The agent runs only on Claude's cloud servers. Nothing is saved on the requester's computer, and the only file it delivers is the final PDF for each piece (visual designer, 2026-11-27).

1. **One set of questions**, in as few pop-ups as possible:
   - the event;
   - the vendor's spec sheet (attached in chat), or "I don't have it";
   - where it's printed, Europe or US, only if the spec names no color profile (section 7);
   - for each wall: does it stand on the floor or hang, and what covers it (counter, cabinet, TV, furniture);
   - the copy and partner logos. Never invented; "Write it for me" uses the writing-style and messaging skills.
2. **Read the spec:** every piece's size, bleed, safe area, keep-clear zones (TV, cut-outs, seams, hardware), dpi, color profile, file format and deadline. Look at every page: many vendor sheets are flattened drawings. Anything missing or contradictory goes to the requester in one message, with what was found (for example labels that don't match the size list, or notes left from another show).
3. **Three draft previews** of each wall, at `drafts.dpi` (10 dpi, a few seconds each), with the guides drawn on them (section 8). Same copy and content positions; a different look, look variant or colorway (section 3). The requester picks one, so nothing in the final file is a surprise (visual designer, 2026-11-27).
4. **The final render** of the chosen draft only (section 6), then the checks (section 8). Only a file that passes every hard stop is delivered.

## 2. Pieces and layout

Every booth is built from scratch from these rules: there is no master booth design (visual designer, 2026-11-27). Sizes come from the vendor's spec, never from a default. The piece types are in `booths.tokens.json`.

- **Margins:** the print margin, 8% of the short side, never under 1.5 × the safe area ([`README.md`](README.md) section 2).
- **Logo top left,** with the margin as its clear space (visual designer, 2026-11-27).
- **Heading:** the left column, in the eye-level band of a standing wall (section 5). Never under a TV or behind a cabinet.
- **The heading is always the largest and most prominent text on a booth** (visual designer, 2026-11-27). Everything else uses the supporting size, including labels like "Launch Pad" over a TV.
- **Two text sizes,** the heading's and the supporting size ([`AGENTS.md`](../../AGENTS.md) Never). The heading starts at `type.title` and gets smaller only until its longest word fits its column, never below `type.titleMin`.
- **Keep-clear zones:** nothing important where the spec puts a TV, cut-out or seam, or where a counter, cabinet or furniture covers the wall. Nothing important below `eyeLevel.floorClear` from the floor.

## 3. The background: always two layers

Never a flat color (visual designer, 2026-11-27). Both layers are one image in the PDF, painted at the vendor's dpi (section 6).

| Layer | What | What may change per event |
| --- | --- | --- |
| **Base** | [`Motion-Streaks-Pattern-A`](../../brand-assets/patterns/README.md): its colorway holds the gradient and the streaks, so there's no separate gradient layer. Indigo in most cases | Colorway; streak length, density and softness within the preset's ranges. The direction is fixed at 110° |
| **Look** | One approved generative pattern (Rings, Pulse, Hexagon, Burst, Dash), drawn as a layer: **no background at all**, its gradient and the engine's backdrop off, on top of the base | Which pattern, its approved `variant`, or an open `look` within its ranges ([patterns README](../../brand-assets/patterns/README.md)). Never new values outside them |

- **Where the look goes:** the content is placed first. The look fills the space without text, so the wall never looks empty, and fades out around every content block: the logo, heading, supporting text, partner logos and the footer row (`look.clear`, `look.fade`). It never sits behind text.
- **It fills the full height of the piece.** Its rings or burst are centered in the open area, drawn on a canvas wide enough to cover the piece, never moved in a way that leaves a cut edge. Ring fade and softness stay at values that let the pattern run to the edges.
- **Mask:** the contrast score decides ([`guidelines/`](../README.md) section 4). Because the look never sits behind text, no mask is the usual result.
- **Grain** on the whole background image after it's painted, so its gradients don't band in CMYK.
- Picking an approved pattern, variant or colorway is not making a pattern. Anything outside the approved ranges goes through the Pattern Library review first.

## 4. Content layers

Top to bottom on the page; `booths.tokens.json` says which piece types use which.

| Layer | Required | Made of | Where |
| --- | --- | --- | --- |
| Logo | Yes | The repo's White logo SVG, full logo | Top left, at the margin |
| Heading | Yes on walls | The main message, `.qd-title` | Left column, eye level |
| Supporting text | Optional | Short lines, stats, labels, `.qd-supporting` | Under the heading, or by the TV |
| Partner or customer logos | Optional | Official SVGs only, in [`partner-lockup`](../../brand-components/partner-lockup/) or logo tiles | In the open area, with their line of text |
| Footer row | Optional | QR code (replaces the button), handle, one short line | QR code `qr.fromFloor` above the floor |
| Guides | Never printed | Bleed, trim, safe area, keep-clear zones, eye level, floor line | Drafts and checks only |

## 5. Sizes for reading distance

Proposed from common exhibit guidance (1 in of capital height per 10 ft of viewing distance; 1 in per 3 ft for headlines), to confirm by the visual designer.

| What | Minimum (`booths.tokens.json`) |
| --- | --- |
| Heading cap height | `type.titleMin` (about 90 mm) |
| Supporting text cap height | 30 mm (`type.supporting`, 128 pt) |
| Logo | `logo.height`: 20% smaller than the first test's, a share of the wall's height (visual designer, 2026-11-27). Never under the print minimum |
| QR code | `qr.min`, 300 mm, its center between 1.0 and 1.6 m from the floor |

**Eye level** on a standing wall: `eyeLevel.band` (48 to 72 in from the floor). On a hanging piece, the lower third.

## 6. The final file

- **Vector** logo, text and QR code. The text is outlined in the CMYK step, so the vendor needs no fonts.
- **One image:** the background, at the vendor's dpi (`dpi.default` 100 when the spec gives none; never over `dpi.max`).
- **Fast export:** layout and checks at `final.layoutDpi` (20 dpi), only the background at the vendor's dpi (`print.py --dpi 20 --pattern-dpi <vendor dpi>`). A 10 ft wall takes about 2 minutes.
- **Walls over 5.08 m** (the largest PDF page Acrobat opens): at the scale the vendor asks for.
- **Color:** CMYK with the vendor's profile, rich black for large dark areas ([`README.md`](README.md) section 3).

## 7. Color profile

The vendor's spec gives the profile. When it doesn't, decide from where the booth is printed, or the event's city, and ask in one short question only if neither says. Europe: PSO Coated v3. US: GRACoL 2013. The proof says which was used (the same exception as [`stickers.md`](stickers.md)).

## 8. Checks

Hard stops never reach the requester as files. The proof and the pass/fail list use plain words ("Ready for the vendor", "Blocked: the heading sits behind the TV").

- Every spec value used; a default gets a 👀.
- Logo top left at the margin; all content inside the safe area and out of every keep-clear zone and below-floor zone.
- The heading is the largest text; only two text sizes; sizes at or above section 5.
- Contrast, and text on a calm background (the look never behind text).
- The QR code's size and height.
- CMYK only, no RGB; no fonts left; one image, at the vendor's dpi or more at its printed size.
- `check.py`'s social-post checks (grid, title size by length) don't apply to booths.

**Guides on the drafts:** safe area, content margin, each keep-clear zone by name (TV, cabinet...), the eye-level band and the floor line, drawn on the preview only.

## Changing these rules

Ask the visual designer first. Add the date and what changed next to the rule. A new piece type or vendor is an entry in `booths.tokens.json`, not a new rule.
