"use client"

import * as React from "react"

import type { PatternKind, PatternNote } from "../types"
import { definePattern } from "../types"
import { GLSL_NOISE, SceneShader, type PaletteKey } from "../../visuals/scene"
import { measureGuards } from "./cosmos"

// Depth haze, vivid (2026-11-26, exploring): the approved Depth haze (web/patterns/depth-haze.tsx, the design lead,
// 2026-11-22) with stars in more contrast and more movement, as a surface for cards and as a background for a
// section. The approved one stays as it is, on the Resilience page; this is the comparison.
//
// What changes from Depth haze:
// - Stars: brighter and a little larger, both layers drawn in the star color at full strength (the approved one
//   mixes them in at 60%, its far layer in the dim color), and the layer runs stronger (75% on dark, from 50%).
// - Movement: the haze flows about three times as fast, and the stars drift slowly up and to the right on two layers
//   at different speeds, so they read as depth. They don't twinkle (no flicker in brightness).
// - A text guard, like the space set's: the haze and its stars clear themselves, with a soft edge, from under every
//   text, icon and control in the card (or the section), measured in the page and kept up to date. A shader can't
//   cut holes in itself, so the layer gets a CSS mask drawn from those boxes.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6;
out vec4 color;
${GLSL_NOISE}
vec2 hash2(vec2 p) {
  vec3 p3 = fract(p.xyx * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float disc(float d, float r, float dpr) {
  return clamp((r - d) * dpr + 0.5, 0.0, 1.0);
}
vec2 gridStars(vec2 px, float size, float odds, float seed, float rmin, float rmax, float dpr) {
  vec2 cell = floor(px / size);
  vec2 h = hash2(cell + seed);
  vec2 g = hash2(cell + seed + 41.0);
  vec2 at = cell * size + (floor(g * (size / 8.0 - 1.0)) + 1.0) * 8.0;
  float r = mix(rmin, rmax, h.y);
  return vec2(step(h.x, odds) * disc(length(px - at), r, dpr), h.y);
}
void main() {
  vec3 bg = u_c0, haze = u_c1, violet = u_c2, plum = u_c3, glow = u_c4, star = u_c5, dim = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 uv = px / res.y;
  // About three times the approved drift, with a slow pan so the haze travels as well as turns.
  float t = u_time * 0.065;
  vec2 pan = vec2(u_time * 0.012, u_time * 0.004);
  vec2 q = vec2(fbm(uv * 1.2 + pan + vec2(t, -t * 0.5)), fbm(uv * 1.2 + pan + vec2(5.2, 1.3) - t));
  float n = fbm(uv * 1.7 + pan + 2.4 * q + vec2(-t * 0.6, t));
  float above = smoothstep(-0.2, 1.0, px.y / res.y);
  float v = clamp((n - 0.3) * 2.2, 0.0, 1.0) * (0.3 + 0.9 * above);

  vec3 c = mix(bg, haze, smoothstep(0.0, 0.3, v));
  c = mix(c, violet, smoothstep(0.25, 0.65, v));
  c = mix(c, plum, smoothstep(0.45, 0.85, v) * smoothstep(0.4, 0.7, q.y) * 0.6);
  c = mix(c, glow, smoothstep(0.75, 1.1, v) * 0.3);

  // Two layers of stars drifting up and to the right, the near one twice as fast: parallax, so they read as depth.
  vec2 far = px - vec2(u_time * 2.2, u_time * 1.1);
  vec2 near = px - vec2(u_time * 4.8, u_time * 2.4);
  vec2 s1 = gridStars(far, 32.0, 0.16, 1.0, 0.7, 1.35, u_dpr);
  vec2 s2 = gridStars(near, 96.0, 0.34, 7.0, 0.95, 1.8, u_dpr);
  c = mix(c, mix(dim, star, 0.6), s1.x * mix(0.6, 1.0, s1.y) * 0.9);
  c = mix(c, star, s2.x * mix(0.75, 1.0, s2.y));
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = ["bg", "haze", "violet", "plum", "glow", "star", "dim"]

// The layer, masked away from the text of its card (a surface) or its section (a background).
function GuardedHaze({ kind }: { kind: PatternKind }) {
  const host = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const layer = host.current
    const scope =
      kind === "surface" ? layer?.closest<HTMLElement>(".web-plate") : layer?.closest(".web-pattern")?.parentElement
    if (!layer || !scope) return
    const apply = () => {
      const { width, height } = layer.getBoundingClientRect()
      if (width < 1 || height < 1) return
      const holes = measureGuards(scope, layer, kind)
        .map((g) => `<rect x="${g.x - 12}" y="${g.y - 10}" width="${g.w + 24}" height="${g.h + 20}" rx="6"/>`)
        .join("")
      // White where the haze shows, black (blurred) where text sits; the mask turns it into the layer's alpha.
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
        `<defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>` +
        `<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">` +
        `<rect width="${width}" height="${height}" fill="#fff"/><g fill="#000" filter="url(#b)">${holes}</g></mask></defs>` +
        `<rect width="${width}" height="${height}" fill="#fff" mask="url(#m)"/></svg>`
      const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
      layer.style.setProperty("mask-image", url)
      layer.style.setProperty("-webkit-mask-image", url)
      layer.style.setProperty("mask-size", "100% 100%")
      layer.style.setProperty("-webkit-mask-size", "100% 100%")
    }
    const ro = new ResizeObserver(apply)
    ro.observe(scope)
    const timers = [250, 1200, 3000].map((ms) => window.setTimeout(apply, ms))
    void document.fonts?.ready.then(apply)
    apply()
    return () => {
      ro.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [kind])

  return (
    <div ref={host} className="web-depth-haze-vivid absolute inset-0">
      <SceneShader fragment={FRAGMENT} colors={COLORS} />
    </div>
  )
}

const APPROVED: PatternNote = {
  rule: "Depth haze is approved as it is",
  source: "design-system/DESIGN.md, Space options on the website (design lead, 2026-11-22)",
  text: "It changes an approved pattern (brighter stars, faster haze, a stronger layer), so it's an exploration beside the original, not a change to it. Replacing Depth haze with it needs the design lead's yes.",
}
const DRIFT: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern; web/guidelines.ts, Patterns and effects",
  text: "It moves more than the website's patterns so far: the haze flows faster and the stars drift, so they leave the 8px grid while they move. They never twinkle.",
}
const TEXT: PatternNote = {
  rule: "A pattern supports the content",
  source: "web/guidelines.ts, Patterns and effects",
  text: "As a background it covers the whole section and clears itself, with a soft edge, from under the heading and any text outside cards (the text guard). Sections whose text sits on cards suit it best: the cards' fill covers it.",
}

export const depthHazeVivid = definePattern({
  id: "depth-haze-vivid",
  name: "Depth haze, vivid",
  kind: "surface",
  status: "exploring",
  description:
    "Depth haze with brighter stars that drift on two layers and a haze that flows faster. For cards and visuals' frames.",
  notes: [APPROVED, DRIFT],
  Layer: () => <GuardedHaze kind="surface" />,
})

export const depthHazeVividBackground = definePattern({
  id: "depth-haze-vivid-background",
  name: "Depth haze, vivid, background",
  kind: "background",
  status: "exploring",
  description:
    "Depth haze, vivid, behind a whole section: brighter drifting stars and a faster haze, clear of the text.",
  notes: [APPROVED, DRIFT, TEXT],
  Layer: () => <GuardedHaze kind="background" />,
})
