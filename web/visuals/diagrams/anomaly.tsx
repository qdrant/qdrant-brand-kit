"use client"

import { clamp, ease, rng } from "./rand"
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
  gauss,
  labelRow,
  nearest,
  prefersStill,
  readout,
  textWidth,
  type Box,
  type Pt,
} from "./lib"

// Anomaly detection with Qdrant: normal data is indexed as a baseline; each new item searches its k nearest
// neighbors in it, and when its distance to them (the mean of the k) is past a threshold, it's flagged.
// New items arrive one by one: lines to their 3 nearest neighbors, the measured distance, and a bar in the
// chart below against the threshold. Normal ones join the baseline; about one in six lands far away and is
// flagged. The distances are computed for real.

const CYCLE = 12
const K = 3
const THRESHOLD = 0.12
const ARRIVALS = 6
const EVERY = 1.45
const FIRST = 0.5
const AR = 2.2
const CENTERS: Pt[] = [
  { x: 0.45, y: 0.4 },
  { x: 1.1, y: 0.66 },
  { x: 1.76, y: 0.36 },
]

type Arrival = {
  at: Pt
  hits: { i: number; d: number }[]
  score: number
  anomaly: boolean
}
type State = {
  w: number
  h: number
  p: Palette
  baseline: Pt[]
  cycle: number
  arrivals: Arrival[]
  still: boolean
}

const d2 = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

function measure(points: Pt[], at: Pt) {
  const hits = nearest(points, (q) => d2(q, at), K)
  return { hits, score: hits.reduce((sum, { d }) => sum + d, 0) / K }
}

