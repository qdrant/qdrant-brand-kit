"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Hillshade: a slowly drifting terrain filled in eight elevation bands (the ramp), shaded by a light from
// above and a little to the left, with a hairline contour at every band. The slope comes from two extra
// samples 1.5px away, so it costs three fbm calls. The terrain is lower and flatter under the copy.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6, u_c7, u_c8;
out vec4 color;
${GLSL_NOISE}
${GLSL_BASE}
void main() {
  vec3 r0 = u_c0, r1 = u_c1, r2 = u_c2, r3 = u_c3, r4 = u_c4;
  vec3 line = u_c5, bright = u_c6, surface = u_c7, glow = u_c8;
  float light = lightTheme(r0);
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  // Quiet under the copy: the terrain flattens and fades toward the background there.
  float room = smoothstep(0.3, 0.72, px.x / res.x);

  vec2 p = px / res.y * 1.6 + vec2(u_time * 0.012, u_time * 0.005);
  float e = 1.5 / res.y * 1.6;
  float h = fbm(p);
  float hx = fbm(p + vec2(e, 0.0));
  float hy = fbm(p + vec2(0.0, e));
  // About 210px of relief: the slope over the 1.5px step, times 140.
  vec3 n = normalize(vec3((h - hx) * 140.0, (h - hy) * 140.0, 1.0));
  vec3 sun = normalize(vec3(-0.4, 0.75, 0.55));
  float shade = clamp((dot(n, sun) - sun.z) * 1.6, -1.0, 1.0);

  float elevation = (h - 0.28) * 2.3 * mix(0.45, 1.0, room);
  float band = floor(clamp(elevation, 0.0, 0.999) * 8.0) / 7.0;
  vec3 fill = ramp5(r0, r1, r2, r3, r4, band);
  // Dark: lit slopes go violet, shadow goes black. Light: lit slopes go white, shadow goes violet.
  vec3 hi = mix(bright, surface, light);
  vec3 lo = mix(r0, glow, light);
  float k = mix(0.4, 0.28, light) * mix(0.15, 1.0, room);
  vec3 c = shade > 0.0 ? mix(fill, hi, shade * k) : mix(fill, lo, -shade * k * 1.3);
  float banded = step(-0.02, elevation) * step(elevation, 1.02);
  c = mix(c, line, gridline(elevation * 8.0) * banded * mix(0.1, 0.75, room));
  c = mix(c, r0, (1.0 - room) * 0.6);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "ramp-0",
  "ramp-1",
  "ramp-2",
  "ramp-3",
  "ramp-4",
  "line",
  "bright",
  "surface",
  "glow",
]

export function Hillshade() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
