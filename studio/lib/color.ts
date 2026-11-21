// The Color page (/color): the palette (10 steps per color that keep their job in light and dark, built from the
// primitives), the four background surfaces, a semantic layer to try on example assets, and Figma's palette
// collection as it is today (Juan, 2026-11-19). The palette and the semantic layer are proposals to work on, not
// decisions: nothing here is a token until it moves into primitives/colors (colors.tokens.json, then the Figma
// file) with Vanesa's yes. In Figma they become one collection, Color, with the palette as one of its groups.
//
// No file access here, so client components can use it too. The primitives' hex values come from
// lib/color-primitives.ts (server) and are passed down.

export const colorTabs = [
  {
    id: "palette",
    label: "Palette",
    intro:
      "The brand's colors as a rich palette that works in light and dark: every color in 10 steps that keep their job in both themes, like Geist's colors. Step 2 is a soft background in light and in dark: very light in one, very dark in the other. Use the step for the job, and the asset switches theme by itself.",
  },
  {
    id: "surfaces",
    label: "Surfaces",
    intro:
      "Four background surfaces for brand and marketing work, named by their job, instead of the 24 numbered paper-elevation levels from MUI. Paper elevation stays in the product, where interfaces stack many layers.",
  },
  {
    id: "assets",
    label: "Assets",
    intro:
      "Example assets built only from the semantic tokens, shown in light and dark at once. Change what a token points to in the panel and every asset follows, in both themes.",
  },
  {
    id: "figma",
    label: "Figma today",
    intro:
      "The palette collection of the Qdrant Brand Design System file in Figma as it is today, in its Light and Dark modes, next to the repo's roles. It's the MUI theme the product uses, so some values differ from the brand roles. It becomes the Color collection, with the palette as one of its groups. Below it, the primitives every value comes from.",
  },
] as const

export type ColorTab = (typeof colorTabs)[number]["id"]

// The primitives, by name ("red-600"), to their hex value.
export type Primitives = Record<string, string>

export const families = [
  { id: "neutral", label: "Neutral", use: "Backgrounds, surfaces, text and borders" },
  { id: "amaranth", label: "Amaranth", use: "Brand identity: calls to action, highlights, the logo" },
  { id: "indigo", label: "Indigo", use: "Brand action and accent, and product" },
  { id: "red", label: "Red", use: "Error and destructive" },
  { id: "orange", label: "Orange", use: "Warning" },
  { id: "green", label: "Green", use: "Charts" },
  { id: "teal", label: "Teal", use: "Success" },
  { id: "cyan", label: "Cyan", use: "Charts" },
  { id: "blue", label: "Blue", use: "Info" },
  { id: "purple", label: "Purple", use: "Charts" },
  { id: "pink", label: "Pink", use: "Expressive only" },
] as const

export type FamilyId = (typeof families)[number]["id"]

// What each step is for, the same in every scale and in both themes (Geist's ten jobs).
export const steps = [
  { step: 1, job: "Background", group: "Backgrounds" },
  { step: 2, job: "Hover background", group: "Backgrounds" },
  { step: 3, job: "Active background", group: "Backgrounds" },
  { step: 4, job: "Border", group: "Borders" },
  { step: 5, job: "Hover border", group: "Borders" },
  { step: 6, job: "Active border", group: "Borders" },
  { step: 7, job: "Solid", group: "Solids" },
  { step: 8, job: "Hover solid", group: "Solids" },
  { step: 9, job: "Secondary text and icons", group: "Text" },
  { step: 10, job: "Primary text and icons", group: "Text" },
] as const

export const stepGroups = [
  { group: "Backgrounds", range: "1–3", note: "Fills for components: tags, chips, alerts, selected rows. In dark, 2 and 3 are both the 950." },
  { group: "Borders", range: "4–6", note: "Edges and dividers, and their hover and active states." },
  { group: "Solids", range: "7–8", note: "Strong fills: buttons, badges, bars in a chart." },
  { group: "Text", range: "9–10", note: "Colored text and icons, at 4.5:1 or more on the backgrounds." },
] as const

