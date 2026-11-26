"use client"

import * as React from "react"

import { SceneCanvas, type CanvasScene, type Palette } from "../../visuals/scene"
import { definePattern, type PatternDefinition, type PatternKind, type PatternNote } from "../types"
import { fbm, mulberry, perlin, type Noise } from "./engine"

// The space set (2026-11-25, exploring): patterns built on the hexagon, the brand's main element, with space as
// the subject (planets, moons, orbits, comets, a rocket, constellations, noise nebulas), each with a small hover
// moment. They run on web/visuals/scene.tsx with the --web-scene-* colors, so they follow the theme and the
// Primary color, draw only on screen and hold still for reduced motion (a hover moment then shows as a still pose).
//
// Three things every one of them does:
// - Hexagons for every mark: planets and moons are spheres of hexagon cells lit from above (DESIGN.md, light from
//   above), stars are small hexagons, rings and orbits are dotted with them. Light, never glow: no blur anywhere.
// - A hover moment: the layer still takes no pointer events (links and buttons work as before); it listens to the
//   pointer over its section, or its card, and reveals something small there.
// - A text guard: the layer clears itself, with a soft edge, from under every text, icon, image and control in its
//   section (for a surface, in its card), measured in the page and kept up to date as it resizes. A shape or a
//   hover moment never sits under letters, even in a pattern that covers the whole section. Cards over a
//   background are left alone: their fill already covers it.
//
// The rocket and the satellite are Lucide's (lucide-react 1.72), the website's icons, drawn from their paths.
//
// Planet rise, Moon side, Rocket flight, Moon phases and Lunar surface were taken out on 2026-11-26.

export const TAU = Math.PI * 2
export const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const angleLerp = (a: number, b: number, t: number) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a))
  return a + d * t
}

// ---- Lucide icons as canvas paths ----------------------------------------------------------------------------

const ROCKET = [
  "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09",
  "M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z",
  "M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05",
]
const SATELLITE = [
  "m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5",
  "M16.5 7.5 19 5",
  "m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5",
  "M9 21a6 6 0 0 0-6-6",
  "M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z",
]
const pathCache = new Map<string, Path2D>()

// Draws a Lucide icon centered at (x, y), size px wide, turned by angle, in its own 1.5px stroke.
export function icon(
  ctx: CanvasRenderingContext2D,
  paths: string[],
  x: number,
  y: number,
  size: number,
  angle: number,
  color: string,
  a: number
) {
  if (a <= 0.01) return
  const s = size / 24
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(s, s)
  ctx.translate(-12, -12)
  ctx.lineWidth = 1.5 / s
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.strokeStyle = color
  ctx.globalAlpha = a
  for (const d of paths) {
    let p = pathCache.get(d)
    if (!p) {
      p = new Path2D(d)
      pathCache.set(d, p)
    }
    ctx.stroke(p)
  }
  ctx.restore()
}

// Lucide's rocket points up and to the right; this turns it to fly along a heading (0 is right, -π/2 is up).
const rocketAngle = (heading: number) => heading + Math.PI / 4

// ---- Hexagons ----------------------------------------------------------------------------------------------------

// Pointy-top hexagon corners.
const HX = Array.from({ length: 6 }, (_, k) => Math.cos(((60 * k - 90) * Math.PI) / 180))
const HY = Array.from({ length: 6 }, (_, k) => Math.sin(((60 * k - 90) * Math.PI) / 180))

export function hexTo(path: Path2D | CanvasRenderingContext2D, x: number, y: number, r: number) {
  path.moveTo(x + (HX[0] ?? 0) * r, y + (HY[0] ?? 0) * r)
  for (let k = 1; k < 6; k += 1) path.lineTo(x + (HX[k] ?? 0) * r, y + (HY[k] ?? 0) * r)
  path.closePath()
}

// Many hexagons at many strengths, drawn in a few batches (one per strength level), so thousands stay cheap.
export function batch(levels = 10) {
  const paths = Array.from({ length: levels }, () => new Path2D())
  return {
    add(x: number, y: number, r: number, a: number) {
      if (a <= 0.03 || r < 0.35) return
      const path = paths[Math.min(levels - 1, Math.floor(clamp(a) * levels))]
      if (path) hexTo(path, x, y, r)
    },
    fill(ctx: CanvasRenderingContext2D, color: string, strength = 1) {
      ctx.fillStyle = color
      paths.forEach((p, i) => {
        ctx.globalAlpha = ((i + 0.5) / levels) * strength
        ctx.fill(p)
      })
      ctx.globalAlpha = 1
    },
    stroke(ctx: CanvasRenderingContext2D, color: string, width = 1, strength = 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      paths.forEach((p, i) => {
        ctx.globalAlpha = ((i + 0.5) / levels) * strength
        ctx.stroke(p)
      })
      ctx.globalAlpha = 1
    },
  }
}

// Calls fn for each cell of a pointy-top hex grid with this pitch inside a box.
export function hexGrid(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  pitch: number,
  fn: (x: number, y: number) => void
) {
  const row = pitch * 0.866
  const r0 = Math.floor(y0 / row)
  const r1 = Math.ceil(y1 / row)
  for (let r = r0; r <= r1; r += 1) {
    const y = r * row
    const off = r & 1 ? pitch / 2 : 0
    const c0 = Math.floor((x0 - off) / pitch)
    const c1 = Math.ceil((x1 - off) / pitch)
    for (let c = c0; c <= c1; c += 1) fn(c * pitch + off, y)
  }
}

// One hexagon outline.
export function hexStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  a: number,
  w = 1
) {
  if (a <= 0.01) return
  ctx.beginPath()
  hexTo(ctx, x, y, r)
  ctx.globalAlpha = a
  ctx.strokeStyle = color
  ctx.lineWidth = w
  ctx.stroke()
  ctx.globalAlpha = 1
}

// Light from above (DESIGN.md, Space theme): a little from the left, mostly from the top, toward the viewer.
export const LIGHT = (() => {
  const v = [-0.35, -0.82, 0.45]
  const n = Math.hypot(...v)
  return v.map((x) => x / n) as [number, number, number]
})()

