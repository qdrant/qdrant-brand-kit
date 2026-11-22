// The Color page (/color): the palette (10 steps per color that keep their job in light and dark, built from the
// primitives), one tab per group of Figma's Color collection with its tokens and how to use them, and example
// assets that follow the semantic tokens (Juan, 2026-11-19; the groups as in Figma on 2026-11-21). The tokens
// here are the Color collection of the Figma file "Qdrant Brand Design" (2u6KfDsYjibQuf9ji6lFBR), read on
// 2026-11-21: text, primary, secondary, status, background, border, palette, dataviz and static. Read them again
// from Figma when the file changes. Nothing here is a token in the repo until it moves into primitives/colors
// (colors.tokens.json) with Vanesa's yes.
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
    id: "text",
    label: "Text",
    intro:
      "The text colors, by job: primary for titles and body, secondary for supporting text, disabled for placeholders and inactive text, and on-accent for text on the primary color. They switch with the theme, so the same token reads right in light and in dark.",
  },
  {
    id: "primary",
    label: "Primary",
    intro:
      "Amaranth, the brand's accent. It marks the one action or highlight that matters most. Its solid is amaranth-600 in both themes, so the brand color never changes; its hover, soft fill and text step to fit the theme.",
  },
  {
    id: "secondary",
    label: "Secondary",
    intro:
      "Indigo, the second brand color: secondary marks in brand and marketing work, and the accent in product UI. Its solid is indigo-600 in both themes, with a soft fill and a text color that fit the theme.",
  },
  {
    id: "status",
    label: "Status",
    intro:
      "Four states, each with a text color and a soft fill: success in teal, error in red, warning in orange and info in blue. Use them to say how something went or what needs attention, and nothing else.",
  },
  {
    id: "background",
    label: "Background",
    intro:
      "Four background surfaces for brand and marketing work, named by their job, instead of the 24 numbered paper-elevation levels from MUI. Paper elevation stays in the product, where interfaces stack many layers.",
  },
  {
    id: "border",
    label: "Border",
    intro:
      "Three edges, from quiet to strong: subtle for dividers and card outlines, default for lines people read along, and strong for fields and outline buttons.",
  },
  {
    id: "dataviz",
    label: "Data viz",
    intro:
      "Eight chart colors, used in order: amaranth, indigo, teal, blue, orange, purple, green and cyan. Each one is its family's solid, the 600, and the same in both themes.",
  },
  {
    id: "static",
    label: "Static",
    intro:
      "White and black that never change with the theme, for text and marks on images and art, which look the same in light and in dark.",
  },
  {
    id: "assets",
    label: "Assets",
    intro:
      "Example assets built only from the semantic tokens, shown in light and dark at once. Change what a token points to in the panel and every asset follows, in both themes.",
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

// ---- The four background surfaces (brand and marketing), the background group ----

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

// ---- The semantic tokens: Figma's Color collection, by group ----

// A semantic token points at a primitive in each theme, never at a palette step, so changing the palette never moves
// a token (Juan, 2026-11-19). The same rule holds in Figma, where every variable of the Color collection aliases the
// Primitives library. A token that doesn't change with the theme has the same primitive in both.
export type Mapping = { light: string; dark: string }

// The groups of Figma's Color collection, in its order (the palette group has its own tab). Figma groups the brand
// accents as primary/* and secondary/* (Juan, 2026-11-21).
export const semanticGroups = [
  { id: "text", label: "Text" },
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "status", label: "Status" },
  { id: "background", label: "Background" },
  { id: "border", label: "Border" },
  { id: "dataviz", label: "Data viz" },
  { id: "static", label: "Static" },
] as const

export type GroupId = (typeof semanticGroups)[number]["id"]

export type SemanticToken = {
  id: string
  // The Figma name, group/token.
  name: string
  group: GroupId
  use: string
  default: Mapping
  // The CSS variable Figma's code syntax gives it today. The repo still names the accents --qd-color-accent-*.
  cssVar: string
  // The repo's role today (primitives/colors), light then dark, or null for a token the repo doesn't have.
  now: { role: string; light: string; dark: string } | null
  // For text and icons: the contrast it needs (0 shows it without a target, as for disabled text) and the token
  // it sits on, background/default unless said.
  contrast?: { target: number; on?: string }
}

const pair = (light: string, dark: string = light): Mapping => ({ light, dark })
const css = (name: string) => `--qd-color-${name}`

