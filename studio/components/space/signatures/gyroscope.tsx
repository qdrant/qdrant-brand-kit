"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, crosshair, ids, labelRow, project, readout, turn, type V3 } from "./lib"

// Gyroscope: a query at the center and three rings around it at distances 0.12, 0.24 and 0.36, tilted in
// 3D and turning on their own axes like the gimbals of a gyroscope. The results ride their ring, the far
// side faint; those facing the viewer show their id and distance. A spin axis and degree ticks measure it.

const RINGS = [
  { r: 0.48, d: 0.12, n: 2 },
  { r: 0.74, d: 0.24, n: 3 },
  { r: 1, d: 0.36, n: 3 },
]
const SEGMENTS = 120

type State = { w: number; h: number; p: Palette; names: string[][]; phases: number[][] }

const rotX = ([x, y, z]: V3, a: number): V3 => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
const rotY = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
const rotZ = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]

// Each ring's orientation at time t: a horizontal circle turned by its gimbal.
const orient = (ring: number, v: V3, t: number): V3 => {
  if (ring === 0) return rotZ(rotX(v, t * 0.5 + 0.3), 0.6)
  if (ring === 1) return rotX(rotZ(v, t * 0.32 + 1), 1.15)
  return rotY(rotX(v, 0.22), t * 0.16)
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(77)
    const names = RINGS.map((ring) => ids(ring.n, rand))
    const phases = RINGS.map((ring) => Array.from({ length: ring.n }, (_, k) => (k / ring.n) * TAU + rand() * 0.8))
    return { w, h, p, names, phases }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const scale = Math.min(w * 0.3, h * 0.4)
    const cx = w >= 560 ? w * 0.56 : w * 0.5
    const cy = h * 0.5
    const yaw = 0.35 + Math.sin(t * 0.07) * 0.2
    const at = (v: V3) => project(turn(v, yaw, 0.3), cx, cy, scale, 6)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The spin axis.
    const north = at([0, 1.22, 0])
    const south = at([0, -1.22, 0])
    ctx.strokeStyle = p.line
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(north.x, north.y)
    ctx.lineTo(south.x, south.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    for (const end of [north, south]) {
      ctx.moveTo(end.x - 5, end.y)
      ctx.lineTo(end.x + 5, end.y)
    }
    ctx.stroke()

    // Rings, segment by segment, brighter toward the viewer.
    type Sat = { x: number; y: number; z: number; k: number; ring: number; n: number }
    const sats: Sat[] = []
    RINGS.forEach((ring, i) => {
      const point = (a: number) => at(orient(i, [Math.cos(a) * ring.r, 0, Math.sin(a) * ring.r], t))
      let prev = point(0)
      for (let k = 1; k <= SEGMENTS; k++) {
        const next = point((k / SEGMENTS) * TAU)
        const z = clamp(((prev.z + next.z) / 2 / ring.r + 1) / 2)
        ctx.strokeStyle = alpha(i === 2 ? p.glow : p.bright, 0.12 + 0.7 * z)
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(next.x, next.y)
        ctx.stroke()
        prev = next
      }
      // Degree ticks on the outer ring.
      if (i === 2)
        for (let deg = 0; deg < 360; deg += 10) {
          const a = (deg * Math.PI) / 180
          const from = point(a)
          const to = at(orient(i, [Math.cos(a) * ring.r * (deg % 30 ? 1.04 : 1.07), 0, Math.sin(a) * ring.r * (deg % 30 ? 1.04 : 1.07)], t))
          ctx.strokeStyle = alpha(p.line, 0.3 + 0.7 * clamp((from.z / ring.r + 1) / 2))
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()
        }
      s.phases[i].forEach((phase, n) => {
        const a = phase + (t * 0.35) / ring.r
        sats.push({ ...point(a), ring: i, n })
      })
    })

    // The query at the center.
    crosshair(ctx, p, cx, cy)

    // Results, back to front; the front ones labeled.
    sats.sort((a, b) => a.z - b.z)
    for (const sat of sats) {
      const ring = RINGS[sat.ring]
      const front = clamp((sat.z / ring.r + 1) / 2)
      ctx.globalAlpha = 0.3 + 0.7 * front
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(sat.x, sat.y, 2.6 * sat.k, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
      if (front > 0.62) {
        const on = clamp((front - 0.62) / 0.15)
        ctx.strokeStyle = alpha(p.star, on)
        ctx.beginPath()
        ctx.arc(sat.x, sat.y, 6, 0, TAU)
        ctx.stroke()
        labelRow(
          ctx,
          p,
          [
            [s.names[sat.ring][sat.n], p.star],
            [ring.d.toFixed(2), p.label],
          ],
          sat.x + 10,
          sat.y - 10,
          { opacity: on }
        )
      }
    }

    // The rings' distances, as a table.
    if (w >= 560) {
      label(ctx, p, "RING  DIST  PTS", 24, 32)
      RINGS.forEach((ring, i) =>
        label(ctx, p, `${i + 1}     ${ring.d.toFixed(2)}  ${ring.n}`, 24, 52 + i * 18, { color: p.star })
      )
    }
    const total = RINGS.reduce((sum, ring) => sum + ring.n, 0)
    readout(ctx, p, [`K ${total}`, [`DIST ≤ ${RINGS[2].d.toFixed(2)}`, p.label]], 24, h - 28)
  },
}

export function Gyroscope() {
  return <SceneCanvas scene={scene} />
}
