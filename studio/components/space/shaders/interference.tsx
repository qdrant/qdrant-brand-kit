"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Interference dots: a dot grid on the 8px grid whose dots are sized by the ripples of two point sources,
// each marked with a hairline ring. Where the waves cancel, lanes of tiny dots run between lanes that pulse.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
out vec4 color;
${GLSL_BASE}
void main() {
  vec3 bg = u_c0, line = u_c1, violet = u_c2, glow = u_c3, bright = u_c4;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 cell = floor(px / 8.0);
  vec2 at = (cell + 0.5) * 8.0;
  vec2 s1 = vec2(res.x * 0.62, res.y * 0.3) + 10.0 * vec2(sin(u_time * 0.13), cos(u_time * 0.11));
  vec2 s2 = vec2(res.x * 0.86, res.y * 0.72) + 10.0 * vec2(cos(u_time * 0.09), sin(u_time * 0.12));

  // Waves 40px long, weakening with distance.
  float k = 6.2831853 / 40.0;
  float w = u_time * 1.4;
  float d1 = length(at - s1);
  float d2 = length(at - s2);
  float a1 = sin(d1 * k - w) / sqrt(1.0 + d1 / 80.0);
  float a2 = sin(d2 * k - w) / sqrt(1.0 + d2 / 80.0);
  float amp = abs(a1 + a2) * 0.5;
  float room = mix(0.35, 1.0, copyRoom(at.x / res.x));
  float lift = amp * room;
  float dots = disc(length(px - at), mix(0.45, 3.2, lift), u_dpr);
  vec3 ink = mix(violet, mix(glow, bright, smoothstep(0.6, 1.0, amp)), smoothstep(0.1, 0.5, lift));

  float rings = min(abs(length(px - s1) - 7.0), abs(length(px - s2) - 7.0));
  vec3 c = mix(bg, ink, dots);
  c = mix(c, line, 1.0 - clamp(rings * u_dpr, 0.0, 1.0));
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = ["bg", "line", "violet", "glow", "bright"]

export function InterferenceDots() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
