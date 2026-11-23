"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_HEX } from "./glsl"

// Hex pixelation: warped noise sampled once per hexagon cell (14px apart) and quantized to the five ramp
// steps, lit from above and quieter under the copy, with a one-pixel gap between cells. The pointer raises
// the cells around it one step.
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
${GLSL_HEX}
void main() {
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  const float SIZE = 14.0;
  vec4 h = hexCell(px / SIZE);
  vec2 at = h.zw * SIZE;
  vec2 uv = at / res.y;
  float t = u_time * 0.03;
  float w = fbm(uv * 1.3 + vec2(t, -t * 0.4));
  float n = fbm(uv * 1.9 + vec2(w * 1.8, -w) + vec2(0.0, t));
  float above = smoothstep(-0.2, 1.0, at.y / res.y);
  float room = mix(0.35, 1.0, copyRoom(at.x / res.x));
  float v = clamp((n - 0.28) * 2.1 * (0.35 + 0.8 * above) * room, 0.0, 0.999);
  float level = floor(v * 5.0);
  if (u_pointer.x >= 0.0) level += 1.0 - step(48.0, length(at - u_pointer / u_dpr));
  level = min(level, 4.0);
  vec3 c = level < 1.0 ? u_c0 : level < 2.0 ? u_c1 : level < 3.0 ? u_c2 : level < 4.0 ? u_c3 : u_c4;

  // The edge distance in device pixels: the gap is the pixel nearest each edge.
  float edge = (0.5 - hexDist(h.xy)) * SIZE * u_dpr;
  c = mix(u_c0, c, clamp(edge, 0.0, 1.0));
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "ramp-0",
  "ramp-1",
  "ramp-2",
  "ramp-3",
  "ramp-4",
]

export function HexPixelation() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
