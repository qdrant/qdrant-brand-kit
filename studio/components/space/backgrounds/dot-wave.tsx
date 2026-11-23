"use client"

import { clamp } from "../rand"
import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "../scene"
import { calm, dotBatch } from "./lib"

// Dot wave: rows of dots on a surface of slow sine waves, seen in perspective, the crests lit from above,
// like a field of data rolling. One point is tracked with a ring and its height.

const ROWS = 30
const COLS = 64
const ZN = 1.3 // nearest row
const ZF = 10 // farthest row
const SPAN = 1.3 // half the width of the nearest row, in surface units
const WIDEN = 0.8 // how much farther rows widen, so the back still spans the frame
const TRACK = [44, 9] // the tracked point: column, row

type State = { w: number; h: number; p: Palette; hy: number; vx: number; f: number }

const surface = (x: number, z: number, t: number) =>
  0.16 * Math.sin(x * 1.9 + t * 0.7) +
  0.11 * Math.sin(z * 1.3 - t * 0.55 + x * 0.6) +
  0.05 * Math.sin((x - z) * 3.1 + t * 1.2)

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, hy: h * 0.2, vx: w * 0.62, f: h * 1.05 }
  },
  draw(ctx, s, t) {
    const { p, w, h, hy, vx, f } = s
    clear(ctx, p, w, h)

    // Crests in the bright violet, the rest in the star color.
    const crests = dotBatch(8)
    const rest = dotBatch(8)
    let tracked: readonly [number, number, number] | null = null
    for (let row = 0; row < ROWS; row++) {
      const u = row / (ROWS - 1)
      const z = ZN * (ZF / ZN) ** u
      const span = SPAN * (z / ZN) ** WIDEN
      const depth = 1 - u
      for (let col = 0; col < COLS; col++) {
        const x = (col / (COLS - 1) - 0.62) * 2 * span
        const y = surface(x, z, t)
        const sx = vx + (f * x) / z
        const sy = hy + (f * (1 - y)) / z
        if (col === TRACK[0] && row === TRACK[1]) tracked = [sx, sy, y]
        if (sx < -4 || sx > w + 4 || sy > h + 4) continue
        const crest = clamp((y + 0.3) / 0.6)
        const a = (0.25 + 0.75 * depth) * (0.5 + 0.5 * crest) * calm(sx, w, 0.1)
        const r = clamp((1.9 * ZN) / z ** 0.8, 0.6, 1.9)
        ;(crest > 0.62 ? crests : rest).add(sx, sy, r, a)
      }
    }
    rest.fill(ctx, p.star)
    crests.fill(ctx, p.bright)

    if (!tracked) return
    const [x, y, height] = tracked
    ctx.strokeStyle = p.bright
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.moveTo(x, y - 6)
    ctx.lineTo(x, y - 24)
    ctx.stroke()
    label(ctx, p, `H ${height >= 0 ? "+" : "-"}${Math.abs(height).toFixed(3)}`, x + 6, y - 30)
  },
}

export function DotWave() {
  return <SceneCanvas scene={scene} />
}
