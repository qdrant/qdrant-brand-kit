"use client"

import { clamp } from "../rand"
import { SceneCanvas, alpha, chip, clear, type CanvasScene, type Palette } from "../scene"
import { approach, hexagon, textWidth } from "./lib"

// Hex halftone: a grid of pointy-top hexagons that shrink with distance from a focal hex, the query, in the
// accent. A ripple runs out from it. The focal point follows the pointer and drifts home when it leaves.

const R = 14
const SX = Math.sqrt(3) * R
const SY = 1.5 * R
const FILL = 0.86 // the largest hexagon, as a share of its cell, so a gap shows between them

type Cell = { x: number; y: number; q: number; r: number }
type State = {
  w: number
  h: number
  p: Palette
  cells: Cell[]
  fx: number
  fy: number
  reach: number
  last: number
}

const home = (w: number, h: number, t: number) =>
  [w * 0.74 + 24 * Math.sin(t * 0.13), h * 0.42 + 16 * Math.sin(t * 0.17)] as const

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const cells: Cell[] = []
    for (let row = -1; row * SY < h + R; row++)
      for (let col = -1; col * SX < w + SX; col++) {
        const odd = row & 1
        cells.push({ x: col * SX + (odd ? SX / 2 : 0), y: row * SY, q: col - (row - odd) / 2, r: row })
      }
    const [fx, fy] = home(w, h, 0)
    return { w, h, p, cells, fx, fy, reach: Math.min(Math.max(w * 0.5, 300), 520), last: -1 }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h, cells, reach } = s
    const dt = s.last < 0 ? 0 : Math.max(0, t - s.last)
    s.last = t
    const [hx, hy] = home(w, h, t)
    s.fx = approach(s.fx, pointer.inside ? pointer.x : hx, dt, 5)
    s.fy = approach(s.fy, pointer.inside ? pointer.y : hy, dt, 5)
    const { fx, fy } = s
    clear(ctx, p, w, h)

    let focal = cells[0]
    let nearest = Infinity
    for (const cell of cells) {
      const d = Math.hypot(cell.x - fx, cell.y - fy)
      if (d < nearest) {
        nearest = d
        focal = cell
      }
    }

    // Three tones by size: the nearest hexagons are the brightest.
    const tones = [new Path2D(), new Path2D(), new Path2D()]
    for (const cell of cells) {
      if (cell === focal) continue
      const d = Math.hypot(cell.x - fx, cell.y - fy)
      const u = clamp(1 - d / reach)
      if (u <= 0) continue
      const ripple = 1 + 0.12 * Math.sin(d * 0.045 - t * 1.4) * u
      const size = R * FILL * u ** 1.3 * ripple
      if (size < 0.7) continue
      hexagon(tones[u > 0.72 ? 0 : u > 0.45 ? 1 : 2], cell.x, cell.y, Math.min(size, R * FILL))
    }
    ctx.fillStyle = p.bright
    ctx.fill(tones[0])
    ctx.fillStyle = p.glow
    ctx.fill(tones[1])
    ctx.fillStyle = alpha(p.glow, 0.5)
    ctx.fill(tones[2])

    ctx.fillStyle = p.accent
    ctx.beginPath()
    hexagon(ctx, focal.x, focal.y, R * FILL)
    ctx.fill()

    // The focal hex's coordinates, beside it.
    const text = `Q ${focal.q}  R ${focal.r}`
    const width = Math.ceil(textWidth(ctx, p, text)) + 16
    const right = focal.x + R + 8 + width < w - 8
    chip(ctx, p, text, right ? focal.x + R + 8 : focal.x - R - 8 - width, focal.y)
  },
}

export function HexHalftone() {
  return <SceneCanvas scene={scene} />
}
