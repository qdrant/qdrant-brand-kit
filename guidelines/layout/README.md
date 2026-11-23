# Layout

How to lay out a Qdrant social post, ad or banner at any size. Modelled on [Primer Brand's layout](https://primer.style/brand/layout/), with four pieces: **Canvas**, **Grid**, **Stack** and **Box**.

Covers image canvases only. Web page layout stays in [`spacing/`](../../primitives/spacing/) (`--qd-layout-*`). Print comes later (see [Print](#print)).

| File | What it is |
| --- | --- |
| `layout.tokens.json` | W3C tokens: shapes, margins, safe zones, columns, gap roles, Box styles |
| `layout.css` | The same as `--qd-canvas-*` variables, plus the `.qd-canvas`, `.qd-grid`, `.qd-stack` and `.qd-box` classes |
| `canvas.js` | Optional. Sets the shape and size from the window, for one file rendered at many sizes |
| `checks.md` | What to check before a creative is done |

## Steps for an agent

1. **Read [`guidelines/`](../) and ask its one question** (the main visual). Take the pattern, hero and canvas layout from its rules (section 1, 2026-11-20).
2. **Pick the shape** from width ÷ height (table below). It sets the reference canvas, margins, columns and gaps.
3. **Compose it** from the content you're given, following [`guidelines/`](../) section 11 (Composition) and using only the approved parts in [`brand-components/`](../../brand-components/). There are no fixed post templates.
4. **Build it** with the four pieces below. Load `primitives/colors/colors.css`, `primitives/typography/typography.css` and `guidelines/layout/layout.css`. Colors come from [`colors/`](../../primitives/colors/), type from [`typography/`](../../primitives/typography/), images from [`imagery/`](../../brand-assets/imagery/), backgrounds from [`patterns/`](../../brand-assets/patterns/), the mascot from [`mascot/`](../../brand-assets/mascot/).
5. **Run the checks** in [`checks.md`](checks.md), with [`review/check.py`](../../review/) for the measurable ones. Fix and check again before showing it.

## Shapes

Sizes in px at the reference canvas.

| Shape | Width ÷ height | Reference | Margin (side / top / bottom) | Columns | Gap tight / group / section |
| --- | --- | --- | --- | --- | --- |
| `ultrawide` | above 3 | 3000×400 | 96 / 48 / 48 | 12 × 190, gutter 48 | 16 / 32 / 64 |
| `wide` | 1.4 to 3 | 1920×1080 | 80 / 80 / 80 | 12 × 110, gutter 40 | 24 / 40 / 64 |
| `square` | 0.85 up to 1.4 | 1080×1080 | 64 / 64 / 64 | 6 × 132, gutter 32 | 16 / 24 / 48 |
| `portrait` | 0.65 up to 0.85 | 1080×1350 | 64 / 64 / 64 | 6 × 132, gutter 32 | 16 / 24 / 48 |
| `story` | below 0.65 | 1080×1920 | 64 / 192 / 256 | 4 × 214, gutter 32 | 24 / 32 / 64 |

- **Blog post hero, 916×458:** the size on qdrant.tech (decided by Vanesa on 2026-11-12, replaces 2002×1122). Ratio 2, so it's `wide`, at 0.424× (margin 34, logo 34). Pattern or generated image, decided per post (guidelines section 1). With a partner lockup as the only content, see [`partner-lockup`](../../brand-components/partner-lockup/).
- **LinkedIn profile cover, 1584×396:** ratio 4, so it's `ultrawide`, at 0.528× (decided by Vanesa on 2026-11-11). LinkedIn's profile photo covers the bottom-left, so:
  - The **logo** stays top-left. Keep the **bottom-left** clear: pattern only, no text, no visual.
  - **Dark only.** No light creatives on the cover: the light version was tried and not preferred (Vanesa, 2026-11-11).
  - **Suggest, by team:** pattern-only covers (no visual, serious generative patterns like Burst or Hexagon) for **Sales** and other customer-facing roles; covers with Qbot (more playful) for **DevRel**. A recommendation only: anyone can pick the one they prefer (Vanesa, 2026-11-11).
  - The **heading** goes on the **right**, on the grid, left-aligned and centered top to bottom. Title sizes are the ultrawide ones in [`typography/`](../../primitives/typography/).
  - **No visual:** heading on columns 9 to 12, title-short (128).
  - **With Qbot:** Qbot sits after the heading, never before it ([`guidelines/`](../) section 6), and the title steps down one size (104). Two placements: Qbot full height at the right margin, cut at the waist with the chest logo whole, heading on columns 7 to 9; or a bigger Qbot cut at the upper chest (the Peek crop), heading on columns 6 to 8. Beside Qbot the heading may be narrower than half the grid ([`guidelines/`](../) section 11 rule 8).
  - If the pattern needs a mask, the heading is on the right, so use `.qd-pattern-mask--from-right` (below).
- **Display ads (ultrawide: 3000×400, 728×90, 320×100)** (Vanesa, 2026-11-16):
  - **Side by side:** logo, then title, then button in one row, left to right, with Qbot zoomed in at the right, cut by the bottom edge, face and chest logo whole.
  - Date and place go on **one line** if they fit; if not, they're dropped (ask first, guidelines section 11 rule 11).
  - The button stays at its own size, the logo's height. Never one title line tall.
  - **320×100: the Qdrant logo only**, never a partner lockup (two logos don't fit). Title on up to three lines, sized so its letters match the 24 px logo, the button under it at the logo's height, Qbot zoomed in at the right.
  - Items after the logo can't sit on the 12-column grid in a side-by-side row, so `review/check.py` doesn't check them for the grid there.
- **Small units (300×250, 336×280, 300×600):** offer two options: **a**, logo, title and button with a big Qbot cut by the bottom edge; **b**, the same with the date and place, one line each. Make both and show them together, the recommended one marked; the person picks (2026-11-16, shown together since 2026-11-20). With no date or place, only **a**.
- **Between groups:** 2 × `section` (96 on square and portrait, 128 on wide and story, 128 on ultrawide). The header, heading, body and visual are separate groups, with this one gap between each ([`guidelines/`](../) section 11, rule 9, decided 2026-11-11). No token yet: use `calc(2 * var(--qd-gap-section))`.
- **Story safe zones:** 192 px top and 256 px bottom keep text clear of the profile bar and reply box. Only backgrounds, images and Qbot's cut body go there. Smaller since 2026-11-16 (was 256 / 344) so the groups get bigger gaps: the freed space goes to the gaps between groups. On stories with headshot cards, the cards get smaller before the gaps do: the one exception to the fit order in [`guidelines/`](../) section 11, rule 11 (Vanesa).
- **Other sizes:** the scale is the smaller of width ÷ reference width and height ÷ reference height. Every value is multiplied by it, so a 1200×627 post uses the Wide values at 0.58×. The 8 px grid holds exactly at the reference canvases.
- The column counts were worked out for this folder (whole px, on the 8 px grid). They don't come from Figma or the brand skill yet.

## Canvas

The post itself: size, margins and safe zones. Everything goes inside it.

```html
<div class="qd-canvas" data-shape="square" style="--qd-canvas-width: 1080; --qd-canvas-height: 1080">
  …
</div>
```

Width and height are plain numbers in px. For one file rendered at many sizes, add `<script src="guidelines/layout/canvas.js"></script>` instead. It sets all three from the window, or from `?w=&h=` in the URL when given (what [`review/render.py`](../../review/render.py) uses). The canvas is a column with `section` gaps between its children and the dark background.

## Pattern mask

For patterns whose small details would cross the text, mask the pattern so the text sits on a calm neutral ([`guidelines/`](../) section 4, decided 2026-11-11, replaces the Zone layout). When the pattern's preset has `textMask` set to `mask`, or `both` and the person picked the mask. With `none`, the text sits straight on the pattern. With `both` or no `textMask`, render it with and without the mask and show both, the recommended one marked; the person picks. Never on a light-colored pattern: it turns grey. The pattern is 100% where the visual sits and fades softly to **40%** behind the text (2026-11-16). The canvas shows **neutral 950** behind it on a dark creative and **neutral 100** on a light one.

```html
<div class="qd-canvas qd-canvas--masked" data-shape="square">
  <canvas class="qd-pattern-mask" style="position:absolute; inset:0"></canvas>
  …
</div>
```

- **One strength, 40%** (Vanesa, 2026-11-16). It replaced `--soft-1` (4%) and `--soft-2` (10%), which made creatives too dark. Those two class names still work and now give 40%, so older files don't break; don't use them in new work.
- **Text on the mask:** white text, white icons (`.qd-icon--on-pattern`), and the Dark logo on a dark creative.
- The fade is an eased curve, so there's no visible line between the masked part and the pattern.
- **One smooth gradient on every shape** (decided 2026-11-11). The mask is a single gradient across the whole canvas with a gentle (quadratic) start: the strength's low value on the text side, rising slowly and reaching 100% at 95% of the way across (down on square, portrait and story; to the right on wide; to the left with `--from-right`, e.g. the LinkedIn cover). There's no hold and no step, so nothing needs measuring. The CSS does it.
- **Text on the right** (the LinkedIn profile cover): add `.qd-pattern-mask--from-right`. The fade then runs from the right edge.

## Image background

For a generated image ([`guidelines/`](../) section 5). Put `.qd-canvas--masked` on the canvas and one of these on the `<img>` (Vanesa, 2026-11-16):

| Class | What it does | Where |
| --- | --- | --- |
| `.qd-image-fade` | Full width at the image's own ratio, anchored to the bottom, fading in from the text side with an eased curve (from the top on tall shapes, from the left on wide and ultrawide) | Square, portrait, wide, ultrawide |
| `.qd-image-fade--cover` (with `.qd-image-fade`) | Covers the whole canvas, 30% at the top and 100% from halfway down | Story |

Never trim the image into a patch with soft edges, and never lay a dark block over it. Move the image down (a higher crop) if the text would land on the subject.

## Grid

For placing blocks: text next to an image, a row of speaker cards, a bento grid. Children span every column unless they set `--qd-span` (and `--qd-start` to pick the first column).

```html
<div class="qd-grid">
  <div style="--qd-span: 3">Text</div>
  <div style="--qd-span: 3">Image</div>
</div>
```

- Items of the same kind get the same span. Use different spans only to show what matters most (text 4 + image 2 on a square).
- `.qd-grid--fill` takes the height left in the canvas.
- Spans are per shape. A layout that's 7 + 5 on wide is usually full width and stacked on story.

## Stack

For one row or column of items: icon + text, name + role, a row of logos, date + time + place. Grid is for layout, Stack is for the pieces inside it. Don't build a grid out of stacks.

```html
<div class="qd-stack qd-stack--tight">
  <span class="name">Jane Doe</span>
  <span class="role">Staff Engineer</span>
</div>
```

The gap is a role, never a px value:

| Class | Use it between |
| --- | --- |
| `.qd-stack--tight` | Things that belong together: icon + text, name + role, date + time |
| `.qd-stack--group` (default) | Items in the same block: title + supporting line, a row of speakers |
| `.qd-stack--section` | Separate blocks: header vs speakers, text vs logo lockup |

`.qd-stack--row` makes it a row. `.qd-stack--push` sends it to the bottom of its column or the canvas.

## Box

Padding, fill and border, all from tokens. Pick the style by intent. The design system's web Card (`design-system/components/ui/card.tsx`) isn't used in creatives: its fill is the same dark as the creative background (Vanesa, 2026-11-19).

| Class | What it is | When |
| --- | --- | --- |
| `.qd-box` | Plain: padding only, no fill or border | Default. Most text sits straight on the canvas |
| `.qd-box--card` | Fill one elevation step lighter (`background.raised`) with a thin `border.on-dark` | A stat, a quote, a speaker: something that should read as one unit |
| `.qd-box--outline` | Border only, no fill | Cells of a bento grid. Inside `.qd-grid--joined` they share their lines |
| `.qd-box--light-card` | Light fill (`background.light-surface`), dark text (`text.on-light`, body `text.body-on-light`), divider `border.on-light` | Text over a full-bleed pattern, like the Get-the-Guide ads (Figma 18921:37171). Only on a pattern, never nested |

Rules:
- **One step lighter per level.** A card on the canvas is `raised`. A card inside a card becomes `overlay` on its own. Never more than two levels.
- **Dark by default.** For a light creative, put `data-theme="light"` on the canvas: the background, text and boxes switch to the light theme. On a dark creative, the only light piece is `.qd-box--light-card`, and only on a full-bleed pattern (decided 2026-11-04).
- **Red is never a box fill.** It's for buttons and highlights.
- **Borders only separate things.** They're never decoration.
- Glows, gradients and photos as backgrounds come from brand-assets/ (patterns, imagery), not Box.
- The light card is mostly for guide downloads and documentation promotions, and never holds a big headshot ([`guidelines/`](../) section 4).
- Padding is the shape's `group` gap (the light card: at least the logo's clear space). Corners are `radius.sm` (8 px at the reference canvas). The light card in a creative uses the book layout below instead.

### Light card layout (`.qd-book`)

From the [Get-the-Guide ad](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20958-18153) (card 794.4 × 979.2 in a 1440 frame), approved by Vanesa on 2026-11-04. A vertical card like a guide or a document, on a full-bleed pattern. Every value is a share of the card width **W**, so it scales with the canvas.

| | Value | At 1080 square (W 594) |
| --- | --- | --- |
| Card width | 55% of the canvas on square, 65% on portrait, 75% on story. **Wide:** a landscape card, see below. **Ultrawide:** no light card | 594 |
| Card shape | 0.81 (794.4 : 979.2), about 4:5, vertical | 594 × 737 |
| Position | Card and button centered together inside the margins (the safe area on story), on every shape (2026-11-11) | |
| Padding | 0.0846 W left and right, 0.0967 W top and bottom | 50 / 57 |
| Corners | 0.0242 W | 14 |
| Fill | `background.light-surface`, text `text.on-light` | |
| Logo | Light logo, 0.0967 W tall (smaller than the canvas logo) | 57 |
| Logo to title | 0.0604 W | 36 |
| Title | Mona Sans Display SemiBold, 0.0846 W × 1.6 (2026-11-16: bigger, so the card doesn't look empty; the logo keeps its size), Display 1 line height, letter spacing 0 (Juan's type set, 2026-11-19) | 80 |
| Divider | `border-on-light`, 1 px, between the top block (logo + title) and the bottom block | |
| Divider to text | 0.0846 W | 50 |
| Supporting text | Mona Sans Display Regular, 0.0483 W, H4 line height, letter spacing 0 (Juan's type set, 2026-11-19), at the card's bottom padding | 29 |
| Button | Outside the card, centered below it, 0.0544 W gap. Height 0.157 W; text, padding and corners keep the button's proportions | gap 32, height 93 |

- The top block sits at the top padding and the bottom block at the bottom padding; the space between stays empty.
- **Wide (1920×1080): a landscape card** (decided 2026-11-11). The card is 5:4 and 72% of the canvas height (973 × 778 at 1920×1080), the largest that fits with the button inside the margins. Card and button are centered together. Every value above stays a share of W, where W is the portrait card's width at that height (631), except the title and supporting text, which are **1.5×** (46 px supporting) so the card doesn't look empty. The title is **1.6×** (104 px; 1.5 × 1.3, 2026-11-16).
- **Slides on wide (no button): `.qd-book--slide`** (decided 2026-11-11). The card is centered on its own, both ways, and is **16:10** (1244 × 778 at 1920×1080) so speakers or an info list fit beside each other. The pattern still shows on every side.
- **Info list on the card:** one Lucide icon per line (map-pin = place, calendar = date, clock = time), at the card's text size (the CSS sets it), `neutral-600` (`.qd-icon` on the light card), a `tight` gap. Speakers as `headshot-circle`, beside the list. The event type is never in this list ([`guidelines/`](../) section 11, rule 3).
- **Ultrawide: no light card.** There's no use case for it (decided 2026-11-11).
- The card is centered, so it isn't tied to grid columns. Text inside it aligns to the card's padding.
- Only on **Color-Sliced-Pattern-B**, red or violet, with its letter layer (decided 2026-11-11). Never with a big headshot; use `headshot-circle` if a speaker is needed.

```html
<div class="qd-canvas">
  <!-- full-bleed pattern behind -->
  <div class="qd-book">
    <div class="qd-box--light-card qd-book__card">
      <div class="qd-book__top">
        <img class="qd-logo" src="brand-assets/logo/qdrant-logo-light.svg" alt="Qdrant">
        <p class="qd-book__title">…</p>
      </div>
      <div class="qd-book__bottom"><p class="qd-book__text">…</p></div>
    </div>
    <span class="qd-button qd-book__cta">Get the Guide</span>
  </div>
</div>
```

These styles come from recent Qdrant web sections in Figma (customer stat cards, the cluster bento grid, the hero). Box uses role names only, so it follows the Figma neutrals in [`colors/`](../../primitives/colors/) (since 2026-11-12).

## Print

Not defined yet. Print sizes, bleed and safe area go here once the social side is approved. Until then, use the vendor spec.

## To decide later

- Whether Design Lab gets a `brand-kit/primitives/layout.yaml` (a request for Neil).
- Grid columns and Box line colors, once there's a Figma social grid or Juan's system lands.
