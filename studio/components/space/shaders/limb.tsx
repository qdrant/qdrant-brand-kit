"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE, GLSL_STARS } from "./glsl"

// Planet limb: the edge of a large planet rising across the lower part of the section toward the right,
// marked by a hairline. Its atmosphere scatters violet light in a thin bright layer and a wider soft one,
// strongest where the limb faces the light above, which drifts slowly. The planet is lit just under the
// limb; stars on the 8px grid fill the sky above the haze.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5, u_c6, u_c7;
out vec4 color;
${GLSL_BASE}
${GLSL_STARS}
void main() {
  vec3 bg = u_c0, surface = u_c1, haze = u_c2, violet = u_c3, glow = u_c4, bright = u_c5, star = u_c6, dim = u_c7;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  float radius = res.y * 2.8;
  vec2 center = vec2(res.x * 0.86, res.y * 0.56 - radius);
  vec2 rel = px - center;
  // CSS px above the surface; negative on the planet.
  float alt = length(rel) - radius;
  vec2 up = rel / max(length(rel), 1.0);
  vec2 sunDir = normalize(vec2(0.35 * sin(u_time * 0.05) - 0.1, 1.0));
  float facing = 0.35 + 0.65 * smoothstep(0.85, 1.0, dot(up, sunDir));
  float room = mix(0.4, 1.0, copyRoom(px.x / res.x));

  // The sky: two layers of scattered light over the limb, then stars.
  float a = max(alt, 0.0);
  float atm = (exp(-a / 7.0) * 0.8 + exp(-a / 40.0) * 0.45) * facing * room;
  vec3 air = mix(bg, haze, clamp(atm * 1.3, 0.0, 1.0));
  air = mix(air, violet, clamp(atm * 1.1 - 0.15, 0.0, 1.0));
  air = mix(air, glow, clamp(exp(-a / 5.0) * facing * room * 0.7, 0.0, 1.0));
  vec2 s = gridStars(px, 32.0, 0.18, 2.0, u_dpr);
  air = mix(air, mix(dim, star, s.y), s.x * smoothstep(30.0, 140.0, a) * mix(0.4, 1.0, room));

  // The planet: lit just under the limb, plain deeper in.
  float depth = max(-alt, 0.0);
  vec3 planet = mix(surface, violet, exp(-depth / 10.0) * facing * room * 0.8);
  planet = mix(planet, glow, exp(-depth / 2.5) * facing * room * 0.6);

  vec3 c = mix(air, planet, clamp(-alt * u_dpr + 0.5, 0.0, 1.0));
  c = mix(c, bright, (1.0 - clamp(abs(alt) * u_dpr, 0.0, 1.0)) * facing * room);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "surface",
  "haze",
  "violet",
  "glow",
  "bright",
  "star",
  "dim",
]

export function PlanetLimb() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
