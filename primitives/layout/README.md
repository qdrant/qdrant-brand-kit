# Layout

How to lay out a Qdrant social post, ad or banner at any size. Modelled on [Primer Brand's layout](https://primer.style/brand/layout/), with four pieces: **Canvas**, **Grid**, **Stack** and **Box**.

Covers image canvases only. Web page layout stays in [`spacing/`](../spacing/) (`--qd-layout-*`). Print comes later (see [Print](#print)).

| File | What it is |
| --- | --- |
| `layout.tokens.json` | W3C tokens: shapes, margins, safe zones, columns, gap roles, Box styles |
| `layout.css` | The same as `--qd-canvas-*` variables, plus the `.qd-canvas`, `.qd-grid`, `.qd-stack` and `.qd-box` classes |
| `canvas.js` | Optional. Sets the shape and size from the window, for one file rendered at many sizes |
| `checks.md` | What to check before a creative is done |

## Steps for an agent

1. **Read [`guidelines/`](../../guidelines/) and ask its questions first** (tone, pattern or image, hero, red, other sizes). It decides which pattern, hero and canvas layout to use.
2. **Pick the shape** from width ÷ height (table below). It sets the reference canvas, margins, columns and gaps.
3. **Compose it** from the content you're given, following [`guidelines/`](../../guidelines/) section 11 (Composition) and using only the approved parts in [`components/`](../../components/). There are no fixed post templates.
4. **Build it** with the four pieces below. Load `primitives/colors/colors.css`, `primitives/typography/typography.css` and `primitives/layout/layout.css`. Colors come from [`colors/`](../colors/), type from [`typography/`](../typography/), images from [`imagery/`](../../brand-assets/imagery/), backgrounds from [`patterns/`](../../brand-assets/patterns/), the mascot from [`mascot/`](../../brand-assets/mascot/).
5. **Run the checks** in [`checks.md`](checks.md), with [`review/check.py`](../../review/) for the measurable ones. Fix and check again before showing it.

## Shapes

Sizes in px at the reference canvas.

| Shape | Width ÷ height | Reference | Margin (side / top / bottom) | Columns | Gap tight / group / section |
| --- | --- | --- | --- | --- | --- |
| `ultrawide` | above 3 | 3000×400 | 96 / 48 / 48 | 12 × 190, gutter 48 | 16 / 32 / 64 |
| `wide` | 1.4 to 3 | 1920×1080 | 80 / 80 / 80 | 12 × 110, gutter 40 | 24 / 40 / 64 |
| `square` | 0.85 up to 1.4 | 1080×1080 | 64 / 64 / 64 | 6 × 132, gutter 32 | 16 / 24 / 48 |
| `portrait` | 0.65 up to 0.85 | 1080×1350 | 64 / 64 / 64 | 6 × 132, gutter 32 | 16 / 24 / 48 |
| `story` | below 0.65 | 1080×1920 | 64 / 256 / 344 | 4 × 214, gutter 32 | 24 / 32 / 64 |

- **Blog post hero, 2002×1122:** ratio 1.78, so it's `wide`, at 1.04× (margin 83, logo 83). Pattern or generated image, decided per post (guidelines section 1). With a partner lockup as the only content, see [`partner-lockup`](../../components/partner-lockup/).
- **LinkedIn profile cover, 1584×396:** ratio 4, so it's `ultrawide`, at 0.528× (decided by Vanesa on 2026-11-11). LinkedIn's profile photo covers the bottom-left, so:
  - The **logo** stays top-left. Keep the **bottom-left** clear: pattern only, no text, no visual.
  - The **heading** goes on the **right**, on the grid, left-aligned and centered top to bottom. Title sizes are the ultrawide ones in [`typography/`](../typography/).
  - **No visual:** heading on columns 9 to 12, title-short (128).
  - **With Qbot:** Qbot sits after the heading, never before it ([`guidelines/`](../../guidelines/) section 6), and the title steps down one size (104). Two placements: Qbot full height at the right margin, cut at the waist with the chest logo whole, heading on columns 7 to 9; or a bigger Qbot cut at the upper chest (the Peek crop), heading on columns 6 to 8. Beside Qbot the heading may be narrower than half the grid ([`guidelines/`](../../guidelines/) section 11 rule 8).
  - If the pattern needs a mask, the heading is on the right, so use `.qd-pattern-mask--from-right` (below).
- **Story safe zones:** 256 px top and 344 px bottom keep text clear of the profile bar, reply box and stickers. Only backgrounds and images go there.
- **Other sizes:** the scale is the smaller of width ÷ reference width and height ÷ reference height. Every value is multiplied by it, so a 1200×627 post uses the Wide values at 0.58×. The 8 px grid holds exactly at the reference canvases.
- The column counts were worked out for this folder (whole px, on the 8 px grid). They don't come from Figma or the brand skill yet.

## Canvas

The post itself: size, margins and safe zones. Everything goes inside it.

```html
<div class="qd-canvas" data-shape="square" style="--qd-canvas-width: 1080; --qd-canvas-height: 1080">
  …
</div>
```

Width and height are plain numbers in px. For one file rendered at many sizes, add `<script src="primitives/layout/canvas.js"></script>` instead. It sets all three from the window, or from `?w=&h=` in the URL when given (what [`review/render.py`](../../review/render.py) uses). The canvas is a column with `section` gaps between its children and the dark background.

## Pattern mask

For patterns whose small details would cross the text, mask the pattern so the text sits on a calm neutral ([`guidelines/`](../../guidelines/) section 4, decided 2026-11-11, replaces the Zone layout). Only when the pattern's preset has `textMask` set to `soft-1` or `soft-2`; with `none`, the text sits straight on the pattern. The pattern is 100% where the visual sits and fades softly behind the text. The canvas shows **neutral 950** behind it on a dark creative and **neutral 100** on a light one.

```html
<div class="qd-canvas qd-canvas--masked" data-shape="square">
  <canvas class="qd-pattern-mask qd-pattern-mask--soft-2" style="position:absolute; inset:0; --qd-mask-edge: 400px"></canvas>
  …
</div>
```

- `--qd-mask-edge`: the text block's far edge in px, measured after the fonts load. Its bottom (from the canvas top) on square, portrait and story; its right edge (from the canvas left) on wide and ultra-wide, where the fade runs left to right.
- The strength class sets the rest:

  | Class | Behind the text | Fade starts | Pattern back to 100% |
  | --- | --- | --- | --- |
  | `--soft-1` | 4% | 0.5 × the edge | the edge + 4 `section` gaps |
  | `--soft-2` | 10% | 0.3 × the edge | the edge + 6 `section` gaps |

- The fade is an eased curve, so there's no visible line between the masked part and the pattern.
- **Text on the right** (the LinkedIn profile cover): add `.qd-pattern-mask--from-right`. The fade then runs from the right edge, and `--qd-mask-edge` is the text block's left edge measured from the canvas's right edge.

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

Padding, fill and border, all from tokens. Pick the style by intent:

| Class | What it is | When |
| --- | --- | --- |
| `.qd-box` | Plain: padding only, no fill or border | Default. Most text sits straight on the canvas |
| `.qd-box--card` | Fill one elevation step lighter (`background.surface`) with a thin `border.on-dark` | A stat, a quote, a speaker: something that should read as one unit |
| `.qd-box--outline` | Border only, no fill | Cells of a bento grid. Inside `.qd-grid--joined` they share their lines |
| `.qd-box--light-card` | Light fill (`background.light-surface`), dark text (`text.on-light`, body `text.body-on-light`), divider `border.on-light` | Text over a full-bleed pattern, like the Get-the-Guide ads (Figma 18921:37171). Only on a pattern, never nested |

Rules:
- **One step lighter per level.** A card on the canvas is `surface`. A card inside a card becomes `surface-raised` on its own. Never more than two levels.
- **Dark by default.** For a light creative, put `data-theme="light"` on the canvas: the background, text and boxes switch to the light theme. On a dark creative, the only light piece is `.qd-box--light-card`, and only on a full-bleed pattern (decided 2026-11-04).
- **Red is never a box fill.** It's for buttons and highlights.
- **Borders only separate things.** They're never decoration.
- Glows, gradients and photos as backgrounds come from brand-assets/ (patterns, imagery), not Box.
- The light card is mostly for guide downloads and documentation promotions, and never holds a big headshot ([`guidelines/`](../../guidelines/) section 4).
- Padding is the shape's `group` gap. Corners are `radius.md` (8 px at the reference canvas). The light card in a creative uses the book layout below instead.

### Light card layout (`.qd-book`)

From the [Get-the-Guide ad](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20958-18153) (card 794.4 × 979.2 in a 1440 frame), approved by Vanesa on 2026-11-04. A vertical card like a guide or a document, on a full-bleed pattern. Every value is a share of the card width **W**, so it scales with the canvas.

| | Value | At 1080 square (W 594) |
| --- | --- | --- |
| Card width | 55% of the canvas on square, 65% on portrait, 75% on story. **Wide:** a landscape card, see below. **Ultrawide:** no light card | 594 |
| Card shape | 0.81 (794.4 : 979.2), about 4:5, vertical | 594 × 737 |
| Position | Centered on the canvas. Story: card and button centered together inside the safe area | |
| Padding | 0.0846 W left and right, 0.0967 W top and bottom | 50 / 57 |
| Corners | 0.0242 W | 14 |
| Fill | `background.light-surface`, text `text.on-light` | |
| Logo | Light logo, 0.0967 W tall (smaller than the canvas logo) | 57 |
| Logo to title | 0.0604 W | 36 |
| Title | Mona Sans SemiBold, 0.0846 W, line height 1.1 | 50 |
| Divider | `border-on-light`, 1 px, between the top block (logo + title) and the bottom block | |
| Divider to text | 0.0846 W | 50 |
| Supporting text | Mona Sans Regular, 0.0483 W, line height 1.3, at the card's bottom padding | 29 |
| Button | Outside the card, centered below it, 0.0544 W gap. Height 0.157 W; text, padding and corners keep the button's proportions | gap 32, height 93 |

- The top block sits at the top padding and the bottom block at the bottom padding; the space between stays empty.
- **Wide (1920×1080): a landscape card** (decided 2026-11-11). The card is 5:4 and 72% of the canvas height (973 × 778 at 1920×1080), the largest that fits with the button inside the margins. Card and button are centered together. Every value above stays a share of W, where W is the portrait card's width at that height (631), except the title and supporting text, which are **1.5×** (80 and 46 px) so the card doesn't look empty.
- **Ultrawide: no light card.** There's no use case for it (decided 2026-11-11).
- The card is centered, so it isn't tied to grid columns. Text inside it aligns to the card's padding.
- Only on a full-bleed pattern. Never with a big headshot; use `headshot-circle` if a speaker is needed.

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

These styles come from recent Qdrant web sections in Figma (customer stat cards, the cluster bento grid, the hero). Those frames use a newer neutral scale (`Neutral/N10` `#090E1A`, `N20` `#161E33`) than colors/. Box uses token names only, so the values can be swapped when Juan's design system lands.

## Print

Not defined yet. Print sizes, bleed and safe area go here once the social side is approved. Until then, use the vendor spec.

## To decide later

- Whether Design Lab gets a `brand-kit/primitives/layout.yaml` (a request for Neil).
- Grid columns and Box line colors, once there's a Figma social grid or Juan's system lands.
