"use client"

import { GLSL_NOISE, SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Moving dither: geometric light instead of noise. A lamp just above the top edge sways over the right side
// and casts a beam down into the section, over a soft light from above. The light is quantized to the five
// ramp steps with a 4 x 4 Bayer dither, in 3px cells rounded to whole device pixels.
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
  float size = max(1.0, floor(3.0 * u_dpr + 0.5));
  vec2 cell = floor(gl_FragCoord.xy / size);
  vec2 at = (cell + 0.5) * size / u_dpr;
  vec2 res = u_res / u_dpr;

  vec2 lamp = vec2(res.x * (0.72 + 0.1 * sin(u_time * 0.21)), res.y * 1.12);
  float aim = -1.5707963 + 0.22 * sin(u_time * 0.27 + 1.3);
  vec2 d = at - lamp;
  // Off the beam's axis, in radians. The lamp is above the frame, so this never wraps.
  float off = abs(atan(d.y, d.x) - aim);
  float beam = 0.8 * (1.0 - smoothstep(0.2, 0.3, off)) + 0.25 * (1.0 - smoothstep(0.3, 0.6, off));
  float fall = exp(-length(d) / (res.y * 1.2));
  float sky = 0.3 * smoothstep(0.1, 1.0, at.y / res.y);
  float room = mix(0.45, 1.0, copyRoom(at.x / res.x));

  float v = clamp((beam * fall * 1.05 + sky) * room, 0.0, 0.999) * 4.0;
  float level = floor(v) + (fract(v) > bayer4(cell) ? 1.0 : 0.0);
  vec3 c = level < 1.0 ? u_c0 : level < 2.0 ? u_c1 : level < 3.0 ? u_c2 : level < 4.0 ? u_c3 : u_c4;
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "ramp-0",
  "ramp-1",
  "ramp-2",
  "ramp-3",
  "ramp-4",
]

export function MovingDither() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
