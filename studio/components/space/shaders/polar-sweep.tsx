"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Polar sweep: a polar grid (rings every 48px, spokes every 15 degrees) with a sweep turning over it and a
// violet afterglow behind. Points on the 8px grid light as the sweep passes; one result in the accent
// flares and rings each turn.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6;
out vec4 color;
${GLSL_BASE}
const float TAU = 6.2831853;

void main() {
  vec3 bg = u_c0, line = u_c1, dim = u_c2, violet = u_c3, glow = u_c4, bright = u_c5, accent = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 center = vec2(res.x * 0.74, res.y * 0.46);
  vec2 p = px - center;
  float r = length(p);
  float theta = atan(p.y, p.x);
  float sweep = u_time * 0.5;
  // Radians since the sweep passed this angle.
  float after = exp(-mod(sweep - theta, TAU) * 1.4);
  float room = mix(0.25, 1.0, copyRoom(px.x / res.x));
  float reach = (1.0 - smoothstep(res.y * 0.3, res.y * 1.1, r)) * room;

  // The grid, measured in device pixels so every line is one pixel wide.
  float rings = 1.0 - clamp(abs(fract(r / 48.0 + 0.5) - 0.5) * 48.0 * u_dpr, 0.0, 1.0);
  float spokeAngle = abs(fract(theta / (TAU / 24.0) + 0.5) - 0.5) * (TAU / 24.0);
  float spokes = (1.0 - clamp(r * sin(spokeAngle) * u_dpr, 0.0, 1.0)) * smoothstep(24.0, 96.0, r);
  vec2 dir = vec2(cos(sweep), sin(sweep));
  float beam = (1.0 - clamp(abs(dir.x * p.y - dir.y * p.x) * u_dpr, 0.0, 1.0)) * step(0.0, dot(dir, p));

  // Points: one in some 16px cells, at the cell's center on the 8px grid.
  vec2 cell = floor(px / 16.0);
  vec2 at = cell * 16.0 + 8.0;
  vec2 pa = at - center;
  float swept = exp(-mod(sweep - atan(pa.y, pa.x), TAU) * 1.1);
  float points = step(hash2(cell + 5.0).x, 0.14) * disc(length(px - at), 0.9 + 0.7 * swept, u_dpr);

  // The result, at a fixed spot on the right.
  vec2 hit = center + floor(vec2(cos(0.55), sin(0.55)) * 16.0 + 0.5) * 8.0;
  vec2 ph = hit - center;
  float found = exp(-mod(sweep - atan(ph.y, ph.x), TAU) * 0.8);
  float dh = length(px - hit);
  float mark = disc(dh, 2.0, u_dpr) * (0.45 + 0.55 * found);
  mark = max(mark, (1.0 - clamp(abs(dh - 6.0) * u_dpr, 0.0, 1.0)) * found);

  vec3 c = mix(bg, violet, after * 0.5 * reach);
  c = mix(c, line, max(rings, spokes * 0.6) * reach * 0.6);
  c = mix(c, glow, beam * reach);
  c = mix(c, mix(dim, bright, swept), points * mix(0.35, 1.0, swept) * room);
  c = mix(c, accent, mark);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "line",
  "dim",
  "violet",
  "glow",
  "bright",
  "accent",
]

export function PolarSweep() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
