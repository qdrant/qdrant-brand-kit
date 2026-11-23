"use client"

import { rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, crosshair, ids, labelRow, readout } from "./lib"

// Ringed planet: a dotted sphere lit from above, turning slowly, inside a ring of 560 points in two bands,
// a collection in orbit. Inner points orbit faster (Kepler). A query sits on the ring; its 5 nearest ring
// points, found again every frame as they move, connect to it, and the nearest reads out. The bands'
// radii are measured.

const DOTS = 900
const RING = 560
const BANDS = [
  { from: 1.38, to: 1.72, share: 0.56 },
  { from: 1.84, to: 2.2, share: 0.44 },
]
const PITCH = 0.36
const ROLL = -0.2
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const LIGHT = (() => {
  const v = [-0.3, 0.85, 0.45]
  const n = Math.hypot(...v)
  return v.map((x) => x / n)
})()
const QUERY = { r: 1.96, a: 1.05 }
const K = 5

type Particle = { r: number; a: number; w: number; band: number }
type State = { w: number; h: number; p: Palette; dots: [number, number, number][]; ring: Particle[]; names: string[] }

// World to view: the ring plane is y = 0; pitch it toward the viewer, then roll it.
function view(x: number, y: number, z: number) {
  const cp = Math.cos(PITCH)
  const sp = Math.sin(PITCH)
  const y1 = y * cp - z * sp
  const z1 = y * sp + z * cp
  const cr = Math.cos(ROLL)
  const sr = Math.sin(ROLL)
  return { x: x * cr - y1 * sr, y: x * sr + y1 * cr, z: z1 }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(91)
    const dots: [number, number, number][] = []
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      dots.push([Math.cos(GOLDEN * i) * r, y, Math.sin(GOLDEN * i) * r])
    }
    const ring: Particle[] = []
    BANDS.forEach((band, b) => {
      const n = Math.round(RING * band.share)
      for (let i = 0; i < n; i++) {
        const r = band.from + Math.sqrt(rand()) * (band.to - band.from)
        ring.push({ r, a: rand() * TAU, w: 0.32 * Math.pow(r, -1.5), band: b })
      }
    })
    return { w, h, p, dots, ring, names: ids(ring.length, rand) }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const R = Math.min(h * 0.2, w * 0.15)
    const cx = w * 0.5
    const cy = h * 0.47
    const spin = t * 0.08
    const screen = (v: { x: number; y: number; z: number }) => ({ x: cx + v.x * R, y: cy - v.y * R, z: v.z })

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Ring points at this moment, in ring-plane and view coordinates.
    const ring = s.ring.map((q) => {
      const a = q.a + q.w * t
      const x = Math.cos(a) * q.r
      const z = Math.sin(a) * q.r
      return { px: x, pz: z, ...screen(view(x, 0, z)), band: q.band }
    })
    const hidden = (pt: { x: number; y: number; z: number }) => pt.z < 0 && (pt.x - cx) ** 2 + (pt.y - cy) ** 2 < R * R
    const drawRing = (front: boolean) => {
      for (const band of [0, 1]) {
        ctx.fillStyle = alpha(p.star, band === 0 ? 0.7 : 0.45)
        ctx.beginPath()
        for (const pt of ring) {
          if (pt.band !== band || pt.z >= 0 !== front || hidden(pt)) continue
          ctx.rect(pt.x - 0.6, pt.y - 0.6, 1.2, 1.2)
        }
        ctx.fill()
      }
    }

    // The back of the ring, the planet, then the front of the ring.
    drawRing(false)
    // The disc hides the back of the ring; a violet tint at the top is the light from above.
    const tint = ctx.createLinearGradient(cx, cy - R, cx, cy + R)
    tint.addColorStop(0, alpha(p.violet, 0.45))
    tint.addColorStop(0.6, alpha(p.violet, 0))
    ctx.fillStyle = p.bg
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, TAU)
    ctx.fill()
    ctx.fillStyle = tint
    ctx.fill()
    ctx.strokeStyle = p.line
    ctx.stroke()
    const cs = Math.cos(spin)
    const ss = Math.sin(spin)
    for (const [x0, y0, z0] of s.dots) {
      const v = view(x0 * cs + z0 * ss, y0, -x0 * ss + z0 * cs)
      if (v.z < 0) continue
      const lit = Math.max(0, v.x * LIGHT[0] + v.y * LIGHT[1] + v.z * LIGHT[2])
      const size = 0.5 + 0.9 * lit
      ctx.globalAlpha = 0.12 + 0.88 * lit
      ctx.fillStyle = p.star
      ctx.fillRect(cx + v.x * R - size / 2, cy - v.y * R - size / 2, size, size)
    }
    ctx.globalAlpha = 1
    drawRing(true)

    // The bands' radii, measured along the ring's left side.
    const tick = (r: number) => screen(view(-r, 0, 0))
    ctx.strokeStyle = p.label
    ctx.beginPath()
    for (const band of BANDS)
      for (const r of [band.from, band.to]) {
        const { x, y } = tick(r)
        ctx.moveTo(x, y + 6)
        ctx.lineTo(x, y + 14)
      }
    const a0 = tick(BANDS[0].from)
    const a1 = tick(BANDS[1].to)
    ctx.moveTo(a0.x, a0.y + 10)
    ctx.lineTo(a1.x, a1.y + 10)
    ctx.stroke()
    label(ctx, p, BANDS[0].from.toFixed(2), a0.x, a0.y + 26, { align: "center", opacity: 0.85 })
    label(ctx, p, BANDS[1].to.toFixed(2), a1.x, a1.y + 26, { align: "center", opacity: 0.85 })

    // The query on the ring and its nearest ring points, in the ring's own plane.
    const qx = Math.cos(QUERY.a) * QUERY.r
    const qz = Math.sin(QUERY.a) * QUERY.r
    const q = screen(view(qx, 0, qz))
    const hits = ring
      .map((pt, i) => ({ i, d: Math.hypot(pt.px - qx, pt.pz - qz) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, K)
    ctx.strokeStyle = alpha(p.glow, 0.8)
    ctx.beginPath()
    for (const { i } of hits) {
      ctx.moveTo(q.x, q.y)
      ctx.lineTo(ring[i].x, ring[i].y)
    }
    ctx.stroke()
    hits.forEach(({ i }, rank) => {
      ctx.fillStyle = p.bright
      ctx.beginPath()
      ctx.arc(ring[i].x, ring[i].y, rank === 0 ? 2.4 : 1.8, 0, TAU)
      ctx.fill()
    })
    const best = ring[hits[0].i]
    ctx.strokeStyle = p.star
    ctx.beginPath()
    ctx.arc(best.x, best.y, 6, 0, TAU)
    ctx.stroke()
    crosshair(ctx, p, q.x, q.y)
    const lx = Math.min(q.x + 52, w - 150)
    const ly = q.y + 44
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.moveTo(q.x + 9, q.y + 9)
    ctx.lineTo(lx - 6, ly)
    ctx.stroke()
    labelRow(ctx, p, [[s.names[hits[0].i], p.star], [`D ${hits[0].d.toFixed(3)}`, p.label]], lx, ly)

    // Counts.
    const counts = BANDS.map((_, b) => s.ring.filter((q) => q.band === b).length)
    if (w >= 560) {
      label(ctx, p, `PLANET  R 1.00  ${DOTS} PTS`, 24, 32)
      label(ctx, p, `BAND A  ${BANDS[0].from.toFixed(2)}  ${BANDS[0].to.toFixed(2)}  ${counts[0]} PTS`, 24, 50)
      label(ctx, p, `BAND B  ${BANDS[1].from.toFixed(2)}  ${BANDS[1].to.toFixed(2)}  ${counts[1]} PTS`, 24, 68)
    }
    readout(ctx, p, [`KNN ${K} / ${s.ring.length}`, [`TILT ${((PITCH * 180) / Math.PI).toFixed(1)}°`, p.label]], 24, h - 28)
  },
}

export function RingedPlanet() {
  return <SceneCanvas scene={scene} />
}
