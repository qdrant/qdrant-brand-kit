"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "./scene"

// Dither haze: violet depth haze from slow, warped noise, lit from above, quieter on the left under the
// copy, and quantized to five palette steps with a 4 x 4 Bayer dither in 3px cells. The pointer adds a
// little light.
const DITHER = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
out vec4 color;
${GLSL_NOISE}
void main() {
  float size = 3.0 * u_dpr;
  vec2 cell = floor(gl_FragCoord.xy / size);
  vec2 at = cell * size;
  vec2 uv = at / u_res.y;
  float t = u_time * 0.025;
  vec2 q = vec2(fbm(uv * 1.3 + vec2(t, 0.0)), fbm(uv * 1.3 + vec2(5.2, 1.3) - t));
  float n = fbm(uv * 1.7 + 1.8 * q + vec2(0.0, t * 1.5));
  float above = smoothstep(-0.1, 1.0, at.y / u_res.y);
  // Quieter on the left, where a section's copy sits.
  float room = mix(0.6, 1.0, smoothstep(0.05, 0.6, at.x / u_res.x));
  float v = n * (0.2 + 1.05 * above) * room;
  if (u_pointer.x >= 0.0) {
    float d = length((at - u_pointer) / u_res.y);
    v += 0.22 * exp(-d * d * 14.0);
  }
  v = clamp(v * 1.35 - 0.2, 0.0, 0.999) * 4.0;
  float step = floor(v) + (fract(v) > bayer4(cell) ? 1.0 : 0.0);
  vec3 c = step < 1.0 ? u_c0 : step < 2.0 ? u_c1 : step < 3.0 ? u_c2 : step < 4.0 ? u_c3 : u_c4;
  color = vec4(c, 1.0);
}`

const RAMP: readonly PaletteKey[] = ["ramp-0", "ramp-1", "ramp-2", "ramp-3", "ramp-4"]

export function DitherHaze() {
  return <SceneShader fragment={DITHER} colors={RAMP} />
}

// Contour field: the iso-lines of a slowly drifting density, like a map of an embedding space. Every
// fifth line is stronger; peaks turn violet. The pointer is a query: it raises the field and lights the
// lines around it in the accent.
const CONTOURS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
out vec4 color;
${GLSL_NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res.y;
  float t = u_time * 0.018;
  float h = fbm(uv * 1.6 + vec2(t, -t * 0.6));
  float near = 0.0;
  if (u_pointer.x >= 0.0) {
    float d = length((gl_FragCoord.xy - u_pointer) / u_res.y);
    near = exp(-d * d * 22.0);
    h += 0.18 * near;
  }
  float x = h * 22.0;
  float w = fwidth(x);
  float line = 1.0 - smoothstep(0.0, w * 1.1, abs(fract(x - 0.5) - 0.5));
  float major = mod(floor(x + 0.5), 5.0) == 0.0 ? 1.0 : 0.45;
  float above = smoothstep(-0.2, 1.0, gl_FragCoord.y / u_res.y);
  vec3 ink = mix(u_c1, u_c2, smoothstep(0.5, 0.75, h));
  ink = mix(ink, u_c3, near * 0.9);
  color = vec4(mix(u_c0, ink, line * major * (0.45 + 0.55 * above)), 1.0);
}`

const CONTOUR_COLORS: readonly PaletteKey[] = ["bg", "line", "glow", "accent"]

export function ContourField() {
  return <SceneShader fragment={CONTOURS} colors={CONTOUR_COLORS} />
}
