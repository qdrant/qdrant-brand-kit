"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, ids, prefersStill, readout, wrap } from "./lib"

// Sunflower index: 640 vectors on a phyllotaxis disc, each point's angle its direction. The query is a
// direction too, sweeping slowly or following the pointer. Its 40 most similar points by cosine are the 40
// nearest angles, so the neighborhood lights up as an arc from the center to the rim, measured at the rim.

const N = 640
const K = 40
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

type State = {
  w: number
  h: number
  p: Palette
  angles: number[]
  radii: number[]
  names: string[]
  angle: number
  last: number
  still: boolean
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const angles = Array.from({ length: N }, (_, i) => wrap(i * GOLDEN))
    const radii = Array.from({ length: N }, (_, i) => Math.sqrt((i + 0.5) / N))
    return { w, h, p, angles, radii, names: ids(N, rng(17)), angle: -0.6, last: -1, still: prefersStill() }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h } = s
    const R = Math.min(h * 0.36, w * 0.3)
    const cx = w * 0.5
    const cy = h * 0.5
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    const target = pointer.inside
      ? Math.atan2(pointer.y - cy, pointer.x - cx)
      : s.still
        ? -0.6
        : t * 0.2 - 0.6
    s.angle = wrap(s.angle + wrap(target - s.angle) * Math.min(1, dt * (pointer.inside ? 8 : 4)))
    const q = s.angle

    // Cosine similarity of every point to the query, and the top K.
    const order = s.angles.map((a, i) => ({ i, c: Math.cos(a - q) })).sort((a, b) => b.c - a.c)
    const rank = new Map(order.slice(0, K).map(({ i }, r) => [i, r]))
    const cosK = order[K - 1].c
    const spread = Math.acos(clamp(cosK, -1, 1))

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The rim: a ring with a tick every 5 degrees, longer every 45, and the quarter angles.
    const rim = R + 14
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.arc(cx, cy, rim, 0, TAU)
    for (let deg = 0; deg < 360; deg += 5) {
      const a = (deg * Math.PI) / 180
      const long = deg % 45 === 0 ? 8 : 4
      ctx.moveTo(cx + Math.cos(a) * rim, cy + Math.sin(a) * rim)
      ctx.lineTo(cx + Math.cos(a) * (rim + long), cy + Math.sin(a) * (rim + long))
    }
    ctx.stroke()
    for (const deg of [0, 90, 180, 270]) {
      const a = (-deg * Math.PI) / 180
      label(ctx, p, `${deg}°`, cx + Math.cos(a) * (rim + 26), cy + Math.sin(a) * (rim + 26), {
        align: "center",
        opacity: 0.8,
      })
    }

    // The wedge the top K span: two rays and the arc at the rim.
    ctx.strokeStyle = alpha(p.glow, 0.55)
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    for (const side of [-1, 1]) {
      const a = q + side * spread
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * rim, cy + Math.sin(a) * rim)
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = p.glow
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, rim, q - spread, q + spread)
    ctx.stroke()
    ctx.lineWidth = 1

    // The points: unmatched in one pass, then the top K by rank.
    ctx.fillStyle = alpha(p.dim, 0.6)
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      if (rank.has(i)) continue
      const r = s.radii[i]
      const x = cx + Math.cos(s.angles[i]) * r * R
      const y = cy + Math.sin(s.angles[i]) * r * R
      const size = 0.8 + 1.3 * r
      ctx.moveTo(x + size, y)
      ctx.arc(x, y, size, 0, TAU)
    }
    ctx.fill()
    ctx.fillStyle = p.bright
    for (const [i, r] of rank) {
      const x = cx + Math.cos(s.angles[i]) * s.radii[i] * R
      const y = cy + Math.sin(s.angles[i]) * s.radii[i] * R
      ctx.globalAlpha = 1 - (r / K) * 0.5
      ctx.beginPath()
      ctx.arc(x, y, 1.4 + 1.3 * s.radii[i], 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // The best match, ringed and named.
    const best = order[0].i
    const bx = cx + Math.cos(s.angles[best]) * s.radii[best] * R
    const by = cy + Math.sin(s.angles[best]) * s.radii[best] * R
    ctx.strokeStyle = p.star
    ctx.beginPath()
    ctx.arc(bx, by, 5.5, 0, TAU)
    ctx.stroke()

    // The query direction: a hairline to the rim and the accent mark outside it.
    const tip = { x: cx + Math.cos(q) * (rim + 12), y: cy + Math.sin(q) * (rim + 12) }
    ctx.strokeStyle = alpha(p.star, 0.5)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(q) * rim, cy + Math.sin(q) * rim)
    ctx.stroke()
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.moveTo(tip.x - Math.cos(q) * 8 + Math.sin(q) * 4, tip.y - Math.sin(q) * 8 - Math.cos(q) * 4)
    ctx.lineTo(tip.x, tip.y)
    ctx.lineTo(tip.x - Math.cos(q) * 8 - Math.sin(q) * 4, tip.y - Math.sin(q) * 8 + Math.cos(q) * 4)
    ctx.closePath()
    ctx.fill()
    const right = Math.cos(q) >= 0
    label(ctx, p, `±${((spread * 180) / Math.PI).toFixed(1)}°`, cx + Math.cos(q) * (rim + 30), cy + Math.sin(q) * (rim + 30), {
      align: right ? "left" : "right",
      color: p.star,
    })

    const deg = ((((-q * 180) / Math.PI) % 360) + 360) % 360
    label(ctx, p, `N ${N}`, 24, 32)
    label(ctx, p, `STEP ${((GOLDEN * 180) / Math.PI).toFixed(3)}°`, 24, 50)
    readout(ctx, p, [`θ ${deg.toFixed(1)}°`, `K ${K}`, [`COS ≥ ${cosK.toFixed(3)}`, p.label]], 24, h - 28)
    readout(ctx, p, [s.names[best], [order[0].c.toFixed(4), p.label]], w - 24, h - 28, { align: "right" })
  },
}

export function Sunflower() {
  return <SceneCanvas scene={scene} />
}
