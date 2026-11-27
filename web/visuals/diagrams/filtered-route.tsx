"use client"

import { clamp, ease, neighborGraph, rng, spread, type Point } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  label,
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
  textWidth,
} from "./lib"

// One-stage filtering (home, "Efficient, One-Stage Filtering", design lead, 2026-11-26), from the Space page's graph
// route: a greedy search on a proximity graph that checks the filter as it goes, the way Qdrant's filterable HNSW
// index works (docs: manage-data/indexing#filterable-hnsw-index and articles/filterable-hnsw, checked 2026-11-26).
// Points either match the payload filter (filled) or don't (hollow). Besides the graph's own edges, extra edges are
// built from the indexed payload values, so the matching points stay connected. From the entry the search checks each
// neighbor: points that fail the filter are skipped on the spot, and it hops to the matching neighbor nearest the
// query until none is nearer. No pre-filtering pass and no post-filtering: the result already matches. The route is
// computed, not drawn by hand.

const N = 84
const MATCH = 0.45
const CHECK = 0.34
const MOVE = 0.38
const HOLD = 3.4
const FADE = 0.8
const FILTER = ["FILTER", "CATEGORY = ELECTRONICS"] as const

type Step = { from: number; to: number; candidates: number[]; start: number }
type Search = {
  query: Point
  steps: Step[]
  target: number
  evals: number
  skipped: number
  length: number
}
type State = {
  w: number
  h: number
  p: Palette
  box: { x: number; y: number; size: number }
  nodes: Point[]
  match: boolean[]
  adjacency: number[][]
  edges: [number, number][]
  extra: [number, number][]
  names: string[]
  entry: number
  cycle: number
  since: number
  search: Search
  still: boolean
}

