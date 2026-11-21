"use client"

import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, crosshair, dotBatch, mix } from "./lib"

// Sunflower: a golden-angle spiral of dots on the right, larger toward the rim, turning slowly. One dot is
// the query, in the accent, linked to its six nearest neighbors in the spiral. Dashed rings measure the radius.

const N = 640
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const QUERY = 144
const SPIN = 0.035

type State = {
  w: number
  h: number
  p: Palette
  cx: number
  cy: number
  c: number
  R: number
  near: number[]
  tint: string
}

// Dot i of the spiral, relative to its center: x, y and its distance from the center.
const at = (i: number, c: number, spin: number) => {
  const r = c * Math.sqrt(i)
  const a = i * GOLDEN + spin
  return [r * Math.cos(a), r * Math.sin(a), r] as const
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const R = Math.min(h * 0.6, 280)
    const c = R / Math.sqrt(N)
    // The spiral turns as a whole, so the query's neighbors never change.
    const [qx, qy] = at(QUERY, c, 0)
    const near = Array.from({ length: N - 1 }, (_, k) => k + 1)
      .filter((i) => i !== QUERY)
      .map((i) => {
        const [x, y] = at(i, c, 0)
        return [Math.hypot(x - qx, y - qy), i] as const
      })
      .sort((a, b) => a[0] - b[0])
      .slice(0, 6)
      .map(([, i]) => i)
    return {
      w,
      h,
      p,
      cx: w - Math.min(w * 0.24, 200),
      cy: h * 0.5,
      c,
      R,
      near,
      tint: mix(p.star, p.bright, 0.45),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, cx, cy, c, R } = s
    clear(ctx, p, w, h)
    const spin = t * SPIN

    // Rings at a quarter, a half and three quarters of the radius, on the right side, labeled up the axis.
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.setLineDash([2, 6])
    ctx.beginPath()
    for (const q of [0.25, 0.5, 0.75]) {
      const r = R * q
      ctx.moveTo(cx + Math.cos(-0.75 * Math.PI) * r, cy + Math.sin(-0.75 * Math.PI) * r)
      ctx.arc(cx, cy, r, -0.75 * Math.PI, 0.75 * Math.PI)
    }
    ctx.stroke()
    ctx.setLineDash([])
    for (const q of [0.25, 0.5, 0.75]) {
      const y = cy - R * q - 9
      if (y > 16) label(ctx, p, q.toFixed(2), cx + 6, y, { opacity: 0.8 })
    }
    crosshair(ctx, cx, cy, p.dim, 2, 6)

    // The spiral: dots grow toward the rim.
    const dots = dotBatch(8)
    for (let i = 1; i < N; i++) {
      const [dx, dy, r] = at(i, c, spin)
      const x = cx + dx
      const y = cy + dy
      if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue
      const k = r / R
      dots.add(x, y, 0.5 + 2.1 * k, calm(x, w, 0.1) * (0.4 + 0.6 * k))
    }
    dots.fill(ctx, s.tint)

    // The query and its six nearest neighbors.
    const [qdx, qdy] = at(QUERY, c, spin)
    const qx = cx + qdx
    const qy = cy + qdy
    const near = s.near.map((i) => {
      const [dx, dy] = at(i, c, spin)
      return [cx + dx, cy + dy] as const
    })
    ctx.strokeStyle = p.glow
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    for (const [x, y] of near) {
      ctx.moveTo(qx, qy)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    for (const [x, y] of near) {
      ctx.moveTo(x + 4.5, y)
      ctx.arc(x, y, 4.5, 0, TAU)
    }
    ctx.stroke()
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.arc(qx, qy, 3, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = p.accent
    ctx.beginPath()
    ctx.arc(qx, qy, 8, 0, TAU)
    ctx.stroke()
    const right = qx < w - 104
    label(ctx, p, `#0${QUERY}  K 6`, right ? qx + 14 : qx - 14, qy - 14, {
      align: right ? "left" : "right",
    })
  },
}

export function Phyllotaxis() {
  return <SceneCanvas scene={scene} />
}
