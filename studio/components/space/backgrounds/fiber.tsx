"use client"

import { rng } from "../rand"
import { SceneCanvas, alpha, chip, clear, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, textWidth } from "./lib"

// Fiber bundle: hundreds of hairlines enter from the left, pinch through a narrow throat and fan out into a
// dot grid on the right, like vectors going from ingest to the index. Pulses ride the lines; each one lights
// its grid dot when it arrives, and a readout counts the arrivals.

const GP = 12 // grid pitch
const COLS = 8
const TOP = 48
const PULSES = 18
const TRIP = 7 // seconds for a pulse to cross
const BEFORE = 0.72 // the share of a trip spent before the throat
// The left curve's control points, as shares of the way to the throat: the lines stay spread under the copy
// and pinch late, so the bright part sits at the throat.
const C1 = 0.6
const C2 = 0.88

type Line = { y0: number; gx: number; gy: number; rank: number }
type State = {
  w: number
  h: number
  p: Palette
  lines: Line[]
  xt: number
  cy: number
  gx0: number
  offsets: number[]
  paint: CanvasGradient | null
}

const bez = (a: number, b: number, c: number, d: number, u: number) => {
  const v = 1 - u
  return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d
}

// The line a pulse rides on a given trip.
const lineOf = (k: number, trip: number, n: number) =>
  Math.floor(rng(k * 7919 + trip * 104_729 + 1)() * n)

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(29)
    const rows = Math.floor((h - TOP - 64) / GP) + 1
    // The throat at 62% of the width, clear of the copy; the grid on the right, always past the throat.
    const xt = Math.round(w * 0.62)
    const gx0 = Math.max(xt + 56, w - 40 - (COLS - 1) * GP)
    const n = rows * COLS
    // In order down the left edge, through the throat in the same order, then row by row into the grid.
    const lines: Line[] = Array.from({ length: n }, (_, i) => ({
      y0: -24 + ((h + 48) * (i + 0.2 + rand() * 0.6)) / n,
      gx: gx0 + (i % COLS) * GP,
      gy: TOP + Math.floor(i / COLS) * GP,
      rank: i / (n - 1),
    }))
    return {
      w,
      h,
      p,
      lines,
      xt,
      cy: TOP + ((rows - 1) * GP) / 2,
      gx0,
      offsets: Array.from({ length: PULSES }, () => rand()),
      paint: null,
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, lines, xt, cy, gx0 } = s
    clear(ctx, p, w, h)

    // Faint under the copy and all the way to just before the throat, densest at the throat.
    if (!s.paint) {
      const g = ctx.createLinearGradient(0, 0, w, 0)
      const near = Math.max(0, xt - 40)
      g.addColorStop(0, alpha(p.line, 0))
      g.addColorStop(Math.min(w * 0.36, 240, near) / w, alpha(p.line, 0.03))
      g.addColorStop(near / w, alpha(p.glow, 0.06))
      g.addColorStop(xt / w, alpha(p.glow, 0.32))
      g.addColorStop(gx0 / w, alpha(p.glow, 0.16))
      g.addColorStop(1, alpha(p.glow, 0.16))
      s.paint = g
    }
    const throat = 14 + 4 * Math.sin(t * 0.4)
    const yt = (line: Line) => cy + (line.rank - 0.5) * throat

    // One stroke per line, so they add up where they bunch in the throat.
    ctx.strokeStyle = s.paint
    ctx.lineWidth = 1
    for (const line of lines) {
      const y = yt(line)
      ctx.beginPath()
      ctx.moveTo(-4, line.y0)
      ctx.bezierCurveTo(xt * C1, line.y0, xt * C2, y, xt, y)
      ctx.bezierCurveTo(xt + (line.gx - xt) * 0.4, y, line.gx - (line.gx - xt) * 0.4, line.gy, line.gx, line.gy)
      ctx.stroke()
    }

    // The index grid.
    const grid = new Path2D()
    for (const { gx, gy } of lines) {
      grid.moveTo(gx + 1.4, gy)
      grid.arc(gx, gy, 1.4, 0, TAU)
    }
    ctx.fillStyle = p.dim
    ctx.fill(grid)

    // Pulses: each rides a line per trip and lights its grid dot when it lands. The readout counts landings
    // from 0: a pulse's trip number is how many times it has landed.
    let arrived = 0
    ctx.fillStyle = p.bright
    s.offsets.forEach((offset, k) => {
      const phase = t / TRIP + offset
      const trip = Math.floor(phase)
      const u = phase - trip
      arrived += trip
      const line = lines[lineOf(k, trip, lines.length)]
      const y = yt(line)
      let x: number
      let py: number
      if (u < BEFORE) {
        const v = u / BEFORE
        x = bez(-4, xt * C1, xt * C2, xt, v)
        py = bez(line.y0, line.y0, y, y, v)
      } else {
        const v = (u - BEFORE) / (1 - BEFORE)
        x = bez(xt, xt + (line.gx - xt) * 0.4, line.gx - (line.gx - xt) * 0.4, line.gx, v)
        py = bez(y, y, line.gy, line.gy, v)
      }
      ctx.globalAlpha = calm(x, w, 0.1)
      ctx.beginPath()
      ctx.arc(x, py, 1.6, 0, TAU)
      ctx.fill()

      if (trip < 1) return
      const age = (u * TRIP) / 1.6
      if (age >= 1) return
      const last = lines[lineOf(k, trip - 1, lines.length)]
      ctx.globalAlpha = 1 - age
      ctx.beginPath()
      ctx.arc(last.gx, last.gy, 2.2, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = p.bright
      ctx.beginPath()
      ctx.arc(last.gx, last.gy, 4 + age * 4, 0, TAU)
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    const text = `INDEXED ${arrived.toLocaleString("en-US")}`
    const right = gx0 + (COLS - 1) * GP + 2
    chip(ctx, p, text, right - (Math.ceil(textWidth(ctx, p, text)) + 16), h - 28)
  },
}

export function Fiber() {
  return <SceneCanvas scene={scene} />
}
