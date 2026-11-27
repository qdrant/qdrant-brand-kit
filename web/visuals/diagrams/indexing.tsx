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
  arrow,
  crosshair,
  ids,
  labelRow,
  prefersStill,
  readout,
  textWidth,
} from "./lib"

// Real-time indexing (qdrant.tech/documentation/ops-optimization/optimizer and /manage-data/storage): each upsert
// goes to the write-ahead log, then into the appendable segment, where it is searchable at once (a small segment is
// searched by full scan). A query mid-way searches both kinds of segment at once and gets results from both, the
// point just written among them. Once the appendable segment passes indexing_threshold, the optimizer builds an
// HNSW index in the background for that segment only, while it stays readable; the indexed segment already there
// is left as it is. No whole-index rebuild.

const CYCLE = 12
const POINTS = 8
const OLD = 12
const UPSERT = (i: number) => 0.6 + i * 0.5
const QUERY = 2.4
const OPTIMIZE = 4.8
const BUILT = 8

type Graph = {
  nodes: Point[]
  edges: [number, number][]
  adjacency: number[][]
}
type Run = {
  fresh: string[]
  old: string[]
  seg1: Graph
  seg2: Graph
  route: number[]
  hits: number[]
}
type State = {
  w: number
  h: number
  p: Palette
  cycle: number
  run: Run
  still: boolean
}

function graph(n: number, rand: () => number): Graph {
  const nodes = spread(n, 1, 1, rand)
  const { edges, adjacency } = neighborGraph(nodes, 2)
  return { nodes, edges, adjacency }
}

// The shortest hop path from a to b.
function path(adjacency: number[][], a: number, b: number) {
  const back = new Map<number, number>([[a, a]])
  const queue = [a]
  while (queue.length) {
    const i = queue.shift()!
    if (i === b) break
    for (const j of adjacency[i] ?? [])
      if (!back.has(j)) {
        back.set(j, i)
        queue.push(j)
      }
  }
  const out = [b]
  while (out[0] !== a && back.has(out[0]!)) out.unshift(back.get(out[0]!)!)
  return out
}

function make(cycle: number): Run {
  const rand = rng(530 + cycle)
  const names = ids(POINTS + OLD, rand)
  const seg1 = graph(OLD, rand)
  const seg2 = graph(POINTS, rand)
  const target = 1 + Math.floor(rand() * (OLD - 1))
  const route = path(seg1.adjacency, 0, target)
  const near =
    seg1.adjacency[target]!.find((j) => !route.includes(j)) ??
    seg1.adjacency[target]![0]!
  return {
    fresh: names.slice(0, POINTS),
    old: names.slice(POINTS),
    seg1,
    seg2,
    route,
    hits: [target, near],
  }
}

function box(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number
) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.roundRect(
    Math.round(x) + 0.5,
    Math.round(y) + 0.5,
    Math.round(w),
    Math.round(h),
    6
  )
  ctx.fillStyle = alpha(p.surface, 0.9)
  ctx.fill()
  ctx.strokeStyle = p.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  opacity: number
) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
  ctx.restore()
}

