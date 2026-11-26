"use client"

import { clamp, ease, neighborGraph, rng, spread, type Point } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import {
  TAU,
  crosshair,
  ids,
  labelRow,
  prefersStill,
  readout,
  type Pt,
} from "./lib"

// The HNSW search (qdrant.tech/documentation/concepts/indexing, "Vector Index", checked 2026-11-26): the index is a
// multi-layer navigation structure, sparse at the top, where nodes are far apart, and dense at the bottom. A search
// starts in the uppermost layer, finds the node closest to the query there, and goes down a layer to do the same,
// until the bottom layer, where the nearest neighbors are. Three layers drawn as planes in perspective, every node of
// an upper layer also in the layers under it (so a drop is a straight line down). The query is the same point on
// every plane. Each cycle a new query: the greedy path builds up hop by hop, then the 3 nearest neighbors and their
// results. The edges per node are fewer than the default m (16), for legibility; ids and scores are illustrative.

const CYCLE = 12
const STEP = 0.32
const START = 1.0
const K = 3
// Nodes per layer, top to bottom, and the edges drawn per node.
const LAYERS = [
  { n: 7, k: 2 },
  { n: 26, k: 2 },
  { n: 110, k: 3 },
] as const

type Layer = { edges: [number, number][]; adjacency: number[][] }
type Move = { layer: number; from: number; to: number; drop: boolean }
type Run = { q: Point; moves: Move[]; hits: { i: number; d: number }[] }
type State = {
  w: number
  h: number
  p: Palette
  nodes: Point[]
  layers: Layer[]
  names: string[]
  cycle: number
  run: Run
  still: boolean
}

const d2 = (a: Point, b: Point) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

// The greedy search: in each layer, move to the neighbor closest to the query until none is closer, then go down.
function search(nodes: Point[], layers: Layer[], q: Point): Move[] {
  const moves: Move[] = []
  let at = 0
  layers.forEach((layer, l) => {
    if (l > 0) moves.push({ layer: l, from: at, to: at, drop: true })
    for (;;) {
      let best = at
      for (const j of layer.adjacency[at] ?? [])
        if (d2(nodes[j]!, q) < d2(nodes[best]!, q)) best = j
      if (best === at) break
      moves.push({ layer: l, from: at, to: best, drop: false })
      at = best
    }
  })
  return moves
}

