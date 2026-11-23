"use client"

import {
  GLSL_NOISE,
  SceneCanvas,
  SceneShader,
  alpha,
  rgb,
  type CanvasScene,
  type Palette,
  type PaletteKey,
} from "../../visuals/scene"
import { definePattern, type PatternNote } from "../types"

// The simplest options from the studio's Space page (2026-11-23), brought to the website and polished: the
// canvas ones run on web/visuals/scene.tsx with the --web-scene-* colors (the Space page's --sp-* colors under the
// website's names), and the CSS ones are classes in the patterns block of web/styles/web.css. What each one
// dropped or changed is in its comment. In every one: no text (patterns never hold text, and the readouts were
// placeholders), no accent mark, no pointer (patterns take no pointer events), and the layer is transparent, so
// the section or card keeps its own fill.

const TAU = Math.PI * 2
const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x))

// mulberry32, so a scene draws the same on every load.
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const isLight = (p: Palette) => {
  const [r, g, b] = rgb(p.surface)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 128
}

const NOT_UNDER_DATA: PatternNote = {
  rule: "A dot or line grid never sits under data",
  source: "design-system/DESIGN.md, Second pass: structure, with numbers",
  text: "Fine behind a heading or a visual, but keep it off sections with tables, charts or numbers.",
}

// ---- BG-06 Halftone field -------------------------------------------------------------------------------------
// A dot grid whose dot sizes print a smooth light from the top right, breathing slowly. Polished: the dots sit on
// the 8px grid (a 16px pitch, every other row offset by 8), the dashed half-light contour and its "I 0.50"
// readout are gone, and the ripple runs about three times slower, so it reads as light, not a signal.

type HalftoneState = { w: number; h: number; p: Palette }

const PITCH = 16
const GAMMA = 1.6

const halftoneScene: CanvasScene<HalftoneState> = {
  setup: ({ width: w, height: h }, p) => ({ w, h, p }),
  draw(ctx, { w, h, p }, t) {
    ctx.clearRect(0, 0, w, h)
    const lx = w * 1.02
    const ly = -h * 0.14
    const reach = Math.hypot(w, h) * 0.86
    const breathe = 0.9 + 0.1 * Math.sin(t * 0.4)
    const max = PITCH * 0.22
    // Three tones: the largest dots, in the most light, are the brightest.
    const bright = new Path2D()
    const mid = new Path2D()
    const dim = new Path2D()
    for (let row = 0, y = PITCH / 2; y < h + PITCH; row++, y += PITCH)
      for (let x = row % 2 ? PITCH : PITCH / 2; x < w + PITCH; x += PITCH) {
        const d = Math.hypot(x - lx, y - ly) / reach
        const drift = 0.06 * Math.sin(x * 0.011 + y * 0.007 - t * 0.2) * Math.sin(y * 0.013 - x * 0.004 + t * 0.15)
        const ripple = 0.03 * Math.sin(d * 22 - t * 0.35)
        const light = clamp(1 - d + drift + ripple) ** GAMMA * breathe
        const r = max * light
        if (r < 0.4) continue
        const path = light > 0.5 ? bright : light > 0.22 ? mid : dim
        path.moveTo(x + r, y)
        path.arc(x, y, r, 0, TAU)
      }
    ctx.fillStyle = p.bright
    ctx.fill(bright)
    ctx.fillStyle = p.glow
    ctx.fill(mid)
    ctx.globalAlpha = 0.6
    ctx.fill(dim)
    ctx.globalAlpha = 1
  },
}

export const halftoneField = definePattern({
  id: "halftone-field",
  name: "Halftone field",
  kind: "background",
  description: "A dot grid whose dot sizes print a soft light from the top right, breathing slowly.",
  status: "exploring",
  // From: Space page, BG-06 Halftone field.
  notes: [NOT_UNDER_DATA],
  Layer: () => (
    <div className="web-field absolute inset-0">
      <SceneCanvas scene={halftoneScene} />
    </div>
  ),
})

// ---- BG-19 Isometric hexes ------------------------------------------------------------------------------------
// A line-only lattice of pointy-top hexagons, each split into three faces so it reads as stacked cubes lit from
// above; a few parts fill faintly as a slow field passes. Polished: the selected part in the accent and its
// cube-coordinates readout are gone, the parts fade in and out more slowly, and the lattice and its parts run
// evenly across the whole width (the Space page faded both out toward the left, which read as a shadow).

const R = 32
const SX = Math.sqrt(3) * R
const SY = 1.5 * R

