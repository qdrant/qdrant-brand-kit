"use client"

import { clamp, ease, neighborGraph, rng, spread, type Point } from "./rand"
import { SceneCanvas, clear, alpha, chip, label, type CanvasScene, type Palette } from "./scene"

// Navigator (HNSW): three stacked, translucent planes of stars, the layers of a search graph. A search
// enters at the top, hops greedily toward the query, drops a layer, and repeats until it reaches the nearest
// star, which lights in the accent with a readout. Then a new query. The route is computed, not drawn by hand.

const COUNTS = [120, 28, 7] // stars on layers 0, 1 and 2; each layer's stars are the first n of the one below
const K = [3, 3, 2]
const HOP = 0.42
const DROP = 0.5
const HOLD = 3.2
const FADE = 0.8

type Segment = { layer: number; a: number; b: number; drop: boolean; start: number; end: number }
type Search = { query: Point; route: Segment[]; target: number; hops: number; length: number }
type State = {
  w: number
  h: number
  p: Palette
  nodes: Point[]
  graphs: { edges: [number, number][]; adjacency: number[][] }[]
  still: boolean
  cycle: number
  since: number
  search: Search
}

function plan(nodes: Point[], graphs: State["graphs"], cycle: number): Search {
  const rand = rng(100 + cycle)
  const distance = (i: number, q: Point) => Math.hypot(nodes[i].x - q.x, nodes[i].y - q.y)
  let best: Search | null = null
  for (let attempt = 0; attempt < 12; attempt++) {
    const query = { x: 0.1 + rand() * 0.8, y: 0.1 + rand() * 0.8 }
    const route: Segment[] = []
    let current = 0
    let clock = 0.4
    let hops = 0
    for (let layer = 2; layer >= 0; layer--) {
      for (;;) {
        let next = current
        for (const n of graphs[layer].adjacency[current])
          if (distance(n, query) < distance(next, query)) next = n
        if (next === current) break
        route.push({ layer, a: current, b: next, drop: false, start: clock, end: clock + HOP })
        clock += HOP
        hops += 1
        current = next
      }
      if (layer > 0) {
        route.push({ layer, a: current, b: current, drop: true, start: clock, end: clock + DROP })
        clock += DROP
      }
    }
    const search = { query, route, target: current, hops, length: clock }
    if (!best || hops > best.hops) best = search
    if (hops >= 5) break
  }
  return best as Search
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(21)
    const nodes = spread(COUNTS[0], 0.86, 0.86, rand).map(({ x, y }) => ({ x: x + 0.07, y: y + 0.07 }))
    const graphs = COUNTS.map((count, layer) => {
      const { edges, adjacency } = neighborGraph(nodes.slice(0, count), K[layer])
      return { edges, adjacency }
    })
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    return { w, h, p, nodes, graphs, still, cycle: 0, since: 0, search: plan(nodes, graphs, 0) }
  },
  draw(ctx, s, t) {
    const { p, w, h, nodes } = s
    let elapsed = t - s.since
    if (elapsed > s.search.length + HOLD + FADE) {
      s.cycle += 1
      s.since = t
      s.search = plan(nodes, s.graphs, s.cycle)
      elapsed = 0
    }
    if (s.still) elapsed = s.search.length + 1
    const { route, query, target } = s.search
    const fade = 1 - clamp((elapsed - s.search.length - HOLD) / FADE)

    const A = Math.min(w * 0.38, h * 0.445)
    const G = A * 0.5
    const cx = w * 0.46
    const cy = h * 0.5
    const levelY = (layer: number) => cy + (1 - layer) * G + Math.sin(t * 0.6 + layer * 1.3) * 2
    const at = (q: Point, layer: number) => ({
      x: cx + (q.x - q.y) * A,
      y: levelY(layer) + (q.x + q.y - 1) * A * 0.42,
    })
    const visited = new Set<string>([`2:0`])
    for (const seg of route)
      if (elapsed >= seg.end) visited.add(`${seg.drop ? seg.layer - 1 : seg.layer}:${seg.b}`)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    for (let layer = 0; layer <= 2; layer++) {
      // Drops from the layer above land on this one, under the plane above.
      for (const seg of route) {
        if (!seg.drop || seg.layer !== layer + 1) continue
        const k = ease((elapsed - seg.start) / (seg.end - seg.start))
        if (k <= 0) continue
        const from = at(nodes[seg.a], layer + 1)
        const to = at(nodes[seg.a], layer)
        ctx.globalAlpha = fade
        ctx.strokeStyle = p.glow
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(from.x, from.y + (to.y - from.y) * k)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      // The plane: translucent glass with a quarter grid.
      const corners = [
        at({ x: 0, y: 0 }, layer),
        at({ x: 1, y: 0 }, layer),
        at({ x: 1, y: 1 }, layer),
        at({ x: 0, y: 1 }, layer),
      ]
      ctx.beginPath()
      corners.forEach(({ x, y }, i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
      ctx.fillStyle = alpha(p.surface, 0.62)
      ctx.fill()
      ctx.strokeStyle = p.line
      ctx.stroke()
      ctx.strokeStyle = p.grid
      ctx.beginPath()
      for (const f of [0.25, 0.5, 0.75]) {
        const a = at({ x: f, y: 0 }, layer)
        const b = at({ x: f, y: 1 }, layer)
        const c = at({ x: 0, y: f }, layer)
        const d = at({ x: 1, y: f }, layer)
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.moveTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
      }
      ctx.stroke()
      label(ctx, p, `L${layer}  ${COUNTS[layer]}`, corners[1].x + 12, corners[1].y)

      // The layer's graph and stars.
      ctx.strokeStyle = alpha(p.line, 0.55)
      ctx.beginPath()
      for (const [i, j] of s.graphs[layer].edges) {
        const a = at(nodes[i], layer)
        const b = at(nodes[j], layer)
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
      ctx.stroke()
      const r = [1.4, 2, 2.6][layer]
      for (let i = 0; i < COUNTS[layer]; i++) {
        const { x, y } = at(nodes[i], layer)
        const on = visited.has(`${layer}:${i}`)
        ctx.fillStyle = on ? alpha(p.bright, Math.max(fade, 0.001)) : p.dim
        ctx.beginPath()
        ctx.arc(x, y, on ? r + 0.8 : r, 0, Math.PI * 2)
        ctx.fill()
      }

      // The query's position on this layer.
      const q = at(query, layer)
      ctx.strokeStyle = alpha(p.accent, layer === 0 ? 0.9 : 0.4)
      ctx.beginPath()
      ctx.moveTo(q.x - 5, q.y)
      ctx.lineTo(q.x + 5, q.y)
      ctx.moveTo(q.x, q.y - 5)
      ctx.lineTo(q.x, q.y + 5)
      ctx.stroke()

      // Hops on this layer, drawn as they happen.
      ctx.lineWidth = 1.5
      ctx.strokeStyle = alpha(p.glow, fade)
      for (const seg of route) {
        if (seg.drop || seg.layer !== layer) continue
        const k = ease((elapsed - seg.start) / (seg.end - seg.start))
        if (k <= 0) continue
        const a = at(nodes[seg.a], layer)
        const b = at(nodes[seg.b], layer)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
        ctx.stroke()
      }
      ctx.lineWidth = 1
    }

    // The search's head, then the result and its readout.
    const live = route.find((seg) => elapsed >= seg.start && elapsed < seg.end)
    if (live) {
      const k = ease((elapsed - live.start) / (live.end - live.start))
      const a = at(nodes[live.a], live.layer)
      const b = live.drop ? at(nodes[live.a], live.layer - 1) : at(nodes[live.b], live.layer)
      const x = a.x + (b.x - a.x) * k
      const y = a.y + (b.y - a.y) * k
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 14)
      glow.addColorStop(0, alpha(p.glow, 0.6))
      glow.addColorStop(1, alpha(p.glow, 0))
      ctx.fillStyle = glow
      ctx.fillRect(x - 14, y - 14, 28, 28)
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
    const done = clamp((elapsed - s.search.length) / 0.3) * fade
    if (done > 0) {
      const { x, y } = at(nodes[target], 0)
      ctx.globalAlpha = done
      ctx.fillStyle = p.accent
      ctx.beginPath()
      ctx.arc(x, y, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = p.accent
      ctx.beginPath()
      ctx.arc(x, y, 7 + ((elapsed - s.search.length) % 1.6) * 6, 0, Math.PI * 2)
      ctx.globalAlpha = done * (1 - ((elapsed - s.search.length) % 1.6) / 1.6)
      ctx.stroke()
      ctx.globalAlpha = 1
      const score = (1 - Math.hypot(nodes[target].x - query.x, nodes[target].y - query.y) * 0.8).toFixed(3)
      const text = `#${String(1000 + ((target * 7919) % 9000))}  ${score}  ${s.search.hops} HOPS`
      ctx.font = `500 12px ${p.mono}`
      const width = ctx.measureText(text).width + 16
      chip(ctx, p, text, Math.min(x + 14, w - width - 8), Math.min(y + 22, h - 20), done)
    }
  },
}

export function Navigator() {
  return <SceneCanvas scene={scene} />
}
