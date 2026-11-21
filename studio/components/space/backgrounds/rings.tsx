"use client"

import { rng, spread } from "../rand"
import { SceneCanvas, chip, clear, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, crosshair, dotBatch, textWidth } from "./lib"

// Range rings: dotted circles around a few centers, each a range query, overlapping and breathing slowly.
// Points inside a range light up, and each query's badge reads its radius and counts its hits. One query
// is in the accent.

// Each center (a share of the frame), its rings in pixels, and where its badge sits on the outer ring.
const CENTERS = [
  { fx: 0.66, fy: 0.3, radii: [44, 84], badge: -40 },
  { fx: 0.86, fy: 0.62, radii: [40, 80, 116], badge: -60 },
  { fx: 0.64, fy: 0.8, radii: [30, 58], badge: 60 },
]
const ACCENT = 1
const UNIT = 400 // pixels per unit of distance, for the radius readout

type Center = { x: number; y: number; radii: number[]; badge: number }
type State = { w: number; h: number; p: Palette; centers: Center[]; points: { x: number; y: number }[] }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(33)
    return {
      w,
      h,
      p,
      centers: CENTERS.map(({ fx, fy, radii, badge }) => ({ x: fx * w, y: fy * h, radii, badge })),
      points: spread(Math.round((w * h) / 1100), w, h, rand, 6),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    clear(ctx, p, w, h)
    const scales = s.centers.map((_, k) => 1 + 0.06 * Math.sin(t * 0.35 + k * 2))

    // Points: lit inside a range, brightest inside the accent query's.
    const counts = s.centers.map(() => 0)
    const out = dotBatch(6)
    const lit = dotBatch(6)
    const main = dotBatch(6)
    for (const { x, y } of s.points) {
      let inside = -1
      s.centers.forEach((c, k) => {
        if (Math.hypot(x - c.x, y - c.y) <= c.radii[c.radii.length - 1] * scales[k]) {
          counts[k]++
          if (inside !== ACCENT) inside = k
        }
      })
      const a = calm(x, w, 0.1)
      if (inside < 0) out.add(x, y, 1.1, 0.6 * a)
      else (inside === ACCENT ? main : lit).add(x, y, 1.5, a)
    }
    out.fill(ctx, p.dim)
    lit.fill(ctx, p.bright)
    main.fill(ctx, p.star)

    // The rings, dotted.
    ctx.setLineDash([0, 5])
    ctx.lineCap = "round"
    ctx.lineWidth = 1.6
    s.centers.forEach((c, k) => {
      c.radii.forEach((r, i) => {
        const outer = i === c.radii.length - 1
        ctx.strokeStyle = k === ACCENT && outer ? p.accent : p.glow
        ctx.globalAlpha = outer ? 0.9 : 0.5
        ctx.beginPath()
        ctx.arc(c.x, c.y, r * scales[k], 0, TAU)
        ctx.stroke()
      })
    })
    ctx.globalAlpha = 1
    ctx.setLineDash([])
    ctx.lineCap = "butt"
    ctx.lineWidth = 1

    // Centers and badges.
    s.centers.forEach((c, k) => {
      crosshair(ctx, c.x, c.y, k === ACCENT ? p.accent : p.star, 2, 6)
      const r = c.radii[c.radii.length - 1] * scales[k]
      const a = (c.badge * Math.PI) / 180
      const ax = c.x + Math.cos(a) * r
      const ay = c.y + Math.sin(a) * r
      const text = `R ${(r / UNIT).toFixed(2)}  N ${counts[k]}`
      const width = Math.ceil(textWidth(ctx, p, text)) + 16
      const right = Math.cos(a) >= 0
      const bx = Math.min(Math.max(8, right ? ax + 8 : ax - 8 - width), w - 8 - width)
      const by = Math.min(Math.max(20, ay + (Math.sin(a) < 0 ? -12 : 12)), h - 20)
      ctx.strokeStyle = p.line
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(right ? bx : bx + width, by)
      ctx.stroke()
      chip(ctx, p, text, bx, by)
    })
  },
}

export function Rings() {
  return <SceneCanvas scene={scene} />
}