// A sphere of hexagon cells at (cx, cy), lit from above. texture() can darken or lighten each cell (0 to 1.5).
export function sphere(
  b: ReturnType<typeof batch>,
  cx: number,
  cy: number,
  r: number,
  pitch: number,
  texture?: (nx: number, ny: number, nz: number) => number,
  clip?: (x: number, y: number) => boolean
) {
  hexGrid(cx - r, cy - r, cx + r, cy + r, pitch, (x, y) => {
    const nx = (x - cx) / r
    const ny = (y - cy) / r
    const d = nx * nx + ny * ny
    if (d > 1) return
    if (clip && !clip(x, y)) return
    const nz = Math.sqrt(1 - d)
    const lambert = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2])
    const v = clamp((0.1 + 0.9 * lambert) * (texture ? texture(nx, ny, nz) : 1))
    b.add(x, y, pitch * 0.47 * (0.35 + 0.65 * v), 0.15 + 0.85 * v)
  })
}

// ---- The scene around every pattern: hover, time and the text guard ------------------------------------------------

export type Guard = { x: number; y: number; w: number; h: number }

// Each canvas's guard boxes, measured by its layer and read by its scene every frame.
const GUARDS = new WeakMap<HTMLCanvasElement, Guard[]>()

export type Env = {
  w: number
  h: number
  t: number
  dt: number
  p: Palette
  noise: Noise
  // 0 to 1, easing in while the pointer is over the section (or card) and out after it leaves.
  hover: number
  inside: boolean
  // True on the frame the pointer comes in.
  entered: boolean
  px: number
  py: number
  // Reduced motion: time stands still, so hover moments show as still poses and nothing is spawned.
  still: boolean
  // How far the section has travelled through the viewport: 0 as its top enters at the bottom, 1 as its bottom
  // leaves at the top. Inside a studio preview it's measured against the studio's page, through the frame.
  scroll: number
}

export type Spec<S> = {
  init: (w: number, h: number) => S
  frame: (ctx: CanvasRenderingContext2D, s: S, e: Env) => void
}

type SceneState<S> = { s: S; e: Env; last: number; was: boolean; dpr: number }

// The section's progress through the viewport (Env.scroll). A studio preview is an iframe scaled into the studio's
// page, so there it's measured through the frame element, against the studio's window.
function scrollProgress(canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect()
  let top = r.top
  let height = r.height
  let vh = window.innerHeight
  const frame = window.frameElement
  if (frame) {
    const f = frame.getBoundingClientRect()
    const scale = f.width / Math.max(1, window.innerWidth)
    top = f.top + r.top * scale
    height = r.height * scale
    vh = window.parent.innerHeight
  }
  return clamp((vh - top) / Math.max(1, vh + height))
}

function makeScene<S>(spec: Spec<S>, kind: PatternKind, seed: number): CanvasScene<SceneState<S>> {
  return {
    setup: ({ width, height, dpr }, p) => ({
      s: spec.init(width, height),
      e: {
        w: width,
        h: height,
        t: 0,
        dt: 0,
        p,
        noise: perlin(seed),
        hover: 0,
        inside: false,
        entered: false,
        px: -1e4,
        py: -1e4,
        still: false,
        scroll: 0.5,
      },
      last: -1,
      was: false,
      dpr,
    }),
    draw(ctx, st, t, pointer, { width, height }) {
      const e = st.e
      const still = st.last >= 0 && t === st.last
      e.dt = st.last < 0 || still ? 0 : clamp(t - st.last, 0, 0.1)
      st.last = t
      e.t = t
      e.still = still
      e.scroll = scrollProgress(ctx.canvas)
      e.entered = pointer.inside && !st.was
      st.was = pointer.inside
      e.inside = pointer.inside
      if (pointer.inside) {
        e.px = pointer.x
        e.py = pointer.y
      }
      const target = pointer.inside ? 1 : 0
      e.hover = still ? target : e.hover + (target - e.hover) * (1 - Math.exp(-e.dt * 4))
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      spec.frame(ctx, st.s, e)
      ctx.restore()
      // A surface fades out before its card's copy, like the Deploy Card's looks: full at the top, gone by 62%.
      if (kind === "surface") {
        const mask = ctx.createLinearGradient(0, 0, 0, height)
        mask.addColorStop(0.3, "rgb(0 0 0 / 1)")
        mask.addColorStop(0.62, "rgb(0 0 0 / 0)")
        ctx.globalCompositeOperation = "destination-in"
        ctx.fillStyle = mask
        ctx.fillRect(0, 0, width, height)
      }
      // The text guard: a soft-edged hole around every text, icon, image and control.
      const list = GUARDS.get(ctx.canvas) ?? []
      if (list.length) {
        ctx.globalCompositeOperation = "destination-out"
        ctx.fillStyle = "#000"
        ctx.shadowColor = "#000"
        ctx.shadowBlur = 18 * st.dpr
        ctx.beginPath()
        for (const g of list) ctx.roundRect(g.x - 12, g.y - 10, g.w + 24, g.h + 20, 6)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      ctx.globalCompositeOperation = "source-over"
    },
  }
}

// Everything readable in the scope, relative to the layer: text (each line's box), icons, images and controls.
// Over a background, what sits on a card is left out: the card's fill covers the pattern there.
export function measureGuards(scope: Element, layer: Element, kind: PatternKind): Guard[] {
  const base = layer.getBoundingClientRect()
  const out: Guard[] = []
  const skip = (el: Element) => {
    if (el.closest(".web-pattern")) return true
    if (kind === "surface") return false
    const plate = el.closest(".web-plate")
    return !!plate && plate !== scope && scope.contains(plate)
  }
  const push = (r: DOMRect) => {
    if (r.width < 1 || r.height < 1) return
    out.push({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height })
  }
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement
    if (!parent || !n.textContent?.trim() || skip(parent)) continue
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) push(r)
  }
  for (const el of scope.querySelectorAll("input, textarea, select, button, svg, img, video, canvas")) {
    if (!skip(el)) push(el.getBoundingClientRect())
  }
  return out
}

