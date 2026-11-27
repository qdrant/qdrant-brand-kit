"use client"

import { clamp, ease } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { arrow, labelRow, mono, prefersStill, type Pt } from "./lib"

// Agent memory, as in Qdrant's MCP server (mcp-server-qdrant): a semantic memory layer with two tools.
// qdrant-store writes a piece of information with its metadata; qdrant-find takes a query and returns the most
// similar memories, which the agent then works with. Over three steps the agent stores two memories next to
// the ones it already has, then, later, finds the two most relevant and uses them. Scores are illustrative.

const CYCLE = 13
const STEP = [0.3, 3.6, 6.9]

type Memory = { id: string; text: string; meta: string; score: number }

// Memories already in the collection, then the two the agent stores.
const MEMORIES: Memory[] = [
  { id: "#2207", text: "Timezone is CET", meta: "type: profile", score: 0.12 },
  { id: "#1384", text: "Deploys on k8s", meta: "type: infra", score: 0.31 },
  { id: "#3561", text: "Uses Postgres", meta: "type: infra", score: 0.27 },
  {
    id: "#5120",
    text: "Prefers Python",
    meta: "type: preference",
    score: 0.82,
  },
  { id: "#6031", text: "Uses FastAPI", meta: "type: project", score: 0.64 },
]
const STORED = 3
const FOUND = 2
const QUERY = "which language?"
const ranked = MEMORIES.map((m, i) => ({ ...m, i }))
  .sort((a, b) => b.score - a.score)
  .slice(0, FOUND)
const found = new Map(ranked.map((m, r) => [m.i, r]))

type State = { w: number; h: number; p: Palette; still: boolean }
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

// A card of mono lines, 18px apart, each a row of parts in their own colors.
function card(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  width: number,
  lines: [string, string][][],
  opacity: number,
  stroke?: string
) {
  frame(ctx, p, { x, y, w: width, h: lines.length * 18 + 10 }, opacity, stroke)
  lines.forEach((parts, i) =>
    labelRow(ctx, p, parts, Math.round(x) + 8, Math.round(y) + 15 + i * 18, {
      opacity,
    })
  )
}

// A memory row: id and text, a score on the right once it's found, and a mark for the best match.
function row(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  width: number,
  m: Memory,
  opacity: number,
  options: { score?: number; mark?: string; ids: boolean }
) {
  if (opacity <= 0) return
  frame(ctx, p, { x, y: y - 12, w: width, h: 24 }, opacity)
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.font = mono(p)
  ctx.textBaseline = "middle"
  const ty = Math.round(y) + 1
  let left = Math.round(x) + 8
  if (options.mark) {
    ctx.fillStyle = options.mark
    ctx.fillRect(left, Math.round(y) - 2, 5, 5)
    left += 13
  }
  if (options.ids) {
    ctx.fillStyle = p.label
    ctx.fillText(m.id, left, ty)
    left += ctx.measureText(`${m.id}  `).width
  }
  ctx.fillStyle = p.star
  ctx.fillText(m.text, left, ty)
  if (options.score) {
    ctx.globalAlpha = opacity * options.score
    ctx.textAlign = "right"
    ctx.fillStyle = p.label
    ctx.fillText(m.score.toFixed(2), Math.round(x + width) - 8, ty)
  }
  ctx.restore()
}

