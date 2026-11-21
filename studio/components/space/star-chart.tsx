"use client"

import { clamp, rng } from "./rand"
import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "./scene"

// Star chart: a hairline grid with a ruler, and stars that are data. Brightness is a score; a query mark
// finds its six nearest stars, which light up in order with their id and score, then fade, and again.

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number }
type Hit = { i: number; id: string; score: string }
type State = { w: number; h: number; p: Palette; stars: Star[]; hits: Hit[]; qx: number; qy: number }

const GRID = 64
const CYCLE = 9

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(11)
    const stars: Star[] = []
    const n = Math.round((w * h) / 2000)
    for (let i = 0; i < n; i++) {
      const s = rand() ** 3
      stars.push({
        x: rand() * w,
        y: rand() * h,
        r: 0.5 + s * 1.4,
        a: 0.2 + s * 0.8,
        tw: 0.3 + rand() * 1.2,
        ph: rand() * Math.PI * 2,
      })
    }
    const qx = Math.round(w * 0.7)
    const qy = Math.round(h * 0.44)
    // The nearest stars whose readouts don't overlap each other or the query's label.
    const boxes = [{ x0: qx - 14, x1: qx + 72, y0: qy - 26, y1: qy + 14 }]
    const picked: [number, number][] = []
    for (const [d, i] of stars
      .map((s, i) => [Math.hypot(s.x - qx, s.y - qy), i] as const)
      .filter(([d]) => d > 40)
      .sort((a, b) => a[0] - b[0])) {
      if (picked.length === 6) break
      const { x, y } = stars[i]
      const box = { x0: x - 8, x1: x + 132, y0: y - 13, y1: y + 13 }
      if (box.x1 > w - 8 || y < 32) continue
      if (boxes.some((b) => b.x0 < box.x1 && box.x0 < b.x1 && b.y0 < box.y1 && box.y0 < b.y1)) continue
      boxes.push(box)
      picked.push([d, i])
    }
    const hits = picked.map(([d, i], rank) => ({
      i,
      id: `#${String(1000 + Math.floor(rand() * 9000))}`,
      score: (0.98 - rank * 0.027 - d / 4000).toFixed(3),
    }))
    for (const { i } of hits) {
      stars[i].r = Math.max(stars[i].r, 1.4)
      stars[i].a = 1
    }
    return { w, h, p, stars, hits, qx, qy }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    clear(ctx, p, w, h)

    // The grid, a cross at every fourth line, and a ruler along the top edge.
    ctx.strokeStyle = p.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = GRID; x < w; x += GRID) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, h)
    }
    for (let y = GRID; y < h; y += GRID) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(w, y + 0.5)
    }
    ctx.stroke()
    ctx.strokeStyle = p.line
    ctx.beginPath()
    for (let x = GRID * 4; x < w; x += GRID * 4)
      for (let y = GRID * 2; y < h; y += GRID * 2) {
        ctx.moveTo(x + 0.5 - 4, y + 0.5)
        ctx.lineTo(x + 0.5 + 5, y + 0.5)
        ctx.moveTo(x + 0.5, y + 0.5 - 4)
        ctx.lineTo(x + 0.5, y + 0.5 + 5)
      }
    for (let x = 0; x < w; x += 8) {
      const tick = x % GRID === 0 ? 6 : 2
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, tick)
    }
    ctx.stroke()
    for (let x = GRID * 2; x < w - 24; x += GRID * 2) label(ctx, p, String(x), x + 4, 16, { opacity: 0.8 })

    // Stars, twinkling slowly.
    ctx.fillStyle = p.star
    for (const star of s.stars) {
      ctx.globalAlpha = star.a * (0.7 + 0.3 * Math.sin(t * star.tw + star.ph))
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // The search: each hit appears in rank order, then all fade before the next cycle.
    const u = (t % CYCLE) / CYCLE
    const out = clamp((0.92 - u) / 0.08)
    s.hits.forEach((hit, rank) => {
      const on = clamp((u - 0.06 - rank * 0.07) / 0.05) * out
      if (on <= 0) return
      const star = s.stars[hit.i]
      ctx.globalAlpha = on
      ctx.strokeStyle = p.glow
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      ctx.moveTo(s.qx, s.qy)
      ctx.lineTo(star.x, star.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(star.x, star.y, 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      label(ctx, p, `${hit.id}  ${hit.score}`, star.x + 12, star.y, { opacity: on })
    })

    // The query: a crosshair in the accent.
    ctx.strokeStyle = p.accent
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(s.qx, s.qy, 4, 0, Math.PI * 2)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.moveTo(s.qx + dx * 7, s.qy + dy * 7)
      ctx.lineTo(s.qx + dx * 12, s.qy + dy * 12)
    }
    ctx.stroke()
    label(ctx, p, "QUERY", s.qx + 16, s.qy - 14, { color: p.accent })
  },
}

export function StarChart() {
  return <SceneCanvas scene={scene} />
}
