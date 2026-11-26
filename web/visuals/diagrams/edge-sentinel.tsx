"use client"

import { ease, rng } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { TAU, labelRow, prefersStill, readout, type Box } from "./lib"
import { cycleTime, panel, within } from "./edge-lib"

// Sentinel (qdrant.tech/edge, the demos): twelve camera feeds, each with people moving through it, scored against
// what's normal for it, on the device (Qdrant Edge searches locally); most stay quiet, and the few past normal are
// escalated into a queue, highest first, the top one in amaranth. The scores change every cycle and are illustrative.

const CYCLE = 10
const FEEDS = 12
const ESCALATED = 3
const SCORE_AT = 0.8
const QUEUE_AT = 3.4

type Walker = {
  ax: number
  ay: number
  bx: number
  by: number
  speed: number
  offset: number
}
type Round = { scores: number[]; queue: number[] }
type State = {
  w: number
  h: number
  p: Palette
  still: boolean
  walkers: Walker[][]
  cycle: number
  round: Round
}

function score(cycle: number): Round {
  const rand = rng(900 + cycle * 17)
  const order = Array.from({ length: FEEDS }, (_, i) => i).sort(
    () => rand() - 0.5
  )
  const scores = new Array<number>(FEEDS).fill(0)
  order.forEach((feed, k) => {
    scores[feed] = k < ESCALATED ? 0.84 + rand() * 0.13 : 0.12 + rand() * 0.48
  })
  const queue = order
    .slice(0, ESCALATED)
    .sort((a, b) => scores[b]! - scores[a]!)
  return { scores, queue }
}