// Corners of a pointy-top hexagon from the top, clockwise: top, upper right, lower right, bottom, lower left,
// upper left. Upright like the brandmark's parts and the website's nodes.
const UNIT = [0, 1, 2, 3, 4, 5].map((k) => {
  const a = ((60 * k - 90) * Math.PI) / 180
  return [Math.cos(a), Math.sin(a)] as const
})
type Pt = readonly [number, number]
const corners = (x: number, y: number): Pt[] => UNIT.map(([cx, cy]) => [x + cx * R, y + cy * R] as const)
const at = (v: Pt[], k: number): Pt => v[k] ?? [0, 0]

function hexagon(path: CanvasRenderingContext2D | Path2D, x: number, y: number) {
  UNIT.forEach(([cx, cy], k) => {
    if (k) path.lineTo(x + cx * R, y + cy * R)
    else path.moveTo(x + cx * R, y + cy * R)
  })
  path.closePath()
}

const field = (x: number, y: number, t: number) =>
  Math.sin(x * 0.013 + t * 0.2) * Math.sin(y * 0.019 - t * 0.15) + 0.5 * Math.sin((x + y) * 0.007 - t * 0.12)

type Cube = { x: number; y: number; level: number; seed: number }
type IsoState = { w: number; h: number; p: Palette; cubes: Cube[]; faces: [string, string, string]; last: number }

const isoScene: CanvasScene<IsoState> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(13)
    const cubes: Cube[] = []
    for (let row = -1; row * SY < h + R; row++)
      for (let col = -1; col * SX < w + SX; col++)
        cubes.push({ x: col * SX + (row & 1 ? SX / 2 : 0), y: row * SY, level: 0, seed: rand() })
    // Top, left and right faces. Light from above: the top is the lightest face in both themes.
    const faces: [string, string, string] = isLight(p)
      ? [p.surface, alpha(p.glow, 0.12), alpha(p.glow, 0.22)]
      : [alpha(p.bright, 0.16), alpha(p.glow, 0.09), alpha(p.glow, 0.04)]
    return { w, h, p, cubes, faces, last: -1 }
  },
  draw(ctx, s, t) {
    const { p, w, h, cubes, faces } = s
    const dt = s.last < 0 ? 0 : Math.max(0, t - s.last)
    s.last = t
    ctx.clearRect(0, 0, w, h)

    // The lattice: each hexagon's outline and the Y that splits it into three faces.
    const wire = new Path2D()
    for (const { x, y } of cubes) {
      const v = corners(x, y)
      hexagon(wire, x, y)
      for (const k of [5, 1, 3]) {
        wire.moveTo(x, y)
        wire.lineTo(...at(v, k))
      }
    }
    ctx.lineWidth = 1
    ctx.strokeStyle = alpha(p.line, 0.7)
    ctx.stroke(wire)

    // Parts fill as the field passes, easing in and out over about two seconds.
    const shape = (points: Pt[]) => {
      ctx.beginPath()
      points.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }
    for (const cube of cubes) {
      const on = field(cube.x, cube.y, t) + cube.seed * 0.35 > 1.05
      const target = on ? 1 : 0
      cube.level = dt > 0 ? cube.level + (target - cube.level) * (1 - Math.exp(-dt * 1.2)) : target
      if (cube.level < 0.02) continue
      const { x, y } = cube
      const v = corners(x, y)
      const c: Pt = [x, y]
      ctx.globalAlpha = cube.level
      const parts: [Pt[], string][] = [
        [[at(v, 0), at(v, 1), c, at(v, 5)], faces[0]],
        [[at(v, 5), c, at(v, 3), at(v, 4)], faces[1]],
        [[c, at(v, 1), at(v, 2), at(v, 3)], faces[2]],
      ]
      for (const [points, fill] of parts) {
        shape(points)
        ctx.fillStyle = fill
        ctx.fill()
      }
      ctx.strokeStyle = alpha(p.glow, 0.5)
      ctx.beginPath()
      hexagon(ctx, x, y)
      for (const k of [5, 1, 3]) {
        ctx.moveTo(x, y)
        ctx.lineTo(...at(v, k))
      }
      ctx.stroke()
      // The top edges catch the light.
      ctx.strokeStyle = alpha(p.bright, 0.8)
      ctx.beginPath()
      ctx.moveTo(...at(v, 5))
      ctx.lineTo(...at(v, 0))
      ctx.lineTo(...at(v, 1))
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  },
}

export const isometricHexes = definePattern({
  id: "isometric-hexes",
  name: "Isometric hexes",
  kind: "background",
  description: "A hairline lattice of hexagons split into faces, read as cubes lit from above; a few fill faintly and fade.",
  status: "exploring",
  // From: Space page, BG-19 Isometric hexes.
  Layer: () => (
    <div className="absolute inset-0">
      <SceneCanvas scene={isoScene} />
    </div>
  ),
})

