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
| Component | The layout isn't an approved post component for that shape ([components/](../../components/)). |

## Box

| Check | Fails when |
| --- | --- |
| Elevation | A card isn't one step lighter than what's behind it, or cards are nested more than two levels. |
| Colors | A box uses red, `overlay`, `popover` or a light-theme color as its fill. |
| Borders | A border is used for decoration and not to separate things. |

## From the other primitives

| Check | Fails when |
| --- | --- |
| Text fits | Any text is cut off, or descenders (g, y, p) are clipped. |
| Contrast | Text is below WCAG AA against what's behind it: 4.5:1 for body text, 3:1 from 24 px ([colors/](../colors/)). |
| Logo | The Qdrant logo is missing, redrawn, under 24 px tall, or something sits in its clear space. Partner lockups follow the logo rules. |
| Type | Off the type scale, Bold instead of SemiBold, right-aligned, or with effects on text ([typography/](../typography/)). |
| Images load | A photo, logo or font didn't load. |
