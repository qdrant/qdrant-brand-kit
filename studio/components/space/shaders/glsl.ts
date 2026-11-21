// GLSL helpers for the shaders in this folder. Each string goes into a fragment shader after its uniforms,
// and after GLSL_NOISE from ../scene when the shader uses it. GLSL_BASE comes first: the others need it.

// Hashes, lines and dots one device pixel wide, color ramps, the room left for a section's copy, and the
// theme.
export const GLSL_BASE = `
// Two random numbers (0 to 1) for a point, without sin.
vec2 hash2(vec2 p) {
  vec3 p3 = fract(p.xyx * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
// A line one device pixel wide where d crosses 0. d must be signed and smooth there: a distance that folds
// at 0 (like a cell's edge distance) breaks the screen derivatives, so those lines are measured by hand.
float hairline(float d) {
  return 1.0 - clamp(abs(d) / max(length(vec2(dFdx(d), dFdy(d))), 1e-5), 0.0, 1.0);
}
// A line one device pixel wide at every whole number of x.
float gridline(float x) {
  float w = max(length(vec2(dFdx(x), dFdy(x))), 1e-5);
  return 1.0 - clamp(abs(fract(x + 0.5) - 0.5) / w, 0.0, 1.0);
}
// 1 where d > 0 and 0 where d < 0, antialiased over one device pixel.
float coverage(float d) {
  return clamp(d / max(length(vec2(dFdx(d), dFdy(d))), 1e-5) + 0.5, 0.0, 1.0);
}
// A dot of radius r at distance d, both in CSS pixels, antialiased over one device pixel.
float disc(float d, float r, float dpr) {
  return clamp((r - d) * dpr + 0.5, 0.0, 1.0);
}
// 0 at the left edge to 1 past a section's copy, which sits over the left 40%. x is 0 to 1.
float copyRoom(float x) {
  return smoothstep(0.08, 0.62, x);
}
// 1 on the light theme and 0 on dark, from the background's luminance. Forms shaded by a light (spheres,
// prisms, terrain) use it: on dark, lit means brighter; on light, lit means paler and shadow more violet.
float lightTheme(vec3 bg) {
  return step(0.5, dot(bg, vec3(0.2126, 0.7152, 0.0722)));
}
// Three or five palette colors as one ramp, t from 0 to 1.
vec3 ramp3(vec3 a, vec3 b, vec3 c, float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, t * 2.0 - 1.0);
}
vec3 ramp5(vec3 a, vec3 b, vec3 c, vec3 d, vec3 e, float t) {
  t = clamp(t, 0.0, 1.0) * 4.0;
  return t < 1.0 ? mix(a, b, t) : t < 2.0 ? mix(b, c, t - 1.0) : t < 3.0 ? mix(c, d, t - 2.0) : mix(d, e, t - 3.0);
}
`

// A sphere seen head on: the normal at p, given relative to the center in radii. Outside it, z is 0.
export const GLSL_SPHERE = `
vec3 sphereNormal(vec2 p) {
  return vec3(p, sqrt(max(1.0 - dot(p, p), 0.0)));
}
`

// A lattice of pointy-top hexagons, the brandmark's parts, with centers 1 unit apart (the inradius is 0.5).
export const GLSL_HEX = `
const vec2 HEX_S = vec2(1.0, 1.7320508);
// The point relative to its cell's center (xy), and that center (zw), which is the same for every pixel
// of the cell, so it can be hashed.
vec4 hexCell(vec2 p) {
  vec2 a = (floor(p / HEX_S) + 0.5) * HEX_S;
  vec2 b = (floor((p - 0.5 * HEX_S) / HEX_S) + 0.5) * HEX_S + 0.5 * HEX_S;
  vec2 da = p - a;
  vec2 db = p - b;
  return dot(da, da) < dot(db, db) ? vec4(da, a) : vec4(db, b);
}
// Distance from a cell's center in the hexagon's own measure: 0.5 on its edges.
float hexDist(vec2 p) {
  p = abs(p);
  return max(p.x, dot(p, vec2(0.5, 0.8660254)));
}
// How many rings out from the origin's cell the cell centered at c is.
float hexRing(vec2 c) {
  float q = c.x - c.y * 0.5773503;
  float r = c.y * 1.1547005;
  return floor((abs(q) + abs(r) + abs(q + r)) * 0.5 + 0.5);
}
`

// Cellular noise: one point per unit cell, wandering around the cell's center with time.
export const GLSL_CELLS = `
vec2 cellPoint(vec2 id, float t) {
  return id + 0.5 + 0.4 * sin(t + 6.2831853 * hash2(id));
}
// The distance to the nearest point (x), the distance to the edge between it and the second nearest (y,
// measured to the bisector of the two, so its slope is 1), and the nearest point's cell (zw).
vec4 cells(vec2 p, float t) {
  vec2 i = floor(p);
  float f1 = 9.0;
  float f2 = 9.0;
  vec2 a = p;
  vec2 b = p;
  vec2 id = i;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = i + vec2(float(x), float(y));
      vec2 o = cellPoint(g, t);
      float d = length(o - p);
      if (d < f1) {
        f2 = f1;
        b = a;
        f1 = d;
        a = o;
        id = g;
      } else if (d < f2) {
        f2 = d;
        b = o;
      }
    }
  }
  float edge = (f2 * f2 - f1 * f1) / (2.0 * max(length(b - a), 1e-4));
  return vec4(f1, edge, id);
}
`

// Stars as data: at most one in each cell of size CSS pixels, on an 8px grid point inside the cell, there
// with probability odds. Returns the star's coverage (x) and its brightness (y, 0 to 1) at px.
export const GLSL_STARS = `
vec2 gridStars(vec2 px, float size, float odds, float seed, float dpr) {
  vec2 cell = floor(px / size);
  vec2 h = hash2(cell + seed);
  vec2 g = hash2(cell + seed + 41.0);
  vec2 at = cell * size + (floor(g * (size / 8.0 - 1.0)) + 1.0) * 8.0;
  float r = mix(0.55, 1.25, h.y);
  return vec2(step(h.x, odds) * disc(length(px - at), r, dpr), h.y);
}
`
