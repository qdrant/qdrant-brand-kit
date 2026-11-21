"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, dimension, gauss, labelRow, readout, type Pt } from "./lib"

// Distance matrix: 14 points in three clusters on the left, and their pairwise distances on the right as a
// dot-matrix heatmap (bigger dots are closer), ordered by cluster so the blocks show. A crosshair picks a
// row and a column: the pair is measured on the scatter, and the readout gives their distance and the row's
// nearest neighbor. The pointer moves it (over the matrix, or near a point); at rest it wanders.

const N = 14
const SIZES = [5, 5, 4]

type State = {
  w: number
  h: number
  p: Palette
  points: Pt[]
  d: number[][]
  far: number
  ci: number
  cj: number
  last: number
}

const name = (i: number) => `P${String(i).padStart(2, "0")}`

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(51)
    const centers = [
      { x: 0.26, y: 0.3 },
      { x: 0.72, y: 0.36 },
      { x: 0.42, y: 0.76 },
    ]
    const points: Pt[] = []
    SIZES.forEach((n, c) => {
      for (let i = 0; i < n; i++)
        points.push({
          x: clamp(centers[c].x + gauss(rand) * 0.08, 0.05, 0.95),
          y: clamp(centers[c].y + gauss(rand) * 0.08, 0.05, 0.95),
        })
    })
    const d = points.map((a) => points.map((b) => Math.hypot(a.x - b.x, a.y - b.y)))
    const far = Math.max(...d.flat())
    return { w, h, p, points, d, far, ci: 2, cj: 8, last: -1 }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h, d } = s
    const c = Math.max(12, Math.min(20, Math.floor(Math.min(h - 150, (w - 140) * 0.5) / N)))
    const M = N * c
    const mx = w - 28 - M
    const my = Math.round((h - M) / 2) + 4
    const S = Math.max(120, Math.min(M + 20, mx - 40 - 64))
    const sx = 32
    const sy = my + (M - S) / 2
    const at = (q: Pt) => ({ x: sx + q.x * S, y: sy + q.y * S })

    // The crosshair's target: the cell or the points under the pointer, else a slow wander.
    let ti = Math.floor((0.5 + 0.5 * Math.sin(t * 0.29)) * N * 0.999)
    let tj = Math.floor((0.5 + 0.5 * Math.sin(t * 0.41 + 2)) * N * 0.999)
    if (pointer.inside) {
      if (pointer.x >= mx && pointer.x < mx + M && pointer.y >= my && pointer.y < my + M) {
        tj = Math.floor((pointer.x - mx) / c)
        ti = Math.floor((pointer.y - my) / c)
      } else if (pointer.x < mx - 20) {
        const order = s.points
          .map((q, i) => ({ i, d: Math.hypot(at(q).x - pointer.x, at(q).y - pointer.y) }))
          .sort((a, b) => a.d - b.d)
        ti = order[0].i
        tj = order[1].i
      }
    }
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    const k = Math.min(1, dt * 9)
    s.ci += (ti - s.ci) * k
    s.cj += (tj - s.cj) * k
    const i = clamp(Math.round(s.ci), 0, N - 1)
    const j = clamp(Math.round(s.cj), 0, N - 1)
    let nn = i === 0 ? 1 : 0
    for (let n = 0; n < N; n++) if (n !== i && d[i][n] < d[i][nn]) nn = n

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The crosshair bands, under the cells.
    ctx.fillStyle = alpha(p.glow, 0.12)
    ctx.fillRect(mx, my + s.ci * c, M, c)
    ctx.fillRect(mx + s.cj * c, my, c, M)

    // The matrix: a faint frame, the cluster blocks, then a dot per pair.
    ctx.strokeStyle = p.grid
    ctx.strokeRect(mx + 0.5, my + 0.5, M, M)
    ctx.strokeStyle = p.line
    let start = 0
    for (const n of SIZES) {
      ctx.strokeRect(mx + start * c + 0.5, my + start * c + 0.5, n * c, n * c)
      start += n
    }
    for (let r = 0; r < N; r++)
      for (let q = 0; q < N; q++) {
        const near = 1 - d[r][q] / s.far
        ctx.globalAlpha = 0.25 + 0.75 * near
        ctx.fillStyle = near > 0.75 ? p.bright : p.star
        ctx.beginPath()
        ctx.arc(mx + q * c + c / 2, my + r * c + c / 2, 0.7 + (c * 0.4 - 0.7) * near * near, 0, TAU)
        ctx.fill()
      }
    ctx.globalAlpha = 1
    ctx.strokeStyle = p.accent
    ctx.strokeRect(mx + j * c + 0.5, my + i * c + 0.5, c, c)

    // Labels: every row, every other column.
    for (let n = 0; n < N; n++) {
      const on = n === i
      label(ctx, p, String(n).padStart(2, "0"), mx - 8, my + n * c + c / 2, {
        align: "right",
        color: on ? p.star : p.label,
        opacity: on ? 1 : 0.7,
      })
      if (n % 2 === 0 || n === j)
        label(ctx, p, String(n).padStart(2, "0"), mx + n * c + c / 2, my - 12, {
          align: "center",
          color: n === j ? p.star : p.label,
          opacity: n === j ? 1 : 0.7,
        })
    }

    // The scatter: a frame with quarter lines, the points, and the chosen pair measured.
    ctx.strokeStyle = p.grid
    ctx.beginPath()
    for (const f of [0.25, 0.5, 0.75]) {
      ctx.moveTo(sx + f * S + 0.5, sy)
      ctx.lineTo(sx + f * S + 0.5, sy + S)
      ctx.moveTo(sx, sy + f * S + 0.5)
      ctx.lineTo(sx + S, sy + f * S + 0.5)
    }
    ctx.stroke()
    ctx.strokeStyle = p.line
    ctx.strokeRect(sx + 0.5, sy + 0.5, S, S)
    const a = at(s.points[i])
    const b = at(s.points[j])
    const m = at(s.points[nn])
    ctx.strokeStyle = alpha(p.line, 0.9)
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(m.x, m.y)
    ctx.stroke()
    ctx.setLineDash([])
    if (i !== j) {
      ctx.strokeStyle = p.glow
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
      if (Math.hypot(b.x - a.x, b.y - a.y) > 48) dimension(ctx, p, a, b, d[i][j].toFixed(3), 14)
    }
    s.points.forEach((q, n) => {
      const { x, y } = at(q)
      const on = n === i || n === j
      ctx.fillStyle = on ? p.bright : p.star
      ctx.beginPath()
      ctx.arc(x, y, on ? 3 : 2.2, 0, TAU)
      ctx.fill()
      if (on) {
        ctx.strokeStyle = p.bright
        ctx.beginPath()
        ctx.arc(x, y, 6.5, 0, TAU)
        ctx.stroke()
        label(ctx, p, name(n), x + 10, y + (n === i ? -10 : 10), { color: p.star })
      }
    })

    readout(ctx, p, [`${name(i)}  ${name(j)}`, [`D ${d[i][j].toFixed(3)}`, p.label]], mx, my + M + 28)
    labelRow(ctx, p, [[`NN ${name(i)}`, p.label], [name(nn), p.star], [d[i][nn].toFixed(3), p.label]], mx, my + M + 54)
  },
}

export function DistanceMatrix() {
  return <SceneCanvas scene={scene} />
}
