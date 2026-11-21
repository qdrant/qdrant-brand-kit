"use client"

import { clamp, ease, rng, spread } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, closerTo, crosshair, gauss, markBox, placeLabel, poly, prefersStill, readout, textWidth, type Box, type Pt } from "./lib"

// k-means: 200 points and 5 centroids iterating for real. Each step assigns every point to its nearest
// centroid (the spokes), then moves each centroid to the mean of its points, with the Voronoi cells redrawn
// as they move and each centroid's path left behind. When no point changes cluster it has converged; a
// query then probes the cell of its nearest centroid, the way an IVF index searches. Then it reseeds.

const K = 5
const PER = 40
const ASSIGN = 0.7
const MOVE = 0.9
const INTRO = 0.8
const PROBE = 3.2
const FADE = 0.8
const MAX_ITER = 12

type Run = {
  points: Pt[]
  cents: Pt[][]
  assign: number[][]
  moved: number[]
  inertia: number[]
  iters: number
  query: Pt
  length: number
}
type State = { w: number; h: number; p: Palette; aspect: number; cycle: number; since: number; run: Run; still: boolean }

const nearestOf = (q: Pt, cents: Pt[]) => {
  let best = 0
  cents.forEach((c, k) => {
    if ((c.x - q.x) ** 2 + (c.y - q.y) ** 2 < (cents[best].x - q.x) ** 2 + (cents[best].y - q.y) ** 2) best = k
  })
  return best
}

function cluster(aspect: number, cycle: number): Run {
  const rand = rng(810 + cycle)
  const blobs = spread(K, aspect * 0.76, 0.72, rand).map(({ x, y }) => ({ x: x + aspect * 0.12, y: y + 0.14 }))
  const points: Pt[] = []
  for (const blob of blobs) {
    const sigma = 0.05 + rand() * 0.04
    for (let i = 0; i < PER; i++)
      points.push({
        x: clamp(blob.x + gauss(rand) * sigma * 1.2, 0.02, aspect - 0.02),
        y: clamp(blob.y + gauss(rand) * sigma, 0.02, 0.98),
      })
  }
  // Start from K random points (Forgy), so it takes a few steps to settle. A start that hasn't converged in
  // MAX_ITER steps is replaced by another, up to three times.
  let cents: Pt[][] = []
  let assign: number[][] = []
  let moved: number[] = []
  let inertia: number[] = []
  for (let attempt = 0; attempt < 3; attempt++) {
    const picks = new Set<number>()
    while (picks.size < K) picks.add(Math.floor(rand() * points.length))
    cents = [[...picks].map((i) => ({ ...points[i] }))]
    assign = []
    moved = []
    inertia = []
    iterate(points, cents, assign, moved, inertia)
    if (moved[moved.length - 1] === 0) break
  }
  const iters = assign.length
  const query = { x: aspect * (0.2 + rand() * 0.6), y: 0.2 + rand() * 0.6 }
  return { points, cents, assign, moved, inertia, iters, query, length: INTRO + iters * (ASSIGN + MOVE) + PROBE + FADE }
}

