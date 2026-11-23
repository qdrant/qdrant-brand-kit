"use client"

import { clamp, rng } from "./rand"
import { SceneCanvas, clear, alpha, label, type CanvasScene, type Palette } from "./scene"

// Filter lens: a payload filter as a lens. Inside it, the stars that match the filter light up and the rest
// almost vanish; outside, every star looks the same. The lens follows the pointer (or drifts on its own), and
// a click changes the filter. The readout counts the matches in view.

const GROUPS = 4
type Star = { x: number; y: number; r: number; a: number; group: number }
type State = {
  w: number
  h: number
  p: Palette
  stars: Star[]
  lx: number
  ly: number
  last: number
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(3)
    const stars: Star[] = []
    const n = Math.round((w * h) / 700)
    for (let i = 0; i < n; i++) {
      const s = rand() ** 2
      stars.push({ x: rand() * w, y: rand() * h, r: 0.6 + s * 1.2, a: 0.25 + s * 0.5, group: Math.floor(rand() * GROUPS) })
    }
    return { w, h, p, stars, lx: w * 0.6, ly: h * 0.5, last: -1 }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h } = s
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    const R = Math.min(w, h) * 0.26
    // At rest the lens drifts, always whole inside the frame.
    const tx = pointer.inside ? pointer.x : clamp(w * (0.6 + 0.2 * Math.sin(t * 0.23)), R + 16, w - R - 16)
    const ty = pointer.inside ? pointer.y : clamp(h * (0.5 + 0.2 * Math.sin(t * 0.31 + 2)), R + 16, h - R - 16)
    const k = Math.min(1, dt * 6)
    s.lx += (tx - s.lx) * k
    s.ly += (ty - s.ly) * k
    const group = pointer.clicks % GROUPS

    clear(ctx, p, w, h)

    let inView = 0
    let matches = 0
    for (const star of s.stars) {
      const d = Math.hypot(star.x - s.lx, star.y - s.ly)
      const inside = d < R
      const match = star.group === group
      if (inside) {
        inView += 1
        if (match) matches += 1
      }
      ctx.globalAlpha = inside ? (match ? 1 : 0.08) : star.a
      ctx.fillStyle = inside && match ? p.star : p.dim
      ctx.beginPath()
      ctx.arc(star.x, star.y, inside && match ? star.r + 0.6 : star.r, 0, Math.PI * 2)
      ctx.fill()
      if (inside && match) {
        ctx.globalAlpha = 0.7
        ctx.strokeStyle = p.glow
        ctx.beginPath()
        ctx.arc(star.x, star.y, 4.5, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1

    // The lens: a hairline ring with degree ticks, a faint fill, and a center mark.
    const fill = ctx.createRadialGradient(s.lx, s.ly, R * 0.2, s.lx, s.ly, R)
    fill.addColorStop(0, alpha(p.glow, 0))
    fill.addColorStop(1, alpha(p.glow, 0.08))
    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.arc(s.lx, s.ly, R, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.beginPath()
    for (let deg = 0; deg < 360; deg += 6) {
      const a = (deg * Math.PI) / 180
      const long = deg % 30 === 0 ? 8 : 4
      ctx.moveTo(s.lx + Math.cos(a) * R, s.ly + Math.sin(a) * R)
      ctx.lineTo(s.lx + Math.cos(a) * (R + long), s.ly + Math.sin(a) * (R + long))
    }
    ctx.stroke()
    ctx.strokeStyle = p.accent
    ctx.beginPath()
    ctx.moveTo(s.lx, s.ly - R - 2)
    ctx.lineTo(s.lx, s.ly - R - 12)
    ctx.moveTo(s.lx - 6, s.ly)
    ctx.lineTo(s.lx + 6, s.ly)
    ctx.moveTo(s.lx, s.ly - 6)
    ctx.lineTo(s.lx, s.ly + 6)
    ctx.stroke()
    // The readout sits beside the lens, on the side with room.
    const right = s.lx + R + 170 < w
    const x = right ? s.lx + R * 0.72 + 14 : s.lx - R * 0.72 - 14
    const y = clamp(s.ly - R * 0.72, 20, h - 40)
    const align = right ? "left" : "right"
    label(ctx, p, `FILTER  GROUP = ${group + 1}`, x, y, { color: p.star, align })
    label(ctx, p, `${matches} / ${inView} MATCH`, x, y + 18, { align })
  },
}

export function FilterLens() {
  return <SceneCanvas scene={scene} />
}
