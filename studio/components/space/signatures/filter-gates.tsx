"use client"

import { rng } from "../rand"
import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, labelRow, prefersStill, readout } from "./lib"

// Filter gates: a batch of 128 points, each with a payload drawn as its shape (kind) and fill, streams
// through two payload filters. Gate 1 keeps kinds circle and diamond; gate 2 keeps filled points. Points
// that match pass on; the rest drop away. The counts under each gate are counted from the points, live.

const N = 128
const EVERY = 0.11
const TRAVEL = 7.5
const HOLD = 1.5
const KEEP = [0, 3] // gate 1: circle and diamond

type Point = { spawn: number; y: number; kind: number; filled: boolean }
type State = { w: number; h: number; p: Palette; cycle: number; points: Point[]; still: boolean }

const LENGTH = 0.3 + (N - 1) * EVERY + TRAVEL + HOLD

function batch(cycle: number): Point[] {
  const rand = rng(830 + cycle)
  return Array.from({ length: N }, (_, j) => ({
    spawn: 0.3 + j * EVERY,
    y: rand(),
    kind: Math.floor(rand() * 4),
    filled: rand() < 0.5,
  }))
}

// The payload glyphs: circle, square, triangle, diamond; filled or open.
function glyph(ctx: CanvasRenderingContext2D, kind: number, x: number, y: number, r: number, filled: boolean) {
  ctx.beginPath()
  if (kind === 0) ctx.arc(x, y, r, 0, TAU)
  else if (kind === 1) ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7)
  else if (kind === 2) {
    ctx.moveTo(x, y - r)
    ctx.lineTo(x + r * 0.95, y + r * 0.7)
    ctx.lineTo(x - r * 0.95, y + r * 0.7)
    ctx.closePath()
  } else {
    ctx.moveTo(x, y - r * 1.1)
    ctx.lineTo(x + r * 1.1, y)
    ctx.lineTo(x, y + r * 1.1)
    ctx.lineTo(x - r * 1.1, y)
    ctx.closePath()
  }
  if (filled) ctx.fill()
  else ctx.stroke()
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, cycle: 0, points: batch(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / LENGTH)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.points = batch(cycle)
    }
    const e = s.still ? 10 : t - cycle * LENGTH

    const top = Math.round(h * 0.3)
    const bottom = Math.round(h * 0.58)
    const gates = [Math.round(w * 0.36), Math.round(w * 0.66)]
    const x0 = -12
    const speed = (w + 40) / TRAVEL
    const cross = gates.map((g) => (g - x0) / speed)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The lane.
    ctx.strokeStyle = p.grid
    ctx.beginPath()
    ctx.moveTo(0, top - 12.5)
    ctx.lineTo(w, top - 12.5)
    ctx.moveTo(0, bottom + 12.5)
    ctx.lineTo(w, bottom + 12.5)
    ctx.stroke()

    // The points, counted as they reach each gate.
    let arrived = 0
    const passed = [0, 0]
    const dropped = [0, 0]
    for (const point of s.points) {
      const age = e - point.spawn
      if (age < 0) continue
      arrived += 1
      const matches = [KEEP.includes(point.kind), point.filled]
      const fails = matches[0] ? (matches[1] ? -1 : 1) : 0
      let x = x0 + speed * age
      let y = top + point.y * (bottom - top)
      let a = 1
      let color = p.dim
      for (let g = 0; g < 2; g++) {
        if (age < cross[g]) break
        if (g === fails) dropped[g] += 1
        else if (fails === -1 || g < fails) passed[g] += 1
      }
      if (fails >= 0 && age >= cross[fails]) {
        // Dropped: it falls away and fades.
        const since = age - cross[fails]
        x = gates[fails] + speed * 0.3 * since
        y += 280 * since * since
        a = 1 - since / 0.9
        if (a <= 0) continue
      } else if (age >= cross[0]) color = age >= cross[1] ? p.bright : p.star
      if (x > w + 12) continue
      ctx.globalAlpha = a
      ctx.fillStyle = color
      ctx.strokeStyle = color
      glyph(ctx, point.kind, x, y, 3.6, point.filled)
      // A tick of light as it passes a gate.
      for (let g = 0; g < 2; g++) {
        const since = age - cross[g]
        if (since < 0 || since > 0.25 || (fails >= 0 && fails <= g)) continue
        ctx.globalAlpha = 1 - since / 0.25
        ctx.strokeStyle = p.bright
        ctx.beginPath()
        ctx.arc(gates[g], y, 7, 0, TAU)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1

    // The gates and their conditions.
    gates.forEach((x, g) => {
      ctx.strokeStyle = p.line
      ctx.beginPath()
      ctx.moveTo(x + 0.5, top - 28)
      ctx.lineTo(x + 0.5, bottom + 28)
      for (const y of [top - 28, bottom + 28]) {
        ctx.moveTo(x - 5, y + 0.5)
        ctx.lineTo(x + 6, y + 0.5)
      }
      ctx.stroke()
      const ly = top - 46
      if (g === 0) {
        label(ctx, p, "G1  KIND IN", x - 64, ly)
        ctx.strokeStyle = p.star
        glyph(ctx, 0, x + 36, ly, 3.6, false)
        glyph(ctx, 3, x + 52, ly, 3.6, false)
      } else {
        label(ctx, p, "G2  FILL = 1", x - 64, ly)
        ctx.fillStyle = p.star
        glyph(ctx, 1, x + 44, ly, 3.6, true)
      }
      labelRow(ctx, p, [["PASS", p.label], [String(passed[g]), p.star]], x + 10, bottom + 48)
      labelRow(ctx, p, [["DROP", p.label], [String(dropped[g]), p.label]], x + 10, bottom + 66)
    })
    labelRow(ctx, p, [["IN", p.label], [`${arrived} / ${N}`, p.star]], 24, bottom + 48)

    // The result: what passed both gates, marked where it leaves.
    const ex = w - 24
    ctx.fillStyle = p.accent
    ctx.fillRect(ex - 2, top - 20, 4, 4)
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.moveTo(ex + 0.5, top - 14)
    ctx.lineTo(ex + 0.5, bottom + 14)
    ctx.stroke()
    const share = arrived ? ((passed[1] / Math.max(1, passed[1] + dropped[0] + dropped[1])) * 100).toFixed(1) : "0.0"
    readout(ctx, p, [`RESULT ${passed[1]}`, [`${share}%`, p.label]], w - 24, h - 28, { align: "right" })
    label(ctx, p, `${N} → ${passed[0]} → ${passed[1]}`, 24, h - 28, { opacity: 0.9 })
  },
}

export function FilterGates() {
  return <SceneCanvas scene={scene} />
}
