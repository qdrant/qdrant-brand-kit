"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_STARS } from "./glsl"

// Aurora: two curtains of violet light hanging from above, each with a bright lower edge that folds slowly
// and rays fading upward, striated into 2px columns of whole device pixels. Stars on the 8px grid show
// where the curtains are thin. The copy side stays almost clear.
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
${GLSL_STARS}
void main() {
  vec3 bg = u_c0, violet = u_c1, plum = u_c2, glow = u_c3, bright = u_c4, star = u_c5, dim = u_c6;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  float x = px.x / res.y;
  float y = px.y / res.y;
  float t = u_time * 0.04;

  float colW = max(1.0, floor(2.0 * u_dpr + 0.5));
  float col = floor(gl_FragCoord.x / colW);
  float striae = 0.55 + 0.45 * noise(vec2(col * 0.31, u_time * 0.2));
  float rays = 0.6 + 0.4 * noise(vec2(x * 9.0, t * 4.0));

  // The lower edges, in section heights from the bottom.
  float e1 = 0.36 + 0.24 * (noise(vec2(x * 1.8 + t, 3.0)) - 0.5) + 0.04 * sin(x * 7.0 + t * 9.0);
  float e2 = 0.58 + 0.2 * (noise(vec2(x * 1.3 - t, 8.0)) - 0.5);
  float dy1 = y - e1;
  float dy2 = y - e2;
  float room = mix(0.15, 1.0, copyRoom(px.x / res.x));
  float a1 = smoothstep(-0.012, 0.0, dy1) * exp(-max(dy1, 0.0) * 3.0) * rays * striae * room;
  float a2 = smoothstep(-0.02, 0.0, dy2) * exp(-max(dy2, 0.0) * 2.2) * 0.6 * striae * room;

  vec2 s = gridStars(px, 32.0, 0.16, 4.0, u_dpr);
  float clear = 1.0 - clamp((a1 + a2) * 2.0, 0.0, 1.0);
  vec3 c = mix(bg, mix(dim, star, s.y), s.x * clear * mix(0.4, 1.0, room));
  c = mix(c, plum, clamp(a2 * 1.2, 0.0, 1.0));
  c = mix(c, violet, clamp(a1 * 1.5, 0.0, 1.0));
  c = mix(c, glow, clamp(a1 * a1 * 1.4, 0.0, 0.85));
  c = mix(c, bright, smoothstep(0.75, 1.0, a1) * 0.5);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "violet",
  "plum",
  "glow",
  "bright",
  "star",
  "dim",
]

export function Aurora() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
