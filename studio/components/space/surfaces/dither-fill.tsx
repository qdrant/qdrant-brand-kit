"use client"

import { clamp } from "../rand"
import { SceneCanvas, rgb, type CanvasScene } from "../scene"
import { CardCopy } from "./card-copy"

// Dither fill: the card's fill is an ordered dither (a 4 x 4 Bayer matrix) in the five steps of the violet
// ramp, in 4px cells. It's strongest at the top, lit from above, and settles into the ramp's quiet end
// (the background) before the copy starts. The light leans toward the pointer. It draws once, and again
// when the pointer moves.

const CELL = 4
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const RAMP = ["ramp-0", "ramp-1", "ramp-2", "ramp-3", "ramp-4"] as const
// Where the ramp reaches step 0, as a share of the card's height.
const FLOOR = 0.56

type State = {
  w: number
  h: number
  cols: number
  rows: number
  colors: [number, number, number][]
  buffer: HTMLCanvasElement
  image: ImageData | null
}

const dither: CanvasScene<State> = {
  animate: false,
  setup({ width: w, height: h }, p) {
    const cols = Math.ceil(w / CELL)
    const rows = Math.ceil(h / CELL)
    const buffer = document.createElement("canvas")
    buffer.width = cols
    buffer.height = rows
    const image = buffer.getContext("2d")?.createImageData(cols, rows) ?? null
    return { w, h, cols, rows, colors: RAMP.map((key) => rgb(p[key])), buffer, image }
  },
  draw(ctx, s, _t, pointer) {
    const target = s.buffer.getContext("2d")
    if (!s.image || !target) return
    const light = pointer.inside ? clamp(pointer.x / s.w) : 0.64
    const data = s.image.data
    for (let j = 0; j < s.rows; j++) {
      const fall = clamp(1 - (j + 0.5) / s.rows / FLOOR) ** 1.4
      for (let i = 0; i < s.cols; i++) {
        const x = (i + 0.5) / s.cols
        const lobe = Math.exp(-(((x - light) / 0.34) ** 2))
        const v = clamp(fall * (0.76 + 0.34 * lobe)) * 4
        const step = Math.floor(v)
        const level = Math.min(4, step + (v - step > (BAYER[(j % 4) * 4 + (i % 4)] + 0.5) / 16 ? 1 : 0))
        const [r, g, b] = s.colors[level]
        const k = (j * s.cols + i) * 4
        data[k] = r
        data[k + 1] = g
        data[k + 2] = b
        data[k + 3] = 255
      }
    }
    target.putImageData(s.image, 0, 0)
    ctx.clearRect(0, 0, s.w, s.h)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(s.buffer, 0, 0, s.cols * CELL, s.rows * CELL)
  },
}

export function DitherFill() {
  return (
    <div className="spsurf spsurf-card spsurf-dither">
      <SceneCanvas scene={dither} />
      <div className="spsurf-body">
        <CardCopy />
      </div>
    </div>
  )
}
