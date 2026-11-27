"use client"

import { benchmark, type BenchmarkEngine } from "../../content/platform"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { labelRow, mono, prefersStill, textWidth } from "./lib"
import { clamp, ease } from "./rand"

// The single node benchmark (home page, "Performance by Design", "Highest-Performance Vector Search Engine";
// design lead, 2026-11-26), instead of the site's chart image. Only the published figures in content/platform.ts,
// read from qdrant.tech/benchmarks ("Updated: January/June 2024", raw data 2024-06-15): requests per second with
// 100 threads on dbpedia-openai-1M-1536-angular, for each engine its best configuration at or above a precision.
// The library has them at three precision stops, not as curves, so they're drawn as bars, one per engine, the
// fastest first, stepping through the stops: 0.9, 0.95, 0.99. Qdrant's bar is indigo with the accent's mark, the
// others quiet. Reduced motion shows the 0.99 stop, still.

const DATASET = "dbpedia-openai-1M-1536-angular"
const STOPS = benchmark.data.precisions
const STEP = 3.6
const MOVE = 0.9
const ENGINES = Object.keys(benchmark.data.engines) as BenchmarkEngine[]

type Row = { engine: BenchmarkEngine; value: number; rank: number }

function rows(stop: string): Row[] {
  const rps = benchmark.data.results[DATASET]?.[stop]?.rps ?? {}
  return (Object.entries(rps) as [BenchmarkEngine, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([engine, value], rank) => ({ engine, value, rank }))
}

const byStop = STOPS.map(rows)
// One scale for every stop, so a bar's change in length is the real change.
const MAX = Math.max(...byStop.flat().map((r) => r.value))

const rps = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

type State = { w: number; h: number; p: Palette; still: boolean }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const pad = w < 420 ? 16 : 28
    clear(ctx, p, w, h)

    // Where in the cycle: the current stop, the one before, and how far the move between them is.
    const last = STOPS.length - 1
    const step = s.still ? last : Math.floor(t / STEP) % STOPS.length
    const prev = s.still || t < STEP ? step : (step + last) % STOPS.length
    const k = s.still ? 1 : ease(((t % STEP) - 0.15) / MOVE)
    const now = byStop[step] ?? []
    const before = byStop[prev] ?? []

    // The source and date.
    labelRow(
      ctx,
      p,
      [
        ["SINGLE NODE", p.star],
        ["DBPEDIA-OPENAI-1M", p.label],
      ],
      pad,
      pad + 6
    )
    labelRow(
      ctx,
      p,
      [
        ["JUNE 2024", p.label],
        ["QDRANT.TECH/BENCHMARKS", p.label],
      ],
      pad,
      pad + 26
    )
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, Math.round(pad + 44) + 0.5)
    ctx.lineTo(w - pad, Math.round(pad + 44) + 0.5)
    ctx.stroke()

    // The precision stops, the current one marked.
    const py = pad + 68
    ctx.font = mono(p)
    const gap = textWidth(ctx, p, "  ")
    const lead = "PRECISION ≥"
    labelRow(ctx, p, [[lead, p.label]], pad, py)
    let x = pad + textWidth(ctx, p, lead) + gap
    const marks = STOPS.map((stop, i) => {
      const width = textWidth(ctx, p, stop)
      labelRow(ctx, p, [[stop, i === step ? p.star : p.label]], x, py, {
        opacity: i === step ? 1 : 0.7,
      })
      const mark = { x, width }
      x += width + gap
      return mark
    })
    const from = marks[prev]
    const to = marks[step]
    if (from && to) {
      ctx.fillStyle = p.glow
      ctx.fillRect(
        from.x + (to.x - from.x) * k,
        py + 10,
        from.width + (to.width - from.width) * k,
        2
      )
    }
    labelRow(ctx, p, [["RPS", p.label]], w - pad, py, { align: "right" })

    // The bars: one row per engine, the fastest first. Rows slide to their new rank as the stop changes.
    // The last bar ends just above the footer.
    const top = pad + 100
    const bottom = h - pad - 32
    const barH = clamp((bottom - top) / ENGINES.length - 30, 8, 20)
    const rowH = (bottom - top - 20 - barH) / (ENGINES.length - 1)
    const span = w - pad * 2
    for (const engine of ENGINES) {
      const a = before.find((r) => r.engine === engine)
      const b = now.find((r) => r.engine === engine)
      if (!a || !b) continue
      const at = a.rank + (b.rank - a.rank) * k
      const value = a.value + (b.value - a.value) * k
      const y = top + at * rowH
      const qdrant = engine === "qdrant"
      // A row that changes rank dims its labels while it passes another, so they never read over each other.
      const text = a.rank === b.rank ? 1 : 1 - 0.9 * Math.sin(Math.PI * k)

      // Name and value: the value shown is always a published figure, never an in-between one.
      const name = benchmark.data.engines[engine].toUpperCase()
      const place = String(b.rank + 1).padStart(2, "0")
      labelRow(
        ctx,
        p,
        [
          [place, p.label],
          [name, qdrant ? p.star : p.label],
        ],
        pad,
        y + 9,
        { opacity: text }
      )
      if (qdrant) {
        // The accent's mark, in the gap between the rank and the name.
        ctx.fillStyle = alpha(p.accent, text)
        ctx.fillRect(
          Math.round(pad + textWidth(ctx, p, place) + gap / 2 - 2.5),
          Math.round(y + 9) - 3,
          5,
          5
        )
      }
      labelRow(
        ctx,
        p,
        [[rps(b.value), qdrant ? p.star : p.label]],
        w - pad,
        y + 9,
        { align: "right", opacity: text }
      )

      // The track, then the bar: square at the baseline, rounded at its end.
      const by = Math.round(y + 20)
      ctx.fillStyle = alpha(p.grid, 1)
      ctx.fillRect(pad, by, span, barH)
      ctx.beginPath()
      ctx.roundRect(
        pad,
        by,
        Math.max(4, (value / MAX) * span),
        barH,
        [0, 4, 4, 0]
      )
      ctx.fillStyle = qdrant ? p.glow : p.line
      ctx.fill()
    }

    labelRow(
      ctx,
      p,
      [
        ["100 THREADS", p.label],
        ["HIGHER IS BETTER", p.label],
      ],
      pad,
      h - pad - 6
    )
  },
}

// What the chart shows, for screen readers: every figure at every stop.
const summary = STOPS.map(
  (stop, i) =>
    `Precision ${stop} or higher: ${(byStop[i] ?? []).map((r) => `${benchmark.data.engines[r.engine]} ${rps(r.value)}`).join(", ")}.`
).join(" ")

export function Benchmark() {
  return (
    <>
      <SceneCanvas scene={scene} />
      <p className="sr-only">
        Single node benchmark, dbpedia-openai-1M, June 2024
        (qdrant.tech/benchmarks): requests per second with 100 threads.{" "}
        {summary}
      </p>
    </>
  )
}