const pad2 = (n: number) => String(n).padStart(2, "0")

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(77)
    const walkers = Array.from({ length: FEEDS }, () =>
      Array.from({ length: 1 + Math.floor(rand() * 3) }, () => {
        const vertical = rand() < 0.35
        return {
          ax: vertical ? 0.2 + rand() * 0.6 : -0.1,
          ay: vertical ? -0.1 : 0.35 + rand() * 0.45,
          bx: vertical ? 0.2 + rand() * 0.6 : 1.1,
          by: vertical ? 1.1 : 0.35 + rand() * 0.45,
          speed: 0.04 + rand() * 0.05,
          offset: rand(),
        }
      })
    )
    return {
      w,
      h,
      p,
      still: prefersStill(),
      walkers,
      cycle: 0,
      round: score(0),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const { e, fade } = cycleTime(t, CYCLE, s.still)
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.round = score(cycle)
    }
    const { scores, queue } = s.round
    const wide = w >= 440
    const m = wide ? 16 : 10
    const gap = wide ? 12 : 8
    const top = m + 30

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    const grid: Box = {
      x: m,
      y: top,
      w: (w - 2 * m - gap) * 0.66,
      h: h - top - m,
    }
    const col: Box = {
      x: grid.x + grid.w + gap,
      y: top,
      w: w - m - (grid.x + grid.w + gap),
      h: grid.h,
    }

    // Header.
    labelRow(
      ctx,
      p,
      wide
        ? [
            ["12 FEEDS", p.star],
            ["SCORED AGAINST NORMAL", p.label],
          ]
        : [["12 FEEDS", p.star]],
      m,
      m + 8
    )
    const queued = queue.filter((_, k) => e >= QUEUE_AT + k * 0.45).length
    labelRow(
      ctx,
      p,
      [
        [wide ? "ESCALATED" : "QUEUE", p.label],
        [String(Math.round(queued * fade)), p.star],
      ],
      col.x,
      m + 8
    )

    // The feeds.
    const cols = 4
    const rows = 3
    const cg = wide ? 6 : 4
    const cw = (grid.w - cg * (cols - 1)) / cols
    const ch = (grid.h - cg * (rows - 1)) / rows
    const cell = (i: number): Box => ({
      x: grid.x + (i % cols) * (cw + cg),
      y: grid.y + Math.floor(i / cols) * (ch + cg),
      w: cw,
      h: ch,
    })
    const roomy = cw >= 78
    for (let i = 0; i < FEEDS; i++) {
      const b = cell(i)
      const sc = scores[i]!
      const rank = queue.indexOf(i)
      const flagged =
        rank >= 0 ? ease((e - QUEUE_AT - rank * 0.45) / 0.4) * fade : 0
      panel(ctx, p, b, { radius: 3 })
      // People walking through, along the paths they take.
      within(ctx, b, () => {
        ctx.strokeStyle = p.grid
        ctx.beginPath()
        for (const wk of s.walkers[i]!) {
          ctx.moveTo(b.x + wk.ax * b.w, b.y + wk.ay * b.h)
          ctx.lineTo(b.x + wk.bx * b.w, b.y + wk.by * b.h)
        }
        ctx.stroke()
        ctx.fillStyle = alpha(p.star, 0.7)
        ctx.beginPath()
        for (const wk of s.walkers[i]!) {
          const k = (wk.offset + (s.still ? 0 : t * wk.speed)) % 1
          const x = b.x + (wk.ax + (wk.bx - wk.ax) * k) * b.w
          const y = b.y + (wk.ay + (wk.by - wk.ay) * k) * b.h
          ctx.moveTo(x + 1.8, y)
          ctx.arc(x, y, 1.8, 0, TAU)
        }
        ctx.fill()
      })
      if (roomy)
        labelRow(ctx, p, [[pad2(i + 1), p.label]], b.x + 7, b.y + 12, {
          opacity: 0.9,
        })

      // Its score: a bar along the bottom, filled as it's measured.
      const measured = ease((e - SCORE_AT - i * 0.12) / 0.6) * fade
      if (measured > 0) {
        const bw = (b.w - 12) * sc * measured
        ctx.fillStyle = rank >= 0 ? p.glow : alpha(p.dim, 0.8)
        ctx.fillRect(b.x + 6, b.y + b.h - 7, bw, 2)
        if (roomy)
          labelRow(
            ctx,
            p,
            [[sc.toFixed(2), rank >= 0 ? p.star : p.label]],
            b.x + b.w - 7,
            b.y + 12,
            {
              align: "right",
              opacity: measured,
            }
          )
      }
      if (flagged > 0)
        panel(ctx, p, b, {
          radius: 3,
          fill: null,
          stroke: rank === 0 ? p.accent : p.glow,
          width: 1.5,
          opacity: flagged,
        })
    }

    // The queue, highest first, and how many feeds stayed within normal.
    panel(ctx, p, col, { radius: 4, fill: null, stroke: p.grid })
    const settled = ease((e - SCORE_AT - FEEDS * 0.12) / 0.6) * fade
    const rowsEnd =
      col.y + (wide ? 22 : 18) + (ESCALATED - 1) * (wide ? 34 : 30) + 12
    const normalY = col.y + col.h - (wide ? 16 : 12)
    // Only where it clears the queue.
    if (normalY - 8 > rowsEnd + 8)
      labelRow(
        ctx,
        p,
        [
          ["NORMAL", p.label],
          [String(FEEDS - queue.length), p.star],
        ],
        col.x + (wide ? 10 : 6),
        normalY,
        { opacity: settled }
      )
    queue.forEach((feed, k) => {
      const show = ease((e - QUEUE_AT - k * 0.45) / 0.4) * fade
      if (show <= 0) return
      const y = col.y + (wide ? 22 : 18) + k * (wide ? 34 : 30)
      const x = col.x + (wide ? 10 : 6) - (1 - show) * 10
      readout(
        ctx,
        p,
        wide
          ? [`FEED ${pad2(feed + 1)}`, [scores[feed]!.toFixed(2), p.label]]
          : [
              [pad2(feed + 1), k === 0 ? p.accent : p.star],
              [scores[feed]!.toFixed(2), p.label],
            ],
        x,
        y,
        {
          opacity: show,
          mark: wide ? (k === 0 ? p.accent : p.glow) : undefined,
        }
      )
    })
  },
}

export function EdgeSentinel() {
  return <SceneCanvas scene={scene} />
}