// Every palette step is a primitive. A ramp has six tints lighter than its 600 but only four shades darker, so each
// color got a 975 for dark backgrounds, like neutral-975 (Juan, 2026-11-19), and its 950 covers two steps.

// Colors. Light runs down the ramp from 50 to 950, skipping 900. Dark runs back up: 975, then 950 for the soft and
// active backgrounds, then 900 to 400, and 200 for text. Step 10 in dark was 100 until 2026-11-19; 200 is a trial, to keep the light
// tints that art on dark backgrounds uses. Step 7 is the same in both, so the brand colors never change.
function colorScale(f: string): Record<"light" | "dark", string[]> {
  return {
    light: [50, 100, 200, 300, 400, 500, 600, 700, 800, 950].map((s) => `${f}-${s}`),
    dark: [975, 950, 950, 900, 800, 700, 600, 500, 400, 200].map((s) => `${f}-${s}`),
  }
}

// Neutral is the ramp from 50 to 900, and the same in reverse in dark.
const neutralScale: Record<"light" | "dark", string[]> = {
  light: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => `neutral-${s}`),
  dark: [900, 850, 800, 700, 600, 500, 400, 300, 200, 50].map((s) => `neutral-${s}`),
}

// Each family's ten steps, by theme, as primitive names ("indigo-975").
export const scales: Record<FamilyId, Record<"light" | "dark", string[]>> = Object.fromEntries(
  families.map(({ id }) => [id, id === "neutral" ? neutralScale : colorScale(id)])
) as Record<FamilyId, Record<"light" | "dark", string[]>>

// The CSS name of a step, --qd-palette-red-2 (palette/red/2 in Figma), so it never reads as a primitive (red-200).
export const paletteVar = (family: FamilyId, step: number) => `--qd-palette-${family}-${step}`

// The palette steps as CSS variables: dark on :root and [data-theme="dark"], light on [data-theme="light"], so
// they flip with the theme of the closest section.
export function paletteCss() {
  const block = (mode: "light" | "dark") =>
    families
      .flatMap(({ id }) => scales[id][mode].map((p, i) => `  ${paletteVar(id, i + 1)}: var(--qd-color-${p});`))
      .join("\n")
  return `:root,\n[data-theme="dark"] {\n${block("dark")}\n}\n[data-theme="light"] {\n${block("light")}\n}`
}

// A step's hex value in one theme.
export function stepHex(family: FamilyId, step: number, mode: "light" | "dark", primitives: Primitives) {
  return primitives[scales[family][mode][step - 1]] ?? "#000000"
}

// ---- WCAG contrast ----

function channel(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function rgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
}

export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map(channel)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

// Text on a solid (step 7): white when it reaches 4.5:1 in both themes, otherwise the darkest neutral.
export function onSolid(family: FamilyId, primitives: Primitives) {
  const solids = (["light", "dark"] as const).map((m) => stepHex(family, 7, m, primitives))
  return solids.every((hex) => contrast(hex, primitives["neutral-0"]) >= 4.5) ? "neutral-0" : "neutral-950"
}

// ---- The four background surfaces (brand and marketing), from the Figma palette ----

export const surfaces = [
  {
    id: "default",
    name: "background/default",
    use: "The base of the page, slide or post",
    light: "neutral-25",
    dark: "neutral-950",
  },
  {
    id: "raised",
    name: "background/raised",
    use: "Cards, panels and content blocks that sit on the base",
    light: "neutral-0",
    dark: "neutral-925",
  },
  {
    id: "overlay",
    name: "background/overlay",
    use: "Elements that float above everything else: menus, popovers, modals, tooltips",
    light: "neutral-0",
    dark: "neutral-850",
  },
  {
    id: "highlight",
    name: "background/highlight",
    use: "Selected states, chips, and areas you want to draw attention to",
    light: "neutral-50",
    dark: "neutral-800",
  },
] as const

// ---- The semantic layer to try on the assets ----

// A semantic token points at a primitive in each theme, never at a palette step, so changing the palette never moves
// a token (Juan, 2026-11-19). The same rule holds in Figma, where every variable of the Color collection aliases the
// Primitives library. A token that doesn't change with the theme has the same primitive in both.
export type Mapping = { light: string; dark: string }

