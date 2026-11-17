// The machinery behind the right panel: each control is declared once (its CSS variables, its default,
// its range), and from that we build DialKit's config and the CSS overrides. The controls themselves
// are in lib/overrides.ts.

import type { DialConfig } from "dialkit"

// Where an override goes. Most are global; depth is per theme, like primitives/colors/colors.css.
export type Scope = "global" | "dark" | "light"

type Common = { scope?: Scope }

// A number with a unit, written to one or more CSS variables (or computed by `css`).
export type SliderControl = Common & {
  kind: "slider"
  value: number
  min: number
  max: number
  step: number
  unit?: string
  vars?: string[]
  css?: (value: number) => Record<string, string>
}

export type SelectControl = Common & {
  kind: "select"
  value: string
  options: (string | { value: string; label: string })[]
  vars?: string[]
  css?: (value: string) => Record<string, string>
}

export type ToggleControl = Common & {
  kind: "toggle"
  value: boolean
  css: (value: boolean) => Record<string, string>
}

export type Control = SliderControl | SelectControl | ToggleControl
export type Group = { _collapsed?: boolean; [key: string]: Control | Group | boolean | undefined }

export const slider = (
  vars: string | string[],
  value: number,
  min: number,
  max: number,
  step: number,
  unit = "px",
  extra: Partial<SliderControl> = {}
): SliderControl => ({ kind: "slider", vars: [vars].flat(), value, min, max, step, unit, ...extra })

export const select = (
  vars: string | string[],
  value: string,
  options: SelectControl["options"],
  extra: Partial<SelectControl> = {}
): SelectControl => ({ kind: "select", vars: [vars].flat(), value, options, ...extra })

// A toggle writes one set of variables when it's on and another when it's off (only away from its default).
export const toggle = (
  value: boolean,
  whenOn: Record<string, string>,
  whenOff: Record<string, string> = {},
  extra: Partial<ToggleControl> = {}
): ToggleControl => ({
  kind: "toggle",
  value,
  css: (on) => (on ? whenOn : whenOff),
  ...extra,
})

function isControl(x: unknown): x is Control {
  return typeof x === "object" && x !== null && "kind" in x
}

// DialKit's config: sliders as [default, min, max, step], selects as select configs, toggles as booleans,
// groups as folders.
export function toDialConfig(group: Group): DialConfig {
  const config: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(group)) {
    if (key === "_collapsed") {
      if (item) config._collapsed = true
    } else if (isControl(item)) {
      if (item.kind === "slider") config[key] = [item.value, item.min, item.max, item.step]
      else if (item.kind === "select") config[key] = { type: "select", options: item.options, default: item.value }
      else config[key] = item.value
    } else if (item && typeof item === "object") {
      config[key] = toDialConfig(item as Group)
    }
  }
  return config as DialConfig
}

// Sliders step in decimals, so compare and print them rounded.
const round = (n: number) => Math.round(n * 10000) / 10000
function isDefault(control: Control, value: unknown): boolean {
  if (control.kind === "slider") return round(Number(value)) === round(control.value)
  return value === control.value
}

function cssFor(control: Control, value: unknown): Record<string, string> {
  if (control.kind === "toggle") return control.css(Boolean(value))
  if (control.kind === "slider") {
    const v = round(Number(value))
    if (control.css) return control.css(v)
    return Object.fromEntries((control.vars ?? []).map((name) => [name, `${v}${control.unit ?? ""}`]))
  }
  const v = String(value)
  if (control.css) return control.css(v)
  return Object.fromEntries((control.vars ?? []).map((name) => [name, v]))
}

type Buckets = Record<Scope, Record<string, string>>

function collect(group: Group, values: Record<string, unknown>, buckets: Buckets) {
  for (const [key, item] of Object.entries(group)) {
    if (key === "_collapsed" || !item || typeof item !== "object") continue
    const value = values?.[key]
    if (isControl(item)) {
      if (value === undefined || isDefault(item, value)) continue
      Object.assign(buckets[item.scope ?? "global"], cssFor(item, value))
    } else {
      collect(item as Group, (value ?? {}) as Record<string, unknown>, buckets)
    }
  }
}

const selectors: Record<Scope, string> = {
  global: ":root,\n[data-theme],\n[data-context]",
  dark: ':root,\n[data-theme="dark"]',
  light: '[data-theme="light"]',
}

// Only what differs from the defaults. Global overrides go on :root and every [data-theme] section, so
// they reach light and dark sections alike; dark and light follow colors.css (dark first, then light).
export function toCss(group: Group, values: Record<string, unknown>): string {
  const buckets: Buckets = { global: {}, dark: {}, light: {} }
  collect(group, values, buckets)
  return (["global", "dark", "light"] as Scope[])
    .flatMap((scope) => {
      const entries = Object.entries(buckets[scope])
      if (!entries.length) return []
      return [`${selectors[scope]} {`, ...entries.map(([k, v]) => `  ${k}: ${v};`), "}"]
    })
    .join("\n")
}
