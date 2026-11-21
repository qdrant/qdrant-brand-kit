"use client"

import { clamp, ease, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, gauss, labelRow, prefersStill } from "./lib"

// Quantization: one vector of 32 values, compressed step by step. Float32 bars first, then scalar
// quantization to int8 (round(v / max * 127), drawn as dot stacks), then binary quantization (the sign, one
// bit per value, packed into four bytes). Each step reads out its size, its ratio and, for int8, the mean
// error after decoding. One value is followed through all three. A new vector every cycle.

const D = 32
const CYCLE = 10
const PITCH = 4

type Vector = { v: number[]; q: number[]; bits: number[]; bytes: string[]; error: number; follow: number }
type State = { w: number; h: number; p: Palette; cycle: number; vector: Vector; still: boolean }

function make(cycle: number): Vector {
  const rand = rng(610 + cycle)
  const v = Array.from({ length: D }, () => clamp(gauss(rand) * 0.36, -0.98, 0.98))
  const scale = Math.max(...v.map(Math.abs))
  const q = v.map((x) => Math.round((x / scale) * 127))
  const error = v.reduce((sum, x, i) => sum + Math.abs(x - (q[i] * scale) / 127), 0) / D
  const bits = v.map((x): number => (x > 0 ? 1 : 0))
  const bytes = [0, 1, 2, 3].map((b) => {
    const byte = bits.slice(b * 8, b * 8 + 8).reduce((n, bit) => n * 2 + bit, 0)
    return `0x${byte.toString(16).toUpperCase().padStart(2, "0")}`
  })
  // Follow a value that's clearly positive or negative, away from the edges.
  let follow = 8
  for (let i = 8; i < 24; i++) if (Math.abs(v[i]) > Math.abs(v[follow])) follow = i
  return { v, q, bits, bytes, error, follow }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, cycle: 0, vector: make(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.vector = make(cycle)
    }
    const e = s.still ? 6 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.1)) / 0.9)
    const { v, q, bits, bytes, error, follow } = s.vector

    const wide = w >= 560
    const x0 = wide ? 128 : 24
    const pitch = Math.max(8, Math.min(14, Math.floor((w - x0 - (wide ? 150 : 24)) / D)))
    const width = pitch * D
    const A = Math.min(36, h * 0.085)
    const rows = [h * 0.24, h * 0.53, h * 0.8]
    const col = (j: number) => x0 + j * pitch + pitch / 2
    const xs = x0 + width + 28

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Guides: a baseline per row and the +1 and -1 lines of the first two.
    rows.forEach((y, r) => {
      ctx.strokeStyle = p.line
      ctx.beginPath()
      ctx.moveTo(x0, y + 0.5)
      ctx.lineTo(x0 + width, y + 0.5)
      ctx.stroke()
      if (r === 2) return
      ctx.strokeStyle = p.grid
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      for (const dy of [-A, A]) {
        ctx.moveTo(x0, y + dy + 0.5)
        ctx.lineTo(x0 + width, y + dy + 0.5)
      }
      ctx.stroke()
      ctx.setLineDash([])
    })

    // The value followed through every step: a dashed column.
    const fx = col(follow)
    const followOn = clamp((e - 1.2) / 0.4) * fade
    ctx.strokeStyle = alpha(p.line, followOn)
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    for (const [a, b] of [
      [rows[0] - A, rows[0] + A],
      [rows[1] - A, rows[1] + A],
      [rows[2] - 14, rows[2] + 6],
    ]) {
      ctx.moveTo(fx, a)
      ctx.lineTo(fx, b)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Float32: hairline bars with a cap.
    const grow = (j: number) => ease((e - 0.2 - j * 0.025) / 0.5) * fade
    ctx.strokeStyle = p.star
    ctx.fillStyle = p.star
    for (let j = 0; j < D; j++) {
      const k = grow(j)
      if (k <= 0) continue
      const x = col(j)
      const top = rows[0] - v[j] * A * k
      ctx.globalAlpha = Math.max(0.001, fade)
      ctx.beginPath()
      ctx.moveTo(x, rows[0])
      ctx.lineTo(x, top)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, top, 1.6, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Int8: a stack of dots per value, one dot for every 4px of the bar.
    ctx.fillStyle = p.bright
    for (let j = 0; j < D; j++) {
      const k = clamp((e - 1.6 - j * 0.03) / 0.3) * fade
      if (k <= 0) continue
      const n = Math.round(((Math.abs(q[j]) / 127) * A) / PITCH)
      const sign = Math.sign(q[j])
      ctx.globalAlpha = k
      ctx.beginPath()
      for (let m = 1; m <= n; m++) {
        const y = rows[1] - sign * m * PITCH
        ctx.moveTo(col(j) + 1.3, y)
        ctx.arc(col(j), y, 1.3, 0, TAU)
      }
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Binary: one cell per value, filled for 1, open for 0, a tick between bytes, and the bytes below.
    for (let j = 0; j < D; j++) {
      const k = clamp((e - 3 - j * 0.03) / 0.3) * fade
      if (k <= 0) continue
      const x = col(j)
      ctx.globalAlpha = k
      if (bits[j]) {
        ctx.fillStyle = p.star
        ctx.fillRect(x - 3, rows[2] - 9, 6, 6)
      } else {
        ctx.strokeStyle = p.dim
        ctx.strokeRect(x - 2.5, rows[2] - 8.5, 5, 5)
      }
    }
    ctx.globalAlpha = 1
    ctx.strokeStyle = p.line
    ctx.beginPath()
    for (let b = 0; b <= 4; b++) {
      const x = x0 + b * 8 * pitch + 0.5
      ctx.moveTo(x, rows[2] - 4)
      ctx.lineTo(x, rows[2] + 5)
    }
    ctx.stroke()
    bytes.forEach((byte, b) => {
      const on = clamp((e - 3.3 - b * 0.24) / 0.3) * fade
      label(ctx, p, byte, x0 + (b + 0.5) * 8 * pitch, rows[2] + 18, { align: "center", opacity: on })
    })

    // The followed value at each step, with the accent mark over it.
    const values = [v[follow].toFixed(4), String(q[follow]), String(bits[follow])]
    const starts = [1.2, 2.4, 3.8]
    rows.forEach((y, r) => {
      const on = clamp((e - starts[r]) / 0.3) * fade
      const top = r === 2 ? y - 22 : y - A - 12
      label(ctx, p, values[r], fx, top, { align: "center", color: p.star, opacity: on })
    })
    ctx.fillStyle = alpha(p.accent, followOn)
    ctx.beginPath()
    ctx.moveTo(fx - 4, rows[0] - A - 26)
    ctx.lineTo(fx + 4, rows[0] - A - 26)
    ctx.lineTo(fx, rows[0] - A - 20)
    ctx.closePath()
    ctx.fill()

    // Each step: its name and layout on the left, its size and a size bar on the right.
    const steps = [
      { name: "FLOAT32", each: "32 × 4 B", bytes: 128, note: "" },
      { name: "INT8", each: "32 × 1 B", bytes: 32, note: `ERR ${error.toFixed(4)}` },
      { name: "BINARY", each: "32 × 1 BIT", bytes: 4, note: "SIGN" },
    ]
    const appear = [0.6, 2, 3.4]
    steps.forEach((step, r) => {
      const on = clamp((e - appear[r]) / 0.4) * fade
      const y = rows[r]
      if (wide) {
        label(ctx, p, step.name, 24, y - 9, { color: p.star, opacity: on })
        label(ctx, p, step.each, 24, y + 9, { opacity: on })
        const size = `${step.bytes} B`
        const ratio = step.bytes === 128 ? "" : `×${128 / step.bytes}`
        labelRow(ctx, p, [[size, p.star], [ratio, p.label]], xs, y - 18, { opacity: on })
        const bar = 96
        ctx.globalAlpha = on
        ctx.strokeStyle = p.line
        ctx.strokeRect(xs + 0.5, y - 5.5, bar, 6)
        ctx.fillStyle = p.bright
        ctx.fillRect(xs + 1, y - 5, Math.max(1, (bar - 1) * (step.bytes / 128)), 5)
        ctx.globalAlpha = 1
        if (step.note) label(ctx, p, step.note, xs, y + 16, { opacity: on })
      }
    })

    // Arrows between the steps.
    if (wide) {
      ctx.strokeStyle = p.line
      for (const r of [0, 1]) {
        const on = clamp((e - appear[r + 1] + 0.3) / 0.3) * fade
        if (on <= 0) continue
        const ya = rows[r] + 26
        const yb = rows[r + 1] - 26
        ctx.globalAlpha = on
        ctx.beginPath()
        ctx.moveTo(52, ya)
        ctx.lineTo(52, yb)
        ctx.moveTo(48, yb - 4)
        ctx.lineTo(52, yb)
        ctx.lineTo(56, yb - 4)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }
  },
}

export function Quantization() {
  return <SceneCanvas scene={scene} />
}
