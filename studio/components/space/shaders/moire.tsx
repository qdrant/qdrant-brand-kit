"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Moire: two sets of hairline rings 6px apart, one fixed and one whose center drifts slowly around it.
// Where their lines cross, the overlap brightens, and the crossings line up into wide moire fringes.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3;
out vec4 color;
${GLSL_BASE}
void main() {
  vec3 bg = u_c0, line = u_c1, glow = u_c2, bright = u_c3;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 c1 = vec2(res.x * 0.76, res.y * 0.5);
  vec2 c2 = c1 + vec2(cos(u_time * 0.11) * 34.0, sin(u_time * 0.15) * 22.0);
  const float GAP = 6.0;
  float r1 = length(px - c1);
  float r2 = length(px - c2);
  float a = 1.0 - clamp(abs(fract(r1 / GAP + 0.5) - 0.5) * GAP * u_dpr, 0.0, 1.0);
  float b = 1.0 - clamp(abs(fract(r2 / GAP + 0.5) - 0.5) * GAP * u_dpr, 0.0, 1.0);
  float reach = 1.0 - smoothstep(res.y * 0.2, res.y * 0.85, r1);
  float k = reach * mix(0.2, 1.0, copyRoom(px.x / res.x));

  vec3 c = mix(bg, line, a * k * 0.55);
  c = mix(c, glow, b * k * 0.55);
  c = mix(c, bright, a * b * k);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = ["bg", "line", "glow", "bright"]

export function Moire() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
