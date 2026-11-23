"use client"

import { SceneCanvas, clear, alpha, label, type CanvasScene, type Palette } from "./scene"

// Dotted globe: a sphere of evenly spread dots (a Fibonacci lattice) turning slowly, with region markers
// and arcs between them carrying a pulse in the accent. The markers sit at the coordinates of a few large
// cloud hubs as placeholders; the real list would come from Qdrant Cloud, and a land mask is a next step.

const N = 1500
const TILT = 0.32
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const HUBS = [
  [38.9, -77.4],
  [45.6, -121.2],
  [50.1, 8.7],
  [53.3, -6.3],
  [19.1, 72.9],
  [1.35, 103.8],
  [35.7, 139.7],
  [-33.9, 151.2],
  [-23.5, -46.6],
]
const LINKS = [
  [0, 2],
  [3, 2],
  [2, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [1, 0],
  [0, 8],
  [1, 6],
]

type V = [number, number, number]
type State = { w: number; h: number; p: Palette; dots: V[]; hubs: V[] }

const fromLatLon = ([lat, lon]: number[]): V => {
  const a = (lat * Math.PI) / 180
  const b = (lon * Math.PI) / 180
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const dots: V[] = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      dots.push([Math.cos(GOLDEN * i) * r, y, Math.sin(GOLDEN * i) * r])
    }
    return { w, h, p, dots, hubs: HUBS.map(fromLatLon) }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const R = Math.min(w, h) * 0.38
    const cx = w * 0.5
    const cy = h * 0.5
    const yaw = t * 0.12 + 1.2
    const cy0 = Math.cos(yaw)
    const sy0 = Math.sin(yaw)
    const cx0 = Math.cos(TILT)
    const sx0 = Math.sin(TILT)
    const project = ([x, y, z]: V, lift = 1) => {
      const x1 = x * cy0 + z * sy0
      const z1 = -x * sy0 + z * cy0
      const y2 = y * cx0 - z1 * sx0
      const z2 = y * sx0 + z1 * cx0
      return { x: cx + x1 * R * lift, y: cy - y2 * R * lift, z: z2 }
    }

    clear(ctx, p, w, h)

    // Atmosphere, then the rim.
    const air = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.3)
    air.addColorStop(0, alpha(p.glow, 0))
    air.addColorStop(0.25, alpha(p.glow, 0.16))
    air.addColorStop(1, alpha(p.glow, 0))
    ctx.fillStyle = air
    ctx.fillRect(cx - R * 1.4, cy - R * 1.4, R * 2.8, R * 2.8)
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.stroke()

    // Dots: the far side faint, the near side brighter toward the viewer.
    for (const dot of s.dots) {
      const { x, y, z } = project(dot)
      if (z < 0) {
        ctx.globalAlpha = 0.07
        ctx.fillStyle = p.dim
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1)
        continue
      }
      ctx.globalAlpha = 0.2 + 0.8 * z
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 0.5 + 0.9 * z, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Arcs between hubs, lifted off the surface, each with a pulse.
    LINKS.forEach(([i, j], n) => {
      const a = s.hubs[i]
      const b = s.hubs[j]
      const angle = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
      const point = (u: number) => {
        const ka = Math.sin((1 - u) * angle) / Math.sin(angle)
        const kb = Math.sin(u * angle) / Math.sin(angle)
        const v: V = [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]
        return project(v, 1 + Math.sin(Math.PI * u) * angle * 0.16)
      }
      ctx.strokeStyle = p.glow
      let prev = point(0)
      for (let k = 1; k <= 32; k++) {
        const next = point(k / 32)
        ctx.globalAlpha = Math.max(0, Math.min(prev.z, next.z) + 0.15) * 0.8
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(next.x, next.y)
        ctx.stroke()
        prev = next
      }
      const pulse = point((t * 0.3 + n * 0.23) % 1)
      if (pulse.z > 0) {
        ctx.globalAlpha = 1
        ctx.fillStyle = p.accent
        ctx.beginPath()
        ctx.arc(pulse.x, pulse.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1

    s.hubs.forEach((hub, n) => {
      const { x, y, z } = project(hub)
      if (z < 0) return
      ctx.fillStyle = p.bright
      ctx.beginPath()
      ctx.arc(x, y, 2.6, 0, Math.PI * 2)
      ctx.fill()
      const ring = (t * 0.6 + n * 0.17) % 1
      ctx.globalAlpha = (1 - ring) * z
      ctx.strokeStyle = p.bright
      ctx.beginPath()
      ctx.arc(x, y, 4 + ring * 10, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    const lon = ((((yaw * 180) / Math.PI) % 360) + 360) % 360
    label(ctx, p, `LON ${lon.toFixed(1).padStart(5, "0")}°`, 16, h - 36)
    label(ctx, p, `TILT ${((TILT * 180) / Math.PI).toFixed(1)}°`, 16, h - 18)
  },
}

export function Globe() {
  return <SceneCanvas scene={scene} />
}