// Lloyd's iterations: assign each point to its nearest centroid, move each centroid to its points' mean,
// until no point changes cluster or MAX_ITER steps.
function iterate(points: Pt[], cents: Pt[][], assign: number[][], moved: number[], inertia: number[]) {
  for (let it = 0; it < MAX_ITER; it++) {
    const current = cents[it]
    const labels = points.map((q) => nearestOf(q, current))
    const previous = assign[it - 1]
    assign.push(labels)
    moved.push(previous ? labels.filter((l, i) => l !== previous[i]).length : points.length)
    inertia.push(points.reduce((sum, q, i) => sum + (q.x - current[labels[i]].x) ** 2 + (q.y - current[labels[i]].y) ** 2, 0))
    const next = current.map((c, k) => {
      const members = points.filter((_, i) => labels[i] === k)
      if (!members.length) return { ...c }
      return {
        x: members.reduce((sum, q) => sum + q.x, 0) / members.length,
        y: members.reduce((sum, q) => sum + q.y, 0) / members.length,
      }
    })
    cents.push(next)
    if (previous && moved[it] === 0) break
  }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const aspect = (w - 48) / (h - 76)
    return { w, h, p, aspect, cycle: 0, since: 0, run: cluster(aspect, 0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    let e = t - s.since
    if (e > s.run.length) {
      s.cycle += 1
      s.since = t
      s.run = cluster(s.aspect, s.cycle)
      e = 0
    }
    const { points, cents, assign, iters, query } = s.run
    const converged = INTRO + iters * (ASSIGN + MOVE)
    if (s.still) e = converged + 1.2
    const fade = 1 - clamp((e - (s.run.length - FADE)) / FADE)

    const box = { x: 24, y: 20, size: h - 76 }
    const at = (q: Pt) => ({ x: box.x + q.x * box.size, y: box.y + q.y * box.size })
    const rect: Pt[] = [
      { x: 0, y: 0 },
      { x: s.aspect, y: 0 },
      { x: s.aspect, y: 1 },
      { x: 0, y: 1 },
    ]

    // Where the run is: the iteration, its phase, and the centroids now.
    const step = Math.floor((e - INTRO) / (ASSIGN + MOVE))
    const it = clamp(step, 0, iters - 1)
    const local = e - INTRO - it * (ASSIGN + MOVE)
    let centers: Pt[]
    if (e < INTRO) centers = cents[0]
    else if (step >= iters) centers = cents[iters]
    else if (local < ASSIGN) centers = cents[it]
    else {
      const k = ease((local - ASSIGN) / MOVE)
      centers = cents[it].map((c, n) => ({ x: c.x + (cents[it + 1][n].x - c.x) * k, y: c.y + (cents[it + 1][n].y - c.y) * k }))
    }
    const shownIt = e < INTRO ? -1 : step >= iters ? iters - 1 : it
    const blend = e < INTRO ? 0 : step >= iters ? 1 : clamp(local / (ASSIGN * 0.7))
    const probing = clamp((e - converged - 0.2) / 0.4)
    const probe = nearestOf(query, cents[iters])

    clear(ctx, p, w, h)
    ctx.lineWidth = 1
    ctx.globalAlpha = fade

    // Voronoi cells of the centroids now; the probed one filled.
    const cells = centers.map((c, n) => centers.reduce((cell, o, m) => (m === n ? cell : closerTo(cell, c, o)), rect))
    if (probing > 0) {
      poly(ctx, cells[probe].map(at))
      ctx.fillStyle = alpha(p.violet, 0.55 * probing)
      ctx.fill()
    }
    ctx.strokeStyle = p.line
    for (const cell of cells) {
      poly(ctx, cell.map(at))
      ctx.stroke()
    }

    // Spokes from each point to its centroid: the previous assignment fading into the new one.
    const spokes = (labels: number[] | undefined, a: number, only?: number) => {
      if (!labels || a <= 0) return
      ctx.strokeStyle = alpha(only === undefined ? p.line : p.glow, a * fade)
      ctx.beginPath()
      points.forEach((q, i) => {
        if (only !== undefined && labels[i] !== only) return
        const from = at(q)
        const to = at(centers[labels[i]])
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
      })
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    if (shownIt >= 0) {
      spokes(assign[shownIt - 1], (1 - blend) * 0.7)
      spokes(assign[shownIt], blend * 0.7)
    }
    if (probing > 0) spokes(assign[iters - 1], probing * 0.9, probe)

    // Points.
    ctx.fillStyle = alpha(p.star, clamp(e / 0.5) * fade)
    ctx.beginPath()
    for (const q of points) {
      const { x, y } = at(q)
      ctx.moveTo(x + 1.6, y)
      ctx.arc(x, y, 1.6, 0, TAU)
    }
    ctx.fill()

    // Centroid paths so far, then the centroids with their counts.
    const reached = e < INTRO ? 0 : step >= iters ? iters : it
    ctx.strokeStyle = alpha(p.glow, 0.7 * fade)
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    for (let n = 0; n < K; n++) {
      const first = at(cents[0][n])
      ctx.moveTo(first.x, first.y)
      for (let m = 1; m <= reached; m++) {
        const { x, y } = at(cents[m][n])
        ctx.lineTo(x, y)
      }
      const now = at(centers[n])
      ctx.lineTo(now.x, now.y)
    }
    ctx.stroke()
    ctx.setLineDash([])
    const counts = centers.map((_, n) => (shownIt >= 0 ? assign[shownIt].filter((l) => l === n).length : 0))
    const on = clamp((e - 0.3) / 0.4) * fade
    // Badges sit away from the frame's center and clear of the other centroids and badges.
    const marks = centers.map(at)
    const taken: Box[] = [...marks.map(({ x, y }) => markBox(x, y, 8)), { x: 16, y: h - 44, w: 420, h: 32 }]
    const badges = centers.map((_, n) => {
      const text = shownIt >= 0 ? `C${n + 1}  ${counts[n]}` : `C${n + 1}`
      const { x, y } = marks[n]
      const spot = placeLabel(taken, x, y, textWidth(ctx, p, text), { w, h }, { x: x - w / 2 || 1, y: y - h / 2 })
      return { text, spot: spot ?? { x: x + 10, y: y - 10, align: "left" as const } }
    })
    centers.forEach((c, n) => {
      const { x, y } = at(c)
      ctx.globalAlpha = on
      ctx.fillStyle = p.bg
      ctx.fillRect(x - 4.5, y - 4.5, 9, 9)
      ctx.strokeStyle = p.bright
      ctx.strokeRect(x - 4, y - 4, 8, 8)
      ctx.fillStyle = p.bright
      ctx.fillRect(x - 1, y - 1, 2, 2)
      ctx.globalAlpha = 1
      const { text, spot } = badges[n]
      label(ctx, p, text, spot.x, spot.y, { color: p.star, align: spot.align, opacity: on })
    })

    // The query, once it has converged.
    if (probing > 0) {
      const q = at(query)
      crosshair(ctx, p, q.x, q.y, probing * fade)
    }

    // The readout. It says converged only when the last step moved no point.
    const y = h - 28
    const end = s.run.moved[iters - 1] === 0 ? "CONVERGED" : "STOPPED"
    if (e >= converged)
      readout(
        ctx,
        p,
        probing > 0
          ? [end, [`ITER ${iters}`, p.label], `PROBE C${probe + 1}`, [`${assign[iters - 1].filter((l) => l === probe).length} PTS`, p.label]]
          : [end, [`ITER ${iters}`, p.label]],
        24,
        y,
        { opacity: fade }
      )
    else if (shownIt >= 0)
      readout(
        ctx,
        p,
        [`ITER ${shownIt + 1}`, [`MOVED ${s.run.moved[shownIt]}`, p.label], [`INERTIA ${s.run.inertia[shownIt].toFixed(3)}`, p.label]],
        24,
        y
      )
    else readout(ctx, p, [`K ${K}`, [`${points.length} PTS`, p.label]], 24, y)
  },
}

export function KMeans() {
  return <SceneCanvas scene={scene} />
}