export const semanticTokens: SemanticToken[] = [
  {
    id: "text-primary",
    name: "text/primary",
    group: "text",
    use: "Titles and body text",
    default: pair("neutral-900", "neutral-50"),
    cssVar: css("text-primary"),
    now: { role: "text.primary", light: "neutral-950", dark: "neutral-50" },
    contrast: { target: 4.5 },
  },
  {
    id: "text-secondary",
    name: "text/secondary",
    group: "text",
    use: "Supporting text, labels, captions",
    default: pair("neutral-600", "neutral-500"),
    cssVar: css("text-secondary"),
    now: { role: "text.secondary", light: "neutral-600", dark: "neutral-500" },
    contrast: { target: 4.5 },
  },
  {
    id: "text-disabled",
    name: "text/disabled",
    group: "text",
    use: "Placeholders and disabled text",
    default: pair("neutral-400", "neutral-600"),
    cssVar: css("text-disabled"),
    now: { role: "text.disabled", light: "neutral-400", dark: "neutral-600" },
    contrast: { target: 0 },
  },
  {
    id: "text-on-accent",
    name: "text/on-accent",
    group: "text",
    use: "Text on primary/primary, like a button label",
    default: pair("neutral-0"),
    cssVar: css("text-on-accent"),
    now: { role: "text.on-accent", light: "neutral-0", dark: "neutral-0" },
    contrast: { target: 4.5, on: "primary-primary" },
  },
  {
    id: "primary-primary",
    name: "primary/primary",
    group: "primary",
    use: "Buttons and the one strong mark",
    default: pair("amaranth-600"),
    cssVar: css("accent-primary"),
    now: { role: "accent.primary", light: "amaranth-600", dark: "amaranth-600" },
  },
  {
    id: "primary-hover",
    name: "primary/hover",
    group: "primary",
    use: "The primary button on hover",
    default: pair("amaranth-700", "amaranth-500"),
    cssVar: css("accent-primary-hover"),
    now: { role: "accent.primary-hover", light: "amaranth-700", dark: "amaranth-700" },
  },
  {
    id: "primary-subtle",
    name: "primary/subtle",
    group: "primary",
    use: "Soft fills: kickers, chips, highlights",
    default: pair("amaranth-100", "amaranth-950"),
    cssVar: css("accent-subtle"),
    now: null,
  },
  {
    id: "primary-text",
    name: "primary/text",
    group: "primary",
    use: "Colored text, links and icons",
    default: pair("amaranth-800", "amaranth-400"),
    cssVar: css("accent-text"),
    now: null,
    contrast: { target: 4.5 },
  },
  {
    id: "secondary-secondary",
    name: "secondary/secondary",
    group: "secondary",
    use: "Secondary marks, and the accent in product UI",
    default: pair("indigo-600"),
    cssVar: css("accent-secondary"),
    now: { role: "accent.secondary", light: "indigo-600", dark: "indigo-600" },
  },
  {
    id: "secondary-subtle",
    name: "secondary/subtle",
    group: "secondary",
    use: "Tags and soft fills",
    default: pair("indigo-100", "indigo-950"),
    cssVar: css("accent-secondary-subtle"),
    now: null,
  },
  {
    id: "secondary-text",
    name: "secondary/text",
    group: "secondary",
    use: "Text and icons on its soft fill",
    default: pair("indigo-800", "indigo-400"),
    cssVar: css("accent-secondary-text"),
    now: null,
    contrast: { target: 4.5, on: "secondary-subtle" },
  },
  ...(
    [
      ["error", "red", "red-500", "red-500"],
      ["warning", "orange", "orange-500", "orange-500"],
      ["info", "blue", "blue-400", "blue-400"],
      ["success", "teal", "teal-600", "teal-600"],
    ] as const
  ).flatMap(([status, family, light, dark]): SemanticToken[] => [
    {
      id: `status-${status}`,
      name: `status/${status}/text`,
      group: "status",
      use: "Text and icons, in badges and alerts",
      default: pair(`${family}-900`, `${family}-200`),
      cssVar: css(`status-${status}`),
      now: { role: `status.${status}`, light, dark },
      contrast: { target: 4.5, on: `status-${status}-alert-fill` },
    },
    {
      id: `status-${status}-subtle`,
      name: `status/${status}/subtle`,
      group: "status",
      use: "Badge fill",
      default: pair(`${family}-100`, `${family}-950`),
      cssVar: css(`status-${status}-subtle`),
      now: null,
    },
    {
      id: `status-${status}-alert-fill`,
      name: `status/${status}/alert-fill`,
      group: "status",
      use: "Alert fill",
      default: pair(`${family}-50`, `${family}-975`),
      cssVar: css(`status-${status}-alert-fill`),
      now: null,
    },
    {
      id: `status-${status}-border`,
      name: `status/${status}/border`,
      group: "status",
      use: "Alert border",
      default: pair(`${family}-200`, `${family}-950`),
      cssVar: css(`status-${status}-border`),
      now: null,
    },
  ]),
  ...surfaces.map(
    (s): SemanticToken => ({
      id: `background-${s.id}`,
      name: s.name,
      group: "background",
      use: s.use,
      default: pair(s.light, s.dark),
      cssVar: css(`background-${s.id}`),
      now: { role: `background.${s.id}`, light: s.light, dark: s.dark },
    })
  ),
  {
    id: "border-subtle",
    name: "border/subtle",
    group: "border",
    use: "Dividers and card outlines",
    default: pair("neutral-200", "neutral-850"),
    cssVar: css("border-subtle"),
    now: null,
  },
  {
    id: "border-default",
    name: "border/default",
    group: "border",
    use: "Lines that need to show: chart gridlines, tables",
    default: pair("neutral-200", "neutral-700"),
    cssVar: css("border-default"),
    now: { role: "border.on-light / on-dark", light: "neutral-200", dark: "neutral-700" },
  },
  {
    id: "border-strong",
    name: "border/strong",
    group: "border",
    use: "Fields and outline buttons, at 3:1",
    default: pair("neutral-500"),
    cssVar: css("border-strong"),
    now: null,
    contrast: { target: 3, on: "background-raised" },
  },
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
      group: "dataviz",
      use: `Chart series ${i + 1}`,
      default: pair(`${family}-600`),
      cssVar: css(`dataviz-${i + 1}`),
      now: { role: `dataviz.${i + 1}`, light: now, dark: now },
    })
  ),
  {
    id: "static-white",
    name: "static/white",
    group: "static",
    use: "White that never changes with the theme: text and logos on photos, art on patterns",
    default: pair("neutral-0"),
    cssVar: css("static-white"),
    now: null,
  },
  {
    id: "static-black",
    name: "static/black",
    group: "static",
    use: "Black that never changes with the theme: scrims on images",
    default: pair("neutral-1000"),
    cssVar: css("static-black"),
    now: null,
  },
]

