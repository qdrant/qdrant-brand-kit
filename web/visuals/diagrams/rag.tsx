"use client"

import { clamp, ease, rng, spread, type Point } from "./rand"
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
  mono,
  nearest,
  prefersStill,
  readout,
  type Pt,
} from "./lib"

// RAG, as in Qdrant's RAG tutorials: the question is embedded (dense and sparse), Qdrant returns the top 3
// chunks (query_points with limit=3, with a payload filter), their text goes into the prompt as context, and
// the LLM answers from that context only, citing the chunks it used. The nearest matching points are computed
// for real; the points the filter excludes dim and are skipped, even when they're closer. One bright route
// carries the top chunk from the question to the answer.

const CYCLE = 11
const LIMIT = 3
const QUESTION = ["How do I enable", "binary quantization?"]
const ANSWER = ["Set binary in", "quantization_config"]
const FILTER = "lang = en"
const QUERY: Point = { x: 0.56, y: 0.44 }

type Hit = { i: number; d: number }
type State = {
  w: number
  h: number
  p: Palette
  points: Point[]
  match: boolean[]
  names: string[]
  hits: Hit[]
  still: boolean
}

type Box = { x: number; y: number; w: number; h: number }

// A rounded hairline box in the surface color.
function frame(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  b: Box,
  opacity: number,
  stroke = p.line
) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.roundRect(
    Math.round(b.x) + 0.5,
    Math.round(b.y) + 0.5,
    Math.round(b.w),
    Math.round(b.h),
    4
  )
  ctx.fillStyle = alpha(p.surface, 0.9)
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

// A card of mono lines, 18px apart, each a row of parts in their own colors. Returns its box.
function card(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  width: number,
  lines: [string, string][][],
  opacity: number,
  options: { stroke?: string; reveal?: number[] } = {}
): Box {
  const box = { x, y, w: width, h: lines.length * 18 + 10 }
  frame(ctx, p, box, opacity, options.stroke)
  lines.forEach((parts, i) => {
    const on = opacity * (options.reveal?.[i] ?? 1)
    if (on > 0)
      labelRow(ctx, p, parts, Math.round(x) + 8, Math.round(y) + 15 + i * 18, {
        opacity: on,
      })
  })
  return box
}

