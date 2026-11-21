"use client"

import { SceneCanvas, chip, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, calmGradient, crosshair, lineBatch, textWidth } from "./lib"

// Gauge rings: concentric tick rings off to the right, like a dial, with degree labels on the outer scale.
// A dashed arm is the query; a sweeping index is a result, its angle to the query measured on an arc and
// read out as cosine similarity. The index's tip is the one accent mark.

const DEG = Math.PI / 180
const REF = -30 * DEG // the query's direction, up and to the right

type State = { w: number; h: number; p: Palette; cx: number; cy: number; r: number[] }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return {
      w,
      h,
      p,
      cx: w - Math.min(w * 0.28, 210),
      cy: Math.round(h * 0.5),
      r: [0.46, 0.34, 0.23, 0.12].map((k) => Math.round(h * k)),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, cx, cy } = s
    const [r1, r2, r3, r4] = s.r
    clear(ctx, p, w, h)
    const theta = REF + 0.9 * Math.sin(t * 0.23) + 0.05 * Math.sin(t * 1.3)
    const at = (a: number, r: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const

    // The rings and their ticks, in one stroke that fades toward the copy.
    const rings = new Path2D()
    const tick = (a: number, from: number, to: number) => {
      rings.moveTo(...at(a, from))
      rings.lineTo(...at(a, to))
    }
    for (const r of [r1, r4]) {
      rings.moveTo(cx + r, cy)
      rings.arc(cx, cy, r, 0, TAU)
    }
    for (let d = 0; d < 360; d += 2) tick(d * DEG, r1, r1 - (d % 30 === 0 ? 12 : d % 10 === 0 ? 8 : 4))
    const turn = -t * 0.02
    for (let d = 0; d < 360; d += 5) tick(d * DEG + turn, r2, r2 + (d % 45 === 0 ? 8 : 4))
    for (let d = 0; d < 360; d += 15) tick(d * DEG, r4, r4 - 6)
    ctx.lineWidth = 1
    ctx.strokeStyle = calmGradient(ctx, w, p.line, 0.08)
    ctx.stroke(rings)

    // A dotted ring between them.
    ctx.setLineDash([0, 6])
    ctx.lineCap = "round"
    ctx.lineWidth = 1.5
    ctx.strokeStyle = calmGradient(ctx, w, p.glow, 0.08, 0.7)
    ctx.beginPath()
    ctx.arc(cx, cy, r3, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineCap = "butt"
    ctx.lineWidth = 1

    // Degree labels inside the outer scale.
    for (let d = 0; d < 360; d += 30) {
      const [x, y] = at(d * DEG, r1 - 24)
      if (x < 16 || x > w - 16 || y < 12 || y > h - 12) continue
      label(ctx, p, String(d).padStart(3, "0"), x, y, { align: "center", opacity: calm(x, w, 0.08) })
    }

    // The outer ticks brighten near the index.
    const near = lineBatch(6)
    for (let d = 0; d < 360; d += 2) {
      const a = d * DEG
      const off = Math.abs(Math.atan2(Math.sin(a - theta), Math.cos(a - theta)))
      if (off > 10 * DEG) continue
      const len = d % 30 === 0 ? 12 : d % 10 === 0 ? 8 : 4
      near.add(...at(a, r1), ...at(a, r1 - len), 1 - off / (10 * DEG))
    }
    near.stroke(ctx, p.bright)

    // The query arm (dashed) and the index.
    ctx.strokeStyle = p.dim
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(...at(REF, 6))
    ctx.lineTo(...at(REF, r3 + 12))
    ctx.stroke()
    ctx.setLineDash([])
    label(ctx, p, "Q", ...at(REF, r3 + 22), { align: "center" })
    ctx.strokeStyle = p.glow
    ctx.beginPath()
    ctx.moveTo(...at(theta, r4))
    ctx.lineTo(...at(theta, r1 + 4))
    ctx.stroke()
    const [tx, ty] = at(theta, r1 + 4)
    const [bx, by] = at(theta, r1 + 14)
    const nx = -Math.sin(theta) * 4
    const ny = Math.cos(theta) * 4
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.lineTo(bx + nx, by + ny)
    ctx.lineTo(bx - nx, by - ny)
    ctx.closePath()
    ctx.fill()

    // The angle between them, measured on an arc.
    const ra = r4 + 18
    ctx.strokeStyle = p.glow
    ctx.beginPath()
    ctx.arc(cx, cy, ra, Math.min(REF, theta), Math.max(REF, theta))
    ctx.stroke()
    const angle = Math.abs(theta - REF) / DEG
    label(ctx, p, `${angle.toFixed(1)}°`, ...at((REF + theta) / 2, ra + 16), { align: "center" })
    crosshair(ctx, cx, cy, p.star, 2, 6)

    const text = `COS ${Math.cos(theta - REF).toFixed(3)}`
    chip(ctx, p, text, w - 24 - (Math.ceil(textWidth(ctx, p, text)) + 16), h - 28)
  },
}

export function Gauge() {
  return <SceneCanvas scene={scene} />
}
