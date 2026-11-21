"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_CELLS } from "./glsl"

// Cell edges: cellular noise drawn as hairline edges around drifting points, each cell the region nearest
// its point, like an index partitioning vectors. A query (the pointer, or a slow path when it's away)
// lights its cell, joins its nearest point with a hairline and turns that point to the accent.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6;
out vec4 color;
${GLSL_BASE}
${GLSL_CELLS}
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0));
}

void main() {
  vec3 bg = u_c0, line = u_c1, haze = u_c2, violet = u_c3, glow = u_c4, bright = u_c5, accent = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  // CSS px per cell.
  const float SIZE = 88.0;
  float t = u_time * 0.3;
  vec2 drift = vec2(u_time * 4.0, u_time * 1.5);
  vec4 v = cells((px + drift) / SIZE, t);

  vec2 query = u_pointer.x >= 0.0
    ? u_pointer / u_dpr
    : vec2(res.x * (0.74 + 0.12 * sin(u_time * 0.21)), res.y * (0.5 + 0.22 * sin(u_time * 0.29)));
  vec4 qv = cells((query + drift) / SIZE, t);
  float chosen = 1.0 - step(0.5, length(v.zw - qv.zw));
  vec2 nearest = cellPoint(qv.zw, t) * SIZE - drift;

  float above = mix(0.45, 1.0, px.y / res.y);
  float room = mix(0.25, 1.0, copyRoom(px.x / res.x));
  float edges = 1.0 - clamp(v.y * SIZE * u_dpr, 0.0, 1.0);
  float points = disc(v.x * SIZE, 1.5, u_dpr);

  vec3 c = mix(bg, mix(haze, violet, 0.6), chosen);
  c = mix(c, mix(line, glow, chosen), edges * above * room);
  c = mix(c, mix(line, glow, above), points * room * (1.0 - chosen));
  // The query, ringed, and the hairline to its nearest point.
  float ring = 1.0 - clamp(abs(length(px - query) - 4.0) * u_dpr, 0.0, 1.0);
  float link = 1.0 - clamp(segment(px, query, nearest) * u_dpr, 0.0, 1.0);
  c = mix(c, bright, max(ring, link * 0.6));
  c = mix(c, accent, points * chosen);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "line",
  "haze",
  "violet",
  "glow",
  "bright",
  "accent",
]

export function CellEdges() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
