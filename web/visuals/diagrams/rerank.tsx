"use client"

import { clamp, ease, rng } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { gauss, ids, labelRow, mono, prefersStill, type Pt } from "./lib"

// Reranking is a funnel (qdrant.tech/documentation/search/search-relevance): a prefetch retrieves 100 candidates
// by a dense search (cosine, computed from clustered 16-dimension vectors), and a rerank query reorders them into
// the top 5. The method changes every cycle: late interaction (ColBERT, MaxSim; the scores are illustrative), a
// formula ($score plus a payload boost, computed) and MMR (diversity 0.5 over the 100 candidates, computed, results
// in selection order with their similarity to the query). Lines carry each result from its prefetch rank to its
// new rank; a result from below the candidates on show comes from the "+ more" row. Candidates that don't make
// the top 5 dim.

const LIMIT = 100
const TOP = 5
const DIM = 16
const CYCLE = 11
const METHODS = ["COLBERT", "FORMULA", "MMR"] as const
const DETAIL: Record<(typeof METHODS)[number], string> = {
  COLBERT: "MAXSIM",
  FORMULA: "$SCORE + BOOST",
  MMR: "DIVERSITY 0.5",
}

type Candidate = { id: string; score: number }
type Result = { id: string; score: string; from: number }
type Run = {
  method: (typeof METHODS)[number]
  candidates: Candidate[]
  top: Result[]
}
type State = {
  w: number
  h: number
  p: Palette
  cycle: number
  run: Run
  still: boolean
}

const unit = (v: number[]) => {
  const n = Math.hypot(...v) || 1
  return v.map((x) => x / n)
}
const dot = (a: number[], b: number[]) =>
  a.reduce((sum, x, i) => sum + x * b[i]!, 0)

