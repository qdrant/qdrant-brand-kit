import { readFileSync } from "node:fs"
import path from "node:path"

import type { Primitives } from "@/lib/color"

// The color primitives (--qd-color-<family>-<step>) read from primitives/colors/colors.css, so the Color page
// always shows what the CSS gives. Server only.
export function readPrimitives(): Primitives {
  const css = readFileSync(path.resolve(process.cwd(), "..", "primitives", "colors", "colors.css"), "utf8")
  const out: Primitives = {}
  for (const [, name, hex] of css.matchAll(/--qd-color-([a-z]+-\d+):\s*(#[0-9A-Fa-f]{6});/g)) {
    out[name] = hex.toUpperCase()
  }
  return out
}

// The repo's roles (background-default, text-primary…) with the primitive each one aliases, by theme, from the
// comments the build writes next to them in colors.css. Light falls back to dark where the light block doesn't
// change a role.
export function readRoles(): Record<string, { light: string; dark: string }> {
  const css = readFileSync(path.resolve(process.cwd(), "..", "primitives", "colors", "colors.css"), "utf8")
  const [dark, light = ""] = css.split('[data-theme="light"] {')
  const aliases = (block: string) =>
    Object.fromEntries(
      [...block.matchAll(/--qd-color-([a-z0-9-]+):\s*#[0-9A-Fa-f]{6};\s*\/\*\s*([a-z]+-\d+)\s*\*\//g)].map(
        ([, role, alias]) => [role, alias]
      )
    )
  const d = aliases(dark)
  const l = aliases(light)
  return Object.fromEntries(Object.entries(d).map(([role, alias]) => [role, { dark: alias, light: l[role] ?? alias }]))
}

// The ramps, in the CSS's order: family to its steps.
export function primitiveRamps(primitives: Primitives) {
  const ramps = new Map<string, { step: string; hex: string }[]>()
  for (const [name, hex] of Object.entries(primitives)) {
    const [family, step] = name.split("-")
    if (family === "dataviz") continue
    ramps.set(family, [...(ramps.get(family) ?? []), { step, hex }])
  }
  return [...ramps].map(([family, steps]) => ({
    family,
    steps: steps.sort((a, b) => Number(a.step) - Number(b.step)),
  }))
}