export type SemanticToken = {
  id: string
  name: string
  group: string
  use: string
  default: Mapping
  // The repo's role today (primitives/colors), light then dark, or null for a token the repo doesn't have.
  now: { role: string; light: string; dark: string } | null
  // For text and icons: the contrast it needs (0 shows it without a target, as for disabled text) and the token
  // it sits on, background/default unless said.
  contrast?: { target: number; on?: string }
}

const pair = (light: string, dark: string = light): Mapping => ({ light, dark })

export const semanticGroups = [
  "Surfaces",
  "Text",
  "Borders",
  "Brand accent",
  "Secondary accent",
  "Status",
  "Data visualization",
  "Static",
] as const

export const semanticTokens: SemanticToken[] = [
  ...surfaces.map(
    (s): SemanticToken => ({
      id: `background-${s.id}`,
      name: s.name,
      group: "Surfaces",
      use: s.use,
      default: pair(s.light, s.dark),
      now: { role: `background.${s.id}`, light: s.light, dark: s.dark },
    })
  ),
  {
    id: "text-primary",
    name: "text/primary",
    group: "Text",
    use: "Titles and body text",
    default: pair("neutral-900", "neutral-50"),
    now: { role: "text.primary", light: "neutral-950", dark: "neutral-50" },
    contrast: { target: 4.5 },
  },
  {
    id: "text-secondary",
    name: "text/secondary",
    group: "Text",
    use: "Supporting text, labels, captions",
    default: pair("neutral-600", "neutral-500"),
    now: { role: "text.secondary", light: "neutral-600", dark: "neutral-500" },
    contrast: { target: 4.5 },
  },
  {
    id: "text-disabled",
    name: "text/disabled",
    group: "Text",
    use: "Placeholders and disabled text",
    default: pair("neutral-400", "neutral-600"),
    now: { role: "text.disabled", light: "neutral-400", dark: "neutral-600" },
    contrast: { target: 0 },
  },
  {
    id: "border-subtle",
    name: "border/subtle",
    group: "Borders",
    use: "Dividers and card outlines, as light as Figma's divider today",
    default: pair("neutral-200", "neutral-850"),
    now: null,
  },
  {
    id: "border-default",
    name: "border/default",
    group: "Borders",
    use: "Lines that need to show: chart gridlines, tables",
    default: pair("neutral-200", "neutral-700"),
    now: { role: "border.on-light / on-dark", light: "neutral-200", dark: "neutral-700" },
  },
  {
    id: "border-strong",
    name: "border/strong",
    group: "Borders",
    use: "Fields and outline buttons, at 3:1",
    default: pair("neutral-500"),
    now: null,
    contrast: { target: 3, on: "background-raised" },
  },
  {
    id: "accent-primary",
    name: "accent/primary",
    group: "Brand accent",
    use: "Buttons and the one strong mark",
    default: pair("amaranth-600"),
    now: { role: "accent.primary", light: "amaranth-600", dark: "amaranth-600" },
  },
  {
    id: "accent-primary-hover",
    name: "accent/primary-hover",
    group: "Brand accent",
    use: "The primary button on hover",
    default: pair("amaranth-700", "amaranth-500"),
    now: { role: "accent.primary-hover", light: "amaranth-700", dark: "amaranth-700" },
  },
  {
    id: "accent-subtle",
    name: "accent/subtle",
    group: "Brand accent",
    use: "Soft fills: kickers, chips, highlights",
    default: pair("amaranth-100", "amaranth-950"),
    now: null,
  },
  {
    id: "accent-text",
    name: "accent/text",
    group: "Brand accent",
    use: "Colored text, links and icons",
    default: pair("amaranth-800", "amaranth-400"),
    now: null,
    contrast: { target: 4.5 },
  },
  {
    id: "text-on-accent",
    name: "text/on-accent",
    group: "Brand accent",
    use: "Text on accent/primary",
    default: pair("neutral-0"),
    now: { role: "text.on-accent", light: "neutral-0", dark: "neutral-0" },
    contrast: { target: 4.5, on: "accent-primary" },
  },
  {
    id: "accent-secondary",
    name: "accent/secondary",
    group: "Secondary accent",
    use: "Secondary marks and product",
    default: pair("indigo-600"),
    now: { role: "accent.secondary", light: "indigo-600", dark: "indigo-600" },
  },
  {
    id: "accent-secondary-subtle",
    name: "accent/secondary-subtle",
    group: "Secondary accent",
    use: "Tags and soft fills",
    default: pair("indigo-100", "indigo-950"),
    now: null,
  },
  {
    id: "accent-secondary-text",
    name: "accent/secondary-text",
    group: "Secondary accent",
    use: "Text and icons on its soft fill",
    default: pair("indigo-800", "indigo-400"),
    now: null,
    contrast: { target: 4.5, on: "accent-secondary-subtle" },
  },
  ...(
    [
      ["success", "teal", "teal-600", "teal-600"],
      ["error", "red", "red-500", "red-500"],
      ["warning", "orange", "orange-500", "orange-500"],
      ["info", "blue", "blue-400", "blue-400"],
    ] as const
  ).flatMap(([status, family, light, dark]): SemanticToken[] => [
    {
      id: `status-${status}`,
      name: `status/${status}`,
      group: "Status",
      use: "Text and icons",
      default: pair(`${family}-800`, `${family}-400`),
      now: { role: `status.${status}`, light, dark },
      contrast: { target: 4.5, on: `status-${status}-subtle` },
    },
    {
      id: `status-${status}-subtle`,
      name: `status/${status}-subtle`,
      group: "Status",
      use: "Badge and alert fill",
      default: pair(`${family}-100`, `${family}-950`),
      now: null,
    },
  ]),
  ...(
    [
      ["amaranth", "amaranth-600"],
      ["indigo", "indigo-600"],
      ["teal", "teal-600"],
      ["blue", "blue-400"],
      ["orange", "orange-500"],
      ["purple", "purple-700"],
      ["green", "green-600"],
      ["cyan", "cyan-500"],
    ] as const
  ).map(
    ([family, now], i): SemanticToken => ({
      id: `dataviz-${i + 1}`,
      name: `dataviz/${i + 1}`,
      group: "Data visualization",
      use: "Chart series, in order",
      default: pair(`${family}-600`),
      now: { role: `dataviz.${i + 1}`, light: now, dark: now },
    })
  ),
  {
    id: "static-white",
    name: "static/white",
    group: "Static",
    use: "White that never changes with the theme: text and logos on photos, art on patterns",
    default: pair("neutral-0"),
    now: null,
  },
  {
    id: "static-black",
    name: "static/black",
    group: "Static",
    use: "Black that never changes with the theme: scrims on images",
    default: pair("neutral-1000"),
    now: null,
  },
]