function make(cycle: number, nodes: Point[], layers: Layer[]): Run {
  const rand = rng(401 + cycle * 7)
  // A query far enough from the entry point (node 0) that the path crosses the planes.
  let q: Point = { x: 0.5, y: 0.5 }
  for (let tries = 0; tries < 20; tries++) {
    q = { x: 0.12 + rand() * 0.76, y: 0.3 + rand() * 0.4 }
    if (Math.sqrt(d2(q, nodes[0]!)) > 0.45) break
  }
  const hits = nodes
    .map((pt, i) => ({ i, d: Math.sqrt(d2(pt, q)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, K)
  return { q, moves: search(nodes, layers, q), hits }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(1717)
    // The bottom layer's nodes, spread evenly; each upper layer is the first n of them.
    const nodes = spread(LAYERS[2].n, 1, 1, rand, 12).map((pt) => ({
      x: 0.04 + pt.x * 0.92,
      y: 0.08 + pt.y * 0.84,
    }))
    const layers = LAYERS.map(({ n, k }) => {
      const { edges, adjacency } = neighborGraph(nodes.slice(0, n), k)
      while (adjacency.length < nodes.length) adjacency.push([])
      return { edges, adjacency }
    })
    return {
      w,
      h,
      p,
      nodes,
      layers,
      names: ids(nodes.length, rand),
      cycle: 0,
      run: make(0, nodes, layers),
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, nodes, layers } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.run = make(cycle, nodes, layers)
    }
    const e = s.still ? CYCLE - 2 : t % CYCLE
    const fade = clamp(e / 0.5) * (1 - clamp((e - (CYCLE - 1.2)) / 1))
    const { q, moves, hits } = s.run

    // Wide, the layer names sit on the left and the results on the right; narrow, the planes take the width.
    const wide = w >= 720
    const left = wide ? Math.round(clamp(w * 0.12, 96, 150)) : 40
    const right = wide ? Math.round(clamp(w * 0.2, 190, 250)) : 12
    const pad = Math.round(clamp(h * 0.07, 12, 22))
    const PD = Math.round(clamp(h * 0.22, 36, 68))
    const gap = (h - 2 * pad - PD) / 2
    const SH = Math.round(PD * 1.1)
    const PW = w - left - right - SH
    const top = (l: number) => Math.round(pad + l * gap)
    // A point on a layer's plane: the back edge (y = 0) is shifted right, so the plane recedes.
    const at = (l: number, pt: Point): Pt => ({
      x: left + pt.x * PW + (1 - pt.y) * SH,
      y: top(l) + pt.y * PD,
    })

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The query's axis: the same point on every plane, so one vertical line.
    const qs = layers.map((_, l) => at(l, q))
    ctx.save()
    ctx.setLineDash([2, 4])
    ctx.strokeStyle = alpha(p.label, 0.5 * fade)
    ctx.beginPath()
    ctx.moveTo(qs[0]!.x, qs[0]!.y)
    ctx.lineTo(qs[2]!.x, qs[2]!.y)
    ctx.stroke()
    ctx.restore()

    // The planes, their edges and nodes.
    LAYERS.forEach(({ n }, l) => {
      const corners = [
        at(l, { x: 0, y: 0 }),
        at(l, { x: 1, y: 0 }),
        at(l, { x: 1, y: 1 }),
        at(l, { x: 0, y: 1 }),
      ]
      ctx.beginPath()
      corners.forEach((c, i) =>
        i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)
      )
      ctx.closePath()
      ctx.fillStyle = alpha(p.glow, 0.05 * fade)
      ctx.fill()
      ctx.strokeStyle = alpha(p.line, fade)
      ctx.stroke()

      ctx.strokeStyle = alpha(p.dim, (l === 2 ? 0.35 : 0.5) * fade)
      ctx.beginPath()
      for (const [a, b] of layers[l]!.edges) {
        const pa = at(l, nodes[a]!)
        const pb = at(l, nodes[b]!)
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
      }
      ctx.stroke()

      ctx.fillStyle = alpha(p.star, (l === 2 ? 0.55 : 0.75) * fade)
      ctx.beginPath()
      const r = l === 2 ? 1.3 : l === 1 ? 1.8 : 2.2
      for (let i = 0; i < n; i++) {
        const pt = at(l, nodes[i]!)
        ctx.moveTo(pt.x + r, pt.y)
        ctx.arc(pt.x, pt.y, r, 0, TAU)
      }
      ctx.fill()

      labelRow(
        ctx,
        p,
        [[wide ? `LAYER ${2 - l}` : `L${2 - l}`, p.label]],
        corners[3]!.x - 14,
        top(l) + PD / 2,
        { align: "right", opacity: fade }
      )
    })

    // The path, hop by hop: hops along the edges in a layer, drops straight down to the next layer.
    const active = (() => {
      const k = Math.floor((e - START) / STEP)
      return k < 0
        ? 0
        : Math.min(2, moves[Math.min(k, moves.length - 1)]?.layer ?? 0)
    })()
    const done = START + moves.length * STEP
    moves.forEach((m, k) => {
      const u = ease((e - START - k * STEP) / STEP)
      if (u <= 0) return
      const a = at(m.drop ? m.layer - 1 : m.layer, nodes[m.from]!)
      const b = at(m.layer, nodes[m.to]!)
      ctx.save()
      if (m.drop) ctx.setLineDash([3, 3])
      ctx.strokeStyle = alpha(m.drop ? p.glow : p.bright, 0.95 * fade)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u)
      ctx.stroke()
      ctx.restore()
      if (u >= 1) {
        ctx.fillStyle = alpha(p.bright, fade)
        ctx.beginPath()
        ctx.arc(b.x, b.y, 3, 0, TAU)
        ctx.fill()
      }
    })
    // The entry point, at the top.
    const entry = at(0, nodes[0]!)
    const shown = clamp((e - 0.6) / 0.3) * fade
    ctx.fillStyle = alpha(p.bright, shown)
    ctx.beginPath()
    ctx.arc(entry.x, entry.y, 3, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = alpha(p.bright, 0.6 * shown)
    ctx.beginPath()
    ctx.arc(entry.x, entry.y, 6.5, 0, TAU)
    ctx.stroke()

    // The query on each plane: strong on the layer being searched.
    qs.forEach((pt, l) => {
      crosshair(ctx, p, pt.x, pt.y, (l === active ? 1 : 0.3) * fade)
    })

    // The nearest neighbors in the bottom layer, then the results.
    const found = clamp((e - done - 0.1) / 0.4) * fade
    hits.forEach(({ i }, rank) => {
      const on = clamp((e - done - 0.1 - rank * 0.15) / 0.3) * fade
      if (on <= 0) return
      const pt = at(2, nodes[i]!)
      ctx.strokeStyle = alpha(rank === 0 ? p.accent : p.bright, on)
      ctx.lineWidth = rank === 0 ? 1.5 : 1
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, 6, 0, TAU)
      ctx.stroke()
      ctx.lineWidth = 1
    })

    if (wide) {
      const rx = w - right + 36
      readout(
        ctx,
        p,
        ["HNSW", [`${moves.filter((m) => !m.drop).length} HOPS`, p.label]],
        rx,
        top(0) + PD / 2,
        { opacity: clamp((e - START) / 0.4) * fade }
      )
      const ry = top(2) + PD / 2
      hits.forEach(({ i, d }, rank) => {
        const on = clamp((e - done - 0.4 - rank * 0.15) / 0.3) * fade
        if (on <= 0) return
        const y = ry + (rank - 1) * 30
        const pt = at(2, nodes[i]!)
        ctx.strokeStyle = alpha(p.glow, 0.45 * on)
        ctx.beginPath()
        ctx.moveTo(pt.x + 7, pt.y)
        ctx.lineTo(rx - 6, y)
        ctx.stroke()
        readout(
          ctx,
          p,
          [s.names[i]!, [(1 - d * 0.6).toFixed(3), p.label]],
          rx,
          y,
          { opacity: on, mark: rank === 0 ? p.accent : undefined }
        )
      })
      labelRow(ctx, p, [[`TOP ${K}`, p.label]], rx, ry - 30 - 26, {
        opacity: found,
      })
    }
  },
}

export function HnswLayers() {
  return <SceneCanvas scene={scene} />
}