// The layer: the canvas, the pointer of its section (or card) passed on to it, and the guard kept measured.
function CosmosLayer<S>({ scene, kind }: { scene: CanvasScene<S>; kind: PatternKind }) {
  const host = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const layer = host.current
    // A surface follows its card (Plate wraps the pattern in a span); a background follows its section.
    const scope =
      kind === "surface" ? layer?.closest<HTMLElement>(".web-plate") : layer?.closest(".web-pattern")?.parentElement
    if (!layer || !scope) return
    const measure = () => {
      const canvas = layer.querySelector("canvas")
      if (canvas) GUARDS.set(canvas, measureGuards(scope, layer, kind))
    }
    // The scene's loop listens on the canvas's parent; the pattern takes no pointer events, so its section's
    // pointer is passed on to it.
    const pass = (type: string) => (ev: PointerEvent) =>
      layer.dispatchEvent(new PointerEvent(type, { clientX: ev.clientX, clientY: ev.clientY }))
    const move = pass("pointermove")
    const leave = pass("pointerleave")
    scope.addEventListener("pointermove", move)
    scope.addEventListener("pointerleave", leave)
    scope.addEventListener("pointerenter", measure)
    const ro = new ResizeObserver(measure)
    ro.observe(scope)
    const timers = [250, 1200, 3000].map((ms) => window.setTimeout(measure, ms))
    void document.fonts?.ready.then(measure)
    measure()
    return () => {
      scope.removeEventListener("pointermove", move)
      scope.removeEventListener("pointerleave", leave)
      scope.removeEventListener("pointerenter", measure)
      ro.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [kind])

  return (
    <div
      ref={host}
      className="web-field absolute inset-x-0 top-0"
      // Over a footer's legal bar the frame lifts the layer's bottom (--pattern-band-bottom), as for the bands.
      style={{ bottom: kind === "background" ? "var(--pattern-band-bottom, 0px)" : 0 }}
    >
      <SceneCanvas scene={scene} />
    </div>
  )
}

export function cosmos<S>({
  spec,
  seed = 7,
  ...rest
}: Omit<PatternDefinition, "Layer" | "status"> & { spec: Spec<S>; seed?: number }) {
  const scene = makeScene(spec, rest.kind, seed)
  return definePattern({
    ...rest,
    status: "exploring",
    Layer: () => <CosmosLayer scene={scene} kind={rest.kind} />,
  })
}

// ---- Shared pieces --------------------------------------------------------------------------------------------------

export type Puff = { x: number; y: number; vx: number; vy: number; r: number; life: number; age: number }

// Exhaust and dust: small hexagons that drift and fade.
export function stepPuffs(list: Puff[], dt: number) {
  for (const q of list) {
    q.age += dt
    q.x += q.vx * dt
    q.y += q.vy * dt
    q.r += dt * 2.5
  }
  return list.filter((q) => q.age < q.life)
}
export function drawPuffs(ctx: CanvasRenderingContext2D, list: Puff[], color: string) {
  const b = batch(8)
  for (const q of list) b.add(q.x, q.y, q.r, 0.8 * (1 - q.age / q.life))
  b.fill(ctx, color)
}

// The k stars nearest the pointer, joined to it like a vector search's query and its nearest neighbours, with the
// search radius as a hexagon around the query.
export function nearest(
  ctx: CanvasRenderingContext2D,
  e: Env,
  stars: { x: number; y: number }[],
  k: number,
  reach: number,
  strength = 1
) {
  if (e.hover <= 0.01) return
  const ranked = stars
    .map((s) => ({ s, d: Math.hypot(s.x - e.px, s.y - e.py) }))
    .filter((r) => r.d < reach)
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
  if (!ranked.length) return
  const a = e.hover * strength
  ctx.lineWidth = 1
  ctx.strokeStyle = e.p.glow
  ranked.forEach((r, i) => {
    ctx.globalAlpha = a * (0.75 - i * 0.08)
    ctx.beginPath()
    ctx.moveTo(e.px, e.py)
    ctx.lineTo(r.s.x, r.s.y)
    ctx.stroke()
    hexStroke(ctx, r.s.x, r.s.y, 6, e.p.bright, a * 0.9)
  })
  const far = ranked[ranked.length - 1]?.d ?? 0
  hexStroke(ctx, e.px, e.py, far + 8, e.p.glow, a * 0.25)
  hexStroke(ctx, e.px, e.py, 4, e.p.bright, a)
}

export const HOVER: PatternNote = {
  rule: "A pattern is purely visual, with no pointer events",
  source: "web/patterns/types.ts",
  text: "It still takes no pointer events, so the section's links and buttons work as before, but it follows the pointer over its section (or card) for a hover moment. Nothing in it is needed to read or use the section.",
}
export const MOTION: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "At rest it moves slowly; its hover moment moves faster, for a second or two.",
}
export const FULL: PatternNote = {
  rule: "A pattern supports the content",
  source: "web/guidelines.ts, Patterns and effects",
  text: "It covers the whole section and clears itself, with a soft edge, from under every text, icon and control (the text guard), so letters never sit on a mark. The marks still come close to the text.",
}
export const STARS: PatternNote = {
  rule: "No twinkling stars behind data",
  source: "design-system/DESIGN.md, References: Space, subtly",
  text: "Its stars hold still in brightness (they don't twinkle), but keep it off sections with tables, charts or numbers.",
}
export const SUBJECT: PatternNote = {
  rule: "A pattern supports the content",
  source: "web/guidelines.ts, Patterns and effects",
  text: "A rocket is a subject, not a texture: it draws the eye. It stays in the pattern's own area and is drawn from Lucide's rocket, the website's icon.",
}
export const ROOM: PatternNote = {
  rule: "A pattern fills its section",
  source: "web/AGENTS.md, Adding a pattern",
  text: "It lives along the bottom of the section and reads best with room under the content: the exploration adds it (in a footer, above the legal bar; in a hero or a header, at the bottom). Keeping it means the section gets that room, for Juan to decide.",
}
export const SIDE: PatternNote = {
  rule: "A pattern fills its section",
  source: "web/AGENTS.md, Adding a pattern",
  text: "It sits on one side of the section, where a centered or left-aligned layout leaves space, rather than filling it.",
}

// ---- Backgrounds ----------------------------------------------------------------------------------------------------

