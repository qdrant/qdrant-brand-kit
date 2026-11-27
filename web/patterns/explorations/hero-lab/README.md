# Hero Space backgrounds

> **This copy has performance changes (2026-11-27)** that the lab doesn't have yet. Carry them into the lab before
> exporting again, or the export will undo them. Measured on an Apple M4, hero at 1440 × 620, GPU time per frame:
> Vector galaxy 10.9 → 1.8 ms at 2x, Deep field 5.9 → 1.0 ms at 1.5x (Galaxy zoom was already 1.2 ms).
>
> - **Slow fields cached** (`milkyway-glsl.js`, `vector-galaxy.js`, `deep-field-data.js`): the Milky Way's band,
>   clouds and dust, and Deep field's nebula, are drawn at half the CSS resolution into one of two textures every
>   0.5 s, one step ahead, and each frame blends the two. The stars, the star powder, the lens, the waves and the
>   grain stay live at full resolution. `milkyWay()` is split into `milkyWayField()` (slow) and `milkyWayLight()`
>   (fast); `milkyWay()` still does both.
> - **An `if` instead of `?:`** in Vector galaxy's background: GPUs often work out both sides of a `?:`, so the
>   Milky Way cost its full price even at `milkyWay: 0`.
> - **No `powerPreference: "high-performance"`** (`kit.js`): it wakes a laptop's second, power-hungry GPU.
> - **Labels written only when they change** (`vector-kit.js`, the Galaxy zoom and Deep field readouts), not on
>   every frame.
> - **The canvas fades in** (`hero-space.css`) once three.js and the fonts are in, instead of appearing at once.
> - **A light version** (`kit.js`, all three concepts, `vector-kit.js`, `hero-space.css`): a light `background`
>   switches every concept to ink. Where the dark version adds light, the light one takes it away from the
>   background in the same hue, darker (`hsInk()` and `hsSurface()` in the kit's GLSL, with `blend()` subtracting
>   instead of adding), so what glows in the dark is what's darkest in the light: indigo points and stars, a
>   lavender wash for the Milky Way and the nebula. Galaxy zoom's dense core keeps the darkest point
>   (`hsInkOver()`, `blend(material, "min")`) so it stops at indigo instead of going black. The labels get light
>   chips and indigo-600 (`.hs-light`). Same cost as dark.
> - **Vector galaxy reacts only around the planet** (`vector-galaxy.js`, the marketing designer, 2026-11-27): the
>   cursor is the query, leans the planet and sends a click wave only inside an ellipse around the planet and its
>   ring (2.6 × 1.5 radii). Anywhere else the query keeps riding the ring, as when nobody points, and it glides
>   between the two instead of jumping. Neighbours farther than 0.9 radii from the query are never linked, so no
>   line reaches across the hero. The record tag follows the nearest record, with its leader line, only while the
>   cursor is around the planet; otherwise it rests to the right of the planet and never drifts on its own. The
>   "KNN 5 · 4,500 POINTS" badge is gone.

Three animated backgrounds from the Qdrant hero lab, packaged as background layers only. They don't touch your
title, text, buttons or stats. You place them behind your content and set their position, responsive behaviour and
interactions through options.

| Concept | Module | From the lab |
| --- | --- | --- |
| Vector Galaxy | `concepts/vector-galaxy.js` | 21 · a ringed planet of vectors with a kNN cursor, over a subtle Milky Way |
| Galaxy Zoom | `concepts/galaxy-zoom.js` | 22 · a spiral galaxy of points; the cursor is a magnifier that shows values |
| Deep Field, Data | `concepts/deep-field-data.js` | 23 · nebula and stars; the cursor bends space and nearby stars show values |

