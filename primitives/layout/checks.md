# Layout checks

Run these on every creative before it's shown. Render it at the exact size and look at the result. Don't judge it from the code. Fix what fails and check again.

## Layout

| Check | Fails when |
| --- | --- |
| Right shape | The `data-shape` doesn't match width ÷ height (see the shapes table in the README). |
| Inside margins | Any text, logo or button crosses the margins, including the story safe zones (256 px top, 344 px bottom). Backgrounds and images may bleed to the edge. |
| On the grid | A block's left or right edge isn't on a column line. Blocks of the same kind have different spans. |
| Gap roles | A gap isn't one of the shape's tight, group or section values, or the role doesn't match (e.g. `section` between name and role). |
| Balanced margins | Content looks heavier on one side: the right-hand item doesn't reach the right margin while the left one sits on the left margin. |
| No overlaps | Two slots overlap, unless one is a background or image meant to sit behind. |
| Parts | A piece isn't one of the approved parts in [components/](../../components/), or a part is redrawn or changed. |
| Composition | It breaks a Must rule in [guidelines/](../../guidelines/) section 11: made-up content, mixed or right alignment, more than two text sizes outside the headshot parts, a title off the size-by-length scale, Mona Sans not in Title Case, Mona Sans Condensed not in all caps or used when not asked, Geist Mono on more than two words, everything stacked at the top with empty space below (except the Zone layout, where all text stays in the plain zone), text or the button on the pattern zone of a Zone layout, a text block narrower than half the grid, a series or event type shown before the badge exists, a button out of its two places, full width, or taller than the logo beside it. |

## Box

| Check | Fails when |
| --- | --- |
| Elevation | A card isn't one step lighter than what's behind it, or cards are nested more than two levels. |
| Colors | A box uses red, `overlay` or `popover` as its fill, or a light fill on a dark creative. Exception: `.qd-box--light-card` on a full-bleed pattern, the only light piece allowed ([guidelines/](../../guidelines/) section 4). It fails if it's on anything else, nested, or there's more than one. |
| Borders | A border is used for decoration and not to separate things. |

## From the other primitives

| Check | Fails when |
| --- | --- |
| Text fits | Any text is cut off, or descenders (g, y, p) are clipped. |
| Contrast | Text is below WCAG AA against what's behind it: 4.5:1 for body text, 3:1 from 24 px ([colors/](../colors/)). Speaker roles on a pattern need `qd-on-pattern`. |
| Logo | The Qdrant logo is missing, redrawn or recolored, not one of the files in [`brand-assets/logo/`](../../brand-assets/logo/), the wrong version for its background (Dark on plain dark, White on patterns, Light on the light card and on a light canvas), smaller than its shape's size or under 24 px tall, or something sits in its clear space (0.375 × its height). |
| Partner lockup | The two logos aren't the same height, one is stretched, their treatments don't match (one full color, one one-color), the gaps or plus aren't the [component's](../../components/partner-lockup/), or it sits over a busy image. |
| Type | Off the type scale, Bold instead of SemiBold, right-aligned, or with effects on text ([typography/](../typography/)). |
| Images load | A photo, logo or font didn't load. |
