"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Parallax stars: three layers of stars, each on its own grid (at most one star per cell, on the cell's 8px
// grid), drifting left at different speeds and twinkling. The brightest stars of the near layer carry a
// small hairline ring, like indexed points.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
out vec4 color;
${GLSL_BASE}
// One layer: x is the star's coverage, y its brightness (twinkling), z its ring.
vec3 starLayer(vec2 p, float size, float odds, float seed, float rmax, float rings) {
  vec2 cell = floor(p / size);
  vec2 h = hash2(cell + seed);
  vec2 g = hash2(cell + seed + 31.0);
  vec2 k = hash2(cell + seed + 67.0);
  vec2 at = cell * size + (floor(g * (size / 8.0 - 1.0)) + 1.0) * 8.0;
  float d = length(p - at);
  float twinkle = 0.65 + 0.35 * sin(u_time * (0.8 + 1.6 * k.y) + 6.2831853 * k.x);
  float r = mix(0.5, rmax, h.y);
  float ring = step(1.0 - rings, h.y) * (1.0 - clamp(abs(d - 5.0) * u_dpr, 0.0, 1.0));
  return step(h.x, odds) * vec3(disc(d, r, u_dpr), h.y * twinkle, ring);
}

void main() {
  vec3 bg = u_c0, haze = u_c1, dim = u_c2, star = u_c3, glow = u_c4;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  float t = u_time;
  vec3 farLayer = starLayer(px + vec2(t * 2.0, t * 0.3), 24.0, 0.3, 1.0, 0.8, 0.0);
  vec3 midLayer = starLayer(px + vec2(t * 5.0, t * 0.75), 40.0, 0.3, 11.0, 1.1, 0.0);
  vec3 nearLayer = starLayer(px + vec2(t * 10.0, t * 1.5), 72.0, 0.4, 23.0, 1.6, 0.15);
  float room = mix(0.3, 1.0, copyRoom(px.x / res.x));

  // A little haze from above.
  vec3 c = mix(bg, haze, 0.7 * smoothstep(0.35, 1.2, px.y / res.y));
  c = mix(c, dim, farLayer.x * farLayer.y * room);
  c = mix(c, mix(dim, star, 0.5), midLayer.x * midLayer.y * room);
  c = mix(c, star, nearLayer.x * mix(0.4, 1.0, nearLayer.y) * room);
  c = mix(c, glow, nearLayer.z * room * 0.8);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = ["bg", "haze", "dim", "star", "glow"]

export function ParallaxStars() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
