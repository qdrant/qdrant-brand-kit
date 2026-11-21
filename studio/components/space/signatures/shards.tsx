"use client"

import { clamp, ease, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, hexCorners, ids, labelRow, poly, prefersStill, type Pt } from "./lib"

// Shards: three hexagon modules, the nodes of a cluster, each holding a shard as a dot matrix. Points flow
// in from the left and land in the shard their id hashes to (id hash mod 3). With a replication factor of
// 2, an arc then copies each one to the next node, where it lands as a ring. Counts per node read out live.

const SHARDS = 3
const POINTS = 54
const EVERY = 0.3
const FLIGHT = 0.95
const COPY = 0.75
const HOLD = 2.6
const FADE = 0.8
const RINGS = 4

type Item = {
  id: string
  shard: number
  replica: number
  spawn: number
  land: number
  copy: number
  copied: number
  slot: number
  rslot: number
}
type State = {
  w: number
  h: number
  p: Palette
  lattice: Pt[]
  cycle: number
  items: Item[]
  length: number
  still: boolean
}

// An integer hash (from the murmur finalizer), so a point's shard comes from its id.
function hash(n: number) {
  let x = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  return (x ^ (x >>> 16)) >>> 0
}

function schedule(cycle: number) {
  const rand = rng(500 + cycle)
  const items: Item[] = ids(POINTS, rand).map((id, j) => {
    const shard = hash(Number(id.slice(1))) % SHARDS
    const spawn = 0.4 + j * EVERY
    const land = spawn + FLIGHT
    return { id, shard, replica: (shard + 1) % SHARDS, spawn, land, copy: land + 0.15, copied: land + 0.15 + COPY, slot: 0, rslot: 0 }
  })
  // Slots fill in the order points arrive, primaries and replicas alike.
  const arrivals = items.flatMap((item) => [
    { time: item.land, node: item.shard, item, replica: false },
    { time: item.copied, node: item.replica, item, replica: true },
  ])
  arrivals.sort((a, b) => a.time - b.time)
  const used = [0, 0, 0]
  for (const { node, item, replica } of arrivals) {
    if (replica) item.rslot = used[node]++
    else item.slot = used[node]++
  }
  return { items, length: Math.max(...items.map((item) => item.copied)) }
}

