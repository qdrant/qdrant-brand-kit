"use client"

import { rng, spread, type Point } from "../rand"
import { SceneCanvas, alpha, chip, clear, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, calmGradient, crosshair, dotBatch } from "./lib"

// Voronoi partitions: the cells of a set of slowly drifting centroids, like an IVF index, in hairlines. A
// query (the accent mark) probes its two nearest cells, which light up with their centroid id and the
// number of points they hold.

const CELLS = 22
const PROBES = 2

type Seed = { x: number; y: number; ax: number; ay: number; f: number; ph: number }
type State = { w: number; h: number; p: Palette; seeds: Seed[]; points: Point[]; qx: number; qy: number }

// Keeps the part of a polygon on the near side of a line: where (p - m) . n <= 0.
function clip(poly: Point[], mx: number, my: number, nx: number, ny: number) {
  const out: Point[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const da = (a.x - mx) * nx + (a.y - my) * ny
    const db = (b.x - mx) * nx + (b.y - my) * ny
    const keepA = da <= 0
    const keepB = db <= 0
    if (keepA) out.push(a)
    if (keepA !== keepB) {
      const u = da / (da - db)
      out.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u })
    }
  }
  return out
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(17)
    const seeds = spread(CELLS, w + 80, h + 80, rand).map(({ x, y }) => ({
      x: x - 40,
      y: y - 40,
      ax: 10 + rand() * 14,
      ay: 10 + rand() * 14,
      f: 0.05 + rand() * 0.08,
      ph: rand() * TAU,
    }))
    return { w, h, p, seeds, points: spread(150, w, h, rand, 6), qx: w * 0.74, qy: h * 0.46 }
  },
  draw(ctx, s, t) {
    const { p, w, h, qx, qy } = s
    clear(ctx, p, w, h)
    const centers = s.seeds.map((seed) => ({
      x: seed.x + seed.ax * Math.sin(t * seed.f + seed.ph),
      y: seed.y + seed.ay * Math.cos(t * seed.f * 1.3 + seed.ph),
    }))

    // Each cell: the frame, cut by the bisector with every other centroid.
    const frame = [
      { x: -2, y: -2 },
      { x: w + 2, y: -2 },
      { x: w + 2, y: h + 2 },
      { x: -2, y: h + 2 },
    ]
    const cells = centers.map((c, i) => {
      let poly = frame
      for (let j = 0; j < centers.length && poly.length; j++) {
        if (j === i) continue
        const o = centers[j]
        poly = clip(poly, (c.x + o.x) / 2, (c.y + o.y) / 2, o.x - c.x, o.y - c.y)
      }
      return poly
    })
    const trace = (path: Path2D, poly: Point[]) => {
      poly.forEach(({ x, y }, k) => (k ? path.lineTo(x, y) : path.moveTo(x, y)))
      path.closePath()
    }

    // The query's nearest centroids are the cells it probes.
    const probed = centers
      .map((c, i) => [Math.hypot(c.x - qx, c.y - qy), i] as const)
      .sort((a, b) => a[0] - b[0])
      .slice(0, PROBES)
      .map(([, i]) => i)
    const lit = new Path2D()
    for (const i of probed) trace(lit, cells[i])
    ctx.fillStyle = alpha(p.glow, 0.07)
    ctx.fill(lit)

    const edges = new Path2D()
    cells.forEach((poly) => trace(edges, poly))
    ctx.lineWidth = 1
    ctx.strokeStyle = calmGradient(ctx, w, p.line, 0.1)
    ctx.stroke(edges)
    ctx.strokeStyle = alpha(p.glow, 0.7)
    ctx.stroke(lit)

    // Points, each in its nearest centroid's cell.
    const counts = centers.map(() => 0)
    const rest = dotBatch(6)
    const hits = dotBatch(6)
    for (const pt of s.points) {
      let nearest = 0
      let best = Infinity
      centers.forEach((c, i) => {
        const d = (c.x - pt.x) ** 2 + (c.y - pt.y) ** 2
        if (d < best) {
          best = d
          nearest = i
        }
      })
      counts[nearest]++
      if (probed.includes(nearest)) hits.add(pt.x, pt.y, 1.5, 0.9)
      else rest.add(pt.x, pt.y, 1.1, 0.55 * calm(pt.x, w, 0.1))
    }
    rest.fill(ctx, p.dim)
    hits.fill(ctx, p.star)

    // Centroids, then the probes and the query.
    const marks = dotBatch(4)
    for (const c of centers) marks.add(c.x, c.y, 2, calm(c.x, w, 0.15))
    marks.fill(ctx, p.bright)
    ctx.strokeStyle = p.glow
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    for (const i of probed) {
      ctx.moveTo(qx, qy)
      ctx.lineTo(centers[i].x, centers[i].y)
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = p.bright
    ctx.beginPath()
    for (const i of probed) {
      ctx.moveTo(centers[i].x + 5, centers[i].y)
      ctx.arc(centers[i].x, centers[i].y, 5, 0, TAU)
    }
    ctx.stroke()
    crosshair(ctx, qx, qy, p.accent, 3, 8)
    for (const i of probed) {
      const { x, y } = centers[i]
      chip(ctx, p, `C${String(i).padStart(2, "0")}  ${counts[i]}`, Math.min(x + 10, w - 88), Math.max(20, y - 16))
    }
  },
}

export function Voronoi() {
  return <SceneCanvas scene={scene} />
}
