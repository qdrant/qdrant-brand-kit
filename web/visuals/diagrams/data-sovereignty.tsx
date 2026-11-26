"use client"

import { clamp, ease, rng, spread } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { hexCorners, labelRow, poly, prefersStill, type Pt } from "./lib"

// Data privacy and sovereignty (qdrant.tech/documentation/private-cloud, checked 2026-11-26): with Private Cloud the
// databases run in your Kubernetes, on your own storage and compute, and Qdrant has no access to your databases, data,
// API keys, backups or logs. Drawn as nested hexagons, like the brandmark: your data (indigo points) inside the Qdrant
// cluster, inside Kubernetes, inside your infrastructure, each ring named with a leader line. A slow pulse goes out
// from the data and fades before the outer ring: nothing leaves. The rings draw in once; the points breathe.

const RINGS = [1, 0.74, 0.5] as const
const POINTS = 22
const PULSE = 4.5

type State = { w: number; h: number; p: Palette; points: Pt[]; still: boolean }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(523)
    // Points in a unit disc, spread evenly, kept to the inner hexagon by the radius used when drawing.
    const points = spread(POINTS * 3, 2, 2, rand, 8)
      .map((pt) => ({ x: pt.x - 1, y: pt.y - 1 }))
      .filter((pt) => Math.hypot(pt.x, pt.y) < 0.95)
      .slice(0, POINTS)
    return { w, h, p, points, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const time = s.still ? 12 : t
    const narrow = w < 460
    const R = Math.min(h * 0.44, w * (narrow ? 0.28 : 0.32))
    const cx = Math.round(narrow ? R + 14 : w * 0.36)
    const cy = h / 2

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The rings, outside in.
    RINGS.forEach((k, i) => {
      const on = ease((time - 0.2 - i * 0.25) / 0.6)
      if (on <= 0) return
      poly(ctx, hexCorners(cx, cy, R * k))
      ctx.fillStyle = alpha(p.glow, (0.03 + i * 0.025) * on)
      ctx.fill()
      ctx.strokeStyle = alpha(
        i === 0 ? p.glow : p.line,
        (i === 0 ? 0.85 : 1) * on
      )
      ctx.stroke()
    })

    // The pulse: out from the data, gone before the outer ring.
    // None in the reduced-motion frame, where a still pulse would read as another ring.
    const ready = s.still ? 0 : clamp((time - 1.2) / 0.6)
    for (const offset of [0, PULSE / 2]) {
      const phase = ((time + offset) % PULSE) / PULSE
      const r = R * (0.18 + 0.72 * phase)
      const a = Math.sin(Math.PI * clamp(phase / 0.92)) * 0.45 * ready
      if (a <= 0.01) continue
      poly(ctx, hexCorners(cx, cy, r))
      ctx.strokeStyle = alpha(p.bright, a)
      ctx.stroke()
    }

    // Your data: small indigo hexagons that breathe.
    const inner = R * RINGS[2] * 0.62
    const shown = clamp((time - 0.9) / 0.6)
    s.points.forEach((pt, i) => {
      const breathe = 0.65 + 0.35 * Math.sin(time * 1.3 + i * 1.7)
      poly(ctx, hexCorners(cx + pt.x * inner, cy + pt.y * inner, 3))
      ctx.fillStyle = alpha(p.bright, breathe * shown)
      ctx.fill()
    })

    // The names, on the right, each with a leader to its ring's right edge.
    const names = narrow
      ? ["INFRASTRUCTURE", "KUBERNETES", "CLUSTER", "YOUR DATA"]
      : ["YOUR INFRASTRUCTURE", "KUBERNETES", "QDRANT CLUSTER", "YOUR DATA"]
    const lx = cx + R * 0.866 + (narrow ? 12 : 28)
    const offsets = [-0.44, -0.15, 0.15, 0.44]
    names.forEach((name, i) => {
      const on = clamp((time - 1.0 - i * 0.15) / 0.4)
      if (on <= 0) return
      const y = Math.round(cy + offsets[i]! * R) + 0.5
      // The anchor: the ring's right edge, or a data point for the data.
      const from =
        i < 3
          ? { x: cx + R * RINGS[i]! * 0.866, y }
          : (() => {
              const best = s.points.reduce((a, b) =>
                b.x * 2 + b.y > a.x * 2 + a.y ? b : a
              )
              return { x: cx + best.x * inner, y: cy + best.y * inner }
            })()
      ctx.strokeStyle = alpha(p.label, 0.6 * on)
      ctx.beginPath()
      ctx.moveTo(from.x + (i < 3 ? 0 : 5), from.y)
      if (i === 3) ctx.lineTo(lx - 30, y)
      ctx.lineTo(lx - 8, y)
      ctx.stroke()
      ctx.fillStyle = alpha(i === 0 ? p.glow : p.label, on)
      ctx.fillRect(from.x - 1.5, from.y - 1.5, 3, 3)
      labelRow(ctx, p, [[name, i === 3 ? p.bright : p.star]], lx, y, {
        opacity: on,
      })
    })
  },
}

export function DataSovereignty() {
  return <SceneCanvas scene={scene} />
}
