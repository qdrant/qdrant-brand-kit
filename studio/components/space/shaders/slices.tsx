"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Slices: a violet gradient (the ramp) rising to the top right in five steps, cut into 8px slices with a hairline gap
// under each. Every slice slips sideways by its own small amount, and a scan line running down the section
// shifts the slices it passes further and lifts them one step.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
out vec4 color;
${GLSL_NOISE}
${GLSL_BASE}
void main() {
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  const float BAND = 8.0;
  float row = floor(px.y / BAND);
  float y = (row + 0.5) * BAND;

  float scanY = res.y + 80.0 - mod(u_time * 34.0, res.y + 160.0);
  float dy = (y - scanY) / 26.0;
  float scan = exp(-dy * dy);
  float slip = (noise(vec2(row * 0.21, u_time * 0.1)) - 0.5) * 80.0 + scan * 48.0;
  float x = px.x + slip;

  // Fades to the background under the copy, measured before the slip so the fade holds still.
  float calm = smoothstep(0.3, 0.75, px.x / res.x);
  float g = clamp(((x / res.x - 0.3) + (y / res.y) * 0.5 - 0.05) * mix(0.2, 1.0, calm), 0.0, 0.999);
  float level = floor(g * 5.0);
  level += scan > 0.5 && level >= 1.0 ? 1.0 : 0.0;
  vec3 c = level < 1.0 ? u_c0 : level < 2.0 ? u_c1 : level < 3.0 ? u_c2 : level < 4.0 ? u_c3 : u_c4;

  // One device pixel of background at the bottom of every slice.
  float gap = step(fract(px.y / BAND) * BAND * u_dpr, 1.0);
  c = mix(c, u_c0, gap);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "ramp-0",
  "ramp-1",
  "ramp-2",
  "ramp-3",
  "ramp-4",
]

export function Slices() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
