"use client"

import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "../scene"

// Dither ramps: horizontal bands of stepped gradients, ordered-dithered (4 x 4 Bayer) into the five steps
// of the violet ramp, like halftone swatches. Upper bands reach higher steps (light from above) and lower
// bands use coarser cells; each band is labeled with its cell size, over a scale. Still: it renders once
// per size and theme.

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const CELLS = [2, 2, 3, 3, 4, 4, 6, 8]
const BAND = 32
const GAP = 8
const TOP = 32
const STEPS = 10

type Band = { y: number; cell: number }
type State = {
  w: number
  h: number
  p: Palette
  image: HTMLCanvasElement
  bands: Band[]
  xs: number
  xe: number
}

const scene: CanvasScene<State> = {
  animate: false,
  setup({ width: w, height: h, dpr }, p) {
    const xs = Math.round((w * 0.36) / 8) * 8
    const xe = Math.round((w - 72) / 8) * 8
    const count = Math.min(CELLS.length, Math.floor((h - TOP - 56 + GAP) / (BAND + GAP)))
    const bands = Array.from({ length: count }, (_, b) => ({ y: TOP + b * (BAND + GAP), cell: CELLS[b] }))

    // Drawn once in device pixels, so the cells stay crisp at any pixel ratio.
    const image = document.createElement("canvas")
    image.width = Math.round(w * dpr)
    image.height = Math.round(h * dpr)
    const g = image.getContext("2d")
    if (g) {
      const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
      const x0 = Math.round(xs * dpr)
      const x1 = Math.round(xe * dpr)
      bands.forEach(({ y, cell }, b) => {
        const c = Math.max(1, Math.round(cell * dpr))
        const y0 = Math.round(y * dpr)
        const y1 = Math.round((y + BAND) * dpr)
        const peak = 4 - b * 0.28
        for (let j = 0, cy = y0; cy < y1; j++, cy += c)
          for (let i = 0, cx = x0; cx < x1; i++, cx += c) {
            // The band's level steps up across STEPS swatches; Bayer thresholds pick between two ramp steps.
            const step = Math.min(STEPS - 1, Math.floor(((cx + c / 2 - x0) / (x1 - x0)) * STEPS))
            const v = (step / (STEPS - 1)) * peak
            const base = Math.floor(v)
            const threshold = (BAYER[(j % 4) * 4 + (i % 4)] + 0.5) / 16
            const index = Math.min(4, v - base > threshold ? base + 1 : base)
            if (index > 0) paths[index - 1].rect(cx, cy, Math.min(c, x1 - cx), Math.min(c, y1 - cy))
          }
      })
      const ramp = [p["ramp-1"], p["ramp-2"], p["ramp-3"], p["ramp-4"]]
      paths.forEach((path, k) => {
        g.fillStyle = ramp[k]
        g.fill(path)
      })
    }
    return { w, h, p, image, bands, xs, xe }
  },
  draw(ctx, s) {
    const { p, w, h, bands, xs, xe } = s
    clear(ctx, p, w, h)
    ctx.drawImage(s.image, 0, 0, w, h)

    for (const { y, cell } of bands) label(ctx, p, `${cell} PX`, xe + 12, y + BAND / 2)

    // A scale under the bands: a tick at each swatch, labeled at both ends and the middle.
    const last = bands[bands.length - 1]
    if (!last) return
    const y = last.y + BAND + 8
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i <= STEPS; i++) {
      const x = Math.round(xs + ((xe - xs) * i) / STEPS) + 0.5
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + (i % 5 === 0 ? 7 : 4))
    }
    ctx.stroke()
    label(ctx, p, "0.0", xs, y + 18)
    label(ctx, p, "0.5", (xs + xe) / 2, y + 18, { align: "center" })
    label(ctx, p, "1.0", xe, y + 18, { align: "right" })
  },
}

export function DitherBands() {
  return <SceneCanvas scene={scene} />
}
