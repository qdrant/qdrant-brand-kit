"use client"

import { clamp, ease, rng } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { ids, labelRow, mono, prefersStill, type Pt } from "./lib"

// Hybrid search: the top 6 of a sparse search (BM25 scores) on the left and of a dense search (cosine) on
// the right merge into one ranked list in the middle by reciprocal rank fusion, computed for real the way Qdrant's
// Query API does it: score = sum of 1 / (k + rank) over the lists a point is in, ranks counted from 0 and k = 2, its
// default (docs: search/hybrid-queries, checked 2026-11-26; 60 is the original paper's value, not Qdrant's). Lines
// carry each result from its source ranks to its fused rank; points that don't make the top 6 dim. New lists every
// cycle.

const TOP = 6
const RRF_K = 2
const CYCLE = 11
const ROW = 34

type Entry = { id: string; score: number }
type Fused = { id: string; score: number; sparse: number; dense: number }
type Run = { sparse: Entry[]; dense: Entry[]; fused: Fused[] }
type State = {
  w: number
  h: number
  p: Palette
  cycle: number
  run: Run
  still: boolean
}

function make(cycle: number): Run {
  const rand = rng(720 + cycle)
  const pool = ids(9, rand)
  const shuffle = (items: string[]) => {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[out[i], out[j]] = [out[j]!, out[i]!]
    }
    return out
  }
  let bm25 = 12 + rand() * 4
  const sparse = shuffle(pool)
    .slice(0, TOP)
    .map((id) => {
      const entry = { id, score: bm25 }
      bm25 -= 0.5 + rand() * 1.6
      return entry
    })
  let cosine = 0.86 + rand() * 0.08
  const dense = shuffle(pool)
    .slice(0, TOP)
    .map((id) => {
      const entry = { id, score: cosine }
      cosine -= 0.008 + rand() * 0.03
      return entry
    })
  const rankIn = (list: Entry[], id: string) =>
    list.findIndex((e) => e.id === id)
  const fused = [...new Set([...sparse, ...dense].map((e) => e.id))]
    .map((id) => {
      const rs = rankIn(sparse, id)
      const rd = rankIn(dense, id)
      const score =
        (rs >= 0 ? 1 / (RRF_K + rs) : 0) + (rd >= 0 ? 1 / (RRF_K + rd) : 0)
      return { id, score, sparse: rs, dense: rd }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP)
  return { sparse, dense, fused }
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
  ctx.roundRect(Math.round(x) + 0.5, Math.round(y - 12) + 0.5, width, 24, 4)
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
  let left = Math.round(x) + 24
  if (mark) {
    ctx.fillStyle = mark
    ctx.fillRect(left, Math.round(y) - 2, 5, 5)
    left += 12
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
    const e = s.still ? 6 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.2)) / 1)
    const { sparse, dense, fused } = s.run

    // Chip widths: narrower in a narrow frame.
    const CW = w < 460 ? 108 : 136
    const FW = w < 460 ? 132 : 156
    const gap = clamp((w - 48 - 2 * CW - FW) / 2, 16, 140)
    const total = 2 * CW + FW + 2 * gap
    const x1 = Math.round((w - total) / 2)
    const xf = x1 + CW + gap
    const x2 = xf + FW + gap
    const y0 = Math.round((h - (40 + TOP * ROW + 40)) / 2)
    const rowY = (r: number) => y0 + 40 + r * ROW

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    labelRow(
      ctx,
      p,
      [
        ["SPARSE", p.star],
        ["BM25", p.label],
      ],
      x1,
      y0 + 8,
      { opacity: fade }
    )
    labelRow(
      ctx,
      p,
      [
        ["RRF", p.star],
        [`K ${RRF_K}`, p.label],
      ],
      xf,
      y0 + 8,
      { opacity: fade }
    )
    labelRow(
      ctx,
      p,
      [
        ["DENSE", p.star],
        ["COS", p.label],
      ],
      x2,
      y0 + 8,
      { opacity: fade }
    )
    ctx.strokeStyle = alpha(p.line, fade)
    ctx.beginPath()
    for (const [x = 0, width = 0] of [
      [x1, CW],
      [xf, FW],
      [x2, CW],
    ]) {
      ctx.moveTo(x, y0 + 20.5)
      ctx.lineTo(x + width, y0 + 20.5)
    }
    ctx.stroke()

    // The fusion: connectors from each result's source ranks to its fused rank.
    const merged = 1.9 + TOP * 0.28
    fused.forEach((f, r) => {
      const k = ease((e - 1.9 - r * 0.28) / 0.5)
      if (k <= 0) return
      ctx.strokeStyle = alpha(
        r === 0 ? p.bright : p.glow,
        (r === 0 ? 0.9 : 0.55) * fade
      )
      const yf = rowY(r)
      if (f.sparse >= 0)
        curve(ctx, { x: x1 + CW, y: rowY(f.sparse) }, { x: xf, y: yf }, k)
      if (f.dense >= 0)
        curve(ctx, { x: x2, y: rowY(f.dense) }, { x: xf + FW, y: yf }, k)
    })

    // The source lists: results that miss the fused top 6 dim once the merge is done.
    const kept = new Set(fused.map((f) => f.id))
    const dim = clamp((e - merged) / 0.4)
    sparse.forEach((entry, r) => {
      const on =
        clamp((e - 0.2 - r * 0.1) / 0.25) *
        fade *
        (kept.has(entry.id) ? 1 : 1 - 0.6 * dim)
      slab(
        ctx,
        p,
        x1,
        rowY(r),
        CW,
        [String(r + 1), entry.id, entry.score.toFixed(2)],
        on
      )
    })
    dense.forEach((entry, r) => {
      const on =
        clamp((e - 0.5 - r * 0.1) / 0.25) *
        fade *
        (kept.has(entry.id) ? 1 : 1 - 0.6 * dim)
      slab(
        ctx,
        p,
        x2,
        rowY(r),
        CW,
        [String(r + 1), entry.id, entry.score.toFixed(3)],
        on
      )
    })
    fused.forEach((f, r) => {
      const on = clamp((e - 1.9 - r * 0.28 - 0.35) / 0.25) * fade
      slab(
        ctx,
        p,
        xf,
        rowY(r),
        FW,
        [String(r + 1), f.id, f.score.toFixed(3)],
        on,
        r === 0 ? p.accent : undefined
      )
    })

    // The top result's sum, spelled out.
    const top = fused[0]
    if (!top) return
    const terms = [top.sparse, top.dense]
      .filter((r) => r >= 0)
      .map((r) => `1/${RRF_K + r}`)
    labelRow(
      ctx,
      p,
      [
        [terms.join(" + "), p.label],
        [`= ${top.score.toFixed(3)}`, p.star],
      ],
      xf,
      rowY(TOP - 1) + 34,
      {
        opacity: clamp((e - merged - 0.2) / 0.4) * fade,
      }
    )
  },
}

export function Hybrid() {
  return <SceneCanvas scene={scene} />
}