Plain JavaScript on [three.js](https://threejs.org) (tested with `three@0.160.0`). Nothing else is required.

## Install

Copy the `hero-space` folder into your project, then:

```bash
npm install three@0.160.0
```

## Use

The background needs one empty element that fills your hero, behind the content:

```html
<section class="hero" style="position: relative">
  <div class="hero-bg" style="position: absolute; inset: 0; z-index: 0" aria-hidden="true"></div>
  <div style="position: relative; z-index: 1">…your hero content…</div>
</section>
```

```js
import { mount } from "./hero-space/concepts/deep-field-data.js";

const bg = mount(document.querySelector(".hero-bg"), { /* options */ });
bg.setBoost(1); // intensify, e.g. while your main button is hovered (0..1)
bg.destroy(); // removes everything it added
```

Include `hero-space.css` once. The cursor is tracked on the window, so the layer can sit behind your content and still
react. `demo.html` shows the whole setup; serve the folder over http to open it.

### React / Next.js

```tsx
import { HeroSpaceBackground } from "./hero-space/HeroSpace";

<section className="hero" style={{ position: "relative" }}>
  <HeroSpaceBackground concept="galaxy-zoom" boost={ctaHovered ? 1 : 0} options={{ galaxy: { y: 0.85 } }} />
  <div style={{ position: "relative", zIndex: 1 }}>…</div>
</section>
```

`HeroSpaceBackground` is a client component that renders the empty layer itself (absolute, `inset: 0`, `z-index: 0`).

## Options

All positions are fractions of the background layer's own size: `x` 0 = left, 1 = right; `y` 0 = top, 1 = bottom.

### Position

| Concept | Option | Default | Meaning |
| --- | --- | --- | --- |
| Vector Galaxy | `planet: { x, y, size }` | `{ x: 0.5, y: 0.68, size: 0.17 }` | Planet centre; `size` is its radius as a share of the height. The ring is always kept inside the width. |
| Galaxy Zoom | `galaxy: { x, y, size }` | `{ x: 0.5, y: 0.8, size: 0.55 }` | Galaxy core; `size` is the disc's radius as a share of the width. |
| Deep Field, Data | `nebula: { y, angle }` | `{ y: 0.6, angle: -30 }` | Where the nebula band crosses the centre line, and its tilt in degrees (negative rises to the right). |
| All | `quietZone: { x, y, rx, ry }` | `null` | An ellipse (centre and radii) where the effect dims and the lenses fade, so text placed there stays readable. Set it over your headline. |

### Responsiveness

`breakpoints` is a list of overrides. Each entry has `minWidth` and/or `maxWidth` (the layer's width in px) plus any
settings; every matching entry applies, in order. When the matching set changes, the background restarts with the new
settings. Your entries apply after the built-in ones, so they win.

```js
mount(el, {
  breakpoints: [
    { maxWidth: 699, galaxy: { y: 0.93, size: 1.05 }, lens: 36 }, // phones
    { minWidth: 1600, galaxy: { size: 0.45 } }, // wide screens
  ],
});
```

Built in: Vector Galaxy moves the planet to `y: 0.76, size: 0.1` and Galaxy Zoom moves the galaxy to
`y: 0.93, size: 1.05` with a 36px lens, both below 700px. Beyond breakpoints, everything scales with the layer, the
pixel ratio is capped (1.5 to 2) and Vector Galaxy's ring never overflows the width.

### Interactions

| Option | Default | |
| --- | --- | --- |
| `interactive` | `true` | Follow the cursor while it is over the layer. |
| `idleMotion` | `true` | When nobody is pointing, the cursor effect drifts on its own (this is what phones show). `false` leaves it still. |
| `clicks` | `true` | Clicks inside the layer, on anything but links, buttons and form fields: a search wave (Vector Galaxy), a gravitational wave (Deep Field). |
| `boostOn` | `null` | A selector or element whose hover/focus sets the boost. Or call `setBoost(0..1)` yourself. |
| `labels` | `true` | The small mono readouts: the kNN chip and record tag, the zoom readout, the vector count. The numbers drawn in the scene are separate (below). |
| `pauseButton` | `false` | A discreet pause control in the layer's bottom-right corner. |
| `monoFont` | `"Geist Mono", ui-monospace, …` | Font for numbers and labels. With `next/font`, pass `GeistMono.style.fontFamily`, and load it before the background mounts. |
| `background` | `"#0B0F19"` | The colour the effect is drawn on. Match your hero. |

What the boost does: deeper lens (Deep Field), more zoom (Galaxy Zoom, 3.5× → 5.5×), a search wave across the planet
(Vector Galaxy).

### Concept settings

| Concept | Option | Default | |
| --- | --- | --- | --- |
| Vector Galaxy | `k` | `5` | Neighbours found by the cursor query. |
| | `milkyWay` | `0.25` | Strength of the Milky Way behind the planet; `0` for plain stars. |
| Galaxy Zoom | `zoom` | `3.5` | Magnification. |
| | `lens` | `42` | Lens radius in px. |
| | `numbers` | `0.32` | Share of magnified points shown as values. |
| Deep Field, Data | `numbers` | `true` | Stars near the cursor show values. |
| | `lensRadius` | auto | Lens size in px (auto: 11% of the smaller side, at least 60). |
| | `revealRadius` | auto | How far from the cursor values appear (auto: 16% of the smaller side, at least 110). |

## Built in

- **Reduced motion:** with `prefers-reduced-motion`, one still frame is drawn.
- **Off screen:** rendering stops when the layer leaves the viewport or the tab is hidden.
- **No WebGL:** the layer gets `.hs-static` and a static gradient (styled in `hero-space.css`).
- **Cleanup:** `destroy()` removes every listener, observer and added element, and releases the WebGL context.

## Colours

The palette is fixed in the shaders: `#352B83` (depth), `#6047FF` (main), `#8385FF` (highlights). To change it, edit
`C_DEEP`, `C_MAIN` and `C_HOT` in `kit.js` and in the concept files' point shaders, which repeat them.

## Regenerating

These modules are generated from the lab's sources with `python3 src/export.py`. Edit the lab, then export again
rather than editing these files.
