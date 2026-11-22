"use client"

import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "./scene"

// Multi-AZ on a dotted globe (Juan, 2026-11-22; the globe is the Space page's SG-04). How Qdrant Cloud's Multi-AZ
// works, per its docs (Premium, Resilience): a cluster's nodes spread across three availability zones in one
// region, each shard has replicas in different zones, and traffic is routed between zones, so the cluster stays
// available if one zone goes down. The globe rocks gently with the region in front; the three zones (AZ-A, AZ-B,
// AZ-C, the Figma's labels) are linked by replication arcs carrying a pulse, and a client request arrives at one of
// them. Every ten seconds AZ-B goes down for four: it turns gray with the accent dot (the Figma's node that's down),
// its links go quiet, and the request reroutes to AZ-A. The zones are drawn apart to read at this size; the
// region's place on the globe is schematic.

const N = 1400
const TILT = 0.32
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const REGION = [20, 0]
// Each zone with where its label sits: AZ-A to the left, AZ-B to the right, AZ-C below.
const ZONES = [
  { label: "AZ-A", at: [REGION[0]! + 12, REGION[1]! - 20], side: "left" },
  { label: "AZ-B", at: [REGION[0]! + 12, REGION[1]! + 20], side: "right" },
  { label: "AZ-C", at: [REGION[0]! - 15, REGION[1]!], side: "below" },
] as const
const CLIENT = [52, -58]
const CYCLE = 10
const DOWN_FROM = 6

type V = [number, number, number]
type State = { w: number; h: number; p: Palette; dots: V[]; zones: V[]; client: V }

const fromLatLon = ([lat = 0, lon = 0]: readonly number[]): V => {
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
    return { w, h, p, dots, zones: ZONES.map((z) => fromLatLon(z.at)), client: fromLatLon(CLIENT) }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const R = Math.min(w, h) * 0.38
    const cx = w * 0.5
    const cy = h * 0.5
    // The region in front, rocking a little either way.
    const yaw = (-REGION[1]! * Math.PI) / 180 + Math.sin(t * 0.18) * 0.45
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
    const phase = t % CYCLE
    const down = phase >= DOWN_FROM ? 1 : -1 // AZ-B while it's down
    const target = down === 1 ? 0 : 1 // the zone the request goes to

    clear(ctx, p, w, h)

    // Atmosphere, then the rim.
    const air = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.3)
    air.addColorStop(0, alpha(p.glow, 0))
    air.addColorStop(0.25, alpha(p.glow, 0.14))
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
      ctx.globalAlpha = 0.15 + 0.7 * z
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 0.5 + 0.8 * z, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // An arc between two points on the sphere, lifted off it, with a pulse at u (or none).
    const arc = (a: V, b: V, height: number, color: string, opacity: number, pulse: number | null, pulseColor: string) => {
      const angle = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
      const point = (u: number) => {
        const ka = Math.sin((1 - u) * angle) / Math.sin(angle)
        const kb = Math.sin(u * angle) / Math.sin(angle)
        const v: V = [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]
        return project(v, 1 + Math.sin(Math.PI * u) * height)
      }
      ctx.strokeStyle = color
      let prev = point(0)
      for (let k = 1; k <= 32; k++) {
        const next = point(k / 32)
        ctx.globalAlpha = Math.max(0, Math.min(prev.z, next.z) + 0.2) * opacity
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(next.x, next.y)
        ctx.stroke()
        prev = next
      }
      if (pulse !== null) {
        const at = point(pulse)
        if (at.z > 0) {
          ctx.globalAlpha = 1
          ctx.fillStyle = pulseColor
          ctx.beginPath()
          ctx.arc(at.x, at.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    // Replication between the zones: every pair, a pulse each way in turn; quiet to and from the zone that's down.
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 0],
    ]
    pairs.forEach(([i, j], n) => {
      const off = i === down || j === down
      const a = s.zones[i]!
      const b = s.zones[j]!
      const u = (t * 0.45 + n * 0.33) % 1
      arc(a, b, 0.12, off ? p.line : p.glow, off ? 0.5 : 0.9, off ? null : u, p.bright)
    })

    // The client request, to the zone serving it.
    const reqU = (t * 0.35) % 1
    arc(s.client, s.zones[target]!, 0.28, p.glow, 0.7, reqU, p.bright)
    const c = project(s.client)
    if (c.z > 0) {
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(c.x, c.y, 2.4, 0, Math.PI * 2)
      ctx.fill()
      label(ctx, p, "CLIENT REQUEST", c.x - 8, c.y - 14, { align: "right" })
    }

    // The zones: bright with a ring, or gray with the accent dot while down.
    s.zones.forEach((zone, n) => {
      const { x, y, z } = project(zone)
      if (z < 0) return
      const isDown = n === down
      ctx.fillStyle = isDown ? p.line : p.bright
      ctx.beginPath()
      ctx.arc(x, y, 3.2, 0, Math.PI * 2)
      ctx.fill()
      if (isDown) {
        ctx.fillStyle = p.accent
        ctx.beginPath()
        ctx.arc(x, y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const ring = (t * 0.6 + n * 0.21) % 1
        ctx.globalAlpha = (1 - ring) * z
        ctx.strokeStyle = p.bright
        ctx.beginPath()
        ctx.arc(x, y, 5 + ring * 10, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      const side = ZONES[n]!.side
      label(
        ctx,
        p,
        ZONES[n]!.label,
        side === "left" ? x - 12 : side === "right" ? x + 12 : x,
        side === "below" ? y + 20 : y,
        { color: isDown ? p.dim : p.label, align: side === "left" ? "right" : side === "right" ? "left" : "center" }
      )
    })
  },
}

// The globe at its own size, square, with no background of its own, so it sits on the section or card bare.
export function ZoneGlobe() {
  return (
    <div
      role="img"
      aria-label="Three availability zones in one region, replicating to each other. When one zone goes down, requests go to another zone."
      className="relative aspect-square w-[460px] max-w-full [--web-scene-bg:transparent]"
    >
      <SceneCanvas scene={scene} />
    </div>
  )
}