// Part of the line from a to b, with an open head once it arrives.
function lane(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, k: number) {
  if (k <= 0) return
  const end = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
  if (k >= 1) arrow(ctx, a, end)
  else {
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const e = s.still ? 11 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.2)) / 1)
    const at = (start: number, length = 0.4) =>
      ease((e - start) / length) * fade
    const wide = w >= 520
    const step = e >= STEP[2]! ? 2 : e >= STEP[1]! ? 1 : 0
    const local = e - STEP[step]!

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Layout: the steps, the agent, the two lanes and the memory, left to right.
    const m = wide ? 24 : 10
    const cy = Math.round(h / 2) + (wide ? 0 : 10)
    const SW = wide ? 108 : 0
    const AW = wide ? 96 : 52
    const MW = wide ? 256 : Math.max(120, w - 2 * m - AW - 100)
    const ax = m + (wide ? SW + 24 : 0)
    const mx = w - m - MW
    const laneA = ax + AW
    const laneB = mx
    const gap = wide ? 32 : 26
    const rowY = MEMORIES.map((_, i) => Math.round(cy - 2 * gap + i * gap))
    const top = rowY[0]! - (wide ? 46 : 32)

    // Headers and the steps.
    const heads: [number, number, [string, string][]][] = [
      [ax, AW, [["AGENT", p.star]]],
      [
        mx,
        MW,
        [
          ["QDRANT", p.star],
          ["MEMORY", p.label],
        ],
      ],
    ]
    if (wide) heads.unshift([m, SW, [["STEPS", p.star]]])
    ctx.strokeStyle = p.line
    ctx.beginPath()
    for (const [x, width, parts] of heads) {
      labelRow(ctx, p, parts, x, top)
      ctx.moveTo(x, top + 12.5)
      ctx.lineTo(x + width, top + 12.5)
    }
    ctx.stroke()
    const tools = ["STORE", "STORE", "FIND"]
    if (wide)
      tools.forEach((tool, i) => {
        const current = i === step && fade > 0.5
        const y = rowY[0]! + 8 + i * 30
        if (current) {
          ctx.fillStyle = p.accent
          ctx.fillRect(m, y - 2, 5, 5)
        }
        labelRow(
          ctx,
          p,
          [
            [`STEP ${i + 1}`, current ? p.star : p.label],
            [tool, current ? p.bright : p.label],
          ],
          m + 13,
          y,
          {
            opacity: i <= step || fade < 1 ? 1 : 0.45,
          }
        )
      })

    // The agent.
    const agent = { x: ax, y: cy - 46, w: AW, h: 92 }
    const used = step === 2 ? at(STEP[2]! + 3, 0.4) : 0
    frame(
      ctx,
      p,
      agent,
      1,
      used > 0 ? alpha(p.bright, Math.max(0.35, used)) : p.line
    )
    labelRow(ctx, p, [["AGENT", p.star]], agent.x + AW / 2, cy - 10, {
      align: "center",
    })
    labelRow(
      ctx,
      p,
      [[`STEP ${step + 1}`, p.label]],
      agent.x + AW / 2,
      cy + 10,
      {
        align: "center",
        opacity: 1 - used,
      }
    )
    labelRow(
      ctx,
      p,
      [[wide ? `+${FOUND} MEMORIES` : `+${FOUND}`, p.bright]],
      agent.x + AW / 2,
      cy + 10,
      {
        align: "center",
        opacity: used,
      }
    )

    // The lanes: qdrant-store above, qdrant-find below.
    const upper = cy - 22
    const lower = rowY[ranked[0]!.i]!
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.moveTo(laneA, upper + 0.5)
    ctx.lineTo(laneB, upper + 0.5)
    ctx.moveTo(laneA, lower + 0.5)
    ctx.lineTo(laneB, lower + 0.5)
    ctx.stroke()
    labelRow(
      ctx,
      p,
      [["qdrant-store", step < 2 ? p.star : p.label]],
      laneA + 10,
      upper - 10
    )
    labelRow(
      ctx,
      p,
      [["qdrant-find", step === 2 ? p.star : p.label]],
      laneA + 10,
      lower + 14
    )
    const laneW = laneB - laneA

    if (step < 2) {
      // Store: the memory and its metadata go to Qdrant, then show up as a new point.
      const memory = MEMORIES[STORED + step]!
      const shown = clamp(local / 0.4) * (1 - clamp((local - 2.9) / 0.3)) * fade
      if (wide && laneW > 140)
        card(
          ctx,
          p,
          laneA + 10,
          upper - 74,
          Math.min(laneW - 20, 148),
          [[[memory.text, p.star]], [[memory.meta, p.label]]],
          shown
        )
      ctx.strokeStyle = alpha(p.bright, 0.9 * fade)
      lane(
        ctx,
        { x: laneA, y: upper + 0.5 },
        { x: laneB - 2, y: upper + 0.5 },
        ease((local - 0.6) / 0.6)
      )
    } else {
      // Find: the query goes to Qdrant, the most similar memories come back.
      const shown = clamp(local / 0.4) * fade
      if (wide && laneW > 140)
        card(
          ctx,
          p,
          laneA + 10,
          lower + 28,
          Math.min(laneW - 20, 148),
          [[["query", p.label]], [[QUERY, p.star]]],
          shown
        )
      ctx.strokeStyle = alpha(p.glow, 0.8 * fade)
      lane(
        ctx,
        { x: laneA, y: lower - 3.5 },
        { x: laneB - 2, y: lower - 3.5 },
        ease((local - 0.6) / 0.6)
      )
      ctx.strokeStyle = alpha(p.bright, 0.9 * fade)
      lane(
        ctx,
        { x: laneB, y: lower + 4.5 },
        { x: laneA + 2, y: lower + 4.5 },
        ease((local - 2.1) / 0.6)
      )
    }

    // The memory: what's there, the new ones as they're stored, and the matches once found.
    const scored = step === 2 ? at(STEP[2]! + 1.3, 0.5) : 0
    MEMORIES.forEach((memory, i) => {
      const stored =
        i < STORED
          ? 1
          : i - STORED < step
            ? fade
            : at(STEP[i - STORED]! + 1.2, 0.4)
      const r = found.get(i)
      const dim = r === undefined ? 1 - 0.55 * scored : 1
      row(ctx, p, mx, rowY[i]!, MW, memory, stored * dim, {
        ids: wide,
        score: r === undefined || !wide ? undefined : scored,
        mark: r === 0 && scored > 0 ? p.accent : undefined,
      })
    })
    if (scored > 0)
      ranked.slice(1).forEach((memory) => {
        const y = rowY[memory.i]!
        ctx.strokeStyle = alpha(p.glow, 0.6 * scored)
        ctx.beginPath()
        ctx.moveTo(mx - 0.5, y)
        ctx.lineTo(mx - 8, y)
        ctx.lineTo(mx - 8, lower + 4.5)
        ctx.lineTo(mx - 2, lower + 4.5)
        ctx.stroke()
      })
  },
}

export function AgentMemory() {
  return <SceneCanvas scene={scene} />
}