// How to use each group, shown on its tab like the palette's steps: cards for the tokens or the main rules, then
// notes. From the token descriptions in Figma and the rules in primitives/colors and design-system/DESIGN.md.
export type GroupGuide = {
  cards: { title: string; note: string }[]
  notes: { lead: string; text: string }[]
}

export const groupGuides: Record<GroupId, GroupGuide> = {
  text: {
    cards: [
      { title: "text/primary", note: "Titles and body text, at 4.5:1 or more on every background." },
      { title: "text/secondary", note: "Labels, captions and supporting text. Still 4.5:1, so it's safe for body text that matters less." },
      { title: "text/disabled", note: "Placeholders and disabled controls only. It's under 4.5:1 on purpose: never for text people need to read." },
      { title: "text/on-accent", note: "Text on primary/primary, like a button label. White in both themes." },
    ],
    notes: [
      {
        lead: "Two levels are enough.",
        text: "Most layouts need only primary and secondary. Colored text comes from primary/text, secondary/text or the status colors, never from a palette step picked by eye.",
      },
      {
        lead: "Contrast.",
        text: "WCAG AA: 4.5:1 for body text and 3:1 for text from 24px. Never light gray on medium gray. The table shows each token on background/default, and on-accent on primary/primary.",
      },
    ],
  },
  primary: {
    cards: [
      { title: "primary/primary", note: "Buttons and the one strong mark. Text on it is text/on-accent." },
      { title: "primary/hover", note: "The primary button on hover: darker in light (700), lighter in dark (500)." },
      { title: "primary/subtle", note: "Soft fills: kickers, chips and highlighted areas. Pair it with primary/text." },
      { title: "primary/text", note: "Colored text, links and icons, at 4.5:1 on the backgrounds." },
    ],
    notes: [
      {
        lead: "An accent, not a surface.",
        text: "Use it for buttons, highlights and small marks. Never a flat amaranth fill behind text. Red pattern backgrounds in creatives are the exception (guidelines, section 3).",
      },
      {
        lead: "Marketing's accent.",
        text: "Amaranth is the accent in brand and marketing work and on the web. Product UI uses indigo (Secondary) as its accent instead.",
      },
      {
        lead: "Names.",
        text: "Figma groups the brand accents as primary/* and secondary/* (2026-11-21). The repo's CSS still calls them --qd-color-accent-*, the variables shown in the table, until they're renamed.",
      },
    ],
  },
  secondary: {
    cards: [
      { title: "secondary/secondary", note: "Secondary marks, and the accent in product UI. indigo-600 in both themes." },
      { title: "secondary/subtle", note: "Tags and soft fills. Pair it with secondary/text." },
      { title: "secondary/text", note: "Text and icons on its soft fill, and indigo links, at 4.5:1." },
    ],
    notes: [
      {
        lead: "Next to primary, not instead of it.",
        text: "In brand and marketing work amaranth leads and indigo supports: secondary calls to action, code highlights, secondary marks.",
      },
      {
        lead: "The product's accent.",
        text: "Product UI sets data-context=\"product\" on its root, and its buttons, links and focus take indigo where marketing takes amaranth.",
      },
    ],
  },
  status: {
    cards: [
      { title: "status/<state>/text", note: "Text and icons in badges and alerts: the 900 in light, the 200 in dark, at 7:1 or more on the fills." },
      { title: "status/<state>/subtle", note: "The fill of badges: the 100 in light, the 950 in dark, so a badge shows on a card without a border." },
      { title: "status/<state>/alert-fill and /border", note: "The alert's box: the 50 and the 975, with a border at the 200 and the 950." },
      { title: "Only for status, never color alone", note: "Say how something went or what needs attention, always with an icon or a word. For categories, use the palette or data viz." },
    ],
    notes: [
      {
        lead: "Badges and alerts share the text color.",
        text: "Each state is a group of four tokens. status/<state>/text is the text and icon color of badges and alerts. Badges sit on the subtle fill; alerts on the softer alert fill with a border, which is calmer for a long message. Success is teal, error red, warning orange and info blue.",
      },
      {
        lead: "Alerts.",
        text: "The design system's Alert has a variant per state (destructive for errors), built on these tokens (DESIGN.md, Status alerts). Every pair passes WCAG AAA in both themes, at 8.8:1 or more.",
      },
    ],
  },
  background: {
    cards: surfaces.map((s) => ({ title: s.name, note: `${s.use}.` })),
    notes: [
      {
        lead: "One step per layer.",
        text: "Start every layout on default, then step up one surface for each layer that sits on top. Don't skip straight from default to highlight for a card.",
      },
      {
        lead: "Depth by theme.",
        text: "In dark, each surface is a little lighter than the one below, which is how depth reads on dark backgrounds. In light, raised and overlay are both white, so add a border or shadow to separate them.",
      },
      {
        lead: "Highlight means emphasis.",
        text: "Keep highlight for emphasis, not as a general card color, so it keeps its meaning. Illustrations, gradients and artwork use the palette directly.",
      },
    ],
  },
  border: {
    cards: [
      { title: "border/subtle", note: "Dividers and card outlines: quiet lines that only separate." },
      { title: "border/default", note: "Lines people read along: chart gridlines and tables." },
      { title: "border/strong", note: "Fields and outline buttons, at 3:1 so controls are easy to find." },
    ],
    notes: [
      {
        lead: "Pick the edge by its job.",
        text: "Subtle for anything that only separates, default where the line carries information, strong for controls.",
      },
      {
        lead: "In the design system.",
        text: "The web components use their own edges (DESIGN.md, Soft edges and Control edge): the text color at 9% on dark and 10% on light, and neutral-800 or neutral-300 for controls.",
      },
    ],
  },
  dataviz: {
    cards: [
      { title: "In order", note: "Series 1 is amaranth, 2 indigo, 3 teal, and so on. Keep the order, so charts look alike everywhere." },
      { title: "Never color alone", note: "Label the series, or use shape and position too, so a chart reads without color." },
      { title: "Marks, not text", note: "For bars, lines and points. Labels and values stay text/primary or text/secondary." },
    ],
    notes: [
      {
        lead: "Tints of a series.",
        text: "For a highlighted bar, a range or a soft area, use the same family's palette steps (Palette), so the series keeps its color.",
      },
    ],
  },
  static: {
    cards: [
      { title: "static/white", note: "Text and logos on photos, and art on patterns." },
      { title: "static/black", note: "Scrims on images, under static/white text." },
    ],
    notes: [
      {
        lead: "Only on images and art.",
        text: "On the page's own backgrounds use the text and background tokens, which switch with the theme. A static color on a themed surface disappears in one of the themes.",
      },
    ],
  },
}

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
