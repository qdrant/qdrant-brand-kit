// The studio's live controls, as CSS variable overrides. Nothing here changes the design system:
// the overrides live in a <style> tag while you try values, and "Copy CSS" gives you the ones to keep.

export type Controls = {
  accent: string
  radius: string
  headingWidth: number
  glow: number
}

export const defaults: Controls = { accent: "amaranth", radius: "sm", headingWidth: 100, glow: 0 }

// Palette families that can carry the brand action color. White text needs 600 or darker on most,
// 700 or darker on these (Figma contrast rules, primitives/colors/README.md).
export const accents = ["amaranth", "indigo", "blue", "purple", "pink", "red", "teal", "green", "cyan", "orange"]
const needs700 = new Set(["orange", "green", "teal", "cyan"])

// Figma radius names, smallest to largest (primitives/radius).
export const radii = ["none", "xs", "sm", "md", "lg", "xl"]

function accentVars(family: string): Record<string, string> {
  const base = needs700.has(family) ? 700 : 600
  const c = (step: number) => `var(--qd-color-${family}-${step})`
  return {
    "--primary": c(base),
    "--ring": c(base),
    "--sidebar-primary": c(base),
    "--sidebar-ring": c(base),
    "--qd-ui-button-fill": `linear-gradient(to bottom, ${c(base)}, ${c(base + 100)})`,
    "--qd-ui-button-fill-hover": `linear-gradient(to bottom, ${c(base)}, ${c(base)})`,
    "--qd-ui-button-fill-disabled": `linear-gradient(to bottom, ${c(base - 200)}, ${c(base - 200)})`,
    "--qd-ui-button-highlight": c(base - 100),
    "--qd-ui-button-highlight-hover": c(base - 200),
    "--qd-ui-button-focus-ring": `color-mix(in srgb, ${c(base)} 40%, transparent)`,
  }
}

// shadcn's radius sizes around one base, the way styles/globals.css maps them for the default ("sm").
function radiusVars(base: string): Record<string, string> {
  const i = radii.indexOf(base)
  const at = (offset: number) => `var(--qd-radius-${radii[Math.min(Math.max(i + offset, 0), radii.length - 1)]})`
  return {
    "--radius-xs": at(-1),
    "--radius-sm": at(-1),
    "--radius-md": at(0),
    "--radius-lg": at(0),
    "--radius-xl": at(0),
    "--radius-2xl": at(1),
    "--radius-3xl": at(1),
    "--radius-4xl": at(2),
  }
}

// Only what differs from the design system's defaults.
export function overrideVars(controls: Controls): Record<string, string> {
  return {
    ...(controls.accent !== defaults.accent ? accentVars(controls.accent) : {}),
    ...(controls.radius !== defaults.radius ? radiusVars(controls.radius) : {}),
    ...(controls.headingWidth !== defaults.headingWidth ? { "--studio-heading-stretch": `${controls.headingWidth}%` } : {}),
    ...(controls.glow !== defaults.glow ? { "--studio-glow": String(controls.glow / 100) } : {}),
  }
}

// The CSS for the <style> tag, and for "Copy CSS". On :root and every [data-theme] section, so it reaches
// the light and dark sections too.
export function overrideCss(controls: Controls): string {
  const vars = Object.entries(overrideVars(controls))
  if (!vars.length) return ""
  return [":root,", "[data-theme] {", ...vars.map(([k, v]) => `  ${k}: ${v};`), "}"].join("\n")
}
