"use client"

import { rng } from "./rand"
import { SceneCanvas, clear, alpha, type CanvasScene, type Palette } from "./scene"

// Hex parts (Parts Kit): a field of hexagon modules, the shape of the brandmark's parts. Groups of modules
// rise and settle as the field drifts, like parts snapping into place; the pointer lifts the ones under it.

const R = 24
const W = Math.sqrt(3) * R
const LIFT = 10
const CORNERS = [0, 1, 2, 3, 4, 5].map((k) => {
  const a = ((60 * k - 30) * Math.PI) / 180
  return [Math.cos(a) * R, Math.sin(a) * R] as const
})

type Cell = { x: number; y: number; level: number; seed: number }
type State = { w: number; h: number; p: Palette; cells: Cell[]; last: number }

const field = (x: number, y: number, t: number) =>
  Math.sin(x * 0.011 + t * 0.22) * Math.sin(y * 0.017 - t * 0.17) +
  0.6 * Math.sin((x - y) * 0.006 + t * 0.11)

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(5)
    const cells: Cell[] = []
    for (let row = -1; row * 1.5 * R < h + R * 2; row++)
      for (let col = -1; col * W < w + W; col++)
        cells.push({ x: col * W + (row % 2 ? W / 2 : 0), y: row * 1.5 * R, level: 0, seed: rand() })
    return { w, h, p, cells, last: -1 }
  },
  draw(ctx, s, t, pointer) {
    const { p } = s
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    clear(ctx, p, s.w, s.h)

    ctx.lineWidth = 1
    ctx.lineJoin = "round"
    for (const cell of s.cells) {
      const near = pointer.inside && Math.hypot(cell.x - pointer.x, cell.y - pointer.y) < R * 2.6
      // Fewer modules rise toward the left, where a section's copy sits.
      const room = Math.min(1, cell.x / (s.w * 0.55))
      const target = near || field(cell.x, cell.y, t) + cell.seed * 0.3 - (1 - room) * 0.9 > 1.05 ? 1 : 0
      cell.level += (target - cell.level) * Math.min(1, dt * (target ? 5 : 2.5))

      const base = CORNERS.map(([dx, dy]) => [cell.x + dx, cell.y + dy] as const)
      const lift = cell.level * LIFT
      const top = base.map(([x, y]) => [x, y - lift] as const)
      const path = (points: readonly (readonly [number, number])[]) => {
        ctx.beginPath()
        points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.closePath()
      }

      if (cell.level < 0.02) {
        path(base)
        ctx.strokeStyle = p.grid
        ctx.stroke()
        continue
      }
      // The two faces below the lifted top, then the top as glass, lit on its upper edges.
      for (const [a, b, shade] of [
        [1, 2, p.haze],
        [2, 3, p.violet],
      ] as const) {
        path([top[a], top[b], base[b], base[a]])
        ctx.fillStyle = shade
        ctx.fill()
      }
      path(top)
      ctx.fillStyle = alpha(p.surface, 0.92)
      ctx.fill()
      ctx.fillStyle = alpha(p.glow, 0.08 + 0.1 * cell.level)
      ctx.fill()
      ctx.strokeStyle = near ? p.accent : alpha(p.glow, 0.25 + 0.45 * cell.level)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(...top[4])
      ctx.lineTo(...top[5])
      ctx.lineTo(...top[0])
      ctx.strokeStyle = alpha(p.bright, 0.3 + 0.6 * cell.level)
      ctx.stroke()
    }
  },
}

export function HexParts() {
  return <SceneCanvas scene={scene} />
}
