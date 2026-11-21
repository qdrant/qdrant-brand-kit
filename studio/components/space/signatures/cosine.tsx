"use client"

import { clamp } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, dimension, prefersStill, readout, wrap } from "./lib"

// Cosine: a unit circle with a stored vector and a query vector sweeping around it. The arc between them is
// the angle θ; the query's projection on the stored vector, measured, is cos θ. On the right, the cosine
// curve with a marker at the current angle. The pointer sets the query: by angle on the circle, or by
// position along the curve.

const STORED = (35 * Math.PI) / 180

type State = { w: number; h: number; p: Palette; theta: number; last: number; still: boolean }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, theta: 1, last: -1, still: prefersStill() }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h } = s
    const wide = w >= 560
    const R = Math.min(h * 0.34, wide ? w * 0.22 : w * 0.36)
    const cx = wide ? Math.max(R + 56, w * 0.28) : w * 0.5
    const cy = h * 0.47
    const px0 = cx + R + 76
    const px1 = w - 32
    const A = R * 0.6

    // θ: from the pointer (an angle on the circle, or a place along the curve), else a slow sweep.
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    let target = s.still ? 0.9 : (t * 0.3 + 0.9) % TAU
    if (pointer.inside) {
      if (wide && pointer.x > px0 - 24) target = clamp((pointer.x - px0) / (px1 - px0)) * TAU
      else target = Math.atan2(cy - pointer.y, pointer.x - cx) - STORED
    }
    s.theta += wrap(target - s.theta) * Math.min(1, dt * (pointer.inside ? 10 : 6))
    const theta = ((s.theta % TAU) + TAU) % TAU
    const cos = Math.cos(theta)
    const query = STORED + theta
    const at = (a: number, r = R) => ({ x: cx + Math.cos(a) * r, y: cy - Math.sin(a) * r })

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Axes, the unit circle and its ticks.
    ctx.strokeStyle = p.grid
    ctx.beginPath()
    ctx.moveTo(cx - R - 20, cy + 0.5)
    ctx.lineTo(cx + R + 20, cy + 0.5)
    ctx.moveTo(cx + 0.5, cy - R - 20)
    ctx.lineTo(cx + 0.5, cy + R + 20)
    ctx.stroke()
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, TAU)
    for (let deg = 0; deg < 360; deg += 10) {
      const a = (deg * Math.PI) / 180
      const from = at(a, R + 3)
      const to = at(a, R + (deg % 30 === 0 ? 10 : 6))
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
    }
    ctx.stroke()
    for (const deg of [0, 90, 180, 270]) {
      const { x, y } = at((deg * Math.PI) / 180, R + 26)
      label(ctx, p, `${deg}°`, x, y, { align: "center", opacity: 0.8 })
    }

    // The stored vector, extended back through the center for negative projections.
    const tip = at(STORED)
    const back = at(STORED + Math.PI)
    ctx.strokeStyle = p.line
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(back.x, back.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = p.bright
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(tip.x, tip.y)
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.fillStyle = p.bright
    ctx.beginPath()
    ctx.arc(tip.x, tip.y, 3, 0, TAU)
    ctx.fill()
    const name = at(STORED, R + 22)
    label(ctx, p, "#4821", name.x + 4, name.y - 6, { color: p.star })

    // The angle between them, the short way round.
    const signed = wrap(theta)
    ctx.strokeStyle = p.glow
    ctx.beginPath()
    ctx.arc(cx, cy, 40, -STORED, -(STORED + signed), signed > 0)
    ctx.stroke()
    const mid = at(STORED + signed / 2, 58)
    const degrees = (Math.abs(signed) * 180) / Math.PI
    label(ctx, p, `θ ${degrees.toFixed(1)}°`, mid.x, mid.y, { align: "center", color: p.star })

    // The projection: a drop from the query to the stored line, and cos θ measured along it.
    const q = at(query)
    const foot = { x: cx + Math.cos(STORED) * R * cos, y: cy - Math.sin(STORED) * R * cos }
    ctx.strokeStyle = p.line
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(q.x, q.y)
    ctx.lineTo(foot.x, foot.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = p.glow
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(foot.x, foot.y)
    ctx.stroke()
    ctx.lineWidth = 1
    if (Math.abs(cos) > 0.2) {
      // On the side away from the query, clear of the drop line.
      const cross = (foot.x - cx) * (q.y - cy) - (foot.y - cy) * (q.x - cx)
      dimension(ctx, p, { x: cx, y: cy }, foot, cos.toFixed(3), cross > 0 ? -16 : 16)
    }

    // The query vector, its tip in the accent.
    ctx.strokeStyle = p.star
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(q.x, q.y)
    ctx.stroke()
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.arc(q.x, q.y, 3.5, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = alpha(p.accent, 0.5)
    ctx.beginPath()
    ctx.arc(q.x, q.y, 7.5, 0, TAU)
    ctx.stroke()

    // The cosine curve over θ, with the marker.
    if (wide && px1 - px0 > 120) {
      const X = (a: number) => px0 + (a / TAU) * (px1 - px0)
      ctx.strokeStyle = p.grid
      ctx.beginPath()
      ctx.moveTo(px0, cy + 0.5)
      ctx.lineTo(px1, cy + 0.5)
      ctx.stroke()
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      for (const dy of [-A, A]) {
        ctx.moveTo(px0, cy + dy + 0.5)
        ctx.lineTo(px1, cy + dy + 0.5)
      }
      ctx.stroke()
      ctx.setLineDash([])
      ctx.strokeStyle = p.line
      ctx.beginPath()
      for (const deg of [0, 90, 180, 270, 360]) {
        const x = Math.round(X((deg * Math.PI) / 180)) + 0.5
        ctx.moveTo(x, cy + A + 4)
        ctx.lineTo(x, cy + A + 9)
        label(ctx, p, String(deg), x, cy + A + 22, { align: "center", opacity: 0.8 })
      }
      ctx.stroke()
      for (const [value, dy] of [
        ["1", -A],
        ["0", 0],
        ["-1", A],
      ] as const)
        label(ctx, p, value, px0 - 10, cy + dy, { align: "right", opacity: 0.8 })
      label(ctx, p, "COS θ", px0, cy - A - 22)
      ctx.strokeStyle = alpha(p.glow, 0.8)
      ctx.beginPath()
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * TAU
        const x = X(a)
        const y = cy - Math.cos(a) * A
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.stroke()
      const mx = X(theta)
      const my = cy - cos * A
      ctx.strokeStyle = p.line
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.moveTo(mx, cy)
      ctx.lineTo(mx, my)
      ctx.moveTo(px0, my)
      ctx.lineTo(mx, my)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = p.bright
      ctx.beginPath()
      ctx.arc(mx, my, 3.5, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = p.bright
      ctx.beginPath()
      ctx.arc(mx, my, 7, 0, TAU)
      ctx.stroke()
    }

    readout(ctx, p, [`θ ${degrees.toFixed(1)}°`, `COS ${cos.toFixed(3)}`, [`DIST ${(1 - cos).toFixed(3)}`, p.label]], 24, h - 28)
  },
}

export function Cosine() {
  return <SceneCanvas scene={scene} />
}