function ring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  opacity: number
) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.stroke()
  ctx.restore()
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, cycle: 0, run: make(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.run = make(cycle)
    }
    const e = s.still ? 6.5 : t % CYCLE
    const fade = clamp(e / 0.5) * (1 - clamp((e - (CYCLE - 1.2)) / 1))
    const { fresh, old, seg1, seg2, route, hits } = s.run

    const pad = Math.round(clamp(w * 0.045, 14, 28))
    const x0 = pad
    const x1 = w - pad
    const W = x1 - x0
    const spare = clamp((h - 330) / 220) // 0 on a phone, 1 at 552

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Row 1: the upsert, into the write-ahead log.
    const y1 = pad + 10
    const written = fresh.filter((_, i) => e >= UPSERT(i)).length
    const current = fresh[Math.max(0, written - 1)]!
    labelRow(
      ctx,
      p,
      [
        ["UPSERT", p.star],
        [written ? current : "", p.bright],
      ],
      x0,
      y1,
      { opacity: fade }
    )
    const cell = 10
    const slots = POINTS + 2
    const stripW = slots * (cell + 3) - 3
    const sx = x1 - stripW
    labelRow(ctx, p, [["WAL", p.star]], sx - 10, y1, {
      align: "right",
      opacity: fade,
    })
    const upsertEnd = x0 + textWidth(ctx, p, "UPSERT  #0000") + 10
    const walStart = sx - 10 - textWidth(ctx, p, "WAL") - 10
    ctx.strokeStyle = alpha(p.label, 0.8 * fade)
    if (walStart - upsertEnd > 16)
      arrow(ctx, { x: upsertEnd, y: y1 }, { x: walStart, y: y1 }, 5)
    for (let i = 0; i < slots; i++) {
      const x = sx + i * (cell + 3)
      ctx.strokeStyle = alpha(p.line, fade)
      ctx.strokeRect(x + 0.5, y1 - 7 + 0.5, cell, 14)
      if (i < 2) {
        ctx.fillStyle = alpha(p.line, fade)
        ctx.fillRect(x + 2, y1 - 5, cell - 3, 11)
      } else {
        const k = clamp((e - UPSERT(i - 2)) / 0.2)
        if (k > 0) {
          const recent = 1 - clamp((e - UPSERT(i - 2) - 0.4) / 0.6)
          ctx.fillStyle = alpha(
            recent > 0 ? p.bright : p.glow,
            k * fade * (0.6 + 0.4 * recent)
          )
          ctx.fillRect(x + 2, y1 - 5, cell - 3, 11)
        }
      }
    }

    // Row 2: the appendable segment.
    const yA = y1 + 30 + Math.round(spare * 16)
    const ah = 84 + Math.round(spare * 16)
    ctx.strokeStyle = alpha(p.label, 0.8 * fade)
    arrow(
      ctx,
      { x: sx + stripW / 2, y: y1 + 10 },
      { x: sx + stripW / 2, y: yA - 2 },
      5
    )
    box(ctx, p, x0, yA, W, ah, fade)
    const la = yA + 18
    labelRow(ctx, p, [["APPENDABLE SEGMENT", p.star]], x0 + 12, la, {
      opacity: fade,
    })
    labelRow(ctx, p, [["SEARCHABLE NOW", p.bright]], x1 - 12, la, {
      align: "right",
      opacity: fade,
    })
    const lb = yA + ah / 2 + 2
    const gone = clamp((e - BUILT - 0.3) / 0.6)
    const dx = Math.min(
      18,
      (W - 24 - textWidth(ctx, p, "FULL SCAN") - 24) / POINTS
    )
    const dotX = (i: number) => x0 + 18 + i * dx
    // The full scan: every point in the segment, in turn.
    const scanned = fresh.filter((_, i) => QUERY >= UPSERT(i) + 0.25).length
    const scan = (e - 3) / 0.6
    for (let i = 0; i < POINTS; i++) {
      const on = clamp((e - UPSERT(i) - 0.25) / 0.25) * (1 - gone) * fade
      const lit =
        i < scanned && scan >= i / scanned && scan < (i + 1) / scanned + 0.15
      dot(ctx, dotX(i), lb, 3.5, lit ? p.bright : p.glow, on)
    }
    const match = scanned - 1
    ring(
      ctx,
      dotX(match),
      lb,
      7,
      p.bright,
      clamp((e - 3.6) / 0.3) * (1 - gone) * fade
    )
    labelRow(ctx, p, [["FULL SCAN", p.label]], x1 - 12, lb, {
      align: "right",
      opacity: fade,
    })
    // The fill, against indexing_threshold.
    const lc = yA + ah - 16
    const name = W > 300 ? "INDEXING_THRESHOLD" : "THRESHOLD"
    const bx = x0 + 12 + textWidth(ctx, p, name) + 12
    const bw = x1 - 12 - bx
    labelRow(ctx, p, [[name, p.label]], x0 + 12, lc, { opacity: fade })
    const filled =
      (fresh.reduce((n, _, i) => n + clamp((e - UPSERT(i) - 0.25) / 0.25), 0) -
        POINTS * gone) /
      POINTS
    ctx.fillStyle = alpha(p.line, fade)
    ctx.fillRect(bx, lc - 2, bw, 4)
    ctx.fillStyle = alpha(filled >= 1 ? p.bright : p.glow, fade)
    ctx.fillRect(bx, lc - 2, bw * clamp(filled), 4)
    ctx.fillStyle = alpha(p.label, fade)
    ctx.fillRect(bx + bw - 1, lc - 7, 1, 14)

    // Row 4 first, for its place: two indexed segments.
    const yR = h - pad - 12
    const yI = yA + ah + 52 + Math.round(spare * 30)
    const ih = yR - 26 - yI
    const half = (W - 12) / 2
    const segX = [x0, x0 + half + 12]

    // Row 3, left: the optimizer, in the background.
    const opt = clamp((e - OPTIMIZE) / 0.5)
    const busy = e >= OPTIMIZE && e < BUILT + 0.3
    const ox = x0 + 24
    const oy = (yA + ah + yI) / 2
    ctx.strokeStyle = alpha(busy ? p.bright : p.label, (0.4 + 0.6 * opt) * fade)
    arrow(ctx, { x: ox, y: yA + ah + 2 }, { x: ox, y: yI - 3 }, 5)
    // On one line when it clears the query's label, else on two.
    const optOn = (0.55 + 0.45 * opt) * fade
    const oneLine =
      ox + 12 + textWidth(ctx, p, "OPTIMIZER  BACKGROUND") + 16 <
      x1 - 40 - textWidth(ctx, p, "QUERY")
    if (oneLine)
      labelRow(
        ctx,
        p,
        [
          ["OPTIMIZER", busy ? p.bright : p.star],
          ["BACKGROUND", p.label],
        ],
        ox + 12,
        oy,
        { opacity: optOn }
      )
    else {
      labelRow(
        ctx,
        p,
        [["OPTIMIZER", busy ? p.bright : p.star]],
        ox + 12,
        oy - 9,
        { opacity: optOn }
      )
      labelRow(ctx, p, [["BACKGROUND", p.label]], ox + 12, oy + 9, {
        opacity: optOn,
      })
    }

    // Row 3, right: the query, into both kinds of segment at once.
    const qx = x1 - 22
    const q = clamp((e - QUERY) / 0.3) * fade
    crosshair(ctx, p, qx, oy, q)
    labelRow(ctx, p, [["QUERY", p.star]], qx - 18, oy, {
      align: "right",
      opacity: q,
    })
    const reach = ease((e - 2.6) / 0.4)
    if (reach > 0) {
      ctx.strokeStyle = alpha(p.glow, 0.8 * q)
      ctx.beginPath()
      ctx.moveTo(qx, oy - 13)
      ctx.lineTo(qx, oy - 13 - (oy - 13 - (yA + ah)) * reach)
      ctx.moveTo(qx, oy + 13)
      ctx.lineTo(qx, oy + 13 + (yI - oy - 13) * reach)
      ctx.stroke()
    }

    // The indexed segments: the one already there (right) and the one the optimizer builds (left).
    const inner = (sx0: number) => ({
      x: sx0 + 16,
      y: yI + 34,
      w: half - 32,
      h: Math.max(16, ih - 48),
    })
    const drawGraph = (
      g: Graph,
      sx0: number,
      edgeOn: (k: number) => number,
      nodeOn: (k: number) => number
    ) => {
      const a = inner(sx0)
      const at = (n: Point) => ({ x: a.x + n.x * a.w, y: a.y + n.y * a.h })
      g.edges.forEach(([i, j], k) => {
        const on = edgeOn(k)
        if (on <= 0) return
        const A = at(g.nodes[i]!)
        const B = at(g.nodes[j]!)
        ctx.strokeStyle = alpha(p.line, on)
        ctx.beginPath()
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(
          A.x + (B.x - A.x) * Math.min(1, on * 1.5),
          A.y + (B.y - A.y) * Math.min(1, on * 1.5)
        )
        ctx.stroke()
      })
      g.nodes.forEach((n, k) => {
        const c = at(n)
        dot(ctx, c.x, c.y, 3, p.glow, nodeOn(k))
      })
      return at
    }

    box(ctx, p, segX[1]!, yI, half, ih, fade)
    labelRow(
      ctx,
      p,
      [
        ["SEGMENT", p.star],
        ["HNSW", p.label],
      ],
      segX[1]! + 12,
      yI + 18,
      { opacity: fade }
    )
    const at1 = drawGraph(
      seg1,
      segX[1]!,
      () => fade,
      () => fade
    )
    // Its search: a short hop route to the nearest points.
    const hop = (e - 3) / 0.6
    ctx.strokeStyle = alpha(p.bright, 0.9 * fade)
    ctx.lineWidth = 1.5
    for (let k = 0; k < route.length - 1; k++) {
      const f = clamp(hop * (route.length - 1) - k)
      if (f <= 0) break
      const A = at1(seg1.nodes[route[k]!]!)
      const B = at1(seg1.nodes[route[k + 1]!]!)
      ctx.beginPath()
      ctx.moveTo(A.x, A.y)
      ctx.lineTo(A.x + (B.x - A.x) * f, A.y + (B.y - A.y) * f)
      ctx.stroke()
    }
    ctx.lineWidth = 1
    hits.forEach((i) => {
      const c = at1(seg1.nodes[i]!)
      ring(
        ctx,
        c.x,
        c.y,
        ih < 120 ? 5 : 7,
        p.bright,
        clamp((e - 3.6) / 0.3) * fade
      )
    })

    const seg2On = opt * fade
    box(ctx, p, segX[0]!, yI, half, ih, seg2On)
    const built = e >= BUILT
    labelRow(
      ctx,
      p,
      built
        ? [
            ["SEGMENT", p.star],
            ["HNSW", p.label],
          ]
        : [["BUILDING HNSW", p.bright]],
      segX[0]! + 12,
      yI + 18,
      {
        opacity: seg2On,
      }
    )
    const edges = seg2.edges.length
    drawGraph(
      seg2,
      segX[0]!,
      (k) =>
        clamp(
          (e - OPTIMIZE - 0.5 - (k / edges) * (BUILT - OPTIMIZE - 0.8)) / 0.4
        ) * fade,
      (k) => clamp((e - OPTIMIZE - 0.3 - k * 0.05) / 0.3) * fade
    )

    // The results, from both segments: the point just written comes first.
    const r = clamp((e - 3.7) / 0.4) * fade
    labelRow(ctx, p, [["RESULTS", p.star]], x0, yR, { opacity: r })
    let cx = x0 + textWidth(ctx, p, "RESULTS") + 12
    cx +=
      readout(ctx, p, [fresh[match]!, ["NEW", p.bright]], cx, yR, {
        opacity: r,
        mark: p.accent,
      }) + 6
    cx +=
      readout(ctx, p, [old[hits[0]!]!], cx, yR, {
        opacity: clamp((e - 3.85) / 0.4) * fade,
      }) + 6
    readout(ctx, p, [old[hits[1]!]!], cx, yR, {
      opacity: clamp((e - 4) / 0.4) * fade,
    })
  },
}

export function Indexing() {
  return <SceneCanvas scene={scene} />
}