// ---- SF-05 Halftone corner ------------------------------------------------------------------------------------
// A halftone dot gradient from the card's top-right corner: five layers of dots on one 8px grid, each smaller
// and reaching further, so the dots shrink with distance, fading out before the card's copy. Polished: still
// (the hover reach is gone, since patterns take no pointer events), and the whole card's width, not a 136px band.

export const halftoneCorner = definePattern({
  id: "halftone-corner",
  name: "Halftone corner",
  kind: "surface",
  description: "Dots on the 8px grid, shrinking away from the card's top-right corner, gone before the copy.",
  status: "exploring",
  // From: Space page, SF-05 Halftone corner.
  Layer: () => (
    <div className="web-sp-halftone absolute inset-0">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`web-sp-halftone__dots web-sp-halftone__dots--${n}`} />
      ))}
    </div>
  ),
})

// ---- SF-09 Blueprint ------------------------------------------------------------------------------------------
// A dashed grid: 8px steps, with every fourth line (32px) stronger. Polished: the rulers, their numbers, the
// corners' coordinates and the accent origin are gone, leaving the grid, which fades out before the copy; the
// card keeps its own fill instead of the Space page's violet tint.

export const blueprint = definePattern({
  id: "blueprint",
  name: "Blueprint",
  kind: "surface",
  description: "A dashed 8px grid with a stronger line every 32px, fading out before the copy.",
  status: "exploring",
  // From: Space page, SF-09 Blueprint.
  notes: [NOT_UNDER_DATA],
  Layer: () => <div className="web-sp-blueprint absolute inset-0" />,
})

// ---- SH-01 Dither haze ----------------------------------------------------------------------------------------
// Violet depth haze from slow, warped noise, lit from above, quieter on the left where a section's copy sits, and
// quantized to the violet ramp with a 4 x 4 Bayer dither. Polished: the darkest step is the section's own
// background (the wrapper sets --web-scene-bg to it, since the engine's WebGL canvas is opaque), so the haze
// sits on any surface; the cells are 4px, on the 4px spacing scale (they were 3px); and the light the pointer
// added is gone. The ramp's colors are --web-scene-ramp-1 to 4 in web.css.
const DITHER = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
out vec4 color;
${GLSL_NOISE}
void main() {
  float size = 4.0 * u_dpr;
  vec2 cell = floor(gl_FragCoord.xy / size);
  vec2 at = cell * size;
  vec2 uv = at / u_res.y;
  float t = u_time * 0.025;
  vec2 q = vec2(fbm(uv * 1.3 + vec2(t, 0.0)), fbm(uv * 1.3 + vec2(5.2, 1.3) - t));
  float n = fbm(uv * 1.7 + 1.8 * q + vec2(0.0, t * 1.5));
  float above = smoothstep(-0.1, 1.0, at.y / u_res.y);
  float room = mix(0.6, 1.0, smoothstep(0.05, 0.6, at.x / u_res.x));
  float v = clamp(n * (0.2 + 1.05 * above) * room * 1.35 - 0.2, 0.0, 0.999) * 4.0;
  float step = floor(v) + (fract(v) > bayer4(cell) ? 1.0 : 0.0);
  vec3 c = step < 1.0 ? u_c0 : step < 2.0 ? u_c1 : step < 3.0 ? u_c2 : step < 4.0 ? u_c3 : u_c4;
  color = vec4(c, 1.0);
}`

const RAMP: readonly PaletteKey[] = ["bg", "ramp-1", "ramp-2", "ramp-3", "ramp-4"]

export const ditherHaze = definePattern({
  id: "dither-haze",
  name: "Dither haze",
  kind: "background",
  description: "Violet haze lit from above, dithered into four steps of the violet ramp in 4px cells, calm on the left.",
  status: "exploring",
  // From: Space page, SH-01 Dither haze.
  notes: [
    {
      rule: "Patterns are subtle",
      source: "web/guidelines.ts, Patterns and effects",
      text: "Its brightest step is indigo 600 at full strength, louder than any approved pattern (Depth haze runs at half). It holds back on the left, behind the copy, but the top right reads as a colored area of the section.",
    },
  ],
  Layer: () => (
    <div className="web-sp-dither absolute inset-0">
      <SceneShader fragment={DITHER} colors={RAMP} />
    </div>
  ),
})

export const spacePatterns = [halftoneField, isometricHexes, ditherHaze, halftoneCorner, blueprint]
