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

1. **Pick the shape** from width ÷ height (table below). It sets the reference canvas, margins, columns and gaps.
2. **Pick an approved post component** from [`components/`](../../components/) for that shape. Don't invent a layout. If none fits, say so and ask.
3. **Build it** with the four pieces below. Load `primitives/colors/colors.css`, `primitives/typography/typography.css` and `primitives/layout/layout.css`. Colors come from [`colors/`](../colors/), type from [`typography/`](../typography/), images from [`imagery/`](../../brand-assets/imagery/), backgrounds from [`patterns/`](../../brand-assets/patterns/), the mascot from [`mascot/`](../../brand-assets/mascot/).
4. **Run the checks** in [`checks.md`](checks.md). Fix and check again before showing it.

## Shapes

Sizes in px at the reference canvas.

| Shape | Width ÷ height | Reference | Margin (side / top / bottom) | Columns | Gap tight / group / section |
| --- | --- | --- | --- | --- | --- |
| `ultrawide` | above 3 | 3000×400 | 96 / 48 / 48 | 12 × 190, gutter 48 | 16 / 32 / 64 |
| `wide` | 1.4 to 3 | 1920×1080 | 80 / 80 / 80 | 12 × 110, gutter 40 | 24 / 40 / 64 |
| `square` | 0.85 up to 1.4 | 1080×1080 | 64 / 64 / 64 | 6 × 132, gutter 32 | 16 / 24 / 48 |
| `portrait` | 0.65 up to 0.85 | 1080×1350 | 64 / 64 / 64 | 6 × 132, gutter 32 | 16 / 24 / 48 |
| `story` | below 0.65 | 1080×1920 | 64 / 256 / 344 | 4 × 214, gutter 32 | 24 / 32 / 64 |

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

Width and height are plain numbers in px. For one file rendered at many sizes, add `<script src="primitives/layout/canvas.js"></script>` instead. It sets all three from the window. The canvas is a column with `section` gaps between its children and the dark background.

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
| `.qd-stack--group` (default) | Items in the same block: eyebrow + title + body, a row of speakers |
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
- **Dark theme, with one exception.** The colors/ rule keeps light for print, documents and light-mode UIs. The only light piece in a creative is `.qd-box--light-card`, and only on a full-bleed pattern (decided 2026-11-04).
- **Red is never a box fill.** It's for buttons and highlights.
- **Borders only separate things.** They're never decoration.
- Glows, gradients and photos as backgrounds come from brand-assets/ (patterns, imagery), not Box.
- Padding is the shape's `group` gap. Corners are `radius.md` (8 px at the reference canvas).

These styles come from recent Qdrant web sections in Figma (customer stat cards, the cluster bento grid, the hero). Those frames use a newer neutral scale (`Neutral/N10` `#090E1A`, `N20` `#161E33`) than colors/. Box uses token names only, so the values can be swapped when Juan's design system lands.

## Print

Not defined yet. Print sizes, bleed and safe area go here once the social side is approved. Until then, use the vendor spec.

## To decide later

- Components: which post layouts each shape offers (in [`components/`](../../components/)).
- Whether Design Lab gets a `brand-kit/primitives/layout.yaml` (a request for Neil).
- Grid columns and Box line colors, once there's a Figma social grid or Juan's system lands.
