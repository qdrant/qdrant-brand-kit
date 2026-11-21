"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Flow lines: hairline streamlines of a curl-noise field flowing left to right. The field comes from a
// stream function (a steady flow plus two octaves of noise), and its streamlines are that function's
// iso-lines, so they cost no steps along the flow. Packets, a bright head with a fading tail, travel along
// some lines at their own speeds.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3;
out vec4 color;
${GLSL_NOISE}
${GLSL_BASE}
void main() {
  vec3 bg = u_c0, line = u_c1, glow = u_c2, bright = u_c3;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 uv = px / res.y;
  float t = u_time * 0.03;
  float psi = uv.y + 0.2 * noise(uv * 1.4 + vec2(-t, t * 0.6)) + 0.07 * noise(uv * 3.3 + vec2(t * 1.3, -t));
  float k = psi * 32.0;
  float lines = gridline(k);

  vec2 h = hash2(vec2(floor(k + 0.5), 9.0));
  float phase = fract(px.x / 160.0 - u_time * mix(0.06, 0.16, h.x) + h.y);
  float len = mix(0.12, 0.3, fract(h.y * 7.0));
  float packet = step(0.4, fract(h.x * 13.0)) * step(phase, len) * (phase / len);

  float above = mix(0.5, 1.0, px.y / res.y);
  float room = mix(0.2, 1.0, copyRoom(px.x / res.x));
  vec3 c = mix(bg, line, lines * 0.55 * above * room);
  c = mix(c, mix(glow, bright, packet), lines * packet * above * room);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = ["bg", "line", "glow", "bright"]

export function FlowLines() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