function make(cycle: number): Run {
  const rand = rng(410 + cycle)
  const method = METHODS[cycle % METHODS.length]!
  // Candidates in a few clusters around the query, so the near ones are near each other too.
  const query = unit(Array.from({ length: DIM }, () => gauss(rand)))
  const centers = Array.from({ length: 5 }, () =>
    unit(query.map((x) => x + gauss(rand) * (0.15 + rand() * 0.05)))
  )
  const names = ids(LIMIT, rand)
  const vectors = names.map(() => {
    const c = centers[Math.floor(rand() * centers.length)]!
    return unit(c.map((x) => x + gauss(rand) * 0.4))
  })
  const order = vectors
    .map((v, i) => ({ i, score: dot(v, query) }))
    .sort((a, b) => b.score - a.score)
  const candidates = order.map(({ i, score }) => ({ id: names[i]!, score }))
  const vecs = order.map(({ i }) => vectors[i]!)

  let top: Result[]
  if (method === "MMR") {
    // Maximal marginal relevance, lambda = 1 - diversity.
    const lambda = 0.5
    const picked: number[] = []
    while (picked.length < TOP) {
      let best = -1
      let bestScore = -Infinity
      candidates.forEach((c, i) => {
        if (picked.includes(i)) return
        const redundancy = picked.length
          ? Math.max(...picked.map((j) => dot(vecs[i]!, vecs[j]!)))
          : 0
        const value = lambda * c.score - (1 - lambda) * redundancy
        if (value > bestScore) {
          bestScore = value
          best = i
        }
      })
      picked.push(best)
    }
    top = picked.map((i) => ({
      id: candidates[i]!.id,
      score: candidates[i]!.score.toFixed(3),
      from: i,
    }))
  } else if (method === "FORMULA") {
    // $score plus 0.1 or 0.2 when a payload field matches.
    const boost = candidates.map(() =>
      rand() < 0.25 ? (rand() < 0.5 ? 0.2 : 0.1) : 0
    )
    top = candidates
      .map((c, i) => ({ id: c.id, value: c.score + boost[i]!, from: i }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP)
      .map((r) => ({ id: r.id, score: r.value.toFixed(3), from: r.from }))
  } else {
    // MaxSim: illustrative scores, loosely following the first stage.
    top = candidates
      .map((c, i) => ({
        id: c.id,
        value: 22 - (i / LIMIT) * 12 + rand() * 1.2,
        from: i,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP)
      .map((r) => ({ id: r.id, score: r.value.toFixed(2), from: r.from }))
  }
  return { method, candidates, top }
}

// A result chip: rank, id and score, with an optional mark before the id.
function slab(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  width: number,
  parts: [string, string, string],
  opacity: number,
  mark?: string
) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.roundRect(Math.round(x) + 0.5, Math.round(y - 11) + 0.5, width, 22, 4)
  ctx.fillStyle = alpha(p.surface, 0.9)
  ctx.fill()
  ctx.strokeStyle = p.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.font = mono(p)
  ctx.textBaseline = "middle"
  const ty = Math.round(y) + 1
  ctx.fillStyle = p.label
  ctx.fillText(parts[0], Math.round(x) + 8, ty)
  let left = Math.round(x) + 33
  if (mark) {
    ctx.fillStyle = mark
    ctx.fillRect(left, Math.round(y) - 2, 5, 5)
    left += 11
  }
  ctx.fillStyle = p.star
  ctx.fillText(parts[1], left, ty)
  ctx.textAlign = "right"
  ctx.fillStyle = p.label
  ctx.fillText(parts[2], Math.round(x) + width - 8, ty)
  ctx.restore()
}

// Part of the S-curve from a to b, from its start to k (0 to 1).
function curve(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, k: number) {
  const mx = (a.x + b.x) / 2
  const at = (u: number) => {
    const v = 1 - u
    return {
      x:
        v * v * v * a.x +
        3 * v * v * u * mx +
        3 * v * u * u * mx +
        u * u * u * b.x,
      y:
        v * v * v * a.y +
        3 * v * v * u * a.y +
        3 * v * u * u * b.y +
        u * u * u * b.y,
    }
  }
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  for (let i = 1; i <= 24; i++) {
    const { x, y } = at((i / 24) * k)
    ctx.lineTo(x, y)
  }
  ctx.stroke()
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
    const e = s.still ? 7 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.2)) / 1)
    const { method, candidates, top } = s.run

    // As many candidate rows as the height holds, 5 to 10.
    const shown = clamp(Math.floor((h - 70) / 26) - 1, TOP, 10)
    const row = Math.min(30, Math.floor((h - 70) / (shown + 1)))
    const CW = w < 420 ? 124 : 144
    const RW = w < 420 ? 136 : 144
    const gap = clamp(w - 32 - CW - RW, 40, 200)
    const x1 = Math.round((w - (CW + gap + RW)) / 2)
    const x2 = x1 + CW + gap
    const block = 32 + (shown + 1) * row
    const y0 = Math.round((h - block) / 2)
    const rowY = (r: number) => y0 + 32 + r * row + row / 2
    const moreY = rowY(shown)
    // The top 5 sit level with the middle of the candidates.
    const topY = (r: number) =>
      rowY(0) + ((shown - TOP) * row) / 2 + r * row + row * 0.5

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    labelRow(
      ctx,
      p,
      [
        ["PREFETCH", p.star],
        [`LIMIT ${LIMIT}`, p.label],
      ],
      x1,
      y0 + 8,
      { opacity: fade }
    )
    const head = clamp((e - 1.4) / 0.4) * fade
    labelRow(
      ctx,
      p,
      [
        ["RERANK", p.star],
        [method, p.bright],
      ],
      x2,
      y0 + 8,
      { opacity: head }
    )
    ctx.strokeStyle = alpha(p.line, fade)
    ctx.beginPath()
    ctx.moveTo(x1, y0 + 20.5)
    ctx.lineTo(x1 + CW, y0 + 20.5)
    ctx.moveTo(x2, y0 + 20.5)
    ctx.lineTo(x2 + RW, y0 + 20.5)
    ctx.stroke()

    // The rerank: connectors from each result's prefetch rank to its new rank, one at a time.
    const start = 2
    const step = 0.4
    const done = start + TOP * step + 0.4
    top.forEach((r, i) => {
      const k = ease((e - start - i * step) / 0.5)
      if (k <= 0) return
      ctx.strokeStyle = alpha(
        i === 0 ? p.bright : p.glow,
        (i === 0 ? 0.9 : 0.55) * fade
      )
      const from = r.from < shown ? rowY(r.from) : moreY
      curve(ctx, { x: x1 + CW, y: from }, { x: x2, y: topY(i) }, k)
    })

    // The candidates: those that miss the top 5 dim once the rerank is done.
    const kept = new Set(top.map((r) => r.from))
    const dim = clamp((e - done) / 0.4)
    candidates.slice(0, shown).forEach((c, r) => {
      const on =
        clamp((e - 0.2 - r * 0.08) / 0.25) *
        fade *
        (kept.has(r) ? 1 : 1 - 0.6 * dim)
      slab(
        ctx,
        p,
        x1,
        rowY(r),
        CW,
        [String(r + 1), c.id, c.score.toFixed(3)],
        on
      )
    })
    const rest = top.some((r) => r.from >= shown)
    labelRow(ctx, p, [[`+ ${LIMIT - shown} MORE`, p.label]], x1 + 8, moreY, {
      opacity:
        clamp((e - 0.2 - shown * 0.08) / 0.25) *
        fade *
        (rest ? 1 : 1 - 0.4 * dim),
    })
    top.forEach((r, i) => {
      const on = clamp((e - start - i * step - 0.35) / 0.25) * fade
      slab(
        ctx,
        p,
        x2,
        topY(i),
        RW,
        [String(i + 1), r.id, r.score],
        on,
        i === 0 ? p.accent : undefined
      )
    })

    // What the method does, under the top 5.
    labelRow(
      ctx,
      p,
      [
        [`TOP ${TOP}`, p.star],
        [DETAIL[method], p.label],
      ],
      x2 + RW,
      topY(TOP - 1) + row + 4,
      {
        align: "right",
        opacity: clamp((e - done - 0.2) / 0.4) * fade,
      }
    )
  },
}

export function Rerank() {
  return <SceneCanvas scene={scene} />
}
