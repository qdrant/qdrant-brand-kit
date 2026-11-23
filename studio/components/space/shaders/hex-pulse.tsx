"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_HEX } from "./glsl"

// Hex pulse: a lattice of hexagon cells around a core cell in the accent. Every five seconds a wave leaves
// the core; each ring of cells flares as it passes, then fades. Cells hold more or less data, so they
// flare unevenly, and the waves weaken with distance and under the copy.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6;
out vec4 color;
${GLSL_BASE}
${GLSL_HEX}
void main() {
  vec3 bg = u_c0, grid = u_c1, haze = u_c2, violet = u_c3, glow = u_c4, bright = u_c5, accent = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  const float SIZE = 32.0;
  vec4 h = hexCell(px / SIZE);
  vec4 core = hexCell(vec2(res.x * 0.72, res.y * 0.5) / SIZE);
  float ring = hexRing(h.zw - core.zw);
  float pulse = exp(-fract(u_time * 0.2 - ring * 0.1) * 6.0);
  float data = hash2(h.zw * 7.0).x;
  vec2 at = h.zw * SIZE;
  float above = mix(0.6, 1.0, clamp(at.y / res.y, 0.0, 1.0));
  // Quiet under the copy: the waves fade out from about 70% to 30% of the width.
  float room = smoothstep(0.3, 0.72, at.x / res.x);
  float lit = pulse * exp(-ring * 0.08) * mix(0.35, 1.0, data) * above * mix(0.06, 1.0, room);

  // Resting cells sit just off the background; the waves and the core carry the frame.
  vec3 cell = mix(bg, haze, 0.45 * above * mix(0.3, 1.0, room));
  cell = mix(cell, violet, smoothstep(0.01, 0.2, lit) * 0.8);
  cell = mix(cell, mix(glow, bright, lit), smoothstep(0.02, 0.5, lit));
  cell = mix(cell, accent, 1.0 - step(0.5, ring));

  // Cells inset by 2px, with the lattice as a hairline in the gaps. edge is in CSS pixels.
  float edge = (0.5 - hexDist(h.xy)) * SIZE;
  float fill = clamp((edge - 2.0) * u_dpr + 0.5, 0.0, 1.0);
  vec3 c = mix(bg, grid, (1.0 - clamp(edge * u_dpr, 0.0, 1.0)) * mix(0.4, 1.0, room));
  c = mix(c, cell, fill);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "grid",
  "haze",
  "violet",
  "glow",
  "bright",
  "accent",
]

export function HexPulse() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
