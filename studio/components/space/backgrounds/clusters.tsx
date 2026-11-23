"use client"

import { rng } from "../rand"
import { SceneCanvas, chip, clear, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, crosshair, dotBatch, mix, textWidth } from "./lib"

// Embedding map: gaussian clusters of points in violet tints, drifting slowly. Each cluster has a centroid
// mark, a dashed ring at two standard deviations and a count badge; one centroid is in the accent.

// Where each cluster sits (a share of the frame), its spread in pixels and its number of points.
const SPEC = [
  { fx: 0.62, fy: 0.26, sigma: 26, n: 120 },
  { fx: 0.86, fy: 0.3, sigma: 22, n: 76 },
  { fx: 0.74, fy: 0.62, sigma: 36, n: 170 },
  { fx: 0.92, fy: 0.8, sigma: 18, n: 54 },
  { fx: 0.58, fy: 0.84, sigma: 22, n: 88 },
]
const ACCENT = 2

type Point = { dx: number; dy: number; ph: number; a: number }
type Cluster = { x: number; y: number; sigma: number; points: Point[]; tint: string; badge: string }
type State = { w: number; h: number; p: Palette; clusters: Cluster[]; noise: Point[] }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(41)
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TAU * rand())
    const tints = [
      mix(p.glow, p.star, 0.25),
      p.bright,
      mix(p.glow, p.plum, 0.45),
      mix(p.bright, p.star, 0.5),
      p.glow,
    ]
    const clusters = SPEC.map(({ fx, fy, sigma, n }, k) => ({
      x: fx * w,
      y: fy * h,
      sigma,
      tint: tints[k],
      badge: `C${k}  ${n}`,
      points: Array.from({ length: n }, () => {
        const dx = gauss() * sigma
        const dy = gauss() * sigma * 0.85
        return { dx, dy, ph: rand() * TAU, a: Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) }
      }),
    }))
    // A few unassigned points between the clusters, fewer toward the copy.
    const noise = Array.from({ length: 64 }, () => ({
      dx: w * (0.3 + 0.7 * rand()),
      dy: rand() * h,
      ph: rand() * TAU,
      a: 0.4,
    }))
    return { w, h, p, clusters, noise }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    clear(ctx, p, w, h)

    const background = dotBatch(6)
    for (const { dx, dy, ph, a } of s.noise)
      background.add(dx + Math.sin(t * 0.3 + ph) * 2, dy, 1, a * calm(dx, w, 0.1))
    background.fill(ctx, p.dim)

    const centers = s.clusters.map((cluster, k) => {
      const x = cluster.x + 8 * Math.sin(t * 0.11 + k * 1.7)
      const y = cluster.y + 6 * Math.cos(t * 0.09 + k * 2.3)
      const dots = dotBatch(6)
      for (const pt of cluster.points) {
        const px = x + pt.dx + 1.2 * Math.sin(t * 0.6 + pt.ph)
        const py = y + pt.dy + 1.2 * Math.cos(t * 0.5 + pt.ph)
        dots.add(px, py, 1.3, (0.35 + 0.6 * pt.a) * calm(px, w, 0.1))
      }
      dots.fill(ctx, cluster.tint)
      return [x, y] as const
    })

    // Rings at two standard deviations, centroids, and a badge over each ring with its count.
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    s.clusters.forEach(({ sigma }, k) => {
      const [x, y] = centers[k]
      ctx.moveTo(x + sigma * 2, y)
      ctx.arc(x, y, sigma * 2, 0, TAU)
    })
    ctx.stroke()
    ctx.setLineDash([])
    s.clusters.forEach(({ sigma, badge }, k) => {
      const [x, y] = centers[k]
      crosshair(ctx, x, y, k === ACCENT ? p.accent : p.star, 3, 8)
      const top = y - sigma * 2
      ctx.strokeStyle = p.line
      ctx.beginPath()
      ctx.moveTo(Math.round(x) + 0.5, top)
      ctx.lineTo(Math.round(x) + 0.5, top - 8)
      ctx.stroke()
      const width = Math.ceil(textWidth(ctx, p, badge)) + 16
      const bx = Math.min(Math.max(8, x - width / 2), w - 8 - width)
      chip(ctx, p, badge, bx, Math.max(20, top - 20))
    })
  },
}

export function Clusters() {
  return <SceneCanvas scene={scene} />
}
