"use client"

import { clamp, ease, neighborGraph, rng, spread, type Point } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, crosshair, ids, prefersStill, readout, textWidth } from "./lib"

// Graph route: a flat proximity graph and a greedy search on it. From the entry node the search checks each
// neighbor, hops to the one nearest the query, and repeats until no neighbor is nearer. The checked edges
// stay faint, each hop lights in turn and the log on the left lists the hops; the result reads out at the
// end. The route is computed, not drawn by hand.

const N = 84
const CHECK = 0.34
const MOVE = 0.38
const HOLD = 3.4
const FADE = 0.8

type Step = { from: number; to: number; candidates: number[]; start: number }
type Search = { query: Point; steps: Step[]; target: number; evals: number; length: number; exact: boolean }
type State = {
  w: number
  h: number
  p: Palette
  box: { x: number; y: number; size: number }
  nodes: Point[]
  adjacency: number[][]
  edges: [number, number][]
  names: string[]
  entry: number
  cycle: number
  since: number
  search: Search
  still: boolean
}

function plan(s: Pick<State, "nodes" | "adjacency" | "entry">, aspect: number, cycle: number): Search {
  const { nodes, adjacency, entry } = s
  const rand = rng(300 + cycle)
  let best: Search | null = null
  for (let attempt = 0; attempt < 16; attempt++) {
    const query = { x: aspect * (0.45 + rand() * 0.5), y: 0.35 + rand() * 0.6 }
    const d = (i: number) => Math.hypot(nodes[i].x - query.x, nodes[i].y - query.y)
    const seen = new Set([entry])
    const steps: Step[] = []
    let current = entry
    let clock = 0.6
    for (;;) {
      const candidates = adjacency[current]
      candidates.forEach((n) => seen.add(n))
      let next = current
      for (const n of candidates) if (d(n) < d(next)) next = n
      steps.push({ from: current, to: next, candidates, start: clock })
      clock += next === current ? CHECK : CHECK + MOVE
      if (next === current) break
      current = next
    }
    let truth = 0
    nodes.forEach((_, i) => {
      if (d(i) < d(truth)) truth = i
    })
    const search = { query, steps, target: current, evals: seen.size, length: clock, exact: truth === current }
    // Prefer a search that finds the true nearest node, then a longer route.
    const score = (search.exact ? 100 : 0) + steps.length
    if (!best || score > (best.exact ? 100 : 0) + best.steps.length) best = search
    if (search.exact && steps.length > 6) break
  }
  return best as Search
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const left = w >= 560 ? 200 : 28
    const box = { x: left, y: 32, size: h - 64 }
    const aspect = (w - left - 32) / box.size
    const rand = rng(23)
    const nodes = spread(N, aspect, 1, rand)
    const { adjacency, edges } = neighborGraph(nodes, 3)
    let entry = 0
    nodes.forEach((n, i) => {
      if (n.x + n.y < nodes[entry].x + nodes[entry].y) entry = i
    })
    const base = { nodes, adjacency, entry }
    return {
      w,
      h,
      p,
      box,
      ...base,
      edges,
      names: ids(N, rand),
      cycle: 0,
      since: 0,
      search: plan(base, aspect, 0),
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, nodes, box } = s
    let elapsed = t - s.since
    if (elapsed > s.search.length + HOLD + FADE) {
      s.cycle += 1
      s.since = t
      s.search = plan(s, (w - box.x - 32) / box.size, s.cycle)
      elapsed = 0
    }
    if (s.still) elapsed = s.search.length + 1
    const { steps, query, target } = s.search
    const fade = 1 - clamp((elapsed - s.search.length - HOLD) / FADE)
    const at = (q: Point) => ({ x: box.x + q.x * box.size, y: box.y + q.y * box.size })
    const d = (i: number) => Math.hypot(nodes[i].x - query.x, nodes[i].y - query.y)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The graph.
    ctx.strokeStyle = alpha(p.line, 0.6)
    ctx.beginPath()
    for (const [i, j] of s.edges) {
      const a = at(nodes[i])
      const b = at(nodes[j])
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
    ctx.stroke()

    // Checked edges: bright while a step checks them, then faint.
    const visited = new Set([s.entry])
    const checked = new Set<number>()
    for (const step of steps) {
      const k = (elapsed - step.start) / CHECK
      if (k <= 0) continue
      const live = k < 1
      const from = at(nodes[step.from])
      ctx.strokeStyle = alpha(p.glow, (live ? 0.75 : 0.22) * fade)
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      for (const n of step.candidates) {
        const to = at(nodes[n])
        const reach = live ? ease(k * 1.4) : 1
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(from.x + (to.x - from.x) * reach, from.y + (to.y - from.y) * reach)
        checked.add(n)
      }
      ctx.stroke()
      ctx.setLineDash([])
      if (step.to !== step.from && elapsed >= step.start + CHECK + MOVE) visited.add(step.to)
    }

    // Hops, drawn as they happen.
    ctx.lineWidth = 1.5
    ctx.strokeStyle = alpha(p.glow, fade)
    for (const step of steps) {
      if (step.to === step.from) continue
      const k = ease((elapsed - step.start - CHECK) / MOVE)
      if (k <= 0) continue
      const a = at(nodes[step.from])
      const b = at(nodes[step.to])
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
      ctx.stroke()
    }
    ctx.lineWidth = 1

    // Nodes: visited bright, checked ringed.
    nodes.forEach((n, i) => {
      const { x, y } = at(n)
      const on = visited.has(i)
      ctx.fillStyle = on ? alpha(p.bright, Math.max(0.35, fade)) : p.dim
      ctx.beginPath()
      ctx.arc(x, y, on ? 3 : 1.8, 0, TAU)
      ctx.fill()
      if (checked.has(i) && !on) {
        ctx.strokeStyle = alpha(p.glow, 0.5 * fade)
        ctx.beginPath()
        ctx.arc(x, y, 4.5, 0, TAU)
        ctx.stroke()
      }
    })
    const entry = at(nodes[s.entry])
    label(ctx, p, "ENTRY", entry.x + 8, entry.y - 10)

    const q = at(query)
    crosshair(ctx, p, q.x, q.y)

    // The result, then its readout.
    const done = clamp((elapsed - s.search.length) / 0.3) * fade
    const hops = steps.length - 1
    if (done > 0) {
      const { x, y } = at(nodes[target])
      ctx.globalAlpha = done
      ctx.strokeStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      const text = [s.names[target], [d(target).toFixed(3), p.label], `${hops} HOPS`, [`${s.search.evals} EVALS`, p.label]] as (
        | string
        | [string, string]
      )[]
      // Beside the result, on the side with room, inside the frame.
      const width = textWidth(ctx, p, text.map((part) => (typeof part === "string" ? part : part[0])).join("  ")) + 16
      const left = x + 14 + width < w - 8 ? x + 14 : x - 14 - width
      readout(ctx, p, text, clamp(left, 8, w - width - 8), Math.min(Math.max(y + 22, 24), h - 20), { opacity: done })
    }

    // The hop log.
    if (box.x > 100) {
      label(ctx, p, "HOP  ID     DIST", 24, 40)
      const rows = [{ node: s.entry, at: 0 }, ...steps.filter((st) => st.to !== st.from).map((st) => ({ node: st.to, at: st.start + CHECK }))]
      // The latest 14 hops, so a long route scrolls instead of running off the frame.
      const shown = rows.filter(({ at: start }) => elapsed >= start).length
      const skip = Math.max(0, shown - 14)
      rows.forEach(({ node, at: start }, r) => {
        const on = clamp((elapsed - start) / 0.2) * fade
        if (on <= 0 || r < skip) return
        const last = r === rows.length - 1 && done > 0
        label(ctx, p, `${String(r).padStart(2, "0")}   ${s.names[node]}  ${d(node).toFixed(3)}`, 24, 64 + (r - skip) * 18, {
          color: last ? p.star : p.label,
          opacity: on,
        })
      })
      if (done > 0)
        label(ctx, p, s.search.exact ? "EXACT NN" : "LOCAL MIN", 24, 64 + (rows.length - skip) * 18 + 8, {
          color: p.star,
          opacity: done,
        })
    }
  },
}

export function GraphRoute() {
  return <SceneCanvas scene={scene} />
}
