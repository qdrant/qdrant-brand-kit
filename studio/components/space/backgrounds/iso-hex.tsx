"use client"

import { rng } from "../rand"
import { SceneCanvas, alpha, chip, clear, type CanvasScene, type Palette } from "../scene"
import { approach, calm, calmGradient, hexCorners, hexagon, isLight, textWidth } from "./lib"

// Isometric hex wireframe: a line-only lattice of pointy-top hexagons, each split into three faces, so it
// reads as stacked cubes lit from above. A few parts fill faintly as a slow field passes, mostly on the
// right; one part is selected in the accent with its cube coordinates.

const R = 32
const SX = Math.sqrt(3) * R
const SY = 1.5 * R

type Cube = { x: number; y: number; q: number; r: number; level: number; seed: number }
type State = {
  w: number
  h: number
  p: Palette
  cubes: Cube[]
  pick: number
  faces: [string, string, string]
  last: number
}

const field = (x: number, y: number, t: number) =>
  Math.sin(x * 0.013 + t * 0.2) * Math.sin(y * 0.019 - t * 0.15) + 0.5 * Math.sin((x + y) * 0.007 - t * 0.12)

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(13)
    const cubes: Cube[] = []
    for (let row = -1; row * SY < h + R; row++)
      for (let col = -1; col * SX < w + SX; col++) {
        const odd = row & 1
        cubes.push({
          x: col * SX + (odd ? SX / 2 : 0),
          y: row * SY,
          // Cube coordinates (q, r, s) from the odd-row offset grid.
          q: col - (row - odd) / 2,
          r: row,
          level: 0,
          seed: rand(),
        })
      }
    let pick = 0
    cubes.forEach((c, i) => {
      const best = cubes[pick]
      if (Math.hypot(c.x - w * 0.72, c.y - h * 0.36) < Math.hypot(best.x - w * 0.72, best.y - h * 0.36)) pick = i
    })
    // Top, left and right faces. Light from above: the top is the lightest face in both themes.
    const faces: [string, string, string] = isLight(p)
      ? [p.surface, alpha(p.glow, 0.12), alpha(p.glow, 0.22)]
      : [alpha(p.bright, 0.16), alpha(p.glow, 0.09), alpha(p.glow, 0.04)]
    return { w, h, p, cubes, pick, faces, last: -1 }
  },
  draw(ctx, s, t) {
    const { p, w, h, cubes, faces } = s
    const dt = s.last < 0 ? 0 : Math.max(0, t - s.last)
    s.last = t
    clear(ctx, p, w, h)

    // The lattice: each hexagon's outline and the Y that splits it into three faces.
    const wire = new Path2D()
    for (const { x, y } of cubes) {
      const v = hexCorners(x, y, R)
      hexagon(wire, x, y, R)
      for (const k of [5, 1, 3]) {
        wire.moveTo(x, y)
        wire.lineTo(...v[k])
      }
    }
    ctx.lineWidth = 1
    ctx.strokeStyle = calmGradient(ctx, w, p.line, 0.06, 0.7)
    ctx.stroke(wire)

    // Parts fill as the field passes, fewer toward the copy.
    const shape = (points: (readonly [number, number])[]) => {
      ctx.beginPath()
      points.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }
    cubes.forEach((cube, i) => {
      const on =
        i === s.pick ||
        field(cube.x, cube.y, t) + cube.seed * 0.35 - (1 - calm(cube.x, w, 0)) * 1.4 > 1.05
      cube.level = approach(cube.level, on ? 1 : 0, dt, 2)
      if (cube.level < 0.02) return
      const { x, y } = cube
      const v = hexCorners(x, y, R)
      const c = [x, y] as const
      ctx.globalAlpha = cube.level
      for (const [points, fill] of [
        [[v[0], v[1], c, v[5]], faces[0]],
        [[v[5], c, v[3], v[4]], faces[1]],
        [[c, v[1], v[2], v[3]], faces[2]],
      ] as const) {
        shape([...points])
        ctx.fillStyle = fill
        ctx.fill()
      }
      ctx.strokeStyle = alpha(p.glow, 0.5)
      ctx.beginPath()
      hexagon(ctx, x, y, R)
      for (const k of [5, 1, 3]) {
        ctx.moveTo(x, y)
        ctx.lineTo(...v[k])
      }
      ctx.stroke()
      // The top edges catch the light.
      ctx.strokeStyle = alpha(p.bright, 0.8)
      ctx.beginPath()
      ctx.moveTo(...v[5])
      ctx.lineTo(...v[0])
      ctx.lineTo(...v[1])
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    // The selected part: its outline in the accent, and its cube coordinates.
    const { x, y, q, r } = cubes[s.pick]
    ctx.strokeStyle = p.accent
    ctx.beginPath()
    hexagon(ctx, x, y, R)
    ctx.stroke()
    const text = `Q ${q}  R ${r}  S ${-q - r}`
    const width = Math.ceil(textWidth(ctx, p, text)) + 16
    chip(ctx, p, text, Math.min(x - width / 2, w - 8 - width), y + R + 20)
  },
}

export function IsoHex() {
  return <SceneCanvas scene={scene} />
}
