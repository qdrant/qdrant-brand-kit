"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_SPHERE } from "./glsl"

// Halftone sphere: a sphere drawn as dots on the 8px grid, each dot sized by the light, which circles the
// sphere slowly from high above. On light the dots are ink, so they grow in the shadow instead. A hairline
// marks the sphere's edge, over a sparse plane of dots.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5;
out vec4 color;
${GLSL_BASE}
${GLSL_SPHERE}
void main() {
  vec3 bg = u_c0, grid = u_c1, violet = u_c2, glow = u_c3, bright = u_c4, line = u_c5;
  float light = lightTheme(bg);
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 cell = floor(px / 8.0);
  vec2 at = (cell + 0.5) * 8.0;
  float d = length(px - at);

  vec2 center = vec2(res.x * 0.74, res.y * 0.5);
  float radius = res.y * 0.42;
  vec2 q = (at - center) / radius;
  float inside = step(dot(q, q), 1.0);
  float a = u_time * 0.15;
  vec3 sun = normalize(vec3(sin(a) * 0.8, 0.6, cos(a) * 0.8));
  float lit = max(dot(sphereNormal(q), sun), 0.0);
  float ink = mix(lit, 1.0 - lit, light);
  float sphereDot = inside * disc(d, mix(0.6, 3.4, sqrt(ink)), u_dpr);
  vec3 dotColor = mix(violet, mix(glow, bright, ink), smoothstep(0.05, 0.45, ink));

  // The plane behind: a dot on every other grid point, quieter under the copy.
  float even = (1.0 - mod(cell.x, 2.0)) * (1.0 - mod(cell.y, 2.0));
  float back = (1.0 - inside) * even * disc(d, 0.75, u_dpr) * mix(0.4, 1.0, copyRoom(px.x / res.x));
  float rim = hairline(length(px - center) - radius);

  vec3 c = mix(bg, grid, back);
  c = mix(c, line, rim * 0.6);
  c = mix(c, dotColor, sphereDot);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "grid",
  "violet",
  "glow",
  "bright",
  "line",
]

export function HalftoneSphere() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
