// The palette collection of the Figma file "Qdrant Brand Design System" as it is today (8y0svqBDPZX6caRNF6lddG, branch
// HSbZu3uvUmelRMapOuZA4c), read on 2026-11-19: 99 variables in two modes, Light and Dark, in the file's order.
// It's the MUI theme object (each variable "reflects" a theme value), which Qdrant Cloud uses. Read it again
// from Figma when the file changes; never edit the values here by hand.
//
// A value is a primitive ("neutral-900"), a primitive at an opacity ("neutral-900@4" is 4%), or a hex value
// for the paper-elevation steps that aren't on the ramp.

export type FigmaValue = string

export type FigmaToken = { name: string; light: FigmaValue; dark: FigmaValue }

const states = (prefix: string, light: string, dark: string, names: [string, number, number][]) =>
  names.map(([state, l, d]): FigmaToken => ({
    name: `${prefix}/_states/${state}`,
    light: `${light}@${l}`,
    dark: `${dark}@${d}`,
  }))

const colorStates: [string, number, number][] = [
  ["hover", 4, 8],
  ["selected", 8, 16],
  ["focusVisible", 30, 30],
  ["outlinedBorder", 50, 50],
]

const t = (name: string, light: string, dark: string): FigmaToken => ({ name, light, dark })

const paperDark = [
  "neutral-950",
  "neutral-925",
  "neutral-900",
  "#171E29",
  "#19212C",
  "#1B232F",
  "#1C2531",
  "#1E2734",
  "neutral-850",
  "#202936",
  "#212B38",
  "#222C39",
  "#232D3A",
  "#242E3B",
  "#262E3C",
  "#272F3D",
  "#27303E",
  "#28313F",
  "#29313F",
  "#2A3240",
  "#2A3341",
  "#2B3341",
  "#2B3442",
  "#2C3442",
  "neutral-800",
]

export const paperElevation = paperDark.map((dark, i) =>
  t(`background/paper-elevation-${i}`, i === 0 ? "neutral-25" : "neutral-0", dark)
)

export const figmaTokens: FigmaToken[] = [
  t("text/primary", "neutral-900", "neutral-0"),
  t("text/secondary", "neutral-700", "neutral-400"),
  t("text/disabled", "neutral-400", "neutral-700"),
  ...states("text", "neutral-900", "neutral-50", [
    ["hover", 4, 8],
    ["selected", 8, 16],
    ["focus", 12, 12],
    ["focusVisible", 30, 30],
  ]),
  t("primary/primary/main", "amaranth-500", "amaranth-500"),
  t("primary/primary/dark", "amaranth-600", "amaranth-600"),
  t("primary/primary/light", "amaranth-400", "amaranth-400"),
  t("primary/primary/contrastText", "neutral-0", "neutral-0"),
  t("primary/primary/contrast", "neutral-0", "neutral-0"),
  ...states("primary/primary", "amaranth-500", "amaranth-500", [
    ["hover", 4, 8],
    ["selected", 8, 16],
    ["focus", 12, 12],
    ["focusVisible", 30, 30],
    ["outlinedBorder", 50, 50],
  ]),
  t("secondary/main", "indigo-500", "indigo-300"),
  t("secondary/dark", "indigo-600", "indigo-500"),
  t("secondary/light", "indigo-400", "indigo-200"),
  t("secondary/contrast", "neutral-0", "neutral-900"),
  t("secondary/contrastText", "neutral-0", "neutral-900"),
  ...states("secondary", "indigo-500", "indigo-300", [
    ["hover", 4, 8],
    ["selected", 8, 16],
    ["focus", 12, 12],
    ["focusVisible", 30, 30],
    ["outlinedBorder", 50, 50],
  ]),
  t("action/active", "neutral-950@56", "neutral-0@56"),
  t("action/hover", "neutral-950@4", "neutral-0@8"),
  t("action/selected", "neutral-950@8", "neutral-0@16"),
  t("action/focus", "neutral-950@12", "neutral-0@12"),
  t("action/disabled", "neutral-950@38", "neutral-0@38"),
  t("action/disabledBackground", "neutral-950@12", "neutral-0@12"),
  t("error/main", "red-700", "red-500"),
  t("error/dark", "red-800", "red-700"),
  t("error/light", "red-400", "red-300"),
  t("error/contrast", "neutral-0", "neutral-0"),
  t("error/contrastText", "neutral-0", "neutral-0"),
  ...states("error", "red-700", "red-500", colorStates),
  t("warning/main", "orange-800", "orange-400"),
  t("warning/dark", "orange-900", "orange-700"),
  t("warning/light", "orange-500", "orange-300"),
  t("warning/contrast", "neutral-0", "neutral-900"),
  t("warning/contrastText", "neutral-0", "neutral-900"),
  ...states("warning", "orange-800", "orange-400", colorStates),
  t("info/main", "blue-700", "blue-400"),
  t("info/dark", "blue-900", "blue-700"),
  t("info/light", "blue-500", "blue-300"),
  t("info/contrast", "neutral-0", "neutral-900"),
  t("info/contrastText", "neutral-0", "neutral-900"),
  ...states("info", "blue-700", "blue-400", colorStates),
  t("success/main", "teal-600", "teal-400"),
  t("success/dark", "teal-900", "teal-700"),
  t("success/light", "teal-500", "teal-300"),
  t("success/contrastText", "neutral-0", "neutral-900"),
  t("success/contrast", "neutral-0", "neutral-900"),
  ...states("success", "teal-800", "teal-400", colorStates),
  t("background/default", "neutral-25", "neutral-950"),
  ...paperElevation,
  t("divider", "neutral-1000@12", "neutral-0@12"),
  t("background/raised", "neutral-0", "neutral-925"),
  t("background/overlay", "neutral-0", "neutral-850"),
  t("background/highlight", "neutral-50", "neutral-800"),
]

// The groups, by the first part of the name, in the file's order.
export const figmaGroups = [...new Set(figmaTokens.map((p) => p.name.split("/")[0]))]

// The repo's role (primitives/colors) for the palette variables that have one, light then dark.
export const repoRoleOf: Record<string, [string, string]> = {
  "text/primary": ["text-primary", "text-primary"],
  "text/secondary": ["text-secondary", "text-secondary"],
  "text/disabled": ["text-disabled", "text-disabled"],
  "primary/primary/main": ["accent-primary", "accent-primary"],
  "primary/primary/dark": ["accent-primary-hover", "accent-primary-hover"],
  "primary/primary/contrastText": ["text-on-accent", "text-on-accent"],
  "secondary/main": ["accent-secondary", "accent-secondary"],
  "error/main": ["status-error", "status-error"],
  "warning/main": ["status-warning", "status-warning"],
  "info/main": ["status-info", "status-info"],
  "success/main": ["status-success", "status-success"],
  "background/default": ["background-default", "background-default"],
  "background/raised": ["background-raised", "background-raised"],
  "background/overlay": ["background-overlay", "background-overlay"],
  "background/highlight": ["background-highlight", "background-highlight"],
  divider: ["border-on-light", "border-on-dark"],
}

// A palette value as CSS: a primitive's variable, at its opacity with color-mix(), or the hex value Figma has.
export function figmaValueCss(value: FigmaValue) {
  if (value.startsWith("#")) return value
  const [name, opacity] = value.split("@")
  const v = `var(--qd-color-${name})`
  return opacity ? `color-mix(in oklab, ${v} ${opacity}%, transparent)` : v
}
