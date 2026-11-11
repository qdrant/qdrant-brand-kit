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
| Composition | It breaks a Must rule in [guidelines/](../../guidelines/) section 11: made-up content, mixed or right alignment, more than two text sizes outside the headshot parts, a title off the size-by-length scale, Mona Sans not in Title Case, Mona Sans Condensed not in all caps or used when not asked, Geist Mono on more than two words, everything stacked at the top with empty space below (except with the pattern mask or Qbot, where all text sits at the top and the visual fills the space below), a text block narrower than half the grid, a series or event type shown before the badge exists, a button out of its two places, full width, or taller than the logo beside it. |

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
| Logo | The Qdrant logo is missing, redrawn or recolored, not one of the files in [`brand-assets/logo/`](../../brand-assets/logo/), the wrong version for its background (Dark on plain dark and the masked part of a dark creative, White on patterns at full strength, Light on the light card, a light canvas and the masked part of a light creative), smaller than its shape's size or under 24 px tall, or something sits in its clear space (0.375 × its height). |
| Partner lockup | The two logos aren't the same height, one is stretched, their treatments don't match (one full color, one one-color), the gaps or plus aren't the [component's](../../components/partner-lockup/), or it sits over a busy image. |
| Type | Off the type scale, Bold instead of SemiBold, right-aligned, or with effects on text ([typography/](../typography/)). |
| Qbot | It breaks [guidelines/](../../guidelines/) section 6: Qbot between two text blocks or less than a `section` gap from text, covering text, the logo or the button, a large empty band above it, trimmed by the top or left edge (or by the right edge outside the bottom-right corner), the face cut, the chest logo cut outside the Peek crop, on a story the face or chest logo below the safe-zone line, a side view looking out of the frame, or the glow not as `tool/moods.json` sets it. `review/check.py` doesn't measure these yet: judge them by eye (2026-11-04, in progress). |
| Pattern mask | Text sits on a part of the pattern that isn't masked (above 4%) or isn't calm, the mask isn't `.qd-pattern-mask`, the neutral behind it isn't 950 (dark) or 100 (light), a dark or light gradient is laid over the pattern instead of masking it, or the fade runs the wrong way for the shape ([guidelines/](../../guidelines/) section 4). |
| Icons | An icon isn't Lucide or is redrawn, filled, outlined, stretched, rotated or has effects; its stroke doesn't scale with it; it isn't the same height as the text beside it; it's in a button; or its color isn't a 400 on dark or a 500 on light with 3:1 contrast ([`brand-assets/icons/`](../../brand-assets/icons/)). |
| Images load | A photo, logo or font didn't load. |
