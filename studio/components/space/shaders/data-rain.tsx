"use client"

import { SceneShader, type PaletteKey } from "../scene"
import { GLSL_BASE } from "./glsl"

// Data columns: a dot matrix on the 8px grid with packets falling down its columns, each column at its own
// speed and a whole row at a time. A packet is a run of 2 to 6 dots, brightest at its leading dot. One
// column, right of the copy, runs in the accent.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_dpr;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_c5;
out vec4 color;
${GLSL_BASE}
void main() {
  vec3 bg = u_c0, grid = u_c1, violet = u_c2, glow = u_c3, bright = u_c4, accent = u_c5;
  vec2 px = gl_FragCoord.xy / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 cell = floor(px / 8.0);
  vec2 at = (cell + 0.5) * 8.0;
  float d = length(px - at);
  float isAccent = 1.0 - step(0.5, abs(cell.x - floor(res.x * 0.8 / 8.0)));

  // Rows per second for this column, and how far it has fallen, in whole rows.
  vec2 hc = hash2(vec2(cell.x, 17.0));
  float speed = mix(2.0, 9.0, hc.x);
  float s = cell.y + floor(u_time * speed + hc.y * 500.0);
  // Stretches of 14 rows, some holding a packet at their bottom.
  float seg = floor((s + 0.5) / 14.0);
  float pos = s - seg * 14.0;
  vec2 hs = hash2(vec2(cell.x * 1.3 + 4.0, seg));
  float len = floor(mix(2.0, 7.0, hs.x));
  float busy = max(step(0.25, hash2(vec2(cell.x, 3.0)).y), isAccent);
  float on = busy * step(hs.y, 0.55) * (1.0 - step(len, pos));
  float lead = 1.0 - pos / len;

  float above = mix(0.5, 1.0, at.y / res.y);
  float room = mix(0.2, 1.0, copyRoom(at.x / res.x));
  vec3 ink = mix(violet, mix(glow, bright, lead), smoothstep(0.0, 0.6, lead));
  ink = mix(ink, accent, isAccent);
  float packet = on * disc(d, mix(1.1, 2.3, lead), u_dpr) * mix(0.45, 1.0, lead) * above * mix(room, 1.0, isAccent);

  vec3 c = mix(bg, grid, disc(d, 0.7, u_dpr));
  c = mix(c, ink, packet);
  color = vec4(c, 1.0);
}`

const COLORS: readonly PaletteKey[] = [
  "bg",
  "grid",
  "violet",
  "glow",
  "bright",
  "accent",
]

export function DataColumns() {
  return <SceneShader fragment={FRAGMENT} colors={COLORS} />
}