export const semanticVar = (id: string) => `--sem-${id}`

export function mappingHex(mapping: Mapping, mode: "light" | "dark", primitives: Primitives) {
  return primitives[mapping[mode]] ?? "#000000"
}

export function mappingLabel(mapping: Mapping) {
  return mapping.light === mapping.dark ? mapping.light : `${mapping.light} / ${mapping.dark}`
}

export function sameMapping(a: Mapping, b: Mapping) {
  return a.light === b.light && a.dark === b.dark
}

// A saved change from the panel, if it has the current shape (older versions saved palette steps).
export function isMapping(value: unknown): value is Mapping {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Mapping).light === "string" &&
    typeof (value as Mapping).dark === "string"
  )
}

// The semantic tokens as CSS variables: dark on :root and [data-theme="dark"], light on [data-theme="light"], each
// pointing at a primitive's variable.
export function semanticCss(mappings: Record<string, Mapping>) {
  const block = (mode: "light" | "dark") =>
    semanticTokens
      .map((t) => `  ${semanticVar(t.id)}: var(--qd-color-${(mappings[t.id] ?? t.default)[mode]});`)
      .join("\n")
  return `:root,\n[data-theme="dark"] {\n${block("dark")}\n}\n[data-theme="light"] {\n${block("light")}\n}`
}
