// Color-Dithered-Pattern (recipe)
// Mesh-Dithered's look without a library image: the mesh is built from one color
// family's dark steps (for example indigo 975, 950, 900, 800, 700), laid out by
// settings.meshLayout, then dithered exactly like Mesh-Dithered-Pattern-A (Bayer 16).
// Approved by Vanesa in the Pattern Library review, 2026-11-24 (exploration E25).

import { render as renderDithered } from "./mesh-dithered-pattern.js";
import { makeFrame } from "./effects.js";

// Where the light sits, 0 (darkest step) to 1 (lightest step), for a grid point (u, v) in 0..1.
export const MESH_LAYOUTS = {
  diagonal: (u, v) => (u + v) / 2, // light toward the bottom right (E25)
  "diagonal-up": (u, v) => (u + 1 - v) / 2, // light toward the top right (E26)
  "vertical": (u, v) => v, // Vertical, light at the bottom (E27)
};

// color = { from, to } token references from the colorway; the family is read from them
// (color.indigo.975 -> indigo). frame = makeFrame(width, height).
// options.variant picks one of settings.variants: another approved mesh layout.
export function render(canvas, tokens, preset, color, frame = makeFrame(), options = {}) {
  const family = color.from.split(".")[1];
  const variant = options.variant == null ? null : preset.settings.variants?.[options.variant];
  if (options.variant != null && !variant) throw new Error(`${preset.name} has no approved variant #${options.variant}`);
  const { steps, size } = preset.settings.meshLayout;
  const kind = variant?.layout ?? preset.settings.meshLayout.kind;
  const layout = MESH_LAYOUTS[kind];
  if (!layout) throw new Error(`${preset.name}: unknown mesh layout "${kind}"`);
  const n = size ?? 11;
  const colors = Array.from({ length: n * n }, (_, i) => {
    const u = (i % n) / (n - 1);
    const v = Math.floor(i / n) / (n - 1);
    const t = Math.max(0, Math.min(1, layout(u, v)));
    return `{color.${family}.${steps[Math.round(t * (steps.length - 1))]}}`;
  });
  const settings = {
    ...preset.settings,
    grade: { ...preset.settings.grade, anchors: [`{color.${family}.600}`] },
    // The brand check allows the whole family: the dither moves lightness up and down its steps.
    mesh: { ...preset.settings.mesh, palette: [family] },
  };
  return renderDithered(canvas, tokens, { ...preset, settings }, { size: n, colors }, frame);
}