function plan(
  s: Pick<State, "nodes" | "match" | "adjacency" | "entry">,
  aspect: number,
  cycle: number
): Search {
  const { nodes, match, adjacency, entry } = s
  const rand = rng(300 + cycle)
  let best: Search | null = null
  for (let attempt = 0; attempt < 16; attempt++) {
    const query = { x: aspect * (0.45 + rand() * 0.5), y: 0.3 + rand() * 0.6 }
    const d = (i: number) =>
      Math.hypot(nodes[i]!.x - query.x, nodes[i]!.y - query.y)
    const seen = new Set([entry])
    let skipped = 0
    const steps: Step[] = []
    let current = entry
    let clock = 0.6
    for (;;) {
      const candidates = adjacency[current]!
      let next = current
      for (const n of candidates) {
        if (!seen.has(n)) {
          seen.add(n)
          if (!match[n]) skipped += 1
        }
        if (match[n] && d(n) < d(next)) next = n
      }
      steps.push({ from: current, to: next, candidates, start: clock })
      clock += next === current ? CHECK : CHECK + MOVE
      if (next === current) break
      current = next
    }
    let truth = entry
    nodes.forEach((_, i) => {
      if (match[i] && d(i) < d(truth)) truth = i
    })
    const search = {
      query,
      steps,
      target: current,
      evals: seen.size,
      skipped,
      length: clock,
    }
    // A search that finds the true nearest matching point, with a few hops to watch.
    if (truth === current && steps.length > 4) return search
    if (!best || (truth === current && steps.length > best.steps.length))
      best = search
  }
  return best as Search
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const left = 28
    const box = { x: left, y: 52, size: h - 52 - 44 }
    const aspect = (w - left - 28) / box.size
    const rand = rng(23)
    const nodes = spread(N, aspect, 1, rand)
    const match = nodes.map(() => rand() < MATCH)
    const { adjacency: base, edges } = neighborGraph(nodes, 3)
    // The payload edges: a neighbor graph of the matching points alone, added to the graph.
    const members = nodes.map((_, i) => i).filter((i) => match[i])
    const sub = neighborGraph(
      members.map((i) => nodes[i]!),
      2
    )
    const have = new Set(edges.map(([a, b]) => `${a}-${b}`))
    const extra: [number, number][] = []
    const adjacency = base.map((list) => [...list])
    for (const [a, b] of sub.edges) {
      const i = members[a]!
      const j = members[b]!
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (have.has(key)) continue
      extra.push([i, j])
      adjacency[i]!.push(j)
      adjacency[j]!.push(i)
    }
    let entry = members[0]!
    for (const i of members)
      if (nodes[i]!.x + nodes[i]!.y < nodes[entry]!.x + nodes[entry]!.y)
        entry = i
    const graph = { nodes, match, adjacency, entry }
    return {
      w,
      h,
      p,
      box,
      ...graph,
      edges,
      extra,
      names: ids(N, rand),
      cycle: 0,
      since: 0,
      search: plan(graph, aspect, 0),
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, nodes, match, box } = s
    let elapsed = t - s.since
    if (elapsed > s.search.length + HOLD + FADE) {
      s.cycle += 1
      s.since = t
      s.search = plan(s, (w - box.x - 28) / box.size, s.cycle)
      elapsed = 0
    }
    if (s.still) elapsed = s.search.length + 1
    const { steps, query, target } = s.search
    const fade = 1 - clamp((elapsed - s.search.length - HOLD) / FADE)
    const at = (q: Point) => ({
      x: box.x + q.x * box.size,
      y: box.y + q.y * box.size,
    })
    const d = (i: number) =>
      Math.hypot(nodes[i]!.x - query.x, nodes[i]!.y - query.y)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The filter, top left.
    labelRow(
      ctx,
      p,
      [
        [FILTER[0], p.label],
        [FILTER[1], p.star],
      ],
      28,
      24
    )

    // The graph's own edges, then the payload edges between matching points.
    ctx.strokeStyle = alpha(p.line, 0.55)
    ctx.beginPath()
    for (const [i, j] of s.edges) {
      const a = at(nodes[i]!)
      const b = at(nodes[j]!)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
    ctx.stroke()
    ctx.strokeStyle = alpha(p.glow, 0.32)
    ctx.beginPath()
    for (const [i, j] of s.extra) {
      const a = at(nodes[i]!)
      const b = at(nodes[j]!)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
    ctx.stroke()

    // Checked edges: bright while a step checks them, then faint. Neighbors that fail the filter are skipped.
    const visited = new Set([s.entry])
    const checked = new Set<number>()
    for (const step of steps) {
      const k = (elapsed - step.start) / CHECK
      if (k <= 0) continue
      const live = k < 1
      const from = at(nodes[step.from]!)
      ctx.setLineDash([2, 3])
      for (const n of step.candidates) {
        const to = at(nodes[n]!)
        const reach = live ? ease(k * 1.4) : 1
        ctx.strokeStyle = match[n]
          ? alpha(p.glow, (live ? 0.75 : 0.22) * fade)
          : alpha(p.dim, (live ? 0.6 : 0.18) * fade)
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(
          from.x + (to.x - from.x) * reach,
          from.y + (to.y - from.y) * reach
        )
        ctx.stroke()
        checked.add(n)
      }
      ctx.setLineDash([])
      if (step.to !== step.from && elapsed >= step.start + CHECK + MOVE)
        visited.add(step.to)
    }

    // Hops, drawn as they happen.
    ctx.lineWidth = 1.5
    ctx.strokeStyle = alpha(p.glow, fade)
    for (const step of steps) {
      if (step.to === step.from) continue
      const k = ease((elapsed - step.start - CHECK) / MOVE)
      if (k <= 0) continue
      const a = at(nodes[step.from]!)
      const b = at(nodes[step.to]!)
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
      ctx.stroke()
    }
    ctx.lineWidth = 1

    // Points: matching filled, the rest hollow; visited bright; a skipped point gets a small cross.
    nodes.forEach((n, i) => {
      const { x, y } = at(n)
      const on = visited.has(i)
      if (match[i]) {
        ctx.fillStyle = on ? alpha(p.bright, Math.max(0.35, fade)) : p.label
        ctx.beginPath()
        ctx.arc(x, y, on ? 3.2 : 2.2, 0, TAU)
        ctx.fill()
      } else {
        ctx.strokeStyle = alpha(p.dim, 0.9)
        ctx.beginPath()
        ctx.arc(x, y, 2.4, 0, TAU)
        ctx.stroke()
      }
      if (!checked.has(i) || on) return
      if (match[i]) {
        ctx.strokeStyle = alpha(p.glow, 0.5 * fade)
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, TAU)
        ctx.stroke()
      } else {
        ctx.strokeStyle = alpha(p.label, 0.8 * fade)
        ctx.beginPath()
        ctx.moveTo(x - 3.5, y - 3.5)
        ctx.lineTo(x + 3.5, y + 3.5)
        ctx.moveTo(x + 3.5, y - 3.5)
        ctx.lineTo(x - 3.5, y + 3.5)
        ctx.stroke()
      }
    })
    const entry = at(nodes[s.entry]!)
    label(ctx, p, "ENTRY", entry.x + 8, entry.y - 10)

    const q = at(query)
    crosshair(ctx, p, q.x, q.y)

    // The result, then its readout: it already matches the filter.
    const done = clamp((elapsed - s.search.length) / 0.3) * fade
    if (done > 0) {
      const { x, y } = at(nodes[target]!)
      ctx.globalAlpha = done
      ctx.strokeStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      const text = [
        s.names[target]!,
        [d(target).toFixed(3), p.label],
        "MATCHES",
      ] as (string | [string, string])[]
      const width =
        textWidth(
          ctx,
          p,
          text
            .map((part) => (typeof part === "string" ? part : part[0]))
            .join("  ")
        ) + 16
      const left = x + 14 + width < w - 8 ? x + 14 : x - 14 - width
      readout(
        ctx,
        p,
        text,
        clamp(left, 8, w - width - 8),
        Math.min(Math.max(y + 22, 60), h - 56),
        { opacity: done }
      )
    }

    // The legend and the count, along the bottom.
    const y = h - 20
    ctx.fillStyle = p.label
    ctx.beginPath()
    ctx.arc(32, y, 2.2, 0, TAU)
    ctx.fill()
    label(ctx, p, "MATCHES", 42, y - 6)
    ctx.strokeStyle = p.dim
    ctx.beginPath()
    ctx.arc(118, y, 2.4, 0, TAU)
    ctx.stroke()
    label(ctx, p, "NO MATCH", 128, y - 6)
    ctx.strokeStyle = alpha(p.glow, 0.6)
    ctx.beginPath()
    ctx.moveTo(210, y)
    ctx.lineTo(228, y)
    ctx.stroke()
    label(ctx, p, "PAYLOAD EDGE", 236, y - 6)
    if (w >= 520 && done > 0) {
      const count = `${s.search.evals} CHECKED  ${s.search.skipped} SKIPPED`
      label(ctx, p, count, w - 28 - textWidth(ctx, p, count), y - 6, {
        opacity: done,
      })
    }
  },
}

export function FilteredRoute() {
  return <SceneCanvas scene={scene} />
}
