"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_HEX, GLSL_SPHERE } from "./glsl"

// Hex fisheye: a hexagon lattice wrapped over a sphere like a fisheye lens (the distance from the center is
// the arc over the sphere), so cells shrink toward the edge. Each cell is shaded flat from the normal at its
// center, lit from above, and the lattice slowly slides across. A few cells hold brighter data.
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
${GLSL_SPHERE}
void main() {
  vec3 bg = u_c0, line = u_c1, haze = u_c2, violet = u_c3, glow = u_c4, bright = u_c5, surface = u_c6;
  float light = lightTheme(bg);
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 center = vec2(res.x * 0.76, res.y * 0.5);
  float radius = res.y * 0.36;
  vec2 d = (px - center) / radius;
  float r = length(d);

  // Cells per radian of arc.
  const float SCALE = 3.4;
  vec2 drift = vec2(u_time * 0.08, u_time * 0.03);
  vec2 q = d / max(r, 1e-4) * asin(min(r, 1.0)) * SCALE + drift;
  vec4 h = hexCell(q);
  vec2 qc = h.zw - drift;
  float arc = length(qc) / SCALE;
  vec3 n = vec3(qc / max(length(qc), 1e-4) * sin(arc), cos(arc));
  vec3 sun = normalize(vec3(-0.3, 0.8, 0.55));
  float lit = max(dot(n, sun), 0.0);
  float data = hash2(h.zw * 3.0).x;

  // Dark: lit cells glow. Light: lit cells go pale and the shadow turns violet.
  vec3 lo = mix(haze, mix(violet, glow, 0.25), light);
  vec3 mid = mix(violet, haze, light);
  vec3 hi = mix(glow, surface, light);
  vec3 cell = ramp3(lo, mid, hi, lit * mix(0.6, 1.0, data));
  cell = mix(cell, bright, step(0.95, data) * smoothstep(0.25, 0.6, lit) * 0.8);

  // How far q moves over one device pixel. Near the edge the cells get too small to draw, so they fade
  // into smooth shading.
  float step1 = max(0.7071 * length(vec2(length(dFdx(q)), length(dFdy(q)))), 1e-5);
  float dense = 1.0 - smoothstep(0.06, 0.18, step1);
  vec3 shade = ramp3(lo, mid, hi, max(dot(sphereNormal(d), sun), 0.0) * 0.8);
  vec3 gap = mix(bg, line, light * 0.7);
  float fill = clamp((0.5 - hexDist(h.xy) - 0.03) / step1 + 0.5, 0.0, 1.0);
  vec3 sphere = mix(shade, mix(gap, cell, fill), dense);

  float dc = length(px - center);
  vec3 c = mix(bg, sphere, disc(dc, radius, u_dpr));
  c = mix(c, line, hairline(dc - radius) * 0.7);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "line",
  "haze",
  "violet",
  "glow",
  "bright",
  "surface",
]

export function HexFisheye() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
