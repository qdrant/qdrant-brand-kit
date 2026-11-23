"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_STARS } from "./glsl"

// Depth haze: domain-warped noise as layers of violet haze, lit from above and quieter under the copy, in
// smooth color (no dither). Sparse stars sit in front of it, snapped to the 8px grid: dim ones in 32px
// cells, a few brighter ones in 96px cells.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6;
out vec4 color;
${GLSL_NOISE}
${GLSL_BASE}
${GLSL_STARS}
void main() {
  vec3 bg = u_c0, haze = u_c1, violet = u_c2, plum = u_c3, glow = u_c4, star = u_c5, dim = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 uv = px / res.y;
  float t = u_time * 0.02;
  vec2 q = vec2(fbm(uv * 1.2 + vec2(t, -t * 0.5)), fbm(uv * 1.2 + vec2(5.2, 1.3) - t));
  float n = fbm(uv * 1.7 + 2.4 * q + vec2(-t * 0.6, t));
  float above = smoothstep(-0.2, 1.0, px.y / res.y);
  float room = copyRoom(px.x / res.x);
  float v = clamp((n - 0.3) * 2.2, 0.0, 1.0) * (0.3 + 0.9 * above) * mix(0.3, 1.0, room);

  vec3 c = mix(bg, haze, smoothstep(0.0, 0.3, v));
  c = mix(c, violet, smoothstep(0.25, 0.65, v));
  c = mix(c, plum, smoothstep(0.45, 0.85, v) * smoothstep(0.4, 0.7, q.y) * 0.6);
  c = mix(c, glow, smoothstep(0.75, 1.1, v) * 0.3);

  vec2 s1 = gridStars(px, 32.0, 0.14, 1.0, u_dpr);
  vec2 s2 = gridStars(px, 96.0, 0.3, 7.0, u_dpr);
  float fade = mix(0.35, 1.0, room);
  c = mix(c, dim, s1.x * mix(0.5, 1.0, s1.y) * fade);
  c = mix(c, star, s2.x * mix(0.5, 1.0, s2.y) * fade);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "haze",
  "violet",
  "plum",
  "glow",
  "star",
  "dim",
]

export function DepthHaze() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