// A context chip: an id with an optional mark, and a score on the right.
function slab(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  width: number,
  id: string,
  score: string | null,
  opacity: number,
  mark?: string
) {
  if (opacity <= 0) return
  frame(ctx, p, { x, y: y - 12, w: width, h: 24 }, opacity)
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.font = mono(p)
  ctx.textBaseline = "middle"
  const ty = Math.round(y) + 1
  let left = Math.round(x) + 8
  if (mark) {
    ctx.fillStyle = mark
    ctx.fillRect(left, Math.round(y) - 2, 5, 5)
  }
  left += 13
  ctx.fillStyle = p.star
  ctx.fillText(id, left, ty)
  if (score) {
    ctx.textAlign = "right"
    ctx.fillStyle = p.label
    ctx.fillText(score, Math.round(x + width) - 8, ty)
  }
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

// Part of the straight line from a to b.
function segment(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, k: number) {
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
  ctx.stroke()
}

const score = (d: number) => (1 - d * 0.8).toFixed(2)

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(52)
    const points = spread(44, 1, 1, rand)
    const match = points.map(() => rand() < 0.55)
    const d = (pt: Point) => Math.hypot(pt.x - QUERY.x, pt.y - QUERY.y)
    // The point nearest the question is outside the filter, so the filter visibly skips it.
    const first = nearest(points, d, 1)[0]
    if (first) match[first.i] = false
    const hits = nearest(points, d, LIMIT, (i) => !match[i])
    return {
      w,
      h,
      p,
      points,
      match,
      names: ids(points.length, rand),
      hits,
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const e = s.still ? 8 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.2)) / 1)
    const at = (start: number, length = 0.4) =>
      ease((e - start) / length) * fade
    const wide = w >= 520
    const cy = Math.round(h / 2) + (wide ? 0 : 10)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The layout: question, Qdrant, context and answer, left to right.
    const m = wide ? 24 : 12
    const AW = 160
    const CW = wide ? 112 : 68
    const DW = wide ? 160 : Math.max(64, Math.round(w * 0.2))
    const FW = wide
      ? Math.max(140, w - 2 * m - AW - CW - DW - 3 * 28)
      : Math.round(w * 0.34)
    const g = wide
      ? (w - 2 * m - AW - CW - DW - FW) / 3
      : (w - 2 * m - CW - DW - FW) / 2
    const ax = m
    const bx = wide ? ax + AW + g : m
    const cx = bx + FW + g
    const dx = cx + CW + g
    const field: Box = wide
      ? { x: bx, y: cy - 110, w: FW, h: 220 }
      : { x: bx, y: 34, w: FW, h: h - 34 - 12 }
    const rows = wide ? [-40, 0, 40] : [-30, 0, 30]
    const chipY = rows.map((r) => Math.round(field.y + field.h / 2) + r)

    // Headers, always on.
    if (wide) {
      const hy = cy - 140
      const heads: [number, number, [string, string][]][] = [
        [ax, AW, [["QUESTION", p.star]]],
        [
          bx,
          FW,
          [
            ["QDRANT", p.star],
            [`LIMIT ${LIMIT}`, p.label],
          ],
        ],
        [cx, CW, [["CONTEXT", p.star]]],
        [dx, DW, [["ANSWER", p.star]]],
      ]
      ctx.strokeStyle = p.line
      ctx.beginPath()
      for (const [x, width, parts] of heads) {
        labelRow(ctx, p, parts, x, hy)
        ctx.moveTo(x, hy + 12.5)
        ctx.lineTo(x + width, hy + 12.5)
      }
      ctx.stroke()
    }

    // The collection: points in a field, the filter dims the ones it excludes.
    frame(ctx, p, field, 1)
    const pad = 12
    const px = (pt: Point): Pt => ({
      x: field.x + pad + pt.x * (field.w - 2 * pad),
      y: field.y + pad + pt.y * (field.h - 2 * pad),
    })
    const filtered = at(2.4, 0.5)
    const hitOn = s.hits.map((_, r) => at(2.9 + r * 0.3, 0.35))
    const rankOf = new Map(s.hits.map(({ i }, r) => [i, r]))
    s.points.forEach((pt, i) => {
      const { x, y } = px(pt)
      const r = rankOf.get(i)
      const lit = r === undefined ? 0 : hitOn[r]!
      ctx.globalAlpha = s.match[i] ? 0.85 : 0.85 - 0.55 * filtered
      ctx.fillStyle = lit > 0 ? p.bright : s.match[i] ? p.star : p.dim
      ctx.beginPath()
      ctx.arc(x, y, 1.6 + lit * 0.6, 0, TAU)
      ctx.fill()
    })
    ctx.globalAlpha = 1
    if (wide)
      readout(
        ctx,
        p,
        [["FILTER", p.label], FILTER],
        field.x,
        field.y + field.h + 20,
        { opacity: filtered }
      )

    // The question and its embedding.
    const q = px(QUERY)
    const qOn = at(0.2)
    if (wide) {
      const top = cy - 80
      card(
        ctx,
        p,
        ax,
        top,
        AW,
        QUESTION.map((line) => [[line, p.star]]),
        qOn
      )
      const embed = at(0.8)
      ctx.strokeStyle = alpha(p.bright, 0.9 * embed)
      arrow(
        ctx,
        { x: ax + 16, y: top + 52 },
        { x: ax + 16, y: top + 52 + 24 * embed }
      )
      labelRow(ctx, p, [["EMBED", p.label]], ax + 28, top + 64, {
        opacity: embed,
      })
      const vectors = at(1.3)
      readout(ctx, p, [["DENSE", p.label], "0.12 -0.48 …"], ax, top + 98, {
        opacity: vectors,
      })
      readout(ctx, p, [["SPARSE", p.label], "17:0.81 …"], ax, top + 128, {
        opacity: vectors,
      })
      const link = at(1.8, 0.5)
      if (link > 0) {
        ctx.strokeStyle = alpha(p.bright, 0.9 * fade)
        curve(ctx, { x: ax + AW, y: top + 113 }, q, link)
      }
    } else {
      labelRow(ctx, p, [[`${QUESTION.join(" ")}`, p.star]], m, 16, {
        opacity: qOn,
      })
    }

    // The search: the query, then lines to its nearest matching points in rank order.
    s.hits.forEach(({ i }, r) => {
      const k = hitOn[r]!
      if (k <= 0) return
      const hit = px(s.points[i]!)
      ctx.strokeStyle = alpha(
        r === 0 ? p.bright : p.glow,
        (r === 0 ? 0.9 : 0.6) * fade
      )
      segment(ctx, q, hit, k)
      ctx.beginPath()
      ctx.arc(hit.x, hit.y, 5, 0, TAU)
      ctx.globalAlpha = k
      ctx.stroke()
      ctx.globalAlpha = 1
    })
    crosshair(ctx, p, q.x, q.y, at(wide ? 2.2 : 1.6, 0.3))

    // The context: the hits' chunks, carried to the prompt.
    s.hits.forEach(({ i }, r) => {
      const k = at(3.9 + r * 0.2, 0.5)
      if (k <= 0) return
      ctx.strokeStyle = alpha(
        r === 0 ? p.bright : p.glow,
        (r === 0 ? 0.9 : 0.55) * fade
      )
      curve(ctx, px(s.points[i]!), { x: cx, y: chipY[r]! }, k)
    })
    s.hits.forEach(({ i, d }, r) => {
      const on = at(4.3 + r * 0.2, 0.3)
      slab(
        ctx,
        p,
        cx,
        chipY[r]!,
        CW,
        s.names[i]!,
        wide ? score(d) : null,
        on,
        r === 0 ? p.accent : undefined
      )
    })

    // The LLM reads the question and the context, and answers from the context, citing it.
    const llmY = wide ? cy - 80 : field.y
    const llmOn = at(5.2, 0.4)
    const llm = card(
      ctx,
      p,
      dx,
      llmY,
      DW,
      wide
        ? [[["LLM", p.star]], [["QUESTION + CONTEXT", p.label]]]
        : [[["LLM", p.star]]],
      1,
      { stroke: llmOn > 0 ? alpha(p.bright, Math.max(0.35, llmOn)) : undefined }
    )
    s.hits.forEach((_, r) => {
      const k = at(4.9 + r * 0.1, 0.5)
      if (k <= 0) return
      ctx.strokeStyle = alpha(
        r === 0 ? p.bright : p.glow,
        (r === 0 ? 0.9 : 0.55) * fade
      )
      curve(
        ctx,
        { x: cx + CW, y: chipY[r]! },
        { x: dx, y: llm.y + llm.h / 2 },
        k
      )
    })
    const answerOn = at(5.9, 0.4)
    ctx.strokeStyle = alpha(p.bright, 0.9 * answerOn)
    arrow(
      ctx,
      { x: dx + 16, y: llm.y + llm.h + 4 },
      { x: dx + 16, y: llm.y + llm.h + 4 + 24 * answerOn }
    )
    const cited = s.hits.slice(0, 2).map(({ i }) => s.names[i]!)
    const answerTop = llm.y + llm.h + 34
    card(
      ctx,
      p,
      dx,
      answerTop,
      DW,
      wide
        ? [
            [[ANSWER[0]!, p.star]],
            [[ANSWER[1]!, p.star]],
            [[cited.map((id) => `[${id}]`).join(" "), p.bright]],
          ]
        : cited.map((id) => [[id, p.bright]]),
      answerOn,
      {
        reveal: wide
          ? [at(6, 0.3), at(6.3, 0.3), at(6.7, 0.3)]
          : [at(6, 0.3), at(6.3, 0.3)],
      }
    )
  },
}

export function Rag() {
  return <SceneCanvas scene={scene} />
}
