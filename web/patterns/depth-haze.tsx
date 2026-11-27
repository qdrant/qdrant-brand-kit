"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../visuals/scene"
import { definePattern } from "./types"

// Depth haze (from the studio's Space page, SH "Depth haze"; on the website from 2026-11-22): domain-warped noise
// as layers of violet haze, lit from above, drifting slowly, with sparse stars snapped to the 8px grid. A surface
// for a card or a visual's frame, kept subtle: the layer sits at a low opacity over the card's own fill.
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
vec2 gridStars(vec2 px, float size, float odds, float seed, float dpr) {
  vec2 cell = floor(px / size);
  vec2 h = hash2(cell + seed);
  vec2 g = hash2(cell + seed + 41.0);
  vec2 at = cell * size + (floor(g * (size / 8.0 - 1.0)) + 1.0) * 8.0;
  float r = mix(0.55, 1.25, h.y);
  return vec2(step(h.x, odds) * disc(length(px - at), r, dpr), h.y);
}
void main() {
  vec3 bg = u_c0, haze = u_c1, violet = u_c2, plum = u_c3, glow = u_c4, star = u_c5, dim = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 uv = px / res.y;
  float t = u_time * 0.02;
  vec2 q = vec2(fbm(uv * 1.2 + vec2(t, -t * 0.5)), fbm(uv * 1.2 + vec2(5.2, 1.3) - t));
  float n = fbm(uv * 1.7 + 2.4 * q + vec2(-t * 0.6, t));
  float above = smoothstep(-0.2, 1.0, px.y / res.y);
  float v = clamp((n - 0.3) * 2.2, 0.0, 1.0) * (0.3 + 0.9 * above);

  vec3 c = mix(bg, haze, smoothstep(0.0, 0.3, v));
  c = mix(c, violet, smoothstep(0.25, 0.65, v));
  c = mix(c, plum, smoothstep(0.45, 0.85, v) * smoothstep(0.4, 0.7, q.y) * 0.6);
  c = mix(c, glow, smoothstep(0.75, 1.1, v) * 0.3);

  vec2 s1 = gridStars(px, 32.0, 0.14, 1.0, u_dpr);
  vec2 s2 = gridStars(px, 96.0, 0.3, 7.0, u_dpr);
  c = mix(c, dim, s1.x * mix(0.5, 1.0, s1.y) * 0.6);
  c = mix(c, star, s2.x * mix(0.5, 1.0, s2.y) * 0.6);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = ["bg", "haze", "violet", "plum", "glow", "star", "dim"]

export const depthHaze = definePattern({
  id: "depth-haze",
  name: "Depth haze",
  kind: "surface",
  description: "Slow violet haze lit from above, with sparse stars, at a low strength. Behind product screens and visuals.",
  Layer: () => (
    <div className="web-depth-haze absolute inset-0">
      <SceneShader fragment={FRAGMENT} colors={COLORS} />
    </div>
  ),
})
