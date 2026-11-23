"use client"

import { rng, spread } from "../rand"
import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, calm, dotBatch, lineBatch } from "./lib"

// k-NN mesh: drifting points, each linked to its three nearest neighbors, found again every frame. Edges fade
// with distance and nodes pulse. One point is a query in the accent, its neighbors ringed and labeled with
// their scores.

const K = 3
const REACH = 160 // edges longer than this don't show

type Node = { x: number; y: number; ax: number; ay: number; fx: number; fy: number; ph: number }
type State = {
  w: number
  h: number
  p: Palette
  nodes: Node[]
  query: number
  xs: Float64Array
  ys: Float64Array
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(21)
    const target = Math.round((w * h) / 4600)
    // Evenly spread, then thinned toward the copy.
    const nodes = spread(Math.round(target * 1.5), w + 40, h + 40, rand, 6)
      .map(({ x, y }) => ({ x: x - 20, y: y - 20 }))
      .filter(({ x }) => rand() < calm(x, w, 0.25))
      .map(({ x, y }) => ({
        x,
        y,
        ax: 8 + rand() * 12,
        ay: 8 + rand() * 12,
        fx: 0.08 + rand() * 0.14,
        fy: 0.08 + rand() * 0.14,
        ph: rand() * TAU,
      }))
    let query = 0
    nodes.forEach((n, i) => {
      const q = nodes[query]
      if (Math.hypot(n.x - w * 0.72, n.y - h * 0.46) < Math.hypot(q.x - w * 0.72, q.y - h * 0.46))
        query = i
    })
    return {
      w,
      h,
      p,
      nodes,
      query,
      xs: new Float64Array(nodes.length),
      ys: new Float64Array(nodes.length),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, nodes, xs, ys } = s
    clear(ctx, p, w, h)
    const n = nodes.length
    if (!n) return
    nodes.forEach((node, i) => {
      xs[i] = node.x + node.ax * Math.sin(t * node.fx + node.ph)
      ys[i] = node.y + node.ay * Math.cos(t * node.fy + node.ph * 1.3)
    })

    // Each node's K nearest, as edges without repeats.
    const edges = lineBatch(8)
    const seen = new Set<number>()
    let queryNear: number[] = []
    const best = new Array<number>(K)
    const bestD = new Array<number>(K)
    for (let i = 0; i < n; i++) {
      best.fill(-1)
      bestD.fill(Infinity)
      for (let j = 0; j < n; j++) {
        if (j === i) continue
        const d = (xs[i] - xs[j]) ** 2 + (ys[i] - ys[j]) ** 2
        if (d >= bestD[K - 1]) continue
        let k = K - 1
        while (k > 0 && bestD[k - 1] > d) {
          bestD[k] = bestD[k - 1]
          best[k] = best[k - 1]
          k--
        }
        bestD[k] = d
        best[k] = j
      }
      if (i === s.query) queryNear = best.filter((j) => j >= 0)
      for (let k = 0; k < K; k++) {
        const j = best[k]
        if (j < 0) continue
        const key = i < j ? i * n + j : j * n + i
        if (seen.has(key)) continue
        seen.add(key)
        const d = Math.sqrt(bestD[k])
        if (d > REACH) continue
        const a = (1 - d / REACH) ** 1.2 * Math.min(calm(xs[i], w, 0.1), calm(xs[j], w, 0.1)) * 0.7
        edges.add(xs[i], ys[i], xs[j], ys[j], a)
      }
    }
    edges.stroke(ctx, p.glow)

    // Nodes, pulsing.
    const dots = dotBatch(8)
    nodes.forEach((node, i) => {
      if (i === s.query) return
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.1 + node.ph * 3)
      dots.add(xs[i], ys[i], 1.3 + 0.9 * pulse, (0.45 + 0.55 * pulse) * calm(xs[i], w, 0.1))
    })
    dots.fill(ctx, p.star)

    // The query and its neighbors, with a score that falls with distance.
    const qx = xs[s.query]
    const qy = ys[s.query]
    ctx.strokeStyle = p.bright
    ctx.lineWidth = 1
    ctx.beginPath()
    for (const j of queryNear) {
      ctx.moveTo(qx, qy)
      ctx.lineTo(xs[j], ys[j])
      ctx.moveTo(xs[j] + 5, ys[j])
      ctx.arc(xs[j], ys[j], 5, 0, TAU)
    }
    ctx.stroke()
    for (const j of queryNear) {
      const score = 1 - Math.hypot(xs[j] - qx, ys[j] - qy) / (w * 0.8)
      const right = xs[j] < w - 64
      label(ctx, p, score.toFixed(3), xs[j] + (right ? 10 : -10), ys[j] - 10, {
        align: right ? "left" : "right",
      })
    }
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.arc(qx, qy, 3, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = p.accent
    ctx.beginPath()
    ctx.arc(qx, qy, 8, 0, TAU)
    ctx.stroke()
  },
}

export function Plexus() {
  return <SceneCanvas scene={scene} />
}
