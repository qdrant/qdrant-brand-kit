"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_HEX } from "./glsl"

// Hex prisms: a floor of hexagon tiles raised into prisms by slow noise, seen from the front and above
// (2.5D, no raymarching). Each pixel checks the six rows of cells it can see and keeps the hit nearest the
// eye. Tops are lit from above, the left walls less, the right walls least; the copy side fades.
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
${GLSL_HEX}
// CSS px between cell centers, how much of the floor's depth and of a prism's height shows on screen,
// and the tallest prism, in cells.
const float UNIT = 40.0;
const float DEPTH = 0.62;
const float LIFT = 0.9;
const float TALLEST = 1.6;

float heightAt(vec2 c) {
  vec2 drift = vec2(u_time * 0.04, u_time * 0.025);
  float n = 0.65 * noise(c * 0.3 + drift) + 0.35 * noise(c * 0.8 - drift);
  return 0.08 + (TALLEST - 0.08) * smoothstep(0.28, 0.78, n);
}

void main() {
  vec3 bg = u_c0, line = u_c1, haze = u_c2, violet = u_c3, glow = u_c4, bright = u_c5, surface = u_c6;
  float light = lightTheme(bg);
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 s = px / UNIT;

  // A floor point (x, z) at height h lands on screen at (x, z * DEPTH + h * LIFT). Along this pixel's
  // line of sight, higher points are nearer the eye, so the highest hit wins.
  float zFloor = s.y / DEPTH;
  float zTop = (s.y - LIFT * TALLEST) / DEPTH;
  float m0 = floor((zTop - 0.58) / 0.8660254);
  float best = -1.0;
  float face = 0.0;
  float edge = 1.0;
  float tall = 0.0;
  for (int k = 0; k < 6; k++) {
    // Row m of the lattice, and the cell in it under this pixel's x.
    float m = m0 + float(k);
    float o = mod(m, 2.0) * 0.5;
    float cx = floor(s.x - o + 0.5) + o;
    float dx = s.x - cx;
    float cz = m * 0.8660254;
    // The cell's depth range at this x.
    float zr = (0.5 - 0.5 * abs(dx)) / 0.8660254;
    float hc = heightAt(vec2(cx, cz));
    float zt = (s.y - LIFT * hc) / DEPTH;
    if (zt >= cz - zr && zt <= cz + zr) {
      // The top face.
      if (hc > best) {
        best = hc;
        face = 0.0;
        edge = 0.5 - hexDist(vec2(dx, zt - cz));
        tall = hc;
      }
    } else if (zt < cz - zr && zFloor >= cz - zr) {
      // A front wall: left of the front corner or right of it.
      float hs = (s.y - DEPTH * (cz - zr)) / LIFT;
      if (hs > best) {
        best = hs;
        face = dx < 0.0 ? 1.0 : 2.0;
        edge = abs(dx);
        tall = hc;
      }
    }
  }

  // Dark: lit faces glow. Light: lit faces go pale and the walls turn violet.
  float hn = tall / TALLEST;
  float tone = face < 0.5 ? 0.62 + 0.38 * hn : (face < 1.5 ? 0.4 : 0.18);
  vec3 lo = mix(mix(bg, haze, 0.7), mix(violet, glow, 0.3), light);
  vec3 mid = mix(violet, haze, light);
  // On dark, the lit tops stop short of the full glow, so the field reads as depth.
  vec3 hi = mix(mix(violet, glow, 0.6), surface, light);
  vec3 c = ramp3(lo, mid, hi, tone);

  // Hairlines on the tops' edges and the walls' front corners.
  float top = 1.0 - step(0.5, face);
  float topEdge = top * (1.0 - clamp(edge * UNIT * u_dpr / 1.4, 0.0, 1.0));
  float wallEdge = (1.0 - top) * (1.0 - clamp(edge * UNIT * u_dpr, 0.0, 1.0));
  // Quiet under the copy: from about 30% of the width the prisms rise out of the background.
  float calm = smoothstep(0.3, 0.72, px.x / res.x);
  vec3 ink = mix(bright, line, light);
  c = mix(c, ink, topEdge * mix(0.2, 0.5, hn) * calm);
  c = mix(c, ink, wallEdge * 0.25 * calm);

  c = mix(c, bg, (1.0 - calm) * 0.85);
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

export function HexPrisms() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