// The arrivals of one cycle: normal ones from the clusters, under the threshold, and one far from everything.
function arrive(baseline: Pt[], cycle: number): Arrival[] {
  const rand = rng(400 + cycle * 31)
  const odd = 2 + Math.floor(rand() * 3)
  const known = [...baseline]
  const out: Arrival[] = []
  for (let n = 0; n < ARRIVALS; n++) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const anomaly = n === odd
      const c = CENTERS[Math.floor(rand() * CENTERS.length)]!
      const at = anomaly
        ? { x: 0.12 + rand() * (AR - 0.24), y: 0.1 + rand() * 0.8 }
        : { x: c.x + gauss(rand) * 0.12, y: c.y + gauss(rand) * 0.1 }
      const { hits, score } = measure(known, at)
      if (
        anomaly
          ? score < THRESHOLD * 1.8 || score > THRESHOLD * 3.2
          : score > THRESHOLD * 0.7
      )
        continue
      out.push({ at, hits, score, anomaly: score > THRESHOLD })
      // A normal item joins the baseline, so the next ones are measured against it too.
      if (score <= THRESHOLD) known.push(at)
      break
    }
  }
  return out
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(64)
    const baseline: Pt[] = []
    CENTERS.forEach((c) => {
      for (let i = 0; i < 40; i++)
        baseline.push({
          x: c.x + gauss(rand) * 0.14,
          y: c.y + gauss(rand) * 0.11,
        })
    })
    return {
      w,
      h,
      p,
      baseline,
      cycle: 0,
      arrivals: arrive(baseline, 0),
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.arrivals = arrive(s.baseline, cycle)
    }
    const e = s.still ? CYCLE - 1.6 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.1)) / 1)
    const wide = w >= 520

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The space above, the chart of distances below.
    const m = wide ? 24 : 10
    const chartH = wide ? 64 : 34
    const field: Box = { x: m, y: wide ? 52 : 26, w: w - 2 * m, h: 0 }
    const chart: Box = {
      x: m,
      y: h - (wide ? 20 : 10) - chartH,
      w: w - 2 * m,
      h: chartH,
    }
    field.h = chart.y - (wide ? 20 : 10) - field.y
    const scale = Math.min(field.w / AR, field.h)
    const ox = field.x + (field.w - AR * scale) / 2
    const oy = field.y + (field.h - scale) / 2
    const px = (q: Pt): Pt => ({ x: ox + q.x * scale, y: oy + q.y * scale })

    // Header.
    if (wide) {
      const baseline = `BASELINE  ${s.baseline.length} POINTS`
      labelRow(
        ctx,
        p,
        [
          ["BASELINE", p.star],
          [`${s.baseline.length} POINTS`, p.label],
        ],
        m,
        24
      )
      labelRow(
        ctx,
        p,
        [
          [`KNN ${K}`, p.star],
          ["MEAN DISTANCE", p.label],
        ],
        m + textWidth(ctx, p, baseline) + 32,
        24
      )
    }
    labelRow(
      ctx,
      p,
      [
        ["THRESHOLD", p.label],
        [THRESHOLD.toFixed(2), p.star],
      ],
      w - m,
      wide ? 24 : 14,
      { align: "right" }
    )
    if (!wide) labelRow(ctx, p, [[`KNN ${K}`, p.star]], m, 14)

    // The baseline, with the normal arrivals that have joined it.
    ctx.fillStyle = p.star
    ctx.globalAlpha = 0.75
    for (const q of s.baseline) {
      const { x, y } = px(q)
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // The chart: the threshold, and a bar per arrival.
    const slot = Math.min(chart.w / ARRIVALS, wide ? 96 : 48)
    const top = THRESHOLD * 3.4
    const barY = (v: number) =>
      chart.y + chart.h - (Math.min(v, top) / top) * chart.h
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.moveTo(chart.x, chart.y + chart.h + 0.5)
    ctx.lineTo(chart.x + chart.w, chart.y + chart.h + 0.5)
    ctx.stroke()
    const ty = Math.round(barY(THRESHOLD)) + 0.5
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = p.label
    ctx.beginPath()
    ctx.moveTo(chart.x, ty)
    ctx.lineTo(chart.x + chart.w, ty)
    ctx.stroke()
    ctx.setLineDash([])
    if (wide) labelRow(ctx, p, [["DISTANCE", p.label]], chart.x, chart.y - 2)

    s.arrivals.forEach((a, n) => {
      const start = FIRST + n * EVERY
      const local = e - start
      if (local < 0) return
      const show = ease(local / 0.25) * fade
      const reach = ease((local - 0.2) / 0.35) * fade
      const measured = ease((local - 0.5) / 0.3) * fade
      const settle = ease((local - 1.1) / 0.3)
      const q = px(a.at)
      const anomaly = a.anomaly

      // Lines to the k nearest neighbors, which fade once a normal item has joined.
      const lines = reach * (anomaly ? 1 - 0.5 * settle : 1 - settle)
      if (lines > 0)
        a.hits.forEach(({ i }) => {
          const target =
            i < s.baseline.length
              ? s.baseline[i]!
              : s.arrivals.filter((b) => !b.anomaly)[i - s.baseline.length]?.at
          if (!target) return
          const b = px(target)
          ctx.strokeStyle = alpha(
            anomaly && settle > 0.5 ? p.accent : p.glow,
            0.75 * lines
          )
          ctx.beginPath()
          ctx.moveTo(q.x, q.y)
          ctx.lineTo(q.x + (b.x - q.x) * reach, q.y + (b.y - q.y) * reach)
          ctx.stroke()
        })

      // The item: a query while it's measured, then a point in the baseline, or a flagged anomaly.
      crosshair(ctx, p, q.x, q.y, show * (1 - settle))
      if (anomaly) {
        ctx.globalAlpha = settle * fade
        ctx.fillStyle = p.accent
        ctx.strokeStyle = p.accent
        ctx.beginPath()
        ctx.arc(q.x, q.y, 2.4, 0, TAU)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(q.x, q.y, 7, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
      } else {
        ctx.globalAlpha = 0.75 * settle * fade
        ctx.fillStyle = p.star
        ctx.beginPath()
        ctx.arc(q.x, q.y, 1.6, 0, TAU)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // The measured distance next to it, kept for an anomaly.
      const label = measured * (anomaly ? 1 : 1 - settle)
      if (label > 0) {
        const right = q.x < w - 150
        const text = a.score.toFixed(3)
        const parts: (string | [string, string])[] =
          anomaly && settle > 0.5 && wide
            ? [["ANOMALY", p.accent], text]
            : [text]
        readout(ctx, p, parts, right ? q.x + 14 : q.x - 14, q.y - 18, {
          opacity: label,
          align: right ? "left" : "right",
          mark: anomaly && settle > 0 ? p.accent : undefined,
        })
      }

      // Its bar in the chart.
      const bx = chart.x + n * slot + slot / 2
      const bar = measured
      if (bar > 0) {
        const y = barY(a.score * bar)
        ctx.fillStyle = alpha(anomaly ? p.accent : p.glow, 0.9 * bar)
        ctx.fillRect(Math.round(bx - 4), y, 8, chart.y + chart.h - y)
      }
    })

    if (wide)
      labelRow(
        ctx,
        p,
        [["THRESHOLD", p.label]],
        chart.x + chart.w,
        Math.round(barY(THRESHOLD)) - 9,
        { align: "right" }
      )
  },
}

export function Anomaly() {
  return <SceneCanvas scene={scene} />
}