const quad = (a: Pt, c: Pt, b: Pt, k: number) => ({
  x: (1 - k) * (1 - k) * a.x + 2 * (1 - k) * k * c.x + k * k * b.x,
  y: (1 - k) * (1 - k) * a.y + 2 * (1 - k) * k * c.y + k * k * b.y,
})

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    // A dot matrix that fills a pointy-top hexagon, ordered from the center out.
    const lattice: (Pt & { ring: number; a: number })[] = []
    for (let i = -RINGS; i <= RINGS; i++)
      for (let j = -RINGS; j <= RINGS; j++) {
        const ring = Math.max(Math.abs(i), Math.abs(j), Math.abs(i + j))
        if (ring > RINGS) continue
        const x = (j * Math.sqrt(3)) / 2
        const y = -i - j / 2
        lattice.push({ x, y, ring, a: Math.atan2(y, x) })
      }
    lattice.sort((a, b) => a.ring - b.ring || a.a - b.a)
    return { w, h, p, lattice, cycle: 0, ...schedule(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const total = s.length + HOLD + FADE
    const cycle = s.still ? 0 : Math.floor(t / total)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      Object.assign(s, schedule(cycle))
    }
    const e = s.still ? 0.4 + 40 * EVERY + 0.5 : t - cycle * total
    const fade = 1 - clamp((e - s.length - HOLD) / FADE)

    const R = Math.min(h * 0.22, w * 0.14)
    const g = 1.12
    const ccx = w >= 560 ? w * 0.63 : w * 0.58
    const ccy = h * 0.5
    const centers = [
      { x: ccx - (Math.sqrt(3) * R * g) / 2, y: ccy - 0.75 * R * g },
      { x: ccx + (Math.sqrt(3) * R * g) / 2, y: ccy - 0.75 * R * g },
      { x: ccx, y: ccy + 0.75 * R * g },
    ]
    const step = (R * 0.8) / RINGS
    const slot = (node: number, n: number) => {
      const l = s.lattice[Math.min(n, s.lattice.length - 1)]
      return { x: centers[node].x + l.x * step, y: centers[node].y + l.y * step }
    }
    const port = { x: Math.max(48, w * 0.09), y: ccy }

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The nodes: glass hexagons lit on their upper edges, with the empty slots as a faint dot matrix.
    centers.forEach((c, n) => {
      const corners = hexCorners(c.x, c.y, R)
      poly(ctx, corners)
      ctx.fillStyle = alpha(p.surface, 0.75)
      ctx.fill()
      ctx.strokeStyle = p.line
      ctx.stroke()
      ctx.strokeStyle = alpha(p.bright, 0.5)
      ctx.beginPath()
      ctx.moveTo(corners[5].x, corners[5].y)
      ctx.lineTo(corners[0].x, corners[0].y)
      ctx.lineTo(corners[1].x, corners[1].y)
      ctx.stroke()
      ctx.fillStyle = alpha(p.line, 0.8)
      ctx.beginPath()
      for (let k = 0; k < s.lattice.length; k++) {
        const { x, y } = slot(n, k)
        ctx.rect(x - 0.5, y - 0.5, 1, 1)
      }
      ctx.fill()
    })

    // The ingest port.
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.moveTo(port.x, port.y - 28)
    ctx.lineTo(port.x, port.y + 28)
    for (const dy of [-28, 28]) {
      ctx.moveTo(port.x - 4, port.y + dy)
      ctx.lineTo(port.x, port.y + dy)
    }
    ctx.stroke()

    const counts = centers.map(() => ({ primary: 0, replica: 0 }))
    let spawned = 0
    let newest: Item | null = null
    ctx.globalAlpha = fade
    for (const item of s.items) {
      if (e < item.spawn) continue
      spawned += 1
      const home = slot(item.shard, item.slot)
      // In flight from the port to its shard.
      if (e < item.land) {
        const k = ease((e - item.spawn) / FLIGHT)
        const control = { x: (port.x + home.x) / 2, y: port.y }
        ctx.strokeStyle = alpha(p.line, 0.5 * fade)
        ctx.beginPath()
        ctx.moveTo(port.x, port.y)
        ctx.quadraticCurveTo(control.x, control.y, home.x, home.y)
        ctx.stroke()
        const at = quad(port, control, home, k)
        ctx.fillStyle = p.star
        ctx.beginPath()
        ctx.arc(at.x, at.y, 2.4, 0, TAU)
        ctx.fill()
        newest = item
        continue
      }
      counts[item.shard].primary += 1
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(home.x, home.y, 2.3, 0, TAU)
      ctx.fill()
      if (e - item.land < 0.35) {
        ctx.strokeStyle = alpha(p.bright, (1 - (e - item.land) / 0.35) * fade)
        ctx.beginPath()
        ctx.arc(home.x, home.y, 6, 0, TAU)
        ctx.stroke()
      }
      // The copy to the replica node.
      if (e < item.copy) continue
      const copy = slot(item.replica, item.rslot)
      if (e < item.copied) {
        const k = ease((e - item.copy) / COPY)
        const mid = { x: (home.x + copy.x) / 2, y: (home.y + copy.y) / 2 }
        const out = { x: mid.x - ccx, y: mid.y - ccy }
        const length = Math.hypot(out.x, out.y) || 1
        const bend = Math.hypot(copy.x - home.x, copy.y - home.y) * 0.35
        const control = { x: mid.x + (out.x / length) * bend, y: mid.y + (out.y / length) * bend }
        ctx.strokeStyle = alpha(p.glow, 0.55 * fade)
        ctx.beginPath()
        ctx.moveTo(home.x, home.y)
        ctx.quadraticCurveTo(control.x, control.y, copy.x, copy.y)
        ctx.stroke()
        const at = quad(home, control, copy, k)
        ctx.fillStyle = p.glow
        ctx.beginPath()
        ctx.arc(at.x, at.y, 2, 0, TAU)
        ctx.fill()
        continue
      }
      counts[item.replica].replica += 1
      ctx.strokeStyle = p.glow
      ctx.beginPath()
      ctx.arc(copy.x, copy.y, 2.1, 0, TAU)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // The newest point in flight, in the accent, with its id and shard.
    if (newest) {
      const n = newest
      const home = slot(n.shard, n.slot)
      const control = { x: (port.x + home.x) / 2, y: port.y }
      const at = quad(port, control, home, ease((e - n.spawn) / FLIGHT))
      ctx.fillStyle = p.accent
      ctx.beginPath()
      ctx.arc(at.x, at.y, 3, 0, TAU)
      ctx.fill()
      label(ctx, p, `${n.id} → S${n.shard}`, at.x + 8, at.y - 14, { color: p.star })
    }

    // Labels: the port, each node's counts, and the legend.
    label(ctx, p, "INGEST", port.x, port.y - 44, { align: "center" })
    label(ctx, p, `${spawned} / ${POINTS}`, port.x, port.y + 44, { align: "center", color: p.star })
    centers.forEach((c, n) => {
      const below = n === 2
      const held = (n + SHARDS - 1) % SHARDS
      labelRow(
        ctx,
        p,
        [
          [`N${n + 1}`, p.label],
          [`S${n} ${counts[n].primary}`, p.star],
          [`S${held} ${counts[n].replica}`, p.glow],
        ],
        c.x,
        below ? c.y + R + 18 : c.y - R - 16,
        { align: "center" }
      )
    })
    const ly = h - 24
    ctx.fillStyle = p.star
    ctx.beginPath()
    ctx.arc(28, ly, 2.3, 0, TAU)
    ctx.fill()
    label(ctx, p, "PRIMARY", 38, ly)
    ctx.strokeStyle = p.glow
    ctx.beginPath()
    ctx.arc(116, ly, 2.1, 0, TAU)
    ctx.stroke()
    label(ctx, p, "REPLICA  RF 2", 126, ly)
  },
}

export function Shards() {
  return <SceneCanvas scene={scene} />
}