// Stars as small hexagons over the whole section, joined into faint constellations. Hover: a vector search, from
// the pointer to its five nearest stars, with the search radius as a hexagon.
const constellation = cosmos({
  id: "cosmos-constellation",
  name: "Constellation search",
  kind: "background",
  description: "Hexagon stars joined into faint constellations. Hover: the pointer finds its five nearest neighbours.",
  notes: [FULL, STARS, HOVER],
  seed: 3,
  spec: {
    init: (w, h) => {
      const rand = mulberry(31)
      const n = clamp(Math.round((w * h) / 10000), 30, 240)
      const stars = Array.from({ length: n }, () => ({
        x0: rand() * w,
        y0: rand() * h,
        x: 0,
        y: 0,
        r: 0.9 + rand() * rand() * 2.4,
        a: 0.35 + rand() * 0.6,
        ph: rand() * TAU,
      }))
      const links: [number, number][] = []
      stars.forEach((s, i) => {
        let best = -1
        let bd = 150
        stars.forEach((o, j) => {
          if (i === j) return
          const d = Math.hypot(s.x0 - o.x0, s.y0 - o.y0)
          if (d < bd) {
            bd = d
            best = j
          }
        })
        if (best >= 0 && !links.some(([a, b]) => a === best && b === i)) links.push([i, best])
      })
      return { stars, links }
    },
    frame(ctx, s, e) {
      const { p, t } = e
      for (const st of s.stars) {
        st.x = st.x0 + Math.sin(t * 0.03 + st.ph) * 4
        st.y = st.y0 + Math.cos(t * 0.025 + st.ph) * 3
      }
      ctx.strokeStyle = p.line
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.45
      ctx.beginPath()
      for (const [a, b] of s.links) {
        const A = s.stars[a]
        const B = s.stars[b]
        if (!A || !B) continue
        ctx.moveTo(A.x, A.y)
        ctx.lineTo(B.x, B.y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
      const b = batch(6)
      for (const st of s.stars) b.add(st.x, st.y, st.r, st.a)
      b.fill(ctx, p.star)
      nearest(ctx, e, s.stars, 5, 420)
    },
  },
})

// A nebula of hexagon cells shaped by slow noise, lit from above. Hover: a scan, rings of brighter cells running
// out from the pointer, and the cells near it lifting.
type Ring = { x: number; y: number; t0: number }
const nebula = cosmos({
  id: "cosmos-hex-nebula",
  name: "Hex nebula",
  kind: "background",
  description:
    "Clouds of hexagon cells drifting with slow noise, lit from above. Hover: a scan ripples out from the pointer.",
  notes: [FULL, HOVER, MOTION],
  seed: 21,
  spec: {
    init: () => ({ rings: [] as Ring[], next: 0 }),
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      if (e.inside && !e.still) {
        s.next -= e.dt
        if (e.entered || s.next <= 0) {
          s.rings.push({ x: e.px, y: e.py, t0: t })
          s.next = 1.6
        }
      }
      s.rings = s.rings.filter((r) => t - r.t0 < 2.4)
      const base = batch()
      const lit = batch(6)
      const pitch = 13
      hexGrid(0, 0, w, h, pitch, (x, y) => {
        const n = fbm(e.noise, x * 0.0026 + t * 0.01, y * 0.0032, t * 0.015, 2)
        const sky = 0.45 + 0.55 * (1 - y / h)
        const v = smooth(0.5, 0.82, n) * sky
        let boost = e.hover * 0.5 * Math.exp(-((x - e.px) ** 2 + (y - e.py) ** 2) / (2 * 70 * 70))
        for (const r of s.rings) {
          const age = t - r.t0
          const d = Math.hypot(x - r.x, y - r.y)
          boost += Math.exp(-(((d - age * 210) / 20) ** 2)) * (1 - age / 2.4) * 0.6
        }
        base.add(x, y, pitch * 0.44 * (0.25 + 0.75 * v), v * 0.9)
        if (boost > 0.05) lit.add(x, y, pitch * 0.44 * clamp(0.3 + boost), clamp(boost))
      })
      base.fill(ctx, p.glow)
      lit.fill(ctx, p.bright)
    },
  },
})

// Planets on wide orbits around a sun off the right edge, each a small sphere of hexagon cells. Hover: they line
// up toward the pointer, like a planetary alignment.
const orbits = cosmos({
  id: "cosmos-orbits",
  name: "Orbits",
  kind: "background",
  description:
    "Planets of hexagon cells on wide orbits around a sun off the right edge. Hover: they align toward the pointer.",
  notes: [SIDE, HOVER, MOTION],
  seed: 13,
  spec: {
    init: (w, h) => {
      const rand = mulberry(17)
      const cx = w + 60
      const cy = h * 0.52
      const planets = [8, 13, 9, 18, 11].map((r, k) => ({ r, R: 170 + k * 125, a: rand() * TAU }))
      return { cx, cy, planets }
    },
    frame(ctx, s, e) {
      const { w, p } = e
      const k = 0.4
      const edge = (x: number) => smooth(w * 0.48, w * 0.64, x)
      // The sun: hexagon rings at the edge.
      for (let i = 1; i <= 4; i += 1) hexStroke(ctx, s.cx, s.cy, 34 * i, p.glow, 0.8 / i)
      const dots = batch(5)
      const aim = Math.atan2((e.py - s.cy) / k, e.px - s.cx)
      for (const pl of s.planets) {
        for (let i = 0; i < 140; i += 1) {
          const th = (i / 140) * TAU
          const x = s.cx + Math.cos(th) * pl.R
          const y = s.cy + Math.sin(th) * pl.R * k
          dots.add(x, y, 1.3, 0.7 * edge(x))
        }
        pl.a += e.dt * 0.5 * (170 / pl.R) ** 1.5
      }
      dots.fill(ctx, p.glow)
      const b = batch()
      for (const pl of s.planets) {
        const a = angleLerp(pl.a, aim, e.hover)
        const x = s.cx + Math.cos(a) * pl.R
        const y = s.cy + Math.sin(a) * pl.R * k
        if (edge(x) < 0.05) continue
        sphere(b, x, y, pl.r, Math.max(2.6, pl.r / 3.2))
      }
      b.fill(ctx, p.glow)
      if (e.hover > 0.01) {
        ctx.strokeStyle = p.glow
        ctx.globalAlpha = e.hover * 0.3
        ctx.setLineDash([2, 6])
        ctx.beginPath()
        ctx.moveTo(s.cx, s.cy)
        ctx.lineTo(s.cx + Math.cos(aim) * 900, s.cy + Math.sin(aim) * 900 * k)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }
    },
  },
})

// Hexagon stars streaming out from a point on the right side, slowly. Hover: warp speed, the stars stretching into
// streaks.
const warp = cosmos({
  id: "cosmos-warp",
  name: "Warp, side",
  kind: "background",
  description:
    "Hexagon stars streaming slowly out from the right side of a section. Hover: they stretch into warp streaks.",
  notes: [SIDE, STARS, HOVER, MOTION],
  seed: 19,
  spec: {
    init: () => {
      const rand = mulberry(23)
      return { stars: Array.from({ length: 240 }, () => ({ a: rand() * TAU, d: rand(), s: 0.6 + rand() * 0.8 })), rand }
    },
    frame(ctx, s, e) {
      const { w, h, p } = e
      const vx = w * 0.8
      const vy = h * 0.46
      const reach = Math.max(w * 0.38, h * 0.7)
      const speed = 1 + 8 * e.hover
      const b = batch(8)
      ctx.strokeStyle = p.bright
      ctx.lineWidth = 1
      for (const st of s.stars) {
        st.d += e.dt * 0.035 * speed * st.s * (0.4 + st.d)
        if (st.d > 1) {
          st.d = 0.02 + s.rand() * 0.05
          st.a = s.rand() * TAU
        }
        const rr = st.d * st.d * reach
        const x = vx + Math.cos(st.a) * rr
        const y = vy + Math.sin(st.a) * rr * 0.8
        const side = smooth(w * 0.45, w * 0.62, x)
        const a = smooth(0, 0.25, st.d) * side
        b.add(x, y, 0.8 + st.d * 2.8, a)
        if (e.hover > 0.05) {
          const len = e.hover * 46 * st.d * st.d
          ctx.globalAlpha = a * e.hover * 0.7
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x - Math.cos(st.a) * len, y - Math.sin(st.a) * len * 0.8)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      b.fill(ctx, p.star)
    },
  },
})

// A comet crossing the top right of the section now and then, its tail in hexagons. Hover: one sets off from near
// the pointer.
type Comet = { x: number; y: number; vx: number; vy: number; age: number; tail: { x: number; y: number }[] }
const comet = cosmos({
  id: "cosmos-comet",
  name: "Comet",
  kind: "background",
  description: "A comet with a tail of hexagons crossing the top right of a section now and then. Hover: one sets off.",
  notes: [HOVER, MOTION],
  seed: 33,
  spec: {
    init: () => ({ comets: [] as Comet[], next: 1.5, rand: mulberry(41) }),
    frame(ctx, s, e) {
      const { w, h, p } = e
      const launch = (x: number, y: number) => {
        const a = Math.PI * (0.78 + s.rand() * 0.06)
        s.comets.push({ x, y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, age: 0, tail: [] })
      }
      if (!e.still) {
        s.next -= e.dt
        if (s.next <= 0) {
          launch(w + 30, s.rand() * h * 0.22)
          s.next = 12 + s.rand() * 4
        }
        if (e.entered) launch(e.px + 30, e.py - 30)
      }
      for (const c of s.comets) {
        c.age += e.dt
        c.x += c.vx * e.dt
        c.y += c.vy * e.dt
        if (!e.still) c.tail.unshift({ x: c.x, y: c.y })
        if (c.tail.length > 70) c.tail.pop()
      }
      s.comets = s.comets.filter((c) => c.x > -60 && c.y < h + 60 && c.age < 12)
      const b = batch(8)
      for (const c of s.comets)
        c.tail.forEach((q, i) => {
          const f = 1 - i / c.tail.length
          b.add(q.x, q.y, 0.8 + f * 3.4, f * 0.95)
        })
      b.fill(ctx, p.glow)
      const heads = batch(4)
      for (const c of s.comets) heads.add(c.x, c.y, 4.2, 1)
      heads.fill(ctx, p.star)
      if (e.still) {
        // A still pose: one comet in the top right.
        const tb = batch(8)
        for (let i = 0; i < 30; i += 1)
          tb.add(w * 0.82 + i * 7, h * 0.12 - i * 3.2, 0.6 + (1 - i / 30) * 2.6, 1 - i / 30)
        tb.fill(ctx, p.glow)
      }
    },
  },
})

// ---- Surfaces -------------------------------------------------------------------------------------------------------

// A ringed planet of hexagon cells in the card's top right. Hover: a moon rises from behind it and the ring
// brightens.
const planetCorner = cosmos({
  id: "cosmos-planet-corner",
  name: "Ringed planet",
  kind: "surface",
  description: "A ringed planet of hexagon cells in a card's top right, gone before the copy. Hover: a moon rises.",
  notes: [HOVER],
  seed: 43,
  spec: {
    init: (w, h) => {
      const m = Math.min(w, h)
      const r = clamp(m * 0.15, 24, 62)
      return { r, cx: w - r * 2.3, cy: r * 1.9 }
    },
    frame(ctx, s, e) {
      const { p, t } = e
      const tilt = -0.32
      const rx = s.r * 1.95
      const ry = s.r * 0.42
      const ring = (front: boolean) => {
        const b = batch(5)
        for (let i = 0; i < 80; i += 1) {
          const th = (i / 80) * TAU
          if (Math.sin(th) < 0 === front) continue
          const x0 = Math.cos(th) * rx
          const y0 = Math.sin(th) * ry
          const x = s.cx + x0 * Math.cos(tilt) - y0 * Math.sin(tilt)
          const y = s.cy + x0 * Math.sin(tilt) + y0 * Math.cos(tilt)
          if (!front && Math.hypot(x - s.cx, y - s.cy) < s.r) continue
          b.add(x, y, 1.3, 0.45 + 0.4 * e.hover)
        }
        b.fill(ctx, front ? p.bright : p.dim)
      }
      ring(false)
      // Hover: the moon, rising from behind the planet.
      const rise = e.hover
      const mx = s.cx - s.r * 1.25 * rise
      const my = s.cy - s.r * 1.3 * rise
      if (rise > 0.02) {
        const mb = batch(6)
        sphere(mb, mx, my, s.r * 0.26, 2.4, undefined, (x, y) => Math.hypot(x - s.cx, y - s.cy) > s.r || rise > 0.9)
        mb.fill(ctx, p.bright, rise)
      }
      const b = batch()
      sphere(b, s.cx, s.cy, s.r, Math.max(3.4, s.r / 9), (nx, ny) => 0.85 + 0.4 * Math.sin(ny * 9 + nx * 1.5 + t * 0.2))
      b.fill(ctx, p.glow)
      ring(true)
    },
  },
})

// Orbit arcs from the card's top right corner with small hexagon satellites on them. Hover: a satellite appears
// on the middle orbit and pings.
const orbitCorner = cosmos({
  id: "cosmos-orbit-corner",
  name: "Orbit corner",
  kind: "surface",
  description: "Orbit arcs from a card's top right with hexagon satellites. Hover: a satellite pings.",
  notes: [HOVER],
  seed: 47,
  spec: {
    init: (w, h) => ({ m: Math.max(Math.min(w, h), Math.min(w * 0.55, h * 1.3)) }),
    frame(ctx, s, e) {
      const { w, p, t } = e
      const radii = [0.3, 0.5, 0.72].map((k) => k * s.m)
      const dots = batch(4)
      radii.forEach((R) => {
        for (let i = 0; i <= 40; i += 1) {
          const th = Math.PI / 2 + (i / 40) * (Math.PI / 2)
          dots.add(w + Math.cos(th) * R, Math.sin(th) * R, 1.1, 0.55)
        }
      })
      dots.fill(ctx, p.dim)
      const sats = batch(4)
      radii.forEach((R, i) => {
        const th = Math.PI / 2 + ((((t * (0.06 + i * 0.025) + i * 0.33) % 1) + 1) % 1) * (Math.PI / 2)
        sats.add(w + Math.cos(th) * R, Math.sin(th) * R, 3.2, 1)
      })
      sats.fill(ctx, p.glow)
      if (e.hover > 0.01) {
        const R = radii[1] ?? 0
        const th = Math.PI * 0.68
        const x = w + Math.cos(th) * R
        const y = Math.sin(th) * R
        icon(ctx, SATELLITE, x, y, 18, 0, p.star, e.hover)
        for (let k = 0; k < 2; k += 1) {
          const ph = (((t * 0.8 + k * 0.5) % 1) + 1) % 1
          hexStroke(ctx, x, y, 10 + ph * 30, p.bright, e.hover * (1 - ph) * 0.7)
        }
      }
    },
  },
})

// Hexagon cells from the card's top right corner, shaped by slow noise. Hover: a scan ripples out from the pointer.
const noiseCorner = cosmos({
  id: "cosmos-noise-corner",
  name: "Hex noise corner",
  kind: "surface",
  description:
    "Hexagon cells from a card's top right, shaped by slow noise, gone before the copy. Hover: a scan ripples.",
  notes: [HOVER],
  seed: 53,
  spec: {
    init: () => ({ rings: [] as Ring[], next: 0 }),
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      const R = Math.max(Math.min(w, h) * 0.9, Math.min(w * 0.6, 200))
      if (e.inside && !e.still) {
        s.next -= e.dt
        if (e.entered || s.next <= 0) {
          s.rings.push({ x: e.px, y: e.py, t0: t })
          s.next = 1.4
        }
      }
      s.rings = s.rings.filter((r) => t - r.t0 < 2)
      const base = batch()
      const lit = batch(6)
      hexGrid(w - R, 0, w, R, 10, (x, y) => {
        const d = Math.hypot(x - w, y) / R
        if (d > 1) return
        const n = fbm(e.noise, x * 0.012 + t * 0.03, y * 0.012, t * 0.05, 2)
        const v = smooth(0.38, 0.75, n) * (1 - d) ** 1.4
        let boost = 0
        for (const r of s.rings) {
          const age = t - r.t0
          boost += Math.exp(-(((Math.hypot(x - r.x, y - r.y) - age * 160) / 14) ** 2)) * (1 - age / 2) * (1 - d)
        }
        base.add(x, y, 4.6 * (0.3 + 0.7 * v), v)
        if (boost > 0.05) lit.add(x, y, 4.6 * clamp(0.4 + boost), clamp(boost))
      })
      base.fill(ctx, p.glow)
      lit.fill(ctx, p.bright)
    },
  },
})

// A rocket on a hexagon pad in the card's top right, its exhaust idling. Hover: it launches up and out of the
// card, and lands back when the pointer leaves.
const launchPad = cosmos({
  id: "cosmos-launch-pad",
  name: "Launch pad",
  kind: "surface",
  description: "A rocket on a hexagon pad in a card's top right. Hover: it launches, and lands back when you leave.",
  notes: [HOVER, SUBJECT],
  seed: 59,
  spec: {
    init: (w) => ({ y: 0, vy: 0, puffs: [] as Puff[], x: w - 44 }),
    frame(ctx, s, e) {
      const { w, p, t } = e
      s.x = w - 44
      const rest = 52
      // The pad: a flat hexagon of cells under the rocket.
      const pad = batch(5)
      hexGrid(s.x - 26, rest + 14, s.x + 26, rest + 26, 6, (x, y) => {
        if (Math.abs(x - s.x) + Math.abs(y - (rest + 20)) * 2 < 30) pad.add(x, y, 2.3, 0.7)
      })
      pad.fill(ctx, p.glow)
      hexStroke(ctx, s.x, rest + 20, 30, p.dim, 0.5)
      if (e.still) s.y = e.hover > 0.5 ? -26 : 0
      else if (e.hover > 0.5) {
        s.vy -= 260 * e.dt
        s.y = Math.max(-200, s.y + s.vy * e.dt)
      } else {
        s.vy = 0
        s.y += (0 - s.y) * (1 - Math.exp(-e.dt * 2.4))
      }
      const y = rest + s.y
      const burning = !e.still && (e.hover > 0.5 || s.y < -1)
      if (!e.still) {
        const n = burning ? 2 : Math.random() < 0.3 ? 1 : 0
        for (let i = 0; i < n; i += 1)
          s.puffs.push({
            x: s.x - 1,
            y: y + 12,
            vx: (Math.random() - 0.5) * 16,
            vy: burning ? 40 : 10,
            r: 1,
            life: burning ? 0.8 : 0.4,
            age: 0,
          })
      }
      s.puffs = stepPuffs(s.puffs, e.dt)
      drawPuffs(ctx, s.puffs, p.bright)
      icon(ctx, ROCKET, s.x, y + Math.sin(t * 9) * (burning ? 0.6 : 0), 22, rocketAngle(-Math.PI / 2), p.star, 1)
    },
  },
})

// A few hexagon stars in the card's top right, joined into a constellation. Hover: the pointer finds its three
// nearest stars, like a vector search.
const constellationCorner = cosmos({
  id: "cosmos-constellation-corner",
  name: "Constellation corner",
  kind: "surface",
  description:
    "Hexagon stars joined into a constellation in a card's top right. Hover: the pointer finds its nearest stars.",
  notes: [HOVER, STARS],
  seed: 61,
  spec: {
    init: (w, h) => {
      const rand = mulberry(67)
      const stars = Array.from({ length: 11 }, () => ({
        x: w * (0.5 + rand() * 0.46),
        y: h * (0.06 + rand() * 0.34),
        r: 1.3 + rand() * 2,
      }))
      const order = [...stars].sort((a, b) => a.x - b.x)
      return { stars, order }
    },
    frame(ctx, s, e) {
      const { p } = e
      ctx.strokeStyle = p.line
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      s.order.forEach((st, i) => {
        if (i === 0) ctx.moveTo(st.x, st.y)
        else ctx.lineTo(st.x, st.y)
      })
      ctx.stroke()
      ctx.globalAlpha = 1
      const b = batch(4)
      for (const st of s.stars) b.add(st.x, st.y, st.r, 0.9)
      b.fill(ctx, p.star)
      nearest(ctx, e, s.stars, 3, 260)
    },
  },
})

// ---- Hex terrain: a surface of hexagons in perspective ----------------------------------------------------------------

// A wide surface of hexagons seen from just above, rolling slowly with noise, lit from above and fading into the
// distance, like a field of vectors in space (2026-11-25). From a reference's dotted surface (izum.study), redrawn
// as Qdrant's own: hexagons instead of dots, the website's colors, light from above, and hover moments that are
// about vector search. Four hover moments, one per variation; outside it, the other hexagons dim.

const REFERENCE: PatternNote = {
  rule: "References are for patterns, never copies",
  source: "web/guidelines.ts, Content and originality",
  text: "It comes from a reference site's dotted 3D surface (izum.study). It's redrawn with hexagons, the website's colors, light from above and vector-search hover moments, but a surface of points in perspective is close to that site's signature visual. Juan to decide.",
}
const RED: PatternNote = {
  rule: "Brand patterns are violet by default, red only with a yes",
  source: "web/guidelines.ts, Patterns and effects",
  text: "The reference is red. Here it starts in Secondary (indigo); Primary turns it amaranth, which needs a yes as a background.",
}

type TerrainMode = "constellation" | "tree" | "search" | "swell"
type Pt = { x: number; y: number; r: number; a: number; w: number; row: number; col: number }

const COLS = 300
const ROWS = 70

function terrain(mode: TerrainMode): Spec<{ pts: Pt[]; grid: (Pt | null)[] }> {
  return {
    init: () => ({ pts: [], grid: [] }),
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      const F = w * 0.5
      const horizon = h * 0.04
      const cam = 1
      // The nearest row reaches the bottom even where the surface rises (0.6 above the ground).
      const zNear = clamp(((cam - 0.6) * F) / (h - horizon), 0.15, 4)
      const zFar = zNear * 16
      const xMax = ((w / 2 + 40) * zFar) / F
      const reach = Math.min(200, Math.max(130, w * 0.12))
      const lift = mode === "swell" ? e.hover : 0
      const height = (X: number, Z: number) =>
        0.36 * Math.sin(X * 0.9 + Z * 0.3 + t * 0.16) * Math.cos(Z * 0.5 - t * 0.1) +
        0.5 * (fbm(e.noise, X * 0.35, Z * 0.26 + t * 0.02, 0.7, 2) - 0.5) +
        0.16 * Math.cos(X * 0.45)
      const project = (X: number, Y: number, Z: number) => ({
        x: w / 2 + (X * F) / Z,
        y: horizon + ((cam - Y) * F) / Z,
      })
      s.pts.length = 0
      s.grid = new Array(COLS * ROWS).fill(null)
      // Near rows first: a farther hexagon shows only above the nearer surface in its column, so the backs of
      // hills stay hidden.
      const horizonLine = new Array<number>(COLS).fill(h + 100)
      for (let row = ROWS - 1; row >= 0; row -= 1) {
        const k = row / (ROWS - 1)
        const Z = zFar * Math.pow(zNear / zFar, k) // far (row 0) to near, evenly on screen
        const near = 1 - (Z - zNear) / (zFar - zNear)
        for (let col = 0; col < COLS; col += 1) {
          const X = -xMax + (2 * xMax * col) / (COLS - 1)
          if (Math.abs((X * F) / Z) > w / 2 + 30) continue
          let Y = height(X, Z)
          let q = project(X, Y, Z)
          const hidden = q.y > (horizonLine[col] ?? h) - 0.5
          if (!hidden) horizonLine[col] = q.y
          if (hidden || q.y < -20 || q.y > h + 20) continue
          let wgt = 0
          if (e.hover > 0.01) {
            const d = Math.hypot(q.x - e.px, q.y - e.py)
            wgt = smooth(reach, reach * 0.45, d)
            if (lift > 0 && wgt > 0) {
              Y += lift * 0.11 * Math.exp(-((d / (reach * 0.8)) ** 2)) * (Z / zNear) ** 0.5
              q = project(X, Y, Z)
            }
          }
          // Lit from above: the slope toward the viewer catches the light.
          const slope = height(X, Z - 0.05) - height(X, Z)
          const lit = clamp(0.85 + slope * 9, 0.45, 1.35)
          const pt: Pt = {
            x: q.x,
            y: q.y,
            r: clamp((5 * zNear) / Z + 0.3, 0.6, 3.6),
            a: clamp((0.42 + 0.58 * Math.pow(near, 0.6)) * lit),
            w: wgt,
            row,
            col,
          }
          s.pts.push(pt)
          s.grid[row * COLS + col] = pt
        }
      }
      // Subtle (2026-11-25): the rest of the surface dims a little, and the hexagons near the pointer grow and
      // brighten a little.
      const dim = 1 - 0.25 * e.hover
      const base = batch()
      const lit = batch(6)
      const picked: Pt[] = []
      for (const q of s.pts) {
        const sel = q.w * e.hover
        base.add(q.x, q.y, q.r, q.a * lerp(dim, 0.6, sel))
        if (sel > 0.02) {
          lit.add(q.x, q.y, q.r * (1 + 0.35 * sel), clamp(q.a + 0.15) * sel * 0.6)
          if (q.w > 0.25) picked.push(q)
        }
      }
      base.fill(ctx, p.glow)
      // The hover moment's lines.
      const line = (a: Pt, b: Pt, strength: number) => {
        ctx.globalAlpha = strength
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      ctx.lineWidth = 1
      ctx.strokeStyle = p.glow
      // The constellations join a few "stars" among the picked hexagons, the same ones every frame.
      const star = (q: Pt) => ((Math.imul(q.row + 7, 73856093) ^ Math.imul(q.col + 3, 19349663)) >>> 0) % 100 < 4
      const list = mode === "swell" ? picked : picked.filter(star)
      if (mode !== "swell") for (const q of list) hexStroke(ctx, q.x, q.y, q.r * 1.8 + 1.5, p.glow, e.hover * q.w * 0.5)
      if (mode === "constellation" && list.length > 1) {
        // Each picked hexagon joins its two nearest picked neighbours.
        for (const a of list) {
          const near = list
            .filter((b) => b !== a)
            .map((b) => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
            .sort((m, n) => m.d - n.d)
            .slice(0, 2)
          for (const { b } of near) line(a, b, e.hover * Math.min(a.w, b.w) * 0.5)
        }
      } else if (mode === "tree" && list.length > 1) {
        // A spanning tree through the picked hexagons (Prim's), like one constellation drawn in one stroke.
        const inTree = new Set<Pt>([list[0] as Pt])
        const dist = new Map<Pt, { d: number; from: Pt }>()
        for (const b of list)
          if (b !== list[0])
            dist.set(b, { d: Math.hypot(b.x - (list[0] as Pt).x, b.y - (list[0] as Pt).y), from: list[0] as Pt })
        while (dist.size) {
          let best: Pt | null = null
          let bd = Infinity
          for (const [b, v] of dist)
            if (v.d < bd) {
              bd = v.d
              best = b
            }
          if (!best) break
          const v = dist.get(best)
          dist.delete(best)
          inTree.add(best)
          if (v) line(v.from, best, e.hover * Math.min(v.from.w, best.w) * 0.5)
          for (const [b, o] of dist) {
            const d = Math.hypot(b.x - best.x, b.y - best.y)
            if (d < o.d) dist.set(b, { d, from: best })
          }
        }
      } else if (mode === "search") {
        // A vector search: the pointer joins its eight nearest hexagons, ranked, inside a search radius.
        nearest(ctx, e, list, 6, reach, 0.56)
      } else if (mode === "swell") {
        // The lifted hexagons as a wireframe: each joins its neighbours on the surface, so the hill reads in 3D.
        for (const a of list) {
          const right = s.grid[a.row * COLS + a.col + 1]
          const down = s.grid[(a.row + 1) * COLS + a.col]
          if (right && right.w > 0.25) line(a, right, e.hover * Math.min(a.w, right.w) * 0.38)
          if (down && down.w > 0.25) line(a, down, e.hover * Math.min(a.w, down.w) * 0.38)
        }
      }
      ctx.globalAlpha = 1
      lit.fill(ctx, p.bright)
    },
  }
}

const terrainNotes = [FULL, REFERENCE, RED, HOVER]

const hexTerrain = cosmos({
  id: "cosmos-hex-terrain",
  name: "Hex terrain, constellation",
  kind: "background",
  description:
    "A surface of hexagons in perspective, rolling slowly. Hover: the hexagons near the pointer join into a constellation and the rest dim.",
  notes: terrainNotes,
  seed: 71,
  spec: terrain("constellation"),
})
const hexTerrainTree = cosmos({
  id: "cosmos-hex-terrain-tree",
  name: "Hex terrain, spanning tree",
  kind: "background",
  description:
    "A surface of hexagons in perspective. Hover: the hexagons near the pointer join in one branching line, like a constellation drawn in a stroke.",
  notes: terrainNotes,
  seed: 73,
  spec: terrain("tree"),
})
const hexTerrainSearch = cosmos({
  id: "cosmos-hex-terrain-search",
  name: "Hex terrain, nearest",
  kind: "background",
  description:
    "A surface of hexagons in perspective. Hover: a vector search, from the pointer to its eight nearest hexagons, in a search radius.",
  notes: terrainNotes,
  seed: 79,
  spec: terrain("search"),
})
const hexSwell = cosmos({
  id: "cosmos-hex-swell",
  name: "Hex terrain, swell",
  kind: "background",
  description:
    "A surface of hexagons in perspective. Hover: the surface swells into a hill under the pointer, drawn as a wireframe.",
  notes: terrainNotes,
  seed: 83,
  spec: terrain("swell"),
})

export const cosmosPatterns: PatternDefinition[] = [
  hexTerrain,
  hexTerrainTree,
  hexTerrainSearch,
  hexSwell,
  constellation,
  nebula,
  orbits,
  warp,
  comet,
  planetCorner,
  orbitCorner,
  noiseCorner,
  launchPad,
  constellationCorner,
]
